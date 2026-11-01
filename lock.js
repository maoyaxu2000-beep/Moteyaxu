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
      return new Uint8Array(raw);
    }catch(e){ return null; }
  }

  async function fetchKeys(){
    try{
      const r = await fetch('keys.json', { cache:'no-cache' });
      return r.ok ? await r.json() : null;
    }catch(e){ return null; }   // 离线
  }

  /* ---------- 启动 ---------- */
  async function boot(){
    if(!(window.crypto && crypto.subtle)){ showGate('当前浏览器不支持加密功能，请用手机自带浏览器或微信打开最新版本'); return; }
    const saved = readStore();
    const keys = await fetchKeys();
    if(!saved){ showGate('', keys); return; }
    if(!keys){ return start(b64d(saved.k), saved.kid); }            // 离线：用本机已保存的密钥
    const id = normCode(saved.code).slice(0, 4);
    if(!(keys.entries || []).some(e => e.id === id)){
      localStorage.removeItem(STORE);
      showGate('你的邀请码已停用，请向管理员索取新的邀请码', keys); return;
    }
    if(keys.kid === saved.kid) return start(b64d(saved.k), saved.kid);
    const raw = await unwrap(keys, saved.code);                      // 主密钥已更换：用保存的码重新解
    if(!raw){ localStorage.removeItem(STORE); showGate('邀请码需要重新验证，请重新输入', keys); return; }
    writeStore({ code:saved.code, kid:keys.kid, k:b64e(raw) });
    start(raw, keys.kid);
  }

  async function start(raw, kid){
    showLoading();
    try{
      const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
      window.ACCESS = { key, kid, decrypt:(buf) => aesDecrypt(key, buf) };
      const r = await fetch('data.enc?k=' + kid);
      if(!r.ok) throw new Error('data');
      const text = td.decode(await aesDecrypt(key, await r.arrayBuffer()));
      new Function(text)();                                          // 定义 window.DATA
      for(const s of APP_SCRIPTS) await loadScript(s);
      hideGate();
      addWatermark();
    }catch(e){
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
    const keys = gateKeys || await fetchKeys();
    if(!keys){ btn.disabled = false; btn.textContent = '进入'; msg.textContent = '首次验证需要联网'; return; }
    gateKeys = keys;
    const raw = await unwrap(keys, code);
    if(!raw){ btn.disabled = false; btn.textContent = '进入'; msg.textContent = '邀请码不正确或已停用'; return; }
    writeStore({ code:normCode(code), kid:keys.kid, k:b64e(raw) });
    start(raw, keys.kid);
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

  boot();
})();
