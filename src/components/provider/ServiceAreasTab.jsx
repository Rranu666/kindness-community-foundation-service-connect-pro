import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { MapPin, Plus, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const G = {
  card: '#140b00', border: 'rgba(203,60,122,0.2)', rose: '#cb3c7a',
  muted: 'rgba(255,255,255,0.55)', faint: 'rgba(255,255,255,0.25)',
  green: '#10b981', blue: '#4361EE', surface: 'rgba(255,255,255,0.04)',
};

const CA_CITIES = [
  'Los Angeles', 'San Diego', 'San Francisco', 'San Jose', 'Fresno',
  'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim',
  'Santa Ana', 'Corpus Christi', 'Riverside', 'Stockton', 'Irvine',
  'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto', 'Fontana',
  'Moreno Valley', 'Glendale', 'Huntington Beach', 'Santa Clarita', 'Garden Grove',
  'Oceanside', 'Rancho Cucamonga', 'Santa Rosa', 'Ontario', 'Newport Beach',
  'Elk Grove', 'Hayward', 'Pomona', 'Escondido', 'Sunnyvale',
  'Pasadena', 'Torrance', 'Fullerton', 'Orange', 'Thousand Oaks',
  'Simi Valley', 'Visalia', 'Concord', 'Roseville', 'El Monte',
  'Vallejo', 'Berkeley', 'Palmdale', 'Downey', 'Costa Mesa',
  'Inglewood', 'West Covina', 'Norwalk', 'Burbank', 'El Cajon',
  'Santa Clara', 'San Mateo', 'Daly City', 'Richmond', 'Murrieta',
  'Temecula', 'Compton', 'Victorville', 'Corona', 'Clovis',
];

const REGIONS = [
  { name: 'Los Angeles Metro', cities: ['Los Angeles', 'Long Beach', 'Glendale', 'Pasadena', 'Burbank', 'El Monte', 'West Covina', 'Downey', 'Compton', 'Inglewood'] },
  { name: 'Orange County', cities: ['Anaheim', 'Santa Ana', 'Irvine', 'Huntington Beach', 'Garden Grove', 'Fullerton', 'Orange', 'Newport Beach', 'Costa Mesa'] },
  { name: 'San Diego County', cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido', 'El Cajon', 'Murrieta', 'Temecula'] },
  { name: 'Bay Area', cities: ['San Francisco', 'San Jose', 'Oakland', 'Fremont', 'Hayward', 'Berkeley', 'Richmond', 'Daly City', 'Santa Clara', 'San Mateo', 'Sunnyvale', 'Vallejo', 'Concord'] },
  { name: 'Inland Empire', cities: ['Riverside', 'San Bernardino', 'Fontana', 'Moreno Valley', 'Ontario', 'Rancho Cucamonga', 'Corona', 'Victorville'] },
  { name: 'Central Valley', cities: ['Fresno', 'Bakersfield', 'Stockton', 'Modesto', 'Visalia', 'Clovis'] },
  { name: 'Sacramento Region', cities: ['Sacramento', 'Elk Grove', 'Roseville', 'Palmdale'] },
  { name: 'Ventura / SCV', cities: ['Thousand Oaks', 'Simi Valley', 'Santa Clarita'] },
];

export default function ServiceAreasTab({ provider, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const areas = provider.service_areas || [];

  const toggle = async (city) => {
    const updated = areas.includes(city) ? areas.filter(c => c !== city) : [...areas, city];
    setSaving(true);
    try {
      await db.ServiceProvider.update(provider.id, { service_areas: updated });
      onUpdate({ service_areas: updated });
    } catch {
      toast.error('Failed to update service areas');
    } finally {
      setSaving(false);
    }
  };

  const toggleRegion = async (regionCities) => {
    const allSelected = regionCities.every(c => areas.includes(c));
    const updated = allSelected
      ? areas.filter(c => !regionCities.includes(c))
      : [...new Set([...areas, ...regionCities])];
    setSaving(true);
    try {
      await db.ServiceProvider.update(provider.id, { service_areas: updated });
      onUpdate({ service_areas: updated });
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const clearAll = async () => {
    setSaving(true);
    try {
      await db.ServiceProvider.update(provider.id, { service_areas: [] });
      onUpdate({ service_areas: [] });
    } finally {
      setSaving(false);
    }
  };

  const filtered = search
    ? CA_CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${G.rose}18` }}>
            <MapPin size={18} style={{ color: G.rose }} />
          </div>
          <div>
            <p className="text-white font-bold">{areas.length} Service Area{areas.length !== 1 ? 's' : ''} Active</p>
            <p className="text-xs" style={{ color: G.muted }}>California only</p>
          </div>
        </div>
        {areas.length > 0 && (
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs" onClick={clearAll} disabled={saving}>
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search California cities..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ background: G.card, borderColor: G.border, color: '#fff' }}
      />

      {/* Search results */}
      {search && filtered && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.map(city => {
            const active = areas.includes(city);
            return (
              <button key={city} onClick={() => toggle(city)} disabled={saving}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
                style={{ background: active ? `${G.rose}18` : G.surface, borderColor: active ? G.rose : 'rgba(255,255,255,0.1)', color: active ? G.rose : G.muted }}>
                <span>{city}</span>
                {active && <CheckCircle2 size={13} />}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="col-span-3 text-center py-4 text-sm" style={{ color: G.faint }}>No cities found</p>}
        </div>
      )}

      {/* Region groups */}
      {!search && (
        <div className="space-y-4">
          {REGIONS.map(region => {
            const allSelected = region.cities.every(c => areas.includes(c));
            const someSelected = region.cities.some(c => areas.includes(c));
            return (
              <div key={region.name} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${G.border}` }}>
                {/* Region header */}
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{region.name}</span>
                    {someSelected && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${G.rose}18`, color: G.rose }}>
                        {region.cities.filter(c => areas.includes(c)).length}/{region.cities.length}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs h-7"
                    style={{ color: allSelected ? '#ef4444' : G.rose }}
                    onClick={() => toggleRegion(region.cities)} disabled={saving}>
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </Button>
                </div>

                {/* City chips */}
                <div className="p-3 flex flex-wrap gap-2">
                  {region.cities.map(city => {
                    const active = areas.includes(city);
                    return (
                      <button key={city} onClick={() => toggle(city)} disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                        style={{ background: active ? `${G.rose}18` : G.surface, borderColor: active ? G.rose : 'rgba(255,255,255,0.1)', color: active ? G.rose : G.muted }}>
                        {active && <CheckCircle2 size={10} />}
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}