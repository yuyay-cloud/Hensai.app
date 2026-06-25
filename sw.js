const CACHE = 'hensai-v2361-pwa-c1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-180-v2361.png',
  './icon-192-v2361.png',
  './icon-192-maskable-v2361.png',
  './icon-512-v2361.png',
  './icon-512-maskable-v2361.png',
  './proposal_logo_light_transparent.png'
];

async function networkFirst(request){
  try {
    const response = await fetch(request, {cache:'no-store'});
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch (_) {
    return (await caches.match(request)) || (await caches.match('./index.html')) || Response.error();
  }
}

async function cacheFirst(request){
  const cached = await caches.match(request);
  if(cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch (_) {
    return Response.error();
  }
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;
  const isDocument = event.request.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);
  event.respondWith(isDocument ? networkFirst(event.request) : cacheFirst(event.request));
});
