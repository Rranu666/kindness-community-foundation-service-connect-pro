import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import {
  LayoutDashboard, Package, ShoppingCart, Star, DollarSign, Plus,
  MoreVertical, Edit, Trash2, Eye, Clock, CheckCircle, XCircle,
  ArrowUpRight, Calendar, Wallet, CheckCircle2, Play, Square,
  Camera, MapPin, User, Phone, MessageCircle, AlertCircle, Image
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import ServiceFormDialog from '@/components/provider/ServiceFormDialog';
import ChatWithCustomer from '@/components/provider/ChatWithCustomer';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const statusColors = {
  pending: { bg: '#fbbf24', text: '#000' },
  confirmed: { bg: '#3b82f6', text: '#fff' },
  in_progress: { bg: '#8b5cf6', text: '#fff' },
  completed: { bg: '#10b981', text: '#fff' },
  cancelled: { bg: '#ef4444', text: '#fff' }
};

function StatusBadge({ status }) {
  const s = statusColors[status] || statusColors.pending;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: s.bg, color: s.text }}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export default function ProviderDashboard() {
  const [user, setUser] = useState(null);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [servicePriceType, setServicePriceType] = useState('fixed');
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', duration_minutes: '' });
  const [workflowOrder, setWorkflowOrder] = useState(null);
  const [proofImages, setProofImages] = useState([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: provider, isLoading: loadingProvider } = useQuery({
    queryKey: ['myProvider', user?.email],
    queryFn: async () => {
      const providers = await base44.entities.ServiceProvider.filter({ email: user.email });
      return providers[0];
    },
    enabled: !!user?.email
  });

  const { data: services = [] } = useQuery({
    queryKey: ['myServices', provider?.id],
    queryFn: () => base44.entities.Service.filter({ provider_id: provider.id }),
    enabled: !!provider?.id
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['myOrders', provider?.id],
    queryFn: () => base44.entities.Order.filter({ provider_id: provider.id }, '-created_date'),
    enabled: !!provider?.id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['myReviews', provider?.id],
    queryFn: () => base44.entities.Review.filter({ provider_id: provider.id }, '-created_date'),
    enabled: !!provider?.id
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['myPayouts', provider?.email],
    queryFn: () => base44.entities.Payout.filter({ provider_email: provider.email }),
    enabled: !!provider?.email
  });

  // Stats
  const totalEarnings = orders.filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + ((o.subtotal || 0) - (o.commission_amount || 0)), 0);
  const totalWithdrawn = payouts.filter(p => ['completed', 'approved', 'processing'].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = totalEarnings - totalWithdrawn;

  // Filtered orders by status
  const newOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['confirmed', 'in_progress'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  // Service mutations
  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
      setServiceDialogOpen(false);
      setEditingService(null);
      toast.success('Service created!');
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
      setServiceDialogOpen(false);
      setEditingService(null);
      toast.success('Service updated!');
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['myServices'] }); toast.success('Service deleted'); }
  });

  // Order mutations
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      toast.success('Order updated');
    }
  });

  const updateProviderMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceProvider.update(provider.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProvider'] });
      setEditProfileOpen(false);
      toast.success('Profile updated');
    }
  });

  const handleOrderAction = (order, status) => {
    updateOrderMutation.mutate({ id: order.id, data: { status } });
    // Send notification to customer
    base44.entities.Notification.create({
      recipient_email: order.customer_email,
      recipient_type: 'customer',
      type: status === 'confirmed' ? 'provider_assigned' : status === 'in_progress' ? 'service_started' : status === 'completed' ? 'service_completed' : 'cancellation',
      title: status === 'confirmed' ? 'Booking Confirmed' : status === 'in_progress' ? 'Service Started' : status === 'completed' ? 'Service Completed' : 'Booking Cancelled',
      message: `Your order #${order.order_number} status: ${status.replace('_', ' ')}`,
      order_id: order.id,
      channels: ['email']
    }).catch(() => {});
  };

  const handleServiceSubmit = (e) => {
    e.preventDefault();
    const data = {
      provider_id: provider.id,
      name: serviceForm.name,
      description: serviceForm.description,
      price: parseFloat(serviceForm.price),
      price_type: servicePriceType,
      duration_minutes: parseInt(serviceForm.duration_minutes) || null,
      is_active: true
    };
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const openEditService = (service) => {
    setEditingService(service);
    setServiceForm({ name: service.name, description: service.description || '', price: service.price, duration_minutes: service.duration_minutes || '' });
    setServicePriceType(service.price_type || 'fixed');
    setServiceDialogOpen(true);
  };

  const openNewService = () => {
    setEditingService(null);
    setServiceForm({ name: '', description: '', price: '', duration_minutes: '' });
    setServicePriceType('fixed');
    setServiceDialogOpen(true);
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingProof(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProofImages(prev => [...prev, file_url]);
      toast.success('Proof image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingProof(false);
    }
  };

  const completeWithProof = async () => {
    if (!workflowOrder) return;
    await base44.entities.Order.update(workflowOrder.id, {
      status: 'completed',
      payment_status: 'paid'
    });
    queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    // Notify customer
    await base44.entities.Notification.create({
      recipient_email: workflowOrder.customer_email,
      recipient_type: 'customer',
      type: 'service_completed',
      title: 'Service Completed',
      message: `Your service for order #${workflowOrder.order_number} has been completed. Please leave a review!`,
      order_id: workflowOrder.id,
      channels: ['email']
    });
    toast.success('Service marked as complete!');
    setWorkflowOrder(null);
    setProofImages([]);
  };

  const openProfile = () => {
    setProfileForm({
      business_name: provider.business_name,
      owner_name: provider.owner_name,
      phone: provider.phone || '',
      location: provider.location || '',
      description: provider.description || '',
      hourly_rate: provider.hourly_rate || '',
    });
    setAvailabilityDays(provider.availability || []);
    setEditProfileOpen(true);
  };

  const handleProfileSave = () => {
    updateProviderMutation.mutate({ ...profileForm, availability: availabilityDays });
  };

  const toggleDay = (day) => {
    setAvailabilityDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  if (loadingProvider) {
    return (
      <div className="min-h-screen p-4 sm:p-6" style={{ background: '#0f0900' }}>
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-48 sm:w-64 mb-6 sm:mb-8 opacity-30" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 sm:h-32 rounded-xl opacity-30" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0900' }}>
        <Card style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="max-w-md w-full mx-6 border">
          <CardContent className="pt-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">No Business Profile</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-6">Register your business to start receiving orders</p>
            <Link to={createPageUrl('ProviderSignup')}>
              <Button className="text-white" style={{ background: '#f97316' }}>Register Business</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0900' }}>
      {/* Header */}
      <header style={{ background: '#140b00', borderBottom: '1px solid rgba(249,115,22,0.2)' }} className="py-3 sm:py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
              {provider.profile_image ? (
                <img src={provider.profile_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {provider.business_name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white truncate">{provider.business_name}</h1>
              {!provider.is_verified && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                  Pending Verification
                </span>
              )}
              {provider.is_verified && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                  Verified
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="text-white border-white/20 px-2 sm:px-3"
              onClick={openProfile}>
              <Edit className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Edit Profile</span>
            </Button>
            <Link to={createPageUrl(`ProviderProfile?id=${provider.id}`)}>
              <Button variant="outline" size="sm" className="text-white border-white/20 px-2 sm:px-3">
                <Eye className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Public View</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Earnings', value: `$${totalEarnings.toFixed(0)}`, icon: DollarSign, color: '#10b981' },
            { label: 'Available', value: `$${availableBalance.toFixed(0)}`, icon: Wallet, color: '#f97316' },
            { label: 'New Orders', value: newOrders.length, icon: AlertCircle, color: '#fbbf24' },
            { label: 'Active Jobs', value: activeOrders.length, icon: Play, color: '#8b5cf6' },
            { label: 'Rating', value: provider.rating?.toFixed(1) || 'N/A', icon: Star, color: '#f59e0b' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color }} />
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
                    <p className="text-xl font-bold text-white">{value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="new">
          <TabsList style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(249,115,22,0.2)' }} className="border flex-wrap h-auto gap-1 p-1">
            {[
              { value: 'new', label: `New (${newOrders.length})`, icon: AlertCircle },
              { value: 'active', label: `Active (${activeOrders.length})`, icon: Play },
              { value: 'completed', label: `Done (${completedOrders.length})`, icon: CheckCircle },
              { value: 'cancelled', label: `Cancelled (${cancelledOrders.length})`, icon: XCircle },
              { value: 'services', label: `Services (${services.length})`, icon: Package },
              { value: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
              { value: 'availability', label: 'Calendar', icon: Calendar },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="text-white data-[state=active]:bg-pink-500/20 data-[state=active]:text-white hover:bg-white/10 hover:text-white text-xs">
                <Icon className="w-3.5 h-3.5 mr-1" />{label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* NEW ORDERS Tab */}
          <TabsContent value="new" className="mt-4">
            {newOrders.length > 0 ? (
              <div className="space-y-3">
                {newOrders.map((order) => (
                  <OrderCard key={order.id} order={order}
                    onChat={setChatOrder}
                    actions={
                      <div className="flex gap-2">
                        <Button size="sm" style={{ background: '#10b981' }} className="text-white"
                          onClick={() => handleOrderAction(order, 'confirmed')}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button size="sm" style={{ background: '#ef4444' }} className="text-white"
                          onClick={() => handleOrderAction(order, 'cancelled')}>
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : <EmptyState icon={AlertCircle} message="No new bookings" />}
          </TabsContent>

          {/* ACTIVE ORDERS Tab */}
          <TabsContent value="active" className="mt-4">
            {activeOrders.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order}
                    onChat={setChatOrder}
                    actions={
                      <div className="flex gap-2">
                        {order.status === 'confirmed' && (
                          <Button size="sm" style={{ background: '#8b5cf6' }} className="text-white"
                            onClick={() => handleOrderAction(order, 'in_progress')}>
                            <Play className="w-4 h-4 mr-1" /> Start Service
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button size="sm" style={{ background: '#f97316' }} className="text-white"
                            onClick={() => { setWorkflowOrder(order); setProofImages([]); }}>
                            <Square className="w-4 h-4 mr-1" /> End & Complete
                          </Button>
                        )}
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="text-white border-white/20">
                            <MapPin className="w-4 h-4 mr-1" /> Navigate
                          </Button>
                        </a>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : <EmptyState icon={Play} message="No active jobs" />}
          </TabsContent>

          {/* COMPLETED Tab */}
          <TabsContent value="completed" className="mt-4">
            {completedOrders.length > 0 ? (
              <div className="space-y-3">
                {completedOrders.map(order => <OrderCard key={order.id} order={order} onChat={setChatOrder} />)}
              </div>
            ) : <EmptyState icon={CheckCircle} message="No completed jobs yet" />}
          </TabsContent>

          {/* CANCELLED Tab */}
          <TabsContent value="cancelled" className="mt-4">
            {cancelledOrders.length > 0 ? (
              <div className="space-y-3">
                {cancelledOrders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            ) : <EmptyState icon={XCircle} message="No cancelled orders" />}
          </TabsContent>

          {/* SERVICES Tab */}
          <TabsContent value="services" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button className="text-white" style={{ background: '#f97316' }} onClick={openNewService}>
                <Plus className="w-4 h-4 mr-2" /> Add Service
              </Button>
            </div>
            {services.length > 0 ? (
              <div className="grid gap-3">
                {services.map((service) => (

                  <Card key={service.id} style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{service.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: service.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: service.is_active ? '#10b981' : '#ef4444' }}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{service.description}</p>
                          {service.duration_minutes && (
                            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              <Clock className="w-3 h-3 inline mr-1" />{service.duration_minutes} min
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-white">${service.price}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{service.price_type}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-white/60"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEditService(service)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateServiceMutation.mutate({ id: service.id, data: { is_active: !service.is_active } })}>
                                {service.is_active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteServiceMutation.mutate(service.id)} className="text-red-500">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <EmptyState icon={Package} message="No services added yet" />}
          </TabsContent>

          {/* REVIEWS Tab */}
          <TabsContent value="reviews" className="mt-4">
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id} style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316' }}>
                          {review.customer_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white">{review.customer_name}</span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className="w-4 h-4" style={{ color: s <= review.rating ? '#f59e0b' : 'rgba(255,255,255,0.2)', fill: s <= review.rating ? '#f59e0b' : 'transparent' }} />
                              ))}
                            </div>
                          </div>
                          {review.comment && <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{review.comment}</p>}
                          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{new Date(review.created_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <EmptyState icon={Star} message="No reviews yet" />}
          </TabsContent>

          {/* AVAILABILITY Tab */}
          <TabsContent value="availability" className="mt-4">
            <Card style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: '#f97316' }} />
                  Availability Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-white/60 mb-3">Select days you're available to accept bookings</p>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {DAYS.map((day) => {
                      const active = (provider.availability || []).includes(day);
                      return (
                        <button key={day}
                          onClick={() => {
                            const newDays = active
                              ? (provider.availability || []).filter(d => d !== day)
                              : [...(provider.availability || []), day];
                            updateProviderMutation.mutate({ availability: newDays });
                          }}
                          className="p-3 rounded-xl text-sm font-medium transition-all border"
                          style={{
                            background: active ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                            borderColor: active ? '#f97316' : 'rgba(255,255,255,0.1)',
                            color: active ? '#f97316' : 'rgba(255,255,255,0.6)'
                          }}>
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <p className="text-white font-medium">Currently Accepting Orders</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Toggle to pause/resume your availability</p>
                  </div>
                  <Switch
                    checked={provider.is_active}
                    onCheckedChange={(v) => updateProviderMutation.mutate({ is_active: v })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Schedule */}
            <Card style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="border mt-4">
              <CardHeader>
                <CardTitle className="text-white text-base">Upcoming Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {activeOrders.length > 0 ? (
                  <div className="space-y-2">
                    {activeOrders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: '#f97316' }} />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{order.service_name}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{order.scheduled_date} · {order.scheduled_time}</p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4" style={{ color: 'rgba(255,255,255,0.4)' }}>No upcoming jobs</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Service Form Dialog (enhanced) */}
      <ServiceFormDialog
        open={serviceDialogOpen}
        onClose={() => { setServiceDialogOpen(false); setEditingService(null); }}
        service={editingService}
        providerId={provider?.id}
        onSave={(data) => {
          if (editingService) {
            updateServiceMutation.mutate({ id: editingService.id, data });
          } else {
            createServiceMutation.mutate(data);
          }
        }}
      />

      {/* Workflow: Complete Service Dialog */}
      <Dialog open={!!workflowOrder} onOpenChange={() => setWorkflowOrder(null)}>
        <DialogContent style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.3)' }} className="border">
          <DialogHeader>
            <DialogTitle className="text-white">Complete Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(249,115,22,0.08)' }}>
              <p className="text-white font-medium">{workflowOrder?.service_name}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>for {workflowOrder?.customer_name}</p>
            </div>

            <div>
              <Label className="text-white mb-2 block">Upload Proof of Service</Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {proofImages.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                ))}
                <label className="h-20 rounded-lg border-dashed border-2 flex flex-col items-center justify-center cursor-pointer"
                  style={{ borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(255,255,255,0.03)' }}>
                  {uploadingProof ? <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" /> : <Camera className="w-6 h-6" style={{ color: '#f97316' }} />}
                  <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Add Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} disabled={uploadingProof} />
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 text-white border-white/20" onClick={() => setWorkflowOrder(null)}>Cancel</Button>
              <Button className="flex-1 text-white" style={{ background: '#10b981' }} onClick={completeWithProof}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat with Customer */}
      <ChatWithCustomer
        open={!!chatOrder}
        onClose={() => setChatOrder(null)}
        order={chatOrder}
        senderEmail={provider?.email}
      />

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.3)' }} className="border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Business Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { key: 'business_name', label: 'Business Name' },
              { key: 'owner_name', label: 'Owner Name' },
              { key: 'phone', label: 'Phone' },
              { key: 'location', label: 'Location (City, State)' },
              { key: 'hourly_rate', label: 'Hourly Rate ($)', type: 'number' },
            ].map(({ key, label, type = 'text' }) => (
              <div key={key}>
                <Label className="text-white">{label}</Label>
                <Input type={type} value={profileForm[key] || ''}
                  onChange={e => setProfileForm({ ...profileForm, [key]: e.target.value })}
                  style={{ background: '#0f0900', borderColor: 'rgba(249,115,22,0.2)', color: '#fff' }} />
              </div>
            ))}
            <div>
              <Label className="text-white">Description</Label>
              <Textarea value={profileForm.description || ''} rows={3}
                onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                style={{ background: '#0f0900', borderColor: 'rgba(249,115,22,0.2)', color: '#fff' }} />
            </div>
            <div>
              <Label className="text-white mb-2 block">Availability</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all border"
                    style={{
                      background: availabilityDays.includes(day) ? '#f97316' : 'rgba(255,255,255,0.06)',
                      borderColor: availabilityDays.includes(day) ? '#f97316' : 'rgba(255,255,255,0.1)',
                      color: availabilityDays.includes(day) ? '#fff' : 'rgba(255,255,255,0.6)'
                    }}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full text-white" style={{ background: '#f97316' }}
              onClick={handleProfileSave} disabled={updateProviderMutation.isPending}>
              {updateProviderMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderCard({ order, actions, onChat }) {
  const s = statusColors[order.status] || statusColors.pending;
  return (
    <Card style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="border">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{order.order_number}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: s.bg, color: s.text }}>
                {order.status?.replace('_', ' ')}
              </span>
            </div>
            <h4 className="font-semibold text-white">{order.service_name}</h4>
            <div className="flex flex-wrap gap-3 mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{order.customer_name}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{order.scheduled_date} · {order.scheduled_time}</span>
              {order.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{order.address}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="font-bold text-white">${order.subtotal?.toFixed(2)}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Net: ${((order.subtotal || 0) - (order.commission_amount || 0)).toFixed(2)}</p>
            </div>
            {actions && <div className="flex gap-1.5">{actions}</div>}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex gap-2 flex-wrap">
          {order.customer_phone && (
            <a href={`tel:${order.customer_phone}`}>
              <Button size="sm" variant="ghost" className="text-white/60 hover:text-white h-7 text-xs">
                <Phone className="w-3.5 h-3.5 mr-1" /> Call
              </Button>
            </a>
          )}
          {onChat && (
            <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-400/10 h-7 text-xs"
              onClick={() => onChat(order)}>
              <MessageCircle className="w-3.5 h-3.5 mr-1" /> Chat
            </Button>
          )}
          {order.notes && (
            <span className="text-xs self-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Note: {order.notes}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <Card style={{ background: '#140b00', borderColor: 'rgba(249,115,22,0.2)' }} className="border">
      <CardContent className="py-10 text-center">
        <Icon className="w-10 h-10 opacity-20 mx-auto mb-3 text-white" />
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>{message}</p>
      </CardContent>
    </Card>
  );
}