// qna-enhanced-korean.js - 한글 버전 Q&A 섹션

// 테스트 계정 정보
const users = [
    '김철수', '이영희', '박민수', '정수진', '최동현', '김서연', '이준호', '박지영', '홍길동', '김나영',
    '이상현', '박소영', '정현수', '김태영', '이민정', '박재현', '최수빈', '정다은', '김현우', '이서준',
    '박하늘', '정유진', '김도윤', '이하린', '박시우', '최지아', '정예준', '김서윤', '이주원', '박지호',
    '홍민준', '김윤서', '이도현', '박수아', '정건우', '김은지', '이성민', '박예린', '최준서', '정아인',
    '김태훈', '이소민', '박준영', '홍서영', '김민재', '이지우', '박현서', '정수현', '최민서', '김지안'
];

const nicknames = [
    '강남전문가', '부동산여왕', '서초구달인', '송파마스터', '강북전문', '마포구고수', '용산프로', '성동구베테랑', '종로의달인', '중구전문가',
    '노원구달인', '도봉구마스터', '은평구프로', '서대문전문', '양천구고수', '구로달인', '금천프로', '영등포마스터', '동작구전문', '관악프로',
    '서초베테랑', '강남구고수', '송파달인', '강동프로', '광진구마스터', '동대문전문', '중랑구고수', '성북달인', '강북프로', '도봉베테랑',
    '노원구마스터', '은평전문', '서대문프로', '마포달인', '용산구고수', '중구베테랑', '종로프로', '성동구마스터', '광진달인', '동대문프로',
    '중랑구전문', '성북고수', '강북달인', '도봉프로', '노원베테랑', '은평구마스터', '서대문달인', '마포프로', '양천구전문', '구로구고수'
];

