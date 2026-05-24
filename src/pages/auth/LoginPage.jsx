// Redesigned following SAHTECK brand guidelines
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Shield,
  Loader2,
  LogIn,
  RefreshCw,
} from "lucide-react";

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

  /* ─── Shared style helpers ──────────────────────────────── */
  const inputBase =
    "w-full py-3 rounded-lg text-sm outline-none transition-all duration-200";
  const handleFocus = (e) => (e.target.style.border = "1.5px solid #0052FF");
  const handleBlur  = (e) => (e.target.style.border = "1.5px solid transparent");
  const inputStyle  = { background: "#F1F5F9", color: "#0A0F1E", border: "1.5px solid transparent" };

  const btnDisabled = loading || cooldown > 0;
  const primaryBtnStyle = {
    background: btnDisabled ? "#94A3B8" : "linear-gradient(135deg, #0052FF, #00A3FF)",
    cursor: btnDisabled ? "not-allowed" : "pointer",
    boxShadow: btnDisabled ? "none" : "0 4px 14px rgba(0,82,255,0.30)",
  };

  /* ─── Button label helpers (avoid nested ternaries in JSX) ── */
  let loginBtnLabel;
  if (cooldown > 0) {
    loginBtnLabel = `${t("auth.retry_in")} ${cooldown}s`;
  } else if (loading) {
    loginBtnLabel = <><Loader2 size={16} className="animate-spin" />{t("auth.connecting")}</>;
  } else {
    loginBtnLabel = <><LogIn size={16} />{t("auth.sign_in")}</>;
  }

  let otpBtnLabel;
  if (cooldown > 0) {
    otpBtnLabel = `${t("auth.otp_retry_in")} ${cooldown}s`;
  } else if (loading) {
    otpBtnLabel = <><Loader2 size={16} className="animate-spin" />{t("auth.otp_verifying")}</>;
  } else {
    otpBtnLabel = <><Shield size={16} />{t("auth.otp_verify")}</>;
  }

  /* ─── Error banner ──────────────────────────────────────── */
  const errorBanner = error && (
    <div
      className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
      style={{ background: "#FEF2F2", color: "#EF4444" }}
    >
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  );

  /* ─── Login panel ───────────────────────────────────────── */
  const loginPanel = (
    <>
      <div className="mb-8 flex flex-col items-center text-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "linear-gradient(135deg, #0052FF, #00A3FF)" }}
        >
          <LogIn size={22} color="white" />
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#0A0F1E" }}>
          {t("auth.welcome")}
        </h1>
        <p className="text-sm" style={{ color: "#64748B" }}>
          {t("auth.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
            style={{ color: "#64748B" }}
          >
            {t("auth.email")}
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#94A3B8" }}
            >
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="docteur@sahtech.tn"
              required
              className={`${inputBase} pl-10 pr-4`}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
            style={{ color: "#64748B" }}
          >
            {t("auth.password")}
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#94A3B8" }}
            >
              <Lock size={16} />
            </span>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`${inputBase} pl-10 pr-11`}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
              style={{ color: "#94A3B8" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0052FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {errorBanner}

        <button
          type="submit"
          disabled={btnDisabled}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200"
          style={primaryBtnStyle}
        >
          {loginBtnLabel}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm" style={{ color: "#64748B" }}>
          {t("auth.no_account")}{" "}
          <Link
            to="/signup"
            className="font-semibold transition-colors duration-200 hover:underline"
            style={{ color: "#0052FF" }}
          >
            {t("auth.register_link")}
          </Link>
        </p>
      </div>
    </>
  );

  /* ─── OTP panel ─────────────────────────────────────────── */
  const otpPanel = (
    <>
      <button
        type="button"
        onClick={() => {
          setShowOtp(false);
          setOtpCode("");
          setError("");
        }}
        className="flex items-center gap-2 text-sm font-medium mb-8 transition-colors duration-200"
        style={{ color: "#64748B" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0A0F1E")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
      >
        <ArrowLeft size={16} />
        {t("auth.otp_previous_step")}
      </button>

      <div className="mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "linear-gradient(135deg, #0052FF, #00A3FF)" }}
        >
          <Shield size={22} color="white" />
        </div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: "#0A0F1E" }}>
          {t("auth.otp_title")}
        </h2>
        <p className="text-sm" style={{ color: "#64748B" }}>
          {t("auth.otp_desc")}{" "}
          <span className="font-semibold" style={{ color: "#0052FF" }}>
            {userEmail}
          </span>
        </p>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <div>
          <label
            className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
            style={{ color: "#64748B" }}
          >
            {t("auth.otp_label")}
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            required
            className="w-full py-4 rounded-lg text-center text-2xl font-bold tracking-[0.6em] outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {errorBanner}

        <button
          type="submit"
          disabled={btnDisabled}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200"
          style={primaryBtnStyle}
        >
          {otpBtnLabel}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
          style={{ background: "#EFF6FF", color: "#0052FF", border: "1.5px solid #DBEAFE" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#DBEAFE")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#EFF6FF")}
        >
          <RefreshCw size={14} />
          {t("auth.otp_resend")}
        </button>
      </form>
    </>
  );

  /* ─── Render ────────────────────────────────────────────── */
  return (
    <AuthLayout maxWidth="md">
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 2px 24px rgba(0,82,255,0.10)" }}
      >
        {/* Brand accent strip */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(135deg, #0052FF, #00A3FF)" }}
        />

        <div className="p-8 md:p-10">
          {showOtp ? otpPanel : loginPanel}
        </div>
      </div>
    </AuthLayout>
  );
}
