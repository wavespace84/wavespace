/**
 * UploadModal 컴포넌트 로더
 * 파일 업로드 모달 통합 시스템
 */

class UploadModalLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.modal = null;
        this.selectedFiles = [];
        this.currentTags = [];
        this.uploadProgress = 0;
        
        // 이벤트 바인딩을 위한 컨텍스트 유지
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.handleFileDrop = this.handleFileDrop.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
        this.handleTagInput = this.handleTagInput.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleBackdropClick = this.handleBackdropClick.bind(this);
    }

    /**
     * UploadModal 로드 및 초기화
     * @param {Object} config - 업로드 모달 설정
     * @param {string} config.title - 모달 제목
     * @param {Array} config.acceptedTypes - 허용 파일 형식
     * @param {number} config.maxFileSize - 최대 파일 크기 (MB)
     * @param {Array} config.categories - 카테고리 옵션
     * @param {boolean} config.allowMultiple - 다중 파일 업로드 허용
     * @param {Function} config.onUpload - 업로드 완료 콜백
     * @param {Function} config.onCancel - 취소 콜백
     * @param {string} containerId - 컨테이너 ID (없으면 body에 추가)
     * @returns {Promise<void>}
     */
    async load(config, containerId = null) {
        try {
            // 기본값 설정
            const defaultConfig = {
                title: '파일 업로드',
                acceptedTypes: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
                maxFileSize: 50, // MB
                categories: [],
                allowMultiple: true,
                onUpload: null,
                onCancel: null
            };

            config = { ...defaultConfig, ...config };

            // CSS 로드
            await this.loadCSS();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 컨테이너 설정
            let container;
            if (containerId) {
                container = document.getElementById(containerId);
                if (!container) {
                    console.error(`[UploadModalLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                    return;
                }
            } else {
                container = document.body;
            }

            // 모달이 이미 있으면 제거
            const existingModal = document.getElementById('wave-upload-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // 컨테이너에 템플릿 삽입
            container.insertAdjacentHTML('beforeend', template);
            this.modal = document.getElementById('wave-upload-modal');

            // 설정 적용
            this.applyConfig(config);

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 설정 저장
            this.currentConfig = config;
            this.isLoaded = true;

            console.log('✅ UploadModal 로드 완료');
            
        } catch (error) {
            console.error('[UploadModalLoader] 로드 실패:', error);
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'upload-modal-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/upload-modal.css?v=' + Date.now();
        document.head.appendChild(link);

        // CSS 로드 완료 대기
        await new Promise((resolve) => {
            link.onload = resolve;
            setTimeout(resolve, 100); // 타임아웃
        });
    }

    /**
     * HTML 템플릿 로드
     */
    async loadTemplate() {
        const response = await fetch('components/upload-modal.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 설정 적용
     */
    applyConfig(config) {
        // 제목 설정
        const title = document.getElementById('upload-modal-title');
        if (title && config.title) {
            title.textContent = config.title;
        }

        // 파일 형식 설정
        const fileTypesEl = document.getElementById('upload-file-types');
        if (fileTypesEl && config.acceptedTypes.length > 0) {
            const extensions = config.acceptedTypes.map(type => type.toUpperCase()).join(', ');
            fileTypesEl.textContent = `지원 형식: ${extensions}`;
        }

        // 파일 크기 설정
        const fileSizeEl = document.getElementById('upload-file-size');
        if (fileSizeEl && config.maxFileSize) {
            fileSizeEl.textContent = `최대 파일 크기: ${config.maxFileSize}MB`;
        }

        // 파일 입력 설정
        const fileInput = document.getElementById('upload-file-input');
        if (fileInput) {
            const acceptTypes = config.acceptedTypes.map(type => `.${type.toLowerCase()}`).join(',');
            fileInput.accept = acceptTypes;
            fileInput.multiple = config.allowMultiple;
        }

        // 카테고리 옵션 설정
        const categorySelect = document.getElementById('upload-category');
        if (categorySelect && config.categories.length > 0) {
            // 기본 옵션 제거
            categorySelect.innerHTML = '<option value="">카테고리를 선택하세요</option>';
            
            // 카테고리 옵션 추가
            config.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.value || category;
                option.textContent = category.label || category;
                categorySelect.appendChild(option);
            });
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 모달 닫기 이벤트
        const closeBtn = document.getElementById('upload-modal-close');
        const cancelBtn = document.getElementById('upload-cancel-btn');
        const backdrop = document.getElementById('upload-modal-backdrop');

        if (closeBtn) closeBtn.addEventListener('click', this.handleModalClose);
        if (cancelBtn) cancelBtn.addEventListener('click', this.handleModalClose);
        if (backdrop) backdrop.addEventListener('click', this.handleBackdropClick);

        // 파일 선택 이벤트
        const fileInput = document.getElementById('upload-file-input');
        const dropzone = document.getElementById('upload-dropzone');

        if (fileInput) fileInput.addEventListener('change', this.handleFileSelect);
        if (dropzone) {
            dropzone.addEventListener('click', () => fileInput?.click());
            dropzone.addEventListener('dragover', this.handleDragOver);
            dropzone.addEventListener('dragleave', this.handleDragLeave);
            dropzone.addEventListener('drop', this.handleFileDrop);
        }

        // 폼 제출 이벤트
        const submitBtn = document.getElementById('upload-submit-btn');
        const form = document.getElementById('upload-form');

        if (submitBtn) submitBtn.addEventListener('click', this.handleFormSubmit);
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // 태그 입력 이벤트
        const tagsInput = document.getElementById('upload-tags');
        if (tagsInput) {
            tagsInput.addEventListener('keydown', this.handleTagInput);
            tagsInput.addEventListener('blur', this.handleTagInput);
        }

        // 설명 카운터 이벤트
        const descriptionInput = document.getElementById('upload-description');
        const counter = document.getElementById('description-counter');
        if (descriptionInput && counter) {
            descriptionInput.addEventListener('input', (e) => {
                counter.textContent = e.target.value.length;
            });
        }

        // ESC 키 이벤트
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.handleModalClose();
            }
        });
    }

    /**
     * 파일 선택 처리
     */
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    /**
     * 파일 드롭 처리
     */
    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const dropzone = document.getElementById('upload-dropzone');
        if (dropzone) dropzone.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    /**
     * 드래그 오버 처리
     */
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();

        const dropzone = document.getElementById('upload-dropzone');
        if (dropzone) dropzone.classList.add('dragover');
    }

    /**
     * 드래그 리브 처리
     */
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();

        const dropzone = document.getElementById('upload-dropzone');
        if (dropzone) dropzone.classList.remove('dragover');
    }

    /**
     * 파일 추가
     */
    addFiles(files) {
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (this.currentConfig && !this.currentConfig.allowMultiple) {
            this.selectedFiles = validFiles.slice(0, 1);
        } else {
            this.selectedFiles = [...this.selectedFiles, ...validFiles];
        }

        this.updateFileList();
        this.updateSubmitButton();
    }

    /**
     * 파일 검증
     */
    validateFile(file) {
        const config = this.currentConfig;
        if (!config) return false;

        // 파일 크기 검증
        const maxSize = config.maxFileSize * 1024 * 1024; // MB to bytes
        if (file.size > maxSize) {
            this.showError(`파일 크기가 ${config.maxFileSize}MB를 초과합니다: ${file.name}`);
            return false;
        }

        // 파일 형식 검증
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!config.acceptedTypes.includes(fileExt)) {
            this.showError(`지원하지 않는 파일 형식입니다: ${file.name}`);
            return false;
        }

        return true;
    }

    /**
     * 파일 목록 업데이트
     */
    updateFileList() {
        const fileList = document.getElementById('upload-file-list');
        if (!fileList) return;

        if (this.selectedFiles.length === 0) {
            fileList.style.display = 'none';
            return;
        }

        fileList.style.display = 'block';
        fileList.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-icon">
                    <i class="fas ${this.getFileIcon(file.name)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${this.escapeHtml(file.name)}</div>
                    <div class="file-meta">
                        <span>${this.formatFileSize(file.size)}</span>
                        <span>${file.type || '알 수 없음'}</span>
                    </div>
                </div>
                <button type="button" class="file-remove" data-index="${index}" title="파일 제거">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // 파일 제거 이벤트
            const removeBtn = fileItem.querySelector('.file-remove');
            removeBtn.addEventListener('click', () => {
                this.removeFile(index);
            });

            fileList.appendChild(fileItem);
        });
    }

    /**
     * 파일 제거
     */
    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateFileList();
        this.updateSubmitButton();
    }

    /**
     * 태그 입력 처리
     */
    handleTagInput(e) {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ',') {
            return;
        }

        e.preventDefault();
        const input = e.target;
        const value = input.value.trim();

        if (value && !this.currentTags.includes(value)) {
            this.currentTags.push(value);
            this.updateTagList();
        }

        input.value = '';
    }

    /**
     * 태그 목록 업데이트
     */
    updateTagList() {
        const tagList = document.getElementById('upload-tag-list');
        if (!tagList) return;

        tagList.innerHTML = '';

        this.currentTags.forEach((tag, index) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'upload-tag';
            tagElement.innerHTML = `
                ${this.escapeHtml(tag)}
                <button type="button" class="tag-remove" data-index="${index}" title="태그 제거">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // 태그 제거 이벤트
            const removeBtn = tagElement.querySelector('.tag-remove');
            removeBtn.addEventListener('click', () => {
                this.currentTags.splice(index, 1);
                this.updateTagList();
            });

            tagList.appendChild(tagElement);
        });
    }

    /**
     * 폼 제출 처리
     */
    async handleFormSubmit() {
        if (!this.validateForm()) {
            return;
        }

        try {
            this.showProgress(0, '업로드를 준비하고 있습니다...');
            
            const formData = this.collectFormData();
            
            // 업로드 콜백 실행
            if (this.currentConfig && this.currentConfig.onUpload) {
                await this.currentConfig.onUpload(formData, (progress) => {
                    this.updateProgress(progress);
                });
            }

            this.hideProgress();
            this.hide();
            
        } catch (error) {
            console.error('[UploadModalLoader] 업로드 실패:', error);
            this.hideProgress();
            this.showError('업로드 중 오류가 발생했습니다.');
        }
    }

    /**
     * 폼 검증
     */
    validateForm() {
        const titleInput = document.getElementById('upload-title');
        const categorySelect = document.getElementById('upload-category');

        if (!titleInput || !titleInput.value.trim()) {
            this.showError('제목을 입력해주세요.');
            titleInput?.focus();
            return false;
        }

        if (!categorySelect || !categorySelect.value) {
            this.showError('카테고리를 선택해주세요.');
            categorySelect?.focus();
            return false;
        }

        if (this.selectedFiles.length === 0) {
            this.showError('업로드할 파일을 선택해주세요.');
            return false;
        }

        return true;
    }

    /**
     * 폼 데이터 수집
     */
    collectFormData() {
        return {
            files: this.selectedFiles,
            title: document.getElementById('upload-title')?.value.trim() || '',
            description: document.getElementById('upload-description')?.value.trim() || '',
            category: document.getElementById('upload-category')?.value || '',
            tags: this.currentTags,
            visibility: document.querySelector('input[name="visibility"]:checked')?.value || 'public',
            points: parseInt(document.getElementById('upload-points')?.value) || 0
        };
    }

    /**
     * 제출 버튼 상태 업데이트
     */
    updateSubmitButton() {
        const submitBtn = document.getElementById('upload-submit-btn');
        if (!submitBtn) return;

        const hasFiles = this.selectedFiles.length > 0;
        submitBtn.disabled = !hasFiles;
    }

    /**
     * 진행률 표시
     */
    showProgress(progress, message = '') {
        const progressEl = document.getElementById('upload-progress');
        const percentEl = document.getElementById('upload-progress-percent');
        const fillEl = document.getElementById('upload-progress-fill');
        const detailsEl = document.getElementById('upload-progress-details');

        if (progressEl) progressEl.style.display = 'block';
        if (percentEl) percentEl.textContent = `${Math.round(progress)}%`;
        if (fillEl) fillEl.style.width = `${progress}%`;
        if (detailsEl && message) detailsEl.textContent = message;

        this.uploadProgress = progress;
    }

    /**
     * 진행률 업데이트
     */
    updateProgress(progress) {
        const percentEl = document.getElementById('upload-progress-percent');
        const fillEl = document.getElementById('upload-progress-fill');

        if (percentEl) percentEl.textContent = `${Math.round(progress)}%`;
        if (fillEl) fillEl.style.width = `${progress}%`;

        this.uploadProgress = progress;
    }

    /**
     * 진행률 숨김
     */
    hideProgress() {
        const progressEl = document.getElementById('upload-progress');
        if (progressEl) progressEl.style.display = 'none';
        this.uploadProgress = 0;
    }

    /**
     * 에러 메시지 표시
     */
    showError(message) {
        // 임시 토스트 메시지로 표시
        const toast = document.createElement('div');
        toast.className = 'upload-error-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    /**
     * 모달 닫기 처리
     */
    handleModalClose() {
        if (this.uploadProgress > 0 && this.uploadProgress < 100) {
            if (!confirm('업로드가 진행 중입니다. 정말 취소하시겠습니까?')) {
                return;
            }
        }

        this.hide();
        
        // 취소 콜백 실행
        if (this.currentConfig && this.currentConfig.onCancel) {
            this.currentConfig.onCancel();
        }
    }

    /**
     * 백드롭 클릭 처리
     */
    handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            this.handleModalClose();
        }
    }

    /**
     * 모달 표시
     */
    show() {
        if (this.modal) {
            this.modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * 모달 숨김
     */
    hide() {
        if (this.modal) {
            this.modal.classList.remove('show');
            document.body.style.overflow = '';
            
            // 애니메이션 완료 후 초기화
            setTimeout(() => {
                this.resetForm();
            }, 300);
        }
    }

    /**
     * 모달 가시성 확인
     */
    isVisible() {
        return this.modal && this.modal.classList.contains('show');
    }

    /**
     * 폼 초기화
     */
    resetForm() {
        this.selectedFiles = [];
        this.currentTags = [];
        this.uploadProgress = 0;

        // 폼 필드 초기화
        const form = document.getElementById('upload-form');
        if (form) form.reset();

        // 파일 목록 숨김
        const fileList = document.getElementById('upload-file-list');
        if (fileList) fileList.style.display = 'none';

        // 태그 목록 초기화
        const tagList = document.getElementById('upload-tag-list');
        if (tagList) tagList.innerHTML = '';

        // 진행률 숨김
        this.hideProgress();

        // 제출 버튼 비활성화
        this.updateSubmitButton();
    }

    /**
     * 유틸리티 메서드들
     */
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            pdf: 'fa-file-pdf',
            doc: 'fa-file-word',
            docx: 'fa-file-word',
            ppt: 'fa-file-powerpoint',
            pptx: 'fa-file-powerpoint',
            xls: 'fa-file-excel',
            xlsx: 'fa-file-excel',
            zip: 'fa-file-archive',
            rar: 'fa-file-archive'
        };
        return iconMap[ext] || 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 컴포넌트 제거
     */
    destroy() {
        if (this.modal) {
            this.modal.remove();
        }
        document.body.style.overflow = '';
        this.isLoaded = false;
        this.currentConfig = null;
        this.selectedFiles = [];
        this.currentTags = [];
    }
}

// 전역 인스턴스 생성
window.UploadModalLoader = UploadModalLoader;

/**
 * 사용 예시:
 * 
 * const uploadModal = new UploadModalLoader();
 * 
 * await uploadModal.load({
 *     title: '시장조사서 업로드',
 *     acceptedTypes: ['pdf', 'doc', 'docx'],
 *     maxFileSize: 50,
 *     categories: [
 *         { value: 'market-research', label: '시장조사서' },
 *         { value: 'planning', label: '기획서' }
 *     ],
 *     allowMultiple: false,
 *     onUpload: async (formData, progressCallback) => {
 *         // 업로드 로직
 *         progressCallback(50);
 *         await uploadToSupabase(formData);
 *         progressCallback(100);
 *     },
 *     onCancel: () => {
 *         console.log('업로드 취소됨');
 *     }
 * });
 * 
 * uploadModal.show();
 */

export default UploadModalLoader;