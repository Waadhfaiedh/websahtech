import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import { mockPosts } from '../../services/mockData';

export default function PostsPage() {
  const { t } = useTranslation();
  const { specialist } = useAuth();
  const [posts, setPosts] = useState(mockPosts.filter(p => p.specialistId === specialist?.id));
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [form, setForm] = useState({ type: 'article', title: '', content: '', image: '', videoUrl: '', category: 'Rééducation' });

  const categories = ['Rééducation', 'Orthopédie', 'Neurologie', 'Cabinet', 'Tutoriel', 'Santé'];
  const typeLabels = { article: t('posts.article'), photo: t('posts.photo'), video: t('posts.video') };
  const typeColors = { article: 'badge-blue', photo: 'badge-green', video: 'badge-orange' };

  const openCreate = () => {
    setEditPost(null);
    setForm({ type: 'article', title: '', content: '', image: '', videoUrl: '', category: 'Rééducation' });
    setShowModal(true);
  };

  const openEdit = (post) => {
    setEditPost(post);
    setForm({ type: post.type, title: post.title, content: post.content, image: post.image || '', videoUrl: post.videoUrl || '', category: post.category });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editPost) {
      setPosts(prev => prev.map(p => p.id === editPost.id ? { ...p, ...form } : p));
    } else {
      const newPost = { id: Date.now(), specialistId: specialist?.id, ...form, date: new Date().toISOString().split('T')[0], pinned: false, visible: true, likes: 0, views: 0, excerpt: form.content.slice(0, 100) };
      setPosts(prev => [newPost, ...prev]);
    }
    setShowModal(false);
  };

  const deletePost = (id) => { if (confirm('Supprimer ce post ?')) setPosts(prev => prev.filter(p => p.id !== id)); };
  const togglePin = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p));

  const sorted = [...posts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader title={t('posts.title')} subtitle={`${posts.length} publications`}
          action={<button onClick={openCreate} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('posts.new_post')}
          </button>} />

        <div className="space-y-4">
          {sorted.map(post => (
            <div key={post.id} className={`card flex gap-4 ${post.pinned ? 'ring-2 ring-primary/20' : ''}`}>
              {post.image && (
                <img src={post.image} alt={post.title} className="w-32 h-24 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.pinned && <span className="text-xs font-bold text-primary">📌 Épinglé</span>}
                    <span className={typeColors[post.type]}>{typeLabels[post.type]}</span>
                    <span className="badge-gray">{post.category}</span>
                    {!post.visible && <span className="badge-red">Masqué</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => togglePin(post.id)} className="text-xs text-gray-400 hover:text-primary transition-colors">
                      {post.pinned ? t('posts.unpin') : t('posts.pin')}
                    </button>
                    <button onClick={() => openEdit(post)} className="text-xs text-primary hover:underline">{t('posts.edit')}</button>
                    <button onClick={() => deletePost(post.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">{t('posts.delete')}</button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{post.date}</span>
                  <span>👁 {post.views}</span>
                  <span>❤️ {post.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)}
          title={editPost ? t('posts.edit') : t('posts.new_post')} size="lg">
          <div className="space-y-4">
            <div className="flex gap-2">
              {['article', 'photo', 'video'].map(type => (
                <button key={type} onClick={() => setForm(f => ({ ...f, type }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.type === type ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}>
                  {typeLabels[type]}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('posts.post_title')}</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('posts.post_category')}</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('posts.post_content')}</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={4} className="input-field resize-none" />
            </div>
            {(form.type === 'photo' || form.type === 'article') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="input-field" placeholder="https://..." />
              </div>
            )}
            {form.type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la vidéo</label>
                <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} className="input-field" placeholder="https://youtube.com/embed/..." />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">{t('posts.publish')}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">{t('common.cancel')}</button>
            </div>
          </div>
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
