// 플랫폼별 유틸리티 및 호환성 레이어

// 플랫폼 감지
export const Platform = {
  OS: typeof window !== 'undefined' ? 'web' as const : 'native' as const,
  isWeb: typeof window !== 'undefined',
  isNative: typeof window === 'undefined',
  isAndroid: false, // React Native에서 설정
  isIOS: false,     // React Native에서 설정
  
  select: <T>(options: {
    web?: T;
    native?: T;
    android?: T;
    ios?: T;
    default?: T;
  }): T => {
    if (Platform.isWeb && options.web !== undefined) {
      return options.web;
    }
    if (Platform.isNative && options.native !== undefined) {
      return options.native;
    }
    if (Platform.isAndroid && options.android !== undefined) {
      return options.android;
    }
    if (Platform.isIOS && options.ios !== undefined) {
      return options.ios;
    }
    return options.default as T;
  }
};

// 디멘션 유틸리티
export const Dimensions = {
  get: (type: 'window' | 'screen' = 'window') => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    
    if (type === 'window') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    } else {
      return {
        width: window.screen.width,
        height: window.screen.height,
      };
    }
  },
  
  addEventListener: (type: string, handler: () => void) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handler);
    }
    
    return {
      remove: () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', handler);
        }
      }
    };
  }
};

// 스타일시트 호환성
export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => {
    if (Platform.isWeb) {
      return styles;
    }
    // React Native에서는 StyleSheet.create을 사용
    return styles;
  },
  
  flatten: (styles: any[]): any => {
    return Object.assign({}, ...styles);
  }
};

// 텍스트 호환성
export const Text = Platform.select({
  web: 'span',
  native: 'Text',
  default: 'span'
});

// 뷰 호환성
export const View = Platform.select({
  web: 'div',
  native: 'View',
  default: 'div'
});

// 이미지 호환성
export const Image = Platform.select({
  web: 'img',
  native: 'Image',
  default: 'img'
});

// 스크롤뷰 호환성
export const ScrollView = Platform.select({
  web: 'div',
  native: 'ScrollView',
  default: 'div'
});

// 터치 이벤트 호환성
export const TouchableOpacity = Platform.select({
  web: 'button',
  native: 'TouchableOpacity',
  default: 'button'
});

// 안전 영역 뷰 (Safe Area)
export const SafeAreaView = Platform.select({
  web: 'div',
  native: 'SafeAreaView',
  default: 'div'
});

// 저장소 호환성 (AsyncStorage)
export const Storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.isWeb) {
      return localStorage.getItem(key);
    }
    // React Native에서는 AsyncStorage 사용
    return null;
  },
  
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.isWeb) {
      localStorage.setItem(key, value);
    }
    // React Native에서는 AsyncStorage 사용
  },
  
  async removeItem(key: string): Promise<void> {
    if (Platform.isWeb) {
      localStorage.removeItem(key);
    }
    // React Native에서는 AsyncStorage 사용
  },
  
  async clear(): Promise<void> {
    if (Platform.isWeb) {
      localStorage.clear();
    }
    // React Native에서는 AsyncStorage 사용
  }
};

// 네트워킹 호환성
export const NetInfo = {
  fetch: async () => {
    if (Platform.isWeb) {
      return {
        isConnected: navigator.onLine,
        type: 'wifi', // 웹에서는 정확한 타입을 알기 어려움
      };
    }
    // React Native에서는 @react-native-community/netinfo 사용
    return { isConnected: true, type: 'unknown' };
  },
  
  addEventListener: (listener: (state: any) => void) => {
    if (Platform.isWeb) {
      const handleOnline = () => listener({ isConnected: true });
      const handleOffline = () => listener({ isConnected: false });
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    
    return () => {};
  }
};

// 클립보드 호환성
export const Clipboard = {
  async setString(content: string): Promise<void> {
    if (Platform.isWeb && navigator.clipboard) {
      await navigator.clipboard.writeText(content);
    }
    // React Native에서는 @react-native-clipboard/clipboard 사용
  },
  
  async getString(): Promise<string> {
    if (Platform.isWeb && navigator.clipboard) {
      return await navigator.clipboard.readText();
    }
    // React Native에서는 @react-native-clipboard/clipboard 사용
    return '';
  }
};

// 알림 호환성
export const Alert = {
  alert: (title: string, message?: string, buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>) => {
    if (Platform.isWeb) {
      // 웹에서는 기본 alert 사용하거나 커스텀 모달 구현
      if (buttons && buttons.length > 1) {
        const confirmed = confirm(`${title}\n${message || ''}`);
        const button = confirmed ? buttons[0] : buttons[1];
        button?.onPress?.();
      } else {
        alert(`${title}\n${message || ''}`);
        buttons?.[0]?.onPress?.();
      }
    }
    // React Native에서는 Alert API 사용
  }
};

// 상태 표시줄 호환성
export const StatusBar = {
  setBarStyle: (style: 'default' | 'light-content' | 'dark-content') => {
    if (Platform.isWeb) {
      // 웹에서는 meta tag 조작
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', style === 'dark-content' ? '#ffffff' : '#000000');
      }
    }
    // React Native에서는 StatusBar API 사용
  },
  
  setBackgroundColor: (color: string, animated: boolean = false) => {
    if (Platform.isWeb) {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color);
      }
    }
    // React Native에서는 StatusBar API 사용 (Android만)
  }
};

// 키보드 호환성
export const Keyboard = {
  dismiss: () => {
    if (Platform.isWeb) {
      // 웹에서는 포커스된 요소에서 blur
      const activeElement = document.activeElement as HTMLElement;
      activeElement?.blur?.();
    }
    // React Native에서는 Keyboard API 사용
  },
  
  addListener: (eventName: string, listener: (event: any) => void) => {
    if (Platform.isWeb) {
      // 웹에서는 resize 이벤트로 키보드 감지
      if (eventName === 'keyboardDidShow' || eventName === 'keyboardDidHide') {
        const handler = () => {
          // 간단한 키보드 감지 로직
          const viewportHeight = window.visualViewport?.height || window.innerHeight;
          const isKeyboardVisible = viewportHeight < window.innerHeight * 0.75;
          
          if (eventName === 'keyboardDidShow' && isKeyboardVisible) {
            listener({ endCoordinates: { height: window.innerHeight - viewportHeight } });
          } else if (eventName === 'keyboardDidHide' && !isKeyboardVisible) {
            listener({});
          }
        };
        
        window.visualViewport?.addEventListener('resize', handler);
        window.addEventListener('resize', handler);
        
        return {
          remove: () => {
            window.visualViewport?.removeEventListener('resize', handler);
            window.removeEventListener('resize', handler);
          }
        };
      }
    }
    
    return { remove: () => {} };
  }
};

// 링킹 호환성
export const Linking = {
  openURL: async (url: string): Promise<boolean> => {
    if (Platform.isWeb) {
      window.open(url, '_blank');
      return true;
    }
    // React Native에서는 Linking API 사용
    return false;
  },
  
  canOpenURL: async (url: string): Promise<boolean> => {
    if (Platform.isWeb) {
      // 웹에서는 대부분의 URL을 열 수 있음
      return true;
    }
    // React Native에서는 Linking API 사용
    return false;
  }
};

export default {
  Platform,
  Dimensions,
  StyleSheet,
  Storage,
  NetInfo,
  Clipboard,
  Alert,
  StatusBar,
  Keyboard,
  Linking,
};