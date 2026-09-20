DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
CREATE POLICY "own roles readable" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

ALTER TABLE public.match_audit ADD COLUMN IF NOT EXISTS severity text NOT NULL DEFAULT 'warn';
ALTER TABLE public.match_audit ADD COLUMN IF NOT EXISTS reported_by uuid;

GRANT SELECT ON public.match_audit TO authenticated;

DROP POLICY IF EXISTS "own audit readable" ON public.match_audit;
CREATE POLICY "own audit readable" ON public.match_audit
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR reported_by = auth.uid());

DROP POLICY IF EXISTS "admins read all audit" ON public.match_audit;
CREATE POLICY "admins read all audit" ON public.match_audit
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.match_audit REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.match_audit;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;