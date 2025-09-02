-- WAVE SPACE 포인트 전용 DB 시스템
-- 포인트 관리, 트랜잭션, 보안을 위한 전용 테이블 구조
-- 작성일: 2025-01-XX

-- ============================================
-- 1. 포인트 잔액 테이블 (실시간 잔액 관리)
-- ============================================

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
    
    -- 무결성 체크
    CONSTRAINT chk_point_balance_integrity CHECK (
        lifetime_points = total_earned AND
        current_points + total_spent + locked_points <= total_earned
    )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_point_balances_current_points ON point_balances(current_points DESC);
CREATE INDEX IF NOT EXISTS idx_point_balances_last_updated ON point_balances(last_updated);

-- RLS 정책
ALTER TABLE point_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 포인트 잔액만 조회 가능" ON point_balances 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "관리자는 모든 포인트 잔액 조회 가능" ON point_balances 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 2. 포인트 트랜잭션 테이블 (모든 거래 기록)
-- ============================================

CREATE TABLE IF NOT EXISTS point_transactions (
    transaction_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- 양수: 획득, 음수: 사용
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'transfer_send', 'transfer_receive', 'refund', 'admin_adjust', 'charge')),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    
    -- 연관 데이터
    related_table VARCHAR(50),
    related_id UUID,
    
    -- 잔액 추적 (감사용)
    balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    
    -- 트랜잭션 상태
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    
    -- 추가 메타데이터
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- 무결성 체크
    CONSTRAINT chk_transaction_balance_logic CHECK (
        (amount > 0 AND balance_after = balance_before + amount) OR
        (amount < 0 AND balance_after = balance_before + amount)
    )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_category ON point_transactions(category);
CREATE INDEX IF NOT EXISTS idx_point_transactions_status ON point_transactions(status);
CREATE INDEX IF NOT EXISTS idx_point_transactions_related ON point_transactions(related_table, related_id);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_date ON point_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_type ON point_transactions(user_id, transaction_type);

-- RLS 정책
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 포인트 거래내역만 조회 가능" ON point_transactions 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "시스템만 포인트 트랜잭션 생성 가능" ON point_transactions 
    FOR INSERT WITH CHECK (false); -- RPC 함수를 통해서만 생성

