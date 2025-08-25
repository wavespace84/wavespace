// clock.js - 실시간 시계 모듈

export function initClock() {
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    // 초기 시간 표시
    updateTime();
    // 매초 업데이트
    setInterval(updateTime, 1000);
}
