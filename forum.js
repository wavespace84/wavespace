// forum.js - 자유게시판 페이지 동적 기능

// 인기 게시글 데이터
const popularPosts = [
    {
        id: 1,
        title: "2024년 하반기 분양시장 전망과 대응 전략",
        excerpt: "최근 금리 인상과 규제 변화로 인한 분양시장의 변화에 대해 현업에서 느끼는 체감도와 대응 방안을 공유합니다...",
        content: "최근 금리 인상과 규제 변화로 인한 분양시장의 변화에 대해 현업에서 느끼는 체감도와 대응 방안을 공유합니다.\n\n1. 현재 시장 상황\n- 금리 인상으로 인한 대출 수요 감소\n- 청약 경쟁률 하락\n- 분양가 조정 압박\n\n2. 대응 전략\n- 타겟 고객층 재설정\n- 마케팅 메시지 변경\n- 프로모션 강화\n\n3. 실제 현장 사례\n- A 프로젝트: 프로모션 강화로 청약률 20% 상승\n- B 프로젝트: 타겟층 재설정으로 계약 전환율 개선\n\n4. 향후 전망\n- 2024년 하반기 점진적 회복 예상\n- 지역별 차별화 전략 필요\n\n자세한 내용은 본문을 참고해주세요.",
        author: "김전략",
        date: "2024.01.20",
        views: 1234,
        comments: 45,
        likes: 89,
        category: "정보공유",
        categoryName: "정보공유"
    },
    {
        id: 2,
        title: "성공적인 모델하우스 운영 노하우 대공개",
        excerpt: "10년차 분양영업 전문가가 알려주는 모델하우스 운영의 모든 것. 고객 응대부터 계약까지...",
        content: "10년차 분양영업 전문가가 알려주는 모델하우스 운영의 모든 것을 공유합니다.\n\n1. 오픈 전 준비사항\n- 동선 계획 수립\n- 상담 공간 배치\n- 직원 교육 완료\n\n2. 고객 응대 전략\n- 첫인상의 중요성\n- 니즈 파악 기법\n- 효과적인 프레젠테이션\n\n3. 계약 유도 전략\n- 긴급감 조성\n- 혜택 강조\n- 고객 이의 처리\n\n4. 사후 관리\n- 계약자 관리\n- 추천 유도\n- 재방문 유도",
        author: "박전문가",
        date: "2024.01.19",
        views: 987,
        comments: 32,
        likes: 76,
        category: "정보공유",
        categoryName: "정보공유"
    },
    {
        id: 3,
        title: "분양가 상한제 지역 영업 전략 총정리",
        excerpt: "분양가 상한제 적용 지역에서의 효과적인 영업 전략과 실제 사례를 바탕으로 한 팁...",
        content: "분양가 상한제 적용 지역에서의 효과적인 영업 전략을 소개합니다.\n\n1. 분양가 상한제 이해\n- 적용 기준\n- 가격 산정 방식\n- 지역별 차이점\n\n2. 영업 전략\n- 가격 경쟁력 강조\n- 실수요자 타겟팅\n- 정부 정책 활용\n\n3. 성공 사례\n- 서울 A지역: 청약 경쟁률 100:1 달성\n- 경기 B지역: 완판 성공 사례\n\n4. 주의사항\n- 과대광고 주의\n- 정확한 정보 전달\n- 컴플라이언스 준수",
        author: "이매니저",
        date: "2024.01.18",
        views: 856,
        comments: 28,
        likes: 65,
        category: "정보공유",
        categoryName: "정보공유"
    }
];

