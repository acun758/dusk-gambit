ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS elo_bullet integer,
  ADD COLUMN IF NOT EXISTS elo_blitz integer,
  ADD COLUMN IF NOT EXISTS elo_rapid integer,
  ADD COLUMN IF NOT EXISTS elo_classical integer;
COMMENT ON COLUMN public.profiles.elo_bullet IS '预留：超快棋独立积分池（未启用，段位绑定待拍板）';
COMMENT ON COLUMN public.profiles.elo_blitz IS '预留：快棋独立积分池（未启用）';
COMMENT ON COLUMN public.profiles.elo_rapid IS '预留：中速棋独立积分池（未启用）';
COMMENT ON COLUMN public.profiles.elo_classical IS '预留：慢棋独立积分池（未启用）';