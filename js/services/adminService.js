import { supabase } from '../config/supabase.js';

class AdminService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5분
    }

    // 캐시 관리
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    clearCache() {
        this.cache.clear();
    }

    // 사용자 관리
    async getUsers(options = {}) {
        try {
            const { filter, search, page = 1, limit = 50 } = options;
            const cacheKey = `users-${JSON.stringify(options)}`;
            
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            let query = supabase
                .from('users')
                .select(`
                    *,
                    user_badges!user_badges_user_id_fkey(
                        badges!user_badges_badge_id_fkey(name, type)
                    )
                `)
                .order('created_at', { ascending: false });

            // 필터 적용
            if (filter && filter !== 'all') {
                switch (filter) {
                    case 'plus':
                        query = query.eq('is_plus_member', true);
                        break;
                    case 'banned':
                        query = query.eq('status', 'banned');
                        break;
                    case 'active':
                        query = query.eq('status', 'active');
                        break;
                    case 'inactive':
                        query = query.eq('status', 'inactive');
                        break;
                }
            }

            // 검색 적용
            if (search) {
                query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,real_name.ilike.%${search}%`);
            }

            // 페이지네이션
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            const result = {
                users: data,
                total: count,
                page: page,
                totalPages: Math.ceil(count / limit)
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('사용자 조회 오류:', error);
            throw error;
        }
    }

    async getUserStats(userId) {
        try {
            const cacheKey = `user-stats-${userId}`;
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            const { data, error } = await supabase.rpc('get_user_stats', {
                user_uuid: userId
            });

            if (error) throw error;

            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('사용자 통계 조회 오류:', error);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    ...userData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            this.clearCache();
            await this.logActivity('user_update', `사용자 ${userData.username} 정보 수정`, userId);
            
            return data;
        } catch (error) {
            console.error('사용자 업데이트 오류:', error);
            throw error;
        }
    }

    async banUser(userId, reason = '') {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    status: 'banned',
                    ban_reason: reason,
                    banned_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            this.clearCache();
            await this.logActivity('user_ban', `사용자 ${data.username} 정지`, userId);
            
            return data;
        } catch (error) {
            console.error('사용자 정지 오류:', error);
            throw error;
        }
    }

    async unbanUser(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    status: 'active',
                    ban_reason: null,
                    banned_at: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            this.clearCache();
            await this.logActivity('user_unban', `사용자 ${data.username} 정지 해제`, userId);
            
            return data;
        } catch (error) {
            console.error('사용자 정지 해제 오류:', error);
            throw error;
        }
    }

    // 게시글 관리
    async getPosts(options = {}) {
        try {
            const { filter, category, search, page = 1, limit = 50 } = options;
            const cacheKey = `posts-${JSON.stringify(options)}`;
            
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            let query = supabase
                .from('posts')
                .select(`
                    *,
                    users!posts_author_id_fkey(username, avatar_url),
                    categories!posts_category_id_fkey(name, color)
                `)
                .order('created_at', { ascending: false });

            // 필터 적용
            if (filter && filter !== 'all') {
                switch (filter) {
                    case 'hidden':
                        query = query.eq('is_hidden', true);
                        break;
                    case 'published':
                        query = query.eq('is_hidden', false);
                        break;
                    case 'reported':
                        query = query.gt('report_count', 0);
                        break;
                }
            }

            if (category && category !== 'all') {
                query = query.eq('category_id', category);
            }

            // 검색 적용
            if (search) {
                query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
            }

            // 페이지네이션
            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            const result = {
                posts: data,
                total: count,
                page: page,
                totalPages: Math.ceil(count / limit)
            };

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('게시글 조회 오류:', error);
            throw error;
        }
    }

    async hidePost(postId) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .update({
                    is_hidden: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', postId)
                .select()
                .single();

            if (error) throw error;

            this.clearCache();
            await this.logActivity('post_hide', `게시글 숨김: ${data.title}`, postId);
            
            return data;
        } catch (error) {
            console.error('게시글 숨김 오류:', error);
            throw error;
        }
    }

    async showPost(postId) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .update({
                    is_hidden: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', postId)
                .select()
                .single();

            if (error) throw error;

            this.clearCache();
            await this.logActivity('post_show', `게시글 공개: ${data.title}`, postId);
            
            return data;
        } catch (error) {
            console.error('게시글 공개 오류:', error);
            throw error;
        }
    }

    async deletePost(postId) {
        try {
            // 먼저 게시글 정보 가져오기
            const { data: post } = await supabase
                .from('posts')
                .select('title, author_id')
                .eq('id', postId)
                .single();

            // 관련 댓글, 좋아요 먼저 삭제
            await Promise.all([
                supabase.from('comments').delete().eq('post_id', postId),
                supabase.from('post_likes').delete().eq('post_id', postId),
                supabase.from('notifications').delete().eq('reference_id', postId)
            ]);

            // 게시글 삭제
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            this.clearCache();
            await this.logActivity('post_delete', `게시글 삭제: ${post?.title}`, postId);
            
            return true;
        } catch (error) {
            console.error('게시글 삭제 오류:', error);
            throw error;
        }
    }

    // 통계 및 분석
    async getSystemStats() {
        try {
            const cacheKey = 'system-stats';
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            const [
                usersCount,
                postsCount,
                commentsCount,
                filesCount,
                activeUsers,
                plusMembers,
                totalPoints,
                monthlyStats
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('posts').select('*', { count: 'exact', head: true }),
                supabase.from('comments').select('*', { count: 'exact', head: true }),
                supabase.from('files').select('*', { count: 'exact', head: true }),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_plus_member', true),
                supabase.from('users').select('points'),
                this.getMonthlyStats()
            ]);

            const totalUserPoints = totalPoints.data?.reduce((sum, user) => sum + (user.points || 0), 0) || 0;

            const stats = {
                users: {
                    total: usersCount.count || 0,
                    active: activeUsers.count || 0,
                    plus: plusMembers.count || 0
                },
                content: {
                    posts: postsCount.count || 0,
                    comments: commentsCount.count || 0,
                    files: filesCount.count || 0
                },
                points: {
                    total: totalUserPoints,
                    average: totalUserPoints / (usersCount.count || 1)
                },
                monthly: monthlyStats
            };

            this.setCache(cacheKey, stats);
            return stats;
        } catch (error) {
            console.error('시스템 통계 조회 오류:', error);
            throw error;
        }
    }

    async getMonthlyStats() {
        try {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const [newUsers, newPosts, newComments] = await Promise.all([
                supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startOfMonth.toISOString()),
                supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startOfMonth.toISOString()),
                supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', startOfMonth.toISOString())
            ]);

            return {
                newUsers: newUsers.count || 0,
                newPosts: newPosts.count || 0,
                newComments: newComments.count || 0
            };
        } catch (error) {
            console.error('월간 통계 조회 오류:', error);
            return { newUsers: 0, newPosts: 0, newComments: 0 };
        }
    }

    async getTopUsers(type = 'points', limit = 10) {
        try {
            const cacheKey = `top-users-${type}-${limit}`;
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            let query = supabase
                .from('users')
                .select('id, username, avatar_url, points, rank')
                .eq('status', 'active');

            switch (type) {
                case 'points':
                    query = query.order('points', { ascending: false });
                    break;
                case 'posts':
                    query = query.select(`
                        id, username, avatar_url,
                        posts!posts_author_id_fkey(id)
                    `).order('posts.count', { ascending: false });
                    break;
                case 'likes':
                    // 좋아요를 많이 받은 사용자
                    const { data } = await supabase
                        .from('posts')
                        .select(`
                            author_id,
                            like_count,
                            users!posts_author_id_fkey(username, avatar_url)
                        `);
                    
                    const userLikes = {};
                    data?.forEach(post => {
                        const authorId = post.author_id;
                        if (!userLikes[authorId]) {
                            userLikes[authorId] = {
                                ...post.users,
                                totalLikes: 0
                            };
                        }
                        userLikes[authorId].totalLikes += post.like_count || 0;
                    });

                    return Object.values(userLikes)
                        .sort((a, b) => b.totalLikes - a.totalLikes)
                        .slice(0, limit);
            }

            query = query.limit(limit);
            const { data, error } = await query;
            if (error) throw error;

            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('상위 사용자 조회 오류:', error);
            throw error;
        }
    }

    // 뱃지 관리
    async getBadges() {
        try {
            const cacheKey = 'badges';
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            const { data, error } = await supabase
                .from('badges')
                .select(`
                    *,
                    user_badges!user_badges_badge_id_fkey(
                        id,
                        users!user_badges_user_id_fkey(username)
                    )
                `)
                .order('name');

            if (error) throw error;

            // 각 뱃지의 획득자 수 계산
            const badges = data.map(badge => ({
                ...badge,
                holder_count: badge.user_badges?.length || 0,
                holders: badge.user_badges?.map(ub => ub.users?.username).slice(0, 5) || []
            }));

            this.setCache(cacheKey, badges);
            return badges;
        } catch (error) {
            console.error('뱃지 조회 오류:', error);
            throw error;
        }
    }

    async awardBadge(userId, badgeId) {
        try {
            // 이미 보유하고 있는지 확인
            const { data: existing } = await supabase
                .from('user_badges')
                .select('id')
                .eq('user_id', userId)
                .eq('badge_id', badgeId)
                .single();

            if (existing) {
                throw new Error('이미 보유한 뱃지입니다.');
            }

            const { data, error } = await supabase
                .from('user_badges')
                .insert([{
                    user_id: userId,
                    badge_id: badgeId,
                    awarded_at: new Date().toISOString()
                }])
                .select(`
                    *,
                    badges!user_badges_badge_id_fkey(name),
                    users!user_badges_user_id_fkey(username)
                `)
                .single();

            if (error) throw error;

            this.clearCache();
            await this.logActivity('badge_award', 
                `${data.users.username}님에게 ${data.badges.name} 뱃지 지급`, userId);
            
            return data;
        } catch (error) {
            console.error('뱃지 지급 오류:', error);
            throw error;
        }
    }

    async revokeBadge(userId, badgeId) {
        try {
            const { error } = await supabase
                .from('user_badges')
                .delete()
                .eq('user_id', userId)
                .eq('badge_id', badgeId);

            if (error) throw error;

            this.clearCache();
            await this.logActivity('badge_revoke', `뱃지 회수`, userId);
            
            return true;
        } catch (error) {
            console.error('뱃지 회수 오류:', error);
            throw error;
        }
    }

    // 포인트 관리
    async adjustUserPoints(userId, amount, reason = '') {
        try {
            const { data: user } = await supabase
                .from('users')
                .select('points, username')
                .eq('id', userId)
                .single();

            const newPoints = Math.max(0, (user.points || 0) + amount);

            const { data, error } = await supabase
                .from('users')
                .update({
                    points: newPoints,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            // 포인트 변동 내역 기록
            await supabase
                .from('point_transactions')
                .insert([{
                    user_id: userId,
                    amount: amount,
                    reason: reason || '관리자 조정',
                    transaction_type: amount > 0 ? 'admin_add' : 'admin_deduct',
                    created_at: new Date().toISOString()
                }]);

            this.clearCache();
            await this.logActivity('points_adjust', 
                `${user.username}님 포인트 ${amount > 0 ? '지급' : '차감'}: ${Math.abs(amount)}P`, userId);
            
            return data;
        } catch (error) {
            console.error('포인트 조정 오류:', error);
            throw error;
        }
    }

    // 시스템 설정
    async getSettings() {
        try {
            const cacheKey = 'settings';
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            const { data, error } = await supabase
                .from('system_settings')
                .select('*');

            if (error) throw error;

            const settings = {};
            data?.forEach(setting => {
                settings[setting.key] = setting.value;
            });

            this.setCache(cacheKey, settings);
            return settings;
        } catch (error) {
            console.error('설정 조회 오류:', error);
            throw error;
        }
    }

    async updateSetting(key, value) {
        try {
            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    key: key,
                    value: value,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            if (error) throw error;

            this.clearCache();
            await this.logActivity('setting_update', `설정 변경: ${key} = ${value}`);
            
            return true;
        } catch (error) {
            console.error('설정 업데이트 오류:', error);
            throw error;
        }
    }

    async updateSettings(settings) {
        try {
            const updates = Object.entries(settings).map(([key, value]) => ({
                key: key,
                value: value,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('system_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;

            this.clearCache();
            await this.logActivity('settings_bulk_update', `설정 일괄 업데이트: ${Object.keys(settings).length}개 항목`);
            
            return true;
        } catch (error) {
            console.error('설정 일괄 업데이트 오류:', error);
            throw error;
        }
    }

    // 로그 관리
    async logActivity(action, description, userId = null) {
        try {
            await supabase
                .from('admin_logs')
                .insert([{
                    action: action,
                    description: description,
                    user_id: userId,
                    admin_id: this.currentAdminId,
                    created_at: new Date().toISOString(),
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent
                }]);
        } catch (error) {
            console.error('로그 기록 오류:', error);
        }
    }

    async getLogs(options = {}) {
        try {
            const { level, category, page = 1, limit = 100 } = options;

            let query = supabase
                .from('admin_logs')
                .select(`
                    *,
                    users!admin_logs_admin_id_fkey(username)
                `)
                .order('created_at', { ascending: false });

            if (level && level !== 'all') {
                query = query.eq('level', level);
            }

            if (category && category !== 'all') {
                query = query.like('action', `${category}%`);
            }

            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;
            if (error) throw error;

            return data;
        } catch (error) {
            console.error('로그 조회 오류:', error);
            throw error;
        }
    }

    async clearLogs() {
        try {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            const { error } = await supabase
                .from('admin_logs')
                .delete()
                .lt('created_at', oneMonthAgo.toISOString());

            if (error) throw error;

            await this.logActivity('logs_clear', '1개월 이전 로그 삭제');
            return true;
        } catch (error) {
            console.error('로그 삭제 오류:', error);
            throw error;
        }
    }

    // 파일 관리
    async getFiles(options = {}) {
        try {
            const { search, page = 1, limit = 50 } = options;

            let query = supabase
                .from('files')
                .select(`
                    *,
                    users!files_uploader_id_fkey(username),
                    categories!files_category_id_fkey(name)
                `)
                .order('created_at', { ascending: false });

            if (search) {
                query = query.or(`original_name.ilike.%${search}%,description.ilike.%${search}%`);
            }

            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            return {
                files: data,
                total: count,
                page: page,
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('파일 조회 오류:', error);
            throw error;
        }
    }

    async deleteFile(fileId) {
        try {
            // 파일 정보 조회
            const { data: file } = await supabase
                .from('files')
                .select('file_path, original_name')
                .eq('id', fileId)
                .single();

            // Supabase Storage에서 파일 삭제
            if (file.file_path) {
                await supabase.storage
                    .from('files')
                    .remove([file.file_path]);
            }

            // 데이터베이스에서 파일 정보 삭제
            const { error } = await supabase
                .from('files')
                .delete()
                .eq('id', fileId);

            if (error) throw error;

            this.clearCache();
            await this.logActivity('file_delete', `파일 삭제: ${file.original_name}`, fileId);
            
            return true;
        } catch (error) {
            console.error('파일 삭제 오류:', error);
            throw error;
        }
    }

    // 공지사항 관리
    async getNotices(options = {}) {
        try {
            const { status, page = 1, limit = 20 } = options;

            let query = supabase
                .from('notices')
                .select('*')
                .order('created_at', { ascending: false });

            if (status && status !== 'all') {
                query = query.eq('status', status);
            }

            const offset = (page - 1) * limit;
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query;
            if (error) throw error;

            return {
                notices: data,
                total: count,
                page: page,
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('공지사항 조회 오류:', error);
            throw error;
        }
    }

    async createNotice(noticeData) {
        try {
            const { data, error } = await supabase
                .from('notices')
                .insert([{
                    ...noticeData,
                    author_id: this.currentAdminId,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            this.clearCache();
            await this.logActivity('notice_create', `공지사항 작성: ${noticeData.title}`);
            
            return data;
        } catch (error) {
            console.error('공지사항 작성 오류:', error);
            throw error;
        }
    }

    async updateNotice(noticeId, noticeData) {
        try {
            const { data, error } = await supabase
                .from('notices')
                .update({
                    ...noticeData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', noticeId)
                .select()
                .single();

            if (error) throw error;

            this.clearCache();
            await this.logActivity('notice_update', `공지사항 수정: ${noticeData.title}`, noticeId);
            
            return data;
        } catch (error) {
            console.error('공지사항 수정 오류:', error);
            throw error;
        }
    }

    async deleteNotice(noticeId) {
        try {
            const { data: notice } = await supabase
                .from('notices')
                .select('title')
                .eq('id', noticeId)
                .single();

            const { error } = await supabase
                .from('notices')
                .delete()
                .eq('id', noticeId);

            if (error) throw error;

            this.clearCache();
            await this.logActivity('notice_delete', `공지사항 삭제: ${notice?.title}`, noticeId);
            
            return true;
        } catch (error) {
            console.error('공지사항 삭제 오류:', error);
            throw error;
        }
    }

    // 분석 데이터
    async getAnalyticsData(period = 7) {
        try {
            const cacheKey = `analytics-${period}`;
            const cached = this.getCache(cacheKey);
            if (cached) return cached;

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - period);

            const [users, posts, comments, logins] = await Promise.all([
                this.getTimeSeriesData('users', 'created_at', startDate, endDate),
                this.getTimeSeriesData('posts', 'created_at', startDate, endDate),
                this.getTimeSeriesData('comments', 'created_at', startDate, endDate),
                this.getTimeSeriesData('user_sessions', 'created_at', startDate, endDate)
            ]);

            const analytics = {
                period: period,
                users: users,
                posts: posts,
                comments: comments,
                logins: logins,
                categories: await this.getCategoryStats(startDate, endDate),
                popular_posts: await this.getPopularPosts(startDate, endDate)
            };

            this.setCache(cacheKey, analytics);
            return analytics;
        } catch (error) {
            console.error('분석 데이터 조회 오류:', error);
            throw error;
        }
    }

    async getTimeSeriesData(table, dateColumn, startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select(dateColumn)
                .gte(dateColumn, startDate.toISOString())
                .lte(dateColumn, endDate.toISOString());

            if (error) throw error;

            // 날짜별 집계
            const dailyCounts = {};
            const currentDate = new Date(startDate);
            
            while (currentDate <= endDate) {
                const dateKey = currentDate.toISOString().split('T')[0];
                dailyCounts[dateKey] = 0;
                currentDate.setDate(currentDate.getDate() + 1);
            }

            data?.forEach(item => {
                const dateKey = item[dateColumn].split('T')[0];
                if (dailyCounts.hasOwnProperty(dateKey)) {
                    dailyCounts[dateKey]++;
                }
            });

            return {
                labels: Object.keys(dailyCounts),
                data: Object.values(dailyCounts)
            };
        } catch (error) {
            console.error('시계열 데이터 조회 오류:', error);
            return { labels: [], data: [] };
        }
    }

    async getCategoryStats(startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    category_id,
                    categories!posts_category_id_fkey(name, color)
                `)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (error) throw error;

            const categoryCounts = {};
            data?.forEach(post => {
                const categoryName = post.categories?.name || '미분류';
                categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
            });

            return {
                labels: Object.keys(categoryCounts),
                data: Object.values(categoryCounts)
            };
        } catch (error) {
            console.error('카테고리 통계 조회 오류:', error);
            return { labels: [], data: [] };
        }
    }

    async getPopularPosts(startDate, endDate, limit = 10) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    id, title, view_count, like_count,
                    users!posts_author_id_fkey(username)
                `)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('view_count', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('인기 게시글 조회 오류:', error);
            return [];
        }
    }

    // 유틸리티
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    setCurrentAdminId(adminId) {
        this.currentAdminId = adminId;
    }
}

export const adminService = new AdminService();