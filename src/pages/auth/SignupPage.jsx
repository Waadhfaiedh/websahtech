import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import Logo from "../../components/common/Logo";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import api from "../../services/api";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";

const defaultClinicCenter = [36.8065, 10.1815];

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

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: role selection, 2: form
  const [role, setRole] = useState(null); // ADMIN or DOCTOR
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showClinicMap, setShowClinicMap] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    address: "",
    // Doctor specific
    speciality: "",
    bio: "",
    licenseNumber: "",
    clinic: "",
    location: "",
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

  const handleField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleMapSelect = (lat, lng) => {
    const latitude = Number(lat).toFixed(6);
    const longitude = Number(lng).toFixed(6);
    setForm((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const parsedLatitude = Number(form.latitude);
  const parsedLongitude = Number(form.longitude);
  const hasValidCoordinates =
    Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
  const mapCenter = hasValidCoordinates
    ? [parsedLatitude, parsedLongitude]
    : defaultClinicCenter;

  const validateForm = () => {
    if (!form.fullName.trim()) {
      setError("Le nom complet est requis");
      return false;
    }
    if (!form.email.trim()) {
      setError("L'email est requis");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Veuillez entrer une adresse email valide");
      return false;
    }
    if (!form.password) {
      setError("Le mot de passe est requis");
      return false;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    if (!form.phone.trim()) {
      setError("Le numéro de téléphone est requis");
      return false;
    }
    if (!form.address.trim()) {
      setError("L'adresse est requise");
      return false;
    }

    if (role === "DOCTOR") {
      if (!form.speciality.trim()) {
        setError("La spécialité est requise");
        return false;
      }
      if (!form.bio.trim()) {
        setError("La biographie est requise");
        return false;
      }
      if (!form.licenseNumber.trim()) {
        setError("Le numéro de licence est requis");
        return false;
      }
      if (!form.clinic.trim()) {
        setError("Le cabinet est requis");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const signupData = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        gender: form.gender,
        address: form.address,
        role: role,
      };

      if (role === "DOCTOR") {
        signupData.speciality = form.speciality;
        signupData.bio = form.bio;
        signupData.licenseNumber = form.licenseNumber;
        signupData.clinic = form.clinic;
        signupData.location = form.location;
        if (form.latitude)
          signupData.latitude = Number.parseFloat(form.latitude);
        if (form.longitude)
          signupData.longitude = Number.parseFloat(form.longitude);
      }

      const res = await api.post("/users/signup", signupData);

      toast.success(
        res.data?.message ||
          "Compte créé avec succès! Veuillez vous connecter.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || t("auth.error");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface lg:relative">
      {/* Left panel */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-1/2 lg:flex bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {new Array(8).fill(null).map((_, i) => (
            <div
              key={`ring-${i}`}
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
            Rejoignez SAHTECH
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Créez un compte pour accéder à la plateforme de gestion médicale
            avec analyse IA, chat sécurisé et outils de planning avancés.
          </p>
          <div className="mt-8 flex gap-6">
            {["Sécurisé", "Intuitif", "Performant"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-blue-100">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200 text-sm relative z-10">
          © 2026 SAHTECH — Tous droits réservés
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col lg:ml-[50%]">
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            {step === 1 ? (
              // ─── Step 1: Role Selection ──────────────────────────────
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Créer un compte
                  </h1>
                  <p className="text-gray-500 mt-2">
                    Sélectionnez votre type de compte
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => handleSelectRole("ADMIN")}
                    className="w-full p-6 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          Administrateur
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Gérez la plateforme et les utilisateurs
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectRole("DOCTOR")}
                    className="w-full p-6 border-2 border-gray-300 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Spécialiste</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Offrez vos services médicaux
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <p className="text-center text-gray-600 mt-8">
                  Vous avez déjà un compte?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Se connecter
                  </Link>
                </p>
              </>
            ) : (
              // ─── Step 2: Registration Form ────────────────────────────
              <>
                <div className="mb-8">
                  <button
                    onClick={handleBackToRoleSelection}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Retour
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Créer un compte {role === "ADMIN" ? "Admin" : "Spécialiste"}
                  </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => handleField("fullName", e.target.value)}
                      className="input-field"
                      placeholder="Dr. Jean Dupont"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleField("email", e.target.value)}
                      className="input-field"
                      placeholder="docteur@sahtech.tn"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          handleField("password", e.target.value)
                        }
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) =>
                          handleField("confirmPassword", e.target.value)
                        }
                        className="input-field pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? (
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleField("phone", e.target.value)}
                      className="input-field"
                      placeholder="50123456"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => handleField("gender", e.target.value)}
                      className="input-field"
                    >
                      <option value="OTHER">Sélectionner...</option>
                      <option value="MALE">Homme</option>
                      <option value="FEMALE">Femme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => handleField("address", e.target.value)}
                      className="input-field"
                      placeholder="Rue, Ville"
                      required
                    />
                  </div>

                  {/* Doctor Specific Fields */}
                  {role === "DOCTOR" && (
                    <>
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Informations professionnelles
                        </h3>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Spécialité *
                        </label>
                        <input
                          type="text"
                          value={form.speciality}
                          onChange={(e) =>
                            handleField("speciality", e.target.value)
                          }
                          className="input-field"
                          placeholder="Cardiologie"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Biographie *
                        </label>
                        <textarea
                          value={form.bio}
                          onChange={(e) => handleField("bio", e.target.value)}
                          className="input-field resize-none"
                          rows={4}
                          placeholder="Décrivez votre expérience et expertise..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro de licence *
                        </label>
                        <input
                          type="text"
                          value={form.licenseNumber}
                          onChange={(e) =>
                            handleField("licenseNumber", e.target.value)
                          }
                          className="input-field"
                          placeholder="1234/12"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cabinet *
                        </label>
                        <input
                          type="text"
                          value={form.clinic}
                          onChange={(e) =>
                            handleField("clinic", e.target.value)
                          }
                          className="input-field"
                          placeholder="Nom du cabinet"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Localisation
                        </label>
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) =>
                            handleField("location", e.target.value)
                          }
                          className="input-field"
                          placeholder="Tunis, Tunisie"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={form.latitude}
                            className="input-field"
                            placeholder="Cliquer sur la carte"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={form.longitude}
                            className="input-field"
                            placeholder="Cliquer sur la carte"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-gray-800">
                            Position du cabinet sur la carte
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowClinicMap((prev) => !prev)}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            {showClinicMap
                              ? "Masquer la carte"
                              : "Ouvrir la carte"}
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">
                          Cliquez sur la carte pour sélectionner l'emplacement
                          exact du cabinet. Les coordonnées seront remplies
                          automatiquement.
                        </p>

                        {showClinicMap && (
                          <div className="h-72 w-full overflow-hidden rounded-lg border border-gray-200">
                            <MapContainer
                              center={mapCenter}
                              zoom={hasValidCoordinates ? 13 : 6}
                              className="h-full w-full"
                              scrollWheelZoom
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <ClinicLocationPicker
                                onSelect={handleMapSelect}
                              />
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
                    </>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3 text-base disabled:opacity-70 mt-6"
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
                </form>

                <p className="text-center text-gray-600 mt-6">
                  Vous avez déjà un compte?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Se connecter
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
