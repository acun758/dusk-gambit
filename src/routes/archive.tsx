import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import tarotKingAsset from "@/assets/tarot-king.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { UiIcon, type UiIconName } from "@/components/UiIcon";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "绝杀典藏 · 血誓王权 | Victory Archive" },
      { name: "description", content: "将已完成的精彩对局制作成典藏海报，保存棋谱、段位与胜负记录。" },
      { property: "og:title", content: "绝杀典藏 · 血誓王权" },
      { property: "og:description", content: "将精彩对局制作成可保存的典藏海报。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArchiveChronicle,
});

const STYLES: { id: string; zh: string; en: string; icon: UiIconName }[] = [
  { id: "tarot", zh: "塔罗王牌", en: "Tarot Ace", icon: "cards" },
  { id: "poster", zh: "战役海报", en: "Battle Poster", icon: "wallpaper" },
  { id: "dispatch", zh: "王权军牒", en: "Royal Dispatch", icon: "scroll" },
];

const ELEMENTS = ["棋谱", "王权印章", "对手铭牌", "签名水印"] as const;

function ArchiveChronicle() {
  const { profile, winRate } = useProfile();
  const [style, setStyle] = useState("tarot");
  const [ratio, setRatio] = useState("4:5");
  const [elements, setElements] = useState<string[]>([...ELEMENTS]);
  const [notice, setNotice] = useState("");

  const exportPoster = () => {
    const a = document.createElement("a");
    a.href = tarotKingAsset.url;
    a.download = `血誓王权-${profile.name}-典藏海报.jpg`;
    a.click();
    setNotice("典藏图已准备下载；完整战报数据仍保留在对局复盘中。");
  };

  return (
    <div className="themed-page min-h-screen text-on-surface pb-32">
      <ThemeBackdrop theme="fallen" />
      <SovereignPageHeader icon="archive-premium" titleZh="绝杀典藏" titleEn="Victory Archive" backTo="/analysis" />
      <main className="page-main-dashboard">
        <div className="desktop-page-container grid w-full gap-space-md px-margin-mobile py-space-md lg:grid-cols-[minmax(0,640px)_minmax(300px,1fr)] lg:items-start">
          <section className="grid gap-space-sm">
            <div className="section-heading-row">
              <div className="min-w-0">
                <p className="cjk font-label-sm text-label-sm text-primary">对局高光 · PERSONAL ARCHIVE</p>
                <h2 className="cjk font-headline-md text-headline-md truncate">王权战报典藏</h2>
              </div>
              <Link to="/analysis" className="cjk flex min-h-11 items-center px-3 text-secondary">选择对局 →</Link>
            </div>

            <div className={`relative mx-auto w-full overflow-hidden bg-surface-container-lowest gold-hairline ${ratio === "1:1" ? "aspect-square max-w-[560px]" : ratio === "9:16" ? "aspect-[9/16] max-w-[390px]" : "aspect-[4/5] max-w-[520px]"}`}>
              <img src={tarotKingAsset.url} alt="黑曜王棋典藏海报" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/80" />
              <div className="absolute inset-0 flex flex-col justify-between p-space-md text-center">
                <div>
                  <p className="font-label-sm text-label-sm text-secondary">BLOOD SOVEREIGN · {STYLES.find((item) => item.id === style)?.en}</p>
                  <h2 className="cjk mt-1 font-headline-lg-mobile text-headline-lg-mobile">棋盘从不说谎</h2>
                </div>
                <div className="bg-surface-container-lowest/82 p-space-sm backdrop-blur-md">
                  <p className="cjk font-label-lg text-label-lg text-secondary">{profile.name} · {profile.tierZh}</p>
                  <p className="mt-1 font-label-md text-label-md tabular-nums text-on-surface-variant">{profile.elo} ELO · 胜率 {winRate}% · ♦ {profile.diamonds}</p>
                  {elements.includes("棋谱") && <p className="mt-2 font-headline-sm text-headline-sm">38. Qf7#</p>}
                </div>
              </div>
            </div>
          </section>

          <aside className="stage-panel grid gap-space-md bg-surface-container-low p-space-md gold-hairline lg:sticky lg:top-24">
            <section className="grid gap-2">
              <h2 className="cjk font-headline-sm text-headline-sm">典藏样式</h2>
              <div className="grid grid-cols-3 gap-1">
                {STYLES.map((item) => (
                  <Button key={item.id} type="button" onClick={() => setStyle(item.id)} variant="ghost" className={`h-16 rounded-none flex-col gap-1 px-1 ${style === item.id ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant"}`}>
                    <UiIcon name={item.icon} className="h-6 w-6" />
                    <span className="cjk font-label-sm text-label-sm">{item.zh}</span>
                  </Button>
                ))}
              </div>
            </section>

            <section className="grid gap-2">
              <h2 className="cjk font-headline-sm text-headline-sm">画面比例</h2>
              <div className="grid grid-cols-3 gap-1">
                {["9:16", "4:5", "1:1"].map((item) => (
                  <Button key={item} type="button" onClick={() => setRatio(item)} variant="ghost" className={`h-11 rounded-none ${ratio === item ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"}`}>{item}</Button>
                ))}
              </div>
            </section>

            <section className="grid gap-2">
              <h2 className="cjk font-headline-sm text-headline-sm">海报元素</h2>
              <div className="grid grid-cols-2 gap-1">
                {ELEMENTS.map((item) => {
                  const active = elements.includes(item);
                  return (
                    <Button key={item} type="button" aria-pressed={active} onClick={() => setElements((current) => active ? current.filter((value) => value !== item) : [...current, item])} variant="ghost" className={`h-11 rounded-none justify-start ${active ? "bg-surface-container-high text-secondary" : "bg-surface-container text-on-surface-variant"}`}>
                      <UiIcon name={active ? "medal-star" : "seal"} className="h-5 w-5" />
                      <span className="cjk">{item}</span>
                    </Button>
                  );
                })}
              </div>
            </section>

            <Button type="button" onClick={exportPoster} className="h-12 rounded-none bg-primary-container text-on-primary-container">
              <UiIcon name="download" className="h-6 w-6" />
              <span className="cjk">保存典藏图</span>
            </Button>
            {notice && <p role="status" className="cjk font-body-sm text-body-sm text-secondary">{notice}</p>}
          </aside>
        </div>
      </main>
    </div>
  );
}