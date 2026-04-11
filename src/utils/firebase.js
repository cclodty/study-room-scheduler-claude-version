import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚙️  將 Firebase Console 的設定值填入此處
// 前往：Firebase Console → 專案設定 → 您的應用程式 → SDK 設定與設定
// Firebase API Key 可以公開放在程式碼裡（這是 Google 的設計）
const FIREBASE_API_KEY    = 'PASTE_YOUR_API_KEY_HERE';
const FIREBASE_PROJECT_ID = 'PASTE_YOUR_PROJECT_ID_HERE';

export const firebaseConfigured =
  Boolean(FIREBASE_API_KEY && !FIREBASE_API_KEY.startsWith('PASTE'));

let db = null;
if (firebaseConfigured) {
  try {
    const app = initializeApp({
      apiKey:      FIREBASE_API_KEY,
      projectId:   FIREBASE_PROJECT_ID,
      authDomain:  `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    });
    db = getFirestore(app);
  } catch (err) {
    console.error('Firebase init error:', err);
  }
}

export { db };
