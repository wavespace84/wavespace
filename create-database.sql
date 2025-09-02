-- WAVE SPACE - Supabase 데이터베이스 설정
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. users 테이블 생성 (없을 경우)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'user',
    points INTEGER DEFAULT 15000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. market_research_uploads 테이블 생성
CREATE TABLE IF NOT EXISTS market_research_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    
    -- 파일 정보
    file_url TEXT, -- Storage에 저장된 파일 URL (선택사항)
    file_size BIGINT NOT NULL, -- 파일 크기 (bytes)
    file_type VARCHAR(50) DEFAULT '시장조사서', -- 파일 타입
    original_filename TEXT, -- 원본 파일명
    page_count INTEGER DEFAULT 0, -- 페이지 수
    thumbnail_url TEXT, -- 썸네일 URL (선택사항)
    file_hash TEXT, -- 파일 해시 (중복 체크용)
    
    -- 지역 정보
    region1 VARCHAR(50) NOT NULL, -- 광역시도
    region2 VARCHAR(100) NOT NULL, -- 시군구
    full_location VARCHAR(200) NOT NULL, -- 전체 주소 텍스트
    
    -- 상품 정보
    product_type VARCHAR(50) NOT NULL, -- apartment, officetel-profit, commercial 등
    supply_type VARCHAR(50) NOT NULL, -- private-sale, public-sale, private-rental 등
    
    -- 포인트 정보
    upload_points INTEGER NOT NULL DEFAULT 0, -- 업로드로 얻은 포인트
    download_points INTEGER NOT NULL DEFAULT 0, -- 다운로드 필요 포인트
    
    -- 메타데이터
    keywords TEXT[], -- 키워드 배열
    tags TEXT[], -- 태그 배열
    file_created_date DATE, -- 파일 생성일 (사용자 입력)
    
    -- 통계
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- 사용자 정보 (일단 NULL 허용으로 설정)
    user_id UUID, -- REFERENCES users(id) ON DELETE CASCADE, -- 인증 없이도 동작하도록
    
    -- 상태 관리
    is_verified BOOLEAN DEFAULT FALSE, -- 관리자 검증 여부
    is_active BOOLEAN DEFAULT TRUE, -- 활성 상태
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_market_research_region1 ON market_research_uploads(region1);
CREATE INDEX IF NOT EXISTS idx_market_research_region2 ON market_research_uploads(region2);
CREATE INDEX IF NOT EXISTS idx_market_research_product_type ON market_research_uploads(product_type);
CREATE INDEX IF NOT EXISTS idx_market_research_supply_type ON market_research_uploads(supply_type);
CREATE INDEX IF NOT EXISTS idx_market_research_user_id ON market_research_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_market_research_created_at ON market_research_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_research_is_active ON market_research_uploads(is_active);
CREATE INDEX IF NOT EXISTS idx_market_research_file_hash ON market_research_uploads(file_hash);

-- 4. RLS 정책 설정
ALTER TABLE market_research_uploads ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 검증된 문서를 조회 가능
CREATE POLICY "Anyone can view active verified documents" ON market_research_uploads
    FOR SELECT USING (is_active = true AND is_verified = true);

-- 익명 사용자도 문서를 업로드할 수 있도록 (임시)
CREATE POLICY "Anyone can insert documents" ON market_research_uploads
    FOR INSERT WITH CHECK (true);

-- 익명 사용자도 자신이 업로드한 문서를 조회할 수 있도록 (임시)
CREATE POLICY "Anyone can view documents" ON market_research_uploads
    FOR SELECT USING (true);

-- 5. updated_at 트리거 함수 생성 (이미 있다면 스킵)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_market_research_uploads_updated_at ON market_research_uploads;
CREATE TRIGGER update_market_research_uploads_updated_at 
    BEFORE UPDATE ON market_research_uploads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- users 테이블에도 updated_at 트리거 추가
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 테스트 데이터 삽입 (선택사항)
INSERT INTO users (id, email, name, role, points) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'test@example.com', '테스트 사용자', 'planning', 15000)
ON CONFLICT (email) DO NOTHING;

-- 성공 메시지
DO $$ 
BEGIN 
    RAISE NOTICE '✅ WAVE SPACE 데이터베이스 설정 완료!';
    RAISE NOTICE '📋 테이블 생성: users, market_research_uploads';
    RAISE NOTICE '🔒 RLS 정책 설정 완료';
    RAISE NOTICE '📝 다음 단계: Storage 버킷을 수동으로 생성하세요';
    RAISE NOTICE '   버킷명: market-research';
    RAISE NOTICE '   설정: Public = true, File size limit = 50MB';
END $$;