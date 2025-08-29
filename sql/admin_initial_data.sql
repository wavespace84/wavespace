-- 관리자 대시보드를 위한 초기 데이터 및 설정

-- 기본 시스템 설정값 삽입
INSERT INTO system_settings (key, value, description) VALUES
('site_title', 'WAVE SPACE', '사이트 제목'),
('allow_registration', 'true', '회원가입 허용 여부'),
('allow_guest_read', 'true', '게스트 읽기 권한'),
('daily_point_limit', '100', '일일 포인트 획득 제한'),
('points_post', '5', '게시글 작성시 획득 포인트'),
('points_comment', '2', '댓글 작성시 획득 포인트'),
('points_attendance', '1', '출석체크 획득 포인트'),
('points_like', '1', '좋아요 받을 때 획득 포인트'),
('enable_notifications', 'true', '실시간 알림 활성화'),
('enable_push', 'true', '푸시 알림 활성화'),
('enable_email', 'true', '이메일 알림 활성화'),
('max_file_size', '10', '최대 파일 업로드 크기 (MB)'),
('allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx,hwp', '허용 파일 확장자'),
('maintenance_mode', 'false', '점검 모드 활성화'),
('registration_approval', 'false', '회원가입 승인 필요')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- 관리자 계정 생성을 위한 함수 (개발용)
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email VARCHAR(255),
    admin_username VARCHAR(50),
    admin_password VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    result JSON;
BEGIN
    -- auth.users에 사용자 생성 (실제로는 Supabase Auth API로 해야 함)
    -- 여기서는 이미 생성된 사용자를 관리자로 승격하는 함수로 사용
    
    SELECT id INTO new_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF new_user_id IS NOT NULL THEN
        -- users 테이블에 관리자 정보 삽입/업데이트
        INSERT INTO users (
            id, username, email, role, is_active, points, level, created_at
        ) VALUES (
            new_user_id, admin_username, admin_email, 'admin', true, 1000, 10, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            is_active = true,
            updated_at = NOW();
        
        SELECT json_build_object(
            'success', true,
            'user_id', new_user_id,
            'message', '관리자 계정이 생성되었습니다.'
        ) INTO result;
    ELSE
        SELECT json_build_object(
            'success', false,
            'message', '해당 이메일의 사용자를 찾을 수 없습니다.'
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용 예시 주석:
-- SELECT create_admin_user('admin@wavespace.co.kr', 'admin', 'password123');

-- 권한 부여
GRANT EXECUTE ON FUNCTION create_admin_user TO authenticated;