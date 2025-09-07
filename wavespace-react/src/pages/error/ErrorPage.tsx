import { useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError() as any;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 에러 아이콘 */}
        <div className="mb-8">
          <svg
            className="mx-auto h-32 w-32 text-red-400"
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

        {/* 에러 제목 */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            오류가 발생했습니다
          </h1>
          <h2 className="text-lg text-gray-600">
            페이지를 불러오는 중 문제가 발생했습니다
          </h2>
        </div>

        {/* 에러 메시지 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-red-800">
            {error?.statusText || error?.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
          
          {import.meta.env.DEV && error?.stack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-red-700">
                개발자 정보 (개발 모드에서만 표시)
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            페이지 새로고침
          </button>
          
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
          >
            홈으로 돌아가기
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            이전 페이지로
          </button>
        </div>

        {/* 도움말 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            문제가 지속되면{' '}
            <Link
              to="/support/center"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              고객센터
            </Link>
            로 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}