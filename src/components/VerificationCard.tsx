import { useState } from "react";
import { UiIcon } from "@/components/UiIcon";
import { useT } from "@/lib/i18n";
import type { PlayerProfile } from "@/lib/profile";

/** 认证徽章：替代原先无条件显示的金色皇冠，按真实认证状态显示。 */
export function VerifiedBadge({ status, className = "" }: { status: PlayerProfile["verifyStatus"]; className?: string }) {
  const t = useT();
  const meta = {
    verified: { icon: "badge-hex", zh: "已实名认证", en: "Verified", tone: "text-secondary" },
    pending: { icon: "spinner", zh: "认证审核中", en: "Under review", tone: "text-on-surface-variant" },
    rejected: { icon: "skull", zh: "认证未通过", en: "Rejected", tone: "text-primary" },
    none: { icon: "shield", zh: "未实名认证", en: "Not verified", tone: "text-on-surface-variant" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 ${meta.tone} ${className}`}>
      <UiIcon name={meta.icon as "shield"} className="h-5 w-5" />
      <span className="cjk font-label-sm text-label-sm">{t(meta.zh, meta.en)}</span>
    </span>
  );
}

/** 账户安全：实名认证表单 + 认证结果。 */
export function VerificationCard({
  profile,
  onVerify,
}: {
  profile: PlayerProfile;
  onVerify: (realName: string, idNumber: string) => Promise<"checksum" | "provider" | void>;
}) {
  const t = useT();
  const [name, setName] = useState(profile.realName);
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const verified = profile.verifyStatus === "verified";

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const mode = await onVerify(name, id);
      setId("");
      setMsg(
        mode === "checksum"
          ? t(
              "姓名与身份证号格式校验通过，已开放天梯。公安二要素核验接口尚未接入，接入后将改为实名核验。",
              "Format check passed. The official ID verification service is not connected yet.",
            )
          : t("实名核验通过。", "Verification complete."),
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("认证失败，请稍后重试。", "Verification failed, try again."));
    }
    setBusy(false);
  }


  return (
    <section className="home-glass-panel p-space-md flex flex-col gap-space-sm">
      <div className="section-heading-row">
        <h2 className="font-headline-sm text-headline-sm tracking-wider">
          <span className="cjk">账户安全</span> <span className="font-label-sm text-label-sm text-on-surface-variant">Account Security</span>
        </h2>
        <VerifiedBadge status={profile.verifyStatus} />
      </div>

      {verified ? (
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
          {t(
            `已认证：${profile.realName}（证件尾号 ${profile.idTail}）。天梯与约战对局均以实名身份结算。`,
            `Verified as ${profile.realName} (ID ending ${profile.idTail}).`,
          )}
        </p>
      ) : (
        <>
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
            {t("填写真实姓名与身份证号完成实名认证，通过后即可参加天梯与约战。", "Complete real-name verification to join ranked and invite matches.")}
          </p>
          <div className="field-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("真实姓名", "Real name")}
              className="field-control cjk"
            />
            <button type="button" disabled className="field-action home-glass-control bg-surface-container-high cjk font-label-md text-label-md opacity-0 pointer-events-none">—</button>
          </div>
          <div className="field-row">
            <input
              value={id}
              onChange={(e) => setId(e.target.value.toUpperCase())}
              maxLength={18}
              placeholder={t("身份证号（18 位）", "ID number (18 digits)")}
              className="field-control"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="field-action home-glass-action bg-secondary text-on-secondary cjk font-label-md text-label-md disabled:opacity-60"
            >
              {t("认证", "Verify")}
            </button>
          </div>
        </>
      )}
      {msg && <p className="cjk font-body-sm text-body-sm text-primary">{msg}</p>}
    </section>
  );
}
