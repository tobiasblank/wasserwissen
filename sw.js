/* Nur bekannte Anwendungsdateien; niemals Tokens oder Lernstände cachen. */
const CACHE='wasserwissen-pwa-v6';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./icons/apple-touch-icon.png?v=book-1'];
const ASSETS=new Set(FILES.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('wasserwissen-pwa-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||!ASSETS.has(req.url))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(new Request(req,{cache:'no-cache'}));
      if(response.ok){
        // Await cache writes so the worker cannot terminate before completion.
        try{await cache.put(req,response.clone())}catch(error){/* Storage full: still return network response. */}
        return response;
      }
      const cached=await cache.match(req);
      return cached||response;
    }catch(error){
      return await cache.match(req)||(req.mode==='navigate'?await cache.match(new URL('./index.html',self.registration.scope).href):null)||Response.error();
    }
  })());
});
