import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const L = {
  bg: '#ffffff',
  bg2: '#f7f7f5',
  border: '#e2e0dc',
  text: '#111111',
  text2: '#555555',
  text3: '#999999',
  rose: '#FF4D6D',
  blue: '#4361EE',
};

export default function ChatAssistant({ context = 'general_help' }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(uuidv4());

  useEffect(() => {
    auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage = {
      user_email: user.email,
      conversation_id: conversationId,
      role: 'user',
      content: input,
      context
    };

    // Save user message
    await db.ChatMessage.create(userMessage);
    setMessages(prev => [...prev, { ...userMessage, id: Date.now() }]);
    setInput('');
    setLoading(true);

    try {
      // Get AI response
      const response = await invokeLLM({
        prompt: `You are a helpful customer service assistant for a service marketplace. Context: ${context}\n\nUser: ${input}\n\nProvide a concise, helpful response.`
      });

      const assistantMessage = {
        user_email: user.email,
        conversation_id: conversationId,
        role: 'assistant',
        content: response,
        context
      };

      await db.ChatMessage.create(assistantMessage);
      setMessages(prev => [...prev, { ...assistantMessage, id: Date.now() + 1 }]);
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (messageId, isHelpful) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      await db.ChatMessage.update(messages[messageIndex].id, { is_helpful: isHelpful });
      toast.success(isHelpful ? 'Thanks for the feedback!' : 'We appreciate the feedback');
    }
  };

  return (
    <div style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20, display: 'flex', flexDirection: 'column', height: 400, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((message) => (
          <div key={message.id} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '70%',
              borderRadius: 14,
              padding: '10px 14px',
              background: message.role === 'user' ? L.rose : L.bg,
              border: message.role === 'user' ? 'none' : `1px solid ${L.border}`,
              color: message.role === 'user' ? '#fff' : L.text,
            }}>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{message.content}</p>
              {message.role === 'assistant' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => markHelpful(message.id, true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <ThumbsUp size={14} style={{ color: L.text3 }} />
                  </button>
                  <button onClick={() => markHelpful(message.id, false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <ThumbsDown size={14} style={{ color: L.text3 }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: L.bg, border: `1px solid ${L.border}`, borderRadius: 14, padding: '10px 14px' }}>
              <div style={{ width: 32, height: 4, borderRadius: 2, background: L.border, animation: 'pulse 1s infinite' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ borderTop: `1px solid ${L.border}`, padding: 12, display: 'flex', gap: 8 }}>
        <input
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={loading}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 12,
            padding: '0 12px',
            border: `1px solid ${L.border}`,
            background: L.bg,
            color: L.text,
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = L.blue}
          onBlur={e => e.target.style.borderColor = L.border}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: 'none',
            background: L.rose,
            color: '#fff',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}