import { getBookingColor } from '../utils/colorUtils';

/**
 * Google Calendar–style room cell.
 * Props:
 *   booking   – booking object or null
 *   room      – 'large' | 'small'
 *   blocked   – boolean: date is blocked
 *   mobile    – boolean: mobile layout
 *   onClick   – click handler
 */
export default function TimeSlotCell({ booking, room, blocked, mobile, onClick }) {
  const roomLabel = room === 'large' ? '大研討室' : '小研討室';
  const roomShort = room === 'large' ? '大' : '小';

  // ── Blocked ──────────────────────────────────────────────────────────────
  if (blocked) {
    return (
      <div className={`${mobile ? 'w-full h-12' : 'w-full h-11'} rounded flex items-center justify-center bg-gray-50`}>
        <span className="text-gray-300 text-xs">—</span>
      </div>
    );
  }

  // ── Empty slot ───────────────────────────────────────────────────────────
  if (!booking) {
    return (
      <button
        onClick={onClick}
        className={`group ${mobile ? 'w-full h-12' : 'w-full h-11'} rounded flex flex-col items-center justify-center gap-0.5 transition-colors hover:bg-blue-50 border border-transparent hover:border-blue-100`}
      >
        <span className="text-gray-300 text-xs group-hover:hidden leading-none">{roomShort}</span>
        <span className="hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-sm leading-none">+</span>
        <span className="hidden group-hover:block text-blue-500 text-xs leading-none">{roomShort}</span>
      </button>
    );
  }

  // ── Booked slot ──────────────────────────────────────────────────────────
  const color = getBookingColor(booking);
  const isRecurring = booking.isRecurringInstance || booking.isRecurring;
  const label = booking.type === 'teacher' ? booking.department : booking.class;

  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color.bg }}
      className={`${mobile ? 'w-full h-12 px-2' : 'w-full h-11 px-1.5'} rounded flex flex-col justify-center gap-0.5 text-left transition-opacity hover:opacity-90 overflow-hidden`}
    >
      {/* Room badge + recurring indicator */}
      <div className="flex items-center gap-1">
        <span className="text-white/70 text-xs leading-none font-medium">{roomShort}</span>
        {isRecurring && (
          <span className="text-white/60 text-xs leading-none">↻</span>
        )}
      </div>
      {/* Name */}
      <span className="text-white font-semibold text-xs leading-snug truncate w-full">
        {booking.name}
      </span>
      {/* Department / Class */}
      {label && (
        <span className="text-white/80 text-xs leading-none truncate w-full">
          {label}
        </span>
      )}
    </button>
  );
}