// 전체 게시글 데이터 (샘플)
const allPosts = [
    { id: 101, number: 1234, category: "question", categoryName: "질문", title: "청약통장 가점 계산 관련 질문드립니다", author: "김영업", date: "10분 전", views: 23, likes: 2, comments: 5, isNew: true },
    { id: 102, number: 1233, category: "info", categoryName: "정보공유", title: "서울 강남권 신규 분양 일정 총정리 (2024년 1분기)", author: "박기획", date: "30분 전", views: 156, likes: 12, comments: 8, isNew: true },
    { id: 103, number: 1232, category: "review", categoryName: "후기", title: "힐스테이트 ○○ 분양 현장 후기 및 경쟁률 예상", author: "이팀장", date: "1시간 전", views: 342, likes: 23, comments: 15 },
    { id: 104, number: 1231, category: "general", categoryName: "일반", title: "분양영업 10년차가 말하는 이 업계의 현실", author: "최전문가", date: "2시간 전", views: 567, likes: 45, comments: 32 },
    { id: 105, number: 1230, category: "job", categoryName: "구인구직", title: "[채용] 강남 신규 분양 현장 팀장급 모집", author: "HR담당자", date: "3시간 전", views: 234, likes: 8, comments: 4 },
    { id: 106, number: 1229, category: "info", categoryName: "정보공유", title: "2024년 달라지는 부동산 정책 총정리", author: "정책분석가", date: "5시간 전", views: 892, likes: 67, comments: 23 },
    { id: 107, number: 1228, category: "question", categoryName: "질문", title: "전매제한 관련 법률 해석 도움 부탁드립니다", author: "신입사원", date: "8시간 전", views: 145, likes: 3, comments: 12 },
    { id: 108, number: 1227, category: "general", categoryName: "일반", title: "모델하우스 운영 중 겪은 황당한 에피소드", author: "웃긴이야기", date: "어제", views: 1234, likes: 89, comments: 45 },
    { id: 109, number: 1226, category: "review", categoryName: "후기", title: "래미안 ○○ 청약 당첨 후기 및 팁 공유", author: "당첨자", date: "어제", views: 2345, likes: 123, comments: 67 }
];

// 현재 표시되는 게시글
let displayedPosts = [...allPosts];
let currentCategory = 'all';
let currentSort = 'latest';

// 댓글 데이터
const commentsData = {
    1: [
        { id: 1, author: "김전문가", content: "좋은 정보 감사합니다. 정말 도움이 되네요!", date: "5분 전", likes: 12 },
        { id: 2, author: "박과장", content: "저도 같은 생각입니다. 시장 변화에 대응이 필요하죠.", date: "10분 전", likes: 8 }
    ],
    101: [
        { id: 3, author: "도움이", content: "청약 가점은 국토부 홈페이지에서 계산기로 확인 가능합니다!", date: "2분 전", likes: 5 },
        { id: 4, author: "전문가", content: "납입 중단 기간도 가점에 포함됩니다. 걱정 마세요.", date: "5분 전", likes: 3 }
    ]
};

// 카테고리별 게시글 필터링
function filterByCategory(category) {
    currentCategory = category;
    
    if (category === 'all') {
        displayedPosts = [...allPosts];
    } else {
        // 직접 카테고리 필터링 (불필요한 매핑 제거)
        displayedPosts = allPosts.filter(post => post.category === category);
    }
    
    // 현재 정렬 기준 유지
    sortPosts(currentSort);
    updatePostsList();
    updateCategoryCounts();
}

// 게시글 정렬
function sortPosts(sortType) {
    currentSort = sortType;
    
    switch(sortType) {
        case 'latest':
            // 최신순 (기본)
            displayedPosts.sort((a, b) => b.number - a.number);
            break;
        case 'views':
            // 조회순
            displayedPosts.sort((a, b) => b.views - a.views);
            break;
        case 'comments':
            // 댓글순
            displayedPosts.sort((a, b) => b.comments - a.comments);
            break;
    }
    
    updatePostsList();
}

// 게시글 검색
function searchPosts(searchTerm) {
    if (!searchTerm.trim()) {
        displayedPosts = [...allPosts];
    } else {
        const term = searchTerm.toLowerCase();
        displayedPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(term) ||
            post.author.toLowerCase().includes(term) ||
            post.categoryName.toLowerCase().includes(term)
        );
    }
    
    // 현재 카테고리와 정렬 유지
    if (currentCategory !== 'all') {
        filterByCategory(currentCategory);
    } else {
        sortPosts(currentSort);
        updatePostsList();
    }
}

