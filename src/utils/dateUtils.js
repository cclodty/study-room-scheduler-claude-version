import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

/**
 * Returns the Monday of the week containing `date`.
 */
export function getWeekStart(date) {
  return dayjs(date).isoWeekday(1);
}

/**
 * Returns an array of 5 dayjs objects (Mon–Fri) for the week of `date`.
 */
export function getWeekDays(date) {
  const mon = getWeekStart(date);
  return Array.from({ length: 5 }, (_, i) => mon.add(i, 'day'));
}

/**
 * Format: YYYY-MM-DD
 */
export function toDateStr(date) {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Format: MM-DD (週X)
 */
export function formatDayHeader(date) {
  const d = dayjs(date);
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.format('MM-DD')} (週${days[d.day()]})`;
}

/**
 * Returns ISO weekday (1=Mon … 7=Sun)
 */
export function isoWeekday(date) {
  return dayjs(date).isoWeekday();
}

export { dayjs };
