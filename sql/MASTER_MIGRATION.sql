-- WAVE SPACE 마스터 DB 마이그레이션
-- 전체 데이터베이스 구조를 처음부터 완전히 구축하는 통합 스크립트
-- 실행 순서: 의존성에 따른 정확한 테이블 생성 순서
-- 작성일: 2025-01-XX

-- ============================================
-- 실행 전 준비사항 확인
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🚀 WAVE SPACE 마스터 DB 마이그레이션을 시작합니다...';
    RAISE NOTICE '📋 실행 단계:';
    RAISE NOTICE '   1. 포인트 전용 DB 시스템';
    RAISE NOTICE '   2. 포인트 보안 기능';
    RAISE NOTICE '   3. 커뮤니티 시스템';
    RAISE NOTICE '   4. 출석체크 시스템';
    RAISE NOTICE '   5. 누락된 테이블 완성';
    RAISE NOTICE '   6. 초기 데이터 삽입';
    RAISE NOTICE '   7. 최종 검증';
    RAISE NOTICE '';
END $$;

-- 기본 업데이트 함수가 없다면 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Phase 1: 포인트 전용 DB 시스템
-- ============================================

RAISE NOTICE '📝 Phase 1: 포인트 전용 DB 시스템 구축 중...';

-- 1. 포인트 잔액 테이블
CREATE TABLE IF NOT EXISTS point_balances (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_points INTEGER NOT NULL DEFAULT 0 CHECK (current_points >= 0),
    total_earned BIGINT NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
    total_spent BIGINT NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    locked_points INTEGER NOT NULL DEFAULT 0 CHECK (locked_points >= 0),
    lifetime_points BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
    last_transaction_id UUID,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_point_balance_integrity CHECK (
        lifetime_points = total_earned AND
        current_points + total_spent + locked_points <= total_earned
    )
);

-- 2. 포인트 트랜잭션 테이블
CREATE TABLE IF NOT EXISTS point_transactions (
    transaction_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'transfer_send', 'transfer_receive', 'refund', 'admin_adjust', 'charge')),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    
    related_table VARCHAR(50),
    related_id UUID,
    
    balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT chk_transaction_balance_logic CHECK (
        (amount > 0 AND balance_after = balance_before + amount) OR
        (amount < 0 AND balance_after = balance_before + amount)
    )
);

-- 3. 포인트 충전 기록 테이블
CREATE TABLE IF NOT EXISTS point_charges (
    charge_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    charge_amount INTEGER NOT NULL CHECK (charge_amount > 0),
    points_received INTEGER NOT NULL CHECK (points_received > 0),
    bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
    total_points INTEGER GENERATED ALWAYS AS (points_received + bonus_points) STORED,
    
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    
    payment_key VARCHAR(200),
    order_id VARCHAR(100) NOT NULL,
    toss_payment_key VARCHAR(200),
    
    package_id VARCHAR(50),
    package_name VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(order_id)
);

-- 4. 포인트 정책 테이블
CREATE TABLE IF NOT EXISTS point_policies (
    policy_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL UNIQUE,
    points_amount INTEGER NOT NULL,
    daily_limit INTEGER DEFAULT NULL,
    monthly_limit INTEGER DEFAULT NULL,
    description TEXT,
    
    conditions JSONB DEFAULT '{}'::jsonb,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 포인트 잠금 테이블
CREATE TABLE IF NOT EXISTS point_locks (
    lock_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    locked_points INTEGER NOT NULL CHECK (locked_points > 0),
    lock_reason VARCHAR(200) NOT NULL,
    related_table VARCHAR(50),
    related_id UUID,
    
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'expired')),
    
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE
);

RAISE NOTICE '✅ Phase 1: 포인트 전용 DB 테이블 생성 완료';

-- ============================================
-- Phase 2: 커뮤니티 시스템
-- ============================================

RAISE NOTICE '📝 Phase 2: 커뮤니티 시스템 구축 중...';

