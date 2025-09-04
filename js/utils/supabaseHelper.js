/**
 * WAVE SPACE - Supabase 헬퍼
 * Supabase 관련 공통 기능 모음
 */

// 로거 import
import logger from './logger.js';

/**
 * Supabase 클라이언트 가져오기 (싱글톤)
 */
export async function getSupabaseClient() {
    // 이미 초기화되어 있으면 반환
    if (window.supabase) {
        return window.supabase;
    }

    // WaveSupabase가 로드될 때까지 대기
    let attempts = 0;
    const maxAttempts = 50; // 5초 대기
    
    while (attempts < maxAttempts) {
        try {
            const client = window.WaveSupabase.getClient();
            if (client) {
                window.supabase = client;
                return client;
            }
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }
    
    throw new Error('Supabase 초기화 실패: 타임아웃');
}

/**
 * 에러 처리 래퍼
 */
export function handleSupabaseError(error, customMessage = null) {
    logger.error('Supabase 에러:', error);
    
    // 에러 핸들러가 있으면 사용
    if (window.ErrorHandler) {
        window.ErrorHandler.handle(error, customMessage);
    } else {
        // 폴백: 콘솔 에러만
        console.error(customMessage || error.message);
    }
    
    return {
        success: false,
        error: error.message || '알 수 없는 오류가 발생했습니다.'
    };
}

/**
 * 페이지네이션 헬퍼
 */
export class PaginationHelper {
    constructor(options = {}) {
        this.page = options.page || 1;
        this.limit = options.limit || 20;
        this.totalCount = 0;
        this.onPageChange = options.onPageChange || (() => {});
    }

    /**
     * Supabase 쿼리에 페이지네이션 적용
     */
    applyToQuery(query) {
        const from = (this.page - 1) * this.limit;
        const to = from + this.limit - 1;
        return query.range(from, to);
    }

    /**
     * 전체 개수 설정
     */
    setTotalCount(count) {
        this.totalCount = count;
    }

    /**
     * 전체 페이지 수
     */
    get totalPages() {
        return Math.ceil(this.totalCount / this.limit);
    }

    /**
     * 다음 페이지로
     */
    nextPage() {
        if (this.page < this.totalPages) {
            this.page++;
            this.onPageChange(this.page);
        }
    }

    /**
     * 이전 페이지로
     */
    prevPage() {
        if (this.page > 1) {
            this.page--;
            this.onPageChange(this.page);
        }
    }

    /**
     * 특정 페이지로
     */
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.page = page;
            this.onPageChange(this.page);
        }
    }

    /**
     * 페이지네이션 UI HTML 생성
     */
    renderPagination() {
        if (this.totalPages <= 1) return '';

        let html = '<div class="pagination">';
        
        // 이전 버튼
        html += `
            <button class="pagination-btn" ${this.page === 1 ? 'disabled' : ''} data-page="${this.page - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // 페이지 번호
        const maxVisible = 5;
        let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
        const end = Math.min(this.totalPages, start + maxVisible - 1);
        
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            html += '<button class="pagination-btn" data-page="1">1</button>';
            if (start > 2) html += '<span class="pagination-dots">...</span>';
        }

        for (let i = start; i <= end; i++) {
            html += `
                <button class="pagination-btn ${i === this.page ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        if (end < this.totalPages) {
            if (end < this.totalPages - 1) html += '<span class="pagination-dots">...</span>';
            html += `<button class="pagination-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
        }

        // 다음 버튼
        html += `
            <button class="pagination-btn" ${this.page === this.totalPages ? 'disabled' : ''} data-page="${this.page + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        html += '</div>';
        return html;
    }
}

/**
 * 실시간 구독 헬퍼
 */
export class RealtimeHelper {
    constructor(supabase) {
        this.supabase = supabase;
        this.subscriptions = new Map();
    }

    /**
     * 테이블 변경사항 구독
     */
    subscribe(table, callback, filter = null) {
        const key = `${table}-${filter || 'all'}`;
        
        // 이미 구독 중이면 기존 구독 제거
        if (this.subscriptions.has(key)) {
            this.unsubscribe(key);
        }

        const subscription = this.supabase
            .channel(`public:${table}`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: table,
                    filter: filter 
                },
                payload => {
                    logger.debug(`Realtime 이벤트 (${table}):`, payload);
                    callback(payload);
                }
            )
            .subscribe();

        this.subscriptions.set(key, subscription);
        return key;
    }

    /**
     * 구독 해제
     */
    unsubscribe(key) {
        const subscription = this.subscriptions.get(key);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(key);
        }
    }

    /**
     * 모든 구독 해제
     */
    unsubscribeAll() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();
    }
}

/**
 * 파일 업로드 헬퍼
 */
export class FileUploadHelper {
    constructor(supabase, bucket = 'public') {
        this.supabase = supabase;
        this.bucket = bucket;
    }

    /**
     * 파일 업로드
     */
    async upload(file, options = {}) {
        const {
            folder = 'uploads',
            fileName = null,
            maxSize = 10 * 1024 * 1024, // 10MB
            allowedTypes = null
        } = options;

        // 파일 크기 체크
        if (file.size > maxSize) {
            throw new Error(`파일 크기는 ${maxSize / 1024 / 1024}MB를 초과할 수 없습니다.`);
        }

        // 파일 타입 체크
        if (allowedTypes && !allowedTypes.includes(file.type)) {
            throw new Error('지원하지 않는 파일 형식입니다.');
        }

        // 파일명 생성
        const ext = file.name.split('.').pop();
        const name = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const path = `${folder}/${name}`;

        // 업로드
        const { data, error } = await this.supabase.storage
            .from(this.bucket)
            .upload(path, file);

        if (error) throw error;

        // 공개 URL 가져오기
        const { data: { publicUrl } } = this.supabase.storage
            .from(this.bucket)
            .getPublicUrl(path);

        return {
            path,
            url: publicUrl,
            size: file.size,
            type: file.type,
            name: file.name
        };
    }

    /**
     * 파일 삭제
     */
    async delete(path) {
        const { error } = await this.supabase.storage
            .from(this.bucket)
            .remove([path]);

        if (error) throw error;
        return true;
    }

    /**
     * 여러 파일 업로드
     */
    async uploadMultiple(files, options = {}) {
        const results = [];
        
        for (const file of files) {
            try {
                const result = await this.upload(file, options);
                results.push({ success: true, ...result });
            } catch (error) {
                results.push({ success: false, error: error.message, file: file.name });
            }
        }
        
        return results;
    }
}

// 전역으로 사용할 수 있도록 export
window.SupabaseHelper = {
    getClient: getSupabaseClient,
    handleError: handleSupabaseError,
    PaginationHelper,
    RealtimeHelper,
    FileUploadHelper
};