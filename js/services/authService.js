/**
 * WAVE SPACE - Authentication Service
 * Supabase를 사용한 인증 관리 서비스
 */

// 동적 import로 변경 (HTML에서 일반 스크립트로 로드되므로)
let BaseService = null;
let AuthorizationHelper = null;

// 동적 import 로드
(async () => {
    try {
        const baseServiceModule = await import('/js/core/BaseService.js');
        BaseService = baseServiceModule.BaseService;
        
        const helpersModule = await import('/js/utils/serviceHelpers.js');
        AuthorizationHelper = helpersModule.AuthorizationHelper;
        
        console.log('✅ AuthService 의존성 로드 완료');
    } catch (e) {
        console.warn('AuthService 의존성 로드 실패, 기본 서비스로 동작:', e);
        // BaseService가 없는 경우 기본 클래스 사용
        BaseService = class {
            constructor(name) {
                this.serviceName = name;
                this.supabase = window.WaveSupabase?.getClient?.();
            }
            async waitForSupabase(maxAttempts = 100, delay = 100) {
                let attempts = 0;
                while (attempts < maxAttempts && (!window.WaveSupabase || !window.WaveSupabase.getClient)) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    attempts++;
                }
                if (window.WaveSupabase && window.WaveSupabase.getClient) {
                    this.supabase = window.WaveSupabase.getClient();
                    return true;
                }
                return false;
            }
        };
    }
})();

// 에러 핸들러 import (동적 로드)
let ErrorHandler = null;
(async () => {
    try {
        await import('/js/utils/errorHandler.js');
        ErrorHandler = window.ErrorHandler;
    } catch (e) {
        console.warn('Error handler not loaded, using fallback');
    }
})();

/**
 * 프로필과 뱃지를 안전하게 2단계로 로드
 * @param {object} supabase - Supabase 클라이언트
 * @param {string} userId - 사용자 ID
 * @returns {object} { profile, badges }
 */
