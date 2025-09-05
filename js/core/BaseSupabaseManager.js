/**
 * BaseSupabaseManager - Supabase 기반 매니저들의 기본 클래스
 * 공통 기능을 추상화하여 코드 중복을 제거하고 일관성을 보장합니다.
 */

class BaseSupabaseManager {
    constructor(tableName, options = {}) {
        this.tableName = tableName;
        this.client = null;
        this.currentUser = null;
        
        // 기본 옵션 설정
        this.options = {
            itemsPerPage: options.itemsPerPage || 20,
            enableRealtimeSubscription: options.enableRealtimeSubscription !== false,
            autoInit: options.autoInit !== false,
            cacheEnabled: options.cacheEnabled || false,
            ...options
        };
        
        // 상태 관리
        this.isInitialized = false;
        this.isLoading = false;
        this.subscription = null;
        this.cache = new Map();
        
        // 이벤트 리스너들 저장
        this.eventListeners = [];
        
        // 자동 초기화
        if (this.options.autoInit) {
            this.init();
        }
    }

    /**
     * Supabase 클라이언트 초기화
     */
    async init() {
        if (this.isInitialized) return;
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.WaveSupabase && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.WaveSupabase) {
            throw new Error('WaveSupabase 클라이언트를 찾을 수 없습니다.');
        }
        
        this.client = window.WaveSupabase.getClient();
        
        // 사용자 정보 로드
        await this.loadCurrentUser();
        
        // 실시간 구독 설정
        if (this.options.enableRealtimeSubscription) {
            await this.setupRealtimeSubscription();
        }
        