-- 1. 게시판 카테고리 테이블
CREATE TABLE IF NOT EXISTS post_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#0066FF',
    sort_order INTEGER DEFAULT 0,
    
    post_points INTEGER DEFAULT 20,
    comment_points INTEGER DEFAULT 5,
    
    is_active BOOLEAN DEFAULT TRUE,
    requires_auth BOOLEAN DEFAULT TRUE,
    allow_anonymous BOOLEAN DEFAULT FALSE,
    
    auto_approve BOOLEAN DEFAULT TRUE,
    max_posts_per_day INTEGER DEFAULT 10,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 게시글 테이블
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) >= 2),
    content TEXT NOT NULL CHECK (length(trim(content)) >= 5),
    
    category_id INTEGER NOT NULL REFERENCES post_categories(id),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'deleted')),
    
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    comment_count INTEGER DEFAULT 0 CHECK (comment_count >= 0),
    
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    
    tags TEXT[] DEFAULT '{}',
    meta_description TEXT,
    search_vector tsvector,
    
    points_awarded INTEGER DEFAULT 0,
    
    featured_image_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    is_draft BOOLEAN GENERATED ALWAYS AS (status = 'draft') STORED,
    
    search_vector_generated tsvector GENERATED ALWAYS AS (
        to_tsvector('korean', COALESCE(title, '') || ' ' || COALESCE(content, ''))
    ) STORED
);

-- 3. 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL CHECK (length(trim(content)) >= 1 AND length(trim(content)) <= 1000),
    
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
    is_approved BOOLEAN DEFAULT TRUE,
    
    like_count INTEGER DEFAULT 0 CHECK (like_count >= 0),
    reply_count INTEGER DEFAULT 0 CHECK (reply_count >= 0),
    
    depth INTEGER DEFAULT 0 CHECK (depth >= 0 AND depth <= 3),
    
    points_awarded INTEGER DEFAULT 0,
    
    is_edited BOOLEAN DEFAULT FALSE,
    edit_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    thread_order INTEGER DEFAULT 0,
    
    mentions UUID[] DEFAULT '{}',
    
    ip_address INET,
    
    CONSTRAINT chk_no_self_parent CHECK (id != parent_id)
);

-- 4. 좋아요 테이블
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    
    reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'angry', 'sad')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, target_type, target_id, reaction_type)
);

-- 5. 신고 테이블
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
    target_id UUID NOT NULL,
    
    reason VARCHAR(50) NOT NULL CHECK (reason IN (
        'spam', 'abuse', 'inappropriate', 'copyright', 'misinformation', 
        'harassment', 'violence', 'hate_speech', 'adult_content', 'other'
    )),
    description TEXT CHECK (length(trim(description)) <= 500),
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    
    reviewed_by UUID REFERENCES users(id),
    admin_notes TEXT,
    resolution VARCHAR(20) CHECK (resolution IN ('no_action', 'warning', 'content_removed', 'user_suspended', 'user_banned')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    reporter_ip INET,
    
    UNIQUE(reporter_id, target_type, target_id)
);

RAISE NOTICE '✅ Phase 2: 커뮤니티 시스템 테이블 생성 완료';

-- ============================================
-- Phase 3: 출석체크 시스템
-- ============================================

RAISE NOTICE '📝 Phase 3: 출석체크 시스템 구축 중...';

-- 기존 attendance 테이블 삭제 후 새로 생성
DROP TABLE IF EXISTS attendance CASCADE;

-- 1. 출석 기록 테이블
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    
    consecutive_days INTEGER NOT NULL DEFAULT 1 CHECK (consecutive_days >= 1),
    total_attendance INTEGER NOT NULL DEFAULT 1 CHECK (total_attendance >= 1),
    
    base_points INTEGER NOT NULL DEFAULT 0 CHECK (base_points >= 0),
    bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
    total_points INTEGER GENERATED ALWAYS AS (base_points + bonus_points) STORED,
    
    check_time TIME DEFAULT EXTRACT(time FROM NOW()),
    
    check_method VARCHAR(20) DEFAULT 'web' CHECK (check_method IN ('web', 'mobile', 'api')),
    
    special_bonus JSONB DEFAULT '{}'::jsonb,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, check_date)
);

