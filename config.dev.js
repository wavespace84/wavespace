/**
 * 개발 환경 설정
 * 주의: 이 파일은 개발 환경에서만 사용하며, 운영 환경에서는 다른 방법을 사용해야 합니다.
 */

// Supabase 설정 (개발용)
window.SUPABASE_URL = 'https://sishloxzcqapontycuyz.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpc2hsb3h6Y3FhcG9udHljdXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTA2MzAsImV4cCI6MjA3MDEyNjYzMH0.23aVcOSXDSvCi7yRtnCumy9knjIkL_mTAudSyubANZs';

// 환경 설정
window.NODE_ENV = 'development';

console.log('✅ 개발 환경 설정 로드됨');
console.log('🔍 환경변수 확인:', {
    SUPABASE_URL: window.SUPABASE_URL,
    SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY ? '존재함' : '없음'
});