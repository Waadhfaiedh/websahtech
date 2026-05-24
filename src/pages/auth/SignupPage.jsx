// Redesigned following SAHTECK brand guidelines
import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import AuthLayout from "../../components/layout/AuthLayout";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import {
  Zap,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  FileText,
  Building2,
  AlertCircle,
  Loader2,
  Shield,
  RefreshCw,
  Map,
  CheckCircle2,
} from "lucide-react";

// Tunisia geographic center — used when no location has been picked yet
const TUNISIA_CENTER = [33.8869, 9.5375];
const TUNISIA_ZOOM = 7;

function ClinicLocationPicker({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

ClinicLocationPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

/* ── Shared input style helpers ─────────────────────────────── */
const inputBase =
  "w-full py-3 rounded-lg text-sm outline-none transition-all duration-200";
const inputStyle = {
  background: "#F1F5F9",
  color: "#0A0F1E",
  border: "1.5px solid transparent",
};
const handleFocus = (e) => (e.target.style.border = "1.5px solid #0052FF");
const handleBlur  = (e) => (e.target.style.border = "1.5px solid transparent");

/* ── Step progress indicator ────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={
              s < current
                ? { background: "#10B981", color: "white" }
                : s === current
                ? { background: "linear-gradient(135deg, #0052FF, #00A3FF)", color: "white" }
                : { background: "#F1F5F9", color: "#94A3B8" }
            }
          >
            {s < current ? <CheckCircle2 size={14} /> : s}
          </div>
          {s < 3 && (
            <div
              className="w-10 h-0.5 mx-1 transition-all duration-300"
              style={{ background: s < current ? "#10B981" : "#E2E8F0" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
StepIndicator.propTypes = { current: PropTypes.number.isRequired };

/* ── Labeled input wrapper with optional leading icon ────────── */
function InputField({ label, icon: Icon, children }) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
        style={{ color: "#64748B" }}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#94A3B8" }}
          >
            <Icon size={16} />
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
InputField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
};

/* ── Section header with blue accent bar ────────────────────── */
function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div
        className="h-4 w-1 rounded-full flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #0052FF, #00A3FF)" }}
      />
      <span
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color: "#64748B" }}
      >
        {label}
      </span>
    </div>
  );
}
SectionHeader.propTypes = { label: PropTypes.string.isRequired };

/* ── Error banner ───────────────────────────────────────────── */
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
      style={{ background: "#FEF2F2", color: "#EF4444" }}
    >
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
ErrorBanner.propTypes = { message: PropTypes.string };

