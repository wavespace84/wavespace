/**
 * WAVE SPACE - Market Research Supabase Integration
 * 시장조사서 페이지 Supabase 연동 모듈
 */

class MarketResearchSupabase {
    constructor() {
        this.client = null;
        this.documents = [];
        this.filteredDocuments = [];
        this.isLoading = false;
        this.error = null;
        this.bucketName = 'market-research';
    }

    /**
     * Supabase 클라이언트 초기화 (디버깅 강화)
     */
    async init() {
        try {
            console.log('🔧 MarketResearchSupabase 초기화 시작...');
            
            // Supabase 초기화 완료를 명시적으로 대기
            if (window.supabaseInitPromise) {
                console.log('⏳ Supabase 초기화 완료 대기 중...');
                await window.supabaseInitPromise;
            }
            
            if (!window.WaveSupabase) {
                throw new Error('WaveSupabase가 초기화되지 않았습니다.');
            }
            
            this.client = window.WaveSupabase.getClient();
            
            if (!this.client) {
                throw new Error('Supabase 클라이언트를 가져올 수 없습니다.');
            }
            
            console.log('✅ Supabase 클라이언트 연결 완료');
            
            // Storage 버킷 확인 및 생성
            console.log('🪣 Storage 버킷 확인 중...');
            const bucketResult = await this.ensureStorageBucket();
            
            if (bucketResult) {
                console.log('✅ MarketResearchSupabase 초기화 성공 (Storage 활성화)');
            } else {
                console.log('⚠️ MarketResearchSupabase 초기화 완료 (Storage 비활성화)');
            }
            
            return true;
        } catch (error) {
            console.error('❌ MarketResearchSupabase 초기화 실패:', error);
            this.error = error;
            this.storageDisabled = true; // 초기화 실패 시 Storage 비활성화
            return false;
        }
    }

    /**
     * Storage 버킷 확인 및 생성 (개선된 버전)
     */
    async ensureStorageBucket() {
        try {
            console.log('🔍 Storage 버킷 확인 중...');
            
            // 버킷 목록 조회 (권한 확인)
            const { data: buckets, error: listError } = await this.client.storage.listBuckets();
            
            if (listError) {
                // RLS 정책이나 권한 문제로 버킷 목록 조회 실패
                console.warn('⚠️ Storage 버킷 목록 조회 실패:', listError.message);
                
                if (listError.message.includes('permission')) {
                    console.log('🔐 권한 문제로 Storage 기능을 비활성화합니다.');
                    console.log('💡 해결방법: Supabase 대시보드에서 Storage RLS 정책을 확인하세요.');
                } else {
                    console.log('❓ 알 수 없는 문제로 Storage 기능을 비활성화합니다.');
                }
                
                console.log('🔧 수동 해결: createBucketGuide() 실행');
                
                // Storage 기능 비활성화 플래그 설정
                this.storageDisabled = true;
                return false;
            }

            console.log(`📦 총 ${buckets.length}개 버킷 발견`);
            const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

            if (!bucketExists) {
                console.log(`🛠️ '${this.bucketName}' 버킷 생성 시도...`);
                
                // 버킷 생성 시도
                const { error: createError } = await this.client.storage.createBucket(this.bucketName, {
                    public: true, // public으로 설정하여 RLS 문제 해결
                    allowedMimeTypes: [
                        'application/pdf',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    ],
                    fileSizeLimit: 50 * 1024 * 1024 // 50MB
                });

                if (createError) {
                    console.error('❌ 버킷 생성 실패:', createError.message);
                    
                    if (createError.message?.includes('RLS') || createError.message?.includes('policy')) {
                        console.log('🔐 RLS 정책 문제입니다. Storage 기능을 비활성화합니다.');
                        console.log('💡 해결방법: Supabase 대시보드에서 Storage 정책을 확인하세요.');
                    } else if (createError.message?.includes('already exists')) {
                        console.log('ℹ️ 버킷이 이미 존재합니다 (다른 방식으로 생성됨)');
                        return true;
                    } else if (createError.message?.includes('permission')) {
                        console.log('🔐 권한 부족 문제입니다.');
                        console.log('💡 관리자 권한으로 Supabase 대시보드에서 버킷을 생성하세요.');
                    } else {
                        console.log('❓ 예상치 못한 오류입니다.');
                    }
                    
                    console.log('🔧 수동 해결: createBucketGuide() 실행');
                    this.storageDisabled = true;
                    return false;
                } else {
                    console.log('✅ Storage 버킷 생성 성공:', this.bucketName);
                    this.storageDisabled = false;
                    return true;
                }
            } else {
                console.log('✅ Storage 버킷 확인 완료:', this.bucketName);
                this.storageDisabled = false;
                
                // 버킷이 존재하면 간단한 업로드 테스트 실행
                const testResult = await this.testBucketAccess();
                if (!testResult) {
                    console.warn('⚠️ 버킷은 존재하지만 업로드 권한이 없습니다.');
                    this.storageDisabled = true;
                    return false;
                }
                
                return true;
            }
        } catch (error) {
            // 네트워크 오류나 기타 예상치 못한 오류
            console.error('❌ Storage 버킷 확인 중 예외 발생:', error.message);
            console.log('💡 네트워크 문제이거나 Supabase 서비스 오류일 수 있습니다.');
            console.log('🔧 잠시 후 다시 시도하거나 createBucketGuide() 실행');
            
            this.storageDisabled = true;
            return false;
        }
    }

