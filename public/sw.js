// Service Worker for Sangu's Tippers - Offline Support & Push Notifications

const CACHE_NAME = 'sangus-tippers-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Install Event - Cache Core Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - Network First with Cache Fallback for 100% Offline Access
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match('/');
        });
      })
  );
});

// 4. Push Notification Event Listener (Native Phone / Laptop Notifications)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: "Sangu's Tippers Notification", body: "New fleet alert!" };
  
  const options = {
    body: data.body || "Operational update from Sangu's Tippers",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: '1' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Sangu's Tippers Alert", options)
  );
});
