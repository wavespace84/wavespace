// 자유게시판 활동 데이터 - 50개 테스트 계정 기반
import { mockUsers, getRandomUsers, getUserById } from './mockUsers.js';

// 실제같은 게시글 제목과 내용 템플릿
const postTemplates = {
    question: [
        { title: "청약통장 가점 계산 관련 질문드립니다", content: "안녕하세요. 청약통장 가점 계산이 헷갈려서 질문드립니다.\n\n현재 3년째 납입중인데, 중간에 6개월 정도 납입을 중단한 적이 있습니다.\n이런 경우에도 가점은 계속 쌓이나요?\n\n경험 있으신 분들 답변 부탁드립니다." },
        { title: "특별공급 자격 조건 문의", content: "신혼부부 특별공급 신청하려는데 조건이 복잡하네요.\n\n맞벌이 부부 소득 기준이 어떻게 되나요?\n작년 소득 기준인가요, 올해 기준인가요?" },
        { title: "전매제한 기간 중 이사 가능한가요?", content: "전매제한 기간 중인데 직장 때문에 이사를 가야 할 것 같습니다.\n전세로 놓고 가는 것도 안되나요?" },
        { title: "모델하우스 방문 예약 시스템 문의", content: "요즘 모델하우스는 다 예약제로 운영하나요?\n현장 방문은 아예 불가능한가요?" },
        { title: "청약 당첨 후 대출 거절되면 어떻게 되나요?", content: "청약 당첨되었는데 대출이 거절될 수도 있다고 들었습니다.\n이런 경우 계약금은 돌려받을 수 있나요?" }
    ],
    info: [
        { title: "2024년 1분기 서울 분양 일정 총정리", content: "2024년 1분기 서울 지역 분양 예정 단지입니다.\n\n1. 강남구 - 래미안 ○○ (3월)\n2. 서초구 - 힐스테이트 ○○ (2월)\n3. 송파구 - 롯데캐슬 ○○ (3월)\n4. 마포구 - e편한세상 ○○ (2월)\n\n자세한 일정은 각 건설사 홈페이지 참고하세요." },
        { title: "금리 인상이 분양시장에 미치는 영향", content: "최근 금리 인상으로 인한 분양시장 변화를 정리했습니다.\n\n1. 청약 경쟁률 하락\n2. 분양가 협상 여지 증가\n3. 프로모션 혜택 확대\n\n현명한 청약 전략이 필요한 시기입니다." },
        { title: "청약 가점제 vs 추첨제 완벽 정리", content: "청약 방식별 차이점을 정리했습니다.\n\n가점제: 무주택기간, 부양가족수, 납입횟수로 점수 산정\n추첨제: 순수 추첨으로 당첨자 선정\n\n지역별, 주택형별로 적용 비율이 다르니 확인 필수!" },
        { title: "모델하우스 효율적인 방문 팁", content: "모델하우스 방문시 꼭 확인해야 할 사항들:\n\n1. 실제 평면도와 모델하우스 차이점\n2. 유상옵션 항목과 가격\n3. 입주 예정일과 지연 가능성\n4. 주변 개발 계획" },
        { title: "분양권 전매 시 세금 계산법", content: "분양권 전매시 발생하는 세금을 정리했습니다.\n\n양도소득세: 6~45%\n취득세: 전매차익의 3%\n\n보유기간과 실거주 여부에 따라 달라집니다." }
    ],
    review: [
        { title: "힐스테이트 ○○ 청약 후기", content: "어제 힐스테이트 ○○ 청약 넣고 왔습니다.\n\n경쟁률이 생각보다 높지 않아서 기대해봅니다.\n84A타입 넣었는데 가점 75점입니다.\n\n당첨되면 후기 올리겠습니다!" },
        { title: "래미안 ○○ 모델하우스 방문 후기", content: "주말에 래미안 ○○ 모델하우스 다녀왔습니다.\n\n장점:\n- 역세권 (도보 5분)\n- 학군 좋음\n- 마감재 고급\n\n단점:\n- 분양가 높음\n- 대로변 소음 우려" },
        { title: "청약 당첨 후 계약 과정 상세 후기", content: "드디어 청약 당첨되어 계약까지 완료했습니다!\n\n준비 서류:\n1. 신분증\n2. 인감도장\n3. 인감증명서\n4. 주민등록등본\n5. 계약금\n\n계약 당일 2시간 정도 소요되었습니다." },
        { title: "분양 상담사로 1년 일한 후기", content: "분양 상담사로 1년 일하면서 느낀점입니다.\n\n장점: 높은 인센티브, 전문성 향상\n단점: 주말 근무, 실적 압박\n\n이 일을 시작하려는 분들께 도움이 되길 바랍니다." },
        { title: "첫 분양 실패 후기와 교훈", content: "첫 분양 도전했다가 떨어졌습니다.\n\n실패 원인:\n1. 가점 부족 (45점)\n2. 경쟁률 과소평가\n3. 준비 부족\n\n다음엔 꼭 성공하겠습니다!" }
    ],
    general: [
        { title: "분양영업 10년차가 말하는 이 업계의 현실", content: "10년간 분양영업을 하면서 느낀 이 업계의 현실입니다.\n\n좋은 점:\n- 성과에 따른 높은 보상\n- 전문성 인정\n- 네트워크 확장\n\n힘든 점:\n- 불규칙한 근무\n- 실적 압박\n- 경기 민감" },
        { title: "부동산 시장 하락기 생존 전략", content: "시장이 어려울 때일수록 기본에 충실해야 합니다.\n\n1. 고객 신뢰 구축\n2. 정확한 정보 제공\n3. 장기적 관점 유지\n4. 지속적인 학습" },
        { title: "분양 현장에서 겪은 황당한 에피소드", content: "오늘 모델하우스에서 있었던 일입니다.\n\n고객님이 '발코니가 왜 이렇게 좁냐'고 하셔서\n확인해보니 신발장을 발코니로 착각하고 계셨어요 ㅋㅋ\n\n다들 이런 경험 있으신가요?" },
        { title: "영업 실적 올리는 나만의 노하우", content: "개인적으로 효과 봤던 방법들입니다.\n\n1. SNS 마케팅 활용\n2. 기존 고객 관리 철저\n3. 주말 오전 시간 활용\n4. 차별화된 상담 자료 준비" },
        { title: "이 일 하면서 가장 보람있었던 순간", content: "신혼부부 고객님이 청약 당첨되셨다고\n감사 인사하러 찾아오셨을 때가 가장 기억에 남습니다.\n\n'덕분에 내 집 마련의 꿈을 이뤘다'는 말씀에\n이 일의 보람을 느꼈습니다." }
    ],
    job: [
        { title: "[채용] 강남 신규 분양 현장 팀장급 모집", content: "대형 건설사 강남 신규 분양 현장에서 팀장급을 모집합니다.\n\n자격요건:\n- 경력 5년 이상\n- 팀 관리 경험\n- 우수한 실적\n\n대우:\n- 연봉 협의\n- 인센티브 별도\n- 4대보험\n\n지원: hr@example.com" },
        { title: "[구직] 분양 상담 경력 3년차 구직중", content: "분양 상담 경력 3년차입니다.\n\n- 서울/경기 지역 희망\n- 즉시 출근 가능\n- 운전면허 보유\n- 컴퓨터 활용 능숙\n\n연락주세요: 010-XXXX-XXXX" },
        { title: "[급구] 주말 모델하우스 도우미 구합니다", content: "이번 주말 모델하우스 도우미 급구합니다.\n\n- 날짜: 1/27-28 (토일)\n- 시간: 10:00-18:00\n- 일당: 12만원\n- 장소: 송파구\n\n경험 없어도 가능합니다." },
        { title: "분양대행사 신입사원 채용 공고", content: "함께 성장할 신입사원을 모집합니다.\n\n담당업무:\n- 모델하우스 상담\n- 고객 관리\n- 마케팅 지원\n\n우대사항:\n- 관련 자격증\n- 부동산 관심자" },
        { title: "[프리랜서] 분양 마케터 모집", content: "프리랜서 분양 마케터를 모집합니다.\n\n- 온라인 마케팅\n- 고객 모객\n- 건당 수수료\n\n자유로운 근무 환경에서 일하실 분 환영합니다." }
    ]
};

