// 출석체크 페이지 JavaScript

// 랜덤 메시지 배열 (30개)
const randomMessages = [
    '오늘도 화이팅! 💪',
    '과유 불가! 열심히 일해요!',
    '좋은 하루 되세요!',
    '성공적인 분양을 위해 달려봅시다!',
    '오늘도 최선을 다하겠습니다!',
    '분양의 달인이 되는 그날까지!',
    '고객과의 만남이 기대되는 하루!',
    '긍정의 에너지로 시작하는 아침!',
    '오늘의 노력이 내일의 성과가 됩니다',
    '프로페셔널한 하루 시작!',
    '목표를 향해 한걸음 더!',
    '열정이 넘치는 하루 되세요!',
    '실력으로 승부하는 분양 전문가!',
    '오늘도 고객 만족을 위해!',
    '꾸준함이 성공의 비결입니다',
    '새로운 기회가 찾아올 거예요!',
    '파이팅 넘치는 하루 보내세요!',
    '전문성으로 무장한 하루!',
    '성실함이 빛나는 아침입니다',
    '오늘도 베스트를 향해!',
    '함께하는 동료들과 화이팅!',
    '긍정적인 마인드로 시작!',
    '도전하는 자에게 기회가 온다!',
    '오늘의 땀이 내일의 보람!',
    '분양 성공을 위한 첫걸음!',
    '프로의 자세로 임하겠습니다',
    '최고가 되기 위한 노력!',
    '고객의 행복이 나의 행복!',
    '오늘도 감사한 마음으로!',
    '새로운 도약을 위한 준비 완료!'
];

