import React, { useState } from 'react';
import { X, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PINK = '#cb3c7a';

const PROMOS = [
  {
    id: 1,
    title: 'First Booking? Get 20% Off!',
    description: 'Use code WELCOME20 on your first service booking.',
    code: 'WELCOME20',
    color: 'linear-gradient(135deg, rgba(203,60,122,0.2) 0%, rgba(139,92,246,0.2) 100%)',
    border: 'rgba(203,60,122,0.4)',
  },
  {
    id: 2,
    title: 'Refer & Earn $10 Credit',
    description: 'Invite friends and earn wallet credits for each referral.',
    code: null,
    link: 'ReferralProgram',
    color: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.15) 100%)',
    border: 'rgba(16,185,129,0.4)',
  },
  {
    id: 3,
    title: 'Weekend Special — Top Providers',
    description: 'Book this weekend and enjoy priority scheduling from featured providers.',
    code: null,
    color: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,179,8,0.15) 100%)',
    border: 'rgba(245,158,11,0.4)',
  },
];

export default function PromoBanner() {
  const [dismissed, setDismissed] = useState([]);
  const visible = PROMOS.filter(p => !dismissed.includes(p.id));

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {visible.map(promo => (
        <div
          key={promo.id}
          className="relative rounded-2xl p-4 flex items-center gap-4"
          style={{ background: promo.color, border: `1px solid ${promo.border}` }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm mb-0.5">{promo.title}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{promo.description}</div>
            {promo.code && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', letterSpacing: 1 }}>
                <Tag className="w-3 h-3" />
                {promo.code}
              </div>
            )}
          </div>
          {promo.link && (
            <Link to={createPageUrl(promo.link)} className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-white hover:opacity-80">
              Learn More <ArrowRight className="w-3 h-3" />
            </Link>
          )}
          <button
            onClick={() => setDismissed(d => [...d, promo.id])}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3 text-white/60" />
          </button>
        </div>
      ))}
    </div>
  );
}