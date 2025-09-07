import { useCallback } from 'react';
import { useAppStore } from '../lib/zustand/appStore';

export const useLoading = () => {
  const { globalLoading, setGlobalLoading } = useAppStore();

  const startLoading = useCallback(() => {
    setGlobalLoading(true);
  }, [setGlobalLoading]);

  const stopLoading = useCallback(() => {
    setGlobalLoading(false);
  }, [setGlobalLoading]);

  const withLoading = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    showGlobalLoading = true
  ): Promise<T> => {
    if (showGlobalLoading) {
      startLoading();
    }
    
    try {
      const result = await asyncOperation();
      return result;
    } finally {
      if (showGlobalLoading) {
        stopLoading();
      }
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading: globalLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};