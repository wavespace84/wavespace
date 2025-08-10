// humor-enhanced.js - 50개 테스트 계정이 활동하는 유머 게시판

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

// 유머 게시글 템플릿
const humorTemplates = {
    daily: [
        {
            title: "오늘 모델하우스에서 있었던 황당한 일",
            content: "고객님이 '이 집 발코니가 왜 이렇게 좁냐'고 하셔서 확인해보니... 신발장을 발코니로 착각하고 계셨습니다 ㅋㅋㅋ",
            image: null
        },
        {
            title: "영업사원의 하루를 4컷만화로",
            content: "1. 아침: 희망찬 출근\n2. 오전: 고객 전화 폭탄\n3. 오후: 계약 취소 통보\n4. 저녁: 치킨과 함께 눈물의 퇴근",
            image: "🖼️"
        },
        {
            title: "청약 떨어지고 받은 위로",
            content: "친구: '괜찮아, 다음에 또 기회가 있잖아'\n나: '그래... 30년 뒤에...'",
            image: null
        },
        {
            title: "모델하우스 상담사 현실",
            content: "고객: '평수가 어떻게 되나요?'\n나: '84제곱미터입니다'\n고객: '아니 평수로 말해요'\n나: (속으로) '불법인데...' (겉으로) '25평형입니다 ^^'",
            image: null
        },
        {
            title: "분양 현장 웃픈 에피소드",
            content: "고객님이 '여기 학군이 어떻게 되냐'고 물어보셔서 열심히 설명했더니... '아 저는 자녀가 없어서요' ...그럼 왜 물어보신거죠?",
            image: null
        }
    ],
    estate: [
        {
            title: "부동산 용어 진짜 의미",
            content: "역세권 = 역에서 뛰어가면 10분\n숲세권 = 나무 한 그루\n초품아 = 초등학교만 가까움\n더블역세권 = 두 역 사이 애매한 위치",
            image: null
        },
        {
            title: "청약통장 vs 나",
            content: "청약통장: 10년째 묵묵히 기다림\n나: 10년째 묵묵히 떨어짐\n\n우리는 천생연분인가봐요...",
            image: "📊"
        },
        {
            title: "분양가 보고 놀란 고객 반응 모음",
            content: "1단계: '네? 얼마라고요?'\n2단계: '아... 평당 말고 총 가격이죠?'\n3단계: '아... 네... 다음에 올게요'\n4단계: (영영 안옴)",
            image: null
        },
        {
            title: "전세 VS 월세 고민하는 나",
            content: "전세: 목돈이 없어서 못함\n월세: 월급이 적어서 못함\n결론: 부모님 집 최고",
            image: null
        },
        {
            title: "집값 떨어지길 기다리는 사람들",
            content: "2020년: '조금만 더 떨어지면 산다'\n2021년: '이제 곧 떨어질거야'\n2022년: '버블이야 조금만 기다려'\n2023년: '...'\n2024년: '부모님 도움 받아야겠다'",
            image: null
        }
    ],
    meme: [
        {
            title: "분양 영업사원 스타터팩",
            content: "✓ 명함 5000장\n✓ 가죽 서류가방\n✓ 타이레놀 (두통약)\n✓ 위장약\n✓ 무한 긍정 마인드\n✓ 철면피",
            image: "🎒"
        },
        {
            title: "고객 유형별 대처법",
            content: "1. 깐깐한 고객 → 디테일로 승부\n2. 우유부단 고객 → 인내심으로 승부\n3. 가격만 묻는 고객 → 포기\n4. 투자자 → VIP 대접\n5. 신혼부부 → 감성 어필",
            image: null
        },
        {
            title: "청약 당첨 확률 체감",
            content: "로또 1등: 불가능\n청약 당첨: 불가능\n\n그런데 왜 로또는 매주 당첨자가 나오고 청약은...",
            image: "🎰"
        },
        {
            title: "모델하우스 오픈 첫날 풍경",
            content: "06:00 - 줄서기 시작\n08:00 - 인산인해\n09:00 - 오픈\n09:01 - 전쟁\n09:30 - 품절\n10:00 - 허탈",
            image: null
        },
        {
            title: "분양 상담사 레벨업 과정",
            content: "Lv.1 신입: 모든 고객이 계약할 것 같음\nLv.10 초보: 현실 자각\nLv.30 중수: 고객 필터링 능력 습득\nLv.50 고수: 표정 관리의 달인\nLv.99 만렙: 부처님의 경지",
            image: "🎮"
        }
    ],
    satire: [
        {
            title: "2024년 부동산 시장 예측 (정확도 100%)",
            content: "전문가 A: 오를 겁니다\n전문가 B: 내릴 겁니다\n전문가 C: 횡보할 겁니다\n\n결론: 누군가는 맞습니다",
            image: "📈"
        },
        {
            title: "청약 광고 번역기",
            content: "'역세권' = 버스 타고 20분\n'숲세권' = 뒷산\n'한강조망' = 발코니에서 까치발\n'대단지' = 주차 전쟁\n'프리미엄' = 비쌈",
            image: null
        },
        {
            title: "부동산 뉴스 제목 생성기",
            content: "1. [단독] OO지역 집값 [오른다/내린다]\n2. 전문가 'OO 지역 [유망/위험]'\n3. 정부, OO 대책 [검토/발표]\n\n이 조합으로 1년치 뉴스 완성",
            image: null
        },
        {
            title: "내 연봉으로 살 수 있는 집",
            content: "서울: 안방 화장실\n경기: 원룸 보증금\n지방: 오피스텔 전세\n시골: 폐가\n\n현실은 시궁창",
            image: null
        },
        {
            title: "분양 현장 금기어 모음",
            content: "1. '평수로 말해주세요'\n2. '분양가 너무 비싼데요'\n3. '거품 아닌가요?'\n4. '나중에 떨어지면 사죠'\n5. '중개수수료 깎아주세요'",
            image: null
        }
    ],
    story: [
        {
            title: "신입 시절 최악의 실수",
            content: "첫 계약을 앞두고 너무 긴장한 나머지... 고객님 성함을 계약서에 반대로 적었습니다. '김철수'님을 '수철김'으로... 다시는 안 그럴게요 ㅠㅠ",
            image: null
        },
        {
            title: "감동적인 고객 이야기",
            content: "10년 동안 청약 떨어지신 고객님이 드디어 당첨되셨을 때, 저한테 전화하셔서 우시더라고요. '덕분입니다'라고... 저도 같이 울었습니다.",
            image: "😭"
        },
        {
            title: "역대급 진상 고객",
            content: "모델하우스 관람 3시간, 질문 100개, 자료 요청 50개... 그리고 마지막 한마디 '그냥 구경 왔어요' ... 미소는 유지했지만 속은 무너졌습니다.",
            image: null
        },
        {
            title: "첫 계약 성공 스토리",
            content: "6개월간 한 건도 못하고 있다가... 포기하려던 날 걸려온 전화 한 통. '그때 상담받은 사람인데 계약하고 싶어요' 그날 치킨 10마리 쏘았습니다!",
            image: "🍗"
        },
        {
            title: "가장 기억에 남는 실수",
            content: "프레젠테이션 중에 '이 지역은 앞으로 발전 가능성이 없습니다'라고 말했어야 하는데 '많습니다'를 빼먹었어요... 다행히 고객님들이 웃어주셨지만...",
            image: null
        }
    ],
    tip: [
        {
            title: "고객 마음 사로잡는 멘트 TOP 5",
            content: "1. '특별히 모시고 싶은 분이세요'\n2. '딱 맞는 매물이 나왔어요'\n3. '이런 기회는 흔치 않아요'\n4. '제가 살고 싶은 집이에요'\n5. '다른 분도 관심 있어 하세요'",
            image: null
        },
        {
            title: "청약 떨어졌을 때 위로법",
            content: "❌ '다음에는 될 거예요' (거짓말)\n❌ '경쟁이 원래 치열해요' (알아요)\n✅ '같이 술이나 한잔해요' (최고)\n✅ '치킨 사드릴게요' (감동)",
            image: "🍺"
        },
        {
            title: "모델하우스 생존 꿀팁",
            content: "1. 편한 신발 필수 (하루 10km 걷기)\n2. 목캔디 상비 (하루 1000마디)\n3. 손소독제 필수 (악수 500번)\n4. 비상 간식 준비 (끼니 거르기 일상)\n5. 멘탈 관리법 숙지 (필수)",
            image: null
        },
        {
            title: "계약 취소 막는 화법",
            content: "'한 번 더 생각해보시죠' → 20% 성공\n'위약금이 아깝지 않으세요?' → 40% 성공\n'다른 분이 대기 중이세요' → 60% 성공\n'제가 특별히 혜택 알아볼게요' → 80% 성공",
            image: null
        },
        {
            title: "실적 올리는 현실적인 조언",
            content: "이론: 열심히 하면 된다\n현실: 1. 발품 2. 인맥 3. 운 4. 타이밍 5. 그리고 열정\n\n결론: 다 필요함",
            image: "💪"
        }
    ]
};

