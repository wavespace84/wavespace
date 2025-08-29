/**
 * WAVE SPACE - Firebase 설정
 * Firebase Authentication을 사용한 SMS 인증
 */

// Firebase 설정 - WAVE SPACE SMS 인증 프로젝트 (실제 설정 완료!)
// Firebase Console: https://console.firebase.google.com/project/wavespace-sms
const firebaseConfig = {
    apiKey: "AIzaSyDOk9ZqEtI38tog7YyFos2PVgITODSFvIw",
    authDomain: "wavespace-sms.firebaseapp.com", 
    projectId: "wavespace-sms",
    storageBucket: "wavespace-sms.firebasestorage.app",
    messagingSenderId: "646514379865",
    appId: "1:646514379865:web:a33dfd79e85343f8323548"
    // measurementId는 SMS 인증에 불필요하므로 제외
};

class FirebaseService {
    constructor() {
        this.app = null;
        this.auth = null;
        this.recaptchaVerifier = null;
        this.recaptchaRendered = false; // reCAPTCHA 렌더링 상태 플래그
    }

    /**
     * Firebase 초기화
     */
    init() {
        try {
            console.log('🔧 Firebase 초기화 시작...');
            console.log('Firebase SDK 체크:', typeof firebase);
            console.log('Firebase 설정 확인:', firebaseConfig.apiKey.substring(0, 10) + '...');
            
            // Firebase 설정 확인
            if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
                console.warn('⚠️ Firebase 설정이 완료되지 않았습니다. Mock 모드로 동작합니다.');
                console.log('Firebase Console에서 프로젝트를 생성하고 js/config/firebase.js 파일의 설정을 업데이트하세요.');
                return false;
            }

            // Firebase가 이미 로드되었는지 확인
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase SDK가 로드되지 않았습니다.');
                console.log('Firebase CDN 로딩을 확인하세요.');
                return false;
            }

