/**
 * WAVE SPACE - 전화번호 인증 서비스
 * Firebase Authentication을 사용한 SMS 인증 전담 서비스
 */

class PhoneAuthService {
    constructor() {
        this.confirmationResult = null;
        this.verificationTimer = null;
        this.timeLeft = 180; // 3분
        this.isInitialized = false;
    }

    /**
     * 서비스 초기화
     */
    async init() {
        try {
            // Firebase 서비스 대기
            let attempts = 0;
            const maxAttempts = 50;
            
            while (attempts < maxAttempts && !window.firebaseService) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (!window.firebaseService) {
                throw new Error('Firebase 서비스를 찾을 수 없습니다.');
            }

            // Firebase 초기화
            const success = await window.firebaseService.init();
            if (!success) {
                console.warn('🔄 Firebase 설정이 완료되지 않았습니다. Mock 모드로 동작합니다.');
                console.log('실제 SMS 발송을 원하시면 Firebase Console에서 프로젝트를 설정하세요.');
                this.isInitialized = false; // Mock 모드 플래그
                return true; // Mock 모드로도 동작 가능
            }

            this.isInitialized = true;
            console.log('✅ 전화번호 인증 서비스 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ 전화번호 인증 서비스 초기화 실패:', error);
            return false;
        }
    }

    /**
     * SMS 인증 요청
     */
    async requestVerification(phoneNumber) {
        try {
            // 서비스 초기화 시도
            if (!this.isInitialized) {
                const initSuccess = await this.init();
                if (!initSuccess) {
                    console.warn('🔄 Firebase 초기화 실패. Mock 모드로 동작합니다.');
                }
            }

            // 전화번호 유효성 검사
            if (!this.validatePhoneNumber(phoneNumber)) {
                throw new Error('올바른 전화번호 형식이 아닙니다 (010-0000-0000)');
            }

            // Firebase를 통해 SMS 발송
            if (!this.isInitialized || !window.firebaseService) {
                throw new Error('Firebase 서비스가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
            }
            
            const result = await window.firebaseService.sendSMSVerification(phoneNumber);
            
            if (result.success) {
                this.confirmationResult = result.confirmationResult;
                this.startTimer();
                
                return {
                    success: true,
                    message: result.message
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('SMS 인증 요청 실패:', error);
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 인증 코드 확인
     */
    async verifyCode(code) {
        try {
            if (!this.confirmationResult) {
                throw new Error('인증 요청을 먼저 진행해주세요.');
            }

            // 6자리 코드 검증
            if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
                throw new Error('6자리 숫자 인증번호를 입력해주세요.');
            }

            // 테스트 모드 처리
            if (this.confirmationResult.test) {
                console.log('🧪 테스트 모드 인증 코드 확인');
                try {
                    const result = await this.confirmationResult.confirm(code);
                    this.stopTimer();
                    this.confirmationResult = null;
                    
                    return {
                        success: true,
                        message: '[테스트 모드] 인증이 완료되었습니다.',
                        firebaseUser: result.user
                    };
                } catch (error) {
                    if (error.message === 'auth/invalid-verification-code') {
                        throw new Error('[테스트 모드] 인증번호는 123456 입니다.');
                    }
                    throw error;
                }
            }

            // Firebase를 통해 코드 확인
            if (this.isInitialized && window.firebaseService && this.confirmationResult.confirm) {
                const result = await window.firebaseService.verifyCode(this.confirmationResult, code);
                
                if (result.success) {
                    this.stopTimer();
                    this.confirmationResult = null;
                    
                    return {
                        success: true,
                        message: result.message,
                        firebaseUser: result.user
                    };
                } else {
                    throw new Error(result.error);
                }
            } else {
                throw new Error('인증 세션이 유효하지 않습니다. 다시 요청해주세요.');
            }
        } catch (error) {
            console.error('인증 코드 확인 실패:', error);
            
            let errorMessage = '인증번호가 일치하지 않습니다.';
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = '잘못된 인증번호입니다.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = '인증번호가 만료되었습니다.';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * 전화번호 유효성 검사
     */
    validatePhoneNumber(phoneNumber) {
        const phonePattern = /^010-\d{4}-\d{4}$/;
        return phonePattern.test(phoneNumber);
    }

    /**
     * 타이머 시작
     */
    startTimer() {
        this.timeLeft = 180; // 3분 초기화
        const timerElement = document.getElementById('verificationTimer');
        const resendBtn = document.getElementById('resendBtn');
        
        if (resendBtn) {
            resendBtn.disabled = true;
        }
        
        this.verificationTimer = setInterval(() => {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (this.timeLeft <= 0) {
                this.stopTimer();
                if (timerElement) {
                    timerElement.textContent = '시간초과';
                }
                if (resendBtn) {
                    resendBtn.disabled = false;
                }
                this.confirmationResult = null; // 인증 결과 무효화
            }
            
            this.timeLeft--;
        }, 1000);
    }

    /**
     * 타이머 중지
     */
    stopTimer() {
        if (this.verificationTimer) {
            clearInterval(this.verificationTimer);
            this.verificationTimer = null;
        }
    }

    /**
     * 재발송 가능 여부 확인
     */
    canResend() {
        return this.timeLeft <= 0 || !this.verificationTimer;
    }

    /**
     * 인증 상태 초기화
     */
    reset() {
        this.stopTimer();
        this.confirmationResult = null;
        this.timeLeft = 180;
    }


    /**
     * 에러 상태 정리
     */
    clearErrors() {
        const errorElements = document.querySelectorAll('.field-status.invalid');
        errorElements.forEach(element => {
            element.textContent = '';
            element.className = 'field-status';
        });
    }
}

// 전역 전화번호 인증 서비스 인스턴스
const phoneAuthService = new PhoneAuthService();

// 전역 접근 가능하도록 설정
window.phoneAuthService = phoneAuthService;

console.log('📱 전화번호 인증 서비스 로드됨');