// 게시글 생성 함수
function generateHumorPosts() {
    const posts = [];
    const categories = Object.keys(humorTemplates);
    let postId = 1;
    
    // 각 카테고리별로 게시글 생성
    categories.forEach(category => {
        const templates = humorTemplates[category];
        
        // 각 템플릿마다 3-5개의 변형 생성
        templates.forEach(template => {
            const variations = Math.floor(Math.random() * 3) + 3;
            
            for (let i = 0; i < variations; i++) {
                const authorIdx = Math.floor(Math.random() * 50);
                const hoursAgo = Math.random() * 720; // 30일 이내
                const isNew = hoursAgo < 24;
                const isHot = Math.random() > 0.7;
                
                let timeStr;
                if (hoursAgo < 1) {
                    timeStr = `${Math.floor(hoursAgo * 60)}분 전`;
                } else if (hoursAgo < 24) {
                    timeStr = `${Math.floor(hoursAgo)}시간 전`;
                } else if (hoursAgo < 168) {
                    timeStr = `${Math.floor(hoursAgo / 24)}일 전`;
                } else {
                    const date = new Date();
                    date.setHours(date.getHours() - hoursAgo);
                    timeStr = `${date.getMonth() + 1}/${date.getDate()}`;
                }
                
                // 제목 변형
                let title = template.title;
                if (i > 0) {
                    title = title + ` (${i + 1}탄)`;
                }
                
                posts.push({
                    id: postId++,
                    category: category,
                    title: title,
                    excerpt: template.content.substring(0, 100) + '...',
                    content: template.content,
                    author: nicknames[authorIdx],
                    authorName: users[authorIdx],
                    time: timeStr,
                    views: Math.floor(Math.random() * 5000) + 100,
                    likes: Math.floor(Math.random() * 500) + 10,
                    comments: Math.floor(Math.random() * 100) + 5,
                    hasImage: template.image !== null,
                    imageIcon: template.image || null,
                    isNew: isNew,
                    isHot: isHot
                });
            }
        });
    });
    
    // 정렬 (최신순 + 인기순 혼합)
    return posts.sort((a, b) => {
        if (a.isHot !== b.isHot) return b.isHot - a.isHot;
        if (a.isNew !== b.isNew) return b.isNew - a.isNew;
        return b.id - a.id;
    });
}

