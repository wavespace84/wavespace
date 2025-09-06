/**
 * WAVE SPACE - Core 유틸리티 모듈
 * 코어 시스템에서 공통으로 사용하는 유틸리티 함수들
 * 중복 제거 및 성능 최적화 적용
 */

/**
 * 통합된 성능 최적화 유틸리티 클래스
 */
export class PerformanceUtils {
    /**
     * 디바운스 함수 - 연속적인 이벤트 호출을 제한
     * @param {Function} func 실행할 함수
     * @param {number} wait 지연 시간 (ms)
     * @param {boolean} immediate 즉시 실행 여부
     * @returns {Function} 디바운스된 함수
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * 쓰로틀 함수 - 일정 시간 간격으로만 함수 실행
     * @param {Function} func 실행할 함수
     * @param {number} limit 제한 시간 (ms)
     * @returns {Function} 쓰로틀된 함수
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 리드 쓰로틀 - 마지막 호출도 보장하는 쓰로틀
     * @param {Function} func 실행할 함수
     * @param {number} limit 제한 시간 (ms)
     * @returns {Function} 리드 쓰로틀된 함수
     */
    static throttleLead(func, limit) {
        let inThrottle;
        let lastFunc;
        let lastRan;
        
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                lastRan = Date.now();
                inThrottle = true;
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    /**
     * 마이크로 태스크 스케줄링
     * @param {Function} callback 실행할 콜백
     * @returns {Promise} 완료 Promise
     */
    static nextTick(callback) {
        return Promise.resolve().then(callback);
    }

    /**
     * 애니메이션 프레임 스케줄링
     * @param {Function} callback 실행할 콜백
     * @returns {number} 요청 ID
     */
    static nextFrame(callback) {
        return requestAnimationFrame(callback);
    }

    /**
     * 무한 루프 방지 타이머
     * @param {Function} condition 조건 함수
     * @param {Function} callback 실행할 콜백
     * @param {number} timeout 타임아웃 (ms)
     * @param {number} interval 체크 간격 (ms)
     * @returns {Promise} 완료 Promise
     */
    static waitFor(condition, callback, timeout = 10000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const timer = setInterval(() => {
                if (condition()) {
                    clearInterval(timer);
                    const result = callback ? callback() : true;
                    resolve(result);
                } else if (Date.now() - startTime >= timeout) {
                    clearInterval(timer);
                    reject(new Error(`Timeout after ${timeout}ms`));
                }
            }, interval);
        });
    }
}

/**
 * 통합된 DOM 유틸리티 클래스
 */
export class DOMUtils {
    /**
     * 안전한 DOM 요소 선택
     * @param {string} selector CSS 선택자
     * @param {Element} context 컨텍스트 요소
     * @returns {Element|null} 선택된 요소
     */
    static querySelector(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.error('Invalid selector:', selector, error);
            return null;
        }
    }

    /**
     * 안전한 DOM 요소 다중 선택
     * @param {string} selector CSS 선택자
     * @param {Element} context 컨텍스트 요소
     * @returns {NodeList} 선택된 요소들
     */
    static querySelectorAll(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.error('Invalid selector:', selector, error);
            return [];
        }
    }

    /**
     * 요소가 뷰포트에 보이는지 확인
     * @param {Element} element 확인할 요소
     * @param {number} threshold 임계값 (0-1)
     * @returns {boolean} 보임 여부
     */
    static isInViewport(element, threshold = 0) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
        
        if (threshold === 0) {
            return vertInView && horInView;
        }
        
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
        const visibleArea = Math.max(0, visibleHeight) * Math.max(0, visibleWidth);
        const totalArea = rect.height * rect.width;
        
        return (visibleArea / totalArea) >= threshold;
    }

    /**
     * CSS 클래스 토글 (다중 지원)
     * @param {Element} element 대상 요소
     * @param {string|Array} classes 클래스명들
     * @param {boolean} force 강제 설정
     */
    static toggleClass(element, classes, force) {
        if (!element) return;
        
        const classList = Array.isArray(classes) ? classes : [classes];
        classList.forEach(className => {
            if (className) {
                element.classList.toggle(className, force);
            }
        });
    }

    /**
     * 요소의 데이터 속성 안전하게 가져오기
     * @param {Element} element 대상 요소
     * @param {string} key 데이터 키
     * @param {*} defaultValue 기본값
     * @returns {*} 데이터 값
     */
    static getData(element, key, defaultValue = null) {
        if (!element || !key) return defaultValue;
        
        const value = element.dataset[key];
        if (value === undefined) return defaultValue;
        
        // 타입 추론
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'null') return null;
        if (!isNaN(value) && !isNaN(parseFloat(value))) return parseFloat(value);
        
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
}

