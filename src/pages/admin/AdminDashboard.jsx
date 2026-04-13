import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/common/StatCard';
import api from '../../services/api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admins/get-forms')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeSpecialists = data?.specialist?.data?.filter(s => s.specialist?.isValidated).length ?? 0;
  const pendingSpecialists = data?.specialist?.data?.filter(s => !s.specialist?.isValidated).length ?? 0;
  const totalSpecialists = data?.specialist?.count ?? 0;
  const totalPatients = data?.patient?.count ?? 0;
  const totalPosts = data?.postNumber ?? 0;
  const totalDocuments = data?.medicalDocumentNumber ?? 0;

  const recentActivity = [
    { type: 'new_specialist', text: 'Nouvelle inscription: Dr. Samira Touati (Neurologue)', time: '2h', color: 'bg-blue-500' },
    { type: 'new_report', text: 'Rapport IA généré pour Mohamed Cherif', time: '4h', color: 'bg-purple-500' },
    { type: 'new_patient', text: 'Nouveau patient inscrit: Omar Zitouni', time: '6h', color: 'bg-green-500' },
    { type: 'post', text: 'Nouvelle publication: "5 exercices essentiels..."', time: '8h', color: 'bg-orange-500' },
    { type: 'flag', text: 'Publication signalée par un utilisateur', time: '1j', color: 'bg-red-500' },
    { type: 'new_specialist', text: 'Dr. Karim Meziane — compte activé', time: '2j', color: 'bg-blue-500' },
  ];

  const stats = [
    {
      title: t('admin.total_specialists'),
      value: totalSpecialists,
      color: 'blue',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      title: t('admin.pending_specialists'),
      value: pendingSpecialists,
      color: 'orange',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      title: t('admin.total_patients'),
      value: totalPatients,
      color: 'green',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      title: 'Total Spécialistes Validés',
      value: activeSpecialists,
      color: 'purple',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      title: t('admin.total_posts'),
      value: totalPosts,
      color: 'purple',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
    },
    {
      title: 'Documents Médicaux',
      value: totalDocuments,
      color: 'blue',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold">Administration SAHTECH</h1>
          <p className="text-gray-300 mt-1">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent activity */}
          <div className="col-span-2 card">
            <h2 className="font-bold text-gray-900 mb-4">{t('admin.recent_activity')}</h2>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${act.color}`} />
                  <p className="text-sm text-gray-700 flex-1">{act.text}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
            <div className="space-y-2">
              {[
                { label: t('admin.specialist_management'), path: '/admin/specialists', color: 'text-blue-600 bg-blue-50' },
                { label: t('admin.patient_management'), path: '/admin/patients', color: 'text-green-600 bg-green-50' },
                { label: t('admin.content_moderation'), path: '/admin/posts', color: 'text-orange-600 bg-orange-50' },
              ].map(item => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl ${item.color} hover:opacity-80 transition-opacity`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Pending specialists from API */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                Total Spécialistes ({totalSpecialists})
              </p>
              {data?.specialist?.data?.slice(0, 4).map(sp => (
                <div key={sp.userId} className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 ${sp.specialist?.isValidated ? 'bg-green-100' : 'bg-orange-100'} rounded-full flex items-center justify-center`}>
                    <span className={`${sp.specialist?.isValidated ? 'text-green-600' : 'text-orange-600'} text-xs font-bold`}>
                      {sp.fullName?.charAt(0) ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{sp.fullName}</p>
                    <p className="text-xs text-gray-400">
                      {sp.specialist?.isValidated ? 'Validé' : 'En attente'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}