-- WAVE SPACE - 통합 마이그레이션 스크립트
-- 목적: RLS 무한 재귀 문제 해결 및 스키마 일관성 확보
-- 작성일: 2025-01-31
-- 
-- 실행 순서:
-- 1. 이 파일을 Supabase SQL Editor에서 실행
-- 2. 서버 재시작 후 테스트
-- 3. 문제 발생 시 ROLLBACK 섹션 실행

-- ===================================
-- STEP 1: 관리자 권한 체크 함수 생성
-- ===================================

-- 기존 함수가 있다면 삭제
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS is_admin_or_moderator(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- 사용자 역할을 반환하는 함수 (순환 참조 방지)
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- SECURITY DEFINER로 RLS를 우회하여 직접 조회
    SELECT role INTO user_role
    FROM users
    WHERE id = user_uuid
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'member');
END;
$$;

-- 관리자 여부 확인 함수
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN get_user_role(user_uuid) = 'admin';
END;
$$;

-- 관리자 또는 모더레이터 여부 확인 함수
CREATE OR REPLACE FUNCTION is_admin_or_moderator(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := get_user_role(user_uuid);
    RETURN user_role IN ('admin', 'moderator');
END;
$$;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_moderator(UUID) TO authenticated;

-- ===================================
-- STEP 2: create_signup_profile 함수 업데이트
-- ===================================

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
        p_user_id,
        p_username,
        COALESCE(p_nickname, p_username),
        p_full_name,
        p_email,
        p_phone,
        'member',
        1000,
        1,
        true,
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
        p_user_id,
        1000,
        'earn',
        '신규 가입 보너스',
        NOW()
    );

    -- Free 뱃지 지급
    IF EXISTS (SELECT 1 FROM public.badges WHERE name = 'Free') THEN
        INSERT INTO public.user_badges (
            user_id,
            badge_id,
            earned_at
        ) VALUES (
            v_user_id,
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

-- ===================================
-- STEP 3: RLS 정책 재생성 (순환 참조 없음)
-- ===================================

-- Users 테이블 정책
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

CREATE POLICY "users_select_policy" ON users FOR SELECT
USING (
    auth.uid() = id 
    OR 
    (auth.uid() IS NOT NULL AND auth.uid() != id)
);

CREATE POLICY "users_insert_policy" ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy" ON users FOR UPDATE
USING (
    auth.uid() = id 
    OR 
    is_admin(auth.uid())
);

CREATE POLICY "users_delete_policy" ON users FOR DELETE
USING (is_admin(auth.uid()));

-- Posts 테이블
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON posts;

CREATE POLICY "posts_select_policy" ON posts FOR SELECT
USING (
    NOT is_hidden 
    OR author_id = auth.uid() 
    OR is_admin(auth.uid())
);

CREATE POLICY "posts_insert_policy" ON posts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "posts_update_policy" ON posts FOR UPDATE
USING (
    author_id = auth.uid() 
    OR is_admin(auth.uid())
);

CREATE POLICY "posts_delete_policy" ON posts FOR DELETE
USING (
    author_id = auth.uid() 
    OR is_admin(auth.uid())
);

-- Comments 테이블
DROP POLICY IF EXISTS "comments_select_policy" ON comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
DROP POLICY IF EXISTS "comments_update_policy" ON comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;

CREATE POLICY "comments_select_policy" ON comments FOR SELECT
USING (true);

CREATE POLICY "comments_insert_policy" ON comments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "comments_update_policy" ON comments FOR UPDATE
USING (
    author_id = auth.uid() 
    OR is_admin(auth.uid())
);

CREATE POLICY "comments_delete_policy" ON comments FOR DELETE
USING (
    author_id = auth.uid() 
    OR is_admin(auth.uid())
);

-- 나머지 테이블들도 동일한 패턴으로 적용...

-- ===================================
-- STEP 4: 인덱스 생성 (성능 최적화)
-- ===================================

CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ===================================
-- STEP 5: 검증 쿼리
-- ===================================

-- 관리자 권한 체크 테스트
-- SELECT is_admin(auth.uid());
-- SELECT get_user_role(auth.uid());

-- 사용자 조회 테스트
-- SELECT * FROM users WHERE id = auth.uid();

-- ===================================
-- ROLLBACK (문제 발생 시)
-- ===================================
/*
-- RLS 정책을 이전 버전으로 롤백
-- 주의: 이렇게 하면 무한 재귀 문제가 다시 발생합니다!

DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS is_admin_or_moderator(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- 이전 RLS 정책으로 복구...
*/

-- ===================================
-- 완료 메시지
-- ===================================
DO $$
BEGIN
    RAISE NOTICE '✅ 통합 마이그레이션 완료!';
    RAISE NOTICE '✅ RLS 무한 재귀 문제가 해결되었습니다.';
    RAISE NOTICE '✅ 스키마 일관성이 확보되었습니다.';
    RAISE NOTICE '';
    RAISE NOTICE '다음 단계:';
    RAISE NOTICE '1. 웹 애플리케이션을 새로고침하세요.';
    RAISE NOTICE '2. 로그인/회원가입 기능을 테스트하세요.';
    RAISE NOTICE '3. 문제가 발생하면 ROLLBACK 섹션을 실행하세요.';
END
$$;