// 질문 템플릿
const questionTemplates = [
    {
        title: "청약통장 가점 계산 관련 문의드립니다",
        excerpt: "안녕하세요. 청약통장 가점 계산 관련해서 궁금한 점이 있어 질문드립니다. 무주택기간과 부양가족수 계산 시...",
        tags: ["#청약통장", "#가점계산", "#무주택기간"]
    },
    {
        title: "분양가상한제 지역에서의 전매제한 기간은?",
        excerpt: "분양가상한제가 적용되는 지역에서 아파트를 분양받을 경우 전매제한 기간이 일반 지역과 다른지 궁금합니다...",
        tags: ["#분양가상한제", "#전매제한", "#규제"]
    },
    {
        title: "모델하우스 운영 시 효과적인 고객 응대 방법",
        excerpt: "모델하우스에서 고객 응대 시 자주 받는 질문들과 효과적인 답변 방법에 대해 선배님들의 노하우를 듣고 싶습니다...",
        tags: ["#모델하우스", "#고객응대", "#영업노하우"]
    },
    {
        title: "신혼부부 특별공급 소득기준 계산법",
        excerpt: "신혼부부 특별공급 신청 시 맞벌이 부부의 소득 합산 기준과 작년/올해 소득 중 어느 것을 기준으로 하는지...",
        tags: ["#특별공급", "#신혼부부", "#소득기준"]
    },
    {
        title: "청약 당첨 후 대출 거절시 대처방법",
        excerpt: "청약에 당첨되었는데 은행에서 대출이 거절될 경우 계약금 반환이 가능한지, 불이익은 없는지 궁금합니다...",
        tags: ["#청약당첨", "#주택담보대출", "#계약금"]
    },
    {
        title: "재개발/재건축 지역 분양권 투자 전망",
        excerpt: "서울 재개발/재건축 지역의 분양권 투자 전망과 리스크에 대해 전문가님들의 의견을 듣고 싶습니다...",
        tags: ["#재개발", "#재건축", "#투자전망"]
    },
    {
        title: "생애최초 특별공급 자격 조건 문의",
        excerpt: "생애최초 주택 구입자 특별공급의 자격 조건과 필요 서류, 주의사항에 대해 알고 싶습니다...",
        tags: ["#생애최초", "#특별공급", "#자격조건"]
    },
    {
        title: "분양 영업 초보자가 꼭 알아야 할 것들",
        excerpt: "이제 막 분양 영업을 시작한 초보입니다. 선배님들이 초보 시절 알았으면 좋았을 것들을 공유해주세요...",
        tags: ["#초보영업", "#영업팁", "#신입교육"]
    },
    {
        title: "전세보증금 반환 보증 보험 가입 방법",
        excerpt: "전세 계약 시 보증금 반환 보증 보험 가입이 필수인가요? 가입 절차와 비용이 궁금합니다...",
        tags: ["#전세보증금", "#보증보험", "#임대차"]
    },
    {
        title: "양도소득세 절세 방법 조언 부탁드립니다",
        excerpt: "분양권 전매 시 발생하는 양도소득세를 합법적으로 절세할 수 있는 방법들이 있을까요?...",
        tags: ["#양도소득세", "#절세", "#분양권전매"]
    },
    {
        title: "공공분양과 민간분양의 차이점",
        excerpt: "공공분양과 민간분양의 차이점, 각각의 장단점에 대해 자세히 알고 싶습니다...",
        tags: ["#공공분양", "#민간분양", "#비교"]
    },
    {
        title: "분양 마케팅 효과적인 SNS 활용법",
        excerpt: "요즘 SNS 마케팅이 중요하다고 하는데, 분양 영업에서 효과적인 SNS 활용 방법이 있을까요?...",
        tags: ["#SNS마케팅", "#온라인마케팅", "#홍보"]
    },
    {
        title: "청약 경쟁률 예측하는 방법",
        excerpt: "청약 경쟁률을 어느 정도 예측할 수 있는 방법이나 지표가 있나요? 경험적인 노하우를 공유해주세요...",
        tags: ["#청약경쟁률", "#예측", "#분석"]
    },
    {
        title: "모델하우스 없는 비대면 분양 전략",
        excerpt: "코로나 이후 비대면 분양이 늘어나고 있는데, 모델하우스 없이 효과적으로 분양하는 전략이 궁금합니다...",
        tags: ["#비대면분양", "#온라인분양", "#디지털전략"]
    },
    {
        title: "분양가 협상 가능한 시기와 방법",
        excerpt: "분양가 협상이 가능한 시기가 있나요? 있다면 어떻게 접근하는 것이 좋을까요?...",
        tags: ["#분양가협상", "#할인", "#프로모션"]
    }
];

// 답변 템플릿
const answerTemplates = [
    {
        content: "안녕하세요! 10년차 분양 전문가입니다. 말씀하신 부분에 대해 상세히 답변드리겠습니다...",
        helpful: true
    },
    {
        content: "저도 비슷한 경험이 있어서 도움이 될 것 같아 답변 남깁니다. 실제로 현장에서는...",
        helpful: true
    },
    {
        content: "관련 법령과 실무 경험을 바탕으로 설명드리면, 첫째로 확인하셔야 할 부분은...",
        helpful: true
    },
    {
        content: "좋은 질문입니다. 이 부분은 많은 분들이 헷갈려하시는데, 정확히 설명드리면...",
        helpful: false
    },
    {
        content: "제가 알기로는 최근 정책이 변경되어서 이제는 다음과 같이 적용됩니다...",
        helpful: false
    }
];

