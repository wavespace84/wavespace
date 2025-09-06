# WAVE SPACE React + Vite 전환 완전 가이드

## 📋 **1단계: 프로젝트 초기화 및 개발환경 구축**

### **1.1 새 React 프로젝트 생성**
```bash
# Vite React TypeScript 템플릿으로 새 프로젝트 생성
npm create vite@latest wavespace-react -- --template react-ts
cd wavespace-react
npm install

# 개발 서버 실행 테스트
npm run dev
```

### **1.2 필수 의존성 설치**
```bash
# 라우팅
npm install react-router-dom
npm install -D @types/react-router-dom

# 상태관리
npm install zustand immer

# Supabase
npm install @supabase/supabase-js

# 스타일링
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
npm install clsx tailwind-merge

# 폼 관리
npm install react-hook-form @hookform/resolvers zod

# 유틸리티
npm install date-fns lodash-es
npm install -D @types/lodash-es

# 개발 도구
npm install -D prettier eslint-config-prettier
npm install -D @types/node
```

### **1.3 개발 도구 및 환경 설정**
```bash
# TailwindCSS 초기화
npx tailwindcss init -p

# VSCode 설정 파일 생성
mkdir .vscode
```

**생성할 설정 파일들:**
- `.env.example` - 환경변수 템플릿
- `.env.local` - 로컬 개발용 환경변수
- `vite.config.ts` - Vite 설정
- `tailwind.config.js` - TailwindCSS 설정
- `.eslintrc.cjs` - ESLint 설정
- `.prettierrc` - Prettier 설정
- `tsconfig.json` - TypeScript 설정 개선

---

## 📋 **2단계: 핵심 인프라 및 설정 마이그레이션**

### **2.1 프로젝트 구조 설정**
```
src/
├── components/         # 재사용 가능한 컴포넌트
│   ├── common/        # Header, Sidebar, Footer
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── LoginPanel/
│   ├── forms/         # Form 관련 컴포넌트
│   │   ├── LoginForm/
│   │   ├── SignupForm/
│   │   └── ContactForm/
│   └── ui/           # Button, Modal, Card 등
│       ├── Button/
│       ├── Modal/
│       ├── Card/
│       ├── Badge/
│       └── LoadingSpinner/
├── pages/            # 페이지 컴포넌트
│   ├── HomePage/
│   ├── ForumPage/
│   ├── NoticePage/
│   └── ... (28개 페이지)
├── hooks/            # 커스텀 훅
│   ├── useAuth.ts
│   ├── usePosts.ts
│   └── useLocalStorage.ts
├── services/         # API 서비스 (Supabase)
│   ├── supabase.ts
│   ├── auth.service.ts
│   ├── post.service.ts
│   └── notification.service.ts
├── stores/           # Zustand 스토어
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── app.store.ts
├── types/            # TypeScript 타입 정의
│   ├── auth.types.ts
│   ├── post.types.ts
│   └── common.types.ts
├── utils/            # 유틸리티 함수
│   ├── cn.ts         # clsx + tailwind-merge
│   ├── date.ts       # 날짜 유틸리티
│   ├── validation.ts # Zod 스키마
│   └── constants.ts  # 상수 정의
├── styles/           # 글로벌 스타일
│   ├── globals.css
│   └── components.css
└── lib/              # 외부 라이브러리 설정
    └── supabase.ts
```

### **2.2 환경 변수 및 Supabase 설정**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 타입 안전한 Supabase 클라이언트
export type SupabaseClient = typeof supabase
```

### **2.3 TailwindCSS 구성 및 기존 CSS 변수 마이그레이션**
```javascript
// tailwind.config.js - 기존 CSS 변수들을 Tailwind로 변환
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 기존 CSS 변수들을 Tailwind 컬러로 변환
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6', // --primary-blue
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',   // --gray-50
          100: '#f3f4f6',  // --gray-100
          200: '#e5e7eb',  // --gray-200
          700: '#374151',  // --gray-700
          800: '#1f2937',  // --gray-800
          900: '#111827',  // --gray-900
        },
        success: '#10b981',  // --success-green
        warning: '#f59e0b',  // --warning-yellow
        error: '#ef4444',    // --error-red
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '364px': '364px', // 사이드바 너비
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

## 📋 **3단계: 컴포넌트 시스템 React 전환**

