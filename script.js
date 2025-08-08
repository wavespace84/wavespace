// 실시간 시계 업데이트
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// 페이지 로드 완료 시 깜빡임 방지
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// 페이지 로드 시 시계 시작
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 1000);
    
    // 사이드바 네비게이션 토글
    const navCategoryButtons = document.querySelectorAll('.nav-category-button');
    const sidebarSlogan = document.querySelector('.sidebar-slogan');
    
    navCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const navCategory = this.closest('.nav-category');
            const navSection = navCategory.closest('.nav-section');
            const isActive = navCategory.classList.contains('active');
            
            // 모든 카테고리 닫기
            document.querySelectorAll('.nav-category').forEach(cat => {
                cat.classList.remove('active');
            });
            document.querySelectorAll('.nav-section').forEach(sec => {
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
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }
    
    // 사이드바 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // 현재 페이지 활성화 표시
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
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
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 모든 active 제거
            navItems.forEach(navItem => {
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
        sidebarNav.addEventListener('scroll', function() {
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
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValues = entry.target.querySelectorAll('.stat-value');
                statValues.forEach(stat => {
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
            elementTop <=
            (window.innerHeight || document.documentElement.clientHeight) / dividend
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
});

// 애니메이션을 위한 CSS 클래스 추가
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);