        this.isInitialized = true;
        this.onInitialized();
    }

    /**
     * 현재 사용자 정보 로드
     */
    async loadCurrentUser() {
        try {
            const { data: { user } } = await this.client.auth.getUser();
            this.currentUser = user;
            return user;
        } catch (error) {
            console.error('사용자 정보 로드 실패:', error);
            return null;
        }
    }

    /**
     * 기본 CRUD 작업들
     */
    
    // 데이터 조회 (페이지네이션 지원)
    async fetchData(filters = {}, page = 1, orderBy = { column: 'created_at', ascending: false }) {
        if (!this.isInitialized) await this.init();
        
        try {
            this.isLoading = true;
            this.showLoadingState();
            
            // 캐시 확인
            const cacheKey = this.generateCacheKey('fetch', { filters, page, orderBy });
            if (this.options.cacheEnabled && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            let query = this.client
                .from(this.tableName)
                .select('*');
            
            // 필터 적용
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    query = query.eq(key, value);
                }
            });
            
            // 정렬 적용
            if (orderBy.column) {
                query = query.order(orderBy.column, { ascending: orderBy.ascending });
            }
            
            // 페이지네이션 적용
            const from = (page - 1) * this.options.itemsPerPage;
            const to = from + this.options.itemsPerPage - 1;
            query = query.range(from, to);
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            
            const result = {
                data: data || [],
                totalCount: count,
                currentPage: page,
                totalPages: Math.ceil(count / this.options.itemsPerPage),
                hasNext: to < count - 1,
                hasPrev: page > 1
            };
            
            // 캐시 저장
            if (this.options.cacheEnabled) {
                this.cache.set(cacheKey, result);
            }
            
            return result;
            
        } catch (error) {
            this.handleError('데이터 조회 실패', error);
            return { data: [], totalCount: 0, currentPage: 1, totalPages: 0 };
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // 단일 데이터 조회
    async fetchById(id) {
        if (!this.isInitialized) await this.init();
        
        try {
            const cacheKey = this.generateCacheKey('fetchById', { id });
            if (this.options.cacheEnabled && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            const { data, error } = await this.client
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            if (this.options.cacheEnabled) {
                this.cache.set(cacheKey, data);
            }
            
            return data;
        } catch (error) {
            this.handleError('데이터 조회 실패', error);
            return null;
        }
    }

    // 데이터 생성
    async create(data) {
        if (!this.isInitialized) await this.init();
        
        try {
            this.showLoadingState();
            
            // 사용자 정보 자동 추가
            if (this.currentUser && !data.user_id) {
                data.user_id = this.currentUser.id;
            }
            
            const { data: result, error } = await this.client
                .from(this.tableName)
                .insert([data])
                .select()
                .single();
            
            if (error) throw error;
            
            // 캐시 무효화
            this.invalidateCache();
            
            this.onDataCreated(result);
            this.showSuccessMessage('데이터가 성공적으로 생성되었습니다.');
            
            return result;
        } catch (error) {
            this.handleError('데이터 생성 실패', error);
            return null;
        } finally {
            this.hideLoadingState();
        }
    }

    // 데이터 업데이트
    async update(id, data) {
        if (!this.isInitialized) await this.init();
        
        try {
            this.showLoadingState();
            
            data.updated_at = new Date().toISOString();
            
            const { data: result, error } = await this.client
                .from(this.tableName)
                .update(data)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            // 캐시 무효화
            this.invalidateCache();
            
            this.onDataUpdated(result);
            this.showSuccessMessage('데이터가 성공적으로 업데이트되었습니다.');
            
            return result;
        } catch (error) {
            this.handleError('데이터 업데이트 실패', error);
            return null;
        } finally {
            this.hideLoadingState();
        }
    }

    // 데이터 삭제
    async delete(id) {
        if (!this.isInitialized) await this.init();
        
        try {
            this.showLoadingState();
            
            const { error } = await this.client
                .from(this.tableName)
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            // 캐시 무효화
            this.invalidateCache();
            
            this.onDataDeleted(id);
            this.showSuccessMessage('데이터가 성공적으로 삭제되었습니다.');
            
            return true;
        } catch (error) {
            this.handleError('데이터 삭제 실패', error);
            return false;
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * 실시간 구독 설정
     */
    async setupRealtimeSubscription() {
        if (!this.client || this.subscription) return;
        
        try {
            this.subscription = this.client
                .channel(`${this.tableName}_changes`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: this.tableName
                }, (payload) => {
                    this.handleRealtimeEvent(payload);
                })
                .subscribe();
                
        } catch (error) {
            console.error('실시간 구독 설정 실패:', error);
        }
    }

    /**
     * 실시간 이벤트 처리
     */
    handleRealtimeEvent(payload) {
        this.invalidateCache();
        
        switch (payload.eventType) {
            case 'INSERT':
                this.onRealtimeInsert(payload.new);
                break;
            case 'UPDATE':
                this.onRealtimeUpdate(payload.new, payload.old);
                break;
            case 'DELETE':
                this.onRealtimeDelete(payload.old);
                break;
        }
    }

    /**
     * UI 상태 관리 메서드들
     */
    showLoadingState() {
        const loadingElements = document.querySelectorAll('.loading-spinner, .loading-overlay');
        loadingElements.forEach(el => el.style.display = 'block');
    }

    hideLoadingState() {
        const loadingElements = document.querySelectorAll('.loading-spinner, .loading-overlay');
        loadingElements.forEach(el => el.style.display = 'none');
    }

    showSuccessMessage(message) {
        // 토스트 메시지나 알림 시스템과 연동
        if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            console.log('✅', message);
        }
    }

    showErrorMessage(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            console.error('❌', message);
        }
    }

    /**
     * 에러 처리
     */
    handleError(context, error) {
        console.error(`${context}:`, error);
        
        let message = '알 수 없는 오류가 발생했습니다.';
        
        if (error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        this.showErrorMessage(`${context}: ${message}`);
        this.onError(context, error);
    }

    /**
     * 캐시 관리
     */
    generateCacheKey(operation, params) {
        return `${this.tableName}_${operation}_${JSON.stringify(params)}`;
    }

    invalidateCache(pattern) {
        if (!this.options.cacheEnabled) return;
        
        if (pattern) {
            // 특정 패턴의 캐시만 삭제
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // 전체 캐시 삭제
            this.cache.clear();
        }
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        // 실시간 구독 해제
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        
        // 이벤트 리스너 제거
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // 캐시 정리
        this.cache.clear();
        
        this.onCleanup();
    }

    /**
     * 이벤트 리스너 관리
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * 하위 클래스에서 오버라이드할 메서드들
     */
    onInitialized() {
        // 초기화 완료 시 호출
    }

    onDataCreated(data) {
        // 데이터 생성 시 호출
    }

    onDataUpdated(data) {
        // 데이터 업데이트 시 호출
    }

    onDataDeleted(id) {
        // 데이터 삭제 시 호출
    }

    onRealtimeInsert(newRecord) {
        // 실시간 INSERT 이벤트 처리
    }

    onRealtimeUpdate(newRecord, oldRecord) {
        // 실시간 UPDATE 이벤트 처리
    }

    onRealtimeDelete(deletedRecord) {
        // 실시간 DELETE 이벤트 처리
    }

    onError(context, error) {
        // 에러 발생 시 호출
    }

    onCleanup() {
        // 리소스 정리 시 호출
    }
}

// 전역으로 내보내기
window.BaseSupabaseManager = BaseSupabaseManager;

export default BaseSupabaseManager;