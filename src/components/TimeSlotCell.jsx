import { getBookingColor } from '../utils/colorUtils';

export default function TimeSlotCell({ booking, room, blocked, mobile, onClick }) {
  const roomLabel = room === 'large' ? '大研討室' : '小研討室';
  const roomShort = room === 'large' ? '大' : '小';
  const height = mobile ? 'h-14' : 'h-12';

  // ── Blocked ─────────────────────────────────────────────────────────────
  if (blocked) {
    return (
      <div className={`w-full ${height} rounded-lg flex items-center justify-center bg-slate-50`}>
        <span className="text-slate-300 text-xs">—</span>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!booking) {
    return (
      <button onClick={onClick}
        className={`group w-full ${height} rounded-lg flex flex-col items-center justify-center gap-0.5
          border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all`}>
        <span className="text-slate-300 text-xs group-hover:text-blue-400 transition-colors font-medium">
          {roomShort}
        </span>
        <span className="text-slate-200 text-base leading-none group-hover:text-blue-400 transition-colors">+</span>
      </button>
    );
  }

  // ── Booked ───────────────────────────────────────────────────────────────
  const color = getBookingColor(booking);
  const isRecurring = booking.isRecurringInstance || booking.isRecurring;
  const subLabel = booking.type === 'teacher' ? booking.department : booking.class;

  return (
    <button onClick={onClick}
      style={{
        backgroundColor: color.bg,
        borderLeftColor: color.border,
        color: color.text,
      }}
      className={`w-full ${height} rounded-lg border-l-4 border border-transparent px-2
        flex flex-col justify-center gap-0.5 text-left hover:brightness-95 transition-all overflow-hidden`}>

      {/* Room badge */}
      <div className="flex items-center gap-1">
        <span className="text-xs leading-none font-semibold opacity-60">{roomShort}</span>
        {isRecurring && <span className="text-xs leading-none opacity-50">↻</span>}
      </div>

      {/* Name */}
      <span className="text-xs font-bold leading-snug truncate w-full">
        {booking.name}
      </span>

      {/* Department / Class */}
      {subLabel && (
        <span className="text-xs leading-none truncate w-full opacity-70">
          {subLabel}
        </span>
      )}
    </button>
  );
}
