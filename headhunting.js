// headhunting.js - 헤드헌팅 페이지 기능

// 샘플 인재 데이터
const talentData = [
    {
        id: 1,
        name: '김태영',
        role: '기획자',
        experience: '15년차',
        location: '서울/경기',
        rating: 5.0,
        ratingCount: 127,
        skills: ['대규모 프로젝트', '마케팅 전략', '수익성 분석', '프로젝트 관리', '팀 리더십'],
        highlights: [
            { icon: 'building', text: '주요 프로젝트 50건+' },
            { icon: 'chart-line', text: '평균 분양률 95%' }
        ],
        description: '15년간 수도권 주요 분양 프로젝트를 성공적으로 이끌어온 전문가입니다. 특히 대규모 단지 기획과 마케팅 전략 수립에 강점을 보유하고 있습니다.',
        badges: ['verified', 'premium'],
        status: 'online',
        type: 'planner',
        featured: true
    },
    {
        id: 2,
        name: '이서연',
        role: '영업팀장',
        experience: '10년차',
        location: '서울',
        rating: 4.9,
        ratingCount: 89,
        skills: ['팀 관리', '고객 상담', '계약 협상', '영업 전략'],
        highlights: [
            { icon: 'users', text: '팀원 30명+ 관리' },
            { icon: 'trophy', text: '3년 연속 최우수상' }
        ],
        description: '강남권 프리미엄 분양 전문가로, 뛰어난 리더십과 고객 관리 능력을 보유하고 있습니다. 체계적인 팀 운영과 높은 계약 성공률이 강점입니다.',
        badges: ['verified', 'hot'],
        status: 'online',
        type: 'sales',
        featured: true
    },
    {
        id: 3,
        name: '박민수',
        role: '상담사',
        experience: '7년차',
        location: '경기',
        rating: 4.3,
        ratingCount: 45,
        skills: ['청약 상담', '계약 관리', 'CS'],
        description: '청약 상담 전문가로 고객 만족도가 높은 상담사입니다.',
        badges: ['verified'],
        status: 'offline',
        type: 'consultant',
        featured: false
    },
    {
        id: 4,
        name: '정하늘',
        role: '트레이너',
        experience: '5년차',
        location: '서울',
        rating: 4.7,
        ratingCount: 32,
        skills: ['영업 교육', '매뉴얼 개발', '성과 관리'],
        description: '체계적인 교육 프로그램 개발과 실무 중심 트레이닝 전문가입니다.',
        badges: ['new'],
        status: 'online',
        type: 'trainer',
        featured: false
    }
];

// 더미 데이터 추가 생성
for (let i = 5; i <= 20; i++) {
    const types = ['planner', 'sales', 'consultant', 'trainer'];
    const roles = ['기획자', '영업자', '상담사', '트레이너'];
    const typeIndex = (i - 5) % 4;
    
    talentData.push({
        id: i,
        name: `전문가${i}`,
        role: roles[typeIndex],
        experience: `${3 + (i % 10)}년차`,
        location: ['서울', '경기', '인천', '부산'][i % 4],
        rating: 3.5 + (Math.random() * 1.5),
        ratingCount: Math.floor(Math.random() * 100),
        skills: ['전문 스킬1', '전문 스킬2', '전문 스킬3'],
        description: `${roles[typeIndex]} 분야의 전문가입니다.`,
        badges: i % 3 === 0 ? ['verified'] : [],
        status: i % 2 === 0 ? 'online' : 'offline',
        type: types[typeIndex],
        featured: false
    });
}

// 현재 필터 상태
let currentFilters = {
    type: 'all',
    salesTypes: [],
    productTypes: [],
    positions: [],
    skills: [],
    region: '',
    experience: '',
    sort: 'latest'
};

// 현재 표시된 인재 수
let displayedTalents = 8;

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    renderTalents();
    initializeModal();
});

