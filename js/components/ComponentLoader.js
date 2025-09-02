/**
 * 컴포넌트 로더 - 중복 코드 제거를 위한 핵심 시스템
 * 기존의 40개 HTML 파일 중복 문제 해결
 */
class ComponentLoader {
    constructor() {
        this.loadedComponents = new Map();
        this.componentCache = new Map();
    }

    /**
     * 사이드바 컴포넌트 로드 (모든 페이지 공통)
     */
    async loadSidebar(container) {
        if (this.componentCache.has('sidebar')) {
            container.innerHTML = this.componentCache.get('sidebar');
            this.initializeSidebarEvents();
            return;
        }

        try {
            // 기존 sidebar HTML을 동적으로 생성
            const sidebarHTML = `
                <aside class="sidebar">
                    <!-- 로고 영역 -->
                    <div class="sidebar-header">
                        <div class="logo-container">
                            <span class="logo-text">WAVE space</span>
                            <span class="beta-badge">BETA</span>
                        </div>
                    </div>

                    <!-- 슬로건 -->
                    <div class="sidebar-slogan">
                        <p>대한민국 No.1 분양실무자 대표 커뮤니티</p>
                    </div>

                    <!-- 네비게이션 -->
                    <nav class="sidebar-nav">
                        ${this.generateNavSections()}
                    </nav>

                    <!-- 사용자 프로필 -->
                    <div class="sidebar-footer">
                        <div class="user-profile">
                            <div class="user-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="user-info">
                                <span class="user-name">게스트</span>
                                <span class="user-points">0 P</span>
                            </div>
                        </div>
                    </div>
                </aside>
            `;

            this.componentCache.set('sidebar', sidebarHTML);
            container.innerHTML = sidebarHTML;
            this.initializeSidebarEvents();

        } catch (error) {
            console.error('Sidebar 로드 실패:', error);
            container.innerHTML = '<div class="error">사이드바 로드 실패</div>';
        }
    }

