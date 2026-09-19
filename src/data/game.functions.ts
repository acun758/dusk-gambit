import { RANK_TIERS } from "@/lib/ranks";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Chess } from "chess.js";

/**
 * 服务端权威逻辑：玩家档案、3+2 天梯对局仲裁（时钟与胜负）、残局关卡校验。
 * 所有时钟计算都以数据库中的 last_move_at 为准，客户端时间只做插值显示。
 */

const BASE = 180_000;
const INC = 2_000;

/** 服务端只接受这四种赛制，其余一律回落到 3+2。 */
const ALLOWED_TC: { base: number; inc: number }[] = [
  { base: 60_000, inc: 0 },
  { base: 180_000, inc: 2_000 },
  { base: 600_000, inc: 0 },
  { base: 900_000, inc: 10_000 },
];

function normalizeTc(base?: number, inc?: number): { base: number; inc: number } {
  return ALLOWED_TC.find((t) => t.base === base && t.inc === inc) ?? { base: BASE, inc: INC };
}

export type MatchRow = {
  id: string;
  white_id: string | null;
  black_id: string | null;
  white_name: string;
  black_name: string;
  white_elo: number;
  black_elo: number;
  tc_base: number;
  tc_inc: number;
  clock_w: number;
  clock_b: number;
  turn: string;
  ply: number;
  seq: number;
  fen: string;
  cp: number;
  status: string;
  outcome: string | null;
  reason: string | null;
  rating_delta: number | null;
  black_delta?: number | null;
  draw_offer_by: string | null;
  last_move_at: string;
  white_piece_set: string;
  black_piece_set: string;
};

export interface ProfileRow {
  id: string;
  handle: string;
  name: string;
  diamonds: number;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  training_points: number;
  real_name?: string;
  avatar_key?: string;
  avatar_url?: string;
  verify_status?: string;
  id_tail?: string;
  verified_at?: string | null;
  equipped_piece_set?: string;
  /** 定级赛剩余局数：>0 表示仍在定级，段位暂不公开 */
  provisional_games?: number;
}

export interface FriendProfile extends ProfileRow {
  friendshipId: string;
  friendshipStatus: "pending" | "accepted" | "blocked";
  incoming: boolean;
}

/* --------------------------------- profile --------------------------------- */

export const loadProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("profiles").select("*").eq("id", context.userId).maybeSingle();
    if (data) return data as ProfileRow;
    const claims = context.claims as { email?: string } | undefined;
    const fallback = claims?.email?.split("@")[0] ?? "Sovereign";
    const handle = `player-${context.userId.replaceAll("-", "").slice(0, 8)}`;
    // 并发首登会同时建档，用 upsert 让重复写入直接忽略，再回读现有档案。
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: context.userId, name: fallback, handle }, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    const { data: created, error: readError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .single();
    if (readError) throw new Error(readError.message);
    return created as ProfileRow;
  });

export const renameProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string }) => ({ name: input.name.trim().slice(0, 24) || "Sovereign" }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update({ name: data.name, updated_at: new Date().toISOString() })
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as ProfileRow;
  });

/** 玩家自选头像：注册时选定，之后可随时更换。 */
export const saveAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { avatarKey: string }) => ({ avatarKey: input.avatarKey.trim().slice(0, 32) }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_key: data.avatarKey, updated_at: new Date().toISOString() })
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await Promise.all([
      supabaseAdmin.from("matches").update({ white_avatar_key: data.avatarKey }).eq("white_id", context.userId).in("status", ["waiting", "live"]),
      supabaseAdmin.from("matches").update({ black_avatar_key: data.avatarKey }).eq("black_id", context.userId).in("status", ["waiting", "live"]),
    ]);
    return row as ProfileRow;
  });

/** 自定义头像图片：客户端压缩后上传到私有桶，这里只记录对象路径。 */
export const saveAvatarImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) => ({ path: input.path.trim().slice(0, 200) }))
  .handler(async ({ data, context }) => {
    if (data.path && !data.path.startsWith(`${context.userId}/`)) throw new Error("invalid avatar path");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: data.path, updated_at: new Date().toISOString() })
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await Promise.all([
      supabaseAdmin.from("matches").update({ white_avatar_path: data.path }).eq("white_id", context.userId).in("status", ["waiting", "live"]),
      supabaseAdmin.from("matches").update({ black_avatar_path: data.path }).eq("black_id", context.userId).in("status", ["waiting", "live"]),
    ]);
    return row as ProfileRow;
  });

const PIECE_SET_IDS = new Set([
  "obsidian-sovereignty",
  "abyssal-legacy",
  "dark-dragon",
  "crimson-empress",
  "temple-judgment",
  "pale-court",
]);

