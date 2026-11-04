/* ===========================================================
   五班英语角 · 空保执勤英语 —— app.js
   核心导航 / 首页 / 自由学习(单词卡+测试) / 口语 / 情景对话 /
   空保英语专题 / 答疑小助手 / 我的 / 打卡
=========================================================== */
'use strict';
const WORDS = window.DATA.words, SPEAKING = window.DATA.speaking,
      DIALOGUES = window.DATA.dialogues, SECURITY = window.DATA.security;

/* ---------- storage ---------- */
const LS = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
function dateStr(d){ const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),da=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

/* ---------- TTS ---------- */
let enVoice=null;
/* 词库里的音标是英式（/ɒ/ /ɑː/），原来却固定选美音朗读，
   学员看到的和听到的对不上。这里改成可切换，默认英音以匹配音标。 */
function voiceAccent(){ return LS.get('voiceAccent','GB'); }
function accentLang(){ return voiceAccent()==='US' ? 'en-US' : 'en-GB'; }
function pickVoice(){
  const vs=speechSynthesis.getVoices();
  const want = voiceAccent()==='US' ? /en[-_]US/i : /en[-_]GB/i;
  const other= voiceAccent()==='US' ? /en[-_]GB/i : /en[-_]US/i;
  enVoice = vs.find(v=>want.test(v.lang)&&/female|samantha|zira|google|kate|serena|daniel/i.test(v.name))
         || vs.find(v=>want.test(v.lang))
         || vs.find(v=>other.test(v.lang))
         || vs.find(v=>/^en/i.test(v.lang)) || null;
}
function setVoiceAccent(a){ LS.set('voiceAccent',a); pickVoice(); toast(a==='US'?'已切换为美音':'已切换为英音'); speak('Security check, please cooperate.'); refresh(); }
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged=pickVoice; }
/* 朗读语速：数值就是实际播放倍速，正常 = 1.0x。
   旧版存的是系统朗读语速（默认 0.85 才是正常），这里一次性换算成新的倍速，学员听到的速度不变 */
function speechRate(){
  const v=LS.get('playRate',null);
  if(v!=null) return v;
  const old=LS.get('speechRate',null);
  const nv = old==null ? 1 : Math.min(1.5, Math.max(0.5, Math.round(old/0.85*20)/20));
  LS.set('playRate',nv);
  return nv;
}
function rateLabel(v){ v=Math.round(v*100)/100; return (v%1===0 ? v.toFixed(1) : String(v))+'x'; }

/* ---------- 真人质感语音 ----------
   系统自带 TTS 机械、生硬。平台里的英文句子已用神经网络语音模型预先生成 mp3
   （audio/gb 英音、audio/us 美音），随网站一起托管：国内能访问、离线也能播。
   对话里的另一方（旅客、机长等）用另一种音色（audio/gb2、audio/us2），听起来像两个人在对话。
   没有预生成音频的文本（如答疑小助手拼出来的句子）自动回退到系统朗读。
   文件名 = 规范化文本的 FNV-1a 32 位哈希，生成脚本用同一算法。 */
function audioKey(s){
  s=String(s).trim().replace(/\s+/g,' ');
  let h=0x811c9dc5;
  for(const b of new TextEncoder().encode(s)){ h^=b; h=Math.imul(h,0x01000193)>>>0; }
  return h.toString(16).padStart(8,'0');
}
const audioSets={};
function hasAudio(set,key){
  if(!audioSets[set]){
    const raw=(window.AUDIO_IDX||{})[set];
    if(!raw) return false;
    audioSets[set]=new Set(raw.split(','));
  }
  return audioSets[set].has(key);
}
function audioRate(){ return Math.min(1.5, Math.max(0.5, speechRate())); }
const player = new Audio();
player.preload='auto';
/* 语音文件是加密的：下载密文 → 用本机密钥解密 → 生成临时播放地址（最近 150 条留在内存里） */
const audioUrlCache=new Map();
async function audioBlobUrl(set,key){
  const id=set+'/'+key;
  if(audioUrlCache.has(id)) return audioUrlCache.get(id);
  const r=await fetch(`audio/${set}/${key}.bin?k=${window.ACCESS.kid}`);
  if(!r.ok) throw new Error('audio '+r.status);
  const plain=await window.ACCESS.decrypt(await r.arrayBuffer());
  const url=URL.createObjectURL(new Blob([plain],{type:'audio/mpeg'}));
  audioUrlCache.set(id,url);
  if(audioUrlCache.size>150){
    const [k0,u0]=audioUrlCache.entries().next().value;
    if(u0!==player.src){ URL.revokeObjectURL(u0); audioUrlCache.delete(k0); }
  }
  return url;
}
/* iPhone 只允许在手指点击时开始播放；先在第一次点击时用一段静音「解锁」播放器，
   之后解密完成再播放（已经离开点击事件）也不会被拦截 */
let audioUnlocked=false;
function unlockAudio(){
  if(audioUnlocked) return;
  audioUnlocked=true;
  try{
    player.src='data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//OEwAAAAAAAAAAAAEluZm8AAAAPAAAABQAAAbAAjo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojqqqqqqqqqqqqqqqqqqqqqqqqqqqx8fHx8fHx8fHx8fHx8fHx8fHx8fj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4///////////////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQEUAAAAAAAAAGwCcJVRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MkxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MkxCMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MkxEYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MkxGkAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MkxIwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    const p=player.play(); if(p && p.catch) p.catch(()=>{ audioUnlocked=false; });
  }catch(e){ audioUnlocked=false; }
}
document.addEventListener('touchend',unlockAudio,true);
document.addEventListener('pointerdown',unlockAudio,true);
let playToken=0;
let speakChain=false;   // 连播链内部调用 speak 时置 true
let dlgRun=null;
function stopSpeak(){
  playToken++;
  if(typeof recStopPlay==='function') recStopPlay();
  markPlaying(null);
  try{ player.pause(); }catch(e){}
  try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}
}
/* ---------- 统一播放按钮（主流音视频 App 样式） ----------
   实心圆 + 圆角三角 ▶；正在播放时变成暂停 ❚❚ 并带呼吸光圈，再点一下就停。
   按钮用 data-pk（文本哈希）标记，同一句话无论从按钮、点文字还是连播触发，
   所有对应按钮的状态都会同步。 */
const PI = `<span class="pi"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 5.7v12.6c0 .85.93 1.37 1.65.92l9.9-6.3c.66-.42.66-1.4 0-1.83l-9.9-6.3c-.72-.46-1.65.06-1.65.91z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.4"/><rect x="13.5" y="5" width="4" height="14" rx="1.4"/></svg></span>`;
function pb(text, voice){
  return `data-pk="${audioKey(text)}" data-say="${esc(text)}"${voice?` data-v="${voice}"`:''} role="button" aria-label="播放" onclick="event.stopPropagation();pbClick(this)"`;
}
function pbClick(el){
  if(el.classList.contains('is-playing')){ stopSpeak(); return; }
  speak(el.dataset.say, null, null, el.dataset.v||'');
}
let nowPk=null;
function markPlaying(k){
  if(k!==undefined) nowPk=k;
  document.querySelectorAll('[data-pk]').forEach(e=>e.classList.toggle('is-playing', !!nowPk && e.dataset.pk===nowPk));
}
/* 播放/暂停小图标，给「整段连播」这类文字按钮用 */
function chipIcon(playing){ return `<span class="pi chip-pi${playing?' on':''}">${PI.replace(/^<span class="pi">|<\/span>$/g,'')}</span>`; }

/* speak(text [,lang] [,onend] [,voice])
   voice: 'b' = 对话中的另一方音色；onend 只在正常播完时回调（被打断不回调） */
