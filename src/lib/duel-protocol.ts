/**
 * Blood Sovereign — 对弈实时协议 (v1)
 * Duel realtime protocol shared by the web client, the Cocos client and the
 * authoritative game server. Every server frame carries a monotonic `seq`
 * so a reconnecting client can ask for replay ("追帧") from `lastSeq`.
 */

export type Color = "w" | "b";
export type Outcome = "white" | "black" | "draw";
export type EndReason = "mate" | "resign" | "timeout" | "draw" | "abort";

/** 3+2 快棋 = 180000ms 基础 + 2000ms 每步补时 */
export interface TimeControl {
  /** base time per side, ms */
  base: number;
  /** Fischer increment per move, ms */
  inc: number;
  label: string;
}

export const BLITZ_3_2: TimeControl = { base: 180_000, inc: 2_000, label: "3 | 2" };

/* ---------------------------------- client → server ---------------------------------- */

export type ClientMessage =
  | { t: "join"; matchId: string; token: string; lastSeq?: number }
  | { t: "move"; matchId: string; ply: number; uci: string; san?: string; clientTs: number }
  | { t: "resign"; matchId: string }
  | { t: "draw_offer"; matchId: string }
  | { t: "resync"; matchId: string; lastSeq: number }
  | { t: "ping"; ts: number };

/* ---------------------------------- server → client ---------------------------------- */

export interface MoveFrame {
  ply: number;
  uci: string;
  san: string;
  by: Color;
  /** engine/cloud evaluation in centipawns from white's perspective (optional) */
  cp?: number;
  zh?: string;
  /** authoritative remaining clocks AFTER the move + increment */
  clock: { w: number; b: number };
}

export type ServerMessage =
  | ({ t: "state"; seq: number } & DuelState)
  | { t: "move"; seq: number; move: MoveFrame; turn: Color; serverTs: number }
  | { t: "clock"; seq: number; w: number; b: number; turn: Color; serverTs: number }
  | { t: "eval"; seq: number; cp: number; depth: number; mind?: Record<string, number> }
  | { t: "over"; seq: number; outcome: Outcome; reason: EndReason; ratingDelta?: number }
  | { t: "rejected"; seq: number; ply: number; code: "illegal" | "not_your_turn" | "stale"; fen: string }
  | { t: "resync"; seq: number; frames: ServerMessage[] }
  | { t: "pong"; ts: number; serverTs: number };

/** Full authoritative snapshot — sent on join and on any resync gap too large to replay. */
export interface DuelState {
  matchId: string;
  you: Color;
  turn: Color;
  fen: string;
  tc: TimeControl;
  clock: { w: number; b: number };
  moves: MoveFrame[];
  cp: number;
  depth: number;
  mind: Record<string, number>;
  players: Record<Color, { name: string; elo: number; title?: string }>;
  status: "waiting" | "live" | "over";
  outcome?: Outcome;
  reason?: EndReason;
}

export type ConnectionPhase = "idle" | "connecting" | "live" | "resyncing" | "offline";