/** 已登录玩家的装备以云端档案为准，保证换设备登录后仍保留。 */
export const saveEquipment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { pieceSetId: string }) => ({ pieceSetId: input.pieceSetId.trim().slice(0, 32) }))
  .handler(async ({ data, context }) => {
    if (!PIECE_SET_IDS.has(data.pieceSetId)) throw new Error("invalid piece set");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update({ equipped_piece_set: data.pieceSetId, updated_at: new Date().toISOString() })
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await Promise.all([
      supabaseAdmin.from("matches").update({ white_piece_set: data.pieceSetId }).eq("white_id", context.userId).in("status", ["waiting", "live"]),
      supabaseAdmin.from("matches").update({ black_piece_set: data.pieceSetId }).eq("black_id", context.userId).in("status", ["waiting", "live"]),
    ]);
    return row as ProfileRow;
  });

/* --------------------------- real-name verification ------------------------- */

const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CHECK = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

function validChineseId(id: string): boolean {
  const value = id.toUpperCase();
  if (!/^\d{17}[\dX]$/.test(value)) return false;
  const sum = ID_WEIGHTS.reduce((acc, w, i) => acc + Number(value[i]) * w, 0);
  return ID_CHECK[sum % 11] === value[17];
}

/**
 * 实名认证：先做姓名与身份证号格式（含校验位）校验，再调用实名核验接口。
 * 配置 ID_VERIFY_API_URL + ID_VERIFY_API_KEY 后走真实「姓名 + 身份证号」二要素核验；
 * 未配置时只能完成格式校验，返回 mode="checksum" 由前端中文提示说明。
 */
export const submitVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { realName: string; idNumber: string }) => ({
    realName: input.realName.trim().slice(0, 24),
    idNumber: input.idNumber.trim().toUpperCase().slice(0, 18),
  }))
  .handler(async ({ data, context }) => {
    if (data.realName.length < 2) throw new Error("请填写真实姓名（至少 2 个字）");
    if (!/^[\u4e00-\u9fa5·]{2,24}$|^[A-Za-z .'-]{2,24}$/.test(data.realName)) throw new Error("姓名格式不正确");
    if (!validChineseId(data.idNumber)) throw new Error("身份证号格式或校验位不正确");

    const endpoint = process.env["ID_VERIFY_API_URL"];
    const apiKey = process.env["ID_VERIFY_API_KEY"];
    let mode: "provider" | "checksum" = "checksum";
    if (endpoint && apiKey) {
      mode = "provider";
      let ok = false;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ name: data.realName, idCard: data.idNumber }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const body = (await res.json()) as { result?: number | string; success?: boolean; match?: boolean };
        ok = body.success === true || body.match === true || body.result === 0 || body.result === "0";
      } catch {
        throw new Error("实名核验服务暂时不可用，请稍后再试");
      }
      if (!ok) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("profiles")
          .update({ verify_status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", context.userId);
        throw new Error("姓名与身份证号不一致，实名核验未通过");
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update({
        real_name: data.realName,
        id_tail: data.idNumber.slice(-4),
        verify_status: "verified",
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { profile: row as ProfileRow, mode };
  });


/* ---------------------------------- match ---------------------------------- */

export const findMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input?: { tcBase?: number; tcInc?: number }) => input ?? {})
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tc = normalizeTc(data?.tcBase, data?.tcInc);
    const { data: rows, error } = await supabaseAdmin.rpc("find_or_create_ranked_match", {
      p_user_id: context.userId,
      p_tc_base: tc.base,
      p_tc_inc: tc.inc,
    });
    if (error) throw new Error(error.message);
    const picked = rows?.[0];
    if (!picked) throw new Error("match unavailable");
    const { data: match, error: matchError } = await supabaseAdmin.from("matches").select("*").eq("id", picked.match_id).single();
    if (matchError) throw new Error(matchError.message);
    return { match: match as MatchRow, you: picked.side as "w" | "b" };
  });

export const cancelWaitingMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cancelled, error } = await supabaseAdmin.rpc("cancel_waiting_match", {
      p_user_id: context.userId,
      p_match_id: data.matchId,
    });
    if (error) throw new Error(error.message);
    return { cancelled: Boolean(cancelled) };
  });

export const getMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string; lastSeq?: number }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: match } = await supabaseAdmin.from("matches").select("*").eq("id", data.matchId).maybeSingle();
    if (!match) throw new Error("match not found");
    const m = match as MatchRow;
    if (m.white_id !== context.userId && m.black_id !== context.userId) throw new Error("forbidden");
    const { data: moves } = await supabaseAdmin
      .from("match_moves")
      .select("*")
      .eq("match_id", data.matchId)
      .gt("seq", data.lastSeq ?? 0)
      .order("seq", { ascending: true });
    const avatars = await matchAvatars(supabaseAdmin, match as unknown as Parameters<typeof matchAvatars>[1]);
    const pieceSets = await matchPieceSets(supabaseAdmin, match as unknown as Parameters<typeof matchPieceSets>[1]);
    return {
      match: { ...m, white_piece_set: pieceSets.w, black_piece_set: pieceSets.b },
      moves: moves ?? [],
      you: m.white_id === context.userId ? ("w" as const) : ("b" as const),
      avatars,
    };
  });