// 댓글 템플릿
const commentTemplates = [
    "좋은 정보 감사합니다!",
    "저도 같은 고민이 있었는데 도움이 되네요.",
    "자세한 설명 감사드립니다.",
    "이런 정보 정말 필요했어요!",
    "경험 공유 감사합니다.",
    "저도 비슷한 경험이 있습니다.",
    "추가로 질문드려도 될까요?",
    "정말 유용한 팁이네요!",
    "북마크 해두고 참고하겠습니다.",
    "다음에도 좋은 정보 부탁드려요.",
    "와 이런 꿀팁이!",
    "역시 고수님이시네요.",
    "초보인데 많이 배웠습니다.",
    "현업자의 조언 감사합니다.",
    "이제 이해가 되네요!"
];

// 랜덤 날짜 생성 함수
function getRandomDate(daysAgo = 30) {
    const now = new Date();
    const past = new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
    
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return `${past.getMonth() + 1}/${past.getDate()}`;
}

// 게시글 생성 함수
export function generateForumPosts(count = 200) {
    const posts = [];
    const categories = Object.keys(postTemplates);
    let postNumber = 2500;
    
    for (let i = 0; i < count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const template = postTemplates[category][Math.floor(Math.random() * postTemplates[category].length)];
        const author = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const isNew = Math.random() > 0.8;
        
        posts.push({
            id: 1000 + i,
            number: postNumber--,
            category: category,
            categoryName: getCategoryName(category),
            title: template.title,
            content: template.content,
            author: author.nickname,
            authorId: author.id,
            date: getRandomDate(isNew ? 1 : 30),
            views: Math.floor(Math.random() * 3000) + 10,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50),
            isNew: isNew
        });
    }
    
    return posts;
}

// 카테고리 이름 변환
function getCategoryName(category) {
    const names = {
        general: '일반',
        question: '질문',
        info: '정보공유',
        review: '후기',
        job: '구인구직'
    };
    return names[category] || '일반';
}

// 댓글 생성 함수
export function generateComments(postId, count = null) {
    const commentCount = count || Math.floor(Math.random() * 15) + 1;
    const comments = [];
    
    for (let i = 0; i < commentCount; i++) {
        const author = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        comments.push({
            id: `${postId}-${i}`,
            postId: postId,
            author: author.nickname,
            authorId: author.id,
            content: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
            date: getRandomDate(7),
            likes: Math.floor(Math.random() * 30)
        });
    }
    
    return comments;
}

// 인기 게시글 선택 함수
export function getPopularPosts(posts, count = 6) {
    return [...posts]
        .sort((a, b) => (b.views + b.likes * 10 + b.comments * 5) - (a.views + a.likes * 10 + a.comments * 5))
        .slice(0, count);
}