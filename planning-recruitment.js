// 분양기획 페이지 JavaScript

// 샘플 데이터
const planningJobs = [
    {
        id: 1,
        title: "강남 A프로젝트 분양기획 전문가 모집",
        company: "에이스분양컨설팅",
        verified: true,
        location: "서울 강남구",
        position: "기획팀장",
        project: "강남 센트럴 타워",
        status: "recruiting",
        deadline: "2024-02-15",
        scope: "마케팅 전략 수립, 분양가 책정, 홍보물 기획",
        views: 342,
        comments: 12,
        registeredDate: "2024-01-25",
        isPremium: true,
        isPromoted: true,
        description: "강남 핵심지역 대규모 주상복합 프로젝트의 분양기획을 총괄할 전문가를 모집합니다. 10년 이상 경력자 우대, 유사 프로젝트 경험 필수",
        manager: {
            name: "김영수",
            title: "대표이사",
            level: "기획실무자"
        },
        requirements: [
            "분양기획 경력 10년 이상",
            "주상복합 프로젝트 경험 필수",
            "마케팅 전략 수립 능력",
            "분양가 책정 경험"
        ],
        benefits: [
            "성과 인센티브 별도",
            "차량 지원",
            "식대 지원",
            "프로젝트 완료 보너스"
        ]
    },
    {
        id: 2,
        title: "판교 테크노밸리 오피스텔 분양기획",
        company: "테크밸리개발",
        verified: true,
        location: "경기 성남시",
        position: "기획차장",
        project: "판교 스마트 오피스",
        status: "recruiting",
        deadline: "2024-02-20",
        scope: "시장조사, 분양전략 수립, 마케팅 기획",
        views: 287,
        comments: 8,
        registeredDate: "2024-01-24",
        isPremium: false,
        isPromoted: true,
        description: "판교 테크노밸리 중심 오피스텔 프로젝트 분양기획 담당자를 찾습니다. IT 기업 타겟 마케팅 경험자 우대",
        manager: {
            name: "이수진",
            title: "기획팀장",
            level: "기획실무자"
        }
    },
    {
        id: 3,
        title: "부산 해운대 주상복합 분양기획 모집",
        company: "해운대디벨롭먼트",
        verified: false,
        location: "부산 해운대구",
        position: "본부장",
        project: "마린시티 프라자",
        status: "closing",
        deadline: "2024-02-05",
        scope: "분양가 산정, 홍보전략, 모델하우스 기획",
        views: 456,
        comments: 15,
        registeredDate: "2024-01-23",
        isPremium: true,
        isPromoted: false,
        description: "부산 최고 입지 해운대 마린시티 주상복합 분양기획 전문가 급구. 부산 지역 분양 경험 필수",
        manager: {
            name: "박민수",
            title: "상무",
            level: "분양기획"
        }
    },
    {
        id: 4,
        title: "인천 송도 국제도시 아파트 분양기획",
        company: "송도개발공사",
        verified: true,
        location: "인천 \uc5f0수구",
        position: "기획과장",
        project: "송도 센트럴파크뷰",
        status: "recruiting",
        deadline: "2024-02-25",
        scope: "시장분석, 타겟 설정, 분양 전략 수립",
        views: 198,
        comments: 5,
        registeredDate: "2024-01-22",
        isPremium: false,
        isPromoted: false,
        description: "송도국제도시 핵심지역 아파트 단지 분양기획 담당자 모집. 신도시 분양 경험자 환영",
        manager: {
            name: "최정훈",
            title: "팀장",
            level: "분양기획"
        }
    },
    {
        id: 5,
        title: "대전 둔산동 오피스빌딩 분양기획 전문가",
        company: "중부종합개발",
        verified: false,
        location: "대전 서구",
        position: "기획대리",
        project: "둔산 비즈니스 센터",
        status: "closed",
        deadline: "2024-01-31",
        scope: "상가 분양 전략, B2B 마케팅",
        views: 145,
        comments: 3,
        registeredDate: "2024-01-21",
        isPremium: false,
        isPromoted: false,
        description: "대전 둔산동 프리미엄 오피스빌딩 분양기획 완료된 프로젝트입니다.",
        manager: {
            name: "정현우",
            title: "부장",
            level: "분양기획"
        }
    },
    {
        id: 6,
        title: "수원 광교 신도시 타운하우스 분양기획",
        company: "광교디벨로퍼스",
        verified: true,
        location: "경기 수원시",
        position: "기획팀장",
        project: "광교 레이크빌",
        status: "recruiting",
        deadline: "2024-02-18",
        scope: "프리미엄 타운하우스 분양전략, VIP 마케팅",
        views: 412,
        comments: 18,
        registeredDate: "2024-01-20",
        isPremium: true,
        isPromoted: false,
        description: "광교 호수공원 인접 프리미엄 타운하우스 분양기획. 고급 주택 분양 경험 필수, VIP 마케팅 능력 보유자",
        manager: {
            name: "김서연",
            title: "본부장",
            level: "기획실무자"
        }
    },
    {
        id: 7,
        title: "제주 서귀포 리조트형 콘도 분양기획",
        company: "제주관광개발",
        verified: false,
        location: "제주 서귀포시",
        position: "사무보조",
        project: "오션뷰 리조트",
        status: "recruiting",
        deadline: "2024-03-01",
        scope: "리조트 분양 마케팅, 투자상품 기획",
        views: 523,
        comments: 22,
        registeredDate: "2024-01-19",
        isPremium: false,
        isPromoted: true,
        description: "제주 서귀포 오션뷰 리조트형 콘도미니엄 분양기획. 리조트 분양 경험자, 투자상품 기획 능력 필수",
        manager: {
            name: "한지민",
            title: "전무",
            level: "기획실무자"
        }
    },
    {
        id: 8,
        title: "용인 수지구 지식산업센터 분양기획",
        company: "경기테크노파크",
        verified: true,
        location: "경기 용인시",
        position: "기획과장",
        project: "수지 테크노밸리",
        status: "closing",
        deadline: "2024-02-03",
        scope: "지식산업센터 분양전략, 기업 유치 마케팅",
        views: 234,
        comments: 7,
        registeredDate: "2024-01-18",
        isPremium: false,
        isPromoted: false,
        description: "용인 수지 지식산업센터 분양기획 담당자 모집 마감 임박. 산업시설 분양 경험자 우대",
        manager: {
            name: "이준호",
            title: "상무",
            level: "분양기획"
        }
    }
];

