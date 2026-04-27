import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";

// ─── ImageCropper Component (same as specialist page) ──────────────
function ImageCropper({ image, onCrop, onClose }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createCroppedImage = async () => {
    try {
      const imageElement = new Image();
      imageElement.src = image;
      await new Promise((resolve) => {
        imageElement.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        imageElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCrop(blob);
          }
        },
        "image/jpeg",
        0.9,
      );
    } catch (error) {
      console.error("Error creating cropped image:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <h3 className="text-lg font-bold mb-4">Recadrer l'image</h3>

        <div className="relative h-80 mb-4 bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="zoom-slider"
            className="block text-sm text-gray-600 mb-2"
          >
            Zoom
          </label>
          <input
            id="zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={createCroppedImage}
            className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Appliquer
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

ImageCropper.propTypes = {
  image: PropTypes.string.isRequired,
  onCrop: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const ROLE_UI = {
  ADMIN: {
    label: "Administrateur",
    type: "admin",
    bgClass: "bg-red-500",
    textClass: "text-red-500",
  },
  DOCTOR: {
    label: "Médecin",
    type: "doctor",
    bgClass: "bg-blue-500",
    textClass: "text-blue-500",
  },
  PATIENT: {
    label: "Patient",
    type: "patient",
    bgClass: "bg-green-500",
    textClass: "text-green-500",
  },
};

const getRoleUi = (role) =>
  ROLE_UI[role] || {
    label: role || "",
    type: "patient",
    bgClass: "bg-green-500",
    textClass: "text-green-500",
  };

const addNumberFieldIfPresent = (target, key, value) => {
  if (value) {
    target[key] = Number.parseFloat(value);
  }
};

const addDoctorFields = (target, form) => {
  if (form.bio) target.bio = form.bio;
  if (form.clinic) target.clinic = form.clinic;
  if (form.location) target.location = form.location;
  addNumberFieldIfPresent(target, "latitude", form.latitude);
  addNumberFieldIfPresent(target, "longitude", form.longitude);
};

const addPatientFields = (target, form) => {
  if (form.age) target.age = form.age;
  addNumberFieldIfPresent(target, "weight", form.weight);
  addNumberFieldIfPresent(target, "height", form.height);
};

const buildUpdateData = (form, role) => {
  const updateData = {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    address: form.address,
  };

  if (role === "PATIENT") {
    addPatientFields(updateData, form);
  }

  if (role === "DOCTOR") {
    addDoctorFields(updateData, form);
  }

  return updateData;
};

// ─── Main AdminProfile Component ───────────────────────────────────
export default function AdminProfile() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    weight: "",
    height: "",
    bio: "",
    clinic: "",
    location: "",
    latitude: "",
    longitude: "",
  });
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ─── Load profile data ─────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/profile");
      setProfile(res.data);
      setForm({
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        age: res.data.patient?.age?.toString() || "",
        weight: res.data.patient?.weight?.toString() || "",
        height: res.data.patient?.height?.toString() || "",
        bio: res.data.specialist?.bio || "",
        clinic: res.data.specialist?.clinic || "",
        location: res.data.specialist?.location || "",
        latitude: res.data.specialist?.latitude?.toString() || "",
        longitude: res.data.specialist?.longitude?.toString() || "",
      });
      setError(null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Impossible de charger le profil");
      toast.error(
        err.response?.data?.message || "Impossible de charger le profil",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle file selection – open cropper ──────────────────────
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setTempImage(e.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ─── Upload cropped image ──────────────────────────────────────
  const uploadImage = async (croppedBlob) => {
    const formData = new FormData();
    formData.append("file", croppedBlob, "profile.jpg");

    setUploading(true);
    setShowCropper(false);

    try {
      const res = await api.post("/users/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      toast.success(
        res.data?.message || "Photo de profil mise à jour avec succès",
      );
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de l'upload de l'image",
      );
    } finally {
      setUploading(false);
      setTempImage(null);
    }
  };

  // ─── Update profile using /users/update-user ───────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = buildUpdateData(form, profile?.role);

      const res = await api.patch("/users/update-user", updateData);
      toast.success(res.data?.message || "Profil enregistré avec succès");

      await fetchProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du profil",
      );
    } finally {
      setSaving(false);
    }
  };

  // ─── Change password ───────────────────────────────────────────
  const handlePwSave = async () => {
    if (!pwForm.current || !pwForm.new || pwForm.new !== pwForm.confirm) {
      toast.error(
        "Veuillez remplir tous les champs correctement. Le nouveau mot de passe doit correspondre à la confirmation.",
      );
      return;
    }
    if (pwForm.new.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    try {
      const res = await api.patch("/users/change-password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.new,
      });
      setPwForm({ current: "", new: "", confirm: "" });
      toast.success(res.data?.message || "Mot de passe modifié avec succès");
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors du changement de mot de passe",
      );
    }
  };

  // ─── Toggle security (2FA/SFA) ────────────────────────────────
  const handleToggleSecurity = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/users/update-otp", {});
      setProfile((prev) => ({
        ...prev,
        security: prev?.security === "MFA" ? "SFA" : "MFA",
      }));
      toast.success(res.data?.message || "Paramètres de sécurité mis à jour");
    } catch (err) {
      console.error("Failed to update security:", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour des paramètres de sécurité",
      );
    } finally {
      setSaving(false);
    }
  };

  const getUserInitial = () => {
    if (profile?.fullName) return profile.fullName.charAt(0).toUpperCase();
    return "A";
  };

  const roleUi = getRoleUi(profile?.role);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
            {error}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn max-w-2xl">
        <PageHeader title={t("profile.title")} />

        {/* Avatar with upload capability (cropper enabled) */}
        <div className="card mb-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {profile?.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt={profile.fullName}
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white ${
                    roleUi.bgClass
                  }`}
                >
                  {getUserInitial()}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-1.5 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Changer la photo"
              >
                {uploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div>
              <p className="font-bold text-lg text-gray-900">
                {profile?.fullName}
              </p>
              <p className={`font-medium text-sm ${roleUi.textClass}`}>
                {roleUi.label}
              </p>
              <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Rest of your form remains the same (basic info, patient/specialist sections, password) */}
        {/* ... (keep all the existing JSX from your original AdminProfile after this point) ... */}

        {/* Basic Info */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">
            Informations du compte
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.full_name")}
              </label>
              <input
                value={form.fullName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fullName: e.target.value }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="input-field"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Téléphone (8 chiffres)
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="input-field"
                placeholder="12345678"
                maxLength={8}
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adresse
              </label>
              <input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                className="input-field"
                placeholder="Votre adresse"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t("common.save")}
              </>
            )}
          </button>
        </div>

        {/* Patient specific info */}
        {profile?.role === "PATIENT" && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">
              Informations médicales
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Âge
                </label>
                <input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, age: e.target.value }))
                  }
                  className="input-field"
                  placeholder="30"
                />
              </div>
              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Poids (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weight: e.target.value }))
                  }
                  className="input-field"
                  placeholder="70.5"
                />
              </div>
              <div>
                <label
                  htmlFor="height"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Taille (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  step="0.1"
                  value={form.height}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, height: e.target.value }))
                  }
                  className="input-field"
                  placeholder="175"
                />
              </div>
            </div>
          </div>
        )}

        {/* Specialist specific info */}
        {profile?.role === "DOCTOR" && profile?.specialist && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">
              Informations professionnelles
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Description de votre parcours et spécialités..."
                />
              </div>
              <div>
                <label
                  htmlFor="clinic"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cabinet
                </label>
                <input
                  id="clinic"
                  value={form.clinic}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, clinic: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Nom de votre cabinet"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Localisation
                </label>
                <input
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Ville, pays"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="latitude"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, latitude: e.target.value }))
                    }
                    className="input-field"
                    placeholder="36.8065"
                  />
                </div>
                <div>
                  <label
                    htmlFor="longitude"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, longitude: e.target.value }))
                    }
                    className="input-field"
                    placeholder="10.1815"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="doctor-status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Statut
                </label>
                <p
                  className={`text-sm font-medium ${profile.specialist.isValidated ? "text-green-600" : "text-orange-500"}`}
                >
                  <span id="doctor-status" className="sr-only">
                    Statut du spécialiste
                  </span>
                  {profile.specialist.isValidated
                    ? "✓ Validé"
                    : "⏳ En attente de validation"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin specific info */}
        {profile?.role === "ADMIN" && profile?.admin && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">
              Privilèges administrateur
            </h2>
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  profile.admin.canModerate
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {profile.admin.canModerate
                  ? "✓ Peut modérer"
                  : "Modération désactivée"}
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">
            Paramètres de sécurité
          </h2>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="font-medium text-gray-900">
                Authentification à deux facteurs
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {profile?.security === "MFA"
                  ? "Authentification multi-facteurs (2FA) activée"
                  : "Authentification simple (SFA) activée"}
              </p>
            </div>
            <button
              onClick={handleToggleSecurity}
              disabled={saving}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                profile?.security === "MFA"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              } disabled:opacity-50`}
            >
              {profile?.security === "MFA" ? "Désactiver 2FA" : "Activer 2FA"}
            </button>
          </div>
        </div>

        {/* Password change */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">
            {t("profile.change_password")}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.current_password")}
              </label>
              <input
                type="password"
                value={pwForm.current}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, current: e.target.value }))
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.new_password")}
              </label>
              <input
                type="password"
                value={pwForm.new}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, new: e.target.value }))
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.confirm_password")}
              </label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, confirm: e.target.value }))
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button onClick={handlePwSave} className="btn-primary mt-4">
            {t("profile.change_password")}
          </button>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCrop={uploadImage}
          onClose={() => {
            setShowCropper(false);
            setTempImage(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
