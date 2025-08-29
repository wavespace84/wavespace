-- 공지사항 테이블 생성
-- WAVE SPACE 공지사항 시스템용

CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT '공지', -- 공지, 이벤트, 점검, 가이드 등
    team VARCHAR(100) DEFAULT '운영팀',
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE, -- 상단 고정 여부
    is_new BOOLEAN DEFAULT TRUE, -- 새글 표시 여부 (7일)
    is_active BOOLEAN DEFAULT TRUE, -- 게시글 활성화 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices(is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active);

-- RLS (Row Level Security) 정책
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 공지사항을 볼 수 있음
CREATE POLICY "Everyone can view notices" ON notices
    FOR SELECT USING (is_active = true);

-- 관리자만 공지사항을 작성/수정/삭제할 수 있음
CREATE POLICY "Only admins can insert notices" ON notices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Only admins can update notices" ON notices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Only admins can delete notices" ON notices
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'staff')
        )
    );

-- 조회수 업데이트 함수
CREATE OR REPLACE FUNCTION increment_notice_view_count(notice_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE notices 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = notice_id;
END;
$$ LANGUAGE plpgsql;

-- 새글 상태 자동 업데이트 함수 (7일 후 is_new를 false로)
CREATE OR REPLACE FUNCTION update_notice_new_status()
RETURNS void AS $$
BEGIN
    UPDATE notices 
    SET is_new = false,
        updated_at = NOW()
    WHERE is_new = true 
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 댓글 (필요한 경우)
COMMENT ON TABLE notices IS '공지사항 테이블 - WAVE SPACE 플랫폼의 모든 공지사항을 관리';
COMMENT ON COLUMN notices.id IS '공지사항 고유 ID (UUID)';
COMMENT ON COLUMN notices.title IS '공지사항 제목';
COMMENT ON COLUMN notices.content IS '공지사항 내용 (HTML 지원)';
COMMENT ON COLUMN notices.category IS '카테고리 (공지, 이벤트, 점검, 가이드)';
COMMENT ON COLUMN notices.team IS '작성 부서/팀';
COMMENT ON COLUMN notices.view_count IS '조회수';
COMMENT ON COLUMN notices.author_id IS '작성자 ID (users 테이블 참조)';
COMMENT ON COLUMN notices.is_pinned IS '상단 고정 여부';
COMMENT ON COLUMN notices.is_new IS '새글 표시 여부 (7일간)';
COMMENT ON COLUMN notices.is_active IS '게시글 활성화 여부';