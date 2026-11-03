/* 冒烟测试：用模拟内容打开测试页，走一遍主要功能。运行：node tests/smoke.js */
const { serve, launch, check, done } = require('./lib');

(async () => {
  const srv = await serve(8123);
  const { browser, ctx } = await launch();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
  const url = 'http://127.0.0.1:8123/tests/harness.html';
  const ev = (fn, arg) => page.evaluate(fn, arg);

  console.log('· 首页');
  await page.goto(url);
  await page.waitForSelector('.welcome-card');
  check('首页渲染', await page.locator('.continue-card').count() === 1);
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
  await page.waitForFunction(() => document.querySelectorAll('.sr-item').length >= 2);
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
