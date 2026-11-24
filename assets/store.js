/* ============================================================
   PIXELPRESS clone — camada de dados (mock backend em localStorage)
   Substitui a API original (/api/*, NextAuth, Mercado Pago, IA).
   ============================================================ */
(function () {
  "use strict";

  const KEY = "pixelpress_clone_db_v1";
  const SESSION = "pixelpress_clone_session";

  const PLANS = {
    SIMPLE: {
      key: "SIMPLE", name: "Simples", articlesPerMonth: 10, maxSites: 1,
      price: 29.9, originalPrice: 59.8,
      description: "Para quem está começando com IA",
      features: ["10 artigos por mês", "1 site WordPress", "Geração com IA avançada", "Imagens geradas por IA", "Histórico completo"],
    },
    BASIC: {
      key: "BASIC", name: "Básico", articlesPerMonth: 50, maxSites: 1,
      price: 49.9, originalPrice: 99.8, highlight: true,
      description: "O equilíbrio perfeito entre preço e recursos",
      features: ["50 artigos por mês", "1 site WordPress", "Geração com IA avançada", "Imagens geradas por IA", "Histórico completo", "Linhas de produção automáticas"],
    },
    PRO: {
      key: "PRO", name: "Pro", articlesPerMonth: 150, maxSites: 3,
      price: 89.9, originalPrice: 179.8,
      description: "Para criadores ativos e blogs em crescimento",
      features: ["150 artigos por mês", "3 sites WordPress", "Geração com IA avançada", "Imagens geradas por IA", "Histórico completo", "Linhas de produção automáticas", "Suporte prioritário"],
    },
    ADVANCED: {
      key: "ADVANCED", name: "Avançado", articlesPerMonth: 500, maxSites: 10,
      price: 109.9, originalPrice: 219.8,
      description: "Para agências e produção em escala",
      features: ["500 artigos por mês", "10 sites WordPress", "Geração com IA avançada", "Imagens geradas por IA", "Histórico completo", "Linhas de produção automáticas", "Suporte VIP", "Acesso antecipado a novidades"],
    },
  };
  const PLAN_LIST = [PLANS.SIMPLE, PLANS.BASIC, PLANS.PRO, PLANS.ADVANCED];

  const ARTICLE_TYPES = [
    "Receita", "Tutorial", "Review", "Lista", "FAQ", "Notícia",
    "Guia completo", "Comparativo", "Estudo de caso", "Opinião",
    "Checklist", "História", "Dicas rápidas", "Pilar SEO",
  ];

  const TONES = ["Profissional", "Amigável", "Informativo", "Persuasivo", "Divertido", "Técnico"];

  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const now = () => Date.now();
  const iso = (t) => new Date(t).toISOString();

  function seed() {
    const t = now();
    const day = 86400000;
    const db = {
      version: 1,
      users: [
        {
          id: "u_demo",
          name: "Conta Demonstração",
          email: "demo@pixelpress.com.br",
          password: "demo123",
          plan: "PRO",
          createdAt: iso(t - 40 * day),
          creditsUsed: 63,
          cycleStart: iso(t - 12 * day),
          aiKeys: {
            openai: "sk-demo-••••••••••••••••4f2a",
            gemini: "AIza-demo-•••••••••••••9c1",
          },
          prefs: { language: "pt-BR", defaultTone: "Profissional", autoImage: true, darkMode: false },
        },
      ],
      sessionUserId: null,
      admin: {
        bonus: [
          { id: "b1", userId: "u_demo", kind: "credits", amount: 20, reason: "Bônus de boas-vindas", note: "Créditos extras no primeiro mês", createdAt: iso(t - 38 * day), expiresAt: iso(t + 20 * day), status: "active", createdBy: "sistema" },
          { id: "b2", userId: "u_demo", kind: "days", amount: 30, reason: "Compensação de instabilidade", note: "Prorrogação do ciclo", createdAt: iso(t - 9 * day), expiresAt: null, status: "active", createdBy: "suporte" },
          { id: "b3", userId: "u_demo", kind: "sites", amount: 2, reason: "Bônus de indicação", note: "Indicou 2 clientes", createdAt: iso(t - 25 * day), expiresAt: iso(t + 60 * day), status: "used", createdBy: "admin" },
        ],
        coupons: [
          { id: "c1", code: "PIXEL20", kind: "percent", value: 20, months: 3, maxUses: 100, uses: 34, expiresAt: iso(t + 45 * day), active: true },
          { id: "c2", code: "BLACK50", kind: "percent", value: 50, months: 1, maxUses: 500, uses: 500, expiresAt: iso(t - 20 * day), active: false },
          { id: "c3", code: "INDICA10", kind: "fixed", value: 10, months: 0, maxUses: 1000, uses: 87, expiresAt: null, active: true },
        ],
        settings: {
          bonusEnabled: true,
          bonusAutoSignup: 10,
          bonusReferral: 5,
          bonusRenewalPct: 5,
          creditValue: 0.9,
          bonusExpireDays: 60,
        },
        logs: [
          { id: "l1", at: iso(t - 2 * 3600000), actor: "admin", action: "bonus.grant", target: "u_demo", meta: "+20 créditos — Bônus de boas-vindas" },
          { id: "l2", at: iso(t - 26 * 3600000), actor: "suporte", action: "bonus.grant", target: "u_demo", meta: "+30 dias — Compensação" },
          { id: "l3", at: iso(t - 3 * day), actor: "admin", action: "coupon.create", target: "PIXEL20", meta: "20% por 3 meses" },
          { id: "l4", at: iso(t - 6 * day), actor: "sistema", action: "plan.change", target: "u_demo", meta: "BASIC → PRO" },
        ],
      },
      sites: [
        { id: "s1", userId: "u_demo", name: "Blog de Receitas", url: "https://receitasdacasa.com.br", status: "connected", articles: 41, lastSync: iso(t - 2 * 3600000) },
        { id: "s2", userId: "u_demo", name: "Tech em Foco", url: "https://techeminfoco.com", status: "connected", articles: 22, lastSync: iso(t - 6 * 3600000) },
        { id: "s3", userId: "u_demo", name: "Loja Verde", url: "https://lojaverde.shop", status: "error", articles: 0, lastSync: iso(t - 3 * day) },
      ],
      articles: [
        { id: "a1", userId: "u_demo", title: "Bolo de cenoura fofinho: o segredo da massa úmida", type: "Receita", siteId: "s1", status: "published", words: 1180, createdAt: iso(t - 4 * 3600000), source: "manual" },
        { id: "a2", userId: "u_demo", title: "Como configurar o WordPress REST API em 5 passos", type: "Tutorial", siteId: "s2", status: "published", words: 1640, createdAt: iso(t - 9 * 3600000), source: "manual" },
        { id: "a3", userId: "u_demo", title: "As 12 melhores cafeteiras de 2026 (testadas)", type: "Review", siteId: "s1", status: "draft", words: 2210, createdAt: iso(t - 1 * day), source: "manual" },
        { id: "a4", userId: "u_demo", title: "Pão de fermentação natural para iniciantes", type: "Guia completo", siteId: "s1", status: "published", words: 2890, createdAt: iso(t - 2 * day), source: "pipeline" },
        { id: "a5", userId: "u_demo", title: "5 tendências de front-end que importam em 2026", type: "Lista", siteId: "s2", status: "published", words: 1490, createdAt: iso(t - 3 * day), source: "pipeline" },
        { id: "a6", userId: "u_demo", title: "FAQ: tudo sobre air fryer", type: "FAQ", siteId: "s1", status: "failed", words: 0, createdAt: iso(t - 3 * day), source: "rss" },
        { id: "a7", userId: "u_demo", title: "Comparativo: geladeiras inverter x convencionais", type: "Comparativo", siteId: "s1", status: "published", words: 1980, createdAt: iso(t - 5 * day), source: "pipeline" },
        { id: "a8", userId: "u_demo", title: "O que é Core Web Vitals e por que importa", type: "Pilar SEO", siteId: "s2", status: "published", words: 3120, createdAt: iso(t - 7 * day), source: "manual" },
      ],
      pipelines: [
        { id: "p1", userId: "u_demo", name: "Receitas diárias", topic: "receitas caseiras fáceis", type: "Receita", siteId: "s1", frequency: "daily", time: "08:00", active: true, produced: 34, lastRun: iso(t - 5 * 3600000), nextRun: iso(t + 19 * 3600000), tone: "Amigável" },
        { id: "p2", userId: "u_demo", name: "Tutoriais tech", topic: "tutoriais de WordPress e SEO", type: "Tutorial", siteId: "s2", frequency: "weekly", time: "10:00", active: true, produced: 18, lastRun: iso(t - 2 * day), nextRun: iso(t + 5 * day), tone: "Técnico" },
        { id: "p3", userId: "u_demo", name: "Reviews de produtos", topic: "reviews de eletrodomésticos", type: "Review", siteId: "s1", frequency: "twice-weekly", time: "14:30", active: false, produced: 11, lastRun: iso(t - 9 * day), nextRun: null, tone: "Profissional" },
      ],
      feeds: [
        { id: "f1", userId: "u_demo", name: "TechCrunch", url: "https://techcrunch.com/feed/", siteId: "s2", active: true, items: 240, lastFetch: iso(t - 40 * 60000) },
        { id: "f2", userId: "u_demo", name: "Painel do Leitor (UOL)", url: "https://paineldoleitor.com.br/feed/", siteId: "s1", active: true, items: 96, lastFetch: iso(t - 3 * 3600000) },
        { id: "f3", userId: "u_demo", name: "G1 Tecnologia", url: "https://g1.globo.com/rss/g1/tecnologia/", siteId: "s2", active: false, items: 54, lastFetch: iso(t - 2 * day) },
      ],
      keys: [
        { id: "k1", userId: "u_demo", label: "Produção", value: "wb_live_9f2c4a7d81b3e6504c9a", createdAt: iso(t - 30 * day), lastUsed: iso(t - 3600000) },
        { id: "k2", userId: "u_demo", label: "Teste local", value: "wb_test_1a8b7c6d5e4f30219a8b", createdAt: iso(t - 8 * day), lastUsed: null },
      ],
      invoices: [
        { id: "i1", userId: "u_demo", date: iso(t - 12 * day), amount: 89.9, status: "pago", plan: "PRO" },
        { id: "i2", userId: "u_demo", date: iso(t - 42 * day), amount: 89.9, status: "pago", plan: "PRO" },
        { id: "i3", userId: "u_demo", date: iso(t - 72 * day), amount: 49.9, status: "pago", plan: "BASIC" },
      ],
    };
    return db;
  }

  let db = null;
  function load() {
    if (db) return db;
    try {
      const raw = localStorage.getItem(KEY);
      db = raw ? JSON.parse(raw) : seed();
    } catch (e) { db = seed(); }
    return db;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }

  /* ---------------- sessão ---------------- */
  const auth = {
    current() {
      const id = localStorage.getItem(SESSION);
      if (!id) return null;
      return load().users.find((u) => u.id === id) || null;
    },
    login(email, password) {
      const u = load().users.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
      if (!u || u.password !== password) return { error: "Email ou senha inválidos." };
      localStorage.setItem(SESSION, u.id);
      return { user: u };
    },
    signup({ name, email, password, plan }) {
      const d = load();
      if (d.users.some((x) => x.email.toLowerCase() === String(email).trim().toLowerCase())) {
        return { error: "Este email já está cadastrado." };
      }
      const u = {
        id: uid("u_"), name, email: String(email).trim(), password,
        plan: PLANS[plan] ? plan : "BASIC",
        createdAt: iso(now()), creditsUsed: 0, cycleStart: iso(now()),
        aiKeys: {}, prefs: { language: "pt-BR", defaultTone: "Profissional", autoImage: true, darkMode: false },
      };
      d.users.push(u);
      save();
      localStorage.setItem(SESSION, u.id);
      return { user: u };
    },
    logout() { localStorage.removeItem(SESSION); },
    requireAuth() {
      const u = auth.current();
      if (!u) { location.replace("login.html?callbackUrl=" + encodeURIComponent(location.pathname.split("/").pop() || "dashboard.html")); return null; }
      return u;
    },
    update(patch) {
      const u = auth.current(); if (!u) return null;
      Object.assign(u, patch); save(); return u;
    },
  };

  /* ---------------- helpers de dados por usuário ---------------- */
  function list(coll, userId) {
    return (load()[coll] || []).filter((x) => x.userId === userId);
  }
  function add(coll, item) {
    const d = load(); d[coll] = d[coll] || []; d[coll].push(item); save(); return item;
  }
  function remove(coll, id) {
    const d = load(); d[coll] = (d[coll] || []).filter((x) => x.id !== id); save();
  }
  function update(coll, id, patch) {
    const d = load(); const it = (d[coll] || []).find((x) => x.id === id);
    if (it) { Object.assign(it, patch); save(); }
    return it;
  }

  function planOf(user) { return PLANS[user.plan] || PLANS.BASIC; }

  /* ---------------- admin: bônus, cupons, logs ---------------- */
  function adminData() {
    const d = load();
    if (!d.admin) d.admin = { bonus: [], coupons: [], logs: [], settings: { bonusEnabled: true, bonusAutoSignup: 0, bonusReferral: 0, bonusRenewalPct: 0, creditValue: 0.9, bonusExpireDays: 60 } };
    if (!d.admin.bonus) d.admin.bonus = [];
    if (!d.admin.coupons) d.admin.coupons = [];
    if (!d.admin.logs) d.admin.logs = [];
    return d.admin;
  }

  function adminLog(action, target, meta, actor) {
    const a = adminData();
    a.logs.unshift({ id: uid("l_"), at: iso(now()), actor: actor || "admin", action, target, meta });
    if (a.logs.length > 200) a.logs.length = 200;
    save();
  }

  /* bônus ativos de um usuário, somados por tipo */
  function bonusesOf(userId) {
    const nowT = now();
    return adminData().bonus.filter((b) =>
      b.userId === userId && b.status === "active" && (!b.expiresAt || new Date(b.expiresAt).getTime() > nowT)
    );
  }

  function bonusTotals(userId) {
    const out = { credits: 0, days: 0, sites: 0, count: 0 };
    bonusesOf(userId).forEach((b) => { out[b.kind] = (out[b.kind] || 0) + Number(b.amount || 0); out.count++; });
    return out;
  }

  function grantBonus({ userId, kind, amount, reason, note, expiresAt, createdBy }) {
    const a = adminData();
    const b = {
      id: uid("b_"), userId, kind: kind || "credits", amount: Number(amount) || 0,
      reason: reason || "Bônus manual", note: note || "",
      createdAt: iso(now()), expiresAt: expiresAt || null, status: "active",
      createdBy: createdBy || "admin",
    };
    a.bonus.unshift(b);
    adminLog("bonus.grant", userId, `+${b.amount} ${kind === "credits" ? "créditos" : kind === "days" ? "dias" : "sites"} — ${b.reason}`, createdBy);
    save();
    return b;
  }

  function revokeBonus(id, actor) {
    const a = adminData();
    const b = a.bonus.find((x) => x.id === id);
    if (!b) return null;
    b.status = "revoked";
    adminLog("bonus.revoke", b.userId, `Bônus cancelado — ${b.reason}`, actor);
    save();
    return b;
  }

  function usage(user) {
    const p = planOf(user);
    const used = list("articles", user.id).filter((a) => a.status === "published" || a.status === "draft").length + (user.creditsUsed || 0);
    const bonus = bonusTotals(user.id).credits;
    const total = p.articlesPerMonth + bonus;
    return { used: Math.min(used, total), total, pct: Math.min(100, Math.round((used / total) * 100)), bonus, base: p.articlesPerMonth };
  }

  /* ---------------- gerador de artigo simulado ---------------- */
  function generateArticle({ topic, type, tone, siteId, title }) {
    const words = 900 + Math.floor(Math.random() * 1800);
    return {
      id: uid("a_"),
      title: title || titleFor(topic, type),
      topic, type: type || "Guia completo", tone: tone || "Profissional",
      siteId, status: "published", words,
      createdAt: iso(now()), source: "manual",
    };
  }

  function titleFor(topic, type) {
    const t = (topic || "conteúdo").trim();
    const patterns = {
      "Receita": `${t.charAt(0).toUpperCase() + t.slice(1)}: receita passo a passo que dá certo`,
      "Tutorial": `Como fazer ${t} (tutorial completo)`,
      "Review": `Review: vale a pena ${t}? Testamos por 30 dias`,
      "Lista": `7 ideias de ${t} para aplicar hoje`,
      "FAQ": `${t}: as 10 perguntas mais frequentes`,
      "Notícia": `${t}: o que muda agora`,
      "Guia completo": `Guia completo de ${t} para iniciantes`,
      "Comparativo": `${t}: comparativo e qual escolher`,
    };
    return patterns[type] || `${t}: guia definitivo`;
  }

  function trackEvent(label) { /* placeholder de analytics */ }

  window.WB = {
    PLANS, PLAN_LIST, ARTICLE_TYPES, TONES,
    auth, list, add, remove, update, planOf, usage,
    admin: {
      data: adminData, log: adminLog, logAction: adminLog,
      bonusesOf, bonusTotals, grantBonus, revokeBonus,
      isAdmin(u) { return !!u && (u.role === "admin" || u.email === "demo@pixelpress.com.br"); },
      users() { return load().users; },
      newId(p) { return uid(p); },
      save() { save(); },
    },
    generateArticle, titleFor, uid, iso, now, trackEvent,
    resetDemo() { localStorage.removeItem(KEY); localStorage.removeItem(SESSION); db = null; },
  };
})();
