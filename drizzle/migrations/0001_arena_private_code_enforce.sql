CREATE OR REPLACE FUNCTION public.join_arena_room(p_user_id uuid, p_room_id uuid DEFAULT NULL::uuid, p_code text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r public.rooms%ROWTYPE;
  guest public.profiles%ROWTYPE;
  host public.profiles%ROWTYPE;
  m_id uuid;
BEGIN
  SELECT * INTO guest FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;

  IF p_room_id IS NOT NULL THEN
    SELECT * INTO r FROM public.rooms WHERE id = p_room_id FOR UPDATE;
  ELSE
    SELECT * INTO r FROM public.rooms WHERE short_code = upper(trim(coalesce(p_code, ''))) FOR UPDATE;
  END IF;

  IF NOT FOUND THEN RETURN jsonb_build_object('code', 'not_found'); END IF;

  IF r.target_id IS NOT NULL AND r.target_id <> p_user_id AND r.host_id <> p_user_id THEN
    RETURN jsonb_build_object('code', 'not_found');
  END IF;

  -- 私密房（非定向）必须凭口令进入，不能只凭房间编号
  IF r.visibility = 'private' AND r.target_id IS NULL AND r.host_id <> p_user_id
     AND upper(trim(coalesce(p_code, ''))) <> r.short_code THEN
    RETURN jsonb_build_object('code', 'not_found');
  END IF;

  IF r.status = 'waiting' AND r.created_at < now() - (CASE WHEN r.target_id IS NOT NULL THEN interval '2 minutes' ELSE interval '10 minutes' END) THEN
    UPDATE public.rooms SET status = 'closed', closed_at = now() WHERE id = r.id;
    RETURN jsonb_build_object('code', 'expired');
  END IF;
  IF r.status <> 'waiting' OR r.guest_id IS NOT NULL THEN
    RETURN jsonb_build_object('code', 'full');
  END IF;
  IF r.host_id = p_user_id THEN RETURN jsonb_build_object('code', 'self'); END IF;
  IF guest.elo < r.rating_min OR guest.elo > r.rating_max THEN
    RETURN jsonb_build_object('code', 'rating_blocked', 'min', r.rating_min, 'max', r.rating_max);
  END IF;

  SELECT * INTO host FROM public.profiles WHERE id = r.host_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('code', 'not_found'); END IF;

  INSERT INTO public.matches(
    white_id, black_id, white_name, black_name, white_elo, black_elo,
    tc_base, tc_inc, clock_w, clock_b, status, last_move_at,
    white_avatar_key, black_avatar_key, white_piece_set, black_piece_set
  ) VALUES (
    CASE WHEN r.host_color = 'w' THEN r.host_id ELSE p_user_id END,
    CASE WHEN r.host_color = 'w' THEN p_user_id ELSE r.host_id END,
    CASE WHEN r.host_color = 'w' THEN host.name ELSE guest.name END,
    CASE WHEN r.host_color = 'w' THEN guest.name ELSE host.name END,
    CASE WHEN r.host_color = 'w' THEN host.elo ELSE guest.elo END,
    CASE WHEN r.host_color = 'w' THEN guest.elo ELSE host.elo END,
    r.initial_ms, r.increment_ms, r.initial_ms, r.initial_ms, 'live', clock_timestamp(),
    CASE WHEN r.host_color = 'w' THEN host.avatar_key ELSE guest.avatar_key END,
    CASE WHEN r.host_color = 'w' THEN guest.avatar_key ELSE host.avatar_key END,
    CASE WHEN r.host_color = 'w' THEN host.equipped_piece_set ELSE guest.equipped_piece_set END,
    CASE WHEN r.host_color = 'w' THEN guest.equipped_piece_set ELSE host.equipped_piece_set END
  ) RETURNING id INTO m_id;

  UPDATE public.rooms SET guest_id = p_user_id, status = 'playing', match_id = m_id
  WHERE id = r.id;

  RETURN jsonb_build_object('code', 'ok', 'room_id', r.id, 'match_id', m_id,
    'side', CASE WHEN r.host_color = 'w' THEN 'b' ELSE 'w' END);
END;
$function$;