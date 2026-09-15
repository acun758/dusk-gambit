/**
 * ASHBORN 端内引擎 v0.1 — 0x88 棋盘 + 迭代加深 alpha-beta
 *
 * 设计对齐《duel-integration.md》引擎协议：
 *   search(fen, { depth, movetimeMs, skill }) → { uci, cp, depth, nodes, ms }
 *   - depth 硬上限 6，movetimeMs 硬上限 600ms（引擎内再次钳制）
 *   - skill 0~20：同时约束搜索深度与走法"失误窗口"（陪练引擎会按水平选出次优解）
 *   - 引擎结果永远不作为对局仲裁依据，仲裁只认服务端
 *
 * 纯 TS，零 DOM/BOM 依赖：Web Worker / Cocos Worker / 云函数均可编译。
 */

const EMPTY = 0;
const PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
const WHITE = 0, BLACK = 8;

const KNIGHT_OFF = [33, 31, 18, 14, -33, -31, -18, -14];
const KING_OFF = [1, -1, 16, -16, 17, 15, -17, -15];
const BISHOP_OFF = [17, 15, -17, -15];
const ROOK_OFF = [1, -1, 16, -16];
const ALL_OFF = [1, -1, 16, -16, 17, 15, -17, -15];

const CASTLE_WK = 1, CASTLE_WQ = 2, CASTLE_BK = 4, CASTLE_BQ = 8;
const castleMask = new Uint8Array(128).fill(15);
castleMask[0x00] = 15 & ~CASTLE_WQ; castleMask[0x07] = 15 & ~CASTLE_WK;
castleMask[0x70] = 15 & ~CASTLE_BQ; castleMask[0x77] = 15 & ~CASTLE_BK;
castleMask[0x04] = 15 & ~(CASTLE_WK | CASTLE_WQ);
castleMask[0x74] = 15 & ~(CASTLE_BK | CASTLE_BQ);

const VAL = [0, 100, 320, 330, 500, 900, 20000];
const MATE = 100000;

// 时间源：浏览器 Worker 有 performance，小游戏环境回退 Date.now
const now: () => number =
  typeof performance !== 'undefined' && performance.now ? () => performance.now() : () => Date.now();

// 位置价值表（第 0 行 = 视觉顶行 rank8）
const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  60, 60, 60, 60, 60, 60, 60, 60,
  12, 16, 22, 32, 32, 22, 16, 12,
   6,  8, 14, 24, 24, 14,  8,  6,
   2,  2,  6, 16, 16,  6,  2,  2,
   2, -2,  0,  4,  4,  0, -2,  2,
   2,  4,  4,-12,-12,  4,  4,  2,
   0,  0,  0,  0,  0,  0,  0,  0];
const PST_KNIGHT = [
 -50,-38,-28,-24,-24,-28,-38,-50,
 -38,-16,  0,  4,  4,  0,-16,-38,
 -28,  4, 14, 18, 18, 14,  4,-28,
 -24,  2, 18, 22, 22, 18,  2,-24,
 -24,  2, 18, 22, 22, 18,  2,-24,
 -28,  4, 14, 18, 18, 14,  4,-28,
 -38,-16,  0,  6,  6,  0,-16,-38,
 -50,-38,-28,-24,-24,-28,-38,-50];
const PST_BISHOP = [
 -18,-10,-10,-10,-10,-10,-10,-18,
 -10,  4,  0,  0,  0,  0,  4,-10,
 -10,  8, 10, 10, 10, 10,  8,-10,
 -10,  2, 10, 14, 14, 10,  2,-10,
 -10,  0, 12, 14, 14, 12,  0,-10,
 -10,  8,  8, 10, 10,  8,  8,-10,
 -10,  8,  0,  2,  2,  0,  8,-10,
 -18,-10,-12,-10,-10,-12,-10,-18];
const PST_ROOK = [
   0,  0,  2,  4,  4,  2,  0,  0,
   6, 10, 10, 10, 10, 10, 10,  6,
  -4,  0,  0,  0,  0,  0,  0, -4,
  -4,  0,  0,  0,  0,  0,  0, -4,
  -4,  0,  0,  0,  0,  0,  0, -4,
  -4,  0,  0,  0,  0,  0,  0, -4,
  -4,  0,  0,  0,  0,  0,  0, -4,
   0,  0,  4,  8,  8,  4,  0,  0];
