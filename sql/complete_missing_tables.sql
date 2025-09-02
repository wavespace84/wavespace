-- WAVE SPACE 누락된 테이블 완성 및 데이터 무결성 강화
-- 알림, 구인구직, 뱃지 연동, 관리자 도구 등
-- 작성일: 2025-01-XX

-- ============================================
-- 1. 사용자 뱃지 연결 테이블 (완전 재구성)
-- ============================================

-- 기존 user_badges가 있다면 스키마 확인 후 필요시 재생성
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 뱃지 획득 방법
    earned_method VARCHAR(50) DEFAULT 'auto', -- auto, manual, event, achievement
    earned_description TEXT,
    
    -- 뱃지 관련 메타데이터
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- 뱃지 활성화 여부 (사용자가 표시 끄기 가능)
    is_displayed BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 중복 방지
    UNIQUE(user_id, badge_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_displayed ON user_badges(user_id, is_displayed) WHERE is_displayed = true;

-- RLS 정책
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 뱃지만 조회 가능" ON user_badges 
    FOR SELECT USING (auth.uid() = user_id OR is_active = true);

CREATE POLICY "시스템만 뱃지 지급 가능" ON user_badges 
    FOR INSERT WITH CHECK (false); -- 함수를 통해서만 생성

CREATE POLICY "사용자는 자신의 뱃지 표시 설정만 변경 가능" ON user_badges 
    FOR UPDATE USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "관리자는 모든 뱃지 관리 가능" ON user_badges 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 2. 알림 시스템 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 알림 타입
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'system', 'point', 'badge', 'comment', 'like', 'mention', 
        'post_reply', 'follow', 'attendance', 'charge', 'admin', 'event'
    )),
    
    -- 알림 내용
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
    message TEXT NOT NULL CHECK (length(trim(message)) > 0),
    
    -- 연관 데이터
    related_table VARCHAR(50),
    related_id UUID,
    
    -- 알림 상태
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    
    -- 알림 우선순위
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- 알림 메타데이터
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- 알림 만료 (선택사항)
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- 알림 배치 ID (대량 알림시 그룹핑)
    batch_id UUID
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_related ON notifications(related_table, related_id);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_date ON notifications(user_id, created_at DESC);

