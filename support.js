// FAQ 데이터
const faqData = [
    {
        id: 1,
        category: 'account',
        question: '회원가입은 어떻게 하나요?',
        answer: 'WAVE SPACE 홈페이지 우측 상단의 "회원가입" 버튼을 클릭하여 가입할 수 있습니다. 이메일 인증 후 간단한 정보를 입력하면 가입이 완료됩니다. 신규 가입 시 3,000P의 웰컴 포인트가 지급됩니다.'
    },
    {
        id: 2,
        category: 'account',
        question: '비밀번호를 잊어버렸어요',
        answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하세요. 가입 시 사용한 이메일 주소를 입력하면 비밀번호 재설정 링크가 발송됩니다. 메일이 오지 않는다면 스팸함을 확인해주세요.'
    },
    {
        id: 3,
        category: 'point',
        question: '포인트는 어떻게 충전하나요?',
        answer: '마이페이지 > 포인트 > 충전하기 메뉴에서 충전할 수 있습니다. 신용카드, 계좌이체, 간편결제 등 다양한 결제 수단을 지원합니다. 충전 금액에 따라 추가 보너스 포인트가 지급됩니다.'
    },
    {
        id: 4,
        category: 'point',
        question: '포인트 유효기간이 있나요?',
        answer: '포인트 유효기간은 충전일로부터 1년입니다. 만료 30일 전에 이메일과 알림으로 안내드립니다. Plus 멤버십 회원은 포인트 유효기간이 2년으로 연장됩니다.'
    },
    {
        id: 5,
        category: 'content',
        question: '자료를 다운로드할 수 없어요',
        answer: '자료 다운로드를 위해서는 해당 자료에 필요한 포인트가 충분해야 합니다. 포인트가 부족한 경우 충전 후 이용해주세요. 또한 일부 자료는 Plus 멤버십 회원만 이용 가능합니다.'
    },
    {
        id: 6,
        category: 'content',
        question: '게시글 작성 시 주의사항이 있나요?',
        answer: '커뮤니티 가이드라인을 준수해주세요. 욕설, 비방, 광고성 글은 삭제될 수 있으며, 반복 위반 시 이용이 제한될 수 있습니다. 분양 관련 정보는 출처를 명확히 기재해주세요.'
    },
    {
        id: 7,
        category: 'membership',
        question: 'Plus 멤버십 혜택은 무엇인가요?',
        answer: 'Plus 멤버십 회원은 프리미엄 자료 무제한 다운로드, 포인트 2배 적립, AI 보고서 생성 무제한, 전용 배지 제공, 우선 고객지원 등의 혜택을 받을 수 있습니다.'
    },
    {
        id: 8,
        category: 'membership',
        question: '멤버십 결제는 어떻게 하나요?',
        answer: '마이페이지 > Plus 멤버십 메뉴에서 가입할 수 있습니다. 월간/연간 요금제를 선택할 수 있으며, 연간 결제 시 2개월 무료 혜택이 제공됩니다.'
    },
    {
        id: 9,
        category: 'etc',
        question: '탈퇴는 어떻게 하나요?',
        answer: '마이페이지 > 설정 > 회원탈퇴 메뉴에서 탈퇴할 수 있습니다. 탈퇴 시 보유 포인트와 작성한 게시글은 모두 삭제되며, 동일 이메일로 30일간 재가입이 제한됩니다.'
    },
    {
        id: 10,
        category: 'etc',
        question: '모바일 앱은 없나요?',
        answer: 'iOS와 Android 앱을 제공하고 있습니다. App Store 또는 Google Play에서 "WAVE SPACE"를 검색하여 다운로드할 수 있습니다. 웹과 동일한 계정으로 로그인 가능합니다.'
    }
];

// DOM 요소
const faqList = document.getElementById('faqList');
const categoryBtns = document.querySelectorAll('.faq-category-btn');
const searchInput = document.getElementById('supportSearchInput');
const keywordTags = document.querySelectorAll('.keyword-tag');

// 현재 선택된 카테고리
let currentCategory = 'all';

// FAQ 렌더링
function renderFAQ(category = 'all', searchTerm = '') {
    let filteredFAQ = faqData;
    
    // 카테고리 필터링
    if (category !== 'all') {
        filteredFAQ = filteredFAQ.filter(item => item.category === category);
    }
    
    // 검색어 필터링
    if (searchTerm) {
        filteredFAQ = filteredFAQ.filter(item => 
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // FAQ 리스트 렌더링
    faqList.innerHTML = '';
    
    if (filteredFAQ.length === 0) {
        faqList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-500);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 16px;">검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    filteredFAQ.forEach((item, index) => {
        const faqItem = createFAQItem(item);
        // 애니메이션 효과
        setTimeout(() => {
            faqItem.style.opacity = '1';
            faqItem.style.transform = 'translateY(0)';
        }, index * 50);
        faqList.appendChild(faqItem);
    });
}

// FAQ 아이템 생성
function createFAQItem(item) {
    const div = document.createElement('div');
    div.className = 'faq-item';
    div.style.opacity = '0';
    div.style.transform = 'translateY(20px)';
    div.style.transition = 'all 0.3s ease';
    
    // 카테고리 한글 변환
    const categoryNames = {
        account: '계정관리',
        point: '포인트',
        content: '콘텐츠',
        membership: '멤버십',
        etc: '기타'
    };
    
    div.innerHTML = `
        <button class="faq-question">
            <div class="faq-question-text">
                <span class="faq-badge">${categoryNames[item.category]}</span>
                <span>${item.question}</span>
            </div>
            <i class="fas fa-chevron-down faq-arrow"></i>
        </button>
        <div class="faq-answer">
            ${item.answer}
        </div>
    `;
    
    // 클릭 이벤트
    const questionBtn = div.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
        div.classList.toggle('active');
    });
    
    return div;
}

// 카테고리 버튼 이벤트
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 활성 버튼 변경
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // FAQ 필터링
        currentCategory = btn.dataset.category;
        renderFAQ(currentCategory, searchInput.value);
    });
});

// 검색 기능
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        renderFAQ(currentCategory, e.target.value);
    }, 300);
});

// 키워드 태그 클릭
keywordTags.forEach(tag => {
    tag.addEventListener('click', () => {
        searchInput.value = tag.textContent;
        renderFAQ(currentCategory, tag.textContent);
    });
});

// 채팅 버튼
const chatBtn = document.querySelector('.chat-btn');
if (chatBtn) {
    chatBtn.addEventListener('click', () => {
        alert('채팅 상담 기능은 준비 중입니다. 이메일이나 전화로 문의해주세요.');
    });
}

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderFAQ();
});