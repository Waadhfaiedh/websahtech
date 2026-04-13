import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import api from '../../services/api';

export default function AdminSpecialists() {
  const { t } = useTranslation();
  const [specialists, setSpecialists] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load specialists ─────────────────────────────────────────
  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admins/get-specialists');
      setSpecialists(res.data.data ?? res.data);
      setTotal(res.data.count ?? res.data.length);
    } catch (err) {
      console.error('Failed to load specialists:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Validate doctor ─────────────────────────────────────────
  const validate = async (userId) => {
    try {
      await api.patch(`/users/validate-doctor/${userId}`);
      setSpecialists(prev =>
        prev.map(s => s.userId === userId
          ? { ...s, specialist: { ...s.specialist, isValidated: true } }
          : s
        )
      );
      if (selected?.userId === userId) {
        setSelected(prev => ({ ...prev, specialist: { ...prev.specialist, isValidated: true } }));
      }
    } catch (err) {
      console.error('Failed to validate doctor:', err);
      alert('Erreur lors de la validation');
    }
  };

  // ─── Delete specialist ────────────────────────────────────────
  const deleteSpecialist = async (userId) => {
    if (!confirm('Supprimer ce spécialiste ?')) return;
    try {
      await api.delete(`/users/delete/${userId}`);
      setSpecialists(prev => prev.filter(s => s.userId !== userId));
      setTotal(prev => prev - 1);
      if (selected?.userId === userId) setSelected(null);
    } catch (err) {
      console.error('Failed to delete specialist:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // ─── Filter ───────────────────────────────────────────────────
  const filtered = specialists.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.specialist?.speciality?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t('admin.specialist_management')}
          subtitle={`${total} spécialistes`}
        />

        <div className="relative mb-6">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 max-w-sm"
            placeholder="Rechercher..."
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
                  {['Nom', 'Spécialité', 'Email', 'Cabinet', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(sp => (
                  <tr key={sp.userId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {sp.imageUrl ? (
                          <img src={sp.imageUrl} alt={sp.fullName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-sm font-bold">{sp.fullName?.charAt(0) ?? '?'}</span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900 text-sm">{sp.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sp.specialist?.speciality ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sp.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sp.specialist?.clinic ?? '—'}</td>
                    <td className="px-6 py-4">
                      <Badge
                        label={sp.specialist?.isValidated ? 'Validé' : 'En attente'}
                        color={sp.specialist?.isValidated ? 'active' : 'pending'}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(sp)}
                          className="text-xs text-primary hover:underline"
                        >
                          {t('admin.view')}
                        </button>
                        {!sp.specialist?.isValidated && (
                          <button
                            onClick={() => validate(sp.userId)}
                            className="text-xs text-green-600 hover:underline"
                          >
                            {t('admin.approve')}
                          </button>
                        )}
                        <button
                          onClick={() => deleteSpecialist(sp.userId)}
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
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Aucun spécialiste trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Profil spécialiste" size="lg">
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selected.imageUrl ? (
                  <img src={selected.imageUrl} alt={selected.fullName} className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-xl font-bold text-primary">
                    {selected.fullName?.charAt(0) ?? '?'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selected.fullName}</h3>
                  <p className="text-primary">{selected.specialist?.speciality ?? '—'}</p>
                  <Badge
                    label={selected.specialist?.isValidated ? 'Validé' : 'En attente'}
                    color={selected.specialist?.isValidated ? 'active' : 'pending'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                {[
                  { label: 'Email', val: selected.email },
                  { label: 'Téléphone', val: selected.phone ?? '—' },
                  { label: 'Cabinet', val: selected.specialist?.clinic ?? '—' },
                  { label: 'Localisation', val: selected.specialist?.location ?? '—' },
                  { label: 'Note', val: selected.specialist?.rating ? `${selected.specialist.rating}/5` : '—' },
                  { label: 'Avis', val: selected.specialist?.reviewsCount ?? 0 },
                  { label: 'Numéro de licence', val: selected.specialist?.licenseNumber ?? '—' },
                  { label: 'Genre', val: selected.gender ?? '—' },
                  { label: 'Adresse', val: selected.address ?? '—' },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                {!selected.specialist?.isValidated && (
                  <button
                    onClick={() => validate(selected.userId)}
                    className="btn-primary flex-1 justify-center"
                  >
                    {t('admin.approve')}
                  </button>
                )}
                <button
                  onClick={() => { deleteSpecialist(selected.userId); setSelected(null); }}
                  className="btn-danger flex-1 justify-center"
                >
                  {t('admin.delete')}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="btn-secondary flex-1 justify-center"
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