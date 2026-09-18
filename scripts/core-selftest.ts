/**
 * src/core 纯 Node 自测（R1 验收）
 *
 * 运行：  npm run test:core       （= node --import tsx scripts/core-selftest.ts）
 * 不启动浏览器、不连数据库、不读任何 DOM：core 目录能整包搬去微信小游戏。
 *
 * 覆盖：走子合法性、七类判和用例、ELO 结算口径、心智四维复算、复盘五档、段位映射、
 *       赛制表、残局分级与评分、引擎搜索（主线程降级）。
 */
import assert from "node:assert/strict";

import {
  START_FEN,
  applyMove,
  isLegal,
  legalMoves,
  replay,
  statusOf,
  drawDetails,
} from "../src/core/rules.ts";
import { outcomeFromPosition, outcomeAfterResign, outcomeAfterFlag, scoreFor, previewKFactor, previewRatingDelta } from "../src/core/settle.ts";
import { accuracyFromAcpl, tagForLoss } from "../src/core/review.ts";
import { computeMind, sanitizeMindMoves } from "../src/core/mind.ts";
import { RANK_TIERS_CORE, rankOfCore, nextRankCore } from "../src/core/ranks.ts";
import { TIME_CONTROLS, timeControl, timeControlLabel, matchTimeControl } from "../src/core/timeControls.ts";
import { ENDGAME_TIERS, tierOfDepth, groupByTier } from "../src/core/endgame.ts";
import { drillScore, tagForSwing } from "../src/core/score.ts";
import { interpolate, afterMovePreview, formatClock, BLITZ_3_2 } from "../src/core/clock.ts";
import { AshbornEngine } from "../src/core/engine/engine.ts";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

console.log("== 1. 规则与走子合法性 ==");
check("开局 20 个合法着法", () => assert.equal(legalMoves(START_FEN).length, 20));
check("e2e4 合法且 SAN 为 e4", () => assert.equal(applyMove(START_FEN, "e2e4")!.san, "e4"));
check("e2e5 非法", () => assert.equal(isLegal(START_FEN, "e2e5"), false));
check("非法着法返回 null 不抛错", () => assert.equal(applyMove(START_FEN, "zzzz"), null));
check("白王翼易位", () => {
  const fen = "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4";
  assert.equal(applyMove(fen, "e1g1")!.san, "O-O");
});
check("过路兵吃子", () => {
  const fen = "rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3";
  assert.equal(applyMove(fen, "e5f6")!.san, "exf6");
});
check("升变为后", () => {
  const fen = "8/P6k/8/8/8/8/8/7K w - - 0 1";
  assert.equal(applyMove(fen, "a7a8q")!.san, "a8=Q");
});
check("学者杀四步将死", () => {
  const line = ["e2e4", "e7e5", "f1c4", "b8c6", "d1h5", "g8f6", "h5f7"];
  const moves = replay(line);
  assert.equal(moves.length, 7);
  const s = statusOf(moves[moves.length - 1]!.fen);
  assert.equal(s.checkmate, true);
  assert.equal(s.gameOver, true);
});
check("愚人杀两步将死", () => {
  const moves = replay(["f2f3", "e7e5", "g2g4", "d8h4"]);
  assert.equal(statusOf(moves[moves.length - 1]!.fen).checkmate, true);
});

