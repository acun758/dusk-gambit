import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";

const GLYPH: Record<string, string> = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
};

export function PlayableBoard({ fen, disabled = false, onMove }: { fen: string; disabled?: boolean; onMove: (uci: string) => void }) {
  const chess = useMemo(() => {
    try { return new Chess(fen); } catch { return new Chess(); }
  }, [fen]);
  const [selected, setSelected] = useState<Square | null>(null);
  const targets = useMemo(() => selected ? chess.moves({ square: selected, verbose: true }).map((m) => m.to) : [], [chess, selected]);

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
    <div className="game-board ipad-board grid grid-cols-8 grid-rows-8 bg-surface-container-lowest p-1 gold-hairline shadow-2xl" aria-label="国际象棋棋盘">
      {Array.from({ length: 64 }, (_, i) => {
        const file = i % 8;
        const rank = 8 - Math.floor(i / 8);
        const square = `${String.fromCharCode(97 + file)}${rank}` as Square;
        const piece = chess.get(square);
        const active = square === selected;
        const target = targets.includes(square);
        return (
          <button
            key={square}
            type="button"
            onClick={() => click(square)}
            aria-label={square}
            className={`relative flex items-center justify-center text-[clamp(26px,6vw,48px)] leading-none transition-colors ${
              (file + rank) % 2 ? "bg-board-light" : "bg-board-dark"
            } ${active ? "ring-2 ring-inset ring-secondary" : ""}`}
          >
            {target && <span className="absolute w-3 h-3 rounded-full bg-secondary/70" />}
            {piece && <span className={`relative z-10 drop-shadow-lg ${piece.color === "w" ? "text-board-white" : "text-board-black"}`}>{GLYPH[`${piece.color}${piece.type}`]}</span>}
          </button>
        );
      })}
    </div>
  );
}