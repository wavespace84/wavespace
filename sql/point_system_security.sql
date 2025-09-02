-- WAVE SPACE 포인트 시스템 보안 강화
-- 이중 차감/지급 방지, 트랜잭션 롤백, 감사 로그
-- 작성일: 2025-01-XX

-- ============================================
-- 1. 포인트 전송 (선물하기) 안전 함수
-- ============================================

CREATE OR REPLACE FUNCTION safe_transfer_points(
    p_sender_id UUID,
    p_receiver_id UUID,
    p_amount INTEGER,
    p_message TEXT DEFAULT '',
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_sender_transaction_id UUID;
    v_receiver_transaction_id UUID;
    v_sender_balance INTEGER;
BEGIN
    -- 입력 검증
    IF p_amount <= 0 THEN
        RAISE EXCEPTION '전송할 포인트는 0보다 커야 합니다.';
    END IF;
    
    IF p_sender_id = p_receiver_id THEN
        RAISE EXCEPTION '자신에게는 포인트를 전송할 수 없습니다.';
    END IF;

    -- 송신자와 수신자 검증
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_sender_id AND is_verified = true) THEN
        RAISE EXCEPTION '송신자가 존재하지 않거나 인증되지 않은 사용자입니다.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_receiver_id AND is_verified = true) THEN
        RAISE EXCEPTION '수신자가 존재하지 않거나 인증되지 않은 사용자입니다.';
    END IF;

    -- 트랜잭션 시작 (원자성 보장)
    BEGIN
        -- 송신자 포인트 차감
        v_sender_transaction_id := safe_spend_points(
            p_sender_id,
            p_amount,
            'transfer_send',
            '포인트 전송: ' || (SELECT username FROM users WHERE id = p_receiver_id),
            'point_transactions',
            NULL,
            p_metadata || jsonb_build_object('receiver_id', p_receiver_id, 'message', p_message)
        );

        -- 수신자 포인트 적립
        v_receiver_transaction_id := safe_earn_points(
            p_receiver_id,
            p_amount,
            'transfer_receive',
            '포인트 수신: ' || (SELECT username FROM users WHERE id = p_sender_id),
            'point_transactions',
            v_sender_transaction_id,
            p_metadata || jsonb_build_object('sender_id', p_sender_id, 'message', p_message)
        );

        -- 송신자 트랜잭션에 수신자 ID 연결
        UPDATE point_transactions 
        SET related_id = v_receiver_transaction_id
        WHERE transaction_id = v_sender_transaction_id;

        RETURN v_sender_transaction_id;

    EXCEPTION WHEN OTHERS THEN
        -- 오류 발생 시 자동 롤백
        RAISE EXCEPTION '포인트 전송 실패: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. 포인트 충전 처리 함수
-- ============================================

