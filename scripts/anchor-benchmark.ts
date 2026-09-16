/**
 * 外部锚定基准：我方 4 个档位 × Stockfish 限级锚点，跑快棋并用 Elo 公式反推。
 * 用法：bun bench.ts <games-per-pair>
 */
import { Chess } from "chess.js";
import { spawn } from "child_process";
import fs from "fs";
import { AshbornEngine } from "/dev-server/src/core/engine/engine";
import { AI_LEVELS } from "/dev-server/src/core/ai";

const GAMES = Number(process.argv[2] ?? 6);
const SF_MOVETIME = 60;
const MAX_PLY = 120;

type Anchor = { label: string; elo: number; opts: string[] };
const ANCHORS: Anchor[] = [
  { label: "SF-skill0", elo: 1000, opts: ["setoption name Skill Level value 0"] },
  { label: "SF-1320", elo: 1320, opts: ["setoption name UCI_LimitStrength value true", "setoption name UCI_Elo value 1320"] },
  { label: "SF-1500", elo: 1500, opts: ["setoption name UCI_LimitStrength value true", "setoption name UCI_Elo value 1500"] },
  { label: "SF-1700", elo: 1700, opts: ["setoption name UCI_LimitStrength value true", "setoption name UCI_Elo value 1700"] },
  { label: "SF-1900", elo: 1900, opts: ["setoption name UCI_LimitStrength value true", "setoption name UCI_Elo value 1900"] },
];

class SF {
  private p = spawn("node", ["node_modules/stockfish/bin/stockfish-19-lite-single.js"], { stdio: ["pipe", "pipe", "ignore"], cwd: "/tmp/anchor" });
  private buf = "";
  private waiters: ((l: string) => boolean)[] = [];
  constructor() {
    this.p.stdout.on("data", (d) => {
      this.buf += d.toString();
      let i;
      while ((i = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, i).trim();
        this.buf = this.buf.slice(i + 1);
        this.waiters = this.waiters.filter((w) => !w(line));
      }
    });
  }
  send(s: string) { this.p.stdin.write(s + "\n"); }
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
const out: any[] = [];

for (const lvl of AI_LEVELS) {
  const perAnchor: any[] = [];
  for (const a of ANCHORS) {
    const sf = new SF();
    await sf.init(a);
    let score = 0, played = 0;
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
fs.writeFileSync("/tmp/anchor/result.json", JSON.stringify(out, null, 1));
console.log("DONE");
