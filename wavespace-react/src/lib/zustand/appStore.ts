import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI 상태
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  isMobile: boolean;
  
  // 모달/사이드패널 상태
  isLoginModalOpen: boolean;
  isProfileModalOpen: boolean;
  
  // 로딩 및 에러 상태
  globalLoading: boolean;
  globalError: string | null;
  
  // 알림 상태
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  
  // 액션
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setIsMobile: (isMobile: boolean) => void;
  
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  
  setGlobalLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      sidebarCollapsed: false,
      theme: 'light',
      isMobile: false,
      
      isLoginModalOpen: false,
      isProfileModalOpen: false,
      
      globalLoading: false,
      globalError: null,
      
      notifications: [],
      
      // UI 액션
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
      setIsMobile: (isMobile) => set({ isMobile }),
      
      // 모달 액션
      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
      openProfileModal: () => set({ isProfileModalOpen: true }),
      closeProfileModal: () => set({ isProfileModalOpen: false }),
      
      // 로딩/에러 액션
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
      setGlobalError: (error) => set({ globalError: error }),
      
      // 알림 액션
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          read: false
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50) // 최대 50개까지
        }));
      },
      
      markNotificationAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        }));
      },
      
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(notification => notification.id !== id)
        }));
      },
      
      clearAllNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'wavespace-app',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        notifications: state.notifications
      })
    }
  )
);