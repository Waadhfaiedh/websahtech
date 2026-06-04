import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import MovementReport from "../../components/reports/MovementReport";
import api from "../../services/api";

const riskColors = {
  green: "badge-green",
  orange: "badge-orange",
  red: "badge-red",
};
const riskLabels = { green: "Faible", orange: "Modéré", red: "Élevé" };
const riskBorderColors = {
  green: "border-l-green-500",
  orange: "border-l-orange-500",
  red: "border-l-red-500",
};

function getRiskLevel(recoveryScore) {
  if (recoveryScore == null) return null;
  if (recoveryScore >= 70) return "green";
  if (recoveryScore >= 40) return "orange";
  return "red";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [severityFilter, setSeverityFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");

  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const token = user?.accessToken;
        const res = await api.get("/doctors/ai-reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setReports(data);
      } catch (err) {
        console.error("Failed to load reports:", err);
        setReports([]);
        toast.error(
          err.response?.data?.message ||
            "Erreur lors du chargement des rapports",
        );
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, [user?.accessToken]);

  // Derive unique patients from reports
  const patients = [
    ...new Map(
      reports.map((r) => [
        r.patientId,
        {
          id: r.patientId,
          name: r.patient?.user?.fullName || r.patientId,
        },
      ]),
    ).values(),
  ];

  const getButtonClasses = (level, isActive) => {
    if (isActive) {
      if (level === "all") return "bg-gray-800 text-white border-gray-800";
      if (level === "green") return "bg-green-500 text-white border-green-500";
      if (level === "orange")
        return "bg-orange-500 text-white border-orange-500";
      return "bg-red-500 text-white border-red-500";
    }
    return "bg-white text-gray-600 border-gray-200 hover:border-gray-300";
  };

  const filtered = reports.filter((r) => {
    const riskLevel = getRiskLevel(r.recoveryScore);
    const matchSeverity =
      severityFilter === "all" || riskLevel === severityFilter;
    const matchPatient =
      patientFilter === "all" || r.patientId === patientFilter;
    return matchSeverity && matchPatient;
  });

  return (
    <div className="p-8 animate-fadeIn">
      <PageHeader
        title={t("reports.title")}
        subtitle={`${reports.length} ${t("reports.generated", "rapports générés")}`}
      />

      <div className="flex gap-3 mb-6">
        <select
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">{t("reports.filter_patient")}</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex gap-1 ml-auto">
          {["all", "green", "orange", "red"].map((level) => (
            <button
              key={level}
              onClick={() => setSeverityFilter(level)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${getButtonClasses(level, severityFilter === level)}`}
            >
              {level === "all" ? "Tous" : riskLabels[level]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => {
            const riskLevel = getRiskLevel(report.recoveryScore);
            const patientName = report.patient?.user?.fullName || "—";
            const imageUrl = report.patient?.user?.imageUrl;
            const dateStr = report.analysisDate || report.createdAt;
            const bodyLabel = [report.bodyPart, report.affectedSide]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={report.id}
                className={`card border-l-4 ${riskLevel ? riskBorderColors[riskLevel] : "border-l-gray-300"}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={patientName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {patientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/specialist/patients/${report.patientId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-gray-900 hover:text-primary transition-colors"
                        >
                          {patientName}
                        </Link>
                        {riskLevel && (
                          <span className={riskColors[riskLevel]}>
                            {riskLabels[riskLevel]}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(dateStr)}
                        {dateStr ? ` à ${formatTime(dateStr)}` : ""}
                        {bodyLabel ? ` · ${bodyLabel}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-xs text-primary font-medium hover:underline whitespace-nowrap"
                  >
                    {t("reports.view_full", "Voir le rapport")} →
                  </button>
                </div>

                {/* Scores row */}
                {(report.recoveryScore != null ||
                  report.symmetryScore != null ||
                  report.mobilityPct != null ||
                  report.painPct != null) && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {report.recoveryScore != null && (
                      <div className="text-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                        <p className="text-xs text-gray-400">Récupération</p>
                        <p className="text-sm font-bold text-gray-800">
                          {report.recoveryScore}%
                        </p>
                      </div>
                    )}
                    {report.symmetryScore != null && (
                      <div className="text-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                        <p className="text-xs text-gray-400">Symétrie</p>
                        <p className="text-sm font-bold text-gray-800">
                          {report.symmetryScore}%
                        </p>
                      </div>
                    )}
                    {report.mobilityPct != null && (
                      <div className="text-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                        <p className="text-xs text-gray-400">Mobilité</p>
                        <p className="text-sm font-bold text-gray-800">
                          {report.mobilityPct}%
                        </p>
                      </div>
                    )}
                    {report.painPct != null && (
                      <div className="text-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                        <p className="text-xs text-gray-400">Douleur</p>
                        <p className="text-sm font-bold text-gray-800">
                          {report.painPct}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Summary + Recommendation */}
                <button
                  onClick={() => setSelectedReport(report)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                      {t("reports.summary", "Résumé")}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {report.summary || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                      {t("reports.recommendation")}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {report.recommendation || "—"}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>{t("common.no_data")}</p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={t("reports.full_report", "Rapport complet")}
        size="lg"
      >
        <MovementReport report={selectedReport} />
      </Modal>
    </div>
  );
}
