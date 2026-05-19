import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import { toast } from "react-toastify";
import {
  fetchAllReviews,
  deleteReview,
  REVIEW_CATEGORIES,
  getCategoryLabel,
} from "../../services/reviewService";

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

export default function AdminReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchAllReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger les avis",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Avis supprimé avec succès");
    } catch (err) {
      console.error("Failed to delete review:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
  };

  // ─── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] };
    }
    const sum = reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0);
    const distribution = [1, 2, 3, 4, 5].map(
      (n) => reviews.filter((r) => r.rating === n).length,
    );
    return {
      count: reviews.length,
      average: (sum / reviews.length).toFixed(1),
      distribution,
    };
  }, [reviews]);

  // ─── Filter + Search ───────────────────────────────────────
  const filtered = reviews.filter((r) => {
    if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
    if (ratingFilter !== "ALL" && r.rating !== Number(ratingFilter))
      return false;
    if (search) {
      const q = search.toLowerCase();
      const inText = r.text?.toLowerCase().includes(q);
      const inAuthor = r.author?.fullName?.toLowerCase().includes(q);
      if (!inText && !inAuthor) return false;
    }
    return true;
  });

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAuthorTypeBadge = (author) => {
    if (!author) return null;
    const isSpecialist = author.role === "DOCTOR" || author.specialist;
    return (
      <Badge
        label={isSpecialist ? "Spécialiste" : "Patient"}
        color={isSpecialist ? "active" : "pending"}
      />
    );
  };

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title="Avis sur la plateforme"
          subtitle={`${stats.count} avis · Note moyenne ${stats.average}/5`}
        />

        {/* Stats banner */}
        <div className="card mb-6">
          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Note moyenne
              </p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {stats.average}
                </span>
                <StarRow value={Math.round(stats.average)} size="lg" />
              </div>
            </div>
            <div className="h-12 w-px bg-gray-100" />
            <div className="flex-1 min-w-[240px]">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Répartition
              </p>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = stats.distribution[n - 1];
                  const pct =
                    stats.count > 0 ? (count / stats.count) * 100 : 0;
                  return (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3">{n}</span>
                      <svg
                        className="w-3 h-3 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                      </svg>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
              placeholder="Rechercher dans les avis..."
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field max-w-[220px]"
          >
            <option value="ALL">Toutes les catégories</option>
            {REVIEW_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="input-field max-w-[160px]"
          >
            <option value="ALL">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="2">2 étoiles</option>
            <option value="1">1 étoile</option>
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400 text-sm">Aucun avis trouvé</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelected(r)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {r.author?.imageUrl ? (
                      <img
                        src={r.author.imageUrl}
                        alt={r.author.fullName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-sm font-bold">
                          {r.author?.fullName?.charAt(0) ?? "?"}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {r.author?.fullName ?? "Utilisateur"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getAuthorTypeBadge(r.author)}
                        <span className="text-xs text-gray-400">
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StarRow value={r.rating} />
                </div>

                <div className="mb-3">
                  <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">
                    {getCategoryLabel(r.category)}
                  </span>
                </div>

                <p className="text-sm text-gray-700 line-clamp-3">{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Détail de l'avis"
          size="lg"
        >
          {selected && (
            <div className="space-y-5">
              {/* Author */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                {selected.author?.imageUrl ? (
                  <img
                    src={selected.author.imageUrl}
                    alt={selected.author.fullName}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-xl font-bold text-primary">
                    {selected.author?.fullName?.charAt(0) ?? "?"}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selected.author?.fullName ?? "Utilisateur"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getAuthorTypeBadge(selected.author)}
                    <span className="text-xs text-gray-400">
                      {formatDate(selected.createdAt)}
                    </span>
                  </div>
                </div>
                <StarRow value={selected.rating} size="lg" />
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Catégorie</p>
                  <p className="text-sm font-medium text-gray-800">
                    {getCategoryLabel(selected.category)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Note</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selected.rating}/5
                  </p>
                </div>
              </div>

              {/* Text */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Commentaire
                </p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selected.text}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="btn-danger flex-1 justify-center"
                >
                  {t("admin.delete")}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="btn-secondary flex-1 justify-center"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}