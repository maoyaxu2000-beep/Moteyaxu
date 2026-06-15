/* 五班英语角 App 逻辑 */
'use strict';
const WORDS = window.DATA.words, SPEAKING = window.DATA.speaking,
      DIALOGUES = window.DATA.dialogues, SECURITY = window.DATA.security;

/* ---------- storage ---------- */
const LS = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
function dateStr(d){ const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),da=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }

/* ---------- TTS ---------- */
let enVoice=null;
function pickVoice(){
  const vs=speechSynthesis.getVoices();
  enVoice = vs.find(v=>/en[-_]US/i.test(v.lang)&&/female|samantha|zira|google/i.test(v.name))
         || vs.find(v=>/en[-_]US/i.test(v.lang)) || vs.find(v=>/^en/i.test(v.lang)) || null;
}
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged=pickVoice; }
function speak(text,lang){
  if(!('speechSynthesis' in window)){ toast('当前设备不支持朗读'); return; }
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=lang||'en-US'; u.rate=.92; u.pitch=1;
    if(!lang||lang==='en-US'){ if(enVoice) u.voice=enVoice; }
    speechSynthesis.speak(u);
  }catch(e){ toast('朗读失败'); }
}
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
/* 生成可安全放入双引号 HTML 属性的单引号 JS 字符串字面量 */
function jsAttr(s){ return "'"+String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,' ').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+"'"; }

/* ---------- toast ---------- */
let toastT;
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),1500); }

/* ---------- navigation ---------- */
const root=document.getElementById('root');
let curTab='home';
let stack=[]; // {render, title, sub, act}
const baseView={ home:renderHome, words:renderWordsMenu, speaking:renderSpeaking, security:renderSecurity, me:renderMe };
const tabTitle={ home:'五班英语角', words:'背单词', speaking:'情景口语', security:'空保英语', me:'我的' };

function switchTab(tab){
  curTab=tab;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  stack=[{ render:baseView[tab], title:tabTitle[tab], sub:false, act:'' }];
  paint();
}
function navigate(render, title, act){ // render returns html string
  stack.push({render, title, sub:true, act}); paint();
}
function goBack(){ if(stack.length>1){ stack.pop(); paint(); } }
function refresh(){ paint(); }
function paint(){
  const cur=stack[stack.length-1];
  root.innerHTML = cur.render? cur.render() : cur.html;
  const tb=document.getElementById('topbar');
  tb.classList.toggle('sub', !!cur.sub);
  document.getElementById('topTitle').textContent = cur.title || '五班英语角';
  document.getElementById('topAct').innerHTML = cur.act || '';
  document.getElementById('tabbar').style.display = cur.sub? 'none':'flex';
  window.scrollTo(0,0);
}

