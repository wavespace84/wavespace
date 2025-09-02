// 시장조사서 페이지 JavaScript - PRD 요구사항 완전 구현

// 공통 데이터는 js/modules/common-data.js에서 로드됨
// 사용 방법: window.WaveSpaceData.regionData, window.WaveSpaceData.regionNames 등

// ===========================================
// Supabase 연동 모듈 초기화
// ===========================================

let marketResearchSupabase = null;
let isInitialized = false; // 중복 초기화 방지 플래그
let pointService = null; // 포인트 서비스 인스턴스

// Supabase 모듈 초기화 (레거시 - initializeSupabaseData에서 통합 처리)
// 이 함수는 더 이상 사용되지 않음
async function initMarketResearchSupabase() {
    console.warn('⚠️ initMarketResearchSupabase는 더 이상 사용되지 않습니다. initializeSupabaseData를 사용하세요.');
    return false;
}

// Supabase에서 문서 목록 로드
async function loadDocumentsFromSupabase() {
    try {
        if (!marketResearchSupabase) return;
        
        // fetchDocuments 메서드 호출 (getDocuments는 이제 fetchDocuments를 호출함)
        const documents = await marketResearchSupabase.fetchDocuments({
            limit: 100, // 충분한 수의 문서 로드
            sortBy: 'latest'
        });
        
        if (documents && documents.length > 0) {
            // Supabase 데이터를 우선하여 설정 (기존 Mock 데이터와 병합하지 않음)
            currentDocuments = documents;
            console.log(`📄 Supabase에서 ${documents.length}개 문서 로드 완료`);
        }
    } catch (error) {
        console.error('❌ Supabase 문서 로드 실패:', error);
        console.warn('💡 Mock 데이터로 대체하여 실행합니다.');
    }
}

// debounce 유틸리티 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 페이지 수 기반 포인트 계산 함수
function calculatePointsByPages(pages, daysDiff, isUpload = false) {
    const basePoints = isUpload ? 3000 : 7000;
    
    // 페이지 지수 계산
    let pageMultiplier = 1.0;
    if (pages >= 40) {
        pageMultiplier = 1.2; // 120%
    } else if (pages >= 30) {
        pageMultiplier = 1.1; // 110%
    } else if (pages >= 20) {
        pageMultiplier = 1.0; // 100%
    } else if (pages >= 10) {
        pageMultiplier = 0.9; // 90%
    } else {
        pageMultiplier = 0.6; // 60%
    }
    
    // 최신성 지수 계산 (기존과 동일)
    let freshnessMultiplier = 1.0;
    if (daysDiff <= 180) { // 6개월 이내
        freshnessMultiplier = 1.2; // 120%
    } else if (daysDiff <= 365) { // 1년 이내
        freshnessMultiplier = 1.0; // 100%
    } else if (daysDiff <= 730) { // 2년 이내
        freshnessMultiplier = 0.7; // 70%
    } else {
        return 0; // 2년 초과는 업로드 불가
    }
    
    return Math.round(basePoints * pageMultiplier * freshnessMultiplier);
}

// PDF 파일에서 페이지 수 추출 함수
async function extractPageCount(file) {
    if (file.type === 'application/pdf') {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            return pdf.numPages;
        } catch (error) {
            console.warn('PDF 페이지 수 추출 실패:', error);
            return null;
        }
    }
    // PDF가 아닌 경우 기본값 반환
    return null;
}

// 미리보기 모달 관련 전역 변수
let currentDocIndex = 0;
let currentFilteredDocs = [];

// 상품 유형 정의
const productTypes = [
    { id: 'apartment', name: '아파트', color: '#3b82f6' },
    { id: 'officetel-residential', name: '주거형OT', color: '#10b981' },
    { id: 'officetel-profit', name: '수익형OT', color: '#8b5cf6' },
    { id: 'urban', name: '도생', color: '#22c55e' },
    { id: 'commercial', name: '상가', color: '#ef4444' },
    { id: 'lifestyle-lodge', name: '생활형숙박시설', color: '#a855f7' },
    { id: 'knowledge', name: '지식산업센터', color: '#06b6d4' },
    { id: 'office', name: '오피스', color: '#f59e0b' },
    { id: 'other', name: '기타', color: '#6b7280' }
];

// 업로드된 파일을 관리하는 변수
let uploadedFile = null;

// Mock 데이터 제거 완료 - 이제 Supabase 데이터만 사용

// 전역 상태 관리
let currentFilters = {
    type: 'all',
    region: 'all',
    currentRegion: 'all', // 현재 선택된 광역시도
    selectedRegions: [], // 선택된 지역들 (문자열 배열로 변경)
    keyword: '',
    productType: 'all',
    supplyType: 'all',
};

// 실제 사용자 데이터 (AuthService 연동)
let userData = null;

/**
 * 현재 로그인된 사용자 정보를 AuthService에서 가져오기
 */
async function loadCurrentUser() {
    try {
        if (!window.authService) {
            console.warn('⚠️ AuthService가 초기화되지 않았습니다.');
            userData = null;
            return null;
        }
        
        const isLoggedIn = authService.isLoggedIn();
        if (!isLoggedIn) {
            console.log('🔓 로그인되지 않은 상태');
            userData = null;
            return null;
        }
        
        const user = authService.getCurrentUser();
        const profile = authService.getUserProfile();
        
        if (!user) {
            console.warn('⚠️ 사용자 정보를 가져올 수 없습니다.');
            userData = null;
            return null;
        }
        
        userData = {
            id: user.id,
            name: profile?.nickname || profile?.full_name || user.email?.split('@')[0] || '사용자',
            email: user.email,
            isLoggedIn: true,
            points: profile?.points || 0,
            role: profile?.role || 'user'
        };
        
        console.log('✅ 사용자 정보 로드 완료:', userData);
        return userData;
        
    } catch (error) {
        console.error('❌ 사용자 정보 로드 실패:', error);
        userData = null;
        return null;
    }
}

// ===========================================
// 필터 초기화 및 관리
// ===========================================

function initializeFilters() {
    console.log('Initializing filters...');

    // 지역 선택 이벤트 초기화 - nav-selector 사용
    const regionSelectors = document.querySelectorAll('.region-filter .nav-selector');
    console.log('Initializing region selectors:', regionSelectors.length);

    regionSelectors.forEach((selector) => {
        selector.addEventListener('click', function () {
            console.log('Region selector clicked:', this.dataset.value);
            const value = this.dataset.value;

            // 기존 선택 제거
            this.parentElement.querySelectorAll('.nav-selector').forEach((s) => {
                s.classList.remove('selected');
            });

            // 현재 선택 추가
            this.classList.add('selected');

            // 지역 변경 처리
            handleRegionChange(value, this);
        });
    });

    // 상품 유형 필터 초기화
    const productTypeFilters = document.querySelectorAll('#productTypeFilters .checkbox-tab');
    productTypeFilters.forEach((tab) => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            const type = this.dataset.type;

            // 라디오 버튼 체크
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            // 활성 상태 업데이트
            productTypeFilters.forEach((t) => t.classList.remove('active'));
            this.classList.add('active');

            // 필터 적용
            currentFilters.productType = type;
            applyFilters();
        });
    });

    // 공급 유형 필터 초기화
    const supplyTypeFilters = document.querySelectorAll('#supplyTypeFilters .checkbox-tab');
    supplyTypeFilters.forEach((tab) => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            const type = this.dataset.type;

            // 라디오 버튼 체크
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            // 활성 상태 업데이트
            supplyTypeFilters.forEach((t) => t.classList.remove('active'));
            this.classList.add('active');

            // 필터 적용
            currentFilters.supplyType = type;
            applyFilters();
        });
    });

    // 키워드 검색
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        console.log('검색 입력 필드 찾음:', searchInput);
        searchInput.addEventListener(
            'input',
            debounce(function () {
                console.log('검색어 입력:', this.value);
                currentFilters.keyword = this.value;
                applyFilters();
            }, 300)
        );
    } else {
        console.error('검색 입력 필드를 찾을 수 없음');
    }

    // 정렬 버튼
    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach((btn) => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            sortBtns.forEach((b) => b.classList.remove('active'));
            this.classList.add('active');

            const sortBy = this.dataset.sort;
            const sortedDocuments = sortDocuments(filterDocuments(), sortBy);
            renderDocuments(sortedDocuments);
        });
    });
}

// 광역시도 선택 처리 (nav-selector 방식) - planning-recruitment.js와 동일
function handleRegionChange(value, selectedElement) {
    const subRegionRow = document.getElementById('subRegionRow');
    const subRegionFilters = document.getElementById('subRegionFilters');

    if (!subRegionRow || !subRegionFilters) return;

    // 현재 선택된 광역시도 저장
    currentFilters.currentRegion = value;

    // 광역시도 nav-selector active 상태 업데이트
    document.querySelectorAll('.nav-selector').forEach((btn) => {
        btn.classList.remove('active');
    });
    selectedElement.classList.add('active');

    if (value === 'all') {
        // '전체' 선택 시 모든 지역 선택 해제
        currentFilters.selectedRegions = [];
        subRegionRow.style.display = 'none';
        updateSelectedRegionsDisplay();
        applyFilters();
        return;
    }

    // 선택된 광역시도에 해당하는 하위 지역 가져오기
    const subRegions = window.WaveSpaceData?.regionData?.[value] || [];

    if (subRegions && subRegions.length > 0) {
        subRegionRow.style.display = 'block';

        // 하위 지역 checkbox-tab 생성 (중복 선택 가능)
        let subRegionHTML = `
            <label class="checkbox-tab" data-value="all" data-parent="${value}">
                <input type="checkbox" name="subregion-all" value="all">
                <span class="tab-check"></span>
                <span>전체</span>
            </label>
        `;

        subRegions.forEach((subRegion) => {
            subRegionHTML += `
                <label class="checkbox-tab" data-value="${subRegion}" data-parent="${value}">
                    <input type="checkbox" name="subregion-${value}" value="${subRegion}">
                    <span class="tab-check"></span>
                    <span>${subRegion}</span>
                </label>
            `;
        });

        subRegionFilters.innerHTML = subRegionHTML;
        subRegionFilters.className = 'checkbox-tabs sub-region-tabs compact';

        // 새로 생성된 checkbox-tab에 이벤트 리스너 추가 (중복 선택 가능)
        const newTabs = subRegionFilters.querySelectorAll('.checkbox-tab');
        newTabs.forEach((tab) => {
            tab.addEventListener('click', function () {
                const checkbox = this.querySelector('input[type="checkbox"]');
                const subValue = checkbox.value;
                const parent = this.dataset.parent;

                // 체크박스 토글
                checkbox.checked = !checkbox.checked;

                // active 클래스 토글
                this.classList.toggle('active', checkbox.checked);

                handleSubRegionChange(subValue, parent, this);
            });
        });

        // 기존 선택된 지역 중 현재 광역시도가 아닌 것들은 유지하고,
        // 현재 광역시도의 선택만 초기화
        const currentRegionDisplayName = getRegionDisplayName(value);
        currentFilters.selectedRegions = currentFilters.selectedRegions.filter((region) => {
            const parts = region.split(' ');
            return parts[0] !== currentRegionDisplayName;
        });

        updateSelectedRegionsDisplay();
    } else {
        subRegionRow.style.display = 'none';
    }

    applyFilters();
}

// 지역 표시 이름 가져오기
function getRegionDisplayName(regionCode) {
    const regionMap = {
        seoul: '서울',
        gyeonggi: '경기',
        incheon: '인천',
        busan: '부산',
        daegu: '대구',
        gwangju: '광주',
        daejeon: '대전',
        ulsan: '울산',
        sejong: '세종',
        gangwon: '강원',
        chungbuk: '충북',
        chungnam: '충남',
        jeonbuk: '전북',
        jeonnam: '전남',
        gyeongbuk: '경북',
        gyeongnam: '경남',
        jeju: '제주',
    };
    return regionMap[regionCode] || regionCode;
}

// 하위 지역 선택 처리 (checkbox 중복 선택 방식)
function handleSubRegionChange(value, parent, selectedElement) {
    const parentDisplayName = getRegionDisplayName(parent);
    const checkbox = selectedElement.querySelector('input[type="checkbox"]');

    console.log('handleSubRegionChange:', {
        value,
        parent,
        parentDisplayName,
        checked: checkbox.checked,
    });

    if (value === 'all') {
        if (checkbox.checked) {
            // '전체' 체크 시 - 해당 부모의 모든 개별 지역 해제하고 "전체"만 추가
            currentFilters.selectedRegions = currentFilters.selectedRegions.filter((region) => {
                return !region.startsWith(parentDisplayName);
            });
            currentFilters.selectedRegions.push(`${parentDisplayName} 전체`);

            // 같은 부모의 모든 개별 지역 체크박스 해제
            document
                .querySelectorAll(`[data-parent="${parent}"] input[type="checkbox"]`)
                .forEach((cb) => {
                    if (cb.value !== 'all') {
                        cb.checked = false;
                        cb.parentElement.classList.remove('active');
                    }
                });

            console.log('Selected 전체 for:', parentDisplayName);
        } else {
            // '전체' 해제 시
            currentFilters.selectedRegions = currentFilters.selectedRegions.filter((region) => {
                return region !== `${parentDisplayName} 전체`;
            });
            console.log('Unselected 전체 for:', parentDisplayName);
        }
    } else {
        const regionKey = `${parentDisplayName} ${value}`;

        if (checkbox.checked) {
            // 개별 지역 체크 시
            // '전체' 체크 해제
            const allCheckbox = document.querySelector(
                `[data-parent="${parent}"][data-value="all"] input[type="checkbox"]`
            );
            if (allCheckbox && allCheckbox.checked) {
                allCheckbox.checked = false;
                allCheckbox.parentElement.classList.remove('active');
                currentFilters.selectedRegions = currentFilters.selectedRegions.filter((region) => {
                    return region !== `${parentDisplayName} 전체`;
                });
            }

            // 개별 지역 추가
            if (!currentFilters.selectedRegions.includes(regionKey)) {
                currentFilters.selectedRegions.push(regionKey);
            }
            console.log('Added region:', regionKey);
        } else {
            // 개별 지역 해제 시
            currentFilters.selectedRegions = currentFilters.selectedRegions.filter((region) => {
                return region !== regionKey;
            });
            console.log('Removed region:', regionKey);
        }
    }

    updateSelectedRegionsDisplay();
    applyFilters();
}

// 선택된 지역 표시 업데이트
function updateSelectedRegionsDisplay() {
    const selectedRegionsContainer = document.getElementById('selectedRegions');
    const selectedTags = document.getElementById('selectedTags');

    if (!selectedRegionsContainer || !selectedTags) return;

    if (currentFilters.selectedRegions.length === 0) {
        // 선택된 지역이 없으면 숨김
        selectedRegionsContainer.style.display = 'none';
        selectedTags.innerHTML = '';
    } else {
        // 선택된 지역이 있으면 표시
        selectedRegionsContainer.style.display = 'flex';

        // 태그 생성
        selectedTags.innerHTML = currentFilters.selectedRegions
            .map((region) => {
                return `
                <span class="region-tag">
                    ${region}
                    <button class="tag-remove" data-region="${region}" title="제거">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `;
            })
            .join('');

        // 제거 버튼 이벤트 추가
        selectedTags.querySelectorAll('.tag-remove').forEach((btn) => {
            btn.addEventListener('click', function () {
                const regionToRemove = this.dataset.region;
                currentFilters.selectedRegions = currentFilters.selectedRegions.filter(
                    (r) => r !== regionToRemove
                );

                // 해당 체크박스 해제
                const parts = regionToRemove.split(' ');
                if (parts.length === 2) {
                    const checkboxes = document.querySelectorAll('#subRegionFilters .checkbox-tab');
                    checkboxes.forEach((cb) => {
                        if (
                            cb.textContent.trim() === parts[1] ||
                            cb.textContent.trim() === '전체'
                        ) {
                            const input = cb.querySelector('input[type="checkbox"]');
                            if (input && cb.textContent.trim() === parts[1]) {
                                input.checked = false;
                                cb.classList.remove('active');
                            }
                        }
                    });
                }

                updateSelectedRegionsDisplay();
                applyFilters();
            });
        });
    }
}

// 필터 변경 처리
function handleFilterChange() {
    // 키워드는 별도로 처리되므로 여기서는 제외
    applyFilters();
}

// 필터 적용
function applyFilters() {
    console.log('필터 적용 중, currentFilters:', currentFilters);
    applyFiltersAndSearch();
}

// 문서 필터링 (기존 함수 - 호환성을 위해 유지)
function filterDocuments() {
    // 새로운 필터링 함수 사용
    return getFilteredDocuments();
}

// 페이지네이션 관련 변수
let currentPage = 1;
const itemsPerPage = 14; // 한 페이지에 14개 문서 표시

// 문서 렌더링
function renderDocuments(documents) {
    const grid = document.getElementById('documentGrid');
    if (!grid) return;

    if (documents.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>검색 결과가 없습니다</p>
                <span>다른 검색 조건으로 시도해보세요</span>
            </div>
        `;
        updatePagination(0, 0);
        return;
    }

    // 페이지네이션 적용
    const totalPages = Math.ceil(documents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocuments = documents.slice(startIndex, endIndex);

    grid.innerHTML = paginatedDocuments
        .map((doc) => {
            const productType = productTypes.find((t) => t.id === doc.type) || {
                name: '기타',
                color: '#6b7280',
            };
            return `
            <div class="document-card" data-id="${doc.id}" onclick="openPreview(${doc.id})" style="--hover-border-color: ${productType.color};" onmouseover="this.style.borderColor='${productType.color}50'" onmouseout="this.style.borderColor='transparent'">
                <div class="document-info">
                    <div class="document-type-box" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 5px 12px 5px 10px;
                        background: ${productType.color}15;
                        border-left: 3px solid ${productType.color};
                        border-radius: 6px;
                        margin-bottom: 10px;
                    ">
                        <span style="color: ${productType.color}; font-size: 12px; font-weight: 600;">
                            ${productType.name}
                        </span>
                        <span style="color: ${productType.color}66;">·</span>
                        <span style="color: ${productType.color}cc; font-size: 12px; font-weight: 500;">
                            ${doc.supplyType || '민간분양'}
                        </span>
                    </div>
                    <h3 class="document-title">${doc.title}</h3>
                    <div class="document-meta-info" style="display: flex; gap: 12px; margin: 2px 0 8px 0;">
                        <span style="color: #9ca3af; font-size: 11px;">
                            <i class="fas ${doc.fileType === 'PDF' ? 'fa-file-pdf' : 'fa-file-powerpoint'}" style="font-size: 10px; margin-right: 4px;"></i>
                            ${doc.fileType}
                        </span>
                        <span style="color: #9ca3af; font-size: 11px;">
                            <i class="fas fa-file-alt" style="font-size: 10px; margin-right: 4px;"></i>
                            ${doc.fileSize} • ${doc.pages || 0}페이지
                        </span>
                        <span style="color: #9ca3af; font-size: 11px;">
                            <i class="fas fa-calendar-alt" style="font-size: 10px; margin-right: 4px;"></i>
                            ${doc.date || '2024.01.15'}
                        </span>
                    </div>
                    <div class="document-footer">
                        <div class="points-badge">
                            <i class="fas fa-coins"></i>
                            <span>${doc.points.toLocaleString('ko-KR')}P</span>
                        </div>
                        <div class="document-actions" style="display: flex; gap: 4px;">
                            <button class="btn-action-mini" onclick="event.stopPropagation(); addToCart(${doc.id})" title="장바구니 담기" style="
                                width: 28px;
                                height: 28px;
                                border-radius: 6px;
                                border: none;
                                background: #fafbfc;
                                color: #cbd5e1;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                transition: all 0.2s ease;
                            " onmouseover="this.style.background='${productType.color}'; this.style.color='white'" onmouseout="this.style.background='#fafbfc'; this.style.color='#cbd5e1'">
                                <i class="fas fa-shopping-cart" style="font-size: 12px;"></i>
                            </button>
                            <button class="btn-action-mini" onclick="event.stopPropagation(); handleDirectDownload(${doc.id}, ${doc.points})" title="다운로드" style="
                                width: 28px;
                                height: 28px;
                                border-radius: 6px;
                                border: none;
                                background: #fafbfc;
                                color: #cbd5e1;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                transition: all 0.2s ease;
                            " onmouseover="this.style.background='${productType.color}'; this.style.color='white'" onmouseout="this.style.background='#fafbfc'; this.style.color='#cbd5e1'">
                                <i class="fas fa-download" style="font-size: 12px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        })
        .join('');

    // 장바구니 버튼 이벤트
    grid.querySelectorAll('.btn-cart').forEach((btn) => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const docId = this.dataset.id;
            handleAddToCart(docId);
        });
    });

    // 다운로드 버튼 이벤트
    grid.querySelectorAll('.btn-download').forEach((btn) => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const docId = this.dataset.id;
            const points = parseInt(this.dataset.points);
            handleDirectDownload(docId, points);
        });
    });

    // 자세히보기 버튼 이벤트
    grid.querySelectorAll('.btn-detail').forEach((btn) => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const docId = this.dataset.id;
            // 전역 openPreview 함수 호출
            if (typeof window.openPreview === 'function') {
                window.openPreview(docId);
            } else {
                console.error('openPreview 함수를 찾을 수 없습니다');
            }
        });
    });

    // 페이지네이션 업데이트
    updatePagination(documents.length, totalPages);
}

