/**
 * TabNavigation 컴포넌트 로더
 * 탭 네비게이션 통합 시스템
 */

class TabNavigationLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.container = null;
        this.tabs = [];
        this.activeTabIndex = 0;
        this.isScrollable = false;
        this.isMobileMenuOpen = false;
        
        // 이벤트 바인딩을 위한 컨텍스트 유지
        this.handleTabClick = this.handleTabClick.bind(this);
        this.handleTabClose = this.handleTabClose.bind(this);
        this.handleScrollLeft = this.handleScrollLeft.bind(this);
        this.handleScrollRight = this.handleScrollRight.bind(this);
        this.handleMobileMenuToggle = this.handleMobileMenuToggle.bind(this);
        this.handleDropdownClick = this.handleDropdownClick.bind(this);
        this.handleDropdownClose = this.handleDropdownClose.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    /**
     * TabNavigation 로드 및 초기화
     * @param {Object} config - 탭 네비게이션 설정
     * @param {Array} config.tabs - 탭 데이터 배열
     * @param {number} config.activeTab - 초기 활성 탭 인덱스
     * @param {string} config.style - 탭 스타일 ('default', 'pills', 'vertical')
     * @param {boolean} config.closable - 탭 닫기 가능 여부
     * @param {boolean} config.lazy - 지연 로딩 여부
     * @param {Function} config.onTabChange - 탭 변경 콜백
     * @param {Function} config.onTabClose - 탭 닫기 콜백
     * @param {Function} config.onTabLoad - 탭 로드 콜백 (지연 로딩 시)
     * @param {string} containerId - 컨테이너 ID
     * @returns {Promise<void>}
     */
    async load(config, containerId) {
        try {
            // 기본값 설정
            const defaultConfig = {
                tabs: [],
                activeTab: 0,
                style: 'default',
                closable: false,
                lazy: false,
                onTabChange: null,
                onTabClose: null,
                onTabLoad: null
            };

            config = { ...defaultConfig, ...config };

            // 컨테이너 확인
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`[TabNavigationLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                return;
            }

            // 탭 데이터 확인
            if (!config.tabs || config.tabs.length === 0) {
                console.warn('[TabNavigationLoader] 탭 데이터가 없습니다.');
                return;
            }

            // CSS 로드
            await this.loadCSS();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 컨테이너에 템플릿 삽입
            this.container.innerHTML = template;

            // 탭 데이터 저장
            this.tabs = config.tabs;
            this.activeTabIndex = Math.max(0, Math.min(config.activeTab, this.tabs.length - 1));

            // 스타일 적용
            this.applyStyle(config.style);

            // 탭 생성
            this.createTabs();

            // 콘텐츠 생성
            this.createTabPanels();

            // 첫 번째 탭 활성화
            this.activateTab(this.activeTabIndex);

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 스크롤 상태 확인
            this.checkScrollable();

            // 설정 저장
            this.currentConfig = config;
            this.isLoaded = true;

            console.log(`✅ TabNavigation 로드 완료: ${this.tabs.length}개 탭`);
            
        } catch (error) {
            console.error('[TabNavigationLoader] 로드 실패:', error);
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'tab-navigation-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/tab-navigation.css?v=' + Date.now();
        document.head.appendChild(link);

        // CSS 로드 완료 대기
        await new Promise((resolve) => {
            link.onload = resolve;
            setTimeout(resolve, 100); // 타임아웃
        });
    }

    /**
     * HTML 템플릿 로드
     */
    async loadTemplate() {
        const response = await fetch('components/tab-navigation.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 스타일 적용
     */
    applyStyle(style) {
        const component = document.getElementById('wave-tab-navigation');
        if (component && style !== 'default') {
            component.classList.add(style);
        }
    }

    /**
     * 탭 생성
     */
    createTabs() {
        const tabList = document.getElementById('tab-list');
        if (!tabList) return;

        tabList.innerHTML = '';

        this.tabs.forEach((tab, index) => {
            const tabElement = document.createElement('button');
            tabElement.className = 'tab-item';
            tabElement.setAttribute('role', 'tab');
            tabElement.setAttribute('aria-selected', 'false');
            tabElement.setAttribute('aria-controls', `tab-panel-${index}`);
            tabElement.setAttribute('id', `tab-${index}`);
            tabElement.setAttribute('data-index', index);

            if (tab.disabled) {
                tabElement.classList.add('disabled');
                tabElement.disabled = true;
            }

            // 탭 내용 구성
            let tabContent = '';
            
            if (tab.icon) {
                tabContent += `<i class="${tab.icon}"></i>`;
            }
            
            tabContent += `<span class="tab-label">${this.escapeHtml(tab.label)}</span>`;
            
            if (tab.badge) {
                tabContent += `<span class="tab-badge">${tab.badge}</span>`;
            }
            
            if (this.currentConfig?.closable) {
                tabContent += `
                    <button type="button" class="tab-close" data-index="${index}" title="탭 닫기">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }

            tabElement.innerHTML = tabContent;
            
            // 클릭 이벤트
            tabElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-close')) {
                    e.stopPropagation();
                    this.handleTabClose(index);
                } else {
                    this.handleTabClick(index);
                }
            });

            tabList.appendChild(tabElement);
        });
    }

    /**
     * 탭 패널 생성
     */
    createTabPanels() {
        const tabContent = document.getElementById('tab-content');
        if (!tabContent) return;

        tabContent.innerHTML = '';

        this.tabs.forEach((tab, index) => {
            const panel = document.createElement('div');
            panel.className = 'tab-panel';
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', `tab-${index}`);
            panel.setAttribute('id', `tab-panel-${index}`);
            panel.setAttribute('data-index', index);

            if (tab.content) {
                if (typeof tab.content === 'string') {
                    panel.innerHTML = tab.content;
                } else if (tab.content instanceof HTMLElement) {
                    panel.appendChild(tab.content);
                }
            } else if (this.currentConfig?.lazy) {
                panel.innerHTML = '<div class="tab-placeholder">콘텐츠를 불러오고 있습니다...</div>';
            }

            tabContent.appendChild(panel);
        });
    }

    /**
     * 드롭다운 메뉴 생성 (모바일)
     */
    createDropdownItems() {
        const dropdownItems = document.getElementById('dropdown-items');
        if (!dropdownItems) return;

        dropdownItems.innerHTML = '';

        this.tabs.forEach((tab, index) => {
            const item = document.createElement('button');
            item.className = 'dropdown-item';
            item.setAttribute('data-index', index);
            
            if (index === this.activeTabIndex) {
                item.classList.add('active');
            }

            if (tab.disabled) {
                item.disabled = true;
            }

            let itemContent = '';
            if (tab.icon) {
                itemContent += `<i class="${tab.icon}"></i>`;
            }
            itemContent += `<span>${this.escapeHtml(tab.label)}</span>`;

            item.innerHTML = itemContent;
            
            item.addEventListener('click', () => {
                this.handleDropdownClick(index);
            });

            dropdownItems.appendChild(item);
        });
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 스크롤 버튼
        const scrollLeft = document.getElementById('tab-scroll-left');
        const scrollRight = document.getElementById('tab-scroll-right');
        if (scrollLeft) scrollLeft.addEventListener('click', this.handleScrollLeft);
        if (scrollRight) scrollRight.addEventListener('click', this.handleScrollRight);

        // 모바일 메뉴 토글
        const menuToggle = document.getElementById('menu-toggle-btn');
        if (menuToggle) menuToggle.addEventListener('click', this.handleMobileMenuToggle);

        // 드롭다운 닫기
        const dropdownBackdrop = document.getElementById('dropdown-backdrop');
        const dropdownClose = document.getElementById('dropdown-close');
        if (dropdownBackdrop) dropdownBackdrop.addEventListener('click', this.handleDropdownClose);
        if (dropdownClose) dropdownClose.addEventListener('click', this.handleDropdownClose);

        // 키보드 네비게이션
        document.addEventListener('keydown', this.handleKeyDown);

        // 창 크기 변경
        window.addEventListener('resize', this.handleResize);

        // 탭 리스트 스크롤 이벤트
        const tabList = document.getElementById('tab-list');
        if (tabList) {
            tabList.addEventListener('scroll', () => {
                this.updateScrollButtons();
            });
        }
    }

    /**
     * 탭 활성화
     */
    async activateTab(index) {
        if (index < 0 || index >= this.tabs.length) return;
        if (this.tabs[index].disabled) return;

        // 이전 탭 비활성화
        this.deactivateCurrentTab();

        // 새 탭 활성화
        this.activeTabIndex = index;
        
        const tabElement = document.getElementById(`tab-${index}`);
        const panelElement = document.getElementById(`tab-panel-${index}`);
        
        if (tabElement) {
            tabElement.classList.add('active');
            tabElement.setAttribute('aria-selected', 'true');
        }
        
        if (panelElement) {
            panelElement.classList.add('active');
            
            // 지연 로딩
            if (this.currentConfig?.lazy && !this.tabs[index].loaded) {
                await this.loadTabContent(index);
            }
        }

        // 활성 탭이 보이도록 스크롤
        this.scrollToActiveTab();

        // 콜백 호출
        if (this.currentConfig?.onTabChange) {
            this.currentConfig.onTabChange(this.tabs[index], index);
        }

        console.log(`탭 활성화: ${this.tabs[index].label} (${index})`);
    }

    /**
     * 현재 탭 비활성화
     */
    deactivateCurrentTab() {
        const currentTab = document.getElementById(`tab-${this.activeTabIndex}`);
        const currentPanel = document.getElementById(`tab-panel-${this.activeTabIndex}`);
        
        if (currentTab) {
            currentTab.classList.remove('active');
            currentTab.setAttribute('aria-selected', 'false');
        }
        
        if (currentPanel) {
            currentPanel.classList.remove('active');
        }
    }

    /**
     * 탭 콘텐츠 로드 (지연 로딩)
     */
    async loadTabContent(index) {
        if (!this.currentConfig?.onTabLoad) return;

        this.showLoading();

        try {
            const content = await this.currentConfig.onTabLoad(this.tabs[index], index);
            const panel = document.getElementById(`tab-panel-${index}`);
            
            if (panel && content) {
                if (typeof content === 'string') {
                    panel.innerHTML = content;
                } else if (content instanceof HTMLElement) {
                    panel.innerHTML = '';
                    panel.appendChild(content);
                }
                
                this.tabs[index].loaded = true;
                this.tabs[index].content = content;
            }
            
        } catch (error) {
            console.error(`[TabNavigationLoader] 탭 콘텐츠 로드 실패: ${index}`, error);
            const panel = document.getElementById(`tab-panel-${index}`);
            if (panel) {
                panel.innerHTML = '<div class="tab-error">콘텐츠를 불러올 수 없습니다.</div>';
            }
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 이벤트 핸들러들
     */
    handleTabClick(index) {
        this.activateTab(index);
    }

    handleTabClose(index) {
        if (this.currentConfig?.onTabClose) {
            const shouldClose = this.currentConfig.onTabClose(this.tabs[index], index);
            if (shouldClose !== false) {
                this.closeTab(index);
            }
        } else {
            this.closeTab(index);
        }
    }

    handleScrollLeft() {
        const tabList = document.getElementById('tab-list');
        if (tabList) {
            tabList.scrollBy({ left: -200, behavior: 'smooth' });
        }
    }

    handleScrollRight() {
        const tabList = document.getElementById('tab-list');
        if (tabList) {
            tabList.scrollBy({ left: 200, behavior: 'smooth' });
        }
    }

    handleMobileMenuToggle() {
        if (this.isMobileMenuOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    handleDropdownClick(index) {
        this.activateTab(index);
        this.closeDropdown();
    }

    handleDropdownClose() {
        this.closeDropdown();
    }

    handleKeyDown(e) {
        if (!this.isLoaded) return;

        const focusedElement = document.activeElement;
        const isTabFocused = focusedElement && focusedElement.classList.contains('tab-item');

        if (isTabFocused) {
            switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateTab(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigateTab(1);
                break;
            case 'Home':
                e.preventDefault();
                this.focusTab(0);
                break;
            case 'End':
                e.preventDefault();
                this.focusTab(this.tabs.length - 1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                const index = parseInt(focusedElement.getAttribute('data-index'));
                this.activateTab(index);
                break;
            }
        }
    }

    handleResize() {
        this.checkScrollable();
        this.updateScrollButtons();
    }

    /**
     * 유틸리티 메서드들
     */
    navigateTab(direction) {
        const currentIndex = parseInt(document.activeElement.getAttribute('data-index'));
        let newIndex = currentIndex + direction;
        
        // 비활성 탭 건너뛰기
        while (newIndex >= 0 && newIndex < this.tabs.length && this.tabs[newIndex].disabled) {
            newIndex += direction;
        }
        
        if (newIndex >= 0 && newIndex < this.tabs.length) {
            this.focusTab(newIndex);
        }
    }

    focusTab(index) {
        const tabElement = document.getElementById(`tab-${index}`);
        if (tabElement && !tabElement.disabled) {
            tabElement.focus();
        }
    }

    scrollToActiveTab() {
        const tabElement = document.getElementById(`tab-${this.activeTabIndex}`);
        const tabList = document.getElementById('tab-list');
        
        if (tabElement && tabList && this.isScrollable) {
            const tabRect = tabElement.getBoundingClientRect();
            const listRect = tabList.getBoundingClientRect();
            
            if (tabRect.left < listRect.left || tabRect.right > listRect.right) {
                tabElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }
        }
    }

    checkScrollable() {
        const tabList = document.getElementById('tab-list');
        const scrollControls = document.getElementById('tab-scroll-controls');
        
        if (tabList && scrollControls) {
            this.isScrollable = tabList.scrollWidth > tabList.clientWidth;
            scrollControls.style.display = this.isScrollable ? 'flex' : 'none';
        }
    }

    updateScrollButtons() {
        const tabList = document.getElementById('tab-list');
        const scrollLeft = document.getElementById('tab-scroll-left');
        const scrollRight = document.getElementById('tab-scroll-right');
        
        if (tabList && scrollLeft && scrollRight) {
            scrollLeft.disabled = tabList.scrollLeft <= 0;
            scrollRight.disabled = tabList.scrollLeft >= tabList.scrollWidth - tabList.clientWidth;
        }
    }

    openDropdown() {
        const dropdown = document.getElementById('tab-dropdown');
        const menuToggle = document.getElementById('menu-toggle-btn');
        
        if (dropdown && menuToggle) {
            this.createDropdownItems();
            dropdown.style.display = 'block';
            menuToggle.classList.add('active');
            this.isMobileMenuOpen = true;
        }
    }

    closeDropdown() {
        const dropdown = document.getElementById('tab-dropdown');
        const menuToggle = document.getElementById('menu-toggle-btn');
        
        if (dropdown && menuToggle) {
            dropdown.style.display = 'none';
            menuToggle.classList.remove('active');
            this.isMobileMenuOpen = false;
        }
    }

    showLoading() {
        const loading = document.getElementById('tab-loading');
        if (loading) loading.style.display = 'flex';
    }

    hideLoading() {
        const loading = document.getElementById('tab-loading');
        if (loading) loading.style.display = 'none';
    }

    /**
     * 공개 API 메서드들
     */
    addTab(tab, index = -1) {
        if (index < 0 || index > this.tabs.length) {
            index = this.tabs.length;
        }
        
        this.tabs.splice(index, 0, tab);
        this.createTabs();
        this.createTabPanels();
        this.checkScrollable();
        
        console.log(`탭 추가: ${tab.label} (${index})`);
    }

    removeTab(index) {
        if (index >= 0 && index < this.tabs.length) {
            this.closeTab(index);
        }
    }

    closeTab(index) {
        if (this.tabs.length <= 1) return; // 마지막 탭은 닫을 수 없음
        
        const closedTab = this.tabs[index];
        this.tabs.splice(index, 1);
        
        // 활성 탭 인덱스 조정
        if (index === this.activeTabIndex) {
            this.activeTabIndex = Math.min(index, this.tabs.length - 1);
        } else if (index < this.activeTabIndex) {
            this.activeTabIndex--;
        }
        
        this.createTabs();
        this.createTabPanels();
        this.activateTab(this.activeTabIndex);
        this.checkScrollable();
        
        console.log(`탭 닫기: ${closedTab.label} (${index})`);
    }

    getActiveTab() {
        return {
            tab: this.tabs[this.activeTabIndex],
            index: this.activeTabIndex
        };
    }

    setActiveTab(index) {
        this.activateTab(index);
    }

    updateTab(index, updates) {
        if (index >= 0 && index < this.tabs.length) {
            Object.assign(this.tabs[index], updates);
            this.createTabs();
            
            if (updates.content && document.getElementById(`tab-panel-${index}`)) {
                this.createTabPanels();
            }
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 컴포넌트 제거
     */
    destroy() {
        // 이벤트 리스너 제거
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.handleResize);
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.isLoaded = false;
        this.currentConfig = null;
        this.tabs = [];
        this.activeTabIndex = 0;
        this.isMobileMenuOpen = false;
    }
}

// 전역 인스턴스 생성
window.TabNavigationLoader = TabNavigationLoader;

/**
 * 사용 예시:
 * 
 * const tabNavigation = new TabNavigationLoader();
 * 
 * await tabNavigation.load({
 *     tabs: [
 *         {
 *             id: 'overview',
 *             label: '개요',
 *             icon: 'fa-chart-line',
 *             content: '<div>개요 콘텐츠</div>',
 *             badge: 3
 *         },
 *         {
 *             id: 'details',
 *             label: '상세정보',
 *             icon: 'fa-info-circle',
 *             content: '<div>상세정보 콘텐츠</div>'
 *         },
 *         {
 *             id: 'settings',
 *             label: '설정',
 *             icon: 'fa-cog',
 *             disabled: true
 *         }
 *     ],
 *     activeTab: 0,
 *     style: 'pills',
 *     closable: true,
 *     lazy: true,
 *     onTabChange: (tab, index) => {
 *         console.log('탭 변경:', tab.label, index);
 *     },
 *     onTabClose: (tab, index) => {
 *         return confirm(`"${tab.label}" 탭을 닫으시겠습니까?`);
 *     },
 *     onTabLoad: async (tab, index) => {
 *         // 지연 로딩 시 콘텐츠 반환
 *         const response = await fetch(`/api/tab-content/${tab.id}`);
 *         return await response.text();
 *     }
 * }, 'tab-container');
 */

export default TabNavigationLoader;