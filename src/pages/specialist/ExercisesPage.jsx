import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import { mockPatients } from "../../services/mockData";
import api from "../../services/api";

// ── Enum maps ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS = {
  NECK: "Cou",
  LEFT_SHOULDER: "Épaule gauche",
  RIGHT_SHOULDER: "Épaule droite",
  BACK: "Dos",
  LEFT_ELBOW: "Coude gauche",
  RIGHT_ELBOW: "Coude droit",
  RIGHT_CHEST: "Poitrine droite",
  LEFT_CHEST: "Poitrine gauche",
  RIGHT_WRIST: "Poignet droit",
  LEFT_WRIST: "Poignet gauche",
  LEFT_HIP: "Hanche gauche",
  RIGHT_HIP: "Hanche droite",
  LEFT_KNEE: "Genou gauche",
  RIGHT_KNEE: "Genou droit",
  RIGHT_FOOT: "Pied droit",
  LEFT_FOOT: "Pied gauche",
};

const SIDE_LABELS = {
  BACK: "Dos",
  FRONT: "Face",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);
const ALL_SIDES = Object.keys(SIDE_LABELS);

// ── Video URL helpers ─────────────────────────────────────────────────────────

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  // https://www.youtube.com/watch?v=ID  or  https://youtu.be/ID
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const isExternalLink = (url) => {
  if (!url) return false;
  // URLs that can't be played natively: YouTube, Vimeo, Dailymotion…
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com/.test(url);
};

// ── Video block ───────────────────────────────────────────────────────────────

const VideoBlock = ({ videoUrl }) => {
  const [videoError, setVideoError] = useState(false);

  if (!videoUrl || videoError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
          />
        </svg>
        <span className="text-xs text-gray-400">Pas de vidéo</span>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="exercise video"
      />
    );
  }

  if (isExternalLink(videoUrl)) {
    // Unsupported embed — open externally
    return (
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full flex flex-col items-center justify-center gap-2 text-primary hover:text-primary/70 transition-colors"
      >
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-xs font-medium">Voir la vidéo</span>
      </a>
    );
  }

  // Native video (MinIO or direct file URL)
  return (
    <video
      src={videoUrl}
      className="w-full h-full object-cover"
      controls
      preload="metadata"
      onError={() => setVideoError(true)}
    />
  );
};

VideoBlock.propTypes = {
  videoUrl: PropTypes.string,
};

// ── My-exercise card ──────────────────────────────────────────────────────────

