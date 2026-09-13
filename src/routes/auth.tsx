import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Bi, useT } from "@/lib/i18n";
import { GameIcon } from "@/components/GameIcon";

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

function AuthPage() {
  const navigate = useNavigate();
  const t = useT();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
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
    if (res.data.session) void navigate({ to: "/" });
    else setMsg(t("请到邮箱确认后再登录。", "Check your inbox to confirm, then sign in."));
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
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("邮箱 Email", "Email 邮箱")}
            className="h-11 px-3 bg-surface-container text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-secondary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("密码 Password", "Password 密码")}
            className="h-11 px-3 bg-surface-container text-on-surface font-body-md text-body-md outline-none focus:ring-1 focus:ring-secondary"
          />
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
          className="h-11 bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-widest disabled:opacity-60"
        >
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