function speak(text, lang, onend, voice){
  if(typeof recStopPlay==='function') recStopPlay();
  const token=++playToken;
  try{ player.pause(); }catch(e){}
  try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}
  let called=false;
  const done=()=>{ if(called||token!==playToken) return; called=true; markPlaying(null); if(onend) onend(); };
  markPlaying(audioKey(text));
  /* 连播过程中手动点了别的句子：结束连播，按钮复位（否则按钮一直显示「暂停」） */
  if(!speakChain){
    if(dlgRun){ dlgRun=null; setDlgBtn(false); }
    if(typeof drillPlayInterrupted==='function') drillPlayInterrupted();
  }
  const isEn=!lang || /^en/i.test(lang);
  const acc=voiceAccent()==='US'?'us':'gb';
  const key=isEn ? audioKey(text) : null;
  let set=null;
  if(key){
    if(voice==='b' && hasAudio(acc+'2',key)) set=acc+'2';
    else if(hasAudio(acc,key)) set=acc;
  }
  if(set && window.ACCESS){
    let fellBack=false, url=null;
    const fallback=()=>{ if(fellBack||token!==playToken) return; fellBack=true; ttsSpeak(text,lang,done); };
    /* 只认本次设置的音源，避免解锁用的静音片段播完时误触发「播完」 */
    player.onended=()=>{ if(token===playToken && player.src===url) done(); };
    player.onerror=()=>{ if(player.src===url) fallback(); };
    audioBlobUrl(set,key).then(u=>{
      if(token!==playToken) return;
      url=u; player.src=u;
      player.defaultPlaybackRate=player.playbackRate=audioRate();
      const p=player.play();
      if(p && p.catch) p.catch(err=>{ if(err && err.name==='AbortError') return; fallback(); });
    }).catch(fallback);
    return;
  }
  ttsSpeak(text,lang,done);
}
function ttsSpeak(text,lang,done){
  if(!('speechSynthesis' in window)){ toast('当前设备不支持朗读'); if(done) done(); return; }
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=lang||accentLang(); u.rate=speechRate()*0.85; u.pitch=1;   // 系统朗读本身偏快，乘 0.85 才接近自然语速
    if(!lang||/^en/i.test(lang)){ if(enVoice) u.voice=enVoice; }
    u.onend=()=>{ if(done) done(); };
    speechSynthesis.speak(u);
  }catch(e){ toast('朗读失败'); }
}
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ---------- 使用场景标签 ----------
   空保英语的核心难点：同一个意思，对驾驶舱说 / 对旅客说 / 写进报告，说法完全不同。
   词库里每个词都标了 usage，这里把它显示出来并支持筛选。 */
const USAGE_META = {
  radio:{ label:'无线电', icon:icon('radio'), desc:'对驾驶舱/机组通话，简短、格式化' },
  face: { label:'当面',   icon:icon('user'), desc:'当面对旅客说，清晰、有礼但有力' },
  write:{ label:'书面',   icon:icon('book'), desc:'笔录、报告、移交文书用语' },
  life: { label:'生活',   icon:icon('hotel'), desc:'外站驻留、日常交际' }
};
function usageTag(u){
  const m = USAGE_META[u];
  if(!m) return '';
  return `<span class="usage-tag ${u}">${m.icon} ${m.label}</span>`;
}
function usageLegend(){
  return `<div class="usage-legend">${Object.keys(USAGE_META).map(k=>usageTag(k)).join('')}</div>`;
}
function jsAttr(s){ return "'"+String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,' ').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+"'"; }

/* ---------- toast ---------- */
let toastT;
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),1500); }

/* ---------- navigation ---------- */
const root=document.getElementById('root');
let curTab='home';
let stack=[];
const baseView={ home:renderHome, words:function(){ return renderMap(); }, speaking:renderSpeaking, security:renderSecurity, me:renderMe };
const tabTitle={ home:'五班英语角', words:'闯关地图', speaking:'情景口语', security:'空保英语', me:'我的' };
const tabIcon={ home:'home', words:'book', speaking:'talk', security:'shield', me:'user' };

