import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';
import Cropper from 'react-easy-crop';

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

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
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
        croppedAreaPixels.height
      );
      
      canvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob);
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error creating cropped image:', error);
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
          <label className="block text-sm text-gray-600 mb-2">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
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

export default function ProfilePage() {
  const { t } = useTranslation();
  const { specialist, updateSpecialist, user } = useAuth();
  const [form, setForm] = useState({
    fullName: specialist?.name || '',
    email: specialist?.email || '',
    specialty: specialist?.specialty || '',
    clinic: specialist?.clinic || '',
    address: specialist?.location || '',
    phone: specialist?.phone || '',
    bio: specialist?.bio || '',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (specialist) {
      setForm({
        fullName: specialist.name || '',
        email: specialist.email || '',
        specialty: specialist.specialty || '',
        clinic: specialist.clinic || '',
        address: specialist.location || '',
        phone: specialist.phone || '',
        bio: specialist.bio || '',
      });
    }
  }, [specialist]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setTempImage(e.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (croppedBlob) => {
    const formData = new FormData();
    formData.append('file', croppedBlob, 'profile.jpg');

    setUploading(true);
    setShowCropper(false);
    
    try {
      const token = user?.accessToken;
      const res = await api.post('/users/upload-image', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        },
      });
      
      updateSpecialist({ ...specialist, imageUrl: res.data.imageUrl });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert(err.response?.data?.message || 'Erreur lors de l\'upload de l\'image');
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

      if (specialist?.role === 'DOCTOR') {
        updateData.bio = form.bio;
        updateData.clinic = form.clinic;
        updateData.location = form.address;
        updateData.speciality = form.specialty;
      }

      const token = user?.accessToken;
      await api.patch('/users/update-user', updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      updateSpecialist({
        ...specialist,
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        location: form.address,
        bio: form.bio,
        clinic: form.clinic,
        specialty: form.specialty,
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!pwForm.current || !pwForm.new || pwForm.new !== pwForm.confirm) {
      alert('Veuillez remplir tous les champs correctement. Le nouveau mot de passe doit correspondre à la confirmation.');
      return;
    }
    if (pwForm.new.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      const token = user?.accessToken;
      await api.patch('/users/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.new,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPwSaved(true);
      setPwForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      console.error('Failed to change password:', err);
      alert(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const handleField = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const fields = [
    { key: 'fullName', label: t('profile.full_name'), type: 'input' },
    { key: 'email', label: t('auth.email'), type: 'email' },
    { key: 'phone', label: t('profile.phone'), type: 'tel' },
    { key: 'specialty', label: t('profile.specialty'), type: 'input' },
    { key: 'clinic', label: t('profile.clinic'), type: 'input' },
    { key: 'address', label: t('profile.address'), type: 'input' },
  ];

  if (!specialist) {
    return (
      <SpecialistLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SpecialistLayout>
    );
  }

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn max-w-3xl">
        <PageHeader title={t('profile.title')} />

        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profil enregistré avec succès !
          </div>
        )}

        {pwSaved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mot de passe modifié avec succès !
          </div>
        )}

        {/* Avatar with upload capability */}
        <div className="card mb-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              {specialist?.imageUrl ? (
                <img 
                  src={specialist.imageUrl} 
                  alt={form.fullName}
                  className="w-20 h-20 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-3xl font-bold text-primary">
                  {form.fullName?.charAt(0) || '?'}
                </div>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 p-1.5 bg-primary rounded-full text-white shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
                title="Changer la photo"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
              <p className="font-semibold text-gray-900">{form.fullName}</p>
              <p className="text-sm text-gray-500">{form.specialty || 'Spécialiste'}</p>
              <p className="text-xs text-gray-400 mt-1">
                {specialist?.isValidated ? '✓ Compte validé' : '⏳ En attente de validation'}
              </p>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Informations professionnelles</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key] || ''}
                  onChange={e => handleField(f.key, e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.bio')}</label>
            <textarea
              value={form.bio || ''}
              onChange={e => handleField('bio', e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Présentation de votre parcours et expertise..."
            />
          </div>
        </div>

        {/* License Info */}
        {(specialist?.licenseNumber || specialist?.rating > 0) && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Informations légales</h2>
            <div className="grid grid-cols-2 gap-4">
              {specialist?.licenseNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Numéro de licence</label>
                  <p className="text-sm text-gray-800">{specialist.licenseNumber}</p>
                </div>
              )}
              {specialist?.rating > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Évaluation</label>
                  <p className="text-sm text-gray-800">
                    {specialist.rating}/5 ({specialist.reviewsCount || 0} avis)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Change password */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{t('profile.change_password')}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.current_password')}</label>
              <input
                type="password"
                value={pwForm.current}
                onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.new_password')}</label>
              <input
                type="password"
                value={pwForm.new}
                onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.confirm_password')}</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
          <button onClick={handlePasswordChange} className="btn-secondary mt-3">
            Changer le mot de passe
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('profile.save')}
            </>
          )}
        </button>
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
    </SpecialistLayout>
  );
}