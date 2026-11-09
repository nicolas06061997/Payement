// Service worker de Payement : l'appli marche sans connexion et se met à jour toute seule.
// La version vient de index.html (APPV), passée dans l'adresse : sw.js?v=…
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE = 'pay-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('pay-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Réseau d'abord pour avoir la dernière version ; copie locale si pas de connexion.
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('/version.json')) return;
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r =>
    r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
