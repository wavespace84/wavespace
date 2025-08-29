/**
 * WAVE SPACE - Updates Page
 * 업데이트 페이지 메인 로직 (Supabase 연동)
 */

// 카테고리별 아이콘
const categoryIcons = {
    기능추가: 'fa-sparkles',
    개선: 'fa-chart-line',
    버그수정: 'fa-bug',
    보안: 'fa-shield-alt',
};

// 전역 변수
let filteredUpdates = [];
let activeCategory = 'all';
let currentPage = 1;
let currentUpdateIndex = 0;
let currentFilteredUpdates = [];
let subscription = null;
const itemsPerPage = 10;

// DOM 요소
const searchInput = document.getElementById('searchInput');
const updatesList = document.getElementById('updatesList');

// Supabase 연동 초기화
async function initializeUpdatesPage() {
    try {
        console.log('🔄 업데이트 페이지 초기화 중...');
        
        // UpdatesSupabase 초기화 대기
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.UpdatesSupabase && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.UpdatesSupabase) {
            throw new Error('UpdatesSupabase가 로드되지 않았습니다.');
        }
        
        // 로딩 상태 표시
        showLoadingState();
        
        // 초기 데이터 로드
        await loadUpdates();
        
        // 실시간 업데이트 구독
        subscribeToRealTimeUpdates();
        
        console.log('✅ 업데이트 페이지 초기화 완료');
        
    } catch (error) {
        console.error('❌ 업데이트 페이지 초기화 실패:', error);
        showErrorState(error);
    }
}

// 업데이트 데이터 로드
async function loadUpdates(options = {}) {
    try {
        const loadingState = window.UpdatesSupabase.getLoadingState();
        if (loadingState.isLoading) {
            console.log('⏳ 이미 데이터 로딩 중...');
            return;
        }
        
        const {
            category = activeCategory,
            searchTerm = searchInput?.value || '',
            forceRefresh = false
        } = options;
        
        // 데이터 로드
        const updates = await window.UpdatesSupabase.fetchUpdates({
            category,
            searchTerm,
            limit: 100 // 충분한 데이터 로드
        });
        
        // 성공적으로 로드된 경우
        if (updates && updates.length > 0) {
            filteredUpdates = updates;
            hideLoadingState();
            hideErrorState();
            renderUpdates();
            renderPagination();
        } else if (!loadingState.hasData) {
            showEmptyState();
        }
        
    } catch (error) {
        console.error('❌ 업데이트 데이터 로드 실패:', error);
        hideLoadingState();
        showErrorState(error);
    }
}

// 실시간 업데이트 구독
function subscribeToRealTimeUpdates() {
    if (subscription) {
        window.UpdatesSupabase.unsubscribe(subscription);
    }
    
    subscription = window.UpdatesSupabase.subscribeToUpdates(async (payload) => {
        console.log('📡 실시간 업데이트 수신:', payload.eventType);
        
        // 자동 새로고침 (필요시)
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            await loadUpdates({ forceRefresh: true });
        }
    });
}

// 카테고리 탭 이벤트 리스너 설정
function setupCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.checkbox-tab');

    categoryTabs.forEach((tab) => {
        const input = tab.querySelector('input[type="radio"]');

        tab.addEventListener('click', function () {
            // 모든 탭에서 active 클래스 제거
            categoryTabs.forEach((t) => {
                t.classList.remove('active');
                const tInput = t.querySelector('input[type="radio"]');
                if (tInput) tInput.checked = false;
            });
            // 클릭된 탭에 active 클래스 추가
            this.classList.add('active');
            if (input) input.checked = true;
            // 카테고리 설정
            activeCategory = this.dataset.category;
            // 필터링
            filterUpdates();
        });
    });
}

