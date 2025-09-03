/**
 * WAVE SPACE - Authentication Service
 * Supabase를 사용한 인증 관리 서비스
 */

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
        this.supabase = null;
        this.currentUser = null;
    }

    /**
     * 초기화
     */
    async init() {
        try {
            // Supabase가 초기화될 때까지 대기 (최대 10초)
            let attempts = 0;
            const maxAttempts = 100; // 10초 대기
            
            while (attempts < maxAttempts) {
                try {
                    this.supabase = window.WaveSupabase.getClient();
                    break;
                } catch (error) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
            }
            
            if (!this.supabase) {
                throw new Error('Supabase 초기화 타임아웃 (10초)');
            }
            
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
        
        // 헤더 사용자 정보 영역에 기본 UI 표시
        this.updateUIForAnonymousUser();
        
        // 기존 인증 관련 요소들 숨기기
        const authElements = document.querySelectorAll('.auth-section, .user-profile, .auth-buttons');
        authElements.forEach(el => {
            if (el) el.style.display = 'none';
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
    }

    /**
     * Supabase 클라이언트 준비 대기
     */
    async waitForSupabaseReady() {
        let attempts = 0;
        const maxAttempts = 50; // 5초 대기
        
        while (attempts < maxAttempts) {
            try {
                if (window.WaveSupabase && window.WaveSupabase.getClient) {
                    this.supabase = window.WaveSupabase.getClient();
                    if (this.supabase && this.supabase.auth) {
                        return true;
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
        
        return false;
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
                
                // Supabase 초기화를 기다림
                await this.waitForSupabaseReady();
                
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
            const firstLetter = displayName.charAt(0);
            
            // 실무자 인증 여부
            const isVerified = this.userProfile?.is_verified || user.isVerified || false;
            
            // 대표 배지 (슈퍼리치, VIP 등)
            const representativeBadge = this.getRepresentativeBadge(user);
            
            // 프로필 이미지
            const profileImage = user.profileImage || this.userProfile?.profile_image_url;
            
            // 헤더 구조에 따라 적응적으로 업데이트
            const headerRight = document.querySelector('.header-right');
            
            // 심플 아이콘 HTML 템플릿
            const simpleIconsHTML = `
                <div class="header-simple-icons">
                    <!-- 알림 아이콘 -->
                    <button class="header-icon-btn notification-btn">
                        <i class="fas fa-bell"></i>
                        <span class="notification-dot"></span>
                    </button>
                    
                    <!-- 사용자 아이콘 -->
                    <button class="header-icon-btn user-btn" onclick="authService.openMypageSidepanel()">
                        <i class="fas fa-user-circle"></i>
                    </button>
                    
                    <!-- 포인트 표시 -->
                    <div class="header-points-display">
                        <i class="fas fa-coins"></i>
                        <span>${(user.points || 0).toLocaleString()}P</span>
                    </div>
                    
                    <!-- 로그아웃 아이콘 -->
                    <button class="header-icon-btn logout-btn" onclick="authService.signOut()">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            `;

            if (headerRight) {
                // 검색 버튼 없이 간단한 아이콘들만 표시
                headerRight.innerHTML = simpleIconsHTML;
            } else {
                // fallback: userInfoContainer만 업데이트
                userInfoElement.innerHTML = simpleIconsHTML;
            }
        }

        // 알림 버튼 표시 (로그인된 사용자에게는 필요)
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.style.display = 'block';
        }


        // 로그인 관련 버튼 숨기기/표시
        document.querySelectorAll('.login-required').forEach(el => {
            el.style.display = 'block';
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
            userInfoElement.innerHTML = `
                <div class="auth-buttons anonymous-only">
                    <button onclick="window.location.href='login.html'" class="btn-login">로그인</button>
                    <button onclick="window.location.href='signup.html'" class="btn-signup">회원가입</button>
                </div>
            `;
        }

        // 알림 버튼 숨기기 (로그인하지 않은 사용자에게는 불필요)
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.style.display = 'none';
        }


        // 로그인 필요 기능 숨기기
        document.querySelectorAll('.login-required').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.anonymous-only').forEach(el => {
            el.style.display = 'block';
        });
    }

    /**
     * 사용자 뱃지 렌더링
     */
    renderUserBadges(badges) {
        if (!badges || badges.length === 0) return '';
        
        return badges.slice(0, 3).map(badgeData => {
            const badge = badgeData.badges;
            let badgeClass = `badge ${badge.badge_type}`;
            let style = badge.badge_type === 'premium' ? `background: ${badge.color};` : `color: ${badge.color};`;
            
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
     * 로그인 페이지로 이동
     */
    showLogin() {
        console.log('🔄 로그인 페이지로 이동 중...');
        try {
            window.location.href = 'login.html';
        } catch (error) {
            console.error('로그인 페이지 이동 실패:', error);
            alert('로그인 페이지를 열 수 없습니다.');
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
        window.location.href = 'profile.html';
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
     * 비밀번호 재설정
     */
    async resetPassword(email) {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('비밀번호 재설정 실패:', error);
            return { success: false, error: error.message };
        }
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
        let feedback = [];

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
    openMypageSidepanel() {
        const sidepanel = document.getElementById('mypageSidepanel');
        if (sidepanel) {
            sidepanel.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // 사용자 정보 로드
            this.loadMypageData();
        }
    }

    /**
     * 마이페이지 사이드패널 닫기
     */
    closeMypageSidepanel() {
        const sidepanel = document.getElementById('mypageSidepanel');
        if (sidepanel) {
            sidepanel.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    /**
     * 마이페이지 탭 전환
     */
    switchMypageTab(tabName) {
        // 네비게이션 활성화 상태 변경 - 새로운 클래스 이름 사용
        const navItems = document.querySelectorAll('.mypage-tab');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            }
        });

        // 탭 콘텐츠 표시/숨김
        const tabContents = document.querySelectorAll('.mypage-tab-content');
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
    async loadMypageData() {
        if (!this.currentUser || !this.userProfile) return;

        try {
            // 기본 프로필 정보 업데이트
            // 닉네임을 우선적으로 표시
            const displayName = this.userProfile.nickname || this.userProfile.username || '사용자명';
            document.getElementById('mypage-username').textContent = displayName;
            document.getElementById('mypage-email').textContent = this.currentUser.email;
            document.getElementById('mypage-points').textContent = `${this.userProfile.points || 0} P`;
            document.getElementById('mypage-current-points').textContent = `${this.userProfile.points || 0} P`;
            
            // 대표 뱃지 업데이트
            const representativeBadge = this.getRepresentativeBadge(this.userProfile);
            const badgeElement = document.getElementById('mypage-representative-badge');
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
            document.getElementById('mypage-badge-count').textContent = `${badgeCount}개`;
            document.getElementById('mypage-total-badges').textContent = `${badgeCount} / 28`;
            document.getElementById('mypage-badge-progress').textContent = `${Math.round((badgeCount / 28) * 100)}%`;

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

        const badgeGrid = document.getElementById('mypage-badge-grid');
        const badgeEmpty = badgeGrid.querySelector('.mypage-badge-empty');
        
        if (this.userProfile.user_badges.length === 0) {
            if (badgeEmpty) badgeEmpty.style.display = 'block';
            return;
        }

        if (badgeEmpty) badgeEmpty.style.display = 'none';

        // 뱃지 목록 생성
        const badgeHTML = this.userProfile.user_badges.map(userBadge => {
            const badge = userBadge.badges;
            return `
                <div class="mypage-badge-item">
                    <div class="mypage-badge-icon" style="background: ${badge.color}">
                        <i class="${badge.icon}"></i>
                    </div>
                    <div class="mypage-badge-info">
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
        const practitionerSection = document.getElementById('mypage-practitioner');
        const statusIcon = practitionerSection.querySelector('.mypage-status-icon');
        const statusText = practitionerSection.querySelector('.mypage-status-text');
        const progressFill = practitionerSection.querySelector('.mypage-progress-fill');
        const progressText = practitionerSection.querySelector('.mypage-progress-text');

        // TODO: 실제 업로드 데이터 기반으로 상태 업데이트
        // 임시로 기본값 설정
        const uploadedCount = 1; // 임시값
        const requiredCount = 3;
        const progress = (uploadedCount / requiredCount) * 100;

        if (statusIcon) {
            statusIcon.className = 'mypage-status-icon pending';
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
}

// 전역 인증 서비스 인스턴스 생성
const authService = new AuthService();

// 페이지 로드 시 초기화
window.addEventListener('load', async () => {
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
});

// 전역 접근 가능하도록 설정
window.authService = authService;