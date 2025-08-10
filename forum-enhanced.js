// forum-enhanced.js - 50개 테스트 계정 활동이 포함된 자유게시판

// 실제같은 게시글 데이터 생성
function generateForumData() {
    const userNames = [
        '김철수', '이영희', '박민수', '정수진', '최동현', '김서연', '이준호', '박지영', '홍길동', '김나영',
        '이상현', '박소영', '정현수', '김태영', '이민정', '박재현', '최수빈', '정다은', '김현우', '이서준',
        '박하늘', '정유진', '김도윤', '이하린', '박시우', '최지아', '정예준', '김서윤', '이주원', '박지호',
        '홍민준', '김윤서', '이도현', '박수아', '정건우', '김은지', '이성민', '박예린', '최준서', '정아인',
        '김태훈', '이소민', '박준영', '홍서영', '김민재', '이지우', '박현서', '정수현', '최민서', '김지안'
    ];

    const nicknames = [
        '강남전문가', '부동산여왕', '서초구달인', '송파마스터', '강북전문', '마포구고수', '용산프로', '성동구베테랑', '종로의달인', '중구전문가',
        '노원구달인', '도봉구마스터', '은평구프로', '서대문전문', '양천구고수', '구로달인', '금천프로', '영등포마스터', '동작구전문', '관악프로',
        '서초베테랑', '강남구고수', '송파달인', '강동프로', '광진구마스터', '동대문전문', '중랑구고수', '성북달인', '강북프로', '도봉베테랑',
        '노원구마스터', '은평전문', '서대문프로', '마포달인', '용산구고수', '중구베테랑', '종로프로', '성동구마스터', '광진달인', '동대문프로',
        '중랑구전문', '성북고수', '강북달인', '도봉프로', '노원베테랑', '은평구마스터', '서대문달인', '마포프로', '양천구전문', '구로구고수'
    ];

    const postTitles = {
        question: [
            "청약통장 가점 계산 관련 질문드립니다",
            "특별공급 자격 조건이 헷갈려요",
            "전매제한 기간 중 이사 가능한가요?",
            "모델하우스 예약 없이 방문 가능한가요?",
            "청약 당첨 후 대출 거절되면 어떻게 되나요?",
            "분양권 전매시 세금 계산법 알려주세요",
            "재당첨 제한 기간 확인 방법이 궁금합니다",
            "주택청약 1순위 조건이 뭔가요?",
            "무주택 기간 산정 기준이 어떻게 되나요?",
            "부부 공동명의 가능한가요?"
        ],
        info: [
            "2024년 1분기 서울 분양 일정 총정리",
            "금리 인상이 분양시장에 미치는 영향",
            "청약 가점제 vs 추첨제 완벽 정리",
            "모델하우스 효율적인 방문 팁 10가지",
            "분양가 상한제 지역 영업 전략",
            "2024년 달라지는 부동산 정책 요약",
            "서울 주요 지역 청약 경쟁률 분석",
            "신혼부부 특별공급 혜택 총정리",
            "청약통장 효율적 관리법",
            "분양 vs 매매 장단점 비교"
        ],
        review: [
            "힐스테이트 OO 청약 후기",
            "래미안 OO 모델하우스 방문 후기",
            "청약 당첨 후 계약 과정 상세 후기",
            "분양 상담사로 1년 일한 후기",
            "첫 분양 실패 후기와 교훈",
            "e편한세상 OO 입주 후기",
            "롯데캐슬 OO 청약 경쟁률 예상",
            "자이 OO 분양가 협상 성공 후기",
            "포스코 OO 모델하우스 상담 후기",
            "푸르지오 OO 당첨 후기"
        ],
        general: [
            "분양영업 10년차가 말하는 이 업계의 현실",
            "부동산 시장 하락기 생존 전략",
            "분양 현장에서 겪은 황당한 에피소드",
            "영업 실적 올리는 나만의 노하우",
            "이 일 하면서 가장 보람있었던 순간",
            "분양 영업의 미래는 어떻게 될까요?",
            "AI가 분양 영업을 대체할 수 있을까?",
            "MZ세대 고객 응대법",
            "실적 압박 스트레스 극복법",
            "워라밸 지키면서 실적 올리기"
        ],
        job: [
            "[채용] 강남 신규 분양 현장 팀장급 모집",
            "[구직] 분양 상담 경력 3년차 구직중",
            "[급구] 주말 모델하우스 도우미 구합니다",
            "분양대행사 신입사원 채용 공고",
            "[프리랜서] 분양 마케터 모집",
            "[채용] 온라인 분양 상담사 재택근무",
            "대형 건설사 분양팀 경력직 채용",
            "[구직] 부동산 자격증 보유자 구직",
            "모델하우스 매니저 구인",
            "[채용] 분양 마케팅 전문가 모집"
        ]
    };

    const posts = [];
    let postNumber = 2500;
    
    // 200개의 게시글 생성
    for (let i = 0; i < 200; i++) {
        const categories = ['general', 'question', 'info', 'review', 'job'];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const categoryNames = {
            general: '일반',
            question: '질문',
            info: '정보공유',
            review: '후기',
            job: '구인구직'
        };
        
        const authorIndex = Math.floor(Math.random() * 50);
        const title = postTitles[category][Math.floor(Math.random() * postTitles[category].length)];
        const daysAgo = Math.random() * 30;
        const hoursAgo = daysAgo * 24;
        
        let dateStr;
        if (hoursAgo < 1) {
            dateStr = `${Math.floor(hoursAgo * 60)}분 전`;
        } else if (hoursAgo < 24) {
            dateStr = `${Math.floor(hoursAgo)}시간 전`;
        } else if (daysAgo < 7) {
            dateStr = `${Math.floor(daysAgo)}일 전`;
        } else {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(daysAgo));
            dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        }
        
        posts.push({
            id: 1000 + i,
            number: postNumber--,
            category: category,
            categoryName: categoryNames[category],
            title: title,
            author: nicknames[authorIndex],
            authorName: userNames[authorIndex],
            date: dateStr,
            views: Math.floor(Math.random() * 3000) + 10,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50),
            isNew: hoursAgo < 24 && Math.random() > 0.5,
            content: `${title}에 대한 상세 내용입니다.\n\n작성자: ${nicknames[authorIndex]} (${userNames[authorIndex]})\n\n이 게시글은 ${categoryNames[category]} 카테고리의 글입니다.\n\n자세한 내용과 토론은 댓글에서 계속됩니다.`
        });
    }
    
    return posts;
}

