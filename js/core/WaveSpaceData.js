// WaveSpaceData.js - 전역 데이터 및 유틸리티 객체
// 누락된 전역 객체들을 정의하여 JavaScript 오류 방지

export class WaveSpaceData {
    constructor() {
        this.errorHandler = new ErrorHandler();
        this.security = new SecurityManager();
        this.config = {
            apiEndpoint: '/api',
            version: '1.0.0',
            debug: true
        };
        
        console.log('[WaveSpaceData] 전역 데이터 시스템 초기화');
    }
}

// 에러 핸들러 클래스
class ErrorHandler {
    constructor() {
        this.errors = [];
    }

    log(level, message, details = {}) {
        const error = {
            level,
            message,
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this.errors.push(error);
        
        // 콘솔에도 출력
        switch (level) {
            case 'error':
                console.error(`[${level.toUpperCase()}] ${message}`, details);
                break;
            case 'warn':
                console.warn(`[${level.toUpperCase()}] ${message}`, details);
                break;
            default:
                console.log(`[${level.toUpperCase()}] ${message}`, details);
        }
        
        // 에러가 10개 이상 쌓이면 오래된 것 제거
        if (this.errors.length > 10) {
            this.errors.shift();
        }
    }
    
    showUserError(message) {
        // 사용자에게 친화적인 오류 메시지 표시
        if (window.WaveSpaceData?.toast?.show) {
            window.WaveSpaceData.toast.show(message, 'error');
        } else {
            alert(message);
        }
    }
    
    getErrors() {
        return [...this.errors];
    }
    
    clearErrors() {
        this.errors = [];
    }
}

// 보안 관리자 클래스
class SecurityManager {
    constructor() {
        this.xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
        ];
    }
    
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        let sanitized = input;
        
        // XSS 패턴 제거
        this.xssPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        // HTML 엔티티 인코딩
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
            
        return sanitized;
    }
    
    validateToken(token) {
        // 간단한 토큰 검증 (실제로는 JWT 검증 등)
        return token && token.length > 0;
    }
}

// 전역 인스턴스 생성 및 window 객체에 등록
const waveSpaceData = new WaveSpaceData();

// 전역 접근 가능하도록 설정
if (typeof window !== 'undefined') {
    window.WaveSpaceData = waveSpaceData;
}

export default waveSpaceData;