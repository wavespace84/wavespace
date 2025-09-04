/**
 * WAVE SPACE - 유머 페이지 Supabase 연동
 * 유머 콘텐츠의 실제 데이터 연동 및 반응 시스템
 */

import { supabase } from '../config/supabase.js';
import { authService } from '../services/authService.js';
import { postService } from '../services/postService.js';

class HumorManager {
    constructor() {
        this.currentUser = null;
        this.humorPosts = [];
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.postsPerPage = 20;
        this.isLoading = false;
        this.reactions = ['😂', '😭', '💯', '🔥', '👍', '😮'];
        this.init();
    }

    async init() {
        try {
            await authService.init();
            this.currentUser = await authService.getCurrentUser();
            
            this.setupEventListeners();
            await this.loadHumorPosts();
            await this.loadPopularTags();
            this.updateAuthUI();
            this.setupRealtimeSubscription();
        } catch (error) {
            console.error('유머 페이지 초기화 오류:', error);
        }
    }

    setupEventListeners() {
        // 카테고리 필터
        const categoryBtns = document.querySelectorAll('.humor-category');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category || 'all';
                this.filterByCategory(category);
            });
        });

        // 검색 기능
        const searchInput = document.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchHumor(e.target.value);
                }
            });
        }

        // 게시글 작성 버튼
        const writeBtn = document.querySelector('.write-btn');
        if (writeBtn) {
            writeBtn.addEventListener('click', () => this.showWriteForm());
        }

        // 무한 스크롤 설정
        this.setupInfiniteScroll();
    }

    async updateAuthUI() {
        const userInfo = document.querySelector('.user-info');
        const authBtns = document.querySelector('.auth-buttons');

        if (this.currentUser) {
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

            // 글쓰기 버튼 표시
            const writeBtns = document.querySelectorAll('.write-btn');
            writeBtns.forEach(btn => {
                btn.style.display = 'block';
                btn.disabled = false;
            });
        } else {
            if (authBtns) {
                authBtns.innerHTML = `
                    <a href="login.html" class="btn btn-primary">로그인</a>
                    <a href="signup.html" class="btn btn-secondary">회원가입</a>
                `;
            }

            // 글쓰기 버튼 숨기기
            const writeBtns = document.querySelectorAll('.write-btn');
            writeBtns.forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }

    async loadHumorPosts(reset = true) {
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

            // 유머 게시글 조회 (카테고리 = 'humor')
            const result = await postService.getPosts({
                ...options,
                category: 'humor'
            });
            
            if (reset) {
                this.humorPosts = result.posts;
                this.currentPage = 1;
            } else {
                this.humorPosts = [...this.humorPosts, ...result.posts];
                this.currentPage++;
            }

            this.renderHumorPosts();
            this.updateLoadMoreButton(result.total, result.totalPages);

        } catch (error) {
            console.error('유머 게시글 로딩 오류:', error);
            this.showError('유머 게시글을 불러올 수 없습니다.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderHumorPosts() {
        const container = document.querySelector('.humor-posts-grid, .humor-list');
        if (!container) return;

        if (this.humorPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-laugh"></i>
                    <h3>아직 유머 게시글이 없습니다</h3>
                    <p>첫 번째 유머 글을 올려보세요!</p>
                    ${this.currentUser ? '<button class="btn btn-primary" onclick="humorManager.showWriteForm()">글쓰기</button>' : ''}
                </div>
            `;
            return;
        }

        const postsHTML = this.humorPosts.map(post => `
            <div class="humor-item post-item" data-post-id="${post.id}" data-category="${post.subcategory || 'general'}">
                <div class="humor-thumbnail">
                    ${this.getPostThumbnail(post)}
                    <div class="thumbnail-type">
                        ${this.getContentTypeIcon(post.content_type)}
                    </div>
                </div>
                <div class="humor-content">
                    <h3 class="humor-item-title">
                        <a href="#" onclick="humorManager.viewPost('${post.id}')">${post.title}</a>
                    </h3>
                    <div class="humor-meta">
                        <span class="author">
                            <i class="fas fa-user-circle"></i>
                            ${post.users?.username || '익명'}
                        </span>
                        <span class="time">
                            <i class="fas fa-clock"></i>
                            ${this.formatDate(post.created_at)}
                        </span>
                    </div>
                    <div class="humor-stats">
                        <span class="views">
                            <i class="fas fa-eye"></i>
                            ${this.formatNumber(post.view_count || 0)}
                        </span>
                        <span class="likes">
                            <i class="fas fa-heart"></i>
                            ${this.formatNumber(post.like_count || 0)}
                        </span>
                        <span class="comments">
                            <i class="fas fa-comment"></i>
                            ${this.formatNumber(post.comment_count || 0)}
                        </span>
                    </div>
                    
                    ${this.currentUser ? `
                        <div class="humor-reactions">
                            <div class="reaction-buttons">
                                ${this.reactions.map(emoji => `
                                    <button class="reaction-btn" 
                                            data-reaction="${emoji}"
                                            onclick="humorManager.addReaction('${post.id}', '${emoji}')">
                                        ${emoji}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = postsHTML;
    }

    getPostThumbnail(post) {
        if (post.thumbnail_url) {
            return `<img src="${post.thumbnail_url}" alt="썸네일" />`;
        }
        
        // 기본 썸네일
        return '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\' font-family=\'Arial\' font-size=\'16\'%3E400x300%3C/text%3E%3C/svg%3E" alt="썸네일" />';
    }

    getContentTypeIcon(contentType) {
        const iconMap = {
            'image': '<i class="fas fa-image"></i>',
            'video': '<i class="fas fa-video"></i>',
            'text': '<i class="fas fa-align-left"></i>',
            'meme': '<i class="fas fa-laugh"></i>',
            'gif': '<i class="fas fa-film"></i>'
        };
        return iconMap[contentType] || '<i class="fas fa-file"></i>';
    }

    async filterByCategory(category) {
        this.currentCategory = category;
        
        // 활성 카테고리 업데이트
        document.querySelectorAll('.humor-category').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        await this.loadHumorPosts(true);
    }

    async searchHumor(query) {
        if (!query.trim()) {
            await this.loadHumorPosts(true);
            return;
        }

        try {
            this.showLoading();
            const result = await postService.searchPosts(query, {
                category: 'humor',
                category_id: this.currentCategory === 'all' ? null : this.currentCategory
            });
            
            this.humorPosts = result.posts;
            this.renderHumorPosts();
        } catch (error) {
            console.error('유머 검색 오류:', error);
            this.showError('검색 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    async viewPost(postId) {
        try {
            // 조회수 증가
            await postService.incrementViewCount(postId);
            
            // 유머 상세 페이지로 이동 (또는 모달 표시)
            window.location.href = `humor-detail.html?id=${postId}`;
        } catch (error) {
            console.error('유머 게시글 조회 오류:', error);
        }
    }

    async addReaction(postId, emoji) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            // 반응 추가/제거
            const { data, error } = await supabase
                .from('post_reactions')
                .upsert({
                    post_id: postId,
                    user_id: this.currentUser.id,
                    reaction: emoji
                }, {
                    onConflict: 'post_id,user_id'
                })
                .select();

            if (error) throw error;

            // UI 업데이트
            this.updateReactionUI(postId, emoji);
            this.showSuccess('반응을 등록했습니다!');

        } catch (error) {
            console.error('반응 등록 오류:', error);
            this.showError('반응 등록에 실패했습니다.');
        }
    }

    updateReactionUI(postId, emoji) {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        const reactionBtn = postElement?.querySelector(`[data-reaction="${emoji}"]`);
        
        if (reactionBtn) {
            reactionBtn.classList.toggle('active');
            // 반응 수 업데이트 로직 (필요시 추가)
        }
    }

    showWriteForm() {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        // 유머 글쓰기 페이지로 이동
        window.location.href = 'post-write.html?category=humor';
    }

    async loadPopularTags() {
        try {
            const { data: tags, error } = await supabase
                .from('post_tags')
                .select(`
                    tag_name,
                    posts!inner(id)
                `)
                .eq('posts.category', 'humor')
                .limit(10);

            if (error) throw error;

            this.renderPopularTags(tags);
        } catch (error) {
            console.error('인기 태그 로딩 오류:', error);
        }
    }

    renderPopularTags(tags) {
        const tagContainer = document.querySelector('.popular-tags, .tag-cloud');
        if (!tagContainer || !tags) return;

        const tagsHTML = tags.map(tag => `
            <span class="tag-item" onclick="humorManager.searchByTag('${tag.tag_name}')">
                #${tag.tag_name}
            </span>
        `).join('');

        tagContainer.innerHTML = tagsHTML;
    }

    async searchByTag(tagName) {
        try {
            this.showLoading();
            const result = await postService.getPostsByTag(tagName, {
                category: 'humor'
            });
            
            this.humorPosts = result.posts;
            this.renderHumorPosts();
            
            // 검색 입력창에 태그 표시
            const searchInput = document.querySelector('#search-input');
            if (searchInput) {
                searchInput.value = `#${tagName}`;
            }
        } catch (error) {
            console.error('태그 검색 오류:', error);
            this.showError('태그 검색 중 오류가 발생했습니다.');
        } finally {
            this.hideLoading();
        }
    }

    setupInfiniteScroll() {
        const container = document.querySelector('.humor-posts-grid, .humor-list');
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const lastEntry = entries[0];
                if (lastEntry.isIntersecting && !this.isLoading) {
                    this.loadHumorPosts(false); // 추가 로딩
                }
            },
            { threshold: 0.1 }
        );

        // 로딩 인디케이터를 관찰
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'scroll-loading-indicator';
        loadingIndicator.innerHTML = '<div class="loading-spinner"></div>';
        container.parentNode.appendChild(loadingIndicator);
        
        observer.observe(loadingIndicator);
    }

    updateLoadMoreButton(total, totalPages) {
        const loadingIndicator = document.querySelector('.scroll-loading-indicator');
        if (loadingIndicator) {
            if (this.currentPage >= totalPages) {
                loadingIndicator.style.display = 'none';
            } else {
                loadingIndicator.style.display = 'block';
            }
        }

        // 게시글 수 정보 업데이트
        const postCount = document.querySelector('.post-count-info');
        if (postCount) {
            postCount.textContent = `전체 ${total}개 게시글`;
        }
    }

    setupRealtimeSubscription() {
        // 실시간 유머 게시글 업데이트
        const humorChannel = supabase
            .channel('humor-posts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'posts',
                    filter: 'category=eq.humor'
                },
                (payload) => {
                    console.log('새 유머 게시글:', payload.new);
                    this.handleNewPost(payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'posts',
                    filter: 'category=eq.humor'
                },
                (payload) => {
                    console.log('유머 게시글 업데이트:', payload.new);
                    this.handlePostUpdate(payload.new);
                }
            )
            .subscribe();

        // 실시간 반응 업데이트
        const reactionChannel = supabase
            .channel('humor-reactions')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'post_reactions'
                },
                (payload) => {
                    console.log('반응 업데이트:', payload);
                    this.handleReactionUpdate(payload);
                }
            )
            .subscribe();
    }

    handleNewPost(newPost) {
        // 새 게시글을 목록 맨 위에 추가
        if (this.currentCategory === 'all' || this.currentCategory === newPost.subcategory) {
            this.humorPosts.unshift(newPost);
            this.renderHumorPosts();
            
            // 새 게시글 알림
            this.showNotification('새로운 유머 게시글이 등록되었습니다!');
        }
    }

    handlePostUpdate(updatedPost) {
        // 게시글 정보 업데이트
        const index = this.humorPosts.findIndex(post => post.id === updatedPost.id);
        if (index !== -1) {
            this.humorPosts[index] = { ...this.humorPosts[index], ...updatedPost };
            this.renderHumorPosts();
        }
    }

    handleReactionUpdate(payload) {
        // 반응 업데이트 처리
        const postId = payload.new?.post_id || payload.old?.post_id;
        if (postId) {
            // 해당 게시글의 반응 카운트 새로고침
            this.refreshPostStats(postId);
        }
    }

    async refreshPostStats(postId) {
        try {
            const { data: post, error } = await supabase
                .from('posts')
                .select('like_count, comment_count, view_count')
                .eq('id', postId)
                .single();

            if (error) throw error;

            // UI 업데이트
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            if (postElement) {
                const viewsSpan = postElement.querySelector('.views');
                const likesSpan = postElement.querySelector('.likes');
                const commentsSpan = postElement.querySelector('.comments');

                if (viewsSpan) viewsSpan.innerHTML = `<i class="fas fa-eye"></i> ${this.formatNumber(post.view_count || 0)}`;
                if (likesSpan) likesSpan.innerHTML = `<i class="fas fa-heart"></i> ${this.formatNumber(post.like_count || 0)}`;
                if (commentsSpan) commentsSpan.innerHTML = `<i class="fas fa-comment"></i> ${this.formatNumber(post.comment_count || 0)}`;
            }
        } catch (error) {
            console.error('게시글 통계 새로고침 오류:', error);
        }
    }

    // 유틸리티 함수들
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

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    showLoading() {
        const loadingEl = document.querySelector('.loading, .humor-loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingEl = document.querySelector('.loading, .humor-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showError(message) {
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

    showNotification(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'info');
        }
    }
}

// 전역 인스턴스 생성
window.humorManager = new HumorManager();

// 기존 humor.js와의 호환성을 위한 전역 함수들
window.viewPost = (postId) => window.humorManager.viewPost(postId);
window.addReaction = (postId, emoji) => window.humorManager.addReaction(postId, emoji);
window.showWriteForm = () => window.humorManager.showWriteForm();
window.searchByTag = (tagName) => window.humorManager.searchByTag(tagName);