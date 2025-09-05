/**
 * WAVE SPACE - 데이터 관리자
 * 전역 데이터 상태 관리 및 설정 관리
 * 기존 WaveSpaceData.js에서 데이터 관리 부분만 추출
 * 
 * @version 2.0.0
 * @author WAVE SPACE Team
 */

import { errorHandler } from './errorHandler.js';

/**
 * 애플리케이션 데이터 매니저
 */
export class DataManager {
    constructor() {
        this.config = this.initConfig();
        this.cache = new Map();
        this.subscribers = new Map();
        
        console.log('[DataManager] 데이터 관리자 초기화 완료');
    }

    /**
     * 설정 초기화
     * @returns {Object} 초기 설정
     */
    initConfig() {
        return {
            apiEndpoint: '/api',
            version: '2.0.0',
            debug: window.ENV?.isDevelopment() || false,
            maxCacheSize: 100,
            cacheTimeout: 5 * 60 * 1000, // 5분
            retryAttempts: 3,
            requestTimeout: 30000 // 30초
        };
    }

    /**
     * 설정 값 조회
     * @param {string} key 설정 키
     * @param {*} defaultValue 기본값
     * @returns {*} 설정값
     */
    getConfig(key, defaultValue = null) {
        return key.split('.').reduce((obj, k) => obj?.[k], this.config) ?? defaultValue;
    }

    /**
     * 설정 값 변경
     * @param {string} key 설정 키
     * @param {*} value 설정값
     */
    setConfig(key, value) {
        const keys = key.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        
        // 구독자들에게 알림
        this.notifyConfigChange(key, value);
    }

    /**
     * 캐시 저장
     * @param {string} key 캐시 키
     * @param {*} data 데이터
     * @param {number} ttl 생존시간 (ms)
     */
    setCache(key, data, ttl = null) {
        const expireAt = Date.now() + (ttl || this.config.cacheTimeout);
        
        this.cache.set(key, {
            data,
            expireAt,
            createdAt: Date.now()
        });

        // 캐시 크기 제한
        if (this.cache.size > this.config.maxCacheSize) {
            this.cleanupCache();
        }
    }

    /**
     * 캐시 조회
     * @param {string} key 캐시 키
     * @returns {*} 캐시된 데이터 또는 null
     */
    getCache(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }

        // 만료 확인
        if (Date.now() > cached.expireAt) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * 캐시 삭제
     * @param {string} key 캐시 키
     */
    deleteCache(key) {
        this.cache.delete(key);
    }

    /**
     * 캐시 정리
     */
    cleanupCache() {
        const now = Date.now();
        const entries = Array.from(this.cache.entries());
        
        // 만료된 항목들 제거
        entries.forEach(([key, value]) => {
            if (now > value.expireAt) {
                this.cache.delete(key);
            }
        });

        // 여전히 크기가 초과하면 오래된 순으로 제거
        if (this.cache.size > this.config.maxCacheSize) {
            const sortedEntries = entries
                .filter(([key, value]) => now <= value.expireAt)
                .sort((a, b) => a[1].createdAt - b[1].createdAt);
            
            const toDelete = this.cache.size - this.config.maxCacheSize;
            for (let i = 0; i < toDelete; i++) {
                if (sortedEntries[i]) {
                    this.cache.delete(sortedEntries[i][0]);
                }
            }
        }
    }

    /**
     * 데이터 구독
     * @param {string} event 이벤트 이름
     * @param {Function} callback 콜백 함수
     * @returns {Function} 구독 해제 함수
     */
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }

        this.subscribers.get(event).push(callback);

        // 구독 해제 함수 반환
        return () => {
            const callbacks = this.subscribers.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * 이벤트 발행
     * @param {string} event 이벤트 이름
     * @param {*} data 데이터
     */
    publish(event, data) {
        const callbacks = this.subscribers.get(event);
        if (callbacks && callbacks.length > 0) {
            callbacks.forEach(callback => {
                try {
                    callback(data, event);
                } catch (error) {
                    errorHandler.error(`구독자 콜백 오류: ${event}`, {
                        error: error.message,
                        event,
                        data
                    });
                }
            });
        }
    }

    /**
     * 설정 변경 알림
     * @param {string} key 변경된 키
     * @param {*} value 새로운 값
     */
    notifyConfigChange(key, value) {
        this.publish('config:change', { key, value });
        this.publish(`config:change:${key}`, value);
    }

    /**
     * API 요청 헬퍼
     * @param {string} endpoint 엔드포인트
     * @param {Object} options 옵션
     * @returns {Promise} 응답 Promise
     */
    async apiRequest(endpoint, options = {}) {
        const url = `${this.config.apiEndpoint}${endpoint}`;
        const requestOptions = {
            timeout: this.config.requestTimeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // 캐시 확인 (GET 요청만)
        if (!options.method || options.method.toUpperCase() === 'GET') {
            const cacheKey = `api:${endpoint}:${JSON.stringify(options.params || {})}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const response = await this.fetchWithTimeout(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // 성공한 GET 요청은 캐시
            if (!options.method || options.method.toUpperCase() === 'GET') {
                const cacheKey = `api:${endpoint}:${JSON.stringify(options.params || {})}`;
                this.setCache(cacheKey, data);
            }

            return data;

        } catch (error) {
            errorHandler.error(`API 요청 실패: ${endpoint}`, {
                endpoint,
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * 타임아웃 포함 fetch
     * @param {string} url URL
     * @param {Object} options 옵션
     * @returns {Promise} fetch Promise
     */
    async fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * 재시도 로직 포함 작업 실행
     * @param {Function} task 실행할 작업
     * @param {number} maxAttempts 최대 시도 횟수
     * @param {number} delay 재시도 간격 (ms)
     * @returns {Promise} 작업 결과
     */
    async retryOperation(task, maxAttempts = null, delay = 1000) {
        maxAttempts = maxAttempts || this.config.retryAttempts;
        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await task();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxAttempts) {
                    break;
                }

                // 재시도 대기
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
                
                if (this.config.debug) {
                    console.warn(`작업 재시도 ${attempt}/${maxAttempts}:`, error.message);
                }
            }
        }

        throw lastError;
    }

    /**
     * 디버그 정보 출력
     */
    getDebugInfo() {
        return {
            config: this.config,
            cacheSize: this.cache.size,
            subscriberCount: Array.from(this.subscribers.values())
                .reduce((total, callbacks) => total + callbacks.length, 0),
            cacheKeys: Array.from(this.cache.keys()),
            events: Array.from(this.subscribers.keys())
        };
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        this.cache.clear();
        this.subscribers.clear();
        console.log('[DataManager] 리소스 정리 완료');
    }
}

// 전역 인스턴스 생성
export const dataManager = new DataManager();

// 전역 호환성
window.DataManager = dataManager;

export default dataManager;