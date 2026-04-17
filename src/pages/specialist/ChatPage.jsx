import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import SpecialistLayout from "../../components/layout/SpecialistLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const socketBaseUrl = (api.defaults.baseURL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

function getCurrentUserId(user, specialist) {
  return user?.id || user?.userId || specialist?.id || specialist?.userId || "";
}

function formatConversation(conversation, currentUserRole) {
  const counterpart =
    currentUserRole === "DOCTOR"
      ? conversation.patient?.user
      : conversation.specialist?.user;
  const lastMessage = conversation.messages?.[0];

  return {
    conversationId: conversation.conversationId,
    patientId: conversation.patientId,
    specialistId: conversation.specialistId,
    counterpartName: counterpart?.fullName || "Patient",
    counterpartImage: counterpart?.imageUrl || null,
    lastMessage: lastMessage?.content || "Aucun message",
    lastMessageTime: lastMessage?.createdAt || conversation.createdAt,
  };
}

function formatMessage(message, currentUserId) {
  return {
    id: message.messageId,
    senderId: message.senderId,
    senderName: message.sender?.fullName || message.senderName || "Utilisateur",
    senderImage: message.sender?.imageUrl || message.senderImage || null,
    text: message.content,
    time: message.createdAt,
    isOwn: message.senderId === currentUserId,
    isRead: message.isRead ?? false,
  };
}

