/**
 * src/data/auth.ts —— 身份层抽象（R3）
 *
 * 页面与组件只认这套接口，不得直连任何云厂商 Auth SDK。
 * H5 现在走「邮箱 + 密码」；小游戏将来走 wx.login + openid 静默登录，
 * 届时只需在适配器里换实现，上层零改动。
 */
import { gateway } from "./backend";
import type { AuthResult, SessionInfo, Unsubscribe } from "./backend";

export type AuthPlatform = "h5" | "wechat";

export interface AuthUser {
  userId: string;
  platform: AuthPlatform;
}

export interface AuthProvider {
  /** 当前登录用户；未登录返回 null。 */
  getCurrentUser(): Promise<AuthUser | null>;
  /** 登录：H5 传邮箱密码；小游戏实现里改为静默登录（无参）。 */
  signIn(credentials?: { email: string; password: string }): Promise<AuthResult>;
  /** 注册（小游戏侧无注册概念，实现可直接返回静默登录结果）。 */
  register(credentials: { email: string; password: string; nickname?: string }): Promise<AuthResult>;
  signOut(): Promise<void>;
  /** 登录状态变化，返回退订函数。 */
  onAuthChange(cb: () => void): Unsubscribe;
}

/** 当前平台标识，写档案时用（预留字段 profiles.platform）。 */
export const AUTH_PLATFORM: AuthPlatform = "h5";

export const authProvider: AuthProvider = {
  async getCurrentUser() {
    const session: SessionInfo | null = await gateway.fetchSession();
    return session ? { userId: session.userId, platform: AUTH_PLATFORM } : null;
  },
  async signIn(credentials) {
    if (!credentials) return { error: "当前平台需要邮箱与密码", signedIn: false };
    return gateway.signIn(credentials.email, credentials.password);
  },
  async register({ email, password, nickname }) {
    return gateway.register(email, password, nickname ?? "");
  },
  async signOut() {
    await gateway.signOut();
  },
  onAuthChange(cb) {
    return gateway.onSessionChange(cb);
  },
};

export const getCurrentUser = authProvider.getCurrentUser.bind(authProvider);
export const signIn = authProvider.signIn.bind(authProvider);
export const register = authProvider.register.bind(authProvider);
export const signOut = authProvider.signOut.bind(authProvider);
export const onAuthChange = authProvider.onAuthChange.bind(authProvider);
