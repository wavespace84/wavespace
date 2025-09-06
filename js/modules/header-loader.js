// header-loader.js - 헤더 동적 로드 시스템
// 모든 페이지에서 일관된 헤더 구조를 보장

class HeaderLoader {
    constructor() {
        this.isLoaded = false;
        this.headerContent = null;
    }

    /**
     * 헤더 템플릿을 로드하고 삽입
     * @param {string} containerId - 헤더를 삽입할 컨테이너 ID (기본: header-container)
     * @returns {Promise<boolean>} 로드 성공 여부
     */
    async loadHeader(containerId = 'header-container') {
        try {
            // 이미 로드된 경우 재사용
            if (this.isLoaded && this.headerContent) {
                const headerSuccess = this.insertHeader(containerId);
                // LoginSidepanelLoader가 이제 담당하므로 중복 로드 제거
                // await this.loadLoginSidepanel();
                return headerSuccess;
            }

            // 헤더 템플릿 파일 로드
            const response = await fetch('components/header.html');
            if (!response.ok) {
                throw new Error(`헤더 템플릿 로드 실패: ${response.status}`);
            }

            this.headerContent = await response.text();
            console.log('[HeaderLoader] 로드된 헤더 내용:', this.headerContent.substring(0, 200) + '...');
            this.isLoaded = true;

            const headerSuccess = await this.insertHeader(containerId);
            
            // LoginSidepanelLoader가 이제 담당하므로 중복 로드 제거
            // await this.loadLoginSidepanel();
            
            return headerSuccess;

        } catch (error) {
            console.error('[HeaderLoader] 헤더 로드 실패:', error);
            
            // 폴백: 기본 헤더 구조 생성
            this.createFallbackHeader(containerId);
            return false;
        }
    }

