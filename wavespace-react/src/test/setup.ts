// 테스트 환경 설정

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';

// 각 테스트 후 정리
afterEach(() => {
  cleanup();
});

// 전역 테스트 설정
beforeAll(() => {
  // Mock 환경 변수
  process.env.NODE_ENV = 'test';
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

  // DOM API Mocks
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // IntersectionObserver Mock
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    callback
  }));

  // ResizeObserver Mock
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    callback
  }));

  // ServiceWorker Mock
  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: vi.fn(() => Promise.resolve({
        installing: null,
        waiting: null,
        active: null,
        scope: 'test-scope',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })),
      getRegistration: vi.fn(() => Promise.resolve(null)),
      controller: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
  });

  // Geolocation Mock
  Object.defineProperty(navigator, 'geolocation', {
    writable: true,
    value: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn()
    }
  });

  // LocalStorage Mock
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // SessionStorage Mock
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  });

  // URL Mock
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Fetch Mock 기본 설정
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      headers: new Headers(),
      clone: () => ({}),
    })
  ) as any;

  // Performance Mock
  Object.defineProperty(global, 'performance', {
    writable: true,
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn()
    }
  });

  // Image Mock
  global.Image = class {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src = '';
    
    constructor() {
      setTimeout(() => {
        if (this.onload) {
          this.onload();
        }
      }, 100);
    }
  } as any;
});

afterAll(() => {
  vi.clearAllMocks();
});

// Console 스파이 설정 (선택적)
export const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  info: vi.spyOn(console, 'info').mockImplementation(() => {}),
};

// 테스트 유틸리티 함수들
export const testUtils = {
  // 비동기 작업 대기
  wait: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock 함수 리셋
  resetMocks: () => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  },
  
  // 에러 콘솔 숨기기
  suppressConsoleErrors: () => {
    consoleSpy.error.mockImplementation(() => {});
  },
  
  // 에러 콘솔 복구
  restoreConsoleErrors: () => {
    consoleSpy.error.mockRestore();
  }
};

// Supabase Mock 설정
export const createMockSupabaseClient = () => ({
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    signIn: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    then: vi.fn(() => Promise.resolve({ data: [], error: null }))
  })),
  
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      remove: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      list: vi.fn(() => Promise.resolve({ data: [], error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } }))
    }))
  },
  
  realtime: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(() => Promise.resolve()),
      unsubscribe: vi.fn(() => Promise.resolve()),
    }))
  },

  rpc: vi.fn(() => Promise.resolve({ data: null, error: null }))
});

// React Router Mock
export const mockNavigate = vi.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
};

// Zustand Store Mock 생성 헬퍼
export const createMockStore = <T>(initialState: T) => {
  let state = { ...initialState };
  
  const store = {
    getState: () => state,
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => {
      const newState = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...newState };
    },
    subscribe: vi.fn(),
    destroy: vi.fn()
  };
  
  return store;
};

// 타입 정의
declare global {
  interface Window {
    IntersectionObserver: any;
    ResizeObserver: any;
  }
}

export default testUtils;