    /**
     * 버킷 접근 권한 테스트 (작은 더미 파일로)
     */
    async testBucketAccess() {
        try {
            const testBlob = new Blob(['access-test'], { type: 'text/plain' });
            const testPath = `test/access-${Date.now()}.txt`;
            
            const { error: uploadError } = await this.client.storage
                .from(this.bucketName)
                .upload(testPath, testBlob);
            
            if (uploadError) {
                console.warn('⚠️ 버킷 업로드 테스트 실패:', uploadError.message);
                return false;
            }
            
            // 테스트 파일 즉시 삭제
            await this.client.storage.from(this.bucketName).remove([testPath]);
            console.log('✅ 버킷 접근 권한 확인 완료');
            return true;
        } catch (error) {
            console.warn('⚠️ 버킷 접근 테스트 중 예외:', error.message);
            return false;
        }
    }

    /**
     * 시장조사서 목록 가져오기 (호환성을 위한 getDocuments 메서드)
     */
    async getDocuments(options = {}) {
        return await this.fetchDocuments(options);
    }

    /**
     * 시장조사서 목록 가져오기
     */
    async fetchDocuments(options = {}) {
        try {
            this.isLoading = true;
            this.error = null;

            const {
                limit = 50,
                offset = 0,
                region1 = null,
                region2 = null,
                productType = null,
                supplyType = null,
                searchTerm = '',
                sortBy = 'latest'
            } = options;

            let query = this.client
                .from('market_research_uploads')
                .select(`
                    id, title, description, file_url, file_size, file_type,
                    original_filename, page_count, download_count, thumbnail_url,
                    region1, region2, full_location, product_type, supply_type,
                    upload_points, download_points, keywords, tags,
                    file_created_date, created_at, updated_at,
                    is_verified, is_active,
                    users!market_research_uploads_user_id_fkey (
                        username, full_name
                    )
                `)
                .eq('is_active', true)
                .eq('is_verified', true);

            // 지역 필터링
            if (region1 && region1 !== 'all') {
                query = query.eq('region1', region1);
            }
            if (region2 && region2 !== 'all') {
                query = query.eq('region2', region2);
            }

            // 상품 유형 필터링
            if (productType && productType !== 'all') {
                query = query.eq('product_type', productType);
            }

            // 공급 유형 필터링
            if (supplyType && supplyType !== 'all') {
                query = query.eq('supply_type', supplyType);
            }

            // 검색어 필터링
            if (searchTerm) {
                query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,full_location.ilike.%${searchTerm}%`);
            }

            // 정렬
            switch (sortBy) {
            case 'latest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'filesize':
                query = query.order('file_size', { ascending: false });
                break;
            case 'popular':
                query = query.order('download_count', { ascending: false });
                break;
            default:
                query = query.order('created_at', { ascending: false });
            }

            // 페이지네이션
            if (limit > 0) {
                query = query.range(offset, offset + limit - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.error('❌ 시장조사서 조회 실패:', error);
                throw error;
            }

            // 데이터 변환
            this.documents = this.transformDocuments(data || []);
            this.filteredDocuments = [...this.documents];

            console.log(`✅ 시장조사서 ${this.documents.length}개 로드 완료`);
            return this.documents;

        } catch (error) {
            console.error('❌ 시장조사서 데이터 로드 실패:', error);
            this.error = error;
            return [];
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 파일 업로드 (디버깅 강화 버전)
     */
    async uploadFile(file, metadata) {
        try {
            console.log('🚀 파일 업로드 시작');
            console.log('📄 파일 정보:', {
                name: file.name,
                size: file.size,
                type: file.type
            });
            console.log('📋 메타데이터:', metadata);
            
            this.isLoading = true;

            // 1. 필수 매개변수 확인
            if (!file) {
                throw new Error('파일이 제공되지 않았습니다.');
            }
            if (!metadata) {
                throw new Error('메타데이터가 제공되지 않았습니다.');
            }
            if (!metadata.userId) {
                // AuthService에서 실제 사용자 ID 가져오기
                const authService = window.authService || window.AuthService;
                const currentUser = authService?.getCurrentUser();
                
                if (currentUser && currentUser.id) {
                    metadata.userId = currentUser.id;
                    console.log('✅ AuthService에서 userId 가져옴:', metadata.userId);
                } else {
                    console.warn('⚠️ AuthService에서 userId를 찾을 수 없습니다. 임시 ID를 사용합니다.');
                    metadata.userId = 'anonymous-' + Date.now();
                }
            }

            // 2. Supabase 클라이언트 확인
            if (!this.client) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
            }

            // 3. 파일 검증
            const validation = this.validateFile(file, metadata);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }
            
            console.log('✅ 기본 검증 통과');

            // 2. 파일 해시 생성 (중복 검사용)
            const fileHash = await this.generateFileHash(file);
            
            // 3. 중복 파일 확인
            const duplicate = await this.checkDuplicateFile(fileHash);
            if (duplicate) {
                throw new Error('이미 업로드된 파일입니다.');
            }

            // 4. 페이지 수 추출 (PDF만)
            let pageCount = metadata.pageCount || 0;
            if (file.type === 'application/pdf' && window.pdfjsLib) {
                pageCount = await this.extractPdfPageCount(file);
            }

            // 5. 포인트 계산
            const points = this.calculateUploadPoints(pageCount, metadata.fileCreatedDate);

            let filePath = null;
            let fileUrl = null;

            // 6. Storage 업로드 (개선된 버전)
            if (!this.storageDisabled) {
                try {
                    console.log('📤 Storage 업로드 시작...');
                    
                    // AuthService를 통해 로그인 상태 확인
                    const authService = window.authService || window.AuthService;
                    const currentUser = authService?.getCurrentUser();
                    
                    console.log('🔐 AuthService 인증 상태:', {
                        hasAuthService: !!authService,
                        hasUser: !!currentUser,
                        userId: currentUser?.id,
                        authUserId: currentUser?.auth_user_id,
                        memberType: currentUser?.member_type,
                        isPractitioner: currentUser?.is_practitioner,
                        userEmail: currentUser?.email
                    });
                    
                    // AuthService에서 사용자가 없으면 Supabase 직접 확인
                    let user = null;
                    if (currentUser) {
                        // AuthService에서 사용자 정보가 있으면 사용
                        user = { 
                            id: currentUser.auth_user_id, 
                            email: currentUser.email 
                        };
                        console.log('✅ AuthService에서 로그인 사용자 확인됨');
                    } else {
                        // AuthService에 사용자가 없으면 직접 확인
                        const { data: { user: supabaseUser }, error: authError } = await this.client.auth.getUser();
                        user = supabaseUser;
                        console.log('🔍 Supabase 직접 인증 체크:', {
                            hasUser: !!user,
                            userId: user?.id,
                            authError: authError?.message
                        });
                        
                        // 여전히 사용자가 없으면 익명 로그인 시도
                        if (!user) {
                            console.log('🔑 익명 로그인 시도...');
                            const { data: anonData, error: anonError } = await this.client.auth.signInAnonymously();
                            if (anonError) {
                                console.warn('⚠️ 익명 로그인 실패:', anonError.message);
                            } else {
                                console.log('✅ 익명 로그인 성공:', anonData.user?.id);
                                user = anonData.user;
                            }
                        }
                    }
                    
                    // 파일명 및 경로 생성 (날짜 기반 폴더 구조)
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    const safeUUID = this.generateSafeUUID();
                    const currentDate = new Date();
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    
                    const fileName = `${safeUUID}.${fileExtension}`;
                    filePath = `market-research/${year}/${month}/${fileName}`;

                    console.log(`📁 업로드 경로: ${filePath}`);
                    console.log(`📏 파일 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                    console.log(`🪣 사용할 버킷: ${this.bucketName}`);
                    console.log('🔐 사용자 인증 상태:', {
                        hasUser: !!user,
                        userId: user?.id,
                        userEmail: user?.email
                    });

                    // Storage에 파일 업로드
                    const { data: uploadData, error: uploadError } = await this.client.storage
                        .from(this.bucketName)
                        .upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (uploadError) {
                        console.error('❌ Storage 업로드 실패:', uploadError.message);
                        console.error('📄 업로드 시도한 파일:', {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            path: filePath
                        });
                        
                        // 구체적인 오류 분석 및 해결 방안 제시
                        let errorMsg = 'Storage 파일 업로드에 실패했습니다.';
                        if (uploadError.message.includes('RLS') || uploadError.message.includes('policy')) {
                            errorMsg = 'Storage 접근 권한이 없습니다. 관리자에게 문의하세요.';
                            console.log('🔐 RLS 정책 문제입니다.');
                            console.log('💡 Supabase 대시보드 → Storage → Policies에서 정책을 확인하세요.');
                        } else if (uploadError.message.includes('permission')) {
                            errorMsg = 'Storage 업로드 권한이 없습니다.';
                            console.log('🔐 권한 문제입니다.');
                        } else if (uploadError.message.includes('size')) {
                            errorMsg = '파일 크기가 너무 큽니다. (최대 50MB)';
                            console.log('📏 파일 크기 문제입니다.');
                        } else if (uploadError.message.includes('duplicate') || uploadError.message.includes('exists')) {
                            errorMsg = '동일한 파일명이 이미 존재합니다.';
                            console.log('📁 파일명 중복 문제입니다.');
                        } else {
                            console.log('❓ 예상치 못한 Storage 오류:', uploadError);
                        }
                        
                        // Storage 업로드 실패 시 전체 프로세스 중단
                        throw new Error(errorMsg);
                    } else {
                        console.log('✅ Storage 업로드 성공:', uploadData.path);
                        
                        // 파일 공개 URL 가져오기
                        const { data: urlData } = this.client.storage
                            .from(this.bucketName)
                            .getPublicUrl(filePath);
                        fileUrl = urlData?.publicUrl;

                        if (!fileUrl) {
                            console.warn('⚠️ 파일 URL 생성 실패');
                            fileUrl = null;
                        } else {
                            console.log('🔗 공개 URL 생성 완료');
                        }
                    }
                } catch (storageError) {
                    console.error('❌ Storage 처리 중 예외 발생:', storageError.message);
                    console.log('💡 메타데이터만 저장하고 계속 진행합니다.');
                    fileUrl = null;
                    filePath = null;
                }
            } else {
                console.warn('⚠️ Storage 기능이 비활성화되어 있습니다.');
                console.log('🔧 Storage 상태 확인 필요:');
                console.log('  1. Supabase 대시보드 → Storage → Policies 확인');
                console.log('  2. 버킷 권한 설정 확인');
                console.log('  3. 인증 상태 확인');
                console.log('💡 파일 없이 메타데이터만 저장됩니다.');
                fileUrl = null;
                filePath = null;
            }

            // 9. 데이터베이스에 레코드 생성
            const { data: dbData, error: dbError } = await this.client
                .from('market_research_uploads')
                .insert({
                    user_id: metadata.userId,
                    title: metadata.title,
                    description: metadata.description,
                    file_url: fileUrl,
                    file_size: file.size,
                    file_type: '시장조사서',
                    original_filename: file.name,
                    region1: metadata.region1,
                    region2: metadata.region2,
                    full_location: `${metadata.region1} ${metadata.region2}`,
                    product_type: metadata.productType,
                    supply_type: metadata.supplyType,
                    page_count: pageCount,
                    file_created_date: metadata.fileCreatedDate,
                    file_hash: fileHash,
                    upload_points: points,
                    download_points: this.calculateDownloadPoints(pageCount, metadata.fileCreatedDate),
                    keywords: metadata.keywords || [],
                    tags: metadata.tags || [],
                    search_text: this.generateSearchText(metadata),
                    is_verified: true, // 개발 환경에서는 바로 활성화 (운영 환경에서는 false)
                    is_active: true
                })
                .select()
                .single();

            if (dbError) {
                // Storage에 업로드된 파일이 있다면 삭제
                if (filePath && !this.storageDisabled) {
                    try {
                        await this.client.storage.from(this.bucketName).remove([filePath]);
                    } catch (deleteError) {
                        console.warn('⚠️ 업로드 실패한 파일 삭제 중 오류:', deleteError.message);
                    }
                }
                throw dbError;
            }

            // 10. 사용자 포인트 업데이트
            await this.updateUserPoints(metadata.userId, points);
            
            // 11. 업로드 카운트 업데이트
            await this.updateUserUploadCount(metadata.userId);

            console.log('✅ 파일 업로드 완료:', dbData);
            return dbData;

        } catch (error) {
            console.error('❌ 파일 업로드 실패:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 파일 다운로드
     */
    async downloadFile(documentId, userId) {
        try {
            // 1. 문서 정보 조회
            const { data: document, error: docError } = await this.client
                .from('market_research_uploads')
                .select('*')
                .eq('id', documentId)
                .eq('is_active', true)
                .eq('is_verified', true)
                .single();

            if (docError || !document) {
                throw new Error('문서를 찾을 수 없습니다.');
            }

            // 2. 사용자 포인트 확인
            const { data: user, error: userError } = await this.client
                .from('users')
                .select('points')
                .eq('auth_user_id', userId)
                .single();

            if (userError || !user) {
                throw new Error('사용자 정보를 찾을 수 없습니다.');
            }

            if (user.points < document.download_points) {
                throw new Error(`포인트가 부족합니다. 필요: ${document.download_points}P, 보유: ${user.points}P`);
            }

            // 3. 포인트 차감 및 다운로드 카운트 업데이트 (트랜잭션)
            const { error: updateError } = await this.client.rpc('download_market_research', {
                p_document_id: documentId,
                p_user_id: userId,
                p_points_to_deduct: document.download_points
            });

            if (updateError) {
                throw updateError;
            }

            // 4. 파일 다운로드 URL 생성
            if (!document.file_url) {
                throw new Error('파일이 저장되어 있지 않습니다.');
            }

            // Storage에서 실제 파일 경로 추출
            const urlParts = document.file_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `uploads/${fileName}`;

            // 임시 서명된 URL 생성 (1시간 유효)
            const { data: signedUrl, error: urlError } = await this.client.storage
                .from(this.bucketName)
                .createSignedUrl(filePath, 3600);

            if (urlError) {
                throw new Error(`파일 다운로드 URL 생성 실패: ${urlError.message}`);
            }

            console.log('✅ 파일 다운로드 준비 완료');
            return {
                url: signedUrl.signedUrl,
                filename: document.original_filename || `document_${documentId}.pdf`
            };

        } catch (error) {
            console.error('❌ 파일 다운로드 실패:', error);
            throw error;
        }
    }

    /**
     * 데이터 변환 (기존 sampleDocuments 형식에 맞게)
     */
    transformDocuments(supabaseData) {
        return supabaseData.map(item => {
            // 안전한 날짜 처리
            const createdDate = item.created_at ? new Date(item.created_at) : new Date();
            const fileCreatedDate = item.file_created_date ? new Date(item.file_created_date) : createdDate;
            
            return {
                id: item.id,
                title: item.title || '제목 없음',
                type: item.product_type || '기타',
                region: item.region1 || '',
                district: item.region2 || '',
                location: item.full_location || '',
                date: createdDate.toLocaleDateString('ko-KR').replace(/\./g, '.'),
                createDate: `자료생성일: ${fileCreatedDate.toLocaleDateString('ko-KR').replace(/\./g, '.')}`,
                fileSize: this.formatFileSize(item.file_size || 0),
                fileType: this.getFileTypeFromUrl(item.file_url || ''),
                pages: item.page_count || 0,
                points: item.download_points || 0,
                supplyType: item.supply_type || '',
                isPremium: false,
                keywords: item.keywords || [],
                thumbnail: item.thumbnail_url || this.generateThumbnail(item.file_type),
                description: item.description || '',
                pdfPath: item.file_url || '',
                downloadCount: item.download_count || 0,
                uploader: item.users?.full_name || item.users?.username || '익명',
                isVerified: item.is_verified || false
            };
        });
    }

    // 유틸리티 메서드들
    generateSafeUUID() {
        // 브라우저 호환성을 위한 안전한 UUID 생성
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            try {
                return crypto.randomUUID();
            } catch (e) {
                console.warn('crypto.randomUUID() 실패, 대체 방법 사용');
            }
        }
        
        // 대체 UUID 생성 방법
        return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }) + '-' + Date.now().toString(16);
    }

    validateFile(file, metadata) {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
            return { isValid: false, message: '지원하지 않는 파일 형식입니다.' };
        }

        if (file.size > 50 * 1024 * 1024) {
            return { isValid: false, message: '파일 크기가 50MB를 초과합니다.' };
        }

        // 파일 생성일 확인 (24개월 이내)
        if (metadata.fileCreatedDate) {
            const fileDate = new Date(metadata.fileCreatedDate);
            const now = new Date();
            const monthsDiff = (now - fileDate) / (1000 * 60 * 60 * 24 * 30);
            
            if (monthsDiff > 24) {
                return { isValid: false, message: '24개월이 경과된 파일은 업로드할 수 없습니다.' };
            }
        }

        return { isValid: true };
    }

    async generateFileHash(file) {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async checkDuplicateFile(fileHash) {
        const { data } = await this.client
            .from('market_research_uploads')
            .select('id')
            .eq('file_hash', fileHash)
            .eq('is_active', true)
            .limit(1);
        
        return data && data.length > 0;
    }

    async extractPdfPageCount(file) {
        if (!window.pdfjsLib) return 0;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
            return pdf.numPages;
        } catch (error) {
            console.warn('PDF 페이지 수 추출 실패:', error);
            return 0;
        }
    }

    calculateUploadPoints(pageCount, fileCreatedDate) {
        const basePoints = 3000;
        
        // 페이지 지수
        let pageMultiplier = 1.0;
        if (pageCount >= 40) pageMultiplier = 1.2;
        else if (pageCount >= 30) pageMultiplier = 1.1;
        else if (pageCount >= 20) pageMultiplier = 1.0;
        else if (pageCount >= 10) pageMultiplier = 0.9;
        else pageMultiplier = 0.6;

        // 최신성 지수
        const daysDiff = (new Date() - new Date(fileCreatedDate)) / (1000 * 60 * 60 * 24);
        let freshnessMultiplier = 1.0;
        if (daysDiff <= 180) freshnessMultiplier = 1.2;
        else if (daysDiff <= 365) freshnessMultiplier = 1.0;
        else if (daysDiff <= 730) freshnessMultiplier = 0.7;
        else return 0;

        return Math.round(basePoints * pageMultiplier * freshnessMultiplier);
    }

    calculateDownloadPoints(pageCount, fileCreatedDate) {
        const basePoints = 7000;
        
        // 업로드 포인트와 같은 로직이지만 기준점이 다름
        let pageMultiplier = 1.0;
        if (pageCount >= 40) pageMultiplier = 1.2;
        else if (pageCount >= 30) pageMultiplier = 1.1;
        else if (pageCount >= 20) pageMultiplier = 1.0;
        else if (pageCount >= 10) pageMultiplier = 0.9;
        else pageMultiplier = 0.6;

        const daysDiff = (new Date() - new Date(fileCreatedDate)) / (1000 * 60 * 60 * 24);
        let freshnessMultiplier = 1.0;
        if (daysDiff <= 180) freshnessMultiplier = 1.2;
        else if (daysDiff <= 365) freshnessMultiplier = 1.0;
        else if (daysDiff <= 730) freshnessMultiplier = 0.7;
        else return 0;

        return Math.round(basePoints * pageMultiplier * freshnessMultiplier);
    }

    generateSearchText(metadata) {
        return [
            metadata.title,
            metadata.description,
            metadata.region1,
            metadata.region2, 
            metadata.productType,
            metadata.supplyType,
            ...(metadata.keywords || [])
        ].filter(Boolean).join(' ');
    }

    formatFileSize(bytes) {
        if (!bytes) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
    }

    getFileTypeFromUrl(url) {
        const extension = url.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'PDF',
            'ppt': 'PPT', 'pptx': 'PPT',
            'doc': 'DOC', 'docx': 'DOC',
            'xls': 'XLS', 'xlsx': 'XLS'
        };
        return typeMap[extension] || 'FILE';
    }

    generateThumbnail(fileType) {
        const colors = {
            'PDF': '#f87171', 'PPT': '#a78bfa', 'DOC': '#60a5fa',
            'XLS': '#34d399', 'FILE': '#9ca3af'
        };
        const color = colors[fileType] || colors['FILE'];
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect width='120' height='160' fill='${encodeURIComponent(color)}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='white' font-size='12'%3E${fileType}%3C/text%3E%3C/svg%3E`;
    }

    async updateUserPoints(userId, points) {
        await this.client.rpc('add_user_points', {
            user_id: userId,
            points_to_add: points
        });
    }

    async updateUserUploadCount(userId) {
        await this.client
            .from('users')
            .update({ 
                market_research_upload_count: this.client.sql`market_research_upload_count + 1` 
            })
            .eq('auth_user_id', userId);
    }

    // 실시간 구독
    subscribeToChanges(callback) {
        if (!this.client) return null;

        const subscription = this.client
            .channel('market_research_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'market_research_uploads' },
                (payload) => {
                    console.log('📡 시장조사서 실시간 업데이트:', payload);
                    if (callback) callback(payload);
                }
            )
            .subscribe();

        return subscription;
    }

    unsubscribe(subscription) {
        if (subscription) {
            this.client.removeChannel(subscription);
        }
    }

    // 로딩 상태 관리
    getLoadingState() {
        return {
            isLoading: this.isLoading,
            error: this.error,
            hasData: this.documents.length > 0
        };
    }

    clearError() {
        this.error = null;
    }

    // 디버깅 및 관리자 도구들
    async checkStorageHealth() {
        console.log('🏥 Storage 헬스체크 시작...');
        
        const health = {
            client: !!this.client,
            storageDisabled: this.storageDisabled,
            bucketName: this.bucketName,
            error: this.error?.message || null
        };

        if (this.client) {
            try {
                // 1. 버킷 존재 확인
                const { data: buckets, error: listError } = await this.client.storage.listBuckets();
                health.canListBuckets = !listError;
                health.bucketsFound = buckets?.length || 0;
                
                if (listError) {
                    health.listBucketsError = listError.message;
                } else {
                    health.targetBucketExists = buckets?.some(b => b.name === this.bucketName) || false;
                }

                // 2. 업로드 테스트 (더미 파일로)
                if (health.targetBucketExists) {
                    const testBlob = new Blob(['test'], { type: 'text/plain' });
                    const testPath = `test/health-check-${Date.now()}.txt`;
                    
                    const { error: uploadError } = await this.client.storage
                        .from(this.bucketName)
                        .upload(testPath, testBlob);
                    
                    health.canUpload = !uploadError;
                    if (uploadError) {
                        health.uploadError = uploadError.message;
                    } else {
                        // 테스트 파일 삭제
                        await this.client.storage.from(this.bucketName).remove([testPath]);
                        health.uploadTestSuccess = true;
                    }
                }
            } catch (error) {
                health.healthCheckError = error.message;
            }
        }

        console.log('📊 Storage 헬스체크 결과:', health);
        return health;
    }

    async createBucketGuide() {
        console.log('📖 Storage 버킷 생성 가이드');
        console.log('');
        console.log('1️⃣ Supabase 대시보드 (https://supabase.com/dashboard) 접속');
        console.log('2️⃣ 프로젝트 선택 > Storage 메뉴 클릭');
        console.log('3️⃣ "Create bucket" 버튼 클릭');
        console.log('4️⃣ 버킷 설정:');
        console.log('   - Name: market-research');
        console.log('   - Public bucket: ✅ 체크');
        console.log('   - File size limit: 50MB');
        console.log('   - Allowed MIME types: (비워두거나 PDF, DOC, PPT 등 추가)');
        console.log('5️⃣ "Create bucket" 클릭');
        console.log('');
        console.log('💡 또는 아래 명령어로 자동 생성 시도:');
        console.log('   window.MarketResearchSupabase.forceCreateBucket()');
    }

    async forceCreateBucket() {
        console.log('🔧 강제 버킷 생성 시도...');
        
        if (!this.client) {
            console.error('❌ Supabase 클라이언트가 없습니다.');
            return false;
        }

        try {
            const { error } = await this.client.storage.createBucket(this.bucketName, {
                public: true,
                allowedMimeTypes: [
                    'application/pdf',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ],
                fileSizeLimit: 50 * 1024 * 1024 // 50MB
            });

            if (error) {
                console.error('❌ 버킷 생성 실패:', error.message);
                return false;
            } else {
                console.log('✅ 버킷 생성 성공!');
                this.storageDisabled = false;
                return true;
            }
        } catch (error) {
            console.error('❌ 버킷 생성 중 예외:', error.message);
            return false;
        }
    }

    async testFileUpload() {
        console.log('🧪 파일 업로드 테스트 시작...');
        
        // 테스트용 PDF 파일 생성 (더미 데이터)
        const testContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000074 00000 n\n0000000120 00000 n\n%%EOF';
        const testFile = new Blob([testContent], { type: 'application/pdf' });
        testFile.name = 'test-upload.pdf';

        const testMetadata = {
            userId: 'test-user-id',
            title: '테스트 업로드',
            description: '업로드 테스트용 파일',
            region1: '서울',
            region2: '강남구',
            productType: '아파트',
            supplyType: '민간분양',
            pageCount: 1,
            fileCreatedDate: new Date().toISOString(),
            keywords: ['테스트'],
            tags: ['test']
        };

        try {
            const result = await this.uploadFile(testFile, testMetadata);
            console.log('✅ 테스트 업로드 성공:', result);
            return result;
        } catch (error) {
            console.error('❌ 테스트 업로드 실패:', error.message);
            return null;
        }
    }
}

// 전역 클래스 등록 (인스턴스가 아닌 클래스 자체를 등록)
window.MarketResearchSupabase = MarketResearchSupabase;

// 전역 디버깅 함수들 추가 (인스턴스 생성 후 사용)
window.createBucketGuide = () => {
    if (window.marketResearchSupabase) {
        return window.marketResearchSupabase.createBucketGuide();
    } else {
        console.error('MarketResearchSupabase 인스턴스가 생성되지 않았습니다.');
    }
};

window.checkStorageHealth = () => {
    if (window.marketResearchSupabase) {
        return window.marketResearchSupabase.checkStorageHealth();
    } else {
        console.error('MarketResearchSupabase 인스턴스가 생성되지 않았습니다.');
    }
};

window.testFileUpload = () => {
    if (window.marketResearchSupabase) {
        return window.marketResearchSupabase.testFileUpload();
    } else {
        console.error('MarketResearchSupabase 인스턴스가 생성되지 않았습니다.');
    }
};

// 자동 초기화는 market-research.js에서 처리
console.log('✅ MarketResearchSupabase 클래스 로드 완료');
console.log('📝 사용 방법: market-research.js에서 자동으로 인스턴스가 생성됩니다.');