/* ── Primary submit button ──────────────────────────────────── */
function PrimaryButton({ loading, disabled, children, ...props }) {
  const isDisabled = loading || disabled;
  return (
    <button
      disabled={isDisabled}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200"
      style={{
        background: isDisabled
          ? "#94A3B8"
          : "linear-gradient(135deg, #0052FF, #00A3FF)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        boxShadow: isDisabled ? "none" : "0 4px 14px rgba(0,82,255,0.30)",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
PrimaryButton.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

/* ── Card wrapper ───────────────────────────────────────────── */
function Card({ children }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 2px 24px rgba(0,82,255,0.10)" }}
    >
      <div
        className="h-1.5 w-full"
        style={{ background: "linear-gradient(135deg, #0052FF, #00A3FF)" }}
      />
      <div className="p-8 md:p-10">{children}</div>
    </div>
  );
}
Card.propTypes = { children: PropTypes.node.isRequired };

/* ════════════════════════════════════════════════════════════ */
export default function SignupPage() {
  const { t } = useTranslation();
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showClinicMap, setShowClinicMap] = useState(false);
  const [error, setError] = useState("");

  const [availableClinics, setAvailableClinics] = useState([]);

  // OTP verification (step 3)
  const [signupResult, setSignupResult] = useState(null); // { userId, email }
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    address: "",
    speciality: "",
    bio: "",
    licenseNumber: "",
    clinicIds: [],
    primaryClinicId: "",
    latitude: "",
    longitude: "",
  });

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    setError("");
  };

  const handleBackToRoleSelection = () => {
    setStep(1);
    setRole(null);
    setError("");
  };

  const handleField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleMapSelect = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: Number(lat).toFixed(6),
      longitude: Number(lng).toFixed(6),
    }));
  };

  const handleClinicToggle = (clinicId, checked) => {
    setForm((prev) => {
      const newIds = checked
        ? [...prev.clinicIds, clinicId]
        : prev.clinicIds.filter((id) => id !== clinicId);
      return {
        ...prev,
        clinicIds: newIds,
        primaryClinicId: newIds.includes(prev.primaryClinicId)
          ? prev.primaryClinicId
          : "",
      };
    });
  };

  const parsedLatitude = Number(form.latitude);
  const parsedLongitude = Number(form.longitude);
  const hasValidCoordinates =
    form.latitude !== "" &&
    form.longitude !== "" &&
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude);
  const mapCenter = hasValidCoordinates
    ? [parsedLatitude, parsedLongitude]
    : TUNISIA_CENTER;
  const mapZoom = hasValidCoordinates ? 13 : TUNISIA_ZOOM;

  const fetchAvailableClinics = useCallback(async () => {
    try {
      const res = await api.get("/users/clinics");
      const data = res.data?.data ?? res.data;
      setAvailableClinics(Array.isArray(data) ? data : []);
    } catch {
      // Clinic linking is optional — silently skip if unavailable
    }
  }, []);

  useEffect(() => {
    if (role === "DOCTOR" && step === 2) {
      fetchAvailableClinics();
    }
  }, [role, step, fetchAvailableClinics]);

  const validateForm = () => {
    if (!form.fullName.trim()) { setError(t("signup.val_name")); return false; }
    if (!form.email.trim()) { setError(t("signup.val_email")); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { setError(t("signup.val_email_invalid")); return false; }
    if (!form.password) { setError(t("signup.val_password")); return false; }
    if (form.password.length < 6) { setError(t("signup.val_password_length")); return false; }
    if (form.password !== form.confirmPassword) { setError(t("signup.val_password_match")); return false; }
    if (!form.phone.trim()) { setError(t("signup.val_phone")); return false; }
    if (!form.address.trim()) { setError(t("signup.val_address")); return false; }
    if (role === "DOCTOR") {
      if (!form.speciality.trim()) { setError(t("signup.val_specialty")); return false; }
      if (!form.bio.trim()) { setError(t("signup.val_bio")); return false; }
      if (!form.licenseNumber.trim()) { setError(t("signup.val_license")); return false; }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const signupData = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        gender: form.gender,
        address: form.address,
        role,
      };

      if (role === "DOCTOR") {
        signupData.speciality = form.speciality;
        signupData.bio = form.bio;
        signupData.licenseNumber = form.licenseNumber;
        if (form.latitude) signupData.latitude = Number.parseFloat(form.latitude);
        if (form.longitude) signupData.longitude = Number.parseFloat(form.longitude);
        if (form.clinicIds.length > 0) signupData.clinicIds = form.clinicIds;
        if (form.primaryClinicId) signupData.primaryClinicId = form.primaryClinicId;
      }

      const res = await api.post("/users/signup", signupData);
      const { userId, email } = res.data;
      setSignupResult({ userId, email: email || form.email });
      setStep(3);
    } catch (err) {
      const message = err.response?.data?.message || t("auth.error");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: verify EMAIL_VERIFICATION OTP ───────────────────
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);
    try {
      const user = await verifyOtp(signupResult.userId, otpCode, "EMAIL_VERIFICATION");
      toast.success(t("signup.email_verified"));
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/specialist/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || t("signup.invalid_code");
      setOtpError(message);
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendSignupOtp = async () => {
    try {
      await api.post("/otp/send", {
        userId: signupResult.userId,
        email: signupResult.email,
        type: "EMAIL_VERIFICATION",
      });
      toast.success(t("signup.otp_sent"));
    } catch {
      toast.error(t("signup.resend_failed"));
    }
  };

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <AuthLayout maxWidth={step === 1 ? "md" : "lg"}>

      {/* ─── Step 1: Role selection ─────────────────────────── */}
      {step === 1 && (
        <Card>
          <StepIndicator current={1} />
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#0A0F1E" }}>
              {t("signup.title")}
            </h1>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {t("signup.subtitle")}
            </p>
          </div>

          <div className="space-y-3">
            {/* Admin card */}
            <button
              onClick={() => handleSelectRole("ADMIN")}
              className="w-full p-5 rounded-xl text-left transition-all duration-200 bg-white"
              style={{ border: "1.5px solid #E2E8F0" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1.5px solid #0052FF";
                e.currentTarget.style.background = "#F0F5FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1.5px solid #E2E8F0";
                e.currentTarget.style.background = "white";
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FEF2F2" }}
                >
                  <Zap size={22} color="#EF4444" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold text-sm" style={{ color: "#0A0F1E" }}>
                    {t("signup.admin_title")}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                    {t("signup.admin_desc")}
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: "#CBD5E1", flexShrink: 0 }} />
              </div>
            </button>

            {/* Doctor card */}
            <button
              onClick={() => handleSelectRole("DOCTOR")}
              className="w-full p-5 rounded-xl text-left transition-all duration-200 bg-white"
              style={{ border: "1.5px solid #E2E8F0" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1.5px solid #0052FF";
                e.currentTarget.style.background = "#F0F5FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1.5px solid #E2E8F0";
                e.currentTarget.style.background = "white";
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#EFF6FF" }}
                >
                  <Stethoscope size={22} color="#0052FF" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold text-sm" style={{ color: "#0A0F1E" }}>
                    {t("signup.specialist_title")}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                    {t("signup.specialist_desc")}
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: "#CBD5E1", flexShrink: 0 }} />
              </div>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm" style={{ color: "#64748B" }}>
              {t("signup.already_account")}{" "}
              <Link
                to="/login"
                className="font-semibold hover:underline transition-colors duration-200"
                style={{ color: "#0052FF" }}
              >
                {t("signup.login_link")}
              </Link>
            </p>
          </div>
        </Card>
      )}

      {/* ─── Step 2: Registration form ──────────────────────── */}
      {step === 2 && (
        <Card>
          <StepIndicator current={2} />

          {/* Header row */}
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={handleBackToRoleSelection}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={{ background: "#F1F5F9" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E2E8F0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F1F5F9")}
            >
              <ArrowLeft size={16} style={{ color: "#64748B" }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: "#0A0F1E" }}>
              {role === "ADMIN" ? t("signup.create_admin") : t("signup.create_specialist")}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ── Personal info ── */}
            <div>
              <SectionHeader label={t("signup.personal_info")} />
              <div className="space-y-4">
                <InputField label={`${t("signup.full_name")} *`} icon={User}>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => handleField("fullName", e.target.value)}
                    placeholder={t("signup.full_name_placeholder")}
                    required
                    className={`${inputBase} pl-10 pr-4`}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </InputField>

                <InputField label={`${t("signup.email")} *`} icon={Mail}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleField("email", e.target.value)}
                    placeholder={t("signup.email_placeholder")}
                    required
                    className={`${inputBase} pl-10 pr-4`}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </InputField>

                {/* Password row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                      style={{ color: "#64748B" }}
                    >
                      {t("signup.password")} *
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
                        value={form.password}
                        onChange={(e) => handleField("password", e.target.value)}
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
                        aria-label="Toggle password"
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                        style={{ color: "#94A3B8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#0052FF")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                      style={{ color: "#64748B" }}
                    >
                      {t("signup.confirm_password")} *
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "#94A3B8" }}
                      >
                        <Lock size={16} />
                      </span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => handleField("confirmPassword", e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`${inputBase} pl-10 pr-11`}
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        aria-label="Toggle password"
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                        style={{ color: "#94A3B8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#0052FF")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phone + gender */}
                <div className="grid md:grid-cols-2 gap-4">
                  <InputField label={`${t("signup.phone")} *`} icon={Phone}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleField("phone", e.target.value)}
                      placeholder={t("signup.phone_placeholder")}
                      required
                      className={`${inputBase} pl-10 pr-4`}
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </InputField>

                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                      style={{ color: "#64748B" }}
                    >
                      {t("signup.gender")}
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => handleField("gender", e.target.value)}
                      className={`${inputBase} px-4`}
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    >
                      <option value="OTHER">{t("signup.gender_select")}</option>
                      <option value="MALE">{t("signup.gender_male")}</option>
                      <option value="FEMALE">{t("signup.gender_female")}</option>
                    </select>
                  </div>
                </div>

                <InputField label={`${t("signup.address")} *`} icon={MapPin}>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleField("address", e.target.value)}
                    placeholder={t("signup.address_placeholder")}
                    required
                    className={`${inputBase} pl-10 pr-4`}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </InputField>
              </div>
            </div>

            {/* ── Doctor professional info ── */}
            {role === "DOCTOR" && (
              <div>
                <SectionHeader label={t("signup.professional_info")} />
                <div className="space-y-4">
                  <InputField label={`${t("signup.specialty")} *`} icon={Stethoscope}>
                    <input
                      type="text"
                      value={form.speciality}
                      onChange={(e) => handleField("speciality", e.target.value)}
                      placeholder={t("signup.specialty_placeholder")}
                      required
                      className={`${inputBase} pl-10 pr-4`}
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </InputField>

                  {/* Bio */}
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                      style={{ color: "#64748B" }}
                    >
                      {t("signup.bio")} *
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-3 pointer-events-none"
                        style={{ color: "#94A3B8" }}
                      >
                        <FileText size={16} />
                      </span>
                      <textarea
                        value={form.bio}
                        onChange={(e) => handleField("bio", e.target.value)}
                        placeholder={t("signup.bio_placeholder")}
                        required
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all duration-200 resize-none"
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </div>
                  </div>

                  <InputField label={`${t("signup.license_number")} *`} icon={FileText}>
                    <input
                      type="text"
                      value={form.licenseNumber}
                      onChange={(e) => handleField("licenseNumber", e.target.value)}
                      placeholder={t("signup.license_placeholder")}
                      required
                      className={`${inputBase} pl-10 pr-4`}
                      style={inputStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </InputField>

                  {/* Link to existing clinics */}
                  {availableClinics.length > 0 && (
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                        style={{ color: "#64748B" }}
                      >
                        {t("signup.link_clinics")}{" "}
                        <span className="normal-case font-normal" style={{ color: "#94A3B8" }}>
                          ({t("signup.optional")})
                        </span>
                      </label>
                      <div
                        className="space-y-1 max-h-48 overflow-y-auto rounded-xl p-3"
                        style={{ background: "#F8FAFF", border: "1.5px solid #E2E8F0" }}
                      >
                        {availableClinics.map((clinic) => (
                          <label
                            key={clinic.clinicId}
                            className="flex items-center gap-3 cursor-pointer rounded-lg p-2 transition-colors duration-150"
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#EFF6FF")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <input
                              type="checkbox"
                              checked={form.clinicIds.includes(clinic.clinicId)}
                              onChange={(e) => handleClinicToggle(clinic.clinicId, e.target.checked)}
                              className="rounded"
                              style={{ accentColor: "#0052FF" }}
                            />
                            <Building2 size={14} style={{ color: "#94A3B8", flexShrink: 0 }} />
                            <span className="text-sm font-medium flex-1 min-w-0" style={{ color: "#0A0F1E" }}>
                              {clinic.name}
                            </span>
                            {clinic.address && (
                              <span className="text-xs truncate" style={{ color: "#94A3B8" }}>
                                {clinic.address}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary clinic selector */}
                  {form.clinicIds.length > 0 && (
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                        style={{ color: "#64748B" }}
                      >
                        {t("signup.primary_clinic")}{" "}
                        <span className="normal-case font-normal" style={{ color: "#94A3B8" }}>
                          ({t("signup.optional")})
                        </span>
                      </label>
                      <select
                        value={form.primaryClinicId}
                        onChange={(e) => handleField("primaryClinicId", e.target.value)}
                        className={`${inputBase} px-4`}
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      >
                        <option value="">{t("signup.no_primary_clinic")}</option>
                        {availableClinics
                          .filter((c) => form.clinicIds.includes(c.clinicId))
                          .map((c) => (
                            <option key={c.clinicId} value={c.clinicId}>{c.name}</option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={t("signup.latitude")}>
                      <input
                        type="number"
                        step="any"
                        value={form.latitude}
                        onChange={(e) => handleField("latitude", e.target.value)}
                        placeholder={t("signup.map_hint")}
                        className={`${inputBase} px-4`}
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </InputField>
                    <InputField label={t("signup.longitude")}>
                      <input
                        type="number"
                        step="any"
                        value={form.longitude}
                        onChange={(e) => handleField("longitude", e.target.value)}
                        placeholder={t("signup.map_hint")}
                        className={`${inputBase} px-4`}
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </InputField>
                  </div>

                  {/* Map picker section */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "#F8FAFF", border: "1.5px solid #E2E8F0" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Map size={16} style={{ color: "#0052FF" }} />
                        <p className="text-sm font-semibold" style={{ color: "#0A0F1E" }}>
                          {t("signup.map_section_title")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowClinicMap((prev) => !prev)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200"
                        style={
                          showClinicMap
                            ? { background: "#EFF6FF", color: "#0052FF", border: "1.5px solid #DBEAFE" }
                            : { background: "linear-gradient(135deg, #0052FF, #00A3FF)", color: "white" }
                        }
                      >
                        {showClinicMap ? t("signup.hide_map") : t("signup.map_open")}
                      </button>
                    </div>
                    <p className="text-xs mb-3" style={{ color: "#64748B" }}>
                      {t("signup.map_section_desc")}
                    </p>

                    {showClinicMap && (
                      <div className="h-72 w-full overflow-hidden rounded-xl" style={{ border: "1.5px solid #E2E8F0" }}>
                        <MapContainer
                          center={mapCenter}
                          zoom={mapZoom}
                          className="h-full w-full"
                          scrollWheelZoom
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <ClinicLocationPicker onSelect={handleMapSelect} />
                          {hasValidCoordinates && (
                            <CircleMarker
                              center={[parsedLatitude, parsedLongitude]}
                              radius={9}
                              pathOptions={{
                                color: "#0052FF",
                                fillColor: "#0052FF",
                                fillOpacity: 0.85,
                              }}
                            />
                          )}
                        </MapContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <ErrorBanner message={error} />

            <PrimaryButton type="submit" loading={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t("signup.creating")}
                </>
              ) : (
                t("signup.submit")
              )}
            </PrimaryButton>

            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-sm" style={{ color: "#64748B" }}>
                {t("signup.already_account")}{" "}
                <Link
                  to="/login"
                  className="font-semibold hover:underline transition-colors duration-200"
                  style={{ color: "#0052FF" }}
                >
                  {t("signup.login_link")}
                </Link>
              </p>
            </div>
          </form>
        </Card>
      )}

      {/* ─── Step 3: Email OTP verification ─────────────────── */}
      {step === 3 && (
        <Card>
          <StepIndicator current={3} />

          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #0052FF, #00A3FF)" }}
            >
              <Mail size={28} color="white" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#0A0F1E" }}>
              {t("signup.email_verification_title")}
            </h1>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {t("signup.email_verification_desc")}{" "}
              <span className="font-semibold" style={{ color: "#0052FF" }}>
                {signupResult?.email}
              </span>
            </p>
          </div>

          <form onSubmit={handleVerifySignupOtp} className="space-y-5">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                style={{ color: "#64748B" }}
              >
                {t("signup.otp_label")}
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

            <ErrorBanner message={otpError} />

            <PrimaryButton type="submit" loading={otpLoading}>
              {otpLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t("signup.verifying")}
                </>
              ) : (
                <>
                  <Shield size={16} />
                  {t("signup.verify_code")}
                </>
              )}
            </PrimaryButton>

            <button
              type="button"
              onClick={handleResendSignupOtp}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{ background: "#EFF6FF", color: "#0052FF", border: "1.5px solid #DBEAFE" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#DBEAFE")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#EFF6FF")}
            >
              <RefreshCw size={14} />
              {t("signup.resend_code")}
            </button>
          </form>
        </Card>
      )}
    </AuthLayout>
  );
}
