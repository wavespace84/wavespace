// 시장조사서 페이지 JavaScript - PRD 요구사항 완전 구현

// 지역 데이터 (광역시도 -> 시군구) - 분양영업 페이지와 동일
const regionData = {
    'all': [],
    'seoul': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    'gyeonggi': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    'incheon': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    'busan': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    'daegu': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    'gwangju': ['광산구', '남구', '동구', '북구', '서구'],
    'daejeon': ['대덕구', '동구', '서구', '유성구', '중구'],
    'ulsan': ['남구', '동구', '북구', '울주군', '중구'],
    'sejong': ['세종시'],
    'gangwon': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    'chungbuk': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
    'chungnam': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
    'jeonbuk': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
    'jeonnam': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    'gyeongbuk': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
    'gyeongnam': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
    'jeju': ['서귀포시', '제주시']
};

// 지역 이름 매핑
const regionNames = {
    'all': '전국',
    'seoul': '서울',
    'gyeonggi': '경기',
    'incheon': '인천',
    'busan': '부산',
    'daegu': '대구',
    'gwangju': '광주',
    'daejeon': '대전',
    'ulsan': '울산',
    'sejong': '세종',
    'gangwon': '강원',
    'chungbuk': '충북',
    'chungnam': '충남',
    'jeonbuk': '전북',
    'jeonnam': '전남',
    'gyeongbuk': '경북',
    'gyeongnam': '경남',
    'jeju': '제주'
};

// 상품 유형 데이터 (PRD 8개 유형 + 오피스텔 세분화)
const productTypes = [
    { id: 'apartment', name: '아파트', color: '#3b82f6' },
    { id: 'officetel-residential', name: '주거형 OT', color: '#8b5cf6' },
    { id: 'officetel-profit', name: '수익형 OT', color: '#9333ea' },
    { id: 'commercial', name: '상가', color: '#ec4899' },
    { id: 'knowledge', name: '지식산업센터', color: '#10b981' },
    { id: 'urban', name: '도시형생활주택', color: '#f59e0b' },
    { id: 'studio', name: '원룸/투룸', color: '#ef4444' },
    { id: 'villa', name: '빌라/연립', color: '#06b6d4' },
    { id: 'land', name: '토지', color: '#84cc16' },
    { id: 'lifestyle-lodge', name: '생활형숙박시설', color: '#14b8a6' },
    { id: 'hotel', name: '호텔', color: '#f97316' }
];

