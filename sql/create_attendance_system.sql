-- WAVE SPACE 출석체크 시스템
-- 출석 기록, 연속출석 보너스, 미션 시스템
-- 작성일: 2025-01-XX

-- ============================================
-- 1. 출석 기록 테이블 (현재 테이블 대체)
-- ============================================

-- 기존 attendance 테이블 삭제 후 새로 생성
DROP TABLE IF EXISTS attendance CASCADE;

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    
    -- 연속 출석 정보
    consecutive_days INTEGER NOT NULL DEFAULT 1 CHECK (consecutive_days >= 1),
    total_attendance INTEGER NOT NULL DEFAULT 1 CHECK (total_attendance >= 1),
    
    -- 획득 포인트
    base_points INTEGER NOT NULL DEFAULT 0 CHECK (base_points >= 0),
    bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
    total_points INTEGER GENERATED ALWAYS AS (base_points + bonus_points) STORED,
    
    -- 출석체크 시간
    check_time TIME DEFAULT EXTRACT(time FROM NOW()),
    
    -- 출석체크 방법
    check_method VARCHAR(20) DEFAULT 'web' CHECK (check_method IN ('web', 'mobile', 'api')),
    
    -- 특별 보너스 정보
    special_bonus JSONB DEFAULT '{}'::jsonb,
    
    -- IP 추적 (중복 체크용)
    ip_address INET,
    user_agent TEXT,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 사용자별 날짜 중복 방지
    UNIQUE(user_id, check_date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_check_date ON attendance_records(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_records_consecutive ON attendance_records(consecutive_days DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_records_created_at ON attendance_records(created_at DESC);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_records(user_id, check_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_user_consecutive ON attendance_records(user_id, consecutive_days DESC);

-- RLS 정책
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 출석 기록만 조회 가능" ON attendance_records 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 출석만 기록 가능" ON attendance_records 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "관리자는 모든 출석 기록 접근 가능" ON attendance_records 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 2. 출석 보상 정책 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_rewards (
    id SERIAL PRIMARY KEY,
    consecutive_days INTEGER NOT NULL UNIQUE CHECK (consecutive_days >= 1),
    base_points INTEGER NOT NULL DEFAULT 0 CHECK (base_points >= 0),
    bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
    special_reward_type VARCHAR(50), -- badge, item, multiplier 등
    special_reward_data JSONB DEFAULT '{}'::jsonb,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_attendance_rewards_consecutive ON attendance_rewards(consecutive_days);
CREATE INDEX IF NOT EXISTS idx_attendance_rewards_is_active ON attendance_rewards(is_active);

-- RLS 정책
ALTER TABLE attendance_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 활성 출석 보상 정책 조회 가능" ON attendance_rewards 
    FOR SELECT USING (is_active = true);

CREATE POLICY "관리자만 출석 보상 정책 관리 가능" ON attendance_rewards 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 3. 출석 통계 테이블 (월별 집계)
-- ============================================

CREATE TABLE IF NOT EXISTS attendance_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    
    -- 월별 출석 통계
    total_attendance_days INTEGER NOT NULL DEFAULT 0 CHECK (total_attendance_days >= 0),
    max_consecutive_days INTEGER NOT NULL DEFAULT 0 CHECK (max_consecutive_days >= 0),
    total_points_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_points_earned >= 0),
    
    -- 특별 달성
    perfect_month BOOLEAN DEFAULT FALSE, -- 한 달 개근
    
    -- 업데이트 시간
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, year, month)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_attendance_statistics_user_id ON attendance_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_statistics_year_month ON attendance_statistics(year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_statistics_max_consecutive ON attendance_statistics(max_consecutive_days DESC);

-- RLS 정책
ALTER TABLE attendance_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 출석 통계만 조회 가능" ON attendance_statistics 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "관리자는 모든 출석 통계 접근 가능" ON attendance_statistics 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    );

-- ============================================
-- 4. 출석체크 핵심 함수
-- ============================================

-- 출석체크 메인 함수
CREATE OR REPLACE FUNCTION process_daily_attendance(p_user_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    attendance_id UUID,
    consecutive_days INTEGER,
    points_earned INTEGER,
    special_rewards JSONB
) AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    v_attendance_id UUID;
    v_consecutive_days INTEGER;
    v_base_points INTEGER := 50; -- 기본 출석 포인트
    v_bonus_points INTEGER := 0;
    v_total_points INTEGER;
    v_yesterday_record RECORD;
    v_reward_policy RECORD;
    v_special_rewards JSONB := '{}'::jsonb;
    v_transaction_id UUID;
BEGIN
    -- 이미 오늘 출석했는지 확인
    IF EXISTS (
        SELECT 1 FROM attendance_records 
        WHERE user_id = p_user_id AND check_date = v_today
    ) THEN
        RETURN QUERY SELECT 
            false, 
            '이미 오늘 출석체크를 완료했습니다.'::TEXT,
            NULL::UUID,
            NULL::INTEGER,
            NULL::INTEGER,
            NULL::JSONB;
        RETURN;
    END IF;

    -- 어제 출석 기록 확인
    SELECT consecutive_days, total_attendance
    INTO v_yesterday_record
    FROM attendance_records 
    WHERE user_id = p_user_id AND check_date = v_yesterday;

    -- 연속 출석일 계산
    IF v_yesterday_record IS NOT NULL THEN
        v_consecutive_days := v_yesterday_record.consecutive_days + 1;
    ELSE
        v_consecutive_days := 1;
    END IF;

    -- 보상 정책 조회
    SELECT base_points, bonus_points, special_reward_type, special_reward_data
    INTO v_reward_policy
    FROM attendance_rewards 
    WHERE consecutive_days = v_consecutive_days AND is_active = true;

    -- 보너스 포인트 적용
    IF v_reward_policy IS NOT NULL THEN
        v_base_points := COALESCE(v_reward_policy.base_points, v_base_points);
        v_bonus_points := COALESCE(v_reward_policy.bonus_points, 0);
        
        -- 특별 보상 처리
        IF v_reward_policy.special_reward_type IS NOT NULL THEN
            v_special_rewards := jsonb_build_object(
                'type', v_reward_policy.special_reward_type,
                'data', v_reward_policy.special_reward_data
            );
        END IF;
    END IF;

    -- 연속출석 기본 보너스 (정책 테이블에 없는 경우)
    IF v_reward_policy IS NULL THEN
        CASE 
            WHEN v_consecutive_days >= 30 THEN v_bonus_points := 500;
            WHEN v_consecutive_days >= 14 THEN v_bonus_points := 200;
            WHEN v_consecutive_days >= 7 THEN v_bonus_points := 100;
            WHEN v_consecutive_days >= 3 THEN v_bonus_points := 20;
            ELSE v_bonus_points := 0;
        END CASE;
    END IF;

    v_total_points := v_base_points + v_bonus_points;

    -- 출석 기록 생성
    INSERT INTO attendance_records (
        user_id, check_date, consecutive_days, 
        base_points, bonus_points,
        check_method, special_bonus,
        ip_address
    ) VALUES (
        p_user_id, v_today, v_consecutive_days,
        v_base_points, v_bonus_points,
        'web', v_special_rewards,
        inet_client_addr()
    ) RETURNING id INTO v_attendance_id;

    -- 포인트 적립
    v_transaction_id := safe_earn_points(
        p_user_id,
        v_total_points,
        'attendance',
        format('출석체크 (%s일 연속)', v_consecutive_days),
        'attendance_records',
        v_attendance_id,
        jsonb_build_object(
            'consecutive_days', v_consecutive_days,
            'base_points', v_base_points,
            'bonus_points', v_bonus_points
        )
    );

    -- 사용자 테이블의 출석 카운트 업데이트
    UPDATE users 
    SET attendance_count = attendance_count + 1
    WHERE id = p_user_id;

    -- 특별 보상 처리 (뱃지 지급 등)
    PERFORM process_attendance_special_rewards(p_user_id, v_consecutive_days, v_special_rewards);

    -- 월별 통계 업데이트
    PERFORM update_monthly_attendance_stats(p_user_id, v_today);

    RETURN QUERY SELECT 
        true,
        format('출석체크 완료! %s일 연속 출석으로 %sP를 획득했습니다.', v_consecutive_days, v_total_points)::TEXT,
        v_attendance_id,
        v_consecutive_days,
        v_total_points,
        v_special_rewards;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. 출석 통계 및 보조 함수들
-- ============================================

-- 월별 출석 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_monthly_attendance_stats(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
DECLARE
    v_year INTEGER := EXTRACT(year FROM p_date);
    v_month INTEGER := EXTRACT(month FROM p_date);
    v_month_start DATE := DATE_TRUNC('month', p_date)::DATE;
    v_month_end DATE := (DATE_TRUNC('month', p_date) + INTERVAL '1 month - 1 day')::DATE;
    v_stats RECORD;
BEGIN
    -- 이번 달 통계 계산
    SELECT 
        COUNT(*) as total_days,
        MAX(consecutive_days) as max_consecutive,
        SUM(total_points) as total_points
    INTO v_stats
    FROM attendance_records 
    WHERE user_id = p_user_id 
      AND check_date BETWEEN v_month_start AND v_month_end;

    -- 통계 테이블 업데이트 또는 삽입
    INSERT INTO attendance_statistics (
        user_id, year, month, total_attendance_days, 
        max_consecutive_days, total_points_earned,
        perfect_month, last_updated
    ) VALUES (
        p_user_id, v_year, v_month, v_stats.total_days,
        COALESCE(v_stats.max_consecutive, 0), COALESCE(v_stats.total_points, 0),
        (v_stats.total_days = EXTRACT(day FROM v_month_end)), -- 완벽한 한 달인지 체크
        NOW()
    )
    ON CONFLICT (user_id, year, month) 
    DO UPDATE SET
        total_attendance_days = EXCLUDED.total_attendance_days,
        max_consecutive_days = EXCLUDED.max_consecutive_days,
        total_points_earned = EXCLUDED.total_points_earned,
        perfect_month = EXCLUDED.perfect_month,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- 특별 보상 처리 함수
CREATE OR REPLACE FUNCTION process_attendance_special_rewards(
    p_user_id UUID,
    p_consecutive_days INTEGER,
    p_special_rewards JSONB
)
RETURNS VOID AS $$
DECLARE
    v_reward_type TEXT;
    v_reward_data JSONB;
BEGIN
    -- 특별 보상이 있는 경우 처리
    IF p_special_rewards != '{}'::jsonb THEN
        v_reward_type := p_special_rewards->>'type';
        v_reward_data := p_special_rewards->'data';
        
        CASE v_reward_type
            WHEN 'badge' THEN
                -- 뱃지 지급 (badges 테이블과 연동 필요)
                INSERT INTO user_badges (user_id, badge_id, earned_at)
                SELECT p_user_id, (v_reward_data->>'badge_id')::INTEGER, NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_badges 
                    WHERE user_id = p_user_id AND badge_id = (v_reward_data->>'badge_id')::INTEGER
                );
                
            WHEN 'multiplier' THEN
                -- 포인트 배율 적용 (별도 처리 로직)
                NULL; -- 추후 구현
                
            WHEN 'item' THEN
                -- 아이템 지급 (별도 처리 로직)
                NULL; -- 추후 구현
        END CASE;
    END IF;

    -- 기본 마일스톤 뱃지 처리
    CASE p_consecutive_days
        WHEN 7 THEN
            -- 7일 연속 출석 뱃지
            INSERT INTO user_badges (user_id, badge_id, earned_at)
            SELECT p_user_id, (SELECT id FROM badges WHERE name = '출석왕 1주' LIMIT 1), NOW()
            WHERE EXISTS (SELECT 1 FROM badges WHERE name = '출석왕 1주')
              AND NOT EXISTS (
                  SELECT 1 FROM user_badges ub 
                  JOIN badges b ON ub.badge_id = b.id 
                  WHERE ub.user_id = p_user_id AND b.name = '출석왕 1주'
              );
              
        WHEN 30 THEN
            -- 30일 연속 출석 뱃지
            INSERT INTO user_badges (user_id, badge_id, earned_at)
            SELECT p_user_id, (SELECT id FROM badges WHERE name = '출석왕 1달' LIMIT 1), NOW()
            WHERE EXISTS (SELECT 1 FROM badges WHERE name = '출석왕 1달')
              AND NOT EXISTS (
                  SELECT 1 FROM user_badges ub 
                  JOIN badges b ON ub.badge_id = b.id 
                  WHERE ub.user_id = p_user_id AND b.name = '출석왕 1달'
              );
              
        WHEN 100 THEN
            -- 100일 연속 출석 뱃지
            INSERT INTO user_badges (user_id, badge_id, earned_at)
            SELECT p_user_id, (SELECT id FROM badges WHERE name = '출석왕 100일' LIMIT 1), NOW()
            WHERE EXISTS (SELECT 1 FROM badges WHERE name = '출석왕 100일')
              AND NOT EXISTS (
                  SELECT 1 FROM user_badges ub 
                  JOIN badges b ON ub.badge_id = b.id 
                  WHERE ub.user_id = p_user_id AND b.name = '출석왕 100일'
              );
        ELSE
            NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 사용자 출석 현황 조회 함수
CREATE OR REPLACE FUNCTION get_user_attendance_status(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE),
    p_month INTEGER DEFAULT EXTRACT(month FROM CURRENT_DATE)
)
RETURNS TABLE (
    current_consecutive INTEGER,
    total_this_month INTEGER,
    points_this_month INTEGER,
    last_attendance DATE,
    can_check_today BOOLEAN,
    next_reward_days INTEGER,
    next_reward_points INTEGER,
    monthly_calendar JSONB
) AS $$
DECLARE
    v_month_start DATE := make_date(p_year, p_month, 1);
    v_month_end DATE := (DATE_TRUNC('month', make_date(p_year, p_month, 1)) + INTERVAL '1 month - 1 day')::DATE;
    v_current_consecutive INTEGER := 0;
    v_total_this_month INTEGER := 0;
    v_points_this_month INTEGER := 0;
    v_last_attendance DATE;
    v_can_check_today BOOLEAN;
    v_next_reward RECORD;
    v_calendar JSONB;
BEGIN
    -- 현재 연속 출석일 조회
    SELECT consecutive_days, check_date 
    INTO v_current_consecutive, v_last_attendance
    FROM attendance_records 
    WHERE user_id = p_user_id 
    ORDER BY check_date DESC 
    LIMIT 1;

    -- 연속성 확인 (어제까지 연속이어야 함)
    IF v_last_attendance IS NULL OR v_last_attendance < CURRENT_DATE - INTERVAL '1 day' THEN
        v_current_consecutive := 0;
    END IF;

    -- 이번 달 출석 통계
    SELECT 
        COUNT(*)::INTEGER, 
        SUM(total_points)::INTEGER
    INTO v_total_this_month, v_points_this_month
    FROM attendance_records 
    WHERE user_id = p_user_id 
      AND check_date BETWEEN v_month_start AND v_month_end;

    -- 오늘 출석 가능 여부
    v_can_check_today := NOT EXISTS (
        SELECT 1 FROM attendance_records 
        WHERE user_id = p_user_id AND check_date = CURRENT_DATE
    );

    -- 다음 보상까지 남은 일수
    SELECT consecutive_days, (base_points + bonus_points)
    INTO v_next_reward
    FROM attendance_rewards 
    WHERE consecutive_days > COALESCE(v_current_consecutive, 0) 
      AND is_active = true
    ORDER BY consecutive_days ASC 
    LIMIT 1;

    -- 월별 출석 캘린더 생성
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', check_date,
            'consecutive_days', consecutive_days,
            'points', total_points,
            'has_bonus', bonus_points > 0
        )
    ) INTO v_calendar
    FROM attendance_records 
    WHERE user_id = p_user_id 
      AND check_date BETWEEN v_month_start AND v_month_end
    ORDER BY check_date;

    RETURN QUERY SELECT
        COALESCE(v_current_consecutive, 0),
        COALESCE(v_total_this_month, 0),
        COALESCE(v_points_this_month, 0),
        v_last_attendance,
        v_can_check_today,
        COALESCE(v_next_reward.consecutive_days - COALESCE(v_current_consecutive, 0), NULL),
        COALESCE(v_next_reward.base_points + v_next_reward.bonus_points, NULL),
        COALESCE(v_calendar, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. 초기 출석 보상 정책 데이터
-- ============================================

INSERT INTO attendance_rewards (consecutive_days, base_points, bonus_points, description, special_reward_type, special_reward_data) VALUES
(1, 50, 0, '첫 출석', NULL, NULL),
(3, 50, 20, '3일 연속 출석 보너스', NULL, NULL),
(7, 50, 100, '일주일 연속 출석', 'badge', '{"badge_id": 1}'),
(14, 50, 200, '2주 연속 출석', NULL, NULL),
(21, 50, 300, '3주 연속 출석', NULL, NULL),
(30, 50, 500, '한달 연속 출석', 'badge', '{"badge_id": 2}'),
(50, 50, 800, '50일 연속 출석', NULL, NULL),
(100, 50, 1500, '100일 연속 출석', 'badge', '{"badge_id": 3}'),
(200, 50, 3000, '200일 연속 출석', 'badge', '{"badge_id": 4}'),
(365, 50, 10000, '1년 연속 출석', 'badge', '{"badge_id": 5}')
ON CONFLICT (consecutive_days) DO NOTHING;

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 출석체크 시스템이 성공적으로 구축되었습니다.';
    RAISE NOTICE '   - attendance_records: 출석 기록 관리';
    RAISE NOTICE '   - attendance_rewards: 출석 보상 정책';
    RAISE NOTICE '   - attendance_statistics: 월별 출석 통계';
    RAISE NOTICE '   - process_daily_attendance: 출석체크 메인 함수';
    RAISE NOTICE '   - get_user_attendance_status: 출석 현황 조회';
    RAISE NOTICE '   - 연속출석 보너스: 3일(+20P), 7일(+100P), 30일(+500P)';
    RAISE NOTICE '   - 뱃지 시스템 연동: 마일스톤 달성시 자동 지급';
END $$;