import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/common/Logo";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import axios from "axios";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // OTP step
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // ─── Step 1: signin ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.require2FA) {
        setUserId(result.userId);
        setUserEmail(result.email);
        setShowOtp(true); // show OTP input
      }
    } catch (err) {
      setError(err.response?.data?.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: verify OTP ───────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await verifyOtp(userId, otpCode);
      console.log("Logged in user:", user);
      console.log("User role:", user.role);
      // navigate based on role
      if (user.role === "ADMIN") navigate("/admin/dashboard");
      else if (user.role === "DOCTOR") navigate("/specialist/dashboard");
      else navigate("/specialist/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ───────────────────────────────────────────────
  const handleResendOtp = async () => {
    try {
      await axios.post("http://localhost:3000/users/resend-otp", {
        userId,
        email: userEmail,
        type: "TWO_FACTOR",
      });
      setError("");
    } catch {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — unchanged */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
              }}
            />
          ))}
        </div>
        <Logo size="md" showText />
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Gérez votre pratique médicale avec intelligence
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            SAHTECH connecte spécialistes et patients grâce à l'analyse vidéo
            par IA, la gestion des rendez-vous et des outils de suivi avancés.
          </p>
          <div className="mt-8 flex gap-6">
            {["Analyse IA", "Chat sécurisé", "Planning"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-blue-100">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200 text-sm relative z-10">© 2026 SAHTECH — Tous droits réservés</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden"><Logo size="sm" /></div>
          <div className="ml-auto"><LanguageSwitcher /></div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">

            {!showOtp ? (
              // ─── Login form ──────────────────────────────────
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">{t("auth.welcome")}</h1>
                  <p className="text-gray-500 mt-2">{t("auth.subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("auth.email")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="docteur@sahtech.tn"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("auth.password")}</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3 text-base disabled:opacity-70"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connexion...</>
                    ) : (
                      t("auth.sign_in")
                    )}
                  </button>
                </form>
              </>
            ) : (
              // ─── OTP form ────────────────────────────────────
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">Vérification</h1>
                  <p className="text-gray-500 mt-2">
                    Un code a été envoyé à <span className="font-medium text-gray-700">{userEmail}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Code OTP</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="input-field text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3 text-base disabled:opacity-70"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Vérification...</>
                    ) : (
                      "Vérifier le code"
                    )}
                  </button>

                  <div className="flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setShowOtp(false); setOtpCode(""); setError(""); }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ← Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary hover:underline"
                    >
                      Renvoyer le code
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}