# PixelPress — Auditoria funcional e plano de construção do backend

> Estado em 24/11/2026. Clone estático em `wordbee-clone/` (servido em http://127.0.0.1:52933).
> Toda a "inteligência" hoje vive no navegador: `assets/store.js` (banco em `localStorage`,
> chave `pixelpress_clone_db_v1`) e `assets/ui.js` (shell, toasts, modais).
> Não há servidor: nada é enviado, publicado, cobrado ou gerado de verdade.

---

## 1. O que já funciona (front-end, com dados locais)

Testado com Playwright em todas as páginas — 9/9 fluxos passando, zero erros de console:

| Página | Fluxo testado | Resultado |
|---|---|---|
| `login.html` | entrar com demo, senha errada, redirect de rota protegida | OK |
| `signup.html?plan=…` | criar conta e cair no dashboard | OK |
| `dashboard.html` | KPIs, últimos artigos, linhas, sites | OK |
| `criar-artigo.html` | preencher assunto → gerar artigo (modal animado) → resultado | OK |
| `linhas-de-producao.html` | criar linha, ativar/pausar, excluir, executar | OK |
| `feeds-rss.html` | criar feed, ligar/desligar, buscar | OK |
| `historico.html` | filtros por status + busca + preview | OK |
| `sites-wordpress.html` | adicionar site (limite de plano), testar, remover | OK |
| `chaves-de-api.html` | salvar chave de IA, gerar/revogar chave de API | OK |
| `planos.html` | trocar de plano, ver faturas | OK |
| `perfil.html` | editar dados, preferências, modo escuro, logout | OK |

---

## 2. O que NÃO funciona de verdade (gaps por função)

### 2.1 Autenticação
- Senha em texto claro no `localStorage`; nenhum hash, nenhuma sessão de servidor.
- "Esqueceu a senha?" não envia e-mail (só mostra confirmação).
- Sem verificação de e-mail, sem bloqueio por tentativas, sem 2FA.
- Sessão não expira; abrir o site em outro navegador "desloga".

### 2.2 Criação de artigo (o coração do produto)
- Texto é gerado por template local (`WB.generateArticle`), não por LLM.
- "Imagem gerada por IA" é um placeholder em CSS — nenhuma imagem é criada.
- Nada é salvo no WordPress; o botão publicar só muda o status local.
- Sem contagem real de palavras/tokens, sem custo, sem fila, sem retry.

### 2.3 Esteira / Linhas de produção
- Não há agendador: "diária 08:00" nunca dispara sozinho.
- Executar uma linha gera artigo na hora, mas nada persiste entre dispositivos.
- Sem histórico de execuções, sem logs, sem controle de concorrência.

### 2.4 Feeds RSS
- "Buscar agora" não faz requisição; inventa 3 itens.
- Sem parser de RSS/Atom, sem deduplicação, sem filtro por palavra-chave.

### 2.5 Sites WordPress
- "Testar conexão" é um `setTimeout`.
- Não chama `/wp-json/wp/v2/posts`, não valida Application Password, não envia mídia.
- Credenciais ficam no navegador (grave em produção).

### 2.6 Chaves de API
- Chave gerada é aleatória local; não existe endpoint para usá-la.
- Exemplo `curl` de `api.pixelpress.com.br` não existe.
- Chaves de IA salvas não são usadas por ninguém.

### 2.7 Planos e cobrança
- Trocar de plano é só um campo no `localStorage`.
- Sem Mercado Pago/Pagar.me, sem webhook, sem fatura real, sem bloqueio por inadimplência.
- Limites (artigos/mês, nº de sites) são checados só no cliente.

### 2.8 Multi-tenant e dados
- Tudo em um único navegador; dois usuários não se enxergam porque nada é compartilhado.
- Sem backup, sem exportação, sem LGPD (exclusão de conta, portabilidade).

---

## 3. Lista de construção do backend

Ordem recomendada: cada fase entrega algo usável sozinho.

### Fase 0 — Fundação (1–2 semanas)
1. **Stack**: Next.js (App Router) + TypeScript + PostgreSQL (Supabase ou Neon) + Prisma/Drizzle.
2. **Schema mínimo**: `users`, `sessions`, `plans`, `subscriptions`, `sites`, `articles`,
   `pipelines`, `pipeline_runs`, `feeds`, `feed_items`, `api_keys`, `ai_keys`, `invoices`,
   `usage_counters`, `audit_log`.
3. **Auth**: Auth.js (NextAuth) com Credentials + hash Argon2id, e-mail verificado (Resend/Postmark).
4. **Multi-tenant**: `org_id` em todas as tabelas + Row Level Security no Postgres.
5. **Env/secrets**: chaves de IA e senhas do WordPress criptografadas com AES-256-GCM
   (chave no KMS/Doppler), nunca no cliente.
6. **Observabilidade**: Sentry + logs estruturados (pino) + uptime.

### Fase 1 — Login real (3–5 dias)
- `POST /api/auth/signup`, `/login`, `/logout`, `/forgot-password`, `/reset-password`.
- Sessão em cookie `httpOnly`, `secure`, SameSite=Lax; refresh e expiração (7/30 dias).
- Rate limit por IP/e-mail (Upstash Redis) e captcha opcional (Turnstile).
- Guarda de rota no middleware; páginas internas só com sessão válida.

### Fase 2 — Sites WordPress (1 semana)
- `POST /api/sites` → valida `GET {url}/wp-json/wp/v2/users/me` com Basic Auth
  (Application Password), guarda credencial cifrada.
- `POST /api/sites/:id/test` → health check real + versão do WP + permissão de publicação.
- `POST /api/sites/:id/publish` → cria post (`status`, `categories`, `featured_media`).
- `POST /api/sites/:id/media` → upload de imagem via `/wp-json/wp/v2/media`.
- Fila (BullMQ + Redis) para publicação com retry exponencial e log por tentativa.

### Fase 3 — Geração de artigos (1–2 semanas)
- `POST /api/articles` `{ topic, type, tone, words, siteId }` → job na fila.
- Pipeline: outline → títulos (3 opções) → corpo em markdown → SEO (meta, slug,
  palavras-chave) → imagem destacada (DALL·E / Flux / SDXL) → upload no WP.
- Provedores plugáveis: OpenAI, Anthropic, Gemini; chave do usuário tem prioridade,
  senão usa a chave da plataforma com medição de custo.
- `GET /api/articles/:id` (status: queued/processing/done/error + progresso por etapa),
  streaming via SSE ou polling.
- Deduplicação por similaridade (embeddings) para não repetir pauta.
- Contadores de uso por ciclo de assinatura (`usage_counters`) com bloqueio no servidor.

### Fase 4 — Linhas de produção (1 semana)
- CRUD `/api/pipelines` + `POST /api/pipelines/:id/run`.
- Agendador: cron (Vercel Cron / BullMQ repeatable) lendo `frequency` + `time`.
- Cada execução grava `pipeline_runs` (início, fim, artigos criados, erro).
- Idempotência por janela (não rodar duas vezes no mesmo horário).

### Fase 5 — Feeds RSS (4–5 dias)
- `POST /api/feeds` com validação do XML (rss-parser).
- Worker periódico (a cada 30 min) busca, normaliza, deduplica por GUID/link,
  aplica filtro de palavras-chave e enfileira a geração.
- `POST /api/feeds/:id/fetch` para busca manual com resultado real.

### Fase 6 — Chaves de API públicas (4–5 dias)
- `POST /api/keys` → gera `pp_live_<32 bytes base62>`, guarda só o hash SHA-256,
  mostra o valor uma única vez.
- Middleware de API key: escopo, rate limit, último uso, revogação.
- Endpoints públicos versionados: `POST /v1/articles`, `GET /v1/articles/:id`,
  `GET /v1/sites`; documentação OpenAPI + página `/docs`.
- Webhooks de saída (`article.created`, `article.published`) com assinatura HMAC.

### Fase 7 — Planos e cobrança (1–2 semanas)
- Integração Mercado Pago (assinatura recorrente) — `POST /api/billing/checkout`.
- Webhook `/api/webhooks/mercadopago` → ativa/renova/suspende assinatura.
- Tabela `invoices` alimentada por webhook; página Planos passa a ler do banco.
- Enforcement no servidor: limites de artigos/mês e nº de sites por plano
  (`FREE`, `SIMPLE`, `BASIC`, `PRO`, `ADVANCED`).
- Período de teste, cupom, upgrade/downgrade com proporcionalidade.

### Fase 8 — Perfil, LGPD e operação (1 semana)
- `PATCH /api/me` (nome, e-mail com reverificação, senha), preferências salvas no banco.
- `DELETE /api/me` com anonimização; `GET /api/me/export` (JSON completo).
- 2FA TOTP opcional; log de acessos.
- Backup diário do Postgres, política de retenção, página de status.

### Fase 9 — Qualidade (contínuo)
- Testes: Vitest (unidade), Playwright (E2E reaproveitando `e2e.cjs`), k6 (carga).
- CI/CD (GitHub Actions) → preview por PR → produção.
- Métricas de produto: artigos gerados, taxa de publicação, custo por artigo.

---

## 3.1 Bônus para usuários (nova seção)

Bônus são créditos, dias ou sites extras dados a uma conta sem passar pelo checkout.
Precisam de modelo de dados próprio, regras automáticas e um painel administrativo.

### 3.1.1 Modelo de dados

```
bonuses
  id            uuid pk
  user_id       uuid fk -> users
  org_id        uuid fk -> orgs
  kind          enum('credits','days','sites','plan')
  amount        numeric
  reason        text            -- texto mostrado ao usuário
  note          text            -- observação interna
  status        enum('active','used','revoked','expired')
  granted_by    uuid fk -> users (admin) | null (sistema)
  granted_at    timestamptz
  expires_at    timestamptz null
  used_at       timestamptz null
  idempotency_key text unique  -- evita bônus duplicado por retry/webhook

coupons
  id, code unique, kind enum('percent','fixed'), value,
  months int, max_uses int, uses int, expires_at, active bool

bonus_rules (por org/plataforma)
  signup_credits, referral_credits, renewal_pct, expire_days, enabled
```

### 3.1.2 Tipos de bônus

| Tipo | Efeito | Onde é consumido |
|---|---|---|
| `credits` | soma artigos ao limite do ciclo | `usage_counters` — checagem antes de gerar artigo |
| `days` | empurra `current_period_end` da assinatura | webhook de cobrança / tela Planos |
| `sites` | aumenta `maxSites` temporariamente | criação de site WordPress |
| `plan` | upgrade temporário (ex.: PRO por 30 dias) | `subscriptions.temp_plan_until` |

### 3.1.3 Regras automáticas
1. **Boas-vindas**: `signup_credits` no cadastro (padrão 10), expira em `expire_days`.
2. **Indicação**: +`referral_credits` para quem indica e para quem é indicado, creditado
   quando o indicado faz a primeira assinatura paga (não no cadastro — evita fraude).
3. **Renovação**: `renewal_pct`% de créditos extras a cada ciclo pago.
4. **Compensação**: manual, pelo admin, com motivo obrigatório e log.
5. **Campanha**: lote por segmento (plano, data de cadastro, inativos) com `idempotency_key`
   por usuário+campanha.

### 3.1.4 Regras de negócio
- Bônus de `credits` **não** entram no MRR e não são reembolsáveis.
- Consumo: primeiro os créditos do plano, depois os bônus que expiram antes (FIFO por validade).
- Expiração: job diário marca `status='expired'`; bônus expirado não aparece na UI.
- Limite: no máximo `X`% do limite do plano em bônus ativos (evita conta infinita).
- Antifraude: máximo 1 bônus de indicação por CPF/e-mail/domínio, e bloqueio se o indicado
  cancelar em menos de 7 dias (estorna o bônus).
- Auditoria: toda concessão/cancelamento em `audit_log` com ator, IP e motivo.
- Comunicação: e-mail "Você ganhou N créditos" + badge no sidebar e no dashboard.

### 3.1.5 Endpoints

```
POST   /api/admin/bonuses            { userId, kind, amount, reason, note, expiresAt }
GET    /api/admin/bonuses?userId=    lista com filtros
POST   /api/admin/bonuses/:id/revoke
POST   /api/admin/bonuses/campaign   { segment, kind, amount, reason, expiresAt }
GET    /api/admin/bonus-rules        PATCH /api/admin/bonus-rules
GET    /api/me/bonuses               bônus do próprio usuário (somente leitura)
POST   /api/billing/apply-coupon     { code }  -> valida cupom no checkout
```

### 3.1.6 Onde o bônus aparece na UI
- Sidebar: linha "+N de bônus" abaixo da barra de uso.
- Dashboard: card "Créditos bônus" com validade e origem.
- Planos: linha "Bônus ativos" somada ao limite do mês.
- Perfil: histórico de bônus recebidos (somente leitura).
- Admin: aba Bônus (concessão, cancelamento, filtros), aba Regras, aba Cupons, aba Logs.

### 3.1.7 Testes
- Bônus expirado não conta no limite.
- Concessão duplicada com a mesma `idempotency_key` retorna o mesmo registro.
- Revogar bônus já consumido → erro 409 e registro em log.
- Limite de plano + bônus é respeitado no servidor (não só no cliente).
- Bônus de indicação estornado quando o indicado cancela em < 7 dias.

---

## 4. Migração do clone para o backend real

1. Trocar `assets/store.js` por um cliente HTTP fino (`assets/api.js`) com os mesmos
   nomes de função (`WB.list`, `WB.add`, …) → as páginas HTML não mudam.
2. Manter as telas atuais; cada `localStorage` vira chamada REST.
3. Seed de dados demo vira script de banco (`prisma/seed.ts`).
4. Feature flag por página para migrar uma tela por vez.

---

## 5. Estimativa

| Fase | Esforço | Acumulado |
|---|---|---|
| 0 Fundação | 1–2 sem | 2 sem |
| 1 Login | 3–5 d | 3 sem |
| 2 Sites WP | 1 sem | 4 sem |
| 3 Artigos | 1–2 sem | 6 sem |
| 4 Linhas | 1 sem | 7 sem |
| 5 Feeds | 4–5 d | 8 sem |
| 6 API pública | 4–5 d | 9 sem |
| 7 Cobrança | 1–2 sem | 11 sem |
| 3.1 Bônus (junto com a Fase 7) | 3–4 d | 12 sem |
| 8 Perfil/LGPD | 1 sem | 13 sem |

Um dev sênior full-stack, ~13 semanas até produção com cobrança ativa e bônus.

---

## 6. Área administrativa do site original

Investigação feita em 24/11/2026 sobre wordbee.com.br:

- `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/planos`, `/admin/bonus`,
  `/admin/cupons`, `/admin/financeiro`, `/admin/afiliados`, `/admin/relatorios`,
  `/admin/configuracoes`, `/admin/logs` → todos respondem **307** para
  `/login?callbackUrl=%2Fadmin...`. Uma rota inexistente devolve **404**.
- Ou seja: **existe** um segmento `/admin` protegido por autenticação. O middleware
  redireciona qualquer visitante não autenticado, sem revelar o conteúdo.
- O bundle JavaScript público (10 chunks baixados) **não** contém nenhuma referência a
  `admin` — as rotas de admin não são pré-carregadas para visitantes. As únicas rotas
  no bundle público são `/dashboard`, `/signup`, `/forgot-password`, `/signout` e `/error`.
- Sem credenciais de administrador não é possível saber quais dessas subrotas existem de
  fato (o redirect acontece antes de qualquer checagem de existência), nem o conteúdo delas.
- `robots.txt` e `sitemap.xml` não existem (retornam a página 404 do app).

**Conclusão:** a área admin é inacessível sem uma conta de administrador do Wordbee —
não é possível clonar o conteúdo real. Foi construída uma versão reconstruída por
inferência de produto (`admin.html` do clone), com Bônus, Usuários, Cupons, Regras e Logs,
protegida por checagem de papel (`role === 'admin'`), que no clone é a conta demo.
