ALTER TABLE public.profiles
  ADD COLUMN handle text;

UPDATE public.profiles
SET handle = 'player-' || substr(replace(id::text, '-', ''), 1, 8)
WHERE handle IS NULL;

ALTER TABLE public.profiles ALTER COLUMN handle SET NOT NULL;
CREATE UNIQUE INDEX profiles_handle_lower_uidx ON public.profiles (lower(handle));

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (name, updated_at) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.search_player_profiles(q text)
RETURNS TABLE(id uuid, handle text, name text, elo integer, diamonds integer, wins integer, losses integer, draws integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.handle, p.name, p.elo, p.diamonds, p.wins, p.losses, p.draws
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND length(trim(q)) >= 2
    AND (p.handle ILIKE trim(q) || '%' OR p.name ILIKE trim(q) || '%')
    AND p.id <> auth.uid()
  ORDER BY p.elo DESC
  LIMIT 20
$$;
REVOKE ALL ON FUNCTION public.search_player_profiles(text) FROM public;
GRANT EXECUTE ON FUNCTION public.search_player_profiles(text) TO authenticated;

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CHECK (requester_id <> addressee_id),
  UNIQUE (requester_id, addressee_id)
);
GRANT SELECT ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY friendships_participant_read ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE UNIQUE INDEX friendships_pair_uidx ON public.friendships
  (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

CREATE TABLE public.match_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_id uuid NOT NULL,
  invited_id uuid,
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','consumed','cancelled','expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  consumed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.match_invites TO service_role;
ALTER TABLE public.match_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY match_invites_no_client_access ON public.match_invites FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE UNIQUE INDEX match_invites_one_open_host_idx ON public.match_invites (host_id) WHERE status = 'open';

ALTER TABLE public.matches
  ADD COLUMN invite_id uuid REFERENCES public.match_invites(id) ON DELETE SET NULL;

CREATE POLICY profiles_select_friends ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
      AND ((f.requester_id = auth.uid() AND f.addressee_id = profiles.id)
        OR (f.addressee_id = auth.uid() AND f.requester_id = profiles.id))
  )
);

CREATE POLICY matches_select_friend_results ON public.matches FOR SELECT TO authenticated
USING (
  status = 'over' AND EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
      AND ((f.requester_id = auth.uid() AND f.addressee_id IN (white_id, black_id))
        OR (f.addressee_id = auth.uid() AND f.requester_id IN (white_id, black_id)))
  )
);

ALTER TABLE public.endgame_levels
  ADD COLUMN depth integer NOT NULL DEFAULT 1 CHECK (depth BETWEEN 1 AND 12),
  ADD COLUMN theme_zh text NOT NULL DEFAULT '战术计算',
  ADD COLUMN theme_en text NOT NULL DEFAULT 'Tactical calculation',
  ADD COLUMN hint_zh text NOT NULL DEFAULT '',
  ADD COLUMN hint_en text NOT NULL DEFAULT '',
  ADD COLUMN explanation_zh text NOT NULL DEFAULT '',
  ADD COLUMN explanation_en text NOT NULL DEFAULT '',
  ADD COLUMN move_annotations jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.endgame_solutions
  ADD COLUMN alternate_solutions jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.endgame_progress
  ADD COLUMN reward_granted boolean NOT NULL DEFAULT false,
  ADD COLUMN viewed_explanation boolean NOT NULL DEFAULT false;

UPDATE public.endgame_progress SET reward_granted = solved WHERE solved = true;

