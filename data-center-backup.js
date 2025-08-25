// Data Center JavaScript - 완전 재구성

// 전역 변수
let currentRegion = '';
let currentDistrict = '';
let currentSection = 'raw-data';
let newsData = [];
let bunyangData = [];
const charts = {};

// 지역별 시군구 데이터
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

// 읍면동 데이터 (예시 - 강남구)
const dongData = {
    강남구: [
        '역삼동',
        '논현동',
        '삼성동',
        '대치동',
        '청담동',
        '압구정동',
        '신사동',
        '개포동',
        '일원동',
        '수서동',
        '세곡동',
        '도곡동',
    ],
    서초구: [
        '서초동',
        '잠원동',
        '반포동',
        '방배동',
        '양재동',
        '내곡동',
        '우면동',
        '원지동',
        '신원동',
    ],
    송파구: [
        '잠실동',
        '신천동',
        '송파동',
        '석촌동',
        '삼전동',
        '가락동',
        '문정동',
        '장지동',
        '위례동',
        '거여동',
        '마천동',
        '오금동',
        '방이동',
        '풍납동',
    ],
    // 추가 구별 동 데이터는 필요에 따라 확장
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

    // Mock 데이터 생성
    generateMockData();

    // 차트 초기화
    initCharts();

    // 뉴스 섹션 초기화
    initNewsSection();

    // 분양현장 섹션 초기화
    initBunyangSection();
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
                    // 차트 다시 초기화
                    Object.keys(charts).forEach((key) => {
                        if (charts[key]) {
                            charts[key].destroy();
                        }
                    });
                    initRawDataCharts();
                }, 100);
            }
        });
    });
}

// 지역 선택
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
        });
    }

    // 시군구 선택 이벤트
    if (districtSelect) {
        districtSelect.addEventListener('change', function () {
            currentDistrict = this.value;

            updateSelectedLocation();
            updateDataByRegion();
        });
    }
}

