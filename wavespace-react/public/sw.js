// Service Worker for WAVE space
// 오프라인 지원 및 캐싱 전략 구현

const CACHE_NAME = 'wavespace-v1.0.0';
const OFFLINE_URL = '/offline.html';
const FALLBACK_IMAGE = '/images/fallback.svg';

// 캐싱할 정적 리소스
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/images/logo.png',
  '/images/fallback.svg'
];

// API 캐싱 전략
const API_CACHE_STRATEGIES = {
  // 중요한 사용자 데이터 - Network First
  networkFirst: [
    '/api/auth/',
    '/api/profile/',
    '/api/notifications/'
  ],
  
  // 자주 변하지 않는 데이터 - Cache First
  cacheFirst: [
    '/api/points/policy',
    '/api/categories',
    '/api/settings'
  ],
  
  // 실시간성이 중요한 데이터 - Network Only
  networkOnly: [
    '/api/posts/create',
    '/api/posts/update',
    '/api/posts/delete',
    '/api/comments/create'
  ]
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // 새 버전으로 즉시 활성화
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache assets:', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    Promise.all([
      // 이전 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 모든 탭에서 새 서비스 워커 사용
      self.clients.claim()
    ])
  );
});

// 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // HTML 페이지 요청 처리
  if (request.mode === 'navigate' || 
      (request.method === 'GET' && request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      networkFirstStrategy(request)
        .catch(() => {
          // 오프라인일 때 캐시된 페이지 또는 오프라인 페이지 반환
          return caches.match('/') || caches.match(OFFLINE_URL);
        })
    );
    return;
  }
  
  // API 요청 처리
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 이미지 요청 처리
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // 기타 정적 자원 - Cache First
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // 백그라운드에서 업데이트
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, networkResponse.clone()));
                }
              })
              .catch(() => {
                // 네트워크 오류는 무시
              });
            
            return response;
          }
          
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone));
              }
              return networkResponse;
            });
        })
    );
  }
});

// Network First 전략
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache:', request.url);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache First 전략
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // 백그라운드에서 업데이트
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
      })
      .catch(() => {
        // 네트워크 오류 무시
      });
    
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    await cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// API 요청 처리
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Network Only 전략
  if (API_CACHE_STRATEGIES.networkOnly.some(pattern => path.includes(pattern))) {
    return fetch(request);
  }
  
  // Network First 전략
  if (API_CACHE_STRATEGIES.networkFirst.some(pattern => path.includes(pattern))) {
    return networkFirstStrategy(request);
  }
  
  // Cache First 전략
  if (API_CACHE_STRATEGIES.cacheFirst.some(pattern => path.includes(pattern))) {
    return cacheFirstStrategy(request);
  }
  
  // 기본값: Network First
  return networkFirstStrategy(request);
}

// 이미지 요청 처리
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // 캐시에서 먼저 확인
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 네트워크에서 가져오기
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 성공한 이미지만 캐싱 (용량 제한 고려)
      const contentLength = networkResponse.headers.get('content-length');
      const imageSize = contentLength ? parseInt(contentLength) : 0;
      
      // 5MB 이하 이미지만 캐싱
      if (imageSize < 5 * 1024 * 1024) {
        await cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('🖼️ Image request failed:', request.url);
    
    // 폴백 이미지 반환
    const fallbackResponse = await cache.match(FALLBACK_IMAGE);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    
    // 최종 폴백: 작은 SVG 이미지 생성
    const fallbackSvg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="sans-serif" font-size="14" fill="#6b7280">
          이미지를 불러올 수 없습니다
        </text>
      </svg>
    `;
    
    return new Response(fallbackSvg, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  // 오프라인 중 저장된 작업들을 서버에 동기화
  try {
    const cache = await caches.open(CACHE_NAME);
    const offlineActions = await cache.match('/offline-actions');
    
    if (offlineActions) {
      const actions = await offlineActions.json();
      
      for (const action of actions) {
        try {
          await fetch(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body
          });
          
          console.log('✅ Synced offline action:', action.type);
        } catch (error) {
          console.error('❌ Failed to sync action:', action.type, error);
        }
      }
      
      // 동기화 완료 후 오프라인 액션 삭제
      await cache.delete('/offline-actions');
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'WAVE space';
  const options = {
    body: data.body || '새로운 알림이 있습니다',
    icon: '/images/logo.png',
    badge: '/images/badge.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열린 탭이 있는지 확인
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 새 탭 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// 메시지 처리 (클라이언트와 통신)
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ cacheSize: size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'STORE_OFFLINE_ACTION':
      storeOfflineAction(data);
      break;
  }
});

// 캐시 크기 계산
async function getCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  let totalSize = 0;
  
  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        totalSize += parseInt(contentLength);
      }
    }
  }
  
  return totalSize;
}

// 캐시 정리
async function clearCache() {
  const cacheNames = await caches.keys();
  
  await Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName !== CACHE_NAME) {
        return caches.delete(cacheName);
      }
    })
  );
  
  console.log('🧹 Cache cleared');
}

// 오프라인 액션 저장
async function storeOfflineAction(action) {
  const cache = await caches.open(CACHE_NAME);
  
  let actions = [];
  const existingActions = await cache.match('/offline-actions');
  
  if (existingActions) {
    actions = await existingActions.json();
  }
  
  actions.push({
    ...action,
    timestamp: Date.now()
  });
  
  const response = new Response(JSON.stringify(actions), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  await cache.put('/offline-actions', response);
  
  console.log('💾 Offline action stored:', action.type);
}

console.log('🚀 Service Worker loaded successfully');