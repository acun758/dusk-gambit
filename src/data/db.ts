/**
 * src/data/db.ts —— 唯一的数据访问层。
 *
 * 规则：
 *  1. 页面与组件只从这里读写数据，不再直接触碰任何云 SDK；
 *  2. 接口一律用领域名词（fetchProfile / submitMove / fetchLadder），不出现厂商概念；
 *  3. 实时订阅与断网补传不在这里，走 src/data/realtime.ts；
 *  4. 换云开发时只改 src/data/backend/ 下的适配器，本文件与页面零改动。
 */
import { gateway } from "./backend";
import { authProvider } from "./auth";
import { isLinkUp, markOffline, pendingOutbound, queueOutbound, registerOutboundSender } from "./realtime";

export type { AuthResult, SessionInfo } from "./backend";

/* ------------------------- 会话（统一走身份层 auth.ts） ------------------------- */

export type { AuthUser, AuthPlatform, AuthProvider } from "./auth";
export { authProvider, AUTH_PLATFORM } from "./auth";

export async function fetchSession(): Promise<{ userId: string } | null> {
  const user = await authProvider.getCurrentUser();
  return user ? { userId: user.userId } : null;
}
export async function currentUserId(): Promise<string | null> {
  return (await authProvider.getCurrentUser())?.userId ?? null;
}
export async function signIn(email: string, password: string) {
  return authProvider.signIn({ email, password });
}
export async function register(email: string, password: string, redirectTo?: string) {
  return authProvider.register(redirectTo === undefined ? { email, password } : { email, password, redirectTo });
}
export async function signOut(): Promise<void> {
  await authProvider.signOut();
}
/** 登录状态变化（登录 / 退出）。返回退订函数。 */
export const onSessionChange = (cb: () => void) => authProvider.onAuthChange(cb);

export async function isSignedIn(): Promise<boolean> {
  return (await fetchSession()) !== null;
}

/* --------------------------------- 头像文件 --------------------------------- */

/** 上传头像文件。 */
export const putAvatarFile = gateway.putAvatarFile;
/** 把头像对象路径换成可直接显示的临时地址。 */
export const fetchAvatarUrl = gateway.fetchAvatarUrl;

/* --------------------------------- 档案与装备 -------------------------------- */

export const fetchProfile = gateway.fetchProfile;
export const renameProfile = gateway.renameProfile;
export const saveAvatarKey = gateway.saveAvatarKey;
export const saveAvatarPath = gateway.saveAvatarPath;
export const saveEquipment = gateway.saveEquipment;
export const submitVerification = gateway.submitVerification;
export const saveRealName = gateway.saveRealName;
export const clearRealName = gateway.clearRealName;

/* ---------------------------------- 对局 ---------------------------------- */

export const findMatch = gateway.findMatch;
export const cancelWaitingMatch = gateway.cancelWaitingMatch;
export const fetchMatch = gateway.fetchMatch;
export const fetchActiveMatch = gateway.fetchActiveMatch;
export const resignMatch = gateway.resignMatch;
/** 求和：提出或撤回；对手已在求和时视为接受。 */
export const offerDraw = gateway.offerDraw;
/** 回应对手的求和：同意即按和棋结算。 */
export const respondDraw = gateway.respondDraw;
export const claimTimeout = gateway.claimTimeout;
/** 对局在线心跳：上报自己在场，并得知对手是否掉线。 */
export const pingMatch = gateway.pingMatch;
export const amIGuardAdmin = gateway.amIGuardAdmin;
export const listAuditAlerts = gateway.listAuditAlerts;
/** 运营总览统计（仅管理员）。 */
export const fetchOpsStats = gateway.fetchOpsStats;
export const fetchMyMatches = gateway.fetchMyMatches;
export const fetchMatchRatings = gateway.fetchMatchRatings;

/* --------------------------------- 战术谜题 -------------------------------- */

/** 题库与我的闯关进度（不含答案）。 */
export const fetchPuzzles = gateway.fetchPuzzles;
/** 每日一题与连胜天数。 */
export const fetchDailyPuzzle = gateway.fetchDailyPuzzle;
/** 逐步提交作答，由服务端判对错并发放奖励。 */
export const submitPuzzleMove = gateway.submitPuzzleMove;

