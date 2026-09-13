import { useRef, useState } from "react";
import { AVATAR_OPTIONS } from "@/lib/avatar-assets";
import { useAvatarImage } from "@/lib/avatar-upload";
import { useT } from "@/lib/i18n";
import { UiIcon } from "@/components/UiIcon";

/**
 * 头像选择器：12 枚预设图案 + 上传自己的图片。
 * 上传由外部注入（注册页先存本地、登录后再上传；档案页直接上传）。
 */
export function AvatarPicker({
  value,
  onSelect,
  uploadedPath,
  onUpload,
  uploading = false,
  error,
}: {
  value: string;
  onSelect: (key: string) => void;
  uploadedPath?: string | null;
  onUpload?: ((file: File) => void | Promise<void>) | undefined;
  uploading?: boolean;
  error?: string | null;
}) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const uploaded = useAvatarImage(uploadedPath ?? null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const preview = localPreview ?? uploaded;
  const usingUpload = value === "upload" && Boolean(preview);

  return (
    <div className="flex flex-col gap-2">
      <span className="cjk font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
        {t("选择头像（对局中显示）", "Choose your avatar")}
      </span>
      <div className="grid grid-cols-6 gap-2">
        {AVATAR_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            aria-label={t(option.zh, option.en)}
            aria-pressed={value === option.key}
            className={`aspect-square flex items-center justify-center bg-surface-container p-1 ${value === option.key ? "gold-hairline opacity-100" : "opacity-60 hover:opacity-90"}`}
          >
            <img src={option.url} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          aria-label={t("上传我的头像", "Upload your photo")}
          aria-pressed={usingUpload}
          className={`aspect-square flex items-center justify-center overflow-hidden bg-surface-container p-1 ${usingUpload ? "gold-hairline opacity-100" : "opacity-70 hover:opacity-100"}`}
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <UiIcon name="camera" className="h-6 w-6" />
          )}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setLocalPreview(URL.createObjectURL(file));
          onSelect("upload");
          void onUpload?.(file);
        }}
      />
      <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
        {uploading
          ? t("头像上传中…", "Uploading…")
          : t("支持上传自己的图片，自动裁成正方形并压缩，随时可在个人资料里更换。", "Upload your own photo; it is cropped square and can be changed anytime in your profile.")}
      </p>
      {error && <p className="cjk font-body-sm text-body-sm text-primary">{error}</p>}
    </div>
  );
}
