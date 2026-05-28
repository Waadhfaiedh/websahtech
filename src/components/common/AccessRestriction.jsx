// Redesigned following SAHTECK brand guidelines
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  ShieldAlert,
  Clock,
  LogOut,
  CheckCircle2,
  Mail,
  ArrowRight,
} from "lucide-react";

const variantConfig = {
  admin: {
    badgeBg: "#FEF2F2",
    badgeColor: "#EF4444",
    iconBg: "linear-gradient(135deg, #EF4444, #F59E0B)",
    blobColor: "rgba(239,68,68,0.10)",
    panelGlow: "rgba(239,68,68,0.14)",
    Icon: ShieldAlert,
  },
  specialist: {
    badgeBg: "#FFFBEB",
    badgeColor: "#F59E0B",
    iconBg: "linear-gradient(135deg, #F59E0B, #F97316)",
    blobColor: "rgba(245,158,11,0.10)",
    panelGlow: "rgba(245,158,11,0.14)",
    Icon: Clock,
  },
};

const accessSteps = [
  {
    id: "received",
    labelKey: "access.step1",
    fallback: "Votre demande a été reçue",
    icon: CheckCircle2,
    badgeBg: "#ECFDF5",
    badgeColor: "#10B981",
  },
  {
    id: "reviewing",
    labelKey: "access.step2",
    fallback: "En cours d'examen par notre équipe",
    icon: Clock,
    badgeBg: "#EFF6FF",
    badgeColor: "#0052FF",
  },
  {
    id: "notified",
    labelKey: "access.step3",
    fallback: "Vous serez notifié par email",
    icon: Mail,
    badgeBg: "#F1F5F9",
    badgeColor: "#64748B",
  },
];

export default function AccessRestriction({
  variant,
  title,
  message,
  actionLabel,
  onAction,
}) {
  const { t } = useTranslation();
  const config = variantConfig[variant] ?? variantConfig.specialist;
  const { Icon, iconBg, badgeBg, badgeColor, blobColor, panelGlow } = config;

  return (
    <div
      className="relative flex h-screen w-screen flex-col overflow-hidden"
      style={{ background: "#F8FAFF" }}
    >
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgba(0,82,255,0.07)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: blobColor }}
      />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="w-full max-w-5xl overflow-hidden rounded-[12px] bg-white shadow-[0_2px_12px_rgba(0,82,255,0.08)]"
          style={{ border: "1px solid #EEF4FF" }}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: "linear-gradient(135deg, #0052FF, #00A3FF)" }}
          />

          <div className="grid min-h-[min(760px,calc(100vh-3rem))] lg:grid-cols-[0.95fr_1.05fr]">
            <div
              className="relative flex overflow-hidden px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,82,255,1) 0%, rgba(0,163,255,0.95) 100%)",
                boxShadow: `inset 0 0 0 1px ${panelGlow}`,
              }}
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10 flex w-full flex-col justify-between gap-8">
                <div className="flex items-center justify-between gap-4">
                  <Logo size="sm" />
                  <div className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/90 backdrop-blur-sm">
                    {variant === "admin"
                      ? t("access.admin_badge")
                      : t("access.specialist_badge")}
                  </div>
                </div>

                <div className="space-y-5">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white/15 shadow-[0_10px_24px_rgba(255,255,255,0.12)] backdrop-blur-sm"
                    style={{ background: iconBg }}
                  >
                    <Icon size={28} color="white" strokeWidth={1.8} />
                  </div>

                  <div className="space-y-3">
                    <h1 className="max-w-md text-[24px] font-bold leading-tight sm:text-[28px] lg:text-[32px]">
                      {title}
                    </h1>
                    <p className="max-w-md text-[14px] leading-6 text-white/85 sm:text-[15px]">
                      {message}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[12px] bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/70">
                        {t("access.step1", "Votre demande a été reçue")}
                      </p>
                      <p className="text-[14px] text-white/90">
                        {t(
                          "access.step2",
                          "En cours d'examen par notre équipe",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/70">
                        {t("access.step3", "Vous serez notifié par email")}
                      </p>
                      <p className="text-[14px] text-white/90">
                        {t("access.step3", "Vous serez notifié par email")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col bg-white px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div
                className="mb-6 flex items-center justify-between gap-4 border-b pb-4"
                style={{ borderColor: "#EEF4FF" }}
              >
                <LanguageSwitcher compact />
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em]"
                  style={{ background: badgeBg, color: badgeColor }}
                >
                  {variant === "admin"
                    ? t("access.admin_badge")
                    : t("access.specialist_badge")}
                </span>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-[24px] font-bold leading-tight text-[#0A0F1E]">
                    {title}
                  </h2>
                  <p className="max-w-xl text-[14px] leading-6 text-[#64748B]">
                    {message}
                  </p>
                </div>

                <div
                  className="rounded-[12px] bg-[#F8FAFF] p-4"
                  style={{ boxShadow: "inset 0 0 0 1px #EEF4FF" }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#64748B]">
                        {t("access.status", "Statut de la demande")}
                      </p>
                      <p className="mt-1 text-[18px] font-semibold text-[#0A0F1E]">
                        {t("access.follow_up", "Nous vous tenons informé")}
                      </p>
                    </div>
                    <ArrowRight size={20} color="#CBD5E1" />
                  </div>

                  <div className="space-y-3">
                    {accessSteps.map(
                      ({
                        id,
                        labelKey,
                        fallback,
                        icon: StepIcon,
                        badgeBg: stepBg,
                        badgeColor: stepColor,
                      }) => (
                        <div
                          key={id}
                          className="flex items-start gap-3 rounded-[12px] bg-white px-3 py-3"
                          style={{
                            boxShadow: "0 1px 0 rgba(15, 23, 42, 0.04)",
                          }}
                        >
                          <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                            style={{ background: stepBg, color: stepColor }}
                          >
                            <StepIcon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium leading-5 text-[#0A0F1E]">
                              {t(labelKey, fallback)}
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-[#64748B]">
                              {id === "received"
                                ? t(
                                    "access.step1_hint",
                                    "Votre dossier est maintenant en file de traitement.",
                                  )
                                : id === "reviewing"
                                  ? t(
                                      "access.step2_hint",
                                      "Notre équipe vérifie les informations et les accès requis.",
                                    )
                                  : t(
                                      "access.step3_hint",
                                      "Un email vous sera envoyé dès qu'une décision est prise.",
                                    )}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={onAction}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white transition-all duration-200 ease-in-out hover:translate-y-[-1px] hover:opacity-95 active:translate-y-0 active:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #0052FF, #00A3FF)",
                      boxShadow: "0 8px 20px rgba(0,82,255,0.22)",
                    }}
                  >
                    <LogOut size={16} />
                    {actionLabel || t("nav.logout")}
                  </button>
                  <p className="text-[12px] leading-5 text-[#94A3B8]">
                    {t(
                      "access.footer_note",
                      "Vous pouvez revenir plus tard sans perdre votre demande en attente.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-[#94A3B8]">
          © 2026 SAHTECH — {t("landing.footer.rights", "Tous droits réservés")}
        </p>
      </div>
    </div>
  );
}

AccessRestriction.propTypes = {
  variant: PropTypes.oneOf(["admin", "specialist"]).isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func.isRequired,
};
