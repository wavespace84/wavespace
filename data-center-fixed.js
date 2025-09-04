// Data Center JavaScript - 차트 오류 수정 버전

// 전역 변수
let currentRegion = '';
let currentDistrict = '';
let currentSection = 'raw-data';
let newsData = [];
let bunyangData = [];
const charts = {};

// 지역별 시군구 데이터 (현재 코드와 동일)
const districtData = {
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
        '수원시 장안구',
        '수원시 권선구',
        '수원시 팔달구',
        '수원시 영통구',
        '성남시 수정구',
        '성남시 중원구',
        '성남시 분당구',
        '고양시 덕양구',
        '고양시 일산동구',
        '고양시 일산서구',
        '용인시 처인구',
        '용인시 기흥구',
        '용인시 수지구',
        '부천시',
        '안산시 상록구',
        '안산시 단원구',
        '안양시 만안구',
        '안양시 동안구',
        '남양주시',
        '화성시',
        '평택시',
        '의정부시',
        '시흥시',
        '파주시',
        '광명시',
        '김포시',
        '군포시',
        '광주시',
        '이천시',
        '양주시',
        '오산시',
        '구리시',
        '안성시',
        '포천시',
        '의왕시',
        '하남시',
        '여주시',
        '양평군',
        '동두천시',
        '과천시',
        '가평군',
        '연천군',
    ],
    incheon: [
        '중구',
        '동구',
        '미추홀구',
        '연수구',
        '남동구',
        '부평구',
        '계양구',
        '서구',
        '강화군',
        '옹진군',
    ],
    busan: [
        '중구',
        '서구',
        '동구',
        '영도구',
        '부산진구',
        '동래구',
        '남구',
        '북구',
        '해운대구',
        '사하구',
        '금정구',
        '강서구',
        '연제구',
        '수영구',
        '사상구',
        '기장군',
    ],
    daegu: ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'],
    gwangju: ['동구', '서구', '남구', '북구', '광산구'],
    daejeon: ['동구', '중구', '서구', '유성구', '대덕구'],
    ulsan: ['중구', '남구', '동구', '북구', '울주군'],
    sejong: ['세종시'],
    gangwon: [
        '춘천시',
        '원주시',
        '강릉시',
        '동해시',
        '태백시',
        '속초시',
        '삼척시',
        '홍천군',
        '횡성군',
        '영월군',
        '평창군',
        '정선군',
        '철원군',
        '화천군',
        '양구군',
        '인제군',
        '고성군',
        '양양군',
    ],
    chungbuk: [
        '청주시 상당구',
        '청주시 서원구',
        '청주시 흥덕구',
        '청주시 청원구',
        '충주시',
        '제천시',
        '보은군',
        '옥천군',
        '영동군',
        '증평군',
        '진천군',
        '괴산군',
        '음성군',
        '단양군',
    ],
    chungnam: [
        '천안시 동남구',
        '천안시 서북구',
        '공주시',
        '보령시',
        '아산시',
        '서산시',
        '논산시',
        '계룡시',
        '당진시',
        '금산군',
        '부여군',
        '서천군',
        '청양군',
        '홍성군',
        '예산군',
        '태안군',
    ],
    jeonbuk: [
        '전주시 완산구',
        '전주시 덕진구',
        '군산시',
        '익산시',
        '정읍시',
        '남원시',
        '김제시',
        '완주군',
        '진안군',
        '무주군',
        '장수군',
        '임실군',
        '순창군',
        '고창군',
        '부안군',
    ],
    jeonnam: [
        '목포시',
        '여수시',
        '순천시',
        '나주시',
        '광양시',
        '담양군',
        '곡성군',
        '구례군',
        '고흥군',
        '보성군',
        '화순군',
        '장흥군',
        '강진군',
        '해남군',
        '영암군',
        '무안군',
        '함평군',
        '영광군',
        '장성군',
        '완도군',
        '진도군',
        '신안군',
    ],
    gyeongbuk: [
        '포항시 남구',
        '포항시 북구',
        '경주시',
        '김천시',
        '안동시',
        '구미시',
        '영주시',
        '영천시',
        '상주시',
        '문경시',
        '경산시',
        '군위군',
        '의성군',
        '청송군',
        '영양군',
        '영덕군',
        '청도군',
        '고령군',
        '성주군',
        '칠곡군',
        '예천군',
        '봉화군',
        '울진군',
        '울릉군',
    ],
    gyeongnam: [
        '창원시 의창구',
        '창원시 성산구',
        '창원시 마산합포구',
        '창원시 마산회원구',
        '창원시 진해구',
        '진주시',
        '통영시',
        '사천시',
        '김해시',
        '밀양시',
        '거제시',
        '양산시',
        '의령군',
        '함안군',
        '창녕군',
        '고성군',
        '남해군',
        '하동군',
        '산청군',
        '함양군',
        '거창군',
        '합천군',
    ],
    jeju: ['제주시', '서귀포시'],
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
    initDataCenter();
});

