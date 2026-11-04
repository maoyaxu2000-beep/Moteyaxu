/* ===========================================================
   五班英语角 · features.js —— 学习增强功能
   1. 间隔复习（今日复习）   2. 收藏 / 执勤速查 / 给旅客看
   3. 进度备份与恢复         4. 跟读录音对比 / 打卡海报
   5. 主题 / 版本 / 诊断信息
   加载顺序：app.js 之后、engine.js 之前（首页第一次绘制时这里的函数就要可用）
=========================================================== */
'use strict';
const APP_VERSION = '5.0';
const APP_BUILD = '2026-11-04';

function todayStr(){ return dateStr(new Date()); }
function addDays(n){ const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return dateStr(d); }

/* =========================================================
   1. 间隔复习（莱特纳盒子）
   每个条目有「盒子」0~5：盒子越高，隔得越久再复习（0 / 1 / 3 / 7 / 14 / 30 天）。
   想起来了 → 升一档；忘了 → 回到 0 号盒，当天还会再出现。
   条目 key：w:单词、p:短语英文原句、l:处置口语句子 id。
========================================================= */
const SRS_GAPS = [0, 1, 3, 7, 14, 30];
const SRS_BATCH = 20;
const SRS_LABEL = { w: '单词', p: '短语', l: '处置句' };

function srsAll(){ return LS.get('srs', {}); }
function srsSave(m){ LS.set('srs', m); }

/* ok=true：到期（或新条目）才升档，没到期的不重复加分；ok=false：任何时候都回到 0 号盒 */
function srsGrade(type, id, ok){
  if(!id) return;
  const m = srsAll(), k = type + ':' + id, e = m[k] || { b: 0, d: todayStr() };
  const fresh = !m[k];
  if(ok){
    if(!fresh && e.d > todayStr()) return;
    e.b = Math.min(SRS_GAPS.length - 1, (e.b || 0) + 1);
  } else {
    e.b = 0;
  }
  e.d = addDays(SRS_GAPS[e.b]);
  e.t = Date.now();
  m[k] = e; srsSave(m);
}
/* 只登记、不升档：闯关里答对的词，明天再来看一眼 */
function srsSeen(type, id){
  if(!id) return;
  const m = srsAll(), k = type + ':' + id;
  if(m[k]) return;
  m[k] = { b: 1, d: addDays(1), t: Date.now() };
  srsSave(m);
}

/* 第一次使用时，把已有的学习记录登记进来，并分散到后面几天，避免一天冒出几百条 */
function srsSeedOnce(){
  if(LS.get('srsSeeded', false)) return;
  LS.set('srsSeeded', true);
  const m = LS.get('srs', {}); let i = 0;
  const add = (type, id, box, spread, from) => {
    const k = type + ':' + id; if(!id || m[k]) return;
    m[k] = { b: box, d: addDays(from + (i++ % spread)), t: Date.now() };
  };
  LS.get('wrongWords', []).forEach(w => add('w', w && w.word, 0, 3, 0));
  LS.get('wrongPhrases', []).forEach(p => add('p', p, 0, 3, 0));
  Object.keys(LS.get('drillWeak', {})).forEach(id => add('l', id, 0, 3, 0));
  LS.get('studiedWords', []).forEach(w => add('w', w, 1, 10, 1));
  LS.get('studiedPhrases', []).forEach(p => add('p', p, 1, 10, 1));
  Object.keys(LS.get('drillMastery', {})).forEach(id => add('l', id, 1, 10, 1));
  srsSave(m);
}

/* 条目内容在词库里查不到（词库更新删掉了）就丢弃 */
let _wordMap = null, _phraseMap = null;
function srsResolve(k){
  const type = k[0], id = k.slice(2);
  if(type === 'w'){
    if(!_wordMap) _wordMap = new Map(WORDS.map(w => [w.word, w]));
    const w = _wordMap.get(id); return w ? { type, id, w } : null;
  }
  if(type === 'p'){
    if(!_phraseMap) _phraseMap = new Map(allPhrases().map(p => [p.en, p]));
    const p = _phraseMap.get(id); return p ? { type, id, p } : null;
  }
  if(type === 'l'){
    const l = (typeof DRILL_LINES !== 'undefined') ? DRILL_LINES[id] : null;
    return l ? { type, id, p: { en: l.en, cn: l.cn, cat: l.scene.title } } : null;
  }
  return null;
}
/* 确定「已经不存在」才算失效。处置口语库是最后加载的（首页第一次绘制时还没有），没加载时一律当作还在 */
function srsGone(k){
  const t = k[0];
  if(t === 'l') return typeof DRILL_LINES !== 'undefined' && !DRILL_LINES[k.slice(2)];
  if(t === 'w' || t === 'p') return !srsResolve(k);
  return true;
}
/* 到期的条目 key（已失效的顺手清掉，免得首页数字和实际能复习的对不上） */
function srsDueKeys(m){
  m = m || srsAll(); const td = todayStr(), out = []; let pruned = false;
  for(const k in m){
    if(m[k].d > td) continue;
    if(srsGone(k)){ delete m[k]; pruned = true; continue; }
    out.push(k);
  }
  if(pruned) srsSave(m);
  out.sort((a, b) => (m[a].d < m[b].d ? -1 : m[a].d > m[b].d ? 1 : m[a].b - m[b].b));
  return out;
}
function srsStats(){
  const m = srsAll(), due = srsDueKeys(m), by = { w: 0, p: 0, l: 0 };
  due.forEach(k => { by[k[0]]++; });
  const log = LS.get('srsLog', {});
  return { total: Object.keys(m).length, due: due.length, by, today: log[todayStr()] || 0 };
}

/* ---------- 首页入口卡片 ---------- */
function srsHomeCard(){
  const s = srsStats();
  if(!s.total) return '';
  if(!s.due){
    if(!s.today) return '';
    return `<div class="srs-card done"><div class="srs-ic">${icon('check')}</div>
      <div class="srs-main"><div class="srs-title">今日复习已完成</div><div class="srs-sub">今天复习了 ${s.today} 项 · 记忆曲线里共 ${s.total} 项</div></div></div>`;
  }
  const parts = ['w', 'p', 'l'].filter(t => s.by[t]).map(t => `${SRS_LABEL[t]} ${s.by[t]}`).join(' · ');
  return `<div class="srs-card" onclick="openSrsReview()"><div class="srs-ic">${icon('refresh')}</div>
    <div class="srs-main"><div class="srs-title">今日复习 <b>${s.due}</b> 项</div><div class="srs-sub">${parts} · 趁热复习记得牢</div></div>
    <span class="func-arrow">›</span></div>`;
}

