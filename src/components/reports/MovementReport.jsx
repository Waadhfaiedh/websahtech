import { useTranslation } from "react-i18next";

const riskColors = {
  green: "badge-green",
  orange: "badge-orange",
  red: "badge-red",
};
const riskLabels = { green: "Faible", orange: "Modéré", red: "Élevé" };

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

function ScoreBadge({ label, value, unit = "%" }) {
  if (value == null) return null;
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-gray-900">
        {value}
        {unit}
      </p>
    </div>
  );
}

export default function MovementReport({ report }) {
  const { t } = useTranslation();

  if (!report) return null;

  const patientName = report.patient?.user?.fullName || report.patientName || "—";
  const imageUrl = report.patient?.user?.imageUrl;
  const dateStr = report.analysisDate || report.createdAt;
  const riskLevel = getRiskLevel(report.recoveryScore);
  const bodyLabel = [report.bodyPart, report.affectedSide]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={patientName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">
                {patientName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{patientName}</h3>
            {bodyLabel && (
              <p className="text-sm text-gray-500 mt-0.5">{bodyLabel}</p>
            )}
            {dateStr && (
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(dateStr)} à {formatTime(dateStr)}
              </p>
            )}
          </div>
        </div>
        {riskLevel && (
          <span className={riskColors[riskLevel]}>{riskLabels[riskLevel]}</span>
        )}
      </div>

      {/* Scores grid */}
      {(report.recoveryScore != null ||
        report.symmetryScore != null ||
        report.mobilityPct != null ||
        report.painPct != null) && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
            {t("reports.metrics", "Mesures")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ScoreBadge label="Récupération" value={report.recoveryScore} />
            <ScoreBadge label="Symétrie" value={report.symmetryScore} />
            <ScoreBadge label="Mobilité" value={report.mobilityPct} />
            <ScoreBadge label="Douleur" value={report.painPct} />
          </div>
        </section>
      )}

      {/* Movement quality + pain scale change */}
      {(report.movementQuality || report.painScaleEvaChange != null) && (
        <div className="flex flex-wrap gap-4">
          {report.movementQuality && (
            <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">Qualité du mouvement</p>
              <p className="text-sm font-semibold text-gray-800">
                {report.movementQuality}
              </p>
            </div>
          )}
          {report.painScaleEvaChange != null && (
            <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
              <p className="text-xs text-gray-400 mb-0.5">Évolution douleur EVA</p>
              <p className="text-sm font-semibold text-gray-800">
                {report.painScaleEvaChange > 0
                  ? `+${report.painScaleEvaChange}`
                  : report.painScaleEvaChange}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
          {t("reports.summary", "Résumé")}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {report.summary || "—"}
        </p>
      </section>

      {/* Detailed interpretation */}
      {report.detailedInterpretation && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
            {t("reports.findings", "Interprétation détaillée")}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {report.detailedInterpretation}
          </p>
        </section>
      )}

      {/* Correlation */}
      {report.correlation && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
            Corrélation
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {report.correlation}
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

      {/* Detected language tag */}
      {report.detectedLanguage && (
        <p className="text-xs text-gray-400 text-right">
          Langue détectée : {report.detectedLanguage.toUpperCase()}
        </p>
      )}
    </div>
  );
}
