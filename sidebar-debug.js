// 사이드바 디버깅 및 개선된 스크립트
(function () {
    'use strict';

    let sidebarInitialized = false;

    function debugLog(message) {
        console.log(`[SIDEBAR DEBUG] ${message}`);
    }

    function initializeSidebar() {
        if (sidebarInitialized) {
            debugLog('사이드바 이미 초기화됨, 중복 실행 방지');
            return;
        }

        debugLog('사이드바 초기화 시작');

        const navCategoryButtons = document.querySelectorAll('.nav-category-button');
        const sidebarSlogan = document.querySelector('.sidebar-slogan');

        debugLog(`카테고리 버튼 ${navCategoryButtons.length}개 발견`);

        if (navCategoryButtons.length === 0) {
            debugLog('ERROR: 카테고리 버튼을 찾을 수 없음');
            return;
        }

        navCategoryButtons.forEach((button, index) => {
            // 기존 이벤트 리스너 제거 (중복 방지)
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            newButton.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                debugLog(`카테고리 버튼 ${index + 1} 클릭됨`);

                const navCategory = this.closest('.nav-category');
                const navSection = navCategory.closest('.nav-section');
                const isActive = navCategory.classList.contains('active');

                debugLog(`현재 상태: ${isActive ? 'active' : 'inactive'}`);

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

                    debugLog('카테고리 열림');

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
                    debugLog('카테고리 닫힘');
                    // 모든 메뉴가 닫혔을 때 슬로건 원래대로
                    if (sidebarSlogan) {
                        sidebarSlogan.classList.remove('menu-open');
                    }
                }
            });
        });

        // 현재 페이지에 맞는 카테고리 자동 열기
        setTimeout(() => {
            setActivePageCategory();
        }, 100);

        sidebarInitialized = true;
        debugLog('사이드바 초기화 완료');
    }

    function setActivePageCategory() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.nav-item');
        const sidebarSlogan = document.querySelector('.sidebar-slogan');

        debugLog(`현재 페이지: ${fileName}`);

        navItems.forEach((item) => {
            const href = item.getAttribute('href');
            if (href === fileName) {
                item.classList.add('active');

                // 체크마크 애니메이션
                const checkMark = item.querySelector('.check-mark');
                if (checkMark) {
                    checkMark.style.animation = 'none';
                    checkMark.offsetHeight;
                    checkMark.style.animation = 'checkRotate 0.4s ease-out';
                }

                // 부모 카테고리도 열기
                const parentCategory = item.closest('.nav-category');
                if (parentCategory) {
                    parentCategory.classList.add('active');
                    const parentSection = parentCategory.closest('.nav-section');
                    if (parentSection) {
                        parentSection.classList.add('active');
                        debugLog(`${fileName}에 맞는 카테고리 자동 열림`);
                    }

                    // 슬로건 스타일도 변경
                    if (sidebarSlogan) {
                        sidebarSlogan.classList.add('menu-open');
                    }
                }
            }
        });
    }

    // 여러 시점에서 초기화 시도
    function attemptInitialization() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeSidebar);
        } else {
            initializeSidebar();
        }

        // 추가 안전장치: window.onload에서도 시도
        window.addEventListener('load', () => {
            setTimeout(initializeSidebar, 50);
        });
    }

    // 즉시 초기화 시도
    attemptInitialization();

    // 전역으로 노출 (디버깅용)
    window.debugSidebar = {
        reinitialize: initializeSidebar,
        isInitialized: () => sidebarInitialized,
        log: debugLog,
    };
})();
