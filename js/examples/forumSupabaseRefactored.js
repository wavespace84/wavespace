/**
 * WAVE SPACE - Forum Supabase 리팩토링 예시
 * BaseSupabaseManager를 상속받은 ForumManager 구현 예시
 */

// 기존 유틸리티들 import
import { BaseSupabaseManager } from '../utils/baseManager.js';

/**
 * 포럼 매니저 - BaseSupabaseManager 상속 버전
 */
class ForumManager extends BaseSupabaseManager {
    constructor() {
        // 부모 생성자 호출 - 테이블명과 옵션 전달
        super('forum_posts', {
            itemsPerPage: 20,
            realtime: true,
            channelName: 'forum_channel',
            realtimeEvents: ['INSERT', 'UPDATE', 'DELETE']
        });
        
        // 포럼 특화 속성들
        this.categories = [
            { id: 'all', name: '전체' },
            { id: 'general', name: '자유게시판' },
            { id: 'question', name: '질문' },
            { id: 'info', name: '정보공유' },
            { id: 'job', name: '구인구직' }
        ];
        
        this.currentUser = null;
        this.bookmarkedPosts = new Set();
        this.myPosts = [];
    }

    /**
     * 초기화 - 부모의 init() 호출 후 추가 설정
     */
    async init() {
        const success = await super.init();
        
        if (success) {
            // 현재 사용자 정보 로드
            await this.loadCurrentUser();
            
            // 북마크 정보 로드
            await this.loadBookmarks();
            
            // UI 초기화
            this.initializeUI();
        }
        
        return success;
    }

    /**
     * 필터 적용 오버라이드 - 포럼 특화 필터링
     */
    applyFilters(query, filters) {
        // 부모 클래스의 기본 필터 적용
        query = super.applyFilters(query, filters);
        
        // 포럼 특화 필터 추가
        
        // 내 글만 보기
        if (filters.myPostsOnly && this.currentUser) {
            query = query.eq('user_id', this.currentUser.id);
        }
        
        // 북마크한 글만 보기
        if (filters.bookmarkedOnly && this.bookmarkedPosts.size > 0) {
            query = query.in('id', Array.from(this.bookmarkedPosts));
        }
        
        // 답변 상태 필터
        if (filters.answerStatus) {
            switch (filters.answerStatus) {
            case 'answered':
                query = query.gt('answer_count', 0);
                break;
            case 'unanswered':
                query = query.eq('answer_count', 0);
                break;
            case 'best_answered':
                query = query.not('best_answer_id', 'is', null);
                break;
            }
        }
        
        // 인기글 필터 (좋아요 수 기준)
        if (filters.popular) {
            query = query.gte('likes_count', filters.popularThreshold || 10);
        }
        
        return query;
    }

    /**
     * 데이터 변환 오버라이드 - 포럼 포스트 형태로 변환
     */
    transformData(supabaseData) {
        return supabaseData.map(post => {
            // 부모 클래스의 기본 변환 후 추가 변환
            const transformed = {
                ...post,
                
                // 날짜 포맷팅 (WaveFormatters 사용)
                createdAt: post.created_at,
                updatedAt: post.updated_at,
                formattedDate: window.WaveFormatters?.date.relative(post.created_at) || post.created_at,
                formattedTime: window.WaveFormatters?.date.time(post.created_at),
                
                // 숫자 포맷팅
                viewCount: post.view_count || 0,
                likesCount: post.likes_count || 0,
                answerCount: post.answer_count || 0,
                formattedViews: window.WaveFormatters?.number.compact(post.view_count || 0),
                formattedLikes: window.WaveFormatters?.number.compact(post.likes_count || 0),
                
                // 상태 정보
                isNew: this.isNewPost(post.created_at),
                isHot: (post.likes_count || 0) > 10,
                isAnswered: (post.answer_count || 0) > 0,
                hasBestAnswer: !!post.best_answer_id,
                
                // 사용자 관련
                isMyPost: this.currentUser && post.user_id === this.currentUser.id,
                isBookmarked: this.bookmarkedPosts.has(post.id),
                
                // 카테고리 정보
                categoryName: this.getCategoryName(post.category),
                
                // 내용 처리
                excerpt: this.createExcerpt(post.content),
                hasImages: this.hasImages(post.content),
                hasTags: this.extractTags(post.content).length > 0,
                tags: this.extractTags(post.content)
            };
            
            return transformed;
        });
    }

    /**
     * 검색어 매칭 오버라이드 - 포럼 특화 검색
     */
    matchesSearch(post, searchTerm) {
        // 기본 제목/내용 검색
        const basicMatch = super.matchesSearch(post, searchTerm);
        
        // 추가 검색 필드
        const tagMatch = post.tags && post.tags.some(tag => 
            tag.toLowerCase().includes(searchTerm)
        );
        
        const authorMatch = post.author_name && 
            post.author_name.toLowerCase().includes(searchTerm);
            
        return basicMatch || tagMatch || authorMatch;
    }