function switchTab(tab){
  curTab=tab;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  stack=[{ render:baseView[tab], title:tabTitle[tab], sub:false, act:'' }];
  paint();
}
function navigate(render, title, act){
  stack.push({render, title, sub:true, act}); paint();
}
function goBack(){ if(dlgRun){ dlgRun=null; stopSpeak(); } if(stack.length>1){ stack.pop(); paint(); } }
function refresh(keep){ paint(keep!==false); }   /* 默认原地更新；refresh(false) = 换页式刷新（回顶部 + 入场动画） */
function paint(keep){
  const cur=stack[stack.length-1];
  const y = keep ? window.scrollY : 0;
  root.innerHTML = cur.render? cur.render() : cur.html;
  if(keep && root.firstElementChild) root.firstElementChild.style.animation='none';
  const tb=document.getElementById('topbar');
  tb.classList.toggle('sub', !!cur.sub);
  document.getElementById('topTitle').textContent = cur.title || '五班英语角';
  document.getElementById('topAct').innerHTML = cur.act || '';
  document.getElementById('tabbar').style.display = cur.sub? 'none':'flex';
  if(typeof markPlaying==='function') markPlaying();
  /* 语速悬浮钮只在可能有朗读的页面出现，首页和「我的」不需要 */
  syncSpeedWidget();
  window.scrollTo(0,y);
}
function syncSpeedWidget(){
  const sw=document.querySelector('.speed-widget-wrap'), cur=stack[stack.length-1];
  if(sw && cur) sw.style.display = ((!cur.sub && (curTab==='home'||curTab==='me')) || (typeof noSpeedPage==='function' && noSpeedPage(cur.render))) ? 'none' : '';
}
function buildTabbar(){
  const tb = document.getElementById('tabbar');
  tb.innerHTML = ['home','words','speaking','security','me'].map(t=>
    `<div class="tab ${t==='home'?'active':''}" data-tab="${t}" onclick="switchTab('${t}')"><span class="ic">${icon(tabIcon[t])}</span>${tabTitle[t]==='五班英语角'?'首页':tabTitle[t]}</div>`
  ).join('');
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
  const name=LS.get('displayName','')||'用户';
  const studied=LS.get('studiedWords',[]).length;
  const phraseTotal=allPhrases().length, phraseStudied=LS.get('studiedPhrases',[]).length;
  const mapNodes=buildMapNodes(), mapDone=mapNodes.filter(nodeCompleted).length, nxt=nextNode();
  const xp = (typeof totalXP==='function') ? totalXP() : 0;
  const level = (typeof userLevel==='function') ? userLevel() : 1;
  const {w,p}=dailyPick();
  const now=new Date(); const wd=['日','一','二','三','四','五','六'][now.getDay()];
  const hist=LS.get('checkinHistory',[]); const monday=new Date(now); const dow=now.getDay(); monday.setDate(now.getDate()+(dow===0?-6:1-dow));
  let week='';
  for(let i=0;i<7;i++){ const d=new Date(monday); d.setDate(monday.getDate()+i); const ds=dateStr(d); const done=hist.includes(ds); const today=ds===st.today;
    week+=`<div class="week-day ${done?'done':''} ${today?'today':''}"><span class="week-label">${'一二三四五六日'[i]}</span><div class="week-dot">${done?icon('check'):''}</div></div>`; }
  return `
  <div class="view">
    ${typeof topBannerHtml==='function'?topBannerHtml():installBannerHtml()}
    <div class="search-pill" onclick="openSearch()">${icon('search')}<span>执勤速查 · 输入中文或英文，一秒找到整句</span></div>
    <div class="welcome-card">
      <div class="welcome-top">
        <div class="welcome-user">
          <div class="welcome-avatar">${esc((name[0]||'游'))}</div>
          <div><div class="welcome-greeting">${greeting()}，${esc(name)}</div>
            <div class="welcome-status"><div class="status-dot ${st.checked?'done':''}"></div><span>${st.checked?'今日已打卡':'今日未打卡'} · Lv.${level}</span></div>
          </div>
        </div>
        <div class="welcome-date"><span class="date-day">${String(now.getDate()).padStart(2,'0')}</span><span class="date-week">星期${wd}</span></div>
      </div>
      <div class="welcome-stats">
        <div class="stat-item"><span class="stat-num">${studied}</span><span class="stat-label">已学单词</span></div>
        <div class="stat-dot"></div>
        <div class="stat-item"><span class="stat-num">${xp}</span><span class="stat-label">经验值 XP</span></div>
        <div class="stat-dot"></div>
        <div class="stat-item"><span class="stat-num">${st.streak}</span><span class="stat-label">连续打卡</span></div>
      </div>
    </div>

    <div class="continue-card" onclick="continueLearning()">
      <div class="cc-main">
        <span class="cc-tag">${nxt?(mapDone===0?'开始闯关':'继续闯关'):'闯关完成'}</span>
        <div class="cc-title">${nxt?esc(nxt.type==='story'?('情景剧本 · '+nxt.scenario.title):nxt.label):'全部关卡已通关'}</div>
        <div class="cc-sub">${nxt?esc(nxt.unit.titleEn):'可以去自由学习里继续巩固'}</div>
        <div class="cc-bar"><i style="width:${mapNodes.length?Math.round(mapDone/mapNodes.length*100):0}%"></i></div>
        <div class="cc-meta">已通关 ${mapDone} / ${mapNodes.length}</div>
      </div>
      <div class="cc-go">${icon('play')}</div>
    </div>

    ${srsHomeCard()}

    <div class="section" style="margin-top:34rem">
      <div class="section-head"><div class="section-head-left"><span class="section-title">自由学习</span></div><span class="section-sub">点卡片直接开始</span></div>
      <div class="free-row">
        <div class="free-card" onclick="quickWords()">
          <span class="free-more" onclick="event.stopPropagation();openFreeWords()">分类</span>
          <div class="free-ic t-green">${icon('book')}</div>
          <div class="free-name">背单词</div>
          <div class="free-meta">已学 ${studied} / ${WORDS.length}</div>
          <div class="free-bar"><i style="width:${WORDS.length?Math.min(100,Math.round(studied/WORDS.length*100)):0}%"></i></div>
        </div>
        <div class="free-card" onclick="quickPhrases()">
          <span class="free-more" onclick="event.stopPropagation();openFreePhrases()">分类</span>
          <div class="free-ic t-blue">${icon('talk')}</div>
          <div class="free-name">背短语</div>
          <div class="free-meta">已学 ${phraseStudied} / ${phraseTotal}</div>
          <div class="free-bar"><i style="width:${phraseTotal?Math.min(100,Math.round(phraseStudied/phraseTotal*100)):0}%"></i></div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-head-left"><div class="section-head-bar"></div><span class="section-title">探索更多</span></div><span class="section-sub">更多学习方式</span></div>
      <div class="func-card">
        <div class="func-item" onclick="openDrills()">
          <div class="func-icon t-red">${icon('alert')}</div>
          <div class="func-info"><span class="func-name">处置实战口语</span><span class="func-desc">30 个机上处置情景，中英对照分类练</span></div><div class="func-badge">NEW</div><span class="func-arrow">›</span>
        </div>
        <div class="func-divider"></div>
        <div class="func-item" onclick="openStoryList()">
          <div class="func-icon t-red">${icon('alert')}</div>
          <div class="func-info"><span class="func-name">情景剧本</span><span class="func-desc">真实特情，选对处置用语闯关</span></div><span class="func-arrow">›</span>
        </div>
        <div class="func-divider"></div>
        <div class="func-item" onclick="switchTab('security')">
          <div class="func-icon t-navy">${icon('shield')}</div>
          <div class="func-info"><span class="func-name">空保英语</span><span class="func-desc">民航安保执勤英语，境外场景交流</span></div><span class="func-arrow">›</span>
        </div>
        <div class="func-divider"></div>
        <div class="func-item" onclick="openDialogue()">
          <div class="func-icon t-blue">${icon('drama')}</div>
          <div class="func-info"><span class="func-name">情景对话</span><span class="func-desc">模拟真实场景，开口说英语</span></div><span class="func-arrow">›</span>
        </div>
        <div class="func-divider"></div>
        <div class="func-item" onclick="openReview()">
          <div class="func-icon t-green">${icon('star')}</div>
          <div class="func-info"><span class="func-name">生词本</span><span class="func-desc">错词和不熟的词集中复习</span></div><span class="func-arrow">›</span>
        </div>
        <div class="func-divider"></div>
        <div class="func-item" onclick="openFavs()">
          <div class="func-icon t-violet">${icon('star')}</div>
          <div class="func-info"><span class="func-name">我的收藏</span><span class="func-desc">常用整句，一键放大给旅客看</span></div><span class="func-arrow">›</span>
        </div>
        <div class="func-divider"></div>
        <div class="func-item" onclick="openChat()">
          <div class="func-icon t-violet">${icon('robot')}</div>
          <div class="func-info"><span class="func-name">答疑小助手</span><span class="func-desc">本地智能检索，单词短句随时查</span></div><span class="func-arrow">›</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-head-left"><div class="section-head-bar amber"></div><span class="section-title">每日推荐</span></div><span class="section-sub">${st.today}</span></div>
      <div class="daily-list">
        <div class="daily-card word-card" onclick="switchTab('words')">
          <span class="daily-card-tag">${icon('book')} 每日一词</span>
          <div class="daily-card-word">${esc(w.word)}</div>
          <div class="daily-card-phonetic">${esc(w.phonetic||'')}</div>
          <div class="daily-card-meaning">${esc(w.meaning)}</div>
          <div class="daily-card-example">${esc(w.example||'')}</div>
        </div>
        <div class="daily-card phrase-card" onclick="switchTab('speaking')">
          <span class="daily-card-tag">${icon('talk')} 每日金句</span>
          <div class="daily-card-en">${esc(p.en)}</div>
          <div class="daily-card-cn">${esc(p.cn)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-head-left"><div class="section-head-bar green"></div><span class="section-title">本周学习</span></div>${st.streak>0?`<span class="section-sub">${icon('flame')} 连续 ${st.streak} 天</span>`:''}</div>
      <div class="checkin-card">
        <div class="week-row">${week}</div>
        <button class="btn ${st.checked?'done':'gold'}" onclick="doCheckin()">${st.checked?icon('check')+' 今日已完成':'立即打卡'}</button>
        ${st.checked?`<button class="btn ghost" style="margin-top:14rem" onclick="openPoster()">${icon('share')} 生成打卡海报</button>`:''}
      </div>
    </div>
    <div class="safe"></div>
  </div>`;
}
function nextNode(){
  const nodes=buildMapNodes();
  return nodes.find((n,i)=>nodeUnlocked(i,nodes) && !nodeCompleted(n)) || null;
}
function continueLearning(){
  const n=nextNode();
  if(!n){ switchTab('words'); return; }
  if(n.type==='story') openStory(n.id); else openLesson(n.id);
}
function doCheckin(){
  const st=calcStreak(); if(st.checked){ toast('今日已打卡'); return; }
  const hist=LS.get('checkinHistory',[]); hist.push(st.today); LS.set('checkinHistory',hist); LS.set('lastCheckinDate',st.today);
  if(typeof addXP==='function') addXP(15);
  toast('打卡成功 · +15 XP'); refresh();
}

