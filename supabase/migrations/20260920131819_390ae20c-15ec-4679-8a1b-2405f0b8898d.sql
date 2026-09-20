ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS white_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS black_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS white_move_at timestamptz,
  ADD COLUMN IF NOT EXISTS black_move_at timestamptz;

CREATE TABLE IF NOT EXISTS public.match_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id uuid,
  kind text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.match_audit TO service_role;

ALTER TABLE public.match_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit service only" ON public.match_audit
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS match_audit_match_idx ON public.match_audit(match_id, created_at DESC);
