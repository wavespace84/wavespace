/**
 * WAVE SPACE - Authentication Guard
 * 페이지 접근 제어 및 인증 상태 관리
 */

class AuthGuard {
    constructor() {
        this.protectedPages = [
            'qna.html', 
            'attendance.html',
            'points-ranking.html',
            'points-shop.html',
            'points-charge.html',
            'hall-of-fame.html',
            'profile.html',
            'game.html'
        ];
    }

    /**
     * 현재 페이지가 보호된 페이지인지 확인
     */
    isProtectedPage() {
        const currentPage = window.location.pathname.split('/').pop();
        return this.protectedPages.includes(currentPage);
    }

    /**
     * 로그인 상태 확인
     */
    isLoggedIn() {
        try {
            const user = JSON.parse(localStorage.getItem('waveUser') || '{}');
            return !!(user.id && user.username);
        } catch {
            return false;
        }
    }

    /**
     * 페이지 접근 제어 실행
     */
    checkPageAccess() {
        if (this.isProtectedPage() && !this.isLoggedIn()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    /**
     * 로그인 페이지로 리다이렉트
     */
    redirectToLogin() {
        const currentUrl = encodeURIComponent(window.location.href);
        const redirectParam = `?redirect=${currentUrl}`;
        
        // 토스트 메시지 표시 (가능한 경우)
        if (window.showToast) {
            window.showToast('로그인이 필요한 페이지입니다.', 'warning');
        }
        
        // 1초 후 리다이렉트 (토스트 메시지 표시 시간)
        setTimeout(() => {
            window.location.href = `login.html${redirectParam}`;
        }, 1000);
    }

    /**
     * 특정 기능에 대한 로그인 체크
     */
    requireAuth(featureName = '기능') {
        if (!this.isLoggedIn()) {
            if (window.showToast) {
                window.showToast(`${featureName} 이용을 위해 로그인이 필요합니다.`, 'warning');
            }
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    /**
     * 관리자 권한 확인
     */
    requireAdmin() {
        if (!this.isLoggedIn()) {
            this.requireAuth();
            return false;
        }

        const user = JSON.parse(localStorage.getItem('waveUser') || '{}');
        if (user.role !== 'admin') {
            if (window.showToast) {
                window.showToast('관리자 권한이 필요합니다.', 'error');
            }
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    /**
     * 인증된 사용자 권한 확인
     */
    requireVerified() {
        if (!this.isLoggedIn()) {
            this.requireAuth();
            return false;
        }

        const user = JSON.parse(localStorage.getItem('waveUser') || '{}');
        if (user.role !== 'verified' && user.role !== 'admin') {
            if (window.showToast) {
                window.showToast('인증된 사용자만 이용 가능한 기능입니다.', 'warning');
            }
            return false;
        }
        return true;
    }
}

// 전역 인스턴스 생성
const authGuard = new AuthGuard();

// 페이지 로드 시 자동 체크
document.addEventListener('DOMContentLoaded', () => {
    authGuard.checkPageAccess();
});

// 전역 접근 가능하도록 설정
window.authGuard = authGuard;