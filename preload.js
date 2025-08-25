// 페이지 전환 시 깜빡임 방지를 위한 프리로드
document.documentElement.style.visibility = 'hidden';

// WaveSpaceData 전역 객체 먼저 초기화
(async function initializeWaveSpaceData() {
    try {
        // ES6 모듈을 동적으로 로드
        const module = await import('./js/core/WaveSpaceData.js');
        console.log('[PRELOAD] WaveSpaceData 초기화 완료');
    } catch (error) {
        console.error('[PRELOAD] WaveSpaceData 초기화 실패:', error);
        // 폴백으로 기본 객체 생성
        window.WaveSpaceData = {
            errorHandler: {
                log: (level, message, details) => console.log(`[${level}] ${message}`, details),
                showUserError: (message) => alert(message)
            },
            security: {
                sanitizeInput: (input) => input
            }
        };
    }
})();

let pageShown = false;

function showPage() {
    if (pageShown) return; // 이미 표시된 경우 중복 실행 방지
    
    pageShown = true;
    document.documentElement.style.visibility = 'visible';
    console.log('[PRELOAD] 페이지 표시됨 - ', new Date().toISOString());
}

// DOM이 준비되면 즉시 표시
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showPage);
} else {
    // 이미 DOM이 로드된 경우 즉시 실행
    showPage();
}

// 추가 안전장치 - window load 이벤트
window.addEventListener('load', () => {
    console.log('[PRELOAD] Window load 이벤트 발생');
    setTimeout(showPage, 10);
});

// 빠른 타임아웃 설정 (500ms 후 강제 표시)
setTimeout(() => {
    console.log('[PRELOAD] 타임아웃으로 페이지 강제 표시');
    showPage();
}, 500);

// 최종 안전장치 (1초 후 강제 표시)
setTimeout(() => {
    if (!pageShown) {
        console.warn('[PRELOAD] 최종 타임아웃으로 페이지 강제 표시');
        showPage();
    }
}, 1000);
