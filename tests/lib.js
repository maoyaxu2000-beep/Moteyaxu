/* 测试公共部分：起一个静态服务器 + 打开测试页 + 小工具 */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css', '.svg':'image/svg+xml', '.json':'application/json', '.webmanifest':'application/manifest+json', '.png':'image/png' };

function serve(port, root){
  root = root || ROOT;
  return new Promise(ok => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/')) p += 'index.html';
      if(p === '/favicon.ico'){ res.writeHead(204); return res.end(); }
      if(p === '/tests/icon.svg') p = '/icon.svg';          // 测试页在 tests/ 下，图标用相对路径时指回根目录
      const f = path.join(root, p);
      if(!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); return res.end('nf'); }
      res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    }).listen(port, '127.0.0.1', () => ok(srv));
  });
}
async function launch(opts, extraArgs){
  const browser = await chromium.launch({ args: ['--no-sandbox'].concat(extraArgs || []) });
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, permissions: [] }, opts || {}));
  return { browser, ctx };
}
/* 简易断言：失败会记录并在结尾统一退出非 0 */
const results = [];
function check(name, cond, extra){
  results.push({ name, ok: !!cond });
  console.log((cond ? '  ✓ ' : '  ✗ ') + name + (cond ? '' : '   ' + (extra === undefined ? '' : JSON.stringify(extra))));
}
function done(){
  const bad = results.filter(r => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} 通过`);
  process.exit(bad.length ? 1 : 0);
}
module.exports = { serve, launch, check, done, ROOT };
