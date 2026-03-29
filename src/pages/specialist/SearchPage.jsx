import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { mockSpecialists } from '../../services/mockData';

const wilayas = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Monastir', 'Gabès', 'Kairouan', 'Gafsa', 'Médenine'];
const specialties = ['Kinésithérapeute', 'Orthopédiste', 'Neurologue', 'Cardiologue', 'Dermatologue', 'Généraliste'];

export default function SearchPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [city, setCity] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = mockSpecialists.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.clinic.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !specialty || s.specialty === specialty;
    const matchWilaya = !wilaya || s.wilaya === wilaya;
    const matchCity = !city || s.city.toLowerCase().includes(city.toLowerCase());
    return matchSearch && matchSpec && matchWilaya && matchCity;
  });

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('search.title')} />

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative col-span-2 lg:col-span-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" placeholder={t('search.search_placeholder')} />
            </div>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="input-field">
              <option value="">{t('search.all_specialties')}</option>
              {specialties.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={wilaya} onChange={e => setWilaya(e.target.value)} className="input-field">
              <option value="">{t('search.all_regions')}</option>
              {wilayas.map(w => <option key={w}>{w}</option>)}
            </select>
            <input value={city} onChange={e => setCity(e.target.value)} className="input-field" placeholder={t('search.city')} />
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{filtered.length} résultat(s)</p>
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-100">
            <button onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}>
              {t('search.list_view')}
            </button>
            <button onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}>
              {t('search.map_view')}
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(sp => (
              <div key={sp.id} className="card hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setSelected(sp)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">{sp.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{sp.name}</h3>
                    <p className="text-primary text-sm font-medium">{sp.specialty}</p>
                    <StarRating rating={sp.rating} />
                  </div>
                  <Badge label={sp.status === 'active' ? 'Actif' : 'En attente'} color={sp.status} />
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {sp.clinic}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    {sp.city}, {sp.wilaya}
                  </div>
                </div>
                <button className="btn-secondary w-full mt-3 text-sm justify-center py-2">{t('search.view_profile')}</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[500px]">
            <MapContainer center={[33.8869, 9.5375]} zoom={6} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              {filtered.map(sp => (
                <Marker key={sp.id} position={[sp.lat, sp.lng]}>
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold text-sm">{sp.name}</p>
                      <p className="text-primary text-xs">{sp.specialty}</p>
                      <p className="text-gray-500 text-xs mt-1">{sp.clinic}</p>
                      <p className="text-gray-500 text-xs">{sp.city}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Specialist detail modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Profil du spécialiste" size="lg">
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                  <p className="text-primary font-medium">{selected.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(i => <svg key={i} className={`w-4 h-4 ${i <= Math.round(selected.rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                    <span className="text-sm text-gray-500 ml-1">{selected.rating}/5</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                {[
                  { label: 'Cabinet', val: selected.clinic },
                  { label: 'Adresse', val: selected.address },
                  { label: 'Ville', val: `${selected.city}, ${selected.wilaya}` },
                  { label: 'Téléphone', val: selected.phone },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                    <p className="text-sm text-gray-800 font-medium">{item.val}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Biographie</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selected.bio}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Diplômes</p>
                <ul className="space-y-1">
                  {selected.diplomas.map((d, i) => <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />{d}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Langues</p>
                <div className="flex gap-2 flex-wrap">{selected.languages.map(l => <span key={l} className="badge-blue">{l}</span>)}</div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
