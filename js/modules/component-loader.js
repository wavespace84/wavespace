// 컴포넌트 로더 모듈
export class ComponentLoader {
    constructor() {
        this.cache = new Map();
    }

    /**
     * HTML 컴포넌트를 로드하고 캐싱
     * @param {string} path - 컴포넌트 파일 경로
     * @returns {Promise<string>} HTML 문자열
     */
    async loadComponent(path) {
        // 캐시 확인
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${path}`);
            }
            
            const html = await response.text();
            this.cache.set(path, html);
            return html;
        } catch (error) {
            console.error(`Error loading component from ${path}:`, error);
            return '';
        }
    }

    /**
     * 사이드바 컴포넌트 로드 및 활성 상태 설정
     * @param {string} activePage - 현재 활성 페이지
     */
    async loadSidebar(activePage) {
        const sidebarHtml = await this.loadComponent('/components/sidebar.html');
        const sidebarContainer = document.querySelector('.sidebar-container');
        
        if (sidebarContainer && sidebarHtml) {
            sidebarContainer.innerHTML = sidebarHtml;
            this.setActiveMenuItem(activePage);
            this.initializeSidebarEvents();
        }
    }

    /**
     * 헤더 컴포넌트 로드
     */
    async loadHeader() {
        const headerHtml = await this.loadComponent('/components/header.html');
        const headerContainer = document.querySelector('.header-container');
        
        if (headerContainer && headerHtml) {
            headerContainer.innerHTML = headerHtml;
            this.initializeHeaderEvents();
        }
    }

    /**
     * 활성 메뉴 아이템 설정
     * @param {string} pageName - 페이지 이름
     */
    setActiveMenuItem(pageName) {
        // 모든 nav-item에서 active 클래스 제거
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // 현재 페이지에 해당하는 nav-item에 active 클래스 추가
        const currentPageLink = document.querySelector(`.nav-item[href="${pageName}"]`);
        if (currentPageLink) {
            currentPageLink.classList.add('active');
            
            // 부모 카테고리도 활성화
            const parentCategory = currentPageLink.closest('.nav-category');
            if (parentCategory) {
                parentCategory.classList.add('active');
            }
        }
    }

    /**
     * 사이드바 이벤트 초기화
     */
    initializeSidebarEvents() {
        // 카테고리 토글 버튼
        const categoryButtons = document.querySelectorAll('.nav-category-button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const category = this.closest('.nav-category');
                const isActive = category.classList.contains('active');
                
                // 다른 카테고리 닫기 (선택적)
                // categoryButtons.forEach(btn => {
                //     btn.closest('.nav-category').classList.remove('active');
                // });
                
                // 현재 카테고리 토글
                category.classList.toggle('active');
                
                // 상태 저장
                const categoryName = this.querySelector('span').textContent;
                this.saveCategoryState(categoryName, !isActive);
            });
        });

        // 로컬 스토리지에서 카테고리 상태 복원
        this.restoreCategoryStates();
    }

    /**
     * 헤더 이벤트 초기화
     */
    initializeHeaderEvents() {
        // 검색 버튼
        const searchBtn = document.querySelector('.header-icon-btn:first-child');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                console.log('Search clicked');
                // 검색 모달 열기
            });
        }

        // 알림 버튼
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                console.log('Notifications clicked');
                // 알림 패널 열기
            });
        }

        // 사용자 프로필
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                console.log('User profile clicked');
                // 사용자 메뉴 드롭다운 토글
            });
        }
    }

    /**
     * 카테고리 상태 저장
     */
    saveCategoryState(categoryName, isOpen) {
        const states = JSON.parse(localStorage.getItem('categoryStates') || '{}');
        states[categoryName] = isOpen;
        localStorage.setItem('categoryStates', JSON.stringify(states));
    }

    /**
     * 카테고리 상태 복원
     */
    restoreCategoryStates() {
        const states = JSON.parse(localStorage.getItem('categoryStates') || '{}');
        
        document.querySelectorAll('.nav-category-button').forEach(button => {
            const categoryName = button.querySelector('span').textContent;
            const category = button.closest('.nav-category');
            
            if (states[categoryName]) {
                category.classList.add('active');
            }
        });
    }
}

// 싱글톤 인스턴스 생성
const componentLoader = new ComponentLoader();
export default componentLoader;