import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Button } from "@/components/ui/button";
import { DEFAULT_PIECE_SET_ID, pieceSet } from "@/lib/piece-sets";
import { playSound } from "@/lib/sound";


export const PIECE_SET_STORAGE_KEY = "bs.pieceSet";
export const PIECE_SET_EVENT = "bs:piece-set";

export function usePieceAssets(): Record<string, string> {
  const [setId, setSetId] = useState(DEFAULT_PIECE_SET_ID);
  useEffect(() => {
    const read = () => {
      try {
        setSetId(window.localStorage.getItem(PIECE_SET_STORAGE_KEY) ?? DEFAULT_PIECE_SET_ID);
      } catch {
        setSetId(DEFAULT_PIECE_SET_ID);
      }
    };
    read();
    window.addEventListener(PIECE_SET_EVENT, read);
    return () => window.removeEventListener(PIECE_SET_EVENT, read);
  }, []);
  return pieceSet(setId).assets;
}

const GLYPH: Record<string, string> = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
};

/** 把 FEN 的行棋方改成指定一方，用于预走子时预判自己的可选着法。 */
function fenForSide(fen: string, side: "w" | "b"): string {
  const parts = fen.split(" ");
  if (parts.length < 6) return fen;
  parts[1] = side;
  parts[3] = "-"; // 过路兵目标在换手后失效
  return parts.join(" ");
}