// 현재 페이지와 필터 상태
let currentPage = 1;
const itemsPerPage = 10;
let filteredJobs = [...planningJobs];
let currentFilters = {
    region: 'all',
    status: 'all',
    search: '',
    sort: 'latest'
};

// DOM 요소
const jobListElement = document.getElementById('planningJobList');
const paginationElement = document.getElementById('planningPagination');
const modalElement = document.getElementById('jobDetailModal');
const modalContent = document.getElementById('jobDetailContent');
const modalClose = document.getElementById('modalClose');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    initializeSorting();
    initializeSearch();
    initializeModal();
    renderJobs();
});

// 필터 초기화
function initializeFilters() {
    // 지역 필터 탭
    document.querySelectorAll('input[name="region-filter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // 모든 탭의 active 클래스 제거
            document.querySelectorAll('.region-tabs .checkbox-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            // 선택된 탭에 active 클래스 추가
            this.closest('.checkbox-tab').classList.add('active');
            currentFilters.region = this.closest('.checkbox-tab').dataset.region;
            filterAndRenderJobs();
        });
    });

    // 직급 필터 체크박스
    document.querySelectorAll('.position-filter').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            filterAndRenderJobs();
        });
    });
}

// 정렬 초기화
function initializeSorting() {
    document.querySelectorAll('.sort-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // 모든 탭의 active 클래스 제거
            document.querySelectorAll('.sort-tab').forEach(t => {
                t.classList.remove('active');
            });
            // 클릭된 탭에 active 클래스 추가
            this.classList.add('active');
            currentFilters.sort = this.dataset.sort;
            filterAndRenderJobs();
        });
    });
}

// 검색 초기화
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value.toLowerCase();
            filterAndRenderJobs();
        });
    }
}

// 모달 초기화
function initializeModal() {
    modalClose.addEventListener('click', () => {
        modalElement.style.display = 'none';
    });

    modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) {
            modalElement.style.display = 'none';
        }
    });
}

