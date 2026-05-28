import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';

const G = {
  bg: '#080A12',
  bg2: '#0D1020',
  card: '#140b00',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF',
  muted: 'rgba(240,242,255,0.5)',
  faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D',
  green: '#06D6A0',
  amber: '#FF8C42',
  blue: '#4361EE',
};

const statusColors = {
  pending: { bg: '#fbbf24', text: '#000' },
  confirmed: { bg: '#3b82f6', text: '#fff' },
  in_progress: { bg: '#8b5cf6', text: '#fff' },
  completed: { bg: '#10b981', text: '#fff' },
  cancelled: { bg: '#ef4444', text: '#fff' }
};

export default function BookingCalendarView({ orders = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Group orders by scheduled_date
  const ordersByDate = useMemo(() => {
    const grouped = {};
    orders.forEach(order => {
      if (order.scheduled_date) {
        const dateStr = order.scheduled_date;
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(order);
      }
    });
    return grouped;
  }, [orders]);

  // Check for conflicts (multiple orders on same date+time)
  const conflictDates = useMemo(() => {
    return Object.entries(ordersByDate)
      .filter(([_, dayOrders]) => {
        const grouped = {};
        dayOrders.forEach(o => {
          const key = `${o.scheduled_date}:${o.scheduled_time}`;
          grouped[key] = (grouped[key] || 0) + 1;
        });
        return Object.values(grouped).some(count => count > 1);
      })
      .map(([date]) => date);
  }, [ordersByDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad with previous month's days
  const firstDayOfWeek = monthStart.getDay();
  const previousMonthEnd = subMonths(monthStart, 1);
  const previousMonthStart = startOfMonth(previousMonthEnd);
  const previousMonthDays = eachDayOfInterval({
    start: new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), previousMonthEnd.getDate() - firstDayOfWeek + 1),
    end: previousMonthEnd
  });

  const allDays = [...previousMonthDays, ...daysInMonth];

  return (
    <div style={{ background: G.card, borderRadius: 16, padding: 20, border: `1px solid ${G.border}` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: G.text, margin: 0 }}>
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: G.bg2,
              border: `1px solid ${G.border}`,
              color: G.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = G.border}
            onMouseLeave={e => e.currentTarget.style.background = G.bg2}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: G.bg2,
              border: `1px solid ${G.border}`,
              color: G.faint,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = G.border; e.currentTarget.style.color = G.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = G.bg2; e.currentTarget.style.color = G.faint; }}
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: G.bg2,
              border: `1px solid ${G.border}`,
              color: G.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = G.border}
            onMouseLeave={e => e.currentTarget.style.background = G.bg2}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Conflict Alert */}
      {conflictDates.length > 0 && (
        <div style={{
          padding: 12,
          borderRadius: 10,
          background: 'rgba(255,140,66,0.1)',
          border: `1px solid rgba(255,140,66,0.2)`,
          marginBottom: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={16} style={{ color: G.amber, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: G.amber }}>Schedule Conflicts Detected</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: G.muted }}>
              {conflictDates.length} date(s) have multiple bookings on the same day
            </p>
          </div>
        </div>
      )}

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 12 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            style={{
              padding: 8,
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: G.faint,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {allDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayOrders = ordersByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const hasConflict = conflictDates.includes(dateStr);

          return (
            <div
              key={idx}
              style={{
                minHeight: 120,
                borderRadius: 10,
                background: isCurrentMonth ? (hasConflict ? 'rgba(255,140,66,0.08)' : G.bg2) : 'transparent',
                border: `1px solid ${isCurrentMonth ? (hasConflict ? 'rgba(255,140,66,0.3)' : G.border) : 'transparent'}`,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {/* Day number */}
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: isCurrentMonth ? G.text : G.faint,
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {format(day, 'd')}
                {isToday && (
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: G.rose
                  }} />
                )}
              </div>

              {/* Conflict indicator */}
              {hasConflict && (
                <div style={{
                  width: '100%',
                  height: 2,
                  background: G.amber,
                  borderRadius: 1,
                  marginBottom: 6
                }} />
              )}

              {/* Orders */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
                {dayOrders.slice(0, 2).map((order, i) => {
                  const s = statusColors[order.status] || statusColors.pending;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '4px 6px',
                        borderRadius: 6,
                        background: s.bg + '25',
                        border: `1px solid ${s.bg}40`,
                        fontSize: 10,
                        color: s.bg,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title={`${order.service_name} - ${order.scheduled_time}`}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {order.scheduled_time} {order.service_name}
                    </div>
                  );
                })}
                {dayOrders.length > 2 && (
                  <div style={{
                    fontSize: 9,
                    color: G.muted,
                    fontWeight: 600,
                    padding: '2px 6px'
                  }}>
                    +{dayOrders.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${G.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {Object.entries(statusColors).map(([status, colors]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: colors.bg,
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: 11, color: G.muted, textTransform: 'capitalize' }}>
                {status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {orders.length > 0 && (
        <div style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${G.border}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12
        }}>
          {[
            { label: 'Total Bookings', value: orders.length, color: G.blue },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#fbbf24' },
            { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: '#3b82f6' },
            { label: 'Conflicts', value: conflictDates.length, color: G.amber },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: 11, color: G.faint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}