// 검색 이벤트 리스너
if (searchInput) {
    searchInput.addEventListener('input', debounce(filterUpdates, 300));
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 필터링 함수
async function filterUpdates() {
    try {
        const searchTerm = searchInput?.value || '';
        
        // 클라이언트 측 필터링 사용
        const filtered = window.UpdatesSupabase.filterUpdates(activeCategory, searchTerm);
        filteredUpdates = filtered;
        
        currentPage = 1; // 필터링 시 페이지 초기화
        renderUpdates();
        renderPagination();
        
    } catch (error) {
        console.error('❌ 필터링 실패:', error);
    }
}

// 업데이트 목록 렌더링
function renderUpdates() {
    if (!updatesList) return;
    
    updatesList.innerHTML = '';

    if (filteredUpdates.length === 0) {
        updatesList.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        return;
    }

    // 페이지에 표시할 업데이트 계산
    const paginatedUpdates = window.UpdatesSupabase.getPagedUpdates(currentPage, itemsPerPage);
    
    // 현재 필터링된 업데이트 목록 저장
    currentFilteredUpdates = paginatedUpdates;

    // 첫 페이지인 경우 최신 업데이트를 크게 표시
    const latestUpdate = currentPage === 1 ? paginatedUpdates[0] : null;
    const previousUpdates = currentPage === 1 ? paginatedUpdates.slice(1) : paginatedUpdates;

    // 최신 업데이트 섹션 (첫 페이지에만 표시)
    if (latestUpdate) {
        const latestSection = document.createElement('div');
        latestSection.className = 'latest-update-section';

        const latestCard = createLatestUpdateCard(latestUpdate);
        latestSection.appendChild(latestCard);
        updatesList.appendChild(latestSection);
    }

    // 이전 업데이트 섹션
    if (previousUpdates.length > 0) {
        const previousSection = document.createElement('div');
        previousSection.className = 'previous-updates-section';
        previousSection.innerHTML = `
            <h3 class="section-title">이전 업데이트</h3>
            <div class="updates-history"></div>
        `;

        const historyContainer = previousSection.querySelector('.updates-history');
        previousUpdates.forEach((update, index) => {
            const listItem = createUpdateListItem(update);
            setTimeout(
                () => {
                    listItem.style.opacity = '1';
                    listItem.style.transform = 'translateY(0)';
                },
                (index + 1) * 50
            );
            historyContainer.appendChild(listItem);
        });

        updatesList.appendChild(previousSection);
    }
}

// 최신 업데이트 카드 생성 (크게 표시)
function createLatestUpdateCard(update) {
    const card = document.createElement('div');
    card.className = 'update-card latest';
    card.style.cursor = 'pointer';
    card.onclick = () => showUpdateModal(update);
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';

    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);

    card.innerHTML = `
        <div class="update-header-info">
            <div>
                <div class="update-meta">
                    <span class="update-category highlight">
                        <i class="fas ${categoryIcons[update.category] || 'fa-circle-info'}"></i>
                        ${update.category}
                    </span>
                </div>
                <div class="update-content">
                    <h3>${update.title}</h3>
                    <p class="update-description">${update.description}</p>
                </div>
            </div>
            <i class="fas fa-arrow-up-right update-arrow"></i>
        </div>
        
        <div class="update-changes">
            <h4>주요 변경사항</h4>
            <ul class="change-list">
                ${update.changes
                    .map(
                        (change) => `
                    <li class="change-item">
                        <span class="bullet">•</span>
                        <span>${change}</span>
                    </li>
                `
                    )
                    .join('')}
            </ul>
        </div>
        
        <div class="update-date">
            <i class="fas fa-calendar"></i>
            <span>${update.releaseDate}</span>
        </div>
    `;

    return card;
}

// 이전 업데이트 리스트 아이템 생성 (간단하게 표시)
function createUpdateListItem(update) {
    const item = document.createElement('div');
    item.className = 'update-list-item';
    item.style.cursor = 'pointer';
    item.onclick = () => showUpdateModal(update);
    item.style.opacity = '0';
    item.style.transform = 'translateY(10px)';
    item.style.transition = 'all 0.3s ease';

    item.innerHTML = `
        <div class="update-list-left">
            <div class="update-list-meta">
                <span class="update-category">
                    <i class="fas ${categoryIcons[update.category] || 'fa-circle-info'}"></i>
                    ${update.category}
                </span>
            </div>
            <div class="update-list-content">
                <div class="update-list-title">${update.title}</div>
                <div class="update-list-description">${update.description}</div>
            </div>
        </div>
        <div class="update-list-date">${update.releaseDate}</div>
        <i class="fas fa-chevron-right update-list-arrow"></i>
    `;

    return item;
}

