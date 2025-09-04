// 포인트 상점 JavaScript - 간소화 버전

// 상품 데이터 (Mock Data)
const shopItems = [
    // 게임샵 - 게임 관련 상품
    {
        id: 1,
        name: '게임 자유이용권 (1일)',
        category: 'game',
        shopCategory: 'game',
        price: 500,
        icon: 'fas fa-gamepad',
        description: '미니게임 1일 무제한 이용',
        benefits: ['광고 시청 제거', '보너스 획득률 1.1배'],
        stock: 999,
        purchaseLimit: 5,
        duration: '1일',
        badge: 'popular'
    },
    {
        id: 2,
        name: '게임 자유이용권 (7일)',
        category: 'game',
        shopCategory: 'game',
        price: 3000,
        icon: 'fas fa-gamepad',
        description: '미니게임 7일 무제한 이용',
        benefits: ['광고 시청 제거', '보너스 획득률 1.1배'],
        stock: 999,
        purchaseLimit: 3,
        duration: '7일'
    },
    {
        id: 3,
        name: '게임 자유이용권 (30일)',
        category: 'game',
        shopCategory: 'game',
        price: 10000,
        icon: 'fas fa-gamepad',
        description: '미니게임 30일 무제한 이용',
        benefits: ['광고 시청 제거', '보너스 획득률 1.2배'],
        stock: 999,
        purchaseLimit: 1,
        duration: '30일',
        badge: 'sale'
    },
    {
        id: 6,
        name: '경험치 2배 부스터 (1일)',
        category: 'booster',
        shopCategory: 'game',
        price: 200,
        icon: 'fas fa-rocket',
        description: '경험치 획득량 2배 증가',
        benefits: ['모든 활동 경험치 2배', '레벨업 가속화'],
        stock: 999,
        purchaseLimit: 5,
        duration: '1일',
        badge: 'new'
    },
    {
        id: 7,
        name: '포인트 1.5배 부스터 (1일)',
        category: 'booster',
        shopCategory: 'game',
        price: 150,
        icon: 'fas fa-coins',
        description: '포인트 획득량 1.5배 증가',
        benefits: ['모든 활동 포인트 1.5배', '효율적 포인트 수집'],
        stock: 999,
        purchaseLimit: 5,
        duration: '1일'
    },

    // 쿠폰샵 - 할인 및 혜택 상품
    {
        id: 16,
        name: '상점 10% 할인 쿠폰',
        category: 'coupon',
        shopCategory: 'coupon',
        price: 300,
        icon: 'fas fa-percentage',
        description: '상점 내 모든 상품 10% 할인',
        benefits: ['1회 구매시 10% 할인', '30일 유효기간'],
        stock: 200,
        purchaseLimit: 3,
        badge: 'popular'
    },
    {
        id: 17,
        name: '프리미엄 혜택 쿠폰',
        category: 'coupon',
        shopCategory: 'coupon',
        price: 800,
        icon: 'fas fa-gift',
        description: '다양한 프리미엄 혜택 패키지',
        benefits: ['VIP 라운지 이용권', '우선 고객센터 연결', '특별 이벤트 알림'],
        stock: 100,
        purchaseLimit: 2,
        badge: 'new'
    },
    {
        id: 10,
        name: '클래식 배경 테마',
        category: 'decoration',
        shopCategory: 'coupon',
        price: 300,
        icon: 'fas fa-palette',
        description: '우아한 클래식 배경 테마',
        benefits: ['프로필 카드 배경 변경'],
        stock: 999,
        purchaseLimit: 1
    },
    {
        id: 11,
        name: '프리미엄 골드 프레임',
        category: 'decoration',
        shopCategory: 'coupon',
        price: 800,
        icon: 'fas fa-crown',
        description: '고급스러운 골드 프레임',
        benefits: ['프로필 카드 프레임 변경'],
        stock: 50,
        purchaseLimit: 1,
        vipRequired: true,
        badge: 'sale'
    },

    // 활동샵 - 편의 기능 및 커뮤니티 활동 관련
    {
        id: 4,
        name: '닉네임 비공개 (7일)',
        category: 'privacy',
        shopCategory: 'activity',
        price: 300,
        icon: 'fas fa-user-secret',
        description: '7일간 익명으로 활동 가능',
        benefits: ['게시글/댓글 익명 작성', '프라이버시 보호'],
        stock: 999,
        purchaseLimit: 3,
        duration: '7일'
    },
    {
        id: 5,
        name: '닉네임 비공개 (15일)',
        category: 'privacy',
        shopCategory: 'activity',
        price: 500,
        icon: 'fas fa-user-secret',
        description: '15일간 익명으로 활동 가능',
        benefits: ['게시글/댓글 익명 작성', '프라이버시 보호'],
        stock: 999,
        purchaseLimit: 2,
        duration: '15일'
    },
    {
        id: 8,
        name: '광고 제거권 (7일)',
        category: 'utility',
        shopCategory: 'activity',
        price: 400,
        icon: 'fas fa-ad',
        description: '모든 광고 숨김 처리',
        benefits: ['광고 없는 쾌적한 이용', '빠른 페이지 로딩'],
        stock: 999,
        purchaseLimit: 3,
        duration: '7일',
        badge: 'popular'
    },
    {
        id: 9,
        name: '우선 노출권 (24시간)',
        category: 'utility',
        shopCategory: 'activity',
        price: 500,
        icon: 'fas fa-star',
        description: '게시글 상단 고정 노출',
        benefits: ['24시간 상단 고정', '높은 조회수 보장'],
        stock: 50,
        purchaseLimit: 2,
        duration: '24시간'
    },
    {
        id: 14,
        name: '활동왕 뱃지',
        category: 'badge',
        shopCategory: 'activity',
        price: 1500,
        icon: 'fas fa-medal',
        description: '활발한 커뮤니티 활동을 나타내는 뱃지',
        benefits: ['프로필 장식', '상점 5% 추가 할인'],
        stock: 100,
        purchaseLimit: 1,
        badge: 'new'
    },

    // 구인구직샵 - 구인구직 관련 프리미엄 서비스
    {
        id: 18,
        name: '이력서 우선 노출 (7일)',
        category: 'job',
        shopCategory: 'job',
        price: 2000,
        icon: 'fas fa-file-alt',
        description: '구인구직 게시판에서 이력서 우선 노출',
        benefits: ['7일간 상단 고정', '조회수 3배 증가 효과', '채용담당자 우선 연결'],
        stock: 50,
        purchaseLimit: 2,
        duration: '7일',
        badge: 'popular'
    },
    {
        id: 19,
        name: '헤드헌팅 등록권',
        category: 'job',
        shopCategory: 'job',
        price: 5000,
        icon: 'fas fa-user-tie',
        description: '헤드헌팅 시스템 프리미엄 등록',
        benefits: ['헤드헌터 우선 매칭', 'VIP 프로필 등록', '맞춤형 포지션 알림'],
        stock: 30,
        purchaseLimit: 1,
        badge: 'new'
    },
    {
        id: 20,
        name: '면접 스킬업 패키지',
        category: 'job',
        shopCategory: 'job',
        price: 3000,
        icon: 'fas fa-microphone',
        description: '면접 대비 종합 지원 서비스',
        benefits: ['모의 면접 5회', '이력서 첨삭 서비스', '면접 후기 열람권'],
        stock: 100,
        purchaseLimit: 2
    },

    // 토큰샵 - AI 토큰 및 전문가 도구
    {
        id: 12,
        name: 'AI Token 10개',
        category: 'token',
        shopCategory: 'token',
        price: 1000,
        icon: 'fas fa-robot',
        description: 'AI 보고서 생성용 토큰 10개',
        benefits: ['AI 보고서 10회 생성 가능'],
        stock: 999,
        purchaseLimit: 10,
        badge: 'popular'
    },
    {
        id: 13,
        name: 'AI Token 50개',
        category: 'token',
        shopCategory: 'token',
        price: 4500,
        icon: 'fas fa-robot',
        description: 'AI 보고서 생성용 토큰 50개',
        benefits: ['AI 보고서 50회 생성 가능', '대량 구매 할인'],
        stock: 999,
        purchaseLimit: 5,
        badge: 'sale'
    },
    {
        id: 15,
        name: '전문가 뱃지',
        category: 'badge',
        shopCategory: 'token',
        price: 3000,
        icon: 'fas fa-graduation-cap',
        description: '분양 전문가임을 인증하는 뱃지',
        benefits: ['프로필 장식', '상점 10% 추가 할인', '전문가 전용 기능 이용'],
        stock: 50,
        purchaseLimit: 1
    },
    {
        id: 21,
        name: 'AI 분석 프리미엄',
        category: 'token',
        shopCategory: 'token',
        price: 8000,
        icon: 'fas fa-chart-line',
        description: '고급 AI 분석 도구 1개월 이용권',
        benefits: ['심층 시장 분석', '트렌드 예측 리포트', '맞춤형 투자 조언'],
        stock: 20,
        purchaseLimit: 1,
        duration: '30일',
        badge: 'new'
    }
];