-- RLS 정책
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 알림만 접근 가능" ON notifications 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "관리자는 모든 알림 접근 가능" ON notifications 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 3. 구인구직 시스템 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS job_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) >= 5),
    company VARCHAR(100) NOT NULL CHECK (length(trim(company)) >= 2),
    
    -- 위치 정보
    location VARCHAR(100),
    region VARCHAR(50), -- 광역시도
    district VARCHAR(50), -- 시군구
    remote_available BOOLEAN DEFAULT FALSE,
    
    -- 직무 정보
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('planning', 'sales', 'marketing', 'management', 'consulting', 'other')),
    job_category VARCHAR(50),
    experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'junior', 'senior', 'lead', 'executive')),
    
    -- 급여 정보
    salary_type VARCHAR(20) CHECK (salary_type IN ('hourly', 'daily', 'monthly', 'yearly', 'negotiable')),
    salary_min INTEGER CHECK (salary_min >= 0),
    salary_max INTEGER CHECK (salary_max >= salary_min),
    salary_currency VARCHAR(5) DEFAULT 'KRW',
    
    -- 상세 정보
    description TEXT NOT NULL CHECK (length(trim(description)) >= 50),
    requirements TEXT,
    benefits TEXT,
    
    -- 근무 조건
    employment_type VARCHAR(20) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
    work_hours VARCHAR(100),
    
    -- 게시 정보
    poster_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_method VARCHAR(20) DEFAULT 'platform' CHECK (contact_method IN ('platform', 'email', 'phone', 'external')),
    
    -- 통계
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    application_count INTEGER DEFAULT 0 CHECK (application_count >= 0),
    
    -- 특별 기능
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'expired', 'hidden')),
    
    -- 태그 및 검색
    tags TEXT[] DEFAULT '{}',
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('korean', COALESCE(title, '') || ' ' || COALESCE(company, '') || ' ' || COALESCE(description, ''))
    ) STORED,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- 메타데이터
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_job_posts_poster_id ON job_posts(poster_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON job_posts(status);
CREATE INDEX IF NOT EXISTS idx_job_posts_job_type ON job_posts(job_type);
CREATE INDEX IF NOT EXISTS idx_job_posts_location ON job_posts(region, district);
CREATE INDEX IF NOT EXISTS idx_job_posts_created_at ON job_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_posts_expires_at ON job_posts(expires_at);
CREATE INDEX IF NOT EXISTS idx_job_posts_featured ON job_posts(is_featured, created_at DESC) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_job_posts_search_vector ON job_posts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_job_posts_tags ON job_posts USING gin(tags);

-- RLS 정책
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "활성 채용공고는 모든 사용자가 조회 가능" ON job_posts 
    FOR SELECT USING (
        status IN ('active', 'featured') OR 
        auth.uid() = poster_id OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

CREATE POLICY "인증된 사용자만 채용공고 작성 가능" ON job_posts 
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND auth.uid() = poster_id
    );

CREATE POLICY "작성자와 관리자만 채용공고 수정 가능" ON job_posts 
    FOR UPDATE USING (
        auth.uid() = poster_id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- 구직 지원 테이블
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_post_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 지원 정보
    cover_letter TEXT CHECK (length(trim(cover_letter)) <= 2000),
    resume_url TEXT, -- 이력서 파일 URL
    portfolio_url TEXT, -- 포트폴리오 URL
    
    -- 연락 정보
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    
    -- 지원 상태
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'reviewing', 'shortlisted', 'interviewing', 
        'offered', 'accepted', 'rejected', 'withdrawn'
    )),
    
    -- 단계별 타임스탬프
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    interviewed_at TIMESTAMP WITH TIME ZONE,
    decided_at TIMESTAMP WITH TIME ZONE,
    
    -- 평가 정보 (채용담당자용)
    recruiter_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- 메타데이터
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- 중복 지원 방지
    UNIQUE(job_post_id, applicant_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_job_applications_job_post_id ON job_applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_submitted_at ON job_applications(submitted_at DESC);

-- RLS 정책
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "지원자와 채용담당자만 지원서 조회 가능" ON job_applications 
    FOR SELECT USING (
        auth.uid() = applicant_id OR 
        auth.uid() IN (SELECT poster_id FROM job_posts WHERE id = job_post_id) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

CREATE POLICY "인증된 사용자만 지원서 제출 가능" ON job_applications 
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND auth.uid() = applicant_id
    );

CREATE POLICY "지원자는 자신의 지원서만 수정 가능" ON job_applications 
    FOR UPDATE USING (auth.uid() = applicant_id);

-- ============================================
-- 4. 관리자 도구 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id UUID,
    
    -- 로그 상세 정보
    description TEXT NOT NULL,
    level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
    
    -- 변경 사항 (선택사항)
    old_values JSONB,
    new_values JSONB,
    
    -- 요청 정보
    ip_address INET,
    user_agent TEXT,
    request_path TEXT,
    request_method VARCHAR(10),
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_level ON admin_logs(level);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- RLS 정책
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "관리자만 관리자 로그 접근 가능" ON admin_logs 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string' CHECK (value_type IN ('string', 'integer', 'boolean', 'json')),
    description TEXT,
    
    -- 설정 제약
    is_public BOOLEAN DEFAULT FALSE, -- 공개 API에서 조회 가능한지
    is_readonly BOOLEAN DEFAULT FALSE, -- 읽기 전용인지
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category, key)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public) WHERE is_public = true;

-- RLS 정책
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 설정은 모든 사용자가 조회 가능" ON system_settings 
    FOR SELECT USING (is_public = true);

CREATE POLICY "관리자만 모든 설정 접근 가능" ON system_settings 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 5. 세션 및 보안 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    
    -- 세션 정보
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    
    -- 위치 정보 (선택사항)
    location JSONB DEFAULT '{}'::jsonb,
    
    -- 세션 상태
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- RLS 정책
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 세션만 조회 가능" ON user_sessions 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "관리자는 모든 세션 접근 가능" ON user_sessions 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 6. 트리거 및 함수 생성
-- ============================================

-- 업데이트 시간 자동 갱신 트리거들
CREATE TRIGGER update_job_posts_updated_at 
    BEFORE UPDATE ON job_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 세션 활동 시간 자동 업데이트
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_activity
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- 지원서 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_job_application_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE job_posts SET application_count = application_count + 1 WHERE id = NEW.job_post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE job_posts SET application_count = application_count - 1 WHERE id = OLD.job_post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_application_counts
    AFTER INSERT OR DELETE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_job_application_counts();

