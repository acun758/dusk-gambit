/**
 * 实时帧与断网续传 —— 与数据读写（db.ts）分开。
 *
 * 本文件负责三件与云厂商无关的事：
 *   1. 链路状态（在线 / 断网 / 追帧中），供界面显示"离线，恢复后自动补传"；
 *   2. 订阅托管：断网期间的订阅在恢复后自动重建，并回调一次 onChange 触发追帧；
 *   3. 发件箱：断网期间产生的动作（如落子）按顺序落盘排队，恢复后原序补传。
 *
 * 平台特有的推送实现在 backend/realtime.*.ts；换云只改适配器，这里不动。
 * 注意：发件箱只负责"把动作送达服务端"，是否合法、是否超时、如何结算
 * 仍由服务端权威判定；客户端排队不代表落子生效。
 */
import { realtimeGateway } from "./backend";
import type { ArenaPresencePlayer, ArenaPresenceSelf, DuelFrameHandlers, Unsubscribe } from "./backend";

export type { ArenaPresencePlayer, ArenaPresenceSelf };

export type { Unsubscribe };
export type LinkPhase = "live" | "offline" | "resyncing";

/* -------------------------------- 链路状态 -------------------------------- */

const linkWatchers = new Set<(p: LinkPhase) => void>();
let phase: LinkPhase = "live";

export function linkPhase(): LinkPhase {
  return phase;
}

export function isLinkUp(): boolean {
  return phase !== "offline";
}

function setPhase(next: LinkPhase) {
  if (phase === next) return;
  phase = next;
  linkWatchers.forEach((w) => w(next));
}

/** 订阅链路状态变化，立即回调一次当前值。 */
export function watchLink(cb: (p: LinkPhase) => void): Unsubscribe {
  linkWatchers.add(cb);
  cb(phase);
  return () => linkWatchers.delete(cb);
}

/** 标记链路已断（发送失败时由 db.ts 调用）。 */
export function markOffline() {
  setPhase("offline");
}

/* --------------------------------- 发件箱 --------------------------------- */

export interface OutboundItem {
  id: string;
  kind: string;
  payload: unknown;
  at: number;
  tries: number;
}

const STORE_KEY = "bs:outbox:v1";
const senders = new Map<string, (payload: never) => Promise<void>>();
const outboxWatchers = new Set<(n: number) => void>();
let queue: OutboundItem[] = [];
let flushing = false;

function hasStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function load() {
  if (!hasStorage()) return;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    queue = raw ? (JSON.parse(raw) as OutboundItem[]) : [];
  } catch {
    queue = [];
  }
}

function persist() {
  if (hasStorage()) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(queue));
    } catch {
      /* 存储写满时只影响持久化，内存队列照常工作 */
    }
  }
  outboxWatchers.forEach((w) => w(queue.length));
}

/** 注册某类动作的真实发送实现（由 db.ts 在模块加载时登记）。 */
export function registerOutboundSender<P>(kind: string, send: (payload: P) => Promise<void>) {
  senders.set(kind, send as (payload: never) => Promise<void>);
}

/** 排队一个断网期间产生的动作，恢复后按原顺序补传。 */
export function queueOutbound(kind: string, payload: unknown): OutboundItem {
  const item: OutboundItem = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    payload,
    at: Date.now(),
    tries: 0,
  };
  queue.push(item);
  persist();
  return item;
}

export function pendingOutbound(kind?: string): number {
  return kind ? queue.filter((i) => i.kind === kind).length : queue.length;
}

export function watchOutbound(cb: (n: number) => void): Unsubscribe {
  outboxWatchers.add(cb);
  cb(queue.length);
  return () => outboxWatchers.delete(cb);
}

export function clearOutbound(kind?: string) {
  queue = kind ? queue.filter((i) => i.kind !== kind) : [];
  persist();
}

/** 按入队顺序补传；任一条失败立即停下，保持顺序不乱。 */
export async function flushOutbound(): Promise<{ sent: number; left: number }> {
  if (flushing) return { sent: 0, left: queue.length };
  flushing = true;
  let sent = 0;
  try {
    while (queue.length) {
      const item = queue[0]!;
      const send = senders.get(item.kind);
      if (!send) {
        // 没有登记发送实现的动作直接丢弃，避免永久堵塞队列
        queue.shift();
        persist();
        continue;
      }
      try {
        await send(item.payload as never);
        queue.shift();
        sent += 1;
        persist();
      } catch {
        item.tries += 1;
        persist();
        // 连续失败 5 次判为无法补传（多半已被服务端拒绝），丢弃后继续
        if (item.tries >= 5) {
          queue.shift();
          persist();
          continue;
        }
        setPhase("offline");
        return { sent, left: queue.length };
      }
    }
    setPhase("live");
    return { sent, left: 0 };
  } finally {
    flushing = false;
  }
}

/* -------------------------------- 订阅托管 -------------------------------- */

interface Managed {
  start: () => Unsubscribe;
  stop: Unsubscribe;
  resync: () => void;
}

const managed = new Set<Managed>();

function manage(start: () => Unsubscribe, resync: () => void): Unsubscribe {
  const entry: Managed = { start, stop: start(), resync };
  managed.add(entry);
  return () => {
    managed.delete(entry);
    entry.stop();
  };
}

/** 网络恢复：重建全部订阅、补传发件箱、回调一次触发页面追帧。 */
async function recover() {
  setPhase("resyncing");
  managed.forEach((m) => {
    try {
      m.stop();
    } catch {
      /* 旧通道可能已失效 */
    }
    m.stop = m.start();
  });
  await flushOutbound();
  managed.forEach((m) => m.resync());
  if (phase === "resyncing") setPhase("live");
}

if (typeof window !== "undefined") {
  load();
  phase = navigator.onLine === false ? "offline" : "live";
  window.addEventListener("offline", () => setPhase("offline"));
  window.addEventListener("online", () => void recover());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && navigator.onLine !== false) void recover();
  });
  // 兜底轮询：某些环境不派发 online 事件（小游戏 / 弱网切换）
  window.setInterval(() => {
    if (navigator.onLine !== false && (phase === "offline" || queue.length)) void recover();
  }, 8000);
}

/* -------------------------------- 业务订阅 -------------------------------- */

/** 任意玩家档案变动（段位榜、晋升进度需要据此刷新）。 */
export function subscribeLadder(onChange: () => void): Unsubscribe {
  return manage(() => realtimeGateway.onLadderChanged(onChange), onChange);
}

/** 自己的档案变动（积分、头像、装备）。 */
export function subscribeMyProfile(onChange: () => void): Unsubscribe {
  return manage(() => realtimeGateway.onMyProfileChanged(onChange), onChange);
}

/** 大厅在场名册：把自己报到，并持续收到当前在场玩家名单。 */
export function subscribeArenaPresence(
  me: ArenaPresenceSelf,
  onChange: (players: ArenaPresencePlayer[]) => void,
): Unsubscribe {
  return manage(
    () => realtimeGateway.onArenaPresence(me, onChange),
    () => {},
  );
}

export type DuelSubscribers<M, V> = DuelFrameHandlers<M, V>;

/** 一局对局：对手落子、对局状态、双方资料变动。断线恢复后自动重建并追帧。 */
export function subscribeDuel<M, V>(matchId: string, handlers: DuelSubscribers<M, V>): Unsubscribe {
  return manage(
    () => realtimeGateway.onDuelFrames<M, V>(matchId, handlers),
    () => handlers.onProfiles(),
  );
}
