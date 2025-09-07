import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Platform } from '../utils/platform';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PerformanceMonitor } from '../utils/performance';

// 레이아웃 컴포넌트들 (즉시 로드)
import Layout from '../components/layouts/Layout';
import AuthLayout from '../components/layouts/AuthLayout';
import AdminLayout from '../components/layouts/AdminLayout';

// 성능 최적화된 lazy loading HOC
function withLazyLoading<T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  componentName: string
) {
  return lazy(async () => {
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      
      // 개발 환경에서 로딩 시간 모니터링
      if (process.env.NODE_ENV === 'development' && loadTime > 1000) {
        console.warn(`🐌 Slow component loading: ${componentName} took ${loadTime.toFixed(2)}ms`);
      }
      
      // 성능 메트릭 기록
      PerformanceMonitor.measureComponentRender(componentName, () => {});
      
      return module;
    } catch (error) {
      console.error(`❌ Failed to load component: ${componentName}`, error);
      throw error;
    }
  });
}

// 페이지 컴포넌트들 (지연 로드)
const HomePage = withLazyLoading(() => import('../pages/HomePage'), 'HomePage');
const LoginPage = withLazyLoading(() => import('../pages/auth/LoginPage'), 'LoginPage');
const SignupPage = withLazyLoading(() => import('../pages/auth/SignupPage'), 'SignupPage');
const ResetPasswordPage = withLazyLoading(() => import('../pages/auth/ResetPasswordPage'), 'ResetPasswordPage');
const ProfilePage = withLazyLoading(() => import('../pages/ProfilePage'), 'ProfilePage');

// 커뮤니티 페이지들 (청크 분할)
const ForumPage = withLazyLoading(() => import('../pages/community/ForumPage'), 'ForumPage');
const QnaPage = withLazyLoading(() => import('../pages/community/QnaPage'), 'QnaPage');
const HumorPage = withLazyLoading(() => import('../pages/community/HumorPage'), 'HumorPage');
const NoticePage = withLazyLoading(() => import('../pages/community/NoticePage'), 'NoticePage');
const UpdatesPage = withLazyLoading(() => import('../pages/community/UpdatesPage'), 'UpdatesPage');

// 채용/구인구직 페이지들
const SalesRecruitPage = withLazyLoading(() => import('../pages/recruitment/SalesRecruitPage'), 'SalesRecruitPage');
const PlanningRecruitmentPage = withLazyLoading(() => import('../pages/recruitment/PlanningRecruitmentPage'), 'PlanningRecruitmentPage');

// 포인트/멤버십 페이지들
const PointsShopPage = withLazyLoading(() => import('../pages/points/PointsShopPage'), 'PointsShopPage');
const PointsRankingPage = withLazyLoading(() => import('../pages/points/PointsRankingPage'), 'PointsRankingPage');
const PointsChargePage = withLazyLoading(() => import('../pages/points/PointsChargePage'), 'PointsChargePage');
const PointsPolicyPage = withLazyLoading(() => import('../pages/points/PointsPolicyPage'), 'PointsPolicyPage');
const PlusMembershipPage = withLazyLoading(() => import('../pages/points/PlusMembershipPage'), 'PlusMembershipPage');

// 데이터/AI 서비스 페이지들
const DataCenterPage = withLazyLoading(() => import('../pages/services/DataCenterPage'), 'DataCenterPage');
const AiMatchingPage = withLazyLoading(() => import('../pages/services/AiMatchingPage'), 'AiMatchingPage');
const AiReportPage = withLazyLoading(() => import('../pages/services/AiReportPage'), 'AiReportPage');
const MarketResearchPage = withLazyLoading(() => import('../pages/services/MarketResearchPage'), 'MarketResearchPage');

// 부가 서비스 페이지들
const EducationPage = withLazyLoading(() => import('../pages/extras/EducationPage'), 'EducationPage');
const EventsPage = withLazyLoading(() => import('../pages/extras/EventsPage'), 'EventsPage');
const AttendancePage = withLazyLoading(() => import('../pages/extras/AttendancePage'), 'AttendancePage');
const HallOfFamePage = withLazyLoading(() => import('../pages/extras/HallOfFamePage'), 'HallOfFamePage');

// 정보/지원 페이지들
const SupportPage = withLazyLoading(() => import('../pages/info/SupportPage'), 'SupportPage');
const ProposalPage = withLazyLoading(() => import('../pages/info/ProposalPage'), 'ProposalPage');
const PolicyPage = withLazyLoading(() => import('../pages/info/PolicyPage'), 'PolicyPage');
const OtherDocsPage = withLazyLoading(() => import('../pages/info/OtherDocsPage'), 'OtherDocsPage');

