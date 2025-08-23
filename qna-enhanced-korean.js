// qna-enhanced-korean.js - 한글 버전 Q&A 섹션

// 테스트 계정 정보
const users = [
    '김철수',
    '이영희',
    '박민수',
    '정수진',
    '최동현',
    '김서연',
    '이준호',
    '박지영',
    '홍길동',
    '김나영',
    '이상현',
    '박소영',
    '정현수',
    '김태영',
    '이민정',
    '박재현',
    '최수빈',
    '정다은',
    '김현우',
    '이서준',
    '박하늘',
    '정유진',
    '김도윤',
    '이하린',
    '박시우',
    '최지아',
    '정예준',
    '김서윤',
    '이주원',
    '박지호',
    '홍민준',
    '김윤서',
    '이도현',
    '박수아',
    '정건우',
    '김은지',
    '이성민',
    '박예린',
    '최준서',
    '정아인',
    '김태훈',
    '이소민',
    '박준영',
    '홍서영',
    '김민재',
    '이지우',
    '박현서',
    '정수현',
    '최민서',
    '김지안',
];

const nicknames = [
    '강남전문가',
    '부동산여왕',
    '서초구달인',
    '송파마스터',
    '강북전문',
    '마포구고수',
    '용산프로',
    '성동구베테랑',
    '종로의달인',
    '중구전문가',
    '노원구달인',
    '도봉구마스터',
    '은평구프로',
    '서대문전문',
    '양천구고수',
    '구로달인',
    '금천프로',
    '영등포마스터',
    '동작구전문',
    '관악프로',
    '서초베테랑',
    '강남구고수',
    '송파달인',
    '강동프로',
    '광진구마스터',
    '동대문전문',
    '중랑구고수',
    '성북달인',
    '강북프로',
    '도봉베테랑',
    '노원구마스터',
    '은평전문',
    '서대문프로',
    '마포달인',
    '용산구고수',
    '중구베테랑',
    '종로프로',
    '성동구마스터',
    '광진달인',
    '동대문프로',
    '중랑구전문',
    '성북고수',
    '강북달인',
    '도봉프로',
    '노원베테랑',
    '은평구마스터',
    '서대문달인',
    '마포프로',
    '양천구전문',
    '구로구고수',
];

// 질문 템플릿
const questionTemplates = [
    {
        title: '청약통장 가점 계산 관련 문의드립니다',
        excerpt:
            '안녕하세요. 청약통장 가점 계산 관련해서 궁금한 점이 있어 질문드립니다. 무주택기간과 부양가족수 계산 시...',
        tags: ['#청약통장', '#가점계산', '#무주택기간'],
    },
    {
        title: '분양가상한제 지역에서의 전매제한 기간은?',
        excerpt:
            '분양가상한제가 적용되는 지역에서 아파트를 분양받을 경우 전매제한 기간이 일반 지역과 다른지 궁금합니다...',
        tags: ['#분양가상한제', '#전매제한', '#규제'],
    },
    {
        title: '모델하우스 운영 시 효과적인 고객 응대 방법',
        excerpt:
            '모델하우스에서 고객 응대 시 자주 받는 질문들과 효과적인 답변 방법에 대해 선배님들의 노하우를 듣고 싶습니다...',
        tags: ['#모델하우스', '#고객응대', '#영업노하우'],
    },
    {
        title: '신혼부부 특별공급 소득기준 계산법',
        excerpt:
            '신혼부부 특별공급 신청 시 맞벌이 부부의 소득 합산 기준과 작년/올해 소득 중 어느 것을 기준으로 하는지...',
        tags: ['#특별공급', '#신혼부부', '#소득기준'],
    },
    {
        title: '청약 당첨 후 대출 거절시 대처방법',
        excerpt:
            '청약에 당첨되었는데 은행에서 대출이 거절될 경우 계약금 반환이 가능한지, 불이익은 없는지 궁금합니다...',
        tags: ['#청약당첨', '#주택담보대출', '#계약금'],
    },
    {
        title: '재개발/재건축 지역 분양권 투자 전망',
        excerpt:
            '서울 재개발/재건축 지역의 분양권 투자 전망과 리스크에 대해 전문가님들의 의견을 듣고 싶습니다...',
        tags: ['#재개발', '#재건축', '#투자전망'],
    },
    {
        title: '생애최초 특별공급 자격 조건 문의',
        excerpt:
            '생애최초 주택 구입자 특별공급의 자격 조건과 필요 서류, 주의사항에 대해 알고 싶습니다...',
        tags: ['#생애최초', '#특별공급', '#자격조건'],
    },
    {
        title: '분양 영업 초보자가 꼭 알아야 할 것들',
        excerpt:
            '이제 막 분양 영업을 시작한 초보입니다. 선배님들이 초보 시절 알았으면 좋았을 것들을 공유해주세요...',
        tags: ['#초보영업', '#영업팁', '#신입교육'],
    },
    {
        title: '전세보증금 반환 보증 보험 가입 방법',
        excerpt:
            '전세 계약 시 보증금 반환 보증 보험 가입이 필수인가요? 가입 절차와 비용이 궁금합니다...',
        tags: ['#전세보증금', '#보증보험', '#임대차'],
    },
    {
        title: '양도소득세 절세 방법 조언 부탁드립니다',
        excerpt:
            '분양권 전매 시 발생하는 양도소득세를 합법적으로 절세할 수 있는 방법들이 있을까요?...',
        tags: ['#양도소득세', '#절세', '#분양권전매'],
    },
    {
        title: '공공분양과 민간분양의 차이점',
        excerpt: '공공분양과 민간분양의 차이점, 각각의 장단점에 대해 자세히 알고 싶습니다...',
        tags: ['#공공분양', '#민간분양', '#비교'],
    },
    {
        title: '분양 마케팅 효과적인 SNS 활용법',
        excerpt:
            '요즘 SNS 마케팅이 중요하다고 하는데, 분양 영업에서 효과적인 SNS 활용 방법이 있을까요?...',
        tags: ['#SNS마케팅', '#온라인마케팅', '#홍보'],
    },
    {
        title: '청약 경쟁률 예측하는 방법',
        excerpt:
            '청약 경쟁률을 어느 정도 예측할 수 있는 방법이나 지표가 있나요? 경험적인 노하우를 공유해주세요...',
        tags: ['#청약경쟁률', '#예측', '#분석'],
    },
    {
        title: '모델하우스 없는 비대면 분양 전략',
        excerpt:
            '코로나 이후 비대면 분양이 늘어나고 있는데, 모델하우스 없이 효과적으로 분양하는 전략이 궁금합니다...',
        tags: ['#비대면분양', '#온라인분양', '#디지털전략'],
    },
    {
        title: '분양가 협상 가능한 시기와 방법',
        excerpt: '분양가 협상이 가능한 시기가 있나요? 있다면 어떻게 접근하는 것이 좋을까요?...',
        tags: ['#분양가협상', '#할인', '#프로모션'],
    },
];

