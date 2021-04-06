// Caching files
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/styles.css',
    '/index.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
  ];


  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";
  
// install service-worker and skipWaiting to set as active
  self.addEventListener("install", function(event) {
      event.waitUntil(
          caches.open(CACHE_NAME).then(cache => {
              return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  
  // Turn on Service Worker
  self.addEventListener("activate", function(event) {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  
  // fetch Cashed
  self.addEventListener("fetch", function(event) {
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                  console.log(response)
                cache.put(event.request.url, response.clone());
              }
              console.log(response);
              return response;
            })
            .catch(error => {
              return cache.match(event.request);
            });
        }).catch(error => console.log(error))
      );
      return;
    }
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
  });