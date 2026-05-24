import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api, { API_BASE_URL } from "../../services/api";

const socketBaseUrl = (api.defaults.baseURL || API_BASE_URL).replace(/\/$/, "");

// Synthetic conversation id for the AI assistant — never collides with a real
// one. History + answers are served by the NestJS /ai routes (backend task).
const AI_CONV_ID = "__ai_assistant__";

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
  const location = useLocation();

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

  // AI agent state
  const [aiMessages, setAiMessages] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadedOnce, setAiLoadedOnce] = useState(false);
  const isAiActive = activeConvId === AI_CONV_ID;

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const activeConvIdRef = useRef(null);
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // Auto-open AI assistant when navigated here with { state: { openAi: true } }
  useEffect(() => {
    if (location.state?.openAi) {
      setActiveConvId(AI_CONV_ID);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Load AI history from the backend the first time the AI chat is opened
  useEffect(() => {
    if (!isAiActive || aiLoadedOnce) return;

    let cancelled = false;
    const loadAiHistory = async () => {
      try {
        setAiLoading(true);
        const { data } = await api.get("/ai/history");
        if (!cancelled) {
          setAiMessages(
            (data || []).map((m) => ({
              id: m.id,
              text: m.text,
              isOwn: m.isOwn,
              isSensitive: m.isSensitive,
              time: m.time,
            })),
          );
        }
      } catch (error) {
        // Backend not ready yet — start empty, stay usable.
        console.warn("AI history unavailable:", error?.message);
        if (!cancelled) setAiMessages([]);
      } finally {
        if (!cancelled) {
          setAiLoading(false);
          setAiLoadedOnce(true);
        }
      }
    };

    loadAiHistory();
    return () => {
      cancelled = true;
    };
  }, [isAiActive, aiLoadedOnce]);

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
    if (!activeConvId || activeConvId === AI_CONV_ID) return;

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
  }, [activeMessages, activeConvId, aiMessages, aiTyping]);

  useEffect(() => {
    if (!socketRef.current?.connected || !activeConvId || isAiActive) return;

    socketRef.current.emit("join_conversation", {
      conversationId: activeConvId,
    });
    socketRef.current.emit("mark_read", {
      conversationId: activeConvId,
    });
  }, [activeConvId]);

  const sendAiMessage = async () => {
    const content = messageText.trim();
    if (!content || aiTyping) return;

    setMessageText("");
    setAiMessages((prev) => [
      ...prev,
      {
        id: `ai-u-${Date.now()}`,
        text: content,
        isOwn: true,
        time: new Date().toISOString(),
      },
    ]);
    setAiTyping(true);

    try {
      const { data } = await api.post("/ai/ask", { message: content });
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-a-${Date.now()}`,
          text: data?.answer || "…",
          isOwn: false,
          time: data?.createdAt || new Date().toISOString(),
          isSensitive: data?.isSensitive ?? false,
        },
      ]);
    } catch (error) {
      console.error("AI request failed:", error);
      toast.error(
        error.response?.data?.message ||
          "L'assistant IA est indisponible pour le moment",
      );
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          text: "Désolé, je n'ai pas pu répondre. Réessayez plus tard.",
          isOwn: false,
          time: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  const clearAiChat = async () => {
    const previous = aiMessages;
    setAiMessages([]);
    try {
      await api.delete("/ai/history");
    } catch (error) {
      console.error("Failed to clear AI history:", error);
      toast.error("Impossible d'effacer l'historique");
      setAiMessages(previous);
    }
  };

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

  if (loading && !isAiActive) {
    chatContent = (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium">Chargement...</p>
        </div>
      </div>
    );
  } else if (isAiActive) {
    chatContent = (
      <>
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Assistant IA</p>
            <p className="text-xs text-purple-500 font-medium">
              {aiTyping ? "En train d'écrire…" : "Assistant médical"}
            </p>
          </div>
          {aiMessages.length > 0 && (
            <button
              onClick={clearAiChat}
              className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {aiLoading && (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!aiLoading && aiMessages.length === 0 && !aiTyping && (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center max-w-sm">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-600">Posez une question médicale</p>
                <p className="text-sm mt-1">L'assistant répond à partir de sources médicales.</p>
              </div>
            </div>
          )}

          {aiMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
              {!msg.isOwn && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}
              <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.isOwn
                      ? "bg-primary text-white rounded-br-sm"
                      : msg.isError
                        ? "bg-red-50 text-red-700 border border-red-100 rounded-bl-sm"
                        : "bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${msg.isOwn ? "text-right" : "text-left"}`}>
                  {formatTime(msg.time)}
                </p>
              </div>
            </div>
          ))}

          {aiTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm border border-gray-100 px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAiMessage()}
              className="input-field flex-1"
              placeholder="Posez une question à l'assistant IA…"
              disabled={aiTyping}
            />
            <button
              onClick={sendAiMessage}
              className="btn-primary px-5 disabled:opacity-60"
              disabled={aiTyping || !messageText.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </>
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
            {/* AI assistant — pinned entry */}
            <button
              onClick={() => setActiveConvId(AI_CONV_ID)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-purple-50/50 transition-colors ${
                isAiActive ? "bg-purple-50 border-l-2 border-l-purple-500" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">Assistant IA</p>
                  <p className="text-xs text-gray-500 truncate">
                    {aiMessages.length > 0
                      ? aiMessages[aiMessages.length - 1].text
                      : "Posez une question médicale"}
                  </p>
                </div>
              </div>
            </button>

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

  );
}