import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAppStore } from '../../lib/zustand/appStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { globalLoading } = useAppStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as any)?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 입력 시 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await authService.signInWithEmail(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    const result = await authService.signInWithProvider(provider);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인</h1>
        <p className="text-gray-600">WAVE space에 오신 것을 환영합니다</p>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일을 입력하세요"
            className={`form-input ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            disabled={globalLoading}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
            className={`form-input ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            disabled={globalLoading}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
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
      <div className="mt-6 text-center">
        <Link
          to="/auth/reset-password"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          비밀번호를 잊으셨나요?
        </Link>
      </div>

      {/* 구분선 */}
      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는</span>
        </div>
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
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
            className="w-full flex items-center justify-center px-4 py-3 border border-yellow-400 rounded-lg text-sm font-medium text-gray-700 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>

          <button
            onClick={() => handleSocialLogin('naver')}
            disabled={globalLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-green-500 rounded-lg text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50"
          >
            <span className="font-bold text-lg mr-3">N</span>
            네이버로 로그인
          </button>
        </div>
      </div>

      {/* 회원가입 링크 */}
      <div className="mt-8 text-center">
        <span className="text-sm text-gray-600">
          아직 회원이 아니신가요?{' '}
        </span>
        <Link
          to="/auth/signup"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}