// 오늘의 출석현황 상위 30명 리스트 (실제로는 서버에서 받아올 데이터)
const attendanceData = [
    { rank: 1, name: '김영업왕', userId: 'kimyoung', time: '07:58', message: '오늘도 첫 출석! 좋은 하루 되세요!', streak: 25, badge: '소통왕', isCouponWinner: false },
    { rank: 2, name: '이기획신', userId: 'leeplan', time: '08:03', message: '일찍 일어나는 새가 벌레를 잡는다!', streak: 18, badge: '열정맨', isCouponWinner: false },
    { rank: 3, name: '박팀장님', userId: 'parkteam', time: '08:12', message: '오늘도 팀원들과 함께 화이팅!', streak: 31, badge: '베테랑', isCouponWinner: false },
    { rank: 4, name: '최전문가', userId: 'choiexpert', time: '08:18', message: '전문성으로 무장한 하루 시작!', streak: 12, badge: '전문가', isCouponWinner: false },
    { rank: 5, name: '정분양스타', userId: 'jungstar', time: '08:25', message: '분양의 달인이 출석했습니다', streak: 22, badge: '스타', isCouponWinner: false },
    { rank: 6, name: '한매니저', userId: 'hanmanager', time: '08:31', message: '관리의 프로가 등장!', streak: 15, badge: '매니저', isCouponWinner: false },
    { rank: 7, name: '구실장', userId: 'koochief', time: '08:38', message: '실장의 카리스마로 하루 시작', streak: 28, badge: '리더', isCouponWinner: false },
    { rank: 8, name: '송부장', userId: 'songbujang', time: '08:44', message: '부장의 리더십이 빛나는 아침', streak: 9, badge: '부장', isCouponWinner: false },
    { rank: 9, name: '류차장', userId: 'ryucha', time: '08:51', message: '차장의 안정감 있는 출근', streak: 17, badge: '차장', isCouponWinner: false },
    { rank: 10, name: '윤대리', userId: 'yoondae', time: '08:57', message: '대리의 성실함이 돋보이는 아침', streak: 11, badge: '대리', isCouponWinner: false },
    { rank: 11, name: '오주임', userId: 'ohjuim', time: '09:04', message: '주임의 책임감으로 시작하는 하루', streak: 8, badge: '주임', isCouponWinner: false },
    { rank: 12, name: '배사원', userId: 'baesa', time: '09:11', message: '신입의 패기로 가듍한 아침!', streak: 14, badge: '신입', isCouponWinner: false },
    { rank: 13, name: '홍과장', userId: 'honggwa', time: '09:18', message: '과장의 중간 관리 능력 발휘!', streak: 20, badge: '과장', isCouponWinner: false },
    { rank: 14, name: '임팀장', userId: 'limteam', time: '09:25', message: '팀을 이끄는 리더의 출근', streak: 6, badge: '팀장', isCouponWinner: false },
    { rank: 15, name: '조실장', userId: 'josil', time: '09:32', message: '실무 경험의 깊이를 보여주는 아침', streak: 19, badge: '실장', isCouponWinner: false },
    { rank: 16, name: '신부장', userId: 'shinbu', time: '09:39', message: '부서를 총괄하는 리더의 등장', streak: 13, badge: '부장', isCouponWinner: false },
    { rank: 17, name: '문차장', userId: 'mooncha', time: '09:46', message: '차근차근 업무를 진행하는 스타일', streak: 26, badge: '차장', isCouponWinner: false },
    { rank: 18, name: '유대리', userId: 'yoodae', time: '09:53', message: '젊은 패기와 열정의 대리님', streak: 7, badge: '대리', isCouponWinner: false },
    { rank: 19, name: '강주임', userId: 'kangjuim', time: '10:01', message: '강한 의지력으로 시작하는 하루', streak: 16, badge: '주임', isCouponWinner: false },
    { rank: 20, name: '장사원', userId: 'jangsa', time: '10:08', message: '성장하는 사원의 모습이 보기 좋아요', streak: 5, badge: '사원', isCouponWinner: false },
    { rank: 21, name: '권과장', userId: 'kwongwa', time: '10:15', message: '권위 있는 과장님의 출근', streak: 21, badge: '과장', isCouponWinner: false },
    { rank: 22, name: '노팀장', userId: 'noteam', time: '10:22', message: '노련한 팀 운영의 달인', streak: 10, badge: '팀장', isCouponWinner: false },
    { rank: 23, name: '서실장', userId: 'seosil', time: '10:29', message: '서두르지 않는 여유로운 출근', streak: 23, badge: '실장', isCouponWinner: false },
    { rank: 24, name: '고부장', userId: 'gobu', time: '10:36', message: '고품격 업무 스타일의 부장님', streak: 4, badge: '부장', isCouponWinner: false },
    { rank: 25, name: '박승학', userId: 'parksh', time: '10:43', message: '오늘도 열심히 하겠습니다!', streak: 7, badge: '초보자', isCouponWinner: false },
    { rank: 26, name: '조대리', userId: 'jodae', time: '10:50', message: '조용하지만 확실한 업무 처리', streak: 12, badge: '대리', isCouponWinner: false },
    { rank: 27, name: '민주임', userId: 'minjuim', time: '10:57', message: '민첩한 업무 처리의 달인', streak: 9, badge: '주임', isCouponWinner: false },
    { rank: 28, name: '안사원', userId: 'ansa', time: '11:04', message: '안정적인 업무 수행의 모범', streak: 15, badge: '사원', isCouponWinner: false },
    { rank: 29, name: '심과장', userId: 'simgwa', time: '11:11', message: '심도 있는 분석의 전문가', streak: 6, badge: '과장', isCouponWinner: false },
    { rank: 30, name: '나팀장', userId: 'nateam', time: '11:18', message: '나만의 스타일로 팀을 이끄는 리더', streak: 18, badge: '팀장', isCouponWinner: false }
];

