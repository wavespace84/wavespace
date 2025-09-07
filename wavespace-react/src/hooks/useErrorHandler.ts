import { useCallback } from 'react';
import { useAppStore } from '../lib/zustand/appStore';

interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const useErrorHandler = () => {
  const { setGlobalError, addNotification } = useAppStore();

  const handleError = useCallback((error: ErrorInfo | Error | string) => {
    let errorMessage: string;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let code: string | undefined;
    let details: any;

    // 에러 타입에 따른 처리
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      code = error.name;
    } else {
      errorMessage = error.message;
      severity = error.severity || 'medium';
      code = error.code;
      details = error.details;
    }

    // 전역 에러 상태 업데이트
    setGlobalError(errorMessage);

    // 에러 심각도에 따른 알림 타입 결정
    const notificationType = severity === 'critical' || severity === 'high' 
      ? 'error' 
      : 'warning';

    // 사용자 알림
    addNotification({
      type: notificationType,
      title: '오류 발생',
      message: errorMessage
    });

    // 콘솔 로깅 (개발 환경)
    if (import.meta.env.DEV) {
      console.group(`🔴 [${severity.toUpperCase()}] Error Handler`);
      console.error('Message:', errorMessage);
      if (code) console.error('Code:', code);
      if (details) console.error('Details:', details);
      console.groupEnd();
    }

    // 심각한 에러의 경우 Supabase에 로깅
    if (severity === 'critical' || severity === 'high') {
      logErrorToSupabase({
        message: errorMessage,
        code,
        details,
        severity,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }).catch(logError => {
        console.error('에러 로깅 실패:', logError);
      });
    }
  }, [setGlobalError, addNotification]);

  const clearError = useCallback(() => {
    setGlobalError(null);
  }, [setGlobalError]);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    errorContext?: string
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      const contextMessage = errorContext 
        ? `${errorContext}: ${error instanceof Error ? error.message : String(error)}`
        : error instanceof Error ? error.message : String(error);
      
      handleError(contextMessage);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    clearError,
    handleAsyncError
  };
};

// Supabase에 에러 로깅
async function logErrorToSupabase(errorData: {
  message: string;
  code?: string;
  details?: any;
  severity: string;
  timestamp: string;
  userAgent: string;
  url: string;
}) {
  try {
    const { supabase } = await import('../lib/supabase/client');
    
    await supabase
      .from('error_logs')
      .insert({
        ...errorData,
        details: JSON.stringify(errorData.details)
      });
  } catch (error) {
    // 에러 로깅이 실패해도 앱이 중단되지 않도록
    console.error('Failed to log error to Supabase:', error);
  }
}