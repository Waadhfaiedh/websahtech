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

EyeIcon.propTypes = { open: PropTypes.bool.isRequired };

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

  // Existing clinics the doctor can link to during registration
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
    if (!form.fullName.trim()) { setError("Le nom complet est requis"); return false; }
    if (!form.email.trim()) { setError("L'email est requis"); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { setError("Veuillez entrer une adresse email valide"); return false; }
    if (!form.password) { setError("Le mot de passe est requis"); return false; }
    if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères"); return false; }
    if (form.password !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas"); return false; }
    if (!form.phone.trim()) { setError("Le numéro de téléphone est requis"); return false; }
    if (!form.address.trim()) { setError("L'adresse est requise"); return false; }
    if (role === "DOCTOR") {
      if (!form.speciality.trim()) { setError("La spécialité est requise"); return false; }
      if (!form.bio.trim()) { setError("La biographie est requise"); return false; }
      if (!form.licenseNumber.trim()) { setError("Le numéro de licence est requis"); return false; }
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
      toast.success("Email vérifié ! Bienvenue sur SAHTECK.");
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/specialist/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Code invalide";
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
      toast.success("Code OTP renvoyé");
    } catch {
      toast.error("Échec de l'envoi du code");
    }
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <AuthLayout maxWidth={step === 1 ? "md" : "lg"}>
      {/* ─── Step 1: Role selection ─────────────────────────── */}
      {step === 1 && (
        <>
          <h1 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Inscrivez-vous pour continuer
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Sélectionnez votre type de compte
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 space-y-4">
            <button
              onClick={() => handleSelectRole("ADMIN")}
              className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Administrateur</p>
                  <p className="text-sm text-gray-500 mt-0.5">Gérez la plateforme et les utilisateurs</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => handleSelectRole("DOCTOR")}
              className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Spécialiste</p>
                  <p className="text-sm text-gray-500 mt-0.5">Offrez vos services médicaux</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <p className="text-center text-sm text-gray-600 pt-6 mt-2 border-t border-gray-100">
              Vous avez déjà un compte?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">Se connecter</Link>
            </p>
          </div>
        </>
      )}

      {/* ─── Step 2: Registration form ──────────────────────── */}
      {step === 2 && (
        <>
          <h1 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-6">
            Créer un compte {role === "ADMIN" ? "Administrateur" : "Spécialiste"}
          </h1>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <button
              type="button"
              onClick={handleBackToRoleSelection}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Étape précédente
            </button>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal section */}
              <div>
                <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">
                  Informations personnelles
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Nom complet *</label>
                    <input type="text" value={form.fullName} onChange={(e) => handleField("fullName", e.target.value)} className="input-field" placeholder="Dr. Jean Dupont" required />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => handleField("email", e.target.value)} className="input-field" placeholder="docteur@sahtech.tn" required />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">Mot de passe *</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => handleField("password", e.target.value)} className="input-field pr-10" placeholder="••••••••" required />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle password visibility">
                          <EyeIcon open={showPass} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">Confirmer *</label>
                      <div className="relative">
                        <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={(e) => handleField("confirmPassword", e.target.value)} className="input-field pr-10" placeholder="••••••••" required />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle password visibility">
                          <EyeIcon open={showConfirm} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">Téléphone *</label>
                      <input type="tel" value={form.phone} onChange={(e) => handleField("phone", e.target.value)} className="input-field" placeholder="50123456" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">Genre</label>
                      <select value={form.gender} onChange={(e) => handleField("gender", e.target.value)} className="input-field">
                        <option value="OTHER">Sélectionner...</option>
                        <option value="MALE">Homme</option>
                        <option value="FEMALE">Femme</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Adresse *</label>
                    <input type="text" value={form.address} onChange={(e) => handleField("address", e.target.value)} className="input-field" placeholder="Rue, Ville" required />
                  </div>
                </div>
              </div>

              {/* Doctor professional section */}
              {role === "DOCTOR" && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">
                    Informations professionnelles
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">Spécialité *</label>
                      <input type="text" value={form.speciality} onChange={(e) => handleField("speciality", e.target.value)} className="input-field" placeholder="Cardiologie" required />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">Biographie *</label>
                      <textarea value={form.bio} onChange={(e) => handleField("bio", e.target.value)} className="input-field resize-none" rows={4} placeholder="Décrivez votre expérience et expertise..." required />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">Numéro de licence *</label>
                      <input type="text" value={form.licenseNumber} onChange={(e) => handleField("licenseNumber", e.target.value)} className="input-field" placeholder="1234/12" required />
                    </div>

                    {/* Link to existing clinics (optional) */}
                    {availableClinics.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Lier à des cliniques existantes{" "}
                          <span className="text-gray-400 font-normal">(optionnel)</span>
                        </label>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                          {availableClinics.map((clinic) => (
                            <label
                              key={clinic.clinicId}
                              className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 rounded p-1"
                            >
                              <input
                                type="checkbox"
                                checked={form.clinicIds.includes(clinic.clinicId)}
                                onChange={(e) => handleClinicToggle(clinic.clinicId, e.target.checked)}
                                className="rounded border-gray-300 text-primary"
                              />
                              <span className="text-sm text-gray-700 font-medium">{clinic.name}</span>
                              {clinic.address && (
                                <span className="text-xs text-gray-400 truncate">— {clinic.address}</span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {form.clinicIds.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                          Clinique principale{" "}
                          <span className="text-gray-400 font-normal">(optionnel)</span>
                        </label>
                        <select
                          value={form.primaryClinicId}
                          onChange={(e) => handleField("primaryClinicId", e.target.value)}
                          className="input-field"
                        >
                          <option value="">— Aucune clinique principale —</option>
                          {availableClinics
                            .filter((c) => form.clinicIds.includes(c.clinicId))
                            .map((c) => (
                              <option key={c.clinicId} value={c.clinicId}>{c.name}</option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Location picker */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={form.latitude}
                          onChange={(e) => handleField("latitude", e.target.value)}
                          className="input-field"
                          placeholder="Cliquer sur la carte"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={form.longitude}
                          onChange={(e) => handleField("longitude", e.target.value)}
                          className="input-field"
                          placeholder="Cliquer sur la carte"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800">
                          Position du cabinet sur la carte
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowClinicMap((prev) => !prev)}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          {showClinicMap ? "Masquer" : "Ouvrir la carte"}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Cliquez sur la carte pour sélectionner l'emplacement exact du cabinet.
                        Les coordonnées seront remplies automatiquement.
                      </p>

                      {showClinicMap && (
                        <div className="h-72 w-full overflow-hidden rounded-lg border border-gray-200">
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
                                  color: "#1d4ed8",
                                  fillColor: "#2563eb",
                                  fillOpacity: 0.9,
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
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Création du compte...
                  </>
                ) : (
                  "Créer un compte"
                )}
              </button>

              <p className="text-center text-sm text-gray-600 pt-6 mt-2 border-t border-gray-100">
                Vous avez déjà un compte?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Se connecter</Link>
              </p>
            </form>
          </div>
        </>
      )}

      {/* ─── Step 3: Email OTP verification ─────────────────── */}
      {step === 3 && (
        <>
          <h1 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-6">
            Vérification de l'email
          </h1>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Un code de vérification a été envoyé à{" "}
                <span className="font-semibold text-gray-800">{signupResult?.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifySignupOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Code OTP
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

              {otpError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{otpError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={otpLoading}
                className="btn-primary w-full justify-center py-3 text-base disabled:opacity-70"
              >
                {otpLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Vérification...
                  </>
                ) : (
                  "Vérifier le code"
                )}
              </button>

              <button
                type="button"
                onClick={handleResendSignupOtp}
                className="w-full text-center text-sm text-primary hover:underline py-2"
              >
                Renvoyer le code
              </button>
            </form>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
