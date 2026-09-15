import { useEffect, useState } from "react";
import { currentUserId, fetchAvatarUrl, putAvatarFile } from "@/lib/db";

/**
 * 自定义头像：本地裁成正方形并压到 512×512 后上传到私有桶，
 * 档案里只保存对象路径，显示时换取签名链接（带内存缓存）。
 */

const cache = new Map<string, string>();

export async function compressSquare(file: File, size = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
  if (!blob) throw new Error("compress failed");
  return blob;
}

/** 上传头像，返回存储路径（profiles.avatar_url 里保存的值）。 */
export async function uploadAvatar(file: File): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error("请先登录后再上传头像");
  const blob = await compressSquare(file);
  const path = `${uid}/avatar-${Date.now()}.webp`;
  await putAvatarFile(path, blob);
  cache.delete(path);
  return path;
}

export async function avatarSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const hit = cache.get(path);
  if (hit) return hit;
  const url = await fetchAvatarUrl(path);
  if (!url) return null;
  cache.set(path, url);
  return url;
}

/** 把存储路径解析成可直接放进 <img> 的地址，未设置时返回 null。 */
export function useAvatarImage(path?: string | null): string | null {
  const [url, setUrl] = useState<string | null>(path ? (cache.get(path) ?? null) : null);
  useEffect(() => {
    let alive = true;
    if (!path) {
      setUrl(null);
      return;
    }
    void avatarSignedUrl(path).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [path]);
  return url;
}
