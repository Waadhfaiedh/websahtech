import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import PatientInterrogatoireCard from "./PatientInterrogatoireCard";

const parseStoredJson = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const splitFullName = (fullName) => {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const getBmiInfo = (heightCm, weightKg) => {
  const height = Number.parseFloat(heightCm);
  const weight = Number.parseFloat(weightKg);

  if (!height || !weight || height <= 0 || weight <= 0) {
    return { value: null, category: "—", isNormal: false };
  }

  const value = weight / ((height / 100) * (height / 100));

  if (value < 18.5) {
    return { value, category: "Insuffisance pondérale", isNormal: false };
  }

  if (value <= 24.9) {
    return { value, category: "Normal", isNormal: true };
  }

  if (value <= 29.9) {
    return { value, category: "Surpoids", isNormal: false };
  }

  return { value, category: "Obésité", isNormal: false };
};

const DEFAULT_CONSTANT_SCORE = {
  douleur: 0,
  activites: 0,
  mobilite: 0,
  force: 0,
};

const DEFAULT_QUICKDASH = {
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

const BILAN_QUICKDASH_QUESTIONS = [
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

const CONSTANT_SCORE_INFO_TEXT = `Constant Score
Echelle d'evaluation fonctionnelle de l'epaule sur 100 points.

1) Douleur / 15 points
Double appreciation : echelle verbale + echelle algometrique (EVA), puis moyenne des deux.
Echelle verbale :
- Douleur intolerable : 0 point
- Douleur moyenne : 5 points
- Douleur moderee : 10 points
- Aucune douleur : 15 points
Echelle algometrique : soustraire le chiffre obtenu sur l'EVA (0-15) du nombre 15.
Score final = (Echelle verbale + Echelle algometrique) / 2

2) Niveau d'activites quotidiennes / 20 points

a) Activites professionnelles/occupationnelles (/ 4 points) :
- Travail impossible ou non repris : 0 point
- Gene importante : 1 point
- Gene moyenne : 2 points
- Gene moderee : 3 points
- Aucune gene : 4 points

b) Activites de loisirs (/ 4 points) :
- Impossible : 0 point
- Gene importante : 1 point
- Gene moyenne : 2 points
- Gene moderee : 3 points
- Aucune gene : 4 points

c) Gene dans le sommeil (/ 2 points) :
- Douleurs insomniantes : 0 point
- Gene moderee : 1 point
- Aucune gene : 2 points

d) Niveau de travail avec la main (/ 10 points) :
A quelle hauteur le patient peut-il utiliser sa main sans douleur et avec une force suffisante ?
- Taille : 2 points
- Xiphoide : 4 points
- Cou : 6 points
- Tete : 8 points
- Au-dessus de la tete : 10 points

3) Mobilite articulaire / 40 points
Amplitudes actives et sans douleur, patient assis sur une chaise sans accoudoir.

a) Antepulsion (/ 10 points) :
- 0°-30° : 0 point
- 31°-60° : 2 points
- 61°-90° : 4 points
- 91°-120° : 6 points
- 121°-150° : 8 points
- > 150° : 10 points

b) Élévation latérale (/ 10 points) :
- 0°-30° : 0 point
- 31°-60° : 2 points
- 61°-90° : 4 points
- 91°-120° : 6 points
- 121°-150° : 8 points
- > 150° : 10 points

c) Rotation laterale (/ 10 points) :
- Main derriere la tete, coude en avant : 2 points
- Main derriere la tete, coude en arriere : 4 points
- Main sur la tete, coude en avant : 6 points
- Main sur la tete, coude en arriere : 8 points
- Elevation complete depuis le sommet de la tete : 10 points

d) Rotation mediale (/ 10 points) :
- Dos de la main niveau fesse : 2 points
- Dos de la main niveau sacrum : 4 points
- Dos de la main niveau L3 : 6 points
- Dos de la main niveau T12 : 8 points
- Dos de la main niveau T7-T8 : 10 points

4) Force musculaire / 25 points
Élévation latérale isométrique (élévation antéro-latérale de 90° dans le plan de l'omoplate).
Mesure avec dynamometre (sensibilite minimale 500 g) fixe au poignet, patient assis,
bras tendu a 30° d'antepulsion, resistance a la poussee vers le bas pendant 5 secondes.
- Si 90° n'est pas atteint en actif : 0 point
- Si maintien de 5 secondes : 1 point par tranche de 500 g (jusqu'a 25 points max)

Presentation des resultats (3 possibilites) :
- Score par domaine separement
- Somme en valeur absolue (/ 100)
- Valeur ponderee : rapport entre la valeur mesuree et la valeur normale pour l'age et le sexe
  (privilegiee par les auteurs depuis 2008)

Valeurs normales selon age et sexe (moyenne) :
- 21-30 ans : H 98 / F 97
- 31-40 ans : H 93 / F 90
- 41-50 ans : H 92 / F 80
- 51-60 ans : H 90 / F 73
- 61-70 ans : H 83 / F 70
- 71-80 ans : H 75 / F 69
- 81-90 ans : H 66 / F 64
- 91-100 ans : H 56 / F 52

Interpretation generale :
- Score eleve : meilleure fonction de l'epaule
- Score bas : limitation fonctionnelle plus importante`;

const buildInitialData = (session, patient) => {
  const examenClinique =
    session?.examenClinique ?? session?.examen_clinique ?? {};
  const physiotherapie = session?.physiotherapie ?? {};
  const bilanKinesitherapique =
    physiotherapie.bilanKinesitherapique ?? physiotherapie.bilan ?? {};
  const { firstName, lastName } = splitFullName(patient?.fullName);

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
  const testsInstabilite = parseStoredJson(examenClinique.testsInstabilite, {
    arme: false,
    relocation: false,
    post: false,
  });
  const testsLaxite = parseStoredJson(examenClinique.testsLaxite, {
    sulcus: false,
    tiroir: false,
  });
  const palpation = parseStoredJson(examenClinique.palpation, {
    reliefsOsseux: "",
    insertionsTendineuses: "",
  });
  const examenCervical = parseStoredJson(examenClinique.examenCervical, {
    douleurCervicale: false,
    ncb: false,
  });
  const examenNeurologique = parseStoredJson(
    examenClinique.examenNeurologique,
    {
      sensibiliteConservee: false,
      reflexesOsteoTendineux: "normale",
    },
  );
  const examenConstantScore = parseStoredJson(
    examenClinique.constantScore,
    null,
  );
  const bilanConstantScore = parseStoredJson(
    bilanKinesitherapique.constantScore,
    null,
  );
  const constantScore =
    examenConstantScore ?? bilanConstantScore ?? DEFAULT_CONSTANT_SCORE;

  const examenQuickDashScore = parseStoredJson(
    examenClinique.quickDashScore,
    null,
  );
  const bilanQuickDashScore = parseStoredJson(
    bilanKinesitherapique.quickDashScore,
    null,
  );
  const quickDashScore =
    examenQuickDashScore ?? bilanQuickDashScore ?? DEFAULT_QUICKDASH;

  return {
    patientFirstName: firstName,
    patientLastName: lastName,

    siegeDouleur: examenClinique.siegeDouleur ?? "",
    irradiation: examenClinique.irradiation ?? "",
    intensiteEVA: examenClinique.intensiteEVA ?? 5,
    typeDouleur: examenClinique.typeDouleur ?? "mecanique",
    facteurAggravant: examenClinique.facteurAggravant ?? "",
    facteursoulageant: examenClinique.facteursoulageant ?? "",
    debutDouleur: examenClinique.debutDouleur ?? "progressif",

    retentissementAVQ: examenClinique.retentissementAVQ ?? false,
    retentissementProfessionnel:
      examenClinique.retentissementProfessionnel ?? examenClinique.retentissementPro ?? false,
    retentissementSommeil: examenClinique.retentissementSommeil ?? false,

    mobilite: {
      // For each movement we keep active/passive degree and douleurAngle (0-180°)
      antepu_active:
        activeMobilite.antepu_active ?? passiveMobilite.antepu_active ?? 0,
      antepu_active_douleur: activeMobilite.antepu_active_douleur ?? 0,
      antepu_passive:
        passiveMobilite.antepu_passive ?? activeMobilite.antepu_passive ?? 0,
      antepu_passive_douleur: passiveMobilite.antepu_passive_douleur ?? 0,

      abduction_active:
        activeMobilite.abduction_active ??
        passiveMobilite.abduction_active ??
        0,
      abduction_active_douleur: activeMobilite.abduction_active_douleur ?? 0,
      abduction_passive:
        passiveMobilite.abduction_passive ??
        activeMobilite.abduction_passive ??
        0,
      abduction_passive_douleur: passiveMobilite.abduction_passive_douleur ?? 0,

      // removed retraction; added elevation anterieure, retropultion, adduction
      rot_ext_active:
        activeMobilite.rot_ext_active ?? passiveMobilite.rot_ext_active ?? 0,
      rot_ext_active_douleur: activeMobilite.rot_ext_active_douleur ?? 0,
      rot_ext_passive:
        passiveMobilite.rot_ext_passive ?? activeMobilite.rot_ext_passive ?? 0,
      rot_ext_passive_douleur: passiveMobilite.rot_ext_passive_douleur ?? 0,
      rot_int_active:
        activeMobilite.rot_int_active ?? passiveMobilite.rot_int_active ?? 0,
      rot_int_active_douleur: activeMobilite.rot_int_active_douleur ?? 0,
      rot_int_passive:
        passiveMobilite.rot_int_passive ?? activeMobilite.rot_int_passive ?? 0,
      rot_int_passive_douleur: passiveMobilite.rot_int_passive_douleur ?? 0,

      elevation_ant_active:
        activeMobilite.elevation_ant_active ??
        passiveMobilite.elevation_ant_active ??
        0,
      elevation_ant_active_douleur:
        activeMobilite.elevation_ant_active_douleur ?? 0,
      elevation_ant_passive:
        passiveMobilite.elevation_ant_passive ??
        activeMobilite.elevation_ant_passive ??
        0,
      elevation_ant_passive_douleur:
        passiveMobilite.elevation_ant_passive_douleur ?? 0,

      retropultion_active:
        activeMobilite.retropultion_active ??
        passiveMobilite.retropultion_active ??
        0,
      retropultion_active_douleur:
        activeMobilite.retropultion_active_douleur ?? 0,
      retropultion_passive:
        passiveMobilite.retropultion_passive ??
        activeMobilite.retropultion_passive ??
        0,
      retropultion_passive_douleur:
        passiveMobilite.retropultion_passive_douleur ?? 0,

      adduction_active:
        activeMobilite.adduction_active ??
        passiveMobilite.adduction_active ??
        0,
      adduction_active_douleur: activeMobilite.adduction_active_douleur ?? 0,
      adduction_passive:
        passiveMobilite.adduction_passive ??
        activeMobilite.adduction_passive ??
        0,
      adduction_passive_douleur: passiveMobilite.adduction_passive_douleur ?? 0,
    },

    testsConflits,

    testsTendineux,

    testsInstabilite,

    testsLaxite,

    palpation,

    examenCervical,
    examenNeurologique,

    bilanFonctionnel: {
      testsSimples: {
        mainBouche:
          examenClinique.mainBoucheStatus ??
          (examenClinique.mainBouche ? "effectue" : "impossible"),
        mainTete:
          examenClinique.mainTeteStatus ??
          (examenClinique.mainTete ? "effectue" : "impossible"),
        mainNuque:
          examenClinique.mainNuqueStatus ??
          (examenClinique.mainNuque ? "effectue" : "impossible"),
        mainDos:
          examenClinique.mainDosStatus ??
          (examenClinique.mainDos ? "effectue" : "impossible"),
      },
      constantScore,
      quickDashScore,
    },
  };
};

function Modal({ children, onClose }) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const content = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-xl w-full p-5 max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default function ExamenCliniqueForm({ session, patient, interrogatoire, patientId, onInterrogatoireUpdate, onPatientMeasurementsUpdate, onSave }) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(() => buildInitialData(session, patient));
  const [infoTest, setInfoTest] = useState(null);

  useEffect(() => {
    setData(buildInitialData(session, patient));
  }, [session, patient]);

  const bmiInfo = getBmiInfo(data.taille, data.poids);

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

  const handleMobiliteMetaChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      mobilite: {
        ...prev.mobilite,
        [field]: value,
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

  const handleTestInstabiliteChange = (test) => {
    setData((prev) => ({
      ...prev,
      testsInstabilite: {
        ...prev.testsInstabilite,
        [test]: !prev.testsInstabilite[test],
      },
    }));
  };

  const handleTestLaxiteChange = (test) => {
    setData((prev) => ({
      ...prev,
      testsLaxite: {
        ...prev.testsLaxite,
        [test]: !prev.testsLaxite[test],
      },
    }));
  };

  const handlePalpationChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      palpation: {
        ...prev.palpation,
        [field]: value,
      },
    }));
  };

  const handleExamenCervicalChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      examenCervical: {
        ...prev.examenCervical,
        [field]: value,
      },
    }));
  };

  const handleExamenNeurologiqueChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      examenNeurologique: {
        ...prev.examenNeurologique,
        [field]: value,
      },
    }));
  };

  const handleBilanFonctionnelSimpleChange = (item, value) => {
    setData((prev) => ({
      ...prev,
      bilanFonctionnel: {
        ...prev.bilanFonctionnel,
        testsSimples: {
          ...prev.bilanFonctionnel.testsSimples,
          [item]: value,
        },
      },
    }));
  };

  const handleBilanConstantScoreChange = (field, value) => {
    setData((prev) => ({
      ...prev,
      bilanFonctionnel: {
        ...prev.bilanFonctionnel,
        constantScore: {
          ...prev.bilanFonctionnel.constantScore,
          [field]: Number.parseInt(value) || 0,
        },
      },
    }));
  };

  const handleBilanQuickDashChange = (question, value) => {
    setData((prev) => ({
      ...prev,
      bilanFonctionnel: {
        ...prev.bilanFonctionnel,
        quickDashScore: {
          ...prev.bilanFonctionnel.quickDashScore,
          [question]: Number.parseInt(value) || 1,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        siegeDouleur: data.siegeDouleur,
        irradiation: data.irradiation,
        intensiteEVA:
          data.intensiteEVA === "" ? null : Number(data.intensiteEVA),
        typeDouleur: data.typeDouleur,
        facteurAggravant: data.facteurAggravant,
        facteurSoulageant: data.facteursoulageant,
        debutDouleur: data.debutDouleur,
        retentissementAVQ: data.retentissementAVQ,
        retentissementProfessionnel: data.retentissementProfessionnel,
        retentissementSommeil: data.retentissementSommeil,
        mobiliteActive: JSON.stringify({
          antepu_active: data.mobilite.antepu_active,
          antepu_active_douleur: data.mobilite.antepu_active_douleur,

          abduction_active: data.mobilite.abduction_active,
          abduction_active_douleur: data.mobilite.abduction_active_douleur,

          rot_ext_active: data.mobilite.rot_ext_active,
          rot_ext_active_douleur: data.mobilite.rot_ext_active_douleur,

          rot_int_active: data.mobilite.rot_int_active,
          rot_int_active_douleur: data.mobilite.rot_int_active_douleur,

          elevation_ant_active: data.mobilite.elevation_ant_active,
          elevation_ant_active_douleur:
            data.mobilite.elevation_ant_active_douleur,

          retropultion_active: data.mobilite.retropultion_active,
          retropultion_active_douleur:
            data.mobilite.retropultion_active_douleur,

          adduction_active: data.mobilite.adduction_active,
          adduction_active_douleur: data.mobilite.adduction_active_douleur,
        }),
        mobilitePassive: JSON.stringify({
          antepu_passive: data.mobilite.antepu_passive,
          antepu_passive_douleur: data.mobilite.antepu_passive_douleur,

          abduction_passive: data.mobilite.abduction_passive,
          abduction_passive_douleur: data.mobilite.abduction_passive_douleur,

          rot_ext_passive: data.mobilite.rot_ext_passive,
          rot_ext_passive_douleur: data.mobilite.rot_ext_passive_douleur,

          rot_int_passive: data.mobilite.rot_int_passive,
          rot_int_passive_douleur: data.mobilite.rot_int_passive_douleur,

          elevation_ant_passive: data.mobilite.elevation_ant_passive,
          elevation_ant_passive_douleur:
            data.mobilite.elevation_ant_passive_douleur,

          retropultion_passive: data.mobilite.retropultion_passive,
          retropultion_passive_douleur:
            data.mobilite.retropultion_passive_douleur,

          adduction_passive: data.mobilite.adduction_passive,
          adduction_passive_douleur: data.mobilite.adduction_passive_douleur,
        }),
        testConflits: JSON.stringify(data.testsConflits),
        testsTendineux: JSON.stringify(data.testsTendineux),
        testsInstabilite: JSON.stringify(data.testsInstabilite),
        testsLaxite: JSON.stringify(data.testsLaxite),
        palpation: JSON.stringify(data.palpation),
        examenCervical: JSON.stringify(data.examenCervical),
        examenNeurologique: JSON.stringify(data.examenNeurologique),
        constantScore: JSON.stringify(data.bilanFonctionnel.constantScore),
        quickDashScore: JSON.stringify(data.bilanFonctionnel.quickDashScore),
        mainBouche:
          data.bilanFonctionnel.testsSimples.mainBouche !== "impossible",
        mainTete: data.bilanFonctionnel.testsSimples.mainTete !== "impossible",
        mainNuque:
          data.bilanFonctionnel.testsSimples.mainNuque !== "impossible",
        mainDos: data.bilanFonctionnel.testsSimples.mainDos !== "impossible",
        mainBoucheStatus: data.bilanFonctionnel.testsSimples.mainBouche,
        mainTeteStatus: data.bilanFonctionnel.testsSimples.mainTete,
        mainNuqueStatus: data.bilanFonctionnel.testsSimples.mainNuque,
        mainDosStatus: data.bilanFonctionnel.testsSimples.mainDos,
      });
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profil patient partagé */}
      <PatientInterrogatoireCard
        interrogatoire={interrogatoire}
        patientId={patientId}
        patient={patient}
        onUpdate={onInterrogatoireUpdate}
        onMeasurementsUpdate={onPatientMeasurementsUpdate}
      />

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
              Type de Douleur
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
                      name="typeDouleur"
                      value={type}
                      checked={data.typeDouleur === type}
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
              htmlFor="facteursoulageant"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Facteur soulageant
            </label>
            <input
              id="facteursoulageant"
              type="text"
              name="facteursoulageant"
              value={data.facteursoulageant}
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
              { key: "elevation_ant", label: "Élévation antérieure" },
              { key: "retropultion", label: "Rétropulsion" },
              { key: "abduction", label: "Élévation latérale" },
              { key: "adduction", label: "Adduction" },
              { key: "rot_ext", label: "Rotation externe" },
              { key: "rot_int", label: "Rotation interne" },
            ].map((mov) => (
              <div key={mov.key} className="contents">
                <div className="text-sm text-gray-700">{mov.label}</div>

                {/* Active */}
                <div className="space-y-1">
                  <input
                    type="number"
                    min="0"
                    value={data.mobilite[`${mov.key}_active`]}
                    onChange={(e) =>
                      handleMobiliteChange(`${mov.key}_active`, e.target.value)
                    }
                    className="input-field text-center w-full"
                    placeholder="0"
                  />
                  <div className="flex items-center gap-3">
                    <label className="text-xs w-24">Angle douleur</label>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={data.mobilite[`${mov.key}_active_douleur`]}
                      onChange={(e) =>
                        handleMobiliteChange(
                          `${mov.key}_active_douleur`,
                          e.target.value,
                        )
                      }
                      className="w-full"
                    />
                    <div className="text-xs w-10 text-right">
                      {data.mobilite[`${mov.key}_active_douleur`]}°
                    </div>
                  </div>
                </div>

                {/* Passive */}
                <div className="space-y-1">
                  <input
                    type="number"
                    min="0"
                    value={data.mobilite[`${mov.key}_passive`]}
                    onChange={(e) =>
                      handleMobiliteChange(`${mov.key}_passive`, e.target.value)
                    }
                    className="input-field text-center w-full"
                    placeholder="0"
                  />
                  <div className="flex items-center gap-3">
                    <label className="text-xs w-24">Angle douleur</label>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={data.mobilite[`${mov.key}_passive_douleur`]}
                      onChange={(e) =>
                        handleMobiliteChange(
                          `${mov.key}_passive_douleur`,
                          e.target.value,
                        )
                      }
                      className="w-full"
                    />
                    <div className="text-xs w-10 text-right">
                      {data.mobilite[`${mov.key}_passive_douleur`]}°
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tests de conflit */}
      <div className="card mb-6">
        <h4 className="font-medium text-gray-800 mb-3">Tests de conflit</h4>
        <div className="flex flex-col gap-3">
          {[
            {
              key: "neer",
              label: "Neer",
              info: "Neer : (conflit avec le bord antérieur de l’acromion)\nConsiste à effectuer une élévation antérieure passive de l’épaule main en pronation, tout en bloquant la rotation de l’omoplate. Il est positif si la douleur apparaît entre 60 et 120° d’élévation antérieure. Elle disparaît main en supination.",
            },
            {
              key: "hawkins",
              label: "Hawkins",
              info: "Le test de HAWKINS : (conflit avec le ligament acromiocoracoidien)\nSe recherche bras à 90° d’élévation antérieure, coude fléchit à 90°, en imprimant un mouvement de rotation interne. Le signe est positif si le patient ressent une douleur qu’il reconnaît.",
            },
            {
              key: "yocum",
              label: "Yocum",
              info: "Le test de YOCUM : (conflit antéro interne)\nSe recherche la main du patient posée sur l’épaule opposée, bras à 90° d’élévation antérieure. On demande au patient de lever le coude au ciel contre résistance. Le signe est positif si le patient ressent une douleur qu’il reconnaît.",
            },
          ].map((test) => (
            <div key={test.key} className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInfoTest(test)}
                className="text-sm text-left text-gray-700 hover:underline inline-flex items-center gap-2"
              >
                <span>{test.label}</span>
                <span className="text-xs text-primary font-medium">
                  Voir détails
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTestConflitChange(test.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  data.testsConflits[test.key]
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {data.testsConflits[test.key] ? "Positif" : "Négatif"}
              </button>
            </div>
          ))}

          {infoTest && (
            <Modal onClose={() => setInfoTest(null)}>
              <div className="flex justify-between items-start">
                <h5 className="font-semibold text-gray-800">
                  {infoTest.label}
                </h5>
                <button
                  onClick={() => setInfoTest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Fermer
                </button>
              </div>
              <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                {infoTest.info}
              </div>
            </Modal>
          )}
        </div>
      </div>

      {/* Tests tendineux */}
      <div className="card">
        <h4 className="font-medium text-gray-800 mb-3">Tests tendineux</h4>
        <div className="flex flex-col gap-3">
          {[
            {
              key: "jobe",
              label: "Jobe",
              info: "Manoeuvre de Jobe (Supra épineux)\nBras en abduction à 90° et flexion de 30° (plan de la scapula),\n• Pouce vers le bas\n• On demande au patient de relever les bras",
            },
            {
              key: "patte",
              label: "Patte",
              info: "Manoeuvre de Patte : (Infra épineux, Petit rond)\nBras en élévation latérale à 90°, dans le plan de la scapula\n• Coude en flexion 90° soutenu par examinateur (= position RE2)\n• Rotation latérale contre résistance",
            },
            {
              key: "gerber",
              label: "Gerber",
              info: "Test de Gerber (Lift off test) : (Sub scapulaire)\nLe sujet met la main dans le dos et essaie de maintenir la main décollée du plan du dos. Le test est positif si le patient ne peut pas tenir la position.\nUne rotation interne douloureuse ou déficitaire rend impossible la réalisation de ce test. Utiliser la manoeuvre du Press – Belly Test : on demande au patient d’appuyer sur son ventre avec la paume de la main en décollant le coude du corps. S’il ramène le coude au corps, le test est positif signant l’atteinte du subscapulaire.",
            },
            {
              key: "palmUp",
              label: "Palm Up",
              info: "PALM UP TEST (longue portion du biceps)\nEst le test du long biceps. Le patient a le bras en antépulsion à 90°. Le médecin s’oppose à l’élévation antérieure du bras. Le test est positif s’il reproduit une douleur sur le trajet du long biceps. Le signe de ‘Popey’ est en faveur d’une rupture du tendon.",
            },
          ].map((test) => (
            <div key={test.key} className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInfoTest(test)}
                className="text-sm text-left text-gray-700 hover:underline inline-flex items-center gap-2"
              >
                <span>{test.label}</span>
                <span className="text-xs text-primary font-medium">
                  Voir détails
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTestTendineuChange(test.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  data.testsTendineux[test.key]
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {data.testsTendineux[test.key] ? "Positif" : "Négatif"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instabilité */}
      <div className="card mt-6">
        <h4 className="font-medium text-gray-800 mb-3">Instabilité</h4>
        <div className="space-y-4">
          <div>
            <div className="font-medium text-gray-700 mb-2">
              Instabilité antérieure
            </div>
            <div className="flex flex-col gap-3">
              {[
                {
                  key: "arme",
                  label: "Test de l'armé du bras",
                  info: "Test de l’armé du bras: bras en abduction à 90°, coude fléchi\nProgressivement imprimer une rotation externe.\nUn certain seuil déclenche la sensation d'appréhension.\nTrès spécifique d'une instabilité.",
                },
                {
                  key: "relocation",
                  label: "Test de recentrage (Relocation test)",
                  info: "Test de recentrage ou Relocation test :\nRecherche du même signe, mais sur un patient allongé.\nAu moment de la survenue de l’appréhension, l’examinateur imprime alors une translation antéropostérieure sur la tête humérale (ce qui recentre l’articulation glénohumérale).\nL’appréhension disparaît alors.",
                },
              ].map((test) => (
                <div
                  key={test.key}
                  className="flex items-center justify-between"
                >
                  <button
                    type="button"
                    onClick={() => setInfoTest(test)}
                    className="text-sm text-left text-gray-700 hover:underline inline-flex items-center gap-2"
                  >
                    <span>{test.label}</span>
                    <span className="text-xs text-primary font-medium">
                      Voir détails
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestInstabiliteChange(test.key)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                      data.testsInstabilite[test.key]
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {data.testsInstabilite[test.key] ? "Positif" : "Négatif"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700 mb-2">
              Instabilité postérieure
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setInfoTest({
                    key: "post",
                    label: "Instabilité postérieure",
                    info: "Instabilité postérieure:\nExaminateur bloque l’omoplate, l’autre effectue une poussée vers l’arrière sur le coude, bras à 90° d’élévation antérieure, en légère adduction et en rotation interne.\nPositif = mise en évidence d'un recul de la tête humérale ou une appréhension.",
                  })
                }
                className="text-sm text-left text-gray-700 hover:underline inline-flex items-center gap-2"
              >
                <span>Instabilité postérieure</span>
                <span className="text-xs text-primary font-medium">
                  Voir détails
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTestInstabiliteChange("post")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  data.testsInstabilite.post
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {data.testsInstabilite.post ? "Positif" : "Négatif"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Laxité */}
      <div className="card mt-6">
        <h4 className="font-medium text-gray-800 mb-3">Laxité</h4>
        <div className="space-y-4">
          <div>
            <div className="font-medium text-gray-700 mb-2">
              Test du sillon (Sulcus test)
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  setInfoTest({
                    key: "sulcus",
                    label: "Test du sillon (Sulcus test)",
                    info: "Test du sillon = sulcus test :\nPatient bien détendu, tirer doucement le membre supérieur vers le bas.\nLe test est positif lorsque la traction provoque une descente de la tête humérale, objectivée par l'apparition d'un sillon en dessous du bord externe de l'acromion.\nIndicatif d'hyperlaxité.",
                  })
                }
                className="text-sm text-left text-gray-700 hover:underline inline-flex items-center gap-2"
              >
                <span>Test du sillon</span>
                <span className="text-xs text-primary font-medium">
                  Voir détails
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTestLaxiteChange("sulcus")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  data.testsLaxite.sulcus
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {data.testsLaxite.sulcus ? "Positif" : "Négatif"}
              </button>
            </div>
          </div>

          <div>
            <div className="font-medium text-gray-700 mb-2">
              Tiroir antéro-postérieur
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  setInfoTest({
                    key: "tiroir",
                    label: "Tiroir antéro-postérieur",
                    info: "Tiroir antéro-postérieur :\nPatient assis, bien détendu, légèrement penché en avant. Il laisse pendre les deux membres supérieurs.\nUne main de l'examinateur maintient la ceinture scapulaire, l'autre saisit la tête humérale et essaie de provoquer un tiroir antérieur puis postérieur.\nPeut se rechercher également sur un patient en décubitus dorsal.",
                  })
                }
                className="text-sm text-left text-gray-700 hover:underline inline-flex items-center gap-2"
              >
                <span>Tiroir antéro-postérieur</span>
                <span className="text-xs text-primary font-medium">
                  Voir détails
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTestLaxiteChange("tiroir")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  data.testsLaxite.tiroir
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {data.testsLaxite.tiroir ? "Positif" : "Négatif"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Palpation */}
      <div className="card mt-6">
        <h4 className="font-medium text-gray-800 mb-3">Palpation</h4>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="palpationReliefsOsseux"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Les reliefs osseux
            </label>
            <textarea
              id="palpationReliefsOsseux"
              value={data.palpation.reliefsOsseux}
              onChange={(e) =>
                handlePalpationChange("reliefsOsseux", e.target.value)
              }
              className="input-field min-h-28"
              placeholder="Saisie des reliefs osseux"
            />
          </div>

          <div>
            <label
              htmlFor="palpationInsertionsTendineuses"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Les insertions tendineuses
            </label>
            <textarea
              id="palpationInsertionsTendineuses"
              value={data.palpation.insertionsTendineuses}
              onChange={(e) =>
                handlePalpationChange("insertionsTendineuses", e.target.value)
              }
              className="input-field min-h-28"
              placeholder="Saisie des insertions tendineuses"
            />
          </div>
        </div>
      </div>

      {/* Autre examen */}
      <div className="card mt-6">
        <h4 className="font-medium text-gray-800 mb-3">Autre examen</h4>
        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <h5 className="font-medium text-gray-800">
              Examen du rachis cervicale
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="douleurCervicale"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Douleur cervicale
                </label>
                <select
                  id="douleurCervicale"
                  value={data.examenCervical.douleurCervicale ? "oui" : "non"}
                  onChange={(e) =>
                    handleExamenCervicalChange(
                      "douleurCervicale",
                      e.target.value === "oui",
                    )
                  }
                  className="input-field"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="ncb"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  NCB
                </label>
                <select
                  id="ncb"
                  value={data.examenCervical.ncb ? "oui" : "non"}
                  onChange={(e) =>
                    handleExamenCervicalChange("ncb", e.target.value === "oui")
                  }
                  className="input-field"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <h5 className="font-medium text-gray-800">Examen neurologique</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sensibiliteConservee"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sensibilité conservée
                </label>
                <select
                  id="sensibiliteConservee"
                  value={
                    data.examenNeurologique.sensibiliteConservee ? "oui" : "non"
                  }
                  onChange={(e) =>
                    handleExamenNeurologiqueChange(
                      "sensibiliteConservee",
                      e.target.value === "oui",
                    )
                  }
                  className="input-field"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="reflexesOsteoTendineux"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Réflexes Ostéo-Tendineux
                </label>
                <select
                  id="reflexesOsteoTendineux"
                  value={data.examenNeurologique.reflexesOsteoTendineux}
                  onChange={(e) =>
                    handleExamenNeurologiqueChange(
                      "reflexesOsteoTendineux",
                      e.target.value,
                    )
                  }
                  className="input-field"
                >
                  <option value="normale">Normale</option>
                  <option value="aboli">Aboli</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bilan fonctionnel */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Bilan fonctionnel</h3>
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 p-4">
            <h4 className="font-medium text-gray-800 mb-3">
              Tests fonctionnels simples
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Effectué / Effectué avec difficulté / Impossible
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "mainBouche", label: "Main - bouche" },
                { key: "mainTete", label: "Main - tête" },
                { key: "mainNuque", label: "Main - nuque" },
                { key: "mainDos", label: "Main - dos" },
              ].map((item) => (
                <div key={item.key}>
                  <label
                    htmlFor={`bilan-simple-${item.key}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {item.label}
                  </label>
                  <select
                    id={`bilan-simple-${item.key}`}
                    value={data.bilanFonctionnel.testsSimples[item.key]}
                    onChange={(e) =>
                      handleBilanFonctionnelSimpleChange(
                        item.key,
                        e.target.value,
                      )
                    }
                    className="input-field"
                  >
                    <option value="effectue">Effectué</option>
                    <option value="difficulte">Effectué avec difficulté</option>
                    <option value="impossible">Impossible</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-6">
            <h4 className="font-medium text-gray-800">Tests spécifiques</h4>

            <div>
              <button
                type="button"
                onClick={() =>
                  setInfoTest({
                    key: "constant-score-info",
                    label: "Constant Score",
                    info: CONSTANT_SCORE_INFO_TEXT,
                  })
                }
                className="font-medium text-gray-700 mb-3 hover:underline inline-flex items-center gap-2"
              >
                <span>Constant Score</span>
                <span className="text-xs text-primary font-medium">
                  Voir barème
                </span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Douleur (0-15)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={data.bilanFonctionnel.constantScore.douleur}
                    onChange={(e) =>
                      handleBilanConstantScoreChange("douleur", e.target.value)
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activités (0-20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={data.bilanFonctionnel.constantScore.activites}
                    onChange={(e) =>
                      handleBilanConstantScoreChange(
                        "activites",
                        e.target.value,
                      )
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobilité (0-40)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={data.bilanFonctionnel.constantScore.mobilite}
                    onChange={(e) =>
                      handleBilanConstantScoreChange("mobilite", e.target.value)
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Force (0-25)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={data.bilanFonctionnel.constantScore.force}
                    onChange={(e) =>
                      handleBilanConstantScoreChange("force", e.target.value)
                    }
                    className="input-field"
                  />
                </div>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium text-primary">
                  Total:{" "}
                  {Object.values(data.bilanFonctionnel.constantScore).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                  /100
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-3">
                QuickDASH Score
              </h5>
              <p className="text-xs text-gray-500 mb-3">
                Répondre à chaque question (1-5): 1=Aucune difficulté,
                5=Impossible
              </p>
              <div className="space-y-3">
                {BILAN_QUICKDASH_QUESTIONS.map((question, idx) => (
                  <div key={`bilan-quickdash-${idx + 1}`}>
                    <label
                      htmlFor={`bilan-quickdash-${idx + 1}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {idx + 1}. {question}
                    </label>
                    <select
                      id={`bilan-quickdash-${idx + 1}`}
                      value={
                        data.bilanFonctionnel.quickDashScore[`q${idx + 1}`]
                      }
                      onChange={(e) =>
                        handleBilanQuickDashChange(
                          `q${idx + 1}`,
                          e.target.value,
                        )
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
              <div className="bg-primary/10 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium text-primary">
                  Total:{" "}
                  {Object.values(data.bilanFonctionnel.quickDashScore).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                  /55
                </p>
              </div>
            </div>
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
      typeDouleur: PropTypes.string,
      facteurAggravant: PropTypes.string,
      facteursoulageant: PropTypes.string,
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
      testsInstabilite: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
      ]),
      testsLaxite: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      palpation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      examenCervical: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      examenNeurologique: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
      ]),
      constantScore: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      quickDashScore: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      mainBouche: PropTypes.bool,
      mainTete: PropTypes.bool,
      mainNuque: PropTypes.bool,
      mainDos: PropTypes.bool,
      mainBoucheStatus: PropTypes.string,
      mainTeteStatus: PropTypes.string,
      mainNuqueStatus: PropTypes.string,
      mainDosStatus: PropTypes.string,
    }),
    examen_clinique: PropTypes.object,
  }),
  patient: PropTypes.shape({
    patient: PropTypes.shape({
      age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    gender: PropTypes.string,
  }),
  interrogatoire: PropTypes.object,
  patientId: PropTypes.string,
  onInterrogatoireUpdate: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};
