/**
 * 云厂商适配层 —— 全工程唯一直接引用云 SDK 的文件。
 *
 * 业务代码一律走 src/lib/db.ts（数据读写）与 src/lib/realtime.ts（实时帧）。
 * 将来换微信云开发，只需替换本文件与这两个模块的内部实现，页面零改动。
 */
import { supabase } from "@/integrations/supabase/client";

export const backend = supabase;
export type BackendChannel = ReturnType<typeof supabase.channel>;
