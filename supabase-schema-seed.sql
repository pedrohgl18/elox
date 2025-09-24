-- Schema + Seed EloX (executar no SQL Editor do Supabase)
-- NÃO usar CLI local. Ajuste nomes/UUIDs se necessário.

-- Extensão para UUID (se não ativa)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabelas
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL, -- formato validado na aplicação: ^[a-zA-Z0-9_]{3,20}$
  role text NOT NULL,
  password_hash text,
  is_active boolean DEFAULT true,
  warnings integer DEFAULT 0,
  total_earnings numeric(12,2) DEFAULT 0,
  pix_key text,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clipador_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status text CHECK (status IN ('PENDING','PROCESSED','FAILED')) DEFAULT 'PENDING',
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

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

CREATE TABLE IF NOT EXISTS public.competition_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
  place integer NOT NULL,
  amount numeric(12,2) NOT NULL,
  UNIQUE(competition_id, place)
);

-- Observação: usar DEFAULT para deixar o banco gerar UUID válidos.
INSERT INTO public.profiles (email, username, role, password_hash)
VALUES ('admin@elox.dev', 'admin', 'admin', '$2a$10$l3xZZ11H8fV/1/y5hvHef.NHSfGNtzWXskFlEwA414rnYAb7aTi3e')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (email, username, role, password_hash)
VALUES ('user@elox.dev', 'clip_user', 'clipador', '$2a$10$bbRWtbo/r4zOYEbKD.xP7ORlh4NngWVUjZP437r1MeNC1NqHqXse2')
ON CONFLICT (email) DO NOTHING;

-- Competição inicial opcional
INSERT INTO public.competitions (name, description, start_date, end_date, is_active, status, cpm)
VALUES ('Competição de Boas-Vindas', 'Primeira campanha para novos clipadores', CURRENT_DATE - 1, CURRENT_DATE + 7, true, 'ACTIVE', 5)
ON CONFLICT DO NOTHING;

-- RLS habilitar após validar schema no painel
-- (Ativar manualmente e criar políticas conforme DATABASE.md)