// 페이지네이션 업데이트 함수
function updatePagination(totalItems, totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    // 페이지가 1개 이하면 페이지네이션 숨기기
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    pagination.innerHTML = '';

    // 처음 버튼
    const firstLink = document.createElement('a');
    firstLink.href = '#';
    firstLink.textContent = '처음';
    if (currentPage === 1) {
        firstLink.className = 'disabled';
    }
    firstLink.onclick = (e) => {
        e.preventDefault();
        if (currentPage !== 1) {
            currentPage = 1;
            applyFilters();
        }
    };
    pagination.appendChild(firstLink);

    // 이전 버튼
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.textContent = '이전';
    if (currentPage === 1) {
        prevLink.className = 'disabled';
    }
    prevLink.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            applyFilters();
        }
    };
    pagination.appendChild(prevLink);

    // 페이지 번호를 감싸는 컨테이너
    const pageNumbers = document.createElement('div');
    pageNumbers.className = 'page-numbers';

    // 페이지 번호 계산 (최대 5개 표시)
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = Math.min(totalPages, maxVisiblePages);

    // 현재 페이지를 중앙에 위치시키기
    if (totalPages > maxVisiblePages) {
        const halfVisible = Math.floor(maxVisiblePages / 2);

        if (currentPage > halfVisible) {
            startPage = currentPage - halfVisible;
            endPage = currentPage + halfVisible;

            // 끝 페이지가 전체 페이지를 초과하는 경우 조정
            if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        }
    }

    // 페이지 번호 링크들
    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;

        if (i === currentPage) {
            pageLink.className = 'active';
        }

        pageLink.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            applyFilters();
        };

        pageNumbers.appendChild(pageLink);
    }

    pagination.appendChild(pageNumbers);

    // 다음 버튼
    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.textContent = '다음';
    if (currentPage === totalPages) {
        nextLink.className = 'disabled';
    }
    nextLink.onclick = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            applyFilters();
        }
    };
    pagination.appendChild(nextLink);

    // 끝 버튼
    const lastLink = document.createElement('a');
    lastLink.href = '#';
    lastLink.textContent = '끝';
    if (currentPage === totalPages) {
        lastLink.className = 'disabled';
    }
    lastLink.onclick = (e) => {
        e.preventDefault();
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            applyFilters();
        }
    };
    pagination.appendChild(lastLink);
}

// 결과 수 업데이트
function updateResultCount(count) {
    const totalCount = document.getElementById('totalCount');
    if (totalCount) {
        totalCount.textContent = count.toLocaleString();
    }

    // 선택된 지역 표시
    const resultRegion = document.getElementById('resultRegion');
    if (resultRegion) {
        if (currentFilters.region === 'all') {
            resultRegion.textContent = '';
        } else {
            const regionName = window.WaveSpaceData.regionNames[currentFilters.region] || currentFilters.region;
            resultRegion.textContent = `• ${regionName} 지역`;
        }
    }
}

// 필터 초기화
function resetFilters() {
    // 모든 필터 초기값으로
    currentFilters = {
        type: 'all',
        region: 'all',
        currentRegion: 'all',
        selectedRegions: [],
        keyword: '',
        productType: 'all',
        supplyType: 'all',
    };

    // UI 초기화
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) typeFilter.value = 'all';

    const keywordInput = document.getElementById('keywordInput');
    if (keywordInput) keywordInput.value = '';

    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) dateFilter.value = 'all';

    // 지역 선택 초기화
    document.querySelectorAll('.nav-selector').forEach((selector) => {
        selector.classList.remove('selected', 'active');
    });
    // 전체 선택
    const allRegionSelector = document.querySelector('.nav-selector[data-value="all"]');
    if (allRegionSelector) {
        allRegionSelector.classList.add('selected', 'active');
    }

    // 하위 지역 행 숨기기
    const subRegionRow = document.getElementById('subRegionRow');
    if (subRegionRow) {
        subRegionRow.style.display = 'none';
    }

    // 상품 유형 필터 초기화
    const productTabs = document.querySelectorAll('.product-filter .checkbox-tab');
    productTabs.forEach((tab) => {
        tab.classList.remove('active');
        const input = tab.querySelector('input[type="radio"]');
        if (input) input.checked = false;
    });
    // 전체 선택
    const allProductTab = document.querySelector('.product-filter .checkbox-tab[data-type="all"]');
    if (allProductTab) {
        allProductTab.classList.add('active');
        const input = allProductTab.querySelector('input[type="radio"]');
        if (input) input.checked = true;
    }

    // 공급 유형 필터 초기화
    const supplyTabs = document.querySelectorAll('.supply-filter .checkbox-tab');
    supplyTabs.forEach((tab) => {
        tab.classList.remove('active');
        const input = tab.querySelector('input[type="radio"]');
        if (input) input.checked = false;
    });
    // 전체 선택
    const allSupplyTab = document.querySelector('.supply-filter .checkbox-tab[data-type="all"]');
    if (allSupplyTab) {
        allSupplyTab.classList.add('active');
        const input = allSupplyTab.querySelector('input[type="radio"]');
        if (input) input.checked = true;
    }

    updateSelectedRegionsDisplay();
    applyFilters();
}

// ===========================================
// 문서 상세보기 및 다운로드
// ===========================================

function showDocumentPreview(doc) {
    const modal = document.getElementById('previewModal');
    if (!modal) return;

    const productType = productTypes.find((t) => t.id === doc.type);

    modal.querySelector('.preview-header h3').textContent = doc.title;
    modal.querySelector('.preview-type').textContent = productType.name;
    modal.querySelector('.preview-type').style.backgroundColor = productType.color + '20';
    modal.querySelector('.preview-type').style.color = productType.color;

    const previewBody = modal.querySelector('.preview-body');
    previewBody.innerHTML = `
        <div class="preview-thumbnail">
            ${
                doc.thumbnail
                    ? `<img src="${doc.thumbnail}" alt="${doc.title}">`
                    : `<div class="file-icon ${doc.fileType.toLowerCase()}">${doc.fileType}</div>`
            }
        </div>
        <div class="preview-details">
            <div class="detail-group">
                <h4>문서 정보</h4>
                <div class="detail-item">
                    <span class="label">파일 형식:</span>
                    <span class="value">${doc.fileType}</span>
                </div>
                <div class="detail-item">
                    <span class="label">파일 크기:</span>
                    <span class="value">${doc.fileSize}</span>
                </div>
                <div class="detail-item">
                    <span class="label">페이지 수:</span>
                    <span class="value">${doc.pages}페이지</span>
                </div>
                <div class="detail-item">
                    <span class="label">업로드 날짜:</span>
                    <span class="value">${doc.date}</span>
                </div>
            </div>
            <div class="detail-group">
                <h4>지역 정보</h4>
                <div class="detail-item">
                    <span class="label">위치:</span>
                    <span class="value">${doc.location}</span>
                </div>
            </div>
            <div class="detail-group">
                <h4>설명</h4>
                <p>${doc.description}</p>
            </div>
            <div class="detail-group">
                <h4>키워드</h4>
                <div class="keyword-tags">
                    ${doc.keywords.map((keyword) => `<span class="keyword-tag">${keyword}</span>`).join('')}
                </div>
            </div>
        </div>
    `;

    const downloadBtn = modal.querySelector('.preview-download-btn');
    downloadBtn.dataset.id = doc.id;
    downloadBtn.dataset.points = doc.points;
    downloadBtn.innerHTML = `
        <i class="fas fa-download"></i>
        다운로드 (${doc.points}P)
    `;

    modal.classList.add('active');
}

// 장바구니 추가 처리
function handleAddToCart(docId) {
    const doc = currentDocuments.find((d) => d.id == docId);
    if (doc) {
        // 장바구니 추가 성공 메시지
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const existingItem = cartItems.find((item) => item.id === doc.id);

        if (existingItem) {
            showToastMessage(`"${doc.title}"은(는) 이미 장바구니에 있습니다.`, 'warning');
        } else {
            cartItems.push({
                id: doc.id,
                title: doc.title,
                points: doc.points,
                type: doc.type,
                fileType: doc.fileType,
            });
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            showToastMessage(`"${doc.title}"이(가) 장바구니에 추가되었습니다.`, 'success');
        }
    }
}

// 다운로드 버튼 직접 클릭 처리
async function handleDirectDownload(docId, points) {
    // 권한 체크 (로그인 체크 포함)
    if (!(await checkDownloadPermission())) {
        return;
    }

    const doc = currentDocuments.find((d) => d.id == docId);
    if (!doc) return;

    // 포인트 차감 (실제 DB 연동)
    const currentUser = await loadCurrentUser();
    if (!currentUser) {
        showToastMessage('로그인이 필요합니다.', 'error');
        return;
    }
    
    // DB에서 포인트 차감
    const success = await spendPoints(
        points,
        `시장조사서 다운로드: ${doc.title}`,
        null,
        'download',
        docId
    );
    
    if (!success) {
        // spendPoints에서 이미 에러 메시지 표시됨
        return;
    }

    // 다운로드 기록 저장
    const downloadHistory = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    downloadHistory.push({
        id: doc.id,
        title: doc.title,
        downloadDate: new Date().toISOString(),
        points: points,
    });
    localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));

    // 글로벌 포인트 시스템 사용하여 포인트 차감 및 애니메이션
    const downloadBtn = event?.currentTarget || document.querySelector(`[data-id="${docId}"]`);
    spendPoints(points, `"${doc.title}" 다운로드 완료!`, downloadBtn);

    // Supabase를 통한 실제 파일 다운로드
    try {
        await downloadDocument(docId);
    } catch (error) {
        console.error('❌ 다운로드 실패:', error);
        alert(`다운로드 실패: ${error.message}`);
    }
}

// 기존 handleDownload 함수 (미리보기 모달에서 사용)
async function handleDownload(docId, points) {
    await handleDirectDownload(docId, points);
}

// 미리보기 PDF 렌더링 함수
async function renderPreviewPDF(pdfPath, docId) {
    const previewArea = document.querySelector('.preview-pages-layout');

    // 문서 정보 가져오기
    const doc = currentDocuments.find((d) => d.id == docId);

    // PDF 파일이 없는 경우 안내 메시지 표시
    if (!doc || !doc.pdfPath || doc.pdfPath === null) {
        // 미리보기 영역에 안내 메시지 표시
        if (previewArea) {
            previewArea.innerHTML = `
                <div class="no-preview-message">
                    <i class="fas fa-file-image"></i>
                    <h3>대표 이미지가 없습니다</h3>
                    <p>이 문서는 미리보기 이미지를 제공하지 않습니다.</p>
                    <p class="sub-text">다운로드 후 전체 내용을 확인하실 수 있습니다.</p>
                </div>
            `;
        }
        return;
    }

    // PDF 파일이 있는 경우 - 단일 페이지 레이아웃
    if (previewArea) {
        // 단일 페이지 레이아웃
        previewArea.innerHTML = `
            <div class="preview-single-page-layout">
                <div class="preview-page-single">
                    <canvas id="previewCanvas" width="300" height="400"></canvas>
                </div>
                <div class="page-label">- 5page -</div>
            </div>
        `;
    }

    // 캔버스 요소 가져오기
    const canvas = document.getElementById('previewCanvas');

    if (!canvas) {
        console.error('캔버스 요소를 찾을 수 없습니다.');
        return;
    }

    // PDF 파일이 있는 경우 - 실제 환경에서는 PDF.js를 사용하여 렌더링
    // 테스트 환경에서는 데모 이미지 렌더링
    try {
        // PDF.js 라이브러리 확인 및 실제 PDF 로드 시도
        if (typeof pdfjsLib !== 'undefined' && doc.pdfPath && doc.pdfPath.startsWith('http')) {
            // 실제 PDF 렌더링 로직
            await renderActualPDF(doc.pdfPath, canvas);
        } else {
            // PDF.js 없거나 로컬 환경일 때 데모 이미지 렌더링
            if (typeof pdfjsLib === 'undefined') {
                console.warn('PDF.js가 로드되지 않아 데모 이미지를 표시합니다.');
            }
            // 데모용 페이지 렌더링
            const ctx = canvas.getContext('2d');

            // 캔버스 초기화
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 데모 5페이지 렌더링 (더 크게)
            renderPage5(ctx, canvas.width, canvas.height);
        }
    } catch (error) {
        console.error('PDF 렌더링 오류:', error);
        // 오류 발생 시 안내 메시지 표시
        if (previewArea) {
            previewArea.innerHTML = `
                <div class="no-preview-message error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>미리보기를 불러올 수 없습니다</h3>
                    <p>일시적인 오류가 발생했습니다.</p>
                    <p class="sub-text">잠시 후 다시 시도해주세요.</p>
                </div>
            `;
        }
    }
}

// 실제 PDF 렌더링 함수
async function renderActualPDF(pdfPath, canvas) {
    try {
        // PDF.js 확인
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js 라이브러리가 로드되지 않았습니다');
        }
        
        // PDF 문서 로드
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;

        // 5페이지만 렌더링
        const ctx = canvas.getContext('2d');
        let pageNum = 5;

        // 페이지가 존재하지 않으면 마지막 페이지 사용
        if (pageNum > pdf.numPages) {
            pageNum = pdf.numPages;
        }

        // 페이지 가져오기
        const page = await pdf.getPage(pageNum);

        // 캔버스 크기에 맞게 뷰포트 설정
        const desiredWidth = canvas.width;
        const desiredHeight = canvas.height;
        const viewport = page.getViewport({ scale: 1.0 });

        const scale = Math.min(desiredWidth / viewport.width, desiredHeight / viewport.height);

        const scaledViewport = page.getViewport({ scale: scale });

        // 캔버스 크기 조정
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // PDF 페이지 렌더링
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport,
        };

        await page.render(renderContext).promise;

        // 페이지 라벨 업데이트 (5페이지만 특별하게)
        const labelElement = canvas.parentElement.querySelector('.page-label');
        if (labelElement) {
            if (pageNum === 5) {
                labelElement.textContent = `- 5page -`;
            } else {
                labelElement.textContent = `- ${pageNum}page -`;
            }
        }
    } catch (error) {
        console.error('PDF 렌더링 실패:', error);
        throw error;
    }
}

// 4페이지 렌더링
function renderPage4(ctx, width, height) {
    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 제목
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('4. 경쟁 분석', 10, 20);

    // 구분선
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(10, 25);
    ctx.lineTo(width - 10, 25);
    ctx.stroke();

    // 표 그리기
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('프로젝트명', 10, 45);
    ctx.fillText('세대수', 60, 45);
    ctx.fillText('분양가', 90, 45);

    // 표 데이터
    ctx.font = '7px sans-serif';
    ctx.fillText('래미안', 10, 60);
    ctx.fillText('2,990', 60, 60);
    ctx.fillText('3.3억', 90, 60);

    ctx.fillText('힐스테이트', 10, 75);
    ctx.fillText('1,428', 60, 75);
    ctx.fillText('3.1억', 90, 75);

    // 막대 차트
    ctx.fillStyle = '#2E8CE6';
    ctx.fillRect(10, 90, 25, 40);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(40, 95, 25, 35);
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(70, 100, 25, 30);

    // 차트 라벨
    ctx.fillStyle = '#6b7280';
    ctx.font = '6px sans-serif';
    ctx.fillText('입지', 15, 140);
    ctx.fillText('교통', 45, 140);
    ctx.fillText('학군', 75, 140);
}

// 5페이지 렌더링 (메인 페이지)
function renderPage5(ctx, width, height) {
    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 헤더
    ctx.fillStyle = '#2E8CE6';
    ctx.fillRect(0, 0, width, 35);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('5. 투자 전망', width / 2, 22);
    ctx.textAlign = 'left';

    // 수익률 예측 섹션
    ctx.fillStyle = '#374151';
    ctx.font = '10px sans-serif';
    ctx.fillText('■ 수익률 예측', 15, 55);

    // 라인 차트 그리기
    ctx.strokeStyle = '#2E8CE6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(50, 85);
    ctx.lineTo(80, 70);
    ctx.lineTo(110, 65);
    ctx.lineTo(140, 60);
    ctx.lineTo(170, 50);
    ctx.stroke();

    // 차트 포인트
    ctx.fillStyle = '#2E8CE6';
    const points = [
        [20, 100],
        [50, 85],
        [80, 70],
        [110, 65],
        [140, 60],
        [170, 50],
    ];
    points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
        ctx.fill();
    });

    // 투자 포인트 섹션
    ctx.fillStyle = '#374151';
    ctx.font = '10px sans-serif';
    ctx.fillText('■ 투자 포인트', 15, 130);

    // 포인트 박스
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(15, 140, width - 30, 40);
    ctx.fillStyle = '#6b7280';
    ctx.font = '8px sans-serif';
    ctx.fillText('• 역세권 트리플역', 20, 155);
    ctx.fillText('• 대규모 개발호재', 20, 168);

    // 예상 수익 테이블
    ctx.fillStyle = '#374151';
    ctx.font = '10px sans-serif';
    ctx.fillText('■ 예상 수익 분석', 15, 200);

    // 테이블
    ctx.strokeStyle = '#e5e7eb';
    ctx.strokeRect(15, 210, width - 30, 50);
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('투자금액: 3.3억', 20, 225);
    ctx.fillText('예상수익: 1.2억', 20, 240);
    ctx.fillText('수익률: 36.4%', 20, 255);
}

// 6페이지 렌더링
function renderPage6(ctx, width, height) {
    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 제목
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('6. 리스크 분석', 10, 20);

    // 구분선
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(10, 25);
    ctx.lineTo(width - 10, 25);
    ctx.stroke();

    // 리스크 매트릭스
    ctx.fillStyle = '#fee2e2';
    ctx.fillRect(10, 35, 30, 30);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(45, 35, 30, 30);
    ctx.fillStyle = '#dcfce7';
    ctx.fillRect(80, 35, 30, 30);

    ctx.fillStyle = '#374151';
    ctx.font = '7px sans-serif';
    ctx.fillText('높음', 18, 50);
    ctx.fillText('중간', 52, 50);
    ctx.fillText('낮음', 87, 50);

    // 리스크 항목
    ctx.fillStyle = '#6b7280';
    ctx.font = '8px sans-serif';
    ctx.fillText('■ 주요 리스크', 10, 85);

    ctx.font = '7px sans-serif';
    ctx.fillText('• 금리 상승 리스크', 15, 100);
    ctx.fillText('• 규제 변화 가능성', 15, 112);
    ctx.fillText('• 공급 과잉 우려', 15, 124);

    // 대응 방안
    ctx.font = '8px sans-serif';
    ctx.fillText('■ 대응 방안', 10, 145);
    ctx.font = '7px sans-serif';
    ctx.fillText('✓ 분산 투자', 15, 158);
}

async function updateUserPoints() {
    const pointsElement = document.querySelector('.user-points .points');
    if (pointsElement) {
        const currentUser = await loadCurrentUser();
        const userPoints = currentUser?.points || 0;
        pointsElement.textContent = `${userPoints.toLocaleString()}P`;
    }
}

// ===========================================
// 업로드 시스템
// ===========================================

