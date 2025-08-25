// 질문답변 페이지 JavaScript

// 디버그 로그
console.log('qna.js 파일 로드 시작');

// 전체 질문 데이터 (40개)
const questionsData = [
    // 1-20 (1페이지)
    {
        id: 1,
        status: 'unadopted',
        title: '청약통장 가점 계산 관련 문의드립니다',
        excerpt: '안녕하세요. 청약통장 가점 계산 관련해서 궁금한 점이 있어 질문드립니다. 무주택기간과 부양가족수 계산 시...',
        tags: ['#청약통장', '#가점계산', '#무주택기간'],
        author: '김영업',
        time: '30분 전',
        views: 23,
        answers: 2,
        reward: 5000,
        popular: false,
        isNew: true
    },
    {
        id: 2,
        status: 'adopted',
        title: '분양가상한제 지역에서의 전매제한 기간은 어떻게 되나요?',
        excerpt: '분양가상한제가 적용되는 지역에서 아파트를 분양받을 경우 전매제한 기간이 일반 지역과 다른지 궁금합니다...',
        tags: ['#분양가상한제', '#전매제한', '#규제'],
        author: '박기획',
        time: '2시간 전',
        views: 156,
        answers: 5,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 3,
        status: 'adopted',
        title: '모델하우스 운영 시 효과적인 고객 응대 방법',
        excerpt: '모델하우스에서 고객 응대 시 자주 받는 질문들과 효과적인 답변 방법에 대해 선배님들의 노하우를 듣고 싶습니다...',
        tags: ['#모델하우스', '#고객응대', '#영업노하우'],
        author: '이팀장',
        time: '어제',
        views: 892,
        answers: 12,
        reward: 0,
        popular: true,
        isNew: false
    },
    {
        id: 4,
        status: 'unadopted',
        title: '특별공급 자격 조건 중 신혼부부 소득기준 계산법',
        excerpt: '신혼부부 특별공급 신청을 준비 중인데, 맞벌이 부부의 경우 소득기준을 어떻게 계산해야 하는지...',
        tags: ['#특별공급', '#신혼부부', '#소득기준'],
        author: '최대리',
        time: '3시간 전',
        views: 67,
        answers: 1,
        reward: 4500,
        popular: false,
        isNew: false
    },
    {
        id: 5,
        status: 'adopted',
        title: '분양 계약 시 중도금 대출 관련 서류 준비',
        excerpt: '분양 계약 후 중도금 대출을 받으려고 하는데 필요한 서류와 절차가 어떻게 되는지 알고 싶습니다...',
        tags: ['#중도금대출', '#계약', '#서류준비'],
        author: '정과장',
        time: '5시간 전',
        views: 234,
        answers: 7,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 6,
        status: 'unadopted',
        title: '재개발/재건축 지역 조합원 분양 관련 문의',
        excerpt: '재개발 구역 조합원인데, 일반분양과 조합원 분양의 차이점과 주의사항에 대해 알고 싶습니다...',
        tags: ['#재개발', '#조합원분양', '#주의사항'],
        author: '한조합원',
        time: '8시간 전',
        views: 145,
        answers: 3,
        reward: 3000,
        popular: false,
        isNew: false
    },
    {
        id: 7,
        status: 'adopted',
        title: '분양권 전매 시 양도소득세 계산법',
        excerpt: '분양권을 전매할 때 양도소득세가 어떻게 계산되는지 알고 싶습니다. 특히 취득세와의 관계도...',
        tags: ['#분양권전매', '#양도소득세', '#세금'],
        author: '송세무사',
        time: '12시간 전',
        views: 298,
        answers: 6,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 8,
        status: 'unadopted',
        title: '분양 현장 고객 관리 시스템 추천 부탁드립니다',
        excerpt: '현장에서 고객 정보를 체계적으로 관리할 수 있는 시스템이나 앱을 찾고 있습니다. 어떤 것들이 있을까요?',
        tags: ['#고객관리', '#시스템', '#분양현장'],
        author: '유팀장',
        time: '15시간 전',
        views: 89,
        answers: 0,
        reward: 2000,
        popular: false,
        isNew: false
    },
    {
        id: 9,
        status: 'adopted',
        title: '아파트 하자 보수 절차 및 기간 관련 질문',
        excerpt: '입주 후 하자가 발견되었을 때 보수 절차와 기간이 어떻게 되는지 알고 싶습니다...',
        tags: ['#하자보수', '#입주', '#절차'],
        author: '윤입주자',
        time: '18시간 전',
        views: 456,
        answers: 8,
        reward: 0,
        popular: true,
        isNew: false
    },
    {
        id: 10,
        status: 'unadopted',
        title: '부동산 PF대출 관련 업무 흐름 문의',
        excerpt: '부동산 PF대출 업무를 담당하게 되었는데, 전체적인 업무 흐름과 주의사항에 대해 알고 싶습니다...',
        tags: ['#PF대출', '#업무흐름', '#금융'],
        author: '신입김',
        time: '1일 전',
        views: 123,
        answers: 1,
        reward: 7000,
        popular: false,
        isNew: true
    },
    {
        id: 11,
        status: 'adopted',
        title: '분양 마케팅 자료 제작 시 법적 제한사항',
        excerpt: '분양 광고 및 마케팅 자료 제작 시 지켜야 할 법적 제한사항들이 있나요? 특히 과장광고 관련해서...',
        tags: ['#분양마케팅', '#광고규제', '#법규'],
        author: '조마케팅',
        time: '1일 전',
        views: 178,
        answers: 4,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 12,
        status: 'unadopted',
        title: '재건축 아파트 분양 시 기존 거주자 우선권',
        excerpt: '재건축되는 아파트의 기존 거주자가 새 아파트 분양받을 때의 우선권과 절차에 대해...',
        tags: ['#재건축', '#거주자우선권', '#절차'],
        author: '기존주민',
        time: '1일 전',
        views: 201,
        answers: 2,
        reward: 4000,
        popular: false,
        isNew: false
    },
    {
        id: 13,
        status: 'adopted',
        title: '오피스텔과 아파트 분양의 차이점',
        excerpt: '오피스텔 분양과 아파트 분양의 절차나 규제상 차이점이 있다면 무엇인가요?',
        tags: ['#오피스텔', '#아파트', '#차이점'],
        author: '호실장',
        time: '2일 전',
        views: 334,
        answers: 5,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 14,
        status: 'unadopted',
        title: '분양 현장 안전관리 체크리스트',
        excerpt: '분양 현장 운영 시 안전관리를 위해 체크해야 할 항목들이 있다면 알려주세요...',
        tags: ['#안전관리', '#체크리스트', '#현장관리'],
        author: '안전담당',
        time: '2일 전',
        views: 67,
        answers: 0,
        reward: 1500,
        popular: false,
        isNew: false
    },
    {
        id: 15,
        status: 'adopted',
        title: '부동산 경기 변화에 따른 분양 전략',
        excerpt: '최근 부동산 경기가 변화하고 있는데, 이에 따른 효과적인 분양 전략이 있을까요?',
        tags: ['#분양전략', '#부동산경기', '#시장분석'],
        author: '전략기획',
        time: '2일 전',
        views: 712,
        answers: 15,
        reward: 0,
        popular: true,
        isNew: false
    },
    {
        id: 16,
        status: 'unadopted',
        title: '분양사업 수지계산서 작성 시 주의사항',
        excerpt: '분양사업 수지계산서를 작성할 때 꼭 포함해야 할 항목과 주의사항에 대해 알고 싶습니다...',
        tags: ['#수지계산서', '#사업계획', '#재무'],
        author: '재무담당',
        time: '3일 전',
        views: 156,
        answers: 1,
        reward: 6000,
        popular: false,
        isNew: false
    },
    {
        id: 17,
        status: 'adopted',
        title: '아파트 브랜드별 선호도 조사 방법',
        excerpt: '해당 지역에서 아파트 브랜드별 선호도를 조사하는 효과적인 방법이 있을까요?',
        tags: ['#브랜드선호도', '#시장조사', '#고객분석'],
        author: '조사전문',
        time: '3일 전',
        views: 289,
        answers: 7,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 18,
        status: 'unadopted',
        title: '분양대행사 선정 기준 및 계약조건',
        excerpt: '분양대행사를 선정할 때 어떤 기준으로 선택해야 하고, 계약 시 주의할 조건들이 있나요?',
        tags: ['#분양대행사', '#선정기준', '#계약조건'],
        author: '사업담당',
        time: '3일 전',
        views: 98,
        answers: 0,
        reward: 3000,
        popular: false,
        isNew: false
    },
    {
        id: 19,
        status: 'adopted',
        title: '분양 후 AS 업무 프로세스 정리',
        excerpt: '분양 완료 후 고객 AS 업무를 효율적으로 처리하는 프로세스에 대해 알고 싶습니다...',
        tags: ['#AS업무', '#고객서비스', '#프로세스'],
        author: '서비스팀',
        time: '4일 전',
        views: 167,
        answers: 3,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 20,
        status: 'unadopted',
        title: '친환경 건축자재 사용 시 인증 절차',
        excerpt: '친환경 건축자재를 사용하여 그린 빌딩 인증을 받고 싶은데, 필요한 절차와 기준이 궁금합니다...',
        tags: ['#친환경건축', '#그린빌딩', '#인증절차'],
        author: '친환경기획',
        time: '4일 전',
        views: 134,
        answers: 2,
        reward: 8000,
        popular: false,
        isNew: false
    },
    // 21-40 (2페이지)
    {
        id: 21,
        status: 'unadopted',
        title: '부동산 투자신탁(REITs) 활용한 분양 사업',
        excerpt: 'REITs를 활용한 분양 사업 구조와 일반 분양 사업과의 차이점에 대해 자세히 알고 싶습니다...',
        tags: ['#REITs', '#투자신탁', '#사업구조'],
        author: '투자전문',
        time: '5시간 전',
        views: 78,
        answers: 0,
        reward: 9000,
        popular: false,
        isNew: true
    },
    {
        id: 22,
        status: 'adopted',
        title: '분양 계약서 특약사항 작성 시 주의할 점',
        excerpt: '분양 계약서에 특약사항을 작성할 때 법적으로 문제가 되지 않으면서 효과적인 조항들이 있을까요?',
        tags: ['#계약서', '#특약사항', '#법무'],
        author: '법무팀장',
        time: '6시간 전',
        views: 201,
        answers: 4,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 23,
        status: 'adopted',
        title: '디지털 마케팅을 활용한 분양 홍보 전략',
        excerpt: 'SNS, 유튜브, 온라인 광고를 통한 효과적인 분양 마케팅 전략과 성공 사례가 궁금합니다...',
        tags: ['#디지털마케팅', '#SNS마케팅', '#온라인광고'],
        author: '마케터김',
        time: '8시간 전',
        views: 534,
        answers: 9,
        reward: 0,
        popular: true,
        isNew: false
    },
    {
        id: 24,
        status: 'unadopted',
        title: '외국인 투자자 대상 분양 시 필요한 절차',
        excerpt: '외국인 투자자에게 분양할 때 필요한 법적 절차와 서류, 제한사항에 대해 알고 싶습니다...',
        tags: ['#외국인투자', '#절차', '#법규'],
        author: '해외영업',
        time: '10시간 전',
        views: 112,
        answers: 1,
        reward: 3500,
        popular: false,
        isNew: false
    },
    {
        id: 25,
        status: 'adopted',
        title: '분양 현장 VR/AR 기술 도입 효과',
        excerpt: '가상현실과 증강현실 기술을 분양 현장에 도입했을 때의 비용 대비 효과는 어떤가요?',
        tags: ['#VR', '#AR', '#신기술'],
        author: '기술기획',
        time: '12시간 전',
        views: 289,
        answers: 6,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 26,
        status: 'unadopted',
        title: '소형 평수 아파트 분양 시장 전망',
        excerpt: '1인 가구 증가로 인한 소형 아파트 수요 증가에 따른 분양 전략은 무엇일까요?',
        tags: ['#소형아파트', '#1인가구', '#시장전망'],
        author: '트렌드분석',
        time: '14시간 전',
        views: 156,
        answers: 2,
        reward: 4500,
        popular: false,
        isNew: false
    },
    {
        id: 27,
        status: 'adopted',
        title: '분양 사업 리스크 관리 체크리스트',
        excerpt: '분양 사업 진행 시 발생할 수 있는 주요 리스크들과 예방 방법에 대해 체계적으로 알고 싶습니다...',
        tags: ['#리스크관리', '#사업관리', '#예방'],
        author: '리스크팀',
        time: '16시간 전',
        views: 345,
        answers: 8,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 28,
        status: 'unadopted',
        title: '분양 현장 직원 교육 프로그램 추천',
        excerpt: '새로 입사한 분양 현장 직원들을 위한 효과적인 교육 프로그램이나 매뉴얼이 있을까요?',
        tags: ['#직원교육', '#교육프로그램', '#매뉴얼'],
        author: '교육담당',
        time: '18시간 전',
        views: 89,
        answers: 0,
        reward: 3500,
        popular: false,
        isNew: false
    },
    {
        id: 29,
        status: 'adopted',
        title: '스마트홈 기술 적용 아파트 분양 전략',
        excerpt: 'IoT, AI 기술이 적용된 스마트홈 아파트의 분양 포인트와 고객 어필 방법에 대해...',
        tags: ['#스마트홈', '#IoT', '#혁신기술'],
        author: '스마트홈전문',
        time: '1일 전',
        views: 623,
        answers: 11,
        reward: 0,
        popular: true,
        isNew: false
    },
    {
        id: 30,
        status: 'unadopted',
        title: '분양 현장 고객 동선 분석 및 최적화',
        excerpt: '모델하우스나 분양 현장에서 고객 동선을 분석하고 최적화하는 방법에 대해 알고 싶습니다...',
        tags: ['#고객동선', '#공간설계', '#최적화'],
        author: '공간기획',
        time: '1일 전',
        views: 134,
        answers: 1,
        reward: 6500,
        popular: false,
        isNew: false
    },
    {
        id: 31,
        status: 'adopted',
        title: '분양가 산정 시 고려해야 할 세부 요소들',
        excerpt: '분양가를 책정할 때 건축비 외에 고려해야 할 다양한 요소들과 계산 방법에 대해...',
        tags: ['#분양가산정', '#원가계산', '#수익성분석'],
        author: '원가관리',
        time: '1일 전',
        views: 267,
        answers: 5,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 32,
        status: 'unadopted',
        title: '분양 공급계약서 작성 시 필수 점검 사항',
        excerpt: '분양업체와 건설사 간의 공급계약서 작성 시 반드시 확인해야 할 조항들이 있나요?',
        tags: ['#공급계약서', '#계약조건', '#점검사항'],
        author: '계약담당',
        time: '2일 전',
        views: 98,
        answers: 0,
        reward: 4000,
        popular: false,
        isNew: false
    },
    {
        id: 33,
        status: 'adopted',
        title: '친환경 인증 아파트의 분양 메리트',
        excerpt: '녹색건축인증, LEED 인증 등을 받은 아파트의 실제 분양 효과와 마케팅 포인트는?',
        tags: ['#친환경인증', '#녹색건축', '#마케팅포인트'],
        author: '친환경전문',
        time: '2일 전',
        views: 189,
        answers: 3,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 34,
        status: 'unadopted',
        title: '분양 대상지 개발 가능성 평가 기준',
        excerpt: '새로운 분양 대상지를 검토할 때 개발 가능성과 수익성을 평가하는 체크리스트가 있을까요?',
        tags: ['#대상지평가', '#개발가능성', '#수익성분석'],
        author: '개발기획',
        time: '2일 전',
        views: 145,
        answers: 2,
        reward: 5500,
        popular: false,
        isNew: false
    },
    {
        id: 35,
        status: 'adopted',
        title: '분양 현장 CCTV 설치 및 보안 관리',
        excerpt: '분양 현장의 보안을 위한 CCTV 설치 기준과 개인정보 보호 관련 주의사항은?',
        tags: ['#보안관리', '#CCTV', '#개인정보보호'],
        author: '보안관리',
        time: '3일 전',
        views: 234,
        answers: 4,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 36,
        status: 'unadopted',
        title: '분양 후 입주자 커뮤니티 구축 방안',
        excerpt: '분양 완료 후 입주자들 간의 소통과 커뮤니티 활성화를 위한 효과적인 방안이 있을까요?',
        tags: ['#입주자커뮤니티', '#소통활성화', '#주민자치'],
        author: '커뮤니티기획',
        time: '3일 전',
        views: 167,
        answers: 1,
        reward: 7500,
        popular: false,
        isNew: false
    },
    {
        id: 37,
        status: 'adopted',
        title: '분양 업계 트렌드 분석 및 전망 2024',
        excerpt: '2024년 분양 업계의 주요 트렌드와 향후 전망에 대한 전문가들의 의견을 듣고 싶습니다...',
        tags: ['#업계트렌드', '#시장전망', '#2024'],
        author: '시장분석가',
        time: '3일 전',
        views: 789,
        answers: 13,
        reward: 0,
        popular: true,
        isNew: false
    },
    {
        id: 38,
        status: 'unadopted',
        title: '분양 담당자 역량 개발 로드맵',
        excerpt: '분양 업무 담당자로서 전문성을 키우기 위한 체계적인 학습 로드맵과 자격증 취득 순서는?',
        tags: ['#역량개발', '#자격증', '#전문성'],
        author: '성장지향',
        time: '4일 전',
        views: 156,
        answers: 0,
        reward: 5500,
        popular: false,
        isNew: false
    },
    {
        id: 39,
        status: 'adopted',
        title: '분양 현장 응급상황 대응 매뉴얼',
        excerpt: '분양 현장에서 발생할 수 있는 각종 응급상황에 대한 대응 매뉴얼과 연락체계는 어떻게 구축해야 할까요?',
        tags: ['#응급상황', '#대응매뉴얼', '#안전관리'],
        author: '안전매니저',
        time: '4일 전',
        views: 198,
        answers: 7,
        reward: 0,
        popular: false,
        isNew: false
    },
    {
        id: 40,
        status: 'unadopted',
        title: '글로벌 분양 시장 진출 전략 및 사례',
        excerpt: '한국 건설사가 해외 분양 시장에 진출할 때 고려해야 할 전략과 성공/실패 사례에 대해 알고 싶습니다...',
        tags: ['#해외진출', '#글로벌분양', '#전략'],
        author: '글로벌전략',
        time: '4일 전',
        views: 234,
        answers: 2,
        reward: 10000,
        popular: false,
        isNew: true
    }
];

