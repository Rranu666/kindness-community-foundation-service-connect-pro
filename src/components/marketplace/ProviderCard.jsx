import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Clock, BadgeCheck } from 'lucide-react';
import ProviderRatingBadge from './ProviderRatingBadge';
import FavoriteButton from './FavoriteButton';
import { THEME as L } from '@/lib/theme';

export default function ProviderCard({ provider, onFavoriteChange = null }) {
  return (
    <Link
      to={createPageUrl(`ProviderProfile?id=${provider.id}`)}
      style={{ display: 'block', textDecoration: 'none', background: L.bg, border: `1px solid ${L.border}`, borderRadius: 20, overflow: 'hidden', transition: 'all 0.25s ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = L.border2; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>

      {/* Cover image */}
      <div style={{ position: 'relative', height: 140, background: L.bg3 }}>
        {provider.cover_image && (
          <img src={provider.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />

        {/* Avatar */}
        <div style={{ position: 'absolute', bottom: -36, left: 20, width: 72, height: 72, borderRadius: 16, overflow: 'hidden', border: '3px solid #ffffff', flexShrink: 0, background: L.bg3 }}>
          {provider.profile_image ? (
            <img src={provider.profile_image} alt={provider.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: L.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff' }}>
              {provider.business_name?.charAt(0)}
            </div>
          )}
        </div>

        {/* Favorite */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
          <FavoriteButton providerId={provider.id} size="md" onToggle={onFavoriteChange} />
        </div>

        {/* Verified badge */}
        {provider.is_verified && (
          <span style={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.9)', border: `1px solid ${L.green}40`, color: L.green, fontSize: 11, fontWeight: 700 }}>
            <BadgeCheck size={11} /> Verified
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '44px 20px 20px' }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, color: L.text, marginBottom: 2, letterSpacing: '-0.02em' }}>
          {provider.business_name}
        </h3>
        <p style={{ fontSize: 12, color: L.text3, marginBottom: 12 }}>{provider.owner_name}</p>

        <div style={{ marginBottom: 12 }}>
          <ProviderRatingBadge rating={provider.rating || 0} reviews={provider.total_reviews || 0} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: L.text3, marginBottom: 14 }}>
          {provider.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} style={{ color: L.accent }} />
              <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.location}</span>
            </span>
          )}
          {provider.experience_years && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} style={{ color: L.accent }} />
              {provider.experience_years}+ yrs
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${L.border}` }}>
          {provider.hourly_rate ? (
            <div>
              <span style={{ fontWeight: 800, fontSize: 18, color: L.text }}>${provider.hourly_rate}</span>
              <span style={{ fontSize: 12, color: L.text3 }}>/hr</span>
            </div>
          ) : (
            <span style={{ fontSize: 13, color: L.text3 }}>Contact for pricing</span>
          )}
          <span style={{ fontSize: 12, fontWeight: 600, color: L.text2, padding: '5px 12px', borderRadius: 100, border: `1px solid ${L.border2}`, transition: 'all 0.2s' }}>
            View Profile →
          </span>
        </div>
      </div>
    </Link>
  );
}