    /**
     * 실시간 업데이트 처리 오버라이드
     */
    handleRealtimeUpdate(payload) {
        // 부모 클래스의 기본 처리
        super.handleRealtimeUpdate(payload);
        
        // 포럼 특화 추가 처리
        const { eventType, new: newRecord } = payload;
        
        if (eventType === 'INSERT' && newRecord) {
            // 새 글 알림 표시
            this.showNewPostNotification(newRecord);
            
            // 사운드 알림 (옵션)
            this.playNotificationSound();
        }
        
        // UI 업데이트
        this.updateUI();
    }

    /**
     * 포스트 작성
     */
    async createPost(postData) {
        try {
            this.setLoading(true);
            
            if (!this.currentUser) {
                throw new Error('로그인이 필요합니다.');
            }
            
            const newPost = {
                title: postData.title,
                content: postData.content,
                category: postData.category,
                user_id: this.currentUser.id,
                user_name: this.currentUser.name,
                tags: postData.tags || [],
                is_active: true
            };
            
            const { data, error } = await this.client
                .from(this.tableName)
                .insert([newPost])
                .select()
                .single();
                
            if (error) throw error;
            
            // 성공 메시지
            if (window.ModalManager) {
                window.ModalManager.alert('게시글이 작성되었습니다.', {
                    title: '작성 완료'
                });
            }
            
            // 데이터 새로고침
            await this.refresh();
            
            return data;
            
        } catch (error) {
            console.error('게시글 작성 실패:', error);
            this.setError(error);
            
            if (window.ModalManager) {
                window.ModalManager.alert('게시글 작성에 실패했습니다.', {
                    title: '오류'
                });
            }
            
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 포스트 수정
     */
    async updatePost(postId, updateData) {
        try {
            this.setLoading(true);
            
            const { data, error } = await this.client
                .from(this.tableName)
                .update({
                    title: updateData.title,
                    content: updateData.content,
                    category: updateData.category,
                    tags: updateData.tags || [],
                    updated_at: new Date().toISOString()
                })
                .eq('id', postId)
                .eq('user_id', this.currentUser.id) // 본인 글만 수정 가능
                .select()
                .single();
                
            if (error) throw error;
            
            window.ModalManager?.alert('게시글이 수정되었습니다.');
            await this.refresh();
            
            return data;
            
        } catch (error) {
            console.error('게시글 수정 실패:', error);
            this.setError(error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 포스트 삭제
     */
    async deletePost(postId) {
        try {
            const confirmed = await window.ModalManager?.confirm(
                '정말 이 게시글을 삭제하시겠습니까?',
                { title: '게시글 삭제' }
            );
            
            if (!confirmed) return false;
            
            this.setLoading(true);
            
            const { error } = await this.client
                .from(this.tableName)
                .delete()
                .eq('id', postId)
                .eq('user_id', this.currentUser.id);
                
            if (error) throw error;
            
            window.ModalManager?.alert('게시글이 삭제되었습니다.');
            await this.refresh();
            
            return true;
            
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            this.setError(error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 좋아요 토글
     */
    async toggleLike(postId) {
        try {
            if (!this.currentUser) {
                throw new Error('로그인이 필요합니다.');
            }
            
            // 좋아요 상태 확인
            const { data: existingLike } = await this.client
                .from('forum_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', this.currentUser.id)
                .single();
            
            if (existingLike) {
                // 좋아요 취소
                await this.client
                    .from('forum_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', this.currentUser.id);
                    
                // 카운트 감소
                await this.client.rpc('decrement_likes', { post_id: postId });
                
            } else {
                // 좋아요 추가
                await this.client
                    .from('forum_likes')
                    .insert([{
                        post_id: postId,
                        user_id: this.currentUser.id
                    }]);
                    
                // 카운트 증가
                await this.client.rpc('increment_likes', { post_id: postId });
            }
            
            // 데이터 새로고침
            await this.refresh();
            
            return !existingLike;
            
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
            this.setError(error);
            throw error;
        }
    }

    /**
     * 북마크 토글
     */
    async toggleBookmark(postId) {
        try {
            if (!this.currentUser) {
                throw new Error('로그인이 필요합니다.');
            }
            
            const isBookmarked = this.bookmarkedPosts.has(postId);
            
            if (isBookmarked) {
                // 북마크 제거
                await this.client
                    .from('forum_bookmarks')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', this.currentUser.id);
                    
                this.bookmarkedPosts.delete(postId);
            } else {
                // 북마크 추가
                await this.client
                    .from('forum_bookmarks')
                    .insert([{
                        post_id: postId,
                        user_id: this.currentUser.id
                    }]);
                    
                this.bookmarkedPosts.add(postId);
            }
            
            // UI 업데이트
            this.updateBookmarkUI(postId, !isBookmarked);
            
            return !isBookmarked;
            
        } catch (error) {
            console.error('북마크 처리 실패:', error);
            this.setError(error);
            throw error;
        }
    }

    // ========================================
    // 유틸리티 메서드들
    // ========================================
    
    async loadCurrentUser() {
        // 현재 사용자 정보 로드 로직
        if (window.WaveSupabase) {
            const user = window.WaveSupabase.getCurrentUser();
            this.currentUser = user;
        }
    }
    
    async loadBookmarks() {
        if (!this.currentUser) return;
        
        try {
            const { data } = await this.client
                .from('forum_bookmarks')
                .select('post_id')
                .eq('user_id', this.currentUser.id);
                
            this.bookmarkedPosts = new Set(data?.map(b => b.post_id) || []);
        } catch (error) {
            console.error('북마크 로드 실패:', error);
        }
    }
    
    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }
    
    isNewPost(createdAt) {
        const postDate = new Date(createdAt);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return postDate > oneDayAgo;
    }
    
    createExcerpt(content, maxLength = 150) {
        if (!content) return '';
        const textOnly = content.replace(/<[^>]*>/g, ''); // HTML 태그 제거
        return window.WaveFormatters?.text.truncate(textOnly, maxLength) || textOnly;
    }
    
    hasImages(content) {
        return /<img[^>]+src=/.test(content);
    }
    
    extractTags(content) {
        return window.WaveFormatters?.text.extractHashtags(content) || [];
    }
    
    showNewPostNotification(post) {
        // 새 게시글 알림 표시
        if (window.UIStateManager) {
            window.UIStateManager.showSuccess(`새 게시글: ${post.title}`);
        }
    }
    
    playNotificationSound() {
        // 알림음 재생 (선택사항)
        try {
            const audio = new Audio('/assets/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {}); // 사용자 상호작용 없이는 재생 안될 수 있음
        } catch (e) {}
    }
    
    initializeUI() {
        // UI 초기화 로직
        this.setupEventListeners();
        this.updateUI();
    }
    
    setupEventListeners() {
        // 포럼 특화 이벤트 리스너 설정
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // 좋아요 버튼
            if (target.matches('.like-btn')) {
                const postId = target.dataset.postId;
                this.toggleLike(postId);
            }
            
            // 북마크 버튼
            if (target.matches('.bookmark-btn')) {
                const postId = target.dataset.postId;
                this.toggleBookmark(postId);
            }
        });
    }
    
    updateUI() {
        // UI 업데이트 로직
        this.renderPosts();
        this.updatePagination();
        this.updateFilters();
    }
    
    updateBookmarkUI(postId, isBookmarked) {
        const bookmarkBtn = document.querySelector(`[data-post-id="${postId}"].bookmark-btn`);
        if (bookmarkBtn) {
            bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
            bookmarkBtn.title = isBookmarked ? '북마크 제거' : '북마크 추가';
        }
    }
    
    renderPosts() {
        // 포스트 목록 렌더링 로직
        const container = document.querySelector('#forum-posts-container');
        if (!container) return;
        
        const posts = this.getPagedData();
        container.innerHTML = posts.map(post => this.renderPost(post)).join('');
    }
    
    renderPost(post) {
        // 개별 포스트 렌더링
        return `
            <div class="forum-post-item" data-post-id="${post.id}">
                <div class="post-header">
                    <span class="post-category">${post.categoryName}</span>
                    <h3 class="post-title">
                        <a href="/forum/posts/${post.id}">${post.title}</a>
                        ${post.isNew ? '<span class="badge badge-new">NEW</span>' : ''}
                        ${post.isHot ? '<span class="badge badge-hot">HOT</span>' : ''}
                    </h3>
                </div>
                
                <div class="post-content">
                    <p class="post-excerpt">${post.excerpt}</p>
                    ${post.hasTags ? `<div class="post-tags">${post.tags.join(' ')}</div>` : ''}
                </div>
                
                <div class="post-meta">
                    <span class="post-author">${post.user_name}</span>
                    <span class="post-date">${post.formattedDate}</span>
                    <div class="post-stats">
                        <span class="stat-item">
                            <i class="fas fa-eye"></i> ${post.formattedViews}
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-heart"></i> ${post.formattedLikes}
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-comment"></i> ${post.answerCount}
                        </span>
                    </div>
                </div>
                
                <div class="post-actions">
                    <button class="btn btn-sm like-btn ${post.isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="btn btn-sm bookmark-btn ${post.isBookmarked ? 'bookmarked' : ''}" data-post-id="${post.id}">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    updatePagination() {
        // 페이지네이션 UI 업데이트
        // 기존 페이지네이션 로직 재사용
    }
    
    updateFilters() {
        // 필터 UI 업데이트
        // 기존 필터 로직 재사용
    }
}

// 전역 인스턴스 생성
window.ForumManager = new ForumManager();

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', async () => {
    const success = await window.ForumManager.init();
    if (success) {
        console.log('✅ Forum Manager 자동 초기화 완료');
    }
});

export { ForumManager };