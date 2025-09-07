import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import { createMockStore } from '../../test/setup';
import type { AuthStore } from '../../lib/zustand/authStore';
import type { AppStore } from '../../lib/zustand/appStore';

// Mock Zustand stores
const mockAuthStore = createMockStore<AuthStore>({
  isAuthenticated: false,
  user: null,
  profile: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  checkSession: vi.fn(),
});

const mockAppStore = createMockStore<AppStore>({
  sidebarCollapsed: false,
  setSidebarCollapsed: vi.fn(),
  isMobile: false,
  setIsMobile: vi.fn(),
  openLoginModal: vi.fn(),
  closeLoginModal: vi.fn(),
  openProfileModal: vi.fn(),
  closeProfileModal: vi.fn(),
});

// Mock useAuthStore and useAppStore
vi.mock('../../lib/zustand/authStore', () => ({
  useAuthStore: () => mockAuthStore.getState(),
}));

vi.mock('../../lib/zustand/appStore', () => ({
  useAppStore: () => mockAppStore.getState(),
}));

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    signOut: vi.fn(() => Promise.resolve({ success: true })),
  },
}));

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('로그인하지 않은 사용자', () => {
    beforeEach(() => {
      mockAuthStore.setState({
        isAuthenticated: false,
        user: null,
        profile: null,
      });
    });

    it('로고가 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('WAVE')).toBeInTheDocument();
      expect(screen.getByText('space')).toBeInTheDocument();
    });

    it('로그인 버튼이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('로그인')).toBeInTheDocument();
    });

    it('회원가입 버튼이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('회원가입')).toBeInTheDocument();
    });

    it('로그인 버튼 클릭 시 모달이 열려야 한다', () => {
      const openLoginModal = vi.fn();
      mockAppStore.setState({ openLoginModal });

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('로그인'));
      expect(openLoginModal).toHaveBeenCalled();
    });
  });

  describe('로그인한 사용자', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      full_name: '테스트 사용자',
      username: 'testuser',
      user_type: 'planning' as const,
      role: 'user' as const,
      points: 1500,
    };

    const mockProfile = {
      id: 'profile-id',
      user_id: 'test-user-id',
      avatar_url: 'https://example.com/avatar.jpg',
      bio: '테스트 사용자입니다',
      website: null,
      location: null,
      birth_date: null,
      phone: null,
      company: null,
      position: null,
      updated_at: new Date().toISOString(),
    };

    beforeEach(() => {
      mockAuthStore.setState({
        isAuthenticated: true,
        user: mockUser,
        profile: mockProfile,
      });
    });

    it('사용자 정보가 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
    });

    it('사용자 타입이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('분양기획')).toBeInTheDocument();
    });

    it('포인트가 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('1500 P')).toBeInTheDocument();
    });

    it('알림 버튼이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const notificationButton = screen.getByLabelText('알림');
      expect(notificationButton).toBeInTheDocument();
    });

    it('사용자 메뉴 토글이 작동해야 한다', async () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const userMenuButton = screen.getByRole('button', { name: /테스트 사용자/ });
      
      // 메뉴가 처음에는 보이지 않아야 함
      expect(screen.queryByText('내 프로필')).not.toBeInTheDocument();

      // 버튼 클릭
      fireEvent.click(userMenuButton);

      // 메뉴가 나타나야 함
      await waitFor(() => {
        expect(screen.getByText('내 프로필')).toBeInTheDocument();
      });

      // 포인트 내역 메뉴도 확인
      expect(screen.getByText('포인트 내역')).toBeInTheDocument();
      expect(screen.getByText('설정')).toBeInTheDocument();
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    it('로그아웃 버튼이 작동해야 한다', async () => {
      const { authService } = await import('../../services/authService');
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      // 사용자 메뉴 열기
      fireEvent.click(screen.getByRole('button', { name: /테스트 사용자/ }));

      await waitFor(() => {
        expect(screen.getByText('로그아웃')).toBeInTheDocument();
      });

      // 로그아웃 버튼 클릭
      fireEvent.click(screen.getByText('로그아웃'));

      expect(authService.signOut).toHaveBeenCalled();
    });

    it('관리자 메뉴가 관리자에게만 표시되어야 한다', async () => {
      // 일반 사용자
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /테스트 사용자/ }));

      await waitFor(() => {
        expect(screen.getByText('내 프로필')).toBeInTheDocument();
      });

      expect(screen.queryByText('관리자')).not.toBeInTheDocument();

      // 관리자로 변경
      mockAuthStore.setState({
        user: { ...mockUser, role: 'admin' },
      });

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /테스트 사용자/ }));

      await waitFor(() => {
        expect(screen.getByText('관리자')).toBeInTheDocument();
      });
    });
  });

  describe('모바일 화면', () => {
    beforeEach(() => {
      mockAppStore.setState({ isMobile: true });
    });

    it('햄버거 메뉴 버튼이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('메뉴 토글');
      expect(menuButton).toBeInTheDocument();
    });

    it('햄버거 메뉴 클릭 시 사이드바가 토글되어야 한다', () => {
      const setSidebarCollapsed = vi.fn();
      mockAppStore.setState({ setSidebarCollapsed });

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText('메뉴 토글');
      fireEvent.click(menuButton);

      expect(setSidebarCollapsed).toHaveBeenCalledWith(true);
    });

    it('로고가 모바일에서는 숨겨져야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const logo = screen.getByText('WAVE').closest('a');
      expect(logo).toHaveClass('hidden', 'sm:flex');
    });
  });

  describe('접근성', () => {
    it('적절한 ARIA 레이블이 있어야 한다', () => {
      mockAppStore.setState({ isMobile: true });

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByLabelText('메뉴 토글')).toBeInTheDocument();
    });

    it('키보드 탐색이 가능해야 한다', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const loginButton = screen.getByText('로그인');
      expect(loginButton).toHaveAttribute('type', 'button');
    });
  });

  describe('외부 클릭 처리', () => {
    it('사용자 메뉴 외부 클릭 시 메뉴가 닫혀야 한다', async () => {
      mockAuthStore.setState({
        isAuthenticated: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: '테스트 사용자',
          username: 'testuser',
          user_type: 'general' as const,
          role: 'user' as const,
          points: 100,
        },
        profile: null,
      });

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      // 메뉴 열기
      const userMenuButton = screen.getByRole('button', { name: /테스트 사용자/ });
      fireEvent.click(userMenuButton);

      await waitFor(() => {
        expect(screen.getByText('내 프로필')).toBeInTheDocument();
      });

      // 외부 클릭 시뮬레이션
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('내 프로필')).not.toBeInTheDocument();
      });
    });
  });
});