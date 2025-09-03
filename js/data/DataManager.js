/**
 * 통합 데이터 매니저 - Supabase 전용 데이터 관리자
 * 캐싱, 구독, 상태 관리 기능 포함
 */
class DataManager {
    constructor() {
        this.isSupabaseReady = false;
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
                console.error('⚠️ Supabase 클라이언트가 없습니다. 초기화를 다시 시도하세요.');
                this.isSupabaseReady = false;
            }
        } catch (error) {
            console.error('❌ Supabase 초기화 실패:', error);
            this.isSupabaseReady = false;
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
            return false;
        }
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
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
            }

            // 캐시에 저장 (5분)
            this.cache.set(cacheKey, result);
            setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

            return result;
            
        } catch (error) {
            console.error(`데이터 조회 실패 (${table}):`, error);
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
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
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
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
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
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
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
            subscriberCount: this.subscribers.size
        };
    }

    /**
     * 헬스체크
     */
    async healthCheck() {
        const status = {
            timestamp: new Date().toISOString(),
            supabase: false,
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