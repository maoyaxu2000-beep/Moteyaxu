/* 离线缓存 service worker —— 让整站可在无网络环境下完整使用
   学习内容（data.enc）和语音（audio/*.bin）都是密文，缓存的也是密文，由页面用邀请码解开的密钥解密 */
const CACHE = 'wuban-english-v29';
/* 语音单独一个缓存，版本升级时不清空，省流量。
   v2：改为加密音频；地址带 ?k=密钥编号，管理员更换主密钥后自动换成新文件 */
const AUDIO_CACHE = 'wuban-audio-v2';
const ASSETS = ['./','./index.html','./style.css','./icons.js','./lock.js','./app.js','./features.js','./engine.js','./drills.js',
  './audio/gb.js','./audio/us.js','./audio/gb2.js','./audio/us2.js',
  './icon.svg','./manifest.webmanifest'];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(
    /* cache:'reload' 绕过浏览器 HTTP 缓存：GitHub Pages 允许文件缓存 10 分钟，
       不加的话新版本 SW 会把旧版 app.js 当新版存进去，学员要开好几次才更新 */
    caches.open(CACHE).then(c=> Promise.all(ASSETS.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{}))))
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE && k!==AUDIO_CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message', e=>{
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET') return;
  const url = new URL(req.url);
  if(url.origin!==location.origin) return;

  /* 加密语音：缓存优先（文件名是文本哈希、带密钥编号，内容不会变） */
  if(/\/audio\/[a-z0-9]+\/[0-9a-f]{8}\.bin$/.test(url.pathname)){
    e.respondWith(caches.open(AUDIO_CACHE).then(async c=>{
      const hit = await c.match(req);
      if(hit) return hit;
      const net = await fetch(req);
      if(net.ok) c.put(req, net.clone()).catch(()=>{});
      return net;
    }));
    return;
  }

  /* 邀请码钥匙表：联网优先——管理员作废某个码后要尽快生效；
     但最多等 4 秒，超时或离线就用缓存，不再让页面干等 */
  if(/\/keys\.json$/.test(url.pathname)){
    e.respondWith(
      Promise.race([
        fetch(req,{cache:'no-cache'}),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),4000))
      ]).then(resp=>{
        if(resp.ok){ const copy=resp.clone(); caches.open(CACHE).then(c=>c.put('./keys.json',copy)).catch(()=>{}); }
        return resp;
      }).catch(()=> caches.match('./keys.json').then(r=>r||Response.error()))
    );
    return;
  }

  /* 页面导航：缓存优先（秒开），同时后台取最新版本，下次打开生效；没有缓存才等网络 */
  if(req.mode==='navigate'){
    e.respondWith(caches.match('./index.html').then(cached=>{
      const net = fetch(req).then(resp=>{
        if(resp && resp.ok){ const copy=resp.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{}); }
        return resp;
      }).catch(()=>null);
      if(cached){ e.waitUntil(net); return cached; }
      return net.then(r=> r || caches.match('./') .then(x=>x||Response.error()));
    }));
    return;
  }

  /* 其他静态资源（js/css/图标/data.enc）：缓存优先，秒开且离线可用；
     同时后台联网刷新缓存，下次打开自动用上最新内容 */
  e.respondWith(
    caches.match(req).then(cached=>{
      /* 有缓存时把后台刷新推迟 2.5 秒，让出带宽给首屏；没有缓存就立刻取 */
      const network = new Promise(r=>setTimeout(r, cached?2500:0)).then(()=>fetch(req,{cache:'no-cache'})).then(resp=>{
        if(resp && resp.ok){
          const copy=resp.clone();
          caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
        }
        return resp;
      }).catch(()=>cached);
      if(cached){ e.waitUntil(network); return cached; }
      return network;
    })
  );
});
