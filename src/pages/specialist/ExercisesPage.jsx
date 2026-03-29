import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import { mockExercises, mockPatients } from '../../services/mockData';

export default function ExercisesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('my');
  const [myExercises, setMyExercises] = useState(mockExercises.slice(0, 5));
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [addForm, setAddForm] = useState({ title: '', description: '', muscleGroup: '', videoUrl: '', difficulty: 'Débutant', duration: '' });

  const difficultyColors = { 'Débutant': 'badge-green', 'Intermédiaire': 'badge-orange', 'Avancé': 'badge-red', 'Adapté': 'badge-blue' };

  const searchResults = mockExercises.filter(ex =>
    ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = () => {
    if (!addForm.title.trim()) return;
    setMyExercises(prev => [{ id: Date.now(), ...addForm, thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80' }, ...prev]);
    setShowAdd(false);
    setAddForm({ title: '', description: '', muscleGroup: '', videoUrl: '', difficulty: 'Débutant', duration: '' });
  };

  const ExerciseCard = ({ ex, showAssignBtn = false }) => (
    <div className="card hover:shadow-md transition-all duration-200">
      <img src={ex.thumbnail} alt={ex.title} className="w-full h-36 object-cover rounded-lg mb-3" />
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{ex.title}</h3>
        <span className={`${difficultyColors[ex.difficulty] || 'badge-gray'} flex-shrink-0`}>{ex.difficulty}</span>
      </div>
      <p className="text-xs text-primary font-medium mb-2">{ex.muscleGroup}</p>
      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{ex.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">⏱ {ex.duration}</span>
        {showAssignBtn && (
          <button onClick={() => setShowAssign(ex)} className="text-xs btn-primary py-1 px-3">{t('exercises.assign')}</button>
        )}
      </div>
    </div>
  );

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('exercises.title')}
          action={activeTab === 'my' && (
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {t('exercises.add_exercise')}
            </button>
          )} />

        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          <button onClick={() => setActiveTab('my')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'my' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}>
            {t('exercises.my_exercises')}
          </button>
          <button onClick={() => setActiveTab('search')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}>
            {t('exercises.search_exercises')}
          </button>
        </div>

        {activeTab === 'my' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {myExercises.map(ex => <ExerciseCard key={ex.id} ex={ex} />)}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <div className="relative mb-6">
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-11 py-3 text-base" placeholder={t('exercises.search_placeholder')} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchResults.map(ex => <ExerciseCard key={ex.id} ex={ex} showAssignBtn />)}
            </div>
          </div>
        )}

        {/* Add modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={t('exercises.add_exercise')}>
          <div className="space-y-4">
            {[
              { label: 'Titre', key: 'title', type: 'input' },
              { label: t('exercises.muscle_group'), key: 'muscleGroup', type: 'input' },
              { label: 'URL Vidéo', key: 'videoUrl', type: 'input' },
              { label: 'Durée', key: 'duration', type: 'input' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input value={addForm[f.key]} onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('exercises.difficulty')}</label>
              <select value={addForm.difficulty} onChange={e => setAddForm(p => ({ ...p, difficulty: e.target.value }))} className="input-field">
                {['Débutant', 'Intermédiaire', 'Avancé', 'Adapté'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                rows={3} className="input-field resize-none" />
            </div>
            <button onClick={handleAdd} className="btn-primary w-full justify-center">{t('common.add')}</button>
          </div>
        </Modal>

        {/* Assign modal */}
        <Modal isOpen={!!showAssign} onClose={() => setShowAssign(null)} title={`Assigner : ${showAssign?.title}`}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Sélectionner un patient :</p>
            {mockPatients.map(p => (
              <button key={p.id} onClick={() => { alert(`Exercice assigné à ${p.name} !`); setShowAssign(null); }}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm font-bold">{p.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.condition}</p>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