/* =========================================================
   HOME
========================================================= */
function greeting(){ const h=new Date().getHours(); return h<6?'凌晨好':h<11?'早上好':h<13?'中午好':h<18?'下午好':'晚上好'; }
function calcStreak(){
  const hist=LS.get('checkinHistory',[]); const now=new Date(); const today=dateStr(now);
  let streak=0;
  if(hist.length){ const sorted=hist.slice().sort().reverse();
    const yest=new Date(now); yest.setDate(now.getDate()-1); const yStr=dateStr(yest);
    if(sorted[0]===today||sorted[0]===yStr){ streak=1; let cd=sorted[0]===today?new Date(now):yest;
      for(let i=1;i<400;i++){ cd=new Date(cd); cd.setDate(cd.getDate()-1); if(hist.includes(dateStr(cd))) streak++; else break; } } }
  return {streak,total:hist.length,today,checked:hist.includes(today)};
}
function dailyPick(){
  const seed=Number(dateStr(new Date()).replace(/-/g,''));
  const w=WORDS[seed%WORDS.length];
  const allPhr=SPEAKING.flatMap(c=>c.list); const p=allPhr[(seed*7)%allPhr.length];
  return {w,p};
}
function renderHome(){
  const st=calcStreak();
  const name=LS.get('displayName','')||'同学';
  const studied=LS.get('studiedWords',[]).length;
  const {w,p}=dailyPick();
  const now=new Date(); const wd=['日','一','二','三','四','五','六'][now.getDay()];
  // week
  const hist=LS.get('checkinHistory',[]); const monday=new Date(now); const dow=now.getDay(); monday.setDate(now.getDate()+(dow===0?-6:1-dow));
  let week='';
  for(let i=0;i<7;i++){ const d=new Date(monday); d.setDate(monday.getDate()+i); const ds=dateStr(d); const done=hist.includes(ds); const today=ds===st.today;
    week+=`<div class="week-day ${done?'done':''} ${today?'today':''}"><span class="week-label">${'一二三四五六日'[i]}</span><div class="week-dot">${done?'✓':''}</div></div>`; }
  return `
  <div class="view">
    <div class="welcome-card">
      <div class="welcome-top">
        <div class="welcome-user">
          <div class="welcome-avatar">${esc((name[0]||'游'))}</div>
          <div><div class="welcome-greeting">${greeting()}，${esc(name)}</div>
            <div class="welcome-status"><div class="status-dot ${st.checked?'done':''}"></div><span>${st.checked?'今日已打卡':'今日未打卡'}</span></div>
          </div>
        </div>
        <div class="welcome-date"><span class="date-day">${String(now.getDate()).padStart(2,'0')}</span><span class="date-week">星期${wd}</span></div>
      </div>
      <div class="welcome-stats">
        <div class="stat-item"><span class="stat-num">${studied}</span><span class="stat-label">已学单词</span></div>
        <div class="stat-dot"></div>
        <div class="stat-item"><span class="stat-num">${st.streak}</span><span class="stat-label">连续打卡</span></div>
        <div class="stat-dot"></div>
        <div class="stat-item"><span class="stat-num">${st.total}</span><span class="stat-label">累计天数</span></div>
      </div>
    </div>

    <div class="quick-grid">
      <div class="quick-item" onclick="switchTab('words')"><div class="quick-icon" style="background:linear-gradient(135deg,#4ade80,#22c55e)">W</div><span class="quick-name">背单词</span><span class="quick-desc">高频词汇</span></div>
      <div class="quick-item" onclick="openReview()"><div class="quick-icon" style="background:linear-gradient(135deg,#fb923c,#f97316)">R</div><span class="quick-name">生词本</span><span class="quick-desc">错题复习</span></div>
      <div class="quick-item" onclick="switchTab('speaking')"><div class="quick-icon" style="background:linear-gradient(135deg,#60a5fa,#3b82f6)">S</div><span class="quick-name">口语</span><span class="quick-desc">情景练习</span></div>
      <div class="quick-item" onclick="openQuiz()"><div class="quick-icon" style="background:linear-gradient(135deg,#f472b6,#ec4899)">Q</div><span class="quick-name">测试</span><span class="quick-desc">检验成果</span></div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-head-left"><div class="section-head-bar"></div><span class="section-title">探索更多</span></div><span class="section-sub">更多学习方式</span></div>
      <div class="func-card">
        <div class="func-item" onclick="switchTab('security')">
          <div class="func-icon" style="background:linear-gradient(135deg,#1e3a5f,#1a5276 50%,#1a7f37);color:#fff">🛡</div>
          <div class="func-info"><span class="func-name">空保英语</span><span class="func-desc">民航安保执勤英语，境外场景交流</span></div>
          <div class="func-badge">NEW</div><span class="func-arrow">›</span>
        </div>
        <div class="func-divider"></div>
        <div class="func-item" onclick="openChat()">
          <div class="func-icon" style="background:linear-gradient(135deg,#a78bfa,#7c3aed 50%,#6366f1);color:#fff">🤖</div>
          <div class="func-info"><span class="func-name">答疑小助手</span><span class="func-desc">本地智能检索，单词短句随时查</span></div><span class="func-arrow">›</span>
        </div>
        <div class="func-divider"></div>
        <div class="func-item" onclick="openDialogue()">
          <div class="func-icon" style="background:linear-gradient(135deg,#2dd4bf,#0d9488 50%,#0891b2);color:#fff">💬</div>
          <div class="func-info"><span class="func-name">情景对话</span><span class="func-desc">模拟真实场景，开口说英语</span></div><span class="func-arrow">›</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-head-left"><div class="section-head-bar amber"></div><span class="section-title">每日推荐</span></div><span class="section-sub">${st.today}</span></div>
      <div class="daily-list">
        <div class="daily-card word-card" onclick="switchTab('words')">
          <span class="daily-card-tag">📖 每日一词</span>
          <div class="daily-card-word">${esc(w.word)}</div>
          <div class="daily-card-phonetic">${esc(w.phonetic||'')}</div>
          <div class="daily-card-meaning">${esc(w.meaning)}</div>
          <div class="daily-card-example">${esc(w.example||'')}</div>
        </div>
        <div class="daily-card phrase-card" onclick="switchTab('speaking')">
          <span class="daily-card-tag">💡 每日金句</span>
          <div class="daily-card-en">${esc(p.en)}</div>
          <div class="daily-card-cn">${esc(p.cn)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-head-left"><div class="section-head-bar green"></div><span class="section-title">本周学习</span></div>${st.streak>0?`<span class="section-sub">🔥 连续 ${st.streak} 天</span>`:''}</div>
      <div class="checkin-card">
        <div class="week-row">${week}</div>
        <button class="btn ${st.checked?'done':''}" onclick="doCheckin()">${st.checked?'✅ 今日已完成':'🎯 立即打卡'}</button>
      </div>
    </div>
    <div class="safe"></div>
  </div>`;
}
function doCheckin(){
  const st=calcStreak(); if(st.checked){ toast('今日已打卡'); return; }
  const hist=LS.get('checkinHistory',[]); hist.push(st.today); LS.set('checkinHistory',hist); LS.set('lastCheckinDate',st.today);
  toast('打卡成功 🎉'); refresh();
}

