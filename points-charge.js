// 포인트 충전하기 JavaScript 파일
// WAVE SPACE Points Charge System

// 스타터 패키지 데이터
const starterPackage = {
    id: 'starter',
    amount: 30000,
    points: 50000,
    bonus: 20000,
    bonusRate: 66.7,
    description: '계정당 2회 한정 특가',
    limitPerAccount: 2,
    badge: '계정한정 특가',
    coupon: 5
};

// 충전 옵션 데이터
const chargeOptions = [
    {
        id: 1,
        amount: 10000,
        points: 10000,
        bonus: 0,
        bonusRate: 0,
        description: '기본 충전',
        coupon: 1
    },
    {
        id: 2,
        amount: 30000,
        points: 31000,
        bonus: 1000,
        bonusRate: 3.3,
        description: '추천 충전',
        coupon: 3
    },
    {
        id: 3,
        amount: 50000,
        points: 53000,
        bonus: 3000,
        bonusRate: 6,
        description: '인기 충전',
        coupon: 5
    },
    {
        id: 4,
        amount: 100000,
        points: 110000,
        bonus: 10000,
        bonusRate: 10,
        description: '최대 혜택',
        coupon: 10
    }
];

// 토스페이먼츠 결제 수단 데이터
const paymentMethods = [
    {
        id: 'card',
        name: '신용/체크카드',
        icon: 'fas fa-credit-card',
        description: 'Toss Payments로 안전한 카드 결제',
        tossMethod: 'CARD'
    },
    {
        id: 'transfer',
        name: '계좌이체',
        icon: 'fas fa-university',
        description: 'Toss Payments 계좌이체',
        tossMethod: 'TRANSFER'
    },
    {
        id: 'virtual_account',
        name: '가상계좌',
        icon: 'fas fa-receipt',
        description: 'Toss Payments 가상계좌 입금',
        tossMethod: 'VIRTUAL_ACCOUNT'
    },
    {
        id: 'mobile_phone',
        name: '휴대폰',
        icon: 'fas fa-mobile-alt',
        description: 'Toss Payments 휴대폰 소액결제',
        tossMethod: 'MOBILE_PHONE'
    }
];

// localStorage에서 스타터 패키지 구매 횟수 로드
function getStarterPackagePurchases() {
    const purchases = localStorage.getItem('starterPackagePurchases');
    return purchases ? parseInt(purchases) : 0;
}

// localStorage에 스타터 패키지 구매 횟수 저장
function saveStarterPackagePurchases(count) {
    localStorage.setItem('starterPackagePurchases', count.toString());
}

// 사용자 정보 (Mock Data)
const userInfo = {
    points: 100000,
    name: '박승학',
    isAuthenticated: true,
    isPlusMember: true,
    starterPackagePurchases: getStarterPackagePurchases() // localStorage에서 로드
};

// 현재 선택된 값들
let selectedChargeOptions = []; // 복수 선택을 위한 배열로 변경
let selectedPaymentMethod = null;
let customAmount = 0;
let isCustomAmount = false;
let isStarterPackageSelected = false;
let starterPackageQuantity = 1;

// 충전 옵션에 수량 정보 추가
const chargeQuantities = {
    1: 1,
    2: 1,
    3: 1,
    4: 1 // 10만원권 기본 수량
};

// 토스페이먼츠 객체
let tossPayments = null;

// 초기화 함수
function initPointsCharge() {
    console.log('Points Charge 초기화 중...');
    
    // 토스페이먼츠 초기화
    initializeTossPayments();
    
    // 현재 포인트 표시
    updateCurrentPointsDisplay();
    
    // 스타터 패키지 렌더링
    renderStarterPackage();
    
    // 충전 옵션 렌더링
    renderChargeOptions();
    
    // 결제 수단 렌더링
    renderPaymentMethods();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 초기 상태 업데이트
    updatePaymentSummary();
    
    console.log('Points Charge 초기화 완료');
}

// 토스페이먼츠 초기화
function initializeTossPayments() {
    try {
        // 실제 환경에서는 클라이언트 키를 사용
        const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'; // 테스트용 키
        tossPayments = TossPayments(clientKey);
    } catch (error) {
        console.error('토스페이먼츠 초기화 실패:', error);
        showToast('error', '결제 모듈 로딩 중 오류가 발생했습니다.', 'fas fa-exclamation-triangle');
    }
}

// 현재 포인트 표시 업데이트
function updateCurrentPointsDisplay() {
    const currentPointsEl = document.getElementById('currentPoints');
    if (currentPointsEl) {
        currentPointsEl.textContent = `${userInfo.points.toLocaleString()}P`;
    }
}

