const KEYS = {
  BOOKINGS: 'lrs_bookings',
  RECURRING: 'lrs_recurring',
  BLOCKED_DATES: 'lrs_blocked_dates',
  ADMIN_PASSWORD: 'lrs_admin_password',
};

const DEFAULT_ADMIN_PASSWORD = 'admin1234';

// ── Generic helpers ─────────────────────────────────────────────────────────

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export function getBookings() {
  return load(KEYS.BOOKINGS, []);
}

export function addBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  save(KEYS.BOOKINGS, bookings);
}

export function removeBooking(id) {
  const bookings = getBookings().filter((b) => b.id !== id);
  save(KEYS.BOOKINGS, bookings);
}

export function removeBookingsByIds(ids) {
  const set = new Set(ids);
  const bookings = getBookings().filter((b) => !set.has(b.id));
  save(KEYS.BOOKINGS, bookings);
}

export function removeBookingsByDateRange(startDate, endDate) {
  const bookings = getBookings().filter((b) => b.date < startDate || b.date > endDate);
  save(KEYS.BOOKINGS, bookings);
}

// ── Recurring bookings ───────────────────────────────────────────────────────

export function getRecurring() {
  return load(KEYS.RECURRING, []);
}

export function addRecurring(rule) {
  const list = getRecurring();
  list.push(rule);
  save(KEYS.RECURRING, list);
}

export function removeRecurring(id) {
  const list = getRecurring().filter((r) => r.id !== id);
  save(KEYS.RECURRING, list);
}

// ── Blocked dates ────────────────────────────────────────────────────────────

export function getBlockedDates() {
  return load(KEYS.BLOCKED_DATES, []);
}

export function addBlockedDate(entry) {
  const list = getBlockedDates();
  if (!list.find((d) => d.date === entry.date)) {
    list.push(entry);
    save(KEYS.BLOCKED_DATES, list);
  }
}

export function removeBlockedDate(date) {
  const list = getBlockedDates().filter((d) => d.date !== date);
  save(KEYS.BLOCKED_DATES, list);
}

// ── Admin password ───────────────────────────────────────────────────────────

export function getAdminPassword() {
  return load(KEYS.ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD);
}

export function setAdminPassword(pw) {
  save(KEYS.ADMIN_PASSWORD, pw);
}

export function verifyAdminPassword(pw) {
  return pw === getAdminPassword();
}

// ── Helpers for conflict check ────────────────────────────────────────────────

export function isSlotBooked(date, slotId, roomId) {
  return getBookings().some((b) => b.date === date && b.slotId === slotId && b.room === roomId);
}

export function isDateBlocked(date) {
  return getBlockedDates().some((d) => d.date === date);
}

/**
 * Returns all recurring rules that apply to a given date+slotId combination.
 */
export function getRecurringForSlot(date, slotId) {
  // dayjs not imported here to keep utils pure; caller passes dayOfWeek
  return getRecurring().filter(
    (r) => r.slotId === slotId && r.startDate <= date && (!r.endDate || r.endDate >= date),
  );
}
