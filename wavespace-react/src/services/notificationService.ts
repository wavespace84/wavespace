import { supabase } from '../lib/supabase/client';
import type { Notification, NotificationInsert, NotificationUpdate } from '../lib/supabase/types';
import { useAppStore } from '../lib/zustand/appStore';
import { useAuthStore } from '../lib/zustand/authStore';

interface NotificationResponse {
  success: boolean;
  data?: Notification[];
  notification?: Notification;
  total?: number;
  unreadCount?: number;
  error?: string;
}

interface NotificationFilters {
  userId?: string;
  type?: 'post' | 'comment' | 'like' | 'point' | 'system' | 'announcement';
  isRead?: boolean;
  category?: string;
}

interface NotificationPagination {
  page: number;
  limit: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private realtimeSubscription: any = null;
  
  private constructor() {}
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 알림 목록 조회
   */
  async getNotifications(
    filters: NotificationFilters = {},
    pagination: NotificationPagination = { page: 1, limit: 20 }
  ): Promise<NotificationResponse> {
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          sender:users!notifications_sender_id_fkey (
            id,
            username,
            full_name
          ),
          recipient:users!notifications_recipient_id_fkey (
            id,
            username,
            full_name
          )
        `, { count: 'exact' });

      // 필터 적용
      if (filters.userId) {
        query = query.eq('recipient_id', filters.userId);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // 페이지네이션
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('알림 목록 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: data as Notification[],
        total: count || 0
      };
    } catch (error) {
      console.error('알림 서비스 오류:', error);
      return { success: false, error: '알림 목록을 불러올 수 없습니다.' };
    }
  }

  /**
   * 읽지 않은 알림 수 조회
   */
  async getUnreadCount(userId: string): Promise<NotificationResponse> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('읽지 않은 알림 수 조회 실패:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        unreadCount: count || 0
      };
    } catch (error) {
      console.error('읽지 않은 알림 수 서비스 오류:', error);
      return { success: false, error: '읽지 않은 알림 수를 조회할 수 없습니다.' };
    }
  }

  /**
   * 알림 생성
   */
  async createNotification(notificationData: NotificationInsert): Promise<NotificationResponse> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          created_at: new Date().toISOString(),
          is_read: false
        })
        .select(`
          *,
          sender:users!notifications_sender_id_fkey (
            id,
            username,
            full_name
          ),
          recipient:users!notifications_recipient_id_fkey (
            id,
            username,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error('알림 생성 실패:', error);
        return { success: false, error: '알림 생성에 실패했습니다.' };
      }

      // 실시간 알림 전송 (브라우저 알림)
      await this.sendBrowserNotification(data);

      return {
        success: true,
        notification: data as Notification
      };
    } catch (error) {
      console.error('알림 생성 서비스 오류:', error);
      return { success: false, error: '알림 생성 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(id: string): Promise<NotificationResponse> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('알림 읽음 처리 실패:', error);
        return { success: false, error: '알림 읽음 처리에 실패했습니다.' };
      }

      return {
        success: true,
        notification: data as Notification
      };
    } catch (error) {
      console.error('알림 읽음 처리 서비스 오류:', error);
      return { success: false, error: '알림 읽음 처리 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('모든 알림 읽음 처리 실패:', error);
        return { success: false, error: '알림 읽음 처리에 실패했습니다.' };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '알림 읽음 처리',
        message: '모든 알림을 읽음으로 표시했습니다.'
      });