// 필터 초기화
function initializeFilters() {
    // 타입 필터 탭 (checkbox-tab 클래스 사용)
    const filterTabs = document.querySelectorAll('.checkbox-tab[data-filter-type="type"]');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilters.type = this.dataset.value;
            renderTalents();
        });
    });

    // 지역 필터
    const regionFilter = document.getElementById('regionFilter');
    if (regionFilter) {
        regionFilter.addEventListener('change', function() {
            currentFilters.region = this.value === 'all' ? '' : this.value;
            renderTalents();
        });
    }

    // 경력 필터
    const experienceFilter = document.getElementById('experienceFilter');
    if (experienceFilter) {
        experienceFilter.addEventListener('change', function() {
            currentFilters.experience = this.value === 'all' ? '' : this.value;
            renderTalents();
        });
    }

    // 정렬 필터
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentFilters.sort = this.value;
            renderTalents();
        });
    }

    // 분양유형 체크박스 필터
    const salesCheckboxes = document.querySelectorAll('input[name="sales-type"]');
    salesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!currentFilters.salesTypes.includes(this.value)) {
                    currentFilters.salesTypes.push(this.value);
                }
            } else {
                const index = currentFilters.salesTypes.indexOf(this.value);
                if (index > -1) {
                    currentFilters.salesTypes.splice(index, 1);
                }
            }
            renderTalents();
        });
    });

    // 상품유형 체크박스 필터
    const productCheckboxes = document.querySelectorAll('input[name="product-type"]');
    productCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!currentFilters.productTypes.includes(this.value)) {
                    currentFilters.productTypes.push(this.value);
                }
            } else {
                const index = currentFilters.productTypes.indexOf(this.value);
                if (index > -1) {
                    currentFilters.productTypes.splice(index, 1);
                }
            }
            renderTalents();
        });
    });

    // 직급 체크박스 필터
    const positionCheckboxes = document.querySelectorAll('input[name="position"]');
    positionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!currentFilters.positions.includes(this.value)) {
                    currentFilters.positions.push(this.value);
                }
            } else {
                const index = currentFilters.positions.indexOf(this.value);
                if (index > -1) {
                    currentFilters.positions.splice(index, 1);
                }
            }
            renderTalents();
        });
    });

    // 업무역량 체크박스 필터
    const skillCheckboxes = document.querySelectorAll('input[name="skills"]');
    skillCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (!currentFilters.skills.includes(this.value)) {
                    currentFilters.skills.push(this.value);
                }
            } else {
                const index = currentFilters.skills.indexOf(this.value);
                if (index > -1) {
                    currentFilters.skills.splice(index, 1);
                }
            }
            renderTalents();
        });
    });
}

// 인재 목록 렌더링
function renderTalents() {
    // 필터링
    let filteredTalents = talentData.filter(talent => {
        if (currentFilters.type !== 'all' && talent.type !== currentFilters.type) {
            return false;
        }
        if (currentFilters.region && !matchRegion(talent.location, currentFilters.region)) {
            return false;
        }
        if (currentFilters.experience && !matchExperience(talent.experience, currentFilters.experience)) {
            return false;
        }
        return true;
    });

    // 정렬
    filteredTalents = sortTalents(filteredTalents, currentFilters.sort);

    // 추천 인재만 표시
    const featuredTalents = filteredTalents.filter(t => t.featured);

    // 추천 인재 렌더링
    renderFeaturedTalents(featuredTalents);

    // 카운트 업데이트
    updateFilterCounts(filteredTalents);
}

// 추천 인재 렌더링
function renderFeaturedTalents(talents) {
    const container = document.getElementById('featuredTalentGrid');
    if (!container) return;

    container.innerHTML = talents.map(talent => createFeaturedTalentCard(talent)).join('');
}

