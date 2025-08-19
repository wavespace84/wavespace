// 페이지 전환 시 깜빡임 방지를 위한 프리로드
document.documentElement.style.visibility = 'hidden';

function showPage() {
    document.documentElement.style.visibility = 'visible';
    console.log('[PRELOAD] 페이지 표시됨');
}

// 여러 이벤트에서 페이지 표시 시도
document.addEventListener('DOMContentLoaded', showPage);

// 추가 안전장치
window.addEventListener('load', function() {
    setTimeout(showPage, 10);
});

// 최대 대기 시간 설정 (3초 후 강제 표시)
setTimeout(showPage, 3000);