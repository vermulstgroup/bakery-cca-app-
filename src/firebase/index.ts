'use client';

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This function ensures Firebase is initialized only once.
export function initializeFirebase() {
  if (getApps().length > 0) {
    const app = getApps()[0];
    return {
        firebaseApp: app,
        auth: getAuth(app),
        firestore: getFirestore(app)
    };
  }
  
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
}

export * from './provider';
export * from './auth/use-user';
export * from './client-provider';
