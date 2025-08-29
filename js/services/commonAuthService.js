/**
 * WAVE SPACE - 공통 인증 서비스
 * 모든 페이지에서 사용되는 공통 인증 기능
 */

// ES6 모듈 대신 전역 객체 사용 (CORS 문제 해결)
// supabase와 authService는 이미 전역으로 로드된 상태여야 함

class CommonAuthService {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.authCallbacks = [];
        // 자동 초기화 비활성화 - 수동으로 init() 호출 필요
    }

    async init() {
        try {
            // 전역 객체들이 로드될 때까지 대기
            await this.waitForDependencies();
            
            await window.authService.init();
            this.currentUser = await window.authService.getCurrentUser();
            
            this.setupGlobalAuthListeners();
            this.updateAllAuthUI();
            this.setupRealtimeSubscription();
            this.isInitialized = true;
            
            // 초기화 완료 콜백 실행
            this.authCallbacks.forEach(callback => callback(this.currentUser));
            
        } catch (error) {
            console.error('공통 인증 서비스 초기화 오류:', error);
        }
    }

    // 의존성 대기 함수
    async waitForDependencies() {
        let attempts = 0;
        const maxAttempts = 50; // 5초 대기
        
        while (attempts < maxAttempts) {
            if (window.supabase && window.authService) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Supabase 또는 AuthService 로딩 실패');
    }

    // 인증 상태 변경 콜백 등록
    onAuthChange(callback) {
        if (this.isInitialized) {
            callback(this.currentUser);
        } else {
            this.authCallbacks.push(callback);
        }
    }

    setupGlobalAuthListeners() {
        // 전역 로그아웃 버튼
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn, [data-action="logout"]')) {
                e.preventDefault();
                this.logout();
            }
        });

        // 전역 로그인 버튼
        document.addEventListener('click', (e) => {
            if (e.target.matches('.login-btn, [data-action="login"]')) {
                e.preventDefault();
                window.location.href = 'login.html';
            }
        });

        // 프로필 메뉴 토글
        document.addEventListener('click', (e) => {
            if (e.target.matches('.profile-menu-toggle, .user-avatar')) {
                e.preventDefault();
                this.toggleProfileMenu();
            }
        });

        // 외부 클릭 시 프로필 메뉴 닫기
        document.addEventListener('click', (e) => {
            const profileMenu = document.querySelector('.profile-dropdown');
            if (profileMenu && !e.target.closest('.profile-menu')) {
                profileMenu.classList.remove('show');
            }
        });
    }

    async updateAllAuthUI() {
        // 사이드바 사용자 정보 업데이트
        this.updateSidebarAuth();
        
        // 헤더 사용자 정보 업데이트
        this.updateHeaderAuth();
        
        // 페이지별 인증 UI 업데이트
        this.updatePageAuthUI();
    }

    updateSidebarAuth() {
        const sidebarUserSection = document.querySelector('.sidebar-user, .user-profile-section');
        
        if (this.currentUser) {
            if (sidebarUserSection) {
                sidebarUserSection.innerHTML = `
                    <div class="user-profile-card">
                        <div class="profile-avatar-container">
                            <img src="${this.currentUser.profile_image_url || '/assets/default-avatar.png'}" 
                                 alt="${this.currentUser.username}" 
                                 class="profile-avatar user-avatar"
                                 onclick="commonAuthService.toggleProfileMenu()">
                            <div class="online-indicator"></div>
                        </div>
                        
                        <div class="user-info">
                            <div class="username">${this.currentUser.username}</div>
                            <div class="user-level">
                                ${this.getUserLevelInfo()}
                            </div>
                            <div class="user-points">
                                <i class="fas fa-coins"></i>
                                ${this.formatNumber(this.currentUser.points || 0)} P
                            </div>
                        </div>

                        <div class="profile-dropdown" id="profileDropdown">
                            <a href="#" onclick="openMypageModal(); return false;" class="dropdown-item">
                                <i class="fas fa-user"></i>
                                내 프로필
                            </a>
                            <a href="my-posts.html" class="dropdown-item">
                                <i class="fas fa-edit"></i>
                                내 게시글
                            </a>
                            <a href="points-history.html" class="dropdown-item">
                                <i class="fas fa-coins"></i>
                                포인트 내역
                            </a>
                            <a href="settings.html" class="dropdown-item">
                                <i class="fas fa-cog"></i>
                                설정
                            </a>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item logout-btn" data-action="logout">
                                <i class="fas fa-sign-out-alt"></i>
                                로그아웃
                            </button>
                        </div>
                    </div>
                `;
            }
        } else {
            if (sidebarUserSection) {
                sidebarUserSection.innerHTML = `
                    <div class="auth-prompt">
                        <div class="auth-message">
                            <i class="fas fa-user-circle"></i>
                            <p>로그인하여 더 많은 기능을 이용하세요</p>
                        </div>
                        <div class="auth-buttons">
                            <a href="login.html" class="btn btn-primary login-btn">로그인</a>
                            <a href="signup.html" class="btn btn-secondary">회원가입</a>
                        </div>
                    </div>
                `;
            }
        }
    }

    updateHeaderAuth() {
        const headerUserSection = document.querySelector('.header-user, .top-nav-user');
        
        if (this.currentUser) {
            if (headerUserSection) {
                headerUserSection.innerHTML = `
                    <div class="header-user-info">
                        <div class="user-points-badge">
                            <i class="fas fa-coins"></i>
                            ${this.formatNumber(this.currentUser.points || 0)} P
                        </div>
                        <div class="user-avatar-small">
                            <img src="${this.currentUser.profile_image_url || '/assets/default-avatar.png'}" 
                                 alt="${this.currentUser.username}" 
                                 onclick="commonAuthService.toggleProfileMenu()">
                        </div>
                    </div>
                `;
            }
        } else {
            if (headerUserSection) {
                headerUserSection.innerHTML = `
                    <div class="header-auth-buttons">
                        <a href="login.html" class="btn btn-sm btn-primary">로그인</a>
                    </div>
                `;
            }
        }
    }

    updatePageAuthUI() {
        // 페이지별 인증 상태 업데이트
        const authElements = document.querySelectorAll('[data-auth-required]');
        
        authElements.forEach(element => {
            if (this.currentUser) {
                element.style.display = 'block';
                element.classList.remove('auth-hidden');
            } else {
                if (element.dataset.authRequired === 'hide') {
                    element.style.display = 'none';
                    element.classList.add('auth-hidden');
                } else {
                    // 로그인 프롬프트 표시
                    this.showLoginPrompt(element);
                }
            }
        });

        // 로그인된 사용자만 보이는 요소들
        const loggedInElements = document.querySelectorAll('.auth-only, [data-show="logged-in"]');
        loggedInElements.forEach(element => {
            element.style.display = this.currentUser ? 'block' : 'none';
        });

        // 로그아웃된 사용자만 보이는 요소들
        const loggedOutElements = document.querySelectorAll('.guest-only, [data-show="logged-out"]');
        loggedOutElements.forEach(element => {
            element.style.display = this.currentUser ? 'none' : 'block';
        });
    }

    showLoginPrompt(element) {
        if (!element.dataset.loginPromptAdded) {
            const promptHTML = `
                <div class="login-prompt-overlay">
                    <div class="login-prompt">
                        <i class="fas fa-lock"></i>
                        <p>로그인이 필요한 기능입니다</p>
                        <a href="login.html" class="btn btn-primary">로그인</a>
                    </div>
                </div>
            `;
            element.insertAdjacentHTML('afterbegin', promptHTML);
            element.dataset.loginPromptAdded = 'true';
        }
    }

    toggleProfileMenu() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    async logout() {
        if (!confirm('정말 로그아웃하시겠습니까?')) {
            return;
        }

        try {
            await authService.logout();
            this.currentUser = null;
            
            // 모든 인증 UI 업데이트
            this.updateAllAuthUI();
            
            // 메인 페이지로 리다이렉트
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('로그아웃 오류:', error);
            this.showError('로그아웃 처리 중 오류가 발생했습니다.');
        }
    }

    setupRealtimeSubscription() {
        if (!this.currentUser) return;

        // 실시간 사용자 정보 업데이트 (포인트, 레벨 등)
        const userChannel = supabase
            .channel(`user-${this.currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${this.currentUser.id}`
                },
                (payload) => {
                    console.log('사용자 정보 업데이트:', payload.new);
                    this.handleUserUpdate(payload.new);
                }
            )
            .subscribe();

        // 실시간 알림
        const notificationChannel = supabase
            .channel(`notifications-${this.currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'user_notifications',
                    filter: `user_id=eq.${this.currentUser.id}`
                },
                (payload) => {
                    console.log('새 알림:', payload.new);
                    this.handleNewNotification(payload.new);
                }
            )
            .subscribe();
    }

    handleUserUpdate(updatedUser) {
        // 현재 사용자 정보 업데이트
        this.currentUser = { ...this.currentUser, ...updatedUser };
        
        // UI 업데이트
        this.updateAllAuthUI();
        
        // 포인트 변경 시 알림
        if (updatedUser.points !== undefined) {
            this.showPointsNotification(updatedUser.points);
        }
    }

    handleNewNotification(notification) {
        // 실시간 알림 표시
        this.showNotification(notification.message, notification.type);
        
        // 알림 카운터 업데이트
        this.updateNotificationBadge();
    }

    showPointsNotification(newPoints) {
        const pointsElements = document.querySelectorAll('.user-points, .points-value');
        pointsElements.forEach(el => {
            // 애니메이션 효과로 포인트 변경 표시
            el.classList.add('points-updated');
            el.textContent = `${this.formatNumber(newPoints)} P`;
            setTimeout(() => {
                el.classList.remove('points-updated');
            }, 1000);
        });
    }

    updateNotificationBadge() {
        // 읽지 않은 알림 수 업데이트
        const badges = document.querySelectorAll('.notification-badge, .unread-count');
        // 실제 구현은 알림 서비스와 연동 필요
        badges.forEach(badge => {
            badge.style.display = 'block';
        });
    }

    getUserLevelInfo() {
        if (!this.currentUser) return '';
        
        const points = this.currentUser.points || 0;
        const level = this.calculateUserLevel(points);
        const nextLevel = level + 1;
        const pointsForNextLevel = this.getPointsForLevel(nextLevel);
        const progress = ((points - this.getPointsForLevel(level)) / (pointsForNextLevel - this.getPointsForLevel(level))) * 100;

        return `
            <div class="user-level-info">
                <span class="level-badge">Lv.${level}</span>
                <div class="level-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.max(0, Math.min(100, progress))}%"></div>
                    </div>
                    <span class="progress-text">다음 레벨까지 ${pointsForNextLevel - points}P</span>
                </div>
            </div>
        `;
    }

    calculateUserLevel(points) {
        // 레벨 계산 로직
        if (points < 100) return 1;
        if (points < 500) return 2;
        if (points < 1000) return 3;
        if (points < 2500) return 4;
        if (points < 5000) return 5;
        if (points < 10000) return 6;
        if (points < 20000) return 7;
        if (points < 50000) return 8;
        if (points < 100000) return 9;
        return 10;
    }

    getPointsForLevel(level) {
        const levelThresholds = [0, 100, 500, 1000, 2500, 5000, 10000, 20000, 50000, 100000, 200000];
        return levelThresholds[Math.min(level, levelThresholds.length - 1)] || 0;
    }

    // 페이지별 인증 상태 확인
    requireAuth(action = '이 기능을') {
        if (!this.currentUser) {
            alert(`${action} 사용하려면 로그인이 필요합니다.`);
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // 관리자 권한 확인
    requireAdmin(action = '이 기능을') {
        if (!this.currentUser) {
            this.requireAuth(action);
            return false;
        }

        if (!authService.isAdmin()) {
            alert(`${action} 사용할 권한이 없습니다.`);
            return false;
        }
        
        return true;
    }

    // 사용자 권한 레벨 확인
    hasPermission(requiredLevel) {
        if (!this.currentUser) return false;
        
        const userLevel = this.calculateUserLevel(this.currentUser.points || 0);
        return userLevel >= requiredLevel;
    }

    // 실시간 알림 시스템
    async showRealtimeNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `realtime-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${this.getNotificationIcon(type)}
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <div class="notification-time">${new Date().toLocaleTimeString('ko-KR')}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 알림 컨테이너에 추가
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            'info': '<i class="fas fa-info-circle"></i>',
            'success': '<i class="fas fa-check-circle"></i>',
            'warning': '<i class="fas fa-exclamation-triangle"></i>',
            'error': '<i class="fas fa-times-circle"></i>',
            'points': '<i class="fas fa-coins"></i>',
            'level': '<i class="fas fa-star"></i>'
        };
        return icons[type] || icons.info;
    }

    // 전역 사용자 상태 관리
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    getUserPoints() {
        return this.currentUser?.points || 0;
    }

    getUserLevel() {
        return this.calculateUserLevel(this.getUserPoints());
    }

    // 유틸리티 함수들
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    }

    showError(message) {
        this.showRealtimeNotification(message, 'error');
    }

    showSuccess(message) {
        this.showRealtimeNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        this.showRealtimeNotification(message, type);
    }

    // 페이지 리로드 없이 사용자 정보 새로고침
    async refreshUserInfo() {
        try {
            this.currentUser = await authService.getCurrentUser();
            this.updateAllAuthUI();
        } catch (error) {
            console.error('사용자 정보 새로고침 오류:', error);
        }
    }
}

// 전역 인스턴스 생성 (수동 초기화)
window.commonAuthService = new CommonAuthService();

// 전역 유틸리티 함수들
window.requireAuth = (action) => window.commonAuthService.requireAuth(action);
window.requireAdmin = (action) => window.commonAuthService.requireAdmin(action);
window.getCurrentUser = () => window.commonAuthService.getCurrentUser();
window.isLoggedIn = () => window.commonAuthService.isLoggedIn();
window.getUserPoints = () => window.commonAuthService.getUserPoints();
window.getUserLevel = () => window.commonAuthService.getUserLevel();