import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export default function ChatAssistant({ context = 'general_help' }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(uuidv4());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      user_email: user?.email || 'guest',
      conversation_id: conversationId,
      role: 'user',
      content: input,
      context
    };

    // Save user message only if logged in
    if (user) {
      await base44.entities.ChatMessage.create(userMessage);
    }
    setMessages(prev => [...prev, { ...userMessage, id: Date.now() }]);
    setInput('');
    setLoading(true);

    try {
      // Get AI response
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful customer service assistant for a service marketplace. Context: ${context}\n\nUser: ${input}\n\nProvide a concise, helpful response.`
      });

      const assistantMessage = {
        user_email: user?.email || 'guest',
        conversation_id: conversationId,
        role: 'assistant',
        content: response,
        context
      };

      if (user) {
        await base44.entities.ChatMessage.create(assistantMessage);
      }
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
      await base44.entities.ChatMessage.update(messages[messageIndex].id, { is_helpful: isHelpful });
      toast.success(isHelpful ? 'Thanks for the feedback!' : 'We appreciate the feedback');
    }
  };

  return (
    <div
      style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.2)' }}
      className="rounded-lg flex flex-col h-96"
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-xs rounded-lg px-4 py-2"
              style={{
                background: message.role === 'user' ? '#cb3c7a' : 'rgba(255,255,255,0.1)',
                color: '#fff'
              }}
            >
              <p className="text-sm">{message.content}</p>
              {message.role === 'assistant' && (
                <div className="flex gap-1 mt-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 text-white hover:bg-white/20"
                    onClick={() => markHelpful(message.id, true)}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 text-white hover:bg-white/20"
                    onClick={() => markHelpful(message.id, false)}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3" style={{ borderColor: 'rgba(203,60,122,0.2)' }}>
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff' }}
            className="text-white"
            disabled={loading}
          />
          <Button
            size="icon"
            style={{ background: '#cb3c7a' }}
            className="text-white hover:opacity-90"
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}