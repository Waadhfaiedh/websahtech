// Redesigned following SAHTECK brand guidelines
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";

export default function AdminSpecialists() {
  const { t } = useTranslation();
  const [specialists, setSpecialists] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load specialists ─────────────────────────────────────────
  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admins/get-specialists");
      setSpecialists(res.data.data ?? res.data);
      setTotal(res.data.count ?? res.data.length);
    } catch (err) {
      console.error("Failed to load specialists:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger les spécialistes",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Validate doctor ─────────────────────────────────────────
  const validate = async (userId) => {
    try {
      const res = await api.patch(`/users/validate-doctor/${userId}`);
      setSpecialists((prev) =>
        prev.map((s) =>
          s.userId === userId
            ? { ...s, specialist: { ...s.specialist, isValidated: true } }
            : s,
        ),
      );
      if (selected?.userId === userId) {
        setSelected((prev) => ({
          ...prev,
          specialist: { ...prev.specialist, isValidated: true },
        }));
      }
      toast.success(res.data?.message || "Spécialiste validé avec succès");
    } catch (err) {
      console.error("Failed to validate doctor:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la validation",
      );
    }
  };

  // ─── Delete specialist ────────────────────────────────────────
  const deleteSpecialist = async (userId) => {
    if (!confirm("Supprimer ce spécialiste ?")) return;
    try {
      const res = await api.delete(`/users/delete/${userId}`);
      setSpecialists((prev) => prev.filter((s) => s.userId !== userId));
      setTotal((prev) => prev - 1);
      if (selected?.userId === userId) setSelected(null);
      toast.success(res.data?.message || "Spécialiste supprimé avec succès");
    } catch (err) {
      console.error("Failed to delete specialist:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
  };

  // ─── Filter ───────────────────────────────────────────────────
  const filtered = specialists.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.specialist?.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const validatedCount = specialists.filter(
    (s) => s.specialist?.isValidated,
  ).length;
  const pendingCount = total - validatedCount;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
        <section className="rounded-2xl bg-gradient-to-br from-[#0052FF] to-[#00A3FF] p-6 text-white shadow-[0_12px_32px_rgba(0,82,255,0.18)] lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Validation des spécialistes
              </div>
              <div>
                <PageHeader
                  title={t("admin.specialist_management")}
                  subtitle={`${total} spécialistes`}
                />
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  Consultez les profils, approuvez les comptes et accédez aux
                  informations de cabinet depuis un tableau de gestion plus
                  clair.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">Total</p>
                <p className="mt-1 text-xl font-bold">{total}</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">Validés</p>
                <p className="mt-1 text-xl font-bold">{validatedCount}</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">En attente</p>
                <p className="mt-1 text-xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
          <p className="mb-2 text-xs font-semibold text-[#64748B]">
            Rechercher un spécialiste
          </p>
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-[#F1F5F9] py-3 pl-11 pr-4 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]"
              placeholder="Nom, spécialité ou email"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
            <div className="space-y-3">
              {new Array(5).fill(null).map((_, index) => (
                <div
                  key={`specialist-skeleton-${index}`}
                  className="h-16 animate-pulse rounded-xl bg-[#F8FAFF]"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead className="bg-[#F8FAFF]">
                  <tr>
                    {[
                      "Nom",
                      "Spécialité",
                      "Email",
                      "Cabinet",
                      "Statut",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sp, index) => {
                    const validated = Boolean(sp.specialist?.isValidated);

                    return (
                      <tr
                        key={sp.userId}
                        className={`border-t border-[#EEF2FF] transition-colors duration-200 hover:bg-[#EFF6FF] ${index % 2 === 0 ? "bg-white" : "bg-[#F8FAFF]"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {sp.imageUrl ? (
                              <img
                                src={sp.imageUrl}
                                alt={sp.fullName}
                                className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-sm font-semibold text-white shadow-sm">
                                {sp.fullName?.charAt(0) ?? "?"}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-[#0A0F1E]">
                                {sp.fullName}
                              </p>
                              <p className="text-xs text-[#64748B]">
                                {sp.specialist?.location ??
                                  "Profil spécialiste"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">
                          {sp.specialist?.speciality ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">
                          {sp.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">
                          {sp.specialist?.primaryClinic?.name ?? "—"}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            label={validated ? "Validé" : "En attente"}
                            color={validated ? "active" : "pending"}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => setSelected(sp)}
                              className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#DBEAFE]"
                            >
                              Voir
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                            {!validated && (
                              <button
                                onClick={() => validate(sp.userId)}
                                className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] px-3 py-2 text-xs font-semibold text-[#10B981] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#D1FAE5]"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Valider
                              </button>
                            )}
                            <button
                              onClick={() => deleteSpecialist(sp.userId)}
                              className="inline-flex items-center gap-2 rounded-full bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#EF4444] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#FEE2E2]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16">
                        <div className="mx-auto max-w-md text-center">
                          <Users className="mx-auto h-12 w-12 text-[#CBD5E1]" />
                          <p className="mt-4 text-sm font-medium text-[#64748B]">
                            Aucun spécialiste trouvé
                          </p>
                          <p className="mt-1 text-xs text-[#94A3B8]">
                            Essayez un autre nom, une spécialité ou un email.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Profil spécialiste"
          size="lg"
        >
          {selected && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#F8FAFF] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {selected.imageUrl ? (
                    <img
                      src={selected.imageUrl}
                      alt={selected.fullName}
                      className="h-20 w-20 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-2xl font-bold text-white shadow-sm">
                      {selected.fullName?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-[#0A0F1E]">
                        {selected.fullName}
                      </h3>
                      <Badge
                        label={
                          selected.specialist?.isValidated
                            ? "Validé"
                            : "En attente"
                        }
                        color={
                          selected.specialist?.isValidated
                            ? "active"
                            : "pending"
                        }
                      />
                    </div>
                    <p className="mt-1 text-sm text-[#0052FF]">
                      {selected.specialist?.speciality ?? "—"}
                    </p>
                    <p className="mt-2 text-sm text-[#64748B]">
                      {selected.specialist?.primaryClinic?.name ??
                        "Cabinet non renseigné"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: "Email", val: selected.email, icon: UserRound },
                  {
                    label: "Téléphone",
                    val: selected.phone ?? "—",
                    icon: ShieldCheck,
                  },
                  {
                    label: "Cabinet",
                    val: selected.specialist?.primaryClinic?.name ?? "—",
                    icon: Stethoscope,
                  },
                  {
                    label: "Localisation",
                    val: selected.specialist?.location ?? "—",
                    icon: Sparkles,
                  },
                  {
                    label: "Note",
                    val: selected.specialist?.rating
                      ? `${selected.specialist.rating}/5`
                      : "—",
                    icon: UserCheck,
                  },
                  {
                    label: "Avis",
                    val: selected.specialist?.reviewsCount ?? 0,
                    icon: Users,
                  },
                  {
                    label: "Numéro de licence",
                    val: selected.specialist?.licenseNumber ?? "—",
                    icon: ShieldCheck,
                  },
                  {
                    label: "Genre",
                    val: selected.gender ?? "—",
                    icon: UserRound,
                  },
                  {
                    label: "Adresse",
                    val: selected.address ?? "—",
                    icon: Sparkles,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-xl bg-white p-4 shadow-[0_2px_12px_rgba(0,82,255,0.08)] transition-colors duration-200 hover:bg-[#F8FAFF]"
                    >
                      <div className="mb-2 flex items-center gap-2 text-[#64748B]">
                        <Icon className="h-4 w-4" />
                        <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[#0A0F1E]">
                        {item.val}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                {!selected.specialist?.isValidated && (
                  <button
                    onClick={() => validate(selected.userId)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,82,255,0.18)] transition-all duration-200 ease-in-out hover:-translate-y-0.5"
                  >
                    <UserCheck className="h-4 w-4" />
                    {t("admin.approve")}
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteSpecialist(selected.userId);
                    setSelected(null);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FEF2F2] px-5 py-3 text-sm font-semibold text-[#EF4444] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#FEE2E2]"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("admin.delete")}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-5 py-3 text-sm font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#EFF6FF]"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
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
