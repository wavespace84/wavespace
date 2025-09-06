/**
 * 컴포넌트 로더 - 중복 코드 제거를 위한 핵심 시스템
 * 기존의 40개 HTML 파일 중복 문제 해결
 */
class ComponentLoader {
    constructor() {
        console.log('[ComponentLoader] 초기화 시작');
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
                                <a href="javascript:void(0)" onclick="authService.openProfileSidepanel()" class="dropdown-item">
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
     * 마이페이지 모달 템플릿을 로드하여 캐시에 저장합니다.
     */
    async loadProfileModal() {
        if (this.componentCache.has('profile-modal-template')) {
            return; // 이미 템플릿이 캐시되어 있으면 반환
        }
        try {
            const response = await fetch('components/profile-sidepanel.html');
            if (!response.ok) {
                throw new Error(`마이페이지 모달 템플릿 로드 실패: ${response.status}`);
            }
            const templateHTML = await response.text();
            this.componentCache.set('profile-modal-template', templateHTML);
            console.log('[ComponentLoader] 마이페이지 템플릿 캐시 완료');
        } catch (error) {
            console.error('마이페이지 모달 템플릿 로드 오류:', error);
        }
    }

    /**
     * 마이페이지 모달을 표시합니다. 템플릿을 렌더링하고 DOM에 추가/표시합니다.
     */
    async showProfileModal() {
        await this.loadProfileModal(); // 템플릿 로드 보장

        const template = this.componentCache.get('profile-modal-template');
        if (!template) {
            console.error('마이페이지 템플릿을 찾을 수 없습니다.');
            return;
        }

        const userData = window.authService?.userProfile;
        if (!userData) {
            console.error('마이페이지를 표시하기 위한 사용자 데이터가 없습니다.');
            if(window.loginSidepanelLoader) {
                window.loginSidepanelLoader.showLoginSidepanel();
            }
            return;
        }

        // 템플릿 렌더링
        const renderedElement = this._renderProfile(template, userData);

        let sidepanel = document.getElementById('profileSidepanel');
        if (!sidepanel) {
            document.body.appendChild(renderedElement);
            sidepanel = renderedElement;
        } else {
            sidepanel.innerHTML = renderedElement.innerHTML;
        }

        this._initializeProfileEvents(sidepanel);

        sidepanel.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 마이페이지 템플릿을 기반으로 실제 DOM 요소를 생성하고 데이터를 채웁니다.
     */
    _renderProfile(template, userData) {
        // 템플릿 내 플레이스홀더 치환
        let renderedHTML = template.replace(/\{\{NICKNAME\}\}/g, userData.nickname || '사용자');
        renderedHTML = renderedHTML.replace(/\{\{EMAIL\}\}/g, userData.email || '-');
        renderedHTML = renderedHTML.replace(/\{\{USER_TYPE\}\}/g, this.getUserTypeText(userData.member_type));
        renderedHTML = renderedHTML.replace(/\{\{CREATED_AT\}\}/g, this.formatDate(userData.created_at));
        renderedHTML = renderedHTML.replace(/\{\{POINTS\}\}/g, (userData.points || 0).toLocaleString());
        renderedHTML = renderedHTML.replace(/\{\{POST_COUNT\}\}/g, userData.post_count || 0);
        renderedHTML = renderedHTML.replace(/\{\{COMMENT_COUNT\}\}/g, userData.comment_count || 0);
        renderedHTML = renderedHTML.replace(/\{\{LIKE_COUNT\}\}/g, userData.like_count || 0);
        renderedHTML = renderedHTML.replace(/\{\{BADGE_COUNT\}\}/g, userData.user_badges?.length || 0);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = renderedHTML;
        const panel = tempDiv.firstElementChild;

        // 탭별 컨텐츠 렌더링
        this._renderProfileTab(panel, userData);
        this._renderBadgesTab(panel, userData);
        // TODO: 다른 탭 렌더링 함수 호출 추가
        
        return panel;
    }

    /**
     * 프로필 탭 컨텐츠를 렌더링합니다.
     */
    _renderProfileTab(panel, userData) {
        // 빠른 메뉴 등 프로필 탭에만 필요한 동적 컨텐츠를 여기에 추가할 수 있습니다.
        const quickMenuContainer = panel.querySelector('.profile-quick-menu');
        if (quickMenuContainer) {
            // 빠른 메뉴 아이템 예시
            quickMenuContainer.innerHTML = `
                <h3 class="section-title">빠른 메뉴</h3>
                <div class="quick-menu-grid">
                    <button class="quick-menu-item" data-tab-target="badges">
                        <i class="fas fa-trophy"></i>
                        <span>뱃지 관리</span>
                    </button>
                    <button class="quick-menu-item" data-tab-target="points">
                        <i class="fas fa-coins"></i>
                        <span>포인트 내역</span>
                    </button>
                    <button class="quick-menu-item" data-tab-target="settings">
                        <i class="fas fa-cog"></i>
                        <span>계정 설정</span>
                    </button>
                    <button class="quick-menu-item" onclick="window.location.href='/points-charge.html'">
                        <i class="fas fa-credit-card"></i>
                        <span>포인트 충전</span>
                    </button>
                </div>
            `;
        }
    }

    /**
     * 뱃지 관리 탭 컨텐츠를 렌더링합니다.
     */
    _renderBadgesTab(panel, userData) {
        const tabContent = panel.querySelector('#badges-tab');
        if (!tabContent) return;

        const allBadges = this.getBadgeData();
        const acquiredBadges = userData.user_badges || [];
        const acquiredBadgeIds = new Set(acquiredBadges.map(b => b.badge_id));

        const statsHTML = `
            <div class="badges-stats-section">
                <div class="badges-stats-card">
                    <div class="stats-icon"><i class="fas fa-trophy"></i></div>
                    <div class="stats-content">
                        <h3 class="stats-title">획득한 뱃지</h3>
                        <p class="stats-value">${acquiredBadgeIds.size} / ${allBadges.length}</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((acquiredBadgeIds.size / allBadges.length) * 100).toFixed(0)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const filterHTML = `
            <div class="badges-filter-section">
                <button class="badge-filter-btn active" data-category="all">전체</button>
                <button class="badge-filter-btn" data-category="activity">활동</button>
                <button class="badge-filter-btn" data-category="community">커뮤니티</button>
                <button class="badge-filter-btn" data-category="expertise">전문성</button>
                <button class="badge-filter-btn" data-category="special">특별</button>
            </div>
        `;

        const gridHTML = `
            <div class="badges-grid" id="badges-grid">
                ${allBadges.map(badge => {
                    const isAcquired = acquiredBadgeIds.has(badge.id);
                    return `
                        <div class="badge-item ${isAcquired ? 'acquired' : 'locked'}" data-category="${badge.category}">
                            <div class="badge-icon" style="background-color: ${isAcquired ? badge.color : '#E0E0E0'}">
                                <i class="${badge.icon}"></i>
                            </div>
                            <div class="badge-info">
                                <h4 class="badge-name">${badge.name}</h4>
                                <p class="badge-description">${badge.description}</p>
                            </div>
                            ${!isAcquired ? `<div class="badge-lock-overlay"><i class="fas fa-lock"></i></div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        tabContent.innerHTML = statsHTML + filterHTML + gridHTML;
    }

    /**
     * 마이페이지의 동적 요소들에 이벤트 리스너를 설정합니다.
     */
    _initializeProfileEvents(panelElement) {
        // 닫기 버튼
        const closeBtn = panelElement.querySelector('.profile-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => window.authService.closeProfileSidepanel();
        }

        // 오버레이 클릭 시 닫기
        panelElement.addEventListener('click', (e) => {
            if (e.target === panelElement) {
                window.authService.closeProfileSidepanel();
            }
        });

        const switchTab = (tabName) => {
            panelElement.querySelectorAll('.profile-nav-item').forEach(nav => nav.classList.remove('active'));
            panelElement.querySelectorAll('.profile-tab-content').forEach(content => content.classList.remove('active'));
            
            const navItem = panelElement.querySelector(`.profile-nav-item[data-tab="${tabName}"]`);
            if (navItem) navItem.classList.add('active');

            const tabContent = panelElement.querySelector(`#${tabName}-tab`);
            if(tabContent) tabContent.classList.add('active');
        };

        // 메인 탭 전환
        const navItems = panelElement.querySelectorAll('.profile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => switchTab(item.dataset.tab));
        });

        // 프로필 탭의 빠른 메뉴 탭 전환
        const quickMenuItems = panelElement.querySelectorAll('.quick-menu-item[data-tab-target]');
        quickMenuItems.forEach(item => {
            item.addEventListener('click', () => switchTab(item.dataset.tabTarget));
        });

        // 뱃지 필터 이벤트
        const badgeFilterBtns = panelElement.querySelectorAll('.badge-filter-btn');
        badgeFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                badgeFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                panelElement.querySelectorAll('.badges-grid .badge-item').forEach(item => {
                    if (category === 'all' || item.dataset.category === category) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // 알림내역 탭 이벤트
        this._initNotificationsEvents(panelElement);
        
        // 실무자 인증 탭 이벤트
        this._initVerificationEvents(panelElement);
        
        // 설정 탭 이벤트
        this._initSettingsEvents(panelElement);
    }

    /**
     * 알림내역 탭 이벤트 초기화
     */
    _initNotificationsEvents(panelElement) {
        // 모두 읽음 버튼
        const markAllReadBtn = panelElement.querySelector('#markAllReadBtn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                const unreadItems = panelElement.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                });
                
                // 알림 탭 뱃지 제거
                const notificationTab = document.querySelector('.profile-nav-item[data-tab="notifications"]');
                if (notificationTab) {
                    notificationTab.classList.remove('has-unread');
                }
                
                console.log('모든 알림을 읽음 처리했습니다');
            });
        }

        // 알림 필터
        const notificationFilter = panelElement.querySelector('#notificationFilter');
        if (notificationFilter) {
            notificationFilter.addEventListener('change', (e) => {
                const filterValue = e.target.value;
                const notificationItems = panelElement.querySelectorAll('.notification-item');
                
                notificationItems.forEach(item => {
                    const iconElement = item.querySelector('.notification-icon');
                    const isUnread = item.classList.contains('unread');
                    
                    let shouldShow = true;
                    
                    if (filterValue === 'unread' && !isUnread) {
                        shouldShow = false;
                    } else if (filterValue !== 'all' && filterValue !== 'unread') {
                        shouldShow = iconElement && iconElement.classList.contains(filterValue);
                    }
                    
                    item.style.display = shouldShow ? 'flex' : 'none';
                });
            });
        }

        // 개별 알림 읽음 처리
        const readBtns = panelElement.querySelectorAll('.notification-read-btn');
        readBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const notificationItem = btn.closest('.notification-item');
                if (notificationItem) {
                    notificationItem.classList.remove('unread');
                    
                    // 읽지 않은 알림이 없으면 뱃지 제거
                    const hasUnread = panelElement.querySelector('.notification-item.unread');
                    if (!hasUnread) {
                        const notificationTab = document.querySelector('.profile-nav-item[data-tab="notifications"]');
                        if (notificationTab) {
                            notificationTab.classList.remove('has-unread');
                        }
                    }
                }
            });
        });
    }

