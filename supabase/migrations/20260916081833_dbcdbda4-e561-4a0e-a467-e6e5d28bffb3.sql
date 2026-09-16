DROP FUNCTION IF EXISTS public.find_or_create_ranked_match(uuid);
DROP FUNCTION IF EXISTS public.create_match_invite(uuid, uuid);

CREATE OR REPLACE FUNCTION public.find_or_create_ranked_match(
  p_user_id uuid,
  p_tc_base integer DEFAULT 180000,
  p_tc_inc integer DEFAULT 2000
)
 RETURNS TABLE(match_id uuid, side text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  p public.profiles%ROWTYPE;
  existing public.matches%ROWTYPE;
  waiting public.matches%ROWTYPE;
  joined public.matches%ROWTYPE;
  created_id uuid;
  my_series_target integer;
  v_base integer;
  v_inc integer;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;
  IF length(trim(p.real_name)) < 2 THEN RAISE EXCEPTION 'real name required'; END IF;

  -- 只接受受支持的赛制，其余回落到 3+2
  IF (p_tc_base, p_tc_inc) IN ((60000,0),(180000,2000),(600000,0),(900000,10000)) THEN
    v_base := p_tc_base; v_inc := p_tc_inc;
  ELSE
    v_base := 180000; v_inc := 2000;
  END IF;

  SELECT ps.to_floor INTO my_series_target
  FROM public.promotion_series ps
  WHERE ps.user_id = p_user_id AND ps.status = 'active'
  LIMIT 1;

  SELECT * INTO existing
  FROM public.matches
  WHERE (white_id = p_user_id OR black_id = p_user_id)
    AND status IN ('waiting', 'live')
  ORDER BY CASE WHEN status = 'live' THEN 0 ELSE 1 END, created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- 已有进行中的对局：直接回到该局；若是自己挂着的等待局且赛制不同，改成新赛制
    IF existing.status = 'waiting' AND existing.white_id = p_user_id
       AND (existing.tc_base <> v_base OR existing.tc_inc <> v_inc) THEN
      UPDATE public.matches
      SET tc_base = v_base, tc_inc = v_inc, clock_w = v_base, clock_b = v_base
      WHERE id = existing.id;
    END IF;
    RETURN QUERY SELECT existing.id, CASE WHEN existing.white_id = p_user_id THEN 'w'::text ELSE 'b'::text END;
    RETURN;
  END IF;

  SELECT m.* INTO waiting
  FROM public.matches m
  JOIN public.profiles host ON host.id = m.white_id
  LEFT JOIN public.promotion_series host_series
    ON host_series.user_id = m.white_id AND host_series.status = 'active'
  WHERE m.status = 'waiting'
    AND m.black_id IS NULL
    AND m.white_id <> p_user_id
    AND m.tc_base = v_base
    AND m.tc_inc = v_inc
    AND length(trim(host.real_name)) >= 2
  ORDER BY
    CASE
      WHEN my_series_target IS NOT NULL AND host_series.to_floor = my_series_target THEN 0
      WHEN my_series_target IS NULL AND host_series.id IS NULL THEN 1
      ELSE 2
    END,
    abs(host.elo - p.elo) ASC,
    m.created_at ASC
  LIMIT 1
  FOR UPDATE OF m SKIP LOCKED;

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
    v_base, v_inc, v_base, v_base, 'waiting'
  ) RETURNING id INTO created_id;

  RETURN QUERY SELECT created_id, 'w'::text;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_match_invite(
  p_user_id uuid,
  p_invited_id uuid DEFAULT NULL::uuid,
  p_tc_base integer DEFAULT 180000,
  p_tc_inc integer DEFAULT 2000
)
 RETURNS TABLE(code text, match_id uuid, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  p public.profiles%ROWTYPE;
  m_id uuid;
  inv_id uuid;
  inv_code text;
  v_base integer;
  v_inc integer;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id=p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile required'; END IF;

  IF (p_tc_base, p_tc_inc) IN ((60000,0),(180000,2000),(600000,0),(900000,10000)) THEN
    v_base := p_tc_base; v_inc := p_tc_inc;
  ELSE
    v_base := 180000; v_inc := 2000;
  END IF;

  UPDATE public.match_invites SET status='cancelled',updated_at=now() WHERE host_id=p_user_id AND status='open';
  UPDATE public.matches SET status='over',outcome='draw',reason='abort'
    WHERE white_id=p_user_id AND black_id IS NULL AND status='waiting';
  INSERT INTO public.matches(white_id,white_name,white_elo,black_name,black_elo,status,tc_base,tc_inc,clock_w,clock_b)
  VALUES(p_user_id,p.name,p.elo,'等待对手',p.elo,'waiting',v_base,v_inc,v_base,v_base) RETURNING id INTO m_id;
  inv_code := upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text),1,8));
  INSERT INTO public.match_invites(code,host_id,invited_id,match_id)
  VALUES(inv_code,p_user_id,p_invited_id,m_id) RETURNING id INTO inv_id;
  UPDATE public.matches SET invite_id=inv_id WHERE id=m_id;
  RETURN QUERY SELECT inv_code,m_id,now()+interval '10 minutes';
END;
$function$;