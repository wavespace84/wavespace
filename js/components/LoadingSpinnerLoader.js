/**
 * LoadingSpinner 컴포넌트 로더
 * 로딩 상태를 표시하는 컴포넌트 시스템
 */

class LoadingSpinnerLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.container = null;
        this.instances = new Map(); // 다중 인스턴스 관리
    }

    /**
     * LoadingSpinner 로드 및 초기화
     * @param {Object} config - 로딩 스피너 설정
     * @param {string} config.type - 스피너 타입 (ring, dots, bars, pulse)
     * @param {string} config.size - 크기 (small, medium, large)
     * @param {string} config.color - 색상 (primary, success, warning, danger)
     * @param {string} config.message - 로딩 메시지 (선택)
     * @param {boolean} config.overlay - 전체 화면 오버레이 여부
     * @param {boolean} config.inline - 인라인 표시 여부
     * @param {string} containerId - 컨테이너 ID
     * @returns {Promise<string>} 인스턴스 ID
     */
    async load(config = {}, containerId = null) {
        try {
            // 기본값 설정
            const defaultConfig = {
                type: 'ring',
                size: 'medium',
                color: 'primary',
                message: null,
                overlay: false,
                inline: false
            };

            config = { ...defaultConfig, ...config };

            // 인스턴스 ID 생성
            const instanceId = `spinner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // 컨테이너 설정
            let container;
            if (config.overlay) {
                container = document.body;
            } else if (containerId) {
                container = document.getElementById(containerId);
                if (!container) {
                    console.error(`[LoadingSpinnerLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                    return null;
                }
            } else {
                container = document.body;
            }

            // CSS 로드
            await this.loadCSS();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 임시 컨테이너 생성하여 템플릿 파싱
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template;
            const spinnerElement = tempDiv.firstElementChild;
            
            // 고유 ID 설정
            spinnerElement.id = instanceId;

            // 스피너 설정 적용
            this.applyConfig(spinnerElement, config);

            // 컨테이너에 추가
            if (config.overlay) {
                document.body.appendChild(spinnerElement);
            } else {
                container.appendChild(spinnerElement);
            }

            // 인스턴스 정보 저장
            this.instances.set(instanceId, {
                element: spinnerElement,
                container: container,
                config: config
            });

            console.log('✅ LoadingSpinner 로드 완료:', instanceId);
            return instanceId;
            
        } catch (error) {
            console.error('[LoadingSpinnerLoader] 로드 실패:', error);
            return null;
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'loading-spinner-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/loading-spinner.css?v=' + Date.now();
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
        const response = await fetch('components/loading-spinner.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 스피너 설정 적용
     */
    applyConfig(element, config) {
        // 기본 클래스 설정
        element.className = `wave-loading-spinner ${config.size} ${config.color}`;
        
        // 추가 클래스
        if (config.overlay) {
            element.classList.add('overlay');
        }
        if (config.inline) {
            element.classList.add('inline');
        }

        // 스피너 타입에 따른 아이콘 변경
        const iconContainer = element.querySelector('.loading-spinner-icon');
        if (iconContainer && config.type) {
            iconContainer.innerHTML = this.getSpinnerHTML(config.type);
        }

        // 메시지 설정
        const messageElement = element.querySelector('.loading-spinner-message');
        if (messageElement) {
            if (config.message) {
                messageElement.textContent = config.message;
                messageElement.style.display = 'block';
            } else {
                messageElement.style.display = 'none';
            }
        }
    }

    /**
     * 스피너 타입별 HTML 생성
     */
    getSpinnerHTML(type) {
        switch (type) {
        case 'ring':
            return `
                    <div class="spinner-ring">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                `;
        case 'dots':
            return `
                    <div class="spinner-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                `;
        case 'bars':
            return `
                    <div class="spinner-bars">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                `;
        case 'pulse':
            return '<div class="spinner-pulse"></div>';
        default:
            return `
                    <div class="spinner-ring">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                `;
        }
    }

    /**
     * 스피너 업데이트
     */
    update(instanceId, config) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            console.warn(`[LoadingSpinnerLoader] 인스턴스를 찾을 수 없습니다: ${instanceId}`);
            return;
        }

        const newConfig = { ...instance.config, ...config };
        this.applyConfig(instance.element, newConfig);
        instance.config = newConfig;
    }

    /**
     * 메시지만 변경
     */
    setMessage(instanceId, message) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;
        
        const messageElement = instance.element.querySelector('.loading-spinner-message');
        if (messageElement) {
            if (message) {
                messageElement.textContent = message;
                messageElement.style.display = 'block';
            } else {
                messageElement.style.display = 'none';
            }
            instance.config.message = message;
        }
    }

    /**
     * 스피너 숨김
     */
    hide(instanceId) {
        const instance = this.instances.get(instanceId);
        if (instance && instance.element) {
            instance.element.style.display = 'none';
        }
    }

    /**
     * 스피너 표시
     */
    show(instanceId) {
        const instance = this.instances.get(instanceId);
        if (instance && instance.element) {
            instance.element.style.display = 'flex';
        }
    }

    /**
     * 스피너 제거
     */
    destroy(instanceId) {
        const instance = this.instances.get(instanceId);
        if (instance && instance.element) {
            instance.element.remove();
            this.instances.delete(instanceId);
            console.log(`🗑️ LoadingSpinner 제거됨: ${instanceId}`);
        }
    }

    /**
     * 모든 스피너 제거
     */
    destroyAll() {
        for (const [instanceId] of this.instances) {
            this.destroy(instanceId);
        }
    }

    /**
     * 간편 로딩 표시 (전체 화면 오버레이)
     */
    async showOverlay(message = '로딩 중...', type = 'ring', color = 'primary') {
        return await this.load({
            type,
            color,
            message,
            overlay: true,
            size: 'large'
        });
    }

    /**
     * 간편 인라인 로딩 표시
     */
    async showInline(containerId, message = null, type = 'ring', size = 'small') {
        return await this.load({
            type,
            size,
            message,
            inline: true,
            color: 'primary'
        }, containerId);
    }

    /**
     * 미리 정의된 로딩 스피너들
     */
    static presets = {
        overlay: {
            type: 'ring',
            size: 'large',
            color: 'primary',
            message: '로딩 중...',
            overlay: true
        },
        inline: {
            type: 'ring',
            size: 'small',
            color: 'primary',
            inline: true
        },
        uploading: {
            type: 'bars',
            size: 'medium',
            color: 'success',
            message: '업로드 중...',
        },
        processing: {
            type: 'pulse',
            size: 'medium',
            color: 'warning',
            message: '처리 중...',
        }
    };
}

