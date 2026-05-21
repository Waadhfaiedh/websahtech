import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import api from "../../services/api";

import { stripPending } from "../../components/forms/physioPayload";

// Form sections
import ExamenCliniqueForm from "../../components/forms/ExamenCliniqueForm";
import ExamenComplementaireForm from "../../components/forms/ExamenComplementaireForm";
import DiagnosticForm from "../../components/forms/DiagnosticForm";
import ConduiteATenirForm from "../../components/forms/ConduiteATenirForm";
import PhysiotherapieForm from "../../components/forms/PhysiotherapieForm";

const SECTIONS = [
  {
    id: "examen-clinique",
    label: "Examen Clinique",
    icon: "🩺",
    component: ExamenCliniqueForm,
  },
  {
    id: "examen-complementaire",
    label: "Examen Complémentaire",
    icon: "🔍",
    component: ExamenComplementaireForm,
  },
  {
    id: "diagnostic",
    label: "Diagnostic",
    icon: "📋",
    component: DiagnosticForm,
  },
  {
    id: "conduite-a-tenir",
    label: "Conduite à Tenir",
    icon: "💊",
    component: ConduiteATenirForm,
  },
  {
    id: "physiotherapie",
    label: "Physiothérapie",
    icon: "🏃",
    component: PhysiotherapieForm,
  },
];

const SECTION_KEYS = {
  "examen-clinique": "examenClinique",
  "examen-complementaire": "examenComplementaire",
  diagnostic: "diagnostic",
  "conduite-a-tenir": "conduiteATenir",
  physiotherapie: "physiotherapie",
};

// ── Parse JSON fields from API response ────────────────────────────────────
const parseJsonField = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as-is if not valid JSON
    }
  }
  return value; // Already an object or primitive
};

const normalizeExamenClinique = (examen) => {
  if (!examen) return examen;
  return {
    ...examen,
    mobiliteActive: parseJsonField(examen.mobiliteActive),
    mobilitePassive: parseJsonField(examen.mobilitePassive),
    testConflits: parseJsonField(examen.testConflits),
    testsTendineux: parseJsonField(examen.testsTendineux),
    palpation: parseJsonField(examen.palpation),
    examenCervical: parseJsonField(examen.examenCervical),
    examenNeurologique: parseJsonField(examen.examenNeurologique),
    testsInstabilite: parseJsonField(examen.testsInstabilite),
    testsLaxite: parseJsonField(examen.testsLaxite),
    constantScore: parseJsonField(examen.constantScore),
    quickDashScore: parseJsonField(examen.quickDashScore),
  };
};

