// Redesigned following SAHTECK brand guidelines
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Home,
  Zap,
  Search,
  Calendar,
  User,
  Star,
  Building2,
  LogOut,
  Zap as Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api, { API_BASE_URL } from "../../services/api";
import Logo from "../common/Logo";
import LanguageSwitcher from "../common/LanguageSwitcher";
import AccessRestriction from "../common/AccessRestriction";

const socketBaseUrl = (api.defaults.baseURL || API_BASE_URL).replace(/\/$/, "");

function playNotificationSound() {
  try {
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12);

    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.12,
      context.currentTime + 0.02,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.25,
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);

    oscillator.onended = () => {
      context.close().catch(() => {});
    };
  } catch {
    // Ignore audio playback errors (browser autoplay restrictions, etc.)
  }
}

function buildMessagePreview(payload) {
  const senderName =
    payload?.sender?.fullName || payload?.senderName || "Nouveau message";
  const preview = payload?.content || payload?.preview || "";
  return {
    title: senderName,
    body: preview.slice(0, 120),
  };
}

function buildAppointmentPreview(payload) {
  const patient = payload?.patientName || "Un patient";
  const date = payload?.date
    ? new Date(payload.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      })
    : "";
  const time = payload?.startTime
    ? new Date(payload.startTime).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  return {
    title: `Nouveau rendez-vous — ${patient}`,
    body: [date, time, payload?.place]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 120),
  };
}

function showSystemNotification({ title, body, onClick }) {
  if (!("Notification" in globalThis)) {
    return;
  }

  const notification = new Notification(title, {
    body,
    tag: "sahtech-chat-message",
    renotify: true,
  });

  notification.onclick = () => {
    globalThis.focus();
    onClick();
    notification.close();
  };
}

async function maybeShowSystemNotification({ title, body, onClick }) {
  if (!("Notification" in globalThis)) {
    return;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return;
  }

  showSystemNotification({ title, body, onClick });
}

const iconMap = {
  dashboard: LayoutDashboard,
  patients: Users,
  reports: BarChart3,
  chat: MessageSquare,
  posts: FileText,
  accueil: Home,
  exercises: Zap,
  search: Search,
  planning: Calendar,
  profile: User,
  reviews: Star,
  clinics: Building2,
};

const navItems = [
  { key: "dashboard", path: "/specialist/dashboard" },
  { key: "accueil", path: "/specialist/accueil" },
  { key: "patients", path: "/specialist/patients" },
  { key: "reports", path: "/specialist/reports" },
  { key: "chat", path: "/specialist/chat" },
  { key: "exercises", path: "/specialist/exercises" },
  { key: "planning", path: "/specialist/planning" },
  { key: "search", path: "/specialist/search" },
  { key: "posts", path: "/specialist/posts" },
  { key: "reviews", path: "/specialist/reviews" },
  { key: "clinics", path: "/specialist/clinics" },
  { key: "profile", path: "/specialist/profile" },
];

export default function SpecialistLayout() {
  const { t } = useTranslation();
  const { user, specialist, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);
  const [appointmentBadge, setAppointmentBadge] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get the display name (prefer specialist name, fallback to user name)
  const displayName = specialist?.name || user?.name || "Spécialiste";
  const displaySpecialty = specialist?.specialty || "";
  const profileImage = specialist?.imageUrl || user?.imageUrl;
  const currentUserId =
    user?.id || user?.userId || specialist?.id || specialist?.userId;

  useEffect(() => {
    const token =
      user?.accessToken ||
      JSON.parse(localStorage.getItem("sahtech_user") || "{}").accessToken;
    const isSpecialistArea = location.pathname.startsWith("/specialist");

    if (!token || !isSpecialistArea) {
      return undefined;
    }

    const socket = io(`${socketBaseUrl}/chat`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    const notifyIncomingMessage = async (payload) => {
      if (
        payload?.senderId &&
        currentUserId &&
        payload.senderId === currentUserId
      ) {
        return;
      }

      const { title, body } = buildMessagePreview(payload);
      const isForeground = !document.hidden;
      const isChatPage = location.pathname === "/specialist/chat";

      playNotificationSound();

      if (isForeground) {
        if (!isChatPage) {
          toast.info(`${title}: ${body}`);
        }
        return;
      }

      if (!("Notification" in globalThis)) {
        return;
      }

      await maybeShowSystemNotification({
        title,
        body: body || t("chat.type_message"),
        onClick: () => navigate("/specialist/chat"),
      });
    };

    socket.on("new_message", (message) => {
      notifyIncomingMessage(message);
    });

    socket.on("notification", (notification) => {
      notifyIncomingMessage(notification);
    });

    const notifyIncomingAppointment = async (payload) => {
      const { title, body } = buildAppointmentPreview(payload);
      const isForeground = !document.hidden;

      playNotificationSound();
      setAppointmentBadge((prev) => prev + 1);
      window.dispatchEvent(new CustomEvent("sahtech:new_appointment"));

      if (isForeground) {
        toast.info(`${title}${body ? ` — ${body}` : ""}`, {
          onClick: () => navigate("/specialist/planning"),
        });
        return;
      }

      await maybeShowSystemNotification({
        title,
        body: body || "Consultez votre planning",
        onClick: () => navigate("/specialist/planning"),
      });
    };

    socket.on("new_appointment", (data) => {
      notifyIncomingAppointment(data);
    });

    return () => {
      socket.off("new_message");
      socket.off("notification");
      socket.off("new_appointment");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, location.pathname, navigate, t, user?.accessToken]);

  useEffect(() => {
    if (location.pathname === "/specialist/planning") {
      setAppointmentBadge(0);
    }
  }, [location.pathname]);

  if (specialist?.isValidated === false) {
    return (
      <AccessRestriction
        variant="specialist"
        title={t("access.specialist_title")}
        message={t("access.specialist_message")}
        onAction={handleLogout}
      />
    );
  }

  return (
    <>
      <div className="flex h-screen bg-[#F8FAFF] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col flex-shrink-0 shadow-sm">
          <div className="p-5 border-b border-[#E2E8F0]">
            <Logo size="sm" />
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-[#0052FF] to-[#00A3FF] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {displayName.charAt(0)}
                  </span>
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-[#0A0F1E] truncate">
                  {displayName}
                </p>
                {displaySpecialty && (
                  <p className="text-xs text-[#64748B] truncate">
                    {displaySpecialty}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = iconMap[item.key];
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00A3FF] text-white shadow-sm transition-all duration-200"
                      : "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] transition-colors duration-200"
                  }
                >
                  {IconComponent && (
                    <IconComponent size={20} className="flex-shrink-0" />
                  )}
                  <span className="flex-1 text-sm font-medium">
                    {t(`nav.${item.key}`)}
                  </span>
                  {item.key === "planning" && appointmentBadge > 0 && (
                    <span className="bg-[#EF4444] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none">
                      {appointmentBadge > 9 ? "9+" : appointmentBadge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-[#E2E8F0] space-y-3">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[#EF4444] hover:bg-[#FEF2F2] transition-colors text-sm font-medium"
            >
              <LogOut size={20} />
              {t("nav.logout")}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI assistant button — hidden on the chat page itself */}
      {location.pathname !== "/specialist/chat" && (
        <button
          onClick={() =>
            navigate("/specialist/chat", { state: { openAi: true } })
          }
          aria-label="Assistant IA"
          title="Assistant IA"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#0052FF] to-[#00A3FF] text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Sparkles size={24} />
        </button>
      )}
    </>
  );
}
