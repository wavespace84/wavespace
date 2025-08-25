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

// 페이지별 초기화는 js/main.js에서 관리됩니다
document.addEventListener('DOMContentLoaded', () => {
    console.log('[SCRIPT.JS] 레거시 스크립트 로드됨 - js/main.js 사용 권장');

    // 사이드바 기능은 js/modules/sidebar.js에서 관리됩니다
    if (window.debugSidebar && window.debugSidebar.isInitialized()) {
        console.log('[SCRIPT.JS] 디버깅 사이드바가 이미 초기화됨');
        return;
    }

    // 사이드바 코드를 무조건 실행 (임시 해결책)
    console.log('[SCRIPT.JS] 사이드바 초기화 시작');

    // 사이드바 네비게이션 토글
    const navCategoryButtons = document.querySelectorAll('.nav-category-button');
    const sidebarSlogan = document.querySelector('.sidebar-slogan');

    console.log('[SCRIPT.JS] 찾은 카테고리 버튼 수:', navCategoryButtons.length);
    
    navCategoryButtons.forEach((button, index) => {
        console.log(`[SCRIPT.JS] 버튼 ${index}에 클릭 이벤트 추가`);
        button.addEventListener('click', function () {
            console.log('[SCRIPT.JS] 카테고리 버튼 클릭됨');
            const navCategory = this.closest('.nav-category');
            const navSection = navCategory.closest('.nav-section');
            const isActive = navCategory.classList.contains('active');

            // 모든 카테고리 닫기
            document.querySelectorAll('.nav-category').forEach((cat) => {
                cat.classList.remove('active');
            });
            document.querySelectorAll('.nav-section').forEach((sec) => {
                sec.classList.remove('active', 'next-active');
            });

            // 클릭한 카테고리 토글
            if (!isActive) {
                navCategory.classList.add('active');
                navSection.classList.add('active');

                // 다음 섹션에 next-active 클래스 추가
                const nextSection = navSection.nextElementSibling;
                if (nextSection && nextSection.classList.contains('nav-section')) {
                    nextSection.classList.add('next-active');
                }

                // 슬로건 스타일 변경
                if (sidebarSlogan) {
                    sidebarSlogan.classList.add('menu-open');
                }
            } else {
                // 모든 메뉴가 닫혔을 때 슬로건 원래대로
                if (sidebarSlogan) {
                    sidebarSlogan.classList.remove('menu-open');
                }
            }
        });
    });

    // 모바일 메뉴 토글
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // 모바일 로고 추가 (클릭 가능)
    if (window.innerWidth <= 1024) {
        const header = document.querySelector('.main-header');
        if (header && !header.querySelector('.mobile-logo')) {
            const logo = document.createElement('a');
            logo.href = 'index.html';
            logo.className = 'mobile-logo';
            logo.textContent = 'WAVE space';
            header.insertBefore(logo, header.querySelector('.header-right'));
        }
    }

    // 사이드바 오버레이 생성
    if (window.innerWidth <= 1024) {
        const appContainer = document.querySelector('.app-container');
        if (appContainer && !document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            appContainer.appendChild(overlay);
            
            // 오버레이 클릭시 사이드바 닫기
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
            
            // 사이드바 상태에 따라 오버레이 토글
            const sidebarObserver = new MutationObserver(() => {
                if (sidebar.classList.contains('open')) {
                    overlay.classList.add('active');
                } else {
                    overlay.classList.remove('active');
                }
            });
            
            sidebarObserver.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        }
    }

    // 사이드바 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && sidebar && mobileMenuBtn) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // 현재 페이지 활성화 표시
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach((item) => {
        const href = item.getAttribute('href');
        const fileName = currentPath.split('/').pop() || 'index.html';

        if (href === fileName) {
            item.classList.add('active');

            // 이미 있는 체크마크에 애니메이션 적용
            const checkMark = item.querySelector('.check-mark');
            if (checkMark) {
                // 강제로 리플로우를 발생시켜 애니메이션 재시작
                checkMark.style.animation = 'none';
                checkMark.offsetHeight; // 리플로우 트리거
                checkMark.style.animation = 'checkRotate 0.4s ease-out';
            }

            // 부모 카테고리도 열기
            const parentCategory = item.closest('.nav-category');
            if (parentCategory) {
                parentCategory.classList.add('active');
                const parentSection = parentCategory.closest('.nav-section');
                if (parentSection) {
                    parentSection.classList.add('active');
                }
                // 슬로건 스타일도 변경
                if (sidebarSlogan) {
                    sidebarSlogan.classList.add('menu-open');
                }
            }
        }
    });

    // 메뉴 아이템 클릭 시 active 상태 변경
    navItems.forEach((item) => {
        item.addEventListener('click', function (e) {
            // 모든 active 제거
            navItems.forEach((navItem) => {
                navItem.classList.remove('active');
            });

            // 클릭한 아이템에 active 추가
            this.classList.add('active');

            // 체크마크 애니메이션 (이미 있는 체크마크에만 적용)
            const checkMark = this.querySelector('.check-mark');
            if (checkMark) {
                // 애니메이션 재시작
                checkMark.style.animation = 'none';
                checkMark.offsetHeight; // 리플로우 트리거
                checkMark.style.animation = 'checkRotate 0.4s ease-out';
            }
        });
    });

    // 사이드바 스크롤 인디케이터
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('scroll', function () {
            const scrollTop = this.scrollTop;
            const scrollHeight = this.scrollHeight;
            const clientHeight = this.clientHeight;

            // 상단 스크롤 감지
            if (scrollTop > 10) {
                this.classList.add('scrolled-top');
            } else {
                this.classList.remove('scrolled-top');
            }

            // 하단 스크롤 감지
            if (scrollTop + clientHeight < scrollHeight - 10) {
                this.classList.add('scrolled-bottom');
            } else {
                this.classList.remove('scrolled-bottom');
            }
        });

        // 초기 스크롤 상태 체크
        sidebarNav.dispatchEvent(new Event('scroll'));
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
