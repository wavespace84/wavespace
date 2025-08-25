// 유틸리티 함수 모듈

/**
 * DOM 요소 선택 헬퍼
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

/**
 * 이벤트 리스너 헬퍼
 */
export const on = (element, event, handler, options) => {
    if (element instanceof NodeList || Array.isArray(element)) {
        element.forEach((el) => el.addEventListener(event, handler, options));
    } else if (element) {
        element.addEventListener(event, handler, options);
    }
};

export const off = (element, event, handler, options) => {
    if (element instanceof NodeList || Array.isArray(element)) {
        element.forEach((el) => el.removeEventListener(event, handler, options));
    } else if (element) {
        element.removeEventListener(event, handler, options);
    }
};

/**
 * 디바운스 함수
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * 쓰로틀 함수
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * 로컬 스토리지 헬퍼
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    remove(key) {
        try {
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    clear() {
        try {
            window.localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },
};

/**
 * 숫자 포맷팅
 */
export const formatNumber = (num, locale = 'ko-KR') => {
    return new Intl.NumberFormat(locale).format(num);
};

/**
 * 날짜 포맷팅
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

/**
 * 상대 시간 표시
 */
export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
        년: 31536000,
        개월: 2592000,
        주: 604800,
        일: 86400,
        시간: 3600,
        분: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval}${unit} 전`;
        }
    }

    return '방금 전';
};

/**
 * 클래스 토글
 */
export const toggleClass = (element, className) => {
    if (element) {
        element.classList.toggle(className);
    }
};

/**
 * 페이드 인/아웃 애니메이션
 */
export const fadeIn = (element, duration = 300) => {
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms`;

    requestAnimationFrame(() => {
        element.style.opacity = '1';
    });
};

export const fadeOut = (element, duration = 300) => {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';

    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
};

/**
 * API 요청 헬퍼
 */
export const api = {
    async get(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    async post(url, data, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                body: JSON.stringify(data),
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },
};

/**
 * 쿠키 관리
 */
export const cookie = {
    get(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    },

    set(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${value || ''}${expires}; path=/`;
    },

    remove(name) {
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    },
};

/**
 * 모바일 디바이스 체크
 */
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
};

/**
 * 스크롤 위치 관리
 */
export const scroll = {
    to(element, options = {}) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
        };

        element.scrollIntoView({ ...defaultOptions, ...options });
    },

    toTop(smooth = true) {
        window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto',
        });
    },

    getPosition() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop,
        };
    },
};

/**
 * 클립보드 복사
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

/**
 * URL 파라미터 관리
 */
export const urlParams = {
    get(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    set(name, value) {
        const params = new URLSearchParams(window.location.search);
        params.set(name, value);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
    },

    remove(name) {
        const params = new URLSearchParams(window.location.search);
        params.delete(name);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
    },

    getAll() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
};
