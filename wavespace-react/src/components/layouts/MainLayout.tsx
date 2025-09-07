import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { LoginModal } from '../common/LoginModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useAuthStore } from '../../lib/zustand/authStore';
import { useAppStore } from '../../lib/zustand/appStore';

export const MainLayout = () => {
  const { initialize, isLoading: authLoading } = useAuthStore();
  const { 
    sidebarCollapsed, 
    isMobile, 
    setIsMobile,
    globalLoading,
    globalError
  } = useAppStore();

  // 인증 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 반응형 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // 인증 로딩 중이면 로딩 스피너 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
        ${sidebarCollapsed && !isMobile ? 'w-16' : 'w-64'}
        ${sidebarCollapsed && isMobile ? '-translate-x-full' : 'translate-x-0'}
        transition-all duration-300 ease-in-out
      `}>
        <Sidebar />
      </div>

      {/* 모바일 오버레이 */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => useAppStore.getState().setSidebarCollapsed(true)}
        />
      )}

      {/* 메인 컨텐츠 */}
      <div className={`
        flex-1 flex flex-col min-h-screen
        ${!isMobile && sidebarCollapsed ? 'ml-0' : ''}
        transition-all duration-300 ease-in-out
      `}>
        {/* 헤더 */}
        <Header />

        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-y-auto">
          {globalError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{globalError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    className="text-red-400 hover:text-red-600"
                    onClick={() => useAppStore.getState().setGlobalError(null)}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <ErrorBoundary>
            <Suspense 
              fallback={
                <div className="flex items-center justify-center p-8">
                  <LoadingSpinner size="medium" message="페이지 로딩 중..." />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* 전역 로딩 오버레이 */}
        {globalLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <LoadingSpinner size="medium" message="처리 중..." />
            </div>
          </div>
        )}
      </div>

      {/* 로그인 모달 */}
      <LoginModal />
    </div>
  );
};