// 질문 데이터 생성
function generateQuestions(count = 100) {
    const questions = [];
    const statuses = ['adopted', 'unadopted'];
    
    for (let i = 0; i < count; i++) {
        const template = questionTemplates[i % questionTemplates.length];
        const authorIdx = Math.floor(Math.random() * 50);
        const hoursAgo = Math.random() * 720; // 30일 이내
        const isNew = hoursAgo < 24;
        const isPopular = Math.random() > 0.85;
        
        let timeStr;
        if (hoursAgo < 1) {
            timeStr = Math.floor(hoursAgo * 60) + '분 전';
        } else if (hoursAgo < 24) {
            timeStr = Math.floor(hoursAgo) + '시간 전';
        } else if (hoursAgo < 168) {
            timeStr = Math.floor(hoursAgo / 24) + '일 전';
        } else {
            const date = new Date();
            date.setHours(date.getHours() - hoursAgo);
            timeStr = (date.getMonth() + 1) + '/' + date.getDate();
        }
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const hasReward = status === 'unadopted' && Math.random() > 0.7;
        
        questions.push({
            id: i + 1,
            status: status,
            title: template.title,
            excerpt: template.excerpt,
            tags: template.tags,
            author: nicknames[authorIdx],
            authorName: users[authorIdx],
            time: timeStr,
            views: Math.floor(Math.random() * 1000) + 10,
            answers: status === 'adopted' ? Math.floor(Math.random() * 15) + 1 : Math.floor(Math.random() * 8),
            reward: hasReward ? Math.floor(Math.random() * 10) * 1000 + 5000 : 0,
            popular: isPopular,
            isNew: isNew
        });
    }
    
    return questions.sort((a, b) => {
        // 인기 질문 우선
        if (a.popular !== b.popular) return b.popular - a.popular;
        // 새 질문 우선
        if (a.isNew !== b.isNew) return b.isNew - a.isNew;
        // 최신순
        return b.id - a.id;
    });
}

// 답변 데이터 생성
function generateAnswers(questionId, count) {
    const answers = [];
    
    for (let i = 0; i < count; i++) {
        const template = answerTemplates[i % answerTemplates.length];
        const authorIdx = Math.floor(Math.random() * 50);
        const hoursAgo = Math.random() * 168; // 7일 이내
        
        let timeStr;
        if (hoursAgo < 1) {
            timeStr = Math.floor(hoursAgo * 60) + '분 전';
        } else if (hoursAgo < 24) {
            timeStr = Math.floor(hoursAgo) + '시간 전';
        } else {
            timeStr = Math.floor(hoursAgo / 24) + '일 전';
        }
        
        answers.push({
            id: questionId + '-' + (i + 1),
            author: nicknames[authorIdx],
            authorName: users[authorIdx],
            content: template.content,
            time: timeStr,
            likes: Math.floor(Math.random() * 50),
            isAdopted: i === 0 && template.helpful,
            helpful: template.helpful
        });
    }
    
    return answers;
}

// 전체 질문 데이터 생성
const questionsData = generateQuestions(100);

// 답변 데이터 저장
const answersData = {};
questionsData.forEach(question => {
    if (question.answers > 0) {
        answersData[question.id] = generateAnswers(question.id, question.answers);
    }
});

// 페이지 관련 변수
const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let currentFilter = 'all';
let currentCategory = 'all';
let currentSort = 'latest';
let filteredQuestions = [...questionsData];

// 디버그 로그
console.log('qna-enhanced-korean.js 로드 완료: ' + questionsData.length + '개 질문 생성됨');

// 질문 필터링
function filterQuestions() {
    let filtered = [...questionsData];
    
    // 상태 필터
    if (currentFilter === 'adopted') {
        filtered = filtered.filter(q => q.status === 'adopted');
    } else if (currentFilter === 'unadopted') {
        filtered = filtered.filter(q => q.status === 'unadopted');
    } else if (currentFilter === 'reward') {
        filtered = filtered.filter(q => q.reward > 0);
    } else if (currentFilter === 'popular') {
        filtered = filtered.filter(q => q.popular === true);
    } else if (currentFilter === 'myquestions') {
        // 내 질문 필터 (실제 앱에서는 사용자 세션 필요)
        filtered = filtered.filter(q => q.id % 5 === 0);
    }
    
    // 카테고리 필터 (태그 기반)
    if (currentCategory !== 'all') {
        const categoryKeywords = {
            'buying': ['#청약', '#분양', '#구매'],
            'selling': ['#매도', '#전매', '#양도'],
            'tax': ['#세금', '#양도소득세', '#취득세'],
            'loan': ['#대출', '#담보', '#금융'],
            'investment': ['#투자', '#수익', '#재개발']
        };
        
        if (categoryKeywords[currentCategory]) {
            filtered = filtered.filter(q => 
                q.tags.some(tag => 
                    categoryKeywords[currentCategory].some(keyword => 
                        tag.includes(keyword)
                    )
                )
            );
        }
    }
    
    // 정렬
    switch (currentSort) {
        case 'latest':
            // 기본 정렬 유지
            break;
        case 'popular':
            filtered.sort((a, b) => b.views - a.views);
            break;
        case 'answers':
            filtered.sort((a, b) => b.answers - a.answers);
            break;
    }
    
    filteredQuestions = filtered;
    currentPage = 1;
    renderQuestions();
    updatePagination();
    updateCounts();
}

