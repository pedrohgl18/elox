-- Supabase SQL: Métricas de vídeos com RLS
-- Requires: pgcrypto for gen_random_uuid (enabled by default in Supabase; else: CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela para métricas coletadas (persistência histórica)
create table if not exists public.video_metrics (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'instagram',
  url text not null,
  shortcode text,
  views bigint,
  hashtags text[],
  mentions text[],
  collected_at timestamptz not null default now()
);

-- Indexes úteis
create index if not exists video_metrics_platform_short_url on public.video_metrics(platform, shortcode, url);
create index if not exists video_metrics_collected_at on public.video_metrics(collected_at desc);

-- Habilita RLS e não cria políticas: acesso apenas via service role
alter table public.video_metrics enable row level security;

-- Observação:
-- - Com RLS habilitado e sem políticas, usuários anon/auth não têm acesso.
-- - O service role (usado nas rotas server-side Next.js) ignora RLS e tem acesso total.
-- - Para expor leitura segura a usuários com Supabase Auth, crie políticas específicas depois.
