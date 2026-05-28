import React, { useState, useEffect } from 'react';
import { MapPin, Locate } from 'lucide-react';

const CALIFORNIA_CITIES = [
  'Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose',
  'Oakland', 'Fresno', 'Long Beach', 'Bakersfield', 'Anaheim',
  'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Corpus Christi',
  'Chula Vista', 'Plano', 'Garland', 'Glendale', 'Huntington Beach',
  'Pasadena', 'Torrance', 'Santa Clarita', 'Thousand Oaks', 'Costa Mesa',
  'Berkeley', 'Vallejo', 'San Leandro', 'Daly City', 'Sunnyvale'
];

export default function LocationSelector({ value, onChange, isDark = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const filteredCities = CALIFORNIA_CITIES.filter(city =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  const handleGeolocate = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Simple approximation: nearest major city
          const { latitude, longitude } = position.coords;
          // For demo, map to nearest city (LA area as default)
          const nearestCity = findNearestCity(latitude, longitude);
          onChange(nearestCity);
          setOpen(false);
          setGeoLoading(false);
        },
        () => {
          setGeoLoading(false);
          alert('Unable to get your location');
        }
      );
    }
  };

  const findNearestCity = (lat, lng) => {
    // Simplified: just return LA for most CA coordinates
    // In production, use proper geo-reverse lookup
    if (lat < 34.5) return 'San Diego';
    if (lat < 35.5) return 'Los Angeles';
    if (lat < 37) return 'Bakersfield';
    if (lat < 37.5) return 'Fresno';
    if (lat < 38.5) return 'Sacramento';
    return 'San Francisco';
  };

  const colors = isDark ? {
    bg: '#080A12', bg2: '#0D1020', border: 'rgba(255,255,255,0.08)',
    text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', surface: 'rgba(255,255,255,0.04)',
    rose: '#FF4D6D'
  } : {
    bg: '#fff', bg2: '#f5f5f5', border: '#e5e5e5',
    text: '#000', muted: '#666', surface: '#f0f0f0',
    rose: '#FF4D6D'
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 12,
          background: colors.surface,
          border: `1px solid ${open ? colors.rose + '50' : colors.border}`,
          color: value ? colors.text : colors.muted,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
        <MapPin size={16} style={{ color: colors.rose, flexShrink: 0 }} />
        {value || 'Select location'}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          background: colors.bg2,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          zIndex: 50,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
        }}>
          <div style={{ padding: '10px' }}>
            <input
              type="text"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.bg,
                color: colors.text,
                fontSize: 13,
                marginBottom: 8
              }}
            />

            <button
              onClick={handleGeolocate}
              disabled={geoLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 8,
                background: `${colors.rose}15`,
                border: `1px solid ${colors.rose}35`,
                color: colors.rose,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 8,
                transition: 'all 0.2s',
                opacity: geoLoading ? 0.6 : 1
              }}>
              <Locate size={12} />
              {geoLoading ? 'Finding...' : 'Use My Location'}
            </button>
          </div>

          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filteredCities.map(city => (
              <button
                key={city}
                onClick={() => {
                  onChange(city);
                  setOpen(false);
                  setSearch('');
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  background: value === city ? `${colors.rose}20` : 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${colors.border}`,
                  color: value === city ? colors.rose : colors.text,
                  fontSize: 13,
                  fontWeight: value === city ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => !value === city && (e.currentTarget.style.background = colors.surface)}
                onMouseLeave={(e) => !value === city && (e.currentTarget.style.background = 'transparent')}>
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}