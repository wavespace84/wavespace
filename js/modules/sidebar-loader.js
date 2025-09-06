// sidebar-loader.js - 사이드바 동적 로드 시스템
// 모든 페이지에서 일관된 사이드바 구조를 보장하고 중복 제거

// 로컬 스토리지 키
const STORAGE_KEYS = {
    SIDEBAR_STATE: 'wave-sidebar-state',
    ACTIVE_CATEGORY: 'wave-active-category',
};

class SidebarLoader {
    constructor() {
        this.isLoaded = false;
        this.sidebarContent = null;
        this.currentPage = null;
        this.eventsInitialized = false;
    }

    /**
     * 사이드바 템플릿을 로드하고 삽입
     * @param {string} containerId - 사이드바를 삽입할 컨테이너 ID (기본: sidebar-container)
     * @param {string} currentPage - 현재 페이지 이름 (active 상태 표시용)
     * @returns {Promise<boolean>} 로드 성공 여부
     */
    async loadSidebar(containerId = 'sidebar-container', currentPage = null) {
        try {
            this.currentPage = currentPage || this.detectCurrentPage();
            
            // 이미 로드된 경우 재사용
            if (this.isLoaded && this.sidebarContent) {
                return this.insertSidebar(containerId);
            }

            // 사이드바 템플릿 파일 로드
            const response = await fetch('components/sidebar.html');
            if (!response.ok) {
                throw new Error(`사이드바 템플릿 로드 실패: ${response.status}`);
            }

            this.sidebarContent = await response.text();
            console.log('[SidebarLoader] 사이드바 템플릿 로드 완료');
            this.isLoaded = true;

            return this.insertSidebar(containerId);

        } catch (error) {
            console.error('[SidebarLoader] 사이드바 로드 실패:', error);
            
            // 폴백: 기본 사이드바 구조 생성
            this.createFallbackSidebar(containerId);
            return false;
        }
    }

