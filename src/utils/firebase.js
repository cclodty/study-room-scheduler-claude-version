import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const firebaseConfigured = Boolean(apiKey && projectId);

let db = null;
if (firebaseConfigured) {
  const app = initializeApp({ apiKey, projectId });
  db = getFirestore(app);
}

export { db };
