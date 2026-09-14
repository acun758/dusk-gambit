import { AVATAR_OPTIONS, avatarKeyForSeed, avatarUrl } from "@/lib/avatar-assets";
import { useAvatarImage } from "@/lib/avatar-upload";

/**
 * 玩家头像：尺寸与位置由本组件统一约束。
 * 优先显示玩家上传的自定义图片，其次是注册时自选的图案，最后按 seed 稳定派生。
 */
export function PlayerAvatar({
  className = "h-9 w-9",
  label,
  avatarKey,
  avatarPath,
  avatarSrc,
  seed,
}: {
  className?: string | undefined;
  label?: string | undefined;
  avatarKey?: string | null | undefined;
  avatarPath?: string | null | undefined;
  /** 已解析好的图片地址（服务端签名，用于对手 / 榜单 / 复盘头像） */
  avatarSrc?: string | null | undefined;
  seed?: string | undefined;
}) {
  const fromPath = useAvatarImage(avatarPath);
  const uploaded = avatarSrc ?? fromPath;
  const known = avatarKey && AVATAR_OPTIONS.some((a) => a.key === avatarKey) ? avatarKey : null;
  const key = known ?? (seed ? avatarKeyForSeed(seed) : null);
  return (
    <span className="inline-flex items-center justify-center overflow-hidden shrink-0" aria-hidden={label ? undefined : true}>
      <img
        src={uploaded ?? avatarUrl(key)}
        alt={label ?? ""}
        className={`${className} ${uploaded ? "object-cover rounded-full" : "object-contain"} drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]`}
      />
    </span>
  );
}