const PST_QUEEN = [
 -20,-10,-10, -4, -4,-10,-10,-20,
 -10,  0,  2,  0,  0,  2,  0,-10,
 -10,  2,  4,  4,  4,  4,  2,-10,
  -4,  0,  4,  4,  4,  4,  0, -4,
  -4,  0,  4,  4,  4,  4,  0, -4,
 -10,  4,  4,  4,  4,  4,  4,-10,
 -10,  0,  2,  0,  0,  2,  0,-10,
 -20,-10,-10, -4, -4,-10,-10,-20];
const PST_KING = [
 -60,-70,-70,-80,-80,-70,-70,-60,
 -60,-70,-70,-80,-80,-70,-70,-60,
 -60,-70,-70,-80,-80,-70,-70,-60,
 -60,-70,-70,-80,-80,-70,-70,-60,
 -40,-50,-50,-60,-60,-50,-50,-40,
 -20,-30,-30,-40,-40,-30,-30,-20,
  24, 20,  0,  0,  0,  4, 24, 24,
  24, 32, 12,  0,  0,  8, 36, 24];
const PSTS = [
  new Int16Array(64), new Int16Array(PST_PAWN), new Int16Array(PST_KNIGHT),
  new Int16Array(PST_BISHOP), new Int16Array(PST_ROOK), new Int16Array(PST_QUEEN),
  new Int16Array(PST_KING)];

export interface SearchOptions {
  depth?: number;
  movetimeMs?: number;
  skill?: number;      // 0~20，默认 12
  maxErrCp?: number;   // 显式失误窗口（厘兵），优先于 skill 推导
}
export interface SearchResult {
  uci: string; cp: number; depth: number; nodes: number; ms: number;
}

function sqName(sq: number): string {
  return String.fromCharCode(97 + (sq & 7)) + (1 + (sq >> 4));
}

export class AshbornEngine {
  private board = new Uint8Array(128);
  private side = WHITE;
  private castling = 0;
  private ep = -1;
  private halfmove = 0;
  private kingSq = [0x04, 0x74];

  private nodes = 0;
  private stopAt = 0;
  private aborted = false;
  // 撤销栈：递归搜索中 make/unmake 必须严格成对，逐层保存现场
  private undoStack: { captured: number; castling: number; ep: number; halfmove: number }[] = [];

  load(fen: string): void {
    this.board.fill(EMPTY);
    const parts = fen.trim().split(/\s+/);
    let sq = 0x70;
    for (const ch of parts[0]) {
      if (ch === '/') { sq -= 24; continue; }
      if (ch >= '1' && ch <= '8') { sq += +ch; continue; }
      const color = ch === ch.toUpperCase() ? WHITE : BLACK;
      const type = 'pnbrqk'.indexOf(ch.toLowerCase()) + 1;
      if (type >= 1 && type <= 6) {
        this.board[sq] = type | color;
        if (type === KING) this.kingSq[color >> 3] = sq;
        sq++;
      }
    }
    this.side = parts[1] === 'b' ? BLACK : WHITE;
    this.castling = 0;
    const c = parts[2] ?? '';
    if (c.includes('K')) this.castling |= CASTLE_WK;
    if (c.includes('Q')) this.castling |= CASTLE_WQ;
    if (c.includes('k')) this.castling |= CASTLE_BK;
    if (c.includes('q')) this.castling |= CASTLE_BQ;
    this.ep = parts[3] && parts[3] !== '-'
      ? (parts[3].charCodeAt(0) - 97) + (parseInt(parts[3][1]) - 1) * 16 : -1;
    this.halfmove = parts[4] ? parseInt(parts[4]) : 0;
  }

  // ---------- 攻击判定 ----------
  private attacked(sq: number, byWhite: boolean): boolean {
    const b = this.board;
    const want = byWhite ? WHITE : BLACK;
    const pawnDir = byWhite ? -16 : 16;
    for (const d of [pawnDir - 1, pawnDir + 1]) {
      const t = sq + d;
      if (!(t & 0x88)) {
        const p = b[t];
        if (p && (p & 8) === want && (p & 7) === PAWN) return true;
      }
    }
    for (const d of KNIGHT_OFF) {
      const t = sq + d;
      if (!(t & 0x88) && b[t] === (KNIGHT | want)) return true;
    }
    for (const d of KING_OFF) {
      const t = sq + d;
      if (!(t & 0x88) && b[t] === (KING | want)) return true;
    }
    for (const d of BISHOP_OFF) {
      let t = sq + d;
      while (!(t & 0x88)) {
        const p = b[t];
        if (p) {
          if ((p & 8) === want) { const ty = p & 7; if (ty === BISHOP || ty === QUEEN) return true; }
          break;
        }
        t += d;
      }
    }
    for (const d of ROOK_OFF) {
      let t = sq + d;
      while (!(t & 0x88)) {
        const p = b[t];
        if (p) {
          if ((p & 8) === want) { const ty = p & 7; if (ty === ROOK || ty === QUEEN) return true; }
          break;
        }
        t += d;
      }
    }
    return false;
  }

