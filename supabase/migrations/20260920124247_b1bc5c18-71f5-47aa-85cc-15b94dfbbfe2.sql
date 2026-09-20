REVOKE EXECUTE ON FUNCTION public.create_arena_room(uuid, text, text, integer, integer, integer, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.join_arena_room(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.close_arena_room(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_arena_rooms() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_arena_room(uuid, text, text, integer, integer, integer, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.join_arena_room(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.close_arena_room(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_arena_rooms() TO service_role;