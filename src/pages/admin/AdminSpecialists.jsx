import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { mockSpecialists } from '../../services/mockData';

export default function AdminSpecialists() {
  const { t } = useTranslation();
  const [specialists, setSpecialists] = useState(mockSpecialists);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = specialists.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.specialty.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()));

  const approve = (id) => setSpecialists(prev => prev.map(s => s.id === id ? { ...s, status: 'active' } : s));
  const suspend = (id) => setSpecialists(prev => prev.map(s => s.id === id ? { ...s, status: 'suspended' } : s));
  const deleteS = (id) => { if (confirm('Supprimer ce spécialiste ?')) setSpecialists(prev => prev.filter(s => s.id !== id)); };

  const statusColors = { active: 'active', pending: 'pending', suspended: 'suspended' };
  const statusLabels = { active: 'Actif', pending: 'En attente', suspended: 'Suspendu' };

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('admin.specialist_management')} subtitle={`${specialists.length} spécialistes`} />

        <div className="relative mb-6">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 max-w-sm" placeholder="Rechercher..." />
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nom', 'Spécialité', 'Email', 'Date inscription', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(sp => (
                <tr key={sp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm font-bold">{sp.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{sp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sp.specialty}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sp.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sp.registrationDate}</td>
                  <td className="px-6 py-4">
                    <Badge label={statusLabels[sp.status]} color={statusColors[sp.status]} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(sp)} className="text-xs text-primary hover:underline">{t('admin.view')}</button>
                      {sp.status === 'pending' && <button onClick={() => approve(sp.id)} className="text-xs text-green-600 hover:underline">{t('admin.approve')}</button>}
                      {sp.status === 'active' && <button onClick={() => suspend(sp.id)} className="text-xs text-orange-500 hover:underline">{t('admin.suspend')}</button>}
                      {sp.status === 'suspended' && <button onClick={() => approve(sp.id)} className="text-xs text-green-600 hover:underline">{t('admin.activate')}</button>}
                      <button onClick={() => deleteS(sp.id)} className="text-xs text-red-400 hover:text-red-600">{t('admin.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Profil spécialiste" size="lg">
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-xl font-bold text-primary">{selected.name.charAt(0)}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                  <p className="text-primary">{selected.specialty}</p>
                  <Badge label={statusLabels[selected.status]} color={statusColors[selected.status]} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                {[
                  { label: 'Email', val: selected.email },
                  { label: 'Téléphone', val: selected.phone },
                  { label: 'Cabinet', val: selected.clinic },
                  { label: 'Adresse', val: selected.address },
                  { label: 'Note', val: `${selected.rating}/5` },
                  { label: 'Inscription', val: selected.registrationDate },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.val}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Bio</p>
                <p className="text-sm text-gray-600">{selected.bio}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Diplômes</p>
                {selected.diplomas.map((d, i) => <p key={i} className="text-sm text-gray-600">• {d}</p>)}
              </div>
              <div className="flex gap-2 pt-2">
                {selected.status === 'pending' && <button onClick={() => { approve(selected.id); setSelected(null); }} className="btn-primary flex-1 justify-center">{t('admin.approve')}</button>}
                {selected.status === 'active' && <button onClick={() => { suspend(selected.id); setSelected(null); }} className="btn-danger flex-1 justify-center">{t('admin.suspend')}</button>}
                <button onClick={() => setSelected(null)} className="btn-secondary flex-1 justify-center">{t('common.close')}</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
