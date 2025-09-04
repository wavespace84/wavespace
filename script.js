// 시계 기능은 js/modules/clock.js에서 관리됩니다

// 토스트 알림 시스템 로드
(function() {
    const script = document.createElement('script');
    script.src = 'js/modules/toast.js';
    script.async = false;
    document.head.appendChild(script);
})();

// 페이지 로드 완료 시 깜빡임 방지
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// 레거시 사이드바 초기화 함수 (ES6 모듈이 없는 페이지용)
function initLegacySidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarSlogan = document.querySelector('.sidebar-slogan');
    const navCategories = document.querySelectorAll('.nav-category');
    const navCategoryButtons = document.querySelectorAll('.nav-category-button');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebarNav = document.querySelector('.sidebar-nav');

    // 로컬 스토리지 키
    const STORAGE_KEYS = {
        SIDEBAR_STATE: 'wave-sidebar-state',
        ACTIVE_CATEGORY: 'wave-active-category',
    };

    // 스크롤 필요 여부 체크 함수
    function checkScrollNeeded() {
        if (sidebarNav) {
            const scrollHeight = sidebarNav.scrollHeight;
            const clientHeight = sidebarNav.clientHeight;

            // 1픽셀의 여유를 두고 체크 (반올림 오차 방지)
            if (scrollHeight > clientHeight + 1) {
                sidebarNav.classList.add('has-overflow');
            } else {
                sidebarNav.classList.remove('has-overflow');
            }
        }
    }

    // 사이드바 상태 저장
    function saveSidebarState() {
        const activeCategories = [];
        navCategories.forEach((category) => {
            if (category.classList.contains('active')) {
                const button = category.querySelector('.nav-category-button');
                if (button) {
                    const categoryText = button.querySelector('span:nth-child(2)');
                    if (categoryText) {
                        activeCategories.push(categoryText.textContent.trim());
                    }
                }
            }
        });
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY, JSON.stringify(activeCategories));
    }

    // 사이드바 상태 복원
    function restoreSidebarState() {
        try {
            const activeCategories = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY) || '[]');
            
            activeCategories.forEach((categoryName) => {
                navCategoryButtons.forEach((button) => {
                    const categoryText = button.querySelector('span:nth-child(2)');
                    if (categoryText && categoryText.textContent.trim() === categoryName) {
                        const category = button.closest('.nav-category');
                        category.classList.add('active');
                        
                        // 슬로건 스타일 변경
                        if (sidebarSlogan) {
                            sidebarSlogan.classList.add('menu-open');
                        }

                        // 다음 섹션 확인
                        const section = category.closest('.nav-section');
                        if (section) {
                            const nextSection = section.nextElementSibling;
                            if (nextSection && nextSection.classList.contains('nav-section')) {
                                section.classList.add('next-active');
                            }
                        }
                    }
                });
            });
        } catch (error) {
            console.warn('[SIDEBAR] 상태 복원 실패:', error);
        }
    }

    // 초기 체크
    checkScrollNeeded();

    // 리사이즈 시 체크
    window.addEventListener('resize', checkScrollNeeded);

    // 모바일 메뉴 토글
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // 현재 페이지 확인
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    // 저장된 상태 복원 (홈페이지 제외)
    if (currentPage !== 'index.html') {
        restoreSidebarState();
    }

    // 네비게이션 카테고리 클릭 이벤트
    navCategoryButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.closest('.nav-category');
            const wasActive = category.classList.contains('active');

            // 모든 카테고리 닫기
            navCategories.forEach((cat) => {
                cat.classList.remove('active');

                // 다음 섹션의 active 상태 제거
                const section = cat.closest('.nav-section');
                if (section) {
                    const nextSection = section.nextElementSibling;
                    if (nextSection && nextSection.classList.contains('nav-section')) {
                        section.classList.remove('next-active');
                    }
                }
            });

            // 클릭한 카테고리 토글
            if (!wasActive) {
                category.classList.add('active');

                // 슬로건 스타일 변경
                if (sidebarSlogan) {
                    sidebarSlogan.classList.add('menu-open');
                }

                // 다음 섹션 확인
                const section = category.closest('.nav-section');
                if (section) {
                    const nextSection = section.nextElementSibling;
                    if (nextSection && nextSection.classList.contains('nav-section')) {
                        section.classList.add('next-active');
                    }
                }
            } else {
                category.classList.remove('active');
                
                // 모든 카테고리가 닫혔는지 확인
                const anyActive = document.querySelector('.nav-category.active');
                if (!anyActive && sidebarSlogan) {
                    sidebarSlogan.classList.remove('menu-open');
                }
            }

            // 상태 저장
            saveSidebarState();

            // 스크롤 체크
            setTimeout(checkScrollNeeded, 300);
        });
    });

    // 네비게이션 아이템 클릭 시 활성 상태 유지 (현재 페이지인 경우)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item) => {
        const href = item.getAttribute('href');
        if (href === currentPage || 
            (currentPage === 'index.html' && href === '/') ||
            (href && href.includes(currentPage))) {
            item.classList.add('active');
            
            // 해당 카테고리 열기
            const category = item.closest('.nav-category');
            if (category) {
                category.classList.add('active');
                
                if (sidebarSlogan) {
                    sidebarSlogan.classList.add('menu-open');
                }

                const section = category.closest('.nav-section');
                if (section) {
                    const nextSection = section.nextElementSibling;
                    if (nextSection && nextSection.classList.contains('nav-section')) {
                        section.classList.add('next-active');
                    }
                }
            }
        }
        
        // nav-item 클릭 시 이벤트 전파 중단하여 링크가 정상 작동하도록 함
        item.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    console.log('[SIDEBAR] 레거시 사이드바 초기화 완료');
}

