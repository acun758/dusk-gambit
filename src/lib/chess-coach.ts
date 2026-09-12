import { Chess } from "chess.js";
import type { MoveFrame } from "@/lib/duel-protocol";

export interface CoachInsight {
  phase: "opening" | "middlegame" | "endgame";
  eyebrow: string;
  title: string;
  body: string;
  icon: string;
}

const OPENINGS: Array<{ line: string[]; name: string; principle: string }> = [
  { line: ["e4", "c5"], name: "西西里防御", principle: "白方争取快速出子，黑方用不对称兵形争夺中心。" },
  { line: ["e4", "e5", "Nf3", "Nc6", "Bb5"], name: "西班牙开局", principle: "先完成王翼出子与易位，再决定是否打开中心。" },
  { line: ["e4", "e5", "Nf3", "Nc6", "Bc4"], name: "意大利开局", principle: "注意 f7 弱点，同时避免皇后过早出动。" },
  { line: ["d4", "d5", "c4"], name: "后翼弃兵", principle: "用侧翼兵换取中心空间，优先发展轻子。" },
  { line: ["d4", "Nf6", "c4", "g6"], name: "王印度防御", principle: "白方占据中心，黑方准备从王翼反击。" },
  { line: ["Nf3", "d5", "g3"], name: "雷蒂开局", principle: "先控制中心再决定兵形，保持布局弹性。" },
];

function normalizedSan(san: string) {
  return san.replace(/[+#?!]/g, "");
}

function openingInsight(moves: MoveFrame[]): CoachInsight {
  const sans = moves.map((move) => normalizedSan(move.san));
  const match = [...OPENINGS]
    .sort((a, b) => b.line.length - a.line.length)
    .find((opening) => opening.line.every((san, index) => sans[index] === san));
  return {
    phase: "opening",
    eyebrow: "开局讲解 · Opening",
    title: match?.name ?? "开局三原则",
    body: match?.principle ?? "先控制中心、发展马象、尽早保护王；不要连续移动同一枚棋子。",
    icon: "menu_book",
  };
}

export function getCoachInsight(fen: string, moves: MoveFrame[], ranked: boolean): CoachInsight {
  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return openingInsight(moves);
  }

  if (moves.length < 12) return openingInsight(moves);

  const pieces = chess.board().flat().filter(Boolean);
  const queens = pieces.filter((piece) => piece?.type === "q").length;
  const heavyAndMinor = pieces.filter((piece) => piece && ["q", "r", "b", "n"].includes(piece.type)).length;
  const isEndgame = queens === 0 || heavyAndMinor <= 6 || pieces.length <= 12;

  if (isEndgame) {
    return {
      phase: "endgame",
      eyebrow: "残局解析 · Endgame",
      title: queens === 0 ? "王要主动参战" : "先制造通路兵",
      body: "残局中先激活王，再固定对方弱兵。计算交换后，确认自己的通路兵是否更快升变。",
      icon: "chess_pawn",
    };
  }

  if (chess.inCheck()) {
    return {
      phase: "middlegame",
      eyebrow: "战术提示 · Tactics",
      title: "先处理将军",
      body: ranked ? "真人天梯只提示局面主题：检查移王、吃子与挡将三类应对。" : "逐一检查移王、吃掉进攻子和挡住攻击线，再比较哪种应对损失最小。",
      icon: "warning",
    };
  }

  const last = moves.at(-1);
  if (last?.san.includes("x")) {
    return {
      phase: "middlegame",
      eyebrow: "战术提示 · Tactics",
      title: "交换后重新扫描",
      body: ranked ? "确认双方王的安全与未保护棋子，再决定下一步。" : "每次吃子后按“将军、吃子、威胁”重新扫描，避免只看到眼前交换。",
      icon: "target",
    };
  }

  return {
    phase: "middlegame",
    eyebrow: "战术提示 · Tactics",
    title: "先看对手的威胁",
    body: ranked ? "真人天梯不提供推荐着，只提醒检查王安全、未保护棋子与开放线。" : "落子前依次检查将军、吃子和直接威胁，再改善最差的一枚棋子。",
    icon: "psychology",
  };
}