/* ------------------------------- 心智战报与名人堂 ------------------------------ */

/** 未登录也能看的心智战报：服务端算，不存档。 */
export const analyzeMind = gateway.analyzeMind;
/** 登录用户的战报：服务端算完存档，并返回与历史、段位均值的对比。 */
export const recordMatchReport = gateway.recordMatchReport;
/** 名人堂榜单（库内月度快照，客户端不直连外部榜单站点）。 */
export const fetchFideRatings = gateway.fetchFideRatings;

type SubmitMoveArgs = Parameters<typeof gateway.submitMove>[0];
type SubmitMoveResult = Awaited<ReturnType<typeof gateway.submitMove>>;
/** 断网时排队的落子，队列里等着补传。 */
export interface QueuedMove {
  code: "queued";
  queued: number;
}

const MOVE_KIND = "move";

// 恢复联网后由 realtime.ts 按原顺序补传；服务端仍是唯一权威，
// 迟到的落子若已不合法会被服务端拒绝，界面随后靠实时帧回到最新局面。
registerOutboundSender<SubmitMoveArgs>(MOVE_KIND, async (args) => {
  await gateway.submitMove(args);
});

function looksOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * 落子（接口签名保持不变）。
 * 在线直传；断网则落盘排队，返回 { code: "queued" }，恢复后自动原序补传。
 */
export async function submitMove(args: SubmitMoveArgs): Promise<SubmitMoveResult | QueuedMove> {
  if (!isLinkUp() || looksOffline() || pendingOutbound(MOVE_KIND) > 0) {
    // 补传时序号/局面早已过期，去掉一致性声明，交由服务端重新裁定合法性
    const { expectedSeq: _s, baseFen: _f, ...rest } = args as SubmitMoveArgs & { expectedSeq?: number; baseFen?: string };
    queueOutbound(MOVE_KIND, rest as SubmitMoveArgs);
    return { code: "queued", queued: pendingOutbound(MOVE_KIND) };
  }
  try {
    return await gateway.submitMove(args);
  } catch (err) {
    if (looksOffline()) {
      markOffline();
      queueOutbound(MOVE_KIND, args);
      return { code: "queued", queued: pendingOutbound(MOVE_KIND) };
    }
    throw err;
  }
}

/** 还有多少手在等补传（界面提示用）。 */
export function pendingMoves(): number {
  return pendingOutbound(MOVE_KIND);
}

/* ---------------------------------- 约战 ---------------------------------- */

export const searchPlayers = gateway.searchPlayers;
export const fetchFriends = gateway.fetchFriends;
export const requestFriend = gateway.requestFriend;
export const respondFriend = gateway.respondFriend;
export const createDuelInvite = gateway.createDuelInvite;
export const joinDuelInvite = gateway.joinDuelInvite;
export const fetchDuelInvites = gateway.fetchDuelInvites;
export const fetchLobbyStats = gateway.fetchLobbyStats;

/* --------------------------------- 联网大厅 -------------------------------- */

/** 公开房间与我参与的房间（服务端顺带清理超时房）。 */
export const fetchArenaRooms = gateway.fetchArenaRooms;
/** 建房：执子、公开性、时制与积分门槛由服务端校验。 */
export const createArenaRoom = gateway.createArenaRoom;
/** 加入房间（房号或短码），服务端原子判定先到先得。 */
export const joinArenaRoom = gateway.joinArenaRoom;
/** 房主取消尚未开始的房间。 */
export const closeArenaRoom = gateway.closeArenaRoom;

/* -------------------------------- 天梯与残局 -------------------------------- */

export const fetchLadder = gateway.fetchLadder;
export const fetchPromotionSeries = gateway.fetchPromotionSeries;
export const fetchPromotionRivals = gateway.fetchPromotionRivals;
export const fetchEndgameLevels = gateway.fetchEndgameLevels;
export const fetchEndgameProgress = gateway.fetchEndgameProgress;
export const submitEndgame = gateway.submitEndgame;
export const submitEndgameDrill = gateway.submitEndgameDrill;
