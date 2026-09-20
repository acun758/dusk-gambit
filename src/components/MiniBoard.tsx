import { memo, useMemo } from "react";
import { pieceSet } from "@/lib/piece-sets";

/** 房卡上的迷你棋盘：只读展示，复用现有棋子套装素材，不引入外部图片。 */
function parseFen(fen: string): (string | null)[] {
  const board = fen.split(" ")[0] ?? "";
  const cells: (string | null)[] = [];
  for (const ch of board) {
    if (ch === "/") continue;
    if (ch >= "1" && ch <= "8") {
      for (let i = 0; i < Number(ch); i += 1) cells.push(null);
      continue;
    }
    const side = ch === ch.toUpperCase() ? "w" : "b";
    cells.push(`${side}${ch.toLowerCase()}`);
  }
  while (cells.length < 64) cells.push(null);
  return cells.slice(0, 64);
}

export const MiniBoard = memo(function MiniBoard({
  fen,
  flipped = false,
  setId,
  className = "",
}: {
  fen: string;
  flipped?: boolean;
  setId?: string;
  className?: string;
}) {
  const assets = useMemo(() => pieceSet(setId).assets, [setId]);
  const cells = useMemo(() => {
    const parsed = parseFen(fen);
    return flipped ? [...parsed].reverse() : parsed;
  }, [fen, flipped]);

  return (
    <div
      aria-hidden="true"
      className={`grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[8px] border border-outline-variant/40 ${className}`}
    >
      {cells.map((piece, i) => {
        const dark = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
        return (
          <div key={i} className={dark ? "bg-surface-container-high" : "bg-surface-container-low"}>
            {piece ? (
              <img
                src={assets[piece]}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
});
