import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/zustand/authStore';
import { useAppStore } from '../../lib/zustand/appStore';
import { authService } from '../../services/authService';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, profile } = useAuthStore();
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed,
    isMobile,
    openLoginModal,
    openProfileModal
  } = useAppStore();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getUserTypeLabel = (userType: string | undefined) => {
    switch (userType) {
      case 'planning': return '분양기획';
      case 'sales': return '분양영업';
      case 'consulting': return '청약상담';
      case 'related': return '관계사';
      case 'general': return '일반';
      default: return '일반회원';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 왼쪽: 사이드바 토글 + 로고 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-wave-600 hover:bg-gray-100 rounded-lg transition-all duration-200 lg:hidden"
              aria-label="메뉴 토글"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* 로고 (모바일에서는 숨김) */}
            <Link to="/" className="hidden sm:flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-wave rounded-xl flex items-center justify-center shadow-wave group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gradient-wave">WAVE</span>
                <span className="text-xl font-semibold text-gray-700 ml-1">space</span>
              </div>
            </Link>
          </div>

          {/* 오른쪽: 사용자 메뉴 */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                {/* 알림 버튼 */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-wave-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="알림"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5M15 17H7.5a2.5 2.5 0 01-2.5-2.5V8.5a2.5 2.5 0 012.5-2.5H15V17z" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full animate-pulse"></span>
                </button>

                {/* 사용자 메뉴 */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 text-gray-700 hover:text-wave-600 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 bg-gradient-wave rounded-xl flex items-center justify-center text-white font-semibold shadow-medium group-hover:scale-105 transition-transform duration-200">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={user.full_name || user.username}
                            className="w-9 h-9 rounded-xl object-cover"
                          />
                        ) : (
                          <span>
                            {(user.full_name || user.username)?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full"></div>
                    </div>

                    {!isMobile && (
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getUserTypeLabel(user.user_type)}
                        </div>
                      </div>
                    )}

                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="dropdown right-0 w-64 py-2 animate-slide-in-down">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name || user.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="badge-primary">
                            {getUserTypeLabel(user.user_type)}
                          </span>
                          <span className="badge-secondary">
                            {user.points || 0} P
                          </span>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          내 프로필
                        </Link>

                        <Link
                          to="/points/history"
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          포인트 내역
                        </Link>

                        <Link
                          to="/settings"
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          설정
                        </Link>

                        {(user.role === 'admin' || user.role === 'practitioner') && (
                          <Link
                            to="/admin"
                            className="dropdown-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            관리자
                          </Link>
                        )}

                        <div className="border-t border-gray-200 my-2"></div>

                        <button
                          onClick={handleSignOut}
                          className="dropdown-item w-full text-left text-error-600 hover:bg-error-50 hover:text-error-700"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={openLoginModal}
                  className="btn-ghost"
                >
                  {!isMobile && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  로그인
                </button>
                
                <Link
                  to="/auth/signup"
                  className="btn-primary"
                >
                  {!isMobile && (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  )}
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};