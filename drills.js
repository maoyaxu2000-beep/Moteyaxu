/* ===========================================================
   处置实战口语 —— 30 个机上处置情景 · 分类学习
   三种学法：
   · 对照学习：中英对照逐句听、整段连播（模拟现场喊话节奏）
   · 看中文说英文：给出中文，先自己开口说，再看答案、听原声
   · 听英文说中文：只放原声，先说出意思，再看中英文
   练习结果记在本机：「会了」计入掌握进度，「还不会」进入待复习
=========================================================== */
'use strict';
const DRILLS = (window.DATA && window.DATA.drills) || [];

/* 给每句话一个稳定 id：情景 id + 序号 */
const DRILL_SCENES = [];
const DRILL_LINES = {};          // id -> {id, cn, en, scene, group}
DRILLS.forEach((c, ci) => c.scenes.forEach(s => {
  s.ci = ci; let k = 0;
  s.groups.forEach(g => g.lines.forEach(l => {
    l.id = `${s.id}-${k++}`; l.scene = s; l.group = g;
    DRILL_LINES[l.id] = l;
  }));
  s.lineIds = s.groups.flatMap(g => g.lines.map(l => l.id));
  DRILL_SCENES.push(s);
}));
const DRILL_TOTAL = Object.keys(DRILL_LINES).length;

function drillMastery(){ return LS.get('drillMastery', {}); }
function drillWeak(){ return LS.get('drillWeak', {}); }
function markDrill(id, ok){
  const m = drillMastery(), w = drillWeak();
  if(ok){ m[id] = Date.now(); delete w[id]; }
  else  { w[id] = Date.now(); delete m[id]; }
  LS.set('drillMastery', m); LS.set('drillWeak', w);
}
function sceneDone(s, m){ m = m || drillMastery(); return s.lineIds.filter(id => m[id]).length; }

/* ---------------- 首页：6 个分类 ---------------- */
function openDrills(){ stopDrillPlay(); navigate(renderDrillHome, '处置实战口语', ''); }
function renderDrillHome(){
  const m = drillMastery(), w = drillWeak();
  const done = Object.keys(DRILL_LINES).filter(id => m[id]).length;
  const weakN = Object.keys(DRILL_LINES).filter(id => w[id]).length;
  const pct = DRILL_TOTAL ? Math.round(done / DRILL_TOTAL * 100) : 0;
  let html = `<div class="view">
    <div class="welcome-card" style="padding:30rem">
      <div style="font-size:18px;font-weight:800;">${icon('shield')} 处置实战口语</div>
      <div style="font-size:12px;opacity:.85;margin-top:8rem">${DRILL_SCENES.length} 个机上处置情景 · ${DRILL_TOTAL} 句标准中英用语</div>
      <div class="drill-prog" style="margin-top:22rem"><i style="width:${pct}%"></i></div>
      <div style="font-size:12px;opacity:.9;margin-top:10rem">已掌握 ${done} / ${DRILL_TOTAL} 句</div>
    </div>
    <div class="drill-howto">
      <div><b>对照学习</b><span>逐句听原声，整段连播</span></div>
      <div><b>看中文说英文</b><span>先开口，再对答案</span></div>
      <div><b>听英文说中文</b><span>练听力反应</span></div>
    </div>`;
  if(weakN){
    html += `<button class="btn amber" style="margin-bottom:24rem" onclick="startDrillReview()">复习还不会的 ${weakN} 句</button>`;
  }
  DRILLS.forEach((c, ci) => {
    const lines = c.scenes.reduce((a, s) => a + s.lineIds.length, 0);
    const got = c.scenes.reduce((a, s) => a + sceneDone(s, m), 0);
    html += `<div class="story-list-card" onclick="openDrillClass(${ci})">
      <div class="story-list-icon drill-ic-${c.key}">${icon(c.icon)}</div>
      <div class="li-main"><div class="li-en">${esc(c.cls)}</div><div class="li-cn">${esc(c.clsEn)}</div><div class="li-cn" style="margin-top:4rem">${c.scenes.length} 个情景 · 已掌握 ${got}/${lines} 句</div></div>
      <span class="func-arrow">›</span>
    </div>`;
  });
  return html + '<div class="safe"></div></div>';
}

