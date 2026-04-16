import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { toast } from "react-toastify";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
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
      clinic: item.clinic || "-",
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
    <SpecialistLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t("search.title")}
          subtitle="Rechercher un specialiste et visualiser sa position sur la carte"
        />

        <div className="card mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="relative lg:col-span-2">
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
                className="input-field pl-9"
                placeholder={t("search.search_placeholder")}
              />
            </div>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="input-field"
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

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filtered.length} resultat(s) - {mapSpecialists.length} avec
            position
          </p>
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-100">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {t("search.list_view")}
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "map"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {t("search.map_view")}
            </button>
          </div>
        </div>

        {loading && (
          <div className="card flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((sp) => (
              <button
                key={sp.id}
                type="button"
                className="card text-left hover:shadow-md transition-all duration-200"
                onClick={() => openSpecialistDetails(sp.id)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {sp.imageUrl ? (
                      <img
                        src={sp.imageUrl}
                        alt={sp.name}
                        className="w-12 h-12 object-cover"
                      />
                    ) : (
                      <span className="text-primary font-bold">
                        {sp.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">
                      {sp.name}
                    </h3>
                    <p className="text-primary text-sm font-medium truncate">
                      {sp.specialty}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
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
                <div className="btn-secondary w-full mt-2 text-sm justify-center py-2">
                  {t("search.view_profile")}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && viewMode === "map" && (
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[500px]">
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
                        className="mt-2 px-2.5 py-1 text-xs rounded-md bg-primary text-white"
                        onClick={() => openSpecialistDetails(sp.id)}
                      >
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
          <div className="text-center py-12 text-gray-400">
            <p>Aucun specialiste trouve</p>
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
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingDetail && selected && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 border border-primary/10 bg-gradient-to-r from-primary/5 via-blue-50 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0 overflow-hidden">
                    {selected.imageUrl ? (
                      <img
                        src={selected.imageUrl}
                        alt={selected.name}
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      selected.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {selected.name}
                    </h2>
                    <p className="text-primary font-medium">
                      {selected.specialty}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selected.rating.toFixed(1)} / 5 ({selected.reviewsCount}{" "}
                      avis)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                {[
                  { label: "Cabinet", val: selected.clinic },
                  { label: "Adresse", val: selected.location },
                  { label: "Telephone", val: selected.phone },
                  { label: "Email", val: selected.email },
                  { label: "Genre", val: selected.gender },
                  {
                    label: "Coordonnees",
                    val:
                      selected.latitude !== null && selected.longitude !== null
                        ? `${selected.latitude.toFixed(5)}, ${selected.longitude.toFixed(5)}`
                        : "-",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400 font-medium">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-800 font-medium break-words">
                      {item.val}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Biographie
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selected.bio}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SpecialistLayout>
  );
}
