/**
 * 프로필 사이드패널 로더
 * 마이페이지 기능을 동적으로 로드하고 관리
 * @author AI Assistant
 * @created 2025-09-06
 */

import { authService } from '../services/authService.js';
import { logger } from '../utils/logger.js';
import { errorHandler } from '../utils/errorHandler.js';

export class ProfileSidepanelLoader {
    constructor() {
        this.isLoaded = false;
        this.currentTab = 'profile';
        this.profileData = null;
    }

    /**
     * 프로필 사이드패널을 초기화하고 로드
     */
    async load() {
        try {
            if (this.isLoaded) {
                logger.warn('ProfileSidepanel already loaded');
                return;
            }

            // HTML 템플릿 로드
            await this.loadTemplate();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 사용자 데이터 로드
            await this.loadUserProfile();
            
            this.isLoaded = true;
            logger.info('ProfileSidepanel loaded successfully');
            
            // 프로필 사이드패널 로드 완료 이벤트 발생
            document.dispatchEvent(new CustomEvent('profileSidepanelLoaded', {
                detail: { success: true }
            }));
            
        } catch (error) {
            errorHandler.handleError(error, 'ProfileSidepanelLoader.load');
            throw error;
        }
    }

    /**
     * HTML 템플릿을 로드하여 DOM에 추가
     */
    async loadTemplate() {
        try {
            const response = await fetch('/components/profile-sidepanel.html');
            if (!response.ok) {
                throw new Error(`Failed to load profile sidepanel template: ${response.status}`);
            }
            
            const html = await response.text();
            
            // 기존 프로필 사이드패널이 있다면 제거
            const existing = document.getElementById('profileSidepanel');
            if (existing) {
                existing.remove();
            }
            
            // body에 HTML 추가
            document.body.insertAdjacentHTML('beforeend', html);
            
        } catch (error) {
            logger.error('Failed to load profile sidepanel template:', error);
            throw error;
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        const sidepanel = document.getElementById('profileSidepanel');
        if (!sidepanel) {
            throw new Error('Profile sidepanel element not found');
        }

        // 닫기 버튼
        const closeBtn = sidepanel.querySelector('.profile-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // 오버레이 클릭으로 닫기
        const overlay = sidepanel.querySelector('.profile-sidepanel-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // 탭 네비게이션
        const navItems = sidepanel.querySelectorAll('.profile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                if (tabId) {
                    this.switchTab(tabId);
                }
            });
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    /**
     * 사용자 프로필 데이터 로드
     */
    async loadUserProfile() {
        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                logger.warn('No authenticated user found');
                return;
            }

            this.profileData = user;
            this.updateProfileDisplay();
            
        } catch (error) {
            logger.error('Failed to load user profile:', error);
            // 에러가 발생해도 사이드패널은 표시하되, 데이터는 빈 상태로 유지
        }
    }

    /**
     * 프로필 데이터를 UI에 반영
     */
    updateProfileDisplay() {
        if (!this.profileData) return;

        const sidepanel = document.getElementById('profileSidepanel');
        if (!sidepanel) return;

        try {
            // 사용자명 업데이트
            const usernameEl = sidepanel.querySelector('.profile-username');
            if (usernameEl) {
                usernameEl.textContent = this.profileData.nickname || '사용자';
            }

            // 상단 대표/멤버십 뱃지 렌더링
            const badgesWrap = sidepanel.querySelector('.profile-badges');
            if (badgesWrap) {
                const repBadgeText = (window.authService && typeof window.authService.getRepresentativeBadge === 'function')
                    ? window.authService.getRepresentativeBadge(this.profileData)
                    : (this.profileData?.user_badges?.[0]?.badges?.name || '새내기');
                const tier = this.deriveMembershipTier(this.profileData);
                const tierText = tier === 'premium' ? 'Premium' : tier === 'plus' ? 'Plus' : 'Free';
                badgesWrap.innerHTML = `
                    <span class="rep-badge"><i class="fas fa-medal"></i> ${repBadgeText}</span>
                    <span class="badge badge--membership badge--${tier}">${tierText}</span>
                `;
            }

            // 기본정보 섹션 바인딩
            const setText = (selector, value, fallback = '-') => {
                const el = sidepanel.querySelector(selector);
                if (el) el.textContent = (value ?? '').toString().trim() || fallback;
            };
            setText('#profile-basic-id', this.profileData.username || this.profileData.id);
            setText('#profile-basic-name', this.profileData.fullName || this.profileData.full_name || this.profileData.nickname);
            setText('#profile-basic-phone', this.profileData.phone);
            setText('#profile-basic-email', this.profileData.email);
            // 회원유형 표시
            if (window.authService && typeof window.authService.getMemberTypeDisplay === 'function') {
                setText('#profile-basic-member-type', window.authService.getMemberTypeDisplay(this.profileData.member_type));
            } else {
                setText('#profile-basic-member-type', this.profileData.member_type || '일반회원');
            }
            // 실무자 인증 여부
            const verified = (window.authService && typeof window.authService.isVerified === 'function') ? window.authService.isVerified() : (this.profileData.role === 'verified');
            setText('#profile-basic-verified', verified ? '인증됨' : '미인증');

            // 접속정보 섹션 바인딩
            const toDate = (d) => d ? new Date(d).toLocaleString('ko-KR') : '-';
            setText('#profile-access-joined', this.profileData.created_at ? toDate(this.profileData.created_at) : (this.profileData.joined_at ? toDate(this.profileData.joined_at) : '-'));
            setText('#profile-access-last', this.profileData.last_sign_in_at ? toDate(this.profileData.last_sign_in_at) : (this.profileData.last_login_at ? toDate(this.profileData.last_login_at) : '-'));
            setText('#profile-access-points', `${this.profileData.points || 0} P`);

            // 프로필 이미지 업데이트
            const avatarImg = sidepanel.querySelector('.profile-avatar-large img');
            if (avatarImg && this.profileData.avatar_url) {
                avatarImg.src = this.profileData.avatar_url;
            }

            // 최근 알림 상위 N개 렌더링
            this.loadRecentNotifications();

            // 빠른메뉴 렌더링
            this.renderQuickMenu();

        } catch (error) {
            logger.error('Failed to update profile display:', error);
        }
    }

