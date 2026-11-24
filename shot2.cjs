const { chromium } = require("playwright-core");
const fs=require("fs"), path=require("path");
(async () => {
  const base = "C:/Users/alex_/AppData/Local/ms-playwright";
  const d = fs.readdirSync(base).filter(x=>x.startsWith("chromium-")).sort().pop();
  const exe = path.join(base, d, "chrome-win64", "chrome.exe");
  const b = await chromium.launch({ executablePath: exe });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs=[]; p.on("pageerror", e=>errs.push("PAGEERROR: "+e.message)); p.on("console", m=>{if(m.type()==="error")errs.push(m.text())});
  const B="http://127.0.0.1:52933/";
  await p.goto(B+"login.html", {waitUntil:"networkidle"});
  await p.click("#demoBtn");
  await p.waitForURL("**/dashboard.html", {timeout:8000}); await p.waitForTimeout(600);
  // criar artigo flow
  await p.goto(B+"criar-artigo.html", {waitUntil:"networkidle"});
  await p.fill("#topic","como fazer pão de fermentação natural");
  await p.click("#titlesBtn"); await p.waitForTimeout(300);
  await p.screenshot({ path:"shots/criar-artigo.png" });
  await p.click("#generateBtn"); await p.waitForTimeout(1500);
  await p.screenshot({ path:"shots/criar-artigo-gen.png" });
  await p.waitForTimeout(3200);
  await p.screenshot({ path:"shots/criar-artigo-done.png" });
  // dark mode
  await p.goto(B+"dashboard.html", {waitUntil:"networkidle"});
  await p.click("#themeBtn"); await p.waitForTimeout(400);
  await p.screenshot({ path:"shots/dashboard-dark.png" });
  await p.click("#themeBtn");
  // signup
  await p.goto(B+"signup.html?plan=PRO", {waitUntil:"networkidle"});
  await p.screenshot({ path:"shots/signup.png" });
  console.log("ERR:", JSON.stringify(errs,null,1));
  await b.close();
})();