// 댓글 생성 함수
function generateComments(postId, count) {
    const comments = [];
    const templates = [
        "ㅋㅋㅋㅋㅋ 진짜 웃기네요",
        "저도 똑같은 경험 있어요 ㅠㅠ",
        "이게 현실이죠...",
        "웃픈 현실이네요",
        "공감 100% 입니다",
        "저만 그런게 아니었군요",
        "눈물 나네요 ㅋㅋㅋ",
        "팩트폭격 ㄷㄷ",
        "이건 저장해둬야겠어요",
        "친구한테 공유했어요 ㅋㅋ"
    ];
    
    for (let i = 0; i < count; i++) {
        const authorIdx = Math.floor(Math.random() * 50);
        comments.push({
            id: `${postId}-${i}`,
            author: nicknames[authorIdx],
            content: templates[Math.floor(Math.random() * templates.length)],
            time: `${Math.floor(Math.random() * 24)}시간 전`,
            likes: Math.floor(Math.random() * 50)
        });
    }
    
    return comments;
}

// 전체 게시글 데이터
const allPosts = generateHumorPosts();
let filteredPosts = [...allPosts];
let currentCategory = 'all';
let currentView = 'grid';
let currentPage = 1;
const postsPerPage = 12;

// 디버그 로그
console.log(`humor-enhanced.js 로드 완료: ${allPosts.length}개 게시글 생성됨`);

// 게시글 필터링
function filterPosts(category) {
    console.log('필터링 카테고리:', category);
    currentCategory = category;
    
    if (category === 'all') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => post.category === category);
    }
    
    currentPage = 1;
    renderPosts();
}

