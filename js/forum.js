// 자유게시판 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 카테고리 탭 전환
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 탭에서 active 클래스 제거
            tabBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 탭에 active 클래스 추가
            this.classList.add('active');
            
            // 선택한 카테고리로 게시글 필터링
            const category = this.dataset.category;
            filterPosts(category);
        });
    });
    
    // 검색 기능
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // 필터 선택
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortPosts(sortBy);
        });
    }
    
    // 글쓰기 버튼
    const writeBtn = document.querySelector('.write-btn');
    if (writeBtn) {
        writeBtn.addEventListener('click', function() {
            // 로그인 체크
            const isLoggedIn = checkLoginStatus();
            if (isLoggedIn) {
                // 글쓰기 페이지로 이동
                console.log('Navigating to write page...');
                // window.location.href = '/forum/write';
            } else {
                alert('로그인이 필요한 서비스입니다.');
                // window.location.href = '/login';
            }
        });
    }
    
    // 게시글 클릭 이벤트
    const postItems = document.querySelectorAll('.post-item');
    postItems.forEach(item => {
        // 제목 클릭 시 상세 페이지로 이동
        const titleLink = item.querySelector('.post-title a');
        if (titleLink) {
            titleLink.addEventListener('click', function(e) {
                e.preventDefault();
                const postId = item.querySelector('.post-number')?.textContent || 'notice';
                console.log(`Opening post ${postId}...`);
                // window.location.href = `/forum/post/${postId}`;
            });
        }
        
        // 좋아요 버튼
        const likeBtn = item.querySelector('.like-count');
        if (likeBtn) {
            likeBtn.style.cursor = 'pointer';
            likeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleLike(this);
            });
        }
    });
    
    // 인기 게시글 카드 클릭
    const hotPostCards = document.querySelectorAll('.hot-post-card');
    hotPostCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.hot-post-title').textContent;
            console.log(`Opening hot post: ${title}`);
            // 게시글 상세 페이지로 이동
        });
    });
    
    // 페이지네이션
    setupPagination();
    
    // 인기 키워드 클릭
    const keywords = document.querySelectorAll('.keyword-item .keyword');
    keywords.forEach(keyword => {
        keyword.addEventListener('click', function() {
            const searchTerm = this.textContent;
            document.querySelector('.search-input').value = searchTerm;
            performSearch();
        });
    });
    
    // 베스트 댓글 좋아요
    const commentLikes = document.querySelectorAll('.comment-likes');
    commentLikes.forEach(like => {
        like.style.cursor = 'pointer';
        like.addEventListener('click', function() {
            const currentCount = parseInt(this.textContent.match(/\d+/)[0]);
            this.innerHTML = `<i class="fas fa-thumbs-up"></i> ${currentCount + 1}`;
            this.style.color = '#ff6b35';
        });
    });
    
    // 실시간 업데이트 시뮬레이션
    startRealtimeUpdates();
});

// 게시글 필터링
function filterPosts(category) {
    console.log(`Filtering posts by category: ${category}`);
    
    const postsList = document.querySelector('.posts-list');
    if (postsList) {
        // 로딩 효과
        postsList.style.opacity = '0.5';
        
        setTimeout(() => {
            // 실제 구현 시 서버에서 필터링된 데이터 로드
            postsList.style.opacity = '1';
            
            // 카테고리별 게시글 표시/숨김 시뮬레이션
            const posts = postsList.querySelectorAll('.post-item:not(.notice)');
            posts.forEach(post => {
                if (category === 'all') {
                    post.style.display = 'flex';
                } else {
                    // 카테고리 매칭 로직
                    post.style.display = Math.random() > 0.5 ? 'flex' : 'none';
                }
            });
        }, 300);
    }
}

// 검색 수행
function performSearch() {
    const searchTerm = document.querySelector('.search-input').value.trim();
    
    if (searchTerm === '') {
        alert('검색어를 입력해주세요.');
        return;
    }
    
    console.log(`Searching for: ${searchTerm}`);
    
    // 검색 결과 하이라이트
    const postTitles = document.querySelectorAll('.post-title a');
    postTitles.forEach(title => {
        const text = title.textContent;
        if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
            title.style.backgroundColor = '#fff3cd';
            title.style.padding = '2px 4px';
            title.style.borderRadius = '4px';
        }
    });
    
    // 실제 구현 시 서버 검색 API 호출
}

// 게시글 정렬
function sortPosts(sortBy) {
    console.log(`Sorting posts by: ${sortBy}`);
    
    const postsList = document.querySelector('.posts-list');
    if (postsList) {
        // 애니메이션 효과
        const posts = Array.from(postsList.querySelectorAll('.post-item:not(.notice)'));
        
        posts.forEach((post, index) => {
            post.style.transform = 'translateY(10px)';
            post.style.opacity = '0';
            
            setTimeout(() => {
                post.style.transform = 'translateY(0)';
                post.style.opacity = '1';
            }, index * 50);
        });
    }
}

