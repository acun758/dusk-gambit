/**
 * 端内引擎单例（军师交付的 Dusk/Ashborn 引擎 v0.1）。
 * 对弈 AI 与复盘逐手评估共用这一处实例，页面不要自行 new。
 *
 * 浏览器端走 Vite 打包出的独立 worker chunk（复盘批量搜索的硬性前置）；
 * 构造失败或非浏览器环境自动降级主线程。
 * 小游戏端把 workerFactory 换成 wx.createWorker 即可，上层零改动。
 */
import { EngineClient } from './engineClient';

let client: EngineClient | null = null;

function browserWorkerFactory(): (() => Worker) | undefined {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return undefined;
  return () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
}

export function getEngine(): EngineClient {
  if (!client) client = new EngineClient(browserWorkerFactory());
  return client;
}

export { EngineClient };
export type { SearchOptions, SearchResult } from './engine';
