import { useCallback, useEffect, useState } from "react";

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

/**
 * Local-first profile store. When the account service is online, swap `read`/`write`
 * for the `/api/public/profile` contract documented in docs/duel-integration.md —
 * the component API stays identical.
 */
export function useProfile() {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    setProfile(read());
    const sync = (e: Event) => setProfile((e as CustomEvent<PlayerProfile>).detail);
    window.addEventListener("bs:profile", sync);
    return () => window.removeEventListener("bs:profile", sync);
  }, []);

  const update = useCallback((patch: Partial<PlayerProfile>) => {
    const next = { ...read(), ...patch };
    write(next);
    setProfile(next);
  }, []);

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

  const reset = useCallback(() => {
    write(DEFAULT_PROFILE);
    setProfile(DEFAULT_PROFILE);
  }, []);

  return { profile, update, recordResult, reset, winRate: winRate(profile) };
}
