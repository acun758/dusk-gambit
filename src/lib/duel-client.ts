import {
  BLITZ_3_2,
  type ClientMessage,
  type Color,
  type ConnectionPhase,
  type DuelState,
  type MoveFrame,
  type ServerMessage,
} from "./duel-protocol";
import { Chess } from "chess.js";
import { AI_LEVELS, aiLevel, chooseMove, evaluatePosition, type AiLevelId } from "@/core/ai";
import { mindIndex } from "@/core/score";

/**
 * Transport-agnostic duel client.
 *
 * - When `VITE_DUEL_WS_URL` is configured it talks to the authoritative game
 *   server over WebSocket using the frames in `duel-protocol.ts`.
 * - Otherwise it runs an in-browser arbiter that speaks the exact same frames,
 *   so the UI (clocks, move log, eval, reconnect replay) is fully playable and
 *   the real server can be dropped in without touching any component.
 */

export interface DuelListener {
  (msg: ServerMessage, phase: ConnectionPhase): void;
}

function baseState(matchId: string, you: Color, levelId: AiLevelId): DuelState {
  const level = aiLevel(levelId);
  return {
    matchId,
    you,
    turn: "w",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tc: BLITZ_3_2,
    clock: { w: BLITZ_3_2.base, b: BLITZ_3_2.base },
    moves: [],
    cp: 0,
    depth: level.depth,
    mind: { load: 46, anxiety: 22, structure: 71, instinct: 58 },
    players: {
      w: { name: "你", elo: 1000 },
      b: { name: `AI · ${level.zh}`, elo: level.elo },
    },
    status: "live",
  };
}

export class DuelClient {
  private listeners = new Set<DuelListener>();
  private seq = 0;
  private buffer: ServerMessage[] = [];
  private state: DuelState;
  private ws: WebSocket | null = null;
  private tick: ReturnType<typeof setInterval> | null = null;
  private botTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTs = 0;
  private phase: ConnectionPhase = "idle";
  private paused = false;
  /** 落子串行队列：AI 搜索与玩家落子不得并发改写同一份局面 */
  private queue: Promise<void> = Promise.resolve();

  private readonly url: string | undefined;

  constructor(
    private matchId: string,
    private you: Color = "w",
    private levelId: AiLevelId = "club",
  ) {
    this.state = baseState(matchId, you, levelId);
    this.url = (import.meta.env["VITE_DUEL_WS_URL"] as string | undefined) || undefined;
  }

  /** 切换 AI 陪练段位（立即生效于下一手）。 */
  setLevel(levelId: AiLevelId) {
    this.levelId = levelId;
    const level = aiLevel(levelId);
    this.state.players = { ...this.state.players, b: { name: `AI · ${level.zh}`, elo: level.elo } };
    this.state.depth = level.depth;
    this.emit({ t: "state", seq: ++this.seq, ...this.state }, this.phase === "idle" ? "live" : this.phase);
  }

  get levels() {
    return AI_LEVELS;
  }

  get snapshot(): DuelState {
    return this.state;
  }
  get connection(): ConnectionPhase {
    return this.phase;
  }
  get transport(): "server" | "local" {
    return this.url ? "server" : "local";
  }

