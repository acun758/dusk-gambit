/**
 * src/lib/engine-host.ts —— 引擎的宿主接入层（R4）
 *
 * 1. 把浏览器的 Worker 注入 core/engine（core 本身不认识浏览器）；
 * 2. 对外只暴露一个接口 analyze(fen) → { eval, bestmove, depth }，
 *    将来换引擎实现（Stockfish WASM / 云端深算）只改本文件。
 */
import { getEngine, setEngineWorkerFactory, type WorkerLike } from "@/core/engine";
import { ENGINE_CONFIG } from "@/config/app-config";

let installed = false;

/** 浏览器环境下安装 worker 工厂；非浏览器环境（SSR / Node 测试）保持主线程降级。 */
export function installEngineHost(): void {
  if (installed) return;
  installed = true;
  if (typeof window === "undefined" || typeof Worker === "undefined") return;
  setEngineWorkerFactory(
    () =>
      new Worker(new URL("./engine.worker.ts", import.meta.url), { type: "module" }) as unknown as WorkerLike,
  );
}

export interface AnalysisResult {
  /** 当前行棋方视角厘兵 */
  eval: number;
  bestmove: string;
  depth: number;
}

/** 统一的局面分析接口：所有页面/服务只通过它调用引擎。 */
export async function analyze(
  fen: string,
  opts: { depth?: number; movetimeMs?: number } = {},
): Promise<AnalysisResult> {
  installEngineHost();
  const depth = opts.depth ?? ENGINE_CONFIG.defaultDepth;
  const movetimeMs = Math.min(opts.movetimeMs ?? ENGINE_CONFIG.defaultMovetimeMs, ENGINE_CONFIG.maxMovetimeMs);
  const r = await getEngine().think(fen, { depth, movetimeMs, skill: 20 });
  return { eval: r.cp, bestmove: r.uci, depth: r.depth };
}