/* =========================================================
   WORDS  (背单词 / 生词本)
========================================================= */
let wordSession=null; // {list, idx, revealed, mode:'study'|'review'}
function wordCats(){ const s=new Set(); WORDS.forEach(w=>w.category&&s.add(w.category)); return ['全部',...s]; }
function renderWordsMenu(){
  const cats=wordCats();
  const studied=LS.get('studiedWords',[]).length, wrong=LS.get('wrongWords',[]).length;
  let chips='';
  cats.forEach(c=>{ const cnt=c==='全部'?WORDS.length:WORDS.filter(w=>w.category===c).length;
    chips+=`<div class="list-item arrow-item" onclick="startWords('${esc(c)}')"><div class="li-main"><div class="li-en">${esc(c)}</div><div class="li-cn">${cnt} 个词</div></div><span class="func-arrow">›</span></div>`; });
  return `<div class="view">
    <div class="daily-list" style="grid-template-columns:1fr 1fr;">
      <div class="card" style="text-align:center"><div style="font-size:26px;font-weight:800;color:var(--green)">${studied}</div><div style="font-size:12px;color:var(--muted)">已学单词</div></div>
      <div class="card" style="text-align:center" onclick="openReview()"><div style="font-size:26px;font-weight:800;color:#f97316">${wrong}</div><div style="font-size:12px;color:var(--muted)">生词本 ›</div></div>
    </div>
    <div class="section-head" style="margin-top:30rem"><div class="section-head-left"><div class="section-head-bar"></div><span class="section-title">选择分类</span></div><span class="section-sub">共 ${WORDS.length} 词</span></div>
    ${chips}
    <div class="safe"></div>
  </div>`;
}
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function startWords(cat){
  const list=shuffle(cat==='全部'?WORDS:WORDS.filter(w=>w.category===cat));
  wordSession={list,idx:0,revealed:false,mode:'study',cat};
  navigate(renderFlash, cat==='全部'?'背单词':cat, '');
}
function openReview(){
  const list=LS.get('wrongWords',[]);
  if(!list.length){ toast('生词本是空的'); }
  wordSession={list:list.slice(),idx:0,revealed:false,mode:'review',cat:'生词本'};
  if(curTab!=='words'){ switchTab('words'); }
  navigate(renderFlash,'生词本 ('+list.length+')','');
}
function renderFlash(){
  const s=wordSession; if(!s||!s.list.length) return `<div class="view"><div class="empty"><span class="big">📭</span>暂无单词</div></div>`;
  const w=s.list[s.idx]; const pct=Math.round((s.idx+1)/s.list.length*100);
  const reviewMode=s.mode==='review';
  return `<div class="view">
    <div class="progress-txt"><span>${s.idx+1} / ${s.list.length}</span><span>${esc(s.cat)}</span></div>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    <div class="flash" onclick="revealWord()">
      <span class="flash-cat">${esc(w.category||'词汇')}</span>
      <div class="flash-word">${esc(w.word)}</div>
      <div class="flash-ph">${esc(w.phonetic||'')}</div>
      <div class="flash-play" onclick="event.stopPropagation();speak(${jsAttr(w.word)})">🔊</div>
      ${ s.revealed ? `<div class="flash-reveal">
          <div class="flash-meaning">${esc(w.meaning)}</div>
          <div class="flash-eg">${esc(w.example||'')}</div>
          <div class="flash-eg-cn">${esc(w.exampleCn||'')}</div>
        </div>` : `<div class="tap-hint">点击卡片查看释义</div>` }
    </div>
    <div class="flash-actions">
      ${reviewMode
        ? `<button class="btn ghost" onclick="removeWrong()">✓ 已掌握移除</button><button class="btn" onclick="nextWord()">下一个 ›</button>`
        : `<button class="btn amber" onclick="addWrong()">★ 加入生词本</button><button class="btn" onclick="markKnownNext()">认识 · 下一个</button>`}
    </div>
    <div class="safe"></div>
  </div>`;
}
function revealWord(){ wordSession.revealed=!wordSession.revealed; refresh(); const w=wordSession.list[wordSession.idx]; if(wordSession.revealed) speak(w.word); }
function nextWord(){ const s=wordSession; if(s.idx<s.list.length-1){ s.idx++; s.revealed=false; refresh(); } else finishWords(); }
function markKnownNext(){ const w=wordSession.list[wordSession.idx]; const set=new Set(LS.get('studiedWords',[])); set.add(w.word); LS.set('studiedWords',[...set]); nextWord(); }
function addWrong(){ const w=wordSession.list[wordSession.idx]; const arr=LS.get('wrongWords',[]); if(!arr.find(x=>x.word===w.word)){ arr.push(w); LS.set('wrongWords',arr); toast('已加入生词本'); } else toast('已在生词本中'); }
function removeWrong(){ const s=wordSession; const w=s.list[s.idx]; let arr=LS.get('wrongWords',[]); arr=arr.filter(x=>x.word!==w.word); LS.set('wrongWords',arr); s.list.splice(s.idx,1); if(s.idx>=s.list.length) s.idx=Math.max(0,s.list.length-1); s.revealed=false; toast('已移除'); if(!s.list.length){ goBack(); switchTab('words'); } else refresh(); }
function finishWords(){ toast('本组学习完成 🎉'); goBack(); }

