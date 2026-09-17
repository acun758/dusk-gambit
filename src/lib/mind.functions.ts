import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { accuracyFromAcpl, tagForLoss } from "@/core/review";
import { rankOf } from "@/lib/ranks";

/**
 * 心智战报（服务端权威计算）
 *
 * 红线：四维公式、准确率口径、段位均值全部在服务端算，客户端只负责显示。
 * 这里只描述**棋局行为**，不做任何心理学诊断；也不参与胜负、积分与段位结算。
 * 输入的 cp / loss 来自端内引擎复盘，仅用于讲解，绝不写进天梯或奖励。
 */

export type MindKey = "composure" | "resilience" | "discipline" | "audacity";

export interface MindFacet {
  key: MindKey;
  zh: string;
  en: string;
  value: number;
  /** 一句话解释：说明这个分数来自哪些着法 */
  note: string;
}

export interface MindReport {
  accuracy: number;
  acpl: number;
  moveCount: number;
  facets: MindFacet[];
  /** 三条最大失分着法（供点击跳转局面） */
  worst: { ply: number; san: string; loss: number; tag: string }[];
}

export interface ReportComparison {
  previousAccuracy: number | null;
  personalBest: number | null;
  rankAverage: number | null;
  rankId: string;
  rankZh: string;
  saved: boolean;
}

export interface MoveInput {
  ply: number;
  by: "w" | "b";
  san: string;
  /** 白方视角厘兵 */
  cp: number;
  /** 该手损失（厘兵，≥0） */
  loss: number;
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function sanitize(moves: MoveInput[]): MoveInput[] {
  return moves.slice(0, 300).map((m) => ({
    ply: Math.max(0, Math.round(m.ply)),
    by: m.by === "b" ? "b" : "w",
    san: String(m.san ?? "").slice(0, 12),
    cp: Math.max(-1500, Math.min(1500, Math.round(m.cp ?? 0))),
    loss: Math.max(0, Math.min(2000, Math.round(m.loss ?? 0))),
  }));
}

/** 核心算法：只看该方自己走的每一手，以及走这手之前的局面优劣。 */
export function computeMind(moves: MoveInput[], you: "w" | "b", outcome: string | null): MindReport {
  const mine: { m: MoveInput; before: number }[] = [];
  let before = 20; // 起始局面按先手微优 +0.20 计
  for (const m of moves) {
    const beforeMine = you === "w" ? before : -before;
    if (m.by === you) mine.push({ m, before: beforeMine });
    before = m.cp;
  }

  if (mine.length === 0) {
    // 本方一手未走：不给任何评分，免得出现"零手满分"
    return {
      accuracy: 0,
      acpl: 0,
      moveCount: 0,
      worst: [],
      facets: [
        { key: "composure", zh: "冷静", en: "Composure", value: 0, note: "本局本方没有落子，无法评定" },
        { key: "resilience", zh: "韧性", en: "Resilience", value: 0, note: "本局本方没有落子，无法评定" },
        { key: "discipline", zh: "纪律", en: "Discipline", value: 0, note: "本局本方没有落子，无法评定" },
        { key: "audacity", zh: "冒险", en: "Audacity", value: 0, note: "本局本方没有落子，无法评定" },
      ],
    };
  }

  const losses = mine.map((x) => x.m.loss);
  const acpl = Math.round(mean(losses));
  const accuracy = accuracyFromAcpl(acpl);

  // 冷静：只统计「落后 1 分以上」时走的那些手的平均失分
  const behind = mine.filter((x) => x.before <= -100);
  const behindAvg = Math.round(mean(behind.map((x) => x.m.loss)));
  const composure = behind.length
    ? clamp(100 - behindAvg / 2.2)
    : clamp(100 - acpl / 2.2);
  const composureNote = behind.length
    ? `落后时走了 ${behind.length} 手，平均失分 ${(behindAvg / 100).toFixed(2)} 子`
    : "本局未出现一子以上的落后局面，按全局平均失分折算";

  // 韧性：从最劣局面到终局的回升幅度 + 结果加成
  const worstEval = mine.length ? Math.min(...mine.map((x) => x.before)) : 0;
  const lastMine = mine.length ? mine[mine.length - 1]! : null;
  const finalEval = lastMine ? (you === "w" ? lastMine.m.cp : -lastMine.m.cp) : 0;
  const won = outcome === (you === "w" ? "white" : "black");
  const drew = outcome === "draw";
  const resilience = worstEval >= -100
    ? clamp(60 + (finalEval - worstEval) / 20 + (won ? 20 : drew ? 8 : 0))
    : clamp(45 + (finalEval - worstEval) / 18 + (won ? 25 : drew ? 12 : 0));
  const resilienceNote = worstEval >= -100
    ? "全程没有陷入明显劣势，局面始终握在手里"
    : `最差时落后 ${(Math.abs(worstEval) / 100).toFixed(2)} 子，收官时为 ${(finalEval / 100).toFixed(2)} 子`;

  // 纪律：失分在「良好」以内（≤90）的着法占比
  const solid = mine.filter((x) => x.m.loss <= 90).length;
  const discipline = mine.length ? clamp((solid / mine.length) * 100) : 0;
  const disciplineNote = mine.length
    ? `${mine.length} 手里有 ${solid} 手保持在良好以内`
    : "本局着法太少，暂不评定";

  // 冒险：主动吃子/将军等攻势着法占比，再看这些手是否真的站得住
  const aggressive = mine.filter((x) => /[x+#]/.test(x.m.san));
  const success = aggressive.filter((x) => x.m.loss <= 90).length;
  const share = mine.length ? aggressive.length / mine.length : 0;
  const rate = aggressive.length ? success / aggressive.length : 0;
  const audacity = clamp(share * 140 + rate * 30);
  const audacityNote = aggressive.length
    ? `${aggressive.length} 手吃子或将军，其中 ${success} 手站得住`
    : "本局没有主动吃子或将军，走的是稳守路线";

  const worst = mine
    .slice()
    .sort((a, b) => b.m.loss - a.m.loss)
    .slice(0, 3)
    .filter((x) => x.m.loss >= 40)
    .map((x) => ({ ply: x.m.ply, san: x.m.san, loss: x.m.loss, tag: tagForLoss(x.m.loss) }));

  return {
    accuracy,
    acpl,
    moveCount: mine.length,
    worst,
    facets: [
      { key: "composure", zh: "冷静", en: "Composure", value: composure, note: composureNote },
      { key: "resilience", zh: "韧性", en: "Resilience", value: resilience, note: resilienceNote },
      { key: "discipline", zh: "纪律", en: "Discipline", value: discipline, note: disciplineNote },
      { key: "audacity", zh: "冒险", en: "Audacity", value: audacity, note: audacityNote },
    ],
  };
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
        saved: !error,
      },
    };
  });
