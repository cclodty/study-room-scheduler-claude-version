import { useState, useCallback } from 'react';
import { dayjs, getWeekDays, toDateStr, formatDayHeader } from '../utils/dateUtils';
import { TIME_SLOTS } from '../utils/constants';
import { getBookings, getRecurring, isDateBlocked } from '../utils/storage';
import TimeSlotCell from './TimeSlotCell';
import BookingModal from './BookingModal';
import CancellationCodeModal from './CancellationCodeModal';
import CancelBookingModal from './CancelBookingModal';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [bookingTarget, setBookingTarget] = useState(null); // { date, slotId, room }
  const [codeData, setCodeData] = useState(null); // { code, name, slot, room, date }
  const [cancelTarget, setCancelTarget] = useState(null); // { date, slotId, room, booking }
  const [refreshKey, setRefreshKey] = useState(0);

  // Mobile: current day index 0-4
  const [mobileDayIdx, setMobileDayIdx] = useState(() => {
    const dow = dayjs().isoWeekday(); // 1=Mon…5=Fri
    return dow >= 1 && dow <= 5 ? dow - 1 : 0;
  });

  const weekDays = getWeekDays(currentDate);

  function prevWeek() { setCurrentDate((d) => d.subtract(7, 'day')); }
  function nextWeek() { setCurrentDate((d) => d.add(7, 'day')); }

  const weekLabel = `${weekDays[0].format('YYYY-MM-DD')} 至 ${weekDays[4].format('YYYY-MM-DD')}`;

  const bookings = getBookings();
  const recurring = getRecurring();

  // Build a lookup: `${date}_${slotId}_${room}` → booking object
  const bookingMap = {};
  bookings.forEach((b) => {
    bookingMap[`${b.date}_${b.slotId}_${b.room}`] = b;
  });
  // Overlay recurring (only if no explicit booking exists for that slot)
  recurring.forEach((r) => {
    weekDays.forEach((d) => {
      const dateStr = toDateStr(d);
      if (d.isoWeekday() !== r.dayOfWeek) return;
      if (r.startDate > dateStr) return;
      if (r.endDate && r.endDate < dateStr) return;
      const key = `${dateStr}_${r.slotId}_${r.room}`;
      if (!bookingMap[key]) {
        bookingMap[key] = { ...r, date: dateStr, isRecurringInstance: true };
      }
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
      // Allow user to request cancellation
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

  const isToday = (d) => toDateStr(d) === toDateStr(dayjs());

  return (
    <div key={refreshKey}>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3 bg-white rounded-lg shadow-sm px-4 py-2">
        <button
          onClick={prevWeek}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 text-lg"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-gray-700">{weekLabel}</span>
        <button
          onClick={nextWeek}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 text-lg"
        >
          ›
        </button>
      </div>

      {/* ── DESKTOP: weekly grid (md+) ──────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-2 py-2 text-gray-600 w-20 text-center">時段</th>
              {weekDays.map((d) => {
                const blocked = isDateBlocked(toDateStr(d));
                return (
                  <th
                    key={d.toString()}
                    className={`border border-gray-200 px-1 py-2 text-center font-medium
                      ${isToday(d) ? 'bg-amber-50 text-amber-700' : 'text-gray-700'}
                      ${blocked ? 'bg-red-50 text-red-400' : ''}
                    `}
                  >
                    {formatDayHeader(d)}
                    {blocked && <div className="text-xs text-red-400">(不開放)</div>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-2 py-1 text-center bg-gray-50">
                  <div className="font-medium text-gray-700">{slot.label}</div>
                  <div className="text-gray-400 text-xs">{slot.time}</div>
                </td>
                {weekDays.map((d) => {
                  const dateStr = toDateStr(d);
                  const blocked = isDateBlocked(dateStr);
                  const largeBooking = getBookingForCell(dateStr, slot.id, 'large');
                  const smallBooking = getBookingForCell(dateStr, slot.id, 'small');
                  return (
                    <td key={dateStr} className={`border border-gray-200 p-0.5 ${blocked ? 'bg-red-50' : ''}`}>
                      <div className="flex gap-0.5">
                        <TimeSlotCell
                          booking={largeBooking}
                          room="large"
                          blocked={blocked}
                          onClick={() => !blocked && handleCellClick(d, slot.id, 'large')}
                        />
                        <TimeSlotCell
                          booking={smallBooking}
                          room="small"
                          blocked={blocked}
                          onClick={() => !blocked && handleCellClick(d, slot.id, 'small')}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE: single-day view (< md) ──────────────────────────────── */}
      <div className="md:hidden">
        {/* Day selector tabs */}
        <div className="flex bg-white rounded-lg shadow-sm mb-2 overflow-hidden">
          {weekDays.map((d, i) => {
            const blocked = isDateBlocked(toDateStr(d));
            return (
              <button
                key={i}
                onClick={() => setMobileDayIdx(i)}
                className={`flex-1 py-2 text-center text-xs font-medium transition-colors
                  ${mobileDayIdx === i
                    ? 'bg-blue-600 text-white'
                    : isToday(d)
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-50'}
                  ${blocked ? 'line-through text-red-400' : ''}
                `}
              >
                <div>{d.format('MM/DD')}</div>
                <div>{['一','二','三','四','五'][i]}</div>
              </button>
            );
          })}
        </div>

        {/* Day column */}
        {(() => {
          const d = weekDays[mobileDayIdx];
          const dateStr = toDateStr(d);
          const blocked = isDateBlocked(dateStr);
          return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {blocked && (
                <div className="bg-red-50 text-red-500 text-center text-sm py-2">
                  此日期不開放預約
                </div>
              )}
              {TIME_SLOTS.map((slot) => {
                const largeBooking = getBookingForCell(dateStr, slot.id, 'large');
                const smallBooking = getBookingForCell(dateStr, slot.id, 'small');
                return (
                  <div key={slot.id} className="border-b border-gray-100 last:border-0">
                    <div className="bg-gray-50 px-3 py-1.5 flex items-center gap-2">
                      <span className="font-medium text-gray-700 text-sm">{slot.label}</span>
                      <span className="text-gray-400 text-xs">{slot.time}</span>
                    </div>
                    <div className="flex gap-2 px-3 py-2">
                      <div className="flex-1">
                        <TimeSlotCell
                          booking={largeBooking}
                          room="large"
                          blocked={blocked}
                          mobile
                          onClick={() => !blocked && handleCellClick(d, slot.id, 'large')}
                        />
                      </div>
                      <div className="flex-1">
                        <TimeSlotCell
                          booking={smallBooking}
                          room="small"
                          blocked={blocked}
                          mobile
                          onClick={() => !blocked && handleCellClick(d, slot.id, 'small')}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 border border-green-300 rounded inline-block" /> 已預約（點擊可取消）</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-50 border border-gray-200 rounded inline-block" /> 可預約</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-50 border border-blue-200 rounded inline-block" /> 固定預約</span>
      </div>

      {/* Modals */}
      {bookingTarget && (
        <BookingModal
          target={bookingTarget}
          onSuccess={handleBookingSuccess}
          onClose={() => setBookingTarget(null)}
        />
      )}
      {codeData && (
        <CancellationCodeModal
          data={codeData}
          onClose={() => setCodeData(null)}
        />
      )}
      {cancelTarget && (
        <CancelBookingModal
          target={cancelTarget}
          onSuccess={handleCancelSuccess}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