/* =========================================================
   自由学习模式 WORDS  (背单词 / 生词本 / 测试) —— 保留原有自由复习方式
========================================================= */
let wordSession=null;
function wordCats(){ const s=new Set(); WORDS.forEach(w=>w.category&&s.add(w.category)); return ['全部',...s]; }
function renderWordsMenu(){
  const cats=wordCats();
  const studied=LS.get('studiedWords',[]).length, wrong=LS.get('wrongWords',[]).length;
  let chips='';
  cats.forEach(c=>{ const cnt=c==='全部'?WORDS.length:WORDS.filter(w=>w.category===c).length;
    chips+=`<div class="list-item arrow-item" onclick="startWords('${esc(c)}')"><div class="li-main"><div class="li-en">${esc(c)}</div><div class="li-cn">${cnt} 个词</div></div><span class="func-arrow">›</span></div>`; });
  return `<div class="view">
    <div class="daily-list" style="grid-template-columns:1fr 1fr;">
      <div class="card" style="text-align:center"><div style="font-size:26px;font-weight:800;color:var(--text)">${studied}</div><div style="font-size:12px;color:var(--muted)">已学单词</div></div>
      <div class="card" style="text-align:center" onclick="openReview()"><div style="font-size:26px;font-weight:800;color:#f97316">${wrong}</div><div style="font-size:12px;color:var(--muted)">生词本 ›</div></div>
    </div>
    <button class="btn gold" style="margin-top:20rem;" onclick="openQuiz()">开始单词测试</button>

    <div class="section-head" style="margin-top:30rem"><div class="section-head-left"><div class="section-head-bar"></div><span class="section-title">按使用场景练</span></div><span class="section-sub">同义不同说法</span></div>
    <div class="card" style="font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:14rem">
      同一件事，报告驾驶舱、当面对旅客说、写进笔录，说法完全不同。按场景专项练，比按主题背更贴近执勤。
    </div>
    ${Object.keys(USAGE_META).map(k=>{
      const cnt=WORDS.filter(w=>w.usage===k).length;
      const m=USAGE_META[k];
      return `<div class="list-item arrow-item" onclick="startWordsByUsage('${k}')">
        <div class="li-main"><div class="li-en">${m.icon} ${m.label}用语 · ${cnt} 词</div><div class="li-cn">${m.desc}</div></div>
        <span class="func-arrow">›</span></div>`;
    }).join('')}

    <div class="section-head" style="margin-top:30rem"><div class="section-head-left"><div class="section-head-bar"></div><span class="section-title">按分类闪卡复习</span></div><span class="section-sub">共 ${WORDS.length} 词</span></div>
    ${chips}
    <div class="safe"></div>
  </div>`;
}
function startWords(cat){
  const list=shuffle(cat==='全部'?WORDS:WORDS.filter(w=>w.category===cat));
  wordSession={list,idx:0,revealed:false,mode:'study',cat};
  navigate(renderFlash, cat==='全部'?'闪卡复习':cat, '');
}
function startWordsByUsage(u){
  const m=USAGE_META[u]; if(!m) return;
  const list=shuffle(WORDS.filter(w=>w.usage===u));
  if(!list.length){ toast('该场景暂无词条'); return; }
  wordSession={list,idx:0,revealed:false,mode:'study',cat:m.label+'用语'};
  navigate(renderFlash, m.icon+' '+m.label+'用语', '');
}
function openReview(){
  const list=LS.get('wrongWords',[]);
  if(!list.length){ toast('生词本是空的，先去闯关吧'); return; }
  wordSession={list:list.slice(),idx:0,revealed:false,mode:'review',cat:'生词本'};
  navigate(renderFlash,'生词本 ('+list.length+')','');
}
function renderFlash(){
  const s=wordSession; if(!s||!s.list.length) return `<div class="view"><div class="empty"><span class="big">${icon('book')}</span>暂无单词</div></div>`;
  const w=s.list[s.idx]; const pct=Math.round((s.idx+1)/s.list.length*100);
  const reviewMode=s.mode==='review';
  return `<div class="view">
    <div class="progress-txt"><span>${s.idx+1} / ${s.list.length}</span><span>${esc(s.cat)}</span></div>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    <div class="flash" onclick="revealWord()">
      <div class="flash-tags">
        <span class="flash-cat" style="margin-bottom:0">${esc(w.category||'词汇')}</span>
        ${usageTag(w.usage)}
      </div>
      <div class="flash-word speakable" onclick="event.stopPropagation();speak(${jsAttr(w.word)})">${esc(w.word)}</div>
      <div class="flash-ph">${esc(w.phonetic||'')}</div>
      <div class="flash-play" ${pb(w.word)}>${PI}</div>
      ${ s.revealed ? `<div class="flash-reveal">
          <div class="flash-meaning">${esc(w.meaning)}</div>
          <div class="flash-eg">${esc(w.example||'')}</div>
          <div class="flash-eg-cn">${esc(w.exampleCn||'')}</div>
        </div>` : `<div class="tap-hint">点击卡片查看释义</div>` }
    </div>
    ${s.revealed && typeof fbLink==='function' ? fbLink(w.word, w.meaning) : ''}
    <div class="flash-actions">
      ${reviewMode
        ? `<button class="btn ghost" onclick="removeWrong()">✓ 已掌握移除</button><button class="btn gold" onclick="nextWord()">下一个 ›</button>`
        : `<button class="btn amber" onclick="addWrong()">${icon('star')} 加入生词本</button><button class="btn gold" onclick="markKnownNext()">认识 · 下一个</button>`}
    </div>
    <div class="safe"></div>
  </div>`;
}
function revealWord(){ wordSession.revealed=!wordSession.revealed; refresh(); const w=wordSession.list[wordSession.idx]; if(wordSession.revealed) speak(w.word); }
function nextWord(){ const s=wordSession; if(s.idx<s.list.length-1){ s.idx++; s.revealed=false; refresh(); } else finishWords(); }
function markKnownNext(){ const w=wordSession.list[wordSession.idx]; const set=new Set(LS.get('studiedWords',[])); set.add(w.word); LS.set('studiedWords',[...set]); srsGrade('w',w.word,true); nextWord(); }
function addWrong(){ const w=wordSession.list[wordSession.idx]; srsGrade('w',w.word,false); const arr=LS.get('wrongWords',[]); if(!arr.find(x=>x.word===w.word)){ arr.push(w); LS.set('wrongWords',arr); toast('已加入生词本'); } else toast('已在生词本中'); }
function removeWrong(){ const s=wordSession; const w=s.list[s.idx]; srsGrade('w',w.word,true); let arr=LS.get('wrongWords',[]); arr=arr.filter(x=>x.word!==w.word); LS.set('wrongWords',arr); s.list.splice(s.idx,1); if(s.idx>=s.list.length) s.idx=Math.max(0,s.list.length-1); s.revealed=false; toast('已移除'); if(!s.list.length){ goBack(); } else refresh(); }
function finishWords(){ toast('本组学习完成'); goBack(); }

