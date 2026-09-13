import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Bi, useT } from "@/lib/i18n";
import { GameIcon } from "@/components/GameIcon";
import { UiIcon } from "@/components/UiIcon";
import { saveAvatar, saveAvatarImage, submitVerification } from "@/lib/game.functions";
import { DEFAULT_AVATAR_KEY } from "@/lib/avatar-assets";
import { AvatarPicker } from "@/components/AvatarPicker";
import { uploadAvatar } from "@/lib/avatar-upload";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "血誓登录 · 王座殿堂 | Sovereign Sign In" },
      { name: "description", content: "登录血誓王权，同步段位、钻石与天梯战绩。Sign in to sync your rank, diamonds and ranked record." },
      { property: "og:title", content: "血誓登录 · 王座殿堂 | Sovereign Sign In" },
      { property: "og:description", content: "登录血誓王权，同步段位、钻石与天梯战绩。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const REAL_NAME_KEY = "bs.realname.v1";
const AVATAR_KEY = "bs.avatar.v1";

function AuthPage() {
  const navigate = useNavigate();
  const t = useT();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR_KEY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      setRealName(window.localStorage.getItem(REAL_NAME_KEY) ?? "");
      setAvatar(window.localStorage.getItem(AVATAR_KEY) ?? DEFAULT_AVATAR_KEY);
    } catch {
      /* storage unavailable */
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    setBusy(false);
    if (res.error) {
      setMsg(res.error.message);
      return;
    }
    if (res.data.session) {
      try {
        window.localStorage.setItem(AVATAR_KEY, avatar);
      } catch {
        /* storage unavailable */
      }
      await saveAvatar({ data: { avatarKey: avatar } }).catch(() => null);
      const name = realName.trim();
      let verified = false;
      if (name.length >= 2) {
        try {
          window.localStorage.setItem(REAL_NAME_KEY, name);
        } catch {
          /* storage unavailable */
        }
        const saved = await saveRealName({ data: { realName: name } }).catch(() => null);
        verified = Boolean(saved);
      }
      // 实名完成后直接进入约战大厅并自动按段位就近排队
      if (verified) window.location.assign("/battle?lobby=1");
      else void navigate({ to: "/" });
    } else setMsg(t("请到邮箱确认后再登录。", "Check your inbox to confirm, then sign in."));
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setBusy(false);
      setMsg(result.error.message);
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/" });
  }

  return (
    <div className="themed-page text-on-surface min-h-screen flex items-center justify-center px-margin-mobile py-space-lg">
      <ThemeBackdrop theme="gothic" />
      <div className="w-full max-w-sm bg-surface-container-low p-space-lg flex flex-col gap-space-md gold-hairline">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-on-surface-variant">
            Blood Sovereign
          </span>
          <h1 className="font-headline-md text-headline-md text-secondary">
            <Bi zh="血誓登录" en="Sovereign Sign In" block />
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            <Bi zh="登录后段位、钻石与天梯战绩由服务端结算。" en="Once signed in, rank, diamonds and ranked results are settled server-side." block />
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-space-sm">
          <label className="relative block">
            <UiIcon name="send" className="absolute left-3 top-2.5 h-6 w-6 opacity-80" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("邮箱 Email", "Email 邮箱")}
              className="field-control h-12 w-full pl-11 pr-3"
            />
          </label>
          <label className="relative block">
            <UiIcon name="seal" className="absolute left-3 top-2.5 h-6 w-6 opacity-80" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("密码 Password", "Password 密码")}
              className="field-control h-12 w-full pl-11 pr-3"
            />
          </label>
          <label className="relative block">
            <UiIcon name="signature" className="absolute left-3 top-2.5 h-6 w-6 opacity-80" />
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder={t("实名（约战必填）", "Real name (required for duels)")}
              className="field-control cjk h-12 w-full pl-11 pr-3"
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="cjk font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              {t("选择头像（对局中显示）", "Choose your avatar")}
            </span>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setAvatar(option.key)}
                  aria-label={t(option.zh, option.en)}
                  aria-pressed={avatar === option.key}
                  className={`aspect-square flex items-center justify-center bg-surface-container p-1 ${avatar === option.key ? "gold-hairline opacity-100" : "opacity-60 hover:opacity-90"}`}
                >
                  <img src={option.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </div>
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
            {t("填好实名后登录即自动保存，下次进入自动带出；退出登录会清除本机实名与段位缓存。", "Your real name is saved on sign-in and restored next time; signing out clears it on this device.")}
          </p>
          <button
            type="submit"
            disabled={busy}
            className="h-11 bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-widest disabled:opacity-60"
          >
            {mode === "in" ? t("进入王座", "Enter the Court") : t("立誓注册", "Swear the Oath")}
          </button>
        </form>

        <button
          onClick={google}
          disabled={busy}
          className="h-11 bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <GameIcon name="auth-google" className="h-7 w-7" />
          <Bi zh="用 Google 继续" en="Continue with Google" />
        </button>

        {msg && <p className="font-body-sm text-body-sm text-primary leading-relaxed">{msg}</p>}

        <button
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="text-on-surface-variant hover:text-secondary font-label-sm text-label-sm uppercase tracking-widest"
        >
          {mode === "in" ? t("还没有账号？立誓注册", "No account yet? Create one") : t("已有账号？直接登录", "Already sworn? Sign in")}
        </button>
      </div>
    </div>
  );
}
