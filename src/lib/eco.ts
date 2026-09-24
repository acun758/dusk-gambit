/**
 * 开局识别（ECO）。数据源：lichess-org/chess-openings（CC0 公有领域），
 * 构建为 public/data/eco.json：局面（FEN 前四段）→ [ECO 编码, 开局名]。
 * 按局面匹配，自动识别换序进入的开局；取棋谱中最后一个命中的局面。
 */
import { Chess } from "chess.js";

export interface EcoHit {
  eco: string;
  name: string;
  ply: number;
}

let table: Promise<Record<string, [string, string]>> | null = null;

function loadTable() {
  table ??= fetch("/data/eco.json")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => {
      table = null;
      return {};
    });
  return table;
}

const key = (fen: string) => fen.split(" ").slice(0, 4).join(" ");

export async function identifyOpening(ucis: string[]): Promise<EcoHit | null> {
  if (!ucis.length) return null;
  const db = await loadTable();
  const c = new Chess();
  let hit: EcoHit | null = null;
  for (let i = 0; i < Math.min(ucis.length, 40); i++) {
    const u = ucis[i]!;
    try {
      c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
    } catch {
      break;
    }
    const row = db[key(c.fen())];
    if (row) hit = { eco: row[0], name: row[1], ply: i + 1 };
  }
  return hit;
}
