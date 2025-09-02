-- 실제 DB 구조에 맞는 회원가입 프로필 생성 RPC 함수
-- 기존 users 테이블 구조 기반으로 작성

-- 1. 기존 함수 삭제 (있으면)
DROP FUNCTION IF EXISTS public.create_signup_profile;

-- 2. 실제 DB 구조에 맞는 create_signup_profile 함수 생성
CREATE OR REPLACE FUNCTION public.create_signup_profile(
    p_auth_user_id UUID,
    p_username VARCHAR DEFAULT NULL,
    p_nickname VARCHAR DEFAULT NULL,
    p_full_name TEXT DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_phone VARCHAR DEFAULT NULL,
    p_member_type VARCHAR DEFAULT '일반',
    p_postal_code VARCHAR DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_detail_address TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_kakao_id VARCHAR DEFAULT NULL,
    p_additional_info JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_user_id UUID;
BEGIN
    -- 중복 체크
    IF EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = p_auth_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '이미 프로필이 존재합니다.',
            'code', 'PROFILE_EXISTS'
        );
    END IF;

    -- 실제 users 테이블 구조에 맞게 프로필 삽입
    INSERT INTO public.users (
        auth_user_id,
        username,
        nickname,
        full_name,
        email,
        phone,
        member_type,
        postal_code,
        address,
        detail_address,
        referrer,
        kakao_id,
        additional_info,
        points,
        level,
        role,
        is_premium,
        is_practitioner,
        marketing_consent,
        created_at,
        updated_at
    ) VALUES (
        p_auth_user_id,
        COALESCE(p_username, split_part(COALESCE(p_email, ''), '@', 1), 'user_' || substring(p_auth_user_id::text, 1, 8)),
        COALESCE(p_nickname, p_username, split_part(COALESCE(p_email, ''), '@', 1)),
        COALESCE(p_full_name, p_username, '사용자'),
        COALESCE(p_email, ''),
        p_phone,
        COALESCE(p_member_type, '일반'),
        p_postal_code,
        p_address,
        p_detail_address,
        p_referrer,
        p_kakao_id,
        COALESCE(p_additional_info, '{}'::jsonb),
        1000, -- 신규 가입 포인트
        1,    -- 초기 레벨
        'user', -- 기본 역할
        false, -- 무료회원
        false, -- 실무자 인증 전
        false, -- 마케팅 동의 기본값
        NOW(),
        NOW()
    )
    RETURNING id INTO v_user_id;

    -- 성공 응답
    v_result := jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'message', '프로필이 성공적으로 생성되었습니다.'
    );

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    -- 상세 에러 처리
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'code', 'DATABASE_ERROR',
        'detail', SQLSTATE,
        'hint', 'auth_user_id: ' || COALESCE(p_auth_user_id::text, 'NULL') || ', username: ' || COALESCE(p_username, 'NULL')
    );
END;
$$;

-- 3. 함수에 대한 권한 부여
GRANT EXECUTE ON FUNCTION public.create_signup_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_signup_profile TO anon;

-- 4. 함수 설명 추가
COMMENT ON FUNCTION public.create_signup_profile IS '회원가입 시 사용자 프로필 생성 (실제 DB 구조 기반)';

-- 5. 기존 auth 사용자 동기화 함수 (실제 DB 구조 기반)
CREATE OR REPLACE FUNCTION public.sync_existing_auth_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
    v_error_count INTEGER := 0;
    v_auth_user RECORD;
    v_error_details TEXT := '';
BEGIN
    -- auth.users에는 있지만 public.users에 없는 사용자 찾기
    FOR v_auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.users u ON au.id = u.auth_user_id
        WHERE u.id IS NULL
        ORDER BY au.created_at DESC
        LIMIT 100 -- 한 번에 최대 100명씩 처리
    LOOP
        BEGIN
            -- 메타데이터에서 정보 추출하여 삽입
            INSERT INTO public.users (
                auth_user_id,
                username,
                nickname,
                full_name,
                email,
                phone,
                member_type,
                role,
                points,
                level,
                is_premium,
                is_practitioner,
                marketing_consent,
                created_at,
                updated_at
            ) VALUES (
                v_auth_user.id,
                COALESCE(
                    v_auth_user.raw_user_meta_data->>'username', 
                    split_part(v_auth_user.email, '@', 1),
                    'user_' || substring(v_auth_user.id::text, 1, 8)
                ),
                COALESCE(
                    v_auth_user.raw_user_meta_data->>'nickname',
                    v_auth_user.raw_user_meta_data->>'username', 
                    split_part(v_auth_user.email, '@', 1)
                ),
                COALESCE(
                    v_auth_user.raw_user_meta_data->>'full_name', 
                    v_auth_user.raw_user_meta_data->>'username',
                    '사용자'
                ),
                COALESCE(
                    v_auth_user.raw_user_meta_data->>'actual_email', 
                    v_auth_user.email
                ),
                v_auth_user.raw_user_meta_data->>'phone',
                COALESCE(
                    v_auth_user.raw_user_meta_data->>'member_type', 
                    '일반'
                ),
                'user',
                1000,
                1,
                false,
                false,
                false,
                NOW(),
                NOW()
            );
            
            v_count := v_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            v_error_details := v_error_details || 'User ID: ' || v_auth_user.id || ' Error: ' || SQLERRM || '; ';
            
            -- 에러가 10개 이상이면 중단
            IF v_error_count >= 10 THEN
                EXIT;
            END IF;
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'synced_count', v_count,
        'error_count', v_error_count,
        'message', v_count || '명의 사용자 프로필이 동기화되었습니다.',
        'error_details', CASE WHEN v_error_count > 0 THEN v_error_details ELSE NULL END
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'synced_count', v_count,
        'error_count', v_error_count
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_existing_auth_users TO authenticated;
COMMENT ON FUNCTION public.sync_existing_auth_users IS 'auth.users의 사용자들을 public.users와 동기화 (실제 DB 구조 기반)';

-- 6. 프로필 생성 테스트 함수 (디버깅용)
CREATE OR REPLACE FUNCTION public.test_profile_creation(
    p_auth_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auth_user RECORD;
    v_existing_user RECORD;
    v_result JSONB;
BEGIN
    -- auth.users에서 사용자 정보 조회
    SELECT id, email, raw_user_meta_data 
    INTO v_auth_user
    FROM auth.users 
    WHERE id = p_auth_user_id;
    
    -- public.users에서 기존 프로필 조회
    SELECT id, auth_user_id, username, email
    INTO v_existing_user
    FROM public.users 
    WHERE auth_user_id = p_auth_user_id;
    
    v_result := jsonb_build_object(
        'auth_user_exists', v_auth_user.id IS NOT NULL,
        'auth_user_email', v_auth_user.email,
        'auth_user_metadata', v_auth_user.raw_user_meta_data,
        'profile_exists', v_existing_user.id IS NOT NULL,
        'profile_id', v_existing_user.id,
        'profile_username', v_existing_user.username,
        'can_create_profile', v_auth_user.id IS NOT NULL AND v_existing_user.id IS NULL
    );
    
    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.test_profile_creation TO authenticated;
COMMENT ON FUNCTION public.test_profile_creation IS '프로필 생성 가능 여부 테스트 (디버깅용)';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '🎉 실제 DB 구조에 맞는 RPC 함수 생성 완료!';
    RAISE NOTICE '✅ create_signup_profile 함수 생성됨';
    RAISE NOTICE '✅ sync_existing_auth_users 함수 생성됨';  
    RAISE NOTICE '✅ test_profile_creation 함수 생성됨 (디버깅용)';
END;
$$;