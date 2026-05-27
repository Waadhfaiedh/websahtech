// Redesigned following SAHTECK brand guidelines

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";
import {
  Camera,
  Check,
  ShieldCheck,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Ruler,
  Weight,
  Globe,
  Settings2,
  Shield,
  Upload,
} from "lucide-react";

// ─── ImageCropper Component ───────────────────────────────────────
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
    <div className="fixed inset-0 z-50 bg-[#0A0F1E]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-[20px] font-bold text-[#0A0F1E]">
            Recadrer l'image
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            Ajustez votre photo de profil avant l’enregistrement.
          </p>
        </div>

        <div className="p-6">
          <div className="relative h-80 rounded-2xl overflow-hidden bg-[#F1F5F9]">
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

          <div className="mt-6">
            <label className="block text-xs font-semibold text-[#64748B] mb-3 uppercase tracking-wide">
              Zoom
            </label>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
              className="w-full accent-[#0052FF]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={createCroppedImage}
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] text-white font-semibold shadow-[0_8px_24px_rgba(0,82,255,0.24)] hover:scale-[1.01] transition-all duration-200"
            >
              Appliquer
            </button>

            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-full border border-[#D6E4FF] bg-white text-[#0052FF] font-semibold hover:bg-[#EFF6FF] transition-all duration-200"
            >
              Annuler
            </button>
          </div>
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
    badge:
      "bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]",
  },
  DOCTOR: {
    label: "Médecin",
    badge:
      "bg-[#EFF6FF] text-[#0052FF] border border-[#BFDBFE]",
  },
  PATIENT: {
    label: "Patient",
    badge:
      "bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]",
  },
};

const getRoleUi = (role) =>
  ROLE_UI[role] || {
    label: role || "",
    badge:
      "bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]",
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

// ─── Reusable Input ───────────────────────────────────────────────
function InputField({
  label,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#64748B] mb-2 uppercase tracking-wide">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
        )}

        <input
          {...props}
          className={`w-full h-12 rounded-xl bg-[#F1F5F9] border border-transparent focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/10 outline-none transition-all duration-200 text-sm text-[#0A0F1E] placeholder:text-[#94A3B8] ${
            Icon ? "pl-12" : "px-4"
          } pr-4 ${className}`}
        />
      </div>
    </div>
  );
}

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  className: PropTypes.string,
};