CREATE POLICY "관리자는 모든 포인트 거래내역 접근 가능" ON point_transactions 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 3. 포인트 충전 기록 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS point_charges (
    charge_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 충전 정보
    charge_amount INTEGER NOT NULL CHECK (charge_amount > 0), -- 실제 결제 금액 (원)
    points_received INTEGER NOT NULL CHECK (points_received > 0), -- 받은 기본 포인트
    bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0), -- 보너스 포인트
    total_points INTEGER GENERATED ALWAYS AS (points_received + bonus_points) STORED,
    
    -- 결제 정보
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- 토스페이먼츠 연동 정보
    payment_key VARCHAR(200),
    order_id VARCHAR(100) NOT NULL,
    toss_payment_key VARCHAR(200),
    
    -- 충전 패키지 정보
    package_id VARCHAR(50),
    package_name VARCHAR(100),
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- 메타데이터
    metadata JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(order_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_point_charges_user_id ON point_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_point_charges_created_at ON point_charges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_charges_payment_status ON point_charges(payment_status);
CREATE INDEX IF NOT EXISTS idx_point_charges_payment_key ON point_charges(payment_key);
CREATE INDEX IF NOT EXISTS idx_point_charges_order_id ON point_charges(order_id);

-- RLS 정책
ALTER TABLE point_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 충전 기록만 조회 가능" ON point_charges 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 충전만 생성 가능" ON point_charges 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "관리자는 모든 충전 기록 접근 가능" ON point_charges 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 4. 포인트 정책 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS point_policies (
    policy_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL UNIQUE,
    points_amount INTEGER NOT NULL,
    daily_limit INTEGER DEFAULT NULL, -- NULL = 무제한
    monthly_limit INTEGER DEFAULT NULL, -- NULL = 무제한
    description TEXT,
    
    -- 추가 조건
    conditions JSONB DEFAULT '{}'::jsonb,
    
    -- 활성화 여부
    is_active BOOLEAN DEFAULT true,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_point_policies_action_type ON point_policies(action_type);
CREATE INDEX IF NOT EXISTS idx_point_policies_is_active ON point_policies(is_active);

-- RLS 정책
ALTER TABLE point_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 포인트 정책 조회 가능" ON point_policies 
    FOR SELECT USING (is_active = true);

CREATE POLICY "관리자만 포인트 정책 관리 가능" ON point_policies 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 5. 포인트 잠금 테이블 (보류 포인트 관리)
-- ============================================

CREATE TABLE IF NOT EXISTS point_locks (
    lock_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    locked_points INTEGER NOT NULL CHECK (locked_points > 0),
    lock_reason VARCHAR(200) NOT NULL,
    related_table VARCHAR(50),
    related_id UUID,
    
    -- 잠금 상태
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'expired')),
    
    -- 만료 시간 (선택사항)
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_point_locks_user_id ON point_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_point_locks_status ON point_locks(status);
CREATE INDEX IF NOT EXISTS idx_point_locks_expires_at ON point_locks(expires_at);

-- RLS 정책
ALTER TABLE point_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 포인트 잠금만 조회 가능" ON point_locks 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "관리자는 모든 포인트 잠금 관리 가능" ON point_locks 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 6. 트리거 및 함수 생성
-- ============================================

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_point_balances_last_updated 
    BEFORE UPDATE ON point_balances 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_point_policies_updated_at 
    BEFORE UPDATE ON point_policies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 트랜잭션 완료 시 completed_at 자동 설정
CREATE OR REPLACE FUNCTION set_transaction_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_transaction_completed_at
    BEFORE UPDATE ON point_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_completed_at();

-- ============================================
-- 7. 포인트 관리 함수들
-- ============================================

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
    -- 입력 검증
    IF p_amount <= 0 THEN
        RAISE EXCEPTION '포인트 적립 금액은 0보다 커야 합니다.';
    END IF;

    -- 현재 잔액 조회 (잠금)
    SELECT current_points INTO v_current_balance 
    FROM point_balances 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    -- 사용자 포인트 잔액이 없으면 생성
    IF v_current_balance IS NULL THEN
        INSERT INTO point_balances (user_id, current_points, total_earned, lifetime_points)
        VALUES (p_user_id, 0, 0, 0);
        v_current_balance = 0;
    END IF;

    v_new_balance = v_current_balance + p_amount;

    -- 트랜잭션 기록 생성
    INSERT INTO point_transactions (
        user_id, amount, transaction_type, category, description,
        related_table, related_id, balance_before, balance_after, metadata
    ) VALUES (
        p_user_id, p_amount, 'earn', p_category, p_description,
        p_related_table, p_related_id, v_current_balance, v_new_balance, p_metadata
    ) RETURNING transaction_id INTO v_transaction_id;

    -- 포인트 잔액 업데이트
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
    -- 입력 검증
    IF p_amount <= 0 THEN
        RAISE EXCEPTION '포인트 차감 금액은 0보다 커야 합니다.';
    END IF;

    -- 현재 잔액 조회 (잠금)
    SELECT current_points INTO v_current_balance 
    FROM point_balances 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    -- 잔액 확인
    IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
        RAISE EXCEPTION '포인트 잔액이 부족합니다. (현재: %, 필요: %)', COALESCE(v_current_balance, 0), p_amount;
    END IF;

    v_new_balance = v_current_balance - p_amount;

    -- 트랜잭션 기록 생성
    INSERT INTO point_transactions (
        user_id, amount, transaction_type, category, description,
        related_table, related_id, balance_before, balance_after, metadata
    ) VALUES (
        p_user_id, -p_amount, 'spend', p_category, p_description,
        p_related_table, p_related_id, v_current_balance, v_new_balance, p_metadata
    ) RETURNING transaction_id INTO v_transaction_id;

    -- 포인트 잔액 업데이트
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

-- 포인트 잔액 조회 함수
CREATE OR REPLACE FUNCTION get_user_point_balance(p_user_id UUID)
RETURNS TABLE (
    current_points INTEGER,
    total_earned BIGINT,
    total_spent BIGINT,
    locked_points INTEGER,
    lifetime_points BIGINT,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pb.current_points,
        pb.total_earned,
        pb.total_spent,
        pb.locked_points,
        pb.lifetime_points,
        pb.last_updated
    FROM point_balances pb
    WHERE pb.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 포인트 거래내역 조회 함수
CREATE OR REPLACE FUNCTION get_user_point_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    transaction_id UUID,
    amount INTEGER,
    transaction_type VARCHAR(20),
    category VARCHAR(50),
    description TEXT,
    balance_after INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.transaction_id,
        pt.amount,
        pt.transaction_type,
        pt.category,
        pt.description,
        pt.balance_after,
        pt.created_at
    FROM point_transactions pt
    WHERE pt.user_id = p_user_id 
      AND pt.status = 'completed'
    ORDER BY pt.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. 초기 포인트 정책 데이터
-- ============================================

INSERT INTO point_policies (action_type, points_amount, daily_limit, description) VALUES
('attendance_daily', 50, 1, '일일 출석체크 기본 포인트'),
('attendance_7days', 200, 1, '7일 연속 출석 보너스'),
('attendance_30days', 1000, 1, '30일 연속 출석 보너스'),
('forum_post_create', 20, 10, '자유게시판 게시글 작성'),
('forum_comment_create', 5, 50, '자유게시판 댓글 작성'),
('humor_post_create', 15, 10, '유머게시판 게시글 작성'),
('qna_post_create', 25, 5, 'Q&A 게시판 질문 작성'),
('qna_answer_create', 30, 10, 'Q&A 게시판 답변 작성'),
('market_research_upload', 500, 3, '시장조사서 업로드'),
('proposal_upload', 300, 3, '제안서 업로드'),
('file_download', -10, NULL, '파일 다운로드 비용'),
('like_received', 2, NULL, '좋아요 받기'),
('profile_complete', 100, 1, '프로필 완성 보너스')
ON CONFLICT (action_type) DO NOTHING;

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 포인트 전용 DB 시스템이 성공적으로 구축되었습니다.';
    RAISE NOTICE '   - point_balances: 실시간 포인트 잔액 관리';
    RAISE NOTICE '   - point_transactions: 모든 거래 기록 추적';
    RAISE NOTICE '   - point_charges: 충전 기록 관리';
    RAISE NOTICE '   - point_policies: 포인트 정책 설정';
    RAISE NOTICE '   - point_locks: 보류 포인트 관리';
    RAISE NOTICE '   - 보안 함수: safe_earn_points, safe_spend_points';
    RAISE NOTICE '   - 조회 함수: get_user_point_balance, get_user_point_history';
END $$;