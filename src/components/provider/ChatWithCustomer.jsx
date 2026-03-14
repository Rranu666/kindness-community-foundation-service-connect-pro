import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ChatWithCustomer({ open, onClose, order, senderEmail }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const conversationId = order ? `order-${order.id}` : null;

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', conversationId],
    queryFn: () => base44.entities.ChatMessage.filter({ conversation_id: conversationId }, 'created_date'),
    enabled: !!conversationId && open,
    refetchInterval: open ? 5000 : false
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !conversationId || sending) return;
    setSending(true);
    const text = message.trim();
    setMessage('');
    await base44.entities.ChatMessage.create({
      user_email: senderEmail,
      conversation_id: conversationId,
      role: 'user',
      content: text,
      context: 'booking_help'
    });
    queryClient.invalidateQueries({ queryKey: ['chat', conversationId] });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ background: '#13132a', borderColor: 'rgba(232,53,109,0.3)' }} className="border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            Chat — {order?.customer_name}
            <span className="text-xs font-normal ml-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Order #{order?.order_number}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="h-72 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'thin' }}>
          {messages.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.user_email === senderEmail;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                  style={{
                    background: isMe ? '#e8356d' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                  }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 pt-2 border-t border-white/10">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
            className="flex-1 placeholder:text-gray-500"
          />
          <Button onClick={sendMessage} disabled={sending || !message.trim()}
            style={{ background: '#e8356d' }} className="text-white px-3">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}