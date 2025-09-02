-- 간단한 프로필 생성 RPC 함수
-- 실제 DB 구조에 맞는 최소한의 프로필 생성

-- 1. 기존 함수 삭제
DROP FUNCTION IF EXISTS public.create_signup_profile(UUID, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, TEXT, TEXT, TEXT, VARCHAR, JSON);

-- 2. 간단한 create_signup_profile 함수 생성
CREATE OR REPLACE FUNCTION public.create_signup_profile(
    p_auth_user_id UUID,
    p_username VARCHAR,
    p_nickname VARCHAR DEFAULT NULL,
    p_full_name TEXT DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_phone VARCHAR DEFAULT NULL,
    p_member_type VARCHAR DEFAULT 'general',
    p_postal_code VARCHAR DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_detail_address TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_kakao_id VARCHAR DEFAULT NULL,
    p_additional_info JSON DEFAULT NULL
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
    IF EXISTS (SELECT 1 FROM public.users WHERE id = p_auth_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '이미 프로필이 존재합니다.',
            'code', 'PROFILE_EXISTS'
        );
    END IF;

    -- 기본 프로필 삽입 (최소한의 컬럼만 사용)
    INSERT INTO public.users (
        id,
        username,
        nickname,
        full_name,
        email,
        phone,
        role,
        points,
        level,
        created_at,
        updated_at
    ) VALUES (
        p_auth_user_id,
        COALESCE(p_username, split_part(p_email, '@', 1)),
        COALESCE(p_nickname, p_username),
        COALESCE(p_full_name, p_username),
        COALESCE(p_email, ''),
        p_phone,
        'member',
        1000,
        1,
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
    -- 에러 처리
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'code', 'DATABASE_ERROR',
        'detail', SQLSTATE
    );
END;
$$;

-- 3. 함수에 대한 권한 부여
GRANT EXECUTE ON FUNCTION public.create_signup_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_signup_profile TO anon;

-- 4. 함수 설명 추가
COMMENT ON FUNCTION public.create_signup_profile IS '간단한 회원가입 프로필 생성 함수';

-- 5. 기존 auth 사용자 동기화 함수 (간단한 버전)
CREATE OR REPLACE FUNCTION public.sync_existing_auth_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
    v_auth_user RECORD;
BEGIN
    -- auth.users에는 있지만 public.users에 없는 사용자 찾기
    FOR v_auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.users u ON au.id = u.id
        WHERE u.id IS NULL
    LOOP
        -- 메타데이터에서 정보 추출하여 삽입
        INSERT INTO public.users (
            id,
            username,
            nickname,
            full_name,
            email,
            phone,
            role,
            points,
            level,
            created_at,
            updated_at
        ) VALUES (
            v_auth_user.id,
            COALESCE(v_auth_user.raw_user_meta_data->>'username', split_part(v_auth_user.email, '@', 1)),
            COALESCE(v_auth_user.raw_user_meta_data->>'nickname', v_auth_user.raw_user_meta_data->>'username', split_part(v_auth_user.email, '@', 1)),
            COALESCE(v_auth_user.raw_user_meta_data->>'full_name', '사용자'),
            COALESCE(v_auth_user.raw_user_meta_data->>'actual_email', v_auth_user.email),
            v_auth_user.raw_user_meta_data->>'phone',
            'member',
            1000,
            1,
            NOW(),
            NOW()
        );
        
        v_count := v_count + 1;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'synced_count', v_count,
        'message', v_count || '명의 사용자 프로필이 동기화되었습니다.'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'synced_count', v_count
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_existing_auth_users TO authenticated;
COMMENT ON FUNCTION public.sync_existing_auth_users IS 'auth.users의 사용자들을 public.users와 동기화';