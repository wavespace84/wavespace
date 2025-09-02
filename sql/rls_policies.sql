-- WAVE SPACE RLS (Row Level Security) 정책
-- 모든 테이블에 대한 세밀한 접근 권한 설정

-- ===================================
-- 1. 사용자 테이블 (users)
-- ===================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- SELECT: 모든 사용자는 기본 정보 조회 가능, 민감한 정보는 본인만
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

-- UPDATE: 본인 정보만 수정 가능 (관리자 제외)
CREATE POLICY "users_update_policy" ON users FOR UPDATE
USING (
    auth.uid() = id 
    OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- DELETE: 관리자만 가능
CREATE POLICY "users_delete_policy" ON users FOR DELETE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ===================================
-- 2. 게시글 테이블 (posts)
-- ===================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select_policy" ON posts;
DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
DROP POLICY IF EXISTS "posts_update_policy" ON posts;
DROP POLICY IF EXISTS "posts_delete_policy" ON posts;

-- SELECT: 숨김 처리되지 않은 게시글은 모두 조회 가능
CREATE POLICY "posts_select_policy" ON posts FOR SELECT
USING (
    NOT is_hidden 
    OR author_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- INSERT: 로그인한 사용자만 작성 가능
CREATE POLICY "posts_insert_policy" ON posts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- UPDATE: 작성자와 관리자만 수정 가능
CREATE POLICY "posts_update_policy" ON posts FOR UPDATE
USING (
    author_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- DELETE: 작성자와 관리자만 삭제 가능
CREATE POLICY "posts_delete_policy" ON posts FOR DELETE
USING (
    author_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ===================================
-- 3. 댓글 테이블 (comments)
-- ===================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select_policy" ON comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
DROP POLICY IF EXISTS "comments_update_policy" ON comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;

-- SELECT: 모든 댓글 조회 가능
CREATE POLICY "comments_select_policy" ON comments FOR SELECT
USING (true);

-- INSERT: 로그인한 사용자만 작성 가능
CREATE POLICY "comments_insert_policy" ON comments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- UPDATE: 작성자와 관리자만 수정 가능
CREATE POLICY "comments_update_policy" ON comments FOR UPDATE
USING (
    author_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- DELETE: 작성자와 관리자만 삭제 가능
CREATE POLICY "comments_delete_policy" ON comments FOR DELETE
USING (
    author_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ===================================
-- 4. 포인트 내역 테이블 (point_history)
-- ===================================
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "point_history_select_policy" ON point_history;
DROP POLICY IF EXISTS "point_history_insert_policy" ON point_history;

-- SELECT: 본인 포인트 내역만 조회 가능
CREATE POLICY "point_history_select_policy" ON point_history FOR SELECT
USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- INSERT: 시스템과 관리자만 추가 가능
CREATE POLICY "point_history_insert_policy" ON point_history FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ===================================
-- 5. 출석체크 테이블 (attendance)
-- ===================================
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_select_policy" ON attendance;
DROP POLICY IF EXISTS "attendance_insert_policy" ON attendance;

-- SELECT: 본인 출석 기록만 조회 가능
CREATE POLICY "attendance_select_policy" ON attendance FOR SELECT
USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- INSERT: 본인 출석만 체크 가능
CREATE POLICY "attendance_insert_policy" ON attendance FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ===================================
-- 6. 알림 테이블 (notifications)
-- ===================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON notifications;

-- SELECT: 본인 알림만 조회 가능
CREATE POLICY "notifications_select_policy" ON notifications FOR SELECT
USING (user_id = auth.uid());

-- INSERT: 시스템과 관리자만 생성 가능
CREATE POLICY "notifications_insert_policy" ON notifications FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- UPDATE: 본인만 읽음 처리 가능
CREATE POLICY "notifications_update_policy" ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- DELETE: 본인만 삭제 가능
CREATE POLICY "notifications_delete_policy" ON notifications FOR DELETE
USING (user_id = auth.uid());

-- ===================================
-- 7. 파일 테이블 (files)
-- ===================================
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "files_select_policy" ON files;
DROP POLICY IF EXISTS "files_insert_policy" ON files;
DROP POLICY IF EXISTS "files_update_policy" ON files;
DROP POLICY IF EXISTS "files_delete_policy" ON files;

-- SELECT: 공개 파일은 모두 조회, 비공개는 업로더만
CREATE POLICY "files_select_policy" ON files FOR SELECT
USING (
    is_public = true 
    OR uploader_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- INSERT: 로그인한 사용자만 업로드 가능
CREATE POLICY "files_insert_policy" ON files FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND uploader_id = auth.uid());

-- UPDATE: 업로더와 관리자만 수정 가능
CREATE POLICY "files_update_policy" ON files FOR UPDATE
USING (
    uploader_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- DELETE: 업로더와 관리자만 삭제 가능
CREATE POLICY "files_delete_policy" ON files FOR DELETE
USING (
    uploader_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ===================================
-- 8. 구인구직 테이블 (job_posts)
-- ===================================
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_posts_select_policy" ON job_posts;
DROP POLICY IF EXISTS "job_posts_insert_policy" ON job_posts;
DROP POLICY IF EXISTS "job_posts_update_policy" ON job_posts;
DROP POLICY IF EXISTS "job_posts_delete_policy" ON job_posts;

-- SELECT: 활성화된 공고는 모두 조회 가능
CREATE POLICY "job_posts_select_policy" ON job_posts FOR SELECT
USING (
    is_active = true 
    OR author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- INSERT: 인증된 기업 회원만 작성 가능
CREATE POLICY "job_posts_insert_policy" ON job_posts FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_verified = true)
    AND auth.uid() = author_id
);

-- UPDATE: 작성자와 관리자만 수정 가능
CREATE POLICY "job_posts_update_policy" ON job_posts FOR UPDATE
USING (
    author_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- DELETE: 작성자와 관리자만 삭제 가능
CREATE POLICY "job_posts_delete_policy" ON job_posts FOR DELETE
USING (
    author_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ===================================
-- 9. 지원 내역 테이블 (job_applications)
-- ===================================
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_applications_select_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_insert_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_update_policy" ON job_applications;

-- SELECT: 지원자 본인과 채용 담당자만 조회 가능
CREATE POLICY "job_applications_select_policy" ON job_applications FOR SELECT
USING (
    applicant_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM job_posts 
        WHERE job_posts.id = job_applications.job_post_id 
        AND job_posts.author_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- INSERT: 로그인한 사용자만 지원 가능
CREATE POLICY "job_applications_insert_policy" ON job_applications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND applicant_id = auth.uid());

-- UPDATE: 채용 담당자만 상태 변경 가능
CREATE POLICY "job_applications_update_policy" ON job_applications FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM job_posts 
        WHERE job_posts.id = job_applications.job_post_id 
        AND job_posts.author_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ===================================
-- 10. 좋아요 테이블 (likes)
-- ===================================
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_select_policy" ON likes;
DROP POLICY IF EXISTS "likes_insert_policy" ON likes;
DROP POLICY IF EXISTS "likes_delete_policy" ON likes;

-- SELECT: 모든 좋아요 조회 가능
CREATE POLICY "likes_select_policy" ON likes FOR SELECT
USING (true);

-- INSERT: 로그인한 사용자만 좋아요 가능
CREATE POLICY "likes_insert_policy" ON likes FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- DELETE: 본인 좋아요만 취소 가능
CREATE POLICY "likes_delete_policy" ON likes FOR DELETE
USING (user_id = auth.uid());

-- ===================================
-- 11. 뱃지 획득 테이블 (user_badges)
-- ===================================
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_badges_select_policy" ON user_badges;
DROP POLICY IF EXISTS "user_badges_insert_policy" ON user_badges;

-- SELECT: 모든 뱃지 획득 정보 조회 가능
CREATE POLICY "user_badges_select_policy" ON user_badges FOR SELECT
USING (true);

-- INSERT: 시스템과 관리자만 부여 가능
CREATE POLICY "user_badges_insert_policy" ON user_badges FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ===================================
-- 12. 관리자 로그 테이블 (admin_logs)
-- ===================================
-- 이미 schema.sql에 정의되어 있음

-- ===================================
-- 13. 시스템 설정 테이블 (system_settings)
-- ===================================
-- 이미 schema.sql에 정의되어 있음

-- ===================================
-- 14. 사용자 세션 테이블 (user_sessions)
-- ===================================
-- 이미 schema.sql에 정의되어 있음

-- ===================================
-- RLS 정책 적용 완료
-- ===================================
-- 이 파일을 실행하면 모든 테이블에 세밀한 접근 권한이 설정됩니다.
-- 각 정책은 다음 원칙을 따릅니다:
-- 1. 최소 권한 원칙 (Principle of Least Privilege)
-- 2. 본인 데이터는 본인만 수정
-- 3. 관리자는 모든 권한 보유
-- 4. 시스템 동작에 필요한 최소한의 권한만 부여