/* ---------- 复习会话 ---------- */
let srsSession = null;
function openSrsReview(){
  const m = srsAll(), items = []; let dirty = false;
  const top = stack[stack.length - 1];
  for(const k of srsDueKeys(m)){
    const it = srsResolve(k);
    if(!it){ delete m[k]; dirty = true; continue; }
    items.push(it);
    if(items.length >= SRS_BATCH) break;
  }
  if(dirty) srsSave(m);
  if(!items.length){ toast('今天没有要复习的内容'); return; }
  srsSession = { list: items, idx: 0, revealed: false, ok: 0, miss: 0, total: items.length, done: false, missed: [] };
  if(top && top.render === renderSrs) refresh(false);      // 「再来一组」：原地换一组，不叠加返回层级
  else navigate(renderSrs, '今日复习', '');
  srsAutoSpeak();
}
function srsCur(){ const s = srsSession; return s && s.list[s.idx]; }
/* 听写类卡片一出现就读；看中文类等翻开答案后再读 */
function srsAutoSpeak(){
  const it = srsCur(); if(!it || it.type === 'w') return;
  if(phraseDir() === 'en2cn') setTimeout(() => speak(it.p.en), 0);
}
function renderSrs(){
  const s = srsSession;
  if(!s) return `<div class="view"><div class="empty">没有进行中的复习</div></div>`;
  if(s.done) return renderSrsSummary();
  const it = srsCur(), pct = Math.round(s.idx / s.list.length * 100);
  let face;
  if(it.type === 'w'){
    const w = it.w;
    face = `<div class="flash-tags"><span class="flash-cat" style="margin-bottom:0">单词</span>${usageTag(w.usage)}</div>
      <div class="flash-word speakable" onclick="event.stopPropagation();speak(${jsAttr(w.word)})">${esc(w.word)}</div>
      <div class="flash-ph">${esc(w.phonetic || '')}</div>
      <div class="flash-play" ${pb(w.word)}>${PI}</div>
      ${s.revealed ? `<div class="flash-reveal"><div class="flash-meaning">${esc(w.meaning)}</div>
        <div class="flash-eg">${esc(w.example || '')}</div><div class="flash-eg-cn">${esc(w.exampleCn || '')}</div></div>`
        : `<div class="tap-hint">先回忆意思，再点「显示答案」</div>`}`;
  } else if(phraseDir() === 'cn2en'){
    const p = it.p;
    face = `<div class="flash-tags"><span class="flash-cat" style="margin-bottom:0">${esc(it.type === 'l' ? '处置 · ' + p.cat : p.cat)}</span></div>
      <div class="phrase-q">${esc(p.cn)}</div>
      ${s.revealed ? `<div class="flash-reveal"><div class="phrase-a speakable" onclick="event.stopPropagation();speak(${jsAttr(p.en)})">${esc(p.en)}</div><div class="flash-play" ${pb(p.en)}>${PI}</div></div>`
        : `<div class="tap-hint">先想想英文怎么说，再点「显示答案」</div>`}`;
  } else {
    const p = it.p;
    face = `<div class="flash-tags"><span class="flash-cat" style="margin-bottom:0">${esc(it.type === 'l' ? '处置 · ' + p.cat : p.cat)}</span></div>
      <div class="flash-play" ${pb(p.en)}>${PI}</div>
      ${s.revealed ? `<div class="flash-reveal"><div class="phrase-a speakable" onclick="event.stopPropagation();speak(${jsAttr(p.en)})">${esc(p.en)}</div><div class="phrase-cn">${esc(p.cn)}</div></div>`
        : `<div class="tap-hint">听一遍，想想是什么意思，再点「显示答案」</div>`}`;
  }
  const extra = !s.revealed ? '' : it.type !== 'w' ? lineTools(it.p.en, it.p.cn) : fbLink(it.w.word, it.w.meaning);
  return `<div class="view">
    <div class="progress-txt"><span>${s.idx + 1} / ${s.list.length}</span><span>${SRS_LABEL[it.type]}复习</span></div>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    <div class="flash" onclick="srsReveal()">${face}</div>
    ${extra}
    <div class="flash-actions">
      ${s.revealed
        ? `<button class="btn amber" onclick="srsAnswer(false)">忘了</button><button class="btn gold" onclick="srsAnswer(true)">想起来了</button>`
        : `<button class="btn gold" onclick="srsReveal()">显示答案</button>`}
    </div>
    <div class="safe"></div>
  </div>`;
}
function srsReveal(){
  const s = srsSession; if(!s || s.revealed) return;
  s.revealed = true; refresh();
  const it = srsCur();
  if(it.type === 'w' || phraseDir() === 'cn2en') speak(it.type === 'w' ? it.w.word : it.p.en);
}
function srsAnswer(ok){
  const s = srsSession, it = srsCur(); if(!s || !it || !s.revealed) return;
  srsGrade(it.type, it.id, ok);
  if(!it.retry){ if(ok) s.ok++; else s.miss++; }
  if(!ok){
    srsLegacyMiss(it);
    if(!it.retry){ s.missed.push(it); s.list.push(Object.assign({}, it, { retry: true })); }   // 本轮末尾再来一次
  }
  s.idx++; s.revealed = false;
  if(s.idx >= s.list.length){ srsFinish(); return; }
  refresh(); srsAutoSpeak();
}
/* 忘了的条目同步进各自的「待复习」列表，生词本里能看到 */
function srsLegacyMiss(it){
  if(it.type === 'w'){ const a = LS.get('wrongWords', []); if(!a.find(x => x.word === it.id)){ a.push(it.w); LS.set('wrongWords', a); } }
  else if(it.type === 'p'){ const a = LS.get('wrongPhrases', []); if(!a.includes(it.id)){ a.push(it.id); LS.set('wrongPhrases', a); } }
  else { const w = drillWeak(); w[it.id] = Date.now(); LS.set('drillWeak', w); }
}
function srsFinish(){
  const s = srsSession; s.done = true;
  const log = LS.get('srsLog', {}), t = todayStr();
  log[t] = (log[t] || 0) + s.total;
  /* 只留最近 60 天 */
  Object.keys(log).sort().slice(0, -60).forEach(k => delete log[k]);
  LS.set('srsLog', log);
  s.xp = Math.min(SRS_BATCH, s.total);
  if(typeof addXP === 'function') addXP(s.xp);
  stopSpeak();
  refresh(false);
}
function renderSrsSummary(){
  const s = srsSession, st = srsStats();
  const tomorrow = Object.values(srsAll()).filter(e => e.d === addDays(1)).length;
  return `<div class="view" style="text-align:center">
    <div class="result-ico ok">${icon('check')}</div>
    <div style="font-size:19px;font-weight:800">本组复习完成</div>
    <div class="result-stat-row">
      <div class="result-stat"><b>${s.ok}</b><span>想起来了</span></div>
      <div class="result-stat"><b>${s.miss}</b><span>忘了</span></div>
      <div class="result-stat"><b>+${s.xp}</b><span>获得经验</span></div>
    </div>
    ${s.missed.length ? `<div class="card" style="margin:18rem 0 24rem;text-align:left">
      <div style="font-size:13px;font-weight:700;margin-bottom:8rem">这几项再看一眼</div>
      ${s.missed.map(it => it.type === 'w'
        ? `<div class="drill-miss" onclick="speak(${jsAttr(it.w.word)})"><div>${esc(it.w.word)}</div><div class="li-cn">${esc(it.w.meaning)}</div></div>`
        : `<div class="drill-miss" onclick="speak(${jsAttr(it.p.en)})"><div>${esc(it.p.en)}</div><div class="li-cn">${esc(it.p.cn)}</div></div>`).join('')}
    </div>` : `<div style="font-size:13px;color:var(--muted);margin:18rem 0 28rem;line-height:1.7">全部想起来了，记得真牢！<br>明天有 ${tomorrow} 项会再来找你。</div>`}
    ${st.due ? `<button class="btn gold" onclick="openSrsReview()">还有 ${st.due} 项到期 · 再来一组</button><div style="height:16rem"></div>` : ''}
    <button class="btn ghost" onclick="srsExit()">返回</button>
    <div class="safe"></div>
  </div>`;
}
function srsExit(){ srsSession = null; goBack(); }

srsSeedOnce();

/* =========================================================
   2. 收藏 · 执勤速查 · 给旅客看
========================================================= */
/* ---------- 收藏：以英文原句的哈希为 key，内容一起存下来，不依赖词库顺序 ---------- */
function favKey(en){ return audioKey(en); }
function favList(){ return LS.get('favs', []); }
function isFav(en){ const k = favKey(en); return favList().some(f => f.k === k); }
function lnData(en, cn){ return `data-en="${esc(en)}" data-cn="${esc(cn || '')}"`; }
function favBtn(en, cn){
  return `<span class="ln-btn fav${isFav(en) ? ' on' : ''}" data-fk="${favKey(en)}" ${lnData(en, cn)} role="button" aria-label="收藏" onclick="event.stopPropagation();toggleFav(this)">${icon('star')}</span>`;
}
function showBtn(en, cn){
  return `<span class="ln-btn" ${lnData(en, cn)} role="button" aria-label="给旅客看" onclick="event.stopPropagation();showCardEl(this)">${icon('expand')}</span>`;
}
/* 列表行右侧的两个小图标：收藏、给旅客看 */
function lineActs(en, cn){ return `<div class="ln-acts">${favBtn(en, cn)}${showBtn(en, cn)}</div>`; }
/* 闪卡下方的一排文字按钮 */
function lineTools(en, cn){
  const on = isFav(en);
  return `<div class="line-tools">
    <span class="lt-btn fav${on ? ' on' : ''}" data-fk="${favKey(en)}" ${lnData(en, cn)} role="button" onclick="toggleFav(this)">${icon('star')}<i>收藏</i></span>
    <span class="lt-btn" ${lnData(en, cn)} role="button" onclick="showCardEl(this)">${icon('expand')}<i>给旅客看</i></span>
    ${typeof recToolBtn === 'function' ? recToolBtn(en) : ''}
  </div>${fbLink(en, cn)}`;
}
function toggleFav(el){
  const en = el.dataset.en, cn = el.dataset.cn, k = favKey(en);
  const a = favList(), i = a.findIndex(f => f.k === k);
  if(i >= 0){ a.splice(i, 1); toast('已取消收藏'); }
  else { a.unshift({ k, en, cn, t: Date.now() }); toast('已收藏'); }
  LS.set('favs', a);
  document.querySelectorAll(`[data-fk="${k}"]`).forEach(e => e.classList.toggle('on', i < 0));
}

function openFavs(){ navigate(renderFavs, '我的收藏', ''); }
function renderFavs(){
  const a = favList();
  if(!a.length) return `<div class="view"><div class="empty"><span class="big">${icon('star')}</span>还没有收藏<br><span style="font-size:12px">在任意句子右侧点 ☆ 就能收藏，执勤时一翻就找到</span></div></div>`;
  return `<div class="view">
    <div class="fav-head"><span>共 ${a.length} 句</span><button class="chip" onclick="startFavPractice()">练习收藏</button></div>
    ${a.map(f => `<div class="list-item">
      <div class="li-main"><div class="li-en speakable" onclick="speak(${jsAttr(f.en)})">${esc(f.en)}</div><div class="li-cn">${esc(f.cn)}</div></div>
      ${lineActs(f.en, f.cn)}<div class="play" ${pb(f.en)}>${PI}</div></div>`).join('')}
    <div class="safe"></div></div>`;
}
function startFavPractice(){
  const a = favList(); if(!a.length) return;
  phraseSession = { list: shuffle(a.map(f => ({ en: f.en, cn: f.cn, cat: '我的收藏' }))), idx: 0, revealed: false, mode: 'study', cat: '我的收藏' };
  navigate(renderPhraseFlash, '练习收藏', '');
  if(phraseDir() === 'en2cn') setTimeout(() => speak(phraseSession.list[0].en), 0);
}

