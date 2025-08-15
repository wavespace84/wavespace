// 분양영업 구인구직 페이지 JavaScript

// 지역 데이터 (광역시도 -> 시군구)
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

// 모의 데이터 - 실제 등록글처럼 필터에 걸리도록 수정
const jobListings = [
    {
        id: 1,
        company: '현대건설',
        title: '힐스테이트 성남 중앙 분양영업 팀장 모집',
        location: '경기 성남시 분당구',
        experience: '경력 5년 이상',
        salary: '연봉 7,000만원 이상',
        employment: '정규직',
        description: '힐스테이트 성남 중앙 현장에서 분양영업팀을 이끌어갈 팀장급 인재를 모집합니다. 우수한 성과급과 복지 제공...',
        tags: ['대기업', '성과급우수', '복지최고'],
        isPremium: true,
        isUrgent: true,
        isHot: false,
        views: 1234,
        applicants: 15,
        deadline: 7,
        postedDate: new Date('2024-01-15')
    },
    {
        id: 2,
        company: 'GS건설',
        title: '자이 강남 퍼스트 분양영업 팀원 채용',
        location: '서울 강남구',
        experience: '경력 3~7년',
        salary: '연봉 협의',
        employment: '정규직',
        description: '자이 강남 퍼스트 프로젝트 분양영업팀 팀원을 모집합니다. 강남권 영업 경험자 우대...',
        tags: ['대기업', '강남', '경력환영'],
        isPremium: false,
        isNew: true,
        views: 567,
        applicants: 8,
        deadline: 14,
        postedDate: new Date('2024-01-20')
    },
    {
        id: 3,
        company: '대우건설',
        title: '푸르지오 평택 분양 사이드 모집',
        location: '경기 평택시',
        experience: '경력무관',
        salary: '건별 협의',
        employment: '프리랜서',
        description: '푸르지오 평택 현장 분양 사이드 업무를 담당할 프리랜서를 모집합니다...',
        tags: ['프리랜서', '경기', '수수료'],
        isPremium: false,
        views: 234,
        applicants: 3,
        deadline: null,
        postedDate: new Date('2024-01-18')
    },
    {
        id: 4,
        company: '삼성물산',
        title: '래미안 대오션시티 본부 총괄 모집',
        location: '부산 해운대구',
        experience: '경력 10년 이상',
        salary: '연봉 1억 이상',
        employment: '정규직',
        description: '래미안 대오션시티 프로젝트 전체 분양을 총괄할 본부 담당자를 모집합니다...',
        tags: ['대기업', '고연봉', '임원급'],
        isPremium: true,
        isHot: true,
        views: 2341,
        applicants: 23,
        deadline: 3,
        postedDate: new Date('2024-01-19')
    },
    {
        id: 5,
        company: '롯데건설',
        title: '롯데캐슬 천안 아산 팀장 모집',
        location: '충남 천안시',
        experience: '경력 5년+',
        salary: '연봉 6,500만원',
        employment: '정규직',
        description: '롯데캐슬 천안 아산 프로젝트 팀장을 모집합니다...',
        tags: ['대기업', '팀장급'],
        isPremium: false,
        isNew: true,
        views: 890,
        applicants: 12,
        deadline: 10,
        postedDate: new Date('2024-01-18')
    },
    {
        id: 6,
        company: '대림건설',
        title: 'e편한세상 검단 팀원 채용',
        location: '경기 용인시',
        experience: '신입/경력',
        salary: '연봉 협의',
        employment: '정규직',
        description: 'e편한세상 검단 프로젝트 팀원을 모집합니다...',
        tags: ['신입가능', '용인'],
        isPremium: false,
        isUrgent: true,
        views: 456,
        applicants: 6,
        deadline: 2,
        postedDate: new Date('2024-01-19')
    },
    {
        id: 7,
        company: '포스코건설',
        title: '아크로리버 하남 팀장 모집',
        location: '경기 하남시',
        experience: '경력 7년+',
        salary: '연봉 7,200만원',
        employment: '정규직',
        description: '아크로리버 하남 프로젝트 팀장급 인재를 모집합니다...',
        tags: ['대기업', '하남신도시'],
        isPremium: true,
        isUrgent: false,
        views: 1567,
        applicants: 21,
        deadline: 5,
        postedDate: new Date('2024-01-16')
    },
    {
        id: 8,
        company: 'HDC현대산업개발',
        title: '아이파크 의정부 사이드 모집',
        location: '경기 의정부시',
        experience: '경력무관',
        salary: '건별 수수료',
        employment: '프리랜서',
        description: '아이파크 의정부 프로젝트 사이드 업무를 담당할 분을 모집합니다...',
        tags: ['사이드', '경력무관'],
        isPremium: false,
        isUrgent: false,
        views: 345,
        applicants: 4,
        deadline: null,
        postedDate: new Date('2024-01-14')
    },
    {
        id: 9,
        company: '한화건설',
        title: '꿈의숲 센트럴 본부 운영팀장 모집',
        location: '경기 수원시',
        experience: '경력 8년+',
        salary: '연봉 8,000만원',
        employment: '정규직',
        description: '꿈의숲 센트럴 프로젝트 본부 운영팀장을 모집합니다...',
        tags: ['본부', '수원'],
        isPremium: false,
        isUrgent: false,
        views: 678,
        applicants: 9,
        deadline: 7,
        postedDate: new Date('2024-01-17')
    },
    {
        id: 10,
        company: '포스코E&C',
        title: '더샵 센트럴시티 팀장 모집',
        location: '부산 해운대구',
        experience: '경력 6년+',
        salary: '연봉 6,800만원',
        employment: '정규직',
        description: '더샵 센트럴시티 프로젝트 팀장을 모집합니다...',
        tags: ['부산', '해운대'],
        isPremium: false,
        isUrgent: false,
        views: 789,
        applicants: 11,
        deadline: 15,
        postedDate: new Date('2024-01-21')
    }
];

