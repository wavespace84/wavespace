/**
 * WAVE SPACE - 사용자 활동 내역 서비스
 * 게시글, 댓글, 좋아요 등 사용자 활동 데이터 관리
 */

class ActivityService {
    constructor() {
        this.supabase = null;
        this.authService = null;
        this.cache = {
            activities: null,
            lastUpdated: null,
            expiry: 5 * 60 * 1000 // 5분
        };
    }

    /**
     * 서비스 초기화
     */
    async init() {
        // Supabase 클라이언트 대기
        let attempts = 0;
        while (!this.supabase && attempts < 50) {
            if (window.WaveSupabase?.getClient) {
                this.supabase = window.WaveSupabase.getClient();
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        // AuthService 대기
        attempts = 0;
        while (!this.authService && attempts < 50) {
            if (window.authService) {
                this.authService = window.authService;
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!this.supabase || !this.authService) {
            console.warn('ActivityService 초기화 실패');
            return false;
        }

        console.log('✅ ActivityService 초기화 완료');
        return true;
    }

    /**
     * 사용자 활동 요약 데이터 가져오기
     * @param {string} userId - 사용자 ID 
     * @returns {Promise<Object>} 활동 요약 데이터
     */
    async getUserActivitySummary(userId = null) {
        try {
            if (!await this.init()) {
                throw new Error('ActivityService 초기화 실패');
            }

            // 기본값으로 현재 로그인한 사용자 사용
            if (!userId) {
                const user = this.authService.getLocalUser();
                if (!user.id) {
                    throw new Error('사용자 정보 없음');
                }
                userId = user.id;
            }

            // 캐시 확인
            if (this.isValidCache()) {
                console.log('ActivityService: 캐시된 데이터 사용');
                return this.cache.activities;
            }

            console.log('ActivityService: 새로운 활동 데이터 로드 중...');

            // 병렬로 각종 활동 데이터 조회
            const [postsResult, commentsResult, likesResult, recentActivity] = await Promise.allSettled([
                this.getUserPosts(userId),
                this.getUserComments(userId),  
                this.getUserLikes(userId),
                this.getRecentActivity(userId, 7) // 최근 7일
            ]);

            // 결과 처리
            const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
            const comments = commentsResult.status === 'fulfilled' ? commentsResult.value : [];
            const likes = likesResult.status === 'fulfilled' ? likesResult.value : [];
            const recent = recentActivity.status === 'fulfilled' ? recentActivity.value : [];

            // 활동 요약 생성
            const summary = {
                counts: {
                    posts: posts.length,
                    comments: comments.length,
                    likes: likes.length,
                    totalActivity: posts.length + comments.length + likes.length
                },
                recent: {
                    posts: posts.slice(0, 3), // 최근 3개
                    comments: comments.slice(0, 3),
                    likes: likes.slice(0, 5)
                },
                chart: this.generateActivityChart(recent),
                trends: this.calculateTrends(recent)
            };

            // 캐시 저장
            this.cache.activities = summary;
            this.cache.lastUpdated = Date.now();

            console.log('✅ 활동 요약 데이터 로드 완료:', summary);
            return summary;

        } catch (error) {
            console.error('ActivityService: 활동 요약 로드 실패:', error);
            
            // 에러 시 빈 데이터 반환
            return {
                counts: { posts: 0, comments: 0, likes: 0, totalActivity: 0 },
                recent: { posts: [], comments: [], likes: [] },
                chart: Array(7).fill(0),
                trends: { posts: 0, comments: 0, likes: 0 }
            };
        }
    }

    /**
     * 사용자 게시글 조회
     */
    async getUserPosts(userId) {
        try {
            const { data, error } = await this.supabase
                .from('posts')
                .select(`
                    id, title, content, created_at, updated_at,
                    category, view_count, like_count, comment_count,
                    categories(name, color)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('getUserPosts 실패:', error);
            return [];
        }
    }

    /**
     * 사용자 댓글 조회
     */
    async getUserComments(userId) {
        try {
            const { data, error } = await this.supabase
                .from('comments')
                .select(`
                    id, content, created_at,
                    post_id, like_count,
                    posts(title, category)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('getUserComments 실패:', error);
            return [];
        }
    }

    /**
     * 사용자 좋아요 조회
     */
    async getUserLikes(userId) {
        try {
            const { data, error } = await this.supabase
                .from('post_likes')
                .select(`
                    id, created_at,
                    posts(id, title, category)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(30);

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('getUserLikes 실패:', error);
            return [];
        }
    }

    /**
     * 최근 활동 내역 (일별 집계)
     */
    async getRecentActivity(userId, days = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const startDateString = startDate.toISOString().split('T')[0];

            // 일별 게시글 수 조회
            const { data: postsData, error: postsError } = await this.supabase
                .from('posts')
                .select('created_at')
                .eq('user_id', userId)
                .gte('created_at', startDateString)
                .order('created_at', { ascending: true });

            if (postsError) throw postsError;

            // 일별 댓글 수 조회
            const { data: commentsData, error: commentsError } = await this.supabase
                .from('comments')
                .select('created_at')
                .eq('user_id', userId)
                .gte('created_at', startDateString)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;

            // 일별 좋아요 수 조회
            const { data: likesData, error: likesError } = await this.supabase
                .from('post_likes')
                .select('created_at')
                .eq('user_id', userId)
                .gte('created_at', startDateString)
                .order('created_at', { ascending: true });

            if (likesError) throw likesError;

            // 일별 집계
            const dailyActivity = {};
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (days - 1 - i));
                const dateKey = date.toISOString().split('T')[0];
                dailyActivity[dateKey] = { posts: 0, comments: 0, likes: 0, total: 0 };
            }

            // 데이터 집계
            [
                { data: postsData || [], type: 'posts' },
                { data: commentsData || [], type: 'comments' },
                { data: likesData || [], type: 'likes' }
            ].forEach(({ data, type }) => {
                data.forEach(item => {
                    const dateKey = item.created_at.split('T')[0];
                    if (dailyActivity[dateKey]) {
                        dailyActivity[dateKey][type]++;
                        dailyActivity[dateKey].total++;
                    }
                });
            });

            return Object.values(dailyActivity);

        } catch (error) {
            console.error('getRecentActivity 실패:', error);
            return Array(days).fill({ posts: 0, comments: 0, likes: 0, total: 0 });
        }
    }

    /**
     * 활동 차트 데이터 생성
     */
    generateActivityChart(recentActivity) {
        return recentActivity.map(day => day.total || 0);
    }

    /**
     * 활동 트렌드 계산
     */
    calculateTrends(recentActivity) {
        if (recentActivity.length < 2) {
            return { posts: 0, comments: 0, likes: 0 };
        }

        const recent = recentActivity.slice(-3); // 최근 3일
        const older = recentActivity.slice(-6, -3); // 이전 3일

        const recentAvg = {
            posts: recent.reduce((sum, day) => sum + (day.posts || 0), 0) / recent.length,
            comments: recent.reduce((sum, day) => sum + (day.comments || 0), 0) / recent.length,
            likes: recent.reduce((sum, day) => sum + (day.likes || 0), 0) / recent.length
        };

        const olderAvg = {
            posts: older.reduce((sum, day) => sum + (day.posts || 0), 0) / older.length,
            comments: older.reduce((sum, day) => sum + (day.comments || 0), 0) / older.length,
            likes: older.reduce((sum, day) => sum + (day.likes || 0), 0) / older.length
        };

        return {
            posts: olderAvg.posts > 0 ? ((recentAvg.posts - olderAvg.posts) / olderAvg.posts * 100) : 0,
            comments: olderAvg.comments > 0 ? ((recentAvg.comments - olderAvg.comments) / olderAvg.comments * 100) : 0,
            likes: olderAvg.likes > 0 ? ((recentAvg.likes - olderAvg.likes) / olderAvg.likes * 100) : 0
        };
    }

    /**
     * 캐시 유효성 검사
     */
    isValidCache() {
        return this.cache.activities && 
               this.cache.lastUpdated && 
               (Date.now() - this.cache.lastUpdated) < this.cache.expiry;
    }

    /**
     * 캐시 무효화
     */
    invalidateCache() {
        this.cache.activities = null;
        this.cache.lastUpdated = null;
        console.log('ActivityService: 캐시 무효화됨');
    }

    /**
     * 실시간 활동 업데이트 (새 게시글/댓글 작성시 호출)
     */
    async updateActivity(type, data) {
        try {
            // 캐시 무효화
            this.invalidateCache();
            
            // 필요시 실시간 UI 업데이트
            const event = new CustomEvent('activityUpdated', {
                detail: { type, data }
            });
            document.dispatchEvent(event);
            
            console.log(`ActivityService: ${type} 활동 업데이트됨`);
            
        } catch (error) {
            console.error('활동 업데이트 실패:', error);
        }
    }
}

// 전역 인스턴스 생성
window.activityService = new ActivityService();

export default ActivityService;