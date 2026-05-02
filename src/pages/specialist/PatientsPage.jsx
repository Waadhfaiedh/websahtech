import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function PatientsPage() {
  const { t } = useTranslation();
  const { specialist } = useAuth();
  const [patients, setPatients] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctors/get-patients");
      console.log("Patients response:", res);

      // Extract patients array and count from the response
      const patientsData = res.data.patients ?? res.data.data ?? res.data;
      const count =
        res.data.count ??
        (Array.isArray(patientsData) ? patientsData.length : 0);

      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setTotalCount(count);
      setError(null);
    } catch (err) {
      console.error("Failed to load patients:", err);
      setError("Impossible de charger vos patients");
      toast.error(
        err.response?.data?.message || "Impossible de charger vos patients",
      );
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filtered = patients.filter(
    (p) =>
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient?.appointments?.[0]?.reason
        ?.toLowerCase()
        .includes(search.toLowerCase()),
  );

  const getPrimaryCondition = (patient) => {
    const appointments = patient.patient?.appointments;
    return appointments?.length ? appointments[0].reason : "—";
  };

  const getLastVisitDate = (patient) => {
    const lastAppointment = patient.patient?.appointments?.[0];
    if (!lastAppointment?.AvailableSlot?.date) return "—";
    return new Date(lastAppointment.AvailableSlot.date).toLocaleDateString(
      "fr-FR"
    );
  };

  const getPatientAge = (patient) => patient.patient?.age ?? "—";

  if (loading) {
    return (
      <SpecialistLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SpecialistLayout>
    );
  }

  if (error) {
    return (
      <SpecialistLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
            {error}
          </div>
        </div>
      </SpecialistLayout>
    );
  }

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t("patients.title")}
          subtitle={`${totalCount} patient${totalCount > 1 ? "s" : ""} assigné${totalCount > 1 ? "s" : ""}`}
        />

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder={t("patients.search")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((patient) => (
            <Link
              to={`/specialist/patients/${patient.userId}`}
              key={patient.userId}
              className="card hover:shadow-md hover:border-primary/20 transition-all duration-200 group cursor-pointer border border-gray-100"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">
                    {patient.fullName?.charAt(0) ?? "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                    {patient.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getPatientAge(patient)} ans
                  </p>
                </div>
                <Badge label={t("patients.active")} color="active" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">
                    {t("patients.condition")}
                  </span>
                  <span className="text-xs text-gray-800 font-medium">
                    {getPrimaryCondition(patient)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">
                    {t("patients.last_visit")}
                  </span>
                  <span className="text-xs text-gray-600">
                    {getLastVisitDate(patient)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-4 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p>{t("common.no_data")}</p>
            </div>
          )}
        </div>
      </div>
    </SpecialistLayout>
  );
}
