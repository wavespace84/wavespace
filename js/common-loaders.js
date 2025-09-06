// common-loaders.js - 공통 컴포넌트 자동 로드 시스템
// 모든 페이지에서 일관된 헤더/사이드바/로그인패널을 자동으로 로드

(function() {
    'use strict';
    
    // 로드 상태 추적
    const loadState = {
        sidebar: false,
        header: false,
        loginPanel: false
    };
    
    // 현재 페이지 감지
    function getCurrentPage() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop() || 'index.html';
        return fileName.replace('.html', '');
    }
    
    // 헤더가 필요한 페이지 확인
    function needsHeader() {
        const currentPage = getCurrentPage();
        const headerPages = ['index', 'login', 'signup'];
        return headerPages.includes(currentPage);
    }
    
    // 로그인 패널이 필요한 페이지 확인
    function needsLoginPanel() {
        const currentPage = getCurrentPage();
        const loginPanelPages = ['index', 'signup'];
        return loginPanelPages.includes(currentPage);
    }
    
    // 사이드바 로드
    async function loadSidebar() {
        try {
            const container = document.getElementById('sidebar-container');
            if (!container || loadState.sidebar) return;
            
            if (window.SidebarLoader) {
                console.log('[CommonLoaders] 사이드바 로드 시작');
                const loader = new window.SidebarLoader();
                const success = await loader.loadSidebar('sidebar-container', getCurrentPage());
                loadState.sidebar = success;
                console.log('[CommonLoaders] 사이드바 로드:', success ? '성공' : '실패');
                
                // 사이드바 로드 완료 이벤트 발생
                document.dispatchEvent(new CustomEvent('sidebarLoaded', {
                    detail: { success, loader, currentPage: getCurrentPage() }
                }));
            } else {
                console.error('[CommonLoaders] SidebarLoader를 찾을 수 없음');
            }
        } catch (error) {
            console.error('[CommonLoaders] 사이드바 로드 오류:', error);
        }
    }
    
    // 헤더 로드
    async function loadHeader() {
        try {
            const container = document.getElementById('header-container');
            if (!container || loadState.header || !needsHeader()) return;
            
            if (window.HeaderLoader) {
                console.log('[CommonLoaders] 헤더 로드 시작');
                const loader = new window.HeaderLoader();
                const success = await loader.loadHeader('header-container');
                loadState.header = success;
                console.log('[CommonLoaders] 헤더 로드:', success ? '성공' : '실패');
                
                // 헤더 로드 완료 이벤트 발생
                document.dispatchEvent(new CustomEvent('headerLoaded', {
                    detail: { success, loader }
                }));
            } else {
                console.error('[CommonLoaders] HeaderLoader를 찾을 수 없음');
            }
        } catch (error) {
            console.error('[CommonLoaders] 헤더 로드 오류:', error);
        }
    }
    
    // 로그인 사이드패널 로드
    async function loadLoginSidepanel() {
        try {
            if (loadState.loginPanel || !needsLoginPanel()) return;
            
            // LoginSidepanelLoader 동적 로드
            if (!window.loginSidepanelLoader) {
                const script = document.createElement('script');
                script.src = 'js/modules/LoginSidepanelLoader.js';
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            
            if (window.LoginSidepanelLoader) {
                console.log('[CommonLoaders] 로그인 사이드패널 로드 시작');
                window.loginSidepanelLoader = new window.LoginSidepanelLoader();
                const success = await window.loginSidepanelLoader.loadLoginSidepanel();
                loadState.loginPanel = success;
                console.log('[CommonLoaders] 로그인 사이드패널 로드:', success ? '성공' : '실패');
            }
        } catch (error) {
            console.error('[CommonLoaders] 로그인 사이드패널 로드 오류:', error);
        }
    }
    
    // 모든 컴포넌트 로드
    async function loadAllComponents() {
        console.log('[CommonLoaders] === 공통 컴포넌트 로드 시작 ===');
        console.log('[CommonLoaders] 현재 페이지:', getCurrentPage());
        
        // 병렬 로드로 성능 최적화
        await Promise.all([
            loadSidebar(),
            loadHeader(),
            loadLoginSidepanel()
        ]);
        
        console.log('[CommonLoaders] === 공통 컴포넌트 로드 완료 ===');
        
        // 모든 컴포넌트 로드 완료 이벤트
        document.dispatchEvent(new CustomEvent('allComponentsLoaded', {
            detail: {
                sidebar: loadState.sidebar,
                header: loadState.header,
                loginPanel: loadState.loginPanel,
                currentPage: getCurrentPage()
            }
        }));
    }
    
    // DOM 준비되면 자동 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllComponents);
    } else {
        // 이미 DOM이 로드된 경우 즉시 실행
        loadAllComponents();
    }
    
    // 전역에서 수동으로 다시 로드할 수 있도록 함수 노출
    window.reloadCommonComponents = loadAllComponents;
    
    
})();