### **3.1 Header 컴포넌트 전환**
```tsx
// src/components/common/Header/Header.tsx
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../../stores/auth.store'
import { AuthButtons } from './AuthButtons'
import { UserProfile } from './UserProfile'
import { MobileMenuButton } from './MobileMenuButton'

interface HeaderProps {
  onLoginClick?: () => void;
  onMobileMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, 
  onMobileMenuClick 
}) => {
  const { user, isLoading } = useAuthStore()

  return (
    <header className="main-header bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="header-left flex items-center">
          <MobileMenuButton 
            onClick={onMobileMenuClick}
            className="md:hidden mr-3"
          />
          <Link 
            to="/" 
            className="text-xl font-bold text-primary-600 hidden sm:block"
          >
            WAVE SPACE
          </Link>
        </div>
        
        <div className="header-right flex items-center space-x-4">
          {isLoading ? (
            <div className="animate-pulse flex space-x-2">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
          ) : user ? (
            <UserProfile user={user} />
          ) : (
            <AuthButtons onLoginClick={onLoginClick} />
          )}
        </div>
      </div>
    </header>
  );
};

// src/components/common/Header/index.ts
export { Header } from './Header'
export { AuthButtons } from './AuthButtons'
export { UserProfile } from './UserProfile'
```

### **3.2 Sidebar 컴포넌트 전환**
```tsx
// src/components/common/Sidebar/Sidebar.tsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNavigation } from './SidebarNavigation'
import { useSidebarStore } from '../../../stores/ui.store'

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { isExpanded, isMobileOpen, toggleExpanded, closeMobile } = useSidebarStore()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // 현재 경로에 따라 활성 메뉴 설정
  useEffect(() => {
    const currentPath = location.pathname
    // 경로에 따른 카테고리 자동 활성화 로직
  }, [location])

  return (
    <>
      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeMobile}
        />
      )}
      
      {/* 사이드바 */}
      <aside className={`
        sidebar flex flex-col h-screen bg-white border-r border-gray-200
        fixed md:static top-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isExpanded ? 'w-64' : 'w-16 md:w-64'}
      `}>
        <SidebarHeader isExpanded={isExpanded} />
        <SidebarNavigation 
          activeCategory={activeCategory}
          onCategoryToggle={setActiveCategory}
          isExpanded={isExpanded}
          currentPath={location.pathname}
        />
      </aside>
    </>
  );
};
```

### **3.3 LoginPanel 컴포넌트 전환**
```tsx
// src/components/common/LoginPanel/LoginPanel.tsx
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { LoginForm } from '../../forms/LoginForm/LoginForm'
import { PasswordResetForm } from '../../forms/PasswordResetForm/PasswordResetForm'
import { useAuthStore } from '../../../stores/auth.store'

type ViewType = 'login' | 'password-reset' | 'email-sent'

interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<ViewType>('login')
  const [resetEmail, setResetEmail] = useState('')
  const { signIn, resetPassword, isLoading } = useAuthStore()

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password)
      onClose()
    } catch (error) {
      // 에러 처리는 useAuthStore에서 관리
    }
  }

  const handlePasswordReset = async (email: string) => {
    try {
      await resetPassword(email)
      setResetEmail(email)
      setCurrentView('email-sent')
    } catch (error) {
      // 에러 처리
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm 
            onSubmit={handleLogin}
            onPasswordResetClick={() => setCurrentView('password-reset')}
            isLoading={isLoading}
          />
        )
      case 'password-reset':
        return (
          <PasswordResetForm 
            onSubmit={handlePasswordReset}
            onBackToLogin={() => setCurrentView('login')}
            isLoading={isLoading}
          />
        )
      case 'email-sent':
        return (
          <EmailSentView 
            email={resetEmail}
            onBackToLogin={() => setCurrentView('login')}
            onResendEmail={() => handlePasswordReset(resetEmail)}
          />
        )
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    {currentView === 'login' && '로그인'}
                    {currentView === 'password-reset' && '비밀번호 찾기'}
                    {currentView === 'email-sent' && '이메일 발송 완료'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {renderContent()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
};
```

---

## 📋 **4단계: 페이지 컴포넌트 전환 및 라우팅**

