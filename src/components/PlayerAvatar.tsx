import { AVATAR_OPTIONS, avatarKeyForSeed, avatarUrl } from "@/lib/avatar-assets";

/**
 * 玩家头像：尺寸与位置由本组件统一约束，图案来自玩家注册时自选的头像。
 * 未设置时按 seed（玩家名/ID）稳定派生，保证同屏两位玩家不会重复。
 */
export function PlayerAvatar({
  className = "h-9 w-9",
  label,
  avatarKey,
  seed,
}: {
  className?: string | undefined;
  label?: string | undefined;
  avatarKey?: string | null | undefined;
  seed?: string | undefined;
}) {
  const known = avatarKey && AVATAR_OPTIONS.some((a) => a.key === avatarKey) ? avatarKey : null;
  const key = known ?? (seed ? avatarKeyForSeed(seed) : null);
  return (
    <span className="inline-flex items-center justify-center overflow-hidden shrink-0" aria-hidden={label ? undefined : true}>
      <img
        src={avatarUrl(key)}
        alt={label ?? ""}
        className={`${className} object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]`}
      />
    </span>
  );
}
