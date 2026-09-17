import { createServerFn } from "@tanstack/react-start";

/**
 * FIDE 名人堂：只读本库内的月度快照，客户端不直连 fide.com。
 * 四个榜：世界公开、世界女子、中国、中国女子。
 */

export type HallBoard = "open" | "women" | "chn" | "chnW";

export interface HallRow {
  fideId: number;
  name: string;
  country: string;
  title: string | null;
  sex: string | null;
  rating: number;
  rank: number;
}

const RANK_COLUMN: Record<HallBoard, string> = {
  open: "rank_open",
  women: "rank_women",
  chn: "rank_chn",
  chnW: "rank_chn_w",
};

export interface HallResult {
  rows: HallRow[];
  updatedAt: string | null;
  total: number;
}

export const listFideRatings = createServerFn({ method: "POST" })
  .inputValidator((input: { board?: HallBoard; q?: string; limit?: number }) => ({
    board: (input?.board && RANK_COLUMN[input.board] ? input.board : "open") as HallBoard,
    q: (input?.q ?? "").trim().slice(0, 40),
    limit: Math.min(200, Math.max(10, input?.limit ?? 100)),
  }))
  .handler(async ({ data }): Promise<HallResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const col = RANK_COLUMN[data.board];
    let query = supabaseAdmin
      .from("fide_ratings")
      .select("fide_id,name,country,sex,title,rating,updated_at," + col, { count: "exact" })
      .not(col, "is", null)
      .order(col, { ascending: true })
      .limit(data.limit);
    if (data.q) query = query.ilike("name", `%${data.q}%`);

    const { data: rows, error, count } = await query;
    if (error) throw new Error(error.message);

    const list = (rows ?? []) as unknown as (Record<string, unknown> & { updated_at: string })[];
    return {
      rows: list.map((r) => ({
        fideId: Number(r['fide_id']),
        name: String(r['name']),
        country: String(r['country']),
        title: (r['title'] as string | null) ?? null,
        sex: (r['sex'] as string | null) ?? null,
        rating: Number(r['rating']),
        rank: Number(r[col]),
      })),
      updatedAt: list[0]?.updated_at ?? null,
      total: count ?? list.length,
    };
  });
