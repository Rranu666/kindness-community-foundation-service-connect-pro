import { useState, useEffect, useRef } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2, ArrowLeft, Paperclip, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { THEME as L } from '@/lib/theme';

export default function ChatWindow({ conversationId, currentUser, otherUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: fetchedMessages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => db.ChatMessage.filter({ conversation_id: conversationId }, '-created_date', 100),
    enabled: !!conversationId,
    refetchInterval: 15 * 1000,
    staleTime: 5 * 1000,
  });

  useEffect(() => { setMessages(fetchedMessages); }, [fetchedMessages]);

  useEffect(() => {
    if (!conversationId) return;
    let mounted = true;
    const unsubscribe = db.ChatMessage.subscribe((event) => {
      if (mounted && event.data?.conversation_id === conversationId) {
        if (event.type === 'create') setMessages(prev => [event.data, ...prev]);
        else if (event.type === 'update') setMessages(prev => prev.map(m => m.id === event.id ? event.data : m));
      }
    });
    return () => { mounted = false; unsubscribe?.(); };
  }, [conversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingFile(true);
    try {
      for (const file of files) {
        const { file_url } = await uploadFile({ file });
        setAttachedFiles(prev => [...prev, { name: file.name, url: file_url, size: file.size }]);
      }
    } catch { toast.error('File upload failed'); }
    finally { setUploadingFile(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !attachedFiles.length) return;
    setSending(true);
    try {
      const fileLinks = attachedFiles.map(f => `[${f.name}](${f.url})`).join('\n');
      const fullContent = fileLinks ? `${newMessage.trim()}\n${fileLinks}` : newMessage.trim();
      await db.ChatMessage.create({ conversation_id: conversationId, sender_email: currentUser.email, content: fullContent });
      await db.ChatConversation.update(conversationId, {
        last_message: (newMessage.trim() || 'Shared files').substring(0, 100),
        last_message_time: new Date().toISOString(),
        is_read_by_customer: currentUser.role === 'customer',
        is_read_by_provider: currentUser.role === 'provider',
      });
      setNewMessage(''); setAttachedFiles([]);
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const isMine = (msg) => msg.sender_email === currentUser.email;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh', background: L.bg }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${L.border}`, background: L.bg2 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: L.text, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: L.text, margin: 0 }}>{otherUser?.business_name || otherUser?.full_name}</p>
          <p style={{ fontSize: 11, color: L.green, margin: 0 }}>Online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 6 }}>
            <p style={{ color: L.text2, fontSize: 14 }}>No messages yet. Start a conversation!</p>
            <p style={{ color: L.text3, fontSize: 12 }}>Discuss project details and clarify requirements</p>
          </div>
        ) : messages.map((msg) => {
          const mine = isMine(msg);
          const isFileMessage = msg.content?.includes('](');
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
              <div style={{ maxWidth: '70%', padding: '11px 14px', borderRadius: 14, background: mine ? L.text : '#fff', border: `1px solid ${mine ? L.text : L.border}`, fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word' }}>
                {isFileMessage ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {msg.content.split('\n').map((line, i) => {
                      const m = line.match(/\[(.*?)\]\((.*?)\)/);
                      if (m) return <a key={i} href={m[2]} download style={{ display: 'flex', alignItems: 'center', gap: 6, color: mine ? '#fff' : L.accent, textDecoration: 'none', padding: '6px 10px', background: mine ? 'rgba(255,255,255,0.15)' : `${L.accent}10`, borderRadius: 8, fontSize: 13 }}><Download size={13} />{m[1]}</a>;
                      return line && <span key={i} style={{ color: mine ? '#fff' : L.text }}>{line}</span>;
                    })}
                  </div>
                ) : <span style={{ color: mine ? '#fff' : L.text }}>{msg.content}</span>}
                <div style={{ fontSize: 10, color: mine ? 'rgba(255,255,255,0.5)' : L.text3, marginTop: 5 }}>
                  {new Date(msg.created_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {attachedFiles.length > 0 && (
        <div style={{ padding: '10px 20px', borderTop: `1px solid ${L.border}`, background: L.bg2, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: L.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attached Files</p>
          {attachedFiles.map((file, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: '#fff', borderRadius: 8, border: `1px solid ${L.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Paperclip size={12} style={{ color: L.accent, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: L.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                  <p style={{ fontSize: 10, color: L.text3, margin: 0 }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => setAttachedFiles(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: L.text3, cursor: 'pointer', padding: 0 }}><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${L.border}`, background: '#fff', display: 'flex', gap: 8 }}>
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." disabled={sending}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 100, background: L.bg2, border: `1px solid ${L.border}`, color: L.text, fontSize: 13, outline: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
          style={{ padding: '10px 12px', borderRadius: 100, background: 'transparent', border: `1px solid ${L.border}`, color: L.text2, cursor: uploadingFile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploadingFile ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
        </button>
        <button onClick={handleSend} disabled={sending || (!newMessage.trim() && !attachedFiles.length)}
          style={{ padding: '10px 16px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', cursor: 'pointer', opacity: (sending || (!newMessage.trim() && !attachedFiles.length)) ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} accept="*/*" />
      </div>
    </div>
  );
}