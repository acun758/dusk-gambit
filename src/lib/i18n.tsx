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

/** 双语切换开关：中文主标题 / 英文主标题互换，页眉始终中英并列。 */
export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      aria-label="切换语言 / Switch language"
      title="中英文页眉切换 / Switch header language"
      className={`shrink-0 h-9 px-space-sm bg-surface-container-high text-secondary font-label-sm text-label-sm tracking-widest uppercase hover:bg-surface-container-highest transition-colors ${className}`}
    >
      {lang === "zh" ? "中 / EN" : "EN / 中"}
    </button>
  );
}

