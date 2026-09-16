-- 老用户段位分校准脚本（幂等，可重复执行）
--
-- 用途：当天梯分布整体重排时（例如 2400 起步 → 1000 起步），把历史账号的
-- elo 线性映射到新分布，而不是简单截断。本脚本本次线上未执行（库内只有一个
-- 1000 分区间内的账号），入库存档，供将来真实用户量下调分布时直接复用。
--
-- 幂等保证：
--   1. 只对 profiles.elo 仍落在【旧分布区间】的账号生效；
--   2. 每次执行都会把执行痕迹写入 public.ladder_rescale_log，同一个 batch_key
--      只会生效一次（第二次执行影响 0 行）。
--
-- 使用方式：修改 :old_min/:old_max/:new_min/:new_max 与 batch_key 后整段执行。

CREATE TABLE IF NOT EXISTS public.ladder_rescale_log (
  batch_key   text PRIMARY KEY,
  old_min     integer NOT NULL,
  old_max     integer NOT NULL,
  new_min     integer NOT NULL,
  new_max     integer NOT NULL,
  affected    integer NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ladder_rescale_log TO service_role;
ALTER TABLE public.ladder_rescale_log ENABLE ROW LEVEL SECURITY;
-- 运维表：不开放任何客户端访问（无策略 = 仅 service_role 可达）。

DO $$
DECLARE
  v_batch   text    := '2026-09-16-start-2400-to-1000';
  v_old_min integer := 2400;   -- 旧分布起步分
  v_old_max integer := 3000;   -- 旧分布顶端
  v_new_min integer := 1000;   -- 新分布起步分
  v_new_max integer := 2700;   -- 新分布顶端
  v_affected integer := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM public.ladder_rescale_log WHERE batch_key = v_batch) THEN
    RAISE NOTICE '校准批次 % 已执行过，跳过', v_batch;
    RETURN;
  END IF;

  WITH moved AS (
    UPDATE public.profiles p
       SET elo = GREATEST(
                   v_new_min,
                   LEAST(
                     v_new_max,
                     ROUND(v_new_min + (p.elo - v_old_min)::numeric
                           * (v_new_max - v_new_min) / NULLIF(v_old_max - v_old_min, 0))::integer
                   )
                 ),
           updated_at = now()
     WHERE p.elo >= v_old_min
     RETURNING 1
  )
  SELECT count(*) INTO v_affected FROM moved;

  INSERT INTO public.ladder_rescale_log (batch_key, old_min, old_max, new_min, new_max, affected)
  VALUES (v_batch, v_old_min, v_old_max, v_new_min, v_new_max, v_affected);

  RAISE NOTICE '校准批次 % 完成，影响 % 个账号', v_batch, v_affected;
END $$;
