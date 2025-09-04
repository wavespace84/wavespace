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

        const mypageModalHTML = `
            <!-- 마이페이지 사이드패널 - 고객센터 스타일 적용 -->
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
                    
                    <!-- 탭 네비게이션 - 고객센터 guide-tabs 스타일 -->
                    <div class="mypage-tabs">
                        <button class="mypage-tab active" data-tab="profile">내 정보</button>
                        <button class="mypage-tab" data-tab="activity">활동 내역</button>
                        <button class="mypage-tab" data-tab="points">포인트</button>
                        <button class="mypage-tab" data-tab="badges">뱃지</button>
                        <button class="mypage-tab" data-tab="purchases">구매 내역</button>
                        <button class="mypage-tab" data-tab="settings">설정</button>
                    </div>
                    
                    <div class="mypage-content">
                        <!-- 내 정보 탭 -->
                        <div class="mypage-tab-content active" id="profile-tab">
                            <!-- 프로필 섹션 -->
                            <div class="mypage-profile-section">
                                <div class="mypage-profile-card">
                                    <div class="mypage-profile-info">
                                        <div class="mypage-avatar-wrapper">
                                            <div class="mypage-avatar" id="avatar-placeholder">
                                                <i class="fas fa-user"></i>
                                            </div>
                                            <button class="mypage-avatar-edit" onclick="document.getElementById('mypage-avatar-upload').click()">
                                                <i class="fas fa-camera"></i>
                                            </button>
                                            <input type="file" id="mypage-avatar-upload" accept="image/*" style="display: none;" aria-label="프로필 이미지 업로드">
                                        </div>
                                        <div class="mypage-user-info">
                                            <div class="mypage-username" id="mypage-username">사용자명</div>
                                            <div class="mypage-representative-badge" id="mypage-representative-badge">
                                                <i class="fas fa-medal"></i>
                                                <span>대표 뱃지</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                                
                            <!-- 활동 현황 그리드 - 고객센터 quick-menu 스타일 -->
                            <div class="mypage-stats-grid">
                                <div class="mypage-stat-item">
                                    <div class="mypage-stat-icon">
                                        <i class="fas fa-coins"></i>
                                    </div>
                                    <div class="mypage-stat-value" id="mypage-points">10000 P</div>
                                    <div class="mypage-stat-label">보유 포인트</div>
                                </div>
                                <div class="mypage-stat-item">
                                    <div class="mypage-stat-icon">
                                        <i class="fas fa-trophy"></i>
                                    </div>
                                    <div class="mypage-stat-value" id="mypage-ranking">#-</div>
                                    <div class="mypage-stat-label">전체 순위</div>
                                </div>
                                <div class="mypage-stat-item">
                                    <div class="mypage-stat-icon">
                                        <i class="fas fa-medal"></i>
                                    </div>
                                    <div class="mypage-stat-value" id="mypage-badge-count">0개</div>
                                    <div class="mypage-stat-label">보유 뱃지</div>
                                </div>
                            </div>

                            <!-- 회원 정보 카드 -->
                            <div class="mypage-section-card">
                                <h4 class="mypage-section-title">회원 정보</h4>
                                <div class="mypage-info-list">
                                    <div class="mypage-info-item">
                                        <span class="mypage-info-label">아이디</span>
                                        <span class="mypage-info-value" id="mypage-user-id">-</span>
                                    </div>
                                    <div class="mypage-info-item">
                                        <span class="mypage-info-label">닉네임</span>
                                        <span class="mypage-info-value" id="mypage-nickname">-</span>
                                    </div>
                                    <div class="mypage-info-item">
                                        <span class="mypage-info-label">이메일</span>
                                        <span class="mypage-info-value" id="mypage-email">user@example.com</span>
                                    </div>
                                    <div class="mypage-info-item">
                                        <span class="mypage-info-label">회원유형</span>
                                        <span class="mypage-info-value" id="mypage-member-type">-</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 실무자 인증 카드 (분양기획, 관계사만 표시) -->
                            <div class="mypage-practitioner-card" id="mypage-practitioner" style="display: none;">
                                <div class="mypage-practitioner-header">
                                    <div class="mypage-practitioner-title">
                                        <i class="fas fa-certificate"></i>
                                        실무자 인증
                                    </div>
                                    <span class="mypage-status-badge pending">인증 대기중</span>
                                </div>
                                <div class="mypage-progress-info">
                                    <div class="mypage-progress-bar">
                                        <div class="mypage-progress-fill" style="width: 33%"></div>
                                    </div>
                                    <p class="mypage-progress-text">3건 중 1건 업로드 완료</p>
                                </div>
                                <button class="mypage-upload-btn" onclick="uploadDocuments()">
                                    <i class="fas fa-upload"></i>
                                    문서 업로드하기
                                </button>
                            </div>

                            <!-- 활동 현황 카드 -->
                            <div class="mypage-section-card">
                                <h4 class="mypage-section-title">활동 현황</h4>
                                <div class="mypage-info-cards">
                                    <div class="mypage-info-card">
                                        <div class="mypage-card-icon">
                                            <i class="fas fa-coins"></i>
                                        </div>
                                        <div class="mypage-card-content">
                                            <h4>보유 포인트</h4>
                                            <p class="mypage-card-value" id="mypage-points">0 P</p>
                                        </div>
                                    </div>
                                    <div class="mypage-info-card">
                                        <div class="mypage-card-icon">
                                            <i class="fas fa-trophy"></i>
                                        </div>
                                        <div class="mypage-card-content">
                                            <h4>전체 순위</h4>
                                            <p class="mypage-card-value" id="mypage-rank">#-</p>
                                        </div>
                                    </div>
                                    <div class="mypage-info-card">
                                        <div class="mypage-card-icon">
                                            <i class="fas fa-medal"></i>
                                        </div>
                                        <div class="mypage-card-content">
                                            <h4>보유 뱃지</h4>
                                            <p class="mypage-card-value" id="mypage-badge-count">0개</p>
                                        </div>
                                    </div>
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
                        
                        <!-- 설정 탭 -->
                        <div class="mypage-tab-content" id="settings-tab">
                            <div class="mypage-setting-section">
                                <h4>계정 설정</h4>
                                <div class="mypage-setting-item">
                                    <div class="mypage-setting-info">
                                        <h5>이메일 변경</h5>
                                        <p>로그인에 사용되는 이메일을 변경합니다.</p>
                                    </div>
                                    <button class="mypage-setting-btn">변경</button>
                                </div>
                                <div class="mypage-setting-item">
                                    <div class="mypage-setting-info">
                                        <h5>비밀번호 변경</h5>
                                        <p>계정 보안을 위해 주기적으로 변경해주세요.</p>
                                    </div>
                                    <button class="mypage-setting-btn">변경</button>
                                </div>
                            </div>
                            
                            <div class="mypage-setting-section">
                                <h4>알림 설정</h4>
                                <div class="mypage-setting-item">
                                    <div class="mypage-setting-info">
                                        <h5>이메일 알림</h5>
                                        <p>중요한 공지사항을 이메일로 받습니다.</p>
                                    </div>
                                    <label class="mypage-toggle">
                                        <input type="checkbox" id="emailNotification" checked>
                                        <span class="mypage-toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="mypage-setting-item">
                                    <div class="mypage-setting-info">
                                        <h5>브라우저 알림</h5>
                                        <p>댓글, 답변 등의 알림을 브라우저로 받습니다.</p>
                                    </div>
                                    <label class="mypage-toggle">
                                        <input type="checkbox" id="browserNotification">
                                        <span class="mypage-toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="mypage-setting-section">
                                <h4>개인정보</h4>
                                <div class="mypage-setting-item">
                                    <div class="mypage-setting-info">
                                        <h5>개인정보 다운로드</h5>
                                        <p>내 계정의 모든 데이터를 다운로드합니다.</p>
                                    </div>
                                    <button class="mypage-setting-btn">다운로드</button>
                                </div>
                                <div class="mypage-setting-item danger">
                                    <div class="mypage-setting-info">
                                        <h5>계정 삭제</h5>
                                        <p>계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
                                    </div>
                                    <button class="mypage-setting-btn danger">삭제</button>
                                </div>
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
        // 마이페이지 탭 클릭 이벤트
        const mypageTabs = document.querySelectorAll('.mypage-tab');
        mypageTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // 모든 탭과 콘텐츠의 active 클래스 제거
                document.querySelectorAll('.mypage-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.mypage-tab-content').forEach(c => c.classList.remove('active'));
                
                // 클릭된 탭과 해당 콘텐츠에 active 클래스 추가
                tab.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
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

        // 전역 함수로 마이페이지 닫기 함수 등록
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