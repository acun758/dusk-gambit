ALTER TABLE public.throne_candidates
  ADD COLUMN qualified_at timestamptz,
  ADD COLUMN window_end timestamptz,
  ADD COLUMN q_games integer NOT NULL DEFAULT 0,
  ADD COLUMN q_wins integer NOT NULL DEFAULT 0,
  ADD COLUMN q_draws integer NOT NULL DEFAULT 0,
  ADD COLUMN q_losses integer NOT NULL DEFAULT 0,
  ADD COLUMN q_points numeric NOT NULL DEFAULT 0,
  ADD COLUMN pts_win numeric NOT NULL DEFAULT 0,
  ADD COLUMN pts_games numeric NOT NULL DEFAULT 0,
  ADD COLUMN pts_review numeric NOT NULL DEFAULT 0,
  ADD COLUMN pts_daily numeric NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.compute_throne_candidate(p_user uuid, p_season integer DEFAULT NULL)
RETURNS public.throne_candidates
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s integer := coalesce(p_season, extract(year FROM now())::integer);
  y0 timestamptz := make_timestamptz(s,1,1,0,0,0,'UTC');
  y1 timestamptz := make_timestamptz(s+1,1,1,0,0,0,'UTC');
  p public.profiles%ROWTYPE;
  prev public.throne_candidates%ROWTYPE;
  g integer; w integer; d integer; rv integer; dz integer; days integer;
  wr numeric; dr numeric; a numeric; b numeric; c numeric; e numeric;
  kr timestamptz; qa timestamptz; we timestamptz; ok boolean;
  qg integer := 0; qw integer := 0; qd integer := 0; ql integer := 0;
  row public.throne_candidates%ROWTYPE;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;
  SELECT * INTO prev FROM public.throne_candidates WHERE season=s AND user_id=p_user;

  SELECT count(*),
         count(*) FILTER (WHERE (outcome='white' AND white_id=p_user) OR (outcome='black' AND black_id=p_user)),
         count(*) FILTER (WHERE outcome='draw')
    INTO g, w, d
    FROM public.matches
   WHERE status='over' AND coalesce(reason,'')<>'abort' AND ply>=10
     AND (white_id=p_user OR black_id=p_user) AND created_at>=y0 AND created_at<y1;
  SELECT count(*) INTO rv FROM public.match_reports WHERE user_id=p_user AND created_at>=y0 AND created_at<y1;
  SELECT count(*) INTO dz FROM public.puzzle_progress pp JOIN public.puzzle_daily pd ON pd.puzzle_id=pp.puzzle_id
   WHERE pp.user_id=p_user AND pp.solved AND pd.day>=y0::date AND pd.day<y1::date;
  days := greatest(1, (least(now(), y1)::date - y0::date));
  wr := CASE WHEN g>0 THEN round((w + d*0.5)::numeric / g, 4) ELSE 0 END;
  dr := round(least(1, dz::numeric / days), 4);
  a := round(40*wr, 2); b := round(30*least(1, g/50.0), 2); c := round(20*least(1, rv/50.0), 2); e := round(10*dr, 2);

  kr := prev.king_reached_at;
  IF p.elo >= 2500 AND kr IS NULL THEN kr := now(); END IF;
  ok := p.elo >= 2500 AND g >= 50;
  -- 自动入围：首次三关达标即开 30 天资格赛窗口，之后不因掉分撤销
  qa := prev.qualified_at; we := prev.window_end;
  IF ok AND qa IS NULL THEN qa := now(); we := least(now() + interval '30 days', y1); END IF;
  IF qa IS NOT NULL THEN
    SELECT count(*),
           count(*) FILTER (WHERE (outcome='white' AND white_id=p_user) OR (outcome='black' AND black_id=p_user)),
           count(*) FILTER (WHERE outcome='draw')
      INTO qg, qw, qd
      FROM public.matches
     WHERE status='over' AND coalesce(reason,'')<>'abort' AND ply>=10
       AND (white_id=p_user OR black_id=p_user) AND created_at>=qa AND created_at<we;
    ql := qg - qw - qd;
  END IF;

  INSERT INTO public.throne_candidates AS t(season,user_id,name,avatar_key,elo,valid_games,wins,win_rate,review_count,daily_rate,
     gate_rank,gate_games,qualified,score,king_reached_at,qualified_at,window_end,q_games,q_wins,q_draws,q_losses,q_points,
     pts_win,pts_games,pts_review,pts_daily)
  VALUES (s,p_user,p.name,p.avatar_key,p.elo,g,w,wr,rv,dr,p.elo>=2500,g>=50,qa IS NOT NULL,a+b+c+e,kr,qa,we,qg,qw,qd,ql,qw+qd*0.5,a,b,c,e)
  ON CONFLICT (season,user_id) DO UPDATE SET name=excluded.name, avatar_key=excluded.avatar_key, elo=excluded.elo,
    valid_games=excluded.valid_games, wins=excluded.wins, win_rate=excluded.win_rate, review_count=excluded.review_count,
    daily_rate=excluded.daily_rate, gate_rank=excluded.gate_rank, gate_games=excluded.gate_games, qualified=excluded.qualified,
    score=excluded.score, king_reached_at=excluded.king_reached_at, qualified_at=excluded.qualified_at, window_end=excluded.window_end,
    q_games=excluded.q_games, q_wins=excluded.q_wins, q_draws=excluded.q_draws, q_losses=excluded.q_losses, q_points=excluded.q_points,
    pts_win=excluded.pts_win, pts_games=excluded.pts_games, pts_review=excluded.pts_review, pts_daily=excluded.pts_daily
  RETURNING * INTO row;
  RETURN row;
END; $$;
REVOKE ALL ON FUNCTION public.compute_throne_candidate(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_throne_candidate(uuid, integer) TO service_role;

-- 批量重算：本赛季有有效对局或已入围的玩家
CREATE OR REPLACE FUNCTION public.refresh_throne_all(p_season integer DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s integer := coalesce(p_season, extract(year FROM now())::integer); u uuid; n integer := 0;
BEGIN
  FOR u IN
    SELECT DISTINCT x FROM (
      SELECT white_id x FROM public.matches WHERE status='over' AND created_at>=make_timestamptz(s,1,1,0,0,0,'UTC')
      UNION SELECT black_id FROM public.matches WHERE status='over' AND created_at>=make_timestamptz(s,1,1,0,0,0,'UTC')
      UNION SELECT user_id FROM public.throne_candidates WHERE season=s
    ) q WHERE x IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id=x)
  LOOP
    PERFORM public.compute_throne_candidate(u, s); n := n + 1;
  END LOOP;
  RETURN n;
END; $$;
REVOKE ALL ON FUNCTION public.refresh_throne_all(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_throne_all(integer) TO service_role;