// Redesigned following SAHTECK brand guidelines
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import StatCard from "../../components/common/StatCard";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Activity,
  ArrowRight,
  Clock3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admins/get-forms")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        toast.error(
          err.response?.data?.message ||
            "Impossible de charger le tableau de bord admin",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const activeSpecialists =
    data?.specialist?.data?.filter((s) => s.specialist?.isValidated).length ??
    0;
  const pendingSpecialists =
    data?.specialist?.data?.filter((s) => !s.specialist?.isValidated).length ??
    0;
  const totalSpecialists = data?.specialist?.count ?? 0;
  const totalPatients = data?.patient?.count ?? 0;
  const totalPosts = data?.postNumber ?? 0;
  const totalDocuments = data?.medicalDocumentNumber ?? 0;

  const recentActivity = [
    {
      id: "activity_1",
      type: "new_specialist",
      text: "Nouvelle inscription: Dr. Samira Touati (Neurologue)",
      time: "2h",
      color: "bg-blue-500",
    },
    {
      id: "activity_2",
      type: "new_report",
      text: "Rapport IA généré pour Mohamed Cherif",
      time: "4h",
      color: "bg-purple-500",
    },
    {
      id: "activity_3",
      type: "new_patient",
      text: "Nouveau patient inscrit: Omar Zitouni",
      time: "6h",
      color: "bg-green-500",
    },
    {
      id: "activity_4",
      type: "post",
      text: 'Nouvelle publication: "5 exercices essentiels..."',
      time: "8h",
      color: "bg-orange-500",
    },
    {
      id: "activity_5",
      type: "flag",
      text: "Publication signalée par un utilisateur",
      time: "1j",
      color: "bg-red-500",
    },
    {
      id: "activity_6",
      type: "new_specialist",
      text: "Dr. Karim Meziane — compte activé",
      time: "2j",
      color: "bg-blue-500",
    },
  ];

  const stats = [
    {
      id: "total_specialists",
      title: t("admin.total_specialists"),
      value: totalSpecialists,
      color: "blue",
      icon: <Users className="h-6 w-6" />,
    },
    {
      id: "pending_specialists",
      title: t("admin.pending_specialists"),
      value: pendingSpecialists,
      color: "orange",
      icon: <Clock3 className="h-6 w-6" />,
    },
    {
      id: "total_patients",
      title: t("admin.total_patients"),
      value: totalPatients,
      color: "green",
      icon: <UserCheck className="h-6 w-6" />,
    },
    {
      id: "active_specialists",
      title: "Total Spécialistes Validés",
      value: activeSpecialists,
      color: "purple",
      icon: <ShieldCheck className="h-6 w-6" />,
    },
    {
      id: "total_posts",
      title: t("admin.total_posts"),
      value: totalPosts,
      color: "purple",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      id: "total_documents",
      title: "Documents Médicaux",
      value: totalDocuments,
      color: "blue",
      icon: <ClipboardList className="h-6 w-6" />,
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="mx-auto flex min-h-full max-w-[1280px] items-center justify-center px-6 py-12">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0052FF] border-t-transparent" />
            <div>
              <p className="text-sm font-semibold text-[#0A0F1E]">
                Chargement du tableau de bord
              </p>
              <p className="text-xs text-[#64748B]">
                Récupération des données admin en cours
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-8">
        <section className="rounded-2xl bg-gradient-to-br from-[#0052FF] to-[#00A3FF] p-6 text-white shadow-[0_12px_32px_rgba(0,82,255,0.18)] lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Administration SAHTECK
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Vue d'ensemble de la plateforme
                </h1>
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  Surveillez les spécialistes, les patients, les publications et
                  les documents médicaux depuis un espace centralisé.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">
                  Spécialistes
                </p>
                <p className="mt-1 text-xl font-bold">{totalSpecialists}</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">Patients</p>
                <p className="mt-1 text-xl font-bold">{totalPatients}</p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-medium text-white/70">Documents</p>
                <p className="mt-1 text-xl font-bold">{totalDocuments}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#64748B]">
                  Activité récente
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#0A0F1E]">
                  {t("admin.recent_activity")}
                </h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0052FF]">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-3">
              {recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-xl border border-transparent bg-[#F8FAFF] px-4 py-3 transition-all duration-200 ease-in-out hover:border-[#DBEAFE] hover:bg-[#EFF6FF]"
                >
                  <div className={`mt-1 h-3 w-3 rounded-full ${act.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#0A0F1E]">
                      {act.text}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#64748B]">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#64748B]">
                    Raccourcis
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#0A0F1E]">
                    Actions rapides
                  </h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFF] text-[#0052FF]">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    label: t("admin.admin_management"),
                    path: "/admin/admins",
                    icon: ShieldCheck,
                  },
                  {
                    label: t("admin.specialist_management"),
                    path: "/admin/specialists",
                    icon: UserCheck,
                  },
                  {
                    label: t("admin.patient_management"),
                    path: "/admin/patients",
                    icon: Users,
                  },
                  {
                    label: t("admin.content_moderation"),
                    path: "/admin/posts",
                    icon: FileText,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:bg-[#EFF6FF]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0052FF]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[#0A0F1E]">
                        {item.label}
                      </span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#64748B]">
                    Validation
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#0A0F1E]">
                    Spécialistes récents
                  </h2>
                </div>
                <div className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-medium text-[#10B981]">
                  {activeSpecialists} validés
                </div>
              </div>

              <div className="space-y-3">
                {data?.specialist?.data?.slice(0, 4).map((sp) => {
                  const validated = Boolean(sp.specialist?.isValidated);

                  return (
                    <div
                      key={sp.userId}
                      className="flex items-center gap-3 rounded-xl bg-[#F8FAFF] px-4 py-3 transition-colors duration-200 hover:bg-[#EFF6FF]"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${validated ? "from-[#0052FF] to-[#00A3FF]" : "from-[#F59E0B] to-[#FBBF24]"} text-sm font-semibold text-white`}
                      >
                        {sp.fullName?.charAt(0) ?? "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0A0F1E]">
                          {sp.fullName}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${validated ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FFFBEB] text-[#F59E0B]"}`}
                          >
                            {validated ? "Validé" : "En attente"}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            {sp.specialist?.speciality || "Spécialiste"}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
                    </div>
                  );
                })}
              </div>

              {!data?.specialist?.data?.length && (
                <div className="rounded-xl border border-dashed border-[#DBEAFE] bg-[#F8FAFF] px-4 py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-[#CBD5E1]" />
                  <p className="mt-3 text-sm font-medium text-[#64748B]">
                    Aucun spécialiste à afficher pour le moment.
                  </p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