// 추천 인재 카드 생성
function createFeaturedTalentCard(talent) {
    const badges = talent.badges.map(badge => {
        const badgeClasses = {
            verified: 'verified',
            premium: 'premium',
            hot: 'hot',
            new: 'new'
        };
        const badgeTexts = {
            verified: '인증',
            premium: '프리미엄',
            hot: 'HOT',
            new: 'NEW'
        };
        return `<span class="talent-badge ${badgeClasses[badge]}">${badgeTexts[badge]}</span>`;
    }).join('');

    const skills = talent.skills.slice(0, 3).map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    const remainingSkills = talent.skills.length > 3 ? 
        `<span class="skill-tag">+${talent.skills.length - 3}</span>` : '';

    const highlights = talent.highlights ? talent.highlights.map(h => `
        <div class="highlight-item">
            <i class="fas fa-${h.icon}"></i>
            <span>${h.text}</span>
        </div>
    `).join('') : '';

    const stars = Array(5).fill(0).map((_, i) => 
        i < Math.floor(talent.rating) ? 
        '<i class="fas fa-star"></i>' : 
        '<i class="far fa-star"></i>'
    ).join('');

    return `
        <div class="talent-card featured">
            <div class="talent-badge-container">
                ${badges}
            </div>
            
            <div class="talent-header">
                <div class="talent-avatar">
                    <img src="https://via.placeholder.com/80" alt="${talent.name}">
                    <div class="talent-status ${talent.status}"></div>
                </div>
                <div class="talent-info">
                    <h3 class="talent-name">${talent.name} <span class="talent-role">${talent.role}</span></h3>
                    <div class="talent-meta">
                        <span class="meta-item">
                            <i class="fas fa-briefcase"></i> ${talent.experience}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-map-marker-alt"></i> ${talent.location}
                        </span>
                    </div>
                    <div class="talent-rating">
                        <div class="rating-stars">
                            ${stars}
                        </div>
                        <span class="rating-score">${talent.rating.toFixed(1)}</span>
                        <span class="rating-count">(${talent.ratingCount})</span>
                    </div>
                </div>
            </div>
            
            <div class="talent-skills">
                ${skills}
                ${remainingSkills}
            </div>
            
            ${highlights ? `
            <div class="talent-highlights">
                ${highlights}
            </div>
            ` : ''}
            
            <div class="talent-description">
                "${talent.description}"
            </div>
            
            <div class="talent-actions">
                <button class="btn-outline-primary" onclick="viewProfile(${talent.id})">
                    <i class="fas fa-user"></i> 프로필 보기
                </button>
                <button class="btn-primary" onclick="contactTalent(${talent.id})">
                    <i class="fas fa-paper-plane"></i> 컨택하기
                </button>
            </div>
        </div>
    `;
}

// 일반 인재 카드 생성
function createRegularTalentCard(talent) {
    const badges = talent.badges.map(badge => {
        const badgeClasses = {
            verified: 'verified',
            new: 'new'
        };
        const badgeTexts = {
            verified: '인증',
            new: 'NEW'
        };
        return `<span class="talent-badge ${badgeClasses[badge]}">${badgeTexts[badge]}</span>`;
    }).join('');

    const skills = talent.skills.slice(0, 3).map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');

    const stars = Array(5).fill(0).map((_, i) => 
        i < Math.floor(talent.rating) ? 
        '<i class="fas fa-star"></i>' : 
        i < talent.rating ? 
        '<i class="fas fa-star-half-alt"></i>' :
        '<i class="far fa-star"></i>'
    ).join('');

    return `
        <div class="talent-card">
            ${badges ? `
            <div class="talent-badge-container">
                ${badges}
            </div>
            ` : ''}
            
            <div class="talent-header">
                <div class="talent-avatar">
                    <img src="https://via.placeholder.com/60" alt="${talent.name}">
                    <div class="talent-status ${talent.status}"></div>
                </div>
                <div class="talent-info">
                    <h3 class="talent-name">${talent.name} <span class="talent-role">${talent.role}</span></h3>
                    <div class="talent-meta">
                        <span class="meta-item">
                            <i class="fas fa-briefcase"></i> ${talent.experience}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-map-marker-alt"></i> ${talent.location}
                        </span>
                    </div>
                    <div class="talent-rating">
                        <div class="rating-stars">
                            ${stars}
                        </div>
                        <span class="rating-score">${talent.rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>
            
            <div class="talent-skills">
                ${skills}
            </div>
            
            <div class="talent-description">
                ${talent.description}
            </div>
            
            <div class="talent-actions">
                <button class="btn-outline-primary btn-block" onclick="viewProfile(${talent.id})">
                    <i class="fas fa-eye"></i> 상세보기
                </button>
            </div>
        </div>
    `;
}

