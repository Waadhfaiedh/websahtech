import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
import { toast } from "react-toastify";

const EMPTY_VTT_TRACK = "data:text/vtt;charset=utf-8,WEBVTT";

export default function AccueilPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/posts");
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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getAuthorName = (post) =>
    post.specialist?.user?.fullName || "Utilisateur inconnu";

  const getAuthorInitial = (post) =>
    getAuthorName(post).charAt(0).toUpperCase() || "?";

  if (loading) {
    return (
      <SpecialistLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SpecialistLayout>
    );
  }

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t("nav.accueil")}
          subtitle={`${posts.length} publication${posts.length > 1 ? "s" : ""}`}
        />

        <div className="max-w-2xl space-y-6">
          {posts.map((post) => (
            <div
              key={post.postId}
              className="card hover:shadow-md transition-all duration-200"
            >
              {post.type === "IMAGE" && post.url && (
                <img
                  src={post.url}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              {post.type === "VIDEO" && post.url && (
                <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-gray-100">
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
                </div>
              )}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={getTypeBadgeClass(post.type)}>
                  {getTypeLabel(post.type)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {post.description || "Aucune description fournie."}
              </p>
              <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
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
                  <span className="truncate">
                    Par:{" "}
                    <span className="font-medium text-gray-600">
                      {getAuthorName(post)}
                    </span>
                  </span>
                </div>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>Aucune publication pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </SpecialistLayout>
  );
}
