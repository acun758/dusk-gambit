/**
 * src/lib/db.ts —— 唯一的数据访问层。
 *
 * 规则：
 *  1. 页面与组件只从这里读写数据，不再直接触碰任何云 SDK；
 *  2. 接口一律用领域名词（fetchProfile / submitMove / fetchLadder），不出现厂商概念；
 *  3. 实时订阅与断网补传不在这里，走 src/lib/realtime.ts；
 *  4. 换云开发时只改 src/lib/backend/ 下的适配器，本文件与页面零改动。
 */
import { gateway } from "./backend";
import { isLinkUp, markOffline, pendingOutbound, queueOutbound, registerOutboundSender } from "./realtime";

export type { AuthResult, SessionInfo } from "./backend";

/* ---------------------------------- 会话 ---------------------------------- */

export const fetchSession = gateway.fetchSession;
export const currentUserId = gateway.currentUserId;
export const signIn = gateway.signIn;
export const register = gateway.register;
export const signOut = gateway.signOut;
/** 登录状态变化（登录 / 退出）。返回退订函数。 */
export const onSessionChange = gateway.onSessionChange;

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
export const fetchMyMatches = gateway.fetchMyMatches;
export const fetchMatchRatings = gateway.fetchMatchRatings;

/* --------------------------------- 战术谜题 -------------------------------- */

/** 题库与我的闯关进度（不含答案）。 */
export const fetchPuzzles = gateway.fetchPuzzles;
/** 每日一题与连胜天数。 */
export const fetchDailyPuzzle = gateway.fetchDailyPuzzle;
/** 逐步提交作答，由服务端判对错并发放奖励。 */
export const submitPuzzleMove = gateway.submitPuzzleMove;

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
    queueOutbound(MOVE_KIND, args);
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

/* -------------------------------- 天梯与残局 -------------------------------- */

export const fetchLadder = gateway.fetchLadder;
export const fetchPromotionSeries = gateway.fetchPromotionSeries;
export const fetchPromotionRivals = gateway.fetchPromotionRivals;
export const fetchEndgameLevels = gateway.fetchEndgameLevels;
export const fetchEndgameProgress = gateway.fetchEndgameProgress;
export const submitEndgame = gateway.submitEndgame;
export const submitEndgameDrill = gateway.submitEndgameDrill;
