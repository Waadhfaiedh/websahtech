// Redesigned following SAHTECK brand guidelines
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowRight,
  CalendarClock,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";

const CARD_SHADOW = "0 2px 12px rgba(0,82,255,0.08)";
const PAGE_BG = "#F8FAFF";

export default function PatientsPage() {
  const { t } = useTranslation();
  useAuth();
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
      "fr-FR",
    );
  };

  const getPatientAge = (patient) => patient.patient?.age ?? "—";

  if (loading) {
    return (
      <div
        className="min-h-full px-4 py-6 sm:px-6 lg:px-8"
        style={{ background: PAGE_BG }}
      >
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div
            className="rounded-[24px] bg-white p-6 sm:p-8"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <div className="h-3 w-28 rounded-full bg-slate-100" />
            <div className="mt-4 h-8 w-64 rounded bg-slate-100" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100" />
          </div>

          <div
            className="rounded-[12px] bg-white p-4 sm:p-5"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <div className="h-12 rounded-[8px] bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="rounded-[12px] bg-white p-5"
                style={{ boxShadow: CARD_SHADOW }}
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-slate-100" />
                </div>
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-11/12 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-full px-4 py-6 sm:px-6 lg:px-8"
        style={{ background: PAGE_BG }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] p-4 text-center text-[#EF4444] shadow-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: PAGE_BG }}
    >
      <div className="mx-auto max-w-6xl animate-fadeIn space-y-6">
        <section
          className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 text-white"
          style={{
            background: "linear-gradient(135deg, #0052FF, #00A3FF)",
            boxShadow: CARD_SHADOW,
          }}
        >
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/10 translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-1/2 h-28 w-28 rounded-full bg-white/10 translate-y-10" />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white/95 backdrop-blur-sm">
                <Stethoscope size={16} />
                Suivi patient centralisé
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-[32px]">
                  {t("patients.title")}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                  Gérez vos patients assignés avec une vue claire, rapide et
                  cohérente avec l’identité SAHTECK.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[12px] bg-white/12 px-4 py-3 backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                  Patients assignés
                </p>
                <p className="text-2xl font-semibold leading-tight">
                  {totalCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        <PageHeader
          title={t("patients.title")}
          subtitle={`${totalCount} patient${totalCount > 1 ? "s" : ""} assigné${totalCount > 1 ? "s" : ""}`}
        />

        <div
          className="rounded-[12px] bg-white p-4 sm:p-5"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            {t("patients.search")}
          </label>
          <div className="relative">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[8px] bg-[#F1F5F9] py-3 pl-12 pr-4 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]/20"
              placeholder={t("patients.search")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((patient, index) => (
            <Link
              to={`/specialist/patients/${patient.userId}`}
              key={patient.userId}
              className="group rounded-[12px] bg-white p-5 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#EFF6FF] hover:shadow-[0_8px_30px_rgba(0,82,255,0.10)]"
              style={{
                boxShadow: CARD_SHADOW,
                backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8FAFF",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-sm font-bold text-white shadow-sm">
                    {patient.fullName?.charAt(0) ?? "?"}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="truncate text-[18px] font-semibold text-[#0A0F1E] transition-colors group-hover:text-[#0052FF]">
                      {patient.fullName}
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      {getPatientAge(patient)} ans
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge label={t("patients.active")} color="active" />
                  <ArrowRight
                    size={20}
                    className="mt-0.5 text-[#0052FF] transition-transform duration-200 ease-in-out group-hover:translate-x-1"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#0052FF]">
                    <Stethoscope size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
                      {t("patients.condition")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0A0F1E]">
                      {getPrimaryCondition(patient)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#0052FF]">
                    <CalendarClock size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
                      {t("patients.last_visit")}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {getLastVisitDate(patient)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div
              className="col-span-full flex min-h-[320px] items-center justify-center rounded-[12px] bg-white px-6 py-12 text-center"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div className="max-w-sm space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <Users size={48} className="text-[#CBD5E1]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[18px] font-semibold text-[#0A0F1E]">
                    Aucun patient trouvé
                  </h3>
                  <p className="text-sm leading-6 text-[#64748B]">
                    Essayez un autre terme de recherche pour retrouver un
                    patient.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