### **4.1 라우터 설정 및 레이아웃 구성**
```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './providers/AuthProvider'
import { MainLayout } from './components/layouts/MainLayout'
import { AuthLayout } from './components/layouts/AuthLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// 페이지 컴포넌트 lazy import
import { HomePage } from './pages/HomePage/HomePage'
import { ForumPage } from './pages/ForumPage/ForumPage'
// ... 28개 페이지 import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="app">
            <Routes>
              {/* 인증이 필요없는 페이지 (AuthLayout) */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* 메인 레이아웃이 적용되는 페이지들 */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/qna" element={<QnaPage />} />
                <Route path="/humor" element={<HumorPage />} />
                <Route path="/notice" element={<NoticePage />} />
                <Route path="/updates" element={<UpdatesPage />} />
                
                {/* 보호된 라우트 (로그인 필요) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/points-shop" element={<PointsShopPage />} />
                  <Route path="/points-ranking" element={<PointsRankingPage />} />
                </Route>

                {/* 관리자 전용 라우트 */}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/feedbacks" element={<AdminFeedbacksPage />} />
                </Route>

                {/* 404 처리 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </div>
          
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
```

### **4.2 주요 페이지 컴포넌트 전환 (우선순위별)**
```tsx
// src/pages/HomePage/HomePage.tsx
import { Helmet } from 'react-helmet-async'
import { HeroSection } from './components/HeroSection'
import { RealtimeInfoSection } from './components/RealtimeInfoSection'
import { JobListingsSection } from './components/JobListingsSection'
import { HonorHallSection } from './components/HonorHallSection'

export const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>WAVE SPACE - 대한민국 No.1 분양실무자 대표 커뮤니티</title>
        <meta name="description" content="대한민국 부동산 분양 실무자들의 커뮤니티" />
      </Helmet>
      
      <div className="homepage">
        <HeroSection />
        <RealtimeInfoSection />
        <JobListingsSection />
        <HonorHallSection />
      </div>
    </>
  );
};

// src/pages/ForumPage/ForumPage.tsx
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePosts } from '../../hooks/usePosts'
import { PostList } from './components/PostList'
import { PostFilters } from './components/PostFilters'
import { CreatePostButton } from './components/CreatePostButton'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'

export const ForumPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  
  const { posts, isLoading, error, createPost, updatePost, deletePost } = usePosts({
    category: selectedCategory,
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20
  })

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSearchParams({ category, page: '1' })
  }

  if (error) {
    return <div className="error-state">오류가 발생했습니다.</div>
  }

  return (
    <div className="forum-page p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
        <CreatePostButton onCreatePost={createPost} />
      </div>

      <PostFilters 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <EmptyState 
          title="아직 게시글이 없습니다"
          description="첫 번째 게시글을 작성해보세요!"
        />
      ) : (
        <PostList 
          posts={posts}
          onUpdatePost={updatePost}
          onDeletePost={deletePost}
        />
      )}
    </div>
  )
};
```

### **4.3 레이아웃 컴포넌트 구성**
```tsx
// src/components/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Header } from '../common/Header/Header'
import { Sidebar } from '../common/Sidebar/Sidebar'
import { LoginPanel } from '../common/LoginPanel/LoginPanel'
import { useSidebarStore } from '../../stores/ui.store'

export const MainLayout: React.FC = () => {
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false)
  const { isMobileOpen, toggleMobile } = useSidebarStore()

  return (
    <div className="app-container flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="main-container flex-1 flex flex-col overflow-hidden">
        <Header 
          onLoginClick={() => setIsLoginPanelOpen(true)}
          onMobileMenuClick={toggleMobile}
        />
        
        <main className="main-content flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      <LoginPanel 
        isOpen={isLoginPanelOpen}
        onClose={() => setIsLoginPanelOpen(false)}
      />
    </div>
  )
};

// src/components/layouts/AuthLayout.tsx
export const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <h2 className="text-3xl font-bold text-primary-600">WAVE SPACE</h2>
        </Link>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
};
```

---

## 📋 **5단계: 상태관리 및 비즈니스 로직 통합**

