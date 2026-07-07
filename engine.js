/* ===========================================================
   engine.js —— 闯关地图 + 6 种题型练习引擎 + 情景剧本播放器
   依赖 app.js 中的 LS / speak / toast / esc / jsAttr / navigate / goBack /
   refresh / switchTab / shuffle 等公共函数（同页面全局作用域共享）。
=========================================================== */
'use strict';

const UNITS = window.DATA.units;
const LESSON_SIZE = window.DATA.LESSON_SIZE || 7;
const SCENARIOS = window.DATA.scenarios;

/* ---------------- 地图数据构建 ---------------- */
function chunk(arr, size){ const out=[]; for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }

let MAP_NODES = null;
function buildMapNodes(){
  if(MAP_NODES) return MAP_NODES;
  const nodes = [];
  UNITS.forEach(u=>{
    const words = WORDS.filter(w=>u.categories.includes(w.category));
    const lessons = chunk(words, LESSON_SIZE);
    lessons.forEach((ws,i)=>{
      nodes.push({ type:'lesson', unitId:u.id, unit:u, id:u.id+'-l'+(i+1), index:i, words:ws, label:u.title+' · '+(i+1) });
    });
    if(u.story){
      const sc = SCENARIOS.find(s=>s.id===u.story);
      if(sc) nodes.push({ type:'story', unitId:u.id, unit:u, id:u.story, scenario:sc, label:sc.title });
    }
  });
  MAP_NODES = nodes;
  return nodes;
}
function lessonProgress(){ return LS.get('lessonProgress',{}); }
function saveLessonProgress(id, data){ const p=lessonProgress(); p[id]=data; LS.set('lessonProgress',p); }
function storyProgress(){ return LS.get('storyProgress',{}); }
function saveStoryProgress(id){ const p=storyProgress(); p[id]=true; LS.set('storyProgress',p); }
function nodeCompleted(node){
  if(node.type==='lesson'){ const p=lessonProgress()[node.id]; return !!(p && p.stars>0); }
  return !!storyProgress()[node.id];
}
function nodeUnlocked(index, nodes){
  if(index===0) return true;
  return nodeCompleted(nodes[index-1]);
}
function totalXP(){ return LS.get('xp',0); }
function addXP(n){ LS.set('xp', totalXP()+n); }
function userLevel(){ return 1 + Math.floor(totalXP()/150); }

/* ---------------- 地图渲染 ---------------- */
function renderMap(){
  const nodes = buildMapNodes();
  const xp = totalXP(), level = userLevel();
  let html = `<div class="view">
    <div class="welcome-card" style="padding:28rem 26rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:18px;font-weight:800;">闯关地图</div>
          <div style="font-size:11px;opacity:.8;margin-top:4rem;">Lv.${level} · 累计 ${xp} XP</div>
        </div>
        <button class="chip" style="background:rgba(255,255,255,.15);color:#fff;border:none;" onclick="openFreeStudy()">自由学习模式</button>
      </div>
    </div>`;

  let currentUnit = null;
  nodes.forEach((node, i)=>{
    if(node.unitId !== currentUnit){
      currentUnit = node.unitId;
      const u = node.unit;
      const unitLessons = nodes.filter(n=>n.unitId===u.id);
      const doneCount = unitLessons.filter(nodeCompleted).length;
      const unitUnlocked = nodeUnlocked(i, nodes);
      html += `<div class="map-unit">
        <div class="map-unit-head ${unitUnlocked?'':'locked'}">
          <div class="map-unit-icon">${icon(u.icon)}</div>
          <div>
            <div class="map-unit-title">${esc(u.title)}</div>
            <div class="map-unit-sub">${esc(u.titleEn)}</div>
          </div>
          <div class="map-unit-progress">${doneCount}/${unitLessons.length}</div>
        </div>
        <div class="map-path">`;
    }
    const unlocked = nodeUnlocked(i, nodes);
    const done = nodeCompleted(node);
    const prog = node.type==='lesson' ? lessonProgress()[node.id] : null;
    const stars = prog ? prog.stars : 0;
    const cls = done ? 'done' : (unlocked ? '' : 'locked');
    const shape = node.type==='story' ? ' story' : '';
    const inner = node.type==='story' ? icon('alert') : (done ? icon('check') : (unlocked ? (node.index+1) : icon('lock')));
    html += `<div class="map-node-row">
      <div class="map-node ${cls}${shape}" onclick="${unlocked? (node.type==='story'?`openStory('${node.id}')`:`openLesson('${node.id}')`) : `toast('请先完成前面的关卡')`}">
        ${inner}
        ${node.type==='lesson' && done ? `<div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>` : ''}
      </div>
    </div>
    <div class="map-node-label">${esc(node.type==='story'?('情景剧本 · '+node.scenario.title):node.label)}</div>`;
    const isLastOfUnit = (i===nodes.length-1) || nodes[i+1].unitId !== node.unitId;
    if(!isLastOfUnit) html += `<div class="map-connector ${done?'done':''}"></div>`;
    if(isLastOfUnit) html += `</div></div>`;
  });
  html += '<div class="safe"></div></div>';
  return html;
}
function openFreeStudy(){ navigate(renderWordsMenu, '自由学习模式', ''); }

