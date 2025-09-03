// 페이지 전환 시 깜빡임 방지를 위한 프리로드
// visibility hidden 제거 - 즉시 표시로 변경

// WaveSpaceData 전역 객체 직접 초기화 (CORS 문제 완전 해결)
(function initializeWaveSpaceData() {
    // 에러 핸들러 클래스
    class ErrorHandler {
        constructor() {
            this.errors = [];
        }

        log(level, message, details = {}) {
            const error = {
                level,
                message,
                details,
                timestamp: new Date().toISOString(),
                url: window.location.href
            };
            
            this.errors.push(error);
            
            // 콘솔에도 출력
            switch (level) {
                case 'error':
                    console.error(`[${level.toUpperCase()}] ${message}`, details);
                    break;
                case 'warn':
                    console.warn(`[${level.toUpperCase()}] ${message}`, details);
                    break;
                default:
                    console.log(`[${level.toUpperCase()}] ${message}`, details);
            }
            
            // 에러가 10개 이상 쌓이면 오래된 것 제거
            if (this.errors.length > 10) {
                this.errors.shift();
            }
        }
        
        showUserError(message) {
            if (window.WaveSpaceData?.toast?.show) {
                window.WaveSpaceData.toast.show(message, 'error');
            } else {
                alert(message);
            }
        }
        
        getErrors() {
            return [...this.errors];
        }
        
        clearErrors() {
            this.errors = [];
        }
    }

    // 보안 관리자 클래스
    class SecurityManager {
        constructor() {
            this.xssPatterns = [
                /<script[^>]*>.*?<\/script>/gi,
                /<iframe[^>]*>.*?<\/iframe>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi
            ];
        }
        
        sanitizeInput(input) {
            if (typeof input !== 'string') {
                return input;
            }
            
            let sanitized = input;
            
            // XSS 패턴 제거
            this.xssPatterns.forEach(pattern => {
                sanitized = sanitized.replace(pattern, '');
            });
            
            // HTML 엔티티 인코딩
            sanitized = sanitized
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
                
            return sanitized;
        }
        
        validateToken(token) {
            return token && token.length > 0;
        }
    }

    // WaveSpaceData 메인 클래스
    class WaveSpaceData {
        constructor() {
            this.errorHandler = new ErrorHandler();
            this.security = new SecurityManager();
            this.config = {
                apiEndpoint: '/api',
                version: '1.0.0',
                debug: true
            };
            
            console.log('[PRELOAD] WaveSpaceData 전역 데이터 시스템 초기화 완료');
        }
    }

    // 전역 인스턴스 생성
    const waveSpaceData = new WaveSpaceData();
    
    // 전역 접근 가능하도록 설정
    window.WaveSpaceData = waveSpaceData;
    
    console.log('[PRELOAD] WaveSpaceData 전역 객체 초기화 성공');
})();

// 페이지 즉시 표시 - 깜빡임 제거
console.log('[PRELOAD] 페이지 즉시 표시 모드');

// ===== 신규 프리로딩 시스템 통합 =====
function integratedPreloadSystem() {
    // 중복 초기화 방지
    if (window._preloadInitialized) {
        console.log('[PRELOAD] 이미 초기화됨, 건너뜀');
        return;
    }
    
    console.log('[PRELOAD] 통합 프리로딩 시스템 시작');
    
    // DOM이 준비될 때까지 대기
    if (!document.body) {
        console.log('[PRELOAD] DOM 준비 대기 중...');
        setTimeout(integratedPreloadSystem, 10);
        return;
    }
    
    // 페이지 로딩 상태 관리 - 완전히 안전한 체크
    function safeAddClass(element, className) {
        try {
            if (element && 
                element.classList && 
                typeof element.classList.add === 'function' &&
                !element.classList.contains(className)) {
                element.classList.add(className);
                return true;
            }
        } catch (e) {
            console.warn('[PRELOAD] classList 조작 실패:', e);
        }
        return false;
    }
    
    safeAddClass(document.body, 'page-loading');
    
    // 사이드바 상태 미리 복원 (깜빡임 방지)
    const sidebarState = localStorage.getItem('wave-sidebar-state');
    if (sidebarState) {
        try {
            const state = JSON.parse(sidebarState);
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && state.isExpanded) {
                sidebar.classList.add('expanded');
            }
        } catch (e) {
            console.warn('[PRELOAD] 사이드바 상태 복원 실패:', e);
        }
    }
    
    // 중요한 외부 리소스 프리로드
    const criticalResources = [
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css',
    ];
    
    criticalResources.forEach((resource) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = resource;
        document.head.appendChild(link);
    });
    
    // CSS 로딩 완료까지 대기하는 함수
    function waitForStyles() {
        return new Promise((resolve) => {
            const checkStyles = () => {
                const computedStyle = window.getComputedStyle(document.body);
                const cssLoaded = computedStyle.fontFamily !== 'Times' && 
                                computedStyle.fontFamily !== 'serif';
                
                if (cssLoaded || document.readyState === 'complete') {
                    resolve();
                } else {
                    requestAnimationFrame(checkStyles);
                }
            };
            checkStyles();
        });
    }
    
    // 페이지 로드 완료 처리
    async function finishLoading() {
        await waitForStyles();
        
        // 부드러운 전환을 위한 약간의 지연
        setTimeout(() => {
            function safeRemoveClass(element, className) {
                try {
                    if (element && element.classList && typeof element.classList.remove === 'function') {
                        element.classList.remove(className);
                        return true;
                    }
                } catch (e) {
                    console.warn('[PRELOAD] classList 조작 실패:', e);
                }
                return false;
            }
            
            function safeAddClass(element, className) {
                try {
                    if (element && element.classList && typeof element.classList.add === 'function') {
                        element.classList.add(className);
                        return true;
                    }
                } catch (e) {
                    console.warn('[PRELOAD] classList 조작 실패:', e);
                }
                return false;
            }
            
            safeRemoveClass(document.body, 'page-loading');
            safeAddClass(document.body, 'page-loaded');
            
            // 성능 측정
            if (window.performance && performance.now) {
                const loadTime = Math.round(performance.now());
                console.log(`[PRELOAD] 통합 로드 시간: ${loadTime}ms`);
            }
        }, 100);
    }
    
    // DOM 준비 상태에 따른 처리
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', finishLoading);
    } else {
        finishLoading();
    }
    
    // 전체 리소스 로드 완료 시 추가 최적화
    window.addEventListener('load', () => {
        console.log('[PRELOAD] 모든 리소스 로드 완료');
        
        // 네비게이션 링크에 부드러운 전환 효과 적용
        document.querySelectorAll('a[href$=".html"]').forEach(link => {
            if (!link.dataset.transitionOptimized) {
                link.addEventListener('click', (e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        // 부드러운 전환
                        function safeAddClass(element, className) {
                            try {
                                if (element && element.classList && typeof element.classList.add === 'function') {
                                    element.classList.add(className);
                                    return true;
                                }
                            } catch (e) {
                                console.warn('[PRELOAD] classList 조작 실패:', e);
                            }
                            return false;
                        }
                        
                        safeAddClass(document.body, 'page-transitioning');
                        setTimeout(() => {
                            window.location.href = link.href;
                        }, 150);
                    }
                });
                link.dataset.transitionOptimized = 'true';
            }
        });
    });
    
    // 공지사항 데이터 프리페칭 (백그라운드)
    if (window.location.pathname.includes('notice.html')) {
        prefetchNoticeData();
    }
    
    // 초기화 완료 마킹
    window._preloadInitialized = true;
    console.log('[PRELOAD] 통합 프리로딩 시스템 초기화 완료');
}