/* ---------------- 分类：情景列表 ---------------- */
function openDrillClass(ci){ navigate(() => renderDrillClass(ci), DRILLS[ci].cls, ''); }
function renderDrillClass(ci){
  const c = DRILLS[ci], m = drillMastery();
  let html = `<div class="view"><div class="section-sub" style="margin-bottom:18rem">${esc(c.clsEn)}</div>`;
  c.scenes.forEach(s => {
    const n = s.lineIds.length, d = sceneDone(s, m);
    html += `<div class="drill-scene-card" onclick="openDrillScene('${s.id}')">
      <div class="drill-no">${s.no}</div>
      <div class="li-main">
        <div class="li-en">${esc(s.title)}</div>
        <div class="li-cn">${esc(s.titleEn)}</div>
        <div class="drill-prog sm"><i style="width:${n ? Math.round(d / n * 100) : 0}%"></i></div>
      </div>
      <span class="badge-cnt">${d}/${n}</span>
    </div>`;
  });
  return html + '<div class="safe"></div></div>';
}

/* ---------------- 情景详情：三种学法 ---------------- */
let drillState = null;   // {sceneId, mode, ...}
function openDrillScene(id){
  const s = DRILL_SCENES.find(x => x.id === id); if(!s) return;
  stopDrillPlay();
  drillState = { sceneId:id, mode:'read', briefEn:false };
  prefetchSceneAudio(s);
  navigate(renderDrillScene, s.title, '');
}
function drillScene(){ return DRILL_SCENES.find(x => x.id === drillState.sceneId); }
function setDrillMode(mode){
  stopDrillPlay();
  const s = drillScene();
  if(mode === 'read'){ drillState.mode = 'read'; refresh(); return; }
  startDrillPractice(mode, s.lineIds, true);
  refresh();
  if(mode === 'en2cn') speakCurrentDrill();   // 在点击手势里直接播，iOS 才允许出声
}
function renderDrillScene(){
  const s = drillScene();
  const mode = drillState.mode;
  const tabs = `<div class="seg">
    <button class="${mode==='read'?'active':''}" onclick="setDrillMode('read')">对照学习</button>
    <button class="${mode==='cn2en'?'active':''}" onclick="setDrillMode('cn2en')">看中文说英文</button>
    <button class="${mode==='en2cn'?'active':''}" onclick="setDrillMode('en2cn')">听英文说中文</button>
  </div>`;
  if(mode !== 'read') return `<div class="view">${tabs}${renderDrillPractice()}<div class="safe"></div></div>`;

  const m = drillMastery();
  let html = `<div class="view">
    <div class="drill-head">
      <div class="drill-head-en">${esc(s.titleEn)}</div>
      ${s.sub ? `<div class="drill-head-sub">${esc(s.sub)}</div>` : ''}
      ${s.to ? `<div class="drill-to">对象：${esc(s.to)}</div>` : ''}
    </div>
    ${tabs}`;
  if(s.brief.length){
    html += `<div class="drill-brief">
      <div class="drill-brief-k">情景说明 <span onclick="drillState.briefEn=!drillState.briefEn;refresh()">${drillState.briefEn ? '只看中文' : '看英文'}</span></div>
      ${s.brief.map(b => `<div>${esc(b.cn)}</div>${drillState.briefEn && b.en ? `<div class="drill-brief-en">${esc(b.en)}</div>` : ''}`).join('')}
    </div>`;
  }
  html += `<div class="drill-tools">
    <button class="chip chip-play" id="drillPlayBtn" onclick="toggleDrillPlay()">${chipIcon(false)} 整段连播</button>
    <span class="section-sub">点英文可单句播放</span>
  </div>`;
  s.groups.forEach(g => {
    if(g.cn) html += `<div class="part-title">${esc(g.cn)} <span class="en">${esc(g.en)}</span></div>`;
    g.lines.forEach(l => {
      html += `<div class="list-item drill-line${m[l.id] ? ' got' : ''}" id="dl-${l.id}">
        <div class="li-main">
          <div class="li-en speakable" onclick="speak(${jsAttr(l.en)})">${esc(l.en)}</div>
          <div class="li-cn">${esc(l.cn)}</div>
        </div>
        <div class="play" ${pb(l.en)}>${PI}</div>
      </div>`;
    });
  });
  html += `<button class="btn gold" style="margin-top:20rem" onclick="setDrillMode('cn2en')">开始练习：看中文说英文</button>`;
  return html + '<div class="safe"></div></div>';
}

