ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wx_openid TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'h5',
  ADD COLUMN IF NOT EXISTS migrated_from UUID;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_wx_openid_key ON public.profiles (wx_openid) WHERE wx_openid IS NOT NULL;

COMMENT ON COLUMN public.profiles.wx_openid IS '微信小游戏身份（预留，H5 阶段为空）';
COMMENT ON COLUMN public.profiles.platform IS '账号来源平台：h5 / wechat';
COMMENT ON COLUMN public.profiles.migrated_from IS '老账号迁移溯源：来源 profiles.id';