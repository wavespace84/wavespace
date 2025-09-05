/**
 * PaginationLoader - 페이지네이션 컴포넌트 로더
 * 
 * 기능:
 * - 페이지네이션 동적 로딩
 * - 페이지 변경 이벤트 처리
 * - 페이지 사이즈 변경 지원
 * - 페이지 점프 기능
 * - 모바일 페이지네이션
 * - 로딩 상태 관리
 * - 다양한 스타일 변형 지원
 * 
 * @author AI Assistant
 * @created 2025-09-05
 */

class PaginationLoader {
    constructor() {
        this.instances = new Map();
        this.isInitialized = false;
    }

    /**
     * 페이지네이션 컴포넌트 로드 및 초기화
     * @param {string} containerId - 컨테이너 ID
     * @param {Object} options - 설정 옵션
     * @returns {Promise<Object>} 페이지네이션 인스턴스
     */
    async loadPagination(containerId, options = {}) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container with ID '${containerId}' not found`);
            }

            // 기본 설정
            const config = {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                pageSize: 10,
                pageSizeOptions: [10, 20, 50, 100],
                maxVisiblePages: 7,
                showPageSizeSelect: false,
                showPageJump: false,
                showInfo: true,
                showFirstLast: true,
                variant: 'default', // default, simple, minimal, compact, large
                mobileOnly: false,
                itemsLabel: 'items',
                loadingText: '로딩 중...',
                onPageChange: null,
                onPageSizeChange: null,
                ...options
            };

            // HTML 템플릿 로드
            if (!this.isInitialized) {
                await this.loadTemplate();
                this.isInitialized = true;
            }

            // 페이지네이션 인스턴스 생성
            const instance = await this.createInstance(container, config);
            this.instances.set(containerId, instance);

            return instance;

        } catch (error) {
            console.error('페이지네이션 로드 오류:', error);
            throw error;
        }
    }

    /**
     * HTML 템플릿 로드
     */
    async loadTemplate() {
        try {
            const response = await fetch('/components/pagination.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.template = await response.text();
        } catch (error) {
            console.error('페이지네이션 템플릿 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 페이지네이션 인스턴스 생성
     * @param {HTMLElement} container - 컨테이너 엘리먼트
     * @param {Object} config - 설정
     * @returns {Object} 인스턴스
     */
    async createInstance(container, config) {
        // 템플릿 삽입
        container.innerHTML = this.template;

        // 페이지네이션 엘리먼트 설정
        const paginationEl = container.querySelector('.wave-pagination');
        
        // 변형 클래스 적용
        if (config.variant !== 'default') {
            paginationEl.classList.add(config.variant);
        }

        // 모바일 전용 설정
        if (config.mobileOnly) {
            paginationEl.classList.add('mobile-only');
        }

        // 인스턴스 객체 생성
        const instance = {
            container,
            config,
            elements: this.getElements(container),
            
            // 공개 메서드
            update: (newConfig) => this.updatePagination(instance, newConfig),
            setPage: (page) => this.setCurrentPage(instance, page),
            setPageSize: (size) => this.setPageSize(instance, size),
            setTotal: (total) => this.setTotalItems(instance, total),
            show: () => this.showPagination(instance),
            hide: () => this.hidePagination(instance),
            showLoading: () => this.showLoading(instance),
            hideLoading: () => this.hideLoading(instance),
            destroy: () => this.destroyInstance(container.id)
        };

        // 이벤트 리스너 설정
        this.setupEventListeners(instance);

        // 초기 렌더링
        this.renderPagination(instance);

        return instance;
    }

    /**
     * DOM 엘리먼트 참조 가져오기
     * @param {HTMLElement} container - 컨테이너
     * @returns {Object} 엘리먼트 참조
     */
    getElements(container) {
        return {
            pagination: container.querySelector('.wave-pagination'),
            info: container.querySelector('#pagination-info'),
            currentRange: container.querySelector('#pagination-current-range'),
            totalCount: container.querySelector('#pagination-total-count'),
            itemsLabel: container.querySelector('#pagination-items-label'),
            sizeContainer: container.querySelector('#pagination-size'),
            sizeSelect: container.querySelector('#pagination-size-select'),
            jumpContainer: container.querySelector('#pagination-jump'),
            jumpInput: container.querySelector('#pagination-jump-input'),
            jumpBtn: container.querySelector('#pagination-jump-btn'),
            firstBtn: container.querySelector('#pagination-first'),
            prevBtn: container.querySelector('#pagination-prev'),
            nextBtn: container.querySelector('#pagination-next'),
            lastBtn: container.querySelector('#pagination-last'),
            pagesContainer: container.querySelector('#pagination-pages'),
            mobileContainer: container.querySelector('#pagination-mobile'),
            mobilePrev: container.querySelector('#pagination-mobile-prev'),
            mobileNext: container.querySelector('#pagination-mobile-next'),
            mobileCurrent: container.querySelector('#pagination-mobile-current'),
            mobileTotal: container.querySelector('#pagination-mobile-total'),
            loading: container.querySelector('#pagination-loading')
        };
    }

    /**
     * 이벤트 리스너 설정
     * @param {Object} instance - 인스턴스
     */
    setupEventListeners(instance) {
        const { elements, config } = instance;

        // 첫 페이지 버튼
        elements.firstBtn?.addEventListener('click', () => {
            this.setCurrentPage(instance, 1);
        });

        // 이전 페이지 버튼
        elements.prevBtn?.addEventListener('click', () => {
            if (config.currentPage > 1) {
                this.setCurrentPage(instance, config.currentPage - 1);
            }
        });

        // 다음 페이지 버튼
        elements.nextBtn?.addEventListener('click', () => {
            if (config.currentPage < config.totalPages) {
                this.setCurrentPage(instance, config.currentPage + 1);
            }
        });

        // 마지막 페이지 버튼
        elements.lastBtn?.addEventListener('click', () => {
            this.setCurrentPage(instance, config.totalPages);
        });

        // 페이지 사이즈 변경
        elements.sizeSelect?.addEventListener('change', (e) => {
            this.setPageSize(instance, parseInt(e.target.value));
        });

        // 페이지 점프
        elements.jumpBtn?.addEventListener('click', () => {
            const page = parseInt(elements.jumpInput.value);
            if (page >= 1 && page <= config.totalPages) {
                this.setCurrentPage(instance, page);
                elements.jumpInput.value = '';
            }
        });

        elements.jumpInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.jumpBtn.click();
            }
        });

        // 모바일 버튼
        elements.mobilePrev?.addEventListener('click', () => {
            if (config.currentPage > 1) {
                this.setCurrentPage(instance, config.currentPage - 1);
            }
        });

        elements.mobileNext?.addEventListener('click', () => {
            if (config.currentPage < config.totalPages) {
                this.setCurrentPage(instance, config.currentPage + 1);
            }
        });
    }

    /**
     * 페이지네이션 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderPagination(instance) {
        const { config, elements } = instance;
        
        // 총 페이지 수 계산
        config.totalPages = Math.max(1, Math.ceil(config.totalItems / config.pageSize));
        
        // 현재 페이지 유효성 검사
        config.currentPage = Math.max(1, Math.min(config.currentPage, config.totalPages));

        // 페이지 정보 업데이트
        this.updatePageInfo(instance);

        // 페이지 번호 버튼 렌더링
        this.renderPageNumbers(instance);

        // 내비게이션 버튼 상태 업데이트
        this.updateNavigationButtons(instance);

        // 페이지 사이즈 선택 업데이트
        this.updatePageSizeSelect(instance);

        // 점프 입력 최대값 설정
        if (elements.jumpInput) {
            elements.jumpInput.max = config.totalPages;
        }

        // 선택적 엘리먼트 표시/숨김
        this.updateOptionalElements(instance);

        // 모바일 페이지네이션 업데이트
        this.updateMobilePagination(instance);
    }

    /**
     * 페이지 정보 업데이트
     * @param {Object} instance - 인스턴스
     */
    updatePageInfo(instance) {
        const { config, elements } = instance;
        
        if (elements.currentRange && elements.totalCount && elements.itemsLabel) {
            const start = Math.min((config.currentPage - 1) * config.pageSize + 1, config.totalItems);
            const end = Math.min(config.currentPage * config.pageSize, config.totalItems);
            
            elements.currentRange.textContent = config.totalItems === 0 ? '0' : `${start}-${end}`;
            elements.totalCount.textContent = config.totalItems.toLocaleString();
            elements.itemsLabel.textContent = config.itemsLabel;
        }
    }

    /**
     * 페이지 번호 버튼 렌더링
     * @param {Object} instance - 인스턴스
     */
    renderPageNumbers(instance) {
        const { config, elements } = instance;
        
        if (!elements.pagesContainer) return;

        elements.pagesContainer.innerHTML = '';

        if (config.totalPages <= 1) return;

        const { currentPage, totalPages, maxVisiblePages } = config;
        
        // 표시할 페이지 범위 계산
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // 끝 페이지 기준으로 시작 페이지 재조정
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // 첫 페이지와 생략 표시
        if (startPage > 1) {
            this.createPageButton(elements.pagesContainer, 1, currentPage, instance);
            if (startPage > 2) {
                this.createEllipsis(elements.pagesContainer);
            }
        }

        // 페이지 번호 버튼들
        for (let page = startPage; page <= endPage; page++) {
            this.createPageButton(elements.pagesContainer, page, currentPage, instance);
        }

        // 마지막 페이지와 생략 표시
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                this.createEllipsis(elements.pagesContainer);
            }
            this.createPageButton(elements.pagesContainer, totalPages, currentPage, instance);
        }
    }

    /**
     * 페이지 버튼 생성
     * @param {HTMLElement} container - 컨테이너
     * @param {number} page - 페이지 번호
     * @param {number} currentPage - 현재 페이지
     * @param {Object} instance - 인스턴스
     */
    createPageButton(container, page, currentPage, instance) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `page-btn${page === currentPage ? ' active' : ''}`;
        button.textContent = page;
        button.setAttribute('aria-label', `${page}페이지로 이동`);
        
        if (page === currentPage) {
            button.setAttribute('aria-current', 'page');
        }

        button.addEventListener('click', () => {
            this.setCurrentPage(instance, page);
        });

        container.appendChild(button);
    }

    /**
     * 생략 표시 생성
     * @param {HTMLElement} container - 컨테이너
     */
    createEllipsis(container) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'page-ellipsis';
        ellipsis.textContent = '...';
        ellipsis.setAttribute('aria-hidden', 'true');
        container.appendChild(ellipsis);
    }

    /**
     * 내비게이션 버튼 상태 업데이트
     * @param {Object} instance - 인스턴스
     */
    updateNavigationButtons(instance) {
        const { config, elements } = instance;

        // 첫 페이지, 이전 페이지 버튼
        const isFirstPage = config.currentPage <= 1;
        if (elements.firstBtn) elements.firstBtn.disabled = isFirstPage;
        if (elements.prevBtn) elements.prevBtn.disabled = isFirstPage;

        // 마지막 페이지, 다음 페이지 버튼
        const isLastPage = config.currentPage >= config.totalPages;
        if (elements.nextBtn) elements.nextBtn.disabled = isLastPage;
        if (elements.lastBtn) elements.lastBtn.disabled = isLastPage;
    }

    /**
     * 페이지 사이즈 선택 업데이트
     * @param {Object} instance - 인스턴스
     */
    updatePageSizeSelect(instance) {
        const { config, elements } = instance;
        
        if (!elements.sizeSelect) return;

        elements.sizeSelect.innerHTML = '';
        config.pageSizeOptions.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            option.selected = size === config.pageSize;
            elements.sizeSelect.appendChild(option);
        });
    }

    /**
     * 선택적 엘리먼트 표시/숨김
     * @param {Object} instance - 인스턴스
     */
    updateOptionalElements(instance) {
        const { config, elements } = instance;

        // 페이지 사이즈 선택
        if (elements.sizeContainer) {
            elements.sizeContainer.style.display = config.showPageSizeSelect ? 'flex' : 'none';
        }

        // 페이지 점프
        if (elements.jumpContainer) {
            elements.jumpContainer.style.display = config.showPageJump ? 'flex' : 'none';
        }

        // 페이지 정보
        if (elements.info) {
            elements.info.style.display = config.showInfo ? 'flex' : 'none';
        }

        // 첫/마지막 페이지 버튼
        const showFirstLast = config.showFirstLast && config.totalPages > 1;
        if (elements.firstBtn) elements.firstBtn.style.display = showFirstLast ? 'flex' : 'none';
        if (elements.lastBtn) elements.lastBtn.style.display = showFirstLast ? 'flex' : 'none';
    }

    /**
     * 모바일 페이지네이션 업데이트
     * @param {Object} instance - 인스턴스
     */
    updateMobilePagination(instance) {
        const { config, elements } = instance;

        if (!elements.mobileContainer) return;

        if (elements.mobileCurrent) {
            elements.mobileCurrent.textContent = config.currentPage;
        }
        if (elements.mobileTotal) {
            elements.mobileTotal.textContent = config.totalPages;
        }

        // 모바일 버튼 상태
        if (elements.mobilePrev) {
            elements.mobilePrev.disabled = config.currentPage <= 1;
        }
        if (elements.mobileNext) {
            elements.mobileNext.disabled = config.currentPage >= config.totalPages;
        }
    }

    /**
     * 현재 페이지 설정
     * @param {Object} instance - 인스턴스
     * @param {number} page - 페이지 번호
     */
    setCurrentPage(instance, page) {
        const oldPage = instance.config.currentPage;
        instance.config.currentPage = page;
        
        this.renderPagination(instance);
        
        // 페이지 변경 콜백 실행
        if (instance.config.onPageChange && oldPage !== page) {
            instance.config.onPageChange(page, oldPage, instance.config);
        }
    }

    /**
     * 페이지 사이즈 설정
     * @param {Object} instance - 인스턴스
     * @param {number} size - 페이지 사이즈
     */
    setPageSize(instance, size) {
        const oldSize = instance.config.pageSize;
        instance.config.pageSize = size;
        instance.config.currentPage = 1; // 첫 페이지로 리셋
        
        this.renderPagination(instance);
        
        // 페이지 사이즈 변경 콜백 실행
        if (instance.config.onPageSizeChange && oldSize !== size) {
            instance.config.onPageSizeChange(size, oldSize, instance.config);
        }
    }

    /**
     * 총 아이템 수 설정
     * @param {Object} instance - 인스턴스
     * @param {number} total - 총 아이템 수
     */
    setTotalItems(instance, total) {
        instance.config.totalItems = total;
        this.renderPagination(instance);
    }

    /**
     * 페이지네이션 설정 업데이트
     * @param {Object} instance - 인스턴스
     * @param {Object} newConfig - 새 설정
     */
    updatePagination(instance, newConfig) {
        Object.assign(instance.config, newConfig);
        this.renderPagination(instance);
    }

    /**
     * 페이지네이션 표시
     * @param {Object} instance - 인스턴스
     */
    showPagination(instance) {
        if (instance.elements.pagination) {
            instance.elements.pagination.style.display = 'flex';
        }
    }

    /**
     * 페이지네이션 숨김
     * @param {Object} instance - 인스턴스
     */
    hidePagination(instance) {
        if (instance.elements.pagination) {
            instance.elements.pagination.style.display = 'none';
        }
    }

    /**
     * 로딩 상태 표시
     * @param {Object} instance - 인스턴스
     */
    showLoading(instance) {
        if (instance.elements.loading) {
            instance.elements.loading.style.display = 'flex';
        }
    }

    /**
     * 로딩 상태 숨김
     * @param {Object} instance - 인스턴스
     */
    hideLoading(instance) {
        if (instance.elements.loading) {
            instance.elements.loading.style.display = 'none';
        }
    }

    /**
     * 인스턴스 제거
     * @param {string} containerId - 컨테이너 ID
     */
    destroyInstance(containerId) {
        if (this.instances.has(containerId)) {
            const instance = this.instances.get(containerId);
            
            // 이벤트 리스너 정리는 DOM 제거 시 자동으로 처리됨
            instance.container.innerHTML = '';
            
            this.instances.delete(containerId);
        }
    }

    /**
     * 특정 인스턴스 가져오기
     * @param {string} containerId - 컨테이너 ID
     * @returns {Object|null} 인스턴스
     */
    getInstance(containerId) {
        return this.instances.get(containerId) || null;
    }

    /**
     * 모든 인스턴스 제거
     */
    destroyAll() {
        this.instances.forEach((instance, containerId) => {
            this.destroyInstance(containerId);
        });
    }
}

// 전역 인스턴스 생성
const paginationLoader = new PaginationLoader();

// 모듈 시스템 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaginationLoader;
}

// 전역 사용을 위한 window 객체 등록
if (typeof window !== 'undefined') {
    window.PaginationLoader = PaginationLoader;
    window.paginationLoader = paginationLoader;
}

/**
 * 사용 예시:
 * 
 * // 기본 페이지네이션
 * const pagination = await paginationLoader.loadPagination('pagination-container', {
 *     totalItems: 1000,
 *     pageSize: 20,
 *     onPageChange: (page, oldPage, config) => {
 *         console.log(`페이지 ${oldPage} → ${page}`);
 *         // 데이터 로드 로직
 *     }
 * });
 * 
 * // 고급 페이지네이션
 * const advancedPagination = await paginationLoader.loadPagination('advanced-pagination', {
 *     totalItems: 5000,
 *     pageSize: 50,
 *     showPageSizeSelect: true,
 *     showPageJump: true,
 *     variant: 'compact',
 *     pageSizeOptions: [25, 50, 100, 200],
 *     onPageChange: async (page) => {
 *         pagination.showLoading();
 *         const data = await fetchData(page);
 *         renderData(data);
 *         pagination.hideLoading();
 *     },
 *     onPageSizeChange: (newSize, oldSize) => {
 *         console.log(`페이지 크기 ${oldSize} → ${newSize}`);
 *     }
 * });
 * 
 * // 동적 업데이트
 * pagination.update({
 *     totalItems: 1500,
 *     currentPage: 1
 * });
 * 
 * // 특정 페이지로 이동
 * pagination.setPage(5);
 * 
 * // 페이지 사이즈 변경
 * pagination.setPageSize(100);
 */