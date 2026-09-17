CREATE TABLE IF NOT EXISTS public.fide_ratings (
  fide_id     integer PRIMARY KEY,
  name        text NOT NULL,
  country     text NOT NULL,
  sex         text,
  title       text,
  rating      integer NOT NULL,
  rank_open   integer,
  rank_women  integer,
  rank_chn    integer,
  rank_chn_w  integer,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fide_ratings TO anon, authenticated;
GRANT ALL ON public.fide_ratings TO service_role;
ALTER TABLE public.fide_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fide_ratings_read ON public.fide_ratings;
CREATE POLICY fide_ratings_read ON public.fide_ratings FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS fide_ratings_open_idx  ON public.fide_ratings (rank_open)  WHERE rank_open  IS NOT NULL;
CREATE INDEX IF NOT EXISTS fide_ratings_women_idx ON public.fide_ratings (rank_women) WHERE rank_women IS NOT NULL;
CREATE INDEX IF NOT EXISTS fide_ratings_chn_idx   ON public.fide_ratings (rank_chn)   WHERE rank_chn   IS NOT NULL;
CREATE INDEX IF NOT EXISTS fide_ratings_chnw_idx  ON public.fide_ratings (rank_chn_w) WHERE rank_chn_w IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.match_reports (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id   uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  ranked     boolean NOT NULL DEFAULT false,
  accuracy   numeric(5,2) NOT NULL,
  acpl       integer NOT NULL,
  elo        integer NOT NULL DEFAULT 1000,
  rank_id    text NOT NULL DEFAULT 'pawn',
  mind       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS match_reports_user_match_idx ON public.match_reports (user_id, match_id) WHERE match_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS match_reports_user_idx ON public.match_reports (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.match_reports TO authenticated;
GRANT ALL ON public.match_reports TO service_role;
ALTER TABLE public.match_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS match_reports_own ON public.match_reports;
CREATE POLICY match_reports_own ON public.match_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS match_reports_insert ON public.match_reports;
CREATE POLICY match_reports_insert ON public.match_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS match_reports_update ON public.match_reports;
CREATE POLICY match_reports_update ON public.match_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.rank_avg_accuracy(p_rank text)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT round(avg(accuracy), 1) FROM public.match_reports WHERE rank_id = p_rank;
$$;
GRANT EXECUTE ON FUNCTION public.rank_avg_accuracy(text) TO anon, authenticated, service_role;