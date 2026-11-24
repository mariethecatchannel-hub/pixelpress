const { chromium } = require('playwright-core');
const EXE = 'C:/Users/alex_/AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe';
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:52933/login.html');
  await p.fill('#email', 'demo@pixelpress.com.br'); await p.fill('#password', 'demo123');
  await p.click('#submitBtn'); await p.waitForURL('**/dashboard.html');
  await p.goto('http://127.0.0.1:52933/admin.html'); await p.waitForTimeout(500);
  await p.click('#tabs [data-tab="coupons"]'); await p.waitForTimeout(300);
  await p.click('#newCoupon'); await p.waitForTimeout(300);
  await p.fill('#cCode', 'ZZTOP');
  await p.click('#save'); await p.waitForTimeout(600);
  console.log('data:', await p.evaluate(() => WB.admin.data().coupons.map(c => c.code)));
  console.log('tabs active:', await p.$$eval('#tabs .tab.active', t => t.map(x => x.textContent)));
  console.log("body text has ZZTOP:", (await p.$eval("#tabBody", e => e.innerText)).includes("ZZTOP")); console.log("codes:", (await p.$eval("#tabBody", e => e.innerText)).match(/[A-Z0-9]{4,}/g));
  await b.close();
})();
