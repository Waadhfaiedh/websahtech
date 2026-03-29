import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';
import { mockPosts } from '../../services/mockData';

export default function AccueilPage() {
  const { t } = useTranslation();
  const { specialist } = useAuth();
  const allPosts = mockPosts.filter(p => p.visible);
  const myPosts = allPosts.filter(p => p.specialistId === specialist?.id);
  const sorted = [...myPosts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date));

  const typeColors = { article: 'badge-blue', photo: 'badge-green', video: 'badge-orange' };

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('nav.accueil')} subtitle="Votre fil de publications" />

        <div className="max-w-2xl space-y-6">
          {sorted.map(post => (
            <div key={post.id} className={`card hover:shadow-md transition-all duration-200 ${post.pinned ? 'ring-2 ring-primary/20' : ''}`}>
              {post.pinned && (
                <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-3">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" /></svg>
                  Publication épinglée
                </div>
              )}
              {post.image && (
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-xl mb-4" />
              )}
              {post.videoUrl && (
                <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <iframe src={post.videoUrl} className="w-full h-full" allowFullScreen title={post.title} />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={typeColors[post.type]}>{post.type}</span>
                <span className="badge-gray">{post.category}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
                <span>{post.date}</span>
                <span className="flex items-center gap-1">👁 {post.views}</span>
                <span className="flex items-center gap-1">❤️ {post.likes}</span>
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>Aucune publication pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </SpecialistLayout>
  );
}