// 스타터 패키지 렌더링
function renderStarterPackage() {
    const starterCard = document.getElementById('starterCard');
    if (!starterCard) return;
    
    const remainingPurchases = starterPackage.limitPerAccount - userInfo.starterPackagePurchases;
    const isAvailable = remainingPurchases > 0;
    const maxQuantity = Math.min(remainingPurchases, 2);
    
    const cardHTML = `
        <div class="starter-option ${!isAvailable ? 'disabled' : ''} ${isStarterPackageSelected ? 'selected' : ''}" 
             data-starter="true" 
             ${isAvailable ? 'onclick="selectStarterPackage()"' : ''}>
            <div class="starter-price">
                <span class="original-price">50,000원</span>
                <div class="starter-amount-with-quantity">
                    <span class="starter-amount">${starterPackage.amount.toLocaleString()}원</span>
                    ${isAvailable && maxQuantity > 1 ? `
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="decreaseStarterQuantity(event); return false;" ${starterPackageQuantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${starterPackageQuantity}</span>
                            <button class="quantity-btn" onclick="increaseStarterQuantity(event); return false;" ${starterPackageQuantity >= maxQuantity ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    ` : ''}
                    <span class="check-mark" style="display: ${isStarterPackageSelected ? 'flex' : 'none'};"><i class="fas fa-check"></i></span>
                </div>
            </div>
            <div class="starter-points">${(starterPackage.points * starterPackageQuantity).toLocaleString()}P 획득</div>
            <div class="starter-benefits">
                <div class="benefit-item">
                    <i class="fas fa-gift"></i>
                    <span>보너스 +${(starterPackage.bonus * starterPackageQuantity).toLocaleString()}P</span>
                </div>
                <div class="benefit-item">
                    <i class="fas fa-ticket-alt"></i>
                    <span>다운로드 할인 쿠폰 조각 ${(starterPackage.coupon * starterPackageQuantity).toLocaleString()}개</span>
                </div>
                <div class="benefit-item">
                    <i class="fas fa-clock"></i>
                    <span>계정당 ${starterPackage.limitPerAccount}회 한정</span>
                </div>
            </div>
            <div class="starter-remaining">
                ${isAvailable 
        ? `<i class="fas fa-check-circle"></i> 구매 가능 (${remainingPurchases}회 남음)` 
        : '<div class="starter-used-badge">사용완료</div>'
}
            </div>
        </div>
    `;
    
    starterCard.innerHTML = cardHTML;
}

// 충전 옵션 렌더링
function renderChargeOptions() {
    const chargeGrid = document.getElementById('chargeGrid');
    if (!chargeGrid) return;
    
    const optionsHTML = chargeOptions.map(option => {
        const isPopular = option.bonusRate >= 6;
        const is100kOption = option.id === 4; // 10만원권
        const quantity = chargeQuantities[option.id];
        
        return `
            <div class="charge-card" data-option-id="${option.id}" onclick="selectChargeOption(${option.id})">
                ${option.bonus > 0 ? `<span class="bonus-badge">+${option.bonusRate}% 보너스</span>` : ''}
                <div class="charge-amount">
                    ${is100kOption ? (option.amount * quantity).toLocaleString() : option.amount.toLocaleString()}원
                    ${is100kOption ? `
                        <div class="quantity-mini" onclick="event.stopPropagation();">
                            <button type="button" class="quantity-mini-btn" onclick="decreaseQuantity(${option.id})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-mini-display" id="quantity-${option.id}">${quantity}</span>
                            <button type="button" class="quantity-mini-btn" onclick="increaseQuantity(${option.id})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    ` : ''}
                    <span class="check-mark" style="display: none;"><i class="fas fa-check"></i></span>
                </div>
                <div class="charge-points">${(option.points * quantity).toLocaleString()}P 획득</div>
                <div class="charge-benefits">
                    <div class="benefit-item">
                        <i class="fas fa-ticket-alt"></i>
                        <span>다운로드 할인 쿠폰 조각 ${(option.coupon * quantity).toLocaleString()}개</span>
                    </div>
                    ${option.bonus > 0 ? `<div class="benefit-item"><i class="fas fa-gift"></i><span>보너스 +${(option.bonus * quantity).toLocaleString()}P</span></div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    chargeGrid.innerHTML = optionsHTML;
    
    // 선택 상태 복원
    selectedChargeOptions.forEach(option => {
        const card = document.querySelector(`[data-option-id="${option.id}"]`);
        if (card) {
            card.classList.add('selected');
            const checkMark = card.querySelector('.check-mark');
            if (checkMark) {
                checkMark.style.display = 'flex';
            }
        }
    });
}

// 결제 수단 렌더링
function renderPaymentMethods() {
    const paymentGrid = document.getElementById('paymentGrid');
    if (!paymentGrid) return;
    
    const methodsHTML = paymentMethods.map(method => `
        <div class="payment-method" data-method-id="${method.id}" onclick="selectPaymentMethod('${method.id}')">
            <div class="payment-icon">
                <i class="${method.icon}"></i>
            </div>
            <p class="payment-name">${method.name}</p>
        </div>
    `).join('');
    
    paymentGrid.innerHTML = methodsHTML;
}

// 스타터 패키지 선택
function selectStarterPackage() {
    if (userInfo.starterPackagePurchases >= starterPackage.limitPerAccount) {
        showToast('error', '스타터 패키지는 계정당 최대 2회만 구매 가능합니다.', 'fas fa-exclamation-triangle');
        return;
    }
    
    // 이전 선택 제거
    clearAllSelections();
    
    // 스타터 패키지 선택 상태 설정
    selectedChargeOptions = [];
    isCustomAmount = false;
    isStarterPackageSelected = true;
    
    // 스타터 패키지 다시 렌더링 (체크 표시 포함)
    renderStarterPackage();
    
    updatePaymentSummary();
        
    // 결제 수단 선택 섹션으로 스크롤 (제거됨)
    // setTimeout(() => {
    //     const paymentSection = document.querySelector('.payment-section');
    //     if (paymentSection) {
    //         paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //     }
    // }, 300);
}

// 스타터 패키지 수량 증가
function increaseStarterQuantity(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const remainingPurchases = starterPackage.limitPerAccount - userInfo.starterPackagePurchases;
    const maxQuantity = Math.min(remainingPurchases, 2);
    
    if (starterPackageQuantity < maxQuantity) {
        starterPackageQuantity++;
        
        // 수량 조절 시 카드를 자동 선택
        if (!isStarterPackageSelected) {
            clearAllSelections();
            isStarterPackageSelected = true;
            selectedChargeOptions = [];
            isCustomAmount = false;
        }
        
        renderStarterPackage();
        updatePaymentSummary();
    }
}

// 스타터 패키지 수량 감소
function decreaseStarterQuantity(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (starterPackageQuantity > 1) {
        starterPackageQuantity--;
        
        // 수량 조절 시 카드를 자동 선택
        if (!isStarterPackageSelected) {
            clearAllSelections();
            isStarterPackageSelected = true;
            selectedChargeOptions = [];
            isCustomAmount = false;
        }
        
        renderStarterPackage();
        updatePaymentSummary();
    }
}

// 전역 함수로 등록은 파일 맨 아래에서 한 번만 처리

// 충전 옵션 선택 (복합 선택 가능)
function selectChargeOption(optionId) {
    // 스타터 패키지나 직접 입력이 선택된 경우 초기화
    if (isStarterPackageSelected || isCustomAmount) {
        clearAllSelections();
    }
    
    const selectedCard = document.querySelector(`[data-option-id="${optionId}"]`);
    if (!selectedCard) return;
    
    // 현재 총 선택 금액 계산
    const currentTotalAmount = calculateTotalAmount();
    const optionAmount = chargeOptions.find(opt => opt.id === optionId).amount;
    
    // 이미 선택된 옵션인지 확인
    const existingIndex = selectedChargeOptions.findIndex(opt => opt.id === optionId);
    
    if (existingIndex >= 0) {
        // 이미 선택된 옵션 - 토글 해제
        selectedChargeOptions.splice(existingIndex, 1);
        selectedCard.classList.remove('selected');
        
        const checkMark = selectedCard.querySelector('.check-mark');
        if (checkMark) {
            checkMark.style.display = 'none';
        }
        
        // 10만원권인 경우 수량 초기화
        if (optionId === 4) {
            chargeQuantities[4] = 1;
        }
    } else {
        // 새로운 옵션 선택
        // 20만원 한도 체크 (10만원권은 기본 수량으로 계산)
        const quantity = optionId === 4 ? chargeQuantities[optionId] : 1;
        const newTotalAmount = currentTotalAmount + optionAmount * quantity;
        if (newTotalAmount > 200000) {
            showToast('error', '1일 최대 충전 한도 20만원을 초과할 수 없습니다.', 'fas fa-exclamation-triangle');
            return;
        }
        
        selectedChargeOptions.push(chargeOptions.find(opt => opt.id === optionId));
        selectedCard.classList.add('selected');
        
        const checkMark = selectedCard.querySelector('.check-mark');
        if (checkMark) {
            checkMark.style.display = 'flex';
        }
    }
    
    isCustomAmount = false;
    isStarterPackageSelected = false;
    
    updatePaymentSummary();
    
    // 첫 번째 선택 시에만 스크롤 (제거됨)
    // if (selectedChargeOptions.length === 1 && existingIndex < 0) {
    //     setTimeout(() => {
    //         const paymentSection = document.querySelector('.payment-section');
    //         if (paymentSection) {
    //             paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //         }
    //     }, 300);
    // }
}

// 총 선택 금액 계산
function calculateTotalAmount() {
    return selectedChargeOptions.reduce((total, option) => {
        return total + (option.amount * chargeQuantities[option.id]);
    }, 0);
}

// 수량 증가
function increaseQuantity(optionId) {
    if (optionId === 4) { // 10만원권만 수량 선택 가능
        const currentQuantity = chargeQuantities[optionId];
        const currentTotalAmount = calculateTotalAmount();
        
        // 20만원 한도 체크 (현재 수량에서 1개 추가 시)
        const optionAmount = chargeOptions.find(opt => opt.id === optionId).amount;
        const newTotalAmount = currentTotalAmount + optionAmount;
        
        if (newTotalAmount > 200000) {
            showToast('error', '1일 최대 충전 한도 20만원을 초과할 수 없습니다.', 'fas fa-exclamation-triangle');
            return;
        }
        
        // 최대 2개까지만
        if (currentQuantity < 2) {
            chargeQuantities[optionId] = currentQuantity + 1;
            renderChargeOptions(); // 전체 렌더링으로 수량 반영
            updatePaymentSummary();
        }
    }
}

// 수량 감소
function decreaseQuantity(optionId) {
    if (optionId === 4) { // 10만원권만 수량 선택 가능
        const currentQuantity = chargeQuantities[optionId];
        if (currentQuantity > 1) {
            chargeQuantities[optionId] = currentQuantity - 1;
            renderChargeOptions(); // 전체 렌더링으로 수량 반영
            updatePaymentSummary();
        }
    }
}

// 모든 선택 상태 클리어
function clearAllSelections() {
    document.querySelectorAll('.charge-card, .starter-option').forEach(card => {
        card.classList.remove('selected');
        
        // 체크 표시 숨기기
        const checkMark = card.querySelector('.check-mark');
        if (checkMark) {
            checkMark.style.display = 'none';
        }
    });
    
    // 선택된 옵션 배열 초기화
    selectedChargeOptions = [];
    
    // 수량 초기화
    chargeQuantities[1] = 1;
    chargeQuantities[2] = 1;
    chargeQuantities[3] = 1;
    chargeQuantities[4] = 1;
    
    // 직접 입력 관련 변수 초기화
    customAmount = 0;
    isCustomAmount = false;
    isStarterPackageSelected = false;
    starterPackageQuantity = 1;
    
    // 직접 입력 필드 초기화
    const customPointsInput = document.getElementById('customPoints');
    const customCashInput = document.getElementById('customCash');
    if (customPointsInput) {
        customPointsInput.value = '';
    }
    if (customCashInput) {
        customCashInput.value = '';
    }
    
    // 충전 옵션 다시 렌더링하여 UI 완전 초기화
    renderChargeOptions();
}

// 결제 수단 선택
function selectPaymentMethod(methodId) {
    // 이전 선택 제거
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('selected');
    });
    
    // 새 선택 적용
    const selectedMethod = document.querySelector(`[data-method-id="${methodId}"]`);
    if (selectedMethod) {
        selectedMethod.classList.add('selected');
        selectedPaymentMethod = paymentMethods.find(method => method.id === methodId);
        
        // 결제 정보 폼 표시
        showPaymentForm(methodId);
        updateChargeButtonState();
    }
}

// 결제 정보 폼 표시
function showPaymentForm(methodId) {
    const paymentForm = document.getElementById('paymentForm');
    const formContent = document.getElementById('formContent');
    
    if (!paymentForm || !formContent) return;
    
    // 모든 결제 수단에 대해 토스페이먼츠 결제창 안내
    const formHTML = `
        <div style="text-align: center; padding: 20px; color: var(--gray-600);">
            <i class="${selectedPaymentMethod.icon}" style="font-size: 48px; margin-bottom: 16px; color: var(--primary-blue);"></i>
            <p><strong>${selectedPaymentMethod.name}</strong> 결제 수단이 선택되었습니다.</p>
            <p style="font-size: 14px; color: var(--gray-500); margin-top: 8px;">
                결제하기 버튼을 누르면 토스페이먼츠의 안전한 결제창에서 결제를 진행합니다.
            </p>
        </div>
    `;
    
    formContent.innerHTML = formHTML;
    paymentForm.style.display = 'block';
}


// 보너스 포인트 계산
function calculateBonus(amount) {
    if (amount >= 100000) return Math.floor(amount * 0.1);
    if (amount >= 50000) return Math.floor(amount * 0.06);
    if (amount >= 30000) return Math.floor(amount * 0.033);
    return 0;
}

// 결제 요약 업데이트
function updatePaymentSummary() {
    let amount = 0;
    let points = 0;
    let bonus = 0;
    let plusBonus = 0;
    let coupons = 0; // 쿠폰 조각 개수 추가
    
    if (isStarterPackageSelected) {
        amount = starterPackage.amount * starterPackageQuantity;
        points = starterPackage.points * starterPackageQuantity;
        bonus = starterPackage.bonus * starterPackageQuantity;
        coupons = starterPackage.coupon * starterPackageQuantity; // 스타터 패키지 쿠폰
        // 스타터 패키지는 Plus 혜택 없음
    } else if (isCustomAmount && customAmount > 0) {
        amount = customAmount;
        points = amount;
        bonus = 0; // 직접 입력 시 보너스 없음
        coupons = 0; // 직접 입력 시 쿠폰 없음
        // 직접 입력은 Plus 혜택 없음
    } else if (selectedChargeOptions.length > 0) {
        // 복수 선택된 옵션들의 합계 계산
        selectedChargeOptions.forEach(option => {
            const quantity = chargeQuantities[option.id];
            amount += option.amount * quantity;
            points += option.points * quantity;
            bonus += option.bonus * quantity;
            coupons += option.coupon * quantity; // 각 옵션의 쿠폰 개수 추가
        });
        
        // Plus 멤버십 추가 보너스 (결제금액의 5%) - 일반 충전 옵션에만 적용
        if (userInfo.isPlusMember && bonus > 0) {
            plusBonus = Math.floor(amount * 0.05);
            points = points + plusBonus;
        }
    }
    
    const totalPoints = points;
    
    // UI 업데이트
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryBonus = document.getElementById('summaryBonus');
    const summaryCoupon = document.getElementById('summaryCoupon');
    const summaryCouponItem = document.getElementById('summaryCouponItem');
    const couponDivider = document.getElementById('couponDivider');
    const summaryPlusBonus = document.getElementById('summaryPlusBonus');
    const summaryPlusItem = document.getElementById('summaryPlusItem');
    const plusDivider = document.getElementById('plusDivider');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summaryAmount) summaryAmount.textContent = `${amount.toLocaleString()}원`;
    if (summaryBonus) summaryBonus.textContent = `+${bonus.toLocaleString()}P`;
    
    // 쿠폰 조각 표시/숨김
    if (coupons > 0) {
        if (summaryCoupon) summaryCoupon.textContent = `+${coupons}개`;
        if (summaryCouponItem) summaryCouponItem.style.display = 'flex';
        if (couponDivider) couponDivider.style.display = 'block';
    } else {
        if (summaryCouponItem) summaryCouponItem.style.display = 'none';
        if (couponDivider) couponDivider.style.display = 'none';
    }
    
    // Plus 혜택 표시/숨김
    if (plusBonus > 0) {
        if (summaryPlusBonus) summaryPlusBonus.textContent = `+${plusBonus.toLocaleString()}P`;
        if (summaryPlusItem) summaryPlusItem.style.display = 'flex';
        if (plusDivider) plusDivider.style.display = 'block';
    } else {
        if (summaryPlusItem) summaryPlusItem.style.display = 'none';
        if (plusDivider) plusDivider.style.display = 'none';
    }
    
    if (summaryTotal) summaryTotal.textContent = `${totalPoints.toLocaleString()}P`;
    
    updateChargeButtonState();
}

// 결제 버튼 상태 업데이트
function updateChargeButtonState() {
    const chargeBtn = document.getElementById('chargeBtn');
    const termsPayment = document.getElementById('termsPayment');
    const termsPrivacy = document.getElementById('termsPrivacy');
    
    if (!chargeBtn) return;
    
    const hasAmount = (isStarterPackageSelected || selectedChargeOptions.length > 0 || (isCustomAmount && customAmount > 0));
    const hasPaymentMethod = selectedPaymentMethod !== null;
    const termsAgreed = termsPayment?.checked && termsPrivacy?.checked;
    
    const isEnabled = hasAmount && hasPaymentMethod && termsAgreed;
    
    chargeBtn.disabled = !isEnabled;
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 포인트 입력 필드
    const customPointsInput = document.getElementById('customPoints');
    const customCashInput = document.getElementById('customCash');
    
    if (customPointsInput && customCashInput) {
        customPointsInput.addEventListener('input', (e) => {
            // 숫자가 아닌 문자 제거 (콤마 포함)
            const value = e.target.value.replace(/[^\d]/g, '');
            
            // 빈 값 처리
            if (!value) {
                e.target.value = '';
                customCashInput.value = '';
                isCustomAmount = false;
                customAmount = 0;
                updatePaymentSummary();
                return;
            }
            
            const points = parseInt(value) || 0;
            
            // 최대값 체크
            if (points > 200000) {
                showToast('error', '최대 충전 금액은 200,000원입니다.', 'fas fa-exclamation-triangle');
                const correctedPoints = 200000;
                e.target.value = correctedPoints.toLocaleString();
                customCashInput.value = correctedPoints.toLocaleString();
                customAmount = correctedPoints;
                
                // 기존 선택 해제
                clearAllSelections();
                selectedChargeOptions = [];
                isCustomAmount = true;
                isStarterPackageSelected = false;
                
            } else if (points >= 10000) {
                // 기존 선택 완전 해제
                if (!isCustomAmount) {
                    clearAllSelections();
                    selectedChargeOptions = [];
                    isStarterPackageSelected = false;
                }
                
                // 최소값 이상일 때만 처리
                // 입력 필드에 천단위 콤마 적용
                e.target.value = points.toLocaleString();
                // 1포인트 = 1원으로 자동 계산 (천단위 콤마 표시)
                customCashInput.value = points.toLocaleString();
                
                isCustomAmount = true;
                customAmount = points;
                
            } else if (points > 0) {
                // 기존 선택 완전 해제
                if (!isCustomAmount) {
                    clearAllSelections();
                    selectedChargeOptions = [];
                    isStarterPackageSelected = false;
                }
                
                // 1000 미만일 때는 콤마 없이 표시
                e.target.value = points.toString();
                customCashInput.value = points.toString();
                
                isCustomAmount = true;
                customAmount = points;
            }
            
            updatePaymentSummary();
        });
    }
    
    // 전체 약관 동의 체크박스
    const termsAll = document.getElementById('termsAll');
    if (termsAll) {
        termsAll.addEventListener('change', handleAllTermsChange);
    }
    
    // 개별 약관 동의 체크박스들
    const individualTerms = document.querySelectorAll('.individual-term');
    individualTerms.forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualTermChange);
    });
    
    // 결제 버튼 클릭
    const chargeBtn = document.getElementById('chargeBtn');
    if (chargeBtn) {
        chargeBtn.addEventListener('click', handlePaymentSubmit);
    }
}

// 결제 진행
function handlePaymentSubmit() {
    if (!validatePaymentData()) {
        return;
    }
    
    // 스타터 패키지 구매 제한 확인
    if (isStarterPackageSelected && userInfo.starterPackagePurchases >= starterPackage.limitPerAccount) {
        showToast('error', '스타터 패키지는 계정당 최대 2회만 구매 가능합니다.', 'fas fa-exclamation-triangle');
        return;
    }
    
    // 토스페이먼츠 결제 요청
    if (tossPayments && selectedPaymentMethod) {
        requestTossPayment();
    } else {
        // 폴백: 결제 진행 시뮬레이션
        showPaymentProgress();
    }
}

// 토스페이먼츠 결제 요청
function requestTossPayment() {
    let amount, orderId, orderName;
    
    if (isStarterPackageSelected) {
        amount = starterPackage.amount;
        orderId = `starter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        orderName = `WAVE SPACE 스타터 패키지 (${starterPackage.points.toLocaleString()}P)`;
    } else if (isCustomAmount) {
        amount = customAmount;
        orderId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        orderName = `WAVE SPACE 포인트 충전 (${(customAmount + calculateBonus(customAmount)).toLocaleString()}P)`;
    } else {
        // 복수 선택된 옵션들의 총액 계산
        amount = calculateTotalAmount();
        const totalPoints = selectedChargeOptions.reduce((total, option) => {
            return total + (option.points * chargeQuantities[option.id]);
        }, 0);
        orderId = `charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        orderName = `WAVE SPACE 포인트 충전 (${totalPoints.toLocaleString()}P)`;
    }
    
    try {
        tossPayments.requestPayment(selectedPaymentMethod.tossMethod, {
            amount: amount,
            orderId: orderId,
            orderName: orderName,
            customerName: userInfo.name,
            successUrl: `${window.location.origin}/payment-success`,
            failUrl: `${window.location.origin}/payment-fail`,
        });
    } catch (error) {
        console.error('토스페이먼츠 결제 요청 실패:', error);
        showToast('error', '결제 요청 중 오류가 발생했습니다.', 'fas fa-exclamation-triangle');
    }
}

// 결제 데이터 검증
function validatePaymentData() {
    const hasAmount = (isStarterPackageSelected || selectedChargeOptions.length > 0 || (isCustomAmount && customAmount >= 1000));
    const hasPaymentMethod = selectedPaymentMethod !== null;
    const termsPayment = document.getElementById('termsPayment');
    const termsPrivacy = document.getElementById('termsPrivacy');
    const termsAgreed = termsPayment?.checked && termsPrivacy?.checked;
    
    if (!hasAmount) {
        showToast('error', '충전 금액을 선택해주세요.', 'fas fa-exclamation-triangle');
        return false;
    }
    
    if (isCustomAmount && customAmount < 1000) {
        showToast('error', '최소 충전 금액은 1,000원입니다.', 'fas fa-exclamation-triangle');
        return false;
    }
    
    if (isCustomAmount && customAmount > 200000) {
        showToast('error', '최대 충전 금액은 200,000원입니다.', 'fas fa-exclamation-triangle');
        return false;
    }
    
    if (!hasPaymentMethod) {
        showToast('error', '결제 수단을 선택해주세요.', 'fas fa-exclamation-triangle');
        return false;
    }
    
    if (!termsAgreed) {
        showToast('error', '이용약관에 동의해주세요.', 'fas fa-exclamation-triangle');
        return false;
    }
    
    return true;
}

// 결제 진행 상태 표시
function showPaymentProgress() {
    const chargeBtn = document.getElementById('chargeBtn');
    if (!chargeBtn) return;
    
    const originalContent = chargeBtn.innerHTML;
    
    // 로딩 상태로 변경
    chargeBtn.disabled = true;
    chargeBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>결제 진행 중...</span>
    `;
    
    // 3초 후 완료 처리 (실제로는 서버 응답 대기)
    setTimeout(() => {
        // 성공 시뮬레이션
        if (Math.random() > 0.1) { // 90% 성공률
            handlePaymentSuccess();
        } else {
            handlePaymentFailure();
            chargeBtn.disabled = false;
            chargeBtn.innerHTML = originalContent;
        }
    }, 3000);
}

// 결제 성공 처리
function handlePaymentSuccess() {
    let amount, totalPoints;
    
    if (isStarterPackageSelected) {
        amount = starterPackage.amount * starterPackageQuantity;
        totalPoints = starterPackage.points * starterPackageQuantity;
        // 스타터 패키지 구매 횟수 증가 및 localStorage 저장 (구매한 수량만큼)
        userInfo.starterPackagePurchases += starterPackageQuantity;
        saveStarterPackagePurchases(userInfo.starterPackagePurchases);
    } else if (isCustomAmount) {
        amount = customAmount;
        const bonus = calculateBonus(amount);
        const finalBonus = userInfo.isPlusMember ? Math.floor(bonus * 1.05) : bonus;
        totalPoints = amount + finalBonus;
    } else {
        // 복수 선택된 옵션들 처리
        amount = calculateTotalAmount();
        totalPoints = selectedChargeOptions.reduce((total, option) => {
            const quantity = chargeQuantities[option.id];
            return total + (option.points * quantity);
        }, 0);
        
        // Plus 회원 보너스 계산 (결제금액의 5%)
        if (userInfo.isPlusMember) {
            const totalBonus = selectedChargeOptions.reduce((total, option) => {
                const quantity = chargeQuantities[option.id];
                return total + (option.bonus * quantity);
            }, 0);
            if (totalBonus > 0) {
                totalPoints += Math.floor(amount * 0.05);
            }
        }
    }
    
    // 포인트 추가
    userInfo.points += totalPoints;
    
    // UI 업데이트
    updateCurrentPointsDisplay();
    
    // 스타터 패키지인 경우 재렌더링
    if (isStarterPackageSelected) {
        renderStarterPackage();
    }
    
    // 성공 메시지
    const successMessage = isStarterPackageSelected 
        ? `스타터 패키지 구매 완료! ${totalPoints.toLocaleString()}P가 충전되었어요. (남은 구매 가능 횟수: ${starterPackage.limitPerAccount - userInfo.starterPackagePurchases}회)`
        : `${amount.toLocaleString()}원 결제가 완료되었습니다! ${totalPoints.toLocaleString()}P가 충전되었어요.`;
        
    showToast('success', successMessage, 'fas fa-check-circle');
    
    // 폼 초기화
    setTimeout(() => {
        resetForm();
    }, 2000);
}

// 결제 실패 처리
function handlePaymentFailure() {
    showToast('error', '결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.', 'fas fa-exclamation-triangle');
}

// 폼 초기화
function resetForm() {
    selectedChargeOptions = [];
    selectedPaymentMethod = null;
    customAmount = 0;
    isCustomAmount = false;
    isStarterPackageSelected = false;
    starterPackageQuantity = 1;
    
    // UI 초기화
    clearAllSelections();
    
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('selected');
    });
    
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.style.display = 'none';
    }
    
    const termsPayment = document.getElementById('termsPayment');
    const termsPrivacy = document.getElementById('termsPrivacy');
    if (termsPayment) termsPayment.checked = false;
    if (termsPrivacy) termsPrivacy.checked = false;
    
    updatePaymentSummary();
}

// 토스트 메시지 표시
function showToast(type, message, icon) {
    // 기존 토스트가 있다면 제거
    const existingToast = document.querySelector('.toast-message-overlay');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-message-overlay ${type}`;
    toast.innerHTML = `
        <div class="toast-message-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 스타일 추가
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // 3초 후 제거
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// FAQ 토글 함수
function toggleFaq(button) {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    
    // 현재 FAQ 상태 토글
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        answer.classList.remove('active');
    } else {
        // 다른 FAQ들 닫기
        document.querySelectorAll('.faq-question').forEach(q => {
            q.classList.remove('active');
            q.closest('.faq-item').querySelector('.faq-answer').classList.remove('active');
        });
        
        // 현재 FAQ 열기
        button.classList.add('active');
        answer.classList.add('active');
    }
}

// 약관 상세 보기 함수
function showTermsDetail(type) {
    let title, content;
    
    switch (type) {
    case 'payment':
        title = '결제 이용약관';
        content = `
                <h4>제1조 (목적)</h4>
                <p>본 약관은 WAVE SPACE에서 제공하는 포인트 충전 서비스 이용에 관한 사항을 규정함을 목적으로 합니다.</p>
                
                <h4>제2조 (결제 및 환불)</h4>
                <p>1. 포인트 충전은 즉시 처리되며, 충전 완료 시 이메일로 안내됩니다.</p>
                <p>2. 충전일로부터 7일 이내 미사용 포인트에 한해 환불 가능합니다.</p>
                <p>3. 환불 시 결제 수수료를 제외한 금액이 환불됩니다.</p>
                
                <h4>제3조 (서비스 이용제한)</h4>
                <p>부정한 방법으로 포인트를 획득하거나 악용하는 경우 서비스 이용이 제한될 수 있습니다.</p>
            `;
        break;
            
    case 'privacy':
        title = '개인정보 제3자 제공 동의';
        content = `
                <h4>제공받는 자</h4>
                <p>토스페이먼츠(주)</p>
                
                <h4>제공목적</h4>
                <p>안전한 전자결제 서비스 제공</p>
                
                <h4>제공하는 개인정보 항목</h4>
                <p>성명, 휴대폰번호, 결제정보(카드번호는 암호화 처리)</p>
                
                <h4>보유 및 이용기간</h4>
                <p>결제 완료 후 5년간 보관 (전자상거래법에 따름)</p>
                
                <p>위 개인정보 제3자 제공에 대한 동의를 거부할 권리가 있으나, 동의 거부 시 결제 서비스 이용이 불가능합니다.</p>
            `;
        break;
            
    case 'marketing':
        title = '마케팅 정보 수신 동의';
        content = `
                <h4>수집·이용목적</h4>
                <p>이벤트, 할인혜택, 신규 서비스 소식 등 마케팅 정보 제공</p>
                
                <h4>수신방법</h4>
                <p>이메일, SMS, 앱 푸시알림</p>
                
                <h4>보유기간</h4>
                <p>회원 탈퇴 시 또는 마케팅 동의 철회 시까지</p>
                
                <p>마케팅 정보 수신에 동의하지 않아도 서비스 이용에는 제한이 없으며, 언제든지 수신 거부할 수 있습니다.</p>
            `;
        break;
    }
    
    // 간단한 모달 창으로 표시
    const modal = document.createElement('div');
    modal.className = 'terms-modal';
    modal.innerHTML = `
        <div class="terms-modal-backdrop" onclick="this.parentElement.remove()">
            <div class="terms-modal-content" onclick="event.stopPropagation()">
                <div class="terms-modal-header">
                    <h3>${title}</h3>
                    <button class="terms-modal-close" onclick="this.closest('.terms-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="terms-modal-body">
                    ${content}
                </div>
                <div class="terms-modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.terms-modal').remove()">
                        확인
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 전체 약관 동의 처리
function handleAllTermsChange() {
    const allTermsCheckbox = document.getElementById('termsAll');
    const individualTerms = document.querySelectorAll('.individual-term');
    
    if (allTermsCheckbox && allTermsCheckbox.checked) {
        individualTerms.forEach(checkbox => {
            checkbox.checked = true;
        });
    } else {
        individualTerms.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    updateChargeButtonState();
}

// 개별 약관 동의 상태 확인
function handleIndividualTermChange() {
    const allTermsCheckbox = document.getElementById('termsAll');
    const individualTerms = document.querySelectorAll('.individual-term');
    const checkedTerms = document.querySelectorAll('.individual-term:checked');
    
    if (allTermsCheckbox) {
        if (checkedTerms.length === individualTerms.length) {
            allTermsCheckbox.checked = true;
        } else {
            allTermsCheckbox.checked = false;
        }
    }
    
    updateChargeButtonState();
}

// 전역 함수 등록
window.selectChargeOption = selectChargeOption;
window.selectPaymentMethod = selectPaymentMethod;
window.selectStarterPackage = selectStarterPackage;
window.increaseStarterQuantity = increaseStarterQuantity;
window.decreaseStarterQuantity = decreaseStarterQuantity;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.toggleFaq = toggleFaq;
window.showTermsDetail = showTermsDetail;

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.points-charge-container')) {
        initPointsCharge();
    }
});

// 전역 객체로 내보내기
window.PointsCharge = {
    initPointsCharge,
    selectChargeOption,
    selectPaymentMethod,
    selectStarterPackage,
    updatePaymentSummary,
    handlePaymentSubmit,
    chargeOptions,
    paymentMethods,
    starterPackage,
    userInfo
};

// 전역 변수로 등록 (인라인 이벤트 핸들러에서 접근 가능하도록)
window.starterPackage = starterPackage;
window.userInfo = userInfo;