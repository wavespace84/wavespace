/**
 * WAVE SPACE - Base Manager 클래스
 * Supabase 연동 매니저들의 공통 패턴을 추상화한 기반 클래스
 */

/**
 * Supabase 연동 매니저의 기반 클래스
 * 모든 Supabase 매니저들이 상속받아 사용
 */
class BaseSupabaseManager {
    constructor(tableName, options = {}) {
        // 기본 속성
        this.tableName = tableName;
        this.client = null;
        this.data = [];
        this.filteredData = [];
        this.isLoading = false;
        this.error = null;
        this.subscription = null;
        
        // 페이지네이션 설정
        this.pagination = {
            currentPage: 1,
            itemsPerPage: options.itemsPerPage || 10,
            totalItems: 0,
            totalPages: 0
        };
        
        // 필터링 설정
        this.filters = {
            searchTerm: '',
            category: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
        
        // 구독 설정
        this.realtimeOptions = {
            enabled: options.realtime !== false,
            channelName: options.channelName || `${tableName}_channel`,
            events: options.realtimeEvents || ['*']
        };
        
        // 이벤트 콜백
        this.callbacks = {
            onDataChange: null,
            onError: null,
            onLoadingChange: null
        };
    }

    /**
     * Supabase 클라이언트 초기화
     * 모든 매니저에서 공통으로 사용하는 초기화 로직
     */
    async init() {
        try {
            // WaveSupabase 글로벌 객체 대기
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
            
            if (!this.client) {
                throw new Error('Supabase 클라이언트 초기화 실패');
            }

            console.log(`✅ ${this.constructor.name} 초기화 완료`);
            
            // 실시간 구독 설정
            if (this.realtimeOptions.enabled) {
                this.setupRealtimeSubscription();
            }
            
            return true;
        } catch (error) {
            console.error(`❌ ${this.constructor.name} 초기화 실패:`, error);
            this.setError(error);
            return false;
        }
    }

    /**
     * 데이터 로드 (기본 구현)
     * 각 매니저에서 필요에 따라 오버라이드
     */
    async fetchData(options = {}) {
        try {
            this.setLoading(true);
            this.clearError();

            const {
                limit = this.pagination.itemsPerPage,
                offset = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage,
                filters = this.filters
            } = options;

            if (!this.client) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
            }

            // 기본 쿼리 구성
            let query = this.client
                .from(this.tableName)
                .select('*', { count: 'exact' });

            // 필터 적용
            query = this.applyFilters(query, filters);

            // 정렬 적용
            query = query.order(filters.sortBy, { 
                ascending: filters.sortOrder === 'asc' 
            });

            // 페이지네이션 적용
            if (limit > 0) {
                query = query.range(offset, offset + limit - 1);
            }

            const { data, count, error } = await query;

            if (error) {
                throw error;
            }

            // 데이터 변환 (하위 클래스에서 구현)
            this.data = this.transformData(data || []);
            this.filteredData = [...this.data];

            // 페이지네이션 정보 업데이트
            this.updatePagination(count || 0);

            console.log(`✅ ${this.constructor.name}: ${this.data.length}개 데이터 로드`);
            
            // 콜백 실행
            this.triggerCallback('onDataChange', this.data);
            
            return this.data;

        } catch (error) {
            console.error(`❌ ${this.constructor.name} 데이터 로드 실패:`, error);
            this.setError(error);
            return [];
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 쿼리에 필터 적용 (하위 클래스에서 오버라이드 가능)
     */
    applyFilters(query, filters) {
        // 활성 상태 필터 (기본)
        if (this.hasColumn('is_active')) {
            query = query.eq('is_active', true);
        }

        // 검색어 필터
        if (filters.searchTerm) {
            // 기본적으로 title과 content 컬럼에서 검색
            // 하위 클래스에서 더 구체적으로 구현 가능
            if (this.hasColumn('title') && this.hasColumn('content')) {
                query = query.or(
                    `title.ilike.%${filters.searchTerm}%,content.ilike.%${filters.searchTerm}%`
                );
            }
        }

        // 카테고리 필터
        if (filters.category && filters.category !== 'all') {
            if (this.hasColumn('category')) {
                query = query.eq('category', filters.category);
            } else if (this.hasColumn('type')) {
                query = query.eq('type', filters.category);
            }
        }

        return query;
    }

    /**
     * 데이터 변환 (하위 클래스에서 구현)
     * Supabase 데이터를 프론트엔드에서 사용할 형태로 변환
     */
    transformData(data) {
        // 기본 구현은 원본 데이터 반환
        // 하위 클래스에서 필요에 따라 오버라이드
        return data;
    }

    /**
     * 실시간 구독 설정
     */
    setupRealtimeSubscription() {
        if (!this.client || !this.realtimeOptions.enabled) {
            return null;
        }

        try {
            this.subscription = this.client
                .channel(this.realtimeOptions.channelName)
                .on('postgres_changes',
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: this.tableName 
                    },
                    (payload) => {
                        console.log(`📡 ${this.constructor.name} 실시간 업데이트:`, payload);
                        this.handleRealtimeUpdate(payload);
                    }
                )
                .subscribe();

            console.log(`✅ ${this.constructor.name} 실시간 구독 활성화`);
            return this.subscription;

        } catch (error) {
            console.error(`❌ ${this.constructor.name} 실시간 구독 실패:`, error);
            return null;
        }
    }

    /**
     * 실시간 업데이트 처리 (하위 클래스에서 오버라이드 가능)
     */
    handleRealtimeUpdate(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
        case 'INSERT':
            if (newRecord) {
                const transformedData = this.transformData([newRecord]);
                this.data.unshift(transformedData[0]);
                this.applyClientSideFiltering();
            }
            break;

        case 'UPDATE':
            if (newRecord) {
                const index = this.data.findIndex(item => item.id === newRecord.id);
                if (index !== -1) {
                    const transformedData = this.transformData([newRecord]);
                    this.data[index] = transformedData[0];
                    this.applyClientSideFiltering();
                }
            }
            break;

        case 'DELETE':
            if (oldRecord) {
                this.data = this.data.filter(item => item.id !== oldRecord.id);
                this.applyClientSideFiltering();
            }
            break;
        }

        this.triggerCallback('onDataChange', this.data);
    }

