import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { MiniBoard } from "@/components/MiniBoard";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { spectateArenaRoom } from "@/data/db";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/watch/$roomId")({
  head: () => ({
    meta: [
      { title: "观战 · 公开对局场 | 玄弈棋竞" },
      { name: "description", content: "只读观看公开对局场的实时棋盘、计时与棋谱，不打扰对弈双方。" },
      { property: "og:title", content: "观战 · 公开对局场 | 玄弈棋竞" },
      { property: "og:description", content: "实时观看公开对局，只看不扰。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Watch,
});

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function Watch() {
  const { roomId } = Route.useParams();
  const t = useT();
  const { signedIn } = useProfile();
  const q = useQuery({
    queryKey: ["spectate", roomId],
    queryFn: () => spectateArenaRoom({ data: { roomId } }),
    enabled: signedIn,
    refetchInterval: (query) => {
      const d = query.state.data;
      return d && "status" in d && d.status === "over" ? false : 2000;
    },
  });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const v = q.data && "status" in q.data ? q.data : null;
  const skew = v ? Date.parse(v.serverNow) - (q.dataUpdatedAt || Date.now()) : 0;
  const elapsed = v && v.status === "live" ? Math.max(0, now + skew - Date.parse(v.lastMoveAt)) : 0;
  const clockW = v ? v.clockW - (v.turn === "w" ? elapsed : 0) : 0;
  const clockB = v ? v.clockB - (v.turn === "b" ? elapsed : 0) : 0;

  const resultText = v?.status === "over"
    ? v.outcome === "white"
      ? t("白方胜", "White wins")
      : v.outcome === "black"
        ? t("黑方胜", "Black wins")
        : t("和棋", "Draw")
    : null;

  const row = (side: "w" | "b") =>
    v ? (
      <div className={`home-glass-panel flex items-center gap-2 px-space-sm py-2 ${v.turn === side && v.status === "live" ? "ring-1 ring-secondary" : ""}`}>
        <PlayerAvatar className="h-8 w-8" avatarKey={side === "w" ? v.whiteAvatarKey : v.blackAvatarKey} seed={side} />
        <p className="cjk min-w-0 flex-1 truncate font-label-md text-label-md text-on-surface">
          {side === "w" ? t("白", "W") : t("黑", "B")} · {side === "w" ? v.whiteName : v.blackName} ({side === "w" ? v.whiteElo : v.blackElo})
        </p>
        <span className="font-headline-sm text-headline-sm tabular-nums text-secondary">{fmt(side === "w" ? clockW : clockB)}</span>
      </div>
    ) : null;

  return (
    <div className="relative min-h-dvh">
      <ThemeBackdrop theme="blackGold" />
      <SovereignPageHeader icon="nav-duel" titleZh="观战" titleEn="Spectate" backTo="/" />
      <main className="page-main-compact desktop-page-container px-margin-mobile mx-auto grid w-full max-w-xl gap-space-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="cjk font-label-sm text-label-sm text-on-surface-variant">
            {t("观战模式 · 只看不扰，不能走子或发言", "Spectating · view only, no moves or chat")}
          </p>
          <Link to="/arena" className="cjk font-label-sm text-label-sm text-secondary">
            {t("回到大厅", "Back to Arena")}
          </Link>
        </div>

        {!signedIn ? (
          <p className="home-glass-panel cjk p-space-md font-body-md text-body-md text-on-surface-variant">
            {t("登录后才能观战。", "Sign in to spectate.")}
          </p>
        ) : q.isLoading ? (
          <p className="cjk p-space-md font-body-md text-body-md text-on-surface-variant">{t("正在进入看台…", "Entering the stands…")}</p>
        ) : !v ? (
          <p className="home-glass-panel cjk p-space-md font-body-md text-body-md text-on-surface-variant">
            {t("这间对局场不可观战（私密房或尚未开局）。", "This room can't be watched (private or not started).")}
          </p>
        ) : (
          <>
            {row("b")}
            <MiniBoard fen={v.fen} setId={v.whitePieceSet} />
            {row("w")}
            {resultText ? (
              <p className="home-glass-panel cjk p-space-sm text-center font-headline-sm text-headline-sm text-secondary">
                {t("对局结束 · ", "Game over · ")}
                {resultText}
              </p>
            ) : null}
            <div className="home-glass-panel p-space-sm">
              <p className="cjk mb-1 font-label-sm text-label-sm text-on-surface-variant">
                {t(`棋谱 · ${v.sans.length} 手`, `Moves · ${v.sans.length} plies`)}
              </p>
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface">
                {v.sans.length
                  ? v.sans.map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}. ${s}` : s)).join(" ")
                  : t("尚未走子", "No moves yet")}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
