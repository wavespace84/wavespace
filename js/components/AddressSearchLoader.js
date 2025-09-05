/**
 * AddressSearch 컴포넌트 로더
 * 카카오/네이버 주소 검색 API 통합 시스템
 */

class AddressSearchLoader {
    constructor() {
        this.isLoaded = false;
        this.currentConfig = null;
        this.container = null;
        this.selectedAddress = null;
        this.apiKey = null;
        this.apiProvider = 'kakao'; // 'kakao' 또는 'naver'
        
        // 이벤트 바인딩을 위한 컨텍스트 유지
        this.handleSearch = this.handleSearch.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleResultClick = this.handleResultClick.bind(this);
        this.handleClearSelection = this.handleClearSelection.bind(this);
        this.handleRetry = this.handleRetry.bind(this);
    }

    /**
     * AddressSearch 로드 및 초기화
     * @param {Object} config - 주소 검색 설정
     * @param {string} config.apiKey - API 키 (필수)
     * @param {string} config.provider - API 제공자 ('kakao' 또는 'naver')
     * @param {string} config.label - 라벨 텍스트
     * @param {string} config.placeholder - 플레이스홀더 텍스트
     * @param {boolean} config.showHelp - 도움말 표시 여부
     * @param {boolean} config.compact - 컴팩트 모드
     * @param {Function} config.onSelect - 주소 선택 콜백
     * @param {string} containerId - 컨테이너 ID
     * @returns {Promise<void>}
     */
    async load(config, containerId) {
        try {
            // 기본값 설정
            const defaultConfig = {
                provider: 'kakao',
                label: '주소 검색',
                placeholder: '도로명 주소나 지번 주소를 입력하세요',
                showHelp: true,
                compact: false,
                onSelect: null
            };

            config = { ...defaultConfig, ...config };

            // API 키 확인
            if (!config.apiKey) {
                console.error('[AddressSearchLoader] API 키가 필요합니다.');
                return;
            }

            this.apiKey = config.apiKey;
            this.apiProvider = config.provider;

            // 컨테이너 확인
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`[AddressSearchLoader] 컨테이너를 찾을 수 없습니다: ${containerId}`);
                return;
            }

            // CSS 로드
            await this.loadCSS();

            // 외부 API 스크립트 로드
            await this.loadAPIScript();

            // HTML 템플릿 로드
            const template = await this.loadTemplate();
            
            // 컨테이너에 템플릿 삽입
            this.container.innerHTML = template;

            // 주소 검색 설정 적용
            this.applyConfig(config);

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 설정 저장
            this.currentConfig = config;
            this.isLoaded = true;

