import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { mockPatients, mockSpecialists } from '../../services/mockData';

export default function AdminPatients() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState(mockPatients);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase()));

  const getSpecialist = (id) => mockSpecialists.find(s => s.id === id);
  const activate = (id) => setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
  const suspend = (id) => setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'suspended' } : p));
  const deleteP = (id) => { if (confirm('Supprimer ce patient ?')) setPatients(prev => prev.filter(p => p.id !== id)); };

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('admin.patient_management')} subtitle={`${patients.length} patients`} />

        <div className="relative mb-6">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 max-w-sm" placeholder="Rechercher un patient..." />
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Patient', 'Pathologie', 'Spécialiste assigné', 'Date inscription', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const sp = getSpecialist(p.assignedSpecialistId);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 text-xs font-bold">{p.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.age} ans</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.condition}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sp?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.registrationDate}</td>
                    <td className="px-6 py-4">
                      <Badge label={p.status === 'active' ? 'Actif' : 'En attente'} color={p.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(p)} className="text-xs text-primary hover:underline">{t('admin.view')}</button>
                        {p.status !== 'active' && <button onClick={() => activate(p.id)} className="text-xs text-green-600 hover:underline">{t('admin.activate')}</button>}
                        {p.status === 'active' && <button onClick={() => suspend(p.id)} className="text-xs text-orange-500 hover:underline">{t('admin.suspend')}</button>}
                        <button onClick={() => deleteP(p.id)} className="text-xs text-red-400 hover:text-red-600">{t('admin.delete')}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détail patient">
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-xl font-bold text-green-700">{selected.name.charAt(0)}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                  <p className="text-gray-500">{selected.age} ans · {selected.condition}</p>
                  <Badge label={selected.status === 'active' ? 'Actif' : 'En attente'} color={selected.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                {[
                  { label: 'Email', val: selected.email },
                  { label: 'Téléphone', val: selected.phone },
                  { label: 'Adresse', val: selected.address },
                  { label: 'Dernière visite', val: selected.lastVisit },
                  { label: 'Spécialiste', val: mockSpecialists.find(s => s.id === selected.assignedSpecialistId)?.name || '—' },
                  { label: 'Inscription', val: selected.registrationDate },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.val}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Antécédents</p>
                <p className="text-sm text-gray-600">{selected.medicalHistory}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
