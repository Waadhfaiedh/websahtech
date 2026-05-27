// Redesigned following SAHTECK brand guidelines
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import api from "../../services/api";
import Cropper from "react-easy-crop";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";

function ImageCropper({ image, onCrop, onClose }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (croppedArea, croppedAreaPixelsValue) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  };

  const createCroppedImage = async () => {
    try {
      if (!croppedAreaPixels) return;

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
          if (blob) onCrop(blob);
        },
        "image/jpeg",
        0.9,
      );
    } catch (error) {
      console.error("Error creating cropped image:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl rounded-[12px] bg-white p-5 md:p-6"
        style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A0F1E]">
              Recadrer l'image
            </h3>
            <p className="text-sm text-[#64748B]">
              Ajustez le cadrage avant d’enregistrer la photo de profil.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFF] text-[#64748B] transition-all duration-200 ease-in-out hover:bg-[#EFF6FF] hover:text-[#0052FF]"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-4 h-80 overflow-hidden rounded-[12px] bg-[#F8FAFF]">
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

        <div className="mb-5">
          <label
            htmlFor="zoom-slider"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
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
            className="w-full accent-[#0052FF]"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={createCroppedImage}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
          >
            Appliquer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#BFDBFE] bg-white px-4 py-3 text-sm font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:bg-[#EFF6FF]"
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

export default function ProfilePage() {
  const { t } = useTranslation();
  const { specialist, updateSpecialist, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: specialist?.name || "",
    email: specialist?.email || "",
    specialty: specialist?.specialty || "",
    address: specialist?.location || "",
    phone: specialist?.phone || "",
    bio: specialist?.bio || "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (specialist) {
      setForm({
        fullName: specialist.name || "",
        email: specialist.email || "",
        specialty: specialist.specialty || "",
        address: specialist.location || "",
        phone: specialist.phone || "",
        bio: specialist.bio || "",
      });
    }
  }, [specialist]);

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
      const token = user?.accessToken;
      const res = await api.post("/users/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      updateSpecialist({ ...specialist, imageUrl: res.data.imageUrl });

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

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
      };

      if (specialist?.role === "DOCTOR") {
        updateData.bio = form.bio;
        updateData.location = form.address;
        updateData.speciality = form.specialty;
      }

      const token = user?.accessToken;
      const res = await api.patch("/users/update-user", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateSpecialist({
        ...specialist,
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        location: form.address,
        bio: form.bio,
        specialty: form.specialty,
      });

      toast.success(res.data?.message || "Profil enregistré avec succès");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du profil",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
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
      const token = user?.accessToken;
      const res = await api.patch(
        "/users/change-password",
        {
          currentPassword: pwForm.current,
          newPassword: pwForm.new,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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

  const handleToggleSecurity = async () => {
    setLoading(true);
    try {
      const token = user?.accessToken;
      const res = await api.patch(
        "/users/update-otp",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      updateSpecialist({
        ...specialist,
        security: specialist?.security === "MFA" ? "SFA" : "MFA",
      });

      toast.success(res.data?.message || "Paramètres de sécurité mis à jour");
    } catch (err) {
      console.error("Failed to update security:", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour des paramètres de sécurité",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const fields = [
    { key: "fullName", label: t("profile.full_name"), type: "text" },
    { key: "email", label: t("auth.email"), type: "email" },
    { key: "phone", label: t("profile.phone"), type: "tel" },
    { key: "specialty", label: t("profile.specialty"), type: "text" },
    { key: "address", label: t("profile.address"), type: "text" },
  ];

  const validated = specialist?.isValidated;
  const securityActive = specialist?.security === "MFA";

  if (!specialist) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-[#F8FAFF] p-8">
        <Loader2 size={32} className="animate-spin text-[#0052FF]" />
      </div>
    );
  }

  return (
    <>
      <div className="animate-fadeIn bg-[#F8FAFF] px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <PageHeader title={t("profile.title")} />

          <div
            className="mb-6 rounded-[12px] bg-white p-5 md:p-6"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {specialist?.imageUrl ? (
                    <img
                      src={specialist.imageUrl}
                      alt={form.fullName}
                      className="h-20 w-20 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-3xl font-bold text-white shadow-sm">
                      {form.fullName?.charAt(0) || "?"}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0052FF] text-white shadow-md transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#0042E6] disabled:opacity-50"
                    title="Changer la photo"
                  >
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
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

                <div className="min-w-0">
                  <p className="text-xl font-bold text-[#0A0F1E]">
                    {form.fullName}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {form.specialty || "Spécialiste"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      label={validated ? "Compte validé" : "En attente"}
                      color={validated ? "green" : "gray"}
                    />
                    <Badge
                      label={securityActive ? "2FA activée" : "2FA désactivée"}
                      color={securityActive ? "blue" : "gray"}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-[#64748B] md:grid-cols-2 lg:w-[460px]">
                <div className="flex items-center gap-3 rounded-[12px] bg-[#F8FAFF] p-3">
                  <Mail size={18} className="text-[#0052FF]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Email
                    </p>
                    <p className="truncate text-sm font-medium text-[#0A0F1E]">
                      {form.email || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-[12px] bg-[#F8FAFF] p-3">
                  <Phone size={18} className="text-[#0052FF]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Téléphone
                    </p>
                    <p className="truncate text-sm font-medium text-[#0A0F1E]">
                      {form.phone || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-[12px] bg-[#F8FAFF] p-3">
                  <MapPin size={18} className="text-[#0052FF]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Adresse
                    </p>
                    <p className="truncate text-sm font-medium text-[#0A0F1E]">
                      {form.address || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="mb-6 rounded-[12px] bg-white p-5 md:p-6"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-[#0A0F1E]">
              Informations professionnelles
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key}>
                  <label
                    htmlFor={f.key}
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
                  >
                    {f.label}
                  </label>
                  <input
                    id={f.key}
                    type={f.type}
                    value={form[f.key] || ""}
                    onChange={(e) => handleField(f.key, e.target.value)}
                    className="h-11 w-full rounded-[8px] bg-[#F1F5F9] px-3 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]/25"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label
                htmlFor="bio"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
              >
                {t("profile.bio")}
              </label>
              <textarea
                id="bio"
                value={form.bio || ""}
                onChange={(e) => handleField("bio", e.target.value)}
                rows={4}
                className="w-full resize-none rounded-[8px] bg-[#F1F5F9] px-3 py-2.5 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]/25"
                placeholder="Présentation de votre parcours et expertise..."
              />
            </div>

            {specialist?.primaryClinic?.name && (
              <div className="mt-4 rounded-[12px] bg-[#F8FAFF] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#64748B]">
                  <Building2 size={18} className="text-[#0052FF]" />
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Clinique principale
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#0A0F1E]">
                  {specialist.primaryClinic.name}
                </p>
                {specialist.primaryClinic.address && (
                  <p className="mt-1 text-xs text-[#64748B]">
                    {specialist.primaryClinic.address}
                  </p>
                )}
              </div>
            )}
          </div>

          {(specialist?.licenseNumber || specialist?.rating > 0) && (
            <div
              className="mb-6 rounded-[12px] bg-white p-5 md:p-6"
              style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
            >
              <h2 className="mb-4 text-lg font-semibold text-[#0A0F1E]">
                Informations légales
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {specialist?.licenseNumber && (
                  <div className="rounded-[12px] bg-[#F8FAFF] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Numéro de licence
                    </p>
                    <p className="text-sm font-medium text-[#0A0F1E]">
                      {specialist.licenseNumber}
                    </p>
                  </div>
                )}
                {specialist?.rating > 0 && (
                  <div className="rounded-[12px] bg-[#F8FAFF] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Évaluation
                    </p>
                    <p className="text-sm font-medium text-[#0A0F1E]">
                      {specialist.rating}/5 ({specialist.reviewsCount || 0}{" "}
                      avis)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            className="mb-6 rounded-[12px] bg-white p-5 md:p-6"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF] text-[#0052FF]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0A0F1E]">
                  Paramètres de sécurité
                </h2>
                <p className="text-sm text-[#64748B]">
                  Gérez l’authentification à deux facteurs de votre compte.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[12px] bg-[#F8FAFF] p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${securityActive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FFFBEB] text-[#F59E0B]"}`}
                >
                  <LockKeyhole size={18} />
                </div>
                <div>
                  <p className="font-semibold text-[#0A0F1E]">
                    Authentification à deux facteurs
                  </p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    {securityActive
                      ? "Authentification multi-facteurs (2FA) activée"
                      : "Authentification simple (SFA) activée"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleSecurity}
                disabled={loading}
                className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200 ease-in-out disabled:opacity-50 ${
                  securityActive
                    ? "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]"
                    : "bg-gradient-to-r from-[#0052FF] to-[#00A3FF] text-white hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                {securityActive ? "Désactiver 2FA" : "Activer 2FA"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/specialist/feedback")}
            className="mb-6 w-full rounded-[12px] bg-white p-5 text-left transition-all duration-200 ease-in-out hover:-translate-y-0.5"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-white">
                <Star size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 font-semibold text-[#0A0F1E]">
                  Donner mon avis
                </p>
                <p className="text-sm text-[#64748B]">
                  Partagez votre expérience ou signalez un problème à
                  l'administration
                </p>
              </div>
              <ChevronRight size={20} className="text-[#94A3B8]" />
            </div>
          </button>

          <div
            className="mb-6 rounded-[12px] bg-white p-5 md:p-6"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-[#0A0F1E]">
              {t("profile.change_password")}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
                >
                  {t("profile.current_password")}
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={pwForm.current}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, current: e.target.value }))
                  }
                  className="h-11 w-full rounded-[8px] bg-[#F1F5F9] px-3 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out focus:ring-2 focus:ring-[#0052FF]/25"
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
                >
                  {t("profile.new_password")}
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={pwForm.new}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, new: e.target.value }))
                  }
                  className="h-11 w-full rounded-[8px] bg-[#F1F5F9] px-3 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out focus:ring-2 focus:ring-[#0052FF]/25"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
                >
                  {t("profile.confirm_password")}
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, confirm: e.target.value }))
                  }
                  className="h-11 w-full rounded-[8px] bg-[#F1F5F9] px-3 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out focus:ring-2 focus:ring-[#0052FF]/25"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handlePasswordChange}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#BFDBFE] bg-white px-4 py-3 text-sm font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:bg-[#EFF6FF]"
            >
              Changer le mot de passe
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-6 py-3 text-base font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                {t("profile.save")}
              </>
            )}
          </button>
        </div>
      </div>

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
    </>
  );
}