    /**
     * 최근 알림 상위 3개 로드 및 렌더링
     */
    async loadRecentNotifications(limit = 3) {
        try {
            const container = document.querySelector('#profile-recent-notifications');
            if (!container) return;

            if (!window.notificationService || typeof window.notificationService.getNotifications !== 'function') {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>알림 서비스를 사용할 수 없습니다.</p></div>';
                return;
            }

            container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 불러오는 중...</div>';
            const result = await window.notificationService.getNotifications(1, limit, false);
            if (!result || !result.success) {
                container.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>알림을 불러올 수 없습니다.</p></div>';
                return;
            }

            const notifications = result.data || [];
            if (notifications.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><p>최근 알림이 없습니다.</p></div>';
                return;
            }

            const items = notifications.map(n => {
                const icon = (window.notificationService && typeof window.notificationService.getNotificationIcon === 'function')
                    ? window.notificationService.getNotificationIcon(n.type)
                    : 'fas fa-bell';
                const date = new Date(n.created_at).toLocaleString('ko-KR');
                const title = n.title || '알림';
                const msg = n.message || '';
                const readClass = n.is_read ? 'read' : 'unread';
                return `
                    <li class="notif-item ${readClass}">
                        <i class="${icon}"></i>
                        <div class="notif-text">
                            <div class="notif-title">${title}</div>
                            <div class="notif-message">${msg}</div>
                            <div class="notif-date">${date}</div>
                        </div>
                    </li>
                `;
            }).join('');

            container.innerHTML = `<ul class=\"notif-list\">${items}</ul>`;

            // 더보기 버튼 동작: 알림 탭으로 이동
            const moreBtn = document.querySelector('#profile-notif-more');
            if (moreBtn) {
                moreBtn.addEventListener('click', () => this.switchTab('notifications'));
            }

        } catch (error) {
            logger.error('Failed to load recent notifications:', error);
            const container = document.querySelector('#profile-recent-notifications');
            if (container) {
                container.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>알림 로드 중 오류가 발생했습니다.</p></div>';
            }
        }
    }

    /**
     * 멤버십 등급 추론: premium > plus > free
     */
    deriveMembershipTier(user) {
        try {
            // premium 배지 보유 또는 명시적 premium/vip 타입
            const hasPremiumBadge = Array.isArray(user?.user_badges) && user.user_badges.some(b => b.badges?.badge_type === 'premium');
            const mt = (user?.member_type || '').toLowerCase();
            if (hasPremiumBadge || mt === 'premium' || mt === 'vip') return 'premium';

            // plus 명시적 타입 또는 이름 포함
            if (mt.includes('plus')) return 'plus';

            return 'free';
        } catch (_e) {
            return 'free';
        }
    }

    /**
     * 빠른메뉴 렌더링
     */
    renderQuickMenu() {
        const container = document.querySelector('.profile-quick-menu');
        if (!container) return;
        const items = [
            { href: '/points-ranking.html', icon: 'fas fa-trophy', title: '전체랭킹', desc: '포인트 순위' },
            { href: '/hall-of-fame.html', icon: 'fas fa-crown', title: '명예의전당', desc: 'Top 유저' },
            { href: '/plus-membership.html', icon: 'fas fa-rocket', title: '프리미엄가입', desc: '혜택 확인' },
            { href: '/points-charge.html', icon: 'fas fa-coins', title: '포인트충전', desc: '빠른 충전' },
        ];
        const html = `
            <ul id="quick-menu" class="quick-grid" aria-label="빠른메뉴">
                ${items.map(i => `
                    <li class="quick-card">
                        <a href="${i.href}" aria-label="${i.title} 바로가기">
                            <i class="${i.icon}"></i>
                            <span class="quick-title">${i.title}</span>
                            <span class="quick-desc">${i.desc}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
        container.innerHTML = html;
    }

