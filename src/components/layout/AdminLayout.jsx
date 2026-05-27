// Redesigned following SAHTECK brand guidelines
import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Users2,
  CheckCircle,
  Star,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../common/Logo";
import LanguageSwitcher from "../common/LanguageSwitcher";
import AccessRestriction from "../common/AccessRestriction";

const navItems = [
  {
    key: "admin_dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "specialists",
    path: "/admin/specialists",
    icon: UserCheck,
  },
  {
    key: "admins",
    path: "/admin/admins",
    icon: UserCheck,
  },
  {
    key: "patients",
    path: "/admin/patients",
    icon: Users2,
  },
  {
    key: "moderation",
    path: "/admin/posts",
    icon: CheckCircle,
  },
  {
    key: "reviews",
    path: "/admin/reviews",
    icon: Star,
  },
  {
    key: "profile",
    path: "/admin/profile",
    icon: User,
  },
];

export default function AdminLayout({ children }) {
  const { t } = useTranslation();
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user information
  const displayName = admin?.name || admin?.fullName || "Administrateur";
  const userRole = admin?.role || "ADMIN";
  const profileImage = admin?.imageUrl;

  if (admin?.canModerate === false) {
    return (
      <AccessRestriction
        variant="admin"
        title={t("access.admin_title")}
        message={t("access.admin_message")}
        onAction={handleLogout}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFF] overflow-hidden">
      <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col flex-shrink-0 shadow-sm">
        {/* Logo Section */}
        <div className="p-6 border-b border-[#E2E8F0]">
          <Logo size="sm" />
        </div>

        {/* User Info Card */}
        <div className="p-4 m-4 bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFF] rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt={displayName}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#0052FF] to-[#00A3FF] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {displayName.charAt(0)}
                </span>
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <p className="font-semibold text-sm text-[#0A0F1E] truncate">
                {displayName}
              </p>
              <p className="text-xs text-[#0052FF] font-medium mt-0.5">
                {userRole === "ADMIN" ? "Administrateur" : userRole}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#0052FF] to-[#00A3FF] text-white shadow-sm"
                      : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0052FF]"
                  }`
                }
              >
                <IconComponent size={20} />
                <span>{t(`nav.${item.key}`)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#E2E8F0] space-y-3">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-[#EF4444] hover:bg-[#FEF2F2] transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={20} />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#F8FAFF]">{children}</main>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
