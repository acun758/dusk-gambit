DROP VIEW public.endgame_levels_public;

CREATE TABLE public.endgame_solutions (
  level_id integer PRIMARY KEY REFERENCES public.endgame_levels(id) ON DELETE CASCADE,
  solution text[] NOT NULL
);
GRANT ALL ON public.endgame_solutions TO service_role;
ALTER TABLE public.endgame_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "endgame_solutions_no_client_access" ON public.endgame_solutions FOR SELECT TO authenticated, anon USING (false);

INSERT INTO public.endgame_solutions (level_id, solution)
SELECT id, solution FROM public.endgame_levels;

ALTER TABLE public.endgame_levels DROP COLUMN solution;
GRANT SELECT ON public.endgame_levels TO anon, authenticated;
CREATE POLICY "endgame_levels_public_read" ON public.endgame_levels FOR SELECT TO anon, authenticated USING (true);