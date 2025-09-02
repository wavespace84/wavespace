/**
 * 통합 데이터 매니저 - Mock 데이터와 실제 Supabase 데이터 일원화
 * 기존의 혼재된 데이터 소스 문제 해결
 */
class DataManager {
    constructor() {
        this.isSupabaseReady = false;
        this.fallbackData = new Map();
        this.cache = new Map();
        this.subscribers = new Map();
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        this.initializeSupabase();
    }

    /**
     * Supabase 초기화
     */
    async initializeSupabase() {
        try {
            // Supabase 클라이언트가 있는지 확인
            if (typeof window.supabase !== 'undefined') {
                this.supabase = window.supabase;
                this.isSupabaseReady = true;
                console.log('✅ Supabase 연결 성공');
                
                // 연결 테스트
                await this.testConnection();
            } else {
                console.warn('⚠️ Supabase 클라이언트가 없습니다. Mock 데이터를 사용합니다.');
                await this.loadMockData();
            }
        } catch (error) {
            console.error('❌ Supabase 초기화 실패:', error);
            this.isSupabaseReady = false;
            await this.loadMockData();
        }
    }

    /**
     * Supabase 연결 테스트
     */
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);
                
            if (error) throw error;
            console.log('✅ Supabase 연결 테스트 성공');
            return true;
        } catch (error) {
            console.error('❌ Supabase 연결 테스트 실패:', error);
            this.isSupabaseReady = false;
            await this.loadMockData();
            return false;
        }
    }

    /**
     * Mock 데이터 로드
     */
    async loadMockData() {
        console.log('🔄 Mock 데이터 로딩...');
        
        // 사용자 Mock 데이터
        this.fallbackData.set('users', [
            {
                id: 1,
                email: 'test@example.com',
                nickname: '테스트유저',
                points: 1000,
                badges: ['신규회원', '첫글작성'],
                created_at: new Date().toISOString()
            }
        ]);

        // 공지사항 Mock 데이터
        this.fallbackData.set('notices', [
            {
                id: 1,
                title: 'WAVE space 베타 오픈',
                content: '안녕하세요. WAVE space가 베타 오픈했습니다.',
                created_at: new Date().toISOString(),
                author: '관리자',
                views: 150,
                important: true
            },
            {
                id: 2,
                title: '커뮤니티 이용규칙 안내',
                content: '건전한 커뮤니티 문화를 위한 이용규칙을 안내드립니다.',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                author: '관리자',
                views: 89,
                important: false
            }
        ]);

        // 이벤트 Mock 데이터
        this.fallbackData.set('events', [
            {
                id: 1,
                title: '신규가입 이벤트',
                description: '신규가입시 1000포인트 지급',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
                status: 'active',
                reward_points: 1000
            }
        ]);

        // 포인트샵 Mock 데이터
        this.fallbackData.set('point_shop', [
            {
                id: 1,
                name: '스타벅스 아메리카노',
                price: 5000,
                category: 'beverage',
                stock: 50,
                image: 'https://via.placeholder.com/200x200',
                description: '스타벅스 아메리카노 기프티콘'
            },
            {
                id: 2,
                name: '치킨 기프티콘',
                price: 20000,
                category: 'food',
                stock: 20,
                image: 'https://via.placeholder.com/200x200',
                description: '치킨 기프티콘 (브랜드 랜덤)'
            }
        ]);

        // 시장조사서 Mock 데이터
        this.fallbackData.set('market_research', [
            {
                id: 1,
                title: '서울 강남구 아파트 시장 분석',
                area: '강남구',
                property_type: 'apartment',
                created_at: new Date().toISOString(),
                author_id: 1,
                download_count: 25,
                premium: false
            }
        ]);

        console.log('✅ Mock 데이터 로드 완료');
    }

    /**
     * 데이터 조회 (통합 인터페이스)
     */
    async getData(table, options = {}) {
        const cacheKey = `${table}_${JSON.stringify(options)}`;
        
        // 캐시 확인
        if (this.cache.has(cacheKey) && !options.forceRefresh) {
            return this.cache.get(cacheKey);
        }

        try {
            let result;
            
            if (this.isSupabaseReady && this.supabase) {
                result = await this.getSupabaseData(table, options);
            } else {
                result = await this.getMockData(table, options);
            }

            // 캐시에 저장 (5분)
            this.cache.set(cacheKey, result);
            setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

            return result;
            
        } catch (error) {
            console.error(`데이터 조회 실패 (${table}):`, error);
            
            // Supabase 실패시 Mock 데이터로 폴백
            if (this.isSupabaseReady) {
                console.log('🔄 Mock 데이터로 폴백');
                return await this.getMockData(table, options);
            }
            
            throw error;
        }
    }

    /**
     * Supabase 데이터 조회
     */
    async getSupabaseData(table, options) {
        let query = this.supabase.from(table).select('*');
        
        // 옵션 적용
        if (options.limit) query = query.limit(options.limit);
        if (options.orderBy) query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
        if (options.filter) {
            Object.entries(options.filter).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }

        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
    }

    /**
     * Mock 데이터 조회
     */
    async getMockData(table, options) {
        let data = [...(this.fallbackData.get(table) || [])];
        
        // 필터 적용
        if (options.filter) {
            Object.entries(options.filter).forEach(([key, value]) => {
                data = data.filter(item => item[key] === value);
            });
        }
        
        // 정렬 적용
        if (options.orderBy) {
            data.sort((a, b) => {
                const aVal = a[options.orderBy.column];
                const bVal = b[options.orderBy.column];
                const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                return options.orderBy.ascending ? result : -result;
            });
        }
        
        // 제한 적용
        if (options.limit) {
            data = data.slice(0, options.limit);
        }
        
        return data;
    }

    /**
     * 데이터 생성
     */
    async createData(table, data) {
        try {
            if (this.isSupabaseReady && this.supabase) {
                const { data: result, error } = await this.supabase
                    .from(table)
                    .insert(data)
                    .select();
                
                if (error) throw error;
                
                // 캐시 무효화
                this.invalidateCache(table);
                
                return result[0];
            } else {
                // Mock 데이터에 추가
                const mockData = this.fallbackData.get(table) || [];
                const newId = Math.max(...mockData.map(item => item.id || 0)) + 1;
                const newItem = { id: newId, ...data, created_at: new Date().toISOString() };
                
                mockData.push(newItem);
                this.fallbackData.set(table, mockData);
                
                return newItem;
            }
        } catch (error) {
            console.error(`데이터 생성 실패 (${table}):`, error);
            throw error;
        }
    }

    /**
     * 데이터 업데이트
     */
    async updateData(table, id, updates) {
        try {
            if (this.isSupabaseReady && this.supabase) {
                const { data, error } = await this.supabase
                    .from(table)
                    .update(updates)
                    .eq('id', id)
                    .select();
                
                if (error) throw error;
                
                // 캐시 무효화
                this.invalidateCache(table);
                
                return data[0];
            } else {
                // Mock 데이터 업데이트
                const mockData = this.fallbackData.get(table) || [];
                const itemIndex = mockData.findIndex(item => item.id === id);
                
                if (itemIndex !== -1) {
                    mockData[itemIndex] = { ...mockData[itemIndex], ...updates };
                    this.fallbackData.set(table, mockData);
                    return mockData[itemIndex];
                } else {
                    throw new Error('Item not found');
                }
            }
        } catch (error) {
            console.error(`데이터 업데이트 실패 (${table}):`, error);
            throw error;
        }
    }

    /**
     * 데이터 삭제
     */
    async deleteData(table, id) {
        try {
            if (this.isSupabaseReady && this.supabase) {
                const { error } = await this.supabase
                    .from(table)
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                // 캐시 무효화
                this.invalidateCache(table);
                
                return true;
            } else {
                // Mock 데이터에서 제거
                const mockData = this.fallbackData.get(table) || [];
                const filteredData = mockData.filter(item => item.id !== id);
                this.fallbackData.set(table, filteredData);
                
                return true;
            }
        } catch (error) {
            console.error(`데이터 삭제 실패 (${table}):`, error);
            throw error;
        }
    }

    /**
     * 실시간 구독 (Supabase만 지원)
     */
    subscribe(table, callback, filter = null) {
        if (!this.isSupabaseReady || !this.supabase) {
            console.warn('실시간 구독은 Supabase 연결시에만 지원됩니다.');
            return null;
        }

        let channel = this.supabase.channel(`realtime:${table}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: table,
                filter: filter
            }, callback)
            .subscribe();

        // 구독자 관리
        const subscriptionId = Date.now().toString();
        this.subscribers.set(subscriptionId, channel);
        
        return subscriptionId;
    }

    /**
     * 구독 해제
     */
    unsubscribe(subscriptionId) {
        const channel = this.subscribers.get(subscriptionId);
        if (channel) {
            channel.unsubscribe();
            this.subscribers.delete(subscriptionId);
        }
    }

    /**
     * 캐시 무효화
     */
    invalidateCache(table = null) {
        if (table) {
            // 특정 테이블 캐시만 제거
            for (const [key] of this.cache) {
                if (key.startsWith(`${table}_`)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // 전체 캐시 제거
            this.cache.clear();
        }
    }

    /**
     * 연결 상태 확인
     */
    getStatus() {
        return {
            supabaseReady: this.isSupabaseReady,
            cacheSize: this.cache.size,
            subscriberCount: this.subscribers.size,
            mockDataTables: Array.from(this.fallbackData.keys())
        };
    }

    /**
     * 헬스체크
     */
    async healthCheck() {
        const status = {
            timestamp: new Date().toISOString(),
            supabase: false,
            mockData: this.fallbackData.size > 0,
            cache: this.cache.size,
            error: null
        };

        if (this.isSupabaseReady) {
            try {
                await this.testConnection();
                status.supabase = true;
            } catch (error) {
                status.error = error.message;
            }
        }

        return status;
    }
}

// 전역 데이터 매니저 인스턴스
window.dataManager = new DataManager();

// 전역으로 내보내기
window.DataManager = DataManager;

// 자동 초기화 확인
document.addEventListener('DOMContentLoaded', async () => {
    const healthCheck = await window.dataManager.healthCheck();
    console.log('📊 데이터 매니저 상태:', healthCheck);
});