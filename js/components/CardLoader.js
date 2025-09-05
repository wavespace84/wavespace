/**
 * Card 컴포넌트 로더
 * 범용 카드 통합 시스템
 */

class CardLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.container = null;
        this.dropdownOpen = false;
        
        // 이벤트 바인딩을 위한 컨텍스트 유지
        this.handleCardClick = this.handleCardClick.bind(this);
        this.handleActionClick = this.handleActionClick.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleDropdownClick = this.handleDropdownClick.bind(this);
        this.handleDropdownClose = this.handleDropdownClose.bind(this);
        this.handleStatClick = this.handleStatClick.bind(this);
        this.handleTagClick = this.handleTagClick.bind(this);
    }

    /**
     * Card 로드 및 초기화
     * @param {Object} config - 카드 설정
     * @param {string} config.id - 카드 ID
     * @param {string} config.title - 카드 제목
     * @param {string} config.description - 카드 설명
     * @param {string} config.url - 카드 링크 URL
     * @param {Object} config.image - 이미지 정보
     * @param {string} config.image.src - 이미지 URL
     * @param {string} config.image.alt - 이미지 alt 텍스트
     * @param {Object} config.image.overlay - 오버레이 설정
     * @param {Object} config.badge - 뱃지 정보
     * @param {string} config.badge.text - 뱃지 텍스트
     * @param {string} config.badge.type - 뱃지 타입
     * @param {Object} config.header - 헤더 정보
     * @param {Object} config.avatar - 아바타 정보
     * @param {Array} config.tags - 태그 배열
     * @param {Object} config.stats - 통계 정보
     * @param {Object} config.progress - 진행률 정보
     * @param {Object} config.price - 가격 정보
     * @param {Object} config.user - 사용자 정보
     * @param {Object} config.footer - 푸터 정보
     * @param {Array} config.actions - 액션 메뉴 배열
     * @param {string} config.variant - 카드 변형 ('compact', 'horizontal', 'outlined', 'elevated')
     * @param {Function} config.onClick - 카드 클릭 콜백
     * @param {Function} config.onActionClick - 액션 버튼 클릭 콜백
     * @param {Function} config.onStatClick - 통계 클릭 콜백
     * @param {Function} config.onTagClick - 태그 클릭 콜백
     * @param {string} containerId - 컨테이너 ID
     * @returns {Promise<void>}
     */
    async load(config, containerId) {
        try {
            // 기본값 설정
            const defaultConfig = {
                id: '',
                title: '카드 제목',
                description: '카드 설명',
                url: '#',
                image: null,
                badge: null,
                header: null,
                avatar: null,
                tags: [],
                stats: null,
                progress: null,
                price: null,
                user: null,
                footer: null,
                actions: [],
                variant: 'default',
                onClick: null,
                onActionClick: null,
                onStatClick: null,
                onTagClick: null
            };

            config = { ...defaultConfig, ...config };

            // 컨테이너 확인
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`[CardLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                return;
            }

            // CSS 로드
            await this.loadCSS();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 컨테이너에 템플릿 삽입
            this.container.innerHTML = template;

            // 설정 적용
            this.applyConfig(config);

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 설정 저장
            this.currentConfig = config;
            this.isLoaded = true;

            console.log(`✅ Card 로드 완료: ${config.title}`);
            
        } catch (error) {
            console.error('[CardLoader] 로드 실패:', error);
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'card-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/card.css?v=' + Date.now();
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
        const response = await fetch('components/card.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 설정 적용
     */
    applyConfig(config) {
        const card = document.getElementById('wave-card');
        
        // 카드 변형 적용
        if (card && config.variant !== 'default') {
            card.classList.add(config.variant);
        }

        // 기본 정보 설정
        this.setElementText('card-title-link', config.title);
        this.setElementText('card-description-text', config.description);
        this.setElementAttribute('card-title-link', 'href', config.url);

        // 이미지 설정
        this.setupImage(config.image);

        // 뱃지 설정
        this.setupBadge(config.badge);

        // 헤더 설정
        this.setupHeader(config.header);

        // 아바타 설정
        this.setupAvatar(config.avatar);

        // 태그 설정
        this.setupTags(config.tags);

        // 통계 설정
        this.setupStats(config.stats);

        // 진행률 설정
        this.setupProgress(config.progress);

        // 가격 설정
        this.setupPrice(config.price);

        // 사용자 정보 설정
        this.setupUser(config.user);

        // 푸터 설정
        this.setupFooter(config.footer);

        // 액션 메뉴 설정
        this.setupActions(config.actions);
    }

    /**
     * 이미지 설정
     */
    setupImage(image) {
        const imageSection = document.getElementById('card-image');
        const imageEl = document.getElementById('card-image-img');
        const overlay = document.getElementById('card-image-overlay');
        
        if (image && image.src) {
            imageSection.style.display = 'block';
            imageEl.src = image.src;
            imageEl.alt = image.alt || '';
            
            if (image.overlay) {
                overlay.style.display = 'flex';
                const overlayContent = document.getElementById('card-overlay-content');
                if (overlayContent) {
                    overlayContent.innerHTML = image.overlay.content || '';
                }
            }
        }
    }

    /**
     * 뱃지 설정
     */
    setupBadge(badge) {
        const badgeEl = document.getElementById('card-badge');
        const badgeText = document.getElementById('card-badge-text');
        
        if (badge && badge.text) {
            badgeEl.style.display = 'block';
            badgeText.textContent = badge.text;
            
            if (badge.type) {
                badgeEl.className = `card-badge ${badge.type}`;
            }
        }
    }

    /**
     * 헤더 설정
     */
    setupHeader(header) {
        const headerEl = document.getElementById('card-header');
        
        if (header) {
            headerEl.style.display = 'flex';
            
            if (header.subtitle) {
                this.setElementText('card-subtitle', header.subtitle);
            }
            
            if (header.date) {
                this.setElementText('card-date', header.date);
            }
            
            if (header.actions) {
                this.showElement('card-header-actions');
            }
        }
    }

    /**
     * 아바타 설정
     */
    setupAvatar(avatar) {
        const avatarEl = document.getElementById('card-avatar');
        const avatarImg = document.getElementById('card-avatar-img');
        const avatarFallback = document.getElementById('card-avatar-fallback');
        
        if (avatar) {
            avatarEl.style.display = 'block';
            
            if (avatar.src) {
                avatarImg.src = avatar.src;
                avatarImg.alt = avatar.alt || '';
                avatarImg.style.display = 'block';
                avatarFallback.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                avatarFallback.style.display = 'flex';
                
                if (avatar.fallbackIcon) {
                    const icon = avatarFallback.querySelector('i');
                    if (icon) icon.className = avatar.fallbackIcon;
                }
            }
        }
    }

    /**
     * 태그 설정
     */
    setupTags(tags) {
        const tagsEl = document.getElementById('card-tags');
        
        if (tags && tags.length > 0) {
            tagsEl.style.display = 'flex';
            tagsEl.innerHTML = '';
            
            tags.forEach(tag => {
                const tagElement = document.createElement('a');
                tagElement.className = 'card-tag';
                tagElement.textContent = typeof tag === 'string' ? tag : tag.text;
                tagElement.href = typeof tag === 'object' && tag.url ? tag.url : '#';
                tagElement.addEventListener('click', (e) => this.handleTagClick(e, tag));
                tagsEl.appendChild(tagElement);
            });
        }
    }

    /**
     * 통계 설정
     */
    setupStats(stats) {
        const statsEl = document.getElementById('card-stats');
        
        if (stats) {
            statsEl.style.display = 'block';
            
            const statTypes = ['views', 'likes', 'comments', 'downloads', 'shares'];
            statTypes.forEach(type => {
                if (stats[type] !== undefined) {
                    this.showElement(`card-${type}-stat`);
                    this.setElementText(`card-${type}-count`, stats[type]);
                }
            });
        }
    }

    /**
     * 진행률 설정
     */
    setupProgress(progress) {
        const progressEl = document.getElementById('card-progress');
        
        if (progress) {
            progressEl.style.display = 'block';
            
            if (progress.label) {
                this.setElementText('card-progress-label', progress.label);
            }
            
            const value = Math.max(0, Math.min(100, progress.value || 0));
            this.setElementText('card-progress-value', `${value}%`);
            this.setElementStyle('card-progress-fill', 'width', `${value}%`);
        }
    }

    /**
     * 가격 설정
     */
    setupPrice(price) {
        const priceEl = document.getElementById('card-price');
        
        if (price) {
            priceEl.style.display = 'flex';
            
            this.setElementText('card-price-amount', price.current || 0);
            if (price.currency) {
                this.setElementText('card-price-currency', price.currency);
            }
            
            if (price.original && price.original !== price.current) {
                this.showElement('card-original-price');
                this.setElementText('card-original-amount', price.original);
                
                const discountRate = Math.round((1 - price.current / price.original) * 100);
                if (discountRate > 0) {
                    this.showElement('card-discount');
                    this.setElementText('card-discount-rate', discountRate);
                }
            }
        }
    }

    /**
     * 사용자 정보 설정
     */
    setupUser(user) {
        const userEl = document.getElementById('card-user');
        
        if (user) {
            userEl.style.display = 'flex';
            
            if (user.name) {
                this.setElementText('card-user-name', user.name);
            }
            
            if (user.role) {
                this.setElementText('card-user-role', user.role);
            }
            
            if (user.avatar) {
                const avatarImg = document.getElementById('card-user-avatar');
                avatarImg.src = user.avatar;
            }
            
            if (user.badge) {
                this.showElement('card-user-badge');
                this.setElementText('card-user-badge-text', user.badge);
            }
        }
    }

    /**
     * 푸터 설정
     */
    setupFooter(footer) {
        const footerEl = document.getElementById('card-footer');
        
        if (footer) {
            footerEl.style.display = 'block';
            
            if (footer.primary) {
                const primaryBtn = document.getElementById('card-primary-action');
                primaryBtn.querySelector('span').textContent = footer.primary.text || '자세히 보기';
                
                if (footer.primary.icon) {
                    const icon = primaryBtn.querySelector('i');
                    icon.className = footer.primary.icon;
                }
            }
            
            if (footer.secondary) {
                const secondaryBtn = document.getElementById('card-secondary-action');
                secondaryBtn.querySelector('span').textContent = footer.secondary.text || '북마크';
                
                if (footer.secondary.icon) {
                    const icon = secondaryBtn.querySelector('i');
                    icon.className = footer.secondary.icon;
                }
            }
        }
    }

    /**
     * 액션 메뉴 설정
     */
    setupActions(actions) {
        if (actions && actions.length > 0) {
            const dropdownMenu = document.getElementById('card-dropdown-menu');
            dropdownMenu.innerHTML = '';
            
            actions.forEach(action => {
                const actionElement = document.createElement('button');
                actionElement.className = 'dropdown-item';
                actionElement.innerHTML = `
                    ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                    <span>${action.text}</span>
                `;
                actionElement.addEventListener('click', () => this.handleDropdownClick(action));
                dropdownMenu.appendChild(actionElement);
            });
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 카드 클릭
        const cardTitle = document.getElementById('card-title-link');
        if (cardTitle) {
            cardTitle.addEventListener('click', this.handleCardClick);
        }

        // 푸터 액션 버튼
        const primaryAction = document.getElementById('card-primary-action');
        const secondaryAction = document.getElementById('card-secondary-action');
        
        if (primaryAction) {
            primaryAction.addEventListener('click', (e) => this.handleActionClick(e, 'primary'));
        }
        
        if (secondaryAction) {
            secondaryAction.addEventListener('click', (e) => this.handleActionClick(e, 'secondary'));
        }

        // 메뉴 버튼
        const menuBtn = document.getElementById('card-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', this.handleMenuClick);
        }

        // 드롭다운 닫기
        const dropdownBackdrop = document.getElementById('card-dropdown-backdrop');
        if (dropdownBackdrop) {
            dropdownBackdrop.addEventListener('click', this.handleDropdownClose);
        }

        // 통계 클릭 (선택적)
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleStatClick(e, item));
        });
    }

    /**
     * 이벤트 핸들러들
     */
    handleCardClick(e) {
        if (this.currentConfig?.onClick) {
            e.preventDefault();
            this.currentConfig.onClick(this.currentConfig);
        }
    }

    handleActionClick(e, type) {
        e.preventDefault();
        const action = this.currentConfig?.footer?.[type];
        
        if (this.currentConfig?.onActionClick) {
            this.currentConfig.onActionClick(action, type, this.currentConfig);
        }
    }

    handleMenuClick(e) {
        e.stopPropagation();
        
        if (this.dropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    handleDropdownClick(action) {
        if (this.currentConfig?.onActionClick) {
            this.currentConfig.onActionClick(action, 'menu', this.currentConfig);
        }
        this.closeDropdown();
    }

    handleDropdownClose() {
        this.closeDropdown();
    }

    handleStatClick(e, statElement) {
        if (this.currentConfig?.onStatClick) {
            const statType = Array.from(statElement.parentElement.children).indexOf(statElement);
            const statData = this.currentConfig.stats;
            this.currentConfig.onStatClick(statData, statType, this.currentConfig);
        }
    }

    handleTagClick(e, tag) {
        if (this.currentConfig?.onTagClick) {
            e.preventDefault();
            this.currentConfig.onTagClick(tag, this.currentConfig);
        }
    }

    /**
     * 드롭다운 제어
     */
    openDropdown() {
        const dropdown = document.getElementById('card-dropdown');
        if (dropdown) {
            dropdown.style.display = 'block';
            this.dropdownOpen = true;
        }
    }

    closeDropdown() {
        const dropdown = document.getElementById('card-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            this.dropdownOpen = false;
        }
    }

    /**
     * 유틸리티 메서드들
     */
    setElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element && text !== undefined) {
            element.textContent = text;
        }
    }

    setElementAttribute(elementId, attribute, value) {
        const element = document.getElementById(elementId);
        if (element && value !== undefined) {
            element.setAttribute(attribute, value);
        }
    }

    setElementStyle(elementId, property, value) {
        const element = document.getElementById(elementId);
        if (element && value !== undefined) {
            element.style[property] = value;
        }
    }

    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = element.style.display === 'flex' ? 'flex' : 'block';
        }
    }

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * 공개 API 메서드들
     */
    updateConfig(newConfig) {
        this.currentConfig = { ...this.currentConfig, ...newConfig };
        this.applyConfig(this.currentConfig);
    }

    updateStats(newStats) {
        if (this.currentConfig) {
            this.currentConfig.stats = { ...this.currentConfig.stats, ...newStats };
            this.setupStats(this.currentConfig.stats);
        }
    }

    updateProgress(newProgress) {
        if (this.currentConfig) {
            this.currentConfig.progress = { ...this.currentConfig.progress, ...newProgress };
            this.setupProgress(this.currentConfig.progress);
        }
    }

    setLoading(loading) {
        const card = document.getElementById('wave-card');
        if (card) {
            if (loading) {
                card.style.opacity = '0.6';
                card.style.pointerEvents = 'none';
            } else {
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
            }
        }
    }

    /**
     * 컴포넌트 제거
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.isLoaded = false;
        this.currentConfig = null;
        this.dropdownOpen = false;
    }
}

// 전역 인스턴스 생성
window.CardLoader = CardLoader;

/**
 * 사용 예시:
 * 
 * const card = new CardLoader();
 * 
 * await card.load({
 *     id: 'job-card-1',
 *     title: '분양기획 전문가 모집',
 *     description: '강남구 대형 단지 분양기획 업무를 담당할 전문가를 모집합니다. 경험자 우대하며 다양한 복리후생을 제공합니다.',
 *     url: '/job-detail.html?id=1',
 *     image: {
 *         src: '/images/job-thumb.jpg',
 *         alt: '분양기획 모집 이미지',
 *         overlay: {
 *             content: '<button class="overlay-btn">지원하기</button>'
 *         }
 *     },
 *     badge: {
 *         text: '급구',
 *         type: 'hot'
 *     },
 *     header: {
 *         subtitle: '부동산 분양',
 *         date: '2024.03.15',
 *         actions: true
 *     },
 *     tags: ['분양기획', '강남구', '대형단지', '경력3년이상'],
 *     stats: {
 *         views: 256,
 *         likes: 12,
 *         comments: 3
 *     },
 *     user: {
 *         name: '김실무자',
 *         role: '채용담당자',
 *         avatar: '/images/user-avatar.jpg',
 *         badge: '인증기업'
 *     },
 *     footer: {
 *         primary: {
 *             text: '지원하기',
 *             icon: 'fas fa-paper-plane'
 *         },
 *         secondary: {
 *             text: '북마크',
 *             icon: 'fas fa-bookmark'
 *         }
 *     },
 *     actions: [
 *         { text: '공유하기', icon: 'fas fa-share', action: 'share' },
 *         { text: '신고하기', icon: 'fas fa-flag', action: 'report' }
 *     ],
 *     variant: 'elevated',
 *     onClick: (config) => {
 *         window.location.href = config.url;
 *     },
 *     onActionClick: (action, type, config) => {
 *         console.log('액션 클릭:', action, type);
 *     },
 *     onTagClick: (tag, config) => {
 *         console.log('태그 클릭:', tag);
 *     }
 * }, 'card-container');
 */

export default CardLoader;