// 배열 셔플 함수
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 페이지 로드 시마다 랜덤하게 섞인 상단 배너용 데이터
const pinnedJobs = shuffleArray([...jobListings]);

// 북마크 상태 관리
let bookmarkedJobs = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');

// 필터 상태
let currentFilters = {
    selectedRegions: [],  // 선택된 지역 (광역시도 + 시군구)
    currentRegion: 'all',  // 현재 선택된 광역시도
    experience: 'all',
    employment: 'all',
    keyword: 'all',  // 핵심키워드 필터
    status: []  // 상태는 다중선택 가능
};

// 정렬 상태
let currentSort = 'latest'; // 기본값: 최신순

// DOM 요소
const jobGridContainer = document.querySelector('.job-list-section');
const jobListContainer = document.querySelector('.job-list-section'); // fallback
const jobListSection = document.querySelector('.job-list-section'); // 목록형 섹션
const writeBtn = document.querySelector('.btn-write');
const searchInput = document.getElementById('searchInput');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    initializeEventListeners();
    initializeAdBanner();
    renderPinnedBanner();
    updateStatistics();
    renderJobList();
});

// 필터 초기화
function initializeFilters() {
    console.log('Initializing filters...');
    
    // 지역 선택 nav-selector 이벤트 리스너
    const regionSelectors = document.querySelectorAll('.filter-group:first-child .nav-selector');
    regionSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            const value = this.dataset.value;
            handleRegionChange(value, this);
        });
    });
    
    // 모집유형 선택 checkbox-tab 이벤트 리스너 (라디오 버튼)
    const employmentTabs = document.querySelectorAll('.employment-tabs .checkbox-tab');
    employmentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            const value = radio.value;
            
            // 라디오 버튼 체크
            radio.checked = true;
            
            // active 클래스 관리
            document.querySelectorAll('.employment-tabs .checkbox-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            handleEmploymentChange(value, this);
        });
    });
    
    // 핵심키워드 선택 checkbox-tab 이벤트 리스너 (라디오 버튼)
    const keywordTabs = document.querySelectorAll('.notice-style-tabs .checkbox-tab');
    keywordTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            const value = radio.value;
            
            // 라디오 버튼 체크
            radio.checked = true;
            
            // active 클래스 관리
            document.querySelectorAll('.notice-style-tabs .checkbox-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            handleKeywordChange(value, this);
        });
    });
    
    console.log('Filters initialized successfully');
}

// 모집유형 선택 처리
function handleEmploymentChange(value, selectedElement) {
    console.log('Employment changed to:', value);
    
    // 영어 값을 한국어로 변환
    const employmentMap = {
        'all': 'all',
        'head': '본부',
        'headquarters': '본부', 
        'team-leader': '팀장',
        'team-member': '팀원',
        'side': '사이드'
    };
    
    currentFilters.employment = employmentMap[value] || value;
    
    // 지역 선택창은 닫지 않음 (주소 선택창 유지)
    // 기존 nav-selector 방식과 달리 체크박스 탭은 클릭 이벤트에서 이미 처리됨
    
    renderJobList();
}

