REVOKE EXECUTE ON FUNCTION public.find_or_create_ranked_match(uuid, integer, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_match_invite(uuid, uuid, integer, integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.find_or_create_ranked_match(uuid, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_match_invite(uuid, uuid, integer, integer) TO service_role;