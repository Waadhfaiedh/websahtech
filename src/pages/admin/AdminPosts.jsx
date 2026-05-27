// Redesigned following SAHTECK brand guidelines
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FileText,
  Image as LucideImage,
  Film,
  File,
  LayoutList,
  Clock,
  CheckCircle2,
  Check,
  Trash2,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const EMPTY_VTT_TRACK = "data:text/vtt;charset=utf-8,WEBVTT";

const cardShadow = "0 2px 12px rgba(0,82,255,0.08)";

const SkeletonCard = () => (
  <div
    className="overflow-hidden rounded-xl bg-white"
    style={{ boxShadow: cardShadow }}
  >
    <div className="flex flex-col lg:flex-row">
      <div className="w-full lg:w-64 h-48 lg:h-auto bg-slate-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="h-5 bg-slate-100 animate-pulse rounded-lg w-2/3" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="h-4 bg-slate-100 animate-pulse rounded-lg w-full" />
        <div className="h-4 bg-slate-100 animate-pulse rounded-lg w-5/6" />
        <div className="h-4 bg-slate-100 animate-pulse rounded-lg w-3/4" />
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-slate-100 animate-pulse rounded" />
              <div className="h-3 w-28 bg-slate-100 animate-pulse rounded" />
            </div>
          </div>
          <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
        </div>
      </div>
    </div>
  </div>
);

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

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case "ARTICLE":
        return { background: "#EFF6FF", color: "#0052FF" };
      case "IMAGE":
        return { background: "#ECFDF5", color: "#10B981" };
      case "VIDEO":
        return { background: "#FFFBEB", color: "#F59E0B" };
      default:
        return { background: "#F8FAFF", color: "#64748B" };
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
        return <FileText size={36} color="white" />;
      case "IMAGE":
        return <LucideImage size={36} color="white" />;
      case "VIDEO":
        return <Film size={36} color="white" />;
      default:
        return <File size={36} color="white" />;
    }
  };

  const getAuthorName = (post) =>
    post.specialist?.user?.fullName || "Utilisateur inconnu";

  const getAuthorInitial = (post) =>
    getAuthorName(post).charAt(0).toUpperCase() || "?";

  const statCards = [
    {
      label: "Total",
      value: posts.length,
      Icon: LayoutList,
      iconBg: "#EFF6FF",
      iconColor: "#0052FF",
      gradientTo: "to-blue-50",
    },
    {
      label: "En attente",
      value: pendingCount,
      Icon: Clock,
      iconBg: "#FFFBEB",
      iconColor: "#F59E0B",
      gradientTo: "to-amber-50",
    },
    {
      label: "Publiées",
      value: publishedCount,
      Icon: CheckCircle2,
      iconBg: "#ECFDF5",
      iconColor: "#10B981",
      gradientTo: "to-emerald-50",
    },
  ];

  return (
    <AdminLayout>
      <div
        className="p-8 animate-fadeIn"
        style={{ background: "#F8FAFF", minHeight: "100vh" }}
      >
        <PageHeader
          title={t("admin.content_moderation")}
          subtitle={`${posts.length} publications au total`}
        />

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statCards.map(({ label, value, Icon, iconBg, iconColor, gradientTo }) => (
            <div
              key={label}
              className={`bg-gradient-to-br from-white ${gradientTo} rounded-xl p-5 flex items-center gap-4 transition-all duration-200`}
              style={{ boxShadow: cardShadow }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: iconBg }}
              >
                <Icon size={22} style={{ color: iconColor }} />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                  style={{ color: iconColor }}
                >
                  {label}
                </p>
                <p
                  className="text-3xl font-extrabold"
                  style={{ color: "#0A0F1E" }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Post List ── */}
        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div
            className="rounded-xl bg-white text-center py-20 flex flex-col items-center"
            style={{ boxShadow: cardShadow }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#F8FAFF" }}
            >
              <FileText size={40} color="#CBD5E1" />
            </div>
            <p className="text-lg font-semibold" style={{ color: "#0A0F1E" }}>
              Aucune publication trouvée
            </p>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>
              Les publications des spécialistes apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => {
              const isPending = post.isPublished === false;
              const hasMediaUrl =
                Boolean(post.url) &&
                (post.type === "IMAGE" || post.type === "VIDEO");
              const isImagePost = post.type === "IMAGE";
              const isProcessing = processingPostId === post.postId;
              const typeBadgeStyle = getTypeBadgeStyle(post.type);

              return (
                <div
                  key={post.postId}
                  className="overflow-hidden rounded-xl bg-white transition-all duration-200 hover:shadow-lg"
                  style={{
                    boxShadow: isPending
                      ? "0 2px 12px rgba(245,158,11,0.14), 0 0 0 2px rgba(245,158,11,0.18)"
                      : cardShadow,
                  }}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* ── Media Thumbnail ── */}
                    <div className="w-full lg:w-64 h-48 lg:h-auto bg-slate-100 relative flex-shrink-0">
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
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg,#0052FF,#00A3FF)",
                          }}
                        >
                          {getTypeIcon(post.type)}
                        </div>
                      )}

                      {/* Badges overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                          style={typeBadgeStyle}
                        >
                          {getTypeLabel(post.type)}
                        </span>
                        {post.isPublished ? (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                            style={{ background: "#ECFDF5", color: "#10B981" }}
                          >
                            Publié
                          </span>
                        ) : (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                            style={{ background: "#FFFBEB", color: "#F59E0B" }}
                          >
                            En attente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Content ── */}
                    <div className="flex-1 p-5 lg:p-6 min-w-0 flex flex-col">
                      {/* Title + Actions */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3
                          className="font-bold text-lg leading-snug flex-1"
                          style={{ color: "#0A0F1E" }}
                        >
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isPending && (
                            <button
                              onClick={() => acceptPost(post.postId)}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 hover:opacity-80"
                              style={{ background: "#ECFDF5", color: "#10B981" }}
                            >
                              {isProcessing ? (
                                <div
                                  className="w-3.5 h-3.5 rounded-full animate-spin flex-shrink-0"
                                  style={{
                                    borderWidth: 2,
                                    borderStyle: "solid",
                                    borderColor: "#10B981",
                                    borderTopColor: "transparent",
                                  }}
                                />
                              ) : (
                                <Check size={14} />
                              )}
                              Accepter
                            </button>
                          )}
                          <button
                            onClick={() => setPostToDelete(post)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 hover:opacity-80"
                            style={{ background: "#FEF2F2", color: "#EF4444" }}
                          >
                            <Trash2 size={14} />
                            {t("admin.delete")}
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className="text-sm leading-relaxed line-clamp-3 flex-1 mb-4"
                        style={{ color: "#64748B" }}
                      >
                        {post.description || "Aucune description fournie."}
                      </p>

                      {/* Author + Date footer */}
                      <div
                        className="pt-4 border-t flex items-center justify-between gap-3"
                        style={{ borderColor: "#F1F5F9" }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {post.specialist?.user?.imageUrl ? (
                            <img
                              src={post.specialist.user.imageUrl}
                              alt={getAuthorName(post)}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-sm flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg,#0052FF,#00A3FF)",
                              }}
                            >
                              {getAuthorInitial(post)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p
                              className="text-xs font-medium"
                              style={{ color: "#64748B" }}
                            >
                              Publié par
                            </p>
                            <p
                              className="text-sm font-semibold truncate"
                              style={{ color: "#0A0F1E" }}
                            >
                              {getAuthorName(post)}
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5 flex-shrink-0"
                          style={{ color: "#94A3B8" }}
                        >
                          <Calendar size={13} />
                          <span className="text-xs">
                            {formatDate(post.createdAt)}
                          </span>
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

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={Boolean(postToDelete)}
        onClose={() => setPostToDelete(null)}
        title="Supprimer la publication"
        size="sm"
      >
        <div className="space-y-5">
          {/* Warning icon */}
          <div className="flex flex-col items-center text-center pt-2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ background: "#FEF2F2" }}
            >
              <AlertTriangle size={28} style={{ color: "#EF4444" }} />
            </div>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Êtes-vous sûr de vouloir supprimer cette publication ? Cette
              action est irréversible.
            </p>
          </div>

          {/* Post info preview */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#F8FAFF", border: "1px solid #E2E8F0" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-1"
              style={{ color: "#64748B" }}
            >
              Publication à supprimer
            </p>
            <p
              className="text-sm font-semibold line-clamp-2"
              style={{ color: "#0A0F1E" }}
            >
              {postToDelete?.title || "Publication"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPostToDelete(null)}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:opacity-80"
              style={{
                background: "white",
                color: "#0052FF",
                border: "1.5px solid #0052FF",
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={processingPostId === postToDelete?.postId}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 hover:opacity-90"
              style={{ background: "#EF4444", color: "white" }}
            >
              {processingPostId === postToDelete?.postId ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full animate-spin flex-shrink-0"
                    style={{
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor: "rgba(255,255,255,0.35)",
                      borderTopColor: "white",
                    }}
                  />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Supprimer
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