    /**
     * 로드된 사이드바 콘텐츠를 컨테이너에 삽입
     * @param {string} containerId 
     * @returns {boolean}
     */
    insertSidebar(containerId) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`[SidebarLoader] 사이드바 컨테이너를 찾을 수 없음: #${containerId}`);
            return false;
        }

        console.log(`[SidebarLoader] 컨테이너에 HTML 삽입 시작, 콘텐츠 길이: ${this.sidebarContent.length}`);
        container.innerHTML = this.sidebarContent;
        console.log(`[SidebarLoader] 컨테이너에 HTML 삽입 완료`);
        
        // SidebarLoader에 의해 로드되었음을 표시
        const sidebar = container.querySelector('.sidebar');
        if (sidebar) {
            sidebar.setAttribute('data-loaded-by', 'SidebarLoader');
        }
        
        // 전역 플래그 설정 (sidebar.js 실행 방지)
        window._sidebarLoaded = true;
        
        // 현재 페이지에 해당하는 메뉴 항목에 active 클래스 추가
        this.setActiveMenuItem();
        
        // 사이드바 이벤트 리스너 설정
        this.setupSidebarEvents();
        
        console.log('[SidebarLoader] 사이드바 삽입 및 초기화 완료');
        return true;
    }

    /**
     * 현재 페이지 자동 감지
     * @returns {string}
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop() || 'index.html';
        return fileName.replace('.html', '');
    }

    /**
     * 현재 페이지에 해당하는 메뉴 항목에 active 클래스 추가
     */
    setActiveMenuItem() {
        if (!this.currentPage) return;

        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // 모든 nav-item에서 active 클래스 제거
        const allNavItems = sidebar.querySelectorAll('.nav-item');
        allNavItems.forEach(item => item.classList.remove('active'));

        // 현재 페이지에 해당하는 링크 찾기
        const currentPageLinks = sidebar.querySelectorAll(`a[href*="${this.currentPage}.html"], a[href="${this.currentPage}"]`);
        
        currentPageLinks.forEach(link => {
            link.classList.add('active');
            
            // 부모 카테고리도 펼치기
            const parentCategory = link.closest('.nav-category');
            if (parentCategory) {
                const categoryButton = parentCategory.querySelector('.nav-category-button');
                const navItems = parentCategory.querySelector('.nav-items');
                
                if (categoryButton && navItems) {
                    categoryButton.classList.add('active');
                    navItems.classList.add('active');
                }
            }
        });
    }

    /**
     * 사이드바 이벤트 리스너 설정 (sidebar.js 통합 버전)
     */
    setupSidebarEvents() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar || this.eventsInitialized) {
            console.log('[SidebarLoader] 이벤트 이미 초기화됨 또는 사이드바 없음');
            return;
        }

        console.log('[SidebarLoader] 사이드바 이벤트 초기화 시작');
        
        const sidebarSlogan = sidebar.querySelector('.sidebar-slogan');
        const navCategories = sidebar.querySelectorAll('.nav-category');
        const navCategoryButtons = sidebar.querySelectorAll('.nav-category-button');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const sidebarNav = sidebar.querySelector('.sidebar-nav');

        // 스크롤 필요 여부 체크 함수
        const checkScrollNeeded = () => {
            if (sidebarNav) {
                const scrollHeight = sidebarNav.scrollHeight;
                const clientHeight = sidebarNav.clientHeight;

                if (scrollHeight > clientHeight + 1) {
                    sidebarNav.classList.add('has-overflow');
                } else {
                    sidebarNav.classList.remove('has-overflow');
                }
            }
        };

        // 초기 체크
        checkScrollNeeded();

        // 리사이즈 시 체크
        window.addEventListener('resize', checkScrollNeeded);

        // 모바일 메뉴 토글
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }

        // 카테고리 토글 이벤트
        navCategoryButtons.forEach((button, index) => {
            // 중복 이벤트 리스너 방지
            if (button.dataset.listenerAdded) {
                console.log(`[SidebarLoader] 버튼 ${index}번에 이미 이벤트 리스너가 있음, 건너뜀`);
                return;
            }
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('[SidebarLoader] 카테고리 버튼 클릭됨:', button.querySelector('span').textContent);
                
                const category = button.closest('.nav-category');
                const wasActive = category.classList.contains('active');

                // 모든 카테고리 닫기
                navCategories.forEach((cat) => {
                    cat.classList.remove('active');

                    // 해당 섹션의 active 상태도 제거
                    const section = cat.closest('.nav-section');
                    if (section) {
                        section.classList.remove('has-active-category');
                        
                        // 다음 섹션의 active 상태 제거
                        const nextSection = section.nextElementSibling;
                        if (nextSection && nextSection.classList.contains('nav-section')) {
                            section.classList.remove('next-active');
                        }
                    }
                });

                // 클릭한 카테고리 토글
                if (!wasActive) {
                    category.classList.add('active');

                    // 해당 섹션에도 active 상태 클래스 추가
                    const section = category.closest('.nav-section');
                    if (section) {
                        section.classList.add('has-active-category');
                        
                        // 다음 섹션 확인
                        const nextSection = section.nextElementSibling;
                        if (nextSection && nextSection.classList.contains('nav-section')) {
                            section.classList.add('next-active');
                        }
                    }

                    // 슬로건 스타일 변경
                    if (sidebarSlogan) {
                        sidebarSlogan.classList.add('menu-open');
                    }
                } else {
                    category.classList.remove('active');
                    
                    // 해당 섹션의 active 상태도 제거
                    const section = category.closest('.nav-section');
                    if (section) {
                        section.classList.remove('has-active-category');
                    }
                    
                    // 모든 카테고리가 닫혔는지 확인
                    const anyActive = sidebar.querySelector('.nav-category.active');
                    if (!anyActive && sidebarSlogan) {
                        sidebarSlogan.classList.remove('menu-open');
                    }
                }

                // 상태 저장
                this.saveSidebarState();

                // 카테고리 토글 후 스크롤 체크
                setTimeout(checkScrollNeeded, 300);
            });
            
            // 이벤트 리스너 추가 완료 표시
            button.dataset.listenerAdded = 'true';
            console.log(`[SidebarLoader] 버튼 ${index}번에 이벤트 리스너 추가 완료`);
        });

        // 현재 페이지에 해당하는 메뉴 활성화
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach((item) => {
            const href = item.getAttribute('href');
            const currentPage = this.currentPage + '.html';
            
            if (href === currentPage || (this.currentPage === 'index' && href === '/')) {
                item.classList.add('active');

                // 부모 카테고리도 열기
                const parentCategory = item.closest('.nav-category');
                if (parentCategory) {
                    parentCategory.classList.add('active');

                    // 해당 섹션에도 active 상태 클래스 추가
                    const section = parentCategory.closest('.nav-section');
                    if (section) {
                        section.classList.add('has-active-category');
                        
                        // 다음 섹션 확인
                        const nextSection = section.nextElementSibling;
                        if (nextSection && nextSection.classList.contains('nav-section')) {
                            section.classList.add('next-active');
                        }
                    }

                    // 슬로건 스타일도 변경
                    if (sidebarSlogan) {
                        sidebarSlogan.classList.add('menu-open');
                    }
                }
            }
            
            // nav-item 클릭 시 이벤트 전파 중단하여 링크가 정상 작동하도록 함
            item.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // 사이드바 네비게이션 스크롤 인디케이터
        if (sidebarNav) {
            sidebarNav.addEventListener('scroll', () => {
                const scrollTop = sidebarNav.scrollTop;
                const scrollHeight = sidebarNav.scrollHeight;
                const clientHeight = sidebarNav.clientHeight;

                // 상단 인디케이터
                if (scrollTop > 10) {
                    sidebarNav.style.setProperty('--scroll-indicator-top-opacity', '1');
                } else {
                    sidebarNav.style.setProperty('--scroll-indicator-top-opacity', '0');
                }

                // 하단 인디케이터
                if (scrollTop + clientHeight < scrollHeight - 10) {
                    sidebarNav.style.setProperty('--scroll-indicator-bottom-opacity', '1');
                } else {
                    sidebarNav.style.setProperty('--scroll-indicator-bottom-opacity', '0');
                }
            });
        }

        // 저장된 상태 복원
        this.restoreSidebarState();

        // 페이지 로드 완료 후 최종 체크
        window.addEventListener('load', checkScrollNeeded);

        // 이벤트 초기화 완료 표시
        this.eventsInitialized = true;
        console.log('[SidebarLoader] 사이드바 이벤트 초기화 완료');
    }

    /**
     * 사이드바 로드 실패 시 폴백 사이드바 생성
     * @param {string} containerId 
     */
    createFallbackSidebar(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <a href="index.html" class="logo-container">
                        <span class="logo-text">WAVE space</span>
                        <span class="beta-badge">BETA</span>
                    </a>
                </div>

                <div class="sidebar-slogan">
                    <p>대한민국 No.1 분양실무자 대표 커뮤니티</p>
                </div>

                <nav class="sidebar-nav">
                    <div class="nav-section">
                        <div class="nav-item">
                            <a href="index.html" class="nav-item">
                                <i class="fas fa-home"></i>
                                <span>홈으로 돌아가기</span>
                            </a>
                        </div>
                    </div>
                </nav>
            </aside>
        `;

        console.warn('[SidebarLoader] 폴백 사이드바 생성됨');
    }

    /**
     * 사이드바 상태 저장 (sidebar.js에서 통합)
     */
    saveSidebarState() {
        const activeCategories = [];
        document.querySelectorAll('.nav-category.active').forEach((category) => {
            const button = category.querySelector('.nav-category-button');
            if (button) {
                const text = button.querySelector('span').textContent;
                activeCategories.push(text);
            }
        });

        localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY, JSON.stringify(activeCategories));
    }

    /**
     * 사이드바 상태 복원 (sidebar.js에서 통합)
     */
    restoreSidebarState() {
        try {
            const savedCategories = JSON.parse(
                localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY) || '[]'
            );

            // 먼저 모든 상태 초기화
            document.querySelectorAll('.nav-section').forEach((section) => {
                section.classList.remove('next-active', 'has-active-category');
            });

            // 저장된 카테고리 복원
            savedCategories.forEach((categoryText) => {
                document.querySelectorAll('.nav-category-button').forEach((button) => {
                    const text = button.querySelector('span').textContent;
                    if (text === categoryText) {
                        const category = button.closest('.nav-category');
                        if (category) {
                            category.classList.add('active');
                            
                            // 해당 섹션에도 active 상태 클래스 추가
                            const section = category.closest('.nav-section');
                            if (section) {
                                section.classList.add('has-active-category');
                            }

                            // 슬로건 스타일 변경
                            const sidebarSlogan = document.querySelector('.sidebar-slogan');
                            if (sidebarSlogan) {
                                sidebarSlogan.classList.add('menu-open');
                            }
                        }
                    }
                });
            });

            // 활성 카테고리가 있는 섹션의 next-active 설정
            document.querySelectorAll('.nav-category.active').forEach((activeCategory) => {
                const section = activeCategory.closest('.nav-section');
                if (section) {
                    const nextSection = section.nextElementSibling;
                    if (nextSection && nextSection.classList.contains('nav-section')) {
                        section.classList.add('next-active');
                    }
                }
            });
            
        } catch (error) {
            console.error('[SidebarLoader] Failed to restore sidebar state:', error);
        }
    }

    /**
     * 특정 페이지에서 사이드바 자동 로드
     * DOM이 준비된 후 자동으로 실행
     */
    static async autoLoad() {
        const loader = new SidebarLoader();
        
        // DOM 준비 대기
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // 사이드바 컨테이너 존재 확인
        const container = document.getElementById('sidebar-container');
        if (container) {
            const currentPage = loader.detectCurrentPage();
            const success = await loader.loadSidebar('sidebar-container', currentPage);
            
            // 사이드바 로드 완료 이벤트 발생
            document.dispatchEvent(new CustomEvent('sidebarLoaded', {
                detail: { success, loader, currentPage }
            }));
        }
    }
}

// 전역 접근을 위한 내보내기
window.SidebarLoader = SidebarLoader;