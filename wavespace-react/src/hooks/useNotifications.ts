import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../lib/supabase/types';
import { useAuth } from './useAuth';

interface UseNotificationsReturn {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  
  // Pagination
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

interface UseNotificationsOptions {
  autoFetch?: boolean;
  pageSize?: number;
  filters?: {
    type?: string;
    isRead?: boolean;
    category?: string;
  };
}

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const { autoFetch = true, pageSize = 20, filters = {} } = options;
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // 알림 목록 조회
  const fetchNotifications = useCallback(async (page = 1) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await notificationService.getNotifications(
        { userId: user.id, ...filters },
        { page, limit: pageSize }
      );

      if (response.success && response.data) {
        if (page === 1) {
          setNotifications(response.data);
        } else {
          setNotifications(prev => [...prev, ...response.data!]);
        }
        
        setTotal(response.total || 0);
        setHasMore((response.data.length === pageSize) && ((page * pageSize) < (response.total || 0)));
        setCurrentPage(page);
      } else {
        setError(response.error || '알림을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('알림 조회 중 오류가 발생했습니다.');
      console.error('알림 조회 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filters, pageSize]);

  // 읽지 않은 알림 수 조회
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await notificationService.getUnreadCount(user.id);
      if (response.success) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (err) {
      console.error('읽지 않은 알림 수 조회 오류:', err);
    }
  }, [user?.id]);

  // 알림 읽음 처리
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationService.markAsRead(id);
      
      if (response.success) {
        // 로컬 상태 업데이트
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: true, read_at: new Date().toISOString() }
              : notification
          )
        );
        
        // 읽지 않은 수 업데이트
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('알림 읽음 처리 오류:', err);
    }
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await notificationService.markAllAsRead(user.id);
      
      if (response.success) {
        // 로컬 상태 업데이트
        setNotifications(prev => 
          prev.map(notification => ({ 
            ...notification, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }))
        );
        
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('모든 알림 읽음 처리 오류:', err);
    }
  }, [user?.id]);

  // 알림 삭제
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await notificationService.deleteNotification(id);
      
      if (response.success) {
        // 로컬 상태에서 제거
        const deletedNotification = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // 읽지 않은 알림이었다면 카운트 감소
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        setTotal(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('알림 삭제 오류:', err);
    }
  }, [notifications]);

  // 새로고침
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(true);
    await Promise.all([
      fetchNotifications(1),
      fetchUnreadCount()
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // 더 많은 알림 로드
  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchNotifications(currentPage + 1);
    }
  }, [hasMore, isLoading, currentPage, fetchNotifications]);

  // 초기 데이터 로드
  useEffect(() => {
    if (autoFetch && user?.id) {
      refresh();
    }
  }, [user?.id, autoFetch, refresh]);

  // 읽지 않은 알림 수 주기적 업데이트
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [user?.id, fetchUnreadCount]);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    
    // Pagination
    hasMore,
    loadMore
  };
};