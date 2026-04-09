import { useState, useEffect, useCallback } from 'react';
import { dayjs, getWeekDays, toDateStr } from '../utils/dateUtils';
import { TIME_SLOTS } from '../utils/constants';
import { getBookings, getRecurring, getBlockedDates } from '../utils/storage';
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
  const [mobileDayIdx, setMobileDayIdx] = useState(() => {
    const dow = dayjs().isoWeekday();
    return dow >= 1 && dow <= 5 ? dow - 1 : 0;
  });

  const [calData, setCalData] = useState({ bookings: [], recurring: [], blockedDates: [] });
  const [loading, setLoading] = useState(true);

  const weekDays = getWeekDays(currentDate);
  const todayStr = toDateStr(dayjs());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookings, recurring, blockedDates] = await Promise.all([
        getBookings(), getRecurring(), getBlockedDates(),
      ]);
      setCalData({ bookings, recurring, blockedDates });
    } catch (e) {
      console.error('loadData:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function prevWeek() { setCurrentDate((d) => d.subtract(7, 'day')); }
  function nextWeek() { setCurrentDate((d) => d.add(7, 'day')); }

  // Build booking map for the displayed week
  const bookingMap = {};
  calData.bookings.forEach((b) => {
    bookingMap[`${b.date}_${b.slotId}_${b.room}`] = b;
  });
  calData.recurring.forEach((r) => {
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

  function isBlocked(dateStr) {
    return calData.blockedDates.some((d) => d.date === dateStr);
  }

  function isPast(dateStr) {
    return dateStr < todayStr;
  }

  function isCellDisabled(dateStr) {
    return isPast(dateStr) || isBlocked(dateStr);
  }

  function handleCellClick(date, slotId, room) {
    const dateStr = toDateStr(date);
    if (isCellDisabled(dateStr)) return;
    const existing = getBookingForCell(dateStr, slotId, room);
    if (existing) {
      setCancelTarget({ date: dateStr, slotId, room, booking: existing });
    } else {
      setBookingTarget({ date: dateStr, slotId, room });
    }
  }

  async function handleBookingSuccess(code, booking) {
    const slot = TIME_SLOTS.find((s) => s.id === booking.slotId);
    setBookingTarget(null);
    setCodeData({
      code, name: booking.name,
      slot: slot ? `${slot.label} ${slot.time}` : booking.slotId,
      room: booking.room === 'large' ? '大研討室' : '小研討室',
      date: booking.date,
    });
    await loadData();
  }

  async function handleCancelSuccess() {
    setCancelTarget(null);
    await loadData();
  }

  // Build color legend for visible bookings this week
  const legendMap = {};
  Object.values(bookingMap).forEach((b) => {
    if (b.type !== 'teacher' || !b.department) return;
    if (!legendMap[b.department]) legendMap[b.department] = getBookingColor(b).bg;
  });

  return (
    <div className="space-y-3">

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-2.5 border border-slate-200">
        <button onClick={prevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 text-xl transition-colors">‹</button>
        <div className="text-center">
          <span className="text-sm font-semibold text-slate-800">{weekDays[0].format('YYYY')} 年</span>
          <span className="text-sm text-slate-500 ml-1">
            {weekDays[0].format('MM/DD')} – {weekDays[4].format('MM/DD')}
          </span>
        </div>
        <button onClick={nextWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 text-xl transition-colors">›</button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 py-16 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-slate-500 text-sm">載入中…</span>
        </div>
      )}

      {/* ── DESKTOP (md+) ───────────────────────────────────────────────── */}
      {!loading && (
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="w-[88px] px-3 py-3 text-left border-b border-r border-slate-100 bg-slate-50">
                  <span className="text-slate-400 font-normal">時段</span>
                </th>
                {weekDays.map((d, i) => {
                  const dateStr = toDateStr(d);
                  const isToday = dateStr === todayStr;
                  const blocked = isBlocked(dateStr);
                  const past = isPast(dateStr);
                  return (
                    <th key={dateStr}
                      className={`px-2 py-3 text-center border-b border-r border-slate-100 last:border-r-0 font-normal
                        ${blocked ? 'bg-red-50' : past ? 'bg-slate-100' : isToday ? 'bg-blue-50' : 'bg-slate-50'}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs font-medium
                          ${blocked ? 'text-red-400' : past ? 'text-slate-400' : isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                          週{DAY_NAMES[i]}
                        </span>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                          ${isToday && !past ? 'bg-blue-600 text-white' : past ? 'text-slate-400' : blocked ? 'text-red-400' : 'text-slate-800'}`}>
                          {d.format('D')}
                        </span>
                        <span className={`text-xs ${past ? 'text-slate-400' : blocked ? 'text-red-400' : isToday ? 'text-blue-500' : 'text-slate-400'}`}>
                          {d.format('MM/DD')}
                        </span>
                        {blocked && <span className="text-xs text-red-400 font-medium">不開放</span>}
                        {past && !blocked && <span className="text-xs text-slate-400">已過</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, si) => (
                <tr key={slot.id} className={si % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                  <td className="px-3 py-1.5 border-b border-r border-slate-100 text-center align-middle bg-slate-50">
                    <div className="font-semibold text-slate-700 text-xs whitespace-nowrap">{slot.label}</div>
                    <div className="text-slate-400 text-xs mt-0.5 whitespace-nowrap">{slot.time}</div>
                  </td>
                  {weekDays.map((d) => {
                    const dateStr = toDateStr(d);
                    const disabled = isCellDisabled(dateStr);
                    const past = isPast(dateStr);
                    const largeBooking = getBookingForCell(dateStr, slot.id, 'large');
                    const smallBooking = getBookingForCell(dateStr, slot.id, 'small');
                    return (
                      <td key={dateStr}
                        className={`border-b border-r border-slate-100 last:border-r-0 p-1 align-top
                          ${isBlocked(dateStr) ? 'bg-red-50/50' : past ? 'bg-slate-100/60' : dateStr === todayStr ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex gap-1">
                          <div className="flex-1">
                            <TimeSlotCell booking={largeBooking} room="large" disabled={disabled} past={past}
                              onClick={() => !disabled && handleCellClick(d, slot.id, 'large')} />
                          </div>
                          <div className="flex-1">
                            <TimeSlotCell booking={smallBooking} room="small" disabled={disabled} past={past}
                              onClick={() => !disabled && handleCellClick(d, slot.id, 'small')} />
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
      )}

      {/* ── MOBILE (<md) ────────────────────────────────────────────────── */}
      {!loading && (
        <div className="md:hidden space-y-2">
          <div className="grid grid-cols-5 gap-1">
            {weekDays.map((d, i) => {
              const dateStr = toDateStr(d);
              const isToday = dateStr === todayStr;
              const blocked = isBlocked(dateStr);
              const past = isPast(dateStr);
              const active = mobileDayIdx === i;
              return (
                <button key={i} onClick={() => setMobileDayIdx(i)}
                  className={`flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-colors
                    ${active ? 'bg-blue-600 text-white shadow-sm'
                      : isToday ? 'bg-blue-50 text-blue-700'
                      : past ? 'bg-slate-200 text-slate-400'
                      : blocked ? 'bg-red-50 text-red-400'
                      : 'bg-white text-slate-600 border border-slate-200'}`}>
                  <span className="text-xs opacity-80">{DAY_NAMES[i]}</span>
                  <span className="text-lg font-bold leading-tight">{d.format('D')}</span>
                  <span className="text-xs opacity-70">{d.format('MM/DD')}</span>
                </button>
              );
            })}
          </div>

          {(() => {
            const d = weekDays[mobileDayIdx];
            const dateStr = toDateStr(d);
            const blocked = isBlocked(dateStr);
            const past = isPast(dateStr);
            return (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {(blocked || past) && (
                  <div className={`text-center text-sm py-2 font-medium ${blocked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                    {blocked ? '此日期不開放預約' : '此日期已過，不可預約'}
                  </div>
                )}
                {TIME_SLOTS.map((slot, si) => {
                  const disabled = isCellDisabled(dateStr);
                  const largeBooking = getBookingForCell(dateStr, slot.id, 'large');
                  const smallBooking = getBookingForCell(dateStr, slot.id, 'small');
                  return (
                    <div key={slot.id}
                      className={`border-b border-slate-100 last:border-0 ${si % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-50">
                        <span className="text-xs font-semibold text-slate-700">{slot.label}</span>
                        <span className="text-xs text-slate-400">{slot.time}</span>
                      </div>
                      <div className="flex gap-2 px-3 py-2">
                        <div className="flex-1">
                          <TimeSlotCell booking={largeBooking} room="large" disabled={disabled} past={past} mobile
                            onClick={() => !disabled && handleCellClick(d, slot.id, 'large')} />
                        </div>
                        <div className="flex-1">
                          <TimeSlotCell booking={smallBooking} room="small" disabled={disabled} past={past} mobile
                            onClick={() => !disabled && handleCellClick(d, slot.id, 'small')} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Color legend */}
      {!loading && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
            <span className="text-xs text-slate-400 font-medium">本週科組：</span>
            {Object.entries(legendMap).map(([dept, color]) => (
              <span key={dept} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: color }} />
                {dept}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0 bg-[#d97706]" />學生
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0 bg-[#475569]" />固定預約
            </span>
            <span className="text-xs text-slate-400 ml-auto hidden sm:block">點擊格子可預約或取消</span>
          </div>
        </div>
      )}

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
