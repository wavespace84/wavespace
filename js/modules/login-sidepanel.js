// login-sidepanel.js - 로그인 사이드패널 모듈

class LoginSidepanelLoader {
    constructor() {
        this.loaded = false;
    }

    /**
     * 로그인 사이드패널 로드
     */
    async loadLoginSidepanel() {
        try {
            if (this.loaded) {
                console.log('[LoginSidepanel] 이미 로드됨');
                return;
            }

            // HTML 컴포넌트 로드
            const response = await fetch('/components/login-sidepanel.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            
            // body에 추가
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv.firstElementChild);
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 전역 함수 등록
            this.registerGlobalFunctions();
            
            this.loaded = true;
            console.log('[LoginSidepanel] 로그인 사이드패널 로드 완료');
            
        } catch (error) {
            console.error('[LoginSidepanel] 로그인 사이드패널 로드 실패:', error);
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 외부 클릭으로 사이드패널 닫기
        const loginSidepanelOverlay = document.getElementById('loginSidepanel');
        if (loginSidepanelOverlay) {
            loginSidepanelOverlay.addEventListener('click', (e) => {
                if (e.target === loginSidepanelOverlay) {
                    closeLoginSidepanel();
                }
            });
        }

        // ESC 키로 사이드패널 닫기 (전역 이벤트)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const loginSidepanel = document.getElementById('loginSidepanel');
                if (loginSidepanel && loginSidepanel.classList.contains('show')) {
                    closeLoginSidepanel();
                }
            }
        });

        console.log('[LoginSidepanel] 이벤트 리스너 설정 완료');
    }

    /**
     * 전역 함수 등록
     */
    registerGlobalFunctions() {
        // 로그인 사이드패널 제어 함수들을 전역으로 등록
        window.openLoginSidepanel = openLoginSidepanel;
        window.closeLoginSidepanel = closeLoginSidepanel;
        window.socialLogin = socialLogin;
        window.showPasswordReset = showPasswordReset;

        console.log('[LoginSidepanel] 전역 함수 등록 완료');
    }
}

// 로그인 사이드패널 제어 함수들
function openLoginSidepanel() {
    if (window.authService && typeof window.authService.openLoginSidepanel === 'function') {
        window.authService.openLoginSidepanel();
    } else {
        // 폴백: 직접 사이드패널 제어
        const sidepanel = document.getElementById('loginSidepanel');
        if (sidepanel) {
            sidepanel.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
}

function closeLoginSidepanel() {
    if (window.authService && typeof window.authService.closeLoginSidepanel === 'function') {
        window.authService.closeLoginSidepanel();
    } else {
        // 폴백: 직접 사이드패널 제어
        const sidepanel = document.getElementById('loginSidepanel');
        if (sidepanel) {
            sidepanel.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
}

// 소셜 로그인 함수
function socialLogin(provider) {
    console.log('소셜 로그인:', provider);
    if (window.authService && typeof window.authService.socialLogin === 'function') {
        window.authService.socialLogin(provider);
    } else {
        alert('소셜 로그인 기능을 준비 중입니다.');
    }
}

// 비밀번호 재설정 함수
function showPasswordReset() {
    console.log('비밀번호 재설정');
    if (window.authService && typeof window.authService.showPasswordReset === 'function') {
        window.authService.showPasswordReset();
    } else {
        alert('비밀번호 재설정 기능을 준비 중입니다.');
    }
}

// 로그인 사이드패널 초기화 함수
export async function initLoginSidepanel() {
    const loader = new LoginSidepanelLoader();
    await loader.loadLoginSidepanel();
}

// 기본 export
export { LoginSidepanelLoader };