/* =========================================================
   SPEAKING (口语短句)
========================================================= */
let speakShowCn=true;
function renderSpeaking(){
  let html=`<div class="view"><div class="section-head"><div class="section-head-left"><div class="section-head-bar"></div><span class="section-title">情景口语</span></div><span class="section-sub">${SPEAKING.length} 个场景</span></div>`;
  SPEAKING.forEach((c,i)=>{ html+=`<div class="list-item arrow-item" onclick="openSpeakCat(${i})"><div class="play" style="background:#eaf2ff;color:#2563eb">💬</div><div class="li-main"><div class="li-en">${esc(c.category)}</div><div class="li-cn">${c.list.length} 句</div></div><span class="func-arrow">›</span></div>`; });
  return html+'<div class="safe"></div></div>';
}
function openSpeakCat(i){
  const c=SPEAKING[i];
  navigate(()=>{
    let html=`<div class="view">`;
    c.list.forEach(it=>{ html+=`<div class="list-item">
      <div class="li-main"><div class="li-en">${esc(it.en)}</div><div class="li-cn">${esc(it.cn)}</div></div>
      <div class="play" onclick="speak(${jsAttr(it.en)})">🔊</div></div>`; });
    return html+'<div class="safe"></div></div>';
  }, c.category, '');
}

