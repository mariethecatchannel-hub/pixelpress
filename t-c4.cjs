const { chromium } = require('playwright-core');
const EXE = 'C:/Users/alex_/AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe';
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('http://127.0.0.1:52933/login.html');
  await p.fill('#email', 'demo@pixelpress.com.br'); await p.fill('#password', 'demo123');
  await p.click('#submitBtn'); await p.waitForURL('**/dashboard.html');
  await p.goto('http://127.0.0.1:52933/admin.html'); await p.waitForTimeout(500);
  await p.click('#tabs [data-tab="coupons"]'); await p.waitForTimeout(300);
  await p.click('#newCoupon'); await p.waitForTimeout(300);
  await p.fill('#cCode', 'ZZTOP');
  console.log('before save codes:', await p.evaluate(() => WB.admin.data().coupons.length));
  await p.click('#save'); await p.waitForTimeout(600);
  console.log('after save codes:', await p.evaluate(() => WB.admin.data().coupons.map(c=>c.code)));
  console.log('toasts:', await p.$$eval('.toast', t => t.map(x => x.innerText)));
  await b.close();
})();
