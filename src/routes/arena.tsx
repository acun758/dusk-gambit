import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { MiniBoard } from "@/components/MiniBoard";
import { Button } from "@/components/ui/button";
import { UiIcon } from "@/components/UiIcon";
import { closeArenaRoom, createArenaRoom, fetchArenaRooms, joinArenaRoom } from "@/data/db";
import type { ArenaRoom } from "@/data/arena.functions";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/arena")({
  staticData: { sitemap: true },
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

  const [tab, setTab] = useState<"waiting" | "playing" | "mine">("waiting");
  const [showCreate, setShowCreate] = useState(false);
  const [color, setColor] = useState<"w" | "b" | "random">("random");
  const [isPublic, setIsPublic] = useState(true);
  const [initialMin, setInitialMin] = useState(10);
  const [incSec, setIncSec] = useState(3);
  const [gateId, setGateId] = useState("any");
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const roomsQ = useQuery({
    queryKey: ["arena-rooms"],
    queryFn: () => fetchArenaRooms(),
    enabled: signedIn,
    refetchInterval: 3000,
  });
  const rooms = useMemo<ArenaRoom[]>(() => (roomsQ.data as ArenaRoom[] | undefined) ?? [], [roomsQ.data]);

  const shown = useMemo(() => {
    if (tab === "mine") return rooms.filter((r) => r.mine);
    if (tab === "playing") return rooms.filter((r) => r.status === "playing");
    return rooms.filter((r) => r.status === "waiting" && r.visibility === "public");
  }, [rooms, tab]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["arena-rooms"] });
  }, [queryClient]);

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
      .catch((err: Error) => setNote(err.message))
      .finally(() => setBusy(false));
  }, [color, gateId, incSec, initialMin, isPublic, refresh, t]);

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
        .catch((err: Error) => setNote(err.message))
        .finally(() => setBusy(false));
    },
    [navigate, refresh, t],
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

  return (
    <div className="relative min-h-dvh">
      <ThemeBackdrop theme="blackGold" />
      <SovereignPageHeader icon="nav-duel" titleZh="联网大厅" titleEn="Arena" backTo="/" />

      <main className="page-main-compact desktop-page-container px-margin-mobile grid gap-space-sm">
        {!signedIn ? (
          <div className="home-glass-panel p-space-md grid gap-2">
            <p className="cjk font-body-md text-body-md text-on-surface-variant">
              {t("登录后才能开设或加入公开对局场。", "Sign in to open or join public rooms.")}
            </p>
            <Link
              to="/auth"
              className="home-glass-control cjk flex h-11 w-fit items-center bg-primary-container px-4 font-label-md text-label-md text-on-primary-container"
            >
              {t("去登录", "Sign in")}
            </Link>
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
                  onClick={() => setShowCreate((v) => !v)}
                  className="home-glass-action cjk h-11 px-4 font-label-md text-label-md"
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
                              onClick={() => void navigator.clipboard?.writeText(room.shortCode)}
                              className="home-glass-control cjk h-10 bg-surface-container px-3 font-label-sm text-label-sm text-on-surface-variant"
                            >
                              {t("复制口令", "Copy code")}
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
