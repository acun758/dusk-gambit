import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { DuelClient } from "@/lib/duel-client";
import { supabase } from "@/integrations/supabase/client";
import {
  cancelWaitingMatch,
  claimTimeout,
  findMatch,
  getActiveMatch,
  getMatch,
  getMatchRatings,
  resignMatch,
  submitMove,
} from "@/lib/game.functions";
import type { ConnectionPhase, Color, DuelState, MoveFrame, ServerMessage } from "@/lib/duel-protocol";
import { aiLevel, type AiLevelId } from "@/core/ai";
import { BLITZ_3_2 } from "@/lib/duel-protocol";

export interface LiveRating {
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  /** 对局中的头像快照，换装后双方棋盘上实时同步 */
  avatarKey?: string;
  avatarUrl?: string | null;
  pieceSetId?: string;
}

export interface DuelRatings {
  w: LiveRating | null;
  b: LiveRating | null;
  ratingDelta: number | null;
}

export interface DuelSession {
  state: DuelState;
  phase: ConnectionPhase;
  transport: "server" | "local" | "cloud";
  moves: MoveFrame[];
  clock: { w: number; b: number };
  cp: number;
  mind: Record<string, number>;
  notice: string | null;
  movePending: boolean;
  aiLevelId: AiLevelId;
  /** 真人对局中双方的实时积分，每一步与重连后都会刷新 */
  ratings: DuelRatings | null;
  resumed: boolean;
  /** 本地陪练可暂停；真人天梯由服务端仲裁，不可暂停 */
  canPause: boolean;
  paused: boolean;
  togglePause: () => void;
  restart: () => void;
  setAiLevel: (id: AiLevelId) => void;
  startRanked: () => void;
  playMove: (uci?: string) => void;
  resign: () => void;
  simulateDrop: () => void;
  useLocalPractice: () => void;
}

