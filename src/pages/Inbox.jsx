import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Loader2, Search, Clock, CheckCircle2 } from 'lucide-react';
import ChatWindow from '@/components/chat/ChatWindow';
import SmartEmptyState from '@/components/ui/SmartEmptyState';
import { THEME as L } from '@/lib/theme';

export default function Inbox() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return db.ChatConversation.filter(
        user.role === 'provider' ? { provider_email: user.email } : { customer_email: user.email },
        '-last_message_time'
      );
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = db.ChatConversation.subscribe(() => refetch());
    return unsubscribe;
  }, [user?.email, refetch]);

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv.id);
    if (user.role === 'provider') {
      setOtherUser({ email: conv.customer_email, full_name: conv.customer_email });
    } else {
      const provider = await db.ServiceProvider.filter({ id: conv.provider_id });
      setOtherUser(provider[0]);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const displayName = user?.role === 'provider' ? conv.customer_email : 'Provider';
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: L.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ color: L.accent }} className="animate-spin" />
      </div>
    );
  }

  if (selectedConversation && otherUser) {
    return (
      <ChatWindow conversationId={selectedConversation} currentUser={user} otherUser={otherUser}
        onClose={() => { setSelectedConversation(null); setOtherUser(null); refetch(); }} />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: L.bg }}>
      {/* Header */}
      <div style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, padding: '28px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <MessageCircle size={24} style={{ color: L.accent }} />
            <h1 style={{ fontSize: 26, fontWeight: 700, color: L.text, margin: 0, letterSpacing: '-0.5px' }}>Messages</h1>
          </div>
          <p style={{ fontSize: 13, color: L.text3, margin: 0, fontWeight: 300 }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ borderBottom: `1px solid ${L.border}`, padding: '16px 32px', background: '#fff', position: 'sticky', top: 68, zIndex: 20 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: L.text3 }} />
          <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, background: L.bg2, border: `1px solid ${L.border}`, color: L.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Conversations */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: L.accent, margin: '0 auto' }} className="animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ padding: '60px 32px' }}>
            <SmartEmptyState icon="MessageCircle" title="No conversations yet" description="Start messaging with service providers to discuss your project" preset="empty" />
          </div>
        ) : (
          filteredConversations.map(conv => (
            <button key={conv.id} onClick={() => handleSelectConversation(conv)}
              style={{ width: '100%', padding: '18px 32px', borderBottom: `1px solid ${L.border}`, background: 'none', border: 'none', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: L.border, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = L.bg2}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: L.text, margin: 0 }}>
                      {user.role === 'provider' ? conv.customer_email : 'Service Provider'}
                    </p>
                    {conv.last_message_time && <Clock size={12} style={{ color: L.text3 }} />}
                  </div>
                  <p style={{ fontSize: 13, color: L.text2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 300 }}>
                    {conv.last_message || 'No messages yet'}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: L.text3 }}>
                    {conv.last_message_time && new Date(conv.last_message_time).toLocaleDateString()}
                  </div>
                  <CheckCircle2 size={14} style={{ color: L.green }} />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}