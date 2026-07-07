/* 离线缓存 service worker —— 让整站可在无网络环境下完整使用 */
const CACHE = 'wuban-english-v4';
const ASSETS = ['./','./index.html','./style.css','./icons.js','./app.js','./engine.js',
  './data.core.js','./data.units.js','./data.content.js','./data.scenarios.js',
  './icon.svg','./manifest.webmanifest'];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=> Promise.all(ASSETS.map(u=>c.add(u).catch(()=>{}))))
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message', e=>{
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET') return;

  /* 页面导航：优先联网取最新版本，离线时回退到缓存的 index.html，
     保证任何时候打开App都能进入首页而不是白屏/浏览器错误页 */
  if(req.mode==='navigate'){
    e.respondWith(
      fetch(req).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});
        return resp;
      }).catch(()=> caches.match('./index.html').then(r=>r || caches.match('./')))
    );
    return;
  }

  /* 静态资源（js/css/图标等）：缓存优先，秒开且离线可用；
     同时后台悄悄联网刷新缓存，下次打开自动用上最新内容 */
  e.respondWith(
    caches.match(req).then(cached=>{
      const network = fetch(req).then(resp=>{
        if(resp && resp.ok){
          const copy=resp.clone();
          caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
        }
        return resp;
      }).catch(()=>cached);
      return cached || network;
    })
  );
});
