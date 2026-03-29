import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SpecialistLayout from '../../components/layout/SpecialistLayout';
import { mockConversations } from '../../services/mockData';

export default function ChatPage() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const sendMessage = () => {
    if (!messageText.trim() || !activeConvId) return;
    const newMsg = {
      id: Date.now(),
      senderId: 1,
      senderName: 'Dr. Amira Benali',
      text: messageText,
      time: new Date().toISOString(),
      isOwn: true,
    };
    setConversations(prev => prev.map(c => c.id === activeConvId
      ? { ...c, messages: [...c.messages, newMsg], lastMessage: messageText, lastMessageTime: new Date().toISOString(), unreadCount: 0 }
      : c));
    setMessageText('');

    // Simulate reply
    setTimeout(() => {
      const replies = ["Merci pour l'info !", "D'accord, je comprends.", "Parfait, à bientôt !", "Je ferai comme vous dites.", "Merci docteur !"];
      const reply = {
        id: Date.now() + 1,
        senderId: 'patient',
        senderName: activeConv?.patientName,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toISOString(),
        isOwn: false,
      };
      setConversations(prev => prev.map(c => c.id === activeConvId
        ? { ...c, messages: [...c.messages, reply], lastMessage: reply.text }
        : c));
    }, 1500);
  };

  const selectConv = (id) => {
    setActiveConvId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
  };

  const filteredConvs = conversations.filter(c =>
    c.patientName.toLowerCase().includes(search.toLowerCase()));

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <SpecialistLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3">{t('chat.title')}</h2>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 text-sm py-2" placeholder={t('chat.search_conversations')} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => (
              <button key={conv.id} onClick={() => selectConv(conv.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeConvId === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{conv.patientName.charAt(0)}</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm text-gray-900">{conv.patientName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium">{t('chat.no_conversation')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">{activeConv.patientName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{activeConv.patientName}</p>
                  <p className="text-xs text-green-500 font-medium">En ligne</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeConv.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isOwn && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end">
                        <span className="text-gray-600 text-xs font-bold">{msg.senderName?.charAt(0)}</span>
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${msg.isOwn ? '' : ''}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.isOwn
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'}`}>
                        {msg.text}
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gray-100 p-4">
                <div className="flex gap-3">
                  <input
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    className="input-field flex-1"
                    placeholder={t('chat.type_message')}
                  />
                  <button onClick={sendMessage} className="btn-primary px-5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SpecialistLayout>
  );
}
