import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DuelClient } from "@/lib/duel-client";
import { supabase } from "@/integrations/supabase/client";
import { claimTimeout, findMatch, getMatch, resignMatch, submitMove } from "@/lib/game.functions";
import type { ConnectionPhase, Color, DuelState, MoveFrame, ServerMessage } from "@/lib/duel-protocol";
import { BLITZ_3_2 } from "@/lib/duel-protocol";

export interface DuelSession {
  state: DuelState;
  phase: ConnectionPhase;
  transport: "server" | "local" | "cloud";
  moves: MoveFrame[];
  clock: { w: number; b: number };
  cp: number;
  mind: Record<string, number>;
  playMove: () => void;
  resign: () => void;
  simulateDrop: () => void;
}

export function fmtClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  const tenth = ms < 20_000 ? `.${Math.floor((Math.max(0, ms) % 1000) / 100)}` : "";
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${tenth}`;
}

/** 演示用的着法序列——真实引擎（Cocos WASM，深度 4~6）接入后替换这里即可。 */
const SCRIPT = [
  { uci: "e2e4", san: "e4", zh: "王前兵开局", cp: 24 },
  { uci: "c7c5", san: "c5", zh: "西西里防御", cp: 18 },
  { uci: "g1f3", san: "Nf3", zh: "出马控中", cp: 31 },
  { uci: "d7d6", san: "d6", zh: "稳固中心", cp: 27 },
  { uci: "d2d4", san: "d4", zh: "中心突破", cp: 44 },
  { uci: "c5d4", san: "cxd4", zh: "兑子换线", cp: 36 },
  { uci: "f3d4", san: "Nxd4", zh: "马占要津", cp: 52 },
  { uci: "g8f6", san: "Nf6", zh: "反压中心", cp: 41 },
  { uci: "b1c3", san: "Nc3", zh: "双马联防", cp: 58 },
  { uci: "a7a6", san: "a6", zh: "纳道尔夫", cp: 47 },
];

interface MatchRowLite {
  id: string;
  white_name: string;
  black_name: string;
  white_elo: number;
  black_elo: number;
  tc_base: number;
  tc_inc: number;
  clock_w: number;
  clock_b: number;
  turn: string;
  ply: number;
  seq: number;
  cp: number;
  status: string;
  outcome: string | null;
  reason: string | null;
  last_move_at: string;
}

interface MoveRowLite {
  seq: number;
  ply: number;
  uci: string;
  san: string;
  by: string;
  zh: string | null;
  cp: number | null;
  clock_w: number;
  clock_b: number;
}

function mindFor(ply: number): Record<string, number> {
  return {
    load: Math.min(98, 40 + ply * 5),
    anxiety: Math.min(96, 18 + ply * 6),
    structure: Math.max(38, 74 - ply * 2),
    instinct: Math.min(97, 55 + ply * 4),
  };
}

function stateFrom(match: MatchRowLite, you: Color, moves: MoveRowLite[]): DuelState {
  return {
    matchId: match.id,
    you,
    turn: match.turn as Color,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tc: { base: match.tc_base, inc: match.tc_inc, label: `${Math.round(match.tc_base / 60000)} | ${match.tc_inc / 1000}` },
    clock: { w: match.clock_w, b: match.clock_b },
    moves: moves.map((m) => ({
      ply: m.ply,
      uci: m.uci,
      san: m.san,
      by: m.by as Color,
      zh: m.zh ?? undefined,
      cp: m.cp ?? undefined,
      clock: { w: m.clock_w, b: m.clock_b },
    })),
    cp: match.cp,
    depth: 6,
    mind: mindFor(match.ply),
    players: {
      w: { name: match.white_name, elo: match.white_elo, title: "GM" },
      b: { name: match.black_name, elo: match.black_elo, title: "GM" },
    },
    status: match.status === "over" ? "over" : match.status === "waiting" ? "waiting" : "live",
    ...(match.outcome ? { outcome: match.outcome as DuelState["outcome"] } : {}),
    ...(match.reason ? { reason: match.reason as DuelState["reason"] } : {}),
  };
}

/**
 * 3+2 天梯对局。已登录时走 Lovable Cloud 的服务端仲裁（时钟、着法、胜负都以服务端为准，
 * 实时频道推送对手落子，重连时按 seq 追帧）；未登录时退回本地仲裁器，页面照样可玩。
 */
export function useDuelSession(): DuelSession {
  const [cloud, setCloud] = useState<{ match: MatchRowLite; you: Color } | null>(null);
  const [moves, setMoves] = useState<MoveRowLite[]>([]);
  const [phase, setPhase] = useState<ConnectionPhase>("idle");
  const [mode, setMode] = useState<"unknown" | "cloud" | "local">("unknown");
  const [tick, setTick] = useState(0);
  const lastSeq = useRef(0);
  const matchRef = useRef<MatchRowLite | null>(null);

  /* -------------------------------- cloud mode -------------------------------- */

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setMode("local");
        return;
      }
      setMode("cloud");
      setPhase("connecting");
      try {
        const res = await findMatch();
        if (cancelled) return;
        matchRef.current = res.match as unknown as MatchRowLite;
        setCloud({ match: res.match as unknown as MatchRowLite, you: res.you });
        lastSeq.current = res.match.seq;
        const full = await getMatch({ data: { matchId: res.match.id, lastSeq: 0 } });
        if (cancelled) return;
        setMoves(full.moves as unknown as MoveRowLite[]);
        setPhase("live");
      } catch {
        if (!cancelled) setMode("local");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // realtime：对手落子与对局状态
  useEffect(() => {
    const matchId = cloud?.match.id;
    if (!matchId) return;
    const channel = supabase
      .channel(`duel-${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as MatchRowLite;
          matchRef.current = row;
          setCloud((prev) => (prev ? { ...prev, match: row } : prev));
          setPhase("live");
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_moves", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as MoveRowLite;
          lastSeq.current = Math.max(lastSeq.current, row.seq);
          setMoves((prev) => (prev.some((m) => m.ply === row.ply) ? prev : [...prev, row]));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [cloud?.match.id]);

  // 断线追帧：页面回到前台或网络恢复时按 lastSeq 拉缺失帧
  useEffect(() => {
    const matchId = cloud?.match.id;
    if (!matchId) return;
    const resync = async () => {
      setPhase("resyncing");
      try {
        const res = await getMatch({ data: { matchId, lastSeq: lastSeq.current } });
        matchRef.current = res.match as unknown as MatchRowLite;
        setCloud((prev) => (prev ? { ...prev, match: res.match as unknown as MatchRowLite } : prev));
        const frames = res.moves as unknown as MoveRowLite[];
        if (frames.length) {
          lastSeq.current = Math.max(lastSeq.current, ...frames.map((f) => f.seq));
          setMoves((prev) => {
            const seen = new Set(prev.map((m) => m.ply));
            return [...prev, ...frames.filter((f) => !seen.has(f.ply))].sort((a, b) => a.ply - b.ply);
          });
        }
        setPhase("live");
      } catch {
        setPhase("offline");
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void resync();
    };
    window.addEventListener("online", () => void resync());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", () => void resync());
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [cloud?.match.id]);

  // 本地插值时钟（250ms），到点后请求服务端判负
  useEffect(() => {
    if (mode !== "cloud") return;
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [mode]);

  const claimedRef = useRef(false);
  useEffect(() => {
    const m = matchRef.current;
    if (!m || m.status !== "live" || claimedRef.current) return;
    const elapsed = Date.now() - new Date(m.last_move_at).getTime();
    const remaining = (m.turn === "w" ? m.clock_w : m.clock_b) - elapsed;
    if (remaining > 0) return;
    claimedRef.current = true;
    void claimTimeout({ data: { matchId: m.id } }).finally(() => {
      claimedRef.current = false;
    });
  }, [tick]);

  /* -------------------------------- local mode -------------------------------- */

  const clientRef = useRef<DuelClient | null>(null);
  const [localState, setLocalState] = useState<DuelState | null>(null);

  useEffect(() => {
    if (mode !== "local") return;
    if (!clientRef.current) clientRef.current = new DuelClient("blitz-3-2-demo", "w");
    const client = clientRef.current;
    setLocalState(client.snapshot);
    const apply = (msg: ServerMessage) => {
      setLocalState((prev) => {
        if (!prev) return prev;
        switch (msg.t) {
          case "state": {
            const { t: _t, seq: _seq, ...snap } = msg;
            return snap;
          }
          case "move":
            return { ...prev, moves: [...prev.moves, msg.move], clock: msg.move.clock, turn: msg.turn, cp: msg.move.cp ?? prev.cp };
          case "clock":
            return { ...prev, clock: { w: msg.w, b: msg.b }, turn: msg.turn };
          case "eval":
            return { ...prev, cp: msg.cp, depth: msg.depth, mind: msg.mind ?? prev.mind };
          case "over":
            return { ...prev, status: "over", outcome: msg.outcome, reason: msg.reason };
          case "resync":
            msg.frames.forEach(apply);
            return prev;
          default:
            return prev;
        }
      });
    };
    const off = client.on((msg, p) => {
      apply(msg);
      setPhase(p);
    });
    client.connect();
    return () => {
      off();
      client.disconnect();
    };
  }, [mode]);

  /* --------------------------------- actions --------------------------------- */

  const playMove = useCallback(() => {
    if (mode === "local") {
      clientRef.current?.playMove();
      return;
    }
    const m = matchRef.current;
    if (!m || m.status !== "live") return;
    const s = SCRIPT[m.ply % SCRIPT.length]!;
    void submitMove({ data: { matchId: m.id, uci: s.uci, san: s.san, zh: s.zh, cp: s.cp } });
  }, [mode]);

  const resign = useCallback(() => {
    if (mode === "local") {
      clientRef.current?.resign();
      return;
    }
    const m = matchRef.current;
    if (m) void resignMatch({ data: { matchId: m.id } });
  }, [mode]);

  const simulateDrop = useCallback(() => {
    if (mode === "local") {
      clientRef.current?.simulateDrop();
      return;
    }
    setPhase("offline");
    setTimeout(() => setPhase("resyncing"), 1200);
    setTimeout(() => {
      const m = matchRef.current;
      if (!m) return;
      void getMatch({ data: { matchId: m.id, lastSeq: lastSeq.current } }).then((res) => {
        matchRef.current = res.match as unknown as MatchRowLite;
        setCloud((prev) => (prev ? { ...prev, match: res.match as unknown as MatchRowLite } : prev));
        setPhase("live");
      });
    }, 2400);
  }, [mode]);

  /* ------------------------------- derived state ------------------------------ */

  return useMemo<DuelSession>(() => {
    if (mode === "cloud" && cloud) {
      const base = stateFrom(cloud.match, cloud.you, moves);
      const elapsed = base.status === "live" ? Date.now() - new Date(cloud.match.last_move_at).getTime() : 0;
      const clock = {
        w: base.turn === "w" ? Math.max(0, base.clock.w - elapsed) : base.clock.w,
        b: base.turn === "b" ? Math.max(0, base.clock.b - elapsed) : base.clock.b,
      };
      const last = moves[moves.length - 1];
      const state: DuelState = { ...base, clock, cp: last?.cp ?? base.cp, mind: mindFor(moves.length) };
      return {
        state,
        phase,
        transport: "cloud",
        moves: state.moves,
        clock,
        cp: state.cp,
        mind: state.mind,
        playMove,
        resign,
        simulateDrop,
      };
    }

    const fallback: DuelState = localState ?? {
      matchId: "blitz-3-2-demo",
      you: "w",
      turn: "w",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      tc: BLITZ_3_2,
      clock: { w: BLITZ_3_2.base, b: BLITZ_3_2.base },
      moves: [],
      cp: 18,
      depth: 6,
      mind: mindFor(0),
      players: { w: { name: "Adiamond", elo: 2480 }, b: { name: "Lord Cinders", elo: 2510 } },
      status: "live",
    };
    return {
      state: fallback,
      phase,
      transport: "local",
      moves: fallback.moves,
      clock: fallback.clock,
      cp: fallback.cp,
      mind: fallback.mind,
      playMove,
      resign,
      simulateDrop,
    };
    // tick 驱动时钟插值刷新
  }, [mode, cloud, moves, phase, localState, playMove, resign, simulateDrop, tick]);
}
