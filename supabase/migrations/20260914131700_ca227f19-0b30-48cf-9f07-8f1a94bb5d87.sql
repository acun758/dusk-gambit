ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS white_avatar_key text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS black_avatar_key text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS white_avatar_path text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS black_avatar_path text NOT NULL DEFAULT '';