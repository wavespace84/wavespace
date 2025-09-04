// main.js - 통합 ES6 모듈 시스템 메인 엔트리 포인트
// Ultra-Think Phase 2: 모든 서브에이전트 설계 통합

// 전역 데이터 시스템 (반드시 첫 번째로 로드)
// WaveSpaceData는 script 태그로 별도 로드되므로 전역 객체로 접근

// 기존 모듈들
import { initSidebar } from './modules/sidebar.js';
import { initHeader } from './modules/header.js';
import { initPreload } from './modules/preload.js';
import { initClock } from './modules/clock.js';
import { HeaderLoader } from './modules/header-loader.js';
import { SidebarLoader } from './modules/sidebar-loader.js';

// 새로운 코어 시스템
import { eventSystem } from './core/eventSystem.js';
import { stateManager } from './core/stateManager.js';

// 접근성 시스템
import { accessibilityManager } from './components/accessibility.js';

// 페이지 최적화 시스템
import { initOptimizer } from './modules/page-optimizer.js';

// 로그인 사이드패널 시스템
import { initLoginSidepanel } from './modules/login-sidepanel.js';

// 🚀 통합 초기화 시스템
async function initializeWaveSpace() {
    try {
        console.log('[WaveSpace] 초기화 시작...');

        // 0. WaveSpaceData 초기화 (이벤트 기반으로 개선)
        const currentPage = document.body.dataset.page;
        
        // WaveSpaceData가 없으면 즉시 폴백 객체 생성
        if (!window.WaveSpaceData) {
            console.log('[WaveSpace] WaveSpaceData 폴백 객체 생성');
            window.WaveSpaceData = {
                errorHandler: {
                    log: (level, message, details) => console.log(`[${level}] ${message}`, details),
                    showUserError: (message) => {
                        if (typeof window !== 'undefined' && window.console) {
                            console.error('사용자 에러:', message);
                        }
                        // 개발 환경에서만 alert 표시
                        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                            alert(message);
                        }
                    }
                },
                security: {
                    sanitizeInput: (input) => {
                        if (typeof input !== 'string') return input;
                        return input
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#x27;')
                            .replace(/\//g, '&#x2F;');
                    }
                },
                isReady: true
            };
        }

        // 0. 페이지 최적화 시스템 최우선 초기화 (깜빡임 방지)
        initOptimizer();
        console.log('[WaveSpace] 페이지 최적화 시스템 초기화 완료');

        // 1. 접근성 시스템 우선 초기화 (WCAG 준수)
        accessibilityManager.init();

        // 2. 기존 모듈들 초기화
        console.log('[WaveSpace] 모듈 초기화 시작');
        initPreload();
        console.log('[WaveSpace] Preload 초기화 완료');
        
        // 동적 사이드바 로드 시스템 체크
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            // 새로운 동적 사이드바 로드 시스템 사용
            const sidebarLoader = new SidebarLoader();
            const sidebarSuccess = await sidebarLoader.loadSidebar();
            
            if (sidebarSuccess) {
                console.log('[WaveSpace] 동적 사이드바 로드 완료');
                // SidebarLoader가 이미 모든 기능을 처리하므로 initSidebar 불필요
            } else {
                // 동적 로드 실패 시에만 정적 시스템 폴백
                initSidebar();
                console.log('[WaveSpace] 동적 사이드바 로드 실패, 정적 사이드바로 폴백');
            }
        } else {
            // sidebar-container가 없는 경우에만 정적 사이드바 시스템 사용
            initSidebar();
            console.log('[WaveSpace] 정적 사이드바 초기화 완료');
        }
        
        // 동적 헤더 로드 시스템 
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            // 새로운 동적 헤더 로드 시스템 사용
            const headerLoader = new HeaderLoader();
            const headerSuccess = await headerLoader.loadHeader();
            
            if (headerSuccess) {
                console.log('[WaveSpace] 동적 헤더 로드 완료');
            } else {
                // 동적 로드 실패 시에만 정적 시스템 폴백
                initHeader();
                console.log('[WaveSpace] 동적 헤더 로드 실패, 정적 헤더로 폴백');
            }
        } else {
            // header-container가 없는 경우에만 정적 헤더 시스템 사용
            initHeader();
            console.log('[WaveSpace] 정적 헤더 초기화 완료');
        }
        
        // AuthService 초기화
        if (window.authService) {
            console.log('[WaveSpace] AuthService 초기화 시작');
            try {
                await window.authService.checkAuthState();
                console.log('[WaveSpace] AuthService 초기화 완료');
            } catch (error) {
                console.error('[WaveSpace] AuthService 초기화 실패:', error);
                console.log('[WaveSpace] 폴백 UI 적용');
                // AuthService 초기화 실패 시에도 기본 UI 확보
                ensureBasicAuthUI();
            }
        } else {
            console.warn('[WaveSpace] AuthService가 아직 로드되지 않음, 폴백 UI 적용');
            ensureBasicAuthUI();
        }
        
        initClock();
        console.log('[WaveSpace] Clock 초기화 완료');

        // 3. 로그인 사이드패널 로드 (모든 페이지에서 필요)
        await initLoginSidepanel();
        console.log('[WaveSpace] 로그인 사이드패널 초기화 완료');

        // 4. 페이지별 모듈 동적 로드
        if (currentPage) {
            await loadPageModule(currentPage);
        }

        // 5. 전역 이벤트 설정
        setupGlobalEvents();

        // 5. 성능 모니터링 시작
        startPerformanceMonitoring();

        console.log('[WaveSpace] 초기화 완료 ✅');

        // 초기화 완료 알림 (접근성)
        accessibilityManager.announceToScreenReader('WAVE SPACE 플랫폼이 준비되었습니다.');
    } catch (error) {
        console.error('[WaveSpace] 초기화 중 오류:', error);
        window.WaveSpaceData?.errorHandler?.log('error', 'WaveSpace 초기화 실패', {
            error: error.message,
            stack: error.stack,
        });
    }
}

