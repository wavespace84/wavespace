/**
 * WAVE SPACE - File Service
 * 파일 업로드/다운로드 관련 기능을 처리하는 서비스
 */

// 의존성 관리를 위한 모듈 로더
const loadFileServiceDependencies = async () => {
    try {
        const baseServiceModule = await import('/js/core/BaseService.js');
        const helpersModule = await import('/js/utils/serviceHelpers.js');
        
        return {
            BaseService: baseServiceModule.BaseService,
            ApiResponse: helpersModule.ApiResponse,
            AuthorizationHelper: helpersModule.AuthorizationHelper,
            ValidationHelper: helpersModule.ValidationHelper
        };
    } catch (error) {
        console.warn('FileService 의존성 로드 실패, 기본 서비스로 동작:', error);
        return {
            BaseService: class {
                constructor(name) {
                    this.serviceName = name;
                    this.supabase = window.WaveSupabase?.getClient?.();
                }
                async waitForSupabase(maxAttempts = 100, delay = 100) {
                    let attempts = 0;
                    while (attempts < maxAttempts && (!window.WaveSupabase || !window.WaveSupabase.getClient)) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        attempts++;
                    }
                    if (window.WaveSupabase && window.WaveSupabase.getClient) {
                        this.supabase = window.WaveSupabase.getClient();
                        return true;
                    }
                    return false;
                }
            },
            ApiResponse: null,
            AuthorizationHelper: null,
            ValidationHelper: null
        };
    }
};

class FileService {
    constructor() {
        this.serviceName = 'FileService';
        this.supabase = null;
        this.bucketName = 'wave-files'; // Supabase Storage 버킷명
        this.initBaseServiceMethods();
    }
    
    initBaseServiceMethods() {
        this.waitForSupabase = async (maxAttempts = 100, delay = 100) => {
            let attempts = 0;
            while (attempts < maxAttempts && (!window.WaveSupabase || !window.WaveSupabase.getClient)) {
                await new Promise(resolve => setTimeout(resolve, delay));
                attempts++;
            }
            if (window.WaveSupabase && window.WaveSupabase.getClient) {
                this.supabase = window.WaveSupabase.getClient();
                return true;
            }
            return false;
        };
    }

    /**
     * 로그인 상태 안전하게 확인
     * @returns {boolean}
     */
    isUserLoggedIn() {
        const authService = this.getAuthService();
        return authService ? authService.isLoggedIn() : false;
    }

    /**
     * 현재 사용자 안전하게 가져오기
     * @returns {Object|null}
     */
    getCurrentUser() {
        const authService = this.getAuthService();
        return authService ? authService.getCurrentUser() : null;
    }

    /**
     * 관리자 권한 안전하게 확인
     * @returns {boolean}
     */
    isAdmin() {
        const authService = this.getAuthService();
        if (!authService) return false;
        
        return authService.isAdmin();
    }

    /**
     * 초기화
     */
    async init() {
        try {
            await this.waitForSupabase();
            console.log('📁 FileService 초기화 완료 - Storage 버킷은 수동 생성 필요');
            // 자동 버킷 생성을 비활성화 (400 에러 방지)
            // await this.createBucketIfNotExists();
        } catch (error) {
            console.error('FileService 초기화 실패:', error);
        }
    }

