import { useTranslation } from "react-i18next";

const riskColors = {
  green: "badge-green",
  orange: "badge-orange",
  red: "badge-red",
};
const riskLabels = { green: "Faible", orange: "Modéré", red: "Élevé" };

/**
 * Full movement-analysis report view.
 * Rendered inside a Modal when a report card is clicked on ReportsPage.
 *
 * Expects a `report` object with the same shape used by ReportsPage:
 *   { id, patientName, patientId, code, muscleGroup, date, time,
 *     riskLevel, summary, findings, recommendation, metrics?, fullReport? }
 *
 * `metrics` (optional) is an array of { label, value } pairs produced by the
 * AI movement module (e.g. range of motion, symmetry, repetitions). It renders
 * only if present, so the component is safe with partial data.
 */
export default function MovementReport({ report }) {
  const { t } = useTranslation();

  if (!report) return null;

  const metrics = Array.isArray(report.metrics) ? report.metrics : [];

  return (
    <div className="space-y-6">
      {/* Header: patient + meta */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {report.patientName}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {report.code ? `${report.code} · ` : ""}
            {report.muscleGroup}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {report.date}
            {report.time ? ` à ${report.time}` : ""}
          </p>
        </div>
        {report.riskLevel && (
          <span className={riskColors[report.riskLevel]}>
            {riskLabels[report.riskLevel]}
          </span>
        )}
      </div>

      {/* AI summary */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
          {t("reports.summary", "Résumé")}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {report.summary || "—"}
        </p>
      </section>

      {/* Findings */}
      {report.findings && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
            {t("reports.findings", "Constatations")}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {report.findings}
          </p>
        </section>
      )}

      {/* Metrics from the movement analysis */}
      {metrics.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            {t("reports.metrics", "Mesures")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-3 border border-gray-100"
              >
                <p className="text-xs text-gray-400">{m.label}</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full structured report body, if the backend provides one */}
      {report.fullReport && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
            {t("reports.full_report", "Rapport complet")}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {report.fullReport}
          </p>
        </section>
      )}

      {/* Recommendation */}
      <section className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <p className="text-xs font-semibold text-primary uppercase mb-1">
          {t("reports.recommendation", "Recommandation")}
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">
          {report.recommendation || "—"}
        </p>
      </section>
    </div>
  );
}