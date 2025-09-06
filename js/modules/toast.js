/**
 * 통일된 알림 시스템 (Toast Message)
 * WAVE SPACE 전체에서 사용하는 통합 토스트 시스템
 */

// 토스트 컨테이너 관리
let toastContainer = null;
const activeToasts = new Set();
const MAX_TOASTS = 5; // 최대 동시 표시 토스트 수

/**
 * 토스트 컨테이너 초기화
 */
function initToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('aria-live', 'polite');
        toastContainer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

/**
 * 토스트 메시지 표시 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 메시지 타입 ('success', 'error', 'info', 'warning')
 * @param {number} duration - 표시 시간 (ms, 기본값: 3000)
 * @param {Object} options - 추가 옵션
 */
function showToastMessage(message, type = 'success', duration = 3000, options = {}) {
    // 컨테이너 초기화
    const container = initToastContainer();
    
    // 최대 개수 초과 시 가장 오래된 토스트 제거
    if (activeToasts.size >= MAX_TOASTS) {
        const oldestToast = activeToasts.values().next().value;
        if (oldestToast) {
            removeToast(oldestToast);
        }
    }

    // 아이콘 매핑
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.setAttribute('role', 'alert');
    
    // 고유 ID 생성
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    toast.id = toastId;
    
    // HTML 구조 생성
    const iconClass = iconMap[type] || iconMap.info;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${iconClass}" aria-hidden="true"></i>
            <span class="toast-text">${escapeHtml(message)}</span>
            ${options.closable !== false ? 
        `<button class="toast-close" aria-label="닫기">
                    <i class="fas fa-times"></i>
                </button>` : ''}
        </div>
        ${options.progress ? 
        `<div class="toast-progress">
                <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
            </div>` : ''}
    `;
    
    // 닫기 버튼 이벤트
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => removeToast(toast));
    }
    
    // 컨테이너에 추가
    container.appendChild(toast);
    activeToasts.add(toast);
    
    // 애니메이션 시작
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // 자동 제거 타이머
    const removeTimer = setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    // 마우스 호버 시 타이머 일시 정지
    if (options.pauseOnHover !== false) {
        toast.addEventListener('mouseenter', () => {
            clearTimeout(removeTimer);
            const progressBar = toast.querySelector('.toast-progress-bar');
            if (progressBar) {
                progressBar.style.animationPlayState = 'paused';
            }
        });
        
        toast.addEventListener('mouseleave', () => {
            const progressBar = toast.querySelector('.toast-progress-bar');
            if (progressBar) {
                progressBar.style.animationPlayState = 'running';
            }
            setTimeout(() => removeToast(toast), 1000);
        });
    }
    
    return toast;
}

/**
 * 토스트 제거 함수
 * @param {HTMLElement} toast - 제거할 토스트 요소
 */
function removeToast(toast) {
    if (!toast || !activeToasts.has(toast)) return;
    
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    setTimeout(() => {
        activeToasts.delete(toast);
        toast.remove();
        
        // 컨테이너가 비어있으면 제거
        if (toastContainer && activeToasts.size === 0) {
            setTimeout(() => {
                if (activeToasts.size === 0 && toastContainer) {
                    toastContainer.remove();
                    toastContainer = null;
                }
            }, 100);
        }
    }, 300);
}

/**
 * HTML 이스케이프 함수
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 전역 알림 헬퍼 함수들
 */
window.showSuccessMessage = function(message, duration) {
    showToastMessage(message, 'success', duration);
};

window.showErrorMessage = function(message, duration) {
    showToastMessage(message, 'error', duration);
};

window.showInfoMessage = function(message, duration) {
    showToastMessage(message, 'info', duration);
};

window.showWarningMessage = function(message, duration) {
    showToastMessage(message, 'warning', duration);
};

// 전역 함수로도 등록
window.showToastMessage = showToastMessage;

// 토스트 큐 시스템 (동일 메시지 중복 방지)
const messageQueue = new Map();

/**
 * 중복 방지 토스트 표시
 * @param {string} message - 메시지
 * @param {string} type - 타입
 * @param {number} duration - 지속 시간
 */
function showUniqueToast(message, type, duration) {
    const key = `${type}:${message}`;
    
    // 이미 표시 중인 메시지면 무시
    if (messageQueue.has(key)) {
        return messageQueue.get(key);
    }
    
    const toast = showToastMessage(message, type, duration);
    messageQueue.set(key, toast);
    
    // 제거 시 큐에서도 삭제
    setTimeout(() => {
        messageQueue.delete(key);
    }, duration + 500);
    
    return toast;
}

// 전역 헬퍼에 unique 옵션 추가
window.showSuccessMessage = function(message, duration, unique = false) {
    return unique ? showUniqueToast(message, 'success', duration) : 
        showToastMessage(message, 'success', duration);
};

window.showErrorMessage = function(message, duration, unique = false) {
    return unique ? showUniqueToast(message, 'error', duration) : 
        showToastMessage(message, 'error', duration);
};

window.showInfoMessage = function(message, duration, unique = false) {
    return unique ? showUniqueToast(message, 'info', duration) : 
        showToastMessage(message, 'info', duration);
};

window.showWarningMessage = function(message, duration, unique = false) {
    return unique ? showUniqueToast(message, 'warning', duration) : 
        showToastMessage(message, 'warning', duration);
};

/**
 * 사용 예시:
 * 
 * // 성공 메시지
 * showToastMessage('작업이 완료되었습니다!', 'success');
 * showSuccessMessage('저장되었습니다!');
 * 
 * // 에러 메시지
 * showToastMessage('오류가 발생했습니다.', 'error');
 * showErrorMessage('입력값을 확인해주세요.');
 * 
 * // 정보 메시지
 * showToastMessage('새로운 업데이트가 있습니다.', 'info');
 * showInfoMessage('로그인이 필요합니다.');
 * 
 * // 경고 메시지
 * showToastMessage('주의가 필요합니다.', 'warning');
 * showWarningMessage('저장되지 않은 변경사항이 있습니다.');
 * 
 * // 표시 시간 커스터마이징 (5초)
 * showToastMessage('5초 동안 표시됩니다.', 'info', 5000);
 */

// ES6 모듈 내보내기 (모듈 시스템 사용 시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToastMessage,
        showSuccessMessage: window.showSuccessMessage,
        showErrorMessage: window.showErrorMessage,
        showInfoMessage: window.showInfoMessage,
        showWarningMessage: window.showWarningMessage
    };
}