/**
 * WAVE SPACE - Post Service
 * 게시판 관련 기능을 처리하는 서비스
 */

class PostService {
    constructor() {
        this.supabase = null;
    }

    /**
     * 초기화
     */
    async init() {
        try {
            this.supabase = window.WaveSupabase.getClient();
            console.log('✅ PostService 초기화 완료');
        } catch (error) {
            console.error('❌ PostService 초기화 실패:', error);
            
            // 폴백 모드로 설정
            this.supabase = null;
            console.log('🔄 PostService 폴백 모드 활성화 - 목 데이터 사용');
        }
    }

    /**
     * 게시글 목록 조회
     */
    async getPosts(options = {}) {
        try {
            // 옵션 파싱
            const {
                page = 1,
                limit = 20,
                category_id = null,
                sort_by = 'created_at',
                sort_order = 'desc',
                searchQuery = ''
            } = options;

            // Supabase 연결 상태 확인 후 실제 데이터베이스 조회
            if (!this.supabase) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
            }

            console.log('📡 Supabase 연결됨 - 실제 데이터베이스에서 posts 조회');
            
            // 실제 데이터베이스 조회
            let query = this.supabase
                .from('posts')
                .select(`
                    id,
                    title,
                    content,
                    author_id,
                    category_id,
                    view_count,
                    like_count,
                    comment_count,
                    is_pinned,
                    created_at,
                    updated_at,
                    users!author_id(username, email)
                `)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            // 페이지네이션 적용
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit - 1;
            query = query.range(startIndex, endIndex);

            // 카테고리 필터
            if (category_id) {
                query = query.eq('category_id', category_id);
            }

            // 검색 필터
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query;
            
            if (error) {
                console.error('Supabase 쿼리 오류:', error);
                throw error;
            }

            console.log(`✅ 실제 DB에서 ${data.length}개 게시글 로드 완료`);
            
            return {
                posts: data || [],
                total: data ? data.length : 0,
                totalPages: Math.ceil((data ? data.length : 0) / limit),
                currentPage: page
            };
        } catch (error) {
            console.error('게시글 목록 조회 실패:', error);
            throw error;
        }
    }


    /**
     * 게시글 상세 조회
     */
    async getPost(postId) {
        try {
            // 조회수 증가
            await this.incrementViewCount(postId);

            const { data, error } = await this.supabase
                .from('posts')
                .select(`
                    *,
                    users:author_id(username, profile_image_url, role),
                    post_categories:category_id(name, slug),
                    user_badges!inner(
                        badges(name, badge_type, color)
                    )
                `)
                .eq('id', postId)
                .eq('is_hidden', false)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('게시글 조회 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 게시글 작성
     */
    async createPost(postData) {
        try {
            if (!authService.isLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = authService.getCurrentUser();
            
            const { data, error } = await this.supabase
                .from('posts')
                .insert([{
                    title: postData.title,
                    content: postData.content,
                    category_id: postData.categoryId,
                    author_id: currentUser.id,
                    tags: postData.tags || []
                }])
                .select()
                .single();

            if (error) throw error;

            // 포인트 지급 (글쓰기 보상)
            await authService.addPointHistory(
                currentUser.id,
                50,
                'earn',
                '게시글 작성',
                data.id
            );

            return { success: true, data };
        } catch (error) {
            console.error('게시글 작성 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 게시글 수정
     */
    async updatePost(postId, postData) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('로그인이 필요합니다.');
            }

            const { data, error } = await this.supabase
                .from('posts')
                .update({
                    title: postData.title,
                    content: postData.content,
                    tags: postData.tags || [],
                    updated_at: new Date().toISOString()
                })
                .eq('id', postId)
                .eq('author_id', currentUser.id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('게시글 수정 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 게시글 삭제
     */
    async deletePost(postId) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('로그인이 필요합니다.');
            }

            const { error } = await this.supabase
                .from('posts')
                .delete()
                .eq('id', postId)
                .eq('author_id', currentUser.id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 댓글 목록 조회
     */
    async getComments(postId) {
        try {
            const { data, error } = await this.supabase
                .from('comments')
                .select(`
                    *,
                    users:author_id(username, profile_image_url, role),
                    user_badges!inner(
                        badges(name, badge_type, color)
                    )
                `)
                .eq('post_id', postId)
                .eq('is_hidden', false)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('댓글 조회 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 댓글 작성
     */
    async createComment(postId, content, parentId = null) {
        try {
            if (!authService.isLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = authService.getCurrentUser();
            
            const { data, error } = await this.supabase
                .from('comments')
                .insert([{
                    post_id: postId,
                    content,
                    author_id: currentUser.id,
                    parent_id: parentId
                }])
                .select(`
                    *,
                    users:author_id(username, profile_image_url)
                `)
                .single();

            if (error) throw error;

            // 게시글 댓글 수 증가
            await this.incrementCommentCount(postId);

            // 포인트 지급 (댓글 작성 보상)
            await authService.addPointHistory(
                currentUser.id,
                20,
                'earn',
                '댓글 작성',
                data.id
            );

            return { success: true, data };
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 좋아요/추천 토글
     */
    async toggleLike(targetType, targetId) {
        try {
            if (!authService.isLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = authService.getCurrentUser();
            
            // 기존 좋아요 확인
            const { data: existingLike } = await this.supabase
                .from('likes')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('target_type', targetType)
                .eq('target_id', targetId)
                .single();

            if (existingLike) {
                // 좋아요 취소
                await this.supabase
                    .from('likes')
                    .delete()
                    .eq('id', existingLike.id);
                
                await this.decrementLikeCount(targetType, targetId);
                return { success: true, liked: false };
            } else {
                // 좋아요 추가
                await this.supabase
                    .from('likes')
                    .insert([{
                        user_id: currentUser.id,
                        target_type: targetType,
                        target_id: targetId
                    }]);
                
                await this.incrementLikeCount(targetType, targetId);
                
                // 포인트 지급 (추천받기)
                if (targetType === 'post') {
                    // 게시글 작성자에게 포인트 지급
                    const post = await this.getPost(targetId);
                    if (post.success) {
                        await authService.addPointHistory(
                            post.data.author_id,
                            10,
                            'earn',
                            '게시글 추천받기',
                            targetId
                        );
                    }
                }
                
                return { success: true, liked: true };
            }
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 조회수 증가
     */
    async incrementViewCount(postId) {
        try {
            await this.supabase.rpc('increment_view_count', {
                post_uuid: postId
            });
        } catch (error) {
            console.error('조회수 증가 실패:', error);
        }
    }

    /**
     * 댓글 수 증가
     */
    async incrementCommentCount(postId) {
        try {
            await this.supabase.rpc('increment_comment_count', {
                post_uuid: postId
            });
        } catch (error) {
            console.error('댓글 수 증가 실패:', error);
        }
    }

    /**
     * 좋아요 수 증가/감소
     */
    async incrementLikeCount(targetType, targetId) {
        try {
            const table = targetType === 'post' ? 'posts' : 'comments';
            await this.supabase.rpc(`increment_${targetType}_like_count`, {
                [`${targetType}_uuid`]: targetId
            });
        } catch (error) {
            console.error('좋아요 수 증가 실패:', error);
        }
    }

    async decrementLikeCount(targetType, targetId) {
        try {
            const table = targetType === 'post' ? 'posts' : 'comments';
            await this.supabase.rpc(`decrement_${targetType}_like_count`, {
                [`${targetType}_uuid`]: targetId
            });
        } catch (error) {
            console.error('좋아요 수 감소 실패:', error);
        }
    }

    /**
     * 신고하기
     */
    async reportContent(targetType, targetId, reason, description = '') {
        try {
            if (!authService.isLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = authService.getCurrentUser();
            
            const { data, error } = await this.supabase
                .from('reports')
                .insert([{
                    reporter_id: currentUser.id,
                    target_type: targetType,
                    target_id: targetId,
                    reason,
                    description
                }]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('신고 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 내가 좋아요한 게시글/댓글인지 확인
     */
    async checkIfLiked(targetType, targetId) {
        try {
            if (!authService.isLoggedIn()) return false;

            const currentUser = authService.getCurrentUser();
            const { data } = await this.supabase
                .from('likes')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('target_type', targetType)
                .eq('target_id', targetId)
                .single();

            return !!data;
        } catch (error) {
            return false;
        }
    }

    /**
     * 인기 게시글 조회 (추천수 기준)
     */
    async getPopularPosts(categorySlug = null, days = 7) {
        try {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - days);

            let query = this.supabase
                .from('posts')
                .select(`
                    *,
                    users:author_id(username),
                    post_categories:category_id(name, slug)
                `)
                .eq('is_hidden', false)
                .gte('created_at', dateLimit.toISOString())
                .order('like_count', { ascending: false })
                .order('view_count', { ascending: false })
                .limit(10);

            if (categorySlug) {
                const { data: category } = await this.supabase
                    .from('post_categories')
                    .select('id')
                    .eq('slug', categorySlug)
                    .single();
                
                if (category) {
                    query = query.eq('category_id', category.id);
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('인기 게시글 조회 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 카테고리 목록 조회
     */
    async getCategories() {
        try {
            // 실제 데이터베이스 조회
            const { data, error } = await this.supabase
                .from('post_categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('카테고리 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 게시글 HTML 렌더링
     */
    renderPostCard(post) {
        const createdDate = new Date(post.created_at).toLocaleDateString('ko-KR');
        const author = post.users || {};
        const category = post.post_categories || {};
        const badges = post.user_badges || [];

        return `
            <article class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-meta">
                        <span class="post-category">${category.name || '일반'}</span>
                        ${post.is_pinned ? '<span class="post-pinned">📌</span>' : ''}
                    </div>
                    <div class="post-author">
                        <img src="${author.profile_image_url || '/images/default-avatar.png'}" 
                             alt="${author.username}" class="author-avatar">
                        <div class="author-info">
                            <span class="author-name">${author.username}</span>
                            <div class="author-badges">
                                ${this.renderBadges(badges)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${this.truncateContent(post.content, 150)}</p>
                </div>
                
                <div class="post-footer">
                    <div class="post-stats">
                        <span><i class="fas fa-eye"></i> ${post.view_count}</span>
                        <span><i class="fas fa-heart"></i> ${post.like_count}</span>
                        <span><i class="fas fa-comment"></i> ${post.comment_count}</span>
                    </div>
                    <span class="post-date">${createdDate}</span>
                </div>
            </article>
        `;
    }

    /**
     * 뱃지 렌더링
     */
    renderBadges(badges) {
        return badges.slice(0, 2).map(badgeData => {
            const badge = badgeData.badges;
            const style = badge.badge_type === 'premium' 
                ? `background: ${badge.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
                : `color: ${badge.color};`;
            
            return `<span class="badge ${badge.badge_type}" style="${style}">ㅣ${badge.name}ㅣ</span>`;
        }).join('');
    }

    /**
     * 콘텐츠 요약
     */
    truncateContent(content, maxLength) {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }

    /**
     * 게시글 검색
     */
    async searchPosts(query, categorySlug = null, page = 1, limit = 20) {
        try {
            let searchQuery = this.supabase
                .from('posts')
                .select(`
                    *,
                    users:author_id(username, profile_image_url),
                    post_categories:category_id(name, slug)
                `)
                .eq('is_hidden', false)
                .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);

            if (categorySlug) {
                const { data: category } = await this.supabase
                    .from('post_categories')
                    .select('id')
                    .eq('slug', categorySlug)
                    .single();
                
                if (category) {
                    searchQuery = searchQuery.eq('category_id', category.id);
                }
            }

            const { data, error } = await searchQuery;
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('게시글 검색 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 사용자별 게시글 조회
     */
    async getUserPosts(userId, page = 1, limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('posts')
                .select(`
                    *,
                    post_categories:category_id(name, slug)
                `)
                .eq('author_id', userId)
                .eq('is_hidden', false)
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('사용자 게시글 조회 실패:', error);
            return { success: false, error: error.message };
        }
    }
}

// 전역 게시판 서비스 인스턴스 생성
const postService = new PostService();

// 페이지 로드 시 초기화
window.addEventListener('load', async () => {
    // Supabase가 초기화될 때까지 대기
    let attempts = 0;
    const maxAttempts = 50; // 5초 대기
    
    while (attempts < maxAttempts) {
        if (window.WaveSupabase && window.WaveSupabase.getClient) {
            try {
                window.WaveSupabase.getClient();
                await postService.init();
                break;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }
});

// 전역 접근 가능하도록 설정
window.postService = postService;