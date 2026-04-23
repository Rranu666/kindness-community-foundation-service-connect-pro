import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, MapPin, Clock, BadgeCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const slugify = (name) =>
  name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';

export default function ProviderCard({ provider }) {
  const slug = slugify(provider.business_name);
  return (
    <Link
      to={createPageUrl(`ProviderProfile?p=${slug}&id=${provider.id}`)}
      className="group rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: '#140b00', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(203,60,122,0.4)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(203,60,122,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="relative h-40">
        {provider.cover_image ? (
          <img src={provider.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a0c00 0%, #140b00 100%)' }} />
        )}
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden" style={{ border: '3px solid #140b00' }}>
            {(provider.avatar_url || provider.profile_image) ? (
              <img src={provider.avatar_url || provider.profile_image} alt={provider.business_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #cb3c7a)' }}>
                <span className="text-2xl font-bold text-white">{provider.business_name?.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
        {provider.is_verified && (
          <Badge className="absolute top-3 right-3 border-0" style={{ background: '#10b981', color: '#fff' }}>
            <BadgeCheck className="w-3 h-3 mr-1" /> Verified
          </Badge>
        )}
      </div>

      <div className="pt-12 pb-5 px-6">
        <h3 className="text-lg font-semibold text-white mb-1 transition-colors" style={{}}>
          {provider.business_name}
        </h3>
        <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>{provider.owner_name}</p>

        <div className="flex items-center gap-4 mb-3 text-sm">
          {provider.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" style={{ color: '#f59e0b' }} />
              <span className="font-medium text-white">{provider.rating?.toFixed(1)}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>({provider.total_reviews || 0})</span>
            </div>
          )}
          {provider.location && (
            <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[100px]">{provider.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {provider.hourly_rate ? (
            <div>
              <span className="text-lg font-bold text-white">${provider.hourly_rate}</span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>/hr</span>
            </div>
          ) : (
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Contact for pricing</span>
          )}
          {provider.experience_years > 0 && (
            <div className="flex items-center gap-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <Clock className="w-4 h-4" />
              {provider.experience_years}+ yrs
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}