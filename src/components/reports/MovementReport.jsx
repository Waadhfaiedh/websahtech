import React from "react";

/**
 * Movement Analysis Report — visual layout matching the Sahtech design.
 *
 * Renders a saved report (from /doctors/ai-reports or the mock data) in the
 * style of the Sahtech app:
 *   1. Header (patient, body part, date, risk badge)
 *   2. Cinématique Articulaire — animated bars for the 6 movements
 *   3. Indicateur de Déficit — worst-deficit highlight card
 *   4. Analyse de la Qualité du Mouvement — quality cards with badges
 *   5. Score de Symétrie — twin tall bars with the % below
 *   6. Corrélation douleur + mouvement — blue accent card with summary
 *   7. Score de Récupération — circular gauge with mobility/pain sub-stats
 *   8. Recommandation — only for patient reports (null for specialists)
 *
 * Expects the report shape produced by /analyze and stored in NestJS:
 *   { id, patient:{user:{fullName,imageUrl}}, bodyPart, affectedSide,
 *     analysisDate, recoveryScore, symmetryScore, mobilityPct, painPct,
 *     painScaleEvaChange, summary, recommendation,
 *     detailed_interpretation, correlation,
 *     metrics:{flexion:{left,right,delta_left,delta_right,unit,reference}, ...},
 *     movement_quality:{controle_moteur, compensations, dyskinesie_scapulaire} }
 */

const MOVEMENT_LABELS = {
  flexion: "Flexion Antérieure",
  extension: "Extension",
  abduction: "Abduction",
  adduction: "Adduction",
  rotation_externe: "Rotation Externe",
  rotation_interne: "Rotation Interne",
};

const MOVEMENT_QUALITY_LABELS = {
  flexion: "Flexion",
  extension: "Extension",
  abduction: "Abduction",
  adduction: "Adduction",
  rotation_externe: "Rotation externe",
  rotation_interne: "Rotation interne",
};

