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
  CalendarDays,
  Clock3,
  Search,
  Sparkles,
  Stethoscope,
  Trash2,
  UserCircle2,
  Users,
} from "lucide-react";

export default function AdminPatients() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Load patients ─────────────────────────────────────────
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admins/get-patients");
      setPatients(res.data.data ?? res.data);
      setTotal(res.data.count ?? res.data.length);
    } catch (err) {
      console.error("Failed to load patients:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger les patients",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete patient (using the delete user endpoint) ────────────────────────
  const deletePatient = async (userId) => {
    if (!confirm("Supprimer ce patient ?")) return;
    try {
      const res = await api.delete(`/users/delete/${userId}`);
      setPatients((prev) => prev.filter((p) => p.userId !== userId));
      setTotal((prev) => prev - 1);
      if (selected?.userId === userId) setSelected(null);
      toast.success(res.data?.message || "Patient supprimé avec succès");
    } catch (err) {
      console.error("Failed to delete patient:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
  };

  // ─── Filter ───────────────────────────────────────────────────
  const filtered = patients.filter(
    (p) =>
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient?.appointments?.some((apt) =>
        apt.reason?.toLowerCase().includes(search.toLowerCase()),
      ) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Get latest appointment reason
  const getLatestCondition = (patient) => {
    const appointments = patient.patient?.appointments;
    if (!appointments || appointments.length === 0) return "—";
    const latest = appointments
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return latest.reason || "—";
  };

  // Get assigned specialist name
  const getAssignedSpecialist = (patient) => {
    const appointments = patient.patient?.appointments;
    if (!appointments || appointments.length === 0) return "—";
    const latest = appointments
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return latest.specialist?.user?.fullName || "—";
  };

  const patientCount = total;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
        <section className="rounded-2xl bg-gradient-to-br from-[#0052FF] to-[#00A3FF] p-6 text-white shadow-[0_12px_32px_rgba(0,82,255,0.18)] lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Gestion des patients
              </div>
              <div>
                <PageHeader
                  title={t("admin.patient_management")}
                  subtitle={`${patientCount} patients`}
                />
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  Consultez les profils patients, suivez leurs consultations
                  récentes et gérez les comptes depuis un tableau de bord plus
                  lisible.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">Total</p>
                <p className="mt-1 text-xl font-bold">{patientCount}</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">
                  Consultations
                </p>
                <p className="mt-1 text-xl font-bold">
                  {patients.reduce(
                    (sum, patient) =>
                      sum + (patient.patient?.appointments?.length ?? 0),
                    0,
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">Recherchés</p>
                <p className="mt-1 text-xl font-bold">{filtered.length}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
          <label
            htmlFor="patient-search"
            className="mb-2 block text-xs font-semibold text-[#64748B]"
          >
            Rechercher un patient
          </label>
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
            <input
              id="patient-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-[#F1F5F9] py-3 pl-11 pr-4 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]"
              placeholder="Nom, pathologie ou email"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
            <div className="space-y-3">
              {new Array(5).fill(null).map((_, index) => (
                <div
                  key={`patient-skeleton-${index}`}
                  className="h-16 animate-pulse rounded-xl bg-[#F8FAFF]"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-[#F8FAFF]">
                  <tr>
                    {[
                      "Patient",
                      "Pathologie",
                      "Spécialiste assigné",
                      "Date inscription",
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
                  {filtered.map((p, index) => (
                    <tr
                      key={p.userId}
                      className={`border-t border-[#EEF2FF] transition-colors duration-200 hover:bg-[#EFF6FF] ${index % 2 === 0 ? "bg-white" : "bg-[#F8FAFF]"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.fullName}
                              className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-sm font-semibold text-white shadow-sm">
                              {p.fullName?.charAt(0) ?? "?"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[#0A0F1E]">
                              {p.fullName}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {p.patient?.age ?? "—"} ans
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {getLatestCondition(p)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {getAssignedSpecialist(p)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setSelected(p)}
                            className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#0052FF] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#DBEAFE]"
                          >
                            Voir
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deletePatient(p.userId)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#EF4444] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#FEE2E2]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("admin.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16">
                        <div className="mx-auto max-w-md text-center">
                          <Users className="mx-auto h-12 w-12 text-[#CBD5E1]" />
                          <p className="mt-4 text-sm font-medium text-[#64748B]">
                            Aucun patient trouvé
                          </p>
                          <p className="mt-1 text-xs text-[#94A3B8]">
                            Essayez un nom, un email ou une pathologie
                            différente.
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
          title="Détail patient"
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
                          selected.patient?.appointments?.length
                            ? "Suivi actif"
                            : "Aucun suivi"
                        }
                        color={
                          selected.patient?.appointments?.length
                            ? "active"
                            : "pending"
                        }
                      />
                    </div>
                    <p className="mt-1 text-sm text-[#0052FF]">
                      {selected.patient?.age ?? "—"} ans ·{" "}
                      {selected.gender === "MALE"
                        ? "Homme"
                        : selected.gender === "FEMALE"
                          ? "Femme"
                          : "—"}
                    </p>
                    <p className="mt-2 text-sm text-[#64748B]">
                      Dernière consultation: {getLatestCondition(selected)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: "Email", val: selected.email, icon: UserCircle2 },
                  {
                    label: "Téléphone",
                    val: selected.phone ?? "—",
                    icon: Clock3,
                  },
                  {
                    label: "Adresse",
                    val: selected.address ?? "—",
                    icon: Sparkles,
                  },
                  {
                    label: "Date inscription",
                    val: formatDate(selected.createdAt),
                    icon: CalendarDays,
                  },
                  {
                    label: "Poids",
                    val: selected.patient?.weight
                      ? `${selected.patient.weight} kg`
                      : "—",
                    icon: Users,
                  },
                  {
                    label: "Taille",
                    val: selected.patient?.height
                      ? `${selected.patient.height} cm`
                      : "—",
                    icon: Stethoscope,
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
                      <p className="text-sm font-medium text-[#0A0F1E] break-words">
                        {item.val}
                      </p>
                    </div>
                  );
                })}
              </div>

              {selected.patient?.appointments &&
                selected.patient.appointments.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-[#0A0F1E]">
                      Historique des consultations
                    </p>
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {selected.patient.appointments
                        .slice()
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((apt, idx) => (
                          <div
                            key={`${apt.date || idx}`}
                            className="rounded-xl bg-[#F8FAFF] p-4 transition-colors duration-200 hover:bg-[#EFF6FF]"
                          >
                            <div className="mb-1 flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-[#0A0F1E]">
                                {apt.reason || "Consultation"}
                              </p>
                              <p className="text-xs text-[#64748B]">
                                {formatDate(apt.date)}
                              </p>
                            </div>
                            <p className="text-xs text-[#64748B]">
                              Médecin: {apt.specialist?.user?.fullName || "—"}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  onClick={() => {
                    deletePatient(selected.userId);
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