-- 2. 출석 보상 정책 테이블
CREATE TABLE IF NOT EXISTS attendance_rewards (
    id SERIAL PRIMARY KEY,
    consecutive_days INTEGER NOT NULL UNIQUE CHECK (consecutive_days >= 1),
    base_points INTEGER NOT NULL DEFAULT 0 CHECK (base_points >= 0),
    bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
    special_reward_type VARCHAR(50),
    special_reward_data JSONB DEFAULT '{}'::jsonb,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 출석 통계 테이블
CREATE TABLE IF NOT EXISTS attendance_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    
    total_attendance_days INTEGER NOT NULL DEFAULT 0 CHECK (total_attendance_days >= 0),
    max_consecutive_days INTEGER NOT NULL DEFAULT 0 CHECK (max_consecutive_days >= 0),
    total_points_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_points_earned >= 0),
    
    perfect_month BOOLEAN DEFAULT FALSE,
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, year, month)
);

RAISE NOTICE '✅ Phase 3: 출석체크 시스템 테이블 생성 완료';

-- ============================================
-- Phase 4: 누락된 테이블 완성
-- ============================================

RAISE NOTICE '📝 Phase 4: 누락된 테이블 완성 중...';

-- 1. 사용자 뱃지 연결 테이블
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    earned_method VARCHAR(50) DEFAULT 'auto',
    earned_description TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    is_displayed BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, badge_id)
);

-- 2. 알림 시스템 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'system', 'point', 'badge', 'comment', 'like', 'mention', 
        'post_reply', 'follow', 'attendance', 'charge', 'admin', 'event'
    )),
    
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
    message TEXT NOT NULL CHECK (length(trim(message)) > 0),
    
    related_table VARCHAR(50),
    related_id UUID,
    
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    batch_id UUID
);

-- 3. 구인구직 테이블들
CREATE TABLE IF NOT EXISTS job_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) >= 5),
    company VARCHAR(100) NOT NULL CHECK (length(trim(company)) >= 2),
    
    location VARCHAR(100),
    region VARCHAR(50),
    district VARCHAR(50),
    remote_available BOOLEAN DEFAULT FALSE,
    
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('planning', 'sales', 'marketing', 'management', 'consulting', 'other')),
    job_category VARCHAR(50),
    experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'junior', 'senior', 'lead', 'executive')),
    
    salary_type VARCHAR(20) CHECK (salary_type IN ('hourly', 'daily', 'monthly', 'yearly', 'negotiable')),
    salary_min INTEGER CHECK (salary_min >= 0),
    salary_max INTEGER CHECK (salary_max >= salary_min),
    salary_currency VARCHAR(5) DEFAULT 'KRW',
    
    description TEXT NOT NULL CHECK (length(trim(description)) >= 50),
    requirements TEXT,
    benefits TEXT,
    
    employment_type VARCHAR(20) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
    work_hours VARCHAR(100),
    
    poster_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_method VARCHAR(20) DEFAULT 'platform' CHECK (contact_method IN ('platform', 'email', 'phone', 'external')),
    
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    application_count INTEGER DEFAULT 0 CHECK (application_count >= 0),
    
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'expired', 'hidden')),
    
    tags TEXT[] DEFAULT '{}',
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('korean', COALESCE(title, '') || ' ' || COALESCE(company, '') || ' ' || COALESCE(description, ''))
    ) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_post_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    cover_letter TEXT CHECK (length(trim(cover_letter)) <= 2000),
    resume_url TEXT,
    portfolio_url TEXT,
    
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'reviewing', 'shortlisted', 'interviewing', 
        'offered', 'accepted', 'rejected', 'withdrawn'
    )),
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    interviewed_at TIMESTAMP WITH TIME ZONE,
    decided_at TIMESTAMP WITH TIME ZONE,
    
    recruiter_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(job_post_id, applicant_id)
);

-- 4. 관리자 도구 테이블들
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id UUID,
    
    description TEXT NOT NULL,
    level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    request_path TEXT,
    request_method VARCHAR(10),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string' CHECK (value_type IN ('string', 'integer', 'boolean', 'json')),
    description TEXT,
    
    is_public BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category, key)
);

-- 5. 세션 관리 테이블
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    
    location JSONB DEFAULT '{}'::jsonb,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