/**
 * 통합된 문자열 유틸리티 클래스
 */
export class StringUtils {
    /**
     * HTML 특수문자 이스케이프 (통합 버전)
     * @param {string} text 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    static escapeHtml(text) {
        if (typeof text !== 'string') {
            return String(text);
        }
        
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return text.replace(/[&<>"'`=\/]/g, (match) => escapeMap[match]);
    }

    /**
     * HTML 언이스케이프
     * @param {string} text 언이스케이프할 텍스트
     * @returns {string} 언이스케이프된 텍스트
     */
    static unescapeHtml(text) {
        if (typeof text !== 'string') {
            return String(text);
        }
        
        const unescapeMap = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#x27;': '\'',
            '&#x2F;': '/',
            '&#x60;': '`',
            '&#x3D;': '='
        };
        
        return text.replace(/&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g, (match) => unescapeMap[match]);
    }

    /**
     * 문자열 자르기 (한글 지원)
     * @param {string} text 원본 텍스트
     * @param {number} maxLength 최대 길이
     * @param {string} suffix 접미사
     * @returns {string} 자른 텍스트
     */
    static truncate(text, maxLength, suffix = '...') {
        if (typeof text !== 'string') {
            text = String(text);
        }
        
        if (text.length <= maxLength) {
            return text;
        }
        
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * 랜덤 문자열 생성
     * @param {number} length 길이
     * @param {string} charset 문자 집합
     * @returns {string} 랜덤 문자열
     */
    static randomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    /**
     * 슬러그 생성 (한글 지원)
     * @param {string} text 원본 텍스트
     * @returns {string} 슬러그
     */
    static slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-가-힣]/g, '') // 한글 허용
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}

/**
 * 통합된 객체 유틸리티 클래스
 */
export class ObjectUtils {
    /**
     * 깊은 복사
     * @param {*} obj 복사할 객체
     * @returns {*} 복사된 객체
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        
        return obj;
    }

    /**
     * 객체 병합 (깊은 병합)
     * @param {Object} target 대상 객체
     * @param {...Object} sources 소스 객체들
     * @returns {Object} 병합된 객체
     */
    static deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    }

    /**
     * 객체 여부 확인
     * @param {*} item 확인할 항목
     * @returns {boolean} 객체 여부
     */
    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * 객체가 비어있는지 확인
     * @param {Object} obj 확인할 객체
     * @returns {boolean} 빈 객체 여부
     */
    static isEmpty(obj) {
        if (obj == null) return true;
        if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
        return Object.keys(obj).length === 0;
    }

    /**
     * 중첩된 속성값 가져오기 (안전한 접근)
     * @param {Object} obj 대상 객체
     * @param {string} path 속성 경로 (예: 'user.profile.name')
     * @param {*} defaultValue 기본값
     * @returns {*} 속성값
     */
    static get(obj, path, defaultValue = undefined) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result == null || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result !== undefined ? result : defaultValue;
    }
}

/**
 * 전역 호환성을 위한 함수들 (기존 API 유지)
 */
window.debounce = PerformanceUtils.debounce;
window.throttle = PerformanceUtils.throttle;

// 백워드 호환성을 위한 export
export const debounce = PerformanceUtils.debounce;
export const throttle = PerformanceUtils.throttle;
export const escapeHtml = StringUtils.escapeHtml;

// 전체 모듈 export
export default {
    PerformanceUtils,
    DOMUtils,
    StringUtils,
    ObjectUtils,
    // 편의 함수들
    debounce: PerformanceUtils.debounce,
    throttle: PerformanceUtils.throttle,
    escapeHtml: StringUtils.escapeHtml
};