// 현재 사용자 정보 (실제로는 로그인 정보에서 가져옴)
const currentUser = {
    name: '박승학',
    userId: 'parksh',
    rank: 25, // 25등으로 설정 (30위 안에 포함)
    isCheckedIn: false,
    streak: 7,
    badge: '초보자'
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 페이지 로드 완료 ===');
    
    // 출석 버튼
    const checkInBtn = document.getElementById('checkInBtn');
    console.log('출석 버튼:', checkInBtn);
    
    // 테스트를 위해 출석 초기화
    localStorage.removeItem('lastCheckIn');
    localStorage.removeItem('attendanceStreak');
    localStorage.removeItem('lastStreakDate');
    console.log('출석 정보 초기화됨 - 테스트 가능');
    
    // 로컬 스토리지에서 출석 정보 가져오기
    const today = new Date().toDateString();
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    let isCheckedIn = lastCheckIn === today;
    
    // 이미 출석한 경우 버튼 상태 변경
    if (isCheckedIn) {
        updateCheckInButton(true);
    }
    
    // 이번달 마지막 날 계산 및 표시
    updateMonthDays();
    
    // 보너스 달성 상태 체크
    checkBonusAchievements();
    
    // 출석 보상 카드 업데이트
    updateRewardCards();
    
    // 출석 버튼 클릭 이벤트
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function() {
            console.log('출석 버튼 클릭됨, isCheckedIn:', isCheckedIn);
            if (!isCheckedIn) {
                performCheckIn();
                isCheckedIn = true;
            }
        });
    } else {
        console.error('출석 버튼을 찾을 수 없습니다!');
    }
    
    // 캘린더 네비게이션
    const prevBtn = document.querySelector('.calendar-nav-btn.prev');
    const nextBtn = document.querySelector('.calendar-nav-btn.next');
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
            if (this.classList.contains('attended') || this.classList.contains('checked')) {
                showAttendanceDetails(this);
            }
        });
    });
    
    // 통계 카드 애니메이션
    animateStatCards();
    
    // 보상 카드 호버 효과
    setupRewardCards();
    
    // 출석 현황 렌더링 - 약간의 지연 후 실행
    setTimeout(() => {
        console.log('출석 현황 렌더링 시작...');
        // 먼저 출석 명단 렌더링
        renderAttendanceList();
        // 그 다음 쿠폰 당첨자 선정
        selectCouponWinners();
        // 쿠폰 당첨자 선정 후 다시 렌더링
        setTimeout(() => {
            console.log('쿠폰 당첨자 반영을 위한 재렌더링');
            renderAttendanceList();
        }, 50);
    }, 100);
});

// 랜덤 메시지 선택 함수
function getRandomMessage() {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    return randomMessages[randomIndex];
}

// 출석 처리 함수
function performCheckIn() {
    console.log('performCheckIn 함수 시작');
    const btn = document.getElementById('checkInBtn');
    const messageInput = document.querySelector('.message-input');
    const today = new Date();
    
    if (!btn) {
        console.error('출석 버튼을 찾을 수 없습니다');
        return;
    }
    
    if (!messageInput) {
        console.error('메시지 입력창을 찾을 수 없습니다');
        return;
    }
    
    // 메시지 처리 (비어있으면 랜덤 메시지 사용)
    let userMessage = messageInput.value.trim();
    if (!userMessage) {
        userMessage = getRandomMessage();
        messageInput.value = userMessage;
    }
    console.log('출석 메시지:', userMessage);
    
    // 버튼 로딩 상태
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>처리중...</span>';
    btn.disabled = true;
    
    // 서버 요청 시뮬레이션
    setTimeout(() => {
        console.log('출석 처리 중...');
        
        // 로컬 스토리지에 출석 정보 저장
        localStorage.setItem('lastCheckIn', today.toDateString());
        
        // 연속 출석일 업데이트
        updateStreakCount();
        
        // 포인트 추가 (일일 출석 300포인트)
        addPoints(300);
        
        // 캘린더에 출석 표시
        markTodayAsAttended();
        
        // 버튼 상태 업데이트
        updateCheckInButton(true);
        
        // 순위에 따른 포인트 메시지
        let pointMessage = '300포인트';
        if (currentUser.rank >= 1 && currentUser.rank <= 3) {
            pointMessage = '1000포인트';
        } else if (currentUser.rank >= 4 && currentUser.rank <= 10) {
            pointMessage = '800포인트';
        } else if (currentUser.rank >= 11 && currentUser.rank <= 30) {
            pointMessage = '500포인트';
        }
        
        // 모달 표시 (모달이 없으므로 알림으로 대체)
        alert(`출석이 완료되었습니다! ${pointMessage}를 획득했습니다.`);
        
        // 통계 업데이트
        updateStatistics();
        
        // 출석 목록 업데이트
        updateMyAttendance();
        
        // 출석 보상 카드 업데이트
        updateRewardCards();
        
        // 애니메이션 효과
        celebrateCheckIn();
        
        console.log('출석 처리 완료!');
    }, 1000);
}

// 출석 버튼 상태 업데이트
function updateCheckInButton(isCheckedIn) {
    const btn = document.getElementById('checkInBtn');
    const checkStatus = document.querySelector('.check-status');
    
    if (isCheckedIn) {
        btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>출석 완료</span>';
        btn.classList.add('completed');
        btn.disabled = true;
        
        // 상태 메시지도 업데이트
        if (checkStatus) {
            checkStatus.innerHTML = '<i class="fas fa-check-circle"></i> <span>오늘 출석 완료!</span>';
            checkStatus.classList.remove('not-checked');
            checkStatus.classList.add('checked');
        }
    } else {
        btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>출석하기</span>';
        btn.classList.remove('completed');
        btn.disabled = false;
        
        if (checkStatus) {
            checkStatus.innerHTML = '<i class="fas fa-clock"></i> <span>아직 출석하지 않았습니다</span>';
            checkStatus.classList.add('not-checked');
            checkStatus.classList.remove('checked');
        }
    }
}

