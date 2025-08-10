// attendance-enhanced.js - 50개 테스트 계정 출석 데이터

// 테스트 계정 정보 (mockUsers와 동일)
const users = [
    '김철수', '이영희', '박민수', '정수진', '최동현', '김서연', '이준호', '박지영', '홍길동', '김나영',
    '이상현', '박소영', '정현수', '김태영', '이민정', '박재현', '최수빈', '정다은', '김현우', '이서준',
    '박하늘', '정유진', '김도윤', '이하린', '박시우', '최지아', '정예준', '김서윤', '이주원', '박지호',
    '홍민준', '김윤서', '이도현', '박수아', '정건우', '김은지', '이성민', '박예린', '최준서', '정아인',
    '김태훈', '이소민', '박준영', '홍서영', '김민재', '이지우', '박현서', '정수현', '최민서', '김지안'
];

const nicknames = [
    '강남전문가', '부동산여왕', '서초구달인', '송파마스터', '강북전문', '마포구고수', '용산프로', '성동구베테랑', '종로의달인', '중구전문가',
    '노원구달인', '도봉구마스터', '은평구프로', '서대문전문', '양천구고수', '구로달인', '금천프로', '영등포마스터', '동작구전문', '관악프로',
    '서초베테랑', '강남구고수', '송파달인', '강동프로', '광진구마스터', '동대문전문', '중랑구고수', '성북달인', '강북프로', '도봉베테랑',
    '노원구마스터', '은평전문', '서대문프로', '마포달인', '용산구고수', '중구베테랑', '종로프로', '성동구마스터', '광진달인', '동대문프로',
    '중랑구전문', '성북고수', '강북달인', '도봉프로', '노원베테랑', '은평구마스터', '서대문달인', '마포프로', '양천구전문', '구로구고수'
];

// 출석 데이터 생성 함수
function generateAttendanceData() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const attendanceData = {};
    
    // 각 사용자별 출석 데이터 생성
    for (let i = 0; i < 50; i++) {
        const userAttendance = {};
        const attendanceRate = 0.5 + Math.random() * 0.5; // 50~100% 출석률
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            if (date <= today) {
                // 과거 날짜는 랜덤 출석
                userAttendance[day] = Math.random() < attendanceRate;
            } else {
                // 미래 날짜는 false
                userAttendance[day] = false;
            }
        }
        
        attendanceData[i] = {
            name: users[i],
            nickname: nicknames[i],
            attendance: userAttendance,
            streak: Math.floor(Math.random() * 30) + 1,
            totalDays: Object.values(userAttendance).filter(v => v).length,
            points: Math.floor(Math.random() * 5000) + 1000
        };
    }
    
    return attendanceData;
}

// 오늘 출석한 사용자 목록
function getTodayAttendees() {
    const attendanceData = generateAttendanceData();
    const today = new Date().getDate();
    const attendees = [];
    
    Object.values(attendanceData).forEach(user => {
        if (user.attendance[today]) {
            const hoursAgo = Math.floor(Math.random() * 24);
            let timeStr;
            
            if (hoursAgo === 0) {
                timeStr = '방금 전';
            } else if (hoursAgo < 1) {
                timeStr = `${Math.floor(Math.random() * 60)}분 전`;
            } else {
                timeStr = `${hoursAgo}시간 전`;
            }
            
            attendees.push({
                name: user.name,
                nickname: user.nickname,
                time: timeStr,
                message: getRandomMessage(),
                streak: user.streak
            });
        }
    });
    
    // 시간순 정렬 (최근 순)
    return attendees.sort((a, b) => {
        const getMinutes = (timeStr) => {
            if (timeStr === '방금 전') return 0;
            if (timeStr.includes('분')) return parseInt(timeStr);
            if (timeStr.includes('시간')) return parseInt(timeStr) * 60;
            return 1440;
        };
        return getMinutes(a.time) - getMinutes(b.time);
    });
}

