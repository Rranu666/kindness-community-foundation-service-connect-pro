import React from 'react';
import { Filter, Star, BadgeCheck, Zap, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import LocationSelector from './LocationSelector';
import { THEME as L } from '@/lib/theme';

export function FilterPanel({
  categories, selectedCategory, setSelectedCategory,
  priceRange, setPriceRange,
  minRating, setMinRating,
  verifiedOnly, setVerifiedOnly,
  featuredOnly, setFeaturedOnly,
  instantBooking, setInstantBooking,
  onClear,
  locationFilter, setLocationFilter,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {setLocationFilter && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: L.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Service Area</p>
          <LocationSelector value={locationFilter} onChange={setLocationFilter} />
        </div>
      )}

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: L.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Category</p>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger style={{ background: '#fff', borderColor: L.border, color: L.text, borderRadius: 10 }}>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Categories</SelectItem>
            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: L.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Price Range ($/hr)</p>
        <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={500} step={10} className="mb-2" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: L.text2 }}>
          <span>${priceRange[0]}</span><span>${priceRange[1]}+</span>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: L.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Minimum Rating</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[0, 3, 4, 4.5].map(r => (
            <button key={r} onClick={() => setMinRating(r)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: `1px solid ${minRating === r ? L.text : L.border}`, background: minRating === r ? L.text : 'transparent', color: minRating === r ? '#fff' : L.text2, cursor: 'pointer', transition: 'all 0.2s' }}>
              {r === 0 ? 'Any' : <><Star size={11} style={{ fill: L.amber, color: L.amber }} /> {r}+</>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: L.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Provider Type</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'verified', label: 'Verified Only', icon: BadgeCheck, value: verifiedOnly, onChange: setVerifiedOnly },
            { id: 'featured', label: 'Featured', icon: Star, value: featuredOnly, onChange: setFeaturedOnly },
            { id: 'instant', label: 'Instant Booking', icon: Zap, value: instantBooking, onChange: setInstantBooking },
          ].map(({ id, label, icon: Icon, value, onChange }) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox id={id} checked={value} onCheckedChange={onChange} />
              <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: L.text2, cursor: 'pointer' }}>
                <Icon size={13} style={{ color: L.accent }} /> {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onClear}
        style={{ width: '100%', padding: '10px', borderRadius: 100, background: 'transparent', border: `1px solid ${L.border2}`, color: L.text2, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = L.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = L.text2; e.currentTarget.style.borderColor = L.border2; }}>
        <X size={14} /> Clear Filters
      </button>
    </div>
  );
}

export function FilterSidebar(props) {
  return (
    <aside className="hidden lg:block" style={{ width: 240, flexShrink: 0 }}>
      <div style={{ background: '#f7f7f5', border: '1px solid #e2e0dc', borderRadius: 20, padding: 24, position: 'sticky', top: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Filter size={15} style={{ color: '#111111' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#111111' }}>Filters</span>
        </div>
        <FilterPanel {...props} />
      </div>
    </aside>
  );
}