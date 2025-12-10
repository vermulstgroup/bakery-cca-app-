import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from './config';

export function initializeFirebase() {
  const isConfigured = getApps().length > 0;
  if (!isConfigured) {
    // throw new Error('Firebase is not configured');
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }

  const firebaseApp = getApps()[0];
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}

export * from './provider';
export * from './auth/use-user';