// 오늘 날짜를 출석으로 표시
function markTodayAsAttended() {
    const todayElement = document.querySelector('.calendar-day.today');
    if (todayElement) {
        todayElement.classList.add('checked');
        // 이미 체크 아이콘이 있는지 확인
        if (!todayElement.querySelector('.fa-check-circle')) {
            const checkIcon = document.createElement('i');
            checkIcon.className = 'fas fa-check-circle';
            todayElement.appendChild(checkIcon);
        }
        console.log('오늘 날짜 출석 체크 완료');
    } else {
        console.error('오늘 날짜 요소를 찾을 수 없습니다');
    }
}

// 연속 출석일 업데이트 (주말 포함)
function updateStreakCount() {
    let streak = parseInt(localStorage.getItem('attendanceStreak') || '0');
    const lastStreakDate = localStorage.getItem('lastStreakDate');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // 주말 포함하여 연속 출석 계산
    if (lastStreakDate === yesterday) {
        streak++;
    } else if (lastStreakDate !== today) {
        // 연속성이 끊어진 경우에만 1로 초기화
        streak = 1;
    }
    
    localStorage.setItem('attendanceStreak', streak.toString());
    localStorage.setItem('lastStreakDate', today);
    
    // UI 업데이트
    const streakElement = document.getElementById('streakCount');
    if (streakElement) {
        streakElement.textContent = streak + '일';
    }
    
    // 보너스 달성 상태 체크
    checkBonusAchievements();
}

// 포인트 추가
function addPoints(points) {
    let totalPoints = parseInt(localStorage.getItem('userPoints') || '0');
    totalPoints += points;
    localStorage.setItem('userPoints', totalPoints.toString());
}

// 통계 업데이트 (카운팅 애니메이션 포함)
function updateStatistics() {
    // 이번달 출석일수 카운트업 (첫 번째 카드)
    const monthlyElement = document.querySelector('.streak-info .streak-card:nth-child(1) .streak-count');
    if (monthlyElement) {
        const currentText = monthlyElement.textContent;
        const current = parseInt(currentText.replace('일', ''));
        animateCount(monthlyElement, current, current + 1, '일');
    }
    
    // 연속 출석일수는 updateStreakCount에서 처리됨
    
    // 획득 포인트 증가 (세 번째 카드)
    const pointsElement = document.querySelector('.streak-info .streak-card:nth-child(3) .streak-count');
    if (pointsElement) {
        const currentText = pointsElement.textContent;
        const current = parseInt(currentText.replace(/[^0-9]/g, ''));
        // 순위에 따른 포인트 계산
        let points = 300; // 기본값
        if (currentUser.rank >= 1 && currentUser.rank <= 3) {
            points = 1000;
        } else if (currentUser.rank >= 4 && currentUser.rank <= 10) {
            points = 800;
        } else if (currentUser.rank >= 11 && currentUser.rank <= 30) {
            points = 500;
        }
        animateCount(pointsElement, current, current + points, 'P');
    }
    
    // 출석률 업데이트 (네 번째 카드)
    const rateElement = document.querySelector('.streak-info .streak-card:nth-child(4) .streak-count');
    if (rateElement) {
        // 이번달 마지막 날 가져오기
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        
        const monthlyCountElement = document.querySelector('.streak-info .streak-card:nth-child(1) .streak-count');
        if (monthlyCountElement) {
            const attendanceDays = parseInt(monthlyCountElement.textContent.replace('일', ''));
            const rate = Math.round((attendanceDays / lastDayOfMonth) * 100);
            animateCount(rateElement, 0, rate, '%');
        }
    }
}

// 숫자 카운팅 애니메이션
function animateCount(element, start, end, suffix = '') {
    const duration = 1000; // 1초
    const increment = (end - start) / 20;
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString() + suffix;
    }, duration / 20);
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
    // 호버 효과 제거됨
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

