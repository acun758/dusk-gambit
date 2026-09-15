/**
 * 引擎 Worker — 消息协议对齐《docs/duel-integration.md》第 1 节
 * 请求: { id, cmd:"search"|"legal"|"newgame"|"stop", fen?, depth?, movetimeMs?, skill? }
 * 响应: { id, type:"bestmove", uci, cp, depth, nodes, ms }
 *       { id, type:"legal", moves: string[] }
 * 注：san 字段由主线程用 chess.js 计算，Worker 不携带规则库（保持轻量）。
 */
import { AshbornEngine } from './engine';

const engine = new AshbornEngine();

const post = (msg: unknown) => (self as unknown as Worker).postMessage(msg);

self.onmessage = (ev: MessageEvent) => {
  const req = ev.data as {
    id: string; cmd: string; fen?: string;
    depth?: number; movetimeMs?: number; skill?: number;
  };
  try {
    if (req.cmd === 'search' && req.fen) {
      const r = engine.think(req.fen, {
        depth: req.depth, movetimeMs: req.movetimeMs, skill: req.skill,
      });
      post(r
        ? { id: req.id, type: 'bestmove', ...r }
        : { id: req.id, type: 'bestmove', uci: null, cp: 0, depth: 0, nodes: 0, ms: 0 });
    } else if (req.cmd === 'legal' && req.fen) {
      post({ id: req.id, type: 'legal', moves: engine.legalMoves(req.fen) });
    } else if (req.cmd === 'newgame') {
      post({ id: req.id, type: 'ok' });
    } else if (req.cmd === 'stop') {
      // v0.1 搜索为同步短任务（≤600ms），stop 为协议占位
      post({ id: req.id, type: 'ok' });
    }
  } catch (err) {
    post({ id: req.id, type: 'error', message: String(err) });
  }
};