CREATE OR REPLACE FUNCTION public.settle_ranked_match(
  p_match_id uuid,
  p_outcome text,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m public.matches%ROWTYPE;
  delta integer;
  expected_w numeric;
BEGIN
  IF p_outcome NOT IN ('white','black','draw') THEN RAISE EXCEPTION 'invalid outcome'; END IF;
  UPDATE public.matches
  SET status = 'over', outcome = p_outcome, reason = p_reason
  WHERE id = p_match_id AND status = 'live'
  RETURNING * INTO m;
  IF NOT FOUND THEN RETURN jsonb_build_object('settled', false); END IF;

  expected_w := 1.0 / (1.0 + power(10.0, (m.black_elo - m.white_elo) / 400.0));
  delta := round(24 * ((CASE WHEN p_outcome = 'white' THEN 1 WHEN p_outcome = 'draw' THEN 0.5 ELSE 0 END) - expected_w));
  UPDATE public.matches SET rating_delta = delta WHERE id = p_match_id;

  UPDATE public.profiles SET
    elo = greatest(100, elo + CASE WHEN p_outcome = 'draw' THEN 0 WHEN p_outcome = 'white' THEN delta ELSE -delta END),
    wins = wins + CASE WHEN p_outcome = 'white' THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN p_outcome = 'black' THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN p_outcome = 'draw' THEN 1 ELSE 0 END,
    streak = CASE WHEN p_outcome = 'white' THEN streak + 1 ELSE 0 END,
    diamonds = diamonds + CASE WHEN p_outcome = 'white' THEN 25 WHEN p_outcome = 'draw' THEN 10 ELSE 5 END,
    updated_at = now()
  WHERE id = m.white_id;

  UPDATE public.profiles SET
    elo = greatest(100, elo + CASE WHEN p_outcome = 'draw' THEN 0 WHEN p_outcome = 'black' THEN -delta ELSE delta END),
    wins = wins + CASE WHEN p_outcome = 'black' THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN p_outcome = 'white' THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN p_outcome = 'draw' THEN 1 ELSE 0 END,
    streak = CASE WHEN p_outcome = 'black' THEN streak + 1 ELSE 0 END,
    diamonds = diamonds + CASE WHEN p_outcome = 'black' THEN 25 WHEN p_outcome = 'draw' THEN 10 ELSE 5 END,
    updated_at = now()
  WHERE id = m.black_id;

  RETURN jsonb_build_object('settled', true, 'rating_delta', delta);
END;
$$;
REVOKE ALL ON FUNCTION public.settle_ranked_match(uuid,text,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_ranked_match(uuid,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.apply_ranked_move(
  p_match_id uuid,
  p_user_id uuid,
  p_expected_seq integer,
  p_uci text,
  p_san text,
  p_zh text,
  p_cp integer,
  p_fen text,
  p_outcome text DEFAULT NULL,
  p_reason text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m public.matches%ROWTYPE;
  side text;
  elapsed_ms integer;
  remaining integer;
  next_w integer;
  next_b integer;
  next_seq integer;
  next_ply integer;
  result jsonb;
BEGIN
  SELECT * INTO m FROM public.matches WHERE id = p_match_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'match not found'; END IF;
  IF m.status <> 'live' OR m.seq <> p_expected_seq THEN RETURN jsonb_build_object('code','stale'); END IF;
  side := CASE WHEN m.white_id = p_user_id THEN 'w' WHEN m.black_id = p_user_id THEN 'b' ELSE NULL END;
  IF side IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF m.turn <> side THEN RETURN jsonb_build_object('code','not_your_turn'); END IF;

  elapsed_ms := greatest(0, floor(extract(epoch FROM (clock_timestamp() - m.last_move_at)) * 1000)::integer);
  remaining := (CASE WHEN side = 'w' THEN m.clock_w ELSE m.clock_b END) - elapsed_ms;
  IF remaining <= 0 THEN
    result := public.settle_ranked_match(p_match_id, CASE WHEN side = 'w' THEN 'black' ELSE 'white' END, 'timeout');
    RETURN jsonb_build_object('code','timeout','settlement',result);
  END IF;

  next_w := CASE WHEN side = 'w' THEN remaining + m.tc_inc ELSE m.clock_w END;
  next_b := CASE WHEN side = 'b' THEN remaining + m.tc_inc ELSE m.clock_b END;
  next_seq := m.seq + 1;
  next_ply := m.ply + 1;

  INSERT INTO public.match_moves(match_id,seq,ply,uci,san,by,zh,cp,clock_w,clock_b)
  VALUES(p_match_id,next_seq,next_ply,p_uci,p_san,side,p_zh,p_cp,next_w,next_b);

  UPDATE public.matches SET
    clock_w = next_w, clock_b = next_b, turn = CASE WHEN side = 'w' THEN 'b' ELSE 'w' END,
    ply = next_ply, seq = next_seq, cp = p_cp, fen = p_fen, last_move_at = clock_timestamp()
  WHERE id = p_match_id;

  IF p_outcome IS NOT NULL THEN
    result := public.settle_ranked_match(p_match_id,p_outcome,coalesce(p_reason,'mate'));
  END IF;
  RETURN jsonb_build_object('code','ok','seq',next_seq,'ply',next_ply,'clock_w',next_w,'clock_b',next_b,'settlement',result);
END;
$$;
REVOKE ALL ON FUNCTION public.apply_ranked_move(uuid,uuid,integer,text,text,text,integer,text,text,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_ranked_move(uuid,uuid,integer,text,text,text,integer,text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.record_endgame_result(
  p_user_id uuid,
  p_level_id integer,
  p_correct boolean,
  p_ms integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lvl public.endgame_levels%ROWTYPE;
  prog public.endgame_progress%ROWTYPE;
  first_reward boolean := false;
BEGIN
  SELECT * INTO lvl FROM public.endgame_levels WHERE id = p_level_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'level not found'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND elo >= lvl.elo_required) THEN
    RAISE EXCEPTION 'level locked';
  END IF;

  INSERT INTO public.endgame_progress(user_id,level_id,attempts,solved,best_ms,solved_at,reward_granted)
  VALUES(p_user_id,p_level_id,1,p_correct,CASE WHEN p_correct THEN p_ms END,CASE WHEN p_correct THEN now() END,p_correct)
  ON CONFLICT (user_id,level_id) DO UPDATE SET
    attempts = public.endgame_progress.attempts + 1,
    solved = public.endgame_progress.solved OR excluded.solved,
    best_ms = CASE WHEN excluded.solved THEN least(coalesce(public.endgame_progress.best_ms, excluded.best_ms), excluded.best_ms) ELSE public.endgame_progress.best_ms END,
    solved_at = CASE WHEN excluded.solved AND public.endgame_progress.solved_at IS NULL THEN now() ELSE public.endgame_progress.solved_at END,
    reward_granted = public.endgame_progress.reward_granted OR excluded.reward_granted
  RETURNING * INTO prog;

  IF p_correct AND prog.reward_granted AND prog.attempts = 1 THEN
    first_reward := true;
  ELSIF p_correct AND prog.reward_granted THEN
    first_reward := NOT EXISTS (
      SELECT 1 FROM public.endgame_progress
      WHERE user_id = p_user_id AND level_id = p_level_id AND attempts < prog.attempts AND solved = true
    );
  END IF;

  IF first_reward THEN
    UPDATE public.profiles SET elo = elo + lvl.elo_reward, diamonds = diamonds + lvl.diamond_reward, updated_at = now()
    WHERE id = p_user_id;
  END IF;
  RETURN jsonb_build_object('first_solve',first_reward,'attempts',prog.attempts);
END;
$$;
REVOKE ALL ON FUNCTION public.record_endgame_result(uuid,integer,boolean,integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_endgame_result(uuid,integer,boolean,integer) TO service_role;