// 구 업로드 시스템 (사용하지 않음 - 새로운 시스템으로 대체됨)
// uploadSystem.init() 호출이 제거되어 실행되지 않음
/*
const uploadSystem = {
    currentStep: 1,
    formData: {},
    extractedMetadata: null,
    
    init() {
        this.bindEvents();
        this.checkUserPermissions();
    },
    
    async checkUserPermissions() {
        const uploadBtn = document.querySelector('.upload-btn');
        if (!uploadBtn) return;
        
        const currentUser = await window.authService?.getCurrentUser();
        if (!currentUser) {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인 필요';
            uploadBtn.title = '로그인이 필요합니다';
            return;
        }
        
        // 사용자 권한 체크: member_type이 '분양기획' 또는 'planning'인 경우만 업로드 가능
        const memberType = currentUser.member_type || currentUser.role || 'general';
        const allowedTypes = ['분양기획', 'planning', 'developer', 'affiliate'];
        
        if (!allowedTypes.includes(memberType)) {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-lock"></i> 실무자 인증 필요';
            uploadBtn.title = '분양기획/개발팀만 업로드 가능합니다';
        } else {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> 파일 업로드';
            uploadBtn.title = '파일을 업로드할 수 있습니다';
        }
    },
    
    bindEvents() {
        const uploadBtn = document.querySelector('.upload-btn');
        const modal = document.getElementById('uploadModal');
        const closeBtn = document.getElementById('uploadClose');
        const cancelBtn = document.getElementById('uploadCancel');
        const fileInput = document.getElementById('fileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const submitBtn = document.getElementById('uploadSubmitBtn');
        
        // 업로드 버튼 클릭
        if (uploadBtn) {
            uploadBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const currentUser = await loadCurrentUser();
                if (!currentUser) {
                    alert('로그인이 필요합니다.');
                    return;
                }
                
                const memberType = currentUser.member_type || currentUser.role || 'general';
                const allowedTypes = ['분양기획', 'planning', 'developer', 'affiliate'];
                
                if (allowedTypes.includes(memberType)) {
                    this.openModal();
                } else {
                    alert('실무자 인증이 필요합니다. (기획/개발팀만 업로드 가능)');
                }
            });
        }
        
        // 모달 닫기
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        // 파일 업로드 영역
        if (fileUploadArea) {
            fileUploadArea.addEventListener('click', () => fileInput?.click());
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('dragover');
            });
            fileUploadArea.addEventListener('dragleave', () => {
                fileUploadArea.classList.remove('dragover');
            });
            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
            });
        }
        
        // 파일 선택
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }
        
        // 스텝 네비게이션
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousStep());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitUpload());
        }
        
        // 지역 선택 이벤트 (업로드 모달용)
        const uploadRegion1 = document.getElementById('uploadRegion1');
        const uploadRegion2 = document.getElementById('uploadRegion2');
        
        if (uploadRegion1) {
            uploadRegion1.addEventListener('change', () => {
                this.updateSubRegions();
            });
        }
    },
    
    openModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.classList.add('active');
            this.currentStep = 1;
            this.showStep(1);
            this.resetForm();
        }
    },
    
    closeModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.classList.remove('active');
            this.resetForm();
        }
    },
    
    resetForm() {
        this.currentStep = 1;
        this.formData = {};
        this.extractedMetadata = null;
        
        // 폼 초기화
        const form = document.getElementById('uploadForm');
        if (form) form.reset();
        
        // 파일 업로드 영역 초기화
        const fileInfo = document.querySelector('.file-info');
        if (fileInfo) fileInfo.style.display = 'none';
        
        const fileUploadArea = document.getElementById('fileUploadArea');
        if (fileUploadArea) fileUploadArea.style.display = 'flex';
    },
    
    handleFileUpload(file) {
        const allowedTypes = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'];
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExt)) {
            alert('PDF, PPT, DOC, XLS 파일만 업로드 가능합니다.');
            return;
        }
        
        // 파일 크기 체크 (최대 50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('파일 크기는 50MB를 초과할 수 없습니다.');
            return;
        }
        
        this.formData.file = file;
        
        // 파일 정보 표시
        const fileInfo = document.querySelector('.file-info');
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (fileInfo) {
            fileInfo.querySelector('.file-name').textContent = file.name;
            fileInfo.querySelector('.file-size').textContent = this.formatFileSize(file.size);
            fileInfo.style.display = 'flex';
        }
        
        if (fileUploadArea) {
            fileUploadArea.style.display = 'none';
        }
        
        // 메타데이터 추출 시뮬레이션
        this.extractMetadata(file);
    },
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    extractMetadata(file) {
        // 실제로는 서버에서 처리
        setTimeout(() => {
            this.extractedMetadata = {
                fileName: file.name,
                fileType: file.name.split('.').pop().toUpperCase(),
                fileSize: this.formatFileSize(file.size),
                pages: Math.floor(Math.random() * 50) + 10,
                extractedTitle: file.name.replace(/\.[^/.]+$/, ''),
                extractedLocation: '',
                extractedType: ''
            };
            
            // 추출된 정보로 폼 자동 채우기
            const titleInput = document.getElementById('documentTitle');
            if (titleInput && !titleInput.value) {
                titleInput.value = this.extractedMetadata.extractedTitle;
            }
        }, 500);
    },
    
    updateSubRegions() {
        const region1 = document.getElementById('uploadRegion1');
        const region2 = document.getElementById('uploadRegion2');
        
        if (!region1 || !region2) return;
        
        const selectedRegion = region1.value;
        region2.innerHTML = '<option value="">시/군/구 선택</option>';
        
        if (selectedRegion && window.WaveSpaceData.regionData[selectedRegion]) {
            // 두 번째 드롭다운 활성화
            region2.disabled = false;
            
            window.WaveSpaceData.regionData[selectedRegion].forEach(subRegion => {
                const option = document.createElement('option');
                option.value = subRegion;
                option.textContent = subRegion;
                region2.appendChild(option);
            });
        } else {
            // 상위 지역이 선택되지 않았으면 비활성화
            region2.disabled = true;
        }
    },
    
    showStep(step) {
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelectorAll('.step').forEach((s, index) => {
            if (index + 1 <= step) {
                s.classList.add('completed');
            } else {
                s.classList.remove('completed');
            }
            if (index + 1 === step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        
        const currentStepContent = document.getElementById(`step${step}`);
        if (currentStepContent) {
            currentStepContent.classList.add('active');
        }
        
        // 버튼 상태 업데이트
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const submitBtn = document.getElementById('uploadSubmitBtn');
        
        if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'flex';
        if (nextBtn) nextBtn.style.display = step === 3 ? 'none' : 'flex';
        if (submitBtn) submitBtn.style.display = step === 3 ? 'flex' : 'none';
    },
    
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    },
    
    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < 3) {
                this.currentStep++;
                this.showStep(this.currentStep);
            }
        }
    },
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (!this.formData.file) {
                    alert('파일을 선택해주세요.');
                    return false;
                }
                return true;
                
            case 2:
                const title = document.getElementById('documentTitle').value;
                const type = document.getElementById('documentType').value;
                const region1 = document.getElementById('uploadRegion1').value;
                const region2 = document.getElementById('uploadRegion2').value;
                
                if (!title || !type || !region1 || !region2) {
                    alert('모든 필수 정보를 입력해주세요.');
                    return false;
                }
                
                this.formData.title = title;
                this.formData.type = type;
                this.formData.region1 = region1;
                this.formData.region2 = region2;
                this.formData.description = document.getElementById('documentDescription').value;
                
                // 미리보기 업데이트
                this.updatePreview();
                return true;
                
            default:
                return true;
        }
    },
    
    updatePreview() {
        const previewTitle = document.querySelector('.preview-title');
        const previewType = document.querySelector('.preview-doc-type');
        const previewLocation = document.querySelector('.preview-location');
        const previewFile = document.querySelector('.preview-file');
        const previewDescription = document.querySelector('.preview-description');
        
        if (previewTitle) previewTitle.textContent = this.formData.title;
        if (previewType) {
            const type = productTypes.find(t => t.id === this.formData.type);
            previewType.textContent = type?.name || '';
        }
        if (previewLocation) {
            const region1Name = window.WaveSpaceData.regionNames[this.formData.region1] || this.formData.region1;
            previewLocation.textContent = `${region1Name} ${this.formData.region2}`;
        }
        if (previewFile) {
            previewFile.textContent = `${this.formData.file.name} (${this.formatFileSize(this.formData.file.size)})`;
        }
        if (previewDescription) {
            previewDescription.textContent = this.formData.description || '설명이 없습니다.';
        }
    },
    
    async submitUpload() {
        // 중복 검사
        if (this.checkDuplicate()) {
            const proceed = confirm('유사한 문서가 이미 존재합니다. 계속 업로드하시겠습니까?');
            if (!proceed) return;
        }
        
        // 업로드 시뮬레이션
        try {
            // 실제로는 서버로 파일 업로드
            // const formData = new FormData();
            // formData.append('file', this.formData.file);
            // formData.append('title', this.formData.title);
            // ... 기타 데이터
            
            alert('시장조사서가 성공적으로 업로드되었습니다!\n검토 후 100P가 지급됩니다.');
            
            // 포인트 지급 (실제 DB 연동)
            setTimeout(async () => {
                await earnPoints(
                    100,
                    '시장조사서 업로드',
                    null,
                    'upload',
                    Date.now() // 임시 ID, 실제로는 업로드된 문서 ID 사용
                );
            }, 1000);
            
            this.closeModal();
            
            // 목록 새로고침
            applyFilters();
            
        } catch (error) {
            alert('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    },
    
    checkDuplicate() {
        // 중복 검사 로직 (실제로는 서버에서 처리)
        const allDocuments = [...currentDocuments];
        const similarDoc = allDocuments.find(doc => {
            const docRegion = Object.keys(window.WaveSpaceData.regionNames).find(key => window.WaveSpaceData.regionNames[key] === doc.region);
            return doc.type === this.formData.type && 
                   docRegion === this.formData.region1 &&
                   doc.district === this.formData.region2;
        });
        
        return !!similarDoc;
    }
};
*/

// ===========================================
// 이벤트 리스너 초기화
// ===========================================

function initializeEventListeners() {
    // 정렬 옵션
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            const sortedDocuments = sortDocuments(filterDocuments(), this.value);
            renderDocuments(sortedDocuments);
        });
    }

    // 미리보기 모달 닫기
    const previewClose = document.getElementById('previewClose');
    if (previewClose) {
        previewClose.addEventListener('click', () => {
            const modal = document.getElementById('previewModal');
            if (modal) modal.classList.remove('active');
        });
    }

    // 미리보기 네비게이션 버튼
    const prevBtn = document.getElementById('previewPrev');
    const nextBtn = document.getElementById('previewNext');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentDocIndex > 0) {
                currentDocIndex--;
                updatePreviewModal(currentFilteredDocs[currentDocIndex]);
                updatePreviewNavButtons();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentDocIndex < currentFilteredDocs.length - 1) {
                currentDocIndex++;
                updatePreviewModal(currentFilteredDocs[currentDocIndex]);
                updatePreviewNavButtons();
            }
        });
    }


    // 미리보기 다운로드 버튼
    const previewDownloadBtn = document.querySelector('.preview-download-btn');
    if (previewDownloadBtn) {
        previewDownloadBtn.addEventListener('click', function () {
            const docId = this.dataset.id;
            const points = parseInt(this.dataset.points);
            handleDownload(docId, points);

            // 모달 닫기
            const modal = document.getElementById('previewModal');
            if (modal) modal.classList.remove('active');
        });
    }

    // 파일 제거 버튼
    const removeFileBtn = document.querySelector('.remove-file');
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            uploadSystem.formData.file = null;
            document.querySelector('.file-info').style.display = 'none';
            document.getElementById('fileUploadArea').style.display = 'flex';
            document.getElementById('fileInput').value = '';
        });
    }
}

// 문서 정렬
function sortDocuments(documents, sortBy) {
    const sorted = [...documents];

    switch (sortBy) {
        case 'latest':
            sorted.sort(
                (a, b) =>
                    new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-'))
            );
            break;
        case 'filesize':
            // 파일 크기를 숫자로 변환하여 정렬 (큰 파일이 먼저)
            sorted.sort((a, b) => {
                const aSize = parseFloat(a.fileSize) || 0;
                const bSize = parseFloat(b.fileSize) || 0;
                return bSize - aSize;
            });
            break;
    }

    return sorted;
}

// 유틸리티 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===========================================
// 개선된 업로드 시스템
// ===========================================

// 중복 파일 저장소 (세션 동안 유지)
// const uploadedFilesRegistry = new Set(); // 이미 위에 선언됨

