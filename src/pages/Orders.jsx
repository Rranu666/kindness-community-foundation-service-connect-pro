import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle2, MapPin, ChevronRight, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import BookingModal from '@/components/booking/BookingModal';

export default function Orders() {
  const [user, setUser] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [rebookOrder, setRebookOrder] = useState(null);
  const [rebookService, setRebookService] = useState(null);
  const [rebookProvider, setRebookProvider] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ customer_email: user?.email }, '-scheduled_date'),
    enabled: !!user?.email
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId) => {
      await base44.entities.Order.update(orderId, { status: 'cancelled' });
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await base44.entities.Notification.create({
          recipient_email: order.customer_email,
          recipient_type: 'customer',
          type: 'cancellation',
          title: 'Booking Cancelled',
          message: `Your booking for ${order.service_name} has been cancelled.`,
          order_id: orderId,
          channels: ['email']
        });
      }
    },
    onSuccess: () => {
      toast.success('Booking cancelled');
      setCancelOrderId(null);
      queryClient.invalidateQueries({ queryKey: ['orders', user?.email] });
    },
    onError: () => toast.error('Failed to cancel booking')
  });

  const handleRebook = async (order) => {
    try {
      const services = await base44.entities.Service.filter({ id: order.service_id });
      const providers = await base44.entities.ServiceProvider.filter({ id: order.provider_id });
      if (services[0] && providers[0]) {
        setRebookService(services[0]);
        setRebookProvider(providers[0]);
        setRebookOrder(order);
      } else {
        toast.error('Service or provider no longer available');
      }
    } catch {
      toast.error('Failed to load service details');
    }
  };

  const upcomingOrders = orders.filter(o => ['pending', 'confirmed', 'in_progress'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: { bg: '#fbbf24', text: '#000' },
      confirmed: { bg: '#3b82f6', text: '#fff' },
      in_progress: { bg: '#06b6d4', text: '#fff' },
      completed: { bg: '#10b981', text: '#fff' },
      cancelled: { bg: '#ef4444', text: '#fff' }
    };
    const style = styles[status] || styles.pending;
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize" style={{ background: style.bg, color: style.text }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const OrderCard = ({ order }) => (
    <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }} className="hover:border-pink-400/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{order.service_name}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">by {order.provider_name} · #{order.order_number}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="space-y-1.5 mb-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: '#e8356d' }} />
            {order.scheduled_date} at {order.scheduled_time}
          </div>
          {order.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: '#e8356d' }} />
              {order.address}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Total</p>
            <p className="text-white font-bold">${order.total_amount?.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Rebook for completed/cancelled */}
            {['completed', 'cancelled'].includes(order.status) && (
              <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-400/10"
                onClick={() => handleRebook(order)}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Rebook
              </Button>
            )}
            {/* Cancel for upcoming */}
            {['pending', 'confirmed'].includes(order.status) && (
              <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10"
                onClick={() => setCancelOrderId(order.id)}>
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
            )}
            <Link to={createPageUrl(`OrderTracking?id=${order.id}`)}>
              <Button size="sm" variant="ghost" className="text-pink-400 hover:bg-pink-400/10">
                Track <ChevronRight className="w-4 h-4 ml-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)' }} className="grid w-full grid-cols-2 border">
              <TabsTrigger value="upcoming" className="text-white data-[state=active]:bg-pink-500/20">
                Upcoming ({upcomingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="text-white data-[state=active]:bg-pink-500/20">
                Past ({pastOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-6">
              {upcomingOrders.length > 0 ? (
                upcomingOrders.map(order => <OrderCard key={order.id} order={order} />)
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>No upcoming bookings</p>
                  <Link to={createPageUrl('Browse')}>
                    <Button size="sm" style={{ background: '#e8356d' }} className="mt-4 text-white">Browse Services</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4 mt-6">
              {pastOrders.length > 0 ? (
                pastOrders.map(order => <OrderCard key={order.id} order={order} />)
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>No past bookings</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
        <DialogContent style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.3)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">Cancel Booking?</DialogTitle>
          </DialogHeader>
          <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-sm">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1 text-white" onClick={() => setCancelOrderId(null)}>
              Keep Booking
            </Button>
            <Button className="flex-1 text-white" style={{ background: '#ef4444' }}
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(cancelOrderId)}>
              {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rebook Modal */}
      {rebookService && rebookProvider && (
        <BookingModal
          open={!!rebookOrder}
          onClose={() => { setRebookOrder(null); setRebookService(null); setRebookProvider(null); }}
          service={rebookService}
          provider={rebookProvider}
        />
      )}
    </div>
  );
}