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
const loadMoreBtn = document.getElementById('loadMoreBtn');

// 상태 관리
let currentFilter = 'all';
let displayedCount = 6;

// 체크박스 탭 기능
const checkboxTabs = document.querySelectorAll('.checkbox-tab input[type="checkbox"]');
const allCheckbox = document.querySelector('.checkbox-tab input[value="all"]');

// 체크박스 탭 이벤트 리스너
checkboxTabs.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const value = e.target.value;
        
        if (value === 'all') {
            // '전체' 선택 시 다른 모든 체크박스 해제
            checkboxTabs.forEach(cb => {
                if (cb !== allCheckbox) {
                    cb.checked = false;
                }
            });
            currentFilter = 'all';
        } else {
            // 개별 체크박스 선택 시
            allCheckbox.checked = false;
            
            // 선택된 필터 확인
            const selectedFilters = Array.from(checkboxTabs)
                .filter(cb => cb.checked && cb.value !== 'all')
                .map(cb => cb.value);
            
            if (selectedFilters.length === 0) {
                // 아무것도 선택되지 않으면 전체 선택
                allCheckbox.checked = true;
                currentFilter = 'all';
            } else {
                currentFilter = selectedFilters;
            }
        }
        
        // 이벤트 다시 렌더링
        displayedCount = 6;
        renderEvents();
    });
});

// 새로운 체크박스 탭 이벤트 리스너 (기존 코드와 호환성 유지)
document.addEventListener('tabChanged', (e) => {
    // 필터 변경
    currentFilter = e.detail.status;
    displayedCount = 6;
    
    // 이벤트 다시 렌더링
    renderEvents();
});

// 이벤트 렌더링
function renderEvents() {
    // 필터링
    let filteredEvents = eventsData;
    if (currentFilter !== 'all') {
        if (Array.isArray(currentFilter)) {
            // 배열인 경우 (다중 선택)
            filteredEvents = eventsData.filter(event => currentFilter.includes(event.status));
        } else {
            // 단일 선택
            filteredEvents = eventsData.filter(event => event.status === currentFilter);
        }
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

// 이벤트 제안하기 토글 기능
const suggestToggle = document.getElementById('suggestToggle');
const suggestContent = document.getElementById('suggestContent');

if (suggestToggle && suggestContent) {
    suggestToggle.addEventListener('click', () => {
        const isOpen = suggestContent.style.display === 'block';
        
        if (isOpen) {
            suggestContent.style.display = 'none';
            suggestToggle.classList.remove('active');
        } else {
            suggestContent.style.display = 'block';
            suggestToggle.classList.add('active');
            
            // 이벤트 제안하기 섹션을 페이지 상단으로 스크롤
            setTimeout(() => {
                const suggestSection = document.querySelector('.suggest-section');
                if (suggestSection) {
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        // 헤더 높이를 고려하여 페이지 상단에 위치하도록
                        const headerHeight = 80;
                        const sectionTop = suggestSection.offsetTop - headerHeight;
                        mainContent.scrollTo({
                            top: sectionTop,
                            behavior: 'smooth'
                        });
                    } else {
                        // main-content가 없는 경우 window 스크롤 사용
                        const headerHeight = 80;
                        const sectionTop = suggestSection.offsetTop - headerHeight;
                        window.scrollTo({
                            top: sectionTop,
                            behavior: 'smooth'
                        });
                    }
                }
            }, 100);
        }
    });
}

// 카테고리 토글 버튼 이벤트
const categoryToggles = document.querySelectorAll('.category-toggle');
let selectedCategory = null;

categoryToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        // 모든 토글에서 active 클래스 제거
        categoryToggles.forEach(t => t.classList.remove('active'));
        
        // 클릭한 토글에 active 클래스 추가
        toggle.classList.add('active');
        selectedCategory = toggle.getAttribute('data-value');
    });
});

// 제안하기 폼 제출
const submitBtn = document.querySelector('.submit-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const description = document.getElementById('eventDescription');
        
        if (description && description.value.trim() && selectedCategory) {
            alert('이벤트 제안이 성공적으로 접수되었습니다!\n검토 후 연락드리겠습니다.');
            
            // 폼 초기화
            description.value = '';
            categoryToggles.forEach(t => t.classList.remove('active'));
            selectedCategory = null;
            
            // 폼 닫기
            suggestContent.style.display = 'none';
            suggestToggle.classList.remove('active');
        } else {
            alert('카테고리를 선택하고 설명을 입력해주세요.');
        }
    });
}

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderEvents();
});