// 전역 인스턴스 생성
const loadingSpinnerLoader = new LoadingSpinnerLoader();
window.LoadingSpinnerLoader = LoadingSpinnerLoader;
window.loadingSpinnerLoader = loadingSpinnerLoader;

/**
 * 전역 헬퍼 함수들
 */
window.showLoading = async function(message = '로딩 중...', containerId = null) {
    if (containerId) {
        return await loadingSpinnerLoader.showInline(containerId, message);
    } else {
        return await loadingSpinnerLoader.showOverlay(message);
    }
};

window.hideLoading = function(instanceId) {
    if (instanceId) {
        loadingSpinnerLoader.destroy(instanceId);
    } else {
        // 가장 최근 오버레이 제거
        for (const [id, instance] of loadingSpinnerLoader.instances) {
            if (instance.config.overlay) {
                loadingSpinnerLoader.destroy(id);
                break;
            }
        }
    }
};

/**
 * 사용 예시:
 * 
 * const loader = new LoadingSpinnerLoader();
 * 
 * // 전체 화면 오버레이
 * const spinnerId = await loader.showOverlay('데이터 로딩 중...');
 * 
 * // 특정 컨테이너 내 인라인 표시
 * const inlineId = await loader.showInline('content-container', '검색 중...');
 * 
 * // 커스텀 설정
 * const customId = await loader.load({
 *     type: 'bars',
 *     size: 'large',
 *     color: 'success',
 *     message: '업로드 중...'
 * }, 'upload-container');
 * 
 * // 제거
 * loader.destroy(spinnerId);
 * 
 * // 전역 헬퍼 사용
 * const id = await showLoading('로딩 중...');
 * hideLoading(id);
 */

export default LoadingSpinnerLoader;