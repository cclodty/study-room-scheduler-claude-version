import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const firebaseConfigured = Boolean(apiKey && projectId);

let db = null;
if (firebaseConfigured) {
  try {
    const app = initializeApp({
      apiKey,
      projectId,
      authDomain: `${projectId}.firebaseapp.com`,
    });
    db = getFirestore(app);
  } catch (err) {
    console.error('Firebase init error:', err);
  }
}

export { db };
