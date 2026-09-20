import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * 联网大厅（Arena）服务端逻辑。
 *
 * 权威归属：房间创建、加入、准入校验、超时解散全部在数据库函数里原子完成，
 * 客户端只负责展示；对局开始后复用既有 matches 结算链路，本文件不碰结算。
 */

export interface ArenaRoom {
  id: string;
  shortCode: string;
  status: "waiting" | "playing" | "closed";
  visibility: "public" | "private";
  hostColor: "w" | "b";
  colorChoice: string;
  initialMs: number;
  incrementMs: number;
  perMoveMs: number;
  ratingMin: number;
  ratingMax: number;
  matchId: string | null;
  createdAt: string;
  hostId: string;
  hostName: string;
  hostElo: number;
  hostAvatarKey: string;
  guestId: string | null;
  guestName: string | null;
  guestElo: number | null;
  guestAvatarKey: string | null;
  /** 定向约战的受邀人（公开房为 null）。 */
  targetId: string | null;
  fen: string | null;
  ply: number;
  mine: boolean;
  /** 我在这一局里的执子方（仅当我是参与者）。 */
  mySide: "w" | "b" | null;
}

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** 房间列表（公开房 + 我参与的房），顺带做超时解散与结束房清理。 */
export const listArenaRooms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ArenaRoom[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("expire_arena_rooms");

    const { data: rows, error } = await supabaseAdmin
      .from("rooms")
      .select("*")
      .in("status", ["waiting", "playing"])
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);

    const list = (rows ?? []).filter(
      (r) =>
        (r.visibility === "public" && !r.target_id) ||
        r.host_id === context.userId ||
        r.guest_id === context.userId ||
        r.target_id === context.userId,
    );
    if (!list.length) return [];

    const playerIds = [...new Set(list.flatMap((r) => [r.host_id, r.guest_id]).filter(Boolean) as string[])];
    const matchIds = list.map((r) => r.match_id).filter(Boolean) as string[];

    const [{ data: profiles }, matchRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id,name,elo,avatar_key").in("id", playerIds),
      matchIds.length
        ? supabaseAdmin.from("matches").select("id,fen,ply,white_id,black_id,status").in("id", matchIds)
        : Promise.resolve({ data: [] as { id: string; fen: string; ply: number; white_id: string | null; black_id: string | null; status: string }[] }),
    ]);

    const profileOf = (id: string | null) => (id ? (profiles ?? []).find((p) => p.id === id) ?? null : null);
    const matchOf = (id: string | null) => (id ? (matchRes.data ?? []).find((m) => m.id === id) ?? null : null);

    return list.map((r) => {
      const host = profileOf(r.host_id);
      const guest = profileOf(r.guest_id);
      const match = matchOf(r.match_id);
      const mine = r.host_id === context.userId || r.guest_id === context.userId;
      const mySide = !mine
        ? null
        : r.host_id === context.userId
          ? (r.host_color as "w" | "b")
          : r.host_color === "w"
            ? ("b" as const)
            : ("w" as const);
      return {
        id: r.id,
        shortCode: r.short_code,
        status: r.status as ArenaRoom["status"],
        visibility: r.visibility as ArenaRoom["visibility"],
        hostColor: r.host_color as "w" | "b",
        colorChoice: r.color_choice,
        initialMs: r.initial_ms,
        incrementMs: r.increment_ms,
        perMoveMs: r.per_move_ms,
        ratingMin: r.rating_min,
        ratingMax: r.rating_max,
        matchId: r.match_id,
        createdAt: r.created_at,
        hostId: r.host_id,
        hostName: host?.name ?? "Sovereign",
        hostElo: host?.elo ?? 1000,
        hostAvatarKey: host?.avatar_key ?? "knight-azure",
        guestId: r.guest_id,
        guestName: guest?.name ?? null,
        guestElo: guest?.elo ?? null,
        guestAvatarKey: guest?.avatar_key ?? null,
        targetId: r.target_id ?? null,
        fen: match?.fen ?? (r.status === "playing" ? START_FEN : null),
        ply: match?.ply ?? 0,
        mine,
        mySide,
      };
    });
  });

export const createArenaRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    visibility?: "public" | "private";
    color?: "w" | "b" | "random";
    initialMs?: number;
    incrementMs?: number;
    ratingMin?: number;
    ratingMax?: number;
    /** 定向约战：只有该玩家能进这一间 */
    targetId?: string | null;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 发起约战（开房 / 点名邀请）需要实名认证，服务端判定，前端改不掉。
    const { data: me } = await supabaseAdmin
      .from("profiles")
      .select("verify_status")
      .eq("id", context.userId)
      .maybeSingle();
    if (me?.verify_status !== "verified") throw new Error("verify_required");

    const { data: room, error } = await supabaseAdmin.rpc("create_arena_room", {
      p_user_id: context.userId,
      p_visibility: data.visibility === "private" ? "private" : "public",
      p_color: data.color === "w" || data.color === "b" ? data.color : "random",
      p_initial_ms: Math.round(data.initialMs ?? 600_000),
      p_increment_ms: Math.round(data.incrementMs ?? 3_000),
      p_per_move_ms: 0,
      p_rating_min: Math.round(data.ratingMin ?? 0),
      p_rating_max: Math.round(data.ratingMax ?? 100_000),
      ...(data.targetId ? { p_target_id: data.targetId } : {}),
    });
    if (error) throw new Error(error.message);
    return room as { id: string; short_code: string; host_color: "w" | "b"; target_id: string | null } | null;
  });

/** 加入房间：服务端原子判定房间是否仍空、积分是否达标，先到先得。 */
export const joinArenaRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { roomId?: string; code?: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: res, error } = await supabaseAdmin.rpc("join_arena_room", {
      p_user_id: context.userId,
      ...(data.roomId ? { p_room_id: data.roomId } : {}),
      ...(data.code ? { p_code: data.code.trim().toUpperCase().slice(0, 8) } : {}),
    });
    if (error) throw new Error(error.message);
    return (res ?? { code: "not_found" }) as {
      code: "ok" | "full" | "self" | "expired" | "not_found" | "rating_blocked";
      match_id?: string;
      room_id?: string;
      side?: "w" | "b";
      min?: number;
      max?: number;
    };
  });

export const closeArenaRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { roomId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("close_arena_room", {
      p_user_id: context.userId,
      p_room_id: data.roomId,
    });
    if (error) throw new Error(error.message);
    return { ok: Boolean(ok) };
  });
