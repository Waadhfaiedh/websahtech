import { useState } from "react";
import PropTypes from "prop-types";

function ConduiteATenirForm({ session, patient, onSave }) {
  const [saving, setSaving] = useState(false);
  const conduiteATenir =
    session?.conduiteATenir ?? session?.conduite_a_tenir ?? {};
  const [data, setData] = useState({
    // Traitement médicamenteux
    antalgiques: conduiteATenir.antalgiques ?? "",
    antiInflammatoires: conduiteATenir.antiInflammatoires ?? "",
    myorelaxants: conduiteATenir.myorelaxants ?? "",
    corticoides: conduiteATenir.corticoides ?? "",
    autresMedicaments: conduiteATenir.autresMedicaments ?? "",

    // Traitement local
    infiltration: conduiteATenir.infiltration ?? false,
    infiltrationDetail: conduiteATenir.infiltrationDetail ?? "",
    ondesDeChoc: conduiteATenir.ondesDeChoc ?? false,
    arthroDistension: conduiteATenir.arthroDistension ?? false,

    // Chirurgie
    chirurgie: conduiteATenir.chirurgie ?? false,
    typeChirurgie: conduiteATenir.typeChirurgie ?? "",

    // Recommandations
    reposRelatif: conduiteATenir.reposRelatif ?? false,
    recommandations: conduiteATenir.recommandations ?? "",
    prochainRDV: conduiteATenir.prochainRDV ?? "",
    objectifs: conduiteATenir.objectifs ?? "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(data);
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Traitement médicamenteux */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">
          Traitement médicamenteux
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="antalgiques"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Antalgiques
            </label>
            <input
              id="antalgiques"
              type="text"
              name="antalgiques"
              value={data.antalgiques}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ex: Paracétamol 500mg x3/jour"
            />
          </div>

          <div>
            <label
              htmlFor="antiInflammatoires"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Anti-inflammatoires
            </label>
            <input
              id="antiInflammatoires"
              type="text"
              name="antiInflammatoires"
              value={data.antiInflammatoires}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ex: Ibuprofène 400mg x3/jour"
            />
          </div>

          <div>
            <label
              htmlFor="myorelaxants"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Myorelaxants
            </label>
            <input
              id="myorelaxants"
              type="text"
              name="myorelaxants"
              value={data.myorelaxants}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ex: Cyclobenzaprine 5mg x2/jour"
            />
          </div>

          <div>
            <label
              htmlFor="corticoides"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Corticoïdes
            </label>
            <input
              id="corticoides"
              type="text"
              name="corticoides"
              value={data.corticoides}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ex: Cortisone si nécessaire"
            />
          </div>

          <div>
            <label
              htmlFor="autresMedicaments"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Autres médicaments
            </label>
            <textarea
              id="autresMedicaments"
              name="autresMedicaments"
              value={data.autresMedicaments}
              onChange={handleInputChange}
              rows={2}
              className="input-field resize-none"
              placeholder="Autres prescriptions..."
            />
          </div>
        </div>
      </div>

      {/* Traitement local */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Traitement local</h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="infiltration"
              checked={data.infiltration}
              onChange={handleInputChange}
              className="mt-1"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                Infiltration
              </span>
              {data.infiltration && (
                <input
                  type="text"
                  name="infiltrationDetail"
                  value={data.infiltrationDetail}
                  onChange={handleInputChange}
                  className="input-field mt-2"
                  placeholder="Détails de l'infiltration..."
                />
              )}
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="ondesDeChoc"
              checked={data.ondesDeChoc}
              onChange={handleInputChange}
            />
            <span className="text-sm font-medium text-gray-700">
              Ondes de choc
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="arthroDistension"
              checked={data.arthroDistension}
              onChange={handleInputChange}
            />
            <span className="text-sm font-medium text-gray-700">
              Arthrodistension
            </span>
          </label>
        </div>
      </div>

      {/* Chirurgie */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Chirurgie</h3>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="chirurgie"
            checked={data.chirurgie}
            onChange={handleInputChange}
            className="mt-1"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">
              Intervention chirurgicale
            </span>
            {data.chirurgie && (
              <input
                type="text"
                name="typeChirurgie"
                value={data.typeChirurgie}
                onChange={handleInputChange}
                className="input-field mt-2"
                placeholder="Type d'intervention..."
              />
            )}
          </div>
        </label>
      </div>

      {/* Recommandations */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Recommandations</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="reposRelatif"
              checked={data.reposRelatif}
              onChange={handleInputChange}
            />
            <span className="text-sm font-medium text-gray-700">
              Repos relatif
            </span>
          </label>

          <div>
            <label
              htmlFor="recommandations"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Recommandations
            </label>
            <textarea
              id="recommandations"
              name="recommandations"
              value={data.recommandations}
              onChange={handleInputChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Consignes et recommandations pour le patient..."
            />
          </div>

          <div>
            <label
              htmlFor="prochainRDV"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prochain rendez-vous
            </label>
            <input
              id="prochainRDV"
              type="date"
              name="prochainRDV"
              value={data.prochainRDV}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div>
            <label
              htmlFor="objectifs"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Objectifs de la prise en charge
            </label>
            <textarea
              id="objectifs"
              name="objectifs"
              value={data.objectifs}
              onChange={handleInputChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Objectifs thérapeutiques..."
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

ConduiteATenirForm.propTypes = {
  session: PropTypes.object,
  patient: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default ConduiteATenirForm;