// 핵심키워드 선택 처리
function handleKeywordChange(value, selectedElement) {
    console.log('Keyword changed to:', value);
    
    currentFilters.keyword = value;
    renderJobList();
}

// 다른 필터 라디오 버튼 처리 (경력, 고용, 상태)
function handleFilterRadioChange(e) {
    const radio = e.target;
    const filterName = radio.name;
    const value = radio.value;
    
    // active 클래스 업데이트
    document.querySelectorAll(`input[name="${filterName}"]`).forEach(r => {
        r.parentElement.classList.toggle('active', r.checked);
    });
    
    currentFilters[filterName] = value;
    renderJobList();
}

// 지역 선택 처리
function handleRegionChange(value, selectedElement) {
    console.log('Region changed to:', value);
    
    // 모든 지역 nav-selector에서 selected 클래스 제거
    document.querySelectorAll('.filter-group:first-child .nav-selector').forEach(selector => {
        selector.classList.remove('selected');
    });
    
    // 선택된 요소에 selected 클래스 추가
    selectedElement.classList.add('selected');
    
    const subRegionRow = document.getElementById('subRegionRow');
    const subRegionFilters = document.getElementById('subRegionFilters');
    
    currentFilters.currentRegion = value;
    
    if (value === 'all') {
        // '전체' 선택 시
        subRegionRow.style.display = 'none';
        currentFilters.selectedRegions = [];
        updateSelectedRegionsDisplay();
    } else {
        // 특정 지역 선택 시
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
    }
    
    renderJobList();
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
    renderJobList();
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

// 선택된 지역 표시 업데이트
function updateSelectedRegionsDisplay() {
    const selectedRegionsDiv = document.getElementById('selectedRegions');
    const selectedTagsDiv = document.getElementById('selectedTags');
    
    if (currentFilters.selectedRegions.length === 0) {
        selectedRegionsDiv.style.display = 'none';
    } else {
        selectedRegionsDiv.style.display = 'block';
        
        let tagsHTML = '';
        currentFilters.selectedRegions.forEach(region => {
            tagsHTML += `
                <span class="region-tag">
                    ${region}
                    <span class="remove-tag" data-region="${region}">×</span>
                </span>
            `;
        });
        
        selectedTagsDiv.innerHTML = tagsHTML;
        
        // 태그 제거 이벤트
        selectedTagsDiv.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const regionToRemove = e.target.dataset.region;
                currentFilters.selectedRegions = currentFilters.selectedRegions.filter(r => r !== regionToRemove);
                
                // 체크박스 해제
                const parts = regionToRemove.split(' ');
                if (parts.length === 2) {
                    const checkbox = document.querySelector(`input[name="subregion"][value="${parts[1]}"]`);
                    if (checkbox) {
                        checkbox.checked = false;
                        checkbox.parentElement.classList.remove('active');
                    }
                }
                
                updateSelectedRegionsDisplay();
                renderJobList();
            });
        });
    }
}