export function fmtClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  const tenth = ms < 20_000 ? `.${Math.floor((Math.max(0, ms) % 1000) / 100)}` : "";
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${tenth}`;
}

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
  fen: string;
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
  const state: DuelState = {
    matchId: match.id,
    you,
    turn: match.turn as Color,
    fen: match.fen,
    tc: { base: match.tc_base, inc: match.tc_inc, label: `${Math.round(match.tc_base / 60000)} | ${match.tc_inc / 1000}` },
    clock: { w: match.clock_w, b: match.clock_b },
    moves: moves.map((m) => {
      const frame: MoveFrame = {
        ply: m.ply,
        uci: m.uci,
        san: m.san,
        by: m.by as Color,
        clock: { w: m.clock_w, b: m.clock_b },
      };
      if (m.zh) frame.zh = m.zh;
      if (m.cp !== null) frame.cp = m.cp;
      return frame;
    }),
    cp: match.cp,
    depth: 6,
    mind: mindFor(match.ply),
    players: {
      w: { name: match.white_name, elo: match.white_elo, title: "GM" },
      b: { name: match.black_name, elo: match.black_elo, title: "GM" },
    },
    status: match.status === "over" ? "over" : match.status === "waiting" ? "waiting" : "live",
  };
  if (match.outcome) state.outcome = match.outcome as NonNullable<DuelState["outcome"]>;
  if (match.reason) state.reason = match.reason as NonNullable<DuelState["reason"]>;
  return state;
}

/**
 * 3+2 天梯对局。已登录时走 Lovable Cloud 的服务端仲裁（时钟、着法、胜负都以服务端为准，
 * 实时频道推送对手落子，重连时按 seq 追帧）；未登录时退回本地仲裁器，页面照样可玩。
 */
export function useDuelSession(): DuelSession {
  const [cloud, setCloud] = useState<{ match: MatchRowLite; you: Color } | null>(null);
  const [moves, setMoves] = useState<MoveRowLite[]>([]);
  const [phase, setPhase] = useState<ConnectionPhase>("idle");
  const [mode, setMode] = useState<"unknown" | "cloud" | "local" | "error">("unknown");
  const [notice, setNotice] = useState<string | null>(null);
  const [movePending, setMovePending] = useState(false);
  const [levelId, setLevelId] = useState<AiLevelId>("club");
  const [tick, setTick] = useState(0);
  const [matchmakingKey, setMatchmakingKey] = useState(0);
  const [ratings, setRatings] = useState<DuelRatings | null>(null);
  const [resumed, setResumed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [localKey, setLocalKey] = useState(0);
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
      // 重连恢复：先看有没有未结束的真人对局，有就直接回到原局面，积分不丢失
      if (matchmakingKey === 0) {
        try {
          const active = await getActiveMatch();
          if (cancelled) return;
          if (!active) {
            setMode("local");
            return;
          }
          matchRef.current = active.match as unknown as MatchRowLite;
          setCloud({ match: active.match as unknown as MatchRowLite, you: active.you });
          setMoves(active.moves as unknown as MoveRowLite[]);
          lastSeq.current = active.match.seq;
          setResumed(true);
          setMode("cloud");
          setPhase(active.match.status === "waiting" ? "connecting" : "live");
          setNotice("已恢复上一局未结束的天梯对局，时钟与积分沿用服务端记录。");
        } catch {
          if (!cancelled) setMode("local");
        }
        return;
      }
      setMode("cloud");
      setPhase("connecting");
      setResumed(false);
      try {
        const res = await findMatch();
        if (cancelled) return;
        matchRef.current = res.match as unknown as MatchRowLite;
        setCloud({ match: res.match as unknown as MatchRowLite, you: res.you });
        lastSeq.current = res.match.seq;
        const full = await getMatch({ data: { matchId: res.match.id, lastSeq: 0 } });
        if (cancelled) return;
        setMoves(full.moves as unknown as MoveRowLite[]);
        setPhase(res.match.status === "waiting" ? "connecting" : "live");
      } catch {
        if (!cancelled) {
          setMode("error");
          setPhase("offline");
          setNotice("真人对局暂时连接失败，可切换到本地陪练。已登录数据不会受影响。");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchmakingKey]);

  // 头像或装备更换后立刻重新拉取双方资料
  const [avatarTick, setAvatarTick] = useState(0);
  useEffect(() => {
    const bump = () => setAvatarTick((n) => n + 1);
    window.addEventListener("bs:profile", bump);
    window.addEventListener("bs:piece-set", bump);
    return () => {
      window.removeEventListener("bs:profile", bump);
      window.removeEventListener("bs:piece-set", bump);
    };
  }, []);

  // 每一步、每次状态变化都同步双方实时积分
  useEffect(() => {
    const matchId = cloud?.match.id;
    if (!matchId || mode !== "cloud") return;
    let cancelled = false;
    void getMatchRatings({ data: { matchId } })
      .then((r) => {
        if (!cancelled) setRatings(r as DuelRatings);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [cloud?.match.id, cloud?.match.status, cloud?.match.seq, moves.length, mode, avatarTick]);


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
          setPhase(row.status === "waiting" ? "connecting" : "live");
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => setAvatarTick((n) => n + 1),
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
        setPhase(res.match.status === "waiting" ? "connecting" : "live");
      } catch {
        setPhase("offline");
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void resync();
    };
    const onOnline = () => void resync();
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
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
    if (!clientRef.current) clientRef.current = new DuelClient(`blitz-3-2-${localKey}`, "w", levelId);
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
          case "move": {
            if (prev.moves.some((m) => m.ply === msg.move.ply)) return prev;
            let fen = prev.fen;
            try {
              const board = new Chess(prev.fen);
              const promotion = msg.move.uci[4];
              board.move({
                from: msg.move.uci.slice(0, 2),
                to: msg.move.uci.slice(2, 4),
                ...(promotion ? { promotion } : {}),
              });
              fen = board.fen();
            } catch {
              /* 保留权威局面 */
            }
            return {
              ...prev,
              fen,
              moves: [...prev.moves, msg.move],
              clock: msg.move.clock,
              turn: msg.turn,
              cp: msg.move.cp ?? prev.cp,
            };
          }
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
  }, [mode, localKey]);

  const togglePause = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;
    const next = !client.isPaused;
    client.setPaused(next);
    setPaused(next);
  }, []);

  /** 重新开始：仅本地陪练可用，清空棋谱与时钟重开一局 */
  const restart = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
    setLocalState(null);
    setPaused(false);
    setNotice(null);
    setMode("local");
    setPhase("connecting");
    setLocalKey((k) => k + 1);
  }, []);

  const setAiLevel = useCallback((id: AiLevelId) => {
    setLevelId(id);
    clientRef.current?.setLevel(id);
    const waitingId = matchRef.current?.status === "waiting" ? matchRef.current.id : null;
    if (waitingId) void cancelWaitingMatch({ data: { matchId: waitingId } });
    matchRef.current = null;
    setCloud(null);
    setMode("local");
  }, []);

  const startRanked = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
    setLocalState(null);
    setNotice(null);
    setMode("cloud");
    setPhase("connecting");
    setMatchmakingKey((key) => key + 1);
  }, []);

  /* --------------------------------- actions --------------------------------- */

  const playMove = useCallback((uci?: string) => {
    if (mode === "local") {
      clientRef.current?.playMove(uci);
      return;
    }
    const m = matchRef.current;
    if (!m || m.status !== "live" || movePending) return;
    if (!uci) return;
    const s = { uci, san: uci, zh: "实战落子", cp: m.cp };
    setMovePending(true);
    setNotice(null);
    void submitMove({ data: { matchId: m.id, uci: s.uci, san: s.san, zh: s.zh, cp: s.cp } })
      .then(async (result) => {
        if (result.code === "ok") return;
        const messages = {
          illegal: "这一步不符合规则，请重新选择。",
          not_your_turn: "对手刚刚完成落子，棋局正在同步。",
          stale: "棋局状态已经更新，正在恢复到最新局面。",
        } as const;
        setNotice(messages[result.code as keyof typeof messages] ?? "落子未被接受，棋局正在同步。");
        const fresh = await getMatch({ data: { matchId: m.id, lastSeq: 0 } });
        matchRef.current = fresh.match as unknown as MatchRowLite;
        setCloud((prev) => (prev ? { ...prev, match: fresh.match as unknown as MatchRowLite } : prev));
        setMoves(fresh.moves as unknown as MoveRowLite[]);
      })
      .catch(() => setNotice("落子发送失败，请检查网络后重试。"))
      .finally(() => setMovePending(false));
  }, [mode, movePending]);

  const useLocalPractice = useCallback(() => {
    setNotice(null);
    setMode("local");
    setPhase("connecting");
  }, []);

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
        notice,
        movePending,
        aiLevelId: levelId,
        ratings,
        resumed,
        canPause: false,
        paused: false,
        togglePause,
        restart,
        setAiLevel,
        startRanked,
        playMove,
        resign,
        simulateDrop,
        useLocalPractice,
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
      players: { w: { name: "你", elo: 2480 }, b: { name: `AI · ${aiLevel(levelId).zh}`, elo: aiLevel(levelId).elo } },
      status: mode === "error" ? "waiting" : "live",
    };
    return {
      state: fallback,
      phase,
      transport: mode === "error" ? "cloud" : "local",
      moves: fallback.moves,
      clock: fallback.clock,
      cp: fallback.cp,
      mind: fallback.mind,
      notice,
      movePending,
      aiLevelId: levelId,
      ratings: null,
      resumed: false,
      canPause: mode === "local",
      paused,
      togglePause,
      restart,
      setAiLevel,
      startRanked,
      playMove,
      resign,
      simulateDrop,
      useLocalPractice,
    };
    // tick 驱动时钟插值刷新
  }, [mode, cloud, moves, phase, localState, notice, movePending, playMove, resign, simulateDrop, useLocalPractice, setAiLevel, startRanked, levelId, tick, ratings, resumed, paused, togglePause, restart]);
}
