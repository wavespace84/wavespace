/**
 * WAVE SPACE - 통합 보안 모듈
 * XSS 보호, DOM 안전성, 입력값 검증을 통합한 보안 모듈
 * 
 * 기존 파일들과 호환성을 유지하면서 중복 기능을 통합
 * - js/utils/xssProtection.js
 * - js/utils/domSafety.js 
 * - js/core/WaveSpaceData.js SecurityManager
 * 
 * @version 1.0.0
 * @author WAVE SPACE Team
 */

class WaveSpaceSecurity {
    constructor() {
        // XSS 공격 패턴 정의 (모든 파일의 패턴 통합)
        this.xssPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /<embed[^>]*>/gi,
            /<object[^>]*>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /data:text\/html/gi,
            /on\w+\s*=/gi, // onclick, onload 등 이벤트 핸들러
            /<link[^>]*>/gi,
            /<meta[^>]*>/gi,
            /<form[^>]*>/gi
        ];
        
        // 위험한 URL 프로토콜
        this.dangerousProtocols = /^(javascript|data|vbscript|file|ftp):/i;
        
        // 안전한 HTML 속성 목록
        this.safeAttributes = [
            'class', 'id', 'data-', 'aria-', 'role', 'type', 'name', 
            'value', 'placeholder', 'title', 'alt', 'src', 'href'
        ];
        