### **5.1 Zustand 스토어 구성**
```typescript
// src/stores/auth.store.ts
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { supabase } from '../lib/supabase'
import type { User, AuthError } from '@supabase/supabase-js'

interface AuthState {
  // 상태
  user: User | null
  isLoading: boolean
  error: string | null
  
  // 액션
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: any) => Promise<void>
  clearError: () => void
  
  // 내부 메서드
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // 초기 상태
          user: null,
          isLoading: false,
          error: null,

          // 로그인
          signIn: async (email: string, password: string) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
              })

              if (error) throw error

              set((state) => {
                state.user = data.user
                state.isLoading = false
              })
            } catch (error) {
              set((state) => {
                state.error = error.message
                state.isLoading = false
              })
              throw error
            }
          },

          // 회원가입
          signUp: async (email: string, password: string, userData: any) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: userData
                }
              })

              if (error) throw error

              set((state) => {
                state.isLoading = false
              })
            } catch (error) {
              set((state) => {
                state.error = error.message
                state.isLoading = false
              })
              throw error
            }
          },

          // 로그아웃
          signOut: async () => {
            set((state) => {
              state.isLoading = true
            })

            try {
              const { error } = await supabase.auth.signOut()
              if (error) throw error

              set((state) => {
                state.user = null
                state.isLoading = false
                state.error = null
              })
            } catch (error) {
              set((state) => {
                state.error = error.message
                state.isLoading = false
              })
            }
          },

          // 비밀번호 재설정
          resetPassword: async (email: string) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
              })

              if (error) throw error

              set((state) => {
                state.isLoading = false
              })
            } catch (error) {
              set((state) => {
                state.error = error.message
                state.isLoading = false
              })
              throw error
            }
          },

          // 프로필 업데이트
          updateProfile: async (updates: any) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const { data, error } = await supabase.auth.updateUser(updates)
              if (error) throw error

              set((state) => {
                state.user = data.user
                state.isLoading = false
              })
            } catch (error) {
              set((state) => {
                state.error = error.message
                state.isLoading = false
              })
              throw error
            }
          },

          // 유틸리티 메서드
          clearError: () => set((state) => { state.error = null }),
          setUser: (user) => set((state) => { state.user = user }),
          setLoading: (loading) => set((state) => { state.isLoading = loading }),
          setError: (error) => set((state) => { state.error = error }),
        }))
      ),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'auth-store' }
  )
)

// Supabase 인증 상태 변경 리스너
supabase.auth.onAuthStateChange((event, session) => {
  const { setUser, setLoading } = useAuthStore.getState()
  
  setLoading(true)
  setUser(session?.user ?? null)
  setLoading(false)
})
```

### **5.2 커스텀 훅으로 비즈니스 로직 변환**
```typescript
// src/hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth.store'
import { toast } from 'react-hot-toast'

interface UsePostsOptions {
  category?: string
  page?: number
  limit?: number
}

export const usePosts = (options: UsePostsOptions = {}) => {
  const { category = 'all', page = 1, limit = 20 } = options
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // 게시글 목록 조회
  const {
    data: postsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['posts', category, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(
            id,
            display_name,
            avatar_url,
            role,
            badge_id
          ),
          badges:profiles.badge_id(
            id,
            name,
            icon,
            color
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2분
  })

  // 게시글 생성
  const createPostMutation = useMutation({
    mutationFn: async (newPost: any) => {
      if (!user) throw new Error('로그인이 필요합니다')

      const { data, error } = await supabase
        .from('posts')
        .insert([{ ...newPost, author_id: user.id }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('게시글이 작성되었습니다')
    },
    onError: (error: any) => {
      toast.error(error.message || '게시글 작성에 실패했습니다')
    }
  })

  // 게시글 업데이트
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .eq('author_id', user?.id) // 본인 게시글만 수정 가능
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('게시글이 수정되었습니다')
    },
    onError: (error: any) => {
      toast.error(error.message || '게시글 수정에 실패했습니다')
    }
  })

  // 게시글 삭제
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('posts')
        .update({ is_active: false })
        .eq('id', id)
        .eq('author_id', user?.id) // 본인 게시글만 삭제 가능

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('게시글이 삭제되었습니다')
    },
    onError: (error: any) => {
      toast.error(error.message || '게시글 삭제에 실패했습니다')
    }
  })

  return {
    posts: postsData || [],
    isLoading,
    error,
    refetch,
    createPost: createPostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  }
}
```