// 게시글 목록 업데이트
function updatePostsList() {
    const postsList = document.querySelector('.posts-list');
    if (!postsList) return;
    
    // 공지사항 HTML (고정)
    let postsHTML = `
        <div class="notice-item">
            <div class="notice-badge-wrapper">
                <span class="notice-badge">공지</span>
            </div>
            <div class="notice-content">
                <h3 class="notice-title">
                    <a href="#">[필독] 자유게시판 이용 규칙 및 가이드라인</a>
                    <i class="fas fa-thumbtack"></i>
                </h3>
            </div>
        </div>
    `;
    
    // 일반 게시글 추가
    displayedPosts.forEach(post => {
        postsHTML += `
            <div class="post-item" data-id="${post.id}">
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
            </div>
        `;
    });
    
    postsList.innerHTML = postsHTML;
    
    // 이벤트 위임을 사용하므로 재등록 불필요
}

// 카테고리별 게시글 수 업데이트
function updateCategoryCounts() {
    const counts = {
        all: allPosts.length,
        general: allPosts.filter(p => p.category === 'general').length,
        question: allPosts.filter(p => p.category === 'question').length,
        info: allPosts.filter(p => p.category === 'info').length,
        review: allPosts.filter(p => p.category === 'review').length,
        job: allPosts.filter(p => p.category === 'job').length
    };
    
    document.querySelectorAll('.checkbox-tab').forEach(tab => {
        const tabSpan = tab.querySelector('span:not(.tab-check):not(.tab-count)');
        const tabText = tabSpan ? tabSpan.textContent.trim() : '';
        const categoryMap = {
            '전체': 'all',
            '일반': 'general',
            '질문': 'question',
            '정보공유': 'info',
            '후기': 'review',
            '구인구직': 'job'
        };
        
        const category = categoryMap[tabText];
        if (category && counts[category] !== undefined) {
            const countSpan = tab.querySelector('.tab-count');
            if (countSpan) {
                countSpan.textContent = counts[category];
            }
        }
    });
}

// 인기 게시글 무한 스크롤
function initializeInfiniteCarousel() {
    const container = document.querySelector('.hot-posts-grid');
    if (!container) return;

    container.style.cssText = `
        display: flex;
        gap: 16px;
        overflow: hidden;
        position: relative;
    `;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        display: flex;
        gap: 16px;
        animation: infiniteScroll 30s linear infinite;
    `;

    function createCard(post) {
        const card = document.createElement('div');
        card.className = 'hot-post-card';
        card.style.cssText = 'flex: 0 0 calc(33.333% - 11px); cursor: pointer;';
        card.innerHTML = `
            <span class="hot-badge">HOT</span>
            <h3 class="hot-post-title">${post.title}</h3>
            <p class="hot-post-excerpt">${post.excerpt}</p>
            <div class="hot-post-stats">
                <span><i class="fas fa-eye"></i> ${post.views.toLocaleString()}</span>
                <span><i class="fas fa-comment"></i> ${post.comments}</span>
                <span><i class="fas fa-heart"></i> ${post.likes}</span>
            </div>
        `;
        card.onclick = () => showPostDetail(post);
        return card;
    }

    popularPosts.forEach(post => {
        wrapper.appendChild(createCard(post));
    });

    popularPosts.forEach(post => {
        wrapper.appendChild(createCard(post));
    });

    container.innerHTML = '';
    container.appendChild(wrapper);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes infiniteScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .hot-posts-grid:hover .hot-posts-grid > div {
            animation-play-state: paused;
        }
    `;
    document.head.appendChild(style);
}

// 모달 템플릿 캐싱
let modalTemplate = null;
let modalElement = null;

