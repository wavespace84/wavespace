-- 회원가입 프로필 생성 RPC 함수
-- 작성일: 2025-01-30
-- 목적: authService.js에서 호출하는 create_signup_profile 함수 생성

-- 1. create_signup_profile 함수 생성 (authService.js에서 호출하는 함수명)
CREATE OR REPLACE FUNCTION public.create_signup_profile(
    p_auth_user_id UUID,
    p_username VARCHAR,
    p_nickname VARCHAR DEFAULT NULL,
    p_full_name TEXT,
    p_email VARCHAR,
    p_phone VARCHAR DEFAULT NULL,
    p_member_type VARCHAR DEFAULT '일반',
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
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
    v_user_id UUID;
BEGIN
    -- 권한 체크: auth.uid()가 일치하거나 새 회원가입인 경우
    IF auth.uid() IS NOT NULL AND auth.uid() != p_auth_user_id THEN
        -- 추가 보안 체크: 해당 id가 이미 존재하는지 확인
        IF EXISTS (SELECT 1 FROM public.users WHERE id = p_auth_user_id) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', '이미 프로필이 존재합니다.'
            );
        END IF;
    END IF;

    -- 중복 체크
    IF EXISTS (SELECT 1 FROM public.users WHERE id = p_auth_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '이미 프로필이 존재합니다.',
            'code', 'PROFILE_EXISTS'
        );
    END IF;

    -- 프로필 삽입
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
        is_active,
        created_at,
        updated_at
    ) VALUES (
        p_auth_user_id,
        p_username,
        COALESCE(p_nickname, p_username),
        p_full_name,
        p_email,
        p_phone,
        'member', -- 기본 역할 (schema.sql에 맞춤)
        1000, -- 신규 가입 포인트
        1,    -- 초기 레벨
        true, -- 활성 상태
        NOW(),
        NOW()
    )
    RETURNING id INTO v_user_id;

    -- 포인트 내역 추가
    INSERT INTO public.point_history (
        user_id,
        amount,
        type,
        description,
        created_at
    ) VALUES (
        p_auth_user_id,
        1000,
        'earn',
        '신규 가입 보너스',
        NOW()
    );

    -- Free 뱃지 지급 (badges 테이블에 Free 뱃지가 있다고 가정)
    IF EXISTS (SELECT 1 FROM public.badges WHERE name = 'Free') THEN
        INSERT INTO public.user_badges (
            user_id,
            badge_id,
            earned_at,
            is_active
        ) VALUES (
            p_auth_user_id,
            (SELECT id FROM public.badges WHERE name = 'Free' LIMIT 1),
            NOW(),
            true
        );
    END IF;

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
        'code', 'DATABASE_ERROR'
    );
END;
$$;

-- 2. 함수에 대한 권한 부여
GRANT EXECUTE ON FUNCTION public.create_signup_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_signup_profile TO anon;

-- 3. 함수 설명 추가
COMMENT ON FUNCTION public.create_signup_profile IS '회원가입 시 사용자 프로필을 생성하는 함수 (authService.js에서 호출)';

-- 4. user_badges 테이블이 auth_user_id를 사용하도록 수정 (이미 적용되어 있지 않은 경우)
-- auth_user_id 컬럼이 없는 경우 추가
ALTER TABLE public.user_badges 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 기존 user_id 데이터를 auth_user_id로 마이그레이션 (필요한 경우)
-- UPDATE public.user_badges ub
-- SET auth_user_id = u.auth_user_id
-- FROM public.users u
-- WHERE ub.user_id = u.id AND ub.auth_user_id IS NULL;

-- 5. user_badges 테이블 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_badges_auth_user_id ON public.user_badges(auth_user_id);

-- 6. 기존 auth 사용자 동기화 함수 (관리자가 수동으로 실행 가능)
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
        -- 메타데이터에서 정보 추출
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
            is_active,
            created_at,
            updated_at
        ) VALUES (
            v_auth_user.id,
            COALESCE(v_auth_user.raw_user_meta_data->>'username', split_part(v_auth_user.email, '@', 1)),
            COALESCE(v_auth_user.raw_user_meta_data->>'nickname', v_auth_user.raw_user_meta_data->>'username', split_part(v_auth_user.email, '@', 1)),
            COALESCE(v_auth_user.raw_user_meta_data->>'full_name', ''),
            COALESCE(v_auth_user.raw_user_meta_data->>'actual_email', v_auth_user.email),
            v_auth_user.raw_user_meta_data->>'phone',
            'member',
            1000,
            1,
            true,
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
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_existing_auth_users TO authenticated;
COMMENT ON FUNCTION public.sync_existing_auth_users IS 'auth.users에 있지만 public.users에 없는 사용자들의 프로필을 생성하는 동기화 함수';