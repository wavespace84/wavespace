/**
 * WAVE SPACE - Firebase 설정
 * 순수한 Firebase 초기화 및 설정만 담당
 */

// Firebase Console: https://console.firebase.google.com/project/wavespace-sms

// Firebase 설정 캐시
let firebaseConfig = null;
let firebaseApp = null;
let firebaseAuth = null;

// 환경변수에서 Firebase 설정 로드
function loadFirebaseConfig() {
    // env.js가 로드되었는지 확인
    if (typeof window.ENV === 'undefined') {
        console.warn('⚠️ 환경변수 모듈(env.js)이 로드되지 않았습니다.');
        return null;
    }

    // 환경변수에서 설정 로드
    firebaseConfig = window.ENV.getFirebaseConfig();
    
    if (!firebaseConfig) {
        // 개발 환경에서만 기본값 사용 (임시)
        if (window.ENV.isDevelopment()) {
            console.warn('⚠️ Firebase 환경변수가 없습니다. 개발용 기본값을 사용합니다.');
            firebaseConfig = {
                apiKey: 'AIzaSyDOk9ZqEtI38tog7YyFos2PVgITODSFvIw',
                authDomain: 'wavespace-sms.firebaseapp.com',
                projectId: 'wavespace-sms',
                storageBucket: 'wavespace-sms.firebasestorage.app',
                messagingSenderId: '646514379865',
                appId: '1:646514379865:web:a33dfd79e85343f8323548'
                // 개발용 설정 - 운영에서는 환경변수로 설정해야 함
            };
        } else {
            console.error('❌ 운영 환경에서 Firebase 설정이 누락되었습니다.');
            return null;
        }
    }

    return firebaseConfig;
}

/**
 * Firebase 초기화 함수
 */
function initializeFirebase() {
    try {
        console.log('🔧 Firebase 초기화 시작...');
        
        // Firebase SDK 로딩 확인
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK가 로드되지 않았습니다.');
            console.log('Firebase CDN 로딩을 확인하세요.');
            return false;
        }
        
        // 환경변수에서 설정 로드
        const config = loadFirebaseConfig();
        if (!config) {
            console.error('❌ Firebase 설정을 불러올 수 없습니다.');
            return false;
        }

        // 마스킹된 설정 로그 출력 (보안)
        console.log('Firebase 설정 확인:', config.apiKey.substring(0, 10) + '...');
        
        // Firebase 앱 초기화
        console.log('🔧 Firebase 앱 초기화 중...');
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(config);
            console.log('✅ 새 Firebase 앱 생성됨');
        } else {
            firebaseApp = firebase.app();
            console.log('✅ 기존 Firebase 앱 사용');
        }

        firebaseAuth = firebase.auth();
        console.log('✅ Firebase Auth 초기화됨');
        
        console.log('✅ Firebase 초기화 완료');
        return true;
        
    } catch (error) {
        console.error('❌ Firebase 초기화 실패:', error);
        console.error('에러 상세:', error.message);
        return false;
    }
}

/**
 * Firebase 앱 인스턴스 가져오기
 */
function getFirebaseApp() {
    if (!firebaseApp) {
        console.warn('⚠️ Firebase가 초기화되지 않았습니다. initializeFirebase()를 먼저 호출하세요.');
    }
    return firebaseApp;
}

/**
 * Firebase Auth 인스턴스 가져오기
 */
function getFirebaseAuth() {
    if (!firebaseAuth) {
        console.warn('⚠️ Firebase Auth가 초기화되지 않았습니다. initializeFirebase()를 먼저 호출하세요.');
    }
    return firebaseAuth;
}

/**
 * Firebase 설정 객체 가져오기
 */
function getFirebaseConfig() {
    return firebaseConfig;
}

/**
 * 현재 Firebase 사용자 가져오기
 */
function getCurrentUser() {
    const auth = getFirebaseAuth();
    return auth ? auth.currentUser : null;
}

/**
 * Firebase 로그아웃
 */
