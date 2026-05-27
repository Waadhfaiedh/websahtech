// Redesigned following SAHTECK brand guidelines
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

import {
  ArrowLeft,
  Stethoscope,
  Microscope,
  ClipboardList,
  Pill,
  Activity,
  Check,
} from "lucide-react";
import { stripPending } from "../../components/forms/physioPayload";

// Form sections
import ExamenCliniqueForm from "../../components/forms/ExamenCliniqueForm";
import ExamenComplementaireForm from "../../components/forms/ExamenComplementaireForm";
import DiagnosticForm from "../../components/forms/DiagnosticForm";
import ConduiteATenirForm from "../../components/forms/ConduiteATenirForm";
import PhysiotherapieForm from "../../components/forms/PhysiotherapieForm";

// Brand constants
const CARD_SHADOW = "0 2px 12px rgba(0,82,255,0.08)";
const PAGE_BG = "#F8FAFF";
const TEXT_PRIMARY = "#0A0F1E";
const TEXT_SECONDARY = "#64748B";

const SECTIONS = [
  {
    id: "examen-clinique",
    label: "Examen Clinique",
    icon: Stethoscope,
    component: ExamenCliniqueForm,
  },
  {
    id: "examen-complementaire",
    label: "Examen Complémentaire",
    icon: Microscope,
    component: ExamenComplementaireForm,
  },
  {
    id: "diagnostic",
    label: "Diagnostic",
    icon: ClipboardList,
    component: DiagnosticForm,
  },
  {
    id: "conduite-a-tenir",
    label: "Conduite à Tenir",
    icon: Pill,
    component: ConduiteATenirForm,
  },
  {
    id: "physiotherapie",
    label: "Physiothérapie",
    icon: Activity,
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

// â”€â”€ Parse JSON fields from API response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Bilan kinÃ©sithÃ©rapique payload builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // ROM active â€” all 7 movements
  antepulsionActive: bilan.mobiliteArticulaire?.antepulsion_active,
  extensionActive: bilan.mobiliteArticulaire?.extension_active,
  abductionActive: bilan.mobiliteArticulaire?.abduction_active,
  adductionActive: bilan.mobiliteArticulaire?.adduction_active,
  retractionActive: bilan.mobiliteArticulaire?.retraction_active,
  rotationExterneActive: bilan.mobiliteArticulaire?.rot_ext_active,
  rotationInterneActive: bilan.mobiliteArticulaire?.rot_int_active,

  // ROM passive â€” all 7 movements
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

  // CutanÃ©-trophique
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

  // Muscle testing MRC â€” correct keys from testingMusculaire object
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

  // Functional assessment â€” lives under bilanFonctionnel.testsSimples
  mainBouche: bilan.bilanFonctionnel?.testsSimples?.mainBouche !== "impossible",
  mainTete: bilan.bilanFonctionnel?.testsSimples?.mainTete !== "impossible",
  mainNuque: bilan.bilanFonctionnel?.testsSimples?.mainNuque !== "impossible",
  mainDos: bilan.bilanFonctionnel?.testsSimples?.mainDos !== "impossible",

  sf12Score: bilan.sf12Score,
  observations: bilan.observations,
});

// â”€â”€ Protocole de rÃ©Ã©ducation payload builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  balneotherapie: p.balneotherapie,

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

  // ContrÃ´le moteur
  proprioception: p.proprioception,
  stabilisationScapDyn: p.stabilisationScapDyn,
  recentrageGH: p.recentrageGH,
  coordinationScapHum: p.coordinationScapHum,
  proprioStatique: p.proprioStatique,
  proprioDynamique: p.proprioDynamique,
  travailPostural: p.travailPostural,
  correctionCompensations: p.correctionCompensations,
  controleMoteurAutre: p.controleMoteurAutre,

  // RÃ©athlÃ©tisation
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

  // CritÃ¨res de progression
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

  // OrthÃ¨se
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
        // Flatten user fields (fullName, gender, emailâ€¦) onto the patient object
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
      let endpoint = `/doctors/sessions/${sessionId}/${sectionId}`;
      let payload = data;

      if (sectionId === "physiotherapie") {
        const subTab = data?.activeSubTab || "bilan";
        endpoint = `/doctors/sessions/${sessionId}/physiotherapie/${subTab}`;
        // PhysiotherapieForm.handleSave already ran the normalizers from
        // physioPayload.js â€” just strip the _pendingBackend key before sending.
        let subPayloadKey = "resultat";
        if (subTab === "bilan") {
          subPayloadKey = "bilan";
        } else if (subTab === "protocole") {
          subPayloadKey = "protocole";
        }
        const subPayload = data[subPayloadKey];
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
      <div
        className="min-h-full px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center"
        style={{ background: PAGE_BG }}
      >
        <div className="w-8 h-8 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const CurrentFormComponent = SECTIONS.find(
    (s) => s.id === activeSection,
  )?.component;
  const currentPatientId = session?.patientId ?? patientId;

  return (
    <div
      className="min-h-full px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn"
      style={{ background: PAGE_BG }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#0052FF] transition-colors"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        {/* Header section */}
        <section
          className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 text-white"
          style={{
            background: "linear-gradient(135deg, #0052FF, #00A3FF)",
            boxShadow: CARD_SHADOW,
          }}
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 left-1/2 h-24 w-24 rounded-full bg-white/10 -translate-x-full translate-y-8" />

          <div className="relative z-10 space-y-1">
            <h1 className="text-3xl sm:text-[32px] font-bold tracking-tight">
              Session Médicale
            </h1>
            {patient?.fullName && (
              <p className="text-lg text-white/90">{patient?.fullName}</p>
            )}
            {session?.sessionDate && (
              <p className="text-sm text-white/80">
                {new Date(session.sessionDate).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </section>

        {/* Two column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar navigation */}
          <div className="col-span-1">
            <nav
              className="rounded-[12px] overflow-hidden space-y-1 sticky top-8"
              style={{ boxShadow: CARD_SHADOW }}
            >
              {SECTIONS.map((section, index) => {
                const isActive = activeSection === section.id;
                const IconComponent = section.icon;
                const hasData = hasSectionData(section.id);

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-5 py-4 flex items-center gap-3 transition-all duration-200 ease-in-out border-l-4 ${
                      isActive
                        ? "bg-gradient-to-r from-[#0052FF] to-[#0047db] border-l-[#0052FF] text-white font-semibold"
                        : "bg-white border-l-transparent text-[#0A0F1E] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    <IconComponent
                      size={20}
                      className={isActive ? "#FFFFFF" : "#0052FF"}
                      style={{ color: isActive ? "#FFFFFF" : "#0052FF" }}
                    />
                    <span className="text-sm flex-1">{section.label}</span>
                    {hasData && (
                      <Check
                        size={16}
                        className={isActive ? "text-white" : "text-[#10B981]"}
                        style={{ color: isActive ? "#FFFFFF" : "#10B981" }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Form area */}
          <div className="col-span-1 lg:col-span-3">
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
    </div>
  );
}
