/**
 * 风控监看台（仅管理员可见）。
 * 页面只做展示：名单、等级、时间；判定与权限一律由服务端决定。
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { amIGuardAdmin, listAuditAlerts } from "@/data/db";
import { subscribeAuditAlerts } from "@/data/realtime";
import { auditAlertText } from "@/lib/audit-alerts";
import { useProfile } from "@/lib/profile";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/guard")({
  component: GuardPage,
  head: () => ({
    meta: [
      { title: "风控监看 | 玄弈棋竞" },
      { name: "description", content: "玄弈棋竞风控监看台：实时查看联网对局中的异常走子告警。" },
      { property: "og:title", content: "风控监看 | 玄弈棋竞" },
      { property: "og:description", content: "实时查看联网对局中的异常走子告警，仅管理员可见。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function GuardPage() {
  const t = useT();
  const { lang } = useLang();
  const { signedIn } = useProfile();
  const queryClient = useQueryClient();

  const adminQ = useQuery({
    queryKey: ["guard-admin"],
    queryFn: () => amIGuardAdmin(),
    enabled: signedIn,
    staleTime: 300_000,
  });
  const isAdmin = adminQ.data === true;

  const alertsQ = useQuery({
    queryKey: ["guard-alerts"],
    queryFn: () => listAuditAlerts({ data: { limit: 100 } }),
    enabled: isAdmin,
    staleTime: 5_000,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!isAdmin) return;
    return subscribeAuditAlerts({ all: true }, (frame) => {
      void queryClient.invalidateQueries({ queryKey: ["guard-alerts"] });
      const text = auditAlertText(frame.kind, lang);
      if (frame.severity === "critical") toast.error(text.title, { description: text.body });
    });
  }, [isAdmin, lang, queryClient]);

  return (
    <div className="relative min-h-dvh">
      <ThemeBackdrop theme="blackGold" />
      <SovereignPageHeader icon="nav-duel" titleZh="风控监看" titleEn="Fair play watch" backTo="/" />

      <main className="page-main-compact desktop-page-container px-margin-mobile grid gap-space-sm">
        {!signedIn ? (
          <div className="home-glass-panel grid gap-2 p-space-md">
            <p className="cjk font-body-md text-body-md text-on-surface-variant">
              {t("登录后才能查看风控监看台。", "Sign in to open the fair play watch.")}
            </p>
            <Link
              to="/auth"
              className="home-glass-control cjk flex h-11 w-fit items-center bg-primary-container px-4 font-label-md text-label-md text-on-primary-container"
            >
              {t("去登录", "Sign in")}
            </Link>
          </div>
        ) : adminQ.isLoading ? (
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("校验权限中…", "Checking access…")}</p>
        ) : !isAdmin ? (
          <div className="home-glass-panel p-space-md">
            <p className="cjk font-body-md text-body-md text-on-surface-variant">
              {t("此页仅对管理员开放。", "This page is for administrators only.")}
            </p>
          </div>
        ) : (
          <section className="home-glass-panel grid gap-2 p-space-md">
            <h2 className="cjk font-label-md text-label-md text-on-surface">{t("最近告警", "Recent alerts")}</h2>
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
              {t(
                "服务端判定的异常走子会即时推送到这里，同时提示给当事人。",
                "Server-flagged irregular moves arrive here instantly and are also shown to the player.",
              )}
            </p>
            {(alertsQ.data?.length ?? 0) === 0 ? (
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {alertsQ.isLoading ? t("载入中…", "Loading…") : t("暂无告警。", "No alerts yet.")}
              </p>
            ) : (
              <ul className="grid gap-2">
                {(alertsQ.data ?? []).map((row) => {
                  const text = auditAlertText(row.kind, lang);
                  return (
                    <li key={row.id} className="home-glass-card grid gap-1 rounded-[12px] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="cjk font-label-sm text-label-sm text-on-surface">
                          {row.playerName ?? t("未知账号", "Unknown account")}
                        </span>
                        <span
                          className={`cjk rounded-[12px] px-2 py-0.5 font-label-sm text-label-sm ${
                            row.severity === "critical" ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {row.severity === "critical" ? t("严重", "Critical") : t("留痕", "Notice")}
                        </span>
                      </div>
                      <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{text.title}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant tabular-nums">
                        {new Date(row.createdAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
