// 사이드바 네비게이션 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 네비게이션 토글
    const navCategoryButtons = document.querySelectorAll('.nav-category-button');
    
    // 로컬 스토리지에서 열린 카테고리 상태 복원
    const openCategories = JSON.parse(localStorage.getItem('openCategories') || '[]');
    
    navCategoryButtons.forEach(button => {
        const navCategory = button.closest('.nav-category');
        const categoryText = button.querySelector('span').textContent;
        
        // 저장된 상태가 있으면 복원
        if (openCategories.includes(categoryText)) {
            navCategory.classList.add('active');
            navCategory.closest('.nav-section').classList.add('active');
        }
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const navCategory = this.closest('.nav-category');
            const navSection = navCategory.closest('.nav-section');
            const categoryText = this.querySelector('span').textContent;
            const isActive = navCategory.classList.contains('active');
            
            // 카테고리 토글
            if (isActive) {
                navCategory.classList.remove('active');
                navSection.classList.remove('active');
                
                // 로컬 스토리지에서 제거
                const index = openCategories.indexOf(categoryText);
                if (index > -1) {
                    openCategories.splice(index, 1);
                }
            } else {
                navCategory.classList.add('active');
                navSection.classList.add('active');
                
                // 로컬 스토리지에 추가
                if (!openCategories.includes(categoryText)) {
                    openCategories.push(categoryText);
                }
            }
            
            // 상태 저장
            localStorage.setItem('openCategories', JSON.stringify(openCategories));
            
            // 화살표 회전 애니메이션
            const arrow = this.querySelector('.nav-arrow');
            if (arrow) {
                arrow.style.transform = isActive ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    });
    
    // 현재 페이지 활성화 표시
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath) {
            item.classList.add('active');
            
            // 부모 카테고리 열기
            const parentCategory = item.closest('.nav-category');
            const parentSection = item.closest('.nav-section');
            if (parentCategory && !parentCategory.classList.contains('active')) {
                parentCategory.classList.add('active');
                parentSection.classList.add('active');
                
                // 상태 저장
                const categoryButton = parentCategory.querySelector('.nav-category-button span');
                if (categoryButton) {
                    const categoryText = categoryButton.textContent;
                    if (!openCategories.includes(categoryText)) {
                        openCategories.push(categoryText);
                        localStorage.setItem('openCategories', JSON.stringify(openCategories));
                    }
                }
            }
        }
    });
    
    // 모바일 햄버거 메뉴
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
            if (overlay) {
                overlay.classList.toggle('active');
            } else {
                // 오버레이가 없으면 생성
                const newOverlay = document.createElement('div');
                newOverlay.className = 'sidebar-overlay active';
                document.body.appendChild(newOverlay);
                
                newOverlay.addEventListener('click', function() {
                    sidebar.classList.remove('mobile-open');
                    this.classList.remove('active');
                });
            }
        });
    }
    
    // 사이드바 외부 클릭 시 닫기
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('mobile-open');
            this.classList.remove('active');
        });
    }
    
    // 사이드바 hover 효과
    const navItemsWithHover = document.querySelectorAll('.nav-item');
    
    navItemsWithHover.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(4px)';
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateX(0)';
            }
        });
    });
    
    // 사이드바 스크롤 위치 저장 및 복원
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        // 저장된 스크롤 위치 복원
        const savedScrollPos = localStorage.getItem('sidebarScrollPos');
        if (savedScrollPos) {
            sidebarNav.scrollTop = parseInt(savedScrollPos);
        }
        
        // 스크롤 위치 저장
        sidebarNav.addEventListener('scroll', function() {
            localStorage.setItem('sidebarScrollPos', this.scrollTop.toString());
        });
    }
});

// 페이지 전환 시 부드러운 애니메이션
window.addEventListener('beforeunload', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
});