// 초기화 함수
function initDataCenter() {
    // 탭 네비게이션 설정
    setupTabNavigation();

    // 지역 선택 설정
    setupRegionSelector();

    // Supabase 데이터 로드 (Mock 데이터 대신)
    // generateMockData(); // 제거됨

    // 차트 초기화
    setTimeout(() => {
        initCharts();
    }, 100);

    // 뉴스 섹션 초기화
    initNewsSection();

    // 분양현장 섹션 초기화
    initBunyangSection();

    // Raw Data 탭의 배너 슬라이더 초기화 (초기 활성 탭)
    initBannerSlider('raw-data');
}

// 탭 네비게이션
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.data-section');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetSection = button.dataset.section;

            // 탭 버튼 활성화 상태 변경
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');

            // 섹션 표시 변경
            sections.forEach((section) => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');

            currentSection = targetSection;

            // 차트가 있는 섹션이면 차트 다시 그리기
            if (targetSection === 'raw-data') {
                setTimeout(() => {
                    destroyAllCharts();
                    initRawDataCharts();
                }, 100);
            }

            // 배너가 있는 섹션이면 배너 슬라이더 재초기화
            if (targetSection === 'raw-data' || targetSection === 'bunyang-history') {
                setTimeout(() => {
                    initBannerSlider(targetSection);
                }, 100);
            }
        });
    });
}

// 모든 차트 제거
function destroyAllCharts() {
    Object.keys(charts).forEach((key) => {
        if (charts[key]) {
            charts[key].destroy();
            delete charts[key];
        }
    });
}

// 지역 선택 (업데이트된 버전)
function setupRegionSelector() {
    const regionSelect = document.getElementById('regionSelect');
    const districtSelect = document.getElementById('districtSelect');

    // 광역시도 선택 이벤트
    if (regionSelect) {
        regionSelect.addEventListener('change', function () {
            currentRegion = this.value;
            currentDistrict = '';

            // 시군구 초기화
            districtSelect.innerHTML = '<option value="">선택</option>';
            districtSelect.disabled = true;

            if (currentRegion && districtData[currentRegion]) {
                // 시군구 데이터를 가나다순으로 정렬
                const sortedDistricts = [...districtData[currentRegion]].sort();

                let previousCity = '';

                // 시군구 데이터 로드
                sortedDistricts.forEach((district) => {
                    const option = document.createElement('option');
                    option.value = district;

                    // 시와 구를 분리 (예: "수원시 권선구" -> ["수원시", "권선구"])
                    const parts = district.split(' ');
                    if (parts.length > 1 && parts[0].endsWith('시')) {
                        const currentCity = parts[0];
                        const districtName = parts.slice(1).join(' ');

                        // 이전과 같은 시인지 확인
                        if (currentCity === previousCity) {
                            // 중복되는 시 이름은 연하게 표시
                            option.innerHTML = `<span style="color: #ccc;">${currentCity}</span> ${districtName}`;
                            option.setAttribute('data-duplicate-city', 'true');
                        } else {
                            option.textContent = district;
                            previousCity = currentCity;
                        }
                    } else {
                        option.textContent = district;
                    }

                    districtSelect.appendChild(option);
                });
                districtSelect.disabled = false;
            }

            updateSelectedLocation();
            updateDataByRegion();
            updateRegionalNews();
        });
    }

    // 시군구 선택 이벤트
    if (districtSelect) {
        districtSelect.addEventListener('change', function () {
            currentDistrict = this.value;

            updateSelectedLocation();
            updateDataByRegion();
            updateRegionalNews();
        });
    }
}

