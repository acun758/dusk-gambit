import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * AI 棋谱讲解：把一局棋按开局、中局、残局三段送给 Lovable AI，返回中文分段解析。
 * 只做文字讲解，不影响任何服务端结算逻辑。
 */

export interface ReviewSegment {
  phase: "opening" | "middlegame" | "endgame";
  title: string;
  summary: string;
  keyMoves: string[];
  advice: string;
}

export interface MatchNarrative {
  headline: string;
  segments: ReviewSegment[];
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "segments"],
  properties: {
    headline: { type: "string" },
    segments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phase", "title", "summary", "keyMoves", "advice"],
        properties: {
          phase: { type: "string", enum: ["opening", "middlegame", "endgame"] },
          title: { type: "string" },
          summary: { type: "string" },
          keyMoves: { type: "array", items: { type: "string" } },
          advice: { type: "string" },
        },
      },
    },
  },
} as const;

export const explainMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    moves: { ply: number; san: string; by: string; cp: number; swing: number }[];
    you: "w" | "b";
    outcome?: string | null;
  }) => ({
    moves: input.moves.slice(0, 160),
    you: input.you,
    outcome: input.outcome ?? null,
  }))
  .handler(async ({ data }): Promise<MatchNarrative> => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) throw new Error("AI 讲解暂不可用：缺少密钥配置。");
    if (data.moves.length === 0) throw new Error("这局还没有着法，无法生成讲解。");

    const script = data.moves
      .map((m) => `${m.ply}.${m.by === "w" ? "白" : "黑"} ${m.san} 评估${(m.cp / 100).toFixed(2)} 得失${(m.swing / 100).toFixed(2)}`)
      .join("\n");

    const prompt = [
      "你是一位中文国际象棋教练，请对下面这局棋做分段讲解。",
      `本方执${data.you === "w" ? "白" : "黑"}，结果：${data.outcome ?? "未结束"}。`,
      "按开局、中局、残局三段输出；若某一段未真正进入，也要说明局面停留在哪一阶段。",
      "每段给出 60–120 字的中文解析、2–4 个关键着法（写成“第N手 Nf3”的形式）以及一句给本方的改进建议。",
      "语言专业但易懂，不要使用英文术语缩写。",
      "",
      "棋谱与引擎评估（正数利白）：",
      script,
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_schema", json_schema: { name: "match_narrative", strict: true, schema: SCHEMA } },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 402) throw new Error("AI 讲解额度不足，请补充额度后重试。");
      if (res.status === 429) throw new Error("AI 讲解请求过于频繁，请稍后再试。");
      throw new Error(`AI 讲解生成失败（${res.status}）：${body.slice(0, 180)}`);
    }

    const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(content) as MatchNarrative;
      if (!parsed.segments?.length) throw new Error("empty");
      return parsed;
    } catch {
      throw new Error("AI 讲解返回内容无法解析，请重试。");
    }
  });
