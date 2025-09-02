/**
 * WAVE SPACE - 로깅 유틸리티
 * 개발/운영 환경에 따른 로그 레벨 관리
 */

// 로그 레벨 정의
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

// 로그 색상 (개발 환경용)
const LogColors = {
    DEBUG: '#999999',
    INFO: '#0066FF',
    WARN: '#FFA500',
    ERROR: '#FF4444'
};

// 로그 아이콘
const LogIcons = {
    DEBUG: '🔍',
    INFO: 'ℹ️',
    WARN: '⚠️',
    ERROR: '❌'
};

class Logger {
    constructor() {
        // 환경에 따른 로그 레벨 설정
        this.currentLevel = this.getLogLevel();
        this.enableTimestamp = true;
        this.enableCaller = false; // 호출 위치 표시 여부
    }

    /**
     * 환경에 따른 로그 레벨 결정
     */
    getLogLevel() {
        // 환경 변수 확인
        if (window.ENV && window.ENV.isProduction()) {
            return LogLevel.ERROR; // 운영: 에러만
        } else if (window.ENV && window.ENV.isDevelopment()) {
            return LogLevel.DEBUG; // 개발: 모든 로그
        }
        
        // 로컬스토리지에서 커스텀 설정 확인
        const customLevel = localStorage.getItem('waveLogLevel');
        if (customLevel) {
            return LogLevel[customLevel] || LogLevel.INFO;
        }
        
        return LogLevel.INFO; // 기본값
    }

    /**
     * 로그 레벨 변경
     */
    setLogLevel(level) {
        if (typeof level === 'string') {
            this.currentLevel = LogLevel[level.toUpperCase()] || LogLevel.INFO;
        } else {
            this.currentLevel = level;
        }
        localStorage.setItem('waveLogLevel', Object.keys(LogLevel)[this.currentLevel]);
    }

    /**
     * 로그 포맷팅
     */
    formatMessage(level, message, ...args) {
        const timestamp = this.enableTimestamp ? new Date().toISOString() : '';
        const caller = this.enableCaller ? this.getCaller() : '';
        const icon = LogIcons[Object.keys(LogLevel)[level]];
        
        const parts = [
            icon,
            timestamp && `[${timestamp}]`,
            caller && `(${caller})`,
            message
        ].filter(Boolean);
        
        return parts.join(' ');
    }

    /**
     * 호출 위치 추적
     */
    getCaller() {
        try {
            const stack = new Error().stack;
            const lines = stack.split('\n');
            // Logger 클래스를 호출한 실제 위치 찾기
            for (let i = 3; i < lines.length; i++) {
                const line = lines[i];
                if (!line.includes('logger.js')) {
                    const match = line.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
                    if (match) {
                        const file = match[2].split('/').pop();
                        return `${file}:${match[3]}`;
                    }
                }
            }
        } catch (e) {
            // 스택 추적 실패 시 무시
        }
        return '';
    }

    /**
     * 디버그 로그
     */
    debug(message, ...args) {
        if (this.currentLevel <= LogLevel.DEBUG) {
            const formatted = this.formatMessage(LogLevel.DEBUG, message, ...args);
            console.log(`%c${formatted}`, `color: ${LogColors.DEBUG}`, ...args);
        }
    }

    /**
     * 정보 로그
     */
    info(message, ...args) {
        if (this.currentLevel <= LogLevel.INFO) {
            const formatted = this.formatMessage(LogLevel.INFO, message, ...args);
            console.log(`%c${formatted}`, `color: ${LogColors.INFO}`, ...args);
        }
    }

    /**
     * 경고 로그
     */
    warn(message, ...args) {
        if (this.currentLevel <= LogLevel.WARN) {
            const formatted = this.formatMessage(LogLevel.WARN, message, ...args);
            console.warn(`%c${formatted}`, `color: ${LogColors.WARN}`, ...args);
        }
    }

    /**
     * 에러 로그
     */
    error(message, ...args) {
        if (this.currentLevel <= LogLevel.ERROR) {
            const formatted = this.formatMessage(LogLevel.ERROR, message, ...args);
            console.error(`%c${formatted}`, `color: ${LogColors.ERROR}`, ...args);
            
            // 운영 환경에서는 에러 추적 서비스로 전송
            if (window.ENV && window.ENV.isProduction()) {
                this.trackError(message, args);
            }
        }
    }

    /**
     * 그룹 로그
     */
    group(label) {
        if (this.currentLevel <= LogLevel.INFO) {
            console.group(label);
        }
    }

    /**
     * 그룹 종료
     */
    groupEnd() {
        if (this.currentLevel <= LogLevel.INFO) {
            console.groupEnd();
        }
    }

    /**
     * 테이블 로그
     */
    table(data) {
        if (this.currentLevel <= LogLevel.DEBUG) {
            console.table(data);
        }
    }

    /**
     * 시간 측정 시작
     */
    time(label) {
        if (this.currentLevel <= LogLevel.DEBUG) {
            console.time(label);
        }
    }

    /**
     * 시간 측정 종료
     */
    timeEnd(label) {
        if (this.currentLevel <= LogLevel.DEBUG) {
            console.timeEnd(label);
        }
    }

    /**
     * 에러 추적 (향후 구현)
     */
    trackError(message, args) {
        // TODO: Sentry, LogRocket 등 에러 추적 서비스 연동
        // 현재는 로컬스토리지에 저장
        try {
            const errors = JSON.parse(localStorage.getItem('waveErrors') || '[]');
            errors.push({
                message,
                args,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
            // 최대 50개까지만 저장
            if (errors.length > 50) {
                errors.shift();
            }
            localStorage.setItem('waveErrors', JSON.stringify(errors));
        } catch (e) {
            // 저장 실패 시 무시
        }
    }

    /**
     * 저장된 에러 로그 조회
     */
    getStoredErrors() {
        try {
            return JSON.parse(localStorage.getItem('waveErrors') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * 저장된 에러 로그 삭제
     */
    clearStoredErrors() {
        localStorage.removeItem('waveErrors');
    }
}

// 싱글톤 인스턴스 생성
const logger = new Logger();

// 전역으로 사용할 수 있도록 export
window.Logger = logger;

// 편의를 위한 전역 함수 (개발 환경에서만)
if (window.ENV && window.ENV.isDevelopment()) {
    window.log = {
        debug: (...args) => logger.debug(...args),
        info: (...args) => logger.info(...args),
        warn: (...args) => logger.warn(...args),
        error: (...args) => logger.error(...args),
        table: (data) => logger.table(data),
        time: (label) => logger.time(label),
        timeEnd: (label) => logger.timeEnd(label)
    };
}

// 기본 export (ES6 모듈이 아닌 경우를 위해 제거)
// export default logger;