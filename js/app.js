// 메인 애플리케이션 진입점
import { $, $$, on, storage, isMobile } from './modules/utils.js';
import componentLoader from './modules/component-loader.js';
import { Toast } from './modules/common-components.js';

class WaveSpaceApp {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.isMobile = isMobile();
        this.init();
    }
    
    async init() {
        // 프리로드 효과
        this.handlePreload();
        
        // DOM 준비 완료 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    handlePreload() {
        // 페이지 전환 시 깜빡임 방지
        document.documentElement.style.visibility = 'hidden';
        
        window.addEventListener('DOMContentLoaded', () => {
            document.documentElement.style.visibility = 'visible';
            document.documentElement.classList.add('loaded');
        });
    }
    
    async setup() {
        try {
            // 컴포넌트 로드
            await this.loadComponents();
            
            // 글로벌 이벤트 설정
            this.setupGlobalEvents();
            
            // 페이지별 초기화
            this.initPageSpecific();
            
            // 서비스 워커 등록 (PWA)
            this.registerServiceWorker();
            
            // 초기화 완료 알림
            console.log('WaveSpace App initialized');
            
        } catch (error) {
            console.error('App initialization failed:', error);
            Toast.error('앱 초기화 중 오류가 발생했습니다.');
        }
    }
    
    async loadComponents() {
        // 사이드바와 헤더는 동적 로드 대신 이미 HTML에 포함되어 있음
        // 필요시 컴포넌트 로더 사용
        
        // 사이드바 초기화
        this.initSidebar();
        
        // 헤더 초기화
        this.initHeader();
    }
    
    initSidebar() {
        // 현재 페이지 활성화
        const currentLink = $(`.nav-item[href="${this.currentPage}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
            const parentCategory = currentLink.closest('.nav-category');
            if (parentCategory) {
                parentCategory.classList.add('active');
            }
        }
        
        // 카테고리 토글
        const categoryButtons = $$('.nav-category-button');
        categoryButtons.forEach(button => {
            on(button, 'click', (e) => {
                e.stopPropagation();
                const category = button.closest('.nav-category');
                category.classList.toggle('active');
                
                // 상태 저장
                const categoryName = button.querySelector('span').textContent;
                this.saveCategoryState(categoryName, category.classList.contains('active'));
            });
        });
        
        // 저장된 상태 복원
        this.restoreCategoryStates();
        
        // 모바일 메뉴 토글
        const menuToggle = $('.menu-toggle');
        if (menuToggle) {
            on(menuToggle, 'click', () => {
                $('.sidebar').classList.toggle('mobile-open');
                document.body.classList.toggle('sidebar-open');
            });
        }
    }
    
    initHeader() {
        // 검색 버튼
        const searchBtn = $('.header-icon-btn');
        if (searchBtn) {
            on(searchBtn, 'click', () => {
                this.openSearchModal();
            });
        }
        
        // 알림 버튼
        const notificationBtn = $('.notification-btn');
        if (notificationBtn) {
            on(notificationBtn, 'click', () => {
                this.toggleNotifications();
            });
        }
        
        // 사용자 프로필
        const userProfile = $('.user-profile');
        if (userProfile) {
            on(userProfile, 'click', () => {
                this.toggleUserMenu();
            });
        }
    }
    
    setupGlobalEvents() {
        // 외부 클릭 감지
        on(document, 'click', (e) => {
            // 드롭다운 닫기
            if (!e.target.closest('.user-profile')) {
                $('.user-dropdown')?.classList.remove('active');
            }
            
            if (!e.target.closest('.notification-btn')) {
                $('.notification-panel')?.classList.remove('active');
            }
        });
        
        // 키보드 단축키
        on(document, 'keydown', (e) => {
            // Ctrl/Cmd + K: 검색
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchModal();
            }
            
            // ESC: 모달/패널 닫기
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // 윈도우 리사이즈
        let resizeTimer;
        on(window, 'resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // 스크롤 이벤트
        let lastScrollY = window.scrollY;
        on(window, 'scroll', () => {
            const currentScrollY = window.scrollY;
            
            // 헤더 숨김/표시
            const header = $('.main-header');
            if (header) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    header.classList.add('hidden');
                } else {
                    header.classList.remove('hidden');
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    initPageSpecific() {
        // 페이지별 모듈 동적 로드
        const pageModules = {
            'index.html': () => import('./pages/home.js'),
            'forum.html': () => import('./forum.js'),
            'qna.html': () => import('./pages/qna.js'),
            'events.html': () => import('../events.js'),
            'attendance.html': () => import('./attendance.js'),
            'hall-of-fame.html': () => import('./hall-of-fame.js'),
            'humor.html': () => import('./humor.js'),
            'plus-membership.html': () => import('./pages/plus-membership.js'),
            'notice.html': () => import('./pages/notice.js'),
            'updates.html': () => import('./pages/updates.js'),
            'support.html': () => import('./pages/support.js')
        };
        
        const loadPageModule = pageModules[this.currentPage];
        if (loadPageModule) {
            loadPageModule()
                .then(module => {
                    if (module.default && typeof module.default.init === 'function') {
                        module.default.init();
                    }
                })
                .catch(err => {
                    console.error(`Failed to load page module: ${this.currentPage}`, err);
                });
        }
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    }
    
    saveCategoryState(categoryName, isOpen) {
        const states = storage.get('categoryStates', {});
        states[categoryName] = isOpen;
        storage.set('categoryStates', states);
    }
    
    restoreCategoryStates() {
        const states = storage.get('categoryStates', {});
        
        Object.entries(states).forEach(([categoryName, isOpen]) => {
            const button = Array.from($$('.nav-category-button')).find(btn => 
                btn.querySelector('span').textContent === categoryName
            );
            
            if (button && isOpen) {
                button.closest('.nav-category').classList.add('active');
            }
        });
    }
    
    openSearchModal() {
        console.log('Opening search modal');
        // 검색 모달 구현
    }
    
    toggleNotifications() {
        console.log('Toggling notifications');
        // 알림 패널 토글
    }
    
    toggleUserMenu() {
        console.log('Toggling user menu');
        // 사용자 메뉴 토글
    }
    
    closeAllModals() {
        // 모든 모달과 패널 닫기
        $$('.modal.active').forEach(modal => modal.classList.remove('active'));
        $$('.dropdown.active').forEach(dropdown => dropdown.classList.remove('active'));
    }
    
    handleResize() {
        const newIsMobile = isMobile();
        if (newIsMobile !== this.isMobile) {
            this.isMobile = newIsMobile;
            // 모바일/데스크톱 전환 처리
            document.body.classList.toggle('mobile', this.isMobile);
        }
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }
}

// 앱 인스턴스 생성 및 전역 노출
window.WaveSpaceApp = new WaveSpaceApp();

export default WaveSpaceApp;