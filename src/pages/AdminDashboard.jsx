import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import {
  LayoutDashboard, Users, Building2, ShoppingCart, DollarSign, TrendingUp,
  BadgeCheck, Plus, Trash2, Edit, MoreVertical, Search, Filter, Star,
  Package, FileText, Palette, Settings, ExternalLink, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Percent, Globe, BarChart2, BookOpen
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import MarketingTab from '@/components/admin/MarketingTab';
import ReportsTab from '@/components/admin/ReportsTab';
import CMSTab from '@/components/admin/CMSTab';
import StaffTab from '@/components/admin/StaffTab';
import SettingsTab from '@/components/admin/SettingsTab';
import BrandingTab from '@/components/admin/BrandingTab';
import BlogTab from '@/components/admin/BlogTab';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-violet-100 text-violet-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700'
};

const NAV_TABS = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'customers', label: 'Customers', icon: Users },
  { value: 'providers', label: 'Providers', icon: Building2 },
  { value: 'bookings', label: 'Bookings', icon: ShoppingCart },
  { value: 'services', label: 'Services', icon: Package },
  { value: 'payments', label: 'Payments', icon: DollarSign },
  { value: 'categories', label: 'Categories', icon: Star },
  { value: 'cms', label: 'CMS', icon: FileText },
  { value: 'branding', label: 'Branding', icon: Palette },
  { value: 'blog', label: 'Blog', icon: BookOpen },
  { value: 'staff', label: 'Staff', icon: Users },
  { value: 'marketing', label: 'Marketing', icon: TrendingUp },
  { value: 'reports', label: 'Reports', icon: BarChart2 },
  { value: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '' });
  const [orderSearch, setOrderSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [commissionRate, setCommissionRate] = useState('10');
  const [savingCommission, setSavingCommission] = useState(false);
  const queryClient = useQueryClient();

  const { data: providers = [] } = useQuery({ queryKey: ['allProviders'], queryFn: () => db.ServiceProvider.list(), staleTime: 5*60*1000 });
  const { data: orders = [] } = useQuery({ queryKey: ['allOrders'], queryFn: () => db.Order.list('-created_date', 100), staleTime: 2*60*1000 });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => db.ServiceCategory.list(), staleTime: 10*60*1000 });
  const { data: payouts = [], refetch: refetchPayouts } = useQuery({ queryKey: ['allPayouts'], queryFn: () => db.Payout.list('-requested_date', 50), staleTime: 3*60*1000 });
  const { data: services = [] } = useQuery({ queryKey: ['allServices'], queryFn: () => db.Service.list('-created_date', 100), staleTime: 5*60*1000 });
  const { data: users = [] } = useQuery({ queryKey: ['allUsers'], queryFn: () => db.User.list(), staleTime: 5*60*1000 });
  const { data: reviews = [] } = useQuery({ queryKey: ['allReviews'], queryFn: () => db.Review.list('-created_date', 30), staleTime: 3*60*1000 });

  const updateProvider = useMutation({
    mutationFn: ({ id, data }) => db.ServiceProvider.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['allProviders']); toast.success('Provider updated'); }
  });
  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => db.Order.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['allOrders']); toast.success('Order updated'); setSelectedOrder(null); }
  });
  const updatePayout = useMutation({
    mutationFn: ({ id, data }) => db.Payout.update(id, data),
    onSuccess: () => { refetchPayouts(); toast.success('Payout updated'); }
  });
  const createCategory = useMutation({
    mutationFn: (data) => db.ServiceCategory.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); setCategoryDialog(false); toast.success('Category created'); }
  });
  const updateCategory = useMutation({
    mutationFn: ({ id, data }) => db.ServiceCategory.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); setCategoryDialog(false); setEditingCategory(null); toast.success('Category updated'); }
  });
  const deleteCategory = useMutation({
    mutationFn: (id) => db.ServiceCategory.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); toast.success('Category deleted'); }
  });
  const deleteService = useMutation({
    mutationFn: (id) => db.Service.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['allServices']); toast.success('Service deleted'); }
  });
  const updateService = useMutation({
    mutationFn: ({ id, data }) => db.Service.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['allServices'])
  });

  // Stats
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalCommission = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.commission_amount || 0), 0);
  const pendingProviders = providers.filter(p => !p.is_verified).length;
  const activeServices = services.filter(s => s.is_active).length;
  const pendingPayoutsTotal = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const filteredOrders = orders.filter(o =>
    !orderSearch || o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.provider_name?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredProviders = providers.filter(p =>
    !providerSearch || p.business_name?.toLowerCase().includes(providerSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(providerSearch.toLowerCase())
  );

  const filteredCustomers = users.filter(u =>
    !customerSearch || u.full_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '' });
    setCategoryDialog(true);
  };

  const handleCategorySubmit = () => {
    if (!catForm.name) return toast.error('Name is required');
    if (editingCategory) updateCategory.mutate({ id: editingCategory.id, data: catForm });
    else createCategory.mutate(catForm);
  };

  const handleRefund = (order) => {
    updateOrder.mutate({ id: order.id, data: { status: 'cancelled', payment_status: 'refunded' } });
    db.Notification.create({
      recipient_email: order.customer_email, recipient_type: 'customer',
      type: 'cancellation', title: 'Refund Issued',
      message: `Your order #${order.order_number} has been refunded by admin.`,
      order_id: order.id, channels: ['email']
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
              <p className="text-xs text-slate-500">Service Connect Pro</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('AdminMultiCity')}>
              <Button variant="outline" size="sm"><Globe className="w-4 h-4 mr-1" /> Tax Config</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap h-auto gap-1 p-1 mb-6 bg-white border border-slate-200 rounded-xl">
            {NAV_TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                <Icon className="w-3.5 h-3.5 mr-1" />{label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, sub: `$${totalCommission.toFixed(0)} commission`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', white: true },
                { label: 'Total Orders', value: orders.length, sub: `${orders.filter(o=>o.status==='pending').length} pending`, icon: ShoppingCart, color: 'bg-white', iconColor: 'text-amber-600' },
                { label: 'Providers', value: providers.length, sub: `${pendingProviders} awaiting approval`, icon: Building2, color: 'bg-white', iconColor: 'text-blue-600' },
                { label: 'Customers', value: users.length, sub: `${activeServices} active services`, icon: Users, color: 'bg-white', iconColor: 'text-violet-600' },
              ].map(({ label, value, sub, icon: Icon, color, white, iconColor }) => (
                <Card key={label} className={white ? `bg-gradient-to-br ${color} text-white` : color}>
                  <CardContent className="pt-5 pb-4">
                    <Icon className={`w-7 h-7 mb-2 ${white ? 'opacity-80' : iconColor}`} />
                    <p className={`text-xs ${white ? 'text-white/70' : 'text-slate-500'}`}>{label}</p>
                    <p className={`text-3xl font-bold ${white ? 'text-white' : 'text-slate-800'}`}>{value}</p>
                    <p className={`text-xs mt-1 ${white ? 'text-white/70' : 'text-slate-500'}`}>{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Pending Provider Approvals ({pendingProviders})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {providers.filter(p => !p.is_verified).slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{p.business_name}</p>
                        <p className="text-xs text-slate-500">{p.email}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                          onClick={() => updateProvider.mutate({ id: p.id, data: { is_verified: true } })}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs"
                          onClick={() => updateProvider.mutate({ id: p.id, data: { is_active: false } })}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingProviders === 0 && <p className="text-slate-400 text-sm py-3">All providers approved</p>}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-500" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.filter(o => o.status === 'completed').slice(0, 6).map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{o.service_name}</p>
                        <p className="text-xs text-slate-500">{o.customer_name} · {o.scheduled_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">${o.total_amount?.toFixed(2)}</p>
                        <p className="text-xs text-emerald-600">+${o.commission_amount?.toFixed(2)} fee</p>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'completed').length === 0 && <p className="text-slate-400 text-sm py-3">No completed orders yet</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── CUSTOMERS ── */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Management ({users.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search customers..." className="pl-9" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'outline'} className={u.role === 'admin' ? 'bg-violet-600' : ''}>
                            {u.role || 'user'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {u.created_date && format(new Date(u.created_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-slate-600">
                              {orders.length > 0 ? orders.reduce((sum, o) => sum + (o.customer_email === u.email ? 1 : 0), 0) : 0}
                            </TableCell>
                      </TableRow>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">No customers found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PROVIDERS ── */}
          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle>Provider Management ({providers.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search providers..." className="pl-9" value={providerSearch} onChange={e => setProviderSearch(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Owner / Email</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Featured</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProviders.map(p => (
                      <TableRow key={p.id} className={!p.is_verified ? 'bg-amber-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {p.profile_image && <img src={p.profile_image} className="w-7 h-7 rounded-full object-cover" alt="" />}
                            <span className="font-medium">{p.business_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{p.owner_name}</p>
                          <p className="text-xs text-slate-500">{p.email}</p>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {categories.length > 0 && categories.find(c => c.id === p.category_id)?.name || '—'}
                        </TableCell>
                        <TableCell>{p.rating ? `${p.rating.toFixed(1)} ⭐` : '—'}</TableCell>
                        <TableCell>{p.total_orders || 0}</TableCell>
                        <TableCell>
                          <Switch checked={!!p.is_verified}
                            onCheckedChange={v => updateProvider.mutate({ id: p.id, data: { is_verified: v } })} />
                        </TableCell>
                        <TableCell>
                          <Switch checked={!!p.is_active}
                            onCheckedChange={v => updateProvider.mutate({ id: p.id, data: { is_active: v } })} />
                        </TableCell>
                        <TableCell>
                          <Switch checked={!!p.is_featured}
                            onCheckedChange={v => updateProvider.mutate({ id: p.id, data: { is_featured: v } })} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── BOOKINGS ── */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle>All Bookings ({orders.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search orders..." className="pl-9" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.slice(0, 50).map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                        <TableCell className="text-sm">{order.customer_name}</TableCell>
                        <TableCell className="text-sm">{order.provider_name}</TableCell>
                        <TableCell className="text-sm">{order.service_name}</TableCell>
                        <TableCell className="font-medium">${order.total_amount?.toFixed(2)}</TableCell>
                        <TableCell><Badge className={statusColors[order.status]}>{order.status}</Badge></TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {order.created_date && format(new Date(order.created_date), 'MMM d')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                <Edit className="w-4 h-4 mr-2" /> Manage / Assign
                              </DropdownMenuItem>
                              {order.status !== 'cancelled' && (
                                <DropdownMenuItem className="text-red-600" onClick={() => handleRefund(order)}>
                                  <RefreshCw className="w-4 h-4 mr-2" /> Refund & Cancel
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>All Services ({services.length}) · {activeServices} active</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map(svc => {
                      const prov = providers.find(p => p.id === svc.provider_id);
                      return (
                        <TableRow key={svc.id}>
                          <TableCell className="font-medium">{svc.name}</TableCell>
                          <TableCell className="text-sm text-slate-600">{prov?.business_name || '—'}</TableCell>
                          <TableCell className="text-sm">{prov && categories.length > 0 && categories.find(c => c.id === prov?.category_id)?.name || '—'}</TableCell>
                          <TableCell className="font-medium">${svc.price}</TableCell>
                          <TableCell><Badge variant="outline">{svc.price_type}</Badge></TableCell>
                          <TableCell className="text-slate-500 text-sm">{svc.duration_minutes ? `${svc.duration_minutes}m` : '—'}</TableCell>
                          <TableCell><Switch checked={!!svc.is_active} onCheckedChange={v => updateService.mutate({ id: svc.id, data: { is_active: v } })} /></TableCell>
                          <TableCell><Switch checked={!!svc.is_featured} onCheckedChange={v => updateService.mutate({ id: svc.id, data: { is_featured: v } })} /></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteService.mutate(svc.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PAYMENTS ── */}
          <TabsContent value="payments">
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {[
                { label: 'Total Collected', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600' },
                { label: 'Platform Commission', value: `$${totalCommission.toFixed(2)}`, icon: Percent, color: 'text-violet-600' },
                { label: 'Pending Payouts', value: `$${pendingPayoutsTotal.toFixed(2)}`, icon: AlertCircle, color: 'text-amber-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-5">
                    <Icon className={`w-6 h-6 mb-2 ${color}`} />
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Commission Rate Setting */}
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Platform Commission Rate</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-4 max-w-sm">
                  <div className="flex-1">
                    <Label>Commission Percentage (%)</Label>
                    <Input type="number" min="0" max="100" step="0.5"
                      value={commissionRate} onChange={e => setCommissionRate(e.target.value)}
                      className="mt-1" />
                    <p className="text-xs text-slate-500 mt-1">Applied to all new orders</p>
                  </div>
                  <Button className="bg-violet-600 hover:bg-violet-700"
                    onClick={() => { setSavingCommission(true); setTimeout(() => { setSavingCommission(false); toast.success(`Commission set to ${commissionRate}%`); }, 600); }}
                    disabled={savingCommission}>
                    {savingCommission ? 'Saving...' : 'Save Rate'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payout Management */}
            <Card>
              <CardHeader><CardTitle className="text-base">Payout Requests</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map(payout => {
                      const prov = providers.find(p => p.id === payout.provider_id);
                      return (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">
                          {prov?.business_name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm">{payout.provider_email}</TableCell>
                        <TableCell className="font-medium">${payout.amount?.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-slate-600">{payout.bank_name || '—'}</TableCell>
                        <TableCell>
                          <Select value={payout.status} onValueChange={s => updatePayout.mutate({ id: payout.id, data: { status: s } })}>
                            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['pending','approved','processing','completed','failed'].map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {payout.requested_date && format(new Date(payout.requested_date), 'MMM d')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs"
                              onClick={() => updatePayout.mutate({ id: payout.id, data: { status: 'approved', approved_date: new Date().toISOString().split('T')[0] } })}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs"
                              onClick={() => updatePayout.mutate({ id: payout.id, data: { status: 'failed' } })}>
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                        );
                        })}
                        {payouts.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No payout requests</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CATEGORIES ── */}
          <TabsContent value="categories">
            <div className="flex justify-end mb-4">
              <Button className="bg-violet-600 hover:bg-violet-700"
                onClick={() => { setEditingCategory(null); setCatForm({ name: '', description: '', icon: '' }); setCategoryDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <Card key={cat.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">{cat.name}</h3>
                        <p className="text-sm text-slate-500">{cat.description}</p>
                        {cat.icon && <Badge variant="outline" className="mt-2 text-xs">{cat.icon}</Badge>}
                        <p className="text-xs text-slate-400 mt-1">
                          {services.length > 0 && services.reduce((cnt, s) => {
                            const p = providers.find(pr => pr.id === s.provider_id);
                            return cnt + (p?.category_id === cat.id ? 1 : 0);
                          }, 0)} services
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditCategory(cat)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteCategory.mutate(cat.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── CMS ── */}
          <TabsContent value="cms">
            <CMSTab />
          </TabsContent>

          {/* ── BRANDING ── */}
          <TabsContent value="branding">
            <BrandingTab />
          </TabsContent>

          {/* ── BLOG ── */}
          <TabsContent value="blog">
            <BlogTab />
          </TabsContent>

          {/* ── STAFF ── */}
          <TabsContent value="staff">
            <StaffTab users={users} />
          </TabsContent>

          {/* ── MARKETING ── */}
          <TabsContent value="marketing">
            <MarketingTab users={users} providers={providers} services={services} categories={categories} />
          </TabsContent>

          {/* ── REPORTS ── */}
          <TabsContent value="reports">
            <ReportsTab orders={orders} users={users} providers={providers} services={services} reviews={reviews} />
          </TabsContent>

          {/* ── SETTINGS ── */}
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Manage Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Manage Order {selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Customer', selectedOrder.customer_name],
                  ['Provider', selectedOrder.provider_name],
                  ['Service', selectedOrder.service_name],
                  ['Amount', `$${selectedOrder.total_amount?.toFixed(2)}`],
                  ['Date', selectedOrder.scheduled_date],
                  ['Address', selectedOrder.address],
                ].map(([k, v]) => (
                  <div key={k}><p className="text-slate-500 text-xs">{k}</p><p className="font-medium">{v || '—'}</p></div>
                ))}
              </div>
              <div>
                <Label>Assign Provider</Label>
                <Select defaultValue={selectedOrder.provider_id}
                  onValueChange={pid => {
                    const prov = providers.find(p => p.id === pid);
                    updateOrder.mutate({ id: selectedOrder.id, data: { provider_id: pid, provider_name: prov?.business_name } });
                  }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    {providers.filter(p => p.is_active).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.business_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Update Status</Label>
                <Select defaultValue={selectedOrder.status}
                  onValueChange={status => updateOrder.mutate({ id: selectedOrder.id, data: { status } })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['pending','confirmed','in_progress','completed','cancelled'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => updateOrder.mutate({ id: selectedOrder.id, data: { status: 'confirmed' } })}>
                  Confirm Order
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleRefund(selectedOrder)}>
                  Refund & Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={v => { setCategoryDialog(v); if (!v) setEditingCategory(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="mt-1" /></div>
            <div><Label>Description</Label><Input value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="mt-1" /></div>
            <div><Label>Icon (Lucide name)</Label><Input value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})} placeholder="e.g. Hammer, Stethoscope" className="mt-1" /></div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleCategorySubmit}>
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}