Prompt 1 de 3: A Plataforma EloX (Requisitos Gerais e Funcionalidades Essenciais)
Objetivo: Projetar e desenvolver a plataforma "EloX", um sistema de gamificação e monetização para criadores de conteúdo de vídeo ("clipadores"). A plataforma permitirá que usuários enviem vídeos curtos, acumulem visualizações, participem de competições e sejam remunerados com base em seu desempenho. O sistema deve ser seguro, escalável e oferecer uma experiência de usuário fluida tanto para os clipadores quanto para os administradores.

Stack Tecnológica Sugerida:

Frontend: Next.js (com App Router) e TypeScript

Backend: Node.js com um framework como NestJS ou a utilização de Serverless Functions (Vercel/AWS Lambda)

Banco de Dados: PostgreSQL ou MongoDB

Autenticação: NextAuth.js ou um serviço como Clerk/Auth0

Estilização: Tailwind CSS

Requisitos Funcionais Essenciais:

Módulo de Autenticação de Usuário (Clipador):

Página de Cadastro: Formulário para novos usuários se registrarem com username, email e senha. Deve incluir validação de dados e verificação de e-mail.

Página de Login: Formulário para usuários existentes acessarem a plataforma.

Recuperação de Senha: Fluxo padrão de "esqueci minha senha".

Fluxo de Envio e Validação de Vídeos:

O usuário ("clipador") submete um link de um vídeo que postou em uma rede social (ex: TikTok, Instagram Reels, Kwai).

O sistema armazena o link e o marca com o status "Pendente".

Um administrador revisa o vídeo no painel de administração.

O administrador pode "Aprovar" ou "Rejeitar" o vídeo. A decisão deve ser notificada ao usuário.

Vídeos "Aprovados" tornam-se elegíveis para contabilizar métricas.

Sistema de Coleta de Métricas:

O sistema deve, periodicamente, buscar dados de visualizações (views), curtidas e comentários dos links de vídeos aprovados.

Isso pode ser feito através de scraping ou integração com APIs (se disponível). Deve haver um mecanismo robusto para lidar com falhas e retentativas.

As métricas coletadas são associadas ao vídeo e ao clipador correspondente.

Módulo de Competições e Ranking:

Administradores podem criar "competições" com data de início, fim e regras específicas (ex: "quem fizer mais views na semana X").

A plataforma deve exibir um ranking em tempo real dos clipadores com base nas métricas da competição ativa.

Sistema de Pagamentos:

O sistema deve calcular os ganhos dos usuários com base em regras definidas pelos administradores (ex: Custo Por Mil visualizações - CPM).

Os usuários podem solicitar o saque de seus ganhos acumulados.

Os administradores processam esses pedidos de saque através do painel de administração, marcando-os como "Pagos".

Páginas Públicas:

Landing Page: Página de apresentação da EloX, explicando como funciona e com chamadas para ação (CTAs) para cadastro.

Página de Ranking Público (Opcional): Uma página que exibe o top 10 de clipadores da competição atual para engajamento.

Prompt 2 de 3: O Painel do Usuário / Clipador (Interface do Cliente)
Objetivo: Criar um dashboard intuitivo e funcional para o "clipador". A interface deve permitir que ele envie seus vídeos, acompanhe seu desempenho, visualize seus ganhos e gerencie sua conta de forma simples e direta.

Estrutura e Funcionalidades do Painel do Usuário:

Dashboard Principal:

Visão Geral: Cards destacando as métricas mais importantes: Ganhos Totais, Ganhos no Mês, Views Totais, e Posição no Ranking.

Gráfico de Desempenho: Um gráfico de linhas mostrando a evolução de visualizações ou ganhos nos últimos 7 ou 30 dias.

Avisos e Notificações: Uma área para notificações importantes (ex: "Seu vídeo foi aprovado", "Pagamento processado").

Página de Envio de Vídeos:

Formulário Simples: Um campo de input para o usuário colar a URL do vídeo.

Seleção de Rede Social: Botões ou um seletor para indicar a plataforma do vídeo (TikTok, Instagram, etc.).

Regras e Diretrizes: Uma lista clara das regras para que um vídeo seja considerado válido.

Página "Meus Vídeos":

Tabela ou Lista: Uma lista de todos os vídeos enviados pelo usuário.

Colunas: Miniatura (se possível), URL, Data de Envio, Views, Ganhos Gerados e Status (Pendente, Aprovado, Rejeitado).

Filtros: Permitir que o usuário filtre os vídeos por status.

