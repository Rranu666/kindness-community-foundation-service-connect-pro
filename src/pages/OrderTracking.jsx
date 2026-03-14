import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Clock, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_TIMELINE = {
  pending: { label: 'Booking Confirmed', step: 0, color: '#e8356d' },
  confirmed: { label: 'Provider Assigned', step: 1, color: '#e8356d' },
  in_progress: { label: 'On the Way', step: 2, color: '#3b82f6' },
  completed: { label: 'Service Completed', step: 3, color: '#10b981' },
  cancelled: { label: 'Cancelled', step: -1, color: '#ef4444' }
};

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const results = await base44.entities.Order.filter({ id: orderId });
      return results[0];
    },
    enabled: !!orderId
  });

  const { data: provider } = useQuery({
    queryKey: ['provider', order?.provider_id],
    queryFn: async () => {
      const results = await base44.entities.ServiceProvider.filter({ id: order.provider_id });
      return results[0];
    },
    enabled: !!order?.provider_id
  });

  if (isLoading) {
    return (
      <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-40 mb-8" />
          <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
            <CardContent className="pt-6">
              <Skeleton className="h-96" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ background: '#0d0d1f' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Order not found</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_TIMELINE[order.status];

  return (
    <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Order #{order.order_number}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>{order.service_name}</p>
        </div>

        {/* Status Timeline */}
        <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
          <CardHeader>
            <CardTitle className="text-white">Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                {[0, 1, 2, 3].map((step) => {
                  const isActive = statusInfo.step >= step;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all"
                        style={{
                          background: isActive ? statusInfo.color : 'rgba(255,255,255,0.1)',
                          color: isActive ? 'white' : 'rgba(255,255,255,0.4)'
                        }}
                      >
                        {isActive ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div className="text-xs text-center" style={{ color: isActive ? statusInfo.color : 'rgba(255,255,255,0.4)' }}>
                        {['Confirmed', 'Assigned', 'On Way', 'Completed'][step]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-white font-semibold">{statusInfo.label}</p>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
          <CardHeader>
            <CardTitle className="text-white">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Scheduled Date & Time</p>
                <p className="text-white font-semibold">{order.scheduled_date} at {order.scheduled_time}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Service Address</p>
                <p className="text-white font-semibold flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#e8356d' }} />
                  {order.address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Info */}
        {provider && (
          <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
            <CardHeader>
              <CardTitle className="text-white">Service Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold text-lg">{provider.business_name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }} className="flex items-center gap-2 mt-2">
                    <Phone className="w-4 h-4" />
                    {provider.phone}
                  </p>
                </div>
                <Button
                  size="sm"
                  style={{ background: '#e8356d' }}
                  className="text-white hover:opacity-90"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
          <CardHeader>
            <CardTitle className="text-white">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Service Amount</span>
              <span>${order.subtotal}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>Commission ({order.commission_rate}%)</span>
              <span>${order.commission_amount}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold">
              <span>Total Amount</span>
              <span>${order.total_amount}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>Payment Status</span>
              <span className="capitalize">{order.payment_status}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}