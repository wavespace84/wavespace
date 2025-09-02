/**
 * WAVE SPACE - 통합 에러 처리 유틸리티
 * 사용자 친화적인 에러 메시지 제공
 */

// 에러 타입별 메시지 매핑
const ERROR_MESSAGES = {
    // 인증 관련 에러
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
    
    // 네트워크 에러
    'NetworkError': '네트워크 연결을 확인해주세요.',
    'Failed to fetch': '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    'Network request failed': '네트워크 오류가 발생했습니다.',
    
    // 권한 에러
    'permission-denied': '접근 권한이 없습니다.',
    'insufficient-permissions': '이 작업을 수행할 권한이 없습니다.',
    'unauthorized': '로그인이 필요한 서비스입니다.',
    
    // 유효성 검사 에러
    'validation/empty-field': '필수 항목을 입력해주세요.',
    'validation/invalid-format': '올바른 형식으로 입력해주세요.',
    'validation/too-short': '입력값이 너무 짧습니다.',
    'validation/too-long': '입력값이 너무 깁니다.',
    
    // 파일 업로드 에러
    'file/too-large': '파일 크기가 너무 큽니다. (최대 10MB)',
    'file/invalid-type': '지원하지 않는 파일 형식입니다.',
    'file/upload-failed': '파일 업로드에 실패했습니다.',
    
    // 기타 에러
    'not-found': '요청하신 정보를 찾을 수 없습니다.',
    'server-error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'unknown-error': '알 수 없는 오류가 발생했습니다.'
};

// 에러 레벨
const ERROR_LEVELS = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

// 토스트 메시지 표시 함수
function showToast(message, level = ERROR_LEVELS.ERROR) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.error-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast-${level}`;
    toast.innerHTML = `
        <i class="fas fa-${getIconForLevel(level)}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 스타일 적용
    applyToastStyles();
    
    // DOM에 추가
    document.body.appendChild(toast);
    
    // 애니메이션
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // 자동 제거 (5초 후)
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// 레벨별 아이콘 반환
function getIconForLevel(level) {
    const icons = {
        [ERROR_LEVELS.INFO]: 'info-circle',
        [ERROR_LEVELS.WARNING]: 'exclamation-triangle',
        [ERROR_LEVELS.ERROR]: 'times-circle',
        [ERROR_LEVELS.CRITICAL]: 'exclamation-circle'
    };
    return icons[level] || 'exclamation-circle';
}

// 토스트 스타일 적용
function applyToastStyles() {
    if (document.querySelector('#error-toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'error-toast-styles';
    style.textContent = `
        .error-toast {
            position: fixed;
            top: 20px;
            right: -400px;
            max-width: 350px;
            padding: 16px 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            line-height: 1.5;
            transition: right 0.3s ease;
            z-index: 10000;
        }
        
        .error-toast.show {
            right: 20px;
        }
        
        .error-toast i:first-child {
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .error-toast-info {
            border-left: 4px solid #0066FF;
        }
        
        .error-toast-info i:first-child {
            color: #0066FF;
        }
        
        .error-toast-warning {
            border-left: 4px solid #FFA500;
        }
        
        .error-toast-warning i:first-child {
            color: #FFA500;
        }
        
        .error-toast-error {
            border-left: 4px solid #FF4444;
        }
        
        .error-toast-error i:first-child {
            color: #FF4444;
        }
        
        .error-toast-critical {
            border-left: 4px solid #CC0000;
            background: #FFF5F5;
        }
        
        .error-toast-critical i:first-child {
            color: #CC0000;
        }
        
        .toast-close {
            margin-left: auto;
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            padding: 4px;
            font-size: 16px;
            line-height: 1;
            transition: color 0.2s;
        }
        
        .toast-close:hover {
            color: #333;
        }
        
        @media (max-width: 640px) {
            .error-toast {
                right: -100%;
                left: 20px;
                max-width: calc(100% - 40px);
            }
            
            .error-toast.show {
                right: 20px;
            }
        }
    `;
    document.head.appendChild(style);
}

// 에러 메시지 가져오기
function getErrorMessage(error) {
    // 에러 객체에서 코드 추출
    const errorCode = error.code || error.error || error.message || error;
    
    // 매핑된 메시지 찾기
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
        if (errorCode.toString().toLowerCase().includes(key.toLowerCase())) {
            return message;
        }
    }
    
    // 기본 메시지
    return ERROR_MESSAGES['unknown-error'];
}

// 에러 처리 함수
function handleError(error, customMessage = null, level = ERROR_LEVELS.ERROR) {
    console.error('Error:', error);
    
    // 사용자에게 표시할 메시지 결정
    const message = customMessage || getErrorMessage(error);
    
    // 토스트 메시지 표시
    showToast(message, level);
    
    // 개발 환경에서는 콘솔에도 출력
    if (window.ENV && window.ENV.isDevelopment()) {
        console.error('Full error details:', error);
    }
    
    // 에러 추적 (프로덕션 환경)
    if (window.ENV && window.ENV.isProduction()) {
        trackError(error, message);
    }
}

// 에러 추적 함수 (향후 구현)
function trackError(error, message) {
    // TODO: Sentry, LogRocket 등 에러 추적 서비스 연동
    console.log('Error tracked:', { error, message });
}

// 성공 메시지 표시
function showSuccess(message) {
    showToast(message, ERROR_LEVELS.INFO);
}

// 경고 메시지 표시
function showWarning(message) {
    showToast(message, ERROR_LEVELS.WARNING);
}

// 전역으로 사용할 수 있도록 export
window.ErrorHandler = {
    handle: handleError,
    showError: (message) => showToast(message, ERROR_LEVELS.ERROR),
    showWarning: showWarning,
    showSuccess: showSuccess,
    showInfo: (message) => showToast(message, ERROR_LEVELS.INFO),
    ERROR_LEVELS
};

// 전역 에러 핸들러 설정
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    handleError(event.reason);
});

// 편의를 위한 전역 함수
window.handleError = handleError;
window.showSuccess = showSuccess;
window.showWarning = showWarning;