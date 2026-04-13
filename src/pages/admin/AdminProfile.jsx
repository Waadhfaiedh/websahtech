import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';

export default function AdminProfile() {
  const { t } = useTranslation();
  const { user: authUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ 
    fullName: '', 
    email: '', 
    phone: '', 
    address: '',
    age: '',
    weight: '',
    height: '',
    bio: '',
    clinic: '',
    location: '',
    latitude: '',
    longitude: ''
  });
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ─── Load profile data ─────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      setProfile(res.data);
      setForm({
        fullName: res.data.fullName || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        age: res.data.patient?.age?.toString() || '',
        weight: res.data.patient?.weight?.toString() || '',
        height: res.data.patient?.height?.toString() || '',
        bio: res.data.specialist?.bio || '',
        clinic: res.data.specialist?.clinic || '',
        location: res.data.specialist?.location || '',
        latitude: res.data.specialist?.latitude?.toString() || '',
        longitude: res.data.specialist?.longitude?.toString() || '',
      });
      setError(null);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  // ─── Upload profile image ─────────────────────────────────────────
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/users/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Update profile with new image URL
      setProfile(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert(err.response?.data?.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  // ─── Update profile using /users/update-user ─────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
      };

      // Add patient-specific fields if user is PATIENT
      if (profile?.role === 'PATIENT') {
        if (form.age) updateData.age = form.age;
        if (form.weight) updateData.weight = parseFloat(form.weight);
        if (form.height) updateData.height = parseFloat(form.height);
      }

      // Add specialist-specific fields if user is DOCTOR
      if (profile?.role === 'DOCTOR') {
        if (form.bio) updateData.bio = form.bio;
        if (form.clinic) updateData.clinic = form.clinic;
        if (form.location) updateData.location = form.location;
        if (form.latitude) updateData.latitude = parseFloat(form.latitude);
        if (form.longitude) updateData.longitude = parseFloat(form.longitude);
      }

      await api.patch('/users/update-user', updateData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  // ─── Change password ─────────────────────────────────────────
  const handlePwSave = async () => {
    if (!pwForm.current || !pwForm.new || pwForm.new !== pwForm.confirm) {
      alert('Veuillez remplir tous les champs correctement. Le nouveau mot de passe doit correspondre à la confirmation.');
      return;
    }
    if (pwForm.new.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      await api.patch('/users/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.new,
      });
      setPwSaved(true);
      setPwForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      console.error('Failed to change password:', err);
      alert(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  // Get user role display name
  const getRoleDisplay = () => {
    if (!profile) return '';
    switch (profile.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'DOCTOR':
        return 'Médecin';
      case 'PATIENT':
        return 'Patient';
      default:
        return profile.role;
    }
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (profile?.fullName) {
      return profile.fullName.charAt(0).toUpperCase();
    }
    return 'A';
  };

  // Get user type for badge
  const getUserType = () => {
    if (profile?.role === 'ADMIN') return 'admin';
    if (profile?.role === 'DOCTOR') return 'doctor';
    return 'patient';
  };

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
          <div className="flex items-center gap-5">
            {/* Profile Image */}
            <div className="relative group">
              {profile?.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt={profile.fullName}
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white ${
                  getUserType() === 'admin' ? 'bg-red-500' : getUserType() === 'doctor' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {getUserInitial()}
                </div>
              )}
              
              {/* Upload button overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-1.5 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Changer la photo"
              >
                {uploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div>
              <p className="font-bold text-lg text-gray-900">{profile?.fullName}</p>
              <p className={`font-medium text-sm ${
                getUserType() === 'admin' ? 'text-red-500' : getUserType() === 'doctor' ? 'text-blue-500' : 'text-green-500'
              }`}>
                {getRoleDisplay()}
              </p>
              <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Informations du compte</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.full_name')}</label>
              <input
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (8 chiffres)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="input-field"
                placeholder="12345678"
                maxLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('common.save')}
              </>
            )}
          </button>
        </div>

        {/* Patient specific info */}
        {profile?.role === 'PATIENT' && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Informations médicales</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                  className="input-field"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
                  className="input-field"
                  placeholder="70.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.height}
                  onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
                  className="input-field"
                  placeholder="175"
                />
              </div>
            </div>
          </div>
        )}

        {/* Specialist specific info */}
        {profile?.role === 'DOCTOR' && profile?.specialist && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Informations professionnelles</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Description de votre parcours et spécialités..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cabinet</label>
                <input
                  value={form.clinic}
                  onChange={e => setForm(p => ({ ...p, clinic: e.target.value }))}
                  className="input-field"
                  placeholder="Nom de votre cabinet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                <input
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="input-field"
                  placeholder="Ville, pays"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                    className="input-field"
                    placeholder="36.8065"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                    className="input-field"
                    placeholder="10.1815"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <p className={`text-sm font-medium ${profile.specialist.isValidated ? 'text-green-600' : 'text-orange-500'}`}>
                  {profile.specialist.isValidated ? '✓ Validé' : '⏳ En attente de validation'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin specific info */}
        {profile?.role === 'ADMIN' && profile?.admin && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Privilèges administrateur</h2>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                profile.admin.canModerate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {profile.admin.canModerate ? '✓ Peut modérer' : 'Modération désactivée'}
              </div>
            </div>
          </div>
        )}

        {/* Password */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">{t('profile.change_password')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.current_password')}</label>
              <input
                type="password"
                value={pwForm.current}
                onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.new_password')}</label>
              <input
                type="password"
                value={pwForm.new}
                onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.confirm_password')}</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button onClick={handlePwSave} className="btn-primary mt-4">
            {t('profile.change_password')}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}