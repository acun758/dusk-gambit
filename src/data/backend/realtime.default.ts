/**
 * 默认适配器的实时帧实现（表变更推送）。
 * 断线重连、补传队列等与平台无关的策略统一在 src/data/realtime.ts。
 */
import { supabase as sdk } from "@/integrations/supabase/client";
import type { DuelFrameHandlers, RealtimeGateway, Unsubscribe } from "./types";

function uniqueName(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

export const defaultRealtime: RealtimeGateway = {
  onLadderChanged(cb: () => void): Unsubscribe {
    const channel = sdk
      .channel(uniqueName("ladder-live"))
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => cb())
      .subscribe();
    return () => {
      void sdk.removeChannel(channel);
    };
  },

  onMyProfileChanged(cb: () => void): Unsubscribe {
    const channel = sdk
      .channel(uniqueName("my-profile-live"))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => cb())
      .subscribe();
    return () => {
      void sdk.removeChannel(channel);
    };
  },

  onDuelFrames<M, V>(matchId: string, handlers: DuelFrameHandlers<M, V>): Unsubscribe {
    const channel = sdk
      .channel(uniqueName(`duel-${matchId}`))
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => handlers.onMatch(payload.new as M),
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => handlers.onProfiles())
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_moves", filter: `match_id=eq.${matchId}` },
        (payload) => handlers.onMove(payload.new as V),
      )
      .subscribe();
    return () => {
      void sdk.removeChannel(channel);
    };
  },
};
