import { getBookingColor } from '../utils/colorUtils';

/**
 * Props:
 *   booking   – booking object | null
 *   room      – 'large' | 'small'
 *   disabled  – boolean (past date or blocked)
 *   past      – boolean (past date specifically)
 *   mobile    – boolean
 *   onClick   – handler
 */
export default function TimeSlotCell({ booking, room, disabled, past, mobile, onClick }) {
  const roomLabel = room === 'large' ? '大研討室' : '小研討室';
  const height = mobile ? 'h-14' : 'h-12';

  // ── Disabled / past (no booking) ─────────────────────────────────────────
  if (disabled && !booking) {
    return (
      <div className={`w-full ${height} rounded-lg flex items-center justify-center
        ${past ? 'bg-slate-200/60' : 'bg-red-50'}`}>
        <span className={`text-xs font-medium ${past ? 'text-slate-400' : 'text-red-300'}`}>
          {roomLabel}
        </span>
      </div>
    );
  }

  // ── Empty (available) ─────────────────────────────────────────────────────
  if (!booking) {
    return (
      <button onClick={onClick}
        className={`group w-full ${height} rounded-lg flex flex-col items-center justify-center gap-0.5
          border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/70 transition-all`}>
        <span className="text-slate-400 text-xs group-hover:text-blue-500 transition-colors font-medium leading-none">
          {roomLabel}
        </span>
        <span className="text-slate-300 text-lg leading-none group-hover:text-blue-400 transition-colors">+</span>
      </button>
    );
  }

  // ── Booked ────────────────────────────────────────────────────────────────
  const color = getBookingColor(booking);
  const isRecurring = booking.isRecurringInstance || booking.isRecurring;
  // Show class for students, department for teachers
  const subLabel = booking.type === 'student' ? booking.class : booking.department;

  return (
    <button onClick={onClick}
      style={{ backgroundColor: color.bg }}
      className={`w-full ${height} rounded-lg px-2 flex flex-col justify-center gap-0.5
        text-left hover:brightness-90 active:brightness-75 transition-all overflow-hidden
        ${disabled ? 'opacity-60 cursor-default' : ''}`}>

      {isRecurring && (
        <span className="text-white/60 text-xs leading-none">↻ 固定</span>
      )}
      {/* Name — prominent */}
      <span className="text-white font-bold text-sm leading-snug truncate w-full drop-shadow-sm">
        {booking.name}
      </span>
      {/* Dept / Class */}
      {subLabel && (
        <span className="text-white/85 text-xs leading-none truncate w-full">
          {subLabel}
        </span>
      )}
    </button>
  );
}
