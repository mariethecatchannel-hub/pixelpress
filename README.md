# PixelPress

Clone de estudo do site [wordbee.com.br](https://wordbee.com.br/) com a identidade visual da **PixelPress**
(amarelo `#F5B400` / `#FFC61A` sobre quase-preto). 13 páginas estáticas em HTML + CSS + JS puro.

> **Importante:** este projeto é **apenas front-end**. Não há servidor, banco de dados remoto,
> integração com IA, publicação no WordPress ou cobrança. Todos os dados vivem no
> `localStorage` do navegador (chave `pixelpress_clone_db_v1`).
> O plano para transformar isso em um produto real está em [`BACKEND-PLANO.md`](./BACKEND-PLANO.md)
> e no PDF [`PixelPress-Auditoria-e-Backend.pdf`](./PixelPress-Auditoria-e-Backend.pdf).

## Rodar localmente

```bash
# qualquer servidor estático serve; ex.:
npx serve .
# ou
python -m http.server 8080
```

Abra `index.html`. Conta demo: **demo@pixelpress.com.br** / **demo123**
(ou clique em "Entrar com demo" na tela de login).

## Páginas

| Página | O que mostra |
|---|---|
| `index.html` | Landing page (hero, funcionalidades, como funciona, planos, depoimentos, CTA) |
| `login.html` | Login (email + senha, "esqueceu a senha", conta demo) |
| `signup.html` | Cadastro com plano via `?plan=SIMPLE\|BASIC\|PRO\|ADVANCED` |
| `forgot-password.html` | Recuperação de senha (simulada) |
| `dashboard.html` | KPIs, últimos artigos, linhas ativas, sites WordPress |
| `criar-artigo.html` | Geração de artigo (tipo, tom, site, tamanho, imagem) |
| `linhas-de-producao.html` | CRUD de linhas + executar |
| `feeds-rss.html` | CRUD de feeds, ligar/desligar, buscar |
| `historico.html` | Filtros por status, busca, preview do artigo |
| `sites-wordpress.html` | Adicionar/testar/remover sites, limite por plano |
| `chaves-de-api.html` | Chaves de IA (OpenAI/Gemini) + chaves de API + exemplo `curl` |
| `planos.html` | Plano atual, upgrade, faturas |
| `perfil.html` | Dados, preferências, modo escuro, logout |

## Estrutura

```
assets/
  app.css       # camada de componentes (botões, cards, tabelas, shell, dark mode)
  theme.css     # Tailwind compilado do original, remapeado para o amarelo PixelPress
  fonts.css     # @font-face (DM Sans, Plus Jakarta Sans, JetBrains Mono)
  fonts/        # arquivos woff2
  store.js      # "banco" em localStorage: usuários, sites, artigos, linhas, feeds, chaves, faturas
  ui.js         # ícones SVG, toasts, modais, tema, shell (sidebar + topbar)
  pixelpress-*.png
```

## Testes

`e2e.cjs` (Playwright) cobre os 11 fluxos principais: login, senha errada, rota protegida,
signup, gerar artigo, criar linha, criar feed, busca no histórico, adicionar site,
gerar chave de API, trocar de plano, salvar perfil e logout.

```bash
npm install playwright-core
node e2e.cjs
```

## Créditos

Layout e design system derivados do site wordbee.com.br (clone de estudo, sem afiliação).
Marca, logotipo e ícone: PixelPress.
