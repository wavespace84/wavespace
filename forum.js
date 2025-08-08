// forum.js - 자유게시판 페이지 동적 기능

// 즉시 실행되는 디버그 로그
console.log('forum.js 파일 로드 시작');

// 게시글 필터링 함수
function filterPosts(category) {
    const posts = document.querySelectorAll('.post-item:not(.notice)'); // 공지사항 제외
    let visibleCount = 0;
    
    posts.forEach(post => {
        const postCategory = post.querySelector('.category-badge');
        
        if (category === 'all') {
            // 전체 카테고리면 모든 게시글 표시
            post.style.display = '';
            visibleCount++;
        } else if (postCategory) {
            // 특정 카테고리 필터링
            const postCategoryClass = Array.from(postCategory.classList).find(cls => 
                ['general', 'question', 'info', 'review', 'job'].includes(cls)
            );
            
            if (postCategoryClass === category) {
                post.style.display = '';
                visibleCount++;
            } else {
                post.style.display = 'none';
            }
        }
    });
    
    // 게시글이 없을 때 메시지 표시
    const postsList = document.querySelector('.posts-list');
    let noPostsMessage = document.querySelector('.no-posts-message');
    
    if (visibleCount === 0) {
        if (!noPostsMessage) {
            noPostsMessage = document.createElement('div');
            noPostsMessage.className = 'no-posts-message';
            noPostsMessage.style.cssText = 'text-align: center; padding: 60px 20px; color: #666;';
            noPostsMessage.innerHTML = `
                <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; margin-bottom: 16px;"></i>
                <p style="font-size: 16px;">해당 카테고리에 게시글이 없습니다.</p>
            `;
            postsList.appendChild(noPostsMessage);
        }
        noPostsMessage.style.display = 'block';
    } else {
        if (noPostsMessage) {
            noPostsMessage.style.display = 'none';
        }
    }
    
    console.log(`${category} 카테고리 게시글 ${visibleCount}개 표시`);
}

// 카테고리별 게시글 개수 업데이트
function updateCategoryCounts() {
    const posts = document.querySelectorAll('.post-item:not(.notice)');
    const counts = {
        all: 0,
        general: 0,
        question: 0,
        info: 0,
        review: 0,
        job: 0
    };
    
    posts.forEach(post => {
        const postCategory = post.querySelector('.category-badge');
        if (postCategory) {
            const categoryClass = Array.from(postCategory.classList).find(cls => 
                ['general', 'question', 'info', 'review', 'job'].includes(cls)
            );
            
            if (categoryClass) {
                counts[categoryClass]++;
                counts.all++;
            }
        }
    });
    
    // 탭의 숫자 업데이트
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        const category = tab.getAttribute('data-category');
        if (category && counts[category] !== undefined) {
            const countSpan = tab.querySelector('.count');
            if (countSpan) {
                countSpan.textContent = counts[category];
            }
        }
    });
    
    console.log('카테고리별 게시글 개수:', counts);
}

// 페이지 로드 후 실행
window.addEventListener('load', function() {
    console.log('window load 이벤트 발생');
    initializeForum();
});

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 이벤트 발생');
    initializeForum();
});

