import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
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

export default function ReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [severityFilter, setSeverityFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");

  // Inline comment editing
  const [editingComment, setEditingComment] = useState(null);
  const [tempComment, setTempComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  // Full-report modal
  const [selectedReport, setSelectedReport] = useState(null);

  // ── Data loading ──────────────────────────────────────────────────
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const token = user?.accessToken;
        const authConfig = { headers: { Authorization: `Bearer ${token}` } };

        const [reportsRes, patientsRes] = await Promise.all([
          api.get("/doctors/my_reports", authConfig),
          api.get("/doctors/my_patients", authConfig),
        ]);

        const reportsData = reportsRes.data?.reports || reportsRes.data || [];
        const patientsData =
          patientsRes.data?.patients || patientsRes.data || [];

        setReports(Array.isArray(reportsData) ? reportsData : []);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (err) {
        console.error("Failed to load reports:", err);
        setReports([]);
        setPatients([]);
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
    const matchSeverity =
      severityFilter === "all" || r.riskLevel === severityFilter;
    const matchPatient =
      patientFilter === "all" || String(r.patientId) === patientFilter;
    return matchSeverity && matchPatient;
  });

  // ── Comments (persisted) ──────────────────────────────────────────
  const saveComment = async (reportId) => {
    const value = tempComment.trim();
    setSavingComment(true);

    // Optimistic update
    const previous = reports;
    setReports((prev) =>
      prev.map((r) =>
        (r.id || r.reportId) === reportId
          ? { ...r, specialistComment: value }
          : r,
      ),
    );
    setEditingComment(null);

    try {
      const token = user?.accessToken;
      await api.post(
        `/reports/${reportId}/comment`,
        { comment: value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(t("reports.comment_saved", "Commentaire enregistré"));
    } catch (err) {
      console.error("Failed to save comment:", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement du commentaire",
      );
      setReports(previous); // rollback
    } finally {
      setSavingComment(false);
    }
  };

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t("reports.title")}
          subtitle={`${reports.length} ${t("reports.generated", "rapports générés")}`}
        />

        <div className="flex gap-3 mb-6">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">{t("reports.all_severities")}</option>
            <option value="green">{t("reports.low")}</option>
            <option value="orange">{t("reports.moderate")}</option>
            <option value="red">{t("reports.high")}</option>
          </select>
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">{t("reports.filter_patient")}</option>
            {patients.map((p) => (
              <option key={p.id} value={String(p.id)}>
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
              const reportId = report.id || report.reportId;
              return (
                <div
                  key={reportId}
                  className={`card border-l-4 ${riskBorderColors[report.riskLevel]}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/specialist/patients/${report.patientId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-gray-900 hover:text-primary transition-colors"
                          >
                            {report.patientName}
                          </Link>
                          {report.code && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {report.code}
                            </span>
                          )}
                          <span className={riskColors[report.riskLevel]}>
                            {riskLabels[report.riskLevel]}
                          </span>
                          {report.status === "reviewed" && (
                            <span className="badge-blue">Examiné</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {report.date} à {report.time} · {report.muscleGroup}
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

                  {/* Clickable summary area → opens full report */}
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 w-full text-left hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                        {t("reports.summary", "Résumé")}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {report.summary}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                        {t("reports.recommendation")}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {report.recommendation}
                      </p>
                    </div>
                  </button>

                  {/* Comment section */}
                  <div className="border-t border-gray-100 pt-3">
                    {editingComment === reportId ? (
                      <div className="flex gap-2">
                        <input
                          value={tempComment}
                          onChange={(e) => setTempComment(e.target.value)}
                          className="input-field flex-1 text-sm py-1.5"
                          placeholder="Votre annotation..."
                          autoFocus
                        />
                        <button
                          onClick={() => saveComment(reportId)}
                          disabled={savingComment}
                          className="btn-primary text-sm py-1.5 disabled:opacity-60"
                        >
                          {t("reports.save_comment")}
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="btn-secondary text-sm py-1.5"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {report.specialistComment ? (
                          <p className="text-sm text-gray-600 italic flex-1">
                            💬 {report.specialistComment}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 flex-1">
                            Aucun commentaire
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setEditingComment(reportId);
                            setTempComment(report.specialistComment || "");
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          {report.specialistComment
                            ? "Modifier"
                            : t("reports.add_comment")}
                        </button>
                      </div>
                    )}
                  </div>
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

        {/* Full report modal */}
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={t("reports.full_report", "Rapport complet")}
          size="lg"
        >
          <MovementReport report={selectedReport} />
        </Modal>
      </div>
    </SpecialistLayout>
  );
}