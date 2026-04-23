import React from 'react';
import { Brain, Tag, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CYAN = '#fbbf24';

const URGENCY_CONFIG = {
  immediate: { label: 'Immediate', color: '#ef4444' },
  today: { label: 'Today', color: '#cb3c7a' },
  this_week: { label: 'This Week', color: '#f59e0b' },
  flexible: { label: 'Flexible', color: '#10b981' },
};

export default function AIInterpretationCard({ interpretation }) {
  if (!interpretation) return null;
  const urgency = URGENCY_CONFIG[interpretation.urgency] || URGENCY_CONFIG.flexible;

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-4 h-4" style={{ color: CYAN }} />
        <span className="text-sm font-semibold" style={{ color: CYAN }}>AI Interpretation</span>
      </div>

      <p className="text-white font-medium">{interpretation.summary}</p>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Category:</span>
          <span className="text-xs font-semibold text-white">{interpretation.service_category}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Urgency:</span>
          <span className="text-xs font-semibold" style={{ color: urgency.color }}>{urgency.label}</span>
        </div>
      </div>

      {interpretation.key_requirements?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {interpretation.key_requirements.map((req, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: CYAN }} />
              {req}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}