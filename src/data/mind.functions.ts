import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeMind, mean, sanitizeMindMoves as sanitize, type MindReport, type MoveInput } from "@/core/mind";
import { rankOfCore as rankOf } from "@/core/ranks";

/**
 * 心智战报（服务端权威计算）——算法在 src/core/mind.ts，这里只做鉴权、消毒与存档。
 */

export type { MindKey, MindFacet, MindReport, MoveInput } from "@/core/mind";
export { computeMind } from "@/core/mind";

export interface ReportComparison {
  previousAccuracy: number | null;
  personalBest: number | null;
  rankAverage: number | null;
  rankId: string;
  rankZh: string;
  rankEn: string;
  saved: boolean;
}

/** 未登录也能看到的战报：只算不存。 */
export const analyzeMind = createServerFn({ method: "POST" })
  .inputValidator((input: { moves: MoveInput[]; you: "w" | "b"; outcome?: string | null }) => ({
    moves: sanitize(input.moves ?? []),
    you: input.you === "b" ? ("b" as const) : ("w" as const),
    outcome: input.outcome ?? null,
  }))
  .handler(async ({ data }): Promise<MindReport> => computeMind(data.moves, data.you, data.outcome));

/** 登录用户：算完存档，并给出与上一局 / 个人最好 / 本段位平均的对比。 */
export const recordMatchReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    moves: MoveInput[];
    you: "w" | "b";
    outcome?: string | null;
    matchId?: string | null;
    ranked?: boolean;
  }) => ({
    moves: sanitize(input.moves ?? []),
    you: input.you === "b" ? ("b" as const) : ("w" as const),
    outcome: input.outcome ?? null,
    matchId: input.matchId ?? null,
    ranked: !!input.ranked,
  }))
  .handler(async ({ data, context }): Promise<{ report: MindReport; comparison: ReportComparison }> => {
    const report = computeMind(data.moves, data.you, data.outcome);
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("elo")
      .eq("id", userId)
      .maybeSingle();
    const elo = profile?.elo ?? 1000;
    const tier = rankOf(elo);

    const { data: history } = await supabaseAdmin
      .from("match_reports")
      .select("accuracy")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    const past = (history ?? []).map((r) => Number(r.accuracy));
    const previousAccuracy = past.length ? past[0]! : null;
    const personalBest = past.length ? Math.max(...past) : null;

    const { data: peers } = await supabaseAdmin
      .from("match_reports")
      .select("accuracy")
      .eq("rank_id", tier.id)
      .limit(500);
    const peerValues = (peers ?? []).map((r) => Number(r.accuracy));
    const rankAverage = peerValues.length ? Math.round(mean(peerValues) * 10) / 10 : null;

    const row = {
      user_id: userId,
      match_id: data.matchId,
      ranked: data.ranked,
      accuracy: report.accuracy,
      acpl: report.acpl,
      elo,
      rank_id: tier.id,
      mind: Object.fromEntries(report.facets.map((f) => [f.key, f.value])),
    };
    const { error } = data.matchId
      ? await supabaseAdmin.from("match_reports").upsert(row, { onConflict: "user_id,match_id" })
      : await supabaseAdmin.from("match_reports").insert(row);

    return {
      report,
      comparison: {
        previousAccuracy,
        personalBest,
        rankAverage,
        rankId: tier.id,
        rankZh: tier.zh,
        rankEn: tier.en,
        saved: !error,
      },
    };
  });