    /**
     * Storage 버킷 생성 (존재하지 않을 경우)
     * 관리자만 수동으로 호출할 수 있습니다.
     */
    async createBucketIfNotExists() {
        try {
            // 버킷 목록 조회
            const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
            
            if (listError) {
                console.warn('Storage 버킷 목록 조회 실패:', listError);
                console.log('💡 Supabase 대시보드에서 Storage를 활성화하고 "market-files" 버킷을 생성해주세요.');
                return; // 에러가 있어도 서비스는 계속 작동
            }
            
            const bucketExists = buckets && buckets.some(bucket => bucket.name === this.bucketName);
            
            if (!bucketExists) {
                console.log('📦 Storage 버킷 생성 시도:', this.bucketName);
                const { error } = await this.supabase.storage.createBucket(this.bucketName, {
                    public: false, // 인증된 사용자만 접근
                    fileSizeLimit: 50 * 1024 * 1024, // 50MB 제한
                    allowedMimeTypes: [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'text/plain'
                    ]
                });
                
                if (error) {
                    console.warn('Storage 버킷 생성 실패:', error);
                    console.log('💡 Supabase 대시보드에서 다음을 확인하세요:');
                    console.log('   1. Storage가 활성화되어 있는지');
                    console.log('   2. "market-files" 버킷을 수동으로 생성');
                    console.log('   3. Storage RLS 정책 설정');
                } else {
                    console.log('✅ Storage 버킷 생성됨:', this.bucketName);
                }
            } else {
                console.log('✅ Storage 버킷이 이미 존재함:', this.bucketName);
            }
        } catch (error) {
            // 버킷 생성 실패는 치명적이지 않으므로 경고만 표시
            console.warn('Storage 버킷 확인/생성 중 오류:', error.message);
            console.log('💡 파일 업로드 기능은 Storage 설정 후 사용 가능합니다.');
        }
    }

    /**
     * 관리자용: Storage 버킷 수동 생성
     * 콘솔에서 fileService.createStorageBucket() 호출
     */
    async createStorageBucket() {
        console.log('🔧 관리자 모드: Storage 버킷 생성 시도');
        try {
            await this.createBucketIfNotExists();
            console.log('✅ Storage 버킷 생성 작업 완료');
        } catch (error) {
            console.error('❌ Storage 버킷 생성 실패:', error);
        }
    }

