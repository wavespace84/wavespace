/**
 * StickySlideCard 컴포넌트 로더
 * 상단 고정 슬라이드 카드 통합 시스템
 */

class StickySlideCardLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.container = null;
        this.cards = [];
        this.currentIndex = 0;
        this.isAutoSliding = false;
        this.autoSlideInterval = null;
        this.slideDelay = 5000; // 5초
        this.isMinimized = false;
        
        // 이벤트 바인딩을 위한 컨텍스트 유지
        this.handlePrevSlide = this.handlePrevSlide.bind(this);
        this.handleNextSlide = this.handleNextSlide.bind(this);
        this.handleIndicatorClick = this.handleIndicatorClick.bind(this);
        this.handlePlayPause = this.handlePlayPause.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleMinimize = this.handleMinimize.bind(this);
        this.handleRestore = this.handleRestore.bind(this);
        this.handleCardClick = this.handleCardClick.bind(this);
        this.handleActionClick = this.handleActionClick.bind(this);
    }

    /**
     * StickySlideCard 로드 및 초기화
     * @param {Object} config - 슬라이드 카드 설정
     * @param {Array} config.cards - 카드 데이터 배열
     * @param {string} config.type - 카드 타입 ('job', 'notice', 'event')
     * @param {boolean} config.autoSlide - 자동 슬라이드 여부
     * @param {number} config.slideDelay - 슬라이드 지연 시간 (ms)
     * @param {boolean} config.showNavigation - 네비게이션 표시 여부
     * @param {boolean} config.showIndicators - 인디케이터 표시 여부
     * @param {boolean} config.allowMinimize - 최소화 허용 여부
     * @param {Function} config.onCardClick - 카드 클릭 콜백
     * @param {Function} config.onActionClick - 액션 버튼 클릭 콜백
     * @param {Function} config.onClose - 닫기 콜백
     * @param {string} containerId - 컨테이너 ID
     * @returns {Promise<void>}
     */
    async load(config, containerId) {
        try {
            // 기본값 설정
            const defaultConfig = {
                cards: [],
                type: 'default',
                autoSlide: true,
                slideDelay: 5000,
                showNavigation: true,
                showIndicators: true,
                allowMinimize: true,
                onCardClick: null,
                onActionClick: null,
                onClose: null
            };

            config = { ...defaultConfig, ...config };

            // 컨테이너 확인
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`[StickySlideCardLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                return;
            }

            // 카드 데이터 확인
            if (!config.cards || config.cards.length === 0) {
                console.warn('[StickySlideCardLoader] 표시할 카드가 없습니다.');
                return;
            }

            // CSS 로드
            await this.loadCSS();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 컨테이너에 템플릿 삽입
            this.container.innerHTML = template;

            // 카드 데이터 저장
            this.cards = config.cards;
            this.slideDelay = config.slideDelay;

            // 설정 적용
            this.applyConfig(config);

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 첫 번째 카드 표시
            this.showCard(0);

            // 자동 슬라이드 시작
            if (config.autoSlide && this.cards.length > 1) {
                this.startAutoSlide();
            }

            // 설정 저장
            this.currentConfig = config;
            this.isLoaded = true;

            console.log(`✅ StickySlideCard 로드 완료: ${this.cards.length}개 카드`);
            
        } catch (error) {
            console.error('[StickySlideCardLoader] 로드 실패:', error);
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'sticky-slide-card-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/sticky-slide-card.css?v=' + Date.now();
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
        const response = await fetch('components/sticky-slide-card.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 설정 적용
     */
    applyConfig(config) {
        const cardComponent = document.getElementById('wave-sticky-slide-card');
        if (cardComponent) {
            // 카드 타입 클래스 추가
            if (config.type !== 'default') {
                cardComponent.classList.add(`${config.type}-card`);
            }
        }

        // 네비게이션 표시/숨김
        const navigation = document.getElementById('slide-navigation');
        if (navigation) {
            navigation.style.display = config.showNavigation && this.cards.length > 1 ? 'flex' : 'none';
        }

        // 인디케이터 표시/숨김 및 생성
        const indicators = document.getElementById('slide-indicators');
        if (indicators) {
            if (config.showIndicators && this.cards.length > 1) {
                indicators.style.display = 'flex';
                this.createIndicators();
            } else {
                indicators.style.display = 'none';
            }
        }

        // 자동 슬라이드 제어 표시/숨김
        const controls = document.getElementById('slide-controls');
        if (controls) {
            controls.style.display = config.autoSlide && this.cards.length > 1 ? 'block' : 'none';
        }
    }

    /**
     * 인디케이터 생성
     */
    createIndicators() {
        const indicators = document.getElementById('slide-indicators');
        if (!indicators) return;

        indicators.innerHTML = '';

        this.cards.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'slide-indicator';
            indicator.setAttribute('data-index', index);
            indicator.setAttribute('aria-label', `${index + 1}번째 카드로 이동`);
            indicator.addEventListener('click', () => this.handleIndicatorClick(index));
            indicators.appendChild(indicator);
        });
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 슬라이드 네비게이션
        const prevBtn = document.getElementById('slide-prev');
        const nextBtn = document.getElementById('slide-next');
        if (prevBtn) prevBtn.addEventListener('click', this.handlePrevSlide);
        if (nextBtn) nextBtn.addEventListener('click', this.handleNextSlide);

        // 자동 슬라이드 제어
        const playPauseBtn = document.getElementById('slide-play-pause');
        if (playPauseBtn) playPauseBtn.addEventListener('click', this.handlePlayPause);

        // 카드 닫기
        const closeBtn = document.getElementById('slide-card-close');
        if (closeBtn) closeBtn.addEventListener('click', this.handleClose);

        // 최소화/복원
        const restoreBtn = document.getElementById('minimize-restore');
        if (restoreBtn) restoreBtn.addEventListener('click', this.handleRestore);

        // 카드 클릭
        const cardLink = document.getElementById('slide-card-link');
        if (cardLink) cardLink.addEventListener('click', this.handleCardClick);

        // 액션 버튼들
        const primaryAction = document.getElementById('slide-card-primary-action');
        const secondaryAction = document.getElementById('slide-card-secondary-action');
        if (primaryAction) primaryAction.addEventListener('click', (e) => this.handleActionClick(e, 'primary'));
        if (secondaryAction) secondaryAction.addEventListener('click', (e) => this.handleActionClick(e, 'secondary'));

        // 키보드 네비게이션
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible() || this.isMinimized) return;

            switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.handlePrevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.handleNextSlide();
                break;
            case ' ':
                e.preventDefault();
                this.handlePlayPause();
                break;
            case 'Escape':
                e.preventDefault();
                this.minimize();
                break;
            }
        });

        // 마우스 호버 시 자동 슬라이드 일시정지
        const cardContainer = document.getElementById('slide-card-container');
        if (cardContainer) {
            cardContainer.addEventListener('mouseenter', () => {
                if (this.isAutoSliding) {
                    this.pauseAutoSlide();
                }
            });

            cardContainer.addEventListener('mouseleave', () => {
                if (this.currentConfig?.autoSlide && this.cards.length > 1) {
                    this.resumeAutoSlide();
                }
            });
        }
    }

    /**
     * 카드 표시
     */
    showCard(index) {
        if (index < 0 || index >= this.cards.length) return;

        const card = this.cards[index];
        this.currentIndex = index;

        // 기본 정보 업데이트
        this.updateElement('slide-card-title', card.title || '제목 없음');
        this.updateElement('slide-card-author', card.author || '작성자');
        this.updateElement('slide-card-date', card.date || new Date().toLocaleDateString());
        this.updateElement('slide-card-view-count', card.views || 0);

        // 링크 설정
        const cardLink = document.getElementById('slide-card-link');
        if (cardLink && card.url) {
            cardLink.href = card.url;
        }

        // 뱃지 텍스트 업데이트
        this.updateElement('slide-card-badge-text', card.badgeText || '상단고정');

        // 설명 표시/숨김
        this.toggleSection('slide-card-description', card.description);
        if (card.description) {
            this.updateElement('slide-card-description-text', card.description);
        }

        // 태그 표시/숨김
        this.toggleSection('slide-card-tags', card.tags);
        if (card.tags && card.tags.length > 0) {
            this.updateTags(card.tags);
        }

        // 통계 표시/숨김
        this.toggleSection('slide-card-stats', card.stats);
        if (card.stats) {
            this.updateElement('slide-card-likes', card.stats.likes || 0);
            this.updateElement('slide-card-comments', card.stats.comments || 0);
            this.updateElement('slide-card-downloads', card.stats.downloads || 0);
        }

        // 액션 버튼 표시/숨김
        this.toggleSection('slide-card-actions', card.actions);
        if (card.actions) {
            this.updateActions(card.actions);
        }

        // 인디케이터 업데이트
        this.updateIndicators();

        // 네비게이션 버튼 상태 업데이트
        this.updateNavigation();
    }

    /**
     * 태그 업데이트
     */
    updateTags(tags) {
        const tagsContainer = document.getElementById('slide-card-tags');
        if (!tagsContainer) return;

        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'card-tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
    }

    /**
     * 액션 버튼 업데이트
     */
    updateActions(actions) {
        const primaryBtn = document.getElementById('slide-card-primary-action');
        const secondaryBtn = document.getElementById('slide-card-secondary-action');

        if (primaryBtn && actions.primary) {
            primaryBtn.querySelector('span').textContent = actions.primary.text || '자세히 보기';
            const icon = primaryBtn.querySelector('i');
            if (icon && actions.primary.icon) {
                icon.className = `fas ${actions.primary.icon}`;
            }
            primaryBtn.style.display = 'flex';
        } else if (primaryBtn) {
            primaryBtn.style.display = 'none';
        }

        if (secondaryBtn && actions.secondary) {
            secondaryBtn.querySelector('span').textContent = actions.secondary.text || '북마크';
            const icon = secondaryBtn.querySelector('i');
            if (icon && actions.secondary.icon) {
                icon.className = `fas ${actions.secondary.icon}`;
            }
            secondaryBtn.style.display = 'flex';
        } else if (secondaryBtn) {
            secondaryBtn.style.display = 'none';
        }
    }

    /**
     * 인디케이터 업데이트
     */
    updateIndicators() {
        const indicators = document.querySelectorAll('.slide-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    /**
     * 네비게이션 상태 업데이트
     */
    updateNavigation() {
        const prevBtn = document.getElementById('slide-prev');
        const nextBtn = document.getElementById('slide-next');

        if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentIndex === this.cards.length - 1;
    }

    /**
     * 섹션 표시/숨김
     */
    toggleSection(elementId, condition) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = condition ? 'block' : 'none';
        }
    }

    /**
     * 요소 텍스트 업데이트
     */
    updateElement(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * 슬라이드 이벤트 핸들러들
     */
    handlePrevSlide() {
        if (this.currentIndex > 0) {
            this.showCardWithAnimation(this.currentIndex - 1, 'right');
        }
    }

    handleNextSlide() {
        if (this.currentIndex < this.cards.length - 1) {
            this.showCardWithAnimation(this.currentIndex + 1, 'left');
        }
    }

    handleIndicatorClick(index) {
        if (index !== this.currentIndex) {
            const direction = index > this.currentIndex ? 'left' : 'right';
            this.showCardWithAnimation(index, direction);
        }
    }

    /**
     * 애니메이션과 함께 카드 표시
     */
    showCardWithAnimation(index, direction) {
        const slideCard = document.getElementById('slide-card');
        if (!slideCard) return;

        slideCard.classList.add(`sliding-${direction}`);

        setTimeout(() => {
            this.showCard(index);
            slideCard.classList.remove(`sliding-${direction}`);
        }, 250);
    }

    /**
     * 자동 슬라이드 제어
     */
    startAutoSlide() {
        if (this.cards.length <= 1) return;

        this.isAutoSliding = true;
        this.autoSlideInterval = setInterval(() => {
            const nextIndex = (this.currentIndex + 1) % this.cards.length;
            this.showCardWithAnimation(nextIndex, 'left');
        }, this.slideDelay);

        this.updatePlayPauseButton();
    }

    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
        this.isAutoSliding = false;
        this.updatePlayPauseButton();
    }

    resumeAutoSlide() {
        if (!this.isAutoSliding) {
            this.startAutoSlide();
        }
    }

    handlePlayPause() {
        if (this.isAutoSliding) {
            this.pauseAutoSlide();
        } else {
            this.startAutoSlide();
        }
    }

    updatePlayPauseButton() {
        const btn = document.getElementById('slide-play-pause');
        if (!btn) return;

        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = this.isAutoSliding ? 'fas fa-pause' : 'fas fa-play';
        }
        btn.title = this.isAutoSliding ? '자동 슬라이드 일시정지' : '자동 슬라이드 재생';
    }

    /**
     * 카드 액션 핸들러들
     */
    handleCardClick(e) {
        const card = this.cards[this.currentIndex];
        if (this.currentConfig?.onCardClick) {
            e.preventDefault();
            this.currentConfig.onCardClick(card, this.currentIndex);
        }
    }

    handleActionClick(e, type) {
        e.preventDefault();
        const card = this.cards[this.currentIndex];
        const action = card.actions?.[type];
        
        if (this.currentConfig?.onActionClick) {
            this.currentConfig.onActionClick(action, card, type, this.currentIndex);
        }
    }

    handleClose() {
        if (this.currentConfig?.onClose) {
            this.currentConfig.onClose();
        }
        this.hide();
    }

    /**
     * 최소화/복원 기능
     */
    minimize() {
        const component = document.getElementById('wave-sticky-slide-card');
        if (component) {
            component.classList.add('minimized');
            this.isMinimized = true;
            this.pauseAutoSlide();
        }
    }

    handleMinimize() {
        this.minimize();
    }

    handleRestore() {
        const component = document.getElementById('wave-sticky-slide-card');
        if (component) {
            component.classList.remove('minimized');
            this.isMinimized = false;
            
            if (this.currentConfig?.autoSlide && this.cards.length > 1) {
                this.startAutoSlide();
            }
        }
    }

    /**
     * 표시/숨김 제어
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        this.pauseAutoSlide();
    }

    isVisible() {
        return this.container && this.container.style.display !== 'none';
    }

    /**
     * 카드 데이터 업데이트
     */
    updateCards(cards) {
        this.cards = cards;
        this.currentIndex = 0;

        if (cards.length === 0) {
            this.hide();
            return;
        }

        // 인디케이터 재생성
        if (this.currentConfig?.showIndicators) {
            this.createIndicators();
        }

        // 첫 번째 카드 표시
        this.showCard(0);

        // 자동 슬라이드 재시작
        if (this.currentConfig?.autoSlide && cards.length > 1) {
            this.pauseAutoSlide();
            this.startAutoSlide();
        }
    }

    /**
     * 특정 카드로 이동
     */
    goToCard(index) {
        if (index >= 0 && index < this.cards.length && index !== this.currentIndex) {
            const direction = index > this.currentIndex ? 'left' : 'right';
            this.showCardWithAnimation(index, direction);
        }
    }

    /**
     * 컴포넌트 제거
     */
    destroy() {
        this.pauseAutoSlide();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.isLoaded = false;
        this.currentConfig = null;
        this.cards = [];
        this.currentIndex = 0;
        this.isMinimized = false;
    }
}

// 전역 인스턴스 생성
window.StickySlideCardLoader = StickySlideCardLoader;

/**
 * 사용 예시:
 * 
 * const stickyCard = new StickySlideCardLoader();
 * 
 * await stickyCard.load({
 *     cards: [
 *         {
 *             id: '1',
 *             title: '분양기획 전문가 모집',
 *             author: '김실무자',
 *             date: '2024.03.15',
 *             views: 256,
 *             url: '/job-detail.html?id=1',
 *             badgeText: '급구',
 *             description: '강남구 대형 단지 분양기획 업무를 담당할 전문가를 모집합니다.',
 *             tags: ['분양기획', '강남구', '대형단지'],
 *             stats: {
 *                 likes: 12,
 *                 comments: 5,
 *                 applications: 23
 *             },
 *             actions: {
 *                 primary: {
 *                     text: '지원하기',
 *                     icon: 'fa-paper-plane'
 *                 },
 *                 secondary: {
 *                     text: '북마크',
 *                     icon: 'fa-bookmark'
 *                 }
 *             }
 *         }
 *     ],
 *     type: 'job',
 *     autoSlide: true,
 *     slideDelay: 5000,
 *     onCardClick: (card, index) => {
 *         window.location.href = card.url;
 *     },
 *     onActionClick: (action, card, type) => {
 *         if (type === 'primary') {
 *             console.log('지원하기 클릭:', card);
 *         }
 *     },
 *     onClose: () => {
 *         console.log('카드 닫기');
 *     }
 * }, 'sticky-card-container');
 */

export default StickySlideCardLoader;