// 페이지네이션 설정
const itemsPerPage = 20;
let currentPage = 1;
let currentCategory = 'all';
let filteredQuestions = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('qna.js DOMContentLoaded 이벤트 발생');
    
    // 카테고리 탭 - checkbox-tab 스타일
    const categoryTabs = document.querySelectorAll('.checkbox-tab');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const sortSelect = document.querySelector('.sort-select');
    const qnaItems = document.querySelectorAll('.qna-item');
    const pageBtns = document.querySelectorAll('.page-btn:not(:disabled)');
    const popularTags = document.querySelectorAll('.popular-tags .tag');

    console.log('카테고리 탭 개수:', categoryTabs.length);
    console.log('Q&A 아이템 개수:', qnaItems.length);
    console.log('인기 태그 개수:', popularTags.length);
    
    // 베스트 답변자 닉네임 길이 제한
    const truncateNames = () => {
        const nameElements = document.querySelectorAll('.answerer-info .name');
        nameElements.forEach(element => {
            const fullName = element.getAttribute('title') || element.textContent;
            if (!element.getAttribute('title')) {
                element.setAttribute('title', fullName);
            }
            
            if (fullName.length > 6) {
                element.textContent = fullName.substring(0, 6) + '...';
            } else {
                element.textContent = fullName;
            }
        });
    };
    
    truncateNames();
    
    // 각 Q&A 아이템의 상태 확인
    qnaItems.forEach((item, index) => {
        console.log(`Q&A ${index + 1}: status=${item.dataset.status}, popular=${item.dataset.popular}`);
    });
    
    // 현재 선택된 태그 저장
    let selectedTag = null;

    // 인기 태그 클릭 이벤트
    popularTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tagText = this.textContent.trim();
            console.log('태그 클릭됨:', tagText);
            
            // 이미 선택된 태그를 다시 클릭하면 필터 해제
            if (selectedTag === tagText) {
                selectedTag = null;
                this.classList.remove('active');
                // 전체 탭 활성화
                categoryTabs.forEach(t => t.classList.remove('active'));
                categoryTabs[0].classList.add('active');
                filterQuestions('all');
            } else {
                // 새로운 태그 선택
                popularTags.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                selectedTag = tagText;
                
                // 카테고리 탭 비활성화
                categoryTabs.forEach(t => t.classList.remove('active'));
                
                // 태그로 필터링
                filterByTag(tagText);
            }
        });
    });

    // 카테고리 탭 클릭 이벤트 (checkbox-tab 스타일)
    if (categoryTabs.length > 0) {
        // 초기 게시글 개수 업데이트
        updateCategoryCounts();
        
        categoryTabs.forEach((tab, index) => {
            const input = tab.querySelector('input[type="radio"]');
            console.log(`탭 ${index + 1} 등록:`, tab.textContent.trim());
            
            tab.addEventListener('click', function(e) {
                // preventDefault 제거 - radio 버튼의 기본 동작 허용
                
                console.log('탭 클릭됨:', this.textContent.trim());
                
                // 태그 필터 해제
                selectedTag = null;
                popularTags.forEach(t => t.classList.remove('active'));
                
                // 모든 탭에서 active 클래스 제거
                categoryTabs.forEach(t => {
                    t.classList.remove('active');
                    const tInput = t.querySelector('input[type="radio"]');
                    if (tInput) tInput.checked = false;
                });
                // 클릭한 탭에 active 클래스 추가
                this.classList.add('active');
                if (input) input.checked = true;
                
                const category = this.getAttribute('data-category');
                filterQuestions(category);
            });
        });
    } else {
        console.error('카테고리 탭을 찾을 수 없습니다!');
    }

    // 검색 기능
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            // 검색어가 없으면 모든 질문 표시
            clearSearch();
            return;
        }
        
        console.log(`검색어: ${searchTerm}`);
        
        const questions = document.querySelectorAll('.qna-item');
        let visibleCount = 0;
        
        questions.forEach(question => {
            // 제목, 내용, 태그에서 검색어 찾기
            const title = question.querySelector('.qna-question-title')?.textContent.toLowerCase() || '';
            const excerpt = question.querySelector('.qna-excerpt')?.textContent.toLowerCase() || '';
            const tags = Array.from(question.querySelectorAll('.qna-tags .tag'))
                .map(tag => tag.textContent.toLowerCase()).join(' ');
            const author = question.querySelector('.author')?.textContent.toLowerCase() || '';
            
            // 검색어가 포함되어 있는지 확인
            const isMatch = title.includes(searchTerm) || 
                          excerpt.includes(searchTerm) || 
                          tags.includes(searchTerm) ||
                          author.includes(searchTerm);
            
            if (isMatch) {
                question.style.display = '';
                visibleCount++;
                
                // 검색어 하이라이트 (선택적)
                highlightSearchTerm(question, searchTerm);
            } else {
                question.style.display = 'none';
            }
        });
        
        // 검색 결과 정보 표시
        showSearchInfo(searchTerm, visibleCount);
        
        // 검색 결과가 없을 때 메시지 표시
        const qnaList = document.querySelector('.qna-list');
        let noResultsMessage = document.querySelector('.no-search-results');
        
        if (visibleCount === 0) {
            if (!noResultsMessage) {
                noResultsMessage = document.createElement('div');
                noResultsMessage.className = 'no-search-results';
                noResultsMessage.style.cssText = 'text-align: center; padding: 60px 20px; color: #666;';
                noResultsMessage.innerHTML = `
                    <i class="fas fa-search" style="font-size: 48px; color: #ddd; margin-bottom: 16px; display: block;"></i>
                    <p style="font-size: 16px;">"${searchTerm}" 검색 결과가 없습니다.</p>
                    <p style="font-size: 14px; margin-top: 8px;">다른 검색어를 입력해보세요.</p>
                `;
                qnaList.appendChild(noResultsMessage);
            } else {
                noResultsMessage.querySelector('p').innerHTML = `"${searchTerm}" 검색 결과가 없습니다.`;
            }
            noResultsMessage.style.display = 'block';
        } else {
            if (noResultsMessage) {
                noResultsMessage.style.display = 'none';
            }
        }
        
        // 카테고리 탭 비활성화
        categoryTabs.forEach(tab => tab.classList.remove('active'));
        
        // 태그 필터 해제
        selectedTag = null;
        popularTags.forEach(tag => tag.classList.remove('active'));
    }
    
    // 검색어 하이라이트
    function highlightSearchTerm(element, searchTerm) {
        // 제목에서 하이라이트
        const titleElement = element.querySelector('.qna-question-title a');
        if (titleElement) {
            const originalText = titleElement.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            if (regex.test(originalText)) {
                titleElement.innerHTML = originalText.replace(regex, '<mark style="background: #ffeb3b; padding: 2px;">$1</mark>');
            }
        }
    }
    
    // 검색 정보 표시
    function showSearchInfo(searchTerm, count) {
        let searchInfo = document.querySelector('.search-info');
        
        if (!searchInfo) {
            searchInfo = document.createElement('div');
            searchInfo.className = 'search-info';
            searchInfo.style.cssText = 'padding: 12px 16px; background: #e3f2fd; border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;';
            
            const categoryTabs = document.querySelector('.category-tabs');
            categoryTabs.parentNode.insertBefore(searchInfo, categoryTabs.nextSibling);
        }
        
        searchInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-search" style="color: #0066ff;"></i>
                <span style="color: #333; font-weight: 500;">검색: <strong style="color: #0066ff;">"${searchTerm}"</strong></span>
                <span style="color: #666; font-size: 14px;">(${count}개 질문)</span>
            </div>
            <button onclick="clearSearch()" style="padding: 4px 12px; background: white; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 13px;">
                <i class="fas fa-times"></i> 검색 취소
            </button>
        `;
        
        searchInfo.style.display = 'flex';
    }
    
    // 검색 초기화
    window.clearSearch = function() {
        // 검색어 지우기
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 모든 질문 표시
        const questions = document.querySelectorAll('.qna-item');
        questions.forEach(question => {
            question.style.display = '';
            
            // 하이라이트 제거
            const titleElement = question.querySelector('.qna-question-title a');
            if (titleElement && titleElement.innerHTML.includes('<mark')) {
                titleElement.innerHTML = titleElement.textContent;
            }
        });
        
        // 검색 정보 숨기기
        const searchInfo = document.querySelector('.search-info');
        if (searchInfo) {
            searchInfo.style.display = 'none';
        }
        
        // 검색 결과 없음 메시지 숨기기
        const noResultsMessage = document.querySelector('.no-search-results');
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        
        // 전체 탭 활성화
        categoryTabs.forEach(tab => tab.classList.remove('active'));
        if (categoryTabs[0]) {
            categoryTabs[0].classList.add('active');
        }
        
        // 카테고리별 개수 업데이트
        updateCategoryCounts();
    }

    // 정렬 변경
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            console.log(`정렬 기준: ${sortBy}`);
            // 정렬 로직 구현
        });
    }

    // 질문하기 플로팅 버튼
    const askBtnFloat = document.querySelector('.ask-btn-float');
    const askBtn = document.querySelector('.ask-btn');
    if (askBtnFloat) {
        askBtnFloat.addEventListener('click', function() {
            console.log('질문하기 모달 열기...');
            openAskModal();
        });
    }
    if (askBtn) {
        askBtn.addEventListener('click', function() {
            console.log('질문하기 모달 열기...');
            openAskModal();
        });
    }
    
    // 질문하기 모달 관련 함수
    window.openAskModal = function() {
        const modal = document.getElementById('askModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };
    
    window.closeAskModal = function() {
        const modal = document.getElementById('askModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
    
    // 포인트 슬라이더 이벤트
    const pointSlider = document.getElementById('pointSlider');
    const selectedPoints = document.getElementById('selectedPoints');
    const deductPoints = document.getElementById('deductPoints');
    const rewardAmount = document.getElementById('rewardAmount');
    const presetBtns = document.querySelectorAll('.preset-btn');
    
    if (pointSlider) {
        pointSlider.addEventListener('input', function() {
            updatePointDisplay(this.value);
        });
    }
    
    // 프리셋 버튼 이벤트
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const points = parseInt(this.dataset.points);
            if (pointSlider) {
                pointSlider.value = points;
                updatePointDisplay(points);
            }
            
            presetBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 포인트 표시 업데이트
    function updatePointDisplay(points) {
        points = parseInt(points);
        const reward = Math.floor(points * 0.9);
        
        if (selectedPoints) selectedPoints.textContent = points.toLocaleString();
        if (deductPoints) deductPoints.textContent = `-${points.toLocaleString()}P`;
        if (rewardAmount) rewardAmount.textContent = `${reward.toLocaleString()}P (90%)`;
    }
    
    // 태그 추천 클릭
    const tagSuggestions = document.querySelectorAll('.tag-suggestion');
    const questionTags = document.getElementById('questionTags');
    
    tagSuggestions.forEach(tag => {
        tag.addEventListener('click', function() {
            if (questionTags) {
                const currentTags = questionTags.value.trim();
                const newTag = this.textContent;
                
                if (!currentTags.includes(newTag)) {
                    questionTags.value = currentTags ? `${currentTags} ${newTag}` : newTag;
                }
            }
        });
    });
    
    // 질문 상세보기 모달 열기
    window.openDetailModal = function(data) {
        const modal = document.getElementById('qnaDetailModal');
        if (!modal) return;
        
        // 모달 내용 업데이트
        document.getElementById('modalQuestionTitle').textContent = data.title;
        document.getElementById('modalQuestionContent').innerHTML = `
            <p>${data.content}</p>
            <p>추가적인 상세 내용이 여기에 표시됩니다...</p>
        `;
        document.getElementById('modalAuthor').textContent = data.author;
        document.getElementById('modalTime').textContent = data.time;
        document.getElementById('modalViews').textContent = data.views;
        
        // 상태 업데이트
        const statusBadge = document.getElementById('modalStatus');
        if (data.status === 'adopted') {
            statusBadge.className = 'status-badge adopted';
            statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> 채택완료';
            // 답변 작성 영역 숨기기
            document.getElementById('answerWriteSection').style.display = 'none';
        } else {
            statusBadge.className = 'status-badge unadopted';
            statusBadge.innerHTML = '<i class="fas fa-question-circle"></i> 미채택';
            // 답변 작성 영역 표시
            document.getElementById('answerWriteSection').style.display = 'block';
        }
        
        // 보상 포인트 업데이트
        const modalReward = document.getElementById('modalReward');
        if (modalReward && data.reward) {
            modalReward.innerHTML = `<i class="fas fa-coins"></i> ${data.reward} 보상`;
            
            // 답변 작성 영역의 보상 금액 업데이트
            const rewardAmount = parseInt(data.reward.replace(/[^\d]/g, ''));
            const adoptReward = Math.floor(rewardAmount * 0.9);
            const rewardSpans = document.querySelectorAll('.reward-amount');
            rewardSpans.forEach(span => {
                span.textContent = `${adoptReward.toLocaleString()}P`;
            });
        }
        
        // 태그 업데이트
        const tagsContainer = modal.querySelector('.question-tags');
        if (tagsContainer && data.tags) {
            tagsContainer.innerHTML = data.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        }
        
        // 모달 표시
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };
    
    // 질문 상세보기 모달 닫기
    window.closeDetailModal = function() {
        const modal = document.getElementById('qnaDetailModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
    
    // 답변 등록
    window.submitAnswer = function() {
        const answerContent = document.getElementById('answerContent').value.trim();
        
        if (!answerContent) {
            alert('답변 내용을 입력해주세요.');
            return;
        }
        
        console.log('답변 등록:', answerContent);
        
        // 답변 목록에 새 답변 추가 (실제로는 서버에 전송)
        const answerList = document.getElementById('answerList');
        const newAnswer = document.createElement('div');
        newAnswer.className = 'answer-item';
        newAnswer.innerHTML = `
            <div class="answer-header">
                <div class="answerer-info">
                    <span class="answerer-name"><i class="fas fa-user"></i> 박승학</span>
                    <span class="answer-time">방금 전</span>
                </div>
                <div class="answer-actions-top">
                    <button class="btn-adopt" onclick="adoptAnswer(this)">
                        <i class="fas fa-check"></i> 채택하기
                    </button>
                </div>
            </div>
            <div class="answer-content">
                <p>${answerContent}</p>
            </div>
            <div class="answer-actions">
                <button class="btn-helpful">
                    <i class="fas fa-thumbs-up"></i> 도움됨 <span>0</span>
                </button>
                <button class="btn-report">
                    <i class="fas fa-flag"></i> 신고
                </button>
            </div>
        `;
        
        answerList.appendChild(newAnswer);
        
        // 답변 개수 업데이트
        const answerCount = document.getElementById('answerCount');
        if (answerCount) {
            const currentCount = parseInt(answerCount.textContent) || 0;
            answerCount.textContent = currentCount + 1;
        }
        
        // 입력 필드 초기화
        document.getElementById('answerContent').value = '';
        
        alert('답변이 등록되었습니다!');
    };
    
    // 답변 채택
    window.adoptAnswer = function(button) {
        if (confirm('이 답변을 채택하시겠습니까?\n채택 후에는 변경할 수 없습니다.')) {
            // 모든 채택 버튼 숨기기
            document.querySelectorAll('.btn-adopt').forEach(btn => {
                btn.style.display = 'none';
            });
            
            // 답변 작성 영역 숨기기
            document.getElementById('answerWriteSection').style.display = 'none';
            
            // 채택된 답변 표시
            const answerItem = button.closest('.answer-item');
            answerItem.classList.add('adopted');
            
            // 채택 배지 추가
            const answerHeader = answerItem.querySelector('.answer-header');
            const statusDiv = document.createElement('div');
            statusDiv.className = 'answer-status';
            statusDiv.innerHTML = `
                <span class="adopted-badge">
                    <i class="fas fa-check-circle"></i> 채택됨
                </span>
                <span class="points-earned">+4,500P 획득</span>
            `;
            answerHeader.appendChild(statusDiv);
            
            // 상태 업데이트
            const statusBadge = document.getElementById('modalStatus');
            statusBadge.className = 'status-badge adopted';
            statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> 채택완료';
            
            alert('답변이 채택되었습니다!\n답변자에게 포인트가 지급됩니다.');
        }
    };
    
    // 도움됨 버튼
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-helpful')) {
            const btn = e.target.closest('.btn-helpful');
            const countSpan = btn.querySelector('span');
            let count = parseInt(countSpan.textContent) || 0;
            
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                count--;
            } else {
                btn.classList.add('active');
                count++;
            }
            
            countSpan.textContent = count;
        }
    });
    
    // 질문 등록
    window.submitQuestion = function() {
        const title = document.getElementById('questionTitle').value.trim();
        const content = document.getElementById('questionContent').value.trim();
        const tags = document.getElementById('questionTags').value.trim();
        const points = document.getElementById('pointSlider').value;
        
        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        
        console.log('질문 등록:', {
            title,
            content,
            tags,
            points: parseInt(points),
            reward: Math.floor(parseInt(points) * 0.9)
        });
        
        alert(`질문이 등록되었습니다!\n채택 보상: ${parseInt(points).toLocaleString()}P`);
        closeAskModal();
    }

    // 투표 버튼 이벤트
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const voteCount = this.querySelector('.vote-count');
            if (voteCount) {
                let count = parseInt(voteCount.textContent);
                
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    voteCount.textContent = count - 1;
                } else {
                    this.classList.add('active');
                    voteCount.textContent = count + 1;
                }
            }
        });
    });

    // 페이지네이션
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const pageNumber = this.textContent;
            if (!this.classList.contains('page-dots')) {
                pageBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                loadPage(pageNumber);
            }
        });
    });

    // Q&A 아이템 클릭 이벤트
    qnaItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 태그 클릭은 제외
            if (e.target.classList.contains('tag')) {
                return;
            }
            
            // 질문 정보 추출
            const questionTitle = this.querySelector('.qna-question-title a')?.textContent || '';
            const questionExcerpt = this.querySelector('.qna-excerpt')?.textContent || '';
            const author = this.querySelector('.author')?.textContent.replace(/[^\w가-힣]/g, '') || '';
            const time = this.querySelector('.time')?.textContent.replace(/[^\w가-힣\s]/g, '') || '';
            const views = this.querySelector('.views')?.textContent.match(/\d+/)?.[0] || '0';
            const status = this.dataset.status;
            const tags = Array.from(this.querySelectorAll('.qna-tags .tag')).map(tag => tag.textContent);
            
            // 보상 포인트 추출
            const rewardElement = this.querySelector('.reward-amount');
            const rewardPoints = rewardElement ? rewardElement.textContent : '0P';
            
            console.log('질문 상세보기 열기:', questionTitle);
            openDetailModal({
                title: questionTitle,
                content: questionExcerpt,
                author: author,
                time: time,
                views: views,
                status: status,
                tags: tags,
                reward: rewardPoints
            });
        });
        
        // Q&A 아이템 내부의 태그 클릭 이벤트
        const itemTags = item.querySelectorAll('.qna-tags .tag');
        itemTags.forEach(tag => {
            tag.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const tagText = this.textContent.trim();
                console.log('Q&A 아이템 태그 클릭:', tagText);
                
                // 선택된 태그 업데이트
                selectedTag = tagText;
                
                // 인기 태그 활성화 상태 업데이트
                popularTags.forEach(pTag => {
                    if (pTag.textContent.trim() === tagText) {
                        pTag.classList.add('active');
                    } else {
                        pTag.classList.remove('active');
                    }
                });
                
                // 카테고리 탭 비활성화
                categoryTabs.forEach(t => t.classList.remove('active'));
                
                // 태그로 필터링
                filterByTag(tagText);
            });
        });
    });

    // 태그별 필터링 함수
    function filterByTag(tagText) {
        console.log(`태그별 필터링: ${tagText}`);
        
        // 검색 정보 숨기기
        const searchInfo = document.querySelector('.search-info');
        if (searchInfo) {
            searchInfo.style.display = 'none';
        }
        
        // 검색어 초기화
        if (searchInput) {
            searchInput.value = '';
        }
        
        const questions = document.querySelectorAll('.qna-item');
        let visibleCount = 0;
        
        questions.forEach((question, index) => {
            const questionTags = question.querySelectorAll('.qna-tags .tag');
            let hasTag = false;
            
            questionTags.forEach(qTag => {
                if (qTag.textContent.trim() === tagText) {
                    hasTag = true;
                }
            });
            
            if (hasTag) {
                question.style.display = '';
                visibleCount++;
                console.log(`Q&A ${index + 1}: 태그 ${tagText} 포함됨`);
            } else {
                question.style.display = 'none';
            }
        });
        
        // 질문이 없을 때 메시지 표시
        const qnaList = document.querySelector('.qna-list');
        let noQuestionsMessage = document.querySelector('.no-questions-message');
        
        if (visibleCount === 0) {
            if (!noQuestionsMessage) {
                noQuestionsMessage = document.createElement('div');
                noQuestionsMessage.className = 'no-questions-message';
                noQuestionsMessage.style.cssText = 'text-align: center; padding: 60px 20px; color: #666;';
                noQuestionsMessage.innerHTML = `
                    <i class="fas fa-search" style="font-size: 48px; color: #ddd; margin-bottom: 16px; display: block;"></i>
                    <p style="font-size: 16px;">"${tagText}" 태그를 포함한 질문이 없습니다.</p>
                `;
                qnaList.appendChild(noQuestionsMessage);
            } else {
                noQuestionsMessage.querySelector('p').textContent = `"${tagText}" 태그를 포함한 질문이 없습니다.`;
            }
            noQuestionsMessage.style.display = 'block';
        } else {
            if (noQuestionsMessage) {
                noQuestionsMessage.style.display = 'none';
            }
        }
        
        console.log(`${tagText} 태그: ${visibleCount}개 질문 표시`);
        
        // 상단에 선택된 태그 표시
        showSelectedTagInfo(tagText, visibleCount);
    }
    
    // 선택된 태그 정보 표시
    function showSelectedTagInfo(tagText, count) {
        let tagInfo = document.querySelector('.selected-tag-info');
        
        if (!tagInfo) {
            tagInfo = document.createElement('div');
            tagInfo.className = 'selected-tag-info';
            tagInfo.style.cssText = 'padding: 12px 16px; background: #e3f2fd; border-radius: 8px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;';
            
            const categoryTabs = document.querySelector('.category-tabs');
            categoryTabs.parentNode.insertBefore(tagInfo, categoryTabs.nextSibling);
        }
        
        tagInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-filter" style="color: #0066ff;"></i>
                <span style="color: #333; font-weight: 500;">태그 필터: <strong style="color: #0066ff;">${tagText}</strong></span>
                <span style="color: #666; font-size: 14px;">(${count}개 질문)</span>
            </div>
            <button onclick="clearTagFilter()" style="padding: 4px 12px; background: white; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 13px;">
                <i class="fas fa-times"></i> 필터 해제
            </button>
        `;
        
        tagInfo.style.display = 'flex';
    }
    
    // 태그 필터 해제 함수 (전역)
    window.clearTagFilter = function() {
        selectedTag = null;
        popularTags.forEach(t => t.classList.remove('active'));
        
        // 선택된 태그 정보 숨기기
        const tagInfo = document.querySelector('.selected-tag-info');
        if (tagInfo) {
            tagInfo.style.display = 'none';
        }
        
        // 전체 탭 활성화
        categoryTabs.forEach(t => t.classList.remove('active'));
        categoryTabs[0].classList.add('active');
        filterQuestions('all');
    };
    
    // 필터링 함수
    function filterQuestions(category) {
        console.log(`카테고리별 필터링: ${category}`);
        
        // 태그 필터 정보 숨기기
        const tagInfo = document.querySelector('.selected-tag-info');
        if (tagInfo) {
            tagInfo.style.display = 'none';
        }
        
        // 검색 정보 숨기기
        const searchInfo = document.querySelector('.search-info');
        if (searchInfo) {
            searchInfo.style.display = 'none';
        }
        
        // 검색어 초기화
        if (searchInput) {
            searchInput.value = '';
        }
        
        const questions = document.querySelectorAll('.qna-item');
        let visibleCount = 0;
        
        console.log(`총 ${questions.length}개의 질문 필터링 중...`);
        
        questions.forEach((question, index) => {
            const status = question.dataset.status;
            const isPopular = question.dataset.popular === 'true';
            
            let shouldShow = false;
            
            switch(category) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'unadopted':
                    shouldShow = status === 'unadopted';
                    break;
                case 'adopted':
                    shouldShow = status === 'adopted';
                    break;
                case 'popular':
                    shouldShow = isPopular;
                    break;
                case 'myquestions':
                    // 로그인 기능이 구현되면 사용자의 질문만 필터링
                    shouldShow = false;
                    break;
                default:
                    shouldShow = true;
            }
            
            console.log(`Q&A ${index + 1}: status=${status}, popular=${isPopular}, shouldShow=${shouldShow}`);
            
            if (shouldShow) {
                question.style.display = '';
                visibleCount++;
            } else {
                question.style.display = 'none';
            }
        });
        
        // 질문이 없을 때 메시지 표시
        const qnaList = document.querySelector('.qna-list');
        let noQuestionsMessage = document.querySelector('.no-questions-message');
        
        if (visibleCount === 0) {
            if (!noQuestionsMessage) {
                noQuestionsMessage = document.createElement('div');
                noQuestionsMessage.className = 'no-questions-message';
                noQuestionsMessage.style.cssText = 'text-align: center; padding: 60px 20px; color: #666;';
                noQuestionsMessage.innerHTML = `
                    <i class="fas fa-question-circle" style="font-size: 48px; color: #ddd; margin-bottom: 16px; display: block;"></i>
                    <p style="font-size: 16px;">해당 카테고리에 질문이 없습니다.</p>
                `;
                qnaList.appendChild(noQuestionsMessage);
            }
            noQuestionsMessage.style.display = 'block';
        } else {
            if (noQuestionsMessage) {
                noQuestionsMessage.style.display = 'none';
            }
        }
        
        // 카테고리별 개수 업데이트
        updateCategoryCounts();
        
        console.log(`${category} 카테고리: ${visibleCount}개 질문 표시`);
    }
    
    // 카테고리별 질문 개수 업데이트
    function updateCategoryCounts() {
        const questions = document.querySelectorAll('.qna-item');
        const counts = {
            all: questions.length,
            unadopted: 0,
            adopted: 0,
            popular: 0,
            myquestions: 0
        };
        
        questions.forEach(question => {
            const status = question.dataset.status;
            const isPopular = question.dataset.popular === 'true';
            
            if (status === 'adopted') {
                counts.adopted++;
            } else if (status === 'unadopted') {
                counts.unadopted++;
            }
            
            if (isPopular) {
                counts.popular++;
            }
        });
        
        // 탭의 숫자 업데이트 (checkbox-tab 스타일)
        categoryTabs.forEach(tab => {
            const category = tab.getAttribute('data-category');
            const countSpan = tab.querySelector('.tab-count');
            
            if (countSpan && counts[category] !== undefined) {
                countSpan.textContent = counts[category];
            }
        });
        
        console.log('카테고리별 질문 개수:', counts);
    }

    // 초기 로드
    initializeQnA();

    // Q&A 초기화 함수
    function initializeQnA() {
        filteredQuestions = questionsData;
        renderQuestions();
        renderPagination();
        updateCategoryCounts();
        truncateNames();
    }

    // 질문 렌더링 함수
    function renderQuestions() {
        const qnaList = document.getElementById('qnaList');
        if (!qnaList) return;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const questionsToShow = filteredQuestions.slice(startIndex, endIndex);

        qnaList.innerHTML = '';

        questionsToShow.forEach(question => {
            const questionHTML = createQuestionHTML(question);
            qnaList.appendChild(questionHTML);
        });

        // 이벤트 리스너 다시 연결
        attachQuestionEventListeners();
    }

    // 질문 HTML 생성 함수
    function createQuestionHTML(question) {
        const questionElement = document.createElement('div');
        questionElement.className = 'qna-item';
        questionElement.setAttribute('data-status', question.status);
        if (question.popular) {
            questionElement.setAttribute('data-popular', 'true');
        }

        const statusBadgeHTML = question.status === 'unadopted' 
            ? `<div class="status-badge unadopted">
                <i class="fas fa-question-circle"></i>
                미채택
            </div>`
            : `<div class="status-badge adopted">
                <i class="fas fa-check-circle"></i>
                채택완료
            </div>`;

        // 미채택인 경우에만 포인트 표시 (배경색 없이 주황색 텍스트로)
        const rewardBadgeHTML = (question.status === 'unadopted' && question.reward > 0)
            ? `<div class="reward-badge">
                <i class="fas fa-coins"></i>
                ${question.reward.toLocaleString()}P
            </div>`
            : '';

        const popularBadgeHTML = question.popular
            ? `<div class="badge-popular">
                <i class="fas fa-fire"></i>
                인기
            </div>`
            : '';

        const newBadgeHTML = question.isNew
            ? `<span class="new-badge">NEW</span>`
            : '';

        const tagsHTML = question.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        questionElement.innerHTML = `
            <div class="qna-status">
                ${statusBadgeHTML}
                ${rewardBadgeHTML}
                ${popularBadgeHTML}
            </div>
            <div class="qna-content">
                <h3 class="qna-question-title">
                    <a href="#" onclick="openQuestionDetail(${question.id})">${question.title}</a>
                    ${newBadgeHTML}
                </h3>
                <p class="qna-excerpt">${question.excerpt}</p>
                <div class="qna-tags">
                    ${tagsHTML}
                </div>
                <div class="qna-meta">
                    <span class="author"><i class="fas fa-user"></i> ${question.author}</span>
                    <span class="time"><i class="fas fa-clock"></i> ${question.time}</span>
                    <span class="views"><i class="fas fa-eye"></i> ${question.views}</span>
                    <span class="answers"><i class="fas fa-comment"></i> 답변 ${question.answers}</span>
                </div>
            </div>
        `;

        return questionElement;
    }

    // 페이지네이션 링크 생성 헬퍼 함수
    function createPaginationLink(text, onClick, disabled, active = false) {
        const link = document.createElement('a');
        link.href = 'javascript:void(0)'; // # 대신 javascript:void(0) 사용
        link.textContent = text;
        if (disabled) link.className = 'disabled';
        if (active) link.className = 'active';
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // 이벤트 버블링 방지 추가
            if (!disabled) onClick();
            return false; // 추가 보호
        });
        return link;
    }

    // 페이지네이션 렌더링 함수
    function renderPagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
        paginationContainer.innerHTML = '';
        paginationContainer.className = 'pagination-underline';

        if (totalPages <= 1) return;

        // 처음 버튼
        const firstBtn = createPaginationLink('처음', () => {
            changePage(1);
        }, currentPage === 1);
        paginationContainer.appendChild(firstBtn);

        // 이전 버튼
        const prevBtn = createPaginationLink('이전', () => {
            if (currentPage > 1) changePage(currentPage - 1);
        }, currentPage === 1);
        paginationContainer.appendChild(prevBtn);

        // 페이지 번호들을 담을 컨테이너
        const pageNumbers = document.createElement('div');
        pageNumbers.className = 'page-numbers';

        // 페이지 번호 버튼들
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        for (let i = startPage; i <= endPage; i++) {
            const pageLink = createPaginationLink(i, () => {
                changePage(i);
            }, false, currentPage === i);
            pageNumbers.appendChild(pageLink);
        }

        paginationContainer.appendChild(pageNumbers);

        // 다음 버튼
        const nextBtn = createPaginationLink('다음', () => {
            if (currentPage < totalPages) changePage(currentPage + 1);
        }, currentPage === totalPages);
        paginationContainer.appendChild(nextBtn);

        // 끝 버튼
        const lastBtn = createPaginationLink('끝', () => {
            changePage(totalPages);
        }, currentPage === totalPages);
        paginationContainer.appendChild(lastBtn);
    }

    // 페이지 변경 함수
    function changePage(pageNumber) {
        const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
        
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            currentPage = pageNumber;
            renderQuestions();
            renderPagination();
            
            // 스크롤 제거 - 사용자가 원하지 않음
            // document.querySelector('.qna-container').scrollIntoView({ 
            //     behavior: 'smooth' 
            // });
        }
    }

    // 질문 상세보기 함수
    window.openQuestionDetail = function(questionId) {
        const question = questionsData.find(q => q.id === questionId);
        if (question) {
            // 기존 모달 열기 로직 재사용
            console.log('질문 상세보기:', question.title);
            // 여기에 모달 열기 코드 추가 가능
        }
    };

    // 질문 이벤트 리스너 연결 함수
    function attachQuestionEventListeners() {
        // 태그 클릭 이벤트
        document.querySelectorAll('.qna-tags .tag').forEach(tag => {
            tag.addEventListener('click', function(e) {
                e.stopPropagation();
                const tagText = this.textContent.trim();
                console.log('태그 클릭:', tagText);
                // 태그 검색 기능 구현 가능
            });
        });
    }

    // 카테고리 탭 필터링 함수 업데이트
    function filterPosts(category) {
        console.log(`Filtering posts by category: ${category}`);
        
        currentCategory = category;
        currentPage = 1; // 필터링 시 1페이지로 리셋
        
        // 카테고리별 필터링
        if (category === 'all') {
            filteredQuestions = questionsData;
        } else if (category === 'unadopted') {
            filteredQuestions = questionsData.filter(q => q.status === 'unadopted');
        } else if (category === 'adopted') {
            filteredQuestions = questionsData.filter(q => q.status === 'adopted');
        } else if (category === 'popular') {
            filteredQuestions = questionsData.filter(q => q.popular);
        } else if (category === 'myquestions') {
            // 여기서는 예시로 빈 배열 (실제로는 로그인한 사용자 질문 필터링)
            filteredQuestions = [];
        }
        
        // 화면 업데이트
        renderQuestions();
        renderPagination();
        updateCategoryCounts();
        
        console.log(`${category} 카테고리: ${filteredQuestions.length}개 질문`);
    }

    // 카테고리별 질문 개수 업데이트 함수 수정
    function updateCategoryCounts() {
        const counts = {
            all: questionsData.length,
            unadopted: questionsData.filter(q => q.status === 'unadopted').length,
            adopted: questionsData.filter(q => q.status === 'adopted').length,
            popular: questionsData.filter(q => q.popular).length,
            myquestions: 0 // 실제로는 로그인 사용자 질문 수
        };

        // 각 탭의 count span 업데이트 (checkbox-tab 스타일)
        categoryTabs.forEach(tab => {
            const category = tab.dataset.category;
            const countSpan = tab.querySelector('.tab-count');
            if (countSpan && counts[category] !== undefined) {
                countSpan.textContent = counts[category];
            }
        });
        
        console.log('카테고리별 질문 개수:', counts);
    }

    // 베스트 답변 토글
    document.querySelectorAll('.best-answer-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                this.innerHTML = '<i class="fas fa-star"></i> 베스트 답변';
            } else {
                this.classList.add('active');
                this.innerHTML = '<i class="fas fa-star"></i> 베스트 답변 취소';
            }
        });
    });

    // 답변하기 버튼
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('답변하기 버튼 클릭');
            alert('답변하기 기능은 로그인 후 이용 가능합니다.');
        });
    });
});