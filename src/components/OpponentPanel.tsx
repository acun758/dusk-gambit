import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  createDuelInvite,
  joinDuelInvite,
  listDuelInvites,
  loadFriends,
  searchPlayers,
} from "@/lib/game.functions";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

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

  const incoming = invitesQ.data?.incoming ?? [];
  const open = invitesQ.data?.open ?? [];
  const mine = invitesQ.data?.mine ?? null;

  const accept = (inviteCode: string) => {
    setNotice(null);
    void joinDuelInvite({ data: { code: inviteCode } })
      .then(() => {
        setNotice("已加入对局，正在进入棋盘…");
        window.location.assign("/battle");
      })
      .catch(() => setNotice("对战码无效或已过期"));
  };

  const makeInvite = (invitedId?: string) => {
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
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="cjk font-label-md text-label-md text-on-surface">找对手</h2>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
              {ranked && waiting ? "正在排队，匹配到同段位对手后自动开局，保持页面开启。" : "系统按 ELO 就近匹配真人 3+2，胜负结算段位与钻石。"}
            </p>
            <Button onClick={onStartRanked} disabled={ranked} className="h-12 rounded-none bg-primary-container text-on-primary-container px-space-md shrink-0">
              <span className="material-symbols-outlined text-secondary">swords</span>
              {ranked ? (waiting ? "排队中…" : "对局进行中") : "开始匹配"}
            </Button>
          </div>
        )}

        {tab === "invite" && (
          <div className="space-y-space-sm">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索玩家名或账号"
                className="h-11 min-w-0 flex-1 bg-surface-container-highest px-3 outline-none focus:ring-1 focus:ring-secondary"
              />
              <button
                onClick={() => void searchPlayers({ data: { query } }).then((r) => { setResults(r as typeof results); if (!r.length) setNotice("没有找到该玩家"); }).catch(() => setNotice("搜索失败"))}
                className="cjk h-11 px-4 bg-secondary text-on-secondary font-label-sm text-label-sm shrink-0"
              >
                搜索
              </button>
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
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => makeInvite()} className="cjk h-11 bg-primary-container text-on-primary-container font-label-sm text-label-sm">创建公开对战码</button>
              <div className="flex">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="输入对战码" className="h-11 min-w-0 flex-1 bg-surface-container-highest px-2 uppercase outline-none" />
                <button onClick={() => accept(code)} className="cjk h-11 px-3 bg-secondary text-on-secondary shrink-0">加入</button>
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
          <div className="space-y-2">
            {open.length === 0 && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">现在没有公开约战。可以创建一个对战码，或直接用系统匹配排队。</p>}
            {open.map((i) => (
              <div key={i.code} className="min-h-12 px-3 bg-surface-container flex items-center justify-between gap-2">
                <span className="min-w-0"><strong className="block truncate">{i.hostName}</strong><small className="text-on-surface-variant">{i.hostElo} ELO · {i.code}</small></span>
                <button onClick={() => accept(i.code)} className="cjk h-11 px-3 text-secondary font-label-sm text-label-sm shrink-0">应战</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {notice && <p role="status" className="cjk mt-space-sm font-body-sm text-body-sm text-on-primary-container">{notice}</p>}
    </section>
  );
}
