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

---

## 7. Inventário completo: o que ainda é só estético

Levantado linha por linha no código em 24/11/2026. Cada item tem uma correção
identificável e um lugar no código.

### 7.1 Autenticação

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| A1 | Login | compara senha em texto claro no `localStorage` | `assets/store.js` `auth.login` | `POST /api/auth/login`, Argon2id, cookie httpOnly |
| A2 | Cadastro | grava usuário no navegador, sem verificação | `auth.signup` | `POST /api/auth/signup` + e-mail de confirmação |
| A3 | Esqueceu a senha | `setTimeout(700)` e mensagem fixa | `forgot-password.html:65` | `POST /api/auth/forgot` com token de 1 uso, 30 min |
| A4 | Sessão | nunca expira, morre ao limpar o navegador | `store.js` `SESSION` | JWT curto + refresh, revogação por dispositivo |
| A5 | Sair | remove a chave local | `UI.mountShell` | `POST /api/auth/logout` invalida a sessão no servidor |
| A6 | Permissão de admin | `email === demo@` | `store.js` `isAdmin` | papel no banco (`users.role`) + middleware |
| A7 | 2FA / bloqueio por tentativa | inexistente | — | TOTP + rate limit por IP/e-mail |

### 7.2 Criação de artigo

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| B1 | Texto do artigo | `generateArticle` monta objeto com título de template e número aleatório de palavras | `store.js:191` | job de LLM com outline → corpo markdown → HTML |
| B2 | Barra de progresso | 5 `setTimeout(620)` com textos fixos | `criar-artigo.html:137` | progresso real por etapa via SSE |
| B3 | Corpo do artigo | não existe; o preview do histórico mostra texto fixo | `historico.html:103` | gravar `content_html` no artigo |
| B4 | Sugestão de títulos | dicionário de 8 padrões | `store.js` `titleFor` | 3 títulos gerados pelo modelo |
| B5 | Palavras / tokens | `900 + random(1800)` | `store.js:192` | contagem real do texto gerado |
| B6 | Copiar HTML | toast "simulado", nada na área de transferência | `historico.html:111` | `navigator.clipboard.writeText(a.content_html)` |
| B7 | Imagem destacada | checkbox sem efeito, nenhum arquivo criado | `criar-artigo.html:68` | gerar imagem (DALL·E/Flux) + upload em `/wp-json/wp/v2/media` |
| B8 | Custo/uso | número inventado no seed | `store.js` `usage` | `usage_counters` por ciclo, debitado no servidor |

### 7.3 Linhas de produção

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| C1 | Agendador | campo `frequency`/`time` é decorativo; nada roda sozinho | `linhas-de-producao.html` | cron repeatable (BullMQ) lendo os campos |
| C2 | Executar | `setTimeout(1200)` + artigo fake | `linhas-de-producao.html:86` | `POST /api/pipelines/:id/run` com job real |
| C3 | Histórico de execuções | não existe | — | tabela `pipeline_runs` + tela por linha |
| C4 | Idempotência | rodar 2× gera 2 artigos | — | chave por janela (dia/hora) |
| C5 | Próxima execução | data calculada no cliente | `store.js` | calculada no servidor e devolvida |

### 7.4 Feeds RSS

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| D1 | Buscar agora | `setTimeout(800)` e soma `Math.random()*4` aos itens | `feeds-rss.html:94` | `fetch` do XML com proxy (CORS) + `rss-parser` |
| D2 | Polling | nenhum | — | worker a cada 30 min |
| D3 | Deduplicação | nenhuma | — | por GUID/link + hash do título |
| D4 | Filtro por palavra-chave | inexistente | — | campo `keywords` no feed e filtro no worker |
| D5 | Gerar artigo a partir do feed | não existe | — | enfileirar geração ao detectar item novo |

### 7.5 Sites WordPress

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| E1 | Testar conexão | `setTimeout(900)` | `sites-wordpress.html:76,125` | `GET /wp-json/wp/v2/users/me` com Application Password |
| E2 | Publicar | nada é enviado | `criar-artigo.html` | `POST /wp-json/wp/v2/posts` + `featured_media` |
| E3 | Credenciais | senha de aplicação em texto claro no navegador | `sites-wordpress.html:122` | AES-256-GCM no servidor, nunca devolvida ao cliente |
| E4 | Sincronização | contador incrementado na mão | `criar-artigo.html:145` | contar posts reais via REST |
| E5 | Status "conectado/erro" | campo fixo no seed | `store.js` | resultado do último health-check |
| E6 | Publicar em vários perfis (ixBrowser → Fox) | não existe | — | ver seção 8 |

### 7.6 Chaves de API

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| F1 | Gerar chave | `Math.random()` no navegador | `chaves-de-api.html:106` | `pp_live_` + 32 bytes, guardar só o SHA-256 |
| F2 | Usar a chave | endpoint inexistente (o `curl` do exemplo não responde) | `chaves-de-api.html` | `/v1/articles` com middleware de API key |
| F3 | Último uso | data fixa | `store.js` | atualizada a cada request |
| F4 | Revogar | remove do array | `chaves-de-api.html:118` | `DELETE /api/keys/:id` + invalidação imediata |
| F5 | Chaves de IA | salvas e **nunca lidas** por nenhum código | `chaves-de-api.html:94` | usadas pelo gerador; validadas com um ping ao provedor |