// 지역 매칭
function matchRegion(location, filter) {
    const regionMap = {
        seoul: '서울',
        gyeonggi: '경기',
        incheon: '인천',
        busan: '부산',
        daegu: '대구',
        gwangju: '광주',
        daejeon: '대전'
    };
    return location.includes(regionMap[filter]);
}

// 경력 매칭
function matchExperience(experience, filter) {
    const years = parseInt(experience);
    switch(filter) {
        case 'junior': return years <= 3;
        case 'middle': return years > 3 && years <= 7;
        case 'senior': return years > 7 && years <= 10;
        case 'expert': return years > 10;
        default: return true;
    }
}

// 정렬
function sortTalents(talents, sortBy) {
    const sorted = [...talents];
    switch(sortBy) {
        case 'popular':
            return sorted.sort((a, b) => b.ratingCount - a.ratingCount);
        case 'rating':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'experience':
            return sorted.sort((a, b) => {
                const aYears = parseInt(a.experience);
                const bYears = parseInt(b.experience);
                return bYears - aYears;
            });
        case 'latest':
        default:
            return sorted.sort((a, b) => b.id - a.id);
    }
}

// 필터 카운트 업데이트
function updateFilterCounts(filteredTalents) {
    const typeCounts = {
        all: talentData.length,
        planner: talentData.filter(t => t.type === 'planner').length,
        sales: talentData.filter(t => t.type === 'sales').length,
        marketing: talentData.filter(t => t.type === 'marketing').length,
        consultant: talentData.filter(t => t.type === 'consultant').length
    };

    // 카운트 업데이트
    Object.keys(typeCounts).forEach(type => {
        const countEl = document.getElementById(`count-${type}`);
        if (countEl) {
            countEl.textContent = typeCounts[type] || 0;
        }
    });
}

// 모달 초기화
function initializeModal() {
    const modal = document.getElementById('recommendationModal');
    const openBtn = document.getElementById('requestRecommendation');
    const closeBtn = modal?.querySelector('.modal-close');
    const form = document.getElementById('recommendationForm');

    if (openBtn && modal) {
        openBtn.addEventListener('click', function() {
            modal.classList.add('active');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }

    // 모달 외부 클릭 시 닫기
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // 폼 제출
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('맞춤 인재 추천 요청이 접수되었습니다.\n24시간 이내에 전문 헤드헌터가 연락드리겠습니다.');
            modal.classList.remove('active');
            form.reset();
        });
    }
}

// 뷰 옵션 초기화
function initializeViewOptions() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const talentGrid = document.querySelector('.talent-list-section .talent-grid');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            if (talentGrid) {
                if (view === 'list') {
                    talentGrid.style.gridTemplateColumns = '1fr';
                } else {
                    talentGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
                }
            }
        });
    });
}

// 추천 요청 모달 표시
window.showRecommendationModal = function() {
    const modal = document.getElementById('recommendationModal');
    if (modal) {
        modal.classList.add('active');
    }
};

// 검색 기능
window.searchTalents = function() {
    const searchInput = document.getElementById('talentSearchInput');
    if (searchInput) {
        const query = searchInput.value.toLowerCase();
        // 실제 검색 로직 구현
        console.log('Searching for:', query);
        renderTalents();
    }
};