// 사용자 정보 (Mock Data)
const userInfo = {
    points: 100000,
    badges: ['active'],
    isVip: false,
    isPlusMember: true,
    purchaseHistory: {},
    selectedItems: new Map(), // 선택한 상품들 (itemId -> quantity)
    inventory: {} // 구매한 상품 보관함
};

// 상품 설명 생성 함수 (한정 상품 처리 포함)
function getItemDescription(item) {
    let description = item.description;
    
    // 한정 상품인지 확인 (원래 로직과 동일)
    const isLimited = item.originalStock < 50 && item.originalStock !== 999;
    
    if (isLimited) {
        // 구매한 수량 계산 (원래 재고 - 현재 재고)
        const purchasedCount = item.originalStock - item.stock;
        const totalCount = item.originalStock;
        
        // 설명 뒤에 (한정) 및 재고 추적 정보 추가
        description += ` (한정) ${purchasedCount}/${totalCount}`;
    }
    
    return description;
}

// 초기화 함수
function initPointsShop() {
    console.log('Points Shop 초기화 중...');
    console.log('shopItems 배열:', shopItems);
    console.log('DOM 로드 완료, 컨테이너 찾기:', document.querySelector('.points-shop-container'));
    
    // 상품 데이터에 originalStock 속성 추가 (최초 1회만)
    shopItems.forEach(item => {
        if (!item.originalStock) {
            item.originalStock = item.stock;
        }
    });
    
    // 섹션별 상품 목록 렌더링
    renderShopSections();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    console.log('Points Shop 초기화 완료');
}