  /** 指定颜色一方是否被将军 */
  private inCheck(white: boolean): boolean {
    return this.attacked(this.kingSq[white ? 0 : 1], !white);
  }

  // ---------- 走子生成（伪合法，搜索内过滤真合法） ----------
  private genMoves(out: number[]): void {
    const b = this.board, us = this.side, them = us ^ 8;
    const pawnDir = us === WHITE ? 16 : -16;
    const startRank = us === WHITE ? 1 : 6;
    const promoRank = us === WHITE ? 7 : 0;

    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq];
      if (!p || (p & 8) !== us) continue;
      const ty = p & 7;

      if (ty === PAWN) {
        const one = sq + pawnDir;
        if (!(one & 0x88) && !b[one]) {
          if ((one >> 4) === promoRank) {
            for (let pr = QUEEN; pr >= KNIGHT; pr--) out.push(sq | one << 7 | pr << 14);
          } else {
            out.push(sq | one << 7);
            const two = one + pawnDir;
            if ((sq >> 4) === startRank && !b[two]) out.push(sq | two << 7 | 1 << 17);
          }
        }
        for (const d of [pawnDir - 1, pawnDir + 1]) {
          const t = sq + d;
          if (t & 0x88) continue;
          const tp = b[t];
          if (tp && (tp & 8) === them) {
            if ((t >> 4) === promoRank) {
              for (let pr = QUEEN; pr >= KNIGHT; pr--) out.push(sq | t << 7 | pr << 14);
            } else out.push(sq | t << 7);
          } else if (t === this.ep) {
            out.push(sq | t << 7 | 2 << 17);
          }
        }
      } else if (ty === KNIGHT) {
        for (const d of KNIGHT_OFF) {
          const t = sq + d;
          if (t & 0x88) continue;
          const tp = b[t];
          if (!tp || (tp & 8) === them) out.push(sq | t << 7);
        }
      } else if (ty === KING) {
        for (const d of KING_OFF) {
          const t = sq + d;
          if (t & 0x88) continue;
          const tp = b[t];
          if (!tp || (tp & 8) === them) out.push(sq | t << 7);
        }
      } else {
        const dirs = ty === BISHOP ? BISHOP_OFF : ty === ROOK ? ROOK_OFF : ALL_OFF;
        for (const d of dirs) {
          let t = sq + d;
          while (!(t & 0x88)) {
            const tp = b[t];
            if (!tp) { out.push(sq | t << 7); }
            else {
              if ((tp & 8) === them) out.push(sq | t << 7);
              break;
            }
            t += d;
          }
        }
      }
    }
    this.pushCastles(out);
  }

  private pushCastles(out: number[]): void {
    const enemyWhite = this.side !== WHITE;
    const b = this.board;
    if (this.side === WHITE) {
      if ((this.castling & CASTLE_WK) && !b[0x05] && !b[0x06] &&
          !this.attacked(0x04, enemyWhite) && !this.attacked(0x05, enemyWhite) && !this.attacked(0x06, enemyWhite))
        out.push(0x04 | 0x06 << 7 | 3 << 17);
      if ((this.castling & CASTLE_WQ) && !b[0x03] && !b[0x02] && !b[0x01] &&
          !this.attacked(0x04, enemyWhite) && !this.attacked(0x03, enemyWhite) && !this.attacked(0x02, enemyWhite))
        out.push(0x04 | 0x02 << 7 | 3 << 17);
    } else {
      if ((this.castling & CASTLE_BK) && !b[0x75] && !b[0x76] &&
          !this.attacked(0x74, enemyWhite) && !this.attacked(0x75, enemyWhite) && !this.attacked(0x76, enemyWhite))
        out.push(0x74 | 0x76 << 7 | 3 << 17);
      if ((this.castling & CASTLE_BQ) && !b[0x73] && !b[0x72] && !b[0x71] &&
          !this.attacked(0x74, enemyWhite) && !this.attacked(0x73, enemyWhite) && !this.attacked(0x72, enemyWhite))
        out.push(0x74 | 0x72 << 7 | 3 << 17);
    }
  }

  // ---------- 走子 / 撤销 ----------
  private make(move: number): void {
    const from = move & 127, to = (move >> 7) & 127;
    const flag = (move >> 17) & 15, promo = (move >> 14) & 7;
    const b = this.board;
    const piece = b[from];

    // 保存现场（吃子记录含 ep 标志位 0x100）
    const captured = flag === 2 ? (b[to + (this.side === WHITE ? -16 : 16)] | 0x100) : b[to];
    this.undoStack.push({ captured, castling: this.castling, ep: this.ep, halfmove: this.halfmove });

    b[to] = promo ? (promo | this.side) : piece;
    b[from] = EMPTY;

    if (flag === 2) { // 吃过路兵
      b[to + (this.side === WHITE ? -16 : 16)] = EMPTY;
    } else if (flag === 3) { // 易位挪车
      if (to === 0x06) { b[0x05] = b[0x07]; b[0x07] = EMPTY; }
      else if (to === 0x02) { b[0x03] = b[0x00]; b[0x00] = EMPTY; }
      else if (to === 0x76) { b[0x75] = b[0x77]; b[0x77] = EMPTY; }
      else if (to === 0x72) { b[0x73] = b[0x70]; b[0x70] = EMPTY; }
    }

    if ((piece & 7) === KING) this.kingSq[this.side >> 3] = to;
    this.castling &= castleMask[from] & castleMask[to];
    this.ep = flag === 1 ? from + (this.side === WHITE ? 16 : -16) : -1;
    this.halfmove = ((piece & 7) === PAWN || captured) ? 0 : this.halfmove + 1;
    this.side ^= 8;
  }

  private unmake(move: number): void {
    this.side ^= 8;
    const from = move & 127, to = (move >> 7) & 127;
    const flag = (move >> 17) & 15, promo = (move >> 14) & 7;
    const b = this.board;
    const u = this.undoStack.pop()!;
    const piece = promo ? (PAWN | this.side) : b[to];

    b[from] = piece;
    b[to] = EMPTY;

    if (flag === 2) {
      b[to + (this.side === WHITE ? -16 : 16)] = u.captured & 0xff;
    } else if (u.captured) {
      b[to] = u.captured;
    }

    if (flag === 3) {
      if (to === 0x06) { b[0x07] = b[0x05]; b[0x05] = EMPTY; }
      else if (to === 0x02) { b[0x00] = b[0x03]; b[0x03] = EMPTY; }
      else if (to === 0x76) { b[0x77] = b[0x75]; b[0x75] = EMPTY; }
      else if (to === 0x72) { b[0x70] = b[0x73]; b[0x73] = EMPTY; }
    }
    if ((piece & 7) === KING) this.kingSq[this.side >> 3] = from;
    this.castling = u.castling;
    this.ep = u.ep;
    this.halfmove = u.halfmove;
  }

  // ---------- 评估（行棋方视角，厘兵） ----------
  private evaluate(): number {
    let score = 0;
    const b = this.board;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq];
      if (!p) continue;
      const ty = p & 7, white = (p & 8) === WHITE;
      const idx = white ? (7 - (sq >> 4)) * 8 + (sq & 7) : (sq >> 4) * 8 + (sq & 7);
      const v = VAL[ty] + PSTS[ty][idx];
      score += white ? v : -v;
    }
    return this.side === WHITE ? score : -score;
  }

  // ---------- 搜索 ----------
  private timeUp(): boolean {
    if (this.aborted) return true;
    if ((this.nodes & 1023) === 0 && now() >= this.stopAt) this.aborted = true;
    return this.aborted;
  }

  private quiesce(alpha: number, beta: number, qdepth: number): number {
    this.nodes++;
    if (this.timeUp()) return alpha;
    const stand = this.evaluate();
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
    if (qdepth <= 0) return alpha;

    const moves: number[] = [];
    this.genMoves(moves);
    const caps: number[] = [];
    for (const m of moves) {
      const to = (m >> 7) & 127;
      const victim = this.board[to] & 7;
      const promo = (m >> 14) & 7, flag = (m >> 17) & 15;
      if (victim || flag === 2 || promo) caps.push(m);
    }
    // 简化排序：被吃子价值降序
    caps.sort((a, b) => (this.board[(b >> 7) & 127] & 7) - (this.board[(a >> 7) & 127] & 7));
    for (const m of caps) {
      this.make(m);
      // 合法性过滤：走完后己王不能被攻击（防止静态搜索里"吃有保护的王"污染评估）
      if (this.inCheck(this.side === BLACK)) { this.unmake(m); continue; }
      const score = -this.quiesce(-beta, -alpha, qdepth - 1);
      this.unmake(m);
      if (this.aborted) return alpha;
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  private negamax(depth: number, alpha: number, beta: number, ply: number): number {
    if (this.timeUp()) return alpha;
    if (ply > 0 && this.halfmove >= 100) return 0;
    if (depth <= 0) return this.quiesce(alpha, beta, 8);

    this.nodes++;
    const moves: number[] = [];
    this.genMoves(moves);
    this.orderMoves(moves);
    let legalFound = false;

    for (const m of moves) {
      this.make(m);
      // make 后 side 已翻转；刚走的一方是 side^8 → 白方 iff side===BLACK
      if (this.inCheck(this.side === BLACK)) { this.unmake(m); continue; }
      legalFound = true;
      const score = -this.negamax(depth - 1, -beta, -alpha, ply + 1);
      this.unmake(m);
      if (this.aborted) return alpha;
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    if (!legalFound) {
      return this.inCheck(this.side === WHITE) ? -MATE + ply : 0;
    }
    return alpha;
  }

  private orderMoves(moves: number[]): void {
    const b = this.board;
    const scored = moves.map(m => {
      const to = (m >> 7) & 127;
      const victim = b[to] & 7;
      const promo = (m >> 14) & 7, flag = (m >> 17) & 15;
      let s = 0;
      if (victim) s = 100000 + victim * 100 - (b[m & 127] & 7);
      else if (flag === 2) s = 100099;
      if (promo) s += 90000 + promo * 100;
      return { m, s };
    });
    scored.sort((a, b) => b.s - a.s);
    for (let i = 0; i < moves.length; i++) moves[i] = scored[i].m;
  }

  /** 主入口：返回一步走法（含按 skill 的失误窗口） */
  think(fen: string, opts: SearchOptions = {}): SearchResult | null {
    this.load(fen);
    const t0 = now();
    this.nodes = 0; this.aborted = false;
    const skill = Math.max(0, Math.min(20, opts.skill ?? 12));
    const maxDepth = Math.min(6, Math.max(1, opts.depth ?? 2 + Math.floor(skill / 4)));
    const movetime = Math.min(600, Math.max(50, opts.movetimeMs ?? 400));
    this.stopAt = t0 + movetime;
    const errCp = opts.maxErrCp ?? (skill >= 18 ? 0 : skill >= 12 ? 25 : skill >= 8 ? 60 : skill >= 5 ? 120 : 220);

    let roots: { m: number; cp: number }[] = [];
    let completedDepth = 0;

    for (let d = 2; d <= maxDepth; d++) {
      const moves: number[] = [];
      this.genMoves(moves);
      this.orderMoves(moves);
      const iteration: { m: number; cp: number }[] = [];
      let anyLegal = false;

      for (const m of moves) {
        this.make(m);
        if (this.inCheck(this.side === BLACK)) { this.unmake(m); continue; }
        anyLegal = true;
        // 根节点全窗口搜索：保证每个根着法得分精确（失误窗口需要）
        const score = -this.negamax(d - 1, -MATE * 2, MATE * 2, 1);
        this.unmake(m);
        if (this.aborted) break;
        iteration.push({ m, cp: score });
      }
      if (this.aborted || !anyLegal) break;
      if (iteration.length) {
        iteration.sort((a, b) => b.cp - a.cp);
        roots = iteration;
        completedDepth = d;
      }
      if (roots.length && roots[0].cp > MATE - 200) break;   // 已见必杀
      if (now() - t0 > movetime * 0.45) break;               // 预算过半，收手
    }

    if (!roots.length) return null;
    const best = roots[0].cp;
    const pool = roots.filter(r => best - r.cp <= errCp);
    const weights = pool.map(r => Math.exp(-((best - r.cp) / Math.max(errCp, 1)) * 3));
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    let pick = pool[0];
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) { pick = pool[i]; break; }
    }

    const m = pick.m, promo = (m >> 14) & 7;
    return {
      uci: sqName(m & 127) + sqName((m >> 7) & 127) + (promo ? 'nbrq'[promo - 2] : ''),
      cp: pick.cp, depth: completedDepth, nodes: this.nodes,
      ms: Math.round(now() - t0),
    };
  }

  /** 合法着法列表（协议 cmd:"legal"） */
  legalMoves(fen: string): string[] {
    this.load(fen);
    const moves: number[] = [];
    this.genMoves(moves);
    const out: string[] = [];
    for (const m of moves) {
      this.make(m);
      const legal = !this.inCheck(this.side === BLACK);
      this.unmake(m);
      if (legal) {
        const promo = (m >> 14) & 7;
        out.push(sqName(m & 127) + sqName((m >> 7) & 127) + (promo ? 'nbrq'[promo - 2] : ''));
      }
    }
    return out;
  }
}
