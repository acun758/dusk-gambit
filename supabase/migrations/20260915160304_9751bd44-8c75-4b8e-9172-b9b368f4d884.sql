CREATE OR REPLACE FUNCTION public.side_can_win(p_fen text, p_side text)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
AS $$
DECLARE
  board text;
  ch text;
  i integer;
  r integer := 0;
  f integer := 0;
  bishops_light integer := 0;
  bishops_dark integer := 0;
  knights integer := 0;
  heavy integer := 0;
BEGIN
  board := split_part(coalesce(p_fen, ''), ' ', 1);
  IF board = '' THEN RETURN true; END IF; -- 无法判断时保持判负（不误判和棋）

  FOR i IN 1..length(board) LOOP
    ch := substring(board from i for 1);
    IF ch = '/' THEN
      r := r + 1;
      f := 0;
      CONTINUE;
    END IF;
    IF ch ~ '[0-9]' THEN
      f := f + ch::integer;
      CONTINUE;
    END IF;
    IF (p_side = 'w' AND ch ~ '[A-Z]') OR (p_side = 'b' AND ch ~ '[a-z]') THEN
      CASE upper(ch)
        WHEN 'K' THEN NULL;
        WHEN 'P', 'R', 'Q' THEN heavy := heavy + 1;
        WHEN 'B' THEN
          IF (r + f) % 2 = 0 THEN bishops_light := bishops_light + 1;
          ELSE bishops_dark := bishops_dark + 1; END IF;
        WHEN 'N' THEN knights := knights + 1;
        ELSE NULL;
      END CASE;
    END IF;
    f := f + 1;
  END LOOP;

  IF heavy > 0 THEN RETURN true; END IF;
  IF knights + bishops_light + bishops_dark = 0 THEN RETURN false; END IF; -- 单王
  IF knights = 0 AND (bishops_light = 0 OR bishops_dark = 0) THEN RETURN false; END IF; -- 同色象
  IF bishops_light + bishops_dark = 0 AND knights <= 2 THEN RETURN false; END IF; -- 单马/双马
  RETURN true;
END;
$$;