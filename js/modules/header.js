// header.js - 헤더 관련 기능

export function initHeader() {
    const header = document.querySelector('.main-header');
    const searchBtn = document.querySelector('.header-icon-btn:first-child');
    const notificationBtn = document.querySelector('.notification-btn');
    const userProfile = document.querySelector('.user-profile');
    
    // 검색 버튼 클릭
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            // TODO: 검색 모달 열기
            console.log('Search clicked');
        });
    }
    
    // 알림 버튼 클릭
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            // TODO: 알림 드롭다운 열기
            console.log('Notifications clicked');
        });
    }
    
    // 사용자 프로필 클릭
    if (userProfile) {
        userProfile.addEventListener('click', () => {
            // TODO: 사용자 메뉴 드롭다운 열기
            console.log('User profile clicked');
        });
    }
    
    // 스크롤 시 헤더 스타일 변경
    let lastScrollTop = 0;
    const mainContainer = document.querySelector('.main-container');
    
    if (mainContainer) {
        mainContainer.addEventListener('scroll', () => {
            const scrollTop = mainContainer.scrollTop;
            
            // 스크롤 다운/업 감지
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // 스크롤 다운 - 헤더 숨기기
                header.style.transform = 'translateY(-100%)';
            } else {
                // 스크롤 업 - 헤더 보이기
                header.style.transform = 'translateY(0)';
                
                // 스크롤이 상단에 있을 때
                if (scrollTop < 10) {
                    header.style.backgroundColor = 'transparent';
                    header.style.boxShadow = 'none';
                } else {
                    header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    header.style.backdropFilter = 'blur(10px)';
                    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                }
            }
            
            lastScrollTop = scrollTop;
        });
    }
}