### **5.3 기존 유틸리티 함수 TypeScript 변환**
```typescript
// src/utils/cn.ts - clsx + tailwind-merge 통합
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// src/utils/validation.ts - Zod 스키마 정의
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
})

export const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  userType: z.enum(['분양기획', '분양영업', '청약상담', '관계사', '일반']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

export const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이하여야 합니다'),
  content: z.string().min(10, '내용은 최소 10자 이상이어야 합니다').max(5000, '내용은 5000자 이하여야 합니다'),
  category: z.enum(['분양정보', '청약정보', '시장동향', '취업정보', '자유게시판']),
  tags: z.array(z.string()).max(5, '태그는 최대 5개까지 가능합니다').optional(),
})

// src/utils/date.ts - 날짜 유틸리티
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { ko } from 'date-fns/locale'

export const formatRelativeTime = (date: string | Date) => {
  const targetDate = new Date(date)
  
  if (isToday(targetDate)) {
    return format(targetDate, 'HH:mm', { locale: ko })
  }
  
  if (isYesterday(targetDate)) {
    return '어제'
  }
  
  return formatDistanceToNow(targetDate, { 
    addSuffix: true, 
    locale: ko 
  })
}

export const formatFullDate = (date: string | Date) => {
  return format(new Date(date), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
}

// src/utils/constants.ts - 상수 정의
export const USER_TYPES = {
  PLANNING: '분양기획',
  SALES: '분양영업',
  CONSULTING: '청약상담',
  PARTNER: '관계사',
  GENERAL: '일반'
} as const

export const POST_CATEGORIES = {
  SALES_INFO: '분양정보',
  SUBSCRIPTION_INFO: '청약정보',
  MARKET_TREND: '시장동향',
  JOB_INFO: '취업정보',
  FREE_BOARD: '자유게시판'
} as const

export const ROUTES = {
  HOME: '/',
  FORUM: '/forum',
  QNA: '/qna',
  NOTICE: '/notice',
  PROFILE: '/profile',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN: '/admin'
} as const
```

---

## 📋 **6단계: 스타일링 시스템 현대화**

### **6.1 기존 CSS를 Tailwind 클래스로 체계적 변환**
```css
/* src/styles/globals.css - 글로벌 스타일 */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  /* 폰트 설정 */
  @font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css');
    font-display: swap;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    @apply w-2;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400;
  }
}

@layer components {
  /* 기존 컴포넌트 스타일을 Tailwind 클래스로 변환 */
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200;
  }

  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }

  .btn-outline {
    @apply bg-transparent text-primary-600 border-primary-600 hover:bg-primary-50 focus:ring-primary-500;
  }

  .btn-ghost {
    @apply bg-transparent text-gray-600 border-transparent hover:bg-gray-100 focus:ring-gray-500;
  }

  .form-input {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
           focus:outline-none focus:ring-primary-500 focus:border-primary-500 
           disabled:bg-gray-50 disabled:text-gray-500;
  }

  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
  }

  .card-header {
    @apply px-6 py-4 border-b border-gray-200;
  }

  .card-body {
    @apply px-6 py-4;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .badge-primary {
    @apply bg-primary-100 text-primary-800;
  }

  .badge-success {
    @apply bg-green-100 text-green-800;
  }

  .badge-warning {
    @apply bg-yellow-100 text-yellow-800;
  }

  .badge-error {
    @apply bg-red-100 text-red-800;
  }
}

@layer utilities {
  /* 커스텀 유틸리티 클래스 */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .text-balance {
    text-wrap: balance;
  }

  .animation-delay-200 {
    animation-delay: 200ms;
  }

  .animation-delay-400 {
    animation-delay: 400ms;
  }
}
```

### **6.2 반응형 디자인 개선**
```tsx
// 기존 사이드바를 반응형으로 개선한 예시
export const Sidebar: React.FC = () => {
  return (
    <aside className={cn(
      // 기본 스타일
      "sidebar flex flex-col bg-white border-r border-gray-200",
      // 모바일: 고정 위치, 전체 높이, 숨김/표시
      "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out",
      isMobileOpen ? "translate-x-0" : "-translate-x-full",
      // 태블릿: 여전히 고정
      "md:relative md:translate-x-0",
      // 데스크톱: 확장/축소 가능
      "lg:w-16 lg:hover:w-64 lg:transition-all lg:duration-300",
      isExpanded && "lg:w-64"
    )}>
      {/* 사이드바 내용 */}
    </aside>
  );
};

// 헤더 반응형
export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 모바일 메뉴 버튼 */}
          <div className="flex items-center">
            <button className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-500">
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            {/* 로고 - 모바일에서는 작게 */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
              WAVE SPACE
            </h1>
          </div>

          {/* 우측 버튼들 - 모바일에서는 아이콘만 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="btn-ghost p-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only sm:ml-2">검색</span>
            </button>
            
            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center space-x-2">
                <button className="btn-outline hidden sm:inline-flex">
                  로그인
                </button>
                <button className="btn-primary">
                  <span className="hidden sm:inline">회원가입</span>
                  <span className="sm:hidden">가입</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
```

