import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layouts/MainLayout';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// 페이지 컴포넌트 (지연 로딩)
import { lazy } from 'react';

// 메인/랜딩 페이지
const HomePage = lazy(() => import('../pages/HomePage'));

// 인증 페이지
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('../pages/auth/SignUpPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const AuthCallbackPage = lazy(() => import('../pages/auth/AuthCallbackPage'));

// 커뮤니티 페이지
const ForumPage = lazy(() => import('../pages/community/ForumPage'));
const QnaPage = lazy(() => import('../pages/community/QnaPage'));
const HumorPage = lazy(() => import('../pages/community/HumorPage'));
const NoticePage = lazy(() => import('../pages/community/NoticePage'));
const UpdatesPage = lazy(() => import('../pages/community/UpdatesPage'));

// 구인구직 페이지
const SalesRecruitPage = lazy(() => import('../pages/jobs/SalesRecruitPage'));
const PlanningRecruitmentPage = lazy(() => import('../pages/jobs/PlanningRecruitmentPage'));
const AIMatchingPage = lazy(() => import('../pages/jobs/AIMatchingPage'));

// 포인트/멤버십 페이지
const PointsShopPage = lazy(() => import('../pages/points/PointsShopPage'));
const PointsRankingPage = lazy(() => import('../pages/points/PointsRankingPage'));
const PointsChargePage = lazy(() => import('../pages/points/PointsChargePage'));
const PointsPolicyPage = lazy(() => import('../pages/points/PointsPolicyPage'));
const PlusMembershipPage = lazy(() => import('../pages/membership/PlusMembershipPage'));

// 데이터/AI 서비스 페이지
const DataCenterPage = lazy(() => import('../pages/data/DataCenterPage'));
const AIReportPage = lazy(() => import('../pages/data/AIReportPage'));
const MarketResearchPage = lazy(() => import('../pages/data/MarketResearchPage'));

// 부가 서비스 페이지
const EducationPage = lazy(() => import('../pages/services/EducationPage'));
const EventsPage = lazy(() => import('../pages/services/EventsPage'));
const AttendancePage = lazy(() => import('../pages/services/AttendancePage'));
const HallOfFamePage = lazy(() => import('../pages/services/HallOfFamePage'));

// 정보/지원 페이지
const SupportPage = lazy(() => import('../pages/support/SupportPage'));
const ProposalPage = lazy(() => import('../pages/support/ProposalPage'));
const PolicyPage = lazy(() => import('../pages/support/PolicyPage'));
const OtherDocsPage = lazy(() => import('../pages/support/OtherDocsPage'));

// 프로필 페이지
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));

// 관리자 페이지
const AdminPage = lazy(() => import('../pages/admin/AdminPage'));
const AdminFeedbacksPage = lazy(() => import('../pages/admin/AdminFeedbacksPage'));

// 에러 페이지
const NotFoundPage = lazy(() => import('../pages/error/NotFoundPage'));
const ErrorPage = lazy(() => import('../pages/error/ErrorPage'));

export const router = createBrowserRouter([
  // 메인 레이아웃 라우트
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      // 홈
      {
        index: true,
        element: <HomePage />
      },
      
      // 커뮤니티
      {
        path: 'community',
        children: [
          {
            path: 'forum',
            element: <ForumPage />
          },
          {
            path: 'qna',
            element: <QnaPage />
          },
          {
            path: 'humor',
            element: <HumorPage />
          },
          {
            path: 'notice',
            element: <NoticePage />
          },
          {
            path: 'updates',
            element: <UpdatesPage />
          }
        ]
      },
      
      // 구인구직
      {
        path: 'jobs',
        children: [
          {
            path: 'sales-recruit',
            element: <SalesRecruitPage />
          },
          {
            path: 'planning-recruitment',
            element: <PlanningRecruitmentPage />
          },
          {
            path: 'ai-matching',
            element: <ProtectedRoute><AIMatchingPage /></ProtectedRoute>
          }
        ]
      },
      
      // 포인트/멤버십
      {
        path: 'points',
        children: [
          {
            path: 'shop',
            element: <ProtectedRoute><PointsShopPage /></ProtectedRoute>
          },
          {
            path: 'ranking',
            element: <PointsRankingPage />
          },
          {
            path: 'charge',
            element: <ProtectedRoute><PointsChargePage /></ProtectedRoute>
          },
          {
            path: 'policy',
            element: <PointsPolicyPage />
          }
        ]
      },
      
      // 멤버십
      {
        path: 'membership',
        children: [
          {
            path: 'plus',
            element: <ProtectedRoute><PlusMembershipPage /></ProtectedRoute>
          }
        ]
      },
      
      // 데이터/AI 서비스
      {
        path: 'data',
        children: [
          {
            path: 'center',
            element: <ProtectedRoute><DataCenterPage /></ProtectedRoute>
          },
          {
            path: 'ai-report',
            element: <ProtectedRoute><AIReportPage /></ProtectedRoute>
          },
          {
            path: 'market-research',
            element: <ProtectedRoute><MarketResearchPage /></ProtectedRoute>
          }
        ]
      },
      
      // 부가 서비스
      {
        path: 'services',
        children: [
          {
            path: 'education',
            element: <EducationPage />
          },
          {
            path: 'events',
            element: <EventsPage />
          },
          {
            path: 'attendance',
            element: <ProtectedRoute><AttendancePage /></ProtectedRoute>
          },
          {
            path: 'hall-of-fame',
            element: <HallOfFamePage />
          }
        ]
      },
      
      // 정보/지원
      {
        path: 'support',
        children: [
          {
            path: 'center',
            element: <SupportPage />
          },
          {
            path: 'proposal',
            element: <ProposalPage />
          },
          {
            path: 'policy',
            element: <PolicyPage />
          },
          {
            path: 'other-docs',
            element: <OtherDocsPage />
          }
        ]
      },
      
      // 사용자 프로필
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      }
    ]
  },
  
  // 인증 레이아웃 라우트
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'signup',
        element: <SignUpPage />
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />
      },
      {
        path: 'callback',
        element: <AuthCallbackPage />
      }
    ]
  },
  
  // 관리자 페이지 (별도 레이아웃)
  {
    path: '/admin',
    element: <ProtectedRoute requireRole="admin"><AdminPage /></ProtectedRoute>
  },
  {
    path: '/admin/feedbacks',
    element: <ProtectedRoute requireRole="admin"><AdminFeedbacksPage /></ProtectedRoute>
  },
  
  // 레거시 라우트 리다이렉션
  {
    path: '/forum.html',
    element: <Navigate to="/community/forum" replace />
  },
  {
    path: '/login.html',
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: '/signup.html',
    element: <Navigate to="/auth/signup" replace />
  },
  {
    path: '/points-ranking.html',
    element: <Navigate to="/points/ranking" replace />
  },
  // 기타 레거시 HTML 파일들을 적절한 React 라우트로 리다이렉션
  
  // 404 페이지
  {
    path: '*',
    element: <NotFoundPage />
  }
]);