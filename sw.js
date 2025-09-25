const CACHE_NAME = 'zizi-pwa-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event — کش اولیه
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event — مدیریت درخواست‌ها
self.addEventListener('fetch', event => {
  // فقط برای index.html — همیشه از سرور بگیر
  if (event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // پاسخ رو کلون می‌کنیم تا هم برای کاربر، هم برای کش استفاده بشه
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // اگر اینترنت نبود، از کش استفاده کن
          return caches.match(event.request);
        })
    );
  } else {
    // برای بقیه فایل‌ها — اول از کش، بعد از سرور
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});

// Activate event — پاک کردن کش قدیمی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});