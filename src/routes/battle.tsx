import { createFileRoute, Link } from "@tanstack/react-router";
import { rankOf } from "@/lib/ranks";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { playSound, primeSounds } from "@/lib/sound";

import { EndgameDrill } from "@/components/EndgameDrill";
import { DuelPanel } from "@/components/DuelPanel";
import { PlayableBoard } from "@/components/PlayableBoard";
import { useDuelSession, fmtClock } from "@/hooks/useDuelSession";
import { Button } from "@/components/ui/button";
import { AI_LEVELS, aiLevel } from "@/core/ai";
import { getCoachInsight } from "@/lib/chess-coach";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { OpponentPanel } from "@/components/OpponentPanel";
import { UiIcon, type UiIconName } from "@/components/UiIcon";
import { PromotionOverlay, usePromotionCeremony } from "@/components/PromotionOverlay";
import { MatchReportOverlay, type MatchReportInput } from "@/components/MatchReportOverlay";
import { Bi, LangToggle, useLang, useT } from "@/lib/i18n";
import { useProfile, placementLabel } from "@/lib/profile";
import { DuelVoice } from "@/components/DuelVoice";
import { currentUserId } from "@/data/db";
import { subscribeAuditAlerts } from "@/data/realtime";
import { toast } from "sonner";
import { auditAlertText } from "@/lib/audit-alerts";
import { toPgn, resultTag, type Outcome } from "@/core/pgn";
import { downloadPgn } from "@/lib/share-game";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { SoundToggle } from "@/components/SoundToggle";

