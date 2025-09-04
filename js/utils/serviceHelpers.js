/**
 * Service Helpers - 서비스 공통 유틸리티 함수
 * 
 * 모든 서비스에서 공통으로 사용되는 헬퍼 함수들을 제공합니다.
 */

/**
 * 표준화된 API 응답 형식
 */
export class ApiResponse {
    static success(data = null, message = '성공') {
        return {
            success: true,
            data,
            message,
            error: null
        };
    }

    static error(error, message = '오류가 발생했습니다') {
        const errorMessage = error?.message || message;
        
        console.error('API Error:', error);
        
        return {
            success: false,
            data: null,
            message: errorMessage,
            error: errorMessage
        };
    }
}

/**
 * 권한 관리 헬퍼
 */
export class AuthorizationHelper {
    /**
     * 사용자 역할 확인
     * @param {Object} user - 사용자 객체
     * @param {Array<string>} allowedRoles - 허용된 역할 목록
     * @returns {boolean} 권한 여부
     */
    static hasRole(user, allowedRoles) {
        if (!user || !user.user_role) return false;
        return allowedRoles.includes(user.user_role);
    }

    /**
     * 관리자 권한 확인
     * @param {Object} user - 사용자 객체
     * @returns {boolean} 관리자 여부
     */
    static isAdmin(user) {
        return user?.user_role === 'admin';
    }

    /**
     * 실무자 권한 확인
     * @param {Object} user - 사용자 객체
     * @returns {boolean} 실무자 여부
     */
    static isPractitioner(user) {
        return user?.is_practitioner === true;
    }

    /**
     * 파일 다운로드 권한 확인
     * @param {Object} fileInfo - 파일 정보
     * @param {Object} user - 사용자 객체
     * @returns {boolean} 다운로드 가능 여부
     */
    static canDownloadFile(fileInfo, user) {
        if (!user) return false;
        
        // 관리자는 모든 파일 다운로드 가능
        if (this.isAdmin(user)) return true;
        
        // 파일 타입별 권한 확인
        const fileType = fileInfo.file_type || fileInfo.type;
        
        if (fileType === 'market-research' || fileType === 'proposal') {
            // 실무자 승인이 필요한 파일
            return this.hasRole(user, ['분양기획', '관계사']) && this.isPractitioner(user);
        }
        
        // 일반 파일은 모든 사용자 다운로드 가능
        return true;
    }

    /**
     * 게시글 수정 권한 확인
     * @param {Object} post - 게시글 정보
     * @param {Object} user - 사용자 객체
     * @returns {boolean} 수정 가능 여부
     */
    static canEditPost(post, user) {
        if (!user || !post) return false;
        
        // 관리자는 모든 게시글 수정 가능
        if (this.isAdmin(user)) return true;
        
        // 작성자 본인
        return post.author_id === user.id;
    }

    /**
     * 게시글 삭제 권한 확인
     * @param {Object} post - 게시글 정보
     * @param {Object} user - 사용자 객체
     * @returns {boolean} 삭제 가능 여부
     */
    static canDeletePost(post, user) {
        if (!user || !post) return false;
        
        // 관리자는 모든 게시글 삭제 가능
        if (this.isAdmin(user)) return true;
        
        // 작성자 본인 (24시간 이내)
        if (post.author_id === user.id) {
            const createdAt = new Date(post.created_at);
            const now = new Date();
            const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
            return hoursDiff <= 24;
        }
        
        return false;
    }
}

/**
 * 캐싱 헬퍼
 */
export class CacheHelper {
    constructor(ttl = 5 * 60 * 1000) { // 기본 5분
        this.cache = new Map();
        this.ttl = ttl;
    }

    /**
     * 캐시 키 생성
     * @param {string} prefix - 키 접두사
     * @param {Object} params - 매개변수
     * @returns {string} 캐시 키
     */
    static createKey(prefix, params = {}) {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return `${prefix}:${sortedParams}`;
    }

    /**
     * 캐시에서 가져오기
     * @param {string} key - 캐시 키
     * @returns {any|null} 캐시된 값
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    /**
     * 캐시에 저장
     * @param {string} key - 캐시 키
     * @param {any} value - 저장할 값
     * @param {number} customTTL - 커스텀 TTL (옵션)
     */
    set(key, value, customTTL = null) {
        const expiry = Date.now() + (customTTL || this.ttl);
        this.cache.set(key, { value, expiry });
    }

