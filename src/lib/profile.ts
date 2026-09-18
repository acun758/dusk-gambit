import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchProfile as loadProfile,
  fetchSession,
  onSessionChange,
  renameProfile,
  saveAvatarKey as saveAvatar,
  saveAvatarPath as saveAvatarImage,
  saveEquipment,
  submitVerification,
} from "@/data/db";
import { subscribeMyProfile } from "@/data/realtime";
import { uploadAvatar } from "@/lib/avatar-upload";
import { rankOf } from "@/lib/ranks";

export interface PlayerProfile {
  name: string;
  diamonds: number;
  elo: number;
  tier: string;
  tierZh: string;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  trainingPoints: number;
  realName: string;
  avatarKey: string;
  avatarPath: string;
  verifyStatus: "none" | "pending" | "verified" | "rejected";
  idTail: string;
  equippedPieceSet: string;
  /** 定级赛剩余局数；>0 时段位暂不公开 */
  provisionalGames: number;
  /** 是否仍在定级赛中 */
  inPlacement: boolean;
}

/** 访客占位档案：战绩全为 0，段位只在真实对局结算后才会变化。 */
export const DEFAULT_PROFILE: PlayerProfile = {
  name: "Adiamond",
  diamonds: 1280,
  elo: 1000,
  tier: "Pawn",
  tierZh: "兵",
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  trainingPoints: 0,
  realName: "",
  avatarKey: "knight-azure",
  avatarPath: "",
  verifyStatus: "none",
  idTail: "",
  equippedPieceSet: "sovereign",
  provisionalGames: 10,
  inPlacement: true,
};

/** 定级赛文案：未定级前不公开段位，只显示已完成的定级局数。 */
export function placementLabel(p: PlayerProfile): { zh: string; en: string } {
  const played = Math.max(0, 10 - p.provisionalGames);
  return { zh: `定级赛 ${played}/10`, en: `Placement ${played}/10` };
}

/** 全站统一的段位显示：定级赛未打满时不公开段位。 */
export function tierLabel(p: PlayerProfile): { zh: string; en: string } {
  return p.inPlacement ? placementLabel(p) : { zh: p.tierZh, en: p.tier };
}

const KEY = "bs.profile.v1";

export function tierFor(elo: number): { tier: string; tierZh: string } {
  const r = rankOf(elo);
  return { tier: r.en, tierZh: r.zh };
}

export function winRate(p: PlayerProfile): number {
  const total = p.wins + p.losses + p.draws;
  return total === 0 ? 0 : Math.round((p.wins / total) * 1000) / 10;
}

function read(): PlayerProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<PlayerProfile>) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function write(p: PlayerProfile) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent("bs:profile", { detail: p }));
  } catch {
    /* storage unavailable */
  }
}

interface CloudRow {
  name: string;
  diamonds: number;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  training_points: number;
  real_name?: string;
  avatar_key?: string;
  avatar_url?: string;
  verify_status?: string;
  id_tail?: string;
  equipped_piece_set?: string;
  provisional_games?: number;
}

function fromCloud(row: CloudRow): PlayerProfile {
  const { training_points, real_name, avatar_key, avatar_url, verify_status, id_tail, equipped_piece_set, provisional_games, ...profile } = row;
  const pending = Math.max(0, provisional_games ?? 0);
  return {
    ...profile,
    trainingPoints: training_points,
    realName: real_name ?? "",
    avatarKey: avatar_key || "knight-azure",
    avatarPath: avatar_url ?? "",
    verifyStatus: (verify_status as PlayerProfile["verifyStatus"]) || "none",
    idTail: id_tail ?? "",
    equippedPieceSet: equipped_piece_set || "sovereign",
    provisionalGames: pending,
    inPlacement: pending > 0,
    ...tierFor(row.elo),
  };
}

/**
 * 玩家档案：登录后由服务端（Lovable Cloud）作为唯一真源，
 * 未登录时退回本地演示数据，保证页面永远可看。
 */
