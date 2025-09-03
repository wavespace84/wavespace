/**
 * WAVE SPACE - 공지사항 서비스
 * Supabase를 이용한 공지사항 CRUD 및 관련 기능
 * 수정일: 2025-08-28 (users 테이블 조인 제거 완료)
 */

class NoticeService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        // 생성자에서 즉시 초기화하지 않음
    }

    /**
     * 서비스 초기화
     */
    async init() {
        try {
            // Supabase 클라이언트 대기 (최대 3초)
            let attempts = 0;
            const maxAttempts = 60; // 3초 (50ms * 60 = 3000ms)
            
            while ((!window.WaveSupabase || !window.WaveSupabase.getClient) && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 50));
                attempts++;
            }
            
            if (!window.WaveSupabase || !window.WaveSupabase.getClient) {
                throw new Error('Supabase 초기화 시간 초과');
            }
            
            this.supabase = window.WaveSupabase.getClient();
            this.initialized = true;
            console.log('✅ NoticeService 초기화 완료');
        } catch (error) {
            console.error('❌ NoticeService 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 초기화 상태 확인
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
        return this.initialized;
    }

    /**
     * 공지사항 목록 조회
     * @param {Object} options - 검색 옵션
     * @param {number} options.page - 페이지 번호 (1부터 시작)
     * @param {number} options.limit - 페이지당 항목 수
     * @param {string} options.category - 카테고리 필터
     * @param {string} options.search - 검색 키워드
     * @param {boolean} options.pinnedOnly - 고정글만 조회
     * @returns {Promise<{data: Array, total: number, error?: string}>}
     */
    async getNotices({
        page = 1,
        limit = 10,
        category = null,
        search = null,
        pinnedOnly = false
    } = {}) {
        try {
            await this.ensureInitialized();

            let query = this.supabase
                .from('notices')
                .select(`
                    id,
                    title,
                    content,
                    category,
                    team,
                    view_count,
                    author_id,
                    is_pinned,
                    is_new,
                    created_at,
                    updated_at
                `, { count: 'exact' })
                .eq('is_active', true);

            // 고정글만 조회
            if (pinnedOnly) {
                query = query.eq('is_pinned', true);
            }

            // 카테고리 필터
            if (category && category !== '전체') {
                query = query.eq('category', category);
            }

            // 검색 기능
            if (search && search.trim()) {
                query = query.or(`title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%`);
            }

            // 정렬 (고정글 우선, 그 다음 최신순)
            query = query.order('is_pinned', { ascending: false })
                         .order('created_at', { ascending: false });

            // 페이지네이션
            const start = (page - 1) * limit;
            query = query.range(start, start + limit - 1);

            const { data, count, error } = await query;

            if (error) throw error;

            // 날짜 포맷팅 및 새글 상태 처리
            const processedData = data?.map(notice => {
                const createdAt = new Date(notice.created_at);
                const daysDiff = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                
                return {
                    ...notice,
                    createdAt: this.formatDate(createdAt),
                    isNew: notice.is_new && daysDiff <= 7,
                    authorName: notice.team
                };
            }) || [];

            return {
                data: processedData,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
                currentPage: page
            };

        } catch (error) {
            console.error('공지사항 조회 실패:', error);
            return {
                data: [],
                total: 0,
                error: error.message
            };
        }
    }

    /**
     * 공지사항 상세 조회
     * @param {string} noticeId - 공지사항 ID
     * @param {boolean} incrementView - 조회수 증가 여부
     * @returns {Promise<{data: Object|null, error?: string}>}
     */
    async getNoticeById(noticeId, incrementView = true) {
        try {
            await this.ensureInitialized();

            const { data, error } = await this.supabase
                .from('notices')
                .select(`
                    id,
                    title,
                    content,
                    category,
                    team,
                    view_count,
                    author_id,
                    is_pinned,
                    is_new,
                    created_at,
                    updated_at
                `)
                .eq('id', noticeId)
                .eq('is_active', true)
                .single();

            if (error) throw error;

            if (data && incrementView) {
                // 조회수 증가 (비동기로 처리)
                this.incrementViewCount(noticeId).catch(err => 
                    console.warn('조회수 업데이트 실패:', err)
                );
            }

            const processedData = data ? {
                ...data,
                createdAt: this.formatDate(new Date(data.created_at)),
                updatedAt: this.formatDate(new Date(data.updated_at)),
                authorName: data.team
            } : null;

            return { data: processedData };

        } catch (error) {
            console.error('공지사항 상세 조회 실패:', error);
            return {
                data: null,
                error: error.message
            };
        }
    }

    /**
     * 공지사항 생성
     * @param {Object} noticeData - 공지사항 데이터
     * @returns {Promise<{data: Object|null, error?: string}>}
     */
    async createNotice(noticeData) {
        try {
            await this.ensureInitialized();

            const { data, error } = await this.supabase
                .from('notices')
                .insert([{
                    title: noticeData.title,
                    content: noticeData.content,
                    category: noticeData.category || '공지',
                    team: noticeData.team || '운영팀',
                    is_pinned: noticeData.isPinned || false,
                    author_id: noticeData.authorId
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ 공지사항 생성 완료:', data.id);
            return { data };

        } catch (error) {
            console.error('공지사항 생성 실패:', error);
            return {
                data: null,
                error: error.message
            };
        }
    }

    /**
     * 공지사항 수정
     * @param {string} noticeId - 공지사항 ID
     * @param {Object} updateData - 수정할 데이터
     * @returns {Promise<{data: Object|null, error?: string}>}
     */
    async updateNotice(noticeId, updateData) {
        try {
            await this.ensureInitialized();

            const { data, error } = await this.supabase
                .from('notices')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', noticeId)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ 공지사항 수정 완료:', noticeId);
            return { data };

        } catch (error) {
            console.error('공지사항 수정 실패:', error);
            return {
                data: null,
                error: error.message
            };
        }
    }

    /**
     * 공지사항 삭제 (소프트 삭제)
     * @param {string} noticeId - 공지사항 ID
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deleteNotice(noticeId) {
        try {
            await this.ensureInitialized();

            const { error } = await this.supabase
                .from('notices')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', noticeId);

            if (error) throw error;

            console.log('✅ 공지사항 삭제 완료:', noticeId);
            return { success: true };

        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 조회수 증가
     * @param {string} noticeId - 공지사항 ID
     * @returns {Promise<void>}
     */
    async incrementViewCount(noticeId) {
        try {
            await this.ensureInitialized();

            const { error } = await this.supabase.rpc('increment_notice_view_count', {
                notice_id: noticeId
            });

            if (error) throw error;

        } catch (error) {
            console.error('조회수 증가 실패:', error);
        }
    }

    /**
     * 카테고리 목록 조회
     * @returns {Promise<Array<string>>}
     */
    async getCategories() {
        try {
            await this.ensureInitialized();

            const { data, error } = await this.supabase
                .from('notices')
                .select('category')
                .eq('is_active', true);

            if (error) throw error;

            const categories = [...new Set(data?.map(item => item.category) || [])];
            return ['전체', ...categories.sort()];

        } catch (error) {
            console.error('카테고리 조회 실패:', error);
            return ['전체', '공지', '이벤트', '점검', '가이드'];
        }
    }

    /**
     * 공지사항 통계 조회
     * @returns {Promise<Object>}
     */
    async getStatistics() {
        try {
            await this.ensureInitialized();

            const { data, error } = await this.supabase
                .from('notices')
                .select('category, view_count, is_pinned, created_at')
                .eq('is_active', true);

            if (error) throw error;

            const stats = {
                total: data?.length || 0,
                pinned: data?.filter(n => n.is_pinned).length || 0,
                totalViews: data?.reduce((sum, n) => sum + (n.view_count || 0), 0) || 0,
                categories: {}
            };

            data?.forEach(notice => {
                if (stats.categories[notice.category]) {
                    stats.categories[notice.category]++;
                } else {
                    stats.categories[notice.category] = 1;
                }
            });

            return stats;

        } catch (error) {
            console.error('통계 조회 실패:', error);
            return {
                total: 0,
                pinned: 0,
                totalViews: 0,
                categories: {}
            };
        }
    }

    /**
     * 날짜 포맷팅
     * @param {Date} date - 날짜 객체
     * @returns {string} 포맷된 날짜 문자열
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 상대 시간 포맷팅
     * @param {Date} date - 날짜 객체
     * @returns {string} 상대 시간 문자열
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return '방금 전';
        if (diffMinutes < 60) return `${diffMinutes}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return this.formatDate(date);
    }
}

// 전역 서비스 인스턴스 생성 (지연 초기화)
const noticeService = new NoticeService();

// 전역에서 사용할 수 있도록 export
window.noticeService = noticeService;

// 모듈로 내보내기 (필요한 경우)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NoticeService;
}