const CACHE = 'hensai-v2363-remainder-date-fit-1';
const ASSETS = [
  './', './index.html', './manifest.json', './v2362-ui.css', './v2362-ui.js',
  './icon-180-v2362-circle.png',
  './icon-192-v2362-circle.png', './icon-512-v2362-circle.png',
  './icon-1024-v2362-circle.png',
  './icon-192-maskable-v2362-circle.png', './icon-512-maskable-v2362-circle.png',
  './icon-1024-maskable-v2362-circle.png',
  './proposal_logo_light_transparent.png'
];

function injectEnhancements(html){
  if(html.includes('v2362-ui.js')) return html;
  const css = '<link rel="stylesheet" href="./v2362-ui.css">';
  const js = '<script src="./v2362-ui.js"><\/script>';
  let out = html.replace('</head>', `${css}</head>`);
  out = out.replace('</body>', `${js}</body>`);
  return out;
}

async function cachedOrNetwork(request){
  try {
    const response = await fetch(request, {cache:'no-store'});
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone()).catch(()=>{});
    return response;
  } catch (_) {
    return (await caches.match(request)) || Response.error();
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
  const isDocument = event.request.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);
  if(url.origin === self.location.origin && isDocument){
    event.respondWith((async () => {
      const response = await cachedOrNetwork(event.request);
      const html = await response.text();
      return new Response(injectEnhancements(html), {
        status: response.status,
        statusText: response.statusText,
        headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}
      });
    })());
    return;
  }
  event.respondWith(cachedOrNetwork(event.request));
});
