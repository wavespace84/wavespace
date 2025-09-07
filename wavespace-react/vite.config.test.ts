/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@types': resolve(__dirname, './src/types'),
      '@lib': resolve(__dirname, './src/lib'),
      '@test': resolve(__dirname, './src/test')
    }
  },

  test: {
    // 테스트 환경 설정
    environment: 'jsdom',
    
    // 설정 파일
    setupFiles: ['./src/test/setup.ts'],
    
    // 글로벌 설정
    globals: true,
    
    // 테스트 파일 패턴
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 제외할 파일들
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'build',
      'coverage'
    ],
    
    // 타임아웃 설정
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: 'coverage',
      
      // 커버리지 임계값
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      },
      
      // 커버리지에 포함할 파일들
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/test/**/*',
        '!src/types/**/*'
      ],
      
      // 커버리지에서 제외할 파일들
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}'
      ]
    },
    
    // 리포터 설정
    reporter: [
      'default',
      'html',
      'json'
    ],
    
    // 출력 설정
    outputFile: {
      html: 'test-results/index.html',
      json: 'test-results/results.json'
    },
    
    // 병렬 실행 설정
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // Watch 모드 설정
    watch: false,
    
    // Mock 설정
    deps: {
      inline: [
        '@supabase/supabase-js',
        'zustand',
        '@testing-library/react',
        '@testing-library/jest-dom'
      ]
    },
    
    // 환경 변수
    env: {
      NODE_ENV: 'test',
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key'
    }
  }
});