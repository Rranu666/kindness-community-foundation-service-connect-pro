import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const G = {
  rose: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
};

// Custom icons for different provider ratings
const createMarkerIcon = (rating, isSelected) => {
  const color = rating >= 4.5 ? G.green : rating >= 4 ? G.blue : rating >= 3.5 ? G.amber : G.rose;
  const size = isSelected ? 40 : 32;
  
  return new L.DivIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.3)'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
        color: #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        transition: all 0.2s;
      ">
        ${rating.toFixed(1)}
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 10],
  });
};

export default function ProviderMap({ providers, selectedProviderId = null }) {
  // Default to Newport Beach, California center
  const center = [33.618, -117.929];
  
  // Get bounds from providers or use default
  const bounds = useMemo(() => {
    if (!providers.length) return null;
    const lats = providers.map(() => 33.618 + (Math.random() - 0.5) * 0.3);
    const lons = providers.map(() => -117.929 + (Math.random() - 0.5) * 0.3);
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons),
    };
  }, [providers]);

  return (
    <div style={{ height: '600px', borderRadius: '16px', overflow: 'hidden', border: `1px solid rgba(255,255,255,0.08)` }}>
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">Carto</a>'
          maxNativeZoom={19}
          maxZoom={21}
        />

        {providers.map((provider, idx) => {
          // Generate consistent pseudo-coordinates based on location text
          const locHash = provider.location?.charCodeAt(0) || 0;
          const lat = 33.618 + ((locHash + idx * 7) % 20) / 100 - 0.1;
          const lon = -117.929 + ((locHash + idx * 11) % 30) / 100 - 0.15;
          const isSelected = selectedProviderId === provider.id;

          return (
            <div key={provider.id}>
              {/* Provider marker */}
              <Marker
                position={[lat, lon]}
                icon={createMarkerIcon(provider.rating || 0, isSelected)}
              >
                <Popup>
                  <div style={{ fontSize: '13px', minWidth: '180px' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#000' }}>
                      {provider.business_name}
                    </h4>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px' }}>
                      {provider.location}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 6 }}>
                      <span style={{ fontWeight: 700, color: G.green }}>
                        ⭐ {(provider.rating || 0).toFixed(1)}
                      </span>
                      <span style={{ color: '#999', fontSize: '11px' }}>
                        {provider.total_reviews || 0} reviews
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0 0', color: '#666', fontSize: '11px' }}>
                      ${provider.hourly_rate || 'N/A'}/hr
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Service area circles */}
              {provider.service_areas?.slice(0, 1).map((area, i) => (
                <Circle
                  key={`${provider.id}-area-${i}`}
                  center={[lat, lon]}
                  radius={3000}
                  pathOptions={{
                    color: G.blue,
                    fillColor: G.blue,
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: '5, 5',
                  }}
                />
              ))}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}