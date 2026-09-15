ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS black_delta integer;

CREATE OR REPLACE FUNCTION public.settle_ranked_match(p_match_id uuid, p_outcome text, p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  m public.matches%ROWTYPE;
  w jsonb;
  b jsonb;
  delta integer;
  bdelta integer;
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
      UPDATE public.matches SET outcome = 'draw', reason = 'timeout_vs_insufficient' WHERE id = p_match_id;
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
  bdelta := coalesce((b->>'delta')::integer, 0);
  UPDATE public.matches SET rating_delta = delta, black_delta = bdelta WHERE id = p_match_id;

  RETURN jsonb_build_object('settled', true, 'rating_delta', delta, 'black_delta', bdelta, 'white', w, 'black', b);
END;
$$;
REVOKE ALL ON FUNCTION public.settle_ranked_match(uuid,text,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_ranked_match(uuid,text,text) TO service_role;