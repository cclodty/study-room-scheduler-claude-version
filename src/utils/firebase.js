import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const FIREBASE_API_KEY    = 'AIzaSyDSq-mS9kyr3fuOdQxyZu-1NsIGRo_c2sg';
const FIREBASE_PROJECT_ID = 'study-room-scheduler-cc-f95e9';

export const firebaseConfigured = true;

let db = null;
try {
  const app = initializeApp({
    apiKey:     FIREBASE_API_KEY,
    projectId:  FIREBASE_PROJECT_ID,
    authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
  });
  db = getFirestore(app);
} catch (err) {
  console.error('Firebase init error:', err);
}

export { db };
