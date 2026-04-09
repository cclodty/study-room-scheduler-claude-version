// Google Calendar-inspired color palette
// Each department gets a deterministic color based on its name hash
const PALETTE = [
  { bg: '#4285f4', light: '#e8f0fe' }, // Google Blue
  { bg: '#ea4335', light: '#fce8e6' }, // Google Red
  { bg: '#0f9d58', light: '#e6f4ea' }, // Google Green
  { bg: '#9334e6', light: '#f3e8fd' }, // Purple
  { bg: '#e52592', light: '#fde8f0' }, // Pink
  { bg: '#e37400', light: '#fef3e2' }, // Orange
  { bg: '#1a73e8', light: '#e8f0fe' }, // Blue 2
  { bg: '#137333', light: '#e6f4ea' }, // Dark Green
  { bg: '#b31412', light: '#fce8e6' }, // Dark Red
  { bg: '#7627bb', light: '#f3e8fd' }, // Dark Purple
  { bg: '#00897b', light: '#e0f2f1' }, // Teal
  { bg: '#c2185b', light: '#fce4ec' }, // Deep Pink
];

// Students always get a consistent warm orange
const STUDENT_COLOR = { bg: '#e37400', light: '#fef3e2' };
// Recurring/fixed bookings get a distinct slate color
const RECURRING_COLOR = { bg: '#5f6368', light: '#f1f3f4' };

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
}

export function getBookingColor(booking) {
  if (booking.isRecurringInstance || booking.isRecurring) return RECURRING_COLOR;
  if (booking.type === 'student') return STUDENT_COLOR;
  const key = (booking.department || '').trim();
  if (!key) return PALETTE[0];
  return PALETTE[hashString(key) % PALETTE.length];
}

export { STUDENT_COLOR, RECURRING_COLOR };
