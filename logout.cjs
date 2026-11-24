const { chromium } = require("playwright-core");
const fs=require("fs"), path=require("path");
(async () => {
  const base = "C:/Users/alex_/AppData/Local/ms-playwright";
  const d = fs.readdirSync(base).filter(x=>x.startsWith("chromium-")).sort().pop();
  const b = await chromium.launch({ executablePath: path.join(base, d, "chrome-win64", "chrome.exe") });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const B="http://127.0.0.1:52933/";
  await p.goto(B+"login.html",{waitUntil:"networkidle"});
  await p.click("#demoBtn"); await p.waitForURL("**/dashboard.html",{timeout:8000});
  await p.goto(B+"perfil.html",{waitUntil:"networkidle"});
  await p.click("#logoutBtn2"); await p.waitForTimeout(1200);
  console.log("after logout url:", p.url());
  await p.goto(B+"dashboard.html",{waitUntil:"networkidle"}); await p.waitForTimeout(800);
  console.log("protected redirects to:", p.url());
  // wrong password
  await p.goto(B+"login.html",{waitUntil:"networkidle"});
  await p.fill("#email","demo@pixelpress.com.br"); await p.fill("#password","errada");
  await p.click("#submitBtn"); await p.waitForTimeout(900);
  console.log("wrong pw toasts:", await p.locator(".toast").allInnerTexts().catch(()=>[]));
  await b.close();
})();