### 7.7 Planos e cobrança

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| G1 | Trocar de plano | `confirm()` + muda um campo local | `planos.html:92` | checkout Mercado Pago + webhook |
| G2 | Faturas | 3 linhas fixas no seed | `store.js` | tabela `invoices` alimentada por webhook |
| G3 | Botão "PDF" da fatura | não faz nada | `planos.html:66` | endpoint que gera/baixa o PDF |
| G4 | Limite do plano | validado só no cliente | `store.js` `usage` | enforcement no servidor antes de gerar |
| G5 | Cupom | existe no admin, não é aplicado em lugar nenhum | `admin.html` | validar no checkout e debitar `uses` |
| G6 | Inadimplência | não existe | — | webhook suspende conta após 3 dias |

### 7.8 Painel admin

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| H1 | Bônus | funcional **dentro do clone** (localStorage), reflete no dashboard/planos/perfil | `admin.html` | tabela `bonuses` + endpoints da seção 3.1 |
| H2 | Bônus automáticos | regras salvas mas nenhum código as aplica | `admin.html`, aba Regras | eventos de cadastro/renovação/indicação |
| H3 | Cupons | CRUD funcional no clone; não entram no checkout | `admin.html` | integração com G5 |
| H4 | Logs | grava as ações do próprio admin | `admin.html`, aba Logs | `audit_log` global do sistema (login, publicação, cobrança) |
| H5 | Usuários | lista e concede bônus; não edita, não suspende | `admin.html` | editar plano, suspender, resetar senha, impersonar |
| H6 | Métricas | 4 cards derivados do localStorage | `admin.html` | agregações no banco (MRR real, churn, LTV) |
| H7 | Perfis de publicação | não existe | — | ver seção 8 |

### 7.9 Perfil e dados

| # | Função | Como está hoje | Arquivo | Correção |
|---|---|---|---|---|
| I1 | Salvar dados | grava nome/e-mail/senha localmente, inbox sem verificação | `perfil.html:122` | `PATCH /api/me` + reverificação de e-mail |
| I2 | Preferências | aplicadas só neste navegador | `perfil.html` | coluna `preferences` por usuário |
| I3 | Restaurar dados demo | apaga o banco local | `perfil.html:151` | remover em produção; manter só em ambiente de teste |
| I4 | Excluir conta / exportar | não existe | — | `DELETE /api/me`, `GET /api/me/export` (LGPD) |
| I5 | Multi-dispositivo | cada navegador tem seu próprio banco | `store.js` | banco único no Postgres |

---

## 8. Integração com navegador antidetect: ixBrowser → Fox

### 8.1 Como o ixBrowser funciona (API local v2)

- Serviço local em `http://127.0.0.1:53200/api/v2/`, precisa do cliente desktop aberto.
- `profile-list` lista perfis (paginado), `profile-open` abre um perfil e devolve
  `webdriver` + `debugging_address` — ou seja, um endpoint CDP.
- Com esse endereço, Selenium/Playwright se conectam e publicam no WordPress
  **dentro daquele perfil**, cada perfil com o seu próprio IP e fingerprint.
- Postar em vários perfis = abrir N perfis e rodar N conexões CDP em paralelo.

### 8.2 Como o Fox (Camoufox Profile Manager) funciona

REST em `http://localhost:8000/api/v1/`, autenticação por `X-API-Key: $CPM_API_KEY`
ou sessão `POST /auth/login` (cookie `cpm_session`).

```
GET  /profiles?page=&per_page=&search=     lista (name, id, group, status)
POST /profiles/{id}/launch                 abre (headless, window_size) -> status, process_id
POST /profiles/{id}/close                  fecha (no-op se não estiver aberto)
GET  /browsers/active                      o que está aberto agora
POST /browsers/close-all                   fecha tudo
POST /profiles/{id}/cookies/import         injeta cookies (JSON/Netscape)
```

Diferenças que mudam a arquitetura:

| | ixBrowser | Fox / Camoufox |
|---|---|---|
| Motor | Chromium | Firefox |
| Abrir perfil | `profile-open` devolve CDP | `POST /launch`, **sem** CDP |
| Automatizar | Playwright conecta no CDP | publicação roda dentro do Fox (cookie/extensão) |
| Conflito | não trata | **409** se o perfil já está aberto em outra instância |
| Lote | `close-in-batches` | só fecha tudo; abrir é 1 por vez |

### 8.3 O que construir no clone

1. **Adaptador único** `BrowserProfileClient` com dois drivers:
   `ixBrowserDriver` (CDP) e `foxDriver` (REST). A tela não sabe qual está ativo.
2. **Tela "Perfis de publicação"** em `perfis.html`:
   - lista os perfis do Fox (`GET /profiles`), com grupo, status e proxy;
   - checkbox para selecionar vários + "selecionar todos";
   - botão **"Publicar em N perfis"**;
   - painel de status por perfil: `aguardando → abrindo → publicando → publicado / erro (409, timeout)`.
3. **Executor paralelo** com concorrência limitada (padrão 5, configurável),
   `POST /launch` → publica → `POST /close`, com retry 2× e backoff; no 409, espera
   `CPM_LEASE_TTL` e tenta de novo.
4. **Credenciais por perfil**: cada perfil do Fox tem o seu usuário WordPress
   salvo cifrado no servidor; a publicação usa o par perfil ↔ site.
5. **Fallback de cookie**: se a publicação via Fox não for possível, injetar
   `application_password` como Basic Auth dentro do perfil.
6. **Painel admin**: aba "Perfis" com conexão ao Fox (URL + API key), teste de
   conexão, perfis que falharam e log de cada publicação.

### 8.4 Riscos
- O Fox PM não expõe CDP no `launch`; se o produto mudar isso, o adaptador já cobre.
- Um perfil por vez por conta: publicar no mesmo perfil em paralelo dá 409.
- Limite de RAM: 5–10 perfis simultâneos é o teto prático numa máquina comum.

---