    /**
     * 클라이언트 측 필터링 적용
     */
    applyClientSideFiltering() {
        let filtered = [...this.data];

        // 검색어 필터링
        if (this.filters.searchTerm) {
            const searchTerm = this.filters.searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                this.matchesSearch(item, searchTerm)
            );
        }

        // 카테고리 필터링
        if (this.filters.category && this.filters.category !== 'all') {
            filtered = filtered.filter(item => 
                this.matchesCategory(item, this.filters.category)
            );
        }

        this.filteredData = filtered;
        this.updatePagination(filtered.length);
    }

    /**
     * 검색어 매칭 (하위 클래스에서 오버라이드 가능)
     */
    matchesSearch(item, searchTerm) {
        return (item.title && item.title.toLowerCase().includes(searchTerm)) ||
               (item.content && item.content.toLowerCase().includes(searchTerm));
    }

    /**
     * 카테고리 매칭 (하위 클래스에서 오버라이드 가능)
     */
    matchesCategory(item, category) {
        return item.category === category || item.type === category;
    }

    /**
     * 페이지네이션 정보 업데이트
     */
    updatePagination(totalItems) {
        this.pagination.totalItems = totalItems;
        this.pagination.totalPages = Math.ceil(totalItems / this.pagination.itemsPerPage);
    }

    /**
     * 페이지 데이터 반환
     */
    getPagedData(page = this.pagination.currentPage) {
        const startIndex = (page - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        return this.filteredData.slice(startIndex, endIndex);
    }

    /**
     * 필터 설정
     */
    setFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.applyClientSideFiltering();
    }

    /**
     * 정렬 설정
     */
    setSorting(sortBy, sortOrder = 'desc') {
        this.filters.sortBy = sortBy;
        this.filters.sortOrder = sortOrder;
        
        // 클라이언트 측 정렬 적용
        this.filteredData.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    /**
     * 페이지 이동
     */
    goToPage(page) {
        if (page >= 1 && page <= this.pagination.totalPages) {
            this.pagination.currentPage = page;
        }
    }

    /**
     * 로딩 상태 설정
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;
        this.triggerCallback('onLoadingChange', isLoading);
    }

    /**
     * 에러 설정
     */
    setError(error) {
        this.error = error;
        this.triggerCallback('onError', error);
    }

    /**
     * 에러 초기화
     */
    clearError() {
        this.error = null;
    }

    /**
     * 콜백 등록
     */
    setCallback(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }

    /**
     * 콜백 실행
     */
    triggerCallback(event, data) {
        const callback = this.callbacks[event];
        if (typeof callback === 'function') {
            try {
                callback(data);
            } catch (error) {
                console.error(`콜백 실행 오류 (${event}):`, error);
            }
        }
    }

    /**
     * 테이블에 특정 컬럼이 있는지 확인 (유틸리티 메서드)
     */
    hasColumn(columnName) {
        // 실제 구현에서는 스키마 정보를 기반으로 확인
        // 현재는 기본 컬럼들을 가정
        const commonColumns = [
            'id', 'created_at', 'updated_at', 'is_active',
            'title', 'content', 'category', 'type', 'user_id'
        ];
        return commonColumns.includes(columnName);
    }

    /**
     * 구독 해제
     */
    unsubscribe() {
        if (this.subscription) {
            this.client.removeChannel(this.subscription);
            this.subscription = null;
            console.log(`✅ ${this.constructor.name} 실시간 구독 해제`);
        }
    }

    /**
     * 데이터 새로고침
     */
    async refresh(options = {}) {
        console.log(`🔄 ${this.constructor.name} 데이터 새로고침...`);
        return await this.fetchData(options);
    }

    /**
     * 상태 정보 반환
     */
    getState() {
        return {
            isLoading: this.isLoading,
            error: this.error,
            hasData: this.data.length > 0,
            dataCount: this.data.length,
            filteredCount: this.filteredData.length,
            pagination: { ...this.pagination },
            filters: { ...this.filters }
        };
    }

    /**
     * 정리 작업 (매니저 제거 시 호출)
     */
    destroy() {
        this.unsubscribe();
        this.data = [];
        this.filteredData = [];
        this.callbacks = {};
        this.client = null;
        console.log(`🗑️ ${this.constructor.name} 정리 완료`);
    }
}

// 전역으로 사용할 수 있도록 export
window.BaseSupabaseManager = BaseSupabaseManager;

export { BaseSupabaseManager };