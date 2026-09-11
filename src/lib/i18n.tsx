import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "zh" | "en";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (zh: string, en: string) => string;
}

const Ctx = createContext<LangCtx>({ lang: "zh", setLang: () => {}, t: (zh) => zh });
const KEY = "bs.lang.v1";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY) as Lang | null;
      if (saved === "zh" || saved === "en") setLangState(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<LangCtx>(
    () => ({ lang, setLang, t: (zh: string, en: string) => (lang === "zh" ? zh : en) }),
    [lang, setLang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

/** 双语文本：主语言在前，副语言以小字跟随。 */
export function Bi({
  zh,
  en,
  className = "",
  subClassName = "",
  block = false,
}: {
  zh: string;
  en: string;
  className?: string;
  subClassName?: string;
  block?: boolean;
}) {
  const { lang } = useLang();
  const primary = lang === "zh" ? zh : en;
  const secondary = lang === "zh" ? en : zh;
  return (
    <span className={`${block ? "flex flex-col" : "inline-flex items-baseline gap-1.5"} min-w-0 ${className}`}>
      <span className={lang === "zh" ? "cjk" : ""}>{primary}</span>
      <span className={`opacity-60 text-[0.72em] tracking-wider ${lang === "en" ? "cjk" : ""} ${subClassName}`}>
        {secondary}
      </span>
    </span>
  );
}

/** 只取当前语言的一行文本。 */
export function useT() {
  return useLang().t;
}
