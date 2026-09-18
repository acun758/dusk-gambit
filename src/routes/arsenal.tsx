import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { UiIcon } from "@/components/UiIcon";
import { GAME_ART } from "@/lib/game-art-assets";
import { useProfile } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { fetchEndgameLevels as listEndgameLevels } from "@/data/db";
import type { DrillLevel } from "@/components/EndgameDrill";

export const Route = createFileRoute("/arsenal")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "军械典藏 · 血誓王权 | Arsenal Collection" },
      { name: "description", content: "浏览血誓王权棋子套装、战盘与残局试炼卡片。" },
      { property: "og:title", content: "军械典藏 · 血誓王权" },
      { property: "og:description", content: "浏览棋子套装、战盘与残局试炼卡片。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Arsenal,
});

import { PIECE_SET_EVENT, PIECE_SET_STORAGE_KEY } from "@/components/PlayableBoard";
import obsidianKnightPreview from "@/assets/chess-next/optimized/obsidian-n.webp";
import platinumQueenPreview from "@/assets/chess-next/optimized/platinum-q.webp";
import stellarKnightPreview from "@/assets/chess-next/optimized/stellar-n.webp";
import demonKnightPreviewAsset from "@/assets/chess/demon-gold/demon-wn.webp";
import darkDragonKnightPreviewAsset from "@/assets/chess/dark-dragon/dark-dragon-bn.webp";
import gildedBishopPreviewAsset from "@/assets/chess/gilded-b.webp";

const KINDS = [
  { id: "all", zh: "全部", en: "All" },
  { id: "knight", zh: "骑士", en: "Knight" },
  { id: "queen", zh: "女王", en: "Queen" },
  { id: "bishop", zh: "主教", en: "Bishop" },
] as const;

const SETS = [
  { id: "shadow", zh: "黑曜龙骑", en: "Obsidian Vanguard", kind: "knight", image: obsidianKnightPreview, floor: 0, price: 0, pieceSetId: "sovereign" },
  { id: "stellar", zh: "星钻圣辉", en: "Star Diamond Radiance", kind: "knight", image: stellarKnightPreview, floor: 0, price: 0, pieceSetId: "stellar" },
  { id: "demon-gold", zh: "魔皇古金", en: "Demon Emperor Antique Gold", kind: "knight", image: demonKnightPreviewAsset, floor: 0, price: 0, pieceSetId: "demon-gold" },
  { id: "dark-dragon", zh: "暗黑龙语", en: "Dark Dragon Tongue", kind: "knight", image: darkDragonKnightPreviewAsset, floor: 0, price: 0, pieceSetId: "dark-dragon" },
  { id: "classic", zh: "猩红女帝", en: "Crimson Sovereign", kind: "queen", image: platinumQueenPreview, floor: 1600, price: 1200, pieceSetId: null },
  { id: "gilded", zh: "圣堂裁决", en: "Gilded Judgment", kind: "bishop", image: gildedBishopPreviewAsset, floor: 2200, price: 1800, pieceSetId: null },
] as const;

const BOARDS = [
  { id: "temple", zh: "永夜神庙", en: "Everdark Temple", image: boardTemple, floor: 0 },
  { id: "trench", zh: "血色战壕", en: "Crimson Trench", image: boardTrench, floor: 1200 },
  { id: "palecourt", zh: "苍白王庭", en: "Pale Court", image: boardPaleCourt, floor: 1600 },
  { id: "dragonpit", zh: "龙焰深穴", en: "Dragonflame Pit", image: boardDragonPit, floor: 2000 },
  { id: "abbey", zh: "沉没修道院", en: "Sunken Abbey", image: boardAbbey, floor: 2200 },
  { id: "coronation", zh: "黄金加冕厅", en: "Golden Coronation Hall", image: boardCoronation, floor: 2500 },
] as const;