// 로그인 상태 확인
function checkLoginStatus() {
    // 실제 구현 시 세션/토큰 확인
    return localStorage.getItem('isLoggedIn') === 'true';
}

// 좋아요 토글
function toggleLike(element) {
    const icon = element.querySelector('i');
    const countText = element.textContent.match(/\d+/)[0];
    let count = parseInt(countText);
    
    if (icon.classList.contains('fas')) {
        // 좋아요 취소
        icon.classList.remove('fas');
        icon.classList.add('far');
        count--;
        element.style.color = '#666';
    } else {
        // 좋아요
        icon.classList.remove('far');
        icon.classList.add('fas');
        count++;
        element.style.color = '#ff3b30';
        
        // 애니메이션 효과
        element.style.transform = 'scale(1.2)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
    
    element.innerHTML = `<i class="${icon.className}"></i> ${count}`;
}

// 페이지네이션 설정
function setupPagination() {
    const pageBtns = document.querySelectorAll('.page-btn:not(.prev):not(.next)');
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    
    pageBtns.forEach(btn => {
        if (!btn.classList.contains('page-dots')) {
            btn.addEventListener('click', function() {
                // 모든 페이지 버튼에서 active 제거
                pageBtns.forEach(b => b.classList.remove('active'));
                // 클릭한 버튼에 active 추가
                this.classList.add('active');
                
                // 페이지 로드
                const pageNumber = this.textContent;
                loadPage(pageNumber);
                
                // 이전/다음 버튼 상태 업데이트
                updateNavButtons(parseInt(pageNumber));
            });
        }
    });
    
    if (prevBtn) {
        prevBtn.addEventListener('click', navigatePrev);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', navigateNext);
    }
}

// 페이지 로드
function loadPage(pageNumber) {
    console.log(`Loading page ${pageNumber}...`);
    
    // 스크롤 상단으로
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 로딩 효과
    const postsList = document.querySelector('.posts-list');
    if (postsList) {
        postsList.style.opacity = '0.3';
        setTimeout(() => {
            postsList.style.opacity = '1';
        }, 300);
    }
}

// 이전 페이지
function navigatePrev() {
    const activeBtn = document.querySelector('.page-btn.active');
    const prevSibling = activeBtn.previousElementSibling;
    
    if (prevSibling && !prevSibling.classList.contains('prev')) {
        prevSibling.click();
    }
}

// 다음 페이지
function navigateNext() {
    const activeBtn = document.querySelector('.page-btn.active');
    const nextSibling = activeBtn.nextElementSibling;
    
    if (nextSibling && !nextSibling.classList.contains('next') && !nextSibling.classList.contains('page-dots')) {
        nextSibling.click();
    }
}

// 네비게이션 버튼 상태 업데이트
function updateNavButtons(currentPage) {
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        // 마지막 페이지 체크 로직
        const lastPageBtn = document.querySelector('.page-btn:nth-last-child(2)');
        const lastPage = parseInt(lastPageBtn.textContent);
        nextBtn.disabled = currentPage === lastPage;
    }
}

// 실시간 업데이트 시뮬레이션
function startRealtimeUpdates() {
    // 새 게시글 알림
    setInterval(() => {
        const random = Math.random();
        if (random > 0.8) {
            showNewPostNotification();
        }
    }, 30000); // 30초마다 체크
    
    // 인기 키워드 업데이트
    setInterval(() => {
        updateTrendingKeywords();
    }, 60000); // 1분마다 업데이트
}

// 새 게시글 알림
function showNewPostNotification() {
    console.log('New posts available!');
    
    // 알림 배너 표시 (실제 구현 시)
    const notification = document.createElement('div');
    notification.className = 'new-post-notification';
    notification.innerHTML = `
        <i class="fas fa-bell"></i>
        <span>새로운 게시글이 등록되었습니다.</span>
        <button onclick="location.reload()">새로고침</button>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #0066ff;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// 인기 키워드 업데이트
function updateTrendingKeywords() {
    const keywords = document.querySelectorAll('.keyword-item');
    
    // 랜덤하게 순위 변경 시뮬레이션
    keywords.forEach(item => {
        const trend = item.querySelector('.trend');
        const random = Math.random();
        
        if (random < 0.33) {
            trend.textContent = '▲';
            trend.className = 'trend up';
        } else if (random < 0.66) {
            trend.textContent = '▼';
            trend.className = 'trend down';
        } else {
            trend.textContent = '-';
            trend.className = 'trend same';
        }
    });
}