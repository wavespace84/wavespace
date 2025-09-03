// preload.js - 페이지 로딩 관련 기능 (레거시 통합으로 인한 조건부 실행)

export function initPreload() {
    // 레거시 preload.js에서 이미 초기화되었는지 확인
    if (window._preloadInitialized) {
        console.log('[MODULES-PRELOAD] 레거시 preload.js에서 이미 초기화됨, 건너뜀');
        return;
    }
    
    console.log('[MODULES-PRELOAD] 레거시 시스템 없음, 모듈 프리로딩 실행');
    // 중요한 리소스 미리 로드 (실제 존재하는 파일만)
    const criticalResources = [
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css',
    ];

    // Link preload 태그 생성
    criticalResources.forEach((resource) => {
        const link = document.createElement('link');
        link.rel = 'preload';

        if (resource.endsWith('.css')) {
            link.as = 'style';
        } else if (resource.endsWith('.js')) {
            link.as = 'script';
        }

        link.href = resource;
        document.head.appendChild(link);
    });

    // 페이지 로드 완료 시 body에 loaded 클래스 추가
    window.addEventListener('load', () => {
        if (document.body) {
            document.body.classList.add('loaded');
        }

        // 로딩 성능 측정 - performance.now() 사용
        if (window.performance) {
            const loadTime = Math.round(performance.now());
            console.log(`Page load time: ${loadTime}ms`);
        }
    });

    // 이미지 지연 로딩
    const lazyImages = document.querySelectorAll('img[data-lazy]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.lazy;
                    img.removeAttribute('data-lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach((img) => {
            img.src = img.dataset.lazy;
            img.removeAttribute('data-lazy');
        });
    }
}