        console.log('[WaveSpaceSecurity] 통합 보안 모듈 초기화 완료');
    }
    
    /**
     * HTML 문자열을 안전하게 이스케이프
     * 모든 HTML 특수문자를 엔티티로 변환
     * @param {string} unsafe - 이스케이프할 문자열
     * @returns {string} 이스케이프된 문자열
     */
    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    /**
     * DOM API를 사용한 안전한 HTML 이스케이프
     * 브라우저 내장 기능 활용으로 더 안전함
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    escapeHtmlDOM(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 템플릿 리터럴에서 사용자 입력값을 안전하게 처리
     * @param {*} value - 처리할 값
     * @returns {string} 안전한 문자열
     */
    safe(value) {
        if (value === null || value === undefined) return '';
        return this.escapeHtml(String(value));
    }
    
    /**
     * XSS 공격 패턴 검사
     * @param {string} text - 검사할 텍스트
     * @returns {boolean} 위험한 패턴이 있으면 true
     */
    detectXSS(text) {
        if (typeof text !== 'string') return false;
        
        return this.xssPatterns.some(pattern => pattern.test(text));
    }
    
    /**
     * XSS 공격 패턴 제거
     * @param {string} input - 정제할 입력값
     * @returns {string} 정제된 문자열
     */
    removeXSS(input) {
        if (typeof input !== 'string') return input;
        
        let sanitized = input;
        
        // XSS 패턴 제거
        this.xssPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        return sanitized;
    }
    
    /**
     * URL을 안전하게 검증 및 처리
     * @param {string} url - 검증할 URL
     * @returns {string} 안전한 URL 또는 '#'
     */
    safeUrl(url) {
        if (!url || typeof url !== 'string') return '#';
        
        const trimmedUrl = url.trim();
        if (!trimmedUrl) return '#';
        
        // 위험한 프로토콜 검사
        if (this.dangerousProtocols.test(trimmedUrl)) {
            console.warn('[Security] 위험한 URL 프로토콜 차단:', trimmedUrl);
            return '#';
        }
        
        // 상대 경로나 안전한 절대 경로만 허용
        if (trimmedUrl.startsWith('/') || 
            trimmedUrl.startsWith('http://') || 
            trimmedUrl.startsWith('https://') ||
            trimmedUrl.startsWith('#') ||
            trimmedUrl.startsWith('mailto:')) {
            return trimmedUrl;
        }
        
        return '#';
    }
    
    /**
     * HTML 속성값을 안전하게 처리
     * @param {string} attr - 속성 이름
     * @param {string} value - 속성 값
     * @returns {string} 안전한 속성 문자열 또는 빈 문자열
     */
    safeAttr(attr, value) {
        if (typeof attr !== 'string' || typeof value !== 'string') return '';
        
        const lowerAttr = attr.toLowerCase();
        
        // 이벤트 핸들러 속성 차단
        if (lowerAttr.startsWith('on')) {
            console.warn('[Security] 이벤트 핸들러 속성 차단:', attr);
            return '';
        }
        
        // 안전한 속성인지 확인
        const isSafe = this.safeAttributes.some(safe => 
            lowerAttr === safe || lowerAttr.startsWith(safe)
        );
        
        if (!isSafe) {
            console.warn('[Security] 안전하지 않은 속성 차단:', attr);
            return '';
        }
        
        return `${attr}="${this.escapeHtml(value)}"`;
    }
    
    /**
     * 사용자 입력값 타입별 검증 및 정제
     * @param {string} input - 사용자 입력값
     * @param {string} type - 입력 타입 (text, email, url, number, alphanumeric)
     * @returns {string} 정제된 입력값
     */
    sanitizeInput(input, type = 'text') {
        if (typeof input !== 'string') return '';
        
        // 기본 정제: 앞뒤 공백 제거
        let sanitized = input.trim();
        
        // XSS 패턴 제거
        sanitized = this.removeXSS(sanitized);
        
        // 타입별 추가 정제
        switch (type.toLowerCase()) {
        case 'email':
            // 이메일 형식 검증
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(sanitized) ? sanitized : '';
                
        case 'url':
            // URL 형식 검증
            try {
                new URL(sanitized);
                return this.safeUrl(sanitized);
            } catch {
                return '';
            }
                
        case 'number':
            // 숫자만 허용 (소수점, 음수 포함)
            const numberOnly = sanitized.replace(/[^0-9.-]/g, '');
            return isNaN(parseFloat(numberOnly)) ? '' : numberOnly;
                
        case 'alphanumeric':
            // 영문자와 숫자만 허용
            return sanitized.replace(/[^a-zA-Z0-9]/g, '');
                
        case 'korean':
            // 한글, 영문, 숫자, 일부 특수문자만 허용
            return sanitized.replace(/[^가-힣a-zA-Z0-9\s\-_.]/g, '');
                
        case 'safe_html':
            // 안전한 HTML 태그만 허용 (기본적인 텍스트 포맷팅)
            return this.sanitizeHtml(sanitized);
                
        default:
            // 기본: HTML 특수문자 이스케이프
            return this.escapeHtml(sanitized);
        }
    }
    
    /**
     * 제한된 HTML 태그만 허용하는 HTML 정제
     * @param {string} html - 정제할 HTML
     * @returns {string} 정제된 HTML
     */
    sanitizeHtml(html) {
        // 허용할 태그와 속성 정의
        const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'span'];
        const allowedAttrs = ['class'];
        
        // 간단한 HTML 정제 (실제 프로덕션에서는 DOMPurify 사용 권장)
        let sanitized = html;
        
        // 허용되지 않은 태그 제거
        sanitized = sanitized.replace(/<(?!\/?(?:p|br|strong|em|u|span)(?:\s|>))[^>]*>/gi, '');
        
        // 모든 속성 제거 (class 제외)
        sanitized = sanitized.replace(/(<\w+)([^>]*)(>)/gi, (match, tag, attrs, close) => {
            const classMatch = attrs.match(/class="[^"]*"/i);
            return tag + (classMatch ? ` ${classMatch[0]}` : '') + close;
        });
        
        return sanitized;
    }
    
    /**
     * 안전한 HTML 생성을 위한 템플릿 태그 함수
     * @param {string[]} strings - 템플릿 문자열 배열
     * @param {...any} values - 템플릿 값들
     * @returns {string} 안전한 HTML 문자열
     */
    safeHtml(strings, ...values) {
        let result = strings[0];
        
        for (let i = 0; i < values.length; i++) {
            result += this.safe(values[i]) + strings[i + 1];
        }
        
        return result;
    }
    
    /**
     * 안전하게 HTML 설정 (신뢰할 수 있는 컨텐츠 구분)
     * @param {HTMLElement} element - 대상 요소
     * @param {string} html - 설정할 HTML
     * @param {boolean} trusted - 신뢰할 수 있는 컨텐츠인지 여부
     */
    setSafeHtml(element, html, trusted = false) {
        if (!element) return;
        
        if (trusted) {
            // 신뢰할 수 있는 컨텐츠만 innerHTML 사용
            element.innerHTML = html;
        } else {
            // 신뢰할 수 없는 컨텐츠는 XSS 검사 후 설정
            if (this.detectXSS(html)) {
                console.warn('[Security] XSS 패턴 감지, textContent로 대체');
                element.textContent = html;
            } else {
                element.innerHTML = this.sanitizeHtml(html);
            }
        }
    }
    
    /**
     * 안전한 DOM 요소 생성 및 속성 설정
     * @param {string} tagName - 태그 이름
     * @param {Object} attributes - 속성 객체
     * @param {string|null} textContent - 텍스트 내용
     * @returns {HTMLElement} 생성된 요소
     */
    createElement(tagName, attributes = {}, textContent = null) {
        const element = document.createElement(tagName);
        
        // 안전한 속성만 설정
        for (const [key, value] of Object.entries(attributes)) {
            const safeAttrString = this.safeAttr(key, value);
            if (safeAttrString) {
                const [attrName, attrValue] = safeAttrString.split('=');
                element.setAttribute(attrName, attrValue.replace(/"/g, ''));
            }
        }
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }
    
    /**
     * 토큰 검증 (간단한 형식 검증)
     * @param {string} token - 검증할 토큰
     * @returns {boolean} 유효한 토큰인지 여부
     */
    validateToken(token) {
        if (!token || typeof token !== 'string') return false;
        
        // 기본적인 토큰 형식 검증
        const tokenRegex = /^[A-Za-z0-9+/]+=*$/; // Base64 형식
        return token.length > 10 && tokenRegex.test(token);
    }
    
    /**
     * CSRF 토큰 생성 (간단한 구현)
     * @returns {string} CSRF 토큰
     */
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * 콘텐츠 보안 정책(CSP) 헤더 생성 도우미
     * @returns {string} CSP 헤더 값
     */
    getCSPHeader() {
        return 'default-src \'self\'; ' +
               'script-src \'self\' \'unsafe-inline\'; ' +
               'style-src \'self\' \'unsafe-inline\'; ' +
               'img-src \'self\' data: https:; ' +
               'connect-src \'self\'; ' +
               'font-src \'self\'; ' +
               'object-src \'none\'; ' +
               'base-uri \'self\';';
    }
}

// 싱글톤 인스턴스 생성
const waveSpaceSecurity = new WaveSpaceSecurity();

// 전역 접근을 위한 window 객체 등록
if (typeof window !== 'undefined') {
    // 기존 보안 객체들과 호환성 유지
    window.WaveSpaceSecurity = waveSpaceSecurity;
    
    // XSSProtection 호환성
    window.XSSProtection = {
        escapeHtml: (text) => waveSpaceSecurity.escapeHtml(text),
        safe: (value) => waveSpaceSecurity.safe(value),
        safeUrl: (url) => waveSpaceSecurity.safeUrl(url),
        safeAttr: (attr, value) => waveSpaceSecurity.safeAttr(attr, value),
        safeHtml: (strings, ...values) => waveSpaceSecurity.safeHtml(strings, ...values)
    };
    
    // DOMSafety 호환성
    window.DOMSafety = {
        escapeHtml: (text) => waveSpaceSecurity.escapeHtmlDOM(text),
        setSafeHtml: (element, html, trusted) => waveSpaceSecurity.setSafeHtml(element, html, trusted),
        createElement: (tagName, attrs, textContent) => waveSpaceSecurity.createElement(tagName, attrs, textContent),
        sanitizeInput: (input, type) => waveSpaceSecurity.sanitizeInput(input, type),
        safeHtml: (strings, ...values) => waveSpaceSecurity.safeHtml(strings, ...values),
        detectXSS: (text) => waveSpaceSecurity.detectXSS(text)
    };
    
    // 편의 함수들 (기존 코드 호환성)
    window.safe = (value) => waveSpaceSecurity.safe(value);
    window.safeUrl = (url) => waveSpaceSecurity.safeUrl(url);
    window.safeHtml = (strings, ...values) => waveSpaceSecurity.safeHtml(strings, ...values);
    
    console.log('[WaveSpaceSecurity] 통합 보안 모듈 전역 등록 완료');
}

// ES6 모듈로도 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WaveSpaceSecurity;
}

export default WaveSpaceSecurity;
export { waveSpaceSecurity };