import { useState } from "react";
import PropTypes from "prop-types";

export default function ExamenCliniqueForm({ session, patient, onSave }) {
  const [saving, setSaving] = useState(false);
  const examenClinique =
    session?.examenClinique ?? session?.examen_clinique ?? {};

  const parseStoredJson = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value !== "string") return value;

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const activeMobilite = parseStoredJson(examenClinique.mobiliteActive, {});
  const passiveMobilite = parseStoredJson(examenClinique.mobilitePassive, {});
  const testsConflits = parseStoredJson(examenClinique.testConflits, {
    neer: false,
    hawkins: false,
    yocum: false,
  });
  const testsTendineux = parseStoredJson(examenClinique.testsTendineux, {
    jobe: false,
    patte: false,
    gerber: false,
    palmUp: false,
  });

  const [data, setData] = useState({
    // Interrogatoire - pre-filled from patient data if available
    age: examenClinique.age ?? patient?.patient?.age ?? "",
    sexe: examenClinique.sexe ?? patient?.gender ?? "MALE",
    profession: examenClinique.profession ?? "",
    membreDominant: examenClinique.membreDominant ?? "DROIT",
    activiteSportive: examenClinique.activiteSportive ?? "",
    couvertureSociale: examenClinique.couvertureSociale ?? "",

    // Douleur
    siegeDouleur: examenClinique.siegeDouleur ?? "",
    irradiation: examenClinique.irradiation ?? "",
    intensiteEVA: examenClinique.intensiteEVA ?? 5,
    typeRythme: examenClinique.typeRythme ?? "mecanique",
    facteurAggravant: examenClinique.facteurAggravant ?? "",
    facteurSoulagement: examenClinique.facteurSoulagement ?? "",
    debutDouleur: examenClinique.debutDouleur ?? "progressif",

    // Retentissement
    retentissementAVQ: examenClinique.retentissementAVQ ?? false,
    retentissementProfessionnel: examenClinique.retentissementPro ?? false,
    retentissementSommeil: examenClinique.retentissementSommeil ?? false,

    // Mobilité
    mobilite: {
      antepu_active:
        activeMobilite.antepu_active ?? passiveMobilite.antepu_active ?? 0,
      antepu_passive:
        passiveMobilite.antepu_passive ?? activeMobilite.antepu_passive ?? 0,
      abduction_active:
        activeMobilite.abduction_active ??
        passiveMobilite.abduction_active ??
        0,
      abduction_passive:
        passiveMobilite.abduction_passive ??
        activeMobilite.abduction_passive ??
        0,
      retraction_active:
        activeMobilite.retraction_active ??
        passiveMobilite.retraction_active ??
        0,
      retraction_passive:
        passiveMobilite.retraction_passive ??
        activeMobilite.retraction_passive ??
        0,
      rot_ext_active:
        activeMobilite.rot_ext_active ?? passiveMobilite.rot_ext_active ?? 0,
      rot_ext_passive:
        passiveMobilite.rot_ext_passive ?? activeMobilite.rot_ext_passive ?? 0,
      rot_int_active:
        activeMobilite.rot_int_active ?? passiveMobilite.rot_int_active ?? 0,
      rot_int_passive:
        passiveMobilite.rot_int_passive ?? activeMobilite.rot_int_passive ?? 0,
    },

    // Tests de conflit
    testsConflits,

    // Tests tendineux
    testsTendineux,

    // Bilan fonctionnel
    bilanFonctionnel: {
      mainBouche: examenClinique.mainBouche ?? false,
      mainTete: examenClinique.mainTete ?? false,
      mainNuque: examenClinique.mainNuque ?? false,
      mainDos: examenClinique.mainDos ?? false,
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMobiliteChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      mobilite: {
        ...prev.mobilite,
        [field]: Number.parseInt(value) || 0,
      },
    }));
  };

  const handleTestConflitChange = (test) => {
    setData((prev) => ({
      ...prev,
      testsConflits: {
        ...prev.testsConflits,
        [test]: !prev.testsConflits[test],
      },
    }));
  };

  const handleTestTendineuChange = (test) => {
    setData((prev) => ({
      ...prev,
      testsTendineux: {
        ...prev.testsTendineux,
        [test]: !prev.testsTendineux[test],
      },
    }));
  };

  const handleBilanFonctionnelChange = (item) => {
    setData((prev) => ({
      ...prev,
      bilanFonctionnel: {
        ...prev.bilanFonctionnel,
        [item]: !prev.bilanFonctionnel[item],
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        age: data.age === "" ? null : Number(data.age),
        sexe: data.sexe,
        profession: data.profession,
        membreDominant: data.membreDominant,
        activiteSportive: data.activiteSportive,
        couvertureSociale: data.couvertureSociale,
        siegeDouleur: data.siegeDouleur,
        irradiation: data.irradiation,
        intensiteEVA:
          data.intensiteEVA === "" ? null : Number(data.intensiteEVA),
        typeRythme: data.typeRythme,
        facteurAggravant: data.facteurAggravant,
        facteurSoulagement: data.facteurSoulagement,
        debutDouleur: data.debutDouleur,
        retentissementAVQ: data.retentissementAVQ,
        retentissementPro: data.retentissementProfessionnel,
        retentissementSommeil: data.retentissementSommeil,
        mobiliteActive: JSON.stringify({
          antepu_active: data.mobilite.antepu_active,
          abduction_active: data.mobilite.abduction_active,
          retraction_active: data.mobilite.retraction_active,
          rot_ext_active: data.mobilite.rot_ext_active,
          rot_int_active: data.mobilite.rot_int_active,
        }),
        mobilitePassive: JSON.stringify({
          antepu_passive: data.mobilite.antepu_passive,
          abduction_passive: data.mobilite.abduction_passive,
          retraction_passive: data.mobilite.retraction_passive,
          rot_ext_passive: data.mobilite.rot_ext_passive,
          rot_int_passive: data.mobilite.rot_int_passive,
        }),
        testConflits: JSON.stringify(data.testsConflits),
        testsTendineux: JSON.stringify(data.testsTendineux),
        mainBouche: data.bilanFonctionnel.mainBouche,
        mainTete: data.bilanFonctionnel.mainTete,
        mainNuque: data.bilanFonctionnel.mainNuque,
        mainDos: data.bilanFonctionnel.mainDos,
      });
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Interrogatoire */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Interrogatoire</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Âge
            </label>
            <input
              id="age"
              type="number"
              name="age"
              value={data.age}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Âge"
            />
          </div>
          <div>
            <label
              htmlFor="sexe"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sexe
            </label>
            <select
              id="sexe"
              name="sexe"
              value={data.sexe}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="MALE">Homme</option>
              <option value="FEMALE">Femme</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="profession"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Profession
            </label>
            <input
              id="profession"
              type="text"
              name="profession"
              value={data.profession}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Profession"
            />
          </div>
          <div>
            <label
              htmlFor="membreDominant"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Membre dominant
            </label>
            <select
              id="membreDominant"
              name="membreDominant"
              value={data.membreDominant}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="DROIT">Droit</option>
              <option value="GAUCHE">Gauche</option>
            </select>
          </div>
          <div className="col-span-2">
            <label
              htmlFor="activiteSportive"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Activité sportive
            </label>
            <input
              id="activiteSportive"
              type="text"
              name="activiteSportive"
              value={data.activiteSportive}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Activité sportive"
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="couvertureSociale"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Couverture sociale
            </label>
            <input
              id="couvertureSociale"
              type="text"
              name="couvertureSociale"
              value={data.couvertureSociale}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Couverture sociale"
            />
          </div>
        </div>
      </div>

      {/* Douleur */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Douleur</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="siegeDouleur"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Siège de la douleur
            </label>
            <input
              id="siegeDouleur"
              type="text"
              name="siegeDouleur"
              value={data.siegeDouleur}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ex: Épaule droite"
            />
          </div>
          <div>
            <label
              htmlFor="irradiation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Irradiation
            </label>
            <input
              id="irradiation"
              type="text"
              name="irradiation"
              value={data.irradiation}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Irradiation vers..."
            />
          </div>
          <div>
            <label
              htmlFor="intensiteEVA"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Intensité EVA: {data.intensiteEVA}/10
            </label>
            <input
              id="intensiteEVA"
              type="range"
              name="intensiteEVA"
              value={data.intensiteEVA}
              onChange={handleInputChange}
              min="0"
              max="10"
              className="w-full"
            />
          </div>
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Type de rythme
            </div>
            <div className="flex gap-4">
              {["mecanique", "inflammatoire", "mixte"].map((type) => {
                let labelText;
                if (type === "mecanique") {
                  labelText = "Mécanique";
                } else if (type === "inflammatoire") {
                  labelText = "Inflammatoire";
                } else {
                  labelText = "Mixte";
                }
                return (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="typeRythme"
                      value={type}
                      checked={data.typeRythme === type}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm capitalize">{labelText}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label
              htmlFor="facteurAggravant"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Facteur aggravant
            </label>
            <input
              id="facteurAggravant"
              type="text"
              name="facteurAggravant"
              value={data.facteurAggravant}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ce qui aggrave..."
            />
          </div>
          <div>
            <label
              htmlFor="facteurSoulagement"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Facteur soulagement
            </label>
            <input
              id="facteurSoulagement"
              type="text"
              name="facteurSoulagement"
              value={data.facteurSoulagement}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ce qui soulage..."
            />
          </div>
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Début de la douleur
            </div>
            <div className="flex gap-4">
              {["progressif", "brutal"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="debutDouleur"
                    value={type}
                    checked={data.debutDouleur === type}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm capitalize">
                    {type === "progressif" ? "Progressif" : "Brutal"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Retentissement */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Retentissement</h3>
        <div className="space-y-3">
          {[
            {
              name: "retentissementAVQ",
              label: "Activités de la vie quotidienne",
            },
            { name: "retentissementProfessionnel", label: "Professionnel" },
            { name: "retentissementSommeil", label: "Sommeil" },
          ].map((item) => (
            <label key={item.name} className="flex items-center gap-3">
              <input
                type="checkbox"
                name={item.name}
                checked={data[item.name]}
                onChange={handleInputChange}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mobilité */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Examen physique</h3>

        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Mobilité</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium text-xs text-gray-500">Mouvements</div>
            <div className="font-medium text-xs text-center text-gray-500">
              Actif (°)
            </div>
            <div className="font-medium text-xs text-center text-gray-500">
              Passif (°)
            </div>
            {[
              { key: "antepu", label: "Antépulsion" },
              { key: "abduction", label: "Abduction" },
              { key: "retraction", label: "Rétraction" },
              { key: "rot_ext", label: "Rotation externe" },
              { key: "rot_int", label: "Rotation interne" },
            ].map((mov) => (
              <div key={mov.key} className="contents">
                <div className="text-sm text-gray-700">{mov.label}</div>
                <div>
                  <input
                    type="number"
                    value={data.mobilite[`${mov.key}_active`]}
                    onChange={(e) =>
                      handleMobiliteChange(`${mov.key}_active`, e.target.value)
                    }
                    className="input-field text-center w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={data.mobilite[`${mov.key}_passive`]}
                    onChange={(e) =>
                      handleMobiliteChange(`${mov.key}_passive`, e.target.value)
                    }
                    className="input-field text-center w-full"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tests de conflit */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Tests de conflit</h4>
          <div className="flex gap-3">
            {["neer", "hawkins", "yocum"].map((test) => (
              <button
                key={test}
                onClick={() => handleTestConflitChange(test)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  data.testsConflits[test]
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {test.charAt(0).toUpperCase() + test.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tests tendineux */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Tests tendineux</h4>
          <div className="flex gap-3 flex-wrap">
            {[
              { key: "jobe", label: "Jobe" },
              { key: "patte", label: "Patte" },
              { key: "gerber", label: "Gerber" },
              { key: "palmUp", label: "Palm Up" },
            ].map((test) => (
              <button
                key={test.key}
                onClick={() => handleTestTendineuChange(test.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  data.testsTendineux[test.key]
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {test.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bilan fonctionnel */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Bilan fonctionnel</h3>
        <div className="flex gap-3 flex-wrap">
          {[
            { key: "mainBouche", label: "Main - Bouche" },
            { key: "mainTete", label: "Main - Tête" },
            { key: "mainNuque", label: "Main - Nuque" },
            { key: "mainDos", label: "Main - Dos" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleBilanFonctionnelChange(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                data.bilanFonctionnel[item.key]
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
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

ExamenCliniqueForm.propTypes = {
  session: PropTypes.shape({
    examenClinique: PropTypes.shape({
      age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sexe: PropTypes.string,
      profession: PropTypes.string,
      membreDominant: PropTypes.string,
      activiteSportive: PropTypes.string,
      couvertureSociale: PropTypes.string,
      siegeDouleur: PropTypes.string,
      irradiation: PropTypes.string,
      intensiteEVA: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      typeRythme: PropTypes.string,
      facteurAggravant: PropTypes.string,
      facteurSoulagement: PropTypes.string,
      debutDouleur: PropTypes.string,
      retentissementAVQ: PropTypes.bool,
      retentissementPro: PropTypes.bool,
      retentissementSommeil: PropTypes.bool,
      mobiliteActive: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      mobilitePassive: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
      ]),
      testConflits: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      testsTendineux: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      mainBouche: PropTypes.bool,
      mainTete: PropTypes.bool,
      mainNuque: PropTypes.bool,
      mainDos: PropTypes.bool,
    }),
    examen_clinique: PropTypes.object,
  }),
  patient: PropTypes.shape({
    patient: PropTypes.shape({
      age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    gender: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};
