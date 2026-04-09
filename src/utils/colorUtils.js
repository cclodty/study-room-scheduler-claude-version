/**
 * Booking card colour system.
 *
 * Design rationale:
 *  - Light card background (easy to read dark text)
 *  - Bold 4px left border = department identity at a glance
 *  - High-chroma border colours spaced far apart on the hue wheel
 *    so adjacent cards never look the same
 */

// 12 hues, evenly spaced, high saturation so they differ clearly
const PALETTE = [
  { border: '#2563eb', bg: '#eff6ff', text: '#1e3a8a' }, // blue
  { border: '#dc2626', bg: '#fef2f2', text: '#7f1d1d' }, // red
  { border: '#16a34a', bg: '#f0fdf4', text: '#14532d' }, // green
  { border: '#9333ea', bg: '#faf5ff', text: '#581c87' }, // purple
  { border: '#ea580c', bg: '#fff7ed', text: '#7c2d12' }, // orange
  { border: '#0891b2', bg: '#ecfeff', text: '#164e63' }, // cyan
  { border: '#ca8a04', bg: '#fefce8', text: '#713f12' }, // yellow
  { border: '#e11d48', bg: '#fff1f2', text: '#881337' }, // rose
  { border: '#4338ca', bg: '#eef2ff', text: '#312e81' }, // indigo
  { border: '#0d9488', bg: '#f0fdfa', text: '#134e4a' }, // teal
  { border: '#7c3aed', bg: '#f5f3ff', text: '#4c1d95' }, // violet
  { border: '#15803d', bg: '#f0fdf4', text: '#14532d' }, // dark green
];

// Students → warm amber
const STUDENT_COLOR = { border: '#d97706', bg: '#fffbeb', text: '#78350f' };

// Recurring / fixed → slate (clearly "system-managed")
const RECURRING_COLOR = { border: '#475569', bg: '#f8fafc', text: '#1e293b' };

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

export function getBookingColor(booking) {
  if (booking.isRecurringInstance || booking.isRecurring) return RECURRING_COLOR;
  if (booking.type === 'student') return STUDENT_COLOR;
  const key = (booking.department || '').trim();
  if (!key) return PALETTE[0];
  return PALETTE[hashString(key) % PALETTE.length];
}

export { STUDENT_COLOR, RECURRING_COLOR };
