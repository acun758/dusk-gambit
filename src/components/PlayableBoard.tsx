import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Button } from "@/components/ui/button";
import { CHESS_PIECE_ASSETS } from "@/lib/chess-piece-assets";

const GLYPH: Record<string, string> = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
};

export function PlayableBoard({
  fen,
  disabled = false,
  lastMove,
  lastMoveWasCapture = false,
  onMove,
}: {
  fen: string;
  disabled?: boolean;
  lastMove?: string | undefined;
  lastMoveWasCapture?: boolean;
  onMove: (uci: string) => void;
}) {
  const chess = useMemo(() => {
    try { return new Chess(fen); } catch { return new Chess(); }
  }, [fen]);
  const [selected, setSelected] = useState<Square | null>(null);
  const legalMoves = useMemo(() => selected ? chess.moves({ square: selected, verbose: true }) : [], [chess, selected]);
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

  const click = (square: Square) => {
    if (disabled) return;
    if (selected && targets.includes(square)) {
      const piece = chess.get(selected);
      const promotion = piece?.type === "p" && (square.endsWith("8") || square.endsWith("1")) ? "q" : "";
      onMove(`${selected}${square}${promotion}`);
      setSelected(null);
      return;
    }
    const piece = chess.get(square);
    setSelected(piece && piece.color === chess.turn() ? square : null);
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
          return (
            <Button
              key={square}
              type="button"
              variant="ghost"
              onClick={() => click(square)}
              aria-label={`${square}${piece ? ` ${piece.color === "w" ? "白方" : "黑方"}${GLYPH[`${piece.color}${piece.type}`]}` : " 空格"}`}
              className={`board-square group relative h-auto min-h-0 w-auto rounded-none p-0 text-[clamp(29px,7.2vw,54px)] leading-none focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-secondary ${
                (file + rank) % 2 ? "board-square-light" : "board-square-dark"
              } ${active ? "is-selected" : ""} ${isLastMove ? "is-last-move" : ""} ${isLastDestination ? "is-last-destination" : ""} ${isLastDestination && lastMoveWasCapture ? "is-capture-impact" : ""} ${isChecked ? "is-check" : ""}`}
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
                    src={CHESS_PIECE_ASSETS[`${piece.color}${piece.type}`]}
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