// 필터링 및 렌더링
function filterAndRenderJobs() {
    filteredJobs = planningJobs.filter(job => {
        // 지역 필터
        if (currentFilters.region !== 'all') {
            const regionMap = {
                '서울': '서울',
                '경기': '경기',
                '인천': '인천',
                '부산': '부산',
                '대구': '대구',
                '광주': '광주',
                '대전': '대전',
                '울산': '울산',
                '세종': '세종',
                '강원': '강원',
                '충북': '충북',
                '충남': '충남',
                '전북': '전북',
                '전남': '전남',
                '경북': '경북',
                '경남': '경남',
                '제주': '제주'
            };
            
            const region = regionMap[currentFilters.region];
            if (region && !job.location.includes(region)) {
                return false;
            }
        }

        // 직급 필터
        const selectedPositions = [];
        document.querySelectorAll('.position-filter:checked').forEach(checkbox => {
            selectedPositions.push(checkbox.value);
        });
        
        if (selectedPositions.length > 0) {
            const hasMatchingPosition = selectedPositions.some(pos => 
                job.position && job.position.includes(pos)
            );
            if (!hasMatchingPosition) return false;
        }

        // 검색 필터
        if (currentFilters.search) {
            const searchText = currentFilters.search;
            if (!job.title.toLowerCase().includes(searchText) &&
                !job.company.toLowerCase().includes(searchText) &&
                !job.location.toLowerCase().includes(searchText) &&
                !job.project.toLowerCase().includes(searchText) &&
                !job.scope.toLowerCase().includes(searchText)) {
                return false;
            }
        }

        return true;
    });

    // 정렬
    sortJobs();
    
    // 페이지 리셋
    currentPage = 1;
    renderJobs();
}

// 정렬
function sortJobs() {
    switch (currentFilters.sort) {
        case 'latest':
            filteredJobs.sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate));
            break;
        case 'views':
            filteredJobs.sort((a, b) => b.views - a.views);
            break;
        case 'deadline':
            filteredJobs.sort((a, b) => {
                if (a.status === 'closed') return 1;
                if (b.status === 'closed') return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            });
            break;
        case 'premium':
            filteredJobs.sort((a, b) => {
                if (a.isPremium && !b.isPremium) return -1;
                if (!a.isPremium && b.isPremium) return 1;
                if (a.isPromoted && !b.isPromoted) return -1;
                if (!a.isPromoted && b.isPromoted) return 1;
                return 0;
            });
            break;
    }
}

// 공고 렌더링
function renderJobs() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageJobs = filteredJobs.slice(startIndex, endIndex);

    jobListElement.innerHTML = pageJobs.map(job => createJobCard(job)).join('');
    renderPagination();

    // 카드 클릭 이벤트
    document.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.apply-btn')) {
                const jobId = parseInt(card.dataset.jobId);
                showJobDetail(jobId);
            }
        });
    });

    // 지원하기 버튼 이벤트
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('지원 기능은 준비중입니다.');
        });
    });
}

// 공고 카드 생성
function createJobCard(job) {
    const statusClass = job.status;
    const statusText = {
        'recruiting': '모집중',
        'closing': '마감임박',
        'closed': '마감'
    }[job.status];

    const daysLeft = Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    const deadlineText = job.status === 'closed' ? '마감' : `D-${daysLeft}`;

    return `
        <div class="job-card ${job.isPremium ? 'premium' : ''} ${job.isPromoted ? 'promoted' : ''}" data-job-id="${job.id}">
            ${job.isPremium ? '<div class="premium-badge"><i class="fas fa-crown"></i> 프리미엄</div>' : ''}
            ${job.isPromoted ? '<div class="promoted-badge">상단노출</div>' : ''}
            
            <div class="job-header">
                <div class="job-title-section">
                    <h3 class="job-title">${job.title}</h3>
                    <div class="job-company">
                        <span>${job.company}</span>
                        ${job.verified ? '<i class="fas fa-check-circle company-verified"></i>' : ''}
                    </div>
                </div>
                <div class="job-status">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span class="deadline">${deadlineText}</span>
                </div>
            </div>

            <div class="job-info">
                <div class="info-item">
                    <span class="info-label">지역</span>
                    <span class="info-value">${job.location}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">프로젝트</span>
                    <span class="info-value">${job.project}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">업무범위</span>
                    <span class="info-value">${job.scope}</span>
                </div>
            </div>

            <p class="job-description">${job.description}</p>

            <div class="job-footer">
                <div class="job-meta">
                    <span><i class="fas fa-eye"></i> ${job.views}</span>
                    <span><i class="fas fa-comment"></i> ${job.comments}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(job.registeredDate)}</span>
                </div>
                <div class="job-actions">
                    <button class="detail-btn">상세보기</button>
                    <button class="apply-btn">지원하기</button>
                </div>
            </div>
        </div>
    `;
}