// 모달 템플릿 생성 (한 번만)
function createModalTemplate() {
    if (modalElement) return modalElement;
    
    modalElement = document.createElement('div');
    modalElement.id = 'postDetailModal';
    modalElement.className = 'post-detail-modal';
    modalElement.style.display = 'none';
    modalElement.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content post-detail-content">
            <div class="modal-header">
                <div class="post-header-info">
                    <span class="modal-category-badge"></span>
                    <h2 class="post-detail-title"></h2>
                </div>
                <button class="modal-close" onclick="closePostDetail()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="post-detail-meta" style="display:none;">
                    <div class="author-info">
                        <i class="fas fa-user-circle"></i>
                        <span class="author-name"></span>
                    </div>
                    <div class="post-stats-detail">
                        <span class="post-date"><i class="fas fa-clock"></i> <span></span></span>
                        <span class="post-views"><i class="fas fa-eye"></i> <span></span></span>
                        <span class="post-comment-count"><i class="fas fa-comment"></i> <span></span></span>
                    </div>
                </div>
                <div class="post-detail-content-text"></div>
                <div class="post-actions" style="display:none;">
                    <button class="action-btn like-btn">
                        <i class="far fa-heart"></i>
                        <span class="like-count">0</span>
                    </button>
                    <button class="action-btn share-btn">
                        <i class="fas fa-share-alt"></i>
                        <span>공유</span>
                    </button>
                    <button class="action-btn bookmark-btn">
                        <i class="far fa-bookmark"></i>
                        <span>저장</span>
                    </button>
                </div>
                <div class="comments-section" style="display:none;">
                    <h3 class="comments-title">댓글 <span class="comment-count">0</span></h3>
                    <div class="comment-write">
                        <textarea placeholder="댓글을 작성해주세요" rows="3"></textarea>
                        <button class="comment-submit-btn">등록</button>
                    </div>
                    <div class="comments-list" id="commentsList"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalElement);
    return modalElement;
}

// 게시글 상세 모달 표시 (최적화)
function showPostDetail(post) {
    // 모달이 없으면 생성
    const modal = createModalTemplate();
    
    // 빠른 DOM 업데이트
    requestAnimationFrame(() => {
        // 카테고리 배지
        const categoryBadge = modal.querySelector('.modal-category-badge');
        if (post.isNotice) {
            categoryBadge.className = 'modal-category-badge notice-badge';
            categoryBadge.textContent = '공지';
        } else {
            categoryBadge.className = `modal-category-badge category-badge ${post.category || 'info'}`;
            categoryBadge.textContent = post.categoryName || post.category || '정보공유';
        }
        
        // 제목
        modal.querySelector('.post-detail-title').textContent = post.title;
        
        // 메타 정보 (공지사항이 아닐 때만)
        const metaSection = modal.querySelector('.post-detail-meta');
        if (!post.isNotice) {
            metaSection.style.display = '';
            modal.querySelector('.author-name').textContent = post.author;
            modal.querySelector('.post-date span').textContent = post.date;
            modal.querySelector('.post-views span').textContent = post.views ? post.views.toLocaleString() : '0';
            modal.querySelector('.post-comment-count span').textContent = post.comments || 0;
        } else {
            metaSection.style.display = 'none';
        }
        
        // 내용
        const contentDiv = modal.querySelector('.post-detail-content-text');
        contentDiv.className = post.isNotice ? 'post-detail-content-text notice-content-text' : 'post-detail-content-text';
        contentDiv.innerHTML = post.content ? post.content.replace(/\n/g, '<br>') : '게시글 내용이 없습니다.';
        
        // 액션 버튼과 댓글 (공지사항이 아닐 때만)
        const actionsSection = modal.querySelector('.post-actions');
        const commentsSection = modal.querySelector('.comments-section');
        
        if (!post.isNotice) {
            actionsSection.style.display = '';
            commentsSection.style.display = '';
            
            // 좋아요 버튼 초기화 및 업데이트
            const likeBtn = modal.querySelector('.like-btn');
            const likeIcon = likeBtn.querySelector('i');
            // 좋아요 상태 초기화
            likeIcon.className = 'far fa-heart';
            likeIcon.style.color = '';
            likeBtn.onclick = () => toggleLike(likeBtn, post.id);
            likeBtn.querySelector('.like-count').textContent = post.likes || 0;
            
            // 댓글 수 업데이트
            modal.querySelector('.comments-title .comment-count').textContent = post.comments || 0;
            
            // 댓글 목록 업데이트
            modal.querySelector('#commentsList').innerHTML = renderComments(post.id);
        } else {
            actionsSection.style.display = 'none';
            commentsSection.style.display = 'none';
        }
        
        // 모달 표시
        modal.style.display = 'block';
        // 지연 없이 바로 표시
        modal.classList.add('active');
    });
}

