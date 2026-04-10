import { db, firebaseConfigured } from './firebase';
import {
  collection, doc, getDocs, setDoc, deleteDoc,
  query, where, writeBatch,
} from 'firebase/firestore';

// Admin password stays local (device-specific auth, not shared)
const ADMIN_PW_KEY = 'lrs_admin_password';
const DEFAULT_ADMIN_PASSWORD = 'admin1234';

function requireFirebase() {
  if (!firebaseConfigured || !db) {
    throw new Error('Firebase 未設定，請檢查 VITE_FIREBASE_API_KEY 及 VITE_FIREBASE_PROJECT_ID。');
  }
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookings() {
  requireFirebase();
  const snapshot = await getDocs(collection(db, 'bookings'));
  return snapshot.docs.map((d) => dbToBooking({ id: d.id, ...d.data() }));
}

export async function addBooking(booking) {
  requireFirebase();
  await setDoc(doc(db, 'bookings', booking.id), bookingToDb(booking));
}

export async function removeBooking(id) {
  await deleteDoc(doc(db, 'bookings', id));
}

export async function removeBookingsByIds(ids) {
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(doc(db, 'bookings', id)));
  await batch.commit();
}

export async function removeBookingsByDateRange(startDate, endDate) {
  const q = query(
    collection(db, 'bookings'),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ── Recurring ─────────────────────────────────────────────────────────────────

export async function getRecurring() {
  const snapshot = await getDocs(collection(db, 'recurring'));
  return snapshot.docs.map((d) => dbToRecurring({ id: d.id, ...d.data() }));
}

export async function addRecurring(rule) {
  await setDoc(doc(db, 'recurring', rule.id), recurringToDb(rule));
}

export async function removeRecurring(id) {
  await deleteDoc(doc(db, 'recurring', id));
}

// ── Blocked dates ─────────────────────────────────────────────────────────────

export async function getBlockedDates() {
  const snapshot = await getDocs(collection(db, 'blocked_dates'));
  return snapshot.docs.map((d) => ({ date: d.id, ...d.data() }));
}

export async function addBlockedDate(entry) {
  await setDoc(doc(db, 'blocked_dates', entry.date), { reason: entry.reason || '' });
}

export async function removeBlockedDate(date) {
  await deleteDoc(doc(db, 'blocked_dates', date));
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
  // id is the Firestore document ID, not stored as a field
  return {
    date: b.date, slot_id: b.slotId, room: b.room,
    type: b.type, name: b.name,
    department: b.department || null,
    student_class: b.class || null,
    purpose: b.purpose || null,
    headcount: b.headcount || null,
    cancel_code: b.cancelCode,
    created_at: b.createdAt,
  };
}

function dbToBooking(r) {
  return {
    id: r.id, date: r.date, slotId: r.slot_id, room: r.room,
    type: r.type, name: r.name,
    department: r.department || '',
    class: r.student_class || '',
    purpose: r.purpose || '',
    headcount: r.headcount || 0,
    cancelCode: r.cancel_code,
    createdAt: r.created_at,
  };
}

function recurringToDb(r) {
  return {
    day_of_week: r.dayOfWeek, slot_id: r.slotId, room: r.room,
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