// 두 번째 uploadSystem 선언 주석 처리 (이미 위에 선언됨)
/*
const uploadSystem = {
    formData: {},
    calculatedPoints: 0,
    
    init() {
        this.bindEvents();
        this.checkUserPermissions();
        this.initRegionData();
    },
    
    async checkUserPermissions() {
        const uploadBtn = document.querySelector('.upload-btn');
        if (!uploadBtn) return;
        
        const currentUser = await window.authService?.getCurrentUser();
        if (!currentUser) {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인 필요';
            uploadBtn.title = '로그인이 필요합니다';
            return;
        }
        
        // 사용자 권한 체크: member_type이 '분양기획' 또는 'planning'인 경우만 업로드 가능
        const memberType = currentUser.member_type || currentUser.role || 'general';
        const allowedTypes = ['분양기획', 'planning', 'developer', 'affiliate'];
        
        if (!allowedTypes.includes(memberType)) {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-lock"></i> 실무자 인증 필요';
            uploadBtn.title = '분양기획/개발팀만 업로드 가능합니다';
        } else {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> 파일 업로드';
            uploadBtn.title = '파일을 업로드할 수 있습니다';
        }
    },
    
    initRegionData() {
        const region1Select = document.getElementById('uploadRegion1');
        const region2Select = document.getElementById('uploadRegion2');
        
        if (region1Select) {
            region1Select.addEventListener('change', (e) => {
                const selectedRegion = e.target.value;
                if (selectedRegion && window.WaveSpaceData.regionData[selectedRegion]) {
                    // 시군구 업데이트
                    region2Select.disabled = false;
                    region2Select.innerHTML = '<option value="">시/군/구 선택</option>';
                    
                    window.WaveSpaceData.regionData[selectedRegion].forEach(district => {
                        const option = document.createElement('option');
                        option.value = district;
                        option.textContent = district;
                        region2Select.appendChild(option);
                    });
                } else {
                    region2Select.disabled = true;
                    region2Select.innerHTML = '<option value="">시/군/구 선택</option>';
                }
                
                this.calculatePoints();
                this.checkDuplicate();
            });
        }
        
        if (region2Select) {
            region2Select.addEventListener('change', () => {
                this.calculatePoints();
                this.checkDuplicate();
            });
        }
    },
    
    bindEvents() {
        // 파일 업로드 버튼
        const uploadBtn = document.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.openModal());
        }
        
        // 모달 닫기
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        const btnCancel = document.getElementById('btnCancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', () => this.closeModal());
        }
        
        // 파일 업로드 영역
        this.setupFileUpload();
        
        // 상품/공급 유형 버튼
        this.setupTypeButtons();
        
        // 파일 날짜 입력
        const fileDate = document.getElementById('fileDate');
        if (fileDate) {
            fileDate.addEventListener('change', () => {
                this.calculatePoints();
                this.checkDuplicate();
            });
        }
        
        // 업로드 버튼
        const uploadSubmitBtn = document.getElementById('uploadBtn');
        if (uploadSubmitBtn) {
            uploadSubmitBtn.addEventListener('click', () => this.handleSubmit());
        }
    },
    
    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadZone = document.getElementById('uploadZone');
        
        if (uploadZone) {
            uploadZone.addEventListener('click', () => fileInput?.click());
            
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = '#2E8CE6';
                uploadZone.style.background = 'rgba(46, 140, 230, 0.05)';
            });
            
            uploadZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = '#d1d5db';
                uploadZone.style.background = '#fafbfc';
            });
            
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = '#d1d5db';
                uploadZone.style.background = '#fafbfc';
                
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileSelect({ target: { files: [file] } });
                }
            });
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        const fileRemove = document.getElementById('fileRemove');
        if (fileRemove) {
            fileRemove.addEventListener('click', () => {
                this.formData.file = null;
                fileInput.value = '';
                document.getElementById('fileInfo').classList.remove('show');
                document.getElementById('uploadZone').classList.remove('has-file');
                document.getElementById('uploadBtn').disabled = true;
                document.getElementById('fileDate').value = '';
                this.calculatePoints();
            });
        }
    },
    
    setupTypeButtons() {
        // 상품 유형 버튼
        document.querySelectorAll('.upload-product-types .upload-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.upload-product-types .upload-type-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                this.formData.productType = btn.dataset.type;
                this.checkDuplicate();
            });
        });
        
        // 공급 유형 버튼
        document.querySelectorAll('.upload-supply-types .upload-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.upload-supply-types .upload-type-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                this.formData.supplyType = btn.dataset.type;
                this.checkDuplicate();
            });
        });
    },
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 파일 타입 검증
        const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 
                            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        
        if (!allowedTypes.includes(file.type)) {
            alert('지원되지 않는 파일 형식입니다.\nPDF, PPT, DOC, XLS 파일만 업로드 가능합니다.');
            return;
        }
        
        // 파일 크기 검증 (50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('파일 크기는 50MB를 초과할 수 없습니다.');
            return;
        }
        
        this.formData.file = file;
        this.formData.fileSize = (file.size / (1024 * 1024)).toFixed(1); // MB로 변환
        this.displayFileInfo(file);
        this.calculatePoints();
        
        // PDF인 경우 썸네일 추출 시도 (간단한 시뮬레이션)
        if (file.type === 'application/pdf') {
            this.simulateThumbnailExtraction();
        }
    },
    
    simulateThumbnailExtraction() {
        // 실제로는 PDF.js를 사용해야 하나, 여기서는 시뮬레이션
        const thumbnailDiv = document.getElementById('fileThumbnail');
        const iconDiv = document.getElementById('fileIconDiv');
        const canvas = document.getElementById('thumbnailCanvas');
        
        if (thumbnailDiv && canvas) {
            const ctx = canvas.getContext('2d');
            
            // 임시 썸네일 생성 (회색 배경에 텍스트)
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, 120, 160);
            
            // 텍스트
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PDF', 60, 80);
            ctx.font = '10px sans-serif';
            ctx.fillText('5페이지', 60, 100);
            
            // 오른쪽 1/2 모자이크
            const imageData = ctx.getImageData(60, 0, 60, 160);
            const data = imageData.data;
            const pixelSize = 5;
            
            for (let y = 0; y < 160; y += pixelSize) {
                for (let x = 0; x < 60; x += pixelSize) {
                    const i = (y * 60 + x) * 4;
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    
                    for (let dy = 0; dy < pixelSize; dy++) {
                        for (let dx = 0; dx < pixelSize; dx++) {
                            const idx = ((y + dy) * 60 + (x + dx)) * 4;
                            data[idx] = data[idx + 1] = data[idx + 2] = avg;
                        }
                    }
                }
            }
            
            ctx.putImageData(imageData, 60, 0);
            
            thumbnailDiv.style.display = 'block';
            if (iconDiv) iconDiv.style.display = 'none';
        }
    },
    
    displayFileInfo(file) {
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const fileInfo = document.getElementById('fileInfo');
        const uploadZone = document.getElementById('uploadZone');
        const uploadBtn = document.getElementById('uploadBtn');
        
        if (fileName) fileName.textContent = file.name;
        
        // 페이지 수 추출 시도
        if (file.type === 'application/pdf') {
            extractPageCount(file).then(pageCount => {
                if (pageCount && fileSize) {
                    fileSize.textContent = `${this.formData.fileSize} MB • ${pageCount}페이지`;
                    this.formData.pages = pageCount;
                } else if (fileSize) {
                    fileSize.textContent = this.formData.fileSize + ' MB';
                }
            }).catch(error => {
                console.warn('페이지 수 추출 실패:', error);
                if (fileSize) fileSize.textContent = this.formData.fileSize + ' MB';
            });
        } else if (fileSize) {
            fileSize.textContent = this.formData.fileSize + ' MB • 추정 25페이지';
            this.formData.pages = 25; // 기본값
        }
        
        // 파일 타입에 따른 아이콘
        const icon = fileInfo?.querySelector('.simple-file-icon i');
        if (icon) {
            if (file.name.endsWith('.pdf')) {
                icon.className = 'fas fa-file-pdf';
                icon.style.color = '#dc2626';
            } else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
                icon.className = 'fas fa-file-powerpoint';
                icon.style.color = '#ea580c';
            } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                icon.className = 'fas fa-file-word';
                icon.style.color = '#2563eb';
            } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                icon.className = 'fas fa-file-excel';
                icon.style.color = '#10b981';
            } else {
                icon.className = 'fas fa-file-alt';
                icon.style.color = '#6b7280';
            }
        }
        
        if (fileInfo) fileInfo.classList.add('show');
        if (uploadZone) uploadZone.classList.add('has-file');
        if (uploadBtn) uploadBtn.disabled = false;
    },
    
    calculatePoints() {
        if (!this.formData.file) {
            this.updatePointsDisplay(0);
            this.clearHighlights();
            return;
        }
        
        const basePoints = 3000;
        
        // 1. 페이지 지수
        const pageCount = this.formData.pages || 25; // 기본 25페이지
        let pageMultiplier = 0;
        let pageCategory = '';
        
        if (pageCount >= 40) {
            pageMultiplier = 1.2; // 120%
            pageCategory = 'page40';
        } else if (pageCount >= 30) {
            pageMultiplier = 1.1; // 110%
            pageCategory = 'page30';
        } else if (pageCount >= 20) {
            pageMultiplier = 1.0; // 100%
            pageCategory = 'page20';
        } else if (pageCount >= 10) {
            pageMultiplier = 0.9; // 90%
            pageCategory = 'page10';
        } else {
            pageMultiplier = 0.6; // 60%
            pageCategory = 'pageUnder10';
        }
        
        // 2. 최신성 지수 (연/월/일 선택 기준)
        const fileYear = document.getElementById('fileYear')?.value;
        const fileMonth = document.getElementById('fileMonth')?.value;
        const fileDay = document.getElementById('fileDay')?.value;
        let freshnessMultiplier = 0;
        let freshnessCategory = '';
        
        if (fileYear && fileMonth && fileDay) {
            const selectedDate = new Date(fileYear, fileMonth - 1, fileDay);
            const today = new Date();
            const daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 180) { // 6개월 이내
                freshnessMultiplier = 1.2; // 120%
                freshnessCategory = '6m';
            } else if (daysDiff <= 365) { // 1년 이내
                freshnessMultiplier = 1.0; // 100%
                freshnessCategory = '1y';
            } else if (daysDiff <= 730) { // 2년 이내
                freshnessMultiplier = 0.7; // 70%
                freshnessCategory = '2y';
            } else {
                freshnessMultiplier = 0; // 2년 초과는 0P
                freshnessCategory = 'over2y';
            }
        }
        
        // 최종 포인트 계산: 기본 3000P × 페이지 지수 × 최신성 지수
        const totalPoints = Math.round(basePoints * pageMultiplier * freshnessMultiplier);
        this.calculatedPoints = totalPoints;
        this.updatePointsDisplay(this.calculatedPoints);
        
        // 해당 지수 강조 표시
        this.highlightSelectedFactors(pageCategory, freshnessCategory, pageMultiplier, freshnessMultiplier, totalPoints);
    },
    
    clearHighlights() {
        // 모든 강조 표시 제거
        document.querySelectorAll('[id^="size-"], [id^="fresh-"]').forEach(el => {
            el.style.background = '#f9fafb';
            el.style.fontWeight = 'normal';
        });
        document.querySelectorAll('[id$="-value"]').forEach(el => {
            el.style.background = 'white';
        });
        
        // 개인화된 계산 숨기기
        const personalizedCalc = document.getElementById('personalizedCalculation');
        if (personalizedCalc) {
            personalizedCalc.style.display = 'none';
        }
    },
    
    highlightSelectedFactors(sizeCategory, freshnessCategory, sizeMultiplier, freshnessMultiplier, totalPoints) {
        // 기존 강조 표시 제거
        this.clearHighlights();
        
        // 파일 크기 강조
        if (sizeCategory) {
            const sizeRow = document.getElementById(`size-${sizeCategory}`);
            const sizeValue = document.getElementById(`size-${sizeCategory}-value`);
            if (sizeRow) {
                sizeRow.style.background = '#dbeafe';
                sizeRow.style.fontWeight = '600';
            }
            if (sizeValue) {
                sizeValue.style.background = '#eff6ff';
                sizeValue.style.border = '2px solid #0066FF';
            }
        }
        
        // 최신성 강조
        if (freshnessCategory) {
            const freshRow = document.getElementById(`fresh-${freshnessCategory}`);
            const freshValue = document.getElementById(`fresh-${freshnessCategory}-value`);
            if (freshRow) {
                freshRow.style.background = '#dbeafe';
                freshRow.style.fontWeight = '600';
            }
            if (freshValue) {
                freshValue.style.background = '#eff6ff';
                freshValue.style.border = '2px solid #0066FF';
            }
        }
        
        // 개인화된 계산 표시
        if (sizeMultiplier && freshnessMultiplier) {
            const personalizedCalc = document.getElementById('personalizedCalculation');
            const myFileCalc = document.getElementById('myFileCalc');
            
            if (personalizedCalc && myFileCalc) {
                const sizePercent = Math.round(sizeMultiplier * 100);
                const freshPercent = Math.round(freshnessMultiplier * 100);
                myFileCalc.textContent = `3,000P × ${sizePercent}% × ${freshPercent}% = ${totalPoints.toLocaleString()}P`;
                personalizedCalc.style.display = 'block';
            }
        }
    },
    
    updatePointsDisplay(points) {
        const pointsValue = document.getElementById('pointsValue');
        const uploadBtnPoints = document.getElementById('uploadBtnPoints');
        
        if (pointsValue) {
            pointsValue.textContent = `+${points}P`;
        }
        
        // 업로드 버튼에도 포인트 표시
        if (uploadBtnPoints) {
            if (points > 0) {
                uploadBtnPoints.textContent = `(+${points}P 획득)`;
                uploadBtnPoints.style.color = '#0066FF';
            } else {
                uploadBtnPoints.textContent = '';
            }
        }
    },
    
    checkDuplicate() {
        if (!this.formData.file) return;
        
        const region1 = document.getElementById('uploadRegion1')?.value;
        const region2 = document.getElementById('uploadRegion2')?.value;
        const productType = this.formData.productType || 'apartment';
        const supplyType = this.formData.supplyType || 'private-sale';
        const fileDate = document.getElementById('fileDate')?.value;
        
        if (region1 && region2 && fileDate) {
            // 중복 키 생성
            const duplicateKey = `${this.formData.fileSize}_${fileDate}_${region1}_${region2}_${productType}_${supplyType}`;
            
            const duplicateInfo = document.getElementById('duplicateCheckInfo');
            if (uploadedFilesRegistry.has(duplicateKey)) {
                // 중복 발견
                if (duplicateInfo) {
                    duplicateInfo.style.display = 'flex';
                    duplicateInfo.innerHTML = `
                        <i class="fas fa-exclamation-circle" style="color: #dc2626; margin-right: 6px;"></i>
                        <span style="font-size: 13px; color: #dc2626;">중복 파일이 감지되었습니다. 동일한 파일이 이미 업로드되었습니다.</span>
                    `;
                    duplicateInfo.style.background = '#fee2e2';
                }
                document.getElementById('uploadBtn').disabled = true;
            } else {
                // 중복 없음
                if (duplicateInfo) {
                    duplicateInfo.style.display = 'none';
                }
                document.getElementById('uploadBtn').disabled = false;
            }
        }
    },
    
    async handleSubmit() {
        // 업로드 권한 체크
        if (!(await checkUploadPermission())) {
            return;
        }

        // 필수 필드 검증
        const title = document.getElementById('documentTitle')?.value;
        const region1 = document.getElementById('uploadRegion1')?.value;
        const region2 = document.getElementById('uploadRegion2')?.value;
        const fileDate = document.getElementById('fileDate')?.value;
        const productType = this.formData.productType || 'apartment';
        const supplyType = this.formData.supplyType || 'private-sale';
        
        if (!title || !region1 || !region2 || !fileDate || !this.formData.file) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }
        
        try {
            // 로딩 상태 표시
            const submitBtn = document.getElementById('uploadBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '업로드 중...';
            }
            
            // Supabase 업로드 시도 (디버깅 강화)
            console.log('🔄 Supabase 업로드 시도 중...');
            console.log('📊 업로드 환경 확인:', {
                hasMarketResearchSupabase: !!window.marketResearchSupabase,
                hasClient: !!(window.marketResearchSupabase?.client),
                hasWaveSupabase: !!window.WaveSupabase,
                currentUser: window.WaveSupabase?.currentUser,
                storageDisabled: window.marketResearchSupabase?.storageDisabled
            });
            
            if (window.marketResearchSupabase && window.marketResearchSupabase.client) {
                // 사용자 ID 확인 및 설정
                const currentUser = window.WaveSupabase?.currentUser;
                const userId = currentUser?.id || `temp_user_${Date.now()}`;
                
                console.log('👤 사용자 ID:', userId);

                const metadata = {
                    title: title,
                    region1: region1,
                    region2: region2,
                    productType: productType,
                    supplyType: supplyType,
                    fileCreatedDate: fileDate,
                    fileSize: this.formData.fileSize,
                    pages: this.formData.pages || 25,
                    keywords: [],
                    userId: userId
                };
                
                console.log('📋 메타데이터 준비 완료:', metadata);
                
                const result = await window.marketResearchSupabase.uploadFile(this.formData.file, metadata);
                
                if (result) {
                    // 업로드 성공 - 문서 목록 새로고침
                    await refreshDocuments();
                    
                    alert(`업로드가 성공적으로 완료되었습니다!\n+${this.calculatedPoints}P가 적립되었습니다.`);
                    this.closeModal();
                    return;
                }
            } else {
                // Supabase 업로드 실패 시 오류 메시지만 표시
                console.error('❌ Supabase 업로드 실패');
                alert('업로드에 실패했습니다. 다시 시도해주세요.');
                return;
            }
            
        } catch (error) {
            console.error('❌ 업로드 실패:', error);
            alert(`업로드 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            // 버튼 상태 복원
            const submitBtn = document.getElementById('uploadBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '업로드';
            }
        }
    },
    
    getSupplyTypeName(type) {
        const map = {
            'private-sale': '민간분양',
            'public-sale': '공공분양',
            'private-rental': '민간임대',
            'public-rental': '공공임대'
        };
        return map[type] || '민간분양';
    },
    
    openModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.classList.add('active');
            this.resetForm();
        }
    },
    
    closeModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    resetForm() {
        this.formData = {};
        this.calculatedPoints = 0;
        
        // 폼 초기화
        document.getElementById('documentTitle')?.value = '';
        document.getElementById('uploadRegion1')?.value = '';
        document.getElementById('uploadRegion2')?.value = '';
        document.getElementById('uploadRegion2')?.disabled = true;
        document.getElementById('fileDate')?.value = '';
        document.getElementById('fileInput')?.value = '';
        
        // 파일 정보 숨기기
        document.getElementById('fileInfo')?.classList.remove('show');
        document.getElementById('uploadZone')?.classList.remove('has-file');
        document.getElementById('fileThumbnail')?.style.display = 'none';
        document.getElementById('fileIconDiv')?.style.display = 'block';
        
        // 버튼 초기화
        document.getElementById('uploadBtn')?.disabled = true;
        
        // 기본 선택
        document.querySelectorAll('.upload-type-btn').forEach((btn, index) => {
            if (btn.parentElement.classList.contains('upload-product-types') && index === 0) {
                btn.classList.add('active');
                this.formData.productType = btn.dataset.type;
            } else if (btn.parentElement.classList.contains('upload-supply-types') && index === 0) {
                btn.classList.add('active');
                this.formData.supplyType = btn.dataset.type;
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 포인트 초기화
        this.updatePointsDisplay(0);
        
        // 중복 체크 초기화
        document.getElementById('duplicateCheckInfo')?.style.display = 'none';
    }
};
*/

// ===========================================
// 개선된 업로드 모달 기능
// ===========================================

function initEnhancedUploadModal() {
    const modal = document.getElementById('uploadModal');
    const uploadBtn = document.querySelector('.upload-btn');
    const modalClose = document.getElementById('modalClose');
    const btnCancel = document.getElementById('btnCancel');
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const region1Select = document.getElementById('uploadRegion1');
    const region2Select = document.getElementById('uploadRegion2');

    // 모달 열기
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('active');
                resetUploadForm();
                // 모달 열 때 포인트 팩터 표시 초기화
                resetPointFactorDisplay();
            }
        });
    }

    // 모달 닫기
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // 파일 업로드
    if (uploadZone) {
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        // 드래그 앤 드롭
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#2E8CE6';
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#d1d5db';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#d1d5db';
            const files = Array.from(e.dataTransfer.files);
            handleSingleFileUpload(files);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            handleSingleFileUpload(files);
        });
    }

    // 지역 선택
    if (region1Select) {
        region1Select.addEventListener('change', (e) => {
            updateRegion2Options(e.target.value);
            checkAllFieldsAndDuplicate(); // 중복검사 실행
        });
    }

    if (region2Select) {
        region2Select.addEventListener('change', () => {
            checkAllFieldsAndDuplicate(); // 중복검사 실행
        });
    }

    // 상품유형 버튼
    document.querySelectorAll('.upload-product-types .upload-type-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.upload-product-types .upload-type-btn').forEach((b) => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            calculatePoints();
            checkAllFieldsAndDuplicate(); // 중복검사 실행
        });
    });

    // 공급유형 버튼
    document.querySelectorAll('.upload-supply-types .upload-type-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.upload-supply-types .upload-type-btn').forEach((b) => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            checkAllFieldsAndDuplicate(); // 중복검사 실행
        });
    });

    // 파일 제거 버튼
    const fileRemoveBtn = document.getElementById('fileRemove');
    if (fileRemoveBtn) {
        fileRemoveBtn.addEventListener('click', () => {
            removeUploadedFile();
        });
    }

    // 날짜 선택 시 포인트 재계산
    const fileYear = document.getElementById('fileYear');
    const fileMonth = document.getElementById('fileMonth');
    const fileDay = document.getElementById('fileDay');

    [fileYear, fileMonth, fileDay].forEach((element) => {
        if (element) {
            element.addEventListener('change', () => {
                // 파일이 업로드된 경우에만 포인트 계산
                const fileInput = document.getElementById('fileInput');
                if (fileInput && fileInput.files[0]) {
                    calculatePoints();
                }
            });
        }
    });

    // 업로드 제출 버튼
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    if (uploadSubmitBtn) {
        uploadSubmitBtn.addEventListener('click', () => {
            submitUpload();
        });
    }
}

// 파일 업로드 처리 (단일 파일)
function handleSingleFileUpload(files) {
    if (files.length === 0) return;
    
    // 첫 번째 파일만 처리
    const file = files[0];
    
    // 이미 파일이 있으면 교체 여부 확인
    if (uploadedFile) {
        uploadedFile = null;
    }
    
    handleFileUpload(file);
}

// 파일 업로드 처리
async function handleFileUpload(file) {
    // 파일 객체 저장
    uploadedFile = {
        file: file,
        year: '',
        month: '',
        day: '',
        pages: null
    };
    
    // PDF 페이지 수 추출
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
            const pageCount = await extractPageCount(file);
            if (pageCount) {
                uploadedFile.pages = pageCount;
                console.log('PDF 페이지 수 추출 성공:', pageCount);
            } else {
                uploadedFile.pages = 25; // 기본값
                console.log('PDF 페이지 수 추출 실패, 기본값 사용: 25');
            }
        } catch (error) {
            console.warn('PDF 페이지 수 추출 중 오류:', error);
            uploadedFile.pages = 25; // 기본값
        }
    } else {
        // PDF가 아닌 파일은 기본값 25페이지
        uploadedFile.pages = 25;
        console.log('PDF가 아닌 파일, 기본 페이지 수 할당: 25');
    }
    
    // UI 업데이트
    updateFileUI();
    
    // 업로드 영역 숨기기
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
        uploadZone.style.display = 'none';
    }
    
    // 포인트 계산
    calculatePoints();
}

