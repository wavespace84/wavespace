// 🗂️ 중앙 상태 관리 시스템 - localStorage 기반 영구 상태 관리
// 설계자: Architecture Specialist | 타입 안전성 및 성능 최적화 적용

export class StateManager {
    constructor() {
        this.state = new Map();
        this.subscribers = new Map();
        this.storagePrefix = 'wave-space-';

        // 상태 키 화이트리스트 (보안)
        this.allowedKeys = [
            'user-preferences',
            'sidebar-state',
            'form-data',
            'ui-settings',
            'search-history',
            'filter-settings',
            'theme-mode',
            'notification-settings',
        ];

        // 초기 상태 로드
        this.loadFromStorage();

        console.log('[StateManager] 상태 관리 시스템 초기화 완료');
    }

    // 🔒 안전한 상태 설정
    setState(key, value, options = {}) {
        // 보안 검증
        if (!this.allowedKeys.includes(key)) {
            window.WaveSpaceData?.errorHandler?.log('warn', `허용되지 않은 상태 키: ${key}`, {
                key,
                value,
            });
            return false;
        }

        // 값 정화 (XSS 방지)
        const sanitizedValue = this.sanitizeValue(value);

        const oldValue = this.state.get(key);
        this.state.set(key, sanitizedValue);

        // localStorage 저장 (옵션)
        if (options.persist !== false) {
            this.saveToStorage(key, sanitizedValue);
        }

        // 구독자들에게 알림
        this.notifySubscribers(key, sanitizedValue, oldValue);

        return true;
    }

    // 📖 상태 조회
    getState(key, defaultValue = null) {
        if (!this.allowedKeys.includes(key)) {
            return defaultValue;
        }

        return this.state.get(key) || defaultValue;
    }

    // 📝 구독 시스템
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }

        const subscribers = this.subscribers.get(key);
        subscribers.push(callback);

        // 구독 해제 함수 반환
        return () => {
            const index = subscribers.indexOf(callback);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        };
    }

    // 🔔 구독자 알림
    notifySubscribers(key, newValue, oldValue) {
        const subscribers = this.subscribers.get(key);
        if (subscribers && subscribers.length > 0) {
            subscribers.forEach((callback) => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    window.WaveSpaceData?.errorHandler?.log('error', '상태 구독자 콜백 오류', {
                        key,
                        error: error.message,
                    });
                }
            });
        }
    }

    // 🛡️ 값 정화 (보안)
    sanitizeValue(value) {
        if (typeof value === 'string') {
            return window.WaveSpaceData?.security?.sanitizeInput(value) || value;
        } else if (typeof value === 'object' && value !== null) {
            // 객체인 경우 재귀적으로 정화
            if (Array.isArray(value)) {
                return value.map((item) => this.sanitizeValue(item));
            } else {
                const sanitized = {};
                for (const [k, v] of Object.entries(value)) {
                    sanitized[k] = this.sanitizeValue(v);
                }
                return sanitized;
            }
        }
        return value;
    }

    // 💾 localStorage 저장
    saveToStorage(key, value) {
        try {
            const serialized = JSON.stringify({
                value: value,
                timestamp: Date.now(),
                version: '1.0',
            });
            localStorage.setItem(this.storagePrefix + key, serialized);
        } catch (error) {
            window.WaveSpaceData?.errorHandler?.log('error', 'localStorage 저장 실패', {
                key,
                error: error.message,
            });
        }
    }

    // 📂 localStorage 로드
    loadFromStorage() {
        this.allowedKeys.forEach((key) => {
            try {
                const stored = localStorage.getItem(this.storagePrefix + key);
                if (stored) {
                    const parsed = JSON.parse(stored);

                    // 데이터 유효성 검증
                    if (parsed.value !== undefined && parsed.timestamp && parsed.version) {
                        // 1주일 이상된 데이터는 무시
                        const isExpired = Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000;
                        if (!isExpired) {
                            this.state.set(key, parsed.value);
                        }
                    }
                }
            } catch (error) {
                window.WaveSpaceData?.errorHandler?.log('warn', 'localStorage 로드 실패', {
                    key,
                    error: error.message,
                });
            }
        });
    }

    // 🗑️ 상태 삭제
    removeState(key) {
        if (!this.allowedKeys.includes(key)) {
            return false;
        }

        this.state.delete(key);
        localStorage.removeItem(this.storagePrefix + key);

        // 구독자들에게 알림
        this.notifySubscribers(key, undefined, undefined);

        return true;
    }

    // 🔧 전체 상태 초기화
    clearAll() {
        this.allowedKeys.forEach((key) => {
            this.state.delete(key);
            localStorage.removeItem(this.storagePrefix + key);
        });

        console.log('[StateManager] 모든 상태 초기화 완료');
    }

    // 📊 디버깅: 상태 현황
    getStats() {
        return {
            stateCount: this.state.size,
            subscriberCount: Array.from(this.subscribers.values()).reduce(
                (sum, subs) => sum + subs.length,
                0
            ),
            storageUsage: this.calculateStorageUsage(),
        };
    }

    // 💽 저장소 사용량 계산
    calculateStorageUsage() {
        let totalSize = 0;
        this.allowedKeys.forEach((key) => {
            const item = localStorage.getItem(this.storagePrefix + key);
            if (item) {
                totalSize += item.length;
            }
        });
        return `${(totalSize / 1024).toFixed(2)} KB`;
    }
}

// 전역 인스턴스 생성
export const stateManager = new StateManager();
