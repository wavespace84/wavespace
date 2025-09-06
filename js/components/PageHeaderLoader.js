/**
 * PageHeader 컴포넌트 로더
 * 페이지 헤더를 동적으로 로드하고 관리하는 시스템
 */

class PageHeaderLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.container = null;
    }

    /**
     * 페이지 헤더 로드 및 초기화
     * @param {Object} config - 헤더 설정
     * @param {string} config.title - 페이지 제목 (필수)
     * @param {string} config.subtitle - 페이지 부제목 (선택)
     * @param {Array} config.actions - 액션 버튼 배열 (선택)
     * @param {string} containerId - 컨테이너 ID (기본값: 'page-header-container')
     * @returns {Promise<void>}
     */
    async load(config, containerId = 'page-header-container') {
        try {
            // 필수 파라미터 검증
            if (!config || !config.title) {
                console.error('[PageHeaderLoader] 제목이 필수입니다.');
                return;
            }

            // 컨테이너 확인
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`[PageHeaderLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                return;
            }

            // CSS 로드
            await this.loadCSS();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 컨테이너에 템플릿 삽입
            this.container.innerHTML = template;

            // 헤더 설정 적용
            this.applyConfig(config);

            // 설정 저장
            this.currentConfig = config;
            this.isLoaded = true;

            console.log('✅ PageHeader 로드 완료:', config.title);
            
        } catch (error) {
            console.error('[PageHeaderLoader] 로드 실패:', error);
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'page-header-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/page-header.css?v=' + Date.now();
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
        const response = await fetch('components/page-header.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 헤더 설정 적용
     */
    applyConfig(config) {
        // 제목 설정
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = config.title;
        }

        // 부제목 설정
        const subtitleElement = document.getElementById('page-subtitle');
        if (subtitleElement) {
            if (config.subtitle) {
                subtitleElement.textContent = config.subtitle;
                subtitleElement.style.display = 'block';
            } else {
                subtitleElement.style.display = 'none';
            }
        }

        // 액션 버튼들 설정
        this.setupActions(config.actions || []);
    }

    /**
     * 액션 버튼들 설정
     */
    setupActions(actions) {
        const actionsContainer = document.getElementById('page-header-actions');
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
        button.className = 'page-header-btn';
        
        // 버튼 타입 (primary, success, warning, danger 등)
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
     * 헤더 업데이트
     */
    update(config) {
        if (!this.isLoaded) {
            console.warn('[PageHeaderLoader] 헤더가 로드되지 않았습니다.');
            return;
        }

        this.applyConfig(config);
        this.currentConfig = { ...this.currentConfig, ...config };
    }

    /**
     * 제목만 변경
     */
    setTitle(title) {
        if (!this.isLoaded) return;
        
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = title;
            if (this.currentConfig) {
                this.currentConfig.title = title;
            }
        }
    }

    /**
     * 부제목만 변경
     */
    setSubtitle(subtitle) {
        if (!this.isLoaded) return;
        
        const subtitleElement = document.getElementById('page-subtitle');
        if (subtitleElement) {
            if (subtitle) {
                subtitleElement.textContent = subtitle;
                subtitleElement.style.display = 'block';
            } else {
                subtitleElement.style.display = 'none';
            }
            
            if (this.currentConfig) {
                this.currentConfig.subtitle = subtitle;
            }
        }
    }

    /**
     * 로딩 상태 설정
     */
    setLoading(loading = true) {
        if (!this.isLoaded) return;
        
        const header = document.getElementById('wave-page-header');
        if (header) {
            if (loading) {
                header.classList.add('loading');
            } else {
                header.classList.remove('loading');
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
     * 헤더 숨김
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * 헤더 표시
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    /**
     * 헤더 제거
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isLoaded = false;
        this.currentConfig = null;
    }
}

// 전역 인스턴스 생성
window.PageHeaderLoader = PageHeaderLoader;

/**
 * 사용 예시:
 * 
 * const pageHeader = new PageHeaderLoader();
 * 
 * await pageHeader.load({
 *     title: '자유게시판',
 *     subtitle: '자유롭게 소통하는 분양실무자들의 공간',
 *     actions: [
 *         {
 *             text: '글쓰기',
 *             icon: 'fas fa-pen',
 *             type: 'primary',
 *             onClick: () => location.href = 'write.html'
 *         },
 *         {
 *             text: '새로고침',
 *             icon: 'fas fa-sync-alt',
 *             onClick: () => location.reload()
 *         }
 *     ]
 * });
 * 
 * // 제목만 변경
 * pageHeader.setTitle('새로운 제목');
 * 
 * // 로딩 상태 표시
 * pageHeader.setLoading(true);
 */

export default PageHeaderLoader;