/* ---------------- 关卡练习引擎 ---------------- */
let lessonSession = null;

function openLesson(lessonId){
  const node = buildMapNodes().find(n=>n.id===lessonId && n.type==='lesson');
  if(!node) return;
  lessonSession = { node, exercises: buildExercises(node.words), idx:0, hearts:5, correct:0, failed:false };
  navigate(renderLessonView, node.unit.title, '');
}

function buildExercises(words){
  const pool = words.slice();
  const ex = [];
  const wc = pool.length;
  // 1-2 choice (en->cn / cn->en)
  if(wc>=1) ex.push(makeChoiceExercise(pool[0 % wc], 'en2cn'));
  if(wc>=2) ex.push(makeChoiceExercise(pool[1 % wc], 'cn2en'));
  // listening
  if(wc>=3) ex.push(makeListeningExercise(pool[2 % wc]));
  // spelling x2
  if(wc>=1) ex.push(makeSpellingExercise(pool[3 % wc] || pool[0]));
  if(wc>=2) ex.push(makeSpellingExercise(pool[4 % wc] || pool[1]));
  // matching
  if(wc>=3) ex.push(makeMatchExercise(pool));
  // ordering (sentence)
  const orderWord = pool.find(w=>w.example && w.example.split(' ').length>=4) || pool[0];
  if(orderWord) ex.push(makeOrderExercise(orderWord));
  // scenario judgment
  ex.push(makeScenarioExercise());
  return shuffle(ex);
}
function randomDistractors(exclude, n, field){
  const pool = WORDS.filter(w=>w.word!==exclude.word);
  return shuffle(pool).slice(0,n).map(w=>field==='meaning'?w.meaning:w.word);
}
function makeChoiceExercise(word, mode){
  const distract = randomDistractors(word, 3, mode==='en2cn'?'meaning':'word');
  const correct = mode==='en2cn' ? word.meaning : word.word;
  const opts = shuffle([correct, ...distract]);
  return { type:'choice', mode, word, q: mode==='en2cn'?word.word:word.meaning, ph: mode==='en2cn'?(word.phonetic||''):'', opts, answer: correct };
}
function makeListeningExercise(word){
  const distract = randomDistractors(word, 3, 'meaning');
  const opts = shuffle([word.meaning, ...distract]);
  return { type:'listening', word, opts, answer: word.meaning };
}
function makeSpellingExercise(word){
  return { type:'spelling', word };
}
function makeMatchExercise(pool){
  const pairs = shuffle(pool).slice(0, Math.min(4, pool.length));
  const left = pairs.map((w,i)=>({ pid:i, text:w.word }));
  const right = shuffle(pairs.map((w,i)=>({ pid:i, text:w.meaning })));
  return { type:'match', pairs, left: shuffle(left), right, matched:[], selLeft:null, selRight:null };
}
function makeOrderExercise(word){
  const clean = word.example.replace(/\.$/,'');
  const tokens = clean.split(' ');
  return { type:'order', word, tokens, shuffled: shuffle(tokens), placed:[] };
}
function makeScenarioExercise(){
  const cats = SPEAKING;
  const cat = cats[Math.floor(Math.random()*cats.length)];
  const correct = cat.list[Math.floor(Math.random()*cat.list.length)];
  const others = [];
  while(others.length<3){
    const c2 = cats[Math.floor(Math.random()*cats.length)];
    const p2 = c2.list[Math.floor(Math.random()*c2.list.length)];
    if(p2.en!==correct.en && !others.find(o=>o.en===p2.en)) others.push(p2);
  }
  const opts = shuffle([correct, ...others].map(o=>o.en));
  return { type:'scenario', scene: cat.category, prompt: correct.title, opts, answer: correct.en };
}

