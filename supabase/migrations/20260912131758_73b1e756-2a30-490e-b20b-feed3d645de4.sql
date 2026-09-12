ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS real_name text NOT NULL DEFAULT '';

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

  -- 段位相近者优先：按积分差排序，差距相同再按等待时间
  SELECT * INTO waiting
  FROM public.matches
  WHERE status = 'waiting' AND black_id IS NULL AND white_id <> p_user_id
  ORDER BY abs(white_elo - p.elo) ASC, created_at ASC
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