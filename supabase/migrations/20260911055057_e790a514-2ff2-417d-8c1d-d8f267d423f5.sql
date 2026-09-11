CREATE OR REPLACE FUNCTION public.send_friend_request(p_user_id uuid, p_target_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF p_user_id = p_target_id OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=p_target_id) THEN RAISE EXCEPTION 'invalid target'; END IF;
  INSERT INTO public.friendships(requester_id,addressee_id,status)
  VALUES(p_user_id,p_target_id,'pending')
  ON CONFLICT ((LEAST(requester_id,addressee_id)),(GREATEST(requester_id,addressee_id)))
  DO UPDATE SET status = CASE WHEN public.friendships.requester_id = p_target_id THEN 'accepted' ELSE public.friendships.status END,
    responded_at = CASE WHEN public.friendships.requester_id = p_target_id THEN now() ELSE public.friendships.responded_at END,
    updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.send_friend_request(uuid,uuid) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.send_friend_request(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.respond_friend_request(p_user_id uuid,p_friendship_id uuid,p_accept boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_accept THEN
    UPDATE public.friendships SET status='accepted',responded_at=now(),updated_at=now()
    WHERE id=p_friendship_id AND addressee_id=p_user_id AND status='pending';
  ELSE
    DELETE FROM public.friendships WHERE id=p_friendship_id AND addressee_id=p_user_id AND status='pending';
  END IF;
  RETURN FOUND;
END; $$;
REVOKE ALL ON FUNCTION public.respond_friend_request(uuid,uuid,boolean) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.respond_friend_request(uuid,uuid,boolean) TO service_role;

CREATE OR REPLACE FUNCTION public.remove_friendship(p_user_id uuid,p_friendship_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.friendships WHERE id=p_friendship_id AND (requester_id=p_user_id OR addressee_id=p_user_id);
  RETURN FOUND;
END; $$;
REVOKE ALL ON FUNCTION public.remove_friendship(uuid,uuid) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.remove_friendship(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.create_match_invite(p_user_id uuid,p_invited_id uuid DEFAULT NULL)
RETURNS TABLE(code text,match_id uuid,expires_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.profiles%ROWTYPE; m_id uuid; inv_id uuid; inv_code text;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id=p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;
  UPDATE public.match_invites SET status='cancelled',updated_at=now() WHERE host_id=p_user_id AND status='open';
  INSERT INTO public.matches(white_id,white_name,white_elo,status,tc_base,tc_inc,clock_w,clock_b)
  VALUES(p_user_id,p.name,p.elo,'waiting',180000,2000,180000,180000) RETURNING id INTO m_id;
  inv_code := upper(substr(encode(gen_random_bytes(6),'hex'),1,8));
  INSERT INTO public.match_invites(code,host_id,invited_id,match_id)
  VALUES(inv_code,p_user_id,p_invited_id,m_id) RETURNING id INTO inv_id;
  UPDATE public.matches SET invite_id=inv_id WHERE id=m_id;
  RETURN QUERY SELECT inv_code,m_id,now()+interval '10 minutes';
END; $$;
REVOKE ALL ON FUNCTION public.create_match_invite(uuid,uuid) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_match_invite(uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.join_match_invite(p_user_id uuid,p_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE inv public.match_invites%ROWTYPE; p public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO inv FROM public.match_invites WHERE code=upper(trim(p_code)) FOR UPDATE;
  IF NOT FOUND OR inv.status <> 'open' OR inv.expires_at <= now() OR inv.host_id=p_user_id OR (inv.invited_id IS NOT NULL AND inv.invited_id<>p_user_id) THEN RAISE EXCEPTION 'invalid invite'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id=p_user_id;
  UPDATE public.matches SET black_id=p_user_id,black_name=p.name,black_elo=p.elo,status='live',last_move_at=now()
  WHERE id=inv.match_id AND status='waiting' AND black_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'match unavailable'; END IF;
  UPDATE public.match_invites SET status='consumed',consumed_by=p_user_id,updated_at=now() WHERE id=inv.id;
  RETURN inv.match_id;
END; $$;
REVOKE ALL ON FUNCTION public.join_match_invite(uuid,text) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.join_match_invite(uuid,text) TO service_role;

CREATE OR REPLACE FUNCTION public.record_endgame_result(p_user_id uuid,p_level_id integer,p_correct boolean,p_ms integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lvl public.endgame_levels%ROWTYPE; prog public.endgame_progress%ROWTYPE; first_reward boolean:=false;
BEGIN
  SELECT * INTO lvl FROM public.endgame_levels WHERE id=p_level_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'level not found'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user_id AND elo>=lvl.elo_required) THEN RAISE EXCEPTION 'level locked'; END IF;
  INSERT INTO public.endgame_progress(user_id,level_id) VALUES(p_user_id,p_level_id) ON CONFLICT(user_id,level_id) DO NOTHING;
  SELECT * INTO prog FROM public.endgame_progress WHERE user_id=p_user_id AND level_id=p_level_id FOR UPDATE;
  first_reward := p_correct AND NOT prog.reward_granted;
  UPDATE public.endgame_progress SET attempts=attempts+1, solved=solved OR p_correct,
    best_ms=CASE WHEN p_correct THEN least(coalesce(best_ms,p_ms),p_ms) ELSE best_ms END,
    solved_at=CASE WHEN p_correct AND solved_at IS NULL THEN now() ELSE solved_at END,
    reward_granted=reward_granted OR p_correct
  WHERE id=prog.id RETURNING * INTO prog;
  IF first_reward THEN
    UPDATE public.profiles SET elo=elo+lvl.elo_reward,diamonds=diamonds+lvl.diamond_reward,updated_at=now() WHERE id=p_user_id;
  END IF;
  RETURN jsonb_build_object('first_solve',first_reward,'attempts',prog.attempts);
END; $$;
REVOKE ALL ON FUNCTION public.record_endgame_result(uuid,integer,boolean,integer) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_endgame_result(uuid,integer,boolean,integer) TO service_role;