// 상태 필터 체크박스 처리
function handleStatusChange(e) {
    const checkbox = e.target;
    const value = checkbox.value;
    
    if (value === 'all') {
        // 전체 체크박스 처리
        if (checkbox.checked) {
            // 모든 상태 체크박스 체크
            document.querySelectorAll('input[name="status"]').forEach(cb => {
                cb.checked = true;
                cb.parentElement.classList.add('active');
                const statusValue = cb.value;
                if (!currentFilters.status.includes(statusValue)) {
                    currentFilters.status.push(statusValue);
                }
            });
        } else {
            // 모든 상태 체크박스 해제
            document.querySelectorAll('input[name="status"]').forEach(cb => {
                cb.checked = false;
                cb.parentElement.classList.remove('active');
            });
            currentFilters.status = [];
        }
        checkbox.parentElement.classList.toggle('active', checkbox.checked);
    } else {
        // 개별 상태 체크박스 처리
        if (checkbox.checked) {
            if (!currentFilters.status.includes(value)) {
                currentFilters.status.push(value);
            }
            checkbox.parentElement.classList.add('active');
        } else {
            currentFilters.status = currentFilters.status.filter(s => s !== value);
            checkbox.parentElement.classList.remove('active');
            
            // 전체 체크박스 해제
            const allCheckbox = document.querySelector('input[name="status-all"]');
            if (allCheckbox) {
                allCheckbox.checked = false;
                allCheckbox.parentElement.classList.remove('active');
            }
        }
        
        // 모든 개별 체크박스가 선택되었는지 확인
        const allStatusCheckboxes = document.querySelectorAll('input[name="status"]');
        const allChecked = Array.from(allStatusCheckboxes).every(cb => cb.checked);
        const allCheckbox = document.querySelector('input[name="status-all"]');
        if (allCheckbox) {
            allCheckbox.checked = allChecked;
            allCheckbox.parentElement.classList.toggle('active', allChecked);
        }
    }
    
    renderJobList();
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 구인공고 등록 버튼 (상단)
    if (writeBtn) {
        writeBtn.addEventListener('click', () => {
            openWriteModal();
        });
    }
    
    // 플로팅 구인공고 등록 버튼
    const floatingWriteBtn = document.querySelector('.floating-write-btn');
    if (floatingWriteBtn) {
        floatingWriteBtn.addEventListener('click', () => {
            openWriteModal();
        });
    }
    
    // 팝업 관련 이벤트 리스너
    initializeModalEvents();
    
    // 동적으로 생성되는 요소들에 대한 이벤트 위임
    const container = jobGridContainer || jobListContainer;
    if (container) {
        container.addEventListener('click', handleJobListClick);
    }
    
    // 목록형 섹션에도 이벤트 리스너 추가
    if (jobListSection) {
        jobListSection.addEventListener('click', handleJobListClick);
    }
    
    // 정렬 버튼 이벤트 리스너
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const sortType = this.dataset.sort;
            
            // 현재 선택된 버튼 활성화 상태 업데이트
            sortButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 정렬 상태 업데이트
            currentSort = sortType;
            
            // 리스트 다시 렌더링
            renderJobList();
        });
    });
}


// 구인공고 리스트 클릭 이벤트 처리
function handleJobListClick(e) {
    const target = e.target;
    
    // 북마크 버튼 클릭 (카드형과 목록형 모두 처리)
    if (target.closest('.btn-bookmark') || target.closest('.btn-bookmark-small')) {
        e.stopPropagation();
        const item = target.closest('.job-card') || target.closest('.job-list-item');
        const jobId = item.dataset.jobId;
        const bookmarkBtn = target.closest('.btn-bookmark') || target.closest('.btn-bookmark-small');
        toggleBookmark(jobId, bookmarkBtn);
        return;
    }
    
    // 카드 클릭 또는 목록 아이템 클릭 (팝업 열기)
    const jobCard = target.closest('.job-card');
    const jobListItem = target.closest('.job-list-item');
    
    if (jobCard || jobListItem) {
        const item = jobCard || jobListItem;
        const jobId = item.dataset.jobId;
        showJobDetail(jobId);
    }
}

// 북마크 토글
function toggleBookmark(jobId, button) {
    const index = bookmarkedJobs.indexOf(jobId);
    
    if (index > -1) {
        bookmarkedJobs.splice(index, 1);
        button.classList.remove('active');
        button.innerHTML = '<i class="far fa-bookmark"></i>';
    } else {
        bookmarkedJobs.push(jobId);
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-bookmark"></i>';
    }
    
    localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarkedJobs));
}