// 시군구 필터 생성
function createSubRegionFilters(region) {
    const subRegionFilters = document.getElementById('subRegionFilters');
    if (!subRegionFilters) return;

    subRegionFilters.innerHTML = '';

    const regions = subRegions[region] || [];
    regions.forEach((subRegion, index) => {
        const tab = document.createElement('div');
        tab.className = 'checkbox-tab';
        tab.dataset.value = subRegion;
        if (index === 0) tab.classList.add('active'); // 전체 선택

        const check = document.createElement('span');
        check.className = 'tab-check';

        const label = document.createElement('span');
        label.textContent = subRegion;

        tab.appendChild(check);
        tab.appendChild(label);

        tab.addEventListener('click', function () {
            // 기존 선택 제거
            document.querySelectorAll('.checkbox-tab').forEach((t) => t.classList.remove('active'));
            // 새 선택 추가
            this.classList.add('active');

            currentSubRegion = this.dataset.value;
            updateSelectedRegionDisplay();
            updateDataByRegion();
        });

        subRegionFilters.appendChild(tab);
    });
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

// Raw Data 차트 초기화
function initRawDataCharts() {
    // 인구추이 차트 (10년)
    const populationCanvas = document.getElementById('populationChart');
    if (populationCanvas) {
        const ctx = populationCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 80);
        gradient.addColorStop(0, 'rgba(48, 128, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(48, 128, 255, 0)');

        new Chart(populationCanvas, {
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
                    x: {
                        display: false,
                        grid: { display: false },
                    },
                    y: {
                        display: false,
                        grid: { display: false },
                    },
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            },
        });
    }

    // 매수지역 선호도 차트
    const purchaseAreaCanvas = document.getElementById('purchaseAreaChart');
    if (purchaseAreaCanvas) {
        new Chart(purchaseAreaCanvas, {
            type: 'doughnut',
            data: {
                labels: ['당해지역', '인접시도', '수도권', '전국'],
                datasets: [
                    {
                        data: [45, 25, 20, 10],
                        backgroundColor: ['#3080ff', '#00c896', '#ffb800', '#ff6b6b'],
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
    }

    // 매수심리지수 차트 (10년)
    const sentimentCanvas = document.getElementById('sentimentChart');
    if (sentimentCanvas) {
        const ctx = sentimentCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 80);
        gradient.addColorStop(0, 'rgba(132, 94, 194, 0.3)');
        gradient.addColorStop(1, 'rgba(132, 94, 194, 0)');

        new Chart(sentimentCanvas, {
            type: 'line',
            data: {
                labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                datasets: [
                    {
                        data: [95.2, 102.3, 98.5, 88.7, 75.3, 68.9, 72.4, 78.6, 82.3, 87.5],
                        borderColor: '#845ec2',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 2,
                        pointBackgroundColor: '#845ec2',
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
                                return '지수: ' + context.parsed.y;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        display: false,
                        grid: { display: false },
                    },
                    y: {
                        display: false,
                        grid: { display: false },
                    },
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            },
        });
    }

    // 연령대별 차트
    const ageCanvas = document.getElementById('ageChart');
    if (ageCanvas) {
        new Chart(ageCanvas, {
            type: 'doughnut',
            data: {
                labels: ['20대', '30대', '40대', '50대', '60대+'],
                datasets: [
                    {
                        data: [18, 25, 28, 20, 9],
                        backgroundColor: ['#3080ff', '#00c896', '#ffb800', '#ff6b6b', '#845ec2'],
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
    }

    // 세대수 추이 차트 (10년)
    const householdCanvas = document.getElementById('householdChart');
    if (householdCanvas) {
        new Chart(householdCanvas, {
            type: 'bar',
            data: {
                labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                datasets: [
                    {
                        data: [350, 358, 365, 372, 380, 390, 395, 402, 408, 412],
                        backgroundColor: '#3080ff',
                        borderRadius: 3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y + '만 세대';
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
    }

    // 거래동향 차트 (10년)
    const transactionCanvas = document.getElementById('transactionChart');
    if (transactionCanvas) {
        const ctx = transactionCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 80);
        gradient.addColorStop(0, 'rgba(0, 200, 150, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 200, 150, 0)');

        new Chart(transactionCanvas, {
            type: 'line',
            data: {
                labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                datasets: [
                    {
                        data: [4200, 4500, 3800, 3200, 2800, 2500, 3100, 3400, 3500, 3600],
                        borderColor: '#00c896',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 2,
                        pointBackgroundColor: '#00c896',
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
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y + '건';
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
    }

    // 가격동향 차트 (10년)
    const priceIndexCanvas = document.getElementById('priceIndexChart');
    if (priceIndexCanvas) {
        const ctx = priceIndexCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 80);
        gradient.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');

        new Chart(priceIndexCanvas, {
            type: 'line',
            data: {
                labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                datasets: [
                    {
                        data: [85.2, 88.5, 92.1, 95.8, 98.2, 100.0, 101.5, 102.8, 103.5, 104.2],
                        borderColor: '#ff6b6b',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 2,
                        pointBackgroundColor: '#ff6b6b',
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
                        callbacks: {
                            label: function (context) {
                                return '지수: ' + context.parsed.y;
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
    }

    // 입주물량 차트 (10년)
    const moveInCanvas = document.getElementById('moveInChart');
    if (moveInCanvas) {
        new Chart(moveInCanvas, {
            type: 'bar',
            data: {
                labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                datasets: [
                    {
                        data: [
                            18000, 20000, 21500, 22000, 22500, 23000, 25000, 24000, 26000, 28000,
                        ],
                        backgroundColor: '#845ec2',
                        borderRadius: 3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y.toLocaleString() + '세대';
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
    }

    // 분양물량 차트 (10년)
    const supplyCanvas = document.getElementById('supplyChart');
    if (supplyCanvas) {
        new Chart(supplyCanvas, {
            type: 'bar',
            data: {
                labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                datasets: [
                    {
                        data: [
                            15000, 16500, 17000, 18000, 18500, 19000, 21000, 20000, 22000, 24000,
                        ],
                        backgroundColor: '#ffb800',
                        borderRadius: 3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y.toLocaleString() + '세대';
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
    }

    // 미분양 차트 (10년)
    const unsoldCanvas = document.getElementById('unsoldChart');
    if (unsoldCanvas) {
        const ctx = unsoldCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 80);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        new Chart(unsoldCanvas, {
            type: 'line',
            data: {
                labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
                datasets: [
                    {
                        data: [3500, 3200, 2800, 2500, 2200, 1800, 1600, 1500, 1400, 1200],
                        borderColor: '#10b981',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 2,
                        pointBackgroundColor: '#10b981',
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
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y.toLocaleString() + '세대';
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
    }
}

// 기존 미니 차트 초기화 (사용하지 않음)
function initMiniCharts() {
    // 인구추이 미니 차트
    const populationMiniCanvas = document.getElementById('populationMiniChart');
    if (populationMiniCanvas) {
        const ctx = populationMiniCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 60);
        gradient.addColorStop(0, 'rgba(48, 128, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(48, 128, 255, 0)');

        new Chart(populationMiniCanvas, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', ''],
                datasets: [
                    {
                        data: [970, 973, 968, 965, 960, 958],
                        borderColor: '#3080ff',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });
    }

    // 연령대별 미니 차트
    const ageMiniCanvas = document.getElementById('ageMiniChart');
    if (ageMiniCanvas) {
        new Chart(ageMiniCanvas, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [18, 25, 28, 20, 9],
                        backgroundColor: ['#3080ff', '#00c896', '#ffb800', '#ff6b6b', '#845ec2'],
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                cutout: '60%',
            },
        });
    }

    // 세대수 미니 차트
    const householdMiniCanvas = document.getElementById('householdMiniChart');
    if (householdMiniCanvas) {
        new Chart(householdMiniCanvas, {
            type: 'bar',
            data: {
                labels: ['', '', '', '', '', ''],
                datasets: [
                    {
                        data: [385, 390, 395, 402, 408, 412],
                        backgroundColor: '#3080ff',
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });
    }

    // 거래량 미니 차트
    const transactionMiniCanvas = document.getElementById('transactionMiniChart');
    if (transactionMiniCanvas) {
        const ctx = transactionMiniCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 60);
        gradient.addColorStop(0, 'rgba(0, 200, 150, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 200, 150, 0)');

        new Chart(transactionMiniCanvas, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', ''],
                datasets: [
                    {
                        data: [3200, 2800, 3500, 3100, 3300, 3600],
                        borderColor: '#00c896',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });
    }

    // 가격지수 미니 차트
    const priceIndexMiniCanvas = document.getElementById('priceIndexMiniChart');
    if (priceIndexMiniCanvas) {
        const ctx = priceIndexMiniCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 60);
        gradient.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');

        new Chart(priceIndexMiniCanvas, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', ''],
                datasets: [
                    {
                        data: [102.3, 102.8, 103.2, 103.5, 103.9, 104.2],
                        borderColor: '#ff6b6b',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });
    }

    // 나머지 미니 차트들도 동일한 방식으로 초기화
    const moveInMiniCanvas = document.getElementById('moveInMiniChart');
    if (moveInMiniCanvas) {
        new Chart(moveInMiniCanvas, {
            type: 'bar',
            data: {
                labels: ['', '', '', '', ''],
                datasets: [
                    {
                        data: [24000, 25000, 26000, 27000, 28000],
                        backgroundColor: '#845ec2',
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });
    }

    const supplyMiniCanvas = document.getElementById('supplyMiniChart');
    if (supplyMiniCanvas) {
        new Chart(supplyMiniCanvas, {
            type: 'bar',
            data: {
                labels: ['', '', '', '', ''],
                datasets: [
                    {
                        data: [20000, 21000, 22000, 23000, 24000],
                        backgroundColor: '#ffb800',
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });
    }

    const unsoldMiniCanvas = document.getElementById('unsoldMiniChart');
    if (unsoldMiniCanvas) {
        const ctx = unsoldMiniCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 60);
        gradient.addColorStop(0, 'rgba(0, 200, 150, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 200, 150, 0)');

        new Chart(unsoldMiniCanvas, {
            type: 'line',
            data: {
                labels: ['', '', '', '', ''],
                datasets: [
                    {
                        data: [1800, 1600, 1500, 1400, 1200],
                        borderColor: '#00c896',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });
    }
}

// 차트 초기화
function initCharts() {
    // Chart.js 기본 설정
    Chart.defaults.font.family = 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
    Chart.defaults.font.size = 11;

    // Raw Data 섹션 차트 초기화
    initRawDataCharts();
}

// 엑셀 다운로드 함수
function downloadRawDataExcel() {
    // 구조화된 통계 데이터
    const rawData = [
        ['부동산 통계 데이터', '', '', ''],
        ['생성일시: ' + new Date().toLocaleString('ko-KR'), '', '', ''],
        ['', '', '', ''],

        ['[청약기준]', '', '', ''],
        ['항목', '값', '세부내용', '비고'],
        ['규제지역 현황', '23개 지역', '조정대상지역: 15개', '투기과열지구: 8개'],
        ['1순위 통장기준', '24개월', '민영주택: 24개월', '국민주택: 12개월'],
        ['', '', '', ''],

        ['[수요분석]', '', '', ''],
        ['항목', '현재값', '변동률', '세부내용'],
        ['인구추이', '958만명', '▼ 2.1%', '전년 대비'],
        ['연령대별 현황', '40대 최다', '28%', '30대: 25%, 50대: 20%'],
        ['전입지역', '경기 42%', '서울 35%', '인천 23%'],
        ['매수선호지역', '강남3구', '1위', '판교: 2위, 분당: 3위'],
        ['', '', '', ''],

        ['[주택시장]', '', '', ''],
        ['항목', '현재값', '변동률', '세부내용'],
        ['세대수 추이', '412만 세대', '▲ 1.0%', '전년 대비'],
        ['거래동향', '3,600건', '▲ 9.1%', '전월 대비'],
        ['가격동향', '지수 104.2', '▲ 1.9%', '전월 대비'],
        ['매물동향', '총 8,542건', '매매: 3,200', '전세: 3,800, 월세: 1,542'],
        ['', '', '', ''],

        ['[공급분석]', '', '', ''],
        ['항목', '연간 물량', '변동률', '세부내용'],
        ['입주물량', '28,000세대', '▲ 7.7%', '전년 대비'],
        ['분양물량', '24,000세대', '▲ 9.1%', '전년 대비'],
        ['미분양', '1,200세대', '▼ 14%', '전월 대비'],
        ['연간 분양주택수요', '35,000세대', '수도권: 65%', '지방: 35%'],
    ];

    // CSV 변환
    let csvContent = '\uFEFF'; // UTF-8 BOM
    rawData.forEach((row) => {
        csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n';
    });

    // Blob 생성 및 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // 현재 날짜 포함한 파일명
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    link.download = `부동산통계_${dateStr}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 다운로드 알림
    alert('엑셀 파일 다운로드가 시작되었습니다.');
}

// 기존 큰 차트 코드는 주석처리
/*
function initOldCharts() {
    const populationCanvas = document.getElementById('populationChart');
    if (populationCanvas) {
        charts.population = new Chart(populationCanvas, {
            type: 'line',
            data: {
                labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: '인구수(만명)',
                    data: [970, 973, 968, 965, 960, 958],
                    borderColor: '#3080ff',
                    backgroundColor: 'rgba(48, 128, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }
    
    // 연령대별 현황 차트
    const ageCanvas = document.getElementById('ageChart');
    if (ageCanvas) {
        charts.age = new Chart(ageCanvas, {
            type: 'doughnut',
            data: {
                labels: ['20대', '30대', '40대', '50대', '60대 이상'],
                datasets: [{
                    data: [18, 25, 28, 20, 9],
                    backgroundColor: [
                        '#3080ff',
                        '#00c896',
                        '#ffb800',
                        '#ff6b6b',
                        '#845ec2'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 10, font: { size: 11 } }
                    }
                }
            }
        });
    }
    
    // 세대수 추이 차트
    const householdCanvas = document.getElementById('householdChart');
    if (householdCanvas) {
        charts.household = new Chart(householdCanvas, {
            type: 'bar',
            data: {
                labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: '세대수(만)',
                    data: [385, 390, 395, 402, 408, 412],
                    backgroundColor: '#3080ff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // 아파트 거래량 차트
    const transactionCanvas = document.getElementById('transactionChart');
    if (transactionCanvas) {
        charts.transaction = new Chart(transactionCanvas, {
            type: 'line',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
                datasets: [{
                    label: '거래량(건)',
                    data: [3200, 2800, 3500, 3100, 3300, 3600],
                    borderColor: '#00c896',
                    backgroundColor: 'rgba(0, 200, 150, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // 가격지수 차트
    const priceIndexCanvas = document.getElementById('priceIndexChart');
    if (priceIndexCanvas) {
        charts.priceIndex = new Chart(priceIndexCanvas, {
            type: 'line',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
                datasets: [{
                    label: '가격지수',
                    data: [102.3, 102.8, 103.2, 103.5, 103.9, 104.2],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }
    
    // 입주물량 차트
    const moveInCanvas = document.getElementById('moveInChart');
    if (moveInCanvas) {
        charts.moveIn = new Chart(moveInCanvas, {
            type: 'bar',
            data: {
                labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: '입주물량(세대)',
                    data: [15000, 18000, 22000, 19000, 21000, 23000, 25000, 24000, 26000, 28000],
                    backgroundColor: '#845ec2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // 분양물량 차트
    const supplyCanvas = document.getElementById('supplyChart');
    if (supplyCanvas) {
        charts.supply = new Chart(supplyCanvas, {
            type: 'bar',
            data: {
                labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: '분양물량(세대)',
                    data: [12000, 14000, 16000, 15000, 17000, 19000, 21000, 20000, 22000, 24000],
                    backgroundColor: '#ffb800'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // 미분양물량 차트
    const unsoldCanvas = document.getElementById('unsoldChart');
    if (unsoldCanvas) {
        charts.unsold = new Chart(unsoldCanvas, {
            type: 'line',
            data: {
                labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [{
                    label: '미분양(세대)',
                    data: [3000, 2800, 2500, 2200, 2000, 1800, 1600, 1500, 1400, 1200],
                    borderColor: '#00c896',
                    backgroundColor: 'rgba(0, 200, 150, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}
*/

// Mock 데이터 생성
function generateMockData() {
    // 뉴스 데이터
    newsData = [
        {
            id: 1,
            title: '서울 아파트 매매가격 3주 연속 상승',
            source: '한국경제',
            date: '2024-01-18 09:30',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=015&arti_id=0004948251',
            summary:
                '서울 아파트 매매가격이 3주 연속 상승세를 보이며 시장 회복 신호를 나타내고 있습니다. 강남권을 중심으로 거래량도 증가하는 추세입니다.',
        },
        {
            id: 2,
            title: '강남구 재건축 단지 분양가 상한제 적용 검토',
            source: '매일경제',
            date: '2024-01-18 08:15',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=009&arti_id=0005237841',
            summary:
                '정부가 강남구 주요 재건축 단지에 분양가 상한제 적용을 검토 중입니다. 업계는 사업성 악화를 우려하고 있습니다.',
        },
        {
            id: 3,
            title: '수도권 신규 분양 물량 전년 대비 15% 증가',
            source: '서울경제',
            date: '2024-01-18 07:45',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=011&arti_id=0004281937',
            summary:
                '올해 수도권 신규 분양 물량이 전년 대비 15% 증가할 예정입니다. 3기 신도시를 중심으로 공급이 확대됩니다.',
        },
        {
            id: 4,
            title: '정부, 1기 신도시 재정비 계획 발표',
            source: '조선일보',
            date: '2024-01-17 18:20',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=023&arti_id=0003816742',
            summary:
                '정부가 노후화된 1기 신도시 재정비 계획을 발표했습니다. 용적률 상향과 인프라 개선이 핵심입니다.',
        },
        {
            id: 5,
            title: '청약 경쟁률 하락세...분양시장 관망세 지속',
            source: '중앙일보',
            date: '2024-01-17 16:30',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=025&arti_id=0003342891',
            summary:
                '최근 청약 경쟁률이 하락세를 보이며 분양시장 관망세가 지속되고 있습니다. 금리 인하 시점을 기다리는 수요자가 많습니다.',
        },
        {
            id: 6,
            title: '부동산 PF 대출 연체율 소폭 상승',
            source: '한겨레',
            date: '2024-01-17 14:15',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=028&arti_id=0002671842',
            summary:
                '부동산 프로젝트 파이낸싱 대출 연체율이 소폭 상승했습니다. 금융당국은 면밀히 모니터링 중입니다.',
        },
        {
            id: 7,
            title: '전월세 전환율 상승...임대차 시장 변화',
            source: '동아일보',
            date: '2024-01-17 11:20',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=020&arti_id=0003532187',
            summary:
                '전월세 전환율이 상승하며 임대차 시장에 변화가 감지되고 있습니다. 전세 수요가 월세로 이동하는 추세입니다.',
        },
        {
            id: 8,
            title: 'GTX-A 노선 개통 임박...역세권 분양 활발',
            source: '파이낸셜뉴스',
            date: '2024-01-17 10:00',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=014&arti_id=0005121847',
            summary:
                'GTX-A 노선 개통이 임박하며 역세권 분양이 활발해지고 있습니다. 교통 호재로 수요자 관심이 집중됩니다.',
        },
        {
            id: 9,
            title: '특별공급 제도 개편...청약 기회 확대',
            source: '머니투데이',
            date: '2024-01-16 17:30',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=008&arti_id=0004981247',
            summary:
                '특별공급 제도가 개편되어 더 많은 실수요자에게 청약 기회가 확대됩니다. 생애최초 특별공급 비율이 증가합니다.',
        },
        {
            id: 10,
            title: '금리 인하 기대감...부동산 시장 회복 조짐',
            source: '이데일리',
            date: '2024-01-16 15:45',
            url: 'https://land.naver.com/news/newsRead.naver?type=headline&prsco_id=018&arti_id=0005642187',
            summary:
                '금리 인하 기대감이 커지며 부동산 시장에 회복 조짐이 나타나고 있습니다. 매수 문의가 증가하는 추세입니다.',
        },
    ];

    // 분양현장 데이터
    bunyangData = [
        {
            id: '2024-01-001',
            type: '민영',
            region: '서울',
            name: '디엠씨 SK뷰',
            receiptDate: '24.01.22',
            announceDate: '24.01.29',
            contractDate: '24.02.05-07',
            company: 'SK건설',
            totalUnits: '846',
            applyUnits: '644',
            size: '84A/84B',
            price: '11-13억',
            competition: '24.1:1',
            agency: '(주)더블유마케팅',
            status: 'active',
        },
        {
            id: '2024-01-002',
            type: '민영',
            region: '경기',
            name: '평촌 더샵 센트럴파크',
            receiptDate: '24.01.15',
            announceDate: '24.01.22',
            contractDate: '24.01.29-31',
            company: '포스코건설',
            totalUnits: '1,232',
            applyUnits: '956',
            size: '59/74/84',
            price: '8-12억',
            competition: '18.5:1',
            agency: '(주)분양대행',
            status: 'active',
        },
        {
            id: '2023-12-045',
            type: '민영',
            region: '인천',
            name: '청라 한신더휴',
            receiptDate: '23.12.18',
            announceDate: '23.12.25',
            contractDate: '24.01.02-04',
            company: '한신공영',
            totalUnits: '567',
            applyUnits: '423',
            size: '74/84',
            price: '6-8억',
            competition: '12.3:1',
            agency: '(주)하우스마케팅',
            status: 'completed',
        },
    ];
}

// 뉴스 섹션 초기화
function initNewsSection() {
    renderNewsGrid();
    updateRegionalNews();

    // 5분마다 뉴스 업데이트 시뮬레이션
    setInterval(() => {
        updateNewsData();
        renderNewsGrid();
        updateRegionalNews();
    }, 300000); // 5분
}

// 뉴스 카드 그리드 렌더링
function renderNewsGrid() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    newsGrid.innerHTML = '';

    newsData.forEach((news, index) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-card-image">
                <div class="placeholder">
                    <i class="fas fa-newspaper"></i>
                </div>
            </div>
            <div class="news-card-content">
                <h3 class="news-card-title">${news.title}</h3>
                <p class="news-card-summary">${news.summary}</p>
                <div class="news-card-meta">
                    <span class="news-card-source">${news.source}</span>
                    <span class="news-card-date">${news.date}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            openNewsLink(news);
        });

        newsGrid.appendChild(card);
    });
}

// 뉴스 링크 열기 (새 창)
function openNewsLink(news) {
    if (news.url) {
        window.open(news.url, '_blank');
    }
}

// 뉴스 데이터 업데이트 (시뮬레이션)
function updateNewsData() {
    // 새로운 뉴스 추가 시뮬레이션
    const newNews = {
        id: newsData.length + 1,
        title: `[속보] 부동산 시장 동향 업데이트 - ${new Date().toLocaleTimeString()}`,
        source: '실시간뉴스',
        date: new Date().toLocaleString('ko-KR'),
        url: 'https://land.naver.com/news/',
        summary: '최신 부동산 시장 동향 업데이트입니다.',
    };

    newsData.unshift(newNews);
    newsData = newsData.slice(0, 10); // 최신 10개만 유지
}

// 지역별 뉴스 업데이트
function updateRegionalNews() {
    const regionalNewsSection = document.getElementById('regionalNewsSection');
    const regionalNewsTitle = document.getElementById('regionalNewsTitle');
    const regionalNewsGrid = document.getElementById('regionalNewsGrid');

    if (!regionalNewsSection || !regionalNewsTitle || !regionalNewsGrid) return;

    if (currentRegion) {
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

        let regionText = regionNames[currentRegion] || currentRegion;
        if (currentDistrict) {
            regionText += ` ${currentDistrict}`;
        }

        regionalNewsTitle.textContent = `${regionText} 부동산 뉴스`;
        regionalNewsSection.style.display = 'block';

        // 지역별 뉴스 데이터 (시뮬레이션)
        const regionalNews = [
            {
                id: 101,
                title: `${regionText} 아파트 매매가 상승세 지속`,
                source: '지역일보',
                date: '2024-01-18 14:30',
                url: `https://land.naver.com/news/newsRead.naver?type=region&keyword=${encodeURIComponent(regionText)}`,
                summary: `${regionText} 지역 아파트 매매가격이 지속적인 상승세를 보이고 있습니다.`,
            },
            {
                id: 102,
                title: `${regionText} 신규 분양 예정 단지 발표`,
                source: '부동산뉴스',
                date: '2024-01-18 11:15',
                url: `https://land.naver.com/news/newsRead.naver?type=region&keyword=${encodeURIComponent(regionText)}`,
                summary: `${regionText}에 새로운 분양 단지가 곧 공급될 예정입니다.`,
            },
            {
                id: 103,
                title: `${regionText} 재개발 사업 진행 현황`,
                source: '건설경제',
                date: '2024-01-18 09:00',
                url: `https://land.naver.com/news/newsRead.naver?type=region&keyword=${encodeURIComponent(regionText)}`,
                summary: `${regionText} 지역 재개발 사업이 활발히 진행되고 있습니다.`,
            },
        ];

        // 지역별 뉴스 렌더링
        regionalNewsGrid.innerHTML = '';
        regionalNews.forEach((news) => {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <div class="news-card-image">
                    <div class="placeholder">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">${news.title}</h3>
                    <p class="news-card-summary">${news.summary}</p>
                    <div class="news-card-meta">
                        <span class="news-card-source">${news.source}</span>
                        <span class="news-card-date">${news.date}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                openNewsLink(news);
            });

            regionalNewsGrid.appendChild(card);
        });
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

    tbody.innerHTML = '';

    bunyangData.forEach((item) => {
        const tr = document.createElement('tr');
        tr.className = `status-${item.status}`;
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.type}</td>
            <td>${item.region}</td>
            <td><strong>${item.name}</strong></td>
            <td>${item.receiptDate}</td>
            <td>${item.announceDate}</td>
            <td>${item.contractDate}</td>
            <td>${item.company}</td>
            <td>${item.totalUnits}</td>
            <td>${item.applyUnits}</td>
            <td>${item.size}</td>
            <td>${item.price}</td>
            <td><strong>${item.competition}</strong></td>
            <td>${item.agency}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 지역별 데이터 업데이트
function updateDataByRegion() {
    // 지역 변경시 데이터 업데이트
    console.log('지역 변경:', currentRegion);

    // 차트 데이터 업데이트
    updateChartsData();

    // 뉴스 데이터 업데이트
    updateRegionalNews();

    // 테이블 데이터 업데이트
    renderBunyangTable();
}

// 차트 데이터 업데이트
function updateChartsData() {
    // 지역별로 다른 데이터 표시 (시뮬레이션)
    if (currentRegion === 'seoul') {
        // 서울 데이터로 업데이트
        if (charts.population) {
            charts.population.data.datasets[0].data = [980, 985, 990, 988, 985, 983];
            charts.population.update();
        }
    } else if (currentRegion === 'gyeonggi') {
        // 경기 데이터로 업데이트
        if (charts.population) {
            charts.population.data.datasets[0].data = [1320, 1335, 1348, 1355, 1362, 1370];
            charts.population.update();
        }
    }
    // 다른 차트들도 동일하게 업데이트
}
