// page-optimizer.js - 페이지 로딩 최적화 및 깜빡임 방지 (레거시 통합으로 인한 조건부 실행)
export function initPageOptimizer() {
    // 레거시 preload.js에서 이미 초기화되었는지 확인
    if (window._preloadInitialized) {
        console.log('[PAGE-OPTIMIZER] 레거시 preload.js에서 이미 처리됨, 건너뜀');
        return;
    }
    
    console.log('[PAGE-OPTIMIZER] 레거시 시스템 없음, 모듈 최적화 실행');

    // 페이지 로딩 애니메이션 관리
    const body = document.body;
    const sidebarState = localStorage.getItem('wave-sidebar-state');
    
    // 페이지 로드 시작 시 loading 상태 추가
    if (body && !body.classList.contains('page-loading')) {
        body.classList.add('page-loading');
    }

    // 사이드바 상태 미리 적용 (깜빡임 방지)
    if (sidebarState) {
        try {
            const state = JSON.parse(sidebarState);
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && state.isExpanded) {
                sidebar.classList.add('expanded');
            }
        } catch (e) {
            console.warn('[PAGE-OPTIMIZER] 사이드바 상태 복원 실패:', e);
        }
    }

    // CSS가 로드될 때까지 대기
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

    // 페이지 로드 완료 후 처리
    async function finishLoading() {
        await waitForStyles();
        
        // 약간의 지연 후 로딩 상태 제거 (자연스러운 전환)
        setTimeout(() => {
            if (body) {
                body.classList.remove('page-loading');
                body.classList.add('page-loaded');
            }
            
            // 성능 측정
            if (window.performance && performance.now) {
                const loadTime = Math.round(performance.now());
                console.log(`[PAGE-OPTIMIZER] 페이지 로드 시간: ${loadTime}ms`);
            }
        }, 100);
    }

    // DOM 완료 시 즉시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', finishLoading);
    } else {
        finishLoading();
    }

    // 전체 리소스 로드 완료 시 추가 최적화
    window.addEventListener('load', () => {
        console.log('[PAGE-OPTIMIZER] 모든 리소스 로드 완료');
        
        // 이미지 lazy loading 최적화
        optimizeLazyImages();
        
        // 메모리 정리
        if (window.gc && typeof window.gc === 'function') {
            setTimeout(() => window.gc(), 1000);
        }
    });
}

// 이미지 지연 로딩 최적화
function optimizeLazyImages() {
    const lazyImages = document.querySelectorAll('img[data-lazy]');
    
    if (lazyImages.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // 미리 로딩 시작
                const tempImg = new Image();
                tempImg.onload = () => {
                    img.src = img.dataset.lazy;
                    img.removeAttribute('data-lazy');
                    img.classList.add('lazy-loaded');
                };
                tempImg.src = img.dataset.lazy;
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// 스크립트 중복 로드 방지
export function preventDuplicateScripts() {
    const loadedScripts = new Set();
    
    // 기존 스크립트 태그들을 추적
    document.querySelectorAll('script[src]').forEach(script => {
        loadedScripts.add(script.src);
    });
    
    // MutationObserver로 새로운 스크립트 태그 감지
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.tagName === 'SCRIPT' && node.src) {
                    if (loadedScripts.has(node.src)) {
                        console.warn('[PAGE-OPTIMIZER] 중복 스크립트 제거:', node.src);
                        node.remove();
                    } else {
                        loadedScripts.add(node.src);
                    }
                }
            });
        });
    });
    
    observer.observe(document.head, { childList: true });
    observer.observe(document.body, { childList: true, subtree: true });
}

// 페이지 전환 준비 (다른 페이지로 이동할 때)
export function preparePageTransition(targetUrl) {
    console.log('[PAGE-OPTIMIZER] 페이지 전환 준비:', targetUrl);
    
    const body = document.body;
    if (body) {
        body.classList.add('page-transitioning');
    }
    
    // 현재 상태 저장
    saveSidebarState();
    
    // 부드러운 전환을 위한 지연
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 150);
}

// 사이드바 상태 저장
function saveSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const state = {
            isExpanded: sidebar.classList.contains('expanded'),
            timestamp: Date.now()
        };
        localStorage.setItem('wave-sidebar-state', JSON.stringify(state));
    }
}

// 초기화 함수
export function initOptimizer() {
    initPageOptimizer();
    preventDuplicateScripts();
    
    // 네비게이션 링크들에 전환 효과 적용
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        if (!link.dataset.optimized) {
            link.addEventListener('click', (e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    preparePageTransition(link.href);
                }
            });
            link.dataset.optimized = 'true';
        }
    });
}