// ── Bilan kinésithérapique payload builder ──────────────────────────────────
const buildPhysiotherapieBilanPayload = (bilan = {}) => ({
  // Session-specific pain
  intensiteEVA: bilan.intensiteEVA,
  siegeDouleur: bilan.siegeDouleur,
  irradiation: bilan.irradiation,
  typeDouleur: bilan.typeDouleur,
  facteurAggravant: bilan.facteurAggravant,
  facteurSoulageant: bilan.facteursoulageant,
  debutDouleur: bilan.debutDouleur,
  retentissementAVQ: bilan.retentissementAVQ,
  retentissementProfessionnel: bilan.retentissementProfessionnel,
  retentissementSommeil: bilan.retentissementSommeil,

  // Scores
  constantScore: JSON.stringify(bilan.constantScore),
  quickDashScore: JSON.stringify(bilan.quickDASH),
  dashArabeScore: JSON.stringify(bilan.dashArabeScore),

  // ROM active — all 7 movements
  antepulsionActive: bilan.mobiliteArticulaire?.antepulsion_active,
  extensionActive: bilan.mobiliteArticulaire?.extension_active,
  abductionActive: bilan.mobiliteArticulaire?.abduction_active,
  adductionActive: bilan.mobiliteArticulaire?.adduction_active,
  retractionActive: bilan.mobiliteArticulaire?.retraction_active,
  rotationExterneActive: bilan.mobiliteArticulaire?.rot_ext_active,
  rotationInterneActive: bilan.mobiliteArticulaire?.rot_int_active,

  // ROM passive — all 7 movements
  antepulsionPassive: bilan.mobiliteArticulaire?.antepulsion_passive,
  extensionPassive: bilan.mobiliteArticulaire?.extension_passive,
  abductionPassive: bilan.mobiliteArticulaire?.abduction_passive,
  adductionPassive: bilan.mobiliteArticulaire?.adduction_passive,
  retractionPassive: bilan.mobiliteArticulaire?.retraction_passive,
  rotationExternePassive: bilan.mobiliteArticulaire?.rot_ext_passive,
  rotationInternePassive: bilan.mobiliteArticulaire?.rot_int_passive,

  // Analyse articulaire qualitative (nested under analyseQualitative in bilanData)
  arcDouloureux: bilan.analyseQualitative?.arcDouloureux,
  arcDouloureuxIntervalle: bilan.analyseQualitative?.arcDouloureuxIntervalle,
  finDeCourse: bilan.analyseQualitative?.finDeCourse,

  // Cutané-trophique
  cutanePlaie: bilan.cutanePlaie,
  cutaneCicatrice: bilan.cutaneCicatrice,
  trophiqueOedeme: bilan.trophiqueOedeme,
  trophiqueEpanchement: bilan.trophiqueEpanchement,
  peauAdherences: bilan.peauAdherences,
  peauHypersensibilite: bilan.peauHypersensibilite,

  // Palpation (JSON objects)
  pointsOsseux: bilan.pointsOsseux,
  ligaments: bilan.ligaments,
  musclesPalpation: bilan.musclesPalpation,
  tendonsMTP: bilan.tendonsMTP,

  // Posture / adjacent joints (bilanData uses "morpho" not "morphoStatique")
  morphoStatique: bilan.morpho,
  scapuloThoracique: bilan.scapuloThoracique,
  acromioClaviculaire: bilan.acromioClaviculaire,
  sternoClaviculaire: bilan.sternoClaviculaire,
  rachisCervical: bilan.rachisCervical,
  coude: bilan.coude,

  // Muscle testing MRC — correct keys from testingMusculaire object
  deltoideTesting: bilan.testingMusculaire?.deltoide,
  susEpineuxTesting: bilan.testingMusculaire?.supra_epineux,
  infraEpineuxTesting: bilan.testingMusculaire?.infra_epineux,
  subScapulaireTesting: bilan.testingMusculaire?.subscapulaire,
  grandPectoralTesting: bilan.testingMusculaire?.grand_pectoral,
  grandDorsalTesting: bilan.testingMusculaire?.grand_dorsal,
  trapSupTesting: bilan.testingMusculaire?.trap_superieur,
  trapMoyTesting: bilan.testingMusculaire?.trap_moyen,
  trapInfTesting: bilan.testingMusculaire?.trap_inferieur,
  denteleAnteriorTesting: bilan.testingMusculaire?.dentele_ant,
  longBicepsTesting: bilan.testingMusculaire?.long_biceps,
  tricepsLongTesting: bilan.testingMusculaire?.triceps_long,
  deficitMusculaire: bilan.deficitMusculaire,
  asymetrieDroiteGauche: bilan.asymetrieDroiteGauche,
  syntheseMusculaire: bilan.syntheseMusculaire,

  // Qualitative muscle analysis (JSON objects + presence flags)
  amyotrophie: bilan.amyotrophie,
  amyotrophiePresence: bilan.amyotrophiePresence,
  contractures: bilan.contractures,
  contracturesPresence: bilan.contracturesPresence,
  retractions: bilan.retractions,
  retractionsPresence: bilan.retractionsPresence,

  // Specific tests
  testJobe: bilan.testsSpecifiques?.jobe,
  testPatte: bilan.testsSpecifiques?.patte,
  testGerber: bilan.testsSpecifiques?.gerber,
  testNeer: bilan.testsSpecifiques?.neer,
  testHawkins: bilan.testsSpecifiques?.hawkins,

  // Functional assessment — lives under bilanFonctionnel.testsSimples
  mainBouche: bilan.bilanFonctionnel?.testsSimples?.mainBouche !== "impossible",
  mainTete: bilan.bilanFonctionnel?.testsSimples?.mainTete !== "impossible",
  mainNuque: bilan.bilanFonctionnel?.testsSimples?.mainNuque !== "impossible",
  mainDos: bilan.bilanFonctionnel?.testsSimples?.mainDos !== "impossible",

  sf12Score: bilan.sf12Score,
  observations: bilan.observations,
});