// 빠른 검색
window.quickSearch = function(keyword) {
    const searchInput = document.getElementById('talentSearchInput');
    if (searchInput) {
        searchInput.value = keyword;
        searchTalents();
    }
};

// 페이지 변경
window.changePage = function(direction) {
    console.log('Changing page:', direction);
    // 페이지네이션 로직 구현
};

// 프로필 보기
function viewProfile(talentId) {
    const talent = talentData.find(t => t.id === talentId);
    if (talent) {
        alert(`${talent.name} ${talent.role}님의 상세 프로필 페이지로 이동합니다.`);
    }
}

// 컨택하기
function contactTalent(talentId) {
    const talent = talentData.find(t => t.id === talentId);
    if (talent) {
        const confirm = window.confirm(`${talent.name} ${talent.role}님께 컨택을 요청하시겠습니까?\n\n포인트 100P가 차감됩니다.`);
        if (confirm) {
            alert('컨택 요청이 전송되었습니다.\n상대방이 수락하면 알림을 받으실 수 있습니다.');
        }
    }
}

// 모달 닫기 (전역 함수)
window.closeModal = function() {
    const modal = document.getElementById('recommendationModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// 필터 초기화
window.resetFilters = function() {
    // 필터 상태 초기화
    currentFilters = {
        type: 'all',
        salesTypes: [],
        productTypes: [],
        positions: [],
        skills: [],
        region: '',
        experience: '',
        sort: 'latest'
    };

    // 라디오 버튼 초기화
    const typeRadio = document.querySelector('input[name="talent-type"][value="all"]');
    if (typeRadio) {
        typeRadio.checked = true;
        const tab = typeRadio.closest('.checkbox-tab');
        document.querySelectorAll('.checkbox-tab[data-filter-type="type"]').forEach(t => {
            t.classList.remove('active');
        });
        if (tab) tab.classList.add('active');
    }

    // 체크박스 초기화
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // 셀렉트 박스 초기화
    const regionFilter = document.getElementById('regionFilter');
    if (regionFilter) regionFilter.value = 'all';

    const experienceFilter = document.getElementById('experienceFilter');
    if (experienceFilter) experienceFilter.value = 'all';

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) sortFilter.value = 'latest';

    // 재렌더링
    renderTalents();
};

// FAQ 아코디언 초기화
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCategories = document.querySelectorAll('.faq-categories .checkbox-tab');
    
    // FAQ 아이템 클릭 이벤트
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function() {
                // 다른 FAQ 아이템 닫기 (선택사항)
                const isActive = item.classList.contains('active');
                
                // 모든 아이템 닫기
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // 클릭한 아이템 토글
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
    
    // FAQ 카테고리 필터
    faqCategories.forEach(category => {
        category.addEventListener('click', function() {
            // 활성 카테고리 업데이트
            faqCategories.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            
            const selectedCategory = this.dataset.category;
            
            // FAQ 아이템 필터링
            faqItems.forEach(item => {
                const itemCategory = item.dataset.category;
                
                if (selectedCategory === 'all' || itemCategory === selectedCategory) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
                
                // 필터 변경 시 모든 아이템 닫기
                item.classList.remove('active');
            });
        });
    });
}

// 회원 유형 전환 함수
window.switchMemberType = function(type) {
    const personalBtn = document.querySelector('.personal-btn');
    const companyBtn = document.querySelector('.company-btn');
    const personalContent = document.querySelector('.personal-content');
    const companyContent = document.querySelector('.company-content');

    if (type === 'personal') {
        // 개인회원 선택
        personalBtn.classList.add('active');
        companyBtn.classList.remove('active');
        personalContent.style.display = 'block';
        companyContent.style.display = 'none';
    } else if (type === 'company') {
        // 기업회원 선택
        personalBtn.classList.remove('active');
        companyBtn.classList.add('active');
        personalContent.style.display = 'none';
        companyContent.style.display = 'block';
    }
};

// 경력사항 추가 함수
window.addCareerItem = function() {
    const careerList = document.querySelector('.career-list');
    if (!careerList) return;
    
    const careerCount = careerList.querySelectorAll('.career-item').length;
    const newItem = document.createElement('div');
    newItem.className = 'career-item';
    newItem.innerHTML = `
        <span class="career-number">${careerCount + 1}</span>
        <button type="button" class="remove-career-btn" onclick="removeCareerItem(this)">
            <i class="fas fa-times"></i>
        </button>
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label required">현장명/회사명</label>
                <input type="text" class="form-input" placeholder="예: 래미안 원베일리 / 삼성물산">
            </div>
            <div class="form-group">
                <label class="form-label">직급/직책</label>
                <input type="text" class="form-input" placeholder="예: 과장/팀장">
            </div>
            <div class="form-group">
                <label class="form-label">근무기간</label>
                <input type="text" class="form-input" placeholder="예: 2020년 3월 ~ 2023년 12월">
            </div>
            <div class="form-group">
                <label class="form-label">총 경력년수</label>
                <input type="text" class="form-input" placeholder="예: 10년">
            </div>
            <div class="form-group full-width">
                <label class="form-label">주요 담당업무</label>
                <textarea class="form-textarea" rows="3" placeholder="주요 담당업무 및 성과를 입력해주세요"></textarea>
            </div>
        </div>
    `;
    
    careerList.appendChild(newItem);
    updateCareerNumbers();
};

// 경력사항 삭제 함수
window.removeCareerItem = function(button) {
    const item = button.closest('.career-item');
    item.remove();
    updateCareerNumbers();
};

// 경력사항 번호 업데이트
function updateCareerNumbers() {
    const items = document.querySelectorAll('.career-item');
    items.forEach((item, index) => {
        const numberEl = item.querySelector('.career-number');
        if (numberEl) {
            numberEl.textContent = index + 1;
        }
    });
}

// 자기소개 글자수 카운팅
function initializeCharacterCounter() {
    const textarea = document.querySelector('.self-intro-section textarea');
    const counter = document.querySelector('.char-counter');
    
    if (textarea && counter) {
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            const currentEl = counter.querySelector('.current');
            if (currentEl) {
                currentEl.textContent = length;
            }
            
            // 글자수 초과 시 경고
            if (length > 1000) {
                counter.style.color = '#fa5252';
                this.value = this.value.substring(0, 1000);
                currentEl.textContent = 1000;
            } else {
                counter.style.color = '#868e96';
            }
        });
    }
}

