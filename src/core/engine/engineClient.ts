/**
 * 引擎客户端 — 环境自适应
 * 优先 Web Worker / Cocos Worker；构造失败时降级为主线程同步搜索（≤600ms，可接受）。
 * Web 版 workerUrl 传相对路径；Cocos 版由适配层注入 wx.createWorker。
 */
import { AshbornEngine, type SearchOptions, type SearchResult } from './engine';

interface Pending {
  resolve: (r: SearchResult) => void;
}

export class EngineClient {
  private worker: Worker | null = null;
  private local = new AshbornEngine();
  private seq = 0;
  private pending = new Map<string, Pending>();

  constructor(workerUrl?: string) {
    if (workerUrl) {
      try {
        this.worker = new Worker(workerUrl);
        this.worker.onmessage = (ev: MessageEvent) => {
          const res = ev.data as { id: string; type: string; uci: string | null } & SearchResult;
          const p = this.pending.get(res.id);
          if (!p) return;
          this.pending.delete(res.id);
          if (res.type === 'bestmove' && res.uci) {
            p.resolve(res as SearchResult);
          } else {
            // null 走法（终局）或 error → 交由调用方兜底
            p.resolve({ uci: '', cp: 0, depth: 0, nodes: 0, ms: 0 });
          }
        };
        this.worker.onerror = () => { this.worker = null; };
      } catch {
        this.worker = null;
      }
    }
  }

  think(fen: string, opts: SearchOptions): Promise<SearchResult> {
    if (this.worker) {
      const id = `req-${++this.seq}`;
      return new Promise((resolve) => {
        this.pending.set(id, { resolve });
        this.worker!.postMessage({ id, cmd: 'search', fen, ...opts });
      });
    }
    // 同步降级：让出一次渲染帧再算，避免点击反馈被吞
    return new Promise((resolve) => {
      setTimeout(() => {
        const r = this.local.think(fen, opts);
        resolve(r ?? { uci: '', cp: 0, depth: 0, nodes: 0, ms: 0 });
      }, 30);
    });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
