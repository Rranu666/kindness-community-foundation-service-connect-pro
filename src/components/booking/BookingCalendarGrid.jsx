import React, { useState, useMemo } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const fmt12 = (time) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

export default function BookingCalendarGrid({ selectedDate, onSelectSlot, bookedSlotsMap, provider = {}, providers = {} }) {
   const [startDate, setStartDate] = React.useState(new Date());

   const weekDays = useMemo(() => {
     return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
   }, [startDate]);

   // Check if provider is available on a given day
   const isProviderAvailableOnDay = (date) => {
     if (!provider?.availability || provider.availability.length === 0) return true;
     const dayName = format(date, 'EEEE'); // Monday, Tuesday, etc.
     return provider.availability.includes(dayName);
   };

   const isSlotAvailable = (date, time) => {
     // First check if provider works on this day
     if (!isProviderAvailableOnDay(date)) return false;

     const key = format(date, 'yyyy-MM-dd');
     const booked = bookedSlotsMap[key] || new Set();
     return !booked.has(time);
   };

  const handlePrevWeek = () => setStartDate(d => addDays(d, -7));
  const handleNextWeek = () => setStartDate(d => addDays(d, 7));

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-lg hover:bg-white/10 transition"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-white">
          {format(weekDays[0], 'MMM d')} — {format(weekDays[6], 'MMM d, yyyy')}
        </span>
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-lg hover:bg-white/10 transition"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Day headers */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
            <div></div>
            {weekDays.map((day) => (
              <div key={format(day, 'yyyy-MM-dd')} className="text-center">
                <p className="text-xs font-semibold text-white">{format(day, 'EEE')}</p>
                <p
                  className="text-sm font-bold rounded-lg py-1 px-2 mt-1"
                  style={{
                    background: isSameDay(day, selectedDate)
                      ? '#cb3c7a'
                      : 'rgba(255,255,255,0.05)',
                    color: isSameDay(day, selectedDate) ? '#fff' : 'rgba(255,255,255,0.7)',
                  }}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
              <div className="flex items-center justify-end pr-2">
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {fmt12(hour)}
                </span>
              </div>
              {weekDays.map((day) => {
                const isAvailable = isSlotAvailable(day, hour);
                const isSelected =
                  selectedDate &&
                  isSameDay(day, selectedDate) &&
                  selectedDate._selectedTime === hour;

                return (
                  <button
                    key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
                    onClick={() => onSelectSlot(day, hour)}
                    disabled={!isAvailable}
                    className="py-2 rounded-lg text-xs font-medium transition-all border"
                    style={{
                      background: isSelected
                        ? '#cb3c7a'
                        : isAvailable
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.02)',
                      borderColor: isSelected
                        ? '#cb3c7a'
                        : isAvailable
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(255,255,255,0.05)',
                      color: isSelected
                        ? '#fff'
                        : isAvailable
                          ? 'rgba(255,255,255,0.7)'
                          : 'rgba(255,255,255,0.25)',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      opacity: isAvailable ? 1 : 0.4,
                    }}>
                    {isAvailable ? '✓' : '✗'}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs pt-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ background: 'rgba(203,60,122,0.8)' }}></div>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,255,255,0.02)' }}></div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: 'rgba(107,114,128,0.3)' }}></div>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Closed</span>
        </div>
      </div>
    </div>
  );
}