import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Chess } from "chess.js";

/**
 * 战术谜题的服务端权威逻辑。
 * 答案只保存在服务端，客户端拿到的永远只有题面；答错之后才会随讲解一起返回正解。
 * 奖励只发训练点与钻石，不触碰天梯积分。
 */

export interface PuzzleCard {
  id: number;
  code: string;
  fen: string;
  side: "w" | "b";
  theme: string;
  themeZh: string;
  themeEn: string;
  difficulty: number;
  rating: number;
  movesRequired: number;
  hintZh: string;
  hintEn: string;
  tpReward: number;
  diamondReward: number;
  solved: boolean;
  attempts: number;
  bestMs: number | null;
}

interface PuzzleRow {
  id: number;
  code: string;
  fen: string;
  side_to_move: string;
  theme: string;
  theme_zh: string;
  theme_en: string;
  difficulty: number;
  rating: number;
  moves_required: number;
  hint_zh: string;
  hint_en: string;
  explanation_zh: string;
  explanation_en: string;
  tp_reward: number;
  diamond_reward: number;
}

function toCard(row: PuzzleRow, prog?: { solved: boolean; attempts: number; best_ms: number | null }): PuzzleCard {
  return {
    id: row.id,
    code: row.code,
    fen: row.fen,
    side: row.side_to_move === "b" ? "b" : "w",
    theme: row.theme,
    themeZh: row.theme_zh,
    themeEn: row.theme_en,
    difficulty: row.difficulty,
    rating: row.rating,
    movesRequired: row.moves_required,
    hintZh: row.hint_zh,
    hintEn: row.hint_en,
    tpReward: row.tp_reward,
    diamondReward: row.diamond_reward,
    solved: prog?.solved ?? false,
    attempts: prog?.attempts ?? 0,
    bestMs: prog?.best_ms ?? null,
  };
}

/** 谜面（公开表 puzzles）+ 提示/讲解（仅服务端可读表 puzzle_answers） */
function mergeAnswer(row: object, ans?: { hint_zh: string; hint_en: string; explanation_zh: string; explanation_en: string } | null): PuzzleRow {
  return {
    ...(row as PuzzleRow),
    hint_zh: ans?.hint_zh ?? "",
    hint_en: ans?.hint_en ?? "",
    explanation_zh: ans?.explanation_zh ?? "",
    explanation_en: ans?.explanation_en ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadPuzzle(admin: any, id: number): Promise<PuzzleRow | null> {
  const { data: row } = await admin.from("puzzles").select("*").eq("id", id).maybeSingle();
  if (!row) return null;
  const { data: ans } = await admin.from("puzzle_answers").select("*").eq("puzzle_id", id).maybeSingle();
  return mergeAnswer(row, ans);
}

/** 今天（UTC+8，与国内玩家的自然日一致） */
function todayKey(): string {
  const now = new Date(Date.now() + 8 * 3600_000);
  return now.toISOString().slice(0, 10);
}

/** 题库列表 + 我的进度（不含答案） */
export const listPuzzles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("puzzles")
      .select("*")
      .order("difficulty", { ascending: true })
      .order("rating", { ascending: true });
    if (error) throw new Error(error.message);
    const { data: answers } = await supabaseAdmin.from("puzzle_answers").select("*");
    const ansById = new Map((answers ?? []).map((a) => [a.puzzle_id, a]));
    const { data: progress } = await supabaseAdmin
      .from("puzzle_progress")
      .select("puzzle_id, solved, attempts, best_ms")
      .eq("user_id", context.userId);
    const byId = new Map((progress ?? []).map((p) => [p.puzzle_id, p]));
    return {
      puzzles: (rows ?? []).map((r) =>
        toCard(mergeAnswer(r, ansById.get(r.id)), byId.get(r.id) as never),
      ),
    };
  });

/** 每日一题：全服同题，答对累计连胜天数 */
export const getDailyPuzzle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const day = todayKey();
    const { data: puzzleId, error } = await supabaseAdmin.rpc("pick_daily_puzzle", { p_day: day });
    if (error) throw new Error(error.message);
    if (!puzzleId) return { day, puzzle: null, streak: 0, bestStreak: 0, solvedToday: false };
    const row = await loadPuzzle(supabaseAdmin, puzzleId);
    const { data: prog } = await supabaseAdmin
      .from("puzzle_progress")
      .select("solved, attempts, best_ms")
      .eq("user_id", context.userId)
      .eq("puzzle_id", puzzleId)
      .maybeSingle();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("puzzle_streak, puzzle_best_streak, puzzle_last_day")
      .eq("id", context.userId)
      .maybeSingle();
    return {
      day,
      puzzle: toCard(row as PuzzleRow, prog as never),
      streak: profile?.puzzle_streak ?? 0,
      bestStreak: profile?.puzzle_best_streak ?? 0,
      solvedToday: profile?.puzzle_last_day === day,
    };
  });

