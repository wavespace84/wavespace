/**
 * 실시간 컨텐츠 섹션 로더
 * 인기 게시글, 대기 질문, HOT PICK 데이터 로딩 및 표시
 */
class RealtimeContentLoader {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
        this.refreshInterval = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    async setup() {
        try {
            await this.waitForSupabase();
            await this.loadAllContent();
            this.startAutoRefresh();
            this.isInitialized = true;
            console.log('[RealtimeContentLoader] 실시간 컨텐츠 로더 초기화 완료');
        } catch (error) {
            console.error('[RealtimeContentLoader] 초기화 오류:', error);
            this.loadMockData(); // Supabase 연결 실패 시 임시 데이터 로드
        }
    }

    async waitForSupabase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5초 대기

            const checkSupabase = () => {
                attempts++;
                if (window.supabase) {
                    this.supabase = window.supabase;
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Supabase 로딩 실패'));
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };

            checkSupabase();
        });
    }

    async loadAllContent() {
        if (!this.supabase) {
            console.warn('[RealtimeContentLoader] Supabase가 준비되지 않았습니다.');
            this.loadMockData();
            return;
        }

        await Promise.allSettled([
            this.loadPopularPosts(),
            this.loadWaitingQuestions(),
            this.loadHotPick()
        ]);
    }

    async loadPopularPosts() {
        try {
            // 최근 7일 내 인기 게시글 로드 (좋아요, 댓글 수 기준)
            const { data, error } = await this.supabase
                .from('posts')
                .select(`
                    id, title, category, created_at, views_count, likes_count, comments_count,
                    author:users!posts_user_id_fkey(nickname, user_type)
                `)
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .eq('status', 'published')
                .order('likes_count', { ascending: false })
                .order('comments_count', { ascending: false })
                .limit(5);

            if (data && data.length > 0) {
                this.renderPopularPosts(data);
            } else {
                this.loadMockPopularPosts();
            }
        } catch (error) {
            console.error('[RealtimeContentLoader] 인기 게시글 로딩 실패:', error);
            this.loadMockPopularPosts();
        }
    }

    async loadWaitingQuestions() {
        try {
            // 답변이 없는 최신 질문들 로드
            const { data, error } = await this.supabase
                .from('posts')
                .select(`
                    id, title, category, created_at, views_count,
                    author:users!posts_user_id_fkey(nickname, user_type)
                `)
                .eq('category', 'qna')
                .eq('status', 'published')
                .is('accepted_answer_id', null)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data && data.length > 0) {
                this.renderWaitingQuestions(data);
            } else {
                this.loadMockWaitingQuestions();
            }
        } catch (error) {
            console.error('[RealtimeContentLoader] 대기 질문 로딩 실패:', error);
            this.loadMockWaitingQuestions();
        }
    }

    async loadHotPick() {
        try {
            // 오늘의 HOT PICK (관리자 추천 + 높은 활동도)
            const { data, error } = await this.supabase
                .from('posts')
                .select(`
                    id, title, category, created_at, views_count, likes_count, comments_count,
                    author:users!posts_user_id_fkey(nickname, user_type)
                `)
                .eq('status', 'published')
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                .order('views_count', { ascending: false })
                .limit(3);

            if (data && data.length > 0) {
                this.renderHotPick(data);
            } else {
                this.loadMockHotPick();
            }
        } catch (error) {
            console.error('[RealtimeContentLoader] HOT PICK 로딩 실패:', error);
            this.loadMockHotPick();
        }
    }

    renderPopularPosts(posts) {
        const container = document.getElementById('popular-posts-content');
        if (!container) return;

        container.innerHTML = posts.map(post => `
            <div class="content-item" onclick="location.href='forum.html?post=${post.id}'">
                <div class="item-content">
                    <div class="item-title">${post.title}</div>
                    <div class="item-meta">
                        <span class="author">${post.author?.nickname || '익명'}</span>
                        <span class="category">${this.getCategoryName(post.category)}</span>
                        <span class="stats">👍 ${post.likes_count} 💬 ${post.comments_count}</span>
                    </div>
                </div>
                <div class="item-indicator">
                    <i class="fas fa-fire trending-icon"></i>
                </div>
            </div>
        `).join('');
    }

    renderWaitingQuestions(questions) {
        const container = document.getElementById('waiting-questions-content');
        if (!container) return;

        container.innerHTML = questions.map(question => `
            <div class="content-item" onclick="location.href='qna.html?post=${question.id}'">
                <div class="item-content">
                    <div class="item-title">${question.title}</div>
                    <div class="item-meta">
                        <span class="author">${question.author?.nickname || '익명'}</span>
                        <span class="time">${this.getTimeAgo(question.created_at)}</span>
                        <span class="views">👁️ ${question.views_count}</span>
                    </div>
                </div>
                <div class="item-indicator">
                    <i class="fas fa-clock waiting-icon"></i>
                </div>
            </div>
        `).join('');
    }

    renderHotPick(hotPicks) {
        const container = document.getElementById('hot-pick-content');
        if (!container) return;

        container.innerHTML = hotPicks.map(pick => `
            <div class="content-item hot-item" onclick="location.href='forum.html?post=${pick.id}'">
                <div class="item-content">
                    <div class="item-title">${pick.title}</div>
                    <div class="item-meta">
                        <span class="author">${pick.author?.nickname || '익명'}</span>
                        <span class="category">${this.getCategoryName(pick.category)}</span>
                        <span class="hot-stats">🔥 ${pick.views_count} views</span>
                    </div>
                </div>
                <div class="item-indicator">
                    <i class="fas fa-star hot-icon"></i>
                </div>
            </div>
        `).join('');
    }

    getCategoryName(category) {
        const categoryMap = {
            general: '자유',
            info: '정보',
            qna: '질문',
            notice: '공지',
            job: '채용',
            review: '후기'
        };
        return categoryMap[category] || category;
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return past.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
    }

    // Mock 데이터 로드 메서드들
    loadMockData() {
        console.log('[RealtimeContentLoader] 임시 데이터 로딩 시작');
        this.loadMockPopularPosts();
        this.loadMockWaitingQuestions();
        this.loadMockHotPick();
    }

    loadMockPopularPosts() {
        const mockPosts = [
            { id: 1, title: "강남 래미안 원베일리 분양 후기 및 팁 공유", author: { nickname: "분양마스터" }, category: "review", likes_count: 24, comments_count: 8 },
            { id: 2, title: "청약홈 개편 후 달라진 점들 정리", author: { nickname: "실무왕" }, category: "info", likes_count: 18, comments_count: 12 },
            { id: 3, title: "2024년 하반기 분양시장 전망 분석", author: { nickname: "시장분석가" }, category: "general", likes_count: 15, comments_count: 6 },
            { id: 4, title: "수도권 신도시 분양가 상한제 완화 소식", author: { nickname: "정책통" }, category: "info", likes_count: 12, comments_count: 4 },
            { id: 5, title: "분양 현장에서 실제로 도움되는 마케팅 전략", author: { nickname: "현장실무자" }, category: "general", likes_count: 10, comments_count: 3 }
        ];

        this.renderPopularPosts(mockPosts);
    }

    loadMockWaitingQuestions() {
        const mockQuestions = [
            { id: 6, title: "분양권 전매 관련 세금 문의드립니다", author: { nickname: "초보실무자" }, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), views_count: 45 },
            { id: 7, title: "청약 당첨자 관리 프로그램 추천 부탁드려요", author: { nickname: "관리팀장" }, created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), views_count: 32 },
            { id: 8, title: "분양 마케팅 이벤트 기획 어떻게 하시나요?", author: { nickname: "기획담당자" }, created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), views_count: 28 },
            { id: 9, title: "고객 컴플레인 대응 매뉴얼이 있을까요?", author: { nickname: "고객응대팀" }, created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), views_count: 21 },
            { id: 10, title: "분양사무소 레이아웃 개선 아이디어 구합니다", author: { nickname: "사무소장" }, created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), views_count: 18 }
        ];

        this.renderWaitingQuestions(mockQuestions);
    }

    loadMockHotPick() {
        const mockHotPicks = [
            { id: 11, title: "🔥 올해 최고 분양성과 달성한 마케팅 전략 공개", author: { nickname: "성과왕" }, category: "general", views_count: 1250 },
            { id: 12, title: "⚡ 청약홈 시스템 점검으로 인한 업무 대응법", author: { nickname: "긴급대응팀" }, category: "info", views_count: 980 },
            { id: 13, title: "💡 AI 활용한 고객 상담 자동화 성공 사례", author: { nickname: "혁신실무자" }, category: "review", views_count: 756 }
        ];

        this.renderHotPick(mockHotPicks);
    }

    startAutoRefresh() {
        // 3분마다 자동 새로고침
        this.refreshInterval = setInterval(() => {
            if (this.isInitialized) {
                this.loadAllContent();
                console.log('[RealtimeContentLoader] 자동 새로고침 실행');
            }
        }, 3 * 60 * 1000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.isInitialized = false;
        console.log('[RealtimeContentLoader] 실시간 컨텐츠 로더 정리 완료');
    }
}

// 전역 접근 가능하도록 window 객체에 등록
window.RealtimeContentLoader = RealtimeContentLoader;

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (!window.realtimeContentLoader) {
        window.realtimeContentLoader = new RealtimeContentLoader();
    }
});