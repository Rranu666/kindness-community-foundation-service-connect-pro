import React, { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, Package, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = ['#7c3aed', '#e8356d', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}% vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Sales Report ──
function SalesReport({ orders }) {
  const [period, setPeriod] = useState('30');

  const days = parseInt(period);
  const cutoff = subDays(new Date(), days);

  const periodOrders = useMemo(() =>
    orders.filter(o => o.created_date && new Date(o.created_date) >= cutoff),
    [orders, period]
  );

  const completed = periodOrders.filter(o => o.status === 'completed');
  const revenue = completed.reduce((s, o) => s + (o.total_amount || 0), 0);
  const commission = completed.reduce((s, o) => s + (o.commission_amount || 0), 0);

  // Group by day for chart
  const dailyData = useMemo(() => {
    const map = {};
    for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'MMM d');
      map[d] = { date: d, revenue: 0, orders: 0 };
    }
    completed.forEach(o => {
      if (o.created_date) {
        const d = format(new Date(o.created_date), 'MMM d');
        if (map[d]) { map[d].revenue += o.total_amount || 0; map[d].orders += 1; }
      }
    });
    return Object.values(map);
  }, [completed, period]);

  // By service name
  const byService = useMemo(() => {
    const map = {};
    completed.forEach(o => {
      const k = o.service_name || 'Unknown';
      if (!map[k]) map[k] = { name: k, revenue: 0, orders: 0 };
      map[k].revenue += o.total_amount || 0;
      map[k].orders += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [completed]);

  const statusDist = useMemo(() => {
    const map = {};
    periodOrders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-slate-700">Sales Report</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${revenue.toFixed(0)}`} icon={DollarSign} color="bg-emerald-500" />
        <StatCard label="Platform Commission" value={`$${commission.toFixed(0)}`} sub={`${revenue > 0 ? ((commission/revenue)*100).toFixed(1) : 0}% of revenue`} icon={TrendingUp} color="bg-violet-500" />
        <StatCard label="Completed Orders" value={completed.length} sub={`of ${periodOrders.length} total`} icon={Package} color="bg-blue-500" />
        <StatCard label="Avg Order Value" value={completed.length ? `$${(revenue / completed.length).toFixed(0)}` : '$0'} icon={DollarSign} color="bg-amber-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Daily Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={v => [`$${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Order Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top Services by Revenue</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Orders</TableHead><TableHead>Revenue</TableHead><TableHead>Avg Value</TableHead></TableRow></TableHeader>
            <TableBody>
              {byService.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.orders}</TableCell>
                  <TableCell className="font-semibold text-emerald-600">${s.revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-slate-500">${(s.revenue / s.orders).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {byService.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-6">No data for this period</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Customer Report ──
function CustomerReport({ orders, users }) {
  const topCustomers = useMemo(() => {
    const map = {};
    orders.filter(o => o.status === 'completed').forEach(o => {
      const k = o.customer_email;
      if (!map[k]) map[k] = { email: k, name: o.customer_name, orders: 0, spent: 0 };
      map[k].orders += 1;
      map[k].spent += o.total_amount || 0;
    });
    return Object.values(map).sort((a, b) => b.spent - a.spent).slice(0, 20);
  }, [orders]);

  const newThisMonth = useMemo(() => {
    const start = startOfMonth(new Date());
    return users.filter(u => u.created_date && new Date(u.created_date) >= start).length;
  }, [users]);

  const repeatCustomers = topCustomers.filter(c => c.orders > 1).length;

  // Monthly signups for chart
  const signupsByMonth = useMemo(() => {
    const map = {};
    users.forEach(u => {
      if (u.created_date) {
        const m = format(new Date(u.created_date), 'MMM yy');
        map[m] = (map[m] || 0) + 1;
      }
    });
    return Object.entries(map).slice(-6).map(([month, count]) => ({ month, count }));
  }, [users]);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-700">Customer Report</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={users.length} icon={Users} color="bg-violet-500" />
        <StatCard label="New This Month" value={newThisMonth} icon={Users} color="bg-blue-500" />
        <StatCard label="Repeat Customers" value={repeatCustomers} sub={`${topCustomers.length > 0 ? ((repeatCustomers/topCustomers.length)*100).toFixed(0) : 0}% repeat rate`} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Avg Orders/Customer" value={topCustomers.length ? (topCustomers.reduce((s, c) => s + c.orders, 0) / topCustomers.length).toFixed(1) : '0'} icon={Package} color="bg-amber-500" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Monthly New Customers</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={signupsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top Customers by Spend</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Customer</TableHead><TableHead>Email</TableHead><TableHead>Orders</TableHead><TableHead>Total Spent</TableHead></TableRow></TableHeader>
            <TableBody>
              {topCustomers.slice(0, 10).map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="text-slate-400 font-mono text-sm">{i + 1}</TableCell>
                  <TableCell className="font-medium">{c.name || '—'}</TableCell>
                  <TableCell className="text-sm text-slate-500">{c.email}</TableCell>
                  <TableCell>{c.orders}</TableCell>
                  <TableCell className="font-semibold text-emerald-600">${c.spent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {topCustomers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-6">No data yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Provider Report ──
function ProviderReport({ orders, providers, reviews }) {
  const providerStats = useMemo(() => {
    const map = {};
    providers.forEach(p => { map[p.id] = { ...p, order_count: 0, revenue: 0, commission: 0, review_count: 0, avg_rating: p.rating || 0 }; });
    orders.filter(o => o.status === 'completed').forEach(o => {
      if (map[o.provider_id]) {
        map[o.provider_id].order_count += 1;
        map[o.provider_id].revenue += o.total_amount || 0;
        map[o.provider_id].commission += o.commission_amount || 0;
      }
    });
    reviews.forEach(r => {
      if (map[r.provider_id]) map[r.provider_id].review_count += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [orders, providers, reviews]);

  const totalProviderRevenue = providerStats.reduce((s, p) => s + p.revenue, 0);
  const verified = providers.filter(p => p.is_verified).length;
  const active = providers.filter(p => p.is_active).length;

  const topByRating = [...providerStats].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)).slice(0, 5);
  const revenueByCategory = useMemo(() => {
    return providerStats.slice(0, 8).map(p => ({ name: p.business_name?.split(' ')[0] || 'Unknown', revenue: p.revenue }));
  }, [providerStats]);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-700">Provider Report</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Providers" value={providers.length} icon={Building2} color="bg-blue-500" />
        <StatCard label="Verified" value={verified} sub={`${providers.length > 0 ? ((verified/providers.length)*100).toFixed(0) : 0}% verified`} icon={Building2} color="bg-emerald-500" />
        <StatCard label="Active" value={active} icon={Building2} color="bg-violet-500" />
        <StatCard label="Provider Revenue" value={`$${totalProviderRevenue.toFixed(0)}`} icon={DollarSign} color="bg-amber-500" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Revenue by Provider (Top 8)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={v => [`$${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#e8356d" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Provider Performance</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Provider</TableHead><TableHead>Orders</TableHead><TableHead>Revenue</TableHead><TableHead>Commission</TableHead><TableHead>Rating</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {providerStats.slice(0, 15).map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell className="text-slate-400 font-mono text-sm">{i + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{p.business_name}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{p.order_count}</TableCell>
                  <TableCell className="font-semibold text-emerald-600">${p.revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-violet-600">${p.commission.toFixed(2)}</TableCell>
                  <TableCell>{p.avg_rating ? `${p.avg_rating.toFixed(1)} ⭐` : '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.is_verified && <Badge className="bg-emerald-600 text-xs h-5">Verified</Badge>}
                      {p.is_featured && <Badge className="bg-amber-500 text-xs h-5">Featured</Badge>}
                      {!p.is_active && <Badge variant="outline" className="text-xs h-5 text-red-500">Inactive</Badge>}
                    </div>
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

// ── Service Performance ──
function ServicePerformanceReport({ orders, services, providers }) {
  const serviceStats = useMemo(() => {
    const map = {};
    services.forEach(s => {
      const prov = providers.find(p => p.id === s.provider_id);
      map[s.id] = { ...s, provider_name: prov?.business_name || '—', order_count: 0, revenue: 0, cancellations: 0 };
    });
    orders.forEach(o => {
      if (map[o.service_id]) {
        if (o.status === 'completed') { map[o.service_id].order_count += 1; map[o.service_id].revenue += o.total_amount || 0; }
        if (o.status === 'cancelled') map[o.service_id].cancellations += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.order_count - a.order_count);
  }, [orders, services, providers]);

  const topServices = serviceStats.slice(0, 8);
  const chartData = topServices.map(s => ({ name: s.name?.split(' ').slice(0, 2).join(' ') || 'Unknown', orders: s.order_count, revenue: s.revenue }));

  const totalActive = services.filter(s => s.is_active).length;
  const totalFeatured = services.filter(s => s.is_featured).length;

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-700">Service Performance Report</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Services" value={services.length} icon={Package} color="bg-violet-500" />
        <StatCard label="Active Services" value={totalActive} icon={Package} color="bg-emerald-500" />
        <StatCard label="Featured" value={totalFeatured} icon={Package} color="bg-amber-500" />
        <StatCard label="Avg Price" value={services.length ? `$${(services.reduce((s, svc) => s + (svc.price || 0), 0) / services.length).toFixed(0)}` : '$0'} icon={DollarSign} color="bg-blue-500" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top Services by Orders</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">All Services Performance</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Provider</TableHead><TableHead>Price</TableHead><TableHead>Completed</TableHead><TableHead>Cancelled</TableHead><TableHead>Revenue</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {serviceStats.slice(0, 20).map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{s.provider_name}</TableCell>
                  <TableCell>${s.price}</TableCell>
                  <TableCell>{s.order_count}</TableCell>
                  <TableCell className="text-red-500">{s.cancellations}</TableCell>
                  <TableCell className="font-semibold text-emerald-600">${s.revenue.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {s.is_active ? <Badge className="bg-emerald-600 text-xs h-5">Active</Badge> : <Badge variant="outline" className="text-xs h-5">Inactive</Badge>}
                      {s.is_featured && <Badge className="bg-amber-500 text-xs h-5">⭐</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {serviceStats.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-6">No data yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsTab({ orders, users, providers, services, reviews }) {
  return (
    <Tabs defaultValue="sales">
      <TabsList className="mb-4 bg-slate-100">
        <TabsTrigger value="sales" className="text-xs"><DollarSign className="w-3.5 h-3.5 mr-1" />Sales</TabsTrigger>
        <TabsTrigger value="customers" className="text-xs"><Users className="w-3.5 h-3.5 mr-1" />Customers</TabsTrigger>
        <TabsTrigger value="providers" className="text-xs"><Building2 className="w-3.5 h-3.5 mr-1" />Providers</TabsTrigger>
        <TabsTrigger value="services" className="text-xs"><Package className="w-3.5 h-3.5 mr-1" />Service Performance</TabsTrigger>
      </TabsList>
      <TabsContent value="sales"><SalesReport orders={orders} /></TabsContent>
      <TabsContent value="customers"><CustomerReport orders={orders} users={users} /></TabsContent>
      <TabsContent value="providers"><ProviderReport orders={orders} providers={providers} reviews={reviews} /></TabsContent>
      <TabsContent value="services"><ServicePerformanceReport orders={orders} services={services} providers={providers} /></TabsContent>
    </Tabs>
  );
}