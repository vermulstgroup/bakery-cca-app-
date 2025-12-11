import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration for Firebase Studio environment
// The app is automatically configured in Firebase Studio
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-7015425522-94d4d',
  // In Firebase Studio, additional config is automatically provided
};

// Initialize Firebase only once
let app: FirebaseApp;
let db: Firestore;

function initFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  return { app, db };
}

// Initialize on module load
const { db: firestore } = initFirebase();

export { firestore };
export const getDb = () => firestore;
