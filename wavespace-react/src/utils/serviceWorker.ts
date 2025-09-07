import React from 'react';
import { Platform } from './platform';

// 서비스 워커 등록 및 관리 유틸리티

export interface ServiceWorkerConfig {
  swUrl?: string;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export interface OfflineAction {
  type: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp?: number;
}

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private onUpdateCallbacks: Array<(registration: ServiceWorkerRegistration) => void> = [];

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  // 서비스 워커 등록
  async register(config: ServiceWorkerConfig = {}): Promise<boolean> {
    if (!Platform.isWeb || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    const swUrl = config.swUrl || '/sw.js';

    try {
      const registration = await navigator.serviceWorker.register(swUrl);
      this.registration = registration;

      console.log('✅ Service Worker registered:', registration.scope);

      // 업데이트 확인
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 Service Worker update available');
            this.updateAvailable = true;
            config.onUpdate?.(registration);
            this.onUpdateCallbacks.forEach(callback => callback(registration));
          }
        });
      });

      // 성공 콜백
      config.onSuccess?.(registration);

      // 메시지 리스너 설정
      this.setupMessageListener();

      // 정기적으로 업데이트 확인
      this.startUpdateChecker();

      return true;

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      config.onError?.(error as Error);
      return false;
    }
  }

  // 서비스 워커 업데이트 적용
  async applyUpdate(): Promise<boolean> {
    if (!this.registration || !this.updateAvailable) {
      return false;
    }

    const newWorker = this.registration.waiting;
    if (!newWorker) return false;

    // 새 서비스 워커에게 skipWaiting 요청
    newWorker.postMessage({ action: 'SKIP_WAITING' });

    // 페이지 새로고침
    window.location.reload();
    return true;
  }

  // 업데이트 콜백 등록
  onUpdate(callback: (registration: ServiceWorkerRegistration) => void): void {
    this.onUpdateCallbacks.push(callback);
  }

  // 오프라인 액션 저장
  async storeOfflineAction(action: OfflineAction): Promise<void> {
    if (!this.registration) return;

    const worker = this.registration.active;
    if (!worker) return;

    worker.postMessage({
      action: 'STORE_OFFLINE_ACTION',
      data: action
    });

    console.log('💾 Offline action stored:', action.type);
  }

  // 캐시 크기 조회
  async getCacheSize(): Promise<number> {
    return new Promise((resolve) => {
      if (!this.registration?.active) {
        resolve(0);
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.cacheSize || 0);
      };

      this.registration.active.postMessage(
        { action: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );
    });
  }

  // 캐시 정리
  async clearCache(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.registration?.active) {
        resolve(false);
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success || false);
      };

      this.registration.active.postMessage(
        { action: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  // 네트워크 상태 모니터링
  setupNetworkMonitoring(): void {
    if (!Platform.isWeb) return;

    window.addEventListener('online', () => {
      console.log('🌐 Network online');
      this.triggerBackgroundSync();
    });

    window.addEventListener('offline', () => {
      console.log('📵 Network offline');
    });
  }

  // 백그라운드 동기화 트리거
  private async triggerBackgroundSync(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.sync.register('background-sync');
      console.log('🔄 Background sync registered');
    } catch (error) {
      console.warn('⚠️ Background sync not supported:', error);
    }
  }

  // 메시지 리스너 설정
  private setupMessageListener(): void {
    if (!Platform.isWeb) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'CACHE_UPDATED':
          console.log('📦 Cache updated:', data);
          break;
        
        case 'OFFLINE_ACTION_SYNCED':
          console.log('✅ Offline action synced:', data);
          break;
        
        case 'SYNC_FAILED':
          console.error('❌ Sync failed:', data);
          break;
      }
    });
  }

  // 정기적으로 업데이트 확인
  private startUpdateChecker(): void {
    // 1시간마다 업데이트 확인
    setInterval(() => {
      this.registration?.update();
    }, 60 * 60 * 1000);

    // 페이지 포커스 시 업데이트 확인
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.registration?.update();
      }
    });
  }

  // 서비스 워커 제거
  async unregister(): Promise<boolean> {
    if (!Platform.isWeb || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        console.log('🗑️ Service Worker unregistered');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  }

  // 현재 상태 조회
  getStatus(): {
    isSupported: boolean;
    isRegistered: boolean;
    updateAvailable: boolean;
    controller: ServiceWorker | null;
  } {
    return {
      isSupported: Platform.isWeb && 'serviceWorker' in navigator,
      isRegistered: !!this.registration,
      updateAvailable: this.updateAvailable,
      controller: Platform.isWeb ? navigator.serviceWorker.controller : null
    };
  }
}

// 기본 서비스 워커 등록 함수
export async function registerServiceWorker(config?: ServiceWorkerConfig): Promise<boolean> {
  const manager = ServiceWorkerManager.getInstance();
  
  // 네트워크 모니터링 설정
  manager.setupNetworkMonitoring();
  
  return manager.register(config);
}

// React Hook for Service Worker
export function useServiceWorker() {
  const [status, setStatus] = React.useState(() => {
    const manager = ServiceWorkerManager.getInstance();
    return manager.getStatus();
  });

  const [cacheSize, setCacheSize] = React.useState<number>(0);

  React.useEffect(() => {
    const manager = ServiceWorkerManager.getInstance();

    // 상태 업데이트 리스너
    const updateStatus = () => {
      setStatus(manager.getStatus());
    };

    // 업데이트 콜백 등록
    manager.onUpdate(() => {
      updateStatus();
    });

    // 캐시 크기 조회
    manager.getCacheSize().then(setCacheSize);

    // 주기적으로 상태 업데이트
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const applyUpdate = React.useCallback(async () => {
    const manager = ServiceWorkerManager.getInstance();
    return manager.applyUpdate();
  }, []);

  const clearCache = React.useCallback(async () => {
    const manager = ServiceWorkerManager.getInstance();
    const success = await manager.clearCache();
    if (success) {
      setCacheSize(0);
    }
    return success;
  }, []);

  const storeOfflineAction = React.useCallback(async (action: OfflineAction) => {
    const manager = ServiceWorkerManager.getInstance();
    return manager.storeOfflineAction(action);
  }, []);

  return {
    status,
    cacheSize,
    applyUpdate,
    clearCache,
    storeOfflineAction
  };
}

// PWA 설치 관리
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    if (!Platform.isWeb) return;

    // PWA 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    // PWA 설치 완료 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 이미 설치되었는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = React.useCallback(async () => {
    if (!installPrompt) return false;

    const result = await installPrompt.prompt();
    console.log('PWA install result:', result);

    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstallable(false);
      return true;
    }

    return false;
  }, [installPrompt]);

  return {
    isInstallable,
    isInstalled,
    install
  };
}

export default ServiceWorkerManager;