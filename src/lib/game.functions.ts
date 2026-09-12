import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Chess } from "chess.js";

/**
 * 服务端权威逻辑：玩家档案、3+2 天梯对局仲裁（时钟与胜负）、残局关卡校验。
 * 所有时钟计算都以数据库中的 last_move_at 为准，客户端时间只做插值显示。
 */

const BASE = 180_000;
const INC = 2_000;

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
  last_move_at: string;
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
}

export interface FriendProfile extends ProfileRow {
  friendshipId: string;
  friendshipStatus: "pending" | "accepted" | "blocked";
  incoming: boolean;
}

function eloDelta(mine: number, theirs: number, score: number): number {
  const expected = 1 / (1 + Math.pow(10, (theirs - mine) / 400));
  return Math.round(24 * (score - expected));
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
    const { data: created, error } = await supabaseAdmin
      .from("profiles")
      .insert({ id: context.userId, name: fallback, handle })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
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

/* ---------------------------------- match ---------------------------------- */

export const findMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: me } = await supabaseAdmin.from("profiles").select("*").eq("id", context.userId).maybeSingle();
    const profile = (me as ProfileRow | null) ?? { name: "Sovereign", elo: 2480 };

    const { data: open } = await supabaseAdmin
      .from("matches")
      .select("*")
      .eq("status", "waiting")
      .is("black_id", null)
      .neq("white_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(1);

    const waiting = (open?.[0] ?? null) as MatchRow | null;
    if (waiting) {
      const { data: joined, error } = await supabaseAdmin
        .from("matches")
        .update({
          black_id: context.userId,
          black_name: profile.name,
          black_elo: profile.elo,
          status: "live",
          last_move_at: new Date().toISOString(),
        })
        .eq("id", waiting.id)
        .eq("status", "waiting")
        .select("*")
        .single();
      if (!error && joined) return { match: joined as MatchRow, you: "b" as const };
    }

    const { data: created, error: createErr } = await supabaseAdmin
      .from("matches")
      .insert({
        white_id: context.userId,
        white_name: profile.name,
        white_elo: profile.elo,
        tc_base: BASE,
        tc_inc: INC,
        clock_w: BASE,
        clock_b: BASE,
        status: "waiting",
      })
      .select("*")
      .single();
    if (createErr) throw new Error(createErr.message);
    return { match: created as MatchRow, you: "w" as const };
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
    return { match: m, moves: moves ?? [], you: m.white_id === context.userId ? ("w" as const) : ("b" as const) };
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
  const result = data as { settled?: boolean; rating_delta?: number } | null;
  return result?.settled ? (result.rating_delta ?? 0) : 0;
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
      p_cp: data.cp ?? m.cp,
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
    return { outcome, ratingDelta: delta };
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
    if (m.white_id !== context.userId && m.black_id !== context.userId) throw new Error("forbidden");
    if (m.status !== "live") return { expired: false };
    const elapsed = Date.now() - new Date(m.last_move_at).getTime();
    const remaining = (m.turn === "w" ? m.clock_w : m.clock_b) - elapsed;
    if (remaining > 0) return { expired: false, remaining };
    const outcome = m.turn === "w" ? "black" : "white";
    const delta = await settle(supabaseAdmin, m, outcome, "timeout");
    return { expired: true, outcome, ratingDelta: delta };
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
      reward: firstSolve ? { elo: level?.elo_reward ?? 0, diamonds: level?.diamond_reward ?? 0 } : null,
      profile: profile as ProfileRow | null,
      explanation: { zh: level.explanation_zh, en: level.explanation_en, annotations: level.move_annotations },
    };
  });

export const loadEndgameProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("endgame_progress")
      .select("level_id, solved, attempts, best_ms")
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
    .select("id, code, name_zh, name_en, brief_zh, brief_en, fen, objective_zh, objective_en, moves_to_mate, elo_required, elo_reward, diamond_reward, depth, theme_zh, theme_en, hint_zh, hint_en")
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
  .inputValidator((input: { invitedId?: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const args = { p_user_id: context.userId, ...(data.invitedId ? { p_invited_id: data.invitedId } : {}) };
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
        ratingDelta: m.rating_delta,
        playedAt: m.last_move_at,
      };
    });
  });
