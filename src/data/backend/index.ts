/**
 * 后端适配层入口 —— 选哪家云，只在这里决定。
 *
 * VITE_BACKEND_PROVIDER = "cloud" 时切到云开发适配器，其余情况走当前默认后端。
 * 上层（db.ts / realtime.ts / 页面）永远只认领域接口，不认厂商。
 */
import { defaultGateway } from "./gateway.default";
import { defaultRealtime } from "./realtime.default";
import { cloudGateway, cloudRealtime } from "./gateway.cloud";
import type { DataGateway, RealtimeGateway } from "./types";
import { BACKEND_PROVIDER } from "@/config/app-config";

export type BackendProvider = "default" | "cloud";

export const provider: BackendProvider = BACKEND_PROVIDER;

export const gateway: DataGateway = provider === "cloud" ? cloudGateway : defaultGateway;
export const realtimeGateway: RealtimeGateway = provider === "cloud" ? cloudRealtime : defaultRealtime;

export type {
  ArenaPresencePlayer,
  ArenaPresenceSelf,
  AuthResult,
  DataGateway,
  DuelFrameHandlers,
  RealtimeGateway,
  SessionInfo,
  Unsubscribe,
} from "./types";
export { BackendNotWiredError } from "./types";