    /**
     * 로드된 헤더 콘텐츠를 컨테이너에 삽입
     * @param {string} containerId 
     * @returns {Promise<boolean>}
     */
    async insertHeader(containerId) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`[HeaderLoader] 헤더 컨테이너를 찾을 수 없음: #${containerId}`);
            return false;
        }

        container.innerHTML = this.headerContent;
        console.log('[HeaderLoader] 헤더 삽입 성공');
        console.log('[HeaderLoader] 삽입된 HTML:', container.innerHTML.substring(0, 200) + '...');
        
        // 헤더 삽입 후 이벤트 리스너 설정
        this.setupHeaderEventListeners();
        
        // ComponentLoader 자동 초기화 (프로필 기능을 위해)
        await this.ensureComponentLoader();
        
        // 프로필 사이드패널 CSS 로드
        this.loadProfileCSS();
        
        return true;
    }

    /**
     * 헤더 버튼들에 이벤트 리스너 설정
     */
    setupHeaderEventListeners() {
        try {
            // 로그인 버튼 이벤트 리스너
            const loginBtn = document.querySelector('button[data-action="login"]');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    console.log('[HeaderLoader] 로그인 버튼 클릭');
                    this.handleLoginClick();
                });
            }

            // 회원가입 버튼 이벤트 리스너  
            const signupBtn = document.querySelector('button[data-action="signup"]');
            if (signupBtn) {
                signupBtn.addEventListener('click', () => {
                    console.log('[HeaderLoader] 회원가입 버튼 클릭');
                    this.handleSignupClick();
                });
            }
            
            console.log('[HeaderLoader] 헤더 이벤트 리스너 설정 완료');
        } catch (error) {
            console.error('[HeaderLoader] 이벤트 리스너 설정 실패:', error);
        }
    }

    /**
     * 로그인 버튼 클릭 핸들러 (LoginSidepanelLoader 호환)
     */
    handleLoginClick() {
        try {
            // 새로운 LoginSidepanelLoader를 우선적으로 사용
            if (window.loginSidepanelLoader && typeof window.loginSidepanelLoader.showLoginSidepanel === 'function') {
                window.loginSidepanelLoader.showLoginSidepanel();
            } else if (window.authService && typeof window.authService.openLoginSidepanel === 'function') {
                // 폴백: 기존 authService 방식
                window.authService.openLoginSidepanel();
            } else {
                console.warn('[HeaderLoader] 로그인 사이드패널을 사용할 수 없어서 폴백 처리');
                // 최종 폴백: 로그인 페이지로 이동
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('[HeaderLoader] 로그인 처리 중 오류:', error);
            // 최종 폴백
            window.location.href = 'login.html';
        }
    }

    /**
     * 회원가입 버튼 클릭 핸들러
     */
    handleSignupClick() {
        try {
            // 회원가입은 항상 별도 페이지로 이동
            window.location.href = 'signup.html';
        } catch (error) {
            console.error('[HeaderLoader] 회원가입 페이지 이동 실패:', error);
        }
    }

    /**
     * 프로필 사이드패널 CSS 동적 로드
     */
    loadProfileCSS() {
        // 이미 로드되었는지 확인
        if (document.querySelector('link[href*="profile-style"]')) {
            console.log('[HeaderLoader] 프로필 CSS 이미 로드됨');
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/profile-style.css';
        link.onload = () => {
            console.log('[HeaderLoader] 프로필 CSS 로드 완료');
        };
        link.onerror = () => {
            console.error('[HeaderLoader] 프로필 CSS 로드 실패');
        };
        
        document.head.appendChild(link);
    }

    /**
     * 헤더 로드 실패 시 폴백 헤더 생성
     * @param {string} containerId 
     */
    createFallbackHeader(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <header class="main-header">
                <div class="header-left">
                    <button class="mobile-menu-btn">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>

                <div class="header-right">
                    <!-- 사용자 프로필 / 인증 버튼 -->
                    <div class="user-info" id="userInfoContainer">
                        <!-- 로그인/회원가입 버튼 제거됨 -->
                    </div>
                </div>
            </header>
        `;

        console.warn('[HeaderLoader] 폴백 헤더 생성됨 (로그인/회원가입 버튼 제거됨)');
    }

    /**
     * 로그인 사이드패널 로드
     */
    async loadLoginSidepanel() {
        try {
            // 이미 존재하는지 확인
            if (document.getElementById('loginSidepanel')) {
                console.log('[HeaderLoader] 로그인 사이드패널이 이미 존재함');
                return true;
            }

            // 로그인 사이드패널 템플릿 로드
            const response = await fetch('components/login-sidepanel.html');
            if (!response.ok) {
                throw new Error(`로그인 사이드패널 템플릿 로드 실패: ${response.status}`);
            }

            const sidepanelContent = await response.text();
            
            // body에 사이드패널 추가
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sidepanelContent;
            document.body.appendChild(tempDiv.firstElementChild);
            
            console.log('[HeaderLoader] 로그인 사이드패널 로드 성공');
            return true;

        } catch (error) {
            console.error('[HeaderLoader] 로그인 사이드패널 로드 실패:', error);
            return false;
        }
    }

    /**
     * ComponentLoader 자동 초기화 보장
     */
    async ensureComponentLoader() {
        try {
            // ComponentLoader가 이미 준비된 경우 건너뛰기
            if (window.componentLoaderReady && window.componentLoader) {
                console.log('[HeaderLoader] ComponentLoader 이미 준비됨');
                return;
            }

            // ComponentLoader 클래스가 있는지 확인
            if (window.ComponentLoader) {
                console.log('[HeaderLoader] ComponentLoader 클래스 발견, 인스턴스 생성');
                window.componentLoader = new window.ComponentLoader();
                
                // 프로필 모달 템플릿 미리 로드
                await window.componentLoader.loadProfileModal();
                
                window.componentLoaderReady = true;
                document.dispatchEvent(new CustomEvent('componentLoaderReady'));
                console.log('[HeaderLoader] ComponentLoader 초기화 완료');
            } else {
                // ComponentLoader 스크립트 동적 로드 시도
                console.log('[HeaderLoader] ComponentLoader 동적 로드 시도');
                await this.loadComponentLoaderScript();
            }
        } catch (error) {
            console.error('[HeaderLoader] ComponentLoader 초기화 실패:', error);
        }
    }

    /**
     * ComponentLoader 스크립트 동적 로드
     */
    async loadComponentLoaderScript() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="ComponentLoader"]')) {
                resolve(); // 이미 로드됨
                return;
            }

            const script = document.createElement('script');
            script.src = 'js/components/ComponentLoader.js';
            script.onload = async () => {
                console.log('[HeaderLoader] ComponentLoader.js 동적 로드 완료');
                
                // 인스턴스 생성 및 초기화
                if (window.ComponentLoader) {
                    window.componentLoader = new window.ComponentLoader();
                    await window.componentLoader.loadProfileModal();
                    window.componentLoaderReady = true;
                    document.dispatchEvent(new CustomEvent('componentLoaderReady'));
                    console.log('[HeaderLoader] 동적 로드 후 ComponentLoader 초기화 완료');
                }
                
                resolve();
            };
            script.onerror = () => {
                console.error('[HeaderLoader] ComponentLoader.js 동적 로드 실패');
                reject(new Error('ComponentLoader.js 로드 실패'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * 특정 페이지에서 헤더 자동 로드
     * DOM이 준비된 후 자동으로 실행
     */
    static async autoLoad() {
        const loader = new HeaderLoader();
        
        // DOM 준비 대기
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // 헤더 컨테이너 존재 확인
        const container = document.getElementById('header-container');
        if (container) {
            const success = await loader.loadHeader();
            
            // 헤더 로드 완료 이벤트 발생
            document.dispatchEvent(new CustomEvent('headerLoaded', {
                detail: { success, loader }
            }));
            
            // 헤더 기능 초기화
            if (success) {
                loader.initHeaderFeatures();
            }
        }
    }
    
    /**
     * 헤더 기능 초기화 (기존 header.js의 기능 통합)
     */
    initHeaderFeatures() {
        const header = document.querySelector('.main-header');
        const searchBtn = document.querySelector('.header-icon-btn:first-child');
        const notificationBtn = document.querySelector('.notification-btn');
        const userProfile = document.querySelector('.user-profile');

        // 검색 버튼 클릭
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                // TODO: 검색 모달 열기
                console.log('Search clicked');
            });
        }

        // 알림 버튼 클릭
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                // TODO: 알림 드롭다운 열기
                console.log('Notifications clicked');
            });
        }

        // 사용자 프로필 클릭
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                // TODO: 사용자 메뉴 드롭다운 열기
                console.log('User profile clicked');
            });
        }

        // 스크롤 시 헤더 스타일 변경
        this.initScrollBehavior(header);
    }
    
    /**
     * 스크롤 동작 초기화
     */
    initScrollBehavior(header) {
        if (!header) return;
        
        let lastScrollTop = 0;
        const mainContainer = document.querySelector('.main-container');

        if (mainContainer) {
            mainContainer.addEventListener('scroll', () => {
                const scrollTop = mainContainer.scrollTop;

                // 스크롤 다운/업 감지
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // 스크롤 다운 - 헤더 숨기기
                    header.style.transform = 'translateY(-100%)';
                } else {
                    // 스크롤 업 - 헤더 보이기
                    header.style.transform = 'translateY(0)';

                    // 스크롤이 상단에 있을 때
                    if (scrollTop < 10) {
                        header.style.backgroundColor = 'transparent';
                        header.style.boxShadow = 'none';
                    } else {
                        header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        header.style.backdropFilter = 'blur(10px)';
                        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                    }
                }

                lastScrollTop = scrollTop;
            });
        }
    }
}

// 전역 접근을 위한 내보내기
window.HeaderLoader = HeaderLoader;

// ES6 모듈 내보내기 제거 - window 객체로만 사용