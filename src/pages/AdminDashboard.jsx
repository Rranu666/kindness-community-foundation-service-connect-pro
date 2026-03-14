import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import {
  LayoutDashboard, Users, Building2, ShoppingCart, DollarSign, TrendingUp,
  BadgeCheck, Plus, Trash2, Edit, MoreVertical, Search, Filter, Star,
  Package, FileText, Palette, Settings, ExternalLink, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Percent, Globe, BarChart2
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
  { value: 'reviews', label: 'Reviews', icon: Star },
  { value: 'categories', label: 'Categories', icon: BadgeCheck },
  { value: 'cms', label: 'CMS', icon: FileText },
  { value: 'branding', label: 'Branding', icon: Palette },
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
  const [reviewSearch, setReviewSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProviderDocs, setSelectedProviderDocs] = useState(null);
  const [commissionRate, setCommissionRate] = useState('10');
  const [savingCommission, setSavingCommission] = useState(false);
  const queryClient = useQueryClient();

  const { data: providers = [] } = useQuery({ queryKey: ['allProviders'], queryFn: () => base44.entities.ServiceProvider.list() });
  const { data: orders = [] } = useQuery({ queryKey: ['allOrders'], queryFn: () => base44.entities.Order.list('-created_date', 200) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => base44.entities.ServiceCategory.list() });
  const { data: payouts = [], refetch: refetchPayouts } = useQuery({ queryKey: ['allPayouts'], queryFn: () => base44.entities.Payout.list('-requested_date', 100) });
  const { data: services = [] } = useQuery({ queryKey: ['allServices'], queryFn: () => base44.entities.Service.list('-created_date', 200) });
  const { data: users = [] } = useQuery({ queryKey: ['allUsers'], queryFn: () => base44.entities.User.list() });
  const { data: reviews = [] } = useQuery({ queryKey: ['allReviews'], queryFn: () => base44.entities.Review.list('-created_date', 50) });

  const updateProvider = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceProvider.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['allProviders']); toast.success('Provider updated'); }
  });
  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['allOrders']); toast.success('Order updated'); setSelectedOrder(null); }
  });
  const updatePayout = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Payout.update(id, data),
    onSuccess: () => { refetchPayouts(); toast.success('Payout updated'); }
  });
  const createCategory = useMutation({
    mutationFn: (data) => base44.entities.ServiceCategory.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); setCategoryDialog(false); toast.success('Category created'); }
  });
  const updateCategory = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceCategory.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); setCategoryDialog(false); setEditingCategory(null); toast.success('Category updated'); }
  });
  const deleteCategory = useMutation({
    mutationFn: (id) => base44.entities.ServiceCategory.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['categories']); toast.success('Category deleted'); }
  });
  const deleteService = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['allServices']); toast.success('Service deleted'); }
  });
  const updateService = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['allServices'])
  });
  const deleteUser = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['allUsers']); toast.success('User deleted'); }
  });
  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['allUsers']); toast.success('User updated'); }
  });
  const deleteProvider = useMutation({
    mutationFn: (id) => base44.entities.ServiceProvider.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['allProviders']); toast.success('Provider removed'); }
  });
  const deleteReview = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['allReviews']); toast.success('Review removed'); }
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
    base44.entities.Notification.create({
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
          <TabsList className="flex-wrap h-auto gap-1 p-1 mb-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,53,109,0.2)' }}>
            {NAV_TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="text-xs text-white/60 data-[state=active]:bg-violet-600/70 data-[state=active]:text-white hover:bg-white/10 hover:text-white">
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map(u => {
                      const userOrders = orders.filter(o => o.customer_email === u.email);
                      const isSuspended = u.role === 'suspended';
                      return (
                        <TableRow key={u.id} className={isSuspended ? 'bg-red-50 opacity-70' : ''}>
                          <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : isSuspended ? 'destructive' : 'outline'}
                              className={u.role === 'admin' ? 'bg-violet-600' : ''}>
                              {u.role || 'user'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {u.created_date && format(new Date(u.created_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <button className="text-violet-600 hover:underline text-sm font-medium"
                              onClick={() => setSelectedUser(u)}>
                              {userOrders.length} orders
                            </button>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedUser(u)}>
                                  <ExternalLink className="w-4 h-4 mr-2" /> View Orders
                                </DropdownMenuItem>
                                {u.role !== 'admin' && (
                                  <DropdownMenuItem onClick={() => updateUser.mutate({ id: u.id, data: { role: isSuspended ? 'customer' : 'suspended' } })}>
                                    {isSuspended
                                      ? <><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Unsuspend</>
                                      : <><XCircle className="w-4 h-4 mr-2 text-amber-600" /> Suspend</>}
                                  </DropdownMenuItem>
                                )}
                                {u.role !== 'admin' && (
                                  <DropdownMenuItem className="text-red-600"
                                    onClick={() => { if (window.confirm(`Delete user ${u.email}? This cannot be undone.`)) deleteUser.mutate(u.id); }}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredCustomers.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No customers found</TableCell></TableRow>
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
                      <TableHead>Actions</TableHead>
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
                          {categories.find(c => c.id === p.category_id)?.name || '—'}
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(p.id_proof_url || p.business_cert_url) && (
                                <DropdownMenuItem onClick={() => setSelectedProviderDocs(p)}>
                                  <FileText className="w-4 h-4 mr-2" /> View Documents
                                </DropdownMenuItem>
                              )}
                              {!p.is_verified && (
                                <DropdownMenuItem className="text-emerald-600"
                                  onClick={() => updateProvider.mutate({ id: p.id, data: { is_verified: true, is_active: true } })}>
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Provider
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600"
                                onClick={() => { if (window.confirm(`Delete provider "${p.business_name}"? This cannot be undone.`)) deleteProvider.mutate(p.id); }}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Provider
                              </DropdownMenuItem>
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
                          <div className="flex items-center gap-1">
                            {order.status === 'pending' && (
                              <>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs px-2"
                                  onClick={() => updateOrder.mutate({ id: order.id, data: { status: 'confirmed' } })}>
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept
                                </Button>
                                <Button size="sm" variant="destructive" className="h-7 text-xs px-2"
                                  onClick={() => updateOrder.mutate({ id: order.id, data: { status: 'cancelled' } })}>
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </>
                            )}
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
                          </div>
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
                          <TableCell className="text-sm">{categories.find(c => c.id === prov?.category_id)?.name || '—'}</TableCell>
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
                    {payouts.map(payout => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">
                          {providers.find(p => p.id === payout.provider_id)?.business_name || 'Unknown'}
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
                    ))}
                    {payouts.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No payout requests</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── REVIEWS ── */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reviews Management ({reviews.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search reviews..." className="pl-9" value={reviewSearch} onChange={e => setReviewSearch(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.filter(r =>
                      !reviewSearch ||
                      r.customer_name?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      r.comment?.toLowerCase().includes(reviewSearch.toLowerCase())
                    ).map(r => {
                      const prov = providers.find(p => p.id === r.provider_id);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{prov?.business_name || '—'}</TableCell>
                          <TableCell className="text-sm">{r.customer_name || r.customer_email || '—'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                              ))}
                              <span className="text-xs text-slate-500 ml-1">{r.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 max-w-xs truncate">{r.comment || '—'}</TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {r.created_date && format(new Date(r.created_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700"
                              onClick={() => { if (window.confirm('Delete this review? This cannot be undone.')) deleteReview.mutate(r.id); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {reviews.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No reviews yet</TableCell></TableRow>
                    )}
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
                          {services.filter(s => providers.find(p => p.id === s.provider_id)?.category_id === cat.id).length} services
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

      {/* User Orders Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Orders — {selectedUser?.full_name || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span>Email: {selectedUser.email}</span>
                <Badge variant="outline">{selectedUser.role || 'user'}</Badge>
              </div>
              {orders.filter(o => o.customer_email === selectedUser.email).length === 0
                ? <p className="text-slate-400 text-sm py-4 text-center">No orders for this user</p>
                : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {orders.filter(o => o.customer_email === selectedUser.email).map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <div>
                          <p className="font-medium text-sm">{o.service_name}</p>
                          <p className="text-xs text-slate-500">#{o.order_number} · {o.scheduled_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${o.total_amount?.toFixed(2)}</p>
                          <Badge className={`text-xs ${statusColors[o.status]}`}>{o.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Provider Documents Dialog */}
      <Dialog open={!!selectedProviderDocs} onOpenChange={() => setSelectedProviderDocs(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Documents — {selectedProviderDocs?.business_name}</DialogTitle>
          </DialogHeader>
          {selectedProviderDocs && (
            <div className="space-y-4">
              {selectedProviderDocs.id_proof_url && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">ID Proof</p>
                  <a href={selectedProviderDocs.id_proof_url} target="_blank" rel="noopener noreferrer"
                    className="text-violet-600 hover:underline text-sm flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> View Document
                  </a>
                </div>
              )}
              {selectedProviderDocs.business_cert_url && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Business Certificate</p>
                  <a href={selectedProviderDocs.business_cert_url} target="_blank" rel="noopener noreferrer"
                    className="text-violet-600 hover:underline text-sm flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> View Document
                  </a>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => { updateProvider.mutate({ id: selectedProviderDocs.id, data: { is_verified: true, is_active: true } }); setSelectedProviderDocs(null); }}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve Provider
                </Button>
                <Button variant="destructive" className="flex-1"
                  onClick={() => { updateProvider.mutate({ id: selectedProviderDocs.id, data: { is_active: false } }); setSelectedProviderDocs(null); }}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
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

// ── CMS Tab ──
function CMSTab() {
  const [pages, setPages] = useState([
    { id: 1, title: 'Home', slug: '/', meta_title: 'Service Connect Pro', meta_desc: 'Find top service providers', status: 'published' },
    { id: 2, title: 'About Us', slug: '/about', meta_title: 'About Us', meta_desc: 'Learn about our platform', status: 'published' },
    { id: 3, title: 'Terms & Privacy', slug: '/terms', meta_title: 'Terms & Privacy', meta_desc: '', status: 'published' },
  ]);
  const [editPage, setEditPage] = useState(null);
  const [newPage, setNewPage] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', meta_title: '', meta_desc: '', content: '', status: 'draft' });

  const savePage = () => {
    if (editPage) {
      setPages(p => p.map(pg => pg.id === editPage.id ? { ...pg, ...form } : pg));
      toast.success('Page updated');
    } else {
      setPages(p => [...p, { id: Date.now(), ...form }]);
      toast.success('Page created');
    }
    setEditPage(null);
    setNewPage(false);
    setForm({ title: '', slug: '', meta_title: '', meta_desc: '', content: '', status: 'draft' });
  };

  const openEdit = (pg) => {
    setEditPage(pg);
    setForm({ title: pg.title, slug: pg.slug, meta_title: pg.meta_title || '', meta_desc: pg.meta_desc || '', content: pg.content || '', status: pg.status });
    setNewPage(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Pages</CardTitle>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700"
              onClick={() => { setEditPage(null); setForm({ title: '', slug: '', meta_title: '', meta_desc: '', content: '', status: 'draft' }); setNewPage(true); }}>
              <Plus className="w-4 h-4 mr-1" /> New Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Meta Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map(pg => (
                <TableRow key={pg.id}>
                  <TableCell className="font-medium">{pg.title}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-500">{pg.slug}</TableCell>
                  <TableCell className="text-sm text-slate-600">{pg.meta_title}</TableCell>
                  <TableCell><Badge variant={pg.status === 'published' ? 'default' : 'outline'} className={pg.status === 'published' ? 'bg-emerald-600' : ''}>{pg.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(pg)}><Edit className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setPages(p => p.filter(x => x.id !== pg.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {newPage && (
        <Card>
          <CardHeader><CardTitle className="text-base">{editPage ? 'Edit Page' : 'New Page'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Page Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" /></div>
              <div><Label>Slug (URL path)</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="/page-name" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Meta Title (SEO)</Label><Input value={form.meta_title} onChange={e => setForm({...form, meta_title: e.target.value})} className="mt-1" /></div>
              <div><Label>Meta Description (SEO)</Label><Input value={form.meta_desc} onChange={e => setForm({...form, meta_desc: e.target.value})} className="mt-1" /></div>
            </div>
            <div>
              <Label>Page Content</Label>
              <Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={5} className="mt-1" placeholder="Page content / HTML..." />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="mt-1 w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={savePage}>Save Page</Button>
              <Button variant="outline" onClick={() => { setNewPage(false); setEditPage(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Staff Tab ──
function StaffTab({ users }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [search, setSearch] = useState('');

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (e) {
      toast.error(e?.message || 'Failed to send invite');
    } finally { setInviting(false); }
  };

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Invite */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invite Staff Member</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Input placeholder="Email address" value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)} className="flex-1 min-w-40" />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Admin role grants full access to this panel. User role has read-only access.</p>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Users & Staff ({users.length})</CardTitle>
            <div className="relative w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'outline'}
                      className={u.role === 'admin' ? 'bg-violet-600' : ''}>
                      {u.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {u.created_date && format(new Date(u.created_date), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Settings Tab ──
function SettingsTab() {
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState({
    maintenance_mode: false,
    maintenance_message: 'We are performing scheduled maintenance. We\'ll be back shortly!',
    cache_enabled: true,
    cache_ttl: '60',
  });

  const [gdpr, setGdpr] = useState({
    cookie_banner: true,
    analytics_consent: true,
    marketing_consent: false,
    cookie_expiry_days: '365',
    privacy_policy_url: '/terms',
  });

  const [social, setSocial] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp: '',
  });

  const [analytics, setAnalytics] = useState({
    ga_measurement_id: '',
    gtm_id: '',
    fb_pixel_id: '',
    enabled: false,
  });

  const [livechat, setLivechat] = useState({
    provider: 'none',
    widget_id: '',
    enabled: false,
    color: '#e8356d',
  });

  const [emailTemplates, setEmailTemplates] = useState({
    booking_confirmed: 'Hi {customer_name},\n\nYour booking #{order_number} for {service_name} has been confirmed!\n\nDate: {scheduled_date}\nProvider: {provider_name}\n\nThank you for choosing Service Connect Pro!',
    booking_cancelled: 'Hi {customer_name},\n\nYour booking #{order_number} has been cancelled.\n\nIf you were charged, a refund will be processed within 3-5 business days.\n\nThank you for your understanding.',
    payout_approved: 'Hi {provider_name},\n\nYour payout request of ${amount} has been approved and will be processed within 2 business days.\n\nThank you for being part of our platform!',
  });
  const [activeTemplate, setActiveTemplate] = useState('booking_confirmed');

  const templateLabels = {
    booking_confirmed: 'Booking Confirmed',
    booking_cancelled: 'Booking Cancelled',
    payout_approved: 'Payout Approved',
  };

  const handleSave = (section) => {
    setSaving(section);
    setTimeout(() => { setSaving(false); toast.success('Settings saved successfully'); }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Maintenance Mode + Cache */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4 text-amber-500" /> General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div>
                <p className="font-medium text-amber-900">Maintenance Mode</p>
                <p className="text-xs text-amber-700">Temporarily disable the site for visitors</p>
              </div>
              <Switch checked={general.maintenance_mode}
                onCheckedChange={v => setGeneral(g => ({ ...g, maintenance_mode: v }))} />
            </div>
            {general.maintenance_mode && (
              <div>
                <Label>Maintenance Message</Label>
                <Textarea value={general.maintenance_message}
                  onChange={e => setGeneral(g => ({ ...g, maintenance_message: e.target.value }))}
                  rows={2} className="mt-1 text-sm" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Cache System</p>
                <p className="text-xs text-slate-500">Cache API responses to improve performance</p>
              </div>
              <Switch checked={general.cache_enabled}
                onCheckedChange={v => setGeneral(g => ({ ...g, cache_enabled: v }))} />
            </div>
            {general.cache_enabled && (
              <div>
                <Label>Cache TTL (seconds)</Label>
                <Input type="number" value={general.cache_ttl}
                  onChange={e => setGeneral(g => ({ ...g, cache_ttl: e.target.value }))}
                  className="mt-1 w-36" />
              </div>
            )}
            <Button className="bg-violet-600 hover:bg-violet-700 w-full" onClick={() => handleSave('general')}
              disabled={saving === 'general'}>
              {saving === 'general' ? 'Saving...' : 'Save General Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* GDPR / Cookie */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> GDPR & Cookie Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'cookie_banner', label: 'Show Cookie Consent Banner', desc: 'Display GDPR cookie notice to visitors' },
              { key: 'analytics_consent', label: 'Require Analytics Consent', desc: 'Ask users before loading analytics scripts' },
              { key: 'marketing_consent', label: 'Require Marketing Consent', desc: 'Ask users before marketing cookies' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <Switch checked={gdpr[key]} onCheckedChange={v => setGdpr(g => ({ ...g, [key]: v }))} />
              </div>
            ))}
            <div>
              <Label>Cookie Expiry (days)</Label>
              <Input type="number" value={gdpr.cookie_expiry_days}
                onChange={e => setGdpr(g => ({ ...g, cookie_expiry_days: e.target.value }))}
                className="mt-1 w-36" />
            </div>
            <div>
              <Label>Privacy Policy URL</Label>
              <Input value={gdpr.privacy_policy_url}
                onChange={e => setGdpr(g => ({ ...g, privacy_policy_url: e.target.value }))}
                className="mt-1" placeholder="/privacy" />
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700 w-full" onClick={() => handleSave('gdpr')}
              disabled={saving === 'gdpr'}>
              {saving === 'gdpr' ? 'Saving...' : 'Save GDPR Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Links */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> Social Media Links</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
              { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
              { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle' },
              { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
              { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/c/...' },
              { key: 'whatsapp', label: 'WhatsApp', placeholder: '+1234567890' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input value={social[key]} onChange={e => setSocial(s => ({ ...s, [key]: e.target.value }))}
                  placeholder={placeholder} className="mt-1 text-sm" />
              </div>
            ))}
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700 mt-4" onClick={() => handleSave('social')}
            disabled={saving === 'social'}>
            {saving === 'social' ? 'Saving...' : 'Save Social Links'}
          </Button>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-500" /> Google Analytics & Tracking</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Enable Analytics Tracking</p>
              <p className="text-xs text-slate-500">Load analytics scripts on the site</p>
            </div>
            <Switch checked={analytics.enabled} onCheckedChange={v => setAnalytics(a => ({ ...a, enabled: v }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Google Analytics 4 Measurement ID</Label>
              <Input value={analytics.ga_measurement_id}
                onChange={e => setAnalytics(a => ({ ...a, ga_measurement_id: e.target.value }))}
                placeholder="G-XXXXXXXXXX" className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label>Google Tag Manager ID</Label>
              <Input value={analytics.gtm_id}
                onChange={e => setAnalytics(a => ({ ...a, gtm_id: e.target.value }))}
                placeholder="GTM-XXXXXXX" className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label>Facebook Pixel ID</Label>
              <Input value={analytics.fb_pixel_id}
                onChange={e => setAnalytics(a => ({ ...a, fb_pixel_id: e.target.value }))}
                placeholder="123456789012345" className="mt-1 font-mono text-sm" />
            </div>
          </div>
          {analytics.enabled && analytics.ga_measurement_id && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-700">Analytics tracking is active with ID: <span className="font-mono font-semibold">{analytics.ga_measurement_id}</span></p>
            </div>
          )}
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => handleSave('analytics')}
            disabled={saving === 'analytics'}>
            {saving === 'analytics' ? 'Saving...' : 'Save Analytics Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Live Chat Integration */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ExternalLink className="w-4 h-4 text-violet-500" /> Live Chat Integration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Enable Live Chat Widget</p>
              <p className="text-xs text-slate-500">Show chat widget to site visitors</p>
            </div>
            <Switch checked={livechat.enabled} onCheckedChange={v => setLivechat(l => ({ ...l, enabled: v }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Chat Provider</Label>
              <Select value={livechat.provider} onValueChange={v => setLivechat(l => ({ ...l, provider: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Disabled</SelectItem>
                  <SelectItem value="intercom">Intercom</SelectItem>
                  <SelectItem value="crisp">Crisp</SelectItem>
                  <SelectItem value="tawk">Tawk.to</SelectItem>
                  <SelectItem value="zendesk">Zendesk Chat</SelectItem>
                  <SelectItem value="freshchat">Freshchat</SelectItem>
                  <SelectItem value="custom">Custom Widget</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {livechat.provider !== 'none' && (
              <div>
                <Label>Widget / App ID</Label>
                <Input value={livechat.widget_id}
                  onChange={e => setLivechat(l => ({ ...l, widget_id: e.target.value }))}
                  placeholder="Your widget ID or script key" className="mt-1 font-mono text-sm" />
              </div>
            )}
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => handleSave('livechat')}
            disabled={saving === 'livechat'}>
            {saving === 'livechat' ? 'Saving...' : 'Save Live Chat Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Email Template Customization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(templateLabels).map(([key, label]) => (
              <Button key={key} size="sm" variant={activeTemplate === key ? 'default' : 'outline'}
                className={activeTemplate === key ? 'bg-violet-600 hover:bg-violet-700' : ''}
                onClick={() => setActiveTemplate(key)}>
                {label}
              </Button>
            ))}
          </div>
          <div>
            <Label className="text-sm font-medium">{templateLabels[activeTemplate]} Template</Label>
            <p className="text-xs text-slate-500 mb-2 mt-0.5">
              Variables: <span className="font-mono bg-slate-100 px-1 rounded">{'{customer_name}'}</span>{' '}
              <span className="font-mono bg-slate-100 px-1 rounded">{'{order_number}'}</span>{' '}
              <span className="font-mono bg-slate-100 px-1 rounded">{'{service_name}'}</span>{' '}
              <span className="font-mono bg-slate-100 px-1 rounded">{'{scheduled_date}'}</span>{' '}
              <span className="font-mono bg-slate-100 px-1 rounded">{'{provider_name}'}</span>{' '}
              <span className="font-mono bg-slate-100 px-1 rounded">{'{amount}'}</span>
            </p>
            <Textarea value={emailTemplates[activeTemplate]}
              onChange={e => setEmailTemplates(t => ({ ...t, [activeTemplate]: e.target.value }))}
              rows={8} className="font-mono text-sm" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => handleSave('email')}
            disabled={saving === 'email'}>
            {saving === 'email' ? 'Saving...' : 'Save Email Templates'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Branding Tab ──
function BrandingTab() {
  const [form, setForm] = useState({
    primary_color: '#e8356d',
    secondary_color: '#9333ea',
    bg_color: '#0d0d1f',
    font_family: 'Inter',
    logo_url: '',
    rtl: false,
    custom_css: '',
    custom_js: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Apply CSS variables live
    document.documentElement.style.setProperty('--brand-primary', form.primary_color);
    setTimeout(() => {
      setSaving(false);
      toast.success('Branding settings saved');
    }, 600);
  };

  const handleRTL = (v) => {
    setForm(f => ({ ...f, rtl: v }));
    document.documentElement.setAttribute('dir', v ? 'rtl' : 'ltr');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Colors & Typography</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'primary_color', label: 'Primary / Brand Color' },
              { key: 'secondary_color', label: 'Secondary Color' },
              { key: 'bg_color', label: 'Background Color' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <input type="color" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                <div className="flex-1">
                  <Label>{label}</Label>
                  <Input value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} className="mt-1 font-mono text-sm" />
                </div>
              </div>
            ))}
            <div>
              <Label>Font Family</Label>
              <Select value={form.font_family} onValueChange={v => setForm({...form, font_family: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Lato', 'Montserrat'].map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Logo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})}
                placeholder="https://..." className="mt-1" />
            </div>
            {form.logo_url && (
              <img src={form.logo_url} alt="Logo preview" className="h-12 object-contain border rounded-lg p-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Layout & RTL</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">RTL Layout</p>
                <p className="text-sm text-slate-500">Right-to-left for Arabic, Hebrew, etc.</p>
              </div>
              <Switch checked={form.rtl} onCheckedChange={handleRTL} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Custom CSS</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.custom_css} onChange={e => setForm({...form, custom_css: e.target.value})}
              rows={8} placeholder="/* Custom CSS styles */&#10;.my-class { color: red; }"
              className="font-mono text-sm" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Custom JavaScript</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.custom_js} onChange={e => setForm({...form, custom_js: e.target.value})}
              rows={6} placeholder="// Custom JS&#10;console.log('hello');"
              className="font-mono text-sm" />
            <p className="text-xs text-slate-400 mt-2">⚠ Custom scripts run on every page. Use with caution.</p>
          </CardContent>
        </Card>

        <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Branding Settings'}
        </Button>
      </div>
    </div>
  );
}