// 상세 모달 표시
function showJobDetail(jobId) {
    const job = planningJobs.find(j => j.id === jobId);
    if (!job) return;

    modalContent.innerHTML = `
        <div class="job-detail-header">
            <h2>${job.title}</h2>
            <div class="job-company">
                <span>${job.company}</span>
                ${job.verified ? '<i class="fas fa-check-circle company-verified"></i>' : ''}
            </div>
        </div>

        <div class="job-detail-content">
            <div class="detail-section">
                <h3><i class="fas fa-briefcase"></i> 프로젝트 정보</h3>
                <div class="job-info">
                    <div class="info-item">
                        <span class="info-label">프로젝트명</span>
                        <span class="info-value">${job.project}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">지역</span>
                        <span class="info-value">${job.location}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">마감일</span>
                        <span class="info-value">${job.deadline}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-tasks"></i> 업무 범위</h3>
                <p>${job.scope}</p>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-file-alt"></i> 상세 설명</h3>
                <p>${job.description}</p>
            </div>

            ${job.requirements ? `
                <div class="detail-section">
                    <h3><i class="fas fa-check-square"></i> 자격 요건</h3>
                    <ul class="detail-list">
                        ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${job.benefits ? `
                <div class="detail-section">
                    <h3><i class="fas fa-gift"></i> 혜택 및 복리후생</h3>
                    <ul class="detail-list">
                        ${job.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="detail-section">
                <h3><i class="fas fa-user-tie"></i> 담당자 정보</h3>
                <div class="manager-profile">
                    <div class="manager-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="manager-info">
                        <div class="manager-name">${job.manager.name}</div>
                        <div class="manager-title">${job.manager.title}</div>
                        <div class="manager-badges">
                            <span class="manager-badge">${job.manager.level}</span>
                            ${job.verified ? '<span class="manager-badge">인증완료</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>

            <div class="job-actions" style="margin-top: 24px;">
                <button class="apply-btn" style="width: 100%; padding: 12px;">
                    <i class="fas fa-paper-plane"></i> 지원하기
                </button>
            </div>
        </div>
    `;

    modalElement.style.display = 'flex';
}

// 페이지네이션 렌더링
function renderPagination() {
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    let html = `
        <a href="#" class="${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </a>
        <div class="page-numbers">
    `;

    for (let i = startPage; i <= endPage; i++) {
        html += `<a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
    }

    html += `
        </div>
        <a href="#" class="${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </a>
    `;

    paginationElement.innerHTML = html;

    // 페이지 클릭 이벤트
    paginationElement.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page);
            if (!isNaN(page) && page !== currentPage && page >= 1 && page <= totalPages) {
                currentPage = page;
                renderJobs();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// 날짜 포맷
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return '오늘';
    if (diff === 1) return '어제';
    if (diff < 7) return `${diff}일 전`;
    if (diff < 30) return `${Math.floor(diff / 7)}주 전`;
    return `${Math.floor(diff / 30)}개월 전`;
}

// 플로팅 버튼 초기화
function initFloatingButton() {
    const floatingBtn = document.getElementById('writeJobBtn');
    if (floatingBtn) {
        floatingBtn.addEventListener('click', function() {
            // 글쓰기 모달 열기 또는 페이지 이동
            alert('구인공고 등록 페이지로 이동합니다.');
        });
    }
}

// 페이지 로드 시 플로팅 버튼 초기화
document.addEventListener('DOMContentLoaded', function() {
    initFloatingButton();
});