// 업데이트 데이터
const mockUpdates = [
    {
        id: 1,
        version: "v2.1.0",
        title: "AI 보고서 자동 생성 기능 출시",
        type: "major",
        category: "기능추가",
        description: "AI를 활용한 자동 보고서 생성 기능이 추가되었습니다. 시장 데이터를 기반으로 전문적인 분석 보고서를 즉시 생성할 수 있습니다.",
        changes: [
            "AI 기반 시장 분석 보고서 자동 생성",
            "맞춤형 보고서 템플릿 5종 추가",
            "PDF/Word 형식 다운로드 지원",
            "보고서 히스토리 관리 기능"
        ],
        releaseDate: "2024-01-18",
        isLatest: true
    },
    {
        id: 2,
        version: "v2.0.3",
        title: "포인트 시스템 개선 업데이트",
        type: "minor",
        category: "개선",
        description: "포인트 적립 및 사용 시스템이 전면 개선되었습니다.",
        changes: [
            "포인트 적립률 20% 상향 조정",
            "실시간 포인트 내역 조회 기능",
            "포인트 유효기간 연장 (90일 → 180일)",
            "포인트 선물하기 기능 추가"
        ],
        releaseDate: "2024-01-15",
        isLatest: false
    },
    {
        id: 3,
        version: "v2.0.2",
        title: "모바일 최적화 및 버그 수정",
        type: "patch",
        category: "버그수정",
        description: "모바일 환경에서의 사용성이 크게 개선되었습니다.",
        changes: [
            "모바일 레이아웃 반응형 개선",
            "터치 제스처 인식률 향상",
            "이미지 로딩 속도 50% 개선",
            "간헐적 앱 종료 문제 해결"
        ],
        releaseDate: "2024-01-12",
        isLatest: false
    },
    {
        id: 4,
        version: "v2.0.1",
        title: "보안 강화 업데이트",
        type: "hotfix",
        category: "보안",
        description: "사용자 계정 보안을 강화하는 중요 업데이트입니다.",
        changes: [
            "2단계 인증(2FA) 기능 추가",
            "비밀번호 암호화 방식 강화",
            "자동 로그아웃 시간 설정 기능",
            "로그인 이력 조회 기능 추가"
        ],
        releaseDate: "2024-01-10",
        isLatest: false
    },
    {
        id: 5,
        version: "v2.0.0",
        title: "WAVE SPACE 2.0 메이저 업데이트",
        type: "major",
        category: "기능추가",
        description: "완전히 새로워진 WAVE SPACE 2.0을 만나보세요.",
        changes: [
            "UI/UX 전면 리뉴얼",
            "신규 게이미피케이션 시스템 도입",
            "실시간 알림 기능 추가",
            "다크모드 지원",
            "성능 최적화로 속도 2배 향상"
        ],
        releaseDate: "2024-01-05",
        isLatest: false
    },
    {
        id: 6,
        version: "v1.9.8",
        title: "구인구직 기능 개선",
        type: "minor",
        category: "개선",
        description: "구인구직 매칭 시스템이 개선되었습니다.",
        changes: [
            "AI 기반 구인구직 매칭 알고리즘 도입",
            "이력서 템플릿 10종 추가",
            "기업 인증 뱃지 시스템",
            "지원 현황 실시간 추적"
        ],
        releaseDate: "2023-12-28",
        isLatest: false
    }
];

// 카테고리별 아이콘
const categoryIcons = {
    기능추가: 'fa-sparkles',
    개선: 'fa-chart-line',
    버그수정: 'fa-bug',
    보안: 'fa-shield-alt'
};

// 전역 변수
let filteredUpdates = [...mockUpdates];

// DOM 요소
const searchInput = document.getElementById('searchInput');
const typeSelect = document.getElementById('typeSelect');
const categorySelect = document.getElementById('categorySelect');
const updatesList = document.getElementById('updatesList');

// 필터 이벤트 리스너
searchInput.addEventListener('input', filterUpdates);
typeSelect.addEventListener('change', filterUpdates);
categorySelect.addEventListener('change', filterUpdates);

// 필터링 함수
function filterUpdates() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeSelect.value;
    const selectedCategory = categorySelect.value;
    
    filteredUpdates = mockUpdates.filter(update => {
        const matchesSearch = update.title.toLowerCase().includes(searchTerm) ||
            update.description.toLowerCase().includes(searchTerm) ||
            update.changes.some(change => change.toLowerCase().includes(searchTerm));
        
        const matchesType = selectedType === 'all' || update.type === selectedType;
        const matchesCategory = selectedCategory === 'all' || update.category === selectedCategory;
        
        return matchesSearch && matchesType && matchesCategory;
    });
    
    renderUpdates();
}

// 업데이트 목록 렌더링
function renderUpdates() {
    updatesList.innerHTML = '';
    
    filteredUpdates.forEach((update, index) => {
        const updateCard = createUpdateCard(update);
        // 애니메이션 효과
        setTimeout(() => {
            updateCard.style.opacity = '1';
            updateCard.style.transform = 'translateY(0)';
        }, index * 100);
        updatesList.appendChild(updateCard);
    });
}

// 업데이트 카드 생성
function createUpdateCard(update) {
    const card = document.createElement('a');
    card.href = `update-detail.html?id=${update.id}`;
    card.className = `update-card ${update.isLatest ? 'latest' : ''}`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';
    
    card.innerHTML = `
        <div class="update-header-info">
            <div>
                <div class="update-meta">
                    <span class="update-version ${update.type}">${update.version}</span>
                    <span class="update-category">
                        <i class="fas ${categoryIcons[update.category]}"></i>
                        ${update.category}
                    </span>
                    ${update.isLatest ? '<span class="update-latest"><i class="fas fa-bolt"></i> 최신</span>' : ''}
                </div>
                <div class="update-content">
                    <h3>${update.title}</h3>
                    <p class="update-description">${update.description}</p>
                </div>
            </div>
            <i class="fas fa-arrow-up-right update-arrow"></i>
        </div>
        
        <div class="update-changes">
            <h4>변경사항</h4>
            <ul class="change-list">
                ${update.changes.slice(0, 3).map(change => `
                    <li class="change-item">
                        <span class="bullet">•</span>
                        <span>${change}</span>
                    </li>
                `).join('')}
                ${update.changes.length > 3 ? `
                    <li class="more-changes">+${update.changes.length - 3}개 더보기</li>
                ` : ''}
            </ul>
        </div>
        
        <div class="update-date">
            <i class="fas fa-calendar"></i>
            <span>${update.releaseDate}</span>
        </div>
    `;
    
    return card;
}

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderUpdates();
});