import { Chess } from "chess.js";
import type { MoveFrame } from "@/lib/duel-protocol";

export interface CoachInsight {
  phase: "opening" | "middlegame" | "endgame";
  eyebrow: string;
  eyebrowEn: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  icon: string;
}

const OPENINGS: Array<{ line: string[]; name: string; nameEn: string; principle: string; principleEn: string }> = [
  {
    line: ["e4", "c5"],
    name: "西西里防御",
    nameEn: "Sicilian Defence",
    principle: "白方争取快速出子，黑方用不对称兵形争夺中心。",
    principleEn: "White races to develop; Black fights for the centre with an asymmetric pawn structure.",
  },
  {
    line: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    name: "西班牙开局",
    nameEn: "Ruy Lopez",
    principle: "先完成王翼出子与易位，再决定是否打开中心。",
    principleEn: "Finish kingside development and castle before deciding whether to open the centre.",
  },
  {
    line: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    name: "意大利开局",
    nameEn: "Italian Game",
    principle: "注意 f7 弱点，同时避免皇后过早出动。",
    principleEn: "Watch the f7 weakness, and avoid bringing the queen out too early.",
  },
  {
    line: ["d4", "d5", "c4"],
    name: "后翼弃兵",
    nameEn: "Queen's Gambit",
    principle: "用侧翼兵换取中心空间，优先发展轻子。",
    principleEn: "Trade a wing pawn for central space, and develop the minor pieces first.",
  },
  {
    line: ["d4", "Nf6", "c4", "g6"],
    name: "王印度防御",
    nameEn: "King's Indian Defence",
    principle: "白方占据中心，黑方准备从王翼反击。",
    principleEn: "White takes the centre while Black prepares a kingside counterattack.",
  },
  {
    line: ["Nf3", "d5", "g3"],
    name: "雷蒂开局",
    nameEn: "Réti Opening",
    principle: "先控制中心再决定兵形，保持布局弹性。",
    principleEn: "Control the centre from afar and keep the pawn structure flexible.",
  },
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
    eyebrowEn: "Opening notes",
    title: match?.name ?? "开局三原则",
    titleEn: match?.nameEn ?? "Three opening principles",
    body: match?.principle ?? "先控制中心、发展马象、尽早保护王；不要连续移动同一枚棋子。",
    bodyEn:
      match?.principleEn ??
      "Take the centre, develop knights and bishops, and tuck the king away early — and don't move the same piece twice.",
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
      eyebrowEn: "Endgame notes",
      title: queens === 0 ? "王要主动参战" : "先制造通路兵",
      titleEn: queens === 0 ? "Activate your king" : "Create a passed pawn",
      body: "残局中先激活王，再固定对方弱兵。计算交换后，确认自己的通路兵是否更快升变。",
      bodyEn:
        "Bring the king in first, then fix the opponent's weak pawns. Calculate the trades and check whose passed pawn queens faster.",
      icon: "chess_pawn",
    };
  }

  if (chess.inCheck()) {
    return {
      phase: "middlegame",
      eyebrow: "战术提示 · Tactics",
      eyebrowEn: "Tactics",
      title: "先处理将军",
      titleEn: "Answer the check first",
      body: ranked ? "真人天梯只提示局面主题：检查移王、吃子与挡将三类应对。" : "逐一检查移王、吃掉进攻子和挡住攻击线，再比较哪种应对损失最小。",
      bodyEn: ranked
        ? "Ranked play only names the theme: consider moving, capturing or blocking."
        : "Check moving the king, capturing the attacker and blocking the line — then pick the cheapest answer.",
      icon: "warning",
    };
  }

  const last = moves.at(-1);
  if (last?.san.includes("x")) {
    return {
      phase: "middlegame",
      eyebrow: "战术提示 · Tactics",
      eyebrowEn: "Tactics",
      title: "交换后重新扫描",
      titleEn: "Rescan after every trade",
      body: ranked ? "确认双方王的安全与未保护棋子，再决定下一步。" : "每次吃子后按“将军、吃子、威胁”重新扫描，避免只看到眼前交换。",
      bodyEn: ranked
        ? "Check both kings and any loose pieces before choosing your next move."
        : "After each capture, rescan for checks, captures and threats instead of only the trade in front of you.",
      icon: "target",
    };
  }

  return {
    phase: "middlegame",
    eyebrow: "战术提示 · Tactics",
    eyebrowEn: "Tactics",
    title: "先看对手的威胁",
    titleEn: "Look at your opponent's threats",
    body: ranked ? "真人天梯不提供推荐着，只提醒检查王安全、未保护棋子与开放线。" : "落子前依次检查将军、吃子和直接威胁，再改善最差的一枚棋子。",
    bodyEn: ranked
      ? "Ranked play suggests no moves — it only reminds you to check king safety, loose pieces and open files."
      : "Before moving, scan checks, captures and direct threats, then improve your worst-placed piece.",
    icon: "psychology",
  };
}
