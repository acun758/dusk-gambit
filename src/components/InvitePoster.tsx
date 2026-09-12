import { Link } from "@tanstack/react-router";
import poster from "@/assets/invite-poster.jpg";
import { useProfile } from "@/lib/profile";

const TIER_ICON: Record<string, string> = {
  Sovereign: "crown",
  Apex: "workspace_premium",
  Grandmaster: "military_tech",
  Master: "shield",
  Knight: "swords",
};

/** 邀请对弈海报：段位徽章 + 当前积分，首页与天梯页共用。 */
export function InvitePoster({ compact = false }: { compact?: boolean }) {
  const { profile, winRate } = useProfile();
  const icon = TIER_ICON[profile.tier] ?? "swords";
  return (
    <section aria-label="邀请对弈" className="relative w-full overflow-hidden gold-hairline bg-surface-container-lowest">
      <img
        src={poster}
        alt="血誓王权邀请对弈海报"
        loading="lazy"
        width={1536}
        height={864}
        className={`w-full object-cover ${compact ? "h-44 sm:h-52" : "h-52 sm:h-64 lg:h-72"}`}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/95 via-surface-container-lowest/70 to-transparent" />
      <div className="absolute inset-0 p-space-md flex flex-col justify-center gap-1 max-w-[68%]">
        <span className="cjk font-label-sm text-label-sm tracking-[0.3em] text-primary">邀 战 书</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-secondary text-[28px]" aria-hidden="true">{icon}</span>
          <h2 className="cjk font-headline-sm text-headline-sm text-on-surface truncate">{profile.tierZh}</h2>
        </div>
        <p className="font-label-md text-label-md text-on-surface-variant tabular-nums">
          {profile.elo} 分 · 胜率 {winRate}% · ♦ {profile.diamonds}
        </p>
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant">系统按段位就近匹配，段位相近者优先。</p>
        <Link
          to="/battle"
          className="cjk mt-1 inline-flex min-h-11 w-fit items-center gap-1 bg-primary-container px-4 text-on-primary-container font-label-sm text-label-sm"
        >
          发起 3+2 约战
          <span className="material-symbols-outlined text-secondary text-[18px]">swords</span>
        </Link>
      </div>
    </section>
  );
}
