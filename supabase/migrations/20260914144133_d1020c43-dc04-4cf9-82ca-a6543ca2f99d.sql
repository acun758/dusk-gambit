ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS equipped_piece_set text NOT NULL DEFAULT 'sovereign';

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS white_piece_set text NOT NULL DEFAULT 'sovereign',
  ADD COLUMN IF NOT EXISTS black_piece_set text NOT NULL DEFAULT 'sovereign';

ALTER TABLE public.endgame_progress
  ADD COLUMN IF NOT EXISTS best_score integer,
  ADD COLUMN IF NOT EXISTS last_review jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.profiles.equipped_piece_set IS 'Current chess piece set selected by the player';
COMMENT ON COLUMN public.matches.white_piece_set IS 'White piece-set snapshot for live play and review';
COMMENT ON COLUMN public.matches.black_piece_set IS 'Black piece-set snapshot for live play and review';
COMMENT ON COLUMN public.endgame_progress.best_score IS 'Highest verified drill review score from 0 to 100';
COMMENT ON COLUMN public.endgame_progress.last_review IS 'Most recent move-by-move drill review';