import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UiIcon } from "@/components/UiIcon";
import {
  createDuelInvite,
  getLobbyStats,
  joinDuelInvite,
  listDuelInvites,
  loadProfile,
  loadFriends,
  submitVerification,
  searchPlayers,
} from "@/lib/game.functions";
import { supabase } from "@/integrations/supabase/client";
import lobbyBanner from "@/assets/lobby-banner.jpg";

function mmss(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

type Tab = "auto" | "invite" | "lobby";

/**
 * 对弈页的「找对手」面板：系统匹配、点名邀请（好友 / 搜索 / 对战码）、
 * 以及别人发出的约战大厅，10 秒轮询刷新。
 */
export function OpponentPanel({ onStartRanked, ranked, waiting }: { onStartRanked: () => void; ranked: boolean; waiting: boolean }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("auto");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; handle: string; elo: number }[]>([]);
  const [code, setCode] = useState("");
  const [myCode, setMyCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [realName, setRealName] = useState("");
  const [realNameSaved, setRealNameSaved] = useState<string>("");
  const [idNumber, setIdNumber] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<string>("none");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  const profileQ = useQuery({
    queryKey: ["profile-realname", signedIn],
    queryFn: () => (signedIn ? loadProfile() : Promise.resolve(null)),
    enabled: signedIn === true,
  });
  useEffect(() => {
    const saved = profileQ.data?.real_name ?? "";
    if (saved) setRealNameSaved(saved);
    setVerifyStatus(profileQ.data?.verify_status ?? "none");
  }, [profileQ.data?.real_name, profileQ.data?.verify_status]);

  // 实名完成后从登录页跳转过来（/battle?lobby=1）：直接进大厅并自动按段位就近排队
  const [autoQueued, setAutoQueued] = useState(false);
  useEffect(() => {
    if (autoQueued || signedIn !== true) return;
    if (!new URLSearchParams(window.location.search).has("lobby")) return;
    if ((profileQ.data?.real_name ?? "").length < 2) return;
    setAutoQueued(true);
    setTab("auto");
    setNotice("实名已确认，正在为你匹配段位相近的对手…");
    if (!ranked) onStartRanked();
  }, [autoQueued, signedIn, profileQ.data?.real_name, ranked, onStartRanked]);

  const invitesQ = useQuery({
    queryKey: ["duel-invites", signedIn],
    queryFn: () => (signedIn ? listDuelInvites() : Promise.resolve(null)),
    refetchInterval: 10_000,
    enabled: signedIn === true,
  });
  const friendsQ = useQuery({
    queryKey: ["friends-battle", signedIn],
    queryFn: () => (signedIn ? loadFriends() : Promise.resolve([])),
    enabled: signedIn === true,
  });
  const statsQ = useQuery({
    queryKey: ["lobby-stats"],
    queryFn: () => getLobbyStats(),
    refetchInterval: 15_000,
  });

  // 排队计时：进入匹配等待后开始累计，匹配成功或退出即归零
  const [queueSec, setQueueSec] = useState(0);
  useEffect(() => {
    if (!(ranked && waiting)) { setQueueSec(0); return; }
    const t = setInterval(() => setQueueSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [ranked, waiting]);

  const incoming = invitesQ.data?.incoming ?? [];
  const open = invitesQ.data?.open ?? [];
  const mine = invitesQ.data?.mine ?? null;

  const verified = realNameSaved.length >= 2;
  const requireName = () => {
    setNotice("请先完成实名填写，再发起或接受约战。");
    setTab("invite");
  };

  const accept = (inviteCode: string) => {
    if (!verified) return requireName();
    setNotice(null);
    void joinDuelInvite({ data: { code: inviteCode } })
      .then(() => {
        setNotice("已加入对局，正在进入棋盘…");
        window.location.assign("/battle");
      })
      .catch(() => setNotice("对战码无效或已过期"));
  };

  const makeInvite = (invitedId?: string) => {
    if (!verified) return requireName();
    setNotice(null);
    void createDuelInvite({ data: invitedId ? { invitedId } : {} })
      .then((r) => {
        setMyCode(r?.code ?? "");
        setNotice(invitedId ? "已向该玩家发出约战，对方在对弈页会看到提醒。" : "已生成对战码，发给对手即可开局。");
        void invitesQ.refetch();
      })
      .catch(() => setNotice("创建邀请失败，请稍后再试"));
  };

  if (signedIn === false) {
    return (
      <section aria-label="找对手" className="battle-core-width bg-surface-container-low p-space-sm gold-hairline">
        <h2 className="cjk font-label-md text-label-md text-on-surface">找对手</h2>
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant mt-1">登录后即可系统匹配、点名邀请好友，或用对战码约战。当前为本地 AI 陪练。</p>
        <a href="/auth" className="cjk inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm mt-1">去登录 →</a>
      </section>
    );
  }

  return (
    <section aria-label="找对手" className="battle-core-width bg-surface-container-low p-space-sm gold-hairline">
      <div className="section-heading-row">
        <h2 className="cjk font-headline-sm text-headline-sm text-on-surface">找对手</h2>
        <span className="cjk font-label-sm text-label-sm text-on-surface-variant">
          {incoming.length ? `${incoming.length} 条约战邀请` : open.length ? `大厅 ${open.length} 人等待` : "3+2 快棋"}
        </span>
      </div>

      {incoming.length > 0 && (
        <ul className="mt-space-sm space-y-2">
          {incoming.map((i) => (
            <li key={i.code} className="min-h-14 px-3 py-2 bg-primary-container/30 flex items-center justify-between gap-3 gold-hairline">
              <span className="min-w-0">
                <strong className="cjk block truncate font-label-md text-label-md text-on-surface">{i.hostName} 向你约战</strong>
                <small className="block font-label-sm text-label-sm text-on-surface-variant">{i.hostElo} ELO · 对战码 {i.code}</small>
              </span>
              <Button onClick={() => accept(i.code)} className="h-11 rounded-none bg-secondary text-on-secondary px-4 shrink-0 cjk">应战</Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-space-sm grid grid-cols-3 gap-1" role="tablist">
        {([["auto", "系统匹配"], ["invite", "邀请对手"], ["lobby", "约战大厅"]] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`cjk min-h-11 px-2 font-label-sm text-label-sm transition-colors ${tab === id ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant hover:text-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-space-sm">
        {tab === "auto" && (
          <div className="space-y-space-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {ranked && waiting
                  ? "正在按积分就近排队，段位相近者优先，匹配成功自动开局，无需手动点名。"
                  : "系统按积分就近匹配真人 3+2，段位相近者优先，胜负结算段位与钻石。"}
              </p>
              <Button onClick={onStartRanked} disabled={ranked} className="h-12 rounded-none bg-primary-container text-on-primary-container px-space-md shrink-0">
                <UiIcon name="shield" className="h-7 w-7" />
                {ranked ? (waiting ? "排队中…" : "对局进行中") : "开始匹配"}
              </Button>
            </div>
            {ranked && waiting && (
              <div role="status" className="px-3 py-2 bg-surface-container gold-hairline flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />
                  <span className="cjk font-label-sm text-label-sm text-on-surface truncate">
                    {queueSec < 30 ? "正在寻找同段位对手…" : queueSec < 90 ? "同段位偏少，正在放宽积分区间…" : "正在全服范围内匹配，稍候即可开局"}
                  </span>
                </span>
                <span className="font-label-md text-label-md text-secondary tabular-nums shrink-0">{mmss(queueSec)}</span>
              </div>
            )}
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
              当前 {statsQ.data?.queueing ?? 0} 人排队 · {statsQ.data?.online ?? 0} 人在线 · {statsQ.data?.openInvites ?? 0} 条公开约战
            </p>
          </div>
        )}

        {tab === "invite" && (
          <div className="space-y-space-sm">
            <div className="p-3 bg-surface-container gold-hairline">
              <p className="cjk font-label-md text-label-md text-on-surface">
                实名认证{verified && <span className="text-secondary"> · 已认证</span>}
              </p>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                约战与天梯对局需先完成实名认证，证件号仅保留后四位。
              </p>
              {!verified && (
                <>
                  <div className="field-row mt-2">
                    <input
                      value={realName || realNameSaved}
                      onChange={(e) => setRealName(e.target.value)}
                      placeholder="真实姓名"
                      className="field-control cjk"
                    />
                  </div>
                  <div className="field-row mt-2">
                    <input
                      value={idNumber}
                      maxLength={18}
                      onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                      placeholder="身份证号（18 位）"
                      className="field-control"
                    />
                    <Button
                      type="button"
                      onClick={() => void submitVerification({ data: { realName: realName || realNameSaved, idNumber } })
                        .then((r) => {
                          setRealNameSaved(r.real_name ?? "");
                          setVerifyStatus(r.verify_status ?? "verified");
                          setTab("auto");
                          setNotice("实名认证通过，正在为你匹配段位相近的对手…");
                          if (!ranked) onStartRanked();
                        })
                        .catch(() => setNotice("认证失败，请核对姓名与 18 位身份证号"))}
                      className="field-action rounded-none bg-secondary text-on-secondary cjk font-label-md text-label-md"
                    >
                      认证
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="field-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索玩家名或账号"
                className="field-control cjk"
              />
              <Button
                type="button"
                onClick={() => void searchPlayers({ data: { query } }).then((r) => { setResults(r as typeof results); if (!r.length) setNotice("没有找到该玩家"); }).catch(() => setNotice("搜索失败"))}
                className="field-action rounded-none bg-secondary text-on-secondary cjk font-label-md text-label-md"
              >
                搜索
              </Button>
            </div>
            {results.map((p) => (
              <div key={p.id} className="min-h-12 px-3 bg-surface-container flex items-center justify-between gap-2">
                <span className="min-w-0"><strong className="block truncate">{p.name}</strong><small className="text-on-surface-variant">{p.elo} ELO</small></span>
                <button onClick={() => makeInvite(p.id)} className="cjk h-11 px-3 text-primary font-label-sm text-label-sm shrink-0">约战</button>
              </div>
            ))}
            {(friendsQ.data ?? []).filter((f) => f.friendshipStatus === "accepted").map((f) => (
              <div key={f.friendshipId} className="min-h-12 px-3 bg-surface-container flex items-center justify-between gap-2">
                <span className="min-w-0"><strong className="block truncate">好友 · {f.name}</strong><small className="text-on-surface-variant">{f.elo} ELO</small></span>
                <button onClick={() => makeInvite(f.id)} className="cjk h-11 px-3 text-primary font-label-sm text-label-sm shrink-0">约战</button>
              </div>
            ))}
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" onClick={() => makeInvite()} className="cjk h-12 rounded-none bg-primary-container text-on-primary-container font-label-md text-label-md">创建公开对战码</Button>
              <div className="field-row">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="输入对战码" className="field-control uppercase" />
                <Button type="button" onClick={() => accept(code)} className="field-action rounded-none bg-secondary text-on-secondary cjk font-label-md text-label-md">加入</Button>
              </div>
            </div>
            {(myCode || mine) && (
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                我的对战码：<span className="tracking-widest text-secondary">{myCode || mine?.code}</span> · 10 分钟内有效
              </p>
            )}
          </div>
        )}

        {tab === "lobby" && (
          <div className="space-y-space-sm">
            <div className="relative overflow-hidden gold-hairline">
              <img src={lobbyBanner} alt="约战大厅：白金王与黑曜绯红骑士对峙，两侧为段位徽章" loading="lazy" width={1536} height={640} className="w-full h-24 sm:h-32 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/90 via-surface-container-lowest/40 to-transparent" />
              <div className="absolute inset-0 p-3 flex flex-col justify-center">
                <span className="cjk font-label-md text-label-md text-primary">约战大厅</span>
                <span className="cjk font-label-md text-label-md text-on-surface">{statsQ.data?.online ?? 0} 人在线 · {statsQ.data?.queueing ?? 0} 人排队</span>
              </div>
            </div>

            <div className="p-3 bg-surface-container gold-hairline">
              <p className="cjk font-label-sm text-label-sm text-on-surface">段位分布</p>
              <ul className="mt-2 space-y-1.5">
                {(statsQ.data?.tiers ?? []).map((t) => {
                  const total = Math.max(1, (statsQ.data?.tiers ?? []).reduce((s, x) => s + x.count, 0));
                  return (
                    <li key={t.tier} className="flex items-center gap-2">
                      <span className="cjk font-label-sm text-label-sm text-on-surface-variant w-24 shrink-0 truncate">{t.tierZh}</span>
                      <span className="h-2 flex-1 bg-surface-container-highest overflow-hidden">
                        <span className="block h-full bg-secondary/70" style={{ width: `${(t.count / total) * 100}%` }} />
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant tabular-nums w-8 text-right">{t.count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="cjk font-label-sm text-label-sm text-on-surface">公开约战</p>
              {open.length === 0 && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">现在没有公开约战。可以创建一个对战码，或直接用系统匹配排队。</p>}
              {open.map((i) => (
                <div key={i.code} className="min-h-12 px-3 bg-surface-container flex items-center justify-between gap-2">
                  <span className="min-w-0"><strong className="block truncate">{i.hostName}</strong><small className="text-on-surface-variant">{i.hostElo} ELO · {i.code}</small></span>
                  <button onClick={() => accept(i.code)} className="cjk h-11 px-3 text-secondary font-label-sm text-label-sm shrink-0">应战</button>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <p className="cjk font-label-sm text-label-sm text-on-surface">最近战报</p>
              {(statsQ.data?.recent ?? []).length === 0 && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">还没有已结算的对局。</p>}
              {(statsQ.data?.recent ?? []).map((m) => (
                <p key={m.id} className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">
                  {m.white} vs {m.black} · {m.outcome === "1-0" ? "白胜" : m.outcome === "0-1" ? "黑胜" : "和棋"}
                  {m.ratingDelta !== null && <span className="text-secondary tabular-nums"> · ±{Math.abs(m.ratingDelta)} 分</span>}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {notice && <p role="status" className="cjk mt-space-sm font-body-sm text-body-sm text-on-primary-container">{notice}</p>}
    </section>
  );
}
