/**
 * WAVE SPACE - 시장조사서 페이지 Supabase 연동
 * 시장조사서 업로드, 관리 및 AI 분석 시스템
 */

import { supabase } from '../config/supabase.js';
import { authService } from '../services/authService.js';
import { fileService } from '../services/fileService.js';

class MarketResearchManager {
    constructor() {
        this.currentUser = null;
        this.researchFiles = [];
        this.currentFilter = 'all';
        this.currentSort = 'recent';
        this.selectedFiles = [];
        this.uploadProgress = {};
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            await authService.init();
            this.currentUser = await authService.getCurrentUser();
            
            if (this.currentUser) {
                await this.loadResearchFiles();
                await this.loadUserStats();
            }
            
            this.setupEventListeners();
            this.updateAuthUI();
            this.setupRealtimeSubscription();
        } catch (error) {
            console.error('시장조사서 페이지 초기화 오류:', error);
        }
    }

    setupEventListeners() {
        // 파일 업로드
        const uploadBtn = document.querySelector('.upload-btn');
        const fileInput = document.querySelector('#file-input, .file-upload-input');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
        }

        // 드래그 앤 드롭
        const dropZone = document.querySelector('.upload-zone, .drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('drop', (e) => this.handleFileDrop(e));
        }

        // 필터 및 정렬
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter || 'all';
                this.filterFiles(filter);
            });
        });

        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortFiles(e.target.value);
            });
        }

        // 검색
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchFiles(e.target.value);
                }
            });
        }
    }

    async updateAuthUI() {
        const userInfo = document.querySelector('.user-info, .upload-user-info');
        
        if (this.currentUser) {
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-profile">
                        <img src="${this.currentUser.profile_image_url || '/assets/default-avatar.png'}" 
                             alt="프로필" class="profile-avatar">
                        <div class="user-details">
                            <span class="username">${this.currentUser.username}</span>
                            <span class="user-points">${this.formatNumber(this.currentUser.points || 0)} P</span>
                        </div>
                    </div>
                `;
            }

            // 업로드 권한 확인
            this.checkUploadPermissions();
        } else {
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="login-required">
                        <p>시장조사서를 업로드하려면 로그인이 필요합니다.</p>
                        <a href="login.html" class="btn btn-primary">로그인</a>
                    </div>
                `;
            }
        }
    }

    async checkUploadPermissions() {
        if (!this.currentUser) return;

        try {
            // 사용자의 업로드 권한 및 할당량 확인
            const { data: permissions, error } = await supabase
                .from('user_upload_permissions')
                .select(`
                    max_file_size,
                    max_files_per_day,
                    allowed_file_types,
                    can_upload_ai_analysis
                `)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            this.uploadPermissions = permissions || {
                max_file_size: 10485760, // 10MB
                max_files_per_day: 5,
                allowed_file_types: ['pdf', 'doc', 'docx'],
                can_upload_ai_analysis: false
            };

            this.updateUploadUI();

        } catch (error) {
            console.error('업로드 권한 확인 오류:', error);
        }
    }

    updateUploadUI() {
        const uploadInfo = document.querySelector('.upload-info, .upload-limits');
        if (uploadInfo && this.uploadPermissions) {
            uploadInfo.innerHTML = `
                <div class="upload-limits">
                    <div class="limit-item">
                        <span class="limit-label">최대 파일 크기:</span>
                        <span class="limit-value">${this.formatFileSize(this.uploadPermissions.max_file_size)}</span>
                    </div>
                    <div class="limit-item">
                        <span class="limit-label">일일 업로드 제한:</span>
                        <span class="limit-value">${this.uploadPermissions.max_files_per_day}개</span>
                    </div>
                    <div class="limit-item">
                        <span class="limit-label">지원 형식:</span>
                        <span class="limit-value">${this.uploadPermissions.allowed_file_types.join(', ').toUpperCase()}</span>
                    </div>
                </div>
            `;
        }
    }

    async handleFileUpload(files) {
        if (!this.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!files || files.length === 0) return;

        for (const file of files) {
            if (!this.validateFile(file)) continue;
            
            try {
                await this.uploadFile(file);
            } catch (error) {
                console.error(`파일 업로드 오류 (${file.name}):`, error);
                this.showError(`${file.name} 업로드 실패`);
            }
        }
    }

    validateFile(file) {
        // 파일 크기 검증
        if (file.size > this.uploadPermissions.max_file_size) {
            this.showError(`파일 크기가 너무 큽니다. 최대 ${this.formatFileSize(this.uploadPermissions.max_file_size)}까지 지원됩니다.`);
            return false;
        }

        // 파일 형식 검증
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!this.uploadPermissions.allowed_file_types.includes(fileExtension)) {
            this.showError(`지원하지 않는 파일 형식입니다. ${this.uploadPermissions.allowed_file_types.join(', ').toUpperCase()} 파일만 업로드 가능합니다.`);
            return false;
        }

        return true;
    }

    async uploadFile(file) {
        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // 파일 업로드 진행률 표시
            this.showUploadProgress(fileId, file.name);

            // Supabase Storage에 파일 업로드
            const filePath = `market-research/${this.currentUser.id}/${fileId}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // 데이터베이스에 파일 정보 저장
            const { data: fileRecord, error: dbError } = await supabase
                .from('market_research_files')
                .insert({
                    id: fileId,
                    user_id: this.currentUser.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    file_type: file.type,
                    upload_status: 'completed',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // AI 분석 요청 (권한이 있는 경우)
            if (this.uploadPermissions.can_upload_ai_analysis) {
                this.requestAIAnalysis(fileId);
            }

            // 업로드 완료 처리
            this.hideUploadProgress(fileId);
            this.showSuccess(`${file.name} 업로드 완료!`);
            
            // 파일 목록 새로고침
            await this.loadResearchFiles();

        } catch (error) {
            this.hideUploadProgress(fileId);
            throw error;
        }
    }

    async requestAIAnalysis(fileId) {
        try {
            const { error } = await supabase
                .from('ai_analysis_queue')
                .insert({
                    file_id: fileId,
                    analysis_type: 'market_research',
                    priority: 'normal',
                    requested_at: new Date().toISOString()
                });

            if (error) throw error;

            this.showNotification('AI 분석이 요청되었습니다. 분석 완료 시 알림을 드립니다.');

        } catch (error) {
            console.error('AI 분석 요청 오류:', error);
        }
    }

    async loadResearchFiles() {
        if (!this.currentUser) return;

        try {
            this.isLoading = true;
            this.showLoading();

            let query = supabase
                .from('market_research_files')
                .select(`
                    id,
                    file_name,
                    file_path,
                    file_size,
                    file_type,
                    upload_status,
                    analysis_status,
                    analysis_summary,
                    download_count,
                    is_public,
                    created_at,
                    ai_analysis (
                        id,
                        analysis_result,
                        confidence_score,
                        key_insights
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (this.currentFilter !== 'all') {
                query = query.eq('analysis_status', this.currentFilter);
            }

            const { data: files, error } = await query;

            if (error) throw error;

            this.researchFiles = files || [];
            this.renderResearchFiles();

        } catch (error) {
            console.error('시장조사서 파일 로딩 오류:', error);
            this.showError('파일 목록을 불러올 수 없습니다.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderResearchFiles() {
        const container = document.querySelector('.file-list, .research-files');
        if (!container) return;

        if (this.researchFiles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-upload"></i>
                    <h3>업로드된 시장조사서가 없습니다</h3>
                    <p>시장조사서를 업로드하여 AI 분석을 받아보세요!</p>
                    ${this.currentUser ? '<button class="btn btn-primary upload-btn">파일 업로드</button>' : ''}
                </div>
            `;
            return;
        }

        const filesHTML = this.researchFiles.map(file => `
            <div class="file-item" data-file-id="${file.id}">
                <div class="file-icon">
                    ${this.getFileIcon(file.file_type)}
                </div>

                <div class="file-info">
                    <h3 class="file-name">${file.file_name}</h3>
                    <div class="file-meta">
                        <span class="file-size">${this.formatFileSize(file.file_size)}</span>
                        <span class="upload-date">${this.formatDate(file.created_at)}</span>
                        <span class="download-count">
                            <i class="fas fa-download"></i>
                            ${file.download_count || 0}
                        </span>
                    </div>
                </div>

                <div class="file-status">
                    <div class="upload-status ${file.upload_status}">
                        ${this.getUploadStatusLabel(file.upload_status)}
                    </div>
                    <div class="analysis-status ${file.analysis_status || 'pending'}">
                        ${this.getAnalysisStatusLabel(file.analysis_status)}
                    </div>
                </div>

                <div class="file-actions">
                    <button class="action-btn download-btn" onclick="marketResearchManager.downloadFile('${file.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    ${file.analysis_status === 'completed' ? `
                        <button class="action-btn analysis-btn" onclick="marketResearchManager.viewAnalysis('${file.id}')">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    ` : ''}
                    ${file.is_public ? `
                        <button class="action-btn share-btn" onclick="marketResearchManager.shareFile('${file.id}')">
                            <i class="fas fa-share"></i>
                        </button>
                    ` : ''}
                    <button class="action-btn delete-btn" onclick="marketResearchManager.deleteFile('${file.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                ${file.ai_analysis && file.ai_analysis.length > 0 ? `
                    <div class="analysis-preview">
                        <h4>AI 분석 요약</h4>
                        <p>${file.ai_analysis[0].key_insights?.slice(0, 3).join(', ') || '분석 완료'}</p>
                        <div class="confidence-score">
                            신뢰도: ${file.ai_analysis[0].confidence_score || 0}%
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = filesHTML;
    }

    showUploadProgress(fileId, fileName) {
        const progressHTML = `
            <div class="upload-progress" id="progress-${fileId}">
                <div class="progress-info">
                    <span class="file-name">${fileName}</span>
                    <span class="progress-status">업로드 중...</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;

        const progressContainer = document.querySelector('.upload-progress-container');
        if (progressContainer) {
            progressContainer.insertAdjacentHTML('beforeend', progressHTML);
        }
    }

    hideUploadProgress(fileId) {
        const progressEl = document.getElementById(`progress-${fileId}`);
        if (progressEl) {
            progressEl.remove();
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        
        const dropZone = e.currentTarget;
        dropZone.classList.add('drag-over');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = e.currentTarget;
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        this.handleFileUpload(files);
    }

    async downloadFile(fileId) {
        const file = this.researchFiles.find(f => f.id === fileId);
        if (!file) return;

        try {
            // 다운로드 카운트 증가
            await supabase.rpc('increment_download_count', {
                file_id: fileId
            });

            // Supabase Storage에서 파일 다운로드 URL 생성
            const { data: downloadData, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(file.file_path, 3600); // 1시간 유효

            if (error) throw error;

            // 다운로드 실행
            const link = document.createElement('a');
            link.href = downloadData.signedUrl;
            link.download = file.file_name;
            link.click();

            // 다운로드 카운트 UI 업데이트
            this.updateDownloadCount(fileId);

        } catch (error) {
            console.error('파일 다운로드 오류:', error);
            this.showError('파일 다운로드 중 오류가 발생했습니다.');
        }
    }

    async viewAnalysis(fileId) {
        const file = this.researchFiles.find(f => f.id === fileId);
        if (!file || !file.ai_analysis || file.ai_analysis.length === 0) return;

        const analysis = file.ai_analysis[0];
        
        const modalHTML = `
            <div class="analysis-modal" id="analysisModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>AI 분석 결과 - ${file.file_name}</h3>
                        <button class="modal-close" onclick="marketResearchManager.closeAnalysisModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="analysis-summary">
                            <div class="confidence-indicator">
                                <span class="confidence-label">분석 신뢰도</span>
                                <div class="confidence-bar">
                                    <div class="confidence-fill" style="width: ${analysis.confidence_score}%"></div>
                                </div>
                                <span class="confidence-value">${analysis.confidence_score}%</span>
                            </div>

                            <div class="key-insights">
                                <h4>핵심 인사이트</h4>
                                <ul>
                                    ${analysis.key_insights?.map(insight => `<li>${insight}</li>`).join('') || '<li>분석 결과가 없습니다.</li>'}
                                </ul>
                            </div>

                            <div class="analysis-details">
                                <h4>상세 분석</h4>
                                <div class="analysis-content">
                                    ${this.formatAnalysisResult(analysis.analysis_result)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="marketResearchManager.exportAnalysis('${fileId}')">
                            <i class="fas fa-download"></i> 분석 결과 내보내기
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('analysisModal').style.display = 'flex';
    }

    closeAnalysisModal() {
        const modal = document.getElementById('analysisModal');
        if (modal) {
            modal.remove();
        }
    }

    async deleteFile(fileId) {
        const file = this.researchFiles.find(f => f.id === fileId);
        if (!file) return;

        if (!confirm(`${file.file_name}을(를) 삭제하시겠습니까?`)) {
            return;
        }

        try {
            // Storage에서 파일 삭제
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([file.file_path]);

            if (storageError) throw storageError;

            // 데이터베이스에서 레코드 삭제
            const { error: dbError } = await supabase
                .from('market_research_files')
                .delete()
                .eq('id', fileId);

            if (dbError) throw dbError;

            // UI에서 제거
            this.researchFiles = this.researchFiles.filter(f => f.id !== fileId);
            this.renderResearchFiles();
            
            this.showSuccess('파일이 삭제되었습니다.');

        } catch (error) {
            console.error('파일 삭제 오류:', error);
            this.showError('파일 삭제 중 오류가 발생했습니다.');
        }
    }

    setupRealtimeSubscription() {
        if (!this.currentUser) return;

        // 실시간 파일 상태 업데이트
        const fileChannel = supabase
            .channel(`user-files-${this.currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'market_research_files',
                    filter: `user_id=eq.${this.currentUser.id}`
                },
                (payload) => {
                    console.log('파일 상태 업데이트:', payload);
                    this.handleFileUpdate(payload);
                }
            )
            .subscribe();

        // 실시간 AI 분석 완료 알림
        const analysisChannel = supabase
            .channel(`ai-analysis-${this.currentUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ai_analysis'
                },
                (payload) => {
                    console.log('AI 분석 완료:', payload.new);
                    this.handleAnalysisComplete(payload.new);
                }
            )
            .subscribe();
    }

    handleFileUpdate(payload) {
        if (payload.eventType === 'UPDATE') {
            const fileIndex = this.researchFiles.findIndex(f => f.id === payload.new.id);
            if (fileIndex !== -1) {
                this.researchFiles[fileIndex] = { ...this.researchFiles[fileIndex], ...payload.new };
                this.renderResearchFiles();
            }
        }
    }

    handleAnalysisComplete(analysis) {
        const fileId = analysis.file_id;
        const file = this.researchFiles.find(f => f.id === fileId);
        
        if (file) {
            this.showNotification(`${file.file_name}의 AI 분석이 완료되었습니다!`);
            this.loadResearchFiles(); // 목록 새로고침
        }
    }

    // 헬퍼 함수들
    getFileIcon(fileType) {
        const iconMap = {
            'application/pdf': '<i class="fas fa-file-pdf"></i>',
            'application/msword': '<i class="fas fa-file-word"></i>',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '<i class="fas fa-file-word"></i>',
            'application/vnd.ms-excel': '<i class="fas fa-file-excel"></i>',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '<i class="fas fa-file-excel"></i>'
        };
        return iconMap[fileType] || '<i class="fas fa-file"></i>';
    }

    getUploadStatusLabel(status) {
        const labels = {
            'uploading': '업로드 중',
            'completed': '업로드 완료',
            'failed': '업로드 실패'
        };
        return labels[status] || '알 수 없음';
    }

    getAnalysisStatusLabel(status) {
        const labels = {
            'pending': '분석 대기',
            'processing': '분석 중',
            'completed': '분석 완료',
            'failed': '분석 실패'
        };
        return labels[status] || '미분석';
    }

    formatFileSize(bytes) {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return bytes + ' bytes';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatAnalysisResult(result) {
        if (!result) return '분석 결과가 없습니다.';
        
        // JSON 형태의 분석 결과를 HTML로 변환
        if (typeof result === 'object') {
            return Object.entries(result)
                .map(([key, value]) => `<div class="analysis-item"><strong>${key}:</strong> ${value}</div>`)
                .join('');
        }
        
        return result;
    }

    showLoading() {
        const loadingEl = document.querySelector('.loading, .research-loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingEl = document.querySelector('.loading, .research-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showError(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'error');
        } else {
            alert(`오류: ${message}`);
        }
    }

    showSuccess(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'success');
        } else {
            alert(`성공: ${message}`);
        }
    }

    showNotification(message) {
        if (window.notificationService) {
            window.notificationService.showToast(message, 'info');
        }
    }
}

// 전역 인스턴스 생성
window.marketResearchManager = new MarketResearchManager();

// 기존 market-research.js와의 호환성을 위한 전역 함수들
window.downloadFile = (fileId) => window.marketResearchManager.downloadFile(fileId);
window.viewAnalysis = (fileId) => window.marketResearchManager.viewAnalysis(fileId);
window.deleteFile = (fileId) => window.marketResearchManager.deleteFile(fileId);
window.shareFile = (fileId) => window.marketResearchManager.shareFile(fileId);
window.filterFiles = (filter) => window.marketResearchManager.filterFiles(filter);
window.sortFiles = (sort) => window.marketResearchManager.sortFiles(sort);