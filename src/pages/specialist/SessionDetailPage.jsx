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

export default function SessionDetailPage() {
  const { patientId, sessionId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("examen-clinique");
  const [session, setSession] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session and patient data on mount
  useEffect(() => {
    fetchSessionData();
    fetchPatientData();
  }, [sessionId, patientId]);

  const fetchSessionData = async () => {
    // Guard: prevent API call if sessionId is undefined
    if (!sessionId) {
      console.error("SessionId is undefined. Cannot fetch session data.");
      toast.error("Erreur: l'identifiant de session est manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching session with ID:", sessionId);
      // Fetch session details using doctor-prefixed endpoint
      const sessionRes = await api.get(`/doctors/sessions/${sessionId}`);
      console.log("Session data received:", sessionRes.data);
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
      // Fetch all patients and find the one matching this patientId
      const res = await api.get("/doctors/get-patients");
      const patientsData = res.data.patients ?? res.data.data ?? res.data;
      const foundPatient = patientsData.find(
        (p) =>
          p.userId === Number.parseInt(patientId) || p.userId === patientId,
      );

      if (foundPatient) {
        console.log("Patient data loaded:", foundPatient);
        setPatient(foundPatient);
      } else {
        console.warn("Patient not found with ID:", patientId);
      }
    } catch (err) {
      console.error("Failed to load patient data:", err);
    }
  };

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
          payload = {
            plainte: data.bilan?.plainte,
            historique: data.bilan?.historique,
            intensiteEVA: data.bilan?.intensiteEVA,
            constantScore: JSON.stringify(data.bilan?.constantScore),
            quickDashScore: JSON.stringify(data.bilan?.quickDASH),
            dashArabeScore: JSON.stringify(data.bilan?.dashArabeScore),
            antepulsionActive:
              data.bilan?.mobiliteArticulaire?.antepulsion_active,
            antepulsionPassive:
              data.bilan?.mobiliteArticulaire?.antepulsion_passive,
            abductionActive: data.bilan?.mobiliteArticulaire?.abduction_active,
            abductionPassive:
              data.bilan?.mobiliteArticulaire?.abduction_passive,
            retractionActive:
              data.bilan?.mobiliteArticulaire?.retraction_active,
            retractionPassive:
              data.bilan?.mobiliteArticulaire?.retraction_passive,
            rotationExterneActive:
              data.bilan?.mobiliteArticulaire?.rot_ext_active,
            rotationExternePassive:
              data.bilan?.mobiliteArticulaire?.rot_ext_passive,
            rotationInterneActive:
              data.bilan?.mobiliteArticulaire?.rot_int_active,
            rotationInternePassive:
              data.bilan?.mobiliteArticulaire?.rot_int_passive,
            deltoideTesting: data.bilan?.testingMusculaire?.deltoides,
            susEpineuxTesting: data.bilan?.testingMusculaire?.sus_epineux,
            infraEpineuxTesting: data.bilan?.testingMusculaire?.infra_epineux,
            subScapulaireTesting: data.bilan?.testingMusculaire?.sub_scapulaire,
            testJobe: data.bilan?.testsSpecifiques?.jobe,
            testPatte: data.bilan?.testsSpecifiques?.patte,
            testGerber: data.bilan?.testsSpecifiques?.gerber,
            testNeer: data.bilan?.testsSpecifiques?.neer,
            testHawkins: data.bilan?.testsSpecifiques?.hawkins,
            mainBouche: data.bilan?.bilanFonctionnel?.mainBouche,
            mainTete: data.bilan?.bilanFonctionnel?.mainTete,
            mainNuque: data.bilan?.bilanFonctionnel?.mainNuque,
            mainDos: data.bilan?.bilanFonctionnel?.mainDos,
            observations: data.bilan?.observations,
          };
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
