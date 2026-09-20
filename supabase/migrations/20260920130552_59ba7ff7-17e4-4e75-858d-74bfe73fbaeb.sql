REVOKE ALL ON FUNCTION public.create_arena_room(uuid, text, text, integer, integer, integer, integer, integer, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_arena_room(uuid, text, text, integer, integer, integer, integer, integer, uuid) TO service_role;
DROP FUNCTION IF EXISTS public.create_arena_room(uuid, text, text, integer, integer, integer, integer, integer);