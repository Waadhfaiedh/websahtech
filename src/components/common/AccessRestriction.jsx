// Redesigned following SAHTECK brand guidelines
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { ShieldAlert, Clock, LogOut } from "lucide-react";

const variantConfig = {
  admin: {
    badgeBg: "#FEF2F2",
    badgeColor: "#EF4444",
    iconBg: "linear-gradient(135deg, #EF4444, #F59E0B)",
    blobColor: "rgba(239,68,68,0.10)",
    Icon: ShieldAlert,
  },
  specialist: {
    badgeBg: "#FFFBEB",
    badgeColor: "#F59E0B",
    iconBg: "linear-gradient(135deg, #F59E0B, #F97316)",
    blobColor: "rgba(245,158,11,0.10)",
    Icon: Clock,
  },
};

export default function AccessRestriction({
  variant,
  title,
  message,
  actionLabel,
  onAction,
}) {
  const { t } = useTranslation();
  const config = variantConfig[variant] ?? variantConfig.specialist;
  const { Icon, iconBg, badgeBg, badgeColor, blobColor } = config;

  return (
    <div
      className="h-screen w-screen flex flex-col relative overflow-hidden"
      style={{ background: "#F8FAFF" }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(0,82,255,0.07)" }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: blobColor }}
      />

      {/* Card — centred, never taller than the viewport */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div
          className="w-full max-w-md bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 40px rgba(0,82,255,0.10)" }}
        >
          {/* Brand accent strip */}
          <div
            className="h-1.5 w-full"
            style={{ background: "linear-gradient(135deg, #0052FF, #00A3FF)" }}
          />

          {/* Header bar */}
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ borderBottom: "1px solid #F1F5F9" }}
          >
            <Logo size="sm" />
            <LanguageSwitcher compact />
          </div>

          {/* Body */}
          <div className="px-8 py-6 text-center">
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: iconBg, boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}
            >
              <Icon size={28} color="white" strokeWidth={1.75} />
            </div>

            {/* Badge */}
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
              style={{ background: badgeBg, color: badgeColor }}
            >
              {variant === "admin"
                ? t("access.admin_badge")
                : t("access.specialist_badge")}
            </span>

            {/* Title */}
            <h1
              className="text-xl font-bold mb-2 leading-tight"
              style={{ color: "#0A0F1E" }}
            >
              {title}
            </h1>

            {/* Message */}
            <p
              className="text-sm leading-relaxed mx-auto max-w-xs"
              style={{ color: "#64748B" }}
            >
              {message}
            </p>

            {/* Steps hint */}
            <div
              className="mt-5 mb-5 rounded-xl p-3 text-left"
              style={{ background: "#F8FAFF", border: "1.5px solid #E2E8F0" }}
            >
              {[
                {
                  id: "received",
                  label: t("access.step1", "Votre demande a été reçue"),
                  badge: "✓",
                  badgeStyle: { background: "#ECFDF5", color: "#10B981" },
                  textStyle: { color: "#0A0F1E", fontWeight: 400 },
                },
                {
                  id: "reviewing",
                  label: t("access.step2", "En cours d'examen par notre équipe"),
                  badge: "2",
                  badgeStyle: { background: "linear-gradient(135deg, #0052FF, #00A3FF)", color: "white" },
                  textStyle: { color: "#0A0F1E", fontWeight: 600 },
                },
                {
                  id: "notified",
                  label: t("access.step3", "Vous serez notifié par email"),
                  badge: "3",
                  badgeStyle: { background: "#F1F5F9", color: "#94A3B8" },
                  textStyle: { color: "#94A3B8", fontWeight: 400 },
                },
              ].map(({ id, label, badge, badgeStyle, textStyle }) => (
                <div key={id} className="flex items-center gap-3 py-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={badgeStyle}
                  >
                    {badge}
                  </div>
                  <span className="text-sm" style={textStyle}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Action button */}
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #0052FF, #00A3FF)",
                boxShadow: "0 4px 14px rgba(0,82,255,0.30)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <LogOut size={16} />
              {actionLabel || t("nav.logout")}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-xs" style={{ color: "#94A3B8" }}>
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
