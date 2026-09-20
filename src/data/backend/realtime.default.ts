/**
 * 默认适配器的实时帧实现（表变更推送）。
 * 断线重连、补传队列等与平台无关的策略统一在 src/data/realtime.ts。
 *
 * 关键纪律：一局对局的三类订阅必须各自独立成频道。
 * 只要有一条订阅参数被服务端拒绝，整个频道都会进入 error，
 * 三类帧会一起失效（对手落子推不到、时钟不同步）——分开订阅即可互不牵连。
 */
import { supabase as sdk } from "@/integrations/supabase/client";
import type {
  ArenaPresencePlayer,
  AuditAlertFrame,
  ArenaPresenceSelf,
  DuelFrameHandlers,
  RealtimeGateway,
  Unsubscribe,
  VoiceLink,
  VoiceSignal,
} from "./types";

function uniqueName(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

type Status = "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED" | string;

export const defaultRealtime: RealtimeGateway = {
  onArenaPresence(me: ArenaPresenceSelf, cb: (players: ArenaPresencePlayer[]) => void): Unsubscribe {
    const channel = sdk.channel("arena-presence", { config: { presence: { key: me.id } } });
    const push = () => {
      const state = channel.presenceState<ArenaPresencePlayer>();
      const players = Object.values(state)
        .map((entries) => entries[0])
        .filter(Boolean) as ArenaPresencePlayer[];
      cb(players.sort((a, b) => b.elo - a.elo));
    };
    channel
      .on("presence", { event: "sync" }, push)
      .on("presence", { event: "join" }, push)
      .on("presence", { event: "leave" }, push)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void channel.track(me);
      });
    return () => {
      void sdk.removeChannel(channel);
    };
  },

  onAuditAlert(scope: { userId?: string; all?: boolean }, cb: (frame: AuditAlertFrame) => void): Unsubscribe {
    const channel = sdk
      .channel(uniqueName("audit-alert"))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_audit",
          ...(scope.all || !scope.userId ? {} : { filter: `user_id=eq.${scope.userId}` }),
        },
        (payload) => {
          const row = payload.new as {
            id: number;
            match_id: string;
            user_id: string | null;
            kind: string;
            severity: string | null;
            created_at: string;
          };
          cb({
            id: Number(row.id),
            matchId: row.match_id,
            userId: row.user_id,
            kind: row.kind,
            severity: row.severity ?? "warn",
            createdAt: row.created_at,
          });
        },
      )
      .subscribe();
    return () => {
      void sdk.removeChannel(channel);
    };
  },

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
    const report = (status: Status) => {
      if (status === "SUBSCRIBED") handlers.onStatus?.("live");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") handlers.onStatus?.("degraded");
    };

    const moveChannel = sdk
      .channel(uniqueName(`duel-moves-${matchId}`))
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_moves", filter: `match_id=eq.${matchId}` },
        (payload) => handlers.onMove(payload.new as V),
      )
      .subscribe(report);

    const matchChannel = sdk
      .channel(uniqueName(`duel-match-${matchId}`))
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => handlers.onMatch(payload.new as M),
      )
      .subscribe(report);

    // 档案订阅只影响头像/积分显示，失败不拖累前两条
    const profileChannel = sdk
      .channel(uniqueName(`duel-profiles-${matchId}`))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => handlers.onProfiles())
      .subscribe();

    return () => {
      void sdk.removeChannel(moveChannel);
      void sdk.removeChannel(matchChannel);
      void sdk.removeChannel(profileChannel);
    };
  },

  onVoiceSignal(matchId: string, selfId: string, cb: (signal: VoiceSignal) => void): VoiceLink {
    // 语音只借这条通道交换连接信息，声音本身走点对点，不经服务器、不落库。
    const channel = sdk.channel(`duel-voice-${matchId}`, { config: { broadcast: { self: false } } });
    channel
      .on("broadcast", { event: "signal" }, ({ payload }) => {
        const signal = payload as VoiceSignal;
        if (signal?.from && signal.from !== selfId) cb(signal);
      })
      .subscribe();
    return {
      send: (signal: VoiceSignal) => {
        void channel.send({ type: "broadcast", event: "signal", payload: signal });
      },
      close: () => {
        void sdk.removeChannel(channel);
      },
    };
  },
};
