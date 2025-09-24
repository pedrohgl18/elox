# EloX - Plataforma de Gamificação para Criadores de Conteúdo

EloX é um ecossistema completo de gamificação e monetização para criadores de conteúdo de vídeo (clipadores).

## Funcionalidades

- **Dashboard do Usuário**: KPIs, gráficos, envio de vídeos e solicitação de pagamentos
- **Painel Administrativo**: Gerenciamento de usuários e validação de conteúdo
- **Sistema de Autenticação**: NextAuth.js com credenciais
- **API Completa**: Endpoints para vídeos, pagamentos e competições

## Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Estado**: Zustand
- **Autenticação**: NextAuth.js
- **Gráficos**: Chart.js (react-chartjs-2)
- **Ícones**: Lucide React

## Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção
npm start
```

## Credenciais de Teste

### Administrador
- **Email**: admin@elox.dev
- **Senha**: admin

### Usuário (Clipador)
- **Email**: user@elox.dev
- **Senha**: user

## Rotas Principais

- `/` - Landing page
- `/auth/login` - Página de login
- `/dashboard` - Dashboard do clipador
- `/admin/dashboard` - Dashboard administrativo

## Estrutura do Projeto

```
src/
├── app/                 # Rotas do App Router
├── components/
│   ├── ui/             # Componentes de UI reutilizáveis
│   ├── auth/           # Componentes de autenticação
│   ├── charts/         # Componentes de gráficos
│   └── user/           # Componentes específicos do usuário
└── lib/                # Utilitários e configurações
```

## Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Executar build
- `npm run lint` - Verificar linting
- `npm run typecheck` - Verificar tipos TypeScript

## API Endpoints

### Vídeos
- `GET /api/videos` - Lista vídeos do usuário
- `POST /api/videos` - Enviar novo vídeo
- `PATCH /api/videos/[id]` - Aprovar/rejeitar vídeo (admin)

### Pagamentos
- `GET /api/payments` - Lista pagamentos do usuário
- `POST /api/payments` - Solicitar pagamento
- `PATCH /api/payments/[id]` - Processar pagamento (admin)

### Competições
- `GET /api/competitions` - Lista competições ativas
- `POST /api/competitions` - Criar competição (admin)
- `PATCH /api/competitions/[id]` - Atualizar competição (admin)