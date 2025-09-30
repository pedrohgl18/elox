-- Supabase migration: habilitar YouTube em public.videos.social_media e ajustar default de competitions.allowed_platforms
-- Execute este script no Supabase SQL Editor (web)

-- 1) Garantir que o CHECK de social_media inclui 'youtube'
DO $$
DECLARE
  v_constraint_name text;
  v_def text;
BEGIN
  SELECT conname, pg_get_constraintdef(c.oid)
    INTO v_constraint_name, v_def
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public' AND t.relname = 'videos' AND c.contype = 'c'
  AND pg_get_constraintdef(c.oid) ILIKE '%social_media%';

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.videos DROP CONSTRAINT %I', v_constraint_name);
  END IF;

  EXECUTE $$
    ALTER TABLE public.videos
    ADD CONSTRAINT videos_social_media_check
    CHECK (social_media IN ('tiktok','instagram','kwai','youtube'))
  $$;
END $$;

-- 2) Ajustar default do allowed_platforms em competitions para incluir 'youtube'
ALTER TABLE public.competitions
  ALTER COLUMN allowed_platforms SET DEFAULT ARRAY['tiktok','instagram','kwai','youtube']::text[];

-- 3) (Opcional) Atualizar valores nulos ou antigos em competitions.allowed_platforms
UPDATE public.competitions
  SET allowed_platforms = ARRAY['tiktok','instagram','kwai','youtube']::text[]
  WHERE allowed_platforms IS NULL
     OR allowed_platforms = ARRAY['tiktok','instagram','kwai']::text[];