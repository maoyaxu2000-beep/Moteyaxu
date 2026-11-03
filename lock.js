/* ===========================================================
   五班英语角 · 进入限制（内部学习平台）
   公开仓库里只有密文：data.enc（全部学习内容）、audio/*.bin（全部语音）。
   输入邀请码 → PBKDF2 推出钥匙 → 解开主密钥 → 解密内容 → 才加载 App。
   邀请码只在本机保存，之后打开自动进入，离线也能用；
   管理员作废某个码或更换主密钥后，下次联网打开会要求重新输入。
=========================================================== */
'use strict';
(function(){
  const STORE = 'wbAccess';
  const APP_SCRIPTS = ['app.js', 'engine.js', 'drills.js'];
  const te = new TextEncoder(), td = new TextDecoder();
  const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const b64e = u => btoa(String.fromCharCode(...new Uint8Array(u)));
  const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const hex8 = async raw => [...new Uint8Array(await crypto.subtle.digest('SHA-256', raw))].slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('');

  /* 个人码有效期：从这台设备首次进入开始计时，记录单独保存（退出登录不会重置） */
  const ACT = 'wbActivated', DAY = 86400000;
  function actTime(code){ try{ return (JSON.parse(localStorage.getItem(ACT) || '{}'))[normCode(code)] || 0; }catch(e){ return 0; } }
  function markAct(code){ try{ const m = JSON.parse(localStorage.getItem(ACT) || '{}'); const k = normCode(code); if(!m[k]){ m[k] = Date.now(); localStorage.setItem(ACT, JSON.stringify(m)); } }catch(e){} }
  function expiresAt(code, ttl){ return ttl ? actTime(code) + ttl * DAY : 0; }
  function isExpired(code, ttl){ const e = expiresAt(code, ttl); return !!(ttl && actTime(code) && Date.now() > e); }
  const EXPIRED_MSG = ttl => `此邀请码已过期（激活后 ${ttl} 天有效），请联系管理员获取新的邀请码`;

  function readStore(){ try{ return JSON.parse(localStorage.getItem(STORE) || 'null'); }catch(e){ return null; } }
  function writeStore(v){ try{ localStorage.setItem(STORE, JSON.stringify(v)); }catch(e){} }

  async function aesDecrypt(key, buf){
    const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return crypto.subtle.decrypt({ name:'AES-GCM', iv:u.slice(0, 12) }, key, u.slice(12));
  }
  /* 用邀请码解开主密钥；码不对时 AES-GCM 校验失败 → 返回 null */
  async function unwrap(keys, code){
    const n = normCode(code);
    const entry = (keys.entries || []).find(e => e.id === n.slice(0, 4));
    if(!entry || n.length !== 16) return null;
    const base = await crypto.subtle.importKey('raw', te.encode(n), 'PBKDF2', false, ['deriveKey']);
    const kek = await crypto.subtle.deriveKey({ name:'PBKDF2', salt:b64d(entry.salt), iterations:keys.iter, hash:'SHA-256' },
      base, { name:'AES-GCM', length:256 }, false, ['decrypt']);
    try{
      const raw = await aesDecrypt(kek, b64d(entry.wk));
      if(await hex8(raw) !== keys.kid) return null;
      return { raw:new Uint8Array(raw), ttl:entry.ttl || 0 };
    }catch(e){ return null; }
  }

  /* 联网取钥匙表：带超时，网络差时不会一直卡住（超时按「离线」处理） */
  async function fetchKeys(ms){
    const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 8000);
    try{
      const r = await fetch('keys.json', { cache:'no-cache', signal:c.signal });
      return r.ok ? await r.json() : null;
    }catch(e){ return null; }   // 离线 / 超时
    finally{ clearTimeout(t); }
  }

  /* 进入页后台取钥匙表和点「进入」时共用同一个请求：两个相同请求会被浏览器排队，等两轮 */
  let keysPromise = null;
  function getKeys(){
    if(!keysPromise) keysPromise = fetchKeys().then(k => { if(!k) keysPromise = null; return k; });
    return keysPromise;
  }

  /* ---------- 提速：脚本与密文并行预取，不再一个接一个串行下载 ---------- */
  const saved0 = readStore();
  APP_SCRIPTS.forEach(s => { const l = document.createElement('link'); l.rel = 'preload'; l.as = 'script'; l.href = s; document.head.appendChild(l); });
  const earlyData = (saved0 && saved0.kid) ? fetch('data.enc?k=' + saved0.kid).catch(() => null) : null;
  let blocked = false;   // 后台校验发现码被停用/过期后，禁止再撤掉进入页

  /* ---------- 启动 ----------
     旧流程：先联网取 keys.json → 校验 → 才开始加载内容，网络慢时要干等。
     现在：本机已有有效密钥就立刻进入，联网校验放到后台，结果回来再处理（停用/换密钥）。 */
  async function boot(){
    if(!(window.crypto && crypto.subtle)){ showGate('当前浏览器不支持加密功能，请用手机自带浏览器或微信打开最新版本'); return; }
    const saved = readStore();
    if(!saved){ showGate(''); getKeys().then(k => { if(k) gateKeys = k; }); return; }   // 先显示输入页，钥匙表后台取
    const ttl = saved.ttl || 0;
    if(isExpired(saved.code, ttl)){
      localStorage.removeItem(STORE);
      showGate(EXPIRED_MSG(ttl)); return;
    }
    start(b64d(saved.k), saved.kid, saved.code, ttl);
    verifyInBackground(saved);
  }

  async function verifyInBackground(saved){
    const keys = await fetchKeys(10000);
    if(!keys) return;                                   // 离线 / 超时：继续用本机已保存的密钥
    const entry = (keys.entries || []).find(e => e.id === normCode(saved.code).slice(0, 4));
    if(!entry){ blocked = true; localStorage.removeItem(STORE); showGate('你的邀请码已停用，请向管理员索取新的邀请码', keys); return; }
    const ttl = entry.ttl || 0;
    if(isExpired(saved.code, ttl)){ blocked = true; localStorage.removeItem(STORE); showGate(EXPIRED_MSG(ttl), keys); return; }
    if(keys.kid === saved.kid){
      if(saved.ttl !== ttl) writeStore(Object.assign({}, saved, { ttl }));
      if(window.ACCESS){ window.ACCESS.ttl = ttl; window.ACCESS.expiresAt = expiresAt(saved.code, ttl); }
      return;
    }
    const got = await unwrap(keys, saved.code);          // 主密钥已更换：用保存的码重新解，然后重载拿新内容
    if(!got){ blocked = true; localStorage.removeItem(STORE); showGate('邀请码需要重新验证，请重新输入', keys); return; }
    writeStore({ code:saved.code, kid:keys.kid, k:b64e(got.raw), ttl:got.ttl });
    location.reload();
  }

  async function start(raw, kid, code, ttl){
    showLoading();
    try{
      const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
      window.ACCESS = { key, kid, decrypt:(buf) => aesDecrypt(key, buf),
                        ttl:ttl || 0, expiresAt:expiresAt(code, ttl), codeId:normCode(code).slice(0, 4) };
      let r = (earlyData && saved0 && saved0.kid === kid) ? await earlyData : null;   // 复用启动时就发出的请求
      if(!r || !r.ok) r = await fetch('data.enc?k=' + kid);
      if(!r.ok) throw new Error('data');
      const text = td.decode(await aesDecrypt(key, await r.arrayBuffer()));
      new Function(text)();                                          // 定义 window.DATA
      for(const s of APP_SCRIPTS) await loadScript(s);
      if(!blocked) hideGate();
      addWatermark();
    }catch(e){
      if(blocked) return;
      showGate(navigator.onLine ? '内容加载失败，请重新输入邀请码或稍后再试' : '首次使用需要联网，请连接网络后再打开', null, true);
    }
  }
  function loadScript(src){
    return new Promise((ok, bad) => {
      const s = document.createElement('script');
      s.src = src; s.async = false; s.onload = ok; s.onerror = bad;
      document.body.appendChild(s);
    });
  }

  /* ---------- 进入页 ---------- */
  let gateKeys = null;
  function gateEl(){
    let g = document.getElementById('gate');
    if(!g){ g = document.createElement('div'); g.id = 'gate'; document.body.appendChild(g); }
    return g;
  }
  function showGate(msg, keys, retry){
    if(keys) gateKeys = keys;
    const g = gateEl();
    g.innerHTML = `<div class="gate-card">
      <img class="gate-logo" src="icon.svg" alt="">
      <div class="gate-title">五班英语角</div>
      <div class="gate-sub">空保执勤英语 · 内部学习平台</div>
      <input id="gateCode" class="gate-input" placeholder="请输入邀请码" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24">
      <div class="gate-msg" id="gateMsg">${msg || ''}</div>
      <button class="gate-btn" id="gateBtn">${retry ? '重新进入' : '进入'}</button>
      <div class="gate-foot">邀请码请向单位管理员索取 · 仅限内部学习使用</div>
    </div>`;
    const inp = document.getElementById('gateCode');
    inp.addEventListener('input', () => {                       // 自动补横杠：WBRL-XC2K-…
      const n = normCode(inp.value).slice(0, 16);
      inp.value = n.match(/.{1,4}/g)?.join('-') || '';
    });
    inp.addEventListener('keydown', e => { if(e.key === 'Enter') submit(); });
    document.getElementById('gateBtn').onclick = retry ? () => location.reload() : submit;
  }
  async function submit(){
    const btn = document.getElementById('gateBtn'), msg = document.getElementById('gateMsg');
    const code = document.getElementById('gateCode').value;
    if(normCode(code).length !== 16){ msg.textContent = '邀请码是 16 位字母数字，请检查'; return; }
    btn.disabled = true; btn.textContent = '验证中…'; msg.textContent = '';
    const keys = gateKeys || await getKeys();
    if(!keys){ btn.disabled = false; btn.textContent = '进入'; msg.textContent = '首次验证需要联网'; return; }
    gateKeys = keys;
    const got = await unwrap(keys, code);
    if(!got){ btn.disabled = false; btn.textContent = '进入'; msg.textContent = '邀请码不正确或已停用'; return; }
    if(isExpired(code, got.ttl)){ btn.disabled = false; btn.textContent = '进入'; msg.textContent = EXPIRED_MSG(got.ttl); return; }
    if(got.ttl) markAct(code);                                        // 首次进入：开始计时
    writeStore({ code:normCode(code), kid:keys.kid, k:b64e(got.raw), ttl:got.ttl });
    start(got.raw, keys.kid, code, got.ttl);
  }
  function showLoading(){
    gateEl().innerHTML = `<div class="gate-card"><img class="gate-logo" src="icon.svg" alt=""><div class="gate-sub" style="margin-top:20px">正在加载学习内容…</div></div>`;
  }
  function hideGate(){ const g = document.getElementById('gate'); if(g) g.remove(); }
  function addWatermark(){
    if(document.getElementById('wbMark')) return;
    const w = document.createElement('div');
    w.id = 'wbMark'; w.textContent = '内部学习资料 · 请勿外传';
    document.body.appendChild(w);
  }

  /* 「我的」页里用：退出 / 更换邀请码 */
  window.accessLogout = function(){
    if(!confirm('退出后需要重新输入邀请码，学习记录不会丢失。确定退出吗？')) return;
    localStorage.removeItem(STORE);
    location.reload();
  };

  document.addEventListener('visibilitychange', () => {
    const a = window.ACCESS;
    if(document.visibilityState === 'visible' && a && a.ttl && a.expiresAt && Date.now() > a.expiresAt) location.reload();
  });

  boot();
})();
