import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadProfile, renameProfile } from "@/lib/game.functions";

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
}

export const DEFAULT_PROFILE: PlayerProfile = {
  name: "Adiamond",
  diamonds: 1280,
  elo: 2480,
  tier: "Grandmaster",
  tierZh: "宗师",
  wins: 148,
  losses: 62,
  draws: 19,
  streak: 5,
  trainingPoints: 0,
};

const KEY = "bs.profile.v1";

export function tierFor(elo: number): { tier: string; tierZh: string } {
  if (elo >= 2600) return { tier: "Sovereign", tierZh: "血誓君主" };
  if (elo >= 2500) return { tier: "Apex", tierZh: "神圣大宗师" };
  if (elo >= 2400) return { tier: "Grandmaster", tierZh: "宗师" };
  if (elo >= 2200) return { tier: "Master", tierZh: "大师" };
  return { tier: "Knight", tierZh: "骑士" };
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
}

function fromCloud(row: CloudRow): PlayerProfile {
  const { training_points, ...profile } = row;
  return { ...profile, trainingPoints: training_points, ...tierFor(row.elo) };
}

/**
 * 玩家档案：登录后由服务端（Lovable Cloud）作为唯一真源，
 * 未登录时退回本地演示数据，保证页面永远可看。
 */
export function useProfile() {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
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
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void refresh();
    });
    // 每个组件实例独立频道，避免多处同时使用 useProfile 时重复订阅报错
    const channel = supabase.channel(`my-profile-live-${Math.random().toString(36).slice(2)}`).on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles" },
      () => void refresh(),
    ).subscribe();
    return () => {
      window.removeEventListener("bs:profile", sync);
      sub.subscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const rename = useCallback(async (name: string) => {
    const row = (await renameProfile({ data: { name } })) as CloudRow;
    setProfile(fromCloud(row));
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

  return { profile, signedIn, loading, refresh, rename, recordResult, winRate: winRate(profile) };
}
