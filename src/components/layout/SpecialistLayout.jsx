import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Logo from "../common/Logo";
import LanguageSwitcher from "../common/LanguageSwitcher";

const socketBaseUrl = (api.defaults.baseURL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

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

const icons = {
  dashboard: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  patients: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  reports: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  chat: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  posts: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
      />
    </svg>
  ),
  accueil: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  ),
  exercises: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  search: (
    <svg
      className="w-5 h-5"
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
  ),
  planning: (
    <svg
      className="w-5 h-5"
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
  ),
  profile: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
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
  { key: "profile", path: "/specialist/profile" },
];

export default function SpecialistLayout({ children }) {
  const { t } = useTranslation();
  const { user, specialist, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

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

    return () => {
      socket.off("new_message");
      socket.off("notification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, location.pathname, navigate, t, user?.accessToken]);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <Logo size="sm" />
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {displayName.charAt(0)}
                </span>
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-gray-800 truncate">
                {displayName}
              </p>
              {displaySpecialty && (
                <p className="text-xs text-gray-500 truncate">
                  {displaySpecialty}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              {icons[item.key]}
              <span>{t(`nav.${item.key}`)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

SpecialistLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
