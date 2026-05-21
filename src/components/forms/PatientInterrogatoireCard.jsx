import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import api from "../../services/api";
import { toast } from "react-toastify";

const EMPTY = {
  age: "",
  height: "",
  weight: "",
  profession: "",
  couvertureSociale: "",
  membreDominant: "",
  membreAtteint: "",
  activiteSportive: "",
  frequenceSportPratiquee: "",
  intensitePratique: 5,
  antecedentsMedicauxEnabled: false,
  antecedentsMedicauxDetails: "",
  antecedentsChirurgicauxEnabled: false,
  antecedentsChirurgicauxDetails: "",
  plainte: "",
  historique: "",
};

const MEMBRE_LABELS = {
  DROIT: "Droit",
  GAUCHE: "Gauche",
  BILATERAL: "Bilatéral",
  AUCUN: "Aucun",
};

// Map any legacy French/lowercase stored value to the select option value
function normalizeSexe(val) {
  if (!val) return "";
  if (["MALE", "FEMALE", "OTHER"].includes(val)) return val;
  const v = val.toLowerCase().trim();
  if (["masculin", "mâle", "male", "homme", "m"].includes(v)) return "MALE";
  if (["féminin", "feminin", "femelle", "female", "femme", "f"].includes(v)) return "FEMALE";
  if (["autre", "other"].includes(v)) return "OTHER";
  return "";
}

function normalizeMembre(val) {
  if (!val) return "";
  if (["DROIT", "GAUCHE", "BILATERAL", "AUCUN"].includes(val)) return val;
  const v = val.toLowerCase().trim();
  if (["droit", "droite", "right"].includes(v)) return "DROIT";
  if (["gauche", "left"].includes(v)) return "GAUCHE";
  if (["bilateral", "bilatéral", "bilateral", "les deux"].includes(v)) return "BILATERAL";
  if (["aucun", "none"].includes(v)) return "AUCUN";
  return "";
}