export const Route = createFileRoute("/battle")({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>): { drill?: string } =>
    typeof search['drill'] === "string" ? { drill: search['drill'] as string } : {},
  head: () => ({
    meta: [
      { title: "实时对弈 | 玄弈棋竞" },
      { name: "description", content: "1+0 / 3+2 / 10+0 / 15+10 四种赛制，服务端仲裁时钟与胜负的实时天梯对弈。" },
      { property: "og:title", content: "实时对弈 | 玄弈棋竞" },
      { property: "og:description", content: "1+0 / 3+2 / 10+0 / 15+10 四种赛制，服务端仲裁时钟与胜负的实时天梯对弈。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Battle,
});

const PHASE: Record<string, { zh: string; en: string }> = {
  idle: { zh: "待命", en: "Idle" },
  connecting: { zh: "连接中", en: "Connecting" },
  live: { zh: "实时同步", en: "Live" },
  resyncing: { zh: "追帧中", en: "Resyncing" },
  offline: { zh: "断线重连", en: "Reconnecting" },
};

function Battle() {
  const { drill } = Route.useSearch();
  const [tab, setTab] = useState<"duel" | "drill">(drill ? "drill" : "duel");
  useEffect(() => {
    if (drill) setTab("drill");
  }, [drill]);
  useEffect(() => {
    const prime = () => primeSounds();
    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  const session = useDuelSession();
  const { profile, signedIn } = useProfile();
  const [myUserId, setMyUserId] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void currentUserId()
      .then((id) => {
        if (alive) setMyUserId(id ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [signedIn]);
  const t = useT();
  const { lang } = useLang();
  // 防作弊告警：服务端判定异常走子后，当事人立刻收到提示（不只是后台留痕）
  useEffect(() => {
    if (!myUserId) return;
    return subscribeAuditAlerts({ userId: myUserId }, (frame) => {
      // 低严重度（手速类）只后台留痕，不打扰玩家
      if (frame.severity === "info") return;
      const text = auditAlertText(frame.kind, lang);
      if (frame.severity === "critical") toast.error(text.title, { description: text.body, duration: 8000 });
      else toast.warning(text.title, { description: text.body });
    });

  }, [lang, myUserId]);

  const waiting = session.state.status === "waiting";
  const myTurn = session.state.turn === session.state.you && session.state.status === "live" && !session.movePending;
  const opponent = session.state.you === "w" ? session.state.players.b : session.state.players.w;
  const me = session.state.players[session.state.you];
  const ranked = session.transport === "cloud";
  // 每次时钟刷新都重算教练提示会新建一副棋盘，这里按局面缓存。
  const coach = useMemo(() => getCoachInsight(session.state.fen, session.moves, ranked), [session.state.fen, session.moves, ranked]);
  const oppSide = session.state.you === "w" ? "b" : "w";
  // 本方积分只认服务端档案；陪练/离线时也用档案分，不再显示占位值
  const myElo = session.ratings?.[session.state.you]?.elo ?? profile.elo;
  const oppElo = session.ratings?.[oppSide]?.elo ?? opponent.elo;
  const myClock = session.clock[session.state.you];
  // 棋子套装是观看者的整盘视觉主题：选择一套后，白方与黑方都使用该套对应棋子。
  // 真人双方的装备快照仍由服务端保留，但不再把两位玩家的套装混搭在同一棋盘。
  const boardPieceSetId = signedIn ? profile.equippedPieceSet : undefined;
  // 求和 / 认输前的二次确认
  const [confirmAction, setConfirm] = useState<"draw" | "resign" | null>(null);
  const exportPgn = () => {
    const pgn = toPgn(
      session.moves.map((m) => ({ san: m.san, uci: m.uci })),
      {
        white: session.state.players.w.name,
        black: session.state.players.b.name,
        whiteElo: session.state.you === "w" ? myElo : oppElo,
        blackElo: session.state.you === "b" ? myElo : oppElo,
        timeControl: `${Math.round(session.state.tc.base / 1000)}+${Math.round(session.state.tc.inc / 1000)}`,
        result: resultTag(session.state.outcome as Outcome),
      },
    );
    downloadPgn(pgn);
  };
  const timeLevel: "calm" | "warn" | "critical" = myClock <= 20_000 ? "critical" : myClock <= 60_000 ? "warn" : "calm";
  // 读秒提示：自己剩余 10 秒内每整秒轻响一次
  const tickedRef = useRef<number | null>(null);
  useEffect(() => {
    if (session.state.status !== "live" || session.state.turn !== session.state.you) {
      tickedRef.current = null;
      return;
    }
    const second = Math.ceil(myClock / 1000);
    if (second > 10 || second <= 0) return;
    if (tickedRef.current === second) return;
    tickedRef.current = second;
    playSound("tick");
  }, [myClock, session.state.status, session.state.turn, session.state.you]);
  // 终局一声 + 心智战报
  // 排位赛在终局后仍会收到结算/评分等后续帧，每帧都会让本 effect 重跑。
  // 旧写法把 setTimeout 放在 effect 的 cleanup 里清掉，而重跑时 endedRef 已为 true、
  // 不再重新排期，于是 2 秒弹窗在真人局里被“顶掉”。现在改为：整局只排一次，
  // 计时器存在 ref 里，只有卸载或开新局才取消。
  const endedRef = useRef(false);
  const reportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reportInput, setReportInput] = useState<MatchReportInput | null>(null);
  useEffect(
    () => () => {
      if (reportTimerRef.current) clearTimeout(reportTimerRef.current);
    },
    [],
  );
  useEffect(() => {
    if (session.state.status === "live") {
      endedRef.current = false;
      if (reportTimerRef.current) clearTimeout(reportTimerRef.current);
      reportTimerRef.current = null;
      setReportInput(null);
      return;
    }
    if (session.state.status !== "over" || endedRef.current) return;
    const line = session.moves.map((m) => m.uci).filter(Boolean);
    if (line.length === 0) return;
    endedRef.current = true;
    playSound("end");
    const input: MatchReportInput = {
      uciLine: line,
      you: session.state.you,
      outcome: session.state.outcome ?? null,
      matchId: ranked ? session.state.matchId : null,
      ranked,
    };
    // 供复盘页打开“刚结束的这一局”（真人局有 matchId 时走服务端棋谱）
    try {
      sessionStorage.setItem("bs.lastGame", JSON.stringify(input));
    } catch {
      /* 隐私模式下忽略 */
    }
    reportTimerRef.current = setTimeout(() => setReportInput(input), 2000);
  }, [session.state.status, session.state.you, session.state.outcome, session.state.matchId, session.moves, ranked]);

  const rank = rankOf(profile.elo);
  const ceremony = usePromotionCeremony(
    { key: profile.tier, zh: profile.tierZh, en: profile.tier, rank: rank.id, floor: rank.floor },
    signedIn && ranked,
  );
  const ratingDelta = session.ratings?.ratingDelta ?? 0;
  return (
    <div className="themed-page home-glass-page min-h-screen text-on-surface pb-32 lg:pb-space-lg">
      <ThemeBackdrop theme="gothic" />
      <PromotionOverlay event={ceremony.event} onDismiss={ceremony.dismiss} />
      {reportInput && (
        <MatchReportOverlay
          input={reportInput}
          onClose={() => setReportInput(null)}
          onRematch={session.rematch}
        />
      )}
      <header className="home-glass-header desktop-page-header fixed top-0 inset-x-0 z-40 pt-safe">
        <div className="mobile-royal-header sm:hidden">
          <div className="mobile-royal-meta">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-label-sm text-label-sm text-secondary tabular-nums">{profile.elo} ELO</span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span className="cjk truncate font-label-sm text-label-sm text-on-surface-variant">{placementLabel(profile).zh}</span>
            </div>
            <div className="mobile-royal-tools">
              <SoundToggle className="mobile-royal-tool" />
              <LangToggle className="home-glass-control mobile-royal-lang" />
            </div>
          </div>
          <div className="mobile-royal-main">
            <div className="flex min-w-0 items-center gap-2.5">
              <Link to="/" aria-label={t("返回王座", "Back to the throne")} className="home-glass-control grid h-10 w-10 shrink-0 place-items-center text-secondary"><UiIcon name="play-motion" className="h-6 w-6 rotate-180" /></Link>
              <h1 className="min-w-0 font-headline-sm text-headline-sm leading-tight text-on-surface">
                <Bi zh="实时对弈" en="Live Duel" />
              </h1>
            </div>
            {ranked && (
              <span className="flex min-w-0 shrink-0 items-center gap-1.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${session.phase === "live" ? "bg-secondary animate-pulse" : "bg-primary"}`} />
                <span className={`truncate text-right font-label-sm text-label-sm text-on-surface-variant ${lang === "zh" ? "cjk" : ""}`}>{waiting ? t("等待玩家加入", "Waiting for player") : t(`服务端仲裁 · ${PHASE[session.phase]?.zh ?? session.phase}`, `Server-arbitrated · ${PHASE[session.phase]?.en ?? session.phase}`)}</span>
              </span>
            )}
          </div>
        </div>
        <div className="hidden h-20 px-margin-mobile items-center justify-between gap-3 sm:flex">
           <Link to="/" aria-label={t("返回王座", "Back to the throne")} className="home-glass-control w-11 h-11 flex items-center justify-center text-secondary"><UiIcon name="play-motion" className="h-7 w-7 rotate-180" /></Link>
          <div className="flex flex-1 flex-col min-w-0">
            {ranked && <span className={`truncate font-label-sm text-label-sm uppercase text-secondary tracking-widest ${lang === "zh" ? "cjk" : ""}`}>{waiting ? t("正在等待另一位玩家加入", "Waiting for another player") : t(`服务端仲裁 · ${PHASE[session.phase]?.zh ?? session.phase}`, `Server-arbitrated · ${PHASE[session.phase]?.en ?? session.phase}`)}</span>}
            <h1 className="min-w-0 font-headline-md text-headline-md leading-tight truncate">
              <Bi zh="实时对弈" en="Live Duel" />
            </h1>
          </div>
           <SoundToggle />
            <LangToggle className="home-glass-control" />
          <span className={`w-2.5 h-2.5 rounded-full ${session.phase === "live" ? "bg-secondary animate-pulse" : "bg-primary"}`} />
        </div>
      </header>

      <main className="page-main-compact battle-stage desktop-page-container px-margin-mobile lg:flex lg:items-start lg:justify-center lg:gap-space-lg">
        {tab === "drill" ? (
          <section className="battle-column w-full lg:max-w-[min(64vw,680px)] flex flex-col items-center gap-space-sm pt-space-sm">
            <div className="battle-core-width flex gap-1">
              <Button type="button" variant="ghost" onClick={() => setTab("duel")} className="home-glass-control h-11 flex-1 bg-surface-container text-on-surface-variant cjk">
                {t("对弈", "Duel")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setTab("drill")} className="home-glass-control h-11 flex-1 bg-secondary text-on-secondary cjk">
                {t("残局实战", "Endgame practice")}
              </Button>
            </div>
            <EndgameDrill initialCode={drill} />
          </section>
        ) : (
        <section className="battle-column w-full lg:max-w-[min(64vw,680px)] flex flex-col items-center gap-space-sm pt-space-sm lg:pt-0 lg:sticky lg:top-20">
          <div className="battle-core-width flex gap-1">
            <Button type="button" variant="ghost" onClick={() => setTab("duel")} className="home-glass-control h-11 flex-1 bg-secondary text-on-secondary cjk">
              {t("对弈", "Duel")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setTab("drill")} className="home-glass-control h-11 flex-1 bg-surface-container text-on-surface-variant cjk">
              {t("残局实战", "Endgame practice")}
            </Button>
          </div>
          <PlayerBar
            name={opponent.name}
            seed={opponent.name}
            avatarKey={session.ratings?.[oppSide]?.avatarKey ?? ""}
            avatarSrc={session.ratings?.[oppSide]?.avatarUrl ?? null}
            elo={oppElo}
            clock={fmtClock(session.clock[session.state.you === "w" ? "b" : "w"])}
            active={session.state.turn !== session.state.you}
            dark
          />

          <div className="battle-board-wrap relative w-full flex items-stretch justify-center">
            <div className="battle-eval hidden sm:flex w-3 overflow-hidden bg-surface-container-highest/80 border border-outline-variant/40 flex-col justify-end absolute inset-y-0 -left-5" title={t("实时评估", "Live evaluation")}>
              <div className="absolute left-0 right-0 top-1/2 h-px bg-outline-variant/60" />
              <div className="bg-secondary/70 transition-[height] duration-500" style={{ height: `${Math.max(8, Math.min(92, 50 + session.cp / 20))}%` }} />
            </div>
            <PlayableBoard
              fen={session.state.fen}
              lastMove={session.moves.at(-1)?.uci}
              lastMoveWasCapture={session.moves.at(-1)?.san.includes("x") ?? false}
              disabled={!myTurn}
              premove={ranked && session.state.status === "live"}
              myColor={session.state.you}
              onMove={session.playMove}
              whitePieceSetId={boardPieceSetId}
              blackPieceSetId={boardPieceSetId}
            />
          </div>

          <PlayerBar
            name={me.name}
            seed={me.name}
            avatarKey={session.ratings?.[session.state.you]?.avatarKey || profile.avatarKey}
            avatarPath={profile.avatarPath}
            avatarSrc={session.ratings?.[session.state.you]?.avatarUrl ?? null}
            elo={myElo}
            clock={fmtClock(session.clock[session.state.you])}
            active={myTurn}
          />
          <div className="battle-core-width home-glass-panel p-space-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface">{session.state.status === "over"
                ? t("本局已结束", "Game over")
                : waiting
                  ? t("等待对手加入", "Waiting for an opponent")
                  : session.movePending
                    ? t("正在确认落子", "Confirming your move")
                    : myTurn
                      ? t("轮到你落子", "Your move")
                      : t("等待对手落子", "Waiting for your opponent")}</p>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">{waiting
                ? t("保持页面开启，匹配成功后自动开局", "Keep this page open — the game starts as soon as you are paired")
                : t(
                    `点击棋子，再点击高亮目标格 · 评估 ${session.cp >= 0 ? "+" : ""}${(session.cp / 100).toFixed(2)}`,
                    `Tap a piece, then a highlighted square · Eval ${session.cp >= 0 ? "+" : ""}${(session.cp / 100).toFixed(2)}`,
                  )}</p>
            </div>
            <span className={`font-label-md text-label-md tabular-nums shrink-0 ${timeLevel === "critical" ? "text-primary animate-pulse" : timeLevel === "warn" ? "text-secondary" : "text-on-surface-variant"}`}>
              {session.state.tc.label} · {t("余", "left")} {fmtClock(myClock)}
            </span>
          </div>

          {timeLevel !== "calm" && session.state.status === "live" && (
            <p role="status" className={`battle-core-width home-glass-panel cjk px-space-sm py-2 font-body-sm text-body-sm ${timeLevel === "critical" ? "text-on-primary-container" : "text-on-surface-variant"}`}>
              {timeLevel === "critical"
                ? t(
                    `只剩 ${Math.ceil(myClock / 1000)} 秒，先落子保时间，每步加 2 秒。`,
                    `Only ${Math.ceil(myClock / 1000)}s left — move first to bank time; each move adds 2s.`,
                  )
                : t("剩余时间不足 1 分钟，注意读秒节奏。", "Under a minute left — watch your pace.")}
            </p>
          )}

          <div className="battle-core-width grid grid-cols-3 gap-2">
            <Button
              onClick={session.togglePause}
              disabled={!session.canPause || session.state.status !== "live"}
              variant="ghost"
               className="home-glass-control h-12 text-on-surface cjk font-label-sm text-label-sm disabled:opacity-40"
            >
              <UiIcon name={session.paused ? "play-motion" : "equalizer"} className="h-6 w-6" />
              {session.paused ? t("继续", "Resume") : t("暂停", "Pause")}
            </Button>
            <Button
              onClick={() => setConfirm("resign")}
              disabled={waiting || session.state.status !== "live"}
              variant="ghost"
               className="home-glass-control h-12 text-primary cjk font-label-sm text-label-sm disabled:opacity-40"
            >
              <UiIcon name="skull" className="h-6 w-6" />
              {t("结束本局", "End game")}
            </Button>
             <Button onClick={session.restart} variant="ghost" className="home-glass-control h-12 text-secondary cjk font-label-sm text-label-sm">
              <UiIcon name="spinner" className="h-6 w-6" />
              {t("重新开始", "Restart")}
            </Button>
          </div>
          <div className="battle-core-width grid grid-cols-3 gap-2">
            <Button
              onClick={() => (session.drawOffer === "mine" ? session.cancelDrawOffer() : setConfirm("draw"))}
              disabled={!session.canOfferDraw || session.state.status !== "live"}
              variant="ghost"
              className="home-glass-control h-12 text-on-surface cjk font-label-sm text-label-sm disabled:opacity-40"
            >
              <UiIcon name="laurel" className="h-6 w-6" />
              {session.drawOffer === "mine" ? t("撤回求和", "Withdraw draw") : t("提和", "Offer draw")}
            </Button>
            <Button
              onClick={session.takeback}
              disabled={!session.canTakeback}
              variant="ghost"
              className="home-glass-control h-12 text-on-surface cjk font-label-sm text-label-sm disabled:opacity-40"
              title={session.canTakeback ? t("陪练局可悔棋", "Takebacks allowed in practice") : t("天梯对局不可悔棋", "No takebacks in ranked play")}
            >
              <UiIcon name="spinner" className="h-6 w-6" />
              {t("悔棋", "Takeback")}
            </Button>
            <Button
              onClick={exportPgn}
              disabled={session.moves.length === 0}
              variant="ghost"
              className="home-glass-control h-12 text-secondary cjk font-label-sm text-label-sm disabled:opacity-40"
            >
              <UiIcon name="scroll" className="h-6 w-6" />
              {t("导出棋谱", "Export PGN")}
            </Button>
          </div>

          <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirm(null)}>
            <AlertDialogContent className="home-glass-panel fixed! w-[calc(100%-2rem)] max-w-md max-h-[85dvh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="cjk">{confirmAction === "resign" ? t("确认认输？", "Resign this game?") : t("向对手提和？", "Offer a draw?")}</AlertDialogTitle>
                <AlertDialogDescription className="cjk">
                  {confirmAction === "resign"
                    ? t("认输后本局立即结束，并按天梯规则结算扣分。", "Resigning ends the game at once and settles rating by ladder rules.")
                    : t("对手接受后本局按和棋结算；在对手回应前你可以随时撤回。", "If accepted the game is scored as a draw; you can withdraw the offer any time before they answer.")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cjk">{t("再想想", "Not yet")}</AlertDialogCancel>
                <AlertDialogAction
                  className="cjk"
                  onClick={() => {
                    if (confirmAction === "resign") session.resign();
                    else session.offerDraw();
                    setConfirm(null);
                  }}
                >
                  {confirmAction === "resign" ? t("确认认输", "Resign") : t("发出提和", "Send offer")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {session.drawOffer === "theirs" && (
            <div role="status" className="battle-core-width home-glass-panel px-space-sm py-3 flex items-center justify-between gap-3">
              <p className="cjk font-body-sm text-body-sm text-on-surface">{t("对手提出和棋，是否接受？", "Your opponent offers a draw — accept?")}</p>
              <div className="flex gap-2 shrink-0">
                <Button onClick={() => session.answerDraw(true)} className="home-glass-action h-11 bg-secondary text-on-secondary px-3 cjk">{t("接受", "Accept")}</Button>
                <Button onClick={() => session.answerDraw(false)} variant="ghost" className="home-glass-control h-11 px-3 cjk">{t("拒绝", "Decline")}</Button>
              </div>
            </div>
          )}

          {session.drawOffer === "mine" && (
            <p role="status" className="battle-core-width cjk font-body-sm text-body-sm text-on-surface-variant">{t("已提出和棋，等待对手回应。", "Draw offered — waiting for your opponent.")}</p>
          )}

          {signedIn && profile.inPlacement && (
            <p className="battle-core-width cjk font-body-sm text-body-sm text-on-surface-variant">
              {lang === "zh" ? placementLabel(profile).zh : placementLabel(profile).en}{" "}
              {t("· 定级赛期间涨跌分加倍，打满 10 局后公布段位。", "· Rating swings are doubled during placement; your tier is revealed after 10 games.")}
            </p>
          )}

          {!session.canPause && (
            <p className="battle-core-width cjk font-body-sm text-body-sm text-on-surface-variant">{t("真人天梯由服务端仲裁时钟，不能暂停；「重新开始」会退出当前真人局回到 AI 陪练。", "Ranked clocks are arbitrated by the server and cannot be paused; Restart leaves the live game and returns to AI practice.")}</p>
          )}
          {session.notice && (
             <div role="status" className="battle-core-width home-glass-panel px-space-sm py-3 flex items-center justify-between gap-3">
              <p className="cjk font-body-sm text-body-sm text-on-primary-container">{session.notice}</p>
              {session.phase === "offline" && <Button onClick={session.useLocalPractice} className="home-glass-action h-11 bg-secondary text-on-secondary px-3 shrink-0">{t("本地陪练", "Local practice")}</Button>}
            </div>
          )}

          {ranked && session.state.status === "over" && (
             <section role="status" aria-live="polite" className="battle-core-width home-glass-panel p-space-md text-center">
              <p className="cjk font-label-sm text-label-sm text-secondary">{t("天梯结算完成", "Ladder settled")}</p>
              <p className="cjk mt-1 font-headline-md text-headline-md text-on-surface">
                {session.state.outcome === "draw"
                  ? t("和棋", "Draw")
                  : session.state.outcome === (session.state.you === "w" ? "white" : "black")
                    ? t("胜利", "Victory")
                    : t("败北", "Defeat")}
              </p>
              <p className={`mt-1 font-label-lg text-label-lg tabular-nums ${ratingDelta >= 0 ? "text-secondary" : "text-primary"}`}>
                {ratingDelta >= 0 ? "+" : ""}{ratingDelta} ELO · {t("当前", "now")} {myElo}
              </p>
              <p className="cjk mt-1 font-body-sm text-body-sm text-on-surface-variant">{t("积分、段位徽章与战绩已同步到首页和天梯榜。", "Rating, tier badge and record are synced to the home page and the ladder.")}</p>
              <Link to="/dynasty" className="cjk mt-2 inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm">{t("查看段位变化", "See tier change")} →</Link>
              <Link to="/analysis" className="cjk ml-4 mt-2 inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm">{t("复盘本局", "Review this game")} →</Link>
              <div className="mt-3">
                <Button onClick={session.rematch} className="home-glass-action h-12 bg-secondary text-on-secondary px-5 cjk font-label-sm text-label-sm">
                  <UiIcon name="spinner" className="h-6 w-6" />
                  {t("再战一局", "Rematch")}
                </Button>
              </div>
            </section>
          )}

           <section aria-label={t("棋局教练", "Coach")} className="battle-core-width home-glass-panel p-space-sm flex items-start gap-space-sm">
            <UiIcon name={(coach.phase === "opening" ? "quill" : coach.phase === "endgame" ? "flame" : coach.icon === "target" ? "bolt" : "lotus") as UiIconName} className="h-8 w-8 mt-0.5" />
            <div className="min-w-0">
              <p className="cjk font-label-sm text-label-sm text-primary tracking-widest">{lang === "zh" ? coach.eyebrow : coach.eyebrowEn}</p>
              <h2 className="cjk font-label-lg text-label-lg text-on-surface mt-0.5">{lang === "zh" ? coach.title : coach.titleEn}</h2>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-1">{lang === "zh" ? coach.body : coach.bodyEn}</p>
              {coach.phase === "endgame" && <Link to="/crucible" className="cjk inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm mt-1">{t("去残局试炼（心算）强化此主题", "Train this theme in blindfold endgame trials")} →</Link>}
            </div>
          </section>

           <section aria-label={t("AI 陪练段位", "AI practice levels")} className="battle-core-width home-glass-panel p-space-sm">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h2 className="cjk flex items-baseline gap-2 font-label-md text-label-md text-on-surface">{t("AI 分级陪练", "AI practice")}<span className="font-label-md text-label-md text-on-surface-variant">{t("不计分", "Unrated")}</span></h2>
              <span className="cjk font-label-sm text-label-sm text-on-surface-variant">
                {ranked
                  ? t("当前为真人天梯，选择段位即切换陪练", "Ranked game in progress — picking a level switches to practice")
                  : t(
                      `默认模式 · ${aiLevel(session.aiLevelId).zh} ${aiLevel(session.aiLevelId).elo}`,
                      `Default · ${aiLevel(session.aiLevelId).name} ${aiLevel(session.aiLevelId).elo}`,
                    )}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AI_LEVELS.map((lv) => {
                const active = session.transport !== "cloud" && session.aiLevelId === lv.id;
                return (
                  <button
                    key={lv.id}
                    onClick={() => session.setAiLevel(lv.id)}
                     className={`home-glass-tile min-h-14 px-2 py-2 text-left transition-colors ${active ? "home-glass-tile-active text-on-primary-container" : "text-on-surface-variant hover:text-secondary"}`}
                  >
                    <span className="cjk block font-label-md text-label-md">{lang === "zh" ? lv.zh : lv.name}</span>
                    <span className="block font-label-sm text-label-sm tabular-nums">{lv.elo}</span>
                  </button>
                );
              })}
            </div>
            <p className="cjk mt-2 font-body-sm text-body-sm text-on-surface-variant">{lang === "zh" ? aiLevel(session.aiLevelId).desc : aiLevel(session.aiLevelId).descEn}</p>
            <p className="cjk mt-space-sm pt-space-sm border-t border-outline-variant/40 font-body-sm text-body-sm text-on-surface-variant">{t("准备好后在下方「找对手」选择赛制进入真人对局；四种赛制共用同一套 ELO 与段位。", "When you are ready, pick a time control under Find opponent to play a real person; all four controls share one rating and tier system.")}</p>
          </section>

          {ranked && session.state.status === "live" && session.opponentOnline === false && (
            <p className="cjk home-glass-card rounded-[12px] p-3 font-body-sm text-body-sm text-secondary">
              {t("对手已离线，计时继续走；超时后由服务端判定胜负。", "Opponent is offline. The clock keeps running and the server decides on timeout.")}
            </p>
          )}

          {ranked && session.state.status === "live" && myUserId && (
            <DuelVoice
              matchId={session.state.matchId}
              selfId={myUserId}
              initiator={session.state.you === "w"}
              opponentName={opponent.name}
            />
          )}

          <OpponentPanel onStartRanked={session.startRanked} ranked={ranked} waiting={waiting} />
        </section>
        )}
        {tab === "duel" && <DuelPanel session={session} />}
      </main>
    </div>
  );
}

function PlayerBarComponent({ name, elo, clock, active, dark = false, seed, avatarKey, avatarPath, avatarSrc }: { name: string; elo: number; clock: string; active: boolean; dark?: boolean; seed?: string; avatarKey?: string; avatarPath?: string; avatarSrc?: string | null }) {
  return (
    <div className={`battle-core-width home-glass-panel min-h-14 px-space-sm py-2 flex items-center justify-between gap-3 ${active ? "home-glass-tile-active" : ""}`}>
      <div className="flex items-center gap-3 min-w-0"><PlayerAvatar className="h-10 w-10" seed={seed} avatarKey={avatarKey} avatarPath={avatarPath} avatarSrc={avatarSrc} /><div className="min-w-0"><p className="font-label-md text-label-md truncate">{name}</p><p className="font-label-sm text-label-sm text-on-surface-variant">{elo} ELO</p></div></div>
      <span className={`font-headline-md text-headline-md tabular-nums ${active ? "text-secondary" : "text-on-surface-variant"}`}>{clock}</span>
    </div>
  );
}

const PlayerBar = memo(PlayerBarComponent);