// 답변 템플릿
const answerTemplates = [
    {
        content:
            '안녕하세요! 10년차 분양 전문가입니다. 말씀하신 부분에 대해 상세히 답변드리겠습니다...',
        helpful: true,
    },
    {
        content: '저도 비슷한 경험이 있어서 도움이 될 것 같아 답변 남깁니다. 실제로 현장에서는...',
        helpful: true,
    },
    {
        content: '관련 법령과 실무 경험을 바탕으로 설명드리면, 첫째로 확인하셔야 할 부분은...',
        helpful: true,
    },
    {
        content: '좋은 질문입니다. 이 부분은 많은 분들이 헷갈려하시는데, 정확히 설명드리면...',
        helpful: false,
    },
    {
        content: '제가 알기로는 최근 정책이 변경되어서 이제는 다음과 같이 적용됩니다...',
        helpful: false,
    },
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
            timeStr = date.getMonth() + 1 + '/' + date.getDate();
        }

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const hasReward = status === 'unadopted' && Math.random() > 0.7;

        // excerpt를 기반으로 더 상세한 content 생성
        const fullContent = `${template.excerpt}

구체적인 상황은 다음과 같습니다:
- 현재 ${template.title.includes('청약') ? '청약 준비 중' : '분양 업무를 진행 중'}입니다.
- 관련 자료를 찾아봤지만 명확한 답변을 얻기 어려웠습니다.
- 실무 경험이 있으신 분들의 조언을 듣고 싶습니다.

추가로 궁금한 사항:
1. 비슷한 경험이 있으신 분들은 어떻게 해결하셨나요?
2. 관련 법규나 규정이 최근에 변경된 것이 있나요?
3. 실무에서 주의해야 할 점이 있다면 알려주세요.

답변 주시면 정말 감사하겠습니다!`;

        questions.push({
            id: i + 1,
            status: status,
            title: template.title,
            excerpt: template.excerpt,
            content: fullContent,  // content 필드 추가
            tags: template.tags,
            author: nicknames[authorIdx],
            authorName: users[authorIdx],
            time: timeStr,
            views: Math.floor(Math.random() * 1000) + 10,
            answers:
                status === 'adopted'
                    ? Math.floor(Math.random() * 15) + 1
                    : Math.floor(Math.random() * 8),
            reward: hasReward ? Math.floor(Math.random() * 10) * 1000 + 5000 : 0,
            popular: isPopular,
            isNew: isNew,
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
function generateAnswers(questionId, count, questionStatus) {
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
            // 질문이 채택 상태일 때만 첫 번째 답변을 채택 상태로 설정
            isAdopted: i === 0 && template.helpful && questionStatus === 'adopted',
            helpful: template.helpful,
        });
    }

    return answers;
}

// 전체 질문 데이터 생성
const questionsData = generateQuestions(100);