function Field({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function EditModal({ patientId, current, patient, onClose, onSaved, onMeasurementsUpdate }) {
  const [form, setForm] = useState({
    ...EMPTY,
    // Seed measurements from patient object
    age:    patient?.age    ?? patient?.patient?.age    ?? "",
    height: patient?.height ?? patient?.patient?.height ?? "",
    weight: patient?.weight ?? patient?.patient?.weight ?? "",
    ...current,
    // Normalize stored values → valid select option values
    membreDominant: normalizeMembre(current?.membreDominant),
    membreAtteint:  normalizeMembre(current?.membreAtteint),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const num = (v) => (v !== "" && v != null ? Number(v) : undefined);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put(
        `/doctors/patients/${patientId}/interrogatoire`,
        {
          age:    num(form.age),
          height: num(form.height),
          weight: num(form.weight),
          profession: form.profession || undefined,
          couvertureSociale: form.couvertureSociale || undefined,
          membreDominant: form.membreDominant || undefined,
          membreAtteint: form.membreAtteint || undefined,
          activiteSportive: form.activiteSportive || undefined,
          frequenceSportPratiquee: form.frequenceSportPratiquee || undefined,
          intensitePratique: num(form.intensitePratique),
          antecedentsMedicauxEnabled: form.antecedentsMedicauxEnabled,
          antecedentsMedicauxDetails: form.antecedentsMedicauxDetails || undefined,
          antecedentsChirurgicauxEnabled: form.antecedentsChirurgicauxEnabled,
          antecedentsChirurgicauxDetails: form.antecedentsChirurgicauxDetails || undefined,
          plainte: form.plainte || undefined,
          historique: form.historique || undefined,
        },
      );
      toast.success("Profil patient mis à jour");
      onSaved(res.data);
      if (onMeasurementsUpdate) {
        onMeasurementsUpdate({
          age:    num(form.age)    ?? null,
          height: num(form.height) ?? null,
          weight: num(form.weight) ?? null,
        });
      }
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        aria-label="Fermer la fenêtre modale"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative mx-auto mt-8 bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            Modifier le profil patient
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Anthropometrics */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Âge (ans)</label>
              <input type="number" min="0" max="120" value={form.age} onChange={(e) => set("age", e.target.value)} className="input-field" placeholder="Ex: 35" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
              <input type="number" min="0" max="300" value={form.height} onChange={(e) => set("height", e.target.value)} className="input-field" placeholder="Ex: 175" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
              <input type="number" min="0" max="500" value={form.weight} onChange={(e) => set("weight", e.target.value)} className="input-field" placeholder="Ex: 70" />
            </div>
          </div>

          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profession
              </label>
              <input
                type="text"
                value={form.profession}
                onChange={(e) => set("profession", e.target.value)}
                className="input-field"
                placeholder="Profession"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couverture sociale
              </label>
              <input
                type="text"
                value={form.couvertureSociale}
                onChange={(e) => set("couvertureSociale", e.target.value)}
                className="input-field"
                placeholder="CNAS, CASNOS…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membre dominant
              </label>
              <select
                value={form.membreDominant}
                onChange={(e) => set("membreDominant", e.target.value)}
                className="input-field"
              >
                <option value="">—</option>
                <option value="DROIT">Droit</option>
                <option value="GAUCHE">Gauche</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membre atteint
              </label>
              <select
                value={form.membreAtteint}
                onChange={(e) => set("membreAtteint", e.target.value)}
                className="input-field"
              >
                <option value="">—</option>
                <option value="DROIT">Droit</option>
                <option value="GAUCHE">Gauche</option>
                <option value="BILATERAL">Bilatéral</option>
                <option value="AUCUN">Aucun</option>
              </select>
            </div>
          </div>

          {/* Sport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activité sportive
              </label>
              <input
                type="text"
                value={form.activiteSportive}
                onChange={(e) => set("activiteSportive", e.target.value)}
                className="input-field"
                placeholder="Ex: natation, football…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fréquence de pratique
              </label>
              <input
                type="text"
                value={form.frequenceSportPratiquee}
                onChange={(e) =>
                  set("frequenceSportPratiquee", e.target.value)
                }
                className="input-field"
                placeholder="Ex: 3 fois/sem"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intensité de pratique: {form.intensitePratique}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={form.intensitePratique}
                onChange={(e) => set("intensitePratique", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Antecedents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-medium text-gray-800 text-sm">
                  Antécédents médicaux
                </h4>
                <select
                  value={form.antecedentsMedicauxEnabled ? "oui" : "non"}
                  onChange={(e) =>
                    set("antecedentsMedicauxEnabled", e.target.value === "oui")
                  }
                  className="input-field w-24 text-sm"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>
              {form.antecedentsMedicauxEnabled && (
                <textarea
                  value={form.antecedentsMedicauxDetails}
                  onChange={(e) =>
                    set("antecedentsMedicauxDetails", e.target.value)
                  }
                  className="input-field min-h-20 text-sm"
                  placeholder="Détails…"
                />
              )}
            </div>
            <div className="space-y-3 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-medium text-gray-800 text-sm">
                  Antécédents chirurgicaux
                </h4>
                <select
                  value={form.antecedentsChirurgicauxEnabled ? "oui" : "non"}
                  onChange={(e) =>
                    set(
                      "antecedentsChirurgicauxEnabled",
                      e.target.value === "oui",
                    )
                  }
                  className="input-field w-24 text-sm"
                >
                  <option value="non">Non</option>
                  <option value="oui">Oui</option>
                </select>
              </div>
              {form.antecedentsChirurgicauxEnabled && (
                <textarea
                  value={form.antecedentsChirurgicauxDetails}
                  onChange={(e) =>
                    set("antecedentsChirurgicauxDetails", e.target.value)
                  }
                  className="input-field min-h-20 text-sm"
                  placeholder="Détails…"
                />
              )}
            </div>
          </div>

          {/* Plainte / Historique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plainte principale
            </label>
            <input
              type="text"
              value={form.plainte}
              onChange={(e) => set("plainte", e.target.value)}
              className="input-field"
              placeholder="Motif de consultation principal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Historique
            </label>
            <textarea
              value={form.historique}
              onChange={(e) => set("historique", e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="ATCD, contexte, chronologie…"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            {saving ? "Sauvegarde…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
EditModal.propTypes = {
  patientId: PropTypes.string.isRequired,
  current: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// ── Anthropometric helpers ───────────────────────────────────────────────────
function calcBmi(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w || h <= 0 || w <= 0) return null;
  return w / ((h / 100) * (h / 100));
}

function getBmiCategory(bmi) {
  if (bmi === null) return null;
  if (bmi < 18.5) return { label: "Insuffisance pondérale", color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (bmi < 25)   return { label: "Normal",                 color: "text-green-700 bg-green-50 border-green-200" };
  if (bmi < 30)   return { label: "Surpoids",               color: "text-amber-700 bg-amber-50 border-amber-200" };
  if (bmi < 35)   return { label: "Obésité modérée",        color: "text-orange-700 bg-orange-50 border-orange-200" };
  return           { label: "Obésité sévère",               color: "text-red-700 bg-red-50 border-red-200" };
}

function BmiChip({ bmi }) {
  if (bmi === null) return <span className="text-sm text-gray-400">—</span>;
  const cat = getBmiCategory(bmi);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${cat.color}`}>
      {bmi.toFixed(1)}
      <span className="font-normal opacity-80">{cat.label}</span>
    </span>
  );
}
BmiChip.propTypes = { bmi: PropTypes.number };

// ── Main exported component ──────────────────────────────────────────────────
export default function PatientInterrogatoireCard({
  interrogatoire,
  patientId,
  patient,
  onUpdate,
  onMeasurementsUpdate,
}) {
  const [editing, setEditing] = useState(false);
  const q = interrogatoire ?? {};

  // Resolve patient measurements from either flat or nested structure
  const age    = patient?.age    ?? patient?.patient?.age    ?? null;
  const height = patient?.height ?? patient?.patient?.height ?? null;
  const weight = patient?.weight ?? patient?.patient?.weight ?? null;
  const bmi    = calcBmi(height, weight);

  // Gender comes from User model, not from interrogatoire
  const genderNorm = normalizeSexe(patient?.gender);
  const genderLabel =
    genderNorm === "MALE" ? "Homme" :
    genderNorm === "FEMALE" ? "Femme" :
    genderNorm === "OTHER" ? "Autre" : null;

  return (
    <>
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-sm">👤</span>
            <h3 className="text-sm font-semibold text-blue-800">
              Profil patient – commun à toutes les sessions
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-100 transition-colors"
          >
            Modifier
          </button>
        </div>

        {/* Read-only anthropometrics (always shown) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 pb-4 border-b border-blue-100">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Âge</p>
            <p className="text-sm font-medium text-gray-800">
              {age != null ? `${age} ans` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Taille</p>
            <p className="text-sm font-medium text-gray-800">
              {height != null ? `${height} cm` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Poids</p>
            <p className="text-sm font-medium text-gray-800">
              {weight != null ? `${weight} kg` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">IMC</p>
            <BmiChip bmi={bmi} />
          </div>
        </div>

        {/* Interrogatoire fields */}
        {!interrogatoire ? (
          <p className="text-sm text-gray-500 italic">
            Aucun profil enregistré.{" "}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-blue-600 underline"
            >
              Créer le profil
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            <Field label="Sexe" value={genderLabel} />
            <Field label="Profession" value={q.profession} />
            <Field label="Couverture sociale" value={q.couvertureSociale} />
            <Field label="Membre dominant" value={MEMBRE_LABELS[q.membreDominant] ?? q.membreDominant} />
            <Field label="Membre atteint" value={MEMBRE_LABELS[q.membreAtteint] ?? q.membreAtteint} />
            <Field label="Activité sportive" value={q.activiteSportive} />
            <Field label="Fréquence sport" value={q.frequenceSportPratiquee} />
            {q.intensitePratique != null && (
              <Field label="Intensité pratique" value={`${q.intensitePratique}/10`} />
            )}
            {q.antecedentsMedicauxEnabled && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-gray-500 mb-0.5">Antécédents médicaux</p>
                <p className="text-sm text-gray-800">{q.antecedentsMedicauxDetails || "—"}</p>
              </div>
            )}
            {q.antecedentsChirurgicauxEnabled && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-gray-500 mb-0.5">Antécédents chirurgicaux</p>
                <p className="text-sm text-gray-800">{q.antecedentsChirurgicauxDetails || "—"}</p>
              </div>
            )}
            {q.plainte && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-gray-500 mb-0.5">Plainte principale</p>
                <p className="text-sm text-gray-800">{q.plainte}</p>
              </div>
            )}
            {q.historique && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-gray-500 mb-0.5">Historique</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.historique}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <EditModal
          patientId={patientId}
          current={interrogatoire}
          patient={patient}
          onClose={() => setEditing(false)}
          onSaved={onUpdate}
          onMeasurementsUpdate={onMeasurementsUpdate}
        />
      )}
    </>
  );
}

PatientInterrogatoireCard.propTypes = {
  interrogatoire: PropTypes.object,
  patientId: PropTypes.string.isRequired,
  patient: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onMeasurementsUpdate: PropTypes.func,
};
