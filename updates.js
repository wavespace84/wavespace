// 업데이트 데이터
const mockUpdates = [
    {
        id: 1,
        version: 'v2.1.0',
        title: 'AI 보고서 자동 생성 기능 출시',
        type: 'major',
        category: '기능추가',
        description:
            'AI를 활용한 자동 보고서 생성 기능이 추가되었습니다. 시장 데이터를 기반으로 전문적인 분석 보고서를 즉시 생성할 수 있습니다.',
        changes: [
            'AI 기반 시장 분석 보고서 자동 생성',
            '맞춤형 보고서 템플릿 5종 추가',
            'PDF/Word 형식 다운로드 지원',
            '보고서 히스토리 관리 기능',
        ],
        releaseDate: '2024-01-18',
        isLatest: true,
    },
    {
        id: 2,
        version: 'v2.0.3',
        title: '포인트 시스템 개선 업데이트',
        type: 'minor',
        category: '개선',
        description: '포인트 적립 및 사용 시스템이 전면 개선되었습니다.',
        changes: [
            '포인트 적립률 20% 상향 조정',
            '실시간 포인트 내역 조회 기능',
            '포인트 유효기간 연장 (90일 → 180일)',
            '포인트 선물하기 기능 추가',
        ],
        releaseDate: '2024-01-15',
        isLatest: false,
    },
    {
        id: 3,
        version: 'v2.0.2',
        title: '모바일 최적화 및 버그 수정',
        type: 'patch',
        category: '버그수정',
        description: '모바일 환경에서의 사용성이 크게 개선되었습니다.',
        changes: [
            '모바일 레이아웃 반응형 개선',
            '터치 제스처 인식률 향상',
            '이미지 로딩 속도 50% 개선',
            '간헐적 앱 종료 문제 해결',
        ],
        releaseDate: '2024-01-12',
        isLatest: false,
    },
    {
        id: 4,
        version: 'v2.0.1',
        title: '보안 강화 업데이트',
        type: 'hotfix',
        category: '보안',
        description: '사용자 계정 보안을 강화하는 중요 업데이트입니다.',
        changes: [
            '2단계 인증(2FA) 기능 추가',
            '비밀번호 암호화 방식 강화',
            '자동 로그아웃 시간 설정 기능',
            '로그인 이력 조회 기능 추가',
        ],
        releaseDate: '2024-01-10',
        isLatest: false,
    },
    {
        id: 5,
        version: 'v2.0.0',
        title: 'WAVE SPACE 2.0 메이저 업데이트',
        type: 'major',
        category: '기능추가',
        description: '완전히 새로워진 WAVE SPACE 2.0을 만나보세요.',
        changes: [
            'UI/UX 전면 리뉴얼',
            '신규 게이미피케이션 시스템 도입',
            '실시간 알림 기능 추가',
            '다크모드 지원',
            '성능 최적화로 속도 2배 향상',
        ],
        releaseDate: '2024-01-05',
        isLatest: false,
    },
    {
        id: 6,
        version: 'v1.9.8',
        title: '구인구직 기능 개선',
        type: 'minor',
        category: '개선',
        description: '구인구직 매칭 시스템이 개선되었습니다.',
        changes: [
            'AI 기반 구인구직 매칭 알고리즘 도입',
            '이력서 템플릿 10종 추가',
            '기업 인증 뱃지 시스템',
            '지원 현황 실시간 추적',
        ],
        releaseDate: '2023-12-28',
        isLatest: false,
    },
];

// 카테고리별 아이콘
const categoryIcons = {
    기능추가: 'fa-sparkles',
    개선: 'fa-chart-line',
    버그수정: 'fa-bug',
    보안: 'fa-shield-alt',
};

// 전역 변수
let filteredUpdates = [...mockUpdates];
let activeCategory = 'all';
let currentPage = 1;
let currentUpdateIndex = 0;
let currentFilteredUpdates = [];
const itemsPerPage = 10;

// DOM 요소
const searchInput = document.getElementById('searchInput');
const updatesList = document.getElementById('updatesList');

// 카테고리 탭 이벤트 리스너 설정 (checkbox-tab 스타일)
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

// 필터 이벤트 리스너
searchInput.addEventListener('input', filterUpdates);

