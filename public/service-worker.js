const CACHE_NAME = 'service-worker-cache';
const toCache = [
  '/',
  '/css/socialbar.css',
  '/css/main.css',
  '/js/pwa.js',
  '/js/status.js',
  '/favicon.ico',
  '/pwa.webmanifest',
  '/img/splash-screen.png'
];


self.addEventListener('install', function(event) {
    console.log('used to register the service worker')
    event.waitUntil(
        caches.open(CACHE_NAME)
          .then(function(cache) {
            return cache.addAll(toCache)
          })
          .then(self.skipWaiting())
      )
  })
  
  self.addEventListener('fetch', function(event) {
    console.log('used to intercept requests so we can check for the file or data in the cache')
    event.respondWith(
        fetch(event.request)
          .catch(async () => {
            const cache = await caches.open(CACHE_NAME);
            return cache.match(event.request);
          })
      )
  })
  
  self.addEventListener('activate', function(event) {
    console.log('this event triggers when the service worker activates')
    event.waitUntil(
        caches.keys()
          .then((keyList) => {
            return Promise.all(keyList.map((key) => {
              if (key !== CACHE_NAME) {
                console.log('[ServiceWorker] Removing old cache', key)
                return caches.delete(key)
              }
            }))
          })
          .then(() => self.clients.claim())
      )
  })