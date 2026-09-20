ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS target_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS rooms_target_idx ON public.rooms(target_id) WHERE target_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_arena_room(p_user_id uuid, p_visibility text DEFAULT 'public'::text, p_color text DEFAULT 'random'::text, p_initial_ms integer DEFAULT 600000, p_increment_ms integer DEFAULT 3000, p_per_move_ms integer DEFAULT 0, p_rating_min integer DEFAULT 0, p_rating_max integer DEFAULT 100000, p_target_id uuid DEFAULT NULL::uuid)
 RETURNS rooms
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  p public.profiles%ROWTYPE;
  r public.rooms%ROWTYPE;
  v_color text;
  v_initial integer;
  v_inc integer;
  v_per integer;
  v_code text;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;

  IF p_target_id IS NOT NULL THEN
    IF p_target_id = p_user_id THEN RAISE EXCEPTION 'invalid target'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target_id) THEN
      RAISE EXCEPTION 'invalid target';
    END IF;
  END IF;

  v_initial := least(greatest(coalesce(p_initial_ms, 600000), 60000), 3600000);
  v_inc := least(greatest(coalesce(p_increment_ms, 0), 0), 60000);
  v_per := least(greatest(coalesce(p_per_move_ms, 0), 0), 600000);

  IF p_color IN ('w','b') THEN v_color := p_color;
  ELSE v_color := CASE WHEN random() < 0.5 THEN 'w' ELSE 'b' END; END IF;

  UPDATE public.rooms SET status = 'closed', closed_at = now()
  WHERE host_id = p_user_id AND status = 'waiting'
    AND (target_id IS NULL) = (p_target_id IS NULL);

  LOOP
    v_code := upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.rooms WHERE short_code = v_code);
  END LOOP;

  INSERT INTO public.rooms(
    host_id, status, visibility, short_code, color_choice, host_color,
    initial_ms, increment_ms, per_move_ms, rating_min, rating_max, target_id
  ) VALUES (
    p_user_id, 'waiting',
    CASE WHEN p_target_id IS NOT NULL OR p_visibility = 'private' THEN 'private' ELSE 'public' END,
    v_code,
    CASE WHEN p_color IN ('w','b') THEN p_color ELSE 'random' END,
    v_color, v_initial, v_inc, v_per,
    CASE WHEN p_target_id IS NOT NULL THEN 0 ELSE greatest(coalesce(p_rating_min, 0), 0) END,
    CASE WHEN p_target_id IS NOT NULL THEN 100000 ELSE least(coalesce(p_rating_max, 100000), 100000) END,
    p_target_id
  ) RETURNING * INTO r;

  RETURN r;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.expire_arena_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.rooms SET status = 'closed', closed_at = now()
  WHERE status = 'waiting'
    AND created_at < now() - (CASE WHEN target_id IS NOT NULL THEN interval '2 minutes' ELSE interval '10 minutes' END);

  UPDATE public.rooms r SET status = 'closed', closed_at = now()
  FROM public.matches m
  WHERE r.match_id = m.id AND r.status = 'playing' AND m.status = 'over';
END;
$function$;