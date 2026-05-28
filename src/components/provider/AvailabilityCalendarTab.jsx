import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Calendar, Clock, CheckCircle2, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const G = {
  card: '#140b00', border: 'rgba(203,60,122,0.2)', rose: '#cb3c7a',
  muted: 'rgba(255,255,255,0.55)', faint: 'rgba(255,255,255,0.25)',
  green: '#10b981', surface: 'rgba(255,255,255,0.04)',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

const fmt12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
};

function DayRow({ day, schedule, onChange }) {
  const enabled = schedule?.enabled ?? false;
  const start = schedule?.start || '09:00';
  const end = schedule?.end || '17:00';

  return (
    <div className="flex items-center gap-3 flex-wrap py-3 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      {/* Toggle + day name */}
      <div className="flex items-center gap-2 w-32 flex-shrink-0">
        <Switch checked={enabled} onCheckedChange={v => onChange({ ...schedule, enabled: v })} />
        <span className="text-sm font-semibold" style={{ color: enabled ? '#fff' : G.muted }}>{day.slice(0,3)}</span>
      </div>

      {enabled ? (
        <div className="flex items-center gap-2 flex-wrap">
          <select value={start}
            onChange={e => onChange({ ...schedule, start: e.target.value })}
            className="text-sm rounded-lg px-3 py-1.5 border"
            style={{ background: '#0f0900', borderColor: G.border, color: '#fff' }}>
            {TIME_SLOTS.map(t => <option key={t} value={t}>{fmt12(t)}</option>)}
          </select>
          <span className="text-sm" style={{ color: G.faint }}>to</span>
          <select value={end}
            onChange={e => onChange({ ...schedule, end: e.target.value })}
            className="text-sm rounded-lg px-3 py-1.5 border"
            style={{ background: '#0f0900', borderColor: G.border, color: '#fff' }}>
            {TIME_SLOTS.filter(t => t > start).map(t => <option key={t} value={t}>{fmt12(t)}</option>)}
          </select>
          <span className="text-xs" style={{ color: G.muted }}>
            {Math.round((parseInt(end) - parseInt(start)))} hrs
          </span>
        </div>
      ) : (
        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: G.faint }}>
          Unavailable
        </span>
      )}
    </div>
  );
}

export default function AvailabilityCalendarTab({ provider, onUpdate }) {
  const defaultSchedule = DAYS.reduce((acc, day) => ({
    ...acc,
    [day]: { enabled: (provider.availability || []).includes(day), start: '09:00', end: '17:00' }
  }), {});

  const [schedule, setSchedule] = useState(provider.weekly_schedule || defaultSchedule);
  const [saving, setSaving] = useState(false);
  const [acceptingOrders, setAcceptingOrders] = useState(provider.is_active ?? true);

  const handleDayChange = (day, val) => {
    setSchedule(prev => ({ ...prev, [day]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    const enabledDays = DAYS.filter(d => schedule[d]?.enabled);
    try {
      await db.ServiceProvider.update(provider.id, {
        weekly_schedule: schedule,
        availability: enabledDays,
        is_active: acceptingOrders,
      });
      onUpdate({ weekly_schedule: schedule, availability: enabledDays, is_active: acceptingOrders });
      toast.success('Availability saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = DAYS.filter(d => schedule[d]?.enabled).length;

  return (
    <div className="space-y-4">
      {/* Accept orders toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <div>
          <p className="font-bold text-white">Accepting New Bookings</p>
          <p className="text-xs mt-0.5" style={{ color: G.muted }}>Toggle off to pause all incoming orders without losing your profile</p>
        </div>
        <Switch checked={acceptingOrders} onCheckedChange={setAcceptingOrders} />
      </div>

      {/* Weekly schedule */}
      <div className="rounded-2xl overflow-hidden" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: G.rose }} />
            <span className="font-bold text-white">Weekly Hours</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-lg font-semibold"
            style={{ background: `${G.rose}15`, color: G.rose }}>
            {enabledCount} day{enabledCount !== 1 ? 's' : ''} active
          </span>
        </div>
        <div className="px-5 py-2">
          {DAYS.map(day => (
            <DayRow key={day} day={day}
              schedule={schedule[day]}
              onChange={val => handleDayChange(day, val)} />
          ))}
        </div>
      </div>

      {/* Time zone note */}
      <div className="flex items-center gap-2 px-1">
        <Clock size={13} style={{ color: G.faint }} />
        <p className="text-xs" style={{ color: G.faint }}>All times are in Pacific Time (PT)</p>
      </div>

      {/* Save button */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl font-bold text-white transition-all"
        style={{ background: saving ? 'rgba(203,60,122,0.4)' : G.rose, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
        {saving ? 'Saving…' : 'Save Availability'}
      </button>
    </div>
  );
}