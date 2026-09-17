import { Link } from "@tanstack/react-router";
import poster from "@/assets/invite-poster.jpg";
import { useProfile, tierLabel } from "@/lib/profile";
import { RankBadge } from "@/components/RankBadge";
import { UiIcon } from "@/components/UiIcon";
import { rankOf } from "@/lib/ranks";

/** 邀请对弈海报：段位徽章 + 当前积分，首页与天梯页共用。 */
export function InvitePoster({ className = "" }: { compact?: boolean; className?: string }) {
  const { profile, winRate } = useProfile();
  const rank = rankOf(profile.elo);
  return (
    <section
      aria-label="邀请对弈"
      className={`home-media-frame relative w-full overflow-hidden bg-surface-container-lowest sm:aspect-[16/9] ${className}`}
    >
      {/* 图片始终铺满整张卡片，文字压在图上（手机 / iPad / 桌面一致） */}
      <div className="aged-print-frame absolute inset-0">
        <img
          src={poster}
          alt="血誓王权邀请对弈海报"
          loading="lazy"
          width={1536}
          height={864}
          className="block h-full w-full object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest/95 via-surface-container-lowest/82 to-surface-container-lowest/45 sm:bg-gradient-to-r sm:from-surface-container-lowest/95 sm:via-surface-container-lowest/75 sm:to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-space-md sm:max-w-[68%] sm:gap-3 sm:p-8 lg:gap-4 lg:p-12">

        <div className="flex items-center gap-2 min-w-0 sm:gap-3 lg:gap-4">
          <RankBadge rank={rank.id} className="h-10 w-10 shrink-0 sm:h-14 sm:w-14 lg:h-20 lg:w-20" label={`${rank.zh}段徽章`} />
          <h2 className="cjk font-headline-sm text-headline-sm text-on-surface truncate sm:text-headline-md lg:font-headline-lg lg:text-headline-lg">{tierLabel(profile).zh}</h2>
        </div>
        <p className="font-label-md text-label-md text-on-surface-variant tabular-nums sm:text-body-md lg:font-body-lg lg:text-body-lg">
          {profile.elo} 分 · 胜率 {winRate}% · ♦ {profile.diamonds}
        </p>
        <p className="cjk font-label-sm text-label-sm text-secondary sm:text-label-md lg:text-label-lg">
          实名认证可选 · 不影响约战与天梯
        </p>
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant sm:text-body-md lg:text-body-lg">系统按段位就近匹配，段位相近者优先。</p>
        <Link
          to="/battle"
          className="home-glass-action cjk mt-1 inline-flex min-h-11 w-fit items-center gap-1 px-4 text-on-primary-container font-label-sm text-label-sm sm:mt-2 sm:min-h-12 sm:gap-2 sm:px-6 sm:text-label-md lg:mt-3 lg:min-h-14 lg:px-8 lg:text-label-lg"
        >
          选择赛制发起约战
          <UiIcon name="shield" className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
        </Link>
      </div>
    </section>
  );
}
