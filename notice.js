// 공지사항 데이터
const mockNotices = [
    {
        id: 1,
        category: "공지",
        title: "[필독] WAVE SPACE 서비스 이용약관 개정 안내",
        content: "안녕하세요, WAVE SPACE입니다. 더 나은 서비스 제공을 위해 이용약관이 일부 개정되었습니다.",
        team: "운영팀",
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
        team: "운영팀",
        viewCount: 892,
        createdAt: "2024-01-19",
        isPinned: true,
        isNew: true
    },
    {
        id: 3,
        category: "공지",
        title: "AI 보고서 서비스 정식 오픈 안내",
        content: "2024년 2월부터 AI를 활용한 자동 보고서 생성 서비스가 정식으로 오픈됩니다. Plus 회원은 무제한 이용 가능합니다.",
        team: "운영팀",
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
        team: "운영팀",
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
        team: "운영팀",
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
        team: "운영팀",
        viewCount: 567,
        createdAt: "2024-01-14",
        isPinned: false,
        isNew: false
    },
    {
        id: 7,
        category: "공지",
        title: "모바일 앱 서비스 출시 예정 안내",
        content: "2024년 3월, WAVE SPACE 모바일 앱(iOS/Android)이 출시될 예정입니다. 언제 어디서나 편리하게 이용하실 수 있습니다.",
        team: "운영팀",
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
        team: "운영팀",
        viewCount: 412,
        createdAt: "2024-01-10",
        isPinned: false,
        isNew: false
    },
    {
        id: 9,
        category: "가이드",
        title: "📚 WAVE SPACE 이용 가이드 - 회원가입부터 포인트 활용까지",
        content: "WAVE SPACE를 처음 이용하시는 분들을 위한 상세한 가이드입니다. 회원가입, 프로필 설정, 포인트 획득 및 사용 방법을 안내드립니다.",
        team: "운영팀",
        viewCount: 892,
        createdAt: "2024-01-08",
        isPinned: true,
        isNew: false
    },
    {
        id: 10,
        category: "가이드",
        title: "💡 분양자료 업로드 가이드",
        content: "양질의 분양자료를 공유하는 방법과 포인트 획득 기준을 상세히 안내드립니다. 자료 분류, 파일 형식, 저작권 주의사항을 확인하세요.",
        team: "운영팀",
        viewCount: 567,
        createdAt: "2024-01-05",
        isPinned: false,
        isNew: false
    },
    {
        id: 11,
        category: "공지",
        title: "개인정보 처리방침 개정 안내",
        content: "회원님의 개인정보 보호를 위한 처리방침이 개정되었습니다. 자세한 내용은 본문을 확인해주세요.",
        team: "운영팀",
        viewCount: 234,
        createdAt: "2024-01-03",
        isPinned: false,
        isNew: false
    },
    {
        id: 12,
        category: "이벤트",
        title: "연말 특별 이벤트 - 포인트 2배 적립",
        content: "12월 한 달간 모든 활동에 대해 포인트가 2배로 적립됩니다. 이번 기회를 놓치지 마세요!",
        team: "운영팀",
        viewCount: 1024,
        createdAt: "2024-01-02",
        isPinned: false,
        isNew: false
    },
    {
        id: 13,
        category: "점검",
        title: "긴급 서버 점검 완료 안내",
        content: "긴급 서버 점검이 완료되었습니다. 이용에 불편을 드려 죄송합니다.",
        team: "운영팀",
        viewCount: 156,
        createdAt: "2024-01-01",
        isPinned: false,
        isNew: false
    },
    {
        id: 14,
        category: "공지",
        title: "새해 인사 및 운영 계획 안내",
        content: "2024년 새해를 맞아 WAVE SPACE의 운영 계획을 안내드립니다.",
        team: "운영팀",
        viewCount: 789,
        createdAt: "2023-12-31",
        isPinned: false,
        isNew: false
    },
    {
        id: 15,
        category: "가이드",
        title: "📱 모바일 웹 이용 가이드",
        content: "모바일 환경에서 WAVE SPACE를 효율적으로 이용하는 방법을 안내합니다.",
        team: "운영팀",
        viewCount: 445,
        createdAt: "2023-12-30",
        isPinned: false,
        isNew: false
    }
];