function PlayableBoardComponent({
  fen,
  disabled = false,
  lastMove,
  lastMoveWasCapture = false,
  onMove,
  whitePieceSetId,
  blackPieceSetId,
  premove = false,
  myColor,
}: {
  fen: string;
  disabled?: boolean;
  lastMove?: string | undefined;
  lastMoveWasCapture?: boolean;
  onMove: (uci: string) => void;
  whitePieceSetId?: string | undefined;
  blackPieceSetId?: string | undefined;
  /** 允许在对手思考时先摆好下一手（快棋预走子） */
  premove?: boolean;
  myColor?: "w" | "b" | undefined;
}) {
  const chess = useMemo(() => {
    try { return new Chess(fen); } catch { return new Chess(); }
  }, [fen]);
  const localAssets = usePieceAssets();
  const whiteAssets = whitePieceSetId ? pieceSet(whitePieceSetId).assets : localAssets;
  const blackAssets = blackPieceSetId ? pieceSet(blackPieceSetId).assets : localAssets;
  const [selected, setSelected] = useState<Square | null>(null);
  // 预走子：对手思考时先摆一手，轮到自己且仍合法时自动送出
  const [pending, setPending] = useState<{ from: Square; to: Square; uci: string } | null>(null);
  const premoveMode = premove && disabled && !!myColor;
  /** 预走子时用“假设轮到自己”的局面推算可选目标 */
  const previewChess = useMemo(() => {
    if (!premoveMode || !myColor) return null;
    try { return new Chess(fenForSide(fen, myColor)); } catch { return null; }
  }, [premoveMode, fen, myColor]);
  const activeBoard = previewChess ?? chess;
  const legalMoves = useMemo(
    () => (selected ? activeBoard.moves({ square: selected, verbose: true }) : []),
    [activeBoard, selected],
  );
  const targets = useMemo(() => legalMoves.map((m) => m.to), [legalMoves]);
  const moveTrail = useMemo(() => {
    if (!lastMove || lastMove.length < 4) return null;
    const point = (square: string) => ({
      x: (square.charCodeAt(0) - 96 - 0.5) * 12.5,
      y: (8 - Number(square[1]) + 0.5) * 12.5,
    });
    return { from: point(lastMove.slice(0, 2)), to: point(lastMove.slice(2, 4)) };
  }, [lastMove]);
  const checkedKing = useMemo(() => {
    if (!chess.inCheck()) return null;
    for (const rank of "12345678") {
      for (const file of "abcdefgh") {
        const square = `${file}${rank}` as Square;
        const piece = chess.get(square);
        if (piece?.type === "k" && piece.color === chess.turn()) return square;
      }
    }
    return null;
  }, [chess]);

  // 音效：仅根据已落子的局面变化播放，不参与任何走子判定
  const soundRef = useRef<{ move?: string; pieces: number } | null>(null);
  useEffect(() => {
    const pieces = (fen.split(" ")[0] ?? "").replace(/[^a-zA-Z]/g, "").length;
    const prev = soundRef.current;
    soundRef.current = { ...(lastMove ? { move: lastMove } : {}), pieces };
    if (!prev) return;
    if (!lastMove || lastMove === prev.move) return;
    playSound(lastMoveWasCapture || pieces < prev.pieces ? "capture" : "move");
    if (chess.inCheck()) window.setTimeout(() => playSound("check"), 160);
  }, [fen, lastMove, lastMoveWasCapture, chess]);



  // 轮到自己时兑现预走子：仍合法才送出，否则丢弃并让玩家重选
  useEffect(() => {
    if (disabled || !pending) return;
    const legal = chess.moves({ verbose: true }).some((m) => m.from === pending.from && m.to === pending.to);
    setPending(null);
    setSelected(null);
    if (legal) onMove(pending.uci);
  }, [disabled, pending, chess, onMove]);

  // 局势变化后清掉过期的预走子选择
  useEffect(() => {
    if (!premoveMode) setSelected((s) => (disabled ? null : s));
  }, [premoveMode, disabled]);

  const click = (square: Square) => {
    if (disabled && !premoveMode) return;
    if (selected && targets.includes(square)) {
      const piece = activeBoard.get(selected);
      const promotion = piece?.type === "p" && (square.endsWith("8") || square.endsWith("1")) ? "q" : "";
      const uci = `${selected}${square}${promotion}`;
      if (premoveMode) setPending({ from: selected, to: square, uci });
      else onMove(uci);
      setSelected(null);
      return;
    }
    const piece = activeBoard.get(square);
    const side = premoveMode && myColor ? myColor : chess.turn();
    if (pending) setPending(null);
    setSelected(piece && piece.color === side ? square : null);
  };


  return (
    <div className="board-stage game-board ipad-board" aria-label="国际象棋棋盘">
      <div className="board-ambient" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>
      <div className="board-grid grid grid-cols-8 grid-rows-8">
        {moveTrail && (
          <svg className={`board-move-trail ${lastMoveWasCapture ? "is-capture" : ""}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1={moveTrail.from.x} y1={moveTrail.from.y} x2={moveTrail.to.x} y2={moveTrail.to.y} pathLength="1" />
            <circle cx={moveTrail.from.x} cy={moveTrail.from.y} r="1.1" />
            <circle cx={moveTrail.to.x} cy={moveTrail.to.y} r="1.7" />
          </svg>
        )}
        {Array.from({ length: 64 }, (_, i) => {
          const file = i % 8;
          const rank = 8 - Math.floor(i / 8);
          const square = `${String.fromCharCode(97 + file)}${rank}` as Square;
          const piece = chess.get(square);
          const active = square === selected;
          const targetMove = legalMoves.find((m) => m.to === square);
          const target = targets.includes(square);
          const isLastMove = lastMove?.slice(0, 2) === square || lastMove?.slice(2, 4) === square;
          const isLastDestination = lastMove?.slice(2, 4) === square;
          const isChecked = checkedKing === square;
          const isPremove = pending?.from === square || pending?.to === square;
          return (
            <Button
              key={square}
              type="button"
              variant="ghost"
              onClick={() => click(square)}
              aria-label={`${square}${piece ? ` ${piece.color === "w" ? "白方" : "黑方"}${GLYPH[`${piece.color}${piece.type}`]}` : " 空格"}`}
              className={`board-square group relative h-auto min-h-0 w-auto rounded-none p-0 text-[clamp(29px,7.2vw,54px)] leading-none focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-secondary ${
                (file + rank) % 2 ? "board-square-light" : "board-square-dark"
              } ${active ? "is-selected" : ""} ${isLastMove ? "is-last-move" : ""} ${isLastDestination ? "is-last-destination" : ""} ${isLastDestination && lastMoveWasCapture ? "is-capture-impact" : ""} ${isChecked ? "is-check" : ""} ${isPremove ? "is-premove" : ""}`}
            >
              {file === 0 && <span className="board-rank" aria-hidden="true">{rank}</span>}
              {rank === 1 && <span className="board-file" aria-hidden="true">{String.fromCharCode(97 + file)}</span>}
              {target && (
                <span className={targetMove?.captured ? "board-capture" : "board-target"} aria-hidden="true" />
              )}
              {piece && (
                <span
                  className="board-piece relative z-10"
                  data-color={piece.color}
                  data-glyph={GLYPH[`${piece.color}${piece.type}`]}
                >
                  <span className="board-piece-fallback" aria-hidden="true">{GLYPH[`${piece.color}${piece.type}`]}</span>
                  <img
                    src={(piece.color === "w" ? whiteAssets : blackAssets)[`${piece.color}${piece.type}`]}
                    alt=""
                    draggable={false}
                    onError={(event) => { event.currentTarget.hidden = true; }}
                  />
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export const PlayableBoard = memo(PlayableBoardComponent);