async function signOut() {
    try {
        const auth = getFirebaseAuth();
        if (auth) {
            await auth.signOut();
            return { success: true };
        }
        return { success: false, error: 'Firebase Auth가 초기화되지 않았습니다.' };
    } catch (error) {
        console.error('Firebase 로그아웃 실패:', error);
        return { success: false, error: error.message };
    }
}

// 전역 접근 가능하도록 설정
window.Firebase = {
    initialize: initializeFirebase,
    getApp: getFirebaseApp,
    getAuth: getFirebaseAuth,
    getConfig: getFirebaseConfig,
    getCurrentUser: getCurrentUser,
    signOut: signOut
};

// 기존 firebaseService API 호환성 래퍼
class FirebaseServiceCompatibilityWrapper {
    constructor() {
        this.app = null;
        this.auth = null;
    }

    /**
     * Firebase 초기화 (호환성)
     */
    async init() {
        const success = initializeFirebase();
        if (success) {
            this.app = getFirebaseApp();
            this.auth = getFirebaseAuth();
        }
        return success;
    }

    /**
     * SMS 인증 코드 발송 (호환성)
     */
    async sendSMSVerification(phoneNumber) {
        if (!window.SMSAuth) {
            console.warn('⚠️ SMS 인증 서비스가 로드되지 않았습니다.');
            return { success: false, error: 'SMS 인증 서비스가 로드되지 않았습니다.' };
        }
        return await window.SMSAuth.sendSMSVerification(phoneNumber);
    }

    /**
     * 인증 코드 확인 (호환성)
     */
    async verifyCode(confirmationResult, code) {
        if (!window.SMSAuth) {
            console.warn('⚠️ SMS 인증 서비스가 로드되지 않았습니다.');
            return { success: false, error: 'SMS 인증 서비스가 로드되지 않았습니다.' };
        }
        return await window.SMSAuth.verifyCode(confirmationResult, code);
    }

    /**
     * reCAPTCHA 설정 (호환성)
     */
    async setupRecaptcha() {
        if (!window.SMSAuth) {
            console.warn('⚠️ SMS 인증 서비스가 로드되지 않았습니다.');
            return null;
        }
        return await window.SMSAuth.setupRecaptcha();
    }

    /**
     * reCAPTCHA 재설정 (호환성)
     */
    async resetRecaptcha() {
        if (!window.SMSAuth) {
            console.warn('⚠️ SMS 인증 서비스가 로드되지 않았습니다.');
            return;
        }
        return await window.SMSAuth.resetRecaptcha();
    }

    /**
     * 현재 Firebase 사용자 가져오기 (호환성)
     */
    getCurrentUser() {
        return getCurrentUser();
    }

    /**
     * Firebase 로그아웃 (호환성)
     */
    async signOut() {
        return await signOut();
    }

    /**
     * 전화번호 국제 형식 변환 (호환성)
     */
    formatPhoneNumber(phoneNumber) {
        if (!window.SMSAuth) {
            // 기본 포맷팅 로직
            let formatted = phoneNumber.replace(/[-\s]/g, '');
            if (formatted.startsWith('010')) {
                formatted = '+82' + formatted.substring(1);
            } else if (!formatted.startsWith('+82')) {
                formatted = '+82' + formatted;
            }
            return formatted;
        }
        return window.SMSAuth.formatPhoneNumber(phoneNumber);
    }

    /**
     * Toast 메시지 표시 (호환성)
     */
    showToast(message, type = 'info') {
        if (window.SMSAuth) {
            window.SMSAuth.showToast(message, type);
        } else if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// 기존 API 호환성을 위한 래퍼 인스턴스
const firebaseService = new FirebaseServiceCompatibilityWrapper();

// 전역 접근 가능하도록 설정 (기존 코드 호환성)
window.firebaseService = firebaseService;

console.log('🔥 Firebase 설정 모듈 로드됨');
console.log('🔄 기존 firebaseService API 호환성 래퍼 활성화됨');