function Arsenal() {
  const t = useT();
  const { profile, signedIn, setEquipment } = useProfile();
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState("shadow");
  const [equippedId, setEquippedId] = useState("shadow");
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => (filter === "all" ? SETS : SETS.filter((item) => item.kind === filter)), [filter]);
  const selected = SETS.find((item) => item.id === selectedId) ?? SETS[0];
  const unlocked = profile.elo >= selected.floor;
  const kindLabel = (id: string) => {
    const k = KINDS.find((x) => x.id === id);
    return k ? t(k.zh, k.en) : id;
  };

  const drillsQ = useQuery({
    queryKey: ["endgame-levels"],
    queryFn: () => listEndgameLevels() as Promise<DrillLevel[]>,
  });
  const drills = (drillsQ.data ?? []).slice(0, 6);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("bs.arsenal.equipped") ?? "shadow";
      setEquippedId(signedIn ? (SETS.find((item) => item.pieceSetId === profile.equippedPieceSet)?.id ?? "shadow") : stored);
    } catch {
      /* storage unavailable */
    }
  }, [profile.equippedPieceSet, signedIn]);

  const equip = async () => {
    if (!unlocked) {
      setNotice(t(`达到 ${selected.floor} ELO 后解锁此套装。`, `Reach ${selected.floor} ELO to unlock this set.`));
      return;
    }
    setEquippedId(selected.id);
    try {
      window.localStorage.setItem("bs.arsenal.equipped", selected.id);
      if (selected.pieceSetId) {
        window.localStorage.setItem(PIECE_SET_STORAGE_KEY, selected.pieceSetId);
        window.dispatchEvent(new Event(PIECE_SET_EVENT));
        if (signedIn) await setEquipment(selected.pieceSetId);
      }
    } catch {
      /* storage unavailable */
    }
    setNotice(
      selected.pieceSetId
        ? t(`${selected.zh}已装备，对弈棋盘立即切换为这套棋子。`, `${selected.en} equipped — the board switches to these pieces instantly.`)
        : t(`${selected.zh}已装备为展示套装，棋盘棋子沿用当前套装。`, `${selected.en} equipped for display only; board pieces stay unchanged.`),
    );
  };

  return (
    <div className="themed-page home-glass-page min-h-screen text-on-surface pb-32">
      <ThemeBackdrop theme="abyss" />
      <SovereignPageHeader icon="nav-arsenal" titleZh="军械典藏" titleEn="Arsenal Collection" backTo="/" />
      <main className="page-main-dashboard">
        <div className="desktop-page-container grid w-full gap-space-md px-margin-mobile py-space-md lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <section className="grid gap-space-md">
            <div className="section-heading-row">
              <div className="min-w-0">
                <p className="cjk font-label-sm text-label-sm text-primary">{t("棋具收藏 · VISUAL LOADOUT", "Visual loadout · 棋具收藏")}</p>
                <h2 className="cjk font-headline-md text-headline-md">{t("棋子套装", "Piece Sets")}</h2>
              </div>
              <span className="font-label-md text-label-md tabular-nums text-secondary">{profile.elo} ELO · ♦ {profile.diamonds}</span>
            </div>

            <div className="flex gap-1 overflow-x-auto">
              {KINDS.map((item) => (
                <Button key={item.id} type="button" onClick={() => setFilter(item.id)} variant="ghost" className={`home-glass-control h-11 shrink-0 px-4 cjk ${filter === item.id ? "home-glass-tile-active text-secondary" : "text-on-surface-variant"}`}>{t(item.zh, item.en)}</Button>
              ))}
            </div>

            <div className="grid gap-space-sm sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => {
                const canUse = profile.elo >= item.floor;
                const active = selected.id === item.id;
                return (
                  <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`home-glass-tile grid min-w-0 gap-2 p-space-sm text-left transition-colors ${active ? "home-glass-tile-active" : ""}`}>
                    <div className="home-glass-media aged-print-frame relative aspect-[4/3] overflow-hidden">
                      <img src={item.image} alt={t(`${item.zh}${kindLabel(item.kind)}——${canUse ? "当前段位可使用" : `需 ${item.floor} 分解锁`}`, `${item.en} ${kindLabel(item.kind)} — ${canUse ? "available at your rating" : `unlocks at ${item.floor} rating`}`)} className="h-full w-full object-contain p-2" />
                      <span className={`absolute left-2 top-2 px-2 py-1 font-label-sm text-label-sm cjk ${canUse ? "bg-secondary text-on-secondary" : "bg-surface-container-highest text-on-surface-variant"}`}>{equippedId === item.id ? t("已装备", "Equipped") : canUse ? t("可使用", "Available") : `${item.floor} ELO`}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="cjk truncate font-headline-sm text-headline-sm">{t(item.zh, item.en)}</h3>
                      <p className="truncate font-label-sm text-label-sm text-on-surface-variant">{t(item.en, item.zh)} · {kindLabel(item.kind)}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 残局试炼卡片：直接进入对弈页的残局模式 */}
            <section className="home-glass-panel grid gap-space-sm p-space-md">
              <div className="section-heading-row">
                <h2 className="cjk font-headline-sm text-headline-sm">{t("残局试炼卡片", "Endgame Drill Cards")}</h2>
                <Link to="/crucible" className="cjk flex min-h-11 items-center text-secondary font-label-sm text-label-sm">{t("盲视心算版 →", "Blindfold version →")}</Link>
              </div>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {t("选一张卡片，在对弈页的残局模式里真正走完，将死后进入复盘讲解。", "Pick a card, play it out in drill mode on the duel page, then read the review after mate.")}
              </p>
              {drillsQ.isLoading && <div className="h-14 animate-pulse bg-surface-container" />}
              <div className="grid gap-space-xs sm:grid-cols-2">
                {drills.map((level) => (
                  <Link
                    key={level.id}
                    to="/battle"
                    search={{ drill: level.code }}
                    className="home-glass-tile grid min-w-0 gap-1 p-space-sm"
                  >
                    <span className="cjk truncate font-label-md text-label-md">{t(level.name_zh, level.name_en)}</span>
                    <span className="cjk truncate font-label-sm text-label-sm text-on-surface-variant">
                      {t(level.theme_zh, level.theme_en)} · {t(`${level.moves_to_mate} 步将死`, `Mate in ${level.moves_to_mate}`)} · D{level.depth}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="home-glass-panel grid gap-2 p-space-md">
               <div className="section-heading-row">
                <h2 className="cjk font-headline-sm text-headline-sm">{t("战盘收藏", "Board Collection")}</h2>
                <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("随段位解锁", "Unlocked by tier")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BOARDS.map((board) => {
                  const canUse = profile.elo >= board.floor;
                  return (
                    <div key={board.id} className="home-glass-tile p-2">
                      <div className="home-glass-media aged-print-frame aspect-video overflow-hidden"><img src={board.image} alt={t(`${board.zh}战盘`, `${board.en} board`)} loading="lazy" decoding="async" className="h-full w-full object-cover" /></div>
                      <div className="mt-2 flex items-center justify-between gap-2"><span className="cjk truncate font-label-md text-label-md">{t(board.zh, board.en)}</span><span className="cjk shrink-0 font-label-sm text-label-sm text-secondary">{canUse ? t("可使用", "Available") : `${board.floor} ELO`}</span></div>
                    </div>
                  );
                })}
              </div>
            </section>
          </section>

          <aside className="stage-panel home-glass-panel grid gap-space-sm p-space-md lg:sticky lg:top-24">
            <div className="home-glass-media aged-print-frame relative aspect-square overflow-hidden">
              <img src={selected.image} alt={t(`${selected.zh}${kindLabel(selected.kind)}的细节展示图`, `Detailed view of the ${selected.en} ${kindLabel(selected.kind)}`)} className="h-full w-full object-contain p-space-sm" />
            </div>
            <div>
              <p className="cjk font-label-sm text-label-sm text-primary">{kindLabel(selected.kind)} · {unlocked ? t("已解锁", "Unlocked") : t("段位锁定", "Tier locked")}</p>
              <h2 className="cjk mt-1 font-headline-md text-headline-md">{t(selected.zh, selected.en)}</h2>
              <p className="font-label-md text-label-md text-on-surface-variant">{t(selected.en, selected.zh)}</p>
            </div>
            <p className="cjk font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
              {t(
                "统一比例的 3D 棋子套装，仅改变对弈视觉，不影响规则、落子判定或天梯积分。",
                "Consistently scaled 3D piece sets. Visual only — rules, move validation and ladder rating are unaffected.",
              )}
            </p>
            <Button type="button" onClick={equip} disabled={equippedId === selected.id} className="home-glass-action h-12 text-on-primary-container disabled:opacity-50">
              <UiIcon name={unlocked ? "forge" : "seal"} className="h-6 w-6" />
              <span className="cjk">{equippedId === selected.id ? t("当前已装备", "Currently equipped") : unlocked ? t("装备此套", "Equip this set") : t(`${selected.floor} ELO 解锁`, `Unlocks at ${selected.floor} ELO`)}</span>
            </Button>
            {notice && <p role="status" className="cjk font-body-sm text-body-sm text-secondary">{notice}</p>}
          </aside>
        </div>
      </main>
    </div>
  );
}
