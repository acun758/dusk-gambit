UPDATE public.endgame_levels SET
  name_zh='王兵对峙', name_en='King and Pawn Opposition',
  brief_zh='用对王争取关键格，逼迫黑王后退。', brief_en='Claim the key squares through direct opposition.',
  fen='8/8/8/3k4/8/3K4/4P3/8 w - - 0 1',
  objective_zh='白先，计算五个半回合的对王路线。', objective_en='White to move; calculate a five-ply opposition line.',
  moves_to_mate=3, depth=4,
  theme_zh='对王与关键格', theme_en='Opposition and key squares',
  hint_zh='先推进兵，再用王抢占正对位置。', hint_en='Advance first, then take direct opposition.',
  explanation_zh='e4 固定对王距离；黑王向后退时，白王沿中央逼近并占住 d4。', explanation_en='e4 fixes the opposition distance; after the king retreats, White centralizes to d4.',
  move_annotations='[{"move":"e2e4","zh":"固定关键格"},{"move":"d3e3","zh":"保持对王"},{"move":"e3d4","zh":"王进入第四横线"}]'::jsonb
WHERE id=1;

UPDATE public.endgame_levels SET
  name_zh='王翼破口', name_en='Kingside Breakthrough',
  brief_zh='制造外侧通路兵，迫使黑王离开防线。', brief_en='Create an outside passer and pull the king away.',
  fen='8/5pk1/6p1/7p/7P/6P1/5PK1/8 w - - 0 1',
  objective_zh='白先，计算四个半回合的兵形突破。', objective_en='White to move; calculate a four-ply pawn break.',
  moves_to_mate=2, depth=4,
  theme_zh='通路兵制造', theme_en='Passed-pawn creation',
  hint_zh='不要急着走王，先固定黑方兵链。', hint_en='Fix Black’s pawn chain before moving the king.',
  explanation_zh='f4 夺取 e5 控制权，随后 f3 稳住兵链，为王的渗透留出路线。', explanation_en='f4 claims e5, while f3 stabilizes the chain and prepares king entry.',
  move_annotations='[{"move":"f2f4","zh":"制造突破点"},{"move":"g2f3","zh":"稳定后方"}]'::jsonb
WHERE id=2;

UPDATE public.endgame_levels SET
  name_zh='后王合围', name_en='Queen Escort',
  brief_zh='后先缩小活动空间，再让王靠近。', brief_en='Use the queen to shrink the box, then centralize the king.',
  fen='8/8/8/4k3/8/8/4Q3/4K3 w - - 0 1',
  objective_zh='白先，完成四个半回合的合围。', objective_en='White to move; execute a four-ply box technique.',
  moves_to_mate=2, depth=5,
  theme_zh='后王协同', theme_en='Queen and king coordination',
  hint_zh='后负责封锁，王负责靠近。', hint_en='The queen boxes; the king approaches.',
  explanation_zh='Qe4 收紧黑王活动范围，Ke2 安全靠近，避免无意义的连续将军。', explanation_en='Qe4 tightens the box and Ke2 approaches safely without pointless checks.',
  move_annotations='[{"move":"e2e4","zh":"缩小王区"},{"move":"e1e2","zh":"王加入合围"}]'::jsonb
WHERE id=3;

UPDATE public.endgame_levels SET
  name_zh='升变后的第一将', name_en='First Check After Promotion',
  brief_zh='先升后定，避免新后被王追赶。', brief_en='Promote first, then check from a safe file.',
  fen='8/3P4/8/8/8/8/5k2/7K w - - 0 1',
  objective_zh='白先，计算四个半回合的升变路线。', objective_en='White to move; calculate a four-ply promotion line.',
  moves_to_mate=2, depth=5,
  theme_zh='升变与安全将军', theme_en='Promotion and safe checks',
  hint_zh='升变后不要贴近黑王，从远处控制横线。', hint_en='After promoting, check from distance.',
  explanation_zh='d8=Q 完成升变，Qd3+ 拉开距离并限制黑王，保留王后的安全。', explanation_en='d8=Q promotes; Qd3+ keeps distance while restricting the king.',
  move_annotations='[{"move":"d7d8q","zh":"升变为后"},{"move":"d8d3","zh":"远距将军"}]'::jsonb