// 모달 표시 함수
function showUpdateModal(update) {
    console.log('🔍 모달 열기 시도:', update);
    
    // 데이터 유효성 검증
    if (!update) {
        console.error('❌ 업데이트 데이터가 없습니다.');
        return;
    }

    // 현재 업데이트 인덱스 찾기
    currentUpdateIndex = currentFilteredUpdates.findIndex(u => u.id === update.id);
    
    // 기존 모달이 열려있는지 확인
    const modal = document.getElementById('updateModal');
    if (modal.classList.contains('active')) {
        updateUpdateModal();
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBadges = document.getElementById('modalBadges');
    const modalDateText = document.getElementById('modalDateText');
    const modalDescription = document.getElementById('modalDescription');
    const modalChangesList = document.getElementById('modalChangesList');

    // 모달 내용 업데이트 (안전한 값 할당)
    modalTitle.textContent = update.title || '제목 없음';

    // 카테고리 배지 업데이트
    const category = update.category || '개선';
    modalBadges.innerHTML = `
        <span class="update-category type-${category}" id="modalCategory">
            <i class="fas ${categoryIcons[category] || 'fa-circle-info'}"></i>
            <span>${category}</span>
        </span>
    `;

    // 날짜 텍스트만 업데이트
    modalDateText.textContent = update.releaseDate || new Date().toISOString().split('T')[0];

    // 설명 업데이트
    modalDescription.textContent = update.description || '업데이트 설명이 없습니다.';

    // 변경사항 리스트 업데이트
    const changes = Array.isArray(update.changes) && update.changes.length > 0 
        ? update.changes 
        : ['업데이트 내용을 확인하세요.'];
        
    console.log('📝 변경사항 표시:', changes);
    
    modalChangesList.innerHTML = changes
        .map(
            (change, index) => `
        <li class="modal-change-item">
            <span class="modal-change-bullet">${index + 1}</span>
            <span class="modal-change-text">${change || '내용 없음'}</span>
        </li>
    `
        )
        .join('');

    // 네비게이션 버튼 상태 업데이트
    updateUpdateNavButtons();

    // 모달 표시
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('✅ 모달 표시 완료');
}

// 모달 내용만 업데이트
function updateUpdateModal() {
    const update = currentFilteredUpdates[currentUpdateIndex];
    if (!update) {
        console.error('❌ 업데이트할 데이터가 없습니다.');
        return;
    }
    
    console.log('🔄 모달 내용 업데이트:', update);
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBadges = document.getElementById('modalBadges');
    const modalDateText = document.getElementById('modalDateText');
    const modalDescription = document.getElementById('modalDescription');
    const modalChangesList = document.getElementById('modalChangesList');
    
    // 모달 내용 업데이트 (안전한 값 할당)
    modalTitle.textContent = update.title || '제목 없음';
    
    // 카테고리 배지 업데이트
    const category = update.category || '개선';
    modalBadges.innerHTML = `
        <span class="update-category type-${category}" id="modalCategory">
            <i class="fas ${categoryIcons[category] || 'fa-circle-info'}"></i>
            <span>${category}</span>
        </span>
    `;
    
    // 날짜 텍스트만 업데이트
    modalDateText.textContent = update.releaseDate || new Date().toISOString().split('T')[0];
    
    // 설명 업데이트
    modalDescription.textContent = update.description || '업데이트 설명이 없습니다.';
    
    // 변경사항 리스트 업데이트
    const changes = Array.isArray(update.changes) && update.changes.length > 0 
        ? update.changes 
        : ['업데이트 내용을 확인하세요.'];
        
    modalChangesList.innerHTML = changes
        .map(
            (change, index) => `
        <li class="modal-change-item">
            <span class="modal-change-bullet">${index + 1}</span>
            <span class="modal-change-text">${change || '내용 없음'}</span>
        </li>
    `
        )
        .join('');
    
    // 네비게이션 버튼 상태 업데이트
    updateUpdateNavButtons();
}

// 업데이트 네비게이션
function navigateUpdate(direction) {
    if (!currentFilteredUpdates || currentFilteredUpdates.length === 0) return;
    
    if (direction === 'prev' && currentUpdateIndex > 0) {
        currentUpdateIndex--;
    } else if (direction === 'next' && currentUpdateIndex < currentFilteredUpdates.length - 1) {
        currentUpdateIndex++;
    }
    
    updateUpdateModal();
}

// 네비게이션 버튼 상태 업데이트
function updateUpdateNavButtons() {
    const prevBtn = document.querySelector('#updateModal .modal-nav-btn:nth-child(1)');
    const nextBtn = document.querySelector('#updateModal .modal-nav-btn:nth-child(2)');
    
    if (prevBtn) {
        prevBtn.disabled = currentUpdateIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentUpdateIndex === currentFilteredUpdates.length - 1;
    }
}

// 모달 닫기 함수
function closeUpdateModal() {
    const modal = document.getElementById('updateModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 페이지네이션 렌더링
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;

    const totalPages = window.UpdatesSupabase.getTotalPages(itemsPerPage);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // 처음 버튼
    const firstBtn = createPaginationLink(
        '처음',
        () => {
            currentPage = 1;
            renderUpdates();
            renderPagination();
        },
        currentPage === 1
    );
    paginationContainer.appendChild(firstBtn);

    // 이전 버튼
    const prevBtn = createPaginationLink(
        '이전',
        () => {
            if (currentPage > 1) {
                currentPage--;
                renderUpdates();
                renderPagination();
            }
        },
        currentPage === 1
    );
    paginationContainer.appendChild(prevBtn);

    // 페이지 번호들을 담을 컨테이너
    const pageNumbers = document.createElement('div');
    pageNumbers.className = 'page-numbers';

    // 페이지 번호 버튼들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        const pageLink = createPaginationLink(
            i,
            () => {
                currentPage = i;
                renderUpdates();
                renderPagination();
            },
            false,
            currentPage === i
        );
        pageNumbers.appendChild(pageLink);
    }

    paginationContainer.appendChild(pageNumbers);

    // 다음 버튼
    const nextBtn = createPaginationLink(
        '다음',
        () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderUpdates();
                renderPagination();
            }
        },
        currentPage === totalPages
    );
    paginationContainer.appendChild(nextBtn);

    // 끝 버튼
    const lastBtn = createPaginationLink(
        '끝',
        () => {
            currentPage = totalPages;
            renderUpdates();
            renderPagination();
        },
        currentPage === totalPages
    );
    paginationContainer.appendChild(lastBtn);
}