// 구인공고 상세 팝업 표시
function showJobDetail(jobId) {
    const job = jobListings.find(j => j.id == jobId);
    if (!job) return;
    
    // 팝업 HTML 생성
    const popupHTML = `
        <div class="job-detail-overlay" onclick="closeJobDetail()">
            <div class="job-detail-popup" onclick="event.stopPropagation()">
                <button class="popup-close" onclick="closeJobDetail()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="popup-header">
                    <div class="popup-company">
                        <h2>${job.company}</h2>
                        <p>${job.title}</p>
                    </div>
                    <div class="popup-badges">
                        ${job.isPremium ? '<span class="badge premium">프리미엄</span>' : ''}
                        ${job.isUrgent ? '<span class="badge urgent">긴급</span>' : ''}
                        ${job.isNew ? '<span class="badge new">NEW</span>' : ''}
                    </div>
                </div>
                <div class="popup-content">
                    <div class="popup-info-grid">
                        <div class="popup-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>근무지</span>
                            <strong>${job.location}</strong>
                        </div>
                        <div class="popup-info-item">
                            <i class="fas fa-briefcase"></i>
                            <span>경력</span>
                            <strong>${job.experience}</strong>
                        </div>
                        <div class="popup-info-item">
                            <i class="fas fa-won-sign"></i>
                            <span>급여</span>
                            <strong>${job.salary}</strong>
                        </div>
                        <div class="popup-info-item">
                            <i class="fas fa-file-contract"></i>
                            <span>고용형태</span>
                            <strong>${job.employment}</strong>
                        </div>
                    </div>
                    <div class="popup-description">
                        <h3>상세 내용</h3>
                        <p>${job.description}</p>
                    </div>
                    <div class="popup-tags">
                        ${job.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="popup-footer">
                    <button class="btn-bookmark-large ${bookmarkedJobs.includes(job.id.toString()) ? 'active' : ''}" onclick="toggleBookmark('${job.id}', this)">
                        <i class="${bookmarkedJobs.includes(job.id.toString()) ? 'fas' : 'far'} fa-bookmark"></i>
                        북마크
                    </button>
                    <button class="btn-apply-large" onclick="applyToJob('${job.id}')">
                        지원하기
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 팝업 추가
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    document.body.style.overflow = 'hidden';
}

// 팝업 닫기
function closeJobDetail() {
    const overlay = document.querySelector('.job-detail-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
    }
}

// 지원하기
function applyToJob(jobId) {
    const job = jobListings.find(j => j.id == jobId);
    if (job) {
        const confirmMessage = `${job.company}의 "${job.title}" 공고에 지원하시겠습니까?`;
        if (confirm(confirmMessage)) {
            alert('지원이 완료되었습니다.\n마이페이지에서 지원 현황을 확인하실 수 있습니다.');
            closeJobDetail();
        }
    }
}

// 통계 업데이트
function updateStatistics() {
    const totalJobs = jobListings.length;
    const urgentJobs = jobListings.filter(job => job.isUrgent).length;
    const todayJobs = jobListings.filter(job => {
        const today = new Date();
        return job.postedDate.toDateString() === today.toDateString();
    }).length;
    const premiumJobs = jobListings.filter(job => job.isPremium).length;
    
    // 총 공고 수 업데이트
    const totalCountElement = document.getElementById('totalCount');
    if (totalCountElement) {
        totalCountElement.textContent = totalJobs;
    }
    
    // 간소화된 통계 업데이트
    const statsSimple = document.querySelector('.stats-simple');
    if (statsSimple) {
        const statItems = statsSimple.querySelectorAll('.stat-item strong');
        if (statItems.length >= 4) {
            statItems[0].textContent = totalJobs;
            statItems[1].textContent = urgentJobs;
            statItems[2].textContent = todayJobs;
            statItems[3].textContent = premiumJobs;
        }
    }
}

// 구인공고 리스트 렌더링
function renderJobList() {
    const container = jobGridContainer || jobListContainer;
    if (!container) return;
    
    // 필터링된 구인공고 가져오기
    let filteredJobs = filterJobs(jobListings);
    
    // 검색어 필터링 적용
    filteredJobs = getSearchFilteredJobs(filteredJobs);
    
    // 정렬 적용
    filteredJobs = sortJobs(filteredJobs);
    
    // 필터링된 결과에 따른 카운트 업데이트
    const totalCountElement = document.getElementById('totalCount');
    if (totalCountElement) {
        totalCountElement.textContent = filteredJobs.length;
    }
    
    // HTML 생성
    const jobCardsHTML = filteredJobs.map(job => createJobCardHTML(job)).join('');
    
    // 기존 구인공고 카드 제거 후 새로 추가
    const existingCards = container.querySelectorAll('.job-card');
    existingCards.forEach(card => card.remove());
    
    container.insertAdjacentHTML('afterbegin', jobCardsHTML);
}

// 구인공고 필터링
function filterJobs(jobs) {
    return jobs.filter(job => {
        // 지역 필터
        if (currentFilters.selectedRegions.length > 0) {
            let regionMatch = false;
            
            // 선택된 지역 중 하나라도 매칭되면 OK
            for (const selectedRegion of currentFilters.selectedRegions) {
                const parts = selectedRegion.split(' ');
                if (parts.length === 2) {
                    // 시군구까지 선택된 경우
                    if (job.location.includes(parts[0]) && job.location.includes(parts[1])) {
                        regionMatch = true;
                        break;
                    }
                } else if (parts.length === 1) {
                    // 광역시도만 선택된 경우
                    if (job.location.includes(parts[0])) {
                        regionMatch = true;
                        break;
                    }
                }
            }
            
            if (!regionMatch) return false;
        }
        
        // 경력 필터
        if (currentFilters.experience !== 'all') {
            let expMatch = false;
            if (currentFilters.experience === 'new' && job.experience.includes('신입')) expMatch = true;
            if (currentFilters.experience === '1-3' && job.experience.includes('1~3년')) expMatch = true;
            if (currentFilters.experience === '3-5' && (job.experience.includes('3~5년') || job.experience.includes('3~7년'))) expMatch = true;
            if (currentFilters.experience === '5-10' && (job.experience.includes('5~10년') || job.experience.includes('5년 이상'))) expMatch = true;
            if (currentFilters.experience === '10+' && job.experience.includes('10년')) expMatch = true;
            if (!expMatch && !job.experience.includes('무관')) return false;
        }
        
        // 모집유형 필터
        if (currentFilters.employment !== 'all') {
            let empMatch = false;
            
            // title에서 모집유형 키워드 검색 (본부장 -> 본부로 매칭)
            if (currentFilters.employment === '본부' && (job.title.includes('본부') || job.title.includes('본부장'))) empMatch = true;
            if (currentFilters.employment === '팀장' && job.title.includes('팀장')) empMatch = true;
            if (currentFilters.employment === '팀원' && job.title.includes('팀원')) empMatch = true;
            if (currentFilters.employment === '사이드' && job.title.includes('사이드')) empMatch = true;
            
            if (!empMatch) return false;
        }
        
        // 핵심키워드 필터
        if (currentFilters.keyword !== 'all') {
            let keywordMatch = false;
            
            if (currentFilters.keyword === 'urgent') {
                // 급구: "급구" 배지가 있는 구인공고
                keywordMatch = job.isUrgent || job.title.includes('급구') || job.description.includes('급구');
            } else if (currentFilters.keyword === 'first-org') {
                // 첫조직: 신입가능이거나 첫조직 관련 키워드
                keywordMatch = job.title.includes('신입') || job.description.includes('신입') || 
                              job.title.includes('첫조직') || job.description.includes('첫조직') ||
                              job.experience.includes('신입');
            } else if (currentFilters.keyword === 'condition-change') {
                // 조건변경: 조건변경, 재계약, 이직 등 키워드
                keywordMatch = job.title.includes('조건변경') || job.description.includes('조건변경') ||
                              job.title.includes('재계약') || job.description.includes('재계약') ||
                              job.title.includes('이직') || job.description.includes('이직');
            } else if (currentFilters.keyword === 'commission-up') {
                // 수수료인상: 수수료, 성과급, 인센티브 관련 키워드
                keywordMatch = job.title.includes('수수료') || job.description.includes('수수료') ||
                              job.title.includes('성과급') || job.description.includes('성과급') ||
                              job.title.includes('인센티브') || job.description.includes('인센티브') ||
                              job.title.includes('수수료인상') || job.description.includes('수수료인상');
            } else if (currentFilters.keyword === 'daily-allowance') {
                // 일비: 일비, 교통비, 식비, 체비 관련 키워드
                keywordMatch = job.title.includes('일비') || job.description.includes('일비') ||
                              job.title.includes('교통비') || job.description.includes('교통비') ||
                              job.title.includes('식비') || job.description.includes('식비') ||
                              job.title.includes('체비') || job.description.includes('체비');
            }
            
            if (!keywordMatch) return false;
        }
        
        // 모집상태 필터 (다중선택)
        if (currentFilters.status.length > 0) {
            let statusMatch = false;
            for (const status of currentFilters.status) {
                if (status === 'recruiting' && job.deadline !== 0 && !job.isUrgent) statusMatch = true;
                if (status === 'urgent' && job.isUrgent) statusMatch = true;
                if (status === 'imminent' && job.deadline && job.deadline <= 3) statusMatch = true;
                if (status === 'closed' && job.deadline === 0) statusMatch = true;
                if (status === 'pending' && job.isPending) statusMatch = true;
            }
            if (!statusMatch) return false;
        }
        
        return true;
    });
}

// 구인공고 정렬
function sortJobs(jobs) {
    return jobs.sort((a, b) => {
        // 프리미엄 공고는 항상 우선 순위
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        
        // 선택된 정렬 방식에 따라 정렬
        switch (currentSort) {
            case 'latest':
                return b.postedDate - a.postedDate; // 최신순
            case 'views':
                return b.views - a.views; // 조회순 (높은 순)
            default:
                return b.postedDate - a.postedDate;
        }
    });
}

// 구인공고 카드 HTML 생성
function createJobCardHTML(job) {
    const isBookmarked = bookmarkedJobs.includes(job.id.toString());
    const deadlineText = job.deadline ? `D-${job.deadline}` : '상시';
    
    let badges = '';
    if (job.isPremium) badges += '<span class="badge premium">프리미엄</span>';
    if (job.isUrgent) badges += '<span class="badge urgent">긴급</span>';
    if (job.isNew) badges += '<span class="badge new">NEW</span>';
    
    // 현장명 추출 (제목에서 현장명 부분만)
    const titleParts = job.title.split(' ');
    let siteName = '';
    // 브랜드명과 지역명을 포함한 현장명 추출
    for (let i = 0; i < titleParts.length; i++) {
        if (titleParts[i].includes('분양') || titleParts[i].includes('모집') || titleParts[i].includes('채용')) {
            break;
        }
        siteName += (siteName ? ' ' : '') + titleParts[i];
    }
    
    // 분양대행사 (없으면 건설사만 표시)
    const companyInfo = job.agency ? `${job.company} / ${job.agency}` : job.company;
    
    // 직급을 더 명확하게 표시
    let position = '팀원';
    if (job.title.includes('본부장') || job.title.includes('본부')) position = '본부';
    else if (job.title.includes('팀장')) position = '팀장';
    else if (job.title.includes('팀원')) position = '팀원';
    else if (job.title.includes('사이드') || job.employment === '프리랜서') position = '사이드';
    
    return `
        <div class="job-card ${job.isPremium ? 'premium' : ''}" data-job-id="${job.id}">
            <div class="job-badges">
                ${badges}
            </div>
            <div class="job-site">
                <h3 class="site-name">${siteName}</h3>
                <p class="company-name">${companyInfo}</p>
            </div>
            <div class="job-info">
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${job.location}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-user-tie"></i>
                    <span>${position}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-briefcase"></i>
                    <span>${job.experience}</span>
                </div>
            </div>
            <div class="job-footer">
                <span class="deadline">${deadlineText}</span>
                <button class="btn-bookmark ${isBookmarked ? 'active' : ''}">
                    <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
}