function renderLessonView(){
  const s = lessonSession;
  if(!s) return `<div class="view"><div class="empty">会话已结束</div></div>`;
  if(s.done) return renderLessonResult();
  if(s.hearts<=0) return renderLessonFail();
  const ex = s.exercises[s.idx];
  const pct = Math.round(s.idx/s.exercises.length*100);
  let body = '';
  if(ex.type==='choice') body = renderChoiceExercise(ex);
  else if(ex.type==='listening') body = renderListeningExercise(ex);
  else if(ex.type==='spelling') body = renderSpellingExercise(ex);
  else if(ex.type==='match') body = renderMatchExercise(ex);
  else if(ex.type==='order') body = renderOrderExercise(ex);
  else if(ex.type==='scenario') body = renderScenarioExercise(ex);
  return `<div class="view">
    <div class="progress-txt"><span>${s.idx+1} / ${s.exercises.length}</span><span>${'♥'.repeat(s.hearts)}</span></div>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    ${body}
    <div class="safe"></div>
  </div>`;
}
function refreshLesson(){ refresh(); }

/* ---- choice ---- */
function renderChoiceExercise(ex){
  return `<div class="ex-card">
    <div class="ex-kicker">选择题 · ${ex.mode==='en2cn'?'看英文选中文':'看中文选英文'}</div>
    <div class="ex-q${ex.mode==='en2cn'?' speakable':''}" ${ex.mode==='en2cn'?`onclick="speak(${jsAttr(ex.q)})"`:''}>${esc(ex.q)}</div>
    ${ex.ph?`<div class="ex-sub">${esc(ex.ph)} <span onclick="speak(${jsAttr(ex.word.word)})">🔊</span></div>`:''}
  </div>
  <div id="exOpts">${ex.opts.map((o,i)=>`<div class="ex-opt" onclick="answerChoice(${i})"><span class="idx">${'ABCD'[i]}</span><span>${esc(o)}</span></div>`).join('')}</div>`;
}
function answerChoice(i){
  const ex = lessonSession.exercises[lessonSession.idx];
  if(ex.answered) return; ex.answered=true;
  const opt = ex.opts[i];
  if(ex.mode==='cn2en') speak(opt);
  const ok = opt===ex.answer;
  document.querySelectorAll('#exOpts .ex-opt').forEach((el,idx)=>{
    if(ex.opts[idx]===ex.answer) el.classList.add('correct');
    else if(idx===i) el.classList.add('wrong');
  });
  handleResult(ok, ()=>nextExercise());
}

/* ---- listening ---- */
function renderListeningExercise(ex){
  setTimeout(()=>speak(ex.word.word),300);
  return `<div class="ex-card">
    <div class="ex-kicker">听音辨义</div>
    <div class="flash-play" style="margin:0 auto;" onclick="speak(${jsAttr(ex.word.word)})">🔊</div>
    <div class="ex-sub" style="margin-top:16rem;">点击喇叭再听一次，选出正确释义</div>
  </div>
  <div id="exOpts">${ex.opts.map((o,i)=>`<div class="ex-opt" onclick="answerListening(${i})"><span class="idx">${'ABCD'[i]}</span><span>${esc(o)}</span></div>`).join('')}</div>`;
}
function answerListening(i){
  const ex = lessonSession.exercises[lessonSession.idx];
  if(ex.answered) return; ex.answered=true;
  const ok = ex.opts[i]===ex.answer;
  document.querySelectorAll('#exOpts .ex-opt').forEach((el,idx)=>{
    if(ex.opts[idx]===ex.answer) el.classList.add('correct');
    else if(idx===i) el.classList.add('wrong');
  });
  handleResult(ok, ()=>nextExercise());
}

