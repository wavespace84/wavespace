/**
 * WAVE SPACE - 공통 유틸리티 함수
 * 자주 사용되는 유틸리티 함수 모음
 */

/**
 * 디바운스 함수
 * 연속적인 이벤트 호출을 제한
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 쓰로틀 함수
 * 일정 시간 간격으로만 함수 실행
 */
function throttle(func, limit) {
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
 * 로딩 상태 관리자
 */
class LoadingManager {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            showSpinner: true,
            disableElement: true,
            spinnerClass: 'loading-spinner',
            loadingClass: 'is-loading',
            ...options
        };
        this.originalContent = null;
    }

    start(loadingText = '로딩 중...') {
        if (this.element.classList.contains(this.options.loadingClass)) {
            return; // 이미 로딩 중
        }

        this.originalContent = this.element.innerHTML;
        this.element.classList.add(this.options.loadingClass);

        if (this.options.disableElement) {
            this.element.disabled = true;
        }

        if (this.options.showSpinner) {
            this.element.innerHTML = `
                <span class="${this.options.spinnerClass}">
                    <i class="fas fa-spinner fa-spin"></i> ${loadingText}
                </span>
            `;
        }
    }

    stop() {
        this.element.classList.remove(this.options.loadingClass);
        
        if (this.originalContent !== null) {
            this.element.innerHTML = this.originalContent;
        }

        if (this.options.disableElement) {
            this.element.disabled = false;
        }
    }
}

/**
 * 로컬스토리지 헬퍼
 */
const Storage = {
    /**
     * 데이터 저장 (자동 JSON 변환)
     */
    set(key, value, expireHours = null) {
        const data = {
            value,
            timestamp: Date.now()
        };

        if (expireHours) {
            data.expireAt = Date.now() + (expireHours * 60 * 60 * 1000);
        }

        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage.set error:', e);
            return false;
        }
    },

    /**
     * 데이터 조회 (자동 JSON 파싱)
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const data = JSON.parse(item);
            
            // 만료 확인
            if (data.expireAt && Date.now() > data.expireAt) {
                localStorage.removeItem(key);
                return defaultValue;
            }

            return data.value;
        } catch (e) {
            console.error('Storage.get error:', e);
            return defaultValue;
        }
    },

    /**
     * 데이터 삭제
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * 키 존재 여부 확인
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    },

    /**
     * 모든 데이터 삭제
     */
    clear() {
        localStorage.clear();
    }
};

/**
 * URL 파라미터 헬퍼
 */
const URLParams = {
    /**
     * URL 파라미터 가져오기
     */
    get(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    /**
     * 모든 파라미터 객체로 가져오기
     */
    getAll() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        params.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    },

    /**
     * URL 파라미터 설정
     */
    set(name, value) {
        const params = new URLSearchParams(window.location.search);
        params.set(name, value);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
    },

    /**
     * URL 파라미터 제거
     */
    remove(name) {
        const params = new URLSearchParams(window.location.search);
        params.delete(name);
        const newUrl = params.toString() 
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        window.history.pushState({}, '', newUrl);
    }
};

/**
 * 요소 표시/숨김 애니메이션
 */
const ElementToggle = {
    /**
     * 부드럽게 표시
     */
    show(element, duration = 300) {
        element.style.display = 'block';
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    },

    /**
     * 부드럽게 숨김
     */
    hide(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    },

    /**
     * 토글
     */
    toggle(element, duration = 300) {
        if (window.getComputedStyle(element).display === 'none') {
            this.show(element, duration);
        } else {
            this.hide(element, duration);
        }
    }
};

/**
 * 배열 유틸리티
 */
const ArrayUtils = {
    /**
     * 배열을 청크로 분할
     */
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },

    /**
     * 중복 제거
     */
    unique(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },

    /**
     * 배열 섞기
     */
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};

/**
 * 에러 재시도 래퍼
 */
async function retry(fn, options = {}) {
    const {
        maxAttempts = 3,
        delay = 1000,
        backoff = 2,
        onError = null
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (onError) {
                onError(error, attempt);
            }
            
            if (attempt < maxAttempts) {
                const waitTime = delay * Math.pow(backoff, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    throw lastError;
}

/**
 * 클립보드 복사
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // 폴백: 임시 textarea 사용
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            return true;
        } catch (err) {
            console.error('클립보드 복사 실패:', err);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

/**
 * 스크롤 위치 저장/복원
 */
const ScrollPosition = {
    positions: new Map(),
    
    /**
     * 현재 스크롤 위치 저장
     */
    save(key = 'default') {
        this.positions.set(key, window.scrollY);
    },
    
    /**
     * 저장된 스크롤 위치로 복원
     */
    restore(key = 'default', smooth = true) {
        const position = this.positions.get(key);
        if (position !== undefined) {
            window.scrollTo({
                top: position,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }
};

// 전역으로 사용할 수 있도록 export
window.WaveUtils = {
    debounce,
    throttle,
    LoadingManager,
    Storage,
    URLParams,
    ElementToggle,
    ArrayUtils,
    retry,
    copyToClipboard,
    ScrollPosition
};