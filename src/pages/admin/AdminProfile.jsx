import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';

export default function AdminProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || 'Admin SAHTECH', email: user?.email || 'admin@sahtech.dz' });
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePwSave = () => {
    if (!pwForm.current || !pwForm.new || pwForm.new !== pwForm.confirm) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }
    setPwSaved(true);
    setPwForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 2500);
  };

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

        {/* Avatar */}
        <div className="card mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-red-600">
              A
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900">{form.name}</p>
              <p className="text-red-500 font-medium text-sm">Administrateur</p>
              <p className="text-gray-400 text-sm mt-0.5">{form.email}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Informations du compte</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.full_name')}</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
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
          </div>
          <button onClick={handleSave} className="btn-primary mt-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('common.save')}
          </button>
        </div>

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
