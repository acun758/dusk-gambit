/**
 * src/config/app-config.ts —— 全站唯一配置出口（R4）
 *
 * 后端选型、外部服务地址、引擎参数一律集中在此，禁止在业务代码里硬编码。
 * 小游戏化时只需替换本文件里的取值来源（wx 环境变量 / 云开发配置）。
 */

function viteEnv(key: string): string | undefined {
  try {
    return (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key];
  } catch {
    return undefined;
  }
}

export type BackendProviderId = "default" | "cloud";

/** 后端适配器选型：default = 当前线上云后端，cloud = 微信云开发（骨架） */
export const BACKEND_PROVIDER: BackendProviderId =
  viteEnv("VITE_BACKEND_PROVIDER") === "cloud" ? "cloud" : "default";

/** 外部服务地址（仅服务端使用，客户端不得直连） */
export const ENDPOINTS = {
  /** Lovable AI 网关：复盘讲解等文本生成 */
  aiGateway: "https://ai.gateway.lovable.dev/v1/chat/completions",
  /** FIDE 月度标准棋榜单（服务端定时任务下载解析） */
  fideStandardXmlZip: "https://ratings.fide.com/download/standard_rating_list_xml.zip",
  /** FIDE 女子榜 */
  fideWomenXmlZip: "https://ratings.fide.com/download/women_rating_list_xml.zip",
} as const;

/** 引擎资源与默认搜索参数（将来换 Stockfish WASM 时只改这里） */
export const ENGINE_CONFIG = {
  /** 端内引擎实现标识 */
  implementation: "ashborn-v0.1" as const,
  /** 外部 WASM 引擎资源路径，接入前为空 */
  wasmUrl: viteEnv("VITE_ENGINE_WASM_URL") ?? "",
  defaultDepth: 5,
  defaultMovetimeMs: 600,
  maxMovetimeMs: 2000,
} as const;

/** 存储桶等资源配置 */
export const STORAGE_CONFIG = {
  avatarBucket: "avatars",
} as const;
