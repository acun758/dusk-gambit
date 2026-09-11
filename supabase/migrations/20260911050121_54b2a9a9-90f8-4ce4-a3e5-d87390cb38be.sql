-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Sovereign',
  diamonds integer NOT NULL DEFAULT 1280,
  elo integer NOT NULL DEFAULT 2480,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- matches
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  white_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  black_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  white_name text NOT NULL DEFAULT 'White',
  black_name text NOT NULL DEFAULT 'Black',
  white_elo integer NOT NULL DEFAULT 2400,
  black_elo integer NOT NULL DEFAULT 2400,
  tc_base integer NOT NULL DEFAULT 180000,
  tc_inc integer NOT NULL DEFAULT 2000,
  clock_w integer NOT NULL DEFAULT 180000,
  clock_b integer NOT NULL DEFAULT 180000,
  turn text NOT NULL DEFAULT 'w',
  ply integer NOT NULL DEFAULT 0,
  seq integer NOT NULL DEFAULT 0,
  fen text NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  cp integer NOT NULL DEFAULT 18,
  status text NOT NULL DEFAULT 'waiting',
  outcome text,
  reason text,
  rating_delta integer,
  last_move_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select_participant" ON public.matches FOR SELECT TO authenticated
  USING (auth.uid() = white_id OR auth.uid() = black_id);

-- match moves
CREATE TABLE public.match_moves (
  id bigserial PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  seq integer NOT NULL,
  ply integer NOT NULL,
  uci text NOT NULL,
  san text NOT NULL,
  by text NOT NULL,
  zh text,
  cp integer,
  clock_w integer NOT NULL,
  clock_b integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, ply)
);
CREATE INDEX match_moves_match_seq_idx ON public.match_moves (match_id, seq);
GRANT SELECT ON public.match_moves TO authenticated;
GRANT ALL ON public.match_moves TO service_role;
ALTER TABLE public.match_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "match_moves_select_participant" ON public.match_moves FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (auth.uid() = m.white_id OR auth.uid() = m.black_id)));

-- endgame levels (solution stays server-side)
CREATE TABLE public.endgame_levels (
  id integer PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name_zh text NOT NULL,
  name_en text NOT NULL,
  brief_zh text NOT NULL,
  brief_en text NOT NULL,
  fen text NOT NULL,
  objective_zh text NOT NULL,
  objective_en text NOT NULL,
  solution text[] NOT NULL,
  moves_to_mate integer NOT NULL DEFAULT 2,
  elo_required integer NOT NULL DEFAULT 0,
  elo_reward integer NOT NULL DEFAULT 6,
  diamond_reward integer NOT NULL DEFAULT 20
);
GRANT ALL ON public.endgame_levels TO service_role;
ALTER TABLE public.endgame_levels ENABLE ROW LEVEL SECURITY;

CREATE VIEW public.endgame_levels_public
WITH (security_invoker = false) AS
SELECT id, code, name_zh, name_en, brief_zh, brief_en, fen,
       objective_zh, objective_en, moves_to_mate, elo_required, elo_reward, diamond_reward,
       array_length(solution, 1) AS solution_length
FROM public.endgame_levels;
GRANT SELECT ON public.endgame_levels_public TO anon, authenticated;
GRANT ALL ON public.endgame_levels_public TO service_role;

-- endgame progress
CREATE TABLE public.endgame_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id integer NOT NULL REFERENCES public.endgame_levels(id) ON DELETE CASCADE,
  solved boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  best_ms integer,
  solved_at timestamptz,
  UNIQUE (user_id, level_id)
);
GRANT SELECT ON public.endgame_progress TO authenticated;
GRANT ALL ON public.endgame_progress TO service_role;
ALTER TABLE public.endgame_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "endgame_progress_select_own" ON public.endgame_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- realtime
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_moves REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_moves;

-- seeded endgame ladder
INSERT INTO public.endgame_levels (id, code, name_zh, name_en, brief_zh, brief_en, fen, objective_zh, objective_en, solution, moves_to_mate, elo_required, elo_reward, diamond_reward) VALUES
(1,'back-rank','底线绞杀','Back Rank Ruin','黑方底线空虚，白车直插。','Black''s back rank is bare. Drive the rook home.','6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1','白先，一步将死。','White to move, mate in 1.',ARRAY['a1a8'],1,0,6,20),
(2,'ladder-mate','双车阶梯','Ladder Mate','两车轮转，把黑王逼上末排。','Two rooks roll the king to the edge.','7k/8/8/8/8/8/1R6/R6K w - - 0 1','白先，两步将死。','White to move, mate in 2.',ARRAY['b2b7','h8g8','a1a8'],2,2200,8,26),
(3,'queen-box','后王合围','Queen Escort','后逼角，王补位。','Box the king, then bring the king.','8/8/8/4k3/8/8/4Q3/4K3 w - - 0 1','白先，后先夺格。','White to move, take the key square.',ARRAY['e2e4','e5d6','e1e2'],2,2300,9,30),
(4,'smothered','闷杀之刃','Smothered Blade','马入死角，闷杀成型。','The knight seals the smothered mate.','6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1','白先，两步闷杀。','White to move, smothered mate in 2.',ARRAY['g5f7','h8g8','f7h6'],2,2400,10,34),
(5,'zugzwang','逼着绝境','Zugzwang','不给黑方任何安全着法。','Leave Black no safe move at all.','8/8/8/3k4/8/3K4/4P3/8 w - - 0 1','白先，夺取对王。','White to move, seize the opposition.',ARRAY['d3e3','d5e5','e2e4'],2,2500,12,40),
(6,'sovereign-finish','君主终局','Sovereign Finish','以最短路径完成加冕绝杀。','Crown the king by the shortest path.','8/3P4/8/8/8/8/6k1/6K1 w - - 0 1','白先，升变制胜。','White to move, promote and win.',ARRAY['d7d8q','g2h3','d8h4'],2,2600,15,50);