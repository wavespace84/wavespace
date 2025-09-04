/**
 * BaseService - 모든 서비스의 기본 클래스
 * 
 * 이 클래스는 WAVE SPACE의 모든 서비스에서 공통으로 사용되는
 * 기능들을 제공합니다.
 * 
 * @class BaseService
 */
export class BaseService {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.supabase = null;
        this.isInitialized = false;
        this.initPromise = null;
    }

    /**
     * 서비스 초기화
     * Supabase 클라이언트를 기다리고 초기화합니다
     * 
     * @returns {Promise<void>}
     */
    async init() {
        // 이미 초기화 중이면 기존 Promise 반환
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._initInternal();
        return this.initPromise;
    }

    /**
     * 실제 초기화 로직
     * @private
     */
    async _initInternal() {
        try {
            // Supabase 클라이언트 대기
            this.supabase = await this.waitForSupabase();
            
            // 서비스별 추가 초기화
            await this.onInit();
            
            this.isInitialized = true;
            console.log(`✅ ${this.serviceName} 초기화 완료`);
        } catch (error) {
            console.error(`❌ ${this.serviceName} 초기화 실패:`, error);
            throw error;
        }
    }

    /**
     * 서비스별 추가 초기화 로직 (오버라이드용)
     * @protected
     */
    async onInit() {
        // 서브클래스에서 구현
    }

    /**
     * Supabase 클라이언트 대기
     * @private
     * @param {number} maxAttempts - 최대 시도 횟수
     * @param {number} delay - 재시도 간격 (ms)
     * @returns {Promise<Object>} Supabase 클라이언트
     */
    async waitForSupabase(maxAttempts = 50, delay = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            if (window.WaveSupabase && window.WaveSupabase.getClient) {
                try {
                    const client = window.WaveSupabase.getClient();
                    if (client) return client;
                } catch (error) {
                    // 클라이언트가 아직 준비되지 않음
                }
            }
            
            if (i < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new Error(`${this.serviceName}: Supabase 초기화 시간 초과`);
    }

    /**
     * AuthService 안전하게 가져오기
     * @protected
     * @returns {Object|null} AuthService 인스턴스
     */
    getAuthService() {
        if (typeof window !== 'undefined' && window.authService) {
            return window.authService;
        }
        console.warn(`⚠️ ${this.serviceName}: authService를 찾을 수 없습니다.`);
        return null;
    }

    /**
     * 현재 로그인한 사용자 확인
     * @protected
     * @returns {boolean} 로그인 여부
     */
    isUserLoggedIn() {
        const authService = this.getAuthService();
        return authService ? authService.isLoggedIn() : false;
    }

    /**
     * 현재 사용자 정보 가져오기
     * @protected
     * @returns {Object|null} 사용자 정보
     */
    getCurrentUser() {
        const authService = this.getAuthService();
        return authService ? authService.getCurrentUser() : null;
    }

    /**
     * 현재 세션 가져오기
     * @protected
     * @returns {Promise<Object>} 세션 정보
     */
    async getSession() {
        if (!this.supabase) {
            throw new Error(`${this.serviceName}: 서비스가 초기화되지 않았습니다.`);
        }

        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (error) {
            throw new Error(`세션 확인 실패: ${error.message}`);
        }

        if (!session) {
            throw new Error('로그인이 필요합니다.');
        }

        return session;
    }

    /**
     * Supabase 쿼리 실행 및 에러 처리
     * @protected
     * @param {Function} queryFn - 실행할 쿼리 함수
     * @param {string} errorMessage - 에러 시 표시할 메시지
     * @returns {Promise<Object>} 쿼리 결과
     */
    async executeQuery(queryFn, errorMessage = '작업 실패') {
        try {
            const { data, error } = await queryFn();
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error(`${this.serviceName} - ${errorMessage}:`, error);
            
            return { 
                success: false, 
                error: error.message || errorMessage,
                data: null 
            };
        }
    }

    /**
     * 페이지네이션 적용
     * @protected
     * @param {Object} query - Supabase 쿼리 객체
     * @param {number} page - 페이지 번호 (1부터 시작)
     * @param {number} limit - 페이지당 항목 수
     * @returns {Object} 페이지네이션이 적용된 쿼리
     */
    applyPagination(query, page = 1, limit = 20) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit - 1;
        return query.range(startIndex, endIndex);
    }

    /**
     * 관리자 권한 확인
     * @protected
     * @returns {boolean} 관리자 여부
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user?.user_role === 'admin';
    }

    /**
     * 서비스 재시도 로직
     * @protected
     * @param {Function} operation - 재시도할 작업
     * @param {number} maxRetries - 최대 재시도 횟수
     * @param {number} delay - 재시도 간 대기 시간 (ms)
     * @returns {Promise<any>} 작업 결과
     */
    async retry(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.warn(`${this.serviceName}: 재시도 ${i + 1}/${maxRetries}`, error.message);
                
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * 활동 로그 기록
     * @protected
     * @param {string} action - 액션 타입
     * @param {Object} details - 상세 정보
     * @returns {Promise<Object>} 로그 결과
     */
    async logActivity(action, details = {}) {
        if (!this.supabase) return { success: false, error: '서비스 미초기화' };

        try {
            const user = this.getCurrentUser();
            if (!user) return { success: false, error: '사용자 정보 없음' };

            const { error } = await this.supabase
                .from('admin_logs')
                .insert({
                    admin_id: user.id,
                    action,
                    details,
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent
                });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error(`${this.serviceName}: 활동 로그 기록 실패`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 클라이언트 IP 주소 가져오기 (간단한 구현)
     * @private
     * @returns {Promise<string>} IP 주소
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    /**
     * 서비스 정리
     * @public
     */
    dispose() {
        this.supabase = null;
        this.isInitialized = false;
        this.initPromise = null;
        console.log(`🧹 ${this.serviceName} 정리 완료`);
    }
}

// 서비스 설정 상수
export const SERVICE_CONFIG = {
    CACHE_TTL: 5 * 60 * 1000, // 5분
    DEFAULT_PAGE_SIZE: 20,
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.hancom.hwp',
        'application/haansofthwp'
    ]
};

// 기본 export
export default BaseService;