// 랜덤 출석 메시지
function getRandomMessage() {
    const messages = [
        '오늘도 화이팅! 💪',
        '좋은 하루 되세요~',
        '오늘 날씨 좋네요!',
        '모두 힘내세요!',
        '이번 달도 파이팅!',
        '출석 완료! ✅',
        '오늘도 열심히!',
        '좋은 일 가득한 하루!',
        '다들 건강하세요~',
        '행복한 하루 보내세요',
        '오늘도 달려봅시다!',
        '성공적인 하루 되길!',
        '모두 수고하세요~',
        '오늘도 최선을!',
        '긍정적인 하루!'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

// 월간 출석 랭킹
function getMonthlyRanking() {
    const attendanceData = generateAttendanceData();
    const ranking = Object.values(attendanceData)
        .sort((a, b) => b.totalDays - a.totalDays)
        .slice(0, 10)
        .map((user, index) => ({
            rank: index + 1,
            name: user.name,
            nickname: user.nickname,
            days: user.totalDays,
            streak: user.streak,
            points: user.points,
            badge: index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'
        }));
    
    return ranking;
}

// 연속 출석 랭킹
function getStreakRanking() {
    const attendanceData = generateAttendanceData();
    const ranking = Object.values(attendanceData)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 10)
        .map((user, index) => ({
            rank: index + 1,
            name: user.name,
            nickname: user.nickname,
            streak: user.streak,
            totalDays: user.totalDays,
            badge: user.streak >= 30 ? '🔥' : user.streak >= 14 ? '⭐' : '✨'
        }));
    
    return ranking;
}

// 캘린더 렌더링
function renderCalendar(userId = 0) {
    const container = document.querySelector('.calendar-grid');
    if (!container) return;
    
    const attendanceData = generateAttendanceData();
    const userAttendance = attendanceData[userId].attendance;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let calendarHTML = '';
    
    // 요일 헤더
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach(day => {
        calendarHTML += `<div class="calendar-header">${day}</div>`;
    });
    
    // 빈 칸 채우기
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate();
        const hasAttended = userAttendance[day];
        const isFuture = new Date(year, month, day) > today;
        
        let className = 'calendar-day';
        if (isToday) className += ' today';
        if (hasAttended) className += ' attended';
        if (isFuture) className += ' future';
        
        calendarHTML += `
            <div class="${className}" data-day="${day}">
                <span class="day-number">${day}</span>
                ${hasAttended ? '<i class="fas fa-check"></i>' : ''}
            </div>
        `;
    }
    
    container.innerHTML = calendarHTML;
}

// 오늘 출석 목록 렌더링
function renderTodayAttendance() {
    const container = document.querySelector('.attendance-list');
    if (!container) return;
    
    const attendees = getTodayAttendees();
    
    container.innerHTML = attendees.slice(0, 20).map((user, index) => `
        <div class="attendance-item ${index < 3 ? 'early-bird' : ''}">
            <span class="attendance-number">${index + 1}</span>
            <div class="attendance-user">
                <strong>${user.nickname}</strong>
                <span class="real-name">(${user.name})</span>
            </div>
            <div class="attendance-message">${user.message}</div>
            <div class="attendance-time">${user.time}</div>
            ${user.streak >= 7 ? `<span class="streak-badge">${user.streak}일 연속</span>` : ''}
        </div>
    `).join('');
}

// 랭킹 렌더링
function renderRankings() {
    const monthlyContainer = document.querySelector('.monthly-ranking');
    const streakContainer = document.querySelector('.streak-ranking');
    
    if (monthlyContainer) {
        const monthlyRanking = getMonthlyRanking();
        monthlyContainer.innerHTML = monthlyRanking.map(user => `
            <div class="ranking-item">
                <span class="rank">${user.badge} ${user.rank}</span>
                <span class="user-name">${user.nickname}</span>
                <span class="attendance-count">${user.days}일</span>
                <span class="points">+${user.points}P</span>
            </div>
        `).join('');
    }
    
    if (streakContainer) {
        const streakRanking = getStreakRanking();
        streakContainer.innerHTML = streakRanking.map(user => `
            <div class="ranking-item">
                <span class="rank">${user.badge} ${user.rank}</span>
                <span class="user-name">${user.nickname}</span>
                <span class="streak-days">${user.streak}일 연속</span>
            </div>
        `).join('');
    }
}

// 출석 체크 버튼 클릭
function handleAttendanceCheck() {
    const btn = document.querySelector('.check-in-btn');
    if (!btn) return;
    
    btn.addEventListener('click', function() {
        if (this.disabled) {
            alert('이미 오늘 출석체크를 완료했습니다!');
            return;
        }
        
        // 출석 체크 애니메이션
        this.innerHTML = '<i class="fas fa-check"></i> 출석 완료!';
        this.disabled = true;
        this.classList.add('checked');
        
        // 포인트 추가 알림
        const points = 100 + Math.floor(Math.random() * 50);
        alert(`출석체크 완료! +${points} 포인트를 획득했습니다.`);
        
        // 목록 새로고침
        setTimeout(() => {
            renderTodayAttendance();
            renderCalendar();
        }, 500);
    });
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', function() {
    console.log('attendance-enhanced.js 로드 완료');
    
    // 초기 렌더링
    renderCalendar();
    renderTodayAttendance();
    renderRankings();
    
    // 출석 체크 버튼 이벤트
    handleAttendanceCheck();
    
    // 탭 전환 이벤트
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 월 변경 이벤트
    const monthSelect = document.querySelector('.month-select');
    if (monthSelect) {
        monthSelect.addEventListener('change', function() {
            renderCalendar();
            renderRankings();
        });
    }
});