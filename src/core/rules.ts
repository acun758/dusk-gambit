/**
 * core/rules.ts — 规则层
 *
 * 红线：本文件**不自研任何规则**，只是 chess.js 的薄封装。
 * 走子合法性 / 将死 / 和棋 / 易位 / 过路兵 / 升变 全部交给 chess.js，
 * 前端与服务端校验共享同一套实现，引擎只"想"不"判"。
 * 纯计算：不含 React、不含 DOM、不含任何画面逻辑。
 */
import { Chess } from "chess.js";

export type Color = "w" | "b";
export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface AppliedMove {
  uci: string;
  san: string;
  by: Color;
  fen: string;
}

export interface PositionStatus {
  turn: Color;
  inCheck: boolean;
  checkmate: boolean;
  stalemate: boolean;
  draw: boolean;
  gameOver: boolean;
}

function load(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

export function isValidFen(fen: string): boolean {
  return load(fen) !== null;
}

export function turnOf(fen: string): Color {
  return (load(fen)?.turn() ?? "w") as Color;
}

/** 当前局面的全部合法着法（UCI）。 */
export function legalMoves(fen: string): string[] {
  const chess = load(fen);
  if (!chess) return [];
  return chess.moves({ verbose: true }).map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
}

/** 某一格可去的目标格，供棋盘高亮使用。 */
export function movesFrom(fen: string, square: string): string[] {
  const chess = load(fen);
  if (!chess) return [];
  return chess
    .moves({ verbose: true })
    .filter((m) => m.from === square)
    .map((m) => m.to);
}

export function isLegal(fen: string, uci: string): boolean {
  return applyMove(fen, uci) !== null;
}

/** 落子：非法返回 null，绝不抛异常。 */
export function applyMove(fen: string, uci: string): AppliedMove | null {
  const chess = load(fen);
  if (!chess) return null;
  const by = chess.turn() as Color;
  const promotion = uci[4];
  try {
    const played = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      ...(promotion ? { promotion } : {}),
    });
    if (!played) return null;
    return {
      uci: `${played.from}${played.to}${played.promotion ?? ""}`,
      san: played.san,
      by,
      fen: chess.fen(),
    };
  } catch {
    return null;
  }
}

/** 按 UCI 序列重放，返回每一步；遇到非法着法即停止。 */
export function replay(uciLine: string[], startFen: string = START_FEN): AppliedMove[] {
  const out: AppliedMove[] = [];
  let fen = startFen;
  for (const uci of uciLine) {
    const applied = applyMove(fen, uci);
    if (!applied) break;
    out.push(applied);
    fen = applied.fen;
  }
  return out;
}

export function statusOf(fen: string): PositionStatus {
  const chess = load(fen);
  if (!chess) {
    return { turn: "w", inCheck: false, checkmate: false, stalemate: false, draw: false, gameOver: false };
  }
  return {
    turn: chess.turn() as Color,
    inCheck: chess.inCheck(),
    checkmate: chess.isCheckmate(),
    stalemate: chess.isStalemate(),
    draw: chess.isDraw(),
    gameOver: chess.isGameOver(),
  };
}

export function sanOf(fen: string, uci: string): string {
  return applyMove(fen, uci)?.san ?? uci;
}

export function boardPieces(fen: string) {
  return load(fen)?.board() ?? [];
}

export interface DrawDetails {
  stalemate: boolean;
  threefold: boolean;
  fiftyMove: boolean;
  insufficientMaterial: boolean;
  draw: boolean;
}

/**
 * 判和细分（仍由 chess.js 判定，本层不自研规则）。
 * 需要着法历史才能判三次重复，因此按 UCI 序列重放后再问。
 */
export function drawDetails(uciLine: string[] = [], startFen: string = START_FEN): DrawDetails {
  let chess: Chess;
  try {
    chess = new Chess(startFen);
  } catch {
    return { stalemate: false, threefold: false, fiftyMove: false, insufficientMaterial: false, draw: false };
  }
  for (const uci of uciLine) {
    const promotion = uci[4];
    try {
      const played = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        ...(promotion ? { promotion } : {}),
      });
      if (!played) break;
    } catch {
      break;
    }
  }
  const fiftyMove = Number(chess.fen().split(" ")[4] ?? 0) >= 100;
  return {
    stalemate: chess.isStalemate(),
    threefold: chess.isThreefoldRepetition(),
    fiftyMove,
    insufficientMaterial: chess.isInsufficientMaterial(),
    draw: chess.isDraw(),
  };
}
