import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useAppStore } from '../../lib/zustand/appStore';

export const AuthLayout = () => {
  const { globalLoading, globalError } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* 전역 에러 표시 */}
      {globalError && (
        <div className="fixed top-4 right-4 max-w-md z-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{globalError}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  className="text-red-400 hover:text-red-600 transition-colors"
                  onClick={() => useAppStore.getState().setGlobalError(null)}
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 백그라운드 패턴 */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform text-blue-100"
          fill="currentColor"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="pattern"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 32V.5H32V32z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      {/* 로고/브랜드 */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WAVE space</h1>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              BETA
            </span>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* 인증 카드 */}
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <ErrorBoundary>
            <Suspense 
              fallback={
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="medium" message="로딩 중..." />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* 하단 정보 */}
        <div className="text-center text-sm text-gray-600">
          <p>대한민국 No.1 분양실무자 대표 커뮤니티</p>
          <div className="mt-2 space-x-4">
            <a href="/support/policy" className="hover:text-blue-600 transition-colors">
              이용약관
            </a>
            <a href="/support/center" className="hover:text-blue-600 transition-colors">
              고객센터
            </a>
          </div>
        </div>
      </div>

      {/* 전역 로딩 오버레이 */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <LoadingSpinner size="medium" message="처리 중..." />
          </div>
        </div>
      )}
    </div>
  );
};