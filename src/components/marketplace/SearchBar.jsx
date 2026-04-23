import React, { useState } from 'react';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const PINK = '#f97316';

export default function SearchBar({ onSearch, initialQuery = '', initialLocation = '', dark = false }) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, location });
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocation(city);
          toast.success(`Location set to ${city}`);
        } catch {
          toast.error('Could not fetch location name');
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        toast.error('Could not access your location');
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  if (dark) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl" style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.3)' }}>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text"
              placeholder="Search services, providers, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 h-12 rounded-xl text-white placeholder-white/40 outline-none text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div className="flex gap-2 sm:w-56">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="City / Locality"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 h-12 rounded-xl text-white placeholder-white/40 outline-none text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <button
              type="button"
              onClick={handleGPS}
              disabled={gpsLoading}
              title="Detect my location"
              className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl transition-colors"
              style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: PINK }}
            >
              {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            </button>
          </div>
          <Button
            type="submit"
            className="h-12 px-6 text-white rounded-xl border-0 w-full sm:w-auto"
            style={{ background: PINK }}
          >
            Search
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-lg border border-slate-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search services, providers, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 border-0 bg-slate-50 rounded-xl"
          />
        </div>
        <div className="flex gap-2 sm:w-64">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="City / Locality"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 h-12 border-0 bg-slate-50 rounded-xl"
            />
          </div>
          <button
            type="button"
            onClick={handleGPS}
            disabled={gpsLoading}
            title="Detect my location"
            className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
          >
            {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          </button>
        </div>
        <Button
          type="submit"
          className="h-12 px-8 rounded-xl text-white border-0 w-full sm:w-auto"
          style={{ background: PINK }}
        >
          Search
        </Button>
      </div>
    </form>
  );
}