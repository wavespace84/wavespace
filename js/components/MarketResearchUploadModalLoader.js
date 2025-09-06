/**
 * WAVE SPACE - MarketResearchUploadModalLoader 
 * 시장조사서 전용 업로드 모달 컴포넌트
 */

class MarketResearchUploadModalLoader {
    constructor() {
        this.modalId = 'market-research-upload-modal';
        this.isLoaded = false;
        this.isInitialized = false;
        this.modal = null;
        this.overlay = null;
        
        // 상태
        this.selectedFiles = [];
        this.maxFiles = 2;
        this.selectedRegion1 = '';
        this.selectedRegion2 = '';
        this.selectedProductType = '';
        this.selectedSupplyType = '';
        
        // 시군구 데이터
        this.regionData = {
            seoul: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
            gyeonggi: ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시', '가평군', '양평군', '연천군'],
            incheon: ['계양구', '미추홀구', '남동구', '동구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
            busan: ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
            daegu: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
            gwangju: ['광산구', '남구', '동구', '북구', '서구'],
            daejeon: ['대덕구', '동구', '서구', '유성구', '중구'],
            ulsan: ['남구', '동구', '북구', '중구', '울주군'],
            sejong: ['세종특별자치시'],
            gangwon: ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
            chungbuk: ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
            chungnam: ['공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
            jeonbuk: ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
            jeonnam: ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
            gyeongbuk: ['경산시', '경주시', '고령군', '구미시', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
            gyeongnam: ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
            jeju: ['서귀포시', '제주시']
        };
        
        console.log('✅ MarketResearchUploadModalLoader 생성됨');
    }

    /**
     * 모달 로드
     */
    async load() {
        if (this.isLoaded) {
            console.log('MarketResearchUploadModalLoader: 이미 로드됨');
            return true;
        }

        try {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById(this.modalId);
            if (existingModal) {
                existingModal.remove();
            }

            // CSS 로드
            await this.loadCSS();
            
            // HTML 로드
            await this.loadHTML();
            
            // 초기화
            this.initialize();
            
            this.isLoaded = true;
            console.log('✅ MarketResearchUploadModalLoader 로드 완료');
            return true;

        } catch (error) {
            console.error('MarketResearchUploadModalLoader 로드 실패:', error);
            return false;
        }
    }

    /**
     * CSS 로드
     */
    async loadCSS() {
        return new Promise((resolve, reject) => {
            const existingLink = document.querySelector('link[href*="market-research-upload-modal.css"]');
            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/components/market-research-upload-modal.css?v=' + Date.now();
            link.onload = () => resolve();
            link.onerror = () => reject(new Error('CSS 로드 실패'));
            
            document.head.appendChild(link);
        });
    }

    /**
     * HTML 로드
     */
    async loadHTML() {
        try {
            const response = await fetch('components/market-research-upload-modal.html?v=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTML 로드 실패: ${response.status}`);
            }

            const html = await response.text();
            
            // body에 추가
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv.firstElementChild);

        } catch (error) {
            console.error('HTML 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 이벤트 초기화
     */
    initialize() {
        if (this.isInitialized) {
            console.log('MarketResearchUploadModalLoader: 이미 초기화됨');
            return;
        }

        this.modal = document.getElementById(this.modalId);
        this.overlay = document.getElementById('market-upload-overlay');

        if (!this.modal) {
            console.error('MarketResearchUploadModalLoader: 모달 요소를 찾을 수 없음');
            return;
        }

        // 이벤트 리스너 등록
        this.bindEvents();
        this.isInitialized = true;

        console.log('✅ MarketResearchUploadModalLoader 초기화 완료');
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 닫기 버튼
        const closeBtn = document.getElementById('market-upload-close');
        const cancelBtn = document.getElementById('market-upload-cancel');
        
        closeBtn?.addEventListener('click', () => this.hide());
        cancelBtn?.addEventListener('click', () => this.hide());
        this.overlay?.addEventListener('click', () => this.hide());

        // 파일 업로드 존
        const uploadZone = document.getElementById('market-upload-zone');
        const fileInput = document.getElementById('market-file-input');

        uploadZone?.addEventListener('click', () => fileInput?.click());
        fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));

        // 드래그 앤 드롭
        uploadZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadZone?.addEventListener('drop', (e) => this.handleFileDrop(e));

        // 지역 선택
        const region1 = document.getElementById('market-region1');
        const region2 = document.getElementById('market-region2');

        region1?.addEventListener('change', (e) => this.handleRegion1Change(e));
        region2?.addEventListener('change', (e) => this.handleRegion2Change(e));

        // 상품유형 버튼
        const productTypeButtons = document.querySelectorAll('.upload-product-types .upload-type-btn');
        productTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleProductTypeSelect(e));
        });

        // 공급유형 버튼
        const supplyTypeButtons = document.querySelectorAll('.upload-supply-types .upload-type-btn');
        supplyTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSupplyTypeSelect(e));
        });

        // 포인트 정보 토글
        const pointsToggle = document.getElementById('market-points-toggle');
        pointsToggle?.addEventListener('click', () => this.togglePointsDetails());

        // 업로드 제출
        const submitBtn = document.getElementById('market-upload-submit');
        submitBtn?.addEventListener('click', () => this.handleSubmit());

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('show')) {
                this.hide();
            }
        });
    }

    /**
     * 모달 표시
     */
    async show() {
        if (!this.isLoaded) {
            await this.load();
        }

        if (this.modal) {
            this.modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // 초기 상태 설정
            this.resetForm();
            
            console.log('MarketResearchUploadModalLoader: 모달 표시됨');
        }
    }

    /**
     * 모달 숨김
     */
    hide() {
        if (this.modal) {
            this.modal.classList.remove('show');
            document.body.style.overflow = '';
            
            console.log('MarketResearchUploadModalLoader: 모달 숨김');
        }
    }

    /**
     * 폼 초기화
     */
    resetForm() {
        // 파일 목록 초기화
        this.selectedFiles = [];
        const filesContainer = document.getElementById('market-files-container');
        if (filesContainer) {
            filesContainer.innerHTML = '';
            filesContainer.classList.remove('has-files');
        }

        // 지역 선택 초기화
        const region1 = document.getElementById('market-region1');
        const region2 = document.getElementById('market-region2');
        if (region1) region1.value = '';
        if (region2) {
            region2.innerHTML = '<option value="">시/군/구 선택</option>';
            region2.disabled = true;
        }

        // 타입 버튼 초기화
        document.querySelectorAll('.upload-type-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });

        // 상태 초기화
        this.selectedRegion1 = '';
        this.selectedRegion2 = '';
        this.selectedProductType = '';
        this.selectedSupplyType = '';

        // 제출 버튼 비활성화
        const submitBtn = document.getElementById('market-upload-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.display = 'none';
        }

        // 중복 검사 안내 숨김
        const duplicateInfo = document.getElementById('market-duplicate-check-info');
        if (duplicateInfo) {
            duplicateInfo.style.display = 'none';
        }
    }

    /**
     * 파일 선택 처리
     */
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    /**
     * 드래그 오버 처리
     */
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const uploadZone = document.getElementById('market-upload-zone');
        uploadZone?.classList.add('dragover');
    }

    /**
     * 드래그 리브 처리
     */
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        const uploadZone = document.getElementById('market-upload-zone');
        uploadZone?.classList.remove('dragover');
    }

    /**
     * 파일 드롭 처리
     */
    handleFileDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const uploadZone = document.getElementById('market-upload-zone');
        uploadZone?.classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        this.processFiles(files);
    }

    /**
     * 파일 처리
     */
    processFiles(files) {
        // 파일 수 체크
        if (this.selectedFiles.length + files.length > this.maxFiles) {
            alert(`최대 ${this.maxFiles}개의 파일만 업로드할 수 있습니다.`);
            return;
        }

        // 파일 검증 및 추가
        files.forEach(file => {
            if (this.validateFile(file)) {
                this.selectedFiles.push(file);
                this.addFileToList(file);
            }
        });

        this.updateFormState();
    }

    /**
     * 파일 검증
     */
    validateFile(file) {
        // 파일 타입 체크
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('지원하지 않는 파일 형식입니다. PDF, DOC, PPT, XLS 파일만 업로드 가능합니다.');
            return false;
        }

        // 파일 크기 체크 (50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('파일 크기가 50MB를 초과합니다.');
            return false;
        }

        return true;
    }

    /**
     * 파일 목록에 추가
     */
    addFileToList(file) {
        const filesContainer = document.getElementById('market-files-container');
        if (!filesContainer) return;

        const fileElement = document.createElement('div');
        fileElement.className = 'upload-file-item';
        fileElement.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size)}</div>
            </div>
            <button type="button" class="file-remove-btn" onclick="marketResearchUploadModal.removeFile('${file.name}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        filesContainer.appendChild(fileElement);
        filesContainer.classList.add('has-files');
    }

    /**
     * 파일 크기 포맷
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 파일 제거
     */
    removeFile(fileName) {
        this.selectedFiles = this.selectedFiles.filter(file => file.name !== fileName);
        
        const filesContainer = document.getElementById('market-files-container');
        if (filesContainer) {
            const fileElements = filesContainer.querySelectorAll('.upload-file-item');
            fileElements.forEach(element => {
                const nameElement = element.querySelector('.file-name');
                if (nameElement && nameElement.textContent === fileName) {
                    element.remove();
                }
            });

            if (this.selectedFiles.length === 0) {
                filesContainer.classList.remove('has-files');
            }
        }

        this.updateFormState();
    }

    /**
     * 지역1 변경 처리
     */
    handleRegion1Change(event) {
        const region1Value = event.target.value;
        const region2 = document.getElementById('market-region2');
        
        this.selectedRegion1 = region1Value;
        this.selectedRegion2 = '';

        if (region1Value && this.regionData[region1Value]) {
            // 시군구 옵션 업데이트
            const options = '<option value="">시/군/구 선택</option>' + 
                           this.regionData[region1Value].map(city => 
                               `<option value="${city}">${city}</option>`
                           ).join('');
            
            region2.innerHTML = options;
            region2.disabled = false;
        } else {
            region2.innerHTML = '<option value="">시/군/구 선택</option>';
            region2.disabled = true;
        }

        this.updateFormState();
    }

    /**
     * 지역2 변경 처리
     */
    handleRegion2Change(event) {
        this.selectedRegion2 = event.target.value;
        this.updateFormState();
    }

    /**
     * 상품유형 선택 처리
     */
    handleProductTypeSelect(event) {
        const button = event.currentTarget;
        const productType = button.getAttribute('data-type');
        
        // 기존 선택 해제
        document.querySelectorAll('.upload-product-types .upload-type-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });

        // 새 선택 적용
        button.classList.add('selected');
        this.selectedProductType = productType;

        this.updateFormState();
    }

    /**
     * 공급유형 선택 처리
     */
    handleSupplyTypeSelect(event) {
        const button = event.currentTarget;
        const supplyType = button.getAttribute('data-type');
        
        // 기존 선택 해제
        document.querySelectorAll('.upload-supply-types .upload-type-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });

        // 새 선택 적용
        button.classList.add('selected');
        this.selectedSupplyType = supplyType;

        this.updateFormState();
    }

    /**
     * 포인트 상세 정보 토글
     */
    togglePointsDetails() {
        const details = document.getElementById('market-points-details');
        const toggle = document.getElementById('market-points-toggle');
        const icon = toggle?.querySelector('i');

        if (details && toggle) {
            const isVisible = details.style.display !== 'none';
            
            if (isVisible) {
                details.style.display = 'none';
                toggle.querySelector('span').textContent = '자세히보기';
                icon?.classList.remove('fa-chevron-up');
                icon?.classList.add('fa-chevron-down');
                toggle.classList.remove('active');
            } else {
                details.style.display = 'block';
                toggle.querySelector('span').textContent = '간단히보기';
                icon?.classList.remove('fa-chevron-down');
                icon?.classList.add('fa-chevron-up');
                toggle.classList.add('active');
            }
        }
    }

    /**
     * 폼 상태 업데이트
     */
    updateFormState() {
        const submitBtn = document.getElementById('market-upload-submit');
        
        // 필수 항목 체크
        const hasFiles = this.selectedFiles.length > 0;
        const hasRegion = this.selectedRegion1 && this.selectedRegion2;
        const hasProductType = this.selectedProductType;
        const hasSupplyType = this.selectedSupplyType;

        const isValid = hasFiles && hasRegion && hasProductType && hasSupplyType;

        if (submitBtn) {
            submitBtn.disabled = !isValid;
            submitBtn.style.display = isValid ? 'block' : 'none';
        }
    }

    /**
     * 제출 처리
     */
    async handleSubmit() {
        try {
            // 로딩 상태
            const submitBtn = document.getElementById('market-upload-submit');
            const btnText = document.getElementById('market-upload-btn-text');
            
            if (submitBtn && btnText) {
                submitBtn.disabled = true;
                btnText.textContent = '업로드 중...';
            }

            // 업로드 처리 (실제 구현은 기존 로직 사용)
            const formData = {
                files: this.selectedFiles,
                region1: this.selectedRegion1,
                region2: this.selectedRegion2,
                productType: this.selectedProductType,
                supplyType: this.selectedSupplyType
            };

            console.log('업로드 데이터:', formData);
            
            // 기존의 market-research.js의 업로드 함수 호출
            if (window.submitMarketResearchUpload) {
                await window.submitMarketResearchUpload(formData);
            } else {
                console.warn('업로드 함수를 찾을 수 없습니다.');
                alert('업로드 기능이 준비되지 않았습니다.');
            }

            // 성공 시 모달 닫기
            this.hide();

        } catch (error) {
            console.error('업로드 오류:', error);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            // 로딩 상태 해제
            const submitBtn = document.getElementById('market-upload-submit');
            const btnText = document.getElementById('market-upload-btn-text');
            
            if (submitBtn && btnText) {
                submitBtn.disabled = false;
                btnText.textContent = '업로드 완료';
            }
        }
    }

    /**
     * 정리
     */
    destroy() {
        if (this.modal) {
            this.modal.remove();
        }
        
        // CSS 제거
        const cssLink = document.querySelector('link[href*="market-research-upload-modal.css"]');
        if (cssLink) {
            cssLink.remove();
        }

        this.isLoaded = false;
        this.isInitialized = false;
        
        console.log('✅ MarketResearchUploadModalLoader 정리됨');
    }
}

// 전역 인스턴스 생성
window.marketResearchUploadModal = new MarketResearchUploadModalLoader();

export default MarketResearchUploadModalLoader;