// 게시글 렌더링
function renderPosts() {
    // 동적 콘텐츠 생성을 비활성화하고 기존 정적 콘텐츠 유지
    // 필터링 기능만 동작하도록 수정
    const container = document.querySelector('.humor-grid.posts-grid');
    if (!container) return;
    
    // 기존 정적 아이템들을 필터링
    const allItems = container.querySelectorAll('.humor-item, .post-item');
    allItems.forEach(item => {
        if (currentCategory === 'all') {
            item.style.display = '';
        } else {
            const itemCategory = item.dataset.category || 'all';
            item.style.display = itemCategory === currentCategory ? '' : 'none';
        }
    });
    
    return; // 동적 렌더링 중단
    
    // 아래 코드는 실행되지 않음 (기존 코드 보존)
    const startIdx = (currentPage - 1) * postsPerPage;
    const endIdx = startIdx + postsPerPage;
    const pagePosts = filteredPosts.slice(startIdx, endIdx);
    
    if (currentView === 'grid') {
        container.innerHTML = pagePosts.map(post => `
            <div class="post-card" data-id="${post.id}">
                ${post.isHot ? '<span class="badge hot">HOT</span>' : ''}
                ${post.isNew ? '<span class="badge new">NEW</span>' : ''}
                <div class="post-thumbnail">
                    ${post.hasImage ? `<span class="image-icon">${post.imageIcon}</span>` : '<i class="fas fa-laugh"></i>'}
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span class="author"><i class="fas fa-user"></i> ${post.author}</span>
                    <span class="time"><i class="fas fa-clock"></i> ${post.time}</span>
                </div>
                <div class="post-stats">
                    <span><i class="fas fa-eye"></i> ${post.views.toLocaleString()}</span>
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments}</span>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = pagePosts.map(post => `
            <div class="post-item" data-id="${post.id}">
                <div class="post-number">${post.id}</div>
                <div class="post-content">
                    <div class="post-header">
                        ${post.isHot ? '<span class="badge hot">HOT</span>' : ''}
                        ${post.isNew ? '<span class="badge new">NEW</span>' : ''}
                        ${post.hasImage ? '<i class="fas fa-image"></i>' : ''}
                        <h3 class="post-title">${post.title}</h3>
                    </div>
                    <div class="post-info">
                        <span class="author">${post.author}</span>
                        <span class="time">${post.time}</span>
                        <span class="stats">
                            <i class="fas fa-eye"></i> ${post.views.toLocaleString()}
                            <i class="fas fa-heart"></i> ${post.likes}
                            <i class="fas fa-comment"></i> ${post.comments}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // 클릭 이벤트 재등록
    document.querySelectorAll('.post-card, .post-item').forEach(item => {
        item.addEventListener('click', function() {
            const postId = parseInt(this.dataset.id);
            showPostDetail(postId);
        });
    });
}

// 게시글 상세 보기
function showPostDetail(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    const comments = generateComments(postId, post.comments > 10 ? 10 : post.comments);
    
    const modal = document.createElement('div');
    modal.className = 'post-detail-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePostDetail()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${post.title}</h2>
                <button class="close-btn" onclick="closePostDetail()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="post-detail-meta">
                    <span class="author"><i class="fas fa-user"></i> ${post.author}</span>
                    <span class="time"><i class="fas fa-clock"></i> ${post.time}</span>
                    <span class="views"><i class="fas fa-eye"></i> ${post.views.toLocaleString()}</span>
                </div>
                <div class="post-detail-content">
                    ${post.hasImage ? `<div class="post-image">${post.imageIcon}</div>` : ''}
                    <p>${post.content.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="post-actions">
                    <button class="action-btn like-btn">
                        <i class="fas fa-heart"></i> ${post.likes}
                    </button>
                    <button class="action-btn share-btn">
                        <i class="fas fa-share"></i> 공유
                    </button>
                    <button class="action-btn bookmark-btn">
                        <i class="fas fa-bookmark"></i> 저장
                    </button>
                </div>
                <div class="comments-section">
                    <h3>댓글 ${comments.length}개</h3>
                    <div class="comments-list">
                        ${comments.map(comment => `
                            <div class="comment-item">
                                <div class="comment-header">
                                    <span class="comment-author">${comment.author}</span>
                                    <span class="comment-time">${comment.time}</span>
                                </div>
                                <div class="comment-content">${comment.content}</div>
                                <button class="comment-like">
                                    <i class="fas fa-thumbs-up"></i> ${comment.likes}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="comment-write">
                        <textarea placeholder="댓글을 작성해주세요..." rows="3"></textarea>
                        <button class="submit-comment">댓글 작성</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// 모달 닫기
function closePostDetail() {
    const modal = document.querySelector('.post-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// 검색 기능
function performSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm) {
        filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.author.toLowerCase().includes(searchTerm)
        );
    } else {
        filteredPosts = currentCategory === 'all' ? [...allPosts] : 
            allPosts.filter(post => post.category === currentCategory);
    }
    
    currentPage = 1;
    renderPosts();
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', function() {
    console.log('humor-enhanced.js DOMContentLoaded 이벤트 발생');
    
    // 초기 렌더링 비활성화 (정적 콘텐츠 유지)
    // renderPosts();
    
    // 카테고리 탭 - checkbox-tab 스타일
    const categoryTabs = document.querySelectorAll('.checkbox-tab');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const sortSelect = document.querySelector('.sort-select');
    const viewBtns = document.querySelectorAll('.view-btn');
    const pageBtns = document.querySelectorAll('.page-btn:not(:disabled)');
    
    // 카테고리 탭 클릭 (checkbox-tab 스타일)
    categoryTabs.forEach(tab => {
        const input = tab.querySelector('input[type="radio"]');
        
        tab.addEventListener('click', function(e) {
            // 모든 탭에서 active 클래스 제거
            categoryTabs.forEach(t => {
                t.classList.remove('active');
                const tInput = t.querySelector('input[type="radio"]');
                if (tInput) tInput.checked = false;
            });
            // 클릭한 탭에 active 클래스 추가
            this.classList.add('active');
            if (input) input.checked = true;
            
            const category = this.dataset.category || 'all';
            filterPosts(category);
        });
    });
    
    // 검색 기능
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // 정렬 변경
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortType = this.value;
            if (sortType === 'popular') {
                filteredPosts.sort((a, b) => b.views - a.views);
            } else if (sortType === 'likes') {
                filteredPosts.sort((a, b) => b.likes - a.likes);
            } else {
                filteredPosts.sort((a, b) => b.id - a.id);
            }
            renderPosts();
        });
    }
    
    // 보기 모드 변경
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            currentView = view;
            
            document.querySelectorAll('.posts-grid, .posts-list').forEach(container => {
                container.style.display = 'none';
            });
            
            const targetContainer = document.querySelector('.posts-' + view);
            if (targetContainer) {
                targetContainer.style.display = view === 'grid' ? 'grid' : 'block';
                renderPosts();
            }
        });
    });
    
    // 페이지네이션
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = parseInt(this.textContent);
            if (!isNaN(page)) {
                currentPage = page;
                renderPosts();
                
                pageBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    console.log('이벤트 리스너 설정 완료');
    
    // 업로드 모달 관련 요소들
    const uploadBtn = document.getElementById('humorUploadBtn');
    const uploadModal = document.getElementById('humorUploadModal');
    const closeModalBtn = document.getElementById('closeUploadModal');
    const cancelUploadBtn = document.getElementById('cancelUpload');
    const uploadForm = document.getElementById('humorUploadForm');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const categoryOptions = document.querySelectorAll('.category-option');
    
    // 업로드할 파일들을 저장할 배열
    let uploadedFiles = [];
    
    // 플로팅 버튼 클릭 - 모달 열기
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            uploadModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // 모달 닫기 함수
    function closeUploadModal() {
        uploadModal.classList.remove('active');
        document.body.style.overflow = '';
        // 폼 초기화
        uploadForm.reset();
        uploadedFiles = [];
        uploadPreview.innerHTML = '';
        uploadPreview.classList.remove('active');
        // 카테고리 초기화
        categoryOptions.forEach(opt => opt.classList.remove('selected'));
        categoryOptions[0].classList.add('selected');
    }
    
    // 모달 닫기 버튼들
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeUploadModal);
    }
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', closeUploadModal);
    }
    
    // 모달 외부 클릭시 닫기
    if (uploadModal) {
        uploadModal.addEventListener('click', function(e) {
            if (e.target === uploadModal) {
                closeUploadModal();
            }
        });
    }
    
    // 카테고리 선택
    categoryOptions.forEach(option => {
        option.addEventListener('click', function() {
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // 파일 업로드 영역 클릭
    if (uploadArea) {
        uploadArea.addEventListener('click', function(e) {
            // 클릭 이벤트가 버블링되지 않도록 처리
            if (e.target === uploadArea || uploadArea.contains(e.target)) {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.click();
                }
            }
        });
        
        // 드래그 앤 드롭
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                handleFiles(files);
            }
        });
    }
    
    // 파일 선택 - fileInput을 DOM에서 다시 찾기
    const fileInputElement = document.getElementById('fileInput');
    if (fileInputElement) {
        fileInputElement.addEventListener('change', function(e) {
            if (this.files && this.files.length > 0) {
                handleFiles(this.files);
            }
        });
    }
    
    // 파일 처리 함수
    function handleFiles(files) {
        console.log('파일 처리 시작:', files);
        
        for (let file of files) {
            console.log('파일 정보:', file.name, file.type, file.size);
            
            // 파일 크기 체크 (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('파일 크기는 10MB를 초과할 수 없습니다.');
                continue;
            }
            
            // 파일 타입 체크
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                alert('이미지 또는 동영상 파일만 업로드 가능합니다.');
                continue;
            }
            
            uploadedFiles.push(file);
            addPreviewItem(file);
        }
        
        if (uploadedFiles.length > 0) {
            uploadPreview.classList.add('active');
            console.log('업로드된 파일 수:', uploadedFiles.length);
        }
    }
    
    // 미리보기 아이템 추가
    function addPreviewItem(file) {
        const item = document.createElement('div');
        item.className = 'upload-preview-item';
        
        const thumbnail = document.createElement('div');
        thumbnail.className = 'upload-preview-thumbnail';
        thumbnail.style.width = '60px';
        thumbnail.style.height = '60px';
        thumbnail.style.borderRadius = 'var(--radius-md)';
        thumbnail.style.overflow = 'hidden';
        thumbnail.style.background = 'var(--gray-100)';
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            thumbnail.appendChild(img);
        } else {
            thumbnail.innerHTML = '<i class="fas fa-video" style="font-size: 24px; color: var(--gray-500);"></i>';
            thumbnail.style.display = 'flex';
            thumbnail.style.alignItems = 'center';
            thumbnail.style.justifyContent = 'center';
        }
        
        const info = document.createElement('div');
        info.className = 'upload-preview-info';
        info.innerHTML = `
            <div class="upload-preview-name">${file.name}</div>
            <div class="upload-preview-size">${formatFileSize(file.size)}</div>
        `;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'upload-preview-remove';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = function() {
            const index = uploadedFiles.indexOf(file);
            if (index > -1) {
                uploadedFiles.splice(index, 1);
            }
            item.remove();
            if (uploadedFiles.length === 0) {
                uploadPreview.classList.remove('active');
            }
        };
        
        item.appendChild(thumbnail);
        item.appendChild(info);
        item.appendChild(removeBtn);
        uploadPreview.appendChild(item);
    }
    
    // 파일 크기 포맷
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // 폼 제출
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectedCategory = document.querySelector('.category-option.selected');
            const category = selectedCategory ? selectedCategory.dataset.category : 'meme';
            const title = document.getElementById('humorTitle').value;
            const content = document.getElementById('humorContent').value;
            const tags = document.getElementById('humorTags').value;
            
            // 유효성 검사
            if (!title.trim()) {
                alert('제목을 입력해주세요.');
                return;
            }
            
            // 새 게시글 데이터 생성
            const newPost = {
                category: category,
                title: title,
                content: content || '',
                author: '나',
                time: '방금 전',
                views: 0,
                likes: 0,
                comments: 0,
                isNew: true,
                hasImage: uploadedFiles.length > 0,
                files: uploadedFiles
            };
            
            // 게시글을 맨 앞에 추가 (DOM에 직접 추가)
            addNewPostToDOM(newPost);
            
            // 성공 메시지
            alert('유머 콘텐츠가 성공적으로 업로드되었습니다!');
            
            // 모달 닫기
            closeUploadModal();
        });
    }
    
    // 새 게시글을 DOM에 추가하는 함수
    function addNewPostToDOM(post) {
        const postsGrid = document.querySelector('.posts-grid') || document.querySelector('.humor-grid');
        if (!postsGrid) return;
        
        // 아이콘 매핑
        const categoryIcons = {
            'meme': 'fa-image',
            'story': 'fa-book-open',
            'video': 'fa-video',
            'cartoon': 'fa-pencil-ruler'
        };
        
        // 새 게시글 HTML 생성
        const postHTML = `
            <div class="humor-item post-item" data-category="${post.category}">
                <div class="humor-thumbnail">
                    ${post.hasImage && post.files.length > 0 ? 
                        `<img src="${URL.createObjectURL(post.files[0])}" alt="썸네일">` : 
                        '<img src="" alt="썸네일">'}
                    <div class="thumbnail-type">
                        <i class="fas ${categoryIcons[post.category] || 'fa-image'}"></i>
                    </div>
                </div>
                <div class="humor-content" ${post.category === 'story' ? 'data-type="story"' : ''}>
                    <h3 class="humor-item-title">
                        <a href="#">${post.title}</a>
                        <span class="new-badge">NEW</span>
                    </h3>
                    <div class="humor-meta">
                        <span class="author"><i class="fas fa-user-circle"></i> ${post.author}</span>
                        <span class="time"><i class="fas fa-clock"></i> ${post.time}</span>
                    </div>
                    <div class="humor-stats">
                        <span class="views"><i class="fas fa-eye"></i> ${post.views}</span>
                        <span class="likes"><i class="fas fa-heart"></i> ${post.likes}</span>
                        <span class="comments"><i class="fas fa-comment"></i> ${post.comments}</span>
                    </div>
                </div>
            </div>
        `;
        
        // 첫 번째 게시글로 추가
        const firstPost = postsGrid.querySelector('.humor-item, .post-item');
        if (firstPost) {
            firstPost.insertAdjacentHTML('beforebegin', postHTML);
        } else {
            postsGrid.innerHTML = postHTML;
        }
    }
    
    // 게시글 상세보기 기능
    const postDetailModal = document.getElementById('postDetailModal');
    const closeDetailModal = document.getElementById('closeDetailModal');
    const prevPostBtn = document.getElementById('prevPost');
    const nextPostBtn = document.getElementById('nextPost');
    
    let currentPostIndex = 0;
    let postsArray = [];
    
    // 게시글 데이터 수집
    function collectPostsData() {
        const posts = document.querySelectorAll('.humor-item, .post-item');
        postsArray = Array.from(posts).map((post, index) => {
            const titleElement = post.querySelector('.humor-item-title a, h3 a');
            const authorElement = post.querySelector('.humor-meta .author, .author');
            const timeElement = post.querySelector('.humor-meta .time, .time');
            const viewsElement = post.querySelector('.humor-stats .views, .views');
            const likesElement = post.querySelector('.humor-stats .likes, .likes');
            const commentsElement = post.querySelector('.humor-stats .comments, .comments');
            const imageElement = post.querySelector('.humor-thumbnail img');
            
            return {
                index: index,
                element: post,
                title: titleElement ? titleElement.textContent.trim() : '',
                author: authorElement ? authorElement.textContent.trim() : '',
                time: timeElement ? timeElement.textContent.trim() : '',
                views: viewsElement ? viewsElement.textContent.trim() : '0',
                likes: likesElement ? likesElement.textContent.trim() : '0',
                comments: commentsElement ? commentsElement.textContent.trim() : '0',
                image: imageElement ? imageElement.src : '',
                content: `이것은 "${titleElement ? titleElement.textContent.trim() : ''}"의 상세 내용입니다.\n\n실제 서비스에서는 서버에서 게시글의 전체 내용을 가져와 표시합니다.\n\n재미있는 부동산 관련 유머 콘텐츠가 여기에 표시됩니다!`
            };
        });
    }
    
    // 게시글 상세보기 열기
    function openPostDetail(index) {
        if (!postsArray.length) {
            collectPostsData();
        }
        
        if (index < 0 || index >= postsArray.length) return;
        
        currentPostIndex = index;
        const post = postsArray[index];
        
        // 데이터 채우기
        document.getElementById('postDetailTitle').textContent = post.title;
        document.getElementById('postDetailAuthor').textContent = post.author;
        document.getElementById('postDetailTime').textContent = post.time;
        document.getElementById('postDetailContent').textContent = post.content;
        document.getElementById('postDetailLikes').textContent = post.likes.replace(/[^\d]/g, '');
        document.getElementById('postDetailComments').textContent = post.comments.replace(/[^\d]/g, '');
        document.getElementById('commentCount').textContent = post.comments.replace(/[^\d]/g, '');
        
        // 이미지 처리
        const mediaContainer = document.getElementById('postDetailMedia');
        const detailImage = document.getElementById('postDetailImage');
        
        if (post.image && !post.image.includes('placeholder') && post.image !== '') {
            detailImage.src = post.image;
            detailImage.style.display = 'block';
            mediaContainer.style.display = 'flex';
        } else {
            // placeholder 이미지 표시
            mediaContainer.style.display = 'flex';
            mediaContainer.style.background = 'linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%)';
            detailImage.style.display = 'none';
            
            // Font Awesome 아이콘 추가
            let placeholderIcon = mediaContainer.querySelector('.placeholder-icon');
            if (!placeholderIcon) {
                placeholderIcon = document.createElement('div');
                placeholderIcon.className = 'placeholder-icon';
                placeholderIcon.innerHTML = '<i class="fas fa-image" style="font-size: 72px; color: var(--gray-400); opacity: 0.5;"></i>';
                mediaContainer.appendChild(placeholderIcon);
            }
        }
        
        // 네비게이션 버튼 상태 업데이트
        prevPostBtn.disabled = currentPostIndex === 0;
        nextPostBtn.disabled = currentPostIndex === postsArray.length - 1;
        
        // 모달 열기
        postDetailModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 샘플 댓글 추가
        loadComments();
    }
    
    // 댓글 로드
    function loadComments() {
        const commentsList = document.getElementById('commentsList');
        const sampleComments = [
            { author: '부동산매니아', text: 'ㅋㅋㅋㅋ 진짜 웃기네요!', time: '30분 전' },
            { author: '청약전문가', text: '저도 똑같은 경험 있어요 ㅠㅠ', time: '1시간 전' },
            { author: '분양왕', text: '공감 100% 입니다', time: '2시간 전' }
        ];
        
        commentsList.innerHTML = sampleComments.map(comment => `
            <div class="comment-item">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-time">${comment.time}</div>
            </div>
        `).join('');
    }
    
    // 게시글 클릭 이벤트
    document.addEventListener('click', function(e) {
        const postItem = e.target.closest('.humor-item, .post-item');
        if (postItem && !e.target.closest('.floating-upload-btn') && !e.target.closest('.upload-modal')) {
            e.preventDefault();
            collectPostsData();
            const index = postsArray.findIndex(p => p.element === postItem);
            if (index !== -1) {
                openPostDetail(index);
            }
        }
    });
    
    // 이전/다음 버튼
    if (prevPostBtn) {
        prevPostBtn.addEventListener('click', function() {
            if (currentPostIndex > 0) {
                openPostDetail(currentPostIndex - 1);
            }
        });
    }
    
    if (nextPostBtn) {
        nextPostBtn.addEventListener('click', function() {
            if (currentPostIndex < postsArray.length - 1) {
                openPostDetail(currentPostIndex + 1);
            }
        });
    }
    
    // 모달 닫기
    if (closeDetailModal) {
        closeDetailModal.addEventListener('click', function() {
            postDetailModal.classList.remove('active');
            document.body.style.overflow = '';
            
            // placeholder 아이콘 제거
            const placeholderIcon = document.querySelector('.placeholder-icon');
            if (placeholderIcon) {
                placeholderIcon.remove();
            }
        });
    }
    
    // ESC 키로 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && postDetailModal && postDetailModal.classList.contains('active')) {
            postDetailModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // 좌우 화살표로 네비게이션
        if (postDetailModal && postDetailModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft' && currentPostIndex > 0) {
                openPostDetail(currentPostIndex - 1);
            } else if (e.key === 'ArrowRight' && currentPostIndex < postsArray.length - 1) {
                openPostDetail(currentPostIndex + 1);
            }
        }
    });
    
    // 좋아요 버튼
    const likeBtn = document.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            const likesSpan = document.getElementById('postDetailLikes');
            const currentLikes = parseInt(likesSpan.textContent);
            likesSpan.textContent = this.classList.contains('active') ? currentLikes + 1 : currentLikes - 1;
        });
    }
    
    // 북마크 버튼
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }
    
    // 댓글 작성
    const commentSubmit = document.querySelector('.comment-submit');
    if (commentSubmit) {
        commentSubmit.addEventListener('click', function() {
            const input = document.querySelector('.comment-input');
            if (input && input.value.trim()) {
                const commentsList = document.getElementById('commentsList');
                const newComment = document.createElement('div');
                newComment.className = 'comment-item';
                newComment.innerHTML = `
                    <div class="comment-author">나</div>
                    <div class="comment-text">${input.value}</div>
                    <div class="comment-time">방금 전</div>
                `;
                commentsList.insertBefore(newComment, commentsList.firstChild);
                input.value = '';
                
                // 댓글 수 업데이트
                const commentCount = document.getElementById('commentCount');
                const postDetailComments = document.getElementById('postDetailComments');
                const currentCount = parseInt(commentCount.textContent);
                commentCount.textContent = currentCount + 1;
                postDetailComments.textContent = currentCount + 1;
            }
        });
    }
    
    // 엔터키로 댓글 작성
    const commentInput = document.querySelector('.comment-input');
    if (commentInput) {
        commentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const submitBtn = document.querySelector('.comment-submit');
                if (submitBtn) submitBtn.click();
            }
        });
    }
});