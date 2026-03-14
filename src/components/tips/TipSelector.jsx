import React from 'react';
import { Card } from '@/components/ui/card';

export default function TipSelector({ amount, onTipChange, serviceTotal }) {
  const tipPercentages = [10, 15, 20, 25];
  const presetTips = tipPercentages.map(pct => (serviceTotal * pct) / 100);

  return (
    <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }} className="p-4">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">Add a Tip for Service Provider</p>
        
        <div className="grid grid-cols-4 gap-2">
          {presetTips.map((tip, idx) => (
            <button
              key={idx}
              onClick={() => onTipChange(tip)}
              className="p-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: Math.abs(amount - tip) < 0.01 ? '#e8356d' : 'rgba(232,53,109,0.1)',
                color: Math.abs(amount - tip) < 0.01 ? '#fff' : '#e8356d',
                border: '1px solid rgba(232,53,109,0.3)'
              }}
            >
              {tipPercentages[idx]}%
              <div className="text-xs" style={{ color: Math.abs(amount - tip) < 0.01 ? 'rgba(255,255,255,0.8)' : 'rgba(232,53,109,0.8)' }}>
                ${tip.toFixed(2)}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Custom amount"
            value={amount || ''}
            onChange={(e) => onTipChange(parseFloat(e.target.value) || 0)}
            style={{
              background: '#0d0d1f',
              borderColor: 'rgba(232,53,109,0.2)',
              color: '#fff'
            }}
            className="flex-1 px-3 py-2 rounded-lg border text-sm"
          />
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>$</span>
        </div>
      </div>
    </Card>
  );
}