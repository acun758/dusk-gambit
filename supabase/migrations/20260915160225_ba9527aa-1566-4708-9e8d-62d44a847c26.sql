-- ============ 竞技公平性第一阶段 ============
-- 1) 起步分回归职业口径：新档案 1200 分，前 10 局为定级赛（K 值加倍）
-- 2) 超时判负遵循 FIDE 6.9：对方子力无法构成任何将死时判和棋

ALTER TABLE public.profiles
  ALTER COLUMN elo SET DEFAULT 1200;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS provisional_games integer NOT NULL DEFAULT 10;

-- 从未打过正式对局的老档案回到 1200 起步并进入定级赛
UPDATE public.profiles
SET elo = 1200, provisional_games = 10
WHERE elo = 2480 AND wins + losses + draws = 0;

GRANT SELECT (provisional_games) ON public.profiles TO anon, authenticated;

-- 判断一方是否具备任何成杀可能（FIDE 6.9 的实用简化口径：
-- 有兵/车/后可胜；同色象、单轻子、双马均无杀）。
CREATE OR REPLACE FUNCTION public.side_can_win(p_fen text, p_side text)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
AS $$
DECLARE
  board text;
  ch text;
  i integer;
  r integer := 0;
  f integer := 0;
  bishops_light integer := 0;
  bishops_dark integer := 0;
  knights integer := 0;
  heavy integer := 0;
BEGIN
  board := split_part(coalesce(p_fen, ''), ' ', 1);
  IF board = '' THEN RETURN true; END IF; -- 无法判断时保持判负（不误判和棋）

  FOR i IN 1..length(board) LOOP
    ch := substring(board from i for 1);
    IF ch = '/' THEN
      r := r + 1;
      f := 0;
      CONTINUE;
    END IF;
    IF ch ~ '[0-9]' THEN
      f := f + ch::integer;
      CONTINUE;
    END IF;
    IF (p_side = 'w' AND ch ~ '[A-Z]') OR (p_side = 'b' AND ch ~ '[a-z]') THEN
      CASE upper(ch)
        WHEN 'P', 'R', 'Q' THEN heavy := heavy + 1;
        WHEN 'B' THEN
          IF (r + f) % 2 = 0 THEN bishops_light := bishops_light + 1;
          ELSE bishops_dark := bishops_dark + 1; END IF;
        WHEN 'N' THEN knights := knights + 1;
      END CASE;
    END IF;
    f := f + 1;
  END LOOP;

  IF heavy > 0 THEN RETURN true; END IF;
  IF knights + bishops_light + bishops_dark = 0 THEN RETURN false; END IF; -- 单王
  IF knights = 0 AND (bishops_light = 0 OR bishops_dark = 0) THEN RETURN false; END IF; -- 同色象
  IF bishops_light + bishops_dark = 0 AND knights <= 2 THEN RETURN false; END IF; -- 单马/双马
  RETURN true;
END;
$$;

-- 结算时执行超时和棋规则：胜方子力不足以将死 => 判和
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

  IF p_reason = 'timeout' AND p_outcome IN ('white','black') THEN
    IF NOT public.side_can_win(m.fen, CASE WHEN p_outcome = 'white' THEN 'w' ELSE 'b' END) THEN
      p_outcome := 'draw';
    END IF;
  END IF;

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
REVOKE ALL ON FUNCTION public.settle_ranked_match(uuid,text,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_ranked_match(uuid,text,text) TO service_role;

-- 定级赛：K 值加倍，每打完一局递减
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
  IF coalesce(pr.provisional_games, 0) > 0 THEN
    k := k * 2;
  END IF;
  delta := round(k * (p_score - expected));
  IF p_score = 1 AND pr.streak >= 2 AND coalesce(pr.provisional_games, 0) = 0 THEN
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
    provisional_games = greatest(0, coalesce(pr.provisional_games, 0) - 1),
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
    'provisional', coalesce(pr.provisional_games, 0) > 1,
    'promoted', promoted,
    'demoted', demoted,
    'series', series_state,
    'series_wins', coalesce(s.wins, 0),
    'series_losses', coalesce(s.losses, 0),
    'series_target', s.to_floor
  );
END;
$$;