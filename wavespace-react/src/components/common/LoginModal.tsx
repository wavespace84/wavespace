import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../lib/zustand/appStore';
import { authService } from '../../services/authService';
import { LoadingSpinner } from '../ui/LoadingSpinner';

type LoginView = 'login' | 'password-reset' | 'email-sent';

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, globalLoading } = useAppStore();
  const [currentView, setCurrentView] = useState<LoginView>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    resetEmail: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendTimer, setResendTimer] = useState(0);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isLoginModalOpen) {
      setCurrentView('login');
      setFormData({ email: '', password: '', resetEmail: '' });
      setErrors({});
      setResendTimer(0);
    }
  }, [isLoginModalOpen]);

  // 재전송 타이머
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 입력 시 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.resetEmail) {
      newErrors.resetEmail = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.resetEmail)) {
      newErrors.resetEmail = '올바른 이메일 형식이 아닙니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    const result = await authService.signInWithEmail(formData.email, formData.password);
    
    if (result.success) {
      closeLoginModal();
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResetForm()) return;
    
    const result = await authService.resetPassword(formData.resetEmail);
    
    if (result.success) {
      setCurrentView('email-sent');
      setResendTimer(60);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    const result = await authService.signInWithProvider(provider);
    
    if (result.success) {
      closeLoginModal();
    }
  };

  const handleResendEmail = async () => {
    if (resendTimer > 0) return;
    
    const result = await authService.resetPassword(formData.resetEmail);
    
    if (result.success) {
      setResendTimer(60);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="fixed inset-0"
        onClick={closeLoginModal}
      />
      
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative z-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {currentView === 'login' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              )}
              {currentView === 'password-reset' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              )}
              {currentView === 'email-sent' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              )}
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentView === 'login' && '로그인'}
              {currentView === 'password-reset' && '비밀번호 찾기'}
              {currentView === 'email-sent' && '이메일 발송 완료'}
            </h2>
          </div>
          
          <button
            onClick={closeLoginModal}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 환영 메시지 */}
        <div className="px-6 py-4 bg-gray-50">
          <p className="text-center text-sm text-gray-600">
            {currentView === 'login' && 'WAVE SPACE에 오신 것을 환영합니다'}
            {currentView === 'password-reset' && '가입하신 이메일 주소를 입력하시면 임시 비밀번호를 발송해드립니다.'}
            {currentView === 'email-sent' && '이메일을 확인해주세요!'}
          </p>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          {currentView === 'login' && (
            <>
              {/* 로그인 폼 */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    아이디
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="이메일을 입력하세요"
                    className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                    disabled={globalLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="비밀번호를 입력하세요"
                    className={`form-input ${errors.password ? 'border-red-300' : ''}`}
                    disabled={globalLoading}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={globalLoading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {globalLoading ? <LoadingSpinner size="small" /> : '로그인'}
                </button>
              </form>

              {/* 비밀번호 찾기 */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setCurrentView('password-reset')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>

              {/* 소셜 로그인 */}
              <div className="mt-6">
                <div className="text-center text-xs text-gray-500 mb-4">
                  *마이페이지에서 간편 로그인을 설정할수 있습니다
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleSocialLogin('google')}
                    disabled={globalLoading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google로 로그인
                  </button>

                  <button
                    onClick={() => handleSocialLogin('kakao')}
                    disabled={globalLoading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-yellow-400 rounded-md text-sm font-medium text-gray-700 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                    </svg>
                    카카오로 로그인
                  </button>

                  <button
                    onClick={() => handleSocialLogin('naver')}
                    disabled={globalLoading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-green-500 rounded-md text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold text-lg mr-2">N</span>
                    네이버로 로그인
                  </button>
                </div>
              </div>

              {/* 회원가입 링크 */}
              <div className="mt-6 text-center text-sm text-gray-600">
                아직 회원이 아니신가요?{' '}
                <Link
                  to="/auth/signup"
                  onClick={closeLoginModal}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  회원가입
                </Link>
              </div>
            </>
          )}

          {currentView === 'password-reset' && (
            <>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    name="resetEmail"
                    value={formData.resetEmail}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className={`form-input ${errors.resetEmail ? 'border-red-300' : ''}`}
                    disabled={globalLoading}
                  />
                  {errors.resetEmail && (
                    <p className="mt-1 text-xs text-red-600">{errors.resetEmail}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={globalLoading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {globalLoading ? <LoadingSpinner size="small" /> : '임시 비밀번호 받기'}
                </button>
              </form>

              {/* 이메일 서비스 바로가기 */}
              <div className="mt-6">
                <p className="text-sm text-gray-600 text-center mb-3">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  이메일 확인하러 가기
                </p>
                
                <div className="flex space-x-2">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    </svg>
                    구글 메일
                  </a>
                  
                  <a
                    href="https://mail.naver.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-green-500 rounded-md text-sm text-green-700 hover:bg-green-50 transition-colors"
                  >
                    <span className="font-bold mr-2">N</span>
                    네이버 메일
                  </a>
                </div>
              </div>

              {/* 돌아가기 */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  로그인으로 돌아가기
                </button>
              </div>
            </>
          )}

          {currentView === 'email-sent' && (
            <>
              <div className="text-center">
                <div className="mb-6">
                  <svg className="mx-auto w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  이메일을 확인해주세요!
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  <span className="font-medium">{formData.resetEmail}</span>로<br />
                  임시 비밀번호를 발송했습니다.
                </p>

                {/* 팁 */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    이메일이 도착하지 않았나요?
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 스팸함을 확인해주세요</li>
                    <li>• 이메일 주소가 정확한지 확인해주세요</li>
                    <li>• 몇 분 후에 다시 시도해주세요</li>
                  </ul>
                </div>

                {/* 액션 버튼 */}
                <div className="space-y-3">
                  <button
                    onClick={handleResendEmail}
                    disabled={resendTimer > 0 || globalLoading}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    다시 보내기 {resendTimer > 0 && `(${resendTimer}초)`}
                  </button>
                  
                  <button
                    onClick={() => setCurrentView('login')}
                    className="btn-primary w-full"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};