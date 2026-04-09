/**
 * A single room cell inside a time-slot row.
 * Props:
 *   booking   – booking object or null
 *   room      – 'large' | 'small'
 *   blocked   – boolean: date is blocked
 *   mobile    – boolean: mobile layout
 *   onClick   – click handler
 */
export default function TimeSlotCell({ booking, room, blocked, mobile, onClick }) {
  const roomLabel = room === 'large' ? '大研討室' : '小研討室';

  if (blocked) {
    return (
      <div className={`${mobile ? 'w-full py-3' : 'w-full min-h-[44px]'} rounded bg-red-50 flex items-center justify-center`}>
        <span className="text-red-300 text-xs">—</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <button
        onClick={onClick}
        className={`${mobile ? 'w-full py-3' : 'w-full min-h-[44px]'} rounded border border-dashed border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center justify-center gap-0.5`}
      >
        <span className="text-gray-400 text-xs">{roomLabel}</span>
        <span className="text-blue-400 text-xs">+ 預約</span>
      </button>
    );
  }

  const isRecurring = booking.isRecurringInstance || booking.isRecurring;
  const bgClass = isRecurring
    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    : 'bg-green-50 border-green-300 hover:bg-green-100';

  const name = booking.name || '';
  const sub = booking.type === 'teacher' ? booking.department : booking.class;

  return (
    <button
      onClick={onClick}
      className={`${mobile ? 'w-full py-2 px-2' : 'w-full min-h-[44px] px-1 py-1'} rounded border ${bgClass} transition-colors flex flex-col items-start justify-center gap-0.5 text-left`}
    >
      <span className="text-gray-500 text-xs leading-none">{roomLabel}</span>
      <span className="text-gray-800 font-medium text-xs leading-snug truncate w-full">{name}</span>
      {sub && <span className="text-gray-500 text-xs leading-none truncate w-full">{sub}</span>}
      {isRecurring && <span className="text-blue-400 text-xs leading-none">固定</span>}
    </button>
  );
}
