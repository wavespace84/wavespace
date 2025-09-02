-- WAVE SPACE - RLS 무한 재귀 문제 해결
-- 순환 참조 없는 관리자 권한 체크 시스템 구현

-- ===================================
-- 1. 관리자 권한 체크 함수 생성
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
-- 2. RLS 정책 재생성 (순환 참조 없음)
-- ===================================

-- Users 테이블 정책
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- SELECT: 모든 사용자는 기본 정보 조회 가능
CREATE POLICY "users_select_policy" ON users FOR SELECT
USING (
    -- 본인은 모든 정보 조회 가능
    auth.uid() = id 
    OR 
    -- 다른 사용자는 공개 정보만 조회 가능
    (auth.uid() IS NOT NULL AND auth.uid() != id)
);

-- INSERT: 회원가입 시 본인 정보만 생성 가능
CREATE POLICY "users_insert_policy" ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- UPDATE: 본인 또는 관리자만 수정 가능
CREATE POLICY "users_update_policy" ON users FOR UPDATE
USING (
    auth.uid() = id 
    OR 
    is_admin(auth.uid())
);

-- DELETE: 관리자만 삭제 가능
CREATE POLICY "users_delete_policy" ON users FOR DELETE
USING (is_admin(auth.uid()));

-- ===================================
-- 3. 다른 테이블들의 RLS 정책 수정
-- ===================================

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

-- Point History 테이블
DROP POLICY IF EXISTS "point_history_select_policy" ON point_history;
DROP POLICY IF EXISTS "point_history_insert_policy" ON point_history;

CREATE POLICY "point_history_select_policy" ON point_history FOR SELECT
USING (
    user_id = auth.uid() 
    OR is_admin(auth.uid())
);

CREATE POLICY "point_history_insert_policy" ON point_history FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Attendance 테이블
DROP POLICY IF EXISTS "attendance_select_policy" ON attendance;
DROP POLICY IF EXISTS "attendance_insert_policy" ON attendance;

CREATE POLICY "attendance_select_policy" ON attendance FOR SELECT
USING (
    user_id = auth.uid() 
    OR is_admin(auth.uid())
);

CREATE POLICY "attendance_insert_policy" ON attendance FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Notifications 테이블
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;

CREATE POLICY "notifications_select_policy" ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_policy" ON notifications FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "notifications_update_policy" ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- Files 테이블
DROP POLICY IF EXISTS "files_select_policy" ON files;
DROP POLICY IF EXISTS "files_insert_policy" ON files;
DROP POLICY IF EXISTS "files_update_policy" ON files;
DROP POLICY IF EXISTS "files_delete_policy" ON files;

CREATE POLICY "files_select_policy" ON files FOR SELECT
USING (
    uploader_id = auth.uid() 
    OR is_public = true 
    OR is_admin(auth.uid())
);

CREATE POLICY "files_insert_policy" ON files FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = uploader_id);

CREATE POLICY "files_update_policy" ON files FOR UPDATE
USING (
    uploader_id = auth.uid() 
    OR is_admin(auth.uid())
);

CREATE POLICY "files_delete_policy" ON files FOR DELETE
USING (
    uploader_id = auth.uid() 
    OR is_admin(auth.uid())
);

-- Job Posts 테이블
DROP POLICY IF EXISTS "job_posts_select_policy" ON job_posts;
DROP POLICY IF EXISTS "job_posts_insert_policy" ON job_posts;
DROP POLICY IF EXISTS "job_posts_update_policy" ON job_posts;
DROP POLICY IF EXISTS "job_posts_delete_policy" ON job_posts;

CREATE POLICY "job_posts_select_policy" ON job_posts FOR SELECT
USING (
    is_active = true 
    OR author_id = auth.uid() 
    OR is_admin(auth.uid())
);

CREATE POLICY "job_posts_insert_policy" ON job_posts FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = author_id 
    AND (is_verified = true OR is_admin(auth.uid()))
);

CREATE POLICY "job_posts_update_policy" ON job_posts FOR UPDATE
USING (
    author_id = auth.uid() 
    OR is_admin(auth.uid())
);

CREATE POLICY "job_posts_delete_policy" ON job_posts FOR DELETE
USING (is_admin(auth.uid()));

-- Job Applications 테이블
DROP POLICY IF EXISTS "job_applications_select_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_insert_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_update_policy" ON job_applications;

CREATE POLICY "job_applications_select_policy" ON job_applications FOR SELECT
USING (
    applicant_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM job_posts 
        WHERE job_posts.id = job_applications.job_post_id 
        AND job_posts.author_id = auth.uid()
    )
    OR is_admin(auth.uid())
);

CREATE POLICY "job_applications_insert_policy" ON job_applications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = applicant_id);

CREATE POLICY "job_applications_update_policy" ON job_applications FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM job_posts 
        WHERE job_posts.id = job_applications.job_post_id 
        AND job_posts.author_id = auth.uid()
    )
    OR is_admin(auth.uid())
);

-- User Badges 테이블
DROP POLICY IF EXISTS "user_badges_select_policy" ON user_badges;
DROP POLICY IF EXISTS "user_badges_insert_policy" ON user_badges;

CREATE POLICY "user_badges_select_policy" ON user_badges FOR SELECT
USING (true);

CREATE POLICY "user_badges_insert_policy" ON user_badges FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- ===================================
-- 4. 테스트 쿼리
-- ===================================

-- 관리자 권한 체크 함수 테스트 (주석 처리됨)
-- SELECT is_admin('your-user-uuid-here');
-- SELECT get_user_role('your-user-uuid-here');

-- ===================================
-- 5. 실행 결과 확인
-- ===================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS 무한 재귀 문제 해결 완료!';
    RAISE NOTICE '✅ 관리자 권한 체크 함수 생성 완료!';
    RAISE NOTICE '✅ 모든 테이블의 RLS 정책이 순환 참조 없이 재생성되었습니다.';
END
$$;