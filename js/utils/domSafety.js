/**
 * WAVE SPACE - DOM 보안 유틸리티
 * XSS 공격 방지를 위한 안전한 DOM 조작 함수들
 */

/**
 * HTML 특수문자를 이스케이프
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 안전하게 HTML을 설정 (신뢰할 수 있는 컨텐츠만)
 * @param {HTMLElement} element - 대상 요소
 * @param {string} html - 설정할 HTML
 * @param {boolean} trusted - 신뢰할 수 있는 컨텐츠인지 여부
 */
export function setSafeHtml(element, html, trusted = false) {
    if (!element) return;
    
    if (trusted) {
        // 신뢰할 수 있는 컨텐츠만 innerHTML 사용
        element.innerHTML = html;
    } else {
        // 신뢰할 수 없는 컨텐츠는 textContent 사용
        element.textContent = html;
    }
}

/**
 * 안전하게 요소 생성 및 속성 설정
 * @param {string} tagName - 태그 이름
 * @param {Object} attributes - 속성 객체
 * @param {string|null} textContent - 텍스트 내용
 * @returns {HTMLElement} 생성된 요소
 */
export function createElement(tagName, attributes = {}, textContent = null) {
    const element = document.createElement(tagName);
    
    // 안전한 속성만 설정
    const safeAttributes = ['class', 'id', 'data-', 'aria-', 'role', 'type', 'name', 'value', 'placeholder'];
    
    for (const [key, value] of Object.entries(attributes)) {
        if (safeAttributes.some(safe => key.startsWith(safe)) || safeAttributes.includes(key)) {
            element.setAttribute(key, value);
        }
    }
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    return element;
}

/**
 * 사용자 입력값 검증 및 정제
 * @param {string} input - 사용자 입력값
 * @param {string} type - 입력 타입 (text, email, url 등)
 * @returns {string} 정제된 입력값
 */
export function sanitizeInput(input, type = 'text') {
    if (typeof input !== 'string') {
        return '';
    }
    
    // 기본 정제: 앞뒤 공백 제거
    let sanitized = input.trim();
    
    // 타입별 추가 정제
    switch (type) {
        case 'email':
            // 이메일 형식 검증
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(sanitized) ? sanitized : '';
            
        case 'url':
            // URL 형식 검증
            try {
                new URL(sanitized);
                return sanitized;
            } catch {
                return '';
            }
            
        case 'number':
            // 숫자만 허용
            return sanitized.replace(/[^0-9.-]/g, '');
            
        case 'alphanumeric':
            // 영문자와 숫자만 허용
            return sanitized.replace(/[^a-zA-Z0-9]/g, '');
            
        default:
            // 기본: HTML 특수문자 이스케이프
            return escapeHtml(sanitized);
    }
}

/**
 * 안전한 템플릿 리터럴 생성
 * @param {string[]} strings - 템플릿 문자열 배열
 * @param {...any} values - 템플릿 값들
 * @returns {string} 안전한 HTML 문자열
 */
export function safeHtml(strings, ...values) {
    let result = strings[0];
    
    for (let i = 0; i < values.length; i++) {
        result += escapeHtml(String(values[i])) + strings[i + 1];
    }
    
    return result;
}

/**
 * XSS 공격 패턴 검사
 * @param {string} text - 검사할 텍스트
 * @returns {boolean} 위험한 패턴이 있으면 true
 */
export function detectXSS(text) {
    const xssPatterns = [
        /<script[^>]*>[\s\S]*?<\/script>/gi,
        /<iframe[^>]*>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // onclick, onload 등
        /<embed[^>]*>/gi,
        /<object[^>]*>/gi,
        /vbscript:/gi,
        /data:text\/html/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(text));
}

// 전역으로 사용할 수 있도록 export
window.DOMSafety = {
    escapeHtml,
    setSafeHtml,
    createElement,
    sanitizeInput,
    safeHtml,
    detectXSS
};