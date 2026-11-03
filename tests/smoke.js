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