-- 알림 읽음 처리시 read_at 자동 설정
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = NOW();
    ELSIF NEW.is_read = false THEN
        NEW.read_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_notification_read_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION set_notification_read_at();

-- ============================================
-- 7. 뱃지 지급 함수
-- ============================================

CREATE OR REPLACE FUNCTION award_badge_to_user(
    p_user_id UUID,
    p_badge_name VARCHAR(100),
    p_earned_method VARCHAR(50) DEFAULT 'auto',
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_badge_id UUID;
    v_user_badge_id UUID;
BEGIN
    -- 뱃지 ID 조회
    SELECT id INTO v_badge_id 
    FROM badges 
    WHERE name = p_badge_name AND is_active = true;

    IF v_badge_id IS NULL THEN
        RAISE EXCEPTION '존재하지 않는 뱃지입니다: %', p_badge_name;
    END IF;

    -- 이미 보유한 뱃지인지 확인
    IF EXISTS (
        SELECT 1 FROM user_badges 
        WHERE user_id = p_user_id AND badge_id = v_badge_id
    ) THEN
        RAISE EXCEPTION '이미 보유한 뱃지입니다: %', p_badge_name;
    END IF;

    -- 뱃지 지급
    INSERT INTO user_badges (
        user_id, badge_id, earned_method, earned_description
    ) VALUES (
        p_user_id, v_badge_id, p_earned_method, p_description
    ) RETURNING id INTO v_user_badge_id;

    -- 알림 전송
    INSERT INTO notifications (
        user_id, type, title, message, related_table, related_id, priority
    ) VALUES (
        p_user_id, 'badge', 
        '새로운 뱃지 획득!', 
        format('축하합니다! "%s" 뱃지를 획득했습니다.', p_badge_name),
        'user_badges', v_user_badge_id, 'high'
    );

    RETURN v_user_badge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. 초기 시스템 설정 데이터
-- ============================================

INSERT INTO system_settings (category, key, value, value_type, description, is_public) VALUES
-- 일반 설정
('general', 'site_name', 'WAVE SPACE', 'string', '사이트 이름', true),
('general', 'site_description', '대한민국 No.1 분양실무자 대표 커뮤니티', 'string', '사이트 설명', true),
('general', 'maintenance_mode', 'false', 'boolean', '점검 모드', true),
('general', 'allow_registration', 'true', 'boolean', '회원가입 허용', true),

-- 포인트 설정
('points', 'daily_attendance_points', '50', 'integer', '일일 출석 기본 포인트', false),
('points', 'post_create_points', '20', 'integer', '게시글 작성 포인트', false),
('points', 'comment_create_points', '5', 'integer', '댓글 작성 포인트', false),
('points', 'like_received_points', '2', 'integer', '좋아요 받을 때 포인트', false),

-- 제한 설정
('limits', 'max_posts_per_day', '10', 'integer', '일일 최대 게시글 수', false),
('limits', 'max_comments_per_day', '50', 'integer', '일일 최대 댓글 수', false),
('limits', 'max_file_upload_size', '10485760', 'integer', '최대 파일 업로드 크기 (10MB)', false),

-- 보안 설정
('security', 'session_timeout', '2592000', 'integer', '세션 타임아웃 (30일)', false),
('security', 'max_login_attempts', '5', 'integer', '최대 로그인 시도 횟수', false),
('security', 'require_email_verification', 'true', 'boolean', '이메일 인증 필수', false),

-- UI 설정
('ui', 'posts_per_page', '20', 'integer', '페이지당 게시글 수', true),
('ui', 'comments_per_page', '30', 'integer', '페이지당 댓글 수', true),
('ui', 'enable_dark_mode', 'true', 'boolean', '다크모드 지원', true)

ON CONFLICT (category, key) DO NOTHING;

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 누락된 테이블과 데이터 무결성이 완성되었습니다.';
    RAISE NOTICE '   - user_badges: 뱃지 지급 시스템';
    RAISE NOTICE '   - notifications: 실시간 알림 시스템';
    RAISE NOTICE '   - job_posts & job_applications: 구인구직 시스템';
    RAISE NOTICE '   - admin_logs: 관리자 활동 로그';
    RAISE NOTICE '   - system_settings: 시스템 설정 관리';
    RAISE NOTICE '   - user_sessions: 세션 관리';
    RAISE NOTICE '   - award_badge_to_user: 뱃지 지급 함수';
    RAISE NOTICE '   - 초기 시스템 설정값 삽입 완료';
END $$;