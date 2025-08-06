// 이벤트 데이터
const eventsData = [
    {
        id: 1,
        title: '신규 가입 회원 3,000P 지급',
        description: '회원가입 후 프로필 작성 시 3,000P 즉시 지급!',
        category: '신규가입',
        status: 'ongoing',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        badge: '상시',
        thumbnail: 'fa-user-plus'
    },
    {
        id: 2,
        title: 'AI 보고서 무료 체험 이벤트',
        description: 'Plus 회원이 아니어도 AI 보고서 3회 무료 체험',
        category: 'AI 서비스',
        status: 'ongoing',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        badge: 'HOT',
        thumbnail: 'fa-robot'
    },
    {
        id: 3,
        title: '분양자료 공유 포인트 2배',
        description: '양질의 분양자료 공유 시 포인트 2배 지급',
        category: '포인트',
        status: 'ongoing',
        startDate: '2024-01-20',
        endDate: '2024-01-31',
        badge: '마감임박',
        thumbnail: 'fa-coins'
    },
    {
        id: 4,
        title: '설날 맞이 럭키 룰렛',
        description: '하루 한 번 룰렛 돌리고 최대 10,000P 획득!',
        category: '미니게임',
        status: 'upcoming',
        startDate: '2024-02-08',
        endDate: '2024-02-12',
        badge: '예정',
        thumbnail: 'fa-dice'
    },
    {
        id: 5,
        title: '출석체크 개근상 이벤트',
        description: '1월 한 달 개근 시 5,000P + Plus 멤버십 1개월',
        category: '출석체크',
        status: 'ongoing',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        badge: '마감임박',
        thumbnail: 'fa-calendar-check'
    },
    {
        id: 6,
        title: '친구 초대 이벤트',
        description: '친구 초대 시 나도 친구도 각각 2,000P!',
        category: '추천',
        status: 'ongoing',
        startDate: '2024-01-10',
        endDate: '2024-03-31',
        badge: '장기',
        thumbnail: 'fa-user-friends'
    },
    {
        id: 7,
        title: '2023 연말 감사 이벤트',
        description: '올 한 해 감사의 마음을 담아 특별 혜택 제공',
        category: '특별',
        status: 'ended',
        startDate: '2023-12-20',
        endDate: '2023-12-31',
        badge: '종료',
        thumbnail: 'fa-gift'
    },
    {
        id: 8,
        title: '크리스마스 선물 이벤트',
        description: '추첨을 통해 아이패드, 에어팟 등 푸짐한 선물',
        category: '특별',
        status: 'ended',
        startDate: '2023-12-15',
        endDate: '2023-12-25',
        badge: '종료',
        thumbnail: 'fa-tree'
    },
    {
        id: 9,
        title: '베스트 게시글 작성자 선정',
        description: '월간 베스트 게시글 작성자 10,000P + 명예의전당',
        category: '커뮤니티',
        status: 'ongoing',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        badge: '월간',
        thumbnail: 'fa-trophy'
    }
];

// DOM 요소
const eventsList = document.getElementById('eventsList');
const tabButtons = document.querySelectorAll('.tab-btn');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// 상태 관리
let currentFilter = 'all';
let displayedCount = 6;

// 탭 버튼 이벤트
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 활성 탭 변경
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 필터 변경
        currentFilter = btn.dataset.status;
        displayedCount = 6;
        
        // 이벤트 다시 렌더링
        renderEvents();
    });
});

// 이벤트 렌더링
function renderEvents() {
    // 필터링
    let filteredEvents = eventsData;
    if (currentFilter !== 'all') {
        filteredEvents = eventsData.filter(event => event.status === currentFilter);
    }
    
    // 표시할 이벤트
    const eventsToShow = filteredEvents.slice(0, displayedCount);
    
    // 이벤트 리스트 렌더링
    eventsList.innerHTML = '';
    
    if (eventsToShow.length === 0) {
        eventsList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
                <i class="fas fa-calendar-times" style="font-size: 64px; color: var(--gray-300); margin-bottom: 20px;"></i>
                <p style="font-size: 18px; color: var(--gray-500);">진행 중인 이벤트가 없습니다.</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    eventsToShow.forEach((event, index) => {
        const eventCard = createEventCard(event);
        eventCard.style.animationDelay = `${index * 0.1}s`;
        eventsList.appendChild(eventCard);
    });
    
    // 더보기 버튼 표시/숨김
    if (displayedCount >= filteredEvents.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// 이벤트 카드 생성
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    // 상태별 색상
    const statusClasses = {
        ongoing: 'ongoing',
        upcoming: 'upcoming',
        ended: 'ended'
    };
    
    const statusTexts = {
        ongoing: '진행중',
        upcoming: '예정',
        ended: '종료'
    };
    
    // 기간 계산
    const today = new Date();
    const endDate = new Date(event.endDate);
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    card.innerHTML = `
        <div class="event-thumbnail">
            <i class="fas ${event.thumbnail}"></i>
            <span class="event-status ${statusClasses[event.status]}">${statusTexts[event.status]}</span>
        </div>
        <div class="event-info">
            <div class="event-category">${event.category}</div>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-desc">${event.description}</p>
            <div class="event-meta">
                <div class="event-period">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(event.startDate)} ~ ${formatDate(event.endDate)}</span>
                </div>
                ${event.badge ? `<span class="event-badge">${event.badge}</span>` : ''}
            </div>
        </div>
    `;
    
    // 클릭 이벤트
    card.addEventListener('click', () => {
        alert(`"${event.title}" 이벤트 상세 페이지로 이동합니다.`);
    });
    
    return card;
}

// 날짜 포맷
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}.${day}`;
}

// 더보기 버튼 클릭
loadMoreBtn.addEventListener('click', () => {
    displayedCount += 6;
    renderEvents();
});

// 메인 배너 클릭
const bannerBtn = document.querySelector('.banner-btn');
if (bannerBtn) {
    bannerBtn.addEventListener('click', () => {
        alert('신규 가입 이벤트 페이지로 이동합니다.');
    });
}

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderEvents();
});