// NOTE:
// The previous SW implementation was caching `/` and even `/src/*` files.
// In Vite production builds assets are fingerprinted (e.g. /assets/index-xxxx.js).
// Cache-first on `/` easily leads to a blank screen after deploy: cached HTML points
// to missing/new assets. This SW is intentionally conservative.

const CACHE_NAME = 'fion-cinema-static-v2';

self.addEventListener('install', (event) => {
  // Activate new SW ASAP so it can clean old caches.
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // Always prefer network for HTML navigations to avoid serving stale index.html.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(fetch(request));
    return;
  }

  // Cache immutable Vite assets (fingerprinted) and static files.
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font';

  if (!isStaticAsset) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      // Cache successful responses only.
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })()
  );
});