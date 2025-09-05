/**
 * 비밀번호 재설정 페이지 스크립트
 */

class PasswordResetManager {
    constructor() {
        this.form = document.getElementById('resetPasswordForm');
        this.formContainer = document.getElementById('reset-form-container');
        this.successContainer = document.getElementById('success-container');
        this.errorContainer = document.getElementById('error-container');
        this.errorMessage = document.getElementById('reset-error-message');
        this.strengthIndicator = document.getElementById('strength-indicator');
        this.strengthText = document.getElementById('strength-text');
        
        this.accessToken = null;
        this.init();
    }
    
    async init() {
        // URL에서 토큰 추출
        this.extractTokenFromUrl();
        
        if (!this.accessToken) {
            this.showErrorView();
            return;
        }
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 토큰 유효성 검증
        await this.verifyToken();
    }
    
    extractTokenFromUrl() {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        this.accessToken = hashParams.get('access_token');
        
        // fragment에서 찾지 못하면 query parameter에서 시도
        if (!this.accessToken) {
            const queryParams = new URLSearchParams(window.location.search);
            this.accessToken = queryParams.get('access_token');
        }
    }
    
    async verifyToken() {
        try {
            // Supabase 클라이언트 대기
            await this.waitForSupabase();
            
            // 토큰을 사용하여 세션 설정
            const { data, error } = await window.WaveSupabase.getClient().auth.setSession({
                access_token: this.accessToken,
                refresh_token: this.accessToken // Supabase는 access_token만 필요
            });
            
            if (error) {
                console.error('토큰 검증 실패:', error);
                this.showErrorView();
                return;
            }
            
            console.log('✅ 토큰 검증 성공');
        } catch (error) {
            console.error('토큰 검증 중 오류:', error);
            this.showErrorView();
        }
    }
    
    async waitForSupabase(maxAttempts = 50, delay = 100) {
        let attempts = 0;
        while (attempts < maxAttempts && (!window.WaveSupabase || !window.WaveSupabase.getClient)) {
            await new Promise(resolve => setTimeout(resolve, delay));
            attempts++;
        }
        if (!window.WaveSupabase || !window.WaveSupabase.getClient) {
            throw new Error('Supabase 초기화 실패');
        }
    }
    
    setupEventListeners() {
        // 폼 제출
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // 비밀번호 입력 필드
        const passwordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        passwordInput.addEventListener('input', () => this.validatePassword());
        confirmPasswordInput.addEventListener('input', () => this.checkPasswordMatch());
        
        // 비밀번호 보기/숨기기 토글
        document.querySelectorAll('.password-toggle').forEach(button => {
            button.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });
    }
    
    togglePasswordVisibility(event) {
        const button = event.currentTarget;
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
    
    validatePassword() {
        const password = document.getElementById('new-password').value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };
        
        // 요구사항 표시 업데이트
        Object.keys(requirements).forEach(req => {
            const item = document.querySelector(`[data-requirement="${req}"]`);
            if (item) {
                if (requirements[req]) {
                    item.classList.add('met');
                    item.querySelector('i').className = 'fas fa-check-circle';
                } else {
                    item.classList.remove('met');
                    item.querySelector('i').className = 'fas fa-circle';
                }
            }
        });
        
        // 강도 계산
        const metCount = Object.values(requirements).filter(Boolean).length;
        let strength = '';
        let strengthClass = '';
        
        if (metCount <= 2) {
            strength = '약함';
            strengthClass = 'weak';
        } else if (metCount <= 4) {
            strength = '보통';
            strengthClass = 'medium';
        } else {
            strength = '강함';
            strengthClass = 'strong';
        }
        
        // UI 업데이트
        this.strengthIndicator.className = `password-strength-fill ${strengthClass}`;
        this.strengthText.textContent = password ? `비밀번호 강도: ${strength}` : '비밀번호를 입력하세요';
        
        // 비밀번호 일치 확인
        this.checkPasswordMatch();
        
        return metCount >= 3; // 최소 3개 이상의 요구사항을 만족해야 함
    }
    
    checkPasswordMatch() {
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (confirmPassword && password !== confirmPassword) {
            document.getElementById('confirm-password').setCustomValidity('비밀번호가 일치하지 않습니다.');
        } else {
            document.getElementById('confirm-password').setCustomValidity('');
        }
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // 유효성 검사
        if (!this.validatePassword()) {
            this.showError('비밀번호가 요구사항을 충족하지 않습니다.');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        // 버튼 로딩 상태
        const submitButton = this.form.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        try {
            // 비밀번호 업데이트
            const { error } = await window.WaveSupabase.getClient().auth.updateUser({
                password: password
            });
            
            if (error) {
                throw error;
            }
            
            // 성공 화면 표시
            this.showSuccessView();
            
            // 로그아웃 처리 (새 비밀번호로 다시 로그인하도록)
            await window.WaveSupabase.getClient().auth.signOut();
            
        } catch (error) {
            console.error('비밀번호 재설정 실패:', error);
            this.showError('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        
        // 3초 후 에러 메시지 숨기기
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, 3000);
    }
    
    showSuccessView() {
        this.formContainer.style.display = 'none';
        this.successContainer.style.display = 'block';
        this.errorContainer.style.display = 'none';
    }
    
    showErrorView() {
        this.formContainer.style.display = 'none';
        this.successContainer.style.display = 'none';
        this.errorContainer.style.display = 'block';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PasswordResetManager();
});