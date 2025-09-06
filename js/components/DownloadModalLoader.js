/**
 * DownloadModal 컴포넌트 로더
 * 파일 다운로드 모달 통합 시스템
 */

class DownloadModalLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.modal = null;
        this.downloadProgress = 0;
        this.isDownloading = false;
        
        // 이벤트 바인딩을 위한 컨텍스트 유지
        this.handleDownload = this.handleDownload.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleCharge = this.handleCharge.bind(this);
        this.handleTermsChange = this.handleTermsChange.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleBackdropClick = this.handleBackdropClick.bind(this);
    }

    /**
     * DownloadModal 로드 및 초기화
     * @param {Object} config - 다운로드 모달 설정
     * @param {Object} config.file - 파일 정보
     * @param {string} config.file.id - 파일 ID
     * @param {string} config.file.name - 파일명
     * @param {string} config.file.size - 파일 크기
     * @param {string} config.file.type - 파일 형식
     * @param {string} config.file.description - 파일 설명
     * @param {string} config.file.uploadDate - 업로드 날짜
     * @param {number} config.file.requiredPoints - 필요 포인트
     * @param {string} config.file.visibility - 공개 설정
     * @param {Object} config.uploader - 업로더 정보
     * @param {string} config.uploader.id - 업로더 ID
     * @param {string} config.uploader.name - 업로더 이름
     * @param {string} config.uploader.avatar - 업로더 아바타
     * @param {string} config.uploader.badge - 업로더 뱃지
     * @param {Object} config.uploader.stats - 업로더 통계
     * @param {Object} config.user - 현재 사용자 정보
     * @param {number} config.user.points - 보유 포인트
     * @param {string} config.user.memberType - 회원 유형
     * @param {boolean} config.user.isPremium - 프리미엄 여부
     * @param {Function} config.onDownload - 다운로드 콜백
     * @param {Function} config.onCancel - 취소 콜백
     * @param {Function} config.onCharge - 포인트 충전 콜백
     * @param {string} containerId - 컨테이너 ID (없으면 body에 추가)
     * @returns {Promise<void>}
     */
    async load(config, containerId = null) {
        try {
            // 기본값 설정
            const defaultConfig = {
                file: {
                    id: '',
                    name: '파일명.pdf',
                    size: '0 MB',
                    type: 'PDF 문서',
                    description: '',
                    uploadDate: new Date().toLocaleDateString(),
                    requiredPoints: 0,
                    visibility: 'public'
                },
                uploader: {
                    id: '',
                    name: '업로더명',
                    avatar: '',
                    badge: '일반',
                    stats: {
                        uploads: 0,
                        downloads: 0,
                        rating: 0
                    }
                },
                user: {
                    points: 0,
                    memberType: 'basic',
                    isPremium: false
                },
                onDownload: null,
                onCancel: null,
                onCharge: null
            };

            config = { ...defaultConfig, ...config };
            config.file = { ...defaultConfig.file, ...config.file };
            config.uploader = { ...defaultConfig.uploader, ...config.uploader };
            config.uploader.stats = { ...defaultConfig.uploader.stats, ...config.uploader.stats };
            config.user = { ...defaultConfig.user, ...config.user };

            // CSS 로드
            await this.loadCSS();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 컨테이너 설정
            let container;
            if (containerId) {
                container = document.getElementById(containerId);
                if (!container) {
                    console.error(`[DownloadModalLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                    return;
                }
            } else {
                container = document.body;
            }

            // 모달이 이미 있으면 제거
            const existingModal = document.getElementById('wave-download-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // 컨테이너에 템플릿 삽입
            container.insertAdjacentHTML('beforeend', template);
            this.modal = document.getElementById('wave-download-modal');

            // 설정 적용
            this.applyConfig(config);

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 설정 저장
            this.currentConfig = config;
            this.isLoaded = true;

            console.log('✅ DownloadModal 로드 완료');
            
        } catch (error) {
            console.error('[DownloadModalLoader] 로드 실패:', error);
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'download-modal-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/download-modal.css?v=' + Date.now();
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
        const response = await fetch('components/download-modal.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 설정 적용
     */
    applyConfig(config) {
        const { file, uploader, user } = config;

        // 파일 정보 설정
        this.setElementText('download-file-title', file.name);
        this.setElementText('download-file-size', file.size);
        this.setElementText('download-file-type', file.type);
        this.setElementText('download-file-date', file.uploadDate);
        this.setElementText('download-file-description', file.description || '파일 설명이 없습니다.');

        // 파일 아이콘 설정
        const fileIcon = document.getElementById('download-file-icon');
        if (fileIcon) {
            fileIcon.className = `fas ${this.getFileIcon(file.name)}`;
        }

        // 다운로드 권한 및 포인트 체크
        const downloadStatus = this.checkDownloadStatus(file, user);
        this.updateDownloadStatus(downloadStatus, file, user);

        // 업로더 정보 설정
        this.setElementText('download-uploader-name', uploader.name);
        this.setElementText('download-uploader-badge', uploader.badge);
        this.setElementText('download-uploader-uploads', uploader.stats.uploads);
        this.setElementText('download-uploader-downloads', uploader.stats.downloads);
        this.setElementText('download-uploader-rating', uploader.stats.rating);

        // 업로더 아바타 설정
        const avatar = document.getElementById('download-uploader-avatar');
        if (avatar && uploader.avatar) {
            avatar.src = uploader.avatar;
            avatar.style.display = 'block';
            const fallback = avatar.nextElementSibling;
            if (fallback) fallback.style.display = 'none';
        }

        // 다운로드 버튼 상태 업데이트
        this.updateDownloadButton(downloadStatus);
    }

    /**
     * 다운로드 상태 확인
     */
    checkDownloadStatus(file, user) {
        // 권한 체크 (실무자 전용 파일인 경우)
        if (file.visibility === 'premium' && !user.isPremium) {
            return { 
                status: 'no_permission', 
                message: '이 파일을 다운로드하려면 실무자 인증이 필요합니다.' 
            };
        }

        // 회원 전용 파일 체크
        if (file.visibility === 'members' && user.memberType === 'guest') {
            return { 
                status: 'no_permission', 
                message: '이 파일을 다운로드하려면 회원가입이 필요합니다.' 
            };
        }

        // 무료 파일
        if (file.requiredPoints === 0) {
            return { status: 'free' };
        }

        // 포인트 부족
        if (user.points < file.requiredPoints) {
            return { 
                status: 'insufficient_points',
                needed: file.requiredPoints - user.points
            };
        }

        // 포인트 충분
        return { status: 'paid', cost: file.requiredPoints };
    }

    /**
     * 다운로드 상태 UI 업데이트
     */
    updateDownloadStatus(status, file, user) {
        // 모든 상태 섹션 숨김
        this.hideElement('download-point-info');
        this.hideElement('download-free-info');
        this.hideElement('download-permission-info');
        this.hideElement('download-insufficient-info');
        this.hideElement('download-charge-btn');

        switch (status.status) {
        case 'free':
            this.showElement('download-free-info');
            break;
                
        case 'paid':
            this.showElement('download-point-info');
            this.setElementText('download-required-points', file.requiredPoints);
            this.setElementText('download-user-points', user.points);
            this.setElementText('download-remaining-points', user.points - file.requiredPoints);
            break;
                
        case 'no_permission':
            this.showElement('download-permission-info');
            this.setElementText('download-permission-message', status.message);
            break;
                
        case 'insufficient_points':
            this.showElement('download-insufficient-info');
            this.showElement('download-charge-btn');
            this.setElementText('download-needed-points', status.needed);
            break;
        }
    }

    /**
     * 다운로드 버튼 상태 업데이트
     */
    updateDownloadButton(status) {
        const downloadBtn = document.getElementById('download-confirm-btn');
        const termsCheckbox = document.getElementById('download-terms-agree');
        
        if (!downloadBtn) return;

        let disabled = true;
        let text = '다운로드';

        switch (status.status) {
        case 'free':
            text = '무료 다운로드';
            disabled = !termsCheckbox?.checked;
            break;
                
        case 'paid':
            text = `${status.cost} 포인트로 다운로드`;
            disabled = !termsCheckbox?.checked;
            break;
                
        case 'no_permission':
            text = '권한 없음';
            disabled = true;
            break;
                
        case 'insufficient_points':
            text = '포인트 부족';
            disabled = true;
            break;
        }

        downloadBtn.disabled = disabled;
        this.setElementText('download-btn-text', text);
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 모달 닫기 이벤트
        const closeBtn = document.getElementById('download-modal-close');
        const cancelBtn = document.getElementById('download-cancel-btn');
        const backdrop = document.getElementById('download-modal-backdrop');

        if (closeBtn) closeBtn.addEventListener('click', this.handleModalClose);
        if (cancelBtn) cancelBtn.addEventListener('click', this.handleCancel);
        if (backdrop) backdrop.addEventListener('click', this.handleBackdropClick);

        // 다운로드 버튼 이벤트
        const downloadBtn = document.getElementById('download-confirm-btn');
        if (downloadBtn) downloadBtn.addEventListener('click', this.handleDownload);

        // 포인트 충전 버튼 이벤트
        const chargeBtn = document.getElementById('download-charge-btn');
        if (chargeBtn) chargeBtn.addEventListener('click', this.handleCharge);

        // 약관 동의 체크박스 이벤트
        const termsCheckbox = document.getElementById('download-terms-agree');
        if (termsCheckbox) termsCheckbox.addEventListener('change', this.handleTermsChange);

        // ESC 키 이벤트
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.handleModalClose();
            }
        });
    }

    /**
     * 다운로드 처리
     */
    async handleDownload() {
        if (this.isDownloading) return;

        const config = this.currentConfig;
        if (!config) return;

        try {
            this.isDownloading = true;
            this.showProgress(0, '다운로드를 준비하고 있습니다...');
            
            // 다운로드 콜백 실행
            if (config.onDownload) {
                await config.onDownload(config.file, (progress, message) => {
                    this.updateProgress(progress, message);
                });
            }

            this.hideProgress();
            this.hide();
            
        } catch (error) {
            console.error('[DownloadModalLoader] 다운로드 실패:', error);
            this.hideProgress();
            this.showError('다운로드 중 오류가 발생했습니다.');
        } finally {
            this.isDownloading = false;
        }
    }

    /**
     * 취소 처리
     */
    handleCancel() {
        if (this.isDownloading) {
            if (!confirm('다운로드가 진행 중입니다. 정말 취소하시겠습니까?')) {
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
     * 포인트 충전 처리
     */
    handleCharge() {
        if (this.currentConfig && this.currentConfig.onCharge) {
            this.currentConfig.onCharge();
        }
    }

    /**
     * 약관 동의 체크 처리
     */
    handleTermsChange(e) {
        const config = this.currentConfig;
        if (!config) return;

        const downloadStatus = this.checkDownloadStatus(config.file, config.user);
        this.updateDownloadButton(downloadStatus);
    }

    /**
     * 모달 닫기 처리
     */
    handleModalClose() {
        this.handleCancel();
    }

    /**
     * 백드롭 클릭 처리
     */
    handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            this.handleCancel();
        }
    }

    /**
     * 진행률 표시
     */
    showProgress(progress, message = '') {
        const progressEl = document.getElementById('download-progress');
        const percentEl = document.getElementById('download-progress-percent');
        const fillEl = document.getElementById('download-progress-fill');
        const detailsEl = document.getElementById('download-progress-details');

        if (progressEl) progressEl.style.display = 'block';
        if (percentEl) percentEl.textContent = `${Math.round(progress)}%`;
        if (fillEl) fillEl.style.width = `${progress}%`;
        if (detailsEl && message) detailsEl.textContent = message;

        this.downloadProgress = progress;
    }

    /**
     * 진행률 업데이트
     */
    updateProgress(progress, message = '') {
        const percentEl = document.getElementById('download-progress-percent');
        const fillEl = document.getElementById('download-progress-fill');
        const detailsEl = document.getElementById('download-progress-details');

        if (percentEl) percentEl.textContent = `${Math.round(progress)}%`;
        if (fillEl) fillEl.style.width = `${progress}%`;
        if (detailsEl && message) detailsEl.textContent = message;

        this.downloadProgress = progress;
    }

    /**
     * 진행률 숨김
     */
    hideProgress() {
        const progressEl = document.getElementById('download-progress');
        if (progressEl) progressEl.style.display = 'none';
        this.downloadProgress = 0;
    }

    /**
     * 에러 메시지 표시
     */
    showError(message) {
        // 임시 토스트 메시지로 표시
        const toast = document.createElement('div');
        toast.className = 'download-error-toast';
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
        }
    }

    /**
     * 모달 가시성 확인
     */
    isVisible() {
        return this.modal && this.modal.classList.contains('show');
    }

    /**
     * 유틸리티 메서드들
     */
    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    showElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
        }
    }

    hideElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    }

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
            rar: 'fa-file-archive',
            jpg: 'fa-file-image',
            jpeg: 'fa-file-image',
            png: 'fa-file-image',
            gif: 'fa-file-image'
        };
        return iconMap[ext] || 'fa-file';
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
        this.downloadProgress = 0;
        this.isDownloading = false;
    }
}

// 전역 인스턴스 생성
window.DownloadModalLoader = DownloadModalLoader;

/**
 * 사용 예시:
 * 
 * const downloadModal = new DownloadModalLoader();
 * 
 * await downloadModal.load({
 *     file: {
 *         id: 'file123',
 *         name: '시장조사서_강남구_2024.pdf',
 *         size: '2.5 MB',
 *         type: 'PDF 문서',
 *         description: '강남구 아파트 시장조사 보고서',
 *         uploadDate: '2024.03.15',
 *         requiredPoints: 50,
 *         visibility: 'members'
 *     },
 *     uploader: {
 *         id: 'user456',
 *         name: '김실무자',
 *         avatar: 'path/to/avatar.jpg',
 *         badge: '실무자',
 *         stats: {
 *             uploads: 25,
 *             downloads: 150,
 *             rating: 4.8
 *         }
 *     },
 *     user: {
 *         points: 120,
 *         memberType: 'member',
 *         isPremium: true
 *     },
 *     onDownload: async (file, progressCallback) => {
 *         progressCallback(25, '서버에서 파일을 준비하고 있습니다...');
 *         await downloadFromSupabase(file.id);
 *         progressCallback(100, '다운로드 완료!');
 *     },
 *     onCancel: () => {
 *         console.log('다운로드 취소됨');
 *     },
 *     onCharge: () => {
 *         window.location.href = '/points-charge.html';
 *     }
 * });
 * 
 * downloadModal.show();
 */

export default DownloadModalLoader;