/**
 * WAVE SPACE - Supabase Configuration
 * Supabase 데이터베이스 연결 및 초기화
 */

// Supabase 클라이언트 라이브러리 CDN 동적 로딩 (필요시에만)
if (typeof supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.defer = true;
    script.onload = () => {
        console.log('✅ Supabase CDN 동적 로딩 완료');
    };
    script.onerror = (error) => {
        console.error('❌ Supabase CDN 로딩 실패:', error);
    };
    document.head.appendChild(script);
}

// 환경변수 가져오기 (index.html에서 설정해야 함)
const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || 'https://sishloxzcqapontycuyz.supabase.co',
    anonKey: window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpc2hsb3h6Y3FhcG9udHljdXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTA2MzAsImV4cCI6MjA3MDEyNjYzMH0.23aVcOSXDSvCi7yRtnCumy9knjIkL_mTAudSyubANZs'
};

// 환경변수 검증
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
    console.warn('💡 index.html에 다음 스크립트를 추가하세요:');
    console.warn(`
<script>
    // 환경변수 설정 (배포 시 실제 값으로 교체)
    window.SUPABASE_URL = 'your-supabase-url';
    window.SUPABASE_ANON_KEY = 'your-anon-key';
</script>
    `);
}

// Supabase 클라이언트 초기화
let supabaseClient;
let supabaseInitPromise; // 초기화 Promise

/**
 * Supabase 클라이언트 초기화
 */
async function initSupabase() {
    try {
        // Supabase 라이브러리가 로드될 때까지 대기 (최대 10초)
        let attempts = 0;
        const maxAttempts = 100; // 10초 대기
        
        while (typeof supabase === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase 라이브러리 로딩 시간 초과 (10초)');
        }
        
        // 클라이언트 생성
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        
        console.log('✅ Supabase 연결 성공');
        
        // 연결 테스트는 필요 시에만 활성화 (기본적으로 비활성화)
        if (window.location.search.includes('debug=true')) {
            try {
                const { data, error } = await supabaseClient.from('users').select('count').limit(1);
                if (!error) {
                    console.log('✅ 데이터베이스 연결 테스트 완료');
                } else {
                    console.debug('데이터베이스 테스트:', error.message);
                }
            } catch (testError) {
                console.debug('데이터베이스 테스트:', testError.message);
            }
        }
        
        return supabaseClient;
    } catch (error) {
        console.error('❌ Supabase 연결 실패:', error);
        
        // 사용자에게 친화적인 에러 메시지 표시
        if (error.message.includes('시간 초과')) {
            console.error('💡 해결 방안: 페이지를 새로고침하거나 인터넷 연결을 확인하세요.');
        }
        
        throw error;
    }
}

/**
 * Supabase 클라이언트 반환
 */
function getSupabaseClient() {
    if (!supabaseClient) {
        throw new Error('Supabase가 초기화되지 않았습니다. initSupabase()를 먼저 호출하세요.');
    }
    return supabaseClient;
}

/**
 * 연결 상태 확인
 */
async function checkConnection() {
    try {
        const client = getSupabaseClient();
        
        // 디버그 모드에서만 실제 테스트 수행
        if (window.location.search.includes('debug=true')) {
            const { data, error } = await client.from('users').select('count').limit(1);
            
            if (error) {
                console.debug('연결 테스트:', error.message);
                return false;
            }
            
            console.log('✅ 데이터베이스 연결 확인');
        }
        
        return true;
    } catch (error) {
        console.debug('연결 확인:', error.message);
        return false;
    }
}

/**
 * 현재 사용자 정보 가져오기
 */
async function getCurrentUser() {
    try {
        const client = getSupabaseClient();
        const { data: { user } } = await client.auth.getUser();
        return user;
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        return null;
    }
}

/**
 * 인증 상태 변화 감지
 */
function onAuthStateChange(callback) {
    const client = getSupabaseClient();
    return client.auth.onAuthStateChange(callback);
}

// 전역으로 사용할 수 있도록 export
window.WaveSupabase = {
    init: initSupabase,
    getClient: getSupabaseClient,
    checkConnection,
    getCurrentUser,
    onAuthStateChange
};

// 초기화 완료 이벤트 생성
const supabaseInitEvent = new Event('supabaseInitialized');

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', async () => {
    // 초기화 Promise를 전역에 노출
    window.supabaseInitPromise = (async () => {
        try {
            console.log('🔄 Supabase 초기화 시작...');
            await initSupabase();
            // await checkConnection(); // 임시 비활성화
            
            console.log('✅ Supabase 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ Supabase 초기화 실패:', error);
            throw error;
        }
    })();
    
    try {
        await window.supabaseInitPromise;
        
        // 초기화 완료 이벤트 발생
        console.log('✅ Supabase 초기화 완료, 이벤트 발생');
        window.dispatchEvent(supabaseInitEvent);
        
    } catch (error) {
        console.error('Supabase 초기화 실패:', error);
        // 실패해도 이벤트는 발생시켜 대기 중인 코드가 진행되도록 함
        window.dispatchEvent(supabaseInitEvent);
    }
});