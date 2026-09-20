/**
 * 端内引擎单例（玄弈棋竞引擎 v0.1）。
 *
 * core 内不认识浏览器：worker 工厂由宿主注入
 *   - Web：src/lib/engine-host.ts 注入 Vite 打包的 worker chunk
 *   - 小游戏：注入 wx.createWorker 包装
 * 未注入时自动降级为主线程搜索，上层调用方式不变。
 */
import { EngineClient, type WorkerFactory } from './engineClient';

let client: EngineClient | null = null;
let factory: WorkerFactory | undefined;

/** 宿主在启动时注入 worker 工厂；必须在首次 getEngine() 之前调用。 */
export function setEngineWorkerFactory(next: WorkerFactory | undefined): void {
  factory = next;
  client?.dispose();
  client = null;
}

export function getEngine(): EngineClient {
  if (!client) client = new EngineClient(factory);
  return client;
}

export { EngineClient };
export type { WorkerFactory, WorkerLike } from './engineClient';
export type { SearchOptions, SearchResult } from './engine';
