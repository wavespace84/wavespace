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
                                <a href="javascript:void(0)" onclick="authService.openMypageSidepanel()" class="dropdown-item">
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
     * 마이페이지 모달 로드 (모든 페이지 공통)
     */
    async loadMypageModal() {
        if (this.componentCache.has('mypage-modal')) {
            const existingModal = document.getElementById('mypageSidepanel');
            if (!existingModal) {
                document.body.insertAdjacentHTML('beforeend', this.componentCache.get('mypage-modal'));
                this.initializeMypageEvents();
            }
            return;
        }

        // 사용자 데이터 가져오기
        const userData = window.authService ? window.authService.currentUser : null;

        const mypageModalHTML = `
            <!-- 마이페이지 사이드패널 - 컴팩트 디자인 -->
            <div class="mypage-sidepanel-overlay" id="mypageSidepanel">
                <div class="mypage-sidepanel">
                    <div class="mypage-sidepanel-header">
                        <h2>
                            <i class="fas fa-user-circle"></i>
                            마이페이지
                        </h2>
                        <button class="mypage-close-btn" onclick="closeMypageSidepanel()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- 상단 탭 네비게이션 -->
                    <nav class="mypage-top-nav">
                        <button class="mypage-nav-item active" data-tab="profile">
                            <i class="fas fa-user"></i>
                            <span>내 정보</span>
                        </button>
                        <button class="mypage-nav-item" data-tab="badges">
                            <i class="fas fa-trophy"></i>
                            <span>뱃지 관리</span>
                        </button>
                        <button class="mypage-nav-item" data-tab="inventory">
                            <i class="fas fa-box"></i>
                            <span>보관함</span>
                        </button>
                        <button class="mypage-nav-item" data-tab="cart">
                            <i class="fas fa-shopping-cart"></i>
                            <span>장바구니</span>
                        </button>
                        <button class="mypage-nav-item" data-tab="points">
                            <i class="fas fa-coins"></i>
                            <span>포인트 내역</span>
                        </button>
                        <button class="mypage-nav-item" data-tab="payments">
                            <i class="fas fa-credit-card"></i>
                            <span>결제 내역</span>
                        </button>
                        <button class="mypage-nav-item" data-tab="activity">
                            <i class="fas fa-history"></i>
                            <span>활동 기록</span>
                        </button>
                        <button class="mypage-nav-item" data-tab="settings">
                            <i class="fas fa-cog"></i>
                            <span>설정</span>
                        </button>
                        <button class="mypage-nav-item" data-tab="verification">
                            <i class="fas fa-certificate"></i>
                            <span>실무자 인증</span>
                        </button>
                    </nav>
                    
                    <!-- 컨텐츠 레이아웃 -->
                    <div class="mypage-layout">
                    
                    <div class="mypage-content">
                        <!-- 내 정보 탭 -->
                        <div class="mypage-tab-content active" id="profile-tab">
                            <!-- 히어로 섹션 -->
                            <div class="profile-hero-section">
                                <div class="profile-hero-bg"></div>
                                <div class="profile-hero-content">
                                    <div class="profile-avatar-large">
                                        <img src="/img/default-avatar.png" alt="프로필 이미지" onerror="this.style.display='none'; this.parentElement.querySelector('.avatar-placeholder').style.display='flex';">
                                        <div class="avatar-placeholder" style="display:none;">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <button class="avatar-edit-btn">
                                            <i class="fas fa-camera"></i>
                                        </button>
                                    </div>
                                    <h2 class="profile-username">${userData?.nickname || '사용자'}</h2>
                                    <div class="profile-badges">
                                        <span class="badge-item badge-representative">
                                            <i class="fas fa-crown"></i>
                                            <span>부동산 마스터</span>
                                        </span>
                                        ${userData?.is_premium ? '<span class="badge-item badge-premium"><i class="fas fa-gem"></i><span>프리미엄</span></span>' : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 정보 카드 섹션 -->
                            <div class="profile-info-cards">
                                <div class="info-card">
                                    <div class="info-card-header">
                                        <i class="fas fa-user-circle"></i>
                                        <h3>기본 정보</h3>
                                    </div>
                                    <div class="info-card-body">
                                        <div class="info-item">
                                            <span class="info-label">이메일</span>
                                            <span class="info-value">${userData?.email || '-'}</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">회원유형</span>
                                            <span class="info-value">${this.getUserTypeText(userData?.user_type)}</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">가입일</span>
                                            <span class="info-value">${this.formatDate(userData?.created_at)}</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">포인트</span>
                                            <span class="info-value points-value">
                                                <i class="fas fa-coins"></i>
                                                ${(userData?.points || 0).toLocaleString()}P
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="info-card">
                                    <div class="info-card-header">
                                        <i class="fas fa-chart-line"></i>
                                        <h3>활동 현황</h3>
                                    </div>
                                    <div class="info-card-body">
                                        <div class="info-item">
                                            <span class="info-label">작성한 글</span>
                                            <span class="info-value">${userData?.post_count || 0}개</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">작성한 댓글</span>
                                            <span class="info-value">${userData?.comment_count || 0}개</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">받은 좋아요</span>
                                            <span class="info-value">${userData?.like_count || 0}개</span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">보유 뱃지</span>
                                            <span class="info-value">${userData?.badge_count || 0}개</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 빠른 메뉴 섹션 -->
                            <div class="profile-quick-menu">
                                <h3 class="section-title">빠른 메뉴</h3>
                                <div class="quick-menu-grid">
                                    <button class="quick-menu-item" onclick="window.switchMypageTab('badges')">
                                        <i class="fas fa-trophy"></i>
                                        <span>뱃지 관리</span>
                                    </button>
                                    <button class="quick-menu-item" onclick="window.switchMypageTab('points')">
                                        <i class="fas fa-coins"></i>
                                        <span>포인트 내역</span>
                                    </button>
                                    <button class="quick-menu-item" onclick="window.switchMypageTab('settings')">
                                        <i class="fas fa-cog"></i>
                                        <span>계정 설정</span>
                                    </button>
                                    <button class="quick-menu-item" onclick="window.location.href='/points-charge.html'">
                                        <i class="fas fa-credit-card"></i>
                                        <span>포인트 충전</span>
                                    </button>
                                    <button class="quick-menu-item" onclick="window.location.href='/plus-membership.html'">
                                        <i class="fas fa-gem"></i>
                                        <span>프리미엄 가입</span>
                                    </button>
                                    <button class="quick-menu-item" onclick="window.switchMypageTab('verification')">
                                        <i class="fas fa-certificate"></i>
                                        <span>실무자 인증</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 활동 내역 탭 -->
                        <div class="mypage-tab-content" id="activity-tab">
                            <div class="mypage-activity-filters">
                                <button class="mypage-filter-btn active" data-filter="all">전체</button>
                                <button class="mypage-filter-btn" data-filter="posts">게시글</button>
                                <button class="mypage-filter-btn" data-filter="comments">댓글</button>
                                <button class="mypage-filter-btn" data-filter="uploads">업로드</button>
                            </div>
                            <div class="mypage-activity-list" id="mypage-activity-list">
                                <div class="mypage-activity-empty">
                                    <i class="fas fa-inbox"></i>
                                    <p>아직 활동 내역이 없습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 포인트 탭 -->
                        <div class="mypage-tab-content" id="points-tab">
                            <div class="mypage-points-summary">
                                <div class="mypage-points-card">
                                    <h4>현재 포인트</h4>
                                    <p class="mypage-points-value" id="mypage-current-points">0 P</p>
                                </div>
                                <div class="mypage-points-card">
                                    <h4>이번 달 획득</h4>
                                    <p class="mypage-points-value" id="mypage-monthly-points">0 P</p>
                                </div>
                            </div>
                            <div class="mypage-points-actions">
                                <button class="mypage-action-btn" onclick="location.href='points-charge.html'">
                                    <i class="fas fa-credit-card"></i>
                                    포인트 충전
                                </button>
                                <button class="mypage-action-btn" onclick="location.href='points-shop.html'">
                                    <i class="fas fa-store"></i>
                                    포인트 상점
                                </button>
                            </div>
                            <div class="mypage-points-history" id="mypage-points-history">
                                <h4>포인트 내역</h4>
                                <div class="mypage-points-empty">
                                    <i class="fas fa-coins"></i>
                                    <p>포인트 내역이 없습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 뱃지 탭 -->
                        <div class="mypage-tab-content" id="badges-tab">
                            <div class="mypage-badge-stats">
                                <div class="mypage-badge-stat">
                                    <h4>보유 뱃지</h4>
                                    <p id="mypage-total-badges">0 / 28</p>
                                </div>
                                <div class="mypage-badge-stat">
                                    <h4>달성률</h4>
                                    <p id="mypage-badge-progress">0%</p>
                                </div>
                            </div>
                            <div class="mypage-badge-grid" id="mypage-badge-grid">
                                <div class="mypage-badge-empty">
                                    <i class="fas fa-medal"></i>
                                    <p>아직 획득한 뱃지가 없습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 구매 내역 탭 -->
                        <div class="mypage-tab-content" id="purchases-tab">
                            <div class="mypage-purchase-filters">
                                <button class="mypage-filter-btn active" data-filter="all">전체</button>
                                <button class="mypage-filter-btn" data-filter="points">포인트 충전</button>
                                <button class="mypage-filter-btn" data-filter="items">아이템 구매</button>
                                <button class="mypage-filter-btn" data-filter="membership">멤버십</button>
                            </div>
                            <div class="mypage-purchase-list" id="mypage-purchase-list">
                                <div class="mypage-purchase-empty">
                                    <i class="fas fa-shopping-cart"></i>
                                    <p>구매 내역이 없습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 뱃지 관리 탭 -->
                        <div class="mypage-tab-content" id="badges-tab">
                            <!-- 뱃지 통계 섹션 -->
                            <div class="badges-stats-section">
                                <div class="badges-stats-card">
                                    <div class="stats-icon">
                                        <i class="fas fa-trophy"></i>
                                    </div>
                                    <div class="stats-content">
                                        <h3 class="stats-title">획득한 뱃지</h3>
                                        <p class="stats-value">${userData?.badges?.length || 0} / 28</p>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${((userData?.badges?.length || 0) / 28 * 100).toFixed(0)}%"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="badges-stats-card">
                                    <div class="stats-icon">
                                        <i class="fas fa-medal"></i>
                                    </div>
                                    <div class="stats-content">
                                        <h3 class="stats-title">대표 뱃지</h3>
                                        <p class="stats-value">${userData?.representative_badge?.name || '없음'}</p>
                                        <button class="change-badge-btn" onclick="window.showRepresentativeBadgeModal()">
                                            <i class="fas fa-exchange-alt"></i>
                                            변경하기
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 뱃지 필터 -->
                            <div class="badges-filter-section">
                                <button class="badge-filter-btn active" data-category="all">
                                    전체
                                    <span class="filter-count">${this.getBadgeData().length}</span>
                                </button>
                                <button class="badge-filter-btn" data-category="activity">
                                    활동
                                    <span class="filter-count">8</span>
                                </button>
                                <button class="badge-filter-btn" data-category="community">
                                    커뮤니티
                                    <span class="filter-count">8</span>
                                </button>
                                <button class="badge-filter-btn" data-category="expertise">
                                    전문성
                                    <span class="filter-count">6</span>
                                </button>
                                <button class="badge-filter-btn" data-category="special">
                                    특별
                                    <span class="filter-count">6</span>
                                </button>
                            </div>
                            
                            <!-- 뱃지 그리드 -->
                            <div class="badges-grid" id="badges-grid">
                                ${this.getBadgeData().map(badge => {
                                    const isAcquired = userData?.badges?.some(b => b.id === badge.id);
                                    return `
                                        <div class="badge-item ${isAcquired ? 'acquired' : 'locked'}" 
                                             data-category="${badge.category}"
                                             data-badge-id="${badge.id}">
                                            <div class="badge-icon" style="background-color: ${isAcquired ? badge.color : '#E0E0E0'}">
                                                <i class="${badge.icon}"></i>
                                            </div>
                                            <div class="badge-info">
                                                <h4 class="badge-name">${badge.name}</h4>
                                                <p class="badge-description">${badge.description}</p>
                                            </div>
                                            ${isAcquired ? `
                                                <div class="badge-actions">
                                                    <button class="set-representative-btn" onclick="window.setRepresentativeBadge(${badge.id})">
                                                        <i class="fas fa-crown"></i>
                                                        대표 설정
                                                    </button>
                                                </div>
                                            ` : `
                                                <div class="badge-lock-overlay">
                                                    <i class="fas fa-lock"></i>
                                                </div>
                                            `}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- 보관함 탭 -->
                        <div class="mypage-tab-content" id="inventory-tab">
                            <!-- 보관함 통계 -->
                            <div class="inventory-stats">
                                <div class="inventory-stat-card">
                                    <div class="stat-icon">
                                        <i class="fas fa-box"></i>
                                    </div>
                                    <div class="stat-info">
                                        <p class="stat-label">전체 아이템</p>
                                        <p class="stat-value">${this.getInventoryItems().length}개</p>
                                    </div>
                                </div>
                                <div class="inventory-stat-card">
                                    <div class="stat-icon">
                                        <i class="fas fa-layer-group"></i>
                                    </div>
                                    <div class="stat-info">
                                        <p class="stat-label">총 보유 수량</p>
                                        <p class="stat-value">${this.getInventoryItems().reduce((sum, item) => sum + item.quantity, 0)}개</p>
                                    </div>
                                </div>
                                <div class="inventory-stat-card">
                                    <div class="stat-icon">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <div class="stat-info">
                                        <p class="stat-label">사용한 아이템</p>
                                        <p class="stat-value">${this.getInventoryItems().reduce((sum, item) => sum + item.used, 0)}개</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 필터 버튼 -->
                            <div class="inventory-filters">
                                <button class="inventory-filter-btn active" data-filter="all">
                                    <i class="fas fa-th"></i>
                                    전체
                                </button>
                                <button class="inventory-filter-btn" data-filter="decoration">
                                    <i class="fas fa-palette"></i>
                                    꾸미기
                                </button>
                                <button class="inventory-filter-btn" data-filter="utility">
                                    <i class="fas fa-tools"></i>
                                    유틸리티
                                </button>
                                <button class="inventory-filter-btn" data-filter="booster">
                                    <i class="fas fa-rocket"></i>
                                    부스터
                                </button>
                                <button class="inventory-filter-btn" data-filter="badge">
                                    <i class="fas fa-medal"></i>
                                    뱃지
                                </button>
                                <button class="inventory-filter-btn" data-filter="emoticon">
                                    <i class="fas fa-smile"></i>
                                    이모티콘
                                </button>
                            </div>
                            
                            <!-- 아이템 리스트 -->
                            <div class="inventory-grid">
                                ${this.getInventoryItems().map(item => `
                                    <div class="inventory-item" data-type="${item.type}">
                                        <div class="inventory-item-header">
                                            <div class="inventory-item-icon" style="background-color: ${item.color}">
                                                <i class="${item.icon}"></i>
                                            </div>
                                            <div class="inventory-item-info">
                                                <h4>${item.name}</h4>
                                                <span class="inventory-item-type">${this.getItemTypeText(item.type)}</span>
                                            </div>
                                        </div>
                                        <div class="inventory-item-quantity">
                                            <span class="inventory-quantity-badge">
                                                <i class="fas fa-box"></i>
                                                보유: ${item.quantity}개
                                            </span>
                                            ${item.used > 0 ? `<span class="inventory-used-badge">사용: ${item.used}개</span>` : ''}
                                        </div>
                                        <div class="inventory-item-date">
                                            <i class="fas fa-calendar"></i>
                                            획득일: ${this.formatDate(item.acquired_date)}
                                        </div>
                                        <div class="inventory-item-actions">
                                            ${item.quantity > item.used ? `
                                                <button class="inventory-action-btn inventory-use-btn" onclick="window.useInventoryItem(${item.id})">
                                                    <i class="fas fa-play"></i>
                                                    사용하기
                                                </button>
                                            ` : `
                                                <button class="inventory-action-btn inventory-use-btn" disabled>
                                                    <i class="fas fa-check"></i>
                                                    모두 사용
                                                </button>
                                            `}
                                            <button class="inventory-action-btn inventory-detail-btn" onclick="window.showItemDetail(${item.id})">
                                                <i class="fas fa-info-circle"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- 빈 상태 -->
                            <div class="inventory-empty" style="display: none;">
                                <i class="fas fa-box-open"></i>
                                <h3>보관함이 비어있습니다</h3>
                                <p>포인트샵에서 다양한 아이템을 구매해보세요!</p>
                                <a href="/points-shop.html" class="inventory-shop-btn">
                                    <i class="fas fa-shopping-cart"></i>
                                    포인트샵 가기
                                </a>
                            </div>
                        </div>
                        
                        <!-- 장바구니 탭 -->
                        <div class="mypage-tab-content" id="cart-tab">
                            <div class="cart-container">
                                <!-- 장바구니 요약 -->
                                <div class="cart-summary">
                                    <div class="cart-summary-item">
                                        <span class="summary-label">총 아이템</span>
                                        <span class="summary-value">${this.getCartItems().length}개</span>
                                    </div>
                                    <div class="cart-summary-item">
                                        <span class="summary-label">총 수량</span>
                                        <span class="summary-value">${this.getCartItems().reduce((sum, item) => sum + item.quantity, 0)}개</span>
                                    </div>
                                    <div class="cart-summary-item highlight">
                                        <span class="summary-label">총 금액</span>
                                        <span class="summary-value">
                                            <i class="fas fa-coins"></i>
                                            ${this.getCartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}P
                                        </span>
                                    </div>
                                </div>
                                
                                <!-- 전체 선택 바 -->
                                <div class="cart-select-bar">
                                    <label class="cart-select-all">
                                        <input type="checkbox" id="cart-select-all" checked>
                                        <span>전체 선택</span>
                                    </label>
                                    <button class="cart-remove-selected" onclick="window.removeSelectedCartItems()">
                                        <i class="fas fa-trash"></i>
                                        선택 삭제
                                    </button>
                                </div>
                                
                                <!-- 장바구니 아이템 리스트 -->
                                <div class="cart-items-list">
                                    ${this.getCartItems().map(item => `
                                        <div class="cart-item" data-item-id="${item.id}">
                                            <div class="cart-item-select">
                                                <input type="checkbox" class="cart-item-checkbox" checked>
                                            </div>
                                            <div class="cart-item-icon" style="background-color: ${item.color}">
                                                <i class="${item.icon}"></i>
                                            </div>
                                            <div class="cart-item-info">
                                                <h4 class="cart-item-name">${item.name}</h4>
                                                <div class="cart-item-type">${this.getItemTypeText(item.type)}</div>
                                                <div class="cart-item-price">
                                                    ${item.discount > 0 ? `
                                                        <span class="original-price">${item.originalPrice.toLocaleString()}P</span>
                                                        <span class="discount-badge">${item.discount}%</span>
                                                    ` : ''}
                                                    <span class="current-price">
                                                        <i class="fas fa-coins"></i>
                                                        ${item.price.toLocaleString()}P
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="cart-item-quantity">
                                                <button class="quantity-btn" onclick="window.updateCartQuantity(${item.id}, -1)">
                                                    <i class="fas fa-minus"></i>
                                                </button>
                                                <span class="quantity-value">${item.quantity}</span>
                                                <button class="quantity-btn" onclick="window.updateCartQuantity(${item.id}, 1)">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div class="cart-item-total">
                                                <span class="total-label">소계</span>
                                                <span class="total-value">
                                                    <i class="fas fa-coins"></i>
                                                    ${(item.price * item.quantity).toLocaleString()}P
                                                </span>
                                            </div>
                                            <button class="cart-item-remove" onclick="window.removeCartItem(${item.id})">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                <!-- 결제 섹션 -->
                                <div class="cart-checkout-section">
                                    <div class="checkout-info">
                                        <div class="checkout-row">
                                            <span>상품 금액</span>
                                            <span>${this.getCartItems().reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0).toLocaleString()}P</span>
                                        </div>
                                        <div class="checkout-row discount">
                                            <span>할인 금액</span>
                                            <span>-${(this.getCartItems().reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0) - this.getCartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0)).toLocaleString()}P</span>
                                        </div>
                                        <div class="checkout-row total">
                                            <span>최종 결제 금액</span>
                                            <span class="total-price">
                                                <i class="fas fa-coins"></i>
                                                ${this.getCartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}P
                                            </span>
                                        </div>
                                    </div>
                                    <div class="checkout-actions">
                                        <button class="btn-continue-shopping" onclick="window.location.href='/points-shop.html'">
                                            <i class="fas fa-arrow-left"></i>
                                            계속 쇼핑하기
                                        </button>
                                        <button class="btn-checkout" onclick="window.proceedCheckout()">
                                            <i class="fas fa-credit-card"></i>
                                            구매하기
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- 빈 장바구니 -->
                                <div class="cart-empty" style="display: none;">
                                    <i class="fas fa-shopping-cart"></i>
                                    <h3>장바구니가 비어있습니다</h3>
                                    <p>포인트샵에서 마음에 드는 아이템을 담아보세요!</p>
                                    <a href="/points-shop.html" class="cart-shop-btn">
                                        <i class="fas fa-store"></i>
                                        포인트샵 둘러보기
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 포인트 내역 탭 -->
                        <div class="mypage-tab-content" id="points-tab">
                            <p>포인트 내역 컨텐츠</p>
                        </div>
                        
                        <!-- 결제 내역 탭 -->
                        <div class="mypage-tab-content" id="payments-tab">
                            <p>결제 내역 컨텐츠</p>
                        </div>
                        
                        <!-- 활동 기록 탭 -->
                        <div class="mypage-tab-content" id="activity-tab">
                            <p>활동 기록 컨텐츠</p>
                        </div>
                        
                        <!-- 설정 탭 -->
                        <div class="mypage-tab-content" id="settings-tab">
                            <p>설정 컨텐츠</p>
                        </div>
                        
                        <!-- 실무자 인증 탭 -->
                        <div class="mypage-tab-content" id="verification-tab">
                            <p>실무자 인증 컨텐츠</p>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        `;

        this.componentCache.set('mypage-modal', mypageModalHTML);
        
        // 마이페이지 모달이 아직 없으면 body에 추가
        const existingModal = document.getElementById('mypageSidepanel');
        if (!existingModal) {
            document.body.insertAdjacentHTML('beforeend', mypageModalHTML);
            this.initializeMypageEvents();
        }
    }

    /**
     * 마이페이지 이벤트 초기화
     */
    initializeMypageEvents() {
        // 마이페이지 네비게이션 클릭 이벤트
        const mypageNavItems = document.querySelectorAll('.mypage-nav-item');
        mypageNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetTab = item.getAttribute('data-tab');
                
                // 모든 네비게이션과 콘텐츠의 active 클래스 제거
                document.querySelectorAll('.mypage-nav-item').forEach(nav => nav.classList.remove('active'));
                document.querySelectorAll('.mypage-tab-content').forEach(content => content.classList.remove('active'));
                
                // 클릭된 아이템과 해당 콘텐츠에 active 클래스 추가
                item.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });

        // 설정 버튼 이벤트 핸들러
        const settingButtons = document.querySelectorAll('.mypage-setting-btn[data-action]');
        settingButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                
                switch (action) {
                    case 'change-email':
                        this.showChangeEmailModal();
                        break;
                    case 'change-password':
                        this.showChangePasswordModal();
                        break;
                }
            });
        });

        // 마이페이지 사이드패널 외부 클릭 시 닫기
        const mypageSidepanel = document.getElementById('mypageSidepanel');
        if (mypageSidepanel) {
            mypageSidepanel.addEventListener('click', (e) => {
                if (e.target === mypageSidepanel) {
                    if (typeof window.authService?.closeMypageSidepanel === 'function') {
                        window.authService.closeMypageSidepanel();
                    } else if (typeof closeMypageSidepanel === 'function') {
                        closeMypageSidepanel();
                    }
                }
            });
        }

        // ESC 키로 마이페이지 사이드패널 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mypageSidepanel && mypageSidepanel.classList.contains('show')) {
                if (typeof window.authService?.closeMypageSidepanel === 'function') {
                    window.authService.closeMypageSidepanel();
                } else if (typeof closeMypageSidepanel === 'function') {
                    closeMypageSidepanel();
                }
            }
        });

        // 뱃지 필터 이벤트
        const badgeFilterBtns = document.querySelectorAll('.badge-filter-btn');
        badgeFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                
                // 버튼 활성화 상태 변경
                badgeFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 뱃지 필터링
                const badgeItems = document.querySelectorAll('.badge-item');
                badgeItems.forEach(item => {
                    if (category === 'all' || item.getAttribute('data-category') === category) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
        
        // 보관함 필터 이벤트
        const inventoryFilterBtns = document.querySelectorAll('.inventory-filter-btn');
        inventoryFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // 버튼 활성화 상태 변경
                inventoryFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 아이템 필터링
                const inventoryItems = document.querySelectorAll('.inventory-item');
                inventoryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-type') === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // 빈 상태 표시/숨김
                const visibleItems = document.querySelectorAll('.inventory-item[style="display: block;"]');
                const emptyState = document.querySelector('.inventory-empty');
                if (emptyState) {
                    emptyState.style.display = visibleItems.length === 0 ? 'block' : 'none';
                }
            });
        });

        // 전역 switchTab 함수 추가
        window.switchTab = (tabName) => {
            window.switchMypageTab(tabName);
        };

        // 전역 함수로 마이페이지 관련 함수들 등록
        if (!window.closeMypageSidepanel) {
            window.closeMypageSidepanel = () => {
                if (typeof window.authService?.closeMypageSidepanel === 'function') {
                    window.authService.closeMypageSidepanel();
                } else {
                    const sidepanel = document.getElementById('mypageSidepanel');
                    if (sidepanel) {
                        sidepanel.classList.remove('show');
                        document.body.style.overflow = '';
                    }
                }
            };
        }

        if (!window.openMypageSidepanel) {
            window.openMypageSidepanel = () => {
                if (typeof window.authService?.openMypageSidepanel === 'function') {
                    window.authService.openMypageSidepanel();
                } else {
                    const sidepanel = document.getElementById('mypageSidepanel');
                    if (sidepanel) {
                        sidepanel.classList.add('show');
                        document.body.style.overflow = 'hidden';
                        // authService가 있으면 데이터 로드
                        if (window.authService && typeof window.authService.loadMypageData === 'function') {
                            window.authService.loadMypageData();
                        }
                    }
                }
            };
        }

        if (!window.switchMypageTab) {
            window.switchMypageTab = (tabName) => {
                if (typeof window.authService?.switchMypageTab === 'function') {
                    window.authService.switchMypageTab(tabName);
                } else {
                    // 네비게이션 활성화 상태 변경
                    const navItems = document.querySelectorAll('.mypage-nav-item');
                    navItems.forEach(item => {
                        item.classList.remove('active');
                        if (item.dataset.tab === tabName) {
                            item.classList.add('active');
                        }
                    });

                    // 탭 콘텐츠 표시/숨김
                    const tabContents = document.querySelectorAll('.mypage-tab-content');
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${tabName}-tab`) {
                            content.classList.add('active');
                        }
                    });
                }
            };
        }

        // 실무자 관련 함수들
        if (!window.uploadDocuments) {
            window.uploadDocuments = () => {
                if (confirm('문서 업로드 페이지로 이동하시겠습니까?')) {
                    window.location.href = 'market-research.html?from=practitioner';
                }
            };
        }

        // 뱃지 관련 함수들
        if (!window.setRepresentativeBadge) {
            window.setRepresentativeBadge = (badgeId) => {
                if (window.authService && typeof window.authService.setRepresentativeBadge === 'function') {
                    window.authService.setRepresentativeBadge(badgeId);
                } else {
                    alert('대표 뱃지가 설정되었습니다.');
                    // 임시로 UI만 업데이트
                    const badge = this.getBadgeData().find(b => b.id === badgeId);
                    if (badge) {
                        const statsValue = document.querySelector('.badges-stats-card .stats-value');
                        if (statsValue) {
                            statsValue.textContent = badge.name;
                        }
                    }
                }
            };
        }

        if (!window.showRepresentativeBadgeModal) {
            window.showRepresentativeBadgeModal = () => {
                const userData = window.authService ? window.authService.currentUser : null;
                const acquiredBadges = this.getBadgeData().filter(badge => 
                    userData?.badges?.some(b => b.id === badge.id)
                );
                
                if (acquiredBadges.length === 0) {
                    alert('아직 획득한 뱃지가 없습니다.');
                    return;
                }
                
                // 간단한 모달 표시
                const modalHTML = `
                    <div class="modal fade show" id="representativeBadgeModal">
                        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
                        <div class="modal-content modal-sm">
                            <div class="modal-header">
                                <h3 class="modal-title">대표 뱃지 선택</h3>
                                <button type="button" class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                            </div>
                            <div class="modal-body">
                                <div class="representative-badge-list">
                                    ${acquiredBadges.map(badge => `
                                        <div class="representative-badge-item" onclick="window.setRepresentativeBadge(${badge.id}); this.closest('.modal').remove()">
                                            <div class="badge-icon" style="background-color: ${badge.color}">
                                                <i class="${badge.icon}"></i>
                                            </div>
                                            <div class="badge-info">
                                                <h4>${badge.name}</h4>
                                                <p>${badge.description}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', modalHTML);
            };
        }
        
        // 보관함 관련 함수들
        if (!window.useInventoryItem) {
            window.useInventoryItem = (itemId) => {
                const item = this.getInventoryItems().find(i => i.id === itemId);
                if (item) {
                    if (confirm(`${item.name}을(를) 사용하시겠습니까?`)) {
                        alert(`${item.name}이(가) 사용되었습니다.`);
                        // TODO: 실제 사용 로직 구현
                    }
                }
            };
        }
        
        if (!window.showItemDetail) {
            window.showItemDetail = (itemId) => {
                const item = this.getInventoryItems().find(i => i.id === itemId);
                if (item) {
                    alert(`[${item.name}]\n\n타입: ${item.type}\n보유수량: ${item.quantity}개\n사용수량: ${item.used}개\n획득일: ${this.formatDate(item.acquired_date)}`);
                }
            };
        }
    }

    /**
     * 이메일 변경 모달 표시
     */
    showChangeEmailModal() {
        const modalHTML = `
            <div class="modal fade" id="changeEmailModal">
                <div class="modal-overlay"></div>
                <div class="modal-content modal-sm">
                    <div class="modal-header">
                        <h3 class="modal-title">이메일 변경</h3>
                        <button type="button" class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="changeEmailForm">
                            <div class="form-group">
                                <label for="currentEmail">현재 이메일</label>
                                <input type="email" id="currentEmail" class="form-control" readonly>
                            </div>
                            <div class="form-group">
                                <label for="newEmail">새 이메일</label>
                                <input type="email" id="newEmail" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="emailPassword">비밀번호 확인</label>
                                <input type="password" id="emailPassword" class="form-control" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">취소</button>
                        <button type="button" class="btn btn-primary" onclick="window.authService.changeEmail()">변경</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('changeEmailModal');
        modal.classList.add('show');
        
        // 현재 이메일 설정
        const currentEmailInput = document.getElementById('currentEmail');
        if (window.authService && window.authService.currentUser) {
            currentEmailInput.value = window.authService.currentUser.email;
        }
    }
    
    /**
     * 비밀번호 변경 모달 표시
     */
    showChangePasswordModal() {
        const modalHTML = `
            <div class="modal fade" id="changePasswordModal">
                <div class="modal-overlay"></div>
                <div class="modal-content modal-sm">
                    <div class="modal-header">
                        <h3 class="modal-title">비밀번호 변경</h3>
                        <button type="button" class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="changePasswordForm">
                            <div class="form-group">
                                <label for="currentPassword">현재 비밀번호</label>
                                <input type="password" id="currentPassword" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="newPassword">새 비밀번호</label>
                                <input type="password" id="newPassword" class="form-control" required>
                                <small class="form-text text-muted">8자 이상, 영문과 숫자 포함</small>
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">새 비밀번호 확인</label>
                                <input type="password" id="confirmPassword" class="form-control" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">취소</button>
                        <button type="button" class="btn btn-primary" onclick="window.authService.changePassword()">변경</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('changePasswordModal');
        modal.classList.add('show');
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
            // 활동 관련 뱃지 (8개)
            { id: 1, name: '첫 발걸음', description: '첫 로그인', icon: 'fas fa-door-open', color: '#4CAF50', category: 'activity' },
            { id: 2, name: '신입생', description: '회원가입 7일', icon: 'fas fa-user-graduate', color: '#2196F3', category: 'activity' },
            { id: 3, name: '단골손님', description: '30일 연속 방문', icon: 'fas fa-calendar-check', color: '#FF9800', category: 'activity' },
            { id: 4, name: '열정맨', description: '100일 연속 방문', icon: 'fas fa-fire', color: '#F44336', category: 'activity' },
            { id: 5, name: '출석왕', description: '1년 개근', icon: 'fas fa-crown', color: '#FFD700', category: 'activity' },
            { id: 6, name: '야행성', description: '새벽 활동 30회', icon: 'fas fa-moon', color: '#9C27B0', category: 'activity' },
            { id: 7, name: '얼리버드', description: '아침 활동 30회', icon: 'fas fa-sun', color: '#FFC107', category: 'activity' },
            { id: 8, name: '주말전사', description: '주말 활동 50회', icon: 'fas fa-couch', color: '#00BCD4', category: 'activity' },
            
            // 커뮤니티 관련 뱃지 (8개)
            { id: 9, name: '첫 글쓰기', description: '첫 게시글 작성', icon: 'fas fa-pen', color: '#3F51B5', category: 'community' },
            { id: 10, name: '글쓰기왕', description: '게시글 100개', icon: 'fas fa-feather', color: '#E91E63', category: 'community' },
            { id: 11, name: '댓글왕', description: '댓글 500개', icon: 'fas fa-comments', color: '#00ACC1', category: 'community' },
            { id: 12, name: '인기스타', description: '좋아요 1000개', icon: 'fas fa-star', color: '#FFB300', category: 'community' },
            { id: 13, name: '베스트셀러', description: '베스트글 10회', icon: 'fas fa-book', color: '#43A047', category: 'community' },
            { id: 14, name: '토론왕', description: 'Q&A 답변 100개', icon: 'fas fa-question-circle', color: '#5E35B1', category: 'community' },
            { id: 15, name: '유머왕', description: '유머글 인기 10회', icon: 'fas fa-laugh', color: '#FB8C00', category: 'community' },
            { id: 16, name: '도움왕', description: '채택답변 50개', icon: 'fas fa-hands-helping', color: '#1E88E5', category: 'community' },
            
            // 전문성 관련 뱃지 (6개)
            { id: 17, name: '분양전문가', description: '분양 관련글 50개', icon: 'fas fa-building', color: '#37474F', category: 'expertise' },
            { id: 18, name: '시장분석가', description: '시장분석글 30개', icon: 'fas fa-chart-line', color: '#6A1B9A', category: 'expertise' },
            { id: 19, name: '청약박사', description: '청약 가이드 20개', icon: 'fas fa-graduation-cap', color: '#C0392B', category: 'expertise' },
            { id: 20, name: '법률전문가', description: '법률 상담 30회', icon: 'fas fa-gavel', color: '#16A085', category: 'expertise' },
            { id: 21, name: '투자고수', description: '투자 조언 50회', icon: 'fas fa-coins', color: '#F39C12', category: 'expertise' },
            { id: 22, name: '멘토', description: '신입 도움 100회', icon: 'fas fa-chalkboard-teacher', color: '#2980B9', category: 'expertise' },
            
            // 특별 뱃지 (6개)
            { id: 23, name: '얼리어답터', description: '베타 테스터', icon: 'fas fa-rocket', color: '#E74C3C', category: 'special' },
            { id: 24, name: '이벤트왕', description: '이벤트 참여 10회', icon: 'fas fa-gift', color: '#9B59B6', category: 'special' },
            { id: 25, name: '버그헌터', description: '버그 제보 5회', icon: 'fas fa-bug', color: '#34495E', category: 'special' },
            { id: 26, name: '서포터즈', description: '공식 서포터즈', icon: 'fas fa-heart', color: '#E91E63', category: 'special' },
            { id: 27, name: 'VIP', description: '프리미엄 1년', icon: 'fas fa-gem', color: '#8E44AD', category: 'special' },
            { id: 28, name: '레전드', description: '모든 뱃지 획득', icon: 'fas fa-trophy', color: '#FFD700', category: 'special' }
        ];
    }
    
    /**
     * 보관함 아이템 샘플 데이터
     */
    getInventoryItems() {
        return [
            { id: 1, name: '프로필 꾸미기 아이템', type: 'decoration', icon: 'fas fa-palette', color: '#E91E63', quantity: 3, acquired_date: '2024-01-15', used: 1 },
            { id: 2, name: '닉네임 변경권', type: 'utility', icon: 'fas fa-edit', color: '#2196F3', quantity: 1, acquired_date: '2024-01-20', used: 0 },
            { id: 3, name: '포인트 2배 부스터', type: 'booster', icon: 'fas fa-rocket', color: '#FF9800', quantity: 2, acquired_date: '2024-02-01', used: 0 },
            { id: 4, name: '광고 제거 1일권', type: 'utility', icon: 'fas fa-ban', color: '#9C27B0', quantity: 5, acquired_date: '2024-02-10', used: 2 },
            { id: 5, name: 'VIP 전용 뱃지', type: 'badge', icon: 'fas fa-crown', color: '#FFD700', quantity: 1, acquired_date: '2024-02-15', used: 0 },
            { id: 6, name: '특별 이모티콘 팩', type: 'emoticon', icon: 'fas fa-smile', color: '#4CAF50', quantity: 1, acquired_date: '2024-02-20', used: 0 }
        ];
    }
    
    /**
     * 장바구니 아이템 샘플 데이터
     */
    getCartItems() {
        return [
            { 
                id: 1, 
                name: '프리미엄 프로필 테마', 
                type: 'decoration', 
                icon: 'fas fa-paint-brush', 
                color: '#9C27B0', 
                price: 500,
                originalPrice: 700,
                discount: 30,
                quantity: 1,
                added_date: '2024-02-25'
            },
            { 
                id: 2, 
                name: '경험치 2배 부스터 (7일)', 
                type: 'booster', 
                icon: 'fas fa-fire', 
                color: '#FF5722', 
                price: 300,
                originalPrice: 300,
                discount: 0,
                quantity: 2,
                added_date: '2024-02-24'
            },
            { 
                id: 3, 
                name: '커스텀 이모티콘 세트', 
                type: 'emoticon', 
                icon: 'fas fa-grin-stars', 
                color: '#FFC107', 
                price: 800,
                originalPrice: 1000,
                discount: 20,
                quantity: 1,
                added_date: '2024-02-23'
            }
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
        await this.loadMypageModal();

        // 사이드바 상태 복원
        const sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (sidebarCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        }
    }
}

// 전역으로 내보내기
window.ComponentLoader = ComponentLoader;