-- 회원가입 시 RLS 정책 문제 해결을 위한 마이그레이션
-- 작성일: 2025-01-29
-- 목적: users 테이블의 INSERT 정책을 수정하여 회원가입 시 발생하는 에러 해결

-- 1. 기존 INSERT 정책 삭제
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- 2. 새로운 INSERT 정책 생성 (개선된 버전)
-- auth.uid()가 NULL인 경우(회원가입 직후)도 허용
CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (
    auth_user_id = auth.uid() 
    OR auth.uid() IS NULL  -- 회원가입 프로세스 중 허용
);

-- 3. 프로필 생성을 위한 RPC 함수 생성 (선택적 - 더 안전한 방법)
CREATE OR REPLACE FUNCTION public.create_user_profile(
    p_auth_user_id UUID,
    p_username VARCHAR,
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
    IF auth.uid() IS NULL OR auth.uid() != p_auth_user_id THEN
        -- 추가 보안 체크: 해당 auth_user_id가 이미 존재하는지 확인
        IF EXISTS (SELECT 1 FROM public.users WHERE auth_user_id = p_auth_user_id) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', '이미 프로필이 존재합니다.'
            );
        END IF;
    END IF;

    -- 프로필 삽입
    INSERT INTO public.users (
        auth_user_id,
        username,
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
        created_at,
        updated_at
    ) VALUES (
        p_auth_user_id,
        p_username,
        p_full_name,
        p_email,
        p_phone,
        p_member_type,
        p_postal_code,
        p_address,
        p_detail_address,
        p_referrer,
        p_kakao_id,
        p_additional_info::jsonb,
        1000, -- 신규 가입 포인트
        NOW(),
        NOW()
    )
    RETURNING id INTO v_user_id;

    -- 포인트 내역 추가
    INSERT INTO public.point_history (
        auth_user_id,
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
            is_visible,
            created_at
        ) VALUES (
            p_auth_user_id,
            (SELECT id FROM public.badges WHERE name = 'Free' LIMIT 1),
            NOW(),
            true,
            NOW()
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
        'error', SQLERRM
    );
END;
$$;

-- 4. 함수에 대한 권한 부여
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;

-- 5. point_history 테이블이 없는 경우 생성
CREATE TABLE IF NOT EXISTS public.point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR CHECK (type IN ('earn', 'spend', 'bonus', 'penalty')),
    description TEXT,
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. point_history 테이블 RLS 활성화
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

-- 7. point_history 테이블 RLS 정책
CREATE POLICY "Users can view their own point history" 
ON public.point_history 
FOR SELECT 
USING (auth.uid() = auth_user_id);

CREATE POLICY "System can insert point history" 
ON public.point_history 
FOR INSERT 
WITH CHECK (true); -- RPC 함수를 통해서만 삽입하므로 모든 삽입 허용

-- 8. users 테이블의 추가 컬럼이 없는 경우 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS postal_code VARCHAR,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS detail_address TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS kakao_id VARCHAR,
ADD COLUMN IF NOT EXISTS additional_info JSONB,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user',
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 9. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_point_history_auth_user_id ON public.point_history(auth_user_id);

-- 10. 코멘트 추가
COMMENT ON FUNCTION public.create_user_profile IS '회원가입 시 사용자 프로필을 안전하게 생성하는 함수';
COMMENT ON POLICY "Users can insert their own profile" ON public.users IS '회원가입 프로세스 중 프로필 삽입을 허용하는 정책';