export default function ChatPage() {
  const { t } = useTranslation();
  const { user, specialist } = useAuth();

  const currentUserId = getCurrentUserId(user, specialist);
  const currentUserRole = user?.role || "DOCTOR";

  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [activeConvId, setActiveConvId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const activeConvIdRef = useRef(null);
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const activeConv = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.conversationId === activeConvId,
      ),
    [activeConvId, conversations],
  );

  const activeMessages = messagesByConversation[activeConvId] || [];

  const refreshUnreadCount = async () => {
    try {
      const { data } = await api.get("/chat/unread");
      setUnreadCount(data?.count || 0);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const updateConversationPreview = (
    conversationId,
    previewText,
    previewTime,
  ) => {
    setConversations((previous) => {
      const updated = previous.map((conversation) =>
        conversation.conversationId === conversationId
          ? {
              ...conversation,
              lastMessage: previewText,
              lastMessageTime: previewTime,
            }
          : conversation,
      );

      return [...updated].sort(
        (a, b) =>
          new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0),
      );
    });
  };

  const appendMessage = (conversationId, message) => {
    setMessagesByConversation((previous) => ({
      ...previous,
      [conversationId]: [...(previous[conversationId] || []), message],
    }));
    updateConversationPreview(conversationId, message.text, message.time);
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);

        const [conversationsRes, unreadRes] = await Promise.all([
          api.get("/chat/conversations"),
          api.get("/chat/unread"),
        ]);

        const formattedConversations = (conversationsRes.data || []).map(
          (conversation) => formatConversation(conversation, currentUserRole),
        );

        setConversations(formattedConversations);
        setUnreadCount(unreadRes.data?.count || 0);

        if (formattedConversations.length > 0) {
          setActiveConvId(
            (previous) => previous || formattedConversations[0].conversationId,
          );
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
        toast.error(
          error.response?.data?.message ||
            "Impossible de charger les conversations",
        );
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUserRole]);

  useEffect(() => {
    if (!activeConvId) return;

    const loadMessages = async () => {
      try {
        const { data } = await api.get(
          `/chat/conversations/${activeConvId}/messages`,
        );

        if (!data) {
          toast.error("Accès refusé à cette conversation");
          return;
        }

        const formattedMessages = (data || []).map((message) =>
          formatMessage(message, currentUserIdRef.current),
        );

        setMessagesByConversation((previous) => ({
          ...previous,
          [activeConvId]: formattedMessages,
        }));

        if (socketRef.current?.connected) {
          socketRef.current.emit("join_conversation", {
            conversationId: activeConvId,
          });
          socketRef.current.emit("mark_read", {
            conversationId: activeConvId,
          });
        }

        refreshUnreadCount();
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error(
          error.response?.data?.message || "Impossible de charger les messages",
        );
      }
    };

    loadMessages();
  }, [activeConvId]);

  useEffect(() => {
    if (!currentUserId) return undefined;

    const token =
      user?.accessToken ||
      JSON.parse(localStorage.getItem("sahtech_user") || "{}").accessToken;

    if (!token) return undefined;

    const socket = io(`${socketBaseUrl}/chat`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (activeConvIdRef.current) {
        socket.emit("join_conversation", {
          conversationId: activeConvIdRef.current,
        });
      }
    });

    socket.on("new_message", (message) => {
      const formattedMessage = formatMessage(message, currentUserIdRef.current);
      appendMessage(message.conversationId, formattedMessage);

      if (formattedMessage.senderId !== currentUserIdRef.current) {
        if (activeConvIdRef.current === message.conversationId) {
          socket.emit("mark_read", {
            conversationId: message.conversationId,
          });
        } else {
          toast.info(
            `${formattedMessage.senderName}: ${formattedMessage.text.slice(0, 70)}`,
          );
          refreshUnreadCount();
        }
      }
    });

    socket.on("notification", (notification) => {
      if (notification.conversationId === activeConvIdRef.current) {
        return;
      }

      toast.info(`${notification.senderName}: ${notification.preview}`);
      refreshUnreadCount();
    });

    socket.on("messages_read", ({ conversationId }) => {
      if (conversationId === activeConvIdRef.current) {
        refreshUnreadCount();
      }
    });

    socket.on("error", (payload) => {
      toast.error(payload?.message || "Erreur de messagerie");
    });

    socket.on("disconnect", () => {
      socketRef.current = null;
    });

    return () => {
      socket.off("connect");
      socket.off("new_message");
      socket.off("notification");
      socket.off("messages_read");
      socket.off("error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, user?.accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, activeConvId]);

  useEffect(() => {
    if (!socketRef.current?.connected || !activeConvId) return;

    socketRef.current.emit("join_conversation", {
      conversationId: activeConvId,
    });
    socketRef.current.emit("mark_read", {
      conversationId: activeConvId,
    });
  }, [activeConvId]);

  const sendMessage = async () => {
    if (!messageText.trim() || !activeConvId) return;

    const content = messageText.trim();
    setMessageText("");
    setSending(true);

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("send_message", {
          conversationId: activeConvId,
          content,
        });
      } else {
        const { data } = await api.post(
          `/chat/conversations/${activeConvId}/messages`,
          { content },
        );

        if (data) {
          const fallbackMessage = formatMessage(data, currentUserId);
          appendMessage(activeConvId, fallbackMessage);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(
        error.response?.data?.message || "Impossible d'envoyer le message",
      );
      setMessageText(content);
    } finally {
      setSending(false);
    }
  };

  const selectConv = (id) => {
    setActiveConvId(id);
  };

  const filteredConvs = useMemo(() => {
    const query = search.toLowerCase();

    return conversations.filter((conversation) => {
      return (
        conversation.counterpartName.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query)
      );
    });
  }, [conversations, search]);

  const formatTime = (iso) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  let chatContent = null;

  if (loading) {
    chatContent = (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium">Chargement...</p>
        </div>
      </div>
    );
  } else if (activeConv) {
    chatContent = (
      <>
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
            {activeConv.counterpartImage ? (
              <img
                src={activeConv.counterpartImage}
                alt={activeConv.counterpartName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-bold">
                {activeConv.counterpartName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {activeConv.counterpartName}
            </p>
            <p className="text-xs text-green-500 font-medium">En ligne</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
            >
              {!msg.isOwn && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end overflow-hidden">
                  {msg.senderImage ? (
                    <img
                      src={msg.senderImage}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-xs font-bold">
                      {msg.senderName?.charAt(0)}
                    </span>
                  )}
                </div>
              )}
              <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.isOwn
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
                <p
                  className={`text-xs text-gray-400 mt-1 ${msg.isOwn ? "text-right" : "text-left"}`}
                >
                  {formatTime(msg.time)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              className="input-field flex-1"
              placeholder={t("chat.type_message")}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              className="btn-primary px-5 disabled:opacity-60"
              disabled={sending || !messageText.trim()}
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </>
    );
  } else {
    chatContent = (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="font-medium">{t("chat.no_conversation")}</p>
        </div>
      </div>
    );
  }

  return (
    <SpecialistLayout>
      <div className="flex h-full">
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-bold text-gray-900">{t("chat.title")}</h2>
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {unreadCount} non lus
              </span>
            </div>
            <div className="relative">
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
                className="input-field pl-9 text-sm py-2"
                placeholder={t("chat.search_conversations")}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-4 text-sm text-gray-500">
                Chargement des conversations...
              </div>
            )}
            {!loading && filteredConvs.length === 0 && (
              <div className="p-4 text-sm text-gray-500">
                Aucune conversation trouvée.
              </div>
            )}

            {filteredConvs.map((conv) => (
              <button
                key={conv.conversationId}
                onClick={() => selectConv(conv.conversationId)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  activeConvId === conv.conversationId
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                      {conv.counterpartImage ? (
                        <img
                          src={conv.counterpartImage}
                          alt={conv.counterpartName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold text-sm">
                          {conv.counterpartName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm text-gray-900">
                        {conv.counterpartName}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-50">{chatContent}</div>
      </div>
    </SpecialistLayout>
  );
}