/* ---------- 给旅客看：全屏大字卡 ---------- */
let _wake = null;
function showCardEl(el){ showCard(el.dataset.en, el.dataset.cn); }
function showCard(en, cn){
  closeShowCard();
  const n = en.length, vw = n <= 14 ? 15 : n <= 28 ? 11 : n <= 50 ? 8.5 : n <= 90 ? 6.5 : 5;
  const d = document.createElement('div');
  d.id = 'showCard'; d.className = 'show-card';
  d.innerHTML = `<button class="sc-close" onclick="closeShowCard()" aria-label="关闭">${icon('close')}</button>
    <div class="sc-body">
      <div class="sc-en" style="font-size:min(${vw}vw,${(vw * 1.25).toFixed(1)}vh)">${esc(en)}</div>
      <div class="sc-cn" id="scCn">${esc(cn || '')}</div>
    </div>
    <div class="sc-bar">
      <button class="sc-btn" ${pb(en)}>${PI}<span>播放</span></button>
      ${cn ? `<button class="sc-btn ghost" onclick="scToggleCn(this)"><span>仅英文</span></button>` : ''}
    </div>`;
  document.body.appendChild(d);
  document.body.classList.add('sc-open');
  markPlaying();
  try{
    if(navigator.wakeLock) navigator.wakeLock.request('screen').then(l => {
      if(document.getElementById('showCard')) _wake = l; else l.release().catch(() => {});   // 请求期间卡片已关闭：立刻还回去
    }).catch(() => {});
  }catch(e){}
}
function scToggleCn(btn){
  const cn = document.getElementById('scCn'); if(!cn) return;
  const hide = cn.classList.toggle('off');
  btn.querySelector('span').textContent = hide ? '显示中文' : '仅英文';
}
function closeShowCard(){
  const d = document.getElementById('showCard'); if(!d) return;
  d.remove(); document.body.classList.remove('sc-open');
  stopSpeak();
  try{ if(_wake){ _wake.release(); _wake = null; } }catch(e){}
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeShowCard(); });

