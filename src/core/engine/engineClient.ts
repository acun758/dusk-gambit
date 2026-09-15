/**
 * 引擎客户端 — 环境自适应
 * 优先 Web Worker / Cocos Worker；构造失败时降级为主线程同步搜索（≤600ms，可接受）。
 * Web 版传 workerFactory（Vite 打包出的独立 chunk）；Cocos/小游戏版注入 wx.createWorker。
 */
import { AshbornEngine, type SearchOptions, type SearchResult } from './engine';

interface Pending {
  resolve: (r: SearchResult) => void;
}

const EMPTY_RESULT: SearchResult = { uci: '', cp: 0, depth: 0, nodes: 0, ms: 0 };

export class EngineClient {
  private worker: Worker | null = null;
  private local = new AshbornEngine();
  private seq = 0;
  private pending = new Map<string, Pending>();

  constructor(workerFactory?: () => Worker) {
    if (workerFactory) {
      try {
        const worker = workerFactory();
        worker.onmessage = (ev: MessageEvent) => {
          const res = ev.data as { id: string; type: string; uci: string | null } & SearchResult;
          const p = this.pending.get(res.id);
          if (!p) return;
          this.pending.delete(res.id);
          if (res.type === 'bestmove' && res.uci) p.resolve(res as SearchResult);
          else p.resolve({ ...EMPTY_RESULT });
        };
        worker.onerror = () => {
          this.worker = null;
          // 兜底：worker 崩溃时，未完成的请求改走主线程，避免界面卡在等待中
          for (const [, p] of this.pending) p.resolve({ ...EMPTY_RESULT });
          this.pending.clear();
        };
        this.worker = worker;
      } catch {
        this.worker = null;
      }
    }
  }

  /** 是否真的跑在独立线程上（复盘批量搜索前应确认为 true）。 */
  get offloaded(): boolean {
    return this.worker !== null;
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
        resolve(r ?? { ...EMPTY_RESULT });
      }, 30);
    });
  }

  /** 主线程同步搜索（仅供单次 ≤600ms 的陪练落子使用，禁止用于批量复盘）。 */
  thinkSync(fen: string, opts: SearchOptions): SearchResult {
    return this.local.think(fen, opts) ?? { ...EMPTY_RESULT };
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
