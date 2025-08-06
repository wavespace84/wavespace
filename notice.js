// 공지사항 데이터
const mockNotices = [
    {
        id: 1,
        category: "공지",
        title: "[필독] WAVE SPACE 서비스 이용약관 개정 안내",
        content: "안녕하세요, WAVE SPACE입니다. 더 나은 서비스 제공을 위해 이용약관이 일부 개정되었습니다.",
        author: "관리자",
        viewCount: 1523,
        createdAt: "2024-01-20",
        isPinned: true,
        isNew: true
    },
    {
        id: 2,
        category: "이벤트",
        title: "🎉 신규 가입 회원 대상 3,000P 지급 이벤트",
        content: "WAVE SPACE에 처음 오신 분들을 환영합니다! 신규 가입 후 프로필 작성 시 3,000P를 즉시 지급해드립니다.",
        author: "관리자",
        viewCount: 892,
        createdAt: "2024-01-19",
        isPinned: true,
        isNew: true
    },
    {
        id: 3,
        category: "업데이트",
        title: "v2.1.0 업데이트 - AI 보고서 기능 추가",
        content: "이번 업데이트에서는 AI를 활용한 자동 보고서 생성 기능이 추가되었습니다.",
        author: "개발팀",
        viewCount: 456,
        createdAt: "2024-01-18",
        isPinned: false,
        isNew: true
    },
    {
        id: 4,
        category: "점검",
        title: "1월 25일(목) 정기 서버 점검 안내",
        content: "안정적인 서비스 제공을 위한 정기 점검이 예정되어 있습니다.",
        author: "관리자",
        viewCount: 234,
        createdAt: "2024-01-17",
        isPinned: false,
        isNew: false
    },
    {
        id: 5,
        category: "공지",
        title: "포인트 정책 변경 안내",
        content: "2024년 2월 1일부터 포인트 적립 및 사용 정책이 일부 변경됩니다.",
        author: "관리자",
        viewCount: 789,
        createdAt: "2024-01-15",
        isPinned: false,
        isNew: false
    },
    {
        id: 6,
        category: "이벤트",
        title: "분양 자료 공유 이벤트 - 최대 10,000P 획득!",
        content: "양질의 분양 자료를 공유해주신 분들께 포인트를 지급합니다.",
        author: "관리자",
        viewCount: 567,
        createdAt: "2024-01-14",
        isPinned: false,
        isNew: false
    },
    {
        id: 7,
        category: "업데이트",
        title: "모바일 앱 v1.5.0 출시",
        content: "iOS/Android 모바일 앱이 업데이트되었습니다. 더욱 편리해진 UI를 경험해보세요.",
        author: "개발팀",
        viewCount: 345,
        createdAt: "2024-01-12",
        isPinned: false,
        isNew: false
    },
    {
        id: 8,
        category: "공지",
        title: "커뮤니티 가이드라인 안내",
        content: "건전한 커뮤니티 문화 조성을 위한 가이드라인을 안내드립니다.",
        author: "관리자",
        viewCount: 412,
        createdAt: "2024-01-10",
        isPinned: false,
        isNew: false
    }
];

// 전역 변수
let currentPage = 1;
const itemsPerPage = 10;
let filteredNotices = [...mockNotices];

// DOM 요소
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const noticeList = document.getElementById('noticeList');
const pagination = document.getElementById('pagination');

// 검색 기능
searchInput.addEventListener('input', (e) => {
    filterNotices();
});

// 카테고리 필터
categorySelect.addEventListener('change', (e) => {
    filterNotices();
});

// 필터링 함수
function filterNotices() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    
    filteredNotices = mockNotices.filter(notice => {
        const matchesSearch = notice.title.toLowerCase().includes(searchTerm) ||
            notice.content.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    currentPage = 1;
    renderNotices();
    renderPagination();
}

// 공지사항 렌더링
function renderNotices() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedNotices = filteredNotices.slice(startIndex, endIndex);
    
    noticeList.innerHTML = '';
    
    // 상단 고정 공지사항 먼저 표시
    const pinnedNotices = displayedNotices.filter(notice => notice.isPinned);
    const regularNotices = displayedNotices.filter(notice => !notice.isPinned);
    
    [...pinnedNotices, ...regularNotices].forEach((notice, index) => {
        const noticeElement = createNoticeElement(notice);
        // 애니메이션 효과
        setTimeout(() => {
            noticeElement.style.opacity = '1';
            noticeElement.style.transform = 'translateY(0)';
        }, index * 50);
        noticeList.appendChild(noticeElement);
    });
}

// 공지사항 요소 생성
function createNoticeElement(notice) {
    const noticeItem = document.createElement('a');
    noticeItem.href = `notice-detail.html?id=${notice.id}`;
    noticeItem.className = `notice-item ${notice.isPinned ? 'pinned' : ''}`;
    noticeItem.style.opacity = '0';
    noticeItem.style.transform = 'translateY(20px)';
    noticeItem.style.transition = 'all 0.3s ease';
    
    noticeItem.innerHTML = `
        <div class="notice-badges">
            <span class="notice-badge category-${notice.category}">${notice.category}</span>
            ${notice.isPinned ? '<span class="notice-badge pinned-badge"><i class="fas fa-exclamation-circle"></i>상단고정</span>' : ''}
            ${notice.isNew ? '<span class="notice-badge new">NEW</span>' : ''}
        </div>
        <h3 class="notice-item-title">${notice.title}</h3>
        <p class="notice-item-content">${notice.content}</p>
        <div class="notice-item-meta">
            <span>${notice.author}</span>
            <span>•</span>
            <span><i class="fas fa-calendar"></i> ${notice.createdAt}</span>
            <span>•</span>
            <span><i class="fas fa-eye"></i> ${notice.viewCount.toLocaleString()}</span>
        </div>
    `;
    
    return noticeItem;
}

// 페이지네이션 렌더링
function renderPagination() {
    const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // 첫 페이지 버튼
    const firstBtn = createPaginationButton('<i class="fas fa-angle-double-left"></i>', () => {
        currentPage = 1;
        renderNotices();
        renderPagination();
    }, currentPage === 1);
    pagination.appendChild(firstBtn);
    
    // 이전 페이지 버튼
    const prevBtn = createPaginationButton('<i class="fas fa-angle-left"></i>', () => {
        currentPage = Math.max(currentPage - 1, 1);
        renderNotices();
        renderPagination();
    }, currentPage === 1);
    pagination.appendChild(prevBtn);
    
    // 페이지 번호 버튼들
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPaginationButton(i, () => {
            currentPage = i;
            renderNotices();
            renderPagination();
        }, false, currentPage === i);
        pagination.appendChild(pageBtn);
    }
    
    // 다음 페이지 버튼
    const nextBtn = createPaginationButton('<i class="fas fa-angle-right"></i>', () => {
        currentPage = Math.min(currentPage + 1, totalPages);
        renderNotices();
        renderPagination();
    }, currentPage === totalPages);
    pagination.appendChild(nextBtn);
    
    // 마지막 페이지 버튼
    const lastBtn = createPaginationButton('<i class="fas fa-angle-double-right"></i>', () => {
        currentPage = totalPages;
        renderNotices();
        renderPagination();
    }, currentPage === totalPages);
    pagination.appendChild(lastBtn);
}

// 페이지네이션 버튼 생성
function createPaginationButton(content, onClick, disabled, active = false) {
    const button = document.createElement('button');
    button.innerHTML = content;
    button.disabled = disabled;
    if (active) button.classList.add('active');
    button.addEventListener('click', onClick);
    return button;
}

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderNotices();
    renderPagination();
});