CREATE OR REPLACE FUNCTION process_point_charge(
    p_user_id UUID,
    p_charge_amount INTEGER,
    p_points_received INTEGER,
    p_bonus_points INTEGER,
    p_payment_method VARCHAR(50),
    p_order_id VARCHAR(100),
    p_payment_key VARCHAR(200),
    p_package_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_charge_id UUID;
    v_transaction_id UUID;
    v_total_points INTEGER;
BEGIN
    v_total_points := p_points_received + p_bonus_points;

    -- 중복 주문 확인
    IF EXISTS (SELECT 1 FROM point_charges WHERE order_id = p_order_id) THEN
        RAISE EXCEPTION '이미 처리된 주문입니다: %', p_order_id;
    END IF;

    -- 트랜잭션 시작
    BEGIN
        -- 충전 기록 생성
        INSERT INTO point_charges (
            user_id, charge_amount, points_received, bonus_points,
            payment_method, payment_status, order_id, payment_key,
            package_name, metadata, paid_at
        ) VALUES (
            p_user_id, p_charge_amount, p_points_received, p_bonus_points,
            p_payment_method, 'completed', p_order_id, p_payment_key,
            p_package_info->>'package_name', p_package_info, NOW()
        ) RETURNING charge_id INTO v_charge_id;

        -- 포인트 적립
        v_transaction_id := safe_earn_points(
            p_user_id,
            v_total_points,
            'charge',
            format('포인트 충전 (기본: %s + 보너스: %s)', p_points_received, p_bonus_points),
            'point_charges',
            v_charge_id,
            jsonb_build_object('charge_id', v_charge_id, 'order_id', p_order_id)
        );

        RETURN v_charge_id;

    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION '포인트 충전 처리 실패: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. 포인트 롤백 함수 (관리자 전용)
-- ============================================

CREATE OR REPLACE FUNCTION rollback_point_transaction(
    p_transaction_id UUID,
    p_admin_reason TEXT
)
RETURNS UUID AS $$
DECLARE
    v_original_txn RECORD;
    v_rollback_txn_id UUID;
    v_rollback_amount INTEGER;
    v_rollback_type VARCHAR(20);
BEGIN
    -- 원본 트랜잭션 조회
    SELECT * INTO v_original_txn 
    FROM point_transactions 
    WHERE transaction_id = p_transaction_id AND status = 'completed';

    IF NOT FOUND THEN
        RAISE EXCEPTION '롤백할 수 있는 트랜잭션을 찾을 수 없습니다: %', p_transaction_id;
    END IF;

    -- 롤백 트랜잭션 생성 (반대 방향)
    IF v_original_txn.transaction_type = 'earn' THEN
        v_rollback_amount := -v_original_txn.amount;
        v_rollback_type := 'spend';
    ELSE
        v_rollback_amount := -v_original_txn.amount;
        v_rollback_type := 'earn';
    END IF;

    -- 롤백 실행
    IF v_rollback_type = 'earn' THEN
        v_rollback_txn_id := safe_earn_points(
            v_original_txn.user_id,
            abs(v_rollback_amount),
            'admin_adjust',
            '관리자 롤백: ' || p_admin_reason,
            'point_transactions',
            p_transaction_id,
            jsonb_build_object('rollback_of', p_transaction_id, 'reason', p_admin_reason)
        );
    ELSE
        v_rollback_txn_id := safe_spend_points(
            v_original_txn.user_id,
            abs(v_rollback_amount),
            'admin_adjust',
            '관리자 롤백: ' || p_admin_reason,
            'point_transactions',
            p_transaction_id,
            jsonb_build_object('rollback_of', p_transaction_id, 'reason', p_admin_reason)
        );
    END IF;

    -- 원본 트랜잭션 상태 변경
    UPDATE point_transactions 
    SET 
        status = 'cancelled',
        metadata = metadata || jsonb_build_object('rolled_back_by', v_rollback_txn_id, 'rollback_reason', p_admin_reason)
    WHERE transaction_id = p_transaction_id;

    RETURN v_rollback_txn_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. 포인트 잠금/해제 함수
-- ============================================

CREATE OR REPLACE FUNCTION lock_user_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT,
    p_related_table VARCHAR(50) DEFAULT NULL,
    p_related_id UUID DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_lock_id UUID;
    v_current_points INTEGER;
    v_current_locked INTEGER;
BEGIN
    -- 현재 포인트 및 잠금 포인트 조회
    SELECT current_points, locked_points 
    INTO v_current_points, v_current_locked
    FROM point_balances 
    WHERE user_id = p_user_id;

    -- 잠금 가능한 포인트 확인
    IF v_current_points < p_amount THEN
        RAISE EXCEPTION '잠금할 수 있는 포인트가 부족합니다. (사용 가능: %, 요청: %)', v_current_points, p_amount;
    END IF;

    -- 포인트 잠금 기록 생성
    INSERT INTO point_locks (
        user_id, locked_points, lock_reason, related_table, related_id, expires_at
    ) VALUES (
        p_user_id, p_amount, p_reason, p_related_table, p_related_id, p_expires_at
    ) RETURNING lock_id INTO v_lock_id;

    -- 포인트 잔액에서 잠금 포인트 차감 및 잠금 포인트 증가
    UPDATE point_balances 
    SET 
        current_points = current_points - p_amount,
        locked_points = locked_points + p_amount,
        last_updated = NOW()
    WHERE user_id = p_user_id;

    RETURN v_lock_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION release_point_lock(
    p_lock_id UUID,
    p_release_reason TEXT DEFAULT '잠금 해제'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_lock_record RECORD;
BEGIN
    -- 활성 잠금 조회
    SELECT * INTO v_lock_record 
    FROM point_locks 
    WHERE lock_id = p_lock_id AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION '활성 상태의 포인트 잠금을 찾을 수 없습니다: %', p_lock_id;
    END IF;

    -- 포인트 잠금 해제
    UPDATE point_balances 
    SET 
        current_points = current_points + v_lock_record.locked_points,
        locked_points = locked_points - v_lock_record.locked_points,
        last_updated = NOW()
    WHERE user_id = v_lock_record.user_id;

    -- 잠금 상태 변경
    UPDATE point_locks 
    SET 
        status = 'released',
        released_at = NOW()
    WHERE lock_id = p_lock_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. 포인트 감사 및 통계 함수
-- ============================================

-- 사용자별 일일 포인트 획득량 제한 확인
CREATE OR REPLACE FUNCTION check_daily_point_limit(
    p_user_id UUID,
    p_action_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_policy RECORD;
    v_today_earned INTEGER;
    v_today_count INTEGER;
BEGIN
    -- 정책 조회
    SELECT * INTO v_policy 
    FROM point_policies 
    WHERE action_type = p_action_type AND is_active = true;

    IF NOT FOUND THEN
        RETURN TRUE; -- 정책이 없으면 제한 없음
    END IF;

    -- 오늘 획득한 포인트 및 횟수 계산
    SELECT 
        COALESCE(SUM(amount), 0),
        COUNT(*)
    INTO v_today_earned, v_today_count
    FROM point_transactions 
    WHERE user_id = p_user_id 
      AND category = p_action_type
      AND DATE(created_at) = CURRENT_DATE
      AND amount > 0
      AND status = 'completed';

    -- 일일 제한 확인
    IF v_policy.daily_limit IS NOT NULL AND v_today_count >= v_policy.daily_limit THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 포인트 시스템 무결성 검사
CREATE OR REPLACE FUNCTION validate_point_integrity(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR(50),
    balance_points INTEGER,
    calculated_balance BIGINT,
    total_earned BIGINT,
    total_spent BIGINT,
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_user RECORD;
BEGIN
    -- 특정 사용자 또는 모든 사용자 검사
    FOR v_user IN 
        SELECT u.id, u.username, pb.current_points, pb.total_earned, pb.total_spent
        FROM users u
        LEFT JOIN point_balances pb ON u.id = pb.user_id
        WHERE (p_user_id IS NULL OR u.id = p_user_id)
    LOOP
        -- 트랜잭션 기반 계산된 잔액
        SELECT 
            COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as earned,
            COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0) as spent,
            COALESCE(SUM(amount), 0) as balance
        INTO 
            user_id, total_earned, total_spent, calculated_balance
        FROM point_transactions
        WHERE point_transactions.user_id = v_user.id 
          AND status = 'completed';

        -- 결과 반환
        RETURN QUERY SELECT
            v_user.id,
            v_user.username,
            COALESCE(v_user.current_points, 0),
            calculated_balance,
            COALESCE(v_user.total_earned, 0),
            COALESCE(v_user.total_spent, 0),
            (COALESCE(v_user.current_points, 0) = calculated_balance),
            CASE 
                WHEN COALESCE(v_user.current_points, 0) != calculated_balance 
                THEN format('잔액 불일치: DB=%s, 계산값=%s', COALESCE(v_user.current_points, 0), calculated_balance)
                ELSE NULL
            END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 자동 만료 처리 함수
-- ============================================

CREATE OR REPLACE FUNCTION expire_point_locks()
RETURNS INTEGER AS $$
DECLARE
    v_expired_count INTEGER;
    v_expired_lock RECORD;
BEGIN
    v_expired_count := 0;
    
    -- 만료된 포인트 잠금 처리
    FOR v_expired_lock IN 
        SELECT * FROM point_locks 
        WHERE status = 'active' 
          AND expires_at IS NOT NULL 
          AND expires_at < NOW()
    LOOP
        PERFORM release_point_lock(v_expired_lock.lock_id, '자동 만료');
        v_expired_count := v_expired_count + 1;
    END LOOP;

    RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. 포인트 통계 함수
-- ============================================

CREATE OR REPLACE FUNCTION get_point_statistics(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_earned BIGINT,
    total_spent BIGINT,
    total_users INTEGER,
    active_users INTEGER,
    top_earners JSONB,
    top_spenders JSONB,
    category_stats JSONB
) AS $$
DECLARE
    v_top_earners JSONB;
    v_top_spenders JSONB;
    v_category_stats JSONB;
BEGIN
    -- 상위 적립자
    SELECT jsonb_agg(
        jsonb_build_object(
            'username', u.username,
            'points', subq.earned
        )
    ) INTO v_top_earners
    FROM (
        SELECT user_id, SUM(amount) as earned
        FROM point_transactions pt
        WHERE amount > 0 
          AND DATE(created_at) BETWEEN p_start_date AND p_end_date
          AND status = 'completed'
        GROUP BY user_id
        ORDER BY earned DESC
        LIMIT 10
    ) subq
    JOIN users u ON u.id = subq.user_id;

    -- 상위 사용자
    SELECT jsonb_agg(
        jsonb_build_object(
            'username', u.username,
            'points', subq.spent
        )
    ) INTO v_top_spenders
    FROM (
        SELECT user_id, SUM(-amount) as spent
        FROM point_transactions pt
        WHERE amount < 0 
          AND DATE(created_at) BETWEEN p_start_date AND p_end_date
          AND status = 'completed'
        GROUP BY user_id
        ORDER BY spent DESC
        LIMIT 10
    ) subq
    JOIN users u ON u.id = subq.user_id;

    -- 카테고리별 통계
    SELECT jsonb_object_agg(category, stats) INTO v_category_stats
    FROM (
        SELECT 
            category,
            jsonb_build_object(
                'total_transactions', COUNT(*),
                'total_amount', SUM(amount),
                'avg_amount', AVG(amount)
            ) as stats
        FROM point_transactions
        WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
          AND status = 'completed'
        GROUP BY category
    ) cat_stats;

    RETURN QUERY
    SELECT
        COALESCE((SELECT SUM(amount) FROM point_transactions WHERE amount > 0 AND DATE(created_at) BETWEEN p_start_date AND p_end_date AND status = 'completed'), 0),
        COALESCE((SELECT SUM(-amount) FROM point_transactions WHERE amount < 0 AND DATE(created_at) BETWEEN p_start_date AND p_end_date AND status = 'completed'), 0),
        (SELECT COUNT(DISTINCT user_id) FROM point_balances)::INTEGER,
        (SELECT COUNT(DISTINCT user_id) FROM point_transactions WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date)::INTEGER,
        v_top_earners,
        v_top_spenders,
        v_category_stats;
END;
$$ LANGUAGE plpgsql;

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 포인트 시스템 보안 기능이 성공적으로 구축되었습니다.';
    RAISE NOTICE '   - 포인트 전송 (선물하기) 함수';
    RAISE NOTICE '   - 충전 처리 및 롤백 함수';
    RAISE NOTICE '   - 포인트 잠금/해제 시스템';
    RAISE NOTICE '   - 일일 한도 및 무결성 검사';
    RAISE NOTICE '   - 통계 및 감사 기능';
END $$;