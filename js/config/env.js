/**
 * WAVE SPACE - 환경변수 관리
 * 개발/운영 환경별 설정 관리
 * 보안 강화: 민감 정보 보호
 */

// 안전한 환경변수 관리 클래스
class EnvironmentManager {
    constructor() {
        this.config = new Map();
        this.requiredKeys = new Set(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
        this.init();
    }

    init() {
        // 기본 설정 로드
        this.setDefaults();
        
        // 런타임 환경변수 로드 (window 객체에서)
        this.loadFromWindow();
        
        // 검증
        this.validate();
    }

    setDefaults() {
        // 기본값 설정 (개발 환경용)
        this.config.set('NODE_ENV', 'development');
        this.config.set('SUPABASE_URL', 'https://sishloxzcqapontycuyz.supabase.co');
        
        // Firebase 설정 (환경변수로 관리)
        this.config.set('FIREBASE_API_KEY', '');
        this.config.set('FIREBASE_AUTH_DOMAIN', '');
        this.config.set('FIREBASE_PROJECT_ID', '');
        this.config.set('FIREBASE_STORAGE_BUCKET', '');
        this.config.set('FIREBASE_MESSAGING_SENDER_ID', '');
        this.config.set('FIREBASE_APP_ID', '');
    }

    loadFromWindow() {
        // 런타임에 설정된 환경변수 로드
        const keys = [
            'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'NODE_ENV',
            'FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID',
            'FIREBASE_STORAGE_BUCKET', 'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID'
        ];

        keys.forEach(key => {
            if (window[key]) {
                this.config.set(key, window[key]);
            }
        });
    }

    get(key, defaultValue = null) {
        return this.config.get(key) || defaultValue;
    }

    set(key, value) {
        this.config.set(key, value);
    }

    has(key) {
        return this.config.has(key) && this.config.get(key);
    }

    isDevelopment() {
        return this.get('NODE_ENV') === 'development';
    }

    isProduction() {
        return this.get('NODE_ENV') === 'production';
    }

    // Firebase 설정 객체 반환 (보안 체크 포함)
    getFirebaseConfig() {
        const apiKey = this.get('FIREBASE_API_KEY');
        
        // 보안 체크: API 키가 플레이스홀더인지 확인
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            console.warn('⚠️ Firebase 설정이 완료되지 않았습니다. Mock 모드로 동작합니다.');
            return null;
        }

        return {
            apiKey: apiKey,
            authDomain: this.get('FIREBASE_AUTH_DOMAIN'),
            projectId: this.get('FIREBASE_PROJECT_ID'),
            storageBucket: this.get('FIREBASE_STORAGE_BUCKET'),
            messagingSenderId: this.get('FIREBASE_MESSAGING_SENDER_ID'),
            appId: this.get('FIREBASE_APP_ID')
        };
    }

    validate() {
        const missing = [];
        
        this.requiredKeys.forEach(key => {
            if (!this.has(key)) {
                missing.push(key);
            }
        });

        if (missing.length > 0) {
            console.error('❌ 필수 환경변수가 설정되지 않았습니다:', missing.join(', '));
            console.warn('💡 index.html에서 환경변수를 설정하거나 빌드 도구를 사용하세요.');
            
            if (this.isDevelopment()) {
                console.info('개발 환경에서는 기본값으로 동작합니다.');
            }
        } else {
            console.log('✅ 환경변수 검증 완료');
        }
    }

    // 보안을 위한 마스킹된 설정 출력
    getSecureConfig() {
        const config = {};
        this.config.forEach((value, key) => {
            if (key.includes('KEY') || key.includes('SECRET')) {
                config[key] = value ? `${value.substring(0, 8)}...` : undefined;
            } else {
                config[key] = value;
            }
        });
        return config;
    }
}

// 전역 인스턴스 생성
const envManager = new EnvironmentManager();

// 호환성을 위한 기존 API 유지
window.ENV = {
    SUPABASE_URL: envManager.get('SUPABASE_URL'),
    SUPABASE_ANON_KEY: envManager.get('SUPABASE_ANON_KEY'),
    NODE_ENV: envManager.get('NODE_ENV'),
    isDevelopment: () => envManager.isDevelopment(),
    isProduction: () => envManager.isProduction(),
    
    // 새로운 API
    get: (key, defaultValue) => envManager.get(key, defaultValue),
    has: (key) => envManager.has(key),
    getFirebaseConfig: () => envManager.getFirebaseConfig(),
    getSecureConfig: () => envManager.getSecureConfig()
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