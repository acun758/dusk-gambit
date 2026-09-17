/**
 * scripts/import-fide.ts —— FIDE 官方等级分榜导入（月度）
 *
 * 用法（全部参数可选，默认值见下）：
 *   bun scripts/import-fide.ts \
 *     --source https://ratings.fide.com/download/standard_rating_list_xml.zip \
 *     --min-rating 2400 --country CHN --country-min 2000 \
 *     --out reports/fide-<yyyy-mm>.sql --limit-per-board 200
 *
 * 设计要点：
 *  1. 客户端永远不直连 fide.com：本脚本离线跑，产出幂等的 upsert SQL，由迁移/运维执行；
 *  2. 全量 XML 约 160MB，按行流式解析，不整包读入内存；
 *  3. 世界/女子/中国/中国女子四个名次由 rating 排序生成（FIDE 不提供名次）；
 *  4. 主键 fide_id upsert，连跑两次不产生重复行。
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

interface Row {
  fideId: number;
  name: string;
  country: string;
  sex: string;
  title: string;
  rating: number;
}

function arg(flag: string, fallback: string): string {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
}

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE = arg("--source", "https://ratings.fide.com/download/standard_rating_list_xml.zip");
const MIN_RATING = Number(arg("--min-rating", "2400"));
const COUNTRY = arg("--country", "CHN");
const COUNTRY_MIN = Number(arg("--country-min", "2000"));
const PER_BOARD = Number(arg("--limit-per-board", "200"));
const OUT = resolve(ROOT, arg("--out", "reports/fide-latest.sql"));
const JSON_OUT = resolve(ROOT, arg("--json", "src/data/fide-standard.json"));
const WORK = arg("--workdir", "/tmp/fide-import");

function sh(cmd: string, args: string[]) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} 失败`);
}

async function ensureXml(): Promise<string> {
  if (SOURCE.endsWith(".xml") && existsSync(SOURCE)) return SOURCE;
  mkdirSync(WORK, { recursive: true });
  const zip = `${WORK}/list.zip`;
  if (SOURCE.startsWith("http")) {
    console.log(`下载 ${SOURCE}`);
    sh("curl", ["-sSL", "-o", zip, SOURCE]);
  }
  sh("unzip", ["-o", "-q", SOURCE.startsWith("http") ? zip : SOURCE, "-d", WORK]);
  const found = spawnSync("bash", ["-lc", `ls ${WORK}/*.xml | head -1`], { encoding: "utf8" }).stdout.trim();
  if (!found) throw new Error("压缩包内没有 XML");
  return found;
}

const esc = (s: string) => s.replace(/'/g, "''");
const tag = (line: string, name: string): string | null => {
  const m = line.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return m ? m[1]!.trim() : null;
};

async function main() {
  const xml = await ensureXml();
  console.log(`解析 ${xml}`);
  const rl = createInterface({ input: createReadStream(xml, { encoding: "utf8" }), crlfDelay: Infinity });

  const rows: Row[] = [];
  let cur: Partial<Row> = {};
  let total = 0;

  for await (const raw of rl) {
    const line = raw.trim();
    if (line === "<player>") cur = {};
    else if (line.startsWith("<fideid>")) cur.fideId = Number(tag(line, "fideid"));
    else if (line.startsWith("<name>")) cur.name = tag(line, "name") ?? "";
    else if (line.startsWith("<country>")) cur.country = tag(line, "country") ?? "";
    else if (line.startsWith("<sex>")) cur.sex = tag(line, "sex") ?? "";
    else if (line.startsWith("<title>")) cur.title = tag(line, "title") ?? "";
    else if (line.startsWith("<rating>")) cur.rating = Number(tag(line, "rating") ?? "0");
    else if (line === "</player>") {
      total++;
      const r = cur as Row;
      if (!r.fideId || !r.name || !r.rating) continue;
      // 名次要在足够大的人群里算才准：先收 rating >= min(阈值)，输出时再砍到四榜前 N
      const keep = r.rating >= Math.min(MIN_RATING, COUNTRY_MIN);
      if (keep) rows.push({ ...r, sex: r.sex ?? "", title: r.title ?? "" });
    }
  }
  console.log(`总记录 ${total}，保留 ${rows.length}`);

  const byRating = (a: Row, b: Row) => b.rating - a.rating || a.fideId - b.fideId;
  const ranks = new Map<number, { open?: number; women?: number; chn?: number; chnW?: number }>();
  const put = (id: number, key: "open" | "women" | "chn" | "chnW", v: number) => {
    const cur2 = ranks.get(id) ?? {};
    cur2[key] = v;
    ranks.set(id, cur2);
  };
  const rank = (list: Row[], key: "open" | "women" | "chn" | "chnW") =>
    list.sort(byRating).forEach((r, i) => put(r.fideId, key, i + 1));

  rank([...rows], "open");
  rank(rows.filter((r) => r.sex === "F"), "women");
  rank(rows.filter((r) => r.country === COUNTRY), "chn");
  rank(rows.filter((r) => r.country === COUNTRY && r.sex === "F"), "chnW");

  // 只落库四个榜各前 N 名，页面之外的行不占空间
  const keep = rows.filter((r) => {
    const k = ranks.get(r.fideId)!;
    return (
      (k.open ?? 1e9) <= PER_BOARD ||
      (k.women ?? 1e9) <= PER_BOARD ||
      (k.chn ?? 1e9) <= PER_BOARD ||
      (k.chnW ?? 1e9) <= PER_BOARD
    );
  });

  const values = keep
    .map((r) => {
      const k = ranks.get(r.fideId)!;
      const n = (v?: number) => (v !== undefined && v <= PER_BOARD ? String(v) : "NULL");
      return `(${r.fideId},'${esc(r.name)}','${esc(r.country)}',${r.sex ? `'${esc(r.sex)}'` : "NULL"},${
        r.title ? `'${esc(r.title)}'` : "NULL"
      },${r.rating},${n(k.open)},${n(k.women)},${n(k.chn)},${n(k.chnW)})`;
    })
    .join(",\n");

  const sql = `-- FIDE 榜单导入（幂等）：生成于 ${new Date().toISOString()}，来源 ${SOURCE}
-- 保留 ${keep.length} 行（四榜各前 ${PER_BOARD} 名）
INSERT INTO public.fide_ratings (fide_id, name, country, sex, title, rating, rank_open, rank_women, rank_chn, rank_chn_w) VALUES
${values.replace(/\)$/gm, ")")}
ON CONFLICT (fide_id) DO UPDATE SET
  name = EXCLUDED.name, country = EXCLUDED.country, sex = EXCLUDED.sex, title = EXCLUDED.title,
  rating = EXCLUDED.rating, rank_open = EXCLUDED.rank_open, rank_women = EXCLUDED.rank_women,
  rank_chn = EXCLUDED.rank_chn, rank_chn_w = EXCLUDED.rank_chn_w, updated_at = now();
`.replace("VALUES\n", "VALUES\n").replace(/,\n(?=ON CONFLICT)/, "\n");

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, sql.replace(/\n(?=ON CONFLICT)/, "\n"));
  console.log(`已写出 ${OUT}（${keep.length} 行）`);

  // 同时产出 JSON 快照：由 /api/public/cron/fide-sync 幂等写库，避免把 160MB XML 搬进运行时
  const snapshot = keep
    .map((r) => {
      const k = ranks.get(r.fideId)!;
      const n = (v?: number) => (v !== undefined && v <= PER_BOARD ? v : null);
      return {
        fide_id: r.fideId,
        name: r.name,
        country: r.country,
        sex: r.sex || null,
        title: r.title || null,
        rating: r.rating,
        rank_open: n(k.open),
        rank_women: n(k.women),
        rank_chn: n(k.chn),
        rank_chn_w: n(k.chnW),
      };
    })
    .sort((a, b) => b.rating - a.rating);
  mkdirSync(dirname(JSON_OUT), { recursive: true });
  writeFileSync(
    JSON_OUT,
    JSON.stringify({ source: SOURCE, generatedAt: new Date().toISOString(), rows: snapshot }, null, 0),
  );
  console.log(`已写出 ${JSON_OUT}（${snapshot.length} 行 JSON 快照）`);
}

void main();
