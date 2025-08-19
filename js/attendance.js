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

// 오늘의 출석현황 - 임의 테스트 회원 50명 중 30명이 출석 (실제 사용자 출석 시 31번째로 추가됨)
let attendanceData = [
    { rank: 1, name: '테스트1', userId: 'test001', time: '07:58', message: '오늘도 첫 출석! 좋은 하루 되세요!', streak: 25, badge: '소통왕', isCouponWinner: false },
    { rank: 2, name: '테스트2', userId: 'test002', time: '08:03', message: '일찍 일어나는 새가 벌레를 잡는다!', streak: 18, badge: '열정맨', isCouponWinner: false },
    { rank: 3, name: '테스트3', userId: 'test003', time: '08:12', message: '오늘도 팀원들과 함께 화이팅!', streak: 31, badge: '베테랑', isCouponWinner: false },
    { rank: 4, name: '테스트4', userId: 'test004', time: '08:18', message: '전문성으로 무장한 하루 시작!', streak: 12, badge: '전문가', isCouponWinner: false },
    { rank: 5, name: '테스트5', userId: 'test005', time: '08:25', message: '분양의 달인이 출석했습니다', streak: 22, badge: '스타', isCouponWinner: false },
    { rank: 6, name: '테스트6', userId: 'test006', time: '08:31', message: '관리의 프로가 등장!', streak: 15, badge: '매니저', isCouponWinner: false },
    { rank: 7, name: '테스트7', userId: 'test007', time: '08:38', message: '실장의 카리스마로 하루 시작', streak: 28, badge: '리더', isCouponWinner: false },
    { rank: 8, name: '테스트8', userId: 'test008', time: '08:44', message: '부장의 리더십이 빛나는 아침', streak: 9, badge: '부장', isCouponWinner: false },
    { rank: 9, name: '테스트9', userId: 'test009', time: '08:51', message: '차장의 안정감 있는 출근', streak: 17, badge: '차장', isCouponWinner: false },
    { rank: 10, name: '테스트10', userId: 'test010', time: '08:57', message: '대리의 성실함이 돋보이는 아침', streak: 11, badge: '대리', isCouponWinner: false },
    { rank: 11, name: '테스트11', userId: 'test011', time: '09:04', message: '주임의 책임감으로 시작하는 하루', streak: 8, badge: '주임', isCouponWinner: false },
    { rank: 12, name: '테스트12', userId: 'test012', time: '09:11', message: '신입의 패기로 가득한 아침!', streak: 14, badge: '신입', isCouponWinner: false },
    { rank: 13, name: '테스트13', userId: 'test013', time: '09:18', message: '과장의 중간 관리 능력 발휘!', streak: 20, badge: '과장', isCouponWinner: false },
    { rank: 14, name: '테스트14', userId: 'test014', time: '09:25', message: '팀을 이끄는 리더의 출근', streak: 6, badge: '팀장', isCouponWinner: false },
    { rank: 15, name: '테스트15', userId: 'test015', time: '09:32', message: '실무 경험의 깊이를 보여주는 아침', streak: 19, badge: '실장', isCouponWinner: false },
    { rank: 16, name: '테스트16', userId: 'test016', time: '09:39', message: '부서를 총괄하는 리더의 등장', streak: 13, badge: '부장', isCouponWinner: false },
    { rank: 17, name: '테스트17', userId: 'test017', time: '09:46', message: '차근차근 업무를 진행하는 스타일', streak: 26, badge: '차장', isCouponWinner: false },
    { rank: 18, name: '테스트18', userId: 'test018', time: '09:53', message: '젊은 패기와 열정의 대리님', streak: 7, badge: '대리', isCouponWinner: false },
    { rank: 19, name: '테스트19', userId: 'test019', time: '10:01', message: '강한 의지력으로 시작하는 하루', streak: 16, badge: '주임', isCouponWinner: false },
    { rank: 20, name: '테스트20', userId: 'test020', time: '10:08', message: '성장하는 사원의 모습이 보기 좋아요', streak: 5, badge: '사원', isCouponWinner: false },
    { rank: 21, name: '테스트21', userId: 'test021', time: '10:15', message: '권위 있는 과장님의 출근', streak: 21, badge: '과장', isCouponWinner: false },
    { rank: 22, name: '테스트22', userId: 'test022', time: '10:22', message: '노련한 팀 운영의 달인', streak: 10, badge: '팀장', isCouponWinner: false },
    { rank: 23, name: '테스트23', userId: 'test023', time: '10:29', message: '서두르지 않는 여유로운 출근', streak: 23, badge: '실장', isCouponWinner: false },
    { rank: 24, name: '테스트24', userId: 'test024', time: '10:36', message: '고품격 업무 스타일의 부장님', streak: 4, badge: '부장', isCouponWinner: false },
    { rank: 25, name: '테스트25', userId: 'test025', time: '10:43', message: '차분한 리더십의 차장님', streak: 7, badge: '차장', isCouponWinner: false },
    { rank: 26, name: '테스트26', userId: 'test026', time: '10:50', message: '조용하지만 확실한 업무 처리', streak: 12, badge: '대리', isCouponWinner: false },
    { rank: 27, name: '테스트27', userId: 'test027', time: '10:57', message: '민첩한 업무 처리의 달인', streak: 9, badge: '주임', isCouponWinner: false },
    { rank: 28, name: '테스트28', userId: 'test028', time: '11:04', message: '안정적인 업무 수행의 모범', streak: 15, badge: '사원', isCouponWinner: false },
    { rank: 29, name: '테스트29', userId: 'test029', time: '11:11', message: '심도 있는 분석의 전문가', streak: 6, badge: '과장', isCouponWinner: false },
    { rank: 30, name: '테스트30', userId: 'test030', time: '11:15', message: '늦어도 꾸준히 출석하는 성실함!', streak: 10, badge: '팀장', isCouponWinner: false }
];