// 답변 데이터 저장
const answersData = {};
questionsData.forEach((question) => {
    if (question.answers > 0) {
        // 질문 상태를 generateAnswers 함수에 전달
        answersData[question.id] = generateAnswers(question.id, question.answers, question.status);
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
        filtered = filtered.filter((q) => q.status === 'adopted');
    } else if (currentFilter === 'unadopted') {
        filtered = filtered.filter((q) => q.status === 'unadopted');
    } else if (currentFilter === 'reward') {
        filtered = filtered.filter((q) => q.reward > 0);
    } else if (currentFilter === 'popular') {
        filtered = filtered.filter((q) => q.popular === true);
    } else if (currentFilter === 'myquestions') {
        // 내 질문 필터 (실제 앱에서는 사용자 세션 필요)
        filtered = filtered.filter((q) => q.id % 5 === 0);
    }

    // 카테고리 필터 (태그 기반)
    if (currentCategory !== 'all') {
        const categoryKeywords = {
            buying: ['#청약', '#분양', '#구매'],
            selling: ['#매도', '#전매', '#양도'],
            tax: ['#세금', '#양도소득세', '#취득세'],
            loan: ['#대출', '#담보', '#금융'],
            investment: ['#투자', '#수익', '#재개발'],
        };

        if (categoryKeywords[currentCategory]) {
            filtered = filtered.filter((q) =>
                q.tags.some((tag) =>
                    categoryKeywords[currentCategory].some((keyword) => tag.includes(keyword))
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
    const adoptedCount = questionsData.filter((q) => q.status === 'adopted').length;
    const unadoptedCount = questionsData.filter((q) => q.status === 'unadopted').length;
    const popularCount = questionsData.filter((q) => q.popular === true).length;
    const myCount = questionsData.filter((q) => q.id % 5 === 0).length; // 내 질문 (모의)

    // 탭 카운트 업데이트 (checkbox-tab 스타일)
    const tabs = document.querySelectorAll('.checkbox-tab');
    tabs.forEach((tab) => {
        const category = tab.dataset.category;
        const countSpan = tab.querySelector('.tab-count');
        if (countSpan) {
            switch (category) {
                case 'all':
                    countSpan.textContent = allCount;
                    break;
                case 'adopted':
                    countSpan.textContent = adoptedCount;
                    break;
                case 'unadopted':
                    countSpan.textContent = unadoptedCount;
                    // 미채택 탭의 말풍선 표시/숨김 처리
                    const waitingBubble = tab.querySelector('.waiting-bubble');
                    if (waitingBubble) {
                        console.log('미채택 카운트:', unadoptedCount); // 디버깅용
                        if (unadoptedCount > 0) {
                            waitingBubble.classList.add('show');
                            waitingBubble.style.display = 'block'; // 직접 스타일 적용
                        } else {
                            waitingBubble.classList.remove('show');
                            waitingBubble.style.display = 'none';
                        }
                    }
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

    // 미채택 질문 알림 업데이트
    updateUnadoptedBubble();

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageQuestions = filteredQuestions.slice(startIndex, endIndex);

    if (pageQuestions.length === 0) {
        container.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        return;
    }

    const html = pageQuestions
        .map(
            (question) => `
        <div class="question-card ${question.status}" data-id="${question.id}" onclick="showQuestionDetail(${question.id}); return false;">
            <div class="question-header">
                <div class="question-status">
                    <span class="status-badge ${question.status}">
                        ${question.status === 'adopted' ? '채택완료' : '미채택'}
                    </span>
                    ${
                        question.status === 'unadopted' && question.reward > 0
                            ? `<span class="reward-points">+${question.reward.toLocaleString()}P</span>`
                            : ''
                    }
                    ${question.isNew ? '<span class="new-badge">NEW</span>' : ''}
                </div>
            </div>
            <div class="question-content">
                <h3 class="question-title">${question.title}</h3>
                <p class="question-excerpt">${question.excerpt}</p>
            </div>
            <div class="question-bottom">
                <div class="question-meta">
                    <span class="author"><i class="fas fa-user"></i> ${question.author}</span>
                    <span class="answers"><i class="fas fa-comment"></i> ${question.answers}</span>
                    <span class="views"><i class="fas fa-eye"></i> ${question.views}</span>
                    <span class="time"><i class="fas fa-clock"></i> ${question.time}</span>
                </div>
            </div>
        </div>
    `
        )
        .join('');

    container.innerHTML = html;
}

// 미채택 질문 알림 업데이트
function updateUnadoptedBubble() {
    const unadoptedCount = questionsData.filter((q) => q.status === 'unadopted').length;
    const bubble = document.getElementById('unadoptedBubble');

    if (bubble) {
        if (unadoptedCount > 0) {
            bubble.classList.add('show');
        } else {
            bubble.classList.remove('show');
        }
    }
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
    const pagination = document.getElementById('paginationContainer');
    if (!pagination) {
        console.error('Pagination container not found');
        return;
    }

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

// 현재 보고 있는 질문 ID 저장
let currentQuestionId = null;

// [첫 번째 showQuestionDetail 함수 제거 - 1549번 줄의 함수 사용]
/* 중복 함수 제거
function showQuestionDetail(questionId) {
    const question = questionsData.find((q) => q.id === questionId);
    if (!question) {
        console.error('Question not found with ID:', questionId);
        return;
    }

    currentQuestionId = questionId;
    const answers = answersData[questionId] || [];

    // 기존 HTML의 모달 사용
    const modal = document.getElementById('qnaDetailModal');

    if (!modal) {
        // 모달이 없으면 동적 생성 (fallback)
        const newModal = document.createElement('div');
        newModal.className = 'question-detail-modal';
        newModal.innerHTML = `
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
                    
                    <div class="answers-section">
                        <h3>답변 ${answers.length}개</h3>
                        ${
                            answers.length > 0
                                ? `
                            <div class="answers-list">
                                ${answers
                                    .map(
                                        (answer) => `
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
                                `
                                    )
                                    .join('')}
                            </div>
                        `
                                : '<p class="no-answers">아직 답변이 없습니다.</p>'
                        }
                        
                        <div class="answer-write">
                            <h4>답변 작성</h4>
                            <textarea placeholder="답변을 작성해주세요..." rows="5"></textarea>
                            <button class="submit-answer-btn">답변 등록</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(newModal);
        setTimeout(() => newModal.classList.add('active'), 10);
        return;
    }

    // HTML 모달의 내용 업데이트
    const modalStatus = document.getElementById('modalStatus');
    const modalReward = document.getElementById('modalReward');
    const modalQuestionTitle = document.getElementById('modalQuestionTitle');
    const modalAuthor = document.getElementById('modalAuthor');
    const modalTime = document.getElementById('modalTime');
    const modalViews = document.getElementById('modalViews');
    const modalQuestionContent = document.getElementById('modalQuestionContent');
    const answerWriteSection = document.getElementById('answerWriteSection');
    const answerList = document.getElementById('answerList');
    const answerCount = document.getElementById('answerCount');

    if (modalStatus) {
        modalStatus.innerHTML =
            question.status === 'adopted'
                ? '<i class="fas fa-check-circle"></i> 채택완료'
                : '<i class="fas fa-question-circle"></i> 미채택';
        modalStatus.className = `status-badge ${question.status}`;
    }
    if (modalReward) {
        if (question.reward > 0 && question.status === 'unadopted') {
            modalReward.style.display = 'inline-flex';
            modalReward.innerHTML = `<i class="fas fa-coins"></i> ${question.reward.toLocaleString()}P 보상`;
        } else {
            modalReward.style.display = 'none';
        }
    }
    if (modalQuestionTitle) modalQuestionTitle.textContent = question.title;
    if (modalAuthor) modalAuthor.textContent = question.author;
    if (modalTime) modalTime.textContent = question.time;
    if (modalViews) modalViews.textContent = question.views;
    if (modalQuestionContent) {
        modalQuestionContent.innerHTML = `
            <p>${question.excerpt}</p>
            <p>이 질문에 대한 자세한 내용과 배경 설명이 여기에 표시됩니다...</p>
        `;
    }

    // 태그 업데이트

    // 답변 작성 섹션 표시/숨김
    if (answerWriteSection) {
        answerWriteSection.style.display = question.status === 'unadopted' ? 'block' : 'none';
    }

    // 답변 목록 업데이트
    if (answerList) {
        if (answers.length > 0) {
            answerList.innerHTML = answers
                .map(
                    (answer) => `
                <div class="answer-item ${answer.isAdopted ? 'adopted' : ''}">
                    <div class="answer-header">
                        <div class="answerer-info">
                            <span class="answerer-name"><i class="fas fa-user-circle"></i> ${answer.author}</span>
                            <span class="answer-time">${answer.time}</span>
                        </div>
                        ${
                            answer.isAdopted
                                ? `<div class="answer-status">
                                <span class="adopted-badge">
                                    <i class="fas fa-check-circle"></i> 채택됨
                                </span>
                            </div>`
                                : question.status === 'unadopted' &&
                                    question.author === '현재사용자'
                                  ? `<div class="answer-actions-top">
                                <button class="btn-adopt" onclick="adoptAnswer('${answer.id}')">
                                    <i class="fas fa-check"></i> 채택하기
                                </button>
                            </div>`
                                  : ''
                        }
                    </div>
                    <div class="answer-content">
                        <p>${answer.content}</p>
                        ${
                            answer.attachments && answer.attachments.length > 0
                                ? `<div class="answer-attachments">
                                    ${answer.attachments.map(attachment => {
                                        const isQuestionAuthor = question.author === '현재사용자' || question.author === '박승학';
                                        const iconClass = getFileIconClass(attachment.name);
                                        
                                        if (isQuestionAuthor) {
                                            return `
                                                <div class="answer-attachment-item" onclick="downloadFile('${attachment.id}', '${attachment.name}')">
                                                    <i class="${iconClass}"></i>
                                                    <span>${attachment.name}</span>
                                                    <span class="file-size">(${attachment.size})</span>
                                                </div>
                                            `;
                                        } else {
                                            return `
                                                <div class="answer-attachment-item locked" title="질문자만 다운로드할 수 있습니다">
                                                    <i class="fas fa-lock"></i>
                                                    <span>파일이 첨부되어 있습니다</span>
                                                </div>
                                            `;
                                        }
                                    }).join('')}
                                </div>`
                                : ''
                        }
                    </div>
                    <div class="answer-actions">
                        <button class="btn-helpful ${answer.helpful ? 'active' : ''}" onclick="toggleHelpful('${answer.id}')">
                            <i class="fas fa-thumbs-up"></i> 도움됨 <span>${answer.likes}</span>
                        </button>
                        <button class="btn-report">
                            <i class="fas fa-flag"></i> 신고
                        </button>
                    </div>
                </div>
            `
                )
                .join('');
        } else {
            answerList.innerHTML =
                '<div class="no-answers">아직 답변이 없습니다. 첫 번째 답변을 작성해보세요!</div>';
        }
    }

    // 답변 개수 업데이트
    if (answerCount) {
        answerCount.textContent = answers.length;
    }

    // 보상 금액 업데이트
    const rewardAmount = modal.querySelector('.reward-amount');
    if (rewardAmount && question.reward > 0) {
        rewardAmount.textContent = Math.floor(question.reward * 0.9).toLocaleString() + 'P';
    }

    // 모달 표시
    modal.style.display = 'block';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    setTimeout(() => {
        modal.classList.add('active');
        // 파일 첨부 초기화 및 리셋
        attachedFiles = [];
        updateAttachedFilesList();
        initializeFileAttachment();
    }, 10);
}
*/ // 중복 함수 제거 끝

// 질문 상세 모달 닫기
function closeQuestionDetail() {
    // HTML 모달 우선 확인
    let modal = document.getElementById('qnaDetailModal');
    if (!modal) {
        // 동적 생성된 모달 확인
        modal = document.querySelector('.question-detail-modal');
    }

    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }

    currentQuestionId = null;
}

// 파일 첨부 관련 변수
let attachedFiles = [];
const MAX_FILES = 2;
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'jpg', 'jpeg', 'png'];

// 파일 첨부 초기화
function initializeFileAttachment() {
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('answerFileInput');
    
    if (!dropZone || !fileInput) return;
    
    // 클릭 이벤트
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 파일 선택 이벤트
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
    });
    
    // 드래그 앤 드롭 이벤트
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragging');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');
        handleFileSelect(e.dataTransfer.files);
    });
}

// 파일 선택 처리
function handleFileSelect(files) {
    const fileArray = Array.from(files);
    
    // 파일 개수 체크
    if (attachedFiles.length + fileArray.length > MAX_FILES) {
        alert(`최대 ${MAX_FILES}개까지만 첨부할 수 있습니다.`);
        return;
    }
    
    for (const file of fileArray) {
        // 파일 확장자 체크
        const extension = file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            alert(`${file.name}: 허용되지 않는 파일 형식입니다.`);
            continue;
        }
        
        // 파일 크기 체크
        if (file.size > MAX_FILE_SIZE) {
            alert(`${file.name}: 파일 크기가 30MB를 초과합니다.`);
            continue;
        }
        
        // 파일 추가
        attachedFiles.push({
            file: file,
            name: file.name,
            size: formatFileSize(file.size),
            id: Date.now() + Math.random()
        });
    }
    
    updateAttachedFilesList();
    document.getElementById('answerFileInput').value = '';
}

// 파일 크기 포맷
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 첨부 파일 목록 업데이트
function updateAttachedFilesList() {
    const listContainer = document.getElementById('attachedFilesList');
    if (!listContainer) return;
    
    if (attachedFiles.length === 0) {
        listContainer.style.display = 'none';
        return;
    }
    
    listContainer.style.display = 'flex';
    listContainer.innerHTML = attachedFiles.map(file => {
        const iconClass = getFileIconClass(file.name);
        return `
            <div class="attached-file-item" data-file-id="${file.id}">
                <i class="${iconClass}"></i>
                <span class="file-name" title="${file.name}">${file.name}</span>
                <span class="file-size">(${file.size})</span>
                <button class="remove-file" onclick="removeAttachedFile('${file.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
}

// 파일 아이콘 클래스 반환
function getFileIconClass(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'zip': 'fas fa-file-archive',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image'
    };
    return iconMap[extension] || 'fas fa-file';
}

// 첨부 파일 제거
function removeAttachedFile(fileId) {
    attachedFiles = attachedFiles.filter(f => f.id != fileId);
    updateAttachedFilesList();
}

// 파일 다운로드 (시뮬레이션)
function downloadFile(fileId, fileName) {
    // 실제 구현에서는 서버에서 파일을 다운로드하는 로직이 필요합니다
    // 여기서는 시뮬레이션으로 알림만 표시합니다
    alert(`파일 다운로드: ${fileName}`);
    
    // 실제 구현 예시:
    // const downloadLink = document.createElement('a');
    // downloadLink.href = `/api/download/${fileId}`;
    // downloadLink.download = fileName;
    // downloadLink.click();
}

// 답변 제출
function submitAnswer() {
    if (!currentQuestionId) return;

    const answerContent = document.getElementById('answerContent');
    if (!answerContent || !answerContent.value.trim()) {
        alert('답변 내용을 입력해주세요.');
        return;
    }

    const question = questionsData.find((q) => q.id === currentQuestionId);
    if (!question) return;

    // 새 답변 생성
    const newAnswer = {
        id: `${currentQuestionId}-${Date.now()}`,
        author: '현재사용자',
        authorName: '박승학',
        content: answerContent.value.trim(),
        time: '방금 전',
        likes: 0,
        isAdopted: false,
        helpful: false,
        attachments: attachedFiles.map(f => ({
            name: f.name,
            size: f.size,
            id: f.id
        }))
    };

    // 답변 데이터에 추가
    if (!answersData[currentQuestionId]) {
        answersData[currentQuestionId] = [];
    }
    answersData[currentQuestionId].unshift(newAnswer);

    // 질문의 답변 수 증가
    question.answers = (question.answers || 0) + 1;

    // 알림
    alert('답변이 등록되었습니다!');

    // 입력 필드 초기화
    answerContent.value = '';
    attachedFiles = [];
    updateAttachedFilesList();

    // 모달 새로고침 - 현재 질문 객체로 업데이트
    const currentQuestion = questionsData.find(q => q.id === currentQuestionId);
    if (currentQuestion) {
        updateQuestionDetailModal(currentQuestion);
    }
}

// 답변 채택
function adoptAnswer(answerId) {
    if (!currentQuestionId) return;

    const question = questionsData.find((q) => q.id === currentQuestionId);
    if (!question || question.status === 'adopted') return;

    const answers = answersData[currentQuestionId];
    if (!answers) return;

    const answer = answers.find((a) => a.id === answerId);
    if (!answer) return;

    // 확인 대화상자
    const reward = question.reward || 0;
    const rewardAmount = Math.floor(reward * 0.9);

    if (
        !confirm(
            `이 답변을 채택하시겠습니까?\n답변자에게 ${rewardAmount.toLocaleString()}P가 지급됩니다.`
        )
    ) {
        return;
    }

    // 답변 채택 처리
    answer.isAdopted = true;
    question.status = 'adopted';

    // 알림
    alert('답변이 채택되었습니다!');

    // 목록 새로고침
    filterQuestions();

    // 모달 새로고침 - 현재 질문 객체로 업데이트
    const currentQuestion = questionsData.find(q => q.id === currentQuestionId);
    if (currentQuestion) {
        updateQuestionDetailModal(currentQuestion);
    }
}

// 도움됨 토글
function toggleHelpful(answerId) {
    if (!currentQuestionId) return;

    const answers = answersData[currentQuestionId];
    if (!answers) return;

    const answer = answers.find((a) => a.id === answerId);
    if (!answer) return;

    // 토글
    answer.helpful = !answer.helpful;
    answer.likes = answer.helpful ? answer.likes + 1 : Math.max(0, answer.likes - 1);

    // 모달 새로고침 - 현재 질문 객체로 업데이트
    const currentQuestion = questionsData.find(q => q.id === currentQuestionId);
    if (currentQuestion) {
        updateQuestionDetailModal(currentQuestion);
    }
}

// 질문하기 모달 표시
function showAskModal() {
    const modal = document.getElementById('askModal');
    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);

        // 포인트 초기화
        setPointValue(0);
    }
}

// 질문하기 모달 닫기
function closeAskModal() {
    const modal = document.getElementById('askModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }
}

// 질문 제출 함수
function submitQuestion() {
    // 폼 데이터 수집
    const titleInput = document.getElementById('questionTitle');
    const contentInput = document.getElementById('questionContent');
    const categoryRadios = document.getElementsByName('questionCategory');
    const tagInput = document.getElementById('questionTags');
    const pointsInput = document.getElementById('rewardPoints');

    // 선택된 카테고리 찾기
    let selectedCategory = null;
    for (const radio of categoryRadios) {
        if (radio.checked) {
            selectedCategory = radio.value;
            break;
        }
    }

    // 유효성 검사
    if (!selectedCategory) {
        alert('카테고리를 선택해주세요.');
        return;
    }

    if (!titleInput || !titleInput.value.trim()) {
        alert('질문 제목을 입력해주세요.');
        return;
    }

    if (!contentInput || !contentInput.value.trim()) {
        alert('질문 내용을 입력해주세요.');
        return;
    }

    // 포인트 값 확인 (기본값 0)
    const points = pointsInput ? parseInt(pointsInput.value) || 0 : 0;

    // 태그 처리
    let tags = [];
    if (tagInput && tagInput.value.trim()) {
        // 입력된 태그들을 배열로 변환 (공백으로 구분)
        tags = tagInput.value
            .trim()
            .split(' ')
            .filter((tag) => tag.startsWith('#'));
    }
    // 카테고리도 태그로 추가
    if (selectedCategory) {
        tags.unshift(`#${selectedCategory}`);
    }
    // 태그가 없으면 기본 태그
    if (tags.length === 0) {
        tags = ['#일반'];
    }

    // 새 질문 데이터 생성
    const newQuestion = {
        id: questionsData.length + 1,
        status: 'unadopted',
        title: titleInput.value.trim(),
        excerpt: contentInput.value.trim().substring(0, 100) + '...',
        tags: tags.slice(0, 5), // 최대 5개 태그만
        author: '현재사용자',
        authorName: '박승학',
        time: '방금 전',
        views: 0,
        answers: 0,
        reward: points,
        popular: false,
        isNew: true,
    };

    // 질문 데이터에 추가
    questionsData.unshift(newQuestion);

    // 목록 새로고침
    filterQuestions();

    // 성공 메시지
    alert(
        `질문이 성공적으로 등록되었습니다!${points > 0 ? `\n${points.toLocaleString()}P가 설정되었습니다.` : ''}`
    );

    // 폼 초기화
    if (titleInput) titleInput.value = '';
    if (contentInput) contentInput.value = '';

    // 태그 초기화 (이미 위에서 선언한 tagInput 재사용)
    if (tagInput) tagInput.value = '';

    // 태그 제안 활성화 상태 초기화
    const tagSuggestions = document.querySelectorAll('.tag-suggestion');
    tagSuggestions.forEach((tag) => tag.classList.remove('active'));

    // 카테고리 라디오 버튼 초기화
    for (const radio of categoryRadios) {
        radio.checked = false;
    }

    // 포인트 초기화
    setPointValue(0);

    // 모달 닫기
    closeAskModal();
}

// 포인트 슬라이더 이벤트 핸들러
function updatePointValue(value) {
    const pointsInput = document.getElementById('rewardPoints');
    const pointDisplay = document.getElementById('pointDisplay');
    const sliderFill = document.getElementById('sliderFill');
    const slider = document.getElementById('pointSlider');

    // 값 업데이트
    if (pointsInput) pointsInput.value = value;

    // 표시 업데이트
    if (pointDisplay) {
        const displayValue = parseInt(value).toLocaleString();
        pointDisplay.innerHTML = `<i class="fas fa-coins"></i><span>${displayValue}P</span>`;

        // 포인트 값에 따른 색상 변경
        if (value == 0) {
            pointDisplay.style.background = 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)';
        } else if (value <= 3000) {
            pointDisplay.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
        } else if (value <= 5000) {
            pointDisplay.style.background = 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
        } else {
            pointDisplay.style.background = 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)';
        }
    }

    // 슬라이더 트랙 채우기 업데이트
    if (slider && sliderFill) {
        const percent = (value / slider.max) * 100;
        sliderFill.style.width = percent + '%';

        // 그라디언트 색상 업데이트
        const gradient = `linear-gradient(to right, 
            #6366f1 0%, 
            #8b5cf6 ${percent}%, 
            #e0e7ff ${percent}%, 
            #e0e7ff 100%)`;
        slider.style.background = gradient;
    }

    // 프리셋 버튼 활성화 상태 업데이트
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn) => {
        const btnValue = parseInt(btn.getAttribute('onclick')?.match(/\d+/)?.[0] || 0);
        if (btnValue == value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 포인트 프리셋 설정
function setPointValue(value) {
    // 히든 인풋 업데이트
    const pointsInput = document.getElementById('rewardPoints');
    if (pointsInput) {
        pointsInput.value = value;
    }

    // 현재 선택된 포인트 표시
    const currentDisplay = document.getElementById('currentPointDisplay');
    if (currentDisplay) {
        currentDisplay.textContent = value.toLocaleString() + 'P';

        // 색상 변경
        const parent = currentDisplay.parentElement;
        if (parent) {
            if (value == 0) {
                parent.style.color = '#94a3b8';
            } else if (value <= 3000) {
                parent.style.color = '#10b981';
            } else if (value <= 5000) {
                parent.style.color = '#3b82f6';
            } else {
                parent.style.color = '#8b5cf6';
            }
        }
    }

    // 차감 포인트 업데이트
    const deductPoints = document.getElementById('deductPoints');
    if (deductPoints) {
        deductPoints.textContent = value > 0 ? '-' + value.toLocaleString() + 'P' : '0P';
    }

    // 채택자 획득 포인트 업데이트 (90%)
    const rewardAmount = document.getElementById('rewardAmount');
    if (rewardAmount) {
        const reward = Math.floor(value * 0.9);
        rewardAmount.textContent = reward > 0 ? reward.toLocaleString() + 'P (90%)' : '0P';
    }

    // 프리셋 버튼 활성화 상태 업데이트
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn) => {
        const btnOnclick = btn.getAttribute('onclick');
        if (btnOnclick && btnOnclick.includes(`setPointValue(${value})`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 전역 함수로 등록
window.showQuestionDetail = showQuestionDetail;
window.closeQuestionDetail = closeQuestionDetail;
window.closeDetailModal = closeQuestionDetail; // HTML에서 사용하는 이름 추가
window.goToPage = goToPage;
window.showAskModal = showAskModal;
window.closeAskModal = closeAskModal;
window.submitQuestion = submitQuestion;
window.submitAnswer = submitAnswer;
window.adoptAnswer = adoptAnswer;
window.toggleHelpful = toggleHelpful;
window.updatePointValue = updatePointValue;
window.setPointValue = setPointValue;
window.removeAttachedFile = removeAttachedFile;
window.downloadFile = downloadFile;

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', () => {
    // filteredQuestions 초기화
    if (filteredQuestions.length === 0) {
        filteredQuestions = [...questionsData];
    }

    // 초기 렌더링
    renderQuestions();
    updatePagination();
    updateCounts();

    // 미채택 알림 말풍선 업데이트 - 약간의 지연 후 실행
    setTimeout(() => {
        updateUnadoptedBubble();
    }, 100);

    // 탭 버튼 이벤트 (checkbox-tab 스타일)
    const tabBtns = document.querySelectorAll('.checkbox-tab');
    tabBtns.forEach((btn) => {
        const input = btn.querySelector('input[type="radio"]');
        btn.addEventListener('click', function () {
            const category = this.dataset.category;
            if (!category) return;

            // 모든 탭에서 active 클래스 제거
            tabBtns.forEach((b) => {
                b.classList.remove('active');
                const bInput = b.querySelector('input[type="radio"]');
                if (bInput) bInput.checked = false;
            });
            // 클릭한 탭에 active 클래스 추가
            this.classList.add('active');
            if (input) input.checked = true;

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
    categoryBtns.forEach((btn) => {
        btn.addEventListener('click', function () {
            categoryBtns.forEach((b) => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category || 'all';
            filterQuestions();
        });
    });

    // 정렬 버튼 이벤트
    const sortBtns = document.querySelectorAll('.sort-btn');
    sortBtns.forEach((btn) => {
        btn.addEventListener('click', function () {
            sortBtns.forEach((b) => b.classList.remove('active'));
            this.classList.add('active');
            currentSort = this.dataset.sort || 'latest';
            filterQuestions();
        });
    });

    // 포인트 슬라이더 초기화
    const pointSlider = document.getElementById('pointSlider');
    if (pointSlider) {
        pointSlider.addEventListener('input', function () {
            updatePointValue(this.value);
        });
        // 초기값 설정
        updatePointValue(0);
    }

    // 태그 제안 기능
    const tagInputElement = document.getElementById('questionTags');
    const tagSuggestionElements = document.querySelectorAll('.tag-suggestion');

    if (tagInputElement && tagSuggestionElements.length > 0) {
        // 태그 제안 클릭 이벤트
        tagSuggestionElements.forEach((tag) => {
            tag.addEventListener('click', function () {
                const tagText = this.textContent;
                const currentValue = tagInputElement.value.trim();

                // 이미 있는 태그인지 확인
                if (currentValue.includes(tagText)) {
                    // 이미 있으면 제거
                    const tags = currentValue.split(' ').filter((t) => t !== tagText);
                    tagInputElement.value = tags.join(' ');
                    this.classList.remove('active');
                } else {
                    // 없으면 추가
                    if (currentValue) {
                        tagInputElement.value = currentValue + ' ' + tagText;
                    } else {
                        tagInputElement.value = tagText;
                    }
                    this.classList.add('active');
                }

                // 포커스 유지
                tagInputElement.focus();
            });
        });

        // 태그 입력 시 제안 태그 활성화 상태 업데이트
        tagInputElement.addEventListener('input', function () {
            const currentTags = this.value.trim().split(' ');
            tagSuggestionElements.forEach((tag) => {
                if (currentTags.includes(tag.textContent)) {
                    tag.classList.add('active');
                } else {
                    tag.classList.remove('active');
                }
            });
        });
    }

    // 정렬 탭 기능
    const sortTabs = document.querySelectorAll('.sort-tab');
    sortTabs.forEach((tab) => {
        tab.addEventListener('click', function () {
            // 활성 탭 변경
            sortTabs.forEach((t) => t.classList.remove('active'));
            this.classList.add('active');

            // 정렬 방식 변경
            currentSort = this.dataset.sort || 'latest';
            filterQuestions();
        });
    });

    // 검색 기능
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm) {
                filteredQuestions = questionsData.filter(
                    (q) =>
                        q.title.toLowerCase().includes(searchTerm) ||
                        q.excerpt.toLowerCase().includes(searchTerm) ||
                        q.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
                );
            } else {
                filteredQuestions = [...questionsData];
            }
            currentPage = 1;
            renderQuestions();
            updatePagination();
        };

        // 실시간 검색
        searchInput.addEventListener('input', performSearch);

        // 엔터키로도 검색
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // 키보드 네비게이션 지원
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('qnaDetailModal');
        if (modal && modal.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                navigateQuestion('prev');
            } else if (e.key === 'ArrowRight') {
                navigateQuestion('next');
            } else if (e.key === 'Escape') {
                closeDetailModal();
            }
        }
    });
});

// 현재 상세보기 중인 질문 정보
let currentQuestionIndex = -1;
let currentFilteredQuestions = [];

// 질문 네비게이션 함수
function navigateQuestion(direction) {
    if (!currentFilteredQuestions || currentFilteredQuestions.length === 0) return;
    
    if (direction === 'prev' && currentQuestionIndex > 0) {
        currentQuestionIndex--;
    } else if (direction === 'next' && currentQuestionIndex < currentFilteredQuestions.length - 1) {
        currentQuestionIndex++;
    } else {
        return; // 이동할 수 없는 경우
    }
    
    const question = currentFilteredQuestions[currentQuestionIndex];
    if (question) {
        updateQuestionDetailModal(question);
        updateQuestionNavigationButtons();
    }
}

// 네비게이션 버튼 상태 업데이트
function updateQuestionNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');
    
    if (prevBtn && nextBtn) {
        prevBtn.disabled = (currentQuestionIndex <= 0);
        nextBtn.disabled = (currentQuestionIndex >= currentFilteredQuestions.length - 1);
    }
}

// 질문 상세보기 모달 열기 (ID 또는 객체 모두 처리 가능)
function showQuestionDetail(questionOrId, index = -1) {
    const modal = document.getElementById('qnaDetailModal');
    if (!modal) return;
    
    let question;
    
    // ID로 호출된 경우 (기존 방식)
    if (typeof questionOrId === 'number') {
        question = questionsData.find(q => q.id === questionOrId);
        if (!question) return;
        
        // 현재 필터된 목록에서 index 찾기
        currentFilteredQuestions = getCurrentFilteredQuestions();
        index = currentFilteredQuestions.findIndex(q => q.id === questionOrId);
        if (index === -1) {
            // 필터된 목록에 없으면 전체 목록 사용
            currentFilteredQuestions = [...questionsData];
            index = currentFilteredQuestions.findIndex(q => q.id === questionOrId);
        }
    } 
    // 객체로 호출된 경우 (새로운 방식)
    else {
        question = questionOrId;
        if (index === -1) {
            currentFilteredQuestions = [question];
            index = 0;
        } else {
            currentFilteredQuestions = getCurrentFilteredQuestions();
        }
    }
    
    // 현재 질문 정보 저장
    currentQuestionIndex = index;
    currentQuestionId = question.id;  // submitAnswer를 위한 백업 설정
    
    // 모달 내용 업데이트
    updateQuestionDetailModal(question);
    
    // 네비게이션 버튼 상태 업데이트
    updateQuestionNavigationButtons();
    
    // 모달 표시
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 파일 첨부 초기화 및 리셋
    setTimeout(() => {
        attachedFiles = [];
        updateAttachedFilesList();
        initializeFileAttachment();
    }, 10);
}

// 질문 상세보기 모달 내용 업데이트
function updateQuestionDetailModal(question) {
    // 현재 질문 ID 저장 (submitAnswer에서 사용)
    currentQuestionId = question.id;
    
    // 기본 정보 업데이트
    const title = document.getElementById('modalQuestionTitle');
    const author = document.getElementById('modalAuthor');
    const time = document.getElementById('modalTime');
    const views = document.getElementById('modalViews');
    const content = document.getElementById('modalQuestionContent');
    const status = document.getElementById('modalStatus');
    const reward = document.getElementById('modalReward');
    
    if (title) title.textContent = question.title || '질문 제목';
    if (author) author.textContent = question.author || '작성자';
    if (time) time.textContent = question.time || '방금 전';
    if (views) views.textContent = question.views || '0';
    // content가 없으면 excerpt를 사용
    if (content) {
        if (question.content) {
            // content를 HTML로 렌더링 (줄바꿈을 <br>로 변환)
            content.innerHTML = `<p>${question.content.replace(/\n/g, '<br>')}</p>`;
        } else if (question.excerpt) {
            // content가 없으면 excerpt 사용
            content.innerHTML = `<p>${question.excerpt}</p>`;
        } else {
            content.innerHTML = '<p>내용이 없습니다.</p>';
        }
    }
    
    // 채택 상태 업데이트
    if (status && reward) {
        if (question.status === 'adopted') {
            status.innerHTML = '<i class="fas fa-check-circle"></i> 채택완료';
            status.className = 'status-badge adopted';
            reward.style.display = 'none';
        } else {
            status.innerHTML = '<i class="fas fa-question-circle"></i> 미채택';
            status.className = 'status-badge unadopted';
            reward.innerHTML = `<i class="fas fa-coins"></i> ${question.reward || '5,000'}P 보상`;
            reward.style.display = 'inline-flex';
        }
    }
    
    // 답변 목록 업데이트
    const answers = answersData[currentQuestionId] || [];
    const answerList = document.getElementById('answerList');
    const answerWriteSection = document.getElementById('answerWriteSection');
    const answerCount = document.getElementById('answerCount');
    
    // 답변 작성 섹션 표시/숨김
    if (answerWriteSection) {
        answerWriteSection.style.display = question.status === 'unadopted' ? 'block' : 'none';
    }
    
    // 답변 목록 업데이트
    if (answerList) {
        if (answers.length > 0) {
            answerList.innerHTML = answers
                .map(
                    (answer) => `
                <div class="answer-item ${answer.isAdopted ? 'adopted' : ''}">
                    <div class="answer-header">
                        <div class="answerer-info">
                            <span class="answerer-name"><i class="fas fa-user-circle"></i> ${answer.author}</span>
                            <span class="answer-time">${answer.time}</span>
                        </div>
                        ${
                            answer.isAdopted
                                ? `<div class="answer-status">
                                <span class="adopted-badge">
                                    <i class="fas fa-check-circle"></i> 채택됨
                                </span>
                            </div>`
                                : question.status === 'unadopted' &&
                                    question.author === '현재사용자'
                                  ? `<div class="answer-actions-top">
                                <button class="btn-adopt" onclick="adoptAnswer('${answer.id}')">
                                    <i class="fas fa-check"></i> 채택하기
                                </button>
                            </div>`
                                  : ''
                        }
                    </div>
                    <div class="answer-content">
                        <p>${answer.content}</p>
                        ${
                            answer.attachments && answer.attachments.length > 0
                                ? `<div class="answer-attachments">
                                    ${answer.attachments.map(attachment => {
                                        const isQuestionAuthor = question.author === '현재사용자' || question.author === '박승학';
                                        const iconClass = getFileIconClass(attachment.name);
                                        
                                        if (isQuestionAuthor) {
                                            return `
                                                <div class="answer-attachment-item" onclick="downloadFile('${attachment.id}', '${attachment.name}')">
                                                    <i class="${iconClass}"></i>
                                                    <span>${attachment.name}</span>
                                                    <span class="file-size">(${attachment.size})</span>
                                                </div>
                                            `;
                                        } else {
                                            return `
                                                <div class="answer-attachment-item locked" title="질문자만 다운로드할 수 있습니다">
                                                    <i class="fas fa-lock"></i>
                                                    <span>파일이 첨부되어 있습니다</span>
                                                </div>
                                            `;
                                        }
                                    }).join('')}
                                </div>`
                                : ''
                        }
                    </div>
                    <div class="answer-actions">
                        <button class="btn-helpful ${answer.helpful ? 'active' : ''}" onclick="toggleHelpful('${answer.id}')">
                            <i class="fas fa-thumbs-up"></i> 도움됨 <span>${answer.likes}</span>
                        </button>
                        <button class="btn-report">
                            <i class="fas fa-flag"></i> 신고
                        </button>
                    </div>
                </div>
            `
                )
                .join('');
        } else {
            answerList.innerHTML =
                '<div class="no-answers">아직 답변이 없습니다. 첫 번째 답변을 작성해보세요!</div>';
        }
    }
    
    // 답변 개수 업데이트
    if (answerCount) {
        answerCount.textContent = answers.length;
    }
}

// 질문 상세보기 모달 닫기 (기존 함수 확장)
function closeDetailModal() {
    const modal = document.getElementById('qnaDetailModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        currentQuestionIndex = -1;
        currentFilteredQuestions = [];
    }
}

// 현재 필터된 질문 목록 가져오기
function getCurrentFilteredQuestions() {
    // 현재 페이지에 표시중인 전체 필터된 질문 목록 반환
    // 페이지네이션과 관계없이 전체 필터된 목록 반환
    if (filteredQuestions && filteredQuestions.length > 0) {
        return [...filteredQuestions];
    }
    return [...questionsData];
}
