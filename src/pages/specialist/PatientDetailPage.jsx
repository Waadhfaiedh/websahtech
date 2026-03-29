import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import Badge from '../../components/common/Badge';
import { mockPatients, mockReports } from '../../services/mockData';

const riskColors = { green: 'badge-green', orange: 'badge-orange', red: 'badge-red' };
const riskLabels = { green: 'Faible', orange: 'Modéré', red: 'Élevé' };

export default function PatientDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([]);

  const patient = mockPatients.find(p => p.id === parseInt(id));
  const patientReports = mockReports.filter(r => r.patientId === parseInt(id));
  const [treatmentPlan, setTreatmentPlan] = useState(patient?.treatmentPlan || '');
  const [editingPlan, setEditingPlan] = useState(false);

  if (!patient) return (
    <SpecialistLayout>
      <div className="p-8 text-center text-gray-400">Patient introuvable.</div>
    </SpecialistLayout>
  );

  const allNotes = [...patient.notes, ...notes].sort((a, b) => new Date(b.date) - new Date(a.date));

  const tabs = [
    { key: 'info', label: 'Informations' },
    { key: 'treatment', label: 'Plan de traitement' },
    { key: 'notes', label: 'Notes de suivi' },
    { key: 'reports', label: t('patients.ai_reports') },
  ];

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [{ date: new Date().toISOString().split('T')[0], text: noteText }, ...prev]);
    setNoteText('');
  };

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {t('common.back')}
        </button>

        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                <p className="text-gray-500">{patient.age} ans · {patient.condition}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge label={patient.status === 'active' ? 'Actif' : 'En attente'} color={patient.status} />
                  <span className="text-xs text-gray-400">Dernière visite: {patient.lastVisit}</span>
                </div>
              </div>
            </div>
            <Link to="/specialist/chat" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {t('patients.open_chat')}
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-primary'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Informations personnelles</h3>
              <dl className="space-y-3">
                {[
                  { label: 'Email', val: patient.email },
                  { label: 'Téléphone', val: patient.phone },
                  { label: 'Adresse', val: patient.address },
                  { label: 'Date inscription', val: patient.registrationDate },
                ].map(item => (
                  <div key={item.label} className="flex gap-4">
                    <dt className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">{item.label}</dt>
                    <dd className="text-sm text-gray-800">{item.val}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">{t('patients.medical_history')}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{patient.medicalHistory}</p>
            </div>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{t('patients.treatment_plan')}</h3>
              <button onClick={() => setEditingPlan(!editingPlan)} className="btn-secondary text-sm py-1.5">
                {editingPlan ? t('common.cancel') : t('common.edit')}
              </button>
            </div>
            {editingPlan ? (
              <div className="space-y-3">
                <textarea value={treatmentPlan} onChange={e => setTreatmentPlan(e.target.value)}
                  rows={6} className="input-field resize-none" />
                <button onClick={() => setEditingPlan(false)} className="btn-primary">
                  {t('common.save')}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{treatmentPlan}</p>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">Ajouter une note</h3>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
                className="input-field resize-none mb-3" placeholder="Observations de la séance..." />
              <button onClick={addNote} className="btn-primary">{t('common.add')}</button>
            </div>
            <div className="space-y-3">
              {allNotes.map((note, i) => (
                <div key={i} className="card border-l-4 border-l-primary">
                  <p className="text-xs text-gray-400 mb-1">{note.date}</p>
                  <p className="text-sm text-gray-800">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {patientReports.length === 0 && <p className="text-gray-400 text-center py-8">{t('common.no_data')}</p>}
            {patientReports.map(report => (
              <div key={report.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{report.muscleGroup}</h3>
                    <p className="text-sm text-gray-500">{report.date} à {report.time}</p>
                  </div>
                  <span className={riskColors[report.riskLevel]}>{riskLabels[report.riskLevel]}</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{report.summary}</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Recommandation</p>
                  <p className="text-sm text-gray-700">{report.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SpecialistLayout>
  );
}