// 상품 목록 렌더링
function renderShopItems() {
    const shopGrid = document.getElementById('shopGrid');
    const emptyResults = document.getElementById('emptyResults');
    
    if (!shopGrid) return;
    
    if (shopItems.length === 0) {
        if (emptyResults) {
            shopGrid.style.display = 'none';
            emptyResults.style.display = 'block';
        }
        return;
    }
    
    shopGrid.style.display = 'grid';
    if (emptyResults) emptyResults.style.display = 'none';
    
    const itemsHTML = shopItems.map(item => createItemHTML(item)).join('');
    shopGrid.innerHTML = itemsHTML;
}

// 섹션별 상품 목록 렌더링
function renderShopSections() {
    console.log('renderShopSections 시작, 전체 상품 수:', shopItems.length);
    
    // 새로운 카테고리별 상품 분류
    const gameItems = shopItems.filter(item => item.shopCategory === 'game');
    const couponItems = shopItems.filter(item => item.shopCategory === 'coupon');
    const activityItems = shopItems.filter(item => item.shopCategory === 'activity');
    const jobItems = shopItems.filter(item => item.shopCategory === 'job');
    const tokenItems = shopItems.filter(item => item.shopCategory === 'token');
    
    console.log('카테고리별 상품 수:', {
        game: gameItems.length,
        coupon: couponItems.length,
        activity: activityItems.length,
        job: jobItems.length,
        token: tokenItems.length
    });
    
    // 각 섹션 렌더링
    renderSection('gameGrid', gameItems);
    renderSection('couponGrid', couponItems);
    renderSection('activityGrid', activityItems);
    renderSection('jobGrid', jobItems);
    renderSection('tokenGrid', tokenItems);
}

