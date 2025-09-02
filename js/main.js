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

// 새로운 코어 시스템
import { eventSystem } from './core/eventSystem.js';
import { stateManager } from './core/stateManager.js';

// 접근성 시스템
import { accessibilityManager } from './components/accessibility.js';

// 🚀 통합 초기화 시스템
async function initializeWaveSpace() {
    try {
        console.log('[WaveSpace] 초기화 시작...');

        // 0. WaveSpaceData가 초기화될 때까지 대기
        let attempts = 0;
        while (!window.WaveSpaceData && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.WaveSpaceData) {
            console.warn('[WaveSpace] WaveSpaceData 로드 실패, 폴백 객체 생성');
            window.WaveSpaceData = {
                errorHandler: {
                    log: (level, message, details) => console.log(`[${level}] ${message}`, details),
                    showUserError: (message) => alert(message)
                },
                security: {
                    sanitizeInput: (input) => input
                }
            };
        }

        // 1. 접근성 시스템 우선 초기화 (WCAG 준수)
        accessibilityManager.init();

        // 2. 기존 모듈들 초기화
        console.log('[WaveSpace] 모듈 초기화 시작');
        initPreload();
        console.log('[WaveSpace] Preload 초기화 완료');
        
        // 사이드바 초기화 전 상태 확인
        console.log('[WaveSpace] 사이드바 초기화 전 _sidebarInitialized:', window._sidebarInitialized);
        console.log('[WaveSpace] 사이드바 요소 존재 여부:', {
            sidebar: !!document.querySelector('.sidebar'),
            navButtons: document.querySelectorAll('.nav-category-button').length,
            mobileMenuBtn: !!document.querySelector('.mobile-menu-btn')
        });
        
        initSidebar();
        console.log('[WaveSpace] Sidebar 초기화 완료');
        
        // 사이드바 초기화 후 이벤트 리스너 확인
        const navButtons = document.querySelectorAll('.nav-category-button');
        console.log('[WaveSpace] 사이드바 버튼 이벤트 리스너 확인:', {
            buttonCount: navButtons.length,
            buttonsWithListeners: document.querySelectorAll('.nav-category-button[data-listener-added="true"]').length
        });
        
        // 동적 헤더 로드 시스템 체크
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            // 새로운 동적 헤더 로드 시스템 사용
            const headerLoader = new HeaderLoader();
            await headerLoader.loadHeader();
            console.log('[WaveSpace] 동적 헤더 로드 완료');
            
            // 동적 헤더 로드 후 initHeader 호출 (이벤트 리스너 설정)
            initHeader();
            console.log('[WaveSpace] 동적 헤더 이벤트 초기화 완료');
        } else {
            // 기존 정적 헤더 시스템 사용
            initHeader();
            console.log('[WaveSpace] 정적 헤더 초기화 완료');
        }
        
        initClock();
        console.log('[WaveSpace] Clock 초기화 완료');

        // 3. 페이지별 모듈 동적 로드
        const currentPage = document.body.dataset.page;
        if (currentPage) {
            await loadPageModule(currentPage);
        }

        // 4. 전역 이벤트 설정
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
        // 페이지 모듈 매핑
        const pageModules = {
            'market-research': () => import('./pages/marketResearch.js'),
            'sales-recruit': () => import('./pages/salesRecruit.js'),
            'planning-recruitment': () => import('./pages/planningRecruitment.js'),
            forum: () => import('./pages/forum.js'),
            notice: () => import('./pages/notice.js'),
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
