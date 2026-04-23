import React, { useState, useMemo } from 'react';
import { supabase } from '@/api/supabase';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  LayoutDashboard, Users, Building2, ShoppingCart, DollarSign, TrendingUp,
  BadgeCheck, Trash2, Edit, Search, Star, Package, Settings, Shield,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, BarChart2, Bell, LogOut,
  ChevronRight, Menu, X, Eye, EyeOff, Lock, Mail, Globe, FileText,
  UserPlus, AlertTriangle, Activity, Zap, Clock, MapPin, Phone, ExternalLink,
  TrendingDown, Filter, MoreVertical, Ban, Check, Loader2, ChevronDown, Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { Toaster } from "@/components/ui/sonner";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Theme constants ──────────────────────────────────────────────────────────
const DARK = '#0f0900';
const CARD = '#140b00';
const PINK = '#cb3c7a';
const CYAN = '#fbbf24';
const BORDER = 'rgba(255,255,255,0.08)';
const MUTED = 'rgba(255,255,255,0.45)';

// ─── Sidebar navigation ───────────────────────────────────────────────────────
const SIDEBAR = [
  { id: 'overview',    label: 'Overview',         icon: LayoutDashboard, group: null },
  { id: 'providers',   label: 'Providers',         icon: Building2,       group: 'Management' },
  { id: 'verification',label: 'Verification',      icon: BadgeCheck,      group: 'Management' },
  { id: 'services',    label: 'Services',          icon: Package,         group: 'Management' },
  { id: 'bookings',    label: 'Bookings',          icon: ShoppingCart,    group: 'Management' },
  { id: 'reviews',     label: 'Reviews',           icon: Star,            group: 'Management' },
  { id: 'users',       label: 'Users',             icon: Users,           group: 'Management' },
  { id: 'analytics',   label: 'Analytics',         icon: BarChart2,       group: 'Insights' },
  { id: 'seo',         label: 'SEO',               icon: Globe,           group: 'Insights' },
  { id: 'moderation',  label: 'Content Safety',    icon: Shield,          group: 'Insights' },
  { id: 'settings',    label: 'Admin Settings',    icon: Settings,        group: 'System' },
];

