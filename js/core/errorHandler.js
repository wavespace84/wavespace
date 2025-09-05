/**
 * WAVE SPACE - 통합 에러 처리 시스템
 * 모든 에러 처리를 중앙화하고 중복 제거
 * 
 * 통합된 기능:
 * - js/utils/errorHandler.js의 에러 메시지 매핑
 * - js/utils/logger.js의 trackError 기능
 * - js/core/WaveSpaceData.js의 ErrorHandler 클래스
 * 
 * @version 2.0.0
 * @author WAVE SPACE Team
 */

// 에러 타입별 메시지 매핑 (기존 + 확장)
const ERROR_MESSAGES = {
    // 인증 관련 에러 (Firebase)
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
    'auth/user-disabled': '비활성화된 계정입니다. 관리자에게 문의하세요.',
    'auth/user-not-found': '등록되지 않은 사용자입니다.',
    'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    
    // Supabase 에러
    'invalid_grant': '인증이 만료되었습니다. 다시 로그인해주세요.',
    'invalid_password': '비밀번호가 일치하지 않습니다.',
    'User already registered': '이미 가입된 사용자입니다.',
    'Invalid login credentials': '아이디 또는 비밀번호가 일치하지 않습니다.',
    'Email not confirmed': '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
    'PGRST116': '접근 권한이 없습니다.', // RLS 정책 위반
    
    // 네트워크 에러
    'NetworkError': '네트워크 연결을 확인해주세요.',
    'Failed to fetch': '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    'Network request failed': '네트워크 오류가 발생했습니다.',
    'ECONNREFUSED': '서버에 연결할 수 없습니다.',
    'ETIMEDOUT': '요청 시간이 초과되었습니다.',
    
    // 권한 에러
    'permission-denied': '접근 권한이 없습니다.',
    'insufficient-permissions': '이 작업을 수행할 권한이 없습니다.',
    'unauthorized': '로그인이 필요한 서비스입니다.',
    
    // 유효성 검사 에러
    'validation/empty-field': '필수 항목을 입력해주세요.',
    'validation/invalid-format': '올바른 형식으로 입력해주세요.',
    'validation/too-short': '입력값이 너무 짧습니다.',
    'validation/too-long': '입력값이 너무 깁니다.',
    'validation/invalid-phone': '올바른 전화번호 형식이 아닙니다.',
    'validation/invalid-business-number': '올바른 사업자등록번호 형식이 아닙니다.',
    
    // 파일 업로드 에러
    'file/too-large': '파일 크기가 너무 큽니다. (최대 10MB)',
    'file/invalid-type': '지원하지 않는 파일 형식입니다.',
    'file/upload-failed': '파일 업로드에 실패했습니다.',
    'file/not-found': '파일을 찾을 수 없습니다.',
    
    // 비즈니스 로직 에러
    'points/insufficient': '포인트가 부족합니다.',
    'membership/expired': '멤버십이 만료되었습니다.',
    'content/blocked': '차단된 콘텐츠입니다.',
    'rate-limit': '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
    
    // 기타 에러
    'not-found': '요청하신 정보를 찾을 수 없습니다.',
    'server-error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'unknown-error': '알 수 없는 오류가 발생했습니다.',
    'timeout': '요청 시간이 초과되었습니다.',
    'cancelled': '요청이 취소되었습니다.'
};

// 에러 레벨 정의
export const ERROR_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARNING: 'warning', 
    ERROR: 'error',
    CRITICAL: 'critical'
};

// 에러 카테고리 정의
const ERROR_CATEGORIES = {
    AUTH: 'auth',
    NETWORK: 'network',
    VALIDATION: 'validation',
    PERMISSION: 'permission',
    FILE: 'file',
    BUSINESS: 'business',
    SYSTEM: 'system'
};

/**
 * 통합 에러 핸들러 클래스
 */