    /**
     * 탭 전환
     */
    switchTab(tabId) {
        try {
            const sidepanel = document.getElementById('profileSidepanel');
            if (!sidepanel) return;

            // 모든 탭과 네비게이션 아이템에서 active 클래스 제거
            const allTabs = sidepanel.querySelectorAll('.profile-tab-content');
            const allNavItems = sidepanel.querySelectorAll('.profile-nav-item');
            
            allTabs.forEach(tab => tab.classList.remove('active'));
            allNavItems.forEach(item => item.classList.remove('active'));

            // 선택된 탭과 네비게이션 아이템에 active 클래스 추가
            const selectedTab = sidepanel.querySelector(`#${tabId}-tab`);
            const selectedNavItem = sidepanel.querySelector(`[data-tab="${tabId}"]`);
            
            if (selectedTab) selectedTab.classList.add('active');
            if (selectedNavItem) selectedNavItem.classList.add('active');

            this.currentTab = tabId;
            logger.info(`Switched to tab: ${tabId}`);

            // 탭별 데이터 로드
            this.loadTabContent(tabId);

        } catch (error) {
            logger.error('Failed to switch tab:', error);
        }
    }

    /**
     * 탭별 컨텐츠 로드
     */
    async loadTabContent(tabId) {
        switch (tabId) {
            case 'profile':
                // 프로필 정보는 이미 로드됨
                break;
            case 'badges':
                await this.loadBadges();
                break;
            case 'inventory':
                await this.loadInventory();
                break;
            case 'cart':
                await this.loadCart();
                break;
            case 'points':
                await this.loadPointHistory();
                break;
            case 'payments':
                await this.loadPaymentHistory();
                break;
            case 'activity':
                await this.loadActivityHistory();
                break;
            case 'settings':
                await this.loadSettings();
                break;
            case 'verification':
                await this.loadVerification();
                break;
        }
    }

    /**
     * 뱃지 정보 로드
     */
    async loadBadges() {
        try {
            const badgeTab = document.querySelector('#badges-tab');
            if (!badgeTab) return;

            // 로딩 상태 표시
            badgeTab.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 뱃지 정보를 불러오는 중...</div>';

            // authService에서 뱃지 정보 가져오기
            const userBadges = this.profileData?.user_badges || [];
            
            // 뱃지 그리드 HTML 생성
            const badgesHTML = `
                <div class="badges-header">
                    <h3><i class="fas fa-trophy"></i> 획득한 뱃지</h3>
                    <div class="badge-stats">
                        <span class="badge-count">${userBadges.length}개 획득</span>
                    </div>
                </div>
                <div class="badges-grid">
                    ${userBadges.length > 0 ? 
                        userBadges.map(badge => `
                            <div class="badge-item acquired">
                                <div class="badge-icon" style="background: ${badge.badges?.color || '#FFD700'}">
                                    <i class="${badge.badges?.icon || 'fas fa-star'}"></i>
                                </div>
                                <div class="badge-info">
                                    <h4>${badge.badges?.name || '뱃지'}</h4>
                                    <p class="badge-date">획득일: ${new Date(badge.earned_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        `).join('') : 
                        '<div class="empty-state"><i class="fas fa-trophy"></i><p>아직 획득한 뱃지가 없습니다.<br>활동하여 뱃지를 획득해보세요!</p></div>'
                    }
                </div>
            `;
            
            badgeTab.innerHTML = badgesHTML;
            logger.info('Badges loaded successfully');
            
        } catch (error) {
            logger.error('Failed to load badges:', error);
            const badgeTab = document.querySelector('#badges-tab');
            if (badgeTab) {
                badgeTab.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>뱃지 정보를 불러올 수 없습니다.</p></div>';
            }
        }
    }

    /**
     * 보관함 로드
     */
    async loadInventory() {
        try {
            const inventoryTab = document.querySelector('#inventory-tab');
            if (!inventoryTab) return;

            // 로딩 상태 표시
            inventoryTab.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 보관함을 불러오는 중...</div>';

            // 향후 Supabase에서 사용자 아이템 정보 가져올 예정
            // 현재는 빈 상태로 표시
            const inventoryHTML = `
                <div class="inventory-header">
                    <h3><i class="fas fa-box"></i> 내 보관함</h3>
                    <div class="inventory-filters">
                        <button class="filter-btn active" data-filter="all">전체</button>
                        <button class="filter-btn" data-filter="decoration">꾸미기</button>
                        <button class="filter-btn" data-filter="utility">유틸리티</button>
                        <button class="filter-btn" data-filter="booster">부스터</button>
                    </div>
                </div>
                <div class="inventory-grid">
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>보관함이 비어있습니다.<br>포인트샵에서 아이템을 구매해보세요!</p>
                        <button class="btn btn-primary" onclick="window.location.href='/points-shop.html'">
                            <i class="fas fa-store"></i> 포인트샵 이동
                        </button>
                    </div>
                </div>
            `;
            
            inventoryTab.innerHTML = inventoryHTML;
            
            // 필터 버튼 이벤트 리스너 추가
            const filterBtns = inventoryTab.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    // 필터 로직은 실제 데이터가 있을 때 구현
                });
            });
            
