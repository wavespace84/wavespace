// sidebar.js - 사이드바 관련 기능

// 로컬 스토리지 키
const STORAGE_KEYS = {
    SIDEBAR_STATE: 'wave-sidebar-state',
    ACTIVE_CATEGORY: 'wave-active-category',
};

export function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarSlogan = document.querySelector('.sidebar-slogan');
    const navCategories = document.querySelectorAll('.nav-category');
    const navCategoryButtons = document.querySelectorAll('.nav-category-button');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebarNav = document.querySelector('.sidebar-nav');

    // 스크롤 필요 여부 체크 함수
    function checkScrollNeeded() {
        if (sidebarNav) {
            // 디버깅을 위한 로그
            const scrollHeight = sidebarNav.scrollHeight;
            const clientHeight = sidebarNav.clientHeight;
            console.log('Scroll check:', {
                scrollHeight,
                clientHeight,
                needsScroll: scrollHeight > clientHeight,
            });

            // 1픽셀의 여유를 두고 체크 (반올림 오차 방지)
            if (scrollHeight > clientHeight + 1) {
                sidebarNav.classList.add('has-overflow');
            } else {
                sidebarNav.classList.remove('has-overflow');
            }
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

    // 저장된 상태 복원
    restoreSidebarState();

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
                // 메뉴가 닫힐 때 슬로건 스타일 복원
                if (sidebarSlogan) {
                    sidebarSlogan.classList.remove('menu-open');
                }
            }

            // 상태 저장
            saveSidebarState();

            // 카테고리 토글 후 스크롤 체크
            setTimeout(checkScrollNeeded, 300);
        });
    });

    // 현재 페이지에 해당하는 메뉴 활성화
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item) => {
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

    // 페이지 로드 완료 후 최종 체크
    window.addEventListener('load', checkScrollNeeded);
}

// 사이드바 상태 저장
function saveSidebarState() {
    const activeCategories = [];
    document.querySelectorAll('.nav-category.active').forEach((category) => {
        const button = category.querySelector('.nav-category-button');
        if (button) {
            const text = button.querySelector('span').textContent;
            activeCategories.push(text);
        }
    });

    localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY, JSON.stringify(activeCategories));
}

// 사이드바 상태 복원
function restoreSidebarState() {
    try {
        const savedCategories = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY) || '[]'
        );

        savedCategories.forEach((categoryText) => {
            document.querySelectorAll('.nav-category-button').forEach((button) => {
                const text = button.querySelector('span').textContent;
                if (text === categoryText) {
                    const category = button.closest('.nav-category');
                    if (category) {
                        category.classList.add('active');

                        // 슬로건 스타일 변경
                        const sidebarSlogan = document.querySelector('.sidebar-slogan');
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
                }
            });
        });
    } catch (error) {
        console.error('Failed to restore sidebar state:', error);
    }
}
