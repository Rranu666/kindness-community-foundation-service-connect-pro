import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageStartButton({ provider, onConversationOpen }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    auth.me().then(setUser).catch(() => {});
  }, []);

  const handleStartChat = async () => {
    if (!user?.email) {
      auth.redirectToLogin();
      return;
    }

    setLoading(true);
    try {
      // Check if conversation exists (limit 1)
      const existing = await db.ChatConversation.filter({
        customer_email: user.email,
        provider_id: provider.id,
      }, '-created_date', 1);

      let conversationId;
      if (existing.length > 0) {
        conversationId = existing[0].id;
      } else {
        // Create new conversation
        const newConv = await db.ChatConversation.create({
          customer_email: user.email,
          provider_id: provider.id,
          provider_email: provider.email,
          last_message: '',
          last_message_time: new Date().toISOString(),
          is_read_by_customer: false,
          is_read_by_provider: false,
        });
        conversationId = newConv.id;
      }

      onConversationOpen(conversationId);
    } catch (err) {
      toast.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        borderRadius: 10,
        background: '#4361EE',
        border: 'none',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
      Message Provider
    </button>
  );
}