import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlanCard({ plan, isCurrentPlan, onSelect }) {
  return (
    <Card
      style={{
        background: isCurrentPlan ? 'rgba(249,115,22,0.15)' : '#140b00',
        border: isCurrentPlan ? '2px solid #f97316' : '1px solid rgba(249,115,22,0.2)'
      }}
      className="relative"
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#f97316', color: '#fff' }}>
          Current
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-white">{plan.name}</CardTitle>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {plan.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-white">
            ${plan.price}
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>/month</span>
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-white uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Features
          </p>
          {plan.features?.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5" style={{ color: '#f97316', flexShrink: 0 }} />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <p>Commission: {plan.commission_rate}%</p>
          <p>Max Services: {plan.max_services}</p>
        </div>

        <Button
          className="w-full text-white"
          style={{ background: isCurrentPlan ? '#666' : '#f97316' }}
          disabled={isCurrentPlan}
          onClick={() => !isCurrentPlan && onSelect(plan.id)}
        >
          {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}