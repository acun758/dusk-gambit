import { useEffect, useMemo, useRef, useState } from "react";
import { DuelClient } from "@/lib/duel-client";
import type { ConnectionPhase, DuelState, MoveFrame, ServerMessage } from "@/lib/duel-protocol";

export interface DuelSession {
  state: DuelState;
  phase: ConnectionPhase;
  transport: "server" | "local";
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

/** Live 3+2 duel session driven by authoritative server frames (or the local arbiter). */
export function useDuelSession(matchId = "blitz-3-2-demo"): DuelSession {
  const clientRef = useRef<DuelClient | null>(null);
  if (!clientRef.current) clientRef.current = new DuelClient(matchId, "w");
  const client = clientRef.current;

  const [state, setState] = useState<DuelState>(client.snapshot);
  const [phase, setPhase] = useState<ConnectionPhase>("idle");

  useEffect(() => {
    const apply = (msg: ServerMessage) => {
      setState((prev) => {
        switch (msg.t) {
          case "state": {
            const { t: _t, seq: _seq, ...snap } = msg;
            return snap;
          }
          case "move":
            return {
              ...prev,
              moves: [...prev.moves, msg.move],
              clock: msg.move.clock,
              turn: msg.turn,
              cp: msg.move.cp ?? prev.cp,
            };
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
  }, [client]);

  return useMemo(
    () => ({
      state,
      phase,
      transport: client.transport,
      moves: state.moves,
      clock: state.clock,
      cp: state.cp,
      mind: state.mind,
      playMove: () => client.playMove(),
      resign: () => client.resign(),
      simulateDrop: () => client.simulateDrop(),
    }),
    [state, phase, client],
  );
}