// 선택된 지역 표시 업데이트
function updateSelectedLocation() {
    const selectedLocation = document.getElementById('selectedLocation');
    const selectedLocationText = document.getElementById('selectedLocationText');

    if (!selectedLocation || !selectedLocationText) return;

    const regionNames = {
        seoul: '서울특별시',
        gyeonggi: '경기도',
        incheon: '인천광역시',
        busan: '부산광역시',
        daegu: '대구광역시',
        gwangju: '광주광역시',
        daejeon: '대전광역시',
        ulsan: '울산광역시',
        sejong: '세종특별자치시',
        gangwon: '강원도',
        chungbuk: '충청북도',
        chungnam: '충청남도',
        jeonbuk: '전라북도',
        jeonnam: '전라남도',
        gyeongbuk: '경상북도',
        gyeongnam: '경상남도',
        jeju: '제주특별자치도',
    };

    let locationText = '';

    if (currentRegion) {
        locationText = regionNames[currentRegion] || currentRegion;

        if (currentDistrict) {
            locationText += ` > ${currentDistrict}`;
        }

        selectedLocationText.textContent = locationText;
        selectedLocation.style.display = 'flex';
    } else {
        selectedLocation.style.display = 'none';
    }
}

// 차트 초기화
function initCharts() {
    // Chart.js 기본 설정
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
        Chart.defaults.font.size = 11;
    }

    // 기존 차트 모두 제거
    destroyAllCharts();

    // Raw Data 섹션 차트 초기화
    if (currentSection === 'raw-data') {
        initRawDataCharts();
    }
}

// Raw Data 차트 초기화 (수정된 버전)
function initRawDataCharts() {
    // 기존 차트 정리
    destroyAllCharts();

    // Chart.js가 로드되지 않았으면 리턴
    if (typeof Chart === 'undefined') {
        console.error('Chart.js가 로드되지 않았습니다.');
        return;
    }

    // 인구추이 차트
    const populationCanvas = document.getElementById('populationChart');
    if (populationCanvas && !charts.population) {
        try {
            const ctx = populationCanvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 80);
            gradient.addColorStop(0, 'rgba(48, 128, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(48, 128, 255, 0)');

            charts.population = new Chart(populationCanvas, {
                type: 'line',
                data: {
                    labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                    datasets: [
                        {
                            data: [980, 985, 982, 978, 975, 973, 968, 965, 960, 958],
                            borderColor: '#3080ff',
                            backgroundColor: gradient,
                            borderWidth: 2,
                            pointRadius: 2,
                            pointBackgroundColor: '#3080ff',
                            tension: 0.4,
                            fill: true,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            callbacks: {
                                label: function (context) {
                                    return context.parsed.y + '만명';
                                },
                            },
                        },
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false },
                    },
                },
            });
        } catch (error) {
            console.error('인구추이 차트 생성 오류:', error);
        }
    }

    // 연령대별 차트
    const ageCanvas = document.getElementById('ageChart');
    if (ageCanvas && !charts.age) {
        try {
            charts.age = new Chart(ageCanvas, {
                type: 'doughnut',
                data: {
                    labels: ['20대', '30대', '40대', '50대', '60대+'],
                    datasets: [
                        {
                            data: [18, 25, 28, 20, 9],
                            backgroundColor: [
                                '#3080ff',
                                '#00c896',
                                '#ffb800',
                                '#ff6b6b',
                                '#845ec2',
                            ],
                            borderWidth: 0,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function (context) {
                                    return context.label + ': ' + context.parsed + '%';
                                },
                            },
                        },
                    },
                    cutout: '60%',
                },
            });
        } catch (error) {
            console.error('연령대별 차트 생성 오류:', error);
        }
    }

    // 다른 차트들도 동일한 패턴으로 추가...
    // (나머지 차트 코드는 동일한 방식으로 try-catch와 charts 객체 사용)
}

// 지역별 데이터 업데이트
function updateDataByRegion() {
    // 선택된 지역에 따라 데이터 업데이트
    // 실제 구현에서는 API 호출 또는 데이터 필터링
    console.log('지역 데이터 업데이트:', currentRegion, currentDistrict);

    // 차트 다시 그리기
    if (currentSection === 'raw-data') {
        setTimeout(() => {
            destroyAllCharts();
            initRawDataCharts();
        }, 100);
    }
}

