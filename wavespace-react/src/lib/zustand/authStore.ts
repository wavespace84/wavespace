import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, Profile } from '../supabase/types';
import { supabase, getCurrentSession, getCurrentUser } from '../supabase/client';

interface AuthState {
  // 상태
  isLoading: boolean;
  isAuthenticated: boolean;
  supabaseUser: SupabaseUser | null;
  user: User | null;
  profile: Profile | null;
  
  // 액션
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isLoading: true,
      isAuthenticated: false,
      supabaseUser: null,
      user: null,
      profile: null,

      // 초기화
      initialize: async () => {
        try {
          set({ isLoading: true });
          
          const session = await getCurrentSession();
          if (session?.user) {
            const supabaseUser = session.user;
            
            // 사용자 정보 가져오기
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('auth_user_id', supabaseUser.id)
              .single();
              
            if (userError) {
              console.error('사용자 정보 조회 실패:', userError);
              set({ isLoading: false, isAuthenticated: false });
              return;
            }
            
            // 프로필 정보 가져오기
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
              
            set({
              isLoading: false,
              isAuthenticated: true,
              supabaseUser,
              user,
              profile: profile || null
            });
          } else {
            set({ 
              isLoading: false, 
              isAuthenticated: false,
              supabaseUser: null,
              user: null,
              profile: null
            });
          }
        } catch (error) {
          console.error('인증 초기화 오류:', error);
          set({ 
            isLoading: false, 
            isAuthenticated: false,
            supabaseUser: null,
            user: null,
            profile: null
          });
        }
      },

      // 로그인
      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }
          
          if (data.user) {
            // 사용자 정보 조회
            const { data: user, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('auth_user_id', data.user.id)
              .single();
              
            if (userError) {
              set({ isLoading: false });
              return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
            }
            
            // 프로필 정보 조회
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
              
            set({
              isLoading: false,
              isAuthenticated: true,
              supabaseUser: data.user,
              user,
              profile: profile || null
            });
          }
          
          return { success: true };
        } catch (error) {
          console.error('로그인 오류:', error);
          set({ isLoading: false });
          return { success: false, error: '로그인 중 오류가 발생했습니다.' };
        }
      },

      // 회원가입
      signUp: async (email: string, password: string, userData: Partial<User>) => {
        try {
          set({ isLoading: true });
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password
          });
          
          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }
          
          if (data.user) {
            // 사용자 정보 생성
            const { error: userError } = await supabase
              .from('users')
              .insert({
                auth_user_id: data.user.id,
                email,
                ...userData
              });
              
            if (userError) {
              console.error('사용자 정보 생성 실패:', userError);
              set({ isLoading: false });
              return { success: false, error: '사용자 정보 생성에 실패했습니다.' };
            }
          }
          
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          console.error('회원가입 오류:', error);
          set({ isLoading: false });
          return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
        }
      },

      // 로그아웃
      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({
            isAuthenticated: false,
            supabaseUser: null,
            user: null,
            profile: null
          });
        } catch (error) {
          console.error('로그아웃 오류:', error);
        }
      },

      // 프로필 업데이트
      updateProfile: async (profileData: Partial<Profile>) => {
        try {
          const { user } = get();
          if (!user) {
            return { success: false, error: '로그인이 필요합니다.' };
          }
          
          const { data, error } = await supabase
            .from('profiles')
            .upsert({
              user_id: user.id,
              ...profileData,
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (error) {
            console.error('프로필 업데이트 실패:', error);
            return { success: false, error: '프로필 업데이트에 실패했습니다.' };
          }
          
          set({ profile: data });
          return { success: true };
        } catch (error) {
          console.error('프로필 업데이트 오류:', error);
          return { success: false, error: '프로필 업데이트 중 오류가 발생했습니다.' };
        }
      },

      // 사용자 정보 새로고침
      refreshUser: async () => {
        const { initialize } = get();
        await initialize();
      },

      // 인증 상태 초기화
      clearAuth: () => {
        set({
          isAuthenticated: false,
          supabaseUser: null,
          user: null,
          profile: null,
          isLoading: false
        });
      }
    }),
    {
      name: 'wavespace-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        profile: state.profile
      })
    }
  )
);