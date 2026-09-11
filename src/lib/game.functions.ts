import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
  cp: number;
  status: string;
  outcome: string | null;
  reason: string | null;
  rating_delta: number | null;
  last_move_at: string;
};

export interface ProfileRow {
  id: string;
  name: string;
  diamonds: number;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
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
  const scoreW = outcome === "white" ? 1 : outcome === "draw" ? 0.5 : 0;
  const delta = eloDelta(match.white_elo, match.black_elo, scoreW);
  await admin
    .from("matches")
    .update({ status: "over", outcome, reason, rating_delta: delta })
    .eq("id", match.id)
    .eq("status", "live");

  for (const side of ["w", "b"] as const) {
    const uid = side === "w" ? match.white_id : match.black_id;
    if (!uid) continue;
    const { data: p } = await admin.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (!p) continue;
    const prof = p as ProfileRow;
    const won = (side === "w" && outcome === "white") || (side === "b" && outcome === "black");
    const drew = outcome === "draw";
    const d = side === "w" ? delta : -delta;
    await admin
      .from("profiles")
      .update({
        elo: Math.max(100, prof.elo + d),
        wins: prof.wins + (won ? 1 : 0),
        losses: prof.losses + (!won && !drew ? 1 : 0),
        draws: prof.draws + (drew ? 1 : 0),
        streak: won ? prof.streak + 1 : 0,
        diamonds: prof.diamonds + (won ? 25 : drew ? 10 : 5),
        updated_at: new Date().toISOString(),
      })
      .eq("id", uid);
  }
  return delta;
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

    const elapsed = Date.now() - new Date(m.last_move_at).getTime();
    const before = you === "w" ? m.clock_w : m.clock_b;
    const remaining = before - elapsed;
    if (remaining <= 0) {
      const outcome = you === "w" ? "black" : "white";
      const delta = await settle(supabaseAdmin, { ...m, clock_w: you === "w" ? 0 : m.clock_w, clock_b: you === "b" ? 0 : m.clock_b }, outcome, "timeout");
      return { code: "timeout" as const, outcome, ratingDelta: delta };
    }

    const after = remaining + m.tc_inc;
    const clock_w = you === "w" ? after : m.clock_w;
    const clock_b = you === "b" ? after : m.clock_b;
    const seq = m.seq + 1;
    const ply = m.ply + 1;
    const now = new Date().toISOString();

    await supabaseAdmin.from("match_moves").insert({
      match_id: m.id,
      seq,
      ply,
      uci: data.uci,
      san: data.san,
      by: you,
      zh: data.zh ?? null,
      cp: data.cp ?? null,
      clock_w,
      clock_b,
    });

    const { data: updated } = await supabaseAdmin
      .from("matches")
      .update({
        clock_w,
        clock_b,
        turn: you === "w" ? "b" : "w",
        ply,
        seq,
        cp: data.cp ?? m.cp,
        last_move_at: now,
      })
      .eq("id", m.id)
      .select("*")
      .single();

    return { code: "ok" as const, match: updated as MatchRow, seq, ply, clock: { w: clock_w, b: clock_b } };
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
      .select("solution")
      .eq("level_id", data.levelId)
      .maybeSingle();
    if (!sol) throw new Error("level not found");

    const expected = (sol.solution as string[]).filter((_, i) => i % 2 === 0);
    const given = data.moves.filter(Boolean);
    const correct = expected.length === given.length && expected.every((m, i) => m === given[i]);

    const { data: level } = await supabaseAdmin
      .from("endgame_levels")
      .select("elo_reward, diamond_reward, elo_required")
      .eq("id", data.levelId)
      .maybeSingle();

    const { data: prev } = await supabaseAdmin
      .from("endgame_progress")
      .select("*")
      .eq("user_id", context.userId)
      .eq("level_id", data.levelId)
      .maybeSingle();

    const attempts = (prev?.attempts ?? 0) + 1;
    const firstSolve = correct && !prev?.solved;
    await supabaseAdmin.from("endgame_progress").upsert(
      {
        user_id: context.userId,
        level_id: data.levelId,
        attempts,
        solved: correct || Boolean(prev?.solved),
        best_ms: correct ? Math.min(prev?.best_ms ?? data.ms, data.ms) : (prev?.best_ms ?? null),
        solved_at: correct ? new Date().toISOString() : (prev?.solved_at ?? null),
      },
      { onConflict: "user_id,level_id" },
    );

    let profile: ProfileRow | null = null;
    if (firstSolve && level) {
      const { data: p } = await supabaseAdmin.from("profiles").select("*").eq("id", context.userId).maybeSingle();
      if (p) {
        const prof = p as ProfileRow;
        const { data: up } = await supabaseAdmin
          .from("profiles")
          .update({
            elo: prof.elo + level.elo_reward,
            diamonds: prof.diamonds + level.diamond_reward,
            updated_at: new Date().toISOString(),
          })
          .eq("id", context.userId)
          .select("*")
          .single();
        profile = (up as ProfileRow) ?? null;
      }
    }

    return {
      correct,
      firstSolve,
      attempts,
      expectedLength: expected.length,
      reward: firstSolve ? { elo: level?.elo_reward ?? 0, diamonds: level?.diamond_reward ?? 0 } : null,
      profile,
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
    .select("id, code, name_zh, name_en, brief_zh, brief_en, fen, objective_zh, objective_en, moves_to_mate, elo_required, elo_reward, diamond_reward")
    .order("id");
  return data ?? [];
});
