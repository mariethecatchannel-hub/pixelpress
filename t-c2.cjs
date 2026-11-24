const { chromium } = require('playwright-core');
const EXE = 'C:/Users/alex_/AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe';
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:52933/login.html');
  await p.fill('#email', 'demo@pixelpress.com.br'); await p.fill('#password', 'demo123');
  await p.click('#submitBtn'); await p.waitForURL('**/dashboard.html');
  await p.goto('http://127.0.0.1:52933/admin.html'); await p.waitForTimeout(500);
  console.log(await p.evaluate(() => WB.admin.data().coupons.map(c => c.code)));
  await p.evaluate(() => { const d = WB.admin.data(); d.coupons.unshift({id:'c_x', code:'DIRETO1', kind:'percent', value:10, months:1, maxUses:5, uses:0, expiresAt:null, active:true}); WB.admin.save(); });
  await p.reload(); await p.waitForTimeout(500);
  console.log('after reload:', await p.evaluate(() => WB.admin.data().coupons.map(c => c.code)));
  await b.close();
})();
