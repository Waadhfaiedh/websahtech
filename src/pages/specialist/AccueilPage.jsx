// Redesigned following SAHTECK brand guidelines
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock3,
  Image as ImageIcon,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Video,
} from "lucide-react";

const EMPTY_VTT_TRACK = "data:text/vtt;charset=utf-8,WEBVTT";
const CARD_SHADOW = "0 2px 12px rgba(0,82,255,0.08)";
const PAGE_BG = "#F8FAFF";

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
        return "bg-[#EFF6FF] text-[#0052FF]";
      case "IMAGE":
        return "bg-[#ECFDF5] text-[#10B981]";
      case "VIDEO":
        return "bg-[#FFFBEB] text-[#F59E0B]";
      default:
        return "bg-slate-100 text-slate-500";
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

  const getTypeIcon = (type) => {
    switch (type) {
      case "ARTICLE":
        return Newspaper;
      case "IMAGE":
        return ImageIcon;
      case "VIDEO":
        return Video;
      default:
        return Sparkles;
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-full px-4 py-6 sm:px-6 lg:px-8"
        style={{ background: PAGE_BG }}
      >
        <div className="mx-auto max-w-6xl">
          <PageHeader
            title={t("nav.accueil")}
            subtitle="Chargement du fil d’actualités"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-[12px] bg-white p-5"
                style={{ boxShadow: CARD_SHADOW }}
              >
                <div className="mb-4 h-56 rounded-[12px] bg-slate-100" />
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-6 w-16 rounded-full bg-slate-100" />
                </div>
                <div className="mb-3 h-5 w-4/5 rounded bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-11/12 rounded bg-slate-100" />
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100" />
                    <div>
                      <div className="h-3 w-28 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-3 w-16 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: PAGE_BG }}
    >
      <div className="mx-auto max-w-6xl animate-fadeIn space-y-6">
        <section
          className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 text-white"
          style={{
            background: "linear-gradient(135deg, #0052FF, #00A3FF)",
            boxShadow: CARD_SHADOW,
          }}
        >
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-1/2 h-28 w-28 rounded-full bg-white/10 translate-y-10" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white/95 backdrop-blur-sm">
                <Sparkles size={16} />
                Fil médical sécurisé
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-[32px]">
                  {t("nav.accueil")}
                </h1>
              </div>
            </div>
          </div>
        </section>

        <PageHeader
          title={t("nav.accueil")}
          action={
            <button
              type="button"
              onClick={fetchPosts}
              className="inline-flex items-center gap-2 rounded-full bg-[#0052FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#0047db] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/30"
            >
              <RefreshCw size={16} />
              Actualiser
            </button>
          }
        />

        <div className="grid gap-4 xl:grid-cols-2">
          {posts.map((post) => {
            const TypeIcon = getTypeIcon(post.type);

            return (
              <article
                key={post.postId}
                className="overflow-hidden rounded-[12px] bg-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,82,255,0.10)]"
                style={{ boxShadow: CARD_SHADOW }}
              >
                {post.type === "IMAGE" && post.url && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={post.url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </div>
                )}

                {post.type === "VIDEO" && post.url && (
                  <div className="overflow-hidden bg-slate-100">
                    <video
                      src={post.url}
                      className="aspect-video w-full object-cover"
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

                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getTypeBadgeClass(
                        post.type,
                      )}`}
                    >
                      <TypeIcon size={14} />
                      {getTypeLabel(post.type)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#0052FF]">
                      <Calendar size={14} />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-[18px] font-semibold leading-snug text-[#0A0F1E]">
                      {post.title}
                    </h2>
                    <p className="text-sm leading-6 text-[#64748B]">
                      {post.description || "Aucune description fournie."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {post.specialist?.user?.imageUrl ? (
                        <img
                          src={post.specialist.user.imageUrl}
                          alt={getAuthorName(post)}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-[#EFF6FF]"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-sm font-bold text-white shadow-sm">
                          {getAuthorInitial(post)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0A0F1E]">
                          <User size={16} className="text-[#0052FF]" />
                          <span className="truncate">
                            {getAuthorName(post)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#64748B]">
                          Auteur de la publication
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                      <Clock3 size={16} className="text-[#0052FF]" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {posts.length === 0 && (
            <div
              className="col-span-full flex min-h-[320px] items-center justify-center rounded-[12px] bg-white px-6 py-12 text-center"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div className="max-w-sm space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <Search size={48} className="text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[18px] font-semibold text-[#0A0F1E]">
                    Aucune publication pour le moment
                  </h3>
                  <p className="text-sm leading-6 text-[#64748B]">
                    Le fil est vide. Les nouvelles publications apparaîtront ici
                    dès qu’elles seront disponibles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
