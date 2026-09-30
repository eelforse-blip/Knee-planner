const VERSION='clinic-v1.0.0';
const FILES=['./','./index.html','./app.js','./config.js','./lib.bundle.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png',
'./fonts/archivo-latin-400-normal.woff2','./fonts/archivo-latin-500-normal.woff2','./fonts/archivo-latin-600-normal.woff2','./fonts/archivo-latin-700-normal.woff2','./fonts/ibm-plex-mono-latin-500-normal.woff2','./fonts/ibm-plex-mono-latin-600-normal.woff2','./fonts/cairo-arabic-400-normal.woff2','./fonts/cairo-arabic-600-normal.woff2','./fonts/cairo-arabic-700-normal.woff2'];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(h=>h||caches.match('./index.html'))))});
