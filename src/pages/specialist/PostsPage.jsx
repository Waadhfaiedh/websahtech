// Redesigned following SAHTECK brand guidelines
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  FileImage,
  FileText,
  FileVideo,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function PostsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    type: "ARTICLE",
    title: "",
    description: "",
    file: null,
    filePreview: "",
  });

  const typeLabels = { ARTICLE: "Article", IMAGE: "Photo", VIDEO: "Vidéo" };
  const typeStyles = {
    ARTICLE: "bg-[#EFF6FF] text-[#0052FF]",
    IMAGE: "bg-[#ECFDF5] text-[#10B981]",
    VIDEO: "bg-[#FFFBEB] text-[#F59E0B]",
  };

  const typeIconMap = {
    ARTICLE: FileText,
    IMAGE: FileImage,
    VIDEO: FileVideo,
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = user?.accessToken;
      const res = await api.get("/doctors/my_posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const postsData = res.data.posts || res.data || [];
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setPosts([]);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors du chargement des publications",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (form.type === "IMAGE" && !file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }
    if (form.type === "VIDEO" && !file.type.startsWith("video/")) {
      toast.error("Veuillez sélectionner une vidéo valide");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 100MB");
      return;
    }

    setForm((prev) => ({
      ...prev,
      file: file,
      filePreview: URL.createObjectURL(file),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setUploading(true);
    try {
      const token = user?.accessToken;
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("type", form.type);
      if (form.file) formData.append("file", form.file);

      const res = await api.post("/doctors/my_posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setShowModal(false);
      resetForm();
      toast.success(res.data?.message || "Publication créée avec succès");
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm("Supprimer cette publication ?")) return;
    try {
      const token = user?.accessToken;
      const res = await api.delete(`/doctors/my_posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data?.message || "Publication supprimée avec succès");
      fetchPosts();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
  };

  const resetForm = () => {
    setForm({
      type: "ARTICLE",
      title: "",
      description: "",
      file: null,
      filePreview: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderTypeIcon = (type, size = 16, className = "") => {
    const Icon = typeIconMap[type] || FileText;
    return <Icon size={size} className={className} />;
  };

  const renderFilePreview = () => {
    if (!form.filePreview) {
      return (
        <div className="py-8 text-[#94A3B8]">
          <Upload size={32} className="mx-auto mb-2" />
          <p>Cliquez pour sélectionner un fichier</p>
          <p className="text-xs mt-1">Max 100MB</p>
        </div>
      );
    }

    if (form.type === "IMAGE") {
      return (
        <img
          src={form.filePreview}
          alt="Preview"
          className="max-h-48 mx-auto rounded-lg"
        />
      );
    }

    return (
      <video
        src={form.filePreview}
        className="max-h-48 mx-auto rounded-lg"
        controls
      >
        <track kind="captions" srcLang="fr" label="French captions" />
      </video>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] bg-[#F8FAFF] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-6 flex items-center justify-center">
            <Loader2 size={30} className="animate-spin text-[#0052FF]" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((itemKey) => (
              <div
                key={itemKey}
                className="rounded-[12px] bg-white p-4"
                style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
              >
                <div className="mb-4 aspect-video animate-pulse rounded-[8px] bg-[#E2E8F0]" />
                <div className="mb-2 h-5 w-4/5 animate-pulse rounded bg-[#E2E8F0]" />
                <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#E2E8F0]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFF] px-4 py-6 md:px-8 md:py-8 h-full">
      <div className="mx-auto w-full max-w-[1280px]">
        <PageHeader
          title={t("posts.title", { defaultValue: "Mes publications" })}
          subtitle={`${posts.length} publication${posts.length > 1 ? "s" : ""}`}
          action={
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
            >
              <Plus size={20} />
              {t("posts.new_post", { defaultValue: "Nouvelle publication" })}
            </button>
          }
        />

        {posts.length === 0 ? (
          <div
            className="rounded-[12px] bg-white py-20 text-center"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <FileText size={48} className="mx-auto text-[#CBD5E1]" />
            <p className="mt-4 mb-5 text-sm text-[#64748B]">
              Aucune publication pour le moment
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
            >
              <Plus size={20} />
              Créer ma première publication
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.postId || post.id}
                className="overflow-hidden rounded-[12px] bg-white transition-all duration-200 ease-in-out hover:-translate-y-0.5"
                style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
              >
                {/* Media preview - larger */}
                {post.url &&
                  (post.type === "IMAGE" || post.type === "VIDEO") && (
                    <div className="relative aspect-video bg-white">
                      {post.type === "IMAGE" ? (
                        <img
                          src={post.url}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={post.url}
                          className="w-full h-full object-cover"
                          controls
                        >
                          <track
                            kind="captions"
                            srcLang="fr"
                            label="French captions"
                          />
                        </video>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                          {renderTypeIcon(post.type, 14)}
                          {typeLabels[post.type]}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Content */}
                <div className="p-5">
                  {!post.url && (
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${typeStyles[post.type] || "bg-[#EFF6FF] text-[#0052FF]"}`}
                      >
                        {renderTypeIcon(post.type, 14)}
                        {typeLabels[post.type]}
                      </span>
                    </div>
                  )}

                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-[#0A0F1E]">
                    {post.title}
                  </h3>

                  <p className="mb-4 line-clamp-3 text-sm text-[#64748B]">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(post.createdAt)}
                      </span>
                      {!post.isPublished && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#F59E0B]">
                          <Clock3 size={14} />
                          En attente de validation
                        </span>
                      )}
                      {post.isPublished && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#10B981]">
                          <CheckCircle2 size={14} />
                          Publié
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deletePost(post.postId || post.id)}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-[#EF4444] transition-all duration-200 ease-in-out hover:bg-[#FEF2F2]"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal - improved design */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={t("posts.create_post", {
            defaultValue: "Créer une publication",
          })}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex gap-3">
              {["ARTICLE", "IMAGE", "VIDEO"].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      type,
                      file: null,
                      filePreview: "",
                    }))
                  }
                  className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[12px] border py-3 text-sm font-medium transition-all duration-200 ease-in-out ${
                    form.type === type
                      ? "border-[#0052FF] bg-[#0052FF] text-white shadow-sm"
                      : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0052FF] hover:text-[#0052FF]"
                  }`}
                >
                  {renderTypeIcon(type, 16)}
                  {typeLabels[type]}
                </button>
              ))}
            </div>

            <div>
              <label
                htmlFor="post-title"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
              >
                Titre
              </label>
              <input
                id="post-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="h-11 w-full rounded-[8px] bg-[#F1F5F9] px-3 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]/25"
                placeholder="Titre accrocheur"
              />
            </div>

            <div>
              <label
                htmlFor="post-description"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
              >
                Description
              </label>
              <textarea
                id="post-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={4}
                className="w-full resize-none rounded-[8px] bg-[#F1F5F9] px-3 py-2.5 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]/25"
                placeholder="Décrivez votre publication..."
              />
            </div>

            {(form.type === "IMAGE" || form.type === "VIDEO") && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  {form.type === "IMAGE" ? "Image" : "Vidéo"}
                </label>
                <div className="rounded-[12px] border-2 border-dashed border-[#CBD5E1] p-4 text-center transition-all duration-200 ease-in-out hover:border-[#0052FF]">
                  <input
                    type="file"
                    accept={form.type === "IMAGE" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    {renderFilePreview()}
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                onClick={handleSave}
                disabled={uploading}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Publier"
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#BFDBFE] bg-white px-4 py-3 text-sm font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:bg-[#EFF6FF]"
              >
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
