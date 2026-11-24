const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");
(async () => {
  const base = "C:/Users/alex_/AppData/Local/ms-playwright";
  const dirs = fs.readdirSync(base).filter(d => d.startsWith("chromium-")).sort();
  const exe = path.join(base, dirs[dirs.length - 1], "chrome-win64", "chrome.exe");
  console.log("exe:", exe, fs.existsSync(exe));
  const b = await chromium.launch({ executablePath: exe });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  const B = "http://127.0.0.1:52933/";
  await p.goto(B + "index.html", { waitUntil: "networkidle" });
  await p.screenshot({ path: "shots/01-home.png" });
  await p.goto(B + "login.html", { waitUntil: "networkidle" });
  await p.screenshot({ path: "shots/02-login.png" });
  await p.fill("#email", "demo@pixelpress.com.br");
  await p.fill("#password", "demo123");
  await p.click("#submitBtn");
  await p.waitForURL("**/dashboard.html", { timeout: 8000 });
  await p.waitForTimeout(700);
  await p.screenshot({ path: "shots/03-dashboard.png" });
  for (const pg of ["criar-artigo", "linhas-de-producao", "feeds-rss", "historico", "sites-wordpress", "chaves-de-api", "planos", "perfil", "signup", "forgot-password"]) {
    await p.goto(B + pg + ".html", { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    await p.screenshot({ path: `shots/${pg}.png` });
  }
  console.log("ERRORS:", JSON.stringify(errs, null, 1));
  await b.close();
})();
