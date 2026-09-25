import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * 王座资格、资格赛与公示：计算只在数据库函数里做（服务端权威）。
 * 三关：王段 ≥2500、本赛季有效局 ≥50（非中止、≥10 手）、综合评分。
 * 综合评分 = 胜率×40 + min(局数/50,1)×30 + min(复盘/50,1)×20 + 每日挑战完成率×10。
 * 前两关达标即自动入围，开 30 天资格赛窗口；窗口内有效局胜 1 / 和 0.5 / 负 0，
 * 与天梯分分开。最终排名：资格赛分 → 胜率 → 有效局数 → 复盘次数 → 更早达成王段。
 */
export interface ThroneRow {
  userId: string;
  name: string;
  elo: number;
  validGames: number;
  wins: number;
  winRate: number;
  reviewCount: number;
  dailyRate: number;
  gateRank: boolean;
  gateGames: boolean;
  qualified: boolean;
  score: number;
  ptsWin: number;
  ptsGames: number;
  ptsReview: number;
  ptsDaily: number;
  qualifiedAt: string | null;
  windowEnd: string | null;
  qGames: number;
  qWins: number;
  qDraws: number;
  qLosses: number;
  qPoints: number;
  kingReachedAt: string | null;
  updatedAt: string;
}

const COLS =
  "user_id,name,elo,valid_games,wins,win_rate,review_count,daily_rate,gate_rank,gate_games,qualified,score,pts_win,pts_games,pts_review,pts_daily,qualified_at,window_end,q_games,q_wins,q_draws,q_losses,q_points,king_reached_at,updated_at";

type Raw = Record<string, unknown>;
const n = (v: unknown) => Number(v ?? 0);
const map = (r: Raw): ThroneRow => ({
  userId: String(r["user_id"]),
  name: String(r["name"] ?? ""),
  elo: n(r["elo"]),
  validGames: n(r["valid_games"]),
  wins: n(r["wins"]),
  winRate: n(r["win_rate"]),
  reviewCount: n(r["review_count"]),
  dailyRate: n(r["daily_rate"]),
  gateRank: Boolean(r["gate_rank"]),
  gateGames: Boolean(r["gate_games"]),
  qualified: Boolean(r["qualified"]),
  score: n(r["score"]),
  ptsWin: n(r["pts_win"]),
  ptsGames: n(r["pts_games"]),
  ptsReview: n(r["pts_review"]),
  ptsDaily: n(r["pts_daily"]),
  qualifiedAt: (r["qualified_at"] as string | null) ?? null,
  windowEnd: (r["window_end"] as string | null) ?? null,
  qGames: n(r["q_games"]),
  qWins: n(r["q_wins"]),
  qDraws: n(r["q_draws"]),
  qLosses: n(r["q_losses"]),
  qPoints: n(r["q_points"]),
  kingReachedAt: (r["king_reached_at"] as string | null) ?? null,
  updatedAt: String(r["updated_at"] ?? ""),
});

const season = () => new Date().getUTCFullYear();

/** 公示榜：全体候选人（公开）。榜单超过 10 分钟未更新时由服务端批量重算一次。 */
export const listThroneCandidates = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const s = season();
  const { data: latest } = await supabaseAdmin
    .from("throne_candidates" as never)
    .select("updated_at")
    .eq("season", s)
    .order("updated_at", { ascending: false })
    .limit(1);
  const last = (latest as unknown as { updated_at: string }[] | null)?.[0]?.updated_at;
  if (!last || Date.now() - new Date(last).getTime() > 10 * 60_000) {
    await supabaseAdmin.rpc("refresh_throne_all" as never, { p_season: s } as never);
  }
  const { data, error } = await supabaseAdmin
    .from("throne_candidates" as never)
    .select(COLS)
    .eq("season", s)
    .limit(100);
  if (error) throw new Error(error.message);
  const rows = ((data ?? []) as unknown as Raw[]).map(map);
  rows.sort(
    (a, b) =>
      Number(b.qualified) - Number(a.qualified) ||
      b.qPoints - a.qPoints ||
      b.winRate - a.winRate ||
      b.validGames - a.validGames ||
      b.reviewCount - a.reviewCount ||
      (a.kingReachedAt ?? "9999").localeCompare(b.kingReachedAt ?? "9999") ||
      b.score - a.score,
  );
  return { season: s, rows };
});

/** 为当前登录玩家重算并存档（只算自己，不接受外部传入的分数）。 */
export const refreshMyThrone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("compute_throne_candidate" as never, { p_user: context.userId } as never);
    if (error) throw new Error((error as { message: string }).message);
    return map(data as unknown as Raw);
  });

export interface QualifierGame {
  at: string;
  opponent: string;
  result: "W" | "D" | "L";
  points: number;
  total: number;
}

/** 公开：某位入围者资格赛窗口内逐局积分（与数据库函数同一口径：已结束、非中止、≥10 手）。只返回对手名、胜负与时间。 */
export const listQualifierGames = createServerFn({ method: "GET" })
  .inputValidator((d: { userId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d?.userId ?? "")) throw new Error("bad id");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: c } = await supabaseAdmin
      .from("throne_candidates" as never)
      .select("qualified_at,window_end")
      .eq("season", season())
      .eq("user_id", data.userId)
      .maybeSingle();
    const w = c as unknown as { qualified_at: string | null; window_end: string | null } | null;
    if (!w?.qualified_at || !w.window_end) return [] as QualifierGame[];
    const { data: ms, error } = await supabaseAdmin
      .from("matches")
      .select("created_at,white_id,black_id,white_name,black_name,outcome")
      .eq("status", "over")
      .gte("ply", 10)
      .gte("created_at", w.qualified_at)
      .lt("created_at", w.window_end)
      .or(`white_id.eq.${data.userId},black_id.eq.${data.userId}`)
      .or("reason.is.null,reason.neq.abort")
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    let total = 0;
    return (ms ?? []).map((m) => {
      const white = m.white_id === data.userId;
      const result: QualifierGame["result"] =
        m.outcome === "draw" ? "D" : (m.outcome === "white") === white ? "W" : "L";
      const points = result === "W" ? 1 : result === "D" ? 0.5 : 0;
      total += points;
      return { at: m.created_at, opponent: white ? m.black_name : m.white_name, result, points, total };
    });
  });
