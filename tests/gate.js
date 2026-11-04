/* 进入页（邀请码）流程测试：用现场生成的测试密钥和测试邀请码，覆盖
   错码 / 正确码 / 之后免输入 / 离线再进 / 管理员作废 / 更换主密钥 / 个人码过期。运行：node tests/gate.js */
const { serve, launch, check, done } = require('./lib');
const { makeSite } = require('./fixture');

const CODE = 'WBTE-ABCD-EFGH-JKLM', CODE2 = 'WBT2-ABCD-EFGH-JKLM', TEMP = 'WBTT-ABCD-EFGH-JKLM';

(async () => {
  const site = makeSite([{ code: CODE }, { code: CODE2 }, { code: TEMP, ttl: 1 }]);
  site.publish('v1');
  const srv = await serve(8131, site.dir);
  const base = 'http://127.0.0.1:8131/index.html';
  const { browser, ctx } = await launch();
  const errors = [];
  const open = async () => { const p = await ctx.newPage(); p.on('pageerror', e => errors.push(String(e))); await p.goto(base); return p; };
  const home = p => p.waitForSelector('.welcome-card', { timeout: 15000 }).then(() => true, () => false);
  const gateMsg = async p => { await p.waitForSelector('#gateMsg'); return (await p.locator('#gateMsg').innerText()).trim(); };
  const login = async (p, code) => { await p.fill('#gateCode', code); await p.click('#gateBtn'); };

  console.log('· 首次进入');
  let p = await open();
  await p.waitForSelector('#gateCode');
  check('首次打开显示邀请码输入页', true);
  check('普通浏览器的进入页没有微信提示', await p.locator('.gate-wx').count() === 0);
  const wctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 MicroMessenger/8.0.47.2560 NetType/WIFI' });
  const wpg = await wctx.newPage(); await wpg.goto(base); await wpg.waitForSelector('#gateCode');
  check('微信里的进入页提示换浏览器打开', await wpg.locator('.gate-wx').count() === 1 && /在浏览器打开/.test(await wpg.locator('.gate-wx').innerText()));
  await wctx.close();
  await login(p, 'ABCD-ABCD-EFGH-JKLM');
  await p.waitForFunction(() => /不正确|停用/.test(document.getElementById('gateMsg').textContent), null, { timeout: 15000 });
  check('不存在的邀请码被拒绝', /不正确|停用/.test(await gateMsg(p)));
  await login(p, 'WBTE-AAAA-EEEE-JKLM');
  await p.waitForFunction(() => /不正确|停用/.test(document.getElementById('gateMsg').textContent) && !document.getElementById('gateBtn').disabled, null, { timeout: 15000 });
  check('前 4 位对、后面错的邀请码被拒绝', true);
  await login(p, 'WBTE-ABCD');
  check('位数不够时有提示', /16 位/.test(await gateMsg(p)));
  await login(p, CODE);
  check('正确邀请码进入首页', await home(p));
  check('页面看得到学习内容', (await p.evaluate(() => window.DATA && window.DATA.marker)) === 'v1');
  const wm = await p.evaluate(() => { const w = document.getElementById('wbMark'); return w ? decodeURIComponent(w.style.backgroundImage) : ''; });
  check('水印里带邀请码编号（前 4 位），不含完整邀请码', wm.includes('WBTE') && !wm.includes('ABCD-EFGH') && !wm.includes('ABCDEFGH'), wm.slice(0, 80));
  const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('wbAccess') || 'null'));
  check('本机保存了进入凭证', stored && stored.kid === site.k.kid);
  /* 等离线服务接管，再刷新一次让它把内容缓存起来 */
  await p.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await p.waitForTimeout(800);
  await p.reload(); await home(p); await p.waitForTimeout(3500);
  await p.close();

  console.log('· 再次进入');
  p = await open();
  check('再次打开直接进首页，不再要邀请码', await home(p));
  check('进入后没有残留的进入页', await p.locator('#gateCode').count() === 0);
  await p.close();

  console.log('· 离线');
  await ctx.setOffline(true);
  p = await open();
  check('断网也能进入', await home(p));
  await p.close();
  await ctx.setOffline(false);

  console.log('· 管理员作废某个邀请码');
  site.writeKeys([{ code: CODE2 }, { code: TEMP, ttl: 1 }]);   // 去掉 CODE
  p = await open();
  await p.waitForSelector('#gateCode', { timeout: 20000 }).catch(() => {});
  check('被作废的码下次联网打开要求重新输入', await p.locator('#gateCode').count() === 1);
  check('提示「已停用」', /停用/.test(await gateMsg(p)));
  check('本机凭证已清除', await p.evaluate(() => localStorage.getItem('wbAccess')) === null);
  await login(p, CODE2);
  check('其它邀请码不受影响', await home(p));
  await p.close();

  console.log('· 更换主密钥');
  site.publish('v2', [{ code: CODE2 }, { code: TEMP, ttl: 1 }]);
  p = await open();
  await p.waitForFunction(() => window.DATA && window.DATA.marker === 'v2', null, { timeout: 25000 }).catch(() => {});
  check('换密钥后自动用保存的邀请码换新钥匙并加载新内容', (await p.evaluate(() => window.DATA && window.DATA.marker)) === 'v2');
  check('进入页没有挡在前面', await p.locator('#gateCode').count() === 0);
  await p.close();

  console.log('· 个人邀请码有效期');
  p = await open();
  await p.evaluate(() => { localStorage.removeItem('wbAccess'); });
  await p.reload(); await p.waitForSelector('#gateCode');
  await login(p, TEMP);
  check('个人码可以进入', await home(p));
  check('「我的」页能看到到期时间', await p.evaluate(() => /剩余 1 天|剩余 \d 天/.test(accessNote())));
  await p.evaluate(() => { const m = JSON.parse(localStorage.getItem('wbActivated')); Object.keys(m).forEach(k => m[k] = Date.now() - 3 * 86400000); localStorage.setItem('wbActivated', JSON.stringify(m)); });
  await p.reload();
  await p.waitForSelector('#gateCode', { timeout: 15000 }).catch(() => {});
  check('超过有效期后要求重新获取邀请码', /过期/.test(await gateMsg(p)));
  await p.close();

  check('全程没有脚本错误', errors.length === 0, errors);
  await browser.close(); srv.close(); done();
})().catch(e => { console.error(e); process.exit(2); });
