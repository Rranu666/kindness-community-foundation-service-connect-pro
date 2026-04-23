import React from 'react';
import { Star, BadgeCheck, MapPin, Check, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

const PINK = '#f97316';
const CYAN = '#fbbf24';

export default function ProviderMatchList({ providers, selectedProviders, onToggle, interpretation }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">
          Matched Providers
          <span className="ml-2 text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ({providers.length} found for "{interpretation?.service_category}")
          </span>
        </h3>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {selectedProviders.length} selected
        </span>
      </div>

      <div className="grid gap-3">
        {providers.map(provider => {
          const isSelected = selectedProviders.includes(provider.id);
          return (
            <div
              key={provider.id}
              className="rounded-2xl p-4 cursor-pointer transition-all duration-200"
              style={{
                background: isSelected ? 'rgba(249,115,22,0.1)' : '#140b00',
                border: `1px solid ${isSelected ? PINK : 'rgba(255,255,255,0.08)'}`,
              }}
              onClick={() => onToggle(provider.id)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: isSelected ? PINK : 'rgba(255,255,255,0.08)' }}>
                  {provider.business_name?.charAt(0) || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-white truncate">{provider.business_name}</span>
                    {provider.is_verified && (
                      <BadgeCheck className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />
                    )}
                    {provider.is_featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>⭐ Featured</span>
                    )}
                  </div>

                  <div className="flex items-center flex-wrap gap-3 text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {provider.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <strong className="text-white">{provider.rating.toFixed(1)}</strong>
                        {provider.total_reviews > 0 && `(${provider.total_reviews})`}
                      </span>
                    )}
                    {provider.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {provider.location}
                      </span>
                    )}
                    {provider.hourly_rate && (
                      <span className="font-medium text-white">${provider.hourly_rate}/hr</span>
                    )}
                    {provider.response_time && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" style={{ color: '#10b981' }} />
                        {provider.response_time}
                      </span>
                    )}
                  </div>

                  {provider.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {provider.tech_stack.slice(0, 3).map(t => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.1)', color: CYAN }}>{t}</span>
                      ))}
                    </div>
                  )}

                  {provider.ai_specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.ai_specializations.slice(0, 2).map(s => (
                        <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.1)', color: PINK }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center transition-colors" style={{ background: isSelected ? PINK : 'rgba(255,255,255,0.08)', border: `1.5px solid ${isSelected ? PINK : 'rgba(255,255,255,0.2)'}` }}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              </div>

              {/* Match score */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ width: '80px', background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${provider.matchScore}%`, background: `linear-gradient(90deg, ${PINK}, ${CYAN})` }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{provider.matchScore}% match</span>
                </div>
                <Link to={createPageUrl(`ProviderProfile?id=${provider.id}`)}
                  onClick={e => e.stopPropagation()}
                  className="text-xs underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.4)' }}>View Profile</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}