// 프로필 저장 함수
window.saveProfile = function(type) {
    const form = document.querySelector('.personal-profile-section');
    if (!form) return;
    
    if (type === 'temp') {
        // 임시저장
        const profileData = collectProfileData();
        localStorage.setItem('tempProfile', JSON.stringify(profileData));
        alert('프로필이 임시저장되었습니다.');
    } else {
        // 프로필 등록
        const profileData = collectProfileData();
        
        // 유효성 검사
        if (!validateProfile(profileData)) {
            return;
        }
        
        // 서버로 전송 (시뮬레이션)
        console.log('Saving profile:', profileData);
        alert('프로필이 성공적으로 등록되었습니다!\n매칭 서비스를 시작합니다.');
        
        // 등록 후 기업회원 페이지로 전환
        setTimeout(() => {
            switchMemberType('company');
        }, 1500);
    }
};

// 프로필 데이터 수집
function collectProfileData() {
    const data = {
        basicInfo: {},
        careers: [],
        specialties: {
            workField: [],
            productExperience: [],
            skills: []
        },
        desiredConditions: {},
        selfIntro: ''
    };
    
    // 기본정보 수집
    const basicInputs = document.querySelectorAll('.basic-info-section input');
    basicInputs.forEach(input => {
        if (input.name) {
            data.basicInfo[input.name] = input.value;
        }
    });
    
    // 경력사항 수집
    const careerItems = document.querySelectorAll('.career-item');
    careerItems.forEach(item => {
        const career = {
            company: item.querySelector('input[placeholder*="회사명"]')?.value || '',
            position: item.querySelector('input[placeholder*="직급"]')?.value || '',
            startDate: item.querySelectorAll('input[type="month"]')[0]?.value || '',
            endDate: item.querySelectorAll('input[type="month"]')[1]?.value || '',
            role: item.querySelector('input[placeholder*="담당업무"]')?.value || '',
            achievement: item.querySelector('textarea')?.value || ''
        };
        data.careers.push(career);
    });
    
    // 전문분야 수집
    document.querySelectorAll('.work-field-section input[type="checkbox"]:checked').forEach(cb => {
        data.specialties.workField.push(cb.value);
    });
    
    document.querySelectorAll('.product-experience-section input[type="checkbox"]:checked').forEach(cb => {
        data.specialties.productExperience.push(cb.value);
    });
    
    document.querySelectorAll('.skills-section input[type="checkbox"]:checked').forEach(cb => {
        data.specialties.skills.push(cb.value);
    });
    
    // 희망조건 수집
    const desiredInputs = document.querySelectorAll('.desired-conditions-section input, .desired-conditions-section select');
    desiredInputs.forEach(input => {
        if (input.name) {
            data.desiredConditions[input.name] = input.value;
        }
    });
    
    // 자기소개 수집
    const selfIntroTextarea = document.querySelector('.self-intro-section textarea');
    if (selfIntroTextarea) {
        data.selfIntro = selfIntroTextarea.value;
    }
    
    return data;
}