// 페이지네이션 처리
document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (!this.disabled) {
            document.querySelector('.page-btn.active')?.classList.remove('active');
            if (!this.querySelector('i')) {
                this.classList.add('active');
            }
            // 실제로는 페이지 데이터를 다시 로드
        }
    });
});

// 검색 기능
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            renderJobList();
        }
    });
    
    searchInput.addEventListener('input', (e) => {
        // 실시간 검색
        renderJobList();
    });
}

// 검색어 필터링을 renderJobList에서 처리
function getSearchFilteredJobs(jobs) {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (!searchTerm) return jobs;
    
    return jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
}

// 구인공고 등록 팝업 기능
function openWriteModal() {
    const modal = document.getElementById('writeModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeWriteModal() {
    const modal = document.getElementById('writeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetForm();
    }
}

function resetForm() {
    const form = document.getElementById('writeForm');
    if (form) {
        form.reset();
        updateCharCount('siteName', 'siteNameCount', 50);
        updateCharCount('description', 'descriptionCount', 1000);
    }
}

function updateCharCount(inputId, countId, maxLength) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(countId);
    if (input && counter) {
        const currentLength = input.value.length;
        counter.textContent = currentLength;
        counter.style.color = currentLength > maxLength * 0.9 ? '#ff4444' : 'var(--gray-500)';
    }
}

