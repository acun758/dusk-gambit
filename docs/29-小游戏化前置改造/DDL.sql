-- 29 号文档 R3：账号迁移预留字段（已在云端执行，2026-09-18）
-- 只加字段，不改任何现有数据与玩法。

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wx_openid TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'h5',
  ADD COLUMN IF NOT EXISTS migrated_from UUID;

-- 同一个微信身份只能绑定一个档案；H5 账号 wx_openid 为空，不受唯一约束影响。
CREATE UNIQUE INDEX IF NOT EXISTS profiles_wx_openid_key
  ON public.profiles (wx_openid) WHERE wx_openid IS NOT NULL;

COMMENT ON COLUMN public.profiles.wx_openid     IS '微信小游戏身份（预留，H5 阶段为空）';
COMMENT ON COLUMN public.profiles.platform      IS '账号来源平台：h5 / wechat';
COMMENT ON COLUMN public.profiles.migrated_from IS '老账号迁移溯源：来源 profiles.id';

-- 说明：
-- 1) 现有行 platform 自动取默认值 'h5'，wx_openid / migrated_from 为 NULL；
-- 2) 未新增任何 RLS 策略变更，profiles 原有策略与授权保持不变；
-- 3) 迁移策略（将来）：微信首登 → 按 wx_openid 查档案，命中则登录，
--    未命中且用户提供 H5 账号凭证 → 新建 wechat 档案并写 migrated_from 指向原档案，
--    积分/段位/钻石由服务端一次性搬运，客户端无权写入。
