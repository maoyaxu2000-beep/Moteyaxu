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

function srsDueKeys(m){
  m = m || srsAll(); const td = todayStr(), out = [];
  for(const k in m){ if(m[k].d <= td) out.push(k); }
  out.sort((a, b) => (m[a].d < m[b].d ? -1 : m[a].d > m[b].d ? 1 : m[a].b - m[b].b));
  return out;
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
  const extra = (s.revealed && it.type !== 'w' && typeof lineTools === 'function') ? lineTools(it.p.en, it.p.cn, true) : '';
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
