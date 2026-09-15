/**
 * src/lib/db.ts —— 唯一的数据访问层。
 *
 * 规则：
 *  1. 页面与组件只从这里读写数据，不再直接触碰任何云 SDK；
 *  2. 接口一律用领域名词（fetchProfile / submitMove / fetchLadder），不出现厂商概念；
 *  3. 实时订阅不在这里，走 src/lib/realtime.ts；
 *  4. 换微信云开发时，只改本文件与 backend.ts 的内部实现。
 */
import { backend } from "./backend";
import * as remote from "./game.functions";

/* ---------------------------------- 会话 ---------------------------------- */

export interface SessionInfo {
  userId: string;
}

export async function fetchSession(): Promise<SessionInfo | null> {
  const { data } = await backend.auth.getSession();
  const uid = data.session?.user.id;
  return uid ? { userId: uid } : null;
}

export async function isSignedIn(): Promise<boolean> {
  return (await fetchSession()) !== null;
}

export async function currentUserId(): Promise<string | null> {
  const { data } = await backend.auth.getUser();
  return data.user?.id ?? null;
}

export interface AuthResult {
  error: string | null;
  signedIn: boolean;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const res = await backend.auth.signInWithPassword({ email, password });
  return { error: res.error?.message ?? null, signedIn: !!res.data.session };
}

export async function register(email: string, password: string, redirectTo?: string): Promise<AuthResult> {
  const res = await backend.auth.signUp({
    email,
    password,
    ...(redirectTo ? { options: { emailRedirectTo: redirectTo } } : {}),
  });
  return { error: res.error?.message ?? null, signedIn: !!res.data.session };
}

export async function signOut(): Promise<void> {
  await backend.auth.signOut();
}

/** 登录状态变化（登录 / 退出）。返回退订函数。 */
export function onSessionChange(handler: () => void): () => void {
  const { data } = backend.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") handler();
  });
  return () => data.subscription.unsubscribe();
}

/* --------------------------------- 头像文件 --------------------------------- */

const AVATAR_BUCKET = "avatars";

/** 上传头像文件，返回对象路径。 */
export async function putAvatarFile(path: string, blob: Blob, contentType = "image/webp"): Promise<void> {
  const { error } = await backend.storage.from(AVATAR_BUCKET).upload(path, blob, { contentType, upsert: true });
  if (error) throw new Error(error.message);
}

/** 把头像对象路径换成可直接显示的临时地址。 */
export async function fetchAvatarUrl(path: string, ttlSeconds = 3600): Promise<string | null> {
  const { data, error } = await backend.storage.from(AVATAR_BUCKET).createSignedUrl(path, ttlSeconds);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/* --------------------------------- 档案与装备 -------------------------------- */

export const fetchProfile = remote.loadProfile;
export const renameProfile = remote.renameProfile;
export const saveAvatarKey = remote.saveAvatar;
export const saveAvatarPath = remote.saveAvatarImage;
export const saveEquipment = remote.saveEquipment;
export const submitVerification = remote.submitVerification;
export const saveRealName = remote.saveRealName;
export const clearRealName = remote.clearRealName;

/* ---------------------------------- 对局 ---------------------------------- */

export const findMatch = remote.findMatch;
export const cancelWaitingMatch = remote.cancelWaitingMatch;
export const fetchMatch = remote.getMatch;
export const fetchActiveMatch = remote.getActiveMatch;
export const submitMove = remote.submitMove;
export const resignMatch = remote.resignMatch;
export const claimTimeout = remote.claimTimeout;
export const fetchMyMatches = remote.listMyMatches;
export const fetchMatchRatings = remote.getMatchRatings;

/* ---------------------------------- 约战 ---------------------------------- */

export const searchPlayers = remote.searchPlayers;
export const fetchFriends = remote.loadFriends;
export const requestFriend = remote.requestFriend;
export const respondFriend = remote.respondFriend;
export const createDuelInvite = remote.createDuelInvite;
export const joinDuelInvite = remote.joinDuelInvite;
export const fetchDuelInvites = remote.listDuelInvites;
export const fetchLobbyStats = remote.getLobbyStats;

/* -------------------------------- 天梯与残局 -------------------------------- */

export const fetchLadder = remote.listLadder;
export const fetchPromotionSeries = remote.getPromotionSeries;
export const fetchPromotionRivals = remote.listPromotionRivals;
export const fetchEndgameLevels = remote.listEndgameLevels;
export const fetchEndgameProgress = remote.loadEndgameProgress;
export const submitEndgame = remote.submitEndgame;
export const submitEndgameDrill = remote.submitEndgameDrill;
