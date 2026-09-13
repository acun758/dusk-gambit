import knightAzureAsset from "@/assets/avatars/knight-azure.png.asset.json";

/** 玩家统一头像：首页王座卡、对弈玩家条、约战面板共用同一枚水晶骑士。 */
export function PlayerAvatar({ className = "h-9 w-9", label }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center justify-center overflow-hidden shrink-0" aria-hidden={label ? undefined : true}>
      <img
        src={knightAzureAsset.url}
        alt={label ?? ""}
        className={`${className} object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]`}
      />
    </span>
  );
}