// 프로필 유효성 검사
function validateProfile(data) {
    // 필수 필드 검사
    if (!data.basicInfo.name || !data.basicInfo.phone || !data.basicInfo.email) {
        alert('기본정보의 필수 항목을 모두 입력해주세요.');
        return false;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.basicInfo.email)) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return false;
    }
    
    // 전화번호 형식 검사
    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    if (!phoneRegex.test(data.basicInfo.phone)) {
        alert('전화번호를 형식에 맞게 입력해주세요. (예: 010-1234-5678)');
        return false;
    }
    
    // 최소 1개 이상의 경력사항
    if (data.careers.length === 0 || !data.careers[0].company) {
        alert('최소 1개 이상의 경력사항을 입력해주세요.');
        return false;
    }
    
    // 전문분야 선택 검사
    if (data.specialties.workField.length === 0) {
        alert('업무분야를 최소 1개 이상 선택해주세요.');
        return false;
    }
    
    return true;
}

// 프로필 단계 표시
function initializeProgressSteps() {
    const sections = document.querySelectorAll('.profile-form-section');
    const steps = document.querySelectorAll('.step');
    
    if (sections.length === 0 || steps.length === 0) return;
    
    // 스크롤 이벤트로 현재 섹션 감지
    window.addEventListener('scroll', function() {
        let currentStep = 0;
        
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2) {
                currentStep = index;
            }
        });
        
        // 스텝 업데이트
        steps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
                if (index < currentStep) {
                    step.classList.add('completed');
                }
            } else {
                step.classList.remove('active');
                step.classList.remove('completed');
            }
        });
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Headhunting page initializing...');
    
    // 초기 상태 설정 (개인회원 기본 선택)
    switchMemberType('personal');
    
    // 모든 초기화 함수 실행
    try {
        initializeFilters();
        renderTalents();
        initializeFAQ(); // FAQ 초기화 추가
        initializeCharacterCounter(); // 글자수 카운터 초기화
        initializeProgressSteps(); // 진행 단계 초기화
        console.log('Headhunting page initialized successfully');
    } catch (error) {
        console.error('Error initializing headhunting page:', error);
    }
});