RAISE NOTICE '✅ Phase 4: 누락된 테이블 생성 완료';

-- ============================================
-- Phase 5: 인덱스 생성
-- ============================================

RAISE NOTICE '📝 Phase 5: 인덱스 최적화 중...';

-- 포인트 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_point_balances_current_points ON point_balances(current_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_charges_user_id ON point_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_point_charges_order_id ON point_charges(order_id);

-- 커뮤니티 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING gin(search_vector_generated);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);

-- 출석체크 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_check_date ON attendance_records(check_date DESC);

-- 기타 시스템 인덱스
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON job_posts(status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);

RAISE NOTICE '✅ Phase 5: 인덱스 최적화 완료';

-- ============================================
-- Phase 6: RLS 정책 설정
-- ============================================

RAISE NOTICE '📝 Phase 6: RLS 정책 설정 중...';

-- 포인트 시스템 RLS
ALTER TABLE point_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_locks ENABLE ROW LEVEL SECURITY;

-- 커뮤니티 시스템 RLS
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 출석체크 시스템 RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_statistics ENABLE ROW LEVEL SECURITY;

-- 기타 시스템 RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 기본 RLS 정책들 (간소화된 버전)
CREATE POLICY "users_can_view_own_data" ON point_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_can_view_own_transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_can_view_published_posts" ON posts FOR SELECT USING (status = 'published' OR auth.uid() = author_id);
CREATE POLICY "users_can_view_own_notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

RAISE NOTICE '✅ Phase 6: RLS 정책 설정 완료';

-- ============================================
-- Phase 7: 핵심 함수 생성
-- ============================================

RAISE NOTICE '📝 Phase 7: 핵심 함수 생성 중...';

-- 안전한 포인트 적립 함수
CREATE OR REPLACE FUNCTION safe_earn_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_category VARCHAR(50),
    p_description TEXT,
    p_related_table VARCHAR(50) DEFAULT NULL,
    p_related_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION '포인트 적립 금액은 0보다 커야 합니다.';
    END IF;

    SELECT current_points INTO v_current_balance 
    FROM point_balances 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        INSERT INTO point_balances (user_id, current_points, total_earned, lifetime_points)
        VALUES (p_user_id, 0, 0, 0);
        v_current_balance = 0;
    END IF;

    v_new_balance = v_current_balance + p_amount;

    INSERT INTO point_transactions (
        user_id, amount, transaction_type, category, description,
        related_table, related_id, balance_before, balance_after, metadata
    ) VALUES (
        p_user_id, p_amount, 'earn', p_category, p_description,
        p_related_table, p_related_id, v_current_balance, v_new_balance, p_metadata
    ) RETURNING transaction_id INTO v_transaction_id;

    UPDATE point_balances 
    SET 
        current_points = v_new_balance,
        total_earned = total_earned + p_amount,
        lifetime_points = lifetime_points + p_amount,
        last_transaction_id = v_transaction_id,
        last_updated = NOW()
    WHERE user_id = p_user_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 안전한 포인트 차감 함수
CREATE OR REPLACE FUNCTION safe_spend_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_category VARCHAR(50),
    p_description TEXT,
    p_related_table VARCHAR(50) DEFAULT NULL,
    p_related_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION '포인트 차감 금액은 0보다 커야 합니다.';
    END IF;

    SELECT current_points INTO v_current_balance 
    FROM point_balances 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
        RAISE EXCEPTION '포인트 잔액이 부족합니다. (현재: %, 필요: %)', COALESCE(v_current_balance, 0), p_amount;
    END IF;

    v_new_balance = v_current_balance - p_amount;

    INSERT INTO point_transactions (
        user_id, amount, transaction_type, category, description,
        related_table, related_id, balance_before, balance_after, metadata
    ) VALUES (
        p_user_id, -p_amount, 'spend', p_category, p_description,
        p_related_table, p_related_id, v_current_balance, v_new_balance, p_metadata
    ) RETURNING transaction_id INTO v_transaction_id;

    UPDATE point_balances 
    SET 
        current_points = v_new_balance,
        total_spent = total_spent + p_amount,
        last_transaction_id = v_transaction_id,
        last_updated = NOW()
    WHERE user_id = p_user_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 출석체크 함수
