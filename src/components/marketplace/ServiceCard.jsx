import React from 'react';
import { Clock, Zap, Star, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PINK = '#cb3c7a';

const priceTypeLabels = {
  fixed: 'Fixed',
  hourly: '/hr',
  per_visit: '/visit',
  negotiable: 'Negotiable',
};

export default function ServiceCard({ service, onBook }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
      style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.15)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(203,60,122,0.35)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(203,60,122,0.15)'}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h4 className="font-semibold text-white">{service.name}</h4>
          {service.is_instant_booking && (
            <Badge className="text-white border-0 text-xs" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
              <Zap className="w-3 h-3 mr-1" /> Instant
            </Badge>
          )}
          {service.is_featured && (
            <Badge className="text-white border-0 text-xs" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
              <Star className="w-3 h-3 mr-1 fill-current" /> Featured
            </Badge>
          )}
        </div>
        <p className="text-sm line-clamp-2 mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{service.description}</p>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {service.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{service.duration_minutes} min
            </span>
          )}
          <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(203,60,122,0.25)', color: 'rgba(255,255,255,0.5)' }}>
            {priceTypeLabels[service.price_type] || 'Fixed'}
          </Badge>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
        <div className="text-right">
          <span className="text-xl font-bold text-white">${service.price?.toLocaleString()}</span>
          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {priceTypeLabels[service.price_type] !== 'Fixed' ? priceTypeLabels[service.price_type] : ''}
          </span>
        </div>
        <div className="flex gap-2">
          {service.id && (
            <Link to={createPageUrl(`ServiceDetails?id=${service.id}`)}>
              <Button size="sm" variant="outline" className="text-white" style={{ borderColor: 'rgba(203,60,122,0.3)', background: 'transparent', height: 32 }}>
                Details
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            onClick={() => onBook(service)}
            className="text-white border-0"
            style={{ background: PINK, height: 32 }}
          >
            Book
          </Button>
        </div>
      </div>
    </div>
  );
}