// 전체 게시글 데이터
const allPosts = generateForumData();

// 인기 게시글 선택 (조회수, 좋아요, 댓글 기준)
const popularPosts = [...allPosts]
    .sort((a, b) => (b.views + b.likes * 10 + b.comments * 5) - (a.views + a.likes * 10 + a.comments * 5))
    .slice(0, 6)
    .map(post => ({
        ...post,
        excerpt: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title + ' - ' + post.categoryName + ' 게시판의 인기글입니다.'
    }));

// 댓글 데이터 생성
const commentsData = {};
const commentTemplates = [
    "좋은 정보 감사합니다!",
    "저도 같은 고민이 있었는데 도움이 되네요.",
    "자세한 설명 감사드립니다.",
    "이런 정보 정말 필요했어요!",
    "경험 공유 감사합니다.",
    "저도 비슷한 경험이 있습니다.",
    "추가로 질문드려도 될까요?",
    "정말 유용한 팁이네요!",
    "북마크 해두고 참고하겠습니다.",
    "다음에도 좋은 정보 부탁드려요."
];

// 각 게시글에 대한 댓글 생성
allPosts.forEach(post => {
    if (post.comments > 0) {
        const comments = [];
        const commentCount = Math.min(post.comments, 10);
        
        for (let i = 0; i < commentCount; i++) {
            const authorIndex = Math.floor(Math.random() * 50);
            const hoursAgo = Math.random() * 48;
            let dateStr;
            
            if (hoursAgo < 1) {
                dateStr = `${Math.floor(hoursAgo * 60)}분 전`;
            } else if (hoursAgo < 24) {
                dateStr = `${Math.floor(hoursAgo)}시간 전`;
            } else {
                dateStr = `${Math.floor(hoursAgo / 24)}일 전`;
            }
            
            comments.push({
                id: `${post.id}-${i}`,
                author: allPosts[Math.floor(Math.random() * 50)].author,
                content: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
                date: dateStr,
                likes: Math.floor(Math.random() * 30)
            });
        }
        
        commentsData[post.id] = comments;
    }
});

// 현재 표시되는 게시글 (최근 50개)
let displayedPosts = allPosts.slice(0, 50);
let currentCategory = 'all';
let currentSort = 'latest';

// 나머지 기존 함수들은 그대로 유지
// 카테고리별 게시글 필터링
function filterByCategory(category) {
    currentCategory = category;
    
    if (category === 'all') {
        displayedPosts = allPosts.slice(0, 50);
        showHotPosts();
    } else {
        displayedPosts = allPosts.filter(post => {
            const categoryMap = {
                'general': 'general',
                'question': 'question',
                'info': 'info',
                'review': 'review',
                'job': 'job'
            };
            return post.category === categoryMap[category];
        }).slice(0, 50);
        hideHotPosts();
    }
    
    sortPosts(currentSort);
    updatePostsList();
    updateCategoryCounts();
}

