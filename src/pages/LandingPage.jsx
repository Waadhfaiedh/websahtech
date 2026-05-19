import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/common/Logo";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

/* ────────────────────────────────────────────────────────────────────
 *  Small inline icon set — keeps the file self-contained
 * ──────────────────────────────────────────────────────────────────── */
const Icon = {
  ai: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  calendar: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  arrow: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  ),
  quote: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
    </svg>
  ),
};

/* ────────────────────────────────────────────────────────────────────
 *  Section: Floating pill nav
 * ──────────────────────────────────────────────────────────────────── */
function Nav() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <nav className={`flex items-center justify-between gap-4 px-5 py-3 rounded-full transition-all ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg border border-gray-100"
          : "bg-white/70 backdrop-blur-sm border border-white/60"
      }`}>
        <Logo size="sm" />

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <a href="#platform" className="hover:text-primary transition-colors">
            {t("landing.nav.platform")}
          </a>
          <a href="#features" className="hover:text-primary transition-colors">
            {t("landing.nav.features")}
          </a>
          <a href="#stories" className="hover:text-primary transition-colors">
            {t("landing.nav.stories")}
          </a>
          <a href="#contact" className="hover:text-primary transition-colors">
            {t("landing.nav.contact")}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 hover:text-primary px-3 py-2 transition-colors"
          >
            {t("landing.nav.login")}
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            {t("landing.nav.signup")}
          </Link>
        </div>
      </nav>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Hero
 * ──────────────────────────────────────────────────────────────────── */
