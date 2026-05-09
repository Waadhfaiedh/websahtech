import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

const variantStyles = {
  admin: {
    badge: "bg-rose-100 text-rose-700",
    accent: "from-rose-500 to-amber-500",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zm0 0c-4.418 0-8 2.015-8 4.5V18h16v-2.5c0-2.485-3.582-4.5-8-4.5z"
        />
      </svg>
    ),
  },
  specialist: {
    badge: "bg-amber-100 text-amber-700",
    accent: "from-amber-500 to-orange-500",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
    ),
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
  const styles = variantStyles[variant] || variantStyles.specialist;

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(241,245,249,0.85)_45%,_rgba(226,232,240,0.9)_100%)]" />
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.15)] backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <Logo size="sm" />
          <LanguageSwitcher compact />
        </div>

        <div className="px-6 py-10 md:px-10 md:py-12 text-center">
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${styles.accent} text-white shadow-lg`}
          >
            {styles.icon}
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles.badge}`}
          >
            {variant === "admin"
              ? t("access.admin_badge")
              : t("access.specialist_badge")}
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
            {message}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onAction}
              className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${styles.accent} px-5 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5`}
            >
              {actionLabel || t("nav.logout")}
            </button>
          </div>
        </div>
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