            // Firebase 앱 초기화
            console.log('🔧 Firebase 앱 초기화 중...');
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
                console.log('✅ 새 Firebase 앱 생성됨');
            } else {
                this.app = firebase.app();
                console.log('✅ 기존 Firebase 앱 사용');
            }

            this.auth = firebase.auth();
            console.log('✅ Firebase Auth 초기화됨');
            
            console.log('✅ Firebase 초기화 완료');
            
            // DOM 로드 완료 후 reCAPTCHA 설정
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(async () => {
                        await this.setupRecaptcha();
                    }, 100);
                });
            } else {
                // 이미 DOM이 로드된 경우 즉시 설정
                setTimeout(async () => {
                    await this.setupRecaptcha();
                }, 50);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Firebase 초기화 실패:', error);
            console.error('에러 상세:', error.message);
            console.log('Mock 인증 모드로 전환됩니다.');
            return false;
        }
    }

    /**
     * reCAPTCHA 설정
     */
    async setupRecaptcha() {
        try {
            console.log('🔧 reCAPTCHA 설정 시작...');
            
            // 프로토콜 및 환경 체크
            const protocol = location.protocol;
            const hostname = location.hostname;
            console.log('🌐 현재 환경:', protocol, hostname);
            
            // file:// 프로토콜 감지 및 특별 처리
            if (protocol === 'file:') {
                console.warn('⚠️ file:// 프로토콜 감지됨. 테스트 모드로 전환합니다.');
                console.log('💡 실제 SMS 인증을 사용하려면:');
                console.log('   1. Python: python -m http.server 8000');
                console.log('   2. Node.js: npx http-server -p 8000');
                console.log('   3. VS Code: Live Server 확장 사용');
                console.log('   그리고 http://localhost:8000/signup.html 로 접속하세요.');
                
                // file:// 프로토콜에서는 바로 테스트 모드로 전환
                const container = document.getElementById('recaptcha-container');
                if (container) {
                    container.innerHTML = `
                        <div style="padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; margin: 10px 0; color: white;">
                            <h4 style="margin: 0 0 10px; display: flex; align-items: center;">
                                <span style="margin-right: 8px;">🔧</span>
                                개발 모드로 실행 중
                            </h4>
                            <p style="margin: 5px 0; font-size: 14px; opacity: 0.95;">
                                file:// 프로토콜로 실행 중이므로 테스트 모드를 사용합니다.
                            </p>
                            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; margin-top: 10px;">
                                <p style="margin: 0 0 5px; font-size: 13px; font-weight: bold;">
                                    💡 실제 SMS 인증을 테스트하려면:
                                </p>
                                <pre style="margin: 5px 0; font-size: 12px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 3px; overflow-x: auto;">python -m http.server 8000</pre>
                                <p style="margin: 5px 0 0; font-size: 12px;">
                                    그 후 <a href="http://localhost:8000/signup.html" style="color: #ffeaa7; text-decoration: underline;">http://localhost:8000/signup.html</a> 로 접속
                                </p>
                            </div>
                        </div>
                    `;
                    
                    // 자동으로 테스트 reCAPTCHA 설정
                    setTimeout(() => {
                        this.setupTestRecaptcha(container);
                    }, 500);
                }
                return { test: true };
            }
            
            if (protocol !== 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
                console.error('❌ reCAPTCHA는 HTTPS 또는 localhost에서만 작동합니다.');
                console.error('💡 해결방법:');
                console.error('   1. HTTPS 로컬 서버 사용 (예: Live Server HTTPS 모드)');
                console.error('   2. Firebase 콘솔에서 현재 도메인 허용 추가');
                console.error('   3. localhost:8000으로 접속');
                
                // 에러 상황에서 사용자에게 명확한 안내 제공
                const container = document.getElementById('recaptcha-container');
                if (container) {
                    container.innerHTML = `
                        <div style="padding: 20px; background: #ffeaa7; border-radius: 8px; margin: 10px 0;">
                            <h4 style="color: #e17055; margin: 0 0 10px;">⚠️ reCAPTCHA 환경 문제</h4>
                            <p style="margin: 5px 0; font-size: 14px;">현재 ${protocol}//${hostname}에서는 reCAPTCHA를 사용할 수 없습니다.</p>
                            <p style="margin: 5px 0; font-size: 14px;"><strong>해결방법:</strong></p>
                            <ul style="margin: 5px 0; padding-left: 20px; font-size: 13px;">
                                <li>HTTPS 로컬 서버 사용 (VS Code Live Server)</li>
                                <li>localhost:8000으로 접속</li>
                                <li>Firebase 콘솔에서 도메인 승인 추가</li>
                            </ul>
                        </div>
                    `;
                }
                return null;
            }
            
            // reCAPTCHA 컨테이너 존재 확인
            const container = document.getElementById('recaptcha-container');
            if (!container) {
                console.error('❌ reCAPTCHA 컨테이너를 찾을 수 없습니다.');
                return null;
            }
            console.log('✅ reCAPTCHA 컨테이너 찾음');
            
            // 기존 reCAPTCHA 완전 정리 후 잠시 대기
            this.clearExistingRecaptcha();
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms 대기

            console.log('🔧 새 reCAPTCHA 생성 중... (visible 모드)');
            this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'normal',
                'theme': 'light',
                'callback': (response) => {
                    console.log('✅ reCAPTCHA 인증 완료:', response);
                    // 사용자가 reCAPTCHA 체크 완료 시 버튼 활성화
                    const requestBtn = document.getElementById('requestVerificationBtn');
                    if (requestBtn && requestBtn.textContent === '본인인증') {
                        requestBtn.disabled = false;
                        requestBtn.style.opacity = '1';
                    }
                },
                'expired-callback': () => {
                    console.log('⚠️ reCAPTCHA 만료');
                    this.recaptchaRendered = false;
                    this.showToast('reCAPTCHA가 만료되었습니다. 다시 체크해주세요.', 'warning');
                    // 버튼 비활성화
                    const requestBtn = document.getElementById('requestVerificationBtn');
                    if (requestBtn && requestBtn.textContent === '본인인증') {
                        requestBtn.disabled = true;
                        requestBtn.style.opacity = '0.6';
                    }
                },
                'error-callback': (error) => {
                    console.error('❌ reCAPTCHA 콜백 오류:', error);
                    this.recaptchaRendered = false;
                    
                    // 프로토콜 관련 오류인지 확인
                    if (error.name === 'SecurityError' || error.message.includes('protocol')) {
                        console.error('💡 보안/프로토콜 오류: HTTPS 환경에서 실행하거나 Firebase 콘솔 설정을 확인하세요.');
                        console.error('💡 Firebase Console > Authentication > Settings > Authorized domains에 도메인 추가');
                    } else {
                        console.log('🔄 도메인 승인 문제일 수 있습니다. Firebase Console에서 localhost를 승인하세요.');
                    }
                    
                    // 오류 시 테스트 모드로 전환
                    this.setupTestRecaptcha(container);
                }
            });

            // reCAPTCHA 렌더링 (타이밍 개선 및 타임아웃 설정)
            console.log('🔧 reCAPTCHA 렌더링 시작...');
            
            try {
                const widgetId = await this.recaptchaVerifier.render();
                console.log('✅ reCAPTCHA 위젯 렌더링 완료! 위젯 ID:', widgetId);
                console.log('📱 이제 reCAPTCHA가 화면에 표시되어야 합니다.');
                this.recaptchaRendered = true;
                return this.recaptchaVerifier;
            } catch (renderError) {
                console.error('❌ reCAPTCHA 렌더링 실패:', renderError);
                console.error('렌더링 에러 상세:', renderError.message);
                
                // 보안/프로토콜 오류 상세 안내
                if (renderError.name === 'SecurityError') {
                    console.error('💡 SecurityError: 프로토콜 불일치(HTTP/HTTPS) 문제입니다.');
                    console.error('   - 해결방법: HTTPS 로컬 서버를 사용하세요.');
                    console.error('   - 또는 Firebase 콘솔에서 HTTP 도메인을 허용하세요.');
                } else if (renderError.message.includes('protocol')) {
                    console.error('💡 프로토콜 오류: HTTPS와 HTTP 간 통신 문제입니다.');
                } else if (renderError.message.includes('domain')) {
                    console.error('💡 도메인 오류: Firebase 콘솔에서 현재 도메인을 승인하세요.');
                }
                
                // 오류 시 테스트 모드로 전환
                console.log('🧪 reCAPTCHA 오류로 인해 테스트 모드로 전환합니다');
                return this.setupTestRecaptcha(container);
            }
            
        } catch (error) {
            console.error('❌ reCAPTCHA 설정 실패:', error);
            console.error('reCAPTCHA 에러 상세:', error.message);
            
            // 오류 시 테스트 모드로 전환
            const container = document.getElementById('recaptcha-container');
            if (container) {
                this.setupTestRecaptcha(container);
                return { test: true };
            }
            
            this.recaptchaRendered = false;
            this.recaptchaVerifier = null;
            return null;
        }
    }

    /**
     * 테스트용 reCAPTCHA 설정 (개발 환경용)
     */
    setupTestRecaptcha(container) {
        console.log('🧪 테스트용 reCAPTCHA 생성 중...');
        
        // 중복 생성 방지
        if (this.recaptchaVerifier && this.recaptchaVerifier.test && this.recaptchaRendered) {
            console.log('♻️ 테스트 reCAPTCHA 이미 생성됨 - 재사용');
            return this.recaptchaVerifier;
        }
        
        // 컨테이너 완전히 비우기
        container.innerHTML = '';
        
        container.innerHTML = `
            <div style="
                width: 304px; 
                height: 78px; 
                border: 2px solid #d3d3d3; 
                border-radius: 3px; 
                background: #f9f9f9; 
                display: flex; 
                align-items: center; 
                justify-content: flex-start;
                padding: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                cursor: pointer;
                user-select: none;
            " id="test-recaptcha">
                <div style="
                    width: 24px; 
                    height: 24px; 
                    border: 2px solid #d3d3d3; 
                    background: white; 
                    margin-right: 12px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-size: 18px;
                    color: #4CAF50;
                " id="test-checkbox"></div>
                <div>
                    <div style="font-size: 14px; color: #333; margin-bottom: 2px;">로봇이 아닙니다</div>
                    <div style="font-size: 10px; color: #666;">개발 테스트 모드</div>
                </div>
            </div>
        `;
        
        // 도움말 텍스트 표시
        const helpText = document.getElementById('recaptcha-help-text');
        if (helpText) {
            helpText.style.display = 'block';
        }
        
        const testRecaptcha = container.querySelector('#test-recaptcha');
        const testCheckbox = container.querySelector('#test-checkbox');
        let isChecked = false;
        
        testRecaptcha.addEventListener('click', () => {
            isChecked = !isChecked;
            if (isChecked) {
                testCheckbox.innerHTML = '✓';
                testCheckbox.style.backgroundColor = '#4CAF50';
                testCheckbox.style.borderColor = '#4CAF50';
                
                // 버튼 활성화
                const requestBtn = document.getElementById('requestVerificationBtn');
                if (requestBtn) {
                    requestBtn.disabled = false;
                    requestBtn.style.opacity = '1';
                }
            } else {
                testCheckbox.innerHTML = '';
                testCheckbox.style.backgroundColor = 'white';
                testCheckbox.style.borderColor = '#d3d3d3';
                
                // 버튼 비활성화
                const requestBtn = document.getElementById('requestVerificationBtn');
                if (requestBtn) {
                    requestBtn.disabled = true;
                    requestBtn.style.opacity = '0.6';
                }
            }
        });
        
        this.recaptchaVerifier = { test: true, isChecked: () => isChecked };
        this.recaptchaRendered = true;
        
        console.log('✅ 테스트용 reCAPTCHA 생성 완료');
        
        // 테스트 환경에서는 즉시 자동으로 체크 (사용자 편의성)
        setTimeout(() => {
            if (!isChecked && testRecaptcha) {
                console.log('🧪 테스트 모드: 자동으로 reCAPTCHA 체크 실행');
                testRecaptcha.click();
                console.log('✅ 자동 체크 완료 - 본인인증 버튼 활성화됨');
            }
        }, 500);
        
        return this.recaptchaVerifier;
    }

    /**
     * 기존 reCAPTCHA 완전 정리
     */
    clearExistingRecaptcha() {
        console.log('🔧 기존 reCAPTCHA 정리 시작...');
        
        if (this.recaptchaVerifier) {
            try {
                // 일반 reCAPTCHA인 경우만 clear() 호출
                if (!this.recaptchaVerifier.test) {
                    this.recaptchaVerifier.clear();
                }
                console.log('✅ reCAPTCHA verifier 정리 완료');
            } catch (clearError) {
                console.warn('⚠️ reCAPTCHA clear 실패 (무시됨):', clearError);
            }
            this.recaptchaVerifier = null;
        }
        
        // DOM 컨테이너도 완전히 비우기
        const container = document.getElementById('recaptcha-container');
        if (container) {
            container.innerHTML = '';
            console.log('🧹 reCAPTCHA 컨테이너 정리 완료');
        }
        
        this.recaptchaRendered = false;
        console.log('✅ reCAPTCHA 정리 완료');
    }

    /**
     * SMS 인증 코드 발송
     */
    async sendSMSVerification(phoneNumber) {
        try {
            console.log('🚀 SMS 발송 시작:', phoneNumber);
            
            // 한국 번호를 국제 형식으로 변환
            const internationalPhone = this.formatPhoneNumber(phoneNumber);
            console.log('📱 국제 형식 변환:', internationalPhone);
            
            // HTTP 환경에서는 자동으로 Mock 모드 사용
            const protocol = location.protocol;
            const hostname = location.hostname;
            const port = location.port;
            
            // 개발 환경 감지 (HTTP + localhost)
            if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
                console.log('🧪 HTTP 개발 환경 감지 - Mock 모드 사용');
                
                // Mock confirmationResult 생성
                const mockConfirmationResult = {
                    test: true,
                    confirm: async (code) => {
                        if (code === '123456') {
                            return {
                                user: {
                                    uid: 'test-uid-' + Date.now(),
                                    phoneNumber: internationalPhone
                                }
                            };
                        } else {
                            throw new Error('auth/invalid-verification-code');
                        }
                    }
                };
                
                // 3초 후 타이머 시작 (실제 SMS처럼 보이도록)
                setTimeout(() => {
                    console.log('✅ Mock SMS 발송 완료');
                }, 1000);
                
                return {
                    success: true,
                    confirmationResult: mockConfirmationResult,
                    message: `[개발 모드] 테스트 인증번호: 123456`
                };
            }
            
            // reCAPTCHA 확인
            if (!this.recaptchaVerifier) {
                throw new Error('reCAPTCHA가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
            }
            
            if (!this.recaptchaRendered) {
                throw new Error('reCAPTCHA가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
            }

            // 테스트 모드 reCAPTCHA 처리
            if (this.recaptchaVerifier.test) {
                if (!this.recaptchaVerifier.isChecked()) {
                    throw new Error('reCAPTCHA를 먼저 체크해주세요.');
                }
                
                // 테스트 모드에서는 Mock 응답 반환
                console.log('🧪 테스트 모드: Mock SMS 발송');
                
                // Mock confirmationResult 생성
                const mockConfirmationResult = {
                    test: true,
                    confirm: async (code) => {
                        if (code === '123456') {
                            return {
                                user: {
                                    uid: 'test-uid-' + Date.now(),
                                    phoneNumber: internationalPhone
                                }
                            };
                        } else {
                            throw new Error('auth/invalid-verification-code');
                        }
                    }
                };
                
                console.log('✅ 테스트 모드 SMS 발송 성공 (인증번호: 123456)');
                return {
                    success: true,
                    confirmationResult: mockConfirmationResult,
                    message: `[테스트 모드] 인증번호: 123456`
                };
            }

            // reCAPTCHA 토큰 유효성 확인
            console.log('🔍 reCAPTCHA 상태 확인...');
            console.log('reCAPTCHA 준비됨:', !!this.recaptchaVerifier);
            console.log('reCAPTCHA 렌더링됨:', !!this.recaptchaRendered);
            
            if (!this.recaptchaVerifier) {
                throw new Error('reCAPTCHA가 초기화되지 않았습니다.');
            }

            // reCAPTCHA 검증 대기
            console.log('⏳ reCAPTCHA 검증 대기 중...');
            
            // SMS 발송
            console.log('📤 Firebase SMS 발송 요청 중...');
            const confirmationResult = await this.auth.signInWithPhoneNumber(
                internationalPhone, 
                this.recaptchaVerifier
            );

            console.log('✅ SMS 발송 성공:', confirmationResult);
            
            // SMS 발송 성공 후 reCAPTCHA 정리 (재사용 방지)
            this.recaptchaVerifier = null;
            this.recaptchaRendered = false;
            
            // 2초 후 새로운 reCAPTCHA 준비 (재발송용)
            setTimeout(() => {
                console.log('🔄 재발송을 위한 새 reCAPTCHA 준비...');
                this.setupRecaptcha().catch(err => {
                    console.warn('재발송용 reCAPTCHA 준비 실패:', err);
                });
            }, 2000);
            
            return {
                success: true,
                confirmationResult,
                message: `인증번호가 ${phoneNumber}로 발송되었습니다.`
            };
        } catch (error) {
            console.error('❌ SMS 발송 실패:', error);
            console.error('에러 코드:', error.code);
            console.error('에러 메시지:', error.message);
            
            // 에러 메시지 한국어화
            let errorMessage = 'SMS 발송에 실패했습니다.';
            
            if (error.code === 'auth/invalid-phone-number') {
                errorMessage = '올바른 전화번호 형식이 아닙니다.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.';
            } else if (error.code === 'auth/quota-exceeded') {
                errorMessage = '일일 SMS 발송 한도를 초과했습니다.';
            } else if (error.code === 'auth/captcha-check-failed') {
                errorMessage = 'reCAPTCHA 인증에 실패했습니다. 다시 시도해주세요.';
                // reCAPTCHA 재설정 (비동기)
                this.resetRecaptcha().catch(resetError => {
                    console.error('reCAPTCHA 재설정 중 추가 오류:', resetError);
                });
            } else if (error.code === 'auth/web-storage-unsupported') {
                errorMessage = '브라우저가 로컬 스토리지를 지원하지 않습니다.';
            } else if (error.code === 'auth/billing-not-enabled') {
                errorMessage = 'Firebase 결제 설정이 필요합니다. Mock 모드로 전환됩니다.';
                console.log('💡 Firebase Console > 사용량 및 결제에서 Blaze 요금제로 업그레이드하세요.');
                console.log('💡 월 10,000회 SMS는 무료입니다!');
            } else if (error.code === 'auth/invalid-app-credential') {
                errorMessage = 'Firebase 도메인 승인이 필요합니다. 관리자에게 문의하세요.';
                console.error('💡 Firebase Console > Authentication > Settings > Authorized domains에 다음 도메인을 추가하세요:');
                console.error('   - localhost');
                console.error('   - 127.0.0.1');
                console.error('💡 현재 도메인:', window.location.origin);
                
                // reCAPTCHA 재설정 시도 (비동기)
                this.resetRecaptcha().catch(resetError => {
                    console.error('reCAPTCHA 재설정 중 추가 오류:', resetError);
                });
                
                // 에러 반환 시 재시도를 위한 힌트 제공
                errorMessage += '\n잠시 후 다시 시도하거나 페이지를 새로고침해주세요.';
            } else if (error.code === 'auth/app-not-authorized') {
                errorMessage = 'Firebase 앱이 승인되지 않았습니다. 관리자에게 문의하세요.';
                console.error('💡 Firebase Console에서 도메인을 승인하세요.');
            } else if (error.message && error.message.includes('network')) {
                errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
            } else if (error.code === 'auth/internal-error') {
                errorMessage = 'reCAPTCHA가 이미 사용되었습니다. 잠시 후 다시 시도해주세요.';
                console.error('reCAPTCHA 내부 오류 - 새로운 reCAPTCHA 필요');
                // reCAPTCHA 재설정 (비동기)
                this.resetRecaptcha().catch(resetError => {
                    console.error('reCAPTCHA 재설정 중 추가 오류:', resetError);
                });
            } else if (error.code && error.code.startsWith('auth/')) {
                errorMessage = 'Firebase 인증 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                console.error('Firebase Auth Error:', error.code, error.message);
            } else {
                errorMessage = 'SMS 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                console.error('Unknown SMS Error:', error);
            }

            return {
                success: false,
                error: errorMessage,
                originalError: error
            };
        }
    }

    /**
     * 인증 코드 확인
     */
    async verifyCode(confirmationResult, code) {
        try {
            const result = await confirmationResult.confirm(code);
            
            return {
                success: true,
                user: result.user,
                message: '인증이 완료되었습니다.'
            };
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
     * 전화번호 국제 형식 변환
     */
    formatPhoneNumber(phoneNumber) {
        // 한국 번호 형식 처리 (010-1234-5678 → +821012345678)
        let formatted = phoneNumber.replace(/[-\s]/g, '');
        
        if (formatted.startsWith('010')) {
            formatted = '+82' + formatted.substring(1);
        } else if (!formatted.startsWith('+82')) {
            // 이미 국제 형식이 아닌 경우 +82 추가
            formatted = '+82' + formatted;
        }
        
        return formatted;
    }

    /**
     * 현재 Firebase 사용자 가져오기
     */
    getCurrentUser() {
        return this.auth ? this.auth.currentUser : null;
    }

    /**
     * Firebase 로그아웃
     */
    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Firebase 로그아웃 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * reCAPTCHA 재설정
     */
    async resetRecaptcha() {
        try {
            console.log('🔄 reCAPTCHA 재설정 시작...');
            
            // 기존 reCAPTCHA 완전 정리
            this.clearExistingRecaptcha();
            
            // 컨테이너 완전 정리
            const container = document.getElementById('recaptcha-container');
            if (container) {
                container.innerHTML = '';
                console.log('🧹 reCAPTCHA 컨테이너 정리 완료');
            }
            
            // 잠시 대기 후 새로운 reCAPTCHA 설정
            console.log('⏳ 새로운 reCAPTCHA 준비 중...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
            
            // 새로운 reCAPTCHA 설정
            await this.setupRecaptcha();
            console.log('✅ reCAPTCHA 재설정 완료');
            
        } catch (error) {
            console.error('❌ reCAPTCHA 재설정 실패:', error);
            // 에러 발생 시에도 플래그 초기화
            this.recaptchaRendered = false;
            this.recaptchaVerifier = null;
            console.log('💡 reCAPTCHA 문제가 지속될 경우 페이지를 새로고침하세요.');
        }
    }

    /**
     * Toast 메시지 표시 (fallback)
     */
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// 전역 Firebase 서비스 인스턴스
const firebaseService = new FirebaseService();

// 전역 접근 가능하도록 설정
window.firebaseService = firebaseService;

console.log('🔥 Firebase 서비스 로드됨');