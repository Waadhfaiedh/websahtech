import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import api from "../../services/api";

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
  const typeIcons = {
    ARTICLE: "📄",
    IMAGE: "🖼️",
    VIDEO: "🎥",
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
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (form.type === "IMAGE" && !file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }
    if (form.type === "VIDEO" && !file.type.startsWith("video/")) {
      alert("Veuillez sélectionner une vidéo valide");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 100MB");
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
      alert("Veuillez remplir tous les champs");
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

      await api.post("/doctors/my_posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setShowModal(false);
      resetForm();
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm("Supprimer cette publication ?")) return;
    try {
      const token = user?.accessToken;
      await api.delete(`/doctors/my_posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (err) {
      alert("Erreur lors de la suppression");
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

  if (loading) {
    return (
      <SpecialistLayout>
        <div className="p-8 flex justify-center items-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SpecialistLayout>
    );
  }

  return (
    <SpecialistLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <PageHeader
          title="Mes publications"
          subtitle={`${posts.length} publication${posts.length > 1 ? "s" : ""}`}
          action={
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nouvelle publication
            </button>
          }
        />

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">
              Aucune publication pour le moment
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Créer ma première publication
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div
                key={post.postId || post.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Media preview - larger */}
                {post.url &&
                  (post.type === "IMAGE" || post.type === "VIDEO") && (
                    <div className="relative bg-gray-100 aspect-video">
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
                        />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <span>{typeIcons[post.type]}</span>{" "}
                          {typeLabels[post.type]}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Content */}
                <div className="p-5">
                  {!post.url && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{typeIcons[post.type]}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {typeLabels[post.type]}
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span>{formatDate(post.createdAt)}</span>
                      {!post.isPublished && (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                          ⏳ En attente de validation
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deletePost(post.postId || post.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
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
          title="Créer une publication"
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
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                    form.type === type
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  <span className="mr-2">{typeIcons[type]}</span>
                  {typeLabels[type]}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Titre
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="input-field"
                placeholder="Titre accrocheur"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={4}
                className="input-field resize-none"
                placeholder="Décrivez votre publication..."
              />
            </div>

            {(form.type === "IMAGE" || form.type === "VIDEO") && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {form.type === "IMAGE" ? "Image" : "Vidéo"}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept={form.type === "IMAGE" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    {form.filePreview ? (
                      form.type === "IMAGE" ? (
                        <img
                          src={form.filePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                      ) : (
                        <video
                          src={form.filePreview}
                          className="max-h-48 mx-auto rounded-lg"
                          controls
                        />
                      )
                    ) : (
                      <div className="py-8 text-gray-400">
                        <div className="text-3xl mb-2">📁</div>
                        <p>Cliquez pour sélectionner un fichier</p>
                        <p className="text-xs mt-1">Max 100MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                onClick={handleSave}
                disabled={uploading}
                className="btn-primary flex-1 justify-center py-3"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  "Publier"
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1 justify-center py-3"
              >
                Annuler
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
