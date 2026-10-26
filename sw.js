const CACHE_NAME = 'mapa-embarque-v1';
const urlsToCache = [
  './index.html',
  'https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Instala o Service Worker e guarda os ficheiros em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberta com sucesso');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepa os pedidos de rede para servir os ficheiros offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o ficheiro do cache se existir, senão vai à internet buscar
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Atualiza o cache quando houver uma nova versão
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('A apagar cache antiga:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

