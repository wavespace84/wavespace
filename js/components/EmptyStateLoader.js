/**
 * EmptyState 컴포넌트 로더
 * 빈 데이터 상태를 표시하는 컴포넌트 시스템
 */

class EmptyStateLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.container = null;
    }

    /**
     * EmptyState 로드 및 초기화
     * @param {Object} config - 빈 상태 설정
     * @param {string} config.icon - 표시할 아이콘 (FontAwesome 클래스)
     * @param {string} config.title - 제목 메시지
     * @param {string} config.description - 설명 메시지 (선택)
     * @param {Array} config.actions - 액션 버튼 배열 (선택)
     * @param {string} config.type - 타입 (no-data, no-results, error, loading)
     * @param {string} config.size - 크기 (small, medium, large)
     * @param {string} containerId - 컨테이너 ID
     * @returns {Promise<void>}
     */
    async load(config, containerId) {
        try {
            // 기본값 설정
            const defaultConfig = {
                icon: 'fas fa-inbox',
                title: '데이터가 없습니다',
                description: null,
                actions: [],
                type: 'no-data',
                size: 'medium'
            };

            config = { ...defaultConfig, ...config };

            // 컨테이너 확인
            this.container = containerId ? document.getElementById(containerId) : document.body;
            if (!this.container) {
                console.error(`[EmptyStateLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                return;
            }

            // CSS 로드
            await this.loadCSS();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 컨테이너에 템플릿 삽입
            this.container.innerHTML = template;

            // 빈 상태 설정 적용
            this.applyConfig(config);

            // 설정 저장
            this.currentConfig = config;
            this.isLoaded = true;

            console.log(`✅ EmptyState 로드 완료:`, config.title);
            
        } catch (error) {
            console.error('[EmptyStateLoader] 로드 실패:', error);
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'empty-state-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/empty-state.css?v=' + Date.now();
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
        const response = await fetch('components/empty-state.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 빈 상태 설정 적용
     */
    applyConfig(config) {
        const emptyState = document.getElementById('wave-empty-state');
        if (!emptyState) return;

        // 타입 및 크기 클래스 적용
        emptyState.className = `wave-empty-state ${config.type} ${config.size}`;

        // 아이콘 설정
        const iconElement = document.querySelector('#empty-state-icon i');
        if (iconElement && config.icon) {
            iconElement.className = config.icon;
        }

        // 제목 설정
        const titleElement = document.getElementById('empty-state-title');
        if (titleElement) {
            titleElement.textContent = config.title;
        }

        // 설명 설정
        const descriptionElement = document.getElementById('empty-state-description');
        if (descriptionElement) {
            if (config.description) {
                descriptionElement.textContent = config.description;
                descriptionElement.style.display = 'block';
            } else {
                descriptionElement.style.display = 'none';
            }
        }

        // 액션 버튼들 설정
        this.setupActions(config.actions || []);
    }

    /**
     * 액션 버튼들 설정
     */
    setupActions(actions) {
        const actionsContainer = document.getElementById('empty-state-actions');
        if (!actionsContainer) return;

        if (actions.length === 0) {
            actionsContainer.style.display = 'none';
            return;
        }

        actionsContainer.style.display = 'flex';
        actionsContainer.innerHTML = '';

        actions.forEach(action => {
            const button = this.createActionButton(action);
            actionsContainer.appendChild(button);
        });
    }

    /**
     * 액션 버튼 생성
     */
    createActionButton(action) {
        const button = document.createElement(action.href ? 'a' : 'button');
        
        // 기본 클래스
        button.className = 'empty-state-btn';
        
        // 버튼 타입 (primary, secondary, outline 등)
        if (action.type) {
            button.classList.add(action.type);
        }

        // 링크인 경우
        if (action.href) {
            button.href = action.href;
            if (action.target) {
                button.target = action.target;
            }
        }

        // 내용 구성
        let content = '';
        
        // 아이콘
        if (action.icon) {
            content += `<i class="${action.icon}"></i>`;
        }
        
        // 텍스트
        if (action.text) {
            content += `<span>${this.escapeHtml(action.text)}</span>`;
        }
        
        button.innerHTML = content;

        // 클릭 이벤트
        if (action.onClick && typeof action.onClick === 'function') {
            button.addEventListener('click', (e) => {
                if (!action.href) {
                    e.preventDefault();
                }
                action.onClick(e);
            });
        }

        // 추가 속성
        if (action.disabled) {
            button.disabled = true;
            button.classList.add('disabled');
        }

        if (action.id) {
            button.id = action.id;
        }

        if (action.tooltip) {
            button.title = action.tooltip;
        }

        return button;
    }

    /**
     * 빈 상태 업데이트
     */
    update(config) {
        if (!this.isLoaded) {
            console.warn('[EmptyStateLoader] EmptyState가 로드되지 않았습니다.');
            return;
        }

        const newConfig = { ...this.currentConfig, ...config };
        this.applyConfig(newConfig);
        this.currentConfig = newConfig;
    }

    /**
     * 제목만 변경
     */
    setTitle(title) {
        if (!this.isLoaded) return;
        
        const titleElement = document.getElementById('empty-state-title');
        if (titleElement) {
            titleElement.textContent = title;
            if (this.currentConfig) {
                this.currentConfig.title = title;
            }
        }
    }

    /**
     * 설명만 변경
     */
    setDescription(description) {
        if (!this.isLoaded) return;
        
        const descriptionElement = document.getElementById('empty-state-description');
        if (descriptionElement) {
            if (description) {
                descriptionElement.textContent = description;
                descriptionElement.style.display = 'block';
            } else {
                descriptionElement.style.display = 'none';
            }
            
            if (this.currentConfig) {
                this.currentConfig.description = description;
            }
        }
    }

    /**
     * 아이콘만 변경
     */
    setIcon(icon) {
        if (!this.isLoaded) return;
        
        const iconElement = document.querySelector('#empty-state-icon i');
        if (iconElement) {
            iconElement.className = icon;
            if (this.currentConfig) {
                this.currentConfig.icon = icon;
            }
        }
    }

    /**
     * HTML 이스케이프
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 빈 상태 숨김
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * 빈 상태 표시
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    /**
     * 빈 상태 제거
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isLoaded = false;
        this.currentConfig = null;
    }

    /**
     * 미리 정의된 빈 상태들
     */
    static presets = {
        noData: {
            icon: 'fas fa-inbox',
            title: '데이터가 없습니다',
            description: '아직 등록된 내용이 없습니다.',
            type: 'no-data'
        },
        noSearchResults: {
            icon: 'fas fa-search',
            title: '검색 결과가 없습니다',
            description: '다른 검색어로 시도해보세요.',
            type: 'no-results'
        },
        noComments: {
            icon: 'fas fa-comments',
            title: '댓글이 없습니다',
            description: '첫 번째 댓글을 남겨보세요!',
            type: 'no-data'
        },
        error: {
            icon: 'fas fa-exclamation-triangle',
            title: '오류가 발생했습니다',
            description: '잠시 후 다시 시도해주세요.',
            type: 'error'
        },
        loading: {
            icon: 'fas fa-spinner fa-spin',
            title: '로딩 중...',
            description: '데이터를 불러오는 중입니다.',
            type: 'loading'
        }
    };
}

// 전역 인스턴스 생성
window.EmptyStateLoader = EmptyStateLoader;

/**
 * 사용 예시:
 * 
 * const emptyState = new EmptyStateLoader();
 * 
 * // 기본 사용
 * await emptyState.load({
 *     icon: 'fas fa-inbox',
 *     title: '게시글이 없습니다',
 *     description: '첫 번째 게시글을 작성해보세요!',
 *     actions: [
 *         {
 *             text: '글쓰기',
 *             icon: 'fas fa-pen',
 *             type: 'primary',
 *             onClick: () => location.href = 'write.html'
 *         }
 *     ]
 * }, 'content-container');
 * 
 * // 프리셋 사용
 * await emptyState.load(EmptyStateLoader.presets.noSearchResults, 'search-results');
 * 
 * // 동적 업데이트
 * emptyState.setTitle('새로운 제목');
 */

export default EmptyStateLoader;