async function settle(
  admin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"],
  match: MatchRow,
  outcome: "white" | "black" | "draw",
  reason: string,
) {
  const { data, error } = await admin.rpc("settle_ranked_match", {
    p_match_id: match.id,
    p_outcome: outcome,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
  const result = data as { settled?: boolean; rating_delta?: number; black_delta?: number } | null;
  if (!result?.settled) return { w: 0, b: 0 };
  return { w: result.rating_delta ?? 0, b: result.black_delta ?? 0 };
}

export const submitMove = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string; uci: string; san: string; zh?: string; cp?: number }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("matches").select("*").eq("id", data.matchId).maybeSingle();
    if (!row) throw new Error("match not found");
    const m = row as MatchRow;
    const you = m.white_id === context.userId ? "w" : m.black_id === context.userId ? "b" : null;
    if (!you) throw new Error("forbidden");
    if (m.status !== "live") return { code: "stale" as const, match: m };
    if (m.turn !== you) return { code: "not_your_turn" as const, match: m };

    const chess = new Chess(m.fen);
    let move;
    try {
      const promotion = data.uci[4];
      move = chess.move({ from: data.uci.slice(0, 2), to: data.uci.slice(2, 4), ...(promotion ? { promotion } : {}) });
    } catch {
      return { code: "illegal" as const, match: m };
    }
    if (!move) return { code: "illegal" as const, match: m };
    const outcome = chess.isCheckmate() ? (you === "w" ? "white" : "black") : chess.isDraw() ? "draw" : null;
    const reason = chess.isCheckmate() ? "mate" : chess.isDraw() ? "draw" : null;
    const rpcArgs = {
      p_match_id: m.id,
      p_user_id: context.userId,
      p_expected_seq: m.seq,
      p_uci: data.uci,
      p_san: move.san,
      p_zh: data.zh ?? "",
      p_cp: Math.max(-1500, Math.min(1500, Math.round(data.cp ?? m.cp ?? 0))),
      p_fen: chess.fen(),
      ...(outcome ? { p_outcome: outcome } : {}),
      ...(reason ? { p_reason: reason } : {}),
    };
    const { data: applied, error } = await supabaseAdmin.rpc("apply_ranked_move", rpcArgs);
    if (error) throw new Error(error.message);
    const result = applied as { code: string; seq?: number; ply?: number; clock_w?: number; clock_b?: number };
    const fresh = await supabaseAdmin.from("matches").select("*").eq("id", m.id).single();
    return { ...result, match: fresh.data as MatchRow, clock: { w: result.clock_w ?? m.clock_w, b: result.clock_b ?? m.clock_b } };
  });

export const resignMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("matches").select("*").eq("id", data.matchId).maybeSingle();
    if (!row) throw new Error("match not found");
    const m = row as MatchRow;
    const you = m.white_id === context.userId ? "w" : m.black_id === context.userId ? "b" : null;
    if (!you) throw new Error("forbidden");
    const outcome = you === "w" ? "black" : "white";
    const delta = await settle(supabaseAdmin, m, outcome, "resign");
    return { outcome, ratingDelta: delta[you] };
  });

/**
 * 求和：提出 / 撤回。服务端只记录“谁在求和”，是否成立由对手回应决定。
 * 和棋结算仍然只走 settle_ranked_match，前端无权自行判和。
 */
export const offerDraw = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string; cancel?: boolean }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("matches").select("*").eq("id", data.matchId).maybeSingle();
    if (!row) throw new Error("match not found");
    const m = row as MatchRow;
    const you = m.white_id === context.userId ? "w" : m.black_id === context.userId ? "b" : null;
    if (!you) throw new Error("forbidden");
    if (m.status !== "live") return { code: "stale" as const };
    const next = data.cancel ? null : you;
    if (!data.cancel && m.draw_offer_by && m.draw_offer_by !== you) {
      // 对手已在求和，这一次视为接受
      const delta = await settle(supabaseAdmin, m, "draw", "agreement");
      return { code: "agreed" as const, ratingDelta: delta[you] };
    }
    await supabaseAdmin.from("matches").update({ draw_offer_by: next }).eq("id", m.id);
    return { code: data.cancel ? ("cancelled" as const) : ("offered" as const) };
  });