// 출석 목록 렌더링 함수
function renderAttendanceList() {
    console.log('=== 출석 목록 렌더링 시작 ===');
    const attendanceList = document.getElementById('attendanceList');
    console.log('attendanceList 요소:', attendanceList);
    if (!attendanceList) {
        console.error('❌ attendanceList 요소를 찾을 수 없습니다');
        // 약간의 지연 후 재시도
        setTimeout(() => {
            const retryList = document.getElementById('attendanceList');
            if (retryList) {
                console.log('✅ 재시도에서 attendanceList 요소 발견');
                renderAttendanceListContent(retryList);
            }
        }, 100);
        return;
    }
    
    renderAttendanceListContent(attendanceList);
}

// 실제 출석 목록 렌더링
function renderAttendanceListContent(attendanceList) {
    
    // 상위 30명만 표시
    const top30 = attendanceData.slice(0, 30);
    console.log('상위 30명 데이터:', top30.length + '명');
    
    let htmlContent = '';
    let lastDivider = 0;
    
    top30.forEach((user, index) => {
        const isMyRank = user.name === currentUser.name;
        const rankClass = user.rank <= 3 ? `top-three rank-${user.rank}` : '';
        
        // 등수별 구분선 추가
        if (user.rank === 4 && lastDivider < 4) {
            htmlContent += '<div class="rank-divider">4~10등 구간</div>';
            lastDivider = 4;
        } else if (user.rank === 11 && lastDivider < 11) {
            htmlContent += '<div class="rank-divider">11~30등 구간</div>';
            lastDivider = 11;
        }
        
        // 등수별 포인트 설정
        let points = 300; // 기본값 (31등 이하)
        if (user.rank >= 1 && user.rank <= 3) {
            points = 1000;
        } else if (user.rank >= 4 && user.rank <= 10) {
            points = 800;
        } else if (user.rank >= 11 && user.rank <= 30) {
            points = 500;
        }
        
        // 메달 아이콘 설정
        let medalIcon = '';
        if (user.rank === 1) {
            medalIcon = '<i class="fas fa-medal medal-gold"></i>';
        } else if (user.rank === 2) {
            medalIcon = '<i class="fas fa-medal medal-silver"></i>';
        } else if (user.rank === 3) {
            medalIcon = '<i class="fas fa-medal medal-bronze"></i>';
        }
        
        htmlContent += `
            <div class="attendance-item ${isMyRank ? 'my-rank' : ''}">
                <div class="rank-wrapper">
                    ${medalIcon}
                    <span class="rank-number ${rankClass}">${user.rank}등</span>
                </div>
                <div class="check-time">${user.time}</div>
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-name-wrapper">
                    <span class="user-id">${user.userId}</span>
                    <span class="user-badge">${user.badge}</span>
                </div>
                <div class="user-message">${user.message}</div>
                ${user.isCouponWinner ? '<div class="coupon-winner"><i class="fas fa-ticket-alt"></i> 쿠폰 당첨!</div>' : ''}
                <div class="points-badge">+${points}P</div>
            </div>
        `;
    });
    
    // 내가 30위 밖인 경우 하단에 멘트 추가
    if (currentUser.rank > 30) {
        htmlContent += `
            <div class="out-of-rank-message">
                <i class="fas fa-info-circle"></i>
                <span>아쉽게도 오늘은 30등안에 들지 못했어요. 내일을 노려보세요!</span>
            </div>
        `;
    }
    
    console.log('HTML 콘텐츠 생성됨, 길이:', htmlContent.length);
    if (htmlContent.length > 0) {
        console.log('HTML 미리보기:', htmlContent.substring(0, 200) + '...');
        attendanceList.innerHTML = htmlContent;
        console.log('✅ 출석 목록 렌더링 완료!');
        console.log('렌더링된 요소 개수:', attendanceList.children.length);
    } else {
        console.error('⚠️ HTML 콘텐츠가 비어있습니다!');
        attendanceList.innerHTML = '<div class="no-data">아직 출석한 사용자가 없습니다.</div>';
    }
}

