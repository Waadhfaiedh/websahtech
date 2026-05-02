import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function NewSessionModal({
  isOpen,
  onClose,
  patientId,
  onSessionCreated,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const response = await api.post(
        `/doctors/patients/${patientId}/sessions`,
        formData,
      );

      console.log("Session creation response:", response.data);

      // Try multiple possible session ID field names
      const newSessionId =
        response.data.sessionId || response.data.id || response.data._id;

      if (!newSessionId) {
        console.error(
          "Session ID not found in response. Available fields:",
          Object.keys(response.data),
        );
        toast.error(
          "Erreur: l'identifiant de session n'a pas pu être extrait de la réponse",
        );
        return;
      }

      toast.success("Session créée avec succès");

      if (onSessionCreated) {
        onSessionCreated(response.data);
      }

      // Navigate to the new session
      navigate(`/specialist/patients/${patientId}/sessions/${newSessionId}`);
      onClose();
    } catch (err) {
      console.error("Failed to create session:", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la création de la session",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Nouvelle session</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de la session
            </label>
            <input
              type="date"
              name="sessionDate"
              value={formData.sessionDate}
              onChange={handleInputChange}
              disabled={loading}
              className="input-field disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
              className="input-field resize-none disabled:opacity-50"
              placeholder="Notes préliminaires..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création...
              </>
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