/* ---- spelling ---- */
function renderSpellingExercise(ex){
  const blanked = ex.word.example.replace(new RegExp(ex.word.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'), '_____');
  return `<div class="ex-card">
    <div class="ex-kicker">拼写填空</div>
    <div class="ex-q" style="font-size:18px;">${esc(ex.word.meaning)}</div>
    <div class="ex-sub">${esc(blanked)}</div>
    <input id="spellIn" class="ex-input" placeholder="输入英文单词/短语" autocomplete="off" onkeydown="if(event.key==='Enter')answerSpelling()">
  </div>
  <button class="btn gold" onclick="answerSpelling()">检查答案</button>
  <div id="spellFeedback"></div>`;
}
function answerSpelling(){
  const ex = lessonSession.exercises[lessonSession.idx];
  if(ex.answered) return; ex.answered=true;
  const input = document.getElementById('spellIn');
  const val = (input.value||'').trim().toLowerCase();
  const ok = val === ex.word.word.toLowerCase();
  input.classList.add(ok?'correct':'wrong');
  input.disabled = true;
  document.getElementById('spellFeedback').innerHTML = ok
    ? `<div class="ex-feedback good">✓ 正确！${esc(ex.word.word)}</div>`
    : `<div class="ex-feedback bad">正确答案：${esc(ex.word.word)}</div>`;
  handleResult(ok, ()=>nextExercise(), true);
}

/* ---- matching ---- */
function renderMatchExercise(ex){
  return `<div class="ex-card">
    <div class="ex-kicker">连线配对</div>
    <div class="ex-sub">点击左右两侧配对相同含义的词语</div>
  </div>
  <div class="ex-match-grid">
    <div>${ex.left.map((l,i)=>`<div class="ex-match-item ${matchCls(ex,'left',i)}" onclick="tapMatch('left',${i})">${esc(l.text)}</div>`).join('')}</div>
    <div>${ex.right.map((r,i)=>`<div class="ex-match-item ${matchCls(ex,'right',i)}" onclick="tapMatch('right',${i})">${esc(r.text)}</div>`).join('')}</div>
  </div>`;
}
function matchCls(ex, side, i){
  const item = side==='left'?ex.left[i]:ex.right[i];
  if(ex.matched.includes(item.pid)) return 'matched';
  if(side==='left' && ex.selLeft===i) return 'selected';
  if(side==='right' && ex.selRight===i) return 'selected';
  return '';
}
function tapMatch(side, i){
  const ex = lessonSession.exercises[lessonSession.idx];
  const item = side==='left'?ex.left[i]:ex.right[i];
  if(ex.matched.includes(item.pid)) return;
  if(side==='left') speak(item.text);
  if(side==='left') ex.selLeft = i; else ex.selRight = i;
  refresh();
  if(ex.selLeft!=null && ex.selRight!=null){
    const l = ex.left[ex.selLeft], r = ex.right[ex.selRight];
    if(l.pid===r.pid){
      ex.matched.push(l.pid);
      ex.selLeft=null; ex.selRight=null;
      refresh();
      if(ex.matched.length===ex.left.length) handleResult(true, ()=>nextExercise());
    } else {
      toast('配对错误');
      loseHeart();
      setTimeout(()=>{ ex.selLeft=null; ex.selRight=null; refreshLesson(); },500);
    }
  }
}

/* ---- ordering ---- */
function renderOrderExercise(ex){
  return `<div class="ex-card">
    <div class="ex-kicker">排序造句</div>
    <div class="ex-sub">${esc(ex.word.exampleCn||'')}</div>
  </div>
  <div class="ex-tokens" id="orderPlaced">${ex.placed.map((t,i)=>`<span class="ex-token" onclick="unplaceToken(${i})">${esc(t)}</span>`).join('')}</div>
  <div class="ex-bank" id="orderBank">${ex.shuffled.map((t,i)=>`<span class="ex-chip" onclick="placeToken(${i})">${esc(t)}</span>`).join('')}</div>
  <button class="btn gold" style="margin-top:24rem;" onclick="answerOrder()">检查答案</button>
  <div id="orderFeedback"></div>`;
}
function placeToken(i){
  const ex = lessonSession.exercises[lessonSession.idx];
  const t = ex.shuffled[i];
  speak(t);
  ex.placed.push(t);
  ex.shuffled.splice(i,1);
  refresh();
}
function unplaceToken(i){
  const ex = lessonSession.exercises[lessonSession.idx];
  const t = ex.placed[i];
  ex.placed.splice(i,1);
  ex.shuffled.push(t);
  refresh();
}
function answerOrder(){
  const ex = lessonSession.exercises[lessonSession.idx];
  if(ex.answered) return;
  if(ex.placed.length!==ex.tokens.length){ toast('请先摆放完整个句子'); return; }
  ex.answered=true;
  const ok = ex.placed.join(' ').toLowerCase()===ex.tokens.join(' ').toLowerCase();
  document.getElementById('orderFeedback').innerHTML = ok
    ? `<div class="ex-feedback good">✓ 正确！${esc(ex.tokens.join(' '))}.</div>`
    : `<div class="ex-feedback bad">正确顺序：${esc(ex.tokens.join(' '))}.</div>`;
  handleResult(ok, ()=>nextExercise(), true);
}

/* ---- scenario judgment ---- */
function renderScenarioExercise(ex){
  return `<div class="ex-card">
    <div class="ex-kicker">情景判断 · ${esc(ex.scene)}</div>
    <div class="ex-q" style="font-size:16px;">${esc(ex.prompt)}</div>
    <div class="ex-sub">选出此时最恰当的英文表达</div>
  </div>
  <div id="exOpts">${ex.opts.map((o,i)=>`<div class="ex-opt" onclick="answerScenario(${i})"><span class="idx">${'ABCD'[i]}</span><span>${esc(o)}</span></div>`).join('')}</div>`;
}
function answerScenario(i){
  const ex = lessonSession.exercises[lessonSession.idx];
  if(ex.answered) return; ex.answered=true;
  speak(ex.opts[i]);
  const ok = ex.opts[i]===ex.answer;
  document.querySelectorAll('#exOpts .ex-opt').forEach((el,idx)=>{
    if(ex.opts[idx]===ex.answer) el.classList.add('correct');
    else if(idx===i) el.classList.add('wrong');
  });
  handleResult(ok, ()=>nextExercise());
}

/* ---- shared result handling ---- */
function handleResult(ok, after, skipAutoAdvance){
  const s = lessonSession;
  if(ok){ s.correct++; toast('回答正确 ✓'); }
  else { loseHeart(); }
  refreshLesson();
  setTimeout(()=>{ if(s.hearts>0 || ok){ if(after) after(); } else { refreshLesson(); } }, ok?600:1100);
}
function loseHeart(){
  lessonSession.hearts = Math.max(0, lessonSession.hearts-1);
}
function nextExercise(){
  const s = lessonSession;
  if(s.hearts<=0){ refreshLesson(); return; }
  if(s.idx < s.exercises.length-1){ s.idx++; refreshLesson(); }
  else { finishLesson(); }
}
function finishLesson(){
  const s = lessonSession;
  s.done = true;
  const stars = s.hearts>=5 ? 3 : s.hearts>=3 ? 2 : 1;
  const xp = s.correct*10 + stars*20;
  const prev = lessonProgress()[s.node.id];
  if(!prev || prev.stars < stars){ saveLessonProgress(s.node.id, {stars, xp}); }
  addXP(xp);
  const set = new Set(LS.get('studiedWords',[]));
  s.node.words.forEach(w=>set.add(w.word));
  LS.set('studiedWords',[...set]);
  refreshLesson();
}
function renderLessonResult(){
  const s = lessonSession;
  const stars = s.hearts>=5 ? 3 : s.hearts>=3 ? 2 : 1;
  const xp = s.correct*10 + stars*20;
  return `<div class="view" style="text-align:center">
    <div style="font-size:60rem;margin:20rem 0;animation:pop .5s ease;">🎉</div>
    <div style="font-size:19px;font-weight:800;">关卡完成！</div>
    <div class="result-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
    <div class="result-stat-row">
      <div class="result-stat"><b>${s.correct}/${s.exercises.length}</b><span>答对题数</span></div>
      <div class="result-stat"><b>+${xp}</b><span>获得经验</span></div>
      <div class="result-stat"><b>${s.hearts}</b><span>剩余生命</span></div>
    </div>
    <button class="btn gold" onclick="finishLessonExit()">继续闯关</button>
    <div style="height:16rem"></div>
    <button class="btn ghost" onclick="openLesson('${s.node.id}')">再来一次</button>
    <div class="safe"></div>
  </div>`;
}
function finishLessonExit(){ lessonSession=null; goBack(); switchTab('words'); }
function renderLessonFail(){
  return `<div class="view" style="text-align:center">
    <div style="font-size:60rem;margin:20rem 0;">💔</div>
    <div style="font-size:19px;font-weight:800;">生命值耗尽</div>
    <div style="font-size:13px;color:var(--muted);margin:10rem 0 30rem;">别灰心，再试一次就能掌握这些执勤用语</div>
    <button class="btn gold" onclick="openLesson('${lessonSession.node.id}')">重新挑战</button>
    <div style="height:16rem"></div>
    <button class="btn ghost" onclick="lessonSession=null;goBack();switchTab('words')">返回地图</button>
    <div class="safe"></div>
  </div>`;
}

/* ===========================================================
   情景剧本 Story Mode
=========================================================== */
let storySession = null;
function openStoryList(){ navigate(renderStoryList, '情景闯关剧本', ''); }
function renderStoryList(){
  let html = `<div class="view"><div class="section-sub" style="margin-bottom:20rem;">还原真实执勤现场，每一次选择都决定处置走向</div>`;
  SCENARIOS.forEach(sc=>{
    const done = storyProgress()[sc.id];
    html += `<div class="story-list-card" onclick="openStory('${sc.id}')">
      <div class="story-list-icon">${icon(sc.icon)}</div>
      <div class="li-main"><div class="li-en">${esc(sc.title)}${done?' <span class="li-tag">已通关</span>':''}</div><div class="li-cn">${esc(sc.titleEn)}</div></div>
      <span class="func-arrow">›</span>
    </div>`;
  });
  return html + '<div class="safe"></div></div>';
}
function openStory(id){
  const sc = SCENARIOS.find(s=>s.id===id);
  if(!sc) return;
  storySession = { scenario:sc, nodeId:null, hearts:3, intro:true };
  navigate(renderStoryView, sc.title, '');
}
function renderStoryView(){
  const s = storySession;
  if(!s) return `<div class="view"></div>`;
  const sc = s.scenario;
  if(s.intro) return renderStoryIntro(sc);
  if(s.ended) return renderStoryEnd(sc);
  const node = sc.nodes[s.nodeId];
  let html = `<div class="hearts-row">`;
  for(let i=0;i<3;i++) html += `<span class="heart ${i<s.hearts?'':'lost'}">♥</span>`;
  html += `</div><div class="story-narration">${esc(node.narration)}</div>`;
  node.choices.forEach((c,i)=>{
    let cls = '';
    if(s.picked!=null){ if(c.correct) cls='correct'; else if(i===s.picked) cls='wrong'; }
    html += `<div class="story-choice ${cls}" onclick="${s.picked==null?`pickStoryChoice(${i})`:''}">
      <div class="en">${esc(c.en)}</div><div class="cn">${esc(c.cn)}</div>
    </div>`;
  });
  if(s.picked!=null){
    const c = node.choices[s.picked];
    html += `<div class="ex-feedback ${c.correct?'good':'bad'}">${esc(c.feedback)}</div>
      <button class="btn gold" style="margin-top:20rem;" onclick="advanceStory()">${c.correct?'继续':'再想想'}</button>`;
  }
  return `<div class="view">${html}<div class="safe"></div></div>`;
}
function renderStoryIntro(sc){
  return `<div class="view">
    <div class="story-cover scene-${sc.scene}">
      <div class="story-title">${esc(sc.title)}</div>
      <div class="story-titleEn">${esc(sc.titleEn)}</div>
    </div>
    <div class="story-brief">${esc(sc.brief)}</div>
    <button class="btn gold" style="margin-top:26rem;" onclick="beginStory()">开始处置</button>
    <div class="safe"></div>
  </div>`;
}
function beginStory(){ storySession.intro=false; storySession.nodeId=storySession.scenario.start; storySession.picked=null; refresh(); }
function pickStoryChoice(i){
  const s = storySession;
  const node = s.scenario.nodes[s.nodeId];
  const c = node.choices[i];
  speak(c.en);
  s.picked = i;
  if(!c.correct) s.hearts = Math.max(0, s.hearts-1);
  refresh();
}
function advanceStory(){
  const s = storySession;
  const node = s.scenario.nodes[s.nodeId];
  const c = node.choices[s.picked];
  s.picked = null;
  if(c.next==='end'){ s.ended = true; saveStoryProgress(s.scenario.id); addXP(80); }
  else { s.nodeId = c.next; }
  refresh();
}
function renderStoryEnd(sc){
  return `<div class="view" style="text-align:center">
    <div style="font-size:60rem;margin:20rem 0;">🏅</div>
    <div style="font-size:19px;font-weight:800;">处置完毕</div>
    <div class="story-brief" style="text-align:left;margin-top:20rem;">${esc(sc.endText)}</div>
    <div style="font-size:13px;color:var(--gold-dark);font-weight:700;margin:20rem 0;">+80 XP</div>
    <button class="btn gold" onclick="storySession=null;goBack();">返回剧本列表</button>
    <div class="safe"></div>
  </div>`;
}

/* ---------- boot (放在最后，确保所有数据/函数已加载) ---------- */
buildTabbar();
switchTab('home');
