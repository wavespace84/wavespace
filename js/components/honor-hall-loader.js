/**
 * 명예의 전당 섹션 로더
 * 이달의 5대 리더 및 연간 TOP 3 데이터 로딩
 */
class HonorHallLoader {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
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
            // Supabase 로딩 대기
            await this.waitForSupabase();
            await this.loadAllData();
            this.isInitialized = true;
            console.log('[HonorHallLoader] 명예의 전당 로더 초기화 완료');
        } catch (error) {
            console.error('[HonorHallLoader] 초기화 오류:', error);
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

    async loadAllData() {
        if (!this.supabase) {
            console.warn('[HonorHallLoader] Supabase가 준비되지 않았습니다.');
            this.loadMockData();
            return;
        }

        await Promise.allSettled([
            this.loadMonthlyLeaders(),
            this.loadYearlyTop3()
        ]);
    }

    async loadMonthlyLeaders() {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const categories = ['communication', 'attendance', 'information', 'recommendation', 'points'];

            for (const category of categories) {
                try {
                    // 임시로 사용자 테이블에서 데이터를 가져와서 모의 리더 데이터 생성
                    const { data, error } = await this.supabase
                        .from('users')
                        .select('id, nickname, profile_image, user_type, current_points')
                        .eq('is_active', true)
                        .order('current_points', { ascending: false })
                        .limit(1);

                    if (data && data.length > 0) {
                        // 카테고리별로 약간 다른 포인트 계산
                        const user = data[0];
                        const mockData = {
                            users: user,
                            points: this.calculateCategoryPoints(user.current_points, category)
                        };
                        
                        this.updateLeaderCard(category, mockData);
                    } else {
                        this.showNoLeaderData(category);
                    }
                } catch (error) {
                    console.warn(`[HonorHallLoader] ${category} 리더 로딩 실패:`, error);
                    this.showNoLeaderData(category);
                }
            }
        } catch (error) {
            console.error('[HonorHallLoader] 월간 리더 로딩 실패:', error);
            this.loadMockLeaders();
        }
    }

    async loadYearlyTop3() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('id, nickname, profile_image, current_points, user_type')
                .eq('is_active', true)
                .order('current_points', { ascending: false })
                .limit(3);

            if (data && data.length >= 3) {
                data.forEach((user, index) => {
                    const rank = index + 1;
                    this.updateTop3Card(rank, user);
                });
            } else {
                console.warn('[HonorHallLoader] TOP 3 데이터 부족, 임시 데이터 사용');
                this.loadMockTop3();
            }
        } catch (error) {
            console.error('[HonorHallLoader] 연간 TOP 3 로딩 실패:', error);
            this.loadMockTop3();
        }
    }

    calculateCategoryPoints(basePoints, category) {
        // 카테고리별로 다른 계산 방식 적용 (모의)
        const multipliers = {
            communication: 0.3,
            attendance: 0.2,
            information: 0.4,
            recommendation: 0.25,
            points: 1.0
        };

        return Math.floor(basePoints * (multipliers[category] || 1.0));
    }

    updateLeaderCard(category, data) {
        const categoryMap = {
            communication: 'comm',
            attendance: 'attend',
            information: 'info',
            recommendation: 'rec',
            points: 'points'
        };

        const prefix = categoryMap[category];
        const avatarElement = document.getElementById(`${prefix}-leader-avatar`);
        const nameElement = document.getElementById(`${prefix}-leader-name`);
        const pointsElement = document.getElementById(`${prefix}-leader-points`);

        if (!avatarElement || !nameElement || !pointsElement) {
            console.warn(`[HonorHallLoader] ${prefix} 요소들을 찾을 수 없습니다.`);
            return;
        }

        // 로딩 상태 제거
        avatarElement.classList.remove('loading');
        
        // 프로필 이미지 설정
        if (data.users.profile_image) {
            avatarElement.style.backgroundImage = `url(${data.users.profile_image})`;
            avatarElement.style.backgroundSize = 'cover';
            avatarElement.style.backgroundPosition = 'center';
            avatarElement.textContent = '';
        } else {
            avatarElement.innerHTML = data.users.nickname.charAt(0).toUpperCase();
            avatarElement.classList.add('default-avatar');
        }

        // 닉네임 설정
        let displayName = data.users.nickname;
        if (data.users.user_type === '실무자') {
            displayName += ' <span class="pro-badge">실무자</span>';
        }
        nameElement.innerHTML = displayName;

        // 포인트 설정
        pointsElement.textContent = `${data.points.toLocaleString()}P`;
    }

    updateTop3Card(rank, user) {
        const rankText = this.getRankText(rank);
        const avatarElement = document.getElementById(`top3-${rankText}-avatar`);
        const nameElement = document.getElementById(`top3-${rankText}-name`);
        const pointsElement = document.getElementById(`top3-${rankText}-points`);

        if (!avatarElement || !nameElement || !pointsElement) {
            console.warn(`[HonorHallLoader] TOP3 ${rank}위 요소들을 찾을 수 없습니다.`);
            return;
        }

        // 프로필 이미지 설정
        if (user.profile_image) {
            avatarElement.style.backgroundImage = `url(${user.profile_image})`;
            avatarElement.style.backgroundSize = 'cover';
            avatarElement.style.backgroundPosition = 'center';
            avatarElement.textContent = '';
        } else {
            avatarElement.innerHTML = user.nickname.charAt(0).toUpperCase();
        }

        // 닉네임 및 포인트 설정
        let displayName = user.nickname;
        if (user.user_type === '실무자') {
            displayName += ' <span class="pro-badge">실무자</span>';
        }
        nameElement.innerHTML = displayName;
        pointsElement.textContent = `${user.current_points.toLocaleString()}P`;
    }

    getRankText(rank) {
        const rankMap = { 1: '1st', 2: '2nd', 3: '3rd' };
        return rankMap[rank] || `${rank}th`;
    }

    showNoLeaderData(category) {
        const categoryMap = {
            communication: 'comm',
            attendance: 'attend',
            information: 'info',
            recommendation: 'rec',
            points: 'points'
        };

        const prefix = categoryMap[category];
        const avatarElement = document.getElementById(`${prefix}-leader-avatar`);
        const nameElement = document.getElementById(`${prefix}-leader-name`);
        const pointsElement = document.getElementById(`${prefix}-leader-points`);

        if (avatarElement && nameElement && pointsElement) {
            avatarElement.classList.remove('loading');
            avatarElement.innerHTML = '?';
            nameElement.textContent = '데이터 없음';
            pointsElement.textContent = '0P';
        }
    }

    // 임시 데이터 로드 메서드들
    loadMockData() {
        console.log('[HonorHallLoader] 임시 데이터 로딩 시작');
        this.loadMockLeaders();
        this.loadMockTop3();
    }

    loadMockLeaders() {
        const mockLeaders = {
            communication: { nickname: '소통왕김실무', points: 1250, user_type: '실무자' },
            attendance: { nickname: '매일출석이', points: 980, user_type: '일반' },
            information: { nickname: '정보마스터', points: 1580, user_type: '실무자' },
            recommendation: { nickname: '추천고수', points: 720, user_type: '일반' },
            points: { nickname: '포인트킹', points: 2100, user_type: '실무자' }
        };

        Object.entries(mockLeaders).forEach(([category, data]) => {
            this.updateLeaderCard(category, { users: data, points: data.points });
        });
    }

    loadMockTop3() {
        const mockTop3 = [
            { nickname: '분양의신', current_points: 28450, user_type: '실무자' },
            { nickname: '실무마스터', current_points: 15680, user_type: '실무자' },
            { nickname: '커뮤니티킹', current_points: 12340, user_type: '일반' }
        ];

        mockTop3.forEach((user, index) => {
            this.updateTop3Card(index + 1, user);
        });
    }

    destroy() {
        this.isInitialized = false;
        console.log('[HonorHallLoader] 명예의 전당 로더 정리 완료');
    }
}

// 전역 접근 가능하도록 window 객체에 등록
window.HonorHallLoader = HonorHallLoader;

// 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (!window.honorHallLoader) {
        window.honorHallLoader = new HonorHallLoader();
    }
});