/** 回应求和：同意则按和棋结算，拒绝只清除请求。 */
export const respondDraw = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string; accept: boolean }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("matches").select("*").eq("id", data.matchId).maybeSingle();
    if (!row) throw new Error("match not found");
    const m = row as MatchRow;
    const you = m.white_id === context.userId ? "w" : m.black_id === context.userId ? "b" : null;
    if (!you) throw new Error("forbidden");
    if (m.status !== "live") return { code: "stale" as const };
    if (!m.draw_offer_by || m.draw_offer_by === you) return { code: "no_offer" as const };
    if (!data.accept) {
      await supabaseAdmin.from("matches").update({ draw_offer_by: null }).eq("id", m.id);
      return { code: "declined" as const };
    }
    const delta = await settle(supabaseAdmin, m, "draw", "agreement");
    await supabaseAdmin.from("matches").update({ draw_offer_by: null }).eq("id", m.id);
    return { code: "agreed" as const, ratingDelta: delta[you] };
  });


/** 客户端心跳：让服务端在超时时判负，无需常驻进程。 */
export const claimTimeout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("matches").select("*").eq("id", data.matchId).maybeSingle();
    if (!row) throw new Error("match not found");
    const m = row as MatchRow;
    const viewer = m.white_id === context.userId ? "w" : "b";
    if (m.white_id !== context.userId && m.black_id !== context.userId) throw new Error("forbidden");
    if (m.status !== "live") return { expired: false };
    const elapsed = Date.now() - new Date(m.last_move_at).getTime();
    const remaining = (m.turn === "w" ? m.clock_w : m.clock_b) - elapsed;
    if (remaining > 0) return { expired: false, remaining };
    const outcome = m.turn === "w" ? "black" : "white";
    const delta = await settle(supabaseAdmin, m, outcome, "timeout");
    return { expired: true, outcome, ratingDelta: delta[viewer] };
  });

/* --------------------------------- endgame --------------------------------- */

export const submitEndgame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { levelId: number; moves: string[]; ms: number }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sol } = await supabaseAdmin
      .from("endgame_solutions")
      .select("solution, alternate_solutions")
      .eq("level_id", data.levelId)
      .maybeSingle();
    if (!sol) throw new Error("level not found");

    const expected = sol.solution as string[];
    const given = data.moves.filter(Boolean);
    const candidates = [expected, ...((sol.alternate_solutions as string[][] | null) ?? [])];

    const { data: level } = await supabaseAdmin
      .from("endgame_levels")
      .select("fen, elo_reward, diamond_reward, elo_required, explanation_zh, explanation_en, move_annotations")
      .eq("id", data.levelId)
      .maybeSingle();

    if (!level) throw new Error("level not found");
    const legal = candidates.some((line) => {
      if (line.length !== given.length || !line.every((m, i) => m === given[i])) return false;
      try {
        const chess = new Chess(level.fen);
        for (const uci of line) {
          const promotion = uci[4];
          chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(promotion ? { promotion } : {}) });
        }
        return true;
      } catch { return false; }
    });
    const correct = legal;
    const { data: recorded, error: recordError } = await supabaseAdmin.rpc("record_endgame_result", {
      p_user_id: context.userId, p_level_id: data.levelId, p_correct: correct, p_ms: Math.max(0, data.ms),
    });
    if (recordError) throw new Error(recordError.message);
    const record = recorded as { first_solve?: boolean; attempts?: number } | null;
    const firstSolve = Boolean(record?.first_solve);
    const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", context.userId).maybeSingle();

    return {
      correct,
      firstSolve,
      attempts: record?.attempts ?? 1,
      expectedLength: expected.length,
      reward: firstSolve ? { trainingPoints: level?.elo_reward ?? 0, diamonds: level?.diamond_reward ?? 0 } : null,
      profile: profile as ProfileRow | null,
      explanation: { zh: level.explanation_zh, en: level.explanation_en, annotations: level.move_annotations },
    };
  });

/** 可视残局：服务端验证最终确为将死，再持久化逐手评分与通关状态。 */
export const submitEndgameDrill = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { levelId: number; moves: string[]; ms: number; score: number; review: Record<string, string | number>[] }) => ({
    levelId: input.levelId,
    moves: input.moves.slice(0, 80),
    ms: Math.max(0, input.ms),
    score: Math.max(0, Math.min(100, Math.round(input.score))),
    review: input.review.slice(0, 40),
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: level } = await supabaseAdmin.from("endgame_levels").select("fen").eq("id", data.levelId).maybeSingle();
    if (!level) throw new Error("level not found");
    const chess = new Chess(level.fen);
    const startingSide = chess.turn();
    try {
      for (const uci of data.moves) {
        const promotion = uci[4];
        chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(promotion ? { promotion } : {}) });
      }
    } catch {
      throw new Error("illegal drill line");
    }
    const correct = chess.isCheckmate() && chess.turn() !== startingSide;
    const { data: recorded, error } = await supabaseAdmin.rpc("record_endgame_result", {
      p_user_id: context.userId, p_level_id: data.levelId, p_correct: correct, p_ms: data.ms,
    });
    if (error) throw new Error(error.message);
    if (correct) {
      const { data: current } = await supabaseAdmin.from("endgame_progress")
        .select("best_score").eq("user_id", context.userId).eq("level_id", data.levelId).single();
      await supabaseAdmin.from("endgame_progress").update({
        best_score: Math.max(current?.best_score ?? 0, data.score),
        last_review: data.review,
      }).eq("user_id", context.userId).eq("level_id", data.levelId);
    }
    return { correct, ...(recorded as Record<string, unknown> | null) };
  });