// 샘플 문서 데이터 (자료 마켓플레이스용)
const sampleDocuments = [
    {
        id: 1,
        title: '강남구 삼성동 아파트 시장조사서',
        type: 'apartment',
        region: '서울',
        district: '강남구',
        location: '서울 강남구',
        date: '2024.01.15',
        createDate: '자료생성일: 2024.01.15',
        fileSize: '12.5MB',
        fileType: 'PDF',
        pages: 45,
        points: 3960,
        supplyType: '민간분양',
        isPremium: false,
        keywords: ['프리미엄', '투자가치', '신축'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%236b7280" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
        description: '삼성동 일대 아파트 시장 동향 및 가격 분석',
        pdfPath: null // 실제 PDF 파일 없음 (테스트용)
    },
    {
        id: 2,
        title: '판교 테크노밸리 오피스텔 시장분석',
        type: 'officetel-profit',
        region: '경기',
        district: '성남시',
        location: '경기 성남시',
        date: '2024.01.14',
        createDate: '자료생성일: 2024.01.14',
        fileSize: '8.3MB',
        fileType: 'PPT',
        pages: 32,
        points: 3300,
        supplyType: '민간분양',
        isPremium: false,
        keywords: ['테크노밸리', '오피스텔', '임대수익'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23ddd6fe"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%237c3aed" font-size="12"%3EPPT%3C/text%3E%3C/svg%3E',
        description: '판교 테크노밸리 오피스텔 투자 가치 분석',
        pdfPath: null // PDF 파일 없음
    },
    {
        id: 3,
        title: '홍대상권 상가 시장조사',
        type: 'commercial',
        region: '서울',
        district: '마포구',
        location: '서울 마포구',
        date: '2024.01.13',
        createDate: '자료생성일: 2024.01.13',
        fileSize: '15.2MB',
        fileType: 'PDF',
        pages: 67,
        points: 3960,
        supplyType: '민간분양',
        isPremium: false,
        keywords: ['홍대상권', '상가투자', '젠트리피케이션'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23fce7f3"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%23ec4899" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
        description: '홍대 상권 분석 및 상가 투자 전략',
        pdfPath: '/samples/sample3.pdf' // 실제 PDF 파일 경로 있음 (데모용 이미지 표시)
    },
    {
        id: 4,
        title: '가산디지털단지 지식산업센터 현황',
        type: 'knowledge',
        region: '서울',
        district: '금천구',
        location: '서울 금천구',
        date: '2024.01.12',
        createDate: '자료생성일: 2024.01.12',
        fileSize: '23.7MB',
        fileType: 'PDF',
        pages: 89,
        points: 3960,
        supplyType: '민간분양',
        isPremium: false,
        keywords: ['지식산업센터', 'IT산업', '임대현황'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23d4f4e6"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%2310b981" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
        description: '가산디지털단지 지식산업센터 시장 현황 및 투자 전망',
        pdfPath: null // PDF 파일 없음
    },
    {
        id: 5,
        title: '해운대 신도시 아파트 시장 동향',
        type: 'apartment',
        region: '부산',
        district: '해운대구',
        location: '부산 해운대구',
        date: '2024.01.11',
        createDate: '자료생성일: 2024.01.11',
        fileSize: '18.9MB',
        fileType: 'PPT',
        pages: 56,
        points: 3960,
        supplyType: '공공분양',
        isPremium: false,
        keywords: ['해운대', '신도시', '공공분양'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23e0e7ff"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%235b5fc7" font-size="12"%3EPPT%3C/text%3E%3C/svg%3E',
        description: '해운대 신도시 공공분양 아파트 시장 분석',
        pdfPath: null // PDF 파일 없음
    },
    {
        id: 6,
        title: '여의도 IFC 오피스텔 투자 분석',
        type: 'officetel-residential',
        region: '서울',
        district: '영등포구',
        location: '서울 영등포구',
        date: '2024.01.10',
        createDate: '자료생성일: 2024.01.10',
        fileSize: '11.3MB',
        fileType: 'PDF',
        pages: 42,
        points: 3960,
        supplyType: '민간임대',
        isPremium: false,
        keywords: ['여의도', 'IFC', '프리미엄오피스'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23fef3c7"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%23f59e0b" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
        description: '여의도 IFC 주변 오피스텔 투자 가치 분석',
        pdfPath: null // PDF 파일 없음
    },
    {
        id: 7,
        title: '송파 헬리오시티 주거형 오피스텔 분석',
        type: 'officetel-residential',
        region: '서울',
        district: '송파구',
        location: '서울 송파구',
        date: '2024.01.08',
        createDate: '자료생성일: 2024.01.08',
        fileSize: '7.8MB',
        fileType: 'PDF',
        pages: 28,
        points: 3300,
        supplyType: '민간분양',
        isPremium: false,
        keywords: ['송파', '헬리오시티', '주거형'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%236b7280" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
        description: '송파 헬리오시티 주거형 오피스텔 시장 분석',
        pdfPath: null // PDF 파일 없음
    },
    {
        id: 8,
        title: '강남역 수익형 오피스텔 투자 가이드',
        type: 'officetel-profit',
        region: '서울',
        district: '강남구',
        location: '서울 강남구',
        date: '2024.01.07',
        createDate: '자료생성일: 2024.01.07',
        fileSize: '11.2MB',
        fileType: 'PDF',
        pages: 42,
        points: 3960,
        supplyType: '민간분양',
        isPremium: true,
        keywords: ['강남역', '수익형', '투자'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23e0f2fe"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%230284c7" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
        description: '강남역 일대 수익형 오피스텔 투자 전략',
        pdfPath: null // PDF 파일 없음
    },
    {
        id: 9,
        title: '분당 정자동 주거형 오피스텔 시장조사',
        type: 'officetel-residential',
        region: '경기',
        district: '성남시',
        location: '경기 성남시',
        date: '2024.01.06',
        createDate: '자료생성일: 2024.01.06',
        fileSize: '9.1MB',
        fileType: 'PPT',
        pages: 35,
        points: 3300,
        supplyType: '공공분양',
        isPremium: false,
        keywords: ['분당', '정자동', '주거형'],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23fee2e2"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%23dc2626" font-size="12"%3EPPT%3C/text%3E%3C/svg%3E',
        description: '분당 정자동 주거형 오피스텔 입지 분석',
        pdfPath: null // PDF 파일 없음
    }
];

// 전역 상태 관리
let currentFilters = {
    type: 'all',
    region: 'all',
    currentRegion: 'all',  // 현재 선택된 광역시도
    selectedRegions: [],   // 선택된 지역들 (문자열 배열로 변경)
    keyword: '',
    productType: 'all',
    supplyType: 'all'
};

// 유저 데이터 (모의 데이터)
const userData = {
    isLoggedIn: true,
    points: 2850,
    role: 'planning' // planning, sales, general
};

// ===========================================
// 필터 초기화 및 관리
// ===========================================

function initializeFilters() {
    console.log('Initializing filters...');
    
    // 지역 선택 이벤트 초기화 - nav-selector 사용
    const regionSelectors = document.querySelectorAll('.region-filter .nav-selector');
    console.log('Initializing region selectors:', regionSelectors.length);
    
    regionSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            console.log('Region selector clicked:', this.dataset.value);
            const value = this.dataset.value;
            
            // 기존 선택 제거
            this.parentElement.querySelectorAll('.nav-selector').forEach(s => {
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
    productTypeFilters.forEach(tab => {
        tab.addEventListener('click', function() {
            const type = this.dataset.type;
            
            // 라디오 버튼 체크
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            
            // 활성 상태 업데이트
            productTypeFilters.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 필터 적용
            currentFilters.productType = type;
            applyFilters();
        });
    });

    // 공급 유형 필터 초기화
    const supplyTypeFilters = document.querySelectorAll('#supplyTypeFilters .checkbox-tab');
    supplyTypeFilters.forEach(tab => {
        tab.addEventListener('click', function() {
            const type = this.dataset.type;
            
            // 라디오 버튼 체크
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            
            // 활성 상태 업데이트
            supplyTypeFilters.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 필터 적용
            currentFilters.supplyType = type;
            applyFilters();
        });
    });

    // 키워드 검색
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            currentFilters.keyword = this.value;
            applyFilters();
        }, 300));
    }

    // 정렬 버튼
    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sortBtns.forEach(b => b.classList.remove('active'));
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
    document.querySelectorAll('.nav-selector').forEach(btn => {
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
    const subRegions = regionData[value];
    
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
        
        subRegions.forEach(subRegion => {
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
        newTabs.forEach(tab => {
            tab.addEventListener('click', function() {
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
        currentFilters.selectedRegions = currentFilters.selectedRegions.filter(region => {
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
        'seoul': '서울',
        'gyeonggi': '경기',
        'incheon': '인천',
        'busan': '부산',
        'daegu': '대구',
        'gwangju': '광주',
        'daejeon': '대전',
        'ulsan': '울산',
        'sejong': '세종',
        'gangwon': '강원',
        'chungbuk': '충북',
        'chungnam': '충남',
        'jeonbuk': '전북',
        'jeonnam': '전남',
        'gyeongbuk': '경북',
        'gyeongnam': '경남',
        'jeju': '제주'
    };
    return regionMap[regionCode] || regionCode;
}

// 하위 지역 선택 처리 (checkbox 중복 선택 방식)
function handleSubRegionChange(value, parent, selectedElement) {
    const parentDisplayName = getRegionDisplayName(parent);
    const checkbox = selectedElement.querySelector('input[type="checkbox"]');
    
    console.log('handleSubRegionChange:', { value, parent, parentDisplayName, checked: checkbox.checked });
    
    if (value === 'all') {
        if (checkbox.checked) {
            // '전체' 체크 시 - 해당 부모의 모든 개별 지역 해제하고 "전체"만 추가
            currentFilters.selectedRegions = currentFilters.selectedRegions.filter(region => {
                return !region.startsWith(parentDisplayName);
            });
            currentFilters.selectedRegions.push(`${parentDisplayName} 전체`);
            
            // 같은 부모의 모든 개별 지역 체크박스 해제
            document.querySelectorAll(`[data-parent="${parent}"] input[type="checkbox"]`).forEach(cb => {
                if (cb.value !== 'all') {
                    cb.checked = false;
                    cb.parentElement.classList.remove('active');
                }
            });
            
            console.log('Selected 전체 for:', parentDisplayName);
        } else {
            // '전체' 해제 시
            currentFilters.selectedRegions = currentFilters.selectedRegions.filter(region => {
                return region !== `${parentDisplayName} 전체`;
            });
            console.log('Unselected 전체 for:', parentDisplayName);
        }
    } else {
        const regionKey = `${parentDisplayName} ${value}`;
        
        if (checkbox.checked) {
            // 개별 지역 체크 시
            // '전체' 체크 해제
            const allCheckbox = document.querySelector(`[data-parent="${parent}"][data-value="all"] input[type="checkbox"]`);
            if (allCheckbox && allCheckbox.checked) {
                allCheckbox.checked = false;
                allCheckbox.parentElement.classList.remove('active');
                currentFilters.selectedRegions = currentFilters.selectedRegions.filter(region => {
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
            currentFilters.selectedRegions = currentFilters.selectedRegions.filter(region => {
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
        selectedTags.innerHTML = currentFilters.selectedRegions.map(region => {
            return `
                <span class="region-tag">
                    ${region}
                    <button class="tag-remove" data-region="${region}" title="제거">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `;
        }).join('');
        
        // 제거 버튼 이벤트 추가
        selectedTags.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const regionToRemove = this.dataset.region;
                currentFilters.selectedRegions = currentFilters.selectedRegions.filter(r => r !== regionToRemove);
                
                // 해당 체크박스 해제
                const parts = regionToRemove.split(' ');
                if (parts.length === 2) {
                    const checkboxes = document.querySelectorAll('#subRegionFilters .checkbox-tab');
                    checkboxes.forEach(cb => {
                        if (cb.textContent.trim() === parts[1] || cb.textContent.trim() === '전체') {
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
    const filteredDocuments = filterDocuments();
    renderDocuments(filteredDocuments);
    updateResultCount(filteredDocuments.length);
}

// 문서 필터링
function filterDocuments() {
    return sampleDocuments.filter(doc => {
        // 상품 유형 필터
        if (currentFilters.productType !== 'all') {
            // 상품 유형 매핑 (오피스텔 세분화 적용)
            const typeMap = {
                'apartment': 'apartment',
                'residential-ot': 'officetel-residential',
                'profit-ot': 'officetel-profit',
                'urban': 'urban',
                'commercial': 'commercial',
                'lifestyle-lodge': 'lifestyle-lodge',
                'knowledge': 'knowledge',
                'hotel': 'hotel',
                'studio': 'studio',
                'villa': 'villa',
                'land': 'land',
                'other': 'other'
            };
            
            const mappedType = typeMap[currentFilters.productType];
            if (mappedType && doc.type !== mappedType) {
                return false;
            }
        }
        
        // 공급 유형 필터
        if (currentFilters.supplyType !== 'all') {
            // 공급 유형 매핑
            const supplyTypeMap = {
                'private-sale': '민간분양',
                'public-sale': '공공분양',
                'private-rental': '민간임대',
                'public-rental': '공공임대',
                'other': '기타'
            };
            
            const mappedSupplyType = supplyTypeMap[currentFilters.supplyType];
            if (mappedSupplyType && doc.supplyType !== mappedSupplyType) {
                return false;
            }
        }
        
        // 지역 필터 적용
        if (currentFilters.selectedRegions.length > 0) {
            // 문서의 지역과 선택된 지역 비교
            if (!doc.region) return false;
            
            // selectedRegions 배열의 지역 중 하나라도 일치하면 표시
            const docLocation = `${doc.region} ${doc.district || ''}`;
            const match = currentFilters.selectedRegions.some(selectedRegion => {
                // "전체" 처리
                if (selectedRegion.endsWith(' 전체')) {
                    const regionPrefix = selectedRegion.replace(' 전체', '');
                    return docLocation.startsWith(regionPrefix);
                }
                // 특정 지역 처리 - 완전 일치
                return docLocation.trim() === selectedRegion;
            });
            
            if (!match) return false;
        }
        
        // 키워드 필터
        if (currentFilters.keyword) {
            const keyword = currentFilters.keyword.toLowerCase();
            const searchableText = `${doc.title} ${doc.description} ${doc.keywords.join(' ')} ${doc.location}`.toLowerCase();
            if (!searchableText.includes(keyword)) {
                return false;
            }
        }
        
        return true;
    });
}

// 페이지네이션 관련 변수
let currentPage = 1;
const itemsPerPage = 15; // 한 페이지에 15개 문서 표시

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
    
    grid.innerHTML = paginatedDocuments.map(doc => {
        const productType = productTypes.find(t => t.id === doc.type) || { name: '기타', color: '#6b7280' };
        return `
            <div class="document-card" data-id="${doc.id}" onclick="openPreview(${doc.id})">
                <div class="document-info">
                    <div class="document-header">
                        <div class="document-badges">
                            <span class="badge-type" style="background-color: ${productType.color}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                                ${productType.name}
                            </span>
                            <span class="badge-supply" style="background: #f3f4f6; color: #6b7280; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                                ${doc.supplyType || '민간분양'}
                            </span>
                        </div>
                        <button class="btn-action-mini btn-menu" onclick="event.stopPropagation()">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                    <h3 class="document-title">${doc.title}</h3>
                    <div class="document-meta-info" style="margin-top: 4px;">
                        <span class="meta-info-item">
                            <i class="fas fa-map-marker-alt" style="font-size: 11px;"></i>
                            <span>${doc.location}</span>
                        </span>
                        <span class="meta-info-item">
                            <i class="fas ${doc.fileType === 'PDF' ? 'fa-file-pdf' : 'fa-file-powerpoint'}" style="font-size: 11px;"></i>
                            <span>${doc.fileType}</span>
                        </span>
                        <span class="meta-info-item">
                            <i class="fas fa-hdd" style="font-size: 11px;"></i>
                            <span>${doc.fileSize}</span>
                        </span>
                        <span class="meta-info-item">
                            <i class="fas fa-calendar-alt" style="font-size: 11px;"></i>
                            <span>${doc.date || '2024.01.15'}</span>
                        </span>
                    </div>
                    <div class="document-footer">
                        <div class="points-badge">
                            <i class="fas fa-coins"></i>
                            <span>${doc.points}P</span>
                        </div>
                        <div class="document-actions-mini">
                            <button class="btn-action-mini btn-eye" onclick="event.stopPropagation(); openPreview(${doc.id})" title="미리보기">
                                <i class="far fa-eye"></i>
                            </button>
                            <button class="btn-action-mini btn-download-mini" onclick="event.stopPropagation(); handleDirectDownload(${doc.id}, ${doc.points})" title="다운로드">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 장바구니 버튼 이벤트
    grid.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const docId = this.dataset.id;
            handleAddToCart(docId);
        });
    });
    
    // 다운로드 버튼 이벤트
    grid.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const docId = this.dataset.id;
            const points = parseInt(this.dataset.points);
            handleDirectDownload(docId, points);
        });
    });
    
    // 자세히보기 버튼 이벤트
    grid.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', function(e) {
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
    
    // 이전 버튼
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            applyFilters();
        }
    };
    pagination.appendChild(prevBtn);
    
    // 페이지 번호 계산 (최대 15개)
    const maxVisiblePages = 15;
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
    
    // 첫 페이지로 가기 버튼 (생략 기호와 함께)
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'page-btn';
        firstBtn.textContent = '1';
        firstBtn.onclick = () => {
            currentPage = 1;
            applyFilters();
        };
        pagination.appendChild(firstBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }
    
    // 페이지 번호 버튼들
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        pageBtn.textContent = i;
        
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        
        pageBtn.onclick = () => {
            currentPage = i;
            applyFilters();
        };
        
        pagination.appendChild(pageBtn);
    }
    
    // 마지막 페이지로 가기 버튼 (생략 기호와 함께)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'page-btn';
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => {
            currentPage = totalPages;
            applyFilters();
        };
        pagination.appendChild(lastBtn);
    }
    
    // 다음 버튼
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            applyFilters();
        }
    };
    pagination.appendChild(nextBtn);
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
            const regionName = regionNames[currentFilters.region] || currentFilters.region;
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
        supplyType: 'all'
    };
    
    // UI 초기화
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) typeFilter.value = 'all';
    
    const keywordInput = document.getElementById('keywordInput');
    if (keywordInput) keywordInput.value = '';
    
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) dateFilter.value = 'all';
    
    // 지역 선택 초기화
    document.querySelectorAll('.nav-selector').forEach(selector => {
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
    productTabs.forEach(tab => {
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
    supplyTabs.forEach(tab => {
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
    
    const productType = productTypes.find(t => t.id === doc.type);
    
    modal.querySelector('.preview-header h3').textContent = doc.title;
    modal.querySelector('.preview-type').textContent = productType.name;
    modal.querySelector('.preview-type').style.backgroundColor = productType.color + '20';
    modal.querySelector('.preview-type').style.color = productType.color;
    
    const previewBody = modal.querySelector('.preview-body');
    previewBody.innerHTML = `
        <div class="preview-thumbnail">
            ${doc.thumbnail ? 
                `<img src="${doc.thumbnail}" alt="${doc.title}">` :
                `<div class="file-icon ${doc.fileType.toLowerCase()}">${doc.fileType}</div>`
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
                    ${doc.keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
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
    const doc = sampleDocuments.find(d => d.id == docId);
    if (doc) {
        // 장바구니 추가 성공 메시지
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const existingItem = cartItems.find(item => item.id === doc.id);
        
        if (existingItem) {
            showToastMessage(`"${doc.title}"은(는) 이미 장바구니에 있습니다.`, 'warning');
        } else {
            cartItems.push({
                id: doc.id,
                title: doc.title,
                points: doc.points,
                type: doc.type,
                fileType: doc.fileType
            });
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            showToastMessage(`"${doc.title}"이(가) 장바구니에 추가되었습니다.`, 'success');
        }
    }
}

// 다운로드 버튼 직접 클릭 처리
function handleDirectDownload(docId, points) {
    const doc = sampleDocuments.find(d => d.id == docId);
    if (!doc) return;
    
    // 로그인 체크
    if (!userData.isLoggedIn) {
        showToastMessage('로그인이 필요한 서비스입니다.', 'error');
        return;
    }
    
    // 포인트 체크
    if (userData.points < points) {
        showToastMessage(`포인트가 부족합니다. 필요: ${points}P, 보유: ${userData.points}P`, 'error');
        return;
    }
    
    // 다운로드 기록 저장
    const downloadHistory = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    downloadHistory.push({
        id: doc.id,
        title: doc.title,
        downloadDate: new Date().toISOString(),
        points: points
    });
    localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
    
    // 글로벌 포인트 시스템 사용하여 포인트 차감 및 애니메이션
    const downloadBtn = event?.currentTarget || document.querySelector(`[data-id="${docId}"]`);
    spendPoints(points, `"${doc.title}" 다운로드 완료!`, downloadBtn);
    
    // 실제로는 여기서 파일 다운로드 처리
    // window.location.href = `/api/download/${docId}`;
}

// 기존 handleDownload 함수 (미리보기 모달에서 사용)
function handleDownload(docId, points) {
    handleDirectDownload(docId, points);
}

// 미리보기 PDF 렌더링 함수
async function renderPreviewPDF(pdfPath, docId) {
    const previewArea = document.querySelector('.preview-pages-layout');
    
    // 문서 정보 가져오기
    const doc = sampleDocuments.find(d => d.id == docId);
    
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
    
    // PDF 파일이 있는 경우 - 캔버스 구조 복원
    if (previewArea) {
        // 기존 HTML 구조 복원
        previewArea.innerHTML = `
            <!-- 4페이지 (위, 작게) -->
            <div class="preview-page-small preview-page-top">
                <canvas id="previewCanvas4" width="120" height="160"></canvas>
                <div class="page-label">페이지 4</div>
            </div>
            
            <!-- 5페이지 (중앙, 크게 - 메인) -->
            <div class="preview-page-main">
                <canvas id="previewCanvas5" width="200" height="280"></canvas>
                <div class="page-label main">페이지 5 (메인)</div>
            </div>
            
            <!-- 6페이지 (아래, 작게) -->
            <div class="preview-page-small preview-page-bottom">
                <canvas id="previewCanvas6" width="120" height="160"></canvas>
                <div class="page-label">페이지 6</div>
            </div>
        `;
    }
    
    // 캔버스 요소 다시 가져오기
    const canvas4 = document.getElementById('previewCanvas4');
    const canvas5 = document.getElementById('previewCanvas5');
    const canvas6 = document.getElementById('previewCanvas6');
    
    if (!canvas4 || !canvas5 || !canvas6) {
        console.error('캔버스 요소를 찾을 수 없습니다.');
        return;
    }
    
    // PDF 파일이 있는 경우 - 실제 환경에서는 PDF.js를 사용하여 렌더링
    // 테스트 환경에서는 데모 이미지 렌더링
    try {
        // 실제 PDF 로드 시도 (테스트 환경에서는 실패할 수 있음)
        if (typeof pdfjsLib !== 'undefined' && doc.pdfPath.startsWith('http')) {
            // 실제 PDF 렌더링 로직
            await renderActualPDF(doc.pdfPath, [canvas4, canvas5, canvas6]);
        } else {
            // 데모용 페이지 렌더링
            const ctx4 = canvas4.getContext('2d');
            const ctx5 = canvas5.getContext('2d');
            const ctx6 = canvas6.getContext('2d');
            
            // 캔버스 초기화
            ctx4.fillStyle = '#ffffff';
            ctx4.fillRect(0, 0, canvas4.width, canvas4.height);
            
            ctx5.fillStyle = '#ffffff';
            ctx5.fillRect(0, 0, canvas5.width, canvas5.height);
            
            ctx6.fillStyle = '#ffffff';
            ctx6.fillRect(0, 0, canvas6.width, canvas6.height);
            
            // 데모 페이지 렌더링
            renderPage4(ctx4, canvas4.width, canvas4.height);
            renderPage5(ctx5, canvas5.width, canvas5.height);
            renderPage6(ctx6, canvas6.width, canvas6.height);
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
async function renderActualPDF(pdfPath, canvases) {
    try {
        // PDF 문서 로드
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        
        // 렌더링할 페이지 번호 (4, 5, 6)
        const pageNumbers = [4, 5, 6];
        
        for (let i = 0; i < canvases.length; i++) {
            const canvas = canvases[i];
            const ctx = canvas.getContext('2d');
            let pageNum = pageNumbers[i];
            
            // 페이지가 존재하지 않으면 마지막 페이지 사용
            if (pageNum > pdf.numPages) {
                pageNum = Math.max(1, pdf.numPages - (2 - i));
            }
            
            // 페이지 가져오기
            const page = await pdf.getPage(pageNum);
            
            // 캔버스 크기에 맞게 뷰포트 설정
            const desiredWidth = canvas.width;
            const desiredHeight = canvas.height;
            const viewport = page.getViewport({ scale: 1.0 });
            
            const scale = Math.min(
                desiredWidth / viewport.width,
                desiredHeight / viewport.height
            );
            
            const scaledViewport = page.getViewport({ scale: scale });
            
            // 캔버스 크기 조정
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            // PDF 페이지 렌더링
            const renderContext = {
                canvasContext: ctx,
                viewport: scaledViewport
            };
            
            await page.render(renderContext).promise;
            
            // 페이지 라벨 업데이트
            const labelElement = canvas.parentElement.querySelector('.page-label');
            if (labelElement) {
                labelElement.textContent = `페이지 ${pageNum}${i === 1 ? ' (메인)' : ''}`;
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
    ctx.fillText('5. 투자 전망', width/2, 22);
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
    const points = [[20, 100], [50, 85], [80, 70], [110, 65], [140, 60], [170, 50]];
    points.forEach(point => {
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

function updateUserPoints() {
    const pointsElement = document.querySelector('.user-points .points');
    if (pointsElement) {
        pointsElement.textContent = `${userData.points.toLocaleString()}P`;
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
    
    checkUserPermissions() {
        const uploadBtn = document.querySelector('.upload-btn');
        if (!uploadBtn) return;
        
        if (userData.role !== 'planning') {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-lock"></i> 실무자 인증 필요';
            uploadBtn.title = '기획/개발팀만 업로드 가능합니다';
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
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (userData.role === 'planning') {
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
        region2.innerHTML = '<option value="">시군구 선택</option>';
        
        if (selectedRegion && regionData[selectedRegion]) {
            regionData[selectedRegion].forEach(subRegion => {
                const option = document.createElement('option');
                option.value = subRegion;
                option.textContent = subRegion;
                region2.appendChild(option);
            });
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
            const region1Name = regionNames[this.formData.region1] || this.formData.region1;
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
            
            // 포인트 지급 시뮬레이션 (실제로는 서버에서 처리)
            setTimeout(() => {
                userData.points += 100;
                updateUserPoints();
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
        const similarDoc = sampleDocuments.find(doc => {
            const docRegion = Object.keys(regionNames).find(key => regionNames[key] === doc.region);
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
        sortSelect.addEventListener('change', function() {
            const sortedDocuments = sortDocuments(filterDocuments(), this.value);
            renderDocuments(sortedDocuments);
        });
    }
    
    // 미리보기 모달 닫기
    const previewClose = document.getElementById('previewClose');
    if (previewClose) {
        previewClose.addEventListener('click', function() {
            const modal = document.getElementById('previewModal');
            if (modal) modal.classList.remove('active');
        });
    }
    
    // 미리보기 다운로드 버튼
    const previewDownloadBtn = document.querySelector('.preview-download-btn');
    if (previewDownloadBtn) {
        previewDownloadBtn.addEventListener('click', function() {
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
        removeFileBtn.addEventListener('click', function() {
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
            sorted.sort((a, b) => new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-')));
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
    
    checkUserPermissions() {
        const uploadBtn = document.querySelector('.upload-btn');
        if (!uploadBtn) return;
        
        if (userData.role !== 'planning') {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-lock"></i> 실무자 인증 필요';
            uploadBtn.title = '기획/개발팀만 업로드 가능합니다';
        }
    },
    
    initRegionData() {
        const region1Select = document.getElementById('uploadRegion1');
        const region2Select = document.getElementById('uploadRegion2');
        
        if (region1Select) {
            region1Select.addEventListener('change', (e) => {
                const selectedRegion = e.target.value;
                if (selectedRegion && regionData[selectedRegion]) {
                    // 시군구 업데이트
                    region2Select.disabled = false;
                    region2Select.innerHTML = '<option value="">시/군/구 선택</option>';
                    
                    regionData[selectedRegion].forEach(district => {
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
        if (fileSize) fileSize.textContent = this.formData.fileSize + ' MB';
        
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
        
        // 1. 파일 크기 지수
        const fileSize = parseFloat(this.formData.fileSize);
        let sizeMultiplier = 0;
        let sizeCategory = '';
        
        if (fileSize >= 5) {
            sizeMultiplier = 1.1; // 110%
            sizeCategory = '5mb';
        } else if (fileSize >= 2) {
            sizeMultiplier = 1.0; // 100%
            sizeCategory = '2mb';
        } else {
            sizeMultiplier = 0.7; // 70%
            sizeCategory = 'under2mb';
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
        
        // 최종 포인트 계산: 기본 3000P × 파일크기 지수 × 최신성 지수
        const totalPoints = Math.round(basePoints * sizeMultiplier * freshnessMultiplier);
        this.calculatedPoints = totalPoints;
        this.updatePointsDisplay(this.calculatedPoints);
        
        // 해당 지수 강조 표시
        this.highlightSelectedFactors(sizeCategory, freshnessCategory, sizeMultiplier, freshnessMultiplier, totalPoints);
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
    
    handleSubmit() {
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
        
        // 중복 키 저장
        const duplicateKey = `${this.formData.fileSize}_${fileDate}_${region1}_${region2}_${productType}_${supplyType}`;
        uploadedFilesRegistry.add(duplicateKey);
        
        // 포인트 증가
        userData.points += this.calculatedPoints;
        updateUserPoints();
        
        // 문서 목록에 추가
        const newDoc = {
            id: sampleDocuments.length + 1,
            title: title,
            type: productType,
            region: region1,
            district: region2,
            location: `${regionNames[region1]} ${region2}`,
            date: new Date().toLocaleDateString('ko-KR').replace(/\\. /g, '.').replace(/\\.$/, ''),
            createDate: `자료생성일: ${fileDate}`,
            fileSize: this.formData.fileSize + 'MB',
            fileType: 'PDF',
            pages: Math.floor(Math.random() * 40) + 20,
            points: this.calculatedPoints,
            supplyType: this.getSupplyTypeName(supplyType),
            isPremium: this.calculatedPoints >= 400,
            keywords: [],
            thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%236b7280" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
            description: title
        };
        
        sampleDocuments.unshift(newDoc);
        renderDocuments(sampleDocuments);
        updateResultCount(sampleDocuments.length);
        
        alert(`업로드가 성공적으로 완료되었습니다!\n+${this.calculatedPoints}P가 적립되었습니다.`);
        
        this.closeModal();
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
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file);
        });
    }
    
    // 지역 선택
    if (region1Select) {
        region1Select.addEventListener('change', (e) => {
            updateRegion2Options(e.target.value);
            generateTitle();
            checkAllFieldsAndDuplicate(); // 중복검사 실행
        });
    }
    
    if (region2Select) {
        region2Select.addEventListener('change', () => {
            generateTitle();
            checkAllFieldsAndDuplicate(); // 중복검사 실행
        });
    }
    
    // 상품유형 버튼
    document.querySelectorAll('.upload-product-types .upload-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.upload-product-types .upload-type-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            generateTitle();
            calculatePoints();
            checkAllFieldsAndDuplicate(); // 중복검사 실행
        });
    });
    
    // 공급유형 버튼
    document.querySelectorAll('.upload-supply-types .upload-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.upload-supply-types .upload-type-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            generateTitle();
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
    
    [fileYear, fileMonth, fileDay].forEach(element => {
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

// 파일 업로드 처리
async function handleFileUpload(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileThumbnail = document.getElementById('fileThumbnail');
    const fileIconDiv = document.getElementById('fileIconDiv');
    const uploadZone = document.getElementById('uploadZone');
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    
    // 파일 정보 표시
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    
    // 파일 정보 영역 표시
    if (fileInfo) fileInfo.classList.add('show');
    if (uploadZone) uploadZone.classList.add('has-file');
    
    // 썸네일 즉시 생성 (PDF의 경우)
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        await generatePDFThumbnail(file);
    } else {
        // PDF가 아닌 경우 기본 아이콘 표시
        if (fileThumbnail) fileThumbnail.style.display = 'none';
        if (fileIconDiv) fileIconDiv.style.display = 'block';
    }
    
    // 포인트 계산
    calculatePoints();
    
    // 업로드 버튼은 날짜 선택 후 활성화됨 (calculatePoints에서 처리)
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
            throw new Error('PDF.js 라이브러리가 로드되지 않았습니다');
        }
        
        // FileReader로 PDF 파일 읽기
        const arrayBuffer = await file.arrayBuffer();
        
        // PDF 문서 로드
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        
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
            viewport: scaledViewport
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
                let r = 0, g = 0, b = 0, count = 0;
                
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
        'seoul': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
        'gyeonggi': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
        'incheon': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
        'busan': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
        'daegu': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
        'gwangju': ['광산구', '남구', '동구', '북구', '서구'],
        'daejeon': ['대덕구', '동구', '서구', '유성구', '중구'],
        'ulsan': ['남구', '동구', '북구', '울주군', '중구'],
        'sejong': ['세종시'],
        'gangwon': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
        'chungbuk': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
        'chungnam': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
        'jeonbuk': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
        'jeonnam': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
        'gyeongbuk': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
        'gyeongnam': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
        'jeju': ['서귀포시', '제주시']
    };
    
    if (region1Value && regionMap[region1Value]) {
        region2Select.disabled = false;
        regionMap[region1Value].forEach(area => {
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
    
    let titleParts = [];
    
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
        const productName = productBtn.getAttribute('data-name') || productBtn.querySelector('span').textContent;
        titleParts.push(productName);
    }
    
    // 공급유형 추가
    if (supplyBtn) {
        const supplyName = supplyBtn.getAttribute('data-name') || supplyBtn.querySelector('span').textContent;
        titleParts.push(supplyName);
    }
    
    // 마지막에 "시장조사서" 추가
    if (titleParts.length > 0) {
        titleParts.push('시장조사서');
        titleInput.value = titleParts.join(' ');
    }
}

// 다운로드 포인트 계산 (기준 7,000P)
function calculateDownloadPoints(fileSizeMB, createDateStr) {
    const basePoints = 7000; // 기준 포인트 7,000P
    
    // 파일 크기를 숫자로 변환 (예: "12.5MB" → 12.5)
    const fileSize = typeof fileSizeMB === 'string' ? 
        parseFloat(fileSizeMB.replace(/[^0-9.]/g, '')) : fileSizeMB;
    
    // 파일 크기 지수
    let sizeMultiplier = 0;
    if (fileSize >= 5) {
        sizeMultiplier = 1.1; // 110%
    } else if (fileSize >= 2) {
        sizeMultiplier = 1.0; // 100%
    } else {
        sizeMultiplier = 0.7; // 70%
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
        // 날짜 파싱 실패 시 1년 이내로 가정 (기본 10,000P)
        return Math.round(basePoints * sizeMultiplier * 1.0 / 10) * 10;
    }
    
    const today = new Date();
    const daysDiff = Math.floor((today - createDate) / (1000 * 60 * 60 * 24));
    
    // 최신성 지수
    let freshnessMultiplier = 0;
    if (daysDiff <= 180) { // 6개월 이내
        freshnessMultiplier = 1.2; // 120%
    } else if (daysDiff <= 365) { // 1년 이내
        freshnessMultiplier = 1.0; // 100%
    } else if (daysDiff <= 730) { // 2년 이내
        freshnessMultiplier = 0.7; // 70%
    } else {
        freshnessMultiplier = 0.5; // 2년 초과는 50% (0이 아닌 최소값 보장)
    }
    
    // 최종 포인트 계산 후 10단위 반올림
    const totalPoints = basePoints * sizeMultiplier * freshnessMultiplier;
    return Math.round(totalPoints / 10) * 10;
}

// 업로드 포인트 계산 (기준 3,000P)
function calculatePoints() {
    const fileInput = document.getElementById('fileInput');
    const fileYear = document.getElementById('fileYear');
    const fileMonth = document.getElementById('fileMonth');
    const fileDay = document.getElementById('fileDay');
    const pointsValue = document.getElementById('pointsValue');
    
    if (!fileInput || !fileInput.files[0]) {
        if (pointsValue) pointsValue.textContent = '+0P';
        return;
    }
    
    const file = fileInput.files[0];
    const fileSize = file.size / (1024 * 1024); // MB
    const basePoints = 3000; // 기본 포인트 3000P
    let totalPoints = 0;
    
    // 파일 크기 지수
    let sizeMultiplier = 0;
    if (fileSize >= 5) {
        sizeMultiplier = 1.1; // 110%
    } else if (fileSize >= 2) {
        sizeMultiplier = 1.0; // 100%
    } else {
        sizeMultiplier = 0.7; // 70%
    }
    
    // 최신성 지수 (연/월/일 선택 기준)
    let freshnessMultiplier = 0;
    let daysDiff = null;
    let isOverTwoYears = false;
    
    if (fileYear && fileYear.value && fileMonth && fileMonth.value && fileDay && fileDay.value) {
        const selectedDate = new Date(fileYear.value, fileMonth.value - 1, fileDay.value);
        const today = new Date();
        daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 180) { // 6개월 이내
            freshnessMultiplier = 1.2; // 120%
        } else if (daysDiff <= 365) { // 1년 이내
            freshnessMultiplier = 1.0; // 100%
        } else if (daysDiff <= 730) { // 2년 이내
            freshnessMultiplier = 0.7; // 70%
        } else {
            freshnessMultiplier = 0; // 2년 초과는 0P
            isOverTwoYears = true;
        }
    }
    
    // 최종 포인트 계산: 기본 3000P × 최신성 지수 × 파일크기 지수
    totalPoints = Math.round(basePoints * sizeMultiplier * freshnessMultiplier);
    
    // 포인트 표시 - id를 pointsValue로 수정
    const pointResult = document.getElementById('pointsValue');
    if (pointResult) {
        pointResult.textContent = `+${totalPoints.toLocaleString()}P`;
    }
    
    // 2년 초과 시 경고 메시지 표시
    if (isOverTwoYears) {
        showToastMessage('24개월이 경과된 자료는 업로드할 수 없습니다.', 'error');
    }
    
    // 해당 지수 강조 표시
    if (daysDiff !== null) {
        highlightPointFactors(fileSize, daysDiff, sizeMultiplier, freshnessMultiplier, totalPoints);
    }
    
    // 모든 필수 필드가 입력되었는지 확인하고 중복검사 실행
    checkAllFieldsAndDuplicate();
    
    // 업로드 버튼 활성화 및 표시 (파일이 있고 날짜가 선택되고 2년 이내인 경우)
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    if (uploadSubmitBtn) {
        if (file && fileYear.value && fileMonth.value && fileDay.value && !isOverTwoYears) {
            uploadSubmitBtn.style.display = 'block';
            uploadSubmitBtn.disabled = false;
        } else {
            uploadSubmitBtn.style.display = 'none';
            uploadSubmitBtn.disabled = true;
        }
    }
}

// 포인트 요소 강조 표시 함수
function highlightPointFactors(fileSize, daysDiff, sizeMultiplier, freshnessMultiplier, totalPoints) {
    // 모든 테이블 행의 강조 제거 및 원본 텍스트 복원
    const fresh6m = document.getElementById('fresh-6m-value');
    const fresh1y = document.getElementById('fresh-1y-value');
    const fresh2y = document.getElementById('fresh-2y-value');
    const freshOver2y = document.getElementById('fresh-over2y-value');
    const size5mb = document.getElementById('size-5mb-value');
    const size2mb = document.getElementById('size-2mb-value');
    const sizeUnder2mb = document.getElementById('size-under2mb-value');
    
    // 초기화
    if (fresh6m) fresh6m.innerHTML = '120%';
    if (fresh1y) fresh1y.innerHTML = '100%';
    if (fresh2y) fresh2y.innerHTML = '70%';
    if (freshOver2y) freshOver2y.innerHTML = '업로드 불가';
    if (size5mb) size5mb.innerHTML = '110%';
    if (size2mb) size2mb.innerHTML = '100%';
    if (sizeUnder2mb) sizeUnder2mb.innerHTML = '70%';
    
    // 모든 행 스타일 초기화
    document.querySelectorAll('#pointDetailsDropdown table tr').forEach(row => {
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
        freshOver2y.innerHTML = '<span style="color: #dc2626; font-weight: bold;">✓</span> 업로드 불가';
        freshOver2y.parentElement.style.backgroundColor = '#fee2e2';
    }
    
    // 파일크기 지수 강조
    if (sizeMultiplier === 1.1 && size5mb) {
        // 5MB 이상 - 110%
        size5mb.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 110%';
        size5mb.parentElement.style.backgroundColor = '#fef3c7';
    } else if (sizeMultiplier === 1.0 && fileSize >= 2 && size2mb) {
        // 2~5MB - 100%
        size2mb.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 100%';
        size2mb.parentElement.style.backgroundColor = '#fef3c7';
    } else if (sizeMultiplier === 0.7 && sizeUnder2mb) {
        // 2MB 미만 - 70%
        sizeUnder2mb.innerHTML = '<span style="color: #22c55e; font-weight: bold;">✓</span> 70%';
        sizeUnder2mb.parentElement.style.backgroundColor = '#fef3c7';
    }
}

// 중복검사 키 생성 함수
function generateDuplicateKey() {
    const region1 = document.getElementById('uploadRegion1').value;
    const region2 = document.getElementById('uploadRegion2').value;
    const fileYear = document.getElementById('fileYear').value;
    const fileMonth = document.getElementById('fileMonth').value;
    const fileDay = document.getElementById('fileDay').value;
    const fileInput = document.getElementById('fileInput');
    const productBtn = document.querySelector('.upload-product-types .upload-type-btn.active');
    const supplyBtn = document.querySelector('.upload-supply-types .upload-type-btn.active');
    
    if (!fileInput || !fileInput.files[0]) return null;
    
    const file = fileInput.files[0];
    const fileSize = Math.round(file.size / (1024 * 1024)); // MB 단위로 반올림
    const productType = productBtn ? productBtn.dataset.type : null;
    const supplyType = supplyBtn ? supplyBtn.dataset.type : null;
    
    // 모든 필수 정보가 있는지 확인
    if (!region1 || !region2 || !fileYear || !fileMonth || !fileDay || !productType || !supplyType) {
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
    const duplicateAlert = document.getElementById('duplicateCheckAlert');
    if (!duplicateKey) {
        if (duplicateAlert) {
            duplicateAlert.style.display = 'none';
        }
        return;
    }
    
    // 모든 필수 필드가 입력되었으면 중복검사 실행
    checkDuplicateFile(duplicateKey);
}

// 중복 검사 함수
function checkDuplicateFile(duplicateKey) {
    if (!duplicateKey) return;
    
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
            duplicateCheckMessage.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #dc2626; margin-right: 6px; font-size: 12px;"></i><span style="color: #dc2626; font-weight: 500;">동일한 문서가 이미 업로드되었습니다</span>';
        } else {
            duplicateCheckInfo.style.background = '#f0fdf4';
            duplicateCheckInfo.style.borderColor = '#86efac';
            duplicateCheckMessage.innerHTML = '<i class="fas fa-check-circle" style="color: #16a34a; margin-right: 6px; font-size: 12px;"></i><span style="color: #16a34a; font-weight: 500;">중복되지 않은 새 문서입니다</span>';
        }
    }
    
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
            ${type === 'success' ? 
                '<i class="fas fa-check-circle"></i>' : 
                '<i class="fas fa-exclamation-circle"></i>'
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

// ===========================================
// 글로벌 포인트 변동 시스템
// ===========================================

// 포인트 획득 함수 (증가)
function earnPoints(amount, message = '포인트를 획득했습니다!', sourceElement = null) {
    if (amount <= 0) return;
    
    const currentPoints = userData.points || 0;
    const newPoints = currentPoints + amount;
    
    // 1. 플라잉 애니메이션 (sourceElement가 있으면 그 위치에서 시작)
    if (sourceElement) {
        animatePointsEarnedFromElement(amount, sourceElement);
    } else {
        animatePointsEarned(amount);
    }
    
    // 2. 카운팅 애니메이션 (0.5초 후 시작)
    setTimeout(() => {
        animatePointsCounter(currentPoints, newPoints);
        userData.points = newPoints;
        // localStorage에도 저장
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('userPoints', newPoints);
        }
    }, 500);
    
    // 3. 토스트 메시지
    showToastMessage(`${message} +${amount.toLocaleString()}P`, 'success');
}

// 포인트 사용 함수 (감소)
function spendPoints(amount, message = '포인트를 사용했습니다.', targetElement = null) {
    if (amount <= 0) return;
    
    const currentPoints = userData.points || 0;
    const newPoints = Math.max(0, currentPoints - amount); // 음수 방지
    
    // 1. 사용 애니메이션 (빨간색으로 아래로 떨어지는 효과)
    if (targetElement) {
        animatePointsSpentToElement(amount, targetElement);
    } else {
        animatePointsSpent(amount);
    }
    
    // 2. 카운팅 애니메이션 (즉시 시작)
    animatePointsCounter(currentPoints, newPoints, 1000, 'decrease');
    userData.points = newPoints;
    
    // localStorage에도 저장
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('userPoints', newPoints);
    }
    
    // 3. 토스트 메시지
    showToastMessage(`${message} -${amount.toLocaleString()}P`, 'info');
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
    
    // 입력 필드 초기화
    const titleInput = document.getElementById('documentTitle');
    if (titleInput) titleInput.value = '';
    
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
    document.querySelectorAll('.upload-type-btn').forEach(btn => {
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
    freshnessRows.forEach(row => {
        const checkCell = row.querySelector('td:last-child');
        if (checkCell) {
            checkCell.innerHTML = '';
            row.classList.remove('highlighted-row');
        }
    });
    
    // 파일크기 지수 초기화
    const fileSizeRows = document.querySelectorAll('#fileSizeTable tr');
    fileSizeRows.forEach(row => {
        const checkCell = row.querySelector('td:last-child');
        if (checkCell) {
            checkCell.innerHTML = '';
            row.classList.remove('highlighted-row');
        }
    });
}

// 파일 제거
function removeUploadedFile() {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const uploadZone = document.getElementById('uploadZone');
    const fileThumbnail = document.getElementById('fileThumbnail');
    const fileIconDiv = document.getElementById('fileIconDiv');
    const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
    const pointsValue = document.getElementById('pointsValue');
    
    // 파일 입력 초기화
    if (fileInput) fileInput.value = '';
    
    // UI 초기화
    if (fileInfo) fileInfo.classList.remove('show');
    if (uploadZone) uploadZone.classList.remove('has-file');
    if (fileThumbnail) fileThumbnail.style.display = 'none';
    if (fileIconDiv) fileIconDiv.style.display = 'block';
    if (uploadSubmitBtn) {
        uploadSubmitBtn.disabled = true;
        uploadSubmitBtn.style.display = 'none';
    }
    if (pointsValue) pointsValue.textContent = '+0P';
    
    // 중복검사 알림 숨기기
    const duplicateCheckInfo = document.getElementById('duplicateCheckInfo');
    if (duplicateCheckInfo) {
        duplicateCheckInfo.style.display = 'none';
    }
}

// 업로드 제출
function submitUpload() {
    const fileInput = document.getElementById('fileInput');
    const titleInput = document.getElementById('documentTitle');
    const region1 = document.getElementById('uploadRegion1');
    const region2 = document.getElementById('uploadRegion2');
    const fileYear = document.getElementById('fileYear');
    const fileMonth = document.getElementById('fileMonth');
    const fileDay = document.getElementById('fileDay');
    const productBtn = document.querySelector('.upload-product-types .upload-type-btn.active');
    const supplyBtn = document.querySelector('.upload-supply-types .upload-type-btn.active');
    const modal = document.getElementById('uploadModal');
    
    // 유효성 검사
    if (!fileInput || !fileInput.files[0]) {
        showToastMessage('파일을 선택해주세요.', 'error');
        return;
    }
    
    if (!region1 || !region1.value || !region2 || !region2.value) {
        showToastMessage('지역을 선택해주세요.', 'error');
        return;
    }
    
    if (!fileYear || !fileYear.value || !fileMonth || !fileMonth.value || !fileDay || !fileDay.value) {
        showToastMessage('파일 생성 날짜를 모두 선택해주세요.', 'error');
        return;
    }
    
    // 2년 초과 확인
    const selectedDate = new Date(fileYear.value, fileMonth.value - 1, fileDay.value);
    const today = new Date();
    const daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 730) { // 2년(730일) 초과
        showToastMessage('24개월이 경과된 자료는 업로드할 수 없습니다.', 'error');
        return;
    }
    
    if (!productBtn) {
        showToastMessage('상품유형을 선택해주세요.', 'error');
        return;
    }
    
    if (!supplyBtn) {
        showToastMessage('공급유형을 선택해주세요.', 'error');
        return;
    }
    
    // 중복 검사 먼저 실행
    const duplicateKey = generateDuplicateKey();
    if (duplicateKey) {
        if (typeof uploadedFilesRegistry === 'undefined') {
            window.uploadedFilesRegistry = new Set();
        }
        
        // 중복 여부 확인
        if (uploadedFilesRegistry.has(duplicateKey)) {
            showToastMessage('동일한 문서가 이미 업로드되었습니다.', 'error');
            return;
        }
    }
    
    // 최종 확인 정보 생성
    const file = fileInput.files[0];
    const fileSize = (file.size / (1024 * 1024)).toFixed(1);
    const pointsValue = document.getElementById('pointsValue');
    const points = pointsValue ? pointsValue.textContent : '+0P';
    const region1Text = region1.options[region1.selectedIndex].text;
    const productName = productBtn.getAttribute('data-name') || productBtn.querySelector('span').textContent;
    const supplyName = supplyBtn.getAttribute('data-name') || supplyBtn.querySelector('span').textContent;
    const fileDate = `${fileYear.value}년 ${fileMonth.value}월 ${fileDay.value}일`;
    // 날짜 형식 변환 (YYYY.MM.DD 형식으로)
    const formattedFileDate = `${fileYear.value}.${String(fileMonth.value).padStart(2, '0')}.${String(fileDay.value).padStart(2, '0')}`;
    
    // 업로드 처리 (실제로는 서버로 전송)
    console.log('업로드 정보:', {
        file: file.name,
        title: titleInput.value,
        region1: region1.value,
        region2: region2.value,
        fileDate: fileDate,
        productType: productBtn.getAttribute('data-type'),
        supplyType: supplyBtn.getAttribute('data-type'),
        points: points
    });
    
    // 포인트 획득량 계산
    const earnedPoints = parseInt(points.replace(/[^0-9]/g, ''));
    
    // 다운로드 포인트 계산
    const downloadPoints = calculateDownloadPoints(fileSize, `자료생성일: ${fileDate}`);
    
    // 새 문서 객체 생성 및 목록에 추가
    const newDoc = {
        id: sampleDocuments.length + 1,
        title: titleInput.value,
        type: productBtn.getAttribute('data-type'),
        region: region1.value,
        district: region2.value,
        location: `${region1Text} ${region2.value}`,
        date: formattedFileDate,  // 파일 생성일을 표시
        createDate: `자료생성일: ${fileDate}`,
        fileSize: fileSize + ' MB',
        fileType: file.name.split('.').pop().toUpperCase(),
        pages: Math.floor(Math.random() * 40) + 20,
        uploadPoints: earnedPoints,  // 업로드 시 획득 포인트
        points: downloadPoints,  // 다운로드 시 필요 포인트
        supplyType: supplyName,
        isPremium: earnedPoints >= 3000,
        keywords: [],
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="160"%3E%3Crect width="120" height="160" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" fill="%236b7280" font-size="12"%3EPDF%3C/text%3E%3C/svg%3E',
        description: titleInput.value,
        author: userData.name || '익명',
        downloads: 0,
        views: 0
    };
    
    // 문서 목록 맨 앞에 추가
    sampleDocuments.unshift(newDoc);
    
    // 업로드 성공 후 레지스트리에 추가
    if (duplicateKey) {
        uploadedFilesRegistry.add(duplicateKey);
    }
    
    // 화면 갱신
    renderDocuments(sampleDocuments);
    updateResultCount(sampleDocuments.length);
    
    // 미리보기 모달 이벤트 재초기화 (업로드 후 이벤트 유지)
    setTimeout(() => {
        initializePreviewModal();
    }, 100);
    
    // 글로벌 포인트 시스템 사용 - 업로드 버튼 요소 찾기
    const uploadButton = document.getElementById('btnUpload');
    
    // 포인트 획득 처리 (애니메이션과 업데이트 모두 처리)
    earnPoints(earnedPoints, '문서가 성공적으로 업로드되었습니다!', uploadButton);
    
    // 모달 닫기 (애니메이션 시작 후 바로)
    setTimeout(() => {
        if (modal) modal.classList.remove('active');
        resetUploadForm();
    }, 300);
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
    
    // 선택한 문서의 인덱스 찾기
    currentPreviewIndex = currentFilteredDocuments.findIndex(doc => doc.id === docId);
    
    if (currentPreviewIndex === -1) return;
    
    console.log(`문서 열기 - ID: ${docId}, 인덱스: ${currentPreviewIndex}, 전체: ${currentFilteredDocuments.length}개`);
    
    showMinimalPreview(currentFilteredDocuments[currentPreviewIndex]);
}

// 미니멀 미리보기 표시
function showMinimalPreview(doc) {
    const modal = document.getElementById('previewModal');
    if (!modal) return;
    
    // 문서 타입 찾기
    const productType = productTypes.find(t => t.id === doc.type) || { name: '기타', color: '#6b7280' };
    
    // 미리보기 정보 업데이트
    document.getElementById('previewTitle').textContent = doc.title;
    document.querySelector('.preview-type-badge').textContent = productType.name;
    document.querySelector('.preview-type-badge').style.backgroundColor = productType.color;
    document.getElementById('previewLocation').textContent = doc.location;
    document.getElementById('previewFileSize').textContent = doc.fileSize;
    document.getElementById('previewDate').textContent = doc.createDate.replace('자료생성일: ', '');
    document.getElementById('previewPoints').textContent = doc.points.toLocaleString();
    
    // 포인트 계산 요소 업데이트
    const fileSize = parseFloat(doc.fileSize.replace(/[^0-9.]/g, ''));
    const createDateStr = doc.createDate.replace('자료생성일: ', '').trim();
    
    // 날짜 파싱
    let dateStr = createDateStr.replace(/년/g, '.').replace(/월/g, '.').replace(/일/g, '').trim();
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
    
    // 파일크기 지수 표시
    let sizeText = '';
    let sizeMultiplier = 0;
    if (fileSize >= 5) {
        sizeText = `${doc.fileSize} (110%)`;
        sizeMultiplier = 1.1;
    } else if (fileSize >= 2) {
        sizeText = `${doc.fileSize} (100%)`;
        sizeMultiplier = 1.0;
    } else {
        sizeText = `${doc.fileSize} (70%)`;
        sizeMultiplier = 0.7;
    }
    
    // 요소 업데이트
    const freshnessElement = document.getElementById('freshnessIndex');
    if (freshnessElement) freshnessElement.textContent = freshnessText;
    
    const sizeElement = document.getElementById('fileSizeIndex');
    if (sizeElement) sizeElement.textContent = sizeText;
    
    // 계산식 업데이트
    const formulaElement = document.getElementById('pointFormula');
    if (formulaElement) {
        const calculatedPoints = Math.round(7000 * freshnessMultiplier * sizeMultiplier / 10) * 10;
        formulaElement.textContent = `기준 7,000P × ${freshnessMultiplier} × ${sizeMultiplier} = ${calculatedPoints.toLocaleString()}P`;
    }
    
    // 카운터 업데이트
    document.querySelector('.preview-document-counter').textContent = 
        `${currentPreviewIndex + 1} / ${currentFilteredDocuments.length}`;
    
    // 네비게이션 버튼 상태 업데이트
    const prevBtn = document.querySelector('.preview-nav-prev');
    const nextBtn = document.querySelector('.preview-nav-next');
    
    // < 버튼: 최신 문서로 이동 (인덱스 감소)
    if (prevBtn) {
        prevBtn.style.display = currentPreviewIndex > 0 ? 'flex' : 'none';
    }
    // > 버튼: 이전 문서로 이동 (인덱스 증가)
    if (nextBtn) {
        nextBtn.style.display = currentPreviewIndex < currentFilteredDocuments.length - 1 ? 'flex' : 'none';
    }
    
    // 모달 표시
    modal.classList.add('active');
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
        closeBtn.onclick = function() {
            const modal = document.getElementById('previewModal');
            if (modal) modal.classList.remove('active');
        };
    }
    
    // 오버레이 클릭으로 닫기
    const overlay = document.querySelector('.preview-overlay');
    if (overlay) {
        overlay.onclick = function() {
            const modal = document.getElementById('previewModal');
            if (modal) modal.classList.remove('active');
        };
    }
    
    // < 버튼 - 최신 문서로 (목록에서 위로 = 인덱스 감소)
    const prevBtn = document.querySelector('.preview-nav-prev');
    if (prevBtn) {
        prevBtn.onclick = function() {
            console.log('< 버튼 클릭 - 최신 문서로 (인덱스 감소)');
            navigateToPreviousDoc();
        };
    }
    
    // > 버튼 - 이전 문서로 (목록에서 아래로 = 인덱스 증가)
    const nextBtn = document.querySelector('.preview-nav-next');
    if (nextBtn) {
        nextBtn.onclick = function() {
            console.log('> 버튼 클릭 - 이전 문서로 (인덱스 증가)');
            navigateToNextDoc();
        };
    }
    
    // 다운로드 버튼
    const downloadBtn = document.getElementById('previewDownloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = function() {
            console.log('다운로드 버튼 클릭');
            if (currentPreviewIndex >= 0 && currentFilteredDocuments[currentPreviewIndex]) {
                const doc = currentFilteredDocuments[currentPreviewIndex];
                const points = doc.points || 7000;
                
                console.log('다운로드 문서:', doc.title, '포인트:', points);
                
                // 포인트 차감 애니메이션
                const targetElement = this;
                spendPoints(points, `${doc.title} 다운로드`, targetElement);
                
                // 다운로드 처리
                showToastMessage(`${doc.title} 다운로드가 시작되었습니다.`, 'success');
                
                // 모달 닫기
                setTimeout(() => {
                    const modal = document.getElementById('previewModal');
                    if (modal) modal.classList.remove('active');
                }, 500);
            }
        };
    }
    
    // 장바구니 버튼
    const cartBtn = document.getElementById('previewCartBtn');
    if (cartBtn) {
        cartBtn.onclick = function() {
            console.log('장바구니 버튼 클릭');
            if (currentPreviewIndex >= 0 && currentFilteredDocuments[currentPreviewIndex]) {
                const doc = currentFilteredDocuments[currentPreviewIndex];
                console.log('장바구니 추가 문서:', doc.title);
                showToastMessage(`${doc.title}이(가) 장바구니에 추가되었습니다.`, 'success');
            }
        };
    }
    
    // 키보드 네비게이션
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('previewModal');
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateToPreviousDoc();  // 위/왼쪽 = 최신 문서로 (인덱스 감소)
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                navigateToNextDoc();  // 아래/오른쪽 = 이전 문서로 (인덱스 증가)
            } else if (e.key === 'Escape') {
                modal.classList.remove('active');
            }
        }
    });
}

// ===========================================
// DOM 로드 완료 시 초기화
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Market Research page loaded');
    console.log('Checking for filter elements...');
    
    // 기존 sampleDocuments의 포인트를 다운로드 포인트로 재계산
    sampleDocuments.forEach(doc => {
        // 업로드 포인트 저장 (기존 points 값을 업로드 포인트로 사용)
        doc.uploadPoints = doc.points || 3000;
        
        // 다운로드 포인트 계산
        doc.points = calculateDownloadPoints(doc.fileSize, doc.createDate);
    });
    
    // 필터 요소들 확인
    const regionSelectors = document.querySelectorAll('.region-filter .nav-selector');
    const productSelectors = document.querySelectorAll('#productTypeFilters .checkbox-tab');
    const supplySelectors = document.querySelectorAll('#supplyTypeFilters .checkbox-tab');
    
    console.log('Found region selectors:', regionSelectors.length);
    console.log('Found product selectors:', productSelectors.length);
    console.log('Found supply selectors:', supplySelectors.length);
    
    // 초기 상태 설정 - '전체' 탭을 active로
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
    
    // 필터 초기화
    initializeFilters();
    
    // 이벤트 리스너 초기화
    initializeEventListeners();
    
    // uploadSystem.init() 제거 - 새로운 업로드 시스템 사용
    // uploadSystem.init();
    
    // 개선된 업로드 모달 기능 초기화
    initEnhancedUploadModal();
    
    // 미리보기 모달 초기화
    initializePreviewModal();
    
    // 초기 문서 렌더링
    renderDocuments(sampleDocuments);
    updateResultCount(sampleDocuments.length);
    
    // 사용자 포인트 표시
    updateUserPoints();
});