Página de Pagamentos / Carteira:

Saldo Disponível: Exibição clara do valor disponível para saque.

Botão de Saque: Um botão que, ao ser clicado, inicia o processo de solicitação de pagamento (pode abrir um modal para confirmação).

Configuração da Chave PIX: Um campo para o usuário cadastrar e atualizar sua chave PIX. Este campo deve ser protegido.

Histórico de Transações: Uma tabela com o histórico de todos os saques solicitados, com data, valor e status (Pendente, Processado).

Página de Competições:

Ranking Completo: Exibição da tabela de classificação da competição atual, destacando a posição do usuário logado.

Regras da Competição: Descrição clara das regras, prêmios e duração da competição ativa.

Página de Configurações:

Alteração de Senha: Formulário para o usuário atualizar sua senha.

Gerenciamento de Dados: Opção para editar informações básicas do perfil.

Prompt 3 de 3: O Painel de Administração (Interface de Gestão)
Objetivo: Desenvolver um painel de administração robusto, responsivo e interativo utilizando Next.js, TypeScript e Tailwind CSS. O design e as funcionalidades devem ser baseados no arquivo EloX-admin-panel.html fornecido, servindo como o centro de controle para todas as operações da plataforma EloX.

(Nota: Este é o prompt refinado da sua solicitação original, agora contextualizado dentro do ecossistema completo.)

Stack Tecnológica:

Framework: Next.js (com App Router), TypeScript

Estilização: Tailwind CSS

Gerenciamento de Estado: Zustand ou React Context API

Gráficos: Chart.js (com react-chartjs-2)

Ícones: lucide-react

Funcionalidades e Seções do Painel de Administração:

Autenticação Segura:

Página de login exclusiva para administradores.

Rotas sob /admin devem ser protegidas.

Dashboard (/admin/dashboard):

Métricas em Tempo Real: Cards com "Clipadores Ativos", "Total Pago Hoje", "Vídeos Pendentes de Validação", e "Views Totais da Plataforma".

Gráfico de Performance: Gráfico de desempenho geral da competição ativa.

Log de Atividades Recentes: Feed mostrando as últimas ações na plataforma (novos cadastros, vídeos enviados, pagamentos processados).

Gerenciamento de Clipadores (/admin/clipadores):

Tabela de Usuários: Lista completa de todos os usuários cadastrados.

Visualização Detalhada: Capacidade de clicar em um usuário para ver seu perfil completo, incluindo histórico de vídeos e pagamentos.

Ações Administrativas:

Ativar/Inativar: Mudar o status de um usuário.

Aplicar Avisos: Adicionar "warnings" a um usuário que violou as regras.

Banir: Remover permanentemente o acesso de um usuário.

Validação de Vídeos (/admin/videos):

Fila de Validação: Interface com abas (Pendentes, Validados, Rejeitados) para gerenciar os vídeos enviados.

Visualizador: Ao clicar em um vídeo pendente, exibir o vídeo (embedado) ou um link direto para facilitar a verificação.

Ações Rápidas: Botões de "Aprovar" e "Rejeitar" com um clique. A rejeição pode abrir um campo para especificar o motivo.

Gerenciamento de Competições (/admin/competitions):

Formulário de Criação: Criar novas competições com nome, datas de início/fim, e regras de pontuação (ex: valor do CPM).

Lista de Competições: Ver competições ativas, agendadas e passadas.

Processamento de Pagamentos (/admin/payments):

Fila de Saques: Tabela com todas as solicitações de saque pendentes.

Informações para Pagamento: Exibir o nome do usuário, valor solicitado e sua chave PIX.

Ação de Processamento: Um botão "Marcar como Pago" que move a solicitação para o histórico e notifica o usuário.

Processamento em Lote: Opção de selecionar múltiplos pagamentos e processá-los de uma vez.

Detector de Fraudes e Analytics (/admin/fraud, /admin/analytics):

Alertas Automatizados: Sistema que sinaliza atividades suspeitas (crescimento anormal de views, múltiplos envios em curto espaço de tempo).

Análise de Dados: Relatórios sobre o Custo Por View (CPV), Retorno Sobre o Investimento (ROI) das competições, e crescimento da plataforma.

Configurações do Sistema (/admin/settings):

Parâmetros Gerais: Definir valores como o número máximo de avisos antes do banimento, máximo de vídeos por dia por usuário, e se os pagamentos são automáticos ou manuais.

Gerenciamento de Admins: Adicionar ou remover outros administradores.