// 전역 변수
let currentPage = 1;
const itemsPerPage = 10;
let filteredNotices = [...mockNotices];

// 권한 체크 (실제로는 서버에서 확인해야 함)
const userRole = 'staff'; // 'admin', 'staff', 'user' 중 하나
const hasWritePermission = userRole === 'admin' || userRole === 'staff';

// DOM 요소
const searchInput = document.getElementById('searchInput');
const categoryTabs = document.querySelectorAll('.category-tab');
const noticeList = document.getElementById('noticeList');
const pagination = document.getElementById('pagination');

// 검색 기능
searchInput.addEventListener('input', (e) => {
    filterNotices();
});

// 카테고리 필터
let selectedCategory = 'all';

// 카테고리 탭 클릭 이벤트
categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        // 모든 탭에서 active 클래스 제거
        categoryTabs.forEach(t => t.classList.remove('active'));
        // 클릭한 탭에 active 클래스 추가
        tab.classList.add('active');
        // 선택된 카테고리 업데이트
        selectedCategory = tab.dataset.category;
        filterNotices();
    });
});

// 필터링 함수
function filterNotices() {
    const searchTerm = searchInput.value.toLowerCase();
    
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
    // 최신순으로 정렬
    const sortedNotices = [...filteredNotices].sort((a, b) => {
        // 먼저 상단고정 여부로 정렬
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // 같은 그룹 내에서는 날짜순으로 정렬
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedNotices = sortedNotices.slice(startIndex, endIndex);
    
    noticeList.innerHTML = '';
    
    displayedNotices.forEach((notice, index) => {
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
    const noticeItem = document.createElement('div');
    noticeItem.className = `notice-item ${notice.isPinned ? 'pinned' : ''}`;
    noticeItem.style.opacity = '0';
    noticeItem.style.transform = 'translateY(20px)';
    noticeItem.style.transition = 'all 0.3s ease';
    noticeItem.style.cursor = 'pointer';
    
    // 클릭 이벤트 추가
    noticeItem.addEventListener('click', () => {
        openNoticeModal(notice);
    });
    
    noticeItem.innerHTML = `
        <div class="notice-header">
            <div class="notice-header-left">
                <div class="notice-badges">
                    <span class="notice-badge category-${notice.category}">${notice.category}</span>
                    ${notice.isNew ? '<span class="notice-badge new">NEW</span>' : ''}
                </div>
                <h3 class="notice-item-title">${notice.title}</h3>
            </div>
            <div class="notice-header-right">
                <span class="notice-date"><i class="fas fa-calendar"></i> ${notice.createdAt}</span>
                ${notice.isPinned ? '<span class="notice-badge pinned-badge"><i class="fas fa-exclamation-circle"></i>상단고정</span>' : ''}
            </div>
        </div>
        <p class="notice-item-content">${notice.content}</p>
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

// 모달 관련 DOM 요소
const noticeModal = document.getElementById('noticeModal');
const modalClose = document.getElementById('modalClose');
const modalBadges = document.getElementById('modalBadges');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const modalDate = document.getElementById('modalDate');

// 의견 관련 DOM 요소
const feedbackText = document.getElementById('feedbackText');
const charCount = document.getElementById('charCount');
const feedbackSubmit = document.getElementById('feedbackSubmit');
const feedbackForm = document.querySelector('.feedback-form');
const feedbackSubmitted = document.getElementById('feedbackSubmitted');
const submittedContent = document.getElementById('submittedContent');
const feedbackEdit = document.getElementById('feedbackEdit');
const adminFeedbackList = document.getElementById('adminFeedbackList');
const feedbackCount = document.getElementById('feedbackCount');
const feedbackItems = document.getElementById('feedbackItems');

// 모달 열기
function openNoticeModal(notice) {
    // 배지 생성
    modalBadges.innerHTML = `
        <span class="notice-badge category-${notice.category}">${notice.category}</span>
        ${notice.isNew ? '<span class="notice-badge new">NEW</span>' : ''}
    `;
    
    // 내용 채우기
    modalTitle.textContent = notice.title;
    modalContent.textContent = notice.content;
    modalDate.textContent = notice.createdAt;
    
    // 모달 표시
    noticeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 모달 닫기
function closeNoticeModal() {
    noticeModal.classList.remove('active');
    document.body.style.overflow = '';
}

// 모달 닫기 이벤트
modalClose.addEventListener('click', closeNoticeModal);

// 모달 외부 클릭 시 닫기
noticeModal.addEventListener('click', (e) => {
    if (e.target === noticeModal) {
        closeNoticeModal();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && noticeModal.classList.contains('active')) {
        closeNoticeModal();
    }
});

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderNotices();
    renderPagination();
    
    // 권한이 있는 경우 글쓰기 버튼 표시
    if (hasWritePermission) {
        const writeBtn = document.getElementById('writeNoticeBtn');
        if (writeBtn) {
            writeBtn.style.display = 'flex';
        }
    }
    
    // 글쓰기 버튼 이벤트
    const writeNoticeBtn = document.getElementById('writeNoticeBtn');
    if (writeNoticeBtn) {
        writeNoticeBtn.addEventListener('click', openWriteModal);
    }
    
    // 글쓰기 모달 닫기 이벤트
    const writeModalClose = document.getElementById('writeModalClose');
    const writeCancel = document.getElementById('writeCancel');
    const writeModal = document.getElementById('writeModal');
    
    if (writeModalClose) {
        writeModalClose.addEventListener('click', closeWriteModal);
    }
    if (writeCancel) {
        writeCancel.addEventListener('click', closeWriteModal);
    }
    if (writeModal) {
        writeModal.addEventListener('click', (e) => {
            if (e.target === writeModal) {
                closeWriteModal();
            }
        });
    }
    
    // 공지 작성 폼 제출
    const noticeForm = document.getElementById('noticeForm');
    if (noticeForm) {
        noticeForm.addEventListener('submit', handleNoticeSubmit);
    }
});

// 의견 관련 기능
let currentNoticeId = null;
let isAdmin = false; // 실제로는 서버에서 확인해야 함

// localStorage 키
const FEEDBACK_STORAGE_KEY = 'wavespace_notice_feedbacks';

// 의견 데이터 가져오기
function getFeedbacks() {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

// 의견 데이터 저장
function saveFeedbacks(feedbacks) {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
}

// 문자 수 카운팅
feedbackText.addEventListener('input', (e) => {
    const length = e.target.value.length;
    charCount.textContent = length;
    
    // 500자 초과 시 경고
    if (length >= 500) {
        charCount.style.color = '#ef4444';
    } else {
        charCount.style.color = 'var(--gray-500)';
    }
    
    // 버튼 활성화/비활성화
    feedbackSubmit.disabled = length === 0;
});

// 의견 제출
feedbackSubmit.addEventListener('click', () => {
    const text = feedbackText.value.trim();
    if (!text) return;
    
    // 의견 저장
    const feedbacks = getFeedbacks();
    if (!feedbacks[currentNoticeId]) {
        feedbacks[currentNoticeId] = [];
    }
    
    const newFeedback = {
        id: Date.now(),
        noticeId: currentNoticeId,
        userId: 'user123', // 실제로는 로그인한 사용자 ID
        userName: '박승학',
        text: text,
        createdAt: new Date().toISOString(),
        isEdited: false
    };
    
    feedbacks[currentNoticeId].push(newFeedback);
    saveFeedbacks(feedbacks);
    
    // UI 업데이트
    showSubmittedFeedback(newFeedback);
    
    // 폼 초기화
    feedbackText.value = '';
    charCount.textContent = '0';
    feedbackSubmit.disabled = true;
    
    // 매니저라면 의견 목록 업데이트
    if (isAdmin) {
        updateAdminFeedbackList();
    }
});

// 제출된 의견 표시
function showSubmittedFeedback(feedback) {
    feedbackForm.style.display = 'none';
    feedbackSubmitted.style.display = 'block';
    submittedContent.textContent = feedback.text;
}

// 의견 수정 버튼
feedbackEdit.addEventListener('click', () => {
    const currentText = submittedContent.textContent;
    feedbackText.value = currentText;
    charCount.textContent = currentText.length;
    feedbackSubmit.disabled = false;
    
    feedbackForm.style.display = 'block';
    feedbackSubmitted.style.display = 'none';
});

// 매니저용 의견 목록 업데이트
function updateAdminFeedbackList() {
    const feedbacks = getFeedbacks();
    const noticeFeedbacks = feedbacks[currentNoticeId] || [];
    
    feedbackCount.textContent = noticeFeedbacks.length;
    
    feedbackItems.innerHTML = '';
    
    noticeFeedbacks.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        
        const date = new Date(feedback.createdAt);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        feedbackItem.innerHTML = `
            <div class="feedback-item-header">
                <div class="feedback-user">
                    <i class="fas fa-user-circle"></i>
                    <span>${feedback.userName}</span>
                </div>
                <span class="feedback-date">${dateStr}</span>
            </div>
            <p class="feedback-text">${feedback.text}</p>
        `;
        
        feedbackItems.appendChild(feedbackItem);
    });
}

// 모달 열기 시 의견 초기화 추가
const originalOpenNoticeModal = openNoticeModal;
openNoticeModal = function(notice) {
    originalOpenNoticeModal(notice);
    
    currentNoticeId = notice.id;
    
    // 의견 폼 초기화
    feedbackText.value = '';
    charCount.textContent = '0';
    feedbackSubmit.disabled = true;
    
    // 기존 의견 확인
    const feedbacks = getFeedbacks();
    const userFeedback = (feedbacks[notice.id] || []).find(f => f.userId === 'user123');
    
    if (userFeedback) {
        showSubmittedFeedback(userFeedback);
    } else {
        feedbackForm.style.display = 'block';
        feedbackSubmitted.style.display = 'none';
    }
    
    // 매니저 여부 확인 (실제로는 서버에서 확인)
    isAdmin = false; // 테스트를 위해 true로 변경 가능
    
    if (isAdmin) {
        adminFeedbackList.style.display = 'block';
        updateAdminFeedbackList();
    } else {
        adminFeedbackList.style.display = 'none';
    }
};

// 글쓰기 모달 열기
function openWriteModal() {
    const writeModal = document.getElementById('writeModal');
    if (writeModal) {
        writeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 폼 초기화
        const form = document.getElementById('noticeForm');
        if (form) {
            form.reset();
        }
    }
}

// 글쓰기 모달 닫기
function closeWriteModal() {
    const writeModal = document.getElementById('writeModal');
    if (writeModal) {
        writeModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 공지사항 제출 처리
function handleNoticeSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // 새 공지사항 객체 생성
    const newNotice = {
        id: mockNotices.length + 1,
        category: formData.get('category'),
        title: formData.get('title'),
        content: formData.get('content'),
        team: formData.get('team'),
        viewCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        isPinned: formData.get('pinned') === 'on',
        isNew: true
    };
    
    // 상단 고정이면 맨 앞에, 아니면 두 번째에 추가 (첫 번째는 보통 고정 공지)
    if (newNotice.isPinned) {
        mockNotices.unshift(newNotice);
    } else {
        // 고정 공지 다음에 추가
        const pinnedCount = mockNotices.filter(n => n.isPinned).length;
        mockNotices.splice(pinnedCount, 0, newNotice);
    }
    
    // 목록 새로고침
    filteredNotices = [...mockNotices];
    currentPage = 1;
    renderNotices();
    renderPagination();
    
    // 모달 닫기
    closeWriteModal();
    
    // 성공 메시지 (실제로는 토스트 메시지 등으로 표시)
    alert('공지사항이 등록되었습니다.');
}