import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { specialist, updateSpecialist } = useAuth();
  const [form, setForm] = useState({
    name: specialist?.name || '',
    specialty: specialist?.specialty || '',
    clinic: specialist?.clinic || '',
    address: specialist?.address || '',
    phone: specialist?.phone || '',
    bio: specialist?.bio || '',
    profileVisible: specialist?.profileVisible ?? true,
  });
  const [languages, setLanguages] = useState(specialist?.languages || []);
  const [diplomas, setDiplomas] = useState(specialist?.diplomas || []);
  const [newLang, setNewLang] = useState('');
  const [newDiploma, setNewDiploma] = useState('');
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSpecialist({ ...form, languages, diplomas });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleField = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const fields = [
    { key: 'name', label: t('profile.full_name'), type: 'input' },
    { key: 'specialty', label: t('profile.specialty'), type: 'input' },
    { key: 'clinic', label: t('profile.clinic'), type: 'input' },
    { key: 'phone', label: t('profile.phone'), type: 'input' },
    { key: 'address', label: t('profile.address'), type: 'input' },
  ];

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn max-w-3xl">
        <PageHeader title={t('profile.title')} />

        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Profil enregistré avec succès !
          </div>
        )}

        {/* Avatar */}
        <div className="card mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl font-bold text-primary">
              {form.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{form.name}</p>
              <p className="text-sm text-gray-500">{form.specialty}</p>
              <button className="mt-2 text-sm text-primary hover:underline">Changer l'avatar</button>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-gray-600">{t('profile.profile_visibility')}</span>
              <button onClick={() => handleField('profileVisible', !form.profileVisible)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.profileVisible ? 'bg-primary' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.profileVisible ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">{form.profileVisible ? t('profile.public') : t('profile.private')}</span>
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
                <input value={form[f.key]} onChange={e => handleField(f.key, e.target.value)} className="input-field" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.bio')}</label>
            <textarea value={form.bio} onChange={e => handleField('bio', e.target.value)} rows={4} className="input-field resize-none" />
          </div>
        </div>

        {/* Languages */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-3">{t('profile.languages')}</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {languages.map((l, i) => (
              <span key={i} className="badge-blue flex items-center gap-1.5">
                {l}
                <button onClick={() => setLanguages(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-blue-900">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newLang} onChange={e => setNewLang(e.target.value)} className="input-field flex-1" placeholder="Ajouter une langue..." />
            <button onClick={() => { if (newLang.trim()) { setLanguages(p => [...p, newLang.trim()]); setNewLang(''); } }} className="btn-secondary">{t('common.add')}</button>
          </div>
        </div>

        {/* Diplomas */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-3">{t('profile.diplomas')}</h2>
          <div className="space-y-2 mb-3">
            {diplomas.map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                <span className="flex-1 text-sm text-gray-800">{d}</span>
                <button onClick={() => setDiplomas(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs">{t('common.delete')}</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newDiploma} onChange={e => setNewDiploma(e.target.value)} className="input-field flex-1" placeholder="Ajouter un diplôme..." />
            <button onClick={() => { if (newDiploma.trim()) { setDiplomas(p => [...p, newDiploma.trim()]); setNewDiploma(''); } }} className="btn-secondary">{t('common.add')}</button>
          </div>
        </div>

        {/* Change password */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{t('profile.change_password')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'current', label: t('profile.current_password') },
              { key: 'new', label: t('profile.new_password') },
              { key: 'confirm', label: t('profile.confirm_password') },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type="password" value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field" />
              </div>
            ))}
          </div>
          <button className="btn-secondary mt-3">Changer le mot de passe</button>
        </div>

        <button onClick={handleSave} className="btn-primary px-8 py-3 text-base">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {t('profile.save')}
        </button>
      </div>
    </SpecialistLayout>
  );
}
