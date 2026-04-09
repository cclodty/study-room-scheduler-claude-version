import { supabase, supabaseConfigured } from './supabase';

// Admin password stays local (device-specific auth, not shared)
const ADMIN_PW_KEY = 'lrs_admin_password';
const DEFAULT_ADMIN_PASSWORD = 'admin1234';

function requireSupabase() {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Supabase 未設定，請檢查 VITE_SUPABASE_URL 及 VITE_SUPABASE_ANON_KEY。');
  }
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookings() {
  requireSupabase();
  const { data, error } = await supabase.from('bookings').select('*');
  if (error) { console.error('getBookings:', error); return []; }
  return data.map(dbToBooking);
}

export async function addBooking(booking) {
  requireSupabase();
  const { error } = await supabase.from('bookings').insert(bookingToDb(booking));
  if (error) throw error;
}

export async function removeBooking(id) {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw error;
}

export async function removeBookingsByIds(ids) {
  const { error } = await supabase.from('bookings').delete().in('id', ids);
  if (error) throw error;
}

export async function removeBookingsByDateRange(startDate, endDate) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) throw error;
}

// ── Recurring ─────────────────────────────────────────────────────────────────

export async function getRecurring() {
  const { data, error } = await supabase.from('recurring').select('*');
  if (error) { console.error('getRecurring:', error); return []; }
  return data.map(dbToRecurring);
}

export async function addRecurring(rule) {
  const { error } = await supabase.from('recurring').insert(recurringToDb(rule));
  if (error) throw error;
}

export async function removeRecurring(id) {
  const { error } = await supabase.from('recurring').delete().eq('id', id);
  if (error) throw error;
}

// ── Blocked dates ─────────────────────────────────────────────────────────────

export async function getBlockedDates() {
  const { data, error } = await supabase.from('blocked_dates').select('*');
  if (error) { console.error('getBlockedDates:', error); return []; }
  return data;
}

export async function addBlockedDate(entry) {
  const { error } = await supabase
    .from('blocked_dates')
    .upsert({ date: entry.date, reason: entry.reason || '' });
  if (error) throw error;
}

export async function removeBlockedDate(date) {
  const { error } = await supabase.from('blocked_dates').delete().eq('date', date);
  if (error) throw error;
}

// ── Admin password (localStorage) ────────────────────────────────────────────

export function getAdminPassword() {
  try { return JSON.parse(localStorage.getItem(ADMIN_PW_KEY)) || DEFAULT_ADMIN_PASSWORD; }
  catch { return DEFAULT_ADMIN_PASSWORD; }
}

export function setAdminPassword(pw) {
  localStorage.setItem(ADMIN_PW_KEY, JSON.stringify(pw));
}

export function verifyAdminPassword(pw) {
  return pw === getAdminPassword();
}

// ── DB ↔ JS field mapping ────────────────────────────────────────────────────

function bookingToDb(b) {
  // Do NOT send created_at — let the DB default (now()) handle it
  return {
    id: b.id, date: b.date, slot_id: b.slotId, room: b.room,
    type: b.type, name: b.name,
    department: b.department || null,
    student_class: b.class || null,   // renamed to avoid keyword ambiguity
    purpose: b.purpose || null,
    headcount: b.headcount || null,
    cancel_code: b.cancelCode,
  };
}

function dbToBooking(r) {
  return {
    id: r.id, date: r.date, slotId: r.slot_id, room: r.room,
    type: r.type, name: r.name,
    department: r.department || '',
    class: r.student_class || '',     // map back to JS field name
    purpose: r.purpose || '',
    headcount: r.headcount || 0,
    cancelCode: r.cancel_code,
    createdAt: r.created_at,
  };
}

function recurringToDb(r) {
  return {
    id: r.id, day_of_week: r.dayOfWeek, slot_id: r.slotId, room: r.room,
    type: r.type, name: r.name, department: r.department || null,
    student_class: r.class || null, purpose: r.purpose || null,
    headcount: r.headcount || null, start_date: r.startDate,
    end_date: r.endDate || null, is_recurring: true,
  };
}

function dbToRecurring(r) {
  return {
    id: r.id, dayOfWeek: r.day_of_week, slotId: r.slot_id, room: r.room,
    type: r.type, name: r.name, department: r.department || '',
    class: r.student_class || '', purpose: r.purpose || '',
    headcount: r.headcount || 0, startDate: r.start_date,
    endDate: r.end_date || null, isRecurring: true,
  };
}