/**
 * 공지사항 데이터 프리페칭
 */
async function prefetchNoticeData() {
    try {
        console.log('[PRELOAD] 공지사항 데이터 프리페칭 시작...');
        const startTime = performance.now();
        
        // Supabase 준비될 때까지 대기 (최대 2초)
        let attempts = 0;
        const maxAttempts = 40; // 2초 (50ms * 40)
        
        while (attempts < maxAttempts && (!window.WaveSupabase || !window.WaveSupabase.getClient)) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
        }
        
        if (!window.WaveSupabase || !window.WaveSupabase.getClient) {
            console.warn('[PRELOAD] Supabase 준비되지 않음, 프리페칭 건너뜀');
            return;
        }
        
        const supabase = window.WaveSupabase.getClient();
        
        // 최근 공지사항만 프리페칭 (고정글 + 최신 10개)
        const { data, error } = await supabase
            .from('notices')
            .select(`
                id,
                title,
                content,
                category,
                team,
                view_count,
                author_id,
                is_pinned,
                is_new,
                created_at,
                updated_at
            `)
            .eq('is_active', true)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) {
            console.warn('[PRELOAD] 공지사항 프리페칭 실패:', error);
            return;
        }
        
        if (data && data.length > 0) {
            // 캐시에 저장 (5분 유효)
            const cacheData = {
                data: data,
                timestamp: Date.now(),
                expiry: Date.now() + (5 * 60 * 1000) // 5분
            };
            
            try {
                localStorage.setItem('wave_notices_cache', JSON.stringify(cacheData));
            } catch (e) {
                console.warn('[PRELOAD] 캐시 저장 실패 (용량 초과 가능성)');
            }
            
            const endTime = performance.now();
            const prefetchTime = Math.round(endTime - startTime);
            
            console.log(`[PRELOAD] ✅ 공지사항 데이터 프리페칭 완료: ${data.length}개 항목 (${prefetchTime}ms)`);
            
            // 전역 이벤트로 프리페칭 완료 알림
            window.dispatchEvent(new CustomEvent('noticeDataPrefetched', {
                detail: { count: data.length, time: prefetchTime }
            }));
        }
        
    } catch (error) {
        console.warn('[PRELOAD] 공지사항 프리페칭 중 오류:', error);
    }
}

/**
 * 캐시된 공지사항 데이터 가져오기
 */
window.getCachedNoticeData = function() {
    try {
        const cached = localStorage.getItem('wave_notices_cache');
        if (!cached) return null;
        
        const cacheData = JSON.parse(cached);
        
        // 유효시간 체크
        if (Date.now() > cacheData.expiry) {
            localStorage.removeItem('wave_notices_cache');
            return null;
        }
        
        console.log('[CACHE] 캐시된 공지사항 데이터 사용:', cacheData.data.length + '개');
        return cacheData.data;
        
    } catch (error) {
        console.warn('[CACHE] 캐시 데이터 파싱 실패:', error);
        localStorage.removeItem('wave_notices_cache');
        return null;
    }
};

// 안전한 방식으로 함수 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', integratedPreloadSystem);
} else {
    setTimeout(integratedPreloadSystem, 0);
}