  on(fn: DuelListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  connect(lastSeq = 0) {
    this.setPhase(lastSeq ? "resyncing" : "connecting");
    if (this.url) {
      const ws = new WebSocket(`${this.url}?match=${this.matchId}`);
      this.ws = ws;
      ws.onopen = () => this.send({ t: "join", matchId: this.matchId, token: "", lastSeq });
      ws.onmessage = (e) => {
        try {
          this.emit(JSON.parse(e.data as string) as ServerMessage, "live");
        } catch {
          /* ignore malformed frame */
        }
      };
      ws.onclose = () => {
        this.setPhase("offline");
        // 断线自动追帧：重连时带上 lastSeq，服务端回放缺失帧
        setTimeout(() => this.connect(this.seq), 1200);
      };
      return;
    }
    this.startLocalArbiter(lastSeq);
  }

  /** 本地陪练暂停/继续：停表并暂停 AI 思考。天梯真人局由服务端仲裁，不可暂停。 */
  setPaused(next: boolean) {
    if (this.url) return;
    this.paused = next;
    if (next) {
      if (this.tick) clearInterval(this.tick);
      if (this.botTimer) clearTimeout(this.botTimer);
      this.tick = null;
      this.botTimer = null;
      return;
    }
    this.lastTs = Date.now();
    this.tick = setInterval(() => this.tickClock(), 250);
    this.scheduleBot();
  }

  get isPaused() {
    return this.paused;
  }

  disconnect() {
    if (this.tick) clearInterval(this.tick);
    if (this.botTimer) clearTimeout(this.botTimer);
    this.tick = null;
    this.botTimer = null;
    this.ws?.close();
    this.ws = null;
  }

  /** Simulate a dropped connection to exercise the 追帧 path. */
  simulateDrop(ms = 2600) {
    if (this.url) {
      this.ws?.close();
      return;
    }
    if (this.tick) clearInterval(this.tick);
    this.tick = null;
    this.setPhase("offline");
    setTimeout(() => this.startLocalArbiter(this.seq), ms);
  }

  send(msg: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
      return;
    }
    if (!this.url) this.localHandle(msg);
  }

  playMove(uci?: string) {
    this.send({
      t: "move",
      matchId: this.matchId,
      ply: this.state.moves.length + 1,
      uci: uci ?? "",
      clientTs: Date.now(),
    });
  }

  resign() {
    this.send({ t: "resign", matchId: this.matchId });
  }

  /**
   * 悔棋：仅本地 AI 陪练可用（真人天梯由服务端仲裁，不提供悔棋）。
   * 退回到自己上一次落子之前的局面，时钟不返还。
   */
  takeback(): boolean {
    if (this.url) return false;
    if (this.state.status !== "live") return false;
    const moves = [...this.state.moves];
    if (!moves.length) return false;
    // 至少退一手，并一直退到重新轮到自己
    let popped = 0;
    while (moves.length && (popped === 0 || this.turnAfter(moves) !== this.you)) {
      moves.pop();
      popped += 1;
    }
    const chess = new Chess();
    for (const m of moves) {
      const promotion = m.uci[4];
      try {
        chess.move({ from: m.uci.slice(0, 2), to: m.uci.slice(2, 4), ...(promotion ? { promotion } : {}) });
      } catch {
        return false;
      }
    }
    this.state.moves = moves;
    this.state.fen = chess.fen();
    this.state.turn = chess.turn() as Color;
    this.state.clock = moves.at(-1)?.clock ? { ...(moves.at(-1) as MoveFrame).clock } : { w: this.state.tc.base, b: this.state.tc.base };
    this.state.cp = moves.at(-1)?.cp ?? 0;
    this.lastTs = Date.now();
    this.emit({ t: "state", seq: ++this.seq, ...this.state }, "live");
    return true;
  }

  private turnAfter(moves: MoveFrame[]): Color {
    return moves.length % 2 === 0 ? "w" : "b";
  }

  /* ------------------------------ local arbiter ------------------------------ */

  private startLocalArbiter(lastSeq: number) {
    const missed = this.buffer.filter((f) => "seq" in f && (f as { seq: number }).seq > lastSeq);
    this.setPhase("live");
    if (lastSeq && missed.length) {
      this.emit({ t: "resync", seq: this.seq, frames: missed }, "live");
    } else {
      this.emit({ t: "state", seq: ++this.seq, ...this.state }, "live");
    }
    this.lastTs = Date.now();
    this.tick = setInterval(() => this.tickClock(), 250);
    this.scheduleBot();
  }

  private tickClock() {
    if (this.state.status !== "live" || this.paused) return;
    const now = Date.now();
    const dt = now - this.lastTs;
    this.lastTs = now;
    const turn = this.state.turn;
    this.state.clock[turn] = Math.max(0, this.state.clock[turn] - dt);
    this.emit(
      {
        t: "clock",
        seq: ++this.seq,
        w: this.state.clock.w,
        b: this.state.clock.b,
        turn,
        serverTs: now,
      },
      "live",
    );
    if (this.state.clock[turn] === 0) {
      this.state.status = "over";
      this.emit(
        {
          t: "over",
          seq: ++this.seq,
          outcome: turn === "w" ? "black" : "white",
          reason: "timeout",
        },
        "live",
      );
    }
  }