export class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.toastContainer = null;
        
        // 전역 에러 캐치
        this.setupGlobalErrorHandling();
        
        // 토스트 컨테이너 초기화
        this.initToastContainer();
        
        console.log('[ErrorHandler] 통합 에러 핸들러 초기화 완료');
    }

    /**
     * 전역 에러 처리 설정
     */
    setupGlobalErrorHandling() {
        // JavaScript 에러 캐치
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            }, ERROR_LEVELS.ERROR, true);
        });

        // Promise rejection 캐치
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack
            }, ERROR_LEVELS.ERROR, true);
            
            event.preventDefault(); // 콘솔 로그 방지
        });
    }

    /**
     * 토스트 컨테이너 초기화
     */
    initToastContainer() {
        if (document.querySelector('.toast-container')) return;
        
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        this.toastContainer = container;
        
        // 스타일 추가
        this.addToastStyles();
    }

    /**
     * 에러 처리 메인 함수
     * @param {Error|string|Object} error 에러 객체/메시지
     * @param {string} level 에러 레벨
     * @param {boolean} showToast 토스트 표시 여부
     * @param {Object} context 추가 컨텍스트
     */
    handleError(error, level = ERROR_LEVELS.ERROR, showToast = true, context = {}) {
        const errorInfo = this.parseError(error);
        const userMessage = this.getUserMessage(errorInfo);
        
        // 에러 로깅
        this.logError({
            ...errorInfo,
            level,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });

        // 사용자에게 토스트 표시
        if (showToast && userMessage) {
            this.showToast(userMessage, level);
        }

        // 개발 환경에서는 콘솔에도 출력
        if (window.ENV?.isDevelopment()) {
            console.error('[ErrorHandler]', errorInfo, context);
        }

        // 심각한 에러는 별도 처리
        if (level === ERROR_LEVELS.CRITICAL) {
            this.handleCriticalError(errorInfo, context);
        }

        return userMessage;
    }

    /**
     * 에러 객체 파싱
     * @param {Error|string|Object} error 에러
     * @returns {Object} 파싱된 에러 정보
     */
    parseError(error) {
        if (typeof error === 'string') {
            return {
                type: 'string',
                message: error,
                code: null,
                stack: null
            };
        }

        if (error instanceof Error) {
            return {
                type: 'error',
                message: error.message,
                name: error.name,
                code: error.code || null,
                stack: error.stack
            };
        }

        if (typeof error === 'object' && error !== null) {
            return {
                type: 'object',
                message: error.message || error.msg || 'Unknown error',
                code: error.code || error.error_code || null,
                details: error.details || null,
                stack: error.stack || null
            };
        }

        return {
            type: 'unknown',
            message: 'Unknown error occurred',
            code: null,
            stack: null
        };
    }

    /**
     * 사용자 친화적 메시지 생성
     * @param {Object} errorInfo 에러 정보
     * @returns {string} 사용자 메시지
     */
    getUserMessage(errorInfo) {
        const { message, code } = errorInfo;

        // 코드 기반 메시지 매핑
        if (code && ERROR_MESSAGES[code]) {
            return ERROR_MESSAGES[code];
        }

        // 메시지 기반 매핑 (부분 일치)
        for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
            if (message.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }

        // 패턴 기반 매핑
        if (message.includes('network') || message.includes('fetch')) {
            return ERROR_MESSAGES['NetworkError'];
        }

        if (message.includes('permission') || message.includes('auth')) {
            return ERROR_MESSAGES['permission-denied'];
        }

        if (message.includes('timeout')) {
            return ERROR_MESSAGES['timeout'];
        }

        // 기본 메시지
        return ERROR_MESSAGES['unknown-error'];
    }

    /**
     * 에러 로깅
     * @param {Object} errorInfo 에러 정보
     */
    logError(errorInfo) {
        // 로컬 로그에 추가
        this.errorLog.unshift(errorInfo);
        
        // 로그 크기 제한
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }

        // localStorage에 저장 (개발 환경)
        if (window.ENV?.isDevelopment()) {
            try {
                const logs = JSON.parse(localStorage.getItem('wave-error-logs') || '[]');
                logs.unshift({
                    ...errorInfo,
                    id: Date.now() + Math.random()
                });
                
                // 최근 50개만 유지
                localStorage.setItem('wave-error-logs', JSON.stringify(logs.slice(0, 50)));
            } catch (e) {
                console.warn('Failed to save error log to localStorage:', e);
            }
        }

        // 서버에 에러 리포팅 (운영 환경)
        if (window.ENV?.isProduction() && errorInfo.level === ERROR_LEVELS.CRITICAL) {
            this.reportToServer(errorInfo);
        }
    }

    /**
     * 토스트 메시지 표시
     * @param {string} message 메시지
     * @param {string} level 레벨
     */
    showToast(message, level = ERROR_LEVELS.ERROR) {
        if (!this.toastContainer) {
            this.initToastContainer();
        }

        // 기존 토스트 제거 (동일 레벨)
        const existingToasts = this.toastContainer.querySelectorAll(`.toast-${level}`);
        existingToasts.forEach(toast => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        });

        // 새 토스트 생성
        const toast = document.createElement('div');
        toast.className = `toast toast-${level}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${this.getIconForLevel(level)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // DOM에 추가
        this.toastContainer.appendChild(toast);

        // 애니메이션
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 자동 제거
        const autoRemoveDelay = level === ERROR_LEVELS.CRITICAL ? 10000 : 5000;
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, autoRemoveDelay);

        return toast;
    }

    /**
     * 레벨별 아이콘 반환
     * @param {string} level 에러 레벨
     * @returns {string} 아이콘 클래스
     */
    getIconForLevel(level) {
        const icons = {
            [ERROR_LEVELS.DEBUG]: 'bug',
            [ERROR_LEVELS.INFO]: 'info-circle',
            [ERROR_LEVELS.WARNING]: 'exclamation-triangle',
            [ERROR_LEVELS.ERROR]: 'exclamation-circle',
            [ERROR_LEVELS.CRITICAL]: 'skull-crossbones'
        };
        return icons[level] || 'question-circle';
    }

    /**
     * 심각한 에러 처리
     * @param {Object} errorInfo 에러 정보
     * @param {Object} context 컨텍스트
     */
    handleCriticalError(errorInfo, context) {
        console.error('🚨 CRITICAL ERROR:', errorInfo, context);
        
        // 에러 리포팅
        this.reportToServer(errorInfo);
        
        // 사용자에게 심각한 에러 알림
        if (confirm('심각한 오류가 발생했습니다. 페이지를 새로고침하시겠습니까?')) {
            window.location.reload();
        }
    }

    /**
     * 서버에 에러 리포팅
     * @param {Object} errorInfo 에러 정보
     */
    async reportToServer(errorInfo) {
        try {
            // 실제 구현 시 에러 리포팅 API 호출
            console.log('📊 Error reported to server:', errorInfo);
            
            // TODO: Supabase에 에러 로그 저장
            // await supabaseClient.from('error_logs').insert([errorInfo]);
        } catch (reportError) {
            console.warn('Failed to report error to server:', reportError);
        }
    }

    /**
     * 토스트 스타일 추가
     */
    addToastStyles() {
        if (document.querySelector('#wave-toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'wave-toast-styles';
        styles.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            }
            
            .toast {
                display: flex;
                align-items: center;
                background: white;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 8px;
                min-width: 300px;
                max-width: 500px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                pointer-events: auto;
            }
            
            .toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .toast.hiding {
                opacity: 0;
                transform: translateX(100%);
            }
            
            .toast-debug { border-left-color: #6c757d; }
            .toast-info { border-left-color: #17a2b8; }
            .toast-warning { border-left-color: #ffc107; }
            .toast-error { border-left-color: #dc3545; }
            .toast-critical { border-left-color: #721c24; background: #f8d7da; }
            
            .toast-icon {
                margin-right: 12px;
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .toast-debug .toast-icon { color: #6c757d; }
            .toast-info .toast-icon { color: #17a2b8; }
            .toast-warning .toast-icon { color: #ffc107; }
            .toast-error .toast-icon { color: #dc3545; }
            .toast-critical .toast-icon { color: #721c24; }
            
            .toast-content {
                flex: 1;
                min-width: 0;
            }
            
            .toast-message {
                font-size: 14px;
                line-height: 1.4;
                color: #333;
                word-break: break-word;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 16px;
                color: #999;
                cursor: pointer;
                padding: 4px;
                margin-left: 8px;
                border-radius: 4px;
                flex-shrink: 0;
                transition: all 0.2s ease;
            }
            
            .toast-close:hover {
                background: #f0f0f0;
                color: #666;
            }
            
            @media (max-width: 480px) {
                .toast-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                }
                
                .toast {
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * 로그 조회
     * @param {number} limit 제한 개수
     * @returns {Array} 에러 로그
     */
    getLogs(limit = 10) {
        return this.errorLog.slice(0, limit);
    }

    /**
     * 로그 지우기
     */
    clearLogs() {
        this.errorLog = [];
        localStorage.removeItem('wave-error-logs');
        console.log('Error logs cleared');
    }

    /**
     * 편의 메서드들
     */
    info(message, context = {}) {
        return this.handleError(message, ERROR_LEVELS.INFO, true, context);
    }

    warning(message, context = {}) {
        return this.handleError(message, ERROR_LEVELS.WARNING, true, context);
    }

    error(message, context = {}) {
        return this.handleError(message, ERROR_LEVELS.ERROR, true, context);
    }

    critical(message, context = {}) {
        return this.handleError(message, ERROR_LEVELS.CRITICAL, true, context);
    }

    // 로깅 전용 (토스트 없음)
    log(level, message, context = {}) {
        return this.handleError(message, level, false, context);
    }
}

// 전역 인스턴스 생성
export const errorHandler = new ErrorHandler();

// 전역 호환성
window.ErrorHandler = errorHandler;

// 편의 함수들
window.showError = (message, context) => errorHandler.error(message, context);
window.showWarning = (message, context) => errorHandler.warning(message, context);
window.showInfo = (message, context) => errorHandler.info(message, context);

// 백워드 호환성을 위한 함수들
window.handleError = (error, showToast = true) => {
    return errorHandler.handleError(error, ERROR_LEVELS.ERROR, showToast);
};

export default errorHandler;