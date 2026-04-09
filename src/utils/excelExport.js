import * as XLSX from 'xlsx';
import { TIME_SLOTS } from './constants';
import { dayjs } from './dateUtils';

// Accepts pre-fetched bookings array (already filtered by caller)
export function exportBookingsToExcel(startDate, endDate, bookings) {
  if (!bookings || bookings.length === 0) return;

  const rows = bookings.map((b) => {
    const slot = TIME_SLOTS.find((s) => s.id === b.slotId);
    return {
      日期: b.date,
      星期: formatWeekday(b.date),
      時段: slot ? `${slot.label} ${slot.time}` : b.slotId,
      研討室: b.room === 'large' ? '大研討室' : '小研討室',
      類型: b.type === 'teacher' ? '老師' : '學生',
      姓名: b.name,
      科組_班級: b.type === 'teacher' ? b.department : b.class,
      用途: b.purpose || '',
      人數: b.headcount || '',
      取消碼: b.cancelCode,
      建立時間: b.createdAt,
    };
  });

  rows.sort((a, b) => a['日期'].localeCompare(b['日期']) || a['時段'].localeCompare(b['時段']));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '預約記錄');

  const colWidths = Object.keys(rows[0]).map((k) => ({ wch: Math.max(k.length * 2, 12) }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `研討室預約_${startDate || 'all'}_${endDate || 'all'}.xlsx`);
}

function formatWeekday(dateStr) {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return `週${days[dayjs(dateStr).day()]}`;
}