// 쿠폰 당첨자 선정 함수 (재렌더링 없음)
function selectCouponWinners() {
    console.log('=== 쿠폰 당첨자 선정 시작 ===');
    
    // 먼저 모든 isCouponWinner를 false로 초기화
    attendanceData.forEach(user => {
        user.isCouponWinner = false;
    });
    
    // 3명 이상 출석했을 때만 당첨자 선정
    if (attendanceData.length >= 3) {
        // 1~3등 중 랜덤 1명
        const group1 = attendanceData.filter(u => u.rank >= 1 && u.rank <= 3);
        if (group1.length > 0) {
            const winner1Index = Math.floor(Math.random() * group1.length);
            const winner1 = group1[winner1Index];
            
            // 실제 데이터에 당첨 표시
            const dataIndex = attendanceData.findIndex(u => u.name === winner1.name);
            if (dataIndex >= 0) {
                attendanceData[dataIndex].isCouponWinner = true;
            }
            
            const winner1Element = document.getElementById('winner1');
            if (winner1Element) {
                winner1Element.textContent = `🎉 ${winner1.name}`;
                winner1Element.className = 'winner-badge winner-selected';
                console.log('1~3등 당첨자:', winner1.name);
            } else {
                console.error('winner1 요소를 찾을 수 없음');
            }
        }
        
        // 4~10등 중 랜덤 1명
        const group2 = attendanceData.filter(u => u.rank >= 4 && u.rank <= 10);
        if (group2.length > 0) {
            const winner2Index = Math.floor(Math.random() * group2.length);
            const winner2 = group2[winner2Index];
            
            // 실제 데이터에 당첨 표시
            const dataIndex = attendanceData.findIndex(u => u.name === winner2.name);
            if (dataIndex >= 0) {
                attendanceData[dataIndex].isCouponWinner = true;
            }
            
            const winner2Element = document.getElementById('winner2');
            if (winner2Element) {
                winner2Element.textContent = `🎉 ${winner2.name}`;
                winner2Element.className = 'winner-badge winner-selected';
            }
        }
        
        // 11~30등 중 랜덤 2명
        const group3 = attendanceData.filter(u => u.rank >= 11 && u.rank <= 30);
        if (group3.length > 0) {
            // 첫 번째 당첨자
            const winner3_1Index = Math.floor(Math.random() * group3.length);
            const winner3_1 = group3[winner3_1Index];
            
            // 실제 데이터에 당첨 표시
            const dataIndex1 = attendanceData.findIndex(u => u.name === winner3_1.name);
            if (dataIndex1 >= 0) {
                attendanceData[dataIndex1].isCouponWinner = true;
            }
            
            const winner3_1Element = document.getElementById('winner3-1');
            if (winner3_1Element) {
                winner3_1Element.textContent = `🎉 ${winner3_1.name}`;
                winner3_1Element.className = 'winner-badge winner-selected';
            }
            
            // 두 번째 당첨자 (첫 번째와 다른 사람)
            const remainingGroup3 = group3.filter(u => u.name !== winner3_1.name);
            if (remainingGroup3.length > 0) {
                const winner3_2Index = Math.floor(Math.random() * remainingGroup3.length);
                const winner3_2 = remainingGroup3[winner3_2Index];
                
                // 실제 데이터에 당첨 표시
                const dataIndex2 = attendanceData.findIndex(u => u.name === winner3_2.name);
                if (dataIndex2 >= 0) {
                    attendanceData[dataIndex2].isCouponWinner = true;
                }
                
                const winner3_2Element = document.getElementById('winner3-2');
                if (winner3_2Element) {
                    winner3_2Element.textContent = `🎉 ${winner3_2.name}`;
                    winner3_2Element.className = 'winner-badge winner-selected';
                }
            }
        }
    }
    
    console.log('=== 쿠폰 당첨자 선정 완료 ===');
    // 당첨자 확인 로그
    const winners = attendanceData.filter(u => u.isCouponWinner === true);
    console.log('총 당첨자 수:', winners.length);
    console.log('당첨자 명단:', winners.map(w => `${w.rank}등 ${w.name}`));
}

// 내 출석 후 순위 업데이트
function updateMyAttendance() {
    // 출석 후 현재 사용자의 정보를 출석 목록에 추가/업데이트
    const currentTime = new Date();
    const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    const messageInput = document.querySelector('.message-input');
    const userMessage = messageInput.value.trim() || getRandomMessage();
    
    // 사용자가 이미 목록에 있는지 확인
    const existingUserIndex = attendanceData.findIndex(user => user.name === currentUser.name);
    
    if (existingUserIndex >= 0) {
        // 이미 있으면 업데이트
        attendanceData[existingUserIndex] = {
            ...attendanceData[existingUserIndex],
            time: timeString,
            message: userMessage
        };
    } else {
        // 없으면 새로 추가 (맨 뒤에)
        attendanceData.push({
            rank: attendanceData.length + 1,
            name: currentUser.name,
            time: timeString,
            message: userMessage,
            points: 300
        });
    }
    
    // 출석 상태 업데이트
    currentUser.isCheckedIn = true;
    
    // 출석 목록 재렌더링
    renderAttendanceList();
}

