/**
 * WAVE SPACE - 포럼 페이지 Supabase 연동
 * 자유게시판의 실제 데이터 연동
 */

// ES6 모듈 대신 전역 객체 사용 (CORS 문제 해결)
// supabase, authService, postService는 이미 전역으로 로드된 상태여야 함

class ForumManager {
    constructor() {
        this.currentUser = null;
        this.posts = [];
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.postsPerPage = 20;
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            // 전역 객체들이 로드될 때까지 대기
            await this.waitForDependencies();
            
            if (window.authService) {
                await window.authService.init();
                this.currentUser = await window.authService.getCurrentUser();
            }
            
            this.setupEventListeners();
            if (window.postService) {
                await this.loadCategories();
                await this.loadPosts();
            }
            this.updateAuthUI();
        } catch (error) {
            console.error('포럼 초기화 오류:', error);
        }
    }

    // 의존성 대기 함수
    async waitForDependencies() {
        let attempts = 0;
        const maxAttempts = 50; // 5초 대기
        
        while (attempts < maxAttempts) {
            if (window.supabase && window.authService && window.postService) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('필요한 서비스들의 로딩 실패');
    }

    setupEventListeners() {
        // 게시글 작성 버튼 - forum.js와 충돌 방지를 위해 주석 처리
        // const writeBtn = document.querySelector('.write-btn, .btn-write');
        // if (writeBtn) {
        //     writeBtn.addEventListener('click', () => this.showWriteForm());
        // }

        // 카테고리 필터
        const categoryBtns = document.querySelectorAll('.filter-btn, .category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category || 'all';
                this.filterByCategory(category);
            });
        });

        // 검색 기능
        const searchInput = document.querySelector('#search-input, .search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchPosts(e.target.value);
                }
            });
        }

        // 페이지네이션
        this.setupPaginationListeners();
    }

    async updateAuthUI() {
        const userInfo = document.querySelector('.user-info, .profile-section');
        const authBtns = document.querySelector('.auth-buttons, .login-section');

        if (this.currentUser) {
            // 로그인된 상태
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-profile">
                        <img src="${this.currentUser.profile_image_url || '/assets/default-avatar.png'}" 
                             alt="프로필" class="profile-avatar">
                        <div class="user-details">
                            <span class="username">${this.currentUser.username}</span>
                            <span class="user-points">${this.currentUser.points || 0} P</span>
                        </div>
                    </div>
                `;
            }

            // 글쓰기 버튼 활성화
            const writeBtns = document.querySelectorAll('.write-btn, .btn-write');
            writeBtns.forEach(btn => {
                btn.style.display = 'block';
                btn.disabled = false;
            });
        } else {
            // 로그아웃된 상태
            if (authBtns) {
                authBtns.innerHTML = `
                    <a href="login.html" class="btn btn-primary">로그인</a>
                    <a href="signup.html" class="btn btn-secondary">회원가입</a>
                `;
            }

            // 글쓰기 버튼 비활성화
            const writeBtns = document.querySelectorAll('.write-btn, .btn-write');
            writeBtns.forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }

    async loadCategories() {
        try {
            const categories = await window.postService.getCategories();
            this.renderCategoryFilters(categories);
        } catch (error) {
            console.error('카테고리 로딩 오류:', error);
        }
    }

    renderCategoryFilters(categories) {
        const filterContainer = document.querySelector('.category-filters, .filter-buttons');
        if (!filterContainer) return;

        const filtersHTML = `
            <button class="filter-btn ${this.currentCategory === 'all' ? 'active' : ''}" 
                    data-category="all">
                전체
            </button>
            ${categories.map(cat => `
                <button class="filter-btn ${this.currentCategory === cat.id ? 'active' : ''}" 
                        data-category="${cat.id}">
                    ${cat.name}
                </button>
            `).join('')}
        `;

        filterContainer.innerHTML = filtersHTML;

        // 이벤트 리스너 다시 설정
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });
    }

    async loadPosts(reset = true) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoading();

            const options = {
                page: reset ? 1 : this.currentPage,
                limit: this.postsPerPage,
                category_id: this.currentCategory === 'all' ? null : this.currentCategory,
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            const result = await window.postService.getPosts(options);
            
            if (reset) {
                this.posts = result.posts || [];
                this.currentPage = 1;
            } else {
                this.posts = [...this.posts, ...(result.posts || [])];
                this.currentPage++;
            }

            this.renderPosts();
            this.updatePagination(result.total || 0, result.totalPages || 0);

        } catch (error) {
            console.error('게시글 로딩 오류:', error);
            this.showError('게시글을 불러올 수 없습니다.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderPosts() {
        const postsContainer = document.querySelector('.posts-list, .forum-posts, .posts-container');
        if (!postsContainer) return;

        if (this.posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>게시글이 없습니다</h3>
                    <p>첫 번째 게시글을 작성해보세요!</p>
                    ${this.currentUser ? '<button class="btn btn-primary" onclick="forumManager.showWriteForm()">글쓰기</button>' : ''}
                </div>
            `;
            return;
        }

        const postsHTML = this.posts.map(post => `
            <article class="post-item" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-category">
                        <span class="category-badge">${this.getCategoryName(post.category_id)}</span>
                        ${post.is_pinned ? '<span class="pinned-badge">📌 고정</span>' : ''}
                    </div>
                    <div class="post-meta">
                        <span class="post-author">${post.users?.username || '익명'}</span>
                        <span class="post-date">${this.formatDate(post.created_at)}</span>
                    </div>
                </div>

                <div class="post-content" onclick="forumManager.viewPost('${post.id}')">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${this.truncateText(post.content, 150)}</p>
                </div>

                <div class="post-footer">
                    <div class="post-stats">
                        <span class="stat">
                            <i class="fas fa-eye"></i>
                            ${post.view_count || 0}
                        </span>
                        <span class="stat">
                            <i class="fas fa-heart"></i>
                            ${post.like_count || 0}
                        </span>
                        <span class="stat">
                            <i class="fas fa-comment"></i>
                            ${post.comment_count || 0}
                        </span>
                    </div>
                    
                    <div class="post-actions">
                        ${this.currentUser ? `
                            <button class="action-btn like-btn ${post.user_liked ? 'liked' : ''}" 
                                    onclick="forumManager.toggleLike('${post.id}')">
                                <i class="fas fa-heart"></i>
                            </button>
                        ` : ''}
                        ${this.canEditPost(post) ? `
                            <button class="action-btn edit-btn" onclick="forumManager.editPost('${post.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </article>
        `).join('');

        postsContainer.innerHTML = postsHTML;
    }

    async filterByCategory(category) {
        this.currentCategory = category;
        
        // 필터 버튼 활성화 업데이트
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        await this.loadPosts(true);
    }

    async searchPosts(query) {
        if (!query.trim()) {
            await this.loadPosts(true);
            return;
        }

        try {
            this.showLoading();
            const result = await postService.searchPosts(query, {
                category_id: this.currentCategory === 'all' ? null : this.currentCategory
            });
            
            this.posts = result.posts;
            this.renderPosts();
        } catch (error) {
            console.error('검색 오류:', error);
            this.showError('검색 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    async viewPost(postId) {
        try {
            // 조회수 증가
            await postService.incrementViewCount(postId);
            
            // 게시글 상세 페이지로 이동
            window.location.href = `post-detail.html?id=${postId}`;
        } catch (error) {
            console.error('게시글 조회 오류:', error);
        }
    }

    async toggleLike(postId) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const result = await postService.toggleLike(postId);
            
            // UI 업데이트
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            const likeBtn = postElement?.querySelector('.like-btn');
            const likeCount = postElement?.querySelector('.stat i.fa-heart').nextSibling;
            
            if (likeBtn && likeCount) {
                if (result.isLiked) {
                    likeBtn.classList.add('liked');
                    likeCount.textContent = ` ${result.likeCount}`;
                } else {
                    likeBtn.classList.remove('liked');
                    likeCount.textContent = ` ${result.likeCount}`;
                }
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
            this.showError('좋아요 처리 중 오류가 발생했습니다.');
        }
    }

    showWriteForm() {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        // 글쓰기 모달 표시 또는 페이지 이동
        window.location.href = 'post-write.html?category=forum';
    }

    async editPost(postId) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        window.location.href = `post-edit.html?id=${postId}`;
    }

    canEditPost(post) {
        if (!this.currentUser) return false;
        return post.author_id === this.currentUser.id || authService.isAdmin();
    }

    setupPaginationListeners() {
        const loadMoreBtn = document.querySelector('.load-more-btn, .btn-load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadPosts(false); // 추가 로딩
            });
        }
    }

    updatePagination(total, totalPages) {
        const loadMoreBtn = document.querySelector('.load-more-btn, .btn-load-more');
        if (loadMoreBtn) {
            if (this.currentPage >= totalPages) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.textContent = `더 보기 (${this.posts.length}/${total})`;
            }
        }

        // 페이지 정보 업데이트
        const pageInfo = document.querySelector('.page-info');
        if (pageInfo) {
            pageInfo.textContent = `전체 ${total}개 게시글`;
        }
    }

    // 유틸리티 함수들
    getCategoryName(categoryId) {
        const categories = {
            1: '일반',
            2: '정보공유', 
            3: '후기',
            4: '질문답변',
            5: '노하우'
        };
        return categories[categoryId] || '일반';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        return date.toLocaleDateString('ko-KR');
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showLoading() {
        const loadingEl = document.querySelector('.loading, .posts-loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingEl = document.querySelector('.loading, .posts-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showError(message) {
        // 토스트 알림 표시 (notificationService가 있다면 사용)
        if (window.notificationService) {
            window.notificationService.showToast(message, 'error');
        } else {
            alert(`오류: ${message}`);
        }
    }

    showSuccess(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'success');
        } else {
            alert(`성공: ${message}`);
        }
    }
}

// 전역 인스턴스 생성
window.forumManager = new ForumManager();

// 기존 forum.js와의 호환성을 위한 전역 함수들
window.viewPost = (postId) => window.forumManager.viewPost(postId);
window.toggleLike = (postId) => window.forumManager.toggleLike(postId);
window.showWriteForm = () => window.forumManager.showWriteForm();
window.editPost = (postId) => window.forumManager.editPost(postId);