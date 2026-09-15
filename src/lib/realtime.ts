/**
 * 实时帧订阅 —— 与数据读写（db.ts）分开。
 *
 * 实时推送是各家云平台特有的能力，换平台时只改这一个文件；
 * 对局帧的字段定义在 duel-protocol.ts，与传输方式无关。
 * 每个订阅函数都返回退订函数。
 */
import { backend } from "./backend";

export type Unsubscribe = () => void;

function uniqueName(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

/** 任意玩家档案变动（段位榜、晋升进度需要据此刷新）。 */
export function subscribeLadder(onChange: () => void): Unsubscribe {
  const channel = backend
    .channel(uniqueName("ladder-live"))
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => onChange())
    .subscribe();
  return () => {
    void backend.removeChannel(channel);
  };
}

/** 自己的档案变动（积分、头像、装备）。 */
export function subscribeMyProfile(onChange: () => void): Unsubscribe {
  const channel = backend
    .channel(uniqueName("my-profile-live"))
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => onChange())
    .subscribe();
  return () => {
    void backend.removeChannel(channel);
  };
}

export interface DuelSubscribers<M, V> {
  onMatch: (row: M) => void;
  onMove: (row: V) => void;
  onProfiles: () => void;
}

/** 一局对局：对手落子、对局状态、双方资料变动。 */
export function subscribeDuel<M, V>(matchId: string, handlers: DuelSubscribers<M, V>): Unsubscribe {
  const channel = backend
    .channel(`duel-${matchId}`)
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
    void backend.removeChannel(channel);
  };
}
