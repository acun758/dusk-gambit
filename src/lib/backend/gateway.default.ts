/**
 * 默认适配器 —— 当前线上云后端。
 *
 * 全工程只有本文件与 realtime.default.ts 直接引用云厂商 SDK。
 * 业务代码一律走 src/lib/db.ts（数据）与 src/lib/realtime.ts（实时帧）。
 */
import { supabase as sdk } from "@/integrations/supabase/client";
import * as remote from "@/lib/game.functions";
import type { AuthResult, SessionInfo } from "./types";

const AVATAR_BUCKET = "avatars";

export const defaultGateway = {
  /* ---------------------------------- 会话 ---------------------------------- */
  async fetchSession(): Promise<SessionInfo | null> {
    const { data } = await sdk.auth.getSession();
    const uid = data.session?.user.id;
    return uid ? { userId: uid } : null;
  },

  async currentUserId(): Promise<string | null> {
    const { data } = await sdk.auth.getUser();
    return data.user?.id ?? null;
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    const res = await sdk.auth.signInWithPassword({ email, password });
    return { error: res.error?.message ?? null, signedIn: !!res.data.session };
  },

  async register(email: string, password: string, redirectTo?: string): Promise<AuthResult> {
    const res = await sdk.auth.signUp({
      email,
      password,
      ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {}),
    });
    return { error: res.error?.message ?? null, signedIn: !!res.data.session };
  },

  async signOut(): Promise<void> {
    await sdk.auth.signOut();
  },

  onSessionChange(handler: () => void): () => void {
    const { data } = sdk.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") handler();
    });
    return () => data.subscription.unsubscribe();
  },

  /* --------------------------------- 头像文件 --------------------------------- */
  async putAvatarFile(path: string, blob: Blob, contentType = "image/webp"): Promise<void> {
    const { error } = await sdk.storage.from(AVATAR_BUCKET).upload(path, blob, { contentType, upsert: true });
    if (error) throw new Error(error.message);
  },

  async fetchAvatarUrl(path: string, ttlSeconds = 3600): Promise<string | null> {
    const { data, error } = await sdk.storage.from(AVATAR_BUCKET).createSignedUrl(path, ttlSeconds);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  },

  /* --------------------------------- 档案与装备 -------------------------------- */
  fetchProfile: remote.loadProfile,
  renameProfile: remote.renameProfile,
  saveAvatarKey: remote.saveAvatar,
  saveAvatarPath: remote.saveAvatarImage,
  saveEquipment: remote.saveEquipment,
  submitVerification: remote.submitVerification,
  saveRealName: remote.saveRealName,
  clearRealName: remote.clearRealName,

  /* ---------------------------------- 对局 ---------------------------------- */
  findMatch: remote.findMatch,
  cancelWaitingMatch: remote.cancelWaitingMatch,
  fetchMatch: remote.getMatch,
  fetchActiveMatch: remote.getActiveMatch,
  submitMove: remote.submitMove,
  resignMatch: remote.resignMatch,
  offerDraw: remote.offerDraw,
  respondDraw: remote.respondDraw,
  claimTimeout: remote.claimTimeout,
  fetchMyMatches: remote.listMyMatches,
  fetchMatchRatings: remote.getMatchRatings,

  /* ---------------------------------- 约战 ---------------------------------- */
  searchPlayers: remote.searchPlayers,
  fetchFriends: remote.loadFriends,
  requestFriend: remote.requestFriend,
  respondFriend: remote.respondFriend,
  createDuelInvite: remote.createDuelInvite,
  joinDuelInvite: remote.joinDuelInvite,
  fetchDuelInvites: remote.listDuelInvites,
  fetchLobbyStats: remote.getLobbyStats,

  /* -------------------------------- 天梯与残局 -------------------------------- */
  fetchLadder: remote.listLadder,
  fetchPromotionSeries: remote.getPromotionSeries,
  fetchPromotionRivals: remote.listPromotionRivals,
  fetchEndgameLevels: remote.listEndgameLevels,
  fetchEndgameProgress: remote.loadEndgameProgress,
  submitEndgame: remote.submitEndgame,
  submitEndgameDrill: remote.submitEndgameDrill,
};
