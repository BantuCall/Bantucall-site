const CACHE_NAME = 'famille-joseph-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/Style.css',
  '/Script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Inter:wght@400;500;600&display=swap'
];

// Installation — mise en cache des fichiers
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation — suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — répondre depuis le cache si hors ligne
self.addEventListener('fetch', e => {
  // Ne pas intercepter Firebase et les appels WebRTC
  if (e.request.url.includes('firebasedatabase') ||
      e.request.url.includes('firebaseio') ||
      e.request.url.includes('gstatic.com/firebasejs')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => caches.match('/index.html'));
    })
  );
});

// Notifications push
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || '✝ Famille Joseph';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: 'file_00000000a4e871f4888734734ed2f542.png',
    badge: 'file_00000000a4e871f4888734734ed2f542.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'join', title: '🎙️ Rejoindre' },
      { action: 'dismiss', title: 'Plus tard' }
    ]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur notification
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'join' || !e.action) {
    e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
  }
});