    /**
     * 네비게이션 섹션 생성 - 기존 40개 파일의 중복 제거
     */
    generateNavSections() {
        const sections = [
            {
                title: '안내',
                icon: 'fas fa-book-open',
                items: [
                    { href: 'notice.html', icon: 'fas fa-bullhorn', text: '공지사항' },
                    { href: 'updates.html', icon: 'fas fa-info-circle', text: '업데이트' },
                    { href: 'support.html', icon: 'fas fa-life-ring', text: '고객센터' },
                    { href: 'plus-membership.html', icon: 'fas fa-rocket', text: '+Plus Membership' },
                    { href: 'events.html', icon: 'fas fa-gift', text: '이벤트' }
                ]
            },
            {
                title: '커뮤니티',
                icon: 'fas fa-users',
                items: [
                    { href: 'forum.html', icon: 'fas fa-comments', text: '자유게시판' },
                    { href: 'qna.html', icon: 'fas fa-question-circle', text: '질문답변' },
                    { href: 'humor.html', icon: 'fas fa-laugh', text: '유머' },
                    { href: 'hall-of-fame.html', icon: 'fas fa-trophy', text: '명예의 전당' }
                ]
            },
            {
                title: '포인트샵',
                icon: 'fas fa-shopping-cart',
                items: [
                    { href: 'points-shop.html', icon: 'fas fa-store', text: '포인트샵' },
                    { href: 'points-ranking.html', icon: 'fas fa-ranking-star', text: '포인트 랭킹' },
                    { href: 'points-policy.html', icon: 'fas fa-file-alt', text: '포인트 정책' },
                    { href: 'points-charge.html', icon: 'fas fa-credit-card', text: '포인트 충전' }
                ]
            },
            {
                title: '실무자료',
                icon: 'fas fa-briefcase',
                items: [
                    { href: 'market-research.html', icon: 'fas fa-chart-bar', text: '시장조사서' },
                    { href: 'planning-recruitment.html', icon: 'fas fa-building', text: '기획/분양' },
                    { href: 'sales-recruit.html', icon: 'fas fa-handshake', text: '영업/모집' },
                    { href: 'other-docs.html', icon: 'fas fa-folder-open', text: '기타자료' }
                ]
            },
            {
                title: 'AI기능',
                icon: 'fas fa-robot',
                items: [
                    { href: 'ai-report.html', icon: 'fas fa-file-contract', text: 'AI 리포트' },
                    { href: 'ai-matching.html', icon: 'fas fa-user-tie', text: 'AI 매칭' }
                ]
            },
            {
                title: '교육',
                icon: 'fas fa-graduation-cap',
                items: [
                    { href: 'education.html', icon: 'fas fa-chalkboard-teacher', text: '교육자료' },
                    { href: 'attendance.html', icon: 'fas fa-calendar-check', text: '출석체크' }
                ]
            },
            {
                title: '관리',
                icon: 'fas fa-cog',
                items: [
                    { href: 'data-center.html', icon: 'fas fa-database', text: '데이터센터' },
                    { href: 'policy.html', icon: 'fas fa-gavel', text: '이용약관' },
                    { href: 'proposal.html', icon: 'fas fa-lightbulb', text: '제안하기' }
                ]
            }
        ];

        return sections.map(section => `
            <div class="nav-section">
                <div class="nav-category">
                    <div class="nav-category-wrapper">
                        <button class="nav-category-button">
                            <i class="${section.icon}"></i>
                            <span>${section.title}</span>
                            <i class="fas fa-chevron-down nav-arrow"></i>
                        </button>
                        <div class="nav-items">
                            ${section.items.map(item => `
                                <a href="${item.href}" class="nav-item">
                                    <i class="${item.icon}"></i>
                                    <span>${item.text}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 헤더 컴포넌트 로드 (모든 페이지 공통)
     */
    async loadHeader(container) {
        if (this.componentCache.has('header')) {
            container.innerHTML = this.componentCache.get('header');
            this.initializeHeaderEvents();
            return;
        }

        const headerHTML = `
            <header class="main-header">
                <div class="header-left">
                    <button class="sidebar-toggle">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 class="page-title">${document.title.split(' - ')[0]}</h1>
                </div>
                <div class="header-right">
                    <div class="user-actions">
                        <button class="notification-btn">
                            <i class="fas fa-bell"></i>
                            <span class="notification-count">3</span>
                        </button>
                        <div class="user-menu">
                            <button class="user-menu-btn">
                                <img src="https://via.placeholder.com/32x32" alt="사용자" class="user-avatar">
                                <span class="user-name">게스트</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a href="profile.html" class="dropdown-item">
                                    <i class="fas fa-user"></i>
                                    <span>마이페이지</span>
                                </a>
                                <a href="login.html" class="dropdown-item">
                                    <i class="fas fa-sign-in-alt"></i>
                                    <span>로그인</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;

        this.componentCache.set('header', headerHTML);
        container.innerHTML = headerHTML;
        this.initializeHeaderEvents();
    }

    /**
     * 사이드바 이벤트 초기화
     */
    initializeSidebarEvents() {
        // 사이드바 토글 기능
        const categoryButtons = document.querySelectorAll('.nav-category-button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const wrapper = button.parentElement;
                const isOpen = wrapper.classList.contains('open');
                
                // 다른 카테고리 닫기
                document.querySelectorAll('.nav-category-wrapper.open').forEach(openWrapper => {
                    if (openWrapper !== wrapper) {
                        openWrapper.classList.remove('open');
                    }
                });
                
                // 현재 카테고리 토글
                wrapper.classList.toggle('open', !isOpen);
            });
        });

        // 현재 페이지 하이라이트
        const currentPage = location.pathname.split('/').pop();
        const currentNavItem = document.querySelector(`a[href="${currentPage}"]`);
        if (currentNavItem) {
            currentNavItem.classList.add('active');
            const categoryWrapper = currentNavItem.closest('.nav-category-wrapper');
            if (categoryWrapper) {
                categoryWrapper.classList.add('open');
            }
        }
    }

    /**
     * 헤더 이벤트 초기화
     */
    initializeHeaderEvents() {
        // 사이드바 토글
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.body.classList.toggle('sidebar-collapsed');
                localStorage.setItem('sidebar-collapsed', 
                    document.body.classList.contains('sidebar-collapsed'));
            });
        }

        // 사용자 메뉴 토글
        const userMenuBtn = document.querySelector('.user-menu-btn');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (userMenuBtn && dropdownMenu) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            // 외부 클릭시 메뉴 닫기
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }
    }

    /**
     * 모든 공통 컴포넌트 로드 (각 페이지에서 호출)
     */
    async loadCommonComponents() {
        const sidebarContainer = document.querySelector('#sidebar-container');
        const headerContainer = document.querySelector('#header-container');

        if (sidebarContainer) {
            await this.loadSidebar(sidebarContainer);
        }

        if (headerContainer) {
            await this.loadHeader(headerContainer);
        }

        // 사이드바 상태 복원
        const sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (sidebarCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        }
    }
}

// 전역으로 내보내기
window.ComponentLoader = ComponentLoader;