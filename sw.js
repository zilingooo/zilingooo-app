const CACHE_NAME = 'zilingooo-pwa-v1';
const urlsToCache = [
  '/zilingooo-app/',
  '/zilingooo-app/manifest.json',
  '/zilingooo-app/icon-192.png',
  '/zilingooo-app/icon-512.png'
];

// Install event — کش اولیه
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.warn('Cache install failed:', err))
  );
});

// Fetch event — مدیریت درخواست‌ها
self.addEventListener('fetch', (event) => {
  // فقط درخواست‌های همان origin را مدیریت کن
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // برای صفحه اصلی و فایل‌های HTML: اول از سرور، بعد از کش
  if (event.request.destination === 'document' || event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // پاسخ را کلون کن تا هم برای کاربر، هم برای کش استفاده شود
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // اگر آفلاین بود، از کش استفاده کن
          return caches.match(event.request).then((response) => {
            return response || caches.match('/zilingooo-app/');
          });
        })
    );
  } else {
    // برای سایر فایل‌ها (CSS, JS, تصاویر): اول از کش، بعد از سرور
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// Activate event — پاک کردن کش‌های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});