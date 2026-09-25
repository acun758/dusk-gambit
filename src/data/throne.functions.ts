import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * 王座资格与评分：计算只在数据库函数 compute_throne_candidate 里做（服务端权威），
 * 口径与王座页一致：王段 ≥2500、本赛季有效局 ≥50（非中止、≥10 手）、
 * 评分 = 胜率 40 + 有效局数 30 + 复盘次数 20 + 每日挑战 10（满分 100）。
 */
export interface ThroneRow {
  userId: string;
  name: string;
  elo: number;
  validGames: number;
  winRate: number;
  reviewCount: number;
  dailyRate: number;
  gateRank: boolean;
  gateGames: boolean;
  qualified: boolean;
  score: number;
  updatedAt: string;
}

type Raw = {
  user_id: string; name: string; elo: number; valid_games: number; win_rate: number | string;
  review_count: number; daily_rate: number | string; gate_rank: boolean; gate_games: boolean;
  qualified: boolean; score: number | string; updated_at: string;
};

const map = (r: Raw): ThroneRow => ({
  userId: r.user_id,
  name: r.name,
  elo: r.elo,
  validGames: r.valid_games,
  winRate: Number(r.win_rate),
  reviewCount: r.review_count,
  dailyRate: Number(r.daily_rate),
  gateRank: r.gate_rank,
  gateGames: r.gate_games,
  qualified: r.qualified,
  score: Number(r.score),
  updatedAt: r.updated_at,
});

const season = () => new Date().getUTCFullYear();

/** 公开榜：本赛季候选人，达标者优先，再按评分 → 胜率 → 有效局数排序。 */
export const listThroneCandidates = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb
    .from("throne_candidates" as never)
    .select("user_id,name,elo,valid_games,win_rate,review_count,daily_rate,gate_rank,gate_games,qualified,score,updated_at")
    .eq("season", season())
    .order("qualified", { ascending: false })
    .order("score", { ascending: false })
    .order("win_rate", { ascending: false })
    .order("valid_games", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return { season: season(), rows: ((data ?? []) as unknown as Raw[]).map(map) };
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
