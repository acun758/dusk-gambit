import { createFileRoute } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { UiIcon } from "@/components/UiIcon";
import { Bi, currentLang, useT } from "@/lib/i18n";
import { pieceSet } from "@/lib/piece-sets";
import { ThroneStandings } from "@/components/ThroneStandings";

export const Route = createFileRoute("/throne")({
  staticData: { sitemap: true },
  head: () => {
    const zh = currentLang() !== "en";
    return {
      meta: [
        { title: zh ? "王座 · 年度荣誉奖励 | 玄弈棋竞" : "The Throne · Annual Honor Award | DUSK GAMBIT" },
        {
          name: "description",
          content: zh
            ? "王座：每年一套创始人亲手精修的限量国际象棋，授予年度综合评分第一的王段守擂者。规则全公开，与任何付费无关。"
            : "The Throne: one hand-finished limited chess set per year, awarded to the top-rated Sovereign who holds the tier at year-end. Fully transparent rules, never pay-related.",
        },
        { property: "og:title", content: zh ? "王座 · 年度荣誉奖励 | 玄弈棋竞" : "The Throne · Annual Honor Award | DUSK GAMBIT" },
        {
          property: "og:description",
          content: zh
            ? "一年 · 一套 · 一人。王座奖励规则全公示。"
            : "One Year · One Set · One Player. Fully public rules.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ThronePage,
});

const OBSIDIAN = pieceSet("obsidian-sovereignty").assets;

function SectionTitle({ zh, en }: { zh: string; en: string }) {
  return (
    <h2 className="font-headline-sm text-headline-sm tracking-wider text-on-surface">
      <Bi zh={zh} en={en} />
    </h2>
  );
}

function ThronePage() {
  const t = useT();

  const prizes = [
    {
      icon: "crown" as const,
      zh: "限量实物棋",
      en: "Limited Physical Set",
      descZh: "创始人精选棋型，3D 打印后亲手精修，全球每年仅 1 套。",
      descEn: "A founder-selected design, 3D-printed and hand-finished — only 1 set worldwide per year.",
    },
    {
      icon: "seal" as const,
      zh: "编号铭牌",
      en: "Numbered Nameplate",
      descZh: "「No.001 · 王座 · 年份 · 获奖者ID」刻于棋盘底座。",
      descEn: "\"No.001 · The Throne · Year · Winner ID\" engraved on the board base.",
    },
    {
      icon: "quill" as const,
      zh: "亲笔签名证书",
      en: "Hand-Signed Certificate",
      descZh: "创始人手写签名 + 唯一编号，收藏级凭证。",
      descEn: "Founder's handwritten signature with a unique number — a collector-grade credential.",
    },
  ];

  const gates = [
    {
      zh: "王段守擂",
      en: "Hold the Sovereign Tier",
      descZh: "年度结算日（12 月 31 日 24:00 UTC+8）段位仍为王段（2500+）。",
      descEn: "On the annual settlement day (Dec 31, 24:00 UTC+8), your tier must still be Sovereign (2500+).",
    },
    {
      zh: "局数门槛",
      en: "Game Threshold",
      descZh: "当年度有效对局 ≥ 50 局（有效对局 = 真人排位完成局，含胜/负/和，不含 AI 陪练与残局试炼）。",
      descEn: "At least 50 valid games in the year (valid games = completed rated human matches, win/loss/draw; AI sparring and endgame trials excluded).",
    },
    {
      zh: "综合评分制胜出",
      en: "Top Composite Score Wins",
      descZh: "满足前两关的玩家中，按年度综合评分取第一名。同分时依次比较：胜率 → 有效局数 → 复盘使用次数 → 更早达成王段者。",
      descEn: "Among players passing both gates, the highest annual composite score wins. Ties break by: win rate → valid games → review usage → earlier Sovereign promotion.",
    },
  ];

  const timeline = [
    { zh: "12 月 31 日年度结算", en: "Annual settlement on Dec 31" },
    { zh: "候选名单审计（1 月上旬）", en: "Candidate audit (early January)" },
    { zh: "公示 7 天", en: "7-day public notice" },
    { zh: "创始人制作实物与证书", en: "Founder crafts the set and certificate" },
    { zh: "邮寄颁授（收货信息仅此时收集，寄出即删）", en: "Delivery (shipping info collected only now, deleted after dispatch)" },
    { zh: "荣誉墙铭刻，全网公告", en: "Engraved on the Wall of Honor, announced site-wide" },
  ];

  const faqs = [
    {
      qZh: "奖品需要付费或充值吗？",
      qEn: "Does the prize require payment or top-up?",
      aZh: "不需要，王座与任何付费无关。",
      aEn: "No. The Throne has nothing to do with any payment.",
    },
    {
      qZh: "外国玩家能参评吗？",
      qEn: "Can players outside China participate?",
      aZh: "能参评；实物邮寄当前仅限中国内地，海外获奖者可选择等值数字奖励（独家棋子 3D 打印文件 + 编号证书）。",
      aEn: "Yes. Physical delivery is currently limited to mainland China; overseas winners may choose an equivalent digital reward (exclusive 3D-printable piece files + numbered certificate).",
    },
    {
      qZh: "中途掉出王段怎么办？",
      qEn: "What if I drop out of Sovereign mid-season?",
      aZh: "结算日段位为准，赛季内波动不影响，结算日回到王段即有效。",
      aEn: "Only the settlement-day tier counts. In-season fluctuations don't matter — being back at Sovereign on settlement day is valid.",
    },
    {
      qZh: "AI 陪练算局数吗？",
      qEn: "Do AI sparring games count?",
      aZh: "不算，仅真人排位计入。",
      aEn: "No. Only rated human matches count.",
    },
  ];

  return (
    <div className="themed-page home-glass-page min-h-screen text-on-surface pb-32 md:pb-space-lg">
      <ThemeBackdrop theme="gothic" />
      <SovereignPageHeader titleZh="王座" titleEn="The Throne" backTo="/" />

      <main className="page-main-compact desktop-page-container px-margin-mobile grid gap-space-sm md:pb-space-lg">
        {/* S1 · Hero */}
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col items-center gap-space-sm text-center">
          <div className="flex items-end justify-center gap-2" aria-hidden="true">
            <img src={OBSIDIAN["wq"]} alt="" className="h-16 w-16 sm:h-20 sm:w-20 object-contain opacity-80" loading="lazy" decoding="async" />
            <img src={OBSIDIAN["wk"]} alt="" className="h-24 w-24 sm:h-32 sm:w-32 object-contain drop-shadow-[0_0_24px_rgba(233,195,73,0.35)]" decoding="async" />
            <img src={OBSIDIAN["wn"]} alt="" className="h-16 w-16 sm:h-20 sm:w-20 object-contain opacity-80" loading="lazy" decoding="async" />
          </div>
          <h2 className="font-headline-lg text-headline-lg tracking-wider text-on-surface">
            <Bi zh="王座" en="THE THRONE" />
          </h2>
          <p className="cjk font-label-md text-label-md tracking-[0.3em] text-secondary">
            {t("一年 · 一套 · 一人", "One Year · One Set · One Player")}
          </p>
          <p className="cjk max-w-prose font-body-sm text-body-sm text-on-surface-variant">
            {t(
              "每个王，都曾是一个兵。王座不奖励冲得快的人，奖励守得住的人。",
              "Every king was once a pawn. The Throne does not reward those who rush — it rewards those who hold.",
            )}
          </p>
        </section>

        {/* S2 · 奖品展示 */}
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
          <SectionTitle zh="奖品" en="The Prize" />
          <div className="grid gap-space-xs sm:grid-cols-3">
            {prizes.map((p) => (
              <div key={p.en} className="flex min-w-0 flex-col gap-space-xs rounded-xl bg-surface-container p-space-sm">
                <UiIcon name={p.icon} className="h-6 w-6 text-secondary" />
                <span className="cjk font-label-md text-label-md text-on-surface">{t(p.zh, p.en)}</span>
                <span className="cjk font-body-sm text-body-sm text-on-surface-variant">{t(p.descZh, p.descEn)}</span>
              </div>
            ))}
          </div>
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant opacity-80">
            {t("实物为手工精修，照片为效果图，成品以实物为准。", "Each set is hand-finished; photos are renderings — the finished product prevails.")}
          </p>
        </section>

        {/* S3 · 资格规则 */}
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
          <SectionTitle zh="资格三关" en="Three Gates of Eligibility" />
          <div className="flex flex-col gap-space-xs">
            {gates.map((g, i) => (
              <div key={g.en} className="flex min-w-0 items-start gap-space-sm rounded-xl bg-surface-container p-space-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-container font-label-md text-label-md text-on-surface tabular-nums">
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="cjk font-label-md text-label-md text-on-surface">{t(g.zh, g.en)}</span>
                  <span className="cjk font-body-sm text-body-sm text-on-surface-variant">{t(g.descZh, g.descEn)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* S4 · 评分构成 */}
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
          <SectionTitle zh="评分构成" en="Scoring Breakdown" />
          <div className="grid grid-cols-2 gap-space-xs sm:grid-cols-4">
            {[
              { pct: "40%", zh: "胜率", en: "Win rate" },
              { pct: "30%", zh: "有效局数达标分", en: "Valid games" },
              { pct: "20%", zh: "复盘使用次数", en: "Review usage" },
              { pct: "10%", zh: "每日挑战完成率", en: "Daily challenge" },
            ].map((s) => (
              <div key={s.en} className="flex min-w-0 flex-col items-center gap-1 rounded-xl bg-surface-container p-space-sm text-center">
                <span className="font-headline-sm text-headline-sm text-primary tabular-nums">{s.pct}</span>
                <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t(s.zh, s.en)}</span>
              </div>
            ))}
          </div>
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
            {t(
              "有效局数达标分：≥50 局满分，按比例计。评分公式如有调整，将提前 30 天在本页公示。",
              "Valid games: full marks at ≥50 games, scaled proportionally. Any change to the formula will be announced on this page 30 days in advance.",
            )}
          </p>
        </section>

        <ThroneStandings />

        {/* S5 · 反作弊条款 */}
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
          <SectionTitle zh="反作弊条款" en="Fair-Play Clause" />
          <ul className="flex flex-col gap-space-xs">
            <li className="cjk rounded-xl bg-surface-container p-space-sm font-body-sm text-body-sm text-on-surface-variant">
              {t(
                "平台对候选玩家进行着法质量审计（ACPL 异常检测等）；经审计判定违规者取消资格，空缺由评分顺位递补。",
                "Candidates undergo move-quality audits (ACPL anomaly detection, etc.). Verified violations void eligibility; the vacancy passes to the next highest scorer.",
              )}
            </li>
          </ul>
          <p className="cjk font-label-md text-label-md tracking-widest text-secondary">
            {t("公平，是王座唯一的入场券。", "Fair play is the only ticket to the Throne.")}
          </p>
        </section>

        {/* S6 · 颁授流程 */}
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
          <SectionTitle zh="颁授流程" en="Award Timeline" />
          <ol className="flex flex-col gap-space-xs">
            {timeline.map((step, i) => (
              <li key={step.en} className="flex min-w-0 items-center gap-space-sm rounded-xl bg-surface-container px-space-sm py-2 min-h-11">
                <span className="font-label-sm text-label-sm text-secondary w-6 shrink-0 tabular-nums">{i + 1}.</span>
                <span className="cjk font-body-sm text-body-sm text-on-surface">{t(step.zh, step.en)}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* S7 · FAQ */}
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
          <SectionTitle zh="常见问题" en="FAQ" />
          <div className="flex flex-col gap-space-xs">
            {faqs.map((f) => (
              <details key={f.qEn} className="group rounded-xl bg-surface-container p-space-sm">
                <summary className="cjk cursor-pointer list-none font-label-md text-label-md text-on-surface">
                  {t(f.qZh, f.qEn)}
                </summary>
                <p className="cjk mt-1 font-body-sm text-body-sm text-on-surface-variant">{t(f.aZh, f.aEn)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* S8 · 底部合规 */}
        <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-xs">
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
            {t(
              "王座为平台荣誉奖励，与任何付费、充值、抽奖无关；段位仅作水平参考，非官方授予称号。规则如有调整将提前公示。",
              "The Throne is a platform honor award, unrelated to any payment, top-up, or lottery. Tiers are a skill reference only, not an officially conferred title. Rule changes will be announced in advance.",
            )}
          </p>
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
            {t(
              "平时零个人信息；仅领奖环节收集收货地址，寄出后删除。",
              "No personal information is collected in normal play; a shipping address is collected only at the award stage and deleted after dispatch.",
            )}
          </p>
          <p className="cjk font-label-sm text-label-sm tracking-widest text-secondary">
            {t("首届评定：2026 年度", "Inaugural award: 2026 season")}
          </p>
        </section>
      </main>
    </div>
  );
}
