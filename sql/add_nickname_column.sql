-- users 테이블에 nickname 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- nickname에 대한 고유 인덱스 추가 (중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- 기존 사용자들의 nickname을 username으로 초기화 (임시)
UPDATE users SET nickname = username WHERE nickname IS NULL;

-- 이후에는 nickname을 NOT NULL로 설정
-- ALTER TABLE users ALTER COLUMN nickname SET NOT NULL;
-- 위 구문은 기존 데이터가 있을 경우를 고려해 나중에 실행

-- 닉네임 중복 체크를 위한 RPC 함수 생성
CREATE OR REPLACE FUNCTION check_nickname_exists(nickname_to_check VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM users WHERE nickname = nickname_to_check);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;