export const loadEndgameProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("endgame_progress")
      .select("level_id, solved, attempts, best_ms, best_score, last_review")
      .eq("user_id", context.userId);
    return data ?? [];
  });

/** 公开读取残局关卡（不含解法），未登录也能浏览。 */
export const listEndgameLevels = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  const client = createClient(process.env['SUPABASE_URL']!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data } = await client
    .from("endgame_levels")
    .select("id, code, name_zh, name_en, brief_zh, brief_en, fen, objective_zh, objective_en, moves_to_mate, elo_required, elo_reward, diamond_reward, depth, theme_zh, theme_en, hint_zh, hint_en, explanation_zh, explanation_en")
    .order("id");
  return data ?? [];
});

/* -------------------------------- friends -------------------------------- */

export const searchPlayers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { query: string }) => ({ query: input.query.trim().slice(0, 24) }))
  .handler(async ({ data, context }) => {
    if (data.query.length < 2) return [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const term = data.query.replaceAll("%", "\\%").replaceAll("_", "\\_");
    const { data: rows, error } = await supabaseAdmin.from("profiles")
      .select("id,handle,name,elo,diamonds,wins,losses,draws")
      .neq("id", context.userId)
      .or(`handle.ilike.${term}%,name.ilike.${term}%`)
      .order("elo", { ascending: false }).limit(20);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const loadFriends = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: links } = await supabaseAdmin.from("friendships").select("*").or(`requester_id.eq.${context.userId},addressee_id.eq.${context.userId}`);
    const ids = (links ?? []).map((f) => f.requester_id === context.userId ? f.addressee_id : f.requester_id);
    if (!ids.length) return [];
    const { data: profiles } = await supabaseAdmin.from("profiles").select("*").in("id", ids);
    return (links ?? []).map((f) => {
      const p = (profiles ?? []).find((x) => x.id === (f.requester_id === context.userId ? f.addressee_id : f.requester_id));
      return p ? { ...p, friendshipId: f.id, friendshipStatus: f.status, incoming: f.addressee_id === context.userId } : null;
    }).filter(Boolean) as FriendProfile[];
  });

export const requestFriend = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("send_friend_request", { p_user_id: context.userId, p_target_id: data.userId });
    if (error) throw new Error(error.message); return { ok: true };
  });

export const respondFriend = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: { friendshipId: string; accept: boolean }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("respond_friend_request", { p_user_id: context.userId, p_friendship_id: data.friendshipId, p_accept: data.accept });
    if (error) throw new Error(error.message); return { ok: Boolean(ok) };
  });

export const createDuelInvite = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: { invitedId?: string; tcBase?: number; tcInc?: number }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tc = normalizeTc(data.tcBase, data.tcInc);
    const args = {
      p_user_id: context.userId,
      p_tc_base: tc.base,
      p_tc_inc: tc.inc,
      ...(data.invitedId ? { p_invited_id: data.invitedId } : {}),
    };
    const { data: rows, error } = await supabaseAdmin.rpc("create_match_invite", args);
    if (error) throw new Error(error.message); return rows?.[0] ?? null;
  });

export const joinDuelInvite = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => ({ code: input.code.trim().toUpperCase().slice(0, 8) }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: matchId, error } = await supabaseAdmin.rpc("join_match_invite", { p_user_id: context.userId, p_code: data.code });
    if (error) throw new Error(error.message); return { matchId };
  });

/* -------------------------------- review ---------------------------------- */

export interface MatchSummary {
  id: string;
  you: "w" | "b";
  opponent: string;
  opponentElo: number;
  status: string;
  outcome: string | null;
  reason: string | null;
  ply: number;
  ratingDelta: number | null;
  playedAt: string;
}

/** 我的对局历史，供复盘页选择。 */
export const listMyMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("matches")
      .select("*")
      .or(`white_id.eq.${context.userId},black_id.eq.${context.userId}`)
      .order("last_move_at", { ascending: false })
      .limit(20);
    const rows = (data ?? []) as MatchRow[];
    return rows.map<MatchSummary>((m) => {
      const you = m.white_id === context.userId ? ("w" as const) : ("b" as const);
      return {
        id: m.id,
        you,
        opponent: you === "w" ? m.black_name : m.white_name,
        opponentElo: you === "w" ? m.black_elo : m.white_elo,
        status: m.status,
        outcome: m.outcome,
        reason: m.reason,
        ply: m.ply,
        ratingDelta: you === "w"
          ? m.rating_delta
          : m.black_delta ?? (m.rating_delta === null ? null : -m.rating_delta),
        playedAt: m.last_move_at,
      };
    });
  });