// ── Protocole de rééducation payload builder ────────────────────────────────
const buildProtocolePayload = (p = {}) => ({
  ...p,
  objectifsCourt: p.objectifsCourt,
  objectifsLong: p.objectifsLong,

  // Phase
  phaseActive: p.phaseActive,
  phaseDebutDate: p.phaseDebutDate,
  phaseObjectifsSpecifiques: p.phaseObjectifsSpecifiques,

  // Electrophysio
  physiotherapieAntalgique: p.physiotherapieAntalgique,
  typesPhysio: p.typesPhysio,
  tensAntalgique: p.tensAntalgique,
  courantsExcitoMoteurs: p.courantsExcitoMoteurs,
  ultrasons: p.ultrasons,
  ondesDeChocProtocole: p.ondesDeChocProtocole,
  cryotherapie: p.cryotherapie,
  thermotherapie: p.thermotherapie,
  electrophysioAutre: p.electrophysioAutre,

  // Manual therapy
  massage: p.massage,
  massageDetail: p.massageDetail,
  massageDecontracturant: p.massageDecontracturant,
  mtp: p.mtp,
  triggerPoints: p.triggerPoints,
  drainageLymphatique: p.drainageLymphatique,
  therapieManuAutre: p.therapieManuAutre,
  mobilisationsPassives: p.mobilisationsPassives,
  mobPassivesGlenoHumerales: p.mobPassivesGlenoHumerales,
  mobPassivesScapulothoraciques: p.mobPassivesScapulothoraciques,
  maitlandGrade: p.maitlandGrade,
  mulligan: p.mulligan,
  mobilisationsActives: p.mobilisationsActives,
  mobActivesAssistees: p.mobActivesAssistees,
  pendulairesCodeman: p.pendulairesCodeman,
  etirementsCapsulairesPost: p.etirementsCapsulairesPost,
  etirementsCapsulairesAnt: p.etirementsCapsulairesAnt,
  etirementsCapsulairesInf: p.etirementsCapsulairesInf,
  pompagesCapsulaires: p.pompagesCapsulaires,
  leveesDeTension: p.leveesDeTension,
  techManuAutre: p.techManuAutre,
  balnéotherapie: p.balneotherapie,

  // Renforcement
  renforcement: p.renforcement,
  renfIsometrique: p.renfIsometrique,
  renfConcentrique: p.renfConcentrique,
  renfExcentrique: p.renfExcentrique,
  renfPliometrique: p.renfPliometrique,
  renfChaineCinOuverte: p.renfChaineCinOuverte,
  renfChaineCinFermee: p.renfChaineCinFermee,
  muscleCoiffe: p.muscleCoiffe,
  muscleDeltoide: p.muscleDeltoide,
  muscleStabilisateursScap: p.muscleStabilisateursScap,
  muscleGrandPecGrandDorsal: p.muscleGrandPecGrandDorsal,
  muscleBicepsTriceps: p.muscleBicepsTriceps,
  renforcementAutre: p.renforcementAutre,

  // Contrôle moteur
  proprioception: p.proprioception,
  stabilisationScapDyn: p.stabilisationScapDyn,
  recentrageGH: p.recentrageGH,
  coordinationScapHum: p.coordinationScapHum,
  proprioStatique: p.proprioStatique,
  proprioDynamique: p.proprioDynamique,
  travailPostural: p.travailPostural,
  correctionCompensations: p.correctionCompensations,
  controleMoteurAutre: p.controleMoteurAutre,

  // Réathlétisation
  gestesSpecifiques: p.gestesSpecifiques,
  pliometrieMS: p.pliometrieMS,
  travailArme: p.travailArme,
  reintegrationCharge: p.reintegrationCharge,

  // Exercices
  exercicesDetail: p.exercicesDetail,
  exerciceIds: p.exerciceIds,

  // Taping
  taping: p.taping,
  tapingType: p.tapingType,

  // HEP
  hepPrescrit: p.hepPrescrit,
  hepExercices: p.hepExercices,
  hepSeancesJour: p.hepSeancesJour,
  hepRepetitions: p.hepRepetitions,
  hepSeries: p.hepSeries,
  hepFrequence: p.hepFrequence,
  hepConsignesDouleur: p.hepConsignesDouleur,

  // Education
  eduPosturaux: p.eduPosturaux,
  eduLoadManagement: p.eduLoadManagement,
  eduSommeil: p.eduSommeil,
  eduNeuroscienceDouleur: p.eduNeuroscienceDouleur,
  eduActivitesEviter: p.eduActivitesEviter,
  eduActivitesPrivilegier: p.eduActivitesPrivilegier,
  eduNotes: p.eduNotes,

  // Critères de progression
  criteresRomFlexion: p.criteresRomFlexion,
  criteresRomAbduction: p.criteresRomAbduction,
  criteresRomRotExt: p.criteresRomRotExt,
  criteresEvaMax: p.criteresEvaMax,
  criteresConstantMin: p.criteresConstantMin,
  criteresQuickDASHMax: p.criteresQuickDASHMax,
  criteresSymetrieMin: p.criteresSymetrieMin,
  criteresAbsenceCompIA: p.criteresAbsenceCompIA,
  criteresAutres: p.criteresAutres,

  // Contre-indications
  ciMouvementsInterdits: p.ciMouvementsInterdits,
  ciDelaisPostChirurgicaux: p.ciDelaisPostChirurgicaux,
  ciPathologiesAssociees: p.ciPathologiesAssociees,
  ciPostOp: p.ciPostOp,
  ciDateChirurgie: p.ciDateChirurgie,
  ciTypeChirurgie: p.ciTypeChirurgie,

  // Schedule
  seancesParSemaine: p.seancesParSemaine,
  dureeSemaines: p.dureeSemaines,
  dureeSeance: p.dureeSeance,
  repartition: p.repartition,
  decroissanceProgressive: p.decroissanceProgressive,
  modalitesSevrage: p.modalitesSevrage,

  // Orthèse
  orthese: p.orthese,
  typeOrthese: p.typeOrthese,
  observations: p.observations,
});

