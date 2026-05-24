import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import api from "../../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = { name: "", address: "", phone: "", email: "" };

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/users/clinics");
      const data = res.data?.data ?? res.data;
      setClinics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load clinics:", err);
      setError(err.response?.data?.message || "Impossible de charger les cliniques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Le nom est requis";
    if (!form.address.trim()) errs.address = "L'adresse est requise";
    if (!form.phone.trim()) errs.phone = "Le téléphone est requis";
    if (!form.email.trim()) {
      errs.email = "L'email est requis";
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errs.email = "Email invalide";
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/doctors/clinics", {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      });
      toast.success("Clinique créée avec succès");
      setShowCreate(false);
      setForm(emptyForm);
      setFormErrors({});
      fetchClinics();
    } catch (err) {
      console.error("Failed to create clinic:", err);
      toast.error(err.response?.data?.message || "Impossible de créer la clinique");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowCreate(false);
    setForm(emptyForm);
    setFormErrors({});
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title="Mes Cliniques"
          subtitle={`${clinics.length} clinique${clinics.length !== 1 ? "s" : ""}`}
          action={
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer une clinique
            </button>
          }
        />

        {loading && (
          <div className="card flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="card flex flex-col items-center py-16 text-center">
            <svg className="w-10 h-10 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={fetchClinics} className="btn-secondary mt-4">Réessayer</button>
          </div>
        )}

        {!loading && !error && clinics.length === 0 && (
          <div className="card flex flex-col items-center py-16 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 font-medium text-lg">Aucune clinique enregistrée</p>
            <p className="text-gray-400 text-sm mt-1">Cliquez sur "Créer une clinique" pour commencer</p>
          </div>
        )}

        {!loading && !error && clinics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {clinics.map((clinic) => (
              <div
                key={clinic.clinicId}
                className="card hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{clinic.name}</h3>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="break-words">{clinic.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{clinic.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{clinic.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showCreate} onClose={handleClose} title="Créer une clinique">
          <div className="space-y-4">
            {[
              { label: "Nom de la clinique", field: "name", placeholder: "Ex: Clinique Al Amal", type: "text" },
              { label: "Adresse", field: "address", placeholder: "Ex: 12 rue Ibn Khaldoun, Tunis", type: "text" },
              { label: "Téléphone", field: "phone", placeholder: "Ex: +216 71 000 000", type: "tel" },
              { label: "Email", field: "email", placeholder: "Ex: contact@clinique.tn", type: "email" },
            ].map(({ label, field, placeholder, type }) => (
              <div key={field}>
                <label htmlFor={`clinic-${field}`} className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  id={`clinic-${field}`}
                  type={type}
                  value={form[field]}
                  onChange={handleChange(field)}
                  placeholder={placeholder}
                  className={`input-field ${formErrors[field] ? "border-red-400 focus:ring-red-400" : ""}`}
                />
                {formErrors[field] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors[field]}</p>
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleClose} className="btn-secondary flex-1 justify-center">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex-1 justify-center disabled:opacity-60"
              >
                {submitting ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
  );
}
