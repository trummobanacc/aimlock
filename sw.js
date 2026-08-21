const CACHE_NAME = "hung-aim-v1";

const APP_SHELL = [
  "./",
  "./user_final.html",
  "./manifest.json",
  "./1787304901999.png"
];

/* =========================
   INSTALL
========================= */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", event => {

  const request = event.request;

  // Không can thiệp request Firebase/API bên ngoài
  if (new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {

      // Có cache thì dùng cache
      if (cachedResponse) {
        return cachedResponse;
      }

      // Không có cache thì tải từ mạng
      return fetch(request).then(response => {

        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      });

    })
  );

});