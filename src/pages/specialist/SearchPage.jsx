// Redesigned following SAHTECK brand guidelines
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { toast } from "react-toastify";
import {
  Building2,
  ChevronRight,
  List,
  Loader2,
  Mail,
  Map,
  MapPin,
  Phone,
  Search,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import api from "../../services/api";

const defaultMapCenter = [33.8869, 9.5375];

export default function SearchPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const normalizeSpecialistList = (rows) => {
    return (Array.isArray(rows) ? rows : []).map((item) => {
      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);
      const hasValidCoordinates =
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude) &&
        Math.abs(latitude) <= 90 &&
        Math.abs(longitude) <= 180;

      return {
        id: item.userId,
        name: item.user?.fullName || "Specialiste",
        imageUrl: item.user?.imageUrl || "",
        specialty: item.speciality || "-",
        latitude,
        longitude,
        hasValidCoordinates,
      };
    });
  };

  const normalizeSpecialistDetail = (item) => {
    if (!item) return null;
    const latitude = Number(item.latitude);
    const longitude = Number(item.longitude);

    return {
      id: item.userId,
      name: item.user?.fullName || "Specialiste",
      imageUrl: item.user?.imageUrl || "",
      specialty: item.speciality || "-",
      bio: item.bio || "Aucune biographie disponible",
      clinic: item.primaryClinic?.name || "-",
      location: item.location || "-",
      rating: Number(item.rating || 0),
      reviewsCount: Number(item.reviewsCount || 0),
      email: item.user?.email || "-",
      phone: item.user?.phone || "-",
      gender: item.user?.gender || "-",
      latitude: Number.isNaN(latitude) ? null : latitude,
      longitude: Number.isNaN(longitude) ? null : longitude,
    };
  };

  const fetchSpecialists = async (query) => {
    try {
      setLoading(true);
      const queryParam = query.trim() === "" ? " " : query.trim();
      const res = await api.get(
        `/users/specialists/${encodeURIComponent(queryParam)}`,
      );
      const payload = res.data?.data ?? res.data;
      setSpecialists(normalizeSpecialistList(payload));
    } catch (err) {
      console.error("Failed to load specialists:", err);
      toast.error(
        err.response?.data?.message || "Impossible de charger les specialistes",
      );
      setSpecialists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSpecialists(search);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  const filtered = useMemo(() => {
    if (!specialty) return specialists;
    return specialists.filter((item) => item.specialty === specialty);
  }, [specialists, specialty]);

  const specialties = useMemo(() => {
    return Array.from(
      new Set(specialists.map((item) => item.specialty).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [specialists]);

  const mapSpecialists = useMemo(
    () => filtered.filter((item) => item.hasValidCoordinates),
    [filtered],
  );

  const mapCenter = useMemo(() => {
    if (mapSpecialists.length === 0) return defaultMapCenter;
    return [mapSpecialists[0].latitude, mapSpecialists[0].longitude];
  }, [mapSpecialists]);

  const openSpecialistDetails = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await api.get(`/users/specialist/${id}`);
      const payload = res.data?.data ?? res.data;
      setSelected(normalizeSpecialistDetail(payload));
    } catch (err) {
      console.error("Failed to load specialist:", err);
      toast.error(
        err.response?.data?.message ||
          "Impossible de charger les details du specialiste",
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="animate-fadeIn bg-[#F8FAFF] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <PageHeader
          title={t("search.title")}
          subtitle="Rechercher un specialiste et visualiser sa position sur la carte"
        />

        <div
          className="mb-6 rounded-[12px] bg-white p-4 md:p-6"
          style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="relative lg:col-span-2">
              <Search
                size={20}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-[8px] bg-[#F1F5F9] pl-10 pr-3 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0052FF]/25"
                placeholder={t("search.search_placeholder")}
              />
            </div>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="h-11 rounded-[8px] bg-[#F1F5F9] px-3 text-sm text-[#0A0F1E] outline-none transition-all duration-200 ease-in-out focus:ring-2 focus:ring-[#0052FF]/25"
            >
              <option value="">{t("search.all_specialties")}</option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#64748B]">
            {filtered.length} resultat(s) - {mapSpecialists.length} avec
            position
          </p>
          <div
            className="inline-flex rounded-[12px] bg-white p-1"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition-all duration-200 ease-in-out ${
                viewMode === "list"
                  ? "bg-[#0052FF] text-white"
                  : "text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#0052FF]"
              }`}
            >
              <List size={20} />
              {t("search.list_view")}
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition-all duration-200 ease-in-out ${
                viewMode === "map"
                  ? "bg-[#0052FF] text-white"
                  : "text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#0052FF]"
              }`}
            >
              <Map size={20} />
              {t("search.map_view")}
            </button>
          </div>
        </div>

        {loading && (
          <div
            className="rounded-[12px] bg-white p-6"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <div className="mb-5 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-[#0052FF]" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`search-skeleton-${index}`}
                  className="rounded-[12px] bg-[#F8FAFF] p-4"
                >
                  <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
                  <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-[#E2E8F0]" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[#E2E8F0]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && viewMode === "list" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((sp) => (
              <button
                key={sp.id}
                type="button"
                className="group rounded-[12px] bg-white p-4 text-left transition-all duration-200 ease-in-out hover:-translate-y-0.5"
                style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
                onClick={() => openSpecialistDetails(sp.id)}
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-white">
                    {sp.imageUrl ? (
                      <img
                        src={sp.imageUrl}
                        alt={sp.name}
                        className="h-12 w-12 object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold">
                        {sp.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-[#0A0F1E]">
                      {sp.name}
                    </h3>
                    <p className="truncate text-sm font-semibold text-[#0052FF]">
                      {sp.specialty}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {sp.hasValidCoordinates
                        ? "Position disponible sur la carte"
                        : "Position indisponible"}
                    </p>
                  </div>
                  <Badge
                    label={sp.hasValidCoordinates ? "Geo" : "Sans geo"}
                    color={sp.hasValidCoordinates ? "green" : "gray"}
                  />
                </div>
                <div className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-4 py-2 text-sm font-semibold text-[#0052FF] transition-all duration-200 ease-in-out group-hover:bg-[#EFF6FF]">
                  {t("search.view_profile")}
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && viewMode === "map" && (
          <div
            className="h-[500px] overflow-hidden rounded-[12px] bg-white p-2"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <MapContainer
              center={mapCenter}
              zoom={mapSpecialists.length > 0 ? 7 : 6}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
              />
              {mapSpecialists.map((sp) => (
                <Marker key={sp.id} position={[sp.latitude, sp.longitude]}>
                  <Popup>
                    <div className="p-1 min-w-[160px]">
                      <p className="font-bold text-sm">{sp.name}</p>
                      <p className="text-primary text-xs">{sp.specialty}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Lat: {sp.latitude.toFixed(4)} | Lng:{" "}
                        {sp.longitude.toFixed(4)}
                      </p>
                      <button
                        type="button"
                        className="mt-2 inline-flex min-h-[36px] items-center gap-1 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00A3FF] px-3 py-1 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:shadow-sm"
                        onClick={() => openSpecialistDetails(sp.id)}
                      >
                        <ChevronRight size={14} />
                        Voir profil
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div
            className="rounded-[12px] bg-white p-12 text-center"
            style={{ boxShadow: "0 2px 12px rgba(0,82,255,0.08)" }}
          >
            <Stethoscope size={48} className="mx-auto text-[#CBD5E1]" />
            <p className="mt-3 text-sm text-[#64748B]">
              Aucun specialiste trouve
            </p>
          </div>
        )}

        <Modal
          isOpen={!!selected || loadingDetail}
          onClose={() => setSelected(null)}
          title="Profil du specialiste"
          size="lg"
        >
          {loadingDetail && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-[#0052FF]" />
            </div>
          )}

          {!loadingDetail && selected && (
            <div className="space-y-4">
              <div className="rounded-[12px] border border-[#DBEAFE] bg-gradient-to-r from-[#EFF6FF] via-white to-[#F0F9FF] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-2xl font-bold text-white">
                    {selected.imageUrl ? (
                      <img
                        src={selected.imageUrl}
                        alt={selected.name}
                        className="h-16 w-16 object-cover"
                      />
                    ) : (
                      selected.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-[#0A0F1E]">
                      {selected.name}
                    </h2>
                    <p className="font-semibold text-[#0052FF]">
                      {selected.specialty}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-[#64748B]">
                      <Star size={16} className="text-[#F59E0B]" />
                      {selected.rating.toFixed(1)} / 5 ({selected.reviewsCount}{" "}
                      avis)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-[12px] bg-[#F8FAFF] p-4 md:grid-cols-2">
                {[
                  {
                    label: "Cabinet",
                    val: selected.clinic,
                    icon: <Building2 size={16} className="text-[#0052FF]" />,
                  },
                  {
                    label: "Adresse",
                    val: selected.location,
                    icon: <MapPin size={16} className="text-[#0052FF]" />,
                  },
                  {
                    label: "Telephone",
                    val: selected.phone,
                    icon: <Phone size={16} className="text-[#0052FF]" />,
                  },
                  {
                    label: "Email",
                    val: selected.email,
                    icon: <Mail size={16} className="text-[#0052FF]" />,
                  },
                  {
                    label: "Genre",
                    val: selected.gender,
                    icon: <UserRound size={16} className="text-[#0052FF]" />,
                  },
                  {
                    label: "Coordonnees",
                    val:
                      selected.latitude !== null && selected.longitude !== null
                        ? `${selected.latitude.toFixed(5)}, ${selected.longitude.toFixed(5)}`
                        : "-",
                    icon: <MapPin size={16} className="text-[#0052FF]" />,
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-[8px] bg-white p-3">
                    <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      {item.icon}
                      {item.label}
                    </p>
                    <p className="break-words text-sm font-medium text-[#0A0F1E]">
                      {item.val}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#0A0F1E]">
                  Biographie
                </p>
                <p className="rounded-[8px] bg-[#F8FAFF] p-3 text-sm leading-relaxed text-[#64748B]">
                  {selected.bio}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
