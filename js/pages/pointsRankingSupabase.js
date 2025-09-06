/**
 * WAVE SPACE - 포인트 랭킹 페이지 Supabase 연동
 * 실시간 포인트 랭킹 및 리더보드 시스템
 */

import { supabase } from '../config/supabase.js';
// authService는 전역 변수로 사용됨

class PointsRankingManager {
    constructor() {
        this.currentUser = null;
        this.rankings = [];
        this.currentPeriod = 'all';
        this.currentRankingType = 'points';
        this.userRank = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            // 전역 authService를 사용
            if (window.authService) {
                await window.authService.init();
                this.currentUser = await window.authService.getCurrentUser();
            }
            
            this.setupEventListeners();
            await this.loadRankings();
            await this.loadUserRank();
            this.updateAuthUI();
            this.setupRealtimeSubscription();
        } catch (error) {
            console.error('포인트 랭킹 페이지 초기화 오류:', error);
        }
    }

    setupEventListeners() {
        // 기간 필터
        const periodBtns = document.querySelectorAll('.period-btn, .time-filter');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period || 'all';
                this.filterByPeriod(period);
            });
        });

        // 랭킹 타입 필터
        const typeBtns = document.querySelectorAll('.ranking-type-btn');
        typeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type || 'points';
                this.filterByType(type);
            });
        });

        // 내 랭킹 보기
        const myRankBtn = document.querySelector('.my-rank-btn');
        if (myRankBtn) {
            myRankBtn.addEventListener('click', () => this.scrollToMyRank());
        }
    }

    async updateAuthUI() {
        const userInfo = document.querySelector('.user-info, .current-user-rank');
        
        if (this.currentUser) {
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-profile-ranking">
                        <img src="${this.currentUser.profile_image_url || '/assets/default-avatar.png'}" 
                             alt="프로필" class="profile-avatar">
                        <div class="user-details">
                            <span class="username">${this.currentUser.username}</span>
                            <span class="user-points">${this.formatNumber(this.currentUser.points || 0)} P</span>
                            ${this.userRank ? `<span class="user-rank-position">${this.userRank}위</span>` : ''}
                        </div>
                    </div>
                `;
            }
        } else {
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="login-required">
                        <p>내 랭킹을 확인하려면 로그인하세요.</p>
                        <a href="login.html" class="btn btn-primary">로그인</a>
                    </div>
                `;
            }
        }
    }

    async loadRankings() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoading();

            let query = supabase
                .from('users')
                .select(`
                    id,
                    username,
                    profile_image_url,
                    points,
                    total_posts,
                    total_likes_received,
                    join_date,
                    user_badges (
                        badges (
                            name,
                            image_url,
                            rarity
                        )
                    )
                `)
                .order(this.getRankingOrderField(), { ascending: false })
                .limit(100);

            // 기간 필터 적용
            if (this.currentPeriod !== 'all') {
                const dateFilter = this.getDateFilter(this.currentPeriod);
                if (dateFilter) {
                    query = query.gte('join_date', dateFilter);
                }
            }

            const { data: users, error } = await query;

            if (error) throw error;

            // 랭킹 번호 추가
            this.rankings = users.map((user, index) => ({
                ...user,
                rank: index + 1
            }));

            this.renderRankings();
            
            // 내 순위 정보 업데이트
            this.updateMyRankingInfo();

        } catch (error) {
            console.error('랭킹 로딩 오류:', error);
            this.showError('랭킹 정보를 불러올 수 없습니다.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async loadUserRank() {
        if (!this.currentUser) return;

        try {
            // 전체 사용자 중 현재 사용자의 순위 계산
            const { data: userRankData, error } = await supabase.rpc('get_user_rank', {
                user_id: this.currentUser.id,
                ranking_type: this.currentRankingType,
                time_period: this.currentPeriod
            });

            if (error) throw error;

            this.userRank = userRankData?.rank || null;
            this.updateUserRankDisplay();

        } catch (error) {
            console.error('사용자 랭킹 조회 오류:', error);
        }
    }

    renderTop3() {
        const top3 = this.rankings.slice(0, 3);
        
        // 1위 렌더링
        const rank1Element = document.getElementById('rank-1');
        if (rank1Element) {
            if (top3[0]) {
                const user = top3[0];
                rank1Element.innerHTML = `
                    <div class="rank-number">1</div>
                    <div class="user-avatar-container">
                        <div class="user-avatar">
                            <span>${user.username ? user.username.charAt(0) : '?'}</span>
                        </div>
                        <div class="membership-type">${this.getMembershipType(user)}</div>
                    </div>
                    <div class="user-info">
                        <div class="nickname">${user.username || '익명'}</div>
                        <div class="representative-badge-text">
                            <span class="badge-name">${this.getRepresentativeBadge(user)}</span>
                        </div>
                        <div class="points-info">${this.formatNumber(user.points || 0)}P</div>
                    </div>
                    <div class="crown-decoration">
                        <i class="fas fa-crown"></i>
                    </div>
                `;
                rank1Element.style.display = 'flex';
            } else {
                rank1Element.innerHTML = `
                    <div class="rank-number">1</div>
                    <div class="empty-rank">
                        <div class="empty-message">아직 1위가 없습니다</div>
                        <div class="empty-subtext">첫 번째 왕관의 주인이 되어보세요!</div>
                    </div>
                `;
                rank1Element.style.display = 'flex';
            }
        }

        // 2위 렌더링
        const rank2Element = document.getElementById('rank-2');
        if (rank2Element) {
            if (top3[1]) {
                const user = top3[1];
                rank2Element.innerHTML = `
                    <div class="rank-number">2</div>
                    <div class="user-avatar-container">
                        <div class="user-avatar">
                            <span>${user.username ? user.username.charAt(0) : '?'}</span>
                        </div>
                        <div class="membership-type">${this.getMembershipType(user)}</div>
                    </div>
                    <div class="user-info">
                        <div class="nickname">${user.username || '익명'}</div>
                        <div class="representative-badge-text">
                            <span class="badge-name">${this.getRepresentativeBadge(user)}</span>
                        </div>
                        <div class="points-info">${this.formatNumber(user.points || 0)}P</div>
                    </div>
                `;
                rank2Element.style.display = 'flex';
            } else {
                rank2Element.innerHTML = `
                    <div class="rank-number">2</div>
                    <div class="empty-rank">
                        <div class="empty-message">2위 자리 비어있음</div>
                        <div class="empty-subtext">은메달을 노려보세요!</div>
                    </div>
                `;
                rank2Element.style.display = 'flex';
            }
        }

        // 3위 렌더링
        const rank3Element = document.getElementById('rank-3');
        if (rank3Element) {
            if (top3[2]) {
                const user = top3[2];
                rank3Element.innerHTML = `
                    <div class="rank-number">3</div>
                    <div class="user-avatar-container">
                        <div class="user-avatar">
                            <span>${user.username ? user.username.charAt(0) : '?'}</span>
                        </div>
                        <div class="membership-type">${this.getMembershipType(user)}</div>
                    </div>
                    <div class="user-info">
                        <div class="nickname">${user.username || '익명'}</div>
                        <div class="representative-badge-text">
                            <span class="badge-name">${this.getRepresentativeBadge(user)}</span>
                        </div>
                        <div class="points-info">${this.formatNumber(user.points || 0)}P</div>
                    </div>
                `;
                rank3Element.style.display = 'flex';
            } else {
                rank3Element.innerHTML = `
                    <div class="rank-number">3</div>
                    <div class="empty-rank">
                        <div class="empty-message">3위 자리 비어있음</div>
                        <div class="empty-subtext">동메달의 기회!</div>
                    </div>
                `;
                rank3Element.style.display = 'flex';
            }
        }
    }

    getMembershipType(user) {
        // 사용자 정보에 따른 멤버십 타입 반환
        if (user.member_type) return user.member_type;
        if (user.total_posts > 100) return '분양기획';
        if (user.total_posts > 50) return '분양영업';
        return '일반회원';
    }

    getRepresentativeBadge(user) {
        // 사용자의 대표 뱃지 반환
        if (user.user_badges && user.user_badges.length > 0) {
            const topBadge = user.user_badges
                .sort((a, b) => this.getBadgeRarityScore(b.badges.rarity) - this.getBadgeRarityScore(a.badges.rarity))[0];
            return `ㅣ${topBadge.badges.name}ㅣ`;
        }
        
        // 기본 뱃지
        if (user.rank === 1) return 'ㅣ우승자ㅣ';
        if (user.rank === 2) return 'ㅣ준우승ㅣ';
        if (user.rank === 3) return 'ㅣ동메달리스트ㅣ';
        return 'ㅣ뉴비ㅣ';
    }

    renderRankings() {
        // TOP 3 먼저 렌더링
        this.renderTop3();
        
        const container = document.querySelector('.ranking-list, .rankings-container, #rankingTableBody');
        if (!container) return;

        if (this.rankings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <h3>랭킹 정보가 없습니다</h3>
                    <p>포인트를 모아 랭킹에 도전해보세요!</p>
                </div>
            `;
            return;
        }

        // 4위부터 100위까지만 테이블에 표시
        const tableRankings = this.rankings.slice(3);
        
        const rankingsHTML = tableRankings.map(user => `
            <div class="ranking-item ${this.currentUser?.id === user.id ? 'current-user' : ''}" 
                 data-user-id="${user.id}">
                <div class="rank-position">
                    <span class="rank-number ${this.getRankClass(user.rank)}">
                        ${this.getRankDisplay(user.rank)}
                    </span>
                </div>

                <div class="user-profile">
                    <img src="${user.profile_image_url || '/assets/default-avatar.png'}" 
                         alt="${user.username}" class="profile-avatar">
                    <div class="user-info">
                        <div class="username">${user.username}</div>
                        <div class="user-badges">
                            ${this.renderUserBadges(user.user_badges)}
                        </div>
                        <div class="join-date">가입: ${this.formatDate(user.join_date)}</div>
                    </div>
                </div>

                <div class="ranking-stats">
                    <div class="stat-item">
                        <span class="stat-label">포인트</span>
                        <span class="stat-value primary">${this.formatNumber(user.points || 0)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">게시글</span>
                        <span class="stat-value">${this.formatNumber(user.total_posts || 0)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">받은 좋아요</span>
                        <span class="stat-value">${this.formatNumber(user.total_likes_received || 0)}</span>
                    </div>
                </div>

                <div class="ranking-actions">
                    ${this.currentUser && this.currentUser.id !== user.id ? `
                        <button class="btn btn-sm btn-secondary follow-btn" 
                                onclick="pointsRankingManager.toggleFollow('${user.id}')">
                            <i class="fas fa-user-plus"></i> 팔로우
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline view-profile-btn" 
                            onclick="pointsRankingManager.viewProfile('${user.id}')">
                        <i class="fas fa-user"></i> 프로필
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = rankingsHTML;
        this.highlightCurrentUser();
    }

    renderUserBadges(userBadges) {
        if (!userBadges || userBadges.length === 0) return '';
        
        // 최고 등급 배지 3개만 표시
        const topBadges = userBadges
            .sort((a, b) => this.getBadgeRarityScore(b.badges.rarity) - this.getBadgeRarityScore(a.badges.rarity))
            .slice(0, 3);

        return topBadges.map(userBadge => `
            <span class="badge badge-${userBadge.badges.rarity}" title="${userBadge.badges.name}">
                <img src="${userBadge.badges.image_url}" alt="${userBadge.badges.name}" />
            </span>
        `).join('');
    }

    getBadgeRarityScore(rarity) {
        const scores = {
            'legendary': 5,
            'epic': 4,
            'rare': 3,
            'uncommon': 2,
            'common': 1
        };
        return scores[rarity] || 0;
    }

    async filterByPeriod(period) {
        this.currentPeriod = period;
        
        // 필터 버튼 활성화 업데이트
        document.querySelectorAll('.period-btn, .time-filter').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.period === period) {
                btn.classList.add('active');
            }
        });

        await this.loadRankings();
        await this.loadUserRank();
    }

    async filterByType(type) {
        this.currentRankingType = type;
        
        // 필터 버튼 활성화 업데이트
        document.querySelectorAll('.ranking-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });

        await this.loadRankings();
        await this.loadUserRank();
    }

    getRankingOrderField() {
        const fieldMap = {
            'points': 'points',
            'posts': 'total_posts',
            'likes': 'total_likes_received',
            'activity': 'last_active_at'
        };
        return fieldMap[this.currentRankingType] || 'points';
    }

    getDateFilter(period) {
        const now = new Date();
        const filters = {
            'daily': new Date(now.setDate(now.getDate() - 1)),
            'weekly': new Date(now.setDate(now.getDate() - 7)),
            'monthly': new Date(now.setMonth(now.getMonth() - 1)),
            'yearly': new Date(now.setFullYear(now.getFullYear() - 1))
        };
        
        return filters[period]?.toISOString() || null;
    }

    scrollToMyRank() {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        const myRankingItem = document.querySelector(`[data-user-id="${this.currentUser.id}"]`);
        if (myRankingItem) {
            myRankingItem.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            myRankingItem.classList.add('highlight');
            setTimeout(() => {
                myRankingItem.classList.remove('highlight');
            }, 3000);
        } else {
            this.showNotification('내 랭킹이 현재 페이지에 없습니다.');
        }
    }

    highlightCurrentUser() {
        if (!this.currentUser) return;

        const userElement = document.querySelector(`[data-user-id="${this.currentUser.id}"]`);
        if (userElement) {
            userElement.classList.add('current-user');
        }
    }

    async toggleFollow(targetUserId) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const { data: follow, error: checkError } = await supabase
                .from('user_follows')
                .select('*')
                .eq('follower_id', this.currentUser.id)
                .eq('following_id', targetUserId)
                .single();

            if (follow) {
                // 언팔로우
                const { error } = await supabase
                    .from('user_follows')
                    .delete()
                    .eq('follower_id', this.currentUser.id)
                    .eq('following_id', targetUserId);

                if (error) throw error;
                this.showSuccess('팔로우를 취소했습니다.');
            } else {
                // 팔로우
                const { error } = await supabase
                    .from('user_follows')
                    .insert({
                        follower_id: this.currentUser.id,
                        following_id: targetUserId,
                        created_at: new Date().toISOString()
                    });

                if (error) throw error;
                this.showSuccess('팔로우했습니다.');
            }

            // UI 업데이트
            this.updateFollowUI(targetUserId);

        } catch (error) {
            console.error('팔로우 처리 오류:', error);
            this.showError('팔로우 처리 중 오류가 발생했습니다.');
        }
    }

    updateFollowUI(targetUserId) {
        const userElement = document.querySelector(`[data-user-id="${targetUserId}"]`);
        const followBtn = userElement?.querySelector('.follow-btn');
        
        if (followBtn) {
            const isFollowing = followBtn.classList.contains('following');
            if (isFollowing) {
                followBtn.innerHTML = '<i class="fas fa-user-plus"></i> 팔로우';
                followBtn.classList.remove('following');
            } else {
                followBtn.innerHTML = '<i class="fas fa-user-check"></i> 팔로잉';
                followBtn.classList.add('following');
            }
        }
    }

    viewProfile(userId) {
        // 사용자 프로필을 마이페이지 사이드패널로 표시
        if (window.authService && typeof window.authService.openProfileSidepanel === 'function') {
            window.authService.openProfileSidepanel();
        } else {
            if (window.showToast) {
                window.showToast('프로필 기능을 사용할 수 없습니다.', 'error');
            }
        }
    }

    updateUserRankDisplay() {
        const userRankElements = document.querySelectorAll('.user-rank-position, .my-current-rank');
        userRankElements.forEach(el => {
            if (this.userRank) {
                el.textContent = `${this.userRank}위`;
                el.style.display = 'inline';
            } else {
                el.style.display = 'none';
            }
        });
    }

    setupRealtimeSubscription() {
        // 실시간 포인트 변경 알림 (상위 100명)
        const rankingChannel = supabase
            .channel('ranking-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users'
                },
                (payload) => {
                    console.log('사용자 포인트 업데이트:', payload.new);
                    this.handleUserUpdate(payload.new);
                }
            )
            .subscribe();

        // 새 사용자 등록 알림
        const newUserChannel = supabase
            .channel('new-users')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'users'
                },
                (payload) => {
                    console.log('새 사용자 등록:', payload.new);
                    this.handleNewUser(payload.new);
                }
            )
            .subscribe();
    }

    handleUserUpdate(updatedUser) {
        // 랭킹 목록에서 해당 사용자 업데이트
        const userIndex = this.rankings.findIndex(user => user.id === updatedUser.id);
        if (userIndex !== -1) {
            this.rankings[userIndex] = { ...this.rankings[userIndex], ...updatedUser };
            
            // 포인트 변경으로 인한 순위 변경 가능성이 있으므로 전체 랭킹 새로고침
            this.loadRankings();
        }

        // 현재 사용자인 경우 포인트 업데이트
        if (this.currentUser && updatedUser.id === this.currentUser.id) {
            this.currentUser.points = updatedUser.points;
            this.loadUserRank();
        }
    }

    handleNewUser(newUser) {
        this.showNotification('새로운 멤버가 WAVE SPACE에 가입했습니다!');
        // 랭킹 목록이 100명 미만이면 새로고침
        if (this.rankings.length < 100) {
            this.loadRankings();
        }
    }

    // 내 순위 정보 업데이트
    updateMyRankingInfo() {
        const myRankDisplay = document.getElementById('myRankDisplay');
        const myPointsDisplay = document.getElementById('myPointsDisplay');
        const myChangeDisplay = document.getElementById('myChangeDisplay');

        if (!myRankDisplay || !myPointsDisplay || !myChangeDisplay) return;

        // 로그인 체크
        if (!this.currentUser) {
            myRankDisplay.textContent = '로그인 필요';
            myPointsDisplay.textContent = '0P';
            myChangeDisplay.innerHTML = `
                <span class="change-icon">-</span>
                <span class="change-value">0위</span>
                <span class="change-desc">(전일대비)</span>
            `;
            return;
        }

        // 내 순위 찾기
        const myRanking = this.rankings.find(user => user.id === this.currentUser.id);
        
        if (myRanking) {
            // 순위가 있는 경우
            myRankDisplay.textContent = `${myRanking.rank}위`;
            myPointsDisplay.textContent = `${this.formatNumber(myRanking.points || 0)}P`;
            
            // 순위 변동 표시 (현재는 기본값)
            myChangeDisplay.innerHTML = `
                <span class="change-icon">-</span>
                <span class="change-value">0위</span>
                <span class="change-desc">(전일대비)</span>
            `;
        } else {
            // 순위가 없는 경우 (101위 이하)
            myRankDisplay.textContent = '순위 없음';
            myPointsDisplay.textContent = `${this.formatNumber(this.currentUser.points || 0)}P`;
            myChangeDisplay.innerHTML = `
                <span class="change-icon">-</span>
                <span class="change-value">0위</span>
                <span class="change-desc">(전일대비)</span>
            `;
        }
    }

    getRankClass(rank) {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        if (rank <= 10) return 'top-ten';
        return '';
    }

    getRankDisplay(rank) {
        if (rank === 1) return '👑';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    }

    async exportRankings() {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            // CSV 형태로 랭킹 데이터 내보내기
            const csvData = this.rankings.map(user => [
                user.rank,
                user.username,
                user.points || 0,
                user.total_posts || 0,
                user.total_likes_received || 0,
                this.formatDate(user.join_date)
            ]);

            const csvContent = [
                ['순위', '사용자명', '포인트', '게시글 수', '받은 좋아요', '가입일'],
                ...csvData
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `ranking_${this.currentPeriod}_${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccess('랭킹 데이터를 내보냈습니다.');

        } catch (error) {
            console.error('랭킹 내보내기 오류:', error);
            this.showError('랭킹 내보내기 중 오류가 발생했습니다.');
        }
    }

    // 유틸리티 함수들
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    }

    showLoading() {
        const loadingEl = document.querySelector('.loading, .ranking-loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingEl = document.querySelector('.loading, .ranking-loading');
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
window.pointsRankingManager = new PointsRankingManager();

// 기존 points-ranking.js와의 호환성을 위한 전역 함수들
window.filterByPeriod = (period) => window.pointsRankingManager.filterByPeriod(period);
window.filterByType = (type) => window.pointsRankingManager.filterByType(type);
window.toggleFollow = (userId) => window.pointsRankingManager.toggleFollow(userId);
window.viewProfile = (userId) => window.pointsRankingManager.viewProfile(userId);
window.exportRankings = () => window.pointsRankingManager.exportRankings();

// 포인트 랭킹 페이지에서만 자동 초기화
if (window.location.pathname.includes('points-ranking.html')) {
    // Supabase 초기화 완료를 기다린 후 초기화
    const initPointsRanking = () => {
        if (window.supabase) {
            console.log('[PointsRanking] 포인트 랭킹 시스템 초기화 시작...');
            window.pointsRankingManager.init();
        } else {
            // Supabase가 아직 준비되지 않았다면 잠시 후 재시도
            setTimeout(initPointsRanking, 100);
        }
    };
    
    // DOM이 완전히 로드된 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPointsRanking);
    } else {
        initPointsRanking();
    }
}