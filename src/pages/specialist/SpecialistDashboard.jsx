import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import StatCard from "../../components/common/StatCard";
import api from "../../services/api";
import { toast } from "react-toastify";

const riskColors = {
  green: "badge-green",
  orange: "badge-orange",
  red: "badge-red",
};
const riskLabels = { green: "Faible", orange: "Modéré", red: "Élevé" };

export default function SpecialistDashboard() {
  const { t } = useTranslation();
  const { specialist } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    patientsCount: 0,
    appointmentsCount: 0,
    pendingReports: 0,
    unreadMessages: 0,
    upcomingRDVs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsRes = await api.get("/doctors/get-forms");
      setDashboardData({
        patientsCount: statsRes.data.patientsCount || 0,
        appointmentsCount: statsRes.data.appointmentsCount || 0,
        pendingReports: 0,
        unreadMessages: statsRes.data.unreadedcount || 0,
        upcomingRDVs: [],
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error(
        err.response?.data?.message ||
          "Impossible de charger le tableau de bord",
      );
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      label: t("nav.patients"),
      path: "/specialist/patients",
      color: "bg-blue-500",
      icon: "👥",
    },
    {
      label: t("nav.chat"),
      path: "/specialist/chat",
      color: "bg-emerald-500",
      icon: "💬",
    },
    {
      label: t("nav.reports"),
      path: "/specialist/reports",
      color: "bg-purple-500",
      icon: "📊",
    },
    {
      label: t("nav.planning"),
      path: "/specialist/planning",
      color: "bg-orange-500",
      icon: "📅",
    },
  ];

  if (!specialist) {
    return (
      <SpecialistLayout>
        <div className="flex items-center justify-center h-full p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SpecialistLayout>
    );
  }

  if (loading) {
    return (
      <SpecialistLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SpecialistLayout>
    );
  }

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        {/* Welcome banner */}
        <div className="bg-primary rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute right-16 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-8" />
          <div className="flex items-center gap-4 relative z-10">
            {specialist?.imageUrl ? (
              <img
                src={specialist.imageUrl}
                alt={specialist.name}
                className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {(specialist?.name || "S").charAt(0)}
              </div>
            )}
            <div>
              <p className="text-blue-100 text-sm">{t("dashboard.welcome")},</p>
              <h1 className="text-2xl font-bold">{specialist?.name}</h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {specialist?.specialty} · {specialist?.clinic}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t("dashboard.total_patients")}
            value={dashboardData.patientsCount}
            color="blue"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
          <StatCard
            title={t("dashboard.upcoming_rdvs")}
            value={dashboardData.appointmentsCount}
            color="green"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <StatCard
            title={t("dashboard.pending_reports")}
            value={dashboardData.pendingReports}
            color="orange"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
          <StatCard
            title={t("dashboard.unread_messages")}
            value={dashboardData.unreadMessages}
            color="purple"
            icon={
              <svg
                className="w-6 h-6"
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
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent AI Reports - Placeholder until API is ready */}
          <div className="col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">
                {t("dashboard.recent_reports")}
              </h2>
              <Link
                to="/specialist/reports"
                className="text-primary text-sm font-medium hover:underline"
              >
                {t("common.view_all")}
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-gray-400 text-center py-8">
                Fonctionnalité à venir
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">
              {t("dashboard.quick_links")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((ql) => (
                <Link
                  key={ql.path}
                  to={ql.path}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <span className="text-2xl">{ql.icon}</span>
                  <span className="text-xs font-medium text-gray-700 text-center group-hover:text-primary">
                    {ql.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                RDV à venir
              </h3>
              {dashboardData.upcomingRDVs.length > 0 ? (
                dashboardData.upcomingRDVs.slice(0, 3).map((rdv) => (
                  <div key={rdv.id} className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {rdv.patientName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {rdv.date} · {rdv.startTime}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">
                  Aucun RDV à venir
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SpecialistLayout>
  );
}
