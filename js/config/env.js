/**
 * WAVE SPACE - 환경변수 관리
 * 개발/운영 환경별 설정 관리
 */

// 환경변수 로더 - 정적 사이트에서는 빌드 시점에 처리해야 함
// 현재는 임시로 window 객체에 설정을 저장
window.ENV = {
    // Supabase 설정
    SUPABASE_URL: window.SUPABASE_URL || 'https://sishloxzcqapontycuyz.supabase.co',
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || '',
    
    // 환경 설정
    NODE_ENV: window.NODE_ENV || 'development',
    
    // 개발 환경 여부
    isDevelopment: () => window.ENV.NODE_ENV === 'development',
    isProduction: () => window.ENV.NODE_ENV === 'production'
};

// 환경변수 검증
function validateEnv() {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = [];
    
    for (const key of required) {
        if (!window.ENV[key]) {
            missing.push(key);
        }
    }
    
    if (missing.length > 0) {
        console.error('❌ 필수 환경변수가 설정되지 않았습니다:', missing.join(', '));
        console.warn('💡 index.html에서 환경변수를 설정하거나 빌드 도구를 사용하세요.');
    }
}

// 페이지 로드 시 환경변수 검증
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateEnv);
} else {
    validateEnv();
}

export default window.ENV;