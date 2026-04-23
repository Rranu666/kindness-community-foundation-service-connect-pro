import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal, X, Zap, Star, BadgeCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProviderCard from '@/components/marketplace/ProviderCard';
import SearchBar from '@/components/marketplace/SearchBar';

const PINK = '#f97316';

const FALLBACK_CATEGORIES = [
  { id: 'ai-automation', name: 'AI & Automation' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'catering', name: 'Catering' },
  { id: 'data-science', name: 'Data Science' },
  { id: 'web-development', name: 'Web Development' },
  { id: 'tutoring', name: 'Tutoring' },
  { id: 'moving', name: 'Moving & Delivery' },
  { id: 'photography', name: 'Photography' },
];

export default function Browse() {
  const urlParams = new URLSearchParams(window.location.search);

  const [searchQuery, setSearchQuery] = useState(urlParams.get('q') || '');
  const [locationFilter, setLocationFilter] = useState(urlParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(urlParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [instantBooking, setInstantBooking] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const { data: categories = FALLBACK_CATEGORIES } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const result = await base44.entities.ServiceCategory.list();
        return result.length > 0 ? result : FALLBACK_CATEGORIES;
      } catch {
        return FALLBACK_CATEGORIES;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers-browse'],
    queryFn: () => base44.entities.ServiceProvider.filter({ is_active: true }, '-rating', 200),
    staleTime: 2 * 60 * 1000,
  });

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
      result = result.filter(p =>
        p.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      // selectedCategory may be a DB UUID or a fallback slug — match both ways
      const selectedCat = categories.find(c => c.id === selectedCategory);
      result = result.filter(p =>
        p.category_id === selectedCategory ||
        (selectedCat && p.category_id === selectedCat.id)
      );
    }

    if (verifiedOnly) result = result.filter(p => p.is_verified);
    if (featuredOnly) result = result.filter(p => p.is_featured);

    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }

    result = result.filter(p =>
      (p.hourly_rate || 0) >= priceRange[0] && (p.hourly_rate || 0) <= priceRange[1]
    );

    switch (sortBy) {
      case 'price_low': result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0)); break;
      case 'price_high': result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0)); break;
      case 'reviews': result.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0)); break;
      case 'popularity': result.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0)); break;
      default: result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [providers, categories, searchQuery, locationFilter, selectedCategory, priceRange, minRating, verifiedOnly, featuredOnly, sortBy]);

  const handleSearch = ({ query, location }) => {
    setSearchQuery(query);
    setLocationFilter(location);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setSelectedCategory('all');
    setPriceRange([0, 500]);
    setMinRating(0);
    setVerifiedOnly(false);
    setFeaturedOnly(false);
    setInstantBooking(false);
  };

  const activeFiltersCount = [
    selectedCategory && selectedCategory !== 'all',
    verifiedOnly,
    featuredOnly,
    instantBooking,
    minRating > 0,
    priceRange[0] > 0 || priceRange[1] < 500
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-medium text-white mb-3 text-sm">Category</h4>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="text-white" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(249,115,22,0.2)' }}>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-white mb-3 text-sm">Price Range ($/hr)</h4>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={500} step={10} className="mb-2" />
        <div className="flex justify-between text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <h4 className="font-medium text-white mb-3 text-sm">Minimum Rating</h4>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 3, 4, 4.5].map(r => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className="flex items-center justify-center gap-0.5 py-1.5 rounded-lg text-xs font-medium transition-colors w-full"
              style={{
                background: minRating === r ? PINK : 'rgba(255,255,255,0.07)',
                color: minRating === r ? '#fff' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${minRating === r ? PINK : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {r === 0 ? 'Any' : (
                <span className="inline-flex items-center gap-0.5 leading-none">
                  <span className="text-[11px] leading-none" style={{ color: minRating === r ? '#fff' : '#f59e0b' }}>★</span>
                  <span>{r}+</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <h4 className="font-medium text-white text-sm">Provider Type</h4>
        {[
          { id: 'verified', label: 'Verified Only', icon: BadgeCheck, value: verifiedOnly, onChange: setVerifiedOnly },
          { id: 'featured', label: 'Featured Sellers', icon: Star, value: featuredOnly, onChange: setFeaturedOnly },
          { id: 'instant', label: 'Instant Booking', icon: Zap, value: instantBooking, onChange: setInstantBooking },
        ].map(({ id, label, icon: Icon, value, onChange }) => (
          <div key={id} className="flex items-center gap-2">
            <Checkbox id={id} checked={value} onCheckedChange={onChange} />
            <label htmlFor={id} className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <Icon className="w-3.5 h-3.5" style={{ color: PINK }} />
              {label}
            </label>
          </div>
        ))}
      </div>

      <Button onClick={clearFilters} className="w-full text-white border-0" style={{ background: PINK }}>
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0f0900' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0c00 0%, #0f0900 100%)', borderBottom: '1px solid rgba(249,115,22,0.2)' }} className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Find Service Providers</h1>
          <p className="mb-4 sm:mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Browse categories, filter by location, rating, and more
          </p>
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} initialLocation={locationFilter} dark />
        </div>
      </div>

      {/* Category quick-filter chips */}
      {categories.length > 0 && (
        <div className="border-b" style={{ borderColor: 'rgba(249,115,22,0.1)', background: '#140b00' }}>
          <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: selectedCategory === 'all' ? PINK : 'rgba(255,255,255,0.07)',
                color: selectedCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${selectedCategory === 'all' ? PINK : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: selectedCategory === cat.id ? PINK : 'rgba(255,255,255,0.07)',
                  color: selectedCategory === cat.id ? '#fff' : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${selectedCategory === cat.id ? PINK : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
            </span>
            {activeFiltersCount > 0 && (
              <Badge style={{ background: 'rgba(249,115,22,0.2)', color: PINK, border: `1px solid rgba(249,115,22,0.3)` }}>
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden flex-1 sm:flex-none text-white hover:bg-white/10 hover:text-white" style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }}>
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 text-white border-0" style={{ background: PINK }}>{activeFiltersCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" style={{ background: '#0f0900', borderColor: 'rgba(249,115,22,0.2)' }}>
                <SheetHeader>
                  <SheetTitle className="text-white">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6"><FilterContent /></div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 text-white" style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }}>
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

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="rounded-2xl p-6 border sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5" style={{ color: PINK }} />
                <h3 className="font-semibold text-white">Filters</h3>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="rounded-2xl border">
                    <Skeleton className="h-40 rounded-t-2xl opacity-30" />
                    <div className="p-6 pt-12">
                      <Skeleton className="h-5 w-32 mb-2 opacity-20" />
                      <Skeleton className="h-4 w-24 mb-4 opacity-20" />
                      <Skeleton className="h-4 w-full opacity-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(249,115,22,0.1)' }}>
                  <Filter className="w-10 h-10" style={{ color: PINK }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No providers found</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-4">Try adjusting your filters or search query</p>
                <Button onClick={clearFilters} className="text-white border-0" style={{ background: PINK }}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}