/* ---------- 执勤速查：全库搜索（单词 / 短语 / 空保英语 / 处置口语 / 对话） ---------- */
let _corpus = null;
/* ---- 文本规整：小写、去标点（don't → dont）、多空格合一 ---- */
let _punct;
try{ _punct = new RegExp('[^\\p{L}\\p{N}]+', 'gu'); }catch(e){ _punct = /[^a-z0-9㐀-鿿]+/g; }   // 老内核不支持 \p 时退回基本写法
function sNorm(t){ return String(t || '').toLowerCase().replace(/['’‘`]/g, '').replace(_punct, ' ').trim(); }
const S_CJK = /[㐀-鿿]/;
/* 词干：去掉常见词尾（复数、-ing、-ed），让 passports / boarding 也能找到 passport / board */
function sStem(w){
  if(w.length > 4){
    if(w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if(w.endsWith('ing')) return w.slice(0, -3);
    if(w.endsWith('ed') || w.endsWith('es')) return w.slice(0, -2);
  }
  return (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) ? w.slice(0, -1) : w;
}
function sSameStem(a, b){ return a === b || (Math.min(a.length, b.length) >= 4 && Math.abs(a.length - b.length) <= 2 && (a.startsWith(b) || b.startsWith(a))); }
/* 相差不超过 1 个字母（错一个、多一个、少一个） */
function sNear1(a, b){
  const d = a.length - b.length; if(d > 1 || d < -1) return false;
  if(a.length < b.length){ const t = a; a = b; b = t; }
  let i = 0, j = 0, diff = 0;
  while(i < a.length && j < b.length){
    if(a[i] === b[j]){ i++; j++; continue; }
    if(++diff > 1) return false;
    if(a.length === b.length){ i++; j++; } else i++;
  }
  return diff + (a.length - i) + (b.length - j) <= 1;
}
/* 释义里「n. 安全带；座椅安全带」这种，按分号 / 逗号拆开并去掉词性前缀，方便整词精确匹配 */
function sSegs(cn){
  return String(cn || '').split(/[；;，,、\/（）()]/).map(x => sNorm(x.replace(/^\s*(?:n|v|vt|vi|adj|adv|prep|conj|pron|num|int|abbr)\.?\s*/i, ''))).filter(Boolean);
}
function searchMake(en, cn, src, o){
  o = o || {};
  const n = sNorm(en), ew = n.split(' ').filter(Boolean);
  return { en, cn: cn || '', src, ph: o.ph || '', eg: o.eg || '', word: !!o.word,
    n, ew, es: ew.map(sStem), nsq: n.replace(/ /g, ''),
    c: sNorm(cn), cs: sSegs(cn), e: sNorm(o.eg), ec: sNorm(o.egCn) };
}
function searchCorpus(){
  if(_corpus) return _corpus;
  const out = [], seen = new Set();
  const push = (en, cn, src, o) => {
    if(!en) return; o = o || {};
    if(!o.word){ const k = en.trim().toLowerCase(); if(seen.has(k)) return; seen.add(k); }
    out.push(searchMake(en, cn, src, o));
  };
  WORDS.forEach(w => push(w.word, w.meaning, '单词', { word: 1, ph: w.phonetic, eg: w.example, egCn: w.exampleCn }));
  SPEAKING.forEach(c => c.list.forEach(it => push(it.en, it.cn, '短语 · ' + c.category)));
  (window.DATA.security || []).forEach(p => p.categories.forEach(c => c.items.forEach(it => {
    if(it.en) push(it.en, it.cn, '空保英语 · ' + c.category);
    if(it.q) push(it.q.en, it.q.cn, '空保英语 · ' + c.category);
    if(it.a && it.a.en) push(it.a.en, it.a.cn, '空保英语 · ' + c.category);
    (it.turns || []).forEach(t => push(t.en, t.cn, '空保英语 · ' + c.category));
  })));
  (window.DATA.dialogues || []).forEach(c => c.list.forEach(d => d.dialogue.forEach(t => push(t.text || t.en, t.textCn || t.cn, '对话 · ' + d.title))));
  ((window.DATA && window.DATA.drills) || []).forEach(c => c.scenes.forEach(s => s.groups.forEach(g => g.lines.forEach(l => push(l.en, l.cn, '处置口语 · ' + s.title)))));
  return (_corpus = out);
}

/* 短的英文词（id、no）要整词命中，否则 provide 里的 id 也算 */
function sHas(text, t){ return (t.length >= 3 || S_CJK.test(t)) ? text.includes(t) : (' ' + text + ' ').includes(' ' + t + ' '); }
/* ---- 第一档：每个词都要命中（整词 > 开头 > 包含 > 例句里出现），分数越高越靠前 ---- */
function sTokenScore(it, t){
  if(it.n === t || it.c === t) return 100;
  if(it.cs.includes(t)) return 92;                                   // 释义整条就是它：搜「安全带」先出单词「seat belt」
  if(it.c.startsWith(t)) return 74;
  if(it.ew.includes(t)) return 72;
  if(it.c.includes(t)) return 56;
  if(it.ew.some(w => w.startsWith(t))) return 56;
  if(t.length >= 4 && it.nsq.includes(t)) return 44;                 // seatbelt ↔ seat belt
  if(t.length >= 3 && it.n.includes(t)) return 36;
  if(sHas(it.e, t) || sHas(it.ec, t)) return 14;              // 只在例句里出现
  return 0;
}
function sStrict(it, terms, qn, qsq){
  let sum = 0, bonus = 0;
  for(const t of terms){
    const sc = sTokenScore(it, t); if(!sc) return 0;
    sum += sc;
    if(sc >= 36) bonus += 14 * t.length / Math.max(t.length, S_CJK.test(t) ? it.c.length : it.n.length);   // 越短越贴近
  }
  let r = sum / terms.length + bonus / terms.length;
  if(terms.length > 1 && (qn === it.n || qn === it.c || qsq === it.nsq)) r += 40;
  return r + (it.word ? 2 : 0);
}

/* ---- 第二档（相近结果）：整句描述、错别字、单复数 —— 不要求每个词都命中，按命中比例排序 ---- */
const S_EN_STOP = new Set('a an the to of in on at for and or is are am be do does did not no you your me my i it this that please can could would will we us with from by as if so'.split(' '));
const S_CN_PHRASE = /怎么说|怎么讲|怎么表达|怎么写|如何说|如何表达|用英语怎么说|用英文怎么说|英语怎么说|英文怎么说|是什么意思|什么意思|是什么/g;
function sLooseQuery(q){
  const toks = sNorm(q).split(' ').filter(Boolean);
  const cn = [], lt = [];
  toks.forEach(t => {
    if(!S_CJK.test(t)){ lt.push(t); return; }
    const m = t.match(/[㐀-鿿]+|[a-z0-9]+/g) || [];
    m.forEach(seg => {
      if(!S_CJK.test(seg)){ lt.push(seg); return; }
      let x = seg.replace(S_CN_PHRASE, ' ');
      if(x.replace(/\s/g, '').length > 4) x = x.replace(/[的了吗呢吧啊呀嘛请我你您]/g, ' ');       // 长句里去掉语气词，短词保持原样
      x.split(/\s+/).filter(Boolean).forEach(p => {
        if(p.length === 1) cn.push(p);
        else for(let i = 0; i < p.length - 1; i++) cn.push(p.slice(i, i + 2));
      });
    });
  });
  const bg = [...new Set(cn)];
  let words = [...new Set(lt)];
  const kept = words.filter(w => !S_EN_STOP.has(w)); if(kept.length) words = kept;
  return { bg, lt: words, st: words.map(sStem) };
}
function sLoose(it, q){
  const tot = q.bg.length + q.lt.length; if(!tot) return 0;
  let hit = 0;
  q.bg.forEach(b => { if(it.c.includes(b) || it.ec.includes(b)) hit++; });
  q.lt.forEach((w, i) => {
    const st = q.st[i];
    if(it.es.some(x => sSameStem(x, st)) || it.nsq.includes(w) && w.length >= 4) hit++;
    else if(w.length >= 5 && it.ew.some(x => sNear1(x, w))) hit++;
  });
  if(!hit) return 0;
  if(tot >= 3 && hit < 2) return 0;
  const ratio = hit / tot;
  return (ratio >= 0.3 || hit >= 3) ? ratio : 0;
}

function searchRunOn(corpus, q){
  const qn = sNorm(q), terms = qn.split(' ').filter(Boolean);
  if(!terms.length) return { terms, total: 0, list: [], loose: [], looseTerms: [] };
  const qsq = qn.replace(/ /g, ''), res = [];
  corpus.forEach((it, idx) => { const sc = sStrict(it, terms, qn, qsq); if(sc) res.push([sc, idx, it]); });
  res.sort((a, b) => b[0] - a[0] || a[2].en.length - b[2].en.length || a[1] - b[1]);
  const out = { terms, total: res.length, list: res.slice(0, 40).map(x => x[2]), loose: [], looseTerms: [] };
  if(res.length < 5){
    const lq = sLooseQuery(q), got = new Set(out.list), cand = [];
    corpus.forEach((it, idx) => { if(got.has(it)) return; const r = sLoose(it, lq); if(r) cand.push([r, idx, it]); });
    cand.sort((a, b) => b[0] - a[0] || a[2].en.length - b[2].en.length || a[1] - b[1]);
    out.loose = cand.slice(0, 12).map(x => x[2]);
    out.looseTerms = lq.bg; out.lq = lq;
  }
  return out;
}
function searchRun(q){ return searchRunOn(searchCorpus(), q); }

/* 把命中的关键词标出来（先按原文切分再转义，不会误伤 &amp; 之类的实体） */
function hl(text, terms){
  if(!terms.length) return esc(text);
  const re = new RegExp('(' + terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'ig');
  return String(text).split(re).map((seg, i) => i % 2 ? `<mark>${esc(seg)}</mark>` : esc(seg)).join('');
}
const SEARCH_HOT = ['安全带', '手机', '行李', '护照', '登机牌', '冷静', '醉酒', '座位', '证件', '紧急'];
function openSearch(){
  navigate(renderSearch, '执勤速查', '');
  const tb = document.getElementById('topbar');
  document.documentElement.style.setProperty('--tbh', (tb ? tb.offsetHeight : 48) + 'px');
  setTimeout(() => { const i = document.getElementById('sIn'); if(i) i.focus(); }, 60);
}
function renderSearch(){
  return `<div class="view">
    <div class="search-bar">${icon('search')}<input id="sIn" type="search" placeholder="输入中文或英文，如「安全带」「passport」" autocomplete="off" autocapitalize="off" spellcheck="false"
      oninput="searchInput(event)" oncompositionend="searchInput(event)" onkeydown="if(event.key==='Enter'){searchRemember();this.blur()}">
      <span class="sb-clear" onclick="searchClear()" aria-label="清空">${icon('close')}</span></div>
    <div id="sRes">${searchIdle()}</div>
    <div class="safe"></div></div>`;
}
function searchIdle(){
  const rec = LS.get('recentSearch', []);
  const chip = q => `<span class="chip" onclick="searchFill(${jsAttr(q)})">${esc(q)}</span>`;
  return `${rec.length ? `<div class="sr-title">最近查过 <span onclick="searchClearRecent()">清除</span></div><div class="sr-chips">${rec.map(chip).join('')}</div>` : ''}
    <div class="sr-title">常用速查</div><div class="sr-chips">${SEARCH_HOT.map(chip).join('')}</div>
    <div class="sr-tip">支持中文、英文、中英混合；多个词用空格隔开。点 <b>⛶</b> 把整句放大给旅客看，点 <b>☆</b> 收藏。</div>`;
}
let _sTimer = null;
function searchInput(e){
  if(e.isComposing) return;
  clearTimeout(_sTimer);
  const v = e.target.value;
  _sTimer = setTimeout(() => searchRender(v), 90);
}
/* 相近结果里，把这一条里「被认作同一个词」的单词也标出来（pasport → passport） */
function searchLooseMarks(it, r){
  const lq = r.lq; if(!lq || !lq.lt.length) return r.looseTerms;
  const ws = it.ew.filter(x => lq.st.some(st => sSameStem(sStem(x), st)) || lq.lt.some(w => w.length >= 5 && sNear1(x, w)));
  return r.looseTerms.concat(ws);
}
function searchRow(it, terms){
  return `<div class="list-item sr-item">
      <div class="li-main">
        <div class="li-en speakable" onclick="speak(${jsAttr(it.en)})">${hl(it.en, terms)}${it.ph ? ` <span class="sr-ph">${esc(it.ph)}</span>` : ''}</div>
        <div class="li-cn">${hl(it.cn, terms)}</div>
        ${it.eg ? `<div class="sr-eg">${hl(it.eg, terms)}</div>` : ''}
        <div class="sr-src">${esc(it.src)}</div>
      </div>
      ${lineActs(it.en, it.cn)}<div class="play" ${pb(it.en)}>${PI}</div></div>`;
}
function searchRender(v){
  const box = document.getElementById('sRes'); if(!box) return;
  const r = searchRun(v);
  if(!r.terms.length){ box.innerHTML = searchIdle(); return; }
  if(!r.list.length && !r.loose.length){ box.innerHTML = `<div class="empty" style="padding:60rem 0"><span class="big">${icon('search')}</span>没有找到「${esc(v)}」<br><span style="font-size:12px">换个说法试试，或只输入一个关键词</span></div><span class="fb-link" onclick="openFeedback('miss',${jsAttr(v.trim())})">告诉管理员，请他补上这个说法</span>`; return; }
  let html = '';
  if(r.list.length) html += (r.total > r.list.length ? `<div class="sr-title">找到 ${r.total} 条，显示前 ${r.list.length} 条</div>` : `<div class="sr-title">找到 ${r.total} 条</div>`) + r.list.map(it => searchRow(it, r.terms)).join('');
  if(r.loose.length) html += `<div class="sr-title">${r.list.length ? '相近的结果' : '没有完全一致的，下面是意思相近的'}</div>` + r.loose.map(it => searchRow(it, searchLooseMarks(it, r))).join('');
  html += `<span class="fb-link" onclick="openFeedback('miss',${jsAttr(v.trim())})">没找到想要的说法？告诉管理员</span>`;
  box.innerHTML = html;
  markPlaying();
}
function searchRemember(){
  const i = document.getElementById('sIn'); if(!i) return;
  const v = i.value.trim(); if(!v) return; const rr = searchRun(v); if(!rr.list.length && !rr.loose.length) return;
  const rec = LS.get('recentSearch', []).filter(x => x !== v); rec.unshift(v);
  LS.set('recentSearch', rec.slice(0, 8));
}
function searchFill(q){ const i = document.getElementById('sIn'); if(!i) return; i.value = q; searchRender(q); searchRemember(); }
function searchClear(){ const i = document.getElementById('sIn'); if(!i) return; i.value = ''; searchRender(''); i.focus(); }
function searchClearRecent(){ LS.set('recentSearch', []); const i = document.getElementById('sIn'); searchRender(i ? i.value : ''); }

/* =========================================================
   3. 进度备份与恢复
   学习记录只存在这台手机的浏览器里：换手机、清理浏览器数据、iPhone 长期不打开网页版都可能丢。
   这里把进度压成一段「备份码」，复制到微信文件传输助手就能带走；在新设备粘贴即可合并回来。
   · 不含邀请码、密钥（那些在 wb 开头的键里，从不导出）
   · 导入是「合并」不是「覆盖」：本机已有的进度不会被冲掉，两边取更好的
   · 带校验：复制不全会提示，不会导入一半
========================================================= */
function b64uEnc(u8){
  let s = ''; for(let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64uDec(t){
  t = t.replace(/-/g, '+').replace(/_/g, '/'); while(t.length % 4) t += '=';
  const s = atob(t), u = new Uint8Array(s.length); for(let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u;
}
function fnv8(str){ let h = 0x811c9dc5; for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
async function streamBytes(u8, Ctor, fmt){
  const s = new Blob([u8]).stream().pipeThrough(new Ctor(fmt));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
const BACKUP_SETTINGS = ['phraseDir', 'voiceAccent', 'playRate', 'theme'];

function backupData(){
  const ph = en => audioKey(en), g = (k, d) => LS.get(k, d);
  const srs = {};
  Object.entries(g('srs', {})).forEach(([k, e]) => { srs[k[0] === 'p' ? 'p:' + ph(k.slice(2)) : k] = [e.b, e.d, e.t]; });
  const set = {}; BACKUP_SETTINGS.forEach(k => { const v = LS.get(k, null); if(v !== null) set[k] = v; });
  return { app: 'wuban', v: 1, t: Date.now(), d: {
    n: g('displayName', ''), sw: g('studiedWords', []), ww: g('wrongWords', []).map(w => w.word),
    sp: g('studiedPhrases', []).map(ph), wp: g('wrongPhrases', []).map(ph),
    lp: g('lessonProgress', {}), st: g('storyProgress', {}), xp: g('xp', 0),
    ck: g('checkinHistory', []), dm: g('drillMastery', {}), dw: g('drillWeak', {}),
    srs, sl: g('srsLog', {}), fv: g('favs', []).map(f => [f.en, f.cn, f.t]), set } };
}
/* 压缩（浏览器支持就压，不支持就原样）→ base64url → 加前缀和校验 */
async function encodeBackup(){
  let u8 = new TextEncoder().encode(JSON.stringify(backupData())), tag = 'WB1';
  try{ if(window.CompressionStream){ u8 = await streamBytes(u8, CompressionStream, 'gzip'); tag = 'WB2'; } }catch(e){}
  const body = b64uEnc(u8);
  return `${tag}.${fnv8(body)}.${body}`;
}
async function decodeBackup(text){
  const t = String(text || '').replace(/\s+/g, '');
  const m = t.match(/(WB[12])\.([0-9a-f]{8})\.([A-Za-z0-9_-]+)/);
  if(!m) throw new Error('这不是五班英语角的备份码，请从「WB2.」开头完整复制');
  if(fnv8(m[3]) !== m[2]) throw new Error('备份码不完整（可能复制时被截断），请重新完整复制');
  let u8 = b64uDec(m[3]);
  if(m[1] === 'WB2'){
    if(!window.DecompressionStream) throw new Error('当前浏览器不支持解压，请换用较新的 Safari / Chrome / 微信');
    u8 = await streamBytes(u8, DecompressionStream, 'gzip');
  }
  let obj; try{ obj = JSON.parse(new TextDecoder().decode(u8)); }catch(e){ throw new Error('备份码内容损坏，请重新复制'); }
  if(!obj || obj.app !== 'wuban' || !obj.d) throw new Error('备份码内容不对');
  return obj;
}

/* 合并：每一项都先检查类型，坏数据直接忽略，绝不会写坏本机记录 */
function mergeBackup(b){
  const d = b.d || {}, sum = {};
  const strs = a => Array.isArray(a) ? a.filter(x => typeof x === 'string' && x.length < 400) : [];
  const num = x => (typeof x === 'number' && isFinite(x)) ? x : 0;
  const pmap = new Map(allPhrases().map(p => [audioKey(p.en), p.en]));
  const wmap = new Map(WORDS.map(w => [w.word, w]));
  const union = (key, incoming) => {
    const cur = LS.get(key, []), set = new Set(cur); let add = 0;
    incoming.forEach(x => { if(!set.has(x)){ set.add(x); add++; } });
    LS.set(key, [...set]); return add;
  };
  sum.words = union('studiedWords', strs(d.sw).filter(w => wmap.has(w)));
  sum.phrases = union('studiedPhrases', strs(d.sp).map(h => pmap.get(h)).filter(Boolean));
  union('wrongPhrases', strs(d.wp).map(h => pmap.get(h)).filter(Boolean));
  { const cur = LS.get('wrongWords', []), have = new Set(cur.map(w => w.word));
    strs(d.ww).forEach(w => { if(wmap.has(w) && !have.has(w)){ cur.push(wmap.get(w)); have.add(w); } });
    LS.set('wrongWords', cur); }
  { const cur = LS.get('lessonProgress', {}), inc = d.lp && typeof d.lp === 'object' ? d.lp : {}; sum.lessons = 0;
    Object.keys(inc).forEach(id => { const v = inc[id]; if(!v || typeof v !== 'object') return;
      const a = cur[id], ns = num(v.stars), nx = num(v.xp);
      if(ns <= 0) return;
      if(!a || ns > a.stars || (ns === a.stars && nx > (a.xp || 0))){ if(!a) sum.lessons++; cur[id] = { stars: ns, xp: nx }; } });
    LS.set('lessonProgress', cur); }
  { const cur = LS.get('storyProgress', {}), inc = d.st && typeof d.st === 'object' ? d.st : {};
    Object.keys(inc).forEach(id => { if(inc[id]) cur[id] = true; }); LS.set('storyProgress', cur); }
  LS.set('xp', Math.max(LS.get('xp', 0), num(d.xp)));
  { const hist = new Set(LS.get('checkinHistory', []));
    strs(d.ck).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)).forEach(x => hist.add(x));
    const arr = [...hist].sort(); LS.set('checkinHistory', arr);
    if(arr.length) LS.set('lastCheckinDate', arr[arr.length - 1]); }
  { const m0 = LS.get('drillMastery', {}), w0 = LS.get('drillWeak', {});
    const dm = d.dm && typeof d.dm === 'object' ? d.dm : {}, dw = d.dw && typeof d.dw === 'object' ? d.dw : {};
    new Set([...Object.keys(m0), ...Object.keys(w0), ...Object.keys(dm), ...Object.keys(dw)]).forEach(id => {
      const tm = Math.max(num(m0[id]), num(dm[id])), tw = Math.max(num(w0[id]), num(dw[id]));
      delete m0[id]; delete w0[id];
      if(tm && tm >= tw) m0[id] = tm; else if(tw) w0[id] = tw; });
    LS.set('drillMastery', m0); LS.set('drillWeak', w0); sum.drills = Object.keys(m0).length; }
  { const cur = LS.get('srs', {}), inc = d.srs && typeof d.srs === 'object' ? d.srs : {};
    Object.keys(inc).forEach(k0 => { const e = inc[k0]; if(!Array.isArray(e) || e.length < 3 || typeof e[1] !== 'string') return;
      let k = k0; if(k0[0] === 'p'){ const en = pmap.get(k0.slice(2)); if(!en) return; k = 'p:' + en; }
      else if(k0[0] === 'w'){ if(!wmap.has(k0.slice(2))) return; }
      else if(k0[0] === 'l'){ if(typeof DRILL_LINES !== 'undefined' && !DRILL_LINES[k0.slice(2)]) return; }
      else return;
      if(!cur[k] || num(e[2]) > (cur[k].t || 0)) cur[k] = { b: Math.max(0, Math.min(5, num(e[0]))), d: e[1], t: num(e[2]) }; });
    LS.set('srs', cur); }
  { const cur = LS.get('srsLog', {}), inc = d.sl && typeof d.sl === 'object' ? d.sl : {};
    Object.keys(inc).forEach(k => { cur[k] = Math.max(num(cur[k]), num(inc[k])); }); LS.set('srsLog', cur); }
  { const cur = LS.get('favs', []), have = new Set(cur.map(f => f.k)); sum.favs = 0;
    (Array.isArray(d.fv) ? d.fv : []).forEach(f => { if(!Array.isArray(f) || typeof f[0] !== 'string' || f[0].length > 400) return;
      const k = favKey(f[0]); if(have.has(k)) return; have.add(k); sum.favs++;
      cur.push({ k, en: f[0], cn: String(f[1] || '').slice(0, 400), t: num(f[2]) }); });
    cur.sort((a, b) => b.t - a.t); LS.set('favs', cur); }
  if(!LS.get('displayName', '') && typeof d.n === 'string') LS.set('displayName', d.n.slice(0, 20));
  if(d.set && typeof d.set === 'object') BACKUP_SETTINGS.forEach(k => { if(LS.get(k, null) === null && d.set[k] != null) LS.set(k, d.set[k]); });
  return sum;
}

/* ---------- 备份页 ---------- */
let backupCode = '';
function openBackup(){
  backupCode = '';
  navigate(renderBackup, '进度备份与恢复', '');
  encodeBackup().then(c => {
    backupCode = c;
    const ta = document.getElementById('bkOut'); if(ta) ta.value = c;
    const sz = document.getElementById('bkSize'); if(sz) sz.textContent = `约 ${(c.length / 1024).toFixed(1)} KB`;
  });
}
function lastBackupText(){
  const t = LS.get('lastBackup', 0);
  if(!t) return '还没有备份过';
  const d = new Date(t); return `上次备份：${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function renderBackup(){
  const studied = LS.get('studiedWords', []).length, sp = LS.get('studiedPhrases', []).length, favs = favList().length,
        dm = Object.keys(LS.get('drillMastery', {})).length, les = Object.keys(LS.get('lessonProgress', {})).length;
  return `<div class="view">
    <div class="card">
      <div class="bk-title">备份我的进度</div>
      <div class="bk-sub">已学单词 ${studied} · 短语 ${sp} · 处置句 ${dm} · 关卡 ${les} · 收藏 ${favs}<br><span id="bkLast">${lastBackupText()}</span></div>
      <textarea id="bkOut" class="bk-area" readonly placeholder="正在生成备份码…" onclick="this.select()"></textarea>
      <div class="bk-sub" style="margin-top:8rem">备份码 <span id="bkSize">生成中…</span> · 不含邀请码，可放心发给自己</div>
      <div class="bk-row">
        <button class="btn gold" onclick="backupCopy()">${icon('copy')} 复制备份码</button>
        <button class="btn ghost" onclick="backupSave()">${icon('download')} 存成文件</button>
      </div>
      <div class="bk-tip">建议复制后发到微信「文件传输助手」。换手机、清理浏览器或重新安装前，先备份一次。</div>
    </div>
    <div class="card" style="margin-top:20rem">
      <div class="bk-title">从备份恢复</div>
      <div class="bk-sub">粘贴备份码，或选择之前存的文件。恢复是「合并」：本机已有的进度不会被覆盖，两边取更好的。</div>
      <textarea id="bkIn" class="bk-area" placeholder="在这里粘贴以 WB2. 开头的备份码"></textarea>
      <div class="bk-row">
        <button class="btn gold" onclick="backupImport()">导入并合并</button>
        <button class="btn ghost" onclick="document.getElementById('bkFile').click()">选择文件</button>
      </div>
      <input id="bkFile" type="file" accept=".txt,text/plain" style="display:none" onchange="backupFile(this)">
      <div id="bkMsg" class="bk-msg"></div>
    </div>
    <div class="card" style="margin-top:20rem">
      <div class="bk-title">为什么要备份</div>
      <div class="bk-sub" style="line-height:1.8">学习进度保存在浏览器本地。iPhone 的 Safari 如果很长时间不打开网页版，系统可能清掉它；「添加到主屏幕」后更稳，但换手机、重装系统仍然带不走——备份码可以。</div>
    </div>
    <div class="safe"></div></div>`;
}
async function backupCopy(){
  if(!backupCode) backupCode = await encodeBackup();
  let ok = false;
  try{ await navigator.clipboard.writeText(backupCode); ok = true; }catch(e){}
  if(!ok){
    const ta = document.getElementById('bkOut');
    if(ta){ ta.removeAttribute('readonly'); ta.focus(); ta.select(); try{ ok = document.execCommand('copy'); }catch(e){} ta.setAttribute('readonly', ''); }
  }
  if(ok){ LS.set('lastBackup', Date.now()); const l = document.getElementById('bkLast'); if(l) l.textContent = lastBackupText(); toast('备份码已复制'); }
  else toast('请长按上面的备份码，选择「全选」后手动复制');
}
function backupSave(){
  const run = async () => {
    const code = backupCode || await encodeBackup();
    const d = new Date(), name = `五班英语角备份-${dateStr(d)}.txt`;
    const blob = new Blob([code], { type: 'text/plain' });
    try{
      if(navigator.canShare && navigator.canShare({ files: [new File([blob], name, { type: 'text/plain' })] })){
        await navigator.share({ files: [new File([blob], name, { type: 'text/plain' })], title: '五班英语角备份' });
        LS.set('lastBackup', Date.now()); toast('已分享'); return;
      }
    }catch(e){ if(e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    LS.set('lastBackup', Date.now()); toast('已保存文件');
  };
  run().catch(() => toast('保存失败，请改用「复制备份码」'));
}
function bkMsg(text, bad){ const m = document.getElementById('bkMsg'); if(m){ m.textContent = text; m.className = 'bk-msg' + (bad ? ' bad' : ' ok'); } }
async function backupImport(){
  const ta = document.getElementById('bkIn'); if(!ta) return;
  if(!ta.value.trim()){ bkMsg('请先粘贴备份码', true); return; }
  try{
    const obj = await decodeBackup(ta.value);
    const s = mergeBackup(obj);
    const when = obj.t ? new Date(obj.t) : null;
    bkMsg(`合并完成${when ? '（备份于 ' + (when.getMonth() + 1) + '月' + when.getDate() + '日）' : ''}：新增单词 ${s.words}、短语 ${s.phrases}、关卡 ${s.lessons}、收藏 ${s.favs}`, false);
    ta.value = ''; toast('恢复成功');
    srsSeedOnce();
  }catch(e){ bkMsg(e.message || '导入失败', true); }
}
function backupFile(inp){
  const f = inp.files && inp.files[0]; if(!f) return;
  if(f.size > 2e6){ bkMsg('文件太大，不像是备份文件', true); return; }
  const r = new FileReader();
  r.onload = () => { const ta = document.getElementById('bkIn'); if(ta){ ta.value = String(r.result || ''); backupImport(); } };
  r.readAsText(f); inp.value = '';
}

/* =========================================================
   5. 外观（跟随系统 / 浅色 / 深色）· 关于与诊断
   data-theme 永远是 light 或 dark（跟随系统时由脚本按系统设置写入），样式只需要写一份深色。
   index.html 头部有同样逻辑的小脚本，首屏绘制前就设好，不会先白后黑闪一下。
========================================================= */
function themePref(){ return LS.get('theme', 'auto'); }
function themeEffective(){
  const p = themePref();
  if(p === 'light' || p === 'dark') return p;
  return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}
function applyTheme(){
  const t = themeEffective();
  document.documentElement.setAttribute('data-theme', t);
  const m = document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content', t === 'dark' ? '#0b1424' : '#111d33');
}
function setTheme(p){ LS.set('theme', p); applyTheme(); refresh(); }
try{ const mq = matchMedia('(prefers-color-scheme: dark)'); (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(applyTheme); }catch(e){}
applyTheme();

/* ---------- 关于与诊断 ---------- */
let aboutInfo = { cache: '读取中…', storage: '', sw: '' };
function errLog(){ try{ return JSON.parse(localStorage.getItem('wbErr') || '[]'); }catch(e){ return []; } }
function openAbout(){
  aboutInfo = { cache: '读取中…', storage: '', sw: '' };
  navigate(renderAbout, '关于与诊断', '');
  const set = (k, v) => { aboutInfo[k] = v; if(stack[stack.length - 1].render === renderAbout) refresh(); };
  try{ caches.keys().then(ks => set('cache', ks.filter(k => /^wuban-english/.test(k)).join(', ') || '无')).catch(() => set('cache', '无法读取')); }catch(e){ set('cache', '不支持'); }
  try{ navigator.storage.estimate().then(e => set('storage', `${(e.usage / 1048576).toFixed(1)} MB / ${Math.round(e.quota / 1048576)} MB`)); }catch(e){}
  try{ navigator.serviceWorker.getRegistration().then(r => set('sw', r ? (navigator.serviceWorker.controller ? '运行中' : '已注册，等待接管') : '未注册')); }catch(e){ set('sw', '不支持'); }
}
function diagText(){
  const a = window.ACCESS || {}, err = errLog(), s = srsStats();
  const lines = [
    `五班英语角 v${APP_VERSION}（${APP_BUILD}）`,
    `缓存版本：${aboutInfo.cache}`,
    `内容密钥编号：${a.kid || '-'}　邀请码编号：${a.codeId || '-'}`,
    `在线：${navigator.onLine ? '是' : '否'}　主屏幕模式：${isStandalone() ? '是' : '否'}　离线服务：${aboutInfo.sw || '-'}`,
    `外观：${themePref()}（当前 ${themeEffective()}）　微信内打开：${isWeChat() ? '是' : '否'}`,
    `存储：${aboutInfo.storage || '-'}`,
    `屏幕：${screen.width}x${screen.height} @${window.devicePixelRatio || 1}　视口：${innerWidth}x${innerHeight}`,
    `学习记录：单词 ${LS.get('studiedWords', []).length} · 短语 ${LS.get('studiedPhrases', []).length} · 复习计划 ${s.total}（到期 ${s.due}）· 收藏 ${favList().length}`,
    `设备：${navigator.userAgent}`,
    `最近错误（${err.length}）：`
  ];
  err.slice(-10).forEach(e => { const d = new Date(e.t); lines.push(`  ${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}  ${e.m}`); });
  return lines.join('\n');
}
function renderAbout(){
  const err = errLog(), a = window.ACCESS || {};
  return `<div class="view">
    <div class="card about-head">
      <img src="icon.svg" alt="" class="about-logo">
      <div><div style="font-size:17px;font-weight:800">五班英语角 · 空保英语</div><div style="font-size:12px;color:var(--muted);margin-top:4rem">版本 ${APP_VERSION} · ${APP_BUILD}</div></div>
    </div>
    <div class="card" style="margin-top:20rem">
      <div class="about-row"><span>离线缓存</span><b>${esc(aboutInfo.cache)}</b></div>
      <div class="about-row"><span>离线服务</span><b>${esc(aboutInfo.sw || '读取中…')}</b></div>
      <div class="about-row"><span>本机存储</span><b>${esc(aboutInfo.storage || '-')}</b></div>
      <div class="about-row"><span>邀请码编号</span><b>${esc(a.codeId || '-')}</b></div>
      <div class="about-row"><span>网络</span><b>${navigator.onLine ? '在线' : '离线'}</b></div>
      <div class="about-row"><span>运行方式</span><b>${isStandalone() ? '主屏幕应用' : '浏览器'}</b></div>
    </div>
    <div class="card" style="margin-top:20rem">
      <div class="bk-title">遇到问题？</div>
      <div class="bk-sub">点下面的按钮把诊断信息复制下来，发给管理员即可。信息里不含邀请码和学习内容。</div>
      <div class="bk-row">
        <button class="btn gold" onclick="diagCopy()">${icon('copy')} 复制诊断信息</button>
        <button class="btn ghost" onclick="checkUpdate()">${icon('refresh')} 检查更新</button>
      </div>
      <div class="bk-sub" style="margin-top:20rem">错误记录：${err.length ? `${err.length} 条` + ` · <span style="color:var(--blue)" onclick="errClear()">清除</span>` : '没有'}</div>
      ${err.slice(-5).reverse().map(e => `<div class="err-line">${esc(e.m)}</div>`).join('')}
    </div>
    <div class="card" style="margin-top:20rem;font-size:12px;color:var(--muted);line-height:1.8">
      民航安保执勤英语学习应用：500+ 执勤词汇、情景闯关剧本、处置实战口语与空保英语专题。<br>离线可用 · 学习记录只保存在本机，可在「进度备份与恢复」里带走。
    </div>
    <div class="safe"></div></div>`;
}
async function diagCopy(){
  const text = diagText(); let ok = false;
  try{ await navigator.clipboard.writeText(text); ok = true; }catch(e){}
  if(!ok){
    const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-999px;top:0';
    document.body.appendChild(ta); ta.select(); try{ ok = document.execCommand('copy'); }catch(e){} ta.remove();
  }
  toast(ok ? '诊断信息已复制' : '复制失败，请截图发给管理员');
}
function errClear(){ try{ localStorage.removeItem('wbErr'); }catch(e){} refresh(); }
function checkUpdate(){
  if(!navigator.serviceWorker){ toast('当前浏览器不支持离线更新'); return; }
  navigator.serviceWorker.getRegistration().then(r => {
    if(!r){ toast('离线服务尚未启用'); return; }
    toast('正在检查更新…');
    return r.update().then(() => setTimeout(() => toast(r.installing || r.waiting ? '发现新版本，稍后会提示刷新' : '已是最新版本'), 1200));
  }).catch(() => toast('检查失败，请稍后再试'));
}

/* 没有朗读内容的页面不显示语速悬浮钮，免得挡住文字 */
function noSpeedPage(r){ return r === renderBackup || r === renderAbout; }

/* =========================================================
   4a. 跟读录音对比
   录一遍自己读的，再和标准原声一前一后对着听。录音只留在内存里，不上传、不保存；
   换一句或重录就丢掉。需要麦克风权限；不支持录音的浏览器里按钮自动隐藏。
========================================================= */
const REC_OK = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
const REC_MAX_MS = 12000;
let rec = { state: 'idle', key: null, url: null, mr: null, chunks: [], timer: null };
let recAudio = null;

function recToolBtn(en){
  if(!REC_OK) return '';
  const k = audioKey(en), mine = rec.key === k, a = lnData(en, '');
  if(mine && rec.state === 'recording')
    return `<span class="lt-btn rec on" ${a} role="button" onclick="recStop()"><b class="rec-dot"></b><i>录音中 · 点此结束</i></span>`;
  if(mine && rec.state === 'ready')
    return `<span class="lt-btn" ${a} role="button" onclick="recPlayMine()">${icon('play')}<i>我的录音</i></span>
      <span class="lt-btn" ${a} role="button" onclick="recCompare(this)">${icon('refresh')}<i>原声 → 我的</i></span>
      <span class="lt-btn" ${a} role="button" onclick="recStart(this)">${icon('mic')}<i>重录</i></span>`;
  return `<span class="lt-btn" ${a} role="button" onclick="recStart(this)">${icon('mic')}<i>跟读</i></span>`;
}
function recDiscard(){
  clearTimeout(rec.timer);
  try{ if(rec.mr && rec.mr.state !== 'inactive'){ rec.mr.onstop = null; rec.mr.stop(); } }catch(e){}
  try{ rec.stream && rec.stream.getTracks().forEach(t => t.stop()); }catch(e){}
  recStopPlay();
  if(rec.url) URL.revokeObjectURL(rec.url);
  rec = { state: 'idle', key: null, url: null, mr: null, chunks: [], timer: null };
}
function recStopPlay(){ if(recAudio){ const a = recAudio; recAudio = null; try{ a.pause(); a.removeAttribute('src'); a.load(); }catch(e){} } }   // 先释放媒体资源，再撤销地址，否则浏览器会报「文件不存在」
let recStarting = false;
async function recStart(el){
  if(recStarting) return;                       // 正在等麦克风授权时再点没有意义，还会留下关不掉的麦克风
  const en = el.dataset.en, key = audioKey(en);
  recDiscard(); stopSpeak();
  recStarting = true;
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    rec = { state: 'recording', key, url: null, mr, stream, chunks: [], timer: setTimeout(recStop, REC_MAX_MS) };
    mr.ondataavailable = e => { if(e.data && e.data.size) rec.chunks.push(e.data); };
    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      if(rec.mr !== mr) return;
      const blob = new Blob(rec.chunks, { type: mr.mimeType || mime || 'audio/webm' });
      if(blob.size < 1200){ rec.state = 'idle'; rec.key = null; toast('没录到声音，靠近麦克风再试一次'); }
      else { rec.url = URL.createObjectURL(blob); rec.state = 'ready'; }
      refresh();
    };
    mr.start();
    recStarting = false;
    refresh();
  }catch(e){
    recStarting = false;
    rec = { state: 'idle', key: null, url: null, mr: null, chunks: [], timer: null };
    toast(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? '没有麦克风权限：请在浏览器/系统设置里允许使用麦克风' : '这台设备暂时无法录音');
  }
}
function recStop(){ clearTimeout(rec.timer); try{ if(rec.mr && rec.mr.state === 'recording') rec.mr.stop(); }catch(e){} }
function recPlayMine(onend){
  if(!rec.url) return;
  stopSpeak(); recStopPlay();
  const a = new Audio(rec.url); recAudio = a;
  a.onended = () => { if(recAudio === a){ recAudio = null; if(typeof onend === 'function') onend(); } };
  a.play().catch(() => toast('播放失败，请再点一次'));
}
/* 先放标准原声，播完紧接着放自己的录音，方便对着听差距 */
function recCompare(el){
  if(!rec.url) return;
  speak(el.dataset.en, null, () => setTimeout(() => recPlayMine(), 350));
}
document.addEventListener('visibilitychange', () => { if(document.hidden) recStop(); });

/* =========================================================
   4b. 打卡海报：画在 canvas 上，可分享或长按保存。不含邀请码。
========================================================= */
const POSTER_FONT = "'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif";
function posterIcon(ctx, name, x, y, size, color, lw){
  const d = [...(ICONS[name] || '').matchAll(/\sd="([^"]+)"/g)].map(m => m[1]);
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color; ctx.lineWidth = lw || 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  d.forEach(p => ctx.stroke(new Path2D(p)));
  ctx.restore();
}
/* 英文按词、中文按字换行 */
function wrapLines(ctx, text, maxW){
  const toks = String(text).match(/[A-Za-z0-9'’\-.,;:!?()\/]+\s*|[^\sA-Za-z0-9]|\s+/g) || [];
  const lines = []; let cur = '';
  toks.forEach(t => {
    if(ctx.measureText(cur + t).width > maxW && cur.trim()){ lines.push(cur.trimEnd()); cur = t.trimStart(); } else cur += t;
  });
  if(cur.trim()) lines.push(cur.trimEnd());
  return lines;
}
function rrect(ctx, x, y, w, h, r){
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function drawPoster(){
  const W = 1080, H = 1620, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const st = calcStreak(), name = LS.get('displayName', '') || '用户';
  const studied = LS.get('studiedWords', []).length, phr = LS.get('studiedPhrases', []).length;
  const xp = typeof totalXP === 'function' ? totalXP() : 0, lv = typeof userLevel === 'function' ? userLevel() : 1;
  const now = new Date(), wd = '日一二三四五六'[now.getDay()], pk = dailyPick().p;
  /* 背景 */
  let g = x.createLinearGradient(0, 0, W * .4, H); g.addColorStop(0, '#24396a'); g.addColorStop(.55, '#142039'); g.addColorStop(1, '#0b1424');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  let r = x.createRadialGradient(W * .9, H * .06, 0, W * .9, H * .06, 620); r.addColorStop(0, 'rgba(240,168,46,.42)'); r.addColorStop(1, 'rgba(240,168,46,0)');
  x.fillStyle = r; x.fillRect(0, 0, W, H);
  r = x.createRadialGradient(W * .05, H * .95, 0, W * .05, H * .95, 700); r.addColorStop(0, 'rgba(91,141,239,.30)'); r.addColorStop(1, 'rgba(91,141,239,0)');
  x.fillStyle = r; x.fillRect(0, 0, W, H);
  /* 顶部 */
  x.textBaseline = 'alphabetic'; x.fillStyle = '#fff'; x.font = `800 46px ${POSTER_FONT}`; x.fillText('五班英语角', 84, 150);
  x.fillStyle = 'rgba(255,255,255,.6)'; x.font = `500 28px ${POSTER_FONT}`; x.fillText('空保执勤英语 · 每日打卡', 84, 200);
  x.textAlign = 'right'; x.fillStyle = '#ffd987'; x.font = `800 84px ${POSTER_FONT}`; x.fillText(String(now.getDate()).padStart(2, '0'), W - 84, 160);
  x.fillStyle = 'rgba(255,255,255,.6)'; x.font = `500 28px ${POSTER_FONT}`; x.fillText(`${now.getMonth() + 1}月 · 星期${wd}`, W - 84, 204); x.textAlign = 'left';
  /* 连续打卡 */
  posterIcon(x, 'flame', W / 2 - 78, 300, 156, '#ffb23e', 1.5);
  x.textAlign = 'center'; x.fillStyle = '#fff'; x.font = `900 210px ${POSTER_FONT}`; x.fillText(String(st.streak), W / 2, 640);
  x.fillStyle = '#ffd987'; x.font = `700 44px ${POSTER_FONT}`; x.fillText(st.streak > 0 ? '天连续打卡' : '今天开始打卡', W / 2, 712);
  x.fillStyle = 'rgba(255,255,255,.7)'; x.font = `500 32px ${POSTER_FONT}`; x.fillText(`${name} · Lv.${lv} · 累计打卡 ${st.total} 天`, W / 2, 780);
  /* 三个数字 */
  const cards = [[studied, '已学单词'], [phr, '已学短语'], [xp, '经验值 XP']], cw = 292, gap = 30, cx0 = (W - (cw * 3 + gap * 2)) / 2;
  cards.forEach(([n, t], i) => {
    const cx = cx0 + i * (cw + gap), cy = 850;
    x.fillStyle = 'rgba(255,255,255,.09)'; rrect(x, cx, cy, cw, 190, 36); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = 2; x.stroke();
    x.fillStyle = '#fff'; x.font = `800 70px ${POSTER_FONT}`; x.fillText(String(n), cx + cw / 2, cy + 96);
    x.fillStyle = 'rgba(255,255,255,.62)'; x.font = `500 27px ${POSTER_FONT}`; x.fillText(t, cx + cw / 2, cy + 148);
  });
  /* 今日金句：卡片高度跟着内容走 */
  x.textAlign = 'left';
  x.font = `700 44px ${POSTER_FONT}`; const enL = wrapLines(x, pk.en, W - 252).slice(0, 3);
  x.font = `500 30px ${POSTER_FONT}`; const cnL = wrapLines(x, pk.cn, W - 252).slice(0, 2);
  const qh = 112 + enL.length * 58 + cnL.length * 44 + 44, qy = 1110 + Math.max(0, (330 - qh) / 2);
  x.fillStyle = 'rgba(255,255,255,.07)'; rrect(x, 84, qy, W - 168, qh, 40); x.fill();
  x.fillStyle = '#f0a82e'; x.font = `700 26px ${POSTER_FONT}`; x.fillText('今日金句', 126, qy + 62);
  x.fillStyle = '#fff'; x.font = `700 44px ${POSTER_FONT}`;
  let y = qy + 130; enL.forEach(l => { x.fillText(l, 126, y); y += 58; });
  x.fillStyle = 'rgba(255,255,255,.66)'; x.font = `500 30px ${POSTER_FONT}`; y += 4;
  cnL.forEach(l => { x.fillText(l, 126, y); y += 44; });
  /* 底部 */
  x.textAlign = 'center'; x.fillStyle = 'rgba(255,255,255,.5)'; x.font = `500 26px ${POSTER_FONT}`;
  x.fillText('坚持每天学一点，开口更有底气', W / 2, 1530);
  x.fillStyle = 'rgba(255,255,255,.3)'; x.font = `500 22px ${POSTER_FONT}`; x.fillText('五班英语角 · 内部学习', W / 2, 1572);
  return c;
}
let posterBlob = null, posterUrl = null;
function openPoster(){
  closePoster();
  let canvas; try{ canvas = drawPoster(); }catch(e){ toast('海报生成失败'); return; }
  const m = document.createElement('div'); m.id = 'posterMask'; m.className = 'modal-mask poster-mask';
  m.innerHTML = `<div class="poster-box"><div class="poster-img" id="posterImg"><div class="sub" style="color:#fff">生成中…</div></div>
    <div class="poster-tip">长按图片可保存</div>
    <div class="bk-row" style="margin-top:12rem"><button class="btn gold" onclick="posterShare()">${icon('share')} 分享 / 保存</button><button class="btn ghost" onclick="closePoster()">关闭</button></div></div>`;
  m.onclick = e => { if(e.target === m) closePoster(); };
  document.body.appendChild(m);
  canvas.toBlob(b => {
    if(!b || !document.getElementById('posterMask')) return;
    posterBlob = b; posterUrl = URL.createObjectURL(b);
    document.getElementById('posterImg').innerHTML = `<img src="${posterUrl}" alt="打卡海报">`;
  }, 'image/png');
}
function closePoster(){
  const m = document.getElementById('posterMask'); if(m) m.remove();
  if(posterUrl){ URL.revokeObjectURL(posterUrl); posterUrl = null; } posterBlob = null;
}
async function posterShare(){
  if(!posterBlob){ toast('海报还在生成'); return; }
  const name = `五班英语角打卡-${todayStr()}.png`, file = new File([posterBlob], name, { type: 'image/png' });
  try{
    if(navigator.canShare && navigator.canShare({ files: [file] })){ await navigator.share({ files: [file], title: '五班英语角打卡' }); return; }
  }catch(e){ if(e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = posterUrl; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  toast('已保存；微信里请长按图片保存');
}


/* =========================================================
   6. 微信内置浏览器适配 · 备份提醒
   同事多半是在微信里点链接打开的：微信里没有「添加到主屏幕」，本地数据也更容易丢，
   换到浏览器后还要重新输入邀请码——所以尽早引导，并给一条「先备份、再迁移」的路。
========================================================= */
const DAY_MS = 86400000;
function isWeChat(){ return /MicroMessenger|wxwork/i.test(navigator.userAgent); }
try{ if(!LS.get('firstUse', 0)) LS.set('firstUse', Date.now()); }catch(e){}   // 备份提醒从「第一次使用」起算，新用户不会一上来就被催

async function copyText(text){
  try{ await navigator.clipboard.writeText(text); return true; }catch(e){}
  const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;left:-999px;top:0;font-size:16px';
  document.body.appendChild(ta); ta.select(); try{ ta.setSelectionRange(0, text.length); }catch(e){}
  let ok = false; try{ ok = document.execCommand('copy'); }catch(e){}
  ta.remove(); return ok;
}
function pageUrl(){ return location.href.split('#')[0].split('?')[0]; }

function wxBannerHtml(){
  if(!isWeChat() || isStandalone()) return '';
  if(Date.now() - LS.get('wxTipAt', 0) < 3 * DAY_MS) return '';
  return `<div class="install-banner wx-banner" onclick="showWeChatGuide()">
    <div class="install-banner-ic">${icon('share')}</div>
    <div class="install-banner-text"><b>建议用浏览器打开本站</b><span>微信里学习记录容易丢，也不能添加到主屏幕</span></div>
    <button class="install-banner-btn">怎么做</button>
    <span class="install-banner-close" onclick="wxDismiss(event)">×</span>
  </div>`;
}
function wxDismiss(e){ if(e) e.stopPropagation(); LS.set('wxTipAt', Date.now()); refresh(); }
function showWeChatGuide(){
  if(document.getElementById('wxGuideMask')) return;
  const d = document.createElement('div'); d.id = 'wxGuideMask'; d.className = 'modal-mask';
  d.onclick = e => { if(e.target === d) closeWeChatGuide(); };
  const step = (n, t, sub) => `<div class="modal-step"><div class="modal-step-ic" style="font-weight:800;font-size:15px">${n}</div><div class="modal-step-txt"><b>${t}</b><div class="modal-step-sub">${sub}</div></div></div>`;
  d.innerHTML = `<div class="modal-card">
    <div class="modal-title">在浏览器里打开更稳妥</div>
    ${step(1, '点右上角「···」', '微信右上角的三个点')}
    ${step(2, '选「在浏览器打开」', 'iPhone 上也可能叫「在 Safari 中打开」「在默认浏览器打开」')}
    ${step(3, '再添加到主屏幕', '之后像 App 一样直接打开，学习记录也更稳')}
    <div class="modal-step-sub" style="margin:0 0 14rem;line-height:1.7">已经在微信里学过了？先点下面的「备份进度」，到浏览器里打开「我的 → 进度备份与恢复」粘贴就能带过去。浏览器里需要重新输入一次邀请码。</div>
    <button class="btn gold" onclick="closeWeChatGuide();openBackup()">备份进度</button>
    <button class="btn ghost" onclick="wxCopyUrl()">复制网址（粘贴到浏览器）</button>
    <button class="btn ghost" onclick="closeWeChatGuide()">知道了</button>
  </div>`;
  document.body.appendChild(d);
}
function closeWeChatGuide(){ const m = document.getElementById('wxGuideMask'); if(m) m.remove(); LS.set('wxTipAt', Date.now()); }
async function wxCopyUrl(){ toast((await copyText(pageUrl())) ? '网址已复制，粘贴到浏览器地址栏打开' : '复制失败，请点右上角「···」选「在浏览器打开」'); }

/* 超过一周没备份（已添加到主屏幕的放宽到两周），且已经有一定学习进度，首页提醒一次；关掉后 3 天内不再出现 */
function backupNudgeHtml(){
  const prog = LS.get('studiedWords', []).length + LS.get('studiedPhrases', []).length + Object.keys(LS.get('drillMastery', {})).length;
  if(prog < 15) return '';
  const now = Date.now(), lb = LS.get('lastBackup', 0), last = Math.max(lb, LS.get('firstUse', now));
  if(now - last < (isStandalone() ? 14 : 7) * DAY_MS) return '';
  if(now - LS.get('backupNudgeAt', 0) < 3 * DAY_MS) return '';
  const days = Math.floor((now - last) / DAY_MS);
  return `<div class="install-banner" onclick="openBackup()">
    <div class="install-banner-ic">${icon('download')}</div>
    <div class="install-banner-text"><b>${lb ? `已 ${days} 天没备份进度` : '学习进度还没备份过'}</b><span>换手机、清理浏览器都会丢 · 30 秒就能备份</span></div>
    <button class="install-banner-btn">去备份</button>
    <span class="install-banner-close" onclick="nudgeDismiss(event)">×</span>
  </div>`;
}
function nudgeDismiss(e){ if(e) e.stopPropagation(); LS.set('backupNudgeAt', Date.now()); refresh(); }
/* 首页顶部同一时间只露一条提示：微信引导 > 安装到主屏幕 > 备份提醒 */
function topBannerHtml(){ return wxBannerHtml() || installBannerHtml() || backupNudgeHtml(); }

/* =========================================================
   7. 反馈 / 纠错
   没有服务器，所以做成「写好一段话 → 一键复制 → 粘贴到微信发给管理员」。
   文字完整显示在输入框里，使用者可以先改、先删（包括末尾的版本和邀请码编号）再复制。
========================================================= */
function fbFooter(){ const a = window.ACCESS || {}; return `—\n五班英语角 v${APP_VERSION}${a.codeId ? ' · 编号 ' + a.codeId : ''}`; }
function openFeedback(kind, a, b){
  closeFeedback();
  const body = kind === 'miss' ? `【缺词】想查「${a}」，没有搜到。\n使用场景：`
    : kind === 'fix' ? `【纠错】\n英文：${a}\n中文：${b || ''}\n哪里不对：`
    : '【意见】\n';
  const d = document.createElement('div'); d.id = 'fbMask'; d.className = 'modal-mask';
  d.onclick = e => { if(e.target === d) closeFeedback(); };
  d.innerHTML = `<div class="modal-card fb-card">
    <div class="modal-title" style="margin-bottom:10rem">反馈给管理员</div>
    <div class="bk-sub" style="margin:0;text-align:center">开头已写好，补充几个字就行。点「复制」，到微信里粘贴发出去。</div>
    <textarea id="fbText" class="fb-area" spellcheck="false">${esc(body + '\n\n' + fbFooter())}</textarea>
    <div class="bk-row"><button class="btn gold" onclick="fbCopy()">${icon('copy')} 复制</button><button class="btn ghost" onclick="closeFeedback()">取消</button></div>
  </div>`;
  document.body.appendChild(d);
}
function closeFeedback(){ const m = document.getElementById('fbMask'); if(m) m.remove(); }
async function fbCopy(){
  const t = document.getElementById('fbText'); if(!t) return;
  if(await copyText(t.value)){ closeFeedback(); toast('已复制，去微信粘贴发给管理员'); }
  else { t.focus(); t.select(); toast('请长按文字，选「全选」→「拷贝」'); }
}
function feedbackEl(el){ openFeedback('fix', el.dataset.en, el.dataset.cn); }
/* 句子 / 单词下方的小字入口 */
function fbLink(en, cn){ return `<div class="fb-mini"><span ${lnData(en, cn)} role="button" onclick="feedbackEl(this)">发现错误？点此纠错</span></div>`; }
