const CACHE_VERSION = 'catholic-way-WebView-Clean-128';
const APP_SHELL = [
  './',
  './index.html',
  './constants.js?v=WebView-Clean-128',
  './core.js?v=WebView-Clean-128',
  './style.css?v=WebView-Clean-128',
  './app.js?v=WebView-Clean-128',
  './diocese-meta.js?v=WebView-Clean-128',
  './diocese-search.js?v=WebView-Clean-128',
  './diocese-data.js?v=WebView-Clean-128',
  './diocese-ui.js?v=WebView-Clean-128',
  './web.js?v=WebView-Clean-128',
  './patches.js?v=WebView-Clean-128',
  './sw-update.js?v=WebView-Clean-128',
  './manifest.json?v=WebView-Clean-128',
  './intro-cross-jesus.jpg?v=WebView-Clean-128',
  './icon-192x192.png',
  './icon-512x512.png',
  './icon-512x512-maskable.png',
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => key === CACHE_VERSION ? null : caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function sameOrigin(request) {
  try { return new URL(request.url).origin === self.location.origin; } catch (e) { return false; }
}
function isHtmlRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}
function isVersionedAsset(request) {
  try {
    const url = new URL(request.url);
    return url.searchParams.has('v') ||
      /parishes(?:-[a-z-]+)?\.js|prayer\.js|retreats\.js|shrines\.js|diocese\.html|qa-firebase\.html|app\.js|style\.css|web\.js|patches\.js|sw-update\.js/.test(url.pathname);
  } catch (e) { return false; }
}
async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const fresh = await fetch(request, { cache: 'no-cache' });
    if (fresh && fresh.ok) cache.put(request, fresh.clone()).catch(() => null);
    return fresh;
  } catch (e) {
    const cached = await cache.match(request);
    return cached || cache.match('./index.html');
  }
}
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone()).catch(() => null);
    return fresh;
  } catch (e) {
    return new Response('Offline', { status: 503 });
  }
}
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const freshPromise = fetch(request)
    .then((fresh) => {
      if (fresh && fresh.ok) cache.put(request, fresh.clone()).catch(() => null);
      return fresh;
    })
    .catch(() => null);
  return cached || freshPromise || fetch(request);
}
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (!sameOrigin(request)) return;
  if (isHtmlRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (isVersionedAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});
