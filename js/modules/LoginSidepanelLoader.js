/**
 * LoginSidepanelLoader - 로그인 사이드패널 동적 로더
 * 모든 페이지에서 공통으로 사용되는 로그인 사이드패널을 동적으로 로드
 */

class LoginSidepanelLoader {
    constructor() {
        this.isLoaded = false;
        this.loadPromise = null;
        this.init();
    }

    async init() {
        try {
            // 페이지 로드 완료 후 자동으로 사이드패널 로드
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.loadSidepanel());
            } else {
                await this.loadSidepanel();
            }
        } catch (error) {
            console.error('LoginSidepanelLoader 초기화 오류:', error);
        }
    }

    async loadSidepanel() {
        // 이미 로드 중이면 기존 프로미스 반환
        if (this.loadPromise) {
            return this.loadPromise;
        }

        // 이미 로드된 경우
        if (this.isLoaded) {
            return true;
        }

        this.loadPromise = this._loadSidepanelContent();
        return this.loadPromise;
    }

    async _loadSidepanelContent() {
        try {
            const container = document.getElementById('login-sidepanel-container');
            if (!container) {
                console.warn('로그인 사이드패널 컨테이너를 찾을 수 없습니다.');
                return false;
            }

            // 사이드패널 HTML 로드
            const response = await fetch('/components/login-sidepanel.html?v=7');
            if (!response.ok) {
                throw new Error(`사이드패널 로드 실패: ${response.status}`);
            }

            const html = await response.text();
            container.innerHTML = html;

            // 이벤트 리스너 설정
            this.setupEventListeners();

            this.isLoaded = true;
            console.log('✅ 로그인 사이드패널 로드 완료');
            return true;

        } catch (error) {
            console.error('로그인 사이드패널 로드 오류:', error);
            this.isLoaded = false;
            return false;
        }
    }

    setupEventListeners() {
        const sidepanelElement = document.getElementById('loginSidepanel');
        if (!sidepanelElement) {
            console.error('로그인 사이드패널 요소를 찾을 수 없습니다.');
            return;
        }

        // 닫기 버튼 이벤트
        const closeBtn = sidepanelElement.querySelector('button[data-action="close"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideSidepanel());
        }

        // 오버레이 클릭으로 닫기
        const overlay = sidepanelElement.querySelector('.login-sidepanel-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideSidepanel();
                }
            });
        }

        // 로그인 폼 이벤트
        const loginForm = sidepanelElement.querySelector('#sidepanelLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(e);
            });
        }

        // 소셜 로그인 버튼들
        const socialButtons = sidepanelElement.querySelectorAll('button[data-action="social-login"]');
        socialButtons.forEach(button => {
            button.addEventListener('click', () => {
                const provider = button.getAttribute('data-provider');
                this.handleSocialLogin(provider);
            });
        });

        // 비밀번호 재설정 링크
        const passwordResetLink = sidepanelElement.querySelector('a[data-action="password-reset"]');
        if (passwordResetLink) {
            passwordResetLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePasswordReset();
            });
        }
        
        // 비밀번호 재설정 폼
        const passwordResetForm = sidepanelElement.querySelector('#passwordResetForm');
        if (passwordResetForm) {
            passwordResetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePasswordResetSubmit(e);
            });
        }
        
        // "로그인으로 돌아가기" 링크들
        const backToLoginLinks = sidepanelElement.querySelectorAll('a[data-action="back-to-login"], button[data-action="back-to-login"]');
        backToLoginLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('login');
            });
        });
        
        // 이메일 재발송 버튼
        const resendEmailBtn = sidepanelElement.querySelector('#resend-email-btn');
        if (resendEmailBtn) {
            resendEmailBtn.addEventListener('click', () => {
                this.handleResendEmail();
            });
        }

        // 이메일 서비스 바로가기 버튼들
        const emailServiceButtons = sidepanelElement.querySelectorAll('button[data-action="open-email"]');
        emailServiceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const service = button.getAttribute('data-service');
                this.handleOpenEmailService(service);
            });
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hideSidepanel();
            }
        });
    }

    async showLoginSidepanel() {
        try {
            // 사이드패널이 로드되지 않은 경우 먼저 로드
            if (!this.isLoaded) {
                const loaded = await this.loadSidepanel();
                if (!loaded) {
                    throw new Error('사이드패널 로드에 실패했습니다.');
                }
            }

            const sidepanelElement = document.getElementById('loginSidepanel');
            if (sidepanelElement) {
                // 기존 오류 메시지 초기화
                const errorMessage = sidepanelElement.querySelector('#sidepanel-login-error-message');
                if (errorMessage) {
                    errorMessage.style.display = 'none';
                    errorMessage.textContent = '';
                }

                // 입력 필드 초기화
                const usernameInput = sidepanelElement.querySelector('#sidepanel-login-username');
                const passwordInput = sidepanelElement.querySelector('#sidepanel-login-password');
                if (usernameInput) usernameInput.value = '';
                if (passwordInput) passwordInput.value = '';

                // 사이드패널 표시
                sidepanelElement.classList.add('show');
                document.body.style.overflow = 'hidden'; // 스크롤 방지

                // 첫 번째 입력 필드에 포커스
                setTimeout(() => {
                    if (usernameInput) usernameInput.focus();
                }, 100);
            }
        } catch (error) {
            console.error('로그인 사이드패널 표시 오류:', error);
            // 폴백으로 로그인 페이지로 이동
            window.location.href = 'login.html';
        }
    }

    hideSidepanel() {
        const sidepanelElement = document.getElementById('loginSidepanel');
        if (sidepanelElement) {
            sidepanelElement.classList.remove('show');
            document.body.style.overflow = ''; // 스크롤 복원
            
            // 타이머 정리
            if (this.resendTimerInterval) {
                clearInterval(this.resendTimerInterval);
                this.resendTimerInterval = null;
            }
            
            // 로그인 뷰로 초기화
            setTimeout(() => {
                this.switchView('login');
            }, 300);
        }
    }

    isVisible() {
        const sidepanelElement = document.getElementById('loginSidepanel');
        return sidepanelElement && sidepanelElement.classList.contains('show');
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const sidepanelElement = document.getElementById('loginSidepanel');
        const username = sidepanelElement.querySelector('#sidepanel-login-username').value;
        const password = sidepanelElement.querySelector('#sidepanel-login-password').value;
        const errorDiv = sidepanelElement.querySelector('#sidepanel-login-error-message');

        try {
            if (window.authService) {
                await window.authService.signIn(username, password);
                // 로그인 성공 시 사이드패널 닫기 및 페이지 이동
                this.hideSidepanel();
                window.location.href = 'index.html';
            } else {
                console.error('AuthService가 로드되지 않았습니다.');
                throw new Error('로그인 서비스를 초기화하는 중입니다. 잠시 후 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('로그인 실패:', error);
            if (errorDiv) {
                errorDiv.textContent = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
                errorDiv.style.display = 'block';
            }
        }
    }

    handleSocialLogin(provider) {
        if (window.authService && typeof window.authService.socialLogin === 'function') {
            window.authService.socialLogin(provider);
        } else {
            alert('소셜 로그인 기능을 준비 중입니다.');
        }
    }

    handlePasswordReset() {
        // 비밀번호 찾기 뷰로 전환
        this.switchView('password-reset');
    }
    
    /**
     * 뷰 전환 메서드
     */
    switchView(viewName) {
        const sidepanelElement = document.getElementById('loginSidepanel');
        if (!sidepanelElement) return;
        
        // 모든 뷰 숨기기
        const allViews = sidepanelElement.querySelectorAll('.login-content[data-view]');
        allViews.forEach(view => {
            view.style.display = 'none';
        });
        
        // 선택한 뷰 표시
        const targetView = sidepanelElement.querySelector(`[data-view="${viewName}"]`);
        if (targetView) {
            targetView.style.display = 'block';
        }
        
        // 헤더 업데이트
        const titleIcon = document.getElementById('sidepanel-icon');
        const titleText = document.getElementById('sidepanel-title-text');
        const welcomeMessage = document.getElementById('sidepanel-welcome-message');
        
        switch(viewName) {
        case 'login':
            if (titleIcon) titleIcon.className = 'fas fa-sign-in-alt';
            if (titleText) titleText.textContent = '로그인';
            if (welcomeMessage) welcomeMessage.style.display = 'block';
            // 로그인 뷰에서 첫 번째 입력 필드에 포커스
            setTimeout(() => {
                const firstInput = sidepanelElement.querySelector('#sidepanel-login-username');
                if (firstInput) firstInput.focus();
            }, 100);
            break;
        case 'password-reset':
            if (titleIcon) titleIcon.className = 'fas fa-key';
            if (titleText) titleText.textContent = '비밀번호 찾기';
            if (welcomeMessage) welcomeMessage.style.display = 'none';
            // 비밀번호 찾기 뷰에서 이메일 입력 필드에 포커스
            setTimeout(() => {
                const emailInput = sidepanelElement.querySelector('#reset-email');
                if (emailInput) {
                    emailInput.focus();
                    // 기존 내용이 있다면 선택
                    emailInput.select();
                }
            }, 100);
            break;
        case 'email-sent':
            if (titleIcon) titleIcon.className = 'fas fa-envelope-circle-check';
            if (titleText) titleText.textContent = '이메일 발송 완료';
            if (welcomeMessage) welcomeMessage.style.display = 'none';
            break;
        }
    }
    
    /**
     * 비밀번호 재설정 폼 제출 처리
     */
    async handlePasswordResetSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = form.querySelector('#reset-email').value;
        const errorDiv = document.getElementById('reset-error-message');
        const successDiv = document.getElementById('reset-success-message');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // 에러 메시지 초기화
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }
        if (successDiv) {
            successDiv.style.display = 'none';
        }
        
        // 버튼 로딩 상태
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 발송 중...';
        }
        
        try {
            if (window.authService) {
                const result = await window.authService.resetPassword(email);
                
                // 보안을 위해 성공/실패와 관계없이 항상 성공 화면 표시
                // (이메일 존재 여부를 노출하지 않기 위함)
                if (result.success || !result.error.includes('제한')) {
                    // 이메일 발송 화면 표시
                    this.lastResetEmail = email;
                    this.showEmailSentView(email);
                    
                    // 폼 초기화
                    form.reset();
                } else {
                    // Rate Limiting 에러인 경우에만 에러 표시
                    if (errorDiv) {
                        errorDiv.textContent = result.error;
                        errorDiv.style.display = 'block';
                    }
                }
            } else {
                throw new Error('인증 서비스를 사용할 수 없습니다.');
            }
        } catch (error) {
            console.error('임시 비밀번호 발송 요청 실패:', error);
            if (errorDiv) {
                errorDiv.textContent = '임시 비밀번호 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                errorDiv.style.display = 'block';
            }
        } finally {
            // 버튼 상태 복원
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '임시 비밀번호 받기';
            }
        }
    }
    
    /**
     * 이메일 발송 완료 화면 표시
     */
    showEmailSentView(email) {
        // 이메일 주소 표시
        const emailSpan = document.getElementById('sent-email-address');
        if (emailSpan) {
            emailSpan.textContent = email;
        }
        
        // 뷰 전환
        this.switchView('email-sent');
        
        // 재발송 타이머 시작
        this.startResendTimer();
    }
    
    /**
     * 재발송 타이머 관리
     */
    startResendTimer() {
        const resendBtn = document.getElementById('resend-email-btn');
        const timerSpan = document.getElementById('resend-timer');
        
        if (!resendBtn || !timerSpan) return;
        
        let timeLeft = 60;
        resendBtn.disabled = true;
        
        if (this.resendTimerInterval) {
            clearInterval(this.resendTimerInterval);
        }
        
        this.resendTimerInterval = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(this.resendTimerInterval);
                resendBtn.disabled = false;
                resendBtn.innerHTML = '<i class="fas fa-redo"></i> <span>다시 보내기</span>';
            }
        }, 1000);
    }
    
    /**
     * 이메일 재발송 처리
     */
    async handleResendEmail() {
        if (!this.lastResetEmail) return;
        
        const resendBtn = document.getElementById('resend-email-btn');
        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 발송 중...';
        }
        
        try {
            if (window.authService) {
                const result = await window.authService.resetPassword(this.lastResetEmail);
                
                if (result.success) {
                    // 성공 메시지 표시
                    if (window.showToastMessage) {
                        window.showToastMessage('이메일을 다시 발송했습니다.', 'success');
                    }
                    
                    // 타이머 재시작
                    this.startResendTimer();
                } else {
                    throw new Error(result.error || '재발송 실패');
                }
            }
        } catch (error) {
            console.error('이메일 재발송 실패:', error);
            if (window.showToastMessage) {
                window.showToastMessage('이메일 재발송에 실패했습니다.', 'error');
            }
            
            // 버튼 상태 복원
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.innerHTML = '<i class="fas fa-redo"></i> <span>다시 보내기</span>';
            }
        }
    }

    /**
     * 이메일 서비스 바로가기 처리
     */
    handleOpenEmailService(service) {
        let url;
        
        switch(service) {
        case 'google':
            url = 'https://gmail.com';
            break;
        case 'naver':
            url = 'https://mail.naver.com';
            break;
        default:
            console.error('지원하지 않는 이메일 서비스:', service);
            return;
        }
        
        // 새 창으로 이메일 서비스 열기
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

// 전역 인스턴스 생성 및 등록
const loginSidepanelLoader = new LoginSidepanelLoader();
window.loginSidepanelLoader = loginSidepanelLoader;

console.log('📱 LoginSidepanelLoader 초기화 완료');