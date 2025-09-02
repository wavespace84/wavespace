/**
 * 운영 환경 설정 템플릿
 * 배포 시 이 파일을 config.prod.js로 복사하고 실제 값을 입력하세요.
 * 주의: config.prod.js는 절대 Git에 커밋하지 마세요!
 */

// Supabase 설정 (운영용)
window.SUPABASE_URL = 'YOUR_PRODUCTION_SUPABASE_URL';
window.SUPABASE_ANON_KEY = 'YOUR_PRODUCTION_ANON_KEY';

// 환경 설정
window.NODE_ENV = 'production';

console.log('✅ 운영 환경 설정 로드됨');