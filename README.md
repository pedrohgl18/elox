# EloX

Plataforma de gamificação e monetização para clipadores.

 
## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Zustand
- NextAuth.js
- Chart.js (react-chartjs-2)
- lucide-react

## Como rodar (Windows PowerShell)

1. Instale as dependências:

```powershell
cd "c:\Users\Administrator\Downloads\EloX"; npm install
```

1. Rode o servidor de desenvolvimento:

```powershell
npm run dev
```

1. Acesse em <http://localhost:3000>

## Estrutura de pastas

- `src/app` — rotas com App Router (landing, auth, (user), admin, api)
- `src/components` — componentes reutilizáveis (ui, layout, charts, auth)
- `src/lib` — tipos, stores, utilitários, auth
- `src/styles` — estilos globais (Tailwind)

 
## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run start` — iniciar app em produção
- `npm run lint` — lint
- `npm run format` — formatar com Prettier
- `npm run typecheck` — checagem de tipos

 
## Notas

- Configure as variáveis de ambiente do NextAuth em `.env.local` quando for ativar provedores.
- O arquivo `src/lib/types.ts` concentra os modelos de dados principais.
- Documentação de banco de dados e schema: ver `DATABASE.md` (configuração via Supabase web, sem CLI).

### Credenciais de teste (banco em memória)

- Admin: email `admin@elox.dev` / senha `admin`
- Clipador: email `user@elox.dev` / senha `user`

### Rotas de API disponíveis (iniciais)

- `GET /api/videos` — lista vídeos do usuário (ou todos, se admin)
- `POST /api/videos` — cria vídeo pendente `{ url, socialMedia: 'tiktok'|'instagram'|'kwai' }`
- `GET /api/videos/:id` — detalha vídeo (autorização por owner/admin)
- `PATCH /api/videos/:id` — admin aprova/rejeita `{ action: 'approve' | 'reject' }`
- `GET /api/payments` — lista pagamentos do usuário (ou todos, se admin)
- `POST /api/payments` — solicita saque `{ amount: number }`
- `GET /api/payments/:id` — detalhe do pagamento (escopo do usuário)
- `PATCH /api/payments/:id` — admin marca como pago
- `GET /api/competitions` — lista competições
- `POST /api/competitions` — cria competição (admin)
- `PATCH /api/competitions/:id` — atualiza competição (admin)

## Integração Social e Fluxo de Envio por Hashtag

### Visão geral

- Conexão de contas sociais acontece dentro do Dashboard do usuário (não no login).
- O envio de posts por hashtag acontece exclusivamente na página "Enviar Vídeos".
- Admin define hashtags obrigatórias por competição; usamos essas hashtags para filtrar posts do Instagram do usuário conectado.

### UI

- Dashboard do Usuário:
  - Seção "Conectar Contas Sociais" com botões de OAuth e lista de contas conectadas.
  - Sem envio de posts nessa tela.

- Página Enviar Vídeos (`/dashboard/upload`):
  - Form padrão para colar URL e selecionar campanha.
  - Seção "Selecionar Post do Instagram por Hashtag":
    - Carrega competições ativas em que o usuário está inscrito.
    - Sugere a hashtag obrigatória da competição (quando houver).
    - Lista posts do Instagram do usuário com essa hashtag e permite enviar diretamente para a competição escolhida.

### Rotas de API novas

- `GET /api/competitions/enrolled-active` — lista competições em que o usuário está inscrito e ativas por data.
- `GET /api/social-accounts` — lista contas sociais conectadas do usuário.
- `POST /api/social-accounts` — adiciona/atualiza conta (MVP/mock; produção via OAuth).
- `DELETE /api/social-accounts/:id` — remove conta (MVP/mock).
- `GET /api/social-accounts/posts?platform=instagram&hashtag=%23xxx` — lista posts do Instagram do usuário autenticado filtrando por hashtag.
- `POST /api/videos` — agora aceita `competitionId` e valida inscrição do usuário nessa competição.

### OAuth Instagram (Instagram Graph com Facebook Login)

- Início: `GET /api/social-accounts/oauth/instagram/start`
- Callback: `GET /api/social-accounts/oauth/instagram/callback`
- Fluxo: Facebook Login → listar Páginas do usuário → obter `instagram_business_account` e token de Página → IG User ID.
- Permissões mínimas: `instagram_basic`, `pages_show_list` (considere `pages_read_engagement` conforme o caso).
- Pré-requisito: conta Instagram do usuário deve ser Business/Creator e vinculada a uma Página do Facebook.

### Variáveis de Ambiente (Netlify)

Defina as variáveis no painel do Netlify (Site settings → Build & deploy → Environment):

- `FACEBOOK_APP_ID` (ou `INSTAGRAM_CLIENT_ID` para compatibilidade)
- `FACEBOOK_APP_SECRET` (ou `INSTAGRAM_CLIENT_SECRET`)
- `NEXTAUTH_SECRET` (se usar NextAuth)
- `NEXTAUTH_URL` (ex.: `https://seu-site.netlify.app`)

Redirect URI no Facebook Login:

- `{BASE_URL}/api/social-accounts/oauth/instagram/callback`

Observações de Deploy no Netlify:

- Este projeto usa App Router do Next.js e rotas de API; o Netlify Netlify Adapter para Next cuida das funções serverless automaticamente.
- Certifique-se de que `netlify.toml` está presente e a versão de Node no Netlify seja compatível com a usada localmente.

### Banco de dados / Tokens

- Tokens de acesso do Instagram são armazenados na tabela `social_accounts` (via Supabase), e nunca expostos ao client diretamente.
- A listagem de posts por hashtag é feita server-side usando o token armazenado.

### Experiência de Usuário

- Mensagens de sucesso/erro aparecem como toasts globais.
- O envio por hashtag exige que o usuário esteja conectado com o Instagram e inscrito na competição selecionada.
