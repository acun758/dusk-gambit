import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { UiIcon } from "@/components/UiIcon";
import { GAME_ART } from "@/lib/game-art-assets";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/arsenal")({
  head: () => ({
    meta: [
      { title: "军械典藏 · 血誓王权 | Arsenal Collection" },
      { name: "description", content: "浏览血誓王权棋子套装、战盘与对局视觉收藏。" },
      { property: "og:title", content: "军械典藏 · 血誓王权" },
      { property: "og:description", content: "浏览棋子套装、战盘与对局视觉收藏。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Arsenal,
});

import { PIECE_SET_EVENT, PIECE_SET_STORAGE_KEY } from "@/components/PlayableBoard";
import stellarKnightPreview from "@/assets/chess-next/optimized/stellar-n.webp";
import demonKnightPreviewAsset from "@/assets/chess/demon-gold/demon-wn.webp.asset.json";
import darkDragonKnightPreviewAsset from "@/assets/chess/dark-dragon/dark-dragon-bn.webp.asset.json";

const SETS = [
  { id: "shadow", zh: "黑曜龙骑", en: "Obsidian Vanguard", kind: "骑士", image: GAME_ART.sets.shadow, floor: 0, price: 0, pieceSetId: "sovereign" },
  { id: "stellar", zh: "星钻圣辉", en: "Star Diamond Radiance", kind: "骑士", image: stellarKnightPreview, floor: 0, price: 0, pieceSetId: "stellar" },
  { id: "demon-gold", zh: "魔皇古金", en: "Demon Emperor Antique Gold", kind: "骑士", image: demonKnightPreviewAsset.url, floor: 0, price: 0, pieceSetId: "demon-gold" },
  { id: "dark-dragon", zh: "暗黑龙语", en: "Dark Dragon Tongue", kind: "骑士", image: darkDragonKnightPreviewAsset.url, floor: 0, price: 0, pieceSetId: "dark-dragon" },
  { id: "classic", zh: "猩红女帝", en: "Crimson Sovereign", kind: "女王", image: GAME_ART.sets.classic, floor: 2400, price: 1200, pieceSetId: null },
  { id: "gilded", zh: "圣堂裁决", en: "Gilded Judgment", kind: "主教", image: GAME_ART.sets.gilded, floor: 2500, price: 1800, pieceSetId: null },
] as const;

function Arsenal() {
  const { profile } = useProfile();
  const [filter, setFilter] = useState("全部");
  const [selectedId, setSelectedId] = useState("shadow");
  const [equippedId, setEquippedId] = useState("shadow");
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => filter === "全部" ? SETS : SETS.filter((item) => item.kind === filter), [filter]);
  const selected = SETS.find((item) => item.id === selectedId) ?? SETS[0];
  const unlocked = profile.elo >= selected.floor;

  useEffect(() => {
    try {
      setEquippedId(window.localStorage.getItem("bs.arsenal.equipped") ?? "shadow");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const equip = () => {
    if (!unlocked) {
      setNotice(`达到 ${selected.floor} ELO 后解锁此套装。`);
      return;
    }
    setEquippedId(selected.id);
    try {
      window.localStorage.setItem("bs.arsenal.equipped", selected.id);
      if (selected.pieceSetId) {
        window.localStorage.setItem(PIECE_SET_STORAGE_KEY, selected.pieceSetId);
        window.dispatchEvent(new Event(PIECE_SET_EVENT));
      }
    } catch {
      /* storage unavailable */
    }
    setNotice(
      selected.pieceSetId
        ? `${selected.zh}已装备，对弈棋盘立即切换为这套棋子。`
        : `${selected.zh}已装备为展示套装，棋盘棋子沿用当前套装。`,
    );
  };

  return (
    <div className="themed-page min-h-screen text-on-surface pb-32">
      <ThemeBackdrop theme="abyss" />
      <SovereignPageHeader icon="nav-arsenal" titleZh="军械典藏" titleEn="Arsenal Collection" backTo="/" />
      <main className="page-main-dashboard">
        <div className="desktop-page-container grid w-full gap-space-md px-margin-mobile py-space-md lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <section className="grid gap-space-md">
            <div className="section-heading-row">
              <div className="min-w-0">
                <p className="cjk font-label-sm text-label-sm text-primary">棋具收藏 · VISUAL LOADOUT</p>
                <h2 className="cjk font-headline-md text-headline-md">棋子套装</h2>
              </div>
              <span className="font-label-md text-label-md tabular-nums text-secondary">{profile.elo} ELO · ♦ {profile.diamonds}</span>
            </div>

            <div className="flex gap-1 overflow-x-auto">
              {["全部", "骑士", "女王", "主教"].map((item) => (
                <Button key={item} type="button" onClick={() => setFilter(item)} variant="ghost" className={`h-11 shrink-0 rounded-none px-4 ${filter === item ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"}`}>{item}</Button>
              ))}
            </div>

            <div className="grid gap-space-sm sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => {
                const canUse = profile.elo >= item.floor;
                const active = selected.id === item.id;
                return (
                  <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`grid min-w-0 gap-2 bg-surface-container-low p-space-sm text-left transition-colors ${active ? "gold-hairline bg-surface-container-high" : "hover:bg-surface-container"}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-lowest">
                      <img src={item.image} alt={`${item.zh}棋子套装`} className="h-full w-full object-cover" />
                      <span className={`absolute left-2 top-2 px-2 py-1 font-label-sm text-label-sm ${canUse ? "bg-secondary text-on-secondary" : "bg-surface-container-highest text-on-surface-variant"}`}>{equippedId === item.id ? "已装备" : canUse ? "可使用" : `${item.floor} ELO`}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="cjk truncate font-headline-sm text-headline-sm">{item.zh}</h3>
                      <p className="truncate font-label-sm text-label-sm text-on-surface-variant">{item.en} · {item.kind}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <section className="grid gap-2 bg-surface-container-low p-space-md gold-hairline">
               <div className="section-heading-row">
                <h2 className="cjk font-headline-sm text-headline-sm">战盘收藏</h2>
                <span className="cjk font-label-sm text-label-sm text-on-surface-variant">随段位解锁</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[{ image: GAME_ART.reviewBoard, name: "永夜神庙", state: "已启用" }, { image: GAME_ART.matchArena, name: "血色战壕", state: "2600 ELO" }].map((board) => (
                  <div key={board.name} className="bg-surface-container p-2">
                    <img src={board.image} alt={`${board.name}战盘`} className="aspect-video w-full object-cover" />
                    <div className="mt-2 flex items-center justify-between gap-2"><span className="cjk truncate font-label-md text-label-md">{board.name}</span><span className="shrink-0 font-label-sm text-label-sm text-secondary">{board.state}</span></div>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="stage-panel grid gap-space-sm bg-surface-container-low p-space-md gold-hairline lg:sticky lg:top-24">
            <div className="relative aspect-square overflow-hidden bg-surface-container-lowest">
              <img src={selected.image} alt={`${selected.zh}大图`} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="cjk font-label-sm text-label-sm text-primary">{selected.kind} · {unlocked ? "已解锁" : "段位锁定"}</p>
              <h2 className="cjk mt-1 font-headline-md text-headline-md">{selected.zh}</h2>
              <p className="font-label-md text-label-md text-on-surface-variant">{selected.en}</p>
            </div>
            <p className="cjk font-body-sm text-body-sm leading-relaxed text-on-surface-variant">统一比例的 3D 棋子套装，仅改变对弈视觉，不影响规则、落子判定或天梯积分。</p>
            <Button type="button" onClick={equip} disabled={equippedId === selected.id} className="h-12 rounded-none bg-primary-container text-on-primary-container disabled:opacity-50">
              <UiIcon name={unlocked ? "forge" : "seal"} className="h-6 w-6" />
              <span className="cjk">{equippedId === selected.id ? "当前已装备" : unlocked ? "装备此套" : `${selected.floor} ELO 解锁`}</span>
            </Button>
            {notice && <p role="status" className="cjk font-body-sm text-body-sm text-secondary">{notice}</p>}
          </aside>
        </div>
      </main>
    </div>
  );
}