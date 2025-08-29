/**
 * 공지사항 의견 관리 서비스
 * notice_feedbacks 테이블과 연동하여 의견 CRUD 기능 제공
 */

class FeedbackService {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.initPromise = this.initialize();
    }

    async initialize() {
        try {
            // Supabase 클라이언트 대기
            let attempts = 0;
            const maxAttempts = 50;
            
            while (attempts < maxAttempts) {
                if (window.WaveSupabase && typeof window.WaveSupabase.getClient === 'function') {
                    try {
                        this.supabase = window.WaveSupabase.getClient();
                        this.initialized = true;
                        console.log('✅ FeedbackService - Supabase 클라이언트 연결 성공');
                        return;
                    } catch (error) {
                        // WaveSupabase.getClient() 호출 실패, 다시 시도
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            throw new Error('Supabase 클라이언트 초기화 시간 초과');
        } catch (error) {
            console.error('FeedbackService 초기화 실패:', error);
            this.initialized = false;
        }
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
        if (!this.supabase) {
            throw new Error('Supabase client가 초기화되지 않았습니다.');
        }
    }

    /**
     * 특정 공지사항에 대한 의견 조회 (관리자용 - 모든 의견 조회)
     * @param {string} noticeId - 공지사항 ID
     * @returns {Promise<{data: Array, error: string|null}>}
     */
    async getFeedbacksByNotice(noticeId) {
        try {
            await this.ensureInitialized();
            
            if (!noticeId) {
                return { data: [], error: '공지사항 ID가 필요합니다.' };
            }

            const { data, error } = await this.supabase
                .from('notice_feedbacks')
                .select(`
                    *,
                    users:user_id (
                        username,
                        full_name
                    )
                `)
                .eq('notice_id', noticeId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('의견 조회 실패:', error);
                return { data: [], error: error.message };
            }

            return { 
                data: data || [], 
                error: null 
            };

        } catch (error) {
            console.error('의견 조회 중 예외 발생:', error);
            return { data: [], error: '의견 조회 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 현재 사용자의 특정 공지사항에 대한 의견 조회
     * @param {string} noticeId - 공지사항 ID
     * @returns {Promise<{data: Object|null, error: string|null}>}
     */
    async getUserFeedbackByNotice(noticeId) {
        try {
            await this.ensureInitialized();
            
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
            
            if (sessionError || !session?.user) {
                return { data: null, error: '로그인이 필요합니다.' };
            }
            
            const user = session.user;

            if (!noticeId) {
                return { data: null, error: '공지사항 ID가 필요합니다.' };
            }

            const { data, error } = await this.supabase
                .from('notice_feedbacks')
                .select('*')
                .eq('notice_id', noticeId)
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error('사용자 의견 조회 실패:', error);
                return { data: null, error: error.message };
            }

            return { 
                data: data || null, 
                error: null 
            };

        } catch (error) {
            console.error('사용자 의견 조회 중 예외 발생:', error);
            return { data: null, error: '의견 조회 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 의견 생성
     * @param {string} noticeId - 공지사항 ID
     * @param {string} content - 의견 내용
     * @returns {Promise<{data: Object|null, error: string|null}>}
     */
    async createFeedback(noticeId, content) {
        try {
            await this.ensureInitialized();
            
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
            
            if (sessionError || !session?.user) {
                return { data: null, error: '로그인이 필요합니다.' };
            }
            
            const user = session.user;

            if (!noticeId || !content?.trim()) {
                return { data: null, error: '공지사항 ID와 의견 내용이 필요합니다.' };
            }

            if (content.trim().length > 500) {
                return { data: null, error: '의견은 500자 이내로 작성해주세요.' };
            }

            // 이미 의견을 남겼는지 확인
            const existingFeedback = await this.getUserFeedbackByNotice(noticeId);
            if (existingFeedback.data) {
                return { data: null, error: '이미 이 공지사항에 의견을 남기셨습니다. 수정해주세요.' };
            }

            const { data, error } = await this.supabase
                .from('notice_feedbacks')
                .insert([{
                    notice_id: noticeId,
                    user_id: user.id,
                    content: content.trim()
                }])
                .select()
                .single();

            if (error) {
                console.error('의견 생성 실패:', error);
                return { data: null, error: error.message };
            }

            return { 
                data: data || null, 
                error: null 
            };

        } catch (error) {
            console.error('의견 생성 중 예외 발생:', error);
            return { data: null, error: '의견 생성 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 의견 수정
     * @param {string} feedbackId - 의견 ID
     * @param {string} content - 수정할 의견 내용
     * @returns {Promise<{data: Object|null, error: string|null}>}
     */
    async updateFeedback(feedbackId, content) {
        try {
            await this.ensureInitialized();
            
            if (!feedbackId || !content?.trim()) {
                return { data: null, error: '의견 ID와 수정할 내용이 필요합니다.' };
            }

            if (content.trim().length > 500) {
                return { data: null, error: '의견은 500자 이내로 작성해주세요.' };
            }

            const { data, error } = await this.supabase
                .from('notice_feedbacks')
                .update({
                    content: content.trim(),
                    is_edited: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', feedbackId)
                .select()
                .single();

            if (error) {
                console.error('의견 수정 실패:', error);
                return { data: null, error: error.message };
            }

            return { 
                data: data || null, 
                error: null 
            };

        } catch (error) {
            console.error('의견 수정 중 예외 발생:', error);
            return { data: null, error: '의견 수정 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 의견 삭제
     * @param {string} feedbackId - 의견 ID
     * @returns {Promise<{data: boolean, error: string|null}>}
     */
    async deleteFeedback(feedbackId) {
        try {
            await this.ensureInitialized();
            
            if (!feedbackId) {
                return { data: false, error: '의견 ID가 필요합니다.' };
            }

            const { error } = await this.supabase
                .from('notice_feedbacks')
                .delete()
                .eq('id', feedbackId);

            if (error) {
                console.error('의견 삭제 실패:', error);
                return { data: false, error: error.message };
            }

            return { 
                data: true, 
                error: null 
            };

        } catch (error) {
            console.error('의견 삭제 중 예외 발생:', error);
            return { data: false, error: '의견 삭제 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 특정 공지사항의 의견 개수 조회
     * @param {string} noticeId - 공지사항 ID
     * @returns {Promise<{data: number, error: string|null}>}
     */
    async getFeedbackCount(noticeId) {
        try {
            await this.ensureInitialized();
            
            if (!noticeId) {
                return { data: 0, error: '공지사항 ID가 필요합니다.' };
            }

            const { count, error } = await this.supabase
                .from('notice_feedbacks')
                .select('*', { count: 'exact', head: true })
                .eq('notice_id', noticeId);

            if (error) {
                console.error('의견 개수 조회 실패:', error);
                return { data: 0, error: error.message };
            }

            return { 
                data: count || 0, 
                error: null 
            };

        } catch (error) {
            console.error('의견 개수 조회 중 예외 발생:', error);
            return { data: 0, error: '의견 개수 조회 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 모든 의견 조회 (관리자용)
     * @param {Object} options - 조회 옵션
     * @param {number} options.limit - 조회할 개수 (기본값: 50)
     * @param {number} options.offset - 건너뛸 개수 (기본값: 0)
     * @returns {Promise<{data: Array, error: string|null}>}
     */
    async getAllFeedbacks(options = {}) {
        try {
            await this.ensureInitialized();
            
            const { limit = 50, offset = 0 } = options;

            const { data, error } = await this.supabase
                .from('notice_feedbacks')
                .select(`
                    *,
                    users:user_id (
                        username,
                        full_name
                    ),
                    notices:notice_id (
                        title,
                        category
                    )
                `)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('모든 의견 조회 실패:', error);
                return { data: [], error: error.message };
            }

            return { 
                data: data || [], 
                error: null 
            };

        } catch (error) {
            console.error('모든 의견 조회 중 예외 발생:', error);
            return { data: [], error: '의견 조회 중 오류가 발생했습니다.' };
        }
    }

    /**
     * 날짜 포맷팅 유틸리티
     * @param {string} dateString - ISO 날짜 문자열
     * @returns {string} 포맷된 날짜 문자열
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (minutes < 1) {
                return '방금 전';
            } else if (minutes < 60) {
                return `${minutes}분 전`;
            } else if (hours < 24) {
                return `${hours}시간 전`;
            } else if (days < 7) {
                return `${days}일 전`;
            } else {
                return date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        } catch (error) {
            console.error('날짜 포맷팅 실패:', error);
            return dateString;
        }
    }
}

// 전역 인스턴스 생성 및 export
window.feedbackService = new FeedbackService();

// 초기화 완료 메시지는 비동기로 처리
window.feedbackService.initPromise.then(() => {
    console.log('✅ FeedbackService 초기화 완료');
}).catch(error => {
    console.error('❌ FeedbackService 초기화 실패:', error);
});