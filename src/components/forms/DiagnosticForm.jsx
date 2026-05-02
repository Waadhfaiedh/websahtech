import { useState } from "react";
import PropTypes from "prop-types";

export default function DiagnosticForm({ session, patient, onSave }) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    typeEpaule: session?.diagnostic?.typeEpaule ?? "douloureuse_simple",
    diagnostic: session?.diagnostic?.diagnostic ?? "",
    diagnosticDiff: session?.diagnostic?.diagnosticDiff ?? "",
    severite: session?.diagnostic?.severite ?? "moderate",
    observations: session?.diagnostic?.observations ?? "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeEpauleChange = (type) => {
    setData((prev) => ({
      ...prev,
      typeEpaule: type,
    }));
  };

  const handleSave = async () => {
    if (!data.diagnostic.trim()) {
      alert("Le diagnostic est obligatoire");
      return;
    }

    try {
      setSaving(true);
      await onSave(data);
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  const TYPES_EPAULE = [
    {
      id: "douloureuse_simple",
      label: "Douloureuse simple",
      icon: "😟",
      description: "Douleur modérée avec fonction conservée",
    },
    {
      id: "hyperalgique",
      label: "Hyperalgique",
      icon: "😣",
      description: "Douleur importante",
    },
    {
      id: "pseudo_paralytique",
      label: "Pseudo-paralytique",
      icon: "🚫",
      description: "Perte fonctionnelle avec faiblesse",
    },
    {
      id: "bloquee",
      label: "Bloquée",
      icon: "🔒",
      description: "Incapacité totale de mouvement",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Type d'épaule */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Type d'épaule</h3>
        <div className="grid grid-cols-2 gap-3">
          {TYPES_EPAULE.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeEpauleChange(type.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                data.typeEpaule === type.id
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="font-medium text-sm text-gray-900">
                {type.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Diagnostic */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Diagnostic</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="diagnostic"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Diagnostic principal *
            </label>
            <textarea
              id="diagnostic"
              name="diagnostic"
              value={data.diagnostic}
              onChange={handleInputChange}
              rows={4}
              className="input-field resize-none"
              placeholder="Description du diagnostic principal..."
            />
          </div>

          <div>
            <label
              htmlFor="diagnosticDiff"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Diagnostic différentiel
            </label>
            <textarea
              id="diagnosticDiff"
              name="diagnosticDiff"
              value={data.diagnosticDiff}
              onChange={handleInputChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Diagnostic différentiel à considérer..."
            />
          </div>

          <div>
            <label
              htmlFor="severite"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sévérité
            </label>
            <select
              id="severite"
              name="severite"
              value={data.severite}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="light">Légère</option>
              <option value="moderate">Modérée</option>
              <option value="severe">Sévère</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="observations"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Observations complémentaires
            </label>
            <textarea
              id="observations"
              name="observations"
              value={data.observations}
              onChange={handleInputChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Observations ou notes supplémentaires..."
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sauvegarde...
          </>
        ) : (
          "Sauvegarder"
        )}
      </button>
    </div>
  );
}

DiagnosticForm.propTypes = {
  session: PropTypes.shape({
    diagnostic: PropTypes.shape({
      typeEpaule: PropTypes.string,
      diagnostic: PropTypes.string,
      diagnosticDiff: PropTypes.string,
      severite: PropTypes.string,
      observations: PropTypes.string,
    }),
  }),
  patient: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