    /**
     * 캐시 삭제
     * @param {string} key - 캐시 키
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * 캐시 전체 삭제
     */
    clear() {
        this.cache.clear();
    }

    /**
     * 캐시 크기
     * @returns {number} 캐시 항목 수
     */
    get size() {
        return this.cache.size;
    }
}

/**
 * 유효성 검증 헬퍼
 */
export class ValidationHelper {
    /**
     * 이메일 유효성 검사
     * @param {string} email - 이메일 주소
     * @returns {boolean} 유효성 여부
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 전화번호 유효성 검사 (한국)
     * @param {string} phone - 전화번호
     * @returns {boolean} 유효성 여부
     */
    static isValidPhoneNumber(phone) {
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
        return phoneRegex.test(phone.replace(/-/g, ''));
    }

    /**
     * 파일 크기 검증
     * @param {File} file - 파일 객체
     * @param {number} maxSize - 최대 크기 (bytes)
     * @returns {Object} 검증 결과
     */
    static validateFileSize(file, maxSize) {
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `파일 크기는 ${this.formatFileSize(maxSize)}를 초과할 수 없습니다.`
            };
        }
        return { valid: true };
    }

    /**
     * 파일 타입 검증
     * @param {File} file - 파일 객체
     * @param {Array<string>} allowedTypes - 허용된 MIME 타입
     * @returns {Object} 검증 결과
     */
    static validateFileType(file, allowedTypes) {
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: '허용되지 않은 파일 형식입니다.'
            };
        }
        return { valid: true };
    }

    /**
     * 파일 크기 포맷팅
     * @param {number} bytes - 바이트 크기
     * @returns {string} 포맷된 크기
     */
    static formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

/**
 * 날짜 포맷팅 헬퍼
 */
export class DateHelper {
    /**
     * 상대적 시간 표시 (예: 3분 전, 2시간 전)
     * @param {string|Date} date - 날짜
     * @returns {string} 포맷된 시간
     */
    static getRelativeTime(date) {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return '방금 전';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
        return `${Math.floor(diffInSeconds / 31536000)}년 전`;
    }

    /**
     * 날짜 포맷팅 (YYYY-MM-DD HH:mm)
     * @param {string|Date} date - 날짜
     * @returns {string} 포맷된 날짜
     */
    static formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    /**
     * 오늘 날짜인지 확인
     * @param {string|Date} date - 날짜
     * @returns {boolean} 오늘 여부
     */
    static isToday(date) {
        const today = new Date();
        const compareDate = new Date(date);
        
        return today.getFullYear() === compareDate.getFullYear() &&
               today.getMonth() === compareDate.getMonth() &&
               today.getDate() === compareDate.getDate();
    }
}

/**
 * 쿼리 빌더 헬퍼
 */
export class QueryHelper {
    /**
     * 검색 조건 빌드
     * @param {Object} query - Supabase 쿼리 객체
     * @param {string} searchTerm - 검색어
     * @param {Array<string>} searchFields - 검색할 필드들
     * @returns {Object} 수정된 쿼리
     */
    static buildSearchQuery(query, searchTerm, searchFields) {
        if (!searchTerm || !searchFields.length) return query;
        
        const searchConditions = searchFields
            .map(field => `${field}.ilike.%${searchTerm}%`)
            .join(',');
        
        return query.or(searchConditions);
    }

    /**
     * 정렬 조건 적용
     * @param {Object} query - Supabase 쿼리 객체
     * @param {string} sortBy - 정렬 필드
     * @param {string} sortOrder - 정렬 순서 (asc/desc)
     * @returns {Object} 수정된 쿼리
     */
    static applySorting(query, sortBy = 'created_at', sortOrder = 'desc') {
        return query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    /**
     * 필터 조건 적용
     * @param {Object} query - Supabase 쿼리 객체
     * @param {Object} filters - 필터 객체
     * @returns {Object} 수정된 쿼리
     */
    static applyFilters(query, filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                query = query.eq(key, value);
            }
        });
        return query;
    }
}

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 * @returns {Function} 디바운스된 함수
 */
export function debounce(func, wait) {
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
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (ms)
 * @returns {Function} 쓰로틀된 함수
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 기본 export
export default {
    ApiResponse,
    AuthorizationHelper,
    CacheHelper,
    ValidationHelper,
    DateHelper,
    QueryHelper,
    debounce,
    throttle
};