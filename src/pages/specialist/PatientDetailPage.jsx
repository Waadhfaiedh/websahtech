// Redesigned following SAHTECK brand guidelines
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Badge from "../../components/common/Badge";
import NewSessionModal from "../../components/modals/NewSessionModal";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileText,
  MessageCircle,
  Plus,
  Play,
  Trash2,
  Users,
} from "lucide-react";

const CARD_SHADOW = "0 2px 12px rgba(0,82,255,0.08)";
const PAGE_BG = "#F8FAFF";
const TEXT_PRIMARY = "#0A0F1E";
const TEXT_SECONDARY = "#64748B";

export default function PatientDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("info");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [assignedExercises, setAssignedExercises] = useState([]);
  const [loadingAssignedExercises, setLoadingAssignedExercises] =
    useState(false);
  const [assignForms, setAssignForms] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // Try to get patient from location state first, otherwise fetch
  useEffect(() => {
    if (location.state?.patient) {
      // Patient data was passed from the list page
      setPatient(location.state.patient);
      setLoading(false);
    } else {
      // Fetch patient by ID if not passed
      fetchPatientById();
    }

    // Fetch sessions for this patient
    fetchSessions();
    fetchAssignedExercises();
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

  const fetchAssignedExercises = async () => {
    try {
      setLoadingAssignedExercises(true);
      const res = await api.get(`/doctors/assigned-exercises/${id}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setAssignedExercises(list);
      const forms = {};
      list.forEach((a) => {
        forms[a.assignmentId] = {
          repetitions: a.repetitions ?? 10,
          series: a.series ?? 3,
          seancesParJour: a.seancesParJour ?? 1,
          frequence: a.frequence ?? "quotidien",
          consignesDouleur: a.consignesDouleur ?? "",
          notes: a.notes ?? "",
        };
      });
      setAssignForms(forms);
    } catch (err) {
      console.error("Failed to load assigned exercises:", err);
    } finally {
      setLoadingAssignedExercises(false);
    }
  };

  const updateAssignFormValue = (assignmentId, key, value) => {
    setAssignForms((prev) => ({
      ...prev,
      [assignmentId]: { ...(prev[assignmentId] || {}), [key]: value },
    }));
  };

  const handleSaveAssignment = async (assignmentId) => {
    const formData = assignForms[assignmentId];
    if (!formData) return;
    try {
      setSavingId(assignmentId);
      await api.patch(
        `/doctors/exercises/assignments/${assignmentId}`,
        formData,
      );
      toast.success("Paramètres enregistrés !");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la sauvegarde",
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm("Retirer cet exercice du programme du patient ?"))
      return;
    try {
      setRemovingId(assignmentId);
      await api.delete(`/doctors/exercises/assignments/${assignmentId}`);
      setAssignedExercises((prev) =>
        prev.filter((a) => a.assignmentId !== assignmentId),
      );
      setAssignForms((prev) => {
        const n = { ...prev };
        delete n[assignmentId];
        return n;
      });
      if (expandedId === assignmentId) setExpandedId(null);
      toast.success("Exercice retiré.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du retrait");
    } finally {
      setRemovingId(null);
    }
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
      <div
        className="min-h-full px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center"
        style={{ background: PAGE_BG }}
      >
        <div className="w-8 h-8 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div
        className="min-h-full px-4 py-6 sm:px-6 lg:px-8"
        style={{ background: PAGE_BG }}
      >
        <div className="mx-auto max-w-6xl text-center py-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
            <Users size={48} className="text-slate-300" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            Patient introuvable.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "info", label: "Informations" },
    { key: "treatment", label: "Plan de traitement" },
    { key: "reports", label: t("patients.ai_reports") },
    { key: "dossier", label: "Dossier médical" },
  ];

  const genderLabel = (() => {
    if (patient?.gender === "MALE") return "Homme";
    if (patient?.gender === "FEMALE") return "Femme";
    return "—";
  })();

  const renderSessionsContent = () => {
    if (loadingSessions) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (sessions && sessions.length > 0) {
      return (
        <div className="space-y-3">
          {sessions
            .toSorted(
              (a, b) =>
                new Date(b.sessionDate || b.date) -
                new Date(a.sessionDate || a.date),
            )
            .map((session) => {
              const sessionId = session.sessionId || session.id || session._id;
              const sessionDate = session.sessionDate || session.date;
              return (
                <button
                  type="button"
                  key={sessionId}
                  onClick={() =>
                    navigate(`/specialist/patients/${id}/sessions/${sessionId}`)
                  }
                  className="w-full rounded-[12px] bg-white p-5 text-left transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md group"
                  style={{ boxShadow: CARD_SHADOW }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-semibold text-[#0A0F1E]">
                          {sessionDate
                            ? new Date(sessionDate).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "Date inconnue"}
                        </span>
                        {session.notes && (
                          <span className="text-xs text-[#64748B]">
                            {session.notes}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                          <Badge label="Examen Complémentaire" color="active" />
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className="text-[#0052FF] transition-transform group-hover:translate-x-0.5 flex-shrink-0 mt-0.5"
                    />
                  </div>
                </button>
              );
            })}
        </div>
      );
    }

    return (
      <div
        className="rounded-[12px] bg-white p-8 sm:p-12 text-center"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] mb-4">
          <FileText size={32} className="text-slate-300" />
        </div>
        <p className="text-sm font-medium text-[#0A0F1E] mb-3">
          Aucune session créée pour ce patient
        </p>
        <button
          onClick={() => setShowNewSessionModal(true)}
          className="inline-flex items-center gap-2 rounded-[24px] bg-[#0052FF] px-5 py-2 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#0047db]"
        >
          <Plus size={14} />
          Créer la première session
        </button>
      </div>
    );
  };

  return (
    <>
      <div
        className="min-h-full px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn"
        style={{ background: PAGE_BG }}
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#0052FF] transition-colors"
          >
            <ArrowLeft size={16} />
            {t("common.back")}
          </button>

          {/* Header Hero */}
          <section
            className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 text-white"
            style={{
              background: "linear-gradient(135deg, #0052FF, #00A3FF)",
              boxShadow: CARD_SHADOW,
            }}
          >
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 translate-x-20 -translate-y-20" />
            <div className="absolute bottom-0 left-1/2 h-28 w-28 rounded-full bg-white/10 translate-y-10" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/10 text-2xl font-bold text-white ring-2 ring-white/30">
                  {patient.fullName?.charAt(0) ?? "?"}
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-[32px]">
                    {patient.fullName}
                  </h1>
                  <p className="text-sm leading-6 text-white/80">
                    {getPatientAge()} ans · {getPrimaryCondition()}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    Email: {patient.email}
                  </div>
                </div>
              </div>

              <Link
                to="/specialist/chat"
                state={{ patient }}
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#0052FF] px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl"
              >
                <MessageCircle size={18} />
                {t("patients.open_chat")}
              </Link>
            </div>
          </section>

          {/* Tabs */}
          <div
            className="flex gap-2 rounded-[12px] bg-white p-2"
            style={{ boxShadow: CARD_SHADOW }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out ${
                  activeTab === tab.key
                    ? "bg-[#0052FF] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0052FF] hover:bg-[#F1F5F9]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "info" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div
                className="rounded-[12px] bg-white p-5 sm:p-6"
                style={{ boxShadow: CARD_SHADOW }}
              >
                <h3 className="text-lg font-semibold text-[#0A0F1E] mb-5">
                  Informations personnelles
                </h3>
                <dl className="space-y-4">
                  {[
                    { label: "Email", val: patient.email },
                    { label: "Téléphone", val: patient.phone || "—" },
                    {
                      label: "Genre",
                      val: genderLabel,
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
                    <div
                      key={item.label}
                      className="flex flex-col sm:flex-row sm:gap-4"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[#64748B] sm:w-32 sm:flex-shrink-0">
                        {item.label}
                      </dt>
                      <dd className="mt-1 sm:mt-0 text-sm font-medium text-[#0A0F1E]">
                        {item.val}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {activeTab === "treatment" && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0A0F1E]">
                Exercices assignés
              </h2>
              {loadingAssignedExercises ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : assignedExercises.length === 0 ? (
                <div
                  className="rounded-[12px] bg-white p-8 text-center"
                  style={{ boxShadow: CARD_SHADOW }}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] mb-3">
                    <FileText size={32} className="text-slate-300" />
                  </div>
                  <p className="text-sm text-[#64748B]">
                    Aucun exercice assigné à ce patient.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedExercises.map((assignment) => {
                    const ex = assignment.exercise ?? {};
                    const isExpanded = expandedId === assignment.assignmentId;
                    const form = assignForms[assignment.assignmentId] ?? {};
                    const isSaving = savingId === assignment.assignmentId;
                    const isRemoving = removingId === assignment.assignmentId;
                    return (
                      <div
                        key={assignment.assignmentId}
                        className="rounded-[12px] bg-white border-l-4 border-[#0052FF] overflow-hidden transition-all duration-200 ease-in-out hover:shadow-md"
                        style={{
                          boxShadow: isExpanded
                            ? "0 8px 30px rgba(0,82,255,0.10)"
                            : CARD_SHADOW,
                        }}
                      >
                        <button
                          className="w-full flex items-start justify-between p-5 hover:bg-[#F1F5F9] transition-colors text-left"
                          onClick={() =>
                            setExpandedId((prev) =>
                              prev === assignment.assignmentId
                                ? null
                                : assignment.assignmentId,
                            )
                          }
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="font-semibold text-[#0A0F1E] text-sm">
                                {ex.name ?? "Exercice"}
                              </span>
                              {ex.category && (
                                <span className="text-xs bg-[#EFF6FF] text-[#0052FF] px-2.5 py-1 rounded-full font-medium">
                                  {ex.category}
                                </span>
                              )}
                              {ex.side && (
                                <span className="text-xs bg-slate-100 text-[#64748B] px-2.5 py-1 rounded-full font-medium">
                                  {ex.side}
                                </span>
                              )}
                            </div>
                            {ex.description && (
                              <p className="text-xs text-[#64748B] mt-1 truncate">
                                {ex.description}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-xs text-[#64748B] font-medium">
                              <span>
                                {form.repetitions ?? assignment.repetitions}{" "}
                                rép. × {form.series ?? assignment.series} séries
                              </span>
                              <span>•</span>
                              <span>
                                {form.seancesParJour ??
                                  assignment.seancesParJour}
                                x/jour
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            {ex.videoUrl && (
                              <a
                                href={ex.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-[#0052FF] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                                title="Voir la vidéo"
                              >
                                <Play size={16} />
                              </a>
                            )}
                            <ChevronDown
                              size={18}
                              className={`text-[#0052FF] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-5 space-y-4 border-t border-slate-100 bg-[#F8FAFF]">
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              {[
                                {
                                  key: "repetitions",
                                  label: "Répétitions",
                                  min: 1,
                                  max: 100,
                                },
                                {
                                  key: "series",
                                  label: "Séries",
                                  min: 1,
                                  max: 20,
                                },
                                {
                                  key: "seancesParJour",
                                  label: "Séances / jour",
                                  min: 1,
                                  max: 5,
                                },
                              ].map(({ key, label, min, max }) => (
                                <div key={key}>
                                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                                    {label}
                                  </label>
                                  <input
                                    type="number"
                                    min={min}
                                    max={max}
                                    value={form[key] ?? ""}
                                    onChange={(e) =>
                                      updateAssignFormValue(
                                        assignment.assignmentId,
                                        key,
                                        Number.parseInt(e.target.value) || min,
                                      )
                                    }
                                    className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-transparent rounded-[8px] text-sm text-[#0A0F1E] placeholder-[#94A3B8] transition-all focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20"
                                  />
                                </div>
                              ))}
                              <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                                  Fréquence
                                </label>
                                <select
                                  value={form.frequence ?? "quotidien"}
                                  onChange={(e) =>
                                    updateAssignFormValue(
                                      assignment.assignmentId,
                                      "frequence",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-transparent rounded-[8px] text-sm text-[#0A0F1E] transition-all focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20"
                                >
                                  <option value="quotidien">Quotidien</option>
                                  <option value="2x_jour">2x / jour</option>
                                  <option value="3x_sem">3x / semaine</option>
                                  <option value="2x_sem">2x / semaine</option>
                                  <option value="1x_sem">1x / semaine</option>
                                </select>
                              </div>
                            </div>

                            {[
                              {
                                key: "consignesDouleur",
                                label: "Consignes douleur",
                                placeholder: "Seuil EVA à ne pas dépasser...",
                              },
                              {
                                key: "notes",
                                label: "Notes",
                                placeholder: "Notes supplémentaires...",
                              },
                            ].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                                  {label}
                                </label>
                                <textarea
                                  value={form[key] ?? ""}
                                  onChange={(e) =>
                                    updateAssignFormValue(
                                      assignment.assignmentId,
                                      key,
                                      e.target.value,
                                    )
                                  }
                                  rows={2}
                                  className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-transparent rounded-[8px] text-sm text-[#0A0F1E] placeholder-[#94A3B8] transition-all resize-none focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20"
                                  placeholder={placeholder}
                                />
                              </div>
                            ))}

                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() =>
                                  handleSaveAssignment(assignment.assignmentId)
                                }
                                disabled={isSaving}
                                className="flex-1 py-2.5 bg-[#0052FF] text-white text-xs font-semibold rounded-[8px] hover:bg-[#0047db] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-1.5"
                              >
                                {isSaving ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sauvegarde...
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} />
                                    Sauvegarder
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleRemoveAssignment(
                                    assignment.assignmentId,
                                  )
                                }
                                disabled={isRemoving}
                                className="px-3 py-2.5 bg-[#FEF2F2] text-[#EF4444] text-xs font-semibold rounded-[8px] hover:bg-[#FECACA] transition-all duration-200 disabled:opacity-60 flex items-center gap-1.5"
                              >
                                {isRemoving ? (
                                  <div className="w-3.5 h-3.5 border-2 border-[#EF4444] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div
              className="rounded-[12px] bg-white p-12 text-center"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] mb-3">
                <FileText size={32} className="text-slate-300" />
              </div>
              <p className="text-sm text-[#64748B]">{t("common.no_data")}</p>
            </div>
          )}

          {activeTab === "dossier" && (
            <div className="space-y-5">
              {/* Header with button */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-[#0A0F1E]">
                  Dossier médical
                </h2>
                <button
                  onClick={() => setShowNewSessionModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Plus size={18} />
                  Nouvelle session
                </button>
              </div>

              {/* Sessions list */}
              {renderSessionsContent()}
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        patientId={id}
        onSessionCreated={() => fetchSessions()}
      />
    </>
  );
}
