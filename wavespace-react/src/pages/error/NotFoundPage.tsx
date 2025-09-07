import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 이미지 */}
        <div className="mb-8">
          <svg
            className="mx-auto h-32 w-32 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m6 5H3a2 2 0 01-2-2V5a2 2 0 012-2h18a2 2 0 012 2v14a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* 에러 코드 */}
        <div className="mb-6">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
            페이지를 찾을 수 없습니다
          </h2>
        </div>

        {/* 설명 */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br />
          URL을 다시 확인하시거나 메인 페이지로 돌아가주세요.
        </p>

        {/* 액션 버튼 */}
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            이전 페이지로
          </button>
        </div>

        {/* 도움말 링크 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            도움이 필요하시면{' '}
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