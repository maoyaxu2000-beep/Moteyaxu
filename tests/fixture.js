/* 生成「进入页」测试用的假站点：用脚本现场生成的测试主密钥、测试邀请码，
   加密方式与 admin/build_secure.py 一致（PBKDF2-SHA256 → AES-256-GCM），但完全独立，不涉及任何真实密钥。 */
const crypto = require('crypto'), fs = require('fs'), os = require('os'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const norm = c => String(c).toUpperCase().replace(/[^A-Z0-9]/g, '');
const b64 = b => Buffer.from(b).toString('base64');
const gcm = (key, plain) => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(plain), c.final()]); return Buffer.concat([iv, ct, c.getAuthTag()]); };

/* entries: [{ code, ttl }]；返回 { master, kid, keysJson } */
function makeKeys(entries, iter){
  iter = iter || 1000;                                        // 测试里调低迭代次数，进入更快
  const master = crypto.randomBytes(32), kid = crypto.createHash('sha256').update(master).digest().subarray(0, 4).toString('hex');
  const list = entries.map(e => {
    const n = norm(e.code), salt = crypto.randomBytes(16);
    const kek = crypto.pbkdf2Sync(Buffer.from(n), salt, iter, 32, 'sha256');
    const o = { id: n.slice(0, 4), salt: b64(salt), wk: b64(gcm(kek, master)) };
    if(e.ttl) o.ttl = e.ttl; return o;
  });
  return { master, kid, keysJson: JSON.stringify({ iter, kid, entries: list }) };
}
function dataEnc(master, marker){
  const mock = fs.readFileSync(path.join(__dirname, 'mock-data.js'), 'utf8');
  return gcm(master, Buffer.from(mock + `\nwindow.DATA.marker=${JSON.stringify(marker || 'v1')};`));
}
/* 把真实的页面/脚本复制到临时目录，配上测试用的 keys.json 和 data.enc */
function makeSite(entries){
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb-gate-'));
  ['index.html', 'style.css', 'icons.js', 'lock.js', 'app.js', 'features.js', 'engine.js', 'drills.js', 'sw.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png']
    .forEach(f => fs.copyFileSync(path.join(ROOT, f), path.join(dir, f)));
  fs.mkdirSync(path.join(dir, 'audio'));
  ['gb', 'us', 'gb2', 'us2'].forEach(n => fs.writeFileSync(path.join(dir, 'audio', n + '.js'), 'window.AUDIO_IDX=window.AUDIO_IDX||{};'));
  const site = { dir, entries, k: null,
    publish(marker, newEntries){                              // 重新生成密钥并发布（marker 区分内容版本）
      if(newEntries) site.entries = newEntries;
      site.k = makeKeys(site.entries);
      fs.writeFileSync(path.join(dir, 'keys.json'), site.k.keysJson);
      fs.writeFileSync(path.join(dir, 'data.enc'), dataEnc(site.k.master, marker));
    },
    writeKeys(entries){                                       // 只改钥匙表（比如作废某个码），主密钥不变
      /* 复用原主密钥重新包裹（kid 不变），模拟管理员只作废某个码 */
      const iter = 1000, list = entries.map(e => { const n = norm(e.code), salt = crypto.randomBytes(16);
        const kek = crypto.pbkdf2Sync(Buffer.from(n), salt, iter, 32, 'sha256');
        const o = { id: n.slice(0, 4), salt: b64(salt), wk: b64(gcm(kek, site.k.master)) }; if(e.ttl) o.ttl = e.ttl; return o; });
      fs.writeFileSync(path.join(dir, 'keys.json'), JSON.stringify({ iter, kid: site.k.kid, entries: list }));
    } };
  return site;
}
module.exports = { makeSite, norm };