/* =========================================================
   DIALOGUE (情景对话)
========================================================= */
function openDialogue(){ navigate(renderDialogueMenu,'情景对话',''); }
function renderDialogueMenu(){
  let html=`<div class="view">`;
  DIALOGUES.forEach((c,i)=>{ html+=`<div class="part-title">${esc(c.category)}</div>`;
    c.list.forEach((d,j)=>{ html+=`<div class="list-item arrow-item" onclick="openDialogueItem(${i},${j})"><div class="play" style="background:#e6fbf6;color:#0d9488">🎭</div><div class="li-main"><div class="li-en">${esc(d.title)}</div><div class="li-cn">${d.dialogue.length} 句对话</div></div><span class="func-arrow">›</span></div>`; });
  });
  return html+'<div class="safe"></div></div>';
}
function openDialogueItem(i,j){
  const d=DIALOGUES[i].list[j];
  navigate(()=>{
    let html=`<div class="view"><div style="text-align:right;margin-bottom:14rem"><button class="chip" onclick="speakAllDialogue(${i},${j})">▶ 连续播放</button></div>`;
    d.dialogue.forEach((t,k)=>{
      const left = t.role==='officer'||t.role==='A'||t.role==='Q';
      const cn = t.textCn||t.cn||'';
      html+=`<div class="bubble ${left?'left':'right'}">
        <div class="role-tag">${esc(roleName(t.role))}</div>
        <div>${esc(t.text||t.en)}</div>${cn?`<div class="cn">${esc(cn)}</div>`:''}
        <div class="b-play" onclick="speak(${jsAttr(t.text||t.en)})">🔊</div></div>`;
    });
    return html+'<div class="safe"></div></div>';
  }, d.title, '');
}
function roleName(r){ return {officer:'安全员',passenger:'旅客',A:'A',B:'B',Q:'问',}[r]||r; }
function speakAllDialogue(i,j){
  const d=DIALOGUES[i].list[j]; let k=0;
  speechSynthesis.cancel();
  (function next(){ if(k>=d.dialogue.length) return; const t=d.dialogue[k++]; const u=new SpeechSynthesisUtterance(t.text||t.en); u.lang='en-US'; if(enVoice)u.voice=enVoice; u.rate=.92; u.onend=()=>setTimeout(next,250); speechSynthesis.speak(u); })();
}