function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden pt-32 pb-24 px-6">
      {/* Decorative gradient blobs */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-20 -left-32 w-[500px] h-[500px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/60 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-700">
            {t("landing.hero.badge")}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tight mb-6">
          {t("landing.hero.title_1")}
          <br />
          <span className="text-primary">{t("landing.hero.title_2")}</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
          {t("landing.hero.subtitle")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all hover:gap-3 shadow-lg shadow-primary/20"
          >
            {t("landing.hero.cta_primary")}
            {Icon.arrow}
          </Link>
          <a
            href="#platform"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3.5 rounded-full font-semibold border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
          >
            {t("landing.hero.cta_secondary")}
          </a>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm">
          {["ai_pill", "chat_pill", "planning_pill"].map((k) => (
            <div key={k} className="flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {Icon.check}
              </div>
              <span className="font-medium">{t(`landing.hero.${k}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Trust logos strip
 * ──────────────────────────────────────────────────────────────────── */
function Trust() {
  const { t } = useTranslation();
  const partners = ["Clinique El Manar", "Hôpital Charles Nicolle", "Polyclinique Les Berges", "Centre Médical Carthage", "Hôpital Habib Bourguiba", "Clinique Hannibal"];

  return (
    <section className="py-12 px-6 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">
          {t("landing.trust.title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {partners.map((p) => (
            <span key={p} className="text-sm md:text-base font-semibold text-gray-500 tracking-tight">
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Two-circle "Specialists + Patients"
 * ──────────────────────────────────────────────────────────────────── */
function TwoSides() {
  const { t } = useTranslation();
  return (
    <section id="platform" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            {t("landing.twosides.eyebrow")}
          </p>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4 leading-tight">
          {t("landing.twosides.title_1")}
          <br />
          <span className="text-primary">{t("landing.twosides.title_2")}</span>
        </h2>

        <div className="relative mt-16 flex flex-col md:flex-row items-center justify-center">
          {/* Specialist circle */}
          <div className="relative md:-mr-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center p-10 text-center z-10">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                {t("landing.twosides.specialist_title")}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("landing.twosides.specialist_text")}
              </p>
            </div>
          </div>

          {/* Patient circle */}
          <div className="relative md:-ml-16 -mt-12 md:mt-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-100 to-emerald-50 flex items-center justify-center p-10 text-center">
            <div>
              <h3 className="text-2xl font-bold text-cyan-700 mb-2">
                {t("landing.twosides.patient_title")}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("landing.twosides.patient_text")}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 max-w-xl mx-auto mt-12">
          {t("landing.twosides.footer")}
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Big stats banner
 * ──────────────────────────────────────────────────────────────────── */
function Stats() {
  const { t } = useTranslation();
  const stats = [
    { value: "500+", key: "specialists" },
    { value: "10K+", key: "patients" },
    { value: "98%", key: "satisfaction" },
    { value: "24/7", key: "support" },
  ];
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 mb-3 leading-tight">
          {t("landing.stats.title")}
        </h2>
        <p className="text-center text-gray-500 max-w-2xl mx-auto mb-14">
          {t("landing.stats.subtitle")}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.key} className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
              <p className="text-5xl md:text-6xl font-bold text-primary mb-2">{s.value}</p>
              <p className="text-sm text-gray-600 leading-snug">
                {t(`landing.stats.${s.key}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Features grid
 * ──────────────────────────────────────────────────────────────────── */
function Features() {
  const { t } = useTranslation();
  const features = [
    { key: "ai", icon: Icon.ai, color: "bg-purple-50 text-purple-600" },
    { key: "chat", icon: Icon.chat, color: "bg-blue-50 text-blue-600" },
    { key: "planning", icon: Icon.calendar, color: "bg-emerald-50 text-emerald-600" },
    { key: "security", icon: Icon.shield, color: "bg-orange-50 text-orange-600" },
  ];
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            {t("landing.features.eyebrow")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {t("landing.features.title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.key} className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-5`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t(`landing.features.${f.key}_title`)}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(`landing.features.${f.key}_text`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Testimonial
 * ──────────────────────────────────────────────────────────────────── */
function Testimonial() {
  const { t } = useTranslation();
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-cyan-50/50 to-emerald-50/50 rounded-3xl p-10 md:p-14 border border-gray-100">
        <div className="text-primary/40 mb-4">{Icon.quote}</div>
        <p className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug mb-8">
          {t("landing.testimonial.quote")}
        </p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            DK
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {t("landing.testimonial.name")}
            </p>
            <p className="text-sm text-gray-500">
              {t("landing.testimonial.role")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Stories grid
 * ──────────────────────────────────────────────────────────────────── */
function Stories() {
  const { t } = useTranslation();
  const stories = ["story_1", "story_2", "story_3"];
  return (
    <section id="stories" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {t("landing.stories.title")}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t("landing.stories.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((s, i) => (
            <div key={s} className="bg-white rounded-3xl p-8 border border-gray-100">
              <div className="text-primary/30 mb-3">{Icon.quote}</div>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t(`landing.stories.${s}_text`)}
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? "bg-purple-100 text-purple-700"
                  : i === 1 ? "bg-emerald-100 text-emerald-700"
                  : "bg-cyan-100 text-cyan-700"
                }`}>
                  {t(`landing.stories.${s}_initial`)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t(`landing.stories.${s}_name`)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t(`landing.stories.${s}_role`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: "Want to learn more?" audience cards
 * ──────────────────────────────────────────────────────────────────── */
function LearnMore() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const cards = ["specialists", "clinics", "patients", "developers"];

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-3">
          {t("landing.learn.title")}
        </h2>
        <p className="text-center text-gray-500 max-w-xl mx-auto mb-14">
          {t("landing.learn.subtitle")}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <button
              key={c}
              onClick={() => navigate("/signup")}
              className="group bg-white rounded-3xl p-6 border border-gray-100 text-left hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-gray-900 text-lg">
                  {t(`landing.learn.${c}_title`)}
                </h3>
                <span className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
                  {Icon.arrow}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {t(`landing.learn.${c}_text`)}
              </p>
            </button>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t("landing.learn.cta_title")}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-all hover:gap-3 shadow-lg shadow-primary/20"
            >
              {t("landing.learn.cta_signup")}
              {Icon.arrow}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3.5 rounded-full font-semibold border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {t("landing.learn.cta_login")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Certifications
 * ──────────────────────────────────────────────────────────────────── */
function Certifications() {
  const { t } = useTranslation();
  const certs = ["HIPAA", "RGPD", "ISO 27001", "HDS"];
  return (
    <section className="py-16 px-6 bg-gray-50 border-y border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-gray-500 mb-6">
          {t("landing.certs.title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {certs.map((c) => (
            <div key={c} className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                {Icon.shield}
              </div>
              <span className="font-semibold text-sm">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Section: Footer
 * ──────────────────────────────────────────────────────────────────── */
function Footer() {
  const { t } = useTranslation();
  const cols = [
    { title: "product", links: ["features", "platform", "security", "pricing"] },
    { title: "company", links: ["about", "team", "careers", "contact"] },
    { title: "resources", links: ["docs", "support", "blog", "faq"] },
    { title: "legal", links: ["terms", "privacy", "cookies", "gdpr"] },
  ];

  return (
    <footer className="px-6 pt-20 pb-10 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <Logo size="md" showText />
            <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-xs">
              {t("landing.footer.tagline")}
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
                {t(`landing.footer.${col.title}`)}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                      {t(`landing.footer.${l}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © 2026 SAHTECH — {t("landing.footer.rights")}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{t("landing.footer.made_in")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────────────
 *  Top-level page
 * ──────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, send them to their dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate(
        user.role === "ADMIN" ? "/admin/dashboard" : "/specialist/dashboard",
        { replace: true },
      );
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <Nav />
      <Hero />
      <Trust />
      <TwoSides />
      <Stats />
      <Features />
      <Testimonial />
      <Stories />
      <LearnMore />
      <Certifications />
      <Footer />
    </div>
  );
}