// 📋 페이지별 모듈 로드
async function loadPageModule(pageName) {
    try {
        // support 페이지의 경우 FAQ가 이미 렌더링되었음을 고려
        if (pageName === 'support') {
            console.log('[PageModule] Support 페이지: FAQ 이미 렌더링됨, 추가 기능만 초기화');
        }
        
        // 페이지 모듈 매핑
        const pageModules = {
            'market-research': () => import('./pages/marketResearch.js'),
            'sales-recruit': () => import('./pages/salesRecruit.js'),
            'planning-recruitment': () => import('./pages/planningRecruitment.js'),
            forum: () => import('./pages/forum.js'),
            notice: () => import('./pages/notice.js'),
            support: () => import('./pages/support.js'),
        };

        const moduleLoader = pageModules[pageName];
        if (moduleLoader) {
            const module = await moduleLoader();
            if (module.init) {
                await module.init();
            }
            console.log(`[PageModule] ${pageName} 모듈 로드 완료`);
        }
    } catch (error) {
        console.warn(`[PageModule] ${pageName} 모듈 로드 실패:`, error);
        
        // support 페이지에서 모듈 로드 실패 시에도 FAQ는 동작함을 로그
        if (pageName === 'support') {
            console.log('[PageModule] Support 페이지: 모듈 로드 실패했지만 FAQ는 이미 동작 중');
        }
    }
}

// 🌐 전역 이벤트 설정
function setupGlobalEvents() {
    // 에러 처리
    window.addEventListener('error', (e) => {
        window.WaveSpaceData?.errorHandler?.log('error', 'JavaScript 런타임 에러', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
        });
    });

    // 성능 저하 감지
    window.addEventListener('beforeunload', () => {
        eventSystem.cleanup();
        accessibilityManager.cleanup();
    });

    // 키보드 단축키 (접근성)
    eventSystem.on(document, 'keydown', (e) => {
        // Alt + M: 메인 메뉴로 이동
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            const mainMenu = document.querySelector('.sidebar nav, #navigation');
            if (mainMenu) {
                const firstLink = mainMenu.querySelector('a, button');
                if (firstLink) firstLink.focus();
            }
        }

        // Alt + S: 검색으로 이동
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            const searchInput = document.querySelector('#search, input[type="search"]');
            if (searchInput) searchInput.focus();
        }
    });
}

// 🔐 기본 인증 UI 확보 함수
function ensureBasicAuthUI() {
    const userInfoElement = document.querySelector('#userInfoContainer');
    if (userInfoElement && !userInfoElement.querySelector('.auth-buttons')) {
        // 로그인/회원가입 버튼 제거됨
        userInfoElement.innerHTML = '';
        
        // 알림 버튼 숨기기
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.style.display = 'none';
        }
        
        console.log('[WaveSpace] 기본 인증 UI 확보 완료');
    }
}

// 📊 성능 모니터링
function startPerformanceMonitoring() {
    // Core Web Vitals 측정
    if ('web-vital' in window) {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('[Performance] LCP:', lastEntry.startTime.toFixed(2), 'ms');
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay) - 사용자 첫 상호작용 측정
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
                console.log('[Performance] FID:', entry.processingStart - entry.startTime, 'ms');
            });
        }).observe({ entryTypes: ['first-input'] });
    }

    // 메모리 사용량 모니터링 (개발 환경)
    if (performance.memory) {
        setInterval(() => {
            const memory = performance.memory;
            const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
            if (usedMB > 50) {
                // 50MB 이상 시 경고
                console.warn(`[Performance] 메모리 사용량 높음: ${usedMB}MB`);
            }
        }, 30000); // 30초마다 체크
    }
}

// DOM 준비 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaveSpace);
} else {
    initializeWaveSpace();
}
