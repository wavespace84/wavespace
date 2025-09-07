import { supabase } from '../lib/supabase/client';
import type { User, UserInsert, Profile, ProfileInsert } from '../lib/supabase/types';
import { useAuthStore } from '../lib/zustand/authStore';
import { useAppStore } from '../lib/zustand/appStore';

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * 이메일/비밀번호 로그인
   */
  async signInWithEmail(email: string, password: string) {
    try {
      const authStore = useAuthStore.getState();
      const appStore = useAppStore.getState();
      
      appStore.setGlobalLoading(true);
      appStore.setGlobalError(null);
      
      const result = await authStore.signIn(email, password);
      
      if (result.success) {
        appStore.addNotification({
          type: 'success',
          title: '로그인 성공',
          message: '환영합니다!'
        });
      } else {
        appStore.setGlobalError(result.error || '로그인에 실패했습니다.');
        appStore.addNotification({
          type: 'error',
          title: '로그인 실패',
          message: result.error || '로그인에 실패했습니다.'
        });
      }
      
      appStore.setGlobalLoading(false);
      return result;
    } catch (error) {
      const appStore = useAppStore.getState();
      console.error('로그인 서비스 오류:', error);
      appStore.setGlobalLoading(false);
      appStore.setGlobalError('로그인 중 예기치 못한 오류가 발생했습니다.');
      return { success: false, error: '로그인 중 예기치 못한 오류가 발생했습니다.' };
    }
  }

  /**
   * 회원가입
   */
  async signUp(signUpData: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    phone?: string;
    userType: 'planning' | 'sales' | 'consulting' | 'related' | 'general';
  }) {
    try {
      const authStore = useAuthStore.getState();
      const appStore = useAppStore.getState();
      
      appStore.setGlobalLoading(true);
      appStore.setGlobalError(null);
      
      const userData: Partial<UserInsert> = {
        username: signUpData.username,
        email: signUpData.email,
        full_name: signUpData.fullName,
        phone: signUpData.phone,
        user_type: signUpData.userType,
        role: 'member',
        status: 'pending'
      };
      
      const result = await authStore.signUp(signUpData.email, signUpData.password, userData);
      
      if (result.success) {
        appStore.addNotification({
          type: 'success',
          title: '회원가입 완료',
          message: '이메일을 확인하여 계정을 활성화해주세요.'
        });
      } else {
        appStore.setGlobalError(result.error || '회원가입에 실패했습니다.');
        appStore.addNotification({
          type: 'error',
          title: '회원가입 실패',
          message: result.error || '회원가입에 실패했습니다.'
        });
      }
      
      appStore.setGlobalLoading(false);
      return result;
    } catch (error) {
      const appStore = useAppStore.getState();
      console.error('회원가입 서비스 오류:', error);
      appStore.setGlobalLoading(false);
      appStore.setGlobalError('회원가입 중 예기치 못한 오류가 발생했습니다.');
      return { success: false, error: '회원가입 중 예기치 못한 오류가 발생했습니다.' };
    }
  }

  /**
   * 소셜 로그인
   */
  async signInWithProvider(provider: 'google' | 'kakao' | 'naver') {
    try {
      const appStore = useAppStore.getState();
      appStore.setGlobalLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error(`${provider} 로그인 오류:`, error);
        appStore.setGlobalError(`${provider} 로그인에 실패했습니다.`);
        appStore.setGlobalLoading(false);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      const appStore = useAppStore.getState();
      console.error('소셜 로그인 오류:', error);
      appStore.setGlobalLoading(false);
      appStore.setGlobalError('소셜 로그인 중 오류가 발생했습니다.');
      return { success: false, error: '소셜 로그인 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 로그아웃
   */
  async signOut() {
    try {
      const authStore = useAuthStore.getState();
      const appStore = useAppStore.getState();
      
      await authStore.signOut();
      
      appStore.addNotification({
        type: 'info',
        title: '로그아웃',
        message: '성공적으로 로그아웃되었습니다.'
      });
      
      return { success: true };
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return { success: false, error: '로그아웃 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('비밀번호 재설정 오류:', error);
        return { success: false, error: error.message };
      }
      
      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'success',
        title: '이메일 발송 완료',
        message: '비밀번호 재설정 링크를 이메일로 발송했습니다.'
      });
      
      return { success: true };
    } catch (error) {
      console.error('비밀번호 재설정 서비스 오류:', error);
      return { success: false, error: '비밀번호 재설정 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  getCurrentUser() {
    const authStore = useAuthStore.getState();
    return authStore.user;
  }

  /**
   * 현재 사용자 프로필 조회
   */
  getCurrentProfile() {
    const authStore = useAuthStore.getState();
    return authStore.profile;
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated() {
    const authStore = useAuthStore.getState();
    return authStore.isAuthenticated;
  }

  /**
   * 사용자 권한 확인
   */
  hasRole(role: 'admin' | 'practitioner' | 'member') {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * 관리자 권한 확인
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * 실무자 권한 확인
   */
  isPractitioner() {
    return this.hasRole('practitioner') || this.hasRole('admin');
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile(profileData: Partial<ProfileInsert>) {
    try {
      const authStore = useAuthStore.getState();
      const appStore = useAppStore.getState();
      
      const result = await authStore.updateProfile(profileData);
      
      if (result.success) {
        appStore.addNotification({
          type: 'success',
          title: '프로필 업데이트',
          message: '프로필이 성공적으로 업데이트되었습니다.'
        });
      } else {
        appStore.addNotification({
          type: 'error',
          title: '프로필 업데이트 실패',
          message: result.error || '프로필 업데이트에 실패했습니다.'
        });
      }
      
      return result;
    } catch (error) {
      console.error('프로필 업데이트 서비스 오류:', error);
      return { success: false, error: '프로필 업데이트 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 세션 초기화
   */
  async initializeSession() {
    try {
      const authStore = useAuthStore.getState();
      await authStore.initialize();
    } catch (error) {
      console.error('세션 초기화 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const authService = AuthService.getInstance();