// 페이지네이션 링크 생성
function createPaginationLink(text, onClick, disabled, active = false) {
    const link = document.createElement('a');
    link.href = 'javascript:void(0)';
    link.textContent = text;
    if (disabled) link.className = 'disabled';
    if (active) link.className = 'active';
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onClick();
        return false;
    });
    return link;
}

// 로딩 상태 표시
function showLoadingState() {
    if (updatesList) {
        updatesList.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>업데이트 정보를 불러오는 중...</p>
            </div>
        `;
    }
}

// 로딩 상태 숨기기
function hideLoadingState() {
    // renderUpdates에서 처리됨
}

// 에러 상태 표시
function showErrorState(error) {
    if (updatesList) {
        updatesList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>데이터 로드 실패</h3>
                <p>업데이트 정보를 불러오는데 실패했습니다.</p>
                <button onclick="loadUpdates({ forceRefresh: true })" class="btn-retry">다시 시도</button>
            </div>
        `;
    }
}

// 에러 상태 숨기기
function hideErrorState() {
    // renderUpdates에서 처리됨
}

// 빈 상태 표시
function showEmptyState() {
    if (updatesList) {
        updatesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>업데이트가 없습니다</h3>
                <p>아직 등록된 업데이트가 없습니다.</p>
            </div>
        `;
    }
}

// 관리자 권한 체크 (임시 - 실제로는 서버에서 확인)
function checkAdminPermission() {
    // 임시로 관리자 권한 부여 (개발 중)
    return true;
}

// 새로고침 함수
async function refreshUpdates() {
    console.log('🔄 업데이트 데이터 새로고침...');
    await loadUpdates({ forceRefresh: true });
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 기본 이벤트 설정
        setupCategoryTabs();
        
        // 모달 닫기 이벤트 리스너
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('updateModal');

        if (modalClose) {
            modalClose.addEventListener('click', closeUpdateModal);
        }

        // 오버레이 클릭 시 모달 닫기
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeUpdateModal();
                }
            });
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) {
                closeUpdateModal();
            }
        });

        // Supabase 연동 초기화
        await initializeUpdatesPage();
        
    } catch (error) {
        console.error('❌ 페이지 초기화 실패:', error);
        showErrorState(error);
    }
});

// 페이지 언로드 시 구독 해제
window.addEventListener('beforeunload', () => {
    if (subscription && window.UpdatesSupabase) {
        window.UpdatesSupabase.unsubscribe(subscription);
    }
});