const CACHE_NAME = 'qr-pro-v1';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  'https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
