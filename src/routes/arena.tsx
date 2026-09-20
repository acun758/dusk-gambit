import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { MiniBoard } from "@/components/MiniBoard";
import { Button } from "@/components/ui/button";
import { UiIcon } from "@/components/UiIcon";
import { closeArenaRoom, createArenaRoom, currentUserId, fetchArenaRooms, fetchLadder, joinArenaRoom } from "@/data/db";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { subscribeArenaPresence, subscribeLadder, type ArenaPresencePlayer } from "@/data/realtime";
import type { ArenaRoom } from "@/data/arena.functions";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/arena")({
  staticData: { sitemap: true },
  validateSearch: (search: Record<string, unknown>): { code?: string } => {
    const raw = typeof search["code"] === "string" ? search["code"] : "";
    const code = raw.trim().toUpperCase().slice(0, 8);
    return code ? { code } : {};
  },
  head: () => ({
    meta: [
      { title: "联网大厅 · 公开对局场 | 玄弈棋竞" },
      {
        name: "description",
        content: "公开大厅：创建或加入陌生人对局场，自选执子、局时与加秒，积分门槛与开局判定全部由服务端裁决。",
      },
      { property: "og:title", content: "联网大厅 · 公开对局场 | 玄弈棋竞" },
      { property: "og:description", content: "创建对局场、公开待加入、先到先得开局，服务端权威裁决。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Arena,
});

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const INITIAL_OPTIONS = [5, 10, 15, 20, 30];
const INCREMENT_OPTIONS = [0, 3, 5, 10];

const GATES: { id: string; zh: string; en: string; min: number; max: number }[] = [
  { id: "any", zh: "不限", en: "Open", min: 0, max: 100000 },
  { id: "pawn", zh: "限兵段（≤1400）", en: "Pawn tier (≤1400)", min: 0, max: 1400 },
  { id: "knight", zh: "限马段（≤1600）", en: "Knight tier (≤1600)", min: 0, max: 1600 },
  { id: "high", zh: "1700 分以上", en: "1700+", min: 1700, max: 100000 },
];

function relTime(iso: string, t: (zh: string, en: string) => string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return t(`${s} 秒前`, `${s}s ago`);
  const m = Math.round(s / 60);
  if (m < 60) return t(`${m} 分钟前`, `${m}m ago`);
  return t(`${Math.round(m / 60)} 小时前`, `${Math.round(m / 60)}h ago`);
}

function gateLabel(room: ArenaRoom, t: (zh: string, en: string) => string): string {
  if (room.ratingMin <= 0 && room.ratingMax >= 100000) return t("不限段位", "Open to all");
  if (room.ratingMin <= 0) return t(`≤ ${room.ratingMax} 分`, `≤ ${room.ratingMax}`);
  if (room.ratingMax >= 100000) return t(`${room.ratingMin} 分以上`, `${room.ratingMin}+`);
  return t(`${room.ratingMin}–${room.ratingMax} 分`, `${room.ratingMin}–${room.ratingMax}`);
}

function Arena() {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, signedIn } = useProfile();

  const { code: linkCode } = Route.useSearch();
  const [tab, setTab] = useState<"waiting" | "playing" | "mine">("waiting");
  const [showCreate, setShowCreate] = useState(false);
  const [color, setColor] = useState<"w" | "b" | "random">("random");
  const [isPublic, setIsPublic] = useState(true);
  const [initialMin, setInitialMin] = useState(10);
  const [incSec, setIncSec] = useState(3);
  const [gateId, setGateId] = useState("any");
  const [code, setCode] = useState(linkCode ?? "");
  const [declined, setDeclined] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const roomsQ = useQuery({
    queryKey: ["arena-rooms"],
    queryFn: () => fetchArenaRooms(),
    enabled: signedIn,
    refetchInterval: 3000,
  });
  const rooms = useMemo<ArenaRoom[]>(() => (roomsQ.data as ArenaRoom[] | undefined) ?? [], [roomsQ.data]);

  // 在场名册：每个浏览会话报到一次，只带公开字段（昵称、积分、是否在对局）
  const [present, setPresent] = useState<ArenaPresencePlayer[]>([]);
  const meQ = useQuery({ queryKey: ["arena-me"], queryFn: () => currentUserId(), enabled: signedIn, staleTime: 300_000 });
  const myId = meQ.data ?? null;
  const inDuel = useMemo(() => rooms.some((r) => r.mine && r.status === "playing"), [rooms]);
  const seatId = useMemo(() => {
    if (typeof window === "undefined") return "guest";
    const key = "bs.arena.seat";
    let id = window.sessionStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      window.sessionStorage.setItem(key, id);
    }
    return id;
  }, []);

  useEffect(() => {
    if (!signedIn || !myId) return;
    return subscribeArenaPresence(
      {
        id: myId,
        uid: myId,
        avatarKey: profile.avatarKey,
        name: profile.name,
        elo: profile.elo,
        state: inDuel ? "playing" : "idle",
      },
      setPresent,
    );
  }, [inDuel, myId, profile.avatarKey, profile.elo, profile.name, seatId, signedIn]);

  // 同一账号多标签只显示一次
  const roster = useMemo(() => {
    const seen = new Set<string>();
    return present.filter((p) => {
      const key = p.uid ?? p.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [present]);
  const playingCount = useMemo(() => roster.filter((p) => p.state === "playing").length, [roster]);

  const ladderQ = useQuery({
    queryKey: ["arena-ladder"],
    queryFn: () => fetchLadder(),
    enabled: signedIn,
    staleTime: 5_000,
    refetchInterval: 30_000,
  });
  // 积分来自每位玩家的真实对局结算，任一局结束都会立刻刷新榜单与在场名册积分
  useEffect(() => {
    if (!signedIn) return;
    return subscribeLadder(() => {
      void queryClient.invalidateQueries({ queryKey: ["arena-ladder"] });
      void queryClient.invalidateQueries({ queryKey: ["arena-rooms"] });
    });
  }, [queryClient, signedIn]);

  const topTen = useMemo(
    () => [...(ladderQ.data ?? [])].sort((a, b) => b.elo - a.elo).slice(0, 10),
    [ladderQ.data],
  );

  // 房主在大厅等待时，有人入场即自动进入棋盘
  const enteredRef = useRef<string | null>(null);
  useEffect(() => {
    const live = rooms.find((r) => r.mine && r.status === "playing" && r.matchId);
    if (!live || enteredRef.current === live.id) return;
    enteredRef.current = live.id;
    void navigate({ to: "/battle" });
  }, [navigate, rooms]);

  const incoming = useMemo(
    () => rooms.filter((r) => r.targetId && r.targetId === myId && r.status === "waiting" && !declined.includes(r.id)),
    [declined, myId, rooms],
  );
  const outgoing = useMemo(() => rooms.filter((r) => r.targetId && r.mine && r.status === "waiting"), [rooms]);

  const shown = useMemo(() => {
    if (tab === "mine") return rooms.filter((r) => r.mine);
    if (tab === "playing") return rooms.filter((r) => r.status === "playing");
    return rooms.filter((r) => r.status === "waiting" && r.visibility === "public");
  }, [rooms, tab]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["arena-rooms"] });
  }, [queryClient]);

  const failNote = useCallback((err: Error) => setNote(err.message), []);



  const onCreate = useCallback(() => {
    const gate = GATES.find((g) => g.id === gateId) ?? GATES[0]!;
    setBusy(true);
    setNote("");
    void createArenaRoom({
      data: {
        visibility: isPublic ? "public" : "private",
        color,
        initialMs: initialMin * 60_000,
        incrementMs: incSec * 1000,
        ratingMin: gate.min,
        ratingMax: gate.max,
      },
    })
      .then((room) => {
        setShowCreate(false);
        setTab("mine");
        refresh();
        if (room) {
          setNote(
            t(
              `对局场已开启 · 口令 ${room.short_code} · 你执${room.host_color === "w" ? "白" : "黑"}`,
              `Room open · code ${room.short_code} · you play ${room.host_color === "w" ? "White" : "Black"}`,
            ),
          );
        }
      })
      .catch(failNote)
      .finally(() => setBusy(false));
  }, [color, failNote, gateId, incSec, initialMin, isPublic, refresh, t]);

  const handleJoin = useCallback(
    (args: { roomId?: string; code?: string }) => {
      setBusy(true);
      setNote("");
      void joinArenaRoom({ data: args })
        .then((res) => {
          if (res.code === "ok") {
            refresh();
            void navigate({ to: "/battle" });
            return;
          }
          const msgs: Record<string, [string, string]> = {
            full: ["这间对局场已满。", "This room is already full."],
            self: ["这是你自己开的对局场。", "This is your own room."],
            expired: ["这间对局场已过期解散。", "This room has expired."],
            not_found: ["没有找到这间对局场。", "Room not found."],
            rating_blocked: [
              `积分不符合准入门槛（${res.min}–${res.max}）。`,
              `Your rating is outside the room's range (${res.min}–${res.max}).`,
            ],
          };
          const m = msgs[res.code] ?? ["无法加入这间对局场。", "Unable to join this room."];
          setNote(t(m[0], m[1]));
        })
        .catch(failNote)
        .finally(() => setBusy(false));
    },
    [navigate, refresh, t],
  );

  const inviteLink = useCallback(
    (roomCode: string) =>
      typeof window === "undefined" ? roomCode : `${window.location.origin}/arena?code=${roomCode}`,
    [],
  );

  const copyInvite = useCallback(
    (roomCode: string) => {
      void navigator.clipboard?.writeText(inviteLink(roomCode));
      setNote(t(`邀请链接已复制：${inviteLink(roomCode)}`, `Invite link copied: ${inviteLink(roomCode)}`));
    },
    [inviteLink, t],
  );

  /** 邀请好友：开一间凭链接进入的私密房，并把链接复制到剪贴板 */
  const onInviteFriend = useCallback(() => {
    setBusy(true);
    setNote("");
    void createArenaRoom({
      data: { visibility: "private", color: "random", initialMs: initialMin * 60_000, incrementMs: incSec * 1000 },
    })
      .then((room) => {
        setTab("mine");
        refresh();
        if (room) copyInvite(room.short_code);
      })
      .catch(failNote)
      .finally(() => setBusy(false));
  }, [copyInvite, failNote, incSec, initialMin, refresh]);

  /** 定向约战：给名册里的某位玩家开一间只有他能进的房 */
  const onChallenge = useCallback(
    (target: ArenaPresencePlayer) => {
      if (!target.uid) return;
      setBusy(true);
      setNote("");
      void createArenaRoom({
        data: {
          visibility: "private",
          color: "random",
          initialMs: initialMin * 60_000,
          incrementMs: incSec * 1000,
          targetId: target.uid,
        },
      })
        .then(() => {
          setTab("mine");
          refresh();
          setNote(t(`已向 ${target.name} 发出约战，2 分钟内有效。`, `Challenge sent to ${target.name}; valid for 2 minutes.`));
        })
        .catch(failNote)
        .finally(() => setBusy(false));
    },
    [failNote, incSec, initialMin, refresh, t],
  );

  const onClose = useCallback(
    (roomId: string) => {
      setBusy(true);
      void closeArenaRoom({ data: { roomId } })
        .then(() => refresh())
        .finally(() => setBusy(false));
    },
    [refresh],
  );

  // 朋友发来的链接：登录后自动入场一次
  const linkTriedRef = useRef(false);
  useEffect(() => {
    if (!signedIn || !linkCode || linkTriedRef.current) return;
    linkTriedRef.current = true;
    handleJoin({ code: linkCode });
  }, [handleJoin, linkCode, signedIn]);

  return (
    <div className="relative min-h-dvh">
      <ThemeBackdrop theme="blackGold" />
      <SovereignPageHeader icon="nav-duel" titleZh="联网大厅" titleEn="Arena" backTo="/" />

      <main className="page-main-compact desktop-page-container px-margin-mobile grid gap-space-sm">
        {!signedIn ? (
          <div className="home-glass-panel p-space-md grid gap-2">
            <p className="cjk font-body-md text-body-md text-on-surface-variant">
              {t("登录后才能开设或加入公开对局场。新玩家可直接在此注册账号。", "Sign in to open or join public rooms. New here? Create an account first.")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/auth"
                search={{ mode: "up" }}
                className="home-glass-control cjk flex h-11 w-fit items-center bg-primary-container px-4 font-label-md text-label-md text-on-primary-container"
              >
                {t("注册账号", "Create account")}
              </Link>
              <Link
                to="/auth"
                search={{ mode: "in" }}
                className="home-glass-control cjk flex h-11 w-fit items-center px-4 font-label-md text-label-md text-secondary"
              >
                {t("已有账号，去登录", "I have an account")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-1">
              {([
                ["waiting", "待加入", "Open"],
                ["playing", "进行中", "Live"],
                ["mine", "我的", "Mine"],
              ] as const).map(([id, zh, en]) => (
                <Button
                  key={id}
                  type="button"
                  variant="ghost"
                  onClick={() => setTab(id)}
                  className={`home-glass-control h-11 flex-1 cjk ${
                    tab === id ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {t(zh, en)}
                </Button>
              ))}
            </div>


            <div className="home-glass-panel grid gap-space-sm p-space-md">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  disabled={false}
                  onClick={() => setShowCreate((v) => !v)}
                  className="home-glass-action cjk h-11 px-4 font-label-md text-label-md disabled:opacity-50"
                >
                  <UiIcon name="flame" className="mr-1.5 h-5 w-5" />
                  {t("开设对局场", "Open a room")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={refresh}
                  className="home-glass-control cjk h-11 bg-surface-container px-4 font-label-md text-label-md text-on-surface-variant"
                >
                  {t("刷新", "Refresh")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}

                  onClick={onInviteFriend}
                  className="home-glass-control cjk h-11 bg-surface-container px-4 font-label-md text-label-md text-on-surface-variant disabled:opacity-50"
                >
                  <UiIcon name="forum" className="mr-1.5 h-5 w-5" />
                  {t("邀请好友", "Invite a friend")}
                </Button>
                <span className="cjk font-label-sm text-label-sm text-on-surface-variant">
                  {t(`我的积分 ${profile.elo}`, `Your rating ${profile.elo}`)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
                  placeholder={t("输入房间口令", "Room code")}
                  aria-label={t("房间口令", "Room code")}
                  className="home-glass-control h-11 w-40 bg-surface-container px-3 font-label-md text-label-md text-on-surface"
                />
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy || code.length < 4}
                  onClick={() => handleJoin({ code })}
                  className="home-glass-control cjk h-11 bg-surface-container px-4 font-label-md text-label-md text-on-surface-variant"
                >
                  {t("凭口令入场", "Join by code")}
                </Button>
              </div>

              {note ? <p className="cjk font-body-sm text-body-sm text-secondary">{note}</p> : null}
            </div>

            <div className="home-glass-panel grid grid-cols-3 gap-space-xs p-space-md">
              {([
                [t("在场玩家", "In the hall"), roster.length],
                [t("对局中", "In duel"), playingCount],
                [t("待加入对局场", "Open rooms"), rooms.filter((r) => r.status === "waiting" && r.visibility === "public").length],
              ] as const).map(([label, value]) => (
                <div key={label} className="grid gap-0.5">
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{label}</span>
                  <span className="font-headline-sm text-headline-sm text-secondary tabular-nums">{value}</span>
                </div>
              ))}
            </div>

            {incoming.length > 0 ? (
              <div className="home-glass-panel grid gap-2 p-space-md">
                <h2 className="cjk font-label-md text-label-md text-on-surface">{t("收到的约战", "Challenges for you")}</h2>
                {incoming.map((room) => (
                  <div key={room.id} className="flex flex-wrap items-center gap-2">
                    <PlayerAvatar className="h-9 w-9" avatarKey={room.hostAvatarKey} seed={room.hostId} />
                    <span className="cjk font-label-md text-label-md text-on-surface">
                      {t(
                        `${room.hostName}（${room.hostElo}）邀你对弈 · ${Math.round(room.initialMs / 60000)} 分 +${Math.round(room.incrementMs / 1000)} 秒`,
                        `${room.hostName} (${room.hostElo}) invites you · ${Math.round(room.initialMs / 60000)} min +${Math.round(room.incrementMs / 1000)}s`,
                      )}
                    </span>
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => handleJoin({ roomId: room.id })}
                      className="home-glass-action cjk h-10 px-4 font-label-md text-label-md"
                    >
                      {t("接受约战", "Accept")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setDeclined((v) => [...v, room.id])}
                      className="home-glass-control cjk h-10 bg-surface-container px-3 font-label-sm text-label-sm text-on-surface-variant"
                    >
                      {t("谢绝", "Decline")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            {outgoing.length > 0 ? (
              <div className="home-glass-panel flex flex-wrap items-center gap-2 p-space-md">
                <span className="cjk font-label-md text-label-md text-on-surface-variant">
                  {t("已发出的约战，等待对方接受…", "Challenge sent — waiting for them to accept…")}
                </span>
                {outgoing.map((room) => (
                  <Button
                    key={room.id}
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => onClose(room.id)}
                    className="home-glass-control cjk h-10 bg-surface-container px-3 font-label-sm text-label-sm text-on-surface-variant"
                  >
                    {t("撤回", "Withdraw")}
                  </Button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-space-sm sm:grid-cols-2">
              <section className="home-glass-panel grid gap-2 p-space-md">
                <h2 className="cjk font-label-md text-label-md text-on-surface">
                  {t(`在场玩家 · ${roster.length} 人`, `In the hall · ${roster.length}`)}
                </h2>
                {roster.length === 0 ? (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                    {t("正在接入在场名册…", "Connecting to the hall roster…")}
                  </p>
                ) : (
                  <ul className="grid gap-1">
                    {roster.slice(0, 12).map((p) => {
                      const isMe = p.id === seatId || (Boolean(p.uid) && p.uid === myId);
                      return (
                        <li key={p.id} className="flex items-center gap-2">
                          <PlayerAvatar className="h-9 w-9" avatarKey={p.avatarKey ?? null} seed={p.uid ?? p.id} />
                          <span className="min-w-0 flex-1 truncate font-label-sm text-label-sm text-on-surface">
                            {p.name}
                            {isMe ? <span className="cjk text-on-surface-variant"> · {t("我", "You")}</span> : null}
                          </span>
                          <span
                            className={`cjk shrink-0 font-label-sm text-label-sm tabular-nums ${
                              p.state === "playing" ? "text-primary" : "text-on-surface-variant"
                            }`}
                          >
                            {p.elo} · {p.state === "playing" ? t("对局中", "In duel") : t("大厅中", "In hall")}
                          </span>
                          {!isMe && p.uid && p.state === "idle" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => onChallenge(p)}

                              className="home-glass-control cjk h-9 shrink-0 bg-surface-container px-3 font-label-sm text-label-sm text-on-surface-variant disabled:opacity-50"
                            >
                              {t("约战", "Challenge")}
                            </Button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="home-glass-panel grid gap-2 p-space-md">
                <h2 className="cjk font-label-md text-label-md text-on-surface">{t("积分前十", "Top ten by rating")}</h2>
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                  {t("积分随每局胜负实时结算（胜/和/负）。", "Ratings settle after every game (win/draw/loss).")}
                </p>
                {topTen.length === 0 ? (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                    {t("榜单载入中…", "Loading the ladder…")}
                  </p>
                ) : (
                  <ol className="grid gap-1">
                    {topTen.map((row, i) => (
                      <li key={row.id} className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2 truncate font-label-sm text-label-sm text-on-surface">
                          <span className="text-secondary tabular-nums">{i + 1}.</span>
                          <PlayerAvatar className="h-7 w-7" avatarKey={row.avatarKey} avatarSrc={row.avatarUrl} seed={row.id} />
                          <span className="truncate">{row.name}</span>
                        </span>
                        <span className="flex shrink-0 items-baseline gap-2 text-right font-label-sm text-label-sm text-on-surface-variant">
                          <span className="tabular-nums">
                            {row.elo}
                            <span className="ml-0.5 text-body-sm">{t("分", "pts")}</span>
                          </span>
                          <span className="text-body-sm text-secondary tabular-nums">
                            {t(`${row.wins} 胜 ${row.draws} 和 ${row.losses} 负`, `${row.wins}W ${row.draws}D ${row.losses}L`)}
                          </span>
                        </span>
                      </li>

                    ))}
                  </ol>
                )}
              </section>
            </div>

            {showCreate ? (
              <div className="home-glass-panel grid gap-space-sm p-space-md">
                <div className="grid gap-1">
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("执子", "Your side")}</span>
                  <div className="flex gap-1">
                    {([
                      ["w", "执白", "White"],
                      ["b", "执黑", "Black"],
                      ["random", "猜先", "Random"],
                    ] as const).map(([id, zh, en]) => (
                      <Button
                        key={id}
                        type="button"
                        variant="ghost"
                        onClick={() => setColor(id)}
                        className={`home-glass-control h-10 flex-1 cjk ${
                          color === id ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {t(zh, en)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1">
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("局时（分钟）", "Base time (min)")}</span>
                  <div className="grid grid-cols-5 gap-1">
                    {INITIAL_OPTIONS.map((m) => (
                      <Button
                        key={m}
                        type="button"
                        variant="ghost"
                        onClick={() => setInitialMin(m)}
                        className={`home-glass-control h-10 ${
                          initialMin === m ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1">
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("每步加秒", "Increment (s)")}</span>
                  <div className="grid grid-cols-4 gap-1">
                    {INCREMENT_OPTIONS.map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant="ghost"
                        onClick={() => setIncSec(s)}
                        className={`home-glass-control h-10 ${
                          incSec === s ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1">
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("准入门槛", "Rating gate")}</span>
                  <div className="grid grid-cols-2 gap-1">
                    {GATES.map((g) => (
                      <Button
                        key={g.id}
                        type="button"
                        variant="ghost"
                        onClick={() => setGateId(g.id)}
                        className={`home-glass-control h-10 cjk ${
                          gateId === g.id ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {t(g.zh, g.en)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsPublic((v) => !v)}
                    className={`home-glass-control h-10 cjk px-4 ${
                      isPublic ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {isPublic ? t("公开房", "Public") : t("私密房 · 凭口令进入", "Private · code only")}
                  </Button>
                  <Button type="button" disabled={busy} onClick={onCreate} className="home-glass-action cjk h-11 px-5 font-label-md text-label-md">
                    {t("确认开设", "Create room")}
                  </Button>
                </div>
              </div>
            ) : null}

            {shown.length === 0 ? (
              <div className="home-glass-panel grid gap-2 p-space-md">
                <p className="cjk font-body-md text-body-md text-on-surface-variant">
                  {tab === "playing"
                    ? t("此刻没有正在进行的对局。", "No duels are under way right now.")
                    : tab === "mine"
                      ? t("你还没有开设或参与任何对局场。", "You have no rooms yet.")
                      : t("烛火未燃，尚无人开场。", "The hall is dark; no one has opened a room yet.")}
                </p>
                {tab !== "playing" ? (
                  <Button type="button" onClick={() => setShowCreate(true)} className="home-glass-action cjk h-11 w-fit px-5 font-label-md text-label-md">
                    {t("点亮第一间对局场", "Open the first room")}
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-space-sm sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((room) => {
                  const canJoin = room.status === "waiting" && !room.mine;
                  return (
                    <article key={room.id} className="home-glass-panel grid gap-space-xs p-space-md">
                      <div className="flex gap-space-sm">
                        <div className="w-24 shrink-0">
                          <MiniBoard fen={room.fen ?? START_FEN} flipped={room.hostColor === "b" && room.mine} />
                        </div>
                        <div className="grid min-w-0 flex-1 gap-1">
                          <div className="flex items-center gap-1">
                            <PlayerAvatar className="h-7 w-7" avatarKey={room.hostAvatarKey} seed={room.hostId} />
                            {room.guestId ? (
                              <PlayerAvatar className="h-7 w-7" avatarKey={room.guestAvatarKey} seed={room.guestId} />
                            ) : null}
                          </div>
                          <p className="cjk truncate font-label-md text-label-md text-on-surface">
                            {t("白：", "White: ")}
                            {room.hostColor === "w"
                              ? `${room.hostName} (${room.hostElo})`
                              : room.guestName
                                ? `${room.guestName} (${room.guestElo})`
                                : t("待加入", "Open seat")}
                          </p>
                          <p className="cjk truncate font-label-md text-label-md text-on-surface">
                            {t("黑：", "Black: ")}
                            {room.hostColor === "b"
                              ? `${room.hostName} (${room.hostElo})`
                              : room.guestName
                                ? `${room.guestName} (${room.guestElo})`
                                : t("待加入", "Open seat")}
                          </p>
                          <p className="cjk font-label-sm text-label-sm text-on-surface-variant">
                            {t(
                              `局时 ${Math.round(room.initialMs / 60000)} 分 · 每步加 ${Math.round(room.incrementMs / 1000)} 秒`,
                              `${Math.round(room.initialMs / 60000)} min · +${Math.round(room.incrementMs / 1000)}s`,
                            )}
                          </p>
                          <p className="cjk font-label-sm text-label-sm text-on-surface-variant">
                            {gateLabel(room, t)} · {room.status === "playing" ? t("进行中", "Live") : t("待加入", "Open")} ·{" "}
                            {relTime(room.createdAt, t)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {canJoin ? (
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => handleJoin({ roomId: room.id })}
                            className="home-glass-action cjk h-10 px-4 font-label-md text-label-md"
                          >
                            {t("入场对弈", "Take the seat")}
                          </Button>
                        ) : null}
                        {room.mine && room.status === "playing" ? (
                          <Link
                            to="/battle"
                            className="home-glass-action cjk flex h-10 items-center px-4 font-label-md text-label-md text-on-primary-container"
                          >
                            {t("回到对局", "Back to the board")}
                          </Link>
                        ) : null}
                        {room.mine && room.status === "waiting" ? (
                          <>
                            <span className="cjk font-label-sm text-label-sm text-secondary">
                              {t(`口令 ${room.shortCode}`, `Code ${room.shortCode}`)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => copyInvite(room.shortCode)}
                              className="home-glass-control cjk h-10 bg-surface-container px-3 font-label-sm text-label-sm text-on-surface-variant"
                            >
                              {t("复制邀请链接", "Copy invite link")}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => onClose(room.id)}
                              className="home-glass-control cjk h-10 bg-surface-container px-3 font-label-sm text-label-sm text-on-surface-variant"
                            >
                              {t("撤场", "Cancel")}
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
