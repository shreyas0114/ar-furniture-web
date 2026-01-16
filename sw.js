const CACHE = 'ar-furniture-v1';
const ASSETS = [
  '/', '/index.html', '/style.css', '/script.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/snapshots/')) return; // don't cache gallery
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