/* ------------------------------ ladder & live ------------------------------ */

type AdminClient = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

/** 私有头像桶里的对象路径换成可直接显示的签名链接（对手 / 榜单也能看到）。 */
async function signAvatars(admin: AdminClient, paths: (string | null | undefined)[]): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  const out = new Map<string, string>();
  if (!unique.length) return out;
  const { data } = await admin.storage.from("avatars").createSignedUrls(unique, 60 * 60);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) out.set(item.path, item.signedUrl);
  }
  return out;
}

export interface LadderRow {
  id: string;
  handle: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  games: number;
  winRate: number;
  avatarKey: string;
  avatarUrl: string | null;
}

/**
 * 天梯榜：名次由真实对局数据决定 —— 胜率（含和棋半分，局数少时向 50% 回归）为主，
 * 局数与积分依次做后手排序；没有任何对局的玩家排在最后。每次结算后榜单即时变化。
 */
export const listLadder = createServerFn({ method: "GET" }).handler(async (): Promise<LadderRow[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,handle,name,elo,wins,losses,draws,streak,avatar_key,avatar_url")
    .order("elo", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const signed = await signAvatars(supabaseAdmin, rows.map((r) => r.avatar_url));

  const score = (r: { wins: number; losses: number; draws: number }) => {
    const games = r.wins + r.losses + r.draws;
    if (games === 0) return -1;
    // 拉普拉斯平滑：局数少时胜率向 50% 回归，打满局数后真实胜率才完全体现
    return (r.wins + r.draws * 0.5 + 2) / (games + 4);
  };

  return rows
    .map((r) => {
      const games = r.wins + r.losses + r.draws;
      return {
        id: r.id,
        handle: r.handle,
        name: r.name,
        elo: r.elo,
        wins: r.wins,
        losses: r.losses,
        draws: r.draws,
        streak: r.streak,
        games,
        winRate: games === 0 ? 0 : Math.round((r.wins / games) * 1000) / 10,
        avatarKey: r.avatar_key ?? "",
        avatarUrl: signed.get(r.avatar_url ?? "") ?? null,
      };
    })
    .sort((a, b) => score(b) - score(a) || b.games - a.games || b.elo - a.elo)
    .slice(0, 50);
});

export interface MatchAvatar {
  key: string;
  url: string | null;
}

/**
 * 对局头像快照：开局后第一次读取时把双方当时的头像写进对局记录，
 * 之后即使玩家换了头像，这一局的复盘仍然显示当时的头像。
 */
async function matchAvatars(
  admin: AdminClient,
  match: { id: string; white_id: string | null; black_id: string | null; status: string;
    white_avatar_key?: string; black_avatar_key?: string; white_avatar_path?: string; black_avatar_path?: string },
): Promise<{ w: MatchAvatar; b: MatchAvatar }> {
  let wKey = match.white_avatar_key ?? "";
  let bKey = match.black_avatar_key ?? "";
  let wPath = match.white_avatar_path ?? "";
  let bPath = match.black_avatar_path ?? "";

  if (match.status !== "over" || (!wKey && !wPath) || (!bKey && !bPath)) {
    const ids = [match.white_id, match.black_id].filter(Boolean) as string[];
    if (ids.length) {
      const { data: profiles } = await admin.from("profiles").select("id,avatar_key,avatar_url").in("id", ids);
      const pick = (id: string | null) => (profiles ?? []).find((p) => p.id === id) ?? null;
      const w = pick(match.white_id);
      const b = pick(match.black_id);
      wKey = w?.avatar_key ?? wKey;
      wPath = w?.avatar_url ?? wPath;
      bKey = b?.avatar_key ?? bKey;
      bPath = b?.avatar_url ?? bPath;
      await admin
        .from("matches")
        .update({ white_avatar_key: wKey, black_avatar_key: bKey, white_avatar_path: wPath, black_avatar_path: bPath })
        .eq("id", match.id);
    }
  }

  const signed = await signAvatars(admin, [wPath, bPath]);
  return {
    w: { key: wKey, url: signed.get(wPath) ?? null },
    b: { key: bKey, url: signed.get(bPath) ?? null },
  };
}

async function matchPieceSets(
  admin: AdminClient,
  match: { id: string; white_id: string | null; black_id: string | null; status: string; white_piece_set?: string; black_piece_set?: string },
): Promise<{ w: string; b: string }> {
  let w = match.white_piece_set || "sovereign";
  let b = match.black_piece_set || "sovereign";
  if (match.status !== "over") {
    const ids = [match.white_id, match.black_id].filter(Boolean) as string[];
    const { data: profiles } = ids.length
      ? await admin.from("profiles").select("id,equipped_piece_set").in("id", ids)
      : { data: [] as { id: string; equipped_piece_set: string }[] };
    w = profiles?.find((p) => p.id === match.white_id)?.equipped_piece_set || w;
    b = profiles?.find((p) => p.id === match.black_id)?.equipped_piece_set || b;
    await admin.from("matches").update({ white_piece_set: w, black_piece_set: b }).eq("id", match.id);
  }
  return { w, b };
}

/** 对局双方的实时积分、战绩与头像，用于每一步同步显示。 */
export const getMatchRatings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("matches")
      .select("id,white_id,black_id,rating_delta,black_delta,status,outcome,white_avatar_key,black_avatar_key,white_avatar_path,black_avatar_path,white_piece_set,black_piece_set")
      .eq("id", data.matchId)
      .maybeSingle();
    if (!row) throw new Error("match not found");
    if (row.white_id !== context.userId && row.black_id !== context.userId) throw new Error("forbidden");
    const ids = [row.white_id, row.black_id].filter(Boolean) as string[];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id,elo,wins,losses,draws,streak,diamonds,equipped_piece_set")
      .in("id", ids);
    const avatars = await matchAvatars(supabaseAdmin, row);
    const pieceSets = await matchPieceSets(supabaseAdmin, row);
    const pick = (id: string | null, side: "w" | "b") => {
      const p = (profiles ?? []).find((x) => x.id === id);
      if (!p) return null;
      return { ...p, avatarKey: avatars[side].key, avatarUrl: avatars[side].url, pieceSetId: pieceSets[side] };
    };
    return {
      w: pick(row.white_id, "w"),
      b: pick(row.black_id, "b"),
      ratingDelta: row.white_id === context.userId
        ? row.rating_delta
        : row.black_delta ?? (row.rating_delta === null ? null : -row.rating_delta),
      status: row.status,
      outcome: row.outcome,
    };
  });


