// 🎭 통합 이벤트 시스템 - 모든 사용자 상호작용 중앙 관리
// 설계자: Architecture Specialist | XSS 보호 및 성능 최적화 적용

export class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.throttledEvents = new Map();
        this.debounceTimers = new Map();

        // 보안: XSS 공격 방지를 위한 화이트리스트
        this.allowedEvents = [
            'click',
            'submit',
            'change',
            'input',
            'focus',
            'blur',
            'mouseenter',
            'mouseleave',
            'keydown',
            'keyup',
            'scroll',
            'resize',
        ];

        console.log('[EventSystem] 이벤트 시스템 초기화 완료');
    }

    // 🛡️ 안전한 이벤트 리스너 등록
    on(element, eventType, handler, options = {}) {
        // 보안 검증
        if (!this.allowedEvents.includes(eventType)) {
            window.WaveSpaceData?.errorHandler?.log(
                'warn',
                `허용되지 않은 이벤트 타입: ${eventType}`,
                { element: element.tagName, eventType }
            );
            return false;
        }

        // 핸들러 래핑 (에러 처리 + XSS 보호)
        const safeHandler = this.wrapHandler(handler, eventType);

        // 성능 최적화 옵션 적용
        if (options.throttle) {
            const throttledHandler = this.throttle(safeHandler, options.throttle);
            element.addEventListener(eventType, throttledHandler, options.passive || false);

            // 정리를 위해 등록
            const key = `${element.id || 'anonymous'}-${eventType}`;
            this.throttledEvents.set(key, throttledHandler);
        } else if (options.debounce) {
            const debouncedHandler = this.debounce(safeHandler, options.debounce);
            element.addEventListener(eventType, debouncedHandler, options.passive || false);
        } else {
            element.addEventListener(eventType, safeHandler, options.passive || false);
        }

        // 등록된 리스너 추적
        const listenerKey = `${element.tagName}-${eventType}`;
        if (!this.listeners.has(listenerKey)) {
            this.listeners.set(listenerKey, []);
        }
        this.listeners.get(listenerKey).push(safeHandler);

        return true;
    }

    // 🔒 핸들러 보안 래핑
    wrapHandler(handler, eventType) {
        return (event) => {
            try {
                // 입력 데이터 정화 (XSS 방지)
                if (event.target && event.target.value) {
                    const sanitized = window.WaveSpaceData?.security?.sanitizeInput(
                        event.target.value
                    );
                    if (sanitized !== event.target.value) {
                        event.target.value = sanitized;
                        window.WaveSpaceData?.errorHandler?.log('warn', 'XSS 시도 감지 및 차단', {
                            eventType,
                            originalValue: event.target.value,
                            sanitizedValue: sanitized,
                        });
                    }
                }

                // 핸들러 실행
                return handler(event);
            } catch (error) {
                window.WaveSpaceData?.errorHandler?.log(
                    'error',
                    `이벤트 핸들러 실행 오류: ${eventType}`,
                    { error: error.message, stack: error.stack }
                );
                return false;
            }
        };
    }

    // ⚡ 성능 최적화: 쓰로틀링
    throttle(func, delay) {
        let inThrottle;
        return function (event) {
            if (!inThrottle) {
                func.apply(this, [event]);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), delay);
            }
        };
    }

    // ⚡ 성능 최적화: 디바운싱
    debounce(func, delay) {
        return (event) => {
            const key = `${event.target.id || 'anonymous'}-${event.type}`;
            clearTimeout(this.debounceTimers.get(key));
            this.debounceTimers.set(
                key,
                setTimeout(() => func(event), delay)
            );
        };
    }

    // 🗑️ 리스너 정리 (메모리 누수 방지)
    cleanup() {
        this.listeners.clear();
        this.throttledEvents.clear();
        this.debounceTimers.forEach((timer) => clearTimeout(timer));
        this.debounceTimers.clear();

        console.log('[EventSystem] 이벤트 시스템 정리 완료');
    }

    // 📊 디버깅: 등록된 이벤트 현황
    getStats() {
        return {
            listeners: this.listeners.size,
            throttledEvents: this.throttledEvents.size,
            debounceTimers: this.debounceTimers.size,
        };
    }
}

// 전역 인스턴스 생성
export const eventSystem = new EventSystem();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    eventSystem.cleanup();
});