// 배지 텍스트를 아이콘으로 변환하는 함수
function getBadgeIcon(badgeText) {
    const badgeMap = {
        '소통왕': '<i class="fas fa-comments" style="color: #FF6B6B;"></i>',
        '열정맨': '<i class="fas fa-fire" style="color: #FF9800;"></i>',
        '베테랑': '<i class="fas fa-medal" style="color: #FFD700;"></i>',
        '전문가': '<i class="fas fa-user-graduate" style="color: #4CAF50;"></i>',
        '스타': '<i class="fas fa-star" style="color: #FFC107;"></i>',
        '매니저': '<i class="fas fa-user-tie" style="color: #2196F3;"></i>',
        '리더': '<i class="fas fa-crown" style="color: #9C27B0;"></i>',
        '부장': '<i class="fas fa-briefcase" style="color: #795548;"></i>',
        '차장': '<i class="fas fa-user-cog" style="color: #607D8B;"></i>',
        '대리': '<i class="fas fa-user-check" style="color: #00BCD4;"></i>',
        '주임': '<i class="fas fa-user-clock" style="color: #8BC34A;"></i>',
        '사원': '<i class="fas fa-user" style="color: #9E9E9E;"></i>',
        '신입': '<i class="fas fa-user-plus" style="color: #03A9F4;"></i>',
        '과장': '<i class="fas fa-user-shield" style="color: #FF5722;"></i>',
        '팀장': '<i class="fas fa-users" style="color: #673AB7;"></i>',
        '실장': '<i class="fas fa-user-ninja" style="color: #E91E63;"></i>'
    };
    
    return badgeMap[badgeText] || '<i class="fas fa-certificate" style="color: #999;"></i>';
}

// 서버 시간 가져오기 (실제 서버 API 호출 시뮬레이션)
function getServerTime() {
    // 실제 환경에서는 서버 API를 호출하여 시간을 받아옴
    // 예: fetch('/api/server-time').then(res => res.json())
    
    // 여기서는 한국 표준시(KST)를 기준으로 실시간 시간 사용
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kstTime = new Date(utc + (9 * 3600000)); // UTC+9 (한국 시간)
    
    console.log('서버 시간 (KST):', kstTime.toLocaleString('ko-KR'));
    return kstTime;
}

// 오늘 날짜 가져오기 (서버 시간 기준)
function getTodayDate() {
    const serverTime = getServerTime();
    return serverTime.toDateString();
}

// 달력에서 오늘 날짜 업데이트 (서버 시간 기준)
function updateTodayInCalendar() {
    const serverTime = getServerTime();
    const todayDate = serverTime.getDate();
    const currentMonth = serverTime.getMonth();
    const currentYear = serverTime.getFullYear();
    
    console.log(`서버 기준 오늘: ${currentYear}년 ${currentMonth + 1}월 ${todayDate}일`);
    
    // 기존 today 클래스 제거
    const oldToday = document.querySelector('.calendar-day.today');
    if (oldToday) {
        oldToday.classList.remove('today');
    }
    
    // 현재 달력이 표시하는 년월 확인
    const calendarTitle = document.querySelector('.calendar-title');
    if (calendarTitle) {
        calendarTitle.textContent = `${currentYear}년 ${currentMonth + 1}월`;
    }
    
    // 모든 달력 날짜 요소 확인
    const calendarDays = document.querySelectorAll('.calendar-day:not(.other-month)');
    calendarDays.forEach(dayElement => {
        const dayNumber = dayElement.querySelector('.day-number');
        if (dayNumber && parseInt(dayNumber.textContent) === todayDate) {
            dayElement.classList.add('today');
            console.log(`${todayDate}일에 today 클래스 추가됨`);
        }
    });
}

// 날짜 표시 업데이트
function updateDateDisplay() {
    const serverTime = getServerTime();
    const dateDisplay = document.querySelector('.today-date');
    if (dateDisplay) {
        const year = serverTime.getFullYear();
        const month = serverTime.getMonth() + 1;
        const date = serverTime.getDate();
        const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const dayName = dayNames[serverTime.getDay()];
        
        dateDisplay.textContent = `${year}년 ${month}월 ${date}일 ${dayName}`;
    }
}