/* 整段连播：按顺序播放全部英文，当前句高亮并滚到可见 */
let drillPlay = null;
function toggleDrillPlay(){
  if(drillPlay){ stopDrillPlay(); return; }
  const s = drillScene();
  drillPlay = { ids:s.lineIds.slice(), k:0 };
  const btn = document.getElementById('drillPlayBtn'); if(btn) btn.innerHTML = chipIcon(true) + ' 暂停连播';
  playNextDrill();
}
function playNextDrill(){
  if(!drillPlay) return;
  document.querySelectorAll('.drill-line.playing').forEach(e => e.classList.remove('playing'));
  if(drillPlay.k >= drillPlay.ids.length){ stopDrillPlay(); return; }
  const id = drillPlay.ids[drillPlay.k++];
  const el = document.getElementById('dl-' + id);
  if(el){ el.classList.add('playing'); el.scrollIntoView({ behavior:'smooth', block:'center' }); }
  const mine = drillPlay;
  speakChain = true;
  speak(DRILL_LINES[id].en, null, () => { if(drillPlay === mine) setTimeout(playNextDrill, 600); });
  speakChain = false;
}
function stopDrillPlay(){
  if(!drillPlay) return;
  drillPlay = null;
  stopSpeak();
  document.querySelectorAll('.drill-line.playing').forEach(e => e.classList.remove('playing'));
  const btn = document.getElementById('drillPlayBtn'); if(btn) btn.innerHTML = chipIcon(false) + ' 整段连播';
}

function drillPlayInterrupted(){
  if(!drillPlay) return;
  drillPlay = null;
  document.querySelectorAll('.drill-line.playing').forEach(e => e.classList.remove('playing'));
  const btn = document.getElementById('drillPlayBtn'); if(btn) btn.innerHTML = chipIcon(false) + ' 整段连播';
}

