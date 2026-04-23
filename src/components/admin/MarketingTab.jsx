import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Trash2, Edit, Bell, Star, Image, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

// ── Coupons & Promotions ──
function CouponsSection() {
  const qc = useQueryClient();
  const { data: promos = [] } = useQuery({ queryKey: ['promotions'], queryFn: () => base44.entities.Promotion.list('-created_date', 100) });
  const createPromo = useMutation({
    mutationFn: d => base44.entities.Promotion.create(d),
    onSuccess: () => { qc.invalidateQueries(['promotions']); toast.success('Promotion created'); setDialog(false); }
  });
  const updatePromo = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Promotion.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['promotions']); toast.success('Promotion updated'); setDialog(false); setEditing(null); }
  });
  const deletePromo = useMutation({
    mutationFn: id => base44.entities.Promotion.delete(id),
    onSuccess: () => { qc.invalidateQueries(['promotions']); toast.success('Promotion deleted'); }
  });

  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const blank = { code: '', title: '', discount_type: 'percentage', discount_value: '', min_order_value: '', max_discount: '', valid_from: '', valid_until: '', usage_limit: '', is_active: true };
  const [form, setForm] = useState(blank);

  const openNew = () => { setEditing(null); setForm(blank); setDialog(true); };
  const openEdit = p => { setEditing(p); setForm({ code: p.code, title: p.title, discount_type: p.discount_type, discount_value: p.discount_value || '', min_order_value: p.min_order_value || '', max_discount: p.max_discount || '', valid_from: p.valid_from || '', valid_until: p.valid_until || '', usage_limit: p.usage_limit || '', is_active: !!p.is_active }); setDialog(true); };

  const handleSave = () => {
    if (!form.code || !form.title || !form.discount_value) return toast.error('Code, title and discount value are required');
    const data = { ...form, discount_value: +form.discount_value, min_order_value: +form.min_order_value || 0, max_discount: +form.max_discount || 0, usage_limit: +form.usage_limit || 0, current_usage: editing?.current_usage || 0 };
    if (editing) updatePromo.mutate({ id: editing.id, data });
    else createPromo.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-700">Coupons & Promotions ({promos.length})</h3>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> New Coupon</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Min Order</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Active</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promos.map(p => (
            <TableRow key={p.id}>
              <TableCell><span className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">{p.code}</span></TableCell>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell>{p.discount_type === 'percentage' ? `${p.discount_value}%` : `$${p.discount_value}`}</TableCell>
              <TableCell>{p.min_order_value ? `$${p.min_order_value}` : '—'}</TableCell>
              <TableCell className="text-slate-500">{p.current_usage || 0} / {p.usage_limit || '∞'}</TableCell>
              <TableCell className="text-slate-500 text-sm">{p.valid_until || '—'}</TableCell>
              <TableCell><Switch checked={!!p.is_active} onCheckedChange={v => updatePromo.mutate({ id: p.id, data: { is_active: v } })} /></TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deletePromo.mutate(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {promos.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No promotions yet</TableCell></TableRow>}
        </TableBody>
      </Table>

      <Dialog open={dialog} onOpenChange={v => { setDialog(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Coupon</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" className="mt-1 font-mono" /></div>
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="20% off all services" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Discount Type</Label>
                <Select value={form.discount_type} onValueChange={v => setForm(f => ({ ...f, discount_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Discount Value *</Label><Input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Min Order Value ($)</Label><Input type="number" value={form.min_order_value} onChange={e => setForm(f => ({ ...f, min_order_value: e.target.value }))} className="mt-1" /></div>
              <div><Label>Max Discount ($)</Label><Input type="number" value={form.max_discount} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))} className="mt-1" placeholder="Leave blank for no cap" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valid From</Label><Input type="date" value={form.valid_from} onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))} className="mt-1" /></div>
              <div><Label>Valid Until</Label><Input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label>Usage Limit (0 = unlimited)</Label><Input type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} className="mt-1 w-40" /></div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleSave}>
              {editing ? 'Update' : 'Create'} Coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Push Notifications ──
function PushNotificationsSection({ users, providers }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', message: '', audience: 'all_customers', type: 'promotion_alert' });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.title || !form.message) return toast.error('Title and message are required');
    setSending(true);
    const recipients = form.audience === 'all_customers' ? users
      : form.audience === 'all_providers' ? providers
      : [...users, ...providers];

    const notifications = recipients.slice(0, 100).map(r => ({
      recipient_email: r.email,
      recipient_type: r.business_name ? 'provider' : 'customer',
      type: form.type,
      title: form.title,
      message: form.message,
      channels: ['push'],
      is_read: false,
      sent_at: new Date().toISOString()
    }));

    await Promise.all(notifications.map(n => base44.entities.Notification.create(n)));
    setSending(false);
    toast.success(`Notification sent to ${notifications.length} recipients`);
    setForm({ title: '', message: '', audience: 'all_customers', type: 'promotion_alert' });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-700">Send Push Notification</h3>
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={v => setForm(f => ({ ...f, audience: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_customers">All Customers ({users.length})</SelectItem>
                  <SelectItem value="all_providers">All Providers ({providers.length})</SelectItem>
                  <SelectItem value="everyone">Everyone ({users.length + providers.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notification Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotion_alert">Promotion Alert</SelectItem>
                  <SelectItem value="booking_confirmed">Booking Update</SelectItem>
                  <SelectItem value="payment_received">Payment Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="🎉 Special Offer Just for You!" className="mt-1" />
          </div>
          <div>
            <Label>Message *</Label>
            <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Get 20% off on all home services this weekend..." className="mt-1" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleSend} disabled={sending}>
            <Bell className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : `Send to ${form.audience === 'all_customers' ? users.length : form.audience === 'all_providers' ? providers.length : users.length + providers.length} recipients`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Featured Services ──
function FeaturedServicesSection({ services, providers, categories }) {
  const qc = useQueryClient();
  const updateService = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => qc.invalidateQueries(['allServices'])
  });

  const featured = services.filter(s => s.is_featured);
  const notFeatured = services.filter(s => !s.is_featured && s.is_active);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-700">Featured Services Management</h3>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold text-amber-600 flex items-center gap-2"><Star className="w-4 h-4" /> Currently Featured ({featured.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {featured.map(s => {
              const prov = providers.find(p => p.id === s.provider_id);
              return (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-slate-500">{prov?.business_name} · ${s.price}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => updateService.mutate({ id: s.id, data: { is_featured: false } })}>Remove</Button>
                </div>
              );
            })}
            {featured.length === 0 && <p className="text-slate-400 text-sm py-2">No featured services yet</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold text-slate-600">Add to Featured</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {notFeatured.map(s => {
              const prov = providers.find(p => p.id === s.provider_id);
              return (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-slate-500">{prov?.business_name} · ${s.price}</p>
                  </div>
                  <Button size="sm" className="h-7 text-xs bg-amber-500 hover:bg-amber-600"
                    onClick={() => updateService.mutate({ id: s.id, data: { is_featured: true } })}>
                    <Star className="w-3 h-3 mr-1" /> Feature
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Banner / Ads Management ──
function BannersSection() {
  const blankBanner = { title: '', subtitle: '', cta_text: 'Book Now', cta_url: '/', image_url: '', bg_color: '#cb3c7a', position: 'home_top', is_active: true };
  const [banners, setBanners] = useState([
    { id: 1, title: '20% Off This Weekend', subtitle: 'On all cleaning services', cta_text: 'Book Now', cta_url: '/', image_url: '', bg_color: '#cb3c7a', position: 'home_top', is_active: true },
    { id: 2, title: 'New Providers in Your Area', subtitle: 'Check out the latest additions', cta_text: 'Browse', cta_url: '/Browse', image_url: '', bg_color: '#7c3aed', position: 'home_mid', is_active: false },
  ]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankBanner);
  const [dialog, setDialog] = useState(false);

  const openNew = () => { setEditing(null); setForm(blankBanner); setDialog(true); };
  const openEdit = b => { setEditing(b); setForm({ ...b }); setDialog(true); };
  const handleSave = () => {
    if (!form.title) return toast.error('Title is required');
    if (editing) {
      setBanners(bs => bs.map(b => b.id === editing.id ? { ...b, ...form } : b));
      toast.success('Banner updated');
    } else {
      setBanners(bs => [...bs, { id: Date.now(), ...form }]);
      toast.success('Banner created');
    }
    setDialog(false); setEditing(null);
  };

  const positions = { home_top: 'Home Top', home_mid: 'Home Middle', browse_top: 'Browse Top', sidebar: 'Sidebar' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-700">Ads & Banner Management ({banners.length})</h3>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> New Banner</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {banners.map(b => (
          <Card key={b.id} className={!b.is_active ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="rounded-lg p-3 mb-3 text-white text-sm" style={{ background: b.bg_color }}>
                <p className="font-bold">{b.title}</p>
                <p className="opacity-80 text-xs">{b.subtitle}</p>
                <span className="inline-block mt-1 bg-white/20 px-2 py-0.5 rounded text-xs">{b.cta_text}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-xs">{positions[b.position] || b.position}</Badge>
                  <Badge variant={b.is_active ? 'default' : 'secondary'} className={`ml-1 text-xs ${b.is_active ? 'bg-emerald-600' : ''}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, is_active: !x.is_active } : x))}>
                    <Switch checked={b.is_active} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setBanners(bs => bs.filter(x => x.id !== b.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialog} onOpenChange={v => { setDialog(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Banner</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1" /></div>
            <div><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CTA Text</Label><Input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} className="mt-1" /></div>
              <div><Label>CTA URL</Label><Input value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label>Image URL (optional)</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Position</Label>
                <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(positions).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border" />
                <Label>Background</Label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleSave}>{editing ? 'Update' : 'Create'} Banner</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MarketingTab({ users, providers, services, categories }) {
  return (
    <Tabs defaultValue="coupons">
      <TabsList className="mb-4 bg-slate-100">
        <TabsTrigger value="coupons" className="text-xs"><Tag className="w-3.5 h-3.5 mr-1" />Coupons</TabsTrigger>
        <TabsTrigger value="push" className="text-xs"><Bell className="w-3.5 h-3.5 mr-1" />Push Notifications</TabsTrigger>
        <TabsTrigger value="featured" className="text-xs"><Star className="w-3.5 h-3.5 mr-1" />Featured Services</TabsTrigger>
        <TabsTrigger value="banners" className="text-xs"><Image className="w-3.5 h-3.5 mr-1" />Ads & Banners</TabsTrigger>
      </TabsList>
      <TabsContent value="coupons"><CouponsSection /></TabsContent>
      <TabsContent value="push"><PushNotificationsSection users={users} providers={providers} /></TabsContent>
      <TabsContent value="featured"><FeaturedServicesSection services={services} providers={providers} categories={categories} /></TabsContent>
      <TabsContent value="banners"><BannersSection /></TabsContent>
    </Tabs>
  );
}