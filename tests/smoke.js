/* 冒烟测试：用模拟内容打开测试页，走一遍主要功能。运行：node tests/smoke.js */
const { serve, launch, check, done } = require('./lib');

(async () => {
  const srv = await serve(8123);
  const { browser, ctx } = await launch({ permissions: ['microphone', 'clipboard-read', 'clipboard-write'] }, ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('requestfailed', r => { if(process.env.DEBUG_REQ) console.log('   [requestfailed]', r.url().slice(0, 100), r.failure() && r.failure().errorText); });
  page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
  const url = 'http://127.0.0.1:8123/tests/harness.html';
  const ev = (fn, arg) => page.evaluate(fn, arg);

  console.log('· 首页');
  await page.goto(url);
  await page.waitForSelector('.welcome-card');
  check('首页渲染', await page.locator('.continue-card').count() === 1);
  check('首页第一次绘制就不显示语速悬浮钮', await ev(() => { const w = document.querySelector('.speed-widget-wrap'); return !!w && w.style.display === 'none'; }));
  check('没有复习记录时不显示「今日复习」', await page.locator('.srs-card').count() === 0);

  console.log('· 间隔复习');
  /* 学两个单词：一个「认识」、一个「还不熟」→ 登记进复习计划 */
  await ev(() => { quickWords(); });
  await page.waitForSelector('.flash');
  const w1 = await ev(() => wordSession.list[0].word);
  await ev(() => markKnownNext());
  const w2 = await ev(() => wordSession.list[wordSession.idx].word);
  await ev(() => addWrong());
  const D = await ev(() => ({ t: todayStr(), d1: addDays(1), d3: addDays(3) }));
  let srs = await ev(() => srsAll());
  check('认识 → 盒子 1，明天到期', srs['w:' + w1] && srs['w:' + w1].b === 1 && srs['w:' + w1].d === D.d1, srs['w:' + w1]);
  check('还不熟 → 盒子 0，今天到期', srs['w:' + w2] && srs['w:' + w2].b === 0 && srs['w:' + w2].d === D.t, srs['w:' + w2]);
  /* 把 w1 改成今天到期，模拟「明天」 */
  await ev(([k]) => { const m = srsAll(); m[k].d = todayStr(); srsSave(m); }, ['w:' + w1]);
  await ev(() => switchTab('home'));
  check('首页出现「今日复习」', await page.locator('.srs-card').count() === 1);
  check('今日复习数量为 2', (await page.locator('.srs-title b').innerText()) === '2');

  await ev(() => openSrsReview());
  await page.waitForSelector('.flash');
  check('进入复习页', await ev(() => srsSession && srsSession.list.length === 2));
  const first = await ev(() => srsSession.list[0].id), second = await ev(() => srsSession.list[1].id);
  check('盒子低的排在前面（0 号盒先复习）', first === w2 && second === w1, [first, second]);
  await ev(() => srsReveal());
  check('翻开后出现释义', await page.locator('.flash-meaning').count() === 1);
  await ev(() => srsAnswer(true));
  await ev(() => srsReveal()); await ev(() => srsAnswer(false));          // 第二张忘了 → 排到末尾再来一次
  check('忘了的卡片排到末尾重来', await ev(() => srsSession.list.length === 3 && !srsSession.done));
  await ev(() => srsReveal()); await ev(() => srsAnswer(true));
  check('复习结束', await ev(() => srsSession.done === true));
  srs = await ev(() => srsAll());
  check('记得的条目升一档（0 号盒 → 1 号，明天）', srs['w:' + w2].b === 1 && srs['w:' + w2].d === D.d1, srs['w:' + w2]);
  check('忘了、重来又答对：回到 0 号盒再升到 1 号', srs['w:' + w1].b === 1 && srs['w:' + w1].d === D.d1, srs['w:' + w1]);
  check('忘了的词同步进生词本', await ev(([w]) => LS.get('wrongWords', []).some(x => x.word === w), [w1]));
  check('经验值增加', await ev(() => totalXP()) >= 2);
  await ev(() => srsExit());
  check('回首页显示完成状态', await page.locator('.srs-card.done').count() === 1);
  /* 词库里已不存在的条目：不计入到期数，并被清掉 */
  await ev(() => { const m = srsAll(); m['w:不存在的词'] = { b: 0, d: todayStr(), t: 1 }; m['p:not a phrase'] = { b: 0, d: todayStr(), t: 1 }; srsSave(m); });
  check('失效条目不计入到期数', await ev(() => srsStats().due) === 0);
  check('失效条目被清理', await ev(() => !('w:不存在的词' in srsAll()) && !('p:not a phrase' in srsAll())));

  console.log('· 收藏');
  await ev(() => openSpeakCat(0));
  await page.waitForSelector('.ln-btn.fav');
  check('短语列表每行有收藏和展示按钮', await page.locator('.list-item .ln-btn').count() === 8);
  await page.locator('.ln-btn.fav').first().click();
  check('点星星 → 已收藏', await ev(() => favList().length === 1 && isFav('Please remain seated.')));
  check('星星高亮', await page.locator('.ln-btn.fav.on').count() === 1);
  await page.locator('.ln-btn.fav').first().click();
  check('再点一次取消收藏', await ev(() => favList().length === 0));
  await page.locator('.ln-btn.fav').nth(1).click(); await page.locator('.ln-btn.fav').nth(2).click();
  await ev(() => goBack()); await ev(() => openFavs());
  check('收藏页列出 2 句', await page.locator('.list-item').count() === 2);
  await ev(() => startFavPractice());
  check('可以练习收藏的句子', await ev(() => phraseSession && phraseSession.list.length === 2 && phraseSession.cat === '我的收藏'));
  await ev(() => goBack()); await ev(() => goBack());

  console.log('· 给旅客看');
  await ev(() => showCard('Please remain seated.', '请保持坐好。'));
  check('展示卡出现', await page.locator('#showCard .sc-en').innerText() === 'Please remain seated.');
  await page.locator('.sc-btn.ghost').click();
  check('可以隐藏中文', await page.locator('#scCn.off').count() === 1);
  await page.locator('.sc-close').click();
  check('关闭后移除', await page.locator('#showCard').count() === 0 && await ev(() => !document.body.classList.contains('sc-open')));

  console.log('· 执勤速查');
  await ev(() => switchTab('home'));
  await page.locator('.search-pill').click();
  await page.waitForSelector('#sIn');
  check('搜索页有常用速查', await page.locator('.sr-chips .chip').count() >= 10);
  await page.fill('#sIn', 'seat belt');
  await page.waitForSelector('.sr-item');
  check('英文搜索命中短语', await page.locator('.sr-item .li-en').first().innerText() === 'Please fasten your seat belt.');
  check('命中词高亮', await page.locator('.sr-item mark').count() >= 2);
  await page.fill('#sIn', '手机');
  await page.waitForFunction(() => [...document.querySelectorAll('.sr-item .li-en')].filter(e => /phone/i.test(e.innerText)).length >= 2);
  const hits = await page.locator('.sr-item .li-en').allInnerTexts();
  check('中文搜索命中短语与处置句', hits.includes('Turn off your phone, please.') && hits.includes('Sir, please turn off your phone.'), hits);
  await page.fill('#sIn', 'word1');
  const okFirst = await page.waitForFunction(() => { const e = document.querySelector('.sr-item .li-en'); return e && e.innerText.startsWith('word1 '); }, null, { timeout: 3000 }).then(() => true, () => false);
  check('单词精确匹配排在前面', okFirst);
  await page.fill('#sIn', 'zzzzqq');
  await page.waitForSelector('#sRes .empty');
  check('搜不到时给出提示', true);
  await page.fill('#sIn', 'passport'); await page.keyboard.press('Enter');
  check('回车后记入最近查过', await ev(() => LS.get('recentSearch', []).includes('passport')));
  await ev(() => goBack());

  console.log('· 速查排序与容错');
  const S = await ev(() => {
    const mk = (en, cn, src, o) => searchMake(en, cn, src, o);
    window.__corp = [
      mk('provide', '提供', '单词', { word: 1, eg: 'We provide help', egCn: '我们提供帮助' }),
      mk('seat belt', 'n. 安全带；座椅安全带', '单词', { word: 1, eg: 'Fasten your seat belt.', egCn: '请系好安全带。' }),
      mk('passport', '护照', '单词', { word: 1, eg: 'Show your passport.', egCn: '出示护照。' }),
      mk('cell phone', '手机', '单词', { word: 1 }),
      mk('ID card', '身份证', '单词', { word: 1 }),
      mk('Passengers must keep their phone in flight mode.', '旅客须将手机调为飞行模式。', '短语'),
      mk('Please turn off your cell phone.', '请关闭您的手机。', '短语'),
      mk('Please fasten your seat belt.', '请系好安全带。', '短语'),
      mk('May I see your passport?', '请出示您的护照。', '短语'),
      mk("Don't resist.", '不要反抗。', '短语'),
      mk('Please remain seated.', '请保持坐好。', '短语')
    ];
    const run = q => { const r = searchRunOn(window.__corp, q); return { list: r.list.map(x => x.en), loose: r.loose.map(x => x.en) }; };
    return { a: run('安全带'), b: run('seatbelt'), c: run('dont'), d: run('PASSPORT'), e: run('passports'), f: run('pasport'),
             g: run('旅客不系安全带怎么说'), h: run('id'), i: run('手机'), j: run('zzzzqq'), k: run('不要'), l: run('seat belt'), m: run('boarded seats') };
  });
  check('搜「安全带」：释义整条匹配的单词排第一', S.a.list[0] === 'seat belt', S.a);
  check('「seatbelt」连写也能找到「seat belt」', S.b.list.includes('Please fasten your seat belt.'), S.b);
  check('「dont」能找到 Don\'t resist.', S.c.list[0] === "Don't resist.", S.c);
  check('大小写不敏感，单词精确匹配排第一', S.d.list[0] === 'passport', S.d);
  check('复数「passports」归到相近结果', S.e.list.length === 0 && S.e.loose.includes('passport') && S.e.loose.includes('May I see your passport?'), S.e);
  check('拼错一个字母「pasport」归到相近结果', S.f.loose.includes('passport'), S.f);
  check('整句描述「旅客不系安全带怎么说」找到安全带相关句', S.g.list.length === 0 && S.g.loose.includes('Please fasten your seat belt.') && S.g.loose.includes('seat belt'), S.g);
  check('短词「id」不命中 provide', !S.h.list.includes('provide') && S.h.list.includes('ID card'), S.h);
  check('搜「手机」：单词最前，更短更贴近的句子在更长的前面',
    S.i.list[0] === 'cell phone' && S.i.list.indexOf('Please turn off your cell phone.') < S.i.list.indexOf('Passengers must keep their phone in flight mode.') && S.i.list.length === 3, S.i);
  check('毫不相干的词什么都不返回', S.j.list.length === 0 && S.j.loose.length === 0, S.j);
  check('搜「不要」命中「不要反抗」', S.k.list[0] === "Don't resist.", S.k);
  check('「seat belt」完整句子靠前', S.l.list.slice(0, 2).sort().join('|') === ['Please fasten your seat belt.', 'seat belt'].sort().join('|'), S.l);
  check('相近结果也有词干容错（boarded / seats）', S.m.loose.includes('Please remain seated.'), S.m);

  console.log('· 反馈与纠错');
  await ev(() => { openSearch(); });
  await page.waitForSelector('#sIn');
  await page.fill('#sIn', 'zzzzqq');
  await page.waitForSelector('#sRes .fb-link');
  check('搜不到时出现「告诉管理员」', true);
  await page.locator('#sRes .fb-link').click();
  const fbv = await page.inputValue('#fbText');
  check('反馈内容预填了搜索词、版本号', fbv.startsWith('【缺词】想查「zzzzqq」') && /五班英语角 v\d/.test(fbv), fbv);
  await page.fill('#fbText', fbv.replace('使用场景：', '使用场景：安检口'));
  await page.locator('#fbMask .btn.gold').click();
  const clip = await ev(() => navigator.clipboard.readText());
  check('点复制后写入剪贴板（含使用者补充的内容），弹窗关闭', clip.includes('使用场景：安检口') && await page.locator('#fbMask').count() === 0, clip);
  await page.fill('#sIn', 'passport');
  await page.waitForSelector('#sRes .sr-item');
  check('有结果时底部也有反馈入口', await page.locator('#sRes .fb-link').count() === 1);
  await ev(() => goBack());
  await ev(() => { phraseSession = { list: allPhrases().slice(0, 2), idx: 0, revealed: true, mode: 'study', cat: 't' }; navigate(renderPhraseFlash, 't', ''); });
  await page.locator('.fb-mini span').click();
  const fbv2 = await page.inputValue('#fbText');
  check('句子下方「纠错」预填英文和中文', fbv2.startsWith('【纠错】\n英文：Please remain seated.') && fbv2.includes('中文：请保持坐好。'), fbv2);
  await page.locator('#fbMask .btn.ghost').click();
  check('取消关闭弹窗', await page.locator('#fbMask').count() === 0);
  await ev(() => goBack());
  await ev(() => { wordSession = { list: WORDS.slice(0, 2), idx: 0, revealed: true, mode: 'study', cat: 't' }; navigate(renderFlash, 't', ''); });
  check('单词卡翻开后也有纠错入口', await page.locator('.fb-mini span').count() === 1);
  await ev(() => goBack());
  await ev(() => switchTab('me'));
  await page.locator('.arrow-item:has-text("意见反馈")').click();
  check('「我的」里的意见反馈', (await page.inputValue('#fbText')).startsWith('【意见】'));
  await ev(() => closeFeedback());
  await ev(() => switchTab('home'));

  console.log('· 跟读录音');
  await ev(() => { phraseSession = { list: allPhrases().slice(0, 3), idx: 0, revealed: true, mode: 'study', cat: 't' }; navigate(renderPhraseFlash, 't', ''); });
  check('支持录音的环境里显示「跟读」按钮', await page.locator('.lt-btn:has-text("跟读")').count() === 1);
  await page.locator('.lt-btn:has-text("跟读")').click();
  await page.waitForSelector('.lt-btn.rec.on');
  check('点击后进入录音中', true);
  await page.waitForTimeout(1500);
  await page.locator('.lt-btn.rec.on').click();
  await page.waitForSelector('.lt-btn:has-text("我的录音")', { timeout: 5000 });
  check('结束后出现「我的录音」「原声 → 我的」「重录」', await page.locator('.lt-btn:has-text("原声")').count() === 1 && await page.locator('.lt-btn:has-text("重录")').count() === 1);
  await page.locator('.lt-btn:has-text("我的录音")').click();
  check('可以播放自己的录音', await ev(() => !!recAudio));
  await ev(() => { recDiscard(); goBack(); });

  console.log('· 打卡海报');
  await ev(() => { doCheckin(); });
  await page.locator('text=生成打卡海报').click();
  await page.waitForSelector('#posterImg img', { timeout: 5000 });
  const dim = await ev(() => { const i = document.querySelector('#posterImg img'); return new Promise(ok => { if(i.complete) ok([i.naturalWidth, i.naturalHeight]); else i.onload = () => ok([i.naturalWidth, i.naturalHeight]); }); });
  check('海报是 1080×1620 的图片', dim[0] === 1080 && dim[1] === 1620, dim);
  if(process.env.SHOT_DIR) await page.screenshot({ path: process.env.SHOT_DIR + '/poster.png' });
  await ev(() => closePoster());
  check('关闭海报后移除', await page.locator('#posterMask').count() === 0);

  console.log('· 备份与恢复');
  await ev(() => { LS.set('xp', 300); LS.set('lessonProgress', { 'u1-l1': { stars: 3, xp: 80 } }); LS.set('displayName', '测试员');
    LS.set('drillMastery', { 'd1-0': 111 }); LS.set('drillWeak', { 'd1-1': 222 }); LS.set('checkinHistory', ['2026-10-01', '2026-10-02']);
    LS.set('studiedPhrases', ['Please remain seated.']); LS.set('phraseDir', 'en2cn'); });
  const snap = await ev(() => ({ sw: LS.get('studiedWords', []), srs: LS.get('srs', {}), favs: favList().map(f => f.en).sort(), xp: LS.get('xp', 0) }));
  const code = await ev(() => encodeBackup());
  check('备份码为压缩格式 WB2', code.startsWith('WB2.'), code.slice(0, 12));
  check('备份码体积合理（< 6KB）', code.length < 6000, code.length);
  check('备份码不含邀请码相关字段', !/wbAccess|wbActivated/.test(await ev(() => JSON.stringify(backupData()))));
  /* 清空本机 → 导入 → 与备份前一致 */
  await ev(() => { localStorage.clear(); });
  const sum = await ev(async c => mergeBackup(await decodeBackup(c)), code);
  const after = await ev(() => ({ sw: LS.get('studiedWords', []), srs: LS.get('srs', {}), favs: favList().map(f => f.en).sort(), xp: LS.get('xp', 0),
    lp: LS.get('lessonProgress', {}), name: LS.get('displayName', ''), dm: LS.get('drillMastery', {}), dw: LS.get('drillWeak', {}), ck: LS.get('checkinHistory', []),
    sp: LS.get('studiedPhrases', []), dir: LS.get('phraseDir', '') }));
  check('已学单词完整还原', JSON.stringify(after.sw.slice().sort()) === JSON.stringify(snap.sw.slice().sort()));
  check('复习计划完整还原', JSON.stringify(after.srs) === JSON.stringify(snap.srs));
  check('收藏、经验、关卡、名字还原', JSON.stringify(after.favs) === JSON.stringify(snap.favs) && after.xp === 300 && after.lp['u1-l1'].stars === 3 && after.name === '测试员', after);
  check('处置句掌握/待复习还原', after.dm['d1-0'] === 111 && after.dw['d1-1'] === 222);
  check('短语进度、打卡、设置还原', after.sp[0] === 'Please remain seated.' && after.ck.length === 2 && after.dir === 'en2cn', after);
  check('合并结果有统计', typeof sum.words === 'number' && sum.words === snap.sw.length, sum);
  /* 合并不覆盖：本机星级更高就保留；处置句取更新的一方 */
  await ev(() => { LS.set('lessonProgress', { 'u1-l1': { stars: 3, xp: 80 }, 'u1-l2': { stars: 1, xp: 10 } }); LS.set('xp', 999); LS.set('drillMastery', {}); LS.set('drillWeak', { 'd1-0': 999 }); });
  await ev(async c => mergeBackup(await decodeBackup(c)), code);
  const m2 = await ev(() => ({ lp: LS.get('lessonProgress', {}), xp: LS.get('xp', 0), dm: LS.get('drillMastery', {}), dw: LS.get('drillWeak', {}) }));
  check('合并保留本机更高的经验值和已有关卡', m2.xp === 999 && m2.lp['u1-l2'].stars === 1 && m2.lp['u1-l1'].stars === 3);
  check('处置句以较新的记录为准', m2.dw['d1-0'] === 999 && !m2.dm['d1-0'], m2);
  /* 坏输入 */
  const errTxt = async t => ev(async x => { try{ await decodeBackup(x); return ''; }catch(e){ return e.message; } }, t);
  check('截断的备份码被识别', (await errTxt(code.slice(0, code.length - 40))).includes('不完整'));
  check('乱写的内容被拒绝', (await errTxt('hello world')).includes('不是五班英语角'));
  check('中间夹了换行/空格也能识别', (await errTxt(code.replace(/(.{60})/g, '$1\n  '))) === '');
  const evil = await ev(() => { try{ mergeBackup({ app: 'wuban', d: { sw: 'x', lp: [], srs: { 'w:word1': 'bad', 'zz': [1, 'a', 2] }, dm: 5, fv: [1, null, ['ok', 5, 'x']], ck: [1, 'abc'], xp: 'NaN', set: 7 } }); return 'ok'; }catch(e){ return String(e); } });
  check('损坏的备份数据不会让程序出错', evil === 'ok', evil);
  await ev(() => { openBackup(); });
  await page.waitForFunction(() => { const t = document.getElementById('bkOut'); return t && t.value.startsWith('WB'); });
  check('备份页生成备份码', true);
  await ev(() => goBack());

  console.log('· 外观与关于');
  await ev(() => setTheme('dark'));
  check('深色：data-theme=dark', await ev(() => document.documentElement.dataset.theme) === 'dark');
  await ev(() => setTheme('light'));
  check('浅色：data-theme=light', await ev(() => document.documentElement.dataset.theme) === 'light');
  await ev(() => setTheme('auto'));
  check('跟随系统（测试环境为浅色）', await ev(() => document.documentElement.dataset.theme) === 'light');
  await ev(() => openAbout());
  await page.waitForSelector('.about-row');
  const dt = await ev(() => diagText());
  check('诊断信息含版本号', dt.includes('五班英语角 v'));
  check('诊断信息不含邀请码/密钥字段', !/wbAccess|"k":|code/i.test(dt));
  await ev(() => goBack());
  await ev(() => switchTab('me'));
  check('我的页有备份、收藏、外观入口', await page.locator('text=进度备份与恢复').count() >= 1 && await page.locator('text=我的收藏').count() >= 1 && await page.locator('text=跟随系统').count() === 1);
  await ev(() => switchTab('home'));

  console.log('· 备份提醒');
  const keep = await ev(() => ({ w: LS.get('studiedWords', []), p: LS.get('studiedPhrases', []), d: LS.get('drillMastery', {}) }));
  const nudge = () => ev(() => { switchTab('home'); const b = document.querySelector('.install-banner-text b'); return b ? b.textContent : ''; });
  await ev(() => { LS.set('installBannerDismissed', true); LS.set('studiedWords', WORDS.slice(0, 20).map(w => w.word)); LS.set('firstUse', Date.now() - 10 * 86400000); LS.set('lastBackup', 0); LS.set('backupNudgeAt', 0); });
  check('用了一周以上、有进度、从没备份：首页提醒', (await nudge()) === '学习进度还没备份过');
  await ev(() => { LS.set('lastBackup', Date.now() - 9 * 86400000); });
  check('上次备份在 9 天前：提示天数', (await nudge()) === '已 9 天没备份进度');
  await page.locator('.install-banner-close').click();
  check('关掉后不再出现，并记下时间', await page.locator('.install-banner').count() === 0 && await ev(() => LS.get('backupNudgeAt', 0) > 0));
  await ev(() => { LS.set('backupNudgeAt', 0); LS.set('lastBackup', Date.now() - 2 * 86400000); });
  check('最近备份过：不提醒', (await nudge()) === '');
  await ev(() => { LS.set('lastBackup', 0); LS.set('firstUse', Date.now() - 2 * 86400000); });
  check('刚开始用（不满一周）：不提醒', (await nudge()) === '');
  await ev(() => { LS.set('firstUse', Date.now() - 10 * 86400000); LS.set('studiedWords', ['word1']); LS.set('studiedPhrases', []); LS.set('drillMastery', {}); });
  check('几乎没有进度：不提醒', (await nudge()) === '');
  await ev(([k]) => { LS.set('studiedWords', k.w); LS.set('studiedPhrases', k.p); LS.set('drillMastery', k.d); LS.set('lastBackup', 0); LS.set('installBannerDismissed', false); LS.set('backupNudgeAt', 0); }, [keep]);

  console.log('· 微信内打开');
  const WXUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47(0x18002f2c) NetType/WIFI Language/zh_CN';
  const wctx = await browser.newContext({ userAgent: WXUA, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const wp = await wctx.newPage(); wp.on('pageerror', e => errors.push(String(e)));
  await wp.goto(url); await wp.waitForSelector('.welcome-card');
  check('微信里首页顶部是「用浏览器打开」，没有 Safari 安装步骤', await wp.locator('.wx-banner').count() === 1 && await wp.locator('.install-banner:not(.wx-banner)').count() === 0 && await wp.evaluate(() => installBannerHtml() === ''));
  await wp.locator('.wx-banner .install-banner-btn').click();
  check('点开是引导弹窗，含备份与复制网址', await wp.locator('#wxGuideMask').count() === 1 && await wp.locator('#wxGuideMask .btn').count() === 3);
  await wp.locator('#wxGuideMask .btn.ghost:has-text("知道了")').click();
  await wp.evaluate(() => switchTab('home'));
  check('点「知道了」后 3 天内首页不再提示', await wp.locator('.wx-banner').count() === 0 && await wp.locator('#wxGuideMask').count() === 0);
  await wp.evaluate(() => switchTab('me'));
  check('「我的」里的安装按钮在微信中改为引导', (await wp.locator('button:has-text("先在浏览器里打开")').count()) === 1);
  await wp.locator('button:has-text("先在浏览器里打开")').click();
  check('点它弹出引导', await wp.locator('#wxGuideMask').count() === 1);
  check('诊断信息标明在微信里', await wp.evaluate(() => diagText().includes('微信内打开：是')));
  await wp.evaluate(() => closeWeChatGuide());
  await wctx.close();
  check('普通浏览器里没有微信提示', await page.locator('.wx-banner').count() === 0 && await ev(() => !isWeChat()));

  console.log('· 其它页面不报错');
  await ev(() => openStoryList());
  await ev(() => switchTab('speaking'));
  await ev(() => switchTab('security'));
  await ev(() => switchTab('me'));
  await ev(() => openDrills());
  await ev(() => openDrillScene('d1'));
  await ev(() => switchTab('home'));

  check('全程没有脚本错误', errors.length === 0, errors);
  await browser.close(); srv.close(); done();
})().catch(e => { console.error(e); process.exit(2); });
