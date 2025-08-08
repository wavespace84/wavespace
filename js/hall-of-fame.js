// 명예의전당 페이지 JavaScript

console.log('hall-of-fame.js 파일 로드 시작');

document.addEventListener('DOMContentLoaded', function() {
    console.log('hall-of-fame.js DOMContentLoaded 이벤트 발생');
    
    // 초기 애니메이션 실행
    initializeAnimations();
    
    // 기간 선택 버튼
    const periodBtns = document.querySelectorAll('.period-btn');
    console.log('기간 선택 버튼 개수:', periodBtns.length);
    
    periodBtns.forEach((btn, index) => {
        console.log(`기간 버튼 ${index + 1} 등록:`, btn.textContent.trim());
        
        btn.addEventListener('click', function() {
            console.log('기간 버튼 클릭됨:', this.textContent.trim());
            
            // 모든 버튼에서 active 클래스 제거
            periodBtns.forEach(b => b.classList.remove('active'));
            // 클릭한 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 선택한 기간에 따라 데이터 로드
            const period = this.dataset.period;
            loadRankingData(period);
            
            // 카드 업데이트 애니메이션
            animateCardUpdate();
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

// 초기 애니메이션 함수
function initializeAnimations() {
    console.log('초기 애니메이션 시작');
    
    // TOP 3 카드 애니메이션
    const topCards = document.querySelectorAll('.top-user-card');
    topCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = card.classList.contains('first-place') ? 'scale(1.05)' : 'translateY(0)';
        }, index * 200);
    });
    
    // 배지 카드 애니메이션
    const badgeCards = document.querySelectorAll('.badge-card');
    badgeCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 800 + (index * 100));
    });
    
    // 랭킹 아이템 애니메이션
    const rankingItems = document.querySelectorAll('.ranking-item');
    rankingItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 1000 + (index * 50));
    });
}

// 카드 업데이트 애니메이션
function animateCardUpdate() {
    console.log('카드 업데이트 애니메이션 실행');
    
    const topCards = document.querySelectorAll('.top-user-card');
    const rankingItems = document.querySelectorAll('.ranking-item');
    
    // TOP 3 카드 업데이트 애니메이션
    topCards.forEach((card, index) => {
        card.style.transform = 'scale(0.95)';
        card.style.opacity = '0.7';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = card.classList.contains('first-place') ? 'scale(1.05)' : 'scale(1)';
        }, index * 100);
    });
    
    // 랭킹 아이템 업데이트 애니메이션
    rankingItems.forEach((item, index) => {
        item.style.opacity = '0.5';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease';
            item.style.opacity = '1';
        }, 300 + (index * 50));
    });
}

// 랭킹 디스플레이 업데이트
function updateRankingDisplay(period) {
    console.log(`Updating display for ${period} period`);
    
    // 기간별 데이터 시뮬레이션
    const periodData = {
        monthly: {
            first: { name: '김영업', points: '12,450P', posts: '456', likes: '2,567' },
            second: { name: '이기획', points: '8,750P', posts: '234', likes: '1,234' },
            third: { name: '박팀장', points: '7,230P', posts: '189', likes: '987' }
        },
        weekly: {
            first: { name: '이기획', points: '890P', posts: '23', likes: '156' },
            second: { name: '김영업', points: '678P', posts: '18', likes: '134' },
            third: { name: '최전문가', points: '567P', posts: '15', likes: '89' }
        },
        all: {
            first: { name: '김영업', points: '45,890P', posts: '1,234', likes: '8,567' },
            second: { name: '이기획', points: '38,750P', posts: '987', likes: '6,234' },
            third: { name: '박팀장', points: '32,230P', posts: '789', likes: '4,987' }
        }
    };
    
    // 실제 데이터 업데이트는 여기서 구현
    // 현재는 애니메이션만 실행
    animateCardUpdate();
}