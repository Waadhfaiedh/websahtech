/**
 * Mock movement-analysis reports for the specialist's ReportsPage.
 *
 * Shape matches what the AI /analyze endpoint produces (after NestJS saves it
 * to the MovementReport table) and what ReportsPage.jsx + MovementReport.jsx
 * expect to render:
 *
 *   - patient.user.fullName, patient.user.imageUrl   → header
 *   - recoveryScore                                  → drives risk badge (green/orange/red)
 *   - symmetryScore, mobilityPct, painPct            → score row
 *   - summary, recommendation                        → card preview text
 *   - detailed_interpretation, correlation           → modal text
 *   - metrics (6 bilateral movements)                → modal bars
 *   - movement_quality                               → modal badges
 *   - bodyPart, affectedSide, analysisDate           → header line
 *
 * Risk derivation (from ReportsPage.jsx):
 *   recoveryScore >= 70 → green (Faible)
 *   recoveryScore >= 40 → orange (Modéré)
 *   recoveryScore <  40 → red (Élevé)
 */

const mockReports = [
  // ─────────────────────────────────────────────────────────────────────
  // 1. Mohamed Cherif — recovery 76 → GREEN (Faible)
  //    Encouraging recovery, left shoulder
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "rpt-001",
    patientId: "patient-mohamed-cherif",
    bodyPart: "Épaule",
    affectedSide: "Gauche",
    analysisDate: "2026-05-25T14:30:00.000Z",
    createdAt: "2026-05-25T14:30:00.000Z",
    patient: {
      user: {
        fullName: "Mohamed Cherif",
        imageUrl: null,
      },
    },
    recoveryScore: 76,
    symmetryScore: 89,
    mobilityPct: 82,
    painPct: 14,
    painScaleEvaChange: -2,
    summary:
      "Récupération encourageante de l'épaule gauche. Les amplitudes progressent sur la majorité des mouvements, la rotation externe restant le principal déficit à travailler.",
    recommendation:
      "Poursuivre la rééducation actuelle en intensifiant le travail de rotation externe. Réévaluation conseillée dans 3 semaines.",
    detailed_interpretation:
      "Comparée au côté sain (droit), l'épaule gauche atteint 85% en flexion (142° vs 168°) et 67% en abduction (110° vs 165°). Le déficit le plus marqué concerne la rotation externe, à 56% du côté sain (45° vs 80°), axe prioritaire de rééducation. L'extension et la rotation interne sont proches des valeurs de référence. Le contrôle moteur est excellent malgré des compensations scapulaires modérées.",
    correlation:
      "Les gains d'amplitude (+12° en flexion) s'accompagnent d'une baisse de 2 points sur l'échelle EVA de la douleur, indiquant une désensibilisation progressive et une meilleure tolérance au mouvement.",
    metrics: {
      flexion:          { left: 142, right: 168, delta_left: 12, delta_right: 2, unit: "°", reference: 180 },
      extension:        { left: 38,  right: 55,  delta_left: 5,  delta_right: 1, unit: "°", reference: 60 },
      abduction:        { left: 110, right: 165, delta_left: 8,  delta_right: 0, unit: "°", reference: 180 },
      adduction:        { left: 28,  right: 40,  delta_left: 3,  delta_right: 0, unit: "°", reference: 45 },
      rotation_externe: { left: 45,  right: 80,  delta_left: -2, delta_right: 1, unit: "°", reference: 90 },
      rotation_interne: { left: 55,  right: 70,  delta_left: 4,  delta_right: 0, unit: "°", reference: 70 },
    },
    movement_quality: {
      controle_moteur: "EXCELLENT",
      compensations: "MODÉRÉ",
      dyskinesie_scapulaire: "SUIVI",
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // 2. Leila Mansour — recovery 58 → ORANGE (Modéré)
  //    Slower progress, right shoulder
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "rpt-002",
    patientId: "patient-leila-mansour",
    bodyPart: "Épaule",
    analysisDate: "2026-05-24T10:15:00.000Z",
    createdAt: "2026-05-24T10:15:00.000Z",
    patient: {
      user: {
        fullName: "Leila Mansour",
        imageUrl: null,
      },
    },
    recoveryScore: 58,
    symmetryScore: 72,
    mobilityPct: 64,
    painPct: 38,
    painScaleEvaChange: -1,
    summary:
      "Progression modérée de l'épaule droite. Plusieurs mouvements restent limités et la douleur persiste, nécessitant un suivi rapproché.",
    recommendation:
      "Adapter le protocole de rééducation : ajouter du travail proprioceptif et envisager des séances supplémentaires. Réévaluation dans 2 semaines.",
    detailed_interpretation:
      "L'épaule droite présente un déficit notable comparée au côté sain (gauche) : abduction à 60% du côté sain (108° vs 165°) et rotation externe à 56% (45° vs 80°). La flexion est limitée à 75% (120° vs 160°). Les compensations scapulaires sont marquées, suggérant une instabilité de la coiffe des rotateurs. Le contrôle moteur reste modéré.",
    correlation:
      "La mobilité s'améliore lentement (+5° en flexion) mais la douleur reste présente (38% sur l'échelle), suggérant une phase inflammatoire encore active. Le travail antalgique doit être maintenu en parallèle de la mobilisation.",
    metrics: {
      flexion:          { left: 160, right: 120, delta_left: 0, delta_right: 6,  unit: "°", reference: 180 },
      extension:        { left: 55,  right: 42,  delta_left: 0, delta_right: 3,  unit: "°", reference: 60 },
      abduction:        { left: 165, right: 108, delta_left: 0, delta_right: 5,  unit: "°", reference: 180 },
      adduction:        { left: 40,  right: 30,  delta_left: 0, delta_right: 2,  unit: "°", reference: 45 },
      rotation_externe: { left: 80,  right: 45,  delta_left: 0, delta_right: 4,  unit: "°", reference: 90 },
      rotation_interne: { left: 68,  right: 52,  delta_left: 0, delta_right: 1,  unit: "°", reference: 70 },
    },
    movement_quality: {
      controle_moteur: "MODÉRÉ",
      compensations: "MODÉRÉ",
      dyskinesie_scapulaire: "SUIVI",
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // 3. Omar Zitouni — recovery 34 → RED (Élevé)
  //    Severe limitation, suspected frozen shoulder, left side
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "rpt-003",
    patientId: "patient-omar-zitouni",
    bodyPart: "Épaule",
    affectedSide: "Gauche",
    analysisDate: "2026-05-23T16:45:00.000Z",
    createdAt: "2026-05-23T16:45:00.000Z",
    patient: {
      user: {
        fullName: "Omar Zitouni",
        imageUrl: null,
      },
    },
    recoveryScore: 34,
    symmetryScore: 45,
    mobilityPct: 41,
    painPct: 62,
    painScaleEvaChange: 0,
    summary:
      "Amplitudes très limitées sur l'épaule gauche avec douleur importante. Tableau évocateur d'une capsulite rétractile nécessitant une évaluation clinique approfondie.",
    recommendation:
      "Consulter rapidement un orthopédiste pour évaluation spécialisée. Envisager une imagerie (IRM) et adapter le protocole en conséquence.",
    detailed_interpretation:
      "Déficit sévère sur tous les axes par rapport au côté sain : flexion à 46% (80° vs 175°), abduction à 38% (65° vs 170°), rotation externe quasi nulle (15° vs 85°). L'ensemble du tableau — restriction globale, douleur persistante, absence de progression — évoque fortement une capsulite rétractile (épaule gelée). Le contrôle moteur est faible et les compensations très marquées.",
    correlation:
      "La faible mobilité (41%) combinée à une douleur élevée (62% sur l'échelle EVA) et l'absence d'amélioration sur la dernière séance indiquent une phase aiguë. Une prise en charge médicale spécialisée est prioritaire avant la poursuite de la kinésithérapie active.",
    metrics: {
      flexion:          { left: 80,  right: 175, delta_left: 2,  delta_right: 0, unit: "°", reference: 180 },
      extension:        { left: 25,  right: 58,  delta_left: 1,  delta_right: 0, unit: "°", reference: 60 },
      abduction:        { left: 65,  right: 170, delta_left: 0,  delta_right: 0, unit: "°", reference: 180 },
      adduction:        { left: 18,  right: 42,  delta_left: 0,  delta_right: 0, unit: "°", reference: 45 },
      rotation_externe: { left: 15,  right: 85,  delta_left: -1, delta_right: 0, unit: "°", reference: 90 },
      rotation_interne: { left: 30,  right: 68,  delta_left: 1,  delta_right: 0, unit: "°", reference: 70 },
    },
    movement_quality: {
      controle_moteur: "FAIBLE",
      compensations: "MODÉRÉ",
      dyskinesie_scapulaire: "SUIVI",
    },
  },
];

export default mockReports;