import React, { useState, useMemo, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, Search, MapPin, List, Map as MapIcon, RefreshCw } from 'lucide-react';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import ProviderCard from '@/components/marketplace/ProviderCard';
import SearchBar from '@/components/marketplace/SearchBar';
import SmartEmptyState from '@/components/ui/SmartEmptyState';
import { FilterPanel, FilterSidebar } from '@/components/marketplace/ProviderFilters';
import LocationSelector from '@/components/marketplace/LocationSelector';
import ServiceAreaFilter from '@/components/marketplace/ServiceAreaFilter';
import ProviderMap from '@/components/marketplace/ProviderMap';
import { track, EVENTS } from '@/lib/analytics';
import { THEME as L } from '@/lib/theme';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta, breadcrumbSchema } from '@/lib/seo';

export default function Browse() {
  const urlParams = new URLSearchParams(window.location.search);

  const [searchQuery, setSearchQuery] = useState(urlParams.get('q') || '');
  const [locationFilter, setLocationFilter] = useState(urlParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(urlParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [instantBooking, setInstantBooking] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [refreshing, setRefreshing] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => db.ServiceCategory.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: providers = [], isLoading, refetch } = useQuery({
    queryKey: ['providers-browse'],
    queryFn: () => db.ServiceProvider.filter({ is_active: true }, '-rating', 100),
    staleTime: 5 * 60 * 1000,
  });

  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, 'main');

  const filteredProviders = useMemo(() => {
    let result = [...providers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.business_name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.owner_name?.toLowerCase().includes(q)
      );
    }
    if (locationFilter) {
      const loc = locationFilter.toLowerCase();
      result = result.filter(p => {
        const mainLocationMatch = p.location?.toLowerCase().includes(loc);
        const serviceAreasMatch = p.service_areas?.some(area => area.toLowerCase().includes(loc));
        return mainLocationMatch || serviceAreasMatch;
      });
    }
    if (selectedCategory) result = result.filter(p => p.category_id === selectedCategory);
    if (verifiedOnly) result = result.filter(p => p.is_verified);
    if (featuredOnly) result = result.filter(p => p.is_featured);
    if (minRating > 0) result = result.filter(p => (p.rating || 0) >= minRating);
    result = result.filter(p => (p.hourly_rate || 0) >= priceRange[0] && (p.hourly_rate || 0) <= priceRange[1]);
    switch (sortBy) {
      case 'price_low': result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0)); break;
      case 'price_high': result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0)); break;
      case 'reviews': result.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0)); break;
      case 'popularity': result.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0)); break;
      default: result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return result;
  }, [providers, searchQuery, locationFilter, selectedCategory, priceRange, minRating, verifiedOnly, featuredOnly, sortBy]);

  const handleSearch = ({ query, location }) => {
    setSearchQuery(query);
    setLocationFilter(location);
    if (query || location) track(EVENTS.BROWSE_SEARCH, { query, location });
  };

  const clearFilters = () => {
    setSearchQuery(''); setLocationFilter(''); setSelectedCategory('');
    setPriceRange([0, 500]); setMinRating(0);
    setVerifiedOnly(false); setFeaturedOnly(false); setInstantBooking(false);
  };

  const activeFiltersCount = [selectedCategory, verifiedOnly, featuredOnly, instantBooking, minRating > 0, priceRange[0] > 0 || priceRange[1] < 500].filter(Boolean).length;

  const filterProps = {
    categories, selectedCategory, setSelectedCategory,
    priceRange, setPriceRange, minRating, setMinRating,
    verifiedOnly, setVerifiedOnly, featuredOnly, setFeaturedOnly,
    instantBooking, setInstantBooking, onClear: clearFilters,
    locationFilter, setLocationFilter,
  };

  const pageMeta = generatePageMeta('browse', { query: searchQuery });
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: 'https://serviceconnectpro.com/' },
    { name: 'Browse', url: 'https://serviceconnectpro.com/Browse' },
    ...(searchQuery ? [{ name: `${searchQuery} Professionals`, url: `https://serviceconnectpro.com/Browse?q=${encodeURIComponent(searchQuery)}` }] : []),
  ]);

  return (
    <>
      <SeoHelmet 
        title={pageMeta.title} 
        description={pageMeta.description} 
        canonical={pageMeta.canonical}
        schema={breadcrumbs}
      />
    <div style={{ minHeight: '100vh', background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif", position: 'relative' }}>
      {/* Pull-to-Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: Math.min(pullDistance, 80),
          background: L.bg2,
          borderBottom: `1px solid ${L.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          transition: isRefreshing ? 'height 0.3s ease' : 'none',
        }}>
          <RefreshCw size={20} style={{ color: L.accent, animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none' }} />
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Hero / Search ── */}
      <div style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, padding: 'clamp(48px,6vw,80px) 32px 40px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 11, color: L.text3, marginBottom: 20, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.green, display: 'inline-block' }} />
            California · Verified Professionals
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 3.4rem)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.05, color: L.text, marginBottom: 14 }}>
            Find a trusted home pro.<br />
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>Matched to you instantly.</span>
          </h1>
          <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: L.text2, fontWeight: 300, lineHeight: 1.7, marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>
            Browse licensed, background-checked professionals for plumbing, HVAC, cleaning, emergency repairs, and recurring home services.
          </p>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <SearchBar onSearch={handleSearch} initialQuery={searchQuery} initialLocation={locationFilter} />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 28, flexWrap: 'wrap' }}>
            {[{ v: '2,400+', l: 'Verified pros' }, { v: '4.97★', l: 'Avg. rating' }, { v: '<60min', l: 'Response time' }].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', color: L.text }}>{s.v}</div>
                <div style={{ fontSize: 11, color: L.text3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category chips ── */}
      {categories.length > 0 && (
        <div style={{ borderBottom: `1px solid ${L.border}`, background: L.bg, padding: '14px 32px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ id: '', name: 'All Services' }, ...categories].map(cat => {
              const active = selectedCategory === cat.id || (cat.id === '' && !selectedCategory);
              return (
                <button key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === '' ? '' : (selectedCategory === cat.id ? '' : cat.id))}
                  style={{
                    padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                    border: `1px solid ${active ? L.text : L.border}`,
                    background: active ? L.text : 'transparent',
                    color: active ? '#fff' : L.text2,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = L.border2; e.currentTarget.style.background = L.bg3; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.background = 'transparent'; } }}>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 80px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, color: L.text2 }}>{filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found</span>
            {activeFiltersCount > 0 && (
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: L.bg3, color: L.text2, border: `1px solid ${L.border2}` }}>
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Mobile filter */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, background: L.bg3, border: `1px solid ${L.border2}`, color: L.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <SlidersHorizontal size={14} /> Filters
                  {activeFiltersCount > 0 && <span style={{ padding: '1px 7px', borderRadius: 100, background: L.text, color: '#fff', fontSize: 11, fontWeight: 700 }}>{activeFiltersCount}</span>}
                </button>
              </SheetTrigger>
              <SheetContent side="left" style={{ background: L.bg2, borderColor: L.border }}>
                <SheetHeader><SheetTitle style={{ color: L.text }}>Filters</SheetTitle></SheetHeader>
                <div style={{ marginTop: 20 }}>
                  <FilterPanel {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: 2, background: L.bg3, border: `1px solid ${L.border}`, borderRadius: 100, padding: 3 }}>
              {[{ k: 'grid', icon: List, l: 'List' }, { k: 'map', icon: MapIcon, l: 'Map' }].map(({ k, icon: Icon, l }) => (
                <button key={k} onClick={() => setViewMode(k)}
                  style={{ padding: '6px 14px', borderRadius: 100, background: viewMode === k ? L.text : 'transparent', border: 'none', color: viewMode === k ? '#fff' : L.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}>
                  <Icon size={13} /> {l}
                </button>
              ))}
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger style={{ width: 180, background: L.bg2, borderColor: L.border, color: L.text, fontSize: 13, borderRadius: 100 }}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="price_low">Price: Low → High</SelectItem>
                <SelectItem value="price_high">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {viewMode === 'map' ? (
          <ProviderMap providers={filteredProviders} />
        ) : (
          <div style={{ display: 'flex', gap: 28 }} className="flex-col lg:flex-row">
            {/* Desktop sidebar */}
            <div style={{ width: 260, flexShrink: 0 }} className="hidden lg:block">
              <FilterSidebar {...filterProps} />
              <ServiceAreaFilter location={locationFilter} onChange={setLocationFilter} />
            </div>

            {/* Results grid */}
            <div style={{ flex: 1 }}>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20 }}>
                      <Skeleton className="h-40 rounded-t-2xl" />
                      <div style={{ padding: '48px 20px 20px' }}>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProviders.map(provider => <ProviderCard key={provider.id} provider={provider} />)}
                </div>
              ) : (
                <SmartEmptyState
                  preset="noResults"
                  title="No providers found"
                  body="Try adjusting your filters or search query to find the right professional."
                  cta={{ label: 'Clear Filters', onClick: clearFilters }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}