      return { success: true };
    } catch (error) {
      console.error('모든 알림 읽음 처리 서비스 오류:', error);
      return { success: false, error: '알림 읽음 처리 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 알림 삭제
   */
  async deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('알림 삭제 실패:', error);
        return { success: false, error: '알림 삭제에 실패했습니다.' };
      }

      return { success: true };
    } catch (error) {
      console.error('알림 삭제 서비스 오류:', error);
      return { success: false, error: '알림 삭제 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 시스템 공지 알림 생성 (모든 사용자에게)
   */
  async createSystemAnnouncement(
    title: string,
    message: string,
    category?: string,
    actionUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 활성 사용자 목록 조회
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('status', 'active');

      if (usersError) {
        console.error('사용자 목록 조회 실패:', usersError);
        return { success: false, error: '사용자 목록 조회에 실패했습니다.' };
      }

      // 모든 사용자에게 알림 생성
      const notifications = users?.map(user => ({
        recipient_id: user.id,
        type: 'system' as const,
        title,
        message,
        category: category || 'announcement',
        action_url: actionUrl,
        created_at: new Date().toISOString(),
        is_read: false
      })) || [];

      if (notifications.length === 0) {
        return { success: false, error: '알림을 받을 사용자가 없습니다.' };
      }

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('시스템 알림 생성 실패:', error);
        return { success: false, error: '시스템 알림 생성에 실패했습니다.' };
      }

      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '시스템 알림 발송',
        message: `${notifications.length}명의 사용자에게 알림을 발송했습니다.`
      });

      return { success: true };
    } catch (error) {
      console.error('시스템 알림 서비스 오류:', error);
      return { success: false, error: '시스템 알림 생성 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 브라우저 알림 전송
   */
  private async sendBrowserNotification(notification: Notification): Promise<void> {
    try {
      // 브라우저 알림 권한 확인
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            });
          }
        }
      }
    } catch (error) {
      console.error('브라우저 알림 전송 실패:', error);
    }
  }

  /**
   * 실시간 알림 구독 시작
   */
  startRealtimeSubscription(userId: string): void {
    try {
      // 기존 구독 해제
      if (this.realtimeSubscription) {
        this.realtimeSubscription.unsubscribe();
      }

      // 새 구독 설정
      this.realtimeSubscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          (payload) => {
            // 새 알림을 앱 스토어에 추가
            const appStore = useAppStore.getState();
            appStore.addNotification({
              type: 'info',
              title: payload.new.title,
              message: payload.new.message
            });

            // 브라우저 알림 전송
            this.sendBrowserNotification(payload.new as Notification);
          }
        )
        .subscribe();
    } catch (error) {
      console.error('실시간 알림 구독 설정 실패:', error);
    }
  }

  /**
   * 실시간 알림 구독 해제
   */
  stopRealtimeSubscription(): void {
    try {
      if (this.realtimeSubscription) {
        this.realtimeSubscription.unsubscribe();
        this.realtimeSubscription = null;
      }
    } catch (error) {
      console.error('실시간 알림 구독 해제 실패:', error);
    }
  }

  /**
   * 포인트 알림 생성
   */
  async createPointNotification(
    userId: string,
    type: 'earn' | 'spend',
    amount: number,
    reason: string
  ): Promise<void> {
    try {
      await this.createNotification({
        recipient_id: userId,
        type: 'point',
        title: type === 'earn' ? '포인트 적립' : '포인트 사용',
        message: `${amount} 포인트가 ${type === 'earn' ? '적립' : '사용'}되었습니다. (${reason})`,
        category: 'point',
        metadata: { amount, reason, type }
      });
    } catch (error) {
      console.error('포인트 알림 생성 실패:', error);
    }
  }

  /**
   * 게시글 관련 알림 생성
   */
  async createPostNotification(
    recipientId: string,
    senderId: string,
    postId: string,
    type: 'like' | 'comment',
    postTitle: string
  ): Promise<void> {
    try {
      const message = type === 'like' 
        ? `"${postTitle}" 게시글에 좋아요가 눌렸습니다.`
        : `"${postTitle}" 게시글에 새 댓글이 달렸습니다.`;

      await this.createNotification({
        recipient_id: recipientId,
        sender_id: senderId,
        type: 'post',
        title: type === 'like' ? '좋아요 알림' : '댓글 알림',
        message,
        category: type,
        action_url: `/posts/${postId}`,
        metadata: { postId, postTitle, type }
      });
    } catch (error) {
      console.error('게시글 알림 생성 실패:', error);
    }
  }

  /**
   * 브라우저 알림 권한 요청
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    try {
      if ('Notification' in window) {
        return await Notification.requestPermission();
      }
      return 'denied';
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return 'denied';
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const notificationService = NotificationService.getInstance();