// 개별 섹션 렌더링
function renderSection(gridId, items) {
    console.log(`renderSection 실행: ${gridId}, 상품 수: ${items.length}`);
    const grid = document.getElementById(gridId);
    
    if (!grid) {
        console.error(`그리드를 찾을 수 없습니다: ${gridId}`);
        return;
    }
    
    if (items.length === 0) {
        grid.innerHTML = '<div class="empty-section">등록된 상품이 없습니다</div>';
        return;
    }
    
    const itemsHTML = items.map(item => createItemHTML(item)).join('');
    grid.innerHTML = itemsHTML;
    console.log(`${gridId}에 ${items.length}개 상품 렌더링 완료`);
}

// 개별 상품 HTML 생성 - 새로운 원클릭 선택 시스템
function createItemHTML(item) {
    const purchaseCheck = canPurchaseItem(item);
    const isDisabled = !purchaseCheck.canPurchase;
    const isSelected = userInfo.selectedItems.has(item.id);
    
    // VIP 표시만 생성 (기존 스티커 제거)
    const vipBadge = item.vipRequired ? '<span class="condition-tag vip-tag">VIP</span>' : '';
    
    return `
        <div class="shop-item ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}" 
             data-item-id="${item.id}" 
             onclick="${!isDisabled ? `toggleItemSelection(${item.id})` : ''}">
            
            <!-- 아이콘 영역 -->
            <div class="item-icon-wrapper">
                <i class="${item.icon || 'fas fa-box'}"></i>
            </div>
            
            <!-- VIP 뱃지만 표시 -->
            ${vipBadge}
            
            <!-- 상품 정보 -->
            <div class="shop-item-info">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-description">${getItemDescription(item)}</p>
                
                <!-- 가격 -->
                <div class="item-price">
                    <span class="current-price">${item.price.toLocaleString()}P</span>
                </div>
                
                <!-- 재고/구매제한 정보 -->
                ${item.stock < 999 || item.purchaseLimit < 99 ? `
                    <div class="item-meta">
                        ${item.stock < 999 ? `재고 ${item.stock}개` : ''}
                        ${item.purchaseLimit < 99 ? ` · 월 ${item.purchaseLimit}개 제한` : ''}
                    </div>
                ` : ''}
            </div>
            
            <!-- 구매 버튼 -->
            <div class="shop-item-actions">
                <button class="buy-btn ${isDisabled ? 'disabled' : ''}" 
                        onclick="event.stopPropagation(); ${!isDisabled ? (isSelected ? `removeSelectedItem(${item.id})` : `toggleItemSelection(${item.id})`) : ''}" 
                        ${isDisabled ? 'disabled' : ''}>
                    ${isDisabled ? (purchaseCheck.reasons[0] || '구매불가') : (isSelected ? '선택됨' : '구매하기')}
                </button>
            </div>
        </div>
    `;
}

// getBadgeText 함수 제거됨 (스티커 시스템 제거로 인해 불필요)

// 구매 가능 여부 확인
function canPurchaseItem(item) {
    const reasons = [];
    
    // 포인트 부족
    if (userInfo.points < item.price) {
        reasons.push('포인트가 부족합니다');
    }
    
    // VIP 조건
    if (item.vipRequired && !userInfo.isVip) {
        reasons.push('VIP 멤버십이 필요합니다');
    }
    
    // 구매 제한
    const purchasedCount = userInfo.purchaseHistory[item.id] || 0;
    if (purchasedCount >= item.purchaseLimit) {
        reasons.push('구매 한도를 초과했습니다');
    }
    
    // 재고 부족
    if (item.stock <= 0) {
        reasons.push('품절되었습니다');
    }
    
    return {
        canPurchase: reasons.length === 0,
        reasons: reasons
    };
}