/* =========================================================
   QUIZ (测试)
========================================================= */
let quiz=null;
function openQuiz(){ quiz={state:'menu',mode:'en2cn',count:10,cat:'全部'}; if(curTab!=='words'){} navigate(renderQuiz,'单词测试',''); }
function renderQuiz(){
  if(!quiz) quiz={state:'menu',mode:'en2cn',count:10,cat:'全部'};
  if(quiz.state==='menu') return renderQuizMenu();
  if(quiz.state==='playing') return renderQuizPlay();
  return renderQuizResult();
}
function renderQuizMenu(){
  const cats=wordCats();
  return `<div class="view">
    <div class="field"><label>题目方向</label>
      <div class="seg"><button class="${quiz.mode==='en2cn'?'active':''}" onclick="quizSet('mode','en2cn')">英文 → 中文</button><button class="${quiz.mode==='cn2en'?'active':''}" onclick="quizSet('mode','cn2en')">中文 → 英文</button></div></div>
    <div class="field"><label>题目数量</label>
      <div class="seg">${[5,10,15,20].map(n=>`<button class="${quiz.count===n?'active':''}" onclick="quizSet('count',${n})">${n}</button>`).join('')}</div></div>
    <div class="field"><label>词汇分类</label>
      <div class="chips">${cats.map(c=>`<div class="chip ${quiz.cat===c?'active':''}" onclick="quizSet('cat','${esc(c)}')">${esc(c)}</div>`).join('')}</div></div>
    <button class="btn" onclick="quizStart()">开始测试</button>
    <div class="safe"></div>
  </div>`;
}
function quizSet(k,v){ quiz[k]=v; refresh(); }
function quizStart(){
  let pool=quiz.cat==='全部'?WORDS:WORDS.filter(w=>w.category===quiz.cat);
  if(pool.length<4){ toast('该分类词汇太少'); return; }
  const sel=shuffle(pool).slice(0,Math.min(quiz.count,pool.length));
  quiz.questions=sel.map(t=>{
    const distract=shuffle(pool.filter(w=>w.word!==t.word)).slice(0,3);
    const opts=shuffle([t,...distract]).map(w=>({text:quiz.mode==='en2cn'?w.meaning:w.word,correct:w.word===t.word}));
    return {target:t, q:quiz.mode==='en2cn'?t.word:t.meaning, ph:quiz.mode==='en2cn'?(t.phonetic||''):'', opts};
  });
  quiz.idx=0; quiz.correct=0; quiz.answered=false; quiz.picked=-1; quiz.wrong=[]; quiz.state='playing'; refresh();
}
function renderQuizPlay(){
  const q=quiz.questions[quiz.idx]; const pct=Math.round((quiz.idx)/quiz.questions.length*100);
  return `<div class="view">
    <div class="progress-txt"><span>第 ${quiz.idx+1} / ${quiz.questions.length} 题</span><span>✓ ${quiz.correct}</span></div>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    <div class="quiz-q"><div class="qw">${esc(q.q)}</div>${q.ph?`<div class="qp">${esc(q.ph)} <span onclick="speak(${jsAttr(q.target.word)})">🔊</span></div>`:''}</div>
    ${q.opts.map((o,i)=>{ let cls=''; if(quiz.answered){ if(o.correct)cls='correct'; else if(i===quiz.picked)cls='wrong'; }
      return `<div class="quiz-opt ${cls}" onclick="quizPick(${i})"><span class="idx">${'ABCD'[i]}</span><span>${esc(o.text)}</span></div>`; }).join('')}
    ${quiz.answered?`<button class="btn" onclick="quizNext()">${quiz.idx<quiz.questions.length-1?'下一题':'查看结果'}</button>`:''}
    <div class="safe"></div>
  </div>`;
}
function quizPick(i){
  if(quiz.answered) return; quiz.answered=true; quiz.picked=i;
  const q=quiz.questions[quiz.idx];
  if(q.opts[i].correct){ quiz.correct++; } else { quiz.wrong.push(q.target);
    const arr=LS.get('wrongWords',[]); if(!arr.find(x=>x.word===q.target.word)){ arr.push(q.target); LS.set('wrongWords',arr); } }
  // mark studied
  const set=new Set(LS.get('studiedWords',[])); set.add(q.target.word); LS.set('studiedWords',[...set]);
  refresh();
}
function quizNext(){ if(quiz.idx<quiz.questions.length-1){ quiz.idx++; quiz.answered=false; quiz.picked=-1; refresh(); } else { quiz.state='result'; refresh(); } }
function renderQuizResult(){
  const total=quiz.questions.length; const score=Math.round(quiz.correct/total*100);
  return `<div class="view" style="text-align:center">
    <div class="result-ring" style="--pct:${score*3.6}deg"><div class="inner"><div class="result-score">${score}</div><div style="font-size:12px;color:var(--muted)">分</div></div></div>
    <div style="font-size:15px;font-weight:600;margin-bottom:6rem">答对 ${quiz.correct} / ${total} 题</div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:30rem">${score>=90?'太棒了，几乎全对！':score>=60?'不错，继续加油！':'多复习一下生词本吧'}</div>
    ${quiz.wrong.length?`<button class="btn amber" onclick="reviewQuizWrong()">复习错词 (${quiz.wrong.length})</button><div style="height:16rem"></div>`:''}
    <button class="btn" onclick="quizStart()">再测一次</button>
    <div style="height:16rem"></div>
    <button class="btn ghost" onclick="quiz.state='menu';refresh()">返回设置</button>
    <div class="safe"></div>
  </div>`;
}
function reviewQuizWrong(){ wordSession={list:quiz.wrong.slice(),idx:0,revealed:false,mode:'review',cat:'本次错词'}; navigate(renderFlash,'错词复习',''); }

