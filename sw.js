// 返済試算: Service Worker cleanup version
// 古い hensai-v1 キャッシュや壊れたPWAキャッシュを削除して、以後はネットワークから直接読み込みます。

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister())
  );
});

// fetchは横取りしません。GitHub Pagesから通常通り読み込みます。
