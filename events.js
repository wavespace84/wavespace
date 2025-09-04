// 전역 변수
let currentEventIndex = 0;
let currentFilteredEvents = [];

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
        thumbnail: 'fa-user-plus',
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
        thumbnail: 'fa-robot',
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
        thumbnail: 'fa-coins',
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
        thumbnail: 'fa-dice',
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
        thumbnail: 'fa-calendar-check',
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
        thumbnail: 'fa-user-friends',
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
        thumbnail: 'fa-gift',
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
        thumbnail: 'fa-tree',
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
        thumbnail: 'fa-trophy',
    },
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
checkboxTabs.forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
        const value = e.target.value;

        if (value === 'all') {
            // '전체' 선택 시 다른 모든 체크박스 해제
            checkboxTabs.forEach((cb) => {
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
                .filter((cb) => cb.checked && cb.value !== 'all')
                .map((cb) => cb.value);

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
            filteredEvents = eventsData.filter((event) => currentFilter.includes(event.status));
        } else {
            // 단일 선택
            filteredEvents = eventsData.filter((event) => event.status === currentFilter);
        }
    }

    // 현재 필터링된 이벤트 목록 저장
    currentFilteredEvents = filteredEvents;

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
        ended: 'ended',
    };

    const statusTexts = {
        ongoing: '진행중',
        upcoming: '예정',
        ended: '종료',
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
        showEventDetail(event.id);
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
        if (window.showInfoMessage) {
            showInfoMessage('신규 가입 이벤트 페이지로 이동합니다.');
        } else {
            alert('신규 가입 이벤트 페이지로 이동합니다.');
        }
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
                            behavior: 'smooth',
                        });
                    } else {
                        // main-content가 없는 경우 window 스크롤 사용
                        const headerHeight = 80;
                        const sectionTop = suggestSection.offsetTop - headerHeight;
                        window.scrollTo({
                            top: sectionTop,
                            behavior: 'smooth',
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

categoryToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
        // 모든 토글에서 active 클래스 제거
        categoryToggles.forEach((t) => t.classList.remove('active'));

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
            if (window.showSuccessMessage) {
                showSuccessMessage('이벤트 제안이 성공적으로 접수되었습니다! 검토 후 연락드리겠습니다.');
            } else {
                alert('이벤트 제안이 성공적으로 접수되었습니다!\n검토 후 연락드리겠습니다.');
            }

            // 폼 초기화
            description.value = '';
            categoryToggles.forEach((t) => t.classList.remove('active'));
            selectedCategory = null;

            // 폼 닫기
            suggestContent.style.display = 'none';
            suggestToggle.classList.remove('active');
        } else {
            if (window.showWarningMessage) {
                showWarningMessage('카테고리를 선택하고 설명을 입력해주세요.');
            } else {
                alert('카테고리를 선택하고 설명을 입력해주세요.');
            }
        }
    });
}

