# Banco de Dados EloX (Supabase)

Este documento descreve como configurar o banco de dados no **Supabase (interface web)**. Nenhum comando CLI ou local deve ser usado, alinhado ao requisito de usar exclusivamente o painel online.

## Visão Geral

Usaremos **PostgreSQL gerenciado** pelo Supabase para persistir usuários (perfil clipador), vídeos, métricas, pagamentos e competições. O objetivo é migrar gradualmente da camada em memória (`src/lib/database.ts`) para acesso real. Enquanto a migração não estiver completa, a aplicação detectará variáveis de ambiente e poderá usar Supabase quando disponível.

## Tabelas Principais

### 1. profiles (usuários / clipadores e admins)

Campos:

- id: uuid (Primary Key) – deve corresponder ao auth user id (se futuramente usarmos Supabase Auth) ou gerar via função `gen_random_uuid()`.
- email: text UNIQUE NOT NULL
- username: text UNIQUE NOT NULL
- role: text NOT NULL (enum textual: 'admin' | 'clipador')
- is_active: boolean DEFAULT true
- warnings: integer DEFAULT 0
- total_earnings: numeric(12,2) DEFAULT 0
- pix_key: text NULL
- created_at: timestamptz DEFAULT now()
- password_hash: text (armazenar hash bcrypt para integração com autenticação custom futura)

Índices:

- UNIQUE(email)
- UNIQUE(username)
 social_media: text CHECK (social_media IN ('tiktok','instagram','kwai','youtube'))

### 2. videos

 allowed_platforms: text[] DEFAULT ARRAY['tiktok','instagram','kwai','youtube']::text[]

- id: uuid PK DEFAULT gen_random_uuid()
- clipador_id: uuid REFERENCES profiles(id) ON DELETE CASCADE
 Implementar adapter (videos, competitions, payments, profiles)
- social_media: text CHECK (social_media IN ('tiktok','instagram','kwai'))
- views: bigint DEFAULT 0
- earnings: numeric(12,2) DEFAULT 0
- status: text CHECK (status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING'
- submitted_at: timestamptz DEFAULT now()

-- videos
- BTREE(status)


### 3. payments

  social_media text CHECK (social_media IN ('tiktok','instagram','kwai','youtube')),

- id: uuid PK DEFAULT gen_random_uuid()
- clipador_id: uuid REFERENCES profiles(id) ON DELETE CASCADE
- amount: numeric(12,2) NOT NULL
- status: text CHECK (status IN ('PENDING','PROCESSED','FAILED')) DEFAULT 'PENDING'
- requested_at: timestamptz DEFAULT now()
- processed_at: timestamptz NULL
-- competitions
Índices:

- BTREE(clipador_id)
- BTREE(status)

### 4. competitions

Campos:

- id: uuid PK DEFAULT gen_random_uuid()
  allowed_platforms text[] DEFAULT ARRAY['tiktok','instagram','kwai','youtube']::text[],
- description: text
- banner_image_url: text
- start_date: date NOT NULL
- end_date: date NOT NULL
- is_active: boolean DEFAULT true
- status: text CHECK (status IN ('SCHEDULED','ACTIVE','COMPLETED'))
- cpm: numeric(10,2) DEFAULT 0  -- custo por mil views base
- allowed_platforms: text[] DEFAULT ARRAY['tiktok','instagram','kwai']::text[]
- created_at: timestamptz DEFAULT now()

### 5. competition_rewards

Campos:

- id: uuid PK DEFAULT gen_random_uuid()
- competition_id: uuid REFERENCES competitions(id) ON DELETE CASCADE
- place: integer NOT NULL
- amount: numeric(12,2) NOT NULL

Índices:

- UNIQUE(competition_id, place)

### 6. video_metrics (futuro - coleta incremental)

Campos:

- id: bigserial PK
- video_id: uuid REFERENCES videos(id) ON DELETE CASCADE
- captured_at: timestamptz DEFAULT now()
- views: bigint
- likes: bigint
- comments: bigint

Índices:

- BTREE(video_id, captured_at DESC)

## Criação das Tabelas (Interface Web)

1. Acesse o projeto Supabase > Seção SQL Editor.
2. Crie cada tabela com scripts separados (cole e execute) — você pode agrupar mas mantenha ordem por dependências.
3. Utilize a extensão `pgcrypto` (ativa por padrão) para `gen_random_uuid()` se ainda não estiver ativa.

Exemplo (cole no editor web):

```sql
-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  role text NOT NULL,
  is_active boolean DEFAULT true,
  warnings integer DEFAULT 0,
  total_earnings numeric(12,2) DEFAULT 0,
  pix_key text,
  created_at timestamptz DEFAULT now()
);

-- videos
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clipador_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  social_media text CHECK (social_media IN ('tiktok','instagram','kwai')),
  views bigint DEFAULT 0,
  earnings numeric(12,2) DEFAULT 0,
  status text CHECK (status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING',
  submitted_at timestamptz DEFAULT now(),
  validated_at timestamptz
);

-- payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clipador_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status text CHECK (status IN ('PENDING','PROCESSED','FAILED')) DEFAULT 'PENDING',
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- competitions
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  banner_image_url text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  status text CHECK (status IN ('SCHEDULED','ACTIVE','COMPLETED')),
  cpm numeric(10,2) DEFAULT 0,
  allowed_platforms text[] DEFAULT ARRAY['tiktok','instagram','kwai']::text[],
  created_at timestamptz DEFAULT now()
);

-- competition_rewards
CREATE TABLE IF NOT EXISTS public.competition_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  place integer NOT NULL,
  amount numeric(12,2) NOT NULL,
  UNIQUE(competition_id, place)
);
```

## Regras de Segurança (RLS)

Ative Row Level Security em todas as tabelas:

1. Abra a tabela > Security > Enable RLS.
2. Políticas sugeridas:

profiles:

- Select own profile: `(auth.uid() = id)`
- (Admin) full access: criar política baseada em role armazenada em JWT custom claims (futuro) ou usar service role em server-side.

videos:

- Select: owner (clipador_id = auth.uid()) OR admin
- Insert: (auth.uid() = clipador_id)
- Update: somente admin OU (owner para campos limitados)

payments:

- Select: owner ou admin
- Insert: owner (solicitação)
- Update: admin (marcar processado)

competitions / competition_rewards:

- Read: pública (se aceitável) ou aberta a todos os usuários autenticados
- Write: apenas admin

## Variáveis de Ambiente (Netlify)

Configurar em Site Settings > Build & Deploy > Environment:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (somente se necessário em server actions; não expor no client)

## Migração Gradual

1. Implementar adapter Supabase em `database.ts` detectando presença das variáveis.
2. Operações de leitura priorizam Supabase; se falhar ou não configurado, fallback memória.
3. Após validação, remover gradualmente o in-memory.

## Próximos Passos

- Implementar adapter (videos, competitions, payments, profiles)
- Adicionar caching leve (revalidateTag) para listas
- Instrumentar logging mínimo para detectar falhas de persistência.