export default function SessionDetailPage() {
  const { patientId, sessionId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("examen-clinique");
  const [session, setSession] = useState(null);
  const [patient, setPatient] = useState(null);
  const [interrogatoire, setInterrogatoire] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSessionData = async () => {
    if (!sessionId) {
      toast.error("Erreur: l'identifiant de session est manquant");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/doctors/sessions/${sessionId}`);
      const data = res.data;

      // Parse JSON string fields in examenClinique
      if (data.examenClinique) {
        data.examenClinique = normalizeExamenClinique(data.examenClinique);
      }

      setSession(data);
      // Patient and interrogatoire come embedded in the session response
      if (data.patient) {
        // Flatten user fields (fullName, gender, email…) onto the patient object
        const { user, ...patientRest } = data.patient;
        setPatient({ ...patientRest, ...user });
        setInterrogatoire(data.patient.interrogatoire ?? null);
      }
    } catch (err) {
      console.error("Failed to load session:", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors du chargement de la session",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  const hasSectionData = (sectionId) => {
    if (!session) return false;
    if (sectionId === "examen-complementaire") {
      return (
        Array.isArray(session.examenComplementaire) &&
        session.examenComplementaire.length > 0
      );
    }
    return Boolean(session[SECTION_KEYS[sectionId]]);
  };

  const handleSaveSection = async (sectionId, data) => {
    try {
      const clamp = (v) => Math.max(0, Number.parseInt(v, 10) || 0);
      let endpoint = `/doctors/sessions/${sessionId}/${sectionId}`;
      let payload = data;

      if (sectionId === "physiotherapie") {
        const subTab = data?.activeSubTab || "bilan";
        endpoint = `/doctors/sessions/${sessionId}/physiotherapie/${subTab}`;
        // PhysiotherapieForm.handleSave already ran the normalizers from
        // physioPayload.js — just strip the _pendingBackend key before sending.
        const subPayload =
          data[
            subTab === "bilan"
              ? "bilan"
              : subTab === "protocole"
                ? "protocole"
                : "resultat"
          ];
        if (!subPayload)
          throw new Error("Sous-section de physiotherapie invalide");
        payload = stripPending(subPayload);
      }

      await api.post(endpoint, payload);
      toast.success("Section sauvegardée avec succès");
      fetchSessionData();
    } catch (err) {
      console.error("Failed to save section:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la sauvegarde",
      );
    }
  };

  if (loading) {
    return (
      <SpecialistLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SpecialistLayout>
    );
  }

  const CurrentFormComponent = SECTIONS.find(
    (s) => s.id === activeSection,
  )?.component;
  const currentPatientId = session?.patientId ?? patientId;
  console.log(patient);
  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Session Médicale</h1>
          {patient?.fullName && (
            <p className="text-base font-medium text-primary mt-0.5">
              {patient?.fullName}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {session?.sessionDate &&
              new Date(session.sessionDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar navigation */}
          <div className="col-span-1">
            <div className="card p-0 overflow-hidden sticky top-8">
              <nav className="space-y-1">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all border-l-4 ${
                      activeSection === section.id
                        ? "bg-primary/10 border-l-primary text-primary font-medium"
                        : "border-l-transparent text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm flex-1">{section.label}</span>
                    {hasSectionData(section.id) && (
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Form area */}
          <div className="col-span-3">
            {CurrentFormComponent && (
              <CurrentFormComponent
                session={session}
                patient={patient}
                interrogatoire={interrogatoire}
                patientId={currentPatientId}
                onInterrogatoireUpdate={setInterrogatoire}
                onPatientMeasurementsUpdate={(m) =>
                  setPatient((prev) => ({ ...prev, ...m }))
                }
                onSave={(data) => handleSaveSection(activeSection, data)}
              />
            )}
          </div>
        </div>
      </div>
    </SpecialistLayout>
  );
}
