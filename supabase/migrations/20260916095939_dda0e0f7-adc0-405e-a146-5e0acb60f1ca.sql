CREATE TABLE public.fide_ratings (
  fide_id integer PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL,
  sex text,
  title text,
  rating integer NOT NULL,
  rank_open integer,
  rank_women integer,
  rank_chn integer,
  rank_chn_w integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.fide_ratings TO anon;
GRANT SELECT ON public.fide_ratings TO authenticated;
GRANT ALL ON public.fide_ratings TO service_role;

ALTER TABLE public.fide_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY fide_ratings_public_read ON public.fide_ratings
  FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX fide_ratings_rank_open_idx ON public.fide_ratings (rank_open) WHERE rank_open IS NOT NULL;
CREATE INDEX fide_ratings_rank_women_idx ON public.fide_ratings (rank_women) WHERE rank_women IS NOT NULL;
CREATE INDEX fide_ratings_rank_chn_idx ON public.fide_ratings (rank_chn) WHERE rank_chn IS NOT NULL;
CREATE INDEX fide_ratings_rank_chn_w_idx ON public.fide_ratings (rank_chn_w) WHERE rank_chn_w IS NOT NULL;

CREATE OR REPLACE FUNCTION public.rank_floor(p_elo integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE
    WHEN p_elo >= 2500 THEN 2500
    WHEN p_elo >= 2200 THEN 2200
    WHEN p_elo >= 2000 THEN 2000
    WHEN p_elo >= 1600 THEN 1600
    WHEN p_elo >= 1200 THEN 1200
    ELSE 0 END;
$$;

CREATE OR REPLACE FUNCTION public.rank_next_floor(p_elo integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE
    WHEN p_elo >= 2500 THEN 100000
    WHEN p_elo >= 2200 THEN 2500
    WHEN p_elo >= 2000 THEN 2200
    WHEN p_elo >= 1600 THEN 2000
    WHEN p_elo >= 1200 THEN 1600
    ELSE 1200 END;
$$;

ALTER TABLE public.profiles ALTER COLUMN elo SET DEFAULT 1000;