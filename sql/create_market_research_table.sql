-- 시장조사서 업로드 테이블 생성
-- market_research_uploads 테이블

CREATE TABLE IF NOT EXISTS market_research_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    
    -- 파일 정보
    file_url TEXT, -- Storage에 저장된 파일 URL (선택사항)
    file_size BIGINT NOT NULL, -- 파일 크기 (bytes)
    file_type VARCHAR(50) DEFAULT 'PDF', -- 파일 타입
    original_filename TEXT, -- 원본 파일명
    page_count INTEGER DEFAULT 0, -- 페이지 수
    thumbnail_url TEXT, -- 썸네일 URL (선택사항)
    
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
    
    -- 사용자 정보
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 상태 관리
    is_verified BOOLEAN DEFAULT FALSE, -- 관리자 검증 여부
    is_active BOOLEAN DEFAULT TRUE, -- 활성 상태
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_market_research_region1 ON market_research_uploads(region1);
CREATE INDEX IF NOT EXISTS idx_market_research_region2 ON market_research_uploads(region2);
CREATE INDEX IF NOT EXISTS idx_market_research_product_type ON market_research_uploads(product_type);
CREATE INDEX IF NOT EXISTS idx_market_research_supply_type ON market_research_uploads(supply_type);
CREATE INDEX IF NOT EXISTS idx_market_research_user_id ON market_research_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_market_research_created_at ON market_research_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_research_is_active ON market_research_uploads(is_active);

-- RLS 정책 설정
ALTER TABLE market_research_uploads ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 검증된 문서를 조회 가능
CREATE POLICY "Anyone can view active verified documents" ON market_research_uploads
    FOR SELECT USING (is_active = true AND is_verified = true);

-- 로그인한 사용자는 자신의 문서를 조회 가능
CREATE POLICY "Users can view their own documents" ON market_research_uploads
    FOR SELECT USING (auth.uid() = user_id);

-- 로그인한 사용자는 문서 업로드 가능
CREATE POLICY "Users can insert documents" ON market_research_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 문서를 수정 가능
CREATE POLICY "Users can update their own documents" ON market_research_uploads
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 문서를 삭제 가능
CREATE POLICY "Users can delete their own documents" ON market_research_uploads
    FOR DELETE USING (auth.uid() = user_id);

-- updated_at 트리거 함수 생성 (이미 있다면 스킵)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_market_research_uploads_updated_at 
    BEFORE UPDATE ON market_research_uploads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();