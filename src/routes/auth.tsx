import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { useEffect, useState } from "react";
import { fetchSession, register, signIn } from "@/data/db";
import { lovable } from "@/integrations/lovable/index";
import { Bi, useT } from "@/lib/i18n";
import { GameIcon } from "@/components/GameIcon";
import { UiIcon } from "@/components/UiIcon";
import { saveAvatarKey as saveAvatar, saveAvatarPath as saveAvatarImage, submitVerification } from "@/data/db";
import { DEFAULT_AVATAR_KEY } from "@/lib/avatar-assets";
import { AvatarPicker } from "@/components/AvatarPicker";
import { uploadAvatar } from "@/lib/avatar-upload";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>): { mode: "in" | "up" } => ({
    mode: search['mode'] === "up" ? "up" : "in",
  }),
  head: () => ({
    meta: [
      { title: "血誓登录 | 玄弈棋竞" },
      { name: "description", content: "登录血誓王权，同步段位、钻石与天梯战绩。Sign in to sync your rank, diamonds and ranked record." },
      { property: "og:title", content: "血誓登录 | 玄弈棋竞" },
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
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"in" | "up">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR_KEY);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      setRealName(window.localStorage.getItem(REAL_NAME_KEY) ?? "");
      setAvatar(window.localStorage.getItem(AVATAR_KEY) ?? DEFAULT_AVATAR_KEY);
    } catch {
      /* storage unavailable */
    }
    void fetchSession().then((session) => {
      if (session) void navigate({ to: "/" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res =
      mode === "in"
        ? await signIn(email, password)
        : await register(email, password, window.location.origin);
    setBusy(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    if (res.signedIn) {
      try {
        window.localStorage.setItem(AVATAR_KEY, avatar);
      } catch {
        /* storage unavailable */
      }
      if (avatarFile) {
        const path = await uploadAvatar(avatarFile).catch(() => null);
        if (path) await saveAvatarImage({ data: { path } }).catch(() => null);
      } else {
        await saveAvatar({ data: { avatarKey: avatar } }).catch(() => null);
      }
      const name = realName.trim();
      let verified = false;
      if (name.length >= 2 && idNumber.trim().length === 18) {
        try {
          window.localStorage.setItem(REAL_NAME_KEY, name);
        } catch {
          /* storage unavailable */
        }
        const saved = await submitVerification({ data: { realName: name, idNumber } }).catch((e: unknown) => {
          setMsg(e instanceof Error ? e.message : t("实名认证失败。", "Verification failed."));
          return null;
        });
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
    <div className="themed-page home-glass-page text-on-surface min-h-screen flex items-center justify-center px-margin-mobile pt-space-lg pb-32 md:py-space-xl lg:pl-[calc(var(--nav-rail-width)+var(--space-lg))]">
      <ThemeBackdrop theme="gothic" />
      <div className="home-glass-panel flex w-full max-w-sm flex-col gap-space-md p-space-lg md:min-h-[calc(100dvh-8rem)] md:max-w-3xl md:justify-center md:p-space-xl lg:max-w-4xl">
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
            <UiIcon name="send" className="pointer-events-none absolute left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 opacity-80" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("邮箱 Email", "Email 邮箱")}
              className="field-control auth-field-control h-12 w-full"
            />
          </label>
          <label className="relative block">
            <UiIcon name="seal" className="pointer-events-none absolute left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 opacity-80" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("密码 Password", "Password 密码")}
              className="field-control auth-field-control h-12 w-full"
            />
          </label>
          <label className="relative block">
            <UiIcon name="signature" className="pointer-events-none absolute left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 opacity-80" />
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder={t("真实姓名（实名认证）", "Real name (verification)")}
              className="field-control auth-field-control cjk h-12 w-full"
            />
          </label>
          <label className="relative block">
            <UiIcon name="badge-hex" className="pointer-events-none absolute left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 opacity-80" />
            <input
              type="text"
              maxLength={18}
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
              placeholder={t("身份证号（18 位，用于实名认证）", "ID number (18 digits)")}
              className="field-control auth-field-control h-12 w-full"
            />
          </label>
          <AvatarPicker
            value={avatarFile ? "upload" : avatar}
            onSelect={(key) => {
              if (key === "upload") return;
              setAvatarFile(null);
              setAvatar(key);
            }}
            onUpload={(file) => setAvatarFile(file)}
          />
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
            {t("姓名与身份证号校验通过后即完成实名认证，账户安全页会显示认证徽章；证件号只保留后四位。", "Once your name and ID pass validation you are verified; only the last four digits are stored.")}
          </p>
          <button
            type="submit"
            disabled={busy}
            className="home-glass-action h-11 text-on-primary-container font-label-lg text-label-lg uppercase tracking-widest disabled:opacity-60"
          >
            {mode === "in" ? t("进入王座", "Enter the Court") : t("立誓注册", "Swear the Oath")}
          </button>
        </form>

        <button
          onClick={google}
          disabled={busy}
          className="home-glass-control h-11 text-on-surface font-label-md text-label-md uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
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
