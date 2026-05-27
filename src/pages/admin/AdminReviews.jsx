// Redesigned following SAHTECK brand guidelines
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Search,
  Star,
  Trash2,
  AlertCircle,
  Calendar,
  MessageSquare,
  TrendingUp,
  Users,
  ChevronRight,
} from "lucide-react";
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
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size === "lg" ? 20 : 16}
          className={`transition-colors duration-200 ${
            n <= value ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E2E8F0]"
          }`}
        />
      ))}
    </div>
  );
};

StarRow.propTypes = {
  value: PropTypes.number,
  size: PropTypes.oneOf(["sm", "lg"]),
};

export default function AdminReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  const handleDelete = async () => {
    const id = deleteConfirm;
    setDeleteConfirm(null);

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
      average: sum / reviews.length,
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

  let reviewsContent;
  if (loading) {
    reviewsContent = (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#EFF6FF] border-t-[#0052FF] rounded-full animate-spin" />
          <p className="text-[#64748B] text-sm">Chargement des avis...</p>
        </div>
      </div>
    );
  } else if (filtered.length === 0) {
    reviewsContent = (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
            <AlertCircle size={32} className="text-[#0052FF]" />
          </div>
          <p className="text-[#64748B] text-sm">
            Aucun avis ne correspond à vos critères
          </p>
        </div>
      </div>
    );
  } else {
    reviewsContent = (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
          const ratingPercentage = (r.rating / 5) * 100;
          return (
            <button
              key={r.id}
              type="button"
              className="bg-white text-left rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 border border-[#E2E8F0] overflow-hidden group cursor-pointer w-full flex flex-col"
              onClick={() => setSelected(r)}
            >
              {/* Top Accent Bar */}
              <div
                className="h-1.5 bg-gradient-to-r transition-all duration-300"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${
                    r.rating >= 4
                      ? "#10B981"
                      : r.rating >= 3
                        ? "#F59E0B"
                        : "#EF4444"
                  }, ${r.rating >= 4 ? "#6EE7B7" : r.rating >= 3 ? "#FBBF24" : "#FCA5A5"})`,
                }}
              />

              <div className="p-5 flex-1 flex flex-col">
                {/* Header with Author */}
                <div className="flex items-start gap-3 mb-4">
                  {r.author?.imageUrl ? (
                    <img
                      src={r.author.imageUrl}
                      alt={r.author.fullName}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 bg-gradient-to-br from-[#0052FF] to-[#00A3FF] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {r.author?.fullName?.charAt(0) ?? "?"}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#0A0F1E] truncate">
                      {r.author?.fullName ?? "Utilisateur"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getAuthorTypeBadge(r.author)}
                    </div>
                  </div>
                </div>

                {/* Rating Display */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          className={`-ml-1 transition-colors duration-200 ${
                            n <= r.rating
                              ? "fill-[#F59E0B] text-[#F59E0B]"
                              : "text-[#E2E8F0]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#0052FF]">
                      {r.rating}.0
                    </span>
                  </div>
                  <span className="text-xs text-[#64748B] flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(r.createdAt)}
                  </span>
                </div>

                {/* Category & Quality Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#0052FF]">
                    {getCategoryLabel(r.category)}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          r.rating >= 4
                            ? "bg-[#10B981]"
                            : r.rating >= 3
                              ? "bg-[#F59E0B]"
                              : "bg-[#EF4444]"
                        }`}
                        style={{ width: `${ratingPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-sm text-[#0A0F1E] line-clamp-2 leading-relaxed mb-4 flex-1">
                  {r.text}
                </p>

                {/* Footer with Action */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                  <p className="text-xs text-[#64748B] font-medium">
                    {r.text?.split(" ").length || 0} mots
                  </p>
                  <span className="text-xs text-[#0052FF] font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                    Lire
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn bg-[#F8FAFF] min-h-screen">
        <PageHeader
          title="Avis sur la plateforme"
          subtitle={`${stats.count} avis · Note moyenne ${stats.average.toFixed(1)}/5`}
        />

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating Card */}
          <div className="bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFF] rounded-xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Star size={24} className="text-[#F59E0B]" />
              </div>
              <TrendingUp size={16} className="text-[#10B981]" />
            </div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Note moyenne
            </p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-[#0052FF]">
                {stats.average.toFixed(1)}
              </span>
              <span className="text-sm text-[#64748B] mb-1">/ 5</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={12}
                  className={`${
                    n <= Math.round(stats.average)
                      ? "fill-[#F59E0B] text-[#F59E0B]"
                      : "text-[#E2E8F0]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Total Reviews Card */}
          <div className="bg-gradient-to-br from-[#F0FDF4] to-[#F8FAFF] rounded-xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <MessageSquare size={24} className="text-[#10B981]" />
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#10B981]">
                +5%
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Total des avis
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-[#10B981]">
                {stats.count}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-3">
              Avis publiés sur la plateforme
            </p>
          </div>

          {/* Quality Score Card */}
          <div className="bg-gradient-to-br from-[#FEF3C7] to-[#F8FAFF] rounded-xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Users size={24} className="text-[#F59E0B]" />
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#F59E0B]">
                Bonne
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Qualité globale
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-[#F59E0B]">
                {stats.count > 0
                  ? Math.round(
                      (stats.distribution.slice(2).reduce((a, b) => a + b, 0) /
                        stats.count) *
                        100,
                    )
                  : 0}
              </span>
              <span className="text-sm text-[#64748B] mb-1">%</span>
            </div>
            <p className="text-xs text-[#64748B] mt-3">Avis 3+ étoiles</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 min-w-[200px] relative">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                Rechercher
              </label>
              <Search
                size={18}
                className="absolute left-3 top-1/2 translate-y-[2px] text-[#64748B]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#F8FAFF] border border-[#E2E8F0] text-[#0A0F1E] placeholder-[#CBD5E1] focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all duration-200 text-sm"
                placeholder="Rechercher par auteur ou texte..."
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex-1 md:flex-none">
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                  Catégorie
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#F8FAFF] border border-[#E2E8F0] text-[#0A0F1E] focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all duration-200 text-sm font-medium"
                >
                  <option value="ALL">Tous</option>
                  {REVIEW_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 md:flex-none">
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                  Note
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#F8FAFF] border border-[#E2E8F0] text-[#0A0F1E] focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all duration-200 text-sm font-medium"
                >
                  <option value="ALL">Toutes</option>
                  <option value="5">5 ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="3">3+ ⭐</option>
                  <option value="2">2+ ⭐</option>
                  <option value="1">1+ ⭐</option>
                </select>
              </div>

              {(search ||
                categoryFilter !== "ALL" ||
                ratingFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("ALL");
                    setRatingFilter("ALL");
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#FEF2F2] text-[#EF4444] font-medium text-sm hover:bg-[#FEE4E4] transition-all duration-200 self-end"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviewsContent}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirmer la suppression"
          size="sm"
        >
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-[#EF4444]" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#0A0F1E] mb-2">
                Supprimer cet avis ?
              </h3>
              <p className="text-sm text-[#64748B]">
                Cette action est irréversible. L'avis sera définitivement
                supprimé de la plateforme.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 rounded-lg bg-white border border-[#E2E8F0] text-[#0052FF] font-medium text-sm hover:bg-[#F8FAFF] transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-lg bg-[#EF4444] text-white font-medium text-sm hover:bg-[#DC2626] transition-all duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Détail de l'avis"
          size="lg"
        >
          {selected && (
            <div className="space-y-6">
              {/* Author Card */}
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFF] rounded-xl p-5 border border-[#E2E8F0]">
                <div className="flex items-start gap-4">
                  {selected.author?.imageUrl ? (
                    <img
                      src={selected.author.imageUrl}
                      alt={selected.author.fullName}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0052FF] to-[#00A3FF] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl font-bold">
                        {selected.author?.fullName?.charAt(0) ?? "?"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#0A0F1E]">
                      {selected.author?.fullName ?? "Utilisateur"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getAuthorTypeBadge(selected.author)}
                      <span className="text-xs text-[#64748B]">
                        {formatDate(selected.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Display */}
              <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-4">
                  Évaluation
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={24}
                        className={`-ml-2 transition-colors duration-200 ${
                          n <= selected.rating
                            ? "fill-[#F59E0B] text-[#F59E0B]"
                            : "text-[#E2E8F0]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-3xl font-bold text-[#0052FF]">
                    {selected.rating}
                    <span className="text-lg text-[#64748B] font-normal">
                      /5
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">
                    Catégorie
                  </p>
                  <p className="text-sm font-medium text-[#0A0F1E]">
                    {getCategoryLabel(selected.category)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                  <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">
                    Date
                  </p>
                  <p className="text-sm font-medium text-[#0A0F1E]">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
              </div>

              {/* Review Text */}
              <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-3">
                  Commentaire
                </p>
                <p className="text-sm text-[#0A0F1E] whitespace-pre-wrap leading-relaxed font-medium">
                  {selected.text}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => {
                    setDeleteConfirm(selected.id);
                    setSelected(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#FEF2F2] text-[#EF4444] font-medium text-sm hover:bg-[#FEE4E4] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  {t("admin.delete")}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#EFF6FF] text-[#0052FF] font-medium text-sm hover:bg-[#E0EFFF] transition-all duration-200"
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
