/**
 * 云开发适配器（占位骨架）—— 接口已就位，实现待接。
 *
 * 用法：把 VITE_BACKEND_PROVIDER 设为 "cloud"，本文件即接管全部数据读写。
 * 迁移步骤：
 *   1. 在 initCloud() 里初始化云开发 SDK（环境 ID 走环境变量，不写死）；
 *   2. 在 implemented 里逐个补方法，名字与签名必须与默认适配器完全一致
 *      （submitMove / claimTimeout / settle 闭环尤其不可改名改参）；
 *   3. 未补齐的方法会抛 BackendNotWiredError，便于一眼看出还差哪些。
 *
 * 红线不变：权威时钟、判负与结算仍在服务端（云函数）里做，客户端只做显示计算。
 */
import { BackendNotWiredError, type DataGateway, type DuelFrameHandlers, type RealtimeGateway } from "./types";

const PROVIDER = "cloud";

/** 已接好的方法写在这里，键名必须与默认适配器一致。 */
const implemented: Partial<DataGateway> = {
  // TODO 会话：fetchSession / currentUserId / signIn / register / signOut / onSessionChange
  // TODO 档案：fetchProfile / renameProfile / saveAvatarKey / saveEquipment ...
  // TODO 对局：findMatch / fetchMatch / submitMove / claimTimeout / resignMatch ...
  // TODO 天梯与残局：fetchLadder / fetchEndgameLevels / submitEndgameDrill ...
};

export const cloudGateway: DataGateway = new Proxy({} as DataGateway, {
  get(_target, prop: string) {
    const hit = (implemented as Record<string, unknown>)[prop];
    if (hit) return hit;
    return () => {
      throw new BackendNotWiredError(prop, PROVIDER);
    };
  },
});

/** 云开发的实时能力（watch / 订阅）待接；未接入前返回空订阅，页面不会崩。 */
export const cloudRealtime: RealtimeGateway = {
  onLadderChanged() {
    return () => {};
  },
  onMyProfileChanged() {
    return () => {};
  },
  onDuelFrames<M, V>(_matchId: string, _handlers: DuelFrameHandlers<M, V>) {
    return () => {};
  },
};