const QUALITY_META = {
  controle_moteur: {
    label: "Contrôle Moteur",
    desc: "Stabilité gléno-humérale optimale",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  compensations: {
    label: "Compensations",
    desc: "Élévation scapulaire précoce détectée",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  dyskinesie_scapulaire: {
    label: "Dyskinésie Scapulaire",
    desc: "Type II (Médial) observé à la descente",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
};

const QUALITY_STYLES = {
  EXCELLENT: { ring: "ring-green-200", iconBg: "bg-green-50 text-green-600", badge: "bg-green-100 text-green-700" },
  BON:       { ring: "ring-green-200", iconBg: "bg-green-50 text-green-600", badge: "bg-green-100 text-green-700" },
  "MODÉRÉ":  { ring: "ring-amber-200", iconBg: "bg-amber-50 text-amber-600", badge: "bg-amber-100 text-amber-700" },
  MODERE:    { ring: "ring-amber-200", iconBg: "bg-amber-50 text-amber-600", badge: "bg-amber-100 text-amber-700" },
  SUIVI:     { ring: "ring-blue-200",  iconBg: "bg-blue-50 text-blue-600",   badge: "bg-blue-100 text-blue-700" },
  FAIBLE:    { ring: "ring-red-200",   iconBg: "bg-red-50 text-red-600",     badge: "bg-red-100 text-red-700" },
};

const qStyle = (label) => QUALITY_STYLES[(label || "").toUpperCase()] || QUALITY_STYLES.SUIVI;

function fmtDelta(delta, unit) {
  if (delta == null || delta === 0) return null;
  return `${delta > 0 ? "+" : ""}${delta}${unit || ""}`;
}

function fmtDate(s) {
  if (!s) return "";
  return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtTime(s) {
  if (!s) return "";
  return new Date(s).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function normalizePercentScore(value) {
  if (value == null) return null;
  const num = Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(num)) return null;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function getRiskLevel(score) {
  if (score == null) return null;
  if (score >= 70) return { key: "green", label: "Faible", classes: "bg-green-100 text-green-700" };
  if (score >= 40) return { key: "orange", label: "Modéré", classes: "bg-orange-100 text-orange-700" };
  return { key: "red", label: "Élevé", classes: "bg-red-100 text-red-700" };
}

// ─── A single movement row: label + value (with delta) + animated bar ───
function MetricBar({ label, value, delta, unit, reference }) {
  const pct = reference ? Math.min(100, Math.round((value / reference) * 100)) : 70;
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-base font-semibold text-gray-900">{value}{unit}</span>
          {delta != null && delta !== 0 && (
            <span className={`text-xs font-semibold ${positive ? "text-green-600" : "text-red-500"}`}>
              {fmtDelta(delta, unit)}
            </span>
          )}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
          style={{ width: `${pct}%`, transitionDuration: "900ms" }}
        />
      </div>
    </div>
  );
}

// ─── Deficit indicator (the small icon-card under the bars in image 2) ───
function DeficitIndicator({ metrics, reference }) {
  // Find the movement with the worst deficit ratio vs reference
  let worst = null;
  for (const [name, m] of Object.entries(metrics || {})) {
    if (!m.reference) continue;
    const affectedVal = Math.min(m.left, m.right); // worst side
    const ratio = affectedVal / m.reference;
    if (!worst || ratio < worst.ratio) {
      worst = { name, value: affectedVal, ref: m.reference, ratio, unit: m.unit };
    }
  }
  if (!worst) return null;
  return (
    <div className="bg-gray-50 rounded-xl p-4 mt-2">
      <div className="flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 mb-2 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900">Indicateur de Déficit</p>
        <p className="text-xs text-gray-500 mt-1">
          Zone de restriction détectée en fin de course de {MOVEMENT_LABELS[worst.name]?.toLowerCase() || worst.name} ({worst.value}{worst.unit}–{worst.ref}{worst.unit})
        </p>
      </div>
    </div>
  );
}

// ─── Quality card row (image 3, top) ───
function QualityCard({ label, rating }) {
  const style = qStyle(rating);
  return (
    <div className={`bg-white rounded-xl p-3 flex items-center gap-3 ring-1 ${style.ring}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.iconBg}`}>
        <span className="text-sm font-bold">{label.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 truncate">Qualité du mouvement</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded ${style.badge} whitespace-nowrap`}>
        {rating || "Non évalué"}
      </span>
    </div>
  );
}

// ─── Twin bars for symmetry (image 3, bottom) ───
function SymmetryChart({ score, affectedSide }) {
  // Affected side height is proportional to the symmetry score; healthy side is full
  const affectedHeight = Math.max(20, Math.min(100, score));
  return (
    <div>
      <div className="flex items-end justify-center gap-8 h-44 mb-4 px-2">
        <div className="flex flex-col items-center flex-1 max-w-[100px]">
          <div
            className="w-full rounded-t-xl bg-blue-300 transition-all"
            style={{ height: `${affectedHeight}%`, transitionDuration: "900ms" }}
          />
          <p className="text-[11px] text-gray-500 mt-3 uppercase tracking-wide">Gauche (Atteinte)</p>
        </div>
        <div className="flex flex-col items-center flex-1 max-w-[100px]">
          <div className="w-full rounded-t-xl bg-blue-600" style={{ height: "100%" }} />
          <p className="text-[11px] text-gray-500 mt-3 uppercase tracking-wide">Droite (Saine)</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-gray-900">{score}%</p>
        <p className="text-xs text-gray-500 mt-1">Indice de Symétrie Dynamique</p>
      </div>
    </div>
  );
}

// ─── Recovery gauge (image 4, bottom) ───
function RecoveryGauge({ score, mobility, pain }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - ((score || 0) / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 150, height: 150 }}>
        <svg width="150" height="150" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="75" cy="75" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="75" cy="75" r={r} fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 leading-none">{score ?? "—"}</span>
          <span className="text-xs text-gray-400 mt-1">/ 100</span>
        </div>
      </div>
      <div className="flex gap-10 mt-4">
        {mobility != null && (
          <div className="text-center">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Mobilité</p>
            <p className="text-lg font-semibold text-blue-600 mt-1">{mobility}%</p>
          </div>
        )}
        {pain != null && (
          <div className="text-center">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Douleur</p>
            <p className="text-lg font-semibold text-amber-600 mt-1">{pain}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section wrapper with the SAHTECH kicker style ───
function Section({ kicker, title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
      {kicker && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{kicker}</p>
      )}
      {title && <h3 className="text-lg font-bold text-gray-900 leading-tight mb-4">{title}</h3>}
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function MovementReport({ report }) {
  if (!report) {
    return <div className="p-6 text-center text-gray-400">Aucun rapport sélectionné.</div>;
  }

  const patientName = report.patient?.user?.fullName || report.patient?.fullName || "—";
  const imageUrl = report.patient?.user?.imageUrl || report.patient?.imageUrl;
  const dateStr = report.analysisDate || report.createdAt || report.created_at;
  const metrics = report.metrics || report.metric || {};
  const movementQuality = report.movement_quality || report.movementQuality || {};
  const metricEntries = Object.entries(metrics || {});
  const qualityEntries = Object.keys(MOVEMENT_LABELS).map((name) => [
    name,
    movementQuality[name] ?? "Non évalué",
  ]);

  const recoveryScore = normalizePercentScore(
    report.recoveryScore ?? report.recovery_score ?? metrics.recovery_score ?? report.metrics_passthrough?.recovery_score,
  );
  const symmetryScore = normalizePercentScore(
    report.symmetryScore ?? report.symmetry_score ?? metrics.symmetry_score ?? report.metrics_passthrough?.symmetry_score,
  );
  const mobilityPct = normalizePercentScore(
    report.mobilityPct ?? report.mobility_pct ?? metrics.mobility_pct ?? report.metrics_passthrough?.mobility_pct,
  );
  const painPct = normalizePercentScore(
    report.painPct ?? report.pain_pct ?? metrics.pain_pct ?? report.metrics_passthrough?.pain_pct,
  );
  const risk = getRiskLevel(recoveryScore);

  return (
    <div className="bg-gray-50 -m-5 p-5 space-y-5">

      {/* ─── 1. Header ─── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img src={imageUrl} alt={patientName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold">{patientName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{patientName}</h2>
            <p className="text-sm text-gray-500">{report.bodyPart || report.body_part} · {report.affectedSide || report.affected_side}</p>
            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(dateStr)} à {fmtTime(dateStr)}</p>
          </div>
        </div>
        {risk && (
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${risk.classes}`}>{risk.label}</span>
        )}
      </div>

      {/* ─── 2. Cinématique Articulaire ─── */}
      <Section kicker="Moteur d'analyse d'amplitude articulaire™" title="Cinématique Articulaire">
        {metricEntries.length > 0 ? (
          metricEntries.map(([name, m]) => (
            <MetricBar
              key={name}
              label={MOVEMENT_LABELS[name] || name}
              value={Math.min(m.left ?? 0, m.right ?? 0)}
              delta={m.delta_left ?? m.delta_right}
              unit={m.unit}
              reference={m.reference}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">Aucune donnée métrique disponible.</p>
        )}
        <DeficitIndicator metrics={metrics} />
      </Section>

      {/* ─── 3. Quality cards ─── */}
      <Section kicker="Analyse de la qualité du mouvement™">
        <div className="space-y-2">
          {qualityEntries.map(([k, rating]) => (
            <QualityCard
              key={k}
              label={MOVEMENT_QUALITY_LABELS[k] || k.replace(/_/g, ' ')}
              rating={rating}
            />
          ))}
        </div>
      </Section>

      {/* ─── 4. Symmetry ─── */}
      {symmetryScore != null && (
        <Section kicker="Score de symétrie de l'épaule™">
          <SymmetryChart score={symmetryScore} affectedSide={report.affectedSide || report.affected_side} />
        </Section>
      )}

      {/* ─── 5. Correlation — blue accent card ─── */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Corrélation douleur + mouvement™</p>
        <h3 className="text-xl font-bold leading-snug mb-3">{report.summary || "Analyse de corrélation"}</h3>
        {report.correlation && (
          <p className="text-sm leading-relaxed text-blue-50/95">{report.correlation}</p>
        )}
      </div>

      {/* ─── 6. Recovery gauge ─── */}
      {recoveryScore != null && (
        <Section kicker="Score de récupération SAHTECH™">
          <RecoveryGauge
            score={recoveryScore}
            mobility={mobilityPct}
            pain={painPct}
          />
        </Section>
      )}

      {/* ─── 7. Detailed interpretation (extra clinical text) ─── */}
      {(report.detailed_interpretation || report.detailedInterpretation) && (
        <Section kicker="Interprétation clinique">
          <p className="text-sm text-gray-700 leading-relaxed">{report.detailed_interpretation || report.detailedInterpretation}</p>
        </Section>
      )}

      {/* ─── 8. Recommendation — only for patient reports (null for specialist) ─── */}
      {report.recommendation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
          <span className="text-xl">🩺</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-1">Recommandation</p>
            <p className="text-sm text-blue-900 leading-relaxed">{report.recommendation}</p>
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-gray-400 pt-2">
        Rapport généré par l'assistant IA Sahtech · à des fins informatives
      </p>
    </div>
  );
}