// 파일 UI 업데이트
function updateFileUI() {
    const container = document.getElementById('filesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!uploadedFile) return;
    
    const fileData = uploadedFile;
        const fileDiv = document.createElement('div');
        fileDiv.className = 'simple-file-info show';
        fileDiv.style.marginBottom = '12px';
        
        // 파일 아이콘 결정
        let iconClass = 'fas fa-file';
        let iconColor = '#6b7280';
        
        if (fileData.file.type === 'application/pdf' || fileData.file.name.endsWith('.pdf')) {
            iconClass = 'fas fa-file-pdf';
            iconColor = '#dc2626';
        } else if (fileData.file.name.match(/\.(ppt|pptx)$/i)) {
            iconClass = 'fas fa-file-powerpoint';
            iconColor = '#dc6612';
        } else if (fileData.file.name.match(/\.(doc|docx)$/i)) {
            iconClass = 'fas fa-file-word';
            iconColor = '#2563eb';
        } else if (fileData.file.name.match(/\.(xls|xlsx)$/i)) {
            iconClass = 'fas fa-file-excel';
            iconColor = '#16a34a';
        }
        
        fileDiv.innerHTML = `
            <div class="simple-file-icon">
                <i class="${iconClass}" style="color: ${iconColor};"></i>
            </div>
            <div class="simple-file-details">
                <div class="simple-file-name">${fileData.file.name}</div>
                <div class="simple-file-size">${(fileData.file.size / (1024 * 1024)).toFixed(1)} MB${fileData.pages ? ` • ${fileData.pages}페이지` : ''}</div>
                <div class="file-date-select" style="margin-top: 12px;">
                    <label style="font-size: 13px; color: #374151; font-weight: 600; display: block; margin-bottom: 8px;">
                        <i class="fas fa-calendar-check" style="color: #6b7280; margin-right: 4px;"></i>
                        파일 생성 날짜 <span style="color: #dc2626;">*</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <select class="date-select file-year" data-file-id="${fileData.id}" style="padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; min-width: 80px;">
                            <option value="">연도</option>
                            <option value="2025">2025년</option>
                            <option value="2024">2024년</option>
                            <option value="2023">2023년</option>
                        </select>
                        <select class="date-select file-month" data-file-id="${fileData.id}" style="padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; min-width: 65px;">
                            <option value="">월</option>
                            ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${i + 1}월</option>`).join('')}
                        </select>
                        <select class="date-select file-day" data-file-id="${fileData.id}" style="padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; min-width: 65px;">
                            <option value="">일</option>
                            ${Array.from({length: 31}, (_, i) => `<option value="${i + 1}">${i + 1}일</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <button class="simple-file-remove" id="dynamicFileRemove">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(fileDiv);
        
        // 파일 제거 버튼 이벤트 추가
        const removeBtn = fileDiv.querySelector('#dynamicFileRemove');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                removeUploadedFile();
            });
        }
        
        // 날짜 선택 이벤트 추가
        const yearSelect = fileDiv.querySelector('.file-year');
        const monthSelect = fileDiv.querySelector('.file-month');
        const daySelect = fileDiv.querySelector('.file-day');
        
        [yearSelect, monthSelect, daySelect].forEach(select => {
            select.addEventListener('change', () => {
                if (uploadedFile) {
                    uploadedFile.year = yearSelect.value;
                    uploadedFile.month = monthSelect.value;
                    uploadedFile.day = daySelect.value;
                    calculatePoints();
                    checkAllFieldsAndDuplicate();
                }
            });
        });
        
        // 기존 값 복원
        if (fileData.year) yearSelect.value = fileData.year;
        if (fileData.month) monthSelect.value = fileData.month;
        if (fileData.day) daySelect.value = fileData.day;
}


// PDF 썸네일 생성 (실제 PDF 페이지 추출)
async function generatePDFThumbnail(file) {
    const thumbnailDiv = document.getElementById('fileThumbnail');
    const iconDiv = document.getElementById('fileIconDiv');
    const canvas = document.getElementById('thumbnailCanvas');

    if (!thumbnailDiv || !canvas) return;

    const ctx = canvas.getContext('2d');

    try {
        // PDF.js가 로드되었는지 확인
        if (typeof pdfjsLib === 'undefined') {
            console.warn('PDF.js 라이브러리가 로드되지 않았습니다. 기본 아이콘을 표시합니다.');
            // PDF.js 없이 기본 아이콘만 표시
            if (iconDiv) {
                iconDiv.style.display = 'flex';
            }
            if (thumbnailDiv) {
                thumbnailDiv.style.display = 'none';
            }
            return;
        }

        // FileReader로 PDF 파일 읽기
        const arrayBuffer = await file.arrayBuffer();

        // PDF 문서 로드
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        // 5번째 페이지 가져오기 (5페이지가 없으면 마지막 페이지 사용)
        const pageNumber = Math.min(5, pdf.numPages);
        const page = await pdf.getPage(pageNumber);

        // 캔버스 크기 설정
        const viewport = page.getViewport({ scale: 0.5 }); // 축소된 크기
        const canvasWidth = 120;
        const canvasHeight = 160;

        // 비율 유지하면서 캔버스에 맞추기
        const scale = Math.min(canvasWidth / viewport.width, canvasHeight / viewport.height);
        const scaledViewport = page.getViewport({ scale: scale });

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 배경 색상 설정
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // PDF 페이지 렌더링
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport,
        };

        await page.render(renderContext).promise;

        // 오른쪽 절반 모자이크 처리
        const halfWidth = Math.floor(canvasWidth / 2);
        const imageData = ctx.getImageData(halfWidth, 0, halfWidth, canvasHeight);
        const data = imageData.data;
        const pixelSize = 6; // 모자이크 크기

        for (let y = 0; y < canvasHeight; y += pixelSize) {
            for (let x = 0; x < halfWidth; x += pixelSize) {
                // 각 블록의 평균 색상 계산
                let r = 0,
                    g = 0,
                    b = 0,
                    count = 0;

                for (let dy = 0; dy < pixelSize && y + dy < canvasHeight; dy++) {
                    for (let dx = 0; dx < pixelSize && x + dx < halfWidth; dx++) {
                        const idx = ((y + dy) * halfWidth + (x + dx)) * 4;
                        if (idx < data.length) {
                            r += data[idx];
                            g += data[idx + 1];
                            b += data[idx + 2];
                            count++;
                        }
                    }
                }

                if (count > 0) {
                    r = Math.floor(r / count);
                    g = Math.floor(g / count);
                    b = Math.floor(b / count);

                    // 블록 전체를 평균 색상으로 채우기
                    for (let dy = 0; dy < pixelSize && y + dy < canvasHeight; dy++) {
                        for (let dx = 0; dx < pixelSize && x + dx < halfWidth; dx++) {
                            const idx = ((y + dy) * halfWidth + (x + dx)) * 4;
                            if (idx < data.length) {
                                data[idx] = r;
                                data[idx + 1] = g;
                                data[idx + 2] = b;
                            }
                        }
                    }
                }
            }
        }

        ctx.putImageData(imageData, halfWidth, 0);

        // 페이지 번호 표시
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, canvasHeight - 20, 40, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`P.${pageNumber}`, 20, canvasHeight - 6);

        // 썸네일 표시, 아이콘 숨기기
        thumbnailDiv.style.display = 'block';
        if (iconDiv) iconDiv.style.display = 'none';
    } catch (error) {
        console.error('PDF 썸네일 생성 실패:', error);

        // 오류 발생 시 기본 썸네일 표시
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 120, 160);

        ctx.fillStyle = '#6b7280';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PDF', 60, 80);
        ctx.font = '12px sans-serif';
        ctx.fillText('미리보기', 60, 100);
        ctx.fillText('불가', 60, 120);

        thumbnailDiv.style.display = 'block';
        if (iconDiv) iconDiv.style.display = 'none';
    }
}

// 지역2 옵션 업데이트
function updateRegion2Options(region1Value) {
    const region2Select = document.getElementById('uploadRegion2');
    if (!region2Select) return;

    // 지역2 초기화
    region2Select.innerHTML = '<option value="">시/군/구 선택</option>';
    region2Select.disabled = true;

    // 지역 데이터 매핑
    const regionMap = {
        seoul: [
            '강남구',
            '강동구',
            '강북구',
            '강서구',
            '관악구',
            '광진구',
            '구로구',
            '금천구',
            '노원구',
            '도봉구',
            '동대문구',
            '동작구',
            '마포구',
            '서대문구',
            '서초구',
            '성동구',
            '성북구',
            '송파구',
            '양천구',
            '영등포구',
            '용산구',
            '은평구',
            '종로구',
            '중구',
            '중랑구',
        ],
        gyeonggi: [
            '가평군',
            '고양시',
            '과천시',
            '광명시',
            '광주시',
            '구리시',
            '군포시',
            '김포시',
            '남양주시',
            '동두천시',
            '부천시',
            '성남시',
            '수원시',
            '시흥시',
            '안산시',
            '안성시',
            '안양시',
            '양주시',
            '양평군',
            '여주시',
            '연천군',
            '오산시',
            '용인시',
            '의왕시',
            '의정부시',
            '이천시',
            '파주시',
            '평택시',
            '포천시',
            '하남시',
            '화성시',
        ],
        incheon: [
            '강화군',
            '계양구',
            '남동구',
            '동구',
            '미추홀구',
            '부평구',
            '서구',
            '연수구',
            '옹진군',
            '중구',
        ],
        busan: [
            '강서구',
            '금정구',
            '기장군',
            '남구',
            '동구',
            '동래구',
            '부산진구',
            '북구',
            '사상구',
            '사하구',
            '서구',
            '수영구',
            '연제구',
            '영도구',
            '중구',
            '해운대구',
        ],
        daegu: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
        gwangju: ['광산구', '남구', '동구', '북구', '서구'],
        daejeon: ['대덕구', '동구', '서구', '유성구', '중구'],
        ulsan: ['남구', '동구', '북구', '울주군', '중구'],
        sejong: ['세종시'],
        gangwon: [
            '강릉시',
            '고성군',
            '동해시',
            '삼척시',
            '속초시',
            '양구군',
            '양양군',
            '영월군',
            '원주시',
            '인제군',
            '정선군',
            '철원군',
            '춘천시',
            '태백시',
            '평창군',
            '홍천군',
            '화천군',
            '횡성군',
        ],
        chungbuk: [
            '괴산군',
            '단양군',
            '보은군',
            '영동군',
            '옥천군',
            '음성군',
            '제천시',
            '증평군',
            '진천군',
            '청주시',
            '충주시',
        ],
        chungnam: [
            '계룡시',
            '공주시',
            '금산군',
            '논산시',
            '당진시',
            '보령시',
            '부여군',
            '서산시',
            '서천군',
            '아산시',
            '예산군',
            '천안시',
            '청양군',
            '태안군',
            '홍성군',
        ],
        jeonbuk: [
            '고창군',
            '군산시',
            '김제시',
            '남원시',
            '무주군',
            '부안군',
            '순창군',
            '완주군',
            '익산시',
            '임실군',
            '장수군',
            '전주시',
            '정읍시',
            '진안군',
        ],
        jeonnam: [
            '강진군',
            '고흥군',
            '곡성군',
            '광양시',
            '구례군',
            '나주시',
            '담양군',
            '목포시',
            '무안군',
            '보성군',
            '순천시',
            '신안군',
            '여수시',
            '영광군',
            '영암군',
            '완도군',
            '장성군',
            '장흥군',
            '진도군',
            '함평군',
            '해남군',
            '화순군',
        ],
        gyeongbuk: [
            '경산시',
            '경주시',
            '고령군',
            '구미시',
            '군위군',
            '김천시',
            '문경시',
            '봉화군',
            '상주시',
            '성주군',
            '안동시',
            '영덕군',
            '영양군',
            '영주시',
            '영천시',
            '예천군',
            '울릉군',
            '울진군',
            '의성군',
            '청도군',
            '청송군',
            '칠곡군',
            '포항시',
        ],
        gyeongnam: [
            '거제시',
            '거창군',
            '고성군',
            '김해시',
            '남해군',
            '밀양시',
            '사천시',
            '산청군',
            '양산시',
            '의령군',
            '진주시',
            '창녕군',
            '창원시',
            '통영시',
            '하동군',
            '함안군',
            '함양군',
            '합천군',
        ],
        jeju: ['서귀포시', '제주시'],
    };

    if (region1Value && regionMap[region1Value]) {
        region2Select.disabled = false;
        regionMap[region1Value].forEach((area) => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            region2Select.appendChild(option);
        });
    }
}

// 제목 자동 생성
function generateTitle() {
    const titleInput = document.getElementById('documentTitle');
    if (!titleInput) return;

    const region1 = document.getElementById('uploadRegion1');
    const region2 = document.getElementById('uploadRegion2');
    const productBtn = document.querySelector('.upload-product-types .upload-type-btn.active');
    const supplyBtn = document.querySelector('.upload-supply-types .upload-type-btn.active');

    const titleParts = [];

    // 지역1 추가
    if (region1 && region1.value) {
        const region1Text = region1.options[region1.selectedIndex].text;
        titleParts.push(region1Text);
    }

    // 지역2 추가
    if (region2 && region2.value) {
        titleParts.push(region2.value);
    }

    // 상품유형 추가
    if (productBtn) {
        const productName =
            productBtn.getAttribute('data-name') || productBtn.querySelector('span').textContent;
        titleParts.push(productName);
    }

    // 공급유형 추가
    if (supplyBtn) {
        const supplyName =
            supplyBtn.getAttribute('data-name') || supplyBtn.querySelector('span').textContent;
        titleParts.push(supplyName);
    }

    // 마지막에 "시장조사서" 추가
    if (titleParts.length > 0) {
        titleParts.push('시장조사서');
        titleInput.value = titleParts.join(' ');
    }
}

// 다운로드 포인트 계산 (기준 7,000P)
function calculateDownloadPoints(pageCount, createDateStr) {
    const basePoints = 7000; // 기준 포인트 7,000P

    // 페이지 수를 숫자로 변환
    const pages = typeof pageCount === 'string' ? parseInt(pageCount) : pageCount;

    // 페이지 지수
    let pageMultiplier = 1.0;
    if (pages >= 40) {
        pageMultiplier = 1.2; // 120%
    } else if (pages >= 30) {
        pageMultiplier = 1.1; // 110%
    } else if (pages >= 20) {
        pageMultiplier = 1.0; // 100%
    } else if (pages >= 10) {
        pageMultiplier = 0.9; // 90%
    } else {
        pageMultiplier = 0.6; // 60%
    }

    // 날짜 파싱 (예: "자료생성일: 2024.01.15" 또는 "2024.01.15" 또는 "2024년 1월 15일")
    let dateStr = createDateStr.replace('자료생성일: ', '').trim();

    // "년", "월", "일" 제거
    dateStr = dateStr.replace(/년/g, '.').replace(/월/g, '.').replace(/일/g, '').trim();

    const dateParts = dateStr.split('.');

    let createDate;
    if (dateParts.length === 3) {
        // "2024.01.15" 형식
        const [year, month, day] = dateParts;
        createDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
        // 다른 형식 시도
        createDate = new Date(dateStr.replace(/\./g, '-'));
    }

    // Invalid Date 체크
    if (isNaN(createDate.getTime())) {
        console.error('Invalid date format:', createDateStr);
        // 날짜 파싱 실패 시 1년 이내로 가정 (기본 포인트)
        return Math.round((basePoints * pageMultiplier * 1.0) / 10) * 10;
    }

    const today = new Date();
    const daysDiff = Math.floor((today - createDate) / (1000 * 60 * 60 * 24));

    // 최신성 지수
    let freshnessMultiplier = 0;
    if (daysDiff <= 180) {
        // 6개월 이내
        freshnessMultiplier = 1.2; // 120%
    } else if (daysDiff <= 365) {
        // 1년 이내
        freshnessMultiplier = 1.0; // 100%
    } else if (daysDiff <= 730) {
        // 2년 이내
        freshnessMultiplier = 0.7; // 70%
    } else {
        freshnessMultiplier = 0.5; // 2년 초과는 50% (0이 아닌 최소값 보장)
    }

    // 최종 포인트 계산 후 10단위 반올림
    const totalPoints = basePoints * pageMultiplier * freshnessMultiplier;
    return Math.round(totalPoints / 10) * 10;
}

// 업로드 포인트 계산 (기준 3,000P)
function calculatePoints() {
    const pointsValue = document.getElementById('pointsValue');
    let totalPoints = 0;

    if (!uploadedFile) {
        if (pointsValue) pointsValue.textContent = '+0P';
        return;
    }

    const fileData = uploadedFile;
        const pageCount = fileData.pages || 0; // 페이지 수
        const basePoints = 3000; // 기본 포인트 3000P
        let filePoints = 0;

        // 페이지 지수
        let pageMultiplier = 0;
        if (pageCount >= 40) {
            pageMultiplier = 1.2; // 120%
        } else if (pageCount >= 30) {
            pageMultiplier = 1.1; // 110%
        } else if (pageCount >= 20) {
            pageMultiplier = 1.0; // 100%
        } else if (pageCount >= 10) {
            pageMultiplier = 0.9; // 90%
        } else {
            pageMultiplier = 0.6; // 60%
        }

        // 최신성 지수 (연/월/일 선택 기준)
        let freshnessMultiplier = 0;
        let daysDiff = null;
        let hasOverTwoYears = false;

        if (fileData.year && fileData.month && fileData.day) {
            const selectedDate = new Date(fileData.year, fileData.month - 1, fileData.day);
            const today = new Date();
            daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 180) {
                // 6개월 이내
                freshnessMultiplier = 1.2; // 120%
            } else if (daysDiff <= 365) {
                // 1년 이내
                freshnessMultiplier = 1.0; // 100%
            } else if (daysDiff <= 730) {
                // 2년 이내
                freshnessMultiplier = 0.7; // 70%
            } else {
                freshnessMultiplier = 0; // 2년 초과는 0P
                hasOverTwoYears = true;
            }
        }

        // 파일 포인트 계산 (기본 3000P × 최신성 지수 × 페이지 지수)
        filePoints = basePoints * pageMultiplier * freshnessMultiplier;
        
    // 최종 포인트를 10단위로 반올림
    console.log('반올림 전 포인트:', filePoints);
    totalPoints = Math.round(filePoints / 10) * 10;
    console.log('반올림 후 포인트:', totalPoints);

    // 포인트 표시
    const pointResult = document.getElementById('pointsValue');
    if (pointResult) {
        pointResult.textContent = `+${totalPoints.toLocaleString()}P`;
    }

    // 체크표시 업데이트
    highlightPointFactors(pageCount, daysDiff, pageMultiplier, freshnessMultiplier, totalPoints);

    // 2년 초과 시 경고 메시지 표시
    if (hasOverTwoYears) {
        showToastMessage('24개월이 경과된 자료는 업로드할 수 없습니다.', 'error');
    }

    // 모든 필수 필드가 입력되었는지 확인하고 중복검사 실행
    checkAllFieldsAndDuplicate();
}

// 업로드 버튼 상태 업데이트 함수 (분리)
function updateUploadButton(isDuplicate = false) {
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    if (!uploadSubmitBtn) return;

    const fileData = uploadedFile || {};
    const hasDate = fileData.year && fileData.month && fileData.day;
    const region1 = document.getElementById('uploadRegion1')?.value;
    const region2 = document.getElementById('uploadRegion2')?.value;
    const productActive = document.querySelector('.upload-product-types .upload-type-btn.active');
    const supplyActive = document.querySelector('.upload-supply-types .upload-type-btn.active');
    
    // 2년 초과 여부 재계산
    let hasOverTwoYears = false;
    if (hasDate) {
        const fileDate = new Date(fileData.year, fileData.month - 1, fileData.day);
        const today = new Date();
        const daysDiff = Math.floor((today - fileDate) / (1000 * 60 * 60 * 24));
        hasOverTwoYears = daysDiff > 730;
    }
    
    console.log('업로드 버튼 체크:', {
        uploadedFile: !!uploadedFile,
        hasDate,
        hasOverTwoYears,
        region1,
        region2,
        productActive: !!productActive,
        supplyActive: !!supplyActive,
        isDuplicate
    });
    
    const hasAllRequiredFields = uploadedFile && 
                                hasDate && 
                                !hasOverTwoYears &&
                                !isDuplicate &&
                                region1 &&
                                region2 &&
                                productActive &&
                                supplyActive;
                                
    if (hasAllRequiredFields) {
        uploadSubmitBtn.style.display = 'block';
        uploadSubmitBtn.disabled = false;
    } else {
        uploadSubmitBtn.style.display = 'none';
        uploadSubmitBtn.disabled = true;
    }
}

// 포인트 요소 강조 표시 함수
function highlightPointFactors(
    pageCount,
    daysDiff,
    pageMultiplier,
    freshnessMultiplier,
    totalPoints
) {
    // 모든 테이블 행의 강조 제거 및 원본 텍스트 복원
    const fresh6m = document.getElementById('fresh-6m-value');
    const fresh1y = document.getElementById('fresh-1y-value');
    const fresh2y = document.getElementById('fresh-2y-value');
    const freshOver2y = document.getElementById('fresh-over2y-value');
    const page40 = document.getElementById('page-40-value');
    const page30 = document.getElementById('page-30-value');
    const page20 = document.getElementById('page-20-value');
    const page10 = document.getElementById('page-10-value');
    const pageUnder10 = document.getElementById('page-under10-value');

    // 초기화
    if (fresh6m) fresh6m.innerHTML = '120%';
    if (fresh1y) fresh1y.innerHTML = '100%';
    if (fresh2y) fresh2y.innerHTML = '70%';
    if (freshOver2y) freshOver2y.innerHTML = '업로드 불가';
    if (page40) page40.innerHTML = '120%';
    if (page30) page30.innerHTML = '110%';
    if (page20) page20.innerHTML = '100%';
    if (page10) page10.innerHTML = '90%';
    if (pageUnder10) pageUnder10.innerHTML = '60%';

    // 모든 행 스타일 초기화
    document.querySelectorAll('#pointDetailsDropdown table tr').forEach((row) => {
        row.style.backgroundColor = '';
        row.style.fontWeight = '';
    });

    // 최신성 지수 강조
    if (freshnessMultiplier === 1.2 && fresh6m) {
        // 6개월 이내 - 120%
        fresh6m.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 120%';
        fresh6m.parentElement.style.backgroundColor = '#fef3c7';
    } else if (freshnessMultiplier === 1.0 && daysDiff <= 365 && fresh1y) {
        // 1년 이내 - 100%
        fresh1y.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 100%';
        fresh1y.parentElement.style.backgroundColor = '#fef3c7';
    } else if (freshnessMultiplier === 0.7 && fresh2y) {
        // 2년 이내 - 70%
        fresh2y.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 70%';
        fresh2y.parentElement.style.backgroundColor = '#fef3c7';
    } else if (freshnessMultiplier === 0 && freshOver2y) {
        // 2년 초과 - 업로드 불가
        freshOver2y.innerHTML =
            '<span style="color: #dc2626; font-weight: bold;">✓</span> 업로드 불가';
        freshOver2y.parentElement.style.backgroundColor = '#fee2e2';
    }

    // 페이지 지수 강조
    if (pageMultiplier === 1.2 && page40) {
        // 40페이지 이상 - 120%
        page40.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 120%';
        page40.parentElement.style.backgroundColor = '#fef3c7';
    } else if (pageMultiplier === 1.1 && page30) {
        // 30-39페이지 - 110%
        page30.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 110%';
        page30.parentElement.style.backgroundColor = '#fef3c7';
    } else if (pageMultiplier === 1.0 && page20) {
        // 20-29페이지 - 100%
        page20.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 100%';
        page20.parentElement.style.backgroundColor = '#fef3c7';
    } else if (pageMultiplier === 0.9 && page10) {
        // 10-19페이지 - 90%
        page10.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 90%';
        page10.parentElement.style.backgroundColor = '#fef3c7';
    } else if (pageMultiplier === 0.6 && pageUnder10) {
        // 10페이지 미만 - 60%
        pageUnder10.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 60%';
        pageUnder10.parentElement.style.backgroundColor = '#fef3c7';
    }
}

// 중복검사 키 생성 함수
function generateDuplicateKey() {
    const region1 = document.getElementById('uploadRegion1').value;
    const region2 = document.getElementById('uploadRegion2').value;
    const productBtn = document.querySelector('.upload-product-types .upload-type-btn.active');
    const supplyBtn = document.querySelector('.upload-supply-types .upload-type-btn.active');

    // uploadedFile이 있는지 확인 (단일 파일로 변경됨)
    if (!uploadedFile || !uploadedFile.file) return null;

    // uploadedFile에서 날짜 정보 가져오기
    const fileYear = uploadedFile.year;
    const fileMonth = uploadedFile.month;
    const fileDay = uploadedFile.day;

    const fileSize = Math.round(uploadedFile.file.size / (1024 * 1024)); // MB 단위로 반올림
    const productType = productBtn ? productBtn.dataset.type : null;
    const supplyType = supplyBtn ? supplyBtn.dataset.type : null;

    // 모든 필수 정보가 있는지 확인
    if (
        !region1 ||
        !region2 ||
        !fileYear ||
        !fileMonth ||
        !fileDay ||
        !productType ||
        !supplyType
    ) {
        return null;
    }

    // 중복 키 생성: 지역1_지역2_날짜_파일크기_상품유형_공급유형
    const monthStr = String(fileMonth).padStart(2, '0');
    const dayStr = String(fileDay).padStart(2, '0');
    return `${region1}_${region2}_${fileYear}-${monthStr}-${dayStr}_${fileSize}MB_${productType}_${supplyType}`;
}

// 모든 필드 확인 및 중복검사 실행
function checkAllFieldsAndDuplicate() {
    // 중복 키 생성 시도
    const duplicateKey = generateDuplicateKey();

    // 모든 필수 필드가 입력되지 않았으면 중복검사 알림 숨기기
    const duplicateCheckInfo = document.getElementById('duplicateCheckInfo');
    if (!duplicateKey) {
        if (duplicateCheckInfo) {
            duplicateCheckInfo.style.display = 'none';
        }
        updateUploadButton(); // 바로 업로드 버튼 업데이트
        return;
    }

    // 모든 필수 필드가 입력되었으면 중복검사 실행
    checkDuplicateFile(duplicateKey, (isDuplicate) => {
        // 중복 검사 완료 후 업로드 버튼 업데이트
        updateUploadButton(isDuplicate);
    });
}

// 중복 검사 함수 (콜백 기반으로 변경)
function checkDuplicateFile(duplicateKey, callback) {
    if (!duplicateKey) {
        if (callback) callback(false);
        return;
    }

    // 새로운 위치의 중복 검사 알림 표시 영역
    const duplicateCheckInfo = document.getElementById('duplicateCheckInfo');
    const duplicateCheckMessage = document.getElementById('duplicateCheckMessage');

    // uploadedFilesRegistry가 없으면 생성
    if (typeof uploadedFilesRegistry === 'undefined') {
        window.uploadedFilesRegistry = new Set();
    }

    // 실제 중복 여부 확인
    const isDuplicate = uploadedFilesRegistry.has(duplicateKey);

    // 중복 알림 표시
    if (duplicateCheckInfo && duplicateCheckMessage) {
        duplicateCheckInfo.style.display = 'block';

        if (isDuplicate) {
            duplicateCheckInfo.style.background = '#fef2f2';
            duplicateCheckInfo.style.borderColor = '#fecaca';
            duplicateCheckMessage.innerHTML =
                '<i class="fas fa-exclamation-triangle" style="color: #dc2626; margin-right: 6px; font-size: 12px;"></i><span style="color: #dc2626; font-weight: 500;">동일한 문서가 이미 업로드되었습니다</span>';
        } else {
            duplicateCheckInfo.style.background = '#f0fdf4';
            duplicateCheckInfo.style.borderColor = '#86efac';
            duplicateCheckMessage.innerHTML =
                '<i class="fas fa-check-circle" style="color: #16a34a; margin-right: 6px; font-size: 12px;"></i><span style="color: #16a34a; font-weight: 500;">중복되지 않은 새 문서입니다</span>';
        }
    }

    // UI 업데이트 완료 후 콜백 실행
    setTimeout(() => {
        if (callback) callback(isDuplicate);
    }, 100); // 100ms 대기로 UI 업데이트 보장

    return isDuplicate;
}

// 포인트 플라잉 애니메이션
function animatePointsEarned(points) {
    const startElement = document.getElementById('pointsValue');
    const targetElement = document.querySelector('.user-points');

    if (!startElement || !targetElement) return;

    // 시작 위치 계산
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // 플라잉 포인트 요소 생성
    const flyingPoints = document.createElement('div');
    flyingPoints.className = 'flying-points';
    flyingPoints.textContent = `+${points.toLocaleString()}P`;
    flyingPoints.style.position = 'fixed';
    flyingPoints.style.left = `${startRect.left + startRect.width / 2}px`;
    flyingPoints.style.top = `${startRect.top}px`;
    flyingPoints.style.transform = 'translateX(-50%)';
    document.body.appendChild(flyingPoints);

    // 애니메이션 실행
    setTimeout(() => {
        flyingPoints.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        flyingPoints.style.left = `${targetRect.left + targetRect.width / 2}px`;
        flyingPoints.style.top = `${targetRect.top}px`;
        flyingPoints.style.opacity = '0';
        flyingPoints.style.transform = 'translateX(-50%) scale(0.3)';
    }, 50);

    // 애니메이션 완료 후 제거
    setTimeout(() => {
        flyingPoints.remove();
    }, 1600);
}

// 포인트 카운팅 애니메이션
function animatePointsCounter(startValue, endValue, duration = 1500) {
    const element = document.querySelector('.user-points');
    if (!element) return;

    const startTime = Date.now();
    const difference = endValue - startValue;

    // 포인트 증가 하이라이트
    element.classList.add('points-increasing');

    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutQuart 이징 함수
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + difference * easeProgress);

        element.textContent = `${currentValue.toLocaleString()}P`;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = `${endValue.toLocaleString()}P`;
            // 애니메이션 완료 후 하이라이트 제거
            setTimeout(() => {
                element.classList.remove('points-increasing');
            }, 300);
        }
    }

    requestAnimationFrame(updateCounter);
}

// 토스트 메시지 표시
function showToastMessage(message, type = 'success') {
    // 기존 토스트가 있으면 제거
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            ${
                type === 'success'
                    ? '<i class="fas fa-check-circle"></i>'
                    : '<i class="fas fa-exclamation-circle"></i>'
            }
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    // 애니메이션 시작
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // 3초 후 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 전역으로 토스트 함수 등록
window.showToastMessage = showToastMessage;
window.showSuccessMessage = function(message, duration) {
    showToastMessage(message, 'success');
};
window.showErrorMessage = function(message, duration) {
    showToastMessage(message, 'error');
};
window.showInfoMessage = function(message, duration) {
    showToastMessage(message, 'info');
};
window.showWarningMessage = function(message, duration) {
    showToastMessage(message, 'warning');
};

// ===========================================
// 글로벌 포인트 변동 시스템
// ===========================================

// 포인트 획득 함수 (증가)
async function earnPoints(amount, message = '포인트를 획득했습니다!', sourceElement = null, type = 'earn', relatedId = null) {
    if (amount <= 0) return;

    try {
        // PointService 초기화 확인
        if (typeof PointService === 'undefined') {
            console.warn('PointService가 로드되지 않았습니다. 포인트 적립을 건너뜁니다.');
            return;
        }
        
        if (!pointService) {
            pointService = new PointService();
            await pointService.init();
        }

        const currentUser = await loadCurrentUser();
        if (!currentUser) {
            console.warn('포인트 적립 실패: 로그인되지 않은 상태');
            return;
        }

        // 1. 플라잉 애니메이션 (sourceElement가 있으면 그 위치에서 시작)
        if (sourceElement) {
            animatePointsEarnedFromElement(amount, sourceElement);
        } else {
            animatePointsEarned(amount);
        }

        // 2. DB에서 포인트 적립
        const result = await pointService.earnPoints(
            currentUser.id, 
            amount, 
            type, 
            message, 
            relatedId
        );

        if (result.success) {
            // 3. 카운팅 애니메이션 (0.5초 후 시작)
            setTimeout(async () => {
                const currentPoints = currentUser?.points || 0;
                animatePointsCounter(currentPoints, result.newPoints);
                await updateUserPoints();
            }, 500);

            // 4. 토스트 메시지
            showToastMessage(`${message} +${amount.toLocaleString()}P`, 'success');
            console.log(`✅ 포인트 적립 성공: +${amount}P (총 ${result.newPoints}P)`);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ 포인트 적립 실패:', error);
        showToastMessage('포인트 적립에 실패했습니다.', 'error');
    }
}

// 포인트 사용 함수 (감소)
async function spendPoints(amount, message = '포인트를 사용했습니다.', targetElement = null, type = 'spend', relatedId = null) {
    if (amount <= 0) return;

    try {
        // PointService 초기화 확인
        if (typeof PointService === 'undefined') {
            console.warn('PointService가 로드되지 않았습니다. 포인트 차감을 건너뜁니다.');
            return false;
        }
        
        if (!pointService) {
            pointService = new PointService();
            await pointService.init();
        }

        const currentUser = await loadCurrentUser();
        if (!currentUser) {
            console.warn('포인트 차감 실패: 로그인되지 않은 상태');
            return false;
        }

        // 1. 사용 애니메이션 (빨간색으로 아래로 떨어지는 효과)
        if (targetElement) {
            animatePointsSpentToElement(amount, targetElement);
        } else {
            animatePointsSpent(amount);
        }

        // 2. DB에서 포인트 차감
        const result = await pointService.spendPoints(
            currentUser.id, 
            amount, 
            type, 
            message, 
            relatedId
        );

        if (result.success) {
            // 3. 카운팅 애니메이션 (즉시 시작)
            const currentPoints = currentUser?.points || 0;
            animatePointsCounter(currentPoints, result.newPoints, 1000, 'decrease');
            await updateUserPoints();

            // 4. 토스트 메시지
            showToastMessage(`${message} -${amount.toLocaleString()}P`, 'info');
            console.log(`✅ 포인트 차감 성공: -${amount}P (남은 포인트: ${result.newPoints}P)`);
            return true;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ 포인트 차감 실패:', error);
        if (error.message.includes('부족')) {
            showToastMessage('포인트가 부족합니다.', 'error');
        } else {
            showToastMessage('포인트 차감에 실패했습니다.', 'error');
        }
        return false;
    }
}

// 포인트 사용 애니메이션 (감소)
function animatePointsSpent(points) {
    const startElement = document.querySelector('.user-points');
    if (!startElement) return;

    const startRect = startElement.getBoundingClientRect();

    // 떨어지는 포인트 요소 생성
    const fallingPoints = document.createElement('div');
    fallingPoints.className = 'falling-points';
    fallingPoints.textContent = `-${points.toLocaleString()}P`;
    fallingPoints.style.position = 'fixed';
    fallingPoints.style.left = `${startRect.left + startRect.width / 2}px`;
    fallingPoints.style.top = `${startRect.top + startRect.height}px`;
    fallingPoints.style.transform = 'translateX(-50%)';
    fallingPoints.style.color = '#dc2626';
    fallingPoints.style.fontSize = '20px';
    fallingPoints.style.fontWeight = 'bold';
    fallingPoints.style.zIndex = '10000';
    fallingPoints.style.pointerEvents = 'none';
    document.body.appendChild(fallingPoints);

    // 애니메이션 실행
    setTimeout(() => {
        fallingPoints.style.transition = 'all 1s cubic-bezier(0.4, 0, 1, 1)';
        fallingPoints.style.top = `${startRect.top + 100}px`;
        fallingPoints.style.opacity = '0';
        fallingPoints.style.transform = 'translateX(-50%) scale(0.5)';
    }, 50);

    // 애니메이션 완료 후 제거
    setTimeout(() => {
        fallingPoints.remove();
    }, 1100);
}

// 특정 요소에서 시작하는 포인트 획득 애니메이션
function animatePointsEarnedFromElement(points, element) {
    const targetElement = document.querySelector('.user-points');
    if (!element || !targetElement) {
        animatePointsEarned(points);
        return;
    }

    const startRect = element.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const flyingPoints = document.createElement('div');
    flyingPoints.className = 'flying-points';
    flyingPoints.textContent = `+${points.toLocaleString()}P`;
    flyingPoints.style.position = 'fixed';
    flyingPoints.style.left = `${startRect.left + startRect.width / 2}px`;
    flyingPoints.style.top = `${startRect.top + startRect.height / 2}px`;
    flyingPoints.style.transform = 'translateX(-50%) translateY(-50%)';
    document.body.appendChild(flyingPoints);

    setTimeout(() => {
        flyingPoints.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        flyingPoints.style.left = `${targetRect.left + targetRect.width / 2}px`;
        flyingPoints.style.top = `${targetRect.top}px`;
        flyingPoints.style.opacity = '0';
        flyingPoints.style.transform = 'translateX(-50%) scale(0.3)';
    }, 50);

    setTimeout(() => {
        flyingPoints.remove();
    }, 1600);
}

// 특정 요소로 향하는 포인트 사용 애니메이션
function animatePointsSpentToElement(points, element) {
    const startElement = document.querySelector('.user-points');
    if (!startElement || !element) {
        animatePointsSpent(points);
        return;
    }

    const startRect = startElement.getBoundingClientRect();
    const targetRect = element.getBoundingClientRect();

    const spentPoints = document.createElement('div');
    spentPoints.className = 'spent-points';
    spentPoints.textContent = `-${points.toLocaleString()}P`;
    spentPoints.style.position = 'fixed';
    spentPoints.style.left = `${startRect.left + startRect.width / 2}px`;
    spentPoints.style.top = `${startRect.top}px`;
    spentPoints.style.transform = 'translateX(-50%)';
    spentPoints.style.color = '#dc2626';
    spentPoints.style.fontSize = '20px';
    spentPoints.style.fontWeight = 'bold';
    spentPoints.style.zIndex = '10000';
    spentPoints.style.pointerEvents = 'none';
    document.body.appendChild(spentPoints);

    setTimeout(() => {
        spentPoints.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.6, 1)';
        spentPoints.style.left = `${targetRect.left + targetRect.width / 2}px`;
        spentPoints.style.top = `${targetRect.top + targetRect.height / 2}px`;
        spentPoints.style.opacity = '0';
        spentPoints.style.transform = 'translateX(-50%) translateY(-50%) scale(0.3)';
    }, 50);

    setTimeout(() => {
        spentPoints.remove();
    }, 1100);
}

// 폼 리셋
function resetUploadForm() {
    const form = document.querySelector('.simple-upload-modal');
    if (!form) return;

    // 파일 초기화
    uploadedFile = null;
    updateFileUI();

    const region1 = document.getElementById('uploadRegion1');
    if (region1) region1.selectedIndex = 0;

    const region2 = document.getElementById('uploadRegion2');
    if (region2) {
        region2.innerHTML = '<option value="">시/군/구 선택</option>';
        region2.disabled = true;
    }

    // 날짜 선택 초기화
    const fileYear = document.getElementById('fileYear');
    const fileMonth = document.getElementById('fileMonth');
    const fileDay = document.getElementById('fileDay');
    if (fileYear) fileYear.selectedIndex = 0;
    if (fileMonth) fileMonth.selectedIndex = 0;
    if (fileDay) fileDay.selectedIndex = 0;

    // 파일 정보 숨기기
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) fileInfo.classList.remove('show');

    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) uploadZone.classList.remove('has-file');

    // 썸네일 숨기기
    const fileThumbnail = document.getElementById('fileThumbnail');
    const fileIconDiv = document.getElementById('fileIconDiv');
    if (fileThumbnail) fileThumbnail.style.display = 'none';
    if (fileIconDiv) fileIconDiv.style.display = 'block';

    // 버튼 초기화
    document.querySelectorAll('.upload-type-btn').forEach((btn) => {
        btn.classList.remove('active');
    });

    // 포인트 초기화
    const pointsValue = document.getElementById('pointsValue');
    if (pointsValue) pointsValue.textContent = '+0P';

    // 업로드 버튼 비활성화 및 숨기기
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    if (uploadSubmitBtn) {
        uploadSubmitBtn.disabled = true;
        uploadSubmitBtn.style.display = 'none';
    }

    // 중복검사 알림 숨기기
    const duplicateCheckInfo = document.getElementById('duplicateCheckInfo');
    if (duplicateCheckInfo) {
        duplicateCheckInfo.style.display = 'none';
    }

    // 포인트 팩터 표시 초기화
    resetPointFactorDisplay();
}

// 포인트 팩터 표시 초기화
function resetPointFactorDisplay() {
    // 최신성 지수 초기화
    const freshnessRows = document.querySelectorAll('#freshnessTable tr');
    freshnessRows.forEach((row) => {
        const checkCell = row.querySelector('td:last-child');
        if (checkCell) {
            checkCell.innerHTML = '';
            row.classList.remove('highlighted-row');
        }
    });

    // 파일크기 지수 초기화
    const fileSizeRows = document.querySelectorAll('#fileSizeTable tr');
    fileSizeRows.forEach((row) => {
        const checkCell = row.querySelector('td:last-child');
        if (checkCell) {
            checkCell.innerHTML = '';
            row.classList.remove('highlighted-row');
        }
    });
}

// 파일 제거
function removeUploadedFile() {
    // 파일 초기화
    uploadedFile = null;
    
    // UI 업데이트
    updateFileUI();
    
    // 업로드 영역 다시 표시
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
        uploadZone.style.display = 'block';
    }
    
    // 파일 입력 초기화
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // 포인트 초기화
    const pointsValue = document.getElementById('pointsValue');
    if (pointsValue) {
        pointsValue.textContent = '+0P';
    }
    
    // 중복검사 알림 숨기기
    const duplicateCheckInfo = document.getElementById('duplicateCheckInfo');
    if (duplicateCheckInfo) {
        duplicateCheckInfo.style.display = 'none';
    }
    
    // 업로드 버튼 숨기기
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    if (uploadSubmitBtn) {
        uploadSubmitBtn.style.display = 'none';
        uploadSubmitBtn.disabled = true;
    }
}

// 업로드 제출 (Supabase 연동)
async function submitUpload() {
    const region1 = document.getElementById('uploadRegion1');
    const region2 = document.getElementById('uploadRegion2');
    const productBtn = document.querySelector('.upload-product-types .upload-type-btn.active');
    const supplyBtn = document.querySelector('.upload-supply-types .upload-type-btn.active');
    const modal = document.getElementById('uploadModal');
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');

    // 버튼 비활성화 및 로딩 표시
    if (uploadSubmitBtn) {
        uploadSubmitBtn.disabled = true;
        uploadSubmitBtn.textContent = '업로드 중...';
    }

    try {
        // 1. 유효성 검사
        if (!uploadedFile) {
            throw new Error('파일을 선택해주세요.');
        }

        if (!region1?.value || !region2?.value) {
            throw new Error('지역을 선택해주세요.');
        }

        if (!uploadedFile.year || !uploadedFile.month || !uploadedFile.day) {
            throw new Error('파일의 생성 날짜를 선택해주세요.');
        }
        
        // 2년 초과 확인
        const fileCreatedDate = new Date(uploadedFile.year, uploadedFile.month - 1, uploadedFile.day);
        const currentDate = new Date();
        const daysDiff = Math.floor((currentDate - fileCreatedDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 730) {
            throw new Error('24개월이 경과된 자료는 업로드할 수 없습니다.');
        }

        if (!productBtn || !supplyBtn) {
            throw new Error('상품유형과 공급유형을 모두 선택해주세요.');
        }

        // 2. 메타데이터 수집
        const region1Text = region1.options[region1.selectedIndex].text;
        const region2Text = region2.value;
        const productType = productBtn.getAttribute('data-type');
        const supplyType = supplyBtn.getAttribute('data-type');
        const productName = productBtn.getAttribute('data-name') || productBtn.querySelector('span').textContent;
        const supplyName = supplyBtn.getAttribute('data-name') || supplyBtn.querySelector('span').textContent;
        
        // 제목 생성
        const title = `${region1Text} ${region2Text} ${productName} ${supplyName} 시장조사서`;
        const description = `${region1Text} ${region2Text} 지역의 ${productName} ${supplyName} 시장조사 자료입니다.`;
        
        // 3. 포인트 계산
        const pageCount = uploadedFile.pages || 25;
        const basePoints = 3000;
        let pageMultiplier = 1.0;
        let freshnessMultiplier = 1.0;
        
        // 페이지 지수
        if (pageCount >= 40) pageMultiplier = 1.2;
        else if (pageCount >= 30) pageMultiplier = 1.1;
        else if (pageCount >= 20) pageMultiplier = 1.0;
        else if (pageCount >= 10) pageMultiplier = 0.9;
        else pageMultiplier = 0.6;
        
        // 최신성 지수
        if (daysDiff <= 180) freshnessMultiplier = 1.2;
        else if (daysDiff <= 365) freshnessMultiplier = 1.0;
        else if (daysDiff <= 730) freshnessMultiplier = 0.7;
        
        const uploadPoints = Math.round((basePoints * pageMultiplier * freshnessMultiplier) / 10) * 10;
        
        // 4. Supabase 업로드 시도
        let uploadResult = null;
        let useSupabase = false;
        
        if (marketResearchSupabase) {
            try {
                // 사용자 ID 개선
                const currentUser = window.WaveSupabase?.currentUser;
                const userId = currentUser?.id || `temp_user_${Date.now()}`;
                
                console.log('👤 두 번째 업로드 경로 - 사용자 ID:', userId);
                
                const metadata = {
                    userId: userId,
                    title: title,
                    description: description,
                    region1: region1.value,
                    region2: region2Text,
                    productType: productType,
                    supplyType: supplyType,
                    fileCreatedDate: `${uploadedFile.year}-${String(uploadedFile.month).padStart(2, '0')}-${String(uploadedFile.day).padStart(2, '0')}`,
                    pageCount: pageCount
                };
                
                uploadResult = await marketResearchSupabase.uploadFile(uploadedFile.file, metadata);
                useSupabase = true;
                
                console.log('✅ Supabase 업로드 성공:', uploadResult);
                
                // Supabase에서 문서 목록 다시 로드
                await loadDocumentsFromSupabase();
                
                // 현재 필터 적용된 문서들로 다시 렌더링
                applyFilters();
                
            } catch (supabaseError) {
                console.warn('⚠️ Supabase 업로드 실패:', supabaseError.message);
                console.log('💡 로컬 저장으로 대체합니다.');
                useSupabase = false;
            }
        }
        
        // 5. 로컬 저장 (Supabase 실패 시 또는 비활성화 시)
        if (!useSupabase) {
            // 중복 검사
            if (typeof uploadedFilesRegistry === 'undefined') {
                window.uploadedFilesRegistry = new Set();
            }
            
            const monthStr = String(uploadedFile.month).padStart(2, '0');
            const dayStr = String(uploadedFile.day).padStart(2, '0');
            const duplicateKey = `${region1.value}_${region2Text}_${uploadedFile.year}-${monthStr}-${dayStr}_${Math.round(uploadedFile.file.size / (1024 * 1024))}MB_${productType}_${supplyType}`;
            
            if (uploadedFilesRegistry.has(duplicateKey)) {
                throw new Error('동일한 문서가 이미 업로드되었습니다.');
            }
            
            // 로컬 저장
            uploadedFilesRegistry.add(duplicateKey);
        }
        
        // 6. UI 업데이트
        const newDoc = {
            id: useSupabase ? uploadResult.id : Date.now(),
            title: title,
            description: description,
            type: productType,
            region: region1.value,
            district: region2Text,
            location: `${region1Text} ${region2Text}`,
            date: `${uploadedFile.year}.${String(uploadedFile.month).padStart(2, '0')}.${String(uploadedFile.day).padStart(2, '0')}`,
            createDate: `자료생성일: ${uploadedFile.year}년 ${uploadedFile.month}월 ${uploadedFile.day}일`,
            fileSize: (uploadedFile.file.size / (1024 * 1024)).toFixed(1) + ' MB',
            fileType: uploadedFile.file.name.split('.').pop().toUpperCase(),
            pages: pageCount,
            uploadPoints: uploadPoints,
            points: Math.round(uploadPoints * 2.3), // 다운로드 포인트 (업로드 포인트의 2.3배)
            supplyType: supplyName,
            isPremium: uploadPoints >= 3000,
            keywords: [],
            thumbnail: useSupabase && uploadResult?.thumbnailUrl ? 
                uploadResult.thumbnailUrl : 
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%236b7280" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
            author: '익명', // TODO: 실제 사용자 이름으로 교체
            downloads: 0,
            views: 0,
            isSupabase: useSupabase,
            fileUrl: useSupabase ? uploadResult?.fileUrl : null
        };
        
        // 문서 목록에 추가
        currentDocuments.unshift(newDoc);
        
        // 화면 갱신
        renderDocuments(currentDocuments);
        updateResultCount(currentDocuments.length);
        
        // 미리보기 모달 이벤트 재초기화
        setTimeout(() => {
            initializePreviewModal();
        }, 100);
        
        // 포인트 획득 처리
        const uploadButton = document.querySelector('.upload-btn') || uploadSubmitBtn;
        earnPoints(uploadPoints, `문서가 성공적으로 업로드되었습니다!`, uploadButton);
        
        // 성공 메시지
        const storageType = useSupabase ? 'Supabase' : '로컬';
        showToastMessage(`업로드가 완료되었습니다! (${storageType} 저장) +${uploadPoints.toLocaleString()}P`, 'success');
        
        // Supabase에서 최신 데이터 다시 로드 (동기화)
        if (useSupabase) {
            console.log('🔄 업로드 완료 후 Supabase 데이터 동기화...');
            try {
                await loadDocumentsFromSupabase();
                console.log('✅ 업로드 후 데이터 동기화 완료');
            } catch (syncError) {
                console.warn('⚠️ 업로드 후 동기화 실패:', syncError);
                // 동기화 실패해도 업로드는 성공적으로 완료됨
            }
        }
        
        // 모달 닫기
        setTimeout(() => {
            if (modal) modal.classList.remove('active');
            resetUploadForm();
        }, 1000);
        
    } catch (error) {
        console.error('❌ 업로드 실패:', error);
        showToastMessage(`업로드 중 오류가 발생했습니다: ${error.message}`, 'error');
        
    } finally {
        // 버튼 상태 복원
        if (uploadSubmitBtn) {
            uploadSubmitBtn.disabled = false;
            uploadSubmitBtn.textContent = '업로드 완료';
        }
    }
}

// ===========================================
// 미니멀 미리보기 모달 기능
// ===========================================

let currentPreviewIndex = -1;
let currentFilteredDocuments = [];

// 미리보기 열기
function openPreview(docId) {
    // 현재 필터링된 문서 목록 가져오기
    currentFilteredDocuments = filterDocuments();
    
    // market-research.js 내부 변수 업데이트 (네비게이션용)
    currentFilteredDocs = currentFilteredDocuments;

    // 선택한 문서의 인덱스 찾기
    currentPreviewIndex = currentFilteredDocuments.findIndex((doc) => doc.id === docId);
    currentDocIndex = currentPreviewIndex;

    if (currentPreviewIndex === -1) return;

    console.log(
        `문서 열기 - ID: ${docId}, 인덱스: ${currentPreviewIndex}, 전체: ${currentFilteredDocuments.length}개`
    );

    showMinimalPreview(currentFilteredDocuments[currentPreviewIndex]);
    
    // 네비게이션 버튼 상태 업데이트
    updatePreviewNavButtons();
}

// 미니멀 미리보기 표시
function showMinimalPreview(doc) {
    const modal = document.getElementById('previewModal');
    if (!modal) return;

    // 문서 타입 찾기
    const productType = productTypes.find((t) => t.id === doc.type) || {
        name: '기타',
        color: '#6b7280',
    };

    // 미리보기 정보 업데이트
    // 제목을 2줄로 구성
    const titleEl = document.getElementById('previewTitle');
    if (titleEl) {
        // 제목에서 지역과 상품 정보 추출
        const parts = doc.title.split(' ');
        let location = doc.location || '';
        let product = productType.name;
        let supplyType = doc.supplyType || '민간분양';
        
        titleEl.innerHTML = `
            <span class="title-line1">${location} • ${product}</span>
            <span class="title-line2">${supplyType} 시장조사서</span>
        `;
    }
    
    document.querySelector('.preview-type-badge').textContent = productType.name;
    // 배지 배경색 제거 (그라디언트 CSS로 처리)
    document.getElementById('previewLocation').textContent = doc.location;
    document.getElementById('previewFileSize').textContent = doc.fileSize;
    document.getElementById('previewPages').textContent = doc.pages || 0;
    document.getElementById('previewDate').textContent = doc.createDate.replace('자료생성일: ', '');
    // 포인트를 천 단위 구분 쉼표로 표시
    const pointsEl = document.getElementById('previewPoints');
    if (pointsEl) {
        pointsEl.textContent = doc.points.toLocaleString('ko-KR') + 'P';
    }

    // 포인트 계산 요소 업데이트
    const fileSize = parseFloat(doc.fileSize.replace(/[^0-9.]/g, ''));
    const createDateStr = doc.createDate.replace('자료생성일: ', '').trim();

    // 날짜 파싱
    const dateStr = createDateStr.replace(/년/g, '.').replace(/월/g, '.').replace(/일/g, '').trim();
    const dateParts = dateStr.split('.');
    let daysDiff = 0;

    if (dateParts.length === 3) {
        const [year, month, day] = dateParts;
        const createDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        daysDiff = Math.floor((today - createDate) / (1000 * 60 * 60 * 24));
    }

    // 최신성 지수 표시
    let freshnessText = '';
    let freshnessMultiplier = 0;
    if (daysDiff <= 180) {
        freshnessText = '6개월 이내 (120%)';
        freshnessMultiplier = 1.2;
    } else if (daysDiff <= 365) {
        freshnessText = '1년 이내 (100%)';
        freshnessMultiplier = 1.0;
    } else if (daysDiff <= 730) {
        freshnessText = '2년 이내 (70%)';
        freshnessMultiplier = 0.7;
    } else {
        freshnessText = '2년 초과 (50%)';
        freshnessMultiplier = 0.5;
    }

    // 페이지 지수 표시
    const pages = doc.pages || 0;
    let pageText = '';
    let pageMultiplier = 0;
    if (pages >= 40) {
        pageText = `${pages}페이지 (120%)`;
        pageMultiplier = 1.2;
    } else if (pages >= 30) {
        pageText = `${pages}페이지 (110%)`;
        pageMultiplier = 1.1;
    } else if (pages >= 20) {
        pageText = `${pages}페이지 (100%)`;
        pageMultiplier = 1.0;
    } else if (pages >= 10) {
        pageText = `${pages}페이지 (90%)`;
        pageMultiplier = 0.9;
    } else {
        pageText = `${pages}페이지 (60%)`;
        pageMultiplier = 0.6;
    }

    // 요소 업데이트
    const freshnessElement = document.getElementById('freshnessIndex');
    if (freshnessElement) freshnessElement.textContent = freshnessText;

    const pageElement = document.getElementById('pageIndex');
    if (pageElement) pageElement.textContent = pageText;

    // 계산식 업데이트
    const formulaElement = document.getElementById('pointFormula');
    if (formulaElement) {
        const calculatedPoints =
            Math.round((7000 * freshnessMultiplier * pageMultiplier) / 10) * 10;
        formulaElement.textContent = `기준 7,000P × ${freshnessMultiplier} × ${pageMultiplier} = ${calculatedPoints.toLocaleString('ko-KR')}P`;
    }

    // 카운터 업데이트 - 사용자 요청에 따라 비활성화
    // const counterElement = document.querySelector('.preview-document-counter');
    // if (counterElement) {
    //     counterElement.textContent = `${currentPreviewIndex + 1} / ${currentFilteredDocuments.length}`;
    // }

    // 네비게이션 버튼 상태 업데이트
    const prevBtn = document.querySelector('.preview-nav-prev');
    const nextBtn = document.querySelector('.preview-nav-next');

    // < 버튼: 최신 문서로 이동 (인덱스 감소)
    if (prevBtn) {
        prevBtn.style.display = currentPreviewIndex > 0 ? 'flex' : 'none';
    }
    // > 버튼: 이전 문서로 이동 (인덱스 증가)
    if (nextBtn) {
        nextBtn.style.display =
            currentPreviewIndex < currentFilteredDocuments.length - 1 ? 'flex' : 'none';
    }

    // 모달 표시
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // 체크 표시 함수 호출
    if (typeof highlightActiveRows === 'function') {
        // 약간의 지연을 두어 DOM이 업데이트된 후 호출
        setTimeout(() => {
            highlightActiveRows();
        }, 100);
    }
}

// 인덱스 감소 - 목록에서 위에 있는 문서로 이동
function navigateToPreviousDoc() {
    if (currentPreviewIndex > 0) {
        currentPreviewIndex--;
        showMinimalPreview(currentFilteredDocuments[currentPreviewIndex]);
    }
}

// 인덱스 증가 - 목록에서 아래에 있는 문서로 이동
function navigateToNextDoc() {
    if (currentPreviewIndex < currentFilteredDocuments.length - 1) {
        currentPreviewIndex++;
        showMinimalPreview(currentFilteredDocuments[currentPreviewIndex]);
    }
}

// 미리보기 모달 이벤트 초기화
function initializePreviewModal() {
    // 닫기 버튼
    const closeBtn = document.querySelector('.preview-close');
    if (closeBtn) {
        closeBtn.onclick = function () {
            const modal = document.getElementById('previewModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        };
    }

    // 오버레이 클릭으로 닫기
    const overlay = document.querySelector('.preview-overlay');
    if (overlay) {
        overlay.onclick = function () {
            const modal = document.getElementById('previewModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        };
    }

    // < 버튼 - 최신 문서로 (목록에서 위로 = 인덱스 감소)
    const prevBtn = document.querySelector('.preview-nav-prev');
    if (prevBtn) {
        prevBtn.onclick = function () {
            console.log('< 버튼 클릭 - 최신 문서로 (인덱스 감소)');
            navigateToPreviousDoc();
        };
    }

    // > 버튼 - 이전 문서로 (목록에서 아래로 = 인덱스 증가)
    const nextBtn = document.querySelector('.preview-nav-next');
    if (nextBtn) {
        nextBtn.onclick = function () {
            console.log('> 버튼 클릭 - 이전 문서로 (인덱스 증가)');
            navigateToNextDoc();
        };
    }

    // 다운로드 버튼
    const downloadBtn = document.getElementById('previewDownloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = function () {
            console.log('다운로드 버튼 클릭');
            if (currentPreviewIndex >= 0 && currentFilteredDocuments[currentPreviewIndex]) {
                const doc = currentFilteredDocuments[currentPreviewIndex];
                const points = doc.points || 7000;

                console.log('다운로드 문서:', doc.title, '포인트:', points);

                // handleDirectDownload 함수 호출 (포인트 확인 포함)
                handleDirectDownload(doc.id, points);
            }
        };
    }

    // 장바구니 버튼
    const cartBtn = document.getElementById('previewCartBtn');
    if (cartBtn) {
        cartBtn.onclick = function () {
            console.log('장바구니 버튼 클릭');
            if (currentPreviewIndex >= 0 && currentFilteredDocuments[currentPreviewIndex]) {
                const doc = currentFilteredDocuments[currentPreviewIndex];
                console.log('장바구니 추가 문서:', doc.title);
                showToastMessage(`${doc.title}이(가) 장바구니에 추가되었습니다.`, 'success');
            }
        };
    }

    // 신고 버튼
    const reportBtn = document.getElementById('previewReportBtn');
    if (reportBtn) {
        reportBtn.onclick = function () {
            console.log('신고 버튼 클릭');
            if (currentPreviewIndex >= 0 && currentFilteredDocuments[currentPreviewIndex]) {
                const doc = currentFilteredDocuments[currentPreviewIndex];
                console.log('신고 문서:', doc.title);
                showReportModal(doc.id);
            }
        };
    }

    // 키보드 네비게이션
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('previewModal');
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateToPreviousDoc(); // 위/왼쪽 = 최신 문서로 (인덱스 감소)
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                navigateToNextDoc(); // 아래/오른쪽 = 이전 문서로 (인덱스 증가)
            } else if (e.key === 'Escape') {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        }
    });
}

// ===========================================
// 전역 함수들 (네비게이션 관련)
// ===========================================

// 네비게이션 버튼 상태 업데이트
function updatePreviewNavButtons() {
    const prevBtn = document.getElementById('previewPrev');
    const nextBtn = document.getElementById('previewNext');
    
    if (prevBtn) prevBtn.disabled = currentDocIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentDocIndex >= currentFilteredDocs.length - 1;
    
    // 문서 카운터 업데이트
    const counter = document.getElementById('previewCounter');
    if (counter) {
        counter.textContent = `${currentDocIndex + 1} / ${currentFilteredDocs.length}`;
    }
}

// 미리보기 모달 업데이트 함수
function updatePreviewModal(doc) {
    if (doc) {
        showMinimalPreview(doc);
    }
}

// ===========================================
// 로딩 상태 관리
// ===========================================

// 로딩 상태 표시
function showLoadingState() {
    const totalCount = document.getElementById('totalCount');
    if (totalCount) {
        totalCount.textContent = '로딩 중...';
    }
    
    // 문서 목록 영역에 로딩 메시지 표시
    const documentGrid = document.querySelector('.document-grid');
    if (documentGrid) {
        documentGrid.innerHTML = `
            <div style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 200px; 
                color: #6b7280;
                font-size: 16px;
                grid-column: 1 / -1;
            ">
                <i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>
                데이터를 불러오는 중...
            </div>
        `;
    }
}

// 로딩 상태 숨기기
function hideLoadingState() {
    // 로딩 표시는 실제 데이터로 교체됨
    console.log('✅ 로딩 상태 완료');
}

// ===========================================
// DOM 로드 완료 시 초기화
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Market Research page loaded - 초기화 시작');
    
    // 로딩 상태 표시
    showLoadingState();
    
    try {
        // 1. 기본 변수 초기화 (빈 배열로 시작)
        console.log('📋 currentDocuments 초기화: 빈 배열로 시작');
        currentDocuments = []; // 명시적으로 빈 배열 초기화
        
        // 2. 권한에 따른 UI 업데이트
        await updateUIPermissions();

        // 3. 필터 요소들 확인 및 초기화
        const regionSelectors = document.querySelectorAll('.region-filter .nav-selector');
        const productSelectors = document.querySelectorAll('#productTypeFilters .checkbox-tab');
        const supplySelectors = document.querySelectorAll('#supplyTypeFilters .checkbox-tab');

        console.log('🔍 필터 요소 검색 결과:');
        console.log('  - 지역 선택자:', regionSelectors.length);
        console.log('  - 상품 선택자:', productSelectors.length);
        console.log('  - 공급 선택자:', supplySelectors.length);

        // 4. 초기 상태 설정 - '전체' 탭을 active로
        const allRegionSelector = document.querySelector('.nav-selector[data-value="all"]');
        if (allRegionSelector) {
            allRegionSelector.classList.add('selected', 'active');
        }

        const allProductTab = document.querySelector('.product-filter .checkbox-tab[data-type="all"]');
        if (allProductTab) {
            allProductTab.classList.add('active');
            const input = allProductTab.querySelector('input[type="radio"]');
            if (input) input.checked = true;
        }

        const allSupplyTab = document.querySelector('.supply-filter .checkbox-tab[data-type="all"]');
        if (allSupplyTab) {
            allSupplyTab.classList.add('active');
            const input = allSupplyTab.querySelector('input[type="radio"]');
            if (input) input.checked = true;
        }

        // 5. 필터 초기화
        initializeFilters();

        // 6. 이벤트 리스너 초기화
        initializeEventListeners();

        // 7. 개선된 업로드 모달 기능 초기화
        initEnhancedUploadModal();

        // 8. 미리보기 모달 초기화
        initializePreviewModal();

        // 9. 신고 기능 초기화
        initializeReportEventListeners();

        // 10. 초기 UI 상태 표시 (빈 상태)
        renderDocuments(currentDocuments);
        updateResultCount(0);
        
        // 11. Supabase 초기화 및 데이터 로드 (비동기, 마지막에 실행)
        console.log('🔄 Supabase 데이터 로드 시작...');
        await initializeSupabaseData();
        
        // 12. 로딩 완료 상태로 변경
        hideLoadingState();
        
        // 13. 사용자 포인트 표시
        updateUserPoints();
        
        console.log('✅ Market Research 페이지 초기화 완료');
        console.log('');
        console.log('🛠️ 새로고침 문제 해결 업데이트 적용됨');
        console.log('💡 문제 발생 시 콘솔에서 사용 가능한 명령어:');
        console.log('  - debugMarketResearch.diagnoseProblem() : 문제 진단');
        console.log('  - debugMarketResearch.reinitialize() : 강제 재초기화');
        console.log('  - quickSetup() : Storage 버킷 생성 가이드');
        
    } catch (error) {
        console.error('❌ 페이지 초기화 중 오류 발생:', error);
        hideLoadingState();
        // 에러 발생 시에도 기본 UI는 표시
        renderDocuments([]);
        updateResultCount(0);
    }
});

// ===========================================
// 장바구니 기능
// ===========================================

// 장바구니 데이터 관리
let cartItems = JSON.parse(localStorage.getItem('marketResearchCart')) || [];

// 장바구니에 담기
async function addToCart(docId) {
    // 권한 체크 추가
    const permissions = await checkUserPermissions();
    if (!permissions.canDownload) {
        alert(permissions.reason);
        return;
    }

    const doc = currentDocuments.find(d => d.id === docId);
    if (!doc) return;
    
    // 이미 장바구니에 있는지 확인
    if (cartItems.some(item => item.id === docId)) {
        alert('이미 장바구니에 담겨있는 자료입니다.');
        return;
    }
    
    // 장바구니에 추가
    cartItems.push({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        location: doc.location,
        points: doc.points,
        fileSize: doc.fileSize,
        date: doc.date
    });
    
    // 로컬 스토리지에 저장
    localStorage.setItem('marketResearchCart', JSON.stringify(cartItems));
    
    // 성공 메시지 표시
    alert(`"${doc.title}"이(가) 장바구니에 담겼습니다.\n현재 장바구니: ${cartItems.length}개 자료`);
    
    // 장바구니 버튼 애니메이션 효과 (선택사항)
    const cartBtn = event.currentTarget;
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartBtn.style.transform = '';
        }, 200);
    }
}

// ===========================================
// 신고 기능
// ===========================================

// 신고 모달 표시
function showReportModal(docId) {
    const doc = currentDocuments.find(d => d.id === docId);
    if (!doc) return;
    
    const modal = document.getElementById('reportModal');
    const title = document.getElementById('reportDocTitle');
    
    if (modal && title) {
        title.textContent = doc.title;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// 신고 모달 닫기
function closeReportModal() {
    const modal = document.getElementById('reportModal');
    const textarea = document.getElementById('reportReason');
    
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    if (textarea) {
        textarea.value = '';
    }
}

// 신고 제출
function submitReport() {
    const textarea = document.getElementById('reportReason');
    const docTitle = document.getElementById('reportDocTitle');
    
    if (!textarea || !docTitle) return;
    
    const reason = textarea.value.trim();
    if (!reason) {
        alert('신고 사유를 입력해주세요.');
        return;
    }
    
    // 신고 데이터 저장 (실제 구현에서는 서버로 전송)
    const reportData = {
        documentTitle: docTitle.textContent,
        reason: reason,
        timestamp: new Date().toISOString(),
        userId: getCurrentUserId() || 'anonymous'
    };
    
    // 로컬 스토리지에 신고 내역 저장
    const reports = JSON.parse(localStorage.getItem('documentReports')) || [];
    reports.push(reportData);
    localStorage.setItem('documentReports', JSON.stringify(reports));
    
    // 성공 메시지
    alert('신고가 접수되었습니다.\n검토 후 조치하겠습니다.');
    
    // 모달 닫기
    closeReportModal();
}

// 현재 사용자 ID 가져오기 (Mock 함수)
function getCurrentUserId() {
    // 실제 구현에서는 인증 시스템에서 사용자 ID를 가져옴
    return localStorage.getItem('currentUserId') || null;
}

// 신고 이벤트 리스너 초기화
function initializeReportEventListeners() {
    // 신고 버튼 클릭 이벤트
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-report')) {
            e.preventDefault();
            e.stopPropagation();
            
            // 부모 요소에서 문서 ID 찾기
            const docCard = e.target.closest('.market-research-card');
            if (docCard) {
                const docId = docCard.getAttribute('data-doc-id');
                if (docId) {
                    showReportModal(docId);
                }
            }
        }
    });
    
    // 모달 닫기 이벤트
    const modal = document.getElementById('reportModal');
    const closeBtn = document.getElementById('reportModalClose');
    const cancelBtn = document.getElementById('reportCancelBtn');
    const submitBtn = document.getElementById('reportSubmitBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeReportModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeReportModal);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitReport);
    }
    
    // 모달 배경 클릭으로 닫기
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeReportModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('reportModal');
            if (modal && modal.style.display === 'flex') {
                closeReportModal();
            }
        }
    });
    
    // 페이지네이션 초기화
    renderPagination();
}

// 페이지네이션 렌더링 함수
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(currentDocuments.length / itemsPerPage);
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // 처음 버튼
    paginationHTML += `<a href="javascript:void(0)" class="${currentPage === 1 ? 'disabled' : ''}" onclick="goToPage(1); return false;">처음</a>`;
    
    // 이전 버튼
    paginationHTML += `<a href="javascript:void(0)" class="${currentPage === 1 ? 'disabled' : ''}" onclick="goToPage(${Math.max(1, currentPage - 1)}); return false;">이전</a>`;
    
    // 페이지 번호
    paginationHTML += '<div class="page-numbers">';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<a href="javascript:void(0)" class="${currentPage === i ? 'active' : ''}" onclick="goToPage(${i}); return false;">${i}</a>`;
    }
    paginationHTML += '</div>';
    
    // 다음 버튼
    paginationHTML += `<a href="javascript:void(0)" class="${currentPage === totalPages ? 'disabled' : ''}" onclick="goToPage(${Math.min(totalPages, currentPage + 1)}); return false;">다음</a>`;
    
    // 끝 버튼
    paginationHTML += `<a href="javascript:void(0)" class="${currentPage === totalPages ? 'disabled' : ''}" onclick="goToPage(${totalPages}); return false;">끝</a>`;
    
    paginationContainer.innerHTML = paginationHTML;
}

