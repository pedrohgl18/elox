Excelente escolha! EloX é um nome forte, moderno e memorável.

Aqui está o arquivo agents.md atualizado com o novo nome e os ajustes necessários. Ele está pronto para ser usado no seu ambiente de desenvolvimento.

EloX Project Agent Context (agents.md)
1. Missão do Projeto: Gênesis EloX
Sua diretriz principal é construir e manter a plataforma "EloX".

EloX é um ecossistema completo de gamificação e monetização para criadores de conteúdo de vídeo, chamados "clipadores". A plataforma é dividida em três partes principais:

A Plataforma Pública: Landing page e páginas de engajamento (ranking, etc.).

O Painel do Usuário (Clipador): A interface onde os usuários enviam vídeos, acompanham métricas e solicitam pagamentos.

O Painel de Administração: A central de controle para a equipe EloX gerenciar usuários, validar conteúdo, processar pagamentos e configurar o sistema.

Nunca se desvie desta visão. Cada funcionalidade deve servir a um desses três pilares.

2. Pilares da Arquitetura e Filosofia de Código
Você deve seguir estritamente os seguintes princípios em todo o código que escrever:

Componentização Radical: Tudo deve ser um componente reutilizável sempre que possível. Evite monolitos. A estrutura de diretórios em src/components é a fonte da verdade para componentes de UI.

Segurança de Tipos (Type-Safety) é Inegociável: O projeto usa TypeScript. Nenhuma variável ou função deve ter o tipo any a menos que seja absolutamente inevitável e justificado. Use as interfaces definidas na seção 5.

Performance e Escalabilidade: Utilize as melhores práticas do Next.js (Server Components, Client Components, Roteamento, etc.) para garantir uma aplicação rápida e que possa crescer.

Código Limpo e Legível: Escreva código como se a próxima pessoa a lê-lo fosse um psicopata que sabe onde você mora. Use nomes de variáveis descritivos, funções pequenas e focadas, e adicione comentários apenas quando a lógica for complexa.

3. Stack Tecnológica Oficial
Use exclusivamente as tecnologias definidas abaixo. Não introduza novas bibliotecas ou frameworks sem seguir um processo de aprovação.

Framework: Next.js (com App Router)

Linguagem: TypeScript

Estilização: Tailwind CSS

Gerenciamento de Estado Global: Zustand (preferencial) ou React Context API para casos simples.

Gráficos: Chart.js (react-chartjs-2)

Ícones: lucide-react

Backend: Funções Serverless (Vercel/Next.js API Routes) ou Node.js (NestJS)

Autenticação: NextAuth.js

4. Estrutura de Diretórios Canônica
Respeite a seguinte estrutura de arquivos. Ao criar novos arquivos, coloque-os no local apropriado.

/src
|-- /app
|   |-- /api                 # API Routes do Next.js
|   |-- /admin               # Rotas e páginas do Painel Admin
|   |-- /(user)              # Rotas e páginas do Painel do Usuário (Clipador)
|   |-- /auth                # Rotas de login, cadastro, etc.
|   |-- layout.tsx
|   |-- page.tsx             # Landing Page
|-- /components
|   |-- /auth                # Componentes de autenticação (LoginForm)
|   |-- /charts              # Componentes de gráficos
|   |-- /layout              # Componentes de layout (Header, Sidebar)
|   |-- /ui                  # Componentes de UI genéricos (Button, Card, Modal)
|-- /lib
|   |-- api.ts               # Lógica de chamada à API (client-side)
|   |-- auth.ts              # Configuração do NextAuth.js
|   |-- database.ts          # Lógica de conexão com o banco de dados
|   |-- types.ts             # Definições de tipos e interfaces globais
|   |-- hooks.ts             # Hooks customizados
|-- /styles
|   |-- globals.css          # Estilos globais e configuração do Tailwind
5. Modelos de Dados e Tipos (TypeScript)
Estas são as interfaces centrais do sistema. Use-as para garantir a consistência dos dados em toda a aplicação. Elas devem residir em src/lib/types.ts.

TypeScript

// src/lib/types.ts

// Enum para status reaproveitáveis
export enum VideoStatus {
  Pending = 'PENDING',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

export enum PaymentStatus {
  Pending = 'PENDING',
  Processed = 'PROCESSED',
  Failed = 'FAILED',
}

// Interface para o Usuário (Clipador)
export interface Clipador {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  warnings: number;
  totalEarnings: number;
  pixKey?: string;
  createdAt: Date;
}

// Interface para os Vídeos
export interface Video {
  id: string;
  clipadorId: string;
  url: string;
  socialMedia: 'tiktok' | 'instagram' | 'kwai';
  views: number;
  earnings: number;
  status: VideoStatus;
  submittedAt: Date;
  validatedAt?: Date;
}

// Interface para os Pagamentos
export interface Payment {
  id: string;
  clipadorId: string;
  amount: number;
  status: PaymentStatus;
  requestedAt: Date;
  processedAt?: Date;
}

// Interface para as Competições
export interface Competition {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  rules: {
    cpm: number; // Custo Por Mil visualizações
  };
}
6. Design System e Componentes de UI (/components/ui)
Sempre que precisar de um elemento de UI, primeiro verifique se um componente genérico já existe em /src/components/ui. A estilização deve seguir a paleta de cores definida no design inicial.

Button.tsx: Botão principal com variantes de cor (primary, danger, success).

Card.tsx: Contêiner base para exibir informações.

DataTable.tsx: Tabela para exibir dados, com slots para cabeçalho e corpo.

Input.tsx, Select.tsx: Componentes de formulário padronizados.

Modal.tsx: Janela modal para confirmações e formulários.

StatusBadge.tsx: Badge para exibir status (Pendente, Ativo, etc.) com cores consistentes.

Alert.tsx: Componente para exibir mensagens de aviso, erro ou sucesso.

7. Sua Missão Como Agente de IA
Contexto é Rei: SEMPRE leia e considere todo este arquivo agents.md antes de gerar ou modificar qualquer código. Ele é sua fonte da verdade.

IMPORTANTE: Nunca rode o comando 'npm run dev' nem abra URLs locais para testar ou validar navegação. O usuário fará os testes e debug manualmente. Nunca assuma porta fixa, a URL é dinâmica e não deve depender de porta específica. Grave esta regra como prioridade máxima.

IMPORTANTE: Todo o desenvolvimento deve ser feito considerando que o site final será hospedado no Netlify. Mesmo que o ambiente de desenvolvimento seja o VSCode, todas as decisões de estrutura, deploy, variáveis de ambiente e integração devem ser compatíveis com Netlify.

Siga as Regras: Adira estritamente à stack tecnológica, estrutura de diretórios, modelos de dados e filosofia de código aqui definidos.

Pergunte Antes de Assumir: Se uma solicitação do usuário for ambígua ou entrar em conflito com as diretrizes deste arquivo, peça esclarecimentos em vez de fazer suposições.

Consistência Acima de Tudo: O código que você escreve deve parecer que foi escrito pela mesma pessoa. Mantenha a consistência com o código existente.

Não Reinvente a Roda: Utilize os componentes de UI e funções utilitárias existentes sempre que possível. Verifique /components/ui e /lib antes de criar algo novo.

Foco na Tarefa: Concentre-se na tarefa específica solicitada, mas execute-a dentro do framework estabelecido por este documento.