// 카운트 업데이트
function updateCounts() {
    const allCount = questionsData.length;
    const adoptedCount = questionsData.filter(q => q.status === 'adopted').length;
    const unadoptedCount = questionsData.filter(q => q.status === 'unadopted').length;
    const popularCount = questionsData.filter(q => q.popular === true).length;
    const myCount = questionsData.filter(q => q.id % 5 === 0).length; // 내 질문 (모의)
    
    // 탭 카운트 업데이트
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        const category = tab.dataset.category;
        const countSpan = tab.querySelector('.count');
        if (countSpan) {
            switch(category) {
                case 'all':
                    countSpan.textContent = allCount;
                    break;
                case 'adopted':
                    countSpan.textContent = adoptedCount;
                    break;
                case 'unadopted':
                    countSpan.textContent = unadoptedCount;
                    break;
                case 'popular':
                    countSpan.textContent = popularCount;
                    break;
                case 'myquestions':
                    countSpan.textContent = myCount;
                    break;
            }
        }
    });
}

// 질문 목록 렌더링
function renderQuestions() {
    const container = document.getElementById('qnaList');
    if (!container) {
        console.error('qnaList 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageQuestions = filteredQuestions.slice(startIndex, endIndex);
    
    if (pageQuestions.length === 0) {
        container.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        return;
    }
    
    const html = pageQuestions.map(question => `
        <div class="question-card ${question.status}" data-id="${question.id}">
            <div class="question-header">
                <div class="question-status">
                    <span class="status-badge ${question.status}">
                        ${question.status === 'adopted' ? '채택완료' : '미채택'}
                    </span>
                    ${question.popular ? '<span class="hot-badge">인기</span>' : ''}
                    ${question.isNew ? '<span class="new-badge">NEW</span>' : ''}
                    ${question.reward > 0 && question.status === 'unadopted' ? `<span class="reward-badge"><i class="fas fa-coins"></i> ${question.reward.toLocaleString()}P</span>` : ''}
                </div>
            </div>
            <div class="question-content">
                <h3 class="question-title">
                    <a href="#" onclick="showQuestionDetail(${question.id}); return false;">
                        ${question.title}
                    </a>
                </h3>
                <p class="question-excerpt">${question.excerpt}</p>
                <div class="question-bottom">
                    <div class="question-tags">
                        ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="question-meta">
                        <span class="author"><i class="fas fa-user"></i> ${question.author}</span>
                        <span class="answers"><i class="fas fa-comment"></i> ${question.answers}</span>
                        <span class="views"><i class="fas fa-eye"></i> ${question.views}</span>
                        <span class="time"><i class="fas fa-clock"></i> ${question.time}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    let html = '';
    
    // 이전 버튼
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }
    
    // 페이지 번호
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" 
                 onclick="goToPage(${i})">${i}</button>`;
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    pagination.innerHTML = html;
}

// 페이지 이동
function goToPage(page) {
    currentPage = page;
    renderQuestions();
    updatePagination();
    window.scrollTo(0, 0);
}

// 질문 상세 보기
function showQuestionDetail(questionId) {
    const question = questionsData.find(q => q.id === questionId);
    if (!question) return;
    
    const answers = answersData[questionId] || [];
    
    const modal = document.createElement('div');
    modal.className = 'question-detail-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeQuestionDetail()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${question.title}</h2>
                <button class="close-btn" onclick="closeQuestionDetail()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="question-detail-meta">
                    <span class="status-badge ${question.status}">
                        ${question.status === 'adopted' ? '채택완료' : '미채택'}
                    </span>
                    <span class="author"><i class="fas fa-user"></i> ${question.author}</span>
                    <span class="time"><i class="fas fa-clock"></i> ${question.time}</span>
                    <span class="views"><i class="fas fa-eye"></i> ${question.views}</span>
                    ${question.reward > 0 ? `<span class="reward"><i class="fas fa-coins"></i> ${question.reward.toLocaleString()}P</span>` : ''}
                </div>
                <div class="question-detail-content">
                    <p>${question.excerpt}</p>
                    <p>이 질문에 대한 자세한 내용과 배경 설명이 여기에 표시됩니다...</p>
                </div>
                <div class="question-tags">
                    ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <div class="answers-section">
                    <h3>답변 ${answers.length}개</h3>
                    ${answers.length > 0 ? `
                        <div class="answers-list">
                            ${answers.map(answer => `
                                <div class="answer-item ${answer.isAdopted ? 'adopted' : ''}">
                                    ${answer.isAdopted ? '<span class="adopted-badge">채택된 답변</span>' : ''}
                                    <div class="answer-author">
                                        <i class="fas fa-user-circle"></i> ${answer.author}
                                        <span class="answer-time">${answer.time}</span>
                                    </div>
                                    <div class="answer-content">${answer.content}</div>
                                    <div class="answer-actions">
                                        <button class="like-btn">
                                            <i class="fas fa-thumbs-up"></i> ${answer.likes}
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="no-answers">아직 답변이 없습니다.</p>'}
                    
                    <div class="answer-write">
                        <h4>답변 작성</h4>
                        <textarea placeholder="답변을 작성해주세요..." rows="5"></textarea>
                        <button class="submit-answer-btn">답변 등록</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// 질문 상세 모달 닫기
function closeQuestionDetail() {
    const modal = document.querySelector('.question-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// 질문하기 모달 표시
function showAskModal() {
    const modal = document.getElementById('askModal');
    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// 질문하기 모달 닫기
function closeAskModal() {
    const modal = document.getElementById('askModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// 전역 함수로 등록
window.showQuestionDetail = showQuestionDetail;
window.closeQuestionDetail = closeQuestionDetail;
window.goToPage = goToPage;
window.showAskModal = showAskModal;
window.closeAskModal = closeAskModal;

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료, 이벤트 리스너 설정 시작');
    
    // 초기 렌더링
    renderQuestions();
    updatePagination();
    updateCounts();
    
    // 탭 버튼 이벤트
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            if (!category) return;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 탭 카테고리 처리
            if (category === 'all') {
                currentFilter = 'all';
            } else if (category === 'adopted') {
                currentFilter = 'adopted';
            } else if (category === 'unadopted') {
                currentFilter = 'unadopted';
            } else if (category === 'popular') {
                currentFilter = 'popular';
            } else if (category === 'myquestions') {
                currentFilter = 'myquestions';
            }
            
            filterQuestions();
        });
    });
    
    // 카테고리 버튼 이벤트
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category || 'all';
            filterQuestions();
        });
    });
    
    // 정렬 버튼 이벤트
    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sortBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSort = this.dataset.sort || 'latest';
            filterQuestions();
        });
    });
    
    // 검색 기능
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm) {
                filteredQuestions = questionsData.filter(q => 
                    q.title.toLowerCase().includes(searchTerm) ||
                    q.excerpt.toLowerCase().includes(searchTerm) ||
                    q.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            } else {
                filteredQuestions = [...questionsData];
            }
            currentPage = 1;
            renderQuestions();
            updatePagination();
        };
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    console.log('이벤트 리스너 설정 완료');
});