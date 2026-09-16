/**
 * 谜题校验脚本（无沙箱硬编码路径）。
 *
 * 用法：
 *   bun scripts/validate-puzzles.ts --input <puzzles.json> [--output <report.json>]
 *                                   [--depth 6] [--movetime 2500] [--margin 200]
 *
 * 输入 JSON 为数组，每项 { id, fen, solution: string[] }。
 * 未给 --output 时结果打印到标准输出。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Chess } from "chess.js";
import { AshbornEngine } from "../src/core/engine/engine";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, "..");

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function resolvePath(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p);
}

const inputArg = arg("input");
if (!inputArg) {
  console.error("缺少 --input <puzzles.json>");
  process.exit(1);
}
const inputPath = resolvePath(inputArg);
const outputArg = arg("output");
const DEPTH = Number(arg("depth", "6"));
const MOVETIME = Number(arg("movetime", "2500"));
const NARROW_MARGIN = Number(arg("margin", "200"));

const eng = new AshbornEngine();
const rows = JSON.parse(fs.readFileSync(inputPath, "utf8")) as {
  id: number;
  fen: string;
  solution: string[];
}[];

const illegal: number[] = [];
const solutionBroken: number[] = [];
const mismatch: { id: number; want: string; best: string; margin: number }[] = [];
const narrow: { id: number; margin: number }[] = [];
const margins: number[] = [];
let mateEnd = 0;

for (const r of rows) {
  let c: Chess | null = null;
  try {
    c = new Chess(r.fen);
  } catch {
    illegal.push(r.id);
    continue;
  }
  const board = c.board().flat().filter(Boolean) as { type: string; color: string; square: string }[];
  const kings = (color: string) => board.filter((p) => p.type === "k" && p.color === color).length;
  if (kings("w") !== 1 || kings("b") !== 1) {
    illegal.push(r.id);
    continue;
  }
  if (board.some((p) => p.type === "p" && (p.square[1] === "1" || p.square[1] === "8"))) {
    illegal.push(r.id);
    continue;
  }

  const g = new Chess(r.fen);
  let ok = true;
  for (const u of r.solution) {
    try {
      const mv = g.move({ from: u.slice(0, 2), to: u.slice(2, 4), ...(u[4] ? { promotion: u[4] } : {}) });
      if (!mv) ok = false;
    } catch {
      ok = false;
    }
    if (!ok) break;
  }
  if (!ok) {
    solutionBroken.push(r.id);
    continue;
  }
  if (g.isCheckmate()) mateEnd++;

  const roots = eng.analyzeRoot(r.fen, { depth: DEPTH, movetimeMs: MOVETIME });
  const want = r.solution[0]!;
  const best = roots[0]!;
  const second = roots[1];
  const margin = second ? best.cp - second.cp : 99999;
  margins.push(margin);
  if (best.uci !== want) mismatch.push({ id: r.id, want, best: best.uci, margin });
  else if (margin < NARROW_MARGIN) narrow.push({ id: r.id, margin });
}

margins.sort((a, b) => a - b);
const report = {
  input: inputPath,
  params: { depth: DEPTH, movetimeMs: MOVETIME, narrowMargin: NARROW_MARGIN },
  total: rows.length,
  illegal,
  solutionBroken,
  endsInMate: mateEnd,
  mismatch,
  narrow,
  medianMargin: margins[Math.floor(margins.length / 2)] ?? null,
};
const text = JSON.stringify(report, null, 1);
if (outputArg) {
  const out = resolvePath(outputArg);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text);
  console.log(`报告已写入 ${out}`);
} else {
  console.log(text);
}