    /**
     * 실무자 인증 탭 이벤트 초기화
     */
    _initVerificationEvents(panelElement) {
        // 실무자 인증과 관련된 이벤트가 필요하면 여기에 추가
        console.log('실무자 인증 탭 이벤트 초기화됨');
    }

    /**
     * 설정 탭 이벤트 초기화
     */
    _initSettingsEvents(panelElement) {
        // 이메일 변경 버튼
        const emailChangeBtn = panelElement.querySelector('.settings-item button');
        if (emailChangeBtn && emailChangeBtn.textContent.includes('이메일')) {
            emailChangeBtn.addEventListener('click', () => {
                // TODO: 이메일 변경 모달 열기
                console.log('이메일 변경 클릭됨');
                alert('이메일 변경 기능은 준비 중입니다.');
            });
        }

        // 비밀번호 변경 버튼
        const passwordChangeBtn = panelElement.querySelectorAll('.settings-item button')[1];
        if (passwordChangeBtn && passwordChangeBtn.textContent.includes('비밀번호')) {
            passwordChangeBtn.addEventListener('click', () => {
                // TODO: 비밀번호 변경 모달 열기
                console.log('비밀번호 변경 클릭됨');
                alert('비밀번호 변경 기능은 준비 중입니다.');
            });
        }

        // 토글 스위치 이벤트
        const toggleSwitches = panelElement.querySelectorAll('.toggle-switch input');
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const label = e.target.closest('.settings-item').querySelector('.setting-label').textContent;
                console.log(`${label} 설정: ${e.target.checked ? '켜짐' : '꺼짐'}`);
            });
        });
    }

    /**
     * 회원 유형 텍스트 변환
     */
    getUserTypeText(userType) {
        const typeMap = {
            'sales_planning': '분양기획',
            'sales_agency': '분양영업', 
            'subscription_consulting': '청약상담',
            'related_company': '관계사',
            'general': '일반'
        };
        return typeMap[userType] || '일반';
    }
    
    /**
     * 아이템 타입 텍스트 변환
     */
    getItemTypeText(itemType) {
        const typeMap = {
            'decoration': '꾸미기',
            'utility': '유틸리티',
            'booster': '부스터',
            'badge': '뱃지',
            'emoticon': '이모티콘'
        };
        return typeMap[itemType] || itemType;
    }
    
    /**
     * 28개 뱃지 데이터
     */
    getBadgeData() {
        return [
            // ... (mock data remains for now)
        ];
    }
    
    /**
     * 보관함 아이템 샘플 데이터
     */
    getInventoryItems() {
        return [
            // ... (mock data remains for now)
        ];
    }
    
    /**
     * 장바구니 아이템 샘플 데이터
     */
    getCartItems() {
        return [
            // ... (mock data remains for now)
        ];
    }

    /**
     * 포인트 내역 샘플 데이터
     */
    getPointHistory() {
        return [
            // ... (mock data remains for now)
        ];
    }
    
    /**
     * 날짜 포맷팅
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }
    
    /**
     * 날짜시간 포맷팅
     */
    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}.${month}.${day} ${hours}:${minutes}`;
    }
    
    /**
     * 포인트 카테고리 텍스트 변환
     */
    getPointCategoryText(category) {
        const categoryMap = {
            'post': '게시글',
            'comment': '댓글',
            'like': '좋아요',
            'attendance': '출석',
            'event': '이벤트',
            'badge': '뱃지',
            'purchase': '구매',
            'refund': '환불'
        };
        return categoryMap[category] || category;
    }
    
    /**
     * 결제 내역 데이터 반환
     */
    getPaymentHistory() {
        return [
            // ... (mock data remains for now)
        ];
    }
    
    /**
     * 결제 방법 텍스트 변환
     */
    getPaymentMethodText(method) {
        const methodMap = {
            'credit_card': '신용카드',
            'kakao_pay': '카카오페이',
            'naver_pay': '네이버페이',
            'toss': '토스',
            'payco': '페이코',
            'bank_transfer': '계좌이체'
        };
        
        return methodMap[method] || method;
    }
    
    /**
     * 결제 타입 텍스트 변환
     */
    getPaymentTypeText(type) {
        const typeMap = {
            'point_charge': '포인트 충전',
            'premium_subscribe': '프리미엄 가입',
            'premium_renew': '프리미엄 갱신',
            'refund': '환불',
            'item_purchase': '아이템 구매'
        };
        
        return typeMap[type] || type;
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

        // 마이페이지 모달 로드
        await this.loadProfileModal();

        // 사이드바 상태 복원
        const sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (sidebarCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        }
    }
}

// 전역으로 내보내기
window.ComponentLoader = ComponentLoader;
