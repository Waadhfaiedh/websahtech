import { useState } from "react";
import PropTypes from "prop-types";

export default function PhysiotherapieForm({ session, patient, onSave }) {
  const [activeSubTab, setActiveSubTab] = useState("bilan");
  const [saving, setSaving] = useState(false);
  const physiotherapie = session?.physiotherapie ?? {};
  const bilanKinesitherapique =
    physiotherapie.bilanKinesitherapique ?? physiotherapie.bilan ?? {};
  const protocoleReeducation =
    physiotherapie.protocoleReeducation ?? physiotherapie.protocole ?? {};
  const resultatPhysiotherapie = physiotherapie.resultat ?? {};

  const parseStoredJson = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value !== "string") return value;

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const defaultConstantScore = {
    douleur: 0,
    activites: 0,
    mobilite: 0,
    force: 0,
  };

  const defaultQuickDash = {
    q1: 1,
    q2: 1,
    q3: 1,
    q4: 1,
    q5: 1,
    q6: 1,
    q7: 1,
    q8: 1,
    q9: 1,
    q10: 1,
    q11: 1,
  };

  const initialBilanConstantScore = parseStoredJson(
    bilanKinesitherapique.constantScore,
    defaultConstantScore,
  );
  const initialBilanQuickDash = parseStoredJson(
    bilanKinesitherapique.quickDashScore,
    defaultQuickDash,
  );
  const initialMobiliteArticulaire = {
    antepulsion_active: bilanKinesitherapique.antepulsionActive ?? 0,
    antepulsion_passive: bilanKinesitherapique.antepulsionPassive ?? 0,
    abduction_active: bilanKinesitherapique.abductionActive ?? 0,
    abduction_passive: bilanKinesitherapique.abductionPassive ?? 0,
    retraction_active: bilanKinesitherapique.retractionActive ?? 0,
    retraction_passive: bilanKinesitherapique.retractionPassive ?? 0,
    rot_ext_active: bilanKinesitherapique.rotationExterneActive ?? 0,
    rot_ext_passive: bilanKinesitherapique.rotationExternePassive ?? 0,
    rot_int_active: bilanKinesitherapique.rotationInterneActive ?? 0,
    rot_int_passive: bilanKinesitherapique.rotationInternePassive ?? 0,
  };

  // Bilan kiné state
  const [bilanData, setBilanData] = useState({
    plainte: bilanKinesitherapique.plainte ?? "",
    historique: bilanKinesitherapique.historique ?? "",
    intensiteEVA: bilanKinesitherapique.intensiteEVA ?? 5,
    constantScore: initialBilanConstantScore,
    quickDASH: initialBilanQuickDash,
    dashArabeScore: parseStoredJson(
      bilanKinesitherapique.dashArabeScore,
      defaultQuickDash,
    ),
    mobiliteArticulaire: initialMobiliteArticulaire,
    testingMusculaire: {
      deltoides: bilanKinesitherapique.deltoideTesting ?? 3,
      sus_epineux: bilanKinesitherapique.susEpineuxTesting ?? 3,
      infra_epineux: bilanKinesitherapique.infraEpineuxTesting ?? 3,
      sub_scapulaire: bilanKinesitherapique.subScapulaireTesting ?? 3,
    },
    testsSpecifiques: {
      jobe: bilanKinesitherapique.testJobe ?? false,
      patte: bilanKinesitherapique.testPatte ?? false,
      gerber: bilanKinesitherapique.testGerber ?? false,
      neer: bilanKinesitherapique.testNeer ?? false,
      hawkins: bilanKinesitherapique.testHawkins ?? false,
    },
    bilanFonctionnel: {
      mainBouche: bilanKinesitherapique.mainBouche ?? false,
      mainTete: bilanKinesitherapique.mainTete ?? false,
      mainNuque: bilanKinesitherapique.mainNuque ?? false,
      mainDos: bilanKinesitherapique.mainDos ?? false,
    },
    observations: bilanKinesitherapique.observations ?? "",
  });

  // Protocole state
  const [protocolData, setProtocolData] = useState({
    objectifsCourt: protocoleReeducation.objectifsCourt ?? "",
    objectifsLong: protocoleReeducation.objectifsLong ?? "",
    physiotherapieAntalgique:
      protocoleReeducation.physiotherapieAntalgique ?? false,
    massage: protocoleReeducation.massage ?? false,
    balneotherapie: protocoleReeducation.balnéotherapie ?? false,
    typesPhysio: protocoleReeducation.typesPhysio ?? "",
    mobilisationsPassives: protocoleReeducation.mobilisationsPassives ?? false,
    mobilisationsActives: protocoleReeducation.mobilisationsActives ?? false,
    renforcement: protocoleReeducation.renforcement ?? false,
    proprioception: protocoleReeducation.proprioception ?? false,
    exercicesDetail: protocoleReeducation.exercicesDetail ?? "",
    seancesParSemaine: protocoleReeducation.seancesParSemaine ?? 2,
    dureeSemaines: protocoleReeducation.dureeSemaines ?? 6,
    orthese: protocoleReeducation.orthese ?? false,
    typeOrthese: protocoleReeducation.typeOrthese ?? "",
  });

  // Résultats state
  const [resultatData, setResultatData] = useState({
    constantScoreFinal: parseStoredJson(
      resultatPhysiotherapie.constantScoreFinal,
      defaultConstantScore,
    ),
    quickDASHFinal: parseStoredJson(
      resultatPhysiotherapie.quickDashScoreFinal,
      defaultQuickDash,
    ),
    evaFinale: resultatPhysiotherapie.evaFinal ?? 5,
    evolution: {
      douleur: resultatPhysiotherapie.evolutionDouleur ?? "stable",
      mobilite: resultatPhysiotherapie.evolutionMobilite ?? "stable",
      force: resultatPhysiotherapie.evolutionForce ?? "stable",
      fonction: resultatPhysiotherapie.evolutionFonction ?? "stable",
    },
    amplitudesFinales: {
      antepulsion: resultatPhysiotherapie.antepulsionFinal ?? 0,
      abduction: resultatPhysiotherapie.abductionFinal ?? 0,
      rot_ext: resultatPhysiotherapie.rotationExterneFinal ?? 0,
      rot_int: resultatPhysiotherapie.rotationInterneFinal ?? 0,
    },
    objectifsAtteints: resultatPhysiotherapie.objectifsAtteints ?? false,
    conclusionKine: resultatPhysiotherapie.conclusionKine ?? "",
    suitesDonnees: resultatPhysiotherapie.suitesDonnees ?? "arret",
  });

  const QUESTIONS_QUICKDASH = [
    "Votre prise de poids ou sac de courses",
    "Tâches ménagères",
    "Déplacement à pied",
    "Sommeil",
    "Travail habituel",
    "Loisirs",
    "Hygiène personnelle",
    "Tâches faisant appel à la force",
    "Activités visuelles rapides",
    "Gêne occasionnée",
    "Gêne au travail",
  ];

  const calculateConstantTotal = (scores) => {
    return scores.douleur + scores.activites + scores.mobilite + scores.force;
  };

  const handleBilanChange = (field, value) => {
    setBilanData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBilanQuestionChange = (question, value) => {
    setBilanData((prev) => ({
      ...prev,
      quickDASH: {
        ...prev.quickDASH,
        [question]: Number.parseInt(value) || 1,
      },
    }));
  };

  const handleMobiliteChange = (field, value) => {
    setBilanData((prev) => ({
      ...prev,
      mobiliteArticulaire: {
        ...prev.mobiliteArticulaire,
        [field]: Number.parseInt(value) || 0,
      },
    }));
  };

  const handleTestingChange = (muscle, value) => {
    setBilanData((prev) => ({
      ...prev,
      testingMusculaire: {
        ...prev.testingMusculaire,
        [muscle]: Number.parseInt(value) || 0,
      },
    }));
  };

  const handleProtocolChange = (field, value) => {
    setProtocolData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResultatChange = (field, value) => {
    setResultatData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        bilan: bilanData,
        protocole: protocolData,
        resultat: resultatData,
        activeSubTab,
      });
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
        {["bilan", "protocole", "resultat"].map((tab) => {
          const tabLabels = {
            bilan: "Bilan kiné",
            protocole: "Protocole",
            resultat: "Résultats",
          };
          const tabLabel = tabLabels[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSubTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      {/* BILAN KINÉ TAB */}
      {activeSubTab === "bilan" && (
        <div className="space-y-6">
          {/* Interrogatoire */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Interrogatoire</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bilan-plainte"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Plainte principale
                </label>
                <input
                  id="bilan-plainte"
                  type="text"
                  value={bilanData.plainte}
                  onChange={(e) => handleBilanChange("plainte", e.target.value)}
                  className="input-field"
                  placeholder="Motif de consultation..."
                />
              </div>
              <div>
                <label
                  htmlFor="bilan-historique"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Historique
                </label>
                <textarea
                  id="bilan-historique"
                  value={bilanData.historique}
                  onChange={(e) =>
                    handleBilanChange("historique", e.target.value)
                  }
                  rows={3}
                  className="input-field resize-none"
                  placeholder="ATCD, contexte, chronologie..."
                />
              </div>
              <div>
                <label
                  htmlFor="bilan-intensite-eva"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Intensite douleur (EVA): {bilanData.intensiteEVA}/10
                </label>
                <input
                  id="bilan-intensite-eva"
                  type="range"
                  value={bilanData.intensiteEVA}
                  onChange={(e) =>
                    handleBilanChange(
                      "intensiteEVA",
                      Number.parseFloat(e.target.value),
                    )
                  }
                  min="0"
                  max="10"
                  step="0.5"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Constant Score */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Constant Score</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bilan-constant-douleur"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Douleur (0-15)
                </label>
                <input
                  id="bilan-constant-douleur"
                  type="number"
                  min="0"
                  max="15"
                  value={bilanData.constantScore.douleur}
                  onChange={(e) =>
                    handleBilanChange("constantScore", {
                      ...bilanData.constantScore,
                      douleur: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="bilan-constant-activites"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Activités (0-20)
                </label>
                <input
                  id="bilan-constant-activites"
                  type="number"
                  min="0"
                  max="20"
                  value={bilanData.constantScore.activites}
                  onChange={(e) =>
                    handleBilanChange("constantScore", {
                      ...bilanData.constantScore,
                      activites: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="bilan-constant-mobilite"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mobilité (0-40)
                </label>
                <input
                  id="bilan-constant-mobilite"
                  type="number"
                  min="0"
                  max="40"
                  value={bilanData.constantScore.mobilite}
                  onChange={(e) =>
                    handleBilanChange("constantScore", {
                      ...bilanData.constantScore,
                      mobilite: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="bilan-constant-force"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Force (0-25)
                </label>
                <input
                  id="bilan-constant-force"
                  type="number"
                  min="0"
                  max="25"
                  value={bilanData.constantScore.force}
                  onChange={(e) =>
                    handleBilanChange("constantScore", {
                      ...bilanData.constantScore,
                      force: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-sm font-medium text-primary">
                  Total: {calculateConstantTotal(bilanData.constantScore)}/100
                </p>
              </div>
            </div>
          </div>

          {/* QuickDASH Score */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">QuickDASH Score</h3>
            <p className="text-xs text-gray-500 mb-4">
              Répondre à chaque question (1-5): 1=Aucune difficulté,
              5=Impossible
            </p>
            <div className="space-y-3">
              {QUESTIONS_QUICKDASH.map((question, idx) => (
                <div key={question}>
                  <label
                    htmlFor={`bilan-quickdash-q${idx + 1}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {idx + 1}. {question}
                  </label>
                  <select
                    id={`bilan-quickdash-q${idx + 1}`}
                    value={bilanData.quickDASH[`q${idx + 1}`]}
                    onChange={(e) =>
                      handleBilanQuestionChange(`q${idx + 1}`, e.target.value)
                    }
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="bg-primary/10 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium text-primary">
                  Total:{" "}
                  {Object.values(bilanData.quickDASH).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                  /55
                </p>
              </div>
            </div>
          </div>

          {/* DASH Arabe Score */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">DASH Arabe Score</h3>
            <p className="text-xs text-gray-500 mb-4">
              Repondre a chaque question (1-5): 1=Aucune difficulte,
              5=Impossible
            </p>
            <div className="space-y-3">
              {QUESTIONS_QUICKDASH.map((question, idx) => (
                <div key={`dashAra-q${idx + 1}`}>
                  <label
                    htmlFor={`bilan-dashara-q${idx + 1}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {idx + 1}. {question}
                  </label>
                  <select
                    id={`bilan-dashara-q${idx + 1}`}
                    value={bilanData.dashArabeScore[`q${idx + 1}`]}
                    onChange={(e) =>
                      setBilanData((prev) => ({
                        ...prev,
                        dashArabeScore: {
                          ...prev.dashArabeScore,
                          [`q${idx + 1}`]: Number.parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="bg-primary/10 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium text-primary">
                  Total:{" "}
                  {Object.values(bilanData.dashArabeScore).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                  /55
                </p>
              </div>
            </div>
          </div>

          {/* Mobilité articulaire */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Bilan articulaire</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-gray-700 py-2">
                      Mouvements
                    </th>
                    <th className="text-center font-medium text-gray-700 py-2">
                      Actif (°)
                    </th>
                    <th className="text-center font-medium text-gray-700 py-2">
                      Passif (°)
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { key: "antepulsion", label: "Antépulsion" },
                    { key: "abduction", label: "Abduction" },
                    { key: "retraction", label: "Rétraction" },
                    { key: "rot_ext", label: "Rotation externe" },
                    { key: "rot_int", label: "Rotation interne" },
                  ].map((mov) => (
                    <tr key={mov.key} className="border-b">
                      <td className="py-2 text-gray-700">{mov.label}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={
                            bilanData.mobiliteArticulaire[`${mov.key}_active`]
                          }
                          onChange={(e) =>
                            handleMobiliteChange(
                              `${mov.key}_active`,
                              e.target.value,
                            )
                          }
                          className="input-field text-center w-20"
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={
                            bilanData.mobiliteArticulaire[`${mov.key}_passive`]
                          }
                          onChange={(e) =>
                            handleMobiliteChange(
                              `${mov.key}_passive`,
                              e.target.value,
                            )
                          }
                          className="input-field text-center w-20"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Testing musculaire */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">
              Testing musculaire (Échelle MRC 0-5)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "deltoides", label: "Deltoïde" },
                { key: "sus_epineux", label: "Sus-épineux" },
                { key: "infra_epineux", label: "Infra-épineux" },
                { key: "sub_scapulaire", label: "Sub-scapulaire" },
              ].map((muscle) => (
                <div key={muscle.key}>
                  <label
                    htmlFor={`bilan-testing-${muscle.key}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {muscle.label}
                  </label>
                  <select
                    id={`bilan-testing-${muscle.key}`}
                    value={bilanData.testingMusculaire[muscle.key]}
                    onChange={(e) =>
                      handleTestingChange(muscle.key, e.target.value)
                    }
                    className="input-field"
                  >
                    {[0, 1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Tests spécifiques */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Tests spécifiques</h3>
            <div className="flex gap-3 flex-wrap">
              {[
                { key: "jobe", label: "Jobe" },
                { key: "patte", label: "Patte" },
                { key: "gerber", label: "Gerber" },
                { key: "neer", label: "Neer" },
                { key: "hawkins", label: "Hawkins" },
              ].map((test) => (
                <button
                  key={test.key}
                  onClick={() =>
                    setBilanData((prev) => ({
                      ...prev,
                      testsSpecifiques: {
                        ...prev.testsSpecifiques,
                        [test.key]: !prev.testsSpecifiques[test.key],
                      },
                    }))
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    bilanData.testsSpecifiques[test.key]
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {test.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bilan Fonctionnel */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Bilan Fonctionnel</h3>
            <p className="text-sm text-gray-600 mb-4">
              Test d'acces a differentes zones:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "mainBouche", label: "Main a la bouche" },
                { key: "mainTete", label: "Main a la tete" },
                { key: "mainNuque", label: "Main a la nuque" },
                { key: "mainDos", label: "Main au dos" },
              ].map((test) => (
                <label key={test.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bilanData.bilanFonctionnel[test.key]}
                    onChange={(e) =>
                      setBilanData((prev) => ({
                        ...prev,
                        bilanFonctionnel: {
                          ...prev.bilanFonctionnel,
                          [test.key]: e.target.checked,
                        },
                      }))
                    }
                  />
                  <span className="text-sm text-gray-700">{test.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Observations</h3>
            <textarea
              value={bilanData.observations}
              onChange={(e) =>
                handleBilanChange("observations", e.target.value)
              }
              rows={4}
              className="input-field resize-none"
              placeholder="Observations et notes cliniques..."
            />
          </div>
        </div>
      )}

      {/* PROTOCOLE TAB */}
      {activeSubTab === "protocole" && (
        <div className="space-y-6">
          {/* Objectifs */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Objectifs</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="protocole-objectifs-court"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Objectifs court terme
                </label>
                <textarea
                  id="protocole-objectifs-court"
                  value={protocolData.objectifsCourt}
                  onChange={(e) =>
                    handleProtocolChange("objectifsCourt", e.target.value)
                  }
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Objectifs court terme..."
                />
              </div>
              <div>
                <label
                  htmlFor="protocole-objectifs-long"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Objectifs long terme
                </label>
                <textarea
                  id="protocole-objectifs-long"
                  value={protocolData.objectifsLong}
                  onChange={(e) =>
                    handleProtocolChange("objectifsLong", e.target.value)
                  }
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Objectifs long terme..."
                />
              </div>
            </div>
          </div>

          {/* Moyens physio */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Moyens physio</h3>
            <div className="space-y-3">
              {[
                {
                  name: "physiotherapieAntalgique",
                  label: "Physiothérapie antalgique",
                },
                { name: "massage", label: "Massage" },
                { name: "balneotherapie", label: "Balnéothérapie" },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={protocolData[item.name]}
                    onChange={(e) =>
                      handleProtocolChange(item.name, e.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
              {(protocolData.physiotherapieAntalgique ||
                protocolData.massage ||
                protocolData.balneotherapie) && (
                <input
                  type="text"
                  value={protocolData.typesPhysio}
                  onChange={(e) =>
                    handleProtocolChange("typesPhysio", e.target.value)
                  }
                  className="input-field"
                  placeholder="Détails des modaités..."
                />
              )}
            </div>
          </div>

          {/* Programme kiné */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Programme kiné</h3>
            <div className="space-y-3 mb-4">
              {[
                {
                  name: "mobilisationsPassives",
                  label: "Mobilisations passives",
                },
                {
                  name: "mobilisationsActives",
                  label: "Mobilisations actives",
                },
                { name: "renforcement", label: "Renforcement musculaire" },
                { name: "proprioception", label: "Proprioception" },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={protocolData[item.name]}
                    onChange={(e) =>
                      handleProtocolChange(item.name, e.target.checked)
                    }
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            <div>
              <label
                htmlFor="protocole-exercices-detail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Détails des exercices
              </label>
              <textarea
                id="protocole-exercices-detail"
                value={protocolData.exercicesDetail}
                onChange={(e) =>
                  handleProtocolChange("exercicesDetail", e.target.value)
                }
                rows={3}
                className="input-field resize-none"
                placeholder="Description des exercices..."
              />
            </div>
          </div>

          {/* Fréquence */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Fréquence</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="protocole-seances-par-semaine"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Séances par semaine
                </label>
                <input
                  id="protocole-seances-par-semaine"
                  type="number"
                  min="1"
                  value={protocolData.seancesParSemaine}
                  onChange={(e) =>
                    handleProtocolChange(
                      "seancesParSemaine",
                      Number.parseInt(e.target.value) || 1,
                    )
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="protocole-duree-semaines"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Durée (semaines)
                </label>
                <input
                  id="protocole-duree-semaines"
                  type="number"
                  min="1"
                  value={protocolData.dureeSemaines}
                  onChange={(e) =>
                    handleProtocolChange(
                      "dureeSemaines",
                      Number.parseInt(e.target.value) || 1,
                    )
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Orthèse */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Orthèse</h3>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="orthese"
                checked={protocolData.orthese}
                onChange={(e) =>
                  handleProtocolChange("orthese", e.target.checked)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  Orthèse prescrite
                </span>
                {protocolData.orthese && (
                  <input
                    type="text"
                    value={protocolData.typeOrthese}
                    onChange={(e) =>
                      handleProtocolChange("typeOrthese", e.target.value)
                    }
                    className="input-field mt-2"
                    placeholder="Type d'orthèse..."
                  />
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* RÉSULTATS TAB */}
      {activeSubTab === "resultat" && (
        <div className="space-y-6">
          {/* Constant Score Final */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">
              Constant Score Final
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="resultat-constant-douleur"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Douleur (0-15)
                </label>
                <input
                  id="resultat-constant-douleur"
                  type="number"
                  min="0"
                  max="15"
                  value={resultatData.constantScoreFinal.douleur}
                  onChange={(e) =>
                    handleResultatChange("constantScoreFinal", {
                      ...resultatData.constantScoreFinal,
                      douleur: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="resultat-constant-activites"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Activités (0-20)
                </label>
                <input
                  id="resultat-constant-activites"
                  type="number"
                  min="0"
                  max="20"
                  value={resultatData.constantScoreFinal.activites}
                  onChange={(e) =>
                    handleResultatChange("constantScoreFinal", {
                      ...resultatData.constantScoreFinal,
                      activites: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="resultat-constant-mobilite"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mobilité (0-40)
                </label>
                <input
                  id="resultat-constant-mobilite"
                  type="number"
                  min="0"
                  max="40"
                  value={resultatData.constantScoreFinal.mobilite}
                  onChange={(e) =>
                    handleResultatChange("constantScoreFinal", {
                      ...resultatData.constantScoreFinal,
                      mobilite: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="resultat-constant-force"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Force (0-25)
                </label>
                <input
                  id="resultat-constant-force"
                  type="number"
                  min="0"
                  max="25"
                  value={resultatData.constantScoreFinal.force}
                  onChange={(e) =>
                    handleResultatChange("constantScoreFinal", {
                      ...resultatData.constantScoreFinal,
                      force: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-sm font-medium text-primary">
                  Total:{" "}
                  {calculateConstantTotal(resultatData.constantScoreFinal)}/100
                </p>
              </div>
            </div>
          </div>

          {/* QuickDASH Final */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">QuickDASH Final</h3>
            <p className="text-xs text-gray-500 mb-4">
              Répondre à chaque question (1-5)
            </p>
            <div className="space-y-3">
              {QUESTIONS_QUICKDASH.map((question, idx) => (
                <div key={question}>
                  <label
                    htmlFor={`resultat-quickdash-q${idx + 1}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {idx + 1}. {question}
                  </label>
                  <select
                    id={`resultat-quickdash-q${idx + 1}`}
                    value={resultatData.quickDASHFinal[`q${idx + 1}`]}
                    onChange={(e) =>
                      setResultatData((prev) => ({
                        ...prev,
                        quickDASHFinal: {
                          ...prev.quickDASHFinal,
                          [`q${idx + 1}`]: Number.parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* EVA Final */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">EVA Final</h3>
            <label
              htmlFor="resultat-eva-finale"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Intensité: {resultatData.evaFinale}/10
            </label>
            <input
              id="resultat-eva-finale"
              type="range"
              value={resultatData.evaFinale}
              onChange={(e) =>
                handleResultatChange(
                  "evaFinale",
                  Number.parseInt(e.target.value),
                )
              }
              min="0"
              max="10"
              className="w-full"
            />
          </div>

          {/* Évolution */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Évolution</h3>
            <div className="space-y-4">
              {[
                { key: "douleur", label: "Douleur" },
                { key: "mobilite", label: "Mobilité" },
                { key: "force", label: "Force" },
                { key: "fonction", label: "Fonction" },
              ].map((item) => (
                <div key={item.key}>
                  <label
                    htmlFor={`resultat-evolution-${item.key}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {item.label}
                  </label>
                  <select
                    id={`resultat-evolution-${item.key}`}
                    value={resultatData.evolution[item.key]}
                    onChange={(e) =>
                      handleResultatChange("evolution", {
                        ...resultatData.evolution,
                        [item.key]: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="amelioration">Amélioration</option>
                    <option value="stable">Stable</option>
                    <option value="aggravation">Aggravation</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Amplitudes finales */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Amplitudes finales</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "antepulsion", label: "Antépulsion (°)" },
                { key: "abduction", label: "Abduction (°)" },
                { key: "rot_ext", label: "Rotation externe (°)" },
                { key: "rot_int", label: "Rotation interne (°)" },
              ].map((amp) => (
                <div key={amp.key}>
                  <label
                    htmlFor={`resultat-amplitude-${amp.key}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {amp.label}
                  </label>
                  <input
                    id={`resultat-amplitude-${amp.key}`}
                    type="number"
                    min="0"
                    max="180"
                    value={resultatData.amplitudesFinales[amp.key]}
                    onChange={(e) =>
                      handleResultatChange("amplitudesFinales", {
                        ...resultatData.amplitudesFinales,
                        [amp.key]: Math.max(
                          0,
                          Number.parseInt(e.target.value) || 0,
                        ),
                      })
                    }
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Conclusion</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="objectifsAtteints"
                  checked={resultatData.objectifsAtteints}
                  onChange={(e) =>
                    handleResultatChange("objectifsAtteints", e.target.checked)
                  }
                />
                <span className="text-sm font-medium text-gray-700">
                  Objectifs atteints
                </span>
              </label>

              <div>
                <label
                  htmlFor="resultat-conclusion-kine"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Conclusion kiné
                </label>
                <textarea
                  id="resultat-conclusion-kine"
                  value={resultatData.conclusionKine}
                  onChange={(e) =>
                    handleResultatChange("conclusionKine", e.target.value)
                  }
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Conclusion de la rééducation..."
                />
              </div>

              <div>
                <label
                  htmlFor="resultat-suites-donnees"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Suites données
                </label>
                <select
                  id="resultat-suites-donnees"
                  value={resultatData.suitesDonnees}
                  onChange={(e) =>
                    handleResultatChange("suitesDonnees", e.target.value)
                  }
                  className="input-field"
                >
                  <option value="arret">Arrêt de la rééducation</option>
                  <option value="poursuite">Poursuite de la rééducation</option>
                  <option value="chirurgie">Orientation chirurgie</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

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

PhysiotherapieForm.propTypes = {
  session: PropTypes.object,
  patient: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