// 게시글 정렬
function sortPosts(sortType) {
    currentSort = sortType;
    
    switch(sortType) {
        case 'latest':
            displayedPosts.sort((a, b) => b.number - a.number);
            break;
        case 'views':
            displayedPosts.sort((a, b) => b.views - a.views);
            break;
        case 'comments':
            displayedPosts.sort((a, b) => b.comments - a.comments);
            break;
    }
    
    if (sortType !== 'latest') {
        hideHotPosts();
    } else if (currentCategory === 'all' && !document.querySelector('.search-box-large input').value.trim()) {
        showHotPosts();
    }
    
    updatePostsList();
}

// 게시글 검색
function searchPosts(searchTerm) {
    if (!searchTerm.trim()) {
        displayedPosts = allPosts.slice(0, 50);
        showHotPosts();
    } else {
        const term = searchTerm.toLowerCase();
        displayedPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(term) ||
            post.author.toLowerCase().includes(term) ||
            post.categoryName.toLowerCase().includes(term)
        ).slice(0, 50);
        hideHotPosts();
    }
    
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
                        <span><i class="fas fa-eye"></i> ${post.views.toLocaleString()}</span>
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
    
    document.querySelectorAll('.tab-btn').forEach(tab => {
        const tabText = tab.childNodes[0].textContent.trim();
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
            const countSpan = tab.querySelector('.count');
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
        card.style.cssText = 'flex: 0 0 280px; cursor: pointer;'; // 고정 너비로 변경
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

// 게시글 상세 모달 표시
function showPostDetail(post) {
    const modal = createModalTemplate();
    
    requestAnimationFrame(() => {
        const categoryBadge = modal.querySelector('.modal-category-badge');
        if (post.isNotice) {
            categoryBadge.className = 'modal-category-badge notice-badge';
            categoryBadge.textContent = '공지';
        } else {
            categoryBadge.className = `modal-category-badge category-badge ${post.category || 'info'}`;
            categoryBadge.textContent = post.categoryName || post.category || '정보공유';
        }
        
        modal.querySelector('.post-detail-title').textContent = post.title;
        
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
        
        const contentDiv = modal.querySelector('.post-detail-content-text');
        contentDiv.className = post.isNotice ? 'post-detail-content-text notice-content-text' : 'post-detail-content-text';
        contentDiv.innerHTML = post.content ? post.content.replace(/\n/g, '<br>') : '게시글 내용이 없습니다.';
        
        const actionsSection = modal.querySelector('.post-actions');
        const commentsSection = modal.querySelector('.comments-section');
        
        if (!post.isNotice) {
            actionsSection.style.display = '';
            commentsSection.style.display = '';
            
            const likeBtn = modal.querySelector('.like-btn');
            const likeIcon = likeBtn.querySelector('i');
            likeIcon.className = 'far fa-heart';
            likeIcon.style.color = '';
            likeBtn.onclick = () => toggleLike(likeBtn, post.id);
            likeBtn.querySelector('.like-count').textContent = post.likes || 0;
            
            modal.querySelector('.comments-title .comment-count').textContent = post.comments || 0;
            modal.querySelector('#commentsList').innerHTML = renderComments(post.id);
        } else {
            actionsSection.style.display = 'none';
            commentsSection.style.display = 'none';
        }
        
        // 모달 표시 시 깜빡임 방지
        modal.style.display = 'block';
        // requestAnimationFrame을 사용하여 다음 프레임에 active 클래스 추가
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
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

// 게시글 상세 모달 닫기
function closePostDetail() {
    const modal = document.getElementById('postDetailModal');
    if (modal) {
        modal.classList.remove('active');
        // display 속성을 즉시 변경하지 않고 transition 종료 후 변경
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
            }
        }, 300);
    }
}

// 인기 게시글 숨기기/표시
function hideHotPosts() {
    const hotPostsSection = document.querySelector('.hot-posts');
    const toggleBtn = document.getElementById('hotPostsToggle');
    
    if (hotPostsSection) {
        hotPostsSection.classList.add('collapsed');
        
        if (toggleBtn) {
            toggleBtn.classList.add('show');
            toggleBtn.classList.remove('expanded');
            toggleBtn.querySelector('span').textContent = '인기 게시글 보기';
        }
    }
}

function showHotPosts() {
    const hotPostsSection = document.querySelector('.hot-posts');
    const toggleBtn = document.getElementById('hotPostsToggle');
    
    if (hotPostsSection) {
        hotPostsSection.classList.remove('collapsed');
        
        if (toggleBtn) {
            toggleBtn.classList.remove('show');
            toggleBtn.classList.remove('expanded');
        }
    }
}

function toggleHotPosts() {
    const hotPostsSection = document.querySelector('.hot-posts');
    const toggleBtn = document.getElementById('hotPostsToggle');
    
    if (hotPostsSection && hotPostsSection.classList.contains('collapsed')) {
        hotPostsSection.classList.remove('collapsed');
        if (toggleBtn) {
            toggleBtn.classList.add('expanded');
            toggleBtn.querySelector('span').textContent = '인기 게시글 숨기기';
            setTimeout(() => {
                toggleBtn.classList.remove('show');
                toggleBtn.classList.remove('expanded');
            }, 2000);
        }
    } else if (hotPostsSection) {
        hideHotPosts();
    }
}

// 게시글 클릭 이벤트 등록
function initializePostClickEvents() {
    const postsList = document.querySelector('.posts-list');
    if (!postsList) return;
    
    postsList.removeEventListener('click', handlePostClick);
    postsList.addEventListener('click', handlePostClick);
}

// 게시글 클릭 핸들러
function handlePostClick(e) {
    if (e.target.closest('a')) return;
    
    const postItem = e.target.closest('.post-item');
    if (!postItem) return;
    
    if (postItem.dataset.clicking === 'true') return;
    postItem.dataset.clicking = 'true';
    
    requestAnimationFrame(() => {
        const postId = postItem.dataset.id;
        
        if (postId) {
            const post = allPosts.find(p => p.id == postId);
            if (post) {
                if (!post.content) {
                    post.content = `${post.title}\n\n해당 게시글의 상세 내용입니다.\n\n카테고리: ${post.categoryName}\n작성자: ${post.author}\n작성일: ${post.date}`;
                }
                showPostDetail(post);
            }
        }
        
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

// 글쓰기 모달 관련
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
    initializeInfiniteCarousel();
    updateCategoryCounts();
    updatePostsList();
    
    const hotPostsToggle = document.getElementById('hotPostsToggle');
    if (hotPostsToggle) {
        hotPostsToggle.addEventListener('click', function() {
            toggleHotPosts();
        });
    }
    
    const categoryTabs = document.querySelectorAll('.tab-btn');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabText = this.childNodes[0].textContent.trim();
            const categoryMap = {
                '전체': 'all',
                '일반': 'general',
                '질문': 'question',
                '정보공유': 'info',
                '후기': 'review',
                '구인구직': 'job'
            };
            
            const category = categoryMap[tabText];
            if (category) {
                filterByCategory(category);
            }
        });
    });
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filterText = this.querySelector('span').textContent;
            const sortMap = {
                '최신순': 'latest',
                '조회순': 'views',
                '댓글순': 'comments'
            };
            
            const sortType = sortMap[filterText];
            if (sortType) {
                sortPosts(sortType);
            }
        });
    });
    
    const searchButton = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-box-large input');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            searchPosts(searchTerm);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                searchPosts(searchTerm);
            }
        });
        
        searchInput.addEventListener('input', function(e) {
            if (!this.value.trim() && currentCategory === 'all') {
                showHotPosts();
            }
        });
    }
    
    const writeBtn = document.querySelector('.write-btn');
    if (writeBtn) {
        writeBtn.addEventListener('click', openWriteModal);
    }
    
    const closeModalBtn = document.getElementById('closeModal');
    const cancelWriteBtn = document.getElementById('cancelWrite');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeWriteModal);
    }
    if (cancelWriteBtn) {
        cancelWriteBtn.addEventListener('click', closeWriteModal);
    }
    
    const modalOverlay = document.querySelector('.write-modal .modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeWriteModal);
    }
    
    const titleInput = document.getElementById('postTitle');
    const titleCount = document.getElementById('titleCount');
    if (titleInput && titleCount) {
        titleInput.addEventListener('input', function() {
            titleCount.textContent = this.value.length;
        });
    }
    
    const contentTextarea = document.getElementById('postContent');
    const contentCount = document.getElementById('contentCount');
    if (contentTextarea && contentCount) {
        contentTextarea.addEventListener('input', function() {
            contentCount.textContent = this.value.length;
        });
    }
    
    initializePostClickEvents();
    
    document.addEventListener('click', function(e) {
        const noticeItem = e.target.closest('.notice-item');
        if (noticeItem && !e.target.closest('a')) {
            const noticePost = {
                id: 'notice-1',
                title: '[필독] 자유게시판 이용 규칙 및 가이드라인',
                isNotice: true,
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