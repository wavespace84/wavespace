/**
 * WAVE SPACE - XSS 보호 유틸리티
 * innerHTML 사용 시 XSS 공격을 방지하는 헬퍼 함수
 */

/**
 * HTML 문자열을 안전하게 이스케이프
 * @param {string} unsafe - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * 템플릿 리터럴에서 사용자 입력값을 안전하게 처리
 * @param {*} value - 처리할 값
 * @returns {string} 안전한 문자열
 */
function safe(value) {
    if (value === null || value === undefined) return '';
    return escapeHtml(String(value));
}

/**
 * URL을 안전하게 처리
 * @param {string} url - 검증할 URL
 * @returns {string} 안전한 URL 또는 빈 문자열
 */
function safeUrl(url) {
    if (!url) return '#';
    
    // javascript:, data:, vbscript: 등 위험한 프로토콜 차단
    const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
    if (dangerousProtocols.test(url)) {
        console.warn('위험한 URL 프로토콜 감지:', url);
        return '#';
    }
    
    return url;
}

/**
 * 속성값을 안전하게 처리
 * @param {string} attr - 속성 이름
 * @param {string} value - 속성 값
 * @returns {string} 안전한 속성 문자열
 */
function safeAttr(attr, value) {
    // 이벤트 핸들러 속성 차단
    if (attr.toLowerCase().startsWith('on')) {
        console.warn('이벤트 핸들러 속성 차단:', attr);
        return '';
    }
    
    return `${attr}="${escapeHtml(value)}"`;
}

/**
 * 안전한 HTML 생성을 위한 템플릿 태그 함수
 * @example
 * const html = safeHtml`<div>${userInput}</div>`;
 */
function safeHtml(strings, ...values) {
    let result = strings[0];
    
    for (let i = 0; i < values.length; i++) {
        result += safe(values[i]) + strings[i + 1];
    }
    
    return result;
}

// 전역으로 사용할 수 있도록 export
window.XSSProtection = {
    escapeHtml,
    safe,
    safeUrl,
    safeAttr,
    safeHtml
};

// 편의를 위한 전역 함수
window.safe = safe;
window.safeUrl = safeUrl;
window.safeHtml = safeHtml;