// 유머재미 페이지 JavaScript

// 디버그 로그
console.log('humor.js 파일 로드 시작');

document.addEventListener('DOMContentLoaded', function() {
    console.log('humor.js DOMContentLoaded 이벤트 발생');
    
    // 카테고리 탭 - checkbox-tab 스타일
    const categoryTabs = document.querySelectorAll('.checkbox-tab');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const sortSelect = document.querySelector('.sort-select');
    const postItems = document.querySelectorAll('.post-item');
    const viewBtns = document.querySelectorAll('.view-btn');
    const pageBtns = document.querySelectorAll('.page-btn:not(:disabled)');

    console.log('카테고리 탭 개수:', categoryTabs.length);

    // 카테고리 탭 클릭 이벤트 (checkbox-tab 스타일)
    if (categoryTabs.length > 0) {
        categoryTabs.forEach((tab, index) => {
            const input = tab.querySelector('input[type="radio"]');
            console.log(`탭 ${index + 1} 등록:`, tab.textContent.trim());
            
            tab.addEventListener('click', function(e) {
                // preventDefault 제거 - radio 버튼의 기본 동작 허용
                
                console.log('탭 클릭됨:', this.textContent.trim());
                
                // 모든 탭에서 active 클래스 제거
                categoryTabs.forEach(t => {
                    t.classList.remove('active');
                    const tInput = t.querySelector('input[type="radio"]');
                    if (tInput) tInput.checked = false;
                });
                // 클릭한 탭에 active 클래스 추가
                this.classList.add('active');
                if (input) input.checked = true;
                
                const category = this.dataset.category;
                console.log('필터링 카테고리:', category);
                filterPosts(category);
            });
        });
    } else {
        console.error('카테고리 탭을 찾을 수 없습니다!');
    }

    // 검색 기능
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            console.log(`Searching for: ${searchTerm}`);
            // 실제 검색 로직 구현
        }
    }

    // 정렬 변경
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            console.log(`Sorting by: ${sortBy}`);
            // 정렬 로직 구현
        });
    }

    // 글쓰기 버튼
    const writeBtnFloat = document.querySelector('.write-btn-float');
    if (writeBtnFloat) {
        writeBtnFloat.addEventListener('click', function() {
            console.log('Opening write dialog...');
            // 글쓰기 다이얼로그 열기
        });
    }

    // 좋아요 버튼 이벤트
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const count = this.querySelector('.count');
            let currentCount = parseInt(count.textContent);
            
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                count.textContent = currentCount - 1;
            } else {
                this.classList.add('active');
                count.textContent = currentCount + 1;
            }
        });
    });

    // 댓글 버튼 이벤트
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Opening comments...');
        });
    });

    // 공유 버튼 이벤트
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Sharing post...');
        });
    });

    // 페이지네이션
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const pageNumber = this.textContent;
            if (!this.classList.contains('page-dots')) {
                pageBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                loadPage(pageNumber);
            }
        });
    });

    // 게시글 클릭 이벤트
    postItems.forEach(item => {
        item.addEventListener('click', function() {
            const postId = this.dataset.postId;
            console.log(`Opening post ${postId}...`);
            // 게시글 상세 페이지로 이동
        });
    });

    // 필터링 함수
    function filterPosts(category) {
        console.log(`Filtering posts by category: ${category}`);
        
        const posts = document.querySelectorAll('.post-item');
        console.log(`Found ${posts.length} posts to filter`);
        let visibleCount = 0;
        
        posts.forEach(post => {
            const postCategory = post.dataset.category;
            
            if (category === 'all') {
                post.style.display = '';
                visibleCount++;
            } else {
                // data-category 속성으로 필터링
                if (postCategory === category) {
                    post.style.display = '';
                    visibleCount++;
                } else {
                    post.style.display = 'none';
                }
            }
        });
        
        // 게시글이 없을 때 메시지 표시
        const postsGrid = document.querySelector('.posts-grid');
        let noPostsMessage = document.querySelector('.no-posts-message');
        
        if (visibleCount === 0) {
            if (!noPostsMessage) {
                noPostsMessage = document.createElement('div');
                noPostsMessage.className = 'no-posts-message';
                noPostsMessage.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;';
                noPostsMessage.innerHTML = `
                    <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 16px; display: block;"></i>
                    <p style="font-size: 16px;">해당 카테고리에 게시글이 없습니다.</p>
                `;
                postsGrid.appendChild(noPostsMessage);
            }
            noPostsMessage.style.display = 'block';
        } else {
            if (noPostsMessage) {
                noPostsMessage.style.display = 'none';
            }
        }
        
        // 카테고리별 게시글 개수 업데이트
        updateCategoryCounts();
        
        console.log(`${category} 카테고리: ${visibleCount}개 게시글 표시`);
    }
    
    // 카테고리별 게시글 개수 업데이트
    function updateCategoryCounts() {
        const categoryTabs = document.querySelectorAll('.checkbox-tab');
        
        categoryTabs.forEach(tab => {
            const category = tab.dataset.category;
            const countSpan = tab.querySelector('.tab-count');
            
            if (countSpan) {
                const posts = document.querySelectorAll('.post-item');
                let count = 0;
                
                if (category === 'all') {
                    count = posts.length;
                } else {
                    posts.forEach(post => {
                        if (post.dataset.category === category) {
                            count++;
                        }
                    });
                }
                
                countSpan.textContent = count;
            }
        });
    }
    
    // 초기 로드시 카테고리 개수 업데이트
    updateCategoryCounts();

    // 페이지 로드 함수
    function loadPage(pageNumber) {
        console.log(`Loading page ${pageNumber}...`);
        // 실제 페이지 로드 로직 구현
    }

    // View 버튼 이벤트
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const viewType = this.dataset.view;
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            changeViewType(viewType);
        });
    });

    function changeViewType(type) {
        const postsGrid = document.querySelector('.posts-grid');
        if (type === 'grid') {
            postsGrid.classList.add('grid-view');
            postsGrid.classList.remove('list-view');
        } else {
            postsGrid.classList.add('list-view');
            postsGrid.classList.remove('grid-view');
        }
    }
});