function initializeModalEvents() {
    const modal = document.getElementById('writeModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const overlay = modal?.querySelector('.modal-overlay');
    const form = document.getElementById('writeForm');
    
    // 닫기 버튼들
    if (closeBtn) closeBtn.addEventListener('click', closeWriteModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeWriteModal);
    if (overlay) overlay.addEventListener('click', closeWriteModal);
    
    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeWriteModal();
        }
    });
    
    // 글자 수 카운터
    const siteNameInput = document.getElementById('siteName');
    const descriptionInput = document.getElementById('description');
    
    if (siteNameInput) {
        siteNameInput.addEventListener('input', () => {
            updateCharCount('siteName', 'siteNameCount', 50);
        });
    }
    
    if (descriptionInput) {
        descriptionInput.addEventListener('input', () => {
            updateCharCount('description', 'descriptionCount', 1000);
        });
    }
    
    // 폼 제출
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// 상단 고정 배너 렌더링
function renderPinnedBanner() {
    const track = document.getElementById('pinnedBannerTrack');
    if (!track) return;
    
    // 원활한 슬라이딩을 위해 데이터를 2번 복제
    const duplicatedJobs = [...pinnedJobs, ...pinnedJobs];
    
    const bannerHTML = duplicatedJobs.map(job => {
        // 모집유형 결정
        let employmentType = 'general';
        let employmentText = '일반';
        
        if (job.title.includes('팀장')) {
            employmentType = 'team-leader';
            employmentText = '팀장';
        } else if (job.title.includes('팀원')) {
            employmentType = 'team-member';
            employmentText = '팀원';
        } else if (job.title.includes('본부')) {
            employmentType = 'head';
            employmentText = '본부';
        } else if (job.title.includes('사이드')) {
            employmentType = 'side';
            employmentText = '사이드';
        }
        
        // 스티커(뱃지) 생성
        let badges = [];
        if (job.isPremium) badges.push('<span class="pinned-badge premium">PREMIUM</span>');
        if (job.isUrgent) badges.push('<span class="pinned-badge urgent">긴급</span>');
        if (job.isNew) badges.push('<span class="pinned-badge new">NEW</span>');
        if (job.isHot) badges.push('<span class="pinned-badge hot">HOT</span>');
        
        // 등록일 포맷팅
        const registerDate = job.postedDate.toLocaleDateString('ko-KR', {
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '.');
        
        return `
            <div class="pinned-banner-item" data-job-id="${job.id}">
                <div class="pinned-content">
                    <div class="pinned-badges">
                        ${badges.join('')}
                    </div>
                    <div class="pinned-title">${job.title.replace(' 분양영업', '').replace(' 모집', '').replace(' 채용', '')}</div>
                    <div class="pinned-company-info">${job.company}</div>
                    <div class="pinned-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${job.location}
                    </div>
                    <div class="pinned-employment">
                        <i class="fas fa-user-tie"></i>
                        ${employmentText}
                    </div>
                    <div class="pinned-date">${registerDate} 등록</div>
                </div>
            </div>
        `;
    }).join('');
    
    track.innerHTML = bannerHTML;
    
    // 5초 후에 애니메이션 시작
    setTimeout(() => {
        track.classList.add('animate');
    }, 5000);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const jobData = {
        siteName: formData.get('siteName'),
        company: formData.get('company'),
        agency: formData.get('agency'),
        region: formData.get('region'),
        detailLocation: formData.get('detailLocation'),
        position: formData.get('position'),
        experience: formData.get('experience'),
        salary: formData.get('salary'),
        description: formData.get('description'),
        contact: formData.get('contact'),
        deadline: formData.get('deadline')
    };
    
    // 실제로는 서버에 전송
    console.log('구인공고 등록 데이터:', jobData);
    
    alert('구인공고가 성공적으로 등록되었습니다.\n관리자 검토 후 게시됩니다.');
    closeWriteModal();
}

// 광고 배너 초기화
function initializeAdBanner() {
    const adBtn = document.querySelector('.ad-btn');
    const adBannerSection = document.querySelector('.ad-banner-section');
    
    // 광고 배너 항상 표시 (고정 광고판)
    if (adBannerSection) {
        adBannerSection.style.display = 'block';
        console.log('고정 광고 배너 표시됨');
    } else {
        console.log('광고 배너 요소를 찾을 수 없음');
    }
    
    // 광고 버튼 클릭 이벤트
    if (adBtn) {
        adBtn.addEventListener('click', () => {
            // Plus 멤버십 페이지로 이동
            window.open('plus-membership.html', '_blank');
        });
    }
}

// 중복된 함수 정의 제거됨 (상단에 이미 정의되어 있음)

// 중복 이벤트 리스너 제거 (initializeEventListeners에서 이미 등록됨)