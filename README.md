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

## Envio de Vídeo sem Login Social (Instagram)

Com base no requisito de remover todo o login social, o fluxo foi simplificado para:

- O usuário cola a URL pública do vídeo (Reel) do Instagram na página "Enviar Vídeos" e escolhe a competição.
- O backend extrai, de forma pública (via HTML da página), as seguintes informações:
  - Views (quando disponíveis no HTML público do Reel)
  - Hashtags e menções encontradas na legenda
- Essas informações são salvas junto do vídeo e aparecem em "Meus Vídeos".

Observação: Como esse processo usa scraping do HTML público do Instagram, ele pode falhar ou não retornar views dependendo da página/conta e de mudanças do Instagram.

### Rotas de API relevantes

- `GET /api/competitions/enrolled-active` — lista competições ativas em que o usuário está inscrito.
- `POST /api/videos` — cria o vídeo. Se `socialMedia==='instagram'`, o servidor chama o coletor público para obter views/hashtags/menções automaticamente.
- `POST /api/public/instagram/reel-insights` — utilitário público para testar a coleta de métricas a partir de uma URL de Reel.

### Teste rápido (sem login social)

1. Acesse `/instagram/insights`.
2. Cole a URL pública de um Reel, por exemplo: `https://www.instagram.com/reel/ABC123/`.
3. Clique em Buscar para ver o shortcode, views (se disponível), hashtags e menções detectadas.

Na página "Enviar Vídeos", colar a mesma URL criará o envio e persistirá essas informações, exibindo-as depois no dashboard.
