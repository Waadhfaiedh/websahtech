import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';
import { mockReports, mockPatients } from '../../services/mockData';

const riskColors = { green: 'badge-green', orange: 'badge-orange', red: 'badge-red' };
const riskLabels = { green: 'Faible', orange: 'Modéré', red: 'Élevé' };
const riskBorderColors = { green: 'border-l-green-500', orange: 'border-l-orange-500', red: 'border-l-red-500' };

export default function ReportsPage() {
  const { t } = useTranslation();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [comments, setComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [tempComment, setTempComment] = useState('');

  const filtered = mockReports.filter(r => {
    const matchSeverity = severityFilter === 'all' || r.riskLevel === severityFilter;
    const matchPatient = patientFilter === 'all' || String(r.patientId) === patientFilter;
    return matchSeverity && matchPatient;
  });

  const saveComment = (id) => {
    setComments(prev => ({ ...prev, [id]: tempComment }));
    setEditingComment(null);
  };

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('reports.title')} subtitle={`${mockReports.length} rapports générés`} />

        <div className="flex gap-3 mb-6">
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="input-field w-48">
            <option value="all">{t('reports.all_severities')}</option>
            <option value="green">{t('reports.low')}</option>
            <option value="orange">{t('reports.moderate')}</option>
            <option value="red">{t('reports.high')}</option>
          </select>
          <select value={patientFilter} onChange={e => setPatientFilter(e.target.value)} className="input-field w-48">
            <option value="all">{t('reports.filter_patient')}</option>
            {mockPatients.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
          <div className="flex gap-1 ml-auto">
            {['all', 'green', 'orange', 'red'].map(level => (
              <button key={level} onClick={() => setSeverityFilter(level)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${severityFilter === level
                  ? level === 'all' ? 'bg-gray-800 text-white border-gray-800' : level === 'green' ? 'bg-green-500 text-white border-green-500' : level === 'orange' ? 'bg-orange-500 text-white border-orange-500' : 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                {level === 'all' ? 'Tous' : riskLabels[level]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map(report => (
            <div key={report.id} className={`card border-l-4 ${riskBorderColors[report.riskLevel]}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/specialist/patients/${report.patientId}`}
                        className="font-bold text-gray-900 hover:text-primary transition-colors">
                        {report.patientName}
                      </Link>
                      <span className={riskColors[report.riskLevel]}>{riskLabels[report.riskLevel]}</span>
                      {report.status === 'reviewed' && <span className="badge-blue">Examiné</span>}
                    </div>
                    <p className="text-sm text-gray-500">{report.date} à {report.time} · {report.muscleGroup}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Résumé</p>
                  <p className="text-sm text-gray-700">{report.summary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Constatations</p>
                  <p className="text-sm text-gray-700">{report.findings}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{t('reports.recommendation')}</p>
                  <p className="text-sm text-gray-700">{report.recommendation}</p>
                </div>
              </div>

              {/* Comment section */}
              <div className="border-t border-gray-100 pt-3">
                {editingComment === report.id ? (
                  <div className="flex gap-2">
                    <input value={tempComment} onChange={e => setTempComment(e.target.value)}
                      className="input-field flex-1 text-sm py-1.5" placeholder="Votre annotation..." />
                    <button onClick={() => saveComment(report.id)} className="btn-primary text-sm py-1.5">{t('reports.save_comment')}</button>
                    <button onClick={() => setEditingComment(null)} className="btn-secondary text-sm py-1.5">{t('common.cancel')}</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {(comments[report.id] || report.specialistComment) ? (
                      <p className="text-sm text-gray-600 italic flex-1">💬 {comments[report.id] || report.specialistComment}</p>
                    ) : (
                      <p className="text-sm text-gray-400 flex-1">Aucun commentaire</p>
                    )}
                    <button onClick={() => { setEditingComment(report.id); setTempComment(comments[report.id] || report.specialistComment || ''); }}
                      className="text-xs text-primary hover:underline">
                      {(comments[report.id] || report.specialistComment) ? 'Modifier' : t('reports.add_comment')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>{t('common.no_data')}</p>
            </div>
          )}
        </div>
      </div>
    </SpecialistLayout>
  );
}