// 관리자 페이지들 (별도 청크)
const AdminPage = withLazyLoading(() => import('../pages/admin/AdminPage'), 'AdminPage');
const AdminFeedbacksPage = withLazyLoading(() => import('../pages/admin/AdminFeedbacksPage'), 'AdminFeedbacksPage');

// 404 페이지
const NotFoundPage = withLazyLoading(() => import('../pages/NotFoundPage'), 'NotFoundPage');

// 로딩 컴포넌트
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
    </div>
  </div>
);

// 에러 폴백 컴포넌트
const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-4">😵</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">페이지 로딩 오류</h2>
      <p className="text-gray-600 mb-6">
        페이지를 불러오는 중 오류가 발생했습니다.
      </p>
      <button
        onClick={resetError}
        className="btn-primary mr-4"
      >
        다시 시도
      </button>
      <button
        onClick={() => window.location.href = '/'}
        className="btn-secondary"
      >
        홈으로 이동
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-gray-500">에러 상세 정보</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// 라우터 설정
const routes = [
  {
    path: '/',
    element: (
      <ErrorBoundary fallback={ErrorFallback}>
        <Layout>
          <Outlet />
        </Layout>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'profile', element: <ProfilePage /> },
      
      // 커뮤니티
      { path: 'forum', element: <ForumPage /> },
      { path: 'qna', element: <QnaPage /> },
      { path: 'humor', element: <HumorPage /> },
      { path: 'notice', element: <NoticePage /> },
      { path: 'updates', element: <UpdatesPage /> },
      
      // 채용/구인구직
      { path: 'sales-recruit', element: <SalesRecruitPage /> },
      { path: 'planning-recruitment', element: <PlanningRecruitmentPage /> },
      
      // 포인트/멤버십
      { path: 'points/shop', element: <PointsShopPage /> },
      { path: 'points/ranking', element: <PointsRankingPage /> },
      { path: 'points/charge', element: <PointsChargePage /> },
      { path: 'points/policy', element: <PointsPolicyPage /> },
      { path: 'plus-membership', element: <PlusMembershipPage /> },
      
      // 데이터/AI 서비스
      { path: 'data-center', element: <DataCenterPage /> },
      { path: 'ai-matching', element: <AiMatchingPage /> },
      { path: 'ai-report', element: <AiReportPage /> },
      { path: 'market-research', element: <MarketResearchPage /> },
      
      // 부가 서비스
      { path: 'education', element: <EducationPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'hall-of-fame', element: <HallOfFamePage /> },
      
      // 정보/지원
      { path: 'support', element: <SupportPage /> },
      { path: 'proposal', element: <ProposalPage /> },
      { path: 'policy', element: <PolicyPage /> },
      { path: 'other-docs', element: <OtherDocsPage /> }
    ]
  },
  
  // 인증 라우트
  {
    path: '/auth',
    element: (
      <ErrorBoundary fallback={ErrorFallback}>
        <AuthLayout>
          <Outlet />
        </AuthLayout>
      </ErrorBoundary>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> }
    ]
  },
  
  // 관리자 라우트
  {
    path: '/admin',
    element: (
      <ErrorBoundary fallback={ErrorFallback}>
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <AdminPage /> },
      { path: 'feedbacks', element: <AdminFeedbacksPage /> }
    ]
  },
  
  // 404 페이지
  {
    path: '*',
    element: <NotFoundPage />
  }
];

// 플랫폼별 라우터 선택
const createRouter = Platform.isWeb 
  ? createBrowserRouter 
  : createHashRouter;

const router = createRouter(routes);

// 라우터 프로바이더 컴포넌트
export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

// 라우터 성능 모니터링
export const useRouterPerformance = () => {
  React.useEffect(() => {
    const measureRouteChange = () => {
      if (Platform.isWeb && 'performance' in window) {
        const entries = performance.getEntriesByType('navigation');
        if (entries.length > 0) {
          const entry = entries[0] as PerformanceNavigationTiming;
          const loadTime = entry.loadEventEnd - entry.loadEventStart;
          
          if (loadTime > 3000) {
            console.warn(`🐌 Slow route loading detected: ${loadTime}ms`);
          }
        }
      }
    };

    // 라우트 변경 시 성능 측정
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('route-change')) {
          if (entry.duration > 2000) {
            console.warn(`🐌 Slow route transition: ${entry.name} took ${entry.duration}ms`);
          }
        }
      });
    });

    if (Platform.isWeb && 'PerformanceObserver' in window) {
      observer.observe({ entryTypes: ['measure'] });
    }

    measureRouteChange();

    return () => {
      observer?.disconnect();
    };
  }, []);
};

// 코드 분할 통계 (개발용)
export const getChunkLoadingStats = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  const stats = {
    totalChunks: 0,
    loadedChunks: 0,
    failedChunks: 0,
    averageLoadTime: 0
  };

  // 개발 환경에서 청크 로딩 통계 제공
  return stats;
};

export default AppRouter;