import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import Badge from "../../components/common/Badge";
import NewSessionModal from "../../components/modals/NewSessionModal";
import EvolutionCharts from "../../components/charts/EvolutionCharts";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function PatientDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("info");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [editingPlan, setEditingPlan] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  // Try to get patient from location state first, otherwise fetch
  useEffect(() => {
    if (location.state?.patient) {
      // Patient data was passed from the list page
      setPatient(location.state.patient);
      setTreatmentPlan(location.state.patient.treatmentPlan || "");
      setLoading(false);
    } else {
      // Fetch patient by ID if not passed
      fetchPatientById();
    }

    // Fetch sessions for this patient
    fetchSessions();
  }, [id, location.state]);

  const fetchPatientById = async () => {
    try {
      setLoading(true);
      // First get all patients, then find the one with matching ID
      const res = await api.get("/doctors/get-patients");
      const patientsData = res.data.patients ?? res.data.data ?? res.data;
      const foundPatient = patientsData.find(
        (p) => p.userId === Number.parseInt(id) || p.userId === id,
      );

      if (foundPatient) {
        setPatient(foundPatient);
        setTreatmentPlan(foundPatient.treatmentPlan || "");
      } else {
        console.error("Patient not found");
      }
    } catch (err) {
      console.error("Failed to load patient:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger le patient",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get(`/doctors/patients/${id}/sessions`);
      const sessionsData = res.data.sessions || res.data || [];
      console.log("Sessions response:", sessionsData);
      if (sessionsData.length > 0) {
        console.log("First session structure:", sessionsData[0]);
        console.log("Available fields:", Object.keys(sessionsData[0]));
      }
      setSessions(sessionsData);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      // Don't show error toast if sessions endpoint doesn't exist yet
    } finally {
      setLoadingSessions(false);
    }
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      text: noteText,
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteText("");
  };

  const getMedicalHistoryItems = () => {
    return patient?.patient?.medicalHistory || [];
  };

  const getPrimaryCondition = () => {
    const history = getMedicalHistoryItems();
    return history.length > 0 ? history[0].title : "—";
  };

  const getPatientAge = () => patient?.patient?.age ?? "—";

  const openDocument = async (fileUrl, fallbackName = "document") => {
    if (!fileUrl) return;

    try {
      const response = await api.get(fileUrl, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = globalThis.URL.createObjectURL(blob);
      const contentType = blob.type || "";
      const isPreviewable =
        contentType.startsWith("image/") || contentType === "application/pdf";

      if (isPreviewable) {
        window.open(objectUrl, "_blank", "noopener,noreferrer");
      } else {
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = fallbackName;
        anchor.click();
      }

      setTimeout(() => globalThis.URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("Failed to open document:", error);
      toast.error(
        "Impossible d'ouvrir le document. Le backend doit fournir une URL publique ou signée.",
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

  if (!patient) {
    return (
      <SpecialistLayout>
        <div className="p-8 text-center text-gray-400">
          Patient introuvable.
        </div>
      </SpecialistLayout>
    );
  }

  const tabs = [
    { key: "info", label: "Informations" },
    { key: "treatment", label: "Plan de traitement" },
    { key: "notes", label: "Notes de suivi" },
    { key: "reports", label: t("patients.ai_reports") },
    { key: "dossier", label: "Dossier médical" },
    { key: "evolution", label: "Évolution" },
  ];

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
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
          {t("common.back")}
        </button>

        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary">
                {patient.fullName?.charAt(0) ?? "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.fullName}
                </h1>
                <p className="text-gray-500">
                  {getPatientAge()} ans · {getPrimaryCondition()}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge label="Actif" color="active" />
                  <span className="text-xs text-gray-400">
                    Email: {patient.email}
                  </span>
                </div>
              </div>
            </div>
            <Link
              to="/specialist/chat"
              state={{ patient }}
              className="btn-primary"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {t("patients.open_chat")}
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:text-primary"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "info" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">
                Informations personnelles
              </h3>
              <dl className="space-y-3">
                {[
                  { label: "Email", val: patient.email },
                  { label: "Téléphone", val: patient.phone || "—" },
                  {
                    label: "Genre",
                    val:
                      patient.gender === "MALE"
                        ? "Homme"
                        : patient.gender === "FEMALE"
                          ? "Femme"
                          : "—",
                  },
                  { label: "Âge", val: `${getPatientAge()} ans` },
                  {
                    label: "Taille",
                    val: patient.patient?.height
                      ? `${patient.patient.height} cm`
                      : "—",
                  },
                  {
                    label: "Poids",
                    val: patient.patient?.weight
                      ? `${patient.patient.weight} kg`
                      : "—",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <dt className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-gray-800">{item.val}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">
                {t("patients.medical_history")}
              </h3>
              {getMedicalHistoryItems().length > 0 ? (
                <div className="space-y-3">
                  {getMedicalHistoryItems().map((item, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 pb-2 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {item.title}
                      </p>
                      {item.fileUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            openDocument(
                              item.fileUrl,
                              item.title ||
                                `document-${item.category || index}`,
                            )
                          }
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
                            />
                          </svg>
                          Voir / télécharger le document
                        </button>
                      )}
                      <span className="text-xs text-gray-400 ml-2">
                        {item.category === "pdf" ? "PDF" : "Image"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun antécédent médical
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "treatment" && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                {t("patients.treatment_plan")}
              </h3>
              <button
                onClick={() => setEditingPlan(!editingPlan)}
                className="btn-secondary text-sm py-1.5"
              >
                {editingPlan ? t("common.cancel") : t("common.edit")}
              </button>
            </div>
            {editingPlan ? (
              <div className="space-y-3">
                <textarea
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Plan de traitement..."
                />
                <button
                  onClick={() => setEditingPlan(false)}
                  className="btn-primary"
                >
                  {t("common.save")}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {treatmentPlan || "Aucun plan de traitement défini."}
              </p>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">Ajouter une note</h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="input-field resize-none mb-3"
                placeholder="Observations de la séance..."
              />
              <button onClick={addNote} className="btn-primary">
                {t("common.add")}
              </button>
            </div>
            <div className="space-y-3">
              {notes.length > 0 ? (
                notes.map((note, i) => (
                  <div key={i} className="card border-l-4 border-l-primary">
                    <p className="text-xs text-gray-400 mb-1">{note.date}</p>
                    <p className="text-sm text-gray-800">{note.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Aucune note de suivi
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="card">
            <p className="text-gray-400 text-center py-8">
              {t("common.no_data")}
            </p>
          </div>
        )}

        {activeTab === "dossier" && (
          <div className="space-y-6">
            {/* Header with button */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Dossier médical
              </h2>
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nouvelle session
              </button>
            </div>

            {/* Sessions list */}
            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions
                  .toSorted(
                    (a, b) =>
                      new Date(b.sessionDate || b.date) -
                      new Date(a.sessionDate || a.date),
                  )
                  .map((session) => {
                    const sessionId =
                      session.sessionId || session.id || session._id;
                    const sessionDate = session.sessionDate || session.date;
                    return (
                      <div
                        key={sessionId}
                        onClick={() =>
                          navigate(
                            `/specialist/patients/${id}/sessions/${sessionId}`,
                          )
                        }
                        className="card cursor-pointer hover:shadow-md hover:border-primary transition group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                Session du{" "}
                                {sessionDate
                                  ? new Date(sessionDate).toLocaleDateString(
                                      "fr-FR",
                                    )
                                  : "Date inconnue"}
                              </span>
                              {session.notes && (
                                <span className="text-xs text-gray-500">
                                  {session.notes}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {session.examenClinique && (
                                <Badge label="Examen Clinique" color="active" />
                              )}
                              {session.diagnostic && (
                                <Badge label="Diagnostic" color="active" />
                              )}
                              {session.physiotherapie && (
                                <Badge label="Physiothérapie" color="active" />
                              )}
                              {session.conduiteATenir && (
                                <Badge label="Conduite" color="active" />
                              )}
                              {session.examenComplementaire?.length > 0 && (
                                <Badge
                                  label="Examen Complémentaire"
                                  color="active"
                                />
                              )}
                            </div>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-primary transition"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="card">
                <div className="text-center py-8 text-gray-400">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Aucune session créée pour ce patient</p>
                  <button
                    onClick={() => setShowNewSessionModal(true)}
                    className="text-primary hover:underline text-sm font-medium mt-2"
                  >
                    Créer la première session
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "evolution" && <EvolutionCharts patientId={id} />}
      </div>

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        patientId={id}
        onSessionCreated={() => fetchSessions()}
      />
    </SpecialistLayout>
  );
}