/* =========================================================
   自由学习 · 背短语（SPEAKING 里的口语短句，闪卡 + 生词本式复习）
   进度记在本机：studiedPhrases（会了）、wrongPhrases（待复习），以英文原句为 key
========================================================= */
function allPhrases(){ const r=[]; SPEAKING.forEach(c=>c.list.forEach(it=>r.push({en:it.en,cn:it.cn,cat:c.category}))); return r; }
let phraseSession=null;
function phraseDir(){ return LS.get('phraseDir','cn2en'); }
function quickWords(){
  const done=new Set(LS.get('studiedWords',[]));
  const list=[...shuffle(WORDS.filter(w=>!done.has(w.word))),...shuffle(WORDS.filter(w=>done.has(w.word)))];
  if(!list.length){ toast('暂无单词'); return; }
  wordSession={list,idx:0,revealed:false,mode:'study',cat:'背单词'};
  navigate(renderFlash,'背单词','');
}
function quickPhrases(){
  const done=new Set(LS.get('studiedPhrases',[])), all=allPhrases();
  const list=[...shuffle(all.filter(p=>!done.has(p.en))),...shuffle(all.filter(p=>done.has(p.en)))];
  if(!list.length){ toast('暂无短语'); return; }
  phraseSession={list,idx:0,revealed:false,mode:'study',cat:'背短语'};
  navigate(renderPhraseFlash,'背短语','');
  if(phraseDir()==='en2cn') setTimeout(()=>speak(list[0].en),0);
}
function openFreeWords(){ navigate(renderWordsMenu,'背单词',''); }
function openFreePhrases(){ navigate(renderPhraseMenu,'背短语',''); }
function setPhraseDir(d){ LS.set('phraseDir',d); refresh(); }
function renderPhraseMenu(){
  const all=allPhrases(), studied=LS.get('studiedPhrases',[]).length, wrong=LS.get('wrongPhrases',[]).length, dir=phraseDir();
  let cats='';
  SPEAKING.forEach((c,i)=>{ cats+=`<div class="list-item arrow-item" onclick="startPhrases(${i})"><div class="li-main"><div class="li-en">${esc(c.category)}</div><div class="li-cn">${c.list.length} 句</div></div><span class="func-arrow">›</span></div>`; });
  return `<div class="view">
    <div class="daily-list" style="grid-template-columns:1fr 1fr;">
      <div class="card" style="text-align:center"><div style="font-size:26px;font-weight:800;color:var(--text)">${studied}</div><div style="font-size:12px;color:var(--muted)">已学短语</div></div>
      <div class="card" style="text-align:center" onclick="openPhraseReview()"><div style="font-size:26px;font-weight:800;color:#f97316">${wrong}</div><div style="font-size:12px;color:var(--muted)">待复习 ›</div></div>
    </div>
    <div class="seg" style="margin-top:20rem"><button class="${dir==='cn2en'?'active':''}" onclick="setPhraseDir('cn2en')">看中文 · 想英文</button><button class="${dir==='en2cn'?'active':''}" onclick="setPhraseDir('en2cn')">听英文 · 想中文</button></div>
    <button class="btn gold" onclick="startPhrases(-1)">全部随机 · ${all.length} 句</button>
    <div class="section-head" style="margin-top:30rem"><div class="section-head-left"><span class="section-title">按场景背</span></div><span class="section-sub">共 ${SPEAKING.length} 个场景</span></div>
    ${cats}
    <div class="safe"></div>
  </div>`;
}
function startPhrases(ci){
  const src = ci<0 ? allPhrases() : SPEAKING[ci].list.map(it=>({en:it.en,cn:it.cn,cat:SPEAKING[ci].category}));
  if(!src.length){ toast('该场景暂无短语'); return; }
  phraseSession={list:shuffle(src),idx:0,revealed:false,mode:'study',cat:ci<0?'全部短语':SPEAKING[ci].category};
  navigate(renderPhraseFlash, phraseSession.cat, '');
  if(phraseDir()==='en2cn') setTimeout(()=>speak(phraseSession.list[0].en),0);
}
function openPhraseReview(){
  const keys=new Set(LS.get('wrongPhrases',[]));
  const list=allPhrases().filter(p=>keys.has(p.en));
  if(!list.length){ toast('还没有待复习的短语'); return; }
  phraseSession={list,idx:0,revealed:false,mode:'review',cat:'待复习短语'};
  navigate(renderPhraseFlash,'待复习短语 ('+list.length+')','');
  if(phraseDir()==='en2cn') setTimeout(()=>speak(list[0].en),0);
}
function renderPhraseFlash(){
  const s=phraseSession; if(!s||!s.list.length) return `<div class="view"><div class="empty"><span class="big">${icon('talk')}</span>暂无短语</div></div>`;
  const p=s.list[s.idx], pct=Math.round((s.idx+1)/s.list.length*100), dir=phraseDir(), review=s.mode==='review';
  let face;
  if(dir==='cn2en'){
    face = `<div class="flash-tags"><span class="flash-cat" style="margin-bottom:0">${esc(p.cat)}</span></div>
      <div class="phrase-q">${esc(p.cn)}</div>
      ${ s.revealed
        ? `<div class="flash-reveal"><div class="phrase-a speakable" onclick="event.stopPropagation();speak(${jsAttr(p.en)})">${esc(p.en)}</div><div class="flash-play" ${pb(p.en)}>${PI}</div></div>`
        : `<div class="tap-hint">先想想英文怎么说，点击卡片看答案</div>` }`;
  } else {
    face = `<div class="flash-tags"><span class="flash-cat" style="margin-bottom:0">${esc(p.cat)}</span></div>
      <div class="flash-play" ${pb(p.en)}>${PI}</div>
      ${ s.revealed
        ? `<div class="flash-reveal"><div class="phrase-a speakable" onclick="event.stopPropagation();speak(${jsAttr(p.en)})">${esc(p.en)}</div><div class="phrase-cn">${esc(p.cn)}</div></div>`
        : `<div class="tap-hint">听一遍，想想是什么意思，点击卡片看答案</div>` }`;
  }
  return `<div class="view">
    <div class="progress-txt"><span>${s.idx+1} / ${s.list.length}</span><span>${esc(s.cat)}</span></div>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    <div class="flash" onclick="revealPhrase()">${face}</div>
    ${s.revealed?lineTools(p.en,p.cn):''}
    <div class="flash-actions">
      ${review
        ? `<button class="btn ghost" onclick="removeWrongPhrase()">已掌握 · 移除</button><button class="btn gold" onclick="nextPhrase()">下一个 ›</button>`
        : `<button class="btn amber" onclick="addWrongPhrase()">${icon('star')} 还不熟</button><button class="btn gold" onclick="markPhraseKnown()">会了 · 下一个</button>`}
    </div>
    <div class="safe"></div>
  </div>`;
}
function revealPhrase(){
  const s=phraseSession; s.revealed=!s.revealed; refresh();
  if(s.revealed && phraseDir()==='cn2en') speak(s.list[s.idx].en);
}
function nextPhrase(){
  const s=phraseSession;
  if(s.idx<s.list.length-1){ s.idx++; s.revealed=false; refresh(); if(phraseDir()==='en2cn') setTimeout(()=>speak(s.list[s.idx].en),0); }
  else { toast('本组短语学习完成'); goBack(); }
}
function markPhraseKnown(){
  const p=phraseSession.list[phraseSession.idx];
  const set=new Set(LS.get('studiedPhrases',[])); set.add(p.en); LS.set('studiedPhrases',[...set]);
  const w=LS.get('wrongPhrases',[]).filter(x=>x!==p.en); LS.set('wrongPhrases',w);
  srsGrade('p',p.en,true);
  nextPhrase();
}
function addWrongPhrase(){
  const p=phraseSession.list[phraseSession.idx]; const arr=LS.get('wrongPhrases',[]);
  srsGrade('p',p.en,false);
  if(!arr.includes(p.en)){ arr.push(p.en); LS.set('wrongPhrases',arr); toast('已加入待复习'); } else toast('已在待复习中');
}
function removeWrongPhrase(){
  const s=phraseSession, p=s.list[s.idx];
  LS.set('wrongPhrases',LS.get('wrongPhrases',[]).filter(x=>x!==p.en));
  const set=new Set(LS.get('studiedPhrases',[])); set.add(p.en); LS.set('studiedPhrases',[...set]);
  srsGrade('p',p.en,true);
  s.list.splice(s.idx,1); if(s.idx>=s.list.length) s.idx=Math.max(0,s.list.length-1); s.revealed=false;
  toast('已移除'); if(!s.list.length) goBack(); else refresh();
}

