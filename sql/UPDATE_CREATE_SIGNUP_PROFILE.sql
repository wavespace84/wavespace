-- create_signup_profile 함수 업데이트
-- auth_user_id 파라미터를 p_user_id로 변경

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS public.create_signup_profile(UUID, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, TEXT, TEXT, VARCHAR, JSON);

-- 새로운 함수 생성 (파라미터명 변경)
CREATE OR REPLACE FUNCTION public.create_signup_profile(
    p_user_id UUID,  -- auth_user_id에서 변경
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
    IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
        -- 추가 보안 체크: 해당 id가 이미 존재하는지 확인
        IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', '이미 프로필이 존재합니다.'
            );
        END IF;
    END IF;

    -- 중복 체크
    IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
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
        p_user_id,  -- p_auth_user_id에서 변경
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
        p_user_id,  -- p_auth_user_id에서 변경
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
            earned_at
        ) VALUES (
            v_user_id,  -- users 테이블의 id 사용
            (SELECT id FROM public.badges WHERE name = 'Free' LIMIT 1),
            NOW()
        );
    END IF;

    -- 성공 응답
    v_result := jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'profile', jsonb_build_object(
            'id', v_user_id,
            'username', p_username,
            'nickname', COALESCE(p_nickname, p_username),
            'full_name', p_full_name,
            'email', p_email,
            'phone', p_phone,
            'points', 1000,
            'level', 1,
            'role', 'member'
        )
    );

    RETURN v_result;

EXCEPTION 
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '중복된 값이 있습니다.',
            'code', 'UNIQUE_VIOLATION'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'code', 'UNKNOWN_ERROR'
        );
END;
$$;

-- 함수 권한 부여
GRANT EXECUTE ON FUNCTION public.create_signup_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_signup_profile TO anon;