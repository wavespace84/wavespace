// 출석체크 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 출석 버튼
    const checkInBtn = document.getElementById('checkInBtn');
    const modal = document.getElementById('attendanceModal');
    
    // 로컬 스토리지에서 출석 정보 가져오기
    const today = new Date().toDateString();
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    const isCheckedIn = lastCheckIn === today;
    
    // 이미 출석한 경우 버튼 상태 변경
    if (isCheckedIn) {
        updateCheckInButton(true);
    }
    
    // 출석 버튼 클릭 이벤트
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function() {
            if (!isCheckedIn) {
                performCheckIn();
            }
        });
    }
    
    // 캘린더 네비게이션
    const prevBtn = document.querySelector('.calendar-nav.prev');
    const nextBtn = document.querySelector('.calendar-nav.next');
    let currentMonth = new Date();
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            updateCalendar(currentMonth);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            updateCalendar(currentMonth);
        });
    }
    
    // 캘린더 날짜 클릭 이벤트
    const calendarDays = document.querySelectorAll('.calendar-day:not(.other-month)');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            if (this.classList.contains('attended')) {
                showAttendanceDetails(this);
            }
        });
    });
    
    // 통계 카드 애니메이션
    animateStatCards();
    
    // 보상 카드 호버 효과
    setupRewardCards();
});

// 출석 처리 함수
function performCheckIn() {
    const btn = document.getElementById('checkInBtn');
    const modal = document.getElementById('attendanceModal');
    const today = new Date();
    
    // 버튼 로딩 상태
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>처리중...</span>';
    btn.disabled = true;
    
    // 서버 요청 시뮬레이션
    setTimeout(() => {
        // 로컬 스토리지에 출석 정보 저장
        localStorage.setItem('lastCheckIn', today.toDateString());
        
        // 연속 출석일 업데이트
        updateStreakCount();
        
        // 포인트 추가
        addPoints(100);
        
        // 캘린더에 출석 표시
        markTodayAsAttended();
        
        // 버튼 상태 업데이트
        updateCheckInButton(true);
        
        // 모달 표시
        showModal();
        
        // 통계 업데이트
        updateStatistics();
        
        // 애니메이션 효과
        celebrateCheckIn();
    }, 1000);
}

// 출석 버튼 상태 업데이트
function updateCheckInButton(isCheckedIn) {
    const btn = document.getElementById('checkInBtn');
    if (isCheckedIn) {
        btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>출석 완료</span>';
        btn.classList.add('completed');
        btn.disabled = true;
    } else {
        btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>출석하기</span>';
        btn.classList.remove('completed');
        btn.disabled = false;
    }
}

// 오늘 날짜를 출석으로 표시
function markTodayAsAttended() {
    const todayElement = document.querySelector('.calendar-day.today');
    if (todayElement) {
        todayElement.classList.add('attended');
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fas fa-check-circle';
        todayElement.appendChild(checkIcon);
    }
}

// 연속 출석일 업데이트
function updateStreakCount() {
    let streak = parseInt(localStorage.getItem('attendanceStreak') || '0');
    const lastStreakDate = localStorage.getItem('lastStreakDate');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastStreakDate === yesterday) {
        streak++;
    } else if (lastStreakDate !== today) {
        streak = 1;
    }
    
    localStorage.setItem('attendanceStreak', streak.toString());
    localStorage.setItem('lastStreakDate', today);
    
    // UI 업데이트
    const streakElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (streakElement) {
        streakElement.textContent = streak;
    }
}

// 포인트 추가
function addPoints(points) {
    let totalPoints = parseInt(localStorage.getItem('userPoints') || '0');
    totalPoints += points;
    localStorage.setItem('userPoints', totalPoints.toString());
}

// 통계 업데이트
function updateStatistics() {
    // 이번달 출석 수 증가
    const monthlyElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (monthlyElement) {
        const current = parseInt(monthlyElement.textContent);
        monthlyElement.textContent = current + 1;
    }
    
    // 총 출석일 증가
    const totalElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (totalElement) {
        const current = parseInt(totalElement.textContent);
        totalElement.textContent = current + 1;
    }
}

// 모달 표시
function showModal() {
    const modal = document.getElementById('attendanceModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('attendanceModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 모달 외부 클릭 시 닫기
window.addEventListener('click', function(event) {
    const modal = document.getElementById('attendanceModal');
    if (event.target === modal) {
        closeModal();
    }
});

// 캘린더 업데이트
function updateCalendar(date) {
    const calendarTitle = document.querySelector('.calendar-title');
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (calendarTitle) {
        calendarTitle.textContent = `${year}년 ${month + 1}월`;
    }
    
    // 실제 구현 시 캘린더 날짜 재생성
    console.log(`Calendar updated to ${year}-${month + 1}`);
}

// 출석 상세 정보 표시
function showAttendanceDetails(dayElement) {
    const dayNumber = dayElement.querySelector('.day-number').textContent;
    console.log(`Showing details for day ${dayNumber}`);
    
    // 툴팁 또는 팝업으로 상세 정보 표시
    // 실제 구현 시 추가
}

// 통계 카드 애니메이션
function animateStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // 숫자 카운트 애니메이션
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(value => {
        const finalValue = parseInt(value.textContent);
        let currentValue = 0;
        const increment = Math.ceil(finalValue / 20);
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            value.textContent = currentValue;
        }, 50);
    });
}

// 보상 카드 설정
function setupRewardCards() {
    const rewardCards = document.querySelectorAll('.reward-card');
    
    rewardCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// 출석 축하 애니메이션
function celebrateCheckIn() {
    // 색종이 효과 또는 파티클 애니메이션
    const container = document.querySelector('.attendance-status');
    
    // 간단한 축하 효과
    container.style.animation = 'celebrate 0.5s ease';
    
    setTimeout(() => {
        container.style.animation = '';
    }, 500);
}

// 축하 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes celebrate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);