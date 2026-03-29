import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/common/PageHeader';
import { mockPosts } from '../../services/mockData';

export default function AdminPosts() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState(mockPosts.map((p, i) => ({ ...p, flagged: i === 4 })));

  const toggle = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
  const deleteP = (id) => { if (confirm('Supprimer cette publication ?')) setPosts(prev => prev.filter(p => p.id !== id)); };
  const unflag = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, flagged: false } : p));

  const typeColors = { article: 'badge-blue', photo: 'badge-green', video: 'badge-orange' };

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('admin.content_moderation')} subtitle={`${posts.length} publications`} />

        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className={`card flex gap-4 ${post.flagged ? 'ring-2 ring-red-200' : ''}`}>
              {post.image && (
                <img src={post.image} alt={post.title} className="w-28 h-20 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.flagged && <span className="badge-red">🚩 Signalé</span>}
                    <span className={typeColors[post.type]}>{post.type}</span>
                    <span className="badge-gray">{post.category}</span>
                    {!post.visible && <span className="badge-gray">Masqué</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {post.flagged && <button onClick={() => unflag(post.id)} className="text-xs text-gray-500 hover:text-gray-700">Retirer le signalement</button>}
                    <button onClick={() => toggle(post.id)} className={`text-xs ${post.visible ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}>
                      {post.visible ? t('admin.hide') : t('admin.show')}
                    </button>
                    <button onClick={() => deleteP(post.id)} className="text-xs text-red-400 hover:text-red-600">{t('admin.delete')}</button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>Par: <span className="font-medium text-gray-600">{post.specialistName}</span></span>
                  <span>{post.date}</span>
                  <span>👁 {post.views}</span>
                  <span>❤️ {post.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
