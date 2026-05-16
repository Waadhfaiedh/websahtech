import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import api from "../../services/api";

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

const buildPhysiotherapieBilanPayload = (bilan = {}) => ({
  age: bilan.age === "" ? null : Number(bilan.age),
  sexe: bilan.sexe,
  taille: bilan.taille === "" ? null : Number(bilan.taille),
  poids: bilan.poids === "" ? null : Number(bilan.poids),
  membreDominant: bilan.membreDominant,
  profession: bilan.profession,
  membreAtteint: bilan.membreAtteint,
  frequenceSportPratiquee: bilan.frequenceSportPratiquee,
  intensitePratique: bilan.intensitePratique,
  antecedentsMedicauxEnabled: bilan.antecedentsMedicauxEnabled,
  antecedentsMedicauxDetails: bilan.antecedentsMedicauxDetails,
  antecedentsChirurgicauxEnabled: bilan.antecedentsChirurgicauxEnabled,
  antecedentsChirurgicauxDetails: bilan.antecedentsChirurgicauxDetails,
  plainte: bilan.plainte,
  historique: bilan.historique,
  siegeDouleur: bilan.siegeDouleur,
  irradiation: bilan.irradiation,
  intensiteEVA: bilan.intensiteEVA,
  typeDouleur: bilan.typeDouleur,
  facteurAggravant: bilan.facteurAggravant,
  facteurSoulagement: bilan.facteurSoulagement,
  debutDouleur: bilan.debutDouleur,
  retentissementAVQ: bilan.retentissementAVQ,
  retentissementPro: bilan.retentissementProfessionnel,
  retentissementSommeil: bilan.retentissementSommeil,
  constantScore: JSON.stringify(bilan.constantScore),
  quickDashScore: JSON.stringify(bilan.quickDASH),
  dashArabeScore: JSON.stringify(bilan.dashArabeScore),
  antepulsionActive: bilan.mobiliteArticulaire?.antepulsion_active,
  antepulsionPassive: bilan.mobiliteArticulaire?.antepulsion_passive,
  abductionActive: bilan.mobiliteArticulaire?.abduction_active,
  abductionPassive: bilan.mobiliteArticulaire?.abduction_passive,
  retractionActive: bilan.mobiliteArticulaire?.retraction_active,
  retractionPassive: bilan.mobiliteArticulaire?.retraction_passive,
  rotationExterneActive: bilan.mobiliteArticulaire?.rot_ext_active,
  rotationExternePassive: bilan.mobiliteArticulaire?.rot_ext_passive,
  rotationInterneActive: bilan.mobiliteArticulaire?.rot_int_active,
  rotationInternePassive: bilan.mobiliteArticulaire?.rot_int_passive,
  deltoideTesting: bilan.testingMusculaire?.deltoides,
  susEpineuxTesting: bilan.testingMusculaire?.sus_epineux,
  infraEpineuxTesting: bilan.testingMusculaire?.infra_epineux,
  subScapulaireTesting: bilan.testingMusculaire?.sub_scapulaire,
  testJobe: bilan.testsSpecifiques?.jobe,
  testPatte: bilan.testsSpecifiques?.patte,
  testGerber: bilan.testsSpecifiques?.gerber,
  testNeer: bilan.testsSpecifiques?.neer,
  testHawkins: bilan.testsSpecifiques?.hawkins,
  mainBouche: bilan.bilanFonctionnel?.mainBouche,
  mainTete: bilan.bilanFonctionnel?.mainTete,
  mainNuque: bilan.bilanFonctionnel?.mainNuque,
  mainDos: bilan.bilanFonctionnel?.mainDos,
  observations: bilan.observations,
});