// ─── Main AdminProfile Component ─────────────────────────────────
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

  const [pwForm, setPwForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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
        err.response?.data?.message ||
          "Impossible de charger le profil",
      );
    } finally {
      setLoading(false);
    }
  };

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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (croppedBlob) => {
    const formData = new FormData();

    formData.append("file", croppedBlob, "profile.jpg");

    setUploading(true);
    setShowCropper(false);

    try {
      const res = await api.post(
        "/users/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProfile((prev) => ({
        ...prev,
        imageUrl: res.data.imageUrl,
      }));

      toast.success(
        res.data?.message ||
          "Photo de profil mise à jour avec succès",
      );
    } catch (err) {
      console.error("Failed to upload image:", err);

      toast.error(
        err.response?.data?.message ||
          "Erreur lors de l'upload de l'image",
      );
    } finally {
      setUploading(false);
      setTempImage(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const updateData = buildUpdateData(
        form,
        profile?.role,
      );

      const res = await api.patch(
        "/users/update-user",
        updateData,
      );

      toast.success(
        res.data?.message ||
          "Profil enregistré avec succès",
      );

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

  const handlePwSave = async () => {
    if (
      !pwForm.current ||
      !pwForm.new ||
      pwForm.new !== pwForm.confirm
    ) {
      toast.error(
        "Veuillez remplir tous les champs correctement.",
      );

      return;
    }

    if (pwForm.new.length < 6) {
      toast.error(
        "Le mot de passe doit contenir au moins 6 caractères",
      );

      return;
    }

    try {
      const res = await api.patch(
        "/users/change-password",
        {
          currentPassword: pwForm.current,
          newPassword: pwForm.new,
        },
      );

      setPwForm({
        current: "",
        new: "",
        confirm: "",
      });

      toast.success(
        res.data?.message ||
          "Mot de passe modifié avec succès",
      );
    } catch (err) {
      console.error(
        "Failed to change password:",
        err,
      );

      toast.error(
        err.response?.data?.message ||
          "Erreur lors du changement de mot de passe",
      );
    }
  };

  const handleToggleSecurity = async () => {
    setSaving(true);

    try {
      const res = await api.patch(
        "/users/update-otp",
        {},
      );

      setProfile((prev) => ({
        ...prev,
        security:
          prev?.security === "MFA" ? "SFA" : "MFA",
      }));

      toast.success(
        res.data?.message ||
          "Paramètres de sécurité mis à jour",
      );
    } catch (err) {
      console.error(
        "Failed to update security:",
        err,
      );

      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour des paramètres de sécurité",
      );
    } finally {
      setSaving(false);
    }
  };

  const getUserInitial = () => {
    if (profile?.fullName) {
      return profile.fullName
        .charAt(0)
        .toUpperCase();
    }

    return "A";
  };

  const roleUi = getRoleUi(profile?.role);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[500px] flex items-center justify-center bg-[#F8FAFF]">
          <div className="w-12 h-12 rounded-full border-4 border-[#0052FF]/20 border-t-[#0052FF] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 bg-[#F8FAFF] min-h-screen">
          <div className="max-w-xl mx-auto bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-6 text-center">
            <p className="text-[#EF4444] font-medium">
              {error}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F8FAFF]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <PageHeader title={t("profile.title")} />

          {/* ─── Profile Hero ───────────────────────── */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,82,255,0.08)] mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  {profile?.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt={profile.fullName}
                      className="w-24 h-24 rounded-3xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#0052FF] to-[#00A3FF] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {getUserInitial()}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={20} />
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
                  <h1 className="text-[28px] font-bold text-[#0A0F1E]">
                    {profile?.fullName}
                  </h1>

                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${roleUi.badge}`}
                    >
                      {roleUi.label}
                    </span>

                    <span className="text-sm text-[#64748B]">
                      {profile?.email}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="h-12 px-6 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,82,255,0.24)] hover:scale-[1.01] transition-all duration-200 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {t("common.save")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ─── Main Grid ─────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="xl:col-span-2 space-y-8">
              {/* Account Info */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
                    <User
                      size={20}
                      className="text-[#0052FF]"
                    />
                  </div>

                  <div>
                    <h2 className="text-[20px] font-semibold text-[#0A0F1E]">
                      Informations du compte
                    </h2>

                    <p className="text-sm text-[#64748B]">
                      Gérez vos informations personnelles.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label={t("profile.full_name")}
                    icon={User}
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        fullName: e.target.value,
                      }))
                    }
                  />

                  <InputField
                    label={t("auth.email")}
                    type="email"
                    icon={Mail}
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                  />

                  <InputField
                    label="Téléphone"
                    type="tel"
                    icon={Phone}
                    value={form.phone}
                    maxLength={8}
                    placeholder="12345678"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        phone: e.target.value,
                      }))
                    }
                  />

                  <InputField
                    label="Adresse"
                    icon={MapPin}
                    value={form.address}
                    placeholder="Votre adresse"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Patient Section */}
              {profile?.role === "PATIENT" && (
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
                      <ShieldCheck
                        size={20}
                        className="text-[#10B981]"
                      />
                    </div>

                    <div>
                      <h2 className="text-[20px] font-semibold text-[#0A0F1E]">
                        Informations médicales
                      </h2>

                      <p className="text-sm text-[#64748B]">
                        Données de santé du patient.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <InputField
                      label="Âge"
                      type="number"
                      icon={User}
                      value={form.age}
                      placeholder="30"
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          age: e.target.value,
                        }))
                      }
                    />

                    <InputField
                      label="Poids (kg)"
                      type="number"
                      step="0.1"
                      icon={Weight}
                      value={form.weight}
                      placeholder="70.5"
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          weight: e.target.value,
                        }))
                      }
                    />

                    <InputField
                      label="Taille (cm)"
                      type="number"
                      step="0.1"
                      icon={Ruler}
                      value={form.height}
                      placeholder="175"
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          height: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Doctor Section */}
              {profile?.role === "DOCTOR" &&
                profile?.specialist && (
                  <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
                        <Building2
                          size={20}
                          className="text-[#0052FF]"
                        />
                      </div>

                      <div>
                        <h2 className="text-[20px] font-semibold text-[#0A0F1E]">
                          Informations professionnelles
                        </h2>

                        <p className="text-sm text-[#64748B]">
                          Profil professionnel du spécialiste.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-2 uppercase tracking-wide">
                          Bio
                        </label>

                        <div className="relative">
                          <FileText
                            size={18}
                            className="absolute left-4 top-4 text-[#94A3B8]"
                          />

                          <textarea
                            rows={4}
                            value={form.bio}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                bio: e.target.value,
                              }))
                            }
                            placeholder="Description de votre parcours..."
                            className="w-full rounded-xl bg-[#F1F5F9] border border-transparent focus:border-[#0052FF] focus:ring-4 focus:ring-[#0052FF]/10 outline-none transition-all duration-200 text-sm text-[#0A0F1E] placeholder:text-[#94A3B8] pl-12 pr-4 py-4 resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField
                          label="Cabinet"
                          icon={Building2}
                          value={form.clinic}
                          placeholder="Nom du cabinet"
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              clinic: e.target.value,
                            }))
                          }
                        />

                        <InputField
                          label="Localisation"
                          icon={MapPin}
                          value={form.location}
                          placeholder="Ville, pays"
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              location: e.target.value,
                            }))
                          }
                        />

                        <InputField
                          label="Latitude"
                          type="number"
                          step="any"
                          icon={Globe}
                          value={form.latitude}
                          placeholder="36.8065"
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              latitude: e.target.value,
                            }))
                          }
                        />

                        <InputField
                          label="Longitude"
                          type="number"
                          step="any"
                          icon={Globe}
                          value={form.longitude}
                          placeholder="10.1815"
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              longitude: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFF] border border-[#E2E8F0]">
                        <div>
                          <p className="font-semibold text-[#0A0F1E]">
                            Statut du spécialiste
                          </p>

                          <p className="text-sm text-[#64748B] mt-1">
                            Validation administrative.
                          </p>
                        </div>

                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            profile.specialist
                              .isValidated
                              ? "bg-[#ECFDF5] text-[#10B981]"
                              : "bg-[#FFFBEB] text-[#F59E0B]"
                          }`}
                        >
                          {profile.specialist
                            .isValidated
                            ? "Validé"
                            : "En attente"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {/* Password */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-[#FEF2F2] flex items-center justify-center">
                    <Lock
                      size={20}
                      className="text-[#EF4444]"
                    />
                  </div>

                  <div>
                    <h2 className="text-[20px] font-semibold text-[#0A0F1E]">
                      {t("profile.change_password")}
                    </h2>

                    <p className="text-sm text-[#64748B]">
                      Mettez à jour votre mot de passe.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <InputField
                    label={t(
                      "profile.current_password",
                    )}
                    type="password"
                    icon={Lock}
                    value={pwForm.current}
                    placeholder="••••••••"
                    onChange={(e) =>
                      setPwForm((p) => ({
                        ...p,
                        current: e.target.value,
                      }))
                    }
                  />

                  <InputField
                    label={t("profile.new_password")}
                    type="password"
                    icon={Shield}
                    value={pwForm.new}
                    placeholder="••••••••"
                    onChange={(e) =>
                      setPwForm((p) => ({
                        ...p,
                        new: e.target.value,
                      }))
                    }
                  />

                  <InputField
                    label={t(
                      "profile.confirm_password",
                    )}
                    type="password"
                    icon={Check}
                    value={pwForm.confirm}
                    placeholder="••••••••"
                    onChange={(e) =>
                      setPwForm((p) => ({
                        ...p,
                        confirm: e.target.value,
                      }))
                    }
                  />
                </div>

                <button
                  onClick={handlePwSave}
                  className="mt-6 h-12 px-6 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] text-white font-semibold hover:scale-[1.01] transition-all duration-200 shadow-[0_8px_24px_rgba(0,82,255,0.24)]"
                >
                  {t("profile.change_password")}
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Security */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
                    <Settings2
                      size={20}
                      className="text-[#0052FF]"
                    />
                  </div>

                  <div>
                    <h2 className="text-[20px] font-semibold text-[#0A0F1E]">
                      Sécurité
                    </h2>

                    <p className="text-sm text-[#64748B]">
                      Protection du compte.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F8FAFF] border border-[#E2E8F0] p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0052FF] to-[#00A3FF] flex items-center justify-center text-white shrink-0">
                      <ShieldCheck size={22} />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-[#0A0F1E]">
                        Authentification 2FA
                      </p>

                      <p className="text-sm text-[#64748B] mt-1">
                        {profile?.security === "MFA"
                          ? "Authentification multi-facteurs activée"
                          : "Authentification simple activée"}
                      </p>

                      <button
                        onClick={handleToggleSecurity}
                        disabled={saving}
                        className={`mt-5 h-11 px-5 rounded-full font-semibold transition-all duration-200 ${
                          profile?.security === "MFA"
                            ? "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]"
                            : "bg-gradient-to-r from-[#0052FF] to-[#00A3FF] text-white shadow-[0_8px_24px_rgba(0,82,255,0.24)]"
                        }`}
                      >
                        {profile?.security === "MFA"
                          ? "Désactiver 2FA"
                          : "Activer 2FA"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Card */}
              {profile?.role === "ADMIN" &&
                profile?.admin && (
                  <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-[#FEF2F2] flex items-center justify-center">
                        <Shield
                          size={20}
                          className="text-[#EF4444]"
                        />
                      </div>

                      <div>
                        <h2 className="text-[20px] font-semibold text-[#0A0F1E]">
                          Administration
                        </h2>

                        <p className="text-sm text-[#64748B]">
                          Permissions administrateur.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFF] border border-[#E2E8F0]">
                      <div>
                        <p className="font-semibold text-[#0A0F1E]">
                          Modération
                        </p>

                        <p className="text-sm text-[#64748B] mt-1">
                          Accès aux outils de gestion.
                        </p>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          profile.admin.canModerate
                            ? "bg-[#ECFDF5] text-[#10B981]"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {profile.admin.canModerate
                          ? "Activé"
                          : "Désactivé"}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Cropper */}
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