/* =========================================================
   SPEAKING (口语短句)
========================================================= */
function renderSpeaking(){
  let html=`<div class="view"><div class="section-head"><div class="section-head-left"><div class="section-head-bar"></div><span class="section-title">情景口语</span></div><span class="section-sub">${SPEAKING.length} 个场景</span></div>`;
  SPEAKING.forEach((c,i)=>{ html+=`<div class="list-item arrow-item" onclick="openSpeakCat(${i})"><div class="play p-blue">${icon('talk')}</div><div class="li-main"><div class="li-en">${esc(c.category)}</div><div class="li-cn">${c.list.length} 句</div></div><span class="func-arrow">›</span></div>`; });
  return html+'<div class="safe"></div></div>';
}
function openSpeakCat(i){
  const c=SPEAKING[i];
  navigate(()=>{
    let html=`<div class="view">`;
    c.list.forEach(it=>{ html+=`<div class="list-item">
      <div class="li-main"><div class="li-en speakable" onclick="speak(${jsAttr(it.en)})">${esc(it.en)}</div><div class="li-cn">${esc(it.cn)}</div></div>
      ${lineActs(it.en,it.cn)}<div class="play" ${pb(it.en)}>${PI}</div></div>`; });
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
    c.list.forEach((d,j)=>{ html+=`<div class="list-item arrow-item" onclick="openDialogueItem(${i},${j})"><div class="play p-teal">${icon('drama')}</div><div class="li-main"><div class="li-en">${esc(d.title)}</div><div class="li-cn">${d.dialogue.length} 句对话</div></div><span class="func-arrow">›</span></div>`; });
  });
  return html+'<div class="safe"></div></div>';
}
function openDialogueItem(i,j){
  const d=DIALOGUES[i].list[j];
  navigate(()=>{
    let html=`<div class="view"><div style="text-align:right;margin-bottom:14rem"><button class="chip chip-play" id="dlgPlayBtn" onclick="speakAllDialogue(${i},${j})">${chipIcon(false)} 连续播放</button></div>`;
    d.dialogue.forEach((t,k)=>{
      const left = t.role==='officer'||t.role==='A'||t.role==='Q';
      const cn = t.textCn||t.cn||'';
      html+=`<div class="bubble ${left?'left':'right'}">
        <div class="role-tag">${esc(roleName(t.role))}</div>
        <div class="speakable" onclick="speak(${jsAttr(t.text||t.en)},null,null,${jsAttr(roleVoice(t.role))})">${esc(t.text||t.en)}</div>${cn?`<div class="cn">${esc(cn)}</div>`:''}
        <div class="b-play" ${pb(t.text||t.en, roleVoice(t.role))}>${PI}</div></div>`;
    });
    return html+'<div class="safe"></div></div>';
  }, d.title, '');
}
function roleName(r){ return {officer:'安全员',passenger:'旅客',A:'A',B:'B',Q:'问'}[r]||r; }
function setDlgBtn(on){ const b=document.getElementById('dlgPlayBtn'); if(b) b.innerHTML=chipIcon(on)+(on?' 暂停播放':' 连续播放'); }
function speakAllDialogue(i,j){
  if(dlgRun){ dlgRun=null; stopSpeak(); setDlgBtn(false); return; }   // 再点一次 = 暂停
  const d=DIALOGUES[i].list[j]; let k=0;
  const run=dlgRun={};
  setDlgBtn(true);
  (function next(){
    if(dlgRun!==run) return;
    if(k>=d.dialogue.length){ dlgRun=null; setDlgBtn(false); return; }
    const t=d.dialogue[k++];
    speakChain=true; speak(t.text||t.en, null, ()=>setTimeout(next,350), roleVoice(t.role)); speakChain=false;
  })();
}
/* 安全员用主音色，旅客 / 对方用第二音色，连播时像两个人在对话 */
function roleVoice(r){ return /^(passenger|B|旅客|警官|机长|乘务员)$/.test(r||'') ? 'b' : ''; }

/* =========================================================
   QUIZ (单词测试 - 自由复习中的检验环节)
========================================================= */
let quiz=null;
function openQuiz(){ quiz={state:'menu',mode:'en2cn',count:10,cat:'全部'}; navigate(renderQuiz,'单词测试',''); }
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
    <button class="btn gold" onclick="quizStart()">开始测试</button>
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
    <div class="quiz-q"><div class="qw${quiz.mode==='en2cn'?' speakable':''}" ${quiz.mode==='en2cn'?`onclick="speak(${jsAttr(q.q)})"`:''}>${esc(q.q)}</div>${q.ph?`<div class="qp">${esc(q.ph)} <span class="pbtn-in" ${pb(q.target.word)}>${PI}</span></div>`:''}</div>
    ${q.opts.map((o,i)=>{ let cls=''; if(quiz.answered){ if(o.correct)cls='correct'; else if(i===quiz.picked)cls='wrong'; }
      return `<div class="quiz-opt ${cls}" onclick="quizPick(${i})"><span class="idx">${'ABCD'[i]}</span><span>${esc(o.text)}</span></div>`; }).join('')}
    ${quiz.answered?`<button class="btn gold" onclick="quizNext()">${quiz.idx<quiz.questions.length-1?'下一题':'查看结果'}</button>`:''}
    <div class="safe"></div>
  </div>`;
}
function quizPick(i){
  if(quiz.answered) return; quiz.answered=true; quiz.picked=i;
  const q=quiz.questions[quiz.idx];
  if(quiz.mode==='cn2en') speak(q.opts[i].text);
  if(q.opts[i].correct){ quiz.correct++; srsSeen('w',q.target.word); } else { quiz.wrong.push(q.target); srsGrade('w',q.target.word,false);
    const arr=LS.get('wrongWords',[]); if(!arr.find(x=>x.word===q.target.word)){ arr.push(q.target); LS.set('wrongWords',arr); } }
  const set=new Set(LS.get('studiedWords',[])); set.add(q.target.word); LS.set('studiedWords',[...set]);
  refresh();
}
function quizNext(){ if(quiz.idx<quiz.questions.length-1){ quiz.idx++; quiz.answered=false; quiz.picked=-1; refresh(); } else { quiz.state='result'; if(typeof addXP==='function') addXP(quiz.correct*5); refresh(); } }
function renderQuizResult(){
  const total=quiz.questions.length; const score=Math.round(quiz.correct/total*100);
  return `<div class="view" style="text-align:center">
    <div class="result-ring" style="--pct:${score*3.6}deg"><div class="inner"><div class="result-score">${score}</div><div style="font-size:12px;color:var(--muted)">分</div></div></div>
    <div style="font-size:15px;font-weight:700;margin-bottom:6rem">答对 ${quiz.correct} / ${total} 题</div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:30rem">${score>=90?'太棒了，几乎全对！':score>=60?'不错，继续加油！':'多复习一下生词本吧'}</div>
    ${quiz.wrong.length?`<button class="btn amber" onclick="reviewQuizWrong()">复习错词 (${quiz.wrong.length})</button><div style="height:16rem"></div>`:''}
    <button class="btn gold" onclick="quizStart()">再测一次</button>
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
    <div class="welcome-card" style="padding:30rem">
      <div style="font-size:18px;font-weight:800;">${icon('shield')} 空保英语</div>
      <div style="font-size:12px;opacity:.85;margin-top:8rem">民航客舱安保 · 机场执勤 · 境外过夜场景</div>
    </div>
    <div class="story-list-card soft" onclick="openDrills()" style="margin-top:22rem">
      <div class="story-list-icon t-blue">${icon('talk')}</div>
      <div class="li-main"><div class="li-en">处置实战口语 <span class="func-badge" style="margin-left:6rem">NEW</span></div><div class="li-cn">30个机上处置情景 · 分6类 · 中英对照+口语练习</div></div>
      <span class="func-arrow">›</span>
    </div>
    <div class="story-list-card soft" onclick="openStoryList()">
      <div class="story-list-icon t-red">${icon('alert')}</div>
      <div class="li-main"><div class="li-en">情景闯关剧本</div><div class="li-cn">还原12种真实特情处置全过程</div></div>
      <span class="func-arrow">›</span>
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
        it.turns.forEach(t=>{ const isQ=t.speaker==='Q';
          html+=`<div class="bubble ${isQ?'left':'right'}"><div class="role-tag">${esc(t.role||t.speaker)}</div><div class="speakable" onclick="speak(${jsAttr(t.en)},null,null,${jsAttr(roleVoice(t.role))})">${esc(t.en)}</div>${t.cn?`<div class="cn">${esc(t.cn)}</div>`:''}<div class="b-play" ${pb(t.en, roleVoice(t.role))}>${PI}</div></div>`; });
      } else if(it.type==='qa'){
        html+=`<div class="qa-item">
          <div class="qa-q"><div class="qa-badge q">Q</div><div class="li-main"><div class="li-en speakable" onclick="speak(${jsAttr(it.q.en)})">${esc(it.q.en)}</div><div class="li-cn">${esc(it.q.cn)}</div></div><div class="play" ${pb(it.q.en)}>${PI}</div></div>
          ${it.a&&(it.a.en||it.a.cn)?`<div class="qa-a"><div class="qa-badge a">A</div><div class="li-main"><div class="li-en${it.a.en?' speakable':''}" ${it.a.en?`onclick="speak(${jsAttr(it.a.en)})"`:''}>${esc(it.a.en)}</div><div class="li-cn">${esc(it.a.cn)}</div></div>${it.a.en?`<div class="play" ${pb(it.a.en)}>${PI}</div>`:''}</div>`:''}
        </div>`;
      } else {
        html+=`<div class="list-item"><div class="li-main"><div class="li-en speakable" onclick="speak(${jsAttr(it.en)})">${esc(it.en)}</div><div class="li-cn">${esc(it.cn)}</div></div>${lineActs(it.en,it.cn)}<div class="play" ${pb(it.en)}>${PI}</div></div>`;
      }
    });
    return html+'<div class="safe"></div></div>';
  }, c.category, '');
}

