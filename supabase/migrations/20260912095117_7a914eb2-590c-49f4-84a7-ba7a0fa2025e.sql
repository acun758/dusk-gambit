ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS training_points integer NOT NULL DEFAULT 0;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE OR REPLACE FUNCTION public.find_or_create_ranked_match(p_user_id uuid)
RETURNS TABLE(match_id uuid, side text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles%ROWTYPE;
  existing public.matches%ROWTYPE;
  waiting public.matches%ROWTYPE;
  joined public.matches%ROWTYPE;
  created_id uuid;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;

  SELECT * INTO existing
  FROM public.matches
  WHERE (white_id = p_user_id OR black_id = p_user_id)
    AND status IN ('waiting', 'live')
  ORDER BY CASE WHEN status = 'live' THEN 0 ELSE 1 END, created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT existing.id, CASE WHEN existing.white_id = p_user_id THEN 'w'::text ELSE 'b'::text END;
    RETURN;
  END IF;

  SELECT * INTO waiting
  FROM public.matches
  WHERE status = 'waiting' AND black_id IS NULL AND white_id <> p_user_id
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    UPDATE public.matches
    SET black_id = p_user_id,
        black_name = p.name,
        black_elo = p.elo,
        status = 'live',
        last_move_at = clock_timestamp()
    WHERE id = waiting.id AND status = 'waiting' AND black_id IS NULL
    RETURNING * INTO joined;

    IF FOUND THEN
      RETURN QUERY SELECT joined.id, 'b'::text;
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.matches(
    white_id, white_name, white_elo, black_name, black_elo,
    tc_base, tc_inc, clock_w, clock_b, status
  ) VALUES (
    p_user_id, p.name, p.elo, '等待对手', p.elo,
    180000, 2000, 180000, 180000, 'waiting'
  ) RETURNING id INTO created_id;

  RETURN QUERY SELECT created_id, 'w'::text;
END;
$$;
REVOKE ALL ON FUNCTION public.find_or_create_ranked_match(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_or_create_ranked_match(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.cancel_waiting_match(p_user_id uuid, p_match_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.matches
  SET status = 'over', outcome = 'draw', reason = 'abort'
  WHERE id = p_match_id
    AND white_id = p_user_id
    AND black_id IS NULL
    AND status = 'waiting';
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.cancel_waiting_match(uuid,uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_waiting_match(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.record_endgame_result(p_user_id uuid,p_level_id integer,p_correct boolean,p_ms integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lvl public.endgame_levels%ROWTYPE; prog public.endgame_progress%ROWTYPE; first_reward boolean:=false;
BEGIN
  SELECT * INTO lvl FROM public.endgame_levels WHERE id=p_level_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'level not found'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user_id) THEN RAISE EXCEPTION 'profile required'; END IF;
  INSERT INTO public.endgame_progress(user_id,level_id) VALUES(p_user_id,p_level_id) ON CONFLICT(user_id,level_id) DO NOTHING;
  SELECT * INTO prog FROM public.endgame_progress WHERE user_id=p_user_id AND level_id=p_level_id FOR UPDATE;
  first_reward := p_correct AND NOT prog.reward_granted;
  UPDATE public.endgame_progress SET attempts=attempts+1, solved=solved OR p_correct,
    best_ms=CASE WHEN p_correct THEN least(coalesce(best_ms,p_ms),p_ms) ELSE best_ms END,
    solved_at=CASE WHEN p_correct AND solved_at IS NULL THEN now() ELSE solved_at END,
    reward_granted=reward_granted OR p_correct
  WHERE id=prog.id RETURNING * INTO prog;
  IF first_reward THEN
    UPDATE public.profiles
    SET training_points=training_points+lvl.elo_reward,
        diamonds=diamonds+lvl.diamond_reward,
        updated_at=now()
    WHERE id=p_user_id;
  END IF;
  RETURN jsonb_build_object('first_solve',first_reward,'attempts',prog.attempts);
END; $$;
REVOKE ALL ON FUNCTION public.record_endgame_result(uuid,integer,boolean,integer) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_endgame_result(uuid,integer,boolean,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.create_match_invite(p_user_id uuid,p_invited_id uuid DEFAULT NULL)
RETURNS TABLE(code text,match_id uuid,expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.profiles%ROWTYPE; m_id uuid; inv_id uuid; inv_code text;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id=p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;
  UPDATE public.match_invites SET status='cancelled',updated_at=now() WHERE host_id=p_user_id AND status='open';
  UPDATE public.matches SET status='over',outcome='draw',reason='abort'
    WHERE white_id=p_user_id AND black_id IS NULL AND status='waiting';
  INSERT INTO public.matches(white_id,white_name,white_elo,black_name,black_elo,status,tc_base,tc_inc,clock_w,clock_b)
  VALUES(p_user_id,p.name,p.elo,'等待对手',p.elo,'waiting',180000,2000,180000,180000) RETURNING id INTO m_id;
  inv_code := upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text),1,8));
  INSERT INTO public.match_invites(code,host_id,invited_id,match_id)
  VALUES(inv_code,p_user_id,p_invited_id,m_id) RETURNING id INTO inv_id;
  UPDATE public.matches SET invite_id=inv_id WHERE id=m_id;
  RETURN QUERY SELECT inv_code,m_id,now()+interval '10 minutes';
END; $$;
REVOKE ALL ON FUNCTION public.create_match_invite(uuid,uuid) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_match_invite(uuid,uuid) TO service_role;