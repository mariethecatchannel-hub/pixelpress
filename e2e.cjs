const { chromium } = require("playwright-core");
const fs=require("fs"), path=require("path");
(async () => {
  const base = "C:/Users/alex_/AppData/Local/ms-playwright";
  const d = fs.readdirSync(base).filter(x=>x.startsWith("chromium-")).sort().pop();
  const exe = path.join(base, d, "chrome-win64", "chrome.exe");
  const b = await chromium.launch({ executablePath: exe });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  const p = await ctx.newPage();
  const errs=[]; p.on("pageerror", e=>errs.push("PAGEERROR: "+e.message));
  p.on("console", m=>{if(m.type()==="error")errs.push("CONSOLE: "+m.text())});
  const B="http://127.0.0.1:52933/";
  const ok=[], fail=[];
  const check = async (name, fn) => { try { await fn(); ok.push(name); } catch(e) { fail.push(name+": "+e.message.split("\n")[0]); } };

  await p.goto(B+"login.html", {waitUntil:"networkidle"});
  await p.click("#demoBtn");
  await p.waitForURL("**/dashboard.html",{timeout:8000});

  await check("criar-artigo: gerar artigo", async () => {
    await p.goto(B+"criar-artigo.html",{waitUntil:"networkidle"});
    await p.fill("#topic","teste automatizado de publicação");
    await p.click("#generateBtn");
    await p.waitForSelector("#resultArea a, #resultArea .btn", {timeout:9000});
  });
  await check("linhas: criar linha", async () => {
    await p.goto(B+"linhas-de-producao.html",{waitUntil:"networkidle"});
    const before = await p.locator(".card").count();
    await p.click("#newPipe");
    await p.fill("#mName","Linha E2E");
    await p.fill("#mTopic","testes");
    await p.click("#mSave");
    await p.waitForTimeout(400);
    const txt = await p.locator("body").innerText();
    if (!txt.includes("Linha E2E")) throw new Error("linha não apareceu");
  });
  await check("feeds: criar feed", async () => {
    await p.goto(B+"feeds-rss.html",{waitUntil:"networkidle"});
    await p.click("#newFeed");
    await p.fill("#mName","Feed E2E");
    await p.fill("#mUrl","https://exemplo.com/rss");
    await p.click("#mSave");
    await p.waitForTimeout(400);
    if (!(await p.locator("body").innerText()).includes("Feed E2E")) throw new Error("feed não apareceu");
  });
  await check("historico: busca", async () => {
    await p.goto(B+"historico.html",{waitUntil:"networkidle"});
    await p.fill("#search","wordpress");
    await p.waitForTimeout(400);
  });
  await check("sites: adicionar site", async () => {
    await p.goto(B+"sites-wordpress.html",{waitUntil:"networkidle"});
    // libera uma vaga: remove o site em erro
    const del = p.locator("button[data-del]").first();
    if (await del.count()) { p.once("dialog", d => d.accept()); await del.click(); await p.waitForTimeout(500); }
    await p.click("#newSite");
    await p.fill("#mName","Site E2E");
    await p.fill("#mUrl","https://e2e.com");
    await p.fill("#mUser","admin");
    await p.fill("#mPass","app-pass");
    await p.click("#mSave");
    await p.waitForTimeout(1600);
    if (!(await p.locator("body").innerText()).includes("Site E2E")) throw new Error("site não apareceu");
  });
  await check("chaves: gerar chave", async () => {
    await p.goto(B+"chaves-de-api.html",{waitUntil:"networkidle"});
    p.on("dialog", d => d.accept("Chave E2E"));
    await p.click("#newKey", { timeout: 8000 });
    await p.waitForTimeout(700);
    await p.click("#ok");
    await p.waitForTimeout(500);
    if (!(await p.locator("body").innerText()).includes("Chave E2E")) throw new Error("chave não apareceu");
  });
  await check("planos: trocar plano", async () => {
    await p.goto(B+"planos.html",{waitUntil:"networkidle"});
    const btn = p.locator("[data-plan]").first();
    await btn.click();
    await p.waitForTimeout(600);
  });
  await check("perfil: salvar dados", async () => {
    await p.goto(B+"perfil.html",{waitUntil:"networkidle"});
    await p.fill("#name","Conta Demo PixelPress");
    await p.click("#saveProfile");
    await p.waitForTimeout(400);
  });
  await check("signup: criar conta nova", async () => {
    await p.goto(B+"signup.html?plan=PRO",{waitUntil:"networkidle"});
    await p.fill("#name","Novo Usuario E2E");
    await p.fill("#email","e2e"+Date.now()+"@teste.com");
    await p.fill("#password","senha123");
    await p.click("#submitBtn");
    await p.waitForTimeout(1500);
    if (!p.url().includes("dashboard")) throw new Error("não foi para dashboard: "+p.url());
  });
  console.log("OK:", JSON.stringify(ok,null,1));
  console.log("FAIL:", JSON.stringify(fail,null,1));
  console.log("ERRS:", JSON.stringify(errs.slice(0,8),null,1));
  await b.close();
})();
