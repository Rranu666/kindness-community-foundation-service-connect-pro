import React, { useState, useMemo } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Calendar, AlertCircle, TrendingUp } from 'lucide-react';

const G = {
  card: '#140b00',
  border: 'rgba(203,60,122,0.2)',
  rose: '#cb3c7a',
  muted: 'rgba(255,255,255,0.55)',
  green: '#10b981'
};

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const fmt12 = (time) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

export default function AvailabilityDashboard({ orders = [] }) {
  const [weekStart, setWeekStart] = React.useState(new Date());

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Build occupancy map
  const occupancyMap = useMemo(() => {
    const map = {};
    orders.forEach(order => {
      if (order.status !== 'cancelled' && order.scheduled_date && order.scheduled_time) {
        const key = `${order.scheduled_date}-${order.scheduled_time}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [orders]);

  const getSlotStatus = (date, time) => {
    const key = `${format(date, 'yyyy-MM-dd')}-${time}`;
    const count = occupancyMap[key] || 0;
    if (count >= 2) return 'high';
    if (count === 1) return 'medium';
    return 'low';
  };

  const stats = useMemo(() => {
    const thisWeek = orders.filter(o => {
      const oDate = new Date(o.scheduled_date);
      return oDate >= weekStart && oDate < addDays(weekStart, 7);
    });
    return {
      totalBookings: thisWeek.length,
      confirmedBookings: thisWeek.filter(o => o.status === 'confirmed').length,
      occupancyRate: Math.round((thisWeek.length / (weekDays.length * HOURS.length)) * 100)
    };
  }, [orders, weekStart, weekDays]);

  const handlePrevWeek = () => setWeekStart(d => addDays(d, -7));
  const handleNextWeek = () => setWeekStart(d => addDays(d, 7));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4" style={{ background: G.card, border: `1px solid ${G.border}` }}>
          <p className="text-xs" style={{ color: G.muted }}>Total Bookings</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalBookings}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: G.card, border: `1px solid ${G.border}` }}>
          <p className="text-xs" style={{ color: G.muted }}>Confirmed</p>
          <p className="text-2xl font-bold" style={{ color: G.green }} >{stats.confirmedBookings}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: G.card, border: `1px solid ${G.border}` }}>
          <div className="flex items-center gap-1">
            <TrendingUp size={13} style={{ color: G.rose }} />
            <p className="text-xs" style={{ color: G.muted }}>Occupancy</p>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{stats.occupancyRate}%</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <button onClick={handlePrevWeek} className="px-3 py-2 rounded-lg hover:bg-white/10">←</button>
        <span className="text-sm font-semibold text-white">
          {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d')}
        </span>
        <button onClick={handleNextWeek} className="px-3 py-2 rounded-lg hover:bg-white/10">→</button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <div className="overflow-x-auto p-4">
          <div className="min-w-max">
            {/* Day headers */}
            <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `70px repeat(7, 1fr)` }}>
              <div></div>
              {weekDays.map((day) => (
                <div key={format(day, 'yyyy-MM-dd')} className="text-center">
                  <p className="text-xs font-semibold text-white">{format(day, 'EEE')}</p>
                  <p className="text-sm font-bold text-white mt-1">{format(day, 'd')}</p>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {HOURS.map((hour) => {
              const bookedCount = weekDays.reduce((sum, day) => {
                return sum + (occupancyMap[`${format(day, 'yyyy-MM-dd')}-${hour}`] || 0);
              }, 0);

              return (
                <div key={hour} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `70px repeat(7, 1fr)` }}>
                  <div className="flex items-center justify-end pr-2">
                    <span className="text-xs font-medium" style={{ color: G.muted }}>
                      {fmt12(hour)}
                    </span>
                  </div>
                  {weekDays.map((day) => {
                    const status = getSlotStatus(day, hour);
                    const bgColor = 
                      status === 'high' ? 'rgba(203,60,122,0.3)' :
                      status === 'medium' ? 'rgba(203,60,122,0.15)' :
                      'rgba(255,255,255,0.04)';

                    return (
                      <div
                        key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
                        className="py-2 px-1 rounded-lg text-center border transition-all"
                        style={{
                          background: bgColor,
                          borderColor: status !== 'low' ? G.rose : 'rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.7)'
                        }}>
                        <p className="text-xs font-bold">
                          {status === 'high' ? '🔴' : status === 'medium' ? '🟡' : '⭕'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <span>🔴</span>
          <span style={{ color: G.muted }}>2+ bookings</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🟡</span>
          <span style={{ color: G.muted }}>1 booking</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⭕</span>
          <span style={{ color: G.muted }}>Available</span>
        </div>
      </div>
    </div>
  );
}