            console.log(`✅ AddressSearch 로드 완료:`, config.provider);
            
        } catch (error) {
            console.error('[AddressSearchLoader] 로드 실패:', error);
        }
    }

    /**
     * CSS 파일 로드
     */
    async loadCSS() {
        const cssId = 'address-search-css';
        
        if (document.getElementById(cssId)) {
            return; // 이미 로드됨
        }

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'css/components/address-search.css?v=' + Date.now();
        document.head.appendChild(link);

        // CSS 로드 완료 대기
        await new Promise((resolve) => {
            link.onload = resolve;
            setTimeout(resolve, 100); // 타임아웃
        });
    }

    /**
     * 외부 API 스크립트 로드
     */
    async loadAPIScript() {
        const scriptId = `${this.apiProvider}-address-api`;
        
        if (document.getElementById(scriptId)) {
            return; // 이미 로드됨
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.id = scriptId;
            
            if (this.apiProvider === 'kakao') {
                script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            } else if (this.apiProvider === 'naver') {
                // 네이버 API는 서버사이드 호출이 필요하므로 클라이언트 측에서는 직접 호출하지 않음
                resolve();
                return;
            }

            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`${this.apiProvider} API 로드 실패`));
            
            document.head.appendChild(script);
        });
    }

    /**
     * HTML 템플릿 로드
     */
    async loadTemplate() {
        const response = await fetch('components/address-search.html?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`템플릿 로드 실패: ${response.status}`);
        }
        return await response.text();
    }

    /**
     * 주소 검색 설정 적용
     */
    applyConfig(config) {
        const addressSearch = document.getElementById('wave-address-search');
        if (addressSearch && config.compact) {
            addressSearch.classList.add('compact');
        }

        // 라벨 설정
        const label = document.getElementById('address-search-label');
        if (label && config.label) {
            label.textContent = config.label;
        }

        // 플레이스홀더 설정
        const input = document.getElementById('address-search-input');
        if (input && config.placeholder) {
            input.placeholder = config.placeholder;
        }

        // 도움말 표시
        const help = document.getElementById('address-search-help');
        if (help) {
            help.style.display = config.showHelp ? 'block' : 'none';
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 검색 버튼 클릭
        const searchBtn = document.getElementById('address-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', this.handleSearch);
        }

        // 입력 필드 엔터키
        const input = document.getElementById('address-search-input');
        if (input) {
            input.addEventListener('keypress', this.handleKeyPress);
        }

        // 선택 해제 버튼
        const clearBtn = document.getElementById('selected-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', this.handleClearSelection);
        }

        // 재시도 버튼
        const retryBtn = document.getElementById('error-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', this.handleRetry);
        }
    }

    /**
     * 검색 처리
     */
    async handleSearch() {
        const input = document.getElementById('address-search-input');
        if (!input) return;

        const query = input.value.trim();
        if (!query) {
            this.showError('검색어를 입력해주세요.');
            input.focus();
            return;
        }

        if (this.apiProvider === 'kakao') {
            this.searchWithKakao(query);
        } else if (this.apiProvider === 'naver') {
            await this.searchWithNaver(query);
        }
    }

    /**
     * 카카오 API 검색
     */
    searchWithKakao(query) {
        if (typeof daum === 'undefined') {
            this.showError('카카오 API가 로드되지 않았습니다.');
            return;
        }

        this.showLoading();

        new daum.Postcode({
            oncomplete: (data) => {
                this.hideLoading();
                this.displayKakaoResults([data]);
            },
            onclose: () => {
                this.hideLoading();
            },
            width: '100%',
            height: '400px'
        }).embed(document.getElementById('results-list'));

        this.showResults();
    }

    /**
     * 네이버 API 검색 (서버 API 호출)
     */
    async searchWithNaver(query) {
        this.showLoading();

        try {
            // 실제 프로젝트에서는 백엔드 API를 호출해야 합니다.
            const response = await fetch('/api/address/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                throw new Error('네이버 API 호출 실패');
            }

            const data = await response.json();
            this.hideLoading();
            this.displayNaverResults(data.results);
            
        } catch (error) {
            this.hideLoading();
            this.showError('주소 검색 중 오류가 발생했습니다.');
            console.error('네이버 API 호출 오류:', error);
        }
    }

    /**
     * 카카오 검색 결과 표시
     */
    displayKakaoResults(results) {
        if (!results || results.length === 0) {
            this.showError('검색 결과가 없습니다.');
            return;
        }

        const resultsList = document.getElementById('results-list');
        const resultsCount = document.getElementById('results-count');
        
        if (!resultsList || !resultsCount) return;

        resultsCount.textContent = `${results.length}건`;
        resultsList.innerHTML = '';

        results.forEach((item, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.setAttribute('tabindex', '0');
            resultItem.dataset.index = index;

            resultItem.innerHTML = `
                <div class="result-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="result-content">
                    <div class="result-main-address">${item.address}</div>
                    <div class="result-sub-address">${item.roadAddress || item.jibunAddress || ''}</div>
                    <div class="result-meta">
                        <span class="result-meta-item">우편번호: ${item.zonecode}</span>
                        ${item.buildingName ? `<span class="result-meta-item">${item.buildingName}</span>` : ''}
                    </div>
                </div>
            `;

            // 클릭 이벤트
            resultItem.addEventListener('click', () => {
                this.selectAddress({
                    address: item.address,
                    roadAddress: item.roadAddress,
                    jibunAddress: item.jibunAddress,
                    zonecode: item.zonecode,
                    buildingName: item.buildingName,
                    sido: item.sido,
                    sigungu: item.sigungu,
                    bname: item.bname
                });
            });

            // 키보드 이벤트
            resultItem.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    resultItem.click();
                }
            });

            resultsList.appendChild(resultItem);
        });

        this.showResults();
    }

    /**
     * 네이버 검색 결과 표시
     */
    displayNaverResults(results) {
        // 네이버 API 결과 처리 로직
        // 실제 구현 시 네이버 API 응답 형식에 맞게 조정
        this.displayKakaoResults(results);
    }

    /**
     * 주소 선택 처리
     */
    selectAddress(addressData) {
        this.selectedAddress = addressData;
        
        // 선택된 주소 표시
        const selectedAddress = document.getElementById('selected-main-address');
        if (selectedAddress) {
            selectedAddress.textContent = addressData.address;
        }

        // 숨겨진 데이터 저장
        const selectedData = document.getElementById('selected-address-data');
        if (selectedData) {
            selectedData.innerHTML = Object.keys(addressData).map(key => 
                `<input type="hidden" name="address_${key}" value="${this.escapeHtml(addressData[key])}">`
            ).join('');
        }

        // UI 상태 변경
        this.hideResults();
        this.hideError();
        this.showSelected();

        // 콜백 호출
        if (this.currentConfig && this.currentConfig.onSelect) {
            this.currentConfig.onSelect(addressData);
        }

        console.log('주소 선택됨:', addressData);
    }

    /**
     * 키보드 이벤트 처리
     */
    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleSearch();
        }
    }

    /**
     * 결과 클릭 처리
     */
    handleResultClick(e) {
        const resultItem = e.currentTarget;
        const index = resultItem.dataset.index;
        // 결과 항목 클릭 처리
    }

    /**
     * 선택 해제 처리
     */
    handleClearSelection() {
        this.selectedAddress = null;
        this.hideSelected();
        this.clearInput();
        
        // 입력 필드에 포커스
        const input = document.getElementById('address-search-input');
        if (input) {
            input.focus();
        }
    }

    /**
     * 재시도 처리
     */
    handleRetry() {
        this.hideError();
        this.handleSearch();
    }

    /**
     * UI 상태 관리 메서드들
     */
    showLoading() {
        this.hideResults();
        this.hideError();
        this.hideSelected();
        const loading = document.getElementById('address-search-loading');
        if (loading) loading.style.display = 'flex';
    }

    hideLoading() {
        const loading = document.getElementById('address-search-loading');
        if (loading) loading.style.display = 'none';
    }

    showResults() {
        const results = document.getElementById('address-search-results');
        if (results) results.style.display = 'block';
    }

    hideResults() {
        const results = document.getElementById('address-search-results');
        if (results) results.style.display = 'none';
    }

    showSelected() {
        const selected = document.getElementById('address-search-selected');
        if (selected) selected.style.display = 'block';
    }

    hideSelected() {
        const selected = document.getElementById('address-search-selected');
        if (selected) selected.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        this.hideResults();
        
        const error = document.getElementById('address-search-error');
        const errorMessage = document.getElementById('error-message');
        
        if (error) error.style.display = 'flex';
        if (errorMessage) errorMessage.textContent = message;
    }

    hideError() {
        const error = document.getElementById('address-search-error');
        if (error) error.style.display = 'none';
    }

    clearInput() {
        const input = document.getElementById('address-search-input');
        if (input) input.value = '';
    }

    /**
     * 선택된 주소 정보 반환
     */
    getSelectedAddress() {
        return this.selectedAddress;
    }

    /**
     * 상세주소 포함 전체 주소 반환
     */
    getFullAddress() {
        if (!this.selectedAddress) return null;

        const detailInput = document.getElementById('detail-address-input');
        const detailAddress = detailInput ? detailInput.value.trim() : '';

        return {
            ...this.selectedAddress,
            detailAddress,
            fullAddress: this.selectedAddress.address + (detailAddress ? ' ' + detailAddress : '')
        };
    }

    /**
     * HTML 이스케이프
     */
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
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isLoaded = false;
        this.currentConfig = null;
        this.selectedAddress = null;
    }
}

// 전역 인스턴스 생성
window.AddressSearchLoader = AddressSearchLoader;

/**
 * 사용 예시:
 * 
 * const addressSearch = new AddressSearchLoader();
 * 
 * await addressSearch.load({
 *     apiKey: 'your-api-key',
 *     provider: 'kakao',
 *     label: '사업장 주소 검색',
 *     onSelect: (addressData) => {
 *         console.log('선택된 주소:', addressData);
 *         // 폼 데이터에 주소 정보 설정
 *         document.getElementById('company_address').value = addressData.address;
 *         document.getElementById('company_zipcode').value = addressData.zonecode;
 *     }
 * }, 'address-search-container');
 * 
 * // 선택된 주소 정보 가져오기
 * const selected = addressSearch.getSelectedAddress();
 * const fullAddress = addressSearch.getFullAddress();
 */

export default AddressSearchLoader;