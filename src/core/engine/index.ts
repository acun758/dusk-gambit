/**
 * 端内引擎单例（军师交付的 Dusk/Ashborn 引擎 v0.1）。
 * 对弈 AI 与复盘逐手评估共用这一处实例，页面不要自行 new。
 *
 * 当前默认走主线程降级路径（单次搜索 ≤600ms，实测 depth 5 ≈ 120~460ms）。
 * 接入独立 worker chunk 后，只需把打包出的 worker URL 传进 EngineClient，
 * 上层调用零改动；小游戏端把 Worker 构造换成 wx.createWorker 即可。
 */
import { EngineClient } from './engineClient';

let client: EngineClient | null = null;

export function getEngine(): EngineClient {
  if (!client) client = new EngineClient();
  return client;
}

export type { SearchOptions, SearchResult } from './engine';