async function loadProfileAndBadges(supabase, authUserId) {
    try {
        // 1) 프로필 (auth_user_id로 조회 - 올바른 방식)
        const { data: profile, error: pErr } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', authUserId)
            .single();
        
        if (pErr) {
            console.log('users 테이블에서 프로필을 찾을 수 없음:', pErr);
            throw pErr;
        }

        // 2) profiles 테이블에서 role 정보 가져오기
        const { data: profileRole, error: profileErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', authUserId)
            .single();
        
        // profiles 테이블의 role이 있으면 우선 사용
        if (profileRole && !profileErr && profileRole.role) {
            profile.role = profileRole.role;
            console.log('profiles 테이블에서 role 정보 가져옴:', profileRole.role);
        }

        // 3) 뱃지 (users 테이블의 id 사용 - 이건 맞음)
        const { data: badges, error: bErr } = await supabase
            .from('user_badges')
            .select('badge_id, earned_at, badges(name, badge_type, color, icon)')
            .eq('user_id', profile.id);
        
        // 뱃지 로드 실패는 치명적이지 않음
        if (bErr) {
            console.warn('뱃지 로드 실패:', bErr);
        }

        return { profile, badges: badges || [] };
        
    } catch (error) {
        console.error('프로필 로드 중 오류:', error);
        throw error;
    }
}

class AuthService {
    constructor() {
        this.serviceName = 'AuthService';
        this.currentUser = null;
        this.supabase = null;
        
        // BaseService가 로드되면 mixin으로 메서드 복사
        this.initBaseServiceMethods();
    }
    
    // BaseService 메서드들을 안전하게 초기화
    initBaseServiceMethods() {
        // BaseService 메서드가 로드될 때까지 대기하는 간단한 폴백
        this.waitForSupabase = async (maxAttempts = 100, delay = 100) => {
            let attempts = 0;
            while (attempts < maxAttempts && (!window.WaveSupabase || !window.WaveSupabase.getClient)) {
                await new Promise(resolve => setTimeout(resolve, delay));
                attempts++;
            }
            if (window.WaveSupabase && window.WaveSupabase.getClient) {
                this.supabase = window.WaveSupabase.getClient();
                return true;
            }
            return false;
        };
    }

    /**
     * 초기화
     */
    async init() {
        try {
            // BaseService의 waitForSupabase 메서드 사용
            await this.waitForSupabase(100, 100); // 최대 10초 대기
            
            await this.checkAuthState();
            this.setupAuthListener();
            this.setupDropdownClose();
            
            console.log('✅ AuthService 초기화 완료');
        } catch (error) {
            console.error('❌ AuthService 초기화 실패:', error);
            
            // 에러 핸들러 사용
            if (ErrorHandler) {
                ErrorHandler.handle(error, '인증 시스템을 초기화할 수 없습니다.');
            }
            
            // 폴백 UI 표시
            this.showFallbackAuthUI(error.message);
        }
    }

    /**
     * 폴백 인증 UI 표시
     */
    showFallbackAuthUI(errorMessage) {
        console.log('🔄 폴백 인증 UI 활성화');
        
        // 헤더 사용자 정보 영역에 로그인/회원가입 버튼 표시
        const userInfoElement = document.querySelector('#userInfoContainer');
        if (userInfoElement) {
            userInfoElement.innerHTML = `
                <div class="auth-buttons anonymous-only">
                    <button class="btn btn-outline" data-action="login">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>로그인</span>
                    </button>
                    <button class="btn btn-primary" data-action="signup">
                        <i class="fas fa-user-plus"></i>
                        <span>회원가입</span>
                    </button>
                </div>
            `;
            
            // 폴백 UI 버튼에 이벤트 리스너 추가
            const fallbackLoginBtn = userInfoElement.querySelector('button[data-action="login"]');
            const fallbackSignupBtn = userInfoElement.querySelector('button[data-action="signup"]');
            
            if (fallbackLoginBtn) {
                fallbackLoginBtn.addEventListener('click', () => {
                    try {
                        this.openLoginSidepanel();
                    } catch (error) {
                        window.location.href = 'login.html';
                    }
                });
            }
            
            if (fallbackSignupBtn) {
                fallbackSignupBtn.addEventListener('click', () => {
                    window.location.href = 'signup.html';
                });
            }
            console.log('✅ 폴백 UI: 로그인/회원가입 버튼 표시 완료');
        }
        
        // 로그인 필요 요소들 숨기기
        document.querySelectorAll('.login-required').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.anonymous-only').forEach(el => {
            el.style.display = 'flex';  // 폴백 UI에서 flex로 표시
        });
        
        // 에러 메시지 표시 (개발 환경에서만)
        if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'auth-error-fallback';
            errorDiv.innerHTML = `
                <div style="padding: 10px; background: #fee; border: 1px solid #fcc; border-radius: 4px; margin: 10px; font-size: 12px;">
                    <strong>⚠️ 개발 환경: 인증 시스템 연결 실패</strong><br>
                    ${errorMessage}<br>
                    <small>로컬 개발에서는 정상적인 현상입니다.</small>
                </div>
            `;
            
            // 적절한 위치에 에러 메시지 삽입
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.insertBefore(errorDiv, sidebar.firstChild);
            }
        }
        
        console.log('✅ 폴백 인증 UI 설정 완료');
    }


    /**
     * 현재 인증 상태 확인
     */
    async checkAuthState() {
        try {
            console.log('🔍 인증 상태 확인 시작');
            
            // Supabase 클라이언트 확인
            if (!this.supabase || !this.supabase.auth) {
                console.warn('⚠️ Supabase 클라이언트가 초기화되지 않음, 초기화 대기 중...');
                
                // BaseService의 waitForSupabase 메서드 사용
                await this.waitForSupabase();
                
                // 다시 한번 확인
                if (!this.supabase || !this.supabase.auth) {
                    console.error('❌ Supabase 클라이언트 초기화 실패');
                    return null;
                }
            }
            
            // getSession을 사용하여 세션 확인 (더 정확함)
            if (!this.supabase?.auth?.getSession) {
                console.warn('⚠️ Supabase auth.getSession 메서드가 없음');
                return null;
            }
            
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('세션 확인 중 오류:', error);
                // 세션 확인 실패는 로그아웃 상태로 처리
                this.currentUser = null;
                this.updateUIForAnonymousUser();
                return null;
            }
            
            if (session && session.user) {
                console.log('✅ 세션 확인됨, 인증된 사용자:', session.user.id);
                this.currentUser = session.user;
                
                // 사용자 프로필 정보 로드 시도
                try {
                    const profileData = await this.loadUserProfile();
                    
                    if (profileData) {
                        console.log('✅ 프로필 로드 성공');
                        this.updateUIForLoggedInUser();
                    } else {
                        console.log('⚠️ 프로필 로드 실패하지만 로그인 상태 유지');
                        this.updateUIForLoggedInUser();
                    }
                    
                } catch (profileError) {
                    console.error('프로필 로드 중 오류:', profileError);
                    
                    // 프로필 로드 실패해도 기본 UI는 표시
                    this.updateUIForLoggedInUser();
                    
                    // 심각한 네트워크 오류나 서버 오류인 경우에만 사용자에게 알림
                    const shouldShowWarning = profileError.message?.includes('network') || 
                                            profileError.message?.includes('Failed to fetch') ||
                                            profileError.message?.includes('500') ||
                                            profileError.message?.includes('Connection refused');
                    
                    if (shouldShowWarning && ErrorHandler && ErrorHandler.showWarning) {
                        ErrorHandler.showWarning('일부 사용자 정보를 불러올 수 없습니다.');
                    } else {
                        // 일반적인 프로필 관련 오류는 콘솔에만 로그
                        console.log('프로필 로드 실패 (사용자에게 알리지 않음):', profileError.message);
                    }
                }
                
                return session.user;
            } else {
                console.log('🔓 세션 없음, 로그아웃 상태');
                this.currentUser = null;
                this.updateUIForAnonymousUser();
                return null;
            }
            
        } catch (error) {
            console.error('인증 상태 확인 실패:', error);
            
            // 인증 상태 확인 실패 시에도 기본 UI는 표시
            this.currentUser = null;
            this.updateUIForAnonymousUser();
            
            if (ErrorHandler) {
                ErrorHandler.handle(error, '인증 상태를 확인할 수 없습니다.');
            }
            return null;
        }
    }


    /**
     * 인증 상태 변화 감지
     */
    setupAuthListener() {
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('인증 상태 변화:', event, session);
            
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                console.log('✅ 로그인 이벤트 감지, 프로필 로드 시작');
                
                try {
                    // 프로필 로드 시도
                    const profileData = await this.loadUserProfile();
                    
                    if (profileData) {
                        console.log('✅ 로그인 후 프로필 로드 성공');
                        this.showToast('로그인되었습니다!', 'success');
                        this.updateUIForLoggedInUser();
                    }
                    
                } catch (profileError) {
                    console.error('로그인 후 프로필 로드 실패:', profileError);
                    
                    // 프로필 로드 실패해도 로그인은 성공한 상태로 UI 업데이트
                    this.updateUIForLoggedInUser();
                    
                    // 성공 메시지는 항상 표시
                    this.showToast('로그인되었습니다!', 'success');
                }
                
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.userProfile = null;
                
                // 로컬 데이터 정리
                localStorage.removeItem('waveUser');
                
                this.updateUIForAnonymousUser();
                this.showToast('로그아웃되었습니다.', 'info');
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('토큰 갱신됨');
                // 토큰 갱신 시에는 별도 처리 없음
            } else if (event === 'USER_UPDATED') {
                console.log('사용자 정보 업데이트됨');
                // 사용자 정보 업데이트 시 프로필 다시 로드
                if (this.currentUser) {
                    try {
                        await this.loadUserProfile();
                        this.updateUIForLoggedInUser();
                    } catch (error) {
                        console.error('사용자 정보 업데이트 후 프로필 로드 실패:', error);
                    }
                }
            }
        });
    }

    /**
     * 회원가입
     */
    async signUp(username, password, nickname, fullName, email, phone, memberType, additionalInfo = {}, additionalData = {}) {
        try {
            console.log('=== 회원가입 시작 ===');
            console.log('입력 데이터:', {
                username, 
                email, 
                phone, 
                memberType,
                fullName,
                nickname
            });
            
            // SMTP 설정이 없는 경우를 위한 임시 이메일 형식 사용
            // 실제 운영 환경에서는 SMTP 설정 필요 (docs/SUPABASE_SETUP.md 참조)
            const authEmail = email.includes('@') 
                ? email 
                : `${username}@users.wavespace.com`; // 개발용 임시 이메일
            
            console.log('Auth 이메일:', authEmail);
            
            // 1. Supabase 인증에 가입 (임시 이메일 형식 사용)
            const { data, error } = await this.supabase.auth.signUp({
                email: authEmail, // SMTP 미설정 시 임시 이메일 사용
                password,
                options: {
                    data: {
                        username: username,
                        full_name: fullName,
                        actual_email: email, // 실제 이메일은 메타데이터에 저장
                        nickname: nickname,
                        phone: phone,
                        member_type: memberType
                    },
                    emailRedirectTo: window.location.origin // 이메일 확인 후 리다이렉트 URL
                }
            });

            if (error) {
                console.error('Supabase Auth signUp 에러:', error);
                console.error('에러 상세:', JSON.stringify(error, null, 2));
                
                // 에러 핸들러 사용
                if (ErrorHandler) {
                    ErrorHandler.handle(error);
                }
                
                // 더 명확한 에러 메시지 처리
                if (error.message && error.message.includes('Database error finding user')) {
                    // Database error 발생 시 대체 회원가입 방식 시도
                    console.log('Database error 발생, 대체 방식으로 시도');
                    return await this.alternativeSignUp(username, password, nickname, fullName, email, phone, memberType, additionalInfo, additionalData);
                }
                throw error;
            }

            console.log('Auth 회원가입 성공:', data.user?.id);
            console.log('User 객체:', data.user);

            // 2. users 테이블에 프로필 정보 저장
            if (data.user) {
                console.log('프로필 생성 시작...');
                // 새로운 RPC 함수를 사용하여 프로필 생성
                const { data: profileResult, error: profileError } = await this.supabase
                    .rpc('create_signup_profile', {
                        p_user_id: data.user.id,
                        p_username: username,
                        p_nickname: nickname,  // 닉네임 추가
                        p_full_name: fullName,
                        p_email: email,
                        p_phone: phone,
                        p_member_type: memberType,
                        p_postal_code: additionalData.postalCode || null,
                        p_address: additionalData.address || null,
                        p_detail_address: additionalData.detailAddress || null,
                        p_referrer: additionalData.referrer || null,
                        p_kakao_id: additionalData.kakaoId || null,
                        p_additional_info: Object.keys(additionalInfo).length > 0 ? additionalInfo : null
                    });

                console.log('RPC 호출 파라미터:', {
                    p_user_id: data.user.id,
                    p_username: username,
                    p_nickname: nickname,
                    p_full_name: fullName,
                    p_email: email,
                    p_phone: phone,
                    p_member_type: memberType
                });

                if (profileError) {
                    console.error('RPC 프로필 생성 실패:', profileError);
                    console.error('RPC 에러 상세:', JSON.stringify(profileError, null, 2));
                    
                    // 에러 핸들러 사용
                    if (ErrorHandler) {
                        ErrorHandler.showWarning('프로필 정보 저장에 실패했지만 회원가입은 완료되었습니다.');
                    }
                    
                    // 프로필 생성 실패해도 auth 계정은 생성되었으므로 성공으로 처리
                    // 나중에 sync_existing_auth_users() 함수로 동기화 가능
                    console.log('프로필은 나중에 동기화될 예정입니다.');
                } else if (profileResult && profileResult.success) {
                    console.log('프로필 생성 성공:', profileResult.message);
                    console.log('프로필 ID:', profileResult.user_id);
                } else {
                    console.log('프로필 생성 결과:', profileResult);
                }
            } else {
                console.error('data.user가 없습니다!');
            }

            console.log('=== 회원가입 완료 ===');
            return { success: true, data };
        } catch (error) {
            console.error('회원가입 실패:', error);
            console.error('에러 스택:', error.stack);
            
            // 에러 핸들러 사용
            if (ErrorHandler) {
                ErrorHandler.handle(error);
            }
            
            return { success: false, error: error.message };
        }
    }

    /**
     * 대체 회원가입 방식 (Database error 발생 시)
     */
    async alternativeSignUp(username, password, nickname, fullName, email, phone, memberType, additionalInfo = {}, additionalData = {}) {
        try {
            console.log('대체 회원가입 방식 시작');
            
            // 임시로 로컬 스토리지에 저장
            const tempUser = {
                username,
                nickname,  // 닉네임 포함
                fullName,
                email,
                phone,
                memberType,
                additionalInfo,
                additionalData,
                points: 1000,
                level: 1,
                role: 'user',
                created_at: new Date().toISOString(),
                isTemporary: true // 임시 사용자 표시
            };
            
            // 로컬 스토리지에 임시 저장
            localStorage.setItem('waveUser', JSON.stringify(tempUser));
            localStorage.setItem('tempSignupData', JSON.stringify({
                ...tempUser,
                timestamp: Date.now()
            }));
            
            // 성공 메시지와 함께 리턴
            console.log('임시 회원가입 완료, 나중에 동기화 필요');
            
            return {
                success: true,
                user: tempUser,
                message: '회원가입이 완료되었습니다. (임시 저장)',
                requiresSync: true
            };
            
        } catch (error) {
            console.error('대체 회원가입도 실패:', error);
            if (ErrorHandler) {
                ErrorHandler.handle(error, '회원가입 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
            }
            throw new Error('회원가입 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
        }
    }
    
    /**
     * 임시 회원가입 데이터 동기화
     */
    async syncTemporarySignup() {
        const tempData = localStorage.getItem('tempSignupData');
        if (!tempData) return;
        
        try {
            const data = JSON.parse(tempData);
            // 24시간이 지난 경우에만 재시도
            if (Date.now() - data.timestamp < 86400000) return;
            
            // RPC 함수를 통해 프로필 생성 시도
            const { data: result, error } = await this.supabase
                .rpc('create_user_profile', {
                    p_user_id: this.supabase.auth.user()?.id,
                    p_username: data.username,
                    p_full_name: data.fullName,
                    p_email: data.email,
                    p_phone: data.phone,
                    p_member_type: data.memberType,
                    p_additional_info: data.additionalInfo ? JSON.stringify(data.additionalInfo) : null
                });
            
            if (!error && result?.success) {
                // 동기화 성공 시 임시 데이터 삭제
                localStorage.removeItem('tempSignupData');
                console.log('임시 회원가입 데이터 동기화 완료');
            }
        } catch (error) {
            console.error('임시 데이터 동기화 실패:', error);
        }
    }

    /**
     * 로그인 (userId 또는 email 모두 지원)
     */
    async signIn(userIdOrEmail, password) {
        try {
            console.log('🚀 로그인 시도:', userIdOrEmail);
            
            // 이메일 형식이 아닌 경우 username 기반 로그인 시도
            if (!userIdOrEmail.includes('@')) {
                console.log('👤 Username 기반 로그인 시도:', userIdOrEmail);
                
                // username으로 사용자 조회
                const { data: userData, error: userError } = await this.supabase
                    .rpc('get_user_by_username', { input_username: userIdOrEmail });
                
                if (userError) {
                    console.error('RPC 함수 에러:', userError);
                    // RPC 함수 실패 시 직접 쿼리 시도 (fallback)
                    const { data: users, error: queryError } = await this.supabase
                        .from('users')
                        .select('email, auth_user_id')
                        .or(`username.eq.${userIdOrEmail},email.eq.${userIdOrEmail}`)
                        .single();
                    
                    if (queryError || !users) {
                        console.error('사용자 조회 실패:', queryError);
                        if (ErrorHandler) {
                            ErrorHandler.handle(queryError, '아이디 또는 비밀번호가 올바르지 않습니다.');
                        }
                        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
                    }
                    
                    // 찾은 사용자의 email로 로그인 시도
                    // username@users.wavespace.com 형식 또는 실제 이메일 사용
                    const userEmail = users.email.includes('@') 
                        ? users.email 
                        : `${userIdOrEmail}@users.wavespace.com`;
                    
                    const { data, error } = await this.supabase.auth.signInWithPassword({
                        email: userEmail,
                        password
                    });
                    
                    if (error) {
                        console.error('Fallback 로그인 에러:', error);
                        if (ErrorHandler) {
                            ErrorHandler.handle(error);
                        }
                        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
                    }
                    
                    // 로그인 시간 업데이트
                    if (data.user) {
                        await this.supabase
                            .from('users')
                            .update({ updated_at: new Date().toISOString() })
                            .eq('auth_user_id', data.user.id);
                    }
                    
                    return { success: true, data };
                }
                
                if (!userData || !userData.success) {
                    if (ErrorHandler) {
                        ErrorHandler.showError('아이디 또는 비밀번호가 올바르지 않습니다.');
                    }
                    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
                }
                
                // 찾은 사용자의 email로 Supabase Auth 로그인 시도
                const userEmail = userData.user.email;
                console.log('📧 찾은 사용자 이메일로 로그인:', userEmail);
                
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: userEmail,
                    password
                });

                if (error) {
                    console.error('❌ Supabase Auth 로그인 실패:', error);
                    if (ErrorHandler) {
                        ErrorHandler.handle(error);
                    }
                    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
                }

                console.log('✅ Supabase Auth 로그인 성공:', data.user?.id);

                // 로그인 시간 업데이트
                if (data.user) {
                    await this.supabase
                        .from('users')
                        .update({ updated_at: new Date().toISOString() })
                        .eq('auth_user_id', data.user.id);
                }

                return { success: true, data };
            } else {
                // 이메일 형식인 경우 기존 방식대로
                console.log('📧 이메일 형식 로그인 시도:', userIdOrEmail);
                
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: userIdOrEmail,
                    password
                });

                if (error) {
                    console.error('❌ 이메일 로그인 실패:', error);
                    if (ErrorHandler) {
                        ErrorHandler.handle(error);
                    }
                    throw error;
                }

                console.log('✅ 이메일 로그인 성공:', data.user?.id);

                // 로그인 시간 업데이트
                if (data.user) {
                    await this.supabase
                        .from('users')
                        .update({ updated_at: new Date().toISOString() })
                        .eq('auth_user_id', data.user.id);
                }

                return { success: true, data };
            }
        } catch (error) {
            console.error('❌ 로그인 전체 실패:', error);
            if (ErrorHandler) {
                ErrorHandler.handle(error);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 로그아웃
     */
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            // 로컬 데이터 정리
            this.currentUser = null;
            localStorage.removeItem('waveUser');
            
            return { success: true };
        } catch (error) {
            console.error('로그아웃 실패:', error);
            if (ErrorHandler) {
                ErrorHandler.handle(error, '로그아웃 처리 중 오류가 발생했습니다.');
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 사용자 프로필 로드
     */
    async loadUserProfile() {
        try {
            if (!this.currentUser) return null;

            // 안전한 2단계 로드 사용
            let data, error;
            try {
                const { profile, badges } = await loadProfileAndBadges(this.supabase, this.currentUser.id);
                
                // 기존 구조와 호환되도록 변환
                data = {
                    ...profile,
                    user_badges: badges || []
                };
                error = null;
            } catch (loadError) {
                error = loadError;
                data = null;
            }

            if (error) {
                console.error('프로필 로드 실패:', error);
                
                // 프로필이 존재하지 않는 경우 (PGRST116: no rows returned)
                if (error.code === 'PGRST116' || error.message.includes('No rows')) {
                    console.log('🔧 프로필이 존재하지 않음, 자동 생성 시도');
                    
                    try {
                        // 프로필 자동 생성 시도
                        const createdProfile = await this.createMissingProfile();
                        if (createdProfile && !createdProfile.isFallback && !createdProfile.isLocalFallback) {
                            console.log('✅ 프로필 자동 생성 성공');
                            
                            // 생성된 프로필을 정상 형식으로 반환
                            const userInfo = {
                                id: createdProfile.id,
                                username: createdProfile.username,
                                nickname: createdProfile.nickname,
                                fullName: createdProfile.full_name || createdProfile.fullName,
                                email: createdProfile.email,
                                points: createdProfile.points,
                                level: createdProfile.level,
                                role: createdProfile.role,
                                badges: createdProfile.user_badges || [],
                                profileImage: createdProfile.profile_image_url
                            };
                            
                            localStorage.setItem('waveUser', JSON.stringify(userInfo));
                            this.userProfile = createdProfile;
                            return createdProfile;
                        }
                    } catch (createError) {
                        console.error('프로필 자동 생성 실패:', createError);
                        
                        // 네트워크 오류나 일시적 문제인 경우에만 fallback 사용
                        if (createError.message?.includes('network') || createError.message?.includes('timeout')) {
                            console.log('⚠️ 네트워크 문제로 임시 프로필 사용');
                            return this.createTemporaryProfile();
                        }
                    }
                    
                    // 다른 오류의 경우 재시도 없이 오류 처리
                    throw new Error('프로필을 생성할 수 없습니다. 관리자에게 문의해주세요.');
                    
                } else {
                    // 기타 데이터베이스 오류
                    throw error;
                }
            }

            // 정상적으로 프로필을 로드한 경우
            const userInfo = {
                id: data.id,
                username: data.username,
                nickname: data.nickname,  // 닉네임 추가
                fullName: data.full_name,
                email: data.email,
                points: data.points,
                level: data.level,
                role: data.role,
                badges: data.user_badges,
                profileImage: data.profile_image_url
            };
            
            localStorage.setItem('waveUser', JSON.stringify(userInfo));
            this.userProfile = data;  // userProfile 저장
            return data;
        } catch (error) {
            console.error('프로필 로드 중 오류:', error);
            
            // 심각한 네트워크 오류나 서버 오류인 경우에만 메시지 표시
            if (error.message?.includes('network') || error.message?.includes('Failed to fetch') || error.message?.includes('500')) {
                if (ErrorHandler) {
                    ErrorHandler.handle(error, '네트워크 연결을 확인해주세요.');
                }
                // 네트워크 오류 시 임시 프로필 사용
                return this.createTemporaryProfile();
            }
            
            // 프로필 생성 실패 등 다른 오류는 그대로 전파
            throw error;
        }
    }
    
    /**
     * 임시 프로필 생성 (네트워크 오류 등 임시 상황용)
     */
    createTemporaryProfile() {
        const tempProfile = {
            id: this.currentUser?.id || 'unknown',
            username: this.currentUser?.user_metadata?.username || this.currentUser?.email?.split('@')[0] || '사용자',
            nickname: this.currentUser?.user_metadata?.nickname || this.currentUser?.user_metadata?.username || '사용자',
            fullName: this.currentUser?.user_metadata?.full_name || '사용자',
            email: this.currentUser?.email || '',
            points: 0,
            level: 1,
            role: 'member',
            badges: [],
            profileImage: null,
            isTemporary: true
        };
        
        localStorage.setItem('waveUser', JSON.stringify(tempProfile));
        this.userProfile = tempProfile;
        return tempProfile;
    }

    /**
     * 누락된 프로필 자동 생성
     */
    async createMissingProfile() {
        try {
            if (!this.currentUser) return null;

            console.log('🔧 프로필 자동 생성 시작');

            // auth.users의 메타데이터에서 정보 추출
            const metadata = this.currentUser.user_metadata || {};
            const username = metadata.username || this.currentUser.email?.split('@')[0] || `user_${Date.now()}`;
            const nickname = metadata.nickname || metadata.username || username;
            const fullName = metadata.full_name || metadata.username || '사용자';
            const phone = metadata.phone || null;
            const memberType = metadata.member_type || 'general';

            // 먼저 프로필이 실제로 없는지 한번 더 확인
            try {
                const { data: existingUser, error: checkError } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('auth_user_id', this.currentUser.id)
                    .single();
                
                if (existingUser && !checkError) {
                    console.log('✅ 프로필이 이미 존재합니다');
                    return existingUser;
                }
            } catch (checkError) {
                // 프로필이 없는 것이 확인됨
                console.log('프로필 없음 확인, 생성 진행');
            }

            // RPC 함수를 사용하여 프로필 생성
            const { data: profileResult, error: profileError } = await this.supabase
                .rpc('create_signup_profile', {
                    p_user_id: this.currentUser.id,
                    p_username: username,
                    p_nickname: nickname,
                    p_full_name: fullName,
                    p_email: this.currentUser.email,
                    p_phone: phone,
                    p_member_type: memberType,
                    p_postal_code: null,
                    p_address: null,
                    p_detail_address: null,
                    p_referrer: null,
                    p_kakao_id: null,
                    p_additional_info: null
                });

            // RPC 성공 또는 이미 존재하는 경우
            if (!profileError || profileError?.code === 'PROFILE_EXISTS' || profileResult?.code === 'PROFILE_EXISTS') {
                console.log('✅ 프로필 생성/확인 완료');
                
                // 프로필 로드
                try {
                    const { profile, badges } = await loadProfileAndBadges(this.supabase, this.currentUser.id);
                    return {
                        ...profile,
                        user_badges: badges || []
                    };
                } catch (loadError) {
                    console.error('프로필 로드 실패:', loadError);
                    // 로드 실패해도 기본 정보는 반환
                    return {
                        id: this.currentUser.id,
                        username: username,
                        nickname: nickname,
                        full_name: fullName,
                        email: this.currentUser.email,
                        phone: phone,
                        role: 'member',
                        points: 1000,
                        level: 1,
                        user_badges: []
                    };
                }
            }

            // RPC 실패 시 직접 INSERT 시도
            if (profileError && profileError.code !== 'PROFILE_EXISTS') {
                console.log('RPC 실패, 직접 INSERT 시도');
                
                const { data: insertData, error: insertError } = await this.supabase
                    .from('users')
                    .insert([{
                        id: this.currentUser.id,
                        username: username,
                        nickname: nickname,
                        full_name: fullName,
                        email: this.currentUser.email,
                        phone: phone,
                        role: 'member',
                        points: 1000,
                        level: 1,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (!insertError && insertData) {
                    console.log('✅ 직접 INSERT 성공');
                    return insertData;
                }
                
                // 중복 키 에러인 경우 다시 조회
                if (insertError?.code === '23505') {
                    console.log('중복 키 에러, 기존 프로필 조회');
                    const { data: existingProfile } = await this.supabase
                        .from('users')
                        .select('*')
                        .eq('auth_user_id', this.currentUser.id)
                        .single();
                    
                    if (existingProfile) {
                        return existingProfile;
                    }
                }
                
                console.error('프로필 생성 완전 실패:', insertError);
                throw insertError || new Error('프로필 생성 실패');
            }

        } catch (error) {
            console.error('프로필 생성 중 오류:', error);
            throw error;
        }
    }

    /**
     * 프로필 생성 실패 로그 기록
     */
    async logProfileCreationFailure(error) {
        try {
            // 에러 로그를 별도 테이블에 기록하거나 콘솔에만 남김
            console.error('=== 프로필 생성 실패 상세 로그 ===');
            console.error('User ID:', this.currentUser?.id);
            console.error('Email:', this.currentUser?.email);
            console.error('Metadata:', this.currentUser?.user_metadata);
            console.error('Error:', error);
            console.error('Timestamp:', new Date().toISOString());
            console.error('================================');
            
            // 추후 에러 추적을 위해 localStorage에도 기록
            const errorLog = {
                userId: this.currentUser?.id,
                email: this.currentUser?.email,
                error: error.message,
                timestamp: new Date().toISOString(),
                metadata: this.currentUser?.user_metadata
            };
            
            const existingLogs = JSON.parse(localStorage.getItem('profileCreationErrors') || '[]');
            existingLogs.push(errorLog);
            
            // 최근 10개 로그만 유지
            if (existingLogs.length > 10) {
                existingLogs.shift();
            }
            
            localStorage.setItem('profileCreationErrors', JSON.stringify(existingLogs));
            
        } catch (logError) {
            console.error('로그 기록 중 오류:', logError);
        }
    }

    /**
     * 포인트 내역 추가
     */
    async addPointHistory(userId, amount, type, description, relatedId = null) {
        try {
            const { error } = await this.supabase
                .from('point_history')
                .insert([{
                    user_id: userId,
                    amount,
                    type,
                    description,
                    related_id: relatedId
                }]);

            if (error) throw error;

            // 사용자 포인트 업데이트
            const { error: updateError } = await this.supabase
                .from('users')
                .update({ 
                    points: this.supabase.rpc('increment_points', { 
                        user_uuid: userId, 
                        points_delta: amount 
                    })
                })
                .eq('id', userId);

            if (updateError) throw updateError;

        } catch (error) {
            console.error('포인트 내역 추가 실패:', error);
        }
    }

    /**
     * 뱃지 지급
     */
    async awardBadge(userId, badgeName) {
        try {
            // 뱃지 ID 조회
            const { data: badge } = await this.supabase
                .from('badges')
                .select('id')
                .eq('name', badgeName)
                .single();

            if (!badge) return;

            // 이미 보유한 뱃지인지 확인
            const { data: existing } = await this.supabase
                .from('user_badges')
                .select('id')
                .eq('id', userId)
                .eq('badge_id', badge.id)
                .single();

            if (existing) return; // 이미 보유함

            // 뱃지 지급
            const { error } = await this.supabase
                .from('user_badges')
                .insert([{
                    id: userId,
                    badge_id: badge.id
                }]);

            if (error) throw error;

            this.showToast(`🏆 새로운 뱃지 획득: ${badgeName}`, 'success');
        } catch (error) {
            console.error('뱃지 지급 실패:', error);
        }
    }

    /**
     * UI 업데이트 - 로그인된 사용자
     */
    updateUIForLoggedInUser() {
        // localStorage에서 사용자 정보 가져오기
        let user = JSON.parse(localStorage.getItem('waveUser') || '{}');
        
        // 사용자 정보가 없거나 불완전한 경우 currentUser에서 기본값 설정
        if (!user.id && this.currentUser) {
            user = {
                id: this.currentUser.id,
                username: this.currentUser.user_metadata?.username || this.currentUser.email?.split('@')[0] || '사용자',
                nickname: this.currentUser.user_metadata?.nickname || this.currentUser.user_metadata?.username || '사용자',
                fullName: this.currentUser.user_metadata?.full_name || '사용자',
                email: this.currentUser.email,
                points: 0,
                level: 1,
                role: 'member',
                badges: []
            };
            localStorage.setItem('waveUser', JSON.stringify(user));
        }
        
        // 헤더 사용자 정보 표시
        const userInfoElement = document.querySelector('#userInfoContainer');
        if (userInfoElement) {
            // 닉네임을 우선적으로 표시, 없으면 username, 그것도 없으면 fullName
            const displayName = user.nickname || user.username || user.fullName || '사용자';
            
            // 로그인된 사용자 UI 업데이트 (userInfoContainer 내부만 변경)
            userInfoElement.innerHTML = `
                <div class="user-logged-in login-required">
                    <!-- 알림 버튼 -->
                    <button class="header-icon-btn notification-btn">
                        <i class="fas fa-bell"></i>
                        <span class="notification-dot" style="display: none;"></span>
                    </button>
                    
                    <!-- 마이페이지 버튼 -->
                    <button class="header-icon-btn user-btn" data-action="profile" title="마이페이지">
                        <i class="fa-solid fa-user"></i>
                    </button>
                    
                    <!-- 포인트 표시 -->
                    <div class="header-points-display">
                        <i class="fa-solid fa-coins"></i>
                        <span>${(user.points || 0).toLocaleString()}P</span>
                    </div>
                    
                    <!-- 로그아웃 버튼 -->
                    <button class="header-icon-btn logout-btn" data-action="logout" title="로그아웃">
                        <i class="fa-solid fa-sign-out-alt"></i>
                    </button>
                </div>
            `;
            
            // 로그인된 사용자 UI 버튼에 이벤트 리스너 추가
            const profileBtn = userInfoElement.querySelector('button[data-action="profile"]');
            const logoutBtn = userInfoElement.querySelector('button[data-action="logout"]');
            
            if (profileBtn) {
                profileBtn.addEventListener('click', () => {
                    try {
                        this.openProfileSidepanel();
                    } catch (error) {
                        console.error('마이페이지 열기 실패:', error);
                    }
                });
            }
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        await this.signOut();
                    } catch (error) {
                        console.error('로그아웃 실패:', error);
                    }
                });
            }
        }

        // 로그인 관련 버튼 숨기기/표시
        document.querySelectorAll('.login-required').forEach(el => {
            el.style.display = 'flex';  // 로그인 시 flex로 표시
        });
        document.querySelectorAll('.anonymous-only').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * UI 업데이트 - 익명 사용자
     */
    updateUIForAnonymousUser() {
        const userInfoElement = document.querySelector('#userInfoContainer');
        if (userInfoElement) {
            // 기존 로그인 버튼이 있는지 확인
            const existingButtons = userInfoElement.querySelector('.auth-buttons');
            
            if (!existingButtons) {
                // 로그인/회원가입 버튼이 없다면 추가
                userInfoElement.innerHTML = `
                    <div class="auth-buttons anonymous-only">
                        <button class="btn btn-outline" data-action="login">
                            <i class="fas fa-sign-in-alt"></i>
                            <span>로그인</span>
                        </button>
                        <button class="btn btn-primary" data-action="signup">
                            <i class="fas fa-user-plus"></i>
                            <span>회원가입</span>
                        </button>
                    </div>
                `;
                
                // 익명 사용자 UI 버튼에 이벤트 리스너 추가
                const anonymousLoginBtn = userInfoElement.querySelector('button[data-action="login"]');
                const anonymousSignupBtn = userInfoElement.querySelector('button[data-action="signup"]');
                
                if (anonymousLoginBtn) {
                    anonymousLoginBtn.addEventListener('click', () => {
                        try {
                            this.openLoginSidepanel();
                        } catch (error) {
                            window.location.href = 'login.html';
                        }
                    });
                }
                
                if (anonymousSignupBtn) {
                    anonymousSignupBtn.addEventListener('click', () => {
                        window.location.href = 'signup.html';
                    });
                }
            }
        }

        // 로그인 필요 기능 숨기기
        document.querySelectorAll('.login-required').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.anonymous-only').forEach(el => {
            el.style.display = 'flex';  // 익명 사용자 시 flex로 표시
        });
    }

    /**
     * 사용자 뱃지 렌더링
     */
    renderUserBadges(badges) {
        if (!badges || badges.length === 0) return '';
        
        return badges.slice(0, 3).map(badgeData => {
            const badge = badgeData.badges;
            const badgeClass = `badge ${badge.badge_type}`;
            const style = badge.badge_type === 'premium' ? `background: ${badge.color};` : `color: ${badge.color};`;
            
            return `<span class="${badgeClass}" style="${style}">ㅣ${badge.name}ㅣ</span>`;
        }).join('');
    }

    /**
     * 회원유형 표시명 반환
     */
    getMemberTypeDisplay(memberType) {
        const typeMap = {
            'planning': '분양기획',
            'sales': '분양영업', 
            'general': '일반회원',
            'premium': '프리미엄',
            'vip': 'VIP'
        };
        return typeMap[memberType] || memberType;
    }

    /**
     * 대표 배지 가져오기
     */
    getRepresentativeBadge(user) {
        // 1. 사용자의 실제 뱃지가 있으면 최고 등급 뱃지 표시
        if (user.badges && user.badges.length > 0) {
            // 프리미엄 뱃지를 우선적으로 찾기
            const premiumBadge = user.badges.find(b => b.badges?.badge_type === 'premium');
            if (premiumBadge) {
                return premiumBadge.badges.name;
            }
            
            // 희귀 뱃지 찾기
            const rareBadge = user.badges.find(b => b.badges?.badge_type === 'rare');
            if (rareBadge) {
                return rareBadge.badges.name;
            }
            
            // 일반 뱃지 중 첫 번째
            const commonBadge = user.badges[0];
            if (commonBadge?.badges) {
                return commonBadge.badges.name;
            }
        }
        
        // 2. 사용자 프로필에 대표 뱃지가 설정되어 있다면 사용
        if (this.userProfile?.representative_badge) {
            return this.userProfile.representative_badge;
        }
        
        // 3. 뱃지가 없으면 포인트 기반 등급 표시
        const points = user.points || 0;
        
        if (points >= 100000) return '슈퍼리치';
        if (points >= 50000) return 'VIP';
        if (points >= 10000) return '골드';
        if (points >= 5000) return '실버';
        if (points >= 1000) return '브론즈';
        
        // 4. 포인트도 낮으면 기본값
        return '새내기';
    }

    /**
     * 로그인 사이드패널 열기
     */
    showLogin() {
        console.log('🔄 로그인 사이드패널 열기');
        try {
            this.openLoginSidepanel();
        } catch (error) {
            console.error('로그인 사이드패널 열기 실패:', error);
            // 폴백: 기존 로그인 페이지로 이동
            window.location.href = 'login.html';
        }
    }

    /**
     * 로그인 사이드패널 열기
     */
    openLoginSidepanel() {
        const sidepanel = document.getElementById('loginSidepanel');
        if (sidepanel) {
            sidepanel.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // 로그인 폼 초기화
            this.initLoginForm();
            
            console.log('✅ 로그인 사이드패널 열림');
        } else {
            console.error('❌ 로그인 사이드패널을 찾을 수 없음');
            throw new Error('로그인 사이드패널을 찾을 수 없습니다.');
        }
    }

    /**
     * 로그인 사이드패널 닫기
     */
    closeLoginSidepanel() {
        // 새로운 LoginSidepanelLoader를 우선적으로 사용
        if (window.loginSidepanelLoader && typeof window.loginSidepanelLoader.hideSidepanel === 'function') {
            window.loginSidepanelLoader.hideSidepanel();
        } else {
            // 폴백: 기존 방식
            const sidepanel = document.getElementById('loginSidepanel');
            if (sidepanel) {
                sidepanel.classList.remove('show', 'active');
                document.body.style.overflow = '';
                
                // 폼 초기화
                const form = document.getElementById('loginForm');
                if (form) {
                    form.reset();
                    this.hideLoginError();
                }
            }
            
            console.log('✅ 로그인 사이드패널 닫힘');
        }
    }

    /**
     * 로그인 폼 초기화 및 이벤트 설정
     */
    initLoginForm() {
        const form = document.getElementById('loginForm');
        const errorMessage = document.getElementById('login-error-message');
        
        if (!form) {
            console.error('❌ 로그인 폼을 찾을 수 없음');
            return;
        }
        
        // 기존 이벤트 리스너 제거 후 새로 추가
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // 폼 제출 이벤트
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLoginSubmit(e);
        });
        
        // Enter 키 처리
        const inputs = newForm.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    newForm.dispatchEvent(new Event('submit'));
                }
            });
        });
        
        // 에러 메시지 숨기기
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        
        // 첫 번째 입력 필드에 포커스
        const firstInput = newForm.querySelector('.form-input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300); // 애니메이션 후 포커스
        }
    }

    /**
     * 로그인 폼 제출 처리
     */
    async handleLoginSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const username = formData.get('username')?.trim();
        const password = formData.get('password');
        
        if (!username || !password) {
            this.showLoginError('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }
        
        // 로딩 상태 표시
        this.setLoginLoading(true);
        this.hideLoginError();
        
        try {
            // 로그인 시도
            const result = await this.signIn(username, password);
            
            if (result.success) {
                // 로그인 성공
                console.log('✅ 로그인 성공');
                
                // 사이드패널 닫기
                this.closeLoginSidepanel();
                
                // 마이페이지 데이터 새로고침
                if (typeof loadProfileData === 'function') {
                    loadProfileData();
                }
                
                // 성공 메시지 표시 (선택적)
                this.showToast('로그인되었습니다.', 'success');
                
            } else {
                // 로그인 실패
                this.showLoginError(result.error || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('❌ 로그인 처리 중 오류:', error);
            this.showLoginError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            // 로딩 상태 해제
            this.setLoginLoading(false);
        }
    }

    /**
     * 로그인 에러 메시지 표시
     */
    showLoginError(message) {
        const errorElement = document.getElementById('login-error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * 로그인 에러 메시지 숨기기
     */
    hideLoginError() {
        const errorElement = document.getElementById('login-error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * 로그인 버튼 로딩 상태 설정
     */
    setLoginLoading(loading) {
        const button = document.querySelector('#loginForm .btn-login');
        if (button) {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }

    /**
     * 소셜 로그인
     */
    async socialLogin(provider) {
        console.log(`🔄 ${provider} 소셜 로그인 시도`);
        
        try {
            this.setLoginLoading(true);
            
            let supabaseProvider;
            switch (provider) {
            case 'google':
                supabaseProvider = 'google';
                break;
            case 'kakao':
                // 카카오는 향후 구현
                throw new Error('카카오 로그인은 준비 중입니다.');
            case 'naver':
                // 네이버는 향후 구현
                throw new Error('네이버 로그인은 준비 중입니다.');
            default:
                throw new Error('지원하지 않는 소셜 로그인입니다.');
            }
            
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: supabaseProvider,
                options: {
                    redirectTo: `${window.location.origin}/index.html`
                }
            });
            
            if (error) {
                console.error(`❌ ${provider} 로그인 실패:`, error);
                this.showLoginError(`${provider} 로그인에 실패했습니다.`);
                return;
            }
            
            console.log(`✅ ${provider} 로그인 성공`);
            
        } catch (error) {
            console.error(`❌ ${provider} 소셜 로그인 오류:`, error);
            this.showLoginError(error.message);
        } finally {
            this.setLoginLoading(false);
        }
    }

    /**
     * 비밀번호 재설정 화면 표시
     */
    async showPasswordReset() {
        // 로그인 사이드패널이 있는 경우 사용
        if (window.loginSidepanelLoader && typeof window.loginSidepanelLoader.switchView === 'function') {
            // 로그인 사이드패널이 표시되어 있지 않다면 먼저 열기
            if (!window.loginSidepanelLoader.isVisible()) {
                await window.loginSidepanelLoader.showLoginSidepanel();
            }
            // 비밀번호 재설정 뷰로 전환
            window.loginSidepanelLoader.switchView('password-reset');
        } else {
            // 폴백: 기존 prompt 방식
            const email = prompt('임시 비밀번호를 받을 이메일 주소를 입력하세요:');
            
            if (!email) {
                return;
            }
            
            // 이메일 형식 검증
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('올바른 이메일 주소를 입력해주세요.');
                return;
            }
            
            try {
                const result = await this.resetPassword(email);
                
                if (result.success) {
                    alert(`${email}로 임시 비밀번호를 발송했습니다. 이메일을 확인해주세요.`);
                } else {
                    alert('임시 비밀번호 발송에 실패했습니다. 다시 시도해주세요.');
                }
            } catch (error) {
                console.error('❌ 임시 비밀번호 발송 오류:', error);
                alert('임시 비밀번호 발송 중 오류가 발생했습니다.');
            }
        }
    }

    /**
     * 회원가입 모달 표시
     */
    showSignup() {
        console.log('🔄 회원가입 페이지로 이동 중...');
        try {
            window.location.href = 'signup.html';
        } catch (error) {
            console.error('회원가입 페이지 이동 실패:', error);
            alert('회원가입 페이지를 열 수 없습니다.');
        }
    }

    /**
     * 프로필 페이지 표시
     */
    showProfile() {
        this.openProfileSidepanel();
    }

    /**
     * Toast 메시지 표시
     */
    showToast(message, type = 'info') {
        // 불필요한 기술적 메시지는 필터링
        const filteredMessages = [
            '프로필 정보를 일시적으로',
            'fallback',
            '복구',
            '일부 정보를 불러올 수 없습니다'
        ];
        
        // 필터링된 메시지는 콘솔에만 로그
        if (filteredMessages.some(filter => message.includes(filter))) {
            console.log(`[Toast filtered] ${message}`);
            return;
        }
        
        // toast.js의 showToastMessage 함수 사용
        if (window.showToastMessage) {
            window.showToastMessage(message, type);
        } else if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message); // fallback
        }
    }

    /**
     * 현재 사용자 정보 반환
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 로컬 사용자 정보 반환
     */
    getLocalUser() {
        try {
            return JSON.parse(localStorage.getItem('waveUser') || '{}');
        } catch {
            return {};
        }
    }

    /**
     * 로그인 여부 확인
     */
    isLoggedIn() {
        return !!this.currentUser;
    }

    /**
     * 관리자 권한 확인
     */
    isAdmin() {
        // 1차: 로컬 사용자 정보에서 확인
        const user = this.getLocalUser();
        if (user.role === 'admin') {
            return true;
        }
        
        // 2차: 현재 사용자의 메타데이터에서 확인
        if (this.currentUser && this.currentUser.user_metadata) {
            const isAdminFromMeta = this.currentUser.user_metadata.is_admin === true || 
                                  this.currentUser.user_metadata.is_admin === 'true';
            if (isAdminFromMeta) {
                return true;
            }
        }
        
        // 3차: 이메일 기반 확인 (admin@wavespace.com)
        if (this.currentUser && this.currentUser.email === 'admin@wavespace.com') {
            return true;
        }
        
        return false;
    }

    /**
     * 인증된 사용자인지 확인
     */
    isVerified() {
        const user = this.getLocalUser();
        return user.role === 'verified' || user.role === 'admin';
    }

    /**
     * 임시 비밀번호 발송 (Rate Limiting 적용)
     */
    async resetPassword(email) {
        try {
            // Rate Limiting 체크
            const rateLimitKey = `password_reset_${email}`;
            const ipRateLimitKey = `password_reset_ip_${this.getClientIP()}`;
            
            // 이메일별 제한 체크 (24시간에 5회)
            const emailAttempts = this.getRateLimitAttempts(rateLimitKey, 86400000); // 24시간
            if (emailAttempts >= 5) {
                return { 
                    success: false, 
                    error: '임시 비밀번호 요청 제한을 초과했습니다. 24시간 후에 다시 시도해주세요.' 
                };
            }
            
            // IP별 제한 체크 (5분에 3회)
            const ipAttempts = this.getRateLimitAttempts(ipRateLimitKey, 300000); // 5분
            if (ipAttempts >= 3) {
                return { 
                    success: false, 
                    error: '너무 많은 요청이 감지되었습니다. 5분 후에 다시 시도해주세요.' 
                };
            }
            
            // 사용자 확인
            const { data: user, error: userError } = await this.supabase
                .from('users')
                .select('id, email, username')
                .eq('email', email)
                .single();

            if (userError || !user) {
                // 보안을 위해 성공한 것처럼 표시
                this.incrementRateLimit(rateLimitKey);
                this.incrementRateLimit(ipRateLimitKey);
                this.logPasswordResetAttempt(email, false, '사용자 없음');
                return { success: true };
            }

            // 임시 비밀번호 생성 (8자리: 대소문자+숫자+특수문자)
            const tempPassword = this.generateTempPassword();
            
            // Supabase Auth에서 비밀번호 업데이트
            const { error: updateError } = await this.supabase.auth.admin.updateUserById(
                user.auth_user_id, 
                { password: tempPassword }
            );

            if (updateError) {
                console.error('비밀번호 업데이트 실패:', updateError);
                // 실제 구현에서는 이메일 발송 대신 로컬 임시 저장
                this.storeTempPassword(email, tempPassword);
            }
            
            // 이메일 발송 (실제로는 임시 저장)
            await this.sendTempPasswordEmail(email, tempPassword, user.username);
            
            // 성공 시 Rate Limit 카운트 증가
            this.incrementRateLimit(rateLimitKey);
            this.incrementRateLimit(ipRateLimitKey);
            
            // 보안 로그 기록
            this.logPasswordResetAttempt(email, true);
            
            return { 
                success: true, 
                message: '임시 비밀번호가 이메일로 발송되었습니다.' 
            };
        } catch (error) {
            console.error('임시 비밀번호 발송 실패:', error);
            
            // 실패 로그 기록
            this.logPasswordResetAttempt(email, false, error.message);
            
            // 에러 메시지도 보안을 위해 모호하게 처리
            return { success: false, error: '요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.' };
        }
    }

    /**
     * 임시 비밀번호 생성
     */
    generateTempPassword() {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        
        let password = '';
        
        // 각 문자 유형에서 최소 1개씩 포함
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // 나머지 4자리는 모든 문자에서 랜덤 선택
        const allChars = uppercase + lowercase + numbers + symbols;
        for (let i = 4; i < 8; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // 문자 섞기
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * 임시 비밀번호 로컬 저장 (개발용)
     */
    storeTempPassword(email, tempPassword) {
        try {
            const tempPasswords = JSON.parse(localStorage.getItem('temp_passwords') || '{}');
            tempPasswords[email] = {
                password: tempPassword,
                created: Date.now(),
                used: false
            };
            localStorage.setItem('temp_passwords', JSON.stringify(tempPasswords));
            console.log(`임시 비밀번호 저장됨 - ${email}: ${tempPassword}`);
        } catch (error) {
            console.error('임시 비밀번호 저장 실패:', error);
        }
    }

    /**
     * 임시 비밀번호 이메일 발송 (현재는 콘솔 출력)
     */
    async sendTempPasswordEmail(email, tempPassword, username) {
        // 실제 환경에서는 이메일 서비스 사용
        // 현재는 개발용으로 콘솔에 출력
        console.log(`
=== 임시 비밀번호 발송 ===
받는 사람: ${email}
사용자명: ${username}
임시 비밀번호: ${tempPassword}
========================
        `);
        
        // 로컬 저장소에도 저장 (개발용)
        this.storeTempPassword(email, tempPassword);
        
        return true;
    }
    
    /**
     * 비밀번호 재설정 시도 로그 기록
     */
    logPasswordResetAttempt(email, success, errorMessage = null) {
        try {
            const logs = JSON.parse(localStorage.getItem('password_reset_logs') || '[]');
            
            // 로그 추가
            logs.push({
                email: email.substring(0, 3) + '***', // 이메일 일부만 저장
                timestamp: Date.now(),
                success,
                errorMessage: errorMessage ? errorMessage.substring(0, 50) : null,
                userAgent: navigator.userAgent.substring(0, 100)
            });
            
            // 최근 100개 로그만 유지
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('password_reset_logs', JSON.stringify(logs));
            
            // 비정상적인 패턴 감지
            this.detectAbnormalPatterns(logs);
            
        } catch (error) {
            console.error('로그 기록 실패:', error);
        }
    }
    
    /**
     * 비정상적인 패턴 감지
     */
    detectAbnormalPatterns(logs) {
        const recentLogs = logs.filter(log => Date.now() - log.timestamp < 3600000); // 최근 1시간
        
        // 1시간 내 실패 10회 이상
        const failures = recentLogs.filter(log => !log.success);
        if (failures.length >= 10) {
            console.warn('⚠️ 비정상적인 비밀번호 재설정 시도 감지');
            // 실제 운영 환경에서는 관리자에게 알림 발송
        }
        
        // 다양한 이메일로 연속 시도
        const uniqueEmails = new Set(recentLogs.map(log => log.email)).size;
        if (uniqueEmails >= 5 && recentLogs.length >= 10) {
            console.warn('⚠️ 무작위 이메일 공격 시도 감지');
            // 실제 운영 환경에서는 IP 차단 등의 조치
        }
    }
    
    /**
     * Rate Limit 시도 횟수 확인
     */
    getRateLimitAttempts(key, timeWindow) {
        const storageKey = `rate_limit_${key}`;
        const data = localStorage.getItem(storageKey);
        
        if (!data) return 0;
        
        try {
            const attempts = JSON.parse(data);
            const now = Date.now();
            
            // 시간 윈도우 내의 시도만 필터링
            const validAttempts = attempts.filter(timestamp => now - timestamp < timeWindow);
            
            // 유효한 시도만 다시 저장
            if (validAttempts.length !== attempts.length) {
                localStorage.setItem(storageKey, JSON.stringify(validAttempts));
            }
            
            return validAttempts.length;
        } catch {
            return 0;
        }
    }
    
    /**
     * Rate Limit 카운트 증가
     */
    incrementRateLimit(key) {
        const storageKey = `rate_limit_${key}`;
        const data = localStorage.getItem(storageKey);
        
        let attempts = [];
        if (data) {
            try {
                attempts = JSON.parse(data);
            } catch {
                attempts = [];
            }
        }
        
        attempts.push(Date.now());
        localStorage.setItem(storageKey, JSON.stringify(attempts));
    }
    
    /**
     * 클라이언트 IP 추정 (간단한 방법)
     */
    getClientIP() {
        // 실제 IP를 얻기는 어려우므로 브라우저 정보로 대체
        const userAgent = navigator.userAgent;
        const language = navigator.language;
        const platform = navigator.platform;
        
        // 간단한 해시 생성
        const hash = btoa(`${userAgent}${language}${platform}`).substring(0, 16);
        return hash;
    }

    /**
     * 프로필 업데이트
     */
    async updateProfile(profileData) {
        try {
            if (!this.currentUser) throw new Error('로그인이 필요합니다.');

            const { error } = await this.supabase
                .from('users')
                .update({
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .eq('auth_user_id', this.currentUser.id);

            if (error) throw error;

            // 로컬 데이터 갱신
            await this.loadUserProfile();
            return { success: true };
        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 로그인 필요 시 리다이렉트
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            this.showToast('로그인이 필요한 기능입니다.', 'warning');
            this.showLogin();
            return false;
        }
        return true;
    }

    /**
     * 사용자 드롭다운 토글
     */
    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    /**
     * 드롭다운 외부 클릭시 닫기
     */
    setupDropdownClose() {
        document.addEventListener('click', (event) => {
            const dropdown = document.getElementById('userDropdown');
            const userProfile = event.target.closest('.user-profile');
            
            if (dropdown && !userProfile) {
                dropdown.classList.remove('show');
            }
        });
    }

    /**
     * 이메일 중복 체크
     */
    async checkEmailDuplicate(email) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            return { isDuplicate: !!data, available: !data };
        } catch (error) {
            console.error('이메일 중복 체크 실패:', error);
            return { isDuplicate: false, available: true, error: error.message };
        }
    }

    /**
     * 닉네임 중복 체크 (RPC 함수 사용)
     */
    async checkUsernameDuplicate(username) {
        try {
            const { data, error } = await this.supabase
                .rpc('check_username_exists', { username_to_check: username });

            if (error) {
                console.error('닉네임 중복 체크 에러:', error);
                return { isDuplicate: false, available: true, error: error.message };
            }

            return { isDuplicate: data, available: !data };
        } catch (error) {
            console.error('닉네임 중복 체크 실패:', error);
            return { isDuplicate: false, available: true, error: error.message };
        }
    }

    /**
     * 사용자명 중복 체크 (RPC 함수 사용)
     */
    async checkUserIdDuplicate(username) {
        try {
            const { data, error } = await this.supabase
                .rpc('check_username_exists', { username_to_check: username });

            if (error) {
                console.error('사용자명 중복 체크 에러:', error);
                return { isDuplicate: false, available: true, error: error.message };
            }

            return { isDuplicate: data, available: !data };
        } catch (error) {
            console.error('사용자명 중복 체크 실패:', error);
            return { isDuplicate: false, available: true, error: error.message };
        }
    }

    /**
     * 닉네임 중복 체크 (username 컬럼 사용 - 사용자명과 동일)
     */
    async checkNicknameDuplicate(nickname) {
        // 닉네임과 사용자명을 동일하게 처리
        return this.checkUserIdDuplicate(nickname);
    }

    /**
     * 비밀번호 강도 체크
     */
    checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];

        // 길이 체크
        if (password.length >= 8) score++;
        else feedback.push('8자 이상 입력하세요');

        // 대문자 체크
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('대문자를 포함하세요');

        // 소문자 체크
        if (/[a-z]/.test(password)) score++;
        else feedback.push('소문자를 포함하세요');

        // 숫자 체크
        if (/[0-9]/.test(password)) score++;
        else feedback.push('숫자를 포함하세요');

        // 특수문자 체크
        if (/[^A-Za-z0-9]/.test(password)) score++;
        else feedback.push('특수문자를 포함하세요');

        const strength = score <= 2 ? 'weak' : score <= 3 ? 'medium' : score <= 4 ? 'strong' : 'very-strong';
        
        return {
            score,
            strength,
            feedback,
            isValid: score >= 3 && password.length >= 8
        };
    }

    /**
     * 마이페이지 사이드패널 열기
     */
    openProfileSidepanel() {
        const openPanel = () => {
            if (window.componentLoader && typeof window.componentLoader.showProfileModal === 'function') {
                console.log('[AuthService] ComponentLoader로 프로필 모달 열기');
                window.componentLoader.showProfileModal();
            } else {
                console.error('ComponentLoader를 사용할 수 없습니다. 폴백 처리 시도...');
                this.tryFallbackProfileOpen();
            }
        };

        // ComponentLoader가 이미 준비되었는지 확인
        if (window.componentLoaderReady && window.componentLoader) {
            console.log('[AuthService] ComponentLoader 즉시 사용 가능');
            openPanel();
        } else if (window.ComponentLoader) {
            // ComponentLoader 클래스는 있지만 인스턴스가 없는 경우 직접 생성
            console.log('[AuthService] ComponentLoader 인스턴스 직접 생성');
            window.componentLoader = new window.ComponentLoader();
            window.componentLoaderReady = true;
            openPanel();
        } else {
            console.log('[AuthService] ComponentLoader 대기 중...');
            // 최대 3초 대기
            const timeoutId = setTimeout(() => {
                console.warn('[AuthService] ComponentLoader 로드 타임아웃, 폴백 처리');
                this.tryFallbackProfileOpen();
            }, 3000);
            
            document.addEventListener('componentLoaderReady', () => {
                clearTimeout(timeoutId);
                openPanel();
            }, { once: true });
        }
    }

    /**
     * ComponentLoader 사용 불가 시 폴백 프로필 열기
     */
    tryFallbackProfileOpen() {
        try {
            // ProfileSidepanelLoader 사용 시도
            if (window.ProfileSidepanelLoader) {
                console.log('[AuthService] ProfileSidepanelLoader로 폴백 처리');
                const loader = new window.ProfileSidepanelLoader();
                loader.showProfileSidepanel();
                return;
            }
            
            // 최종 폴백: 간단한 프로필 정보 알림
            const userInfo = this.userProfile || this.currentUser;
            if (userInfo) {
                alert(`사용자 정보:\n닉네임: ${userInfo.nickname || '사용자'}\n이메일: ${userInfo.email || '이메일 없음'}\n\n프로필 상세보기는 현재 로드 중입니다.`);
            } else {
                alert('사용자 정보를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('[AuthService] 폴백 프로필 열기 실패:', error);
            alert('프로필을 열 수 없습니다. 페이지를 새로고침해주세요.');
        }
    }

    /**
     * 마이페이지 사이드패널 닫기
     */
    closeProfileSidepanel() {
        const sidepanel = document.getElementById('profileSidepanel');
        if (sidepanel) {
            sidepanel.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    /**
     * 마이페이지 탭 전환
     */
    switchProfileTab(tabName) {
        // 네비게이션 활성화 상태 변경 - 새로운 클래스 이름 사용
        const navItems = document.querySelectorAll('.profile-tab');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            }
        });

        // 탭 콘텐츠 표시/숨김
        const tabContents = document.querySelectorAll('.profile-tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });

        // 탭별 데이터 로드
        this.loadTabData(tabName);
    }

    /**
     * 마이페이지 데이터 로드
     */
    async loadProfileData() {
        if (!this.currentUser || !this.userProfile) return;

        try {
            // 기본 프로필 정보 업데이트
            // 닉네임을 우선적으로 표시
            const displayName = this.userProfile.nickname || this.userProfile.username || '사용자명';
            document.getElementById('profile-username').textContent = displayName;
            document.getElementById('profile-email').textContent = this.currentUser.email;
            document.getElementById('profile-points').textContent = `${this.userProfile.points || 0} P`;
            document.getElementById('profile-current-points').textContent = `${this.userProfile.points || 0} P`;
            
            // 추가 회원 정보 업데이트
            const userIdElement = document.getElementById('profile-user-id');
            if (userIdElement) {
                userIdElement.textContent = this.userProfile.username || '-';
            }
            
            const nicknameElement = document.getElementById('profile-nickname');
            if (nicknameElement) {
                nicknameElement.textContent = this.userProfile.nickname || '-';
            }
            
            const memberTypeElement = document.getElementById('profile-member-type');
            if (memberTypeElement) {
                const memberTypeMap = {
                    'general': '일반 회원',
                    'sales_planning': '분양기획',
                    'sales_agency': '분양영업',
                    'subscription_consulting': '청약상담',
                    'related_company': '관계사',
                    'practitioner': '실무자'
                };
                const memberTypeText = memberTypeMap[this.userProfile.member_type] || this.userProfile.member_type || '-';
                memberTypeElement.textContent = memberTypeText;
            }
            
            // 대표 뱃지 업데이트
            const representativeBadge = this.getRepresentativeBadge(this.userProfile);
            const badgeElement = document.getElementById('profile-representative-badge');
            if (badgeElement && representativeBadge) {
                badgeElement.innerHTML = `
                    <i class="fas fa-medal"></i>
                    <span>${representativeBadge}</span>
                `;
                badgeElement.style.display = 'inline-flex';
            } else if (badgeElement) {
                badgeElement.style.display = 'none';
            }
            
            // 뱃지 개수 업데이트
            const badgeCount = this.userProfile.user_badges ? this.userProfile.user_badges.length : 0;
            document.getElementById('profile-badge-count').textContent = `${badgeCount}개`;
            document.getElementById('profile-total-badges').textContent = `${badgeCount} / 28`;
            document.getElementById('profile-badge-progress').textContent = `${Math.round((badgeCount / 28) * 100)}%`;

            // 실무자 인증 상태 업데이트
            this.updatePractitionerStatus();

        } catch (error) {
            console.error('마이페이지 데이터 로드 실패:', error);
        }
    }

    /**
     * 탭별 데이터 로드
     */
    async loadTabData(tabName) {
        switch (tabName) {
        case 'activity':
            await this.loadActivityData();
            break;
        case 'points':
            await this.loadPointsData();
            break;
        case 'badges':
            await this.loadBadgesData();
            break;
        case 'purchases':
            await this.loadPurchasesData();
            break;
        case 'settings':
            this.loadSettingsData();
            break;
        }
    }

    /**
     * 활동 내역 데이터 로드
     */
    async loadActivityData() {
        // TODO: 실제 활동 내역 로드 로직 구현
        console.log('활동 내역 로드');
    }

    /**
     * 포인트 내역 데이터 로드
     */
    async loadPointsData() {
        // TODO: 실제 포인트 내역 로드 로직 구현
        console.log('포인트 내역 로드');
    }

    /**
     * 뱃지 데이터 로드
     */
    async loadBadgesData() {
        if (!this.userProfile || !this.userProfile.user_badges) return;

        const badgeGrid = document.getElementById('profile-badge-grid');
        const badgeEmpty = badgeGrid.querySelector('.profile-badge-empty');
        
        if (this.userProfile.user_badges.length === 0) {
            if (badgeEmpty) badgeEmpty.style.display = 'block';
            return;
        }

        if (badgeEmpty) badgeEmpty.style.display = 'none';

        // 뱃지 목록 생성
        const badgeHTML = this.userProfile.user_badges.map(userBadge => {
            const badge = userBadge.badges;
            return `
                <div class="profile-badge-item">
                    <div class="profile-badge-icon" style="background: ${badge.color}">
                        <i class="${badge.icon}"></i>
                    </div>
                    <div class="profile-badge-info">
                        <h5>${badge.name}</h5>
                        <p>${new Date(userBadge.earned_at).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        }).join('');

        badgeGrid.innerHTML = badgeHTML;
    }

    /**
     * 구매 내역 데이터 로드
     */
    async loadPurchasesData() {
        // TODO: 실제 구매 내역 로드 로직 구현
        console.log('구매 내역 로드');
    }

    /**
     * 설정 데이터 로드
     */
    loadSettingsData() {
        // TODO: 실제 설정 데이터 로드 로직 구현
        console.log('설정 데이터 로드');
    }

    /**
     * 실무자 인증 상태 업데이트
     */
    updatePractitionerStatus() {
        const practitionerSection = document.getElementById('profile-practitioner');
        const statusIcon = practitionerSection.querySelector('.profile-status-icon');
        const statusText = practitionerSection.querySelector('.profile-status-text');
        const progressFill = practitionerSection.querySelector('.profile-progress-fill');
        const progressText = practitionerSection.querySelector('.profile-progress-text');

        // TODO: 실제 업로드 데이터 기반으로 상태 업데이트
        // 임시로 기본값 설정
        const uploadedCount = 1; // 임시값
        const requiredCount = 3;
        const progress = (uploadedCount / requiredCount) * 100;

        if (statusIcon) {
            statusIcon.className = 'profile-status-icon pending';
        }
        if (statusText) {
            statusText.textContent = '인증 대기중';
        }
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `${requiredCount}건 중 ${uploadedCount}건 업로드 완료`;
        }
    }

    /**
     * 이메일 변경
     */
    async changeEmail() {
        try {
            const newEmail = document.getElementById('newEmail').value;
            const password = document.getElementById('emailPassword').value;
            
            if (!newEmail || !password) {
                this.showToast('모든 필드를 입력해주세요.', 'error');
                return;
            }
            
            // 이메일 형식 검증
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                this.showToast('올바른 이메일 형식이 아닙니다.', 'error');
                return;
            }
            
            // 현재 이메일과 동일한지 확인
            if (newEmail === this.currentUser.email) {
                this.showToast('현재 이메일과 동일합니다.', 'error');
                return;
            }
            
            // Supabase에서 이메일 변경
            const { error } = await this.supabase.auth.updateUser({
                email: newEmail,
                password: password
            });
            
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    this.showToast('비밀번호가 올바르지 않습니다.', 'error');
                } else {
                    this.showToast(`이메일 변경 실패: ${error.message}`, 'error');
                }
                return;
            }
            
            this.showToast('이메일이 변경되었습니다. 새 이메일로 확인 링크가 전송되었습니다.', 'success');
            document.getElementById('changeEmailModal').remove();
            
            // UI 업데이트
            await this.loadUserProfile();
            this.updateUIForLoggedInUser();
            
        } catch (error) {
            console.error('이메일 변경 오류:', error);
            this.showToast('이메일 변경 중 오류가 발생했습니다.', 'error');
        }
    }
    
    /**
     * 비밀번호 변경
     */
    async changePassword() {
        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showToast('모든 필드를 입력해주세요.', 'error');
                return;
            }
            
            // 새 비밀번호 검증
            if (newPassword !== confirmPassword) {
                this.showToast('새 비밀번호가 일치하지 않습니다.', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                this.showToast('비밀번호는 8자 이상이어야 합니다.', 'error');
                return;
            }
            
            if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
                this.showToast('비밀번호는 영문과 숫자를 포함해야 합니다.', 'error');
                return;
            }
            
            // 현재 비밀번호로 재인증 시도
            const { error: signInError } = await this.supabase.auth.signInWithPassword({
                email: this.currentUser.email,
                password: currentPassword
            });
            
            if (signInError) {
                this.showToast('현재 비밀번호가 올바르지 않습니다.', 'error');
                return;
            }
            
            // 비밀번호 변경
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) {
                this.showToast(`비밀번호 변경 실패: ${error.message}`, 'error');
                return;
            }
            
            this.showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
            document.getElementById('changePasswordModal').remove();
            
        } catch (error) {
            console.error('비밀번호 변경 오류:', error);
            this.showToast('비밀번호 변경 중 오류가 발생했습니다.', 'error');
        }
    }
}

// 전역 인증 서비스 인스턴스 생성 및 즉시 전역 등록
const authService = new AuthService();
window.authService = authService;

console.log('✅ AuthService 전역 등록 완료');

// 페이지 로드 시 초기화 (load 대신 DOMContentLoaded 사용으로 더 빠른 초기화)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthService);
} else {
    // 이미 로드 완료된 경우 즉시 초기화
    setTimeout(initializeAuthService, 0);
}

async function initializeAuthService() {
    // HeaderLoader 완료 대기 (동적 헤더 페이지의 경우)
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        // 헤더가 로드될 때까지 대기
        let headerLoaded = false;
        let headerAttempts = 0;
        const maxHeaderAttempts = 20; // 2초 대기
        
        while (!headerLoaded && headerAttempts < maxHeaderAttempts) {
            const header = headerContainer.querySelector('header');
            if (header) {
                headerLoaded = true;
                console.log('[AuthService] HeaderLoader 완료 확인됨');
            } else {
                await new Promise(resolve => setTimeout(resolve, 100));
                headerAttempts++;
            }
        }
        
        if (!headerLoaded) {
            console.warn('[AuthService] HeaderLoader 대기 시간 초과, 계속 진행');
        }
    }
    
    // Supabase가 초기화될 때까지 대기
    let attempts = 0;
    const maxAttempts = 50; // 5초 대기
    
    while (attempts < maxAttempts) {
        if (window.WaveSupabase && window.WaveSupabase.getClient) {
            try {
                window.WaveSupabase.getClient();
                await authService.init();
                break;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }
}