// Mock 데이터 생성
function generateMockData() {
    // 뉴스 데이터
    newsData = [
        {
            title: '서울 아파트 매매가격 3주 연속 상승',
            summary: '서울 아파트 매매가격이 3주 연속 상승세를 이어가며 회복 신호를 보이고 있다.',
            source: '매일경제',
            date: '2시간 전',
            image: null,
            url: 'https://news.naver.com/main/read.naver?mode=LSD&mid=sec&sid1=101',
            region: 'seoul',
        },
        {
            title: '경기도 신도시 분양 경쟁률 100:1 돌파',
            summary: '경기도 주요 신도시 아파트 분양 경쟁률이 100:1을 넘어서며 청약 열기가 뜨겁다.',
            source: '한국경제',
            date: '3시간 전',
            image: null,
            url: 'https://news.naver.com/main/read.naver?mode=LSD&mid=sec&sid1=101',
            region: 'gyeonggi',
        },
        // 더 많은 뉴스 데이터...
    ];

    // 분양현장 데이터
    bunyangData = [
        {
            id: '2024000301',
            type: '민영',
            region: '서울 강남구',
            name: '래미안 원베일리',
            applyDate: '2024.03.18',
            announceDate: '2024.03.25',
            contractDate: '2024.04.01',
            company: 'GS건설',
            totalUnits: 1255,
            applyUnits: 850,
            area: '59-114',
            price: '12.5-25.8억',
            competition: '75.3:1',
            agency: '(주)부동산114',
        },
        // 더 많은 분양 데이터...
    ];
}

// 뉴스 섹션 초기화
function initNewsSection() {
    renderNews();
}

// 뉴스 렌더링
function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    newsGrid.innerHTML = newsData
        .map(
            (news) => `
        <div class="news-card" onclick="openNewsLink(${JSON.stringify(news).replace(/"/g, '&quot;')})">
            <div class="news-card-image">
                ${
    news.image
        ? `<img src="${news.image}" alt="${news.title}">`
        : '<div class="placeholder"><i class="fas fa-newspaper"></i></div>'
}
            </div>
            <div class="news-card-content">
                <h4 class="news-card-title">${news.title}</h4>
                <p class="news-card-summary">${news.summary}</p>
                <div class="news-card-meta">
                    <span class="news-card-source">${news.source}</span>
                    <span class="news-card-date">${news.date}</span>
                </div>
            </div>
        </div>
    `
        )
        .join('');
}

// 뉴스 링크 열기
function openNewsLink(news) {
    if (news.url) {
        window.open(news.url, '_blank');
    }
}

// 지역별 뉴스 업데이트
function updateRegionalNews() {
    const regionalNewsSection = document.getElementById('regionalNewsSection');
    const regionalNewsTitle = document.getElementById('regionalNewsTitle');
    const regionalNewsGrid = document.getElementById('regionalNewsGrid');

    if (!regionalNewsSection || !regionalNewsGrid) return;

    if (currentRegion) {
        // 선택된 지역의 뉴스 필터링
        const regionalNews = newsData.filter((news) => news.region === currentRegion);

        const regionNames = {
            seoul: '서울특별시',
            gyeonggi: '경기도',
            incheon: '인천광역시',
            // ... 나머지 지역
        };

        const regionName = regionNames[currentRegion] || currentRegion;
        regionalNewsTitle.textContent = `${regionName} 뉴스`;

        if (regionalNews.length > 0) {
            regionalNewsGrid.innerHTML = regionalNews
                .map(
                    (news) => `
                <div class="news-card" onclick="openNewsLink(${JSON.stringify(news).replace(/"/g, '&quot;')})">
                    <div class="news-card-image">
                        ${
    news.image
        ? `<img src="${news.image}" alt="${news.title}">`
        : '<div class="placeholder"><i class="fas fa-newspaper"></i></div>'
}
                    </div>
                    <div class="news-card-content">
                        <h4 class="news-card-title">${news.title}</h4>
                        <p class="news-card-summary">${news.summary}</p>
                        <div class="news-card-meta">
                            <span class="news-card-source">${news.source}</span>
                            <span class="news-card-date">${news.date}</span>
                        </div>
                    </div>
                </div>
            `
                )
                .join('');
        } else {
            regionalNewsGrid.innerHTML =
                '<p style="text-align: center; color: #999;">선택된 지역의 뉴스가 없습니다.</p>';
        }

        regionalNewsSection.style.display = 'block';
    } else {
        regionalNewsSection.style.display = 'none';
    }
}