const MyExerciseCard = ({
  exercise,
  onAssign,
  assignLabel,
  onEdit,
  onDelete,
}) => {
  const categories = toArrStatic(exercise.category);
  const sides = toArrStatic(exercise.side);
  const assigned = exercise.assignedTo ?? [];
  const MAX_AVATARS = 4;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group">
      {/* ── Video / thumbnail ── */}
      <div className="relative w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
        <VideoBlock videoUrl={exercise.videoUrl} />

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex gap-1">
          {exercise.isPublic && (
            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
              Public
            </span>
          )}
        </div>
        {sides.length > 0 && (
          <div className="absolute top-2 right-2 flex gap-1">
            {sides.map((s) => (
              <span
                key={s}
                className="text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full font-medium backdrop-blur-sm"
              >
                {SIDE_LABELS[s] ?? s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug">
          {exercise.name}
        </h3>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold"
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {exercise.description ? (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
            {exercise.description}
          </p>
        ) : (
          <p className="text-xs text-gray-300 italic flex-1">
            Aucune description
          </p>
        )}

        {/* ── Assigned patients ── */}
        <div className="pt-2 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 font-medium mb-2 uppercase tracking-wide">
            Patients assignés ({assigned.length})
          </p>
          {assigned.length === 0 ? (
            <p className="text-xs text-gray-300 italic">Aucun patient</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {/* Avatar stack row */}
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {assigned.slice(0, MAX_AVATARS).map((p) =>
                    p.user.imageUrl ? (
                      <img
                        key={p.userId}
                        src={p.user.imageUrl}
                        alt={p.user.fullName}
                        title={p.user.fullName}
                        className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-gray-100"
                      />
                    ) : (
                      <div
                        key={p.userId}
                        title={p.user.fullName}
                        className="w-7 h-7 rounded-full bg-primary/15 border-2 border-white ring-1 ring-gray-100 flex items-center justify-center"
                      >
                        <span className="text-[10px] text-primary font-bold">
                          {p.user.fullName?.charAt(0) ?? "?"}
                        </span>
                      </div>
                    ),
                  )}
                  {assigned.length > MAX_AVATARS && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] text-gray-500 font-semibold">
                        +{assigned.length - MAX_AVATARS}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Patient name list (up to 3) */}
              <div className="flex flex-col gap-0.5">
                {assigned.slice(0, 3).map((p) => (
                  <span
                    key={p.userId}
                    className="text-[11px] text-gray-600 leading-tight truncate"
                  >
                    • {p.user.fullName}
                  </span>
                ))}
                {assigned.length > 3 && (
                  <span className="text-[11px] text-gray-400 italic">
                    +{assigned.length - 3} autres…
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assign button */}
        {onAssign && (
          <button
            onClick={() => onAssign(exercise)}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
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
            {assignLabel}
          </button>
        )}
        {/* Edit / Delete actions */}
        <div className="mt-2 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(exercise)}
              className="flex-1 py-2 rounded-lg border text-sm font-medium hover:bg-primary/5"
            >
              Éditer
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(exercise.exerciseId, exercise.name)}
              className="flex-1 py-2 rounded-lg border text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

MyExerciseCard.propTypes = {
  exercise: PropTypes.shape({
    exerciseId: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    videoUrl: PropTypes.string,
    isPublic: PropTypes.bool,
    category: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    side: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    assignedTo: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string,
        user: PropTypes.shape({
          fullName: PropTypes.string,
          imageUrl: PropTypes.string,
        }),
      }),
    ),
  }).isRequired,
  onAssign: PropTypes.func,
  assignLabel: PropTypes.string,
};

// ── Public-exercise card ──────────────────────────────────────────────────────

const toArrStatic = (val) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

const PublicExerciseCard = ({ exercise, onAssign, assignLabel }) => {
  const categories = toArrStatic(exercise.category);
  const sides = toArrStatic(exercise.side);
  const specialist = exercise.specialist?.user;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group">
      {/* ── Video / thumbnail ── */}
      <div className="relative w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
        <VideoBlock videoUrl={exercise.videoUrl} />

        {/* Side badge overlay */}
        {sides.length > 0 && (
          <div className="absolute top-2 right-2 flex gap-1">
            {sides.map((s) => (
              <span
                key={s}
                className="text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full font-medium backdrop-blur-sm"
              >
                {SIDE_LABELS[s] ?? s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug">
          {exercise.name}
        </h3>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold"
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {exercise.description ? (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
            {exercise.description}
          </p>
        ) : (
          <p className="text-xs text-gray-300 italic flex-1">
            Aucune description
          </p>
        )}

        {/* ── Footer ── */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
          {/* Specialist — full width so name never truncates */}
          {specialist && (
            <div className="flex items-center gap-2">
              {specialist.imageUrl ? (
                <img
                  src={specialist.imageUrl}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                  <span className="text-[11px] text-primary font-bold">
                    {specialist.fullName?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
              <div>
                <p className="text-[10px] text-gray-400 leading-none">
                  Créé par
                </p>
                <p className="text-xs text-gray-700 font-semibold leading-tight mt-0.5">
                  {specialist.fullName}
                </p>
              </div>
            </div>
          )}

          {/* Assign button — full width */}
          {onAssign && (
            <button
              onClick={() => onAssign(exercise)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
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
              {assignLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

PublicExerciseCard.propTypes = {
  exercise: PropTypes.shape({
    exerciseId: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    videoUrl: PropTypes.string,
    category: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    side: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    specialist: PropTypes.object,
  }).isRequired,
  onAssign: PropTypes.func,
  assignLabel: PropTypes.string,
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("my");

  // My-exercises state
  const [myExercises, setMyExercises] = useState([]);
  const [myLoading, setMyLoading] = useState(true);
  const [myError, setMyError] = useState(null);

  // Public-exercises state
  const [publicExercises, setPublicExercises] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState(null);
  const [publicFetched, setPublicFetched] = useState(false);

  // Filters (search tab)
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSide, setFilterSide] = useState("");

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { exerciseId, name }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Assign modal state
  const [assignPatients, setAssignPatients] = useState([]);
  const [assignPatientsLoading, setAssignPatientsLoading] = useState(false);
  const [assignPatientsError, setAssignPatientsError] = useState(null);
  const [assignSearchQuery, setAssignSearchQuery] = useState("");
  const [assigningExerciseLoading, setAssigningExerciseLoading] =
    useState(false);

  const EMPTY_FORM = {
    name: "",
    description: "",
    videoUrl: "",
    videoFile: null,
    videoMode: "url", // "url" | "file"
    categories: [],
    sides: [],
    isPublic: false,
  };
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);

  // Helper to open the add modal for editing
  const openEdit = (exercise) => {
    setEditingExercise(exercise);
    setAddForm({
      name: exercise.name || "",
      description: exercise.description || "",
      videoUrl: exercise.videoUrl || "",
      videoFile: null,
      videoMode: exercise.videoUrl ? "url" : "file",
      categories: Array.isArray(exercise.category)
        ? exercise.category
        : exercise.category
          ? [exercise.category]
          : [],
      sides: Array.isArray(exercise.side)
        ? exercise.side
        : exercise.side
          ? [exercise.side]
          : [],
      isPublic: !!exercise.isPublic,
    });
    setShowAdd(true);
  };

  // Fetch my exercises
  useEffect(() => {
    const fetchMy = async () => {
      try {
        setMyLoading(true);
        setMyError(null);
        const response = await api.get("/doctors/exercises");
        setMyExercises(response.data);
      } catch (err) {
        setMyError(err.response?.data?.message || "Failed to load exercises");
      } finally {
        setMyLoading(false);
      }
    };
    fetchMy();
  }, []);

  // Fetch public exercises once when search tab is first opened
  useEffect(() => {
    if (activeTab !== "search" || publicFetched) return;
    const fetchPublic = async () => {
      try {
        setPublicLoading(true);
        setPublicError(null);
        const response = await api.get("/users/public-exercises");
        console.log("[public-exercises] raw sample:", response.data?.[0]);
        setPublicExercises(response.data);
        setPublicFetched(true);
      } catch (err) {
        setPublicError(
          err.response?.data?.message || "Failed to load public exercises",
        );
      } finally {
        setPublicLoading(false);
      }
    };
    fetchPublic();
  }, [activeTab, publicFetched]);

  // Fetch doctor's patients when showAssign modal opens
  useEffect(() => {
    if (!showAssign) {
      setAssignPatients([]);
      setAssignSearchQuery("");
      return;
    }

    const fetchPatients = async () => {
      try {
        setAssignPatientsLoading(true);
        setAssignPatientsError(null);
        const response = await api.get("/doctors/get-patients");
        console.log("[get-patients] response:", response.data);

        // Extract patients array from response: { patients, count }
        const patientsArray = response.data?.patients || [];
        setAssignPatients(patientsArray);
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Failed to load patients";
        setAssignPatientsError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setAssignPatientsLoading(false);
      }
    };

    fetchPatients();
  }, [showAssign]);

  // Normalize any value (string | string[] | null) to a string[]
  const toArr = (val) => {
    if (!val) return [];
    return Array.isArray(val) ? val.map(String) : [String(val)];
  };

  // Filtered results (client-side)
  const filteredExercises = useMemo(() => {
    return publicExercises.filter((ex) => {
      const matchName =
        searchName.trim() === "" ||
        ex.name?.toLowerCase().includes(searchName.toLowerCase());
      const cats = toArr(ex.category).map((c) => c.toUpperCase());
      const sides = toArr(ex.side).map((s) => s.toUpperCase());
      const matchCategory =
        filterCategory === "" || cats.includes(filterCategory.toUpperCase());
      const matchSide =
        filterSide === "" || sides.includes(filterSide.toUpperCase());
      return matchName && matchCategory && matchSide;
    });
  }, [publicExercises, searchName, filterCategory, filterSide]);

  const toggleCategory = (cat) =>
    setAddForm((p) => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter((c) => c !== cat)
        : [...p.categories, cat],
    }));

  const toggleSide = (side) =>
    setAddForm((p) => ({
      ...p,
      sides: p.sides.includes(side)
        ? p.sides.filter((s) => s !== side)
        : [...p.sides, side],
    }));

  // Filter patients by search query
  const filteredAssignPatients = useMemo(() => {
    if (!Array.isArray(assignPatients)) return [];
    return assignPatients.filter((p) => {
      const query = assignSearchQuery.toLowerCase().trim();
      if (query === "") return true;
      const fullName = (p.fullName || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [assignPatients, assignSearchQuery]);

  const handleAssignExercise = async (patientId) => {
    if (!showAssign) return;

    try {
      setAssigningExerciseLoading(true);
      await api.patch("/doctors/assign-exercise", {
        patientId,
        exerciceId: showAssign.exerciseId, // Note: backend uses 'exerciceId' (typo)
      });
      toast.success(`Exercice assigné au patient !`);
      setShowAssign(null);
      setAssignSearchQuery("");

      // Refresh my exercises list
      const response = await api.get("/doctors/exercises");
      setMyExercises(response.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de l'assignation",
      );
    } finally {
      setAssigningExerciseLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) {
      toast.error("Le nom est obligatoire.");
      return;
    }
    if (addForm.categories.length === 0) {
      toast.error("Sélectionnez au moins une catégorie.");
      return;
    }
    if (addForm.sides.length === 0) {
      toast.error("Sélectionnez au moins un côté.");
      return;
    }

    // Determine video source based on actual values, not mode toggle state
    const trimmedUrl = addForm.videoUrl.trim();
    const hasUrl = trimmedUrl.length > 0;
    const hasFile = !!addForm.videoFile;

    if (!hasUrl && !hasFile) {
      toast.error("Fournissez un lien vidéo ou téléchargez un fichier.");
      return;
    }

    try {
      setAddLoading(true);

      // If a file is selected, use multipart/form-data. Otherwise send JSON (arrays and booleans validate properly server-side).
      if (hasFile) {
        const fd = new FormData();
        fd.append("name", addForm.name.trim());
        fd.append("description", addForm.description.trim());
        addForm.categories.forEach((cat) => fd.append("category", cat));
        addForm.sides.forEach((side) => fd.append("side", side));
        fd.append("isPublic", String(Boolean(addForm.isPublic)));
        fd.append("video", addForm.videoFile);

        if (editingExercise) {
          const res = await api.patch(
            `/doctors/exercises/${editingExercise.exerciseId}`,
            fd,
          );
          setMyExercises((prev) =>
            prev.map((e) =>
              e.exerciseId === res.data.exerciseId ? res.data : e,
            ),
          );
          toast.success("Exercice mis à jour avec succès !");
        } else {
          const res = await api.post("/doctors/exercises", fd);
          setMyExercises((prev) => [res.data, ...prev]);
          toast.success("Exercice créé avec succès !");
        }
      } else {
        // JSON payload
        const payload = {
          name: addForm.name.trim(),
          description: addForm.description.trim(),
          isPublic: Boolean(addForm.isPublic),
          category: addForm.categories,
          side: addForm.sides,
          videoUrl: trimmedUrl || null,
        };

        if (editingExercise) {
          const res = await api.patch(
            `/doctors/exercises/${editingExercise.exerciseId}`,
            payload,
          );
          setMyExercises((prev) =>
            prev.map((e) =>
              e.exerciseId === res.data.exerciseId ? res.data : e,
            ),
          );
          toast.success("Exercice mis à jour avec succès !");
        } else {
          const res = await api.post("/doctors/exercises", payload);
          setMyExercises((prev) => [res.data, ...prev]);
          toast.success("Exercice créé avec succès !");
        }
      }

      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      setEditingExercise(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setAddLoading(false);
    }
  };

  // open delete confirmation modal
  const handleDeleteExercise = (exerciseId, name) => {
    if (!exerciseId) return;
    setDeleteTarget({ exerciseId, name });
    setShowDeleteConfirm(true);
  };

  // confirm deletion (called from modal)
  const confirmDelete = async () => {
    if (!deleteTarget?.exerciseId) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/doctors/exercises/${deleteTarget.exerciseId}`);
      setMyExercises((prev) =>
        prev.filter((e) => e.exerciseId !== deleteTarget.exerciseId),
      );
      toast.success("Exercice supprimé.");
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t("exercises.title")}
          action={
            activeTab === "my" && (
              <button onClick={() => setShowAdd(true)} className="btn-primary">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("exercises.add_exercise")}
              </button>
            )
          }
        />

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "my" ? "bg-primary text-white" : "text-gray-600 hover:text-primary"}`}
          >
            {t("exercises.my_exercises")}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "search" ? "bg-primary text-white" : "text-gray-600 hover:text-primary"}`}
          >
            {t("exercises.search_exercises")}
          </button>
        </div>

        {/* ── My Exercises tab ── */}
        {activeTab === "my" && (
          <div>
            {myLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-600">
                  {t("common.loading")}
                </span>
              </div>
            )}
            {myError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {myError}
              </div>
            )}
            {!myLoading && !myError && myExercises.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>{t("exercises.no_exercises")}</p>
              </div>
            )}
            {!myLoading && !myError && myExercises.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {myExercises.map((ex) => (
                  <MyExerciseCard
                    key={ex.exerciseId}
                    exercise={ex}
                    assignLabel={t("exercises.assign")}
                    onAssign={setShowAssign}
                    onEdit={openEdit}
                    onDelete={handleDeleteExercise}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Search / Public Exercises tab ── */}
        {activeTab === "search" && (
          <div>
            {/* Filters bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 space-y-4">
              {/* Name search */}
              <div className="relative">
                <svg
                  className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="input-field pl-11 py-2.5"
                  placeholder="Rechercher par nom..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Category filter */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="input-field py-2"
                  >
                    <option value="">Toutes les catégories</option>
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Side filter — linked with category (AND logic) */}
                <div className="sm:w-56">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Côté
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterSide("")}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        filterSide === ""
                          ? "bg-primary text-white border-primary"
                          : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                      }`}
                    >
                      Tous
                    </button>
                    {ALL_SIDES.map((side) => (
                      <button
                        key={side}
                        onClick={() =>
                          setFilterSide(filterSide === side ? "" : side)
                        }
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                          filterSide === side
                            ? "bg-primary text-white border-primary"
                            : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {SIDE_LABELS[side]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filter chips + clear */}
              {(filterCategory || filterSide || searchName) && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-gray-400">
                    Filtres actifs :
                  </span>
                  {searchName && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      "{searchName}"
                      <button
                        onClick={() => setSearchName("")}
                        className="hover:text-primary/60"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filterCategory && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {CATEGORY_LABELS[filterCategory]}
                      <button
                        onClick={() => setFilterCategory("")}
                        className="hover:text-primary/60"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filterSide && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {SIDE_LABELS[filterSide]}
                      <button
                        onClick={() => setFilterSide("")}
                        className="hover:text-primary/60"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchName("");
                      setFilterCategory("");
                      setFilterSide("");
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 underline ml-1"
                  >
                    Tout effacer
                  </button>
                </div>
              )}
            </div>

            {/* Results */}
            {publicLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-600">
                  {t("common.loading")}
                </span>
              </div>
            )}
            {publicError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {publicError}
              </div>
            )}
            {!publicLoading &&
              !publicError &&
              filteredExercises.length === 0 && (
                <div className="text-center py-16 text-gray-400">
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
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm">Aucun exercice trouvé</p>
                </div>
              )}
            {!publicLoading && !publicError && filteredExercises.length > 0 && (
              <>
                <p className="text-xs text-gray-400 mb-3">
                  {filteredExercises.length} exercice
                  {filteredExercises.length > 1 ? "s" : ""} trouvé
                  {filteredExercises.length > 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredExercises.map((ex) => (
                    <PublicExerciseCard
                      key={ex.exerciseId}
                      exercise={ex}
                      assignLabel={t("exercises.assign")}
                      onAssign={setShowAssign}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Add modal ── */}
        <Modal
          isOpen={showAdd}
          onClose={() => {
            setShowAdd(false);
            setAddForm(EMPTY_FORM);
            setEditingExercise(null);
          }}
          title={
            editingExercise
              ? "Modifier l'exercice"
              : t("exercises.add_exercise")
          }
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, name: e.target.value }))
                }
                className="input-field"
                placeholder="Ex : Flexion du poignet"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="input-field resize-none"
                placeholder="Instructions de l'exercice…"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                      addForm.categories.includes(cat)
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sides */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Côté <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {ALL_SIDES.map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => toggleSide(side)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      addForm.sides.includes(side)
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {SIDE_LABELS[side]}
                  </button>
                ))}
              </div>
            </div>

            {/* Video source toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vidéo <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                {[
                  { val: "url", label: "Lien externe" },
                  { val: "file", label: "Fichier vidéo" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() =>
                      setAddForm((p) => ({
                        ...p,
                        videoMode: opt.val,
                        videoUrl: "",
                        videoFile: null,
                      }))
                    }
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      addForm.videoMode === opt.val
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {addForm.videoMode === "url" ? (
                <input
                  value={addForm.videoUrl}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, videoUrl: e.target.value }))
                  }
                  className="input-field"
                  placeholder="https://youtube.com/…"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    id="video-upload"
                    className="hidden"
                    onChange={(e) =>
                      setAddForm((p) => ({
                        ...p,
                        videoFile: e.target.files?.[0] ?? null,
                      }))
                    }
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <svg
                      className="w-8 h-8 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                      />
                    </svg>
                    {addForm.videoFile ? (
                      <span className="text-sm text-primary font-medium">
                        {addForm.videoFile.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Cliquer pour sélectionner (max 200 Mo)
                      </span>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* isPublic toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() =>
                  setAddForm((p) => ({ ...p, isPublic: !p.isPublic }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${addForm.isPublic ? "bg-primary" : "bg-gray-200"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${addForm.isPublic ? "translate-x-5" : ""}`}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Exercice public{addForm.isPublic ? " — visible par tous" : ""}
              </span>
            </label>

            {/* Submit */}
            <button
              onClick={handleAdd}
              disabled={addLoading}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {addLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {editingExercise ? "Mise à jour…" : "Création…"}
                </span>
              ) : editingExercise ? (
                "Modifier"
              ) : (
                t("common.add")
              )}
            </button>
          </div>
        </Modal>
        {/* ── Delete confirmation modal ── */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }}
          title={
            deleteTarget
              ? `Supprimer : ${deleteTarget.name}`
              : "Supprimer l'exercice"
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Cette action est irréversible. Confirmez la suppression de
              l'exercice.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-2 rounded-lg border text-sm font-medium"
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-60"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </Modal>

        {/* ── Assign modal ── */}
        <Modal
          isOpen={!!showAssign}
          onClose={() => setShowAssign(null)}
          title={`Assigner : ${showAssign?.title ?? showAssign?.name}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <p className="text-sm text-gray-600">Sélectionner un patient :</p>

            {/* Search input */}
            <div className="relative">
              <svg
                className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={assignSearchQuery}
                onChange={(e) => setAssignSearchQuery(e.target.value)}
                className="input-field pl-11 py-2.5"
                placeholder="Rechercher par nom ou email..."
              />
            </div>

            {/* Loading state */}
            {assignPatientsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm text-gray-600">
                  {t("common.loading")}
                </span>
              </div>
            )}

            {/* No patients */}
            {!assignPatientsLoading &&
              !assignPatientsError &&
              assignPatients.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <svg
                    className="w-10 h-10 mx-auto mb-2 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-sm">Aucun patient trouvé</p>
                </div>
              )}

            {/* No results after search */}
            {!assignPatientsLoading &&
              !assignPatientsError &&
              assignPatients.length > 0 &&
              filteredAssignPatients.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">
                    Aucun patient ne correspond à votre recherche
                  </p>
                </div>
              )}

            {/* Patient list */}
            {!assignPatientsLoading &&
              !assignPatientsError &&
              filteredAssignPatients.length > 0 && (
                <div className="space-y-2">
                  {filteredAssignPatients.map((p) => {
                    const lastAppointment = p.patient?.appointments?.[0];
                    return (
                      <button
                        key={p.userId}
                        onClick={() => handleAssignExercise(p.userId)}
                        disabled={assigningExerciseLoading}
                        className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-sm font-bold">
                            {p.fullName?.charAt(0) ?? "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">
                            {p.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {p.email}
                          </p>
                          {lastAppointment?.reason && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              Motif: {lastAppointment.reason}
                            </p>
                          )}
                        </div>
                        {assigningExerciseLoading && (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
