const { chromium } = require('playwright-core');
const EXE = 'C:/Users/alex_/AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe';
(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1300, height: 800 } });
  // usuário comum
  await p.goto('http://127.0.0.1:52933/login.html');
  await p.evaluate(() => localStorage.clear());
  await p.goto('http://127.0.0.1:52933/signup.html?plan=BASIC');
  await p.fill('#name', 'Comum'); await p.fill('#email', 'comum@teste.com'); await p.fill('#password', 'senha12345');
  await p.click('#submitBtn'); await p.waitForURL('**/dashboard.html', { timeout: 8000 });
  console.log('admin link for comum:', await p.$$eval('.sidebar-link', a => a.some(x => x.textContent.includes('Admin'))));
  await p.goto('http://127.0.0.1:52933/admin.html'); await p.waitForTimeout(600);
  console.log('restricted?', (await p.$eval('#pageContent', e => e.innerText)).includes('Acesso restrito'));
  await p.screenshot({ path: 'shots/admin-restrito.png' });
  await b.close();
})();
