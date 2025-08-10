// forum_optimized.js - 최적화된 자유게시판 코드

// 전역 변수 선언
const allPosts = [
    { id: 101, number: 1234, category: "question", categoryName: "질문", title: "청약통장 가점 계산 관련 질문드립니다", author: "김영업", date: "10분 전", views: 23, likes: 2, comments: 5, isNew: true },
    { id: 102, number: 1233, category: "info", categoryName: "정보공유", title: "서울 강남권 신규 분양 일정 총정리 (2024년 1분기)", author: "박기획", date: "30분 전", views: 156, likes: 12, comments: 8, isNew: true },
    { id: 103, number: 1232, category: "review", categoryName: "후기", title: "힐스테이트 ○○ 분양 현장 후기 및 경쟁률 예상", author: "이팀장", date: "1시간 전", views: 342, likes: 23, comments: 15 },
    { id: 104, number: 1231, category: "general", categoryName: "일반", title: "분양영업 10년차가 말하는 이 업계의 현실", author: "최전문가", date: "2시간 전", views: 567, likes: 45, comments: 32 },
    { id: 105, number: 1230, category: "job", categoryName: "구인구직", title: "[채용] 강남 신규 분양 현장 팀장급 모집", author: "HR담당자", date: "3시간 전", views: 234, likes: 8, comments: 4 }
];

let displayedPosts = [...allPosts];
let currentCategory = 'all';
let currentSort = 'latest';

// 이벤트 위임을 위한 전역 클릭 핸들러
let postsListElement = null;
let modalOverlay = null;

// 초기화 함수
function initOptimizedForum() {
    // DOM 요소 캐싱
    postsListElement = document.querySelector('.posts-list');
    
    // 이벤트 위임 설정 (한 번만)
    setupEventDelegation();
    
    // 초기 렌더링
    updatePostsList();
}

// 이벤트 위임 설정
function setupEventDelegation() {
    // 게시글 클릭 이벤트 (이벤트 위임)
    if (postsListElement) {
        postsListElement.addEventListener('click', handlePostsListClick);
    }
    
    // 모달 오버레이 재사용을 위한 생성
    createModalOverlay();
}

// posts-list 클릭 핸들러
function handlePostsListClick(e) {
    // 링크 클릭은 무시
    if (e.target.closest('a')) return;
    
    // 게시글 아이템 클릭
    const postItem = e.target.closest('.post-item');
    if (postItem) {
        e.preventDefault();
        e.stopPropagation();
        
        // 디바운싱 적용
        if (postItem.dataset.clicking) return;
        postItem.dataset.clicking = 'true';
        
        requestAnimationFrame(() => {
            handlePostClick(postItem);
            setTimeout(() => {
                delete postItem.dataset.clicking;
            }, 300);
        });
    }
}

// 게시글 클릭 처리
function handlePostClick(postItem) {
    const postId = postItem.dataset.id;
    
    if (postId) {
        const post = allPosts.find(p => p.id == postId);
        if (post) {
            showOptimizedModal(post);
        }
    }
}

// 최적화된 모달 표시
function showOptimizedModal(post) {
    // 기존 모달 컨텐츠 제거
    const existingContent = document.querySelector('.modal-content');
    if (existingContent) {
        existingContent.remove();
    }
    
    // 모달 컨텐츠 생성
    const modalContent = createModalContent(post);
    
    // 오버레이에 추가
    if (modalOverlay) {
        modalOverlay.appendChild(modalContent);
        
        // GPU 가속을 위한 transform 사용
        modalOverlay.style.display = 'block';
        modalOverlay.style.opacity = '0';
        modalOverlay.style.transform = 'scale(0.95)';
        
        // 애니메이션
        requestAnimationFrame(() => {
            modalOverlay.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            modalOverlay.style.opacity = '1';
            modalOverlay.style.transform = 'scale(1)';
        });
    }
}

// 모달 오버레이 생성 (재사용)
function createModalOverlay() {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'optimized-modal-overlay';
    modalOverlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;
    
    // 오버레이 클릭으로 닫기
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeOptimizedModal();
        }
    });
    
    document.body.appendChild(modalOverlay);
}

// 모달 컨텐츠 생성
function createModalContent(post) {
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 720px;
        max-height: 90vh;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;
    
    // 간소화된 HTML
    content.innerHTML = `
        <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="font-size: 18px; margin: 0;">${post.title}</h2>
            <button onclick="closeOptimizedModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 20px;">
            <div style="margin-bottom: 20px; color: #666;">
                <span>${post.author}</span> · <span>${post.date}</span> · <span>조회 ${post.views}</span>
            </div>
            <div style="line-height: 1.6;">
                ${post.content || '게시글 내용을 불러오는 중...'}
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button style="padding: 8px 16px; margin-right: 10px; border: 1px solid #ddd; background: white; border-radius: 8px; cursor: pointer;">
                    ❤️ ${post.likes}
                </button>
                <button style="padding: 8px 16px; margin-right: 10px; border: 1px solid #ddd; background: white; border-radius: 8px; cursor: pointer;">
                    💬 ${post.comments}
                </button>
            </div>
        </div>
    `;
    
    return content;
}

// 모달 닫기
function closeOptimizedModal() {
    if (modalOverlay) {
        modalOverlay.style.opacity = '0';
        modalOverlay.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            const content = modalOverlay.querySelector('.modal-content');
            if (content) content.remove();
        }, 200);
    }
}

// 게시글 목록 업데이트 (최적화)
function updatePostsList() {
    if (!postsListElement) return;
    
    // DocumentFragment 사용으로 리플로우 최소화
    const fragment = document.createDocumentFragment();
    
    // 공지사항
    const notice = document.createElement('div');
    notice.className = 'notice-item';
    notice.innerHTML = `
        <div class="notice-badge-wrapper">
            <span class="notice-badge">공지</span>
        </div>
        <div class="notice-content">
            <h3 class="notice-title">
                <a href="#">[필독] 자유게시판 이용 규칙 및 가이드라인</a>
                <i class="fas fa-thumbtack"></i>
            </h3>
        </div>
    `;
    fragment.appendChild(notice);
    
    // 일반 게시글
    displayedPosts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'post-item';
        item.dataset.id = post.id;
        item.innerHTML = `
            <div class="post-number">${post.number}</div>
            <div class="post-category">
                <span class="category-badge ${post.category}">${post.categoryName}</span>
            </div>
            <div class="post-content">
                <h3 class="post-title">
                    <a href="#">${post.title}</a>
                    ${post.isNew ? '<span class="new-badge">NEW</span>' : ''}
                </h3>
                <div class="post-meta">
                    <span><i class="fas fa-user-circle"></i> ${post.author}</span>
                    <span><i class="fas fa-clock"></i> ${post.date}</span>
                    <span><i class="fas fa-eye"></i> ${post.views}</span>
                </div>
            </div>
            <div class="post-stats">
                <span class="like-count"><i class="fas fa-thumbs-up"></i> ${post.likes}</span>
                <span class="comment-count"><i class="fas fa-comment"></i> ${post.comments}</span>
            </div>
        `;
        fragment.appendChild(item);
    });
    
    // 한 번에 DOM 업데이트
    postsListElement.innerHTML = '';
    postsListElement.appendChild(fragment);
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', initOptimizedForum);