  private scheduleBot() {
    if (this.botTimer) clearTimeout(this.botTimer);
    this.botTimer = setTimeout(
      () => {
        if (this.state.status === "live" && this.state.turn !== this.you) void this.applyMove();
        this.scheduleBot();
      },
      1800 + Math.random() * 2200,
    );
  }

  private localHandle(msg: ClientMessage) {
    if (this.paused) return;
    if (msg.t === "move") {
      if (this.state.turn !== this.you) {
        this.emit(
          { t: "rejected", seq: ++this.seq, ply: msg.ply, code: "not_your_turn", fen: this.state.fen },
          "live",
        );
        return;
      }
      void this.applyMove(msg.uci || undefined);
    }
    if (msg.t === "resign") {
      this.state.status = "over";
      this.emit(
        {
          t: "over",
          seq: ++this.seq,
          outcome: this.you === "w" ? "black" : "white",
          reason: "resign",
        },
        "live",
      );
    }
  }

  /**
   * 串行化落子：AI 搜索是异步的，若玩家在搜索期间落子，两边会基于同一份旧局面
   * 各自推演并互相覆盖，导致“点击格子与实际走子不符”。这里用队列保证一次只
   * 处理一手，并在拿到锁之后重新核对轮次。
   */
  private applyMove(requested?: string) {
    const run = this.queue.then(async () => {
      if (this.state.status !== "live") return;
      if (requested && this.state.turn !== this.you) {
        this.emit(
          { t: "rejected", seq: ++this.seq, ply: this.state.moves.length + 1, code: "not_your_turn", fen: this.state.fen },
          "live",
        );
        return;
      }
      if (!requested && this.state.turn === this.you) return;
      await this.applyMoveInner(requested);
    });
    this.queue = run.catch(() => undefined);
    return run;
  }


  private async applyMoveInner(requested?: string) {
    const idx = this.state.moves.length;
    const chess = new Chess(this.state.fen);
    const level = aiLevel(this.levelId);
    const engine = requested ? null : await chooseMove(this.state.fen, level);
    const uci = requested || engine?.uci || "";
    let played;
    try {
      const promotion = uci[4];
      played = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(promotion ? { promotion } : {}) });
    } catch { played = null; }
    if (!played) {
      const fallback = chess.moves({ verbose: true })[0];
      if (!fallback) return;
      played = chess.move(fallback.san);
    }
    if (!played) return;
    const evaluated = engine?.cp ?? (await evaluatePosition(chess.fen(), 2));

    const s = {
      uci: `${played.from}${played.to}${played.promotion ?? ""}`,
      san: played.san,
      zh: requested ? "实战落子" : `${level.zh}应手`,
      cp: Math.max(-2000, Math.min(2000, Math.round(evaluated))),
    };
    const by = this.state.turn;
    this.state.clock[by] = this.state.clock[by] + this.state.tc.inc;
    const move: MoveFrame = {
      ply: idx + 1,
      uci: s.uci,
      san: s.san,
      by,
      zh: s.zh,
      cp: s.cp,
      clock: { ...this.state.clock },
    };
    this.state.moves = [...this.state.moves, move];
    this.state.fen = chess.fen();
    this.state.turn = by === "w" ? "b" : "w";
    this.state.cp = s.cp;
    this.state.mind = { ...mindIndex(idx), instinct: Math.min(97, 55 + idx * 4) };
    this.emit({ t: "move", seq: ++this.seq, move, turn: this.state.turn, serverTs: Date.now() }, "live");
    this.emit({ t: "eval", seq: ++this.seq, cp: s.cp, depth: 6, mind: this.state.mind }, "live");
  }

  /* --------------------------------- plumbing --------------------------------- */

  private setPhase(p: ConnectionPhase) {
    this.phase = p;
  }

  private emit(msg: ServerMessage, phase: ConnectionPhase) {
    if ("seq" in msg) this.seq = Math.max(this.seq, (msg as { seq: number }).seq);
    if (msg.t !== "clock") {
      this.buffer.push(msg);
      if (this.buffer.length > 200) this.buffer.shift();
    }
    this.setPhase(phase);
    this.listeners.forEach((l) => l(msg, phase));
  }
}
