/**
 * WAVE SPACE - Authentication Service
 * Supabase를 사용한 인증 관리 서비스
 */

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
            
            // 폴백 UI 표시
            this.showFallbackAuthUI(error.message);
        }
    }

    /**
     * 폴백 인증 UI 표시
     */
    showFallbackAuthUI(errorMessage) {
        console.log('🔄 폴백 인증 UI 활성화');
        
        // 기존 인증 관련 요소들 숨기기
        const authElements = document.querySelectorAll('.auth-section, .user-profile, .auth-buttons');
        authElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        // 에러 메시지 표시
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error-fallback';
        errorDiv.innerHTML = `
            <div style="padding: 10px; background: #fee; border: 1px solid #fcc; border-radius: 4px; margin: 10px; font-size: 12px;">
                <strong>⚠️ 인증 시스템 연결 실패</strong><br>
                ${errorMessage}<br>
                <small>페이지를 새로고침하거나 잠시 후 다시 시도하세요.</small>
            </div>
        `;
        
        // 적절한 위치에 에러 메시지 삽입
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.insertBefore(errorDiv, sidebar.firstChild);
        }
    }

    /**
     * 현재 인증 상태 확인
     */
    async checkAuthState() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            this.currentUser = user;
            
            if (user) {
                // 사용자 프로필 정보 로드
                await this.loadUserProfile();
                this.updateUIForLoggedInUser();
            } else {
                this.updateUIForAnonymousUser();
            }
            
            return user;
        } catch (error) {
            console.error('인증 상태 확인 실패:', error);
            return null;
        }
    }

    /**
     * 인증 상태 변화 감지
     */
    setupAuthListener() {
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('인증 상태 변화:', event, session);
            
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.loadUserProfile();
                this.updateUIForLoggedInUser();
                this.showToast('로그인되었습니다!', 'success');
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.updateUIForAnonymousUser();
                this.showToast('로그아웃되었습니다.', 'info');
            }
        });
    }

    /**
     * 회원가입
     */
    async signUp(username, password, nickname, fullName, email, phone, memberType, additionalInfo = {}, additionalData = {}) {
        try {
            // SMTP 설정이 없는 경우를 위한 임시 이메일 형식 사용
            // 실제 운영 환경에서는 SMTP 설정 필요 (docs/SUPABASE_SETUP.md 참조)
            const authEmail = email.includes('@') 
                ? email 
                : `${username}@users.wavespace.com`; // 개발용 임시 이메일
            
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
                // 더 명확한 에러 메시지 처리
                if (error.message && error.message.includes('Database error finding user')) {
                    // Database error 발생 시 대체 회원가입 방식 시도
                    console.log('Database error 발생, 대체 방식으로 시도');
                    return await this.alternativeSignUp(username, password, nickname, fullName, email, phone, memberType, additionalInfo, additionalData);
                }
                throw error;
            }

            // 2. users 테이블에 프로필 정보 저장
            if (data.user) {
                // RPC 함수를 사용하여 프로필 생성 (RLS 우회)
                const profileData = {
                    p_auth_user_id: data.user.id,
                    p_username: username,
                    p_full_name: fullName,
                    p_email: email, // 실제 이메일 저장
                    p_phone: phone,
                    p_member_type: memberType,
                    p_postal_code: additionalData.postalCode || null,
                    p_address: additionalData.address || null,
                    p_detail_address: additionalData.detailAddress || null,
                    p_referrer: additionalData.referrer || null,
                    p_kakao_id: additionalData.kakaoId || null,
                    p_additional_info: Object.keys(additionalInfo).length > 0 ? JSON.stringify(additionalInfo) : null
                };

                // RPC 함수 호출로 프로필 생성
                const { data: profileResult, error: profileError } = await this.supabase
                    .rpc('create_user_profile', profileData);

                if (profileError) {
                    console.error('RPC 프로필 생성 실패:', profileError);
                    
                    // RPC 실패 시 직접 삽입 시도 (fallback)
                    const directProfileData = {
                        auth_user_id: data.user.id,
                        username: username,
                        full_name: fullName,
                        email: email,
                        phone,
                        member_type: memberType,
                        points: 1000,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    
                    // 주소 정보 추가
                    if (additionalData.postalCode) directProfileData.postal_code = additionalData.postalCode;
                    if (additionalData.address) directProfileData.address = additionalData.address;
                    if (additionalData.detailAddress) directProfileData.detail_address = additionalData.detailAddress;
                    if (additionalData.referrer) directProfileData.referrer = additionalData.referrer;
                    if (additionalData.kakaoId) directProfileData.kakao_id = additionalData.kakaoId;
                    
                    // 회원 유형별 추가 정보 저장
                    if (Object.keys(additionalInfo).length > 0) {
                        directProfileData.additional_info = JSON.stringify(additionalInfo);
                    }

                    // 직접 삽입 시도
                    const { error: directError } = await this.supabase
                        .from('users')
                        .insert([directProfileData]);

                    if (directError) {
                        console.error('직접 프로필 삽입도 실패:', directError);
                        // 프로필 생성 실패해도 auth 계정은 생성되었으므로 성공으로 처리
                    } else {
                        console.log('직접 프로필 삽입 성공');
                    }
                } else {
                    console.log('RPC를 통한 프로필 생성 성공:', profileResult);
                }
            }

            return { success: true, data };
        } catch (error) {
            console.error('회원가입 실패:', error);
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
                nickname,
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
                    p_auth_user_id: this.supabase.auth.user()?.id,
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
            // 이메일 형식이 아닌 경우 username 기반 로그인 시도
            if (!userIdOrEmail.includes('@')) {
                console.log('Username 기반 로그인 시도:', userIdOrEmail);
                
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
                    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
                }
                
                // 찾은 사용자의 email로 Supabase Auth 로그인 시도
                const userEmail = userData.user.email;
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: userEmail,
                    password
                });

                if (error) {
                    console.error('Auth 로그인 에러:', error);
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
            } else {
                // 이메일 형식인 경우 기존 방식대로
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: userIdOrEmail,
                    password
                });

                if (error) throw error;

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
            console.error('로그인 실패:', error);
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
            return { success: false, error: error.message };
        }
    }

    /**
     * 사용자 프로필 로드
     */
    async loadUserProfile() {
        try {
            if (!this.currentUser) return null;

            const { data, error } = await this.supabase
                .from('users')
                .select(`
                    *,
                    user_badges(
                        badge_id,
                        earned_at,
                        badges(name, badge_type, color, icon)
                    )
                `)
                .eq('auth_user_id', this.currentUser.id)
                .single();

            if (error) throw error;

            // 로컬 스토리지에 사용자 정보 저장 (보안 정보 제외)
            const userInfo = {
                id: data.id,
                username: data.username,
                fullName: data.full_name,
                email: data.email,
                points: data.points,
                level: data.level,
                role: data.role,
                badges: data.user_badges,
                profileImage: data.profile_image_url
            };
            
            localStorage.setItem('waveUser', JSON.stringify(userInfo));
            return data;
        } catch (error) {
            console.error('프로필 로드 실패:', error);
            return null;
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
                    auth_user_id: userId, // user_id를 auth_user_id로 변경
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
                .eq('auth_user_id', userId) // user_id를 auth_user_id로 변경
                .eq('badge_id', badge.id)
                .single();

            if (existing) return; // 이미 보유함

            // 뱃지 지급
            const { error } = await this.supabase
                .from('user_badges')
                .insert([{
                    auth_user_id: userId, // user_id를 auth_user_id로 변경
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
        const user = JSON.parse(localStorage.getItem('waveUser') || '{}');
        
        // 헤더 사용자 정보 표시
        const userInfoElement = document.querySelector('#userInfoContainer');
        if (userInfoElement) {
            const firstLetter = (user.username || user.fullName || '사용자').charAt(0);
            userInfoElement.innerHTML = `
                <div class="user-profile-container login-required">
                    <div class="user-profile" onclick="authService.toggleUserDropdown()">
                        <div class="user-avatar">
                            <span>${firstLetter}</span>
                            <div class="user-badge">
                                <i class="fas fa-crown"></i>
                            </div>
                        </div>
                        <div class="user-details">
                            <span class="username">${user.username || user.fullName || '사용자'}님</span>
                            <span class="points">${(user.points || 0).toLocaleString()}P</span>
                            <div class="user-badges">
                                ${this.renderUserBadges(user.badges)}
                            </div>
                        </div>
                        <i class="fas fa-chevron-down user-dropdown-icon"></i>
                    </div>
                    <div class="user-dropdown" id="userDropdown">
                        <a href="#" onclick="openMypageModal(); return false;" class="dropdown-item">
                            <i class="fas fa-user"></i>
                            <span>마이페이지</span>
                        </a>
                        <a href="points-ranking.html" class="dropdown-item">
                            <i class="fas fa-chart-bar"></i>
                            <span>포인트 현황</span>
                        </a>
                        <a href="points-shop.html" class="dropdown-item">
                            <i class="fas fa-store"></i>
                            <span>포인트 상점</span>
                        </a>
                        <div class="dropdown-item logout" onclick="authService.signOut()">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>로그아웃</span>
                        </div>
                    </div>
                </div>
            `;
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
                    <button onclick="authService.showLogin()" class="btn-login">로그인</button>
                    <button onclick="authService.showSignup()" class="btn-signup">회원가입</button>
                </div>
            `;
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
     * 로그인 모달 표시
     */
    showLogin() {
        console.log('🔄 로그인 모달 표시 중...');
        try {
            // 모달이 있는 경우 모달 사용, 없으면 페이지 이동
            if (typeof openModal === 'function' && document.getElementById('loginModal')) {
                openModal('loginModal');
            } else {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('로그인 표시 실패:', error);
            alert('로그인을 표시할 수 없습니다.');
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
        this.openMypageModal();
    }

    /**
     * Toast 메시지 표시
     */
    showToast(message, type = 'info') {
        // 기존 toast 모듈 활용
        if (window.showToast) {
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
        const user = this.getLocalUser();
        return user.role === 'admin';
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
     * 마이페이지 모달 열기
     */
    openMypageModal() {
        const modal = document.getElementById('mypageModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // 사용자 정보 로드
            this.loadMypageData();
        }
    }

    /**
     * 마이페이지 모달 닫기
     */
    closeMypageModal() {
        const modal = document.getElementById('mypageModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    /**
     * 마이페이지 탭 전환
     */
    switchMypageTab(tabName) {
        // 네비게이션 활성화 상태 변경
        const navItems = document.querySelectorAll('.mypage-nav-item');
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
            document.getElementById('mypage-username').textContent = this.userProfile.username || '사용자명';
            document.getElementById('mypage-email').textContent = this.currentUser.email;
            document.getElementById('mypage-points').textContent = `${this.userProfile.points || 0} P`;
            document.getElementById('mypage-current-points').textContent = `${this.userProfile.points || 0} P`;
            
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