### **6.3 다크 모드 지원 추가**
```typescript
// src/hooks/useTheme.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  theme: 'light' | 'dark' | 'system'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      theme: 'system',
      
      toggleTheme: () => {
        const { theme } = get()
        if (theme === 'light') {
          set({ theme: 'dark', isDark: true })
        } else if (theme === 'dark') {
          set({ theme: 'light', isDark: false })
        } else {
          // system mode
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          set({ theme: systemDark ? 'light' : 'dark', isDark: !systemDark })
        }
        applyTheme()
      },

      setTheme: (theme) => {
        set({ theme })
        applyTheme()
      }
    }),
    { name: 'theme-storage' }
  )
)

const applyTheme = () => {
  const { theme } = useTheme.getState()
  const root = document.documentElement
  
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark')
    useTheme.setState({ isDark: true })
  } else {
    root.classList.remove('dark')
    useTheme.setState({ isDark: false })
  }
}

// 시스템 테마 변경 감지
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const { theme } = useTheme.getState()
  if (theme === 'system') {
    applyTheme()
  }
})
```

---

## 📋 **7단계: 성능 최적화 및 React Native 준비**

### **7.1 코드 스플리팅 및 레이지 로딩**
```tsx
// src/App.tsx - 페이지별 코드 스플리팅
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

// 페이지 컴포넌트들을 lazy loading으로 분리
const HomePage = lazy(() => import('./pages/HomePage/HomePage').then(m => ({ default: m.HomePage })))
const ForumPage = lazy(() => import('./pages/ForumPage/ForumPage').then(m => ({ default: m.ForumPage })))
const QnaPage = lazy(() => import('./pages/QnaPage/QnaPage').then(m => ({ default: m.QnaPage })))
const NoticePage = lazy(() => import('./pages/NoticePage/NoticePage').then(m => ({ default: m.NoticePage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage').then(m => ({ default: m.ProfilePage })))

// 관리자 페이지들은 별도 청크로 분리
const AdminPages = lazy(() => import('./pages/AdminPages'))

// 라우트에서 Suspense로 감싸기
<Routes>
  <Route element={<MainLayout />}>
    <Route path="/" element={
      <Suspense fallback={<PageLoadingSkeleton />}>
        <HomePage />
      </Suspense>
    } />
    
    <Route path="/forum" element={
      <Suspense fallback={<PageLoadingSkeleton />}>
        <ForumPage />
      </Suspense>
    } />
    
    {/* 관리자 라우트는 권한 체크 후 로드 */}
    <Route path="/admin/*" element={
      <ProtectedRoute requiredRole="admin">
        <Suspense fallback={<PageLoadingSkeleton />}>
          <AdminPages />
        </Suspense>
      </ProtectedRoute>
    } />
  </Route>
</Routes>
```

### **7.2 React Native 호환 컴포넌트 구조 설계**
```tsx
// src/components/ui/Button/Button.types.ts - 공통 타입 정의
export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onPress?: () => void // React Native 호환
  onClick?: () => void // Web 전용
  className?: string // Web 전용
  style?: any // React Native 호환
  testID?: string // 테스트용
}

// src/components/ui/Button/Button.tsx - 웹용
import { ButtonProps } from './Button.types'
import { cn } from '../../../utils/cn'

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  onPress, // 호환성을 위해 onPress도 받되 onClick으로 변환
  className,
  testID,
  ...props
}) => {
  const handleClick = () => {
    if (disabled || loading) return
    onClick?.()
    onPress?.() // React Native 호환
  }

  return (
    <button
      className={cn(
        'btn',
        {
          'btn-primary': variant === 'primary',
          'btn-outline': variant === 'outline',
          'btn-ghost': variant === 'ghost',
          'btn-danger': variant === 'danger',
          'btn-sm': size === 'sm',
          'btn-md': size === 'md',
          'btn-lg': size === 'lg',
        },
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      data-testid={testID}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

// src/components/ui/Button/Button.native.tsx - React Native용 (미래 대비)
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { ButtonProps } from './Button.types'

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  onClick, // 웹 호환성을 위해 받되 onPress로 변환
  style,
  testID,
}) => {
  const handlePress = () => {
    if (disabled || loading) return
    onPress?.()
    onClick?.() // 웹 호환
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style
      ]}
      disabled={disabled || loading}
      onPress={handlePress}
      testID={testID}
    >
      {loading && <ActivityIndicator size="small" color="white" />}
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
```

