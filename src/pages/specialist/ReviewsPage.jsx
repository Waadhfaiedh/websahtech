import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import { toast } from "react-toastify";
import {
  fetchMyReviews,
  createReview,
  deleteReview,
  REVIEW_CATEGORIES,
  getCategoryLabel,
} from "../../services/reviewService";

const StarRating = ({ value, onChange, interactive = false }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={interactive ? "button" : "div"}
          onClick={() => interactive && onChange(n)}
          disabled={!interactive}
          className={
            interactive
              ? "cursor-pointer hover:scale-110 transition-transform"
              : ""
          }
        >
          <svg
            className={`w-6 h-6 ${
              n <= value ? "text-yellow-400" : "text-gray-200"
            } ${interactive ? "transition-colors" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
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
  const px = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`${px} ${n <= value ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
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

  // Form state
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
      setReviews([newReview, ...reviews]);
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
      await deleteReview(id);
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

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title="Mes avis sur la plateforme"
          subtitle={`Vous avez soumis ${reviews.length} avis`}
        />

        {/* Create Review Form */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Soumettre un nouvel avis
          </h2>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Note
              </label>
              <StarRating
                value={formData.rating}
                onChange={(rating) => setFormData({ ...formData, rating })}
                interactive
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Catégorie
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input-field w-full"
              >
                {REVIEW_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className="input-field w-full resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.text.length}/500 caractères
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !formData.text.trim()}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {submitting ? "Envoi en cours..." : "Soumettre l'avis"}
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
                className="btn-secondary flex-1 justify-center"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        {/* Reviews List */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Vos avis ({reviews.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="card text-center py-16">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <p className="text-gray-500 font-medium">
                Aucun avis soumis pour le moment
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="card hover:shadow-md transition-shadow cursor-pointer text-left w-full"
                  onClick={() => setSelectedReview(r)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        Avis du {formatDate(r.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {getCategoryLabel(r.category)}
                      </p>
                    </div>
                    <StarRow value={r.rating} />
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3">{r.text}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirmer la suppression"
          size="sm"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Supprimer cet avis ?
              </h3>
              <p className="text-sm text-gray-600">
                Cette action est irréversible. L'avis sera définitivement
                supprimé.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteReview}
                className="btn-danger flex-1 justify-center"
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>

        {/* Review Detail Modal */}
        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title="Détail de l'avis"
          size="lg"
        >
          {selectedReview && (
            <div className="space-y-5">
              {/* Meta */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Date
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedReview.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Note
                  </p>
                  <div className="flex items-center">
                    <StarRow value={selectedReview.rating} size="lg" />
                  </div>
                </div>
              </div>

              {/* Category & Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Catégorie</p>
                  <p className="text-sm font-medium text-gray-800">
                    {getCategoryLabel(selectedReview.category)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Note</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedReview.rating}/5
                  </p>
                </div>
              </div>

              {/* Comment */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Votre commentaire
                </p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedReview.text}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setDeleteConfirm(selectedReview.id)}
                  className="btn-danger flex-1 justify-center"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
