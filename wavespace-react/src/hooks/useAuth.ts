import { useAuthStore } from '../lib/zustand/authStore';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { useCallback, useEffect } from 'react';

interface UseAuthReturn {
  // State
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  
  // Utility
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isVerified: () => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const { user, isLoading, isAuthenticated, signIn, signUp, signOut, updateProfile, refreshUser } = useAuthStore();

  // 사용자 권한 확인
  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.user_type === role || user.roles?.includes(role);
  }, [user]);

  // 관리자 권한 확인
  const isAdmin = useCallback((): boolean => {
    return hasRole('admin') || hasRole('관리자');
  }, [hasRole]);

  // 이메일 인증 확인
  const isVerified = useCallback((): boolean => {
    if (!user) return false;
    return user.email_confirmed_at != null;
  }, [user]);

  // 실시간 알림 구독 설정
  useEffect(() => {
    if (user?.id) {
      // 알림 권한 요청
      notificationService.requestNotificationPermission();
      
      // 실시간 알림 구독 시작
      notificationService.startRealtimeSubscription(user.id);
      
      return () => {
        // 컴포넌트 언마운트 시 구독 해제
        notificationService.stopRealtimeSubscription();
      };
    }
  }, [user?.id]);

  // 향상된 로그인 함수
  const enhancedSignIn = useCallback(async (email: string, password: string) => {
    const result = await signIn(email, password);
    
    if (result.success) {
      // 로그인 성공 시 추가 작업
      await refreshUser();
    }
    
    return result;
  }, [signIn, refreshUser]);

  // 향상된 회원가입 함수
  const enhancedSignUp = useCallback(async (email: string, password: string, userData: any) => {
    const result = await signUp(email, password, userData);
    
    if (result.success) {
      // 회원가입 성공 시 추가 작업
      await refreshUser();
    }
    
    return result;
  }, [signUp, refreshUser]);

  // 향상된 로그아웃 함수
  const enhancedSignOut = useCallback(async () => {
    // 실시간 구독 해제
    notificationService.stopRealtimeSubscription();
    
    await signOut();
  }, [signOut]);

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Actions
    signIn: enhancedSignIn,
    signUp: enhancedSignUp,
    signOut: enhancedSignOut,
    updateProfile,
    refreshUser,
    
    // Utility
    hasRole,
    isAdmin,
    isVerified
  };
};