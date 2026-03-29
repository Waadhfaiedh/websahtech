import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import { mockPatients } from '../../services/mockData';

export default function PatientsPage() {
  const { t } = useTranslation();
  const { specialist } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const myPatients = mockPatients.filter(p => p.assignedSpecialistId === specialist?.id);
  const filtered = myPatients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('patients.title')} subtitle={`${myPatients.length} patients assignés`} />

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder={t('patients.search')}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-44">
            <option value="all">{t('patients.all')}</option>
            <option value="active">{t('patients.active')}</option>
            <option value="pending">{t('patients.pending')}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(patient => (
            <Link to={`/specialist/patients/${patient.id}`} key={patient.id}
              className="card hover:shadow-md hover:border-primary/20 transition-all duration-200 group cursor-pointer border border-gray-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">{patient.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">{patient.name}</h3>
                  <p className="text-sm text-gray-500">{patient.age} ans</p>
                </div>
                <Badge label={patient.status === 'active' ? t('patients.active') : t('patients.pending')} color={patient.status} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">{t('patients.condition')}</span>
                  <span className="text-xs text-gray-800 font-medium">{patient.condition}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">{t('patients.last_visit')}</span>
                  <span className="text-xs text-gray-600">{patient.lastVisit}</span>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p>{t('common.no_data')}</p>
            </div>
          )}
        </div>
      </div>
    </SpecialistLayout>
  );
}