// 내 순위 정보 표시 함수
function displayMyRankInfo() {
    // 현재는 빈 함수 (필요시 구현)
    console.log('내 순위 정보 표시');
}

// 이번달 마지막 날 계산 및 표시
function updateMonthDays() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const monthDaysElement = document.getElementById('monthDays');
    if (monthDaysElement) {
        monthDaysElement.textContent = lastDay;
    }
    
    return lastDay;
}

// 보너스 달성 상태 체크
function checkBonusAchievements() {
    const streakCount = parseInt(localStorage.getItem('attendanceStreak') || '0');
    const monthDays = updateMonthDays();
    
    // 7일 연속 달성 체크
    const bonus7days = document.getElementById('bonus7days');
    if (streakCount >= 7 && bonus7days) {
        bonus7days.classList.add('achieved');
        if (!bonus7days.querySelector('.achievement-badge')) {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.innerHTML = '<i class="fas fa-check-circle"></i> 달성!';
            bonus7days.appendChild(badge);
        }
    }
    
    // 이번달 출석률 100% 달성 체크
    const bonusMonthly = document.getElementById('bonusMonthly');
    const today = new Date();
    const dayOfMonth = today.getDate();
    const monthlyElement = document.querySelector('.streak-info .streak-card:nth-child(1) .streak-count');
    
    if (monthlyElement) {
        const attendanceDays = parseInt(monthlyElement.textContent.replace('일', ''));
        // 현재까지의 날짜와 출석일수가 같으면 100% 달성
        if (attendanceDays === dayOfMonth && bonusMonthly) {
            bonusMonthly.classList.add('achieved');
            if (!bonusMonthly.querySelector('.achievement-badge')) {
                const badge = document.createElement('div');
                badge.className = 'achievement-badge';
                badge.innerHTML = '<i class="fas fa-check-circle"></i> 달성!';
                bonusMonthly.appendChild(badge);
            }
        }
    }
    
    // 매일 30위 순위권 달성 체크 (예시로 설정)
    const bonusTop30 = document.getElementById('bonusTop30');
    const isTop30EveryDay = checkTop30EveryDay(); // 실제 체크 로직 필요
    if (isTop30EveryDay && bonusTop30) {
        bonusTop30.classList.add('achieved');
        if (!bonusTop30.querySelector('.achievement-badge')) {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.innerHTML = '<i class="fas fa-check-circle"></i> 달성!';
            bonusTop30.appendChild(badge);
        }
    }
}

// 매일 30위 순위권 체크 (예시 함수)
function checkTop30EveryDay() {
    // 실제로는 서버에서 매일 순위 데이터를 받아와야 함
    // 여기서는 예시로 false 반환
    return false;
}

// 출석 보상 카드 업데이트 함수
function updateRewardCards() {
    const userRank = currentUser.rank;
    
    // 모든 보상 카드 선택
    const rewardCards = document.querySelectorAll('.reward-card');
    
    rewardCards.forEach((card, index) => {
        // 카드 초기화
        card.classList.remove('achieved', 'current-rank');
        const existingBadge = card.querySelector('.achievement-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // 순위에 따라 해당 카드 강조
        if (index === 0 && userRank >= 1 && userRank <= 3) {
            // 1~3등
            card.classList.add('current-rank');
            addAchievementBadge(card);
        } else if (index === 1 && userRank >= 4 && userRank <= 10) {
            // 4~10등
            card.classList.add('current-rank');
            addAchievementBadge(card);
        } else if (index === 2 && userRank >= 11 && userRank <= 30) {
            // 11~30등
            card.classList.add('current-rank');
            addAchievementBadge(card);
        } else if (index === 3 && userRank > 30) {
            // 31등 이하
            card.classList.add('current-rank');
            addAchievementBadge(card);
        }
    });
}

// 달성 배지 추가 함수
function addAchievementBadge(card) {
    const badge = document.createElement('div');
    badge.className = 'achievement-badge';
    badge.innerHTML = '<i class="fas fa-check-circle"></i> 해당!';
    card.appendChild(badge);
}

// 축하 애니메이션 CSS 추가
const celebrateStyle = document.createElement('style');
celebrateStyle.textContent = `
    @keyframes celebrate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(celebrateStyle);