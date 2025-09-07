import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 에러를 Supabase에 로깅 (선택적)
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  private async logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      const { supabase } = await import('../../lib/supabase/client');
      
      await supabase.from('error_logs').insert({
        message: error.message,
        stack: error.stack,
        component_stack: errorInfo.componentStack,
        error_boundary: true,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent
      });
    } catch (logError) {
      console.error('Failed to log error to service:', logError);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              문제가 발생했습니다
            </h2>
            
            <p className="text-gray-600 mb-6">
              페이지를 불러오는 중 오류가 발생했습니다.<br />
              잠시 후 다시 시도해주세요.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-gray-50 p-4 rounded-lg mb-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  개발자 정보 (개발 모드에서만 표시)
                </summary>
                <div className="mt-2 text-xs text-gray-600 font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                페이지 새로고침
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                이전 페이지로
              </button>
              
              <a
                href="/"
                className="block w-full px-4 py-2 text-center text-blue-600 hover:text-blue-800 focus:outline-none focus:underline transition-colors"
              >
                홈으로 돌아가기
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}