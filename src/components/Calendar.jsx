import { useState } from 'react';
import { dayjs, getWeekDays, toDateStr } from '../utils/dateUtils';
import { TIME_SLOTS } from '../utils/constants';
import { getBookings, getRecurring, isDateBlocked } from '../utils/storage';
import { getBookingColor } from '../utils/colorUtils';
import TimeSlotCell from './TimeSlotCell';
import BookingModal from './BookingModal';
import CancellationCodeModal from './CancellationCodeModal';
import CancelBookingModal from './CancelBookingModal';

const DAY_NAMES = ['一', '二', '三', '四', '五'];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [bookingTarget, setBookingTarget] = useState(null);
  const [codeData, setCodeData] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileDayIdx, setMobileDayIdx] = useState(() => {
    const dow = dayjs().isoWeekday();
    return dow >= 1 && dow <= 5 ? dow - 1 : 0;
  });

  const weekDays = getWeekDays(currentDate);
  const todayStr = toDateStr(dayjs());

  function prevWeek() { setCurrentDate((d) => d.subtract(7, 'day')); }
  function nextWeek() { setCurrentDate((d) => d.add(7, 'day')); }

  // Build booking map
  const bookings = getBookings();
  const recurring = getRecurring();
  const bookingMap = {};
  bookings.forEach((b) => { bookingMap[`${b.date}_${b.slotId}_${b.room}`] = b; });
  recurring.forEach((r) => {
    weekDays.forEach((d) => {
      const dateStr = toDateStr(d);
      if (d.isoWeekday() !== r.dayOfWeek) return;
      if (r.startDate > dateStr) return;
      if (r.endDate && r.endDate < dateStr) return;
      const key = `${dateStr}_${r.slotId}_${r.room}`;
      if (!bookingMap[key]) bookingMap[key] = { ...r, date: dateStr, isRecurringInstance: true };
    });
  });

  function getBookingForCell(dateStr, slotId, room) {
    return bookingMap[`${dateStr}_${slotId}_${room}`] || null;
  }

  function handleCellClick(date, slotId, room) {
    const dateStr = toDateStr(date);
    if (isDateBlocked(dateStr)) return;
    const existing = getBookingForCell(dateStr, slotId, room);
    if (existing) {
      setCancelTarget({ date: dateStr, slotId, room, booking: existing });
    } else {
      setBookingTarget({ date: dateStr, slotId, room });
    }
  }

  function handleBookingSuccess(code, booking) {
    const slot = TIME_SLOTS.find((s) => s.id === booking.slotId);
    setBookingTarget(null);
    setCodeData({
      code,
      name: booking.name,
      slot: slot ? `${slot.label} ${slot.time}` : booking.slotId,
      room: booking.room === 'large' ? '大研討室' : '小研討室',
      date: booking.date,
    });
    setRefreshKey((k) => k + 1);
  }

  function handleCancelSuccess() {
    setCancelTarget(null);
    setRefreshKey((k) => k + 1);
  }

  // Build color legend from visible bookings
  const legendMap = {};
  Object.values(bookingMap).forEach((b) => {
    if (b.type !== 'teacher' || !b.department) return;
    if (!legendMap[b.department]) legendMap[b.department] = getBookingColor(b).bg;
  });

  return (
    <div key={refreshKey} className="space-y-3">

      {/* ── Week navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-2.5 border border-gray-100">
        <button onClick={prevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl transition-colors">
          ‹
        </button>
        <div className="text-center">
          <span className="text-sm font-semibold text-gray-800">
            {weekDays[0].format('YYYY')} 年
          </span>
          <span className="text-sm text-gray-500 ml-1">
            {weekDays[0].format('MM/DD')} – {weekDays[4].format('MM/DD')}
          </span>
        </div>
        <button onClick={nextWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl transition-colors">
          ›
        </button>
      </div>

      {/* ── DESKTOP: weekly grid (md+) ──────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {/* Time column header */}
              <th className="w-[88px] px-3 py-3 text-left border-b border-r border-gray-100 bg-gray-50">
                <span className="text-gray-400 font-normal text-xs">時段</span>
              </th>
              {weekDays.map((d, i) => {
                const dateStr = toDateStr(d);
                const isToday = dateStr === todayStr;
                const blocked = isDateBlocked(dateStr);
                return (
                  <th key={dateStr}
                    className={`px-2 py-3 text-center border-b border-r border-gray-100 last:border-r-0 font-normal
                      ${blocked ? 'bg-red-50' : isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-xs ${blocked ? 'text-red-400' : isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                        週{DAY_NAMES[i]}
                      </span>
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                        ${isToday ? 'bg-blue-600 text-white' : blocked ? 'text-red-400' : 'text-gray-800'}`}>
                        {d.format('D')}
                      </span>
                      <span className={`text-xs ${blocked ? 'text-red-400' : isToday ? 'text-blue-500' : 'text-gray-400'}`}>
                        {d.format('MM/DD')}
                      </span>
                      {blocked && <span className="text-xs text-red-400">不開放</span>}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, si) => (
              <tr key={slot.id} className={si % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                {/* Time label */}
                <td className="px-3 py-1.5 border-b border-r border-gray-100 text-center align-middle">
                  <div className="font-medium text-gray-700 text-xs whitespace-nowrap">{slot.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5 whitespace-nowrap">{slot.time}</div>
                </td>
                {weekDays.map((d) => {
                  const dateStr = toDateStr(d);
                  const blocked = isDateBlocked(dateStr);
                  const largeBooking = getBookingForCell(dateStr, slot.id, 'large');
                  const smallBooking = getBookingForCell(dateStr, slot.id, 'small');
                  return (
                    <td key={dateStr}
                      className={`border-b border-r border-gray-100 last:border-r-0 p-1 align-top
                        ${blocked ? 'bg-red-50/60' : ''}`}>
                      <div className="flex gap-1">
                        <div className="flex-1">
                          <TimeSlotCell booking={largeBooking} room="large" blocked={blocked}
                            onClick={() => !blocked && handleCellClick(d, slot.id, 'large')} />
                        </div>
                        <div className="flex-1">
                          <TimeSlotCell booking={smallBooking} room="small" blocked={blocked}
                            onClick={() => !blocked && handleCellClick(d, slot.id, 'small')} />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE: single-day view (<md) ───────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {/* Day selector */}
        <div className="grid grid-cols-5 gap-1">
          {weekDays.map((d, i) => {
            const dateStr = toDateStr(d);
            const isToday = dateStr === todayStr;
            const blocked = isDateBlocked(dateStr);
            const active = mobileDayIdx === i;
            return (
              <button key={i} onClick={() => setMobileDayIdx(i)}
                className={`flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-colors
                  ${active ? 'bg-blue-600 text-white shadow-sm' :
                    isToday ? 'bg-blue-50 text-blue-700' :
                    blocked ? 'bg-red-50 text-red-400' :
                    'bg-white text-gray-600 border border-gray-100'}`}>
                <span className="text-xs opacity-80">{DAY_NAMES[i]}</span>
                <span className={`text-lg font-bold leading-tight ${active ? '' : isToday ? 'text-blue-600' : ''}`}>
                  {d.format('D')}
                </span>
                <span className="text-xs opacity-70">{d.format('MM/DD')}</span>
              </button>
            );
          })}
        </div>

        {/* Day view */}
        {(() => {
          const d = weekDays[mobileDayIdx];
          const dateStr = toDateStr(d);
          const blocked = isDateBlocked(dateStr);
          return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {blocked && (
                <div className="bg-red-50 text-red-500 text-center text-sm py-2 font-medium">
                  此日期不開放預約
                </div>
              )}
              {TIME_SLOTS.map((slot, si) => {
                const largeBooking = getBookingForCell(dateStr, slot.id, 'large');
                const smallBooking = getBookingForCell(dateStr, slot.id, 'small');
                return (
                  <div key={slot.id}
                    className={`border-b border-gray-100 last:border-0 ${si % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    {/* Slot header */}
                    <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-50">
                      <span className="text-xs font-semibold text-gray-700">{slot.label}</span>
                      <span className="text-xs text-gray-400">{slot.time}</span>
                    </div>
                    {/* Room cells */}
                    <div className="flex gap-2 px-3 py-2">
                      <div className="flex-1">
                        <TimeSlotCell booking={largeBooking} room="large" blocked={blocked} mobile
                          onClick={() => !blocked && handleCellClick(d, slot.id, 'large')} />
                      </div>
                      <div className="flex-1">
                        <TimeSlotCell booking={smallBooking} room="small" blocked={blocked} mobile
                          onClick={() => !blocked && handleCellClick(d, slot.id, 'small')} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── Color legend (departments visible this week) ─────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3">
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
          <span className="text-xs text-gray-400 font-medium mr-1">本週科組：</span>
          {Object.entries(legendMap).map(([dept, color]) => (
            <span key={dept} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0"
                style={{ backgroundColor: color }} />
              {dept}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0 bg-[#e37400]" />
            學生
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0 bg-[#5f6368]" />
            固定預約
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
            點擊格子可預約或取消
          </span>
        </div>
      </div>

      {/* Modals */}
      {bookingTarget && (
        <BookingModal target={bookingTarget} onSuccess={handleBookingSuccess}
          onClose={() => setBookingTarget(null)} />
      )}
      {codeData && (
        <CancellationCodeModal data={codeData} onClose={() => setCodeData(null)} />
      )}
      {cancelTarget && (
        <CancelBookingModal target={cancelTarget} onSuccess={handleCancelSuccess}
          onClose={() => setCancelTarget(null)} />
      )}
    </div>
  );
}
