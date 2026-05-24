import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // OTP step
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setError("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // ─── Step 1: signin ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.require2FA) {
        setUserId(result.userId);
        setUserEmail(result.email);
        setShowOtp(true);
        toast.success(result.message || t("signup.otp_sent"));
      } else {
        if (result.role === "ADMIN") navigate("/admin/dashboard");
        else navigate("/specialist/dashboard");
      }
    } catch (err) {
      if (err.isRateLimit) {
        setError(err.message);
        setCooldown(err.retryAfter);
        toast.error(err.message);
      } else {
        const message = err.response?.data?.message || t("auth.error");
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: OTP ────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await verifyOtp(userId, otpCode);
      if (user.role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/specialist/dashboard");
    } catch (err) {
      if (err.isRateLimit) {
        setError(err.message);
        setCooldown(err.retryAfter);
        toast.error(err.message);
      } else {
        const message = err.response?.data?.message || t("signup.invalid_code");
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await api.post("/otp/send", {
        userId,
        email: userEmail,
        type: "TWO_FACTOR",
      });
      setError("");
      toast.success(res.data?.message || t("signup.otp_sent"));
    } catch {
      setError(t("signup.resend_failed"));
      toast.error(t("signup.resend_failed"));
    }
  };

  /* ─── UI helpers ─────────────────────────────────────────── */
  const EyeIcon = ({ open }) =>
    open ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <AuthLayout maxWidth="md">
      {/* Title above the card */}
      <h1 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-6">
        {t("auth.welcome")}
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        {!showOtp ? (
          // ─── Login form ────────────────────────────────────
          <>
            <p className="text-sm text-gray-500 mb-6">{t("auth.subtitle")}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  {t("auth.email")}
                </label>
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
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  {t("auth.password")}
                </label>
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
                    aria-label="Toggle password visibility"
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className={`btn-primary w-full justify-center py-3 text-base ${
                  cooldown > 0 ? "opacity-50 cursor-not-allowed" : "disabled:opacity-70"
                }`}
              >
                {cooldown > 0 ? (
                  `${t("auth.retry_in")} ${cooldown}s`
                ) : loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    {t("auth.connecting")}
                  </>
                ) : (
                  t("auth.sign_in")
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6 pt-6 border-t border-gray-100">
              {t("auth.no_account")}{" "}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                {t("auth.register_link")}
              </Link>
            </p>
          </>
        ) : (
          // ─── OTP form ──────────────────────────────────────
          <>
            <button
              type="button"
              onClick={() => {
                setShowOtp(false);
                setOtpCode("");
                setError("");
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t("auth.otp_previous_step")}
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{t("auth.otp_title")}</h2>
              <p className="text-sm text-gray-500">
                {t("auth.otp_desc")}{" "}
                <span className="font-medium text-gray-700">{userEmail}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  {t("auth.otp_label")}
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="input-field text-center text-2xl tracking-[0.5em] font-semibold"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className={`btn-primary w-full justify-center py-3 text-base ${
                  cooldown > 0 ? "opacity-50 cursor-not-allowed" : "disabled:opacity-70"
                }`}
              >
                {cooldown > 0 ? (
                  `${t("auth.otp_retry_in")} ${cooldown}s`
                ) : loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    {t("auth.otp_verifying")}
                  </>
                ) : (
                  t("auth.otp_verify")
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="w-full text-center text-sm text-primary hover:underline py-2"
              >
                {t("auth.otp_resend")}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}