// sidebar.js - 사이드바 관련 기능

export function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarSlogan = document.querySelector('.sidebar-slogan');
    const navCategories = document.querySelectorAll('.nav-category');
    const navCategoryButtons = document.querySelectorAll('.nav-category-button');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    // 모바일 메뉴 토글
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
    
    // 현재 페이지 확인
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // 네비게이션 카테고리 클릭 이벤트
    navCategoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.closest('.nav-category');
            const wasActive = category.classList.contains('active');
            
            // 모든 카테고리 닫기
            navCategories.forEach(cat => {
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
                // 메뉴가 닫힐 때 슬로건 스타일 복원
                if (sidebarSlogan) {
                    sidebarSlogan.classList.remove('menu-open');
                }
            }
        });
    });
    
    // 현재 페이지에 해당하는 메뉴 활성화
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === 'index.html' && href === '/')) {
            item.classList.add('active');
            
            // 부모 카테고리도 열기
            const parentCategory = item.closest('.nav-category');
            if (parentCategory) {
                parentCategory.classList.add('active');
                
                // 슬로건 스타일도 변경
                if (sidebarSlogan) {
                    sidebarSlogan.classList.add('menu-open');
                }
                
                // 다음 섹션 확인
                const section = parentCategory.closest('.nav-section');
                if (section) {
                    const nextSection = section.nextElementSibling;
                    if (nextSection && nextSection.classList.contains('nav-section')) {
                        section.classList.add('next-active');
                    }
                }
            }
        }
    });
    
    // 사이드바 네비게이션 스크롤 인디케이터
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        sidebarNav.addEventListener('scroll', () => {
            const scrollTop = sidebarNav.scrollTop;
            const scrollHeight = sidebarNav.scrollHeight;
            const clientHeight = sidebarNav.clientHeight;
            
            // 상단 인디케이터
            if (scrollTop > 10) {
                sidebarNav.style.setProperty('--scroll-indicator-top-opacity', '1');
            } else {
                sidebarNav.style.setProperty('--scroll-indicator-top-opacity', '0');
            }
            
            // 하단 인디케이터
            if (scrollTop + clientHeight < scrollHeight - 10) {
                sidebarNav.style.setProperty('--scroll-indicator-bottom-opacity', '1');
            } else {
                sidebarNav.style.setProperty('--scroll-indicator-bottom-opacity', '0');
            }
        });
    }
}