// 필터링 함수
function filterUpdates() {
    const searchTerm = searchInput.value.toLowerCase();

    filteredUpdates = mockUpdates.filter((update) => {
        const matchesSearch =
            update.title.toLowerCase().includes(searchTerm) ||
            update.description.toLowerCase().includes(searchTerm) ||
            update.changes.some((change) => change.toLowerCase().includes(searchTerm));

        const matchesCategory = activeCategory === 'all' || update.type === activeCategory;

        return matchesSearch && matchesCategory;
    });

    currentPage = 1; // 필터링 시 페이지 초기화
    renderUpdates();
    renderPagination();
}

// 업데이트 목록 렌더링
function renderUpdates() {
    updatesList.innerHTML = '';

    if (filteredUpdates.length === 0) {
        updatesList.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        return;
    }

    // 페이지에 표시할 업데이트 범위 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUpdates = filteredUpdates.slice(startIndex, endIndex);
    
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
                        <i class="fas ${categoryIcons[update.category]}"></i>
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
                    <i class="fas ${categoryIcons[update.category]}"></i>
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
    // 현재 업데이트 인덱스 찾기
    currentUpdateIndex = currentFilteredUpdates.findIndex(u => u.id === update.id);
    
    // 기존 모달이 열려있는지 확인
    const modal = document.getElementById('updateModal');
    if (modal.classList.contains('active')) {
        updateUpdateModal();
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalDate = document.getElementById('modalDate');
    const modalDescription = document.getElementById('modalDescription');
    const modalChangesList = document.getElementById('modalChangesList');

    // 모달 내용 업데이트
    modalTitle.textContent = update.title;

    // 카테고리 업데이트
    modalCategory.innerHTML = `
        <i class="fas ${categoryIcons[update.category]}"></i>
        <span>${update.category}</span>
    `;

    // 날짜 업데이트
    modalDate.innerHTML = `
        <i class="fas fa-calendar"></i>
        <span>${update.releaseDate}</span>
    `;

    // 설명 업데이트
    modalDescription.textContent = update.description;

    // 변경사항 리스트 업데이트
    modalChangesList.innerHTML = update.changes
        .map(
            (change, index) => `
        <li class="modal-change-item">
            <span class="modal-change-bullet">${index + 1}</span>
            <span class="modal-change-text">${change}</span>
        </li>
    `
        )
        .join('');

    // 모달 표시
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 모달 내용만 업데이트
function updateUpdateModal() {
    const update = currentFilteredUpdates[currentUpdateIndex];
    if (!update) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalDate = document.getElementById('modalDate');
    const modalDescription = document.getElementById('modalDescription');
    const modalChangesList = document.getElementById('modalChangesList');
    
    // 모달 내용 업데이트
    modalTitle.textContent = update.title;
    
    // 카테고리 업데이트
    modalCategory.innerHTML = `
        <i class="fas ${categoryIcons[update.category]}"></i>
        <span>${update.category}</span>
    `;
    
    // 날짜 업데이트
    modalDate.innerHTML = `
        <i class="fas fa-calendar"></i>
        <span>${update.releaseDate}</span>
    `;
    
    // 설명 업데이트
    modalDescription.textContent = update.description;
    
    // 변경사항 리스트 업데이트
    modalChangesList.innerHTML = update.changes
        .map(
            (change, index) => `
        <li class="modal-change-item">
            <span class="modal-change-bullet">${index + 1}</span>
            <span class="modal-change-text">${change}</span>
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

// 관리자 권한 체크 (임시 - 실제로는 서버에서 확인)
function checkAdminPermission() {
    // 임시로 관리자 권한 부여 (개발 중)
    return true;

    // 실제 구현 시:
    // const currentUser = localStorage.getItem('currentUser');
    // if (currentUser) {
    //     const user = JSON.parse(currentUser);
    //     return user.name === '박승학' || user.isAdmin;
    // }
    // return false;
}

// 글쓰기 모달 열기
function openWriteModal() {
    const modal = document.getElementById('writeUpdateModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 글쓰기 모달 닫기
function closeWriteModal() {
    const modal = document.getElementById('writeUpdateModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // 폼 초기화
    document.getElementById('updateForm').reset();
    resetChangeInputs();
}

// 변경사항 입력 필드 초기화
function resetChangeInputs() {
    const container = document.getElementById('changesInputList');
    container.innerHTML = `
        <div class="change-input-item">
            <input type="text" class="change-input" placeholder="변경사항을 입력하세요" required>
            <button type="button" class="remove-change-btn" style="display: none;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// 변경사항 입력 필드 추가
function addChangeInput() {
    const container = document.getElementById('changesInputList');
    const newItem = document.createElement('div');
    newItem.className = 'change-input-item';
    newItem.innerHTML = `
        <input type="text" class="change-input" placeholder="변경사항을 입력하세요" required>
        <button type="button" class="remove-change-btn">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(newItem);

    // 삭제 버튼 이벤트 리스너
    const removeBtn = newItem.querySelector('.remove-change-btn');
    removeBtn.addEventListener('click', () => {
        newItem.remove();
        updateRemoveButtons();
    });

    updateRemoveButtons();
}

// 삭제 버튼 표시 업데이트
function updateRemoveButtons() {
    const items = document.querySelectorAll('.change-input-item');
    items.forEach((item, index) => {
        const removeBtn = item.querySelector('.remove-change-btn');
        if (index === 0 && items.length === 1) {
            removeBtn.style.display = 'none';
        } else {
            removeBtn.style.display = 'flex';
        }
    });
}

// 글쓰기 모달 이벤트 설정
function setupWriteModal() {
    const writeModal = document.getElementById('writeUpdateModal');
    const writeModalClose = document.getElementById('writeModalClose');
    const cancelBtn = document.getElementById('cancelWriteBtn');
    const addChangeBtn = document.getElementById('addChangeBtn');
    const updateForm = document.getElementById('updateForm');

    // 모달 닫기 버튼들
    if (writeModalClose) {
        writeModalClose.addEventListener('click', closeWriteModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeWriteModal);
    }

    // 오버레이 클릭 시 닫기
    if (writeModal) {
        writeModal.addEventListener('click', (e) => {
            if (e.target === writeModal) {
                closeWriteModal();
            }
        });
    }

    // 변경사항 추가 버튼
    if (addChangeBtn) {
        addChangeBtn.addEventListener('click', addChangeInput);
    }

    // 폼 제출
    if (updateForm) {
        updateForm.addEventListener('submit', handleUpdateSubmit);
    }
}

// 업데이트 폼 제출 처리
function handleUpdateSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const changeInputs = document.querySelectorAll('.change-input');
    const changes = Array.from(changeInputs)
        .map((input) => input.value.trim())
        .filter((value) => value !== '');

    const newUpdate = {
        id: mockUpdates.length + 1,
        title: formData.get('title'),
        type: formData.get('type'),
        category: formData.get('category'),
        description: formData.get('description'),
        changes: changes,
        releaseDate: new Date().toISOString().split('T')[0],
        isLatest: true,
    };

    // 기존 업데이트의 isLatest를 false로 변경
    mockUpdates.forEach((update) => (update.isLatest = false));

    // 새 업데이트를 맨 앞에 추가
    mockUpdates.unshift(newUpdate);

    // 필터 초기화 및 렌더링
    filteredUpdates = [...mockUpdates];
    renderUpdates();

    // 모달 닫기
    closeWriteModal();

    // 성공 메시지
    if (window.showSuccessMessage) {
        showSuccessMessage('업데이트가 성공적으로 등록되었습니다!');
    } else {
        alert('업데이트가 성공적으로 등록되었습니다!');
    }
}

// 페이지네이션 렌더링
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredUpdates.length / itemsPerPage);
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
    link.href = 'javascript:void(0)'; // # 대신 javascript:void(0) 사용
    link.textContent = text;
    if (disabled) link.className = 'disabled';
    if (active) link.className = 'active';
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 버블링 방지 추가
        if (!disabled) onClick();
        return false; // 추가 보호
    });
    return link;
}

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    setupCategoryTabs();
    renderUpdates();
    renderPagination();

    // 관리자 권한 체크 및 글쓰기 버튼 표시
    if (checkAdminPermission()) {
        const writeBtn = document.getElementById('writeUpdateBtn');
        if (writeBtn) {
            writeBtn.style.display = 'flex';
            writeBtn.addEventListener('click', openWriteModal);
        }
    }

    // 글쓰기 모달 이벤트 설정
    setupWriteModal();

    // 모달 닫기 이벤트 리스너
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('updateModal');

    modalClose.addEventListener('click', closeUpdateModal);

    // 오버레이 클릭 시 모달 닫기
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeUpdateModal();
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeUpdateModal();
        }
    });
});
