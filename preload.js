// 페이지 전환 시 깜빡임 방지를 위한 프리로드
document.documentElement.style.visibility = 'hidden';

window.addEventListener('DOMContentLoaded', function() {
    // DOM이 준비되면 보이도록
    document.documentElement.style.visibility = 'visible';
});