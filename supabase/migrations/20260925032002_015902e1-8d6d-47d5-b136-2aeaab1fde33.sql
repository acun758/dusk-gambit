CREATE TABLE public.puzzle_answers (
  puzzle_id integer PRIMARY KEY REFERENCES public.puzzles(id) ON DELETE CASCADE,
  hint_zh text NOT NULL DEFAULT '',
  hint_en text NOT NULL DEFAULT '',
  explanation_zh text NOT NULL DEFAULT '',
  explanation_en text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.puzzle_answers TO service_role;
REVOKE ALL ON public.puzzle_answers FROM anon, authenticated;
ALTER TABLE public.puzzle_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "puzzle_answers_no_client_access" ON public.puzzle_answers FOR SELECT TO anon, authenticated USING (false);
CREATE TRIGGER update_puzzle_answers_updated_at BEFORE UPDATE ON public.puzzle_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.puzzle_answers (puzzle_id, hint_zh, hint_en, explanation_zh, explanation_en)
SELECT id, hint_zh, hint_en, explanation_zh, explanation_en FROM public.puzzles;

ALTER TABLE public.puzzles
  DROP COLUMN hint_zh, DROP COLUMN hint_en, DROP COLUMN explanation_zh, DROP COLUMN explanation_en;