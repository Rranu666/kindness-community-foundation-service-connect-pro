import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { toast } from 'sonner';
import { THEME as L } from '@/lib/theme';

export default function FavoriteButton({ providerId, size = 'md', onToggle = null }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null); // cache the record id
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    if (!user?.email) return;
    db.Favorite.filter({ customer_email: user.email, provider_id: providerId })
      .then(res => { if (res.length > 0) { setIsFavorited(true); setFavoriteId(res[0].id); } })
      .catch(() => {});
  }, [user?.email, providerId]);

  const handleToggle = async (e) => {
    e?.stopPropagation?.();
    if (!user?.email) { auth.redirectToLogin(); return; }
    setLoading(true);
    try {
      if (isFavorited && favoriteId) {
        await db.Favorite.delete(favoriteId);
        setIsFavorited(false); setFavoriteId(null);
        toast.success('Removed from favorites');
      } else {
        const created = await db.Favorite.create({ customer_email: user.email, provider_id: providerId });
        setIsFavorited(true); setFavoriteId(created.id);
        toast.success('Added to favorites');
      }
      onToggle?.(providerId, !isFavorited);
    } catch { toast.error('Failed to update favorite'); }
    finally { setLoading(false); }
  };

  const sizes = { sm: { icon: 16, p: 6 }, md: { icon: 18, p: 8 }, lg: { icon: 22, p: 10 } };
  const s = sizes[size] || sizes.md;

  return (
    <button onClick={handleToggle} disabled={loading}
      style={{ width: s.icon + s.p * 2, height: s.icon + s.p * 2, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.6 : 1, background: isFavorited ? `${L.accent}20` : 'rgba(255,255,255,0.85)', border: `1px solid ${isFavorited ? `${L.accent}40` : 'rgba(0,0,0,0.1)'}` }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = `${L.accent}25`; e.currentTarget.style.borderColor = `${L.accent}50`; } }}
      onMouseLeave={e => { e.currentTarget.style.background = isFavorited ? `${L.accent}20` : 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = isFavorited ? `${L.accent}40` : 'rgba(0,0,0,0.1)'; }}>
      {loading
        ? <Loader2 size={s.icon} style={{ color: L.text3 }} className="animate-spin" />
        : <Heart size={s.icon} fill={isFavorited ? L.accent : 'transparent'} style={{ color: isFavorited ? L.accent : L.text3 }} />}
    </button>
  );
}