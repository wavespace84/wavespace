import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/zustand/authStore';
import { useAppStore } from '../../lib/zustand/appStore';

interface NavItem {
  icon: string;
  label: string;
  path?: string;
  badge?: boolean;
  requireAuth?: boolean;
  requireRole?: 'admin' | 'practitioner' | 'member';
}

interface NavCategory {
  icon: string;
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

export const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { sidebarCollapsed, isMobile } = useAppStore();
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'guide', 'community' // 기본으로 열려있는 카테고리
  ]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const navigationCategories: { id: string; category: NavCategory }[] = [
    {
      id: 'guide',
      category: {
        icon: 'fas fa-book-open',
        label: '안내',
        items: [
          { icon: 'fas fa-bullhorn', label: '공지사항', path: '/community/notice', badge: true },
          { icon: 'fas fa-info-circle', label: '업데이트', path: '/community/updates' },
          { icon: 'fas fa-life-ring', label: '고객센터', path: '/support/center' },
          { icon: 'fas fa-rocket', label: '+Plus Membership', path: '/membership/plus', requireAuth: true },
          { icon: 'fas fa-gift', label: '이벤트', path: '/services/events' }
        ]
      }
    },
    {
      id: 'community',
      category: {
        icon: 'fas fa-users',
        label: '커뮤니티',
        items: [
          { icon: 'fas fa-trophy', label: '명예의전당', path: '/services/hall-of-fame' },
          { icon: 'fas fa-calendar-check', label: '출석체크', path: '/services/attendance', requireAuth: true },
          { icon: 'fas fa-comments', label: '자유게시판', path: '/community/forum' },
          { icon: 'fas fa-laugh', label: '유머재미', path: '/community/humor' },
          { icon: 'fas fa-question-circle', label: '질문답변', path: '/community/qna' }
        ]
      }
    },
    {
      id: 'jobs',
      category: {
        icon: 'fas fa-building',
        label: '구인구직',
        items: [
          { icon: 'fas fa-briefcase', label: '분양기획', path: '/jobs/planning-recruitment', badge: true },
          { icon: 'fas fa-briefcase', label: '분양영업', path: '/jobs/sales-recruit', badge: true },
          { icon: 'fas fa-robot', label: 'AI 매칭', path: '/jobs/ai-matching', badge: true, requireAuth: true }
        ]
      }
    },
    {
      id: 'data',
      category: {
        icon: 'fas fa-folder-open',
        label: '분양자료',
        items: [
          { icon: 'fas fa-database', label: 'Data Center', path: '/data/center', badge: true, requireAuth: true },
          { icon: 'fas fa-book', label: '시장조사서', path: '/data/market-research', badge: true, requireAuth: true },
          { icon: 'fas fa-file-signature', label: '제안서', path: '/support/proposal', badge: true },
          { icon: 'fas fa-graduation-cap', label: '교육자료', path: '/services/education', badge: true },
          { icon: 'fas fa-file-alt', label: '정책자료', path: '/support/policy', badge: true },
          { icon: 'fas fa-folder', label: '기타자료', path: '/support/other-docs', badge: true },
          { icon: 'fas fa-robot', label: 'AI 보고서', path: '/data/ai-report', badge: true, requireAuth: true }
        ]
      }
    },
    {
      id: 'points',
      category: {
        icon: 'fas fa-coins',
        label: '포인트',
        items: [
          { icon: 'fas fa-gem', label: '포인트정책', path: '/points/policy', badge: true },
          { icon: 'fas fa-chart-bar', label: '전체랭킹', path: '/points/ranking', badge: true },
          { icon: 'fas fa-credit-card', label: '충전하기', path: '/points/charge', badge: true, requireAuth: true },
          { icon: 'fas fa-store', label: '상점', path: '/points/shop', badge: true, requireAuth: true }
        ]
      }
    }
  ];

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    const isAccessible = !item.requireAuth || (item.requireAuth && isAuthenticated);
    const hasRoleAccess = !item.requireRole || (user && (
      item.requireRole === 'member' || 
      (item.requireRole === 'practitioner' && ['practitioner', 'admin'].includes(user.role)) ||
      (item.requireRole === 'admin' && user.role === 'admin')
    ));

    const canAccess = isAccessible && hasRoleAccess;

    if (!canAccess && item.requireAuth && !isAuthenticated) {
      return (
        <button
          key={item.label}
          onClick={() => useAppStore.getState().openLoginModal()}
          className={`
            flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-md
            ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}
          `}
        >
          <i className={`${item.icon} ${sidebarCollapsed ? 'text-base' : 'mr-3'}`} />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
            </>
          )}
        </button>
      );
    }

    if (!canAccess) {
      return null;
    }

    return (
      <Link
        key={item.label}
        to={item.path!}
        className={`
          flex items-center w-full px-4 py-2 text-sm transition-colors rounded-md
          ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}
          ${isActive 
            ? 'text-blue-600 bg-blue-50 font-medium' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <i className={`${item.icon} ${sidebarCollapsed ? 'text-base' : 'mr-3'}`} />
        {!sidebarCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-blue-500'}`} />
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <aside className={`
      bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden
      ${sidebarCollapsed ? 'w-16' : 'w-64'}
      transition-all duration-300 ease-in-out
    `}>
      {/* 로고 영역 */}
      <div className={`
        flex items-center px-4 py-6 border-b border-gray-100
        ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}
      `}>
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">WAVE space</h1>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                BETA
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* 슬로건 */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            대한민국 No.1 분양실무자 대표 커뮤니티
          </p>
        </div>
      )}

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-2">
          {navigationCategories.map(({ id, category }) => {
            const isExpanded = expandedCategories.includes(id);
            
            return (
              <div key={id} className="px-2">
                {/* 카테고리 헤더 */}
                <button
                  onClick={() => !sidebarCollapsed && toggleCategory(id)}
                  className={`
                    flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors
                    ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
                  `}
                >
                  <div className="flex items-center">
                    <i className={`${category.icon} ${sidebarCollapsed ? 'text-base' : 'mr-3'}`} />
                    {!sidebarCollapsed && <span>{category.label}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <i className={`fas fa-chevron-down transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* 카테고리 아이템들 */}
                {(isExpanded || sidebarCollapsed) && (
                  <div className={`${sidebarCollapsed ? 'space-y-1 mt-2' : 'ml-4 mt-2 space-y-1'}`}>
                    {category.items.map(renderNavItem)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 미니게임 섹션 */}
        {!sidebarCollapsed && (
          <div className="mt-8 px-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center mb-3">
                <i className="fas fa-gamepad text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-900">미니게임</span>
              </div>
              <div className="space-y-2">
                <a
                  href="/game"
                  className="flex items-center px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-md transition-colors"
                >
                  <i className="fas fa-gamepad mr-2 text-xs" />
                  <span>모든 게임</span>
                </a>
                <a
                  href="/game?open=roulette"
                  className="flex items-center px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-md transition-colors"
                >
                  <i className="fas fa-circle-notch mr-2 text-xs" />
                  <span>룰렛</span>
                </a>
                <a
                  href="/game?open=blackjack"
                  className="flex items-center px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-md transition-colors"
                >
                  <i className="fas fa-layer-group mr-2 text-xs" />
                  <span>블랙잭</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};