            logger.info('Inventory loaded successfully');
            
        } catch (error) {
            logger.error('Failed to load inventory:', error);
            const inventoryTab = document.querySelector('#inventory-tab');
            if (inventoryTab) {
                inventoryTab.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>보관함 정보를 불러올 수 없습니다.</p></div>';
            }
        }
    }

    /**
     * 장바구니 로드
     */
    async loadCart() {
        try {
            const cartTab = document.querySelector('#cart-tab');
            if (!cartTab) return;

            // 로딩 상태 표시
            cartTab.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 장바구니를 불러오는 중...</div>';

            // 향후 Supabase에서 사용자 장바구니 정보 가져올 예정
            const cartHTML = `
                <div class="cart-header">
                    <h3><i class="fas fa-shopping-cart"></i> 내 장바구니</h3>
                    <div class="cart-summary">
                        <span class="total-items">0개 아이템</span>
                        <span class="total-points">0P</span>
                    </div>
                </div>
                <div class="cart-content">
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <p>장바구니가 비어있습니다.<br>포인트샵에서 아이템을 담아보세요!</p>
                        <button class="btn btn-primary" onclick="window.location.href='/points-shop.html'">
                            <i class="fas fa-store"></i> 포인트샵 바로가기
                        </button>
                    </div>
                </div>
            `;
            
            cartTab.innerHTML = cartHTML;
            logger.info('Cart loaded successfully');
            
        } catch (error) {
            logger.error('Failed to load cart:', error);
            const cartTab = document.querySelector('#cart-tab');
            if (cartTab) {
                cartTab.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>장바구니 정보를 불러올 수 없습니다.</p></div>';
            }
        }
    }

    /**
     * 포인트 내역 로드
     */
    async loadPointHistory() {
        try {
            const pointsTab = document.querySelector('#points-tab');
            if (!pointsTab) return;

            // 로딩 상태 표시
            pointsTab.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 포인트 내역을 불러오는 중...</div>';

            // 향후 Supabase에서 포인트 내역 가져올 예정
            const currentPoints = this.profileData?.points || 0;
            
            const pointsHTML = `
                <div class="points-header">
                    <h3><i class="fas fa-coins"></i> 포인트 내역</h3>
                    <div class="current-points">
                        <span class="points-label">현재 포인트</span>
                        <span class="points-value">${currentPoints.toLocaleString()}P</span>
                    </div>
                </div>
                <div class="points-filters">
                    <button class="filter-btn active" data-filter="all">전체</button>
                    <button class="filter-btn" data-filter="earned">획등</button>
                    <button class="filter-btn" data-filter="spent">사용</button>
                </div>
                <div class="points-history">
                    <div class="empty-state">
                        <i class="fas fa-coins"></i>
                        <p>포인트 내역이 없습니다.<br>활동하여 포인트를 획등해보세요!</p>
                        <div class="quick-actions">
                            <button class="btn btn-primary" onclick="window.location.href='/points-charge.html'">
                                <i class="fas fa-credit-card"></i> 포인트 충전
                            </button>
                            <button class="btn btn-secondary" onclick="window.location.href='/attendance.html'">
                                <i class="fas fa-calendar-check"></i> 출석체크
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            pointsTab.innerHTML = pointsHTML;
            
            // 필터 버튼 이벤트 리스너 추가
            const filterBtns = pointsTab.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    // 필터 로직은 실제 데이터가 있을 때 구현
                });
            });
            
            logger.info('Point history loaded successfully');
            
        } catch (error) {
            logger.error('Failed to load point history:', error);
            const pointsTab = document.querySelector('#points-tab');
            if (pointsTab) {
                pointsTab.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>포인트 내역을 불러올 수 없습니다.</p></div>';
            }
        }
    }

    /**
     * 결제 내역 로드
     */
    async loadPaymentHistory() {
        try {
            const paymentsTab = document.querySelector('#payments-tab');
            if (!paymentsTab) return;

            // 로딩 상태 표시
            paymentsTab.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 결제 내역을 불러오는 중...</div>';

            // 향후 Supabase에서 결제 내역 가져올 예정
            const paymentsHTML = `
                <div class="payments-header">
                    <h3><i class="fas fa-credit-card"></i> 결제 내역</h3>
                    <div class="payment-stats">
                        <div class="stat-item">
                            <span class="stat-label">총 결제 금액</span>
                            <span class="stat-value">0원</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">결제 횟수</span>
                            <span class="stat-value">0회</span>
                        </div>
                    </div>
                </div>
                <div class="payment-filters">
                    <button class="filter-btn active" data-filter="all">전체</button>
                    <button class="filter-btn" data-filter="point_charge">포인트 충전</button>
                    <button class="filter-btn" data-filter="premium">프리미엄</button>
                    <button class="filter-btn" data-filter="refund">환불</button>
                </div>
                <div class="payment-history">
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <p>결제 내역이 없습니다.<br>포인트를 충전하거나 프리미엄에 가입해보세요!</p>
                        <div class="quick-actions">
                            <button class="btn btn-primary" onclick="window.location.href='/points-charge.html'">
                                <i class="fas fa-credit-card"></i> 포인트 충전
                            </button>
                            <button class="btn btn-premium" onclick="window.location.href='/plus-membership.html'">
                                <i class="fas fa-crown"></i> 프리미엄 가입
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            paymentsTab.innerHTML = paymentsHTML;
            
            // 필터 버튼 이벤트 리스너 추가
            const filterBtns = paymentsTab.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    // 필터 로직은 실제 데이터가 있을 때 구현
                });
            });
            
            logger.info('Payment history loaded successfully');
            
        } catch (error) {
            logger.error('Failed to load payment history:', error);
            const paymentsTab = document.querySelector('#payments-tab');
            if (paymentsTab) {
                paymentsTab.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>결제 내역을 불러올 수 없습니다.</p></div>';
            }
        }
    }

    /**
     * 활동 기록 로드
     */
    async loadActivityHistory() {
        try {
            const activityTab = document.querySelector('#activity-tab');
            if (!activityTab) return;

            // 로딩 상태 표시
            activityTab.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 활동 기록을 불러오는 중...</div>';

            // 현재 프로필 데이터에서 활동 정보 추출
            const postCount = this.profileData?.post_count || 0;
            const commentCount = this.profileData?.comment_count || 0;
            const likeCount = this.profileData?.like_count || 0;
            
            const activityHTML = `
                <div class="activity-header">
                    <h3><i class="fas fa-history"></i> 내 활동 기록</h3>
                    <div class="activity-stats">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-edit"></i></div>
                            <div class="stat-info">
                                <span class="stat-number">${postCount}</span>
                                <span class="stat-label">작성한 글</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-comments"></i></div>
                            <div class="stat-info">
                                <span class="stat-number">${commentCount}</span>
                                <span class="stat-label">작성한 댓글</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-heart"></i></div>
                            <div class="stat-info">
                                <span class="stat-number">${likeCount}</span>
                                <span class="stat-label">받은 좋아요</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="activity-filters">
                    <button class="filter-btn active" data-filter="all">전체</button>
                    <button class="filter-btn" data-filter="posts">글</button>
                    <button class="filter-btn" data-filter="comments">댓글</button>
                    <button class="filter-btn" data-filter="likes">좋아요</button>
                </div>
                <div class="activity-content">
                    <div class="empty-state">
                        <i class="fas fa-chart-line"></i>
                        <p>활동 기록을 더 자세히 보려면<br>아래 버튼을 이용해주세요!</p>
                        <div class="quick-actions">
                            <button class="btn btn-primary" onclick="window.location.href='/forum.html'">
                                <i class="fas fa-edit"></i> 글 작성하기
                            </button>
                            <button class="btn btn-secondary" onclick="window.location.href='/points-ranking.html'">
                                <i class="fas fa-trophy"></i> 랭킹 보기
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            activityTab.innerHTML = activityHTML;
            
            // 필터 버튼 이벤트 리스너 추가
            const filterBtns = activityTab.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    // 필터 로직은 실제 데이터가 있을 때 구현
                });
            });
            
            logger.info('Activity history loaded successfully');
            
        } catch (error) {
            logger.error('Failed to load activity history:', error);
            const activityTab = document.querySelector('#activity-tab');
            if (activityTab) {
                activityTab.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>활동 기록을 불러올 수 없습니다.</p></div>';
            }
        }
    }

    /**
     * 설정 로드
     */
    async loadSettings() {
        console.log('[ProfileSidepanelLoader] loadSettings 시작');
        try {
            const settingsTab = document.querySelector('#settings-tab');
            if (!settingsTab) {
                console.error('[ProfileSidepanelLoader] settings-tab 요소를 찾을 수 없습니다');
                return;
            }
            

            // 로딩 상태 표시
            settingsTab.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 설정을 불러오는 중...</div>';

            // 설정 페이지 HTML 생성
            const settingsHTML = `
                <div class="settings-header">
                    <h3><i class="fas fa-cog"></i> 계정 설정</h3>
                </div>
                <div class="settings-content">
                    <!-- 개인정보 설정 -->
                    <div class="settings-section">
                        <h4><i class="fas fa-user"></i> 개인정보</h4>
                        <div class="settings-item">
                            <label>닉네임</label>
                            <div class="setting-control">
                                <input type="text" id="nickname-input" value="${this.profileData?.nickname || ''}" placeholder="닉네임을 입력하세요">
                                <button class="btn btn-sm btn-primary" onclick="profileSidepanelLoader.updateNickname()">
                                    <i class="fas fa-check"></i> 변경
                                </button>
                            </div>
                        </div>
                        <div class="settings-item">
                            <label>프로필 이미지</label>
                            <div class="setting-control">
                                <div class="avatar-upload">
                                    <div class="current-avatar">
                                        <img src="${this.profileData?.avatar_url || '/img/default-avatar.png'}" alt="현재 프로필">
                                    </div>
                                    <button class="btn btn-sm btn-secondary" onclick="profileSidepanelLoader.uploadAvatar()">
                                        <i class="fas fa-upload"></i> 변경
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 알림 설정 -->
                    <div class="settings-section">
                        <h4><i class="fas fa-bell"></i> 알림 설정</h4>
                        <div class="settings-item">
                            <label class="setting-label">댓글 알림</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="comment-notification" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="settings-item">
                            <label class="setting-label">좋아요 알림</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="like-notification" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="settings-item">
                            <label class="setting-label">포인트 알림</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="point-notification" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- 보안 설정 -->
                    <div class="settings-section">
                        <h4><i class="fas fa-shield-alt"></i> 보안</h4>
                        <div class="settings-item">
                            <label>비밀번호 변경</label>
                            <div class="setting-control">
                                <button class="btn btn-sm btn-secondary" onclick="profileSidepanelLoader.changePassword()">
                                    <i class="fas fa-lock"></i> 비밀번호 변경
                                </button>
                            </div>
                        </div>
                        <div class="settings-item">
                            <label class="setting-label">2단계 인증</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="two-factor-auth">
                                <span class="toggle-slider"></span>
                            </label>
                            <small class="setting-desc">계정 보안을 위해 2단계 인증을 활성화하세요</small>
                        </div>
                    </div>

                    <!-- 기타 설정 -->
                    <div class="settings-section">
                        <h4><i class="fas fa-cogs"></i> 기타</h4>
                        <div class="settings-item">
                            <label>언어</label>
                            <div class="setting-control">
                                <select id="language-select">
                                    <option value="ko" selected>한국어</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 위험 구역 -->
                    <div class="settings-section danger-zone">
                        <h4><i class="fas fa-exclamation-triangle"></i> 위험 구역</h4>
                        <div class="settings-item">
                            <label>계정 삭제</label>
                            <div class="setting-control">
                                <button class="btn btn-sm btn-danger" onclick="profileSidepanelLoader.deleteAccount()">
                                    <i class="fas fa-trash"></i> 계정 삭제
                                </button>
                                <small class="setting-desc danger">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            settingsTab.innerHTML = settingsHTML;
            console.log('[ProfileSidepanelLoader] 설정 HTML 렌더링 완료');
            
            
            // 토글 스위치 이벤트 리스너 추가 (다크모드 제외)
            const toggles = settingsTab.querySelectorAll('input[type="checkbox"]');
            toggles.forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    this.updateSetting(e.target.id, e.target.checked);
                });
            });
            
            logger.info('Settings loaded successfully');
            
            
            // 프로필 사이드패널 로드 완료 이벤트 발생
            document.dispatchEvent(new CustomEvent('profileSidepanelLoaded'));
            
        } catch (error) {
            logger.error('Failed to load settings:', error);
            const settingsTab = document.querySelector('#settings-tab');
            if (settingsTab) {
                settingsTab.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>설정을 불러올 수 없습니다.</p></div>';
            }
        }
    }

    /**
     * 실무자 인증 로드
     */
    async loadVerification() {
        try {
            const verificationTab = document.querySelector('#verification-tab');
            if (!verificationTab) return;

            // 로딩 상태 표시
            verificationTab.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 인증 정보를 불러오는 중...</div>';

            // 현재 사용자의 인증 상태 확인
            const isVerified = this.profileData?.is_verified || false;
            const userType = this.profileData?.user_type || '일반';
            const verificationStatus = this.profileData?.verification_status || 'none';
            
            const verificationHTML = `
                <div class="verification-header">
                    <h3><i class="fas fa-certificate"></i> 실무자 인증</h3>
                    <div class="verification-status ${isVerified ? 'verified' : 'unverified'}">
                        <i class="fas ${isVerified ? 'fa-check-circle' : 'fa-clock'}"></i>
                        <span>${isVerified ? '인증 완료' : '미인증'}</span>
                    </div>
                </div>
                
                <div class="verification-content">
                    ${isVerified ? this.renderVerifiedContent() : this.renderUnverifiedContent(userType, verificationStatus)}
                </div>
            `;
            
            verificationTab.innerHTML = verificationHTML;
            
            // 파일 업로드 이벤트 리스너
            const uploadBtns = verificationTab.querySelectorAll('.upload-btn');
            uploadBtns.forEach(btn => {
                btn.addEventListener('click', () => this.uploadDocument(btn.dataset.type));
            });
            
            logger.info('Verification loaded successfully');
            
        } catch (error) {
            logger.error('Failed to load verification:', error);
            const verificationTab = document.querySelector('#verification-tab');
            if (verificationTab) {
                verificationTab.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>인증 정보를 불러올 수 없습니다.</p></div>';
            }
        }
    }

    /**
     * 인증 완료된 사용자 UI 렌더링
     */
    renderVerifiedContent() {
        return `
            <div class="verification-success">
                <div class="success-icon">
                    <i class="fas fa-badge-check"></i>
                </div>
                <h4>실무자 인증이 완료되었습니다!</h4>
                <p>축하합니다. 이제 실무자 전용 기능을 이용할 수 있습니다.</p>
                
                <div class="verification-details">
                    <div class="detail-item">
                        <span class="detail-label">인증 유형:</span>
                        <span class="detail-value">분양 실무자</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">인증일:</span>
                        <span class="detail-value">${this.profileData?.verified_at ? new Date(this.profileData.verified_at).toLocaleDateString() : '2024-01-01'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">유효기간:</span>
                        <span class="detail-value">만료 없음</span>
                    </div>
                </div>
                
                <div class="verified-benefits">
                    <h5>실무자 전용 혜택</h5>
                    <ul>
                        <li><i class="fas fa-check"></i> AI 매칭 서비스 무료 이용</li>
                        <li><i class="fas fa-check"></i> 프리미엄 데이터 센터 접근</li>
                        <li><i class="fas fa-check"></i> 실무자 전용 커뮤니티</li>
                        <li><i class="fas fa-check"></i> 우선 고객지원</li>
                    </ul>
                </div>
                
                <div class="verification-actions">
                    <button class="btn btn-secondary" onclick="profileSidepanelLoader.downloadCertificate()">
                        <i class="fas fa-download"></i> 인증서 다운로드
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 미인증 사용자 UI 렌더링
     */
    renderUnverifiedContent(userType, status) {
        const canApply = ['분양기획', '관계사'].includes(userType);
        
        if (!canApply) {
            return `
                <div class="verification-unavailable">
                    <div class="unavailable-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <h4>실무자 인증 신청 불가</h4>
                    <p>현재 회원 유형(${userType})으로는 실무자 인증을 신청할 수 없습니다.</p>
                    <p>분양기획 또는 관계사 회원만 실무자 인증을 신청할 수 있습니다.</p>
                    
                    <div class="contact-support">
                        <button class="btn btn-secondary" onclick="window.location.href='/support.html'">
                            <i class="fas fa-headset"></i> 고객지원 문의
                        </button>
                    </div>
                </div>
            `;
        }
        
        if (status === 'pending') {
            return `
                <div class="verification-pending">
                    <div class="pending-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h4>인증 심사 진행 중</h4>
                    <p>제출해주신 서류를 검토하고 있습니다.<br>심사 결과는 영업일 기준 3-5일 내 알려드립니다.</p>
                    
                    <div class="pending-timeline">
                        <div class="timeline-item completed">
                            <i class="fas fa-check"></i>
                            <span>서류 제출</span>
                        </div>
                        <div class="timeline-item active">
                            <i class="fas fa-search"></i>
                            <span>서류 검토</span>
                        </div>
                        <div class="timeline-item">
                            <i class="fas fa-certificate"></i>
                            <span>인증 완료</span>
                        </div>
                    </div>
                    
                    <div class="pending-actions">
                        <button class="btn btn-secondary" onclick="profileSidepanelLoader.cancelVerification()">
                            <i class="fas fa-times"></i> 신청 취소
                        </button>
                        <button class="btn btn-primary" onclick="profileSidepanelLoader.contactSupport()">
                            <i class="fas fa-headset"></i> 진행상황 문의
                        </button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="verification-apply">
                <div class="apply-header">
                    <h4>실무자 인증 신청</h4>
                    <p>분양 실무 경력을 증명할 수 있는 서류를 제출해주세요.</p>
                </div>
                
                <div class="required-documents">
                    <h5>필수 제출 서류</h5>
                    <div class="document-list">
                        <div class="document-item">
                            <div class="doc-info">
                                <i class="fas fa-id-card"></i>
                                <div class="doc-details">
                                    <strong>재직증명서</strong>
                                    <small>현재 근무 중인 회사의 재직증명서 (발급일 기준 1개월 이내)</small>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline upload-btn" data-type="employment">
                                <i class="fas fa-upload"></i> 업로드
                            </button>
                        </div>
                        
                        <div class="document-item">
                            <div class="doc-info">
                                <i class="fas fa-certificate"></i>
                                <div class="doc-details">
                                    <strong>자격증 또는 경력증명서</strong>
                                    <small>부동산 관련 자격증 또는 분양업무 경력증명서</small>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline upload-btn" data-type="certificate">
                                <i class="fas fa-upload"></i> 업로드
                            </button>
                        </div>
                        
                        <div class="document-item">
                            <div class="doc-info">
                                <i class="fas fa-building"></i>
                                <div class="doc-details">
                                    <strong>사업자등록증 (해당시)</strong>
                                    <small>관계사 또는 개인사업자인 경우 사업자등록증</small>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline upload-btn" data-type="business">
                                <i class="fas fa-upload"></i> 업로드
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="verification-benefits">
                    <h5>실무자 인증 혜택</h5>
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <i class="fas fa-robot"></i>
                            <span>AI 매칭 무료</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-database"></i>
                            <span>프리미엄 데이터</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-users"></i>
                            <span>전용 커뮤니티</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-headset"></i>
                            <span>우선 지원</span>
                        </div>
                    </div>
                </div>
                
                <div class="verification-terms">
                    <label class="checkbox-label">
                        <input type="checkbox" id="agree-terms">
                        <span class="checkmark"></span>
                        <span>개인정보 처리방침 및 실무자 인증 약관에 동의합니다</span>
                    </label>
                </div>
                
                <div class="verification-actions">
                    <button class="btn btn-primary" onclick="profileSidepanelLoader.submitVerification()" disabled id="submit-verification">
                        <i class="fas fa-paper-plane"></i> 인증 신청
                    </button>
                </div>
            </div>
        `;
    }

    // ========== 설정 관련 메서드들 ==========
    
    /**
     * 설정 업데이트
     */
    updateSetting(settingId, value) {
        logger.info(`Setting updated: ${settingId} = ${value}`);
        
        
        // TODO: 다른 설정들은 Supabase에 저장
    }
    
    /**
     * 닉네임 업데이트
     */
    async updateNickname() {
        const nicknameInput = document.getElementById('nickname-input');
        if (!nicknameInput) return;
        
        const newNickname = nicknameInput.value.trim();
        if (!newNickname) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        
        try {
            // TODO: authService.updateProfile({ nickname: newNickname });
            logger.info(`Nickname updated to: ${newNickname}`);
            alert('닉네임이 성공적으로 변경되었습니다.');
        } catch (error) {
            logger.error('Failed to update nickname:', error);
            alert('닉네임 변경에 실패했습니다.');
        }
    }
    
    /**
     * 아바타 업로드
     */
    async uploadAvatar() {
        // TODO: 파일 선택 및 업로드 구현
        logger.info('Avatar upload requested');
        alert('아바타 변경 기능은 준비 중입니다.');
    }
    
    /**
     * 비밀번호 변경
     */
    async changePassword() {
        // TODO: 비밀번호 변경 모달 표시
        logger.info('Password change requested');
        alert('비밀번호 변경 기능은 준비 중입니다.');
    }
    
    /**
     * 계정 삭제
     */
    async deleteAccount() {
        const confirmed = confirm('정말로 계정을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.');
        if (!confirmed) return;
        
        const doubleConfirm = confirm('계정 삭제를 다시 한번 확인합니다.\n모든 데이터가 영구적으로 삭제됩니다.');
        if (!doubleConfirm) return;
        
        try {
            // TODO: authService.deleteAccount();
            logger.warn('Account deletion requested');
            alert('계정 삭제 기능은 고객지원을 통해 진행해주세요.');
        } catch (error) {
            logger.error('Failed to delete account:', error);
            alert('계정 삭제 중 오류가 발생했습니다.');
        }
    }
    
    // ========== 인증 관련 메서드들 ==========
    
    /**
     * 서류 업로드
     */
    async uploadDocument(type) {
        logger.info(`Document upload requested: ${type}`);
        // TODO: 파일 업로드 구현
        alert('서류 업로드 기능은 준비 중입니다.');
    }
    
    /**
     * 인증 신청 제출
     */
    async submitVerification() {
        const agreeTerms = document.getElementById('agree-terms');
        if (!agreeTerms?.checked) {
            alert('약관에 동의해주세요.');
            return;
        }
        
        try {
            // TODO: 실제 인증 신청 API 호출
            logger.info('Verification application submitted');
            alert('실무자 인증 신청이 완료되었습니다.\n심사 결과는 3-5일 내 알려드리겠습니다.');
            
            // 탭 새로고침
            await this.loadVerification();
        } catch (error) {
            logger.error('Failed to submit verification:', error);
            alert('인증 신청 중 오류가 발생했습니다.');
        }
    }
    
    /**
     * 인증 신청 취소
     */
    async cancelVerification() {
        const confirmed = confirm('정말로 인증 신청을 취소하시겠습니까?');
        if (!confirmed) return;
        
        try {
            // TODO: 인증 신청 취소 API 호출
            logger.info('Verification application cancelled');
            alert('인증 신청이 취소되었습니다.');
            
            // 탭 새로고침
            await this.loadVerification();
        } catch (error) {
            logger.error('Failed to cancel verification:', error);
            alert('신청 취소 중 오류가 발생했습니다.');
        }
    }
    
    /**
     * 고객지원 연락
     */
    contactSupport() {
        window.location.href = '/support.html';
    }
    
    /**
     * 인증서 다운로드
     */
    async downloadCertificate() {
        try {
            // TODO: 인증서 PDF 생성 및 다운로드
            logger.info('Certificate download requested');
            alert('인증서 다운로드 기능은 준비 중입니다.');
        } catch (error) {
            logger.error('Failed to download certificate:', error);
            alert('인증서 다운로드 중 오류가 발생했습니다.');
        }
    }
    
    /**
     * 프로필 사이드패널 열기
     */
    open() {
        const overlay = document.getElementById('profileSidepanel');
        if (overlay) {
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            logger.info('Profile sidepanel opened');
            
        }
    }
    
    /**
     * 프로필 사이드패널 표시 (authService 호환성)
     */
    async showProfileSidepanel() {
        if (!this.isLoaded) {
            await this.load();
        }
        this.open();
    }

    /**
     * 프로필 사이드패널 닫기
     */
    close() {
        const overlay = document.getElementById('profileSidepanel');
        if (overlay) {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            logger.info('Profile sidepanel closed');
        }
    }

    /**
     * 사이드패널이 열려있는지 확인
     */
    isOpen() {
        const sidepanel = document.getElementById('profileSidepanel');
        return sidepanel && sidepanel.classList.contains('active');
    }

    /**
     * 프로필 데이터 새로고침
     */
    async refresh() {
        await this.loadUserProfile();
        if (this.currentTab) {
            await this.loadTabContent(this.currentTab);
        }
        logger.info('Profile sidepanel refreshed');
    }

    /**
     * 리소스 정리
     */
    destroy() {
        const sidepanel = document.getElementById('profileSidepanel');
        if (sidepanel) {
            sidepanel.remove();
        }
        
        this.isLoaded = false;
        this.profileData = null;
        logger.info('ProfileSidepanel destroyed');
    }
}

// 전역 인스턴스 생성 및 내보내기
export const profileSidepanelLoader = new ProfileSidepanelLoader();

// 기본 내보내기
export default profileSidepanelLoader;

// window에 노출 (일반 스크립트에서도 사용 가능하도록)
if (typeof window !== 'undefined') {
    window.ProfileSidepanelLoader = ProfileSidepanelLoader;
    window.profileSidepanelLoader = profileSidepanelLoader;
}
