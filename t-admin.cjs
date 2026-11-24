const { chromium } = require('playwright-core');
const EXE = 'C:/Users/alex_/AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe';
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto('http://127.0.0.1:52933/login.html');
  await p.evaluate(() => { localStorage.clear(); });
  await p.goto('http://127.0.0.1:52933/login.html');
  await p.fill('#email', 'demo@pixelpress.com.br');
  await p.fill('#password', 'demo123');
  await p.click('#submitBtn');
  await p.waitForURL('**/dashboard.html', { timeout: 8000 });
  console.log('login ok');
  await p.goto('http://127.0.0.1:52933/admin.html');
  await p.waitForTimeout(800);
  console.log('title:', await p.title());
  console.log('stats:', await p.$$eval('.stat-value', els => els.map(e => e.textContent.trim())));
  // grant bonus
  await p.click('#grantBtn');
  await p.waitForTimeout(400);
  await p.fill('#gAmount', '25');
  await p.fill('#gReason', 'Teste automatizado');
  await p.click('#save');
  await p.waitForTimeout(600);
  const rows = await p.$$eval('#tabBody tbody tr', r => r.length);
  console.log('bonus rows:', rows);
  console.log('first row:', (await p.$eval('#tabBody tbody tr', r => r.innerText)).replace(/\n/g, ' | ').slice(0, 120));
  // tabs
  for (const t of ['users','coupons','rules','logs']) {
    await p.click(`#tabs [data-tab="${t}"]`);
    await p.waitForTimeout(300);
    console.log(t, '->', (await p.$eval('#tabBody', e => e.innerText)).slice(0, 60).replace(/\n/g,' '));
  }
  // coupon create
  await p.click('#tabs [data-tab="coupons"]'); await p.waitForTimeout(300);
  console.log('tab after click:', await p.$$eval('#tabs .tab.active', t => t.map(x => x.textContent)), 'modal visible:', await p.isVisible('#newCoupon'));
  await p.waitForTimeout(200);
  await p.click('#newCoupon');
  await p.waitForTimeout(300);
  await p.fill('#cCode', 'TESTE99');
  await p.click('#save');
  await p.waitForTimeout(500);
  console.log('modal content:', (await p.$eval('#modalBox', e => e.innerText)).slice(0,80).replace(/\n/g,' '));
  console.log('modal open?', await p.$eval('#modalBackdrop', e => e.className));
  console.log('body snippet:', (await p.$eval('#tabBody', e => e.innerText)).slice(0, 120).replace(/\n/g,' '));
  console.log('data codes:', await p.evaluate(() => WB.admin.data().coupons.map(c => c.code)));
  console.log('active tab:', await p.$$eval('#tabs .tab.active', t => t.map(x => x.textContent)));
  console.log('coupon codes:', await p.$$eval('#tabBody tbody tr td:first-child', t => t.map(x => x.innerText.trim())));
  // sidebar shows bonus
  await p.goto('http://127.0.0.1:52933/dashboard.html');
  await p.waitForTimeout(600);
  console.log('sidebar plan:', (await p.$eval('.sidebar-plan', e => e.innerText)).replace(/\n/g,' | '));
  console.log('admin link:', await p.$$eval('.sidebar-link', a => a.some(x => x.textContent.includes('Admin'))));
  await p.screenshot({ path: 'shots/admin.png', fullPage: true });
  await p.goto('http://127.0.0.1:52933/admin.html');
  await p.waitForTimeout(700);
  await p.screenshot({ path: 'shots/admin.png', fullPage: true });
  console.log('ERRS:', errs);
  await b.close();
})();
