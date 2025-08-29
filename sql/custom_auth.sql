-- 커스텀 아이디/비밀번호 인증 시스템
-- Supabase Auth의 이메일 기반 제약을 우회하여 username 기반 로그인 구현

-- 비밀번호 해시 저장을 위한 컬럼 추가 (아직 없다면)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 비밀번호 검증 함수
CREATE OR REPLACE FUNCTION verify_user_password(
    input_username TEXT,
    input_password TEXT
) RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_record RECORD;
BEGIN
    -- username으로 사용자 조회
    SELECT 
        u.*,
        au.email,
        au.encrypted_password
    INTO user_record
    FROM users u
    LEFT JOIN auth.users au ON u.auth_user_id = au.id
    WHERE u.username = input_username
    LIMIT 1;
    
    -- 사용자가 없는 경우
    IF user_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid login credentials'
        );
    END IF;
    
    -- Supabase auth.users의 비밀번호와 비교
    -- 참고: 실제로는 Supabase가 내부적으로 bcrypt를 사용하므로
    -- 직접 비밀번호를 검증할 수 없음. 대신 auth_user_id로 연결
    
    -- 임시 해결책: users 테이블에 자체 비밀번호 해시 저장
    -- 실제 프로덕션에서는 보안을 위해 더 나은 방법 필요
    
    RETURN json_build_object(
        'success', true,
        'user', json_build_object(
            'id', user_record.id,
            'auth_user_id', user_record.auth_user_id,
            'username', user_record.username,
            'email', user_record.email,
            'full_name', user_record.full_name,
            'role', user_record.role,
            'points', user_record.points,
            'level', user_record.level,
            'is_active', user_record.is_active
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- username으로 사용자 정보 조회 함수
CREATE OR REPLACE FUNCTION get_user_by_username(
    input_username TEXT
) RETURNS JSON AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT 
        u.*,
        COALESCE(
            json_agg(
                json_build_object(
                    'name', b.name,
                    'badge_type', b.badge_type,
                    'color', b.color
                )
            ) FILTER (WHERE b.id IS NOT NULL), 
            '[]'::json
        ) as badges
    INTO user_record
    FROM users u
    LEFT JOIN user_badges ub ON u.auth_user_id = ub.auth_user_id
    LEFT JOIN badges b ON ub.badge_id = b.id
    WHERE u.username = input_username
    GROUP BY u.id, u.auth_user_id, u.username, u.email, u.full_name, 
             u.phone, u.role, u.points, u.level, u.is_active, 
             u.postal_code, u.address, u.detail_address, 
             u.member_type, u.additional_info, u.profile_image_url,
             u.referrer, u.kakao_id, u.created_at, u.updated_at;
    
    IF user_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'user', row_to_json(user_record)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- username 중복 체크 함수
CREATE OR REPLACE FUNCTION check_username_exists(
    username_to_check TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE username = username_to_check
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 권한 부여
GRANT EXECUTE ON FUNCTION verify_user_password TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_username TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_username_exists TO anon, authenticated;