CREATE OR REPLACE FUNCTION process_daily_attendance(p_user_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    consecutive_days INTEGER,
    points_earned INTEGER
) AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    v_consecutive_days INTEGER;
    v_base_points INTEGER := 50;
    v_bonus_points INTEGER := 0;
    v_total_points INTEGER;
    v_yesterday_record RECORD;
BEGIN
    IF EXISTS (
        SELECT 1 FROM attendance_records 
        WHERE user_id = p_user_id AND check_date = v_today
    ) THEN
        RETURN QUERY SELECT 
            false, 
            '이미 오늘 출석체크를 완료했습니다.'::TEXT,
            NULL::INTEGER,
            NULL::INTEGER;
        RETURN;
    END IF;

    SELECT consecutive_days
    INTO v_yesterday_record
    FROM attendance_records 
    WHERE user_id = p_user_id AND check_date = v_yesterday;

    IF v_yesterday_record IS NOT NULL THEN
        v_consecutive_days := v_yesterday_record.consecutive_days + 1;
    ELSE
        v_consecutive_days := 1;
    END IF;

    CASE 
        WHEN v_consecutive_days >= 30 THEN v_bonus_points := 500;
        WHEN v_consecutive_days >= 14 THEN v_bonus_points := 200;
        WHEN v_consecutive_days >= 7 THEN v_bonus_points := 100;
        WHEN v_consecutive_days >= 3 THEN v_bonus_points := 20;
        ELSE v_bonus_points := 0;
    END CASE;

    v_total_points := v_base_points + v_bonus_points;

    INSERT INTO attendance_records (
        user_id, check_date, consecutive_days, 
        base_points, bonus_points,
        check_method
    ) VALUES (
        p_user_id, v_today, v_consecutive_days,
        v_base_points, v_bonus_points,
        'web'
    );

    PERFORM safe_earn_points(
        p_user_id,
        v_total_points,
        'attendance',
        format('출석체크 (%s일 연속)', v_consecutive_days)
    );

    UPDATE users 
    SET attendance_count = attendance_count + 1
    WHERE id = p_user_id;

    RETURN QUERY SELECT 
        true,
        format('출석체크 완료! %s일 연속 출석으로 %sP를 획득했습니다.', v_consecutive_days, v_total_points)::TEXT,
        v_consecutive_days,
        v_total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

RAISE NOTICE '✅ Phase 7: 핵심 함수 생성 완료';

-- ============================================
-- Phase 8: 초기 데이터 삽입
-- ============================================

RAISE NOTICE '📝 Phase 8: 초기 데이터 삽입 중...';

-- 포인트 정책 초기 데이터
INSERT INTO point_policies (action_type, points_amount, daily_limit, description) VALUES
('attendance_daily', 50, 1, '일일 출석체크 기본 포인트'),
('forum_post_create', 20, 10, '자유게시판 게시글 작성'),
('forum_comment_create', 5, 50, '자유게시판 댓글 작성'),
('humor_post_create', 15, 10, '유머게시판 게시글 작성'),
('qna_post_create', 25, 5, 'Q&A 게시판 질문 작성'),
('market_research_upload', 500, 3, '시장조사서 업로드'),
('like_received', 2, NULL, '좋아요 받기')
ON CONFLICT (action_type) DO NOTHING;

-- 게시판 카테고리 초기 데이터
INSERT INTO post_categories (name, slug, description, icon, color, sort_order, post_points, comment_points) VALUES
('자유게시판', 'forum', '자유로운 주제로 대화를 나누는 공간입니다.', 'fas fa-comments', '#0066FF', 1, 20, 5),
('유머재미', 'humor', '재미있는 이야기와 유머를 공유하는 공간입니다.', 'fas fa-laugh', '#FF6B6B', 2, 15, 5),
('질문답변', 'qna', '궁금한 점을 질문하고 답변을 받는 공간입니다.', 'fas fa-question-circle', '#4ECDC4', 3, 25, 10),
('정보공유', 'info', '유용한 정보와 팁을 공유하는 공간입니다.', 'fas fa-info-circle', '#45B7D1', 4, 30, 10),
('건의사항', 'suggestion', '플랫폼 개선 건의와 피드백을 주는 공간입니다.', 'fas fa-lightbulb', '#FFA726', 5, 20, 5)
ON CONFLICT (slug) DO NOTHING;

