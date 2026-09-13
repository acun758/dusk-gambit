
CREATE TABLE IF NOT EXISTS public.promotion_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_floor integer NOT NULL,
  to_floor integer NOT NULL,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  required_wins integer NOT NULL DEFAULT 2,
  max_losses integer NOT NULL DEFAULT 2,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

GRANT SELECT ON public.promotion_series TO authenticated;
GRANT ALL ON public.promotion_series TO service_role;

ALTER TABLE public.promotion_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promotion_series_select_own ON public.promotion_series;
CREATE POLICY promotion_series_select_own ON public.promotion_series
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS promotion_series_one_active
  ON public.promotion_series(user_id) WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.rank_floor(p_elo integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN p_elo >= 2600 THEN 2600
    WHEN p_elo >= 2500 THEN 2500
    WHEN p_elo >= 2400 THEN 2400
    WHEN p_elo >= 2200 THEN 2200
    ELSE 0 END;
$$;

CREATE OR REPLACE FUNCTION public.rank_next_floor(p_elo integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN p_elo >= 2600 THEN 100000
    WHEN p_elo >= 2500 THEN 2600
    WHEN p_elo >= 2400 THEN 2500
    WHEN p_elo >= 2200 THEN 2400
    ELSE 2200 END;
$$;

CREATE OR REPLACE FUNCTION public.rank_k(p_elo integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN p_elo >= 2500 THEN 16 WHEN p_elo >= 2200 THEN 24 ELSE 32 END;
$$;

CREATE OR REPLACE FUNCTION public.apply_match_result(p_user uuid, p_score numeric, p_opp_elo integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pr public.profiles%ROWTYPE;
  s public.promotion_series%ROWTYPE;
  expected numeric;
  k integer;
  delta integer;
  new_elo integer;
  floor_now integer;
  next_floor integer;
  promoted boolean := false;
  demoted boolean := false;
  series_state text := 'none';
BEGIN
  IF p_user IS NULL THEN RETURN jsonb_build_object('skipped', true); END IF;
  SELECT * INTO pr FROM public.profiles WHERE id = p_user FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('skipped', true); END IF;

  expected := 1.0 / (1.0 + power(10.0, (p_opp_elo - pr.elo) / 400.0));
  k := public.rank_k(pr.elo);
  delta := round(k * (p_score - expected));
  IF p_score = 1 AND pr.streak >= 2 THEN
    delta := delta + least(6, (pr.streak - 1) * 2);
  END IF;

  floor_now := public.rank_floor(pr.elo);
  next_floor := public.rank_next_floor(pr.elo);
  new_elo := pr.elo + delta;
  IF p_score < 1 THEN
    new_elo := greatest(new_elo, floor_now - 25);
  END IF;

  SELECT * INTO s FROM public.promotion_series
  WHERE user_id = p_user AND status = 'active' FOR UPDATE;

  IF FOUND THEN
    series_state := 'active';
    UPDATE public.promotion_series SET
      wins = wins + CASE WHEN p_score = 1 THEN 1 ELSE 0 END,
      losses = losses + CASE WHEN p_score = 0 THEN 1 ELSE 0 END,
      updated_at = now()
    WHERE id = s.id RETURNING * INTO s;

    IF s.wins >= s.required_wins THEN
      UPDATE public.promotion_series SET status = 'won', resolved_at = now() WHERE id = s.id;
      new_elo := greatest(new_elo, s.to_floor + 10);
      promoted := true;
      series_state := 'won';
    ELSIF s.losses >= s.max_losses THEN
      UPDATE public.promotion_series SET status = 'lost', resolved_at = now() WHERE id = s.id;
      new_elo := greatest(s.from_floor, new_elo - 30);
      series_state := 'lost';
    ELSE
      new_elo := least(new_elo, s.to_floor - 1);
    END IF;
  ELSIF new_elo >= next_floor AND next_floor < 100000 THEN
    INSERT INTO public.promotion_series(user_id, from_floor, to_floor)
    VALUES (p_user, floor_now, next_floor)
    RETURNING * INTO s;
    new_elo := next_floor - 1;
    series_state := 'started';
  END IF;

  new_elo := greatest(100, new_elo);
  IF public.rank_floor(new_elo) < floor_now THEN demoted := true; END IF;

  UPDATE public.profiles SET
    elo = new_elo,
    wins = wins + CASE WHEN p_score = 1 THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN p_score = 0 THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN p_score = 0.5 THEN 1 ELSE 0 END,
    streak = CASE WHEN p_score = 1 THEN streak + 1 ELSE 0 END,
    diamonds = diamonds + CASE WHEN p_score = 1 THEN 25 WHEN p_score = 0.5 THEN 10 ELSE 5 END,
    updated_at = now()
  WHERE id = p_user;

  RETURN jsonb_build_object(
    'delta', new_elo - pr.elo,
    'elo', new_elo,
    'promoted', promoted,
    'demoted', demoted,
    'series', series_state,
    'series_wins', coalesce(s.wins, 0),
    'series_losses', coalesce(s.losses, 0),
    'series_target', s.to_floor
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.settle_ranked_match(p_match_id uuid, p_outcome text, p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  m public.matches%ROWTYPE;
  w jsonb;
  b jsonb;
  delta integer;
BEGIN
  IF p_outcome NOT IN ('white','black','draw') THEN RAISE EXCEPTION 'invalid outcome'; END IF;
  UPDATE public.matches
  SET status = 'over', outcome = p_outcome, reason = p_reason
  WHERE id = p_match_id AND status = 'live'
  RETURNING * INTO m;
  IF NOT FOUND THEN RETURN jsonb_build_object('settled', false); END IF;

  w := public.apply_match_result(
    m.white_id,
    CASE WHEN p_outcome = 'white' THEN 1 WHEN p_outcome = 'draw' THEN 0.5 ELSE 0 END,
    m.black_elo);
  b := public.apply_match_result(
    m.black_id,
    CASE WHEN p_outcome = 'black' THEN 1 WHEN p_outcome = 'draw' THEN 0.5 ELSE 0 END,
    m.white_elo);

  delta := coalesce((w->>'delta')::integer, 0);
  UPDATE public.matches SET rating_delta = delta WHERE id = p_match_id;

  RETURN jsonb_build_object('settled', true, 'rating_delta', delta, 'white', w, 'black', b);
END;
$$;
