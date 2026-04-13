import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import api from '../../services/api';

export default function AdminPatients() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load patients ─────────────────────────────────────────
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admins/get-patients');
      setPatients(res.data.data ?? res.data);
      setTotal(res.data.count ?? res.data.length);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete patient (using the delete user endpoint) ────────────────────────
  const deletePatient = async (userId) => {
    if (!confirm('Supprimer ce patient ?')) return;
    try {
      await api.delete(`/users/delete/${userId}`);
      setPatients(prev => prev.filter(p => p.userId !== userId));
      setTotal(prev => prev - 1);
      if (selected?.userId === userId) setSelected(null);
    } catch (err) {
      console.error('Failed to delete patient:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // ─── Filter ───────────────────────────────────────────────────
  const filtered = patients.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient?.appointments?.some(apt => apt.reason?.toLowerCase().includes(search.toLowerCase())) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Get latest appointment reason
  const getLatestCondition = (patient) => {
    const appointments = patient.patient?.appointments;
    if (!appointments || appointments.length === 0) return '—';
    const latest = appointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return latest.reason || '—';
  };

  // Get assigned specialist name
  const getAssignedSpecialist = (patient) => {
    const appointments = patient.patient?.appointments;
    if (!appointments || appointments.length === 0) return '—';
    const latest = appointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return latest.specialist?.user?.fullName || '—';
  };

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t('admin.patient_management')}
          subtitle={`${total} patients`}
        />

        <div className="relative mb-6">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 max-w-sm"
            placeholder="Rechercher un patient..."
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Patient', 'Pathologie', 'Spécialiste assigné', 'Date inscription', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.userId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.fullName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-green-700 text-xs font-bold">{p.fullName?.charAt(0) ?? '?'}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-gray-900">{p.fullName}</p>
                          <p className="text-xs text-gray-400">{p.patient?.age ?? '—'} ans</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getLatestCondition(p)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getAssignedSpecialist(p)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(p)}
                          className="text-xs text-primary hover:underline"
                        >
                          {t('admin.view')}
                        </button>
                        <button
                          onClick={() => deletePatient(p.userId)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                      Aucun patient trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détail patient" size="lg">
          {selected && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                {selected.imageUrl ? (
                  <img src={selected.imageUrl} alt={selected.fullName} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-green-700">
                    {selected.fullName?.charAt(0) ?? '?'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selected.fullName}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {selected.patient?.age ?? '—'} ans · {selected.gender === 'MALE' ? 'Homme' : selected.gender === 'FEMALE' ? 'Femme' : '—'}
                  </p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Email', val: selected.email },
                  { label: 'Téléphone', val: selected.phone ?? '—' },
                  { label: 'Adresse', val: selected.address ?? '—' },
                  { label: 'Date inscription', val: formatDate(selected.createdAt) },
                  { label: 'Poids', val: selected.patient?.weight ? `${selected.patient.weight} kg` : '—' },
                  { label: 'Taille', val: selected.patient?.height ? `${selected.patient.height} cm` : '—' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 break-words">{item.val}</p>
                  </div>
                ))}
              </div>

              {/* Appointments history */}
              {selected.patient?.appointments && selected.patient.appointments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Historique des consultations</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selected.patient.appointments
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((apt, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-3">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium text-gray-800">{apt.reason || 'Consultation'}</p>
                            <p className="text-xs text-gray-400">{formatDate(apt.date)}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Médecin: {apt.specialist?.user?.fullName || '—'}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { deletePatient(selected.userId); setSelected(null); }}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  {t('admin.delete')}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}