function useProfileStore() {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    const session = await fetchSession();
    if (!session) {
      setSignedIn(false);
      setProfile(read());
      setLoading(false);
      return;
    }
    setSignedIn(true);
    try {
      const row = (await loadProfile()) as CloudRow;
      setProfile(fromCloud(row));
    } catch {
      setProfile(read());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const sync = (e: Event) => setProfile((e as CustomEvent<PlayerProfile>).detail);
    window.addEventListener("bs:profile", sync);
    const stopAuth = onSessionChange(() => void refresh());
    const stopProfile = subscribeMyProfile(() => void refresh());
    return () => {
      window.removeEventListener("bs:profile", sync);
      stopAuth();
      stopProfile();
    };
  }, [refresh]);

  const rename = useCallback(async (name: string) => {
    const row = (await renameProfile({ data: { name } })) as CloudRow;
    setProfile(fromCloud(row));
  }, []);

  /** 头像变更后广播给全站：对弈玩家条、复盘、段位榜立即换成新头像。 */
  const applyAvatar = useCallback(
    (row: CloudRow) => {
      const next = fromCloud(row);
      setProfile(next);
      try {
        window.dispatchEvent(new CustomEvent("bs:profile", { detail: next }));
      } catch {
        /* SSR */
      }
      void queryClient.invalidateQueries({ queryKey: ["ladder-board"] });
      void queryClient.invalidateQueries({ queryKey: ["promotion-rivals"] });
      void queryClient.invalidateQueries({ queryKey: ["match-review"] });
      void queryClient.invalidateQueries({ queryKey: ["my-matches"] });
    },
    [queryClient],
  );

  const setAvatar = useCallback(
    async (avatarKey: string) => {
      applyAvatar((await saveAvatar({ data: { avatarKey } })) as CloudRow);
    },
    [applyAvatar],
  );

  /** 上传自定义头像图片，成功后立即刷新档案（对弈页玩家条同步更新）。 */
  const setAvatarImage = useCallback(
    async (file: File) => {
      const path = await uploadAvatar(file);
      applyAvatar((await saveAvatarImage({ data: { path } })) as CloudRow);
    },
    [applyAvatar],
  );

  /** 清除自定义头像图片，回到徽章头像。 */
  const clearAvatarImage = useCallback(
    async () => {
      applyAvatar((await saveAvatarImage({ data: { path: "" } })) as CloudRow);
    },
    [applyAvatar],
  );

  const setEquipment = useCallback(async (pieceSetId: string) => {
    const row = (await saveEquipment({ data: { pieceSetId } })) as CloudRow;
    const next = fromCloud(row);
    setProfile(next);
    write(next);
    try {
      window.dispatchEvent(new CustomEvent("bs:profile", { detail: next }));
      window.dispatchEvent(new CustomEvent("bs:piece-set", { detail: pieceSetId }));
    } catch {
      /* SSR */
    }
    void queryClient.invalidateQueries({ queryKey: ["match-review"] });
    void queryClient.invalidateQueries({ queryKey: ["my-matches"] });
  }, [queryClient]);

  /** 实名认证：姓名 + 身份证号，通过后档案显示认证徽章。返回是否已接入实名核验接口。 */
  const verifyIdentity = useCallback(async (realName: string, idNumber: string) => {
    const res = await submitVerification({ data: { realName, idNumber } });
    setProfile(fromCloud(res.profile as unknown as CloudRow));
    return res.mode;
  }, []);


  /** 未登录时的本地结算，仅用于演示；登录后由服务端仲裁写入。 */
  const recordResult = useCallback((outcome: "win" | "loss" | "draw", eloDelta = 8) => {
    const cur = read();
    const elo = cur.elo + (outcome === "win" ? eloDelta : outcome === "loss" ? -eloDelta : 0);
    const next: PlayerProfile = {
      ...cur,
      elo,
      ...tierFor(elo),
      wins: cur.wins + (outcome === "win" ? 1 : 0),
      losses: cur.losses + (outcome === "loss" ? 1 : 0),
      draws: cur.draws + (outcome === "draw" ? 1 : 0),
      streak: outcome === "win" ? cur.streak + 1 : 0,
      diamonds: cur.diamonds + (outcome === "win" ? 25 : 5),
    };
    write(next);
    setProfile(next);
    return next;
  }, []);

  return { profile, signedIn, loading, refresh, rename, setAvatar, setAvatarImage, clearAvatarImage, setEquipment, verifyIdentity, recordResult, winRate: winRate(profile) };
}

type ProfileContextValue = ReturnType<typeof useProfileStore>;
const ProfileContext = createContext<ProfileContextValue | null>(null);

/** One profile store and one realtime subscription serve the entire app. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const value = useProfileStore();
  return createElement(ProfileContext.Provider, { value }, children);
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useProfile must be used inside ProfileProvider");
  return value;
}