### **7.3 성능 모니터링 및 최적화**
```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 페이지 로드 시간 측정
  measurePageLoad(pageName: string) {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      this.metrics.set(`${pageName}_load_time`, loadTime)
      
      // 개발 환경에서만 콘솔 출력
      if (import.meta.env.DEV) {
        console.log(`${pageName} 로드 시간: ${loadTime.toFixed(2)}ms`)
      }

      // 프로덕션에서는 분석 도구로 전송
      if (import.meta.env.PROD) {
        this.sendMetric('page_load', {
          page: pageName,
          duration: loadTime,
          timestamp: Date.now()
        })
      }
    }
  }

  // API 호출 시간 측정
  measureApiCall(endpoint: string) {
    const startTime = performance.now()
    
    return {
      success: () => {
        const duration = performance.now() - startTime
        this.sendMetric('api_call', {
          endpoint,
          duration,
          status: 'success',
          timestamp: Date.now()
        })
      },
      error: (error: any) => {
        const duration = performance.now() - startTime
        this.sendMetric('api_call', {
          endpoint,
          duration,
          status: 'error',
          error: error.message,
          timestamp: Date.now()
        })
      }
    }
  }

  private sendMetric(type: string, data: any) {
    // 실제 프로덕션에서는 Google Analytics, Mixpanel 등으로 전송
    if (window.gtag) {
      window.gtag('event', type, data)
    }
  }

  // Core Web Vitals 측정
  measureWebVitals() {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
      
      this.sendMetric('web_vitals', {
        metric: 'LCP',
        value: lastEntry.startTime,
        timestamp: Date.now()
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // FID (First Input Delay)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime)
        
        this.sendMetric('web_vitals', {
          metric: 'FID',
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now()
        })
      }
    }).observe({ entryTypes: ['first-input'] })

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      console.log('CLS:', clsValue)
      
      this.sendMetric('web_vitals', {
        metric: 'CLS',
        value: clsValue,
        timestamp: Date.now()
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }
}

// 훅으로 사용하기 쉽게 래핑
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance()
  
  return {
    measurePageLoad: monitor.measurePageLoad.bind(monitor),
    measureApiCall: monitor.measureApiCall.bind(monitor),
  }
}
```

---

## 📋 **8단계: 테스트 및 배포 시스템 구축**

### **8.1 테스트 환경 설정**
```bash
# 테스트 관련 의존성 설치
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jsdom @vitest/ui @vitest/coverage-c8
npm install -D msw # API 모킹용
```

```typescript
// vite.config.ts - 테스트 설정 추가
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
})

// src/test/setup.ts
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { server } from './mocks/server'

expect.extend(matchers)

// MSW 서버 설정
beforeAll(() => server.listen())
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// 전역 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

### **8.2 주요 컴포넌트 테스트 예시**
```typescript
// src/components/common/Header/Header.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from './Header'
import { useAuthStore } from '../../../stores/auth.store'

// 모킹
vi.mock('../../../stores/auth.store')

const mockUseAuthStore = vi.mocked(useAuthStore)

const HeaderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Header', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
      signOut: vi.fn(),
    })
  })

  it('로그아웃 상태에서 로그인/회원가입 버튼을 표시한다', () => {
    render(
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
    )

    expect(screen.getByText('로그인')).toBeInTheDocument()
    expect(screen.getByText('회원가입')).toBeInTheDocument()
  })

  it('로그인 상태에서 사용자 프로필을 표시한다', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        user_metadata: {
          display_name: '테스트 사용자'
        }
      },
      isLoading: false,
      signOut: vi.fn(),
    })

    render(
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
    )

    expect(screen.getByText('테스트 사용자')).toBeInTheDocument()
  })

  it('로그인 버튼 클릭 시 onLoginClick이 호출된다', () => {
    const onLoginClick = vi.fn()

    render(
      <HeaderWrapper>
        <Header onLoginClick={onLoginClick} />
      </HeaderWrapper>
    )

    fireEvent.click(screen.getByText('로그인'))
    expect(onLoginClick).toHaveBeenCalledTimes(1)
  })
})
```

### **8.3 배포 스크립트 구성**
```json
// package.json
{
  "name": "wavespace-react",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "build:analyze": "npm run build && npx vite-bundle-analyzer dist/assets/*.js",
    "deploy:staging": "npm run build && firebase deploy --only hosting:staging",
    "deploy:production": "npm run build && firebase deploy --only hosting:production",
    "pre-deploy": "npm run lint && npm run type-check && npm run test:run && npm run build"
  }
}
```

```bash
# deploy.sh - 배포 스크립트
#!/bin/bash

