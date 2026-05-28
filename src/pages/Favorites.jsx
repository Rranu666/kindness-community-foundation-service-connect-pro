import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Heart, Search, Loader2 } from 'lucide-react';
import ProviderCard from '@/components/marketplace/ProviderCard';
import SmartEmptyState from '@/components/ui/SmartEmptyState';
import { THEME as L } from '@/lib/theme';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  const { data: favorites = [], isLoading: favoritesLoading, refetch: refetchFavorites } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: async () => {
      const result = await db.Favorite.filter({ customer_email: user.email });
      return result.map(f => f.provider_id);
    },
    enabled: !!user?.email,
  });

  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ['favorite-providers', favorites],
    queryFn: async () => {
      if (!favorites.length) return [];
      const results = await Promise.all(favorites.map(id => db.ServiceProvider.filter({ id })));
      return results.map(r => r[0]).filter(Boolean);
    },
    enabled: favorites.length > 0,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => db.ServiceCategory.list(),
  });

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.owner_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const catBtnStyle = (active) => ({
    padding: '7px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontWeight: active ? 600 : 400,
    border: `1px solid ${active ? L.accent : L.border}`, background: active ? `${L.accent}10` : '#fff', color: active ? L.accent : L.text2,
  });

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: L.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ color: L.accent }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: L.bg }}>
      {/* Header */}
      <div style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, padding: '40px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Heart size={24} style={{ color: L.accent, fill: L.accent }} />
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', color: L.text, margin: 0 }}>My Favorites</h1>
          </div>
          <p style={{ fontSize: 14, color: L.text2, margin: 0, fontWeight: 300 }}>
            {favorites.length} saved {favorites.length === 1 ? 'provider' : 'providers'}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${L.border}`, padding: '16px 32px', position: 'sticky', top: 68, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: L.text3 }} />
            <input type="text" placeholder="Search favorites..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, background: L.bg2, border: `1px solid ${L.border}`, color: L.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            <button onClick={() => setSelectedCategory('all')} style={catBtnStyle(selectedCategory === 'all')}>All Services</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={catBtnStyle(selectedCategory === cat.id)}>{cat.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px' }}>
        {favoritesLoading || providersLoading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 size={32} style={{ color: L.accent, margin: '0 auto' }} className="animate-spin" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <SmartEmptyState icon="Heart"
            title={favorites.length === 0 ? "No favorites yet" : "No results found"}
            description={favorites.length === 0 ? "Start bookmarking providers to save them for later" : "Try adjusting your search or filters"}
            preset={favorites.length === 0 ? "empty" : "no_results"} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredProviders.map(provider => (
              <ProviderCard key={provider.id} provider={provider} isFavorited={true} onFavoriteChange={() => refetchFavorites()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}