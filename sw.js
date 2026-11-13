const CACHE='name-tag-maker-v4';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  const isLib=/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if(isLib){ // libraries: cache first, so the app works offline
    e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(req); if(hit) return hit; const res=await fetch(req); if(res.ok||res.type==='opaque') c.put(req,res.clone()); return res;}));
  } else if(url.origin===location.origin){ // app files: network first, fall back to cache when offline
    e.respondWith(fetch(req).then(res=>{const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  }
});
