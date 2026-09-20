import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";

import { UiIcon } from "@/components/UiIcon";
import { Input } from "@/components/ui/input";
import { fetchFideRatings } from "@/data/db";
import type { HallBoard } from "@/data/hall.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/hall-of-fame")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "名人堂 · FIDE 等级分榜 | 玄弈棋竞" },
      {
        name: "description",
        content: "世界公开、世界女子、中国与中国女子四张 FIDE 标准棋等级分榜，按月度快照更新，可按姓名检索。",
      },
      { property: "og:title", content: "名人堂 · FIDE 等级分榜 | 玄弈棋竞" },
      { property: "og:description", content: "四张 FIDE 标准棋等级分榜，月度更新，支持姓名检索。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HallOfFame,
});

const BOARDS: { key: HallBoard; zh: string; en: string }[] = [
  { key: "open", zh: "世界", en: "World" },
  { key: "women", zh: "女子", en: "Women" },
  { key: "chn", zh: "中国", en: "China" },
  { key: "chnW", zh: "中国女子", en: "China W" },
];

function HallOfFame() {
  const t = useT();
  const [board, setBoard] = useState<HallBoard>("open");
  const [q, setQ] = useState("");

  const listQ = useQuery({
    queryKey: ["fide", board, q],
    queryFn: () => fetchFideRatings({ data: { board, q, limit: 100 } }),
  });

  const rows = listQ.data?.rows ?? [];
  const updated = listQ.data?.updatedAt ? new Date(listQ.data.updatedAt).toISOString().slice(0, 10) : null;

  return (
    <div className="themed-page home-glass-page min-h-screen text-on-surface pb-32 md:pb-space-lg">
      <ThemeBackdrop theme="gothic" />
      <SovereignPageHeader icon="nav-review" titleZh="名人堂" titleEn="Hall of Fame" />

      <main className="page-main-compact desktop-page-container px-margin-mobile grid gap-space-sm md:pb-space-lg">
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
          <div className="grid grid-cols-4 gap-1">
            {BOARDS.map((b) => (
              <button
                key={b.key}
                onClick={() => setBoard(b.key)}
                aria-pressed={board === b.key}
                className={`h-11 min-w-0 rounded-xl px-1 transition-colors ${
                  board === b.key
                    ? "bg-primary-container text-on-surface"
                    : "bg-surface-container-high text-on-surface-variant hover:text-secondary"
                }`}
              >
                <span className="cjk font-label-sm text-label-sm whitespace-nowrap">{t(b.zh, b.en)}</span>
              </button>
            ))}
          </div>

          <div className="flex min-w-0 items-center gap-space-xs">
            <UiIcon name="eye" className="h-5 w-5 shrink-0 opacity-70" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("按姓名检索，如 Ding", "Search by name, e.g. Ding")}
              className="h-11 rounded-xl"
            />
          </div>

          {listQ.isLoading && (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-surface-container animate-pulse" />
              ))}
            </div>
          )}

          {!listQ.isLoading && rows.length === 0 && (
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant py-6">
              {q ? t("没有匹配的棋手", "No player matched") : t("榜单尚未导入，稍后再来", "Ranking not imported yet")}
            </p>
          )}

          <div className="flex flex-col gap-1">
            {rows.map((r) => (
              <div
                key={r.fideId}
                className="flex min-w-0 items-center gap-space-xs bg-surface-container px-2 py-2 min-h-11 rounded-xl"
              >
                <span className="font-label-sm text-label-sm text-secondary w-8 shrink-0 tabular-nums">{r.rank}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant w-10 shrink-0">
                  {r.title ?? "—"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface truncate flex-1 min-w-0">{r.name}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant w-10 shrink-0 text-right">
                  {r.country}
                </span>
                <span className="font-label-md text-label-md text-on-surface w-12 shrink-0 text-right tabular-nums">
                  {r.rating}
                </span>
              </div>
            ))}
          </div>

          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
            数据来源：FIDE 公开标准棋等级分榜{updated ? ` · 快照 ${updated}` : ""}。本页仅作水平参考展示，与本平台自建段位无关，
            也不代表任何官方授予。
          </p>
        </section>
      </main>
    </div>
  );
}
