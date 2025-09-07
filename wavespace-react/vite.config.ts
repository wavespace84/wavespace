import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Performance optimization and code splitting configuration
export default defineConfig({
  plugins: [react() as PluginOption],
  
  // 경로 별칭 설정
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@types': resolve(__dirname, './src/types'),
      '@lib': resolve(__dirname, './src/lib')
    }
  },

  // 개발 서버 설정
  server: {
    port: 3000,
    host: true,
    cors: true,
    fs: {
      strict: false
    }
  },

  // 빌드 최적화
  build: {
    // 청크 분할 전략
    rollupOptions: {
      output: {
        manualChunks: {
          // 핵심 라이브러리 분리
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'state-vendor': ['zustand'],
          
          // Supabase 관련 코드 분리
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // UI 라이브러리 분리 (필요시)
          // 'ui-vendor': ['@headlessui/react', 'framer-motion'],
          
          // 페이지별 청크 분할
          'auth-pages': [
            'src/pages/auth/LoginPage',
            'src/pages/auth/SignupPage',
            'src/pages/auth/ResetPasswordPage'
          ],
          'community-pages': [
            'src/pages/community/ForumPage',
            'src/pages/community/QnaPage',
            'src/pages/community/HumorPage',
            'src/pages/community/NoticePage',
            'src/pages/community/UpdatesPage'
          ],
          'points-pages': [
            'src/pages/points/PointsShopPage',
            'src/pages/points/PointsRankingPage',
            'src/pages/points/PointsChargePage',
            'src/pages/points/PointsPolicyPage',
            'src/pages/points/PlusMembershipPage'
          ],
          'services-pages': [
            'src/pages/services/DataCenterPage',
            'src/pages/services/AiMatchingPage',
            'src/pages/services/AiReportPage',
            'src/pages/services/MarketResearchPage'
          ],
          'admin-pages': [
            'src/pages/admin/AdminPage',
            'src/pages/admin/AdminFeedbacksPage'
          ],
          
          // 서비스 레이어 분리
          'services': [
            'src/services/authService',
            'src/services/postService',
            'src/services/commentService',
            'src/services/pointService',
            'src/services/notificationService',
            'src/services/fileService'
          ],
          
          // 성능 관련 유틸리티 분리
          'performance-utils': [
            'src/utils/performance',
            'src/utils/platform',
            'src/components/performance/VirtualList',
            'src/components/performance/LazyImage'
          ]
        },
        
        // 청크 파일명 설정
        chunkFileNames: 'assets/chunks/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // 최적화 설정
    minify: 'esbuild',
    sourcemap: false,
    
    // 청크 크기 경고 임계값 (KB)
    chunkSizeWarningLimit: 1000,
    
    // 빌드 성능 최적화
    target: 'esnext',
    assetsInlineLimit: 4096, // 4KB 이하 에셋은 인라인
    
    // CSS 코드 분할
    cssCodeSplit: true,
    
    // 빌드 캐시 사용
    emptyOutDir: true
  },

  // CSS 처리 최적화
  css: {
    devSourcemap: true,
    postcss: {
      plugins: []
    }
  },

  // 최적화 설정
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@supabase/supabase-js'
    ],
    exclude: ['@vite/client', '@vite/env']
  },

  // 환경 변수 설정
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // 미리보기 서버 설정
  preview: {
    port: 4173,
    host: true,
    cors: true
  },

  // esbuild 설정
  esbuild: {
    // 프로덕션에서 console.log 제거
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none'
  }
})
