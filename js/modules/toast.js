/**
 * 통일된 알림 시스템 (Toast Message)
 * 시장조사서 페이지의 다운로드 알림 스타일을 전체 프로젝트에 적용
 */

/**
 * 토스트 메시지 표시 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 메시지 타입 ('success', 'error', 'info', 'warning')
 * @param {number} duration - 표시 시간 (ms, 기본값: 3000)
 */
function showToastMessage(message, type = 'success', duration = 3000) {
    // 기존 토스트가 있으면 제거
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
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
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${iconMap[type] || iconMap.info}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    // 애니메이션 시작
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // 지정된 시간 후 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
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

// 기존 alert 함수를 토스트로 대체
window.originalAlert = window.alert;
window.alert = function(message) {
    // 줄바꿈 처리를 위해 \n을 공백으로 변경
    const cleanMessage = message.replace(/\n/g, ' ');
    showToastMessage(cleanMessage, 'info', 4000);
};

// confirm 함수도 토스트로 대체 (임시로 true 반환)
window.originalConfirm = window.confirm;
window.confirm = function(message) {
    const cleanMessage = message.replace(/\n/g, ' ');
    showToastMessage(cleanMessage, 'warning', 4000);
    // 실제 confirm 대체 구현이 필요한 경우 Promise 기반으로 구현 필요
    return window.originalConfirm(message);
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