-- ① 残局关卡答案表：提示/讲解/着法标注迁入，仅服务端可读
CREATE TABLE public.endgame_answers (
  level_id integer PRIMARY KEY REFERENCES public.endgame_levels(id) ON DELETE CASCADE,
  hint_zh text NOT NULL DEFAULT '',
  hint_en text NOT NULL DEFAULT '',
  explanation_zh text NOT NULL DEFAULT '',
  explanation_en text NOT NULL DEFAULT '',
  move_annotations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.endgame_answers TO service_role;
REVOKE ALL ON public.endgame_answers FROM anon, authenticated;
ALTER TABLE public.endgame_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "endgame_answers_no_client_access" ON public.endgame_answers FOR SELECT TO anon, authenticated USING (false);
CREATE TRIGGER update_endgame_answers_updated_at BEFORE UPDATE ON public.endgame_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.endgame_answers (level_id, hint_zh, hint_en, explanation_zh, explanation_en, move_annotations)
SELECT id, hint_zh, hint_en, explanation_zh, explanation_en, move_annotations FROM public.endgame_levels;

-- 旧公开视图引用了提示字段且代码已不再使用，先移除再拆列
DROP VIEW IF EXISTS public.endgame_levels_public;

ALTER TABLE public.endgame_levels
  DROP COLUMN hint_zh,
  DROP COLUMN hint_en,
  DROP COLUMN explanation_zh,
  DROP COLUMN explanation_en,
  DROP COLUMN move_annotations;

-- ② 解法表权限与 puzzle_answers 口径统一：客户端（含匿名）一律 401
REVOKE ALL ON public.puzzle_solutions FROM anon, authenticated;
REVOKE ALL ON public.endgame_solutions FROM anon, authenticated;