/* =========================================================
   SECURITY (空保英语)
========================================================= */
function renderSecurity(){
  let html=`<div class="view">
    <div class="welcome-card" style="background:linear-gradient(135deg,#1e3a5f,#1a5276 50%,#1a7f37);padding:30rem">
      <div style="font-size:18px;font-weight:700">🛡 空保英语</div>
      <div style="font-size:12px;opacity:.9;margin-top:8rem">民航客舱安保 · 机场执勤 · 境外过夜场景</div>
    </div>`;
  SECURITY.forEach((part,pi)=>{
    html+=`<div class="part-title">${esc(part.part)} <span class="en">${esc(part.partEn||'')}</span></div>`;
    part.categories.forEach((c,ci)=>{
      html+=`<div class="sec-cat" onclick="openSecCat(${pi},${ci})"><div><div class="nm">${esc(c.category)}</div><div class="en">${esc(c.categoryEn||'')}</div></div><span class="badge-cnt">${c.items.length} ›</span></div>`;
    });
  });
  return html+'<div class="safe"></div></div>';
}
function openSecCat(pi,ci){
  const c=SECURITY[pi].categories[ci];
  navigate(()=>{
    let html=`<div class="view">`;
    c.items.forEach(it=>{
      if(it.type==='dialogue'){
        html+=`<div class="part-title">${esc(it.title||'对话')}</div>`;
        it.turns.forEach(t=>{ const left=t.speaker==='Q'||t.speaker==='A'&&false; const isQ=t.speaker==='Q';
          html+=`<div class="bubble ${isQ?'left':'right'}"><div class="role-tag">${esc(t.role||t.speaker)}</div><div>${esc(t.en)}</div>${t.cn?`<div class="cn">${esc(t.cn)}</div>`:''}<div class="b-play" onclick="speak(${jsAttr(t.en)})">🔊</div></div>`; });
      } else if(it.type==='qa'){
        html+=`<div class="qa-item">
          <div class="qa-q"><div class="qa-badge q">Q</div><div class="li-main"><div class="li-en">${esc(it.q.en)}</div><div class="li-cn">${esc(it.q.cn)}</div></div><div class="play" onclick="speak(${jsAttr(it.q.en)})">🔊</div></div>
          ${it.a&&(it.a.en||it.a.cn)?`<div class="qa-a"><div class="qa-badge a">A</div><div class="li-main"><div class="li-en">${esc(it.a.en)}</div><div class="li-cn">${esc(it.a.cn)}</div></div>${it.a.en?`<div class="play" onclick="speak(${jsAttr(it.a.en)})">🔊</div>`:''}</div>`:''}
        </div>`;
      } else {
        html+=`<div class="list-item"><div class="li-main"><div class="li-en">${esc(it.en)}</div><div class="li-cn">${esc(it.cn)}</div></div><div class="play" onclick="speak(${jsAttr(it.en)})">🔊</div></div>`;
      }
    });
    return html+'<div class="safe"></div></div>';
  }, c.category, '');
}

/* =========================================================
   CHAT (答疑小助手 - 本地检索)
========================================================= */
let chatLog=[{from:'bot',text:'你好！我是答疑小助手 🤖\n输入中文或英文关键词，我会帮你找出相关的单词和常用句。例如：「安全带」「passport」「行李」。'}];
function openChat(){ navigate(renderChat,'答疑小助手',''); }
function renderChat(){
  let html=`<div class="view" style="padding-bottom:120rem"><div class="chat-wrap">`;
  chatLog.forEach(m=>{
    html+=`<div class="chat-msg ${m.from}">${m.text.split('\n').map(esc).join('<br>')}`;
    if(m.results){ m.results.forEach(r=>{ html+=`<div class="chat-result"><div class="li-en">${esc(r.en)} <span onclick="speak(${jsAttr(r.en)})">🔊</span></div><div class="li-cn">${esc(r.cn)}</div></div>`; }); }
    html+=`</div>`;
  });
  html+=`</div></div>
  <div class="chat-bar"><input id="chatIn" placeholder="输入关键词…" onkeydown="if(event.key==='Enter')sendChat()"><button onclick="sendChat()">查询</button></div>`;
  return html;
}
function searchAll(q){
  q=q.trim().toLowerCase(); if(!q) return [];
  const res=[];
  WORDS.forEach(w=>{ if(w.word.toLowerCase().includes(q)||w.meaning.includes(q)) res.push({en:w.word+' '+(w.phonetic||''),cn:w.meaning+(w.example?' · '+w.example:'')}); });
  SPEAKING.forEach(c=>c.list.forEach(it=>{ if(it.en.toLowerCase().includes(q)||it.cn.includes(q)) res.push({en:it.en,cn:it.cn}); }));
  SECURITY.forEach(p=>p.categories.forEach(c=>c.items.forEach(it=>{
    if(it.en&&(it.en.toLowerCase().includes(q)||(it.cn||'').includes(q))) res.push({en:it.en,cn:it.cn});
    if(it.q&&(it.q.en.toLowerCase().includes(q)||it.q.cn.includes(q))) res.push({en:it.q.en,cn:it.q.cn});
  })));
  return res.slice(0,8);
}
function sendChat(){
  const inp=document.getElementById('chatIn'); const q=inp.value.trim(); if(!q) return;
  chatLog.push({from:'me',text:q});
  const r=searchAll(q);
  if(r.length) chatLog.push({from:'bot',text:`为你找到 ${r.length} 条相关内容：`,results:r});
  else chatLog.push({from:'bot',text:'没有找到相关内容，换个关键词试试？例如「安检」「hotel」「护照」。'});
  refresh();
  setTimeout(()=>{ const v=root.querySelector('.chat-wrap'); if(v) window.scrollTo(0,document.body.scrollHeight); },30);
}

