REVOKE ALL ON public.match_moves FROM anon;
REVOKE ALL ON public.match_moves FROM PUBLIC;
GRANT SELECT ON public.match_moves TO authenticated;
GRANT ALL ON public.match_moves TO service_role;

CREATE TABLE public.throne_candidates (
  season integer NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  avatar_key text NOT NULL DEFAULT '',
  elo integer NOT NULL DEFAULT 1000,
  valid_games integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  win_rate numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  daily_rate numeric NOT NULL DEFAULT 0,
  gate_rank boolean NOT NULL DEFAULT false,
  gate_games boolean NOT NULL DEFAULT false,
  qualified boolean NOT NULL DEFAULT false,
  score numeric NOT NULL DEFAULT 0,
  king_reached_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (season, user_id)
);
GRANT SELECT ON public.throne_candidates TO anon, authenticated;
GRANT ALL ON public.throne_candidates TO service_role;
ALTER TABLE public.throne_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "throne candidates public read" ON public.throne_candidates FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER throne_candidates_updated BEFORE UPDATE ON public.throne_candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.compute_throne_candidate(p_user uuid, p_season integer DEFAULT NULL)
RETURNS public.throne_candidates
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s integer := coalesce(p_season, extract(year FROM now())::integer);
  y0 timestamptz := make_timestamptz(s,1,1,0,0,0,'UTC');
  y1 timestamptz := make_timestamptz(s+1,1,1,0,0,0,'UTC');
  p public.profiles%ROWTYPE;
  g integer; w integer; d integer; rv integer; dz integer; days integer;
  wr numeric; dr numeric; sc numeric; kr timestamptz;
  row public.throne_candidates%ROWTYPE;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;
  -- 有效对局：本赛季已结束、非中止、双方合计至少 10 手
  SELECT count(*),
         count(*) FILTER (WHERE (outcome='white' AND white_id=p_user) OR (outcome='black' AND black_id=p_user)),
         count(*) FILTER (WHERE outcome='draw')
    INTO g, w, d
    FROM public.matches
   WHERE status='over' AND coalesce(reason,'')<>'abort' AND ply>=10
     AND (white_id=p_user OR black_id=p_user)
     AND created_at>=y0 AND created_at<y1;
  SELECT count(*) INTO rv FROM public.match_reports WHERE user_id=p_user AND created_at>=y0 AND created_at<y1;
  SELECT count(*) INTO dz FROM public.puzzle_progress pp JOIN public.puzzle_daily pd ON pd.puzzle_id=pp.puzzle_id
   WHERE pp.user_id=p_user AND pp.solved AND pd.day>=y0::date AND pd.day<y1::date;
  days := greatest(1, (least(now(), y1)::date - y0::date));
  wr := CASE WHEN g>0 THEN round((w + d*0.5)::numeric / g, 4) ELSE 0 END;
  dr := round(least(1, dz::numeric / days), 4);
  sc := round(40*wr + 30*least(1, g/50.0) + 20*least(1, rv/50.0) + 10*dr, 2);
  SELECT king_reached_at INTO kr FROM public.throne_candidates WHERE season=s AND user_id=p_user;
  IF p.elo >= 2500 AND kr IS NULL THEN kr := now(); END IF;
  INSERT INTO public.throne_candidates AS t(season,user_id,name,avatar_key,elo,valid_games,wins,win_rate,review_count,daily_rate,gate_rank,gate_games,qualified,score,king_reached_at)
  VALUES (s,p_user,p.name,p.avatar_key,p.elo,g,w,wr,rv,dr,p.elo>=2500,g>=50,(p.elo>=2500 AND g>=50),sc,kr)
  ON CONFLICT (season,user_id) DO UPDATE SET name=excluded.name, avatar_key=excluded.avatar_key, elo=excluded.elo,
    valid_games=excluded.valid_games, wins=excluded.wins, win_rate=excluded.win_rate, review_count=excluded.review_count,
    daily_rate=excluded.daily_rate, gate_rank=excluded.gate_rank, gate_games=excluded.gate_games,
    qualified=excluded.qualified, score=excluded.score, king_reached_at=excluded.king_reached_at
  RETURNING * INTO row;
  RETURN row;
END; $$;
REVOKE ALL ON FUNCTION public.compute_throne_candidate(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_throne_candidate(uuid, integer) TO service_role;