REVOKE EXECUTE ON FUNCTION public.search_player_profiles(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_player_profiles(text) TO service_role;