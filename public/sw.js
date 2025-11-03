// public/sw.js
const CACHE_NAME = 'dr-hub-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other critical assets here
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// PWA Push Notification Listener (يتطلب خادمًا خلفيًا)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.title || 'إشعار جديد';
  const options = {
    body: data.body || 'لديك تحديث جديد في نظام المواعيد.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
