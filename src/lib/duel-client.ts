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

const SCRIPT: { uci: string; san: string; by: Color; zh: string; cp: number }[] = [
  { uci: "e2e4", san: "e4", by: "w", zh: "王前兵开局", cp: 24 },
  { uci: "c7c5", san: "c5", by: "b", zh: "西西里防御", cp: 18 },
  { uci: "g1f3", san: "Nf3", by: "w", zh: "出马控中", cp: 31 },
  { uci: "d7d6", san: "d6", by: "b", zh: "稳固中心", cp: 27 },
  { uci: "d2d4", san: "d4", by: "w", zh: "中心突破", cp: 44 },
  { uci: "c5d4", san: "cxd4", by: "b", zh: "兑子换线", cp: 36 },
  { uci: "f3d4", san: "Nxd4", by: "w", zh: "马占要津", cp: 52 },
  { uci: "g8f6", san: "Nf6", by: "b", zh: "反压中心", cp: 41 },
  { uci: "b1c3", san: "Nc3", by: "w", zh: "双马联防", cp: 58 },
  { uci: "a7a6", san: "a6", by: "b", zh: "纳道尔夫", cp: 47 },
];

function baseState(matchId: string, you: Color): DuelState {
  return {
    matchId,
    you,
    turn: "w",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tc: BLITZ_3_2,
    clock: { w: BLITZ_3_2.base, b: BLITZ_3_2.base },
    moves: [],
    cp: 18,
    depth: 6,
    mind: { load: 46, anxiety: 22, structure: 71, instinct: 58 },
    players: {
      w: { name: "Adiamond", elo: 2480, title: "GM" },
      b: { name: "Lord Cinders", elo: 2510, title: "GM" },
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
  private readonly url: string | undefined;

  constructor(
    private matchId: string,
    private you: Color = "w",
  ) {
    this.state = baseState(matchId, you);
    this.url = (import.meta.env["VITE_DUEL_WS_URL"] as string | undefined) || undefined;
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
    if (this.state.status !== "live") return;
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
        if (this.state.status === "live" && this.state.turn !== this.you) this.applyMove();
        this.scheduleBot();
      },
      1800 + Math.random() * 2200,
    );
  }

  private localHandle(msg: ClientMessage) {
    if (msg.t === "move") {
      if (this.state.turn !== this.you) {
        this.emit(
          { t: "rejected", seq: ++this.seq, ply: msg.ply, code: "not_your_turn", fen: this.state.fen },
          "live",
        );
        return;
      }
      this.applyMove(msg.uci || undefined);
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

  private applyMove(requested?: string) {
    const idx = this.state.moves.length;
    const chess = new Chess(this.state.fen);
    const level = aiLevel(this.levelId);
    const engine = requested ? null : chooseMove(this.state.fen, level);
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
    const evaluated = engine?.cp ?? evaluate(chess);
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
    this.state.mind = {
      load: Math.min(98, 40 + idx * 5),
      anxiety: Math.min(96, 18 + idx * 6),
      structure: Math.max(38, 74 - idx * 2),
      instinct: Math.min(97, 55 + idx * 4),
    };
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