/* =========================================================
   CHAT (答疑小助手 - 本地检索)
========================================================= */
let chatLog=[{from:'bot',text:'你好！我是答疑小助手\n输入中文或英文关键词，我会帮你找出相关的单词和常用句。例如：「安全带」「passport」「行李」。'}];
function openChat(){ navigate(renderChat,'答疑小助手',''); }
function renderChat(){
  let html=`<div class="view" style="padding-bottom:120rem"><div class="chat-wrap">`;
  chatLog.forEach(m=>{
    html+=`<div class="chat-msg ${m.from}">${m.text.split('\n').map(esc).join('<br>')}`;
    if(m.results){ m.results.forEach(r=>{ html+=`<div class="chat-result"><div class="li-en speakable" onclick="speak(${jsAttr(r.say||r.en)})">${esc(r.en)} <span class="pbtn-in" ${pb(r.say||r.en)}>${PI}</span></div><div class="li-cn">${esc(r.cn)}</div></div>`; }); }
    html+=`</div>`;
  });
  html+=`</div></div>
  <div class="chat-bar"><input id="chatIn" placeholder="输入关键词…" onkeydown="if(event.key==='Enter')sendChat()"><button onclick="sendChat()">查询</button></div>`;
  return html;
}
function searchAll(q){
  q=q.trim().toLowerCase(); if(!q) return [];
  const res=[];
  WORDS.forEach(w=>{ if(w.word.toLowerCase().includes(q)||w.meaning.includes(q)) res.push({en:w.word+' '+(w.phonetic||''),say:w.word,cn:w.meaning+(w.example?' · '+w.example:'')}); });
  SPEAKING.forEach(c=>c.list.forEach(it=>{ if(it.en.toLowerCase().includes(q)||it.cn.includes(q)) res.push({en:it.en,cn:it.cn}); }));
  SECURITY.forEach(p=>p.categories.forEach(c=>c.items.forEach(it=>{
    if(it.en&&(it.en.toLowerCase().includes(q)||(it.cn||'').includes(q))) res.push({en:it.en,cn:it.cn});
    if(it.q&&(it.q.en.toLowerCase().includes(q)||it.q.cn.includes(q))) res.push({en:it.q.en,cn:it.q.cn});
  })));
  /* 处置实战口语的句子也能查到，并注明出自哪个情景 */
  ((window.DATA&&window.DATA.drills)||[]).forEach(c=>c.scenes.forEach(s=>s.groups.forEach(g=>g.lines.forEach(l=>{
    if(l.en.toLowerCase().includes(q)||l.cn.includes(q)) res.push({en:l.en,cn:l.cn+' · 处置情景：'+s.title});
  }))));
  return res.slice(0,8);
}
function sendChat(){
  const inp=document.getElementById('chatIn'); const q=inp.value.trim(); if(!q) return;
  chatLog.push({from:'me',text:q});
  const r=searchAll(q);
  if(r.length) chatLog.push({from:'bot',text:`为你找到 ${r.length} 条相关内容：`,results:r});
  else chatLog.push({from:'bot',text:'没有找到相关内容，换个关键词试试？例如「安检」「hotel」「护照」。'});
  refresh();
  setTimeout(()=>{ window.scrollTo(0,document.body.scrollHeight); },30);
}