// 페이지 이동 함수
function goToPage(page) {
    const totalPages = Math.ceil(currentDocuments.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayDocuments(currentDocuments); // 현재 문서 목록 사용
    renderPagination();
    
    // 페이지 이동 시 스크롤 위치 유지
    return false;
}

// ===========================================
// Supabase 데이터 통합
// ===========================================

// 현재 문서 목록을 전역 변수로 관리
let currentDocuments = [];

// 회원 권한 체크 함수들
async function checkUserPermissions() {
    const user = await window.authService?.getCurrentUser();
    if (!user) {
        return { canUpload: false, canDownload: false, reason: '로그인이 필요합니다.' };
    }
    
    // 회원 타입 확인
    const memberType = user.member_type || user.role || 'general';
    const isPractitioner = user.is_practitioner || user.is_worker_approved || false;
    
    // 분양기획, 관계사 회원 유형 확인
    const allowedMemberTypes = ['분양기획', '관계사', 'planning', 'developer', 'affiliate'];
    const canUpload = allowedMemberTypes.includes(memberType);
    
    // 다운로드는 분양기획/관계사 중 실무자 승인된 회원만
    const canDownload = canUpload && isPractitioner;
    
    let reason = '';
    if (!canUpload) {
        reason = '분양기획 또는 관계사 회원만 이용 가능합니다.';
    } else if (!canDownload) {
        reason = '실무자 승인이 필요합니다. 관리자에게 문의하세요.';
    }
    
    return { canUpload, canDownload, reason, memberType, isPractitioner };
}

// 다운로드 권한 체크
async function checkDownloadPermission() {
    const permissions = await checkUserPermissions();
    if (!permissions.canDownload) {
        alert(permissions.reason);
        return false;
    }
    return true;
}

// 업로드 권한 체크
async function checkUploadPermission() {
    const permissions = await checkUserPermissions();
    if (!permissions.canUpload) {
        alert(permissions.reason);
        return false;
    }
    return true;
}

// UI 권한 업데이트 (페이지 로드 시 호출)
async function updateUIPermissions() {
    const permissions = await checkUserPermissions();
    
    // 업로드 버튼 표시/숨김
    const uploadBtn = document.querySelector('.upload-btn, #uploadModalBtn');
    if (uploadBtn) {
        if (permissions.canUpload) {
            uploadBtn.style.display = 'block';
        } else {
            uploadBtn.style.display = 'none';
        }
    }
    
    // 다운로드 권한에 따른 UI 업데이트 (선택사항)
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        if (!permissions.canDownload) {
            btn.setAttribute('title', permissions.reason);
            btn.style.opacity = '0.5';
        }
    });
}

