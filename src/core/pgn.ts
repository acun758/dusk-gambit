/**
 * core/pgn.ts —— 棋谱导出（纯计算层）
 *
 * 只做字符串生成：把着法序列写成标准 PGN / FEN，不含 React、不含 DOM、不访问网络。
 * 规则与走子判定仍由 core/rules.ts（chess.js 薄封装）负责，这里不重复实现任何规则。
 */
import { applyMove, START_FEN } from "./rules";

export interface PgnMeta {
  event?: string;
  site?: string;
  date?: Date | string;
  round?: string;
  white?: string;
  black?: string;
  whiteElo?: number;
  blackElo?: number;
  timeControl?: string;
  /** 1-0 / 0-1 / 1/2-1/2 / * */
  result?: string;
  startFen?: string;
}

export type Outcome = "white" | "black" | "draw" | null | undefined;

export function resultTag(outcome: Outcome): string {
  if (outcome === "white") return "1-0";
  if (outcome === "black") return "0-1";
  if (outcome === "draw") return "1/2-1/2";
  return "*";
}

function pgnDate(date: Date | string | undefined): string {
  const d = date instanceof Date ? date : date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return "????.??.??";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

function escapeTag(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** UCI 序列 → SAN 序列（非法着法处停止）。 */
export function sanLine(uciLine: string[], startFen: string = START_FEN): string[] {
  const out: string[] = [];
  let fen = startFen;
  for (const uci of uciLine) {
    const applied = applyMove(fen, uci);
    if (!applied) break;
    out.push(applied.san);
    fen = applied.fen;
  }
  return out;
}

/** SAN 序列 → 带回合号的正文，按 80 列折行。 */
export function movetext(sanList: string[], startFen: string = START_FEN, result = "*"): string {
  const firstBlack = startFen.split(" ")[1] === "b";
  const firstNumber = Number(startFen.split(" ")[5] ?? 1) || 1;
  const tokens: string[] = [];
  let moveNumber = firstNumber;
  sanList.forEach((san, i) => {
    const blackToMove = firstBlack ? i % 2 === 0 : i % 2 === 1;
    if (!blackToMove) tokens.push(`${moveNumber}.`);
    else if (i === 0) tokens.push(`${moveNumber}...`);
    tokens.push(san);
    if (blackToMove) moveNumber += 1;
  });
  tokens.push(result);

  const lines: string[] = [];
  let line = "";
  for (const token of tokens) {
    if (line && line.length + token.length + 1 > 80) {
      lines.push(line);
      line = token;
    } else {
      line = line ? `${line} ${token}` : token;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

/** 生成完整 PGN 文本（含七标签）。着法可以给 SAN 或 UCI。 */
export function toPgn(
  moves: { san?: string; uci?: string }[],
  meta: PgnMeta = {},
): string {
  const startFen = meta.startFen ?? START_FEN;
  const sanList = moves.every((m) => m.san)
    ? moves.map((m) => m.san as string)
    : sanLine(moves.map((m) => m.uci ?? ""), startFen);
  const result = meta.result ?? "*";
  const tags: [string, string][] = [
    ["Event", meta.event ?? "Dusk Gambit 3+2"],
    ["Site", meta.site ?? "Dusk Gambit"],
    ["Date", pgnDate(meta.date)],
    ["Round", meta.round ?? "-"],
    ["White", meta.white ?? "White"],
    ["Black", meta.black ?? "Black"],
    ["Result", result],
  ];
  if (meta.whiteElo) tags.push(["WhiteElo", String(meta.whiteElo)]);
  if (meta.blackElo) tags.push(["BlackElo", String(meta.blackElo)]);
  if (meta.timeControl) tags.push(["TimeControl", meta.timeControl]);
  if (startFen !== START_FEN) {
    tags.push(["SetUp", "1"]);
    tags.push(["FEN", startFen]);
  }
  const head = tags.map(([k, v]) => `[${k} "${escapeTag(v)}"]`).join("\n");
  return `${head}\n\n${movetext(sanList, startFen, result)}\n`;
}

/** 供分享用的文件名，如 dusk-gambit-2026-09-15.pgn */
export function pgnFileName(date: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `dusk-gambit-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}.pgn`;
}
