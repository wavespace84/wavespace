import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './lib/zustand/authStore';
import { useAppStore } from './lib/zustand/appStore';
import { onAuthStateChange } from './lib/supabase/client';
import './index.css';

function App() {
  const { initialize, refreshUser } = useAuthStore();
  const { addNotification } = useAppStore();

  useEffect(() => {
    // 앱 초기화
    const initializeApp = async () => {
      try {
        // 인증 상태 초기화
        await initialize();

        // Supabase 인증 상태 변경 리스너 설정
        const { data: { subscription } } = onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          switch (event) {
            case 'SIGNED_IN':
              await refreshUser();
              addNotification({
                type: 'success',
                title: '로그인 성공',
                message: '환영합니다!'
              });
              break;
              
            case 'SIGNED_OUT':
              useAuthStore.getState().clearAuth();
              addNotification({
                type: 'info',
                title: '로그아웃',
                message: '안전하게 로그아웃되었습니다.'
              });
              break;
              
            case 'TOKEN_REFRESHED':
              // 토큰이 새로고침되면 사용자 정보도 업데이트
              await refreshUser();
              break;
              
            case 'USER_UPDATED':
              await refreshUser();
              break;
          }
        });

        // 컴포넌트 언마운트 시 리스너 해제
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('App initialization failed:', error);
        addNotification({
          type: 'error',
          title: '초기화 오류',
          message: '앱 초기화 중 오류가 발생했습니다.'
        });
      }
    };

    initializeApp();
  }, [initialize, refreshUser, addNotification]);

  return <RouterProvider router={router} />;
}

export default App;
