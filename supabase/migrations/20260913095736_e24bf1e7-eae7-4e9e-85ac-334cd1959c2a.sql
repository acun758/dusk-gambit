
REVOKE EXECUTE ON FUNCTION public.apply_match_result(uuid, numeric, integer) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_match_result(uuid, numeric, integer) TO service_role;