export default function SessionDetailPage() {
  const { patientId, sessionId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("examen-clinique");
  const [session, setSession] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSessionData = async () => {
    if (!sessionId) {
      console.error("SessionId is undefined. Cannot fetch session data.");
      toast.error("Erreur: l'identifiant de session est manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sessionRes = await api.get(`/doctors/sessions/${sessionId}`);
      setSession(sessionRes.data);
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

  const fetchPatientData = async () => {
    if (!patientId) {
      console.error("PatientId is undefined. Cannot fetch patient data.");
      return;
    }

    try {
      const res = await api.get("/doctors/get-patients");
      const patientsData = res.data.patients ?? res.data.data ?? res.data;
      const foundPatient = patientsData.find(
        (p) =>
          p.userId === Number.parseInt(patientId, 10) || p.userId === patientId,
      );

      if (foundPatient) {
        setPatient(foundPatient);
      }
    } catch (err) {
      console.error("Failed to load patient data:", err);
    }
  };

  // Load session and patient data on mount
  useEffect(() => {
    fetchSessionData();
    fetchPatientData();
  }, [sessionId, patientId]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const hasSectionData = (sectionId) => {
    if (!session) return false;

    if (sectionId === "examen-complementaire") {
      return (
        Array.isArray(session.examenComplementaire) &&
        session.examenComplementaire.length > 0
      );
    }

    const sectionKey = SECTION_KEYS[sectionId];
    return Boolean(session[sectionKey]);
  };

  const handleSaveSection = async (sectionId, data) => {
    try {
      let endpoint = `/doctors/sessions/${sessionId}/${sectionId}`;
      let payload = data;
      const clampToNonNegativeInt = (value) =>
        Math.max(0, Number.parseInt(value, 10) || 0);

      if (sectionId === "physiotherapie") {
        const subTab = data?.activeSubTab || "bilan";
        endpoint = `/doctors/sessions/${sessionId}/physiotherapie/${subTab}`;

        if (subTab === "bilan") {
          payload = buildPhysiotherapieBilanPayload(data.bilan);
        } else if (subTab === "protocole") {
          payload = {
            objectifsCourt: data.protocole?.objectifsCourt,
            objectifsLong: data.protocole?.objectifsLong,
            physiotherapieAntalgique: data.protocole?.physiotherapieAntalgique,
            typesPhysio: data.protocole?.typesPhysio,
            massage: data.protocole?.massage,
            balnéotherapie: data.protocole?.balneotherapie,
            mobilisationsPassives: data.protocole?.mobilisationsPassives,
            mobilisationsActives: data.protocole?.mobilisationsActives,
            renforcement: data.protocole?.renforcement,
            proprioception: data.protocole?.proprioception,
            exercicesDetail: data.protocole?.exercicesDetail,
            seancesParSemaine: data.protocole?.seancesParSemaine,
            dureeSemaines: data.protocole?.dureeSemaines,
            orthese: data.protocole?.orthese,
            typeOrthese: data.protocole?.typeOrthese,
          };
        } else if (subTab === "resultat") {
          payload = {
            constantScoreFinal: JSON.stringify(
              data.resultat?.constantScoreFinal,
            ),
            quickDashScoreFinal: JSON.stringify(data.resultat?.quickDASHFinal),
            evaFinal: data.resultat?.evaFinale,
            evolutionDouleur: data.resultat?.evolution?.douleur,
            evolutionMobilite: data.resultat?.evolution?.mobilite,
            evolutionForce: data.resultat?.evolution?.force,
            evolutionFonction: data.resultat?.evolution?.fonction,
            antepulsionFinal: clampToNonNegativeInt(
              data.resultat?.amplitudesFinales?.antepulsion,
            ),
            abductionFinal: clampToNonNegativeInt(
              data.resultat?.amplitudesFinales?.abduction,
            ),
            rotationExterneFinal: clampToNonNegativeInt(
              data.resultat?.amplitudesFinales?.rot_ext,
            ),
            rotationInterneFinal: clampToNonNegativeInt(
              data.resultat?.amplitudesFinales?.rot_int,
            ),
            objectifsAtteints: data.resultat?.objectifsAtteints,
            conclusionKine: data.resultat?.conclusionKine,
            suitesDonnees: data.resultat?.suitesDonnees,
          };
        } else {
          throw new Error("Sous-section de physiotherapie invalide");
        }
      }

      await api.post(endpoint, payload);
      toast.success("Section sauvegardée avec succès");
      // Refresh session data
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

        {/* Main content - Two column layout */}
        <div className="grid grid-cols-4 gap-6">
          {/* Left sidebar - Navigation */}
          <div className="col-span-1">
            <div className="card p-0 overflow-hidden sticky top-8">
              <nav className="space-y-1">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
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

          {/* Right content area - Forms */}
          <div className="col-span-3">
            {CurrentFormComponent && (
              <CurrentFormComponent
                session={session}
                patient={patient}
                onSave={(data) => handleSaveSection(activeSection, data)}
              />
            )}
          </div>
        </div>
      </div>
    </SpecialistLayout>
  );
}
