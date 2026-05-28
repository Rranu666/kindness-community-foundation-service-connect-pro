import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Activity, DollarSign, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const L = {
  bg: '#ffffff', bg2: '#f7f7f5', bg3: '#f0efed',
  border: '#e2e0dc', border2: '#d4d0ca',
  text: '#111111', text2: '#555555', text3: '#999999',
  accent: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
};

const COLORS = ['#FF4D6D', '#FF8C42', '#06D6A0', '#4361EE', '#7C3AED', '#06b6d4'];

export default function ProviderAnalytics() {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => {
    if (user?.email) db.ServiceProvider.filter({ email: user.email }).then(p => setProvider(p[0] || null));
  }, [user?.email]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['analytics-orders', provider?.id],
    queryFn: () => db.Order.filter({ provider_id: provider?.id }, '-created_date', 500),
    enabled: !!provider?.id
  });

  const { data: services = [] } = useQuery({
    queryKey: ['analytics-services', provider?.id],
    queryFn: () => db.Service.filter({ provider_id: provider?.id }),
    enabled: !!provider?.id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['analytics-reviews', provider?.id],
    queryFn: () => db.Review.filter({ provider_id: provider?.id }, '-created_date', 100),
    enabled: !!provider?.id
  });

  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const conversionRate = (provider?.total_orders || 0) > 0 ? (completedOrders / (provider?.total_orders || 1) * 100).toFixed(1) : 0;

  const monthlyData = {};
  orders.forEach(order => {
    if (order.status === 'completed') {
      const date = new Date(order.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + ((order.subtotal || 0) - (order.commission_amount || 0));
    }
  });
  const monthlyTrend = Object.entries(monthlyData).sort().slice(-6).map(([month, earnings]) => ({ month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), earnings: Math.round(earnings) }));

  const serviceStats = {};
  orders.forEach(order => {
    const key = order.service_name || 'Unknown';
    if (!serviceStats[key]) serviceStats[key] = { name: key, bookings: 0, revenue: 0 };
    serviceStats[key].bookings++;
    if (order.status === 'completed') serviceStats[key].revenue += (order.subtotal || 0);
  });
  const popularServices = Object.values(serviceStats).sort((a, b) => b.bookings - a.bookings).slice(0, 6);
  const topServicesByRevenue = Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const statusBreakdown = [
    { name: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: L.green },
    { name: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length, color: L.blue },
    { name: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: L.amber },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: L.accent },
  ].filter(s => s.value > 0);

  const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;
  const returningCustomers = orders.reduce((acc, order) => { acc[order.customer_email] = (acc[order.customer_email] || 0) + 1; return acc; }, {});
  const retentionCount = Object.values(returningCustomers).filter(count => count > 1).length;
  const retentionRate = uniqueCustomers > 0 ? (retentionCount / uniqueCustomers * 100).toFixed(1) : 0;

  const monthlyCompletionData = {};
  orders.forEach(order => {
    const date = new Date(order.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyCompletionData[monthKey]) monthlyCompletionData[monthKey] = { total: 0, completed: 0 };
    monthlyCompletionData[monthKey].total++;
    if (order.status === 'completed') monthlyCompletionData[monthKey].completed++;
  });
  const completionTrendData = Object.entries(monthlyCompletionData).sort().slice(-6).map(([month, data]) => ({ month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), completionRate: data.total > 0 ? (data.completed / data.total * 100).toFixed(1) : 0, completed: data.completed, total: data.total }));

  const totalEarnings = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + ((o.subtotal || 0) - (o.commission_amount || 0)), 0);

  const cardStyle = { background: '#fff', border: `1px solid ${L.border}` };
  const tooltipStyle = { contentStyle: { background: '#fff', border: `1px solid ${L.border}`, borderRadius: 8 }, labelStyle: { color: L.text } };

  if (!user) return <div style={{ minHeight: '100vh', background: L.bg }} />;

  if (!provider) {
    return (
      <div style={{ minHeight: '100vh', background: L.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={cardStyle} className="border max-w-sm w-full mx-6">
          <CardContent className="pt-8 text-center">
            <h2 style={{ color: L.text, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Profile</h2>
            <p style={{ color: L.text2, fontSize: 14 }}>Register your business to access analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: L.bg, color: L.text, padding: '48px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 8, color: L.text }}>Business Analytics</h1>
          <p style={{ fontSize: 14, color: L.text2, fontWeight: 300 }}>Track your conversion, earnings, and popular services</p>
        </div>

        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Total Earnings', value: `$${totalEarnings.toFixed(0)}`, icon: DollarSign, color: L.green },
            { label: 'Completed Orders', value: completedOrders, icon: CheckCircle2, color: L.green },
            { label: 'Completion Rate', value: `${conversionRate}%`, icon: Target, color: L.blue },
            { label: 'Unique Customers', value: uniqueCustomers, icon: Users, color: L.amber },
            { label: 'Retention Rate', value: `${retentionRate}%`, icon: TrendingUp, color: L.accent },
            { label: 'Avg Rating', value: (provider.rating || 0).toFixed(1), icon: Activity, color: L.blue },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} style={cardStyle} className="border">
              <CardContent className="p-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon size={16} style={{ color }} />
                  <span style={{ fontSize: 12, color: L.text3 }}>{label}</span>
                </div>
                <p style={{ fontWeight: 800, fontSize: 22, color: L.text }}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20, marginBottom: 24 }}>
          <Card style={cardStyle} className="border">
            <CardHeader><CardTitle style={{ color: L.text, fontSize: 16 }}>Monthly Earnings Trend</CardTitle></CardHeader>
            <CardContent>
              {ordersLoading ? <Skeleton className="h-64" /> : monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={L.green} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={L.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={L.border} />
                    <XAxis dataKey="month" stroke={L.text3} tick={{ fontSize: 11 }} />
                    <YAxis stroke={L.text3} tick={{ fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} formatter={v => `$${v}`} />
                    <Area type="monotone" dataKey="earnings" stroke={L.green} strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p style={{ textAlign: 'center', color: L.text3, padding: '60px 20px' }}>No earnings data yet</p>}
            </CardContent>
          </Card>

          <Card style={cardStyle} className="border">
            <CardHeader><CardTitle style={{ color: L.text, fontSize: 16 }}>Completion Rate Trend</CardTitle></CardHeader>
            <CardContent>
              {completionTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={completionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={L.border} />
                    <XAxis dataKey="month" stroke={L.text3} tick={{ fontSize: 11 }} />
                    <YAxis stroke={L.text3} tick={{ fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="completionRate" stroke={L.blue} strokeWidth={2} dot={{ fill: L.blue, r: 4 }} name="Completion Rate" />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p style={{ textAlign: 'center', color: L.text3, padding: '60px 20px' }}>No data yet</p>}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20, marginBottom: 24 }}>
          <Card style={cardStyle} className="border">
            <CardHeader><CardTitle style={{ color: L.text, fontSize: 16 }}>Top Services by Bookings</CardTitle></CardHeader>
            <CardContent>
              {popularServices.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={popularServices}>
                    <CartesianGrid strokeDasharray="3 3" stroke={L.border} />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} tick={{ fontSize: 11, fill: L.text3 }} />
                    <YAxis stroke={L.text3} tick={{ fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="bookings" fill={L.accent} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p style={{ textAlign: 'center', color: L.text3, padding: '60px 20px' }}>No bookings yet</p>}
            </CardContent>
          </Card>

          <Card style={cardStyle} className="border">
            <CardHeader><CardTitle style={{ color: L.text, fontSize: 16 }}>Customer Retention</CardTitle></CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: L.text2 }}>Retention Rate</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: L.green }}>{retentionRate}%</span>
                  </div>
                  <div style={{ height: 8, background: L.bg3, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${retentionRate}%`, background: L.green, transition: 'width 0.3s ease' }} />
                  </div>
                  <p style={{ fontSize: 11, color: L.text3, marginTop: 6 }}>{retentionCount} of {uniqueCustomers} customers are repeat bookings</p>
                </div>
                <div style={{ borderTop: `1px solid ${L.border}`, paddingTop: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, color: L.text3, marginBottom: 4 }}>Unique Customers</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: L.amber }}>{uniqueCustomers}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: L.text3, marginBottom: 4 }}>Repeat Customers</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: L.green }}>{retentionCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
          <Card style={cardStyle} className="border">
            <CardHeader><CardTitle style={{ color: L.text, fontSize: 16 }}>Booking Status Breakdown</CardTitle></CardHeader>
            <CardContent>
              {statusBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value">
                      {statusBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p style={{ textAlign: 'center', color: L.text3, padding: '60px 20px' }}>No data yet</p>}
            </CardContent>
          </Card>

          <Card style={cardStyle} className="border">
            <CardHeader><CardTitle style={{ color: L.text, fontSize: 16 }}>Top Services by Revenue</CardTitle></CardHeader>
            <CardContent>
              {topServicesByRevenue.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {topServicesByRevenue.map((service, i) => (
                    <div key={service.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div>
                          <p style={{ fontSize: 13, color: L.text, fontWeight: 600, margin: 0 }}>{service.name}</p>
                          <p style={{ fontSize: 11, color: L.text3, margin: 0 }}>{service.bookings} bookings</p>
                        </div>
                        <span style={{ fontSize: 14, color: L.green, fontWeight: 800 }}>${service.revenue.toFixed(0)}</span>
                      </div>
                      <div style={{ height: 6, background: L.bg3, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(service.revenue / Math.max(...topServicesByRevenue.map(s => s.revenue)) || 1) * 100}%`, background: COLORS[i % COLORS.length], transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ textAlign: 'center', color: L.text3, padding: '60px 20px' }}>No revenue data</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}