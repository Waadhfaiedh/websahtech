import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import api from "../../services/api";
import { toast } from "react-toastify";

const EMPTY_VTT_TRACK = "data:text/vtt;charset=utf-8,WEBVTT";

export default function AdminPosts() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPostId, setProcessingPostId] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);

  const publishedCount = posts.filter((post) => post.isPublished).length;
  const pendingCount = posts.length - publishedCount;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admins/post");
      const postsData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setPosts(postsData);
    } catch (err) {
      console.error("Failed to load posts:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger les publications",
      );
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const acceptPost = async (postId) => {
    try {
      setProcessingPostId(postId);
      const res = await api.patch(`/admins/post/${postId}`);
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId ? { ...post, isPublished: true } : post,
        ),
      );
      toast.success(res.data?.message || "Post accepté et publié avec succès");
    } catch (err) {
      console.error("Failed to accept post:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la validation du post",
      );
    } finally {
      setProcessingPostId(null);
    }
  };

  const deletePost = async (postId) => {
    try {
      setProcessingPostId(postId);
      const res = await api.delete(`/admins/post/${postId}`);
      setPosts((prev) => prev.filter((post) => post.postId !== postId));
      toast.success(res.data?.message || "Post supprimé avec succès");
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression du post",
      );
    } finally {
      setProcessingPostId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    await deletePost(postToDelete.postId);
    setPostToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "ARTICLE":
        return "badge-blue";
      case "IMAGE":
        return "badge-green";
      case "VIDEO":
        return "badge-orange";
      default:
        return "badge-gray";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "ARTICLE":
        return "Article";
      case "IMAGE":
        return "Image";
      case "VIDEO":
        return "Vidéo";
      default:
        return type || "Inconnu";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "ARTICLE":
        return "📄";
      case "IMAGE":
        return "🖼️";
      case "VIDEO":
        return "🎬";
      default:
        return "📝";
    }
  };

  const getAuthorName = (post) =>
    post.specialist?.user?.fullName || "Utilisateur inconnu";

  const getAuthorInitial = (post) =>
    getAuthorName(post).charAt(0).toUpperCase() || "?";

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t("admin.content_moderation")}
          subtitle={`${posts.length} publications`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-white to-blue-50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
              Total
            </p>
            <p className="text-3xl font-extrabold text-gray-900">
              {posts.length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-white to-amber-50 border border-amber-100">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
              En attente
            </p>
            <p className="text-3xl font-extrabold text-gray-900">
              {pendingCount}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-white to-emerald-50 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
              Publiées
            </p>
            <p className="text-3xl font-extrabold text-gray-900">
              {publishedCount}
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-3">🗂️</div>
            <p className="text-gray-500">Aucune publication trouvée</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => {
              const isPending = post.isPublished === false;
              const hasMediaUrl =
                Boolean(post.url) &&
                (post.type === "IMAGE" || post.type === "VIDEO");
              const isImagePost = post.type === "IMAGE";

              return (
                <div
                  key={post.postId}
                  className={`card p-0 overflow-hidden border transition-all duration-200 hover:shadow-lg ${
                    isPending
                      ? "border-orange-200 ring-2 ring-orange-100"
                      : "border-emerald-100"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-64 h-44 lg:h-auto bg-gray-100 relative flex-shrink-0">
                      {hasMediaUrl && isImagePost && (
                        <img
                          src={post.url}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {hasMediaUrl && !isImagePost && (
                        <video
                          src={post.url}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        >
                          <track
                            kind="captions"
                            srcLang="fr"
                            label="French"
                            src={EMPTY_VTT_TRACK}
                          />
                        </video>
                      )}

                      {!hasMediaUrl && (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-5xl">
                          {getTypeIcon(post.type)}
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                        <span
                          className={`${getTypeBadgeClass(post.type)} shadow-sm`}
                        >
                          {getTypeLabel(post.type)}
                        </span>
                        {post.isPublished ? (
                          <span className="badge-green shadow-sm">Publié</span>
                        ) : (
                          <span className="badge-orange shadow-sm">
                            En attente
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 p-5 lg:p-6 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-bold text-xl text-gray-900 leading-snug">
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isPending && (
                            <button
                              onClick={() => acceptPost(post.postId)}
                              disabled={processingPostId === post.postId}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {processingPostId === post.postId
                                ? "..."
                                : "Accepter"}
                            </button>
                          )}
                          <button
                            onClick={() => setPostToDelete(post)}
                            disabled={processingPostId === post.postId}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            {t("admin.delete")}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                        {post.description || "Aucune description fournie."}
                      </p>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500 min-w-0">
                          {post.specialist?.user?.imageUrl ? (
                            <img
                              src={post.specialist.user.imageUrl}
                              alt={getAuthorName(post)}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                              {getAuthorInitial(post)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400">Publié par</p>
                            <p className="font-semibold text-gray-700 truncate">
                              {getAuthorName(post)}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(postToDelete)}
        onClose={() => setPostToDelete(null)}
        title="Supprimer la publication"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Êtes-vous sûr de vouloir supprimer cette publication ? Cette action
            est irréversible.
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Titre</p>
            <p className="text-sm font-medium text-gray-800 line-clamp-2">
              {postToDelete?.title || "Publication"}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPostToDelete(null)}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={processingPostId === postToDelete?.postId}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {processingPostId === postToDelete?.postId
                ? "Suppression..."
                : "Supprimer"}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
