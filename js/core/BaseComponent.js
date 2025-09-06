/**
 * BaseComponent - 모든 UI 컴포넌트의 기본 클래스
 * 
 * 이 클래스는 WAVE SPACE의 모든 UI 컴포넌트에서 공통으로 사용되는
 * 기능들을 제공합니다.
 * 
 * @class BaseComponent
 */
export class BaseComponent {
    constructor(options = {}) {
        this.options = { ...this.constructor.defaultOptions, ...options };
        this.element = null;
        this.state = {};
        this.listeners = new Map();
        this.isInitialized = false;
        this.isDestroyed = false;
    }

    /**
     * 기본 옵션 (서브클래스에서 오버라이드)
     */
    static get defaultOptions() {
        return {
            autoInit: true,
            debug: false
        };
    }

    /**
     * 컴포넌트 초기화
     * @returns {Promise<void>}
     */
    async init() {
        if (this.isInitialized) {
            this.log('warn', 'Component already initialized');
            return;
        }

        try {
            await this.beforeInit();
            await this.onInit();
            await this.afterInit();
            
            this.isInitialized = true;
            this.log('info', 'Component initialized');
        } catch (error) {
            this.log('error', 'Failed to initialize component', error);
            throw error;
        }
    }

    /**
     * 초기화 전 훅 (오버라이드용)
     */
    async beforeInit() {
        // 서브클래스에서 구현
    }

    /**
     * 초기화 로직 (오버라이드용)
     */
    async onInit() {
        // 서브클래스에서 구현
    }

    /**
     * 초기화 후 훅 (오버라이드용)
     */
    async afterInit() {
        // 서브클래스에서 구현
    }

    /**
     * 컴포넌트 정리
     */
    destroy() {
        if (this.isDestroyed) {
            this.log('warn', 'Component already destroyed');
            return;
        }

        try {
            this.beforeDestroy();
            
            // 이벤트 리스너 정리
            this.removeAllListeners();
            
            // DOM 요소 제거
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            
            this.onDestroy();
            
            // 상태 초기화
            this.element = null;
            this.state = {};
            this.isInitialized = false;
            this.isDestroyed = true;
            
            this.afterDestroy();
            
            this.log('info', 'Component destroyed');
        } catch (error) {
            this.log('error', 'Failed to destroy component', error);
        }
    }

    /**
     * 정리 전 훅 (오버라이드용)
     */
    beforeDestroy() {
        // 서브클래스에서 구현
    }

    /**
     * 정리 로직 (오버라이드용)
     */
    onDestroy() {
        // 서브클래스에서 구현
    }

    /**
     * 정리 후 훅 (오버라이드용)
     */
    afterDestroy() {
        // 서브클래스에서 구현
    }

    /**
     * DOM 요소 생성
     * @param {string} html - HTML 문자열
     * @returns {HTMLElement} 생성된 요소
     */
    createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    /**
     * DOM 요소 찾기
     * @param {string} selector - CSS 선택자
     * @param {HTMLElement} parent - 부모 요소
     * @returns {HTMLElement|null}
     */
    $(selector, parent = this.element || document) {
        return parent ? parent.querySelector(selector) : null;
    }

    /**
     * DOM 요소들 찾기
     * @param {string} selector - CSS 선택자
     * @param {HTMLElement} parent - 부모 요소
     * @returns {NodeList}
     */
    $$(selector, parent = this.element || document) {
        return parent ? parent.querySelectorAll(selector) : [];
    }

    /**
     * 이벤트 리스너 추가
     * @param {HTMLElement|string} target - 대상 요소 또는 선택자
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 이벤트 옵션
     */
    on(target, event, handler, options = {}) {
        const element = typeof target === 'string' ? this.$(target) : target;
        
        if (!element) {
            this.log('warn', `Element not found: ${target}`);
            return;
        }

        // 컨텍스트 바인딩
        const boundHandler = handler.bind(this);
        
        element.addEventListener(event, boundHandler, options);
        
        // 리스너 추적
        if (!this.listeners.has(element)) {
            this.listeners.set(element, new Map());
        }
        
        const elementListeners = this.listeners.get(element);
        if (!elementListeners.has(event)) {
            elementListeners.set(event, new Set());
        }
        
        elementListeners.get(event).add({ handler: boundHandler, options });
    }

    /**
     * 이벤트 리스너 제거
     * @param {HTMLElement|string} target - 대상 요소 또는 선택자
     * @param {string} event - 이벤트 타입
     * @param {Function} handler - 이벤트 핸들러
     * @param {Object} options - 이벤트 옵션
     */
    off(target, event, handler, options = {}) {
        const element = typeof target === 'string' ? this.$(target) : target;
        
        if (!element || !this.listeners.has(element)) {
            return;
        }

        const elementListeners = this.listeners.get(element);
        if (!elementListeners.has(event)) {
            return;
        }

        const eventListeners = elementListeners.get(event);
        eventListeners.forEach(listener => {
            element.removeEventListener(event, listener.handler, listener.options);
        });
        
        eventListeners.clear();
    }