// 페이지별 초기화는 js/main.js에서 관리됩니다
document.addEventListener('DOMContentLoaded', () => {
    console.log('[SCRIPT.JS] 레거시 스크립트 로드됨 - js/main.js 사용 권장');

    // 사이드바가 있다면 레거시 사이드바 초기화
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !window._sidebarInitialized) {
        console.log('[SCRIPT.JS] 레거시 사이드바 초기화 시작');
        initLegacySidebar();
        window._sidebarInitialized = true;
        console.log('[SCRIPT.JS] 레거시 사이드바 초기화 완료');
    } else if (!sidebar) {
        console.log('[SCRIPT.JS] 사이드바 요소가 없어서 초기화하지 않음');
    } else {
        console.log('[SCRIPT.JS] 사이드바가 이미 초기화됨, 건너뜀');
    }

    // 숫자 카운터 애니메이션
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }

    // 통계 숫자 애니메이션 실행
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const statValues = entry.target.querySelectorAll('.stat-value');
                statValues.forEach((stat) => {
                    const text = stat.textContent;
                    const number = parseInt(text.replace(/[^0-9]/g, ''));
                    if (!isNaN(number)) {
                        animateCounter(stat, number);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        observer.observe(heroStats);
    }

    // 스크롤 애니메이션
    const scrollElements = document.querySelectorAll('.fame-card, .hero-cta-btn');

    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add('scrolled');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            }
        });
    };

    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });

    // 초기 로드 시 애니메이션 체크
    handleScrollAnimation();

    // 히어로 카드 자동 회전 캐러셀
    const heroCards = document.querySelectorAll('.hero-card');
    if (heroCards.length >= 4) {
        let currentIndex = 0;
        const totalCards = heroCards.length;

        // 카드 위치 설정 함수
        function updateCardPositions() {
            heroCards.forEach((card, index) => {
                // 현재 인덱스로부터의 상대 위치 계산
                const relativeIndex = (index - currentIndex + totalCards) % totalCards;

                // 카드 위치와 스타일 업데이트
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

                if (relativeIndex === 0) {
                    // 앞쪽 카드 (활성화)
                    card.style.zIndex = '3';
                    card.style.transform = 'translateX(0) translateY(0) scale(1) rotate(-5deg)';
                    card.style.opacity = '1';
                    card.style.left = '0';
                    card.style.top = '20px';
                } else if (relativeIndex === 1) {
                    // 중간 카드
                    card.style.zIndex = '2';
                    card.style.transform =
                        'translateX(40px) translateY(40px) scale(0.95) rotate(0deg)';
                    card.style.opacity = '0.8';
                    card.style.left = '40px';
                    card.style.top = '60px';
                } else if (relativeIndex === 2) {
                    // 뒤쪽 카드
                    card.style.zIndex = '1';
                    card.style.transform =
                        'translateX(80px) translateY(80px) scale(0.9) rotate(5deg)';
                    card.style.opacity = '0.6';
                    card.style.left = '80px';
                    card.style.top = '100px';
                } else {
                    // 숨겨진 카드들
                    card.style.zIndex = '0';
                    card.style.transform =
                        'translateX(120px) translateY(120px) scale(0.85) rotate(10deg)';
                    card.style.opacity = '0';
                    card.style.left = '120px';
                    card.style.top = '140px';
                }
            });
        }

        // 다음 카드로 이동
        function nextCard() {
            currentIndex = (currentIndex + 1) % totalCards;
            updateCardPositions();
        }

        // 초기 위치 설정
        updateCardPositions();

        // 3초마다 자동 회전
        setInterval(nextCard, 3000);

        // 카드 호버 시 일시정지 (선택사항)
        let isPaused = false;
        heroCards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                isPaused = true;
            });
            card.addEventListener('mouseleave', () => {
                isPaused = false;
            });
        });
    }
});

// 애니메이션을 위한 CSS 클래스 추가
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fame-card, .hero-cta-btn {
        opacity: 0;
        transform: translateY(30px);
    }
    
    .fame-card.scrolled, .hero-cta-btn.scrolled {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .fame-card:nth-child(1) { animation-delay: 0.1s; }
    .fame-card:nth-child(2) { animation-delay: 0.2s; }
    .fame-card:nth-child(3) { animation-delay: 0.3s; }
    
    .hero-cta-btn:nth-child(1) { animation-delay: 0.1s; }
    .hero-cta-btn:nth-child(2) { animation-delay: 0.2s; }
    .hero-cta-btn:nth-child(3) { animation-delay: 0.3s; }
    .hero-cta-btn:nth-child(4) { animation-delay: 0.4s; }
`;
document.head.appendChild(animationStyle);