// 댓글 렌더링
function renderComments(postId) {
    const comments = commentsData[postId] || [];
    if (comments.length === 0) {
        return '<p class="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>';
    }
    
    return comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-author">
                    <i class="fas fa-user-circle"></i>
                    <span>${comment.author}</span>
                </div>
                <span class="comment-date">${comment.date}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-actions">
                <button class="comment-like-btn">
                    <i class="far fa-thumbs-up"></i> ${comment.likes}
                </button>
                <button class="comment-reply-btn">답글</button>
            </div>
        </div>
    `).join('');
}

// 게시글 상세 모달 닫기 (최적화)
function closePostDetail() {
    const modal = document.getElementById('postDetailModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            // 스타일 초기화
            modal.style.opacity = '';
            modal.style.transform = '';
            modal.style.transition = '';
        }, 300);
    }
}

// 인기 게시글 숨기기
function hideHotPosts() {
    const hotPostsSection = document.querySelector('.hot-posts');
    const toggleBtn = document.getElementById('hotPostsToggle');
    
    if (hotPostsSection) {
        hotPostsSection.classList.add('collapsed');
        
        // 토글 버튼 표시 및 텍스트 변경
        if (toggleBtn) {
            toggleBtn.classList.add('show');
            toggleBtn.classList.remove('expanded');
            toggleBtn.querySelector('span').textContent = '인기 게시글 보기';
        }
    }
}

// 인기 게시글 표시
function showHotPosts() {
    const hotPostsSection = document.querySelector('.hot-posts');
    const toggleBtn = document.getElementById('hotPostsToggle');
    
    if (hotPostsSection) {
        hotPostsSection.classList.remove('collapsed');
        
        // 토글 버튼 숨김
        if (toggleBtn) {
            toggleBtn.classList.remove('show');
            toggleBtn.classList.remove('expanded');
        }
    }
}

// 토글 버튼으로 인기 게시글 펼치기/접기
function toggleHotPosts() {
    const hotPostsSection = document.querySelector('.hot-posts');
    const toggleBtn = document.getElementById('hotPostsToggle');
    
    if (hotPostsSection && hotPostsSection.classList.contains('collapsed')) {
        // 펼치기
        hotPostsSection.classList.remove('collapsed');
        if (toggleBtn) {
            toggleBtn.classList.add('expanded');
            toggleBtn.querySelector('span').textContent = '인기 게시글 숨기기';
            // 2초 후 버튼 숨김
            setTimeout(() => {
                toggleBtn.classList.remove('show');
                toggleBtn.classList.remove('expanded');
            }, 2000);
        }
    } else if (hotPostsSection) {
        // 접기
        hideHotPosts();
    }
}

// 게시글 클릭 이벤트 등록 (이벤트 위임 사용)
function initializePostClickEvents() {
    // 이벤트 위임을 사용하여 성능 개선
    const postsList = document.querySelector('.posts-list');
    if (!postsList) return;
    
    // 기존 이벤트 리스너 제거
    postsList.removeEventListener('click', handlePostClick);
    // 새로운 이벤트 리스너 등록
    postsList.addEventListener('click', handlePostClick);
}

// 게시글 클릭 핸들러 (분리)
function handlePostClick(e) {
    // 링크 클릭시는 무시
    if (e.target.closest('a')) return;
    
    // post-item 찾기
    const postItem = e.target.closest('.post-item');
    if (!postItem) return;
    
    // 중복 클릭 방지
    if (postItem.dataset.clicking === 'true') return;
    postItem.dataset.clicking = 'true';
    
    // 약간의 지연 후 처리 (UI 반응성 개선)
    requestAnimationFrame(() => {
        const postId = postItem.dataset.id;
        
        if (postId) {
            const post = allPosts.find(p => p.id == postId);
            if (post) {
                // content가 없으면 기본 내용 추가
                if (!post.content) {
                    post.content = `${post.title}\n\n해당 게시글의 상세 내용입니다.\n\n카테고리: ${post.categoryName}\n작성자: ${post.author}\n작성일: ${post.date}`;
                }
                showPostDetail(post);
            }
        } else {
            // data-id가 없는 경우 임시 게시글 데이터 생성
            const postNumber = postItem.querySelector('.post-number')?.textContent;
            if (postNumber && !isNaN(postNumber)) {
                const titleElement = postItem.querySelector('.post-title a');
                const categoryElement = postItem.querySelector('.category-badge');
                const authorElement = postItem.querySelector('.post-meta span:nth-child(1)');
                const dateElement = postItem.querySelector('.post-meta span:nth-child(2)');
                const viewsElement = postItem.querySelector('.post-meta span:nth-child(3)');
                const likesElement = postItem.querySelector('.like-count');
                const commentsElement = postItem.querySelector('.comment-count');
                
                if (titleElement) {
                    const tempPost = {
                        id: parseInt(postNumber),
                        number: parseInt(postNumber),
                        title: titleElement.textContent.replace('[NEW]', '').trim(),
                        category: categoryElement?.className.split(' ').find(c => ['general', 'question', 'info', 'review', 'job'].includes(c)) || 'general',
                        categoryName: categoryElement?.textContent || '일반',
                        author: authorElement?.textContent.replace(/[^\s]+\s/, '').trim() || '작성자',
                        date: dateElement?.textContent.replace(/[^\s]+\s/, '').trim() || '방금',
                        views: parseInt(viewsElement?.textContent.match(/\d+/)?.[0] || '0'),
                        likes: parseInt(likesElement?.textContent.match(/\d+/)?.[0] || '0'),
                        comments: parseInt(commentsElement?.textContent.match(/\d+/)?.[0] || '0'),
                        content: `${titleElement.textContent}\n\n해당 게시글의 상세 내용입니다.`
                    };
                    showPostDetail(tempPost);
                }
            }
        }
        
        // 클릭 상태 해제
        setTimeout(() => {
            delete postItem.dataset.clicking;
        }, 300);
    });
}

// 좋아요 토글
function toggleLike(btn, postId) {
    const icon = btn.querySelector('i');
    const count = btn.querySelector('span');
    const currentCount = parseInt(count.textContent);
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = '#ff4458';
        count.textContent = currentCount + 1;
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        icon.style.color = '';
        count.textContent = currentCount - 1;
    }
}

// 글쓰기 모달 관련 함수
function openWriteModal() {
    const modal = document.getElementById('writeModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeWriteModal() {
    const modal = document.getElementById('writeModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', function() {
    // 무한 스크롤 캐러셀 초기화
    initializeInfiniteCarousel();
    
    // 초기 게시글 목록 표시
    updatePostsList();
    
    // 초기 카테고리 수 업데이트
    updateCategoryCounts();
    
    // 인기 게시글 토글 버튼 이벤트
    const hotPostsToggle = document.getElementById('hotPostsToggle');
    if (hotPostsToggle) {
        hotPostsToggle.addEventListener('click', function() {
            toggleHotPosts();
        });
    }
    
    // 카테고리 탭 이벤트
    const categoryTabs = document.querySelectorAll('.category-tabs .checkbox-tab');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            // 이미 활성화된 탭을 다시 클릭한 경우 무시
            if (this.classList.contains('active')) {
                return;
            }
            
            // 활성 탭 변경 (카테고리 탭만)
            categoryTabs.forEach(t => {
                t.classList.remove('active');
                const tInput = t.querySelector('input[type="radio"]');
                if (tInput) tInput.checked = false;
            });
            
            this.classList.add('active');
            const input = this.querySelector('input[type="radio"]');
            if (input) input.checked = true;
            
            // 카테고리 필터링 - data-category 속성 사용
            const category = this.dataset.category;
            if (category) {
                filterByCategory(category);
            }
        });
    });
    
    // 정렬 탭 이벤트
    const sortTabs = document.querySelectorAll('.sort-tab');
    sortTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            // 이미 활성화된 탭을 다시 클릭한 경우 무시
            if (this.classList.contains('active')) {
                return;
            }
            
            // 활성 탭 변경
            sortTabs.forEach(t => {
                t.classList.remove('active');
            });
            
            this.classList.add('active');
            
            // 정렬 타입 결정 - data-sort 속성 사용
            const sortType = this.dataset.sort;
            if (sortType) {
                sortPosts(sortType);
            }
        });
    });
    
    // 검색 기능
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        // 검색어 입력시 실시간 검색
        searchInput.addEventListener('input', function(e) {
            const searchTerm = this.value.trim();
            searchPosts(searchTerm);
        });
        
        // 엔터키로도 검색
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                searchPosts(searchTerm);
            }
        });
    }
    
    // 글쓰기 버튼 이벤트
    const writeBtn = document.querySelector('.write-btn');
    if (writeBtn) {
        writeBtn.addEventListener('click', openWriteModal);
    }
    
    // 글쓰기 모달 닫기 버튼
    const closeModalBtn = document.getElementById('closeModal');
    const cancelWriteBtn = document.getElementById('cancelWrite');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeWriteModal);
    }
    if (cancelWriteBtn) {
        cancelWriteBtn.addEventListener('click', closeWriteModal);
    }
    
    // 모달 오버레이 클릭시 닫기
    const modalOverlay = document.querySelector('.write-modal .modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeWriteModal);
    }
    
    // 제목 글자수 카운트
    const titleInput = document.getElementById('postTitle');
    const titleCount = document.getElementById('titleCount');
    if (titleInput && titleCount) {
        titleInput.addEventListener('input', function() {
            titleCount.textContent = this.value.length;
        });
    }
    
    // 내용 글자수 카운트
    const contentTextarea = document.getElementById('postContent');
    const contentCount = document.getElementById('contentCount');
    if (contentTextarea && contentCount) {
        contentTextarea.addEventListener('input', function() {
            contentCount.textContent = this.value.length;
        });
    }
    
    // 게시글 클릭 이벤트 (이벤트 위임 초기화)
    initializePostClickEvents();
    
    // 공지사항 클릭 이벤트
    document.addEventListener('click', function(e) {
        const noticeItem = e.target.closest('.notice-item');
        if (noticeItem && !e.target.closest('a')) {
            // 공지사항 상세 팝업
            const noticePost = {
                id: 'notice-1',
                title: '[필독] 자유게시판 이용 규칙 및 가이드라인',
                isNotice: true,  // 공지사항 플래그 추가
                content: `안녕하세요, WAVE SPACE 운영진입니다.\n\n
                자유게시판을 이용하실 때 지켜주셔야 할 규칙을 안내드립니다.\n\n
                1. 기본 에티켓\n
                - 서로를 존중하는 말을 사용해주세요\n
                - 욕설, 비방, 인신공격은 금지됩니다\n
                - 건전한 토론 문화를 만들어주세요\n\n
                2. 금지 사항\n
                - 광고, 홍보성 글 금지\n
                - 불법 정보 공유 금지\n
                - 허위 정보 유포 금지\n
                - 중복 게시물 금지\n\n
                3. 게시글 관리\n
                - 부적절한 게시글은 통보 없이 삭제될 수 있습니다\n
                - 반복 위반 시 이용이 제한될 수 있습니다\n\n
                모두가 즐겁게 소통할 수 있는 커뮤니티를 만들어주세요.\n
                감사합니다.`
            };
            showPostDetail(noticePost);
        }
    });
});