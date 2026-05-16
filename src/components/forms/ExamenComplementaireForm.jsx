import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import api from "../../services/api";
import Modal from "../common/Modal";

export default function ExamenComplementaireForm({ session, patient, onSave }) {
  const [saving, setSaving] = useState(false);
  const [exams, setExams] = useState(
    session?.examenComplementaire ?? session?.examen_complementaire ?? [],
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "radiographie",
    bilanBiologiqueType: [],
    bilanBiologiqueAutre: "",
    description: "",
    resultat: "",
    date: new Date().toISOString().split("T")[0],
    files: [],
  });

  const EXAM_TYPES = [
    { value: "radiographie", label: "Radiographie" },
    { value: "echographie", label: "Échographie" },
    { value: "irm", label: "IRM" },
    { value: "arthroscanner", label: "Arthroscanner" },
    { value: "bilanBiologique", label: "Bilan biologique" },
    { value: "autre", label: "Autre" },
  ];

  const BILAN_BIOLOGIQUE_TYPES = [
    { value: "nfs", label: "NFS" },
    { value: "vs", label: "VS" },
    { value: "crp", label: "CRP" },
    { value: "glycemie", label: "Glycémie" },
    { value: "uree", label: "Urée" },
    { value: "creat", label: "Créat" },
    { value: "autre", label: "Autres" },
  ];

  const getExamTypeLabel = (examType) => {
    const normalizedType = (examType ?? "").toString().toLowerCase();
    const matchedType = EXAM_TYPES.find(
      (type) => type.value.toString().toLowerCase() === normalizedType,
    );

    if (matchedType) return matchedType.label;
    if (normalizedType === "bilan_biologique") return "Bilan biologique";

    return examType;
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" && value !== "bilanBiologique"
        ? { bilanBiologiqueType: [], bilanBiologiqueAutre: "", files: [] }
        : {}),
    }));
  };

  const handleBilanTypeToggle = (value, checked) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.bilanBiologiqueType)
        ? prev.bilanBiologiqueType.slice()
        : [];
      if (checked) {
        if (!current.includes(value)) current.push(value);
      } else {
        const idx = current.indexOf(value);
        if (idx > -1) current.splice(idx, 1);
      }
      return { ...prev, bilanBiologiqueType: current };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    const maxSize = 5 * 1024 * 1024;
    const accepted = [];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error(`Format non supporté: ${file.name}`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`Fichier trop volumineux: ${file.name} (max 5MB)`);
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...accepted] }));
  };

  const fileInputRef = useRef(null);

  const processSelectedFiles = (filesList) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    const maxSize = 5 * 1024 * 1024;
    const accepted = [];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error(`Format non supporté: ${file.name}`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`Fichier trop volumineux: ${file.name} (max 5MB)`);
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...accepted] }));
  };

  const removeFile = (index) => {
    setFormData((prev) => {
      const next = prev.files.slice();
      next.splice(index, 1);
      return { ...prev, files: next };
    });
  };

  const getBilanBiologiqueValidationError = () => {
    if (formData.type !== "bilanBiologique") {
      return null;
    }

    if (
      !Array.isArray(formData.bilanBiologiqueType) ||
      formData.bilanBiologiqueType.length === 0
    ) {
      return "Veuillez choisir au moins un type de bilan biologique";
    }

    if (
      formData.bilanBiologiqueType.includes("autre") &&
      !formData.bilanBiologiqueAutre.trim()
    ) {
      return "Veuillez préciser le type de bilan biologique";
    }

    if (!formData.resultat.trim()) {
      return "Veuillez renseigner le résultat";
    }

    if (!Array.isArray(formData.files) || formData.files.length === 0) {
      return "Veuillez ajouter au moins un fichier pour le bilan biologique";
    }

    return null;
  };

  const handleAddExam = async () => {
    if (!formData.description.trim()) {
      toast.error("Veuillez remplir la description");
      return;
    }

    const bilanError = getBilanBiologiqueValidationError();
    if (bilanError) {
      toast.error(bilanError);
      return;
    }

    try {
      setSaving(true);

      // Create FormData for multipart upload
      const multipartData = new FormData();
      multipartData.append("type", formData.type);
      if (formData.type === "bilanBiologique") {
        // send selected bilan types as comma-separated string
        multipartData.append(
          "bilanBiologiqueType",
          Array.isArray(formData.bilanBiologiqueType)
            ? formData.bilanBiologiqueType.join(",")
            : formData.bilanBiologiqueType,
        );
        if (
          Array.isArray(formData.bilanBiologiqueType) &&
          formData.bilanBiologiqueType.includes("autre")
        ) {
          multipartData.append(
            "bilanBiologiqueAutre",
            formData.bilanBiologiqueAutre,
          );
        }
      }
      multipartData.append("description", formData.description);
      multipartData.append("resultat", formData.resultat);
      multipartData.append("date", formData.date);
      if (formData.files && formData.files.length) {
        // append each file under the same key so backend can accept multiple files
        formData.files.forEach((f) => multipartData.append("files", f));
      }

      // The onSave will be called with the multipart data
      await onSave(multipartData);

      // Reset form
      setFormData({
        type: "radiographie",
        bilanBiologiqueType: [],
        bilanBiologiqueAutre: "",
        description: "",
        resultat: "",
        date: new Date().toISOString().split("T")[0],
        files: [],
      });
      setShowAddForm(false);

      // Refresh exams list
      const updatedExams = [...exams, { ...formData, id: Date.now() }];
      setExams(updatedExams);
    } catch (err) {
      console.error("Error adding exam:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    // Open modal confirmation instead of native confirm
    setPendingDelete({ id: examId, open: true });
  };

  const [pendingDelete, setPendingDelete] = useState({ id: null, open: false });

  const confirmDeleteExam = async () => {
    const examId = pendingDelete.id;
    if (!examId) return;

    try {
      setPendingDelete((p) => ({ ...p, processing: true }));
      await api.delete(`/doctors/examen-complementaire/${examId}`);
      setExams((prev) => prev.filter((e) => e.id !== examId));
      toast.success("Examen supprimé");
    } catch (err) {
      console.error("Error deleting exam:", err);
      toast.error("Erreur lors de la suppression");
    } finally {
      setPendingDelete({ id: null, open: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* List of existing exams */}
      {exams && exams.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Examens existants</h3>
          <div className="space-y-3">
            {exams.map((exam, index) => (
              <div
                key={exam.id || index}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium bg-blue-100 text-primary px-2 py-1 rounded">
                      {getExamTypeLabel(exam.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(exam.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium mb-1">
                    {exam.description}
                  </p>
                  {exam.resultat && (
                    <p className="text-sm text-gray-600">{exam.resultat}</p>
                  )}
                  {exam.fileUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        openDocument(
                          exam.fileUrl,
                          `exam-${exam.id || Date.now()}`,
                        )
                      }
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
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
                      Télécharger / ouvrir
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="text-red-500 hover:text-red-700 p-2"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new exam form */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Ajouter un examen</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {showAddForm ? "Annuler" : "Ajouter"}
          </button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type d'examen
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input-field"
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date de l'examen
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            {formData.type === "bilanBiologique" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de bilan biologique
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {BILAN_BIOLOGIQUE_TYPES.map((type) => (
                      <label
                        key={type.value}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="bilanBiologiqueType"
                          value={type.value}
                          checked={
                            Array.isArray(formData.bilanBiologiqueType) &&
                            formData.bilanBiologiqueType.includes(type.value)
                          }
                          onChange={(e) =>
                            handleBilanTypeToggle(type.value, e.target.checked)
                          }
                          className="form-checkbox"
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {Array.isArray(formData.bilanBiologiqueType) &&
                  formData.bilanBiologiqueType.includes("autre") && (
                    <div>
                      <label
                        htmlFor="bilanBiologiqueAutre"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Préciser autre bilan
                      </label>
                      <input
                        id="bilanBiologiqueAutre"
                        type="text"
                        name="bilanBiologiqueAutre"
                        value={formData.bilanBiologiqueAutre}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Ex: Bilan hépatique"
                      />
                    </div>
                  )}
              </>
            )}

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Description de l'examen..."
              />
            </div>

            <div>
              <label
                htmlFor="resultat"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Résultat
              </label>
              <textarea
                id="resultat"
                name="resultat"
                value={formData.resultat}
                onChange={handleInputChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Résultats de l'examen..."
              />
            </div>

            <div>
              <label
                htmlFor="exam-files"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fichiers (optionnel)
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition cursor-pointer"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const dropped = e.dataTransfer?.files ?? [];
                  processSelectedFiles(dropped);
                }}
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-18-8v12m0 0l3-3m-3 3l-3-3"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <label htmlFor="exam-files" className="block">
                  <span className="text-sm text-gray-500">
                    PDF ou image (max 5MB)
                  </span>
                  <input
                    id="exam-files"
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => processSelectedFiles(e.target.files)}
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                  />
                </label>
                {formData.files && formData.files.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-green-600">
                    {formData.files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>✓ {f.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-red-500 ml-3"
                        >
                          Retirer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              onClick={handleAddExam}
              disabled={saving}
              className="w-full btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ajout...
                </>
              ) : (
                "Ajouter l'examen"
              )}
            </button>
          </div>
        )}
      </div>
      {pendingDelete.open && (
        <Modal
          isOpen={pendingDelete.open}
          onClose={() => setPendingDelete({ id: null, open: false })}
          title="Confirmer la suppression"
          size="sm"
        >
          <p className="text-sm text-gray-700">
            Voulez-vous vraiment supprimer cet examen ? Cette action est
            irréversible.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPendingDelete({ id: null, open: false })}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={confirmDeleteExam}
              className="px-4 py-2 rounded-lg bg-red-600 text-white flex items-center gap-2"
              disabled={pendingDelete.processing}
            >
              {pendingDelete.processing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              Supprimer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

ExamenComplementaireForm.propTypes = {
  session: PropTypes.shape({
    examenComplementaire: PropTypes.array,
    examen_complementaire: PropTypes.array,
  }),
  patient: PropTypes.any,
  onSave: PropTypes.func.isRequired,
};