/* ---------------- 练习（两种方向共用） ---------------- */
function startDrillPractice(mode, ids, inScene){
  drillState = Object.assign(drillState || {}, {
    mode, ids:ids.slice(), idx:0, revealed:false, ok:[], miss:[], inScene:!!inScene
  });
}
function renderDrillPractice(){
  const st = drillState;
  if(st.idx >= st.ids.length) return renderDrillSummary();
  const l = DRILL_LINES[st.ids[st.idx]];
  const cn2en = st.mode === 'cn2en';
  const pct = Math.round(st.idx / st.ids.length * 100);
  let html = `<div class="progress-txt"><span>${st.idx + 1} / ${st.ids.length}</span><span>${esc(l.scene.title)}</span></div>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    <div class="ex-card drill-card">
      <div class="ex-kicker">${cn2en ? '看中文，先用英文说出来' : '听原声，先说出中文意思'}</div>`;
  if(cn2en){
    html += `<div class="drill-q-cn">${esc(l.cn)}</div>`;
  } else {
    html += `<div class="drill-listen" ${pb(l.en)}>${PI}</div>
      <div class="ex-sub">点播放键可重听</div>`;
  }
  if(st.revealed){
    html += `<div class="drill-answer">
      ${cn2en ? '' : `<div class="drill-a-cn">${esc(l.cn)}</div>`}
      <div class="drill-a-en speakable" onclick="speakCurrentDrill()">${esc(l.en)} <span class="pbtn-in" ${pb(l.en)}>${PI}</span></div>
    </div>`;
  }
  html += `</div>`;
  if(!st.revealed){
    html += `<button class="btn gold" onclick="revealDrill()">${cn2en ? '我说完了，看答案' : '我想好了，看答案'}</button>`;
  } else {
    html += `<div class="drill-judge">
      <button class="btn ghost" onclick="judgeDrill(false)">还不会</button>
      <button class="btn gold" onclick="judgeDrill(true)">会了 ✓</button>
    </div>`;
  }
  return html;
}
function speakCurrentDrill(){
  const st = drillState; if(!st || st.idx >= st.ids.length) return;
  speak(DRILL_LINES[st.ids[st.idx]].en);
}
function revealDrill(){
  drillState.revealed = true;
  refresh();
  if(drillState.mode === 'cn2en') speakCurrentDrill();
}
function judgeDrill(ok){
  const st = drillState;
  const id = st.ids[st.idx];
  markDrill(id, ok);
  (ok ? st.ok : st.miss).push(id);
  st.idx++; st.revealed = false;
  refresh();
  if(st.idx < st.ids.length && st.mode === 'en2cn') speakCurrentDrill();
  else stopSpeak();
}
function renderDrillSummary(){
  const st = drillState;
  let html = `<div style="text-align:center">
    <div style="font-size:56rem;margin:20rem 0">${st.miss.length ? '💪' : '🎉'}</div>
    <div style="font-size:18px;font-weight:800">本轮练习完成</div>
    <div class="result-stat-row">
      <div class="result-stat"><b>${st.ok.length}</b><span>会了</span></div>
      <div class="result-stat"><b>${st.miss.length}</b><span>还不会</span></div>
    </div></div>`;
  if(st.miss.length){
    html += `<div class="card" style="margin:10rem 0 24rem">
      <div style="font-size:13px;font-weight:700;margin-bottom:10rem">📌 还不会的句子（已加入待复习）</div>
      ${st.miss.map(id => { const l = DRILL_LINES[id]; return `<div class="drill-miss" onclick="speak(${jsAttr(l.en)})"><div>${esc(l.en)}</div><div class="li-cn">${esc(l.cn)}</div></div>`; }).join('')}
    </div>
    <button class="btn gold" onclick="retryDrillMiss()">再练这 ${st.miss.length} 句</button>
    <div style="height:16rem"></div>`;
  }
  html += st.inScene
    ? `<button class="btn ghost" onclick="setDrillMode('read')">回到对照学习</button>`
    : `<button class="btn ghost" onclick="goBack()">返回</button>`;
  return html;
}
function retryDrillMiss(){
  const st = drillState;
  startDrillPractice(st.mode, st.miss, st.inScene);
  refresh();
  if(st.mode === 'en2cn') speakCurrentDrill();
}

/* 跨情景复习：所有「还不会」的句子 */
function startDrillReview(){
  const w = drillWeak();
  const ids = Object.keys(w).filter(id => DRILL_LINES[id]).sort((a, b) => w[a] - w[b]);
  if(!ids.length){ toast('没有待复习的句子'); return; }
  stopDrillPlay();
  drillState = { sceneId: DRILL_LINES[ids[0]].scene.id };
  startDrillPractice('cn2en', ids, false);
  navigate(() => `<div class="view">${renderDrillPractice()}<div class="safe"></div></div>`, '复习还不会的句子', '');
}

/* 打开情景时后台预取本情景的语音，之后断网也能听 */
function prefetchSceneAudio(s){
  if(!('caches' in window) || !navigator.onLine) return;
  const acc = voiceAccent() === 'US' ? 'us' : 'gb';
  s.lineIds.forEach((id, i) => {
    const key = audioKey(DRILL_LINES[id].en);
    if(hasAudio(acc, key) && window.ACCESS) setTimeout(() => fetch(`audio/${acc}/${key}.bin?k=${window.ACCESS.kid}`).catch(() => {}), 150 * i);
  });
}

/* 离开页面时停止连播 */
const _goBackDrill = window.goBack;
window.goBack = function(){ stopDrillPlay(); return _goBackDrill.apply(this, arguments); };