// 초기화 함수
function initializeForum() {
    console.log('initializeForum 함수 실행');
    
    // 카테고리 탭 전환
    const categoryTabs = document.querySelectorAll('.tab-btn');
    console.log('카테고리 탭 개수:', categoryTabs.length);
    
    if (categoryTabs.length === 0) {
        console.error('카테고리 탭을 찾을 수 없습니다!');
        return;
    }
    
    // 카테고리 매핑 설정
    const categoryMap = {
        '전체': 'all',
        '일반': 'general',
        '질문': 'question', 
        '정보공유': 'info',
        '후기': 'review',
        '구인구직': 'job'
    };
    
    // 각 탭에 data-category 속성 추가
    categoryTabs.forEach((tab) => {
        const tabText = tab.childNodes[0].textContent.trim();
        const category = categoryMap[tabText];
        if (category) {
            tab.setAttribute('data-category', category);
        }
    });
    
    // 실제 게시글 개수 계산 및 업데이트
    updateCategoryCounts();
    
    categoryTabs.forEach((tab, index) => {
        console.log(`탭 ${index + 1} 등록:`, tab.textContent.trim());
        
        // 이미 등록된 이벤트 리스너가 있는지 확인
        if (!tab.hasAttribute('data-listener-attached')) {
            tab.setAttribute('data-listener-attached', 'true');
            
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const category = this.getAttribute('data-category');
                console.log('탭 클릭됨:', this.textContent.trim(), '카테고리:', category);
                
                // 모든 탭 비활성화
                categoryTabs.forEach(t => t.classList.remove('active'));
                // 클릭한 탭 활성화
                this.classList.add('active');
                
                // 게시글 필터링
                filterPosts(category);
                
                console.log('카테고리 변경 완료:', this.textContent.trim());
            });
        }
    });

    // 인기 게시글 카드 클릭
    const hotPostCards = document.querySelectorAll('.hot-post-card');
    hotPostCards.forEach(card => {
        card.addEventListener('click', function() {
            console.log('인기 게시글 클릭');
            // 게시글 상세 페이지로 이동
        });
    });

    // 게시글 아이템 호버 효과
    const postItems = document.querySelectorAll('.post-item');
    postItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
        
        item.addEventListener('click', function(e) {
            // 링크가 아닌 영역 클릭 시에도 게시글 상세로 이동
            if (!e.target.closest('a')) {
                const link = this.querySelector('.post-title a');
                if (link) {
                    console.log('게시글 클릭:', link.textContent);
                    // link.click(); // 실제로는 이렇게 처리
                }
            }
        });
    });

    // 글쓰기 버튼
    const writeBtn = document.querySelector('.write-btn');
    if (writeBtn) {
        writeBtn.addEventListener('click', function() {
            console.log('글쓰기 버튼 클릭');
            // 글쓰기 페이지로 이동 또는 모달 열기
            alert('글쓰기 기능은 로그인 후 이용 가능합니다.');
        });
    }

    // 검색 기능
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            console.log('검색어:', searchTerm);
            // 검색 결과 페이지로 이동 또는 필터링
        }
    }

    // 정렬 필터
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            console.log('정렬 변경:', this.value);
            // 게시글 목록 재정렬
        });
    }

    // 페이지네이션
    const pageButtons = document.querySelectorAll('.page-btn:not(:disabled)');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                // 모든 페이지 버튼 비활성화
                document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
                // 클릭한 버튼 활성화
                this.classList.add('active');
                
                console.log('페이지 변경:', this.textContent);
                // 페이지 변경 로직
            }
        });
    });

    // 인기 키워드 클릭
    const keywords = document.querySelectorAll('.keyword-item .keyword');
    keywords.forEach(keyword => {
        keyword.addEventListener('click', function() {
            const keywordText = this.textContent;
            if (searchInput) {
                searchInput.value = keywordText;
                performSearch();
            }
        });
    });

    // 좋아요 버튼 (예시)
    const likeButtons = document.querySelectorAll('.like-count');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 게시글 클릭 이벤트 방지
            const currentCount = parseInt(this.textContent.match(/\d+/)[0]);
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                // 좋아요 추가
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.innerHTML = `<i class="fas fa-thumbs-up"></i> ${currentCount + 1}`;
                this.style.color = '#0066ff';
            } else {
                // 좋아요 취소
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.innerHTML = `<i class="far fa-thumbs-up"></i> ${currentCount - 1}`;
                this.style.color = '#666';
            }
        });
    });

    // 베스트 댓글 더보기 (가상의 기능)
    const bestComments = document.querySelector('.best-comments');
    if (bestComments) {
        // 더보기 버튼 추가 가능
    }

    // 게시글 목록 무한 스크롤 (옵션)
    let isLoading = false;
    window.addEventListener('scroll', function() {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
            // 추가 게시글 로드
            console.log('추가 게시글 로드');
            isLoading = true;
            // 로딩 완료 후 isLoading = false;
        }
    });
}