    /**
     * 모든 이벤트 리스너 제거
     */
    removeAllListeners() {
        this.listeners.forEach((elementListeners, element) => {
            elementListeners.forEach((eventListeners, event) => {
                eventListeners.forEach(listener => {
                    element.removeEventListener(event, listener.handler, listener.options);
                });
            });
        });
        
        this.listeners.clear();
    }

    /**
     * 커스텀 이벤트 발생
     * @param {string} eventName - 이벤트 이름
     * @param {any} detail - 이벤트 상세 데이터
     */
    emit(eventName, detail = null) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        
        const target = this.element || document;
        target.dispatchEvent(event);
    }

    /**
     * 상태 업데이트
     * @param {Object} newState - 새로운 상태
     */
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        this.onStateChange(prevState, this.state);
    }

    /**
     * 상태 변경 시 호출 (오버라이드용)
     * @param {Object} prevState - 이전 상태
     * @param {Object} newState - 새로운 상태
     */
    onStateChange(prevState, newState) {
        // 서브클래스에서 구현
    }

    /**
     * 요소 표시
     */
    show() {
        if (this.element) {
            this.element.style.display = '';
            this.element.classList.remove('hidden');
        }
    }

    /**
     * 요소 숨기기
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.element.classList.add('hidden');
        }
    }

    /**
     * 클래스 토글
     * @param {string} className - 클래스 이름
     * @param {boolean} force - 강제 설정
     */
    toggleClass(className, force) {
        if (this.element) {
            this.element.classList.toggle(className, force);
        }
    }

    /**
     * 속성 설정
     * @param {string} name - 속성 이름
     * @param {string} value - 속성 값
     */
    setAttribute(name, value) {
        if (this.element) {
            this.element.setAttribute(name, value);
        }
    }

    /**
     * 속성 가져오기
     * @param {string} name - 속성 이름
     * @returns {string|null}
     */
    getAttribute(name) {
        return this.element ? this.element.getAttribute(name) : null;
    }

    /**
     * 데이터 속성 설정
     * @param {string} name - 데이터 속성 이름 (data- 제외)
     * @param {any} value - 값
     */
    setData(name, value) {
        if (this.element) {
            this.element.dataset[name] = value;
        }
    }

    /**
     * 데이터 속성 가져오기
     * @param {string} name - 데이터 속성 이름 (data- 제외)
     * @returns {string|undefined}
     */
    getData(name) {
        return this.element ? this.element.dataset[name] : undefined;
    }

    /**
     * 애니메이션 프레임 요청
     * @param {Function} callback - 콜백 함수
     * @returns {number} 애니메이션 프레임 ID
     */
    requestAnimationFrame(callback) {
        return window.requestAnimationFrame(callback.bind(this));
    }

    /**
     * 디바운스 함수 생성
     * @param {Function} func - 대상 함수
     * @param {number} wait - 대기 시간 (ms)
     * @returns {Function} 디바운스된 함수
     */
    debounce(func, wait = 300) {
        let timeout;
        
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * 스로틀 함수 생성
     * @param {Function} func - 대상 함수
     * @param {number} limit - 제한 시간 (ms)
     * @returns {Function} 스로틀된 함수
     */
    throttle(func, limit = 300) {
        let inThrottle;
        
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 로그 출력
     * @param {string} level - 로그 레벨 (info, warn, error)
     * @param {string} message - 메시지
     * @param {any} data - 추가 데이터
     */
    log(level, message, data = null) {
        if (!this.options.debug && level !== 'error') return;
        
        const prefix = `[${this.constructor.name}]`;
        const logMessage = `${prefix} ${message}`;
        
        switch (level) {
        case 'info':
            data ? console.log(logMessage, data) : console.log(logMessage);
            break;
        case 'warn':
            data ? console.warn(logMessage, data) : console.warn(logMessage);
            break;
        case 'error':
            data ? console.error(logMessage, data) : console.error(logMessage);
            break;
        default:
            data ? console.log(logMessage, data) : console.log(logMessage);
        }
    }

    /**
     * 로컬 스토리지 저장
     * @param {string} key - 키
     * @param {any} value - 값
     */
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            this.log('error', 'Failed to save to localStorage', error);
        }
    }

    /**
     * 로컬 스토리지에서 가져오기
     * @param {string} key - 키
     * @param {any} defaultValue - 기본값
     * @returns {any}
     */
    getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            this.log('error', 'Failed to get from localStorage', error);
            return defaultValue;
        }
    }

    /**
     * 로컬 스토리지에서 삭제
     * @param {string} key - 키
     */
    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            this.log('error', 'Failed to remove from localStorage', error);
        }
    }
}

// 기본 내보내기
export default BaseComponent;