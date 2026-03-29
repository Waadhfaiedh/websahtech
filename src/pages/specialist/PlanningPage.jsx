import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { mockRDVs } from '../../services/mockData';

export default function PlanningPage() {
  const { t } = useTranslation();
  const { specialist } = useAuth();
  const [rdvs, setRdvs] = useState(mockRDVs);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: '', startTime: '', endTime: '', type: 'Consultation' });

  const myRdvs = rdvs.filter(r => r.specialistId === specialist?.id);
  const pending = myRdvs.filter(r => r.status === 'pending');
  const upcoming = myRdvs.filter(r => r.status === 'upcoming');
  const past = myRdvs.filter(r => r.status === 'past');

  const accept = (id) => setRdvs(prev => prev.map(r => r.id === id ? { ...r, status: 'upcoming' } : r));
  const deny = (id) => setRdvs(prev => prev.filter(r => r.id !== id));

  const tabs = [
    { key: 'upcoming', label: t('planning.upcoming_rdvs'), count: upcoming.length, color: 'text-green-600' },
    { key: 'pending', label: t('planning.pending_rdvs'), count: pending.length, color: 'text-orange-500' },
    { key: 'past', label: t('planning.past_rdvs'), count: past.length, color: 'text-gray-500' },
  ];

  // Build simple week calendar
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + 1 + i);
    return d;
  });

  const getRdvsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return upcoming.filter(r => r.date === dateStr);
  };

  const currentList = activeTab === 'pending' ? pending : activeTab === 'upcoming' ? upcoming : past;

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('planning.title')}
          action={<button onClick={() => setShowAddSlot(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('planning.add_slot')}
          </button>} />

        {/* Weekly calendar */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Vue semaine</h2>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const dayRdvs = getRdvsForDay(day);
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={i} className={`rounded-xl p-2 ${isToday ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-gray-50'}`}>
                  <div className="text-center mb-2">
                    <p className="text-xs text-gray-400 font-medium">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}</p>
                    <p className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-gray-700'}`}>{day.getDate()}</p>
                  </div>
                  <div className="space-y-1 min-h-[60px]">
                    {dayRdvs.map(rdv => (
                      <div key={rdv.id} className="bg-primary text-white text-xs rounded-md p-1 truncate">
                        {rdv.startTime} {rdv.patientName.split(' ')[1]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-gray-100 w-fit shadow-sm">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'} text-xs font-bold px-1.5 py-0.5 rounded-full`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* RDV list */}
        <div className="space-y-3">
          {currentList.map(rdv => (
            <div key={rdv.id} className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">{t('planning.patient')}</p>
                  <p className="font-semibold text-sm text-gray-900">{rdv.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('planning.date')}</p>
                  <p className="font-medium text-sm text-gray-800">{rdv.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('planning.time')}</p>
                  <p className="font-medium text-sm text-gray-800">{rdv.startTime} – {rdv.endTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('planning.type')}</p>
                  <span className="badge-blue">{rdv.type}</span>
                </div>
              </div>
              {rdv.notes && <p className="text-xs text-gray-500 max-w-xs hidden xl:block italic">"{rdv.notes}"</p>}
              {activeTab === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => accept(rdv.id)} className="btn-primary text-sm py-1.5">{t('planning.accept')}</button>
                  <button onClick={() => deny(rdv.id)} className="btn-danger text-sm py-1.5">{t('planning.deny')}</button>
                </div>
              )}
            </div>
          ))}
          {currentList.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p>{t('common.no_data')}</p>
            </div>
          )}
        </div>

        <Modal isOpen={showAddSlot} onClose={() => setShowAddSlot(false)} title={t('planning.add_slot')}>
          <div className="space-y-4">
            {[
              { label: t('planning.date'), key: 'date', type: 'date' },
              { label: 'Heure début', key: 'startTime', type: 'time' },
              { label: 'Heure fin', key: 'endTime', type: 'time' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} value={slotForm[f.key]} onChange={e => setSlotForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.type')}</label>
              <select value={slotForm.type} onChange={e => setSlotForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                {['Consultation', 'Rééducation', 'Bilan', 'Suivi', 'Neurologie'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={() => { alert('Créneau ajouté !'); setShowAddSlot(false); }} className="btn-primary w-full justify-center">
              {t('common.add')}
            </button>
          </div>
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
