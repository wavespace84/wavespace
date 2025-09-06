/**
 * WAVE SPACE - 포럼 페이지 Supabase 연동 (리팩토링된 버전)
 * BaseSupabaseManager를 상속받아 코드 중복을 제거하고 일관성을 제공합니다.
 */

// BaseSupabaseManager 가져오기
import BaseSupabaseManager from '../core/BaseSupabaseManager.js';

class ForumManager extends BaseSupabaseManager {
    constructor() {
        // BaseSupabaseManager 초기화
        super('forum_posts', {
            itemsPerPage: 20,
            enableRealtimeSubscription: true,
            cacheEnabled: true
        });
        
        // 포럼 특화 속성들
        this.currentCategory = 'all';
        this.categories = [];
        this.hotPosts = [];
        
        // UI 요소들
        this.elements = {
            postsContainer: null,
            categoryTabs: null,
            searchInput: null,
            createPostBtn: null,
            hotPostsSection: null
        };
        
        // 필터 상태
        this.filters = {
            category: 'all',
            search: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
    }

    /**
     * 초기화 완료 시 호출 (BaseSupabaseManager에서 오버라이드)
     */
    async onInitialized() {
        try {
            this.initializeElements();
            this.setupEventListeners();
            await this.loadCategories();
            await this.loadHotPosts();
            await this.loadPosts();
            this.updateAuthUI();
            
            console.log('🚀 ForumManager 초기화 완료');
        } catch (error) {
            console.error('포럼 초기화 오류:', error);
        }
    }

    /**
     * DOM 요소들 초기화
     */
    initializeElements() {
        this.elements = {
            postsContainer: document.querySelector('.forum-posts-list'),
            categoryTabs: document.querySelectorAll('.checkbox-tab'),
            searchInput: document.querySelector('#forum-search'),
            createPostBtn: document.querySelector('#create-post-btn'),
            hotPostsSection: document.querySelector('.hot-posts'),
            loadingSpinner: document.querySelector('.forum-loading'),
            emptyState: document.querySelector('.forum-empty')
        };
    }

    /**
     * 이벤트 리스너 설정 (BaseSupabaseManager의 addEventListener 사용)
     */
    setupEventListeners() {
        // 카테고리 탭 클릭
        this.elements.categoryTabs?.forEach(tab => {
            this.addEventListener(tab, 'click', (e) => {
                e.preventDefault();
                const category = tab.dataset.category;
                if (category !== this.currentCategory) {
                    this.changeCategory(category);
                }
            });
        });

        // 검색 입력
        if (this.elements.searchInput) {
            let searchTimeout;
            this.addEventListener(this.elements.searchInput, 'input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value.trim();
                    this.loadPosts();
                }, 300);
            });
        }

        // 게시글 작성 버튼
        if (this.elements.createPostBtn) {
            this.addEventListener(this.elements.createPostBtn, 'click', () => {
                this.openCreatePostModal();
            });
        }

        // 무한 스크롤
        this.addEventListener(window, 'scroll', () => {
            if (this.isNearBottom() && !this.isLoading) {
                this.loadMorePosts();
            }
        });
    }

    /**
     * 카테고리 로드
     */
    async loadCategories() {
        try {
            const { data, error } = await this.client
                .from('forum_categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');

            if (error) throw error;

            this.categories = data || [];
            this.renderCategoryTabs();
            
        } catch (error) {
            console.error('카테고리 로드 실패:', error);
        }
    }

    /**
     * 인기 게시글 로드
     */
    async loadHotPosts() {
        try {
            const { data, error } = await this.client
                .from('forum_posts')
                .select(`
                    *,
                    users:user_id(display_name, avatar_url),
                    _count_comments:forum_comments(count),
                    _count_likes:post_likes(count)
                `)
                .gte('like_count', 10)
                .gte('comment_count', 5)
                .order('like_count', { ascending: false })
                .limit(3);

            if (error) throw error;

            this.hotPosts = data || [];
            this.renderHotPosts();
            
        } catch (error) {
            console.error('인기 게시글 로드 실패:', error);
        }
    }

    /**
     * 게시글 목록 로드 (BaseSupabaseManager의 fetchData 활용)
     */
    async loadPosts(page = 1) {
        try {
            const filters = {};
            
            if (this.currentCategory !== 'all') {
                filters.category = this.currentCategory;
            }
            
            if (this.filters.search) {
                // 검색은 별도 쿼리 처리
                return await this.searchPosts(this.filters.search, page);
            }

            const result = await this.fetchData(
                filters,
                page,
                { column: this.filters.sortBy, ascending: this.filters.sortOrder === 'asc' }
            );

            if (page === 1) {
                this.posts = result.data;
            } else {
                this.posts = [...this.posts, ...result.data];
            }

            this.currentPage = result.currentPage;
            this.renderPosts();
            
        } catch (error) {
            this.handleError('게시글 로드 실패', error);
        }
    }

    /**
     * 게시글 검색
     */
    async searchPosts(searchTerm, page = 1) {
        try {
            const { data, error } = await this.client
                .from('forum_posts')
                .select(`
                    *,
                    users:user_id(display_name, avatar_url)
                `)
                .or(`title.ilike.%${searchTerm}%, content.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false })
                .range((page - 1) * this.options.itemsPerPage, page * this.options.itemsPerPage - 1);

            if (error) throw error;

            if (page === 1) {
                this.posts = data || [];
            } else {
                this.posts = [...this.posts, ...data || []];
            }

            this.renderPosts();
            
        } catch (error) {
            this.handleError('게시글 검색 실패', error);
        }
    }

    /**
     * 더 많은 게시글 로드 (무한스크롤)
     */
    async loadMorePosts() {
        await this.loadPosts(this.currentPage + 1);
    }

    /**
     * 카테고리 변경
     */
    async changeCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.updateCategoryUI(category);
        await this.loadPosts();
    }

    /**
     * 게시글 생성 (BaseSupabaseManager의 create 메서드 활용)
     */
    async createPost(postData) {
        try {
            // 현재 사용자 정보 자동 추가
            const data = {
                ...postData,
                category: this.currentCategory === 'all' ? 'general' : this.currentCategory,
                user_id: this.currentUser?.id,
                created_at: new Date().toISOString()
            };

            const result = await this.create(data);
            
            if (result) {
                // 목록 새로고침
                await this.loadPosts();
                return result;
            }
            
        } catch (error) {
            this.handleError('게시글 작성 실패', error);
        }
    }

    /**
     * 실시간 이벤트 처리 (BaseSupabaseManager에서 오버라이드)
     */
    onRealtimeInsert(newRecord) {
        // 새 게시글이 현재 카테고리에 맞으면 목록에 추가
        if (this.currentCategory === 'all' || newRecord.category === this.currentCategory) {
            this.posts.unshift(newRecord);
            this.renderPosts();
            this.showSuccessMessage('새로운 게시글이 등록되었습니다.');
        }
    }

    onRealtimeUpdate(newRecord, oldRecord) {
        // 기존 게시글 업데이트
        const index = this.posts.findIndex(post => post.id === newRecord.id);
        if (index !== -1) {
            this.posts[index] = newRecord;
            this.renderPosts();
        }
    }

    onRealtimeDelete(deletedRecord) {
        // 게시글 삭제
        this.posts = this.posts.filter(post => post.id !== deletedRecord.id);
        this.renderPosts();
        this.showSuccessMessage('게시글이 삭제되었습니다.');
    }

    /**
     * UI 렌더링 메서드들
     */
    renderPosts() {
        if (!this.elements.postsContainer) return;

        if (this.posts.length === 0) {
            this.elements.postsContainer.innerHTML = `
                <div class="forum-empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <h3>아직 게시글이 없습니다</h3>
                    <p>첫 번째 게시글을 작성해보세요!</p>
                </div>
            `;
            return;
        }

        const postsHTML = this.posts.map(post => this.renderPostCard(post)).join('');
        this.elements.postsContainer.innerHTML = postsHTML;
    }

    renderPostCard(post) {
        const createdAt = window.WaveFormatters?.formatRelativeTime(post.created_at) || '방금 전';
        const author = post.users?.display_name || '익명';
        
        return `
            <article class="forum-post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">
                            ${post.users?.avatar_url 
        ? `<img src="${post.users.avatar_url}" alt="${author}">` 
        : '<i class="fas fa-user"></i>'
}
                        </div>
                        <div class="author-info">
                            <span class="author-name">${author}</span>
                            <span class="post-time">${createdAt}</span>
                        </div>
                    </div>
                    <div class="post-category">
                        <span class="category-badge">${this.getCategoryName(post.category)}</span>
                    </div>
                </div>
                
                <div class="post-content">
                    <h3 class="post-title">
                        <a href="#" onclick="forumManager.openPost(${post.id})">${post.title}</a>
                    </h3>
                    <p class="post-excerpt">${this.truncateContent(post.content, 120)}</p>
                </div>
                
                <div class="post-stats">
                    <span class="stat-item">
                        <i class="fas fa-eye"></i>
                        ${post.view_count || 0}
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-comment"></i>
                        ${post.comment_count || 0}
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-heart"></i>
                        ${post.like_count || 0}
                    </span>
                </div>
            </article>
        `;
    }

    renderCategoryTabs() {
        // 카테고리 탭 렌더링 로직
    }

    renderHotPosts() {
        // 인기 게시글 렌더링 로직
    }

    /**
     * UI 업데이트 메서드들
     */
    updateAuthUI() {
        const createBtn = this.elements.createPostBtn;
        if (createBtn) {
            createBtn.style.display = this.currentUser ? 'block' : 'none';
        }
    }

    updateCategoryUI(activeCategory) {
        this.elements.categoryTabs?.forEach(tab => {
            const isActive = tab.dataset.category === activeCategory;
            tab.classList.toggle('active', isActive);
        });
    }

    /**
     * 유틸리티 메서드들
     */
    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category?.name || '일반';
    }

    truncateContent(content, maxLength) {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }

    isNearBottom() {
        return window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000;
    }

    openPost(postId) {
        // 게시글 상세 페이지로 이동
        window.location.href = `forum-post.html?id=${postId}`;
    }

    openCreatePostModal() {
        // 게시글 작성 모달 열기
        if (window.modalManager) {
            window.modalManager.open('create-post-modal');
        }
    }

    /**
     * 검색어 하이라이트
     */
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * 게시글 좋아요/좋아요 취소
     */
    async toggleLike(postId) {
        if (!this.currentUser) {
            this.showErrorMessage('로그인이 필요합니다.');
            return;
        }

        try {
            const { data: existingLike, error: checkError } = await this.client
                .from('post_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', this.currentUser.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingLike) {
                // 좋아요 취소
                await this.client
                    .from('post_likes')
                    .delete()
                    .eq('id', existingLike.id);
            } else {
                // 좋아요 추가
                await this.client
                    .from('post_likes')
                    .insert([{
                        post_id: postId,
                        user_id: this.currentUser.id
                    }]);
            }

            // 좋아요 수 업데이트
            await this.updatePostLikeCount(postId);
            
        } catch (error) {
            this.handleError('좋아요 처리 실패', error);
        }
    }

    async updatePostLikeCount(postId) {
        const { count, error } = await this.client
            .from('post_likes')
            .select('*', { count: 'exact' })
            .eq('post_id', postId);

        if (!error) {
            await this.update(postId, { like_count: count });
        }
    }
}

// 전역으로 내보내기
window.ForumManager = ForumManager;

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.forumManager = new ForumManager();
});

export default ForumManager;