// 문서 목록 새로고침 함수
async function refreshDocuments() {
    try {
        if (window.marketResearchSupabase && window.marketResearchSupabase.client) {
            console.log('📋 문서 목록 새로고침 중...');
            const documents = await window.marketResearchSupabase.fetchDocuments({
                limit: 50,
                sortBy: 'latest'
            });
            
            currentDocuments = documents;
            renderDocuments(currentDocuments);
            updateResultCount(currentDocuments.length);
            
            console.log(`✅ ${documents.length}개 문서 새로고침 완료`);
        }
    } catch (error) {
        console.error('❌ 문서 새로고침 실패:', error);
    }
}

// Supabase 데이터 초기화
async function initializeSupabaseData() {
    // 중복 초기화 방지
    if (isInitialized) {
        console.log('ℹ️ Supabase 데이터 이미 초기화됨 - 스킵');
        return true;
    }
    
    try {
        console.log('📍 Supabase 데이터 초기화 시작...');
        
        // Supabase 초기화 완료를 명시적으로 대기
        if (window.supabaseInitPromise) {
            console.log('⏳ Supabase 초기화 완료 대기 중...');
            await window.supabaseInitPromise;
            console.log('✅ Supabase 초기화 완료 확인됨');
        }
        
        console.log('🔍 환경 상태 점검:');
        console.log('  - window.WaveSupabase:', !!window.WaveSupabase);
        console.log('  - window.MarketResearchSupabase:', !!window.MarketResearchSupabase);
        console.log('  - window.marketResearchSupabase:', !!window.marketResearchSupabase);
        
        // MarketResearchSupabase 클래스가 로드될 때까지 대기
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.MarketResearchSupabase && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // 이미 초기화된 경우 스킛
        if (window.marketResearchSupabase) {
            console.log('ℹ️ MarketResearchSupabase 이미 초기화됨');
        } else {
            // MarketResearchSupabase 클래스에서 인스턴스 생성
            if (window.MarketResearchSupabase) {
                console.log('📦 MarketResearchSupabase 인스턴스 생성 중...');
                window.marketResearchSupabase = new window.MarketResearchSupabase();
                
                // 초기화 시도
                const initialized = await window.marketResearchSupabase.init();
                if (!initialized) {
                    console.warn('⚠️ MarketResearchSupabase 초기화 실패');
                    window.marketResearchSupabase = null;
                    currentDocuments = [];
                    renderDocuments(currentDocuments);
                    updateResultCount(currentDocuments.length);
                    return false;
                }
                console.log('✅ MarketResearchSupabase 초기화 성공');
            } else {
                console.warn('⚠️ MarketResearchSupabase 클래스를 찾을 수 없습니다.');
                currentDocuments = [];
                renderDocuments(currentDocuments);
                updateResultCount(currentDocuments.length);
                return false;
            }
        }
        
        // 문서 로드 시도
        if (window.marketResearchSupabase) {
            console.log('📋 시장조사서 문서 로드 중...');
            console.log('  - fetchDocuments 옵션: { limit: 50, sortBy: "latest" }');
            const documents = await window.marketResearchSupabase.fetchDocuments({
                limit: 50,
                sortBy: 'latest'
            });
            
            console.log(`📊 문서 로드 결과: ${documents.length}개`);
            if (documents.length > 0) {
                console.log(`  - 첫 번째 문서:`, {
                    id: documents[0].id,
                    title: documents[0].title,
                    type: documents[0].type
                });
            }
            currentDocuments = documents;
            
            // UI 업데이트
            renderDocuments(currentDocuments);
            updateResultCount(currentDocuments.length);
            
            // 초기화 완료 플래그 설정
            isInitialized = true;
            console.log('🎯 Supabase 데이터 초기화 완료');
            return true;
        } else {
            console.warn('⚠️ marketResearchSupabase를 찾을 수 없습니다.');
            // 빈 데이터로 초기화
            currentDocuments = [];
            renderDocuments(currentDocuments);
            updateResultCount(currentDocuments.length);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Supabase 데이터 초기화 실패:', error);
        
        // 상세 에러 정보 로깅
        if (error.message) {
            console.error('❌ 에러 메시지:', error.message);
        }
        if (error.stack) {
            console.error('❌ 에러 스택:', error.stack);
        }
        
        // Storage 권한 문제에 대한 구체적인 안내
        if (error.message && error.message.includes('storage') || error.message.includes('bucket')) {
            console.log('💡 Storage 문제 해결 가이드:');
            console.log('  1. 콘솔에서 quickSetup() 실행');
            console.log('  2. 또는 createBucketGuide() 실행');
            console.log('  3. Supabase 대시보드에서 Storage 버킷 생성');
        }
        
        // 사용자 친화적인 에러 메시지 표시
        if (document.getElementById('documentGrid')) {
            document.getElementById('documentGrid').innerHTML = `
                <div class="error-message" style="
                    text-align: center;
                    padding: 40px;
                    color: #666;
                    background: #f9f9f9;
                    border-radius: 8px;
                    margin: 20px 0;
                ">
                    <h3>⚠️ 데이터 로드 실패</h3>
                    <p>시장조사서 데이터를 불러오는데 실패했습니다.</p>
                    <p>페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
                    <button onclick="debugMarketResearch.reinitialize()" 
                            style="margin-top: 10px; padding: 8px 16px; 
                                   background: #0066FF; color: white; 
                                   border: none; border-radius: 4px; cursor: pointer;">
                        다시 시도
                    </button>
                </div>
            `;
        }
        
        // 빈 데이터로 초기화
        currentDocuments = [];
        updateResultCount(0);
        
        // 실패 시 플래그 리셋 (재시도 허용)
        isInitialized = false;
        return false;
    }
}

// 필터링된 문서 반환 (Supabase 데이터 지원)
function getFilteredDocuments() {
    return currentDocuments.filter((doc) => {
        return matchesFilters(doc);
    });
}

// 필터 조건 매칭 함수
function matchesFilters(doc) {
    const selectedRegions = Array.from(
        document.querySelectorAll('#regionCheckboxes input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    const selectedTypes = Array.from(
        document.querySelectorAll('#typeCheckboxes input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    const selectedSupplyTypes = Array.from(
        document.querySelectorAll('#supplyTypeCheckboxes input[type="checkbox"]:checked')
    ).map(cb => cb.value);

    const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';

    // 지역 필터링
    if (selectedRegions.length > 0) {
        const docRegion = doc.region || '';
        if (!selectedRegions.some(region => docRegion.includes(region))) {
            return false;
        }
    }

    // 상품 유형 필터링
    if (selectedTypes.length > 0 && !selectedTypes.includes(doc.type)) {
        return false;
    }

    // 공급 유형 필터링
    if (selectedSupplyTypes.length > 0 && !selectedSupplyTypes.includes(doc.supplyType)) {
        return false;
    }

    // 검색어 필터링
    if (searchTerm) {
        const searchableText = [
            doc.title,
            doc.description,
            doc.location,
            ...(doc.keywords || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
            return false;
        }
    }

    return true;
}

// 기존 함수 수정: filterDocuments
function filterDocuments() {
    return getFilteredDocuments();
}

// 문서 다운로드 함수 (Supabase 연동)
async function downloadDocument(docId) {
    try {
        if (!window.marketResearchSupabase || !window.marketResearchSupabase.client) {
            throw new Error('MarketResearchSupabase가 초기화되지 않았습니다.');
        }

        // 현재 사용자 ID 가져오기
        const userId = window.WaveSupabase?.currentUser?.id;
        if (!userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        console.log(`📥 문서 다운로드 시작: ${docId}`);
        
        const downloadInfo = await window.marketResearchSupabase.downloadFile(docId, userId);
        
        // 다운로드 실행
        const link = document.createElement('a');
        link.href = downloadInfo.url;
        link.download = downloadInfo.filename;
        link.click();
        
        console.log('✅ 문서 다운로드 완료');
        alert('다운로드가 시작되었습니다.');
        
        // 문서 목록 새로고침 (다운로드 카운트 업데이트)
        await refreshDocuments();
        
    } catch (error) {
        console.error('❌ 문서 다운로드 실패:', error);
        alert(`다운로드 실패: ${error.message}`);
    }
}

// 현재 사용자 ID 가져오기 (임시 구현)
function getCurrentUserId() {
    // 실제로는 인증 시스템에서 가져와야 함
    // 임시로 localStorage에서 가져오거나 하드코딩
    return localStorage.getItem('currentUserId') || null;
}

// 문서 목록 새로고침
async function refreshDocuments() {
    try {
        if (window.MarketResearchSupabase) {
            const documents = await window.MarketResearchSupabase.fetchDocuments({
                limit: 50,
                sortBy: 'latest'
            });
            
            currentDocuments = documents;
            renderDocuments(filterDocuments());
            updateResultCount(filterDocuments().length);
        }
    } catch (error) {
        console.error('❌ 문서 새로고침 실패:', error);
    }
}

// 검색 및 필터 이벤트 리스너에서 사용할 함수
function applyFiltersAndSearch() {
    const filteredDocs = filterDocuments();
    renderDocuments(filteredDocs);
    updateResultCount(filteredDocs.length);
    
    // 페이지 초기화
    currentPage = 1;
    renderPagination();
}

// ===========================================
// 디버깅 도구
// ===========================================

// 전역 디버깅 헬퍼 (콘솔에서 사용 가능)
window.debugMarketResearch = {
    // 초기화 상태 확인
    checkInitStatus: function() {
        console.group('🔍 시장조사서 디버깅 정보');
        console.log('📊 초기화 상태:');
        console.log('  - isInitialized:', isInitialized);
        console.log('  - Supabase Client:', !!window.supabase);
        console.log('  - WaveSupabase:', !!window.WaveSupabase);
        console.log('  - MarketResearchSupabase 클래스:', !!window.MarketResearchSupabase);
        console.log('  - marketResearchSupabase 인스턴스:', !!window.marketResearchSupabase);
        
        if (window.marketResearchSupabase) {
            console.log('📁 Storage 상태:');
            console.log('  - Storage Disabled:', window.marketResearchSupabase.storageDisabled);
            console.log('  - Client 연결:', !!window.marketResearchSupabase.client);
            console.log('  - 로딩 상태:', window.marketResearchSupabase.isLoading);
            console.log('  - 에러:', window.marketResearchSupabase.error);
        }
        
        console.log('📄 문서 상태:');
        console.log('  - currentDocuments 수:', currentDocuments.length);
        console.log('  - 현재 필터:', currentFilters);
        
        console.groupEnd();
        return {
            initialized: isInitialized,
            hasSupabase: !!window.supabase,
            hasInstance: !!window.marketResearchSupabase,
            documentsCount: currentDocuments.length
        };
    },
    
    // 강제 재초기화
    reinitialize: async function() {
        console.log('🔄 강제 재초기화 시작...');
        isInitialized = false;
        const result = await initializeSupabaseData();
        console.log('🔄 재초기화 결과:', result);
        return result;
    },
    
    // 새로고침 문제 진단
    diagnoseProblem: function() {
        console.group('🔧 새로고침 문제 진단');
        
        console.log('1️⃣ 초기화 상태 확인:');
        console.log('  - isInitialized:', isInitialized);
        console.log('  - currentDocuments.length:', currentDocuments.length);
        
        console.log('2️⃣ Supabase 연결 확인:');
        console.log('  - WaveSupabase 로드:', !!window.WaveSupabase);
        console.log('  - MarketResearchSupabase 클래스:', !!window.MarketResearchSupabase);
        console.log('  - marketResearchSupabase 인스턴스:', !!window.marketResearchSupabase);
        
        if (window.marketResearchSupabase) {
            console.log('  - Storage 비활성화:', window.marketResearchSupabase.storageDisabled);
            console.log('  - 에러:', window.marketResearchSupabase.error?.message);
        }
        
        console.log('3️⃣ 권장 해결책:');
        if (!window.marketResearchSupabase) {
            console.log('  ❌ Supabase 미연결 → debugMarketResearch.reinitialize() 실행');
        } else if (window.marketResearchSupabase.storageDisabled) {
            console.log('  ⚠️ Storage 비활성화 → 콘솔에서 quickSetup() 실행');
        } else if (currentDocuments.length === 0) {
            console.log('  📄 빈 데이터 → debugMarketResearch.testDataLoad() 실행');
        } else {
            console.log('  ✅ 정상 상태');
        }
        
        console.groupEnd();
    },
    
    // 테스트 데이터 로드
    testDataLoad: async function() {
        if (!window.marketResearchSupabase) {
            console.error('❌ marketResearchSupabase 인스턴스가 없습니다.');
            return false;
        }
        
        try {
            console.log('📡 테스트 데이터 로드 중...');
            const documents = await window.marketResearchSupabase.fetchDocuments({
                limit: 10,
                sortBy: 'latest'
            });
            
            console.log('✅ 테스트 로드 성공:', documents.length, '개 문서');
            console.table(documents.slice(0, 3)); // 처음 3개만 테이블로 표시
            return documents;
        } catch (error) {
            console.error('❌ 테스트 로드 실패:', error);
            return false;
        }
    },
    
    // Storage 버킷 상태 확인
    checkStorageBucket: async function() {
        if (!window.marketResearchSupabase) {
            console.error('❌ marketResearchSupabase 인스턴스가 없습니다.');
            return false;
        }
        
        try {
            console.log('🪣 Storage 버킷 상태 확인 중...');
            await window.marketResearchSupabase.ensureStorageBucket();
            console.log('✅ Storage 버킷 확인 완료');
            return true;
        } catch (error) {
            console.error('❌ Storage 버킷 확인 실패:', error);
            return false;
        }
    },
    
    // 현재 상태 요약
    getStatus: function() {
        return {
            initialized: isInitialized,
            hasSupabaseClient: !!window.supabase,
            hasMarketInstance: !!window.marketResearchSupabase,
            storageDisabled: window.marketResearchSupabase?.storageDisabled || false,
            documentsCount: currentDocuments.length,
            hasErrors: !!window.marketResearchSupabase?.error
        };
    },
    
    // 헬스체크 - 전체 시스템 상태 확인
    healthCheck: async function() {
        console.group('🏥 시장조사서 시스템 헬스체크');
        
        const results = {
            supabaseClient: false,
            marketInstance: false,
            dataLoad: false,
            ui: false,
            overall: false
        };
        
        try {
            // 1. Supabase 클라이언트 확인
            if (window.supabase || (window.WaveSupabase && window.WaveSupabase.getClient())) {
                results.supabaseClient = true;
                console.log('✅ Supabase 클라이언트 연결됨');
            } else {
                console.error('❌ Supabase 클라이언트 없음');
            }
            
            // 2. MarketResearch 인스턴스 확인
            if (window.marketResearchSupabase && window.marketResearchSupabase.init) {
                results.marketInstance = true;
                console.log('✅ MarketResearchSupabase 인스턴스 정상');
            } else {
                console.error('❌ MarketResearchSupabase 인스턴스 없음');
            }
            
            // 3. 데이터 로드 테스트
            try {
                const testResult = await this.testDataLoad();
                if (testResult && testResult.length >= 0) {
                    results.dataLoad = true;
                    console.log('✅ 데이터 로드 테스트 통과');
                } else {
                    console.error('❌ 데이터 로드 테스트 실패');
                }
            } catch (error) {
                console.error('❌ 데이터 로드 테스트 에러:', error.message);
            }
            
            // 4. UI 요소 확인
            const documentGrid = document.getElementById('documentGrid');
            const uploadModal = document.getElementById('uploadModal');
            if (documentGrid && uploadModal) {
                results.ui = true;
                console.log('✅ UI 요소 정상');
            } else {
                console.error('❌ UI 요소 누락:', {
                    documentGrid: !!documentGrid,
                    uploadModal: !!uploadModal
                });
            }
            
            // 전체 상태 판정
            const passedChecks = Object.values(results).filter(Boolean).length;
            results.overall = passedChecks >= 3; // 4개 중 3개 이상 통과
            
            console.log('📊 헬스체크 결과:', results);
            console.log(results.overall ? '✅ 전체 시스템 정상' : '⚠️ 시스템에 문제 있음');
            
        } catch (error) {
            console.error('❌ 헬스체크 중 에러:', error);
            results.overall = false;
        }
        
        console.groupEnd();
        return results;
    }
};

// 페이지 로드 시 디버깅 도구 안내
setTimeout(() => {
    if (window.console && window.console.log) {
        console.log('🛠️ 시장조사서 디버깅 도구 사용 가능:');
        console.log('  debugMarketResearch.healthCheck() - 전체 시스템 헬스체크');
        console.log('  debugMarketResearch.checkInitStatus() - 초기화 상태 확인');
        console.log('  debugMarketResearch.reinitialize() - 강제 재초기화');
        console.log('  debugMarketResearch.testDataLoad() - 데이터 로드 테스트');
        console.log('  debugMarketResearch.getStatus() - 현재 상태 요약');
    }
}, 2000); // 2초 후 안내 메시지 표시
