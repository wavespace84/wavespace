/**
 * Sidebar Common - 사이드바 공통 로직
 * 
 * sidebar.js와 sidebar-loader.js에서 사용하는 공통 기능을 제공합니다.
 */

/**
 * 사이드바 공통 설정 및 유틸리티
 */
export class SidebarCommon {
    // 로컬 스토리지 키
    static STORAGE_KEYS = {
        SIDEBAR_STATE: 'wave-sidebar-state',
        ACTIVE_CATEGORY: 'wave-active-category',
    };

    /**
     * 스크롤 필요 여부 체크
     * @param {HTMLElement} sidebarNav - 사이드바 네비게이션 요소
     */
    static checkScrollNeeded(sidebarNav) {
        if (!sidebarNav) return;

        const scrollHeight = sidebarNav.scrollHeight;
        const clientHeight = sidebarNav.clientHeight;

        // 1픽셀의 여유를 두고 체크 (반올림 오차 방지)
        if (scrollHeight > clientHeight + 1) {
            sidebarNav.classList.add('has-overflow');
        } else {
            sidebarNav.classList.remove('has-overflow');
        }
    }

    /**
     * 사이드바 상태 저장
     * @param {NodeList} navCategories - 네비게이션 카테고리 요소들
     */
    static saveSidebarState(navCategories) {
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
        
        localStorage.setItem(this.STORAGE_KEYS.ACTIVE_CATEGORY, JSON.stringify(activeCategories));
    }

    /**
     * 사이드바 상태 복원
     * @param {NodeList} navCategoryButtons - 카테고리 버튼 요소들
     * @param {HTMLElement} sidebarSlogan - 슬로건 요소
     */
    static restoreSidebarState(navCategoryButtons, sidebarSlogan) {
        try {
            const activeCategories = JSON.parse(
                localStorage.getItem(this.STORAGE_KEYS.ACTIVE_CATEGORY) || '[]'
            );
            
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

    /**
     * 카테고리 토글 이벤트 핸들러 생성
     * @param {Object} elements - 사이드바 관련 요소들
     * @returns {Function} 이벤트 핸들러 함수
     */
    static createCategoryToggleHandler(elements) {
        const { navCategories, sidebarSlogan } = elements;
        
        return function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const button = e.currentTarget;
            const category = button.closest('.nav-category');
            const wasActive = category.classList.contains('active');
            
            // 토글
            category.classList.toggle('active');
            
            // 이전 섹션의 next-active 클래스 제거
            const section = category.closest('.nav-section');
            if (section) {
                const prevSection = section.previousElementSibling;
                if (prevSection && prevSection.classList.contains('nav-section')) {
                    prevSection.classList.remove('next-active');
                }
            }
            
            // 다음 섹션 확인
            let hasActiveInNextSection = false;
            if (section) {
                const nextSection = section.nextElementSibling;
                if (nextSection && nextSection.classList.contains('nav-section')) {
                    const nextCategories = nextSection.querySelectorAll('.nav-category.active');
                    hasActiveInNextSection = nextCategories.length > 0;
                    
                    if (category.classList.contains('active') || hasActiveInNextSection) {
                        section.classList.add('next-active');
                    } else {
                        section.classList.remove('next-active');
                    }
                }
            }
            
            // 슬로건 스타일 업데이트
            if (sidebarSlogan) {
                const hasActiveCategory = document.querySelector('.nav-category.active');
                if (hasActiveCategory) {
                    sidebarSlogan.classList.add('menu-open');
                } else {
                    sidebarSlogan.classList.remove('menu-open');
                }
            }
            
            // 상태 저장
            SidebarCommon.saveSidebarState(navCategories);
        };
    }

    /**
     * 모바일 메뉴 토글 이벤트 핸들러 생성
     * @param {HTMLElement} sidebar - 사이드바 요소
     * @returns {Function} 이벤트 핸들러 함수
     */
    static createMobileMenuToggleHandler(sidebar) {
        return function() {
            sidebar.classList.toggle('mobile-active');
            
            // 사이드바 상태 저장
            const isMobileActive = sidebar.classList.contains('mobile-active');
            localStorage.setItem(
                SidebarCommon.STORAGE_KEYS.SIDEBAR_STATE,
                JSON.stringify({ mobileActive: isMobileActive })
            );
        };
    }

    /**
     * 스크롤 인디케이터 설정
     * @param {HTMLElement} sidebar - 사이드바 요소
     */
    static setupScrollIndicators(sidebar) {
        if (!sidebar) return;

        const scrollIndicatorTop = sidebar.querySelector('.scroll-indicator-top');
        const scrollIndicatorBottom = sidebar.querySelector('.scroll-indicator-bottom');
        const sidebarNav = sidebar.querySelector('.sidebar-nav');

        if (!sidebarNav || !scrollIndicatorTop || !scrollIndicatorBottom) return;

        const updateScrollIndicators = () => {
            const scrollTop = sidebarNav.scrollTop;
            const scrollHeight = sidebarNav.scrollHeight;
            const clientHeight = sidebarNav.clientHeight;
            
            // 상단 인디케이터
            if (scrollTop > 10) {
                scrollIndicatorTop.classList.add('visible');
            } else {
                scrollIndicatorTop.classList.remove('visible');
            }
            
            // 하단 인디케이터
            if (scrollTop + clientHeight < scrollHeight - 10) {
                scrollIndicatorBottom.classList.add('visible');
            } else {
                scrollIndicatorBottom.classList.remove('visible');
            }
        };

        // 이벤트 리스너 등록
        sidebarNav.addEventListener('scroll', updateScrollIndicators);
        window.addEventListener('resize', () => {
            SidebarCommon.checkScrollNeeded(sidebarNav);
            updateScrollIndicators();
        });

        // 초기 체크
        updateScrollIndicators();
    }

    /**
     * DOM 요소 안전하게 가져오기
     * @param {string} selector - CSS 선택자
     * @param {HTMLElement} parent - 부모 요소 (기본값: document)
     * @returns {HTMLElement|null} 찾은 요소 또는 null
     */
    static $(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * DOM 요소 리스트 가져오기
     * @param {string} selector - CSS 선택자
     * @param {HTMLElement} parent - 부모 요소 (기본값: document)
     * @returns {NodeList} 찾은 요소들
     */
    static $$(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    /**
     * 이벤트 리스너 추가 헬퍼
     * @param {HTMLElement} element - 대상 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 이벤트 옵션
     */
    static on(element, event, handler, options = {}) {
        if (element && typeof element.addEventListener === 'function') {
            element.addEventListener(event, handler, options);
        }
    }

    /**
     * 이벤트 리스너 제거 헬퍼
     * @param {HTMLElement} element - 대상 요소
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 이벤트 옵션
     */
    static off(element, event, handler, options = {}) {
        if (element && typeof element.removeEventListener === 'function') {
            element.removeEventListener(event, handler, options);
        }
    }
}

// 기본 내보내기
export default SidebarCommon;