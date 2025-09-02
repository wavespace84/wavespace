-- WAVE SPACE 데이터베이스 스키마
-- Supabase PostgreSQL용 테이블 생성 스크립트

-- 1. 사용자 테이블 (users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nickname VARCHAR(50) UNIQUE,  -- 닉네임 추가
    full_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    department VARCHAR(100),
    role VARCHAR(20) DEFAULT 'member', -- member, verified, admin
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    profile_image_url TEXT,
    bio TEXT,
    location VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 게시판 카테고리 테이블
CREATE TABLE IF NOT EXISTS post_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 게시글 테이블 (posts)
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES post_categories(id),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    tags TEXT[], -- 태그 배열
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 댓글 테이블 (comments)
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id), -- 대댓글용
    like_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 포인트 내역 테이블 (point_history)
CREATE TABLE IF NOT EXISTS point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- 양수: 적립, 음수: 차감
    type VARCHAR(50) NOT NULL, -- earn, spend, admin, bonus
    description TEXT NOT NULL,
    related_id UUID, -- 관련된 게시글/댓글 등의 ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 출석체크 테이블 (attendance)
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    consecutive_days INTEGER DEFAULT 1,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, check_date)
);

-- 7. 뱃지 정의 테이블 (badges)
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    badge_type VARCHAR(20) NOT NULL, -- normal, rare, premium
    color VARCHAR(7) DEFAULT '#6B7280', -- 회색, 하늘색, 그라데이션
    condition_type VARCHAR(50), -- auto, manual, event
    condition_value JSONB, -- 획득 조건 상세
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 사용자 뱃지 테이블 (user_badges)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, badge_id)
);

-- 9. 파일 저장 테이블 (files)
CREATE TABLE IF NOT EXISTS files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploader_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50), -- market_research, proposal, education, etc
    downloads INTEGER DEFAULT 0,
    points_cost INTEGER DEFAULT 0, -- 다운로드 필요 포인트
    is_verified BOOLEAN DEFAULT FALSE, -- 승인 여부 (시장조사서, 제안서)
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 파일 다운로드 내역 (file_downloads)
CREATE TABLE IF NOT EXISTS file_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points_used INTEGER DEFAULT 0,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 좋아요/추천 테이블 (likes)
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- post, comment
    target_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- 12. 신고 테이블 (reports)
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- post, comment, user
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, resolved, dismissed
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. 알림 테이블 (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- comment, like, point, badge, system
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID, -- 관련 게시글/댓글 ID
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. 구인구직 테이블 (job_posts)
CREATE TABLE IF NOT EXISTS job_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    job_type VARCHAR(20), -- planning, sales
    experience_level VARCHAR(20), -- junior, senior, expert
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    poster_id UUID REFERENCES users(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE, -- 포인트로 상단 노출
    featured_until TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active', -- active, closed, hidden
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. 구직 지원 테이블 (job_applications)
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_post_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resume_file_id UUID REFERENCES files(id),
    cover_letter TEXT,
    status VARCHAR(20) DEFAULT 'submitted', -- submitted, viewed, contacted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_post_id, applicant_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_point_history_user ON point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 업데이트 시간 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 관리자 로그 테이블
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    level VARCHAR(20) DEFAULT 'info',
    user_id UUID REFERENCES users(id),
    admin_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 세션 테이블
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_posts_updated_at BEFORE UPDATE ON job_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 권한 설정 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 사용자 정책
CREATE POLICY "사용자는 자신의 정보만 볼 수 있음" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "사용자는 자신의 정보만 업데이트 가능" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "관리자는 모든 사용자 정보 접근 가능" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 게시글 정책
CREATE POLICY "게시글은 모든 사용자가 볼 수 있음" ON posts FOR SELECT USING (NOT is_hidden OR auth.uid() = author_id);
CREATE POLICY "게시글 작성자와 관리자만 수정 가능" ON posts FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 댓글 정책
CREATE POLICY "댓글은 모든 사용자가 볼 수 있음" ON comments FOR SELECT USING (true);
CREATE POLICY "댓글 작성자와 관리자만 수정 가능" ON comments FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 관리자 로그 정책
CREATE POLICY "관리자만 로그 접근 가능" ON admin_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 시스템 설정 정책
CREATE POLICY "관리자만 설정 접근 가능" ON system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 세션 정책
CREATE POLICY "사용자는 자신의 세션만 볼 수 있음" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "관리자는 모든 세션 접근 가능" ON user_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);