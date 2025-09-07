/**
 * 에러 관련 유틸리티 함수들
 */

export interface WaveSpaceError {
  message: string;
  code?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
  timestamp?: string;
}

/**
 * 표준 에러 객체를 WaveSpaceError로 변환
 */
export function createWaveSpaceError(
  message: string,
  code?: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  details?: any
): WaveSpaceError {
  return {
    message,
    code,
    severity,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Supabase 에러를 사용자 친화적인 메시지로 변환
 */
export function parseSupabaseError(error: any): WaveSpaceError {
  const message = error?.message || '알 수 없는 오류가 발생했습니다.';
  const code = error?.code || error?.error_code;
  
  // 일반적인 Supabase 에러 코드에 따른 사용자 친화적 메시지
  const errorMessages: Record<string, string> = {
    '23505': '이미 등록된 정보입니다.',
    '23503': '참조된 데이터가 존재하지 않습니다.',
    'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
    'auth/user-not-found': '사용자를 찾을 수 없습니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일 주소입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다.',
    'auth/invalid-credential': '로그인 정보가 올바르지 않습니다.',
    'invalid_grant': '로그인 정보가 올바르지 않습니다.',
    'email_not_confirmed': '이메일 인증이 필요합니다.'
  };
  
  const friendlyMessage = errorMessages[code] || message;
  
  return createWaveSpaceError(
    friendlyMessage,
    code,
    determineErrorSeverity(code),
    error
  );
}

/**
 * 에러 코드에 따른 심각도 결정
 */
function determineErrorSeverity(code?: string): 'low' | 'medium' | 'high' | 'critical' {
  if (!code) return 'medium';
  
  const highSeverityCodes = [
    '23505', '23503', // DB 제약 조건 위반
    'auth/invalid-credential',
    'invalid_grant'
  ];
  
  const lowSeverityCodes = [
    'auth/weak-password',
    'email_not_confirmed'
  ];
  
  if (highSeverityCodes.includes(code)) return 'high';
  if (lowSeverityCodes.includes(code)) return 'low';
  
  return 'medium';
}

/**
 * 네트워크 에러 감지
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.name === 'NetworkError' ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.code === 'NETWORK_ERROR'
  );
}

/**
 * 인증 에러 감지
 */
export function isAuthError(error: any): boolean {
  const authCodes = [
    'auth/invalid-email',
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/invalid-credential',
    'invalid_grant',
    'email_not_confirmed'
  ];
  
  return authCodes.includes(error?.code);
}

/**
 * 권한 에러 감지
 */
export function isPermissionError(error: any): boolean {
  return (
    error?.code === '42501' || // PostgreSQL insufficient privilege
    error?.message?.includes('permission') ||
    error?.message?.includes('unauthorized') ||
    error?.message?.includes('forbidden')
  );
}

/**
 * 데이터 검증 에러 감지
 */
export function isValidationError(error: any): boolean {
  return (
    error?.code?.startsWith('23') || // PostgreSQL integrity constraint violation
    error?.message?.includes('validation') ||
    error?.message?.includes('required') ||
    error?.message?.includes('invalid')
  );
}

/**
 * 에러 메시지 한국어 번역
 */
export function translateErrorMessage(message: string): string {
  const translations: Record<string, string> = {
    'Email not confirmed': '이메일 인증이 필요합니다.',
    'Invalid login credentials': '로그인 정보가 올바르지 않습니다.',
    'User not found': '사용자를 찾을 수 없습니다.',
    'Invalid email': '유효하지 않은 이메일 주소입니다.',
    'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
    'Network error': '네트워크 연결을 확인해주세요.',
    'Internal server error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'Unauthorized': '권한이 없습니다.',
    'Forbidden': '접근이 거부되었습니다.',
    'Not found': '요청한 리소스를 찾을 수 없습니다.'
  };
  
  // 정확히 일치하는 번역이 있는지 확인
  if (translations[message]) {
    return translations[message];
  }
  
  // 부분 일치하는 번역 확인
  for (const [englishMessage, koreanMessage] of Object.entries(translations)) {
    if (message.toLowerCase().includes(englishMessage.toLowerCase())) {
      return koreanMessage;
    }
  }
  
  return message;
}