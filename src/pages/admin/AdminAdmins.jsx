import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const getInitial = (value) =>
  value ? String(value).charAt(0).toUpperCase() : "?";

export default function AdminAdmins() {
  const { t } = useTranslation();
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/admins");
      const adminsData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setAdmins(adminsData);
    } catch (err) {
      console.error("Failed to load admins:", err);
      toast.error(
        err.response?.data?.message ||
          "Impossible de charger les administrateurs",
      );
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const validateAdmin = async (userId) => {
    try {
      setProcessingId(userId);
      const res = await api.patch(`/users/validate-admin/${userId}`);
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.userId === userId ? { ...admin, canModerate: true } : admin,
        ),
      );
      setSelected((prev) =>
        prev?.userId === userId ? { ...prev, canModerate: true } : prev,
      );
      toast.success(res.data?.message || "Administrateur validé avec succès");
    } catch (err) {
      console.error("Failed to validate admin:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la validation",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openDeleteConfirm = (admin) => {
    setDeleteTarget(admin);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.userId) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/users/delete/${deleteTarget.userId}`);
      setAdmins((prev) =>
        prev.filter((admin) => admin.userId !== deleteTarget.userId),
      );
      if (selected?.userId === deleteTarget.userId) setSelected(null);
      toast.success(res.data?.message || "Administrateur supprimé avec succès");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete admin:", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const currentAdminId = currentAdmin?.id;
    const q = search.toLowerCase().trim();
    const visibleAdmins = admins.filter(
      (admin) => admin.userId !== currentAdminId,
    );
    if (!q) return visibleAdmins;
    return visibleAdmins.filter((admin) => {
      const user = admin.user || {};
      return (
        user.fullName?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q)
      );
    });
  }, [admins, search]);

  return (
    <AdminLayout>
      <div className="p-8 animate-fadeIn">
        <PageHeader
          title={t("admin.admin_management")}
          subtitle={`${admins.length} ${t("nav.admins")}`}
        />

        <div className="relative mb-6 max-w-sm">
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
            placeholder="Rechercher un administrateur..."
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Nom", "Email", "Téléphone", "Statut", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((admin) => {
                  const user = admin.user || {};
                  return (
                    <tr
                      key={admin.userId}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.fullName}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-sm font-bold">
                                {getInitial(user.fullName)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {admin.canModerate
                                ? "Peut modérer"
                                : "En attente"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          label={admin.canModerate ? "Validé" : "En attente"}
                          color={admin.canModerate ? "active" : "pending"}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(admin)}
                            className="text-xs text-primary hover:underline"
                          >
                            {t("admin.view")}
                          </button>
                          {!admin.canModerate && (
                            <button
                              onClick={() => validateAdmin(admin.userId)}
                              disabled={processingId === admin.userId}
                              className="text-xs text-green-600 hover:underline disabled:opacity-50"
                            >
                              {processingId === admin.userId
                                ? "..."
                                : t("admin.approve")}
                            </button>
                          )}
                          {!admin.canModerate && (
                            <button
                              onClick={() => openDeleteConfirm(admin)}
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              {t("admin.delete")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-gray-400 text-sm"
                    >
                      Aucun administrateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Profil administrateur"
          size="lg"
        >
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selected.user?.imageUrl ? (
                  <img
                    src={selected.user.imageUrl}
                    alt={selected.user.fullName}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-xl font-bold text-primary">
                    {getInitial(selected.user?.fullName)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selected.user?.fullName}
                  </h3>
                  <p className="text-primary">{selected.user?.email}</p>
                  <Badge
                    label={selected.canModerate ? "Validé" : "En attente"}
                    color={selected.canModerate ? "active" : "pending"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                {[
                  { label: "Téléphone", val: selected.user?.phone ?? "—" },
                  { label: "Adresse", val: selected.user?.address ?? "—" },
                  { label: "Genre", val: selected.user?.gender ?? "—" },
                  {
                    label: "Peut modérer",
                    val: selected.canModerate ? "Oui" : "Non",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {item.val}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                {!selected.canModerate && (
                  <button
                    onClick={() => validateAdmin(selected.userId)}
                    className="btn-primary flex-1 justify-center"
                  >
                    {t("admin.approve")}
                  </button>
                )}
                {!selected.canModerate && (
                  <button
                    onClick={() => openDeleteConfirm(selected)}
                    className="btn-danger flex-1 justify-center"
                  >
                    {t("admin.delete")}
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="btn-secondary flex-1 justify-center"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={
            deleteTarget?.user?.fullName
              ? `Supprimer : ${deleteTarget.user.fullName}`
              : "Supprimer l'administrateur"
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Cette action est irréversible. Voulez-vous vraiment supprimer cet
              administrateur ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-lg border text-sm font-medium"
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-60"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
