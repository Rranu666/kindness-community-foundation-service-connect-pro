import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ServiceMap({ providers, height = '400px' }) {
  if (!providers?.length) {
    return (
      <div style={{ height, background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }} className="rounded-lg flex items-center justify-center">
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>No location data available</p>
      </div>
    );
  }

  // Default center (first provider or world)
  const defaultLat = providers[0]?.latitude || 40;
  const defaultLng = providers[0]?.longitude || -95;

  return (
    <MapContainer
      center={[defaultLat, defaultLng]}
      zoom={12}
      style={{ height, borderRadius: '8px', border: '1px solid rgba(232,53,109,0.2)' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {providers.map((provider) => {
        if (!provider.latitude || !provider.longitude) return null;
        return (
          <Marker
            key={provider.id}
            position={[provider.latitude, provider.longitude]}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{provider.business_name}</p>
                <p className="text-xs" style={{ color: '#666' }}>{provider.location}</p>
                <p className="text-xs font-semibold" style={{ color: '#e8356d' }}>⭐ {provider.rating}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}