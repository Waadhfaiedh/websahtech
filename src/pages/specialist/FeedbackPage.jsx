import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import PageHeader from "../../components/common/PageHeader";
import { toast } from "react-toastify";
import {
  fetchMyReviews,
  createReview,
  REVIEW_CATEGORIES,
  getCategoryLabel,
} from "../../services/reviewService";

const StarRating = ({ value, onChange, readonly = false, size = "md" }) => {
  const [hover, setHover] = useState(0);
  const px = size === "lg" ? "w-8 h-8" : "w-6 h-6";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={readonly}
            onMouseEnter={() => !readonly && setHover(n)}
            onMouseLeave={() => !readonly && setHover(0)}
            onClick={() => !readonly && onChange?.(n)}
            className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
          >
            <svg
              className={`${px} ${filled ? "text-yellow-400" : "text-gray-200"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

const ratingHelper = (r) => {
  if (!r) return "Sélectionnez une note";
  return ["Très mauvais", "Mauvais", "Moyen", "Bon", "Excellent"][r - 1];
};

export default function FeedbackPage() {
  const { t } = useTranslation();
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("GENERAL");
  const [text, setText] = useState("");

  useEffect(() => {
    loadMyReviews();
  }, []);

  const loadMyReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchMyReviews();
      setMyReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load my reviews:", err);
      // Don't toast if endpoint just doesn't exist yet — silent
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setCategory("GENERAL");
    setText("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Veuillez sélectionner une note");
      return;
    }
    if (!text.trim()) {
      toast.error("Veuillez écrire votre avis");
      return;
    }
    if (text.trim().length < 10) {
      toast.error("L'avis doit contenir au moins 10 caractères");
      return;
    }
    try {
      setSubmitting(true);
      const created = await createReview({
        rating,
        category,
        text: text.trim(),
      });
      setMyReviews((prev) => [created, ...prev]);
      resetForm();
      toast.success("Merci pour votre retour !");
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de l'envoi de l'avis",
      );
    } finally {
      setSubmitting(false);
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
          title="Avis & Réclamations"
          subtitle="Partagez votre expérience pour nous aider à améliorer la plateforme"
        />

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="card lg:col-span-3">
            <h2 className="font-bold text-gray-900 mb-1">
              Laisser un avis ou signaler un problème
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Votre retour est transmis directement à l'équipe administrative.
            </p>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Note globale <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <StarRating value={rating} onChange={setRating} size="lg" />
                <span className="text-sm text-gray-500">
                  {ratingHelper(rating)}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field w-full"
              >
                {REVIEW_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Text */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Votre message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                maxLength={1000}
                className="input-field w-full resize-none"
                placeholder="Décrivez votre expérience, suggestion ou problème rencontré..."
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">
                  Minimum 10 caractères
                </p>
                <p className="text-xs text-gray-400">{text.length}/1000</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {submitting ? "Envoi..." : "Envoyer mon avis"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="btn-secondary"
              >
                Effacer
              </button>
            </div>
          </form>

          {/* History */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-gray-900">Mes avis précédents</h2>

            {loading ? (
              <div className="card flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : myReviews.length === 0 ? (
              <div className="card text-center py-12">
                <svg
                  className="w-10 h-10 text-gray-200 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-400 text-sm">
                  Vous n'avez encore laissé aucun avis
                </p>
              </div>
            ) : (
              myReviews.map((r) => (
                <div key={r.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating value={r.rating} readonly />
                    <span className="text-xs text-gray-400">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2.5 py-1 mb-2">
                    {getCategoryLabel(r.category)}
                  </span>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {r.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SpecialistLayout>
  );
}