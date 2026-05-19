import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../common/Logo";
import LanguageSwitcher from "../common/LanguageSwitcher";

export default function AuthLayout({ children, maxWidth = "md" }) {
  const { t } = useTranslation();

  const widths = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ── Top brand bar ──────────────────────────────────── */}
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
        <Logo size="sm" showText variant="light" />
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <a
              href="#help"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("auth.help", "Centre d'aide")}
            </a>
            <div className="bg-white/10 rounded-full">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* ── Content area ───────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 md:py-14">
        <div className={`w-full ${widths[maxWidth]}`}>{children}</div>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© 2026 SAHTECH — {t("landing.footer.rights", "Tous droits réservés")}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">
              {t("landing.footer.privacy", "Confidentialité")}
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              {t("landing.footer.terms", "Conditions")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
};