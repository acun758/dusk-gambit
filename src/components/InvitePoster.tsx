import { Link } from "@tanstack/react-router";
import poster from "@/assets/invite-poster.jpg";
import { useProfile } from "@/lib/profile";
import { GameIcon, type GameIconName } from "@/components/GameIcon";
import { UiIcon } from "@/components/UiIcon";

const TIER_ICON: Record<string, GameIconName> = {
  Sovereign: "rank-sovereign",
  Apex: "rank-apex",
  Grandmaster: "rank-grandmaster",
  Master: "rank-master",
  Knight: "rank-knight",
};

/** 邀请对弈海报：段位徽章 + 当前积分，首页与天梯页共用。 */
export function InvitePoster({ className = "" }: { compact?: boolean; className?: string }) {
  const { profile, winRate } = useProfile();
  const icon = TIER_ICON[profile.tier] ?? "rank-knight";
  return (
    <section aria-label="邀请对弈" className={`home-media-frame relative w-full overflow-hidden bg-surface-container-lowest ${className}`}>
      {/* 图片铺底，文字按内容撑高，避免手机端文字贴边或溢出 */}
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
      <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/95 via-surface-container-lowest/80 to-surface-container-lowest/20 sm:to-transparent" />
      <div className="relative flex min-h-52 flex-col justify-center gap-1.5 p-space-md sm:min-h-64 sm:max-w-[68%]">
        <span className="cjk font-label-sm text-label-sm tracking-[0.3em] text-primary">邀 战 书</span>
        <div className="flex items-center gap-2 min-w-0">
          <GameIcon name={icon} className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
          <h2 className="cjk font-headline-sm text-headline-sm text-on-surface truncate">{profile.tierZh}</h2>
        </div>
        <p className="font-label-md text-label-md text-on-surface-variant tabular-nums">
          {profile.elo} 分 · 胜率 {winRate}% · ♦ {profile.diamonds}
        </p>
        <p className="cjk font-label-sm text-label-sm">
          {profile.realName
            ? <span className="text-secondary">已实名 · {profile.realName} · 段位与积分实时同步</span>
            : <span className="text-primary">未实名 · 约战与天梯前请先填写真实姓名</span>}
        </p>
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant">系统按段位就近匹配，段位相近者优先。</p>
        <Link
          to="/battle"
          className="home-glass-action cjk mt-1 inline-flex min-h-11 w-fit items-center gap-1 px-4 text-on-primary-container font-label-sm text-label-sm"
        >
          发起 3+2 约战
          <UiIcon name="shield" className="h-6 w-6" />
        </Link>
      </div>
    </section>
  );
}
