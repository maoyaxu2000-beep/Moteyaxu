/* 离线缓存 service worker */
const CACHE = 'wuban-english-v2';
const ASSETS = ['./','./index.html','./style.css','./icons.js','./app.js','./engine.js',
  './data.core.js','./data.units.js','./data.content.js','./data.scenarios.js',
  './icon.svg','./manifest.webmanifest'];
self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      const copy=resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});
