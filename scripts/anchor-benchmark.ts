/**
 * 外部锚定基准（无沙箱硬编码路径）。
 * 我方 4 个档位 × Stockfish 限级锚点对战，用 Elo 公式反推区间。
 *
 * 用法：
 *   bun scripts/anchor-benchmark.ts [--games 20] [--output reports/anchor.json]
 *                                   [--stockfish <path-to-stockfish-js>]
 *                                   [--sf-movetime 60] [--max-ply 120] [--level <id>]
 *
 * Stockfish 路径默认取 node_modules/stockfish/bin/stockfish-19-lite-single.js，
 * 也可用环境变量 STOCKFISH_PATH 指定。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { Chess } from "chess.js";
import { AshbornEngine } from "../src/core/engine/engine";
import { AI_LEVELS } from "../src/core/ai";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, "..");

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function resolvePath(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p);
}

const GAMES = Number(arg("games", "20"));
const SF_MOVETIME = Number(arg("sf-movetime", "60"));
const MAX_PLY = Number(arg("max-ply", "120"));
const ONLY_LEVEL = arg("level");
const OUTPUT = resolvePath(arg("output", "reports/anchor-benchmark.json")!);
const SF_PATH = resolvePath(
  arg("stockfish", process.env["STOCKFISH_PATH"] ?? "node_modules/stockfish/bin/stockfish-19-lite-single.js")!,
);

if (!fs.existsSync(SF_PATH)) {
  console.error(`找不到 Stockfish：${SF_PATH}（用 --stockfish 或 STOCKFISH_PATH 指定）`);
  process.exit(1);
}

type Anchor = { label: string; elo: number; opts: string[] };
const ANCHORS: Anchor[] = [
  { label: "SF-skill0", elo: 1000, opts: ["setoption name Skill Level value 0"] },
  { label: "SF-1320", elo: 1320, opts: ["setoption name UCI_LimitStrength value true", "setoption name UCI_Elo value 1320"] },
  { label: "SF-1500", elo: 1500, opts: ["setoption name UCI_LimitStrength value true", "setoption name UCI_Elo value 1500"] },
  { label: "SF-1700", elo: 1700, opts: ["setoption name UCI_LimitStrength value true", "setoption name UCI_Elo value 1700"] },
  { label: "SF-1900", elo: 1900, opts: ["setoption name UCI_LimitStrength value true", "setoption name UCI_Elo value 1900"] },
];

class SF {
  private p = spawn("node", [SF_PATH], { stdio: ["pipe", "pipe", "ignore"], cwd: PROJECT_ROOT });
  private buf = "";
  private waiters: ((l: string) => boolean)[] = [];
  constructor() {
    this.p.stdout!.on("data", (d: Buffer) => {
      this.buf += d.toString();
      let i: number;
      while ((i = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, i).trim();
        this.buf = this.buf.slice(i + 1);
        this.waiters = this.waiters.filter((w) => !w(line));
      }
    });
  }
  send(s: string) { this.p.stdin!.write(s + "\n"); }
  wait(prefix: string): Promise<string> {
    return new Promise((res) => this.waiters.push((l) => (l.startsWith(prefix) ? (res(l), true) : false)));
  }
  async init(a: Anchor) {
    this.send("uci"); await this.wait("uciok");
    this.send("ucinewgame");
    for (const o of a.opts) this.send(o);
    this.send("isready"); await this.wait("readyok");
  }
  async best(fen: string) {
    this.send("position fen " + fen);
    this.send(`go movetime ${SF_MOVETIME}`);
    const line = await this.wait("bestmove");
    return line.split(" ")[1]!;
  }
  kill() { this.p.kill(); }
}

function result(g: Chess, ourColor: "w" | "b"): number {
  if (g.isCheckmate()) return g.turn() === ourColor ? 0 : 1;
  return 0.5;
}

const engine = new AshbornEngine();
const levels = ONLY_LEVEL ? AI_LEVELS.filter((l) => l.id === ONLY_LEVEL) : AI_LEVELS;
const out: unknown[] = [];

for (const lvl of levels) {
  const perAnchor: { anchor: string; anchorElo: number; games: number; score: number; winRate: number; est: number }[] = [];
  for (const a of ANCHORS) {
    const sf = new SF();
    await sf.init(a);
    let score = 0;
    let played = 0;
    for (let i = 0; i < GAMES; i++) {
      const ourColor: "w" | "b" = i % 2 === 0 ? "w" : "b";
      const g = new Chess();
      while (!g.isGameOver() && g.history().length < MAX_PLY) {
        let uci: string;
        if (g.turn() === ourColor) {
          const r = engine.think(g.fen(), { depth: lvl.depth, movetimeMs: Math.min(lvl.movetimeMs, 300), skill: lvl.skill });
          if (!r) break;
          uci = r.uci;
        } else {
          uci = await sf.best(g.fen());
          if (!uci || uci === "(none)") break;
        }
        try {
          const mv = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(uci[4] ? { promotion: uci[4] } : {}) });
          if (!mv) break;
        } catch { break; }
      }
      score += result(g, ourColor);
      played++;
    }
    sf.kill();
    const w = Math.min(0.95, Math.max(0.05, score / played));
    const est = Math.round(a.elo + 400 * Math.log10(w / (1 - w)));
    perAnchor.push({ anchor: a.label, anchorElo: a.elo, games: played, score, winRate: +w.toFixed(3), est });
    console.log(lvl.id, a.label, `${score}/${played}`, "→", est);
  }
  const ests = perAnchor.map((p) => p.est).sort((x, y) => x - y);
  const median = ests[Math.floor(ests.length / 2)]!;
  const spread = Math.round((ests[ests.length - 1]! - ests[0]!) / 2);
  out.push({ level: lvl.id, nominal: lvl.elo, median, interval: spread, perAnchor });
  console.log("==", lvl.id, "标称", lvl.elo, "实测", `${median} ± ${spread}`);
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify({ params: { games: GAMES, sfMovetime: SF_MOVETIME, maxPly: MAX_PLY }, levels: out }, null, 1));
console.log("报告已写入", OUTPUT);
