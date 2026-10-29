CREATE OR REPLACE FUNCTION public.throne_award_season(p_at timestamptz DEFAULT now()) RETURNS integer LANGUAGE sql STABLE SET search_path=public AS $$ SELECT CASE WHEN p_at < timestamptz '2027-10-02 00:00:00+08' THEN 2026 ELSE extract(year FROM p_at AT TIME ZONE 'UTC')::integer END $$;
CREATE OR REPLACE FUNCTION public.throne_period_start(p_season integer) RETURNS timestamptz LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT CASE WHEN p_season=2027 THEN timestamptz '2027-10-02 00:00:00+08' ELSE make_timestamptz(p_season,1,1,0,0,0,'UTC') END $$;
CREATE OR REPLACE FUNCTION public.throne_period_end(p_season integer) RETURNS timestamptz LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT CASE WHEN p_season=2026 THEN timestamptz '2027-10-02 00:00:00+08' ELSE make_timestamptz(p_season+1,1,1,0,0,0,'UTC') END $$;
REVOKE ALL ON FUNCTION public.throne_award_season(timestamptz), public.throne_period_start(integer), public.throne_period_end(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.throne_award_season(timestamptz), public.throne_period_start(integer), public.throne_period_end(integer) TO service_role;
DO $$
DECLARE definition text;
BEGIN
  SELECT pg_get_functiondef('public.compute_throne_candidate(uuid,integer)'::regprocedure) INTO definition;
  IF position('make_timestamptz(s+1,1,1,0,0,0,''UTC'')' IN definition)=0 THEN RAISE EXCEPTION 'Unexpected throne period definition'; END IF;
  definition := replace(definition, 'coalesce(p_season, extract(year FROM now())::integer)', 'coalesce(p_season, public.throne_award_season())');
  definition := replace(definition, 'make_timestamptz(s,1,1,0,0,0,''UTC'')', 'public.throne_period_start(s)');
  definition := replace(definition, 'make_timestamptz(s+1,1,1,0,0,0,''UTC'')', 'public.throne_period_end(s)');
  definition := replace(definition, 'IF ok AND qa IS NULL THEN', 'IF ok AND qa IS NULL AND now() < y1 THEN');
  EXECUTE definition;
  SELECT pg_get_functiondef('public.refresh_throne_all(integer)'::regprocedure) INTO definition;
  definition := replace(definition, 'coalesce(p_season, extract(year FROM now())::integer)', 'coalesce(p_season, public.throne_award_season())');
  definition := replace(definition, 'make_timestamptz(s,1,1,0,0,0,''UTC'')', 'public.throne_period_start(s)');
  EXECUTE definition;
END $$;
REVOKE ALL ON FUNCTION public.compute_throne_candidate(uuid,integer),public.refresh_throne_all(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_throne_candidate(uuid,integer),public.refresh_throne_all(integer) TO service_role;