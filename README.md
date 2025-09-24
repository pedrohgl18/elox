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

2. Rode o servidor de desenvolvimento:

```powershell
npm run dev
```

3. Acesse em http://localhost:3000

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
