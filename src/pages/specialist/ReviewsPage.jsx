// Redesigned following SAHTECK brand guidelines
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Calendar,
  Loader2,
  MessageSquare,
  Star,
  Trash2,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import { toast } from "react-toastify";
import {
  fetchMyReviews,
  createReview,
  deleteMyReview,
  REVIEW_CATEGORIES,
  getCategoryLabel,
} from "../../services/reviewService";

const StarRating = ({ value, onChange, interactive = false }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => interactive && onChange?.(n)}
          disabled={!interactive}
          aria-label={`Noter ${n} sur 5`}
          className={`transition-all duration-200 ease-in-out ${
            interactive
              ? "hover:-translate-y-0.5 hover:scale-110"
              : "cursor-default"
          }`}
        >
          <Star
            size={20}
            className={
              n <= value ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E2E8F0]"
            }
          />
        </button>
      ))}
    </div>
  );
};

StarRating.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  interactive: PropTypes.bool,
};

const StarRow = ({ value = 0, size = "sm" }) => {
  const iconSize = size === "lg" ? 20 : 16;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={iconSize}
          className={
            n <= value ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E2E8F0]"
          }
        />
      ))}
    </div>
  );
};

StarRow.propTypes = {
  value: PropTypes.number,
  size: PropTypes.oneOf(["sm", "lg"]),
};

export default function SpecialistReviewsPage() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    category: "GENERAL",
    text: "",
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchMyReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger vos avis",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      toast.error("Veuillez entrer un commentaire");
      return;
    }

    try {
      setSubmitting(true);
      const newReview = await createReview(formData);
      setReviews((prev) => [newReview, ...prev]);
      setFormData({
        rating: 5,
        category: "GENERAL",
        text: "",
      });
      toast.success("Avis soumis avec succès");
    } catch (err) {
      console.error("Failed to create review:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la soumission de l'avis",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    const id = deleteConfirm;
    setDeleteConfirm(null);

    try {
      await deleteMyReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      if (selectedReview?.id === id) setSelectedReview(null);
      toast.success("Avis supprimé avec succès");
    } catch (err) {
      console.error("Failed to delete review:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isEmpty = !loading && reviews.length === 0;
  const hasReviews = !loading && reviews.length > 0;

  return (
    <div className="animate-fadeIn bg-[#F8FAFF] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <PageHeader
          title={t("reviews.title", {
            defaultValue: "Mes avis sur la plateforme",
          })}
          subtitle={t("reviews.subtitle", {
            defaultValue: `Vous avez soumis ${reviews.length} avis`,
          })}
        />

        <div
          className="mb-8 rounded-[12px] bg-white p-5 md:p-6"
          style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-white shadow-sm">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0A0F1E]">
                Soumettre un nouvel avis
              </h2>
              <p className="text-sm text-[#64748B]">
                Partagez votre retour sur la plateforme
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Note
              </div>
              <StarRating
                value={formData.rating}
                onChange={(rating) => setFormData({ ...formData, rating })}
                interactive
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
              >
                Catégorie
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="h-11 w-full rounded-[8px] bg-[#F1F5F9] px-3 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out focus:ring-2 focus:ring-[#0052FF]/25"
              >
                {REVIEW_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="text"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]"
              >
                Commentaire
              </label>
              <textarea
                id="text"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                placeholder="Partagez votre avis sur la plateforme..."
                rows={4}
                className="w-full resize-none rounded-[8px] bg-[#F1F5F9] px-3 py-2.5 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]/25"
              />
              <p className="mt-1 text-xs text-[#64748B]">
                {formData.text.length}/500 caractères
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !formData.text.trim()}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  "Soumettre l'avis"
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    rating: 5,
                    category: "GENERAL",
                    text: "",
                  })
                }
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#BFDBFE] bg-white px-4 py-3 text-sm font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:bg-[#EFF6FF]"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="mb-6 text-lg font-semibold text-[#0A0F1E]">
            Vos avis ({reviews.length})
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#0052FF]" />
            </div>
          )}

          {isEmpty && (
            <div
              className="rounded-[12px] bg-white px-6 py-16 text-center"
              style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
            >
              <AlertCircle size={48} className="mx-auto text-[#CBD5E1]" />
              <p className="mt-4 text-sm font-medium text-[#64748B]">
                Aucun avis soumis pour le moment
              </p>
            </div>
          )}

          {hasReviews && (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="w-full rounded-[12px] bg-white p-5 text-left transition-all duration-200 ease-in-out hover:-translate-y-0.5"
                  style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
                  onClick={() => setSelectedReview(r)}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0A0F1E]">
                        Avis du {formatDate(r.createdAt)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          label={getCategoryLabel(r.category)}
                          color="gray"
                        />
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-medium text-[#10B981]">
                          <Calendar size={14} />
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                    </div>
                    <StarRow value={r.rating} />
                  </div>

                  <p className="line-clamp-3 text-sm text-[#64748B]">
                    {r.text}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirmer la suppression"
          size="sm"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2] text-[#EF4444]">
                <Trash2 size={22} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-[#0A0F1E]">
                Supprimer cet avis ?
              </h3>
              <p className="text-sm text-[#64748B]">
                Cette action est irréversible. L'avis sera définitivement
                supprimé.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#BFDBFE] bg-white px-4 py-3 text-sm font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:bg-[#EFF6FF]"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteReview}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#EF4444] transition-all duration-200 ease-in-out hover:bg-[#FEE2E2]"
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title="Détail de l'avis"
          size="lg"
        >
          {selectedReview && (
            <div className="space-y-5">
              <div className="rounded-[12px] bg-[#F8FAFF] p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Date
                    </p>
                    <p className="text-sm font-medium text-[#0A0F1E]">
                      {formatDate(selectedReview.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Note
                    </p>
                    <StarRow value={selectedReview.rating} size="lg" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-[12px] bg-[#F8FAFF] p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Catégorie
                  </p>
                  <p className="text-sm font-medium text-[#0A0F1E]">
                    {getCategoryLabel(selectedReview.category)}
                  </p>
                </div>
                <div className="rounded-[12px] bg-[#F8FAFF] p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Note
                  </p>
                  <p className="text-sm font-medium text-[#0A0F1E]">
                    {selectedReview.rating}/5
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  Votre commentaire
                </p>
                <div className="rounded-[12px] bg-[#F8FAFF] p-4">
                  <p className="whitespace-pre-wrap text-sm text-[#64748B]">
                    {selectedReview.text}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setDeleteConfirm(selectedReview.id)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#EF4444] transition-all duration-200 ease-in-out hover:bg-[#FEE2E2]"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[#BFDBFE] bg-white px-4 py-3 text-sm font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:bg-[#EFF6FF]"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