// 이벤트 상세 모달 표시
function showEventDetail(eventId) {
    // 이벤트 찾기
    const eventIndex = currentFilteredEvents.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    
    currentEventIndex = eventIndex;
    const event = currentFilteredEvents[currentEventIndex];
    
    // 기존 모달이 있으면 내용만 업데이트
    const existingModal = document.querySelector('.event-modal');
    if (existingModal) {
        updateEventModal();
        return;
    }
    
    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'event-modal';
    
    // 상태별 색상
    const statusClasses = {
        ongoing: 'ongoing',
        upcoming: 'upcoming',
        ended: 'ended',
    };
    
    const statusTexts = {
        ongoing: '진행중',
        upcoming: '예정',
        ended: '종료',
    };
    
    // 기간 계산
    const today = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    const progress = event.status === 'ongoing' ? Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100)) : 0;
    
    modal.innerHTML = `
        <div class="event-modal-overlay" onclick="closeEventModal()"></div>
        <div class="event-modal-content">
            <div class="event-modal-header">
                <h2>이벤트 상세</h2>
                <div class="modal-nav-buttons">
                    <button class="modal-nav-btn" onclick="navigateEvent('prev')" ${currentEventIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="modal-nav-btn" onclick="navigateEvent('next')" ${currentEventIndex === currentFilteredEvents.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button class="modal-nav-btn modal-close-btn" onclick="closeEventModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="event-modal-body">
                <div class="event-detail-header">
                    <div class="event-detail-icon">
                        <i class="fas ${event.thumbnail}"></i>
                    </div>
                    <div class="event-detail-info">
                        <div class="event-detail-meta">
                            <span class="event-category-badge">${event.category}</span>
                            <span class="event-status-badge ${statusClasses[event.status]}">${statusTexts[event.status]}</span>
                            ${event.badge ? `<span class="event-special-badge">${event.badge}</span>` : ''}
                        </div>
                        <h3 class="event-detail-title">${event.title}</h3>
                        <p class="event-detail-desc">${event.description}</p>
                    </div>
                </div>
                
                <div class="event-detail-content">
                    <div class="event-detail-section">
                        <h4><i class="fas fa-calendar-alt"></i> 이벤트 기간</h4>
                        <div class="event-period-info">
                            <p class="event-period-text">${formatFullDate(event.startDate)} ~ ${formatFullDate(event.endDate)}</p>
                            ${event.status === 'ongoing' ? `
                                <div class="event-progress">
                                    <div class="event-progress-bar" style="width: ${progress}%"></div>
                                </div>
                                <p class="event-days-left">${daysLeft > 0 ? `${daysLeft}일 남음` : '오늘 마감'}</p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="event-detail-section">
                        <h4><i class="fas fa-gift"></i> 이벤트 혜택</h4>
                        <ul class="event-benefits">
                            ${getEventBenefits(event)}
                        </ul>
                    </div>
                    
                    <div class="event-detail-section">
                        <h4><i class="fas fa-info-circle"></i> 참여 방법</h4>
                        <ol class="event-steps">
                            ${getEventSteps(event)}
                        </ol>
                    </div>
                    
                    <div class="event-detail-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> 유의사항</h4>
                        <ul class="event-notes">
                            <li>이벤트 기간 내에만 참여 가능합니다</li>
                            <li>중복 참여는 제한될 수 있습니다</li>
                            <li>부정한 방법으로 참여 시 혜택이 회수될 수 있습니다</li>
                        </ul>
                    </div>
                </div>
                
                <div class="event-modal-footer">
                    ${event.status === 'ongoing' ? 
        '<button class="event-participate-btn">지금 참여하기</button>' : 
        event.status === 'upcoming' ? 
            '<button class="event-participate-btn" disabled>곧 시작됩니다</button>' :
            '<button class="event-participate-btn" disabled>종료된 이벤트</button>'
}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 애니메이션
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 모달 내용만 업데이트
function updateEventModal() {
    const event = currentFilteredEvents[currentEventIndex];
    if (!event) return;
    
    const modal = document.querySelector('.event-modal');
    if (!modal) return;
    
    // 상태별 색상
    const statusClasses = {
        ongoing: 'ongoing',
        upcoming: 'upcoming',
        ended: 'ended',
    };
    
    const statusTexts = {
        ongoing: '진행중',
        upcoming: '예정',
        ended: '종료',
    };
    
    // 기간 계산
    const today = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    const progress = event.status === 'ongoing' ? Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100)) : 0;
    
    // 모달 내용 업데이트
    const modalContent = modal.querySelector('.event-modal-content');
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="event-modal-header">
                <h2>이벤트 상세</h2>
                <div class="modal-nav-buttons">
                    <button class="modal-nav-btn" onclick="navigateEvent('prev')" ${currentEventIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="modal-nav-btn" onclick="navigateEvent('next')" ${currentEventIndex === currentFilteredEvents.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button class="modal-nav-btn modal-close-btn" onclick="closeEventModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="event-modal-body">
                <div class="event-detail-header">
                    <div class="event-detail-icon">
                        <i class="fas ${event.thumbnail}"></i>
                    </div>
                    <div class="event-detail-info">
                        <div class="event-detail-meta">
                            <span class="event-category-badge">${event.category}</span>
                            <span class="event-status-badge ${statusClasses[event.status]}">${statusTexts[event.status]}</span>
                            ${event.badge ? `<span class="event-special-badge">${event.badge}</span>` : ''}
                        </div>
                        <h3 class="event-detail-title">${event.title}</h3>
                        <p class="event-detail-desc">${event.description}</p>
                    </div>
                </div>
                
                <div class="event-detail-content">
                    <div class="event-detail-section">
                        <h4><i class="fas fa-calendar-alt"></i> 이벤트 기간</h4>
                        <div class="event-period-info">
                            <p class="event-period-text">${formatFullDate(event.startDate)} ~ ${formatFullDate(event.endDate)}</p>
                            ${event.status === 'ongoing' ? `
                                <div class="event-progress">
                                    <div class="event-progress-bar" style="width: ${progress}%"></div>
                                </div>
                                <p class="event-days-left">${daysLeft > 0 ? `${daysLeft}일 남음` : '오늘 마감'}</p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="event-detail-section">
                        <h4><i class="fas fa-gift"></i> 이벤트 혜택</h4>
                        <ul class="event-benefits">
                            ${getEventBenefits(event)}
                        </ul>
                    </div>
                    
                    <div class="event-detail-section">
                        <h4><i class="fas fa-info-circle"></i> 참여 방법</h4>
                        <ol class="event-steps">
                            ${getEventSteps(event)}
                        </ol>
                    </div>
                    
                    <div class="event-detail-section">
                        <h4><i class="fas fa-exclamation-triangle"></i> 유의사항</h4>
                        <ul class="event-notes">
                            <li>이벤트 기간 내에만 참여 가능합니다</li>
                            <li>중복 참여는 제한될 수 있습니다</li>
                            <li>부정한 방법으로 참여 시 혜택이 회수될 수 있습니다</li>
                        </ul>
                    </div>
                </div>
                
                <div class="event-modal-footer">
                    ${event.status === 'ongoing' ? 
        '<button class="event-participate-btn">지금 참여하기</button>' : 
        event.status === 'upcoming' ? 
            '<button class="event-participate-btn" disabled>곧 시작됩니다</button>' :
            '<button class="event-participate-btn" disabled>종료된 이벤트</button>'
}
                </div>
            </div>
        `;
    }
}

// 이벤트 네비게이션
function navigateEvent(direction) {
    if (!currentFilteredEvents || currentFilteredEvents.length === 0) return;
    
    if (direction === 'prev' && currentEventIndex > 0) {
        currentEventIndex--;
    } else if (direction === 'next' && currentEventIndex < currentFilteredEvents.length - 1) {
        currentEventIndex++;
    }
    
    updateEventModal();
}

// 네비게이션 버튼 상태 업데이트
function updateEventNavButtons() {
    const prevBtn = document.querySelector('.event-modal .modal-nav-btn:nth-child(1)');
    const nextBtn = document.querySelector('.event-modal .modal-nav-btn:nth-child(2)');
    
    if (prevBtn) {
        prevBtn.disabled = currentEventIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentEventIndex === currentFilteredEvents.length - 1;
    }
}

// 모달 닫기
function closeEventModal() {
    const modal = document.querySelector('.event-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 전체 날짜 포맷
function formatFullDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
}

// 이벤트별 혜택 정보
function getEventBenefits(event) {
    const benefits = {
        1: '<li>신규 가입 시 3,000P 즉시 지급</li><li>프로필 작성 완료 보너스</li>',
        2: '<li>AI 보고서 3회 무료 이용</li><li>Plus 회원 전환 시 추가 혜택</li>',
        3: '<li>자료 공유 시 포인트 2배</li><li>우수 자료 선정 시 추가 보너스</li>',
        4: '<li>하루 1회 룰렛 참여</li><li>최대 10,000P 획득 가능</li>',
        5: '<li>개근 달성 시 5,000P</li><li>Plus 멤버십 1개월 무료</li>',
        6: '<li>초대한 회원 2,000P</li><li>초대받은 회원 2,000P</li>',
        7: '<li>특별 감사 포인트</li><li>한정판 배지 지급</li>',
        8: '<li>추첨을 통한 경품</li><li>아이패드, 에어팟 등</li>',
        9: '<li>월간 베스트 선정 시 10,000P</li><li>명예의전당 등재</li>',
    };
    return benefits[event.id] || '<li>다양한 혜택이 준비되어 있습니다</li>';
}

// 이벤트별 참여 방법
function getEventSteps(event) {
    const steps = {
        1: '<li>회원가입을 완료합니다</li><li>프로필 정보를 작성합니다</li><li>3,000P가 자동 지급됩니다</li>',
        2: '<li>AI 보고서 메뉴에 접속합니다</li><li>무료 체험을 선택합니다</li><li>보고서를 생성합니다</li>',
        3: '<li>양질의 분양자료를 준비합니다</li><li>자료를 업로드합니다</li><li>2배 포인트를 받습니다</li>',
        4: '<li>미니게임 메뉴에 접속합니다</li><li>럭키 룰렛을 선택합니다</li><li>룰렛을 돌려 포인트를 획득합니다</li>',
        5: '<li>매일 출석체크를 합니다</li><li>한 달 동안 빠짐없이 출석합니다</li><li>개근 보상을 받습니다</li>',
        6: '<li>친구 초대 링크를 공유합니다</li><li>친구가 가입을 완료합니다</li><li>양쪽 모두 포인트를 받습니다</li>',
        7: '<li>이벤트 페이지를 확인합니다</li><li>감사 이벤트에 참여합니다</li><li>혜택을 받습니다</li>',
        8: '<li>이벤트에 응모합니다</li><li>추첨일을 기다립니다</li><li>당첨 시 경품을 받습니다</li>',
        9: '<li>좋은 게시글을 작성합니다</li><li>많은 추천을 받습니다</li><li>베스트 선정을 기다립니다</li>',
    };
    return steps[event.id] || '<li>이벤트 페이지에서 확인하세요</li>';
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEventModal();
    }
});

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderEvents();
});
