// Full-colour Google-Calendar style palette.
// High-chroma, well-separated hues → each dept stands out immediately.
const PALETTE = [
  { bg: '#1a73e8', text: '#fff' }, // Google Blue
  { bg: '#d93025', text: '#fff' }, // Google Red
  { bg: '#188038', text: '#fff' }, // Google Green
  { bg: '#8430ce', text: '#fff' }, // Purple
  { bg: '#e37400', text: '#fff' }, // Orange
  { bg: '#0097a7', text: '#fff' }, // Cyan
  { bg: '#c0392b', text: '#fff' }, // Dark Red
  { bg: '#6a1b9a', text: '#fff' }, // Dark Purple
  { bg: '#00695c', text: '#fff' }, // Teal
  { bg: '#1565c0', text: '#fff' }, // Dark Blue
  { bg: '#558b2f', text: '#fff' }, // Olive Green
  { bg: '#ad1457', text: '#fff' }, // Pink
];

// Students → amber-brown (distinct from all teacher colours)
const STUDENT_COLOR = { bg: '#b45309', text: '#fff' };
// Recurring/fixed → neutral slate
const RECURRING_COLOR = { bg: '#475569', text: '#fff' };

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
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
