// 유머재미 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 카테고리 탭
    const categoryTabs = document.querySelectorAll('.category-tab');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const sortSelect = document.querySelector('.sort-select');
    const postItems = document.querySelectorAll('.post-item');
    const viewBtns = document.querySelectorAll('.view-btn');
    const pageBtns = document.querySelectorAll('.page-btn:not(:disabled)');

    // 카테고리 탭 클릭 이벤트
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const category = this.dataset.category;
            filterPosts(category);
        });
    });

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
        // 실제 필터링 로직 구현
    }

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