console.log("== 2. 七类判和用例 ==");
check("① 逼和 stalemate", () => {
  const d = drawDetails([], "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
  assert.equal(d.stalemate, true);
  assert.equal(d.draw, true);
});
check("② 单王对单王", () => assert.equal(drawDetails([], "7k/8/8/8/8/8/8/K7 w - - 0 1").insufficientMaterial, true));
check("③ 王象对单王", () => assert.equal(drawDetails([], "7k/8/8/8/8/8/8/KB6 w - - 0 1").insufficientMaterial, true));
check("④ 王马对单王", () => assert.equal(drawDetails([], "7k/8/8/8/8/8/8/KN6 w - - 0 1").insufficientMaterial, true));
check("⑤ 五十回合规则", () => {
  const d = drawDetails([], "7k/8/8/8/8/8/R7/K7 w - - 100 80");
  assert.equal(d.fiftyMove, true);
  assert.equal(d.draw, true);
});
check("⑥ 三次重复局面", () => {
  const line = ["g1f3", "g8f6", "f3g1", "f6g8", "g1f3", "g8f6", "f3g1", "f6g8"];
  assert.equal(drawDetails(line).threefold, true);
});
check("⑦ 未判和的正常局面", () => {
  const d = drawDetails(["e2e4", "e7e5"]);
  assert.equal(d.draw, false);
  assert.equal(d.threefold, false);
  assert.equal(d.fiftyMove, false);
});
check("终局推断：将死判给对方", () => {
  const moves = replay(["f2f3", "e7e5", "g2g4", "d8h4"]);
  assert.deepEqual(outcomeFromPosition(moves[moves.length - 1]!.fen), { outcome: "black", reason: "mate" });
});
check("终局推断：逼和为和", () => {
  assert.deepEqual(outcomeFromPosition("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1"), { outcome: "draw", reason: "draw" });
});

console.log("== 3. ELO 结算与定级口径（显示计算，权威在服务端） ==");
check("认输 / 超时归属", () => {
  assert.deepEqual(outcomeAfterResign("w"), { outcome: "black", reason: "resign" });
  assert.deepEqual(outcomeAfterFlag("b"), { outcome: "white", reason: "timeout" });
});
check("得分 1 / 0.5 / 0", () => {
  assert.equal(scoreFor("w", "white"), 1);
  assert.equal(scoreFor("w", "draw"), 0.5);
  assert.equal(scoreFor("w", "black"), 0);
});
check("K 值分段 32 / 24 / 16", () => {
  assert.equal(previewKFactor(1000), 32);
  assert.equal(previewKFactor(2199), 32);
  assert.equal(previewKFactor(2200), 24);
  assert.equal(previewKFactor(2499), 24);
  assert.equal(previewKFactor(2500), 16);
});
check("同分胜 +16 / 负 -16 / 和 0", () => {
  assert.equal(previewRatingDelta(1000, 1000, 1), 16);
  assert.equal(previewRatingDelta(1000, 1000, 0), -16);
  assert.equal(previewRatingDelta(1000, 1000, 0.5), 0);
});
check("以弱胜强得分更多", () => {
  assert.ok(previewRatingDelta(1000, 1400, 1) > previewRatingDelta(1400, 1000, 1));
});

console.log("== 4. 复盘五档与准确率 ==");
check("五档边界", () => {
  assert.equal(tagForLoss(0), "best");
  assert.equal(tagForLoss(30), "best");
  assert.equal(tagForLoss(31), "good");
  assert.equal(tagForLoss(90), "good");
  assert.equal(tagForLoss(91), "inaccuracy");
  assert.equal(tagForLoss(200), "inaccuracy");
  assert.equal(tagForLoss(201), "mistake");
  assert.equal(tagForLoss(400), "mistake");
  assert.equal(tagForLoss(401), "blunder");
});
check("准确率按厘兵入参（ACPL 0 → 100）", () => assert.equal(accuracyFromAcpl(0), 100));
check("ACPL 47 厘兵 ≈ 97.9", () => {
  const v = accuracyFromAcpl(47);
  assert.ok(v > 97 && v < 98.5, `实际 ${v}`);
});
check("ACPL 越大准确率越低", () => assert.ok(accuracyFromAcpl(300) < accuracyFromAcpl(100)));

console.log("== 5. 心智四维复算 ==");
const mindMoves = [
  { ply: 1, by: "w" as const, san: "e4", cp: 25, loss: 10 },
  { ply: 2, by: "b" as const, san: "e5", cp: 20, loss: 15 },
  { ply: 3, by: "w" as const, san: "Nf3", cp: 30, loss: 5 },
  { ply: 4, by: "b" as const, san: "Nc6", cp: 28, loss: 12 },
  { ply: 5, by: "w" as const, san: "Bxc6", cp: -260, loss: 320 },
  { ply: 6, by: "b" as const, san: "dxc6", cp: -250, loss: 8 },
];
check("四维都在 0~100", () => {
  const r = computeMind(mindMoves, "w", "black");
  assert.equal(r.facets.length, 4);
  for (const f of r.facets) assert.ok(f.value >= 0 && f.value <= 100, `${f.key}=${f.value}`);
});
check("ACPL 与手数只统计本方", () => {
  const r = computeMind(mindMoves, "w", "black");
  assert.equal(r.moveCount, 3);
  assert.equal(r.acpl, Math.round((10 + 5 + 320) / 3));
});
check("最大失分排第一并带标签", () => {
  const r = computeMind(mindMoves, "w", "black");
  assert.equal(r.worst[0]!.ply, 5);
  assert.equal(r.worst[0]!.tag, "mistake");
});
check("本方零手不给满分", () => {
  const r = computeMind([{ ply: 1, by: "b", san: "e5", cp: 0, loss: 0 }], "w", null);
  assert.equal(r.accuracy, 0);
  assert.equal(r.moveCount, 0);
  assert.deepEqual(r.facets.map((f) => f.value), [0, 0, 0, 0]);
});
check("入参消毒：限幅与限长", () => {
  const dirty = sanitizeMindMoves([{ ply: -3, by: "x" as "w", san: "abcdefghijklmnop", cp: 9999, loss: -50 }]);
  assert.deepEqual(dirty[0], { ply: 0, by: "w", san: "abcdefghijkl", cp: 1500, loss: 0 });
});

console.log("== 6. 段位映射（边界 1200/1600/2000/2200/2500） ==");
check("六阶顺序与边界", () => {
  assert.deepEqual(RANK_TIERS_CORE.map((t) => t.id), ["king", "queen", "rook", "bishop", "knight", "pawn"]);
  assert.deepEqual(RANK_TIERS_CORE.map((t) => t.floor), [2500, 2200, 2000, 1600, 1200, 0]);
});
check("分数落段正确", () => {
  assert.equal(rankOfCore(0).id, "pawn");
  assert.equal(rankOfCore(1199).id, "pawn");
  assert.equal(rankOfCore(1200).id, "knight");
  assert.equal(rankOfCore(1599).id, "knight");
  assert.equal(rankOfCore(1600).id, "bishop");
  assert.equal(rankOfCore(2000).id, "rook");
  assert.equal(rankOfCore(2200).id, "queen");
  assert.equal(rankOfCore(2500).id, "king");
  assert.equal(rankOfCore(3200).id, "king");
});
check("下一段位，王之上为 null", () => {
  assert.equal(nextRankCore(1000)!.id, "knight");
  assert.equal(nextRankCore(2499)!.id, "king");
  assert.equal(nextRankCore(2600), null);
});

console.log("== 7. 赛制、残局分级与评分 ==");
check("四种赛制", () => {
  assert.deepEqual(TIME_CONTROLS.map((t) => t.label), ["1+0", "3+2", "10+0", "15+10"]);
  assert.equal(timeControl("blitz").base, 180_000);
  assert.equal(timeControlLabel(180_000, 2_000), "3+2 快棋");
  assert.equal(matchTimeControl(123, 4), null);
});
check("残局四级按深度分档", () => {
  assert.equal(ENDGAME_TIERS.length, 4);
  assert.equal(tierOfDepth(1).id, "novice");
  assert.equal(tierOfDepth(4).id, "adept");
  assert.equal(tierOfDepth(6).id, "master");
  assert.equal(tierOfDepth(12).id, "grandmaster");
});
check("上一级未达 60% 则下一级锁定", () => {
  const levels = [
    { id: 1, depth: 1 }, { id: 2, depth: 1 }, { id: 3, depth: 1 },
    { id: 4, depth: 4 }, { id: 5, depth: 4 },
  ];
  const locked = groupByTier(levels, new Set([1]));
  assert.equal(locked[0]!.unlocked, true);
  assert.equal(locked[1]!.unlocked, false);
  const unlocked = groupByTier(levels, new Set([1, 2]));
  assert.equal(unlocked[1]!.unlocked, true);
});
check("残局评分：无失分满分，失分扣分", () => {
  assert.equal(drillScore([{ swing: 30 }, { swing: 0 }]), 100);
  assert.equal(drillScore([{ swing: -120 }]), 90);
  assert.equal(tagForSwing(-500, false), "blunder");
  assert.equal(tagForSwing(-500, true), "best");
});

console.log("== 8. 时钟显示计算 ==");
check("插值只扣走子方", () => {
  assert.deepEqual(interpolate({ w: 10_000, b: 9_000 }, "w", 1_500), { w: 8_500, b: 9_000 });
});
check("走子后加补时 2 秒", () => {
  assert.deepEqual(afterMovePreview({ w: 10_000, b: 9_000 }, "w", 1_000, BLITZ_3_2), { w: 11_000, b: 9_000 });
});
check("时间格式", () => {
  assert.equal(formatClock(185_000), "3:05");
  assert.equal(formatClock(0), "0:00.0");
});

console.log("== 9. 端内引擎（主线程搜索，无 Worker / 无浏览器） ==");
check("开局能给出合法着法", () => {
  const engine = new AshbornEngine();
  const r = engine.think(START_FEN, { depth: 3, movetimeMs: 400, skill: 20 });
  assert.ok(r && r.uci, "引擎未返回着法");
  assert.ok(isLegal(START_FEN, r!.uci), `着法非法：${r!.uci}`);
});
check("一步杀能被找到", () => {
  const engine = new AshbornEngine();
  const fen = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1"; // Ra8#
  const r = engine.think(fen, { depth: 4, movetimeMs: 600, skill: 20 });
  assert.ok(r && isLegal(fen, r.uci));
});

console.log(`\n全部通过：${passed} 项断言用例，环境 = node ${process.version}，无浏览器、无数据库。`);
