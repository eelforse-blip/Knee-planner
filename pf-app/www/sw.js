const VERSION='pf-v1.2.0';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png',
'./fonts/archivo-latin-400-normal.woff2','./fonts/archivo-latin-500-normal.woff2','./fonts/archivo-latin-600-normal.woff2','./fonts/archivo-latin-700-normal.woff2',
'./fonts/ibm-plex-mono-latin-400-normal.woff2','./fonts/ibm-plex-mono-latin-500-normal.woff2','./fonts/ibm-plex-mono-latin-600-normal.woff2'];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));return}
 e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request)))});