/* =========================================================
   ME (我的)
========================================================= */
function renderMe(){
  const name=LS.get('displayName','');
  const st=calcStreak(); const studied=LS.get('studiedWords',[]).length; const wrong=LS.get('wrongWords',[]).length;
  return `<div class="view">
    <div class="card" style="display:flex;align-items:center;gap:20rem">
      <div class="welcome-avatar" style="background:linear-gradient(135deg,#1e3a5f,#1a7f37);color:#fff">${esc((name[0]||'游'))}</div>
      <div><div style="font-size:16px;font-weight:700">${esc(name||'游客')}</div><div style="font-size:12px;color:var(--muted)">五班英语角 · 空保英语</div></div>
    </div>
    <div class="daily-list" style="margin-top:20rem">
      <div class="card" style="text-align:center"><div style="font-size:24px;font-weight:800;color:var(--green)">${studied}</div><div style="font-size:11px;color:var(--muted)">已学单词</div></div>
      <div class="card" style="text-align:center"><div style="font-size:24px;font-weight:800;color:#f59e0b">${st.streak}</div><div style="font-size:11px;color:var(--muted)">连续打卡</div></div>
    </div>
    <div class="card" style="margin-top:20rem">
      <div class="setting-row"><span style="font-size:13px;width:96rem">显示名称</span><input id="nameIn" value="${esc(name)}" placeholder="设置你的名字"><button class="setting-save" onclick="saveName()">保存</button></div>
    </div>
    <div class="list-item arrow-item" style="margin-top:20rem" onclick="openReview()"><div class="play" style="background:#fff3e8;color:#f97316">★</div><div class="li-main"><div class="li-en">生词本</div><div class="li-cn">${wrong} 个待复习</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openQuiz()"><div class="play" style="background:#fdebf4;color:#ec4899">Q</div><div class="li-main"><div class="li-en">单词测试</div><div class="li-cn">检验学习成果</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openChat()"><div class="play" style="background:#efeafe;color:#7c3aed">🤖</div><div class="li-main"><div class="li-en">答疑小助手</div><div class="li-cn">本地智能检索</div></div><span class="func-arrow">›</span></div>
    <div class="links">
      <span onclick="resetCheckin()">重置打卡</span>·<span onclick="clearWrong()">清空生词本</span>·<span onclick="aboutApp()">关于</span>
    </div>
    <div class="safe"></div>
  </div>`;
}
function saveName(){ const v=document.getElementById('nameIn').value.trim(); LS.set('displayName',v); toast('已保存'); refresh(); }
function resetCheckin(){ if(confirm('确定重置全部打卡记录？')){ LS.set('checkinHistory',[]); LS.set('lastCheckinDate',''); toast('已重置'); refresh(); } }
function clearWrong(){ if(confirm('确定清空生词本？')){ LS.set('wrongWords',[]); toast('已清空'); refresh(); } }
function aboutApp(){ alert('五班英语角 · 空保英语\n\n民航安保执勤英语学习应用\n内容来源于原小程序与保警部空保英语教学资料\n\n离线可用 · 数据存储于本机'); }

/* ---------- boot ---------- */
switchTab('home');
