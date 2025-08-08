// 명예의전당 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 기간 선택 버튼
    const periodBtns = document.querySelectorAll('.period-btn');
    
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 버튼에서 active 클래스 제거
            periodBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 선택한 기간에 따라 데이터 로드
            const period = this.dataset.period;
            loadRankingData(period);
        });
    });
    
    // 필터 선택
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const category = this.value;
            filterRankingData(category);
        });
    }
    
    // 페이지네이션
    const pageBtns = document.querySelectorAll('.page-btn:not(.prev):not(.next)');
    
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            // 모든 페이지 버튼에서 active 클래스 제거
            pageBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 페이지 데이터 로드
            const pageNumber = this.textContent;
            loadPageData(pageNumber);
        });
    });
    
    // 이전/다음 버튼
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (this.disabled) return;
            navigatePage('prev');
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (this.disabled) return;
            navigatePage('next');
        });
    }
    
    // 랭킹 아이템 호버 효과
    const rankingItems = document.querySelectorAll('.ranking-item');
    
    rankingItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
        
        item.addEventListener('click', function() {
            // 유저 프로필 페이지로 이동
            const userName = this.querySelector('.user-name').textContent;
            console.log(`Navigating to profile: ${userName}`);
            // window.location.href = `/profile/${userName}`;
        });
    });
    
    // TOP 3 카드 애니메이션
    const rankCards = document.querySelectorAll('.rank-card');
    
    rankCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            
            if (card.classList.contains('gold')) {
                card.style.transform = 'translateY(0) scale(1.05)';
            }
        }, index * 150);
    });
    
    // 뱃지 아이템 호버 효과
    const badgeItems = document.querySelectorAll('.badge-item');
    
    badgeItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const badgeIcon = this.querySelector('.badge-icon');
            badgeIcon.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        item.addEventListener('mouseleave', function() {
            const badgeIcon = this.querySelector('.badge-icon');
            badgeIcon.style.transform = 'scale(1) rotate(0)';
        });
    });
});

// 랭킹 데이터 로드 함수
function loadRankingData(period) {
    console.log(`Loading ${period} ranking data...`);
    
    // 로딩 애니메이션 표시
    showLoadingAnimation();
    
    // 실제 구현 시 API 호출
    setTimeout(() => {
        // 데이터 로드 완료
        hideLoadingAnimation();
        updateRankingDisplay(period);
    }, 500);
}

// 필터링 함수
function filterRankingData(category) {
    console.log(`Filtering by: ${category}`);
    
    // 실제 구현 시 필터링 로직
    const rankingItems = document.querySelectorAll('.ranking-item');
    rankingItems.forEach(item => {
        item.style.opacity = '0';
        setTimeout(() => {
            item.style.opacity = '1';
        }, 100);
    });
}

// 페이지 데이터 로드
function loadPageData(pageNumber) {
    console.log(`Loading page ${pageNumber}...`);
    
    // 실제 구현 시 페이지 데이터 로드
    const rankingList = document.querySelector('.ranking-list');
    if (rankingList) {
        rankingList.style.opacity = '0.5';
        setTimeout(() => {
            rankingList.style.opacity = '1';
        }, 300);
    }
}

// 페이지 네비게이션
function navigatePage(direction) {
    const activeBtn = document.querySelector('.page-btn.active');
    const pageBtns = Array.from(document.querySelectorAll('.page-btn:not(.prev):not(.next)'));
    const currentIndex = pageBtns.indexOf(activeBtn);
    
    let newIndex;
    if (direction === 'prev') {
        newIndex = Math.max(0, currentIndex - 1);
    } else {
        newIndex = Math.min(pageBtns.length - 1, currentIndex + 1);
    }
    
    if (newIndex !== currentIndex) {
        pageBtns[currentIndex].classList.remove('active');
        pageBtns[newIndex].classList.add('active');
        pageBtns[newIndex].click();
        
        // 이전/다음 버튼 상태 업데이트
        updateNavigationButtons(newIndex, pageBtns.length);
    }
}

// 네비게이션 버튼 상태 업데이트
function updateNavigationButtons(currentIndex, totalPages) {
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    
    if (prevBtn) {
        prevBtn.disabled = currentIndex === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentIndex === totalPages - 1;
    }
}

// 로딩 애니메이션 표시
function showLoadingAnimation() {
    const rankingList = document.querySelector('.ranking-list');
    if (rankingList) {
        rankingList.style.opacity = '0.3';
        rankingList.style.pointerEvents = 'none';
    }
}

// 로딩 애니메이션 숨기기
function hideLoadingAnimation() {
    const rankingList = document.querySelector('.ranking-list');
    if (rankingList) {
        rankingList.style.opacity = '1';
        rankingList.style.pointerEvents = 'auto';
    }
}

// 랭킹 디스플레이 업데이트
function updateRankingDisplay(period) {
    console.log(`Updating display for ${period} period`);
    
    // TOP 3 업데이트 애니메이션
    const rankCards = document.querySelectorAll('.rank-card');
    rankCards.forEach((card, index) => {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = card.classList.contains('gold') ? 'scale(1.05)' : 'scale(1)';
        }, 100);
    });
}