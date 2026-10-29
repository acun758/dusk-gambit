/**
 * 默认适配器 —— 当前线上云后端。
 *
 * 全工程只有本文件与 realtime.default.ts 直接引用云厂商 SDK。
 * 业务代码一律走 src/data/db.ts（数据）与 src/data/realtime.ts（实时帧）。
 */
import { supabase as sdk } from "@/integrations/supabase/client";
import * as remote from "@/data/game.functions";
import * as puzzleRemote from "@/data/puzzle.functions";
import * as mindRemote from "@/data/mind.functions";
import * as hallRemote from "@/data/hall.functions";
import * as arenaRemote from "@/data/arena.functions";
import * as throneRemote from "@/data/throne.functions";
import type { AuthResult, SessionInfo } from "./types";
import { STORAGE_CONFIG } from "@/config/app-config";

const AVATAR_BUCKET = STORAGE_CONFIG.avatarBucket;

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
    // 长效缓存 24h：头像按时间戳命名（换头像即换路径），可安全长缓存
    const { error } = await sdk.storage
      .from(AVATAR_BUCKET)
      .upload(path, blob, { contentType, upsert: true, cacheControl: "86400" });
    if (error) throw new Error(error.message);
  },

  async fetchAvatarUrl(path: string): Promise<string | null> {
    // 桶已公开：直接用公开地址，浏览器/CDN 可按 cacheControl 长效缓存
    const { data } = sdk.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? null;
  },

  /* --------------------------------- 档案与装备 -------------------------------- */
  fetchProfile: remote.loadProfile,
  renameProfile: remote.renameProfile,
  saveAvatarKey: remote.saveAvatar,
  saveAvatarPath: remote.saveAvatarImage,
  saveEquipment: remote.saveEquipment,

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
  pingMatch: remote.pingMatch,
  amIGuardAdmin: remote.amIGuardAdmin,
  listAuditAlerts: remote.listAuditAlerts,
  fetchOpsStats: remote.fetchOpsStats,
  fetchOpsPlayers: remote.fetchOpsPlayers,
  fetchOpsPlayer: remote.fetchOpsPlayer,
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

  /* -------------------------------- 联网大厅 -------------------------------- */
  fetchArenaRooms: arenaRemote.listArenaRooms,
  createArenaRoom: arenaRemote.createArenaRoom,
  joinArenaRoom: arenaRemote.joinArenaRoom,
  closeArenaRoom: arenaRemote.closeArenaRoom,
  spectateArenaRoom: arenaRemote.spectateArenaRoom,

  /* -------------------------------- 天梯与残局 -------------------------------- */
  fetchLadder: remote.listLadder,
  fetchPromotionSeries: remote.getPromotionSeries,
  fetchPromotionRivals: remote.listPromotionRivals,
  fetchEndgameLevels: remote.listEndgameLevels,
  fetchEndgameProgress: remote.loadEndgameProgress,
  submitEndgame: remote.submitEndgame,
  submitEndgameDrill: remote.submitEndgameDrill,

  /* --------------------------------- 战术谜题 -------------------------------- */
  fetchPuzzles: puzzleRemote.listPuzzles,
  fetchDailyPuzzle: puzzleRemote.getDailyPuzzle,
  submitPuzzleMove: puzzleRemote.submitPuzzleMove,

  /* ------------------------------ 心智战报与名人堂 ----------------------------- */
  analyzeMind: mindRemote.analyzeMind,
  recordMatchReport: mindRemote.recordMatchReport,
  fetchFideRatings: hallRemote.listFideRatings,
  fetchThroneCandidates: throneRemote.listThroneCandidates,
  refreshMyThrone: throneRemote.refreshMyThrone,
  fetchQualifierGames: throneRemote.listQualifierGames,
};