/** 重连恢复：返回我当前未结束的天梯对局（含全部着法），积分不会因断线丢失。 */
export const getActiveMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("matches")
      .select("*")
      .or(`white_id.eq.${context.userId},black_id.eq.${context.userId}`)
      .in("status", ["waiting", "live"])
      .order("last_move_at", { ascending: false })
      .limit(1);
    const match = (data ?? [])[0] as MatchRow | undefined;
    if (!match) return null;
    const { data: moves } = await supabaseAdmin
      .from("match_moves")
      .select("*")
      .eq("match_id", match.id)
      .order("seq", { ascending: true });
    return { match, moves: moves ?? [], you: match.white_id === context.userId ? ("w" as const) : ("b" as const) };
  });

/* ------------------------------ duel lobby -------------------------------- */

export interface LobbyInvite {
  code: string;
  hostId: string;
  hostName: string;
  hostHandle: string;
  hostElo: number;
  targeted: boolean;
  expiresAt: string;
}

/** 对弈大厅：我收到的点名邀请 + 其他玩家公开的对战码，10 秒轮询即可看到有人在约战。 */
export const listDuelInvites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ incoming: LobbyInvite[]; open: LobbyInvite[]; mine: LobbyInvite | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nowIso = new Date().toISOString();
    const { data: rows } = await supabaseAdmin
      .from("match_invites")
      .select("code,host_id,invited_id,status,expires_at")
      .eq("status", "open")
      .gt("expires_at", nowIso)
      .order("expires_at", { ascending: true })
      .limit(60);
    const invites = rows ?? [];
    const hostIds = [...new Set(invites.map((r) => r.host_id))];
    const { data: hosts } = hostIds.length
      ? await supabaseAdmin.from("profiles").select("id,name,handle,elo").in("id", hostIds)
      : { data: [] as { id: string; name: string; handle: string; elo: number }[] };
    const shape = (r: (typeof invites)[number]): LobbyInvite => {
      const h = (hosts ?? []).find((p) => p.id === r.host_id);
      return {
        code: r.code,
        hostId: r.host_id,
        hostName: h?.name ?? "无名挑战者",
        hostHandle: h?.handle ?? "",
        hostElo: h?.elo ?? 0,
        targeted: Boolean(r.invited_id),
        expiresAt: r.expires_at,
      };
    };
    return {
      incoming: invites.filter((r) => r.invited_id === context.userId).map(shape),
      open: invites.filter((r) => r.host_id !== context.userId && !r.invited_id).map(shape),
      mine: invites.filter((r) => r.host_id === context.userId).map(shape)[0] ?? null,
    };
  });

