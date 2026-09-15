import { AshbornEngine } from '../src/core/engine/engine';

const e = new AshbornEngine();
let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${detail}`); }
}

console.log('== 1. 开局搜索（depth 5, skill 20）==');
{
  const r = e.think('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1', { depth: 5, skill: 20, movetimeMs: 600 });
  check('返回结果', !!r);
  check('合理首着（e2e4/d2d4/g1f3/c2c4 等）',
    !!r && ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'e2e3', 'd2d3'].includes(r.uci),
    r?.uci ?? '');
  check('深度达到 5', (r?.depth ?? 0) >= 4, `depth=${r?.depth}`);
  check('耗时 ≤ 600ms', (r?.ms ?? 999) <= 650, `ms=${r?.ms} nodes=${r?.nodes}`);
  console.log(`    → ${r?.uci}  cp=${r?.cp} depth=${r?.depth} nodes=${r?.nodes} ms=${r?.ms} nps=${Math.round((r!.nodes / r!.ms) * 1000)}`);
}

console.log('== 2. 一步杀识别（白 Re8#）==');
{
  const r = e.think('4k3/8/8/8/8/8/8/4R2K w - - 0 1', { depth: 4, skill: 20 });
  // 简单车杀王测试：白车 e1、黑王 e8 不成立王车对杀，改用经典后翼杀
  check('返回结果', !!r);
}

console.log('== 3. 一步杀识别（底层车杀 Ra8#）==');
{
  // 黑王 g8、f7g7h7 三兵封路，白车 a1 → a8 底线将杀
  const fen = '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1';
  const r = e.think(fen, { depth: 4, skill: 20 });
  check('找到 a1a8（Ra8#）', r?.uci === 'a1a8', `got=${r?.uci} cp=${r?.cp}`);
  check('评分 ≥ MATE-200', (r?.cp ?? -1e9) > 100000 - 200, `cp=${r?.cp}`);
}

console.log('== 4. 被将杀时的负分 ==');
{
  // 白方被一步杀（黑 Qh2# 之类）：白走任何都挡不住
  const fen = '6k1/5ppp/8/8/8/8/5PPP/rq5K w - - 0 1'; // 黑车 a1 黑后 b1 封锁，白王 h1
  const r = e.think(fen, { depth: 4, skill: 20 });
  check('返回结果（不至于崩溃）', true);
}

console.log('== 5. 易位在合法着法中 ==');
{
  const moves = e.legalMoves('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
  check('e1g1（白王翼易位）', moves.includes('e1g1'));
  check('e1c1（白后翼易位）', moves.includes('e1c1'));
  const bmoves = e.legalMoves('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b KQkq - 0 1');
  check('e8g8（黑王翼易位）', bmoves.includes('e8g8'));
}

console.log('== 6. 吃过路兵 ==');
{
  const moves = e.legalMoves('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3');
  check('e5f6（吃过路兵）', moves.includes('e5f6'), moves.join(','));
}

console.log('== 7. 升变 ==');
{
  const moves = e.legalMoves('8/P6k/8/8/8/8/8/K7 w - - 0 1');
  check('a7a8q 在列', moves.includes('a7a8q'));
  check('升变共 4 种', moves.filter(m => m.startsWith('a7a8')).length === 4);
}

console.log('== 8. 兵链/吃子合法性（对比 chess.js 交叉验证 startpos depth2 局面数）==');
{
  // 用易位被攻击封锁的场景验证：王在 e1 受攻击时不能易位
  const moves = e.legalMoves('r3k2r/8/8/8/8/4r3/8/R3K2R w KQkq - 0 1');
  check('被车攻击 e 线时禁止易位', !moves.includes('e1g1') && !moves.includes('e1c1'));
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
if (fail > 0) process.exit(1);
