/**
 * WAVE SPACE - Updates Supabase Integration
 * 업데이트 페이지 Supabase 연동 모듈
 */

class UpdatesSupabase {
    constructor() {
        this.client = null;
        this.updates = [];
        this.filteredUpdates = [];
        this.isLoading = false;
        this.error = null;
    }

    /**
     * Supabase 클라이언트 초기화
     */
    async init() {
        try {
            // WaveSupabase 글로벌 객체 사용
            if (window.WaveSupabase) {
                this.client = window.WaveSupabase.getClient();
                console.log('✅ UpdatesSupabase 초기화 완료');
                
                // 클라이언트 연결 테스트
                console.log('🔍 Supabase 클라이언트 상태:', {
                    client: !!this.client,
                    url: this.client?.supabaseUrl,
                    key: this.client?.supabaseKey ? '존재함' : '없음'
                });
                
                return true;
            } else {
                throw new Error('WaveSupabase가 초기화되지 않았습니다.');
            }
        } catch (error) {
            console.error('❌ UpdatesSupabase 초기화 실패:', error);
            this.error = error;
            return false;
        }
    }

    /**
     * 업데이트 목록 가져오기
     */
    async fetchUpdates(options = {}) {
        try {
            this.isLoading = true;
            this.error = null;

            const {
                limit = 50,
                offset = 0,
                category = null,
                searchTerm = ''
            } = options;

            if (!this.client) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
            }

            let query = this.client
                .from('updates')
                .select('*')
                .eq('is_active', true)
                .order('released_at', { ascending: false });

            // 카테고리 필터링
            if (category && category !== 'all') {
                query = query.eq('type', category);
            }

            // 검색어 필터링
            if (searchTerm) {
                query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
            }

            // 페이지네이션
            if (limit > 0) {
                query = query.range(offset, offset + limit - 1);
            }

            const { data, error } = await query;

            // 상세한 디버깅 정보
            console.log('🔍 Supabase 쿼리 결과:', {
                data: data,
                dataLength: data ? data.length : 0,
                error: error,
                hasData: !!data,
                category: category,
                searchTerm: searchTerm,
                queryDetails: {
                    table: 'updates',
                    filters: { is_active: true, type: category !== 'all' ? category : '전체' },
                    orderBy: 'released_at DESC'
                }
            });

            if (error) {
                console.error('❌ Supabase 쿼리 에러 상세:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            // 원시 데이터 샘플 로깅
            if (data && data.length > 0) {
                console.log('📋 원시 데이터 첫 번째 항목:', {
                    id: data[0].id,
                    title: data[0].title,
                    type: data[0].type,
                    content_length: data[0].content ? data[0].content.length : 0,
                    released_at: data[0].released_at,
                    is_active: data[0].is_active,
                    all_keys: Object.keys(data[0])
                });
            }

            // 데이터가 있는지 확인
            if (!data || data.length === 0) {
                console.warn('⚠️ 데이터베이스에서 데이터를 찾을 수 없습니다');
                console.log('쿼리 조건:', { category, searchTerm, limit, offset });
            }

            // 데이터 변환
            this.updates = this.transformUpdates(data || []);
            this.filteredUpdates = [...this.updates];

            console.log(`✅ 업데이트 ${this.updates.length}개 로드 완료`);
            
            // 첫 번째 데이터 샘플 로그
            if (this.updates.length > 0) {
                console.log('📄 첫 번째 업데이트 샘플:', this.updates[0]);
            }
            
            return this.updates;

        } catch (error) {
            console.error('❌ 업데이트 데이터 로드 실패:', error);
            this.error = error;
            return [];
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 업데이트 데이터 변환 (mockData 형식에 맞게)
     */
    transformUpdates(supabaseData) {
        console.log('🔧 데이터 변환 시작:', supabaseData.length, '개 항목');
        
        if (!Array.isArray(supabaseData)) {
            console.error('❌ 변환할 데이터가 배열이 아닙니다:', typeof supabaseData);
            return [];
        }

        return supabaseData.map((item, index) => {
            try {
                console.log(`📋 아이템 ${index + 1} 변환 중:`, {
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    content: item.content ? item.content.substring(0, 100) + '...' : '없음',
                    released_at: item.released_at
                });

                // 필수 필드 검증
                if (!item.id || !item.title) {
                    console.warn('⚠️ 필수 필드 누락:', { id: item.id, title: item.title });
                }

                // content에서 변경사항 추출
                const changes = this.extractChanges(item.content);
                const description = this.extractDescription(item.content);
                
                // 날짜 포맷팅 (안전한 처리)
                let releaseDate;
                try {
                    releaseDate = item.released_at 
                        ? new Date(item.released_at).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0];
                } catch (dateError) {
                    console.warn('⚠️ 날짜 파싱 오류:', item.released_at, dateError);
                    releaseDate = new Date().toISOString().split('T')[0];
                }
                
                const transformedItem = {
                    id: item.id,
                    version: this.generateVersion(item.type, item.id),
                    title: item.title || '제목 없음',
                    type: this.mapUpdateType(item.type),
                    category: item.type || '개선', // type과 category가 동일
                    description: description,
                    changes: changes,
                    releaseDate: releaseDate,
                    isLatest: index === 0 // 첫 번째가 최신
                };

                console.log('✅ 변환 완료:', {
                    id: transformedItem.id,
                    title: transformedItem.title,
                    category: transformedItem.category,
                    description: transformedItem.description.substring(0, 50) + '...',
                    changesCount: transformedItem.changes.length,
                    changes: transformedItem.changes,
                    releaseDate: transformedItem.releaseDate
                });
                
                return transformedItem;
            } catch (transformError) {
                console.error(`❌ 아이템 ${index + 1} 변환 실패:`, transformError);
                console.error('문제가 된 원시 데이터:', item);
                
                // 기본값으로 변환
                return {
                    id: item.id || Date.now(),
                    version: 'v1.0.0',
                    title: item.title || '제목 없음',
                    type: 'minor',
                    category: item.type || '개선',
                    description: '업데이트 설명이 없습니다.',
                    changes: ['업데이트 내용을 확인하세요.'],
                    releaseDate: new Date().toISOString().split('T')[0],
                    isLatest: false
                };
            }
        }).filter(item => item !== null);
    }

    /**
     * 콘텐츠에서 설명과 변경사항 분리
     */
    extractDescription(content) {
        if (!content || typeof content !== 'string') {
            return '업데이트 설명이 없습니다.';
        }

        // 줄 단위로 분리
        const lines = content.split('\n').filter(line => line.trim());
        const descLines = [];
        
        for (const line of lines) {
            // 변경사항 시작 마커들 체크
            if (line.includes('주요 변경사항:') || 
                line.includes('변경사항:') || 
                line.startsWith('•') || 
                line.startsWith('-') ||
                line.startsWith('*')) {
                break;
            }
            if (line.trim()) {
                descLines.push(line.trim());
            }
        }
        
        // 설명이 없으면 첫 번째 줄을 사용
        if (descLines.length === 0 && lines.length > 0) {
            return lines[0].trim();
        }
        
        return descLines.length > 0 ? descLines.join(' ') : '업데이트 설명이 없습니다.';
    }

    /**
     * 콘텐츠에서 변경사항 목록 추출
     */
    extractChanges(content) {
        if (!content || typeof content !== 'string') {
            return ['업데이트 내용을 확인하세요.'];
        }

        const lines = content.split('\n').filter(line => line.trim());
        const changes = [];
        let inChangesList = false;
        
        for (const line of lines) {
            // 변경사항 섹션 시작 감지
            if (line.includes('주요 변경사항:') || 
                line.includes('변경사항:') ||
                line.includes('개선사항:')) {
                inChangesList = true;
                continue;
            }
            
            // 변경사항 목록 추출
            if (inChangesList) {
                if (line.startsWith('•')) {
                    changes.push(line.replace('• ', '').trim());
                } else if (line.startsWith('-')) {
                    changes.push(line.replace('- ', '').trim());
                } else if (line.startsWith('*')) {
                    changes.push(line.replace('* ', '').trim());
                } else if (line.match(/^\d+\./)) {
                    changes.push(line.replace(/^\d+\.\s*/, '').trim());
                }
            } else {
                // 변경사항 섹션이 없는 경우, 불릿 포인트가 있는 줄들을 직접 찾기
                if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                    const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
                    if (cleanLine) {
                        changes.push(cleanLine);
                    }
                }
            }
        }
        
        // 변경사항이 없으면 전체 내용을 하나의 변경사항으로 처리
        if (changes.length === 0) {
            const contentText = content.trim();
            if (contentText) {
                // 내용이 너무 길면 첫 문장만 사용
                const firstSentence = contentText.split('.')[0].trim();
                changes.push(firstSentence || '업데이트 내용을 확인하세요.');
            } else {
                changes.push('업데이트 내용을 확인하세요.');
            }
        }
        
        return changes;
    }

    /**
     * 업데이트 타입 매핑 (필요시 변환)
     */
    mapUpdateType(type) {
        const typeMap = {
            '기능추가': 'major',
            '개선': 'minor',
            '버그수정': 'patch',
            '보안': 'hotfix'
        };
        return typeMap[type] || 'minor';
    }

    /**
     * 버전 생성 (ID 기반)
     */
    generateVersion(type, id) {
        const typeVersions = {
            '기능추가': 'v2.',
            '개선': 'v2.',
            '버그수정': 'v1.9.',
            '보안': 'v2.'
        };
        
        const baseVersion = typeVersions[type] || 'v1.';
        return `${baseVersion}${id}`;
    }

    /**
     * 실시간 업데이트 구독
     */
    subscribeToUpdates(callback) {
        if (!this.client) {
            console.warn('Supabase 클라이언트가 초기화되지 않았습니다.');
            return null;
        }

        try {
            const subscription = this.client
                .channel('updates_channel')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'updates' },
                    (payload) => {
                        console.log('📡 실시간 업데이트:', payload);
                        if (callback) {
                            callback(payload);
                        }
                    }
                )
                .subscribe();

            console.log('✅ 실시간 업데이트 구독 활성화');
            return subscription;

        } catch (error) {
            console.error('❌ 실시간 구독 실패:', error);
            return null;
        }
    }

    /**
     * 구독 해제
     */
    unsubscribe(subscription) {
        if (subscription) {
            this.client.removeChannel(subscription);
            console.log('✅ 실시간 구독 해제');
        }
    }

    /**
     * 클라이언트 측 필터링
     */
    filterUpdates(category = 'all', searchTerm = '') {
        let filtered = [...this.updates];

        // 카테고리 필터링
        if (category !== 'all') {
            filtered = filtered.filter(update => update.category === category);
        }

        // 검색어 필터링
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(update => {
                return update.title.toLowerCase().includes(term) ||
                       update.description.toLowerCase().includes(term) ||
                       update.changes.some(change => change.toLowerCase().includes(term));
            });
        }

        this.filteredUpdates = filtered;
        return this.filteredUpdates;
    }

    /**
     * 페이지네이션 적용
     */
    getPagedUpdates(page = 1, itemsPerPage = 10) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return this.filteredUpdates.slice(startIndex, endIndex);
    }

    /**
     * 총 페이지 수 계산
     */
    getTotalPages(itemsPerPage = 10) {
        return Math.ceil(this.filteredUpdates.length / itemsPerPage);
    }

    /**
     * 로딩 상태 확인
     */
    getLoadingState() {
        return {
            isLoading: this.isLoading,
            error: this.error,
            hasData: this.updates.length > 0
        };
    }

    /**
     * 에러 초기화
     */
    clearError() {
        this.error = null;
    }

    /**
     * 데이터 새로고침
     */
    async refresh(options = {}) {
        console.log('🔄 업데이트 데이터 새로고침...');
        return await this.fetchUpdates(options);
    }
}

// 전역 인스턴스 생성
window.UpdatesSupabase = new UpdatesSupabase();

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Supabase 초기화 완료 대기
        let attempts = 0;
        const maxAttempts = 50; // 5초 대기

        while (!window.WaveSupabase && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (window.WaveSupabase) {
            const success = await window.UpdatesSupabase.init();
            if (success) {
                console.log('✅ UpdatesSupabase 자동 초기화 완료');
            }
        } else {
            console.warn('⚠️ WaveSupabase를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('❌ UpdatesSupabase 자동 초기화 실패:', error);
    }
});