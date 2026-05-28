import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWithinInterval, subWeeks, parseISO } from 'date-fns';

const G = {
  card: '#140b00', border: 'rgba(203,60,122,0.2)', rose: '#cb3c7a',
  muted: 'rgba(255,255,255,0.55)', faint: 'rgba(255,255,255,0.25)',
  green: '#10b981', amber: '#f59e0b', blue: '#4361EE',
};

const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: G.card, border: `1px solid ${G.border}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold" style={{ color: G.muted }}>{label}</p>
        <p className="text-xl font-black text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: G.faint }}>{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs font-bold"
          style={{ color: trend >= 0 ? G.green : '#ef4444' }}>
          {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-sm" style={{ background: '#1a1a35', border: `1px solid ${G.border}` }}>
      <p className="font-bold text-white mb-1">{label}</p>
      <p style={{ color: G.rose }}>Earnings: ${payload[0]?.value?.toFixed(2)}</p>
      <p style={{ color: G.muted }}>Jobs: {payload[1]?.value ?? 0}</p>
    </div>
  );
};

export default function WeeklyEarningsTab({ orders = [], provider }) {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const completed = orders.filter(o => o.status === 'completed');

  const inRange = (order, start, end) => {
    try {
      const d = parseISO(order.scheduled_date || order.created_date);
      return isWithinInterval(d, { start, end });
    } catch { return false; }
  };

  const thisWeekOrders = completed.filter(o => inRange(o, thisWeekStart, thisWeekEnd));
  const lastWeekOrders = completed.filter(o => inRange(o, lastWeekStart, lastWeekEnd));

  const net = (o) => (o.subtotal || 0) - (o.commission_amount || 0);

  const thisWeekEarnings = thisWeekOrders.reduce((s, o) => s + net(o), 0);
  const lastWeekEarnings = lastWeekOrders.reduce((s, o) => s + net(o), 0);
  const earningsTrend = lastWeekEarnings > 0
    ? Math.round(((thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100)
    : null;

  // Bar chart data — one bar per day of the current week
  const days = eachDayOfInterval({ start: thisWeekStart, end: thisWeekEnd });
  const barData = days.map(day => {
    const dayOrders = thisWeekOrders.filter(o => {
      try { return format(parseISO(o.scheduled_date || o.created_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'); }
      catch { return false; }
    });
    return {
      name: format(day, 'EEE'),
      earnings: dayOrders.reduce((s, o) => s + net(o), 0),
      jobs: dayOrders.length,
      isToday: format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'),
    };
  });

  // All-time totals
  const allTimeEarnings = completed.reduce((s, o) => s + net(o), 0);
  const avgPerJob = completed.length > 0 ? allTimeEarnings / completed.length : 0;

  // Top service by revenue
  const serviceMap = {};
  completed.forEach(o => {
    if (!o.service_name) return;
    serviceMap[o.service_name] = (serviceMap[o.service_name] || 0) + net(o);
  });
  const topServices = Object.entries(serviceMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="This Week" value={`$${thisWeekEarnings.toFixed(0)}`}
          sub={`${thisWeekOrders.length} job${thisWeekOrders.length !== 1 ? 's' : ''}`}
          color={G.rose} trend={earningsTrend} />
        <StatCard icon={TrendingUp} label="Last Week" value={`$${lastWeekEarnings.toFixed(0)}`}
          sub={`${lastWeekOrders.length} jobs`} color={G.blue} />
        <StatCard icon={ShoppingBag} label="All-Time Earnings" value={`$${allTimeEarnings.toFixed(0)}`}
          sub={`${completed.length} completed`} color={G.green} />
        <StatCard icon={Star} label="Avg Per Job" value={`$${avgPerJob.toFixed(0)}`}
          sub={provider?.rating ? `★ ${provider.rating?.toFixed(1)}` : 'No rating yet'} color={G.amber} />
      </div>

      {/* Bar chart */}
      <div className="p-5 rounded-2xl" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">This Week's Earnings</h3>
            <p className="text-xs" style={{ color: G.muted }}>
              {format(thisWeekStart, 'MMM d')} – {format(thisWeekEnd, 'MMM d, yyyy')}
            </p>
          </div>
          <span className="text-2xl font-black" style={{ color: G.rose }}>
            ${thisWeekEarnings.toFixed(0)}
          </span>
        </div>
        {thisWeekEarnings === 0 ? (
          <div className="h-40 flex items-center justify-center" style={{ color: G.faint }}>
            <div className="text-center">
              <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No completed jobs this week yet</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barGap={4}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: G.muted, fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: G.muted, fontSize: 11 }} width={40}
                tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="earnings" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.isToday ? G.rose : entry.earnings > 0 ? '#FF8C42' : 'rgba(255,255,255,0.08)'} />
                ))}
              </Bar>
              <Bar dataKey="jobs" hide />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Services */}
      {topServices.length > 0 && (
        <div className="p-5 rounded-2xl" style={{ background: G.card, border: `1px solid ${G.border}` }}>
          <h3 className="font-bold text-white mb-3">Top Services by Revenue</h3>
          <div className="space-y-3">
            {topServices.map(([name, revenue], i) => {
              const pct = (revenue / allTimeEarnings) * 100;
              return (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: i === 0 ? '#fff' : G.muted }}>{name}</span>
                    <span className="font-bold" style={{ color: i === 0 ? G.rose : G.muted }}>${revenue.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-1.5 rounded-full" style={{
                      width: `${pct}%`,
                      background: i === 0 ? `linear-gradient(90deg, ${G.rose}, #FF8C42)` : 'rgba(255,255,255,0.2)',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent completed jobs */}
      {thisWeekOrders.length > 0 && (
        <div className="p-5 rounded-2xl" style={{ background: G.card, border: `1px solid ${G.border}` }}>
          <h3 className="font-bold text-white mb-3">This Week's Jobs</h3>
          <div className="space-y-2">
            {thisWeekOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-sm font-medium text-white">{order.service_name}</p>
                  <p className="text-xs" style={{ color: G.muted }}>{order.customer_name} · {order.scheduled_date}</p>
                </div>
                <p className="font-bold text-sm" style={{ color: G.green }}>+${net(order).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}