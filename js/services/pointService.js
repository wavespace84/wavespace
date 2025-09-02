/**
 * WAVE SPACE - Point Service
 * 포인트 시스템 관련 기능을 처리하는 서비스
 */

class PointService {
    constructor() {
        this.supabase = null;
    }

    /**
     * 초기화
     */
    async init() {
        try {
            this.supabase = window.WaveSupabase.getClient();
        } catch (error) {
            console.error('PointService 초기화 실패:', error);
        }
    }

    /**
     * 포인트 적립
     */
    async earnPoints(userId, amount, category = 'general', description = '포인트 적립', relatedId = null) {
        try {
            // 새로운 safe_earn_points 함수 사용 (트랜잭션 처리)
            const { data: transactionId, error } = await this.supabase
                .rpc('safe_earn_points', {
                    p_user_id: userId,
                    p_amount: Math.abs(amount),
                    p_category: category,
                    p_description: description,
                    p_related_id: relatedId
                });

            if (error) throw error;

            // 현재 포인트 잔액 조회
            const { data: balanceData } = await this.supabase
                .from('point_balances')
                .select('current_points')
                .eq('user_id', userId)
                .single();

            const newPoints = balanceData?.current_points || 0;

            console.log(`✅ 포인트 적립 성공: ${description} +${Math.abs(amount)}P (총 ${newPoints}P)`);
            
            return { 
                success: true, 
                newPoints: newPoints,
                amount: Math.abs(amount),
                description: description,
                transactionId: transactionId
            };
        } catch (error) {
            console.error('❌ 포인트 적립 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 포인트 차감
     */
    async spendPoints(userId, amount, category = 'general', description = '포인트 사용', relatedId = null) {
        try {
            // 새로운 safe_spend_points 함수 사용 (트랜잭션 처리, 잔액 확인 포함)
            const { data: transactionId, error } = await this.supabase
                .rpc('safe_spend_points', {
                    p_user_id: userId,
                    p_amount: Math.abs(amount),
                    p_category: category,
                    p_description: description,
                    p_related_id: relatedId
                });

            if (error) {
                // 포인트 부족 에러 처리
                if (error.message.includes('Insufficient points') || error.message.includes('insufficient_points')) {
                    throw new Error('포인트가 부족합니다.');
                }
                throw error;
            }

            // 현재 포인트 잔액 조회
            const { data: balanceData } = await this.supabase
                .from('point_balances')
                .select('current_points')
                .eq('user_id', userId)
                .single();

            const newPoints = balanceData?.current_points || 0;

            console.log(`✅ 포인트 차감 성공: ${description} -${Math.abs(amount)}P (남은 포인트: ${newPoints}P)`);
            
            return { 
                success: true, 
                newPoints: newPoints,
                amount: Math.abs(amount),
                description: description,
                transactionId: transactionId
            };
        } catch (error) {
            console.error('❌ 포인트 차감 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 포인트 내역 조회
     */
    async getPointHistory(userId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            // 새로운 point_transactions 테이블에서 직접 조회
            const { data, error } = await this.supabase
                .from('point_transactions')
                .select(`
                    id,
                    amount,
                    transaction_type,
                    category,
                    description,
                    related_id,
                    created_at
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            // 기존 형식에 맞게 데이터 변환
            const transformedData = data.map(transaction => ({
                id: transaction.id,
                user_id: userId,
                amount: transaction.transaction_type === 'spend' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
                type: transaction.category,
                description: transaction.description,
                related_id: transaction.related_id,
                created_at: transaction.created_at
            }));

            console.log(`✅ 포인트 내역 조회 성공: ${transformedData?.length || 0}건 (페이지: ${page})`);
            return { success: true, data: transformedData || [] };
        } catch (error) {
            console.error('❌ 포인트 내역 조회 실패:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * 현재 포인트 조회
     */
    async getCurrentPoints(userId) {
        try {
            const { data: balanceData, error } = await this.supabase
                .from('point_balances')
                .select('current_points, total_earned, total_spent, last_transaction_at')
                .eq('user_id', userId)
                .single();

            if (error) {
                // 포인트 잔액 레코드가 없으면 0으로 처리
                if (error.code === 'PGRST116') {
                    return { success: true, points: 0, total_earned: 0, total_spent: 0 };
                }
                throw error;
            }

            return { 
                success: true, 
                points: balanceData.current_points || 0,
                total_earned: balanceData.total_earned || 0,
                total_spent: balanceData.total_spent || 0,
                last_transaction_at: balanceData.last_transaction_at
            };
        } catch (error) {
            console.error('❌ 현재 포인트 조회 실패:', error);
            return { success: false, error: error.message, points: 0 };
        }
    }

    /**
     * 포인트 랭킹 조회
     */
    async getPointRanking(limit = 50) {
        try {
            // users 테이블과 point_balances 테이블을 조인하여 랭킹 조회
            const { data, error } = await this.supabase
                .from('users')
                .select(`
                    id,
                    username,
                    full_name,
                    profile_image_url,
                    point_balances(current_points),
                    user_badges(
                        badges(name, badge_type, color)
                    )
                `)
                .eq('is_active', true)
                .not('point_balances', 'is', null)
                .order('point_balances.current_points', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // 데이터 구조 변환 (기존 형식 유지)
            const transformedData = data.map(user => ({
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                points: user.point_balances?.[0]?.current_points || 0,
                profile_image_url: user.profile_image_url,
                user_badges: user.user_badges || []
            }));

            return { success: true, data: transformedData };
        } catch (error) {
            console.error('포인트 랭킹 조회 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 월간 포인트 랭킹 조회
     */
    async getMonthlyPointRanking(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const { data, error } = await this.supabase
                .from('point_transactions')
                .select(`
                    user_id,
                    amount,
                    users:user_id(username, profile_image_url)
                `)
                .eq('transaction_type', 'earn') // 적립 포인트만
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (error) throw error;

            // 사용자별 월간 적립 포인트 합계 계산
            const userPoints = {};
            data.forEach(record => {
                const userId = record.user_id;
                if (!userPoints[userId]) {
                    userPoints[userId] = {
                        userId,
                        username: record.users.username,
                        profileImage: record.users.profile_image_url,
                        monthlyPoints: 0
                    };
                }
                userPoints[userId].monthlyPoints += record.amount;
            });

            // 포인트 순으로 정렬
            const ranking = Object.values(userPoints)
                .sort((a, b) => b.monthlyPoints - a.monthlyPoints)
                .slice(0, 50);

            return { success: true, data: ranking };
        } catch (error) {
            console.error('월간 랭킹 조회 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 출석체크
     */
    async checkAttendance(userId) {
        try {
            // 새로운 process_daily_attendance 함수 사용
            const { data, error } = await this.supabase
                .rpc('process_daily_attendance', {
                    p_user_id: userId
                });

            if (error) {
                // 이미 출석한 경우
                if (error.message.includes('already_attended') || error.message.includes('Already attended')) {
                    return { success: false, error: '이미 출석체크를 완료했습니다.' };
                }
                throw error;
            }

            // 출석 결과 조회
            const today = new Date().toISOString().split('T')[0];
            const { data: attendanceData } = await this.supabase
                .from('attendance_records')
                .select('consecutive_days, points_earned')
                .eq('user_id', userId)
                .eq('attendance_date', today)
                .single();

            // 현재 포인트 조회
            const pointsResult = await this.getCurrentPoints(userId);

            // 연속 출석 뱃지 체크 (7일, 30일)
            if (attendanceData?.consecutive_days === 7) {
                // TODO: 뱃지 시스템 연동 (authService.awardBadge 구현 후)
                console.log('7일 연속 출석 뱃지 획득!');
            }
            if (attendanceData?.consecutive_days === 30) {
                console.log('30일 연속 출석 뱃지 획득!');
            }

            return { 
                success: true, 
                data: {
                    consecutiveDays: attendanceData?.consecutive_days || 1,
                    pointsEarned: attendanceData?.points_earned || 10,
                    totalPoints: pointsResult.points || 0
                }
            };
        } catch (error) {
            console.error('출석체크 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 이번 달 출석 현황 조회
     */
    async getMonthlyAttendance(userId, year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const { data, error } = await this.supabase
                .from('attendance_records')
                .select('attendance_date, consecutive_days, points_earned')
                .eq('user_id', userId)
                .gte('attendance_date', startDate.toISOString().split('T')[0])
                .lte('attendance_date', endDate.toISOString().split('T')[0])
                .order('attendance_date');

            if (error) throw error;

            // 기존 형식에 맞게 데이터 변환
            const transformedData = data.map(record => ({
                check_date: record.attendance_date,
                consecutive_days: record.consecutive_days,
                points_earned: record.points_earned
            }));

            return { success: true, data: transformedData };
        } catch (error) {
            console.error('월간 출석 현황 조회 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 포인트 상점 아이템 구매
     */
    async purchaseItem(itemId, cost) {
        try {
            if (!authService.isLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = authService.getCurrentUser();
            
            // 포인트 차감
            const result = await this.spendPoints(
                currentUser.id,
                cost,
                'shop',
                `포인트 상점 아이템 구매: ${itemId}`,
                itemId
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            // TODO: 아이템별 추가 처리 (뱃지 지급, 혜택 적용 등)
            
            return { success: true };
        } catch (error) {
            console.error('아이템 구매 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 포인트 선물하기
     */
    async giftPoints(receiverUsername, amount, message = '') {
        try {
            if (!authService.isLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = authService.getCurrentUser();
            
            // 받는 사람 조회
            const { data: receiver } = await this.supabase
                .from('users')
                .select('id, username')
                .eq('username', receiverUsername)
                .single();

            if (!receiver) {
                throw new Error('존재하지 않는 사용자입니다.');
            }

            if (receiver.id === currentUser.id) {
                throw new Error('자신에게는 포인트를 선물할 수 없습니다.');
            }

            // 새로운 safe_transfer_points 함수 사용 (원자적 트랜잭션)
            const { data: transactionId, error } = await this.supabase
                .rpc('safe_transfer_points', {
                    p_from_user: currentUser.id,
                    p_to_user: receiver.id,
                    p_amount: Math.abs(amount),
                    p_description: message || `포인트 선물 (${currentUser.username} → ${receiverUsername})`
                });

            if (error) {
                if (error.message.includes('insufficient_points') || error.message.includes('Insufficient points')) {
                    throw new Error('포인트가 부족합니다.');
                }
                throw error;
            }

            console.log(`✅ 포인트 선물 성공: ${currentUser.username} → ${receiverUsername} (${amount}P)`);
            
            return { 
                success: true, 
                transactionId: transactionId,
                message: `${receiverUsername}님에게 ${amount}P를 선물했습니다.`
            };
        } catch (error) {
            console.error('포인트 선물 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 데일리 미션 완료
     */
    async completeDailyMission(missionId, reward) {
        try {
            if (!authService.isLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = authService.getCurrentUser();
            const today = new Date().toISOString().split('T')[0];

            // 오늘 이미 완료했는지 확인
            const { data: existing } = await this.supabase
                .from('point_transactions')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('category', 'daily_mission')
                .eq('description', `데일리 미션 완료: ${missionId}`)
                .gte('created_at', `${today}T00:00:00.000Z`)
                .single();

            if (existing) {
                return { success: false, error: '이미 완료한 미션입니다.' };
            }

            // 포인트 적립
            const result = await this.earnPoints(
                currentUser.id,
                reward,
                'daily_mission',
                `데일리 미션 완료: ${missionId}`
            );

            return result;
        } catch (error) {
            console.error('데일리 미션 완료 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 포인트 부스터 사용
     */
    async useBooster(boosterType, duration = 3600) { // 기본 1시간
        try {
            if (!authService.isLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = authService.getCurrentUser();
            let cost = 0;
            let multiplier = 1.0;

            // 부스터 종류별 설정
            switch (boosterType) {
                case 'double':
                    cost = 500;
                    multiplier = 2.0;
                    break;
                case 'triple':
                    cost = 1000;
                    multiplier = 3.0;
                    break;
                case 'mega':
                    cost = 2000;
                    multiplier = 5.0;
                    break;
                default:
                    throw new Error('잘못된 부스터 타입입니다.');
            }

            // 포인트 차감
            const result = await this.spendPoints(
                currentUser.id,
                cost,
                'shop',
                `${boosterType} 부스터 사용 (${duration/60}분)`
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            // 부스터 효과 로컬스토리지에 저장
            const boosterData = {
                type: boosterType,
                multiplier,
                startTime: Date.now(),
                duration: duration * 1000, // 밀리초로 변환
                endTime: Date.now() + (duration * 1000)
            };

            localStorage.setItem('activeBooster', JSON.stringify(boosterData));

            return { success: true, data: boosterData };
        } catch (error) {
            console.error('부스터 사용 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 활성 부스터 확인
     */
    getActiveBooster() {
        try {
            const boosterData = localStorage.getItem('activeBooster');
            if (!boosterData) return null;

            const booster = JSON.parse(boosterData);
            
            // 만료 확인
            if (Date.now() > booster.endTime) {
                localStorage.removeItem('activeBooster');
                return null;
            }

            return booster;
        } catch (error) {
            localStorage.removeItem('activeBooster');
            return null;
        }
    }

    /**
     * 부스터 적용된 포인트 계산
     */
    calculateBoostedPoints(basePoints) {
        const booster = this.getActiveBooster();
        if (!booster) return basePoints;

        return Math.floor(basePoints * booster.multiplier);
    }

    /**
     * 포인트 상점 아이템 목록
     */
    getShopItems() {
        return [
            {
                id: 'booster_double',
                name: '2배 부스터',
                description: '1시간 동안 포인트 2배 획득',
                cost: 500,
                type: 'booster',
                icon: 'fas fa-bolt'
            },
            {
                id: 'booster_triple',
                name: '3배 부스터',
                description: '1시간 동안 포인트 3배 획득',
                cost: 1000,
                type: 'booster',
                icon: 'fas fa-fire'
            },
            {
                id: 'profile_frame',
                name: '프로필 테두리',
                description: '특별한 프로필 테두리',
                cost: 2000,
                type: 'cosmetic',
                icon: 'fas fa-crown'
            },
            {
                id: 'nickname_color',
                name: '닉네임 색상',
                description: '닉네임 색상 변경권',
                cost: 1500,
                type: 'cosmetic',
                icon: 'fas fa-palette'
            },
            {
                id: 'post_highlight',
                name: '게시글 강조',
                description: '게시글 24시간 강조 표시',
                cost: 800,
                type: 'feature',
                icon: 'fas fa-star'
            },
            {
                id: 'ad_skip',
                name: '광고 스킵권',
                description: '미니게임 광고 스킵 10회',
                cost: 300,
                type: 'feature',
                icon: 'fas fa-forward'
            }
        ];
    }

    /**
     * 포인트 내역 HTML 렌더링
     */
    renderPointHistory(historyData) {
        return historyData.map(item => {
            const date = new Date(item.created_at).toLocaleString('ko-KR');
            const amountClass = item.amount > 0 ? 'point-earn' : 'point-spend';
            const amountText = item.amount > 0 ? `+${item.amount}` : item.amount;
            const icon = this.getPointIcon(item.type);

            return `
                <div class="point-history-item">
                    <div class="point-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="point-info">
                        <div class="point-description">${item.description}</div>
                        <div class="point-date">${date}</div>
                    </div>
                    <div class="point-amount ${amountClass}">${amountText}P</div>
                </div>
            `;
        }).join('');
    }

    /**
     * 포인트 타입별 아이콘
     */
    getPointIcon(type) {
        const icons = {
            'earn': 'fas fa-plus-circle',
            'spend': 'fas fa-minus-circle',
            'daily_mission': 'fas fa-calendar-check',
            'admin': 'fas fa-crown',
            'bonus': 'fas fa-gift',
            'attendance': 'fas fa-calendar-check',
            'post': 'fas fa-edit',
            'comment': 'fas fa-comment',
            'like': 'fas fa-heart',
            'download': 'fas fa-download',
            'upload': 'fas fa-upload'
        };
        return icons[type] || 'fas fa-coins';
    }

    /**
     * 포인트 랭킹 HTML 렌더링
     */
    renderRankingList(rankingData) {
        return rankingData.map((user, index) => {
            const rank = index + 1;
            const badges = user.user_badges || [];
            let rankClass = '';
            let rankIcon = '';

            // 랭킹별 스타일
            if (rank === 1) {
                rankClass = 'rank-gold';
                rankIcon = '🥇';
            } else if (rank === 2) {
                rankClass = 'rank-silver';
                rankIcon = '🥈';
            } else if (rank === 3) {
                rankClass = 'rank-bronze';
                rankIcon = '🥉';
            }

            return `
                <div class="ranking-item ${rankClass}">
                    <div class="rank-number">${rankIcon || rank}</div>
                    <div class="user-info">
                        <img src="${user.profile_image_url || '/images/default-avatar.png'}" 
                             alt="${user.username}" class="user-avatar">
                        <div class="user-details">
                            <span class="username">${user.username}</span>
                            <div class="user-badges">
                                ${this.renderUserBadges(badges)}
                            </div>
                        </div>
                    </div>
                    <div class="user-points">${user.points.toLocaleString()}P</div>
                </div>
            `;
        }).join('');
    }

    /**
     * 사용자 뱃지 렌더링
     */
    renderUserBadges(badges) {
        return badges.slice(0, 2).map(badgeData => {
            const badge = badgeData.badges;
            const style = badge.badge_type === 'premium' 
                ? `background: ${badge.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
                : `color: ${badge.color};`;
            
            return `<span class="badge ${badge.badge_type}" style="${style}">ㅣ${badge.name}ㅣ</span>`;
        }).join('');
    }
}

// 전역 포인트 서비스 인스턴스 생성
const pointService = new PointService();

// 페이지 로드 시 초기화
window.addEventListener('load', async () => {
    await pointService.init();
});

// 전역 접근 가능하도록 설정
window.pointService = pointService;