    /**
     * 파일 업로드
     */
    async uploadFile(file, category, description = '') {
        return await this.executeQuery(async () => {
            if (!this.isUserLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            // 파일 크기 체크 (50MB)
            if (file.size > 50 * 1024 * 1024) {
                throw new Error('파일 크기는 50MB를 초과할 수 없습니다.');
            }

            // 파일 타입 체크
            if (!this.isAllowedFileType(file.type)) {
                throw new Error('지원하지 않는 파일 형식입니다.');
            }

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('사용자 정보를 가져올 수 없습니다.');
            }
            const fileName = `${category}/${Date.now()}_${file.name}`;

            // 1. Supabase Storage에 파일 업로드
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from(this.bucketName)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. 파일 정보를 데이터베이스에 저장
            const { data: fileData, error: dbError } = await this.supabase
                .from('files')
                .insert([{
                    filename: fileName,
                    original_name: file.name,
                    file_path: uploadData.path,
                    file_size: file.size,
                    mime_type: file.type,
                    uploader_id: currentUser.id,
                    category: category,
                    points_cost: this.calculateDownloadCost(category),
                    is_verified: this.needsVerification(category) ? false : true,
                    description: description
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            // 3. 업로드 포인트 지급
            const uploadPoints = this.getUploadPoints(category);
            if (uploadPoints > 0) {
                const authService = this.getAuthService();
                if (authService && authService.addPointHistory) {
                    await authService.addPointHistory(
                        currentUser.id,
                        uploadPoints,
                        'earn',
                        `파일 업로드: ${file.name}`,
                        fileData.id
                    );
                }
            }

            return ApiResponse.success(fileData);
        }, '파일 업로드 실패');
    }

    /**
     * 파일 다운로드
     */
    async downloadFile(fileId) {
        return await this.executeQuery(async () => {
            if (!this.isUserLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('사용자 정보를 가져올 수 없습니다.');
            }

            // 1. 파일 정보 조회
            const { data: fileInfo, error: fileError } = await this.supabase
                .from('files')
                .select('*')
                .eq('id', fileId)
                .single();

            if (fileError) throw fileError;

            // 2. 다운로드 권한 확인 (AuthorizationHelper 사용)
            if (!AuthorizationHelper.canDownloadFile(fileInfo, currentUser)) {
                throw new Error('다운로드 권한이 없습니다. 실무자 인증이 필요할 수 있습니다.');
            }

            // 3. 포인트 차감 (무료가 아닌 경우)
            if (fileInfo.points_cost > 0) {
                const authService = this.getAuthService();
                if (authService && authService.addPointHistory) {
                    await authService.addPointHistory(
                        currentUser.id,
                        -fileInfo.points_cost,
                        'spend',
                        `파일 다운로드: ${fileInfo.original_name}`,
                        fileId
                    );
                }
            }

            // 4. Storage에서 파일 다운로드
            const { data: downloadData, error: downloadError } = await this.supabase.storage
                .from(this.bucketName)
                .download(fileInfo.file_path);

            if (downloadError) throw downloadError;

            // 5. 다운로드 기록 저장
            await this.supabase
                .from('file_downloads')
                .insert([{
                    file_id: fileId,
                    user_id: currentUser.id,
                    points_used: fileInfo.points_cost
                }]);

            // 6. 다운로드 수 증가
            await this.supabase
                .from('files')
                .update({ downloads: fileInfo.downloads + 1 })
                .eq('id', fileId);

            // 7. 파일 다운로드 트리거
            const url = URL.createObjectURL(downloadData);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileInfo.original_name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return ApiResponse.success(null, '파일 다운로드가 시작되었습니다.');
        }, '파일 다운로드 실패');
    }

    /**
     * 파일 목록 조회
     */
    async getFiles(category, page = 1, limit = 20, searchQuery = '') {
        return await this.executeQuery(async () => {
            let query = this.supabase
                .from('files')
                .select(`
                    *,
                    users:uploader_id(username, profile_image_url)
                `)
                .eq('category', category)
                .order('created_at', { ascending: false });

            // BaseService의 applyPagination 메서드 사용
            query = this.applyPagination(query, page, limit);

            // 검색 필터
            if (searchQuery) {
                query = query.ilike('original_name', `%${searchQuery}%`);
            }

            // 승인이 필요한 카테고리는 승인된 것만 표시 (업로더 본인 제외)
            const currentUser = this.getCurrentUser();
            if (this.needsVerification(category) && currentUser) {
                query = query.or(`is_verified.eq.true,uploader_id.eq.${currentUser.id}`);
            } else if (this.needsVerification(category)) {
                query = query.eq('is_verified', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            return ApiResponse.success(data);
        }, '파일 목록 조회 실패');
    }

    /**
     * 파일 삭제
     */
    async deleteFile(fileId) {
        return await this.executeQuery(async () => {
            if (!this.isUserLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('사용자 정보를 가져올 수 없습니다.');
            }

            // 파일 정보 조회
            const { data: fileInfo, error: fileError } = await this.supabase
                .from('files')
                .select('*')
                .eq('id', fileId)
                .single();

            if (fileError) throw fileError;
            if (!fileInfo) {
                throw new Error('파일을 찾을 수 없습니다.');
            }

            // 권한 확인 (본인 또는 관리자만)
            if (fileInfo.uploader_id !== currentUser.id && !this.isAdmin()) {
                throw new Error('삭제 권한이 없습니다.');
            }

            // 1. Storage에서 파일 삭제
            const { error: storageError } = await this.supabase.storage
                .from(this.bucketName)
                .remove([fileInfo.file_path]);

            if (storageError) throw storageError;

            // 2. 데이터베이스에서 레코드 삭제
            const { error: dbError } = await this.supabase
                .from('files')
                .delete()
                .eq('id', fileId);

            if (dbError) throw dbError;

            return ApiResponse.success(null, '파일이 삭제되었습니다.');
        }, '파일 삭제 실패');
    }

    /**
     * 파일 승인/거부 (관리자 전용)
     */
    async moderateFile(fileId, approved) {
        return await this.executeQuery(async () => {
            if (!this.isAdmin()) {
                throw new Error('관리자 권한이 필요합니다.');
            }

            const { error } = await this.supabase
                .from('files')
                .update({ is_verified: approved })
                .eq('id', fileId);

            if (error) throw error;
            return ApiResponse.success(null, approved ? '파일이 승인되었습니다.' : '파일이 거부되었습니다.');
        }, '파일 승인/거부 실패');
    }

    /**
     * 허용된 파일 타입 확인
     */
    isAllowedFileType(mimeType) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
            'application/zip',
            'application/x-zip-compressed'
        ];
        return allowedTypes.includes(mimeType);
    }

    /**
     * 승인이 필요한 카테고리인지 확인
     */
    needsVerification(category) {
        return ['market_research', 'proposal'].includes(category);
    }

    /**
     * 다운로드 권한 확인
     */
    canDownload(fileInfo, user) {
        // AuthorizationHelper 사용
        return AuthorizationHelper.canDownloadFile(fileInfo, user);
    }

    /**
     * 카테고리별 업로드 포인트 계산
     */
    getUploadPoints(category) {
        const pointMap = {
            'market_research': 200, // 시장조사서
            'proposal': 150,        // 제안서
            'education': 100,       // 교육자료
            'policy': 50,           // 정책자료
            'other': 30             // 기타자료
        };
        return pointMap[category] || 30;
    }

    /**
     * 카테고리별 다운로드 비용 계산
     */
    calculateDownloadCost(category) {
        const costMap = {
            'market_research': 50,  // 시장조사서
            'proposal': 30,         // 제안서
            'education': 0,         // 교육자료 (무료)
            'policy': 0,            // 정책자료 (무료)
            'other': 10             // 기타자료
        };
        return costMap[category] || 10;
    }

    /**
     * 파일 크기 포맷팅
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 파일 아이콘 반환
     */
    getFileIcon(mimeType) {
        const iconMap = {
            'application/pdf': 'fas fa-file-pdf',
            'application/msword': 'fas fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
            'application/vnd.ms-excel': 'fas fa-file-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel',
            'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint',
            'image/jpeg': 'fas fa-file-image',
            'image/png': 'fas fa-file-image',
            'image/gif': 'fas fa-file-image',
            'text/plain': 'fas fa-file-alt',
            'application/zip': 'fas fa-file-archive',
            'application/x-zip-compressed': 'fas fa-file-archive'
        };
        return iconMap[mimeType] || 'fas fa-file';
    }

    /**
     * 파일 카드 HTML 렌더링
     */
    renderFileCard(file) {
        const uploadDate = new Date(file.created_at).toLocaleDateString('ko-KR');
        const uploader = file.users || {};
        const fileIcon = this.getFileIcon(file.mime_type);
        const fileSize = this.formatFileSize(file.file_size);
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('사용자 정보를 가져올 수 없습니다.');
        }
        const canDelete = currentUser && (file.uploader_id === currentUser.id || this.isAdmin());
        
        let statusBadge = '';
        if (this.needsVerification(file.category)) {
            statusBadge = file.is_verified 
                ? '<span class="file-status verified">승인됨</span>'
                : '<span class="file-status pending">승인대기</span>';
        }

        return `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-header">
                    <div class="file-icon">
                        <i class="${fileIcon}"></i>
                    </div>
                    <div class="file-info">
                        <h4 class="file-name">${file.original_name}</h4>
                        <div class="file-meta">
                            <span class="file-size">${fileSize}</span>
                            <span class="file-uploader">by ${uploader.username}</span>
                            <span class="file-date">${uploadDate}</span>
                        </div>
                    </div>
                    ${statusBadge}
                </div>
                
                ${file.description ? `<p class="file-description">${file.description}</p>` : ''}
                
                <div class="file-footer">
                    <div class="file-stats">
                        <span><i class="fas fa-download"></i> ${file.downloads}</span>
                        ${file.points_cost > 0 ? `<span><i class="fas fa-coins"></i> ${file.points_cost}P</span>` : '<span class="free-badge">무료</span>'}
                    </div>
                    <div class="file-actions">
                        ${this.canDownload(file, currentUser) ? 
        `<button onclick="fileService.downloadFile('${file.id}')" class="btn-download">
                                <i class="fas fa-download"></i> 다운로드
                            </button>` : 
        `<button class="btn-download disabled" disabled>
                                <i class="fas fa-lock"></i> 권한 없음
                            </button>`
}
                        ${canDelete ? 
        `<button onclick="fileService.deleteFile('${file.id}')" class="btn-delete">
                                <i class="fas fa-trash"></i>
                            </button>` : ''
}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 파일 업로드 진행률 표시
     */
    async uploadWithProgress(file, category, description, progressCallback) {
        return await this.executeQuery(async () => {
            if (!this.isUserLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('사용자 정보를 가져올 수 없습니다.');
            }
            const fileName = `${category}/${Date.now()}_${file.name}`;

            // 청크 단위로 업로드하여 진행률 표시
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from(this.bucketName)
                .upload(fileName, file, {
                    onUploadProgress: (progress) => {
                        const percentage = Math.round((progress.loaded / progress.total) * 100);
                        if (progressCallback) progressCallback(percentage);
                    }
                });

            if (uploadError) throw uploadError;

            // 데이터베이스에 파일 정보 저장
            const { data: fileData, error: dbError } = await this.supabase
                .from('files')
                .insert([{
                    filename: fileName,
                    original_name: file.name,
                    file_path: uploadData.path,
                    file_size: file.size,
                    mime_type: file.type,
                    uploader_id: currentUser.id,
                    category: category,
                    description: description,
                    points_cost: this.calculateDownloadCost(category),
                    is_verified: this.needsVerification(category) ? false : true
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            // 업로드 포인트 지급
            const uploadPoints = this.getUploadPoints(category);
            if (uploadPoints > 0) {
                const authService = this.getAuthService();
                if (authService && authService.addPointHistory) {
                    await authService.addPointHistory(
                        currentUser.id,
                        uploadPoints,
                        'earn',
                        `파일 업로드: ${file.name}`,
                        fileData.id
                    );
                }
            }

            return ApiResponse.success(fileData);
        }, '파일 업로드 실패');
    }

    /**
     * 내가 업로드한 파일 목록
     */
    async getMyFiles(page = 1, limit = 20) {
        return await this.executeQuery(async () => {
            if (!this.isUserLoggedIn()) {
                throw new Error('로그인이 필요합니다.');
            }

            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('사용자 정보를 가져올 수 없습니다.');
            }
            
            let query = this.supabase
                .from('files')
                .select('*')
                .eq('uploader_id', currentUser.id)
                .order('created_at', { ascending: false });
            
            // BaseService의 applyPagination 메서드 사용
            query = this.applyPagination(query, page, limit);

            const { data, error } = await query;
            if (error) throw error;
            return ApiResponse.success(data);
        }, '내 파일 조회 실패');
    }

    /**
     * 다운로드 내역 조회
     */
    async getDownloadHistory(userId, page = 1, limit = 20) {
        return await this.executeQuery(async () => {
            let query = this.supabase
                .from('file_downloads')
                .select(`
                    *,
                    files:file_id(original_name, category)
                `)
                .eq('user_id', userId)
                .order('downloaded_at', { ascending: false });
            
            // BaseService의 applyPagination 메서드 사용
            query = this.applyPagination(query, page, limit);

            const { data, error } = await query;
            if (error) throw error;
            return ApiResponse.success(data);
        }, '다운로드 내역 조회 실패');
    }

    /**
     * 미승인 파일 목록 (관리자용)
     */
    async getPendingFiles() {
        return await this.executeQuery(async () => {
            if (!this.isAdmin()) {
                throw new Error('관리자 권한이 필요합니다.');
            }

            const { data, error } = await this.supabase
                .from('files')
                .select(`
                    *,
                    users:uploader_id(username, email, company)
                `)
                .eq('is_verified', false)
                .in('category', ['market_research', 'proposal'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            return ApiResponse.success(data);
        }, '미승인 파일 조회 실패');
    }
}

// 전역 파일 서비스 인스턴스 생성 및 즉시 전역 등록
const fileService = new FileService();
window.fileService = fileService;

console.log('✅ FileService 전역 등록 완료');

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await fileService.init();
    });
} else {
    setTimeout(async () => {
        await fileService.init();
    }, 0);
}