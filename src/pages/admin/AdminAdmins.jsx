// Redesigned following SAHTECK brand guidelines
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Search,
  User,
  Check,
  Trash2,
  AlertCircle,
  ChevronRight,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Users,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
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
      <div className="p-8 animate-fadeIn bg-[#F8FAFF] min-h-screen">
        <PageHeader
          title={t("admin.admin_management")}
          subtitle={`${admins.length} ${t("nav.admins")}`}
        />

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Rechercher
            </label>
            <Search
              size={18}
              className="absolute left-3 top-1/2 translate-y-[2px] text-[#64748B]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0A0F1E] placeholder-[#CBD5E1] focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/10 transition-all duration-200 text-sm"
              placeholder="Nom, email ou téléphone..."
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
              <Users size={20} className="text-[#0052FF]" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-medium">Total</p>
              <p className="text-2xl font-bold text-[#0A0F1E]">
                {admins.length}
              </p>
            </div>
          </div>

          {/* Validated Count */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
              <Check size={20} className="text-[#10B981]" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-medium">Validés</p>
              <p className="text-2xl font-bold text-[#0A0F1E]">
                {admins.filter((a) => a.canModerate).length}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#EFF6FF] border-t-[#0052FF] rounded-full animate-spin" />
              <p className="text-[#64748B] text-sm">
                Chargement des administrateurs...
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
                <Users size={32} className="text-[#0052FF]" />
              </div>
              <p className="text-[#64748B] text-sm">
                Aucun administrateur trouvé
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFF] border-b border-[#E2E8F0]">
                  <tr>
                    {[
                      "Administrateur",
                      "Email",
                      "Téléphone",
                      "Statut",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filtered.map((admin, idx) => {
                    const user = admin.user || {};
                    return (
                      <tr
                        key={admin.userId}
                        className={`transition-all duration-200 hover:bg-[#EFF6FF] ${
                          idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFF]"
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-[#0052FF] to-[#00A3FF] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                  {getInitial(user.fullName)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm text-[#0A0F1E]">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-[#64748B] mt-0.5">
                                {admin.canModerate
                                  ? "Peut modérer"
                                  : "En attente"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#0A0F1E]">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-[#CBD5E1]" />
                            {user.email || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#0A0F1E]">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-[#CBD5E1]" />
                            {user.phone || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {admin.canModerate ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#10B981]">
                              <Check size={14} />
                              Validé
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#F59E0B]">
                              <Clock size={14} />
                              En attente
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelected(admin)}
                              className="p-2 text-[#0052FF] hover:bg-[#EFF6FF] rounded-lg transition-all duration-200"
                              title="Voir détails"
                            >
                              <ChevronRight size={18} />
                            </button>
                            {!admin.canModerate && (
                              <button
                                onClick={() => validateAdmin(admin.userId)}
                                disabled={processingId === admin.userId}
                                className="p-2 text-[#10B981] hover:bg-[#ECFDF5] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Valider"
                              >
                                {processingId === admin.userId ? (
                                  <Clock size={18} className="animate-spin" />
                                ) : (
                                  <Check size={18} />
                                )}
                              </button>
                            )}
                            {!admin.canModerate && (
                              <button
                                onClick={() => openDeleteConfirm(admin)}
                                className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-all duration-200"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Profil administrateur"
          size="lg"
        >
          {selected && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFF] rounded-xl p-5 border border-[#E2E8F0]">
                <div className="flex items-start gap-4">
                  {selected.user?.imageUrl ? (
                    <img
                      src={selected.user.imageUrl}
                      alt={selected.user.fullName}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0052FF] to-[#00A3FF] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl font-bold">
                        {getInitial(selected.user?.fullName)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#0A0F1E]">
                      {selected.user?.fullName}
                    </h3>
                    <p className="text-sm text-[#0052FF] mt-1">
                      {selected.user?.email}
                    </p>
                    <div className="mt-3">
                      {selected.canModerate ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#10B981]">
                          <Check size={14} />
                          Validé
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#F59E0B]">
                          <Clock size={14} />
                          En attente
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Phone,
                    label: "Téléphone",
                    val: selected.user?.phone ?? "—",
                  },
                  {
                    icon: MapPin,
                    label: "Adresse",
                    val: selected.user?.address ?? "—",
                  },
                  {
                    icon: User,
                    label: "Genre",
                    val: selected.user?.gender ?? "—",
                  },
                  {
                    icon: Shield,
                    label: "Modération",
                    val: selected.canModerate ? "Activée" : "Désactivée",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="bg-white rounded-xl p-4 border border-[#E2E8F0]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={16} className="text-[#0052FF]" />
                        <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#0A0F1E]">
                        {item.val}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-[#E2E8F0]">
                {!selected.canModerate && (
                  <button
                    onClick={() => validateAdmin(selected.userId)}
                    className="flex-1 px-4 py-3 rounded-lg bg-[#ECFDF5] text-[#10B981] font-medium text-sm hover:bg-[#D1FAE5] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    {t("admin.approve")}
                  </button>
                )}
                {!selected.canModerate && (
                  <button
                    onClick={() => {
                      openDeleteConfirm(selected);
                      setSelected(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg bg-[#FEF2F2] text-[#EF4444] font-medium text-sm hover:bg-[#FEE4E4] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    {t("admin.delete")}
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#EFF6FF] text-[#0052FF] font-medium text-sm hover:bg-[#E0EFFF] transition-all duration-200"
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
          title="Confirmer la suppression"
          size="sm"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-[#EF4444]" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#0A0F1E] mb-2">
                Supprimer {deleteTarget?.user?.fullName} ?
              </h3>
              <p className="text-sm text-[#64748B]">
                Cette action est irréversible. L'administrateur sera
                définitivement supprimé du système.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-3 rounded-lg bg-[#EFF6FF] text-[#0052FF] font-medium text-sm hover:bg-[#E0EFFF] transition-all duration-200 disabled:opacity-50"
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-lg bg-[#EF4444] text-white font-medium text-sm hover:bg-[#DC2626] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    Suppression…
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
