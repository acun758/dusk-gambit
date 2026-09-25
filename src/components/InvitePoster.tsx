import { Link } from "@tanstack/react-router";
import poster from "@/assets/invite-poster.jpg";
import { useProfile, tierLabel } from "@/lib/profile";
import { RankBadge } from "@/components/RankBadge";
import { UiIcon } from "@/components/UiIcon";
import { rankOf } from "@/lib/ranks";
import { useT } from "@/lib/i18n";

/** 邀请对弈海报：段位徽章 + 当前积分，首页与天梯页共用。 */
export function InvitePoster({ showThrone = false, className = "" }: { showThrone?: boolean; compact?: boolean; className?: string }) {
  const { profile, winRate } = useProfile();
  const t = useT();
  const rank = rankOf(profile.elo);
  return (
    <section
      aria-label={t("邀请对弈", "Challenge invitation")}
      className={`home-media-frame relative w-full overflow-hidden bg-surface-container-lowest sm:aspect-[16/9] ${className}`}
    >
      {/* 图片始终铺满整张卡片，文字压在图上（手机 / iPad / 桌面一致） */}
      <div className="aged-print-frame" style={{ position: "absolute", inset: 0 }}>
        <img
          src={poster}
          alt={t("血誓王权邀请对弈海报", "Blood Sovereign challenge poster")}
          loading="lazy"
          width={1536}
          height={864}
          className="block"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", maxHeight: "none" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest/95 via-surface-container-lowest/82 to-surface-container-lowest/45 sm:bg-gradient-to-r sm:from-surface-container-lowest/95 sm:via-surface-container-lowest/75 sm:to-transparent" />
      {/* 手机端跟随内容高度，图片随之铺满；平板及以上保持 16:9 定高 */}
      <div className="relative flex flex-col justify-center gap-1.5 p-space-md sm:absolute sm:inset-0 sm:max-w-[68%] sm:gap-3 sm:p-8 lg:gap-4 lg:p-12">

        <div className="flex items-center gap-2 min-w-0 sm:gap-3 lg:gap-4">
          <RankBadge rank={rank.id} className="h-10 w-10 shrink-0 sm:h-14 sm:w-14 lg:h-20 lg:w-20" label={t(`${rank.zh}段徽章`, `${rank.en} tier badge`)} />
          <h2 className="cjk font-headline-sm text-headline-sm text-on-surface truncate sm:text-headline-md lg:font-headline-lg lg:text-headline-lg">{t(tierLabel(profile).zh, tierLabel(profile).en)}</h2>
        </div>
        <p className="font-label-md text-label-md text-on-surface-variant tabular-nums sm:text-body-md lg:font-body-lg lg:text-body-lg">
          {t(`${profile.elo} 分 · 胜率 ${winRate}% · ♦ ${profile.diamonds}`, `${profile.elo} rating · ${winRate}% win rate · ♦ ${profile.diamonds}`)}
        </p>
        <p className="cjk font-label-sm text-label-sm text-secondary sm:text-label-md lg:text-label-lg">
          {t("免费对弈 · 胜负实时结算天梯积分", "Free to play · ratings settle after every game")}
        </p>
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant sm:text-body-md lg:text-body-lg">{t("系统按段位就近匹配，段位相近者优先。", "Matchmaking pairs you with the closest ratings first.")}</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            to="/battle"
            className="home-glass-action cjk inline-flex min-h-11 w-fit items-center gap-1 px-4 text-on-primary-container font-label-sm text-label-sm sm:min-h-12 sm:gap-2 sm:px-6 sm:text-label-md lg:min-h-14 lg:px-8 lg:text-label-lg"
          >
            {t("选择赛制发起约战", "Choose a time control")}
            <UiIcon name="shield" className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          </Link>
          {showThrone && (
            <Link
              to="/throne"
              aria-label={t("玄弈年度尊享 · 王座年度荣誉奖励规则", "The Throne · annual honor award rules")}
              className="cjk pulse-glow-crimson inline-flex min-h-11 w-fit items-center gap-1 rounded-xl border border-crimson-700 bg-crimson-glow px-4 text-on-primary-container font-label-sm text-label-sm transition-colors hover:bg-crimson-700 sm:min-h-12 sm:gap-2 sm:px-6 sm:text-label-md lg:min-h-14 lg:px-8 lg:text-label-lg"
            >
              {t("玄弈年度尊享", "The Throne · Annual Honor")}
              <UiIcon name="crown" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