// 달력에 저장된 출석 표시하기
function updateCalendarWithAttendances() {
    const attendanceDates = getAttendanceDates();
    const serverTime = getServerTime();
    const currentMonth = serverTime.getMonth();
    const currentYear = serverTime.getFullYear();
    
    console.log('달력 출석 표시 업데이트, 저장된 날짜:', attendanceDates);
    
    // 이번달 출석 날짜들만 필터링
    const monthlyAttendances = attendanceDates.filter(dateString => {
        const date = new Date(dateString);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    console.log('이번달 출석 날짜들:', monthlyAttendances);
    
    // 달력의 모든 날짜 요소 가져오기
    const calendarDays = document.querySelectorAll('.calendar-day:not(.other-month)');
    
    monthlyAttendances.forEach(dateString => {
        const date = new Date(dateString);
        const dayNumber = date.getDate();
        
        // 해당 날짜 요소 찾기
        calendarDays.forEach(dayElement => {
            const dayNumElement = dayElement.querySelector('.day-number');
            if (dayNumElement && parseInt(dayNumElement.textContent) === dayNumber) {
                // 이미 체크되어 있지 않으면 체크 표시 추가
                if (!dayElement.classList.contains('checked')) {
                    dayElement.classList.add('checked');
                    if (!dayElement.querySelector('.fa-check-circle')) {
                        const checkIcon = document.createElement('i');
                        checkIcon.className = 'fas fa-check-circle';
                        dayElement.appendChild(checkIcon);
                    }
                    console.log(`${dayNumber}일에 출석 체크 표시 추가`);
                }
            }
        });
    });
}

// 출석 날짜 가져오기 (함수를 먼저 정의)
function getAttendanceDates() {
    const savedDates = localStorage.getItem('attendanceDates');
    return savedDates ? JSON.parse(savedDates) : [];
}

// 현재 사용자 정보 (실제로는 로그인 정보에서 가져옴)
const currentUser = {
    name: '박승학',
    userId: 'parksh',
    rank: null, // 출석 시 동적으로 결정됨
    isCheckedIn: false,
    streak: 7,
    badge: '소통왕'  // 배지 텍스트 변경
};

// 실시간 업데이트를 위한 변수
let updateInterval = null;
let midnightTimeout = null;

// 자정에 페이지 새로고침
function scheduleMidnightRefresh() {
    const now = getServerTime();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    console.log(`자정까지 남은 시간: ${Math.floor(timeUntilMidnight / 1000 / 60)}분`);
    
    // 기존 타임아웃 제거
    if (midnightTimeout) {
        clearTimeout(midnightTimeout);
    }
    
    // 자정에 실행될 함수
    midnightTimeout = setTimeout(() => {
        console.log('자정이 되어 달력을 새로고침합니다.');
        
        // 날짜 변경 처리
        const newDate = getServerTime();
        updateDateDisplay();
        updateCalendar(newDate, true);
        updateTodayInCalendar();
        
        // 출석 버튼 초기화
        const checkInBtn = document.getElementById('checkInBtn');
        if (checkInBtn) {
            updateCheckInButton(false);
            checkInBtn.disabled = false;
        }
        
        // 다음 자정 스케줄링
        scheduleMidnightRefresh();
    }, timeUntilMidnight);
}

// 실시간 시간 업데이트 (1분마다)
function startRealtimeUpdate() {
    // 기존 인터벌 제거
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // 1분마다 시간 업데이트
    updateInterval = setInterval(() => {
        updateDateDisplay();
    }, 60000); // 60초마다
}

// 페이지 가시성 변경 시 업데이트
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 탭이 다시 활성화되면 즉시 업데이트
        console.log('탭이 활성화되어 시간을 업데이트합니다.');
        const serverTime = getServerTime();
        updateDateDisplay();
        updateTodayInCalendar();
        
        // 날짜가 바뀌었을 수 있으므로 체크
        const currentDate = serverTime.toDateString();
        const lastCheckIn = localStorage.getItem('lastCheckIn');
        if (currentDate !== lastCheckIn) {
            // 새로운 날이면 출석 버튼 활성화
            const checkInBtn = document.getElementById('checkInBtn');
            if (checkInBtn && checkInBtn.disabled) {
                updateCheckInButton(false);
                checkInBtn.disabled = false;
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 페이지 로드 완료 ===');
    
    // 서버 시간 표시
    const serverTime = getServerTime();
    console.log('현재 서버 시간:', serverTime.toLocaleString('ko-KR'));
    
    // 초기 달력 생성 (서버 시간 기준)
    updateCalendar(serverTime, false); // 초기 로드 시 애니메이션 없이
    
    // 날짜 표시 업데이트
    updateDateDisplay();
    
    // 실시간 업데이트 시작
    startRealtimeUpdate();
    
    // 자정 새로고침 스케줄링
    scheduleMidnightRefresh();
    
    // 출석 버튼
    const checkInBtn = document.getElementById('checkInBtn');
    console.log('출석 버튼:', checkInBtn);
    
    // 테스트 모드 확인 (실제 환경에서는 false로 설정)
    const isTestMode = false; // 테스트 완료 후 false로 변경
    
    if (isTestMode) {
        // 테스트 모드일 때만 초기화
        localStorage.removeItem('lastCheckIn');
        localStorage.removeItem('attendanceStreak');
        localStorage.removeItem('lastStreakDate');
        localStorage.removeItem('attendanceDates');
        localStorage.removeItem('userPoints');
        console.log('테스트 모드: 출석 정보 초기화됨');
    } else {
        console.log('실제 모드: 기존 출석 정보 유지');
        
        // 테스트를 위해 샘플 출석 데이터 추가 (필요시 주석 처리)
        // const existingDates = getAttendanceDates();
        // if (existingDates.length === 0) {
        //     // 이번달 1일 출석 데이터 추가 (테스트용)
        //     const serverTime = getServerTime();
        //     const testDate = new Date(serverTime.getFullYear(), serverTime.getMonth(), 1);
        //     saveAttendanceDate(testDate);
        //     console.log('테스트용 출석 데이터 추가: 이번달 1일');
        // }
    }
    
    // 로컬 스토리지에서 출석 정보 가져오기 (서버 시간 기준)
    const today = getTodayDate(); // 서버 시간 기준
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    let isCheckedIn = lastCheckIn === today;
    
    // 통계 초기화를 즉시 실행 (모두 0으로 시작)
    initializeStatistics();
    
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
    
    // 달력 및 통계 초기화 제거 (이미 initializeStatistics에서 처리)
    // 달력 초기화는 필요시에만 별도 실행
    
    // 달력 섹션 디버깅 - 의도하지 않은 텍스트 확인
    const calendarSection = document.querySelector('.calendar-section');
    if (calendarSection) {
        console.log('달력 섹션 텍스트 콘텐츠:', calendarSection.textContent);
        // 달력 헤더 체크
        const calendarHeader = calendarSection.querySelector('.calendar-header');
        if (calendarHeader) {
            console.log('달력 헤더 자식 노드:', calendarHeader.childNodes);
        }
    }
    
    // 출석 버튼 클릭 이벤트
    if (checkInBtn) {
        checkInBtn.addEventListener('click', function() {
            console.log('출석 버튼 클릭됨, isCheckedIn:', isCheckedIn);
            if (!isCheckedIn) {
                try {
                    performCheckIn();
                    isCheckedIn = true;
                } catch (error) {
                    console.error('출석 처리 중 오류:', error);
                    alert('출석 처리 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
                }
            } else {
                console.log('이미 출석했습니다.');
            }
        });
    } else {
        console.error('출석 버튼을 찾을 수 없습니다!');
    }
    
    // 캘린더 네비게이션
    const prevBtn = document.querySelector('.calendar-nav-btn.prev');
    const nextBtn = document.querySelector('.calendar-nav-btn.next');
    let currentMonth = getServerTime(); // 서버 시간 기준
    let isNavigating = false; // 네비게이션 중복 방지
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (isNavigating) return; // 이미 처리 중이면 무시
            
            isNavigating = true;
            prevBtn.classList.add('disabled');
            nextBtn.classList.add('disabled');
            
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            updateCalendar(currentMonth, true, 'prev');
            
            // 350ms 후에 다시 클릭 가능
            setTimeout(() => {
                isNavigating = false;
                prevBtn.classList.remove('disabled');
                nextBtn.classList.remove('disabled');
            }, 350);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (isNavigating) return; // 이미 처리 중이면 무시
            
            isNavigating = true;
            prevBtn.classList.add('disabled');
            nextBtn.classList.add('disabled');
            
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            updateCalendar(currentMonth, true, 'next');
            
            // 350ms 후에 다시 클릭 가능
            setTimeout(() => {
                isNavigating = false;
                prevBtn.classList.remove('disabled');
                nextBtn.classList.remove('disabled');
            }, 350);
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
    
    // 출석 현황 렌더링 - 테스트용 29명 이미 표시
    setTimeout(() => {
        console.log('출석 현황 렌더링 시작...');
        
        // 저장된 출석 데이터 확인 및 로드
        const savedAttendance = localStorage.getItem('todayAttendance');
        const lastCheckIn = localStorage.getItem('lastCheckIn');
        const today = getServerTime().toDateString();
        
        if (savedAttendance && lastCheckIn === today) {
            // 오늘 이미 출석한 경우, 저장된 데이터 로드
            attendanceData = JSON.parse(savedAttendance);
            console.log('저장된 출석 데이터 로드:', attendanceData.length + '명');
            
            // 현재 사용자가 출석했는지 확인
            const myAttendance = attendanceData.find(user => user.name === currentUser.name);
            if (myAttendance) {
                currentUser.isCheckedIn = true;
                currentUser.rank = myAttendance.rank;
                updateCheckInButton(true);
            }
            
            // 30명 이상이면 쿠폰 당첨자 표시 복원
            if (attendanceData.length >= 30) {
                displayCouponWinners();
            }
        } else {
            // 새로운 날짜거나 저장된 데이터가 없는 경우
            console.log('테스트 데이터 사용 (30명)');
        }
        
        // 출석 명단 렌더링
        renderAttendanceList();
        
        // 테스트 데이터가 30명이면 쿠폰 추첨 실행 (DOM 렌더링 후 실행)
        if (!savedAttendance && attendanceData.length >= 30) {
            setTimeout(() => {
                console.log('테스트 데이터 30명 확인, 쿠폰 추첨 시작');
                // DOM 요소가 준비되었는지 확인
                const checkElements = setInterval(() => {
                    const winner1 = document.getElementById('winner1');
                    const winner2 = document.getElementById('winner2');
                    const winner3_1 = document.getElementById('winner3-1');
                    const winner3_2 = document.getElementById('winner3-2');
                    
                    if (winner1 && winner2 && winner3_1 && winner3_2) {
                        clearInterval(checkElements);
                        console.log('DOM 요소 준비 완료, 쿠폰 추첨 실행');
                        selectCouponWinners();
                        // 쿠폰 당첨 후 출석 목록 재렌더링
                        renderAttendanceList();
                    } else {
                        console.log('DOM 요소 대기 중...');
                    }
                }, 100);
                
                // 최대 2초 대기
                setTimeout(() => clearInterval(checkElements), 2000);
            }, 300);
        }
    }, 100);
});

// 통계 초기화 함수 - 순서대로 카운팅
function initializeStatistics() {
    console.log('통계 초기화 시작');
    
    // 저장된 출석 데이터 확인
    const attendanceDates = getAttendanceDates();
    const serverTime = getServerTime();
    const currentMonth = serverTime.getMonth();
    const currentYear = serverTime.getFullYear();
    
    // 이번달 출석일수 계산
    const monthlyAttendances = attendanceDates.filter(dateString => {
        const date = new Date(dateString);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyCount = monthlyAttendances.length;
    console.log('이번달 출석일수:', monthlyCount);
    
    // 연속 출석일수 가져오기
    const streakCount = parseInt(localStorage.getItem('attendanceStreak') || '0');
    
    // 획득 포인트 계산
    const totalPoints = monthlyCount * 500;
    
    // 출석률 계산 - 이번달 전체 일수 기준
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const attendanceRate = lastDayOfMonth > 0 ? Math.round((monthlyCount / lastDayOfMonth) * 100) : 0;
    
    // 통계 카드들을 왼쪽부터 순서대로 애니메이션
    const cards = [
        { selector: '.streak-info .streak-card:nth-child(1) .streak-count', value: monthlyCount, suffix: '일', delay: 0 },
        { selector: '.streak-info .streak-card:nth-child(2) .streak-count', value: streakCount, suffix: '일', delay: 300 },
        { selector: '.streak-info .streak-card:nth-child(3) .streak-count', value: totalPoints, suffix: 'P', delay: 600 },
        { selector: '.streak-info .streak-card:nth-child(4) .streak-count', value: attendanceRate, suffix: '%', delay: 900 }
    ];
    
    cards.forEach((card, index) => {
        const element = document.querySelector(card.selector);
        if (element) {
            // 초기값 0으로 설정
            element.textContent = '0' + card.suffix;
            
            // 각 카드별로 순차적으로 카운팅 시작
            setTimeout(() => {
                animateCount(element, 0, card.value, card.suffix);
            }, card.delay);
        }
    });
    
    // 달력에도 출석 표시 동기화
    updateCalendarWithAttendances();
}

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
    const today = getServerTime(); // 서버 시간 사용
    
    if (!btn) {
        console.error('출석 버튼을 찾을 수 없습니다');
        return;
    }
    
    // 메시지 처리 (비어있으면 랜덤 메시지 사용)
    let userMessage = '';
    if (messageInput) {
        userMessage = messageInput.value.trim();
    }
    if (!userMessage) {
        userMessage = getRandomMessage();
        if (messageInput) {
            messageInput.value = userMessage;
        }
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
        
        // 출석 날짜 저장
        saveAttendanceDate(today);
        
        // 연속 출석일 업데이트
        updateStreakCount();
        
        // 포인트 추가 (30등은 500포인트)
        addPoints(500);
        
        // 캘린더에 출석 표시
        markTodayAsAttended();
        
        // 버튼 상태 업데이트
        updateCheckInButton(true);
        
        // 포인트 팝업 제거 - 출석만 조용히 처리
        console.log('출석 완료: 500포인트 획득');
        
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
        
        // 통계도 즉시 업데이트
        updateAllStatisticsAfterCheckIn();
    } else {
        console.error('오늘 날짜 요소를 찾을 수 없습니다');
    }
}

// 출석 후 모든 통계 업데이트
function updateAllStatisticsAfterCheckIn() {
    // 저장된 출석 데이터 다시 가져오기
    const attendanceDates = getAttendanceDates();
    const serverTime = getServerTime();
    const currentMonth = serverTime.getMonth();
    const currentYear = serverTime.getFullYear();
    
    // 이번달 출석일수 계산
    const monthlyAttendances = attendanceDates.filter(dateString => {
        const date = new Date(dateString);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyCount = monthlyAttendances.length;
    
    // 이번달 출석일수 업데이트
    const monthlyElement = document.querySelector('.streak-info .streak-card:nth-child(1) .streak-count');
    if (monthlyElement) {
        monthlyElement.textContent = monthlyCount + '일';
    }
    
    // 연속 출석일수 업데이트
    const streakElement = document.querySelector('.streak-info .streak-card:nth-child(2) .streak-count');
    if (streakElement) {
        const streak = parseInt(localStorage.getItem('attendanceStreak') || '1');
        streakElement.textContent = streak + '일';
    }
    
    // 포인트 업데이트
    const pointsElement = document.querySelector('.streak-info .streak-card:nth-child(3) .streak-count');
    if (pointsElement) {
        const totalPoints = monthlyCount * 500;
        pointsElement.textContent = totalPoints + 'P';
    }
    
    // 출석률 업데이트 - 이번달 전체 일수 기준
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const attendanceRate = lastDayOfMonth > 0 ? Math.round((monthlyCount / lastDayOfMonth) * 100) : 0;
    const rateElement = document.querySelector('.streak-info .streak-card:nth-child(4) .streak-count');
    if (rateElement) {
        rateElement.textContent = attendanceRate + '%';
    }
}

// 연속 출석일 업데이트 (주말 포함)
function updateStreakCount() {
    let streak = parseInt(localStorage.getItem('attendanceStreak') || '0');
    const lastStreakDate = localStorage.getItem('lastStreakDate');
    const today = getTodayDate(); // 서버 시간 기준
    const serverTime = getServerTime();
    const yesterday = new Date(serverTime.getTime() - 86400000).toDateString();
    
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
        const current = parseInt(currentText.replace('일', '') || '0');
        // 출석한 것을 1 증가
        animateCount(monthlyElement, current, current + 1, '일');
    }
    
    // 연속 출석일수는 updateStreakCount에서 처리됨
    
    // 획득 포인트 증가 (세 번째 카드)
    const pointsElement = document.querySelector('.streak-info .streak-card:nth-child(3) .streak-count');
    if (pointsElement) {
        const currentText = pointsElement.textContent;
        const current = parseInt(currentText.replace(/[^0-9]/g, '') || '0');
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
    
    // 출석률 업데이트 - 출석 후 새로 계산
    const rateElement = document.querySelector('.streak-info .streak-card:nth-child(4) .streak-count');
    if (rateElement) {
        const today = getServerTime(); // 서버 시간 사용
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        
        // 이번달의 전체 일수 계산
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // 현재 출석일수 가져오기 (방금 출석한 것 포함)
        const monthlyCount = parseInt(document.querySelector('.streak-info .streak-card:nth-child(1) .streak-count')?.textContent || '0') + 1;
        
        // 새로운 출석률 계산 - 이번달 전체 일수 기준
        const newRate = lastDayOfMonth > 0 ? Math.round((monthlyCount / lastDayOfMonth) * 100) : 0;
        const currentRate = parseInt(rateElement.textContent.replace('%', '') || '0');
        
        console.log(`출석 후 출석률: ${monthlyCount}일 / ${lastDayOfMonth}일 = ${newRate}%`);
        
        // 애니메이션으로 업데이트
        animateCount(rateElement, currentRate, newRate, '%');
    }
}

// 숫자 카운팅 애니메이션
function animateCount(element, start, end, suffix = '') {
    const duration = 500; // 0.5초로 단축하여 더 빠르게
    const steps = 30; // 더 부드러운 애니메이션을 위해 단계 증가
    const increment = (end - start) / steps;
    let current = start;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = Math.floor(current).toLocaleString() + suffix;
    }, duration / steps);
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

// 한국 공휴일 데이터 (2024-2025년)
const koreanHolidays = {
    '2024-01-01': '신정',
    '2024-02-09': '설날',
    '2024-02-10': '설날',
    '2024-02-11': '설날',
    '2024-02-12': '대체공휴일',
    '2024-03-01': '삼일절',
    '2024-04-10': '국회의원선거',
    '2024-05-05': '어린이날',
    '2024-05-06': '대체공휴일',
    '2024-05-15': '부처님오신날',
    '2024-06-06': '현충일',
    '2024-08-15': '광복절',
    '2024-09-16': '추석',
    '2024-09-17': '추석',
    '2024-09-18': '추석',
    '2024-10-03': '개천절',
    '2024-10-09': '한글날',
    '2024-12-25': '크리스마스',
    '2025-01-01': '신정',
    '2025-01-28': '설날',
    '2025-01-29': '설날',
    '2025-01-30': '설날',
    '2025-03-01': '삼일절',
    '2025-05-05': '어린이날',
    '2025-05-06': '부처님오신날',
    '2025-06-06': '현충일',
    '2025-08-15': '광복절',
    '2025-10-03': '개천절',
    '2025-10-06': '추석',
    '2025-10-07': '추석',
    '2025-10-08': '추석',
    '2025-10-09': '한글날',
    '2025-12-25': '크리스마스'
};

// 회원가입일 (예시)
const memberJoinDate = '2023-12-15'; // 실제로는 서버에서 가져와야 함

// 애니메이션 진행 중 플래그
let isCalendarAnimating = false;

// 캘린더 업데이트
function updateCalendar(date, withAnimation = true, direction = 'next') {
    const calendarTitle = document.querySelector('.calendar-title');
    const calendarDays = document.querySelector('.calendar-days');
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (calendarTitle) {
        // 애니메이션 중이면 기존 애니메이션 정리하고 즉시 업데이트
        if (isCalendarAnimating && withAnimation) {
            // 모든 이전 wrapper 즉시 제거
            const oldWrappers = calendarTitle.querySelectorAll('.calendar-title-wrapper:not(.current)');
            oldWrappers.forEach(wrapper => wrapper.remove());
            
            // 현재 wrapper를 찾아서 정리
            const currentWrapper = calendarTitle.querySelector('.calendar-title-wrapper.current');
            if (currentWrapper) {
                currentWrapper.remove();
            }
            
            isCalendarAnimating = false;
        }
        
        // 이번달/지난달/다음달 텍스트 결정
        const serverTime = getServerTime();
        const currentYear = serverTime.getFullYear();
        const currentMonth = serverTime.getMonth();
        
        let monthLabel = '';
        if (year === currentYear && month === currentMonth) {
            monthLabel = '이번달';
        } else if (year === currentYear && month === currentMonth - 1) {
            monthLabel = '지난달';
        } else if (year === currentYear - 1 && currentMonth === 0 && month === 11) {
            monthLabel = '지난달';
        } else if (year === currentYear && month === currentMonth + 1) {
            monthLabel = '다음달';
        } else if (year === currentYear + 1 && currentMonth === 11 && month === 0) {
            monthLabel = '다음달';
        }
        
        const mainTitle = `${year}년 ${month + 1}월`;
        
        // 부드러운 애니메이션 적용
        if (withAnimation) {
            isCalendarAnimating = true;
            
            const currentWrapper = calendarTitle.querySelector('.calendar-title-wrapper.current');
            
            // 새로운 wrapper 생성
            const newWrapper = document.createElement('div');
            newWrapper.className = 'calendar-title-wrapper next';
            if (direction === 'prev') {
                newWrapper.className = 'calendar-title-wrapper prev';
            }
            
            newWrapper.innerHTML = `
                <div class="calendar-title-main">${mainTitle}</div>
                ${monthLabel ? `<div class="calendar-title-sub">${monthLabel}</div>` : ''}
            `;
            
            // 현재 wrapper에 클래스 추가
            if (currentWrapper) {
                currentWrapper.classList.add(direction === 'next' ? 'prev' : 'next');
                currentWrapper.classList.remove('current');
            }
            
            // 새 wrapper 추가
            calendarTitle.appendChild(newWrapper);
            
            // 애니메이션 트리거
            setTimeout(() => {
                newWrapper.classList.remove('next', 'prev');
                newWrapper.classList.add('current');
                
                // 이전 wrapper 제거
                if (currentWrapper) {
                    setTimeout(() => {
                        // 현재 wrapper가 아닌 모든 wrapper 제거
                        const oldWrappers = calendarTitle.querySelectorAll('.calendar-title-wrapper:not(.current)');
                        oldWrappers.forEach(wrapper => wrapper.remove());
                        isCalendarAnimating = false;
                    }, 300);
                } else {
                    isCalendarAnimating = false;
                }
            }, 50);
        } else {
            // 애니메이션 없이 즉시 업데이트
            calendarTitle.innerHTML = `
                <div class="calendar-title-wrapper current">
                    <div class="calendar-title-main">${mainTitle}</div>
                    ${monthLabel ? `<div class="calendar-title-sub">${monthLabel}</div>` : ''}
                </div>
            `;
            isCalendarAnimating = false;
        }
    }
    
    if (!calendarDays) return;
    
    // 애니메이션 효과
    if (withAnimation) {
        calendarDays.style.opacity = '0';
        calendarDays.style.transform = 'translateX(20px)';
    }
    
    setTimeout(() => {
        // 달력 날짜 재생성
        calendarDays.innerHTML = '';
        
        // 해당 월의 첫 날과 마지막 날 계산
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        // 첫 날의 요일 (0: 일요일, 1: 월요일, ...)
        const firstDayOfWeek = firstDay.getDay();
        
        // 이전 달 날짜 채우기
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevLastDay.getDate() - i;
            const dayElement = createDayElement(day, true, null, year, month - 1);
            calendarDays.appendChild(dayElement);
        }
        
        // 현재 달 날짜 채우기
        const serverTime = getServerTime();
        const today = serverTime.getDate();
        const currentMonth = serverTime.getMonth();
        const currentYear = serverTime.getFullYear();
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = (day === today && month === currentMonth && year === currentYear);
            const dayElement = createDayElement(day, false, dateString, year, month, isToday);
            calendarDays.appendChild(dayElement);
        }
        
        // 다음 달 날짜 채우기 (6주 맞추기)
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells; // 6주 = 42일
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true, null, year, month + 1);
            calendarDays.appendChild(dayElement);
        }
        
        // 출석 기록 표시
        markAttendancesForMonth(year, month);
        
        // 애니메이션 효과
        if (withAnimation) {
            setTimeout(() => {
                calendarDays.style.opacity = '1';
                calendarDays.style.transform = 'translateX(0)';
                calendarDays.style.transition = 'all 0.3s ease';
            }, 50);
        }
    }, withAnimation ? 150 : 0);
}

// 날짜 요소 생성
function createDayElement(day, isOtherMonth, dateString, year, month, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    // 날짜 번호
    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // 공휴일 체크
    if (dateString && koreanHolidays[dateString]) {
        dayElement.classList.add('holiday');
        const holidayLabel = document.createElement('span');
        holidayLabel.className = 'holiday-label';
        holidayLabel.textContent = koreanHolidays[dateString];
        dayElement.appendChild(holidayLabel);
        
        // 일요일이나 공휴일인 경우 빨간색
        dayNumber.style.color = 'var(--error)';
    }
    
    // 회원가입일 체크
    if (dateString === memberJoinDate) {
        dayElement.classList.add('join-date');
        const joinIcon = document.createElement('i');
        joinIcon.className = 'fas fa-birthday-cake';
        joinIcon.title = '회원가입일';
        dayElement.appendChild(joinIcon);
    }
    
    // 일요일 체크 (0번째 인덱스)
    const dayOfWeek = new Date(year, month, day).getDay();
    if (dayOfWeek === 0 && !isOtherMonth) {
        dayNumber.style.color = 'var(--error)';
    }
    // 토요일 체크 (6번째 인덱스)
    else if (dayOfWeek === 6 && !isOtherMonth) {
        dayNumber.style.color = 'var(--primary-blue)';
    }
    
    // 클릭 이벤트
    if (!isOtherMonth) {
        dayElement.addEventListener('click', function() {
            if (this.classList.contains('checked')) {
                showAttendanceDetails(this, dateString);
            }
        });
    }
    
    return dayElement;
}

// 해당 월의 출석 기록 표시
function markAttendancesForMonth(year, month) {
    const attendanceDates = getAttendanceDates();
    
    attendanceDates.forEach(dateString => {
        const date = new Date(dateString);
        if (date.getFullYear() === year && date.getMonth() === month) {
            const day = date.getDate();
            // 해당 날짜 요소 찾기
            const dayElements = document.querySelectorAll('.calendar-day:not(.other-month)');
            dayElements.forEach(dayElement => {
                const dayNum = dayElement.querySelector('.day-number');
                if (dayNum && parseInt(dayNum.textContent) === day) {
                    dayElement.classList.add('checked');
                    if (!dayElement.querySelector('.fa-check-circle')) {
                        const checkIcon = document.createElement('i');
                        checkIcon.className = 'fas fa-check-circle';
                        dayElement.appendChild(checkIcon);
                    }
                }
            });
        }
    });
}

// 출석 상세 정보 표시
function showAttendanceDetails(dayElement, dateString) {
    const dayNumber = dayElement.querySelector('.day-number').textContent;
    console.log(`Showing details for day ${dayNumber}`);
    
    // 간단한 알림으로 표시 (실제로는 모달이나 툴팁으로 구현 가능)
    const message = `${dateString} 출석 완료!\n연속 출석 중입니다.`;
    
    // 작은 툴팁 생성
    const tooltip = document.createElement('div');
    tooltip.className = 'attendance-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        bottom: 110%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--gray-900);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    dayElement.style.position = 'relative';
    dayElement.appendChild(tooltip);
    
    // 3초 후 제거
    setTimeout(() => {
        tooltip.remove();
    }, 3000);
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

// 오늘 출석한 데이터 로드
function loadTodayAttendanceData() {
    // 로컬 스토리지에서 오늘 출석한 사람들 가져오기
    const todayAttendance = localStorage.getItem('todayAttendance');
    if (todayAttendance) {
        attendanceData = JSON.parse(todayAttendance);
    } else {
        // 출석한 사람이 없으면 빈 배열
        attendanceData = [];
    }
    console.log('오늘 출석 데이터:', attendanceData.length + '명');
}

// 실제 출석 목록 렌더링
function renderAttendanceListContent(attendanceList) {
    
    // 출석한 사람이 없으면 안내 메시지 표시 (테스트 모드에서는 건너뜀)
    if (attendanceData.length === 0) {
        attendanceList.innerHTML = `
            <div class="no-attendance-message">
                <i class="fas fa-info-circle"></i>
                <p>아직 오늘 출석한 회원이 없습니다.</p>
                <p>첫 번째 출석자가 되어보세요!</p>
            </div>
        `;
        return;
    }
    
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
        
        // 배지 텍스트를 아이콘으로 변환
        const badgeIcon = getBadgeIcon(user.badge);
        
        htmlContent += `
            <div class="attendance-item ${isMyRank ? 'my-rank' : ''}">
                <div class="rank-wrapper">
                    ${medalIcon}
                    <span class="rank-number ${rankClass}">${user.rank}등</span>
                </div>
                <div class="check-time">${user.time}</div>
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-name-wrapper">
                    <span class="user-id">${user.name}</span>
                    <span class="user-badge" title="${user.badge}">${badgeIcon}</span>
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

// 쿠폰 당첨자 표시 함수 (페이지 로드 시 복원용)
function displayCouponWinners() {
    console.log('=== 쿠폰 당첨자 표시 복원 ===');
    
    // 당첨자만 필터링
    const winners = attendanceData.filter(u => u.isCouponWinner === true);
    if (winners.length === 0) {
        console.log('당첨자 정보 없음');
        return;
    }
    
    // 메시지 변경
    const couponMessage = document.getElementById('couponMessage');
    if (couponMessage) {
        couponMessage.innerHTML = '<i class="fas fa-trophy"></i> 쿠폰 당첨을 축하합니다!';
        couponMessage.setAttribute('data-winners', 'true');
    }
    
    // 각 당첨자 표시
    winners.forEach(winner => {
        if (winner.rank >= 1 && winner.rank <= 3) {
            const winner1Element = document.getElementById('winner1');
            if (winner1Element) {
                winner1Element.textContent = `🎉 ${winner.name}`;
                winner1Element.className = 'winner-badge winner-selected';
            }
        } else if (winner.rank >= 4 && winner.rank <= 10) {
            const winner2Element = document.getElementById('winner2');
            if (winner2Element) {
                winner2Element.textContent = `🎉 ${winner.name}`;
                winner2Element.className = 'winner-badge winner-selected';
            }
        } else if (winner.rank >= 11 && winner.rank <= 30) {
            // 11~30등 첫 번째 당첨자
            if (!document.getElementById('winner3-1').textContent.includes('🎉')) {
                const winner3_1Element = document.getElementById('winner3-1');
                if (winner3_1Element) {
                    winner3_1Element.textContent = `🎉 ${winner.name}`;
                    winner3_1Element.className = 'winner-badge winner-selected';
                }
            } else {
                // 11~30등 두 번째 당첨자
                const winner3_2Element = document.getElementById('winner3-2');
                if (winner3_2Element) {
                    winner3_2Element.textContent = `🎉 ${winner.name}`;
                    winner3_2Element.className = 'winner-badge winner-selected';
                }
            }
        }
    });
    
    console.log('당첨자 표시 복원 완료:', winners.map(w => `${w.rank}등 ${w.name}`));
}

// 쿠폰 당첨자 선정 함수 (재렌더링 없음)
function selectCouponWinners() {
    console.log('=== 쿠폰 당첨자 선정 시작 ===');
    console.log('현재 출석 인원:', attendanceData.length);
    
    // DOM 요소 확인
    const winner1El = document.getElementById('winner1');
    const winner2El = document.getElementById('winner2');
    const winner3_1El = document.getElementById('winner3-1');
    const winner3_2El = document.getElementById('winner3-2');
    
    console.log('DOM 요소 확인:', {
        winner1: !!winner1El,
        winner2: !!winner2El,
        'winner3-1': !!winner3_1El,
        'winner3-2': !!winner3_2El
    });
    
    // 먼저 모든 isCouponWinner를 false로 초기화
    attendanceData.forEach(user => {
        user.isCouponWinner = false;
    });
    
    // 30명 이상 출석했을 때만 당첨자 선정
    if (attendanceData.length >= 30) {
        // 메시지 변경
        const couponMessage = document.getElementById('couponMessage');
        if (couponMessage) {
            couponMessage.innerHTML = '<i class="fas fa-trophy"></i> 쿠폰 당첨을 축하합니다!';
            couponMessage.setAttribute('data-winners', 'true');
        } else {
            console.error('couponMessage 요소를 찾을 수 없음');
        }
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
                winner1Element.textContent = `🎉 ${winner1.name}`;  // name 사용으로 통일
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
                winner2Element.textContent = `🎉 ${winner2.name}`;  // name 사용으로 통일
                winner2Element.className = 'winner-badge winner-selected';
                console.log('4~10등 당첨자:', winner2.name);
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
                winner3_1Element.textContent = `🎉 ${winner3_1.name}`;  // name 사용으로 통일
                winner3_1Element.className = 'winner-badge winner-selected';
                console.log('11~30등 첫번째 당첨자:', winner3_1.name);
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
                    winner3_2Element.textContent = `🎉 ${winner3_2.name}`;  // name 사용으로 통일
                    winner3_2Element.className = 'winner-badge winner-selected';
                    console.log('11~30등 두번째 당첨자:', winner3_2.name);
                }
            }
        }
    }
    
    console.log('=== 쿠폰 당첨자 선정 완료 ===');
    // 당첨자 확인 로그
    const winners = attendanceData.filter(u => u.isCouponWinner === true);
    console.log('총 당첨자 수:', winners.length);
    console.log('당첨자 명단:', winners.map(w => `${w.rank}등 ${w.name}`));  // name 사용으로 통일
    
    // 당첨 정보를 포함한 데이터를 localStorage에 저장
    localStorage.setItem('todayAttendance', JSON.stringify(attendanceData));
}

// 내 출석 후 순위 업데이트
function updateMyAttendance() {
    // 출석 후 현재 사용자의 정보를 출석 목록에 추가/업데이트
    const currentTime = getServerTime(); // 서버 시간 사용
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
        // 없으면 새로 추가
        const newUser = {
            rank: attendanceData.length + 1,
            name: currentUser.name,
            userId: currentUser.userId,
            time: timeString,
            message: userMessage,
            streak: currentUser.streak,
            badge: currentUser.badge,
            isCouponWinner: false
        };
        
        // 30명이 넘으면 마지막 사람 제거 (30명 유지)
        if (attendanceData.length >= 30) {
            // 시간 순으로 추가되므로 제일 늦은 사람 제거
            attendanceData.pop();
        }
        
        attendanceData.push(newUser);
    }
    
    // 순위 재정렬 (시간 순)
    attendanceData.sort((a, b) => {
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;
        return 0;
    });
    
    // 순위 재할당
    attendanceData.forEach((user, index) => {
        user.rank = index + 1;
        // 현재 사용자의 순위 업데이트
        if (user.name === currentUser.name) {
            currentUser.rank = user.rank;
        }
    });
    
    // 출석 상태 업데이트
    currentUser.isCheckedIn = true;
    
    // 로컬 스토리지에 저장
    localStorage.setItem('todayAttendance', JSON.stringify(attendanceData));
    
    // 쿠폰 당첨자 선정 (출석자가 30명 이상일 때)
    if (attendanceData.length >= 30) {
        console.log('30명 출석 완료! 쿠폰 당첨자 선정 시작');
        selectCouponWinners();
    }
    
    // 출석 목록 재렌더링 (당첨 정보 포함)
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
    // 출석했는지 확인
    const today = new Date().toDateString();
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    const isCheckedInToday = lastCheckIn === today;
    
    // 모든 보상 카드 선택
    const rewardCards = document.querySelectorAll('.reward-card');
    
    rewardCards.forEach((card, index) => {
        // 카드 초기화
        card.classList.remove('achieved', 'current-rank');
        const existingBadge = card.querySelector('.achievement-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // 출석한 경우에만 순위에 따라 해당 카드 강조
        if (isCheckedInToday) {
            const userRank = currentUser.rank;
            
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

// 출석률 계산 함수 (값만 반환)
function calculateAttendanceRate() {
    const today = getServerTime(); // 서버 시간 기준
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // 이번달의 전체 일수 계산
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // 이번달 출석일수를 직접 계산 (localStorage에서 확인)
    let attendanceDays = 0;
    
    // 오늘 출석했는지 확인
    const todayString = getTodayDate(); // 서버 시간 기준 날짜 문자열
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    if (lastCheckIn === todayString) {
        attendanceDays = 1; // 오늘 출석했으면 최소 1일
    }
    
    // 저장된 출석 날짜들 확인
    const attendanceDates = getAttendanceDates();
    if (attendanceDates.length > 0) {
        attendanceDays = attendanceDates.filter(dateString => {
            const date = new Date(dateString);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;
    }
    
    // 출석률 = (출석일수 / 이번달 전체 일수) * 100
    const rate = lastDayOfMonth > 0 ? Math.round((attendanceDays / lastDayOfMonth) * 100) : 0;
    
    console.log(`출석률 계산: ${attendanceDays}일 / ${lastDayOfMonth}일 = ${rate}%`);
    
    return rate;
}

// 출석률 업데이트 함수
function updateAttendanceRate() {
    const rateElement = document.querySelector('.streak-info .streak-card:nth-child(4) .streak-count');
    if (rateElement) {
        const rate = calculateAttendanceRate();
        
        // 현재 표시된 값 가져오기
        const currentRate = parseInt(rateElement.textContent.replace('%', '') || '0');
        
        // 값이 다를 때만 애니메이션
        if (currentRate !== rate) {
            animateCount(rateElement, currentRate, rate, '%');
        } else {
            rateElement.textContent = rate + '%';
        }
    }
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

// 달력 및 통계 초기화 함수
function initializeCalendarAndStats() {
    // 저장된 출석 날짜 가져오기
    const attendanceDates = getAttendanceDates();
    
    // 달력에 출석 표시
    markAttendancesOnCalendar(attendanceDates);
    
    // 통계 업데이트
    updateAllStatistics(attendanceDates);
}


// 출석 날짜 저장
function saveAttendanceDate(date) {
    const attendanceDates = getAttendanceDates();
    // YYYY-MM-DD 형식으로 저장
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    if (!attendanceDates.includes(dateString)) {
        attendanceDates.push(dateString);
        localStorage.setItem('attendanceDates', JSON.stringify(attendanceDates));
        console.log('출석 날짜 저장됨:', dateString);
    }
}

// 달력에 출석 표시
function markAttendancesOnCalendar(dates) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    dates.forEach(dateString => {
        const date = new Date(dateString);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const day = date.getDate();
            // :contains는 유효한 CSS 선택자가 아니므로 Array.from으로 직접 찾기
            const dayElement = Array.from(document.querySelectorAll('.calendar-day:not(.other-month)')).find(el => {
                const dayNum = el.querySelector('.day-number');
                return dayNum && dayNum.textContent.trim() === day.toString();
            });
            
            if (dayElement && !dayElement.classList.contains('checked')) {
                dayElement.classList.add('checked');
                if (!dayElement.querySelector('.fa-check-circle')) {
                    const checkIcon = document.createElement('i');
                    checkIcon.className = 'fas fa-check-circle';
                    dayElement.appendChild(checkIcon);
                }
            }
        }
    });
}

// 모든 통계 업데이트
function updateAllStatistics(dates) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // 이번달 출석일수 계산
    const monthlyCount = dates.filter(dateString => {
        const date = new Date(dateString);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    
    // 이번달 출석일수 표시
    const monthlyCountElement = document.querySelector('.streak-info .streak-card:nth-child(1) .streak-count');
    if (monthlyCountElement) {
        monthlyCountElement.textContent = monthlyCount + '일';
    }
    
    // 출석률 업데이트
    updateAttendanceRate();
    
    // 포인트 계산 (각 출석마다 500포인트)
    const totalPoints = monthlyCount * 500;
    const pointsElement = document.querySelector('.streak-info .streak-card:nth-child(3) .streak-count');
    if (pointsElement) {
        pointsElement.textContent = totalPoints.toLocaleString() + 'P';
    }
}

// 이번달 출석일수 가져오기 (값만 반환)
function getMonthlyAttendanceCount() {
    const attendanceDates = getAttendanceDates();
    const today = getServerTime(); // 서버 시간 기준
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthlyCount = attendanceDates.filter(dateString => {
        const date = new Date(dateString);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    
    return monthlyCount;
}

// 이번달 출석일수 업데이트
function updateMonthlyAttendanceCount() {
    const monthlyCount = getMonthlyAttendanceCount();
    
    const monthlyCountElement = document.querySelector('.streak-info .streak-card:nth-child(1) .streak-count');
    if (monthlyCountElement) {
        // 현재 값 가져오기
        const currentValue = parseInt(monthlyCountElement.textContent) || 0;
        // 애니메이션으로 카운팅
        animateCount(monthlyCountElement, currentValue, monthlyCount, '일');
    }
    
    return monthlyCount;
}