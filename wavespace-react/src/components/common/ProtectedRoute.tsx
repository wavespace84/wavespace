import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/zustand/authStore';
import { useAppStore } from '../../lib/zustand/appStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'admin' | 'practitioner' | 'member';
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireRole,
  requireAuth = true 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { openLoginModal } = useAppStore();

  useEffect(() => {
    // 인증이 필요하지만 로그인되지 않은 경우 로그인 모달 열기
    if (requireAuth && !isLoading && !isAuthenticated) {
      openLoginModal();
    }
  }, [requireAuth, isLoading, isAuthenticated, openLoginModal]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="인증 확인 중..." />
      </div>
    );
  }

  // 인증이 필요하지만 로그인되지 않음
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 특정 역할이 필요함
  if (requireRole && user) {
    const hasRequiredRole = (() => {
      switch (requireRole) {
        case 'admin':
          return user.role === 'admin';
        case 'practitioner':
          return ['practitioner', 'admin'].includes(user.role);
        case 'member':
          return ['member', 'practitioner', 'admin'].includes(user.role);
        default:
          return false;
      }
    })();

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              접근 권한이 없습니다
            </h2>
            
            <p className="text-gray-600 mb-6">
              이 페이지에 접근하기 위해서는 {
                requireRole === 'admin' ? '관리자' :
                requireRole === 'practitioner' ? '실무자' :
                '회원'
              } 권한이 필요합니다.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                이전 페이지로
              </button>
              
              <a
                href="/"
                className="block w-full px-4 py-2 text-center text-blue-600 hover:text-blue-800 focus:outline-none focus:underline transition-colors"
              >
                홈으로 돌아가기
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};