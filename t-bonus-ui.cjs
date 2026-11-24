const { chromium } = require('playwright-core');
const EXE = 'C:/Users/alex_/AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe';
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.goto('http://127.0.0.1:52933/login.html');
  await p.evaluate(() => localStorage.clear());
  await p.goto('http://127.0.0.1:52933/login.html');
  await p.fill('#email', 'demo@pixelpress.com.br'); await p.fill('#password', 'demo123');
  await p.click('#submitBtn'); await p.waitForURL('**/dashboard.html');
  await p.waitForTimeout(500);
  const stats = await p.$$eval('.stat', s => s.map(x => x.innerText.replace(/\n/g, ' | ')));
  console.log('DASHBOARD:'); stats.forEach(s => console.log(' -', s));
  await p.screenshot({ path: 'shots/dashboard-bonus.png', fullPage: true });

  await p.goto('http://127.0.0.1:52933/planos.html'); await p.waitForTimeout(500);
  console.log('PLANOS hero:', (await p.$eval('.card-pad', e => e.innerText)).replace(/\n/g, ' | '));

  await p.goto('http://127.0.0.1:52933/perfil.html'); await p.waitForTimeout(500);
  const cards = await p.$$eval('.card', c => c.map(x => x.innerText.slice(0, 90).replace(/\n/g, ' | ')));
  console.log('PERFIL cards:', cards.filter(c => c.includes('ônus') || c.includes('Bônus')));
  await p.screenshot({ path: 'shots/perfil-bonus.png', fullPage: true });
  console.log('ERRS:', errs);
  await b.close();
})();