WHERE id=4;

UPDATE public.endgame_levels SET
  name_zh='斜线封锁', name_en='Diagonal Restriction',
  brief_zh='利用象的长斜线压缩黑王路线。', brief_en='Use the bishop’s long diagonal to restrict the king.',
  fen='8/8/8/4k3/8/3B4/4K3/8 w - - 0 1',
  objective_zh='白先，连续五个半回合保持封锁。', objective_en='White to move; maintain restriction for five plies.',
  moves_to_mate=3, depth=6,
  theme_zh='斜线控制', theme_en='Diagonal restriction',
  hint_zh='象先换斜线，再让王靠近。', hint_en='Switch diagonals before bringing up the king.',
  explanation_zh='Bc4 控制关键斜线，Bf7 再次切断黑王，最后 Ke3 完成王象协同。', explanation_en='Bc4 controls the key diagonal, Bf7 cuts the king again, and Ke3 completes coordination.',
  move_annotations='[{"move":"d3c4","zh":"切换控制线"},{"move":"c4f7","zh":"二次封锁"},{"move":"e2e3","zh":"王加入"}]'::jsonb
WHERE id=5;

UPDATE public.endgame_levels SET
  name_zh='宗师底线审判', name_en='Grandmaster Back-rank Verdict',
  brief_zh='连续计算逼王、封线与最终占位。', brief_en='Calculate the forcing checks and final rank control.',
  fen='7k/8/8/8/8/8/1R6/R6K w - - 0 1',
  objective_zh='白先，以六层计算完成阶梯将杀。', objective_en='White to move; finish the ladder mate at depth six.',
  moves_to_mate=2, depth=6,
  theme_zh='双车阶梯杀', theme_en='Ladder mate',
  hint_zh='一车逼王，一车封住最后横线。', hint_en='One rook checks while the other seals the last rank.',
  explanation_zh='Rb7 迫使黑王进入 g8，Ra8# 由另一车保护并封死整条第八横线。', explanation_en='Rb7 forces Kg8; Ra8# is protected by the other rook and seals the eighth rank.',
  move_annotations='[{"move":"b2b7","zh":"逼王入角"},{"move":"a1a8","zh":"阶梯将杀"}]'::jsonb
WHERE id=6;

UPDATE public.endgame_solutions SET solution=CASE level_id
  WHEN 1 THEN ARRAY['e2e4','d5e5','d3e3','e5d6','e3d4']
  WHEN 2 THEN ARRAY['f2f4','g7f6','g2f3','f6e6']
  WHEN 3 THEN ARRAY['e2e4','e5d6','e1e2','d6c5']
  WHEN 4 THEN ARRAY['d7d8q','f2g3','d8d3','g3f2']
  WHEN 5 THEN ARRAY['d3c4','e5d4','c4f7','d4e5','e2e3']
  WHEN 6 THEN ARRAY['b2b7','h8g8','a1a8']
  ELSE solution END, alternate_solutions='[]'::jsonb WHERE level_id BETWEEN 1 AND 6;

CREATE OR REPLACE VIEW public.endgame_levels_public
WITH (security_invoker = false) AS
SELECT id, code, name_zh, name_en, brief_zh, brief_en, fen,
       objective_zh, objective_en, moves_to_mate, elo_required, elo_reward, diamond_reward,
       moves_to_mate * 2 - 1 AS solution_length,
       depth, theme_zh, theme_en, hint_zh, hint_en
FROM public.endgame_levels;
GRANT SELECT ON public.endgame_levels_public TO anon, authenticated;
GRANT ALL ON public.endgame_levels_public TO service_role;