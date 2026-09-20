/**
 * 后端适配层的契约 —— 领域名词，不出现任何厂商概念。
 *
 * DataGateway 的形状直接由当前实现推导，因此换云厂商时接口天然一致：
 * 新适配器只要实现同名同签名的方法（submitMove / claimTimeout / settle 等），
 * 页面与 db.ts 零改动。
 */

export interface SessionInfo {
  userId: string;
}

export interface AuthResult {
  error: string | null;
  signedIn: boolean;
}

export type Unsubscribe = () => void;

/** 数据读写契约：形状锁定为默认实现，保证换后端时签名不漂移。 */
export type DataGateway = typeof import("./gateway.default")["defaultGateway"];

export interface DuelFrameHandlers<M, V> {
  onMatch: (row: M) => void;
  onMove: (row: V) => void;
  onProfiles: () => void;
  /** 推送通道状态：degraded 表示推送不可用，页面应退回轮询兜底。 */
  onStatus?: (status: "live" | "degraded") => void;
}

/** 大厅在场玩家（仅公开展示字段，不含任何联系方式）。 */
export interface ArenaPresencePlayer {
  /** 登录账号 id，用于定向约战；未登录为 null */
  uid?: string | null;
  avatarKey?: string | null;
  id: string;
  name: string;
  elo: number;
  /** 在场状态：idle 在大厅，playing 对局中。 */
  state: "idle" | "playing";
}

export type ArenaPresenceSelf = ArenaPresencePlayer;

/** 实时帧契约：各家云平台推送能力不同，只在适配器内部体现差异。 */
export interface RealtimeGateway {
  /** 大厅在场名册（自己报到 + 名单变化）。 */
  onArenaPresence(me: ArenaPresenceSelf, cb: (players: ArenaPresencePlayer[]) => void): Unsubscribe;
  /** 任意玩家档案变动（段位榜、晋升进度据此刷新）。 */
  onLadderChanged(cb: () => void): Unsubscribe;
  /** 自己的档案变动（积分、头像、装备）。 */
  onMyProfileChanged(cb: () => void): Unsubscribe;
  /** 一局对局：对手落子、对局状态、双方资料变动。 */
  onDuelFrames<M, V>(matchId: string, handlers: DuelFrameHandlers<M, V>): Unsubscribe;
}

export class BackendNotWiredError extends Error {
  constructor(method: string, provider: string) {
    super(`[backend:${provider}] ${method} 尚未接入，请先完成该适配器的实现。`);
    this.name = "BackendNotWiredError";
  }
}