// 분양현장 섹션 초기화
function initBunyangSection() {
    renderBunyangTable();
}

// 분양현장 테이블 렌더링
function renderBunyangTable() {
    const tbody = document.getElementById('bunyangTableBody');
    if (!tbody) return;

    tbody.innerHTML = bunyangData
        .map(
            (item) => `
        <tr>
            <td>${item.id}</td>
            <td>${item.type}</td>
            <td>${item.region}</td>
            <td>${item.name}</td>
            <td>${item.applyDate}</td>
            <td>${item.announceDate}</td>
            <td>${item.contractDate}</td>
            <td>${item.company}</td>
            <td>${item.totalUnits}</td>
            <td>${item.applyUnits}</td>
            <td>${item.area}</td>
            <td>${item.price}</td>
            <td>${item.competition}</td>
            <td>${item.agency}</td>
        </tr>
    `
        )
        .join('');
}

// 엑셀 다운로드 함수
function downloadRawDataExcel() {
    alert('엑셀 다운로드 기능은 준비 중입니다.');
}

// 분양현장 추가 폼 열기
function openBunyangForm() {
    alert('분양현장 추가 기능은 준비 중입니다.');
}

// 모집공고 추가 폼 열기
function openRecruitForm() {
    alert('모집공고 추가 기능은 준비 중입니다.');
}

// 뉴스 새로고침
function refreshNews() {
    // 로딩 표시
    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) {
        newsGrid.innerHTML =
            '<div class="loading"><i class="fas fa-spinner"></i> 뉴스를 불러오는 중...</div>';
    }

    // 1초 후 뉴스 다시 렌더링 (실제로는 API 호출)
    setTimeout(() => {
        renderNews();
        // 지역별 뉴스도 업데이트
        updateRegionalNews();
    }, 1000);
}

// 분양현장 엑셀 다운로드
function downloadBunyangExcel() {
    alert('분양현장 데이터 엑셀 다운로드 기능은 준비 중입니다.');
}

// 모집공고 엑셀 다운로드
function downloadRecruitExcel() {
    alert('모집공고 데이터 엑셀 다운로드 기능은 준비 중입니다.');
}

// 전역 변수로 슬라이더 인터벌 저장
const bannerIntervals = {};

// 배너 슬라이더 초기화
function initBannerSlider(sectionId = null) {
    // 특정 섹션의 배너만 초기화
    let container;
    if (sectionId) {
        container = document.querySelector(`#${sectionId} .banner-slider`);
    } else {
        // 현재 활성화된 섹션의 배너 찾기
        const activeSection = document.querySelector('.data-section.active');
        if (activeSection) {
            container = activeSection.querySelector('.banner-slider');
        }
    }

    if (!container) return;

    // 이전 인터벌 정리
    const intervalKey = sectionId || 'default';
    if (bannerIntervals[intervalKey]) {
        clearInterval(bannerIntervals[intervalKey]);
    }

    let currentSlide = 0;
    const slides = container.querySelectorAll('.banner-slide');
    const dots = container.querySelectorAll('.banner-dots .dot');

    if (slides.length === 0) return;

    // 자동 슬라이드 변경
    function nextSlide() {
        // 현재 슬라이드 비활성화
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('active');
        }

        // 다음 슬라이드로 이동
        currentSlide = (currentSlide + 1) % slides.length;

        // 새 슬라이드 활성화
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    // 특정 슬라이드로 이동
    function goToSlide(index) {
        // 현재 슬라이드 비활성화
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('active');
        }

        // 선택한 슬라이드로 이동
        currentSlide = index;

        // 새 슬라이드 활성화
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    // 점 클릭 이벤트
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    // 5초마다 자동 슬라이드
    bannerIntervals[intervalKey] = setInterval(nextSlide, 5000);
}
