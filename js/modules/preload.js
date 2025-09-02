// preload.js - 페이지 로딩 관련 기능

export function initPreload() {
    // 중요한 리소스 미리 로드
    const criticalResources = [
        '/css/main.css',
        '/js/main.js',
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
        document.body.classList.add('loaded');

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
