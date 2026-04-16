import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import api from "../../services/api";

export default function PlanningPage() {
  const { t } = useTranslation();
  const today = new Date();
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
  const [appointmentFilter, setAppointmentFilter] = useState("ALL");
  const [creatingSlot, setCreatingSlot] = useState(false);
  const [updatingSlot, setUpdatingSlot] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showSlotDetails, setShowSlotDetails] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [selectedDayKey, setSelectedDayKey] = useState("");
  const [slotForm, setSlotForm] = useState({
    date: "",
    startTime: "08:00",
    endTime: "17:00",
    place: "",
  });
  const [slotEditForm, setSlotEditForm] = useState({
    date: "",
    startTime: "08:00",
    endTime: "17:00",
    place: "",
    isBooked: false,
  });

  const formatDateKey = (value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateLabel = (value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  const formatTimeLabel = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const normalizeSlots = (rows) => {
    return (Array.isArray(rows) ? rows : [])
      .map((slot) => ({
        id: slot.availabilityId,
        availabilityId: slot.availabilityId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: slot.isBooked,
        place: slot.place || "-",
        dayKey: formatDateKey(slot.startTime || slot.date),
        dateLabel: formatDateLabel(slot.startTime || slot.date),
        startLabel: formatTimeLabel(slot.startTime),
        endLabel: formatTimeLabel(slot.endTime),
      }))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  };

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      const res = await api.get("/doctors/daily-slots");
      const payload = res.data?.data ?? res.data;
      setSlots(normalizeSlots(payload));
    } catch (err) {
      console.error("Failed to load daily slots:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger les créneaux",
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  const normalizeAppointments = (rows) => {
    return (Array.isArray(rows) ? rows : [])
      .map((item) => {
        const slot = item.AvailableSlot || {};
        return {
          id: item.appointmentId,
          appointmentId: item.appointmentId,
          status: item.status || "SCHEDULED",
          reason: item.reason || "-",
          patientName: item.patient?.user?.fullName || "Patient",
          patientImage: item.patient?.user?.imageUrl || "",
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          place: slot.place || "-",
          dateLabel: formatDateLabel(slot.startTime || slot.date),
          startLabel: formatTimeLabel(slot.startTime),
          endLabel: formatTimeLabel(slot.endTime),
        };
      })
      .sort((a, b) => {
        const first = new Date(a.startTime || a.date).getTime();
        const second = new Date(b.startTime || b.date).getTime();
        return second - first;
      });
  };

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const res = await api.get("/doctors/appointments");
      const payload = res.data?.data ?? res.data;
      setAppointments(normalizeAppointments(payload));
    } catch (err) {
      console.error("Failed to load appointments:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger les rendez-vous",
      );
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!selectedDayKey) {
      setSelectedDayKey(formatDateKey(today));
    }
  }, [selectedDayKey]);

  const slotsByDay = useMemo(() => {
    return slots.reduce((acc, slot) => {
      if (!acc[slot.dayKey]) acc[slot.dayKey] = [];
      acc[slot.dayKey].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + 1 + i);
    return d;
  });

  const getSlotsForDay = (date) => {
    const dateKey = formatDateKey(date);
    return slotsByDay[dateKey] || [];
  };

  const toHourNumber = (timeValue) => {
    const [hour] = timeValue.split(":");
    return Number(hour);
  };

  const toTimeInputValue = (value) => {
    if (!value) return "08:00";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "08:00";
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const openSlotDetails = (slot) => {
    setActiveSlot(slot);
    setSlotEditForm({
      date: formatDateKey(slot.date || slot.startTime),
      startTime: toTimeInputValue(slot.startTime),
      endTime: toTimeInputValue(slot.endTime),
      place: slot.place === "-" ? "" : slot.place,
      isBooked: Boolean(slot.isBooked),
    });
    setShowSlotDetails(true);
  };

  const closeSlotDetails = () => {
    setShowSlotDetails(false);
    setActiveSlot(null);
  };

  const selectedDaySlots = selectedDayKey
    ? slotsByDay[selectedDayKey] || []
    : [];
  const selectedDayLabel = selectedDayKey
    ? formatDateLabel(selectedDayKey)
    : "-";

  const statusMeta = {
    SCHEDULED: { label: "Programme", color: "orange" },
    ACEPTED: { label: "Accepte", color: "green" },
    REJECTED: { label: "Rejete", color: "red" },
    COMPLETED: { label: "Termine", color: "blue" },
    CANCELLED: { label: "Annule", color: "gray" },
  };

  const appointmentFilters = [
    { key: "ALL", label: "Tous" },
    { key: "SCHEDULED", label: "Nouveaux" },
    { key: "ACEPTED", label: "Acceptes" },
    { key: "COMPLETED", label: "Termines" },
    { key: "REJECTED", label: "Rejetes" },
    { key: "CANCELLED", label: "Annules" },
  ];

  const appointmentCounts = useMemo(() => {
    return appointments.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        acc.ALL += 1;
        return acc;
      },
      { ALL: 0 },
    );
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (appointmentFilter === "ALL") return appointments;
    return appointments.filter((item) => item.status === appointmentFilter);
  }, [appointments, appointmentFilter]);

  const handleUpdateAppointment = async (appointmentId, status) => {
    try {
      setUpdatingAppointmentId(appointmentId);
      const res = await api.patch(`/doctors/appointments/${appointmentId}`, {
        appointmentId,
        status,
      });
      toast.success(res.data?.message || "Rendez-vous mis a jour");
      await fetchAppointments();
      if (status === "REJECTED") {
        await fetchSlots();
      }
    } catch (err) {
      console.error("Failed to update appointment:", err);
      toast.error(
        err.response?.data?.message || "Impossible de modifier le rendez-vous",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const handleCreateSlot = async () => {
    if (
      !slotForm.date ||
      !slotForm.startTime ||
      !slotForm.endTime ||
      !slotForm.place.trim()
    ) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    const startHour = toHourNumber(slotForm.startTime);
    const endHour = toHourNumber(slotForm.endTime);
    if (Number.isNaN(startHour) || Number.isNaN(endHour)) {
      toast.error("Format d'heure invalide");
      return;
    }

    if (startHour >= endHour) {
      toast.error("L'heure de fin doit etre superieure a l'heure de debut");
      return;
    }

    try {
      setCreatingSlot(true);
      await api.post("/doctors/daily-slots", {
        date: slotForm.date,
        startTime: startHour,
        endTime: endHour,
        place: slotForm.place.trim(),
      });
      toast.success("Creneaux ajoutes avec succes");
      setShowAddSlot(false);
      setSlotForm({
        date: "",
        startTime: "08:00",
        endTime: "17:00",
        place: "",
      });
      fetchSlots();
    } catch (err) {
      console.error("Failed to create daily slots:", err);
      toast.error(
        err.response?.data?.message || "Impossible d'ajouter les creneaux",
      );
    } finally {
      setCreatingSlot(false);
    }
  };

  const handleUpdateSlot = async () => {
    if (!activeSlot) return;
    if (
      !slotEditForm.date ||
      !slotEditForm.startTime ||
      !slotEditForm.endTime ||
      !slotEditForm.place.trim()
    ) {
      toast.error("Merci de remplir tous les champs");
      return;
    }

    const startHour = toHourNumber(slotEditForm.startTime);
    const endHour = toHourNumber(slotEditForm.endTime);
    if (Number.isNaN(startHour) || Number.isNaN(endHour)) {
      toast.error("Format d'heure invalide");
      return;
    }

    if (startHour >= endHour) {
      toast.error("L'heure de fin doit etre superieure a l'heure de debut");
      return;
    }

    try {
      setUpdatingSlot(true);
      await api.patch(`/doctors/daily-slots/${activeSlot.id}`, {
        date: slotEditForm.date,
        startTime: startHour,
        endTime: endHour,
        place: slotEditForm.place.trim(),
        isBooked: slotEditForm.isBooked,
      });
      toast.success("Creneau mis a jour avec succes");
      closeSlotDetails();
      await fetchSlots();
    } catch (err) {
      console.error("Failed to update daily slot:", err);
      toast.error(
        err.response?.data?.message || "Impossible de modifier le creneau",
      );
    } finally {
      setUpdatingSlot(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!activeSlot) return;
    try {
      setDeletingSlot(true);
      await api.delete(`/doctors/daily-slots/${activeSlot.id}`);
      toast.success("Creneau supprime avec succes");
      closeSlotDetails();
      await fetchSlots();
    } catch (err) {
      console.error("Failed to delete daily slot:", err);
      toast.error(
        err.response?.data?.message || "Impossible de supprimer le creneau",
      );
    } finally {
      setDeletingSlot(false);
    }
  };

  return (
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t("planning.title")}
          subtitle={`${slots.length} créneau${slots.length > 1 ? "x" : ""} disponible${slots.length > 1 ? "s" : ""}`}
          action={
            <button
              onClick={() => setShowAddSlot(true)}
              className="btn-primary"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t("planning.add_slot")}
            </button>
          }
        />

        {/* Weekly calendar */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">
            {t("planning.week_view")}
          </h2>
          <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-7 gap-2 min-w-[760px]">
              {weekDays.map((day, i) => {
                const daySlots = getSlotsForDay(day);
                const isToday = day.toDateString() === today.toDateString();
                const dayKey = formatDateKey(day);
                const isSelected = selectedDayKey === dayKey;
                let dayCardClass = "bg-gray-50 hover:bg-gray-100";
                if (isToday)
                  dayCardClass = "bg-primary/5 ring-2 ring-primary/20";
                if (isSelected)
                  dayCardClass = "bg-primary/10 ring-2 ring-primary";
                return (
                  <button
                    type="button"
                    onClick={() => setSelectedDayKey(dayKey)}
                    key={dayKey}
                    className={`rounded-xl p-2 text-left transition-all ${dayCardClass}`}
                  >
                    <div className="text-center mb-2">
                      <p className="text-xs text-gray-400 font-medium">
                        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]}
                      </p>
                      <p
                        className={`text-lg font-bold ${isToday ? "text-primary" : "text-gray-700"}`}
                      >
                        {day.getDate()}
                      </p>
                    </div>
                    <div className="space-y-1 min-h-[60px]">
                      {daySlots.slice(0, 3).map((slot) => (
                        <div
                          key={slot.id}
                          className="bg-primary text-white text-xs rounded-md p-1 truncate"
                        >
                          {slot.startLabel}
                        </div>
                      ))}
                      {daySlots.length > 3 && (
                        <p className="text-[10px] text-primary font-semibold">
                          +{daySlots.length - 3} autres
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slots list */}
        <div className="space-y-3">
          {loadingSlots && (
            <div className="card flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingSlots && (
            <div className="text-sm text-gray-500 mb-1">
              Creneaux du {selectedDayLabel}
            </div>
          )}

          {!loadingSlots && selectedDaySlots.length > 0 && (
            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
              {selectedDaySlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => openSlotDetails(slot)}
                  className="card w-full flex items-center gap-4 text-left group hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        {t("planning.date")}
                      </p>
                      <p className="font-medium text-sm text-gray-800">
                        {slot.dateLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">
                        {t("planning.time")}
                      </p>
                      <p className="font-medium text-sm text-gray-800">
                        {slot.startLabel} - {slot.endLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Etat</p>
                      {slot.isBooked ? (
                        <span className="badge-orange">Reserve</span>
                      ) : (
                        <span className="badge-green">Disponible</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Lieu</p>
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {slot.place}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loadingSlots && selectedDaySlots.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <svg
                className="w-10 h-10 mx-auto mb-3 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>Aucun creneau pour ce jour</p>
            </div>
          )}
        </div>

        <div className="card mt-8">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-900">Rendez-vous patients</h3>
              <p className="text-sm text-gray-500">
                Gerer les demandes et suivis des rendez-vous
              </p>
            </div>
            <span className="badge-blue">
              {appointmentCounts.ALL || 0} total
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {appointmentFilters.map((filter) => {
              const isActive = appointmentFilter === filter.key;
              const count = appointmentCounts[filter.key] || 0;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setAppointmentFilter(filter.key)}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap border transition-colors ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary/40"
                  }`}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>

          {loadingAppointments && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingAppointments && filteredAppointments.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>Aucun rendez-vous pour ce filtre</p>
            </div>
          )}

          {!loadingAppointments && filteredAppointments.length > 0 && (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => {
                const meta =
                  statusMeta[appointment.status] || statusMeta.SCHEDULED;
                const isUpdating = updatingAppointmentId === appointment.id;
                return (
                  <div
                    key={appointment.id}
                    className="border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                          {appointment.patientImage ? (
                            <img
                              src={appointment.patientImage}
                              alt={appointment.patientName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            appointment.patientName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {appointment.patientName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.reason}
                          </p>
                        </div>
                      </div>
                      <Badge label={meta.label} color={meta.color} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Date</p>
                        <p className="font-medium text-gray-800">
                          {appointment.dateLabel}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Heure</p>
                        <p className="font-medium text-gray-800">
                          {appointment.startLabel} - {appointment.endLabel}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Lieu</p>
                        <p className="font-medium text-gray-800">
                          {appointment.place}
                        </p>
                      </div>
                    </div>

                    {appointment.status === "SCHEDULED" && (
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="btn-primary text-sm py-1.5"
                          onClick={() =>
                            handleUpdateAppointment(appointment.id, "ACEPTED")
                          }
                        >
                          Accepter
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="btn-danger text-sm py-1.5"
                          onClick={() =>
                            handleUpdateAppointment(appointment.id, "REJECTED")
                          }
                        >
                          Rejeter
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="btn-secondary text-sm py-1.5"
                          onClick={() =>
                            handleUpdateAppointment(appointment.id, "CANCELLED")
                          }
                        >
                          Annuler
                        </button>
                      </div>
                    )}

                    {appointment.status === "ACEPTED" && (
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="btn-primary text-sm py-1.5"
                          onClick={() =>
                            handleUpdateAppointment(appointment.id, "COMPLETED")
                          }
                        >
                          Marquer termine
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="btn-secondary text-sm py-1.5"
                          onClick={() =>
                            handleUpdateAppointment(appointment.id, "CANCELLED")
                          }
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Modal
          isOpen={showAddSlot}
          onClose={() => setShowAddSlot(false)}
          title={t("planning.add_slot")}
        >
          <div className="space-y-4">
            {[
              { label: t("planning.date"), key: "date", type: "date" },
              { label: "Heure debut", key: "startTime", type: "time" },
              { label: "Heure fin", key: "endTime", type: "time" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={slotForm[f.key]}
                  onChange={(e) =>
                    setSlotForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="slot-place"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lieu
              </label>
              <input
                id="slot-place"
                type="text"
                value={slotForm.place}
                onChange={(e) =>
                  setSlotForm((p) => ({ ...p, place: e.target.value }))
                }
                className="input-field"
                placeholder="Cabinet / Clinique"
              />
            </div>

            <button
              onClick={handleCreateSlot}
              disabled={creatingSlot}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {creatingSlot ? t("common.loading") : t("common.add")}
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={showSlotDetails}
          onClose={closeSlotDetails}
          title="Details du creneau"
          size="lg"
        >
          <div className="space-y-5">
            <div className="rounded-xl p-4 border border-primary/15 bg-gradient-to-r from-primary/5 via-blue-50 to-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary/70 font-semibold">
                    Creneau selectionne
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {activeSlot?.dateLabel} • {activeSlot?.startLabel} -{" "}
                    {activeSlot?.endLabel}
                  </p>
                </div>
                {slotEditForm.isBooked ? (
                  <span className="badge-orange">Reserve</span>
                ) : (
                  <span className="badge-green">Disponible</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="slot-edit-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date
                </label>
                <input
                  id="slot-edit-date"
                  type="date"
                  value={slotEditForm.date}
                  onChange={(e) =>
                    setSlotEditForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="slot-edit-place"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lieu
                </label>
                <input
                  id="slot-edit-place"
                  type="text"
                  value={slotEditForm.place}
                  onChange={(e) =>
                    setSlotEditForm((p) => ({ ...p, place: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Cabinet / Clinique"
                />
              </div>
              <div>
                <label
                  htmlFor="slot-edit-start-time"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Heure debut
                </label>
                <input
                  id="slot-edit-start-time"
                  type="time"
                  value={slotEditForm.startTime}
                  onChange={(e) =>
                    setSlotEditForm((p) => ({
                      ...p,
                      startTime: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="slot-edit-end-time"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Heure fin
                </label>
                <input
                  id="slot-edit-end-time"
                  type="time"
                  value={slotEditForm.endTime}
                  onChange={(e) =>
                    setSlotEditForm((p) => ({ ...p, endTime: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
              <div>
                <p className="font-medium text-gray-800">Statut du creneau</p>
                <p className="text-sm text-gray-500">
                  Marquer ce creneau comme reserve ou disponible
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSlotEditForm((p) => ({ ...p, isBooked: !p.isBooked }))
                }
                className={`w-14 h-8 rounded-full p-1 transition-colors ${slotEditForm.isBooked ? "bg-primary" : "bg-gray-300"}`}
              >
                <span
                  className={`block w-6 h-6 rounded-full bg-white transition-transform ${slotEditForm.isBooked ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleDeleteSlot}
                disabled={updatingSlot || deletingSlot}
                className="btn-danger"
              >
                {deletingSlot ? "Suppression..." : "Supprimer le creneau"}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeSlotDetails}
                  disabled={updatingSlot || deletingSlot}
                  className="btn-secondary"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSlot}
                  disabled={updatingSlot || deletingSlot}
                  className="btn-primary disabled:opacity-60"
                >
                  {updatingSlot ? "Mise a jour..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
