// Redesigned following SAHTECK brand guidelines
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Users,
  CalendarDays,
  FileText,
  MessageSquare,
  BarChart2,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";

const riskColors = {
  green: "badge-green",
  orange: "badge-orange",
  red: "badge-red",
};
const riskLabels = { green: "Faible", orange: "Modéré", red: "Élevé" };

const cardShadow = { boxShadow: "0 2px 12px rgba(0,82,255,0.08)" };
const gradientBg = { background: "linear-gradient(135deg, #0052FF, #00A3FF)" };

const STATUS_CONFIG = {
  SCHEDULED:  { label: "Planifié",  color: "#0052FF", bg: "#EFF6FF" },
  ACEPTED:    { label: "Accepté",   color: "#10B981", bg: "#ECFDF5" },
  REJECTED:   { label: "Refusé",    color: "#EF4444", bg: "#FEF2F2" },
  COMPLETED:  { label: "Terminé",   color: "#64748B", bg: "#F1F5F9" },
  CANCELLED:  { label: "Annulé",    color: "#F59E0B", bg: "#FFFBEB" },
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const fmtTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

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
        upcomingRDVs: statsRes.data.upcomingRDVs || [],
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

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const statCards = [
    {
      Icon: Users,
      label: t("dashboard.total_patients"),
      value: dashboardData.patientsCount,
      iconColor: "#0052FF",
      iconBg: "#EFF6FF",
    },
    {
      Icon: CalendarDays,
      label: t("dashboard.upcoming_rdvs"),
      value: dashboardData.appointmentsCount,
      iconColor: "#10B981",
      iconBg: "#ECFDF5",
    },
    {
      Icon: FileText,
      label: t("dashboard.pending_reports"),
      value: dashboardData.pendingReports,
      iconColor: "#F59E0B",
      iconBg: "#FFFBEB",
    },
    {
      Icon: MessageSquare,
      label: t("dashboard.unread_messages"),
      value: dashboardData.unreadMessages,
      iconColor: "#8B5CF6",
      iconBg: "#F5F3FF",
    },
  ];

  const quickLinks = [
    {
      label: t("nav.patients"),
      path: "/specialist/patients",
      Icon: Users,
      iconColor: "#0052FF",
      iconBg: "#EFF6FF",
    },
    {
      label: t("nav.chat"),
      path: "/specialist/chat",
      Icon: MessageSquare,
      iconColor: "#10B981",
      iconBg: "#ECFDF5",
    },
    {
      label: t("nav.reports"),
      path: "/specialist/reports",
      Icon: BarChart2,
      iconColor: "#8B5CF6",
      iconBg: "#F5F3FF",
    },
    {
      label: t("nav.planning"),
      path: "/specialist/planning",
      Icon: CalendarDays,
      iconColor: "#F59E0B",
      iconBg: "#FFFBEB",
    },
  ];

  if (!specialist || loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-32 rounded-2xl mb-8" style={{ background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5" style={cardShadow}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
              <div className="h-8 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl h-56" style={cardShadow} />
          <div className="bg-white rounded-xl h-56" style={cardShadow} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fadeIn" style={{ background: "#F8FAFF", minHeight: "100%" }}>

      {/* ── Welcome Banner ── */}
      <div
        className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
        style={gradientBg}
      >
        {/* Decorative blobs */}
        <div className="absolute right-0 top-0 w-56 h-56 bg-white/10 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-36 h-36 bg-white/10 rounded-full translate-y-10 pointer-events-none" />
        <div className="absolute left-1/2 top-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            {specialist?.imageUrl ? (
              <img
                src={specialist.imageUrl}
                alt={specialist.name}
                className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 ring-2 ring-white/30"
              />
            ) : (
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ring-2 ring-white/30">
                {(specialist?.name || "S").charAt(0)}
              </div>
            )}
            <div>
              <p className="text-blue-100 text-sm font-medium">
                {t("dashboard.welcome")},
              </p>
              <h1 className="text-2xl font-bold leading-tight">
                {specialist?.name}
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {specialist?.specialty}
                {specialist?.primaryClinic?.name
                  ? ` · ${specialist.primaryClinic.name}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <Clock size={14} className="text-blue-100" />
              <span className="text-sm text-blue-100 capitalize">{today}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ Icon, label, value, iconColor, iconBg }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={cardShadow}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: iconBg }}
              >
                <Icon size={20} style={{ color: iconColor }} />
              </div>
              <span className="text-xs font-medium text-slate-500 leading-tight">
                {label}
              </span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "#0A0F1E" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent AI Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6" style={cardShadow}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#F5F3FF" }}
              >
                <Sparkles size={16} style={{ color: "#8B5CF6" }} />
              </div>
              <h2 className="font-semibold text-base" style={{ color: "#0A0F1E" }}>
                {t("dashboard.recent_reports")}
              </h2>
            </div>
            <Link
              to="/specialist/reports"
              className="flex items-center gap-1 text-sm font-medium transition-colors duration-200"
              style={{ color: "#0052FF" }}
            >
              {t("common.view_all")}
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "#F8FAFF" }}
            >
              <FileText size={28} style={{ color: "#CBD5E1" }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "#0A0F1E" }}>
              Aucun rapport récent
            </p>
            <p className="text-xs text-center max-w-[200px]" style={{ color: "#64748B" }}>
              Fonctionnalité à venir
            </p>
          </div>
        </div>

        {/* Quick Links + Upcoming RDVs */}
        <div className="bg-white rounded-xl p-6" style={cardShadow}>
          <h2 className="font-semibold text-base mb-4" style={{ color: "#0A0F1E" }}>
            {t("dashboard.quick_links")}
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickLinks.map(({ label, path, Icon, iconColor, iconBg }) => (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] group"
                style={{ background: "#F8FAFF" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  style={{ background: iconBg }}
                >
                  <Icon size={20} style={{ color: iconColor }} />
                </div>
                <span
                  className="text-xs font-medium text-center leading-tight"
                  style={{ color: "#0A0F1E" }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* Upcoming RDVs */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={14} style={{ color: "#64748B" }} />
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748B" }}>
                RDV à venir
              </h3>
            </div>

            {dashboardData.upcomingRDVs.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.upcomingRDVs.slice(0, 3).map((rdv) => {
                  const patientName = rdv.patient?.user?.fullName ?? "Patient";
                  const patientImg  = rdv.patient?.user?.imageUrl;
                  const status      = STATUS_CONFIG[rdv.status] ?? STATUS_CONFIG.SCHEDULED;
                  const date        = rdv.AvailableSlot?.date;
                  const time        = rdv.AvailableSlot?.startTime;

                  return (
                    <div
                      key={rdv.appointmentId}
                      className="p-3 rounded-xl border border-gray-100"
                      style={{ background: "#F8FAFF" }}
                    >
                      {/* Row 1 – avatar + name + status badge */}
                      <div className="flex items-center gap-2 mb-1.5">
                        {patientImg ? (
                          <img
                            src={patientImg}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-white"
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                            style={{ background: "#EFF6FF", color: "#0052FF" }}
                          >
                            {patientName.charAt(0)}
                          </div>
                        )}
                        <p className="text-xs font-semibold flex-1 truncate" style={{ color: "#0A0F1E" }}>
                          {patientName}
                        </p>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: status.color, background: status.bg }}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Row 2 – reason + date·time */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] truncate flex-1" style={{ color: "#94A3B8" }}>
                          {rdv.reason ?? "—"}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Clock size={10} style={{ color: "#64748B" }} />
                          <span className="text-[10px] font-medium" style={{ color: "#64748B" }}>
                            {fmtDate(date)} · {fmtTime(time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <Clock size={24} style={{ color: "#CBD5E1" }} className="mb-2" />
                <p className="text-xs text-center" style={{ color: "#64748B" }}>
                  Aucun RDV à venir
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