/* =========================================================
   ME (我的)
========================================================= */
/* 个人码显示剩余有效期；全员码显示长期有效 */
function accessNote(){
  const a=window.ACCESS||{};
  const id=a.codeId?`编号 ${a.codeId} · `:'';
  if(!a.ttl) return id+'内部学习平台 · 退出后学习记录不会丢失';
  const left=Math.max(0,Math.ceil((a.expiresAt-Date.now())/86400000));
  const d=new Date(a.expiresAt);
  return `${id}个人邀请码 · 剩余 ${left} 天（${d.getMonth()+1}月${d.getDate()}日到期）`;
}
function renderMe(){
  const name=LS.get('displayName','');
  const st=calcStreak(); const studied=LS.get('studiedWords',[]).length; const wrong=LS.get('wrongWords',[]).length;
  const xp = (typeof totalXP==='function') ? totalXP() : 0;
  const level = (typeof userLevel==='function') ? userLevel() : 1;
  return `<div class="view">
    <div class="card" style="display:flex;align-items:center;gap:20rem">
      <div class="welcome-avatar">${esc((name[0]||'游'))}</div>
      <div><div style="font-size:16px;font-weight:800">${esc(name||'游客')}</div><div style="font-size:12px;color:var(--muted)">五班英语角 · 空保英语 · Lv.${level}</div></div>
    </div>
    <div class="card" style="margin-top:20rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12rem">
        <div style="display:flex;align-items:center;gap:10rem"><div class="status-dot ${navigator.onLine?'done':''}"></div><span style="font-size:13px;font-weight:700">${navigator.onLine?'当前在线':'当前离线'}</span></div>
        <span class="badge-cnt">支持离线使用</span>
      </div>
      <div style="font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:${isStandalone()?'0':'14rem'}">全部单词、闯关关卡、情景剧本已缓存到本机；打卡、经验值、生词本等学习进度均保存在本机，没有信号也能继续学习。</div>
      ${isStandalone()? '' : `<button class="btn gold" onclick="installApp()">${(typeof isWeChat==='function'&&isWeChat())?'先在浏览器里打开，才能安装到主屏幕':'安装到主屏幕，随时离线打开'}</button>`}
    </div>
    <div class="daily-list" style="margin-top:20rem;grid-template-columns:repeat(3,1fr);">
      <div class="card" style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--text)">${studied}</div><div style="font-size:11px;color:var(--muted)">已学单词</div></div>
      <div class="card" style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--gold-dark)">${xp}</div><div style="font-size:11px;color:var(--muted)">经验值</div></div>
      <div class="card" style="text-align:center"><div style="font-size:22px;font-weight:800;color:#f59e0b">${st.streak}</div><div style="font-size:11px;color:var(--muted)">连续打卡</div></div>
    </div>
    <div class="card" style="margin-top:20rem">
      <div class="setting-row"><span style="font-size:13px;width:96rem">显示名称</span><input id="nameIn" value="${esc(name)}" placeholder="设置你的名字"><button class="setting-save" onclick="saveName()">保存</button></div>
      <div class="setting-row" style="margin-top:12rem">
        <span style="font-size:13px;width:96rem">朗读口音</span>
        <div style="display:flex;gap:8rem;flex:1">
          <button class="chip ${voiceAccent()==='GB'?'active':''}" onclick="setVoiceAccent('GB')">英音 🇬🇧</button>
          <button class="chip ${voiceAccent()==='US'?'active':''}" onclick="setVoiceAccent('US')">美音 🇺🇸</button>
        </div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:8rem;line-height:1.6">词库音标按英式标注，选英音可与音标对应；执勤实际通话更接近美音，可按需切换。</div>
      <div class="setting-row" style="margin-top:16rem">
        <span style="font-size:13px;width:96rem">外观</span>
        <div style="display:flex;gap:8rem;flex:1">
          ${[['auto','跟随系统'],['light','浅色'],['dark','深色']].map(([k,t])=>`<button class="chip ${themePref()===k?'active':''}" onclick="setTheme('${k}')">${t}</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="list-item arrow-item" style="margin-top:20rem" onclick="switchTab('words')"><div class="play p-gold">${icon('book')}</div><div class="li-main"><div class="li-en">闯关地图</div><div class="li-cn">继续学习进度</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openStoryList()"><div class="play p-red">${icon('alert')}</div><div class="li-main"><div class="li-en">情景闯关剧本</div><div class="li-cn">真实特情处置</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openReview()"><div class="play p-orange">${icon('star')}</div><div class="li-main"><div class="li-en">生词本</div><div class="li-cn">${wrong} 个待复习</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openFavs()"><div class="play p-violet">${icon('star')}</div><div class="li-main"><div class="li-en">我的收藏</div><div class="li-cn">${favList().length} 句 · 可放大给旅客看</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openQuiz()"><div class="play p-pink">Q</div><div class="li-main"><div class="li-en">单词测试</div><div class="li-cn">检验学习成果</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openChat()"><div class="play p-violet">${icon('robot')}</div><div class="li-main"><div class="li-en">答疑小助手</div><div class="li-cn">本地智能检索</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openBackup()"><div class="play p-blue">${icon('download')}</div><div class="li-main"><div class="li-en">进度备份与恢复</div><div class="li-cn">${lastBackupText()}</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="openFeedback('idea')"><div class="play p-teal">${icon('talk')}</div><div class="li-main"><div class="li-en">意见反馈</div><div class="li-cn">缺词、纠错、建议，一键复制发给管理员</div></div><span class="func-arrow">›</span></div>
    <div class="list-item arrow-item" onclick="accessLogout()"><div class="play p-slate">${icon('lock')}</div><div class="li-main"><div class="li-en">退出 / 更换邀请码</div><div class="li-cn">${accessNote()}</div></div><span class="func-arrow">›</span></div>
    <div class="links">
      <span onclick="resetCheckin()">重置打卡</span>·<span onclick="resetProgress()">重置闯关进度</span>·<span onclick="clearWrong()">清空生词本</span>·<span onclick="openAbout()">关于与诊断</span>
    </div>
    <div class="safe"></div>
  </div>`;
}
function saveName(){ const v=document.getElementById('nameIn').value.trim(); LS.set('displayName',v); toast('已保存'); refresh(); }
function resetCheckin(){ if(confirm('确定重置全部打卡记录？')){ LS.set('checkinHistory',[]); LS.set('lastCheckinDate',''); toast('已重置'); refresh(); } }
function resetProgress(){ if(confirm('确定重置闯关地图进度与经验值？')){ LS.set('lessonProgress',{}); LS.set('storyProgress',{}); LS.set('xp',0); toast('已重置'); refresh(); } }
function clearWrong(){ if(confirm('确定清空生词本？')){ LS.set('wrongWords',[]); toast('已清空'); refresh(); } }
function aboutApp(){ alert('五班英语角 · 空保英语\n\n民航安保执勤英语学习应用（闯关升级版）\n背单词参考多邻国式关卡设计，内含500+执勤词汇、情景闯关剧本与空保英语专题\n\n离线可用 · 数据存储于本机'); }

/* =========================================================
   PWA：离线缓存状态 / 添加到主屏幕
========================================================= */
let deferredInstallPrompt=null;
function isStandalone(){
  return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
}
window.addEventListener('beforeinstallprompt', e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  if(curTab==='me') refresh();
});
function isIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1); }
function installApp(){
  if(typeof isWeChat==='function' && isWeChat()){ showWeChatGuide(); return; }   // 微信里装不了，先引导到浏览器
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(()=>{ deferredInstallPrompt=null; refresh(); });
  }else if(isIOS()){
    showIOSInstallGuide();
  }else{
    toast('当前浏览器已自动缓存本站，也可在浏览器菜单中查找"安装应用"选项');
  }
}
function closeIOSGuide(){ const m=document.getElementById('iosGuideMask'); if(m) m.remove(); }
function showIOSInstallGuide(){
  if(document.getElementById('iosGuideMask')) return;
  const div=document.createElement('div');
  div.id='iosGuideMask';
  div.className='modal-mask';
  div.onclick=function(e){ if(e.target===div) closeIOSGuide(); };
  div.innerHTML=`<div class="modal-card">
    <div class="modal-title">3步添加到主屏幕</div>
    <div class="modal-step"><div class="modal-step-ic">${icon('share')}</div><div class="modal-step-txt"><b>1. 点击底部工具栏「分享」</b><div class="modal-step-sub">方框加向上箭头的图标</div></div></div>
    <div class="modal-step"><div class="modal-step-ic">${icon('addbox')}</div><div class="modal-step-txt"><b>2. 找到「添加到主屏幕」</b><div class="modal-step-sub">没看到就在弹出菜单里下滑查找</div></div></div>
    <div class="modal-step"><div class="modal-step-ic">${icon('check')}</div><div class="modal-step-txt"><b>3. 点右上角「添加」</b><div class="modal-step-sub">主屏幕出现图标后，离线也能直接打开</div></div></div>
    <button class="btn gold" onclick="closeIOSGuide()">知道了</button>
  </div>`;
  document.body.appendChild(div);
}
function installBannerHtml(){
  if(isStandalone() || LS.get('installBannerDismissed',false)) return '';
  if(typeof isWeChat==='function' && isWeChat()) return '';   // 微信里由「在浏览器打开」的提示接管
  const ios=isIOS();
  return `<div class="install-banner">
    <div class="install-banner-ic">${icon('plane')}</div>
    <div class="install-banner-text"><b>${ios?'一步添加到主屏幕':'安装到手机桌面'}</b><span>离线可用 · 进度自动保存</span></div>
    <button class="install-banner-btn" onclick="installApp()">${ios?'查看步骤':'安装'}</button>
    <span class="install-banner-close" onclick="dismissInstallBanner(event)">×</span>
  </div>`;
}
function dismissInstallBanner(e){ if(e){ e.stopPropagation(); } LS.set('installBannerDismissed',true); refresh(); }
window.addEventListener('online', ()=>{ toast('网络已恢复'); if(curTab==='me') refresh(); });
window.addEventListener('offline', ()=>{ toast('已离线 · 可继续学习，进度会保存在本机'); if(curTab==='me') refresh(); });

/* =========================================================
   全局朗读语速控制（悬浮按钮，任意页面可调）
========================================================= */
function setSpeechRate(v){
  LS.set('playRate', Math.round(Number(v)*100)/100);
  const lab=document.getElementById('speedFabLabel'); if(lab) lab.textContent=rateLabel(speechRate());
  const val=document.getElementById('speedVal'); if(val) val.textContent=rateLabel(speechRate());
}
function toggleSpeedPanel(){ const p=document.getElementById('speedPanel'); if(p) p.classList.toggle('open'); }
function speedTest(){ speak('Please show your boarding pass and ID.'); }
function initSpeedControl(){
  if(document.getElementById('speedFab')) return;
  const rate=speechRate();
  const wrap=document.createElement('div');
  wrap.className='speed-widget-wrap';
  wrap.innerHTML=`
    <div class="speed-panel" id="speedPanel">
      <div class="speed-panel-head"><span>朗读语速</span><span id="speedVal">${rateLabel(rate)}</span></div>
      <input type="range" id="speedSlider" min="0.5" max="1.5" step="0.05" value="${rate}" oninput="setSpeechRate(this.value)">
      <div class="speed-panel-labels"><span>慢速</span><span>正常 1.0x</span><span>快速</span></div>
      <button class="btn ghost" style="margin-top:14rem;padding:16rem;font-size:13px;" onclick="speedTest()"><span class="pbtn-in" style="pointer-events:none">${PI}</span> 试听效果</button>
    </div>
    <div class="speed-fab" id="speedFab" onclick="toggleSpeedPanel()">${icon('speaker')}<span id="speedFabLabel">${rateLabel(rate)}</span></div>
  `;
  document.body.appendChild(wrap);
  syncSpeedWidget();      // 首页第一次绘制发生在它创建之前：补一次，否则首页会多出一个悬浮的语速钮
}