echo "🚀 WAVE SPACE React 배포 시작"

# 1. 의존성 검사
echo "📦 의존성 확인 중..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
    echo "❌ 보안 취약점 발견. 배포를 중단합니다."
    exit 1
fi

# 2. 코드 품질 검사
echo "🔍 코드 품질 검사 중..."
npm run lint
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ 코드 품질 검사 실패"
    exit 1
fi

# 3. 테스트 실행
echo "🧪 테스트 실행 중..."
npm run test:run

if [ $? -ne 0 ]; then
    echo "❌ 테스트 실패"
    exit 1
fi

# 4. 빌드
echo "🏗️  빌드 중..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi

# 5. 배포 환경에 따른 분기
if [ "$1" = "production" ]; then
    echo "🌍 프로덕션 배포..."
    npm run deploy:production
else
    echo "🔧 스테이징 배포..."
    npm run deploy:staging
fi

echo "✅ 배포 완료!"
```

### **8.4 환경별 설정 파일**
```typescript
// src/config/environments.ts
interface Environment {
  supabaseUrl: string
  supabaseAnonKey: string
  apiUrl: string
  analyticsId?: string
  isDevelopment: boolean
  isProduction: boolean
}

const development: Environment = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  isDevelopment: true,
  isProduction: false,
}

const production: Environment = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  apiUrl: import.meta.env.VITE_API_URL!,
  analyticsId: import.meta.env.VITE_GA_ID,
  isDevelopment: false,
  isProduction: true,
}

export const config = import.meta.env.PROD ? production : development

// 환경 검증
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`필수 환경 변수가 설정되지 않았습니다: ${envVar}`)
  }
}
```

---

## 📋 **마이그레이션 체크리스트**

### **기본 설정**
- [ ] React + TypeScript + Vite 프로젝트 생성
- [ ] 필수 의존성 설치 및 설정
- [ ] 환경 변수 및 Supabase 연결 설정
- [ ] TailwindCSS 구성 및 기존 CSS 변환

### **컴포넌트 시스템**
- [ ] Header 컴포넌트 React 전환
- [ ] Sidebar 컴포넌트 React 전환  
- [ ] LoginPanel 컴포넌트 React 전환
- [ ] 공통 UI 컴포넌트 구축

### **페이지 및 라우팅**
- [ ] React Router 설정 및 라우트 구성
- [ ] HomePage 컴포넌트 전환
- [ ] ForumPage 컴포넌트 전환
- [ ] 나머지 26개 페이지 컴포넌트 전환
- [ ] 레이아웃 컴포넌트 구성

### **상태관리 및 로직**
- [ ] Zustand 스토어 구성 (auth, ui, app)
- [ ] 커스텀 훅으로 비즈니스 로직 변환
- [ ] 기존 서비스 코드 React 포팅
- [ ] 유틸리티 함수 TypeScript 변환

### **스타일링 및 UX**
- [ ] 기존 CSS → Tailwind 클래스 변환
- [ ] 반응형 디자인 개선
- [ ] 다크 모드 지원 추가
- [ ] 애니메이션 및 인터랙션 개선

### **성능 최적화**
- [ ] 코드 스플리팅 및 레이지 로딩
- [ ] React Native 호환 컴포넌트 구조
- [ ] 성능 모니터링 시스템 구축
- [ ] 번들 크기 최적화

### **테스트 및 배포**
- [ ] 테스트 환경 구성
- [ ] 주요 컴포넌트 단위 테스트 작성
- [ ] E2E 테스트 시나리오 구성
- [ ] 배포 스크립트 및 CI/CD 파이프라인

---

## 🎯 **성공 지표**

### **기술적 지표**
- [ ] 초기 로드 시간 < 3초 (3G 기준)
- [ ] Lighthouse 성능 점수 > 90점
- [ ] 테스트 커버리지 > 80%
- [ ] TypeScript 타입 안전성 100%

### **사용자 경험 지표**  
- [ ] 모든 기존 기능 동일하게 작동
- [ ] 모바일 반응형 100% 대응
- [ ] 접근성(a11y) WCAG 2.1 AA 준수
- [ ] 다크 모드 완전 지원

### **개발 생산성 지표**
- [ ] Hot Reload 개발 환경
- [ ] 컴포넌트 재사용성 > 70%
- [ ] 코드 중복도 < 10%
- [ ] React Native 코드 공유율 > 85%