// ─── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:     { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b',  label: 'Pending' },
    confirmed:   { bg: 'rgba(59,130,246,0.15)',  color: '#3b82f6',  label: 'Confirmed' },
    in_progress: { bg: 'rgba(239,68,68,0.15)',  color: '#8b5cf6',  label: 'In Progress' },
    completed:   { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  label: 'Completed' },
    cancelled:   { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444',  label: 'Cancelled' },
    active:      { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  label: 'Active' },
    suspended:   { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444',  label: 'Suspended' },
    approved:    { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  label: 'Approved' },
    rejected:    { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444',  label: 'Rejected' },
  };
  const s = map[status] || { bg: 'rgba(255,255,255,0.08)', color: MUTED, label: status };
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}22` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>}
    </div>
  );
}

// ─── Admin Login Screen ────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      // auth state change will trigger re-render
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a0c00 100%)` }}>
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: `linear-gradient(135deg, #ef4444, ${PINK})` }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Service Connect Pro</p>
        </div>
        <div className="rounded-2xl p-8" style={{ background: CARD, border: `1px solid rgba(203,60,122,0.2)` }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-white/70 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="admin@gmail.com"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-pink-500" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-white/70 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
                <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-pink-500" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full font-semibold text-white" style={{ background: PINK }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to Admin'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection({ providers, orders, users, services, reviews }) {
  const completed = orders.filter(o => o.status === 'completed');
  const revenue = completed.reduce((s, o) => s + (o.total_amount || 0), 0);
  const commission = completed.reduce((s, o) => s + (o.commission_amount || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const verified = providers.filter(p => p.is_verified).length;
  const unverified = providers.filter(p => !p.is_verified).length;

  // Monthly revenue data (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthLabel = format(d, 'MMM');
      const monthOrders = orders.filter(o => {
        if (!o.created_date) return false;
        const od = new Date(o.created_date);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() && o.status === 'completed';
      });
      return { month: monthLabel, revenue: monthOrders.reduce((s, o) => s + (o.total_amount || 0), 0), bookings: monthOrders.length };
    });
  }, [orders]);

  const serviceDistrib = useMemo(() => {
    const counts = {};
    orders.forEach(o => { if (o.service_name) counts[o.service_name] = (counts[o.service_name] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5).map(([name, value]) => ({ name: name.length > 16 ? name.slice(0,14)+'…' : name, value }));
  }, [orders]);

  const PIE_COLORS = [PINK, CYAN, '#f59e0b', '#10b981', '#8b5cf6'];

  const recent = [...orders].sort((a,b) => new Date(b.created_date||0) - new Date(a.created_date||0)).slice(0,5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${revenue.toLocaleString()}`} sub={`$${commission.toFixed(0)} commission`} icon={DollarSign} color={PINK} trend={12} />
        <StatCard label="Total Providers" value={providers.length} sub={`${verified} verified · ${unverified} pending`} icon={Building2} color="#8b5cf6" trend={8} />
        <StatCard label="Total Bookings" value={orders.length} sub={`${pending} pending`} icon={ShoppingCart} color={CYAN} trend={5} />
        <StatCard label="Active Users" value={users.length} sub={`${services.length} services listed`} icon={Users} color="#10b981" trend={15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="text-sm font-semibold text-white mb-4">Revenue & Bookings (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a3e', border: `1px solid ${PINK}`, borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="revenue" fill={PINK} radius={[4,4,0,0]} name="Revenue ($)" />
              <Bar dataKey="bookings" fill={CYAN} radius={[4,4,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="text-sm font-semibold text-white mb-4">Top Services</h3>
          {serviceDistrib.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={serviceDistrib} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {serviceDistrib.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a3e', border: `1px solid ${PINK}`, borderRadius: 8, color: '#fff' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: MUTED }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center" style={{ color: MUTED }}>No data yet</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-semibold text-white mb-4">Recent Bookings</h3>
        <div className="space-y-2">
          {recent.length === 0 && <p className="text-sm" style={{ color: MUTED }}>No bookings yet.</p>}
          {recent.map(o => (
            <div key={o.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <p className="text-sm font-medium text-white">{o.customer_name || 'Customer'}</p>
                <p className="text-xs" style={{ color: MUTED }}>{o.service_name || 'Service'} · {o.created_date ? format(new Date(o.created_date), 'MMM d, yyyy') : '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">${o.total_amount || 0}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Providers Section ────────────────────────────────────────────────────────
function ProvidersSection({ providers, updateProvider, deleteProvider }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const filtered = providers.filter(p => {
    const matchSearch = !search || p.business_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'verified' && p.is_verified) || (filter === 'unverified' && !p.is_verified) || (filter === 'suspended' && p.is_suspended);
    return matchSearch && matchFilter;
  });

  const openEdit = (p) => { setEditing(p); setForm({ business_name: p.business_name, email: p.email, location: p.location || '', hourly_rate: p.hourly_rate || '', is_verified: p.is_verified, is_featured: p.is_featured }); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search providers…"
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white"
            style={{ background: CARD, border: `1px solid ${BORDER}`, outline: 'none' }} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm text-white"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <option value="all">All Providers</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm">
          <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
            <tr>
              {['Provider', 'Location', 'Rating', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: MUTED }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: MUTED }}>No providers found</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, #ef4444, ${PINK})` }}>
                      {p.business_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{p.business_name}</p>
                      <p className="text-xs" style={{ color: MUTED }}>{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60">{p.location || '—'}</td>
                <td className="px-4 py-3">
                  {p.rating > 0 ? (
                    <span className="flex items-center gap-1 text-amber-400 font-medium">★ {p.rating?.toFixed(1)}</span>
                  ) : <span style={{ color: MUTED }}>—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {p.is_verified && <StatusBadge status="approved" />}
                    {p.is_suspended && <StatusBadge status="suspended" />}
                    {!p.is_verified && !p.is_suspended && <StatusBadge status="pending" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: CYAN }} title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => updateProvider.mutate({ id: p.id, data: { is_verified: !p.is_verified } })}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: p.is_verified ? '#f59e0b' : '#10b981' }} title={p.is_verified ? 'Remove badge' : 'Verify'}>
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => updateProvider.mutate({ id: p.id, data: { is_suspended: !p.is_suspended } })}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: p.is_suspended ? '#10b981' : '#f59e0b' }} title={p.is_suspended ? 'Unsuspend' : 'Suspend'}>
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if(confirm('Remove this provider?')) deleteProvider.mutate(p.id); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-red-400" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={v => !v && setEditing(null)}>
        <DialogContent style={{ background: CARD, border: `1px solid rgba(203,60,122,0.3)`, color: '#fff' }}>
          <DialogHeader><DialogTitle className="text-white">Edit Provider</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[['business_name','Business Name','text'],['email','Email','email'],['location','Location','text'],['hourly_rate','Hourly Rate','number']].map(([key,label,type]) => (
              <div key={key} className="space-y-1">
                <Label className="text-white/70 text-sm">{label}</Label>
                <Input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white" />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={!!form.is_verified} onCheckedChange={v => setForm(f => ({ ...f, is_verified: v }))} />
                <Label className="text-white/70 text-sm">Verified</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
                <Label className="text-white/70 text-sm">Featured</Label>
              </div>
            </div>
            <Button onClick={() => { updateProvider.mutate({ id: editing.id, data: form }); setEditing(null); }}
              className="w-full text-white" style={{ background: PINK }}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Verification Section ──────────────────────────────────────────────────────
function VerificationSection({ providers, updateProvider }) {
  const pending = providers.filter(p => !p.is_verified && !p.is_suspended);
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-300">{pending.length} provider{pending.length !== 1 ? 's' : ''} awaiting verification review.</p>
      </div>

      {pending.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: '#10b981' }} />
          <p className="text-white font-medium">All caught up!</p>
          <p className="text-sm mt-1" style={{ color: MUTED }}>No pending verification requests.</p>
        </div>
      )}

      <div className="grid gap-3">
        {pending.map(p => (
          <div key={p.id} className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, #ef4444, ${PINK})` }}>
                  {p.business_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{p.business_name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>{p.email} · {p.location || 'No location'}</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>
                    {p.experience_years > 0 && `${p.experience_years}+ yrs exp · `}
                    {p.hourly_rate && `$${p.hourly_rate}/hr · `}
                    {p.service_categories?.join(', ') || 'No category'}
                  </p>
                  {p.bio && <p className="text-xs mt-2 max-w-md" style={{ color: 'rgba(255,255,255,0.6)' }}>{p.bio.slice(0,120)}{p.bio.length > 120 ? '…' : ''}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => updateProvider.mutate({ id: p.id, data: { is_verified: true } })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                  style={{ background: '#10b981' }}>
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button onClick={() => updateProvider.mutate({ id: p.id, data: { is_suspended: true } })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Services Section ──────────────────────────────────────────────────────────
function ServicesSection({ services, updateService, deleteService }) {
  const [search, setSearch] = useState('');
  const filtered = services.filter(s => !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.provider_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services…"
          className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white"
          style={{ background: CARD, border: `1px solid ${BORDER}`, outline: 'none' }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm">
          <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
            <tr>
              {['Service', 'Provider', 'Price', 'Active', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: MUTED }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: MUTED }}>No services found</td></tr>}
            {filtered.map(s => (
              <tr key={s.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{s.title}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{s.category || '—'}</p>
                </td>
                <td className="px-4 py-3 text-white/60">{s.provider_name || '—'}</td>
                <td className="px-4 py-3 text-white font-medium">{s.price ? `$${s.price}` : '—'}</td>
                <td className="px-4 py-3">
                  <Switch checked={!!s.is_active} onCheckedChange={v => updateService.mutate({ id: s.id, data: { is_active: v } })} />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => { if(confirm('Delete this service?')) deleteService.mutate(s.id); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Bookings Section ──────────────────────────────────────────────────────────
function BookingsSection({ orders, updateOrder }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = orders.filter(o => {
    const ms = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.service_name?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === 'all' || o.status === statusFilter;
    return ms && mf;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings…"
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white"
            style={{ background: CARD, border: `1px solid ${BORDER}`, outline: 'none' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm text-white"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <option value="all">All Statuses</option>
          {['pending','confirmed','in_progress','completed','cancelled'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm">
          <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
            <tr>
              {['Order #', 'Customer', 'Service', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: MUTED }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: MUTED }}>No bookings found</td></tr>}
            {filtered.map(o => (
              <tr key={o.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td className="px-4 py-3 text-white font-mono text-xs">{o.order_number || o.id.slice(0,8)}</td>
                <td className="px-4 py-3 text-white">{o.customer_name || '—'}</td>
                <td className="px-4 py-3 text-white/60">{o.service_name || '—'}</td>
                <td className="px-4 py-3 text-white font-medium">${o.total_amount || 0}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-white/50 text-xs">{o.created_date ? format(new Date(o.created_date), 'MMM d, yy') : '—'}</td>
                <td className="px-4 py-3">
                  {o.status === 'pending' && (
                    <button onClick={() => updateOrder.mutate({ id: o.id, data: { status: 'confirmed' } })}
                      className="text-xs px-2 py-1 rounded-lg font-medium text-white" style={{ background: '#10b981' }}>Confirm</button>
                  )}
                  {['pending','confirmed','in_progress'].includes(o.status) && (
                    <button onClick={() => { if(confirm('Cancel and refund?')) updateOrder.mutate({ id: o.id, data: { status: 'cancelled', payment_status: 'refunded' } }); }}
                      className="text-xs px-2 py-1 rounded-lg font-medium ml-1" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reviews Section ───────────────────────────────────────────────────────────
function ReviewsSection({ reviews, deleteReview }) {
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  const filtered = reviews.filter(r => {
    const ms = !search || r.customer_name?.toLowerCase().includes(search.toLowerCase()) || r.comment?.toLowerCase().includes(search.toLowerCase());
    const mf = ratingFilter === 'all' || (ratingFilter === 'low' && r.rating <= 2) || (ratingFilter === 'high' && r.rating >= 4);
    return ms && mf;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews…"
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white"
            style={{ background: CARD, border: `1px solid ${BORDER}`, outline: 'none' }} />
        </div>
        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm text-white"
          style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <option value="all">All Ratings</option>
          <option value="low">Low (1-2 ★)</option>
          <option value="high">High (4-5 ★)</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="p-8 text-center rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-sm" style={{ color: MUTED }}>No reviews found.</p>
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">{r.customer_name || 'Customer'}</span>
                  <span className="text-amber-400 text-sm">{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</span>
                  {r.created_date && <span className="text-xs" style={{ color: MUTED }}>{format(new Date(r.created_date), 'MMM d, yyyy')}</span>}
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{r.comment || 'No comment'}</p>
                {r.provider_name && <p className="text-xs mt-1" style={{ color: MUTED }}>For: {r.provider_name}</p>}
              </div>
              {r.rating <= 2 && (
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>⚠ Low Rating</span>
              )}
              <button onClick={() => { if(confirm('Remove this review?')) deleteReview.mutate(r.id); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Users Section ─────────────────────────────────────────────────────────────
function UsersSection({ users, updateUser, deleteUser }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
          className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white"
          style={{ background: CARD, border: `1px solid ${BORDER}`, outline: 'none' }} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm">
          <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
            <tr>
              {['User', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: MUTED }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: MUTED }}>No users found</td></tr>}
            {filtered.map(u => (
              <tr key={u.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${PINK}, #ef4444)` }}>
                      {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{u.full_name || '—'}</p>
                      <p className="text-xs" style={{ color: MUTED }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select value={u.role || 'customer'}
                    onChange={e => updateUser.mutate({ id: u.id, data: { role: e.target.value } })}
                    className="text-xs px-2 py-1 rounded-lg text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${BORDER}` }}>
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-white/50 text-xs">{u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { if(confirm('Delete this user?')) deleteUser.mutate(u.id); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Analytics Section ─────────────────────────────────────────────────────────
function AnalyticsSection({ orders, providers, users, services }) {
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const label = format(d, 'MMM');
      const monthOrders = orders.filter(o => {
        if (!o.created_date) return false;
        const od = new Date(o.created_date);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      const completed = monthOrders.filter(o => o.status === 'completed');
      return {
        month: label,
        bookings: monthOrders.length,
        completed: completed.length,
        revenue: completed.reduce((s, o) => s + (o.total_amount || 0), 0),
      };
    });
  }, [orders]);

  const statusData = useMemo(() => {
    const counts = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('_',' '), value }));
  }, [orders]);

  const PIE_COLORS = [PINK, CYAN, '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={orders.length} icon={ShoppingCart} color={PINK} />
        <StatCard label="Completed" value={orders.filter(o=>o.status==='completed').length} icon={CheckCircle2} color="#10b981" />
        <StatCard label="Providers" value={providers.length} icon={Building2} color="#8b5cf6" />
        <StatCard label="Services" value={services.length} icon={Package} color={CYAN} />
      </div>

      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-semibold text-white mb-4">Monthly Bookings & Revenue (12 Months)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1a1a3e', border: `1px solid ${PINK}`, borderRadius: 8, color: '#fff' }} />
            <Legend wrapperStyle={{ color: MUTED, fontSize: 11 }} />
            <Line type="monotone" dataKey="bookings" stroke={CYAN} strokeWidth={2} dot={false} name="Bookings" />
            <Line type="monotone" dataKey="revenue" stroke={PINK} strokeWidth={2} dot={false} name="Revenue ($)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="text-sm font-semibold text-white mb-4">Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a3e', border: `1px solid ${PINK}`, borderRadius: 8, color: '#fff' }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: MUTED }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="text-sm font-semibold text-white mb-4">Provider Verification Stats</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { label: 'Verified', count: providers.filter(p=>p.is_verified).length },
              { label: 'Unverified', count: providers.filter(p=>!p.is_verified && !p.is_suspended).length },
              { label: 'Suspended', count: providers.filter(p=>p.is_suspended).length },
              { label: 'Featured', count: providers.filter(p=>p.is_featured).length },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a3e', border: `1px solid ${PINK}`, borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="count" fill={PINK} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── SEO Section ───────────────────────────────────────────────────────────────
function SEOSection() {
  const defaultPages = [
    { page: 'Home', title: 'Service Connect Pro - Find Top AI Service Providers', description: 'Connect with verified AI service providers. Get quotes, book services, and manage your projects all in one place.', keywords: 'AI services, service providers, freelance, AI marketplace', slug: '/' },
    { page: 'Browse', title: 'Browse AI Services & Providers | Service Connect Pro', description: 'Explore hundreds of AI services from verified providers. Filter by category, rating, price, and location.', keywords: 'browse services, AI providers, service marketplace', slug: '/browse' },
    { page: 'ProviderSignup', title: 'List Your AI Services | Become a Provider', description: 'Join Service Connect Pro as a service provider. Reach thousands of clients looking for AI expertise.', keywords: 'list services, become provider, AI freelancer', slug: '/provider-signup' },
    { page: 'Support', title: 'Support Center | Service Connect Pro', description: 'Get help with your bookings, account, and services. Contact our support team 24/7.', keywords: 'support, help, customer service', slug: '/support' },
  ];
  const [pages, setPages] = useState(defaultPages);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const openEdit = (p) => { setEditing(p); setForm({ ...p }); };
  const save = () => { setPages(prev => prev.map(p => p.page === editing.page ? form : p)); setEditing(null); toast.success('SEO settings saved!'); };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <p className="text-sm" style={{ color: CYAN }}>Manage page titles, meta descriptions, and keywords for better search engine visibility.</p>
      </div>

      <div className="space-y-3">
        {pages.map(p => (
          <div key={p.page} className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(203,60,122,0.15)', color: PINK }}>{p.page}</span>
                  <span className="text-xs font-mono" style={{ color: MUTED }}>{p.slug}</span>
                </div>
                <p className="font-medium text-white text-sm truncate">{p.title}</p>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.description}</p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>Keywords: {p.keywords}</p>
              </div>
              <button onClick={() => openEdit(p)} className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0" style={{ color: CYAN }}>
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={v => !v && setEditing(null)}>
        <DialogContent style={{ background: CARD, border: `1px solid rgba(203,60,122,0.3)`, color: '#fff' }}>
          <DialogHeader><DialogTitle className="text-white">Edit SEO — {editing?.page}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-white/70 text-sm">Page Title</Label>
              <Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-white/10 border-white/20 text-white" />
              <p className="text-xs" style={{ color: form.title?.length > 60 ? '#ef4444' : MUTED }}>{form.title?.length || 0}/60 chars</p>
            </div>
            <div className="space-y-1">
              <Label className="text-white/70 text-sm">Meta Description</Label>
              <Textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="bg-white/10 border-white/20 text-white" />
              <p className="text-xs" style={{ color: form.description?.length > 160 ? '#ef4444' : MUTED }}>{form.description?.length || 0}/160 chars</p>
            </div>
            <div className="space-y-1">
              <Label className="text-white/70 text-sm">Keywords (comma-separated)</Label>
              <Input value={form.keywords || ''} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} className="bg-white/10 border-white/20 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/70 text-sm">URL Slug</Label>
              <Input value={form.slug || ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="bg-white/10 border-white/20 text-white font-mono" />
            </div>
            <Button onClick={save} className="w-full text-white" style={{ background: PINK }}>Save SEO Settings</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Content Moderation Section ────────────────────────────────────────────────
function ModerationSection({ providers, reviews, updateProvider, deleteReview }) {
  const flaggedProviders = providers.filter(p => p.is_suspended || (p.rating > 0 && p.rating < 2));
  const flaggedReviews = reviews.filter(r => r.rating <= 1 || (r.comment && r.comment.length < 10));

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-red-400" />
          <p className="text-sm font-semibold text-red-400">Content Safety Monitor</p>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {flaggedProviders.length} flagged providers · {flaggedReviews.length} suspicious reviews
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Flagged / Suspended Providers</h3>
        {flaggedProviders.length === 0 && (
          <p className="text-sm py-4" style={{ color: MUTED }}>No flagged providers.</p>
        )}
        <div className="space-y-2">
          {flaggedProviders.map(p => (
            <div key={p.id} className="rounded-xl p-4 flex items-center justify-between gap-4"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div>
                <p className="font-medium text-white text-sm">{p.business_name}</p>
                <p className="text-xs" style={{ color: MUTED }}>{p.email} {p.rating > 0 && p.rating < 2 && `· Low rating: ${p.rating}`}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.is_suspended ? (
                  <button onClick={() => updateProvider.mutate({ id: p.id, data: { is_suspended: false } })}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ background: '#10b981' }}>
                    Reinstate
                  </button>
                ) : (
                  <button onClick={() => updateProvider.mutate({ id: p.id, data: { is_suspended: true } })}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Suspicious / Low-Quality Reviews</h3>
        {flaggedReviews.length === 0 && (
          <p className="text-sm py-4" style={{ color: MUTED }}>No suspicious reviews detected.</p>
        )}
        <div className="space-y-2">
          {flaggedReviews.map(r => (
            <div key={r.id} className="rounded-xl p-4 flex items-start justify-between gap-4"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">{r.customer_name || 'User'}</span>
                  <span className="text-amber-400 text-xs">{'★'.repeat(r.rating||0)}</span>
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{r.comment || 'No comment'}</p>
              </div>
              <button onClick={() => { if(confirm('Remove review?')) deleteReview.mutate(r.id); }}
                className="p-1.5 rounded-lg text-red-400 flex-shrink-0 hover:bg-white/10">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── US Provider seed data ────────────────────────────────────────────────────
const US_PROVIDERS = [
  { business_name: 'Elite AI Solutions', owner_name: 'James Carter', email: 'james@eliteai.us', location: 'New York, NY', hourly_rate: 120, rating: 4.9, total_reviews: 87, experience_years: 8, is_verified: true, is_active: true, is_featured: true, bio: 'Top-rated AI automation expert specializing in business process automation, LLM integration, and custom AI pipelines.', service_categories: ['AI & Automation'], category_id: 'ai-automation' },
  { business_name: 'Sparkle Clean Co.', owner_name: 'Maria Gonzalez', email: 'maria@sparkleclean.us', location: 'Los Angeles, CA', hourly_rate: 55, rating: 4.8, total_reviews: 132, experience_years: 6, is_verified: true, is_active: true, is_featured: false, bio: 'Professional residential and commercial cleaning services across Greater LA. Eco-friendly products only.', service_categories: ['Cleaning'], category_id: 'cleaning' },
  { business_name: 'ProPlumb Chicago', owner_name: 'Robert Williams', email: 'rob@proplumb.us', location: 'Chicago, IL', hourly_rate: 85, rating: 4.7, total_reviews: 204, experience_years: 12, is_verified: true, is_active: true, is_featured: true, bio: 'Licensed master plumber covering all Chicago suburbs. 24/7 emergency service available.', service_categories: ['Plumbing'], category_id: 'plumbing' },
  { business_name: 'DataPulse Analytics', owner_name: 'Sarah Chen', email: 'sarah@datapulse.us', location: 'San Francisco, CA', hourly_rate: 145, rating: 5.0, total_reviews: 43, experience_years: 7, is_verified: true, is_active: true, is_featured: true, bio: 'Data science and ML engineering services. Specializing in predictive models, dashboards, and ETL pipelines.', service_categories: ['Data Science'], category_id: 'data-science' },
  { business_name: 'Volt Electric Houston', owner_name: 'Marcus Johnson', email: 'marcus@voltelectric.us', location: 'Houston, TX', hourly_rate: 95, rating: 4.6, total_reviews: 178, experience_years: 15, is_verified: true, is_active: true, is_featured: false, bio: 'Licensed electrician in Texas. Residential wiring, panel upgrades, EV charger installs, and commercial electrical.', service_categories: ['Electrical'], category_id: 'electrical' },
  { business_name: 'Pixel Perfect Web', owner_name: 'Ashley Thompson', email: 'ashley@pixelperfect.us', location: 'Austin, TX', hourly_rate: 110, rating: 4.8, total_reviews: 91, experience_years: 9, is_verified: true, is_active: true, is_featured: true, bio: 'Full-stack web development specializing in React, Next.js, and Tailwind CSS. Beautiful, fast, and SEO-optimized websites.', service_categories: ['Web Development'], category_id: 'web-development' },
  { business_name: 'Gourmet Catering by Sofia', owner_name: 'Sofia Ramirez', email: 'sofia@gourmetcatering.us', location: 'Miami, FL', hourly_rate: 75, rating: 4.9, total_reviews: 67, experience_years: 11, is_verified: true, is_active: true, is_featured: false, bio: 'Corporate events, weddings, and private dinners. Authentic Latin and international fusion cuisine.', service_categories: ['Catering'], category_id: 'catering' },
  { business_name: 'MindBridge Tutors', owner_name: 'David Park', email: 'david@mindbridge.us', location: 'Seattle, WA', hourly_rate: 65, rating: 4.7, total_reviews: 115, experience_years: 5, is_verified: true, is_active: true, is_featured: false, bio: 'SAT/ACT prep, math, science, and coding tutoring for K-12 and college students. Online and in-person.', service_categories: ['Tutoring'], category_id: 'tutoring' },
  { business_name: 'SwiftMove Logistics', owner_name: 'Tyler Brooks', email: 'tyler@swiftmove.us', location: 'Dallas, TX', hourly_rate: 80, rating: 4.5, total_reviews: 289, experience_years: 7, is_verified: true, is_active: true, is_featured: true, bio: 'Residential and commercial movers. Local and long-distance. Packing, storage, and specialty item handling.', service_categories: ['Moving & Delivery'], category_id: 'moving' },
  { business_name: 'LensArt Photography', owner_name: 'Emma Wilson', email: 'emma@lensart.us', location: 'Nashville, TN', hourly_rate: 150, rating: 5.0, total_reviews: 58, experience_years: 10, is_verified: true, is_active: true, is_featured: true, bio: 'Award-winning photographer specializing in weddings, portraits, and corporate events across the Southeast.', service_categories: ['Photography'], category_id: 'photography' },
  { business_name: 'NeuralBuild AI', owner_name: 'Kevin Zhang', email: 'kevin@neuralbuild.us', location: 'San Jose, CA', hourly_rate: 160, rating: 4.9, total_reviews: 34, experience_years: 6, is_verified: true, is_active: true, is_featured: true, bio: 'Custom LLM applications, RAG systems, AI agents, and enterprise automation. Python and cloud-native.', service_categories: ['AI & Automation'], category_id: 'ai-automation' },
  { business_name: 'Green Clean Denver', owner_name: 'Jessica Miller', email: 'jessica@greenclean.us', location: 'Denver, CO', hourly_rate: 50, rating: 4.6, total_reviews: 97, experience_years: 4, is_verified: true, is_active: true, is_featured: false, bio: '100% eco-friendly residential cleaning. Non-toxic products, locally sourced. Serving Denver metro area.', service_categories: ['Cleaning'], category_id: 'cleaning' },
  { business_name: 'Bright Spark Electric', owner_name: 'Chris Anderson', email: 'chris@brightspark.us', location: 'Phoenix, AZ', hourly_rate: 88, rating: 4.7, total_reviews: 143, experience_years: 13, is_verified: true, is_active: true, is_featured: false, bio: 'Fully licensed AZ electrician. Smart home wiring, solar panel connections, and commercial electrical services.', service_categories: ['Electrical'], category_id: 'electrical' },
  { business_name: 'CodeCraft Studio', owner_name: 'Amanda Lee', email: 'amanda@codecraft.us', location: 'Portland, OR', hourly_rate: 115, rating: 4.8, total_reviews: 72, experience_years: 8, is_verified: true, is_active: true, is_featured: false, bio: 'Web and mobile app development. Vue.js, React Native, Node.js. Startups to enterprise.', service_categories: ['Web Development'], category_id: 'web-development' },
  { business_name: 'Premier Plumbing ATL', owner_name: 'Derek Harris', email: 'derek@premierplumb.us', location: 'Atlanta, GA', hourly_rate: 90, rating: 4.5, total_reviews: 161, experience_years: 10, is_verified: false, is_active: true, is_featured: false, bio: 'Full-service plumbing company in Atlanta. Water heaters, drain cleaning, leak detection, and bathroom remodels.', service_categories: ['Plumbing'], category_id: 'plumbing' },
  { business_name: 'Insight Data Labs', owner_name: 'Rachel Kim', email: 'rachel@insightdata.us', location: 'Boston, MA', hourly_rate: 135, rating: 4.9, total_reviews: 29, experience_years: 9, is_verified: true, is_active: true, is_featured: true, bio: 'Advanced analytics, A/B testing frameworks, and BI dashboard development for SaaS companies.', service_categories: ['Data Science'], category_id: 'data-science' },
  { business_name: 'Tasteful Events Catering', owner_name: 'Luis Hernandez', email: 'luis@tastefulevents.us', location: 'San Antonio, TX', hourly_rate: 70, rating: 4.6, total_reviews: 84, experience_years: 8, is_verified: true, is_active: true, is_featured: false, bio: 'Full-service catering for corporate, wedding, and social events. Tex-Mex, BBQ, and American cuisine specialists.', service_categories: ['Catering'], category_id: 'catering' },
  { business_name: 'Snap & Story Media', owner_name: 'Nicole Foster', email: 'nicole@snapstory.us', location: 'Los Angeles, CA', hourly_rate: 140, rating: 4.8, total_reviews: 46, experience_years: 7, is_verified: true, is_active: true, is_featured: false, bio: 'Commercial photography and videography. Brand shoots, product photography, social media content creation.', service_categories: ['Photography'], category_id: 'photography' },
  { business_name: 'AcademiaPro Tutors', owner_name: 'Michael Brown', email: 'michael@academiapro.us', location: 'Philadelphia, PA', hourly_rate: 60, rating: 4.7, total_reviews: 138, experience_years: 6, is_verified: true, is_active: true, is_featured: false, bio: 'Expert tutoring in math, science, English, and test prep. College application essay coaching available.', service_categories: ['Tutoring'], category_id: 'tutoring' },
  { business_name: 'Atlas Moving Group', owner_name: 'Brian Scott', email: 'brian@atlasmoving.us', location: 'Charlotte, NC', hourly_rate: 75, rating: 4.5, total_reviews: 217, experience_years: 9, is_verified: false, is_active: true, is_featured: false, bio: 'Affordable, professional movers. Full-service packing, furniture assembly, and storage options.', service_categories: ['Moving & Delivery'], category_id: 'moving' },
];

// ─── Settings Section ──────────────────────────────────────────────────────────
function SettingsSection({ user, users, updateUser, onSeedComplete }) {
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState({ done: 0, total: 0 });

  const admins = users.filter(u => u.role === 'admin');

  const handleSeedUSProviders = async () => {
    if (!confirm(`This will insert ${US_PROVIDERS.length} realistic US service providers into your database. Continue?`)) return;
    setSeeding(true);
    setSeedProgress({ done: 0, total: US_PROVIDERS.length });
    let done = 0;
    for (const p of US_PROVIDERS) {
      try {
        await base44.entities.ServiceProvider.create({ ...p, total_orders: Math.floor(Math.random() * 50) + 5 });
        done++;
        setSeedProgress({ done, total: US_PROVIDERS.length });
      } catch (err) {
        console.error('Failed to insert', p.business_name, err.message);
      }
    }
    setSeeding(false);
    setSeedProgress({ done: 0, total: 0 });
    toast.success(`✅ Seeded ${done} US providers! Refresh Browse to see them.`);
    if (onSeedComplete) onSeedComplete();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success('Password changed!'); setNewPassword(''); setConfirmPassword(''); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Lock className="w-4 h-4" style={{ color: PINK }} /> Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-white/70 text-sm">New Password</Label>
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                placeholder="Minimum 6 characters" className="pr-10 bg-white/10 border-white/20 text-white" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-white/70 text-sm">Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              placeholder="Repeat new password" className="bg-white/10 border-white/20 text-white" />
          </div>
          <Button type="submit" disabled={saving} className="text-white" style={{ background: PINK }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </Button>
        </form>
      </div>

      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4" style={{ color: PINK }} /> Admin Users</h3>
        <div className="space-y-2 mb-4">
          {admins.length === 0 && <p className="text-sm" style={{ color: MUTED }}>No admin users found.</p>}
          {admins.map(u => (
            <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div>
                <p className="text-sm font-medium text-white">{u.full_name || '—'}</p>
                <p className="text-xs" style={{ color: MUTED }}>{u.email}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(203,60,122,0.15)', color: PINK }}>Admin</span>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: MUTED }}>To add admins, update a user's role to "Admin" in the Users section.</p>
      </div>

      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4" style={{ color: PINK }} /> Platform Info</h3>
        <div className="space-y-2 text-sm">
          {[
            ['Admin Email', user?.email],
            ['Admin Role', user?.role],
            ['Platform', 'Service Connect Pro'],
            ['Version', '2.0.0'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ color: MUTED }}>{label}</span>
              <span className="text-white font-medium">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)' }}>
        <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: CYAN }} /> Seed US Provider Data
        </h3>
        <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Populate the platform with {US_PROVIDERS.length} realistic US-based service providers across New York, Los Angeles, Chicago, San Francisco, Austin, Miami, Seattle, Dallas, and more.
        </p>
        {seeding && seedProgress.total > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1" style={{ color: MUTED }}>
              <span>Inserting providers…</span>
              <span>{seedProgress.done} / {seedProgress.total}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(seedProgress.done / seedProgress.total) * 100}%`, background: CYAN }} />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {['New York, NY','Los Angeles, CA','Chicago, IL','San Francisco, CA','Austin, TX','Miami, FL','Seattle, WA','Dallas, TX','Denver, CO','Nashville, TN'].map(city => (
            <span key={city} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: CYAN, border: '1px solid rgba(251,191,36,0.2)' }}>{city}</span>
          ))}
        </div>
        <Button onClick={handleSeedUSProviders} disabled={seeding}
          className="font-semibold text-white flex items-center gap-2"
          style={{ background: seeding ? 'rgba(251,191,36,0.3)' : CYAN, color: seeding ? MUTED : '#0f0900' }}>
          {seeding ? <><Loader2 className="w-4 h-4 animate-spin" /> Seeding…</> : <><Plus className="w-4 h-4" /> Seed {US_PROVIDERS.length} US Providers</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Main AdminDashboard Component ─────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, isLoadingAuth, logout } = useAuth();
  const [section, setSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: providers = [] } = useQuery({ queryKey: ['adminProviders'], queryFn: () => base44.entities.ServiceProvider.list() });
  const { data: orders = [] } = useQuery({ queryKey: ['adminOrders'], queryFn: () => base44.entities.Order.list() });
  const { data: services = [] } = useQuery({ queryKey: ['adminServices'], queryFn: () => base44.entities.Service.list() });
  const { data: users = [] } = useQuery({ queryKey: ['adminUsers'], queryFn: () => base44.entities.User.list() });
  const { data: reviews = [] } = useQuery({ queryKey: ['adminReviews'], queryFn: () => base44.entities.Review.list() });

  const updateProvider = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceProvider.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['adminProviders']); toast.success('Provider updated'); }
  });
  const deleteProvider = useMutation({
    mutationFn: (id) => base44.entities.ServiceProvider.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminProviders']); toast.success('Provider removed'); }
  });
  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['adminOrders']); toast.success('Order updated'); }
  });
  const updateService = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['adminServices'])
  });
  const deleteService = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminServices']); toast.success('Service removed'); }
  });
  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['adminUsers']); toast.success('User updated'); }
  });
  const deleteUser = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminUsers']); toast.success('User deleted'); }
  });
  const deleteReview = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminReviews']); toast.success('Review removed'); }
  });

  const pendingVerification = providers.filter(p => !p.is_verified && !p.is_suspended).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const SECTION_LABELS = Object.fromEntries(SIDEBAR.map(s => [s.id, s.label]));

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: DARK }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PINK }} />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <AdminLogin />;
  }

  const groups = [...new Set(SIDEBAR.map(s => s.group))];

  const renderContent = () => {
    switch (section) {
      case 'overview': return <OverviewSection providers={providers} orders={orders} users={users} services={services} reviews={reviews} />;
      case 'providers': return <ProvidersSection providers={providers} updateProvider={updateProvider} deleteProvider={deleteProvider} />;
      case 'verification': return <VerificationSection providers={providers} updateProvider={updateProvider} />;
      case 'services': return <ServicesSection services={services} updateService={updateService} deleteService={deleteService} />;
      case 'bookings': return <BookingsSection orders={orders} updateOrder={updateOrder} />;
      case 'reviews': return <ReviewsSection reviews={reviews} deleteReview={deleteReview} />;
      case 'users': return <UsersSection users={users} updateUser={updateUser} deleteUser={deleteUser} />;
      case 'analytics': return <AnalyticsSection orders={orders} providers={providers} users={users} services={services} />;
      case 'seo': return <SEOSection />;
      case 'moderation': return <ModerationSection providers={providers} reviews={reviews} updateProvider={updateProvider} deleteReview={deleteReview} />;
      case 'settings': return <SettingsSection user={user} users={users} updateUser={updateUser} onSeedComplete={() => queryClient.invalidateQueries(['adminProviders'])} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: DARK, color: '#fff' }}>
      <Toaster position="top-right" />
      <style>{`
        :root { --kcf-dark: #0f0900; --kcf-card: #140b00; --kcf-pink: #cb3c7a; }
        * { box-sizing: border-box; }
        select option { background: #140b00; color: #fff; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: CARD, borderRight: `1px solid ${BORDER}` }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #ef4444, ${PINK})` }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-xs" style={{ color: MUTED }}>Service Connect Pro</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {groups.map(group => (
            <div key={group || 'root'} className="mb-4">
              {group && <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{group}</p>}
              {SIDEBAR.filter(s => s.group === group).map(({ id, label, icon: Icon }) => {
                const badge = id === 'verification' ? pendingVerification : id === 'bookings' ? pendingOrders : 0;
                const active = section === id;
                return (
                  <button key={id} onClick={() => { setSection(id); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all"
                    style={{ background: active ? `rgba(203,60,122,0.15)` : 'transparent', color: active ? PINK : 'rgba(255,255,255,0.6)' }}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium flex-1">{label}</span>
                    {badge > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold text-white min-w-[20px] text-center"
                        style={{ background: PINK }}>{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${PINK}, #ef4444)` }}>
              {(user.full_name || user.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name || 'Admin'}</p>
              <p className="text-xs truncate" style={{ color: MUTED }}>{user.email}</p>
            </div>
            <button onClick={() => logout()} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: MUTED }} title="Logout">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 h-16 flex-shrink-0"
          style={{ background: 'rgba(15,9,0,0.95)', borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors">
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white">{SECTION_LABELS[section] || 'Dashboard'}</h1>
              <p className="text-xs hidden sm:block" style={{ color: MUTED }}>Admin Dashboard · Service Connect Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('Home')} target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors hover:bg-white/10"
              style={{ color: MUTED, border: `1px solid ${BORDER}` }}>
              <ExternalLink className="w-3.5 h-3.5" /> View Site
            </Link>
            <button onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
