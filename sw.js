// Service worker do Mapa de embarque. Troque o número da versão a cada atualização do index.html.
const V = 'mapa-v8';
const CORE = ['./', './index.html', './manifest.json'];
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&display=swap'
];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(CORE).catch(() => {});
    await Promise.all(CDN.map(u => c.add(new Request(u, { mode: 'no-cors' })).catch(() => {})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate' || u.origin === location.origin) {
    // arquivos do app: tenta a rede (pega a versão nova) e cai para o cache sem sinal
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
    return;
  }
  // jsPDF e fontes: cache primeiro, guarda na primeira vez que carregar
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
});