/** 实名填写：约战与天梯对局前记录真实姓名，仅自己与服务端可见。 */
export const saveRealName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { realName: string }) => ({ realName: input.realName.trim().slice(0, 24) }))
  .handler(async ({ data, context }) => {
    if (data.realName.length < 2) throw new Error("real name too short");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update({ real_name: data.realName, updated_at: new Date().toISOString() })
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as ProfileRow;
  });

/** 退出登录前清除实名；积分与历史战绩保留在账号中。 */
export const clearRealName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row, error } = await context.supabase
      .from("profiles")
      .update({ real_name: "", updated_at: new Date().toISOString() })
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as ProfileRow;
  });

/* ------------------------------ lobby stats ------------------------------- */

export interface LobbyStats {
  online: number;
  queueing: number;
  openInvites: number;
  tiers: { tier: string; tierZh: string; count: number }[];
  recent: { id: string; white: string; black: string; outcome: string | null; ratingDelta: number | null; playedAt: string }[];
}

const TIER_BUCKETS: { min: number; tier: string; tierZh: string }[] = RANK_TIERS.map((r) => ({
  min: r.floor,
  tier: r.en,
  tierZh: r.zh,
}));

/** 约战大厅概况：在线人数、排队人数、段位分布与最近战报。 */
export const getLobbyStats = createServerFn({ method: "GET" }).handler(async (): Promise<LobbyStats> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();
  const activeSince = new Date(Date.now() - 10 * 60_000).toISOString();

  const [{ data: profiles }, { data: waiting }, { data: invites }, { data: recentRows }] = await Promise.all([
    supabaseAdmin.from("profiles").select("elo,updated_at").limit(500),
    supabaseAdmin.from("matches").select("id").eq("status", "waiting"),
    supabaseAdmin.from("match_invites").select("code").eq("status", "open").gt("expires_at", nowIso),
    supabaseAdmin.from("matches").select("id,white_name,black_name,outcome,rating_delta,last_move_at,status")
      .eq("status", "over").order("last_move_at", { ascending: false }).limit(8),
  ]);

  const rows = profiles ?? [];
  const tiers = TIER_BUCKETS.map((b) => ({
    tier: b.tier,
    tierZh: b.tierZh,
    count: rows.filter((p) => p.elo >= b.min && p.elo < (TIER_BUCKETS.find((x) => x.min > b.min && x.min === Math.min(...TIER_BUCKETS.filter((y) => y.min > b.min).map((y) => y.min)))?.min ?? Infinity)).length,
  }));

  return {
    online: rows.filter((p) => p.updated_at >= activeSince).length,
    queueing: (waiting ?? []).length,
    openInvites: (invites ?? []).length,
    tiers,
    recent: (recentRows ?? []).map((m) => ({
      id: m.id,
      white: m.white_name,
      black: m.black_name,
      outcome: m.outcome,
      ratingDelta: m.rating_delta,
      playedAt: m.last_move_at,
    })),
  };
});

/* ----------------------------- promotion series ---------------------------- */

export interface PromotionSeries {
  id: string;
  fromFloor: number;
  toFloor: number;
  wins: number;
  losses: number;
  requiredWins: number;
  maxLosses: number;
  status: string;
  createdAt: string;
}

export interface PromotionRival {
  id: string;
  name: string;
  handle: string;
  elo: number;
  toFloor: number;
  wins: number;
  losses: number;
}

/** 我的晋升挑战赛状态（三局两胜）与最近一次结果。 */
export const getPromotionSeries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ active: PromotionSeries | null; last: PromotionSeries | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("promotion_series")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(5);
    const shape = (r: Record<string, unknown>): PromotionSeries => ({
      id: r['id'] as string,
      fromFloor: r['from_floor'] as number,
      toFloor: r['to_floor'] as number,
      wins: r['wins'] as number,
      losses: r['losses'] as number,
      requiredWins: r['required_wins'] as number,
      maxLosses: r['max_losses'] as number,
      status: r['status'] as string,
      createdAt: r['created_at'] as string,
    });
    const rows = (data ?? []).map(shape);
    return {
      active: rows.find((r) => r.status === "active") ?? null,
      last: rows.find((r) => r.status !== "active") ?? null,
    };
  });

/** 正在争夺晋升资格的段位相近者，可直接点名约战。 */
export const listPromotionRivals = createServerFn({ method: "GET" }).handler(async (): Promise<PromotionRival[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("promotion_series")
    .select("user_id,to_floor,wins,losses")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id,name,handle,elo")
    .in("id", rows.map((r) => r.user_id));
  return rows
    .map((r) => {
      const p = (profiles ?? []).find((x) => x.id === r.user_id);
      return p ? { id: p.id, name: p.name, handle: p.handle, elo: p.elo, toFloor: r.to_floor, wins: r.wins, losses: r.losses } : null;
    })
    .filter(Boolean) as PromotionRival[];
});
