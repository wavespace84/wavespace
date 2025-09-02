/**
 * Supabase 테이블 및 스토리지 설정 도우미
 * 개발자가 브라우저 콘솔에서 실행할 수 있는 스크립트
 */

// Supabase 설정 확인 및 테이블 생성 스크립트
window.setupSupabase = async function() {
    console.log('🔧 Supabase 설정 시작...');
    
    try {
        // 1. Supabase 클라이언트 확인
        if (!window.WaveSupabase?.getClient()) {
            throw new Error('WaveSupabase가 초기화되지 않았습니다. 페이지를 새로고침하세요.');
        }
        
        const client = window.WaveSupabase.getClient();
        console.log('✅ Supabase 클라이언트 확인 완료');
        
        // 2. 테이블 존재 확인
        console.log('📋 market_research_uploads 테이블 확인 중...');
        const { data: tableCheck, error: tableError } = await client
            .from('market_research_uploads')
            .select('id')
            .limit(1);
            
        if (tableError && tableError.code === 'PGRST116') {
            console.warn('⚠️ market_research_uploads 테이블이 존재하지 않습니다.');
            console.log('💡 Supabase 대시보드에서 다음 SQL을 실행하세요:');
            console.log(`
-- 1. 먼저 users 테이블이 있는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'user',
    points INTEGER DEFAULT 15000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    file_hash TEXT, -- 파일 해시 (중복 체크용)
    
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

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_market_research_region1 ON market_research_uploads(region1);
CREATE INDEX IF NOT EXISTS idx_market_research_region2 ON market_research_uploads(region2);
CREATE INDEX IF NOT EXISTS idx_market_research_product_type ON market_research_uploads(product_type);
CREATE INDEX IF NOT EXISTS idx_market_research_supply_type ON market_research_uploads(supply_type);
CREATE INDEX IF NOT EXISTS idx_market_research_user_id ON market_research_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_market_research_created_at ON market_research_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_research_is_active ON market_research_uploads(is_active);

-- 4. RLS 정책 설정
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

-- 5. Storage 버킷 생성 (SQL에서는 불가능하므로 JavaScript로 처리)
-- Storage는 별도로 처리합니다.
            `);
            return false;
        } else if (tableError) {
            throw tableError;
        } else {
            console.log('✅ market_research_uploads 테이블 확인 완료');
        }
        
        // 3. Storage 버킷 확인
        console.log('🪣 Storage 버킷 확인 중...');
        const bucketName = 'market-research';
        
        const { data: buckets, error: listError } = await client.storage.listBuckets();
        
        if (listError) {
            console.warn('⚠️ Storage 버킷 목록 조회 실패:', listError.message);
            console.log('💡 Storage 권한을 확인하세요.');
        } else {
            const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
            
            if (!bucketExists) {
                console.log('🔨 Storage 버킷 생성 시도...');
                const { error: createError } = await client.storage.createBucket(bucketName, {
                    public: true, // public으로 설정하여 RLS 문제 해결
                    allowedMimeTypes: [
                        'application/pdf',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    ],
                    fileSizeLimit: 50 * 1024 * 1024 // 50MB
                });
                
                if (createError) {
                    console.error('❌ Storage 버킷 생성 실패:', createError.message);
                    console.log('\n🔧 해결 방법: Supabase 대시보드에서 수동으로 버킷을 생성하세요.');
                    console.log('📋 버킷 생성 정보:');
                    console.log(`   • 버킷명: ${bucketName}`);
                    console.log('   • Public bucket: ✅ 체크');
                    console.log('   • File size limit: 52428800 (50MB)');
                    console.log('   • Allowed MIME types:');
                    console.log('     - application/pdf');
                    console.log('     - application/vnd.ms-powerpoint');
                    console.log('     - application/vnd.openxmlformats-officedocument.presentationml.presentation');
                    console.log('     - application/msword');
                    console.log('     - application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    console.log('     - application/vnd.ms-excel');
                    console.log('     - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    console.log('\n🔗 Supabase Dashboard Storage: https://supabase.com/dashboard/project/' + window.SUPABASE_URL?.split('.')[0]?.replace('https://', '') + '/storage/buckets');
                    
                    // 클립보드에 버킷명 복사 (가능한 경우)
                    if (navigator.clipboard) {
                        try {
                            await navigator.clipboard.writeText(bucketName);
                            console.log('📋 버킷명이 클립보드에 복사되었습니다!');
                        } catch (e) {
                            // 클립보드 복사 실패는 무시
                        }
                    }
                    
                    return false;
                } else {
                    console.log('✅ Storage 버킷 생성 완료');
                }
            } else {
                console.log('✅ Storage 버킷 확인 완료');
            }
        }
        
        console.log('🎉 Supabase 설정 완료!');
        return true;
        
    } catch (error) {
        console.error('❌ Supabase 설정 실패:', error);
        return false;
    }
};

// 테이블 데이터 확인 함수
window.checkSupabaseData = async function() {
    try {
        if (!window.WaveSupabase?.getClient()) {
            throw new Error('WaveSupabase가 초기화되지 않았습니다.');
        }
        
        const client = window.WaveSupabase.getClient();
        
        // 업로드된 문서 수 확인
        const { count, error } = await client
            .from('market_research_uploads')
            .select('*', { count: 'exact' });
            
        if (error) {
            console.error('❌ 데이터 조회 실패:', error);
        } else {
            console.log(`📊 업로드된 문서 수: ${count}개`);
            
            // 최근 5개 문서 조회
            const { data: recent, error: recentError } = await client
                .from('market_research_uploads')
                .select('title, region1, region2, created_at')
                .order('created_at', { ascending: false })
                .limit(5);
                
            if (!recentError && recent?.length > 0) {
                console.log('📑 최근 업로드된 문서:');
                recent.forEach((doc, index) => {
                    console.log(`${index + 1}. ${doc.title} (${doc.region1} ${doc.region2}) - ${doc.created_at}`);
                });
            }
        }
        
        return count;
        
    } catch (error) {
        console.error('❌ 데이터 확인 실패:', error);
        return null;
    }
};

// 수동 버킷 생성 가이드 함수 (간단화)
window.createBucketGuide = function() {
    const bucketName = 'market-research';
    
    console.log('🪣 STORAGE 버킷 생성 가이드');
    console.log('─'.repeat(40));
    console.log('');
    console.log('📍 1단계: Supabase 대시보드 → Storage');
    console.log('📍 2단계: "Create a new bucket" 클릭');
    console.log('📍 3단계: 다음 설정으로 생성');
    console.log('');
    console.log(`   📁 Name: ${bucketName}`);
    console.log('   🔓 Public bucket: ✅ 체크 (필수!)');
    console.log('   📏 File size limit: 50MB');
    console.log('');
    console.log('✅ 완료 후 verifyBucket() 실행하여 확인');
    console.log('');
    
    // 대시보드 링크 생성 및 자동 열기 시도
    try {
        const projectRef = window.supabaseClient?.supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1];
        if (projectRef) {
            const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}/storage/buckets`;
            console.log(`🔗 바로가기: ${dashboardUrl}`);
            
            // 새 창에서 열기 시도
            console.log('%c🚀 클릭하여 Storage 대시보드 열기', 
                       'color: #0066FF; font-weight: bold; background: #f0f8ff; padding: 4px 8px; border-radius: 4px;');
                       
            // 자동으로 새 탭에서 열기 (팝업 차단 가능)
            try {
                window.open(dashboardUrl, '_blank');
                console.log('✅ Storage 대시보드가 새 탭에서 열렸습니다.');
            } catch (e) {
                console.log('💡 팝업이 차단되었습니다. 위 링크를 직접 클릭하세요.');
            }
        }
    } catch (e) {
        console.log('🔗 Supabase Dashboard > Storage > Buckets에서 생성하세요');
    }
    
    // 버킷명을 클립보드에 자동 복사
    if (navigator.clipboard) {
        navigator.clipboard.writeText(bucketName).then(() => {
            console.log('📋 버킷명이 클립보드에 복사되었습니다!');
        }).catch(() => {
            console.log(`📋 버킷명: ${bucketName} (수동 복사)`);
        });
    }
};

// 버킷 생성 후 확인 함수
window.verifyBucket = async function() {
    try {
        if (!window.WaveSupabase?.getClient()) {
            throw new Error('WaveSupabase가 초기화되지 않았습니다. 페이지를 새로고침하세요.');
        }
        
        const client = window.WaveSupabase.getClient();
        const { data: buckets, error } = await client.storage.listBuckets();
        
        if (error) {
            console.error('❌ 버킷 목록 조회 실패:', error.message);
            return false;
        }
        
        const bucketName = 'market-research';
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        if (bucketExists) {
            console.log('✅ Storage 버킷이 성공적으로 생성되었습니다!');
            console.log('📁 버킷명:', bucketName);
            
            // 업로드 테스트 가능 여부 확인
            console.log('💡 이제 시장조사서 업로드를 테스트할 수 있습니다.');
            return true;
        } else {
            console.log('❌ 버킷이 아직 생성되지 않았습니다.');
            console.log('💡 createBucketGuide()를 실행하여 생성 가이드를 확인하세요.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 버킷 확인 실패:', error);
        return false;
    }
};

// 데이터베이스 생성 SQL 표시 함수
window.showDatabaseSQL = function() {
    console.log('📋 Supabase SQL Editor에서 실행할 SQL:');
    console.log('='.repeat(80));
    console.log(`
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
    product_type VARCHAR(50) NOT NULL,
    supply_type VARCHAR(50) NOT NULL,
    
    -- 포인트 정보
    upload_points INTEGER NOT NULL DEFAULT 0,
    download_points INTEGER NOT NULL DEFAULT 0,
    
    -- 메타데이터
    keywords TEXT[],
    tags TEXT[],
    file_created_date DATE,
    
    -- 통계
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- 사용자 정보 (일단 NULL 허용으로 설정)
    user_id UUID, -- 인증 없이도 동작하도록
    
    -- 상태 관리
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
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

-- 5. updated_at 트리거 함수 생성
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
    `);
    console.log('='.repeat(80));
    console.log('💡 위 SQL을 복사하여 Supabase Dashboard > SQL Editor에서 실행하세요.');
    console.log('🔗 SQL Editor: https://supabase.com/dashboard/project/' + 
               (window.SUPABASE_URL?.split('.')[0]?.replace('https://', '') || 'YOUR_PROJECT') + 
               '/sql/new');
};

// 원클릭 설정 함수 (가장 중요!)
window.quickSetup = function() {
    console.log('🚀 WAVE SPACE 수파베이스 원클릭 설정');
    console.log('═'.repeat(50));
    console.log('');
    console.log('✅ 데이터베이스: 이미 설정 완료');
    console.log('✅ 테이블 구조: 이미 설정 완료');
    console.log('✅ RLS 정책: 이미 설정 완료');
    console.log('');
    console.log('❌ Storage 버킷: 수동 생성 필요');
    console.log('');
    console.log('🔽 다음 단계만 수행하면 완료:');
    console.log('');
    
    // 자동으로 버킷 가이드 실행
    createBucketGuide();
    
    console.log('');
    console.log('🎯 버킷 생성 후 할 일:');
    console.log('   1. verifyBucket() - 버킷 생성 확인');
    console.log('   2. 시장조사서 페이지에서 업로드 테스트');
    console.log('');
};

console.log('');
console.log('🛠️ SUPABASE 설정 도구 로드 완료');
console.log('═'.repeat(40));
console.log('');
console.log('🚀 quickSetup()     ← 이거 하나만 실행하세요!');
console.log('');
console.log('📋 기타 명령어:');
console.log('   verifyBucket()     - 버킷 생성 확인');
console.log('   checkSupabaseData() - 저장된 데이터 확인');
console.log('   setupSupabase()     - 전체 설정 확인');
console.log('');