// 상품 선택/선택취소 처리 (원클릭 시스템)
function toggleItemSelection(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (userInfo.selectedItems.has(itemId)) {
        // 선택 취소
        userInfo.selectedItems.delete(itemId);
        showToast('success', `'${item.name}'이(가) 선택에서 제거되었습니다`, 'fas fa-minus-circle');
    } else {
        // 새로 선택
        const purchaseCheck = canPurchaseItem(item);
        if (!purchaseCheck.canPurchase) {
            showToast('error', purchaseCheck.reasons[0], 'fas fa-exclamation-triangle');
            return;
        }
        
        userInfo.selectedItems.set(itemId, 1);
        showToast('success', `'${item.name}'이(가) 선택되었습니다`, 'fas fa-plus-circle');
    }
    
    updateItemSelection(itemId);
    updateBottomSelectionBar();
}

// 기존 구매 버튼 클릭 처리 (모달 방식)
function handlePurchaseClick(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    const purchaseCheck = canPurchaseItem(item);
    if (!purchaseCheck.canPurchase) {
        showToast('error', purchaseCheck.reasons[0], 'fas fa-exclamation-triangle');
        return;
    }
    
    showPurchaseModal(item);
}

// 구매 확인 모달 표시
function showPurchaseModal(item) {
    const modal = document.getElementById('purchaseModal');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) return;
    
    const remainingPoints = userInfo.points - item.price;
    
    // 모달 내용 생성
    modalBody.innerHTML = `
        <!-- 상품 정보 -->
        <div class="modal-item-info">
            <div class="modal-item-icon">
                <i class="${item.icon}"></i>
            </div>
            <div class="modal-item-details">
                <h4>${item.name}</h4>
                <p>${getItemDescription(item)}</p>
                ${item.benefits ? `
                    <ul class="benefits-list">
                        ${item.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        </div>
        
        <!-- 가격 정보 -->
        <div class="modal-price-breakdown">
            <div class="price-row">
                <span class="price-label">상품 가격</span>
                <span class="price-value final">${item.price.toLocaleString()}P</span>
            </div>
        </div>
        
        <!-- 사용자 포인트 정보 -->
        <div class="modal-user-points">
            <span class="label">보유 포인트</span>
            <span class="value">${userInfo.points.toLocaleString()}P</span>
        </div>
        
        <!-- 구매 후 잔여 포인트 -->
        <div class="modal-user-points">
            <span class="label">구매 후 잔여</span>
            <span class="value" style="color: ${remainingPoints >= 0 ? 'var(--primary-blue)' : 'var(--error)'}">
                ${remainingPoints.toLocaleString()}P
            </span>
        </div>
    `;
    
    // 모달 표시
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 구매 확인 버튼에 이벤트 연결
    const confirmBtn = document.getElementById('modalConfirm');
    if (confirmBtn) {
        confirmBtn.onclick = () => confirmPurchase(item);
    }
}

// 구매 확정 처리
function confirmPurchase(item) {
    // 포인트 차감
    userInfo.points -= item.price;
    
    // 구매 이력 업데이트
    if (!userInfo.purchaseHistory[item.id]) {
        userInfo.purchaseHistory[item.id] = 0;
    }
    userInfo.purchaseHistory[item.id]++;
    
    // 재고 감소 (무제한 아닌 경우)
    if (item.stock < 999) {
        item.stock--;
    }
    
    // UI 업데이트
    renderShopItems();
    hidePurchaseModal();
    
    // 성공 알림
    showToast('success', `'${item.name}'을(를) 성공적으로 구매했습니다!`, 'fas fa-check-circle');
    
    console.log('구매 완료:', item.name, '잔여 포인트:', userInfo.points);
}

// 모달 숨기기
function hidePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 토스트 알림 표시
function showToast(type, message, icon) {
    const toast = document.getElementById('toast');
    const toastIcon = toast?.querySelector('.toast-icon');
    const toastMessage = toast?.querySelector('.toast-message');
    
    if (!toast || !toastIcon || !toastMessage) return;
    
    // 이전 클래스 제거
    toast.className = 'toast';
    
    // 새로운 내용 설정
    toast.classList.add(type);
    toastIcon.className = `toast-icon ${icon}`;
    toastMessage.textContent = message;
    
    // 토스트 표시
    toast.style.display = 'block';
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 3초 후 자동 숨김
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.style.display = 'none';
            toast.classList.remove('show', 'hide');
        }, 400);
    }, 3000);
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모달 닫기 이벤트
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalBackdrop = document.getElementById('modalBackdrop');
    
    if (modalClose) modalClose.onclick = hidePurchaseModal;
    if (modalCancel) modalCancel.onclick = hidePurchaseModal;
    if (modalBackdrop) modalBackdrop.onclick = hidePurchaseModal;
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hidePurchaseModal();
        }
    });
}

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 페이지가 상점 페이지인지 확인
    if (document.querySelector('.points-shop-container')) {
        initPointsShop();
    }
});

// 하단 선택바 관련 함수들
function updateBottomSelectionBar() {
    const bottomBar = document.getElementById('bottomSelectionBar');
    const selectedCount = document.querySelector('.selected-count');
    const totalPrice = document.querySelector('.total-price');
    const totalAmount = document.getElementById('totalAmount');
    
    const itemCount = userInfo.selectedItems.size;
    const total = calculateSelectedItemsTotal();
    
    if (itemCount === 0) {
        // 선택한 상품이 없으면 하단바 숨김
        if (bottomBar) {
            bottomBar.classList.remove('show');
            setTimeout(() => {
                bottomBar.style.display = 'none';
            }, 300);
        }
    } else {
        // 선택한 상품이 있으면 하단바 표시
        if (bottomBar) {
            bottomBar.style.display = 'block';
            setTimeout(() => {
                bottomBar.classList.add('show');
            }, 10);
        }
        
        // 개수와 총액 업데이트
        if (selectedCount) selectedCount.textContent = `${itemCount}개 선택`;
        if (totalPrice) totalPrice.textContent = `${total.toLocaleString()}P`;
        if (totalAmount) totalAmount.textContent = `${total.toLocaleString()}P`;
        
        // 상세 목록 업데이트
        updateSelectedItemsList();
    }
}

function calculateSelectedItemsTotal() {
    let total = 0;
    userInfo.selectedItems.forEach((quantity, itemId) => {
        const item = shopItems.find(i => i.id === itemId);
        if (item) {
            total += item.price * quantity;
        }
    });
    return total;
}

function updateSelectedItemsList() {
    const listContainer = document.getElementById('selectedItemsList');
    if (!listContainer) return;
    
    const items = [];
    userInfo.selectedItems.forEach((quantity, itemId) => {
        const item = shopItems.find(i => i.id === itemId);
        if (item) {
            items.push({...item, quantity});
        }
    });
    
    listContainer.innerHTML = items.map(item => `
        <div class="selected-item">
            <div class="selected-item-icon">
                <i class="${item.icon}"></i>
            </div>
            <div class="selected-item-info">
                <div class="selected-item-name">${item.name}</div>
                <div class="selected-item-price">${(item.price * item.quantity).toLocaleString()}P</div>
            </div>
            <div class="selected-item-controls">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="changeItemQuantity(${item.id}, -1)" 
                            ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeItemQuantity(${item.id}, 1)"
                            ${item.quantity >= item.purchaseLimit ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item-btn" onclick="removeSelectedItem(${item.id})" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateItemSelection(itemId) {
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (!itemElement) return;
    
    const isSelected = userInfo.selectedItems.has(itemId);
    const buyBtn = itemElement.querySelector('.buy-btn');
    
    if (isSelected) {
        itemElement.classList.add('selected');
        if (buyBtn) buyBtn.textContent = '선택됨';
    } else {
        itemElement.classList.remove('selected');
        if (buyBtn) buyBtn.textContent = '구매하기';
    }
}

function toggleSelectionDetails() {
    const summaryDiv = document.getElementById('selectionSummary');
    const detailsDiv = document.getElementById('selectionDetails');
    const expandBtn = document.getElementById('expandBtn');
    
    if (!summaryDiv || !detailsDiv || !expandBtn) return;
    
    const isExpanded = detailsDiv.style.display !== 'none';
    
    if (isExpanded) {
        // 축약 모드로 변경
        detailsDiv.style.display = 'none';
        summaryDiv.style.display = 'flex';
        expandBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    } else {
        // 상세 모드로 변경
        detailsDiv.style.display = 'block';
        summaryDiv.style.display = 'none';
        expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        
        // 상세 목록 업데이트
        updateSelectedItemsList();
    }
}

function changeItemQuantity(itemId, change) {
    const currentQuantity = userInfo.selectedItems.get(itemId) || 0;
    const newQuantity = currentQuantity + change;
    const item = shopItems.find(i => i.id === itemId);
    
    if (!item || newQuantity <= 0) {
        removeSelectedItem(itemId);
        return;
    }
    
    if (newQuantity > item.purchaseLimit) {
        showToast('warning', '구매 한도를 초과했습니다', 'fas fa-exclamation-triangle');
        return;
    }
    
    userInfo.selectedItems.set(itemId, newQuantity);
    updateBottomSelectionBar();
}

function removeSelectedItem(itemId) {
    userInfo.selectedItems.delete(itemId);
    updateItemSelection(itemId);
    updateBottomSelectionBar();
    
    const item = shopItems.find(i => i.id === itemId);
    if (item) {
        showToast('success', `'${item.name}'이(가) 제거되었습니다`, 'fas fa-trash');
    }
}

function clearAllSelections() {
    if (userInfo.selectedItems.size === 0) return;
    
    userInfo.selectedItems.forEach((quantity, itemId) => {
        updateItemSelection(itemId);
    });
    
    userInfo.selectedItems.clear();
    updateBottomSelectionBar();
    showToast('success', '모든 선택이 취소되었습니다', 'fas fa-broom');
}

function purchaseSelectedItems() {
    if (userInfo.selectedItems.size === 0) {
        showToast('warning', '선택한 상품이 없습니다', 'fas fa-shopping-cart');
        return;
    }
    
    const total = calculateSelectedItemsTotal();
    if (userInfo.points < total) {
        showToast('error', '보유 포인트가 부족합니다', 'fas fa-exclamation-triangle');
        return;
    }
    
    // 구매 처리
    const purchasedItems = [];
    userInfo.selectedItems.forEach((quantity, itemId) => {
        const item = shopItems.find(i => i.id === itemId);
        if (item) {
            // 포인트 차감
            userInfo.points -= item.price * quantity;
            
            // 구매 이력 업데이트
            if (!userInfo.purchaseHistory[itemId]) {
                userInfo.purchaseHistory[itemId] = 0;
            }
            userInfo.purchaseHistory[itemId] += quantity;
            
            // 보관함에 추가
            if (!userInfo.inventory[itemId]) {
                userInfo.inventory[itemId] = 0;
            }
            userInfo.inventory[itemId] += quantity;
            
            // 재고 감소
            if (item.stock < 999) {
                item.stock -= quantity;
            }
            
            purchasedItems.push(`${item.name} x${quantity}`);
        }
    });
    
    // 선택 초기화
    userInfo.selectedItems.clear();
    
    // UI 업데이트
    renderShopSections();
    updateBottomSelectionBar();
    
    // 성공 메시지
    showToast('success', `구매 완료! ${purchasedItems.length}개 상품이 보관함에 저장되었습니다`, 'fas fa-check-circle');
    
    console.log('구매 완료:', purchasedItems, '잔여 포인트:', userInfo.points);
}

// 전역 함수들을 window 객체에 등록
window.PointsShop = {
    initPointsShop,
    canPurchaseItem,
    handlePurchaseClick,
    toggleItemSelection,
    showToast,
    updateBottomSelectionBar,
    toggleSelectionDetails,
    changeItemQuantity,
    removeSelectedItem,
    clearAllSelections,
    purchaseSelectedItems,
    shopItems,
    userInfo
};