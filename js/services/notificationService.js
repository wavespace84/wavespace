/**
 * WAVE SPACE - Notification Service
 * 실시간 알림 시스템
 */

class NotificationService {
    constructor() {
        this.supabase = null;
        this.subscription = null;
        this.unreadCount = 0;
    }

    /**
     * authService 안전한 참조
     * @returns {Object|null} authService 또는 null
     */
    getAuthService() {
        if (typeof window !== 'undefined' && window.authService) {
            return window.authService;
        }
        console.warn('⚠️ authService를 찾을 수 없습니다.');
        return null;
    }

    /**
     * 로그인 상태 안전하게 확인
     * @returns {boolean}
     */
    isUserLoggedIn() {
        const authService = this.getAuthService();
        return authService ? authService.isLoggedIn() : false;
    }

    /**
     * 현재 사용자 안전하게 가져오기
     * @returns {Object|null}
     */
    getCurrentUser() {
        const authService = this.getAuthService();
        return authService ? authService.getCurrentUser() : null;
    }

    /**
     * 초기화
     */
    async init() {
        try {
            this.supabase = window.WaveSupabase.getClient();
            
            if (this.isUserLoggedIn()) {
                await this.loadUnreadCount();
                await this.setupRealtimeSubscription();
            }
        } catch (error) {
            console.error('NotificationService 초기화 실패:', error);
        }
    }