export interface PuzzleMoveResult {
  correct: boolean;
  /** 答对后对手的应着（UCI），没有则为 null */
  reply: string | null;
  /** 本题是否已解完 */
  completed: boolean;
  /** 答错或解完时返回完整正解与讲解 */
  solution?: string[];
  explanationZh?: string;
  explanationEn?: string;
  reward?: { tp: number; diamonds: number; firstSolve: boolean; streak: number };
}

/** 逐步提交作答：服务端按正解校验，也接受同样将死的其他走法 */
export const submitPuzzleMove = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { puzzleId: number; moveIndex: number; uci: string; ms?: number; isDaily?: boolean }) => ({
    puzzleId: Number(input.puzzleId),
    moveIndex: Math.max(0, Math.floor(Number(input.moveIndex) || 0)),
    uci: String(input.uci).trim().slice(0, 5).toLowerCase(),
    ms: Math.max(0, Math.min(3_600_000, Math.floor(Number(input.ms) || 0))),
    isDaily: Boolean(input.isDaily),
  }))
  .handler(async ({ data, context }): Promise<PuzzleMoveResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const puzzle = await loadPuzzle(supabaseAdmin, data.puzzleId);
    if (!puzzle) throw new Error("puzzle not found");
    const { data: sol } = await supabaseAdmin
      .from("puzzle_solutions")
      .select("solution")
      .eq("puzzle_id", data.puzzleId)
      .maybeSingle();
    const solution = (sol?.solution ?? []) as string[];
    if (!solution.length) throw new Error("puzzle unavailable");

    // 回放正解前缀，得到当前应该由玩家走子的局面
    const game = new Chess(puzzle.fen);
    for (let i = 0; i < data.moveIndex && i < solution.length; i++) {
      const u = solution[i]!;
      try {
        game.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: (u.slice(4) || "q") as never });
      } catch {
        throw new Error("puzzle unavailable");
      }
    }

    const expected = solution[data.moveIndex];
    let correct = expected === data.uci;
    if (!correct) {
      // 其他能直接将死的走法同样算对
      const probe = new Chess(game.fen());
      try {
        probe.move({ from: data.uci.slice(0, 2), to: data.uci.slice(2, 4), promotion: (data.uci.slice(4) || "q") as never });
        correct = probe.isCheckmate();
      } catch {
        correct = false;
      }
    }

    const day = todayKey();
    if (!correct) {
      await supabaseAdmin.rpc("record_puzzle_result", {
        p_user_id: context.userId,
        p_puzzle_id: data.puzzleId,
        p_correct: false,
        p_ms: data.ms,
        p_is_daily: data.isDaily,
        p_day: day,
      });
      return {
        correct: false,
        reply: null,
        completed: false,
        solution,
        explanationZh: puzzle.explanation_zh,
        explanationEn: puzzle.explanation_en,
      };
    }

    const reply = solution[data.moveIndex + 1] ?? null;
    const completed = data.moveIndex + 1 >= solution.length || reply === null;
    if (!completed) {
      return { correct: true, reply, completed: false };
    }

    const { data: res } = await supabaseAdmin.rpc("record_puzzle_result", {
      p_user_id: context.userId,
      p_puzzle_id: data.puzzleId,
      p_correct: true,
      p_ms: data.ms,
      p_is_daily: data.isDaily,
      p_day: day,
    });
    const payload = (res ?? {}) as { tp?: number; diamonds?: number; first_solve?: boolean; streak?: number };
    return {
      correct: true,
      reply,
      completed: true,
      solution,
      explanationZh: puzzle.explanation_zh,
      explanationEn: puzzle.explanation_en,
      reward: {
        tp: payload.tp ?? 0,
        diamonds: payload.diamonds ?? 0,
        firstSolve: Boolean(payload.first_solve),
        streak: payload.streak ?? 0,
      },
    };
  });
