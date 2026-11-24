/* ============================================================
   PIXELPRESS clone — UI comum: ícones, toast, modal, shell
   ============================================================ */
(function () {
  "use strict";

  /* ---------- ícones (lucide, traço 2, viewBox 24) ---------- */
  const P = {
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    earth: '<path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/><path d="M7 3.34V5a3 3 0 0 0 3 3 2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/><path d="M11 21.95V18a2 2 0 0 0-2-2 2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/><circle cx="12" cy="12" r="10"/>',
    factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.8 10.8 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    creditCard: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
    layout: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    pen: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    rss: '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    checkCircle: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  };

  function icon(name, cls) {
    const d = P[name] || "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls || ""}" aria-hidden="true">${d}</svg>`;
  }

  /* ---------- toast ---------- */
  function toastHost() {
    let host = document.getElementById("toasts");
    if (!host) {
      host = document.createElement("div");
      host.id = "toasts";
      document.body.appendChild(host);
    }
    return host;
  }
  const toast = {
    show(msg, kind) {
      const el = document.createElement("div");
      el.className = "toast " + (kind || "info");
      const ico = kind === "success" ? icon("checkCircle", "h-4 w-4") : kind === "error" ? icon("alert", "h-4 w-4") : icon("sparkles", "h-4 w-4");
      el.innerHTML = `<span style="color:${kind === "success" ? "#16a34a" : kind === "error" ? "#dc2626" : "#E0A100"};flex-shrink:0;margin-top:1px">${ico}</span><span>${msg}</span>`;
      toastHost().appendChild(el);
      setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(-6px)"; el.style.transition = "all .2s"; setTimeout(() => el.remove(), 220); }, 3200);
    },
    success(m) { this.show(m, "success"); },
    error(m) { this.show(m, "error"); },
    info(m) { this.show(m, "info"); },
  };

  /* ---------- formatadores ---------- */
  const fmt = {
    money(v) { return "R$ " + Number(v).toFixed(2).replace(".", ","); },
    num(v) { return new Intl.NumberFormat("pt-BR").format(v); },
    date(isoStr) {
      if (!isoStr) return "—";
      const d = new Date(isoStr);
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    },
    dateTime(isoStr) {
      if (!isoStr) return "—";
      const d = new Date(isoStr);
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    },
    ago(isoStr) {
      if (!isoStr) return "—";
      const diff = Date.now() - new Date(isoStr).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "agora";
      if (m < 60) return `há ${m} min`;
      const h = Math.floor(m / 60);
      if (h < 24) return `há ${h} h`;
      const d = Math.floor(h / 24);
      return d === 1 ? "há 1 dia" : `há ${d} dias`;
    },
  };

  /* ---------- tema ---------- */
  const theme = {
    init() {
      const stored = localStorage.getItem("theme");
      const dark = stored === "dark";
      document.body.classList.toggle("dark", dark);
    },
    toggle() {
      const dark = !document.body.classList.contains("dark");
      document.body.classList.toggle("dark", dark);
      localStorage.setItem("theme", dark ? "dark" : "light");
      const b = document.getElementById("themeBtn");
      if (b) b.innerHTML = icon(dark ? "sun" : "moon", "h-4 w-4");
      const u = window.WB && WB.auth.current();
      if (u) WB.auth.update({ prefs: Object.assign({}, u.prefs, { darkMode: dark }) });
    },
  };

  /* ---------- shell do app ---------- */
  const NAV = [
    { href: "dashboard.html", label: "Dashboard", ico: "layout" },
    { href: "criar-artigo.html", label: "Criar Artigo", ico: "pen" },
    { href: "linhas-de-producao.html", label: "Linhas de Produção", ico: "factory" },
    { href: "feeds-rss.html", label: "Feeds RSS", ico: "rss" },
    { href: "historico.html", label: "Histórico", ico: "history" },
    { href: "sites-wordpress.html", label: "Sites WordPress", ico: "globe" },
    { href: "chaves-de-api.html", label: "Chaves de API", ico: "key" },
    { href: "planos.html", label: "Planos", ico: "creditCard" },
    { href: "perfil.html", label: "Perfil", ico: "user" },
  ];

  function brand(size, textSize) {
    return `<a href="dashboard.html" class="flex items-center gap-2.5">
      <img src="assets/pixelpress-icon.png" alt="PixelPress" width="${size}" height="${size}" class="rounded-lg object-contain" style="width:${size}px;height:${size}px">
      <span class="font-display font-bold tracking-tight" style="font-size:${textSize}px;color:#111114">PIXELPRESS</span>
    </a>`;
  }

  function mountShell({ active, title, subtitle, actions }) {
    const user = WB.auth.requireAuth();
    if (!user) return null;
    const plan = WB.planOf(user);
    const usage = WB.usage(user);

    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    sidebar.id = "sidebar";
    sidebar.innerHTML = `
      <div class="sidebar-brand">${brand(32, 17)}</div>
      <nav class="sidebar-nav">
        ${NAV.map((n) => `<a class="sidebar-link ${n.href === active ? "active" : ""}" href="${n.href}">${icon(n.ico)}<span>${n.label}</span></a>`).join("")}
        ${WB.admin && WB.admin.isAdmin(user) ? `<a class="sidebar-link ${active === "admin.html" ? "active" : ""}" href="admin.html" style="margin-top:.35rem;border-top:1px dashed #e5e7eb;padding-top:.6rem">${icon("shield")}<span>Admin</span></a>` : ""}
      </nav>
      <div class="sidebar-foot">
        <div class="sidebar-plan" style="border:1px solid #eee;border-radius:.65rem;padding:.7rem .8rem;background:linear-gradient(135deg,#FFFAEB,#FFF6DC)">
          <div class="flex items-center justify-between" style="font-size:.72rem;font-weight:700;color:#E0A100">
            <span>PLANO ${plan.name.toUpperCase()}</span><span>${usage.used}/${usage.total}</span>
          </div>
          <div class="progress" style="margin:.45rem 0 .5rem"><span style="width:${usage.pct}%"></span></div>
          <div style="font-size:.7rem;color:#6b7280">${usage.total - usage.used} artigos restantes</div>
          ${usage.bonus ? `<div style="font-size:.68rem;color:#E0A100;font-weight:600;margin-top:.15rem">+${usage.bonus} de bônus</div>` : ""}
          <a href="planos.html" class="btn btn-primary btn-sm" style="width:100%;margin-top:.55rem">Fazer upgrade</a>
        </div>
        <a class="sidebar-link" href="#" id="logoutBtn" style="margin-top:.5rem">${icon("logout")}<span>Sair</span></a>
      </div>`;

    const main = document.createElement("div");
    main.className = "main-col";
    main.innerHTML = `
      <header class="topbar">
        <div class="flex items-center gap-3">
          <button class="btn btn-ghost btn-icon md:hidden" id="menuBtn" aria-label="Menu">${icon("menu", "h-5 w-5")}</button>
          <div>
            <h1 class="page-title" style="font-size:1.15rem">${title}</h1>
            ${subtitle ? `<p class="page-sub" style="margin-top:0">${subtitle}</p>` : ""}
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${actions || ""}
          <button class="btn btn-ghost btn-icon" id="themeBtn" aria-label="Tema">${icon(document.body.classList.contains("dark") ? "sun" : "moon", "h-4 w-4")}</button>
          <a href="perfil.html" class="flex items-center gap-2" style="padding:.25rem .5rem;border-radius:.6rem">
            <div style="width:32px;height:32px;border-radius:9999px;background:linear-gradient(135deg,#E0A100,#FFC61A);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700">${initials(user.name)}</div>
            <div class="hidden md:block" style="line-height:1.1">
              <div style="font-size:.8rem;font-weight:600">${user.name}</div>
              <div style="font-size:.68rem;color:#9ca3af">${plan.name}</div>
            </div>
          </a>
        </div>
      </header>
      <main class="page" id="pageContent"></main>`;

    const root = document.createElement("div");
    root.className = "app-shell";
    root.appendChild(sidebar);
    root.appendChild(main);
    document.body.innerHTML = "";
    document.body.appendChild(root);

    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      WB.auth.logout();
      location.href = "login.html";
    });
    document.getElementById("themeBtn").addEventListener("click", () => theme.toggle());
    document.getElementById("menuBtn")?.addEventListener("click", () => sidebar.classList.toggle("open"));

    return { user, plan, content: document.getElementById("pageContent") };
  }

  function initials(name) {
    return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }

  /* ---------- modal helper ---------- */
  function openModal(html, onMount) {
    let bd = document.getElementById("modalBackdrop");
    if (!bd) {
      bd = document.createElement("div");
      bd.id = "modalBackdrop";
      bd.className = "modal-backdrop";
      bd.innerHTML = '<div class="modal" id="modalBox"></div>';
      document.body.appendChild(bd);
      bd.addEventListener("click", (e) => { if (e.target === bd) closeModal(); });
    }
    const box = bd.querySelector("#modalBox");
    box.innerHTML = html;
    bd.classList.add("open");
    if (onMount) onMount(box);
    return box;
  }
  function closeModal() {
    const bd = document.getElementById("modalBackdrop");
    if (bd) bd.classList.remove("open");
  }
  /* alias: os handlers passam a função direto no addEventListener (evita receber o Event) */
  const dismiss = () => closeModal();
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  document.addEventListener("DOMContentLoaded", () => {
    theme.init();
    const tb = document.getElementById("themeBtn");
    if (tb) tb.innerHTML = icon(document.body.classList.contains("dark") ? "sun" : "moon", "h-4 w-4");
  });

  window.UI = { icon, toast, fmt, theme, mountShell, brand, initials, openModal, closeModal };
})();