    /**
     * 실시간 구독 설정
     */
    async setupRealtimeSubscription() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                console.warn('⚠️ 사용자 정보를 가져올 수 없습니다.');
                return;
            }
            if (!currentUser) return;

            // 기존 구독 해제
            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            // 새로운 알림 실시간 구독
            this.subscription = this.supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${currentUser.id}`
                    },
                    (payload) => {
                        this.handleNewNotification(payload.new);
                    }
                )
                .subscribe();

        } catch (error) {
            console.error('실시간 구독 설정 실패:', error);
        }
    }

    /**
     * 새 알림 처리
     */
    handleNewNotification(notification) {
        // 읽지 않은 알림 수 증가
        this.unreadCount++;
        this.updateNotificationBadge();

        // Toast 알림 표시
        this.showNotificationToast(notification);

        // 브라우저 푸시 알림 (권한이 있는 경우)
        this.showBrowserNotification(notification);
    }

    /**
     * 알림 생성
     */
    async function createNotification(userId, type, title, message, relatedId = null) {
        try {
            const { data, error } = await this.supabase
                .from('notifications')
                .insert([{
                    user_id: userId,
                    type: type,
                    title: title,
                    message: message,
                    related_id: relatedId
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('알림 생성 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 알림 목록 조회
     */
    async getNotifications(page = 1, limit = 20, unreadOnly = false) {
        try {
            if (!this.isUserLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                console.warn('⚠️ 사용자 정보를 가져올 수 없습니다.');
                return;
            }
            
            let query = this.supabase
                .from('notifications')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);

            if (unreadOnly) {
                query = query.eq('is_read', false);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('알림 목록 조회 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 알림 읽음 처리
     */
    async markAsRead(notificationId) {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
            
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateNotificationBadge();
            
            return { success: true };
        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 모든 알림 읽음 처리
     */
    async markAllAsRead() {
        try {
            if (!this.isUserLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                console.warn('⚠️ 사용자 정보를 가져올 수 없습니다.');
                return;
            }
            
            const { error } = await this.supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', currentUser.id)
                .eq('is_read', false);

            if (error) throw error;
            
            this.unreadCount = 0;
            this.updateNotificationBadge();
            
            return { success: true };
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 읽지 않은 알림 수 로드
     */
    async loadUnreadCount() {
        try {
            if (!this.isUserLoggedIn()) return;

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                console.warn('⚠️ 사용자 정보를 가져올 수 없습니다.');
                return;
            }
            
            const { count, error } = await this.supabase
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', currentUser.id)
                .eq('is_read', false);

            if (error) throw error;
            
            this.unreadCount = count || 0;
            this.updateNotificationBadge();
        } catch (error) {
            console.error('읽지 않은 알림 수 로드 실패:', error);
        }
    }

    /**
     * 알림 배지 업데이트
     */
    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }

        // 제목에도 알림 수 표시
        const originalTitle = 'WAVE space - 대한민국 No.1 분양실무자 대표 커뮤니티';
        document.title = this.unreadCount > 0 ? `(${this.unreadCount}) ${originalTitle}` : originalTitle;
    }

    /**
     * Toast 알림 표시 - 통일된 토스트 시스템 사용
     */
    showNotificationToast(notification) {
        // 알림 타입에 따라 토스트 타입 결정
        let toastType = 'info';
        switch(notification.type) {
            case 'success':
                toastType = 'success';
                break;
            case 'error':
            case 'failed':
                toastType = 'error';
                break;
            case 'warning':
                toastType = 'warning';
                break;
            default:
                toastType = 'info';
                break;
        }
        
        // 통일된 토스트 메시지 함수 사용
        const message = notification.title ? 
            `${notification.title}: ${notification.message}` : 
            notification.message;
        
        if (typeof window.showToastMessage === 'function') {
            window.showToastMessage(message, toastType, 5000);
        } else {
            // fallback - 기본 alert
            alert(message);
        }
    }

    /**
     * 브라우저 푸시 알림 표시
     */
    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/images/logo-192.png',
                badge: '/images/logo-192.png',
                tag: notification.id
            });
        }
    }

    /**
     * 알림 타입별 아이콘 반환
     */
    getNotificationIcon(type) {
        const iconMap = {
            'comment': 'fas fa-comment',
            'like': 'fas fa-heart',
            'point': 'fas fa-coins',
            'badge': 'fas fa-medal',
            'system': 'fas fa-info-circle',
            'admin': 'fas fa-shield-alt',
            'mention': 'fas fa-at',
            'follow': 'fas fa-user-plus'
        };
        return iconMap[type] || 'fas fa-bell';
    }

    /**
     * 알림 권한 요청
     */
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    /**
     * 특정 사용자에게 알림 전송 (댓글, 좋아요 등)
     */
    static async sendCommentNotification(postAuthorId, commenterName, postTitle) {
        try {
            const notificationService = window.notificationService;
            if (!notificationService) return;

            await notificationService.createNotification(
                postAuthorId,
                'comment',
                '새로운 댓글',
                `${commenterName}님이 "${postTitle}"에 댓글을 작성했습니다.`
            );
        } catch (error) {
            console.error('댓글 알림 전송 실패:', error);
        }
    }

    /**
     * 좋아요 알림 전송
     */
    static async sendLikeNotification(contentAuthorId, likerName, contentTitle, contentType) {
        try {
            const notificationService = window.notificationService;
            if (!notificationService) return;

            const typeText = contentType === 'post' ? '게시글' : '댓글';
            
            await notificationService.createNotification(
                contentAuthorId,
                'like',
                '새로운 좋아요',
                `${likerName}님이 "${contentTitle}" ${typeText}을 좋아합니다.`
            );
        } catch (error) {
            console.error('좋아요 알림 전송 실패:', error);
        }
    }

    /**
     * 포인트 알림 전송
     */
    static async sendPointNotification(userId, amount, description) {
        try {
            const notificationService = window.notificationService;
            if (!notificationService) return;

            const amountText = amount > 0 ? `+${amount}` : amount;
            
            await notificationService.createNotification(
                userId,
                'point',
                '포인트 변동',
                `${amountText}P ${description}`
            );
        } catch (error) {
            console.error('포인트 알림 전송 실패:', error);
        }
    }

    /**
     * 뱃지 획득 알림 전송
     */
    static async sendBadgeNotification(userId, badgeName) {
        try {
            const notificationService = window.notificationService;
            if (!notificationService) return;

            await notificationService.createNotification(
                userId,
                'badge',
                '새로운 뱃지 획득!',
                `축하합니다! "${badgeName}" 뱃지를 획득하셨습니다.`
            );
        } catch (error) {
            console.error('뱃지 알림 전송 실패:', error);
        }
    }

    /**
     * 시스템 알림 전송
     */
    static async sendSystemNotification(userIds, title, message) {
        try {
            const notificationService = window.notificationService;
            if (!notificationService) return;

            const notifications = userIds.map(userId => ({
                user_id: userId,
                type: 'system',
                title: title,
                message: message
            }));

            const { error } = await notificationService.supabase
                .from('notifications')
                .insert(notifications);

            if (error) throw error;
        } catch (error) {
            console.error('시스템 알림 전송 실패:', error);
        }
    }

    /**
     * 알림 목록 HTML 렌더링
     */
    renderNotificationList(notifications) {
        if (!notifications || notifications.length === 0) {
            return `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>새로운 알림이 없습니다</p>
                </div>
            `;
        }

        return notifications.map(notification => {
            const createdDate = new Date(notification.created_at).toLocaleString('ko-KR');
            const icon = this.getNotificationIcon(notification.type);
            const readClass = notification.is_read ? 'read' : 'unread';

            return `
                <div class="notification-item ${readClass}" data-notification-id="${notification.id}">
                    <div class="notification-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-date">${createdDate}</div>
                    </div>
                    <div class="notification-actions">
                        ${!notification.is_read ? 
                            `<button onclick="notificationService.markAsRead('${notification.id}')" class="btn-mark-read">
                                <i class="fas fa-check"></i>
                            </button>` : ''
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 알림 패널 토글
     */
    toggleNotificationPanel() {
        const panel = document.querySelector('.notification-panel');
        if (!panel) {
            this.createNotificationPanel();
            return;
        }

        if (panel.classList.contains('show')) {
            panel.classList.remove('show');
        } else {
            this.loadAndShowNotifications();
        }
    }

    /**
     * 알림 패널 생성
     */
    async createNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3>알림</h3>
                <div class="notification-header-actions">
                    <button onclick="notificationService.markAllAsRead()" class="btn-mark-all-read">
                        모두 읽음
                    </button>
                    <button onclick="notificationService.toggleNotificationPanel()" class="btn-close-panel">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="notification-content">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    알림을 불러오는 중...
                </div>
            </div>
            
            <style>
                .notification-panel {
                    position: fixed;
                    top: 0;
                    right: -400px;
                    width: 400px;
                    height: 100vh;
                    background: white;
                    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                    transition: right 0.3s ease;
                }
                
                .notification-panel.show {
                    right: 0;
                }
                
                .notification-header {
                    padding: 20px;
                    border-bottom: 1px solid #E5E7EB;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .notification-header h3 {
                    margin: 0;
                    color: #111827;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .notification-header-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .btn-mark-all-read {
                    background: #F3F4F6;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    color: #6B7280;
                }
                
                .btn-close-panel {
                    background: none;
                    border: none;
                    font-size: 16px;
                    color: #6B7280;
                    cursor: pointer;
                    padding: 4px;
                }
                
                .notification-content {
                    height: calc(100vh - 80px);
                    overflow-y: auto;
                    padding: 12px;
                }
                
                .notification-item {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    transition: all 0.2s;
                }
                
                .notification-item.unread {
                    background: #F0F9FF;
                    border-left: 3px solid #0066FF;
                }
                
                .notification-item.read {
                    background: #F9FAFB;
                }
                
                .notification-icon {
                    color: #0066FF;
                    font-size: 16px;
                    margin-top: 2px;
                }
                
                .notification-title {
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 4px;
                    font-size: 14px;
                }
                
                .notification-message {
                    color: #6B7280;
                    font-size: 13px;
                    line-height: 1.4;
                    margin-bottom: 8px;
                }
                
                .notification-date {
                    color: #9CA3AF;
                    font-size: 12px;
                }
                
                .empty-notifications {
                    text-align: center;
                    padding: 40px 20px;
                    color: #9CA3AF;
                }
                
                .empty-notifications i {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                
                @media (max-width: 640px) {
                    .notification-panel {
                        width: 100vw;
                        right: -100vw;
                    }
                }
            </style>
        `;
        
        document.body.appendChild(panel);
        this.loadAndShowNotifications();
    }

    /**
     * 알림 로드 및 패널 표시
     */
    async loadAndShowNotifications() {
        const panel = document.querySelector('.notification-panel');
        if (!panel) return;

        panel.classList.add('show');

        try {
            const result = await this.getNotifications();
            
            if (result.success) {
                const content = panel.querySelector('.notification-content');
                content.innerHTML = this.renderNotificationList(result.data);
            }
        } catch (error) {
            console.error('알림 로드 실패:', error);
            const content = panel.querySelector('.notification-content');
            content.innerHTML = '<div class="error-message">알림을 불러오는데 실패했습니다.</div>';
        }
    }

    /**
     * 구독 해제
     */
    destroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}

// 전역 알림 서비스 인스턴스 생성
const notificationService = new NotificationService();

// 페이지 로드 시 초기화
window.addEventListener('load', async () => {
    await notificationService.init();
});

// 페이지 언로드 시 구독 해제
window.addEventListener('beforeunload', () => {
    notificationService.destroy();
});

// 전역 접근 가능하도록 설정
window.notificationService = notificationService;