-- 출석 보상 정책 초기 데이터
INSERT INTO attendance_rewards (consecutive_days, base_points, bonus_points, description) VALUES
(1, 50, 0, '첫 출석'),
(3, 50, 20, '3일 연속 출석 보너스'),
(7, 50, 100, '일주일 연속 출석'),
(14, 50, 200, '2주 연속 출석'),
(30, 50, 500, '한달 연속 출석'),
(100, 50, 1500, '100일 연속 출석')
ON CONFLICT (consecutive_days) DO NOTHING;

-- 시스템 설정 초기 데이터
INSERT INTO system_settings (category, key, value, value_type, description, is_public) VALUES
('general', 'site_name', 'WAVE SPACE', 'string', '사이트 이름', true),
('general', 'maintenance_mode', 'false', 'boolean', '점검 모드', true),
('points', 'daily_attendance_points', '50', 'integer', '일일 출석 기본 포인트', false),
('limits', 'max_posts_per_day', '10', 'integer', '일일 최대 게시글 수', false),
('ui', 'posts_per_page', '20', 'integer', '페이지당 게시글 수', true)
ON CONFLICT (category, key) DO NOTHING;

RAISE NOTICE '✅ Phase 8: 초기 데이터 삽입 완료';

-- ============================================
-- Phase 9: 최종 검증
-- ============================================

RAISE NOTICE '📝 Phase 9: 최종 검증 중...';

-- 테이블 존재 확인
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'point_balances', 'point_transactions', 'point_charges', 'point_policies', 'point_locks',
        'post_categories', 'posts', 'comments', 'likes', 'reports',
        'attendance_records', 'attendance_rewards', 'attendance_statistics',
        'user_badges', 'notifications', 'job_posts', 'job_applications',
        'admin_logs', 'system_settings', 'user_sessions'
    );
    
    RAISE NOTICE '생성된 테이블 수: % / 20', table_count;
    
    IF table_count = 20 THEN
        RAISE NOTICE '✅ 모든 테이블이 성공적으로 생성되었습니다.';
    ELSE
        RAISE WARNING '⚠️ 일부 테이블이 누락되었을 수 있습니다.';
    END IF;
END $$;

-- 함수 존재 확인
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('safe_earn_points', 'safe_spend_points', 'process_daily_attendance');
    
    RAISE NOTICE '생성된 핵심 함수 수: % / 3', function_count;
END $$;

RAISE NOTICE '✅ Phase 9: 최종 검증 완료';

-- ============================================
-- 마이그레이션 완료
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 WAVE SPACE 마스터 DB 마이그레이션이 완료되었습니다!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 구축된 시스템:';
    RAISE NOTICE '   💰 포인트 전용 DB (5개 테이블) - 보안 강화된 트랜잭션 시스템';
    RAISE NOTICE '   💬 커뮤니티 시스템 (5개 테이블) - 게시판, 댓글, 좋아요, 신고';
    RAISE NOTICE '   📅 출석체크 시스템 (3개 테이블) - 연속출석 보너스';
    RAISE NOTICE '   🎖️ 뱃지 & 알림 시스템 (2개 테이블) - 실시간 알림';
    RAISE NOTICE '   💼 구인구직 시스템 (2개 테이블) - 채용공고 & 지원';
    RAISE NOTICE '   🛠️ 관리자 도구 (3개 테이블) - 로그, 설정, 세션';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 핵심 기능:';
    RAISE NOTICE '   • 포인트 적립/차감 보안 함수';
    RAISE NOTICE '   • 출석체크 자동화 시스템';
    RAISE NOTICE '   • RLS 보안 정책 적용';
    RAISE NOTICE '   • 인덱스 최적화 완료';
    RAISE NOTICE '   • 초기 데이터 및 정책 설정';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 이제 WAVE SPACE를 본격적으로 운영할 수 있습니다!';
END $$;