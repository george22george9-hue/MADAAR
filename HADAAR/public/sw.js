// ====================================================================
// HADAR SaaS Platform — PWA Service Worker (v1.0.0)
// Developed by MADAAR Technologies
// Caching Strategy: Stale-While-Revalidate for UI assets + Network-First for Data
// ====================================================================

const CACHE_NAME = 'hadar-pwa-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/offline'
];

// 1. Install Event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[HADAR SW] Pre-caching partial warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET requests or external APIs (e.g. Supabase, WhatsApp)
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Network-First for HTML navigation, with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response(
            `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>حَضَر — وضع عدم الاتصال</title><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{font-family:system-ui,sans-serif;background:#111D2D;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px}h1{color:#C7A66A}p{color:#94a3b8;font-size:14px}button{background:#C7A66A;color:#111D2D;border:none;padding:12px 24px;border-radius:12px;font-weight:bold;cursor:pointer;margin-top:16px}</style></head><body><div><h1>منظومة حَضَر الذكية</h1><p>أنت حالياً في وضع عدم الاتصال بالإنترنت.</p><p>يمكنك استخدام الماسح الذكي المسجل مسبقاً.</p><button onclick="window.location.reload()">إعادة المحاولة 🔄</button></div></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Stale-While-Revalidate for images, fonts, icons, scripts
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
