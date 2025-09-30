-- EloX - Supabase Full Schema & Seed (único arquivo)
-- Execute integralmente no SQL Editor do Supabase, em produção rode com cautela.
-- Inclui: extensões, tabelas, constraints, índices, RLS (apenas enable), funções utilitárias e seeds mínimos.

-- 0) Extensões
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Tabelas principais

-- 1.1) profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  username_normalized text GENERATED ALWAYS AS (lower(username)) STORED,
  role text NOT NULL,
  password_hash text,
  is_active boolean DEFAULT true,
  warnings integer DEFAULT 0,
  total_earnings numeric(12,2) DEFAULT 0,
  pix_key text,
  created_at timestamptz DEFAULT now()
);

-- 1.2) videos
-- social_media inclui YouTube
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clipador_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  social_media text CHECK (social_media IN ('tiktok','instagram','kwai','youtube')),
  views bigint DEFAULT 0,
  earnings numeric(12,2) DEFAULT 0,
  status text CHECK (status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING',
  submitted_at timestamptz DEFAULT now(),
  validated_at timestamptz,
  competition_id uuid REFERENCES public.competitions(id)
);

-- Índice único anti-duplicidade por usuário/URL (case-insensitive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uq_videos_clipador_url_norm'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uq_videos_clipador_url_norm ON public.videos (clipador_id, lower(url))';
  END IF;
END$$;

-- 1.3) payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clipador_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status text CHECK (status IN ('PENDING','PROCESSED','FAILED')) DEFAULT 'PENDING',
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- 1.4) competitions
-- allowed_platforms inclui YouTube por padrão
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  banner_image_url text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  status text CHECK (status IN ('SCHEDULED','ACTIVE','COMPLETED')),
  allowed_platforms text[] DEFAULT ARRAY['tiktok','instagram','kwai','youtube']::text[],
  required_hashtags text[] DEFAULT ARRAY[]::text[],
  required_mentions text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- 1.5) competition_rewards
CREATE TABLE IF NOT EXISTS public.competition_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  from_place integer NOT NULL,
  to_place integer NOT NULL,
  amount numeric(12,2) NOT NULL,
  platform text NULL CHECK (platform IN ('tiktok','instagram','kwai','youtube')),
  description text NULL,
  UNIQUE(competition_id, from_place, to_place, COALESCE(platform, 'all'))
);

-- 1.6) competition_participants
CREATE TABLE IF NOT EXISTS public.competition_participants (
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  clipador_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (competition_id, clipador_id)
);

-- 1.7) notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('video_approved','video_rejected','payment_processed','payment_failed')),
  title text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id) WHERE read_at IS NULL;

-- 1.8) social_accounts (para OAuth/integrações)
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('tiktok','instagram','kwai','youtube')),
  provider_account_id text NOT NULL,
  username text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  status text DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_provider ON public.social_accounts(provider);

-- 1.9) video_metrics (histórico de coletas - RLS ativado e sem políticas)
CREATE TABLE IF NOT EXISTS public.video_metrics (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'instagram',
  url text not null,
  shortcode text,
  views bigint,
  hashtags text[],
  mentions text[],
  collected_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS video_metrics_platform_short_url ON public.video_metrics(platform, shortcode, url);
CREATE INDEX IF NOT EXISTS video_metrics_collected_at ON public.video_metrics(collected_at DESC);
ALTER TABLE public.video_metrics ENABLE ROW LEVEL SECURITY;

-- 1.10) Migrações idempotentes embutidas (para bancos já existentes)
-- (a) Garantir CHECK de social_media incluindo 'youtube' em public.videos
DO $$
DECLARE
  v_constraint_name text;
BEGIN
  SELECT conname INTO v_constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public' AND t.relname = 'videos' AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%social_media%';
  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.videos DROP CONSTRAINT %I', v_constraint_name);
  END IF;
  EXECUTE 'ALTER TABLE public.videos '
       || 'ADD CONSTRAINT videos_social_media_check '
       || 'CHECK (social_media IN (''tiktok'',''instagram'',''kwai'',''youtube''))';
END $$;

-- (b) Ajustar default de competitions.allowed_platforms para incluir 'youtube'
ALTER TABLE public.competitions
  ALTER COLUMN allowed_platforms SET DEFAULT ARRAY['tiktok','instagram','kwai','youtube']::text[];

-- (c) Backfill simples do allowed_platforms quando nulo ou com lista antiga
UPDATE public.competitions
  SET allowed_platforms = ARRAY['tiktok','instagram','kwai','youtube']::text[]
  WHERE allowed_platforms IS NULL
     OR allowed_platforms = ARRAY['tiktok','instagram','kwai']::text[];

-- 2) Funções utilitárias
CREATE OR REPLACE FUNCTION public.search_username_ci(search_value text)
RETURNS SETOF public.profiles AS $$
  SELECT * FROM public.profiles WHERE username_normalized = lower(search_value);
$$ LANGUAGE sql STABLE;

-- 3) Seeds mínimos
INSERT INTO public.profiles (email, username, role, password_hash)
VALUES ('admin@elox.dev', 'admin', 'admin', '$2a$10$l3xZZ11H8fV/1/y5hvHef.NHSfGNtzWXskFlEwA414rnYAb7aTi3e')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (email, username, role, password_hash)
VALUES ('user@elox.dev', 'clip_user', 'clipador', '$2a$10$bbRWtbo/r4zOYEbKD.xP7ORlh4NngWVUjZP437r1MeNC1NqHqXse2')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.competitions (name, description, start_date, end_date, is_active, status)
VALUES ('Competição de Boas-Vindas', 'Primeira campanha para novos clipadores', CURRENT_DATE - 1, CURRENT_DATE + 7, true, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 4) Observações RLS
-- ATENÇÃO: com RLS habilitado, apenas service role consegue acessar video_metrics sem políticas.
-- Crie políticas específicas se for expor leitura segura para usuários autenticados.
